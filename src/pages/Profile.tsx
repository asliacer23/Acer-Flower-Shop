import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, Heart, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Order, Product } from '@/types';
import { getOrders } from '@/services/orders';
import { getWishlistItems, removeFromWishlist } from '@/services/wishlist';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    getOrders(user.id).then(setOrders);
    loadWishlist();
  }, [user, navigate]);

  const loadWishlist = async () => {
    if (!user?.id) return;
    setLoadingWishlist(true);
    const items = await getWishlistItems(user.id);
    setWishlist(items);
    setLoadingWishlist(false);
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user?.id) return;

    try {
      const success = await removeFromWishlist(user.id, productId);
      if (success) {
        setWishlist(wishlist.filter(item => item.id !== productId));
        toast({
          title: 'Removed from wishlist',
          description: 'Item has been removed from your wishlist.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to remove from wishlist',
        variant: 'destructive',
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    try {
      addToCart(product);
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/auth');
    }
  };

  if (!user) return null;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <PageWrapper>
      <div className="container py-12">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-6 mb-12 p-8 bg-gradient-to-r from-primary/10 to-primary/5 border border-border rounded-xl"
          >
            <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <User className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-1">{user.name}</h1>
              <p className="text-muted-foreground text-lg">{user.email}</p>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg h-12">
                <TabsTrigger value="orders" className="data-[state=active]:bg-background rounded-md font-semibold">
                  <Package className="h-5 w-5 mr-2" />
                  Orders ({orders.length})
                </TabsTrigger>
                <TabsTrigger value="wishlist" className="data-[state=active]:bg-background rounded-md font-semibold">
                  <Heart className="h-5 w-5 mr-2" />
                  Wishlist ({wishlist.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="space-y-4 mt-8">
                {orders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-card border-border">
                      <CardContent className="py-12 text-center">
                        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground text-lg">No orders yet</p>
                        <p className="text-muted-foreground mb-6">Start shopping to see your orders here!</p>
                        <Link to="/shop">
                          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                            Continue Shopping
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order, i) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                          <CardHeader className="pb-4 border-b border-border">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-xl text-foreground">Order #{order.id.slice(0, 8)}</CardTitle>
                              <Badge variant={getStatusColor(order.status)} className="text-sm">
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              📅 {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm border-b border-border pb-2">
                                  <div>
                                    <p className="font-medium text-foreground">{item.name}</p>
                                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                  </div>
                                  <span className="font-bold text-primary">₱{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                              <div className="pt-4 flex justify-between font-bold text-lg">
                                <span className="text-foreground">Total</span>
                                <span className="text-primary text-xl">₱{order.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="wishlist" className="mt-8">
                {loadingWishlist ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-card border-border">
                      <CardContent className="py-12 text-center text-muted-foreground">
                        Loading wishlist...
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : wishlist.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-card border-border">
                      <CardContent className="py-12 text-center">
                        <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground text-lg">Your wishlist is empty</p>
                        <p className="text-muted-foreground mb-6">Add items to your wishlist to see them here!</p>
                        <Link to="/shop">
                          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                            Explore Products
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((product, i) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="bg-card border-border overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-square overflow-hidden bg-muted">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="object-cover w-full h-full hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <CardContent className="p-5 space-y-3">
                            <div>
                              <h3 className="font-bold text-lg text-foreground">{product.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {product.description}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-primary">
                                ₱{product.price.toFixed(2)}
                              </span>
                              <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                                {product.stock} stock
                              </span>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                                  onClick={() => handleAddToCart(product)}
                                  disabled={product.stock === 0}
                                >
                                  Add to Cart
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleRemoveFromWishlist(product.id)}
                                  className="border-border hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors"
                                >
                                  <X className="h-5 w-5" />
                                </Button>
                              </motion.div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
