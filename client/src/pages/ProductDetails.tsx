import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useInventory } from "@/context/InventoryContext";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Star, Truck, Shield, RotateCcw, Check, AlertCircle, ImageOff } from "lucide-react";
import { useEffect, useState } from "react";
import { formatINR } from "@/lib/currency";

export default function ProductDetails() {
  const { products } = useProducts();
  const [match, params] = useRoute("/product/:id");
  const { addToCart } = useCart();
  const { getStock, isAvailable } = useInventory();
  const { isLoggedIn, setRedirectAfterLogin, setBuyNowProduct } = useAuth();
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageError, setImageError] = useState(false);

  const product = match ? products.find(p => p.id === parseInt(params.id)) : null;
  const stock = product ? getStock(product.id) : 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  useEffect(() => {
    if (product) {
      const recent = JSON.parse(localStorage.getItem("krishna-recently-viewed") || "[]") as number[];
      localStorage.setItem("krishna-recently-viewed", JSON.stringify([product.id, ...recent.filter((id) => id !== product.id)].slice(0, 10)));
      setSelectedImage(0);
    }
  }, [product?.id]);

  if (!match) return null;

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Button onClick={() => setLocation("/shop")}>Back to Shop</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAvailable(product.id, quantity)) {
      alert(`Only ${stock} items are available.`);
      return;
    }
    for(let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const handleBuyNow = () => {
    if (!isAvailable(product.id, quantity)) {
      alert(`Only ${stock} items are available.`);
      return;
    }
    handleAddToCart();
    if (!isLoggedIn) {
      setRedirectAfterLogin("/checkout");
      setBuyNowProduct(product);
      window.dispatchEvent(new CustomEvent('open-auth-dialog'));
    } else {
      setLocation("/checkout");
    }
  };

  const productImages = product.images?.length ? product.images : [product.image];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery Section */}
          <div className="flex gap-4">
            {/* Thumbnails - Desktop: Vertical on left, Mobile: Horizontal below */}
            <div className="hidden md:flex flex-col gap-2 order-1">
              {productImages.slice(0, 3).map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 border-2 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                    selectedImage === index 
                      ? 'border-blue-600 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 bg-white p-8 border rounded-xl flex items-center justify-center sticky top-24 h-fit order-2 md:order-2">
              {imageError ? (
                <div className="flex flex-col items-center justify-center bg-gray-100 w-full h-[500px] rounded-lg">
                  <ImageOff className="w-16 h-16 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Image not available</p>
                </div>
              ) : (
                <img 
                  src={productImages[selectedImage]} 
                  alt={product.name} 
                  className="max-w-full max-h-[500px] object-contain hover:scale-105 transition-transform duration-500"
                  onError={() => setImageError(true)}
                />
              )}
            </div>

            {/* Mobile Thumbnails - Horizontal scroll */}
            <div className="flex md:hidden gap-2 overflow-x-auto order-3 pb-2">
              {productImages.slice(0, 3).map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 border-2 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                    selectedImage === index 
                      ? 'border-blue-600 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-blue-600 font-medium hover:underline cursor-pointer">Visit the {product.category} Store</span>
                <div className="flex items-center gap-1 text-secondary">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                      className={i < Math.floor(product.rating) ? "text-secondary" : "text-gray-300"}
                    />
                  ))}
                  <span className="text-gray-500 ml-1">{product.rating} ({product.reviews} ratings)</span>
                </div>
              </div>
            </div>

            <div className="border-t border-b py-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">{formatINR(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-gray-500 line-through">{formatINR(product.originalPrice)}</span>
                    <span className="text-sm font-semibold text-green-600">{Math.round((1 - product.price / product.originalPrice) * 100)}% off</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">GST included in price.</p>
              
              {/* Stock Status */}
              {isOutOfStock && (
                <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle size={20} />
                  <span className="font-semibold">Out of Stock</span>
                </div>
              )}
              {isLowStock && !isOutOfStock && (
                <div className="mt-3 flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg">
                  <AlertCircle size={20} />
                  <span className="font-semibold">Only {stock} left in stock</span>
                </div>
              )}
              {!isOutOfStock && !isLowStock && (
                <div className="mt-3 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <Check size={20} />
                  <span className="font-semibold">In Stock ({stock} available)</span>
                </div>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed text-lg">
              {product.description}
            </p>
              <p className="text-sm text-gray-600">No-cost EMI available. From {formatINR(Math.ceil(product.price / 12))}/month for 12 months. ₹0 processing fee.</p>

            {/* Specs Table */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-3">Technical Specifications</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="contents">
                    <span className="text-gray-500 font-medium">{key}</span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 mb-4">
                <label htmlFor="qty" className="font-medium text-gray-700">Quantity:</label>
                <select 
                  id="qty" 
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="border rounded-md p-2 w-20"
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? (
                    <option value={0}>0</option>
                  ) : (
                    Array.from({ length: Math.min(10, stock) }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))
                  )}
                </select>
                {stock > 0 && stock < 10 && (
                  <span className="text-sm text-orange-600">(Max {stock} available)</span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleAddToCart}
                  size="lg" 
                  className="flex-1 bg-secondary text-primary hover:bg-secondary/90 font-bold rounded-full"
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </Button>
                <Button 
                  onClick={handleBuyNow}
                  size="lg" 
                  className="flex-1 bg-orange-600 text-white hover:bg-orange-700 font-bold rounded-full"
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? "Unavailable" : "Buy Now"}
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 text-center text-xs text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-full"><Truck size={20} className="text-primary"/></div>
                <span>Free Delivery across India</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-full"><RotateCcw size={20} className="text-primary"/></div>
                <span>Easy Returns</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-full"><Shield size={20} className="text-primary"/></div>
                <span>2 Year Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
