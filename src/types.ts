export type CategoryType =
  | 'all'
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'bakery'
  | 'herbs'
  | 'juices'
  | 'near_expiry'
  | (string & {});

export interface CategoryItem {
  id: string;
  name: string;
  image: string;
  bgColor: string;
  borderColor: string;
  itemCount: number;
  badge?: string;
  description?: string;
}

export interface DeliveryDriverConfig {
  name: string;
  phone: string; // WhatsApp and voice phone number
  vehicle: string; // e.g. Temperature-Controlled Reefer Van
  plateNumber: string; // e.g. QA-58219
  rating: number;
  status: 'active' | 'on_delivery' | 'off_duty';
  dispatchWhatsApp: string;
  notes?: string;
}

export type CurrencyType = 'QAR' | 'AED' | 'SAR' | 'USD';

export interface WeightOption {
  weight: string; // e.g. "200g", "500g", "750g", "1kg", "2kg"
  multiplier: number; // multiplier for base price
  label?: string;
}

export interface Product {
  id: string;
  name: string;
  scientificName?: string;
  category: CategoryType;
  brand: string;
  sku: string;
  basePrice: number; // Price in QAR for base weight (usually 200g or 500g)
  originalPrice?: number; // Pre-discount price for Near Expiry or sale items
  discountPercent?: number; // e.g. 40, 50 (%)
  expiryDate?: string; // e.g. "Expires in 2 days", "Best Before Oct 10"
  isNearExpiry?: boolean; // Flag for near-expiry zero waste clearance
  baseWeight: string; // "200g"
  weightOptions: WeightOption[];
  stock: number; // Real-time available units
  image: string;
  thumbnails?: string[];
  description: string;
  origin: string;
  farm: string;
  organic: boolean;
  benefits: string[];
  nutrition?: {
    calories: string;
    vitaminC: string;
    fiber: string;
    waterContent: string;
  };
  storageAdvice: string;
  wholesalePrice?: number; // Special price per bulk crate for business customers
  wholesaleUnit?: string; // e.g. "5kg Crate", "10kg Box"
  isWholesaleEligible?: boolean;
}

export type CustomerTier = 'retail' | 'business';

export interface CartItem {
  id: string; // unique cart line id (productId + weight)
  productId: string;
  product: Product;
  selectedWeight: string;
  pricePerUnit: number;
  quantity: number;
}

export type OrderStatus = 'confirmed' | 'packing' | 'on_the_way' | 'delivered';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: CurrencyType;
  customerName: string;
  phone: string;
  address: string;
  district: string;
  deliverySlot: string;
  paymentMethod: 'card' | 'apple_pay' | 'cod';
  paymentStatus: 'paid' | 'pending';
  estimatedMinutes: number;
  courier: {
    name: string;
    phone: string;
    vehicle: string;
    plateNumber: string;
    rating: number;
  };
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  change: number;
  newStock: number;
  reason: 'customer_order' | 'restock' | 'manual_audit';
  timestamp: string;
}
