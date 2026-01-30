# R.V Fashion Hub - Luxury E-Commerce Website

A premium luxury clothing e-commerce platform built with HTML, CSS, JavaScript, and Firebase.

## Features Implemented

### Customer Features
1. **User Authentication**
   - Mobile number-based registration and login
   - Password-protected accounts
   - User profile with name display
   - Logout functionality

2. **Product Browsing**
   - Display all products with images, brand, and pricing
   - Product details with images and descriptions
   - MRP and selling price displayed on products
   - Discount percentage calculation
   - Stock availability status
   - "Sold Out" badge when stock reaches 0
   - Star rating display

3. **Product Filtering & Search**
   - Filter by category, brand, and price range
   - Search products by name, brand, or barcode
   - Main search bar in header for quick search
   - Reset filters option

4. **Shopping Cart**
   - Add products to cart with size selection
   - Update quantities in cart
   - Remove items from cart
   - View cart summary with totals
   - Discount calculation on checkout
   - Local storage persistence

5. **Checkout & Orders**
   - Multiple address selection/management
   - Save addresses for future purchases
   - Address editing and deletion
   - Payment method selection (Online/COD)
   - PhonePay UPI integration (8538081480@ybl)
   - Order confirmation and tracking

6. **Order Tracking**
   - View all orders in "My Orders" page
   - Track order status (Pending, Confirmed, Shipped, Delivered)
   - View detailed order information
   - Order history with dates and amounts

7. **Product Ratings**
   - 5-star rating system
   - Leave ratings on products
   - Display average ratings

8. **Customizable Content**
   - About Us page (fully editable by admin)
   - Customizable banner (text, color, animation speed)

### Admin Panel Features
1. **Dashboard**
   - View total products, orders, and revenue

2. **Product Management**
   - Add new products with details:
     - Product name, brand, category
     - Barcode
     - Image URL
     - Description
     - Multiple sizes with MRP and selling prices
     - Stock for each size
   - Edit products
   - Delete products
   - View product list

3. **Inventory Management**
   - Search products by name or barcode
   - Update stock levels per size
   - Real-time stock display

4. **Order Management**
   - View all customer orders
   - Update order status (Pending → Confirmed → Shipped → Delivered)
   - Send WhatsApp updates to customers
   - Print order bills/receipts
   - Delete old orders
   - Export orders to CSV

5. **Banner Customization**
   - Edit banner text
   - Change background color
   - Change text color
   - Adjust animation speed
   - Live preview

6. **About Page Management**
   - Upload/change about page image
   - Edit about page description
   - Publish changes instantly

## Technical Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Firebase Realtime Database
- **Authentication:** Firebase Authentication
- **Storage:** Firebase Storage (for images)
- **Payment:** PhonePay UPI Integration
- **Hosting:** Compatible with any static hosting (GitHub Pages, Netlify, Vercel, etc.)

## Database Structure (Firebase)

```
firebase-database
├── customers/
│   ├── {uid}/
│   │   ├── phoneNumber
│   │   ├── name
│   │   ├── email
│   │   ├── addresses/
│   │   │   ├── {addressId}/
│   │   │   │   ├── name, phone, address details
│   │   └── orders/
│   │       ├── {orderId}
├── products/
│   ├── {productId}/
│   │   ├── name, brand, category
│   │   ├── barcode, imageUrl
│   │   ├── description
│   │   ├── sizes/ (array with size, mrp, sellingPrice, stock)
│   │   ├── totalStock
│   │   ├── rating, ratingCount
└── orders/
    ├── {orderId}/
    │   ├── customerId, customerName, phoneNumber
    │   ├── items (array of ordered items)
    │   ├── shippingAddress
    │   ├── total, discount
    │   ├── status, paymentMode
    │   ├── createdAt, updatedAt
```

## Firebase Configuration

The app uses the following Firebase project:
- **Project ID:** r-v-online-store
- **Auth Domain:** r-v-online-store.firebaseapp.com
- **Database URL:** r-v-online-store.firebasestorage.app

Credentials are already configured in the code.

## Payment Integration

**PhonePay UPI:**
- UPI ID: 8538081480@ybl
- Integration: Automatic redirect to PhonePay on online payment selection
- The app tracks payment via order ID and transaction reference

## How to Use

### For Customers
1. **Sign Up:** Navigate to login page and create account with mobile number
2. **Browse Products:** Use shop page to view products
3. **Search & Filter:** Use header search or filters to find products
4. **Add to Cart:** View product details and add to cart
5. **Checkout:** Proceed to checkout with saved/new address
6. **Payment:** Choose payment method and complete payment
7. **Track Order:** View orders and track status in "My Orders"

### For Admin
1. **Access Admin Panel:** Add `#admin-page` to URL or navigate through code
2. **Add Products:** Go to Products section and fill in product details
3. **Manage Inventory:** Search products and update stock
4. **View Orders:** See all customer orders and update status
5. **Customize:** Edit banner, about page in respective sections
6. **Export:** Download order CSV for records

## Sample Product Data Format

When adding products in admin panel, use this JSON format for sizes:

```json
[
  {
    "size": "S",
    "mrp": 2000,
    "sellingPrice": 1200,
    "stock": 10
  },
  {
    "size": "M",
    "mrp": 2000,
    "sellingPrice": 1200,
    "stock": 15
  },
  {
    "size": "L",
    "mrp": 2200,
    "sellingPrice": 1320,
    "stock": 12
  }
]
```

## Responsive Design

- Fully responsive on mobile, tablet, and desktop
- Adaptive grid layouts
- Touch-friendly buttons and inputs
- Mobile-optimized navigation

## Security Features

- Password-protected accounts
- Firebase authentication
- Customer data privacy
- Secure payment handling

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## File Structure

```
rv/
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js
│       ├── firebase-config.js
│       ├── auth.js
│       ├── product.js
│       ├── cart.js
│       └── order.js
├── admin/
│   └── pages/
└── README.md
```

## Future Enhancements

- Product image gallery
- Wishlist feature
- Customer reviews with images
- Email notifications
- SMS alerts
- Multiple payment gateways
- Coupon/discount codes
- Inventory analytics
- Email marketing integration

## Support & Contact

For issues or feature requests, contact R.V Fashion Hub admin panel.

---

**Version:** 1.0  
**Last Updated:** January 2024  
**Status:** Production Ready
