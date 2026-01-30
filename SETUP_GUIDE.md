# R.V Fashion Hub - Configuration & Setup Guide

## 🔧 Complete Setup Instructions

### Part 1: Initial Setup

#### Option A: Direct Use (Recommended for Testing)
1. Open `index.html` in your web browser
2. The app will work immediately with Firebase integration
3. Data will be stored in your Firebase project

#### Option B: Local Development
1. Use any code editor (VS Code, etc.)
2. Open the folder in a live server (VS Code extension or similar)
3. Navigate to `http://localhost:5500` (or your port)

---

## 🔐 Firebase Configuration

The app is pre-configured with the following Firebase details:

```javascript
firebaseConfig = {
  apiKey: "AIzaSyAMG0udpRspwWhjYnelXFRujAKTfKHsU0g",
  authDomain: "r-v-online-store.firebaseapp.com",
  projectId: "r-v-online-store",
  storageBucket: "r-v-online-store.firebasestorage.app",
  messagingSenderId: "949459989826",
  appId: "1:949459989826:web:c7cf8a1e67ea1671af84db",
  measurementId: "G-J8QPS6QGHX"
}
```

**No additional configuration needed** - Firebase is ready to use!

### If You Want to Use Your Own Firebase Project:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing
3. Enable:
   - Realtime Database
   - Authentication (Email/Password)
   - Storage (for images)
4. Update the config in `assets/js/firebase-config.js`

---

## 👥 User Management

### Customer Accounts
- **Created via:** Sign-up form on the website
- **Authentication:** Phone number + Password
- **Data Storage:** Firebase
- **Email:** Auto-generated as `phonenumber@rvfashion.local`

### Admin Account
- **Username:** admin@rvfashion.com
- **Password:** admin123
- **Location:** `admin-login.html`

**Important:** Change admin credentials in production!

To change admin credentials:
1. Open `admin-login.html`
2. Find the code section with demo credentials
3. Update the values:
   ```javascript
   const adminEmail = 'your-email@rvfashion.com';
   const adminPassword = 'your-secure-password';
   ```

---

## 💳 Payment Gateway Setup

### PhonePay UPI Integration

**Current Configuration:**
- UPI ID: 8538081480@ybl
- Auto-redirect on selection

**To Change UPI ID:**
1. Open `assets/js/main.js`
2. Find the `processPayment()` function
3. Change the line:
   ```javascript
   const upiId = '8538081480@ybl'; // Change this to your UPI ID
   ```

**Testing PhonePay:**
- PhonePay app must be installed on device
- Alternative: Use web-based UPI payment apps
- Payment creates order with transaction ID tracking

---

## 📦 Product Management

### Adding Sample Products

**Method 1: Using Admin Panel**
1. Login to admin (admin-login.html)
2. Go to Products section
3. Click "+ Add New Product"
4. Fill in details with JSON sizes format

**Method 2: Using Sample Data**
- See `SAMPLE_PRODUCTS.json` for product examples
- Manually add each product via admin panel
- Or import via Firebase Console

**Product JSON Format:**
```json
{
  "name": "Product Name",
  "brand": "Brand Name",
  "category": "Category",
  "barcode": "UNIQUE_BARCODE",
  "imageUrl": "https://image-url.jpg",
  "description": "Product description",
  "sizes": [
    {"size": "S", "mrp": 1000, "sellingPrice": 600, "stock": 10},
    {"size": "M", "mrp": 1000, "sellingPrice": 600, "stock": 15}
  ]
}
```

### Image URLs
Use URLs from:
- Unsplash: `https://unsplash.com`
- Pexels: `https://pexels.com`
- Your own server
- Cloud storage (Google Drive, OneDrive, etc.)

---

## 🎨 Customization Guide

### Colors & Branding

Edit `assets/css/style.css` - Root Variables:

```css
:root {
  --primary-color: #1a1a1a;      /* Main black */
  --secondary-color: #d4af37;    /* Gold accent */
  --accent-color: #ffffff;       /* White */
  --light-bg: #f5f5f5;          /* Light gray */
  --text-dark: #333333;         /* Dark text */
  --text-light: #666666;        /* Light text */
  --border-color: #e0e0e0;      /* Borders */
  --success: #27ae60;           /* Green */
  --danger: #e74c3c;            /* Red */
  --warning: #f39c12;           /* Orange */
}
```

### Logo
- File: `index.html` - Line with "R.V Fashion"
- Change text or add image

### Banner
- Use Admin Panel → Banner section
- Change text, colors, animation speed
- Changes persist in localStorage

### About Page
- Use Admin Panel → About Page section
- Upload image URL
- Edit description text
- Changes appear on Home and About pages

---

## 📱 Responsive Design

The site is optimized for:
- **Desktop:** 1400px+ (full-width)
- **Tablet:** 768px - 1024px (2 columns)
- **Mobile:** < 768px (1 column, stacked)

To customize breakpoints in `style.css`:
```css
@media (max-width: 768px) {
  /* Mobile styles */
}
```

---

## 🗄️ Database Structure

### Firebase Realtime Database

