import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, Phone, MapPin, User, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchBar } from "@/components/layout/SearchBar";
import { AuthDialog } from "@/components/auth/AuthDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import React from "react";

export function Navbar() {
  const { cartCount } = useCart();
  const { user, isLoggedIn, logout, setRedirectAfterLogin } = useAuth();
  const [location, setLocation] = useLocation();
  const [pinCode, setPinCode] = useState("160036");
  const [pinError, setPinError] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const handleAuthClick = (redirectPath?: string) => {
    if (redirectPath) {
      setRedirectAfterLogin(redirectPath);
    }
    setIsAuthDialogOpen(true);
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  // Listen for custom event to open auth dialog
  useEffect(() => {
    const handleOpenAuthDialog = () => {
      setIsAuthDialogOpen(true);
    };

    window.addEventListener('open-auth-dialog', handleOpenAuthDialog);
    return () => {
      window.removeEventListener('open-auth-dialog', handleOpenAuthDialog);
    };
  }, []);

  const handlePinCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pinCode)) {
      setPinError("Enter a valid 6-digit PIN");
      return;
    }
    setPinError("");
  };

  const NavLinks = () => {
    return (
      <>
        <Link href="/" className={`text-sm font-medium transition-colors hover:text-secondary ${location === "/" ? "text-secondary" : "text-white"}`}>
          Home
        </Link>
        <Link href="/products" className={`text-sm font-medium transition-colors hover:text-secondary ${location.startsWith("/products") ? "text-secondary" : "text-white"}`}>
          Shop All
        </Link>
        <Link href="/orders" className={`text-sm font-medium transition-colors hover:text-secondary ${location === "/orders" ? "text-secondary" : "text-white"}`}>
          Orders
        </Link>
        <Link href="/contact#contact-section" className={`text-sm font-medium transition-colors hover:text-secondary ${location === "/contact" ? "text-secondary" : "text-white"}`}>
          Contact Us
        </Link>
      </>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-primary shadow-md">
        {/* Top Bar - Contact Info */}
        <div className="hidden md:flex w-full bg-slate-900 py-1 px-4 justify-between items-center text-[11px] text-gray-300">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Phone size={12} /> +91 98141 93459</span>
            <form onSubmit={handlePinCode} className="flex items-center gap-1" title={pinError || "Deliver to an Indian PIN code"}>
              <MapPin size={12} />
              <label htmlFor="pin-code">Deliver to</label>
              <input id="pin-code" value={pinCode} onChange={(e) => { setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setPinError(""); }} className="w-16 bg-transparent border-b border-gray-500 text-white outline-none" inputMode="numeric" maxLength={6} aria-label="Indian PIN code" aria-invalid={Boolean(pinError)} />
              {pinError && <span className="text-red-300">!</span>}
            </form>
          </div>
          <div className="flex gap-4">
            <span>FREE delivery across India</span>
            <span>UPI | COD | Secure Payments</span>
          </div>
        </div>

        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-white tracking-tight mr-6">
            <span className="text-secondary">Krishna</span>Electrons
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 mx-4"><SearchBar /></div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLinks />
            
            {/* Account Section */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:text-secondary hover:bg-transparent flex items-center gap-2 px-3">
                  <User className="h-5 w-5" />
                  <span className="text-sm">
                    {isLoggedIn ? `Hello, ${user?.name?.split(' ')[0]}` : "Hello, Sign in"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isLoggedIn ? (
                  <>
                    <DropdownMenuItem onClick={() => setLocation("/account")}>
                      <User className="mr-2 h-4 w-4" />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/orders")}>
                      Your Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => handleAuthClick()}>
                      Sign In
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAuthClick()}>
                      Create Account
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-white hover:text-secondary hover:bg-transparent">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-primary">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu & Cart */}
          <div className="flex md:hidden items-center gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-white hover:bg-transparent">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-primary">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-transparent">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-primary text-white border-l-slate-700">
                <div className="flex flex-col gap-6 mt-8">
                  <SearchBar mobile />
                  
                  {/* Mobile Account Section */}
                  <div className="border-t border-b border-slate-700 py-4">
                    {isLoggedIn ? (
                      <div className="space-y-3">
                        <p className="text-lg font-medium">Hello, {user?.name?.split(' ')[0]}</p>
                        <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm hover:text-secondary">Account</Link>
                        <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm hover:text-secondary">Your Orders</Link>
                        <Button variant="ghost" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-red-400 hover:text-red-300 p-0 h-auto text-sm">Logout</Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-lg font-medium">Hello, Sign in</p>
                        <Button variant="ghost" onClick={() => { handleAuthClick(); setIsMobileMenuOpen(false); }} className="text-secondary hover:text-secondary/80 p-0 h-auto text-sm">Sign In</Button>
                        <Button variant="ghost" onClick={() => { handleAuthClick(); setIsMobileMenuOpen(false); }} className="text-secondary hover:text-secondary/80 p-0 h-auto text-sm">Create Account</Button>
                      </div>
                    )}
                  </div>

                  <nav className="flex flex-col gap-4">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-secondary">Home</Link>
                    <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-secondary">Shop All</Link>
                    <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-secondary">Orders</Link>
                    <Link href="/contact#contact-section" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-secondary">Contact Us</Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Mobile Categories Bar (Optional, similar to Amazon app) */}
        <div className="md:hidden flex overflow-x-auto bg-slate-800 py-2 px-4 gap-4 text-xs text-white scrollbar-hide">
          <Link href="/products/mobiles" className="whitespace-nowrap">Mobiles</Link>
          <Link href="/products/laptops" className="whitespace-nowrap">Laptops</Link>
          <Link href="/products/accessories" className="whitespace-nowrap">Accessories</Link>
          <Link href="/products/televisions" className="whitespace-nowrap">Televisions</Link>
          <Link href="/products/mixer-grinder" className="whitespace-nowrap">Mixer Grinder</Link>
          <Link href="/products/irons" className="whitespace-nowrap">Irons</Link>
          <Link href="/products/chimney" className="whitespace-nowrap">Chimney</Link>
          <Link href="/products/gas-stoves" className="whitespace-nowrap">Gas Stoves</Link>
        </div>
      </header>
      
      <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
    </>
  );
}
