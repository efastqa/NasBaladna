import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Order, CategoryItem, OrderStatus } from '../types';

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

  // Save order in Firestore with timestamp for ordering
  saveOrder: async (order: Order): Promise<void> => {
    try {
      const ref = doc(db, 'orders', order.id);
      const cleanOrder = {
        ...order,
        createdTimestamp: (order as any).createdTimestamp || Date.now(),
      };
      await setDoc(ref, cleanOrder, { merge: true });
      console.log('✅ Order synced to Firestore:', order.orderNumber);
    } catch (e) {
      console.warn('Firestore saveOrder error:', e);
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
};
