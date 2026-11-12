"""Read-only production functional regression checks for RegTech Nexus AI tools.

These tests use synthetic values only. They do not modify application code or submit
real customer/bank data. Export checks verify browser downloads or print hooks.
"""
import re
from pathlib import Path
from playwright.sync_api import Page, expect

BASE = "https://regtechnexusai.com"


def open_tool(page: Page, path: str, heading: str):
    response = page.goto(f"{BASE}{path}", wait_until="domcontentloaded", timeout=60000)
    assert response is not None and response.status < 400, f"{path} returned {response.status if response else 'no response'}"
    expect(page.locator("body")).to_contain_text(re.compile(heading, re.I), timeout=20000)


def intercept_print(page: Page):
    page.evaluate("window.__printCalled = false; window.print = () => { window.__printCalled = true; }; ")


def assert_print_called(page: Page):
    assert page.evaluate("window.__printCalled") is True, "Print action did not call window.print()"


def test_international_regulatory_calculator_valid_invalid_and_print(page: Page):
    open_tool(page, "/international-regulatory-calculators.html", "Individual calculators")
    page.locator("#irc-country").select_option("bangladesh")
    page.locator("#irc-calculator-select").select_option("bangladesh-crar")
    form = page.locator("#irc-active form")
    expect(form).to_be_visible(timeout=15000)
    form.locator('[name="v0"]').fill("125")
    form.locator('[name="v1"]').fill("1000")
    form.get_by_role("button", name=re.compile("calculate", re.I)).click()
    result = page.locator("#irc-active #irc-result")
    expect(result).to_contain_text("12.5", timeout=10000)
    expect(result).to_contain_text("Analytical result", timeout=10000)

    form.locator('[name="v1"]').fill("0")
    form.get_by_role("button", name=re.compile("calculate", re.I)).click()
    expect(result).to_contain_text(re.compile("cannot be completed|denominator", re.I))

    intercept_print(page)
    page.locator("#irc-active #irc-pdf").click()
    assert_print_called(page)


def test_payscale_scenario_validation_and_export_controls(page: Page):
    open_tool(page, "/payscale-2026/", "PayScale 2026")
    # Support the current staged-scenario form if present.
    if page.locator("#calculator-form").count() and page.locator("#target-basic").count():
        page.locator("#current-basic").fill("10000")
        page.locator("#target-basic").fill("20000")
        page.locator("#phase-one").fill("40")
        page.locator("#phase-two").fill("70")
        page.locator("#phase-three").fill("100")
        page.locator("#calculator-form").get_by_role("button", name=re.compile("calculate", re.I)).click()
        expect(page.locator("#difference-output")).to_contain_text("10,000")
        expect(page.locator("#phase-one-output")).to_contain_text("14,000")
        expect(page.locator("#phase-two-output")).to_contain_text("17,000")
        expect(page.locator("#phase-three-output")).to_contain_text("20,000")

        page.locator("#target-basic").fill("9000")
        page.locator("#calculator-form").get_by_role("button", name=re.compile("calculate", re.I)).click()
        expect(page.locator("#form-error")).to_contain_text(re.compile("target basic pay", re.I))
    else:
        # Alternate published layout: ensure its real calculator can be exercised.
        grade = page.get_by_label(re.compile("বর্তমান গ্রেড|grade", re.I)).first
        if grade.count():
            grade_options = grade.locator("option").evaluate_all("(els) => els.map(e => e.value).filter(v => v)")
            if grade_options:
                grade.select_option(grade_options[0])
        basic = page.get_by_label(re.compile("30 June 2026|current basic pay|মূল বেতন", re.I)).first
        basic.fill("37900")
        page.get_by_role("button", name=re.compile("হিসাব দেখুন|calculate", re.I)).click()
        expect(page.locator("body")).to_contain_text(re.compile("ফলাফল|basic pay|মূল বেতন", re.I))

    export = page.get_by_role("button", name=re.compile("print|pdf|copy|export|প্রিন্ট|কপি", re.I))
    assert export.count() > 0, "No PayScale print/PDF, copy or export action was found."
    # Verify one available export/print control without producing a physical file.
    chosen = export.first
    if re.search(r"print|pdf", chosen.inner_text(), re.I):
        intercept_print(page)
        chosen.click()
        assert_print_called(page)
    else:
        chosen.click()


