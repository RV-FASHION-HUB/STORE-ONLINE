# Troubleshooting Guide - R.V Fashion Hub

## Common Issues & Solutions

---

## 🔴 Critical Issues

### Firebase Not Connecting

**Symptoms:** 
- "Failed to initialize Firebase"
- Products not loading
- Can't save data

**Solutions:**
1. **Check Internet Connection**
   - Verify your internet is working
   - Try refreshing the page

2. **Verify Firebase Configuration**
   - Open `assets/js/firebase-config.js`
   - Ensure all keys are correct:
     ```javascript
     apiKey: "AIzaSyAMG0udpRspwWhjYnelXFRujAKTfKHsU0g"
     projectId: "r-v-online-store"
     ```

3. **Check Browser Console**
   - Press F12 → Console tab
   - Look for error messages
   - Screenshot error and check online

4. **Clear Browser Cache**
   - Clear cookies and cache
   - Try incognito/private mode
   - Try different browser

5. **Check Firebase Status**
   - Go to Firebase Console
   - Verify project is active
   - Check if API is enabled

---

### Authentication Not Working

**Symptoms:**
- Can't create account
- Can't login
- "Invalid credentials" error

**Solutions:**

1. **Check Phone Number Format**
   - Must be exactly 10 digits
   - No spaces, hyphens, or +91 prefix
   - Valid Indian phone number

2. **Check Password Requirements**
   - Minimum 6 characters
   - Use mix of letters and numbers
   - No special characters needed

3. **Verify Firebase Auth Setup**
   - Firebase Console → Authentication
   - Check "Email/Password" is enabled
   - Create test user manually

4. **Clear Local Storage**
   ```javascript
   // In browser console:
   localStorage.clear()
   // Refresh page
   ```

5. **Try Different Email Format**
   - System generates: `phonenumber@rvfashion.local`
   - This should work automatically

---

### Cart Not Saving

**Symptoms:**
- Items disappear after refresh
- Can't add to cart
- Cart always empty

**Solutions:**

1. **Enable localStorage**
   - Browser settings → Privacy
   - Allow local storage
   - Clear cache (keep cookies)

2. **Check Browser Permissions**
   - Some browsers block storage
   - Try different browser
   - Use Chrome/Firefox/Safari

3. **Verify Console Errors**
   - Press F12
   - Go to Console
   - Look for storage errors

4. **Test localStorage Directly**
   ```javascript
   // In browser console:
   localStorage.setItem('test', 'works')
   localStorage.getItem('test') // Should return 'works'
   ```

5. **Hard Refresh Browser**
   - Ctrl+Shift+R (Windows)
   - Cmd+Shift+R (Mac)
   - Ctrl+F5

---

## ⚠️ Feature Issues

### Products Not Showing

**Symptoms:**
- "No products found" message
- Empty product grid
- Filters not working

**Solutions:**

1. **Check if Products Added**
   - Login to admin
   - Go to Products section
   - Verify products exist
   - Add sample products if needed

2. **Try Resetting Filters**
   - Click "Reset" button
   - Clear search bar
   - Uncheck all filters
   - Refresh page

3. **Check Product Data Format**
   - Each product needs:
     - Name, Brand, Category
     - Barcode, Image URL
     - Sizes with prices and stock
   - Missing data causes issues

4. **Clear App Cache**
   ```javascript
   // In console:
   location.reload(true)
   ```

5. **Use Sample Products**
   - Use data from SAMPLE_PRODUCTS.json
   - Add them via admin panel
   - Or import directly in Firebase

---

### Search Not Working

**Symptoms:**
- Search returns no results
- Search shows wrong products
- Search bar seems broken

**Solutions:**

1. **Correct Search Syntax**
   - Product name (case-insensitive)
   - Brand name
   - Exact barcode
   - Don't use special characters

2. **Check Spelling**
   - Verify product name
   - Check brand spelling
   - Enter exact barcode

3. **Test Different Search Terms**
   - Try shorter words
   - Try exact product name
   - Try brand name alone

4. **Reload Page**
   - F5 or Cmd+R
   - Then try search again

5. **Check Console for Errors**
   - F12 → Console
   - Look for JavaScript errors

---

### Payment Not Redirecting

**Symptoms:**
- PhonePay app doesn't open
- UPI payment fails
- "Invalid UPI ID" error

**Solutions:**

1. **Install PhonePay App**
   - Download from Play Store/App Store
   - Sign up and activate
   - Link bank account

2. **Verify UPI ID Format**
   - Should be: `8538081480@ybl`
   - Check admin settings
   - Verify with your bank

3. **Check Phone Features**
   - Device has internet
   - Payment app permissions enabled
   - UPI registration active

4. **Use Alternative Payment**
   - Try Cash on Delivery
   - Alternative UPI apps installed
   - Contact support for options

5. **Test on Different Device**
   - Try desktop (may not work)
   - Try different mobile
   - Try different OS (Android/iOS)

---

### Orders Not Saving

