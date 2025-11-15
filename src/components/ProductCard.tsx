import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/services/wishlist';

interface ProductCardProps {
  product: Product;
  onWishlistChange?: () => void;
  refreshTrigger?: number;
}

export const ProductCard = ({ product, onWishlistChange, refreshTrigger }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inWishlist, setInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if product is in wishlist on mount and when user changes or refresh trigger changes
  useEffect(() => {
    if (user?.id) {
      checkWishlistStatus();
    }
  }, [user?.id, product.id, user, refreshTrigger]);

  const checkWishlistStatus = async () => {
    if (!user?.id) return;
    const inWishlist = await isInWishlist(user.id, product.id);
    setInWishlist(inWishlist);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Check if user is logged in
    if (!user?.id) {
      toast({
        title: 'Login Required',
        description: 'Please log in to manage your wishlist.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    try {
      if (inWishlist) {
        // Remove from wishlist
        const success = await removeFromWishlist(user.id, product.id);
        if (success) {
          setInWishlist(false);
          toast({
            title: 'Removed from wishlist',
            description: `${product.name} has been removed from your wishlist.`,
          });
          onWishlistChange?.();
        }
      } else {
        // Add to wishlist
        const success = await addToWishlist(user.id, product.id);
        if (success) {
          setInWishlist(true);
          toast({
            title: 'Added to wishlist',
            description: `${product.name} has been added to your wishlist.`,
          });
          onWishlistChange?.();
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    // Check if user is logged in
    if (!user?.email) {
      toast({
        title: '⚠️ Login Required',
        description: 'Please log in or create an account to add items to cart.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    try {
      addToCart(product);
      toast({
        title: '✅ Added to cart',
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error: any) {
      toast({
        title: '❌ Error',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/auth');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
    >
      <Link to={`/product/${product.id}`}>
        <Card className="overflow-hidden h-full bg-card border-border hover:shadow-xl transition-all duration-300 hover:border-primary/50">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            
            {product.featured && (
              <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground border-none shadow-lg">
                Featured
              </Badge>
            )}
            {product.stock < 5 && product.stock > 0 && (
              <Badge variant="destructive" className="absolute top-3 left-3 shadow-lg">
                Low Stock
              </Badge>
            )}
          </div>

          <CardContent className="p-4 space-y-2">
            <h3 className="font-bold text-base text-foreground truncate">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xl font-bold text-primary">
                ₱{product.price.toFixed(2)}
              </span>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                {product.stock} stock
              </span>
            </div>
          </CardContent>

          <CardFooter className="p-3 md:p-4 pt-0 gap-1 md:gap-2 flex-col sm:flex-row">
            <motion.div className="w-full sm:flex-1">
              <Button
                size="sm"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs md:text-sm"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Add to Cart</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleWishlistToggle}
                disabled={isLoading}
                className={`w-full sm:w-auto border-border transition-colors ${
                  inWishlist ? 'bg-red-50 text-red-500 border-red-200 dark:bg-red-950/30 dark:border-red-800' : 'hover:border-primary'
                }`}
              >
                <motion.div
                  animate={inWishlist ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={inWishlist ? 'currentColor' : 'none'}
                  />
                </motion.div>
                <span className="sm:hidden ml-2">Like</span>
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};
