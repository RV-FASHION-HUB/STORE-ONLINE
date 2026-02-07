// Main Application Script
import { AuthManager } from './auth.js';
import { ProductManager } from './product.js';
import { CartManager } from './cart.js';
import { OrderManager } from './order.js';
import { WishlistManager } from './wishlist.js';
import { db } from './firebase-config.js';
import { doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Global Variables
let allProducts = [];
let currentUser = null;
let productsCache = null; // Cache products to avoid repeated Firestore calls
let lastFilterTime = 0; // For debouncing filters

// Pre-declare and expose critical functions to window to prevent ReferenceError
// These will be properly defined below, but window references must exist first
window.showPage = function() {};
window.handleLogin = function() {};
window.handleSignup = function() {};
window.logout = function() {};
window.toggleUserMenu = function() {};
window.showProductDetail = function() {};
window.applyFilters = function() {};
window.resetFilters = function() {};
window.proceedToCheckout = function() {};
window.processPayment = function() {};
window.showAddressForm = function() {};
window.closeAddressForm = function() {};
window.updateQuantity = function() {};
window.removeFromCart = function() {};
window.quickAddToCart = function() {};
window.handleMainSearch = function() {};
window.showAdminSection = function() {};
window.addToWishlist = function() {};
window.removeFromWishlist = function() {};
window.toggleWishlist = function() {};
window.displayWishlist = function() {};
window.saveAboutSettings = function() {};
window.saveProduct = function() {};
window.deleteProductAdmin = function() {};
window.updateStockAdmin = function() {};
window.updateOrderStatusAdmin = function() {};
window.printBill = function() {};
window.sendWhatsAppUpdate = function() {};
window.exportOrdersCSV = function() {};
window.showOrderTracking = function() {};
window.closeProductForm = function() {};
window.loadProductsAdmin = function() {};
window.loadDashboard = function() {};
window.loadInventory = function() {};
window.loadOrdersAdmin = function() {};
window.handleProductUrlParam = function() {};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  // Check for logged-in user
  currentUser = AuthManager.getCurrentUser();
  updateUserUI();
  
  // Load all products
  await loadProducts();
  
  // Update cart count
  updateCartCount();
  
  // Update wishlist count
  updateWishlistCount();
  
  // Load about page settings
  await loadAboutSettings();
  
  // Set default page to shop (removed home page)
  showPage('shop');
  loadFilters();
  
  // Handle product share URLs
  handleProductUrlParam();
  
  // Setup search
  document.getElementById('searchInput').addEventListener('keyup', handleMainSearch);
});

// ========== PAGE NAVIGATION ==========
function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page-container').forEach(page => {
    page.classList.add('hidden');
  });
  
  // Show selected page
  const pagesToShow = {
    'shop': 'shop-page',
    'about': 'about-page',
    'login': 'login-page',
    'signup': 'signup-page',
    'cart': 'cart-page',
    'wishlist': 'wishlist-page',
    'checkout': 'checkout-page',
    'myorders': 'myorders-page',
    'ordertracking': 'ordertracking-page',
    'addresses': 'addresses-page',
    'admin': 'admin-page'
  };
  
  const pageId = pagesToShow[pageName];
  if (pageId) {
    document.getElementById(pageId).classList.remove('hidden');
    
    // Load specific page content
    if (pageName === 'shop') {
      displayProducts(allProducts);
    } else if (pageName === 'cart') {
      displayCart();
    } else if (pageName === 'wishlist') {
      displayWishlist();
    } else if (pageName === 'account') {
      displayAccountPage();
    } else if (pageName === 'checkout') {
      displayCheckout();
    } else if (pageName === 'myorders') {
      displayMyOrders();
    } else if (pageName === 'addresses') {
      displayAddressesManagement();
    }
  }
  
  window.scrollTo(0, 0);
}

// ========== AUTHENTICATION ==========
async function handleLogin() {
  const phone = document.getElementById('loginPhone').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  if (!phone || !password) {
    alert('Please fill all fields');
    return;
  }
  
  if (!/^\d{10}$/.test(phone)) {
    alert('Please enter a valid 10-digit mobile number');
    return;
  }
  
  const result = await AuthManager.loginCustomer(phone, password);
  
  if (result.success) {
    AuthManager.setCurrentUser(result.user);
    currentUser = result.user;
    updateUserUI();
    alert('Login successful!');
    showPage('home');
  } else {
    alert('Login failed: ' + result.error);
  }
}

async function handleSignup() {
  const name = document.getElementById('signupName').value.trim();
  const phone = document.getElementById('signupPhone').value.trim();
  const password = document.getElementById('signupPassword').value;
  
  if (!name || !phone || !password) {
    alert('Please fill all fields');
    return;
  }
  
  if (!/^\d{10}$/.test(phone)) {
    alert('Please enter a valid 10-digit mobile number');
    return;
  }
  
  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  const result = await AuthManager.registerCustomer(phone, password, name);
  
  if (result.success) {
    AuthManager.setCurrentUser(result.user);
    currentUser = result.user;
    updateUserUI();
    alert('Account created successfully!');
    document.getElementById('signupName').value = '';
    document.getElementById('signupPhone').value = '';
    document.getElementById('signupPassword').value = '';
    showPage('home');
  } else {
    alert('Signup failed: ' + result.error);
  }
}

async function logout() {
  const result = await AuthManager.logout();
  if (result.success) {
    AuthManager.setCurrentUser(null);
    currentUser = null;
    updateUserUI();
    CartManager.clearCart();
    updateCartCount();
    alert('Logged out successfully!');
    showPage('home');
  }
}

function updateUserUI() {
  const loginLink = document.getElementById('loginLink');
  const myOrdersLink = document.getElementById('myOrdersLink');
  const addressesLink = document.getElementById('addressesLink');
  const logoutBtn = document.getElementById('logoutBtn');
  const userDisplayName = document.getElementById('userDisplayName');
  const adminLink = document.getElementById('adminLink');
  
  if (currentUser) {
    userDisplayName.textContent = currentUser.name || 'Account';
    loginLink.classList.add('hidden');
    myOrdersLink.classList.remove('hidden');
    addressesLink.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    
    // Show admin link only if user is admin
    if (currentUser.isAdmin) {
      adminLink.classList.remove('hidden');
    } else {
      adminLink.classList.add('hidden');
    }
  } else {
    userDisplayName.textContent = 'Account';
    loginLink.classList.remove('hidden');
    myOrdersLink.classList.add('hidden');
    addressesLink.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    adminLink.classList.add('hidden');
  }
}

function toggleUserMenu() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const userMenu = document.querySelector('.user-menu');
  if (!userMenu.contains(e.target)) {
    document.getElementById('userDropdown').classList.remove('active');
  }
});

// ========== PRODUCT MANAGEMENT ==========
async function loadProducts() {
  // Use cache if available
  if (productsCache) {
    allProducts = productsCache;
    displayProducts(allProducts);
    loadFilters();
    initFilterDrawer(); // Initialize filter drawer for mobile
    return;
  }
  
  const result = await ProductManager.getAllProducts();
  if (result.success) {
    allProducts = result.products;
    productsCache = allProducts; // Cache for future use
    displayProducts(allProducts);
    loadFilters();
    initFilterDrawer(); // Initialize filter drawer for mobile
  }
}

