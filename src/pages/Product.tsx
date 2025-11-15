import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Package, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Product as ProductType } from '@/types';
import { getProductById } from '@/services/products';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      getProductById(id).then(p => setProduct(p || null));
    }
  }, [id]);

  if (!product) {
    return (
      <PageWrapper>
        <div className="container py-8">
          <p>Product not found</p>
        </div>
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

  return (
    <PageWrapper>
      <div className="container py-8">
        <Link to="/shop">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <Badge>{product.category}</Badge>
              </div>
              <Button variant="outline" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            <p className="text-3xl font-bold text-primary mb-6">
              ₱{product.price.toFixed(2)}
            </p>

            <p className="text-muted-foreground mb-6">{product.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="px-4">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  +
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {product.stock} available
              </span>
            </div>

            <Button
              size="lg"
              className="w-full mb-8"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>

            {/* Features */}
            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Fast Delivery</p>
                  <p className="text-sm text-muted-foreground">Same-day delivery available</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Fresh Guarantee</p>
                  <p className="text-sm text-muted-foreground">7-day freshness guarantee</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-sm text-muted-foreground">Your payment is protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
