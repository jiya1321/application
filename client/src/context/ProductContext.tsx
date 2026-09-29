import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, products as defaultProducts } from "@/lib/products";

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => number;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  getProduct: (id: number) => Product | undefined;
  refreshProducts: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);

  // Load products from local storage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem("krishna-products");
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        setProducts(parsed);
      } catch (e) {
        console.error("Failed to parse products", e);
        // If parsing fails, initialize with default products
        initializeDefaultProducts();
      }
    } else {
      // Initialize with default products
      initializeDefaultProducts();
    }
  }, []);

  const initializeDefaultProducts = () => {
    setProducts(defaultProducts);
    localStorage.setItem("krishna-products", JSON.stringify(defaultProducts));
  };

  // Save products to local storage on change
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem("krishna-products", JSON.stringify(products));
    }
  }, [products]);

  const addProduct = (product: Omit<Product, "id">) => {
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    const newProduct: Product = {
      ...product,
      id: newId,
    };
    setProducts(prev => [...prev, newProduct]);
    return newId;
  };

  const updateProduct = (id: number, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, ...updates } : product
      )
    );
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getProduct = (id: number): Product | undefined => {
    return products.find(product => product.id === id);
  };

  const refreshProducts = () => {
    const savedProducts = localStorage.getItem("krishna-products");
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        setProducts(parsed);
      } catch (e) {
        console.error("Failed to parse products", e);
      }
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        refreshProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}