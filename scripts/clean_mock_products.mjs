import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env.local manually
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, "utf8");
  envText.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const parts = trimmed.split("=");
      const key = parts[0]?.trim();
      const val = parts.slice(1).join("=").trim();
      if (key && val) {
        process.env[key] = val;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const mockNames = [
  "UltraCharge 30W Dual Port Fast Charger",
  "DuraThread Type-C to Type-C Braided Cable (2m)",
  "ArmorGlass Tempered Glass Screen Protector",
  "AeroShield Clear Case with MagSafe",
  "BassBuds Pro Active Noise Cancelling Earbuds",
  "PowerVolt 20000mAh Power Bank (22.5W)",
  "Ultra-Fast 65W GaN Charger"
];

async function cleanMockProducts() {
  console.log("Cleaning mock products from Supabase accessories table...");

  for (const name of mockNames) {
    const { data, error } = await supabase
      .from("accessories")
      .delete()
      .eq("name", name)
      .select();

    if (error) {
      console.error(`Error deleting ${name}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`Deleted ${data.length} mock item(s): ${name}`);
    }
  }

  // Also query items with images set to /placeholder_acc.png or mock ids
  const { data: allItems, error: selectErr } = await supabase.from("accessories").select("*");
  if (!selectErr && allItems) {
    for (const item of allItems) {
      if (
        (item.images && item.images.includes("/placeholder_acc.png")) ||
        item.image === "/placeholder_acc.png" ||
        String(item.id).startsWith("acc-10")
      ) {
        const { error: delErr } = await supabase.from("accessories").delete().eq("id", item.id);
        if (!delErr) {
          console.log(`Deleted mock item ID ${item.id}: ${item.name}`);
        }
      }
    }
  }

  console.log("Mock cleanup script finished.");
}

cleanMockProducts();
