import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 pt-12 pb-6">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">
              <span className="text-secondary">Krishna</span>Electronics
            </h3>
            <p className="text-sm text-gray-400">
              Your trusted Indian destination for premium electronics, great Indian festival offers, and dependable service.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="hover:text-secondary transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-secondary transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-secondary transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-secondary transition-colors">Home</Link></li>
              <li><Link href="/shop" className="hover:text-secondary transition-colors">Shop All</Link></li>
              <li><Link href="/cart" className="hover:text-secondary transition-colors">My Cart</Link></li>
              <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop?category=Mobiles" className="hover:text-secondary transition-colors">Mobiles & Tablets</Link></li>
              <li><Link href="/shop?category=Laptops" className="hover:text-secondary transition-colors">Laptops & Computers</Link></li>
              <li><Link href="/shop?category=Accessories" className="hover:text-secondary transition-colors">Accessories</Link></li>
              <li><Link href="/shop?category=Home Appliances" className="hover:text-secondary transition-colors">Home Appliances</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 text-secondary" />
                <span>Krishna Electronics<br />Shop No. 182, Dashmesh Market<br />Balongi</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-secondary" />
                <span>+91 98141 93459</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-secondary" />
                <a href="mailto:krishnaelectronics459@gmail.com">krishnaelectronics459@gmail.com</a>
              </li>
              <li className="text-xs text-gray-400">Mon-Sat, 9 AM-6 PM</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-6 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Krishna Electronics. GST included in price. Easy Returns.</p>
        </div>
      </div>
    </footer>
  );
}
