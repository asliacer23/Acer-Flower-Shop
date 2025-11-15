import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Award, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Product } from '@/types';
import { getFeaturedProducts } from '@/services/products';
import { motion } from 'framer-motion';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    getFeaturedProducts().then(setFeatured);
    const handleFocus = () => setRefreshTrigger(prev => prev + 1);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <PageWrapper>
      {/* Hero Section - Premium */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.div 
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="h-6 w-6 text-primary" />
              </motion.div>
              <span className="text-sm font-bold text-primary uppercase tracking-widest">
                Premium Flower Shop
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight text-foreground">
              Hand Made Flowers
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">Delivered Today</span>
            </h1>

            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Discover our curated collection of stunning flower arrangements. Perfect for every occasion, from vibrant bouquets to elegant plants.
            </motion.p>

            <motion.div 
              className="flex flex-col md:flex-row gap-4 md:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/shop">
                  <Button size="lg" className="gradient-primary text-primary-foreground font-semibold px-8 h-14 rounded-xl shadow-lg hover:shadow-xl">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-primary text-primary hover:bg-primary/5 font-semibold px-8 h-14 rounded-xl"
                >
                  Learn More
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center md:text-left"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Featured Collection</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Handpicked selections from our finest arrangements
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featured.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} refreshTrigger={refreshTrigger} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/shop">
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary/5">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

{/* Features Section - Adaptive Light & Dark */}
<section className="py-20 md:py-32">
  <div className="container">
    <motion.h2 
      className="text-4xl md:text-5xl font-bold text-center mb-16 
                 text-foreground dark:text-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      Why Choose Flowerist
    </motion.h2>

    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {[
        {
          icon: Truck,
          title: "Same-Day Delivery",
          description:
            "Order before 2 PM and get your flowers today. We guarantee on-time delivery.",
        },
        {
          icon: Shield,
          title: "7-Day Freshness",
          description:
            "Backed by our quality guarantee. Your flowers stay fresh for a full week.",
        },
        {
          icon: Award,
          title: "Expert Florists",
          description:
            "Our team has 20+ years of experience creating stunning arrangements.",
        },
      ].map((feature, i) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ y: -8 }}
            className="
              p-8 text-center rounded-xl border shadow-xl transition
              bg-card border-border hover:shadow-2xl

              dark:bg-[#06142A]/50 dark:border-white/10 dark:shadow-none
              backdrop-blur-md
            "
          >
            <motion.div
              className="
                inline-block p-4 rounded-full mb-6 
                bg-primary/10 
                dark:bg-white/20
              "
              whileHover={{ rotate: 10, scale: 1.1 }}
            >
              <Icon className="h-8 w-8 text-primary dark:text-white" />
            </motion.div>

            <h3 className="text-2xl font-bold mb-4 text-foreground dark:text-white">
              {feature.title}
            </h3>

            <p className="text-muted-foreground dark:text-white/80 text-lg leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  </div>
</section>
{/* CTA Section */}
<section className="py-20 md:py-32 bg-[#F4F6FF] dark:bg-[#06142A]">
  <div className="container text-center">
    <motion.h2 
      className="text-4xl md:text-5xl font-bold mb-6 text-foreground dark:text-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      Make Every Moment Bloom
    </motion.h2>

    <motion.p 
      className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-muted-foreground dark:text-white/80"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      Whether it’s a birthday, anniversary, or a surprise gesture—our handcrafted
      arrangements make every moment unforgettable.
    </motion.p>

    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <Link to="/shop">
        <Button 
          size="lg" 
          className="
            px-10 py-6 text-lg font-semibold
            bg-primary text-white 
            hover:bg-primary/90 
            dark:bg-white dark:text-black 
            dark:hover:bg-white/90
          "
        >
          Shop Flowers
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    </motion.div>
  </div>
</section>

    </PageWrapper>
  );
}
