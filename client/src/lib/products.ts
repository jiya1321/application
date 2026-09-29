import smartphoneImg from "@assets/generated_images/smartphone_category_image.png";
import laptopImg from "@assets/generated_images/laptop_category_image.png";
import headphonesImg from "@assets/generated_images/headphones_category_image.png";
import appliancesImg from "@assets/generated_images/home_appliances_category_image.png";

// Import actual product images
import oppoIcyBlue from "@assets/generated_images/oppo 4-128 icy blue.png";
import oppoPurple from "@assets/generated_images/oppo 4-128 purple.png";
import realmeC83Blue from "@assets/generated_images/realme c83 4-64 blue.png";
import realmeC83Black from "@assets/generated_images/realme c83 464 black.png";
import realmeC85Black from "@assets/generated_images/realme c85 4-128 black.png";
import realmeC85Brown from "@assets/generated_images/realme c85 4-128 brown - Copy.png";
import realmeC85Purple from "@assets/generated_images/realme c85 4-128 purplr - Copy.png";
import realmeP4LiteBlue from "@assets/generated_images/realme p4 lite 4-128 blue.png";
import realmeP4LiteWhite from "@assets/generated_images/realme p4 lite 4-128 white.png";
import motorolaG57 from "@assets/generated_images/motrola g57 power 5g 8-128 green.png";

// Product image mapping
const productImageMap: Record<string, string> = {
  "OPPO K14x 5G — 4GB + 128GB — Icy Blue": oppoIcyBlue,
  "OPPO K14x 5G — 4GB + 128GB — Prism Violet": oppoPurple,
  "OPPO K14x 5G — 6GB + 128GB — Icy Blue": oppoIcyBlue,
  "OPPO K14x 5G — 6GB + 128GB — Prism Violet": oppoPurple,
  "Realme C83 5G — 4GB + 64GB — Blue": realmeC83Blue,
  "Realme C83 5G — 4GB + 64GB — Black": realmeC83Black,
  "Realme C83 5G — 4GB + 128GB — Blue": realmeC83Blue,
  "Realme C83 5G — 4GB + 128GB — Black": realmeC83Black,
  "Realme C85 5G — 4GB + 128GB — Black": realmeC85Black,
  "Realme C85 5G — 4GB + 128GB — Brown": realmeC85Brown,
  "Realme C85 5G — 4GB + 128GB — Purple": realmeC85Purple,
  "Realme P4 Lite 5G — 4GB + 128GB — Blue": realmeP4LiteBlue,
  "Realme P4 Lite 5G — 4GB + 128GB — White": realmeP4LiteWhite,
  "Motorola G57 Power 5G — 8GB + 128GB": motorolaG57,
};

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  color?: string;
  description: string;
  specs: Record<string, string>;
  isNew?: boolean;
  isBestSeller?: boolean;
  stock: number;
  sku: string;
  brand: string;
  ram?: string;
  storage?: string;
  status: "available" | "out_of_stock";
}

type CatalogItem = [name: string, price: number, originalPrice?: number];

