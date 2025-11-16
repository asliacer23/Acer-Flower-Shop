// Service to handle product reviews
import { supabase } from '@/lib/supabase';
import { ProductReview, ReviewWithUserInfo } from '@/types';

/**
 * Check if user can review a product
 * Requirements:
 * 1. User must have ordered the product
 * 2. Order status must be "completed"
 * 3. User hasn't already reviewed this product from that order
 */
export async function canUserReviewProduct(
  userId: string,
  productId: string
): Promise<{ canReview: boolean; orderId?: string; message?: string }> {
  try {
    // Find completed orders with this product
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (orderError) throw orderError;
    if (!orders || orders.length === 0) {
      return { canReview: false, message: 'You have no completed orders' };
    }

    // Check if any order contains this product
    for (const order of orders) {
      const { data: orderItem, error: itemError } = await supabase
        .from('order_items')
        .select('id')
        .eq('order_id', order.id)
        .eq('product_id', productId)
        .single();

      if (itemError && itemError.code !== 'PGRST116') throw itemError;
      if (orderItem) {
        // Check if already reviewed
        const { data: existing, error: reviewError } = await supabase
          .from('reviews')
          .select('id')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .eq('order_id', order.id)
          .single();

        if (reviewError && reviewError.code !== 'PGRST116') throw reviewError;
        if (existing) {
          return { canReview: false, message: 'You already reviewed this product' };
        }

        return { canReview: true, orderId: order.id };
      }
    }

    return { canReview: false, message: 'You have not ordered this product' };
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return { canReview: false, message: 'Error checking review eligibility' };
  }
}

/**
 * Submit a product review
 */
export async function submitReview(
  userId: string,
  productId: string,
  orderId: string,
  rating: number,
  comment?: string
): Promise<ProductReview | null> {
  try {
    // Validate rating
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new Error('Rating must be between 1 and 5');
    }

    console.log('Submitting review:', { userId, productId, orderId, rating, comment });

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: userId,
        product_id: productId,
        order_id: orderId,
        rating,
        comment: comment || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Review submitted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error submitting review:', error);
    return null;
  }
}

/**
 * Get all reviews for a product
 */
export async function getProductReviews(productId: string): Promise<ReviewWithUserInfo[]> {
  try {
    console.log('Fetching reviews for product:', productId);
    
    const { data, error } = await supabase
      .from('reviews')
      .select('id, user_id, product_id, order_id, rating, comment, created_at, reviewer_name')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching reviews:', error);
      throw error;
    }

    console.log('Reviews fetched:', data);

    // Transform data to include user info
    return (data || []).map((review: any) => ({
      ...review,
      user_name: review.reviewer_name || 'Anonymous',
      user_email: '',
    }));
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return [];
  }
}

/**
 * Get user's review for a product
 */
export async function getUserReviewForProduct(
  userId: string,
  productId: string
): Promise<ProductReview | null> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching user review:', error);
    return null;
  }
}

/**
 * Update a review
 */
export async function updateReview(
  reviewId: string,
  rating: number,
  comment?: string
): Promise<ProductReview | null> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating,
        comment: comment || null,
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating review:', error);
    return null;
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    return false;
  }
}

/**
 * Get average rating for a product
 */
export async function getProductAverageRating(productId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);

    if (error) throw error;
    if (!data || data.length === 0) return 0;

    const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
    return Math.round(avg * 10) / 10; // Round to 1 decimal
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return 0;
  }
}

export const reviewService = {
  canUserReviewProduct,
  submitReview,
  getProductReviews,
  getUserReviewForProduct,
  updateReview,
  deleteReview,
  getProductAverageRating,
};
