// Customer Authentication Module
import { auth, db } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, setDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export class AuthManager {
  static currentUser = null;

  // Generate custom email from phone number
  static generateEmail(phoneNumber) {
    return `${phoneNumber}@rvfashion.local`;
  }

  // Register Customer
  static async registerCustomer(phoneNumber, password, name) {
    try {
      const email = this.generateEmail(phoneNumber);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Store user data in Firestore
      await setDoc(doc(db, 'users', uid), {
        phoneNumber: phoneNumber,
        name: name,
        email: email,
        uid: uid,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        addresses: []
      });

      this.currentUser = {
        uid: uid,
        phoneNumber: phoneNumber,
        name: name
      };

      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  // Login Customer
  static async loginCustomer(phoneNumber, password) {
    try {
      const email = this.generateEmail(phoneNumber);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        this.currentUser = userDoc.data();
        return { success: true, user: this.currentUser };
      }

      return { success: false, error: 'User data not found' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  // Logout
  static async logout() {
    try {
      await signOut(auth);
      this.currentUser = null;
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user from local storage
  static getCurrentUser() {
    const stored = localStorage.getItem('rvCurrentUser');
    return stored ? JSON.parse(stored) : null;
  }

  // Set current user to local storage
  static setCurrentUser(user) {
    if (user) {
      localStorage.setItem('rvCurrentUser', JSON.stringify(user));
      this.currentUser = user;
    } else {
      localStorage.removeItem('rvCurrentUser');
      this.currentUser = null;
    }
  }
}
