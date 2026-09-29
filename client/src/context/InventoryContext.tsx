import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/lib/products";

interface InventoryContextType {
  inventory: Record<number, number>;
  updateStock: (productId: number, quantity: number) => void;
  getStock: (productId: number) => number;
  reduceStock: (productId: number, quantity: number) => boolean;
  isAvailable: (productId: number, quantity?: number) => boolean;
  importFromExcel: (data: any[]) => void;
  exportToExcel: () => any[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [inventory, setInventory] = useState<Record<number, number>>({});

  // Load inventory from local storage on mount
  useEffect(() => {
    const savedInventory = localStorage.getItem("krishna-inventory");
    if (savedInventory) {
      try {
        setInventory(JSON.parse(savedInventory));
      } catch (e) {
        console.error("Failed to parse inventory", e);
      }
    }
  }, []);

  // Save inventory to local storage on change
  useEffect(() => {
    localStorage.setItem("krishna-inventory", JSON.stringify(inventory));
  }, [inventory]);

  const updateStock = (productId: number, quantity: number) => {
    if (quantity < 0) {
      console.error("Stock cannot be negative");
      return;
    }
    setInventory((prev) => ({
      ...prev,
      [productId]: quantity,
    }));
    // Update last updated timestamp
    sessionStorage.setItem("krishna-inventory-last-updated", Date.now().toString());
  };

  const getStock = (productId: number): number => {
    return inventory[productId] ?? 0;
  };

  const reduceStock = (productId: number, quantity: number): boolean => {
    const currentStock = getStock(productId);
    if (currentStock < quantity) {
      return false;
    }
    updateStock(productId, currentStock - quantity);
    return true;
  };

  const isAvailable = (productId: number, quantity: number = 1): boolean => {
    return getStock(productId) >= quantity;
  };

  const importFromExcel = (data: any[]) => {
    const newInventory: Record<number, number> = {};
    
    data.forEach((row) => {
      const productId = parseInt(row["Product ID"]);
      const stock = parseInt(row["Stock Quantity"]);
      
      if (!isNaN(productId) && !isNaN(stock)) {
        newInventory[productId] = stock;
      }
    });
    
    setInventory(newInventory);
    // Update last updated timestamp
    sessionStorage.setItem("krishna-inventory-last-updated", Date.now().toString());
  };

  const exportToExcel = (): any[] => {
    return Object.entries(inventory).map(([productId, stock]) => ({
      "Product ID": productId,
      "Stock Quantity": stock,
    }));
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        updateStock,
        getStock,
        reduceStock,
        isAvailable,
        importFromExcel,
        exportToExcel,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
