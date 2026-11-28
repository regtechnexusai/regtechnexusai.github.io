import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync("index.html", "utf8");
const app = readFileSync("app.js", "utf8");
const sql = readFileSync("supabase/migrations/202611280001_initial_saas_schema.sql", "utf8");
const edge = readFileSync("supabase/functions/invite-member/index.ts", "utf8");
const config = readFileSync("functions/api/config.js", "utf8");

for (const id of ["authView","appView","inviteForm","invoiceForm","invoiceRows","stats"]) {
  assert.match(html, new RegExp('id="' + id + '"'), "Missing required UI element: " + id);
}
for (const marker of ["signInWithPassword","signUp","get_my_organisation","create_my_organisation","accept_my_pending_invitations","functions.invoke","from(\"invoices\")"]) {
  assert.ok(app.includes(marker), "Missing application capability: " + marker);
}
for (const table of ["organisations","organisation_members","invoices","audit_events","pending_organisation_invitations"]) {
  assert.match(sql, new RegExp("create table public\\." + table + "\\b"), "Missing database table: " + table);
  assert.match(sql, new RegExp("alter table public\\." + table + " enable row level security"), "RLS not enabled: " + table);
}
for (const policy of ["invoices_read_member","invoices_insert_finance","invoices_update_finance","invoices_delete_admin","audit_read_admin"]) {
  assert.ok(sql.includes(policy), "Missing RLS policy: " + policy);
}
assert.ok(sql.includes("Invoice tenant and creator are immutable"), "Tenant ownership immutability guard missing");
assert.ok(sql.includes("invoice_number)"), "Organisation-scoped invoice uniqueness missing");
assert.ok(edge.includes("auth.getUser(token)") && edge.includes("SUPABASE_SERVICE_ROLE_KEY"), "Invitation endpoint must verify JWT and use server-only admin key");
assert.ok(config.includes("SUPABASE_ANON_KEY") && !config.includes("SERVICE_ROLE"), "Runtime config must expose only the public anon key");
assert.ok(!app.includes("service_role") && !html.includes("service_role"), "Server role key must never appear in browser code");
console.log("Finance Operations SaaS static validation passed.");
