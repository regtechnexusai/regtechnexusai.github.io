/**
 * RegTech Nexus AI — Visitor Feedback storage endpoint
 * Deploy this script as a Google Apps Script Web App.
 * Run setupFeedbackStorage() once from the editor to authorize access and create the response sheet.
 */
const NOTIFICATION_EMAIL = 'regtechnexusai@gmail.com';
const SPREADSHEET_PROPERTY = 'REGTECH_FEEDBACK_SPREADSHEET_ID';
const MAX_SUGGESTION_LENGTH = 1500;

function setupFeedbackStorage() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty(SPREADSHEET_PROPERTY);
  let ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create('RegTech Nexus AI — Visitor Feedback Responses');
    props.setProperty(SPREADSHEET_PROPERTY, ss.getId());
  }
  let sheet = ss.getSheetByName('Responses');
  if (!sheet) sheet = ss.insertSheet('Responses');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp (UTC)', 'Visitor type', 'Visit purpose', 'Topics of interest',
      'Most useful improvement', 'Found what was needed', 'Suggestion',
      'Submitted page'
    ]);
    sheet.setFrozenRows(1);
  }
  Logger.log('Feedback spreadsheet: ' + ss.getUrl());
  return ss.getUrl();
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: 'Empty request' });
    }
    const data = JSON.parse(e.postData.contents);
    const allowedRoles = [
      'Banking / Financial Services Professional', 'Compliance / AML / Risk Professional',
      'Internal Auditor', 'Student / Researcher', 'Technology / AI Professional',
      'Regulator / Policy Professional', 'Other'
    ];
    const allowedPurposes = [
      'Regulatory research / compliance', 'Using a calculator or practical tool',
      'AML/CFT, sanctions or financial crime', 'Learning / academic study',
      'AI governance / technology research', 'Exploring professional solutions', 'Other'
    ];
    const allowedPriorities = [
      'More practical tools and calculators', 'More country-specific regulatory updates',
      'More case studies and implementation guides', 'Better navigation and search',
      'More downloadable checklists and templates', 'More educational content', 'Other'
    ];
    const allowedFound = ['Yes', 'Partly', 'No'];
    if (!allowedRoles.includes(data.visitor_role) ||
        !allowedPurposes.includes(data.visit_purpose) ||
        !allowedPriorities.includes(data.priority) ||
        !allowedFound.includes(data.found_answer)) {
      return jsonResponse({ ok: false, error: 'Invalid survey values' });
    }
    const topics = Array.isArray(data.topics) ? data.topics.slice(0, 9).map(String) : [];
    const suggestion = String(data.suggestion || '').slice(0, MAX_SUGGESTION_LENGTH);
    const page = String(data.page || '').slice(0, 500);
    const timestamp = new Date();
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    let ss;
    try {
      const id = PropertiesService.getScriptProperties().getProperty(SPREADSHEET_PROPERTY);
      if (!id) throw new Error('Run setupFeedbackStorage() before deploying.');
      ss = SpreadsheetApp.openById(id);
      const sheet = ss.getSheetByName('Responses');
      if (!sheet) throw new Error('Responses sheet is missing. Run setupFeedbackStorage().');
      sheet.appendRow([
        timestamp, data.visitor_role, data.visit_purpose, topics.join(', '),
        data.priority, data.found_answer, suggestion, page
      ]);
    } finally {
      lock.releaseLock();
    }
    const body = [
      'A new visitor feedback response has been stored in Google Sheets.',
      '',
      'Visitor type: ' + data.visitor_role,
      'Visit purpose: ' + data.visit_purpose,
      'Topics of interest: ' + (topics.join(', ') || 'Not selected'),
      'Most useful improvement: ' + data.priority,
      'Found what was needed: ' + data.found_answer,
      'Suggestion: ' + (suggestion || 'Not provided'),
      'Page: ' + page,
      'Timestamp (UTC): ' + timestamp.toISOString(),
      '',
      'Do not reply with or add confidential customer, transaction, bank or supervisory information.'
    ].join('\n');
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: 'RegTech Nexus AI — New Visitor Feedback',
      body: body
    });
    return jsonResponse({ ok: true });
  } catch (err) {
    console.error(err);
    return jsonResponse({ ok: false, error: 'Unable to store feedback' });
  }
}

function doGet() {
  return jsonResponse({ service: 'RegTech Nexus AI Visitor Feedback', status: 'ready' });
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
