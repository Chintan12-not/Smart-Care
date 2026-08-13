export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: "repair_guide" | "buying_guide" | "maintenance";
  categoryLabel: string;
  readTime: string;
  date: string;
  author: string;
  tags: string[];
}

export const ARTICLES: Article[] = [
  {
    id: "art-1",
    title: "How Much Does iPhone Screen Replacement Cost in Gurugram? (2026 Price Guide)",
    slug: "iphone-screen-replacement-cost-gurgaon",
    summary: "Complete price breakdown for iPhone 11 to iPhone 16 screen replacements in Gurugram. Learn the difference between OEM displays, glass-only repair, and AAA screens.",
    category: "repair_guide",
    categoryLabel: "Repair Guide",
    readTime: "5 min read",
    date: "July 12, 2026",
    author: "Rahul Verma, Senior Hardware Engineer",
    tags: ["iPhone Repair", "Gurugram Mobile Repair", "Screen Replacement Cost", "Apple Display"],
    content: `
      ## iPhone Display Repair Cost Factors in Gurugram
      If you drop your iPhone on the road in Gurugram, display repair costs depend heavily on whether only the top glass cracked or the underlying OLED panel malfunctioned.
      
      ## Display Repair vs Glass-Only Repair
      - **Glass-Only Replacement (₹1,500 - ₹3,500):** If touch and display display colors remain 100% functional with zero lines, only the outer Gorilla glass layer can be refurbished.
      - **Full OLED Assembly Replacement (₹3,500 - ₹12,000+):** If lines, black ink spots, or touch glitches appear, the complete OLED panel must be swapped.
      
      ## TrueTone & Face ID Compatibility
      At Smart Care Sector 37C, our technicians use TrueTone EEPROM programmers to clone your display serial data so TrueTone brightness and Face ID continue operating normally.
    `
  },
  {
    id: "art-2",
    title: "When Should You Replace Your Phone Battery? 5 Warning Signs",
    slug: "when-to-replace-phone-battery",
    summary: "Constant charging and random shutdowns degrade lithium-ion batteries. Identify the 5 signs that your smartphone battery needs immediate replacement.",
    category: "maintenance",
    categoryLabel: "Maintenance",
    readTime: "4 min read",
    date: "July 08, 2026",
    author: "Rahul Verma, Senior Hardware Engineer",
    tags: ["Battery Health", "iPhone Battery", "Samsung Battery", "Device Lifespan"],
    content: `
      ## 5 Signs Your Battery Needs Replacement
      1. **Rapid Drain Below 30%:** Your battery drops rapidly from 30% to 5% within minutes.
      2. **Battery Expansion or Bulging:** Screen lifted from the frame indicates battery swelling — replace immediately to avoid fire risks.
      3. **Overheating During Charging:** Excessive heat generated even during slow charging.
      4. **Maximum Capacity Below 80%:** iPhone battery health report dropping below 80%.
      5. **Random Shutdowns:** Phone switches off automatically under heavy camera or GPS load.
    `
  },
  {
    id: "art-3",
    title: "Why Is My Phone Charging Slowly? Causes & Easy Fixes",
    slug: "why-is-phone-charging-slowly",
    summary: "Is your fast charger taking 3+ hours to charge your phone? Learn how pocket lint in the Type-C port, cable degradation, or faulty wall adapters cause slow charging.",
    category: "repair_guide",
    categoryLabel: "Repair Guide",
    readTime: "4 min read",
    date: "July 04, 2026",
    author: "Amit Yadav, Senior Technician",
    tags: ["Charging Problem", "Type-C Port", "Fast Charging", "Phone Maintenance"],
    content: `
      ## Common Causes of Slow Charging
      - **Lint & Dust in Charging Port:** Over months, denim pocket lint gets compacted into the Type-C or Lightning port, preventing full pin contact.
      - **Internal Cable Wire Resistance:** Fractured copper strands inside charging cables reduce current delivery from 3A to 0.5A.
      - **Non-Compatible Fast Charge Protocols:** Mismatch between PD (Power Delivery) and QC (QuickCharge) standards.
    `
  },
  {
    id: "art-4",
    title: "Why Is Your Smartphone Overheating? Causes & Solutions",
    slug: "why-smartphone-overheating-causes",
    summary: "Diagnose background app load, failing lithium-ion battery chemistry, or uncertified wall adapters that cause dangerous thermal spikes on Android and iPhone.",
    category: "maintenance",
    categoryLabel: "Maintenance",
    readTime: "4 min read",
    date: "June 28, 2026",
    author: "Rahul Verma, Senior Hardware Engineer",
    tags: ["Overheating", "Device Safety", "Android Diagnostics", "iPhone Overheating"],
    content: `
      ## How Heat Harms Your Phone
      Continuous operation above 45°C permanently degrades lithium battery chemistry and causes thermal CPU throttling. Always use certified GaN wall adapters and avoid gaming while charging under direct sunlight.
    `
  },
  {
    id: "art-5",
    title: "How to Choose the Right Phone Charger: Wattage, GaN & Safety",
    slug: "how-to-choose-right-phone-charger",
    summary: "Confused between 20W, 45W, 65W GaN and PPS chargers? Here is how to select the safest fast charger for iPhone, Samsung, and OnePlus.",
    category: "buying_guide",
    categoryLabel: "Buying Guide",
    readTime: "4 min read",
    date: "June 20, 2026",
    author: "Vikram Malhotra, Tech Reviewer",
    tags: ["Fast Charger", "GaN Charger", "Type-C Cable", "Power Delivery"],
    content: `
      ## What is GaN Technology?
      Gallium Nitride (GaN) semiconductors produce significantly less heat than traditional silicon chargers, enabling smaller wall adapters with higher wattage safety ratings.
    `
  },
  {
    id: "art-6",
    title: "How to Choose the Best Tempered Glass for Curved & Flat Displays",
    slug: "how-to-choose-tempered-glass-screen-protector",
    summary: "Compare 9H tempered glass, UV glue liquid optical glass, and matte privacy protectors for curved AMOLED and flat screens.",
    category: "buying_guide",
    categoryLabel: "Buying Guide",
    readTime: "3 min read",
    date: "June 15, 2026",
    author: "Vikram Malhotra, Tech Reviewer",
    tags: ["Tempered Glass", "UV Screen Guard", "Screen Protection", "Accessories"],
    content: `
      ## Selecting Screen Protection
      - **Flat Screen Phones:** Standard 2.5D 9H Tempered Glass.
      - **Curved AMOLED Screens:** UV Liquid Optical Glue Tempered Glass for full edge adhesion.
      - **Privacy Seekers:** 28-degree Privacy Tempered Glass prevents side viewing in public.
    `
  }
];