async function displayProducts(products) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';
  
  if (products.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">No products found</p>';
    return;
  }
  
  products.forEach(product => {
    // Ensure product has sizes array
    if (!product.sizes || !Array.isArray(product.sizes) || product.sizes.length === 0) {
      return; // Skip products without valid sizes
    }
    
    // Get primary image (first in array or fallback to imageUrl)
    const primaryImage = (product.images && product.images.length > 0) ? product.images[0] : (product.imageUrl || 'placeholder.jpg');
    
    const minPrice = Math.min(...product.sizes.map(s => s.sellingPrice));
    const maxPrice = Math.max(...product.sizes.map(s => s.sellingPrice));
    const minMRP = Math.min(...product.sizes.map(s => s.mrp));
    const discount = Math.round(((minMRP - minPrice) / minMRP) * 100);
    const isOutOfStock = product.totalStock === 0;
    
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);
    card.innerHTML = `
      <div class="product-image" style="position: relative;">
        <img src="${primaryImage}" alt="${product.name}" onclick="showProductDetail('${product.id}')" loading="lazy">
        ${isOutOfStock ? '<div class="sold-out-badge">SOLD OUT</div>' : ''}
        <div class="discount-badge">-${discount}%</div>
        <div class="price-badge">₹${minPrice}</div>
        <div class="wishlist-heart" style="position: absolute; bottom: 10px; right: 10px; cursor: pointer; font-size: 26px; font-weight: bold; text-shadow: 0 0 2px rgba(0,0,0,0.3);" onclick="toggleWishlist('${product.id}')" title="Add to Wishlist">♡</div>
      </div>
      <div class="product-info">
        <div class="product-brand">${product.brand}</div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-rating">
          <span class="stars">${'★'.repeat(Math.round(product.rating || 0))}${'☆'.repeat(5-Math.round(product.rating || 0))}</span>
          <span class="rating-count">(${product.ratingCount || 0} ratings)</span>
        </div>
        <div class="product-prices">
          <span class="product-mrp">₹${minMRP}</span>
          <span class="product-price">₹${minPrice}</span>
          <span class="product-discount">${discount}% off</span>
        </div>
        <div class="product-stock">${isOutOfStock ? 'Out of Stock' : `${product.totalStock} in stock`}</div>
        <div class="product-actions">
          <button class="btn btn-primary" onclick="showProductDetail('${product.id}')" ${isOutOfStock ? 'disabled' : ''}>
            View Details
          </button>
          <button class="btn btn-outline" onclick="quickAddToCart('${product.id}')" ${isOutOfStock ? 'disabled' : ''}>
            Add to Cart
          </button>
        </div>
        <div class="share-action" style="text-align: center; margin-top: 8px;">
          <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;" onclick="shareProduct('${product.id}', '${product.name.replace(/'/g, "\\'")}')">
            📤 Share Product
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  // Update heart icons according to wishlist state
  updateWishlistIcons();
}

async function showProductDetail(productId) {
  const result = await ProductManager.getProductById(productId);
  if (!result.success) return;
  
  const product = result.product;
  const modal = document.getElementById('productDetailModal');
  const content = document.getElementById('productDetailContent');
  
  // Get product images
  const images = (product.images && product.images.length > 0) ? product.images : [product.imageUrl];
  const primaryImage = images[0] || 'placeholder.jpg';
  
  const minMRP = Math.min(...product.sizes.map(s => s.mrp));
  const minPrice = Math.min(...product.sizes.map(s => s.sellingPrice));
  const discount = Math.round(((minMRP - minPrice) / minMRP) * 100);
  const isOutOfStock = product.totalStock === 0;
  
  let sizesHTML = '';
  product.sizes.forEach(size => {
    const discountPercent = Math.round(((size.mrp - size.sellingPrice) / size.mrp) * 100);
    const outOfStock = (size.stock === 0 || size.stock === undefined);
    sizesHTML += `
      <div class="size-option ${outOfStock ? 'size-out' : ''}" data-size='${JSON.stringify(size)}' onclick="selectSize(this)" style="${outOfStock ? 'opacity:0.5; cursor: not-allowed;' : 'cursor: pointer;'}">
        <div style="font-weight: 700;">${size.size} ${outOfStock ? '<span style="font-size:12px; color: #c0392b; font-weight:700;">(Out)</span>' : ''}</div>
        <div style="font-size: 12px;">₹${size.sellingPrice}</div>
        <div style="font-size: 11px; color: var(--text-light);">Was ₹${size.mrp}</div>
      </div>
    `;
  });

  // Load reviews
  const reviewsResult = await ProductManager.getProductReviews(productId);
  const reviews = reviewsResult.success ? reviewsResult.reviews : [];
  
  let reviewsHTML = '';
  if (reviews.length > 0) {
    reviewsHTML = reviews.map(review => {
      const maskedName = review.customerName ? review.customerName.slice(0, 3) + '****' : '****';
      return `
      <div style="border: 2px solid var(--border-color); padding: 25px; border-radius: 10px; margin-bottom: 25px; background: linear-gradient(135deg, #f9f9f9 0%, #fff 100%); box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
          <div>
            <strong style="font-size: 22px; display: block; margin-bottom: 8px; color: var(--text-dark);">${maskedName}</strong>
            
          </div>
          <div style="color: var(--secondary-color); font-weight: 700; font-size: 28px;">
            ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
          </div>
        </div>
        ${review.reviewText ? `<p style="margin: 18px 0; font-size: 19px; line-height: 1.8; color: var(--text-dark);">"${review.reviewText}"</p>` : ''}
        <div style="font-size: 15px; color: var(--text-light); margin-top: 14px; font-style: italic;">
          ${new Date(review.createdAt).toLocaleDateString()}
        </div>
      </div>
    `;
    }).join('');
  }
  
  content.innerHTML = `
    <div class="product-detail-modal">
      <div>
        <div class="product-detail-image" style="position: relative;" data-product-id="${product.id}">
          <img id="mainProductImage" src="${primaryImage}" alt="${product.name}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px;">
          ${isOutOfStock ? '<div class="sold-out-badge">SOLD OUT</div>' : ''}
          <div class="wishlist-heart" data-product-id="${product.id}" style="position: absolute; bottom: 10px; right: 10px; cursor: pointer; font-size: 28px; font-weight: bold; text-shadow: 0 0 2px rgba(0,0,0,0.3);" onclick="toggleWishlist('${product.id}')" title="Add to Wishlist">♡</div>
        </div>
        ${images.length > 1 ? `
          <div style="display: flex; gap: 8px; margin-top: 10px; overflow-x: auto;">
            ${images.map((img, idx) => `<img src="${img}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid ${idx === 0 ? 'var(--primary-color)' : 'transparent'};" onclick="document.getElementById('mainProductImage').src='${img}'; this.parentElement.querySelectorAll('img').forEach(i => i.style.border='2px solid transparent'); this.style.border='2px solid var(--primary-color)';">`).join('')}
          </div>
        ` : ''}
        <div style="color: var(--text-light); font-size: 14px; margin-top: 15px;">
          <strong>Barcode:</strong> ${product.barcode}
        </div>
      </div>
      <div class="product-detail-info">
        <h2>${product.name}</h2>
        <div class="product-brand">${product.brand}</div>
        <div class="product-detail-rating">
          <span class="stars">${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5-Math.round(product.rating))}</span>
          <span style="color: var(--text-light);">(${product.ratingCount} ratings)</span>
        </div>
        <div style="margin: 20px 0; padding: 15px 0; border-bottom: 1px solid var(--border-color);">
          <div style="font-size: 24px; font-weight: 700; color: var(--primary-color); margin-bottom: 5px;">
            ₹${minPrice}
          </div>
          <div style="text-decoration: line-through; color: var(--text-light); margin-bottom: 5px;">
            ₹${minMRP}
          </div>
          <div style="color: var(--success); font-weight: 600;">Save ${discount}% (₹${minMRP - minPrice})</div>
        </div>
        <p>${product.description || 'Premium quality clothing product'}</p>
        
        <div class="size-selector">
          <div class="size-selector-title">Select Size</div>
          <div class="size-options">
            ${sizesHTML}
          </div>
        </div>
        
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-primary" style="flex: 1; min-width: 120px;" onclick="addToCart('${productId}')" ${isOutOfStock ? 'disabled' : ''}>
            Add to Cart
          </button>
          <button class="btn btn-outline" style="flex: 1; min-width: 120px;" onclick="buyNow('${productId}')" ${isOutOfStock ? 'disabled' : ''}>
            Buy Now
          </button>
          <button class="btn btn-outline" style="padding: 10px 16px;" onclick="shareProduct('${product.id}', '${product.name.replace(/'/g, "\\'")}')" title="Share Product">
            📤 Share
          </button>
        </div>
        
        <div class="rating-section">
          <h3 style="margin-top: 30px; margin-bottom: 20px; border-top: 1px solid var(--border-color); padding-top: 20px;">Customer Reviews (${reviews.length})</h3>
          ${currentUser ? `
            <div style="background-color: var(--light-bg); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h4 style="margin-bottom: 15px;">Share Your Experience</h4>
              <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Rating</label>
                <div class="stars-input" id="ratingStars">
                  <span class="star-input" data-rating="1" onclick="selectRating(1)" style="cursor: pointer; font-size: 24px;">★</span>
                  <span class="star-input" data-rating="2" onclick="selectRating(2)" style="cursor: pointer; font-size: 24px;">★</span>
                  <span class="star-input" data-rating="3" onclick="selectRating(3)" style="cursor: pointer; font-size: 24px;">★</span>
                  <span class="star-input" data-rating="4" onclick="selectRating(4)" style="cursor: pointer; font-size: 24px;">★</span>
                  <span class="star-input" data-rating="5" onclick="selectRating(5)" style="cursor: pointer; font-size: 24px;">★</span>
                </div>
              </div>
              <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Your Review</label>
                <textarea id="reviewText" placeholder="Share your experience with this product..." style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 4px; font-family: inherit;" rows="3"></textarea>
              </div>
              <button class="btn btn-primary" onclick="submitRating('${productId}')" style="width: 100%;">Submit Review</button>
            </div>
          ` : `
            <div style="background-color: var(--light-bg); padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
              <p style="margin: 0; color: var(--text-light);">Please <a href="#" onclick="showPage('login'); return false;" style="color: var(--primary-color); font-weight: 600;">login</a> to leave a review</p>
            </div>
          `}
          
          <div style="margin-top: 20px;">
            ${reviews.length > 0 ? reviewsHTML : '<p style="text-align: center; color: var(--text-light);">No reviews yet. Be the first to review!</p>'}
          </div>
        </div>
      </div>
    </div>
  `;
  // Ensure wishlist icon state is correct when modal opens
  updateWishlistIcons();
  
  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function selectSize(element) {
  try {
    // Prevent selecting sizes that are marked out of stock
    const sizeData = element && element.dataset && element.dataset.size ? JSON.parse(element.dataset.size) : null;
    if (sizeData && (sizeData.stock === 0 || sizeData.stock === undefined)) {
      alert('Selected size is out of stock. Please choose another size.');
      return;
    }

    document.querySelectorAll('.size-option').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
  } catch (err) {
    console.error('Error in selectSize:', err);
  }
}

window.selectSize = selectSize;

function selectRating(rating) {
  const stars = document.querySelectorAll('.star-input');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
      star.style.color = 'var(--secondary-color)';
    } else {
      star.classList.remove('active');
      star.style.color = '#ccc';
    }
  });
}

async function submitRating(productId) {
  if (!currentUser) {
    alert('Please login to submit a review');
    return;
  }
  
  // Get rating value - count the number of active stars
  const activeStars = document.querySelectorAll('.star-input.active').length;
  const rating = activeStars > 0 ? activeStars : 0;
  
  if (rating === 0) {
    alert('Please select a rating');
    return;
  }
  
  // Get review text
  const reviewText = (document.getElementById('reviewText')?.value || '').trim();
  
  try {
    const result = await ProductManager.addRating(
      productId,
      rating,
      currentUser.uid,
      currentUser.displayName || currentUser.email.split('@')[0],
      currentUser.phone || 'N/A',
      reviewText,
      []
    );
    
    if (result.success) {
      // Show success message in modal instead of alert
      const reviewForm = document.querySelector('.rating-section');
      if (reviewForm) {
        const successMsg = document.createElement('div');
        successMsg.style.cssText = 'background-color: var(--success); color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: 600;';
        successMsg.textContent = '✓ Thank you! Your review has been submitted.';
        reviewForm.prepend(successMsg);
        
        setTimeout(() => {
          successMsg.remove();
        }, 3000);
      }
      
      // Clear form
      document.getElementById('reviewText').value = '';
      document.querySelectorAll('.star-input').forEach(el => el.classList.remove('active'));
      
      // Reload product detail to show new review
      setTimeout(() => {
        showProductDetail(productId);
      }, 1500);
    } else {
      alert('Failed to submit review: ' + result.error);
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('Error submitting review');
  }
}

window.submitRating = submitRating;
window.selectRating = selectRating;

function closeProductDetail() {
  document.getElementById('productDetailModal').classList.remove('active');
  document.body.classList.remove('modal-open');
}

window.closeProductDetail = closeProductDetail;

// ========== FILTERS ==========
async function loadFilters() {
  const categories = [...new Set(allProducts.map(p => p.category))];
  const brands = [...new Set(allProducts.map(p => p.brand))];
  
  // Load categories in header navigation
  const categoriesList = document.getElementById('categoriesList');
  if (categoriesList) {
    categoriesList.innerHTML = categories.map(cat => `
      <a href="#" onclick="filterByCategory('${cat}'); return false;">${cat}</a>
    `).join('');
  }
  
  // Load brands
  const brandFilter = document.getElementById('brandFilter');
  if (brandFilter) {
    brandFilter.innerHTML = brands.map(brand => `
      <label class="filter-option">
        <input type="checkbox" value="${brand}" onchange="applyFilters()">
        <span>${brand}</span>
      </label>
    `).join('');
  }
}

async function loadShopPageReviews() {
  try {
    const result = await ProductManager.getAllReviews();
    const reviewsContainer = document.getElementById('shopPageReviews');
    
    if (!reviewsContainer) return;
    
    if (!result.success || !result.reviews || result.reviews.length === 0) {
      reviewsContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); font-size: 16px;">No reviews yet</p>';
      return;
    }
    
    // Get product names for each review
    const productsResult = await ProductManager.getAllProducts();
    const productsMap = {};
    if (productsResult.success) {
      productsResult.products.forEach(p => {
        productsMap[p.id] = p.name;
      });
    }
    
    // Display latest 5 reviews with LARGE fonts
    const latestReviews = result.reviews.slice(0, 5);
    
    reviewsContainer.innerHTML = latestReviews.map(review => {
      const productName = productsMap[review.productId] || 'Unknown Product';
      const maskedName = review.customerName ? review.customerName.slice(0, 3) + '****' : '****';
      return `
        <div style="border: 2px solid var(--border-color); padding: 18px; border-radius: 8px; margin-bottom: 18px; background: linear-gradient(135deg, #f9f9f9 0%, #fff 100%); box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <div>
              <strong style="font-size: 20px; display: block; margin-bottom: 8px; color: var(--text-dark);">${maskedName}</strong>
              
              <div style="font-size: 15px; color: var(--primary-color); font-weight: 600;">${productName}</div>
            </div>
            <div style="color: var(--secondary-color); font-weight: 700; font-size: 24px; text-align: right;">
              ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
            </div>
          </div>
          ${review.reviewText ? `<p style="margin: 18px 0; font-size: 18px; line-height: 1.7; color: var(--text-dark);">"${review.reviewText}"</p>` : ''}
          <div style="font-size: 15px; color: var(--text-light); margin-top: 12px; font-style: italic;">
            ${new Date(review.createdAt).toLocaleDateString()}
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading shop page reviews:', error);
  }
}

// Filter by category from header navigation
function filterByCategory(category) {
  showPage('shop');
  const filtered = allProducts.filter(p => p.category === category);
  displayProducts(filtered);
}

// (no subcategory filter function)

