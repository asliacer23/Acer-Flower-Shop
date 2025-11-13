import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Product } from '@/types';
import { getFeaturedProducts } from '@/services/products';
import { motion } from 'framer-motion';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    getFeaturedProducts().then(setFeatured);
  }, []);

  return (
    <PageWrapper>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Fresh Daily</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Beautiful Flowers,
              <br />
              <span className="text-primary">Delivered Fresh</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Discover our curated collection of stunning flower arrangements, 
              perfect for every occasion. From vibrant bouquets to elegant plants.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button size="lg" className="group">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/shop?category=Bouquets">
                <Button size="lg" variant="outline">
                  Browse Bouquets
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Collection</h2>
              <p className="text-muted-foreground">
                Handpicked favorites for this season
              </p>
            </div>
            <Link to="/shop">
              <Button variant="ghost">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Petal Swift</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Fresh Daily',
                description: 'New flowers arrive every morning, ensuring maximum freshness',
              },
              {
                title: 'Fast Delivery',
                description: 'Same-day delivery available for orders placed before 2 PM',
              },
              {
                title: 'Expert Care',
                description: 'Our florists have over 20 years of combined experience',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-lg bg-card hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
