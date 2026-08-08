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
  const targetEmail = 'maheshwari.shailesh74@gmail.com';
  console.log(`Searching for auth user with email: ${targetEmail}...`);
  
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError);
    return;
  }

  const user = users.find(u => u.email === targetEmail);
  if (!user) {
    console.error(`User with email ${targetEmail} NOT found in Supabase Auth users list.`);
    console.log("Current users: ", users.map(u => u.email));
    return;
  }

  console.log(`Found User: ID = ${user.id}. Creating/updating Admin profile in database...`);
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile) {
    console.log("Profile already exists:", profile);
    console.log("Updating role to admin...");
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin", full_name: "Shailesh Maheshwari" })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
    } else {
      console.log("Profile successfully updated to 'admin'!");
    }
  } else {
    console.log("Profile does not exist. Creating admin profile...");
    const { error: insertError } = await supabase
      .from("profiles")
      .insert([
        {
          id: user.id,
          full_name: "Shailesh Maheshwari",
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
