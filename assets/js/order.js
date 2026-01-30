// Order Management Module
import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ProductManager } from './product.js';

export class OrderManager {
  // Create Order
  static async createOrder(customerId, customerData, cartItems, shippingAddress, paymentMode) {
    try {
      console.log('🔵 Creating order for customer:', customerId);
      console.log('📦 Cart items:', cartItems);
      
      const total = cartItems.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
      const originalTotal = cartItems.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);

      // Generate unique orderId
      const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      console.log('📝 Generated Order ID:', orderId);

      const orderData = {
        orderId: orderId,
        customerId: customerId,
        customerName: customerData.name,
        phoneNumber: customerData.phoneNumber,
        shippingAddress: shippingAddress,
        items: cartItems,
        originalTotal: originalTotal,
        discount: originalTotal - total,
        total: total,
        paymentMode: paymentMode,
        status: 'pending',
        trackingNumber: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('💾 Saving order to Firestore:', orderData);
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      console.log('✅ Order saved successfully with Firestore ID:', docRef.id);
      
      // REDUCE STOCK FOR EACH ITEM IN THE ORDER
      console.log('📉 Starting stock reduction for', cartItems.length, 'items');
      for (const item of cartItems) {
        try {
          console.log('  Reducing stock for product:', item.productId, 'size:', item.size.size, 'qty:', item.quantity);
          const productResult = await ProductManager.getProductById(item.productId);
          if (productResult.success) {
            const product = productResult.product;
            const sizeIndex = product.sizes.findIndex(s => s.size === item.size.size);
            
            if (sizeIndex !== -1) {
              // Reduce stock by quantity ordered
              const updateResult = await ProductManager.updateProductStock(item.productId, sizeIndex, -item.quantity);
              if (updateResult.success) {
                console.log(`✅ Stock reduced for product ${item.productId}, size ${item.size.size} by ${item.quantity}`);
              } else {
                console.warn(`⚠️ Failed to reduce stock for product ${item.productId}:`, updateResult.error);
              }
            } else {
              console.warn(`⚠️ Size ${item.size.size} not found in product ${item.productId}`);
            }
          } else {
            console.warn(`⚠️ Product not found:`, item.productId, productResult.error);
          }
        } catch (error) {
          console.error(`❌ Error reducing stock for product ${item.productId}:`, error);
          // Continue with other items even if one fails
        }
      }
      
      console.log('🎉 Order creation complete');
      return { success: true, order: { id: docRef.id, ...orderData } };
    } catch (error) {
      console.error('❌ Error creating order:', error);
      return { success: false, error: error.message };
    }
  }

  // Get Order by ID (supports both Firestore docId and orderId field)
  static async getOrderById(orderId) {
    try {
      // Validate input
      if (!orderId || typeof orderId !== 'string') {
        return { success: false, error: 'Invalid order id' };
      }

      // First try to get by orderId field (the human-readable order ID)
      let docSnap = null;
      
      // Check if it looks like a Firestore ID or orderId
      if (orderId.startsWith('ORD-')) {
        // It's an orderId, search by field
        const q = query(collection(db, 'orders'), where('orderId', '==', orderId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          docSnap = querySnapshot.docs[0];
        }
      } else {
        // It's a Firestore document ID
        docSnap = await getDoc(doc(db, 'orders', orderId));
      }
      
      if (docSnap && docSnap.exists()) {
        return { success: true, order: { id: docSnap.id, ...docSnap.data() } };
      }
      return { success: false, error: 'Order not found' };
    } catch (error) {
      console.error('Error fetching order:', error);
      return { success: false, error: error.message };
    }
  }

  // Get Customer Orders (with real-time updates)
  static subscribeToCustomerOrders(customerId, callback) {
    try {
      const q = query(collection(db, 'orders'), where('customerId', '==', customerId));
      
      // Use onSnapshot for real-time updates
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const orders = [];
        querySnapshot.forEach(doc => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        callback({ success: true, orders: orders });
      }, (error) => {
        console.error('Error listening to customer orders:', error);
        callback({ success: false, error: error.message });
      });
      
      return unsubscribe; // Return unsubscribe function
    } catch (error) {
      console.error('Error setting up listener:', error);
      return null;
    }
  }

  // Get Customer Orders (one-time fetch)
  static async getCustomerOrders(customerId) {
    try {
      const q = query(collection(db, 'orders'), where('customerId', '==', customerId));
      const querySnapshot = await getDocs(q);
      const orders = [];
      querySnapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { success: true, orders: orders };
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return { success: false, error: error.message };
    }
  }

  // Update Order Status
  static async updateOrderStatus(orderId, newStatus) {
    try {
      // Support both human-readable orderId (ORD-...) and Firestore document ID
      if (typeof orderId === 'string' && orderId.startsWith('ORD-')) {
        // It's the public orderId field — find the document by field
        const q = query(collection(db, 'orders'), where('orderId', '==', orderId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          return { success: false, error: 'Order not found' };
        }

        const orderDoc = querySnapshot.docs[0];
        const docId = orderDoc.id;

        await updateDoc(doc(db, 'orders', docId), {
          status: newStatus,
          updatedAt: new Date().toISOString()
        });

        return { success: true };
      } else {
        // Treat as Firestore document ID
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          return { success: false, error: 'Order not found' };
        }

        await updateDoc(docRef, {
          status: newStatus,
          updatedAt: new Date().toISOString()
        });

        return { success: true };
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete Order
  static async deleteOrder(orderId) {
    try {
      // Find the order by searching for the orderId field
      const q = query(collection(db, 'orders'), where('orderId', '==', orderId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { success: false, error: 'Order not found' };
      }
      
      const orderDoc = querySnapshot.docs[0];
      await deleteDoc(doc(db, 'orders', orderDoc.id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting order:', error);
      return { success: false, error: error.message };
    }
  }

  // Get All Orders (Admin)
  static async getAllOrders() {
    try {
      console.log('📋 Fetching all orders from Firestore...');
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const orders = [];
      querySnapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      console.log('✅ Found', orders.length, 'orders in Firestore');
      if (orders.length > 0) {
        console.log('📦 First order:', orders[0]);
      }
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { success: true, orders: orders };
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      return { success: false, error: error.message };
    }
  }

  // Export Orders to CSV
  static async exportOrdersToCSV() {
    try {
      const result = await this.getAllOrders();
      if (!result.success) return result;

      let csv = 'Order ID,Customer Name,Phone,Total Amount,Status,Created Date\n';
      
      result.orders.forEach(order => {
        csv += `"${order.id}","${order.customerName}","${order.phoneNumber}","${order.total}","${order.status}","${new Date(order.createdAt).toLocaleString()}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true };
    } catch (error) {
      console.error('Error exporting orders:', error);
      return { success: false, error: error.message };
    }
  }
}

