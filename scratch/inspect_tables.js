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
  const tables = ["orders", "repairs", "bookings", "appointments", "wishlist", "saved", "accessories", "profiles"];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      console.log(`Table '${table}': ERROR/MISSING (${error.message})`);
    } else {
      console.log(`Table '${table}': EXISTS!`);
    }
  }
}

run();
