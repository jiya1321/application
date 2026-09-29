/**
 * Krishna AI - Natural Language Understanding Engine
 * Handles intent classification, entity extraction, and context management
 */

export type Intent =
  | "GREETING"
  | "GENERAL_CONVERSATION"
  | "PRODUCT_SEARCH"
  | "PRODUCT_RECOMMENDATION"
  | "PRODUCT_INFORMATION"
  | "PRODUCT_COMPARISON"
  | "PURCHASE_HELP"
  | "PAYMENT_HELP"
  | "DELIVERY_HELP"
  | "RETURN_HELP"
  | "WARRANTY_HELP"
  | "ORDER_HELP"
  | "STORE_INFORMATION"
  | "SERVICE_INFORMATION"
  | "PRICE_QUERY"
  | "SPECIFICATION_QUERY"
  | "CLARIFICATION"
  | "FOLLOW_UP"
  | "UNKNOWN";

export interface ConversationContext {
  category?: string;
  brand?: string;
  budget?: {
    min?: number;
    max?: number;
  };
  specifications?: Record<string, string>;
  requirements?: string[];
  useCase?: string;
  currentProductId?: string;
  comparisonProducts?: string[];
  lastProductsShown?: string[];
  lastSearchQuery?: string;
  clarificationNeeded?: boolean;
}

/**
 * Advanced intent classification using multiple strategies
 */
