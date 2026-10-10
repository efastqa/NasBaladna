import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Persistent file-backed JSON database
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'store.json');

// Initial Default Categories
const DEFAULT_CATEGORIES = [
  {
    id: 'vegetables',
    name: 'Vegetables',
    image: '/src/assets/images/category_vegetables_box_1791379812745.jpg',
    bgColor: 'bg-emerald-50/80',
    borderColor: 'border-emerald-200/60',
    itemCount: 24,
    badge: 'Farm Fresh',
  },
  {
    id: 'fruits',
    name: 'Fruits',
    image: '/src/assets/images/category_fruits_box_1791379821818.jpg',
    bgColor: 'bg-amber-50/80',
    borderColor: 'border-amber-200/60',
    itemCount: 18,
    badge: 'Sweet & Juicy',
  },
  {
    id: 'dairy',
    name: 'Farm Dairy & Eggs',
    image: '/src/assets/images/category_dairy_milk_1791449247021.jpg',
    bgColor: 'bg-sky-50/80',
    borderColor: 'border-sky-200/60',
    itemCount: 14,
    badge: 'Organic Farm',
  },
  {
    id: 'bakery',
    name: 'Bakery & Grains',
    image: '/src/assets/images/category_bakery_bread_1791449259602.jpg',
    bgColor: 'bg-stone-50/80',
    borderColor: 'border-stone-200/60',
    itemCount: 12,
    badge: 'Oven Fresh',
  },
  {
    id: 'herbs',
    name: 'Herbs & Greens',
    image: '/src/assets/images/category_herbs_greens_1791449272488.jpg',
    bgColor: 'bg-teal-50/80',
    borderColor: 'border-teal-200/60',
    itemCount: 9,
    badge: 'Aromatic Pick',
  },
  {
    id: 'juices',
    name: 'Fresh Juices',
    image: '/src/assets/images/category_juices_cold_1791449285822.jpg',
    bgColor: 'bg-orange-50/80',
    borderColor: 'border-orange-200/60',
    itemCount: 7,
    badge: 'Cold Pressed',
  },
  {
    id: 'near_expiry',
    name: 'Near Expiry Deals',
    image: '/src/assets/images/category_near_expiry_1791446529518.jpg',
    bgColor: 'bg-rose-50/80',
    borderColor: 'border-rose-200/60',
    itemCount: 6,
    badge: 'Save 50%',
  },
];

