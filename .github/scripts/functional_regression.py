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




def test_gaas_design_partner_preview_and_local_demo(page: Page):
    open_tool(page, "/gaas/", "Design-partner preview")

    # Validate the currently published design-partner offer, not retired plan/pricing UI.
    pilot = page.locator("#pilot")
    expect(pilot).to_be_visible()
    expect(pilot).to_contain_text("DESIGN-PARTNER PROGRAMME")
    expect(pilot.locator(".governance-grid article")).to_have_count(4)
    expect(pilot).to_contain_text("No self-service subscription or payment checkout is active")
    expect(pilot).to_contain_text("No confidential institutional data")
    expect(page.locator(".price-card")).to_have_count(0)
    expect(page.locator("#plan-modal")).to_have_count(0)

    # Exercise only the fixed local demonstration; do not invoke the staging API or an AI provider.
    page.locator("#demo-domain").select_option("outsourcing")
    page.locator("#run-demo").click()
    expect(page.locator("#demo-output")).to_contain_text("SIMULATED OUTPUT")
    expect(page.locator("#demo-output")).to_contain_text("Third-party / outsourcing risk")
    expect(page.locator("#demo-output")).to_contain_text("Human review required.")


def test_tool_pages_have_no_uncaught_page_errors(page: Page):
    routes = [
        ("/international-regulatory-calculators.html", "Individual calculators"),
        ("/tradeguard/", "TradeGuard"),
        ("/payscale-2026/", "PayScale 2026"),
        ("/md-ceo-performance-calculator/", "MD/CEO"),
        ("/icms-2026/", "ICMS"),
        ("/gaas/", "Design-partner preview"),
    ]
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    for path, heading in routes:
        open_tool(page, path, heading)
    assert not errors, "Uncaught JavaScript errors: " + " | ".join(errors)



def test_alfiq_workspace_comparison_reset_local_file_and_exports(page: Page, tmp_path):
    """Exercise AlfiQ's published rule-based prototype with synthetic text only."""
    open_tool(page, "/alfiq/", "AlfiQ")
    expect(page.locator("#oldText")).to_be_visible()
    expect(page.locator("#newText")).to_be_visible()

    page.locator("#oldText").fill(
        "The institution must retain records within 7 calendar days.\n\n"
        "The institution shall maintain an audit trail."
    )
    page.locator("#newText").fill(
        "The institution must retain records within 10 calendar days.\n\n"
        "The institution shall maintain an audit trail."
    )
    page.locator("#meta").fill("Synthetic fixture | Example regulator | Test only")
    page.locator("#analyse").click()

    expect(page.locator("#report")).to_be_visible()
    expect(page.locator("#addedN")).to_have_text("1")
    expect(page.locator("#removedN")).to_have_text("1")
    expect(page.locator("#signals")).to_contain_text("Mandatory language")
    expect(page.locator("#signals")).to_contain_text("Time-bound requirement")

    # Duplicate paragraph occurrences are compared as a multiset, not a set.
    page.locator("#oldText").fill("Paragraph A")
    page.locator("#newText").fill("Paragraph A\n\nParagraph A")
    page.locator("#analyse").click()
    expect(page.locator("#addedN")).to_have_text("1")
    expect(page.locator("#removedN")).to_have_text("0")

    # AlfiQ 0.6 deliberately gates exports behind documented human sign-off.
    expect(page.locator("#download")).to_be_disabled()
    page.locator("#reviewerName").fill("Regression Test Reviewer")
    page.locator("#reviewerRole").fill("Compliance Tester")
    for item in page.locator(".checklist input[type=checkbox]").all():
        item.check()
    expect(page.locator("#download")).to_be_enabled(timeout=10000)
    expect(page.locator("#print")).to_be_enabled(timeout=10000)

    with page.expect_download(timeout=15000) as download_info:
        page.locator("#download").click()
    download = download_info.value
    assert download.suggested_filename.endswith(".txt")
    downloaded = download.path()
    assert downloaded is not None
    report_text = Path(downloaded).read_text(encoding="utf-8")
    assert "Human review is mandatory" in report_text
    assert "Paragraph A" in report_text

    intercept_print(page)
    page.locator("#print").click()
    assert_print_called(page)

    # Local-only text intake: no server upload is used by the published flow.
    fixture = tmp_path / "alfiq-public-synthetic.txt"
    fixture.write_text("Synthetic public paragraph for local intake.", encoding="utf-8")
    page.locator("#earlierFile").set_input_files(str(fixture))
    expect(page.locator("#earlierFileStatus")).to_contain_text("Text extracted locally into its matching text field", timeout=10000)
    expect(page.locator("#oldText")).to_have_value("Synthetic public paragraph for local intake.")
    page.locator("#clearEarlierFile").click()
    expect(page.locator("#earlierFile")).to_have_value("")

    page.locator("#reset").click()
    expect(page.locator("#report")).to_be_hidden()
    expect(page.locator("#empty")).to_be_visible()
    expect(page.locator("#oldText")).to_have_value("")
    expect(page.locator("#newText")).to_have_value("")
    assert page.locator(".checklist input:checked").count() == 0


