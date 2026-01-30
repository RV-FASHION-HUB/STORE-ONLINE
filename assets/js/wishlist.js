// Wishlist Management Module
export class WishlistManager {
  // Get wishlist from localStorage
  static getWishlist() {
    const wishlist = localStorage.getItem('rvWishlist');
    return wishlist ? JSON.parse(wishlist) : [];
  }

  // Save wishlist to localStorage
  static saveWishlist(wishlist) {
    localStorage.setItem('rvWishlist', JSON.stringify(wishlist));
  }

  // Add product to wishlist
  static addToWishlist(product) {
    const wishlist = this.getWishlist();
    const exists = wishlist.find(item => item.id === product.id);
    
    if (!exists) {
      wishlist.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        imageUrl: product.imageUrl,
        minPrice: Math.min(...product.sizes.map(s => s.sellingPrice)),
        mrp: Math.min(...product.sizes.map(s => s.mrp)),
        addedAt: new Date().toISOString()
      });
      this.saveWishlist(wishlist);
      return { success: true, message: 'Added to wishlist' };
    }
    return { success: false, message: 'Already in wishlist' };
  }

  // Remove product from wishlist
  static removeFromWishlist(productId) {
    const wishlist = this.getWishlist();
    const filtered = wishlist.filter(item => item.id !== productId);
    this.saveWishlist(filtered);
    return { success: true };
  }

  // Check if product is in wishlist
  static isInWishlist(productId) {
    const wishlist = this.getWishlist();
    return wishlist.some(item => item.id === productId);
  }

  // Get wishlist count
  static getWishlistCount() {
    return this.getWishlist().length;
  }

  // Clear wishlist
  static clearWishlist() {
    localStorage.removeItem('rvWishlist');
    return { success: true };
  }
}
