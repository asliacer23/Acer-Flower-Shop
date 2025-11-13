import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Lazy load pages
const Home = lazy(() => import('@/pages/Home'));
const Shop = lazy(() => import('@/pages/Shop'));
const Product = lazy(() => import('@/pages/Product'));
const Cart = lazy(() => import('@/pages/Cart'));
const Auth = lazy(() => import('@/pages/Auth'));
const Profile = lazy(() => import('@/pages/Profile'));
const Admin = lazy(() => import('@/pages/Admin'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const AppRoutes = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};