const catalog: Record<string, CatalogItem[]> = {
  Mobiles: [
    ["OPPO K14x 5G — 4GB + 128GB — Icy Blue", 19999, 21999],
    ["OPPO K14x 5G — 4GB + 128GB — Prism Violet", 19999, 21999],
    ["OPPO K14x 5G — 6GB + 128GB — Icy Blue", 22999, 23999],
    ["OPPO K14x 5G — 6GB + 128GB — Prism Violet", 22999, 23999],
    ["Realme C83 5G — 4GB + 64GB — Blue", 17499, 19999],
    ["Realme C83 5G — 4GB + 64GB — Black", 17499, 19999],
    ["Realme C83 5G — 4GB + 128GB — Blue", 19499, 21999],
    ["Realme C83 5G — 4GB + 128GB — Black", 19499, 21999],
    ["Realme C85 5G — 4GB + 128GB — Black", 21999, 24999],
    ["Realme C85 5G — 4GB + 128GB — Brown", 21999, 24999],
    ["Realme C85 5G — 4GB + 128GB — Purple", 21999, 24999],
    ["Realme P4 Lite 5G — 4GB + 128GB — Blue", 18499, 19999],
    ["Realme P4 Lite 5G — 4GB + 128GB — White", 18499, 19999],
    ["Motorola G57 Power 5G — 8GB + 128GB", 19799]
  ],
  Laptops: [
    ["MacBook Pro 14 M3", 169990], ["Dell XPS 13 Plus", 62999, 69999], ["HP Pavilion Plus 14", 54990, 59990], ["HP Spectre x360 14", 124990],
    ["Dell Inspiron 14", 62999], ["Lenovo IdeaPad Slim 5", 49990, 54990], ["Lenovo Legion 5i", 99990, 109990], ["ASUS Vivobook 15", 57999],
    ["ASUS ROG Zephyrus G14", 139990, 149990], ["Acer Aspire 5", 44990], ["Acer Nitro V", 74990, 79990], ["Microsoft Surface Laptop 6", 124999],
    ["Apple MacBook Air 15 M3", 134990], ["Samsung Galaxy Book4", 74990], ["MSI Modern 14", 52990, 57990], ["MSI Katana 15", 89990],
    ["LG Gram 14", 114990, 124990], ["Infinix INBook Y2 Plus", 32990], ["Honor MagicBook X16", 42990], ["Lenovo Yoga 7", 89990, 94990]
  ],
  Accessories: [
    ["Sony WH-1000XM5", 7990, 9990], ["Bose QuietComfort Ultra", 14999], ["Apple AirPods Pro 2", 24900], ["Apple AirPods 3rd Gen", 14999],
    ["JBL Charge 5 Speaker", 5999, 6999], ["JBL Tune 770NC", 5999], ["boAt Airdopes 141", 1499], ["boAt Nirvana Ion Earbuds", 2199],
    ["Nothing Ear (a)", 7999, 8999], ["OnePlus Buds 3", 5499], ["Samsung Galaxy Buds3 Pro", 14999, 17999], ["Logitech MX Master 3S", 8995],
    ["Logitech K380 Keyboard", 2995], ["Amazon Basics USB-C Hub", 1999], ["Anker PowerCore 20K", 2499], ["Belkin 65W GaN Charger", 4499],
    ["Portronics Mport 7C", 1299], ["SanDisk Extreme 1TB SSD", 8999, 10999], ["Mi Smart Band 9", 3499], ["Apple Watch SE", 29900]
  ],
  "Home Appliances": [
    ["LG Smart Washer & Dryer", 36999, 44999], ["Samsung Smart Fridge", 42999, 52999], ["LG 655L French Door Refrigerator", 104990], ["Samsung 8kg EcoBubble Washer", 36999],
    ["LG 1.5 Ton Split AC", 44999, 49999], ["Voltas 1.5 Ton Inverter AC", 39999], ["Daikin 1.5 Ton Split AC", 48999], ["Whirlpool 265L Refrigerator", 29999],
    ["Godrej 236L Refrigerator", 26999], ["IFB 8kg Front Load Washer", 32990, 36990], ["Bosch 9kg Front Load Washer", 45990], ["Voltas Beko Dishwasher", 34990],
    ["Samsung 55 inch 4K Smart TV", 64999, 74999], ["LG 50 inch 4K Smart TV", 49999], ["Sony Bravia 55 inch 4K", 79999, 89999], ["OnePlus 43 inch 4K TV", 29999],
    ["Philips Air Fryer 6.2L", 7999], ["Prestige Induction Cooktop", 2499], ["Bajaj OTG 22L", 4999], ["Dyson V12 Cordless Vacuum", 54900, 59900]
  ],
  Televisions: [
    ["Samsung 55 inch Crystal 4K Smart TV", 54999, 74999], ["LG 50 inch UHD AI Smart TV", 46999, 59999], ["Sony Bravia 55 inch 4K Google TV", 74999, 89999], ["OnePlus 43 inch Y1S Pro 4K TV", 29999, 34999], ["TCL 55 inch QLED 4K TV", 42999, 52999], ["Hisense 43 inch 4K Vidaa TV", 26999], ["Mi 50 inch X Series 4K TV", 35999, 44999], ["Samsung 65 inch Neo QLED TV", 129999, 149999]
  ],
  Refrigerators: [
    ["LG 655L French Door Refrigerator", 104990, 124990], ["Samsung 653L Side-by-Side Refrigerator", 89999, 109999], ["Whirlpool 265L Frost Free Refrigerator", 29999, 34999], ["Godrej 236L Double Door Refrigerator", 26999, 30999], ["Haier 237L Convertible Refrigerator", 24999], ["Bosch 347L Frost Free Refrigerator", 52990, 59990]
  ],
  "Air Conditioners": [
    ["Voltas 1.5 Ton 5 Star Inverter AC", 39999, 49999], ["LG 1.5 Ton 5 Star Split AC", 44999, 54999], ["Daikin 1.5 Ton 5 Star Inverter AC", 48999, 58999], ["Blue Star 1.5 Ton Split AC", 41990, 49990], ["Panasonic 1.5 Ton Wi-Fi Inverter AC", 37999, 44999], ["Carrier 1.5 Ton Flexicool AC", 40999]
  ],
  "Washing Machines": [
    ["LG 8kg Front Load Washing Machine", 36999, 44999], ["Samsung 8kg EcoBubble Washing Machine", 32999, 39999], ["IFB 8kg Front Load Washing Machine", 32990, 36990], ["Bosch 9kg Front Load Washing Machine", 45990, 52990], ["Whirlpool 7.5kg Top Load Washing Machine", 22999, 27999], ["Panasonic 7kg Fully Automatic Washer", 18999]
  ],
  Headphones: [
    ["Sony WH-1000XM5 Wireless Headphones", 27990, 34990], ["JBL Tune 770NC ANC Headphones", 5999, 7999], ["boAt Rockerz 550 Over-Ear Headphones", 1999, 3999], ["Bose QuietComfort Ultra Headphones", 29999], ["Sennheiser Accentum Wireless Headphones", 8990, 11990], ["OnePlus Bullets Wireless Z2", 1999]
  ],
  Cameras: [
    ["Canon EOS R50 Mirrorless Camera", 64999, 74999], ["Sony Alpha ZV-E10 Camera", 59990, 69990], ["Nikon Z50 Mirrorless Camera", 69999, 79999], ["GoPro HERO12 Black", 34999, 44999], ["Canon EOS 1500D DSLR Camera", 39999, 49999], ["Fujifilm Instax Mini 12 Camera", 7999, 9999]
  ],
  "Mixer Grinder": [],
  "Irons": [],
  "Chimney": [],
  "Gas Stoves": []
};

