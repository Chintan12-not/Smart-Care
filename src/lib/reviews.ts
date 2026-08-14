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
import { db, storage } from "./firebase";

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

/**
 * Fetch approved reviews for a specific product ID directly from Firebase Firestore
 */
export async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
  try {
    const reviewsRef = collection(db, "reviews");
    // Single-field query prevents Firestore composite index requirement errors
    const q = query(
      reviewsRef,
      where("productId", "==", String(productId))
    );

    const snapshot = await getDocs(q);
    const firestoreReviews: ProductReview[] = snapshot.docs
      .map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          productId: String(data.productId),
          userId: String(data.userId),
          userName: data.userName || "Verified Buyer",
          userEmail: data.userEmail || "",
          rating: Number(data.rating || 5),
          reviewText: data.reviewText || "",
          imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          status: data.status || "approved"
        };
      })
      .filter(r => r.status === "approved");

    // Sort by createdAt descending
    firestoreReviews.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return firestoreReviews;
  } catch (error: any) {
    console.error("Firebase Firestore fetch reviews error:", error);
    return [];
  }
}

/**
 * Submit a new product review directly to Firebase Firestore
 */
export async function createProductReview(reviewData: Omit<ProductReview, "id" | "createdAt" | "updatedAt" | "status">): Promise<ProductReview> {
  try {
    const reviewsRef = collection(db, "reviews");
    const payload = {
      productId: String(reviewData.productId),
      userId: String(reviewData.userId),
      userName: reviewData.userName || "Verified Customer",
      userEmail: reviewData.userEmail || "",
      rating: Number(reviewData.rating),
      reviewText: reviewData.reviewText,
      imageUrls: reviewData.imageUrls || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: "approved"
    };

    const docRef = await addDoc(reviewsRef, payload);

    return {
      id: docRef.id,
      ...reviewData,
      productId: String(reviewData.productId),
      status: "approved",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error: any) {
    console.error("Firebase Firestore createProductReview error:", error);
    throw new Error(error?.message || "Failed to save review in Firebase Firestore. Please ensure Firestore database is enabled in Firebase Console.");
  }
}

/**
 * Update an existing review directly in Firebase Firestore
 */
export async function updateProductReview(reviewId: string, updates: Partial<ProductReview>): Promise<void> {
  try {
    const reviewDocRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    console.error("Firebase Firestore updateProductReview error:", error);
    throw new Error(error?.message || "Failed to update review in Firebase Firestore.");
  }
}

/**
 * Delete an existing review directly from Firebase Firestore
 */
export async function deleteProductReview(reviewId: string): Promise<void> {
  try {
    const reviewDocRef = doc(db, "reviews", reviewId);
    await deleteDoc(reviewDocRef);
  } catch (error: any) {
    console.error("Firebase Firestore deleteProductReview error:", error);
    throw new Error(error?.message || "Failed to delete review from Firebase Firestore.");
  }
}

/**
 * Upload review image file to Firebase Storage (with compressed Base64 fallback if storage rules block)
 */
export async function uploadReviewImage(file: File, productId: string, userId: string): Promise<string> {
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `reviews/${productId}/${userId}_${Date.now()}_${cleanFileName}`;
    const imageRef = ref(storage, storagePath);

    await uploadBytes(imageRef, file);
    const downloadUrl = await getDownloadURL(imageRef);
    if (downloadUrl) return downloadUrl;
  } catch (err: any) {
    console.warn("Firebase Storage upload fallback (using compressed Base64):", err);
  }

  // Fallback to compressed Base64 data URL
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
          resolve(canvas.toDataURL("image/jpeg", 0.8));
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
