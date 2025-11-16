import { Star, User, Edit2 } from 'lucide-react';
import { ReviewWithUserInfo } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ReviewListProps {
  reviews: ReviewWithUserInfo[];
  isLoading?: boolean;
  currentUserId?: string;
  onEditReview?: (review: ReviewWithUserInfo) => void;
}

export function ReviewList({ reviews, isLoading, currentUserId, onEditReview }: ReviewListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="py-4">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="py-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {review.user_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{review.user_name}</p>
                      {currentUserId === review.user_id && (
                        <Badge variant="outline" className="text-xs">
                          Completed Review
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Stars & Edit Button */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${
                          star <= review.rating
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  {currentUserId === review.user_id && onEditReview && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEditReview(review)}
                      className="h-6 text-xs"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-sm text-foreground">{review.comment}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