async function applyFilters() {
  // Debounce: prevent excessive filtering (max 1 filter per 300ms)
  const now = Date.now();
  if (now - lastFilterTime < 300) return;
  lastFilterTime = now;
  
  const selectedCategories = Array.from(document.querySelectorAll('#categoryFilter input:checked')).map(el => el.value);
  const selectedBrands = Array.from(document.querySelectorAll('#brandFilter input:checked')).map(el => el.value);
  const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
  const maxPrice = parseInt(document.getElementById('maxPrice').value) || 1000000;
  const searchQuery = document.getElementById('filterSearch').value;
  
  let filtered = allProducts;
  
  if (selectedCategories.length > 0) {
    filtered = filtered.filter(p => selectedCategories.includes(p.category));
  }
  
  if (selectedBrands.length > 0) {
    filtered = filtered.filter(p => selectedBrands.includes(p.brand));
  }
  
  
  filtered = filtered.filter(p => {
    const minProductPrice = Math.min(...p.sizes.map(s => s.sellingPrice));
    return minProductPrice >= minPrice && minProductPrice <= maxPrice;
  });
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.barcode === query
    );
  }
  
  displayProducts(filtered);
  
  // Close filter drawer on mobile after applying filters
  closeFilterDrawer();
}

function resetFilters() {
  document.querySelectorAll('#categoryFilter input, #brandFilter input').forEach(el => el.checked = false);
  document.getElementById('minPrice').value = '';
  document.getElementById('maxPrice').value = '';
  document.getElementById('filterSearch').value = '';
  displayProducts(allProducts);
  
  // Close filter drawer on mobile after resetting filters
  closeFilterDrawer();
}

// ========== CSV Export/Import ==========
function escapeCsv(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  return '"' + str.replace(/"/g, '""') + '"';
}

function downloadProductsCSV() {
  try {
    const rows = [];
    const headers = ['productId','name','brand','category','barcode','imageUrl','images','description','sizes','totalStock'];
    rows.push(headers.join(','));

    // Use allProducts (already loaded)
    allProducts.forEach(p => {
      const imagesField = Array.isArray(p.images) ? p.images.join('|') : (p.imageUrl || '');
      const sizesField = p.sizes ? JSON.stringify(p.sizes) : '';
      const row = [
        escapeCsv(p.id || ''),
        escapeCsv(p.name || ''),
        escapeCsv(p.brand || ''),
        escapeCsv(p.category || ''),
        escapeCsv(p.barcode || ''),
        escapeCsv(p.imageUrl || ''),
        escapeCsv(imagesField),
        escapeCsv(p.description || ''),
        escapeCsv(sizesField),
        escapeCsv(p.totalStock || '')
      ].join(',');
      rows.push(row);
    });

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_export.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error exporting CSV:', err);
    alert('Failed to export CSV: ' + err.message);
  }
}

function downloadProductsTemplate() {
  const headers = ['name','brand','category','barcode','imageUrl','images','description','sizes','totalStock'];
  // sizes: JSON array example -> [{"size":"S","mrp":1000,"sellingPrice":800,"stock":10}]
  const exampleSizes = '[{"size":"S","mrp":1000,"sellingPrice":800,"stock":10}]';
  const sampleRow = [
    'Sample Product',
    'SampleBrand',
    'SampleCategory',
    'SAMPLE123',
    'https://example.com/image.jpg',
    'https://example.com/image.jpg|https://example.com/2.jpg',
    'Short description',
    exampleSizes,
    '10'
  ];
  const csv = headers.join(',') + '\n' + sampleRow.map(escapeCsv).join(',');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products_template.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result.map(s => s.replace(/^"|"$/g, '').trim());
}

function parseSizesField(s) {
  if (!s) return [];
  s = s.trim();
  if (!s) return [];
  try {
    if (s.startsWith('[') || s.startsWith('{')) {
      return JSON.parse(s);
    }
  } catch (e) {
    // fallthrough
  }
  // fallback format: S:mrp:price:stock;M:mrp:price:stock
  const parts = s.split(/;|\|/).map(p => p.trim()).filter(Boolean);
  const sizes = parts.map(p => {
    const seg = p.split(':').map(x => x.trim());
    return {
      size: seg[0] || '',
      mrp: parseInt(seg[1]) || 0,
      sellingPrice: parseInt(seg[2]) || parseInt(seg[1]) || 0,
      stock: parseInt(seg[3]) || 0
    };
  });
  return sizes;
}

async function uploadProductsCSV(e) {
  try {
    const file = e.target.files ? e.target.files[0] : e;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(ev) {
      const text = ev.target.result;
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) { alert('CSV appears empty'); return; }
      const header = parseCSVLine(lines[0]).map(h => h.toLowerCase());
      const results = { added: 0, failed: 0, errors: [] };
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        const row = {};
        header.forEach((h, idx) => row[h] = cols[idx] || '');

        // Build productData expected by ProductManager.addProduct
        const productData = {
          name: row.name || row.productname || row.product || '',
          brand: row.brand || '',
          category: row.category || '',
          barcode: row.barcode || '',
          imageUrl: row.imageurl || row.image || '',
          images: (row.images || '').split('|').map(x => x.trim()).filter(Boolean),
          description: row.description || '',
          sizes: parseSizesField(row.sizes || ''),
          totalStock: parseInt(row.totalstock) || undefined
        };

        try {
          const res = await ProductManager.addProduct(productData);
          if (res && res.success) results.added++; else { results.failed++; results.errors.push({line:i+1,error: res && res.error ? res.error : 'unknown'}); }
        } catch (err) {
          results.failed++; results.errors.push({line:i+1,error: err.message});
        }
      }
      alert(`Import complete. Added: ${results.added}, Failed: ${results.failed}`);
      if (results.added > 0) { await loadProducts(); loadProductsAdmin(); }
      if (results.errors.length) console.error('Import errors:', results.errors);
    };
    reader.readAsText(file, 'UTF-8');
  } catch (err) {
    console.error('Upload CSV failed:', err);
    alert('Upload failed: ' + err.message);
  } finally {
    // reset file input
    const input = document.getElementById('csvUploadInput');
    if (input) input.value = '';
  }
}

window.downloadProductsCSV = downloadProductsCSV;
window.downloadProductsTemplate = downloadProductsTemplate;
window.uploadProductsCSV = uploadProductsCSV;

async function handleMainSearch() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  
  if (!query) {
    return;
  }
  
  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.brand.toLowerCase().includes(query) ||
    p.barcode === query
  );
  
  showPage('shop');
  displayProducts(filtered);
}

window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.handleMainSearch = handleMainSearch;
window.filterByCategory = filterByCategory;

// ========== FILTER DROPDOWN TOGGLE ==========
function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  }
  
  // Close other dropdowns
  document.querySelectorAll('.filter-dropdown-content').forEach(el => {
    if (el.id !== dropdownId) {
      el.style.display = 'none';
    }
  });
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
  if (!event.target.closest('.filter-dropdown')) {
    document.querySelectorAll('.filter-dropdown-content').forEach(el => {
      el.style.display = 'none';
    });
  }
});

window.toggleDropdown = toggleDropdown;

// ========== FILTER TABS (Deprecated - kept for backward compatibility) ==========
function switchFilterTab(tabName) {
  // Hide all tab contents
  const searchTab = document.getElementById('searchTabContent');
  const brandTab = document.getElementById('brandTabContent');
  const priceTab = document.getElementById('priceTabContent');
  
  if (searchTab) searchTab.style.display = 'none';
  if (brandTab) brandTab.style.display = 'none';
  if (priceTab) priceTab.style.display = 'none';
  
  // Remove active class from all tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.style.color = 'var(--text-light)';
    tab.style.borderBottom = 'none';
    tab.style.marginBottom = '0';
  });
  
  // Show selected tab content
  const selectedTab = document.getElementById(tabName + 'TabContent');
  if (selectedTab) {
    selectedTab.style.display = 'block';
  }
  
  // Add active class to clicked tab
  if (event && event.target) {
    const activeTab = event.target;
    activeTab.style.color = 'var(--primary-color)';
    activeTab.style.borderBottom = '3px solid var(--primary-color)';
    activeTab.style.marginBottom = '-2px';
  }
}

window.switchFilterTab = switchFilterTab;

// ========== MOBILE FILTER DRAWER ==========
function toggleFilterDrawer() {
  const filtersSidebar = document.getElementById('filtersSidebar');
  const filterOverlay = document.getElementById('filterOverlay');
  
  filtersSidebar.classList.toggle('active');
  filterOverlay.style.display = filtersSidebar.classList.contains('active') ? 'block' : 'none';
  
  // Prevent body scrolling when drawer is open
  document.body.style.overflow = filtersSidebar.classList.contains('active') ? 'hidden' : 'auto';
}

function closeFilterDrawer() {
  const filtersSidebar = document.getElementById('filtersSidebar');
  const filterOverlay = document.getElementById('filterOverlay');
  
  filtersSidebar.classList.remove('active');
  filterOverlay.style.display = 'none';
  document.body.style.overflow = 'auto';
}

window.toggleFilterDrawer = toggleFilterDrawer;
window.closeFilterDrawer = closeFilterDrawer;

// Initialize filter drawer listeners (runs after page load)
function initFilterDrawer() {
  const filterToggleBtn = document.getElementById('filterToggleBtn');
  const filterCloseBtn = document.getElementById('filterCloseBtn');
  const filterOverlay = document.getElementById('filterOverlay');
  
  if (filterToggleBtn) {
    filterToggleBtn.addEventListener('click', toggleFilterDrawer);
  }
  
  if (filterCloseBtn) {
    filterCloseBtn.addEventListener('click', closeFilterDrawer);
  }
  
  if (filterOverlay) {
    filterOverlay.addEventListener('click', closeFilterDrawer);
  }
}

// ========== SHOPPING CART ==========
function updateCartCount() {
  const total = CartManager.getCartTotal();
  document.getElementById('cartCount').textContent = total.itemCount;
  // Update mobile badges too
  updateMobileCounts();
}
// Keep mobile nav counts in sync
function updateMobileCounts() {
  const total = CartManager.getCartTotal();
  const mobileCart = document.getElementById('mobileCartCount');
  if (mobileCart) {
    mobileCart.textContent = total.itemCount;
    mobileCart.style.display = total.itemCount > 0 ? 'inline-flex' : 'none';
  }
  const wishlistCount = WishlistManager.getWishlistCount();
  const mobileWish = document.getElementById('mobileWishlistCount');
  if (mobileWish) {
    mobileWish.textContent = wishlistCount;
    mobileWish.style.display = wishlistCount > 0 ? 'inline-flex' : 'none';
  }
}

async function quickAddToCart(productId) {
  const result = await ProductManager.getProductById(productId);
  if (!result.success) return;
  
  const product = result.product;
  // Pick first in-stock size; if none, inform the customer
  const inStock = product.sizes.find(s => (s.stock || 0) > 0);
  if (!inStock) {
    alert('This product is out of stock. Please check back later.');
    return;
  }

  CartManager.addToCart(product, inStock, 1);
  updateCartCount();
  alert('Added to cart!');
}

async function addToCart(productId) {
  const activeSize = document.querySelector('.size-option.active');
  if (!activeSize) {
    alert('Please select a size');
    return;
  }
  
  const sizeData = JSON.parse(activeSize.dataset.size);
  if ((sizeData.stock || 0) === 0) {
    alert('Selected size is out of stock. Please choose a different size.');
    return;
  }
  const result = await ProductManager.getProductById(productId);
  if (!result.success) return;
  
  const product = result.product;
  CartManager.addToCart(product, sizeData, 1);
  updateCartCount();
  alert('Added to cart!');
  closeProductDetail();
}

window.quickAddToCart = quickAddToCart;
window.addToCart = addToCart;

