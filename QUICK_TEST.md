# ⚡ Quick Test Script

Paste these commands one by one in the browser console (F12) to test:

## Test 1: Check Firebase Connection
```javascript
console.log('🔥 Firebase:', typeof firebase);
console.log('🗄️  Database:', typeof db);
```

## Test 2: Check Current User
```javascript
console.log('👤 Current User:', currentUser);
console.log('📞 Phone:', currentUser?.phoneNumber);
console.log('📧 Email:', currentUser?.email);
```

## Test 3: Check Cart
```javascript
const cart = CartManager.getLocalCart();
console.log('🛒 Cart Items:', cart.length);
console.log('📦 First item:', cart[0]);
```

## Test 4: Test Order Creation (Simulated)
```javascript
// This simulates what happens when you place an order
const testOrder = {
  orderId: 'ORD-' + Date.now() + '-test',
  customerName: currentUser?.name || 'Test User',
  phoneNumber: currentUser?.phoneNumber || '9999999999',
  total: 999,
  status: 'pending',
  createdAt: new Date().toISOString()
};
console.log('📝 Test Order would be:', testOrder);
```

## Test 5: Fetch Orders from Firestore
```javascript
OrderManager.getAllOrders().then(result => {
  console.log('🎯 Result:', result);
  if (result.success) {
    console.log('✅ Orders found:', result.orders.length);
    result.orders.forEach(o => {
      console.log(`  - ${o.orderId}: ${o.customerName} (${o.status})`);
    });
  } else {
    console.log('❌ Error:', result.error);
  }
});
```

## Test 6: Check Firestore Permissions
```javascript
// Try to create a test order directly
const testData = {
  orderId: 'TEST-' + Date.now(),
  customerName: 'Test',
  phoneNumber: '9999999999',
  total: 1,
  status: 'pending',
  customerId: currentUser?.uid,
  shippingAddress: { city: 'Test', state: 'Test' },
  items: [],
  createdAt: new Date().toISOString()
};

const { addDoc, collection } = window.firebase.firestore;
addDoc(collection(db, 'orders'), testData)
  .then(docRef => console.log('✅ Write permission OK, Doc ID:', docRef.id))
  .catch(err => console.log('❌ Write failed:', err.message));
```

## Test 7: Check if "orders" Collection Exists
```javascript
const { getDocs, collection } = window.firebase.firestore;
getDocs(collection(db, 'orders'))
  .then(snap => {
    console.log('📊 Orders collection:');
    console.log('  Total docs:', snap.size);
    snap.forEach(doc => {
      console.log('  -', doc.id, ':', doc.data());
    });
  })
  .catch(err => console.log('❌ Error:', err.message));
```

---

## What to do with Results:

✅ **If all tests pass**: Orders should work!

❌ **If Test 5 returns error about permissions**: 
- Go to Firebase Console → Firestore → Rules
- Make sure you've published the correct rules
- Restart the browser

❌ **If Test 6 fails with permission error**:
- Your Firestore rules are blocking writes
- Copy rules from [FIRESTORE_RULES_SETUP.md](FIRESTORE_RULES_SETUP.md)

❌ **If Test 7 shows 0 orders but you created one**:
- Orders collection might be in different database
- Or order creation failed silently
- Check Test 5 output more carefully
