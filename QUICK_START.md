# R.V Fashion Hub - Quick Start Guide

## 🚀 Getting Started

### 1. **Open the Website**
Simply open `index.html` in any modern web browser. The website is fully functional with local storage and Firebase integration.

### 2. **Create a Customer Account**
1. Click on "Account" → "Login" in the header
2. Click "Sign Up" link
3. Enter your details:
   - Full Name
   - Mobile Number (10 digits)
   - Password (minimum 6 characters)
4. Click "Create Account"

### 3. **Login as Customer**
1. Navigate to Account → Login
2. Enter your mobile number and password
3. Click "Login"
4. Your name will appear in the header

### 4. **Browse Products**
1. Click "Shop" in the header
2. View all luxury clothing products
3. Use filters to find products by:
   - Category (T-Shirts, Dresses, etc.)
   - Brand
   - Price Range
4. Use the search bar to find specific products

### 5. **Add Products to Cart**
1. Click on a product to view details
2. Select your preferred size
3. Rate the product if desired (optional)
4. Click "Add to Cart" or "Buy Now"
5. Cart count updates in header

### 6. **Checkout & Order**
1. Click on Cart icon in header
2. Review your items and quantities
3. Click "Proceed to Checkout"
4. Login (if not already logged in)
5. Select or add delivery address
6. Choose payment method:
   - **Online Payment:** PhonePay UPI (redirects to payment app)
   - **Cash on Delivery:** Pay at delivery
7. Click "Complete Order"

### 7. **Track Your Order**
1. Click "Account" → "My Orders"
2. View all your orders with status
3. Click "Track Order" to see detailed tracking
4. Check order progress through stages:
   - Pending
   - Confirmed
   - Shipped
   - Delivered

### 8. **Manage Addresses**
1. Click "Account" → "Addresses"
2. View all saved addresses
3. Add new address with "+ Add New Address" button
4. Edit or delete addresses as needed
5. Addresses are linked to your phone number

---

## 🔐 Admin Panel Access

### Login to Admin Panel
1. Navigate to `admin-login.html` OR
2. Go to main site and add `#admin-page` to URL

**Demo Credentials:**
- Email: `admin@rvfashion.com`
- Password: `admin123`

### Admin Dashboard Features

#### 📊 Dashboard
- View total products, orders, and revenue
- Quick overview of business metrics

#### 📦 Products Management
1. **Add New Product:**
   - Fill in product details
   - Enter sizes with MRP and selling prices
   - Set stock quantities
   - Add image URL
   - Click "Add Product"

2. **Edit Products:** Click edit button on product list

3. **Delete Products:** Click delete button (confirmation required)

**Product Data Format Example:**
```json
[
  {"size":"S","mrp":2000,"sellingPrice":1200,"stock":10},
  {"size":"M","mrp":2000,"sellingPrice":1200,"stock":15},
  {"size":"L","mrp":2200,"sellingPrice":1320,"stock":12}
]
```

#### 📋 Inventory Management
1. Search products by name or barcode
2. View stock levels for each size
3. Update stock quantities
4. Click "Update" to save changes

#### 🛒 Order Management
1. View all customer orders
2. See customer name, phone, and total amount
3. Update order status (Pending → Confirmed → Shipped → Delivered)
4. **Print Bill:** Click print button to generate invoice
5. **Send WhatsApp:** Send order updates via WhatsApp
6. **Delete Order:** Remove old orders
7. **Export CSV:** Download all orders as CSV file

#### 🎨 Banner Customization
1. Edit banner text
2. Choose background color
3. Choose text color
4. Set animation speed (1-60 seconds)
5. See live preview
6. Click "Save Banner Settings"

#### ℹ️ About Page Management
1. Upload or paste image URL
2. Edit "About Us" description
3. Click "Save About Settings"
4. Changes appear on Home and About pages immediately

---

## 💳 Payment Integration

### PhonePay UPI Payment
- **UPI ID:** 8538081480@ybl
- **Process:**
  1. Customer selects "Online Payment" at checkout
  2. System redirects to PhonePay app
  3. Customer completes payment
  4. Order is confirmed automatically
  5. Customer receives tracking details

