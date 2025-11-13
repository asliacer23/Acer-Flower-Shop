import { Flower2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Flower2 className="h-5 w-5 text-primary" />
              <span className="font-bold">Petal Swift</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your premier destination for fresh, beautiful flowers delivered with care.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/shop" className="hover:text-foreground">Shop</a></li>
              <li><a href="/about" className="hover:text-foreground">About Us</a></li>
              <li><a href="/contact" className="hover:text-foreground">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: hello@petalswift.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Hours: Mon-Sat 9AM-6PM</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Petal Swift. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