const categoryImages: Record<string, string> = {
  Mobiles: smartphoneImg,
  Laptops: laptopImg,
  Accessories: headphonesImg,
  "Home Appliances": appliancesImg,
  "Mixer Grinder": appliancesImg,
  "Irons": appliancesImg,
  "Chimney": appliancesImg,
  "Gas Stoves": appliancesImg
};

const getProductSpecs = (name: string, category: string): Record<string, string> => {
  // Specific specs for mobile products
  if (name.includes("OPPO K14x 5G — 4GB + 128GB")) {
    return {
      Brand: "OPPO",
      Model: "K14x 5G",
      RAM: "4GB",
      Storage: "128GB",
      Category: category,
      Warranty: "1 year brand warranty",
      Delivery: "Free delivery across India",
      Display: "6.75\" HD+ LCD, 120Hz",
      Processor: "MediaTek Dimensity 6300 5G",
      Camera: "50MP Rear + 5MP Front",
      Battery: "6500mAh",
      Charging: "45W SUPERVOOC",
      OS: "ColorOS 15",
      Network: "5G"
    };
  }
  if (name.includes("OPPO K14x 5G — 6GB + 128GB")) {
    return {
      Brand: "OPPO",
      Model: "K14x 5G",
      RAM: "6GB",
      Storage: "128GB",
      Category: category,
      Warranty: "1 year brand warranty",
      Delivery: "Free delivery across India",
      Display: "6.75\" HD+ LCD, 120Hz",
      Processor: "MediaTek Dimensity 6300 5G",
      Camera: "50MP Rear + 5MP Front",
      Battery: "6500mAh",
      Charging: "45W SUPERVOOC",
      OS: "ColorOS 15",
      Network: "5G"
    };
  }
  if (name.includes("Realme C83 5G — 4GB + 64GB")) {
    return {
      Brand: "Realme",
      Model: "C83 5G",
      RAM: "4GB",
      Storage: "64GB",
      Category: category,
      Warranty: "1 year brand warranty",
      Delivery: "Free delivery across India",
      Display: "6.8\" HD+, 144Hz",
      Processor: "MediaTek Dimensity 6300 5G",
      Camera: "13MP Rear + 5MP Front",
      Battery: "7000mAh Titan",
      Charging: "15W Fast Charging",
      OS: "realme UI 7.0",
      Network: "5G"
    };
  }
  if (name.includes("Realme C83 5G — 4GB + 128GB")) {
    return {
      Brand: "Realme",
      Model: "C83 5G",
      RAM: "4GB",
      Storage: "128GB",
      Category: category,
      Warranty: "1 year brand warranty",
      Delivery: "Free delivery across India",
      Display: "6.8\" HD+, 144Hz",
      Processor: "MediaTek Dimensity 6300 5G",
      Camera: "13MP Rear + 5MP Front",
      Battery: "7000mAh Titan",
      Charging: "15W Fast Charging",
      OS: "realme UI 7.0",
      Network: "5G"
    };
  }
  if (name.includes("Realme C85 5G — 4GB + 128GB")) {
    return {
      Brand: "Realme",
      Model: "C85 5G",
      RAM: "4GB",
      Storage: "128GB",
      Category: category,
      Warranty: "1 year brand warranty",
      Delivery: "Free delivery across India",
      Display: "6.8\" HD+, 144Hz",
      Processor: "MediaTek Dimensity 6300 5G",
      Camera: "50MP Sony Rear + 8MP Front",
      Battery: "7000mAh Titan",
      Charging: "45W Fast Charging",
      OS: "realme UI",
      Network: "5G"
    };
  }
  if (name.includes("Realme P4 Lite 5G — 4GB + 128GB")) {
    return {
      Brand: "Realme",
      Model: "P4 Lite 5G",
      RAM: "4GB",
      Storage: "128GB",
      Category: category,
      Warranty: "1 year brand warranty",
      Delivery: "Free delivery across India",
      Display: "6.8\" HD+, 144Hz",
      Processor: "MediaTek Dimensity 6300 5G",
      Camera: "13MP Rear + 5MP Front",
      Battery: "7000mAh Titan",
      Charging: "15W Fast Charging",
      OS: "realme UI 7.0",
      Network: "5G"
    };
  }
  if (name.includes("Motorola G57 Power 5G — 8GB + 128GB")) {
    return {
      Brand: "Motorola",
      Model: "moto g57 power 5G",
      RAM: "8GB",
      Storage: "128GB",
      Category: category,
      Warranty: "1 year brand warranty",
      Delivery: "Free delivery across India",
      Display: "6.72\" Full HD+, 120Hz",
      Processor: "Snapdragon 6s Gen 4 5G",
      Camera: "50MP Sony LYTIA + 8MP Ultrawide",
      Battery: "7000mAh",
      Charging: "33W TurboPower",
      OS: "Android 16",
      Network: "5G"
    };
  }
  
  // Default specs for other products
  return {
    Category: category,
    Warranty: "1 year brand warranty",
    Delivery: "Free delivery across India"
  };
};

