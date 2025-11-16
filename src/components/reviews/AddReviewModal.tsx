import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { reviewService } from '@/services/reviews';

interface AddReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  userId: string;
  orderId: string;
  onReviewSubmitted: () => void;
}

export function AddReviewModal({
  open,
  onOpenChange,
  productId,
  userId,
  orderId,
  onReviewSubmitted,
}: AddReviewModalProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
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

    // Submit review using provided orderId
    const result = await reviewService.submitReview(
      userId,
      productId,
      orderId,
      rating,
      comment
    );

    if (result) {
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });
      onOpenChange(false);
      setRating(5);
      setComment('');
      onReviewSubmitted();
    } else {
      toast({
        title: "Failed to submit review",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>Share your experience with this product</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating Stars */}
          <div>
            <Label className="font-semibold mb-2 block">Rating</Label>
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
            <p className="text-sm text-muted-foreground mt-2">
              {rating} out of 5 stars
            </p>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="font-semibold mb-2 block">
              Your Comment
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
