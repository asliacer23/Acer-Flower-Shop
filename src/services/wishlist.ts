import { Product } from '@/types';
import { supabase } from '@/lib/supabase';

// Add item to wishlist
export const addToWishlist = async (userId: string, productId: string): Promise<boolean> => {
  try {
    // Get current profile with wishlist
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('wishlist')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Parse wishlist (it's stored as JSON array)
    const currentWishlist = Array.isArray(profile?.wishlist) ? profile.wishlist : [];

    // Check if product already in wishlist
    if (currentWishlist.includes(productId)) {
      return false; // Already in wishlist
    }

    // Add product to wishlist
    const updatedWishlist = [...currentWishlist, productId];

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ wishlist: updatedWishlist })
      .eq('id', userId);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (userId: string, productId: string): Promise<boolean> => {
  try {
    // Get current profile with wishlist
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('wishlist')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Parse wishlist
    const currentWishlist = Array.isArray(profile?.wishlist) ? profile.wishlist : [];

    // Remove product from wishlist
    const updatedWishlist = currentWishlist.filter((id: string) => id !== productId);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ wishlist: updatedWishlist })
      .eq('id', userId);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
};

// Check if product is in wishlist
export const isInWishlist = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('wishlist')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const wishlist = Array.isArray(profile?.wishlist) ? profile.wishlist : [];
    return wishlist.includes(productId);
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};

// Get all wishlist items with product details
export const getWishlistItems = async (userId: string): Promise<Product[]> => {
  try {
    // Get wishlist from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('wishlist')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const wishlistIds = Array.isArray(profile?.wishlist) ? profile.wishlist : [];

    if (wishlistIds.length === 0) {
      return [];
    }

    // Fetch product details for each item in wishlist
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', wishlistIds);

    if (productsError) throw productsError;

    return (products as Product[]) || [];
  } catch (error) {
    console.error('Error fetching wishlist items:', error);
    return [];
  }
};