// Initial Default Products
const DEFAULT_PRODUCTS = [
  {
    id: 'nb-near-avocado',
    name: 'Ripe Hass Avocados (Ready-to-Eat 2-Pack)',
    scientificName: 'Persea americana',
    category: 'near_expiry',
    brand: 'NasBaladna Farm Deals',
    sku: 'NB-EXP-001',
    basePrice: 5.5,
    originalPrice: 12.0,
    discountPercent: 54,
    expiryDate: 'Best today or tomorrow',
    isNearExpiry: true,
    baseWeight: '2-Pack (400g)',
    weightOptions: [
      { weight: '2-Pack (400g)', multiplier: 1, label: 'Pair' },
      { weight: '4-Pack (800g)', multiplier: 1.9, label: 'Family Box' },
    ],
    stock: 12,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format&fit=crop&q=80',
    description: 'Perfect ripeness today! Creamy Hass avocados ready for immediate guacamole or salads.',
    origin: 'Selected Partner Orchards',
    farm: 'NasBaladna Rapid Harvest Program',
    organic: true,
    benefits: ['Ready to eat right away', 'Rich in heart-healthy monounsaturated fats', 'Great value zero waste promotion'],
    storageAdvice: 'Consume within 24 to 48 hours. Keep refrigerated once cut.',
    wholesalePrice: 45.0,
    wholesaleUnit: '10-Pack Crate',
    isWholesaleEligible: true,
  },
  {
    id: 'nb-pani-dodam',
    name: 'Pani Dodam (Heritage Sweet Orange)',
    scientificName: 'Citrus sinensis var. Pani Dodam',
    category: 'fruits',
    brand: 'NasBaladna Heritage Groves',
    sku: 'NB-ORG-001',
    basePrice: 6.5,
    baseWeight: '500g',
    weightOptions: [
      { weight: '500g', multiplier: 1, label: 'Small Pack (~3 pcs)' },
      { weight: '1kg', multiplier: 1.9, label: 'Standard Bag (~6 pcs)' },
      { weight: '2kg', multiplier: 3.6, label: 'Family Box (~12 pcs)' },
    ],
    stock: 28,
    image: '/src/assets/images/product_pani_dodam_orange_1791379905.jpg',
    description: 'Prized for its floral citrus bouquet and low acidity, Pani Dodam is hand-picked at peak ripeness.',
    origin: 'Local Hydroponic Farm - Zone 4',
    farm: 'NasBaladna Al Shamal Agricultural Estate',
    organic: true,
    benefits: ['Immune defense with 85mg bioavailable Vitamin C', 'Naturally low acidity gentler on digestion', 'Zero synthetic pesticide residue guarantee'],
    storageAdvice: 'Store at cool ambient room temperature for up to 4 days, or chill at 4°C to 7°C for up to 14 days.',
    wholesalePrice: 52.0,
    wholesaleUnit: '10kg Wooden Crate',
    isWholesaleEligible: true,
  },
  {
    id: 'nb-vine-tomatoes',
    name: 'Vine-Ripened Cluster Tomatoes',
    scientificName: 'Solanum lycopersicum',
    category: 'vegetables',
    brand: 'NasBaladna Pure Greens',
    sku: 'NB-VEG-002',
    basePrice: 4.75,
    baseWeight: '500g',
    weightOptions: [
      { weight: '500g', multiplier: 1, label: 'Cluster pack (~4 pcs)' },
      { weight: '1kg', multiplier: 1.9, label: 'Carton (~8 pcs)' },
      { weight: '2kg', multiplier: 3.7, label: 'Culinary crate' },
    ],
    stock: 42,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    description: 'Harvested directly on the natural green truss vine, preserving delicate aroma and fresh flavor.',
    origin: 'Al Rayyan Controlled Environment Greenhouses',
    farm: 'NasBaladna EcoCluster Alpha',
    organic: true,
    benefits: ['Rich in lycopene antioxidant', 'Vibrant truss aroma indicates active nutrients', 'Sustainably grown in closed-loop water recycled systems'],
    storageAdvice: 'Store stems attached at room temperature away from direct sunlight.',
    wholesalePrice: 38.0,
    wholesaleUnit: '5kg Truss Box',
    isWholesaleEligible: true,
  },
  {
    id: 'nb-cucumber-mini',
    name: 'Crisp Snack Persian Cucumbers',
    scientificName: 'Cucumis sativus',
    category: 'vegetables',
    brand: 'NasBaladna Crisp Harvest',
    sku: 'NB-VEG-003',
    basePrice: 3.5,
    baseWeight: '500g',
    weightOptions: [
      { weight: '500g', multiplier: 1, label: 'Snack tray' },
      { weight: '1kg', multiplier: 1.9, label: 'Crisper pack' },
      { weight: '2kg', multiplier: 3.6, label: 'Bulk kitchen box' },
    ],
    stock: 35,
    image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=800&auto=format&fit=crop&q=80',
    description: 'Tender-skinned, seedless mini cucumbers with refreshing snap crunch. Grown without bitter compounds.',
    origin: 'Al Khor Valley Greenhouses',
    farm: 'NasBaladna Farmstead #3',
    organic: true,
    benefits: ['96% natural hydration content', 'Digestive enzymes & silica for skin health', 'Zero peeling required tender thin skins'],
    storageAdvice: 'Keep in refrigerator crisper drawer wrapped in moisture-absorbent cotton cloth.',
    wholesalePrice: 28.0,
    wholesaleUnit: '5kg Master Tray',
    isWholesaleEligible: true,
  },
  {
    id: 'nb-strawberries',
    name: 'Sweet Ruby Greenhouse Strawberries',
    scientificName: 'Fragaria × ananassa',
    category: 'fruits',
    brand: 'NasBaladna Sweet Berry',
    sku: 'NB-FRU-004',
    basePrice: 8.5,
    baseWeight: '250g',
    weightOptions: [
      { weight: '250g', multiplier: 1, label: 'Punta punnet' },
      { weight: '500g', multiplier: 1.9, label: 'Double punnet' },
      { weight: '1kg', multiplier: 3.6, label: 'Gourmet flat tray' },
    ],
    stock: 19,
    image: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=800&auto=format&fit=crop&q=80',
    description: 'Intensely fragrant red strawberries grown in vertical climate-calibrated towers.',
    origin: 'Al Wakra Vertical Farming Hub',
    farm: 'NasBaladna Vertical Agro-Tech 1',
    organic: true,
    benefits: ['High polyphenol anthocyanin antioxidants', 'Low glycemic index natural sweetness', 'Hand-picked carefully with stem crowns intact'],
    storageAdvice: 'Refrigerate immediately between 2°C and 4°C. Wash only just before serving.',
    wholesalePrice: 65.0,
    wholesaleUnit: '8-Punnet Master Carton (2kg)',
    isWholesaleEligible: true,
  },
  {
    id: 'nb-wild-rocket',
    name: 'Baby Wild Arugula / Roquette',
    scientificName: 'Eruca vesicaria',
    category: 'herbs',
    brand: 'NasBaladna Herb Masters',
    sku: 'NB-HRB-005',
    basePrice: 2.75,
    baseWeight: '150g',
    weightOptions: [
      { weight: '150g', multiplier: 1, label: 'Breathe-fresh tub' },
      { weight: '300g', multiplier: 1.9, label: 'Double pack' },
      { weight: '500g', multiplier: 3.0, label: 'Chef bag' },
    ],
    stock: 22,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    description: 'Distinctive peppery leaves cut at dawn. Loaded with glucosinolates and minerals.',
    origin: 'Doha Aeroponic Facility',
    farm: 'NasBaladna Pure Greens',
    organic: true,
    benefits: ['Potent glucosinolates supporting liver detox', 'Rich in dietary nitrates and Vitamin K', 'Zero soil residue 100% clean aeroponic harvest'],
    storageAdvice: 'Keep chilled in sealed container with dry paper towel to maintain crispness.',
    wholesalePrice: 22.0,
    wholesaleUnit: '1kg Chef Clamshell',
    isWholesaleEligible: true,
  },
  {
    id: 'nb-farm-milk',
    name: 'Fresh Whole Farm Pasteurized Milk (1L)',
    scientificName: 'Bos taurus',
    category: 'dairy',
    brand: 'NasBaladna Dairy Reserve',
    sku: 'NB-DRY-006',
    basePrice: 7.0,
    baseWeight: '1 Liter',
    weightOptions: [
      { weight: '1 Liter', multiplier: 1, label: 'Glass Bottle' },
      { weight: '2 Liters', multiplier: 1.9, label: 'Twin Pack' },
    ],
    stock: 25,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80',
    description: 'Fresh gently-pasteurized whole cow milk from grass-fed herd. Non-homogenized cream top.',
    origin: 'Al Khor Dairy Farms',
    farm: 'NasBaladna Dairy Estates',
    organic: true,
    benefits: ['Natural calcium & Vitamin D', 'Pure grass-fed nutrition', 'Cream top richness without additives'],
    storageAdvice: 'Keep refrigerated at 1°C - 4°C at all times. Consume within 5 days of opening.',
    wholesalePrice: 60.0,
    wholesaleUnit: '10 x 1L Case',
    isWholesaleEligible: true,
  },
];

