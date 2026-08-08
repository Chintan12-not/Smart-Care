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

async function run() {
  const userId = 'cb9c7e4c-2212-4378-981e-fea8a9ea6a60';
  const email = 'chintanmaheshwari13286@gmail.com';
  const fullName = "Chintan Maheshwari";

  console.log(`Checking if profile exists for user: ${email} (${userId})...`);
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profile) {
    console.log("Profile already exists:", profile);
    console.log("Updating role to admin...");
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin", full_name: fullName })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
    } else {
      console.log("Profile role successfully updated to 'admin'!");
    }
  } else {
    console.log("Profile does not exist. Creating admin profile...");
    const { error: insertError } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          full_name: fullName,
          role: "admin",
          preferred_language: "en",
          addresses: []
        }
      ]);

    if (insertError) {
      console.error("Error creating profile:", insertError);
    } else {
      console.log("Admin profile successfully created!");
    }
  }
}

run();
