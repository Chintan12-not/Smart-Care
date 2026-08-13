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

export const MOCK_ACCESSORIES: AccessoryProduct[] = [
  {
    id: "acc-7",
    name: "Samsung 25W Power Adapter – Super Fast Charging",
    category: "Chargers",
    brand: "Samsung",
    price: 899,
    originalPrice: 1999,
    inStock: true,
    isOnSale: true,
    rating: 4.9,
    reviewsCount: 56,
    image: "/shop_accessories.png",
    specifications: {
      "Brand": "Samsung",
      "Compatible Phone Models": "S24+, S24 Ultra, S23, S23+, S23 Ultra, S22, A55, M34",
      "Colour": "White",
      "Material": "Fire-Retardant ABS Plastic & Polycarbonate",
      "Output Power": "25W Super Fast Charge (PD 3.0)",
      "Warranty": "6 Months Smart Care Replacement Warranty"
    },
    description: "Official 25W USB-C Super Fast Charging Adapter engineered for Samsung Galaxy S-series, A-series, and Note devices with multi-layer safety protection."
  },
  {
    id: "acc-8",
    name: "Magnetic Case for iPhone 15 Plus, Transparent",
    category: "Cases",
    brand: "Apple",
    price: 399,
    originalPrice: 799,
    inStock: true,
    isOnSale: true,
    rating: 4.8,
    reviewsCount: 38,
    image: "/shop_shelf.png",
    specifications: {
      "Brand": "Apple",
      "Compatible Phone Models": "iPhone 15 Plus",
      "Colour": "Teal / Clear",
      "Material": "Hybrid TPU & Hard Polycarbonate Back",
      "MagSafe Alignment": "Strong N52 Magnetic Ring Built-in",
      "Warranty": "Smart Care Certified Quality Standard"
    },
    description: "Ultra-clear crystal back case tailored for iPhone 15 Plus featuring built-in N52 MagSafe magnets, raised camera lip armor, and anti-yellowing coating."
  },
  {
    id: "acc-9",
    name: "Samsung Galaxy S25 Magnetic MagSafe Case",
    category: "Cases",
    brand: "Samsung",
    price: 199,
    originalPrice: 400,
    inStock: true,
    isOnSale: true,
    rating: 4.7,
    reviewsCount: 42,
    image: "/s25_case.jpg",
    images: ["/s25_case.jpg"],
    specifications: {
      "Brand": "Samsung",
      "Compatible Phone Models": "Samsung Galaxy S25, Galaxy S25 Ultra, Galaxy S25+",
      "Colour": "Matte Grey / Black",
      "Material": "Polycarbonate, Flexible TPU, Metallic Magnet",
      "Warranty": "Smart Care Certified Quality Standard"
    },
    description: "Sleek magnetic back cover custom-fit for Samsung Galaxy S25 with elevated camera ring shield, reinforced corner air-cushions, and magnetic accessory support."
  }
];