export function classifyIntent(input: string, context?: ConversationContext): Intent {
  const lower = input.toLowerCase().trim();

  // Greeting detection
  if (/^(hi|hello|hey|namaste|greetings|hey there|howdy)\b/.test(lower)) {
    return "GREETING";
  }

  // General conversation - "what can you do", "who are you", etc.
  if (/^(what can you|who are you|what do you|what are you|help|tell me|how can you|what's your|introduce yourself)/.test(lower)) {
    return "GENERAL_CONVERSATION";
  }

  // Follow-up questions - shorter, contextual
  if (context?.lastProductsShown && context.lastProductsShown.length > 0) {
    // Follow-ups to previous recommendations
    if (/^(yes|yeah|ok|okay|great|sounds good|that works|this one|this looks|nice|good)/.test(lower)) {
      return "FOLLOW_UP";
    }
    if (/^(no|nope|not really|not good|don't like|something else|other|different|cheaper|more|less|better)/.test(lower)) {
      return "FOLLOW_UP";
    }
    // Refinement queries
    if (/^(what about|show me|got any|do you have|any other|something else|try|different|another)/.test(lower)) {
      return "FOLLOW_UP";
    }
  }

  // Comparison intent
  if (/\b(compare|comparison|versus|vs|which.*better|difference between|versus|one vs|vs one|pros and cons)\b/.test(lower)) {
    return "PRODUCT_COMPARISON";
  }

  // Specification/Info queries
  if (/\b(spec|specification|battery|ram|storage|display|camera|processor|weight|dimensions|how much|what's|what is|tell me about|what does|features of)\b/.test(lower)) {
    if (/\b(phone|mobile|laptop|tv|product|this|that|one)\b/.test(lower)) {
      return "SPECIFICATION_QUERY";
    }
    return "PRODUCT_INFORMATION";
  }

  // Price queries
  if (/\b(price|cost|how much|worth|expensive|cheap|discount|offer|rupee|₹)\b/.test(lower)) {
    if (/\b(this|that|one|product|it|phone|mobile|laptop)\b/.test(lower)) {
      return "PRICE_QUERY";
    }
  }

  // Purchasing help
  if (/\b(how to buy|buy now|purchase|order|place.*order|checkout|payment|pay|add to cart|cart|buy this|make.*purchase)\b/.test(lower)) {
    return "PURCHASE_HELP";
  }

  // Payment help
  if (/\b(payment|pay|upi|card|net banking|cod|cash.*delivery|credit.*card|debit|wallet|installment|emi|no cost emi)\b/.test(lower)) {
    return "PAYMENT_HELP";
  }

  // Delivery help
  if (/\b(delivery|ship|when will|arrive|how long|pin code|address|location|fast|express)\b/.test(lower)) {
    return "DELIVERY_HELP";
  }

  // Returns & Refunds
  if (/\b(return|refund|exchange|cancel|go back|undo|send back|money back)\b/.test(lower)) {
    return "RETURN_HELP";
  }

  // Warranty & Guarantee
  if (/\b(warranty|guarantee|protection|damage|repair|service center|support)\b/.test(lower)) {
    return "WARRANTY_HELP";
  }

  // Order tracking
  if (/\b(track|order|status|where is|deliver|tracking|shipment)\b/.test(lower)) {
    return "ORDER_HELP";
  }

  // Store information
  if (/\b(store|location|address|visit|office|hours|open|close|contact|reach|phone)\b/.test(lower)) {
    return "STORE_INFORMATION";
  }

  // Service information
  if (/\b(service|center|support|help|assist|contact|customer care)\b/.test(lower)) {
    return "SERVICE_INFORMATION";
  }

  // Clarification needed (very short or unclear)
  if (lower.length < 3 || lower.split(" ").length === 1) {
    if (context && Object.keys(context).length > 0) {
      return "CLARIFICATION";
    }
  }

  // Product recommendation/search
  if (/\b(need|want|looking for|find|show|recommend|suggest|best|which|what.*should|help me|get me|buy)\b/.test(lower)) {
    if (/\b(phone|mobile|laptop|tv|refrigerator|ac|washer|camera|headphone|speaker|tablet|device|product|electronics|gadget)\b/.test(lower)) {
      return "PRODUCT_RECOMMENDATION";
    }
    // Budget + want = product recommendation
    if (/₹|\bunder\b|\bbelow\b|\bupto\b|\blimit\b|\bbudget\b/.test(lower)) {
      return "PRODUCT_RECOMMENDATION";
    }
  }

  // Direct product search
  if (/\b(search|filter|products|shop|category|brand)\b/.test(lower)) {
    return "PRODUCT_SEARCH";
  }

  // Fallback to general conversation
  return "GENERAL_CONVERSATION";
}

/**
 * Extract entities from user input
 */
export interface ExtractedEntities {
  category?: string;
  brand?: string;
  budget?: { min?: number; max?: number };
  requirements?: string[];
  useCase?: string;
  productName?: string;
  specification?: Record<string, string>;
}

const CATEGORIES = ["mobiles", "phones", "laptops", "computers", "tvs", "televisions", "refrigerators", "fridges", "ac", "air conditioner", "washing machine", "washers", "headphones", "earbuds", "speakers", "cameras", "accessories"];
const BRANDS = ["samsung", "apple", "iphone", "oneplus", "google", "pixel", "nokia", "motorola", "nothing", "redmi", "xiaomi", "mi", "oppo", "vivo", "realme", "asus", "hp", "dell", "lenovo", "sony", "lg"];
const SPECS_KEYWORDS = ["storage", "ram", "battery", "camera", "processor", "display", "screen", "weight", "dimensions", "5g", "4g", "oled", "amoled", "fps", "refresh rate", "resolution"];

export function extractEntities(input: string, context?: ConversationContext): ExtractedEntities {
  const lower = input.toLowerCase();
  const entities: ExtractedEntities = {};

  // Extract category
  for (const cat of CATEGORIES) {
    if (lower.includes(cat)) {
      entities.category = cat.includes("phone") ? "Mobiles" : cat.includes("laptop") ? "Laptops" : cat.includes("tv") ? "Televisions" : cat.includes("fridge") ? "Refrigerators" : cat.includes("ac") ? "Air Conditioners" : cat.includes("washing") ? "Washing Machines" : cat.includes("headphone") ? "Headphones" : cat.includes("camera") ? "Cameras" : cat.includes("speaker") ? "Speakers" : cat;
      break;
    }
  }

  // Extract brand
  for (const brand of BRANDS) {
    if (lower.includes(brand)) {
      entities.brand = brand.charAt(0).toUpperCase() + brand.slice(1);
      break;
    }
  }

  // Extract budget
  const budgetMatch = lower.match(/(?:under|below|upto|up to|budget of|around|max|maximum|₹)\s*₹?\s*(\d{2,}(?:,\d{3})*)/g);
  if (budgetMatch) {
    const amounts = budgetMatch
      .map(m => parseInt(m.replace(/[^\d]/g, "")))
      .filter(n => !isNaN(n));
    if (amounts.length > 0) {
      entities.budget = {
        max: Math.max(...amounts),
        min: amounts.length > 1 ? Math.min(...amounts) : undefined,
      };
    }
  }

  // Extract use case
  const useCases = ["gaming", "work", "coding", "programming", "student", "professional", "business", "casual", "photography", "video", "editing", "streaming", "browsing"];
  for (const useCase of useCases) {
    if (lower.includes(useCase)) {
      entities.useCase = useCase;
      break;
    }
  }

  // Extract specifications/requirements
  entities.requirements = [];
  const specs = ["good camera", "fast", "battery", "lightweight", "storage", "light", "compact", "performance", "build quality", "screen quality", "durability"];
  for (const spec of specs) {
    if (lower.includes(spec)) {
      entities.requirements.push(spec);
    }
  }

  // Extract specific product name
  for (const brand of BRANDS) {
    if (lower.includes(brand)) {
      const words = input.split(/\s+/);
      const brandIdx = words.findIndex(w => w.toLowerCase().includes(brand));
      if (brandIdx >= 0 && brandIdx < words.length - 1) {
        entities.productName = words.slice(brandIdx, brandIdx + 3).join(" ");
      }
    }
  }

  return entities;
}

/**
 * Update context based on extracted entities
 */
export function updateContext(context: ConversationContext, entities: ExtractedEntities): ConversationContext {
  return {
    ...context,
    category: entities.category || context.category,
    brand: entities.brand || context.brand,
    budget: entities.budget || context.budget,
    useCase: entities.useCase || context.useCase,
    requirements: [...(context.requirements || []), ...(entities.requirements || [])],
    specifications: {
      ...context.specifications,
      ...entities.specification,
    },
  };
}

/**
 * Generate context-aware response based on intent
 */
export function generateContextualResponse(
  intent: Intent,
  input: string,
  context: ConversationContext,
  currentProduct?: any
): string {
  const lower = input.toLowerCase();

  switch (intent) {
    case "GREETING":
      return `Hi there! 👋 I'm Krishna AI, your personal electronics shopping assistant. I can help you find the perfect device, answer questions about specs, pricing, delivery, and more. What are you looking for today?`;

    case "GENERAL_CONVERSATION":
      if (lower.includes("what can you") || lower.includes("what do you")) {
        return `I can help you:
• Find electronics (phones, laptops, TVs, appliances, etc.)
• Search by budget and requirements
• Compare different models
• Answer questions about specifications
• Help with purchasing, payments, and delivery
• Provide warranty and return information

What would you like to do?`;
      }
      return `I'm here to help! Whether you're looking for a new phone, laptop, or any other electronics, I can assist you. You can search by budget, brand, features, or use case. What interests you?`;

    case "PRODUCT_RECOMMENDATION":
      if (context.category && context.budget) {
        return `Got it! You're looking for a ${context.brand ? context.brand : context.category} within ₹${context.budget.max?.toLocaleString("en-IN")}${context.useCase ? ` for ${context.useCase}` : ""}. Let me find the best options for you...`;
      }
      if (context.category) {
        return `Looking for ${context.brand ? `${context.brand} ` : ""}${context.category}? ${context.useCase ? `For ${context.useCase}, ` : ""}what's your budget range?`;
      }
      return "What type of device are you interested in, and what's your budget?";

    case "PRODUCT_COMPARISON":
      return "I can help you compare! Which products would you like to compare, or tell me what features matter most to you?";

    case "SPECIFICATION_QUERY":
      if (currentProduct) {
        return `Here are the key specs for the ${currentProduct.name}:\n\n${Object.entries(currentProduct.specs)
          .map(([key, value]) => `• ${key}: ${value}`)
          .join("\n")}`;
      }
      return "Which product's specifications would you like to know about?";

    case "PRICE_QUERY":
      if (currentProduct) {
        const originalPrice = currentProduct.originalPrice;
        const discount = originalPrice ? Math.round(((originalPrice - currentProduct.price) / originalPrice) * 100) : 0;
        return `The ${currentProduct.name} is priced at ₹${currentProduct.price.toLocaleString("en-IN")}${discount > 0 ? ` (${discount}% off from ₹${originalPrice?.toLocaleString("en-IN")})` : ""}. That's competitive for its category!`;
      }
      return "I can help you find something within your budget. What price range are you considering?";

    case "PURCHASE_HELP":
      return `Buying from Krishna Electronics is simple:
1. Select your product
2. Click "Add to Cart" or "Buy Now"
3. Enter your delivery address
4. Choose your payment method
5. Place your order

Would you like help finding a product?`;

    case "PAYMENT_HELP":
      return `We accept multiple payment methods:
• UPI (Google Pay, PhonePe, Paytm, etc.)
• Credit & Debit Cards
• Net Banking
• Cash on Delivery (COD) available on select items
• No-Cost EMI available on eligible products

Which payment method do you prefer?`;

    case "DELIVERY_HELP":
      return `We offer FREE delivery across India! Delivery times depend on your location and product availability. Typically, we deliver within 3-7 business days. You can track your order once it ships.`;

    case "RETURN_HELP":
      return `We have easy return and exchange policies. Most products can be returned within 30 days if unopened. If there's a defect or issue, we'll arrange replacement or refund. Contact us with your order details for assistance.`;

    case "WARRANTY_HELP":
      return `Warranty coverage varies by product and manufacturer. Details are shown on each product page and in your order confirmation. We follow the manufacturer's warranty policy. Contact us if you have specific warranty questions.`;

    case "ORDER_HELP":
      return `To track your order, check the order confirmation email or contact us with your order number. You'll receive updates via SMS and email as your order progresses.`;

    case "STORE_INFORMATION":
      return `Krishna Electronics
Shop No. 182, Dashmesh Market
Balongi, Chandigarh, India
📞 +91 98141 93459
📧 krishnaelectronics459@gmail.com
Hours: Mon-Sat, 9 AM - 6 PM`;

    case "FOLLOW_UP":
      if (/^(no|nope|not|something else|cheaper|less|more|different)/.test(lower)) {
        return `I understand. ${context.category ? `What would you prefer instead?` : `What are you looking for?`}`;
      }
      return "Great! What would you like to know more about?";

    case "CLARIFICATION":
      return "Could you provide more details? For example: category, budget, brand preference, or what you'll use it for?";

    default:
      return `I'm here to help! Feel free to ask about products, pricing, delivery, returns, or anything else. What can I assist you with?`;
  }
}
