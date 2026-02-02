// Product Management Module
import { db, storage } from './firebase-config.js';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export class ProductManager {
  // Add Product
  static async addProduct(productData) {
    try {
      // Parse images from textarea (one per line)
      const imageUrls = productData.images || productData.imageUrl;
      let images = [];
      if (typeof imageUrls === 'string') {
        images = imageUrls.split('\n').map(url => url.trim()).filter(url => url);
      } else {
        images = Array.isArray(imageUrls) ? imageUrls : [];
      }

      const docRef = await addDoc(collection(db, 'products'), {
        name: productData.name,
        brand: productData.brand,
        category: productData.category,
        barcode: productData.barcode,
        images: images,
        imageUrl: images[0] || '', // Keep for backward compatibility
        description: productData.description,
        sizes: productData.sizes,
        totalStock: productData.totalStock,
        rating: 0,
        ratingCount: 0,
        createdAt: new Date().toISOString()
      });
      return { success: true, productId: docRef.id };
    } catch (error) {
      console.error('Error adding product:', error);
      return { success: false, error: error.message };
    }
  }

  // Get All Products
  static async getAllProducts() {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const products = [];
      querySnapshot.forEach(doc => {
        products.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, products: products };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, error: error.message };
    }
  }

  // Get Product by ID
  static async getProductById(productId) {
    try {
      const docSnap = await getDoc(doc(db, 'products', productId));
      if (docSnap.exists()) {
        return { success: true, product: { id: docSnap.id, ...docSnap.data() } };
      }
      return { success: false, error: 'Product not found' };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { success: false, error: error.message };
    }
  }

  // Filter Products
  static async filterProducts(filters) {
    try {
      const { category, brand, minPrice, maxPrice, searchQuery } = filters;
      const result = await this.getAllProducts();

      if (!result.success) return result;

      let filtered = result.products;

      if (category) {
        filtered = filtered.filter(p => p.category === category);
      }

      if (brand) {
        filtered = filtered.filter(p => p.brand === brand);
      }

      if (minPrice || maxPrice) {
        filtered = filtered.filter(p => {
          const minProductPrice = Math.min(...p.sizes.map(s => s.sellingPrice));
          const maxProductPrice = Math.max(...p.sizes.map(s => s.sellingPrice));
          
          if (minPrice && minProductPrice < minPrice) return false;
          if (maxPrice && maxProductPrice > maxPrice) return false;
          return true;
        });
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.barcode === query
        );
      }

      return { success: true, products: filtered };
    } catch (error) {
      console.error('Error filtering products:', error);
      return { success: false, error: error.message };
    }
  }

  // Update Product Stock
  static async updateProductStock(productId, sizeIndex, quantityChange) {
    try {
      const result = await this.getProductById(productId);
      if (!result.success) return result;

      const product = result.product;
      const newStock = product.sizes[sizeIndex].stock + quantityChange;
      
      if (newStock < 0) {
        return { success: false, error: 'Insufficient stock' };
      }

      product.sizes[sizeIndex].stock = newStock;
      product.totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);

      await updateDoc(doc(db, 'products', productId), product);
      return { success: true, product: product };
    } catch (error) {
      console.error('Error updating stock:', error);
      return { success: false, error: error.message };
    }
  }

  // Add Rating with Customer Info
  static async addRating(productId, rating, customerId, customerName, customerPhone, reviewText = '', reviewImages = []) {
    try {
      // Store review in reviews collection (not subcollection for better permission handling)
      await addDoc(collection(db, 'reviews'), {
        productId: productId,
        customerId: customerId,
        customerName: customerName,
        customerPhone: customerPhone,
        rating: rating,
        reviewText: reviewText,
        reviewImages: reviewImages, // Array of image URLs
        createdAt: new Date().toISOString()
      });

      // Update product's average rating
      const result = await this.getProductById(productId);
      if (!result.success) return result;

      const product = result.product;
      const totalRating = (product.rating * product.ratingCount) + rating;
      product.ratingCount += 1;
      product.rating = totalRating / product.ratingCount;

      await updateDoc(doc(db, 'products', productId), {
        rating: product.rating,
        ratingCount: product.ratingCount
      });
      return { success: true, product: product };
    } catch (error) {
      console.error('Error adding rating:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all reviews for a product
  static async getProductReviews(productId) {
    try {
      const q = query(collection(db, 'reviews'), where('productId', '==', productId));
      const querySnapshot = await getDocs(q);
      const reviews = [];
      querySnapshot.forEach(doc => {
        reviews.push({ id: doc.id, ...doc.data() });
      });
      // Sort by newest first
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { success: true, reviews: reviews };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete a review
  static async deleteReview(reviewId) {
    try {
      // Read the review first to obtain productId and rating
      const reviewRef = doc(db, 'reviews', reviewId);
      const reviewSnap = await getDoc(reviewRef);
      if (!reviewSnap.exists()) {
        return { success: false, error: 'Review not found' };
      }

      const review = reviewSnap.data();
      const productId = review.productId;
      const ratingValue = typeof review.rating === 'number' ? review.rating : parseFloat(review.rating) || 0;

      // Delete the review document
      await deleteDoc(reviewRef);

      // Update product's aggregated rating and count
      if (productId) {
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const product = productSnap.data();
          const oldCount = typeof product.ratingCount === 'number' ? product.ratingCount : (parseInt(product.ratingCount) || 0);
          const oldRating = typeof product.rating === 'number' ? product.rating : (parseFloat(product.rating) || 0);

          const newCount = Math.max(0, oldCount - 1);
          let newRating = 0;
          if (newCount === 0) {
            newRating = 0;
          } else {
            const totalRating = (oldRating * oldCount) - ratingValue;
            newRating = totalRating / newCount;
          }

          await updateDoc(productRef, {
            rating: newRating,
            ratingCount: newCount
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting review:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all reviews (for admin)
  static async getAllReviews() {
    try {
      const querySnapshot = await getDocs(collection(db, 'reviews'));
      const reviews = [];
      querySnapshot.forEach(doc => {
        reviews.push({ id: doc.id, ...doc.data() });
      });
      // Sort by newest first
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { success: true, reviews: reviews };
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete Product
  static async deleteProduct(productId) {
    try {
      await deleteDoc(doc(db, 'products', productId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
  }
}
