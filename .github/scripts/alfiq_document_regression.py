"""Browser-local regression for AlfiQ PDF/DOCX intake and synchronized source panes."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from playwright.sync_api import Page, expect
from urllib.parse import urlparse
import re


def make_pdf(path: Path, text: str | None):
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    ]
    if text:
        stream = f"BT /F1 12 Tf 72 720 Td ({text}) Tj ET".encode("ascii")
    else:
        stream = b""
    objects.append(b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream")
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    out = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for number, obj in enumerate(objects, 1):
        offsets.append(len(out))
        out.extend(f"{number} 0 obj\n".encode() + obj + b"\nendobj\n")
    xref = len(out)
    out.extend(f"xref\n0 {len(objects)+1}\n".encode())
    out.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        out.extend(f"{offset:010d} 00000 n \n".encode())
    out.extend(f"trailer\n<< /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF".encode())
    path.write_bytes(out)


def make_docx(path: Path):
    document = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body><w:p><w:r><w:t>Synthetic DOCX regulatory clause</w:t></w:r></w:p>
      <w:p><w:r><w:t>Institution must retain records for seven years.</w:t></w:r></w:p>
      <w:sectPr/></w:body></w:document>"""
    content_types = """<?xml version="1.0" encoding="UTF-8"?>
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    </Types>"""
    rels = """<?xml version="1.0" encoding="UTF-8"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    </Relationships>"""
    with ZipFile(path, "w", ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", rels)
        z.writestr("word/document.xml", document)


def test_local_pdf_docx_intake_and_synchronized_panes(page: Page, tmp_path: Path):
    page.set_viewport_size({"width": 1280, "height": 900})
    errors = []
    external_requests = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("request", lambda req: external_requests.append(req.url) if not req.url.startswith("http://127.0.0.1:8765/") and urlparse(req.url).hostname not in {"www.googletagmanager.com", "www.google-analytics.com"} else None)
    response = page.goto("http://127.0.0.1:8765/alfiq/", wait_until="domcontentloaded")
    assert response and response.status == 200
    expect(page.locator("#earlierFile")).to_be_visible()
    expect(page.locator("#revisedFile")).to_be_visible()

    pdf = tmp_path / "synthetic-regulation.pdf"
    make_pdf(pdf, "Synthetic PDF regulation clause")
    page.locator("#earlierFile").set_input_files(str(pdf))
    expect(page.locator("#earlierFileStatus")).to_contain_text("PDF text", timeout=30000)
    expect(page.locator("#earlierPreview")).to_be_visible()
    expect(page.locator("#oldText")).to_have_value(re.compile("Synthetic PDF regulation clause"))

    docx = tmp_path / "synthetic-regulation.docx"
    make_docx(docx)
    page.locator("#revisedFile").set_input_files(str(docx))
    expect(page.locator("#revisedFileStatus")).to_contain_text("DOCX text", timeout=30000)
    expect(page.locator("#revisedPreview")).to_be_visible()
    expect(page.locator("#newText")).to_have_value(re.compile("Synthetic DOCX regulatory clause"))

    page.locator("#analyse").click()
    expect(page.locator("#report")).to_be_visible(timeout=15000)

    scanned = tmp_path / "scanned-only.pdf"
    make_pdf(scanned, None)
    page.locator("#earlierFile").set_input_files(str(scanned))
    expect(page.locator("#earlierFileStatus")).to_contain_text(re.compile("scanned/image-only|OCR is not included", re.I), timeout=30000)
    expect(page.locator("#oldText")).to_have_value(re.compile("Synthetic PDF regulation clause"))

    # Proportional scroll synchronisation between the two existing side-by-side panes.
    long_text = "\n\n".join("Clause %d — synthetic regulatory review text." % i for i in range(1, 100))
    page.locator("#oldText").fill(long_text)
    page.locator("#newText").fill(long_text + "\n\nAdditional revised clause.")
    page.locator("#syncScroll").check()
    page.locator("#oldText").evaluate("(el) => { el.scrollTop = el.scrollHeight * 0.55; el.dispatchEvent(new Event('scroll')); }")
    page.wait_for_timeout(150)
    positions = page.evaluate("""() => ({
      old: document.querySelector('#oldText').scrollTop / (document.querySelector('#oldText').scrollHeight - document.querySelector('#oldText').clientHeight),
      newer: document.querySelector('#newText').scrollTop / (document.querySelector('#newText').scrollHeight - document.querySelector('#newText').clientHeight)
    })""")
    assert abs(positions["old"] - positions["newer"]) < 0.08, positions
    page.locator("#syncScroll").uncheck()
    expect(page.locator("#syncStatus")).to_contain_text("off")

    assert not errors, "Browser errors: " + " | ".join(errors)
    assert not external_requests, "Unexpected third-party document-processing request: " + " | ".join(external_requests)
