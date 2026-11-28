import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};
const reply = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: cors });

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return reply(405, { error: "Method not allowed" });

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return reply(503, { error: "Invitation service is not configured" });

  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return reply(401, { error: "Authentication required" });

  const authClient = createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user || !userData.user.email) return reply(401, { error: "Invalid session" });

  let body: { email?: string; role?: string; organisation_id?: string };
  try { body = await request.json(); } catch { return reply(400, { error: "Invalid JSON body" }); }
  const email = String(body.email || "").trim().toLowerCase();
  const role = String(body.role || "viewer");
  const organisationId = String(body.organisation_id || "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return reply(400, { error: "Valid email is required" });
  if (!/^[0-9a-f-]{36}$/i.test(organisationId)) return reply(400, { error: "Valid organisation is required" });
  if (!["admin", "finance_manager", "collector", "viewer"].includes(role)) return reply(400, { error: "Unsupported role" });
  if (email === userData.user.email.toLowerCase()) return reply(400, { error: "You cannot invite your own account" });

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: membership, error: membershipError } = await admin
    .from("organisation_members").select("role")
    .eq("organisation_id", organisationId).eq("user_id", userData.user.id).maybeSingle();
  if (membershipError || !membership || !["owner", "admin"].includes(membership.role)) {
    return reply(403, { error: "Only organisation owners and admins can invite members" });
  }
  if (role === "admin" && membership.role !== "owner") return reply(403, { error: "Only an owner can invite an admin" });

  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email);
  if (inviteError) return reply(422, { error: inviteError.message });

  const { error: pendingError } = await admin.from("pending_organisation_invitations").upsert({
    organisation_id: organisationId, email, role, invited_by: userData.user.id
  }, { onConflict: "organisation_id,email" });
  if (pendingError) return reply(500, { error: "Invitation was sent but membership could not be staged. Contact support." });

  await admin.from("audit_events").insert({
    organisation_id: organisationId, actor_id: userData.user.id,
    entity_type: "membership", entity_id: organisationId,
    action: "membership.invitation_sent", metadata: { email, role }
  });
  return reply(200, { message: "Invitation email sent. Access is granted after the invitee signs in with that email." });
});
