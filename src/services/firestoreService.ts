import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Order, CategoryItem } from '../types';

export const firestoreService = {
  // Save or update product in Firestore
  saveProduct: async (product: Product): Promise<void> => {
    try {
      const ref = doc(db, 'products', product.id);
      await setDoc(ref, product, { merge: true });
    } catch (e) {
      console.warn('Firestore saveProduct error:', e);
    }
  },

  // Save order in Firestore
  saveOrder: async (order: Order): Promise<void> => {
    try {
      const ref = doc(db, 'orders', order.id);
      await setDoc(ref, order, { merge: true });
    } catch (e) {
      console.warn('Firestore saveOrder error:', e);
    }
  },

  // Save category in Firestore
  saveCategory: async (category: CategoryItem): Promise<void> => {
    try {
      const ref = doc(db, 'categories', category.id);
      await setDoc(ref, category, { merge: true });
    } catch (e) {
      console.warn('Firestore saveCategory error:', e);
    }
  },

  // Real-time listener for orders
  subscribeOrders: (onUpdate: (orders: Order[]) => void) => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      return onSnapshot(
        q,
        (snapshot) => {
          const list: Order[] = [];
          snapshot.forEach((d) => list.push(d.data() as Order));
          if (list.length > 0) {
            onUpdate(list);
          }
        },
        (error) => {
          console.warn('Firestore orders subscription error:', error);
        }
      );
    } catch (e) {
      console.warn('Firestore subscribeOrders failed:', e);
      return () => {};
    }
  },

  // Load initial orders from Firestore
  fetchOrders: async (): Promise<Order[]> => {
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const list: Order[] = [];
      snapshot.forEach((d) => list.push(d.data() as Order));
      return list;
    } catch (e) {
      console.warn('Firestore fetchOrders error:', e);
      return [];
    }
  },
};