const DEFAULT_DRIVER = {
  name: 'Tariq Al-Mansoor',
  phone: '+974 5512 8849',
  vehicle: 'Temperature-Controlled Reefer Van',
  plateNumber: 'QA-58219',
  rating: 4.95,
  status: 'active',
  dispatchWhatsApp: '+97455128849',
  notes: 'Priority Cold-Chain Deliveries across West Bay, The Pearl, and Lusail districts.',
};

const DEFAULT_INVENTORY_LOGS = [
  {
    id: 'log-init-1',
    productId: 'nb-pani-dodam',
    productName: 'Pani Dodam (Sweet Orange)',
    change: 30,
    newStock: 28,
    reason: 'restock',
    timestamp: 'Today, 05:30 AM',
  },
  {
    id: 'log-init-2',
    productId: 'nb-vine-tomatoes',
    productName: 'Vine-Ripened Cluster Tomatoes',
    change: 50,
    newStock: 42,
    reason: 'restock',
    timestamp: 'Today, 06:15 AM',
  },
];

interface DatabaseSchema {
  products: any[];
  categories: any[];
  orders: any[];
  inventoryLogs: any[];
  driver: any;
  adminPasswordHash: string; // Plaintext or hashed password
  settings: {
    ownerPhone: string;
    ownerWhatsApp: string;
    deliveryFee: number;
    freeDeliveryThreshold: number;
    currencyRates: Record<string, number>;
  };
}