def test_alfiq_services_scope_contact_and_brand_assets(page: Page):
    """Verify the public services route, scope anchors, and both logo assets."""
    page.set_viewport_size({"width": 390, "height": 844})
    open_tool(page, "/alfiq/services/", "AlfiQ Regulatory Change Impact Review")

    expect(page.locator("#scope")).to_be_visible()
    expect(page.get_by_role("link", name=re.compile("Request a pilot discussion", re.I))).to_have_attribute(
        "href", re.compile(r"^mailto:info@regtechnexusai.com")
    )
    expect(page.locator(".alfiq-premium-footer a[href='/privacy.html']")).to_be_visible()
    expect(page.locator(".alfiq-premium-footer a[href='/terms.html']")).to_be_visible()
    expect(page.locator(".alfiq-premium-footer a[href='/alfiq/']")).to_be_visible()

    header_logo = page.locator("body > header .brand-logo")
    footer_logo = page.locator(".alfiq-premium-footer img")
    expect(header_logo).to_be_visible(timeout=15000)
    expect(footer_logo).to_be_visible()
    expect(header_logo).to_have_attribute("src", re.compile(r"/alfiq/alfiq-logo-photo2\.jpg$"))
    expect(footer_logo).to_have_attribute("src", re.compile(r"/alfiq/alfiq-logo-photo2\.jpg$"))
    assert header_logo.evaluate("(img) => img.complete && img.naturalWidth > 0"), "AlfiQ header logo did not decode."
    footer_logo.scroll_into_view_if_needed()
    page.wait_for_function(
        "() => { const img = document.querySelector('.alfiq-premium-footer img'); return img && img.complete && img.naturalWidth > 0; }",
        timeout=10000,
    )

    footer_width = footer_logo.evaluate("(img) => img.getBoundingClientRect().width")
    assert footer_width <= 190, f"Mobile footer logo exceeds the approved width: {footer_width}px"

    # Confirm the pilot scope CTA navigates to the actual scope section.
    page.get_by_role("link", name=re.compile("View pilot scope", re.I)).click()
    expect(page).to_have_url(re.compile(r"/alfiq/services/#scope$"))
    expect(page.locator("#scope")).to_be_in_viewport()



