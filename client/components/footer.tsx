import { Store } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Store className="h-5 w-5 text-primary" />
              <span>ShopHub</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your one-stop destination for amazing products at unbeatable prices.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-foreground transition-colors">Products</Link></li>
              <li><Link href="/orders" className="hover:text-foreground transition-colors">My Orders</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-foreground transition-colors">Register</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Contact Us</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">FAQ</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Shipping Info</span></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ShopHub. Built with ❤️ using Spring Boot & Next.js</p>
        </div>
      </div>
    </footer>
  );
}
