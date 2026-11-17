const HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const MAX_BODY_BYTES = 8 * 1024;
const ALLOWED_CATEGORIES = new Set(["General enquiry", "Product / pilot enquiry", "Technical support", "Security", "Privacy", "Factual correction", "Other"]);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}
function clean(value, max = 1000) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}
function validEmail(value) {
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value) && value.length <= 254;
}
async function verifyTurnstile(token, ip, hostname, env) {
  if (!env.TURNSTILE_SECRET_KEY || !token) return false;
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  if (ip) body.set("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST", body, signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) return false;
  const result = await response.json();
  return result.success === true && result.hostname === hostname && result.action === "site_email";
}

export async function handleEmailApi(request, env) {
  if (!env.RESEND_API_KEY) return json({ error: "Email delivery is not configured." }, 503);
  if (!env.TURNSTILE_SECRET_KEY) return json({ error: "Abuse protection is not configured." }, 503);
  if (!env.GAAS_RESEARCH_LIMITER || typeof env.GAAS_RESEARCH_LIMITER.limit !== "function") {
    return json({ error: "Public form rate limiting is not configured." }, 503);
  }
  const origin = request.headers.get("Origin") || "";
  let hostname = "";
  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== "https:" || parsed.origin !== origin) return json({ error: "A valid HTTPS origin is required." }, 403);
    hostname = parsed.hostname;
  } catch {
    return json({ error: "A valid HTTPS origin is required." }, 403);
  }
  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (!ip) return json({ error: "Client network identity is unavailable." }, 403);
  const rate = await env.GAAS_RESEARCH_LIMITER.limit({ key: ip });
  if (!rate.success) return json({ error: "Too many enquiries. Please wait before trying again.", code: "SITE_EMAIL_RATE_LIMITED" }, 429);

  const contentType = (request.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") return json({ error: "Content-Type must be application/json." }, 415);
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BODY_BYTES) return json({ error: "Request is too large." }, 413);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json({ error: "Request is too large." }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: "Invalid JSON request." }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Invalid request structure." }, 400);

  if (clean(body.website, 200)) return json({ status: "accepted" }, 202);

  const name = clean(body.name, 120);
  const organisation = clean(body.organisation, 160);
  const email = clean(body.email, 254).toLowerCase();
  const category = clean(body.category, 60);
  const message = clean(body.message, 4000);
  const token = clean(body.turnstileToken, 4000);
  if (!name || !email || !category || !message) return json({ error: "Name, email, enquiry type and message are required." }, 400);
  if (!validEmail(email)) return json({ error: "Enter a valid email address." }, 400);
  if (!ALLOWED_CATEGORIES.has(category)) return json({ error: "Invalid enquiry type." }, 400);
  if (message.length < 10) return json({ error: "Please provide a little more detail in your message." }, 400);

  const challengeOk = await verifyTurnstile(token, ip, hostname, env);
  if (!challengeOk) return json({ error: "Security verification failed. Please complete the challenge again." }, 403);

  const recipient = clean(env.SITE_EMAIL_TO || "regtechnexusai@gmail.com", 254);
  const sender = clean(env.RESEND_FROM_EMAIL || "RegTech Nexus AI <noreply@regtechnexusai.com>", 254);
  const subject = "[Website enquiry] " + category + " — " + name;
  const text = [
    "New enquiry received through regtechnexusai.com",
    "",
    "Name: " + name,
    "Organisation: " + (organisation || "Not provided"),
    "Email: " + email,
    "Category: " + category,
    "",
    "Message:",
    message
  ].join("\n");
  const html = "<h2>New website enquiry</h2>"
    + "<p><strong>Name:</strong> " + escapeHtml(name) + "</p>"
    + "<p><strong>Organisation:</strong> " + escapeHtml(organisation || "Not provided") + "</p>"
    + "<p><strong>Reply-to:</strong> " + escapeHtml(email) + "</p>"
    + "<p><strong>Category:</strong> " + escapeHtml(category) + "</p>"
    + "<h3>Message</h3><p>" + escapeHtml(message).replace(/\n/g, "<br>") + "</p>"
    + "<hr><p>Submitted through https://regtechnexusai.com/contact.html</p>";

  let upstream;
  try {
    upstream = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "authorization": "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        from: sender, to: [recipient], reply_to: email, subject, text, html,
        tags: [
          { name: "module", value: "website" },
          { name: "category", value: category.toLowerCase().replace(/[^a-z0-9_-]/g, "-").slice(0, 40) }
        ]
      })
    });
  } catch {
    console.warn(JSON.stringify({ event: "site_email_delivery_failed", reason: "upstream_unavailable" }));
    return json({ error: "The enquiry could not be delivered right now. Please email regtechnexusai@gmail.com directly." }, 502);
  }
  const result = await upstream.json().catch(() => ({}));
  if (!upstream.ok || !result.id) {
    console.warn(JSON.stringify({
      event: "site_email_delivery_failed", status: upstream.status,
      providerRequestId: clean(upstream.headers.get("x-request-id") || "", 120)
    }));
    return json({ error: "The enquiry could not be delivered right now. Please email regtechnexusai@gmail.com directly." }, 502);
  }
  return json({ status: "sent", reference: clean(result.id, 120) }, 200);
}
