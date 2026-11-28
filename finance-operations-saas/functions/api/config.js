export async function onRequestGet({ env }) {
  const supabaseUrl = env.SUPABASE_URL || "";
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || "";
  const configured = Boolean(supabaseUrl && supabaseAnonKey);
  return new Response(JSON.stringify({
    configured,
    supabaseUrl: configured ? supabaseUrl : null,
    supabaseAnonKey: configured ? supabaseAnonKey : null
  }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "x-content-type-options": "nosniff"
    }
  });
}