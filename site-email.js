(() => {
  const CONTACT_ADDRESS = 'info@regtechnexusai.com';
  const GREETING = 'Greetings from RegTech Nexus AI.';
  const DEFAULT_SUBJECT = 'Greetings from RegTech Nexus AI';
  const DEFAULT_BODY = [
    GREETING,
    '',
    'Thank you for your interest in RegTech Nexus AI. Please share your message below.',
    '',
    'Regards,',
    'RegTech Nexus AI',
    CONTACT_ADDRESS,
    'https://regtechnexusai.com'
  ].join('\n');

  const prepareEmail = (subject = '', body = '') => {
    const resolvedSubject = String(subject || '').trim() || DEFAULT_SUBJECT;
    const resolvedBody = String(body || '').trim();
    if (!resolvedBody) return { subject: resolvedSubject, body: DEFAULT_BODY };
    const bodyWithGreeting = /^Greetings from RegTech Nexus AI[.!]?/i.test(resolvedBody)
      ? resolvedBody
      : GREETING + '\n\n' + resolvedBody;
    return { subject: resolvedSubject, body: bodyWithGreeting };
  };

  const open = (subject = '', body = '', to = CONTACT_ADDRESS) => {
    const prepared = prepareEmail(subject, body);
    const recipient = String(to || CONTACT_ADDRESS).trim();
    const params = new URLSearchParams({
      subject: prepared.subject,
      body: prepared.body
    });
    // Use the visitor's configured mail handler; do not force a Gmail account.
    window.location.href = 'mailto:' + encodeURIComponent(recipient) + '?' + params.toString();
  };

  window.RegTechEmail = Object.freeze({
    from: CONTACT_ADDRESS,
    open
  });

  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const rawHref = link.getAttribute('href') || '';
      let subject = link.dataset.subject || '';
      let body = link.dataset.body || '';
      let to = CONTACT_ADDRESS;
      try {
        const parsed = new URL(rawHref, window.location.href);
        to = decodeURIComponent(parsed.pathname || '') || CONTACT_ADDRESS;
        subject = parsed.searchParams.get('subject') || subject;
        body = parsed.searchParams.get('body') || body;
      } catch {
        // Fall back to the configured domain contact address.
      }
      open(subject, body, to);
    });
  });
})();