def test_gaas_case_workspace_create_export_import_and_reset(page: Page, tmp_path: Path):
    """Exercise the browser-local case register using synthetic, non-sensitive data."""
    page.set_viewport_size({"width": 390, "height": 844})
    open_tool(page, "/gaas/", "Design-partner preview")
    page.locator("#case-workspace").scroll_into_view_if_needed()

    # The mobile workspace must not introduce page-level horizontal overflow.
    page.wait_for_timeout(250)
    width = page.evaluate("({viewport: window.innerWidth, document: document.documentElement.scrollWidth})")
    assert width["document"] <= width["viewport"] + 2, (
        f"GaaS case workspace causes horizontal overflow on mobile: {width}"
    )

    page.locator("#gc-case-ref").fill("REG-TEST-001")
    page.locator("#gc-case-title").fill("Synthetic AML circular impact review")
    page.locator("#gc-jurisdiction").fill("Bangladesh")
    page.locator("#gc-owner").fill("Compliance")
    page.locator("#gc-source").fill("Synthetic test source — not a real circular")
    page.locator("#gc-gate-source").check()
    page.locator("#gc-gate-applicability").check()

    page.locator("#gc-module").select_option(label="AlfiQ")
    page.locator("#gc-finding-title").fill("Potential policy review required")
    page.locator("#gc-finding").fill("Synthetic finding for functional regression only.")
    page.locator("#gc-action-owner").fill("Compliance Testing")
    page.locator("#gc-priority").select_option("High")
    page.locator("#gc-status").select_option("Under review")
    page.locator("#gc-evidence").fill("Synthetic evidence reference")
    page.locator("#gc-add").click()

    expect(page.locator("#gc-count")).to_have_text("1 finding recorded")
    expect(page.locator("#gc-findings")).to_contain_text("Potential policy review required")
    expect(page.locator("#gc-status-message")).to_contain_text("Export JSON")

    with page.expect_download(timeout=15000) as json_info:
        page.locator("#gc-export").click()
    json_download = json_info.value
    assert json_download.suggested_filename.endswith(".json")
    json_path = tmp_path / json_download.suggested_filename
    json_download.save_as(json_path)
    payload = json_path.read_text(encoding="utf-8")
    assert '"schema": "rnx.gaas.case.v1"' in payload
    assert '"REG-TEST-001"' in payload
    assert '"sourceVerified": true' in payload

    with page.expect_download(timeout=15000) as csv_info:
        page.locator("#gc-csv").click()
    csv_download = csv_info.value
    assert csv_download.suggested_filename.endswith(".csv")
    csv_path = tmp_path / csv_download.suggested_filename
    csv_download.save_as(csv_path)
    csv_text = csv_path.read_text(encoding="utf-8-sig")
    assert "Potential policy review required" in csv_text
    assert "REG-TEST-001" in csv_text

    # Import the exported JSON back into the browser-local workspace.
    page.once("dialog", lambda dialog: dialog.accept())
    page.locator("#gc-reset").click()
    expect(page.locator("#gc-count")).to_have_text("0 findings recorded")
    page.locator("#gc-import").set_input_files(str(json_path))
    expect(page.locator("#gc-count")).to_have_text("1 finding recorded")
    expect(page.locator("#gc-case-ref")).to_have_value("REG-TEST-001")
    expect(page.locator("#gc-gate-source")).to_be_checked()
    expect(page.locator("#gc-findings")).to_contain_text("Potential policy review required")
    expect(page.locator("#gc-status-message")).to_contain_text("imported into this browser session")

    # Reset is deliberately destructive and must require confirmation.
    page.once("dialog", lambda dialog: dialog.accept())
    page.locator("#gc-reset").click()
    expect(page.locator("#gc-count")).to_have_text("0 findings recorded")
    expect(page.locator("#gc-case-ref")).to_have_value("")
    expect(page.locator("#gc-empty")).to_be_visible()


