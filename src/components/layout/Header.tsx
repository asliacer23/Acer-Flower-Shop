import { Link } from 'react-router-dom';
import { ShoppingCart, User, Moon, Sun, Flower2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { cart } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <Flower2 className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Petal Swift</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/shop" className="text-sm font-medium hover:text-primary transition-colors">
            Shop
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
              Admin
            </Link>
          )}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {/* Cart */}
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center"
                >
                  {cart.length}
                </motion.span>
              )}
            </Button>
          </Link>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Slide Menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background border-t"
          >
            <div className="flex flex-col p-4 gap-4 text-sm">

              <Link to="/" onClick={() => setOpen(false)}>
                Home
              </Link>

              <Link to="/shop" onClick={() => setOpen(false)}>
                Shop
              </Link>

              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setOpen(false)}>
                  Admin
                </Link>
              )}

              <div className="border-t pt-4">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <Link to="/profile" onClick={() => setOpen(false)}>
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5" /> Profile
                      </div>
                    </Link>

                    <Button variant="outline" onClick={signOut}>
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth" onClick={() => setOpen(false)}>
                    <Button className="w-full">Sign In</Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
