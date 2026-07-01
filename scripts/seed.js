import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

const MOCK_ACCESSORIES = [
  {
    name: "UltraCharge 30W Dual Port Fast Charger",
    category: "Chargers",
    brand: "Anker",
    price: 1499,
    rating_avg: 4.8,
    reviews_count: 142,
    images: ["/placeholder_acc.png"],
    specifications: {
      "Output Wattage": "30W Max",
      "Ports": "1 x USB-C, 1 x USB-A",
      "Technology": "PowerIQ 3.0, GaN tech",
      "Warranty": "18 Months"
    },
    description: "Compact wall charger with GaN technology to charge smartphones and tablets at maximum speed safely."
  },
  {
    name: "DuraThread Type-C to Type-C Braided Cable (2m)",
    category: "Cables",
    brand: "boAt",
    price: 499,
    rating_avg: 4.6,
    reviews_count: 84,
    images: ["/placeholder_acc.png"],
    specifications: {
      "Length": "2 Meters (6.6 ft)",
      "Material": "Double-Braided Nylon",
      "Data Transfer Rate": "480 Mbps",
      "Power Delivery": "Up to 60W"
    },
    description: "Extra long, rugged charging cable tested to withstand 10,000+ bends. Supports power delivery fast charging."
  },
  {
    name: "ArmorGlass Tempered Glass Screen Protector",
    category: "Tempered Glass",
    brand: "Spigen",
    price: 799,
    rating_avg: 4.7,
    reviews_count: 210,
    images: ["/placeholder_acc.png"],
    specifications: {
      "Hardness": "9H Tempered Glass",
      "Coating": "Oleophobic anti-fingerprint",
      "Thickness": "0.33mm",
      "Clarity": "99.9% HD Clear"
    },
    description: "Case-friendly premium tempered glass protector with alignment frame. Maximum impact absorption and scratch resistance."
  },
  {
    name: "AeroShield Clear Case with MagSafe",
    category: "Cases",
    brand: "SmartCare Elite",
    price: 1199,
    rating_avg: 4.5,
    reviews_count: 65,
    images: ["/placeholder_acc.png"],
    specifications: {
      "Material": "TPU + Polycarbonate",
      "MagSafe Compatibility": "Yes (Built-in N52 Magnets)",
      "Drop Protection": "Up to 8 Feet (Military Grade)",
      "Anti-Yellowing": "UV-resistant coating"
    },
    description: "Slim, transparent hybrid case that showcases your phone's color while offering strong magnetic connection and shockproof bumpers."
  },
  {
    name: "BassBuds Pro Active Noise Cancelling Earbuds",
    category: "Earbuds",
    brand: "Realme",
    price: 2999,
    rating_avg: 4.4,
    reviews_count: 198,
    images: ["/placeholder_acc.png"],
    specifications: {
      "Noise Cancellation": "Up to 42dB Active Noise Cancellation",
      "Battery Life": "Up to 30 Hours (With case)",
      "Water Resistance": "IPX5 Sweatproof",
      "Bluetooth Version": "5.3"
    },
    description: "Wireless earbuds with deep bass, high-fidelity sound quality, and active background noise cancellation for crystal clear calls."
  },
  {
    name: "PowerVolt 20000mAh Power Bank (22.5W)",
    category: "Power Banks",
    brand: "Mi",
    price: 1999,
    rating_avg: 4.7,
    reviews_count: 312,
    images: ["/placeholder_acc.png"],
    specifications: {
      "Capacity": "20000mAh 74Wh",
      "Max Power Output": "22.5W Fast Charge",
      "Input Ports": "Type-C, Micro-USB",
      "Output Ports": "2 x USB-A, 1 x Type-C"
    },
    description: "High-capacity external battery pack with triple port output, supporting fast charging for iPhones, Samsung, and OnePlus devices."
  },
  {
    name: "Samsung Galaxy S25 Magnetic MagSafe Case",
    category: "Cases",
    brand: "Generic",
    price: 199,
    rating_avg: 4.6,
    reviews_count: 42,
    images: ["/s25_case.jpg", "/s25_case_back.jpg", "/s25_case_side.jpg"],
    specifications: {
      "Compatible Model": "Samsung Galaxy S25",
      "Color": "Grey/Black",
      "Material": "Polycarbonate, TPU, PET",
      "Special Feature": "Built-in Magnetic MagSafe Ring"
    },
    description: "Sleek and transparent back cover designed for Samsung Galaxy S25, featuring elevated camera lens protectors and a robust magnetic core."
  }
];

async function seed() {
  console.log("Seeding products into Supabase accessories table...");
  
  // Clear existing items
  const { error: deleteError } = await supabase
    .from("accessories")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // deletes all rows
    
  if (deleteError) {
    console.error("Error clearing accessories table:", deleteError);
  }

  // Insert mock data
  const { data, error } = await supabase
    .from("accessories")
    .insert(MOCK_ACCESSORIES)
    .select();

  if (error) {
    console.error("Error seeding accessories:", error);
    process.exit(1);
  }

  console.log(`Successfully seeded ${data.length} products!`);
}

seed();
