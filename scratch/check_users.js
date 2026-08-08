const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
let supabaseUrl = "";
let supabaseSecret = "";

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      supabaseUrl = line.split("=")[1].trim();
    }
    if (line.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) {
      supabaseSecret = line.split("=")[1].trim();
    }
  }
}

if (!supabaseUrl || !supabaseSecret) {
  console.error("Missing env variables in .env.local:", { supabaseUrl, supabaseSecret });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecret);

async function check() {
  console.log("Checking profiles table...");
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role");

  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }

  console.log("Profiles found in database:");
  console.log(JSON.stringify(profiles, null, 2));

  // Also query Auth users if possible using auth admin api
  console.log("\nChecking auth users...");
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error("Error fetching auth users:", authError);
    return;
  }

  console.log("Auth users found in database:");
  console.log(users.map(u => ({ id: u.id, email: u.email, user_metadata: u.user_metadata })));
}

check();
