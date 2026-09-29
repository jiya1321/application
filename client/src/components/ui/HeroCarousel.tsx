import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/modern_electronics_store_hero_banner.png";

const slides = [
  {
    id: 1,
    title: "Next Gen Smartphones",
    subtitle: "Upgrade today with free delivery across India and secure UPI payments.",
    image: heroImage,
    cta: "Shop Mobiles",
    link: "/shop?category=Mobiles",
    color: "from-blue-600/80 to-purple-600/80"
  },
  {
    id: 2,
    title: "Professional Laptops",
    subtitle: "Power your productivity with bank offers and no-cost EMI.",
    image: heroImage, // Reusing for now, in real app would use specific slide
    cta: "Shop Laptops",
    link: "/shop?category=Laptops",
    color: "from-slate-800/90 to-black/80"
  },
  {
    id: 3,
    title: "Home Automation",
    subtitle: "Smart appliances with Cash on Delivery and easy returns.",
    image: heroImage, 
    cta: "Explore Appliances",
    link: "/shop?category=Home Appliances",
    color: "from-emerald-600/80 to-teal-600/80"
  }
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[current].image})` }}
          />
          
          {/* Overlay Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slides[current].color} opacity-75`} />
          
          {/* Content */}
          <div className="relative container mx-auto h-full flex flex-col justify-center px-4 md:px-12 text-white">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-6xl font-bold mb-2 md:mb-4 max-w-2xl"
            >
              {slides[current].title}
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl mb-6 max-w-lg text-gray-100"
            >
              {slides[current].subtitle}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link href={slides[current].link}>
                <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 font-bold rounded-full px-8">
                  {slides[current].cta}
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              index === current ? "bg-white w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
