/*
 * Retirement-benefit rules from the Finance Division retirement-benefit
 * notification dated 17 September 2026. Keep this file as the single source
 * of truth for the retirement module and update it if an official corrigendum
 * changes a table.
 */

const RETIREMENT_RULES = Object.freeze({
  sourceTitle: 'সরকারি কর্মচারীগণের অবসরকালীন সুবিধাদি/প্রাপ্যতা নির্ধারণ/পুনর্নির্ধারণ',
  sourceUrl: 'https://www.dpp.gov.bd/upload_file/gazettes/62983_75061.pdf',
  effectiveDate: '১ জুলাই ২০২৬',
  rateTableStatus: 'transcribed-review-required',
  rateTableVerificationNote: '৫–২৫ বছরের intermediate gross-pension rates, including ২৩ বছর = ৮১%, are transcribed for review support and must be checked against the rendered official Gazette table and the authorised pension office record before reliance.',
  maximumLeaveMonths: 18,
  grossPensionRates: Object.freeze({
    5: 21, 6: 24, 7: 27, 8: 30, 9: 33,
    10: 36, 11: 39, 12: 42, 13: 45, 14: 51,
    15: 54, 16: 57, 17: 60, 18: 63, 19: 66,
    20: 72, 21: 75, 22: 78, 23: 81, 24: 87, 25: 90
  }),
  gratuityBands: Object.freeze([
    Object.freeze({ min: 5, max: 9, rate: 265, label: '৫–৯ বছর' }),
    Object.freeze({ min: 10, max: 14, rate: 260, label: '১০–১৪ বছর' }),
    Object.freeze({ min: 15, max: 19, rate: 245, label: '১৫–১৯ বছর' }),
    Object.freeze({ min: 20, max: 25, rate: 230, label: '২০ বছর বা তদূর্ধ্ব' })
  ]),
  netPensionBands: Object.freeze([
    Object.freeze({ max: 9000, rate: 100, minimum: 10000, maximum: 18000, label: 'সর্বনিম্ন–৳৯,০০০' }),
    Object.freeze({ min: 9001, max: 20000, rate: 75, minimum: 18001, maximum: 35000, label: '৳৯,০০১–৳২০,০০০' }),
    Object.freeze({ min: 20001, max: 30000, rate: 65, minimum: 35001, maximum: 49000, label: '৳২০,০০১–৳৩০,০০০' }),
    Object.freeze({ min: 30001, max: 40000, rate: 60, minimum: 49001, maximum: 62000, label: '৳৩০,০০১–৳৪০,০০০' }),
    Object.freeze({ min: 40001, rate: 55, minimum: 62001, maximum: 70200, label: '৳৪০,০০১ ও তদূর্ধ্ব' })
  ])
});

if (typeof module !== 'undefined' && module.exports) module.exports = RETIREMENT_RULES;
