import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Order, CategoryItem, OrderStatus } from '../types';

// Recursively strip undefined fields so Firestore setDoc never throws Unsupported field value: undefined
function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore) as unknown as T;
  }
  if (typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        res[key] = sanitizeForFirestore(value);
      }
    }
    return res as T;
  }
  return obj;
}

export const firestoreService = {
  // Save or update product in Firestore
  saveProduct: async (product: Product): Promise<void> => {
    try {
      const ref = doc(db, 'products', product.id);
      await setDoc(ref, sanitizeForFirestore(product), { merge: true });
    } catch (e) {
      console.warn('Firestore saveProduct error:', e);
    }
  },

  // Save order in Firestore with timestamp for ordering
  saveOrder: async (order: Order): Promise<void> => {
    try {
      const ref = doc(db, 'orders', order.id);
      const cleanOrder = sanitizeForFirestore({
        ...order,
        createdTimestamp: (order as any).createdTimestamp || Date.now(),
      });
      await setDoc(ref, cleanOrder, { merge: true });
      console.log('✅ Order synced to Firestore:', order.orderNumber);
    } catch (e) {
      console.error('Firestore saveOrder error:', e);
    }
  },

  // Update order status in Firestore in real time
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<void> => {
    try {
      const ref = doc(db, 'orders', orderId);
      await setDoc(ref, { status, updatedAt: new Date().toISOString() }, { merge: true });
      console.log('✅ Order status updated in Firestore:', orderId, status);
    } catch (e) {
      console.warn('Firestore updateOrderStatus error:', e);
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

  // Real-time live listener for orders across all devices worldwide
  subscribeOrders: (
    onOrdersSync: (orders: Order[]) => void,
    onNewOrderReceived?: (order: Order) => void
  ) => {
    try {
      const ordersCol = collection(db, 'orders');
      let isInitialLoad = true;

      return onSnapshot(
        ordersCol,
        (snapshot) => {
          const list: Order[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as Order;
            list.push(data);
          });

          // Sort latest created orders first
          list.sort((a, b) => {
            const timeA = (a as any).createdTimestamp || parseInt(a.id.replace(/\D/g, ''), 10) || 0;
            const timeB = (b as any).createdTimestamp || parseInt(b.id.replace(/\D/g, ''), 10) || 0;
            return timeB - timeA;
          });

          // Trigger alert if newly added order arrived after initial load
          if (!isInitialLoad && onNewOrderReceived) {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const addedOrder = change.doc.data() as Order;
                onNewOrderReceived(addedOrder);
              }
            });
          }
          isInitialLoad = false;

          if (list.length > 0) {
            onOrdersSync(list);
          }
        },
        (error) => {
          console.warn('Firestore orders live subscription error:', error);
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
      list.sort((a, b) => {
        const timeA = (a as any).createdTimestamp || parseInt(a.id.replace(/\D/g, ''), 10) || 0;
        const timeB = (b as any).createdTimestamp || parseInt(b.id.replace(/\D/g, ''), 10) || 0;
        return timeB - timeA;
      });
      return list;
    } catch (e) {
      console.warn('Firestore fetchOrders error:', e);
      return [];
    }
  },

  // Save or sync admin password in Firestore for multi-device persistence
  syncAdminPassword: async (password: string): Promise<void> => {
    try {
      const ref = doc(db, 'system', 'admin_config');
      await setDoc(ref, { adminPassword: password, updatedAt: new Date().toISOString() }, { merge: true });
      console.log('✅ Admin password synced to Firestore');
    } catch (e) {
      console.warn('Firestore syncAdminPassword error:', e);
    }
  },

  getAdminPassword: async (): Promise<string | null> => {
    try {
      const ref = doc(db, 'system', 'admin_config');
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data()?.adminPassword) {
        return snap.data().adminPassword;
      }
      return null;
    } catch (e) {
      console.warn('Firestore getAdminPassword error:', e);
      return null;
    }
  },

  subscribeAdminPassword: (onPasswordUpdate: (password: string) => void) => {
    try {
      const ref = doc(db, 'system', 'admin_config');
      return onSnapshot(
        ref,
        (snap) => {
          if (snap.exists() && snap.data()?.adminPassword) {
            onPasswordUpdate(snap.data().adminPassword);
          }
        },
        (err) => {
          console.warn('Firestore subscribeAdminPassword error:', err);
        }
      );
    } catch (e) {
      console.warn('Firestore subscribeAdminPassword failed:', e);
      return () => {};
    }
  },
};
