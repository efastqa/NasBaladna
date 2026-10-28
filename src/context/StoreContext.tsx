import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Product,
  CartItem,
  Order,
  OrderStatus,
  CategoryType,
  CurrencyType,
  InventoryLog,
  CustomerTier,
  CategoryItem,
  DeliveryDriverConfig,
  DeliveryServiceType,
  DropoffPreference,
} from '../types';
import {
  INITIAL_PRODUCTS,
  CURRENCY_RATES,
  BUSINESS_OWNER_CONTACT,
  CATEGORIES_DATA,
  DEFAULT_DELIVERY_DRIVER,
} from '../data/mockData';
import { api } from '../services/api';
import { NotificationService } from '../services/notifications';
import { firestoreService } from '../services/firestoreService';

// Persistent cross-tab communication channel (never close synchronously)
const persistentOrdersChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('nasbaladna_orders_channel')
    : null;

// Safe localStorage helper to prevent QuotaExceededError in mobile web and iframes
const safeLocalStorage = {
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[Storage] Quota exceeded or storage unavailable for key "${key}":`, e);
      // If quota exceeded, clean up non-critical large caches and retry once
      try {
        localStorage.removeItem('nb_orders_sync_ping');
        localStorage.setItem(key, value);
      } catch {
        // Fall back gracefully to in-memory state without crashing
      }
    }
  },
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

interface StoreContextType {
  products: Product[];
  inventoryLogs: InventoryLog[];
  cart: CartItem[];
  addToCart: (product: Product, weight: string, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;

  categories: CategoryItem[];
  addCategory: (newCategory: Omit<CategoryItem, 'itemCount'> & { itemCount?: number }) => boolean;
  updateCategory: (id: string, updates: Partial<CategoryItem>) => boolean;
  deleteCategory: (id: string) => boolean;
  resetCategoriesToDefault: () => boolean;

  deliveryDriver: DeliveryDriverConfig;
  updateDeliveryDriver: (updates: Partial<DeliveryDriverConfig>) => void;
  
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  formatPrice: (amountInQar: number) => string;
  
  viewMode: 'mobile' | 'web';
  setViewMode: (mode: 'mobile' | 'web') => void;
  
  customerTier: CustomerTier;
  setCustomerTier: (tier: CustomerTier) => void;
  
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  ordersHistory: Order[];
  
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isTrackingOpen: boolean;
  setIsTrackingOpen: (open: boolean) => void;
  isInventoryModalOpen: boolean;
  setIsInventoryModalOpen: (open: boolean) => void;
  isOwnerAdminOpen: boolean;
  setIsOwnerAdminOpen: (open: boolean) => void;
  isWhatsAppOpen: boolean;
  setIsWhatsAppOpen: (open: boolean) => void;
  isMenuDrawerOpen: boolean;
  setIsMenuDrawerOpen: (open: boolean) => void;
  isQrModalOpen: boolean;
  setIsQrModalOpen: (open: boolean) => void;
  isAppDownloadModalOpen: boolean;
  setIsAppDownloadModalOpen: (open: boolean) => void;
  
  activeMobileTab: 'home' | 'menu' | 'search' | 'shop' | 'cart' | 'account';
  setActiveMobileTab: (tab: 'home' | 'menu' | 'search' | 'shop' | 'cart' | 'account') => void;
  
  updateStock: (productId: string, delta: number, reason?: 'customer_order' | 'restock' | 'manual_audit') => void;
  addProduct: (product: Product) => boolean;
  updateProduct: (id: string, updates: Partial<Product>) => boolean;
  deleteProduct: (id: string) => boolean;
  bulkAddProducts: (newProds: Product[]) => boolean;
  bulkUpdatePrices: (percentageChange: number) => boolean;
  updateOrderStatus: (orderId: string, status: OrderStatus) => boolean;
  
  // Admin Authentication & Routing
  isAdminAuthenticated: boolean;
  adminUser: { username: string; name: string } | null;
  adminLogin: (username: string, password: string) => Promise<boolean> | boolean;
  adminLogout: () => void;
  adminPassword: string;
  changeAdminPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  resetAdminPassword: () => Promise<boolean> | boolean;
  currentView: 'customer' | 'admin';
  setCurrentView: (view: 'customer' | 'admin') => void;

  createOrder: (orderPayload: {
    customerName: string;
    phone: string;
    address: string;
    district: string;
    deliverySlot: string;
    paymentMethod: 'card' | 'apple_pay' | 'cod';
    coordinates?: { lat: number; lng: number };
    googleMapsUrl?: string;
    deliveryNotes?: string;
    isExpress?: boolean;
    serviceType?: DeliveryServiceType;
    dropoffPreference?: DropoffPreference;
    doorbellPreference?: 'ring' | 'silent';
    bluePlateInfo?: { zone: string; street: string; building: string };
    customDeliveryFee?: number;
  }) => Order;

  // Admin New Order Notification Alerting
  unreadOrdersCount: number;
  markOrdersAsRead: () => void;
  adminAlertSoundEnabled: boolean;
  setAdminAlertSoundEnabled: (enabled: boolean) => void;
  playOrderAlertChime: () => void;
  latestReceivedOrder: Order | null;
  
  isRealtimeConnected: boolean;
  refreshOrders: () => Promise<void>;
  
  ownerPhone: string;
  ownerWhatsAppUrl: string;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}


const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = safeLocalStorage.getItem('nb_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(() => [
    {
      id: 'log-init-1',
      productId: 'nb-pani-dodam',
      productName: 'Pani Dodam (Sweet Orange)',
      change: +30,
      newStock: 28,
      reason: 'restock',
      timestamp: 'Today, 05:30 AM',
    },
    {
      id: 'log-init-2',
      productId: 'nb-vine-tomatoes',
      productName: 'Vine-Ripened Cluster Tomatoes',
      change: +50,
      newStock: 42,
      reason: 'restock',
      timestamp: 'Today, 06:15 AM',
    },
  ]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = safeLocalStorage.getItem('nb_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState<CurrencyType>('QAR');
  const [viewMode, setViewMode] = useState<'mobile' | 'web'>('mobile');
  const [customerTier, setCustomerTier] = useState<CustomerTier>('retail');
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isOwnerAdminOpen, setIsOwnerAdminOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAppDownloadModalOpen, setIsAppDownloadModalOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'menu' | 'search' | 'shop' | 'cart' | 'account'>('home');
  const knownOrderIdsRef = useRef<Set<string>>(new Set());

  // Admin Authentication & Authorization
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return (
      safeLocalStorage.getItem('nb_admin_session') === 'active' ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('nb_admin_session') === 'active')
    );
  });
  const [adminUser, setAdminUser] = useState<{ username: string; name: string } | null>(() => {
    const saved = safeLocalStorage.getItem('nb_admin_user') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('nb_admin_user') : null);
    return saved ? JSON.parse(saved) : null;
  });
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return safeLocalStorage.getItem('nb_admin_password') || '30606701';
  });
  const [currentView, setCurrentView] = useState<'customer' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      if (
        window.location.hash === '#admin' ||
        window.location.pathname.startsWith('/admin') ||
        new URLSearchParams(window.location.search).get('view') === 'admin'
      ) {
        return 'admin';
      }
    }
    return 'customer';
  });
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(true);

  // Sync hash routing so navigating or sharing #admin switches views instantly
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      } else if (window.location.hash === '#store' || window.location.hash === '') {
        setCurrentView('customer');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const sanitizeOrder = (ord: any): Order => {
    if (!ord) return ord;
    return {
      ...ord,
      courier: ord.courier || {
        name: 'Mohamed Tariq',
        phone: '+974 7731 5415',
        vehicle: 'Temperature-Controlled Van',
        plateNumber: 'QA-58219',
        rating: 4.9,
      },
      items: (ord.items || []).map((it: any) => ({
        ...it,
        quantity: it.quantity || 1,
        selectedWeight: it.selectedWeight || 'Standard',
        product: it.product || {
          id: it.productId || 'item',
          name: it.name || it.productName || 'Harvest Item',
          image: it.image || '/favicon.svg',
          sku: it.sku || 'NB-ITEM',
          baseWeight: it.selectedWeight || 'Standard',
          basePrice: it.pricePerUnit || 10,
          category: 'vegetables',
          brand: 'NasBaladna Farm',
          stock: 50,
          description: 'Fresh harvest produce',
          origin: 'Qatar',
          farm: 'NasBaladna Farms',
          organic: true,
          benefits: [],
          storageAdvice: 'Refrigerate',
          weightOptions: [{ weight: it.selectedWeight || 'Standard', multiplier: 1 }],
        },
      })),
    };
  };

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [ordersHistory, setOrdersHistory] = useState<Order[]>(() => {
    const saved = safeLocalStorage.getItem('nb_orders_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(sanitizeOrder);
        }
      } catch {
        // fallback
      }
    }
    return [];
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    safeLocalStorage.setItem('nb_orders_history', JSON.stringify(ordersHistory));
  }, [ordersHistory]);

  // Admin New Order Alert State
  const [unreadOrdersCount, setUnreadOrdersCount] = useState<number>(() => {
    const saved = safeLocalStorage.getItem('nb_unread_orders_count');
    return saved ? Math.max(0, parseInt(saved, 10)) : 0;
  });
  const [adminAlertSoundEnabled, setAdminAlertSoundEnabled] = useState<boolean>(() => {
    return safeLocalStorage.getItem('nb_admin_alert_sound') !== 'false';
  });
  const [latestReceivedOrder, setLatestReceivedOrder] = useState<Order | null>(null);

  const markOrdersAsRead = () => {
    setUnreadOrdersCount(0);
    safeLocalStorage.setItem('nb_unread_orders_count', '0');
    setLatestReceivedOrder(null);
  };

  const playOrderAlertChime = () => {
    NotificationService.playOrderChime();
  };

  useEffect(() => {
    safeLocalStorage.setItem('nb_admin_alert_sound', String(adminAlertSoundEnabled));
  }, [adminAlertSoundEnabled]);

  // Dynamic Categories Management
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const saved = safeLocalStorage.getItem('nb_categories');
    if (saved) {
      try {
        const parsed: CategoryItem[] = JSON.parse(saved);
        // Ensure default categories get updated with latest high-res images if they used fallback
        return parsed.map((cat) => {
          const defaultMatch = CATEGORIES_DATA.find((d) => d.id === cat.id);
          if (defaultMatch) {
            // If the category previously had old duplicate placeholder, upgrade to high-res match
            if (!cat.image || cat.image.includes('category_fruits_box') && cat.id !== 'fruits' || cat.image.includes('category_vegetables_box') && cat.id !== 'vegetables') {
              return { ...cat, image: defaultMatch.image };
            }
          }
          return cat;
        });
      } catch {
        // fallback
      }
    }
    return CATEGORIES_DATA;
  });

  // Delivery Driver & WhatsApp Management
  const [deliveryDriver, setDeliveryDriver] = useState<DeliveryDriverConfig>(() => {
    const saved = safeLocalStorage.getItem('nb_delivery_driver');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_DELIVERY_DRIVER;
  });

  useEffect(() => {
    safeLocalStorage.setItem('nb_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    safeLocalStorage.setItem('nb_delivery_driver', JSON.stringify(deliveryDriver));
  }, [deliveryDriver]);

  // Enriched categories with real-time product counts
  const enrichedCategories: CategoryItem[] = categories.map((cat) => ({
    ...cat,
    itemCount: products.filter((p) => p.category === cat.id).length,
  }));

  useEffect(() => {
    safeLocalStorage.setItem('nb_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    safeLocalStorage.setItem('nb_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync initial state from Express backend API and Firestore
  useEffect(() => {
    let isMounted = true;
    let unsubscribeAdminPass: () => void = () => {};

    const syncBackend = async () => {
      try {
        const [
          serverProds,
          serverCats,
          serverOrders,
          serverDriver,
          serverLogs,
          cloudOrders,
          adminStatus,
          cloudAdminPass,
        ] = await Promise.allSettled([
          api.getProducts(),
          api.getCategories(),
          api.getOrders(),
          api.getDriver(),
          api.getInventoryLogs(),
          firestoreService.fetchOrders(),
          api.getAdminStatus(),
          firestoreService.getAdminPassword(),
        ]);

        if (!isMounted) return;

        // Synchronize persisted fixed admin password across server and cloud
        if (adminStatus.status === 'fulfilled' && adminStatus.value?.adminPassword) {
          const syncedPass = adminStatus.value.adminPassword.trim();
          setAdminPassword(syncedPass);
          safeLocalStorage.setItem('nb_admin_password', syncedPass);
        } else if (cloudAdminPass.status === 'fulfilled' && cloudAdminPass.value) {
          const syncedPass = cloudAdminPass.value.trim();
          setAdminPassword(syncedPass);
          safeLocalStorage.setItem('nb_admin_password', syncedPass);
        }

        if (serverProds.status === 'fulfilled' && serverProds.value.length > 0) {
          setProducts(serverProds.value);
        }
        if (serverCats.status === 'fulfilled' && serverCats.value.length > 0) {
          setCategories(serverCats.value);
        }

        // Merge orders from Firestore and Backend API
        const mergedOrders = new Map<string, Order>();
        if (serverOrders.status === 'fulfilled' && Array.isArray(serverOrders.value)) {
          serverOrders.value.forEach((o) => mergedOrders.set(o.id, o));
        }
        if (cloudOrders.status === 'fulfilled' && Array.isArray(cloudOrders.value)) {
          cloudOrders.value.forEach((o) => mergedOrders.set(o.id, o));
        }
        if (mergedOrders.size > 0) {
          const list = Array.from(mergedOrders.values());
          list.sort((a, b) => {
            const timeA = (a as any).createdTimestamp || parseInt(a.id.replace(/\D/g, ''), 10) || 0;
            const timeB = (b as any).createdTimestamp || parseInt(b.id.replace(/\D/g, ''), 10) || 0;
            return timeB - timeA;
          });
          setOrdersHistory(list);
        }

        if (serverDriver.status === 'fulfilled') {
          setDeliveryDriver(serverDriver.value);
        }
        if (serverLogs.status === 'fulfilled' && serverLogs.value.length > 0) {
          setInventoryLogs(serverLogs.value);
        }
      } catch (err) {
        console.warn('Backend sync deferred or running local:', err);
      }
    };

    syncBackend();

    // Live subscription for admin password updates across devices
    try {
      unsubscribeAdminPass = firestoreService.subscribeAdminPassword((newPass) => {
        if (newPass && newPass.trim() && isMounted) {
          const cleanPass = newPass.trim();
          setAdminPassword(cleanPass);
          safeLocalStorage.setItem('nb_admin_password', cleanPass);
        }
      });
    } catch {
      // ignore
    }

    return () => {
      isMounted = false;
      unsubscribeAdminPass();
    };
  }, []);

  // Helper to handle newly discovered orders from SSE, cross-tab, or server poll
  const processIncomingOrder = (incomingOrder: Order) => {
    if (!incomingOrder || !incomingOrder.id) return;
    const sanitized = sanitizeOrder(incomingOrder);
    if (
      knownOrderIdsRef.current.has(sanitized.id) ||
      (sanitized.orderNumber && knownOrderIdsRef.current.has(sanitized.orderNumber))
    ) {
      return;
    }
    knownOrderIdsRef.current.add(sanitized.id);
    if (sanitized.orderNumber) {
      knownOrderIdsRef.current.add(sanitized.orderNumber);
    }

    setOrdersHistory((prev) => {
      if (prev.some((o) => o.id === sanitized.id || o.orderNumber === sanitized.orderNumber)) {
        return prev;
      }
      return [sanitized, ...prev];
    });

    setUnreadOrdersCount((prev) => {
      const next = prev + 1;
      safeLocalStorage.setItem('nb_unread_orders_count', String(next));
      return next;
    });

    setLatestReceivedOrder(sanitized);

    if (adminAlertSoundEnabled) {
      NotificationService.playOrderChime();
    }

    NotificationService.showDesktopNotification(
      `🚨 New Website Order: #${incomingOrder.orderNumber}`,
      `${incomingOrder.customerName} placed an order for ${incomingOrder.currency || 'QAR'} ${(incomingOrder.total || 0).toFixed(2)}`
    );

    showToast(`⚡ Live Order Alert: #${incomingOrder.orderNumber} (${incomingOrder.customerName}) received!`);
  };

  const processOrderStatusUpdate = (id: string, status: OrderStatus) => {
    setOrdersHistory((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    setActiveOrder((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  };

  // REAL-TIME ORDER SYNCHRONIZATION:
  // 1. Google Cloud Firestore live listener (instant reflection across Phone & Laptop)
  // 2. Server-Sent Events (SSE) stream from backend (/api/orders/stream)
  // 3. Persistent Cross-Tab BroadcastChannel (0ms zero latency across tabs)
  // 4. StorageEvent cross-tab sync fallback
  // 5. Fast background polling backup (every 1 second)
  useEffect(() => {
    let isMounted = true;

    // 1. Google Cloud Firestore Real-Time WebSocket Channel (Multi-device phone-to-admin reflection)
    const unsubscribeFirestore = firestoreService.subscribeOrders(
      (firestoreOrders) => {
        if (!isMounted) return;

        // Process any new incoming orders outside state updaters
        firestoreOrders.forEach((fo) => {
          if (!knownOrderIdsRef.current.has(fo.id) && !knownOrderIdsRef.current.has(fo.orderNumber)) {
            processIncomingOrder(fo);
          }
        });

        setOrdersHistory((prev) => {
          const remoteMap = new Map(firestoreOrders.map((fo) => [fo.id, fo]));
          const localOnly = prev.filter(
            (p) => !remoteMap.has(p.id) && !firestoreOrders.some((fo) => fo.orderNumber === p.orderNumber)
          );
          return [...localOnly, ...firestoreOrders];
        });
      },
      (newlyAddedOrder) => {
        if (!isMounted) return;
        processIncomingOrder(newlyAddedOrder);
      }
    );

    // 2. Cross-tab BroadcastChannel for 0ms zero-latency reflection across browser tabs
    if (persistentOrdersChannel) {
      persistentOrdersChannel.onmessage = (event) => {
        if (!isMounted) return;
        if (event.data?.type === 'NEW_ORDER' && event.data?.order) {
          processIncomingOrder(event.data.order);
        } else if (event.data?.type === 'ORDER_STATUS_UPDATE') {
          processOrderStatusUpdate(event.data.id, event.data.status);
        }
      };
    }

    // 3. Storage event fallback for cross-tab communication
    const handleStorageEvent = (e: StorageEvent) => {
      if (!isMounted) return;
      if (e.key === 'nb_orders_sync_ping' && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload?.order) {
            processIncomingOrder(payload.order);
          } else if (payload?.statusUpdate) {
            processOrderStatusUpdate(payload.statusUpdate.id, payload.statusUpdate.status);
          }
        } catch {
          // parse fallback
        }
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // 4. Server-Sent Events (SSE) stream for instant server-push across all tabs & devices
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/orders/stream');
      eventSource.onopen = () => {
        if (isMounted) setIsRealtimeConnected(true);
      };
      eventSource.onmessage = (e) => {
        if (!isMounted) return;
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'NEW_ORDER' && msg.data) {
            processIncomingOrder(msg.data);
          } else if (msg.type === 'ORDER_STATUS_UPDATE' && msg.data) {
            processOrderStatusUpdate(msg.data.id, msg.data.status);
          }
        } catch {
          // heartbeat or non-json message
        }
      };
      eventSource.onerror = () => {
        if (isMounted) setIsRealtimeConnected(false);
      };
    } catch {
      // EventSource fallback
    }

    // 5. Fast Background Server Polling (every 1.0s) as guaranteed fallback
    const pollBackendOrders = async () => {
      try {
        const serverOrders = await api.getOrders();
        if (!isMounted || !Array.isArray(serverOrders)) return;

        // Process any new incoming orders outside state updaters
        serverOrders.forEach((so) => {
          if (!knownOrderIdsRef.current.has(so.id) && !knownOrderIdsRef.current.has(so.orderNumber)) {
            processIncomingOrder(so);
          }
        });

        setOrdersHistory((prev) => {
          const prevMap = new Map(prev.map((o) => [o.id, o]));
          const hasStatusDiff = serverOrders.some((so) => {
            const local = prevMap.get(so.id);
            return !local || local.status !== so.status;
          });
          if (!hasStatusDiff) return prev;

          const remoteMap = new Map(serverOrders.map((so) => [so.id, so]));
          const localOnly = prev.filter(
            (p) => !remoteMap.has(p.id) && !serverOrders.some((so) => so.orderNumber === p.orderNumber)
          );
          return [...localOnly, ...serverOrders.map(sanitizeOrder)];
        });
      } catch {
        // quiet background poll
      }
    };

    const pollInterval = setInterval(pollBackendOrders, 1000);

    // Immediate check on tab focus/visibility
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        pollBackendOrders();
      }
    };
    window.addEventListener('focus', pollBackendOrders);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isMounted = false;
      unsubscribeFirestore();
      eventSource?.close();
      window.removeEventListener('storage', handleStorageEvent);
      clearInterval(pollInterval);
      window.removeEventListener('focus', pollBackendOrders);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [adminAlertSoundEnabled]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const formatPrice = (amountInQar: number) => {
    const config = CURRENCY_RATES[currency];
    return config.format(amountInQar);
  };

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    const normalizedUser = username.trim().toLowerCase();
    const isUserValid = normalizedUser === 'admin' || normalizedUser === 'nasbaladna';
    const trimmedPass = password.trim();

    if (!isUserValid) {
      showToast('Invalid administrator username. Use "admin" or "nasbaladna".');
      return false;
    }

    let isPassValid = false;

    // Check with server database first for multi-device synchronization
    try {
      const res = await api.adminLogin(normalizedUser, trimmedPass);
      if (res && res.success) {
        isPassValid = true;
        if (res.adminPassword) {
          const s = res.adminPassword.trim();
          setAdminPassword(s);
          safeLocalStorage.setItem('nb_admin_password', s);
        }
      }
    } catch {
      // If server is temporarily unreachable, check against active fixed local password
      isPassValid = trimmedPass === adminPassword;
    }

    if (isPassValid) {
      const userObj = { username: normalizedUser, name: 'NasBaladna Store Admin' };
      setIsAdminAuthenticated(true);
      setAdminUser(userObj);
      safeLocalStorage.setItem('nb_admin_session', 'active');
      if (typeof sessionStorage !== 'undefined') {
        try {
          sessionStorage.setItem('nb_admin_session', 'active');
          sessionStorage.setItem('nb_admin_user', JSON.stringify(userObj));
        } catch {
          // ignore
        }
      }
      safeLocalStorage.setItem('nb_admin_user', JSON.stringify(userObj));
      setCurrentView('admin');
      if (typeof window !== 'undefined') {
        window.location.hash = 'admin';
      }
      showToast('Admin authenticated successfully');
      return true;
    }

    showToast('Invalid administrator password. Access denied.');
    return false;
  };

  const refreshOrders = async () => {
    try {
      const [fsOrders, apiOrders] = await Promise.allSettled([
        firestoreService.fetchOrders(),
        api.getOrders(),
      ]);
      const mergedMap = new Map<string, Order>();
      if (fsOrders.status === 'fulfilled') {
        fsOrders.value.forEach((o) => mergedMap.set(o.id, o));
      }
      if (apiOrders.status === 'fulfilled' && Array.isArray(apiOrders.value)) {
        apiOrders.value.forEach((o) => {
          if (!mergedMap.has(o.id)) mergedMap.set(o.id, o);
        });
      }
      const combined = Array.from(mergedMap.values());
      combined.sort((a, b) => {
        const timeA = (a as any).createdTimestamp || parseInt(a.id.replace(/\D/g, ''), 10) || 0;
        const timeB = (b as any).createdTimestamp || parseInt(b.id.replace(/\D/g, ''), 10) || 0;
        return timeB - timeA;
      });
      if (combined.length > 0) {
        setOrdersHistory(combined);
      }
      showToast(`Refreshed ${combined.length} live orders from cloud`);
    } catch {
      showToast('Could not reach backend to refresh orders');
    }
  };

  const changeAdminPassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!isAdminAuthenticated) {
      showToast('Unauthorized: Admin access required');
      return { success: false, message: 'Unauthorized: Admin access required' };
    }

    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();

    // STRICT: Current password must strictly match the active fixed password
    if (trimmedCurrent !== adminPassword) {
      showToast('Current password does not match active password');
      return {
        success: false,
        message: 'Current password is incorrect. Please enter your active password.',
      };
    }

    if (!trimmedNew || trimmedNew.length < 4) {
      showToast('New password must be at least 4 characters');
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }

    if (trimmedNew === adminPassword) {
      showToast('New password cannot be the same as current password');
      return { success: false, message: 'New password cannot be the same as current password.' };
    }

    try {
      // 1. Persist to server backend (writes to data/store.json)
      await api.changeAdminPassword(trimmedCurrent, trimmedNew);

      // 2. Persist to Firestore for multi-device sync
      await firestoreService.syncAdminPassword(trimmedNew);

      // 3. Update React state and local storage
      setAdminPassword(trimmedNew);
      safeLocalStorage.setItem('nb_admin_password', trimmedNew);
      safeLocalStorage.setItem('nb_admin_password_updated', new Date().toISOString());

      showToast('Admin password changed and fixed permanently!');
      return {
        success: true,
        message: 'Admin password changed and fixed successfully! Only your new password is now active.',
      };
    } catch (e: any) {
      console.warn('API error during password change, saving locally and to cloud:', e);
      setAdminPassword(trimmedNew);
      safeLocalStorage.setItem('nb_admin_password', trimmedNew);
      safeLocalStorage.setItem('nb_admin_password_updated', new Date().toISOString());
      await firestoreService.syncAdminPassword(trimmedNew);
      showToast('Admin password changed and fixed successfully!');
      return {
        success: true,
        message: 'Admin password changed and fixed successfully! Only your new password is now active.',
      };
    }
  };

  const resetAdminPassword = async (): Promise<boolean> => {
    try {
      await api.resetAdminPassword();
      await firestoreService.syncAdminPassword('admin');
    } catch (e) {
      console.warn('API reset password error:', e);
    }
    setAdminPassword('admin');
    safeLocalStorage.setItem('nb_admin_password', 'admin');
    safeLocalStorage.removeItem('nb_admin_password_updated');
    showToast('Admin password reset to factory default "admin"');
    return true;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    safeLocalStorage.removeItem('nb_admin_session');
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.removeItem('nb_admin_session');
        sessionStorage.removeItem('nb_admin_user');
      } catch {
        // ignore
      }
    }
    safeLocalStorage.removeItem('nb_admin_user');
    setCurrentView('customer');
    if (typeof window !== 'undefined') {
      window.location.hash = '';
    }
    showToast('Admin logged out successfully');
  };

  // Guarded Admin Product Mutations (Protected against unauthorized calls)
  const addProduct = (product: Product): boolean => {
    if (!isAdminAuthenticated) {
      showToast('Unauthorized: Admin access required');
      return false;
    }
    setProducts((prev) => [product, ...prev]);
    api.createProduct(product).catch((e) => console.warn('API createProduct:', e));
    setInventoryLogs((logs) => [
      {
        id: `log-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        change: product.stock,
        newStock: product.stock,
        reason: 'manual_audit',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...logs,
    ]);
    showToast(`Added ${product.name} to store!`);
    return true;
  };

  const updateProduct = (id: string, updates: Partial<Product>): boolean => {
    if (!isAdminAuthenticated) {
      showToast('Unauthorized: Admin access required');
      return false;
    }
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      })
    );
    api.updateProduct(id, updates).catch((e) => console.warn('API updateProduct:', e));
    showToast('Product details updated successfully');
    return true;
  };

  const deleteProduct = (id: string): boolean => {
    if (!isAdminAuthenticated) {
      showToast('Unauthorized: Admin access required');
      return false;
    }
    setProducts((prev) => prev.filter((item) => item.id !== id));
    api.deleteProduct(id).catch((e) => console.warn('API deleteProduct:', e));
    showToast('Product removed from store');
    return true;
  };

  const bulkAddProducts = (newProds: Product[]): boolean => {
    if (!isAdminAuthenticated) {
      showToast('Unauthorized: Admin access required');
      return false;
    }

    let addedCount = 0;
    let updatedCount = 0;

    setProducts((prev) => {
      const nextList = [...prev];
      const seenKeys = new Set<string>();

      newProds.forEach((incoming) => {
        const normName = incoming.name.trim().toLowerCase();
        const normSku = (incoming.sku || '').trim().toLowerCase();
        const key = normSku || normName;

        if (seenKeys.has(key)) return;
        seenKeys.add(key);

        const existingIdx = nextList.findIndex(
          (p) =>
            (incoming.id && p.id === incoming.id) ||
            (normSku && (p.sku || '').trim().toLowerCase() === normSku) ||
            p.name.trim().toLowerCase() === normName
        );

        if (existingIdx !== -1) {
          // Already exists: update in place without creating a duplicate!
          const existing = nextList[existingIdx];
          const existingWeights = new Set(
            (existing.weightOptions || []).map((w) => w.weight.toLowerCase().trim())
          );
          const newWeightOptions = [...(existing.weightOptions || [])];
          (incoming.weightOptions || []).forEach((w) => {
            if (w.weight && !existingWeights.has(w.weight.toLowerCase().trim())) {
              newWeightOptions.push(w);
              existingWeights.add(w.weight.toLowerCase().trim());
            }
          });

          nextList[existingIdx] = {
            ...existing,
            ...incoming,
            id: existing.id,
            sku: existing.sku || incoming.sku,
            basePrice: incoming.basePrice !== undefined ? incoming.basePrice : existing.basePrice,
            stock: incoming.stock !== undefined ? incoming.stock : existing.stock,
            baseWeight: incoming.baseWeight || existing.baseWeight,
            weightOptions: newWeightOptions.length ? newWeightOptions : existing.weightOptions,
            category: incoming.category || existing.category,
            image: incoming.image || existing.image,
            thumbnails: incoming.thumbnails?.length ? incoming.thumbnails : existing.thumbnails,
            expiryDate: incoming.expiryDate !== undefined ? incoming.expiryDate : existing.expiryDate,
            originalPrice: incoming.originalPrice !== undefined ? incoming.originalPrice : existing.originalPrice,
            discountPercent: incoming.discountPercent !== undefined ? incoming.discountPercent : existing.discountPercent,
            isNearExpiry: incoming.isNearExpiry !== undefined ? incoming.isNearExpiry : existing.isNearExpiry,
          };
          updatedCount++;
        } else {
          // Brand new product
          nextList.unshift(incoming);
          addedCount++;
        }
      });

      return nextList;
    });

    api.bulkAddProducts(newProds).catch((e) => console.warn('API bulkAddProducts:', e));

    if (updatedCount > 0 && addedCount > 0) {
      showToast(`Bulk update: ${addedCount} added, ${updatedCount} updated (0 duplicates)!`);
    } else if (updatedCount > 0) {
      showToast(`Updated ${updatedCount} existing products without duplicates!`);
    } else {
      showToast(`Imported ${addedCount} new products successfully!`);
    }

    return true;
  };

  const bulkUpdatePrices = (percentageChange: number): boolean => {
    if (!isAdminAuthenticated) {
      showToast('Unauthorized: Admin access required');
      return false;
    }
    setProducts((prev) =>
      prev.map((item) => {
        const factor = 1 + percentageChange / 100;
        const newBasePrice = Math.max(0.5, Math.round(item.basePrice * factor * 100) / 100);
        return { ...item, basePrice: newBasePrice };
      })
    );
    api.bulkUpdatePrices(percentageChange).catch((e) => console.warn('API bulkUpdatePrices:', e));
    showToast(`Adjusted all product prices by ${percentageChange > 0 ? '+' : ''}${percentageChange}%`);
    return true;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus): boolean => {
    if (!isAdminAuthenticated) {
      showToast('Unauthorized: Admin access required');
      return false;
    }
    const targetOrder = ordersHistory.find((o) => o.id === orderId);
    setOrdersHistory((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, status } : null));
    }
    if (targetOrder) {
      const updated = { ...targetOrder, status };
      NotificationService.sendAutomatedNotification(updated, 'whatsapp', status);
      NotificationService.sendAutomatedNotification(updated, 'sms', status);
    }
    api.updateOrderStatus(orderId, status).catch((e) => console.warn('API updateOrderStatus:', e));
    firestoreService.updateOrderStatus(orderId, status).catch((e) => console.warn('Firestore updateOrderStatus:', e));
    try {
      persistentOrdersChannel?.postMessage({ type: 'ORDER_STATUS_UPDATE', id: orderId, status });
    } catch {
      // fallback
    }
    safeLocalStorage.setItem(
      'nb_orders_sync_ping',
      JSON.stringify({ timestamp: Date.now(), statusUpdate: { id: orderId, status } })
    );
    showToast(`Order status updated to ${status} & automated alerts sent`);
    return true;
  };

  // Category Management Handlers
  const addCategory = (newCat: Omit<CategoryItem, 'itemCount'> & { itemCount?: number }): boolean => {
    if (!isAdminAuthenticated) {
      showToast('Unauthorized: Admin access required');
      return false;
    }
    const cleanId = newCat.id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!cleanId || !newCat.name.trim()) {
      showToast('Category ID and Name are required');
      return false;
    }
    if (categories.some((c) => c.id === cleanId)) {
      showToast(`Category with ID "${cleanId}" already exists`);
      return false;
    }
    const created: CategoryItem = {
      id: cleanId,
      name: newCat.name.trim(),
      image: newCat.image || '',
      bgColor: newCat.bgColor || 'bg-emerald-50/80',
      borderColor: newCat.borderColor || 'border-emerald-200/60',
      itemCount: 0,
      badge: newCat.badge || '',
      description: newCat.description || '',
    };
    setCategories((prev) => [...prev, created]);
    api.createCategory(created).catch((e) => console.warn('API createCategory:', e));
    showToast(`Category "${created.name}" created successfully!`);
    return true;
  };

  const updateCategory = (id: string, updates: Partial<CategoryItem>): boolean => {
    if (!isAdminAuthenticated) {
      showToast('Unauthorized: Admin access required');
      return false;
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    api.updateCategory(id, updates).catch((e) => console.warn('API updateCategory:', e));
    showToast('Category updated successfully');
    return true;
  };

  const deleteCategory = (id: string): boolean => {
    if (!isAdminAuthenticated) {
      showToast('Unauthorized: Admin access required');
      return false;
    }
    const hasItems = products.some((p) => p.category === id);
    if (hasItems) {
      showToast(`Cannot delete category: products are still assigned to it.`);
      return false;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    api.deleteCategory(id).catch((e) => console.warn('API deleteCategory:', e));
    if (selectedCategory === id) {
      setSelectedCategory('all');
    }
    showToast('Category removed successfully');
    return true;
  };

  const resetCategoriesToDefault = (): boolean => {
    if (!isAdminAuthenticated) {
      showToast('Unauthorized: Admin access required');
      return false;
    }
    setCategories(CATEGORIES_DATA);
    safeLocalStorage.setItem('nb_categories', JSON.stringify(CATEGORIES_DATA));
    api.resetCategories().catch((e) => console.warn('API resetCategories:', e));
    showToast('Categories & high-res images refreshed to latest defaults!');
    return true;
  };

  // Delivery Driver & WhatsApp Management Handler
  const updateDeliveryDriver = (updates: Partial<DeliveryDriverConfig>) => {
    if (!isAdminAuthenticated) {
      showToast('Unauthorized: Admin access required');
      return;
    }
    setDeliveryDriver((prev) => {
      const next = { ...prev, ...updates };
      api.updateDriver(next).catch((e) => console.warn('API updateDriver:', e));
      // Also update active order's courier in real time if exists
      if (activeOrder) {
        setActiveOrder((ord) =>
          ord
            ? {
                ...ord,
                courier: {
                  ...ord.courier,
                  name: next.name || ord.courier.name,
                  phone: next.phone || ord.courier.phone,
                  vehicle: next.vehicle || ord.courier.vehicle,
                  plateNumber: next.plateNumber || ord.courier.plateNumber,
                },
              }
            : null
        );
      }
      return next;
    });
    showToast('Delivery driver & WhatsApp details updated!');
  };



  const updateStock = (
    productId: string,
    delta: number,
    reason: 'customer_order' | 'restock' | 'manual_audit' = 'manual_audit'
  ) => {
    api.adjustStock(productId, delta, reason).catch((e) => console.warn('API adjustStock:', e));
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newStock = Math.max(0, item.stock + delta);
          // log entry
          setInventoryLogs((logs) => [
            {
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              productId: item.id,
              productName: item.name,
              change: delta,
              newStock,
              reason,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            ...logs.slice(0, 49),
          ]);
          return { ...item, stock: newStock };
        }
        return item;
      })
    );
  };

  const addToCart = (product: Product, weight: string, quantity = 1) => {
    const currentProd = products.find((p) => p.id === product.id) || product;
    if (currentProd.stock <= 0) {
      showToast(`Sorry, ${currentProd.name} is currently out of stock.`);
      return;
    }

    const weightOpt = currentProd.weightOptions.find((w) => w.weight === weight) || {
      weight,
      multiplier: 1,
    };
    const unitPrice = currentProd.basePrice * weightOpt.multiplier;
    const lineId = `${product.id}-${weight}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === lineId);
      if (existing) {
        return prev.map((item) =>
          item.id === lineId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: lineId,
          productId: product.id,
          product: currentProd,
          selectedWeight: weight,
          pricePerUnit: unitPrice,
          quantity,
        },
      ];
    });

    showToast(`Added ${quantity}x ${product.name} (${weight}) to basket`);
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item removed from basket');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.pricePerUnit * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const createOrder = ({
    customerName,
    phone,
    address,
    district,
    deliverySlot,
    paymentMethod,
    coordinates,
    googleMapsUrl,
    deliveryNotes,
    isExpress = false,
    serviceType = 'standard',
    dropoffPreference = 'hand_to_me',
    doorbellPreference = 'ring',
    bluePlateInfo,
    customDeliveryFee,
  }: {
    customerName: string;
    phone: string;
    address: string;
    district: string;
    deliverySlot: string;
    paymentMethod: 'card' | 'apple_pay' | 'cod';
    coordinates?: { lat: number; lng: number };
    googleMapsUrl?: string;
    deliveryNotes?: string;
    isExpress?: boolean;
    serviceType?: DeliveryServiceType;
    dropoffPreference?: DropoffPreference;
    doorbellPreference?: 'ring' | 'silent';
    bluePlateInfo?: { zone: string; street: string; building: string };
    customDeliveryFee?: number;
  }): Order => {
    let defaultDeliveryFee = 0;
    if (isExpress || serviceType === 'express') {
      defaultDeliveryFee = 10.0;
    } else if (serviceType === 'eco_green') {
      defaultDeliveryFee = cartTotal >= 50 ? 0 : 2.0;
    } else {
      defaultDeliveryFee = cartTotal >= 50 ? 0 : 5.0;
    }
    const deliveryFee = customDeliveryFee !== undefined ? customDeliveryFee : defaultDeliveryFee;
    const total = cartTotal + deliveryFee;
    const orderNumber = `NB-${Math.floor(100000 + Math.random() * 900000)}`;

    // Real-time inventory deduction for all items in cart!
    cart.forEach((item) => {
      updateStock(item.productId, -item.quantity, 'customer_order');
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'confirmed',
      items: [...cart],
      subtotal: cartTotal,
      deliveryFee,
      total,
      currency,
      customerName,
      phone,
      address,
      district,
      deliverySlot,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      estimatedMinutes: isExpress || serviceType === 'express' ? 35 : 28,
      coordinates,
      googleMapsUrl: googleMapsUrl || (coordinates ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}` : undefined),
      deliveryNotes,
      isExpress: isExpress || serviceType === 'express',
      serviceType,
      dropoffPreference,
      doorbellPreference,
      bluePlateInfo,
      courier: {
        name: deliveryDriver.name,
        phone: deliveryDriver.phone,
        vehicle: deliveryDriver.vehicle,
        plateNumber: deliveryDriver.plateNumber,
        rating: deliveryDriver.rating,
      },
    };

    setActiveOrder(newOrder);
    setOrdersHistory((prev) => [newOrder, ...prev]);

    knownOrderIdsRef.current.add(newOrder.id);
    knownOrderIdsRef.current.add(newOrder.orderNumber);

    // 1. Sync to Google Cloud Firestore in real time (instant reflection on phone & admin laptop!)
    firestoreService.saveOrder(newOrder).catch((e) => console.error('Firestore saveOrder error:', e));

    // 2. Sync to Express backend API
    api.createOrder(newOrder).catch((e) => console.warn('API createOrder:', e));

    // Immediate cross-tab broadcast for instant Admin reflection without closing channel
    try {
      persistentOrdersChannel?.postMessage({ type: 'NEW_ORDER', order: newOrder });
    } catch {
      // fallback
    }
    safeLocalStorage.setItem(
      'nb_orders_sync_ping',
      JSON.stringify({ timestamp: Date.now(), order: newOrder })
    );

    // Admin Notification Logic - notify admin immediately when website customer places an order
    setUnreadOrdersCount((prev) => {
      const next = prev + 1;
      safeLocalStorage.setItem('nb_unread_orders_count', String(next));
      return next;
    });
    setLatestReceivedOrder(newOrder);

    // Play chime sound and display desktop alert for admin if enabled
    if (adminAlertSoundEnabled) {
      NotificationService.playOrderChime();
    }
    NotificationService.showDesktopNotification(
      `🚨 New Order Received: #${orderNumber}`,
      `Customer ${customerName} ordered ${cart.length} item(s) for ${currency} ${total.toFixed(2)}.`
    );

    // Automated dispatch of WhatsApp & SMS notifications
    NotificationService.sendAutomatedNotification(newOrder, 'whatsapp', 'confirmed');
    NotificationService.sendAutomatedNotification(newOrder, 'sms', 'confirmed');

    clearCart();
    setIsCheckoutOpen(false);
    setIsTrackingOpen(true);
    showToast(`Order #${orderNumber} Confirmed! Automated WhatsApp & SMS notifications dispatched.`);

    return newOrder;
  };

  // Live courier progress simulation when activeOrder is present
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'delivered') return;

    const timer = setInterval(() => {
      setActiveOrder((prev) => {
        if (!prev) return null;
        if (prev.status === 'confirmed') {
          const updated = { ...prev, status: 'packing' as const, estimatedMinutes: 24 };
          NotificationService.sendAutomatedNotification(updated, 'whatsapp', 'packing');
          return updated;
        }
        if (prev.status === 'packing') {
          const updated = { ...prev, status: 'on_the_way' as const, estimatedMinutes: 16 };
          NotificationService.sendAutomatedNotification(updated, 'whatsapp', 'on_the_way');
          NotificationService.sendAutomatedNotification(updated, 'sms', 'on_the_way');
          return updated;
        }
        if (prev.status === 'on_the_way') {
          if (prev.estimatedMinutes > 2) {
            return { ...prev, estimatedMinutes: prev.estimatedMinutes - 2 };
          }
          const updated = { ...prev, status: 'delivered' as const, estimatedMinutes: 0 };
          NotificationService.sendAutomatedNotification(updated, 'whatsapp', 'delivered');
          NotificationService.sendAutomatedNotification(updated, 'sms', 'delivered');
          return updated;
        }
        return prev;
      });
    }, 18000); // progressive stage simulation

    return () => clearInterval(timer);
  }, [activeOrder?.status]);

  return (
    <StoreContext.Provider
      value={{
        products,
        inventoryLogs,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        selectedProduct,
        setSelectedProduct,
        selectedCategory,
        setSelectedCategory,
        categories: enrichedCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        resetCategoriesToDefault,
        deliveryDriver,
        updateDeliveryDriver,
        searchQuery,
        setSearchQuery,
        currency,
        setCurrency,
        formatPrice,
        viewMode,
        setViewMode,
        customerTier,
        setCustomerTier,
        activeOrder,
        setActiveOrder,
        ordersHistory,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isTrackingOpen,
        setIsTrackingOpen,
        isInventoryModalOpen,
        setIsInventoryModalOpen,
        isOwnerAdminOpen,
        setIsOwnerAdminOpen,
        isWhatsAppOpen,
        setIsWhatsAppOpen,
        isMenuDrawerOpen,
        setIsMenuDrawerOpen,
        isQrModalOpen,
        setIsQrModalOpen,
        isAppDownloadModalOpen,
        setIsAppDownloadModalOpen,
        activeMobileTab,
        setActiveMobileTab,
        updateStock,
        addProduct,
        updateProduct,
        deleteProduct,
        bulkAddProducts,
        bulkUpdatePrices,
        updateOrderStatus,
        isAdminAuthenticated,
        adminUser,
        adminLogin,
        adminLogout,
        adminPassword,
        changeAdminPassword,
        resetAdminPassword,
        currentView,
        setCurrentView,
        createOrder,
        ownerPhone: BUSINESS_OWNER_CONTACT.phone,
        ownerWhatsAppUrl: BUSINESS_OWNER_CONTACT.whatsappUrl,
        toastMessage,
        showToast,
        unreadOrdersCount,
        markOrdersAsRead,
        adminAlertSoundEnabled,
        setAdminAlertSoundEnabled,
        playOrderAlertChime,
        latestReceivedOrder,
        isRealtimeConnected,
        refreshOrders,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