def test_usd_bdt_swap_maturity_direction_and_pv(page: Page):
    """Guard the USD/BDT maturity principal direction and independent PV outputs."""
    open_tool(page, "/derivatives/calculators/", "Cross-Currency Swap")

    # Use the published default 3-year fixture: USD 10m, spot 122, 4%/10%,
    # 90-day coupons, Actual/360 USD and Actual/365 BDT, with a 15-day stub.
    page.locator("#ccDirection").select_option("receive")
    page.locator("#ccBasis").select_option("365")
    page.locator("#ccUSDBasis").select_option("360")
    page.locator("#ccBDTBasis").select_option("365")
    page.get_by_role("button", name=re.compile("Build Cash-Flow Schedule", re.I)).click()

    result = page.locator("#ccCashResult")
    expect(result).to_contain_text("Receive USD / Pay BDT")
    expect(result).to_contain_text("USD 10,121.49")
    expect(result).to_contain_text("BDT 3,844,302.248")
    expect(result).to_contain_text("BDT 5,079,124.305")

    rows = result.locator("tbody tr")
    expect(rows).to_have_count(14)  # initial exchange + 12 full periods + final stub
    final_cells = rows.nth(13).locator("td")
    expect(final_cells.nth(0)).to_have_text("13")
    expect(final_cells.nth(1)).to_have_text("1095")
    expect(final_cells.nth(2)).to_have_text(re.compile(r"^10,016,666\.666667$"))
    expect(final_cells.nth(3)).to_have_text(re.compile(r"^-1,225,013,698\.630137$"))

    # The reverse perspective must reverse both currency legs and the net PV.
    page.locator("#ccDirection").select_option("pay")
    page.get_by_role("button", name=re.compile("Build Cash-Flow Schedule", re.I)).click()
    expect(result).to_contain_text("Pay USD / Receive BDT")
    expect(result).to_contain_text("USD -10,121.49")
    expect(result).to_contain_text("BDT -3,844,302.248")
    expect(result).to_contain_text("BDT -5,079,124.305")
    reverse_cells = result.locator("tbody tr").nth(13).locator("td")
    expect(reverse_cells.nth(2)).to_have_text(re.compile(r"^-10,016,666\.666667$"))
    expect(reverse_cells.nth(3)).to_have_text(re.compile(r"^1,225,013,698\.630137$"))



def test_mobile_shared_back_home_does_not_cover_page_content(page: Page):
    """Apply the PR's stylesheet to production pages and verify mobile positioning."""
    page.set_viewport_size({"width": 390, "height": 844})
    # The production site cannot contain unmerged branch CSS. Load the checked-out
    # PR version after each page navigation so this test validates the proposed patch.
    shell_css = Path("site-wide-shell.css").read_text(encoding="utf-8")
    routes = [
        "/privacy.html",
        "/terms.html",
        "/trust/",
        "/tool-assurance/",
    ]
    for path in routes:
        response = page.goto(f"{BASE}{path}", wait_until="domcontentloaded", timeout=60000)
        assert response is not None and response.status < 400, (
            f"{path} returned {response.status if response else 'no response'}"
        )
        page.add_style_tag(content=shell_css)
        link = page.locator("a.rt-back-home")
        expect(link).to_be_visible(timeout=15000)
        style = link.evaluate("(el) => getComputedStyle(el).position")
        assert style == "static", f"{path}: PR stylesheet leaves Back to Home {style}, expected in-flow static positioning"
        bounds = link.bounding_box()
        assert bounds is not None and bounds["width"] <= 366, (
            f"{path}: Back to Home exceeds the 390px mobile content width: {bounds}"
        )
        dimensions = page.evaluate("({viewport: innerWidth, document: document.documentElement.scrollWidth})")
        assert dimensions["document"] <= dimensions["viewport"] + 2, (
            f"{path}: horizontal overflow on mobile: {dimensions}"
        )

    # Desktop behavior must remain unchanged by the mobile-only override.
    page.set_viewport_size({"width": 1280, "height": 900})
    page.goto(f"{BASE}/privacy.html", wait_until="domcontentloaded", timeout=60000)
    page.add_style_tag(content=shell_css)
    desktop_position = page.locator("a.rt-back-home").evaluate("(el) => getComputedStyle(el).position")
    assert desktop_position == "fixed", f"Desktop Back to Home changed unexpectedly: {desktop_position}"