const getProductId = (name: string, category: string, categoryIndex: number, itemIndex: number): number => {
  // Specific IDs for mobile products with colors
  if (category === "Mobiles") {
    const mobileIds: Record<string, number> = {
      "OPPO K14x 5G — 4GB + 128GB — Icy Blue": 1,
      "OPPO K14x 5G — 4GB + 128GB — Prism Violet": 2,
      "OPPO K14x 5G — 6GB + 128GB — Icy Blue": 3,
      "OPPO K14x 5G — 6GB + 128GB — Prism Violet": 4,
      "Realme C83 5G — 4GB + 64GB — Blue": 5,
      "Realme C83 5G — 4GB + 64GB — Black": 6,
      "Realme C83 5G — 4GB + 128GB — Blue": 7,
      "Realme C83 5G — 4GB + 128GB — Black": 8,
      "Realme C85 5G — 4GB + 128GB — Black": 9,
      "Realme C85 5G — 4GB + 128GB — Brown": 10,
      "Realme C85 5G — 4GB + 128GB — Purple": 11,
      "Realme P4 Lite 5G — 4GB + 128GB — Blue": 12,
      "Realme P4 Lite 5G — 4GB + 128GB — White": 13,
      "Motorola G57 Power 5G — 8GB + 128GB": 14
    };
    return mobileIds[name] || categoryIndex * 20 + itemIndex + 1;
  }
  return categoryIndex * 20 + itemIndex + 1;
};

