# Fix: Missing or Insufficient Permissions - Order Creation

## Problem
When trying to place an order, you get: **"Failed to create order: Missing or insufficient permissions"**

This error occurs because your Firestore security rules don't allow authenticated users to create orders.

---

## Solution

### Step 1: Open Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **r-v-online-store**
3. In the left sidebar, click **Firestore Database**

### Step 2: Set Up Security Rules

1. Click the **Rules** tab at the top
2. Delete the current rules (if any)
3. **Copy and paste the rules below:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow anyone to read and write to products collection
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.isAdmin == true;
    }
    
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read: if request.auth.uid == userId || request.auth.token.isAdmin == true;
      allow write: if request.auth.uid == userId;
      allow create: if request.auth != null;
      
      // Allow users to manage their addresses
      match /addresses/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Allow authenticated users to create and read orders
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth.uid == resource.data.customerId || request.auth.token.isAdmin == true;
      allow update: if request.auth.token.isAdmin == true;
      allow delete: if request.auth.token.isAdmin == true;
    }
    
    // Allow authenticated users to create and read reviews
    match /reviews/{reviewId} {
      allow create: if request.auth != null;
      allow read: if true;
      allow update: if request.auth.uid == resource.data.userId || request.auth.token.isAdmin == true;
      allow delete: if request.auth.uid == resource.data.userId || request.auth.token.isAdmin == true;
    }
    
    // Admin only collections
    match /banners/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.isAdmin == true;
    }
    
    match /settings/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.isAdmin == true;
    }
  }
}
```

### Alternative (recommended when you don't use custom claims)

If you don't want to set custom `isAdmin` claims via the Firebase Admin SDK, you can instead make Firestore rules consult the `users` document for the signed-in user. This is easier to manage from the console (flip the `isAdmin` field in the user's document) and avoids requiring server-side custom claims.

Replace the `orders` / admin checks above with the following snippet (or add it alongside):

```javascript
match /orders/{orderId} {
  allow create: if request.auth != null;
  allow read: if request.auth != null && (
    // allow customers to read their own orders
    request.auth.uid == resource.data.customerId ||
    // allow admins if their user document has isAdmin == true
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
  );
  allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
  allow delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}
```

Notes:
- This rule uses `get()` to read the authenticated user's Firestore document and check the `isAdmin` field.
- After publishing these rules you can promote a user by editing their user document in the Firestore console and setting `isAdmin: true`.

### Setting custom claims (optional)

If you prefer the original rules that check `request.auth.token.isAdmin`, set the custom claim on the user account using the Firebase Admin SDK. Example (run on a trusted environment):

```javascript
// set-admin-claim.js (run with Node.js using service account)
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.cert(require('./serviceAccountKey.json')) });

async function setAdmin(uid) {
  await admin.auth().setCustomUserClaims(uid, { isAdmin: true });
  console.log('Custom claim set for', uid);
}

setAdmin(process.argv[2]).catch(console.error);
```

Run:

```bash
node set-admin-claim.js <USER_UID>
```

After setting the custom claim, the user must sign out and sign back in for the new token to take effect.

### Alternative for `products` write permission

If your current rules restrict writes to `products` using `request.auth.token.isAdmin`, admins promoted via the `users` document will still be blocked. Add the following rule (or merge its logic into your existing `products` match) to allow users whose Firestore `users/{uid}.isAdmin` field is `true` to write products:

```javascript
match /products/{productId} {
  allow read: if true;
  allow create, update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}
```

This mirrors the `orders` alternative and lets you manage admin permissions from the Firestore Console by toggling `isAdmin` on the user's document.


### Step 3: Publish the Rules

1. Click **Publish** button
2. Click **Publish** again in the confirmation dialog
3. Wait for the deployment to complete (usually 30 seconds)

---

## Verification

### Check if Rules are Working

1. **Login to your app** as a customer (non-admin)
2. **Add products to cart**
3. **Proceed to checkout** and select an address
4. **Try to place an order**
5. The order should now be created successfully

### If Still Getting Permission Error

Check the browser console (F12 → Console) for detailed error message. Common issues:

**Issue 1: User not authenticated**
- Make sure you're logged in
- Check localStorage: `localStorage.getItem('rvCurrentUser')`
- Should show your user data

**Issue 2: No addresses saved**
- Go to "My Addresses" page
- Add at least one delivery address
- Try checkout again

**Issue 3: Empty cart**
- Add products to cart first
- Make sure cart isn't empty

---

## What These Rules Allow

✅ **Any user can:**
- View all products
- Create reviews for products
- Create orders (once logged in)
- View their own orders

✅ **Admin users can:**
- Create, edit, delete products
- Manage all orders
- Manage all reviews

❌ **Users cannot:**
- Modify other users' orders
- Delete their own orders
- Modify products (except admin)

---

## Need Help?

If you still see the permission error:

1. **Check Firestore Rules Status**
   - Go to Firestore → Rules tab
   - Verify rules are published (green status)
   
2. **Check User Authentication**
   - Make sure you logged in correctly
   - Phone: 10 digits only
   - Password: minimum 6 characters

3. **Check Database Structure**
   - Go to Firestore → Data tab
   - You should see collections: products, users, orders, reviews
   - If missing, they'll be created automatically on first use

4. **Clear Browser Cache**
   - Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Clear all cache and cookies
   - Reload the page
   - Try again

---

## Emergency: Reset to Test Rules

If you want to test without any restrictions temporarily (NOT recommended for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **DO NOT use this in production!** This allows anyone to read/write any data.

Once everything is working, go back to the proper security rules above.
