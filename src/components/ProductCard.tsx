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

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    // Check if user is logged in
    if (!user?.email) {
      toast({
        title: 'Login Required',
        description: 'Please log in or create an account to add items to cart.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

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

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/product/${product.id}`}>
        <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
          <div className="relative aspect-square overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full transition-transform hover:scale-105"
            />
            {product.featured && (
              <Badge className="absolute top-2 right-2">Featured</Badge>
            )}
            {product.stock < 5 && product.stock > 0 && (
              <Badge variant="destructive" className="absolute top-2 left-2">
                Low Stock
              </Badge>
            )}
          </div>

          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                ₱{product.price.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">
                {product.stock} in stock
              </span>
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0 gap-2">
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};