// In-Memory DB loaded from file
let db: DatabaseSchema = {
  products: DEFAULT_PRODUCTS,
  categories: DEFAULT_CATEGORIES,
  orders: [],
  inventoryLogs: DEFAULT_INVENTORY_LOGS,
  driver: DEFAULT_DRIVER,
  adminPasswordHash: 'admin',
  settings: {
    ownerPhone: '+974 5512 8849',
    ownerWhatsApp: '+97455128849',
    deliveryFee: 15.0,
    freeDeliveryThreshold: 100.0,
    currencyRates: {
      QAR: 1,
      AED: 1.01,
      SAR: 1.03,
      USD: 0.27,
    },
  },
};

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadDatabase() {
  ensureDataDirectory();
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      db = {
        products: Array.isArray(parsed.products) ? parsed.products : DEFAULT_PRODUCTS,
        categories: Array.isArray(parsed.categories) ? parsed.categories : DEFAULT_CATEGORIES,
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        inventoryLogs: Array.isArray(parsed.inventoryLogs) ? parsed.inventoryLogs : DEFAULT_INVENTORY_LOGS,
        driver: parsed.driver || DEFAULT_DRIVER,
        adminPasswordHash: parsed.adminPasswordHash || 'admin',
        settings: parsed.settings || db.settings,
      };
      console.log('Database loaded successfully from', DB_FILE);
    } catch (err) {
      console.error('Error loading database, using defaults:', err);
    }
  } else {
    saveDatabase();
    console.log('Database initialized with default store data at', DB_FILE);
  }
}

