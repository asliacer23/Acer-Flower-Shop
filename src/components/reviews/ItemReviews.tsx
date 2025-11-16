import { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewList } from './ReviewList';
import { reviewService } from '@/services/reviews';
import { ReviewWithUserInfo } from '@/types';

interface ItemReviewsProps {
  productId: string;
  userId?: string;
  refreshTrigger?: number;
}

export function ItemReviews({ productId, userId, refreshTrigger }: ItemReviewsProps) {
  const [reviews, setReviews] = useState<ReviewWithUserInfo[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    const [reviews, avgRating] = await Promise.all([
      reviewService.getProductReviews(productId),
      reviewService.getProductAverageRating(productId),
    ]);
    setReviews(reviews);
    setAverageRating(avgRating);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    loadReviews();
    // Poll for new reviews every 10 seconds
    const interval = setInterval(loadReviews, 10000);
    return () => clearInterval(interval);
  }, [loadReviews]);

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Average Rating */}
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
            <div>
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={`${
                      star <= Math.round(averageRating)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Add Review Button 
          {userId && canReview && (
            <Button
              onClick={() => setShowAddReview(true)}
              className="w-full"
              variant="outline"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Write a Review
            </Button>
          )}
            */}
        
          {userId && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Rate and review from your completed orders
            </p>
          )}

          {!userId && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Sign in to write a review
            </p>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div>
        <h3 className="font-semibold mb-4">Recent Reviews</h3>
        <ReviewList 
          reviews={reviews} 
          isLoading={loading}
          currentUserId={userId}
        />
      </div>
    </div>
  );
}
