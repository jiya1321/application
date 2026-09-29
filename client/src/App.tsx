import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { InventoryProvider } from "@/context/InventoryContext";
import { ProductProvider } from "@/context/ProductContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Contact from "@/pages/Contact";
import ProductListing from "@/pages/ProductListing";
import Account from "@/pages/Account";
import Orders from "@/pages/Orders";
import AdminLogin from "@/pages/AdminLogin";
import AdminInventory from "@/pages/Admin";
import { KrishnaAI } from "@/components/ai/KrishnaAI";
import { initializeInventory } from "@/lib/products";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/products/:category" component={ProductListing} />
      <Route path="/products" component={ProductListing} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/account" component={Account} />
      <Route path="/orders" component={Orders} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/inventory" component={AdminInventory} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    initializeInventory();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProductProvider>
          <InventoryProvider>
            <CartProvider>
              <Router />
              <KrishnaAI />
              <Toaster />
            </CartProvider>
          </InventoryProvider>
        </ProductProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
