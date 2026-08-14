import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
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

// Fallback LocalStorage Key for offline / instant UI response
const LOCAL_STORAGE_REVIEWS_KEY = "sc_product_reviews";

/**
 * Timeout Wrapper: Ensures async promises reject cleanly if they exceed timeoutMs
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 3500): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then(res => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Helper: Read reviews saved in LocalStorage
 */
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

/**
 * Helper: Save review to LocalStorage
 */
function saveLocalReview(review: ProductReview) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    const list: ProductReview[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(r => r.id === review.id);
    if (idx >= 0) {
      list[idx] = review;
    } else {
      list.unshift(review);
    }
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to save review locally:", e);
  }
}

/**
 * Helper: Update review in LocalStorage
 */
function updateLocalReview(reviewId: string, updates: Partial<ProductReview>) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    if (!raw) return;
    const list: ProductReview[] = JSON.parse(raw);
    const idx = list.findIndex(r => r.id === reviewId);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(list));
    }
  } catch (e) {}
}

/**
 * Helper: Delete review from LocalStorage
 */
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
 * Fetch approved reviews for a specific product ID
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

    const snapshot = await withTimeout(getDocs(q), 3500);
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
 * Submit a new product review (Instantly saves locally + syncs to Firestore)
 */
export async function createProductReview(reviewData: Omit<ProductReview, "id" | "createdAt" | "updatedAt" | "status">): Promise<ProductReview> {
  const generatedId = `rev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const newReview: ProductReview = {
    ...reviewData,
    id: generatedId,
    productId: String(reviewData.productId),
    status: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Instant local save so UI never hangs
  saveLocalReview(newReview);

  if (isFirebaseConfigured()) {
    try {
      const reviewsRef = collection(db, "reviews");
      const docRef = await withTimeout(
        addDoc(reviewsRef, {
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
        }),
        3500
      );

      if (docRef && docRef.id) {
        newReview.id = docRef.id;
        saveLocalReview(newReview);
      }
    } catch (error) {
      console.warn("Firestore addDoc timeout or error, saved locally:", error);
    }
  }

  return newReview;
}

/**
 * Update an existing review
 */
export async function updateProductReview(reviewId: string, updates: Partial<ProductReview>): Promise<void> {
  updateLocalReview(reviewId, updates);

  if (isFirebaseConfigured() && !reviewId.startsWith("rev_local_") && !reviewId.startsWith("rev_")) {
    try {
      const reviewDocRef = doc(db, "reviews", reviewId);
      await withTimeout(
        updateDoc(reviewDocRef, {
          ...updates,
          updatedAt: serverTimestamp()
        }),
        3500
      );
    } catch (error) {
      console.warn("Firestore updateDoc timeout or error:", error);
    }
  }
}

/**
 * Delete an existing review
 */
export async function deleteProductReview(reviewId: string): Promise<void> {
  deleteLocalReview(reviewId);

  if (isFirebaseConfigured() && !reviewId.startsWith("rev_local_") && !reviewId.startsWith("rev_")) {
    try {
      const reviewDocRef = doc(db, "reviews", reviewId);
      await withTimeout(deleteDoc(reviewDocRef), 3500);
    } catch (error) {
      console.warn("Firestore deleteDoc timeout or error:", error);
    }
  }
}

/**
 * Convert Image file to compressed Base64 Data URL
 */
function convertFileToBase64(file: File): Promise<string> {
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

/**
 * Upload review image file (Firebase Storage with 3s timeout + instant Base64 fallback)
 */
export async function uploadReviewImage(file: File, productId: string, userId: string): Promise<string> {
  if (isFirebaseConfigured()) {
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `reviews/${productId}/${userId}_${Date.now()}_${cleanFileName}`;
      const imageRef = ref(storage, storagePath);

      await withTimeout(uploadBytes(imageRef, file), 3000);
      const downloadUrl = await withTimeout(getDownloadURL(imageRef), 2000);
      if (downloadUrl) return downloadUrl;
    } catch (err) {
      console.warn("Firebase Storage upload timeout or error (using Base64 data URL):", err);
    }
  }

  return convertFileToBase64(file);
}
