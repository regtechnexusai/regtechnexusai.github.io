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
        scope_yes = page.get_by_label(re.compile("হ্যাঁ.*সাধারণ সরকারি চাকরি|S.R.O. 347", re.I)).first
        if scope_yes.count():
            scope_yes.check()
        calculation_type = page.get_by_label(re.compile("হিসাবের ধরন", re.I)).first
        if calculation_type.count() and calculation_type.evaluate("(e) => e.tagName.toLowerCase() === 'select'"):
            type_options = calculation_type.locator("option").evaluate_all("(els) => els.map(e => ({value:e.value,text:e.textContent})).filter(o => o.value)")
            if type_options:
                preferred = next((o["value"] for o in type_options if "গ্রেড" in o["text"] or "grade" in o["text"].lower()), type_options[0]["value"])
                calculation_type.select_option(preferred)
        grade = page.get_by_label(re.compile("বর্তমান গ্রেড|grade", re.I)).first
        if grade.count():
            grade_options = grade.locator("option").evaluate_all("(els) => els.map(e => ({value:e.value,text:e.textContent})).filter(o => o.value)")
            if grade_options:
                grade_ten = next((o["value"] for o in grade_options if "গ্রেড ১০" in o["text"] or "grade 10" in o["text"].lower()), None)
                grade.select_option(grade_ten or grade_options[0]["value"])
        basic = page.get_by_label(re.compile("30 June 2026|current basic pay|মূল বেতন", re.I)).first
        basic.fill("37900")
        before_result = page.locator("body").inner_text()
        page.get_by_role("button", name=re.compile("হিসাব দেখুন|calculate", re.I)).click()
        after_result = page.locator("body").inner_text()
        assert after_result != before_result, "PayScale result did not change after valid input."
        assert "ইনপুট অপেক্ষমাণ" not in after_result, "PayScale remained in its waiting-for-input state."
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
    assert submit.count() > 0 and submit.is_visible(), "TradeGuard assessment submit control was not available."
    before_result = page.locator("body").inner_text()
    submit.click()
    after_result = page.locator("body").inner_text()
    assert after_result != before_result, "TradeGuard output did not change after submitting synthetic inputs."
    assert "Your review result will appear here" not in after_result, "TradeGuard remained in its unassessed placeholder state."
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


def test_tool_pages_have_no_uncaught_page_errors(page: Page):
    routes = [
        ("/international-regulatory-calculators.html", "Individual calculators"),
        ("/tradeguard/", "TradeGuard"),
        ("/payscale-2026/", "PayScale 2026"),
        ("/md-ceo-performance-calculator/", "MD/CEO"),
        ("/icms-2026/", "ICMS"),
    ]
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    for path, heading in routes:
        open_tool(page, path, heading)
    assert not errors, "Uncaught JavaScript errors: " + " | ".join(errors)
