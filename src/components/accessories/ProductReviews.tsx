"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  Upload, 
  X, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Lock, 
  Image as ImageIcon,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { 
  ProductReview, 
  fetchProductReviews, 
  createProductReview, 
  updateProductReview, 
  deleteProductReview, 
  uploadReviewImage 
} from "@/lib/reviews";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface ProductReviewsProps {
  productId: string;
  productName: string;
  initialRating?: number;
  initialReviewsCount?: number;
  onRatingUpdate?: (newAvgRating: number, newCount: number) => void;
}

export default function ProductReviews({
  productId,
  productName,
  initialRating = 4.8,
  initialReviewsCount = 15,
  onRatingUpdate
}: ProductReviewsProps) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination & Image Viewer Modal
  const [visibleCount, setVisibleCount] = useState(5);
  const [activeEnlargedImage, setActiveEnlargedImage] = useState<string | null>(null);

  // Load reviews for product
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchProductReviews(productId);
      setReviews(data);
      setIsLoading(false);
    }
    if (productId) {
      loadData();
    }
  }, [productId]);

  // Calculate dynamic rating summary
  const { avgRating, totalReviews, ratingCounts } = useMemo(() => {
    if (reviews.length === 0) {
      return {
        avgRating: initialRating,
        totalReviews: initialReviewsCount,
        ratingCounts: { 5: 12, 4: 3, 3: 0, 2: 0, 1: 0 }
      };
    }

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[star] = (counts[star] || 0) + 1;
      sum += r.rating;
    });

    const calculatedAvg = Number((sum / reviews.length).toFixed(1));
    return {
      avgRating: calculatedAvg,
      totalReviews: reviews.length,
      ratingCounts: counts
    };
  }, [reviews, initialRating, initialReviewsCount]);

  // Notify parent of updated rating
  useEffect(() => {
    if (onRatingUpdate && reviews.length > 0) {
      onRatingUpdate(avgRating, totalReviews);
    }
  }, [avgRating, totalReviews, reviews.length, onRatingUpdate]);

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError("");
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    const totalAllowed = 5 - (existingImages.length + selectedFiles.length);
    if (totalAllowed <= 0) {
      setFormError("Maximum 5 photos allowed per review.");
      return;
    }

    const maxFilesToProcess = filesArray.slice(0, totalAllowed);

    for (const file of maxFilesToProcess) {
      // Check type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type.toLowerCase())) {
        setFormError(`"${file.name}" is not a valid format. Please upload JPG, PNG or WEBP.`);
        continue;
      }

      // Check size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFormError(`"${file.name}" exceeds the 5MB file size limit.`);
        continue;
      }

      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...validPreviews]);
  };

  // Remove preview image
  const handleRemoveNewImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Open "Write a Review" modal or Login Prompt
  const handleOpenWriteReview = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    setEditingReview(null);
    setRating(5);
    setReviewText("");
    setSelectedFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setFormError("");
    setIsFormOpen(true);
  };

  // Open "Edit Review" modal
  const handleOpenEditReview = (rev: ProductReview) => {
    setEditingReview(rev);
    setRating(rev.rating);
    setReviewText(rev.reviewText);
    setExistingImages(rev.imageUrls || []);
    setSelectedFiles([]);
    setImagePreviews([]);
    setFormError("");
    setIsFormOpen(true);
  };

  // Submit Review Form (Create or Edit)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormError("");
    if (!rating) {
      setFormError("Please select a star rating (1 to 5 stars).");
      return;
    }

    if (reviewText.trim().length < 5) {
      setFormError("Please write at least 5 characters in your review text.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new image files
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        const url = await uploadReviewImage(file, productId, user.id);
        if (url) uploadedUrls.push(url);
      }

      const finalImageUrls = [...existingImages, ...uploadedUrls];

      if (editingReview && editingReview.id) {
        // UPDATE existing review
        await updateProductReview(editingReview.id, {
          rating,
          reviewText: reviewText.trim(),
          imageUrls: finalImageUrls
        });

        setReviews(prev =>
          prev.map(r =>
            r.id === editingReview.id
              ? {
                  ...r,
                  rating,
                  reviewText: reviewText.trim(),
                  imageUrls: finalImageUrls,
                  updatedAt: new Date().toISOString()
                }
              : r
          )
        );
        setSuccessMessage("Your review has been updated successfully!");
      } else {
        // CREATE new review
        const created = await createProductReview({
          productId: String(productId),
          userId: user.id,
          userName: user.full_name || user.email.split("@")[0] || "Verified Customer",
          userEmail: user.email,
          rating,
          reviewText: reviewText.trim(),
          imageUrls: finalImageUrls
        });

        setReviews(prev => [created, ...prev]);
        setSuccessMessage("Thank you! Your review has been submitted.");
        confetti({ particleCount: 70, spread: 50, origin: { y: 0.7 } });
      }

      setIsFormOpen(false);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setFormError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Review Delete
  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete your review? This action cannot be undone.")) return;

    try {
      await deleteProductReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setSuccessMessage("Review deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      alert("Failed to delete review. Please try again.");
    }
  };

  const ratingLabels: Record<number, string> = {
    1: "1 - Poor",
    2: "2 - Fair",
    3: "3 - Good",
    4: "4 - Very Good",
    5: "5 - Excellent"
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* SUCCESS NOTIFICATION BANNER */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 text-xs font-extrabold">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")} className="text-emerald-500 hover:text-emerald-400">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* RATING SUMMARY HEADER & BREAKDOWN CARD */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left: Score Box (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-muted/30 border border-border/50 space-y-2">
            <span className="text-5xl font-black text-foreground tracking-tight">{avgRating}</span>
            
            <div className="flex text-amber-400 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-5 w-5",
                    star <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>

            <p className="text-xs font-bold text-muted-foreground">
              Based on <span className="text-foreground font-black">{totalReviews}</span> verified customer reviews
            </p>

            <button
              onClick={handleOpenWriteReview}
              className="mt-3 px-6 py-3 rounded-xl bg-cyan-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-cyan-400 active:scale-95 transition-all shadow-md flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Write a Review
            </button>
          </div>

          {/* Right: Star Breakdown Progress Bars (7 cols) */}
          <div className="md:col-span-7 space-y-2.5">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-foreground mb-3">Rating Breakdown</h4>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star] || 0;
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-14 font-bold text-foreground shrink-0">
                    <span>{star}</span>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  
                  <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden border border-border/40">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className="w-12 text-right text-[11px] font-bold text-muted-foreground shrink-0">
                    {pct}% ({count})
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-cyan-500" />
            Customer Reviews ({reviews.length})
          </h3>

          {!user && (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-xs font-bold text-cyan-500 hover:underline flex items-center gap-1"
            >
              <Lock className="h-3.5 w-3.5" /> Log in to review
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <span className="h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Loading Customer Reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-3xl border border-border space-y-3">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <h4 className="font-bold text-sm text-foreground">No reviews yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Be the first customer to write a review for <span className="font-bold text-foreground">&quot;{productName}&quot;</span>!
            </p>
            <button
              onClick={handleOpenWriteReview}
              className="inline-block px-5 py-2.5 bg-cyan-500 text-black font-extrabold text-xs rounded-xl shadow-md"
            >
              Submit First Review
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.slice(0, visibleCount).map((rev) => {
              const isOwner = user && user.id === rev.userId;
              const formattedDate = rev.createdAt 
                ? new Date(rev.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                : "Verified Purchase";

              return (
                <div
                  key={rev.id || Math.random().toString()}
                  className="glass-card rounded-2xl p-5 border border-border space-y-3 shadow-sm hover:border-cyan-500/30 transition-colors relative"
                >
                  <div className="flex items-start justify-between gap-4">
                    
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-sm">
                        {rev.userName ? rev.userName.trim().charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-xs text-foreground leading-none">{rev.userName}</h5>
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-wider border border-emerald-500/20">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Verified Purchase
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground block mt-1">{formattedDate}</span>
                      </div>
                    </div>

                    {/* Star Rating & Owner Edit/Delete Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              "h-3.5 w-3.5",
                              s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>

                      {isOwner && rev.id && (
                        <div className="flex items-center gap-1 border-l border-border/50 pl-2">
                          <button
                            onClick={() => handleOpenEditReview(rev)}
                            className="p-1 text-muted-foreground hover:text-cyan-500 transition-colors"
                            title="Edit your review"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rev.id!)}
                            className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                            title="Delete review"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-muted-foreground leading-relaxed pl-1 sm:pl-12">
                    {rev.reviewText}
                  </p>

                  {/* Uploaded Customer Photos Gallery */}
                  {rev.imageUrls && rev.imageUrls.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pt-2 pl-1 sm:pl-12">
                      {rev.imageUrls.map((imgUrl, imgIdx) => (
                        <button
                          key={imgIdx}
                          onClick={() => setActiveEnlargedImage(imgUrl)}
                          className="h-16 w-16 rounded-xl border border-border overflow-hidden bg-muted hover:border-cyan-500 transition-all flex-shrink-0 relative group"
                        >
                          <img src={imgUrl} alt={`Review photo ${imgIdx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                            View
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              );
            })}

            {/* Load More Button */}
            {reviews.length > visibleCount && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setVisibleCount(prev => prev + 5)}
                  className="px-6 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <ChevronDown className="h-4 w-4" /> Load More Reviews ({reviews.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* LOGIN REQUIRED MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-border shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                <Lock className="h-6 w-6" />
              </div>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-foreground">Please log in to write a review</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To maintain authentic and verified customer ratings, reviews are restricted to registered Smart Care accounts.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-border text-foreground font-bold text-xs hover:bg-muted"
              >
                Cancel
              </button>
              <Link
                href={`/login?redirect=${encodeURIComponent(`/accessories/${productId}`)}`}
                className="flex-1 py-3 rounded-xl bg-cyan-500 text-black font-extrabold text-xs text-center hover:bg-cyan-400 shadow-md"
              >
                Log In / Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* WRITE / EDIT REVIEW FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-border shadow-2xl space-y-6 my-8 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  {editingReview ? "Edit Your Customer Review" : "Write a Customer Review"}
                </h3>
                <p className="text-xs text-muted-foreground truncate max-w-xs">{productName}</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                ⚠ {formError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-5">
              
              {/* Star Rating Selector */}
              <div className="space-y-2 text-center p-4 rounded-2xl bg-muted/40 border border-border/50">
                <label className="text-xs font-bold text-foreground block uppercase tracking-wider">
                  Select Rating <span className="text-red-500">*</span>
                </label>
                
                <div className="flex justify-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={cn(
                          "h-7 w-7 transition-colors",
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    </button>
                  ))}
                </div>
                
                <span className="text-xs font-extrabold text-amber-400 block">
                  {ratingLabels[hoverRating || rating]}
                </span>
              </div>

              {/* Text Review Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details of your experience with this product... (Quality, fit, packaging, performance)"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl p-3.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
                />
                <span className="text-[10px] text-muted-foreground block text-right">
                  {reviewText.trim().length} chars (minimum 5)
                </span>
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-foreground block">
                    Upload Customer Photos (Optional)
                  </label>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {existingImages.length + selectedFiles.length} / 5 photos
                  </span>
                </div>

                {/* Previews Row */}
                {(existingImages.length > 0 || imagePreviews.length > 0) && (
                  <div className="flex flex-wrap gap-2 py-1">
                    {existingImages.map((img, idx) => (
                      <div key={`existing-${idx}`} className="h-16 w-16 rounded-xl border border-border overflow-hidden bg-muted relative group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(idx)}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-red-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {imagePreviews.map((preview, idx) => (
                      <div key={`preview-${idx}`} className="h-16 w-16 rounded-xl border border-cyan-500/50 overflow-hidden bg-muted relative group">
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(idx)}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-red-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* File Upload Drop Area */}
                {existingImages.length + selectedFiles.length < 5 && (
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-border hover:border-cyan-500/50 bg-muted/30 cursor-pointer transition-colors text-center">
                    <Upload className="h-5 w-5 text-cyan-500 mb-1" />
                    <span className="text-xs font-bold text-foreground">Click to upload photos</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">JPG, PNG, WEBP up to 5MB</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-border text-foreground font-bold text-xs hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-cyan-500 text-black font-extrabold text-xs hover:bg-cyan-400 shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingReview ? "Update Review" : "Submit Review"}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* FULL-SCREEN IMAGE PREVIEW LIGHTBOX */}
      {activeEnlargedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setActiveEnlargedImage(null)}>
          <div className="relative max-w-3xl max-h-[90vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={activeEnlargedImage} alt="Enlarged review photo" className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-2xl" />
            <button
              onClick={() => setActiveEnlargedImage(null)}
              className="absolute -top-10 right-0 text-white p-2 hover:text-cyan-400 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
