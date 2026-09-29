import { FormEvent, useMemo, useState, useEffect } from "react";
import { Bot, Check, ChevronRight, Send, ShoppingCart, Sparkles, X, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { Product, products } from "@/lib/products";
import { formatINR } from "@/lib/currency";
import { searchProducts } from "@/lib/search";
import { useCart } from "@/context/CartContext";
import { classifyIntent, extractEntities, updateContext, generateContextualResponse, ConversationContext } from "@/lib/krishna-nlu";
import type { Intent } from "@/lib/krishna-nlu";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  productIds?: string[];
  intent?: Intent;
};
const quickActions = ["Find a Phone", "Find a Laptop", "Find a TV", "Find an Appliance", "Compare Products"];

function RecommendationCard({ product }: { product: Product }) { const { addToCart } = useCart(); const [, setLocation] = useLocation(); const [added, setAdded] = useState(false); const add = () => { addToCart(product); setAdded(true); window.setTimeout(() => setAdded(false), 1200); }; return <div className="rounded-lg border border-gray-200 bg-gray-50 p-3"><div className="flex gap-3"><img src={product.image} alt={product.name} className="h-16 w-16 rounded bg-white object-contain" /><div className="min-w-0 flex-1"><button onClick={() => setLocation(`/product/${product.id}`)} className="line-clamp-2 text-left text-sm font-bold text-gray-900 hover:text-orange-600">{product.name}</button><div className="mt-1 flex items-center gap-2 text-xs"><span className="rounded bg-green-700 px-1.5 py-0.5 text-white">★ {product.rating}</span><span className="text-gray-500">{formatINR(product.price)}</span></div></div></div><p className="mt-2 text-xs text-gray-600">A real match from the Krishna Electronics catalogue.</p><button onClick={add} className="mt-2 flex w-full items-center justify-center gap-1 rounded-md bg-orange-500 py-1.5 text-xs font-bold text-white">{added ? <><Check size={13} /> Added</> : <><ShoppingCart size={13} /> Add to Cart</>}</button></div>; }

const CHAT_STORAGE_KEY = "krishna-ai-chat";
const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome-" + Date.now(),
  role: "assistant",
  content: "Hi! 👋 I'm Krishna AI\nI can help you find the right electronics based on your budget and requirements.",
  timestamp: Date.now(),
};

function loadChatHistory(): ChatMessage[] {
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to restore Krishna AI conversation", error);
  }
  return [];
}

function saveChatHistory(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error("Failed to save Krishna AI conversation", error);
  }
}

