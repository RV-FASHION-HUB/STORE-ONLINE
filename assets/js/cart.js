// Shopping Cart Module
export class CartManager {
  // Get local cart
  static getLocalCart() {
    const cart = localStorage.getItem('rvCart');
    return cart ? JSON.parse(cart) : [];
  }

  // Save local cart
  static saveLocalCart(cart) {
    localStorage.setItem('rvCart', JSON.stringify(cart));
  }

  // Add to Cart
  static addToCart(product, size, quantity = 1) {
    const cart = this.getLocalCart();
    const cartItem = {
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      imageUrl: product.imageUrl,
      size: size,
      mrp: size.mrp,
      sellingPrice: size.sellingPrice,
      quantity: quantity,
      addedAt: new Date().toISOString()
    };

    const existingItemIndex = cart.findIndex(
      item => item.productId === product.id && item.size.size === size.size
    );

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    this.saveLocalCart(cart);
    return { success: true, cart: cart };
  }

  // Remove from Cart
  static removeFromCart(productId, size) {
    const cart = this.getLocalCart();
    const filtered = cart.filter(
      item => !(item.productId === productId && item.size.size === size)
    );
    this.saveLocalCart(filtered);
    return { success: true, cart: filtered };
  }

  // Update Quantity
  static updateQuantity(productId, size, quantity) {
    const cart = this.getLocalCart();
    const item = cart.find(
      item => item.productId === productId && item.size.size === size
    );
    if (item) {
      item.quantity = Math.max(1, quantity);
    }
    this.saveLocalCart(cart);
    return { success: true, cart: cart };
  }

  // Get Cart Total
  static getCartTotal() {
    const cart = this.getLocalCart();
    const total = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
    const originalTotal = cart.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
    const discount = originalTotal - total;

    return {
      itemCount: cart.length,
      totalQuantity: cart.reduce((sum, item) => sum + item.quantity, 0),
      originalTotal: originalTotal,
      total: total,
      discount: discount,
      discountPercent: originalTotal > 0 ? Math.round((discount / originalTotal) * 100) : 0
    };
  }

  // Clear Cart
  static clearCart() {
    localStorage.removeItem('rvCart');
    return { success: true };
  }
}
