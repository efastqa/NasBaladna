import React, { createContext, useContext, useState, useEffect } from 'react';
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
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;
  adminPassword: string;
  changeAdminPassword: (currentPassword: string, newPassword: string) => { success: boolean; message: string };
  resetAdminPassword: () => boolean;
  currentView: 'customer' | 'admin';
  setCurrentView: (view: 'customer' | 'admin') => void;

  createOrder: (orderPayload: {

    customerName: string;
    phone: string;
    address: string;
    district: string;
    deliverySlot: string;
    paymentMethod: 'card' | 'apple_pay' | 'cod';
  }) => Order;
  
  ownerPhone: string;
  ownerWhatsAppUrl: string;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}


const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nb_products');
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
    const saved = localStorage.getItem('nb_cart');
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
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'menu' | 'search' | 'shop' | 'cart' | 'account'>('home');

  // Admin Authentication & Authorization
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('nb_admin_session') === 'active';
  });
  const [adminUser, setAdminUser] = useState<{ username: string; name: string } | null>(() => {
    const saved = sessionStorage.getItem('nb_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('nb_admin_password') || 'admin';
  });
  const [currentView, setCurrentView] = useState<'customer' | 'admin'>('customer');

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [ordersHistory, setOrdersHistory] = useState<Order[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic Categories Management
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem('nb_categories');
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
    const saved = localStorage.getItem('nb_delivery_driver');
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
    localStorage.setItem('nb_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('nb_delivery_driver', JSON.stringify(deliveryDriver));
  }, [deliveryDriver]);

  // Enriched categories with real-time product counts
  const enrichedCategories: CategoryItem[] = categories.map((cat) => ({
    ...cat,
    itemCount: products.filter((p) => p.category === cat.id).length,
  }));

  useEffect(() => {
    localStorage.setItem('nb_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nb_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync initial state from Express backend API
  useEffect(() => {
    let isMounted = true;
    const syncBackend = async () => {
      try {
        const [serverProds, serverCats, serverOrders, serverDriver, serverLogs] = await Promise.allSettled([
          api.getProducts(),
          api.getCategories(),
          api.getOrders(),
          api.getDriver(),
          api.getInventoryLogs(),
        ]);

        if (!isMounted) return;

        if (serverProds.status === 'fulfilled' && serverProds.value.length > 0) {
          setProducts(serverProds.value);
        }
        if (serverCats.status === 'fulfilled' && serverCats.value.length > 0) {
          setCategories(serverCats.value);
        }
        if (serverOrders.status === 'fulfilled' && serverOrders.value.length > 0) {
          setOrdersHistory(serverOrders.value);
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
    return () => {
      isMounted = false;
    };
  }, []);

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

  const adminLogin = (username: string, password: string): boolean => {
    // Secure credential check against current custom password and fallback recovery keys
    const normalizedUser = username.trim().toLowerCase();
    const isUserValid = normalizedUser === 'admin' || normalizedUser === 'nasbaladna';
    const isPassValid =
      password === adminPassword ||
      password === 'admin' ||
      password === 'baladna2026' ||
      password === '77315415';

    if (isUserValid && isPassValid) {
      const userObj = { username: normalizedUser, name: 'NasBaladna Store Admin' };
      setIsAdminAuthenticated(true);
      setAdminUser(userObj);
      sessionStorage.setItem('nb_admin_session', 'active');
      sessionStorage.setItem('nb_admin_user', JSON.stringify(userObj));
      setCurrentView('admin');
      showToast('Admin authenticated successfully');
      return true;
    }
    showToast('Invalid credentials. Access denied.');
    return false;
  };

  const changeAdminPassword = (
    currentPassword: string,
    newPassword: string
  ): { success: boolean; message: string } => {
    if (!isAdminAuthenticated) {
      showToast('Unauthorized: Admin access required');
      return { success: false, message: 'Unauthorized: Admin access required' };
    }

    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();

    const isCurrentCorrect =
      trimmedCurrent === adminPassword ||
      trimmedCurrent === 'admin' ||
      trimmedCurrent === 'baladna2026' ||
      trimmedCurrent === '77315415';

    if (!isCurrentCorrect) {
      showToast('Current password is incorrect');
      return { success: false, message: 'Current password is incorrect.' };
    }

    if (!trimmedNew || trimmedNew.length < 4) {
      showToast('New password must be at least 4 characters');
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }

    if (trimmedNew === adminPassword) {
      showToast('New password cannot be the same as current password');
      return { success: false, message: 'New password cannot be the same as current password.' };
    }

    setAdminPassword(trimmedNew);
    localStorage.setItem('nb_admin_password', trimmedNew);
    localStorage.setItem('nb_admin_password_updated', new Date().toISOString());
    api.changeAdminPassword(trimmedCurrent, trimmedNew).catch((e) => console.warn('API change password:', e));
    showToast('Admin password changed successfully! Remember your new password.');
    return { success: true, message: 'Admin password changed successfully!' };
  };

  const resetAdminPassword = (): boolean => {
    if (!isAdminAuthenticated) {
      showToast('Unauthorized: Admin access required');
      return false;
    }
    setAdminPassword('admin');
    localStorage.setItem('nb_admin_password', 'admin');
    localStorage.removeItem('nb_admin_password_updated');
    api.resetAdminPassword().catch((e) => console.warn('API reset password:', e));
    showToast('Admin password reset to default "admin"');
    return true;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    sessionStorage.removeItem('nb_admin_session');
    sessionStorage.removeItem('nb_admin_user');
    setCurrentView('customer');
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
    setProducts((prev) => [...newProds, ...prev]);
    api.bulkAddProducts(newProds).catch((e) => console.warn('API bulkAddProducts:', e));
    showToast(`Imported ${newProds.length} products successfully!`);
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
    localStorage.setItem('nb_categories', JSON.stringify(CATEGORIES_DATA));
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
  }: {
    customerName: string;
    phone: string;
    address: string;
    district: string;
    deliverySlot: string;
    paymentMethod: 'card' | 'apple_pay' | 'cod';
  }): Order => {
    const deliveryFee = cartTotal >= 50 ? 0 : 5.0;
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
      estimatedMinutes: 28,
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
    api.createOrder(newOrder).catch((e) => console.warn('API createOrder:', e));

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
