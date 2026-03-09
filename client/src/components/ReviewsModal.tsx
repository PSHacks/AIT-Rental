import { useState } from "react";
import { X, Star, Loader2, MessageSquare } from "lucide-react";
import { type Car } from "@shared/routes";
import { useReviews, useCreateReview } from "@/hooks/use-reviews";

interface ReviewsModalProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewsModal({ car, isOpen, onClose }: ReviewsModalProps) {
  const [rating, setRating] = useState(5);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  
  const { data: reviews = [], isLoading } = useReviews(car?.id || 0);
  const createReview = useCreateReview();

  if (!isOpen || !car) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !text) return;

    await createReview.mutateAsync({
      carId: car.id,
      author,
      text,
      rating
    });

    setAuthor("");
    setText("");
    setRating(5);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-2xl bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-border flex justify-between items-center bg-card z-10 shrink-0">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Reviews</h2>
            <p className="text-sm text-muted-foreground">{car.model}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-secondary/20">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No reviews yet.</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-foreground">{r.author}</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < r.rating ? "fill-current" : "text-muted opacity-30"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border bg-card shrink-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm uppercase tracking-wider">Leave a Review</h3>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    className="focus:outline-none"
                  >
                    <Star className={`w-6 h-6 ${val <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="col-span-1 px-4 py-3 bg-secondary/50 border border-transparent focus:border-primary/20 focus:bg-background rounded-xl outline-none text-sm"
              />
              <input
                type="text"
                placeholder="What did you think?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                className="col-span-1 md:col-span-2 px-4 py-3 bg-secondary/50 border border-transparent focus:border-primary/20 focus:bg-background rounded-xl outline-none text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={createReview.isPending}
              className="w-full bg-foreground text-background py-3 rounded-xl font-medium text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createReview.isPending ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
