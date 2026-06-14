import { Mail, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <Logo to={null} size="md" />
          <p className="mt-3 opacity-75 leading-relaxed">
            India's smart shopping platform — millions of products, intelligent recommendations and lightning-fast delivery.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-saffron tracking-wide">ABOUT</h4>
          <ul className="space-y-2 opacity-80">
            <li>Contact Us</li><li>About Us</li><li>Careers</li><li>Press</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-saffron tracking-wide">HELP</h4>
          <ul className="space-y-2 opacity-80">
            <li>Payments</li><li>Shipping</li><li>Returns</li><li>FAQ</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-saffron tracking-wide">CONTACT</h4>
          <ul className="space-y-2 opacity-80">
            <li className="flex items-center gap-2"><Mail size={14}/> support@apnacart.in</li>
            <li className="flex items-center gap-2"><Phone size={14}/> +91 98765 43210</li>
            <li className="flex items-center gap-2"><MapPin size={14}/> Bengaluru, India</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-xs opacity-70 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} ApnaCart. All rights reserved.</span>
          <span>Crafted with care in India.</span>
        </div>
      </div>
    </footer>
  );
}
