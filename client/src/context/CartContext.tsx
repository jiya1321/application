import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/lib/products";
import { useInventory } from "./InventoryContext";
import { useProducts } from "./ProductContext";
import { useToast } from "@/hooks/use-toast";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { getStock, isAvailable } = useInventory();
  const { getProduct } = useProducts();

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("krishna-cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save cart to local storage on change
  useEffect(() => {
    localStorage.setItem("krishna-cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product) => {
    // Check if product is available
    if (!isAvailable(product.id)) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
        variant: "destructive"
      });
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const currentStock = getStock(product.id);
      
      if (existing) {
        // Check if adding one more would exceed stock
        if (existing.quantity >= currentStock) {
          toast({
            title: "Stock Limit Reached",
            description: `Only ${currentStock} items of ${product.name} are available.`,
            variant: "destructive"
          });
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
    toast({
      title: "Removed from Cart",
      description: "Item removed successfully.",
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const currentStock = getStock(productId);
    
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    if (quantity > currentStock) {
      toast({
        title: "Stock Limit Reached",
        description: `Only ${currentStock} items are available.`,
        variant: "destructive"
      });
      return;
    }
    
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
