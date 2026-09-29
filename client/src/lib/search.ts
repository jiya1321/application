import { Product, products as defaultProducts } from "@/lib/products";

export const searchCategories = ["All Categories", "Mobiles", "Laptops", "Televisions", "Refrigerators", "Air Conditioners", "Washing Machines", "Headphones", "Speakers", "Cameras", "Accessories"];
export const popularSearches = ["iPhone", "Samsung TV", "Laptops", "Air Conditioners", "Headphones", "5G Phones"];

const categoryAliases: Record<string, string> = {
  phone: "Mobiles", phones: "Mobiles", mobile: "Mobiles", mobiles: "Mobiles", tv: "Televisions", television: "Televisions", televisions: "Televisions", laptop: "Laptops", laptops: "Laptops", ac: "Air Conditioners", "air conditioner": "Air Conditioners", refrigerator: "Refrigerators", fridge: "Refrigerators", washing: "Washing Machines", "washing machine": "Washing Machines", headphones: "Headphones", camera: "Cameras", cameras: "Cameras", accessory: "Accessories", accessories: "Accessories"
};
const stopWords = new Set(["under", "below", "between", "and", "the", "for", "with", "a", "an", "in", "of", "to", "above", "or"]);

export type SearchSuggestion = { type: "brand" | "product" | "category" | "recent" | "correction"; label: string; product?: Product };
export type SearchConstraints = { minPrice?: number; maxPrice?: number; category?: string };

const normalise = (value: string) => value.toLowerCase().replace(/[₹,$]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const numberValue = (value: string) => Number(value.replace(/[,₹$\s]/g, ""));
export const parseSearch = (query: string): SearchConstraints => {
  const cleaned = query.replace(/,/g, "");
  const between = cleaned.match(/between\s+₹?([\d]+)\s+(?:and|to)\s+₹?([\d]+)/i);
  const limit = cleaned.match(/(?:under|below|upto|up to)\s+₹?([\d]+)/i);
  const category = Object.entries(categoryAliases).find(([alias]) => new RegExp(`\\b${alias.replace(" ", "\\s+")}\\b`, "i").test(cleaned))?.[1];
  if (between) return { minPrice: numberValue(between[1]), maxPrice: numberValue(between[2]), category };
  if (limit) return { maxPrice: numberValue(limit[1]), category };
  return { category };
};

const inferredSpecs = (product: Product) => {
  const category = product.category;
  if (category === "Mobiles") return "5G 8GB RAM 12GB RAM 256GB 512GB 5000mAh camera AMOLED";
  if (category === "Laptops") return "8GB RAM 16GB RAM 512GB 1TB SSD laptop Windows 11";
  if (category === "Televisions") return "4K UHD Smart TV 120Hz OLED QLED";
  if (category === "Headphones") return "wireless Bluetooth ANC audio";
  return "smart inverter electronics";
};
const searchable = (product: Product) => normalise(`${product.name} ${product.category} ${product.description} ${Object.entries(product.specs).map(([key, value]) => `${key} ${value}`).join(" ")} ${inferredSpecs(product)}`);

export const searchProducts = (query: string, scope = "All Categories", products = defaultProducts) => {
  const constraints = parseSearch(query);
  const tokens = normalise(query).split(" ").filter((token) => token && !stopWords.has(token) && !/^\d+$/.test(token)).flatMap((token) => categoryAliases[token] ? [token, ...normalise(categoryAliases[token]).split(" ")] : [token]);
  const scopedCategory = scope !== "All Categories" ? scope : constraints.category;
  return products.filter((product) => (!scopedCategory || product.category === scopedCategory) && (constraints.minPrice === undefined || product.price >= constraints.minPrice) && (constraints.maxPrice === undefined || product.price <= constraints.maxPrice)).map((product) => {
    const name = normalise(product.name); const brand = name.split(" ")[0]; const category = normalise(product.category); const text = searchable(product);
    const score = tokens.reduce((total, token) => total + (name.includes(token) ? 8 : brand.includes(token) ? 7 : category.includes(token) ? 6 : text.includes(token) ? 3 : 0), 0) + (query && name === normalise(query) ? 20 : 0);
    return { product, score };
  }).filter(({ score }) => !tokens.length || score > 0).sort((a, b) => b.score - a.score || b.product.rating - a.product.rating).map(({ product }) => product);
};

const distance = (a: string, b: string) => { const row = Array.from({ length: b.length + 1 }, (_, index) => index); for (let i = 1; i <= a.length; i += 1) { let previous = row[0]; row[0] = i; for (let j = 1; j <= b.length; j += 1) { const current = row[j]; row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1)); previous = current; } } return row[b.length]; };
export const didYouMean = (query: string) => {
  const candidateWords = ["Samsung", "iPhone", "Headphones", "OnePlus", "Televisions", "Laptops", "Refrigerators", "Cameras"];
  const input = normalise(query); const candidate = candidateWords.map((word) => ({ word, score: distance(input, normalise(word)) })).sort((a, b) => a.score - b.score)[0];
  return candidate && candidate.score > 0 && candidate.score <= Math.max(2, Math.floor(input.length / 3)) ? candidate.word : undefined;
};

export const getSuggestions = (query: string, scope = "All Categories", products = defaultProducts): SearchSuggestion[] => {
  const input = normalise(query); if (!input) return [];
  const categoryMatches = searchCategories.slice(1).filter((category) => normalise(category).includes(input) || Object.entries(categoryAliases).some(([alias, value]) => value === category && alias.includes(input))).slice(0, 3).map((label) => ({ type: "category" as const, label }));
  const brandNames = Array.from(new Set(products.map((product) => product.name.split(" ")[0]))).filter((brand) => normalise(brand).includes(input)).slice(0, 3).map((label) => ({ type: "brand" as const, label }));
  const productMatches = searchProducts(query, scope, products).slice(0, 6).map((product) => ({ type: "product" as const, label: product.name, product }));
  const correction = didYouMean(query);
  const correctionSuggestion = correction ? [{ type: "correction" as const, label: `Did you mean: ${correction}` }] : [];
  return [...correctionSuggestion, ...brandNames, ...categoryMatches, ...productMatches].filter((suggestion, index, all) => all.findIndex((item) => item.label === suggestion.label) === index).slice(0, 8);
};
