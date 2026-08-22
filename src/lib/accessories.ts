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

// Store products are managed via the Admin Panel (/admin) & Supabase Database with sensible defaults.
export const MOCK_ACCESSORIES: AccessoryProduct[] = [
  {
    id: "acc-101",
    name: "UltraCharge 30W Dual Port Fast Charger",
    category: "Chargers",
    brand: "Anker",
    price: 1499,
    originalPrice: 1999,
    inStock: true,
    isOnSale: true,
    rating: 4.8,
    reviewsCount: 142,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Output Wattage": "30W Max",
      "Ports": "1 x USB-C, 1 x USB-A",
      "Technology": "PowerIQ 3.0, GaN tech",
      "Warranty": "18 Months"
    },
    description: "Compact wall charger with GaN technology to charge smartphones and tablets at maximum speed safely."
  },
  {
    id: "acc-102",
    name: "DuraThread Type-C to Type-C Braided Cable (2m)",
    category: "Cables",
    brand: "boAt",
    price: 499,
    originalPrice: 799,
    inStock: true,
    isOnSale: true,
    rating: 4.6,
    reviewsCount: 84,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Length": "2 Meters (6.6 ft)",
      "Material": "Double-Braided Nylon",
      "Data Transfer Rate": "480 Mbps",
      "Power Delivery": "Up to 60W"
    },
    description: "Extra long, rugged charging cable tested to withstand 10,000+ bends. Supports power delivery fast charging."
  },
  {
    id: "acc-103",
    name: "ArmorGlass Tempered Glass Screen Protector",
    category: "Tempered Glass",
    brand: "Spigen",
    price: 799,
    originalPrice: 1199,
    inStock: true,
    isOnSale: true,
    rating: 4.7,
    reviewsCount: 210,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Hardness": "9H Tempered Glass",
      "Coating": "Oleophobic anti-fingerprint",
      "Thickness": "0.33mm",
      "Clarity": "99.9% HD Clear"
    },
    description: "Case-friendly premium tempered glass protector with alignment frame. Maximum impact absorption and scratch resistance."
  },
  {
    id: "acc-104",
    name: "AeroShield Clear Case with MagSafe",
    category: "Cases",
    brand: "SmartCare Elite",
    price: 1199,
    originalPrice: 1599,
    inStock: true,
    isOnSale: true,
    rating: 4.5,
    reviewsCount: 65,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Material": "TPU + Polycarbonate",
      "MagSafe Compatibility": "Yes (Built-in N52 Magnets)",
      "Drop Protection": "Up to 8 Feet (Military Grade)",
      "Anti-Yellowing": "UV-resistant coating"
    },
    description: "Slim, transparent hybrid case that showcases your phone's color while offering strong magnetic connection and shockproof bumpers."
  },
  {
    id: "acc-105",
    name: "BassBuds Pro Active Noise Cancelling Earbuds",
    category: "Earbuds",
    brand: "Realme",
    price: 2999,
    originalPrice: 3999,
    inStock: true,
    isOnSale: true,
    rating: 4.4,
    reviewsCount: 198,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Noise Cancellation": "Up to 42dB Active Noise Cancellation",
      "Battery Life": "Up to 30 Hours (With case)",
      "Water Resistance": "IPX5 Sweatproof",
      "Bluetooth Version": "5.3"
    },
    description: "Wireless earbuds with deep bass, high-fidelity sound quality, and active background noise cancellation for crystal clear calls."
  },
  {
    id: "acc-106",
    name: "PowerVolt 20000mAh Power Bank (22.5W)",
    category: "Power Banks",
    brand: "Mi",
    price: 1999,
    originalPrice: 2499,
    inStock: true,
    isOnSale: false,
    rating: 4.7,
    reviewsCount: 312,
    image: "/shop_accessories.png",
    images: ["/shop_accessories.png"],
    specifications: {
      "Capacity": "20000mAh 74Wh",
      "Max Power Output": "22.5W Fast Charge",
      "Input Ports": "Type-C, Micro-USB",
      "Output Ports": "2 x USB-A, 1 x Type-C"
    },
    description: "High-capacity external battery pack with triple port output, supporting fast charging for iPhones, Samsung, and OnePlus devices."
  }
];