const getProductImages = (name: string, category: string, defaultImage: string): string[] => {
  // Use productImageMap for mobile products with specific images
  if (category === "Mobiles" && productImageMap[name]) {
    return [productImageMap[name]];
  }
  // For non-mobile products or mobiles without specific images, return single image
  return [defaultImage];
};

const getProductMainImage = (name: string, category: string, defaultImage: string): string => {
  // Use specific image from productImageMap if available
  if (productImageMap[name]) {
    return productImageMap[name];
  }
  return defaultImage;
};

const getBrandFromName = (name: string, category: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("oppo")) return "OPPO";
  if (lowerName.includes("realme")) return "Realme";
  if (lowerName.includes("motorola") || lowerName.includes("moto")) return "Motorola";
  if (lowerName.includes("samsung")) return "Samsung";
  if (lowerName.includes("lg")) return "LG";
  if (lowerName.includes("sony")) return "Sony";
  if (lowerName.includes("apple") || lowerName.includes("iphone") || lowerName.includes("macbook")) return "Apple";
  if (lowerName.includes("dell")) return "Dell";
  if (lowerName.includes("hp")) return "HP";
  if (lowerName.includes("lenovo")) return "Lenovo";
  if (lowerName.includes("asus")) return "ASUS";
  if (lowerName.includes("acer")) return "Acer";
  if (lowerName.includes("msi")) return "MSI";
  if (lowerName.includes("microsoft")) return "Microsoft";
  if (lowerName.includes("oneplus")) return "OnePlus";
  if (lowerName.includes("xiaomi") || lowerName.includes("mi")) return "Xiaomi";
  if (lowerName.includes("boAt") || lowerName.includes("boat")) return "boAt";
  if (lowerName.includes("jbl")) return "JBL";
  if (lowerName.includes("bose")) return "Bose";
  if (lowerName.includes("logitech")) return "Logitech";
  if (lowerName.includes("anker")) return "Anker";
  if (lowerName.includes("belkin")) return "Belkin";
  if (lowerName.includes("philips")) return "Philips";
  if (lowerName.includes("prestige")) return "Prestige";
  if (lowerName.includes("bajaj")) return "Bajaj";
  if (lowerName.includes("dyson")) return "Dyson";
  if (lowerName.includes("voltas")) return "Voltas";
  if (lowerName.includes("daikin")) return "Daikin";
  if (lowerName.includes("blue star")) return "Blue Star";
  if (lowerName.includes("panasonic")) return "Panasonic";
  if (lowerName.includes("carrier")) return "Carrier";
  if (lowerName.includes("whirlpool")) return "Whirlpool";
  if (lowerName.includes("godrej")) return "Godrej";
  if (lowerName.includes("ifb")) return "IFB";
  if (lowerName.includes("bosch")) return "Bosch";
  if (lowerName.includes("haier")) return "Haier";
  if (lowerName.includes("tcl")) return "TCL";
  if (lowerName.includes("hisense")) return "Hisense";
  if (lowerName.includes("infinix")) return "Infinix";
  if (lowerName.includes("honor")) return "Honor";
  if (lowerName.includes("canon")) return "Canon";
  if (lowerName.includes("nikon")) return "Nikon";
  if (lowerName.includes("gopro")) return "GoPro";
  if (lowerName.includes("fujifilm")) return "Fujifilm";
  if (lowerName.includes("portronics")) return "Portronics";
  if (lowerName.includes("sandisk")) return "SanDisk";
  if (lowerName.includes("nothing")) return "Nothing";
  if (lowerName.includes("sennheiser")) return "Sennheiser";
  return "Generic";
};

