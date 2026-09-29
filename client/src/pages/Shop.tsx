import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { useProducts } from "@/context/ProductContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { formatINR } from "@/lib/currency";

export default function Shop() {
  const { products } = useProducts();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");

  const [filteredProducts, setFilteredProducts] = useState(products);
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const allCategories = Array.from(new Set(products.map(p => p.category)));

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    } else {
      setSelectedCategories([]);
    }
  }, [categoryParam]);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  useEffect(() => {
    let result = products;

    // Filter by Search
    if (searchParam) {
      const query = searchParam.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Filter by Category
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Filter by Price
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    setFilteredProducts(result);
  }, [selectedCategories, priceRange, searchParam, products]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold mb-4 text-lg">Categories</h3>
        <div className="space-y-3">
          {allCategories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox 
                id={category} 
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label htmlFor={category} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-lg">Price Range</h3>
        <div className="px-2">
          <Slider
            defaultValue={[0, 200000]}
            max={200000}
            step={1000}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatINR(priceRange[0])}</span>
            <span>{formatINR(priceRange[1])}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {searchParam ? `Search Results for "${searchParam}"` : "Shop All Products"}
          </h1>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter size={16} /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden md:block w-64 bg-white p-6 rounded-lg shadow-sm h-fit sticky top-24">
            <FilterContent />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-4 text-sm text-gray-500">
              Showing {filteredProducts.length} products
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-lg">
                <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search query.</p>
                  <Button onClick={() => {setSelectedCategories([]); setPriceRange([0, 200000]); window.history.pushState({}, '', '/shop');}}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