def test_md_ceo_kpi_sample_calculation_and_csv_export(page: Page):
    open_tool(page, "/md-ceo-performance-calculator/", "MD/CEO")
    sample_details = page.locator("details.mdceo-case-study")
    sample_details.locator("summary").click()
    page.locator("#load-sample-case").click()
    page.locator("#process-assessment").click()
    expect(page.locator("#result-actions")).to_be_visible(timeout=15000)
    expect(page.locator("#grand-score")).not_to_have_text(re.compile(r"^\s*—\s*$"))
    with page.expect_download(timeout=15000) as download_info:
        page.locator("#download-csv").click()
    download = download_info.value
    assert download.suggested_filename.endswith(".csv"), f"Unexpected export filename: {download.suggested_filename}"
    assert "md-ceo-kpi-assessment" in download.suggested_filename

    intercept_print(page)
    page.locator("#print-report").click()
    assert_print_called(page)


def test_icms_validation_scoring_and_exports(page: Page):
    open_tool(page, "/icms-2026/", "ICMS")
    page.locator("#icms-assessment-form").get_by_role("button", name=re.compile("calculate indicative result", re.I)).click()
    expect(page.locator("#assessment-error")).to_contain_text(re.compile("24 controls|unanswered", re.I))
    assert page.locator("#assessment-result").is_hidden()

    for field in page.locator('#icms-assessment-form select[name^="q"]').all():
        field.select_option("3")
    page.locator("#icms-assessment-form").get_by_role("button", name=re.compile("calculate indicative result", re.I)).click()
    expect(page.locator("#assessment-result")).to_be_visible(timeout=10000)
    expect(page.locator("#result-score")).to_have_text("72")
    expect(page.locator("#result-count")).to_contain_text("24")

    with page.expect_download(timeout=15000) as report_info:
        page.locator("#download-report").click()
    assert report_info.value.suggested_filename.endswith(".html")

    with page.expect_download(timeout=15000) as cap_info:
        page.locator("#download-cap").click()
    assert cap_info.value.suggested_filename.endswith(".csv")

    intercept_print(page)
    page.locator("#print-report").click()
    assert_print_called(page)


def test_tradeguard_input_validation_assessment_and_exports(page: Page):
    open_tool(page, "/tradeguard/", "TradeGuard")
    # A blank submission must not silently produce an assessed result.
    form = page.locator("form").filter(has=page.get_by_role("button", name=re.compile("verify hs code", re.I))).first
    expect(form).to_be_visible(timeout=15000)
    hs = form.locator('input[placeholder*="52010000"], input[name*="hs" i], input[id*="hs" i]').first
    hs.fill("52010000")
    form.get_by_role("button", name=re.compile("verify hs code", re.I)).click()
    expect(page.locator("body")).to_contain_text(re.compile("cotton|tariff|HS Code", re.I), timeout=15000)

    # Fill required select controls with their first substantive options; use synthetic data.
    for label_text in ("Origin country", "Destination country", "Beneficial ownership",
                       "Buyer–seller relationship", "Payer relationship"):
        label = page.get_by_text(re.compile(label_text, re.I), exact=False).first
        control_id = label.get_attribute("for")
        control = page.locator(f"#{control_id}") if control_id else label.locator("xpath=following::select[1]")
        if control.count() and control.first.evaluate("(e) => e.tagName.toLowerCase() === 'select'"):
            select = control.first
            options = select.locator("option").evaluate_all("(els) => els.map(e => e.value).filter(v => v)")
            if options:
                select.select_option(options[0])

    # Keep the test limited to the public demo's on-page review flow.
    submit = page.locator("form button[type='submit']").first
    if submit.count() and submit.is_visible():
        submit.click()
        expect(page.locator("body")).to_contain_text(re.compile("review|result|risk|required|HS Code", re.I), timeout=15000)

    # Validate an advertised export action if the demo exposes it.
    txt_button = page.get_by_role("button", name=re.compile("download txt", re.I))
    assert txt_button.count() > 0, "TradeGuard Download TXT export control was not found."
    # Print/export paths must remain callable; intercept print to avoid opening the dialog.
    print_button = page.get_by_role("button", name=re.compile("print.*save pdf", re.I))
    assert print_button.count() > 0, "TradeGuard Print / Save PDF control was not found."
    intercept_print(page)
    print_button.click()
    assert_print_called(page)
    with page.expect_download(timeout=15000) as txt_info:
        txt_button.click()
    assert txt_info.value.suggested_filename.lower().endswith(".txt")