// ========== WISHLIST ==========
function updateWishlistCount() {
  const count = WishlistManager.getWishlistCount();
  const badge = document.getElementById('wishlistCount');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
  // Also update mobile badge
  const mobileWish = document.getElementById('mobileWishlistCount');
  if (mobileWish) {
    mobileWish.textContent = count;
    mobileWish.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}

async function toggleWishlist(productId) {
  const result = await ProductManager.getProductById(productId);
  if (!result.success) return;

  if (WishlistManager.isInWishlist(productId)) {
    WishlistManager.removeFromWishlist(productId);
    alert('Removed from wishlist');
  } else {
    WishlistManager.addToWishlist(result.product);
    alert('Added to wishlist!');
  }
  updateWishlistCount();
  // Update heart icon if visible
  updateWishlistIcons();
}

function updateWishlistIcons() {
  document.querySelectorAll('[data-product-id]').forEach(el => {
    const productId = el.getAttribute('data-product-id');
    const heartIcon = el.querySelector('.wishlist-heart');
    if (heartIcon) {
      if (WishlistManager.isInWishlist(productId)) {
        heartIcon.textContent = '♥';
        heartIcon.style.color = 'var(--danger)';
      } else {
        heartIcon.textContent = '♡';
        heartIcon.style.color = 'var(--text-light)';
      }
    }
  });
}

function displayWishlist() {
  const wishlist = WishlistManager.getWishlist();
  const container = document.getElementById('wishlistContainer');
  
  if (!container) {
    console.warn('Wishlist container not found');
    return;
  }
  
  if (wishlist.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-light);">Your wishlist is empty</p>';
    return;
  }
  
  container.innerHTML = `<div class="products-grid">
    ${wishlist.map(item => `
      <div class="product-card" data-product-id="${item.id}">
        <div class="product-image">
          <img src="${item.imageUrl}" alt="${item.name}" onclick="showProductDetail('${item.id}')">
          <div style="position: absolute; top: 10px; right: 10px; cursor: pointer; font-size: 24px; z-index: 10;" class="wishlist-heart" onclick="toggleWishlist('${item.id}')">♥</div>
        </div>
        <div class="product-info">
          <div class="product-brand">${item.brand}</div>
          <div class="product-name">${item.name}</div>
          <div class="product-prices">
            <span class="product-mrp">₹${item.mrp}</span>
            <span class="product-price">₹${item.minPrice}</span>
            <span class="product-discount">${Math.round(((item.mrp - item.minPrice) / item.mrp) * 100)}% off</span>
          </div>
          <div class="product-actions">
            <button class="btn btn-primary" style="flex: 1;" onclick="showProductDetail('${item.id}')">View</button>
            <button class="btn btn-outline" style="flex: 1;" onclick="quickAddToCart('${item.id}')">Add to Cart</button>
          </div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

window.toggleWishlist = toggleWishlist;
window.displayWishlist = displayWishlist;

async function buyNow(productId) {
  const activeSize = document.querySelector('.size-option.active');
  if (!activeSize) {
    alert('Please select a size');
    return;
  }

  const sizeData = JSON.parse(activeSize.dataset.size);
  const result = await ProductManager.getProductById(productId);
  if (!result.success) return;

  const product = result.product;
  CartManager.addToCart(product, sizeData, 1);
  updateCartCount();
  closeProductDetail();
  showPage('checkout');
}

window.buyNow = buyNow;

// ========== PRODUCT SHARING ==========
function shareProduct(productId, productName) {
  // Build shareable URL with product ID parameter
  const shareUrl = `${window.location.origin}${window.location.pathname}?product=${productId}`;
  
  const shareData = {
    title: `Check out ${productName} at R.V Fashion Hub!`,
    text: `I found this amazing product: ${productName}. Take a look!`,
    url: shareUrl
  };
  
  // Try native sharing first (works on mobile devices)
  if (navigator.share) {
    navigator.share(shareData)
      .then(() => console.log('Product shared successfully'))
      .catch((err) => {
        // User cancelled or share failed, fallback to clipboard
        if (err.name !== 'AbortError') {
          copyShareUrl(shareUrl, productName);
        }
      });
  } else {
    // Fallback for desktop: copy to clipboard
    copyShareUrl(shareUrl, productName);
  }
}

function copyShareUrl(url, productName) {
  // Copy URL to clipboard
  navigator.clipboard.writeText(url).then(() => {
    alert(`🔗 Link copied to clipboard!\n\nProduct: ${productName}\n\nShare this link with friends. When they open it, they'll see this product directly.`);
  }).catch(() => {
    // If clipboard fails, show the URL in a prompt
    window.prompt('Copy this link to share:', url);
  });
}

// Handle URL parameters on page load to open specific product
function handleProductUrlParam() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product');
  
  if (productId) {
    // Wait for products to load first
    const checkAndOpenProduct = setInterval(() => {
      if (allProducts.length > 0) {
        clearInterval(checkAndOpenProduct);
        // Check if product exists
        const productExists = allProducts.some(p => p.id === productId);
        if (productExists) {
          // Show shop page and open product detail
          showPage('shop');
          setTimeout(() => showProductDetail(productId), 500);
        } else {
          console.warn('Product not found:', productId);
        }
        // Clean URL parameter after handling
        if (window.history.replaceState) {
          const cleanUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }
    }, 100);
    
    // Stop checking after 10 seconds
    setTimeout(() => clearInterval(checkAndOpenProduct), 10000);
  }
}

window.shareProduct = shareProduct;
window.copyShareUrl = copyShareUrl;
window.handleProductUrlParam = handleProductUrlParam;

function displayCart() {
  const cart = CartManager.getLocalCart();
  const itemsList = document.getElementById('cartItemsList');
  
  if (cart.length === 0) {
    itemsList.innerHTML = '<p style="text-align: center; color: var(--text-light);">Your cart is empty</p>';
    document.getElementById('cartContainer').style.display = 'block';
    updateCartSummary();
    return;
  }
  
  itemsList.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-image" style="position: relative;">
        <img src="${item.imageUrl}" alt="${item.productName}">
        <div style="position: absolute; top: 10px; right: 10px; cursor: pointer; font-size: 24px; color: #FFD700; font-weight: bold; text-shadow: 0 0 2px rgba(0,0,0,0.3);" onclick="toggleWishlist('${item.productId}')" title="Add to Wishlist">♡</div>
      </div>
      <div class="cart-item-details">
        <h3>${item.productName}</h3>
        <p>${item.brand}</p>
        <p>Size: <strong>${item.size.size}</strong></p>
        <div class="cart-item-price">
          <span class="product-mrp">₹${item.mrp}</span>
          <span class="product-price">₹${item.sellingPrice}</span>
        </div>
        <div class="cart-item-actions">
          <div class="quantity-selector">
            <button onclick="updateQty(${index}, -1)">−</button>
            <input type="number" value="${item.quantity}" readonly>
            <button onclick="updateQty(${index}, 1)">+</button>
          </div>
          <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
  
  updateCartSummary();
}

function updateQty(index, change) {
  const cart = CartManager.getLocalCart();
  const newQty = Math.max(1, cart[index].quantity + change);
  CartManager.updateQuantity(cart[index].productId, cart[index].size.size, newQty);
  displayCart();
  updateCartCount();
}

function removeFromCart(index) {
  const cart = CartManager.getLocalCart();
  CartManager.removeFromCart(cart[index].productId, cart[index].size.size);
  displayCart();
  updateCartCount();
}

function updateCartSummary() {
  const total = CartManager.getCartTotal();
  document.getElementById('summarySubtotal').textContent = total.originalTotal;
  document.getElementById('summaryDiscount').textContent = total.discount;
  document.getElementById('summaryTotal').textContent = total.total;
}

window.updateQty = updateQty;
window.removeFromCart = removeFromCart;

function proceedToCheckout() {
  if (!currentUser) {
    alert('Please login to checkout');
    showPage('login');
    return;
  }
  
  const cart = CartManager.getLocalCart();
  if (cart.length === 0) {
    alert('Your cart is empty');
    return;
  }
  
  showPage('checkout');
}

window.proceedToCheckout = proceedToCheckout;

// ========== CHECKOUT & ORDERS ==========
function displayCheckout() {
  const cart = CartManager.getLocalCart();
  const total = CartManager.getCartTotal();
  
  // Display addresses
  const addressesDiv = document.getElementById('addressesForCheckout');
  const customerAddresses = currentUser.addresses || {};
  
  if (Object.keys(customerAddresses).length === 0) {
    addressesDiv.innerHTML = '<p style="color: var(--text-light); text-align: center;">No saved addresses. Please add one below.</p>';
  } else {
    addressesDiv.innerHTML = Object.values(customerAddresses).map((addr, index) => `
      <label style="display: block; padding: 15px; border: 2px solid var(--border-color); border-radius: 8px; margin-bottom: 10px; cursor: pointer; transition: all 0.3s ease;" class="address-option" data-index="${index}">
        <input type="radio" name="selectedAddress" value="${index}" checked style="margin-right: 10px;">
        <div>
          <strong>${addr.name}</strong><br>
          ${addr.addressLine1}, ${addr.city}, ${addr.state} - ${addr.pincode}<br>
          <span style="font-size: 12px; color: var(--text-light);">Ph: ${addr.phone}</span>
        </div>
      </label>
    `).join('');
  }
  
  // Display order summary
  const summaryDiv = document.getElementById('checkoutOrderSummary');
  summaryDiv.innerHTML = `
    ${cart.map(item => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
        <span>${item.productName} (${item.size.size}) x${item.quantity}</span>
        <span>₹${item.sellingPrice * item.quantity}</span>
      </div>
    `).join('')}
    <div style="border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 10px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Subtotal</span>
        <span>₹${total.originalTotal}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--success);">
        <span>Discount</span>
        <span>-₹${total.discount}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-color);">
        <span>Total Amount</span>
        <span>₹${total.total}</span>
      </div>
    </div>
  `;
}

function showAddressForm() {
  document.getElementById('addressFormModal').classList.add('active');
  document.body.classList.add('modal-open');
}

function closeAddressForm() {
  document.getElementById('addressFormModal').classList.remove('active');
  document.getElementById('addressFormModal2').classList.remove('active');
  document.body.classList.remove('modal-open');
}

async function saveAddress(e) {
  e.preventDefault();
  
  const address = {
    name: document.getElementById('addressName').value,
    phone: document.getElementById('addressPhone').value,
    addressLine1: document.getElementById('addressLine1').value,
    addressLine2: document.getElementById('addressLine2').value,
    city: document.getElementById('addressCity').value,
    state: document.getElementById('addressState').value,
    pincode: document.getElementById('addressPincode').value
  };
  
  if (!currentUser.addresses) {
    currentUser.addresses = {};
  }
  
  const addressId = Date.now().toString();
  currentUser.addresses[addressId] = address;
  AuthManager.setCurrentUser(currentUser);

  // Save to Firestore (non-blocking)
  (async () => {
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        addresses: currentUser.addresses
      });
      console.log('✅ Address saved to Firestore');
    } catch (firestoreError) {
      console.warn('⚠️ Address saved locally but Firestore sync failed:', firestoreError.message);
    }
  })();

  // Reset form
  document.querySelector('#addressFormModal form').reset();
  closeAddressForm();
  displayCheckout();
}

window.showAddressForm = showAddressForm;
window.closeAddressForm = closeAddressForm;
window.saveAddress = saveAddress;

async function processPayment() {
  const selectedAddress = document.querySelector('input[name="selectedAddress"]:checked');
  const paymentMode = document.querySelector('input[name="paymentMode"]:checked').value;
  
  if (!selectedAddress) {
    alert('Please select a delivery address');
    return;
  }
  
  const cart = CartManager.getLocalCart();
  const addressIndex = parseInt(selectedAddress.value);
  const addresses = Object.values(currentUser.addresses || {});
  const selectedAddr = addresses[addressIndex];
  
  // Extract customer data with proper fields
  const customerData = {
    uid: currentUser.uid,
    name: currentUser.name || currentUser.displayName || currentUser.email.split('@')[0],
    email: currentUser.email,
    phoneNumber: currentUser.phoneNumber || selectedAddr.phone  // Try user phone first, fallback to address
  };
  
  const orderResult = await OrderManager.createOrder(
    currentUser.uid,
    customerData,
    cart,
    selectedAddr,
    paymentMode
  );
  
  if (orderResult.success) {
    if (paymentMode === 'upi') {
      // Prepare UPI deep link and show QR fallback first so desktop users can scan
      const amount = CartManager.getCartTotal().total;
      const transactionId = orderResult.order.orderId;
      const upiId = '8538081480@ybl';
      const paymentUrl = `upi://pay?pa=${upiId}&pn=RVFashionHub&tr=${transactionId}&am=${amount}&tn=Order%20Payment`;

      try {
          // Show QR inline on checkout page
          console.log('Rendering inline payment QR for', paymentUrl);
          showInlinePaymentQR(paymentUrl);
      } catch (err) {
          console.warn('Could not show inline payment QR:', err);
          try { showPaymentQR(paymentUrl); } catch (e) { console.warn('modal fallback failed', e); }
      }
      
      // Attempt to open UPI app via deep link
      setTimeout(() => {
        try {
          window.location.href = paymentUrl;
        } catch (err) {
          console.warn('Deep link failed:', err);
        }
      }, 250);

      // Show a button below QR for user to confirm payment after they return from UPI app
      setTimeout(() => {
        const container = document.getElementById('checkoutPaymentQr');
        if (container) {
          const confirmBtn = document.createElement('button');
          confirmBtn.className = 'btn btn-primary';
          confirmBtn.style.width = '100%';
          confirmBtn.style.marginTop = '15px';
          confirmBtn.innerHTML = 'I\'ve Completed Payment - Enter Transaction ID';
          confirmBtn.onclick = async () => {
            const last4 = prompt('Enter the last 4 digits of the UPI transaction ID:');
            if (last4 && /^\d{4}$/.test(last4)) {
              try {
                await updateDoc(doc(db, 'orders', orderResult.order.id), {
                  paymentTxnLast4: last4,
                  paymentVerified: true,
                  updatedAt: new Date().toISOString()
                });
                CartManager.clearCart();
                updateCartCount();
                alert('Payment confirmed! Order ID: ' + orderResult.order.orderId);
                showPage('myorders');
              } catch (e) {
                console.warn('Failed to save payment info:', e);
                alert('Error saving payment info: ' + e.message);
              }
            } else if (last4) {
              alert('Please enter exactly 4 digits.');
            }
          };
          container.appendChild(confirmBtn);
        }
      }, 500);
    } else {
      CartManager.clearCart();
      updateCartCount();
      alert('Order placed successfully! Order ID: ' + orderResult.order.orderId + '\nPayment will be collected at delivery.');
      showPage('myorders');
    }
  } else {
    alert('Failed to create order: ' + orderResult.error);
  }
}