function saveDatabase() {
  try {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

// Initialize database
loadDatabase();

async function startServer() {
  const app = express();

  // Allow larger payloads for photo base64 uploads
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Request logger for API endpoints
  app.use('/api', (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // ===================== API ROUTES =====================

  // Health
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'NasBaladna Farm Store Backend',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      itemCounts: {
        products: db.products.length,
        categories: db.categories.length,
        orders: db.orders.length,
      },
    });
  });

  // PRODUCTS
  app.get('/api/products', (req: Request, res: Response) => {
    res.json(db.products);
  });

  app.post('/api/products', (req: Request, res: Response) => {
    const body = req.body;
    if (!body || !body.name || !body.category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const newProduct = {
      ...body,
      id: body.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      stock: typeof body.stock === 'number' ? body.stock : 20,
      basePrice: Number(body.basePrice) || 5.0,
      weightOptions: body.weightOptions || [
        { weight: body.baseWeight || '500g', multiplier: 1, label: 'Standard' },
      ],
      benefits: body.benefits || ['Farm fresh pick', 'Guaranteed quality'],
      storageAdvice: body.storageAdvice || 'Keep in a cool dry place or refrigerate.',
    };

    db.products.unshift(newProduct);

    // Audit log
    db.inventoryLogs.unshift({
      id: `log-add-${Date.now()}`,
      productId: newProduct.id,
      productName: newProduct.name,
      change: newProduct.stock,
      newStock: newProduct.stock,
      reason: 'restock',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    saveDatabase();
    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const oldProduct = db.products[index];
    const updated = { ...oldProduct, ...req.body };
    db.products[index] = updated;

    if (req.body.stock !== undefined && req.body.stock !== oldProduct.stock) {
      const delta = req.body.stock - oldProduct.stock;
      db.inventoryLogs.unshift({
        id: `log-update-${Date.now()}`,
        productId: updated.id,
        productName: updated.name,
        change: delta,
        newStock: updated.stock,
        reason: 'manual_audit',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    saveDatabase();
    res.json(updated);
  });

  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const initialLen = db.products.length;
    db.products = db.products.filter((p) => p.id !== id);
    if (db.products.length === initialLen) {
      return res.status(404).json({ error: 'Product not found' });
    }
    saveDatabase();
    res.json({ success: true, message: 'Product deleted' });
  });

  app.post('/api/products/bulk', (req: Request, res: Response) => {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Invalid products array' });
    }

    const addedList: any[] = [];
    products.forEach((p) => {
      const newP = {
        ...p,
        id: p.id || `bulk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      addedList.push(newP);
    });

    db.products = [...addedList, ...db.products];
    saveDatabase();
    res.status(201).json(db.products);
  });

  app.post('/api/products/bulk-price', (req: Request, res: Response) => {
    const { percentageChange } = req.body;
    const factor = 1 + Number(percentageChange) / 100;
    if (isNaN(factor) || factor <= 0) {
      return res.status(400).json({ error: 'Invalid percentage change' });
    }

    db.products = db.products.map((p) => ({
      ...p,
      basePrice: Math.max(0.5, Math.round(p.basePrice * factor * 100) / 100),
      wholesalePrice: p.wholesalePrice
        ? Math.max(1, Math.round(p.wholesalePrice * factor * 100) / 100)
        : undefined,
    }));

    saveDatabase();
    res.json(db.products);
  });

  app.post('/api/products/:id/stock', (req: Request, res: Response) => {
    const { id } = req.params;
    const { delta, reason = 'manual_audit' } = req.body;
    const prod = db.products.find((p) => p.id === id);
    if (!prod) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const change = Number(delta) || 0;
    const newStock = Math.max(0, prod.stock + change);
    prod.stock = newStock;

    const log = {
      id: `log-stk-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      change,
      newStock,
      reason,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    db.inventoryLogs.unshift(log);
    saveDatabase();
    res.json({ product: prod, log });
  });

  // CATEGORIES
  app.get('/api/categories', (req: Request, res: Response) => {
    // Enrich item counts dynamically based on current products
    const enriched = db.categories.map((c) => ({
      ...c,
      itemCount:
        c.id === 'near_expiry'
          ? db.products.filter((p) => p.isNearExpiry || p.category === 'near_expiry').length
          : db.products.filter((p) => p.category === c.id).length,
    }));
    res.json(enriched);
  });

  app.post('/api/categories', (req: Request, res: Response) => {
    const { name, id, badge, description, image, bgColor, borderColor } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const computedId = id || name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const existing = db.categories.find((c) => c.id === computedId);
    if (existing) {
      return res.status(409).json({ error: 'A category with this ID already exists' });
    }

    const newCat = {
      id: computedId,
      name,
      badge: badge || 'Farm Harvest',
      description: description || `Freshly cultivated ${name} from local agricultural estates.`,
      image: image || '/src/assets/images/category_vegetables_box_1791379812745.jpg',
      bgColor: bgColor || 'bg-emerald-50/80',
      borderColor: borderColor || 'border-emerald-200/60',
      itemCount: 0,
    };

    db.categories.push(newCat);
    saveDatabase();
    res.status(201).json(newCat);
  });

  app.put('/api/categories/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updated = { ...db.categories[index], ...req.body };
    db.categories[index] = updated;
    saveDatabase();
    res.json(updated);
  });

  app.delete('/api/categories/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    if (id === 'vegetables' || id === 'fruits') {
      return res.status(400).json({ error: 'Core system categories cannot be deleted' });
    }
    const initialLen = db.categories.length;
    db.categories = db.categories.filter((c) => c.id !== id);
    if (db.categories.length === initialLen) {
      return res.status(404).json({ error: 'Category not found' });
    }
    saveDatabase();
    res.json({ success: true });
  });

  app.post('/api/categories/reset', (req: Request, res: Response) => {
    db.categories = DEFAULT_CATEGORIES;
    saveDatabase();
    res.json(db.categories);
  });

  // ORDERS
  app.get('/api/orders', (req: Request, res: Response) => {
    res.json(db.orders);
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    const orderData = req.body;
    if (!orderData || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({ error: 'Order must contain items' });
    }

    const orderId = orderData.id || `nb-ord-${Date.now()}`;
    const orderNumber = orderData.orderNumber || `NB-${Math.floor(100000 + Math.random() * 900000)}`;

    // Deduct stock from products
    orderData.items.forEach((item: any) => {
      const prod = db.products.find((p) => p.id === item.productId);
      if (prod) {
        const qty = item.quantity || 1;
        prod.stock = Math.max(0, prod.stock - qty);
        db.inventoryLogs.unshift({
          id: `log-ord-${Date.now()}-${item.productId}`,
          productId: prod.id,
          productName: prod.name,
          change: -qty,
          newStock: prod.stock,
          reason: 'customer_order',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    });

    const newOrder = {
      ...orderData,
      id: orderId,
      orderNumber,
      createdAt: orderData.createdAt || new Date().toISOString(),
      status: orderData.status || 'confirmed',
      courier: orderData.courier || db.driver,
    };

    db.orders.unshift(newOrder);
    saveDatabase();
    res.status(201).json(newOrder);
  });

  app.put('/api/orders/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = db.orders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    saveDatabase();
    res.json(order);
  });

  // INVENTORY LOGS
  app.get('/api/inventory/logs', (req: Request, res: Response) => {
    res.json(db.inventoryLogs);
  });

  // DELIVERY DRIVER
  app.get('/api/driver', (req: Request, res: Response) => {
    res.json(db.driver);
  });

  app.put('/api/driver', (req: Request, res: Response) => {
    db.driver = { ...db.driver, ...req.body };
    saveDatabase();
    res.json(db.driver);
  });

  // ADMIN AUTH & PASSWORD
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === db.adminPasswordHash) {
      res.json({
        success: true,
        user: { username: 'admin', name: 'NasBaladna Farm Administrator' },
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid administrator credentials',
      });
    }
  });

  app.post('/api/admin/change-password', (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    if (currentPassword !== db.adminPasswordHash) {
      return res.status(403).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 4 characters long.',
      });
    }

    db.adminPasswordHash = newPassword;
    saveDatabase();
    res.json({
      success: true,
      message: 'Admin password changed successfully and persisted to backend.',
    });
  });

  app.post('/api/admin/reset-password', (req: Request, res: Response) => {
    db.adminPasswordHash = 'admin';
    saveDatabase();
    res.json({ success: true, message: 'Password reset to default.' });
  });

  // SETTINGS
  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(db.settings);
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    db.settings = { ...db.settings, ...req.body };
    saveDatabase();
    res.json(db.settings);
  });

  // ===================== STATIC / VITE INTEGRATION =====================

  if (!isProd) {
    // In dev: mount Vite middlewares with hmr: false to avoid websocket errors in AI Studio iframe
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In prod: serve dist files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NasBaladna Full-Stack Server running on http://0.0.0.0:${PORT}`);
    console.log(`📁 Database persisted at: ${DB_FILE}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
