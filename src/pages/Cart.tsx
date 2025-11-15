import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle bulk checkout
  const handleCheckoutAll = () => {
    navigate('/checkout');
  };

  // Redirect to login if not logged in
  if (!user?.email) {
    return (
      <PageWrapper>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container py-20 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <ShoppingBag className="h-20 w-20 mx-auto mb-6 text-primary opacity-80" />
          </motion.div>
          <h2 className="text-4xl font-bold mb-3 text-foreground">You must be logged in</h2>
          <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
            Please log in or create an account to view your cart and checkout.
          </p>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-11"
          >
            Log In / Sign Up
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </PageWrapper>
    );
  }

  if (cart.length === 0) {
    return (
      <PageWrapper>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container py-20 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <ShoppingBag className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-50" />
          </motion.div>
          <h2 className="text-4xl font-bold mb-3 text-foreground">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8 text-lg">Add some beautiful flowers to get started!</p>
          <Link to="/shop">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-11">
              Continue Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container py-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold mb-2 text-foreground"
        >
          Shopping Cart
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-muted-foreground text-lg mb-10"
        >
          {cart.length} item{cart.length !== 1 ? 's' : ''} ready for checkout
        </motion.p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-4"
          >
            {cart.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="bg-gradient-to-br from-card to-card/90 border-border hover:border-primary/50 hover:shadow-md transition-all overflow-hidden">
                  <CardContent className="p-4 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 md:gap-6 items-start">
                      {/* Image */}
                      <div className="sm:col-span-3">
                        <div className="w-full aspect-square overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="sm:col-span-5 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-base md:text-lg text-foreground mb-1 line-clamp-2">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{item.category}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                              ₱{item.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground">per item</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-sm text-muted-foreground">
                            Subtotal:{' '}
                            <span className="font-semibold text-foreground">
                              ₱{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="sm:col-span-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2 justify-between">
                          <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-2 border border-border/50 hover:border-primary/30 transition-colors">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 hover:bg-background rounded-lg transition-colors"
                            >
                              <Minus className="h-4 w-4 text-foreground" />
                            </motion.button>

                            <span className="w-8 text-center font-bold text-foreground text-lg">{item.quantity}</span>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 hover:bg-background rounded-lg transition-colors"
                            >
                              <Plus className="h-4 w-4 text-foreground" />
                            </motion.button>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeFromCart(item.id)}
                            className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all hover:shadow-md"
                          >
                            <Trash2 className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="sticky top-24 h-fit"
          >
            <Card className="bg-gradient-to-br from-card to-card/90 border-border shadow-lg">
              <CardContent className="p-6 space-y-5">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">Order Summary</h3>
                </div>

                <div className="space-y-3 pb-4 border-b border-border">
                  <div className="flex justify-between text-foreground">
                    <span>Subtotal ({cart.length} items)</span>
                    <span className="font-semibold">
                      ₱{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary text-2xl">
                      ₱{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12"
                    onClick={handleCheckoutAll}
                  >
                    Checkout All Items
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>

                <p className="text-xs text-muted-foreground text-center">
                  Or click "Place Order" on a product page to checkout a single item
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
