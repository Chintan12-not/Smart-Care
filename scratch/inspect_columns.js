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

const supabase = createClient(supabaseUrl, supabaseSecret);

async function run() {
  console.log("Inspecting 'orders' columns...");
  const { data: orders, error: oError } = await supabase.from("orders").select("*").limit(1);
  if (oError) {
    console.error("Orders error:", oError);
  } else {
    console.log("Orders sample row:", JSON.stringify(orders[0] || {}, null, 2));
  }

  console.log("\nInspecting 'repairs' columns...");
  const { data: repairs, error: rError } = await supabase.from("repairs").select("*").limit(1);
  if (rError) {
    console.error("Repairs error:", rError);
  } else {
    console.log("Repairs sample row:", JSON.stringify(repairs[0] || {}, null, 2));
  }
}

run();
