import { Product } from "@/lib/products";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useInventory } from "@/context/InventoryContext";
import { Star, ShoppingCart, ImageOff } from "lucide-react";
import { Link, useLocation } from "wouter";
import { formatINR } from "@/lib/currency";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { getStock, isAvailable } = useInventory();
  const [, setLocation] = useLocation();
  const [imageError, setImageError] = useState(false);

  const stock = getStock(product.id);
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAvailable(product.id)) {
      addToCart(product);
      setLocation("/cart");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAvailable(product.id)) {
      addToCart(product);
    }
  };

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="h-full overflow-hidden group transition-all duration-300 hover:shadow-lg border-transparent hover:border-gray-200 cursor-pointer bg-white">
        <div className="relative aspect-square p-4 bg-white flex items-center justify-center overflow-hidden">
          {isOutOfStock && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm z-10">
              OUT OF STOCK
            </span>
          )}
          {product.isNew && !isOutOfStock && (
            <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm z-10">
              NEW
            </span>
          )}
          {product.isBestSeller && !isOutOfStock && (
            <span className="absolute top-2 right-2 bg-secondary text-primary text-[10px] font-bold px-2 py-0.5 rounded-sm z-10">
              BESTSELLER
            </span>
          )}
              {imageError ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <ImageOff className="w-12 h-12 text-gray-400" />
                </div>
              ) : (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-110"
                  onError={() => setImageError(true)}
                />
              )}
        </div>
        
        <CardContent className="p-4">
          <div className="text-xs text-gray-500 mb-1">{product.category}</div>
          <h3 className="font-medium text-base leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors h-10">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-secondary">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                  className={i < Math.floor(product.rating) ? "text-secondary" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviews})</span>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">{formatINR(product.price)}</span>
            {product.originalPrice && (
              <>
                <span className="text-xs text-gray-500 line-through">{formatINR(product.originalPrice)}</span>
                <span className="text-xs font-semibold text-green-600">{Math.round((1 - product.price / product.originalPrice) * 100)}% off</span>
              </>
            )}
          </div>
          
          {isLowStock && (
            <p className="text-xs font-semibold text-orange-600">Only {stock} left</p>
          )}
          {isOutOfStock && (
            <p className="text-xs font-semibold text-red-600">Out of Stock</p>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button 
            onClick={handleAddToCart}
            variant="outline" 
            className="flex-1 h-9 text-xs"
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
          <Button 
            onClick={handleBuyNow}
            className="flex-1 h-9 text-xs bg-secondary text-primary hover:bg-secondary/90 border-none"
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Unavailable" : "Buy Now"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
