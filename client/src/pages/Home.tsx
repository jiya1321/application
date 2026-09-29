import { HeroCarousel } from "@/components/ui/HeroCarousel";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { categories } from "@/lib/products";
import { useProducts } from "@/context/ProductContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { products } = useProducts();
  const trendingProducts = products.filter(p => p.isBestSeller || p.isNew).slice(0, 4);
  const dealProducts = products.slice(4, 8);
  const offerProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <HeroCarousel />
        
        {/* Categories Section */}
        <section className="container mx-auto px-4 md:px-6 py-8 -mt-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat.name} href={`/products/${cat.name.toLowerCase().replaceAll(" ", "-")}`}>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer flex flex-col items-center text-center h-full">
                  <h3 className="font-bold text-lg mb-2 text-primary">{cat.name}</h3>
                  <div className="flex-1 flex items-center justify-center w-full h-32 mb-4">
                    <img src={cat.image} alt={cat.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="text-xs text-blue-600 hover:underline">Shop Now</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest Offers Section */}
        <section className="container mx-auto px-4 md:px-6 py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">🔥 Latest Offers</h2>
            <Link href="/products">
              <Button variant="link" className="text-blue-600">View All Offers <ArrowRight className="ml-1 w-4 h-4" /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {offerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Trending Section */}
        <section className="container mx-auto px-4 md:px-6 py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Trending Now</h2>
            <Link href="/products">
              <Button variant="link" className="text-blue-600">View All <ArrowRight className="ml-1 w-4 h-4" /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Banner/Ad Section */}
        <section className="w-full bg-primary py-16 my-8">
          <div className="container mx-auto px-4 md:px-6 text-center text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Great Indian Festival Offers</h2>
            <p className="text-xl mb-8 text-gray-300">Big savings on electronics with bank offers and no-cost EMI.</p>
            <Link href="/products">
              <Button size="lg" className="bg-secondary text-primary font-bold hover:bg-secondary/90 rounded-full px-8">
                Check Deals
              </Button>
            </Link>
          </div>
        </section>

        {/* Top Deals Section */}
        <section className="container mx-auto px-4 md:px-6 py-12 pb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Top Deals</h2>
            <Link href="/products">
              <Button variant="link" className="text-blue-600">View All <ArrowRight className="ml-1 w-4 h-4" /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {dealProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
