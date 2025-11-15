import { Link } from 'react-router-dom';
import { ShoppingCart, User, Moon, Sun, Flower2, Menu, X, ChevronDown } from 'lucide-react';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  const menuVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: 'auto', opacity: 1, transition: { duration: 0.3 } }
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-lg dark:shadow-2xl"
    >
      <div className="container flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Brand - Premium Logo */}
        <Link to="/" className="flex items-center gap-3 group relative">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300" />
            <Flower2 className="h-7 w-7 text-primary relative z-10 font-bold" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">Flowerist</span>
            <span className="text-[10px] text-muted-foreground">Premium Blooms</span>
          </div>
        </Link>

        {/* Desktop Navigation - Premium */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: '/', label: 'Home' },
            { href: '/shop', label: 'Shop' }
          ].map((link) => (
            <Link key={link.href} to={link.href}>
              <motion.div
                whileHover={{ y: -2 }}
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                {link.label}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-primary"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </Link>
          ))}
          
          {user?.role === 'admin' && (
            <Link to="/admin">
              <motion.div
                whileHover={{ y: -2 }}
                className="px-4 py-2 text-sm font-medium text-primary transition-colors relative group"
              >
                Admin Panel
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-primary"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle - Enhanced */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="relative hover:bg-accent/10 transition-colors rounded-full"
            >
              <AnimatePresence mode="wait">
                {theme === 'light' ? (
                  <motion.div 
                    key="moon" 
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon className="h-5 w-5 text-primary" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="sun" 
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun className="h-5 w-5 text-yellow-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* Cart - Premium Badge */}
          <Link to="/cart">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-accent/10 transition-colors rounded-full"
              >
                <ShoppingCart className="h-5 w-5 text-primary" />
                <AnimatePresence>
                  {cart.length > 0 && (
                    <motion.span
                      initial={{ scale: 0, top: -8, right: -8 }}
                      animate={{ scale: 1, top: -8, right: -8 }}
                      exit={{ scale: 0 }}
                      className="absolute bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                    >
                      {cart.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </Link>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setDropdownOpen(true)}
                  onHoverEnd={() => setDropdownOpen(false)}
                  className="relative"
                >
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="relative hover:bg-accent/10 transition-colors rounded-full"
                  >
                    <User className="h-5 w-5 text-primary" />
                  </Button>
                  
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 glass rounded-xl py-2 shadow-2xl"
                      >
                        <Link to="/profile" className="block px-4 py-2 text-sm text-foreground hover:text-primary transition-colors">
                          Profile
                        </Link>
                        <button
                          onClick={signOut}
                          className="w-full text-left px-4 py-2 text-sm text-foreground hover:text-destructive transition-colors"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            ) : (
              <Link to="/auth">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    className="gradient-primary text-primary-foreground font-semibold rounded-full px-6"
                  >
                    Sign In
                  </Button>
                </motion.div>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden"
          >
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-accent/10 transition-colors rounded-full"
              onClick={() => setOpen(!open)}
            >
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <X className="h-6 w-6 text-primary" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <Menu className="h-6 w-6 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu - Premium */}
      <AnimatePresence>
        {open && (
          <motion.nav
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="md:hidden bg-card/50 backdrop-blur-lg border-t border-border/50 overflow-hidden"
          >
            <div className="container px-4 py-4 space-y-3">
              {[
                { href: '/', label: 'Home' },
                { href: '/shop', label: 'Shop' }
              ].map((link) => (
                <motion.div
                  key={link.href}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2 text-foreground hover:text-primary hover:bg-accent/10 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {user?.role === 'admin' && (
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2 text-primary hover:bg-accent/10 rounded-lg transition-colors font-medium"
                  >
                    Admin Panel
                  </Link>
                </motion.div>
              )}

              <div className="border-t border-border/50 pt-3 mt-3">
                {user ? (
                  <div className="space-y-2">
                    <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-foreground hover:text-primary hover:bg-accent/10 rounded-lg transition-colors"
                      >
                        <User className="h-4 w-4" /> Profile
                      </Link>
                    </motion.div>
                    <motion.button
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { signOut(); setOpen(false); }}
                      className="w-full text-left px-4 py-2 text-destructive hover:bg-accent/10 rounded-lg transition-colors"
                    >
                      Sign Out
                    </motion.button>
                  </div>
                ) : (
                  <Link to="/auth" onClick={() => setOpen(false)}>
                    <Button className="w-full gradient-primary text-primary-foreground font-semibold">
                      Sign In
                    </Button>
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

