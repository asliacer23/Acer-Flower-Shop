import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { reviewService } from '@/services/reviews';
import { ReviewWithUserInfo } from '@/types';

interface EditReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: ReviewWithUserInfo;
  onReviewUpdated: () => void;
}

export function EditReviewModal({
  open,
  onOpenChange,
  review,
  onReviewUpdated,
}: EditReviewModalProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment || '');
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast({
        title: "Please write a comment",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Update review
    const result = await reviewService.updateReview(
      review.id,
      rating,
      comment
    );

    if (result) {
      toast({
        title: "Review updated!",
        description: "Your review has been updated successfully.",
      });
      onOpenChange(false);
      onReviewUpdated();
    } else {
      toast({
        title: "Failed to update review",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Your Review</DialogTitle>
          <DialogDescription>
            Update your rating and comments for this product
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Star Rating */}
          <div>
            <Label className="mb-3 block">Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoverRating || rating)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="mb-2 block">
              Your Comment
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Updating..." : "Update Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
