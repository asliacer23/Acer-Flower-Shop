import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Package, Shield, Truck, Check, Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Product as ProductType } from '@/types';
import { getProductById } from '@/services/products';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/services/wishlist';
import { motion } from 'framer-motion';
import { ItemReviews } from '@/components/reviews/ItemReviews';

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      getProductById(id).then(p => setProduct(p || null));
      if (user?.id) {
        checkWishlistStatus();
      }
    }
  }, [id, user?.id]);

  const checkWishlistStatus = async () => {
    if (!user?.id || !id) return;
    const inWishlist = await isInWishlist(user.id, id);
    setInWishlist(inWishlist);
  };

  const handleWishlistToggle = async () => {
    if (!user?.id) {
      toast({
        title: 'Login Required',
        description: 'Please log in to manage your wishlist.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!id) return;

    setIsLoading(true);
    try {
      if (inWishlist) {
        const success = await removeFromWishlist(user.id, id);
        if (success) {
          setInWishlist(false);
          toast({
            title: 'Removed from wishlist',
            description: `${product?.name} has been removed from your wishlist.`,
          });
        }
      } else {
        const success = await addToWishlist(user.id, id);
        if (success) {
          setInWishlist(true);
          toast({
            title: 'Added to wishlist',
            description: `${product?.name} has been added to your wishlist.`,
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update wishlist',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) {
    return (
      <PageWrapper>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container py-16 text-center"
        >
          <p className="text-2xl font-semibold text-foreground">Product not found</p>
          <p className="text-muted-foreground mt-2 mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/shop">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Shop
            </Button>
          </Link>
        </motion.div>
      </PageWrapper>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: 'Added to cart',
      description: `${quantity}x ${product.name} added to your cart.`,
    });
  };

  const handlePlaceOrder = () => {
    if (!user?.email) {
      toast({
        title: 'Login Required',
        description: 'Please log in to place an order.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    
    // Create single product item with quantity
    const singleItem = { ...product, quantity };
    
    // Navigate to checkout with only this product
    navigate('/checkout', {
      state: {
        items: [singleItem],
        isSingleProduct: true
      }
    });
  };

  const shareProduct = () => {
    const shareUrl = `${window.location.origin}/product/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast({
      title: 'Link copied!',
      description: 'Product link copied to clipboard',
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <PageWrapper>
      <div className="container py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link to="/shop">
            <Button variant="ghost" className="text-primary hover:bg-primary/10 font-semibold">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Shop
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative aspect-square rounded-xl overflow-hidden bg-muted shadow-lg"
          >
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            {product.stock < 5 && product.stock > 0 && (
              <Badge variant="destructive" className="absolute top-4 left-4 shadow-lg text-sm font-bold">
                Low Stock
              </Badge>
            )}
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-5xl font-bold text-foreground mb-3">{product.name}</h1>
                  <Badge className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1">
                    {product.category}
                  </Badge>
                </div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleWishlistToggle}
                    disabled={isLoading}
                    className={`h-14 w-14 border-2 transition-all ${
                      inWishlist
                        ? 'bg-red-50 text-red-500 border-red-200 dark:bg-red-950/30 dark:border-red-800'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <motion.div
                      animate={inWishlist ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart className="h-6 w-6" fill={inWishlist ? 'currentColor' : 'none'} />
                    </motion.div>
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Price */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-baseline gap-4"
            >
              <p className="text-5xl font-bold text-primary">
                ₱{product.price.toFixed(2)}
              </p>
              <span className="text-muted-foreground text-lg">Philippine Peso</span>
            </motion.div>

            {/* Description */}
            <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Quantity Selector */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-6 bg-muted p-4 rounded-lg w-fit"
            >
              <span className="font-semibold text-foreground">Quantity:</span>
              <div className="flex items-center gap-3 bg-background rounded-lg p-1">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 hover:bg-muted"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    −
                  </Button>
                </motion.div>
                <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 hover:bg-muted"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  >
                    +
                  </Button>
                </motion.div>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">
                {product.stock} available
              </span>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-3"
            >
              {/* Add to Cart Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 text-lg"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-3 h-6 w-6" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </motion.div>

              {/* Place Order & Share Row */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-2 border-primary text-primary hover:bg-primary/5 font-bold h-12"
                    onClick={handlePlaceOrder}
                    disabled={product.stock === 0}
                  >
                    Place Order
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-2 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-bold h-12"
                    onClick={shareProduct}
                  >
                    {copiedLink ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-4 pt-8 border-t border-border"
            >
              {product && (
                <ItemReviews productId={product.id} userId={user?.id} />
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