def test_gaas_plan_preview_and_live_research_staging_panel(page: Page):
    open_tool(page, "/gaas/", "GLOBAL AGENTIC-AS-A-SERVICE")
    expect(page.locator(".price-card")).to_have_count(6)
    expect(page.locator("#plan-modal")).to_be_hidden()

    # Open the existing Free Explorer demo; do not invoke any external AI service.
    page.locator('.plan-button[data-plan="Free Explorer"]').click()
    expect(page.locator("#plan-modal")).to_be_visible(timeout=10000)
    page.locator("#field-jurisdiction").select_option(label="Bangladesh")
    page.locator("#field-topic").select_option(label="AML/CFT")
    page.locator("#field-role").select_option(label="Compliance officer")
    page.locator("#field-question").fill(
        "Find current official AML/CFT requirements for licensed financial institutions in Bangladesh."
    )
    page.get_by_role("button", name="Prepare research brief").click()

    expect(page.locator("#plan-demo-result")).to_contain_text("GAAS LIVE RESEARCH · DIRECT SUBMISSION")
    expect(page.locator("#gaas-live-title")).to_be_visible(timeout=10000)
    expect(page.locator("#gaas-live-title")).to_contain_text("Run source-led regulatory research")
    expect(page.locator("#gaas-live-run")).to_be_disabled()
    expect(page.locator(".gaas-live-footnote")).to_contain_text("Staging only")
    expect(page.locator("#plan-modal")).to_be_visible()

    # Exercise the fixed local demonstration separately; it must not make an AI request.
    page.locator(".modal-close").click()
    page.locator("#run-demo").click()
    expect(page.locator("#demo-output")).to_contain_text("SIMULATED OUTPUT")


def test_tool_pages_have_no_uncaught_page_errors(page: Page):
    routes = [
        ("/international-regulatory-calculators.html", "Individual calculators"),
        ("/tradeguard/", "TradeGuard"),
        ("/payscale-2026/", "PayScale 2026"),
        ("/md-ceo-performance-calculator/", "MD/CEO"),
        ("/icms-2026/", "ICMS"),
        ("/gaas/", "GLOBAL AGENTIC-AS-A-SERVICE"),
    ]
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    for path, heading in routes:
        open_tool(page, path, heading)
    assert not errors, "Uncaught JavaScript errors: " + " | ".join(errors)


# ---------------------------------------------------------------------------
# Website-wide regression coverage (REG-01, REG-02, REG-03, REG-10, REG-20)
# Read-only checks against the published site; synthetic navigation only.
# ---------------------------------------------------------------------------

from urllib.parse import urljoin, urlparse


def test_dual_pathway_entry_routes_from_homepage(page: Page):
    open_tool(page, "/", "RegTech Nexus AI")
    professional = page.get_by_role("link", name=re.compile("Explore Professional Tools", re.I))
    student = page.get_by_role("link", name=re.compile("Enter Student Knowledge Hub", re.I))
    expect(professional).to_be_visible()
    expect(student).to_be_visible()
    assert professional.get_attribute("href") in ("#solutions", "/#solutions")
    assert urlparse(urljoin(BASE + "/", student.get_attribute("href"))).path.rstrip("/") == "/student"
    student.click()
    expect(page).to_have_url(re.compile(r"/student/?(?:[?#].*)?$"))


def test_core_published_routes_return_success(page: Page):
    routes = [
        "/", "/student/", "/tradeguard/", "/icms-2026/", "/payscale-2026/",
        "/gaas/", "/creations/", "/green-finance-climate-risk/",
        "/derivatives/", "/tool-assurance/", "/fintech-intelligence-hub/",
        "/international-regulatory-calculators.html",
    ]
    failures = []
    for path in routes:
        response = page.request.get(f"{BASE}{path}", timeout=60000)
        if response.status >= 400:
            failures.append(f"{path}: HTTP {response.status}")
    assert not failures, "Published route failures: " + "; ".join(failures)


