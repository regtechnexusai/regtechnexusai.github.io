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
    # Check only the AlfiQ parent frame: RegIntel is an intentional isolated iframe with its own assets.
    page.on("request", lambda req: external_requests.append(req.url) if req.frame == page.main_frame and not req.url.startswith("http://127.0.0.1:8765/") and urlparse(req.url).hostname not in {"www.googletagmanager.com", "www.google-analytics.com"} else None)
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


def test_synthetic_obligation_diff_and_audit_gate(page: Page, tmp_path: Path):
    """Regression for clause pairing, unchanged obligations, extraction and sign-off gating."""
    page.set_viewport_size({"width": 1280, "height": 900})
    response = page.goto("http://127.0.0.1:8765/alfiq/", wait_until="domcontentloaded")
    assert response and response.status == 200

    earlier = """Record retention
The institution must retain customer due diligence records and transaction records for at least five years after the business relationship ends or the transaction is completed.

Suspicious activity escalation
Employees must promptly refer potentially suspicious activity to the Compliance Officer. The Compliance Officer must document the assessment and any decision to submit a report.

Monitoring review
The institution must review its transaction monitoring scenarios at least once every twelve months and document material changes.

Staff training
Relevant employees must receive AML/CFT training at induction and refresher training at least annually."""

    revised = """Record retention
The institution must retain customer due diligence records and transaction records for at least seven years after the business relationship ends or the transaction is completed.

Suspicious activity escalation
Employees must refer potentially suspicious activity to the Compliance Officer without undue delay. The Compliance Officer must document the assessment and any decision to submit a report within two business days of escalation.

Monitoring review
The institution must review its transaction monitoring scenarios at least once every six months and document material changes, validation results and approval by the designated control owner.

Staff training
Relevant employees must receive AML/CFT training at induction and refresher training at least annually. Completion records must be retained for at least seven years."""

    page.locator("#oldText").fill(earlier)
    page.locator("#newText").fill(revised)
    page.locator("#analyse").click()
    expect(page.locator("#report")).to_be_visible(timeout=15000)
    page.wait_for_timeout(100)

    obligations = page.locator("#obligationFields").inner_text()
    assert "Compliance Officer" in obligations, obligations
    assert "within two business days" in obligations, obligations
    assert "at least seven years" in obligations, obligations
    assert "Relevant employees must receive AML/CFT training at induction and refresher training at least annually." in obligations, obligations
    assert "Removed obligation(s) requiring review" in obligations
    removed_field = obligations.split("Removed obligation(s) requiring review", 1)[1].split("Unchanged obligation(s)", 1)[0]
    assert "Staff training" not in removed_field, removed_field
    transition_field = obligations.split("Transition / implementation arrangements", 1)[1].split("Source references", 1)[0]
    assert "Not identified" in transition_field, transition_field

    # Checklist and reviewer identity alone must not permit export while clause triage is pending.
    for checkbox in page.locator(".checklist input[type=checkbox]").all():
        checkbox.check()
    page.locator("#reviewerName").fill("Synthetic Reviewer")
    page.locator("#reviewerRole").fill("Compliance Officer")
    expect(page.locator("#download")).to_be_disabled()
    expect(page.locator("#gateStatus")).to_contain_text("Changed-clause triage")
    expect(page.locator("#gateStatus")).to_contain_text("0/")
    expect(page.locator("#gateStatus")).to_contain_text("Current-input analysis: Complete")
    for select in page.locator(".clause-triage").all():
        select.select_option(label="Action Required")
    expect(page.locator("#gateStatus")).to_contain_text("Sign-off complete — export is ready.")
    expect(page.locator("#download")).to_be_enabled()
    expect(page.locator("#print")).to_be_enabled()
    expect(page.locator("#transfer-approved")).to_be_enabled()

    # Exercise all three export actions, not just their enabled/disabled state.
    with page.expect_download() as download_info:
        page.locator("#download").click()
    download = download_info.value
    assert download.suggested_filename == "alfiq-approved-review.txt"
    downloaded = tmp_path / download.suggested_filename
    download.save_as(downloaded)
    exported = downloaded.read_text(encoding="utf-8-sig")
    assert "AUDIT AND REVIEW SIGN-OFF" in exported
    assert '"applicationVersion": "0.9.0"' in exported

    page.evaluate("window.print = () => { window.__alfiqPrintCalled = true; }")
    page.locator("#print").click()
    page.wait_for_function("window.__alfiqPrintCalled === true")

    page.evaluate("""() => {
      window.__alfiqOpenedUrl = "";
      window.open = (url) => { window.__alfiqOpenedUrl = url; return null; };
    }""")
    page.locator("#transfer-approved").click()
    page.wait_for_function("window.__alfiqOpenedUrl.includes('alfiq_handoff=')")
    handoff_count = page.evaluate("""() => Object.keys(localStorage).filter(
      key => key.startsWith("regtechnexusai.alfiq.handoff.")
    ).length""")
    assert handoff_count == 1