window.processPayment = processPayment;

function showPaymentQR(paymentUrl) {
  const modal = document.getElementById('paymentQrModal');
  const imgContainer = document.getElementById('paymentQrImage');
  if (!modal || !imgContainer) return;

    console.log('showPaymentQR called with', paymentUrl);
    // Use qrserver API to generate QR image for the UPI URL (more reliable than deprecated Google Charts endpoint)
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUrl)}`;
    imgContainer.innerHTML = `<a href="${paymentUrl}" style="display:block;"><img src="${qrSrc}" alt="Scan to pay" style="max-width: 100%; height: auto;"/></a>`;
    // Use the modal's active class so CSS centers it properly
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    // QR is displayed in the modal; do not auto-open a new tab so users stay on the payment page.
}

function showInlinePaymentQR(paymentUrl) {
  const container = document.getElementById('checkoutPaymentQr');
  if (!container) return showPaymentQR(paymentUrl);

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUrl)}`;
  container.innerHTML = `<div style="background: var(--light-bg); padding: 16px; border-radius: 8px; text-align:center;">
    <h4 style="margin-bottom: 8px;">Scan to Pay</h4>
    <a href="${paymentUrl}" style="display:block; margin-bottom:10px;"><img src="${qrSrc}" alt="Scan to pay" style="max-width: 100%; height: auto;"/></a>
    <div style="font-size: 13px; color: var(--text-light);">Or <a href="${paymentUrl}">open in UPI app</a></div>
  </div>`;

  // QR is displayed inline; do not auto-open new tab by default.
}

// Track real-time order subscription
let orderSubscription = null;

async function displayMyOrders() {
  if (!currentUser) {
    document.getElementById('myOrdersList').innerHTML = '<p style="text-align: center;">Please login to view your orders</p>';
    return;
  }
  
  // Unsubscribe from previous listener if it exists
  if (orderSubscription) {
    orderSubscription();
  }
  
  // Subscribe to real-time order updates
  orderSubscription = OrderManager.subscribeToCustomerOrders(currentUser.uid, (result) => {
    const ordersList = document.getElementById('myOrdersList');
    
    if (!ordersList) return; // Element doesn't exist anymore
    
    if (!result.success || result.orders.length === 0) {
      ordersList.innerHTML = '<p style="text-align: center; color: var(--text-light);">No orders yet</p>';
      return;
    }
    
    ordersList.innerHTML = result.orders.map(order => `
      <div style="background-color: var(--light-bg); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-bottom: 20px;">
          <div>
            <div style="color: var(--text-light); font-size: 12px;">Order ID</div>
            <div style="font-weight: 600; font-size: 14px;">${order.orderId}</div>
          </div>
          <div>
            <div style="color: var(--text-light); font-size: 12px;">Total Amount</div>
            <div style="font-weight: 600; font-size: 14px;">₹${order.total}</div>
          </div>
          <div>
            <div style="color: var(--text-light); font-size: 12px;">Status</div>
            <div style="font-weight: 600; font-size: 14px; color: ${order.status === 'delivered' ? 'var(--success)' : 'var(--warning)'};">${order.status.toUpperCase()}</div>
          </div>
          <div>
            <div style="color: var(--text-light); font-size: 12px;">Date</div>
            <div style="font-weight: 600; font-size: 14px;">${new Date(order.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        <button class="btn btn-primary" onclick="showOrderTracking('${order.orderId}')" style="margin-right: 10px; width: auto;">Track Order</button>
        <button class="btn btn-outline" onclick="viewOrderDetails('${order.orderId}')" style="width: auto;">View Details</button>
      </div>
    `).join('');
  });
}

async function showOrderTracking(orderId) {
  if (!orderId || typeof orderId !== 'string') {
    alert('Invalid order identifier');
    console.error('showOrderTracking called without a valid orderId:', orderId);
    return;
  }

  const result = await OrderManager.getOrderById(orderId);
  if (!result.success) {
    alert('Order not found');
    return;
  }
  
  const order = result.order;
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
  const currentStatus = statuses.indexOf(order.status);
  
  const trackingContent = document.getElementById('orderTrackingContent');
  trackingContent.innerHTML = `
    <div style="background-color: var(--light-bg); padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <h3 style="margin-bottom: 20px;">Order ID: ${order.orderId}</h3>
      
      <div class="status-timeline">
        ${statuses.map((status, index) => `
          <div class="status-step ${index <= currentStatus ? 'active' : ''} ${index < currentStatus ? 'completed' : ''}">
            <div class="status-circle">${index < currentStatus ? '✓' : index + 1}</div>
            <div class="status-label">${status.charAt(0).toUpperCase() + status.slice(1)}</div>
          </div>
        `).join('')}
      </div>
      
      <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin-bottom: 15px;">Order Details</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 14px;">
          <div>
            <span style="color: var(--text-light);">Customer Name</span><br>
            <strong>${order.customerName}</strong>
          </div>
          <div>
            <span style="color: var(--text-light);">Phone</span><br>
            <strong>${order.phoneNumber}</strong>
          </div>
          <div>
            <span style="color: var(--text-light);">Delivery Address</span><br>
            <strong>${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}</strong>
          </div>
          <div>
            <span style="color: var(--text-light);">Payment Mode</span><br>
            <strong>${order.paymentMode === 'upi' ? 'Online (PhonePay)' : 'Cash on Delivery'}</strong>
          </div>
          ${order.paymentMode === 'upi' && order.paymentTxnLast4 ? `<div>
            <span style="color: var(--text-light);">Transaction ID (Last 4)</span><br>
            <strong style="font-family: monospace; font-size: 16px; color: var(--success);">${order.paymentTxnLast4}</strong>
            ${order.paymentVerified ? '<div style="font-size: 11px; color: var(--success);">✓ Verified</div>' : ''}
          </div>` : ''}
        </div>
      </div>
      
      <div style="background-color: white; padding: 20px; border-radius: 8px;">
        <h4 style="margin-bottom: 15px;">Items Ordered</h4>
        ${order.items.map(item => `
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
            <span>${item.productName} (${item.size.size}) x${item.quantity}</span>
            <span>₹${item.sellingPrice * item.quantity}</span>
          </div>
        `).join('')}
        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-weight: 700; margin-top: 10px;">
          <span>Total</span>
          <span>₹${order.total}</span>
        </div>
      </div>
    </div>
  `;
  
  showPage('ordertracking');
}

async function viewOrderDetails(orderId) {
  const result = await OrderManager.getOrderById(orderId);
  if (result.success) {
    alert(JSON.stringify(result.order, null, 2));
  }
}

window.showOrderTracking = showOrderTracking;
window.viewOrderDetails = viewOrderDetails;

async function displayAddressesManagement() {
  if (!currentUser) {
    document.getElementById('addressesManagement').innerHTML = '<p>Please login</p>';
    return;
  }
  
  const addresses = currentUser.addresses || {};
  const container = document.getElementById('addressesManagement');
  
  if (Object.keys(addresses).length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-light);">No saved addresses</p>';
    return;
  }
  
  container.innerHTML = '<div class="address-list">' + Object.entries(addresses).map(([id, addr]) => `
    <div class="address-card">
      <h3 style="margin-bottom: 8px;">${addr.name}</h3>
      <p style="font-size: 14px; color: var(--text-light); margin-bottom: 8px;">
        ${addr.addressLine1}<br>
        ${addr.addressLine2 ? addr.addressLine2 + '<br>' : ''}
        ${addr.city}, ${addr.state} - ${addr.pincode}
      </p>
      <p style="font-size: 14px; margin-bottom: 12px;">Phone: ${addr.phone}</p>
      <div class="address-card-actions">
        <button class="edit-btn" onclick="editAddress('${id}')">Edit</button>
        <button class="delete-btn" onclick="deleteAddress('${id}')">Delete</button>
      </div>
    </div>
  `).join('') + '</div>';
}

function openAddressForm() {
  document.getElementById('addressFormModal2').classList.add('active');
  document.body.classList.add('modal-open');
}

function editAddress(addressId) {
  const addr = currentUser.addresses[addressId];
  document.getElementById('addressName2').value = addr.name;
  document.getElementById('addressPhone2').value = addr.phone;
  document.getElementById('addressLine1_2').value = addr.addressLine1;
  document.getElementById('addressLine2_2').value = addr.addressLine2 || '';
  document.getElementById('addressCity2').value = addr.city;
  document.getElementById('addressState2').value = addr.state;
  document.getElementById('addressPincode2').value = addr.pincode;
  
  document.getElementById('addressFormModal2').dataset.editId = addressId;
  document.getElementById('addressFormModal2').classList.add('active');
  document.body.classList.add('modal-open');
}