const getRamFromName = (name: string): string | undefined => {
  const ramMatch = name.match(/(\d+)GB/);
  return ramMatch ? ramMatch[1] + "GB" : undefined;
};

const getStorageFromName = (name: string): string | undefined => {
  const storageMatch = name.match(/(\d+)GB/);
  if (storageMatch) {
    const gb = parseInt(storageMatch[1]);
    if (gb >= 64) return storageMatch[1] + "GB";
  }
  return undefined;
};

const generateSKU = (id: number, category: string): string => {
  const categoryCode = category.substring(0, 3).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KE-${categoryCode}-${id}-${randomPart}`;
};

const getProductColor = (name: string, category: string): string | undefined => {
  // Extract color from product name for mobile products
  if (category === "Mobiles") {
    if (name.includes("—")) {
      const parts = name.split("—");
      if (parts.length >= 3) {
        return parts[2].trim();
      }
    }
  }
  return undefined;
};

export const products: Product[] = Object.entries(catalog).flatMap(([category, items], categoryIndex) =>
  items.map(([name, price, originalPrice], itemIndex) => {
    const defaultImage = categoryImages[category] || appliancesImg;

const images = getProductImages(name, category, defaultImage);

return {
  id: getProductId(name, category, categoryIndex, itemIndex),
  name,
  category,
  price,
  originalPrice,
  rating: Number((4.4 + ((itemIndex + categoryIndex) % 6) / 10).toFixed(1)),
  reviews: 120 + (categoryIndex * 400) + (itemIndex * 83),

  // First image from the product's own gallery
  image: images[0],

  // Full product gallery
  images,

  // Color field for mobile products
  color: getProductColor(name, category),

  description: `${name} with dependable performance, modern features, and GST-inclusive pricing from Krishna Electronics.`,
  specs: getProductSpecs(name, category),
  isNew: itemIndex < 3,
  isBestSeller: itemIndex % 5 === 0,
  
  // Inventory fields
  stock: Math.floor(Math.random() * 20) + 5, // Random stock between 5-25
  sku: generateSKU(getProductId(name, category, categoryIndex, itemIndex), category),
  brand: getBrandFromName(name, category),
  ram: getRamFromName(name),
  storage: getStorageFromName(name),
  status: "available"
};
      
  })
);

export const categories = [
  { name: "Mobiles", image: smartphoneImg },
  { name: "Laptops", image: laptopImg },
  { name: "Televisions", image: appliancesImg },
  { name: "Refrigerators", image: appliancesImg },
  { name: "Air Conditioners", image: appliancesImg },
  { name: "Washing Machines", image: appliancesImg },
  { name: "Headphones", image: headphonesImg },
  { name: "Cameras", image: appliancesImg },
  { name: "Accessories", image: headphonesImg },
  { name: "Mixer Grinder", image: appliancesImg },
  { name: "Irons", image: appliancesImg },
  { name: "Chimney", image: appliancesImg },
  { name: "Gas Stoves", image: appliancesImg }
];

// Initialize inventory from products
export const initializeInventory = () => {
  const existingInventory = localStorage.getItem("krishna-inventory");
  if (existingInventory) {
    try {
      const parsed = JSON.parse(existingInventory);
      // Only add products that don't exist in inventory
      products.forEach((product) => {
        if (parsed[product.id] === undefined) {
          parsed[product.id] = product.stock;
        }
      });
      localStorage.setItem("krishna-inventory", JSON.stringify(parsed));
    } catch (e) {
      console.error("Failed to parse inventory", e);
      // If parsing fails, initialize fresh
      const freshInventory: Record<number, number> = {};
      products.forEach((product) => {
        freshInventory[product.id] = product.stock;
      });
      localStorage.setItem("krishna-inventory", JSON.stringify(freshInventory));
    }
  } else {
    // Initialize fresh inventory
    const freshInventory: Record<number, number> = {};
    products.forEach((product) => {
      freshInventory[product.id] = product.stock;
    });
    localStorage.setItem("krishna-inventory", JSON.stringify(freshInventory));
  }
};
