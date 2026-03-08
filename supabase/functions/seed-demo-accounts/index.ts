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
  const userIds: Record<string, string> = {};

  for (const account of demoAccounts) {
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === account.email);

    if (existing) {
      await supabaseAdmin
        .from("user_roles")
        .update({ role: account.role })
        .eq("user_id", existing.id);
      userIds[account.role] = existing.id;
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

    if (data.user) {
      userIds[account.role] = data.user.id;
      if (account.role !== "passenger") {
        await supabaseAdmin
          .from("user_roles")
          .update({ role: account.role })
          .eq("user_id", data.user.id);
      }
    }

    results.push({ email: account.email, status: "created", role: account.role });
  }

  // Seed routes
  const routes = [
    { route_number: "21G", route_name: "T. Nagar → Broadway", start_stop: "T. Nagar", end_stop: "Broadway", distance_km: 18.5, estimated_time_mins: 45, base_fare: 10, fare_per_km: 1.5, stops: JSON.stringify(["T. Nagar Depot", "Pondy Bazaar", "Panagal Park", "Egmore", "Central", "Broadway"]) },
    { route_number: "47A", route_name: "Central → Tambaram", start_stop: "Central", end_stop: "Tambaram", distance_km: 28, estimated_time_mins: 60, base_fare: 10, fare_per_km: 1.5, stops: JSON.stringify(["Central", "Guindy", "Saidapet", "Velachery", "Tambaram"]) },
    { route_number: "29C", route_name: "Adyar → Parrys", start_stop: "Adyar", end_stop: "Parrys", distance_km: 15, estimated_time_mins: 40, base_fare: 10, fare_per_km: 1.5, stops: JSON.stringify(["Adyar", "Mylapore", "Triplicane", "Parrys"]) },
    { route_number: "11D", route_name: "Adyar → Tambaram", start_stop: "Adyar", end_stop: "Tambaram", distance_km: 22, estimated_time_mins: 50, base_fare: 10, fare_per_km: 1.5, stops: JSON.stringify(["Adyar", "Guindy", "Velachery", "Tambaram"]) },
    { route_number: "19B", route_name: "Guindy → Central", start_stop: "Guindy", end_stop: "Central", distance_km: 12, estimated_time_mins: 35, base_fare: 10, fare_per_km: 1.5, stops: JSON.stringify(["Guindy", "Saidapet", "T. Nagar", "Egmore", "Central"]) },
  ];

  // Upsert routes
  for (const route of routes) {
    const { data: existing } = await supabaseAdmin
      .from("routes")
      .select("id")
      .eq("route_number", route.route_number)
      .maybeSingle();
    
    if (!existing) {
      await supabaseAdmin.from("routes").insert(route);
    }
  }

  // Get route IDs
  const { data: routeData } = await supabaseAdmin.from("routes").select("id, route_number");
  const routeMap: Record<string, string> = {};
  for (const r of routeData || []) {
    routeMap[r.route_number] = r.id;
  }

  // Seed buses
  const buses = [
    { bus_number: "TN-01-AB-1234", route_id: routeMap["21G"], total_seats: 40, current_occupancy: 32, status: "active", driver_id: userIds.driver || null, conductor_id: userIds.conductor || null, next_stop: "Central", last_stop: "Egmore" },
    { bus_number: "TN-01-CD-5678", route_id: routeMap["47A"], total_seats: 40, current_occupancy: 38, status: "active", next_stop: "Velachery", last_stop: "Guindy" },
    { bus_number: "TN-01-EF-9012", route_id: routeMap["29C"], total_seats: 40, current_occupancy: 12, status: "active", next_stop: "Triplicane", last_stop: "Mylapore" },
    { bus_number: "TN-01-GH-3456", route_id: routeMap["11D"], total_seats: 40, current_occupancy: 8, status: "active", next_stop: "Guindy", last_stop: "Adyar" },
    { bus_number: "TN-01-IJ-7890", route_id: routeMap["19B"], total_seats: 40, current_occupancy: 11, status: "active", next_stop: "Egmore", last_stop: "T. Nagar" },
    { bus_number: "TN-01-KL-2345", route_id: routeMap["21G"], total_seats: 40, current_occupancy: 39, status: "active", next_stop: "Panagal Park", last_stop: "Pondy Bazaar" },
  ];

  for (const bus of buses) {
    const { data: existing } = await supabaseAdmin
      .from("buses")
      .select("id")
      .eq("bus_number", bus.bus_number)
      .maybeSingle();
    
    if (!existing) {
      await supabaseAdmin.from("buses").insert(bus);
    } else {
      // Update driver/conductor assignments
      if (bus.driver_id || bus.conductor_id) {
        const updates: Record<string, any> = {};
        if (bus.driver_id) updates.driver_id = bus.driver_id;
        if (bus.conductor_id) updates.conductor_id = bus.conductor_id;
        updates.current_occupancy = bus.current_occupancy;
        updates.next_stop = bus.next_stop;
        updates.last_stop = bus.last_stop;
        await supabaseAdmin.from("buses").update(updates).eq("id", existing.id);
      }
    }
  }

  // Seed stops
  const stops = [
    { stop_name: "T. Nagar", latitude: 13.0418, longitude: 80.2341, stop_code: "TNR", zone: "South" },
    { stop_name: "Pondy Bazaar", latitude: 13.0478, longitude: 80.2370, stop_code: "PBZ", zone: "South" },
    { stop_name: "Egmore", latitude: 13.0732, longitude: 80.2609, stop_code: "EGM", zone: "Central" },
    { stop_name: "Central", latitude: 13.0827, longitude: 80.2707, stop_code: "CEN", zone: "Central" },
    { stop_name: "Broadway", latitude: 13.0878, longitude: 80.2785, stop_code: "BWY", zone: "North" },
    { stop_name: "Guindy", latitude: 13.0067, longitude: 80.2206, stop_code: "GDY", zone: "South" },
    { stop_name: "Saidapet", latitude: 13.0224, longitude: 80.2231, stop_code: "SPT", zone: "South" },
    { stop_name: "Adyar", latitude: 13.0012, longitude: 80.2565, stop_code: "ADR", zone: "South" },
    { stop_name: "Mylapore", latitude: 13.0368, longitude: 80.2676, stop_code: "MYL", zone: "South" },
    { stop_name: "Parrys", latitude: 13.0936, longitude: 80.2867, stop_code: "PRY", zone: "North" },
    { stop_name: "Velachery", latitude: 12.9815, longitude: 80.2180, stop_code: "VLY", zone: "South" },
    { stop_name: "Tambaram", latitude: 12.9249, longitude: 80.1000, stop_code: "TMB", zone: "South" },
    { stop_name: "Triplicane", latitude: 13.0590, longitude: 80.2730, stop_code: "TPC", zone: "Central" },
  ];

  for (const stop of stops) {
    const { data: existing } = await supabaseAdmin
      .from("stops")
      .select("id")
      .eq("stop_name", stop.stop_name)
      .maybeSingle();
    if (!existing) {
      await supabaseAdmin.from("stops").insert(stop);
    }
  }

  // Seed an AI routing suggestion
  const { data: existingSuggestion } = await supabaseAdmin
    .from("ai_routing_suggestions")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (!existingSuggestion) {
    await supabaseAdmin.from("ai_routing_suggestions").insert([
      {
        suggestion_type: "overcrowding",
        suggested_action: "Route T. Nagar → Broadway requires additional bus. 3 buses at 98%+ occupancy in 30 min window.",
        reason: "Multiple buses on route 21G are overcrowded during peak hours",
        priority: "high",
        route_id: routeMap["21G"] || null,
      },
      {
        suggestion_type: "reroute",
        suggested_action: "Reassign bus TN-01-GH-3456 from route 11D (20% occupancy) to route 21G",
        reason: "Route 11D is underutilized while 21G is overcrowded",
        priority: "medium",
        route_id: routeMap["11D"] || null,
      },
    ]);
  }

  // Give passenger wallet some balance
  if (userIds.passenger) {
    await supabaseAdmin
      .from("wallets")
      .update({ balance: 500 })
      .eq("user_id", userIds.passenger);
  }

  return new Response(JSON.stringify({ results, message: "Demo data seeded successfully" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
