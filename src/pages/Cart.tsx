import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder } from '@/services/orders';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

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
          <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">Please log in or create an account to view your cart and checkout.</p>
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

  const handleCheckout = async () => {
    if (!customerName || !address || !paymentMethod) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all checkout fields.',
        variant: 'destructive',
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: 'Empty cart',
        description: 'Add items to your cart before checking out.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await createOrder(cart, customerName, address, paymentMethod, user?.id);
      clearCart();
      toast({
        title: 'Order placed!',
        description: 'Your order has been successfully placed.',
      });
      navigate('/profile');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
                      {/* Image - Left Side */}
                      <div className="sm:col-span-3">
                        <div className="w-full aspect-square overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>

                      {/* Product Info - Middle */}
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

                        {/* Subtotal */}
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-sm text-muted-foreground">
                            Subtotal: <span className="font-semibold text-foreground">₱{(item.price * item.quantity).toFixed(2)}</span>
                          </p>
                        </div>
                      </div>

                      {/* Controls - Right Side */}
                      <div className="sm:col-span-4 flex flex-row sm:flex-col items-center sm:items-end gap-3 pt-2 sm:pt-0">
                        {/* Quantity Control */}
                        <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-2 border border-border/50 hover:border-primary/30 transition-colors">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-background rounded-lg transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4 text-foreground" />
                          </motion.button>
                          <span className="w-8 text-center font-bold text-foreground text-lg">{item.quantity}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-background rounded-lg transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4 text-foreground" />
                          </motion.button>
                        </div>

                        {/* Delete Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeFromCart(item.id)}
                          className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all hover:shadow-md"
                          aria-label="Remove from cart"
                        >
                          <Trash2 className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Checkout */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="sticky top-24 h-fit"
          >
            <Card className="bg-card border-border shadow-lg">
              <CardHeader className="border-b border-border bg-muted/30">
                <CardTitle className="text-2xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div>
                  <Label htmlFor="name" className="font-semibold text-foreground">Full Name</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-2 bg-background border-border h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="font-semibold text-foreground">Delivery Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City, State"
                    className="mt-2 bg-background border-border h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="payment" className="font-semibold text-foreground">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="mt-2 bg-background border-border h-11">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash on Delivery</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-6 space-y-3 border-t border-border">
                  <div className="flex justify-between text-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold">₱{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="font-bold text-primary text-2xl">₱{total.toFixed(2)}</span>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 mt-4"
                      onClick={handleCheckout}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Place Order'}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