**Symptoms:**
- Order placed but not visible
- Order doesn't appear in "My Orders"
- "Order failed" message

**Solutions:**

1. **Check Login Status**
   - Must be logged in
   - Verify name shows in header
   - Logout/login if needed

2. **Verify Order Details**
   - Select delivery address
   - Select payment method
   - All items in cart
   - Sufficient stock

3. **Check Firebase Database**
   - Firebase Console → Realtime Database
   - Look under `orders/`
   - Verify data structure

4. **Review Checkout Steps**
   1. Login ✓
   2. Add items to cart ✓
   3. Select address ✓
   4. Select payment ✓
   5. Click Complete Order ✓

5. **Test with Small Order**
   - Add single item
   - Proceed to checkout
   - Use Cash on Delivery
   - Complete order

---

### Order Tracking Not Working

**Symptoms:**
- Orders visible but can't track
- Tracking page blank
- Status not updating

**Solutions:**

1. **Verify Order Exists**
   - Check in "My Orders" page
   - Click "Track Order" button
   - Order ID should display

2. **Check Admin Status**
   - Login to admin
   - Update order status
   - Verify in Orders section

3. **Refresh Page**
   - F5 or Cmd+R
   - Wait for data to load
   - Check tracking page again

4. **Clear Browser Cache**
   - F12 → Application
   - Clear Cache Storage
   - Refresh page

---

## 🔧 Admin Panel Issues

### Can't Access Admin

**Symptoms:**
- "Invalid credentials" error
- Admin-login.html not loading
- Admin panel not accessible

**Solutions:**

1. **Verify Admin Credentials**
   - Email: `admin@rvfashion.com`
   - Password: `admin123`
   - Check for typos

2. **Clear Admin Session**
   ```javascript
   // In console:
   localStorage.removeItem('rvAdminSession')
   location.reload()
   ```

3. **Change Admin Password**
   - Open `admin-login.html`
   - Find credential check code
   - Update email and password
   - Save file

4. **Check Browser Permissions**
   - Allow localStorage
   - Allow JavaScript
   - Not in private/incognito mode

5. **Test Direct URL**
   - Type in address bar: `file:///path/admin-login.html`
   - Or use web server

---

### Can't Add Products

**Symptoms:**
- "Add Product" button doesn't work
- Form won't submit
- "Invalid data" error

**Solutions:**

1. **Check Required Fields**
   - Product Name *
   - Brand *
   - Category *
   - Barcode *
   - Image URL *
   - Sizes (JSON) *
   
   All marked with * are required

2. **Verify JSON Format for Sizes**
   ```json
   [
     {"size":"S","mrp":1000,"sellingPrice":600,"stock":10},
     {"size":"M","mrp":1000,"sellingPrice":600,"stock":15}
   ]
   ```
   - Use exact format
   - Check for typos
   - Valid JSON required

3. **Valid Image URL**
   - Must start with `http://` or `https://`
   - Image must be accessible
   - Not all URLs work (CORS issues)

4. **Check Console Errors**
   - F12 → Console
   - See specific error message
   - Fix based on error

5. **Try Simple Product**
   - Use single size
   - Use simple name
   - Use valid image URL

---

### Can't Update Inventory

**Symptoms:**
- Stock won't update
- "Update" button disabled
- Stock values not changing

**Solutions:**

1. **Search Products First**
   - Use inventory search
   - Find product by name or barcode
   - Table must load

2. **Verify Product Exists**
   - Check in Products section
   - Confirm product added
   - Verify stock > 0

3. **Check New Stock Value**
   - Must be non-negative number
   - Can't exceed physical stock
   - Enter valid number

4. **Refresh Admin Panel**
   - F5 to refresh
   - Re-login to admin
   - Try again

5. **Check Firebase Permissions**
   - Verify admin credentials
   - Firebase auth must be active
   - Check database rules

---

### Orders List Empty

**Symptoms:**
- No orders showing
- "Orders table" empty
- Dashboard shows 0 orders

**Solutions:**

1. **Verify Orders Exist**
   - Place test order first
   - As logged-in customer
   - Complete checkout

2. **Check Database**
   - Firebase Console
   - Realtime Database
   - Look for `orders/` node
   - Should have order data

3. **Refresh Admin Panel**
   - Click "Orders" again
   - Or refresh entire page
   - Wait for data to load

4. **Check User Authentication**
   - Admin must be logged in
   - Verify in admin console
   - Check user menu

---

## 🎨 Design/Display Issues

### Page Layout Broken

**Symptoms:**
- Elements overlapping
- Text unreadable
- Page looks weird

**Solutions:**

1. **Check Browser Zoom**
   - Ctrl+0 (reset zoom)
   - Should be 100%
   - Not zoomed in/out

2. **Refresh Page**
   - Ctrl+Shift+R (hard refresh)
   - Clear CSS cache
   - Load fresh styles

3. **Try Different Browser**
   - Chrome, Firefox, Safari
   - Latest version
   - Mobile view on desktop