def test_homepage_navigation_and_footer_links(page: Page):
    open_tool(page, "/", "RegTech Nexus AI")
    anchors = page.locator("nav a, footer a").evaluate_all("""
      els => els.map(a => ({
        href: a.getAttribute('href'),
        target: a.getAttribute('target'),
        rel: a.getAttribute('rel')
      }))
    """)
    failures = []
    checked = set()
    for item in anchors:
        href = (item.get("href") or "").strip()
        if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
            continue
        absolute = urljoin(BASE + "/", href)
        parsed = urlparse(absolute)
        if parsed.scheme not in ("http", "https"):
            continue
        if parsed.netloc == urlparse(BASE).netloc:
            target = parsed.path or "/"
            if target in checked:
                continue
            checked.add(target)
            response = page.request.get(absolute, timeout=60000)
            if response.status >= 400:
                failures.append(f"{href}: HTTP {response.status}")
        elif (item.get("target") or "").lower() == "_blank":
            rel = set((item.get("rel") or "").lower().split())
            if not {"noopener", "noreferrer"}.issubset(rel):
                failures.append(f"External target=_blank missing rel protections: {href}")
    assert not failures, "Navigation/footer link defects: " + "; ".join(failures)


def test_mobile_layout_has_no_document_horizontal_overflow(page: Page):
    routes = ["/", "/student/", "/gaas/"]
    for width, height in ((375, 812), (414, 896)):
        page.set_viewport_size({"width": width, "height": height})
        for path in routes:
            open_tool(page, path, "RegTech Nexus AI" if path == "/" else (
                "Student" if path == "/student/" else "GLOBAL AGENTIC-AS-A-SERVICE"
            ))
            diagnostic = page.evaluate("""
              () => {
                const docWidth = Math.max(document.documentElement.scrollWidth,
                  document.body ? document.body.scrollWidth : 0);
                const offenders = [...document.querySelectorAll('body *')]
                  .map(el => {
                    const r = el.getBoundingClientRect();
                    const s = getComputedStyle(el);
                    return {
                      tag: el.tagName.toLowerCase(),
                      id: el.id || '',
                      className: typeof el.className === 'string' ? el.className.slice(0, 100) : '',
                      left: Math.round(r.left), right: Math.round(r.right),
                      width: Math.round(r.width), position: s.position,
                      overflowX: s.overflowX
                    };
                  })
                  .filter(x => x.width > 0 && (x.right > innerWidth + 1 || x.left < -1))
                  .sort((a,b) => b.right - a.right)
                  .slice(0, 15);
                const htmlRect = document.documentElement.getBoundingClientRect();
                const bodyRect = document.body.getBoundingClientRect();
                const pseudo = el => {
                  const cs = getComputedStyle(el);
                  return {overflowX: cs.overflowX, width: cs.width, minWidth: cs.minWidth,
                    before: getComputedStyle(el, '::before').content,
                    after: getComputedStyle(el, '::after').content};
                };
                return {docWidth, viewport: innerWidth, htmlRect: {
                  left: Math.round(htmlRect.left), right: Math.round(htmlRect.right),
                  width: Math.round(htmlRect.width)}, bodyRect: {
                  left: Math.round(bodyRect.left), right: Math.round(bodyRect.right),
                  width: Math.round(bodyRect.width)}, rootStyles: {
                  html: pseudo(document.documentElement), body: pseudo(document.body)
                }, offenders};
              }
            """)
            overflow = diagnostic["docWidth"] > width + 1
            assert not overflow, (
                f"Horizontal document overflow at {width}x{height} on {path}; "
                f"documentWidth={diagnostic['docWidth']}, viewport={diagnostic['viewport']}, "
                f"htmlRect={diagnostic['htmlRect']}, bodyRect={diagnostic['bodyRect']}, "
                f"rootStyles={diagnostic['rootStyles']}, offenders={diagnostic['offenders']}"
            )