### Cash on Delivery
- Customer can choose this option at checkout
- Payment collected at delivery
- Admin marks order as confirmed after receiving payment

---

## 📱 Key Features Summary

### For Customers
- ✅ Mobile number-based authentication
- ✅ Browse luxury clothing products
- ✅ Filter by category, brand, price
- ✅ Search products by name or barcode
- ✅ View detailed product info with ratings
- ✅ Add to shopping cart
- ✅ Multiple address management
- ✅ Secure checkout with PhonePay integration
- ✅ Track orders in real-time
- ✅ Leave product ratings
- ✅ View order history

### For Admin
- ✅ Product management (Add, Edit, Delete)
- ✅ Inventory tracking
- ✅ Stock management by size
- ✅ Order management and status updates
- ✅ WhatsApp customer updates
- ✅ Print order bills
- ✅ Export orders to CSV
- ✅ Customize banner
- ✅ Edit about page
- ✅ Dashboard analytics

---

## 🎨 Luxury Design Features

- **Premium Color Scheme:** Black, Gold (#d4af37), White
- **Responsive Design:** Works on all devices
- **Smooth Animations:** Professional transitions
- **Modern UI:** Clean and intuitive interface
- **Product Cards:** Show images, prices, discounts, stock status
- **Price Badges:** Display MRP, selling price, and discount percentage
- **Stock Indicators:** "Sold Out" badge when stock is 0
- **Rating System:** Visual star ratings and customer reviews

---

## 🗄️ Local Storage & Data

The application stores:
- **User login session** (localStorage)
- **Shopping cart** (localStorage)
- **Addresses** (Firebase database)
- **Orders** (Firebase database)
- **Products** (Firebase database)
- **Ratings** (Firebase database)
- **Banner settings** (localStorage)
- **About page settings** (localStorage)

### Data Persistence
- Cart persists until cleared
- Addresses saved in Firebase linked to phone number
- Orders permanently stored in database
- Addresses can be re-edited anytime

---

## 🔗 Firebase Integration

All data is synced with Firebase:
- **Real-time updates** on orders and products
- **Secure authentication** with email/password
- **Scalable database** for growing business
- **Easy backup** and data recovery

**Firebase Project:** r-v-online-store

---

## 📱 Responsive Breakpoints

- **Desktop:** 1400px width
- **Tablet:** 768px - 1024px
- **Mobile:** Below 768px

All pages are fully responsive and mobile-friendly.

---

## 🛠️ Technical Support

### Common Issues & Solutions

**Issue:** Cart not showing items
- **Solution:** Check if browser allows localStorage. Try in incognito mode.

**Issue:** Can't add products
- **Solution:** Ensure you're logged in. Check browser console for errors.

**Issue:** Firebase not connecting
- **Solution:** Check internet connection. Ensure Firebase config is correct.

**Issue:** Payment redirect not working
- **Solution:** PhonePay app must be installed. Try with UPI ID: 8538081480@ybl

---

## 📞 Admin Credentials

- **Email:** admin@rvfashion.com
- **Password:** admin123

**Important:** Change these credentials in production!

---

## 🚀 Deployment Instructions

### To Host Online:

1. **GitHub Pages:**
   - Push files to GitHub
   - Enable Pages in settings
   - Site will be live at yourusername.github.io/rv

2. **Netlify:**
   - Drag and drop folder
   - Automatic deployment
   - Free SSL included

3. **Vercel:**
   - Connect GitHub repository
   - Auto-deployment on push
   - Custom domain support

4. **Traditional Hosting:**
   - Upload files via FTP
   - Configure domain DNS
   - Enable HTTPS

---

## 📊 Analytics

Admin can see:
- Total products in inventory
- Total orders received
- Total revenue generated
- Order status breakdown

---

## 🎯 Next Steps

1. ✅ Add your products via Admin Panel
2. ✅ Customize banner with your message
3. ✅ Update About page with your story
4. ✅ Verify PhonePay integration
5. ✅ Test checkout process
6. ✅ Deploy online
7. ✅ Share with customers!

---

**Version:** 1.0  
**Last Updated:** January 2024  
**Support:** Check README.md for more details
