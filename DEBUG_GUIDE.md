# 🔧 DEBUGGING GUIDE - Orders Not Showing in Admin

## Step 1: Open Developer Console (CRITICAL!)

1. **Press `F12`** (or `Cmd+Option+I` on Mac)
2. Click the **"Console"** tab
3. **Keep this open while testing**

---

## Step 2: Test Order Creation

### Clear old data first:
```javascript
localStorage.clear(); // Clear cart and user data
location.reload(); // Refresh page
```

### Then:
1. **Sign up** as a new customer (use phone like 9876543210, password: 123456)
2. **Add a product to cart** (Select size first!)
3. **Go to cart** → **Proceed to checkout**
4. **Add an address** or select existing one
5. **Select "Cash on Delivery"** payment mode
6. **Click "Place Order"**

---

## Step 3: Watch the Console Output

You should see logs like:

```
🔵 Creating order for customer: hPqX...
📦 Cart items: Array(1)
📝 Generated Order ID: ORD-1706123456789-abc3de5f2
💾 Saving order to Firestore: {...}
✅ Order saved successfully with Firestore ID: abc123def456
📉 Starting stock reduction for 1 items
  Reducing stock for product: vlPYX... size: M qty: 2
✅ Stock reduced for product vlPYX... by 2
🎉 Order creation complete
```

**If you see ERRORS in red**, screenshot and share them!

---

## Step 4: Check Admin Panel

1. **Login as admin** (email: admin@rvfashion.com, pass: admin123)
2. **Click Admin Panel** (top right)
3. **Click "Orders"** tab
4. Watch console again - you should see:

```
📋 Fetching all orders from Firestore...
✅ Found 1 orders in Firestore
📦 First order: {id: "abc123...", orderId: "ORD-...", customerName: "...", ...}
```

---

## Step 5: Troubleshooting

### ❌ If You See "No orders found":

**Check the Firestore Permissions!**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **r-v-online-store**
3. Click **Firestore Database** → **Rules** tab
4. Make sure rules include:
   ```javascript
   match /orders/{orderId} {
     allow create: if request.auth != null;
     allow read: if request.auth.uid == resource.data.customerId || request.auth.token.isAdmin == true;
     allow update: if request.auth.token.isAdmin == true;
   }
   ```
5. If not, paste these rules and click **Publish**

---

### ❌ If You See Permission Error:

```
❌ Error creating order: Missing or insufficient permissions
```

**This means Firestore rules are not set up correctly!**

1. Go to Firebase Console
2. Firestore Database → Rules
3. Paste the complete rules from [FIRESTORE_RULES_SETUP.md](FIRESTORE_RULES_SETUP.md)
4. Click **Publish**
5. Try again

---

### ❌ If Stock is NOT Reducing:

**Watch the console for errors like:**

```
⚠️ Product not found: vlPYX...
⚠️ Size M not found in product vlPYX...
```

This means:
- The product might not exist
- The size name doesn't match (check spelling: "M" vs "m")

---

### ❌ If You See "Failed to create order: xxx":

**Read the error message carefully!** Common ones:

- **"Missing or insufficient permissions"** → Firestore rules issue
- **"Cannot read property 'quantity' of undefined"** → Cart item structure issue
- **"Maximum call stack size exceeded"** → Circular import (restart browser)

---

## Step 6: Share Diagnostic Info

If nothing works, copy everything from console and send:

1. **Open Console** (F12)
2. Right-click in console → **"Save as..."** → save as `.txt`
3. **Share the file**

Or take screenshots of:
- Console errors (in red)
- Order creation logs
- Admin orders table
- Firestore database (show if "orders" collection exists)

---

## Checklist

- [ ] Firestore Rules are published  
- [ ] Can login (customer and admin)
- [ ] Can add products to cart
- [ ] Console shows creation logs (no red errors)
- [ ] Admin panel can fetch orders
- [ ] Orders display in admin "Orders" tab
- [ ] Stock reduces in "Inventory" tab

---

## Quick Test Commands (paste in console):

```javascript
// Test 1: Check if user is logged in
console.log('Current User:', currentUser);

// Test 2: Check cart
console.log('Cart:', CartManager.getLocalCart());

// Test 3: Check Firebase connection
console.log('Firebase App:', firebase.app());

// Test 4: Manually fetch orders
OrderManager.getAllOrders().then(r => console.log('Orders:', r));
```

---

## Contact

If still stuck, provide:
1. Screenshots of console errors
2. Your Firestore rules (paste from Firebase Console)
3. The step where it fails

