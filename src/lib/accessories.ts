export interface AccessoryProduct {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  inStock?: boolean;
  isOnSale?: boolean;
  rating: number;
  reviewsCount: number;
  image: string;
  images?: string[];
  specifications: Record<string, string>;
  description: string;
}

// Default Fallback Accessory Products for Smart Care & Mobile Point Store
export const MOCK_ACCESSORIES: AccessoryProduct[] = [
  {
    id: "acc-1",
    name: "Ultra Clarity MagSafe Transparent Case",
    category: "Cases",
    brand: "Apple",
    price: 499,
    originalPrice: 999,
    inStock: true,
    isOnSale: true,
    rating: 4.9,
    reviewsCount: 42,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Material": "Bayer TPU + High-Grade Polycarbonate",
      "Compatibility": "iPhone 15 / 14 / 13 Series",
      "Features": "MagSafe Magnet Array, Anti-Yellowing Coating, 8ft Drop Protection"
    },
    description: "Crystal clear protective case with built-in magnetic ring for seamless MagSafe wireless charging and high impact drop protection."
  },
  {
    id: "acc-2",
    name: "65W GaN Dual Type-C Super Fast Wall Charger",
    category: "Chargers",
    brand: "Samsung",
    price: 1299,
    originalPrice: 2499,
    inStock: true,
    isOnSale: true,
    rating: 4.8,
    reviewsCount: 38,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Output": "65W Max GaN Fast Charge",
      "Ports": "2x USB Type-C, 1x USB-A",
      "Fast Charge Protocol": "PD 3.0, PPS, QuickCharge 4.0"
    },
    description: "Ultra-compact 65W Gallium Nitride (GaN) fast charger capable of charging laptops, iPhones, Samsung Galaxy S24, and OnePlus devices simultaneously."
  },
  {
    id: "acc-3",
    name: "9H Hardness Curved Edge Tempered Glass Screen Protector",
    category: "Tempered Glass",
    brand: "Generic",
    price: 299,
    originalPrice: 599,
    inStock: true,
    isOnSale: false,
    rating: 4.7,
    reviewsCount: 65,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Hardness": "9H Tempered Glass",
      "Coverage": "Full Screen Edge-to-Edge",
      "Features": "Oleophobic Anti-Fingerprint Coating, Shatterproof"
    },
    description: "Premium 9H tempered glass screen protector with HD optical clarity and oleophobic coating to prevent fingerprints and scratches."
  },
  {
    id: "acc-4",
    name: "100W Heavy Duty Braided Type-C to Type-C Fast Charging Cable (2m)",
    category: "Cables",
    brand: "OnePlus",
    price: 399,
    originalPrice: 799,
    inStock: true,
    isOnSale: true,
    rating: 4.9,
    reviewsCount: 51,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Length": "2 Meters / 6.5ft",
      "Power": "100W PD 5A High Current",
      "Data Transfer": "480 Mbps High Speed"
    },
    description: "High-density nylon braided Type-C to Type-C charging cable with E-marker chip supporting up to 100W Power Delivery."
  },
  {
    id: "acc-5",
    name: "20000mAh 22.5W Fast Charge Power Bank with LED Display",
    category: "Power Banks",
    brand: "Xiaomi",
    price: 1699,
    originalPrice: 2999,
    inStock: true,
    isOnSale: true,
    rating: 4.8,
    reviewsCount: 29,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Capacity": "20,000 mAh",
      "Output": "22.5W Max Fast Output",
      "Inputs": "Type-C & Micro-USB"
    },
    description: "High-capacity 20,000mAh power bank with dual USB output ports, Type-C bidirectional fast charging, and digital battery percentage indicator."
  },
  {
    id: "acc-6",
    name: "Active Noise Cancelling Wireless TWS Earbuds",
    category: "Earbuds",
    brand: "Realme",
    price: 1999,
    originalPrice: 3999,
    inStock: true,
    isOnSale: true,
    rating: 4.7,
    reviewsCount: 44,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Driver": "12.4mm Dynamic Bass Driver",
      "ANC": "30dB Active Noise Cancellation",
      "Battery": "38 Hours Total Playtime"
    },
    description: "True wireless stereo earbuds with active noise cancellation, low latency gaming mode, and IPX5 water resistance."
  },
  {
    id: "acc-7",
    name: "Military Grade Drop-Tested Armor Case with Kickstand",
    category: "Cases",
    brand: "Samsung",
    price: 599,
    originalPrice: 1199,
    inStock: true,
    isOnSale: false,
    rating: 4.9,
    reviewsCount: 33,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Protection": "MIL-STD-810G Drop Tested",
      "Features": "Built-in Foldable Ring Kickstand, Magnetic Car Mount Compatible"
    },
    description: "Heavy duty protective armor case featuring dual-layer TPU shock absorption and an integrated kickstand for hands-free viewing."
  },
  {
    id: "acc-8",
    name: "20W USB-C PD Fast Power Adapter",
    category: "Chargers",
    brand: "Apple",
    price: 899,
    originalPrice: 1900,
    inStock: true,
    isOnSale: true,
    rating: 4.9,
    reviewsCount: 78,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Power": "20W Power Delivery",
      "Compatibility": "iPhone 15/14/13/12, iPad",
      "Safety": "Over-heat & Short Circuit Protection"
    },
    description: "Compact 20W USB-C wall charger designed to fast charge iPhone models from 0% to 50% in just 30 minutes."
  },
  {
    id: "acc-9",
    name: "Matte Anti-Glare Privacy Tempered Glass",
    category: "Tempered Glass",
    brand: "Generic",
    price: 349,
    originalPrice: 699,
    inStock: true,
    isOnSale: false,
    rating: 4.8,
    reviewsCount: 52,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Type": "2-Way Privacy Filter",
      "Finish": "Silk Smooth Matte",
      "Hardness": "9H Hardened Glass"
    },
    description: "Anti-spy privacy tempered glass that blocks side angles to keep your screen content private in public places."
  },
  {
    id: "acc-10",
    name: "Magnetic Car Dashboard & Vent Phone Mount Holder",
    category: "Accessories",
    brand: "Generic",
    price: 449,
    originalPrice: 899,
    inStock: true,
    isOnSale: true,
    rating: 4.7,
    reviewsCount: 26,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Magnets": "6x N52 Neodymium Magnets",
      "Mounting": "360-Degree Swivel Ball Joint",
      "Adhesive": "3M VHB Heavy Duty"
    },
    description: "Universal magnetic phone holder for car dashboard or AC air vent. Securely holds all phone sizes even on bumpy roads."
  },
  {
    id: "acc-11",
    name: "Super VOOC 80W Fast Charging Type-C Cable",
    category: "Cables",
    brand: "Oppo",
    price: 349,
    originalPrice: 699,
    inStock: true,
    isOnSale: false,
    rating: 4.8,
    reviewsCount: 31,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Current": "6.5A SuperVOOC",
      "Length": "1m / 3.3ft",
      "Compatibility": "Oppo, Realme, OnePlus"
    },
    description: "Flash charging cable engineered for SuperVOOC and Warp Charge protocol devices for ultra-fast power delivery."
  },
  {
    id: "acc-12",
    name: "Silicone Soft-Touch Protective Case with Microfiber Lining",
    category: "Cases",
    brand: "Vivo",
    price: 399,
    originalPrice: 799,
    inStock: true,
    isOnSale: true,
    rating: 4.8,
    reviewsCount: 40,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Material": "Liquid Silicone",
      "Lining": "Soft Microfiber Interior",
      "Features": "Full Lens Camera Protection"
    },
    description: "Silky soft-touch liquid silicone case featuring a soft microfiber interior lining to protect your phone body from scratches."
  }
];
