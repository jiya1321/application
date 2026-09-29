import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "wouter";
import { formatINR } from "@/lib/currency";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { isLoggedIn, setRedirectAfterLogin } = useAuth();
  const [, setLocation] = useLocation();

  const handleProceedToCheckout = () => {
    if (!isLoggedIn) {
      setRedirectAfterLogin("/checkout");
      // Trigger auth dialog by dispatching custom event
      window.dispatchEvent(new CustomEvent('open-auth-dialog'));
    } else {
      setLocation("/checkout");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 p-6 rounded-full">
                <ShoppingBag size={48} className="text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/shop">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                  <span className="font-semibold text-gray-700">Items ({items.length})</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear Cart
                  </Button>
                </div>
                
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-white p-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-base font-medium text-gray-900">
                            <Link href={`/product/${item.id}`} className="hover:underline">
                              {item.name}
                            </Link>
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                        </div>
                        <div className="mt-2 text-sm font-bold text-gray-900">{formatINR(item.price)}</div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <div className="flex items-center border rounded-md">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 text-gray-600"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 text-gray-600"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatINR(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE delivery</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST (included)</span>
                    <span>{formatINR(0)}</span>
                  </div>
                  
                  <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg text-gray-900">
                    <span>Total</span>
                    <span>{formatINR(cartTotal)}</span>
                  </div>
                </div>

                <Button size="lg" className="w-full bg-secondary text-primary font-bold hover:bg-secondary/90" onClick={handleProceedToCheckout}>
                  Proceed to Checkout
                </Button>
                
                <div className="mt-4 text-xs text-center text-gray-500">
                  <p>Secure Payments | UPI | Cash on Delivery</p>
                  <p className="mt-1">Credit Card | Debit Card | Net Banking | Wallets</p>
                  <p className="mt-1">No-cost EMI available on eligible products</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