function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function KrishnaAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatHistory());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [conversationContext, setConversationContext] = useState<ConversationContext>({});
  const [location, setLocation] = useLocation();
  const { addToCart } = useCart();

  // Save messages whenever they change
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  const currentProduct = useMemo(() => {
    const match = location.match(/^\/product\/(\d+)/);
    return match ? products.find((product) => product.id === Number(match[1])) : undefined;
  }, [location]);

  const ask = (value: string) => {
    const clean = value.trim();
    if (!clean) return;

    // Classify intent and extract entities
    const intent = classifyIntent(clean, conversationContext);
    const entities = extractEntities(clean, conversationContext);

    // Update conversation context
    const newContext = updateContext(conversationContext, entities);
    setConversationContext(newContext);

    // Add user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: "user",
      content: clean,
      timestamp: Date.now(),
      intent: intent,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");

    // Generate AI response
    const aiResponse = generateAIResponse(intent, clean, newContext, currentProduct);

    // Add AI message
    const aiMessage: ChatMessage = {
      id: generateMessageId(),
      role: "assistant",
      content: aiResponse.text,
      timestamp: Date.now(),
      productIds: aiResponse.productIds,
      intent: intent,
    };

    setMessages((current) => [...current, aiMessage]);

    // Store last products shown for follow-up context
    if (aiResponse.productIds && aiResponse.productIds.length > 0) {
      setConversationContext((prev) => ({
        ...prev,
        lastProductsShown: aiResponse.productIds,
      }));
    }
  };

  const generateAIResponse = (
    intent: Intent,
    userInput: string,
    context: ConversationContext,
    contextProduct?: Product
  ): { text: string; productIds?: string[] } => {
    // For product recommendations, search for products
    if (intent === "PRODUCT_RECOMMENDATION" || intent === "PRODUCT_SEARCH") {
      const category = context.category;
      let matches = searchProducts(userInput, category);

      const maxBudget = context.budget?.max;
      if (maxBudget !== undefined) {
        matches = matches.filter((product) => product.price <= maxBudget);
      }

      const topMatches = matches.slice(0, 3);

      if (topMatches.length > 0) {
        return {
          text: generateContextualResponse(intent, userInput, context, contextProduct),
          productIds: topMatches.map((p) => p.id.toString()),
        };
      }
    }

    // For other intents, use contextual response
    const response = generateContextualResponse(intent, userInput, context, contextProduct);
    return { text: response };
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    ask(input);
  };

  const quick = (value: string) => {
    const query = value === "Compare Products" ? "Compare the best mobile phones" : value.replace("Find a ", "I need a ");
    ask(query);
  };

  const clearChat = () => {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    setMessages([]);
    setConversationContext({});
    setShowClearConfirm(false);
  };

  const shouldShowWelcome = messages.length === 0;

  // Get products for a message that has productIds
  const getProductsForMessage = (productIds?: string[]): Product[] => {
    if (!productIds) return [];
    return productIds
      .map((id) => products.find((p) => p.id.toString() === id))
      .filter((p): p is Product => p !== undefined);
  };

  return (
    <>
     <button
  onClick={() => setOpen(true)}
  className="flex items-center gap-2"
>
  <Bot size={20} className="text-secondary" />
  <span className="hidden sm:inline">Ask Krishna AI</span>
  <span className="sm:hidden">Krishna AI</span>
</button>

    {open && (
      <div className="fixed inset-x-3 bottom-3 z-[70] flex h-[min(690px,calc(100vh-24px))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[410px]">
        <header className="flex items-center justify-between bg-primary px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-secondary p-2 text-primary">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="font-bold">Krishna AI</h2>
              <p className="text-xs text-gray-300">Your Personal Electronics Assistant</p>
              <p className="mt-1 text-[11px] text-green-300">● Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                aria-label="Clear chat"
                onClick={() => setShowClearConfirm(true)}
                className="rounded-lg p-2 hover:bg-white/20 transition"
                title="Clear conversation"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button aria-label="Close Krishna AI" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 rounded-2xl">
            <div className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-xs">
              <h3 className="font-bold text-gray-900 mb-2">Clear your Krishna AI conversation?</h3>
              <p className="text-sm text-gray-600 mb-4">This action cannot be undone. Your cart and wishlist will not be affected.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={clearChat}
                  className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-bold text-white hover:bg-red-600"
                >
                  Clear Chat
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
          {/* Display welcome message only on first visit */}
          {shouldShowWelcome && (
            <div className="max-w-[90%] whitespace-pre-line rounded-2xl rounded-tl-sm bg-white p-3 text-sm text-gray-700 shadow-sm">
              {WELCOME_MESSAGE.content}
            </div>
          )}

          {/* Display conversation history */}
          {messages.map((message) => {
            if (message.id.startsWith("welcome-")) return null;

            if (message.role === "user") {
              return (
                <div key={message.id} className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-orange-500 p-3 text-sm text-white">
                  {message.content}
                </div>
              );
            }

            // AI message
            const messageProducts = getProductsForMessage(message.productIds);
            return (
              <div key={message.id} className="max-w-[95%] rounded-2xl rounded-tl-sm bg-white p-3 text-sm text-gray-700 shadow-sm">
                {messageProducts.length > 0 ? (
                  <div>
                    <div className="mb-3 flex items-center gap-2 font-bold text-gray-900">
                      <Sparkles size={16} className="text-orange-500" /> {message.content}
                    </div>
                    <div className="space-y-2">
                      {messageProducts.map((product) => (
                        <RecommendationCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-line">{message.content}</p>
                )}
              </div>
            );
          })}

          {/* Show quick actions only if no conversation exists */}
          {messages.length === 0 && (
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => quick(action)}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600"
                >
                  {action}
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="flex gap-2 border-t bg-white p-3">
          <input
            aria-label="Message Krishna AI"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about phones, laptops, TVs..."
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
          <button aria-label="Send message" type="submit" className="rounded-lg bg-orange-500 px-3 text-white">
            <Send size={17} />
          </button>
        </form>
      </div>
    )}
  </>
  );
}