async function saveAddressManagement(e) {
  e.preventDefault();
  
  const editId = document.getElementById('addressFormModal2').dataset.editId;
  const address = {
    name: document.getElementById('addressName2').value,
    phone: document.getElementById('addressPhone2').value,
    addressLine1: document.getElementById('addressLine1_2').value,
    addressLine2: document.getElementById('addressLine2_2').value,
    city: document.getElementById('addressCity2').value,
    state: document.getElementById('addressState2').value,
    pincode: document.getElementById('addressPincode2').value
  };
  
  if (editId) {
    if (!currentUser.addresses) currentUser.addresses = {};
    currentUser.addresses[editId] = address;
    delete document.getElementById('addressFormModal2').dataset.editId;
  } else {
    if (!currentUser.addresses) currentUser.addresses = {};
    const addressId = Date.now().toString();
    currentUser.addresses[addressId] = address;
  }
  
  AuthManager.setCurrentUser(currentUser);
  
  document.querySelector('#addressFormModal2 form').reset();
  closeAddressForm();
  displayAddressesManagement();
  // Save to Firestore (non-blocking)
  (async () => {
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        addresses: currentUser.addresses
      });
      console.log('✅ Address saved to Firestore');
    } catch (firestoreError) {
      console.warn('⚠️ Address saved locally but Firestore sync failed:', firestoreError.message);
    }
  })();
}

async function deleteAddress(addressId) {
  if (!confirm('Are you sure you want to delete this address?')) return;

  try {
    delete currentUser.addresses[addressId];
    AuthManager.setCurrentUser(currentUser);
    displayAddressesManagement();

    // Also sync deletion to Firestore (non-blocking)
    (async () => {
      try {
        const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          addresses: currentUser.addresses
        });
        console.log('✅ Address deleted from Firestore');
      } catch (firestoreError) {
        console.warn('⚠️ Address deleted locally but Firestore sync failed:', firestoreError.message);
      }
    })();
  } catch (error) {
    console.error('❌ Error deleting address:', error);
    alert('Error deleting address: ' + error.message);
  }
}

window.openAddressForm = openAddressForm;
window.editAddress = editAddress;
window.saveAddressManagement = saveAddressManagement;
window.deleteAddress = deleteAddress;

// ========== ADMIN PANEL ==========
function showAdminSection(sectionName) {
  // Check if user is admin
  if (!currentUser || !currentUser.isAdmin) {
    alert('You do not have permission to access the admin panel. Only administrators can access this section.');
    return;
  }
  
  document.querySelectorAll('.admin-section').forEach(sec => sec.classList.add('hidden'));
  document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.classList.remove('active'));
  
  const sectionId = `admin-${sectionName}`;
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.remove('hidden');
  }
  
  event.target.classList.add('active');
  
  // Load section data
  if (sectionName === 'dashboard') {
    loadDashboard();
  } else if (sectionName === 'products') {
    loadProductsAdmin();
  } else if (sectionName === 'inventory') {
    loadInventory();
  } else if (sectionName === 'orders') {
    loadOrdersAdmin();
    // Ensure orders tab defaults to active
    try { showOrdersTab('active'); } catch (e) { /* ignore if function missing */ }
  } else if (sectionName === 'reviews') {
    loadReviewsAdmin();
  }
}

async function loadDashboard() {
  // Use cache + batch load for better performance
  const productsResult = productsCache ? { success: true, products: productsCache } : await ProductManager.getAllProducts();
  const ordersResult = await OrderManager.getAllOrders();
  
  const totalProducts = productsResult.products?.length || 0;
  const totalOrders = ordersResult.orders?.length || 0;
  const totalRevenue = ordersResult.orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  
  document.getElementById('totalProducts').textContent = totalProducts;
  document.getElementById('totalOrders').textContent = totalOrders;
  document.getElementById('totalRevenue').textContent = '₹' + totalRevenue;
}

async function loadProductsAdmin() {
  // Use cache if available
  const result = productsCache ? { success: true, products: productsCache } : await ProductManager.getAllProducts();
  const tbody = document.getElementById('productsTableBody');
  
  if (!result.success || !result.products || result.products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No products found</td></tr>';
    return;
  }
  
  tbody.innerHTML = result.products.map(product => `
    <tr>
      <td>${product.name}</td>
      <td>${product.brand}</td>
      <td>${product.category}</td>
      <td style="${product.totalStock === 0 ? 'color: red; font-weight: bold;' : ''}">${product.totalStock} ${product.totalStock === 0 ? '(OUT)' : ''}</td>
      <td>
        <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;" onclick="editProductAdmin('${product.id}')">Edit</button>
        <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px; color: var(--danger); border-color: var(--danger); margin-left: 5px;" onclick="deleteProductAdmin('${product.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

async function loadInventory() {
  // Use cache if available
  const result = productsCache ? { success: true, products: productsCache } : await ProductManager.getAllProducts();
  const tbody = document.getElementById('inventoryTableBody');
  
  let html = '';
  if (result.success && result.products) {
    result.products.forEach(product => {
      if (product.sizes && Array.isArray(product.sizes)) {
        product.sizes.forEach(size => {
          html += `
            <tr style="${size.stock === 0 ? 'background-color: #ffe0e0;' : ''}">
              <td>${product.name}</td>
              <td>${product.barcode}</td>
              <td>${size.size}</td>
              <td style="${size.stock === 0 ? 'color: red; font-weight: bold;' : ''}">${size.stock} ${size.stock === 0 ? '(OUT)' : ''}</td>
              <td>
                <input type="number" value="${size.stock}" style="width: 60px; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;" id="stock-${product.id}-${size.size}">
                <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px; margin-left: 5px;" onclick="updateStockAdmin('${product.id}', '${size.size}')">Update</button>
              </td>
            </tr>
          `;
        });
      }
    });
  }
  
  tbody.innerHTML = html || '<tr><td colspan="5" style="text-align: center; padding: 20px;">No inventory found</td></tr>';
  
  // Search functionality
  const searchInput = document.getElementById('inventorySearch');
  if (searchInput) {
    searchInput.addEventListener('keyup', () => {
      const searchQuery = searchInput.value.toLowerCase();
      const rows = document.querySelectorAll('#inventoryTableBody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchQuery) ? '' : 'none';
      });
    });
  }
}

async function loadOrdersAdmin() {
  try {
    const result = await OrderManager.getAllOrders();
    const activeTbody = document.getElementById('activeOrdersTableBody');
    const deliveredTbody = document.getElementById('deliveredOrdersTableBody');
    const cancelledTbody = document.getElementById('cancelledOrdersTableBody');

    if (!result.success || !result.orders) {
      activeTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No orders found</td></tr>';
      deliveredTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No delivered orders</td></tr>';
      return;
    }

    const cancelledOrders = result.orders.filter(o => o.status === 'cancelled');
    const deliveredOrders = result.orders.filter(o => o.status === 'delivered');
    const activeOrders = result.orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

    if (activeOrders.length === 0) {
      activeTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:16px;">No active orders</td></tr>';
    } else {
      activeTbody.innerHTML = activeOrders.map(order => {
        const orderId = order.id || order.orderId;
        return `
          <tr>
            <td>${orderId}</td>
            <td>${order.customerName || 'N/A'}</td>
            <td>${order.phoneNumber || 'N/A'}</td>
            <td>₹${order.total || 0}</td>
            <td>
              <select onchange="updateOrderStatusAdmin('${orderId}', this.value)" style="padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;">
                  <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                  <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                  <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                  <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                  <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>
              <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;" onclick="printBill('${orderId}')">Print</button>
              <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px; margin-left: 5px;" onclick="sendWhatsAppUpdate('${orderId}')">WhatsApp</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (deliveredOrders.length === 0) {
      deliveredTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:16px;">No delivered orders</td></tr>';
    } else {
      deliveredTbody.innerHTML = deliveredOrders.map(order => {
        const orderId = order.id || order.orderId;
        const deliveredAt = order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '-';
        return `
          <tr class="delivered">
            <td>${orderId}</td>
            <td>${order.customerName || 'N/A'}</td>
            <td>${order.phoneNumber || 'N/A'}</td>
            <td>₹${order.total || 0}</td>
            <td>${deliveredAt}</td>
            <td>
              <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;" onclick="printBill('${orderId}')">Print</button>
              <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px; margin-left: 5px;" onclick="sendWhatsAppUpdate('${orderId}')">WhatsApp</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Cancelled orders
    if (cancelledOrders.length === 0) {
      if (cancelledTbody) cancelledTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:16px;">No cancelled orders</td></tr>';
    } else {
      if (cancelledTbody) cancelledTbody.innerHTML = cancelledOrders.map(order => {
        const orderId = order.id || order.orderId;
        const cancelledAt = order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '-';
        return `
          <tr class="cancelled">
            <td>${orderId}</td>
            <td>${order.customerName || 'N/A'}</td>
            <td>${order.phoneNumber || 'N/A'}</td>
            <td>₹${order.total || 0}</td>
            <td>${cancelledAt}</td>
            <td>
              <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;" onclick="printBill('${orderId}')">Print</button>
              <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px; margin-left: 5px;" onclick="sendWhatsAppUpdate('${orderId}')">WhatsApp</button>
            </td>
          </tr>
        `;
      }).join('');
    }
  } catch (error) {
    console.error('Error loading orders:', error);
    document.getElementById('activeOrdersTableBody').innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: red;">Error loading orders</td></tr>';
    document.getElementById('deliveredOrdersTableBody').innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: red;">Error loading orders</td></tr>';
  }
}

// Toggle orders tabs (active / delivered / cancelled)
function showOrdersTab(tab) {
  const activeSection = document.getElementById('ordersTab_active');
  const deliveredSection = document.getElementById('ordersTab_delivered');
  const cancelledSection = document.getElementById('ordersTab_cancelled');
  const activeBtn = document.getElementById('activeOrdersBtn');
  const deliveredBtn = document.getElementById('deliveredOrdersBtn');
  const cancelledBtn = document.getElementById('cancelledOrdersBtn');

  if (tab === 'delivered') {
    if (activeSection) activeSection.classList.add('hidden');
    if (deliveredSection) deliveredSection.classList.remove('hidden');
    if (cancelledSection) cancelledSection.classList.add('hidden');
    if (activeBtn) activeBtn.classList.remove('active');
    if (deliveredBtn) deliveredBtn.classList.add('active');
    if (cancelledBtn) cancelledBtn.classList.remove('active');

  } else if (tab === 'cancelled') {
    if (activeSection) activeSection.classList.add('hidden');
    if (deliveredSection) deliveredSection.classList.add('hidden');
    if (cancelledSection) cancelledSection.classList.remove('hidden');
    if (activeBtn) activeBtn.classList.remove('active');
    if (deliveredBtn) deliveredBtn.classList.remove('active');
    if (cancelledBtn) cancelledBtn.classList.add('active');

  } else { // default to active
    if (deliveredSection) deliveredSection.classList.add('hidden');
    if (cancelledSection) cancelledSection.classList.add('hidden');
    if (activeSection) activeSection.classList.remove('hidden');
    if (deliveredBtn) deliveredBtn.classList.remove('active');
    if (cancelledBtn) cancelledBtn.classList.remove('active');
    if (activeBtn) activeBtn.classList.add('active');
  }
}

// Expose to global so inline onclick handlers work before/after module load
window.showOrdersTab = showOrdersTab;

async function loadReviewsAdmin() {
  try {
    const result = await ProductManager.getAllReviews();
    const tbody = document.getElementById('reviewsTableBody');
    
    if (!result.success || !result.reviews || result.reviews.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No reviews found</td></tr>';
      return;
    }
    
    // Get product names for each review
    const productsResult = await ProductManager.getAllProducts();
    const productsMap = {};
    if (productsResult.success) {
      productsResult.products.forEach(p => {
        productsMap[p.id] = p.name;
      });
    }
    
    tbody.innerHTML = result.reviews.map(review => {
      const productName = productsMap[review.productId] || 'Unknown Product';
      const maskedPhone = review.customerPhone ? review.customerPhone.slice(0, 3) + '****' + review.customerPhone.slice(-2) : 'N/A';
      const maskedName = review.customerName ? review.customerName.slice(0, 3) + '****' : '****';
      return `
        <tr>
          <td>${productName}</td>
          <td>${maskedName}</td>
          <td>${maskedPhone}</td>
          <td>${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</td>
          <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${review.reviewText || '(No text)'}</td>
          <td>
            <button class="btn btn-outline delete-review-btn" style="padding: 6px 12px; font-size: 12px; color: var(--danger); border-color: var(--danger);" data-review-id="${review.id}">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
    
    // Attach event listeners to delete buttons
    document.querySelectorAll('.delete-review-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const reviewId = this.getAttribute('data-review-id');
        deleteReviewAdmin(reviewId);
      });
    });
  } catch (error) {
    console.error('Error loading reviews:', error);
    document.getElementById('reviewsTableBody').innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: red;">Error loading reviews</td></tr>';
  }
}

