/*
 * Standalone pension and retirement-benefits review page. Version 1.30.
 * The salary calculator links here but does not combine salary and pension
 * results. Retirement rules live in retirement-data.js as the single source.
 */

const bnDigits = '০১২৩৪৫৬৭৮৯';
const enDigits = '0123456789';
const toBn = (value) => String(value).replace(/[0-9]/g, (digit) => bnDigits[digit]);
const parseMoney = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return NaN;
  const normalized = raw
    .replace(/[০-৯]/g, (digit) => enDigits[bnDigits.indexOf(digit)])
    .replace(/[৳,\s]/g, '');
  const number = Number(normalized);
  return Number.isInteger(number) ? number : NaN;
};
const money = (value) => '৳ ' + Math.max(0, Math.round(value)).toLocaleString('en-IN').replace(/[0-9]/g, (digit) => bnDigits[digit]);
const numberBn = (value) => Math.max(0, Math.round(value)).toLocaleString('en-IN').replace(/[0-9]/g, (digit) => bnDigits[digit]);

const retirementForm = document.querySelector('#retirement-form');
const retirementBasic = document.querySelector('#retirement-basic');
const retirementPhase = document.querySelector('#retirement-phase');
const retirementService = document.querySelector('#retirement-service-years');
const retirementLeaveMonths = document.querySelector('#retirement-leave-months');
const retirementNetPension = document.querySelector('#retirement-net-pension');
const retirementCommutation = document.querySelector('#retirement-commutation');
const retirementNetCard = document.querySelector('#retirement-net-card');
const retirementNetPlaceholder = document.querySelector('#retirement-net-placeholder');
const validationBox = document.querySelector('#retirement-validation');
const copyButton = document.querySelector('#copy-pension-result');
const toast = document.querySelector('#pension-toast');
const liveSummary = document.querySelector('#retirement-live-summary');
const salaryPhaseBasics = {};

function auditTimestamp() {
  return new Date().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' });
}

function selectedLabel(select) {
  return select?.selectedOptions?.[0]?.textContent?.trim() || '';
}

