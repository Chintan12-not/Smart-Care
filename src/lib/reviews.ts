import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, isFirebaseConfigured } from "./firebase";

export interface ProductReview {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  reviewText: string;
  imageUrls: string[];
  createdAt?: any;
  updatedAt?: any;
  status: "approved" | "pending";
}

// Fallback LocalStorage Key for offline / demo mode
const LOCAL_STORAGE_REVIEWS_KEY = "sc_product_reviews";

// Helper: Get local fallback reviews
function getLocalReviews(productId: string): ProductReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    if (!raw) return [];
    const list: ProductReview[] = JSON.parse(raw);
    return list.filter(r => String(r.productId) === String(productId));
  } catch (e) {
    return [];
  }
}

// Helper: Save review locally
function saveLocalReview(review: ProductReview) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    const list: ProductReview[] = raw ? JSON.parse(raw) : [];
    if (review.id) {
      const idx = list.findIndex(r => r.id === review.id);
      if (idx >= 0) {
        list[idx] = review;
      } else {
        list.unshift(review);
      }
    } else {
      review.id = `rev_local_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      list.unshift(review);
    }
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to save review locally:", e);
  }
}

// Helper: Delete review locally
function deleteLocalReview(reviewId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    if (!raw) return;
    const list: ProductReview[] = JSON.parse(raw);
    const filtered = list.filter(r => r.id !== reviewId);
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(filtered));
  } catch (e) {}
}

/**
 * Fetch approved reviews for a specific product ID from Firestore
 */
export async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
  const localList = getLocalReviews(productId);

  if (!isFirebaseConfigured()) {
    return localList;
  }

  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(
      reviewsRef,
      where("productId", "==", String(productId)),
      where("status", "==", "approved")
    );

    const snapshot = await getDocs(q);
    const firestoreReviews: ProductReview[] = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        productId: data.productId,
        userId: data.userId,
        userName: data.userName || "Verified Buyer",
        userEmail: data.userEmail || "",
        rating: Number(data.rating || 5),
        reviewText: data.reviewText || "",
        imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        status: data.status || "approved"
      };
    });

    // Merge and deduplicate with local reviews (priority: Firestore > Local)
    const firestoreIds = new Set(firestoreReviews.map(r => r.id));
    const uniqueLocal = localList.filter(r => !firestoreIds.has(r.id));
    const combined = [...firestoreReviews, ...uniqueLocal];

    // Sort by createdAt descending
    combined.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return combined;
  } catch (error) {
    console.warn("Firestore fetch reviews error, using local reviews fallback:", error);
    return localList;
  }
}

/**
 * Submit a new product review
 */
export async function createProductReview(reviewData: Omit<ProductReview, "id" | "createdAt" | "updatedAt" | "status">): Promise<ProductReview> {
  const newReview: ProductReview = {
    ...reviewData,
    productId: String(reviewData.productId),
    status: "approved", // Automatically approve for instant feedback
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured()) {
    try {
      const reviewsRef = collection(db, "reviews");
      const docRef = await addDoc(reviewsRef, {
        productId: String(reviewData.productId),
        userId: reviewData.userId,
        userName: reviewData.userName,
        userEmail: reviewData.userEmail,
        rating: Number(reviewData.rating),
        reviewText: reviewData.reviewText,
        imageUrls: reviewData.imageUrls || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "approved"
      });

      newReview.id = docRef.id;
    } catch (error) {
      console.warn("Firestore addDoc failed, saving to local fallback:", error);
      saveLocalReview(newReview);
    }
  } else {
    saveLocalReview(newReview);
  }

  return newReview;
}

/**
 * Update an existing review
 */
export async function updateProductReview(reviewId: string, updates: Partial<ProductReview>): Promise<void> {
  if (isFirebaseConfigured() && !reviewId.startsWith("rev_local_")) {
    try {
      const reviewDocRef = doc(db, "reviews", reviewId);
      await updateDoc(reviewDocRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.warn("Firestore updateDoc error:", error);
    }
  }

  // Update local fallback copy as well
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
      if (raw) {
        const list: ProductReview[] = JSON.parse(raw);
        const idx = list.findIndex(r => r.id === reviewId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
          localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(list));
        }
      }
    } catch (e) {}
  }
}

/**
 * Delete an existing review
 */
export async function deleteProductReview(reviewId: string): Promise<void> {
  if (isFirebaseConfigured() && !reviewId.startsWith("rev_local_")) {
    try {
      const reviewDocRef = doc(db, "reviews", reviewId);
      await deleteDoc(reviewDocRef);
    } catch (error) {
      console.warn("Firestore deleteDoc error:", error);
    }
  }

  deleteLocalReview(reviewId);
}

/**
 * Upload review image file (Tries Firebase Storage first; falls back to compressed Base64)
 */
export async function uploadReviewImage(file: File, productId: string, userId: string): Promise<string> {
  // Try Firebase Storage upload if configured
  if (isFirebaseConfigured()) {
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `reviews/${productId}/${userId}_${Date.now()}_${cleanFileName}`;
      const imageRef = ref(storage, storagePath);
      await uploadBytes(imageRef, file);
      const downloadUrl = await getDownloadURL(imageRef);
      return downloadUrl;
    } catch (err) {
      console.warn("Firebase Storage upload fallback (using Base64 data URL):", err);
    }
  }

  // Fallback: Convert image file to compressed Base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedUrl = canvas.toDataURL("image/jpeg", 0.8);
          resolve(compressedUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error("Failed to process image file."));
      img.src = event.target?.result as string;
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
