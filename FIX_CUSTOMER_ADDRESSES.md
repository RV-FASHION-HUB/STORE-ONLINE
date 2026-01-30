# Fix: Customer Addresses Not Saving

## Problem
Customers have to enter their address every time during checkout. Addresses aren't persisting after they refresh the page.

## Root Cause
Addresses were only saved to browser localStorage, not to Firestore database. When the browser cache clears or user logs out, the addresses are lost.

---

## Solution

The code has been updated to automatically save addresses to Firestore when customers add them.

### What's Fixed

1. **Address save on checkout** (`saveAddress()`)
   - Now saves to Firestore `users/{userId}` document
   - Falls back to localStorage if Firestore fails

2. **Address management page** (`saveAddressManagement()`)
   - Now saves edits to Firestore
   - Updates persist across sessions

3. **Address deletion** (`deleteAddress()`)
   - Now deletes from both localStorage and Firestore
   - Changes are permanent

4. **Address loading on login** (already working)
   - When customer logs in, addresses are loaded from Firestore
   - Addresses are available immediately

### Firestore Rules

Ensure your Firestore rules allow customers to save their addresses. The rules should have:

```javascript
match /users/{userId} {
  allow create: if request.auth != null;
  allow read: if request.auth != null && (request.auth.uid == userId || ...);
  allow write: if request.auth != null && (request.auth.uid == userId || ...);
}
```

This allows each user to read and write their own user document (which includes the `addresses` object).

---

## How It Works Now

### Customer Workflow

1. **Customer logs in**
   - System loads user data from Firestore
   - Addresses are populated from the `addresses` field

2. **Customer adds address**
   - Address is saved to localStorage immediately (for instant UI response)
   - Address is also saved to Firestore `users/{uid}.addresses`
   - If Firestore save fails, address is still available locally

3. **Customer logs out and logs back in**
   - Addresses are restored from Firestore
   - No need to re-enter them

4. **Customer refreshes page (while logged in)**
   - Addresses remain available because they're in localStorage
   - On next login, Firestore addresses are restored

---

## Testing

### Test 1: Add Address & Refresh
1. Log in as customer
2. Go to Checkout
3. Add a new address
4. **Refresh the page** (F5)
5. ✅ Address should still be there

### Test 2: Add Address, Logout, Login
1. Log in as customer
2. Go to My Addresses or Checkout
3. Add a new address
4. **Sign out** (click account → logout)
5. **Sign back in**
6. ✅ Address should still be there

### Test 3: Edit Address
1. Go to Account → Addresses
2. Click "Edit" on an address
3. Change some details
4. Save changes
5. **Refresh the page**
6. ✅ Changes should persist

### Test 4: Delete Address
1. Go to Account → Addresses
2. Click "Delete" on an address
3. Confirm deletion
4. **Sign out and sign back in**
5. ✅ Address should be gone

---

## Checking Browser Console

While testing, open Browser Console (F12) to see debug messages:

```
✅ Address saved to Firestore
✅ Address deleted from Firestore
⚠️ Address saved locally but Firestore sync failed: ...
```

The `✅` messages confirm the Firestore sync is working.
The `⚠️` messages indicate local saves succeeded but Firestore had issues (addresses still work, just not persisted to database).

---

## Backend Data Structure

Addresses are stored in the Firestore `users` collection as:

```javascript
{
  uid: "...",
  name: "Customer Name",
  phoneNumber: "1234567890",
  addresses: {
    "1234567890": {  // timestamp as ID
      name: "Home",
      phone: "1234567890",
      addressLine1: "123 Main St",
      addressLine2: "Apt 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    "1234567891": {
      name: "Office",
      // ... more fields
    }
  },
  isAdmin: false,
  createdAt: "2024-01-30T..."
}
```

---

## If Addresses Still Not Saving

Check these:

1. **Browser Console (F12)**
   - Look for error messages
   - Common: `Permission denied` → Check Firestore rules

2. **Firestore Rules Published**
   - Go to Firebase Console → Firestore → Rules
   - Verify rules are published (green status)
   - Verify the `users/{userId}` match block allows `write`

3. **User Document Exists**
   - Go to Firebase Console → Firestore → Data
   - Navigate to `users` collection
   - Find your user UID
   - Verify the document exists
   - You should see an `addresses` object after saving

4. **Clear Cache**
   - Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Clear all cache and cookies
   - Reload and try again

---

## Troubleshooting Console Commands

Run these in Browser Console (F12) while logged in as a customer:

```javascript
// Check what's in localStorage
console.log('Local User:', JSON.parse(localStorage.getItem('rvCurrentUser')));

// Check addresses
const user = JSON.parse(localStorage.getItem('rvCurrentUser'));
console.log('Addresses:', user.addresses);

// Reload from Firestore
const result = await (await import('./assets/js/auth.js')).AuthManager.loginCustomer('1234567890', 'password123');
console.log('Reloaded from Firestore:', result);
```

---

## For Developers

If you need to manually sync addresses from localStorage to Firestore, use:

```javascript
import { db } from './firebase-config.js';
import { doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

async function syncAddressesToFirestore(userId, addresses) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { addresses });
    console.log('✅ Addresses synced to Firestore');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}
```