function updateAuditSummary(basic, serviceYears, leaveMonths, phaseValue = '', currentNet = NaN, commutationPercent = 50, generated = false) {
  setText('retirement-audit-basic', Number.isFinite(basic) && basic > 0 ? 'মূল বেতন: ' + money(basic) : 'মূল বেতন: —');
  setText('retirement-audit-phase', phaseValue ? 'অবসরের পর্যায়: ' + selectedLabel(retirementPhase) : 'অবসরের পর্যায়: —');
  setText('retirement-audit-service', Number.isFinite(serviceYears) && serviceYears >= 5
    ? 'পেনশনযোগ্য চাকরিকাল: ' + (retirementService?.selectedOptions?.[0]?.textContent || '')
    : 'পেনশনযোগ্য চাকরিকাল: —');
  setText('retirement-audit-leave', Number.isFinite(leaveMonths) && leaveMonths >= 0
    ? 'ছুটি নগদায়ন: ' + (retirementLeaveMonths?.selectedOptions?.[0]?.textContent || '')
    : 'ছুটি নগদায়ন: —');
  setText('retirement-audit-net', Number.isFinite(currentNet) && currentNet > 0
    ? 'বর্তমান net pension: ' + money(currentNet)
    : 'বর্তমান net pension: দেওয়া হয়নি');
  setText('retirement-audit-commutation', 'সমর্পণ: ' + toBn(commutationPercent) + '% ধরে');
  setText('retirement-audit-source', 'সূত্র: Finance Division retirement-benefit Gazette · ১৭ সেপ্টেম্বর ২০২৬ · official PDF');
  setText('retirement-audit-version', 'Version ' + (window.PAYSCALE_META?.version || '1.30'));
  setText('retirement-audit-generated', generated ? 'হিসাবের সময়: ' + auditTimestamp() : 'হিসাবের সময়: —');
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function gratuityRate(serviceYears) {
  return RETIREMENT_RULES.gratuityBands.find((band) => serviceYears >= band.min && serviceYears <= band.max)?.rate || null;
}

function netBand(currentNet) {
  return RETIREMENT_RULES.netPensionBands.find((band) => currentNet >= (band.min || 0) && currentNet <= (band.max || Infinity)) || null;
}

function clearOutput() {
  [
    'retirement-rate', 'retirement-gross-pension', 'retirement-pensionable',
    'retirement-gratuity-rate', 'retirement-gratuity', 'retirement-leave-encashment',
    'retirement-total-lump-sum', 'retirement-net-band', 'retirement-net-rate',
    'retirement-net-result'
  ].forEach((id) => setText(id, '—'));
  setText('retirement-pensionable-note', 'সমর্পণের পর অবশিষ্ট মাসিক pension');
  setText('retirement-net-note', 'বর্তমান net pension লিখলে সংশ্লিষ্ট band অনুযায়ী একটি সীমাবদ্ধ review estimate দেখা যাবে।');
  if (retirementNetCard) retirementNetCard.hidden = true;
  if (retirementNetPlaceholder) retirementNetPlaceholder.hidden = false;
  if (validationBox) {
    validationBox.textContent = '';
    validationBox.hidden = true;
  }
  if (liveSummary) liveSummary.textContent = '';
  updateAuditSummary(NaN, NaN, NaN, '', NaN, Number(retirementCommutation?.value || 50), false);
}

function renderReferenceTables() {
  const serviceBody = document.querySelector('#retirement-service-table-body');
  const gratuityBody = document.querySelector('#retirement-gratuity-table-body');
  const netBody = document.querySelector('#retirement-net-table-body');
  if (!serviceBody || !gratuityBody || !netBody) return;
  serviceBody.innerHTML = Object.entries(RETIREMENT_RULES.grossPensionRates)
    .map(([years, rate]) => '<tr><td>' + (years === '25' ? '২৫ বছর ও তদূর্ধ্ব' : toBn(years) + ' বছর') + '</td><td>' + toBn(rate) + '%</td></tr>')
    .join('');
  gratuityBody.innerHTML = RETIREMENT_RULES.gratuityBands
    .map((band) => '<tr><td>' + band.label + '</td><td>' + toBn(band.rate) + '</td></tr>')
    .join('');
  netBody.innerHTML = RETIREMENT_RULES.netPensionBands
    .map((band) => '<tr><td>' + band.label + '</td><td>' + toBn(band.rate) + '%</td><td>' + money(band.minimum) + '</td><td>' + money(band.maximum) + '</td></tr>')
    .join('');
}

function renderRetirementBenefits() {
  const basic = parseMoney(retirementBasic?.value);
  const phaseValue = retirementPhase?.value || '';
  const serviceValue = retirementService?.value || '';
  const leaveValue = retirementLeaveMonths?.value || '';
  const serviceYears = serviceValue === '' ? NaN : Number(serviceValue);
  const leaveMonths = leaveValue === '' ? NaN : Number(leaveValue);
  const currentNet = parseMoney(retirementNetPension?.value);
  const commutationPercent = Number(retirementCommutation?.value || 50);
  const linkedPhase = ['phase1', 'phase2', 'phase3'].includes(phaseValue);
  const linkedBasicAvailable = Number.isFinite(salaryPhaseBasics[phaseValue]);

  if (!Number.isFinite(basic) || basic <= 0) {
    clearOutput();
    return;
  }
  if (phaseValue === '') {
    clearOutput();
    updateAuditSummary(basic, serviceYears, leaveMonths, phaseValue, currentNet, commutationPercent, false);
    if (validationBox) {
      validationBox.textContent = 'হিসাব দেখতে অবসরের সময়/প্রযোজ্য basic-এর পর্যায় নির্বাচন করুন।';
      validationBox.hidden = false;
    }
    return;
  }
  if (linkedPhase && !linkedBasicAvailable) {
    clearOutput();
    updateAuditSummary(basic, serviceYears, leaveMonths, phaseValue, currentNet, commutationPercent, false);
    if (validationBox) {
      validationBox.textContent = 'এই পর্যায়ের basic নিশ্চিত করতে Salary page-এর result link ব্যবহার করুন। Standalone input হলে “নিজে যাচাইকৃত last drawn basic” নির্বাচন করুন।';
      validationBox.hidden = false;
    }
    return;
  }
  if (serviceValue === '' || leaveValue === '') {
    clearOutput();
    updateAuditSummary(basic, serviceYears, leaveMonths, phaseValue, currentNet, commutationPercent, false);
    if (validationBox) {
      validationBox.textContent = 'হিসাব দেখতে পেনশনযোগ্য চাকরিকাল এবং ছুটি নগদায়নের মাস নির্বাচন করুন। সর্বোচ্চ সুবিধা ধরে কোনো default result দেখানো হচ্ছে না।';
      validationBox.hidden = false;
    }
    return;
  }
  if (!Number.isFinite(serviceYears) || serviceYears < 5 || serviceYears > 25) {
    clearOutput();
    if (validationBox) {
      validationBox.textContent = 'পেনশনযোগ্য চাকরিকাল ৫ বছর থেকে ২৫ বছর বা তদূর্ধ্ব হতে হবে।';
      validationBox.hidden = false;
    }
    return;
  }

  const grossRate = RETIREMENT_RULES.grossPensionRates[Math.min(25, serviceYears)];
  const grossPension = Math.round(basic * grossRate / 100);
  const surrenderedPension = Math.round(grossPension * commutationPercent / 100);
  const pensionablePortion = grossPension - surrenderedPension;
  const gratuityRateValue = gratuityRate(serviceYears);
  const gratuity = surrenderedPension * gratuityRateValue;
  const encashmentMonths = Math.min(RETIREMENT_RULES.maximumLeaveMonths, Math.max(0, leaveMonths));
  const leaveEncashment = basic * encashmentMonths;
  const lumpSum = gratuity + leaveEncashment;

  setText('retirement-rate', toBn(grossRate) + '%');
  setText('retirement-gross-pension', money(grossPension));
  setText('retirement-pensionable', money(pensionablePortion));
  setText('retirement-pensionable-note', toBn(commutationPercent) + '% সমর্পণের পর অবশিষ্ট মাসিক pension');
  setText('retirement-gratuity-rate', toBn(gratuityRateValue) + ' টাকা / ১ টাকা · ' + toBn(commutationPercent) + '% সমর্পিত pension');
  setText('retirement-gratuity', money(gratuity));
  setText('retirement-leave-encashment', money(leaveEncashment));
  setText('retirement-total-lump-sum', money(lumpSum));
  setText('retirement-basic-note', selectedLabel(retirementPhase) + ' অনুযায়ী প্রযোজ্য basic ব্যবহার করা হয়েছে। গ্রস pension rate: ' + toBn(grossRate) + '%; ' + toBn(commutationPercent) + '% সমর্পণের পর অবশিষ্ট মাসিক pension দেখানো হয়েছে। সমর্পিত অংশ whole taka-য় round করে অবশিষ্ট অংশ gross pension থেকে বাদ দেওয়া হয়েছে। ' + (encashmentMonths === 18 ? 'পূর্ণ ১৮ মাসের অনুমোদিত leave balance আছে ধরে হিসাব করা হয়েছে। ' : '') + 'চিকিৎসা ভাতা, কর্তন ও অফিসিয়াল PPO এতে নেই।');
  updateAuditSummary(basic, serviceYears, leaveMonths, phaseValue, currentNet, commutationPercent, true);
  if (validationBox) validationBox.hidden = true;

  const band = Number.isFinite(currentNet) && currentNet > 0 ? netBand(currentNet) : null;
  if (!band) {
    if (retirementNetCard) retirementNetCard.hidden = true;
    if (retirementNetPlaceholder) retirementNetPlaceholder.hidden = false;
    setText('retirement-net-band', '—');
    setText('retirement-net-rate', '—');
    setText('retirement-net-result', '—');
    setText('retirement-net-note', 'বর্তমান net pension লিখলে সংশ্লিষ্ট band অনুযায়ী একটি সীমাবদ্ধ review estimate দেখা যাবে।');
    if (liveSummary) {
      liveSummary.textContent = 'পেনশন হিসাব সম্পন্ন। গ্রস pension ' + money(grossPension) + ', আনুতোষিক ' + money(gratuity) + ', এবং ছুটি নগদায়ন ' + money(leaveEncashment) + '।';
    }
    return;
  }
  if (retirementNetCard) retirementNetCard.hidden = false;
  if (retirementNetPlaceholder) retirementNetPlaceholder.hidden = true;
  const adjustedNet = Math.min(band.maximum, Math.max(band.minimum, Math.round(currentNet * (1 + band.rate / 100))));
  setText('retirement-net-band', band.label);
  setText('retirement-net-rate', toBn(band.rate) + '%');
  setText('retirement-net-result', money(adjustedNet));
  setText('retirement-net-note', 'সীমা: ' + money(band.minimum) + ' – ' + money(band.maximum) + '; এটি net pension-এর review estimate, final pension order নয়।');
  if (liveSummary) {
    liveSummary.textContent = 'পেনশন হিসাব সম্পন্ন। গ্রস pension ' + money(grossPension) + ', আনুতোষিক ' + money(gratuity) + ', এবং ছুটি নগদায়ন ' + money(leaveEncashment) + '।';
  }
}

function prefillFromSalaryPage() {
  const params = new URLSearchParams(window.location.search);
  const basic = parseMoney(params.get('basic'));
  const grade = params.get('grade');
  ['phase1', 'phase2', 'phase3'].forEach((phase) => {
    const value = parseMoney(params.get(phase));
    if (Number.isFinite(value) && value > 0) salaryPhaseBasics[phase] = value;
  });
  if (!Number.isFinite(basic) || basic <= 0 || !retirementBasic) return;
  const prefilledPhase = Number.isFinite(salaryPhaseBasics.phase3) ? 'phase3' : 'custom';
  if (retirementPhase) retirementPhase.value = prefilledPhase;
  retirementBasic.value = numberBn(salaryPhaseBasics[prefilledPhase] || basic);
  updateBasicInputState();
  setText('retirement-basic-note', prefilledPhase === 'phase3'
    ? 'PayScale 2026-এর গ্রেড ' + toBn(grade || '') + ' result থেকে ১ জুলাই ২০২৭-এর full basic prefill করা হয়েছে; অবসরের সময় অনুযায়ী পর্যায় পরিবর্তন করুন।'
    : 'PayScale 2026-এর গ্রেড ' + toBn(grade || '') + ' result থেকে basic pay prefill করা হয়েছে; অবসরের পর্যায় নির্বাচন করে প্রয়োজন হলে পরিবর্তন করুন।');
}

function applyPhaseBasic() {
  const phaseValue = retirementPhase?.value || '';
  const phaseBasic = salaryPhaseBasics[phaseValue];
  updateBasicInputState();
  if (Number.isFinite(phaseBasic) && retirementBasic) {
    retirementBasic.value = numberBn(phaseBasic);
    setText('retirement-basic-note', selectedLabel(retirementPhase) + ' অনুযায়ী PayScale result-এর basic prefill করা হয়েছে। পরিবর্তন করতে “নিজে যাচাইকৃত last drawn basic” নির্বাচন করুন।');
  } else if (phaseValue === 'custom') {
    setText('retirement-basic-note', 'Official service record অনুযায়ী last drawn basic লিখুন।');
  }
}

function updateBasicInputState() {
  if (!retirementBasic) return;
  const phaseValue = retirementPhase?.value || '';
  const linked = ['phase1', 'phase2', 'phase3'].includes(phaseValue) && Number.isFinite(salaryPhaseBasics[phaseValue]);
  retirementBasic.readOnly = linked;
  retirementBasic.setAttribute('aria-readonly', String(linked));
}

async function copyPensionResult() {
  const basic = parseMoney(retirementBasic?.value);
  if (!Number.isFinite(basic) || basic <= 0 || document.querySelector('#retirement-total-lump-sum')?.textContent === '—') {
    if (validationBox) {
      validationBox.textContent = 'কপি করার আগে অবসর সুবিধার জন্য প্রযোজ্য basic pay দিন।';
      validationBox.hidden = false;
    }
    return;
  }
  const text = [
    'পেনশন ও অবসর সুবিধার হিসাব',
    'অবসর সুবিধার জন্য প্রযোজ্য মূল বেতন: ' + money(basic),
    'অবসরের পর্যায়: ' + selectedLabel(retirementPhase),
    'পেনশনযোগ্য চাকরিকাল: ' + (retirementService?.selectedOptions?.[0]?.textContent || ''),
    'ছুটি নগদায়ন: ' + (retirementLeaveMonths?.selectedOptions?.[0]?.textContent || ''),
    'বর্তমান net pension: ' + (Number.isFinite(parseMoney(retirementNetPension?.value)) ? money(parseMoney(retirementNetPension.value)) : 'দেওয়া হয়নি'),
    'গ্রস pension rate: ' + document.querySelector('#retirement-rate').textContent,
    'গ্রস pension: ' + document.querySelector('#retirement-gross-pension').textContent,
    'সমর্পণের পর মাসিক pension: ' + document.querySelector('#retirement-pensionable').textContent,
    'আনুতোষিক: ' + document.querySelector('#retirement-gratuity').textContent,
    'ছুটি নগদায়ন: ' + document.querySelector('#retirement-leave-encashment').textContent,
    'আনুতোষিক + ছুটি নগদায়ন: ' + document.querySelector('#retirement-total-lump-sum').textContent,
    'আনুমানিক নতুন net pension: ' + (document.querySelector('#retirement-net-card')?.hidden ? 'প্রযোজ্য নয় — input দেওয়া হয়নি' : document.querySelector('#retirement-net-result').textContent),
    'সমর্পণ: ' + (retirementCommutation?.selectedOptions?.[0]?.textContent || '৫০% সমর্পণ'),
    'সূত্র: Finance Division retirement-benefit Gazette · ১৭ সেপ্টেম্বর ২০২৬ · Official Gazette PDF: ' + (window.RETIREMENT_RULES?.sourceUrl || 'https://www.dpp.gov.bd/upload_file/gazettes/62983_75061.pdf'),
    'Rate-table note: ২৩ বছর/৮১%সহ intermediate rates are transcribed review-support figures; authorised record দিয়ে verify করুন।',
    'Rounding note: সমর্পিত pension whole taka-য় round; অবশিষ্ট = gross pension − rounded surrendered pension।',
    'Version: ' + (window.PAYSCALE_META?.version || '1.30'),
    document.querySelector('#retirement-audit-generated')?.textContent || ('হিসাবের সময়: ' + auditTimestamp()),
    'এটি review-support estimate; official pension sanction/PPO নয়।'
  ].join('\n');
  try {
    await navigator.clipboard.writeText(text);
    if (!toast) return;
    toast.hidden = false;
    toast.classList.add('show');
    window.setTimeout(() => {
      toast.classList.remove('show');
      toast.hidden = true;
    }, 1800);
  } catch {
    if (!validationBox) return;
    validationBox.textContent = 'কপি করা সম্ভব হয়নি; ফলাফলটি ম্যানুয়ালি কপি করুন।';
    validationBox.hidden = false;
  }
}

renderReferenceTables();
prefillFromSalaryPage();
renderRetirementBenefits();

retirementForm?.addEventListener('input', renderRetirementBenefits);
retirementForm?.addEventListener('change', (event) => {
  if (event.target === retirementPhase) applyPhaseBasic();
  renderRetirementBenefits();
});
retirementBasic?.addEventListener('blur', () => {
  const parsed = parseMoney(retirementBasic.value);
  if (Number.isFinite(parsed)) retirementBasic.value = numberBn(parsed);
});
copyButton?.addEventListener('click', copyPensionResult);
document.querySelector('#print-pension-result')?.addEventListener('click', async () => {
  if (document.querySelector('#retirement-total-lump-sum')?.textContent === '—') return;
  if (document.fonts?.ready) await document.fonts.ready;
  window.print();
});
