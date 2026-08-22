import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

// Store products are managed exclusively via the Admin Panel (/admin).
const MOCK_ACCESSORIES = [];

async function seed() {
  console.log("Database reset utility ready. Only admin panel products will be preserved.");
}

seed();
