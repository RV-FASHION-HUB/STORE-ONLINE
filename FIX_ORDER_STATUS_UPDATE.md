# Fix: Order Status Not Updating in Admin Panel

## Problem
When you try to change order status in the Admin Panel, it stays stuck on "Pending" and doesn't save.

## Root Cause
Firestore security rules don't allow admins to update orders. The rules check if users have `isAdmin: true` in the Firestore `users` collection.

---

## Solution (Pick One)

### Option 1: Update Firestore Rules (Recommended & Easiest)

1. **Go to [Firebase Console](https://console.firebase.google.com)**
2. **Select your project**
3. **Click Firestore Database** (left sidebar)
4. **Click the Rules tab** at the top
5. **Delete all existing rules**
6. **Copy & paste the rules below:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Products - anyone can read; only admins (via users/{uid}.isAdmin) can write
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Orders
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.customerId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
      allow update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Reviews
    match /reviews/{reviewId} {
      allow create: if request.auth != null;
      allow read: if true;
      allow update, delete: if request.auth != null && (
        request.auth.uid == resource.data.customerId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
    }

    // Users
    match /users/{userId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
      allow write: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);

      match /addresses/{addressId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Banners and settings
    match /banners/{doc=**} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    match /settings/{doc=**} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

7. **Click Publish**
8. **Wait 30 seconds** for the rules to deploy

### Ensure Your Admin User is Promoted

1. **Go back to Firestore Console**
2. **Click Data tab**
3. **Open `users` collection**
4. **Find your admin user** (search by phone number)
5. **Click on the user document**
6. **Check the `isAdmin` field** - it should be `true`
7. **If it's `false`, click on it and change to `true`**

### Sign Out & Sign Back In

1. **Refresh your website**
2. **Sign out** (click your account, then logout)
3. **Sign back in** with your admin phone & password
4. **Try updating an order status** - it should now work!

---

### Option 2: Set Custom Auth Claim (For Production)

If you prefer to use custom claims instead of checking the Firestore document:

1. **Place your Firebase service account JSON at:** `scripts/serviceAccountKey.json`
   - Download it from Firebase Console → Project Settings → Service Accounts → Generate key
2. **Run this command:**
   ```bash
   node scripts/set-admin-claim.js <USER_UID>
   ```
   - Replace `<USER_UID>` with the admin user's Firebase UID (from `users` collection)
3. **Have the admin sign out and sign back in**
4. **Update rules** to check `request.auth.token.isAdmin == true` instead of the user document

---

## Verify It's Working

1. **Open Admin Panel**
2. **Go to Orders tab**
3. **Click the Status dropdown** on any order
4. **Change the status** (e.g., pending → confirmed)
5. **You should see:** `✅ Order status updated successfully!`
6. **Check the table** - the status should change immediately
7. **Refresh the page** - the change should persist

---

## Troubleshooting

### Still seeing "Error updating order status"?

1. **Open Browser Console** (F12 → Console tab)
2. **Try changing an order status** again
3. **Look for error message** - it will tell you exactly what's wrong
4. **Common errors:**
   - `"Missing or insufficient permissions"` → Rules not published yet (wait 30s, refresh page)
   - `"Order not found"` → The order document structure doesn't match
   - `"User data not found"` → Your admin user document is missing

### Checking Your Setup

Run these commands in **Browser Console (F12)** while logged in as admin:

```javascript
// Check if you're logged in as admin
console.log('Current User:', JSON.parse(localStorage.getItem('rvCurrentUser')));

// Try to fetch orders
OrderManager.getAllOrders().then(r => console.log('Orders:', r));

// Try to update a test order
OrderManager.updateOrderStatus('ORD-1234-test', 'confirmed').then(r => console.log('Update Result:', r));
```

---

## Still Need Help?

1. **Check Firestore Console → Data tab**
   - Verify you have `users`, `products`, `orders`, `reviews` collections
   - Verify your user document has `isAdmin: true`

2. **Check Firestore Console → Rules tab**
   - Verify rules are published (green checkmark)
   - Verify there are no syntax errors

3. **Clear browser cache:**
   - Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Clear all cache and cookies
   - Reload the website

4. **Sign out completely and sign back in:**
   - Some cached tokens may have old permissions
