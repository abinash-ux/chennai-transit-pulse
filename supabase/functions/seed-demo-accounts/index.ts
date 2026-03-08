import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const demoAccounts = [
    { email: "passenger@demo.com", password: "123456", full_name: "Demo Passenger", role: "passenger" },
    { email: "driver@demo.com", password: "123456", full_name: "Demo Driver", role: "driver" },
    { email: "conductor@demo.com", password: "123456", full_name: "Demo Conductor", role: "conductor" },
    { email: "inspector@demo.com", password: "123456", full_name: "Demo Inspector", role: "inspector" },
    { email: "admin@demo.com", password: "123456", full_name: "Demo Admin", role: "admin" },
  ];

  const results = [];

  for (const account of demoAccounts) {
    // Try to create user
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === account.email);

    if (existing) {
      // Update role if needed
      await supabaseAdmin
        .from("user_roles")
        .update({ role: account.role })
        .eq("user_id", existing.id);
      results.push({ email: account.email, status: "already_exists", role: account.role });
      continue;
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { full_name: account.full_name },
    });

    if (error) {
      results.push({ email: account.email, status: "error", error: error.message });
      continue;
    }

    if (data.user && account.role !== "passenger") {
      // Update role from default passenger
      await supabaseAdmin
        .from("user_roles")
        .update({ role: account.role })
        .eq("user_id", data.user.id);
    }

    results.push({ email: account.email, status: "created", role: account.role });
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
