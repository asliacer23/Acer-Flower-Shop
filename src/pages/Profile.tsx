import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, Heart, X, ArrowRight, ShoppingBag, MapPin, ChevronDown, Star, Edit2 } from 'lucide-react';
import { AddReviewModal } from '@/components/reviews/AddReviewModal';
import { EditReviewModal } from '@/components/reviews/EditReviewModal';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ReviewList } from '@/components/reviews/ReviewList';
import { reviewService } from '@/services/reviews';
import { supabase } from '@/lib/supabase';
import { ReviewWithUserInfo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Order, Product, Address } from '@/types';
import { getOrders } from '@/services/orders';
import { getWishlistItems, removeFromWishlist } from '@/services/wishlist';
import { addressService } from '@/services/addresses';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const [productReviews, setProductReviews] = useState<{ [key: string]: ReviewWithUserInfo[] }>({});
  const [showEditReviewModal, setShowEditReviewModal] = useState(false);
  const [selectedReviewForEdit, setSelectedReviewForEdit] = useState<ReviewWithUserInfo | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setProfileName(user.name);
    loadProfileData();
    getOrders(user.id).then(setOrders);
    loadWishlist();
    loadAddresses();
  }, [user, navigate]);

  const loadProfileData = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, photo_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfileName(data.name || user.name);
        if (data.photo_url) {
          setProfilePhoto(data.photo_url);
        }
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  };

  const loadAddresses = async () => {
    if (!user?.id) return;
    try {
      const data = await addressService.getUserAddresses();
      setAddresses(data);
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  const loadWishlist = async () => {
    if (!user?.id) return;
    setLoadingWishlist(true);
    const items = await getWishlistItems(user.id);
    setWishlist(items);
    setLoadingWishlist(false);
  };

  const loadProductReviews = async (productId: string) => {
    try {
      const reviews = await reviewService.getProductReviews(productId);
      setProductReviews(prev => ({ ...prev, [productId]: reviews }));
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const hasUserReviewedOrderItem = (orderId: string, productId: string): boolean => {
    const reviews = productReviews[productId] || [];
    return reviews.some(r => r.user_id === user?.id && r.order_id === orderId);
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
      <div className="container py-6 md:py-12 px-2 md:px-0">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 mb-6 md:mb-12 p-4 md:p-8 bg-gradient-to-r from-primary/10 to-primary/5 border border-border rounded-xl"
          >
            <div className="h-16 md:h-20 w-16 md:w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
              {profilePhoto ? (
                <img src={profilePhoto} alt={profileName} className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 md:h-10 w-8 md:w-10" />
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-1">{profileName}</h1>
              <p className="text-xs md:text-lg text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditProfileModal(true)}
              className="mt-4 md:mt-0 text-xs md:text-sm"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-muted p-1 rounded-lg h-auto md:h-12">
                <TabsTrigger value="orders" className="data-[state=active]:bg-background rounded-md font-semibold text-xs md:text-sm">
                  <Package className="h-3 md:h-5 w-3 md:w-5 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Orders</span>
                  <span className="sm:hidden">All</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-background rounded-md font-semibold text-xs md:text-sm">
                  <Star className="h-3 md:h-5 w-3 md:w-5 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Completed</span>
                  <span className="sm:hidden">Done</span>
                </TabsTrigger>
                <TabsTrigger value="addresses" className="data-[state=active]:bg-background rounded-md font-semibold text-xs md:text-sm">
                  <MapPin className="h-3 md:h-5 w-3 md:w-5 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Addresses</span>
                  <span className="sm:hidden">Addr</span>
                </TabsTrigger>
                <TabsTrigger value="wishlist" className="data-[state=active]:bg-background rounded-md font-semibold text-xs md:text-sm">
                  <Heart className="h-3 md:h-5 w-3 md:w-5 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Wishlist</span>
                  <span className="sm:hidden">❤️</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="space-y-3 md:space-y-4 mt-4 md:mt-8">
                {orders.filter(o => o.status !== 'completed').length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-card border-border">
                      <CardContent className="py-8 md:py-12 text-center px-3 md:px-6">
                        <ShoppingBag className="h-12 md:h-16 w-12 md:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground text-sm md:text-lg">No active orders</p>
                        <p className="text-muted-foreground mb-4 md:mb-6 text-xs md:text-base">All your orders are completed! Check the Completed tab to rate and review.</p>
                        <Link to="/shop">
                          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs md:text-sm">
                            Continue Shopping
                            <ArrowRight className="ml-2 h-4 md:h-5 w-4 md:w-5" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="space-y-2 md:space-y-4">
                    {orders.filter(o => o.status !== 'completed').map((order, i) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card 
                          className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                        >
                          <CardHeader className="pb-2 md:pb-4 border-b border-border p-3 md:p-6">
                            <div className="flex items-start md:items-center justify-between gap-2">
                              <CardTitle className="text-base md:text-xl text-foreground truncate">Order #{order.id.slice(0, 8)}</CardTitle>
                              <Badge variant={getStatusColor(order.status)} className="text-xs md:text-sm flex-shrink-0">
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">
                              📅 {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </CardHeader>
                          <CardContent className="pt-2 md:pt-4 p-3 md:p-6">
                            <div className="space-y-2 md:space-y-3">
                              {order.items.slice(0, 2).map((item) => (
                                <div key={item.id} className="flex justify-between text-xs md:text-sm border-b border-border pb-1 md:pb-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate">{item.name}</p>
                                    <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                                  </div>
                                  <span className="font-bold text-primary ml-2 flex-shrink-0">₱{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <p className="text-xs text-muted-foreground italic">
                                  +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                                </p>
                              )}
                              <div className="pt-2 md:pt-4 flex justify-between font-bold text-sm md:text-lg">
                                <span className="text-foreground">Total</span>
                                <span className="text-primary md:text-xl">₱{order.total.toFixed(2)}</span>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-2 md:mt-3 text-xs md:text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                  setShowOrderModal(true);
                                }}
                              >
                                View Details
                                <ChevronDown className="ml-1 md:ml-2 h-3 md:h-4 w-3 md:w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-3 md:space-y-4 mt-4 md:mt-8">
                {orders.filter(o => o.status === 'completed').length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-card border-border">
                      <CardContent className="py-8 md:py-12 text-center px-3 md:px-6">
                        <Package className="h-12 md:h-16 w-12 md:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground text-sm md:text-lg">No completed orders yet</p>
                        <p className="text-muted-foreground mb-4 md:mb-6 text-xs md:text-base">Once an order is completed, you can rate and review the products!</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="space-y-2 md:space-y-4">
                    {orders.filter(o => o.status === 'completed').map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-sm md:text-base">Order #{order.id.slice(0, 8)}</CardTitle>
                                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                  {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setExpandedItems(prev => {
                                    const next = new Set(prev);
                                    if (next.has(order.id)) {
                                      next.delete(order.id);
                                    } else {
                                      next.add(order.id);
                                      // Load reviews for all items in this order
                                      order.items.forEach(item => {
                                        if (!productReviews[item.id]) {
                                          loadProductReviews(item.id);
                                        }
                                      });
                                    }
                                    return next;
                                  });
                                }}
                                className="hover:bg-muted"
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform ${expandedItems.has(order.id) ? 'rotate-180' : ''}`} />
                              </Button>
                            </div>
                          </CardHeader>
                          {expandedItems.has(order.id) && (
                            <CardContent className="space-y-4 pt-0">
                              <div className="space-y-3">
                                {order.items.map((item) => (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    transition={{ duration: 0.3 }}
                                    className="border-b border-border pb-3 last:border-0 last:pb-0"
                                  >
                                    <div className="flex gap-3">
                                      {item.image && <img src={item.image} alt={item.name} className="h-16 w-16 object-cover rounded" />}
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-sm md:text-base">{item.name}</h4>
                                        <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                          Qty: {item.quantity} × ₱{item.price.toFixed(2)} = ₱{(item.price * item.quantity).toFixed(2)}
                                        </p>
                                        
                                        {/* Show Rate & Review button only if not already reviewed THIS order's item */}
                                        {!hasUserReviewedOrderItem(order.id, item.id) && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="mt-2 text-xs md:text-sm"
                                            onClick={() => {
                                              setSelectedProduct(item);
                                              setSelectedOrderForReview(order);
                                              setShowReviewModal(true);
                                            }}
                                          >
                                            <Star className="h-3 w-3 mr-1" />
                                            Rate & Review
                                          </Button>
                                        )}
                                        
                                        {/* Show reviews and edit button */}
                                        {productReviews[item.id] && productReviews[item.id].length > 0 && (
                                          <div className="mt-3 pt-3 border-t border-border">
                                            <p className="text-xs font-semibold mb-2">Your Reviews:</p>
                                            <ReviewList 
                                              reviews={productReviews[item.id]} 
                                              isLoading={false}
                                              currentUserId={user?.id}
                                              onEditReview={(review) => {
                                                setSelectedReviewForEdit(review);
                                                setShowEditReviewModal(true);
                                              }}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                              <div className="bg-muted p-3 rounded text-sm font-semibold flex justify-between items-center">
                                <span>Total:</span>
                                <span className="text-primary">₱{order.total.toFixed(2)}</span>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="addresses" className="space-y-3 md:space-y-4 mt-4 md:mt-8">
                {addresses.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-card border-border">
                      <CardContent className="py-8 md:py-12 text-center px-3 md:px-6">
                        <MapPin className="h-12 md:h-16 w-12 md:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground text-sm md:text-lg mb-3 md:mb-6">No addresses saved yet</p>
                        <Link to="/addresses">
                          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs md:text-sm">
                            <MapPin className="mr-1 md:mr-2 h-3 md:h-5 w-3 md:w-5" />
                            Add Your First Address
                            <ArrowRight className="ml-1 md:ml-2 h-3 md:h-5 w-3 md:w-5" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="space-y-2 md:space-y-4">
                    {addresses.map((address, i) => (
                      <motion.div
                        key={address.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                          <CardHeader className="pb-2 md:pb-3 border-b border-border p-3 md:p-6">
                            <div className="flex items-start md:items-center justify-between gap-2">
                              <div className="flex items-center gap-1 md:gap-2 min-w-0">
                                <CardTitle className="text-sm md:text-lg text-foreground truncate">{address.full_name}</CardTitle>
                                <Badge className="text-xs flex-shrink-0">{address.label}</Badge>
                                {address.is_default && (
                                  <Badge variant="secondary" className="text-xs flex-shrink-0">Default</Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-2 md:pt-4 space-y-1 md:space-y-2 p-3 md:p-6">
                            <p className="text-xs md:text-sm text-foreground break-words">
                              <span className="font-semibold">Address:</span> {address.street_address}
                            </p>
                            <p className="text-xs md:text-sm text-foreground break-words">
                              {address.barangay}, {address.city}, {address.province}, {address.region} {address.postal_code}
                            </p>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              <span className="font-semibold">Phone:</span> {address.phone_number}
                            </p>
                            <div className="flex gap-1 md:gap-2 mt-2 md:mt-4">
                              <Link to="/addresses" className="flex-1">
                                <Button variant="outline" size="sm" className="w-full text-xs md:text-sm">
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                    <Link to="/addresses" className="block">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs md:text-sm">
                        <MapPin className="mr-1 md:mr-2 h-3 md:h-5 w-3 md:w-5" />
                        Manage Addresses
                      </Button>
                    </Link>
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

      {/* Order Details Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-sm md:max-w-2xl w-[95vw] md:w-full">
          <DialogHeader className="pr-6">
            <DialogTitle className="text-lg md:text-2xl">Order Details #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Placed on {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 md:space-y-6">
              {/* Order Status */}
              <div>
                <Label className="font-semibold text-sm md:text-base">Status</Label>
                <Badge variant={getStatusColor(selectedOrder.status)} className="mt-2 text-xs md:text-sm">
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
              </div>

              {/* Customer Name */}
              <div>
                <Label className="font-semibold text-sm md:text-base">Customer Name</Label>
                <p className="text-foreground mt-1 text-xs md:text-sm">{selectedOrder.customerName}</p>
              </div>

              {/* Delivery Address */}
              <div>
                <Label className="font-semibold flex items-center gap-2 text-sm md:text-base">
                  <MapPin className="w-3 md:w-4 h-3 md:h-4" />
                  Delivery Address
                </Label>
                <p className="text-foreground mt-1 text-xs md:text-sm bg-muted p-2 md:p-3 rounded break-words">{selectedOrder.address}</p>
              </div>

              {/* Items */}
              <div>
                <Label className="font-semibold mb-2 md:mb-3 block text-sm md:text-base">Items Ordered</Label>
                <div className="space-y-2 md:space-y-3 border-l-2 border-primary pl-2 md:pl-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-xs md:text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-primary text-xs md:text-sm whitespace-nowrap">₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label className="font-semibold text-sm md:text-base">Payment Method</Label>
                <p className="text-foreground mt-1 capitalize text-xs md:text-sm">{selectedOrder.paymentMethod}</p>
              </div>

              {/* Total */}
              <div className="border-t border-border pt-3 md:pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm md:text-lg text-foreground">Total Amount</span>
                  <span className="font-bold text-lg md:text-2xl text-primary">₱{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      {selectedProduct && selectedOrderForReview && (
        <AddReviewModal
          productId={selectedProduct.id}
          orderId={selectedOrderForReview.id}
          userId={user?.id || ''}
          open={showReviewModal}
          onOpenChange={(open) => {
            setShowReviewModal(open);
            if (!open) {
              setSelectedProduct(null);
              setSelectedOrderForReview(null);
            }
          }}
          onReviewSubmitted={() => {
            if (selectedProduct) {
              loadProductReviews(selectedProduct.id);
            }
            setShowReviewModal(false);
            setSelectedProduct(null);
            setSelectedOrderForReview(null);
            setReviewRefreshTrigger(prev => prev + 1);
            toast({
              title: 'Review submitted!',
              description: 'Your review has been published.',
            });
          }}
        />
      )}

      {/* Edit Review Modal */}
      {selectedReviewForEdit && (
        <EditReviewModal
          open={showEditReviewModal}
          onOpenChange={(open) => {
            setShowEditReviewModal(open);
            if (!open) {
              setSelectedReviewForEdit(null);
            }
          }}
          review={selectedReviewForEdit}
          onReviewUpdated={() => {
            if (selectedReviewForEdit) {
              loadProductReviews(selectedReviewForEdit.product_id);
            }
            setShowEditReviewModal(false);
            setSelectedReviewForEdit(null);
            toast({
              title: 'Review updated!',
              description: 'Your review has been updated successfully.',
            });
          }}
        />
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={showEditProfileModal}
        onOpenChange={(open) => {
          setShowEditProfileModal(open);
          // Reload profile data when modal closes
          if (!open) {
            setTimeout(() => {
              loadProfileData();
            }, 500);
          }
        }}
        userName={profileName}
        userPhoto={profilePhoto}
        userId={user?.id || ''}
        onProfileUpdated={(name, photo) => {
          setProfileName(name);
          setProfilePhoto(photo);
          // Refresh after update
          setTimeout(() => {
            loadProfileData();
          }, 300);
        }}
      />
    </PageWrapper>
  );
}