async function deleteReviewAdmin(reviewId) {
  if (confirm('Are you sure you want to delete this review?')) {
    const result = await ProductManager.deleteReview(reviewId);
    if (result.success) {
      alert('Review deleted successfully!');
      await loadReviewsAdmin();
      // Refresh products so UI shows updated rating and counts
      await loadProducts();
    } else {
      alert('Error deleting review: ' + result.error);
    }
  }
}

function openProductForm() {
  document.getElementById('productFormModal').classList.add('active');
  document.body.classList.add('modal-open');
}

function closeProductForm() {
  editingProductId = null; // Reset editing flag
  document.getElementById('productFormModal').classList.remove('active');
  document.body.classList.remove('modal-open');
  document.querySelector('#productFormModal form').reset();
  document.getElementById('sizesContainer').innerHTML = `
    <div class="size-entry" style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr auto; gap: 8px; margin-bottom: 10px; align-items: end;">
      <input type="text" placeholder="Size (S, M, L)" class="size-input" required>
      <input type="number" placeholder="MRP" class="mrp-input" required>
      <input type="number" placeholder="Price" class="price-input" required>
      <input type="number" placeholder="Stock" class="stock-input" required>
      <button type="button" class="btn btn-outline" onclick="addSizeField()" style="padding: 8px 12px; min-width: 80px;">+ Add Size</button>
    </div>
  `;
}

// Global variable to track if we're editing a product
let editingProductId = null;

async function editProductAdmin(productId) {
  const result = await ProductManager.getProductById(productId);
  
  if (result.success) {
    editingProductId = productId; // Store the product ID being edited
    const product = result.product;
    
    // Set form values with null checks
    if (document.getElementById('productName')) document.getElementById('productName').value = product.name;
    if (document.getElementById('productBrand')) document.getElementById('productBrand').value = product.brand;
    if (document.getElementById('productCategory')) document.getElementById('productCategory').value = product.category;
    if (document.getElementById('productSubcategory')) document.getElementById('productSubcategory').value = product.subcategory || '';
    if (document.getElementById('productBarcode')) document.getElementById('productBarcode').value = product.barcode;
    if (document.getElementById('productImage')) document.getElementById('productImage').value = product.imageUrl;
    if (document.getElementById('productDescription')) document.getElementById('productDescription').value = product.description || '';
    
    // Populate additional images (all images except the first one)
    if (document.getElementById('productImages')) {
      const additionalImages = product.images && Array.isArray(product.images) 
        ? product.images.slice(1) // Exclude first image (main image)
        : [];
      document.getElementById('productImages').value = additionalImages.join('\n');
    }
    
    // Populate sizes
    const sizesContainer = document.getElementById('sizesContainer');
    sizesContainer.innerHTML = '';
    
    if (product.sizes && Array.isArray(product.sizes)) {
      product.sizes.forEach(size => {
        const entry = document.createElement('div');
        entry.className = 'size-entry';
        entry.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr 1fr auto; gap: 8px; margin-bottom: 10px; align-items: end;';
        entry.innerHTML = `
          <input type="text" placeholder="Size" class="size-input" value="${size.size}" required>
          <input type="number" placeholder="MRP" class="mrp-input" value="${size.mrp}" required>
          <input type="number" placeholder="Price" class="price-input" value="${size.sellingPrice}" required>
          <input type="number" placeholder="Stock" class="stock-input" value="${size.stock}" required>
          <button type="button" class="btn btn-outline" onclick="this.parentElement.remove()" style="padding: 8px 12px; background-color: #ff6b6b; color: white;">Remove</button>
        `;
        sizesContainer.appendChild(entry);
      });
    }
    
    // Add button to add more sizes
    const addBtn = document.createElement('div');
    addBtn.className = 'size-entry';
    addBtn.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr 1fr auto; gap: 8px; margin-bottom: 10px; align-items: end;';
    addBtn.innerHTML = `
      <input type="text" placeholder="Size (S, M, L)" class="size-input">
      <input type="number" placeholder="MRP" class="mrp-input">
      <input type="number" placeholder="Price" class="price-input">
      <input type="number" placeholder="Stock" class="stock-input">
      <button type="button" class="btn btn-outline" onclick="addSizeField()" style="padding: 8px 12px; min-width: 80px;">+ Add Size</button>
    `;
    sizesContainer.appendChild(addBtn);
    
    openProductForm();
  } else {
    alert('Error loading product');
  }
}

