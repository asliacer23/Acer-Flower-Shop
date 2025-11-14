import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load cart from Supabase when user is logged in
  useEffect(() => {
    if (!user?.email) {
      setCart([]);
      return;
    }

    const loadCart = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('carts')
          .select('items')
          .eq('user_email', user.email)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data?.items) {
          setCart(data.items as CartItem[]);
        } else {
          // Create empty cart for new user
          await supabase.from('carts').insert([{ user_email: user.email, items: [] }]);
          setCart([]);
        }
      } catch (err) {
        console.error('Error loading cart:', err);
        setCart([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [user?.email]);

  // Save cart to Supabase when it changes (including when empty)
  useEffect(() => {
    if (!user?.email || isLoading) return;

    const saveCart = async () => {
      try {
        const serialized = cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          category: item.category || null,
        }));

        await supabase
          .from('carts')
          .upsert(
            {
              user_email: user.email,
              items: serialized,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_email' }
          );

        console.log('✅ Cart saved:', serialized);
      } catch (err) {
        console.error('Error saving cart:', err);
      }
    };

    const timer = setTimeout(saveCart, 700);
    return () => clearTimeout(timer);
  }, [cart, user?.email, isLoading]);

  // Add item to cart (ONLY if logged in)
  const addToCart = (product: Product, quantity = 1) => {
    if (!user?.email) {
      throw new Error('You must be logged in to add items to cart');
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  // Remove item
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Update quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