```
root
├── customers
│   └── {uid}
│       ├── phoneNumber
│       ├── name
│       ├── email
│       ├── createdAt
│       ├── addresses
│       │   └── {addressId}
│       │       ├── name
│       │       ├── phone
│       │       ├── addressLine1
│       │       └── ...
│       └── orders
│           └── {orderId}
│
├── products
│   └── {productId}
│       ├── name
│       ├── brand
│       ├── category
│       ├── barcode
│       ├── imageUrl
│       ├── description
│       ├── sizes (array)
│       ├── totalStock
│       ├── rating
│       ├── ratingCount
│       └── createdAt
│
└── orders
    └── {orderId}
        ├── customerId
        ├── customerName
        ├── phoneNumber
        ├── items (array)
        ├── shippingAddress
        ├── total
        ├── discount
        ├── status
        ├── paymentMode
        ├── createdAt
        └── updatedAt
```

---

## 🔒 Security Considerations

### Current Security
- Firebase Authentication for users
- Password-protected admin login
- Database rules (configure in Firebase Console)
- HTTPS recommended for production

### Production Recommendations
1. **Change Admin Credentials** in admin-login.html
2. **Set Firebase Rules:**
   ```json
   {
     "rules": {
       "products": {
         ".read": true,
         ".write": "auth != null && root.child('admins').child(auth.uid).exists()"
       },
       "customers": {
         "$uid": {
           ".read": "$uid === auth.uid",
           ".write": "$uid === auth.uid"
         }
       },
       "orders": {
         "$oid": {
           ".read": "root.child('orders').child($oid).child('customerId').val() === auth.uid"
         }
       }
     }
   }
   ```
3. **Enable HTTPS** on your hosting
4. **Regular Backups** of Firebase data
5. **Monitor Firebase Usage** for unauthorized access

---

## 📊 Analytics Setup

### Google Analytics (Optional)
Add to `<head>` in `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

Replace `GA_MEASUREMENT_ID` with your Google Analytics ID.

---

## 🚀 Deployment Options

### 1. **GitHub Pages** (Free, Static)
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```
Then enable Pages in GitHub settings.

### 2. **Netlify** (Free, Fast)
- Drag and drop folder
- Auto-deployment on push
- Custom domain support

### 3. **Vercel** (Free, Optimized)
- Connect GitHub repo
- Auto-deploy on commit
- Email support

### 4. **Traditional Hosting**
- Upload via FTP
- Configure domain DNS
- Enable SSL certificate

---

## 🔧 Troubleshooting

### Firebase Not Connecting
**Issue:** "Failed to initialize Firebase"
- Check internet connection
- Verify API key is correct
- Check Firebase project is active

### Cart Not Persisting
**Issue:** Items disappear after refresh
- Check localStorage is enabled
- Try clearing cache
- Use incognito mode

### Payment Not Working
**Issue:** PhonePay redirect fails
- Install PhonePay app on device
- Check UPI ID format
- Try different payment method

### Admin Panel Access
**Issue:** Can't login to admin
- Verify credentials are correct
- Check browser console for errors
- Clear cookies and try again

---

## 📝 Environment Variables

For advanced setup, create `.env` file (if using build tools):

```
VITE_FIREBASE_API_KEY=YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_PAYMENT_UPI_ID=YOUR_UPI_ID
VITE_ADMIN_EMAIL=admin@example.com
VITE_ADMIN_PASSWORD=securepass
```

---

## 🎯 Performance Optimization

### Current Features
- Lazy loading of products
- Optimized CSS with variables
- Minimal JavaScript
- Local caching

### To Further Optimize
1. Minify CSS/JS in production
2. Use image CDN
3. Enable gzip compression
4. Add service worker for offline
5. Use WebP format for images

---

## 📞 Support & Maintenance

### Regular Maintenance Checklist
- [ ] Backup Firebase data monthly
- [ ] Monitor storage usage
- [ ] Review customer feedback
- [ ] Update product images
- [ ] Check payment transactions
- [ ] Clean old orders (archive first)
- [ ] Update inventory levels

### Common Admin Tasks
1. **Daily:** Check new orders, update statuses
2. **Weekly:** Review inventory, restock low items
3. **Monthly:** Analyze sales, update products
4. **Quarterly:** Backup data, review analytics

---

## 🚨 Backup & Recovery

### Firebase Backup
1. Go to Firebase Console
2. Database → Backups
3. Create manual backup
4. Download JSON export

### Local Backup
```javascript
// Export all data (in browser console)
firebase.database().ref('/').once('value').then(snapshot => {
  const data = JSON.stringify(snapshot.val());
  // Download as file
});
```

---

## ✅ Pre-Launch Checklist

- [ ] Firebase project created
- [ ] Admin credentials changed
- [ ] Sample products added
- [ ] Banner customized
- [ ] About page updated
- [ ] Payment UPI ID verified
- [ ] Admin panel tested
- [ ] Customer registration tested
- [ ] Order flow tested
- [ ] Responsive design checked
- [ ] Contact form configured
- [ ] Domain configured
- [ ] SSL certificate installed
- [ ] Analytics setup
- [ ] Backup system ready

---

**Need Help?** Check README.md and QUICK_START.md for more information.