async function saveProduct(e) {
  e.preventDefault();
  
  try {
    // Collect sizes from form inputs
    const sizeEntries = document.querySelectorAll('.size-entry');
    const sizes = [];
    
    sizeEntries.forEach(entry => {
      const sizeInput = entry.querySelector('.size-input').value.trim();
      const mrp = parseInt(entry.querySelector('.mrp-input').value);
      const price = parseInt(entry.querySelector('.price-input').value);
      const stock = parseInt(entry.querySelector('.stock-input').value);
      
      if (sizeInput && mrp && price && stock >= 0) {
        sizes.push({
          size: sizeInput,
          mrp: mrp,
          sellingPrice: price,
          stock: stock
        });
      }
    });
    
    if (sizes.length === 0) {
      alert('Please add at least one size');
      return;
    }
    
    const totalStock = sizes.reduce((sum, s) => sum + s.stock, 0);
    
    // Get form values with null checks
    const nameEl = document.getElementById('productName');
    const brandEl = document.getElementById('productBrand');
    const categoryEl = document.getElementById('productCategory');
    const barcodeEl = document.getElementById('productBarcode');
    const imageEl = document.getElementById('productImage');
    const descriptionEl = document.getElementById('productDescription');
    const subcategoryEl = document.getElementById('productSubcategory');
    
    if (!nameEl || !brandEl || !categoryEl || !barcodeEl || !imageEl) {
      alert('Error: Product form fields are missing. Make sure your HTML has all required input fields.');
      return;
    }
    
    // Handle multiple images
    const mainImageUrl = imageEl.value.trim();
    const additionalImagesText = document.getElementById('productImages')?.value.trim() || '';
    const additionalImages = additionalImagesText
      ? additionalImagesText.split('\n').map(url => url.trim()).filter(url => url)
      : [];
    
    // Combine all images: main image first, then additional images
    const allImages = [mainImageUrl, ...additionalImages].filter(url => url);
    
    const productData = {
      name: nameEl.value.trim(),
      brand: brandEl.value.trim(),
      category: categoryEl.value.trim(),
      barcode: barcodeEl.value.trim(),
      subcategory: subcategoryEl ? subcategoryEl.value.trim() : '',
      imageUrl: mainImageUrl,
      images: allImages,
      description: descriptionEl ? descriptionEl.value.trim() : '',
      sizes: sizes,
      totalStock: totalStock
    };
    
    let result;
    
    if (editingProductId) {
      // UPDATE existing product
      console.log('Updating product:', editingProductId);
      const { db } = await import('./firebase-config.js');
      const { updateDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      
      await updateDoc(doc(db, 'products', editingProductId), productData);
      result = { success: true };
      alert('Product updated successfully!');
    } else {
      // CREATE new product
      console.log('Creating new product');
      result = await ProductManager.addProduct(productData);
      if (result.success) {
        alert('Product added successfully!');
      }
    }
    
    if (result.success) {
      closeProductForm();
      await loadProducts();
      loadProductsAdmin();
    } else {
      alert('Error: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error saving product:', error);
    alert('Error saving product: ' + error.message);
  }
}

function addSizeField() {
  const container = document.getElementById('sizesContainer');
  const newEntry = document.createElement('div');
  newEntry.className = 'size-entry';
  newEntry.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr 1fr auto; gap: 8px; margin-bottom: 10px; align-items: end;';
  newEntry.innerHTML = `
    <input type="text" placeholder="Size (S, M, L)" class="size-input" required>
    <input type="number" placeholder="MRP" class="mrp-input" required>
    <input type="number" placeholder="Price" class="price-input" required>
    <input type="number" placeholder="Stock" class="stock-input" required>
    <button type="button" class="btn btn-outline" onclick="this.parentElement.remove()" style="padding: 8px 12px; background-color: #ff6b6b; color: white;">Remove</button>
  `;
  container.appendChild(newEntry);
}

async function deleteProductAdmin(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    await ProductManager.deleteProduct(productId);
    await loadProducts();
    loadProductsAdmin();
  }
}

async function updateStockAdmin(productId, sizeStr) {
  try {
    const inputElement = document.getElementById(`stock-${productId}-${sizeStr}`);
    if (!inputElement) {
      alert('Input field not found');
      return;
    }
    
    const newStock = parseInt(inputElement.value);
    
    if (isNaN(newStock) || newStock < 0) {
      alert('Please enter a valid stock number (0 or greater)');
      return;
    }
    
    console.log(`Updating stock for product ${productId}, size ${sizeStr} to ${newStock}`);
    
    const result = await ProductManager.getProductById(productId);
    
    if (!result.success) {
      alert('Error: Could not find product');
      return;
    }
    
    const product = result.product;
    
    if (!product.sizes || !Array.isArray(product.sizes)) {
      alert('Error: Product has no sizes');
      return;
    }
    
    const sizeIndex = product.sizes.findIndex(s => s.size === sizeStr);
    if (sizeIndex === -1) {
      alert('Error: Size not found');
      return;
    }
    
    const currentStock = product.sizes[sizeIndex].stock;
    const change = newStock - currentStock;
    
    console.log(`Current stock: ${currentStock}, New stock: ${newStock}, Change: ${change}`);
    
    const updateResult = await ProductManager.updateProductStock(productId, sizeIndex, change);
    
    if (updateResult.success) {
      // Recalculate total stock
      const newTotalStock = product.sizes.reduce((sum, s, idx) => {
        if (idx === sizeIndex) return sum + newStock;
        return sum + s.stock;
      }, 0);
      
      console.log(`Stock updated successfully. New total: ${newTotalStock}`);
      alert(`Stock updated successfully!\nSize ${sizeStr}: ${currentStock} → ${newStock}\nTotal stock: ${newTotalStock}`);
      
      // Reload both tables
      setTimeout(() => {
        loadInventory();
        loadProductsAdmin();
      }, 500);
    } else {
      alert('Error updating stock: ' + (updateResult.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error updating stock:', error);
    alert('Error updating stock: ' + error.message);
  }
}

async function updateOrderStatusAdmin(orderId, newStatus) {
  const result = await OrderManager.updateOrderStatus(orderId, newStatus);
  if (result.success) {
    alert('✅ Order status updated successfully!');
    loadOrdersAdmin();
  } else {
    console.error('❌ Error updating order status:', result.error);
    alert(`❌ Error updating order status:\n\n${result.error}\n\nCheck browser console for details. Make sure:\n1. You are logged in as an admin\n2. Your user has isAdmin: true in Firestore users collection\n3. Firestore rules are published\n4. Sign out and sign back in after any changes`);
  }
}

async function deleteOrderAdmin(orderId) {
  if (confirm('Are you sure you want to delete this order?')) {
    await OrderManager.deleteOrder(orderId);
    loadOrdersAdmin();
  }
}

async function printBill(orderId) {
  const result = await OrderManager.getOrderById(orderId);
  if (!result.success) return;
  
  const order = result.order;
  const billWindow = window.open('', '_blank');
  const billHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Bill</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        .bill-container { max-width: 600px; margin: 0 auto; }
        h1 { text-align: center; }
        .bill-section { margin: 20px 0; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .total { font-weight: bold; font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="bill-container">
        <h1>R.V Fashion Hub</h1>
        <div class="bill-section">
          <h3>Order Details</h3>
          <p>Order ID: ${order.orderId}</p>
          <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        
        <div class="bill-section">
          <h3>Customer Details</h3>
          <p>Name: ${order.customerName}</p>
          <p>Phone: ${order.phoneNumber}</p>
          <p>Address: ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
        </div>
        
        <div class="bill-section">
          <h3>Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.size.size}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.sellingPrice}</td>
                  <td>₹${item.sellingPrice * item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="bill-section">
          <h3>Bill Summary</h3>
          <p>Subtotal: ₹${order.originalTotal}</p>
          <p>Discount: -₹${order.discount}</p>
          <p class="total">Total Amount: ₹${order.total}</p>
          <p>Payment Mode: ${order.paymentMode === 'upi' ? 'Online (PhonePay)' : 'Cash on Delivery'}</p>
          ${order.paymentMode === 'upi' && order.paymentTxnLast4 ? `<p>Transaction ID (Last 4): ${order.paymentTxnLast4} ${order.paymentVerified ? '(Verified)' : ''}</p>` : ''}
        </div>
      </div>
      <script>
        window.print();
        window.close();
      </script>
    </body>
    </html>
  `;
  
  billWindow.document.write(billHTML);
  billWindow.document.close();
}

function sendWhatsAppUpdate(orderId) {
  const phoneNumber = prompt('Enter customer WhatsApp number (with country code):');
  if (!phoneNumber) return;
  
  const message = encodeURIComponent(`Hi! Your order ${orderId} has been updated. Track your order on our website.`);
  window.open(`https://wa.me/${phoneNumber}?text=${message}`);
}

async function exportOrdersCSV() {
  await OrderManager.exportOrdersToCSV();
  alert('Orders exported to CSV!');
}

window.showAdminSection = showAdminSection;
window.openProductForm = openProductForm;
window.closeProductForm = closeProductForm;
window.saveProduct = saveProduct;
window.deleteProductAdmin = deleteProductAdmin;
window.updateStockAdmin = updateStockAdmin;
window.updateOrderStatusAdmin = updateOrderStatusAdmin;
window.deleteOrderAdmin = deleteOrderAdmin;
window.printBill = printBill;
window.sendWhatsAppUpdate = sendWhatsAppUpdate;
window.exportOrdersCSV = exportOrdersCSV;

// ========== ABOUT PAGE MANAGEMENT ==========
async function loadAboutSettings() {
  const defaultSettings = {
    image: "",
    text: "Welcome to R.V Fashion Hub, your destination for luxury clothing and premium fashion accessories. We pride ourselves on offering the finest quality garments with exclusive designs.",
    vision: "Our vision is to bring premium fashion to everyone.",
    whatsapp: "",
    phone: "",
    email: "",
    facebook: "",
    instagram: "",
    youtube: ""
  };

  let settings = null;
  try {
    const aboutRef = doc(db, 'settings', 'about');
    const snap = await getDoc(aboutRef);
    if (snap.exists()) {
      settings = { ...defaultSettings, ...snap.data() };
    }
  } catch (error) {
    console.warn('Failed to load About settings from Firestore:', error);
  }

  if (!settings) {
    try {
      settings = JSON.parse(localStorage.getItem('aboutSettings') || 'null');
    } catch (e) {
      settings = null;
    }
    settings = { ...defaultSettings, ...(settings || {}) };
  }

  // Keep local cache for quicker subsequent loads and backward compatibility
  try {
    localStorage.setItem('aboutSettings', JSON.stringify(settings));
  } catch (e) {
    // ignore
  }
  
  const homeAboutSection = document.getElementById('homeAboutSection');
  const aboutSection = document.getElementById('aboutSection');

  // Prefill admin form inputs if present
  const aboutImageUrlEl = document.getElementById('aboutImageUrl');
  const aboutTextEl = document.getElementById('aboutText');
  const aboutVisionEl = document.getElementById('aboutVision');
  const aboutWhatsAppEl = document.getElementById('aboutWhatsApp');
  const aboutPhoneEl = document.getElementById('aboutPhone');
  const aboutEmailEl = document.getElementById('aboutEmail');
  const aboutFacebookEl = document.getElementById('aboutFacebook');
  const aboutInstagramEl = document.getElementById('aboutInstagram');
  const aboutYouTubeEl = document.getElementById('aboutYouTube');

  if (aboutImageUrlEl) aboutImageUrlEl.value = settings.image || '';
  if (aboutTextEl) aboutTextEl.value = settings.text || '';
  if (aboutVisionEl) aboutVisionEl.value = settings.vision || '';
  if (aboutWhatsAppEl) aboutWhatsAppEl.value = settings.whatsapp || '';
  if (aboutPhoneEl) aboutPhoneEl.value = settings.phone || '';
  if (aboutEmailEl) aboutEmailEl.value = settings.email || '';
  if (aboutFacebookEl) aboutFacebookEl.value = settings.facebook || '';
  if (aboutInstagramEl) aboutInstagramEl.value = settings.instagram || '';
  if (aboutYouTubeEl) aboutYouTubeEl.value = settings.youtube || '';
  
  if (homeAboutSection) {
    homeAboutSection.innerHTML = `
      ${settings.image ? `<img src="${settings.image}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">` : ''}
      <p style="font-size: 16px; line-height: 1.8; color: var(--text-dark);">${settings.text}</p>
      ${settings.vision ? `<p style="font-size:15px; color:var(--primary-color); font-weight:700; margin-top:10px;">Our Vision: ${settings.vision}</p>` : ''}
      <div style="margin-top:16px; display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
        ${settings.phone ? `<a href="tel:${settings.phone}" style="display:inline-flex; align-items:center; gap:8px; background:var(--success); color:white; padding:10px 16px; border-radius:25px; text-decoration:none; font-weight:600; font-size:14px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> Call Us</a>` : ''}
        ${settings.whatsapp ? `<a href="https://wa.me/${settings.whatsapp}" target="_blank" style="display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; background:#25D366; border-radius:50%; text-decoration:none;" title="WhatsApp"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>` : ''}
        ${settings.email ? `<a href="mailto:${settings.email}" style="display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; background:#EA4335; border-radius:50%; text-decoration:none;" title="Email"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg></a>` : ''}
        ${settings.facebook ? `<a href="${settings.facebook}" target="_blank" style="display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; background:#1877F2; border-radius:50%; text-decoration:none;" title="Facebook"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>` : ''}
        ${settings.instagram ? `<a href="${settings.instagram}" target="_blank" style="display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; background:linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); border-radius:50%; text-decoration:none;" title="Instagram"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>` : ''}
        ${settings.youtube ? `<a href="${settings.youtube}" target="_blank" style="display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; background:#FF0000; border-radius:50%; text-decoration:none;" title="YouTube"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>` : ''}
      </div>
    `;
  }
  
  if (aboutSection) {
    aboutSection.innerHTML = `
      ${settings.image ? `<img src="${settings.image}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">` : ''}
      <p style="font-size: 16px; line-height: 1.8; color: var(--text-dark);">${settings.text}</p>
      ${settings.vision ? `<p style="font-size:15px; color:var(--primary-color); font-weight:700; margin-top:10px;">Our Vision: ${settings.vision}</p>` : ''}
      <div style="margin-top:16px; display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
        ${settings.phone ? `<a href="tel:${settings.phone}" style="display:inline-flex; align-items:center; gap:8px; background:var(--success); color:white; padding:10px 16px; border-radius:25px; text-decoration:none; font-weight:600; font-size:14px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> Call Us</a>` : ''}
        ${settings.whatsapp ? `<a href="https://wa.me/${settings.whatsapp}" target="_blank" style="display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; background:#25D366; border-radius:50%; text-decoration:none;" title="WhatsApp"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>` : ''}
        ${settings.email ? `<a href="mailto:${settings.email}" style="display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; background:#EA4335; border-radius:50%; text-decoration:none;" title="Email"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg></a>` : ''}
        ${settings.facebook ? `<a href="${settings.facebook}" target="_blank" style="display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; background:#1877F2; border-radius:50%; text-decoration:none;" title="Facebook"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>` : ''}
        ${settings.instagram ? `<a href="${settings.instagram}" target="_blank" style="display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; background:linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); border-radius:50%; text-decoration:none;" title="Instagram"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>` : ''}
        ${settings.youtube ? `<a href="${settings.youtube}" target="_blank" style="display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; background:#FF0000; border-radius:50%; text-decoration:none;" title="YouTube"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>` : ''}
      </div>
    `;
  }
}

async function saveAboutSettings() {
  const settings = {
    image: document.getElementById('aboutImageUrl').value,
    text: document.getElementById('aboutText').value || 'Welcome to R.V Fashion Hub',
    vision: document.getElementById('aboutVision') ? document.getElementById('aboutVision').value : '',
    whatsapp: document.getElementById('aboutWhatsApp') ? document.getElementById('aboutWhatsApp').value.replace(/[^0-9+]/g, '') : '',
    phone: document.getElementById('aboutPhone') ? document.getElementById('aboutPhone').value.replace(/[^0-9+\s()-]/g, '') : '',
    email: document.getElementById('aboutEmail') ? document.getElementById('aboutEmail').value : '',
    facebook: document.getElementById('aboutFacebook') ? document.getElementById('aboutFacebook').value : '',
    instagram: document.getElementById('aboutInstagram') ? document.getElementById('aboutInstagram').value : '',
    youtube: document.getElementById('aboutYouTube') ? document.getElementById('aboutYouTube').value : ''
  };
  
  // Always store locally (useful if Firestore fails or offline)
  try {
    localStorage.setItem('aboutSettings', JSON.stringify(settings));
  } catch (e) {
    // ignore
  }

  // Persist to Firestore so it works across refresh / browsers / devices
  try {
    const aboutRef = doc(db, 'settings', 'about');
    await setDoc(aboutRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Failed to save About settings to Firestore:', error);
    alert('Saved locally, but failed to save to server. Please login as admin and try again.');
    await loadAboutSettings();
    return;
  }

  await loadAboutSettings();
  alert('About page settings saved!');
}

window.saveAboutSettings = saveAboutSettings;

// Make functions globally available (reassign after they're defined)
window.showPage = showPage;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.logout = logout;
window.toggleUserMenu = toggleUserMenu;
window.showProductDetail = showProductDetail;
window.displayProducts = displayProducts;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.proceedToCheckout = proceedToCheckout;
window.processPayment = processPayment;
window.showAddressForm = showAddressForm;
window.closeAddressForm = closeAddressForm;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.quickAddToCart = quickAddToCart;
window.handleMainSearch = handleMainSearch;
window.showAdminSection = showAdminSection;
window.saveAboutSettings = saveAboutSettings;
window.saveProduct = saveProduct;
window.deleteProductAdmin = deleteProductAdmin;
window.updateStockAdmin = updateStockAdmin;
window.updateOrderStatusAdmin = updateOrderStatusAdmin;
window.printBill = printBill;
window.sendWhatsAppUpdate = sendWhatsAppUpdate;
window.exportOrdersCSV = exportOrdersCSV;
window.showOrderTracking = showOrderTracking;
window.closeProductForm = closeProductForm;
window.loadProductsAdmin = loadProductsAdmin;
window.loadDashboard = loadDashboard;
window.loadInventory = loadInventory;
window.loadOrdersAdmin = loadOrdersAdmin;
window.loadReviewsAdmin = loadReviewsAdmin;
window.deleteReviewAdmin = deleteReviewAdmin;
window.addSizeField = addSizeField;
window.editProductAdmin = editProductAdmin;
// Expose allProducts to global scope for onclick handlers
Object.defineProperty(window, 'allProducts', {
  get: function() { return allProducts; },
  set: function(val) { allProducts = val; }
});