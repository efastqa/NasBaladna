import {
  Product,
  CategoryItem,
  Order,
  OrderStatus,
  InventoryLog,
  DeliveryDriverConfig,
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Health
  checkHealth: async () => {
    return request<{ status: string; uptime: number; timestamp: string }>('/health');
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    return request<Product[]>('/products');
  },

  createProduct: async (product: Product): Promise<Product> => {
    return request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    return request<Product>(`/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteProduct: async (id: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  bulkAddProducts: async (products: Product[]): Promise<Product[]> => {
    return request<Product[]>('/products/bulk', {
      method: 'POST',
      body: JSON.stringify({ products }),
    });
  },

  bulkUpdatePrices: async (percentageChange: number): Promise<Product[]> => {
    return request<Product[]>('/products/bulk-price', {
      method: 'POST',
      body: JSON.stringify({ percentageChange }),
    });
  },

  adjustStock: async (
    id: string,
    delta: number,
    reason: 'customer_order' | 'restock' | 'manual_audit'
  ): Promise<{ product: Product; log: InventoryLog }> => {
    return request<{ product: Product; log: InventoryLog }>(
      `/products/${encodeURIComponent(id)}/stock`,
      {
        method: 'POST',
        body: JSON.stringify({ delta, reason }),
      }
    );
  },

  // Categories
  getCategories: async (): Promise<CategoryItem[]> => {
    return request<CategoryItem[]>('/categories');
  },

  createCategory: async (category: CategoryItem): Promise<CategoryItem> => {
    return request<CategoryItem>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  updateCategory: async (id: string, updates: Partial<CategoryItem>): Promise<CategoryItem> => {
    return request<CategoryItem>(`/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteCategory: async (id: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  resetCategories: async (): Promise<CategoryItem[]> => {
    return request<CategoryItem[]>('/categories/reset', {
      method: 'POST',
    });
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    return request<Order[]>('/orders');
  },

  createOrder: async (order: Order): Promise<Order> => {
    return request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
    return request<Order>(`/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Inventory logs
  getInventoryLogs: async (): Promise<InventoryLog[]> => {
    return request<InventoryLog[]>('/inventory/logs');
  },

  // Delivery Driver
  getDriver: async (): Promise<DeliveryDriverConfig> => {
    return request<DeliveryDriverConfig>('/driver');
  },

  updateDriver: async (updates: Partial<DeliveryDriverConfig>): Promise<DeliveryDriverConfig> => {
    return request<DeliveryDriverConfig>('/driver', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Admin Auth & Security
  adminLogin: async (username: string, password: string): Promise<{ success: boolean; user?: any }> => {
    return request<{ success: boolean; user?: any }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  changeAdminPassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>('/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  resetAdminPassword: async (): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>('/admin/reset-password', {
      method: 'POST',
    });
  },

  // Settings
  getSettings: async (): Promise<any> => {
    return request<any>('/settings');
  },

  updateSettings: async (updates: any): Promise<any> => {
    return request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};