4. **Check CSS File**
   - Open DevTools (F12)
   - Check if `style.css` loaded
   - No 404 errors
   - File should be ~50KB

5. **Check Window Size**
   - Resize browser
   - Responsive design should adapt
   - Test on different widths

---

### Images Not Loading

**Symptoms:**
- Product images blank
- Broken image icons
- "Image failed to load"

**Solutions:**

1. **Check Image URL Format**
   - Must include: `https://` or `http://`
   - Must be public/accessible URL
   - Not local file paths

2. **Test Image URL**
   - Copy image URL
   - Paste in new browser tab
   - Image should display
   - If not, URL is invalid

3. **Use Reliable Image Sources**
   - Unsplash: unsplash.com
   - Pexels: pexels.com
   - Imgur: imgur.com
   - Google Drive (share link)

4. **Check Network**
   - Internet connection OK
   - No firewall blocking
   - Images loading from CDN

5. **Try Different Images**
   - Use different URL
   - Different image source
   - Small file size

---

## 📱 Mobile Issues

### Mobile Site Not Responsive

**Symptoms:**
- Page too wide
- Can't read text
- Buttons too small
- Horizontal scrolling

**Solutions:**

1. **Set Viewport Meta Tag**
   - Already in `index.html`
   - Restart browser
   - Clear mobile cache

2. **Check Device Settings**
   - Mobile zoom at 100%
   - Not zoomed in
   - Display settings normal

3. **Resize Browser Window**
   - Drag to smaller width
   - Should reflow layout
   - Single column view

4. **Test Different Mobile**
   - Try Android and iOS
   - Different screen sizes
   - Different browsers (Chrome, Safari)

---

### Touch Not Working

**Symptoms:**
- Can't tap buttons
- Swipes not responding
- Forms won't input

**Solutions:**

1. **Check Touch Enabled**
   - Device has touch screen
   - Not in airplane mode
   - Touch enabled in settings

2. **Try Tapping Differently**
   - Long press (1 second)
   - Double tap
   - Different area of button

3. **Clear Mobile Cache**
   - Settings → App
   - Clear cache/data
   - Restart browser

4. **Update Browser**
   - App Store/Play Store
   - Get latest version
   - Restart device

---

## 🔐 Security Issues

### Data Not Secure

**Symptoms:**
- Worried about data privacy
- Want password protection
- Need better security

**Solutions:**

1. **Already Secure Features**
   - Firebase authentication
   - Password hashing
   - HTTPS recommended
   - No credit card storage

2. **Improve Security**
   - Use HTTPS hosting
   - Change admin password
   - Enable 2FA if needed
   - Regular backups

3. **Backup Data**
   - Firebase Console → Backups
   - Regular daily backups
   - Download JSON export
   - Store safely

4. **Monitor Activity**
   - Check Firebase logs
   - Review access patterns
   - Set up alerts
   - Regular security checks

---

## 🆘 Still Having Issues?

### Debug Checklist

1. **Open Browser Console (F12)**
   - Look for red error messages
   - Note exact error text
   - Screenshot error

2. **Check Internet Connection**
   - Try different network
   - Turn WiFi on/off
   - Mobile data test

3. **Try Incognito Mode**
   - Ctrl+Shift+N (Chrome)
   - Cmd+Shift+N (Firefox)
   - Rules out extensions

4. **Restart Everything**
   - Close browser
   - Close all browser windows
   - Restart computer
   - Open again

5. **Try Different Browser**
   - Chrome, Firefox, Safari, Edge
   - Latest versions
   - Desktop and mobile

6. **Check Documentation**
   - README.md - Full docs
   - QUICK_START.md - Simple guide
   - SETUP_GUIDE.md - Configuration
   - This file - Troubleshooting

7. **Review Firebase**
   - Console login
   - Check database structure
   - Verify authentication
   - Check rules and permissions

### Report Bug

If issue persists:
1. Note exact error message
2. Take screenshot
3. List steps to reproduce
4. Browser and OS version
5. Contact support

---

## 🎯 Optimization Tips

### Speed Up Loading

```javascript
// In browser console:
// Check page load time
console.time('load')
// ... perform action
console.timeEnd('load')
```

1. Check internet speed
2. Minimize open tabs
3. Clear browser cache
4. Use 4G instead of 3G
5. Close background apps

### Reduce Data Usage

1. Don't upload large images (>1MB)
2. Use compressed images
3. Limit video content
4. Disable animations (if slow)

---

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] All files uploaded
- [ ] Can access main page
- [ ] Can create customer account
- [ ] Can login successfully
- [ ] Can browse products
- [ ] Can search products
- [ ] Can add to cart
- [ ] Can checkout
- [ ] Can access admin panel
- [ ] Can add products (admin)
- [ ] Can update orders (admin)
- [ ] Payment gateway tested
- [ ] Mobile view works
- [ ] All features functional

---

**Last Updated:** January 2024  
**Version:** 1.0

For more help, see README.md or SETUP_GUIDE.md
