import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { NasBaladnaLogo } from './NasBaladnaLogo';
import {
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  Package,
  DollarSign,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Upload,
  Download,
  FileSpreadsheet,
  Activity,
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  AlertTriangle,
  AlertCircle,
  Boxes,
  Eye,
  EyeOff,
  ShoppingBag,
  ExternalLink,
  RefreshCw,
  Send,
  Tag,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
  HelpCircle,
  RotateCcw,
  FileImage,
  BellRing,
  Bell,
  Volume2,
  VolumeX,
  Printer,
  QrCode,
  Radio,
  CheckCheck,
  Zap,
  Calendar,
  Navigation,
  Compass,
  Leaf,
  Share2,
} from 'lucide-react';
import { CategoryType, Product, OrderStatus, Order } from '../types';
import { NotificationService } from '../services/notifications';
import { OrderReceiptModal } from './OrderReceiptModal';
import { ScanToOrderModal } from './ScanToOrderModal';
import { DriverManifestModal } from './DriverManifestModal';
import { getDistrictCoordinates } from '../constants/locations';
import {
  categoryVegImg,
  categoryFruitsImg,
  orangeImg,
  categoryNearExpiryImg,
  categoryDairyImg,
  categoryBakeryImg,
  categoryHerbsImg,
  categoryJuicesImg,
  CATEGORY_IMAGE_PRESETS,
  CategoryImagePreset,
} from '../data/mockData';

export const AdminPortal: React.FC = () => {
  const {
    isAdminAuthenticated,
    adminUser,
    adminLogin,
    adminLogout,
    setCurrentView,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkAddProducts,
    bulkUpdatePrices,
    formatPrice,
    ordersHistory,
    updateOrderStatus,
    inventoryLogs,
    updateStock,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    resetCategoriesToDefault,
    adminPassword,
    changeAdminPassword,
    resetAdminPassword,
    deliveryDriver,
    updateDeliveryDriver,
    ownerPhone,
    ownerWhatsAppUrl,
    showToast,
    unreadOrdersCount,
    markOrdersAsRead,
    adminAlertSoundEnabled,
    setAdminAlertSoundEnabled,
    playOrderAlertChime,
    latestReceivedOrder,
  } = useStore();

  // Login form state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard active tab
  const [activeTab, setActiveTab] = useState<
    'products' | 'add_product' | 'categories' | 'delivery_driver' | 'bulk' | 'orders' | 'inventory' | 'security' | 'qr_studio'
  >('products');
  const [isAdminQrModalOpen, setIsAdminQrModalOpen] = useState(false);
  const [isDriverManifestModalOpen, setIsDriverManifestModalOpen] = useState(false);

  // Password Management Form State
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Single Product Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryType>('vegetables');
  const [newBasePrice, setNewBasePrice] = useState<number>(5.0);
  const [newBaseWeight, setNewBaseWeight] = useState('500g');
  const [newStock, setNewStock] = useState<number>(30);
  const [newWholesalePrice, setNewWholesalePrice] = useState<number>(20.0);
  const [newWholesaleUnit, setNewWholesaleUnit] = useState('5kg Crate');
  const [newFarm, setNewFarm] = useState('NasBaladna Local Farm Cluster');
  const [newDescription, setNewDescription] = useState('Fresh morning harvest from NasBaladna local greenhouses.');
  const [newOrganic, setNewOrganic] = useState(true);

  // Near Expiry Specific Form State (only active when category is near_expiry)
  const [newExpiryDate, setNewExpiryDate] = useState('Best before today or tomorrow');
  const [newOriginalPrice, setNewOriginalPrice] = useState<number>(10.0);
  const [newDiscountPercent, setNewDiscountPercent] = useState<number>(50);

  // Admin Products Search & Filter State
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('all');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  // Admin Live Orders Filter & Audio Notification State
  const [orderFilter, setOrderFilter] = useState<'all' | 'unread' | 'confirmed' | 'packing' | 'on_the_way' | 'delivered'>('all');
  const [desktopNotifGranted, setDesktopNotifGranted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  const handleEnableDesktopNotifications = async () => {
    const granted = await NotificationService.requestNotificationPermission();
    setDesktopNotifGranted(granted);
    if (granted) {
      showToast('Browser notifications enabled! You will be alerted for every new website order.');
    } else {
      showToast('Notifications could not be enabled. Please check your browser permission settings.');
    }
  };

  const sendAdminOrderAlertWhatsApp = (order: Order) => {
    const text = `🚨 *NEW WEBSITE ORDER RECEIVED*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `*Order #:* ${order.orderNumber}\n` +
      `*Customer:* ${order.customerName} (${order.phone})\n` +
      `*Delivery Area:* ${order.district}\n` +
      `*Address:* ${order.address}\n` +
      `*Delivery Slot:* ${order.deliverySlot}\n` +
      `*Payment:* ${order.paymentMethod.toUpperCase()} (${order.paymentStatus === 'paid' ? 'PAID' : 'DUE ON ARRIVAL'})\n` +
      `*Total Amount:* ${order.currency} ${order.total.toFixed(2)}\n\n` +
      `*Items Ordered:*\n` +
      order.items.map((i) => `• ${i.quantity}x ${i.product.name} (${i.selectedWeight})`).join('\n') +
      `\n\nDispatching with Driver: ${deliveryDriver.name} (${deliveryDriver.phone})`;

    const targetUrl = NotificationService.getWhatsAppUrl(ownerPhone, text);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Export Driver Manifest CSV
  const handleExportDriverManifestCsv = () => {
    const headers = [
      'StopSequence',
      'OrderNumber',
      'CustomerName',
      'Phone',
      'DistrictZone',
      'StreetAddress',
      'Latitude',
      'Longitude',
      'GoogleMapsLink',
      'DeliverySlot',
      'ServiceLevel',
      'DropoffPreference',
      'DoorbellNotice',
      'PaymentMethod',
      'PaymentStatus',
      'TotalPayable',
      'DeliveryNotes',
      'ItemsChecklist',
      'CurrentStatus',
    ];

    const rows = ordersHistory.map((ord, idx) => {
      const coords = ord.coordinates || getDistrictCoordinates(ord.district);
      const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
      const itemsList = ord.items
        .map((i) => `${i.product.name} (${i.selectedWeight}) x${i.quantity}`)
        .join('; ');

      const serviceLevel = ord.isExpress || ord.serviceType === 'express'
        ? 'Express 60-Min'
        : ord.serviceType === 'eco_green'
        ? 'Eco-Green Consolidated'
        : 'Scheduled Standard';

      const dropoff = ord.dropoffPreference === 'doorstep'
        ? 'Doorstep Drop'
        : ord.dropoffPreference === 'security'
        ? 'Security / Concierge'
        : 'Hand to Customer';

      const doorbell = ord.doorbellPreference === 'silent' ? 'Silent Delivery (No Bell)' : 'Ring Bell / Knock';
      const payment = ord.paymentMethod === 'cod' ? `COD (${ord.total} QAR)` : `Prepaid Online (${ord.total} QAR)`;

      return [
        idx + 1,
        `"${ord.orderNumber}"`,
        `"${ord.customerName.replace(/"/g, '""')}"`,
        `"${ord.phone}"`,
        `"${ord.district.replace(/"/g, '""')}"`,
        `"${ord.address.replace(/"/g, '""')}"`,
        coords.lat,
        coords.lng,
        `"${navUrl}"`,
        `"${ord.deliverySlot.replace(/"/g, '""')}"`,
        `"${serviceLevel}"`,
        `"${dropoff}"`,
        `"${doorbell}"`,
        `"${ord.paymentMethod}"`,
        `"${payment}"`,
        ord.total,
        `"${(ord.deliveryNotes || '').replace(/"/g, '""')}"`,
        `"${itemsList.replace(/"/g, '""')}"`,
        `"${ord.status}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nasbaladna_driver_manifest_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${ordersHistory.length} orders to Driver Manifest CSV!`);
  };

  // Dispatch full route manifest to Driver WhatsApp
  const handleDispatchDriverFleetWhatsApp = () => {
    let msg = `🚚 *NASBALADNA ROUTE DISPATCH MANIFEST*\n`;
    msg += `Driver: ${deliveryDriver.name} (${deliveryDriver.phone})\n`;
    msg += `Vehicle: ${deliveryDriver.vehicle} | Plate: ${deliveryDriver.plateNumber}\n`;
    msg += `Total Orders: ${ordersHistory.length}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    ordersHistory.forEach((ord, idx) => {
      const isExpress = ord.isExpress || ord.serviceType === 'express';
      const coords = ord.coordinates || getDistrictCoordinates(ord.district);
      const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;

      msg += `Stop #${idx + 1}: *${ord.orderNumber}* ${isExpress ? '⚡ [EXPRESS PRIORITY]' : ''}\n`;
      msg += `👤 Recipient: ${ord.customerName} (${ord.phone})\n`;
      msg += `📍 Area: ${ord.district} - ${ord.address}\n`;
      if (ord.deliveryNotes) msg += `📝 Notes: ${ord.deliveryNotes}\n`;
      if (ord.dropoffPreference === 'doorstep') msg += `🚪 Preference: Leave at Doorstep\n`;
      if (ord.doorbellPreference === 'silent') msg += `🔕 Do NOT ring bell\n`;
      msg += `⏰ Slot: ${ord.deliverySlot}\n`;
      msg += `💵 Total: ${ord.total} QAR (${ord.paymentMethod === 'cod' ? '⚠️ CASH ON DELIVERY' : '✅ PAID ONLINE'})\n`;
      msg += `🗺️ Turn-by-Turn GPS Navigation: ${navUrl}\n\n`;
    });

    const cleanPhone = (deliveryDriver.dispatchWhatsApp || deliveryDriver.phone).replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Launched WhatsApp with full driver route manifest!');
  };

  // Delivery Driver Form State
  const [driverName, setDriverName] = useState(deliveryDriver.name);
  const [driverPhone, setDriverPhone] = useState(deliveryDriver.phone);
  const [driverVehicle, setDriverVehicle] = useState(deliveryDriver.vehicle);
  const [driverPlate, setDriverPlate] = useState(deliveryDriver.plateNumber);
  const [driverStatus, setDriverStatus] = useState(deliveryDriver.status);
  const [driverDispatchWhatsApp, setDriverDispatchWhatsApp] = useState(deliveryDriver.dispatchWhatsApp);
  const [driverNotes, setDriverNotes] = useState(deliveryDriver.notes || '');

  // Keep driver form in sync with deliveryDriver from StoreContext
  useEffect(() => {
    setDriverName(deliveryDriver.name);
    setDriverPhone(deliveryDriver.phone);
    setDriverVehicle(deliveryDriver.vehicle);
    setDriverPlate(deliveryDriver.plateNumber);
    setDriverStatus(deliveryDriver.status);
    setDriverDispatchWhatsApp(deliveryDriver.dispatchWhatsApp);
    setDriverNotes(deliveryDriver.notes || '');
  }, [deliveryDriver]);

  // Category Management Form State
  const [catName, setCatName] = useState('');
  const [catId, setCatId] = useState('');
  const [catBadge, setCatBadge] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catTheme, setCatTheme] = useState<
    'emerald' | 'amber' | 'rose' | 'sky' | 'stone' | 'teal' | 'orange' | 'purple'
  >('emerald');
  const [catImageMode, setCatImageMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [catPresetId, setCatPresetId] = useState<string>('vegetables');
  const [catUploadedImage, setCatUploadedImage] = useState<string>('');
  const [catCustomImageUrl, setCatCustomImageUrl] = useState<string>('');

  // Editing existing category state
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [editingCatBadge, setEditingCatBadge] = useState('');
  const [editingCatImage, setEditingCatImage] = useState('');
  const [editingCatImageMode, setEditingCatImageMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [editingCatPresetId, setEditingCatPresetId] = useState('vegetables');
  const [editingCatCustomUrl, setEditingCatCustomUrl] = useState('');

  // In-line editing product state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [tempWholesale, setTempWholesale] = useState<number>(0);
  const [tempStock, setTempStock] = useState<number>(0);
  const [tempCategory, setTempCategory] = useState<CategoryType>('vegetables');
  const [tempExpiryDate, setTempExpiryDate] = useState<string>('Best before today or tomorrow');
  const [tempOriginalPrice, setTempOriginalPrice] = useState<number>(10.0);
  const [tempDiscountPercent, setTempDiscountPercent] = useState<number>(50);

  // Bulk Import state with 10-column CSV (including ImageUrl, ExpiryDate, OriginalPrice)
  const [bulkCsvText, setBulkCsvText] = useState(
    `Name, Category, Price, Stock, Weight, WholesalePrice, WholesaleUnit, ImageUrl, ExpiryDate, OriginalPrice\n` +
    `Sweet Baby Carrots, vegetables, 4.5, 35, 500g, 35, 5kg Crate, vegetables, , \n` +
    `Ripe Hass Avocados 2-Pack, near_expiry, 6.5, 20, 400g, 28, 5kg Box, fruits, Expires in 2 days (Oct 14), 13.5\n` +
    `Golden Papaya, fruits, 7.5, 20, 1kg, 60, 10kg Box, fruits, , \n` +
    `Fresh Full Cream Milk 1L, near_expiry, 4.0, 30, 1L, 25, 6 Bottles, dairy, Best before tomorrow (8 PM), 8.5\n` +
    `Local Fresh Mint, herbs, 2.0, 40, 200g, 15, 2kg Bundle, herbs, , \n` +
    `Artisanal Sourdough Boule, near_expiry, 5.0, 15, 500g, 30, 6 Loaves, bakery, Expires in 3 days, 11.0`
  );
  const [bulkUploadedImages, setBulkUploadedImages] = useState<Record<string, { dataUrl: string; filename: string }>>({});
  const [bulkRowImageOverrides, setBulkRowImageOverrides] = useState<Record<number, string>>({});
  const [bulkRowExpiryOverrides, setBulkRowExpiryOverrides] = useState<Record<number, string>>({});
  const [bulkRowOriginalPriceOverrides, setBulkRowOriginalPriceOverrides] = useState<Record<number, number>>({});
  const [bulkActiveSubTab, setBulkActiveSubTab] = useState<'editor' | 'preview' | 'images'>('editor');
  const [bulkSelectedRowForImage, setBulkSelectedRowForImage] = useState<number | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const bulkSingleRowFileInputRef = useRef<HTMLInputElement>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    setTimeout(() => {
      const ok = adminLogin(username, password);
      setIsLoggingIn(false);
      if (!ok) {
        setLoginError('Invalid administrator credentials. Please check your username and password.');
      }
    }, 600);
  };

  const handleStartEdit = (p: Product) => {
    setEditingId(p.id);
    setTempPrice(p.basePrice);
    setTempWholesale(p.wholesalePrice || p.basePrice * 4.5);
    setTempStock(p.stock);
    setTempCategory(p.category);
    setTempExpiryDate(p.expiryDate || 'Best before today or tomorrow');
    setTempOriginalPrice(p.originalPrice || Math.round(p.basePrice * 2 * 10) / 10);
    setTempDiscountPercent(p.discountPercent || 50);
  };

  const handleSaveEdit = (p: Product) => {
    const isNearExpiry = tempCategory === 'near_expiry';
    updateProduct(p.id, {
      category: tempCategory,
      basePrice: tempPrice,
      wholesalePrice: tempWholesale,
      stock: tempStock,
      isNearExpiry: isNearExpiry,
      expiryDate: isNearExpiry ? (tempExpiryDate.trim() || 'Best before today or tomorrow') : undefined,
      originalPrice: isNearExpiry ? (tempOriginalPrice > tempPrice ? tempOriginalPrice : tempPrice * 2) : undefined,
      discountPercent: isNearExpiry ? (tempDiscountPercent || 50) : undefined,
    });
    setEditingId(null);
  };

  const THEME_CLASSES: Record<string, { bg: string; border: string }> = {
    emerald: { bg: 'bg-emerald-50/80', border: 'border-emerald-200/60' },
    amber: { bg: 'bg-amber-50/80', border: 'border-amber-200/60' },
    rose: { bg: 'bg-rose-50/80', border: 'border-rose-200/70' },
    sky: { bg: 'bg-sky-50/80', border: 'border-sky-200/60' },
    stone: { bg: 'bg-stone-50/80', border: 'border-stone-200/60' },
    teal: { bg: 'bg-teal-50/80', border: 'border-teal-200/60' },
    orange: { bg: 'bg-orange-50/80', border: 'border-orange-200/60' },
    purple: { bg: 'bg-purple-50/80', border: 'border-purple-200/60' },
  };

  const handleCategoryFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEditingMode: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      if (isEditingMode) {
        setEditingCatImage(base64Data);
        setEditingCatImageMode('upload');
      } else {
        setCatUploadedImage(base64Data);
        setCatImageMode('upload');
      }
      showToast(`Image "${file.name}" loaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const getResolvedNewCatImage = (): string => {
    if (catImageMode === 'upload' && catUploadedImage) {
      return catUploadedImage;
    }
    if (catImageMode === 'url' && catCustomImageUrl.trim()) {
      return catCustomImageUrl.trim();
    }
    const preset = CATEGORY_IMAGE_PRESETS.find((p) => p.id === catPresetId);
    return preset?.image || categoryVegImg;
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      showToast('Category name is required');
      return;
    }
    const computedId = catId.trim()
      ? catId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
      : catName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const selectedImage = getResolvedNewCatImage();
    const theme = THEME_CLASSES[catTheme] || THEME_CLASSES.emerald;

    const ok = addCategory({
      id: computedId,
      name: catName.trim(),
      image: selectedImage,
      bgColor: theme.bg,
      borderColor: theme.border,
      badge: catBadge.trim() || undefined,
      description: catDescription.trim() || undefined,
    });

    if (ok) {
      setCatName('');
      setCatId('');
      setCatBadge('');
      setCatDescription('');
      setCatUploadedImage('');
      setCatCustomImageUrl('');
      setCatImageMode('preset');
      setCatPresetId('vegetables');
    }
  };

  const handleStartEditCategory = (cat: { id: string; name: string; image?: string; badge?: string }) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
    setEditingCatBadge(cat.badge || '');
    const currentImg = cat.image || '';
    setEditingCatImage(currentImg);

    const matchedPreset = CATEGORY_IMAGE_PRESETS.find((p) => p.image === currentImg);
    if (matchedPreset) {
      setEditingCatImageMode('preset');
      setEditingCatPresetId(matchedPreset.id);
    } else if (currentImg.startsWith('data:image/')) {
      setEditingCatImageMode('upload');
    } else if (currentImg) {
      setEditingCatImageMode('url');
      setEditingCatCustomUrl(currentImg);
    } else {
      setEditingCatImageMode('preset');
      setEditingCatPresetId('vegetables');
    }
  };

  const handleSaveEditCategory = (id: string) => {
    if (!editingCatName.trim()) return;
    updateCategory(id, {
      name: editingCatName.trim(),
      badge: editingCatBadge.trim() || undefined,
      image: editingCatImage,
    });
    setEditingCatId(null);
  };

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim() || !driverPhone.trim()) {
      showToast('Driver name and phone are required');
      return;
    }
    updateDeliveryDriver({
      name: driverName.trim(),
      phone: driverPhone.trim(),
      vehicle: driverVehicle.trim(),
      plateNumber: driverPlate.trim(),
      status: driverStatus,
      dispatchWhatsApp: driverDispatchWhatsApp.trim(),
      notes: driverNotes.trim(),
    });
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (!currentPassInput) {
      setPasswordChangeError('Please enter your current password.');
      return;
    }

    if (!newPassInput || newPassInput.length < 4) {
      setPasswordChangeError('New password must be at least 4 characters long.');
      return;
    }

    if (newPassInput !== confirmPassInput) {
      setPasswordChangeError('New passwords do not match. Please verify and re-type.');
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      const res = changeAdminPassword(currentPassInput, newPassInput);
      setIsUpdatingPassword(false);
      if (res.success) {
        setPasswordChangeSuccess('Admin password changed successfully! Your new password is now active.');
        setCurrentPassInput('');
        setNewPassInput('');
        setConfirmPassInput('');
      } else {
        setPasswordChangeError(res.message);
      }
    }, 400);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const skuCode = `NB-${newCategory.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const matchedCategory = categories.find((c) => c.id === newCategory);
    const imageToUse =
      matchedCategory?.image ||
      (newCategory === 'fruits'
        ? categoryFruitsImg
        : newCategory === 'vegetables'
        ? categoryVegImg
        : newCategory === 'near_expiry'
        ? categoryNearExpiryImg
        : orangeImg);

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: newName,
      category: newCategory,
      brand: 'NasBaladna Farm Select',
      sku: skuCode,
      basePrice: Number(newBasePrice),
      baseWeight: newBaseWeight,
      weightOptions: [
        { weight: newBaseWeight, multiplier: 1.0 },
        { weight: '1kg', multiplier: 1.85 },
        { weight: '2kg', multiplier: 3.5 },
      ],
      stock: Number(newStock),
      image: imageToUse,
      thumbnails: [imageToUse],
      description: newDescription,
      origin: 'Doha Greenhouses & Local Orchards',
      farm: newFarm,
      organic: newOrganic,
      wholesalePrice: Number(newWholesalePrice),
      wholesaleUnit: newWholesaleUnit,
      isWholesaleEligible: true,
      isNearExpiry: newCategory === 'near_expiry',
      ...(newCategory === 'near_expiry'
        ? {
            expiryDate: newExpiryDate.trim() || 'Best before today or tomorrow',
            originalPrice:
              newOriginalPrice > Number(newBasePrice)
                ? Number(newOriginalPrice)
                : Math.round(Number(newBasePrice) * 2 * 10) / 10,
            discountPercent: Number(newDiscountPercent) || 50,
          }
        : {}),
      benefits: [
        'Direct local farm harvest with morning delivery',
        'Natural aroma and nutrient retention',
        'Pesticide-free certified cultivation',
      ],
      storageAdvice: 'Store in a cool dry area at 4°C.',
    };

    const success = addProduct(newProd);
    if (success) {
      setNewName('');
      setNewBasePrice(5.0);
      setNewStock(30);
      setActiveTab('products');
    }
  };

  // Resolve product image from manual override, uploaded file mapping, CSV 8th column, or category preset
  const resolveBulkRowImage = (
    rowIndex: number,
    rawName: string,
    rawCat: string,
    rawImageCol?: string
  ): string => {
    // 1. Direct row override if user edited or uploaded a photo for this row
    if (bulkRowImageOverrides[rowIndex]) {
      return bulkRowImageOverrides[rowIndex];
    }

    // 2. Direct match from bulk uploaded images by product name or filename
    const cleanName = rawName.toLowerCase().trim();
    if (bulkUploadedImages[cleanName]) {
      return bulkUploadedImages[cleanName].dataUrl;
    }
    for (const [key, item] of Object.entries(bulkUploadedImages)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        return item.dataUrl;
      }
    }

    // 3. Image column provided in CSV
    if (rawImageCol && rawImageCol.trim()) {
      const colVal = rawImageCol.trim();
      const colLower = colVal.toLowerCase();

      // Check uploaded images mapping by key
      if (bulkUploadedImages[colLower]) {
        return bulkUploadedImages[colLower].dataUrl;
      }

      // Check preset ID match
      const preset = CATEGORY_IMAGE_PRESETS.find(
        (p) => p.id.toLowerCase() === colLower || p.name.toLowerCase() === colLower
      );
      if (preset) return preset.image;

      // Check standard URL or base64 data URI
      if (
        colVal.startsWith('http://') ||
        colVal.startsWith('https://') ||
        colVal.startsWith('data:image') ||
        colVal.startsWith('/')
      ) {
        return colVal;
      }
    }

    // 4. Default to Category Preset image
    const catLower = rawCat.toLowerCase().trim();
    if (catLower === 'fruits') return categoryFruitsImg;
    if (catLower === 'vegetables') return categoryVegImg;
    if (catLower === 'dairy') return categoryDairyImg;
    if (catLower === 'bakery') return categoryBakeryImg;
    if (catLower === 'herbs') return categoryHerbsImg;
    if (catLower === 'juices') return categoryJuicesImg;
    if (catLower === 'near_expiry') return categoryNearExpiryImg;
    return categoryVegImg;
  };

  // Multi-file photo upload handler for bulk products
  const handleBulkImageFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let processedCount = 0;
    const newUploads: Record<string, { dataUrl: string; filename: string }> = { ...bulkUploadedImages };

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 8 * 1024 * 1024) {
        showToast(`Skipped ${file.name}: size exceeds 8MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // Clean filename without extension for matching (e.g., "baby_carrots.jpg" -> "baby carrots")
        const baseKey = file.name
          .replace(/\.[^/.]+$/, '')
          .toLowerCase()
          .replace(/[_-]/g, ' ')
          .trim();
        const rawKey = file.name.toLowerCase().trim();

        newUploads[baseKey] = { dataUrl, filename: file.name };
        newUploads[rawKey] = { dataUrl, filename: file.name };
        processedCount++;

        if (processedCount >= files.length) {
          setBulkUploadedImages(newUploads);
          showToast(`Successfully loaded ${files.length} product photos! Auto-matched with products.`);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  // Upload an image for an individual row in the preview table
  const handleRowImageFileUpload = (rowIndex: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setBulkRowImageOverrides((prev) => ({ ...prev, [rowIndex]: dataUrl }));
      showToast(`Custom photo attached to Row #${rowIndex}`);
    };
    reader.readAsDataURL(file);
  };

  // Download official CSV template with 10 columns including ImageUrl, ExpiryDate, and OriginalPrice
  const handleDownloadCsvTemplate = () => {
    const csvContent =
      `Name, Category, Price, Stock, Weight, WholesalePrice, WholesaleUnit, ImageUrl, ExpiryDate, OriginalPrice\n` +
      `Sweet Baby Carrots, vegetables, 4.5, 35, 500g, 35, 5kg Crate, vegetables, , \n` +
      `Golden Papaya, fruits, 7.5, 20, 1kg, 60, 10kg Box, fruits, , \n` +
      `Farm Labneh, dairy, 9.0, 25, 500g, 75, 5kg Tub, dairy, , \n` +
      `Artisan Milk Brioche, bakery, 8.5, 20, 400g, 65, 10 Loaves, bakery, , \n` +
      `Fresh Coriander Bunch, herbs, 2.0, 50, 200g, 15, 2kg Box, herbs, , \n` +
      `Cold Pressed Orange Juice, juices, 14.0, 25, 500ml, 120, 10 Bottles, juices, , \n` +
      `Ripe Hass Avocados 2-Pack, near_expiry, 6.5, 20, 400g, 28, 5kg Box, fruits, Expires in 2 days (Oct 14), 13.5\n` +
      `Fresh Full Cream Milk 1L, near_expiry, 4.0, 30, 1L, 25, 6 Bottles, dairy, Best before tomorrow (8 PM), 8.5`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'nasbaladna_products_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded general CSV template with ExpiryDate column!');
  };

  // Download dedicated Near Expiry Super Deals CSV template
  const handleDownloadNearExpiryCsvTemplate = () => {
    const csvContent =
      `Name, Category, Price, Stock, Weight, WholesalePrice, WholesaleUnit, ImageUrl, ExpiryDate, OriginalPrice\n` +
      `Local Organic Strawberries 250g, near_expiry, 6.5, 20, 250g, 35, 2kg Crate, fruits, Best before today 8 PM, 14.0\n` +
      `Fresh Full Cream Milk 1L, near_expiry, 4.0, 30, 1L, 25, 6 Bottles, dairy, Best before tomorrow, 8.5\n` +
      `Artisanal Sourdough Boule, near_expiry, 5.0, 15, 500g, 30, 6 Loaves, bakery, Expires in 2 days, 11.0\n` +
      `Baby Spinach Leaves Box, near_expiry, 3.5, 25, 200g, 20, 2kg Box, vegetables, Best before tomorrow, 7.5\n` +
      `Cold Pressed Orange Juice 500ml, near_expiry, 8.0, 18, 500ml, 50, 6 Bottles, juices, Best within 36h, 16.0\n` +
      `Ripe Hass Avocados 2-Pack, near_expiry, 7.0, 22, 400g, 38, 5kg Box, fruits, Best before tomorrow, 15.0\n` +
      `Farm Greek Yogurt Tub 500g, near_expiry, 6.0, 16, 500g, 40, 6 Tubs, dairy, Expires in 3 days, 12.5`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'nasbaladna_near_expiry_deals_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded Near Expiry Super Deals CSV template!');
  };

  const handleLoadNearExpirySample = () => {
    setBulkCsvText(
      `Name, Category, Price, Stock, Weight, WholesalePrice, WholesaleUnit, ImageUrl, ExpiryDate, OriginalPrice\n` +
      `Local Organic Strawberries 250g, near_expiry, 6.5, 20, 250g, 35, 2kg Crate, fruits, Best before today 8 PM, 14.0\n` +
      `Fresh Full Cream Milk 1L, near_expiry, 4.0, 30, 1L, 25, 6 Bottles, dairy, Best before tomorrow, 8.5\n` +
      `Artisanal Sourdough Boule, near_expiry, 5.0, 15, 500g, 30, 6 Loaves, bakery, Expires in 2 days, 11.0\n` +
      `Baby Spinach Leaves Box, near_expiry, 3.5, 25, 200g, 20, 2kg Box, vegetables, Best before tomorrow, 7.5\n` +
      `Cold Pressed Orange Juice 500ml, near_expiry, 8.0, 18, 500ml, 50, 6 Bottles, juices, Best within 36h, 16.0\n` +
      `Ripe Hass Avocados 2-Pack, near_expiry, 7.0, 22, 400g, 38, 5kg Box, fruits, Best before tomorrow, 15.0\n` +
      `Farm Greek Yogurt Tub 500g, near_expiry, 6.0, 16, 500g, 40, 6 Tubs, dairy, Expires in 3 days, 12.5`
    );
    showToast('Loaded Near Expiry Super Deals sample batch with Expiry Dates & Original Prices!');
  };

  const handleLoadStandardSample = () => {
    setBulkCsvText(
      `Name, Category, Price, Stock, Weight, WholesalePrice, WholesaleUnit, ImageUrl, ExpiryDate, OriginalPrice\n` +
      `Organic Hass Avocados Box, fruits, 15.0, 30, 500g, 120, 5kg Crate, fruits, , \n` +
      `Vine Cherry Tomatoes, vegetables, 4.5, 50, 250g, 38, 3kg Box, vegetables, , \n` +
      `Fresh Coriander Bunch, herbs, 2.0, 60, 150g, 18, 2kg Box, herbs, , \n` +
      `Artisan Milk Bread, bakery, 8.5, 20, 400g, 65, 10 Loaves, bakery, , \n` +
      `Cold-Pressed Orange Juice, juices, 14.0, 25, 500ml, 120, 10 Bottles, orange, , \n` +
      `Near-Expiry Greek Yogurt, near_expiry, 6.0, 15, 450g, 45, 6 Tubs, dairy, Expires in 2 days, 12.0`
    );
    showToast('Loaded standard sample produce batch!');
  };

  // Parsed representation of current bulk rows for preview & validation
  const parsedBulkRows = useMemo(() => {
    try {
      const lines = bulkCsvText.trim().split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return [];

      const headerCols = lines[0].split(',').map((c) => c.trim().toLowerCase().replace(/^["']|["']$/g, ''));
      const expiryColIdx = headerCols.findIndex((c) => c.includes('expir') || c.includes('date'));
      const origPriceColIdx = headerCols.findIndex(
        (c) => c.includes('original') || c.includes('pre-discount') || c.includes('prediscount') || c.includes('wasprice')
      );
      const imgColIdx = headerCols.findIndex((c) => c.includes('image') || c.includes('photo') || c.includes('img'));

      const rows: {
        index: number;
        name: string;
        category: CategoryType;
        price: number;
        stock: number;
        weight: string;
        wholesalePrice: number;
        wholesaleUnit: string;
        rawImage: string;
        resolvedImage: string;
        expiryDate: string;
        originalPrice: number;
        discountPercent: number;
        isNearExpiry: boolean;
        isValid: boolean;
      }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 2 && cols[0]) {
          const name = cols[0];
          const rawCat = (cols[1]?.toLowerCase() as CategoryType) || 'vegetables';
          const isNearExpiry = rawCat === 'near_expiry';
          const price = parseFloat(cols[2]) || 5.0;
          const stock = parseInt(cols[3], 10) || 20;
          const weight = cols[4] || '500g';
          const wholesalePrice = cols[5] ? parseFloat(cols[5]) : price * 4.5;
          const wholesaleUnit = cols[6] || '5kg Crate';
          const rawImage = imgColIdx !== -1 && cols[imgColIdx] ? cols[imgColIdx] : cols[7] || '';
          const resolvedImage = resolveBulkRowImage(i, name, rawCat, rawImage);

          // Expiry Date resolution (check manual row override, column by header name, or 9th column cols[8])
          let expiryDate = '';
          if (bulkRowExpiryOverrides[i] !== undefined) {
            expiryDate = bulkRowExpiryOverrides[i];
          } else if (expiryColIdx !== -1 && cols[expiryColIdx]) {
            expiryDate = cols[expiryColIdx];
          } else if (cols[8]) {
            expiryDate = cols[8];
          } else if (isNearExpiry) {
            expiryDate = 'Best before tomorrow';
          }

          // Original Pre-Discount Price resolution (check manual override, header column, or 10th column cols[9])
          let originalPrice = 0;
          if (bulkRowOriginalPriceOverrides[i] !== undefined) {
            originalPrice = bulkRowOriginalPriceOverrides[i];
          } else if (origPriceColIdx !== -1 && cols[origPriceColIdx]) {
            originalPrice = parseFloat(cols[origPriceColIdx]) || 0;
          } else if (cols[9]) {
            originalPrice = parseFloat(cols[9]) || 0;
          } else if (isNearExpiry) {
            originalPrice = Math.round(price * 2 * 10) / 10;
          }

          const discountPercent =
            originalPrice > price
              ? Math.round(((originalPrice - price) / originalPrice) * 100)
              : isNearExpiry
              ? 50
              : 0;

          rows.push({
            index: i,
            name,
            category: rawCat,
            price,
            stock,
            weight,
            wholesalePrice,
            wholesaleUnit,
            rawImage,
            resolvedImage,
            expiryDate,
            originalPrice,
            discountPercent,
            isNearExpiry: isNearExpiry || Boolean(expiryDate),
            isValid: Boolean(name && price > 0),
          });
        }
      }
      return rows;
    } catch {
      return [];
    }
  }, [bulkCsvText, bulkUploadedImages, bulkRowImageOverrides, bulkRowExpiryOverrides, bulkRowOriginalPriceOverrides]);

  const handleProcessBulkCsv = () => {
    try {
      if (parsedBulkRows.length === 0) {
        showToast('Please provide valid product CSV rows');
        return;
      }

      const parsed: Product[] = parsedBulkRows.map((row) => {
        const isNearExpiry = row.category === 'near_expiry' || Boolean(row.expiryDate);
        const resolvedOriginalPrice =
          row.originalPrice > row.price ? row.originalPrice : Math.round(row.price * 2 * 10) / 10;
        const resolvedDiscount =
          row.discountPercent ||
          (resolvedOriginalPrice > row.price
            ? Math.round(((resolvedOriginalPrice - row.price) / resolvedOriginalPrice) * 100)
            : 50);

        return {
          id: `prod-bulk-${Date.now()}-${row.index}-${Math.random().toString(36).substr(2, 4)}`,
          name: row.name,
          category: row.category,
          brand: isNearExpiry ? 'NasBaladna Farm Deals' : 'NasBaladna Farm Direct',
          sku: isNearExpiry
            ? `NB-EXP-${Math.floor(100 + Math.random() * 900)}`
            : `NB-BLK-${Math.floor(1000 + Math.random() * 9000)}`,
          basePrice: row.price,
          baseWeight: row.weight,
          weightOptions: [
            { weight: row.weight, multiplier: 1.0 },
            { weight: '1kg', multiplier: 1.85 },
            { weight: '2kg', multiplier: 3.5 },
          ],
          stock: row.stock,
          image: row.resolvedImage,
          thumbnails: [row.resolvedImage],
          description: isNearExpiry
            ? `${row.name} - Near-Expiry Super Deal clearance! Quality guaranteed fresh from Doha farms. Consume by: ${
                row.expiryDate || 'expiry date'
              }.`
            : `${row.name} freshly harvested from NasBaladna farm clusters with morning delivery.`,
          origin: 'Qatar Agro Farms & Greenhouses',
          farm: 'NasBaladna Cluster 1',
          organic: true,
          wholesalePrice: row.wholesalePrice,
          wholesaleUnit: row.wholesaleUnit,
          isWholesaleEligible: true,
          isNearExpiry: isNearExpiry,
          ...(isNearExpiry
            ? {
                expiryDate: row.expiryDate.trim() || 'Best before tomorrow',
                originalPrice: resolvedOriginalPrice,
                discountPercent: resolvedDiscount,
              }
            : {}),
          benefits: isNearExpiry
            ? [
                `Massive ${resolvedDiscount}% discount to reduce food waste`,
                `Freshness verified - ${row.expiryDate || 'Best before tomorrow'}`,
                'Immediate cold-chain delivery to your doorstep',
              ]
            : ['Farm fresh', 'High nutrition', 'Immediate doorstep delivery'],
          storageAdvice: isNearExpiry
            ? `Refrigerate at 4°C immediately. Consume by ${row.expiryDate || 'indicated date'}.`
            : 'Refrigerate at 4°C.',
        };
      });

      if (parsed.length > 0) {
        bulkAddProducts(parsed);
        showToast(`Successfully imported ${parsed.length} products with photo assets & expiry dates!`);
        setActiveTab('products');
      } else {
        showToast('No valid product rows found to import.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error processing bulk products. Please check formatting.');
    }
  };

  // IF NOT AUTHENTICATED: SHOW SECURE ADMIN LOGIN PAGE
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* Top back to customer store button */}
          <button
            onClick={() => setCurrentView('customer')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Customer Store</span>
          </button>

          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-block p-2 rounded-2xl bg-white mb-3 shadow-md">
              <NasBaladnaLogo size="sm" showTagline={false} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-white">
              Administrator Access
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Secure portal for NasBaladna inventory, products, orders & pricing
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or nasbaladna"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Log In to Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Security note */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Authorized NasBaladna personnel only</span>
          </div>
        </div>
      </div>
    );
  }

  // IF AUTHENTICATED: SHOW FULL ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Admin Navbar */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1 sm:p-1.5 rounded-xl bg-white shadow-xs shrink-0">
              <NasBaladnaLogo size="sm" showTagline={false} />
            </div>
            <div className="shrink min-w-0">
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-800 inline-block">
                ADMIN
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-400">
                Logged in as <strong className="text-slate-200">{adminUser?.name || 'Admin'}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Real-Time Order Reception Indicator & Jump */}
            <button
              onClick={() => {
                setActiveTab('orders');
                if (unreadOrdersCount > 0) {
                  setOrderFilter('unread');
                }
              }}
              className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                unreadOrdersCount > 0
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/60 ring-2 ring-rose-400 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title={
                unreadOrdersCount > 0
                  ? `🚨 ${unreadOrdersCount} NEW Orders Received! Click to view.`
                  : 'Customer Orders'
              }
            >
              <BellRing
                className={`w-3.5 h-3.5 ${
                  unreadOrdersCount > 0 ? 'text-white animate-bounce' : 'text-emerald-400'
                }`}
              />
              <span className="hidden sm:inline">Live Orders</span>
              {unreadOrdersCount > 0 ? (
                <span className="px-1.5 py-0.5 bg-white text-rose-700 text-[10px] font-black rounded-full shadow-xs">
                  {unreadOrdersCount} NEW
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-mono">({ordersHistory.length})</span>
              )}
            </button>

            {/* Audio Alert Chime Quick Toggle */}
            <button
              onClick={() => {
                const next = !adminAlertSoundEnabled;
                setAdminAlertSoundEnabled(next);
                if (next) {
                  playOrderAlertChime();
                  showToast('🔊 Order Chime Enabled! (Sample audio chime played)');
                } else {
                  showToast('🔕 Order Chime Muted');
                }
              }}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                adminAlertSoundEnabled
                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={
                adminAlertSoundEnabled
                  ? 'Order Chime is ACTIVE - Click to Mute'
                  : 'Order Chime is MUTED - Click to Enable'
              }
            >
              {adminAlertSoundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
              <span className="hidden lg:inline">{adminAlertSoundEnabled ? 'Chime ON' : 'Muted'}</span>
            </button>

            <button
              onClick={() => setActiveTab('qr_studio')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'qr_studio'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title="Scan & Order QR Code Studio & Print Station"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">QR Codes</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                activeTab === 'security'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title="Admin Password & Credentials Settings"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Password</span>
            </button>

            <button
              onClick={() => setCurrentView('customer')}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors shrink-0"
              title="Return to Customer Store"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Store</span>
            </button>

            <button
              onClick={adminLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-xs font-bold text-white shadow-xs shrink-0 transition-all cursor-pointer"
              title="Log out of admin console"
            >
              <LogOut className="w-3.5 h-3.5 text-white" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col space-y-6">
        {/* PROMINENT HIGH-VISIBILITY NEW ORDER RECEIVED ALERT BANNER (ONLY FOR ADMIN) */}
        {unreadOrdersCount > 0 && (
          <div className="bg-gradient-to-r from-rose-950/90 via-slate-950 to-emerald-950/80 border-2 border-rose-500/80 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden ring-4 ring-rose-500/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-900/60 animate-bounce mt-0.5">
                  <BellRing className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md">
                      NEW ORDER RECEIVED
                    </span>
                    <span className="text-xs text-rose-300 font-semibold">
                      {unreadOrdersCount} website order{unreadOrdersCount > 1 ? 's' : ''} awaiting fulfillment
                    </span>
                  </div>
                  {latestReceivedOrder ? (
                    <div className="mt-1">
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        Order #{latestReceivedOrder.orderNumber} · {latestReceivedOrder.customerName}
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        <strong className="text-emerald-400 font-mono">
                          {formatPrice(latestReceivedOrder.total)}
                        </strong>{' '}
                        ({latestReceivedOrder.items.length} items) · Delivery to{' '}
                        <span className="text-slate-200">{latestReceivedOrder.district}</span> · Slot:{' '}
                        <span className="text-slate-200">{latestReceivedOrder.deliverySlot}</span> · Method:{' '}
                        <span className="uppercase text-amber-300 font-mono">{latestReceivedOrder.paymentMethod}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 mt-1">
                      Customers have placed new orders on the website. Check customer orders to review details and begin packaging.
                    </p>
                  )}
                </div>
              </div>

              {/* Fast Action Buttons for Admin */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
                <button
                  onClick={() => {
                    setActiveTab('orders');
                    setOrderFilter('unread');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Orders</span>
                </button>

                {latestReceivedOrder && (
                  <button
                    onClick={() => sendAdminOrderAlertWhatsApp(latestReceivedOrder)}
                    className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                    title="Send Order Summary to Admin Phone (+974 7731 5415) on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>WhatsApp Alert</span>
                  </button>
                )}

                <button
                  onClick={markOrdersAsRead}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
                  title="Mark all orders as seen and dismiss this alert"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  <span>Mark as Seen</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'products'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Manage Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add_product')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'add_product'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'categories'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Manage Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('delivery_driver')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'delivery_driver'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Driver & WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'bulk'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bulk CSV & Pricing</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Customer Orders ({ordersHistory.length})</span>
            {unreadOrdersCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black animate-pulse shadow-xs">
                +{unreadOrdersCount} NEW
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'inventory'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Inventory Audit Log</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'security'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-300" />
            <span>Password & Security</span>
          </button>

          <button
            onClick={() => setActiveTab('qr_studio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'qr_studio'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Scan & Order QR Studio</span>
          </button>

          <button
            onClick={adminLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap text-rose-400 hover:text-white hover:bg-rose-950/80 border border-rose-900/60 ml-auto transition-all cursor-pointer"
            title="Log out of Admin Console"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Log Out</span>
          </button>
        </div>

        {/* TAB 1: MANAGE PRODUCTS & IN-LINE PRICE EDITING */}
        {activeTab === 'products' && (() => {
          const displayedAdminProducts = products.filter((p) => {
            const matchesCat = adminCategoryFilter === 'all' || p.category === adminCategoryFilter;
            const matchesSearch =
              adminSearch.trim() === '' ||
              p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
              p.sku.toLowerCase().includes(adminSearch.toLowerCase()) ||
              p.category.toLowerCase().includes(adminSearch.toLowerCase());
            return matchesCat && matchesSearch;
          });

          return (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold font-['Outfit'] text-white">
                      Live Produce Catalog & Price Management
                    </h2>
                    <span className="text-[11px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                      {products.length} items
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Adjust retail rates, B2B wholesale pricing, and stock. Unlimited products supported with instant database persistence.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => bulkUpdatePrices(5)}
                    className="px-2.5 sm:px-3 py-1.5 bg-emerald-900/60 border border-emerald-700 text-emerald-300 font-bold text-xs rounded-xl hover:bg-emerald-800"
                  >
                    +5% Prices
                  </button>
                  <button
                    onClick={() => bulkUpdatePrices(-5)}
                    className="px-2.5 sm:px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
                  >
                    -5% Prices
                  </button>
                  <button
                    onClick={() => setActiveTab('add_product')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              {/* Product Search & Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="sm:col-span-2 relative">
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search by name, SKU, or keyword..."
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {adminSearch && (
                    <button
                      onClick={() => setAdminSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={adminCategoryFilter}
                    onChange={(e) => setAdminCategoryFilter(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Categories ({products.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80 bg-slate-900/50">
                {displayedAdminProducts.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                    <p>No products match your search or filter.</p>
                    <button
                      onClick={() => {
                        setAdminSearch('');
                        setAdminCategoryFilter('all');
                      }}
                      className="text-emerald-400 underline font-semibold"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  displayedAdminProducts.map((p) => {
                    const isEditing = editingId === p.id;
                    const wholesaleVal = p.wholesalePrice || p.basePrice * 4.5;

                    return (
                      <div
                        key={p.id}
                        className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                                {p.name}
                              </h4>
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                                {p.sku}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 truncate">
                              <span className="capitalize">{p.category}</span>
                              <span>·</span>
                              <span>{p.baseWeight}</span>
                              <span>·</span>
                              <span className="text-emerald-400 truncate">{p.farm}</span>
                            </div>

                            {/* Near Expiry badge shown for Near Expiry Super Deals */}
                            {(p.category === 'near_expiry' || p.isNearExpiry) && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                                  <Zap className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
                                  <span>Super Deal ({p.discountPercent || 50}% OFF)</span>
                                </span>
                                <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-900/60 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>Expiry: {p.expiryDate || 'Best today or tomorrow'}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                          {isEditing ? (
                            <div className="flex flex-col gap-2.5 w-full sm:w-auto">
                              <div className="flex flex-wrap items-center gap-2">
                                <div>
                                  <label className="block text-[10px] text-slate-400">Category</label>
                                  <select
                                    value={tempCategory}
                                    onChange={(e) => setTempCategory(e.target.value as CategoryType)}
                                    className="px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-medium"
                                  >
                                    {categories.map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.id === 'near_expiry' ? '⚡ ' : ''}{c.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400">Retail</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={tempPrice}
                                    onChange={(e) => setTempPrice(parseFloat(e.target.value) || 0)}
                                    className="w-16 sm:w-20 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg font-mono font-bold text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400">B2B Crate</label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={tempWholesale}
                                    onChange={(e) => setTempWholesale(parseFloat(e.target.value) || 0)}
                                    className="w-16 sm:w-20 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg font-mono font-bold text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400">Stock</label>
                                  <input
                                    type="number"
                                    value={tempStock}
                                    onChange={(e) => setTempStock(parseInt(e.target.value, 10) || 0)}
                                    className="w-14 sm:w-16 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg font-mono font-bold text-white"
                                  />
                                </div>
                                <div className="flex items-center gap-1 self-end mt-1">
                                  <button
                                    onClick={() => handleSaveEdit(p)}
                                    className="p-1.5 sm:p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                                    title="Save Updates"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1.5 sm:p-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* DEDICATED EXPIRY DATE OPTION - ONLY SHOWN FOR NEAR EXPIRY SUPER DEALS */}
                              {(tempCategory === 'near_expiry' || p.category === 'near_expiry') && (
                                <div className="p-2.5 rounded-xl bg-gradient-to-r from-rose-950/70 to-slate-900 border border-rose-500/70 space-y-2">
                                  <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[11px]">
                                    <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                                    <span>Near Expiry Super Deals: Expiry Date & Clearance Pricing</span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div className="sm:col-span-2">
                                      <label className="block text-[10px] text-rose-200 font-semibold mb-0.5">
                                        Expiry Date / Best Before Timing <span className="text-rose-400">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={tempExpiryDate}
                                        onChange={(e) => setTempExpiryDate(e.target.value)}
                                        placeholder="e.g. Best before today (8 PM) or Oct 15"
                                        className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-rose-500/70 rounded-lg text-white font-medium focus:ring-1 focus:ring-rose-500"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[10px] text-rose-200 font-semibold mb-0.5">
                                        Original Price (QAR)
                                      </label>
                                      <input
                                        type="number"
                                        step="0.5"
                                        value={tempOriginalPrice}
                                        onChange={(e) => {
                                          const val = parseFloat(e.target.value) || 0;
                                          setTempOriginalPrice(val);
                                          if (val > tempPrice) {
                                            setTempDiscountPercent(Math.round(((val - tempPrice) / val) * 100));
                                          }
                                        }}
                                        className="w-full px-2 py-1 text-xs bg-slate-900 border border-rose-500/70 rounded-lg text-white font-mono"
                                      />
                                    </div>
                                  </div>

                                  {/* Quick shortcut pills */}
                                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                    <span className="text-[10px] text-slate-400">Quick set:</span>
                                    {[
                                      'Best before today (8 PM)',
                                      'Best before tomorrow',
                                      'Expires in 2 days',
                                      'Expires in 3 days',
                                      'Best within 48h',
                                    ].map((sc) => (
                                      <button
                                        key={sc}
                                        type="button"
                                        onClick={() => setTempExpiryDate(sc)}
                                        className="px-2 py-0.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[10px] rounded border border-rose-700/60 transition-colors"
                                      >
                                        {sc}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
                              <div className="text-left sm:text-right">
                                <span className="text-[10px] text-slate-400 block">Retail</span>
                                <span className="font-mono font-bold text-xs sm:text-sm text-white">
                                  {formatPrice(p.basePrice)}
                                </span>
                              </div>

                              <div className="text-left sm:text-right pl-2 sm:pl-3 border-l border-slate-800">
                                <span className="text-[10px] text-emerald-400 block">
                                  B2B
                                </span>
                                <span className="font-mono font-bold text-xs sm:text-sm text-emerald-400">
                                  {formatPrice(wholesaleVal)}
                                </span>
                              </div>

                              <div className="text-left sm:text-right pl-2 sm:pl-3 border-l border-slate-800">
                                <span className="text-[10px] text-slate-400 block">Stock</span>
                                <span className="font-mono font-bold text-xs text-slate-300">
                                  {p.stock}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 pl-1 sm:pl-3">
                                <button
                                  onClick={() => handleStartEdit(p)}
                                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                                  title="Edit Price & Stock"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteProduct(p.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB 2: ADD NEW PRODUCT */}
        {activeTab === 'add_product' && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 max-w-3xl">
            <div>
              <h2 className="text-lg font-bold font-['Outfit'] text-white">
                Add Produce to NasBaladna Store
              </h2>
              <p className="text-xs text-slate-400">
                Create new vegetables, fruits, dairy, or bakery products with portion weights, retail prices, and wholesale crates.
              </p>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Al Khor Sweet Corn"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id === 'near_expiry' ? '⚡ ' : ''}{c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Retail Price (QAR)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Base Weight / Portion
                  </label>
                  <input
                    type="text"
                    value={newBaseWeight}
                    onChange={(e) => setNewBaseWeight(e.target.value)}
                    placeholder="e.g. 500g, 1kg"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Wholesale Price for Business (QAR)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newWholesalePrice}
                    onChange={(e) => setNewWholesalePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Wholesale Crate Unit
                  </label>
                  <input
                    type="text"
                    value={newWholesaleUnit}
                    onChange={(e) => setNewWholesaleUnit(e.target.value)}
                    placeholder="e.g. 5kg Crate, 10kg Box"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Farm / Greenhouse Origin
                  </label>
                  <input
                    type="text"
                    value={newFarm}
                    onChange={(e) => setNewFarm(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* DEDICATED NEAR EXPIRY SUPER DEALS OPTIONS - ONLY SHOWN WHEN CATEGORY IS NEAR_EXPIRY */}
              {newCategory === 'near_expiry' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-amber-950/50 border-2 border-rose-500/70 space-y-3.5 ring-2 ring-rose-500/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-rose-400 fill-rose-400" />
                      <h4 className="text-sm font-bold text-white">
                        Near Expiry Super Deals Specifications
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black tracking-wider uppercase">
                      Only for Near Expiry Category
                    </span>
                  </div>
                  <p className="text-xs text-rose-200 leading-relaxed">
                    Mention the exact freshness expiration date and pre-discount pricing so customers know when to consume it and see their savings!
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-semibold text-rose-200">
                        Expiry Date & Timing <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newExpiryDate}
                        onChange={(e) => setNewExpiryDate(e.target.value)}
                        placeholder="e.g. Best before today or tomorrow (Oct 12)"
                        className="w-full px-3 py-2 bg-slate-900 border border-rose-500/60 rounded-xl text-white font-medium focus:ring-2 focus:ring-rose-500 text-xs"
                      />
                      {/* Shortcut buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-400">Quick set:</span>
                        {[
                          'Best before today (8 PM)',
                          'Best before tomorrow',
                          'Expires in 2 days',
                          'Expires in 3 days',
                          'Best within 48h',
                        ].map((sc) => (
                          <button
                            key={sc}
                            type="button"
                            onClick={() => setNewExpiryDate(sc)}
                            className="px-2 py-0.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[10px] rounded-md border border-rose-800 transition-colors"
                          >
                            {sc}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-rose-200">
                        Original Pre-Discount Price (QAR)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={newOriginalPrice}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setNewOriginalPrice(val);
                          if (val > newBasePrice) {
                            setNewDiscountPercent(Math.round(((val - newBasePrice) / val) * 100));
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-rose-500/60 rounded-xl text-white font-mono focus:ring-2 focus:ring-rose-500 text-xs"
                      />
                      <span className="text-[10px] text-rose-300 block">
                        Shows customer slashed price ({formatPrice(newOriginalPrice)} ➔ {formatPrice(newBasePrice)})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="admin_organic"
                  checked={newOrganic}
                  onChange={(e) => setNewOrganic(e.target.checked)}
                  className="rounded text-emerald-500 w-4 h-4"
                />
                <label htmlFor="admin_organic" className="font-semibold text-slate-300">
                  Certified Organic / Hydroponic Pesticide-Free
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Product to Store</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: MANAGE CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Helpful Category Images Guide Banner */}
            <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-800/40 rounded-3xl p-5 sm:p-6 text-white space-y-3 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base font-['Outfit'] text-white flex items-center gap-2">
                      <span>How to Add & Change Category Images in Your Website</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Visual Guide
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      You can add and update produce images on your website using 3 easy methods:
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => resetCategoriesToDefault()}
                  className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                  title="Restore default category cards and high-res photography"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Restore Default Photos</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Upload className="w-4 h-4" />
                    <span>1. Upload from Device</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Select any photo file (PNG, JPG, WEBP) from your phone or computer. It is saved directly to your store.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <ImageIcon className="w-4 h-4" />
                    <span>2. Curated Farm Presets</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Choose from 8 ready-to-use photography presets (Vegetables, Fruits, Dairy & Milk, Bakery, Herbs, Juices, Deals).
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-1">
                  <div className="flex items-center gap-2 text-sky-400 font-bold">
                    <LinkIcon className="w-4 h-4" />
                    <span>3. Web Image URL</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Paste any public image link from Unsplash, Shopify, or your cloud storage with instant live preview.
                  </p>
                </div>
              </div>
            </div>

            {/* Add Category Form Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold font-['Outfit'] text-white flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-emerald-400" />
                    <span>Create New Category with Custom Image</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Add new produce collections (e.g. Dates & Nuts, Farm Honey, Cold Pressed Juices). They will appear immediately on the customer homepage.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Category Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => {
                        setCatName(e.target.value);
                        if (!catId) {
                          setCatId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                        }
                      }}
                      placeholder="e.g. Fresh Dates & Nuts"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Category Slug / ID
                    </label>
                    <input
                      type="text"
                      value={catId}
                      onChange={(e) => setCatId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                      placeholder="e.g. dates_nuts"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Unique code for URL & filters
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Promo Badge (Optional)
                    </label>
                    <input
                      type="text"
                      value={catBadge}
                      onChange={(e) => setCatBadge(e.target.value)}
                      placeholder="e.g. NEW, 100% Organic, Deal"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Theme Color Accent
                    </label>
                    <select
                      value={catTheme}
                      onChange={(e) => setCatTheme(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="emerald">Emerald (Fresh Greens & Vegetables)</option>
                      <option value="amber">Amber (Harvest Gold & Fruits)</option>
                      <option value="rose">Rose (Clearance & Deal Deals)</option>
                      <option value="sky">Sky Blue (Farm Dairy & Chilled)</option>
                      <option value="stone">Stone (Warm Artisan Bakery)</option>
                      <option value="teal">Teal (Aromatic Herbs)</option>
                      <option value="orange">Orange (Citrus & Juices)</option>
                      <option value="purple">Purple (Exotic & Gourmet)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Description / Short Tagline
                    </label>
                    <input
                      type="text"
                      value={catDescription}
                      onChange={(e) => setCatDescription(e.target.value)}
                      placeholder="e.g. Sourced directly from local Qatar farms daily."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* CATEGORY IMAGE SELECTOR COMPONENT */}
                <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-4 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <span>Choose Category Image Source</span>
                    </label>

                    {/* Source Mode Tabs */}
                    <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setCatImageMode('preset')}
                        className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                          catImageMode === 'preset'
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Curated Presets</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCatImageMode('upload')}
                        className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                          catImageMode === 'upload'
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload File</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCatImageMode('url')}
                        className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                          catImageMode === 'url'
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Image URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Curated Presets Grid */}
                  {catImageMode === 'preset' && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-400">
                        Click any high-resolution produce photography preset:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {CATEGORY_IMAGE_PRESETS.map((preset) => {
                          const isSelected = catPresetId === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setCatPresetId(preset.id)}
                              className={`p-2 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                                isSelected
                                  ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 text-white'
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                              }`}
                            >
                              <img
                                src={preset.image}
                                alt={preset.name}
                                className="w-10 h-10 rounded-lg object-contain bg-slate-950 p-1 border border-slate-800 shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="block text-xs font-bold truncate">
                                  {preset.name}
                                </span>
                                <span className="text-[10px] text-slate-500 capitalize">
                                  {preset.categoryHint || preset.id}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Device File Upload */}
                  {catImageMode === 'upload' && (
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/80 rounded-2xl p-4 text-center transition-colors bg-slate-950/60">
                        <input
                          type="file"
                          id="cat_image_file_upload"
                          accept="image/png, image/jpeg, image/webp, image/svg+xml"
                          onChange={(e) => handleCategoryFileUpload(e, false)}
                          className="hidden"
                        />
                        <label
                          htmlFor="cat_image_file_upload"
                          className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="font-bold text-white text-xs block">
                              Click to choose an image from your device
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              Supports PNG, JPG, or WebP (up to 5MB)
                            </span>
                          </div>
                        </label>
                      </div>

                      {catUploadedImage && (
                        <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-2.5">
                          <img
                            src={catUploadedImage}
                            alt="Uploaded preview"
                            className="w-12 h-12 rounded-lg object-contain bg-slate-950 p-1 border border-slate-800 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-emerald-300 text-xs block">
                              Image File Loaded Ready!
                            </span>
                            <span className="text-[11px] text-slate-400 truncate block">
                              Saved as store asset upon submission
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCatUploadedImage('')}
                            className="p-1.5 text-slate-400 hover:text-rose-400"
                            title="Remove uploaded image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode 3: Custom Web URL */}
                  {catImageMode === 'url' && (
                    <div className="space-y-2">
                      <label className="block text-[11px] text-slate-400">
                        Direct Image URL (HTTP / HTTPS):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={catCustomImageUrl}
                          onChange={(e) => setCatCustomImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-... or your CDN"
                          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                        />
                        {catCustomImageUrl && (
                          <button
                            type="button"
                            onClick={() => setCatCustomImageUrl('')}
                            className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Tip: You can paste high-quality product images from Unsplash, Cloudinary, or any website image address.
                      </span>
                    </div>
                  )}

                  {/* Live Customer Card Mockup Preview */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-200 block">
                        Live Storefront Card Preview:
                      </span>
                      <span>How this category will look to customers on your website</span>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 shrink-0 self-start sm:self-auto">
                      <div
                        className={`w-36 rounded-xl p-2 border flex flex-col items-center text-center ${
                          THEME_CLASSES[catTheme]?.bg || 'bg-emerald-50/80'
                        } ${THEME_CLASSES[catTheme]?.border || 'border-emerald-200/60'}`}
                      >
                        {catBadge && (
                          <span className="self-end text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-600 text-white mb-1">
                            {catBadge}
                          </span>
                        )}
                        <div className="w-16 h-16 rounded-lg bg-white/90 p-1 flex items-center justify-center mb-1.5 shadow-xs">
                          <img
                            src={getResolvedNewCatImage()}
                            alt="Preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-900 truncate w-full">
                          {catName || 'Category Title'}
                        </span>
                        <span className="text-[10px] text-slate-500">0 varieties</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save & Add Category to Store</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* List of Existing Categories with Image Editing */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Existing Store Categories ({categories.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Active categories currently displayed on customer homepage and filters. Click <b>Edit</b> on any category to change its image or details.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {categories.map((cat) => {
                  const isEditing = editingCatId === cat.id;
                  const isProtected = cat.id === 'all';

                  return (
                    <div
                      key={cat.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-700 flex items-center justify-center p-1 relative group">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Boxes className="w-6 h-6 text-emerald-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="space-y-2.5 text-xs">
                              <div>
                                <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                                  Category Name
                                </label>
                                <input
                                  type="text"
                                  value={editingCatName}
                                  onChange={(e) => setEditingCatName(e.target.value)}
                                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium"
                                  placeholder="Category name"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                                  Promo Badge (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={editingCatBadge}
                                  onChange={(e) => setEditingCatBadge(e.target.value)}
                                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-[11px]"
                                  placeholder="e.g. 100% Fresh"
                                />
                              </div>

                              {/* IMAGE SELECTOR FOR EDIT MODE */}
                              <div className="pt-1 border-t border-slate-800 space-y-2">
                                <label className="text-[10px] text-emerald-400 font-semibold block">
                                  Change Category Image:
                                </label>

                                <div className="grid grid-cols-3 gap-1 text-[10px]">
                                  <button
                                    type="button"
                                    onClick={() => setEditingCatImageMode('preset')}
                                    className={`py-1 rounded px-1 text-center font-medium ${
                                      editingCatImageMode === 'preset'
                                        ? 'bg-emerald-600 text-white font-bold'
                                        : 'bg-slate-950 text-slate-400'
                                    }`}
                                  >
                                    Preset
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingCatImageMode('upload')}
                                    className={`py-1 rounded px-1 text-center font-medium ${
                                      editingCatImageMode === 'upload'
                                        ? 'bg-emerald-600 text-white font-bold'
                                        : 'bg-slate-950 text-slate-400'
                                    }`}
                                  >
                                    Upload
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingCatImageMode('url')}
                                    className={`py-1 rounded px-1 text-center font-medium ${
                                      editingCatImageMode === 'url'
                                        ? 'bg-emerald-600 text-white font-bold'
                                        : 'bg-slate-950 text-slate-400'
                                    }`}
                                  >
                                    URL
                                  </button>
                                </div>

                                {editingCatImageMode === 'preset' && (
                                  <select
                                    value={editingCatPresetId}
                                    onChange={(e) => {
                                      setEditingCatPresetId(e.target.value);
                                      const p = CATEGORY_IMAGE_PRESETS.find((pr) => pr.id === e.target.value);
                                      if (p) setEditingCatImage(p.image);
                                    }}
                                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-[11px]"
                                  >
                                    {CATEGORY_IMAGE_PRESETS.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.name}
                                      </option>
                                    ))}
                                  </select>
                                )}

                                {editingCatImageMode === 'upload' && (
                                  <div className="space-y-1">
                                    <input
                                      type="file"
                                      id={`cat_file_edit_${cat.id}`}
                                      accept="image/*"
                                      onChange={(e) => handleCategoryFileUpload(e, true)}
                                      className="hidden"
                                    />
                                    <label
                                      htmlFor={`cat_file_edit_${cat.id}`}
                                      className="block w-full py-1 text-center bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 cursor-pointer text-[11px] font-medium"
                                    >
                                      Choose File from Device
                                    </label>
                                  </div>
                                )}

                                {editingCatImageMode === 'url' && (
                                  <input
                                    type="url"
                                    value={editingCatCustomUrl}
                                    onChange={(e) => {
                                      setEditingCatCustomUrl(e.target.value);
                                      setEditingCatImage(e.target.value);
                                    }}
                                    placeholder="https://..."
                                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-[11px]"
                                  />
                                )}

                                {/* Preview of currently chosen image */}
                                {editingCatImage && (
                                  <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                                    <img
                                      src={editingCatImage}
                                      alt="Preview"
                                      className="w-8 h-8 rounded object-contain bg-slate-900 p-0.5"
                                    />
                                    <span className="text-[10px] text-emerald-400 font-medium truncate">
                                      New photo selected
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditCategory(cat.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                                >
                                  Save All
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCatId(null)}
                                  className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-bold text-white text-sm truncate">
                                  {cat.name}
                                </h4>
                                {cat.badge && (
                                  <span className="text-[10px] font-bold text-rose-300 bg-rose-950/80 px-1.5 py-0.2 rounded border border-rose-800">
                                    {cat.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-mono text-emerald-400 block mt-0.5">
                                slug: {cat.id}
                              </span>
                              <span className="text-xs text-slate-400 mt-1 block">
                                {cat.itemCount} active {cat.itemCount === 1 ? 'product' : 'products'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {!isEditing && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                          <button
                            type="button"
                            onClick={() => handleStartEditCategory(cat)}
                            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Details & Image</span>
                          </button>

                          {!isProtected && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                                  deleteCategory(cat.id);
                                }
                              }}
                              className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: DELIVERY DRIVER & WHATSAPP DISPATCH */}
        {activeTab === 'delivery_driver' && (
          <div className="space-y-6">
            {/* Live Active Courier Card */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center font-extrabold text-emerald-400 text-2xl shadow-inner font-['Outfit']">
                    {deliveryDriver.name
                      ? deliveryDriver.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase()
                      : 'NB'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold font-['Outfit'] text-white">
                        {deliveryDriver.name || 'Courier Name'}
                      </h3>
                      <span className="text-xs font-semibold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
                        ★ {deliveryDriver.rating} Verified Driver
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                          deliveryDriver.status === 'active'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            : deliveryDriver.status === 'on_delivery'
                            ? 'bg-amber-950 text-amber-300 border-amber-700'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            deliveryDriver.status === 'active'
                              ? 'bg-emerald-400 animate-ping'
                              : 'bg-amber-400'
                          }`}
                        />
                        <span>
                          {deliveryDriver.status === 'active'
                            ? 'Active & On Duty'
                            : deliveryDriver.status === 'on_delivery'
                            ? 'Out on Delivery'
                            : 'Off Duty'}
                        </span>
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{deliveryDriver.vehicle}</span>
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="font-mono text-slate-300">
                        Plate: <strong className="text-white">{deliveryDriver.plateNumber}</strong>
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{deliveryDriver.phone}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Test WhatsApp Button */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`https://wa.me/${deliveryDriver.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${deliveryDriver.name}, testing WhatsApp driver connection from NasBaladna Admin Console.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-transform hover:scale-105 active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Test Driver WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Edit Driver Details Form */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Update Delivery Driver & WhatsApp Details</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Update the courier assigned to customer orders and customer live delivery tracking.
                </p>
              </div>

              <form onSubmit={handleSaveDriver} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Driver Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="e.g. Mohamed Tariq"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Driver WhatsApp / Mobile Phone <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="e.g. +974 7731 5415 or +974 5512 8990"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Include Qatar country code (+974) so WhatsApp direct links connect automatically.
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Vehicle Type & Climate Specs
                    </label>
                    <input
                      type="text"
                      value={driverVehicle}
                      onChange={(e) => setDriverVehicle(e.target.value)}
                      placeholder="e.g. Temperature-Controlled Van (Chilled 4°C)"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Vehicle Plate Number
                    </label>
                    <input
                      type="text"
                      value={driverPlate}
                      onChange={(e) => setDriverPlate(e.target.value)}
                      placeholder="e.g. QA-58219"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Driver Duty Status
                    </label>
                    <select
                      value={driverStatus}
                      onChange={(e) => setDriverStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="active">Active & Available (Assigned to new orders)</option>
                      <option value="on_delivery">Out on Active Delivery Run</option>
                      <option value="off_duty">Off Duty / Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Store Dispatch WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={driverDispatchWhatsApp}
                      onChange={(e) => setDriverDispatchWhatsApp(e.target.value)}
                      placeholder="e.g. +974 7731 5415"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Courier Delivery Notes & Equipment
                  </label>
                  <textarea
                    rows={2}
                    value={driverNotes}
                    onChange={(e) => setDriverNotes(e.target.value)}
                    placeholder="e.g. Equipped with active cold box, digital thermometer calibrated to 4°C, certified Qatar cold chain handler."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Driver & WhatsApp Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateDeliveryDriver({
                        name: 'Mohamed Tariq',
                        phone: '+974 7731 5415',
                        vehicle: 'Temperature-Controlled Van (Chilled 4°C)',
                        plateNumber: 'QA-58219',
                        rating: 4.9,
                        status: 'active',
                        dispatchWhatsApp: '+974 7731 5415',
                        notes: 'Refrigerated van equipped with active thermometer, certified Qatar cold chain handler.',
                      });
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restore Default Driver</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Workflow Guide Info Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>How Driver WhatsApp Integration Works:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                  <strong className="text-emerald-400 block font-mono">1. Order Placement</strong>
                  <p className="text-slate-400 text-[11px]">
                    Every customer order automatically registers this driver name, phone, vehicle, and license plate.
                  </p>
                </div>
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                  <strong className="text-emerald-400 block font-mono">2. Live Order Tracking</strong>
                  <p className="text-slate-400 text-[11px]">
                    Customers see the driver card with a direct green "WhatsApp Driver" button and phone number.
                  </p>
                </div>
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                  <strong className="text-emerald-400 block font-mono">3. One-Click Chat</strong>
                  <p className="text-slate-400 text-[11px]">
                    Clicking opens WhatsApp with pre-filled order ID and delivery address for immediate driver coordination.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'bulk' && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6">
            {/* Header & Sub-Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold font-['Outfit'] text-white">
                    Bulk Add Products & Photo Asset Studio
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-rose-400 fill-rose-400" />
                    <span>10 Columns: Expiry Dates & Images</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Import multiple products at once with custom image URLs, uploaded photos, and freshness expiration dates for Near Expiry Super Deals!
                </p>
              </div>

              {/* Sub-Tabs Selector */}
              <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setBulkActiveSubTab('editor')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                    bulkActiveSubTab === 'editor'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>CSV Editor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkActiveSubTab('preview')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                    bulkActiveSubTab === 'preview'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visual Preview ({parsedBulkRows.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkActiveSubTab('images')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                    bulkActiveSubTab === 'images'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Uploaded Photos ({Object.keys(bulkUploadedImages).length})</span>
                </button>
              </div>
            </div>

            {/* CURATED IMAGE PRESETS BAR - Easy Copy/Insert */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Quick Image Preset Keywords (Click to copy keyword for CSV):</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Paste keyword into the 8th column (<code className="text-emerald-400 font-mono">ImageUrl</code>)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {CATEGORY_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(preset.id);
                      showToast(`Copied preset "${preset.id}" to clipboard!`);
                    }}
                    className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 hover:bg-slate-900 text-left transition-all group flex flex-col items-center gap-1.5"
                    title={`Click to copy "${preset.id}" preset keyword`}
                  >
                    <img
                      src={preset.image}
                      alt={preset.name}
                      className="w-10 h-10 rounded-lg object-contain bg-slate-900 p-0.5 border border-slate-800"
                    />
                    <div className="text-center w-full">
                      <span className="block text-[10px] font-bold text-white truncate">{preset.name}</span>
                      <span className="block text-[9px] font-mono text-emerald-400 font-bold group-hover:underline">
                        {preset.id}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SUB-TAB 1: CSV EDITOR */}
            {bulkActiveSubTab === 'editor' && (
              <div className="space-y-4">
                {/* NEAR EXPIRY SUPER DEALS CSV INSTRUCTION & TEMPLATE GUIDE CARD */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-rose-400 fill-rose-400 shrink-0" />
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        Near Expiry Super Deals: How to Mention Expiry Date in CSV
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-rose-600/90 text-white text-[10px] font-extrabold uppercase">
                        Zero Food Waste Clearance
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadNearExpiryCsvTemplate}
                        className="px-2.5 py-1.5 bg-rose-900/80 hover:bg-rose-800 text-rose-100 rounded-lg text-xs font-semibold border border-rose-700/60 flex items-center gap-1.5 transition-colors"
                        title="Download pre-filled CSV template formatted for Near Expiry Super Deals"
                      >
                        <Download className="w-3.5 h-3.5 text-rose-300" />
                        <span>Download Near Expiry Template</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleLoadNearExpirySample}
                        className="px-2.5 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-200 rounded-lg text-xs font-semibold border border-amber-800/60 flex items-center gap-1.5 transition-colors"
                        title="Fill the CSV editor below with Near Expiry products and expiry dates"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Load Near Expiry Sample Batch</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    To bulk add items to <strong className="text-rose-300 font-bold">Near Expiry Super Deals</strong> with clear freshness expiration dates and discounted pricing, format your CSV columns like this:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-[11px]">
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                      <span className="font-mono text-emerald-400 font-bold block mb-1">Column 2: Category</span>
                      <code className="text-rose-300 font-bold bg-rose-950/60 px-1 py-0.5 rounded">near_expiry</code>
                      <p className="text-slate-400 text-[10px] mt-1">Routes product directly to the Near Expiry Super Deals section on your website.</p>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                      <span className="font-mono text-emerald-400 font-bold block mb-1">Column 3: Price</span>
                      <code className="text-emerald-300 font-bold bg-emerald-950/60 px-1 py-0.5 rounded">6.5</code>
                      <p className="text-slate-400 text-[10px] mt-1">The special clearance deal price in QAR that the customer pays.</p>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-rose-500/30 bg-rose-950/20">
                      <span className="font-mono text-rose-300 font-bold block mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-rose-400" /> Column 9: ExpiryDate
                      </span>
                      <code className="text-rose-200 font-bold bg-rose-950/80 px-1 py-0.5 rounded block truncate">Best before today (8 PM)</code>
                      <p className="text-slate-400 text-[10px] mt-1">Mention: <em>Expires in 2 days</em>, <em>Best before tomorrow</em>, <em>Oct 14</em>.</p>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20">
                      <span className="font-mono text-amber-300 font-bold block mb-1">Column 10: OriginalPrice</span>
                      <code className="text-amber-200 font-bold bg-amber-950/80 px-1 py-0.5 rounded">14.0</code>
                      <p className="text-slate-400 text-[10px] mt-1">Pre-discount price. Shows slashed price &amp; calculates <strong>54% OFF</strong> badge!</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400">
                      Pro Tip: Leave ExpiryDate and OriginalPrice blank for normal produce (<code className="text-emerald-400 font-mono">vegetables, fruits, dairy, bakery, herbs</code>).
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const example =
                          `Name, Category, Price, Stock, Weight, WholesalePrice, WholesaleUnit, ImageUrl, ExpiryDate, OriginalPrice\n` +
                          `Local Organic Strawberries 250g, near_expiry, 6.5, 20, 250g, 35, 2kg Crate, fruits, Best before today 8 PM, 14.0\n` +
                          `Fresh Full Cream Milk 1L, near_expiry, 4.0, 30, 1L, 25, 6 Bottles, dairy, Best before tomorrow, 8.5\n` +
                          `Artisanal Sourdough Boule, near_expiry, 5.0, 15, 500g, 30, 6 Loaves, bakery, Expires in 2 days, 11.0`;
                        navigator.clipboard.writeText(example);
                        showToast('Copied Near Expiry CSV example to clipboard!');
                      }}
                      className="text-[11px] text-rose-300 hover:text-white font-semibold flex items-center gap-1 underline"
                    >
                      <span>Copy Near Expiry CSV format example</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                    <strong className="text-emerald-400">CSV Columns:</strong> Name, Category, Price, Stock, Weight, WholesalePrice, WholesaleUnit, <span className="text-amber-400 underline font-bold">ImageUrl</span>, <span className="text-rose-400 underline font-bold">ExpiryDate</span>, <span className="text-rose-400 underline font-bold">OriginalPrice</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadCsvTemplate}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Download template CSV with ExpiryDate and ImageUrl column for Excel or Google Sheets"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>General Template</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => bulkFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Upload photos from computer to auto-match with your products"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Upload Photos ({Object.keys(bulkUploadedImages).length})</span>
                    </button>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={9}
                    value={bulkCsvText}
                    onChange={(e) => setBulkCsvText(e.target.value)}
                    className="w-full p-3 font-mono text-xs border border-slate-700 rounded-xl bg-slate-900 text-slate-100 focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                    placeholder="Name, Category, Price, Stock, Weight, WholesalePrice, WholesaleUnit, ImageUrl, ExpiryDate, OriginalPrice..."
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>
                      {parsedBulkRows.length} valid product row{parsedBulkRows.length === 1 ? '' : 's'} detected in spreadsheet (
                      {parsedBulkRows.filter((r) => r.isNearExpiry).length} Near Expiry Deals with dates)
                    </span>
                    <span className="text-slate-400">
                      Supports web URLs (<code className="text-emerald-300 font-mono">https://...</code>), preset keywords (<code className="text-emerald-300 font-mono">vegetables</code>), or uploaded photos
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleProcessBulkCsv}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import All {parsedBulkRows.length} Products to Store</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkActiveSubTab('preview')}
                    className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Review Photos & Rows ({parsedBulkRows.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadNearExpirySample}
                    className="px-4 py-2.5 bg-rose-950/70 hover:bg-rose-900 text-rose-200 font-semibold text-xs rounded-xl border border-rose-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 text-rose-400" />
                    <span>Load Near Expiry Sample Batch</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadStandardSample}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-slate-800 transition-colors"
                  >
                    Load Standard Sample Batch
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: VISUAL PREVIEW TABLE */}
            {bulkActiveSubTab === 'preview' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <span>Visual Pre-Import Inspection ({parsedBulkRows.length} Products)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Inspect and edit photos, expiration dates, and discount rates before importing. Click any row photo to replace or upload!
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkActiveSubTab('editor')}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Back to CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleProcessBulkCsv}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Confirm & Import All</span>
                    </button>
                  </div>
                </div>

                {parsedBulkRows.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 rounded-2xl border border-slate-800">
                    No products detected in CSV editor. Switch to the CSV editor to add rows.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] font-semibold uppercase">
                        <tr>
                          <th className="p-3 w-10 text-center">#</th>
                          <th className="p-3 w-20">Photo</th>
                          <th className="p-3">Product Name</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Deal / Price</th>
                          <th className="p-3">Stock &amp; Weight</th>
                          <th className="p-3 min-w-[210px]">Expiry Date (Near Expiry)</th>
                          <th className="p-3 min-w-[130px]">Pre-Discount &amp; % Off</th>
                          <th className="p-3 text-right">Photo Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {parsedBulkRows.map((row) => (
                          <tr
                            key={row.index}
                            className={`transition-colors ${
                              row.isNearExpiry
                                ? 'bg-rose-950/20 hover:bg-rose-950/30'
                                : 'hover:bg-slate-850/60'
                            }`}
                          >
                            <td className="p-3 text-center text-slate-500 font-mono text-[11px]">{row.index}</td>
                            <td className="p-3">
                              <div className="relative group w-14 h-14 rounded-xl bg-slate-950 p-1 border border-slate-800 flex items-center justify-center overflow-hidden">
                                <img
                                  src={row.resolvedImage}
                                  alt={row.name}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    // fallback if broken URL was given
                                    (e.target as HTMLImageElement).src = categoryVegImg;
                                  }}
                                />
                                {bulkRowImageOverrides[row.index] && (
                                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
                                )}
                              </div>
                            </td>
                            <td className="p-3 font-bold text-white">
                              <div>{row.name}</div>
                              {row.rawImage && (
                                <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[140px]">
                                  src: {row.rawImage}
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              {row.isNearExpiry ? (
                                <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1 w-fit shadow-2xs">
                                  <Zap className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                                  <span>near_expiry</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md capitalize font-mono text-[10px] font-bold bg-slate-950 text-emerald-400 border border-slate-800">
                                  {row.category}
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-mono font-bold text-emerald-400">
                              {formatPrice(row.price)}
                            </td>
                            <td className="p-3">
                              <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 font-mono text-[11px] font-bold block w-fit">
                                {row.stock} in stock
                              </span>
                              <span className="text-[11px] text-slate-400 block mt-0.5">{row.weight}</span>
                            </td>
                            {/* EXPIRY DATE COLUMN */}
                            <td className="p-3">
                              {row.isNearExpiry ? (
                                <div className="space-y-1.5 max-w-[210px]">
                                  <div className="flex items-center gap-1.5 bg-slate-950 border border-rose-500/50 rounded-lg px-2 py-1">
                                    <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                    <input
                                      type="text"
                                      value={row.expiryDate}
                                      onChange={(e) =>
                                        setBulkRowExpiryOverrides((prev) => ({
                                          ...prev,
                                          [row.index]: e.target.value,
                                        }))
                                      }
                                      placeholder="e.g. Best before tomorrow"
                                      className="w-full bg-transparent text-[11px] text-rose-200 font-medium focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {['Today 8 PM', 'Tomorrow', 'In 2 days', 'In 3 days'].map((pill) => (
                                      <button
                                        key={pill}
                                        type="button"
                                        onClick={() =>
                                          setBulkRowExpiryOverrides((prev) => ({
                                            ...prev,
                                            [row.index]: pill.startsWith('In')
                                              ? `Expires ${pill.toLowerCase()}`
                                              : `Best before ${pill.toLowerCase()}`,
                                          }))
                                        }
                                        className="px-1.5 py-0.5 rounded text-[9px] bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 transition-colors"
                                      >
                                        {pill}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-500 text-[11px] italic">— (Standard)</span>
                              )}
                            </td>
                            {/* PRE-DISCOUNT & % OFF COLUMN */}
                            <td className="p-3">
                              {row.isNearExpiry ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-slate-400">Was:</span>
                                    <input
                                      type="number"
                                      step="0.5"
                                      value={row.originalPrice || ''}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setBulkRowOriginalPriceOverrides((prev) => ({
                                          ...prev,
                                          [row.index]: val,
                                        }));
                                      }}
                                      className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-white text-right"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-bold text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800 flex items-center gap-0.5">
                                      <Zap className="w-2.5 h-2.5 fill-rose-400" />
                                      <span>{row.discountPercent}% OFF</span>
                                    </span>
                                    {row.originalPrice > row.price && (
                                      <span className="text-[10px] text-slate-500 line-through font-mono">
                                        {formatPrice(row.originalPrice)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-500 text-[11px] italic">—</span>
                              )}
                            </td>
                            {/* PHOTO ACTION */}
                            <td className="p-3 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                {/* Choose preset dropdown for this row */}
                                <select
                                  value=""
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val) {
                                      const preset = CATEGORY_IMAGE_PRESETS.find((p) => p.id === val);
                                      if (preset) {
                                        setBulkRowImageOverrides((prev) => ({
                                          ...prev,
                                          [row.index]: preset.image,
                                        }));
                                        showToast(`Attached ${preset.name} to ${row.name}`);
                                      }
                                    }
                                  }}
                                  className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 focus:ring-1 focus:ring-emerald-500"
                                >
                                  <option value="">Presets...</option>
                                  {CATEGORY_IMAGE_PRESETS.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name}
                                    </option>
                                  ))}
                                </select>

                                {/* Direct Photo Upload button for this row */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBulkSelectedRowForImage(row.index);
                                    bulkSingleRowFileInputRef.current?.click();
                                  }}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                                  title={`Upload image file for ${row.name}`}
                                >
                                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 3: UPLOADED PHOTOS MANAGER */}
            {bulkActiveSubTab === 'images' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <span>Device Photo Asset Library ({Object.keys(bulkUploadedImages).length} images)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Upload multiple product photos from your device at once. They will automatically pair with your products by filename!
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => bulkFileInputRef.current?.click()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upload More Photos</span>
                    </button>

                    {Object.keys(bulkUploadedImages).length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setBulkUploadedImages({});
                          setBulkRowImageOverrides({});
                          showToast('Cleared uploaded photo library');
                        }}
                        className="px-3 py-2 bg-slate-900 hover:bg-rose-950/70 text-slate-400 hover:text-rose-300 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
                      >
                        Clear All Photos
                      </button>
                    )}
                  </div>
                </div>

                {Object.keys(bulkUploadedImages).length === 0 ? (
                  <div
                    onClick={() => bulkFileInputRef.current?.click()}
                    className="p-10 border-2 border-dashed border-slate-800 hover:border-emerald-500/60 rounded-3xl text-center bg-slate-900/40 cursor-pointer transition-colors space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-emerald-400 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Click or Drag & Drop Photos Here</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Supports PNG, JPG, WEBP. Select multiple files at once.
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 bg-emerald-950 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-800">
                      Select Files From Computer
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {Object.entries(bulkUploadedImages)
                      // Filter duplicates caused by both raw and base keys
                      .filter((entry, idx, self) => self.findIndex((e) => e[1].dataUrl === entry[1].dataUrl) === idx)
                      .map(([key, item]) => (
                        <div
                          key={key}
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 space-y-2 relative group"
                        >
                          <div className="w-full aspect-square rounded-xl bg-slate-950 p-1 flex items-center justify-center overflow-hidden">
                            <img src={item.dataUrl} alt={item.filename} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <span className="block text-[11px] font-bold text-white truncate" title={item.filename}>
                              {item.filename}
                            </span>
                            <span className="block text-[10px] text-emerald-400 font-mono truncate">
                              key: {key}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const next = { ...bulkUploadedImages };
                              delete next[key];
                              setBulkUploadedImages(next);
                            }}
                            className="absolute top-1 right-1 p-1 bg-slate-900/90 text-slate-400 hover:text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove this photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Hidden Input: Multi-File Bulk Upload */}
            <input
              type="file"
              ref={bulkFileInputRef}
              multiple
              accept="image/*"
              onChange={handleBulkImageFilesUpload}
              className="hidden"
            />

            {/* Hidden Input: Single-Row Individual Photo Upload */}
            <input
              type="file"
              ref={bulkSingleRowFileInputRef}
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && bulkSelectedRowForImage !== null) {
                  handleRowImageFileUpload(bulkSelectedRowForImage, file);
                }
                if (e.target) e.target.value = '';
              }}
              className="hidden"
            />
          </div>
        )}

        {/* TAB 4: ORDERS & FULFILLMENT MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
            {/* Orders Header & Live Reception Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold font-['Outfit'] text-white">
                    Live Customer Orders & Kitchen Dispatch
                  </h2>
                  {unreadOrdersCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                      {unreadOrdersCount} NEW
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time monitor for orders placed on the website. Receive instant audio chimes and WhatsApp alerts.
                </p>
              </div>

              {/* Live Reception Alert Settings */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Audio Chime Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !adminAlertSoundEnabled;
                    setAdminAlertSoundEnabled(next);
                    if (next) {
                      playOrderAlertChime();
                      showToast('🔊 Live Order Chime Enabled (Sample played)');
                    } else {
                      showToast('🔕 Order Chime Muted');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    adminAlertSoundEnabled
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                  title="Toggle audio alert chime when website customers submit orders"
                >
                  {adminAlertSoundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" />
                  )}
                  <span>Chime: {adminAlertSoundEnabled ? 'ON' : 'OFF'}</span>
                </button>

                {/* Test Sound Button */}
                <button
                  type="button"
                  onClick={() => {
                    playOrderAlertChime();
                    showToast('Playing sample order alert chime 🎵');
                  }}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
                  title="Test audio chime volume"
                >
                  <BellRing className="w-3 h-3 text-emerald-400" />
                  <span>Test Chime</span>
                </button>

                {/* Desktop Push Notification Permission */}
                <button
                  type="button"
                  onClick={handleEnableDesktopNotifications}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    desktopNotifGranted
                      ? 'bg-sky-950/70 text-sky-300 border border-sky-800/80'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-850'
                  }`}
                  title="Enable desktop notifications so you get alerted even if browser is in another tab"
                >
                  <Radio className={`w-3.5 h-3.5 ${desktopNotifGranted ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>Desktop Alerts: {desktopNotifGranted ? 'Active' : 'Enable'}</span>
                </button>

                {/* Acknowledge / Clear Unread */}
                {unreadOrdersCount > 0 && (
                  <button
                    type="button"
                    onClick={markOrdersAsRead}
                    className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Acknowledge All</span>
                  </button>
                )}
              </div>
            </div>

            {/* Delivery & Fleet Fulfillment Quick Dispatch Hub */}
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-800/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Fleet Dispatch & Driver Route Manifest</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 text-[10px] font-mono font-bold">
                      {deliveryDriver.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Assigned Courier: <strong className="text-white">{deliveryDriver.name}</strong> · {deliveryDriver.vehicle} ({deliveryDriver.plateNumber})
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Launch Fleet Run-Sheet Modal */}
                <button
                  type="button"
                  onClick={() => setIsDriverManifestModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow-md"
                  title="Open live interactive driver manifest run sheet"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open Driver Run-Sheet ({ordersHistory.length} Stops)</span>
                </button>

                {/* Export Driver CSV */}
                <button
                  type="button"
                  onClick={handleExportDriverManifestCsv}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                  title="Export clean driver manifest CSV with GPS links and item checklists"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export Manifest (CSV)</span>
                </button>

                {/* Send Run Sheet to Driver WhatsApp */}
                <button
                  type="button"
                  onClick={handleDispatchDriverFleetWhatsApp}
                  className="px-3 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm"
                  title="Send complete formatted delivery route to driver on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp Driver Run</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
                  orderFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                All Orders ({ordersHistory.length})
              </button>

              <button
                type="button"
                onClick={() => setOrderFilter('unread')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  orderFilter === 'unread'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : unreadOrdersCount > 0
                    ? 'bg-rose-950/70 text-rose-300 border border-rose-800/80'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Bell className="w-3 h-3" />
                <span>New Unread ({unreadOrdersCount})</span>
              </button>

              {(['confirmed', 'packing', 'on_the_way', 'delivered'] as OrderStatus[]).map((st) => {
                const count = ordersHistory.filter((o) => o.status === st).length;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-colors whitespace-nowrap ${
                      orderFilter === st
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'on_the_way' ? 'On Route' : st} ({count})
                  </button>
                );
              })}
            </div>

            {/* Orders Feed */}
            {ordersHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No orders placed yet. Place a test order in the customer store to view management controls.
              </div>
            ) : (
              <div className="space-y-3">
                {ordersHistory
                  .filter((ord, idx) => {
                    if (orderFilter === 'all') return true;
                    if (orderFilter === 'unread') return idx < unreadOrdersCount;
                    return ord.status === orderFilter;
                  })
                  .map((ord, idx) => {
                    const isNewOrder = idx < unreadOrdersCount || ord.id === latestReceivedOrder?.id;
                    const coords = ord.coordinates || getDistrictCoordinates(ord.district);
                    const navUrl = ord.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
                    const isExpress = ord.isExpress || ord.serviceType === 'express';
                    const isEco = ord.serviceType === 'eco_green';

                    return (
                      <div
                        key={ord.id}
                        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs transition-all ${
                          isNewOrder
                            ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/80 ring-2 ring-rose-500/20 shadow-lg'
                            : isExpress
                            ? 'bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 border-amber-500/40 ring-1 ring-amber-500/20'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white text-sm">#{ord.orderNumber}</span>

                            {isNewOrder && (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-600 text-white animate-pulse flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                <span>NEW ORDER</span>
                              </span>
                            )}

                            {isExpress && (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                <Zap className="w-3 h-3 fill-current" />
                                <span>EXPRESS 60-MIN</span>
                              </span>
                            )}

                            {isEco && (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <Leaf className="w-3 h-3" />
                                <span>ECO BATCH</span>
                              </span>
                            )}

                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                              {ord.status.replace('_', ' ')}
                            </span>
                            <span className="text-slate-400">· {ord.createdAt}</span>

                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {ord.paymentMethod.toUpperCase()} · {ord.paymentStatus === 'paid' ? 'PAID' : 'DUE ON ARRIVAL'}
                            </span>
                          </div>

                          <div className="text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>
                              <strong>Customer:</strong> {ord.customerName}
                            </span>
                            <a
                              href={`tel:${ord.phone}`}
                              className="text-emerald-400 hover:underline font-mono"
                            >
                              {ord.phone}
                            </a>
                            <span className="text-slate-500">·</span>
                            <span>
                              <strong>Area:</strong> {ord.district}
                            </span>
                          </div>

                          <div className="text-slate-400">
                            <strong>Address:</strong> {ord.address} · <strong>Slot:</strong> {ord.deliverySlot}
                            {ord.bluePlateInfo && (
                              <span className="block text-sky-400 font-mono text-[11px] mt-0.5">
                                Qatar Blue Plate: Zone {ord.bluePlateInfo.zone} · Street {ord.bluePlateInfo.street} · Building {ord.bluePlateInfo.building}
                              </span>
                            )}
                          </div>

                          {/* Dropoff Preferences & Notes */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px]">
                            {ord.dropoffPreference === 'doorstep' && (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                                🚪 Leave at Doorstep
                              </span>
                            )}
                            {ord.dropoffPreference === 'security' && (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                                🏢 Leave with Security
                              </span>
                            )}
                            {ord.doorbellPreference === 'silent' && (
                              <span className="px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800">
                                🔕 Silent Drop (No Bell)
                              </span>
                            )}
                            {ord.deliveryNotes && (
                              <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800 truncate max-w-sm">
                                📝 {ord.deliveryNotes}
                              </span>
                            )}
                          </div>

                          <div className="text-slate-300 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                            <strong className="text-slate-400">Harvest Basket:</strong>{' '}
                            {ord.items.map((i) => `${i.product.name} (${i.selectedWeight}) x${i.quantity}`).join(', ')}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-left md:text-right">
                            <span className="text-slate-400 block text-[10px]">Total Amount</span>
                            <span className="text-base font-bold font-mono text-emerald-400">
                              {formatPrice(ord.total)}
                            </span>
                          </div>

                          {/* Action Buttons: Status changer + Alerts + Receipt */}
                          <div className="flex flex-col items-start md:items-end gap-2 w-full sm:w-auto">
                            {/* Status changer buttons */}
                            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                              {(['confirmed', 'packing', 'on_the_way', 'delivered'] as OrderStatus[]).map(
                                (st) => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => updateOrderStatus(ord.id, st)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize transition-colors ${
                                      ord.status === st
                                        ? 'bg-emerald-600 text-white'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    {st === 'on_the_way' ? 'On Route' : st}
                                  </button>
                                )
                              )}
                            </div>

                            {/* Direct notification & routing triggers */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Direct Google Maps Turn-by-Turn Nav Link */}
                              <a
                                href={navUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition-transform active:scale-95 text-[11px] font-bold flex items-center gap-1"
                                title="Open turn-by-turn navigation in Google Maps"
                              >
                                <Navigation className="w-3.5 h-3.5" />
                                <span>GPS Route</span>
                              </a>

                              {/* Send to Admin's own WhatsApp (+974 7731 5415) */}
                              <button
                                type="button"
                                onClick={() => sendAdminOrderAlertWhatsApp(ord)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-transform active:scale-95 text-[11px] font-bold flex items-center gap-1"
                                title="Send order invoice & packaging details to Admin WhatsApp (+974 7731 5415)"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-current text-emerald-400" />
                                <span className="hidden xl:inline">Alert</span>
                              </button>

                              {/* WhatsApp Customer */}
                              <a
                                href={NotificationService.getWhatsAppUrl(
                                  ord.phone,
                                  NotificationService.buildWhatsAppMessage(ord)
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg transition-transform active:scale-95 text-[11px] font-bold flex items-center gap-1"
                                title="Send WhatsApp Order Update directly to customer"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                <span className="hidden xl:inline">Customer</span>
                              </a>

                              {/* SMS Customer */}
                              <a
                                href={NotificationService.getSmsUrl(
                                  ord.phone,
                                  NotificationService.buildSmsMessage(ord)
                                )}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-transform active:scale-95 text-[11px] font-bold flex items-center gap-1"
                                title="Send SMS Order Update to customer"
                              >
                                <Send className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="hidden xl:inline">SMS</span>
                              </a>

                              {/* Print Official Receipt / Kitchen Ticket */}
                              <button
                                type="button"
                                onClick={() => setSelectedReceiptOrder(ord)}
                                className="p-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg transition-transform active:scale-95 text-[11px] font-bold flex items-center gap-1"
                                title="View & Print Official Customer Receipt / Tax Invoice"
                              >
                                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Receipt</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: INVENTORY AUDIT LEDGER */}
        {activeTab === 'inventory' && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold font-['Outfit'] text-white">
                Real-Time Stock Audit Activity Log
              </h2>
              <p className="text-xs text-slate-400">
                Automated cold warehouse ledger tracking all customer purchases, admin restocks, and audits.
              </p>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800 bg-slate-900/50">
              {inventoryLogs.map((log) => (
                <div key={log.id} className="p-3 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">{log.productName}</span>
                    <span className="text-[11px] text-slate-400">
                      Reason: {log.reason.replace('_', ' ')} · Timestamp: {log.timestamp}
                    </span>
                  </div>

                  <div className="text-right font-mono">
                    <span
                      className={`font-bold ${
                        log.change > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {log.change > 0 ? `+${log.change}` : log.change} units
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      New Stock: {log.newStock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: ADMIN PASSWORD & CREDENTIALS SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Security Overview Header */}
            <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border border-amber-800/40 rounded-3xl p-5 sm:p-6 text-white space-y-3 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-['Outfit'] text-white flex items-center gap-2">
                      <span>Administrator Password & Security Settings</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Protected Console
                      </span>
                    </h2>
                    <p className="text-xs text-slate-300">
                      Update your administrator master password to protect store prices, catalog updates, delivery drivers, and order management.
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block">Active Admin User:</span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    admin / nasbaladna
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Change Password Form (2 cols) */}
              <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Change Admin Password</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter your existing password followed by your chosen new password. Changes take effect immediately.
                  </p>
                </div>

                {passwordChangeSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                    <div>
                      <p className="font-bold">{passwordChangeSuccess}</p>
                      <p className="text-[11px] text-emerald-400/80 mt-0.5">
                        Please save your new password in a safe password manager or note.
                      </p>
                    </div>
                  </div>
                )}

                {passwordChangeError && (
                  <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-700/60 text-rose-300 text-xs flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
                    <div>
                      <p className="font-bold">{passwordChangeError}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs">
                  {/* Current Password */}
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">
                      Current Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        required
                        value={currentPassInput}
                        onChange={(e) => setCurrentPassInput(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">
                      New Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        value={newPassInput}
                        onChange={(e) => setNewPassInput(e.target.value)}
                        placeholder="Enter your new secure password (min 4 chars)"
                        className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {newPassInput && (
                      <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                        <span className="text-slate-400">Password Strength:</span>
                        <span
                          className={`font-bold ${
                            newPassInput.length >= 8
                              ? 'text-emerald-400'
                              : newPassInput.length >= 6
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {newPassInput.length >= 8 ? 'Strong' : newPassInput.length >= 6 ? 'Medium' : 'Short'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">
                      Confirm New Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        required
                        value={confirmPassInput}
                        onChange={(e) => setConfirmPassInput(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassInput && (
                      <div className="mt-1 text-[11px]">
                        {newPassInput === confirmPassInput ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Passwords match
                          </span>
                        ) : (
                          <span className="text-rose-400 font-semibold">
                            Passwords do not match
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isUpdatingPassword ? (
                        <span>Updating Password...</span>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save New Password</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            'Are you sure you want to reset the admin password back to default "admin"?'
                          )
                        ) {
                          resetAdminPassword();
                          setPasswordChangeSuccess('Admin password has been reset to factory default "admin".');
                          setPasswordChangeError('');
                          setCurrentPassInput('');
                          setNewPassInput('');
                          setConfirmPassInput('');
                        }
                      }}
                      className="text-xs text-slate-400 hover:text-rose-300 flex items-center gap-1.5 self-start sm:self-auto py-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reset to Factory Default ("admin")</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Status & Recommendations (1 col) */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Account Security Overview</span>
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[11px] block">Login Username:</span>
                      <span className="font-mono font-bold text-white text-xs">admin</span>
                      <span className="text-[10px] text-slate-500 block">
                        (or alternate alias: nasbaladna)
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[11px] block">Password Status:</span>
                      <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {adminPassword === 'admin' ? 'Default Password in Use' : 'Custom Password Active'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Stored securely in browser local storage
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[11px] block">Console Capabilities:</span>
                      <span className="font-bold text-slate-200 text-xs block">
                        Full Store Administration
                      </span>
                      <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-0.5 mt-1">
                        <li>Price changes & discounts</li>
                        <li>Inventory & restock audit</li>
                        <li>Driver & WhatsApp hotline</li>
                        <li>Categories & produce photos</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300/90 space-y-1 mt-3">
                  <span className="font-bold block flex items-center gap-1 text-amber-300">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Emergency Recovery
                  </span>
                  <p>
                    If you ever misplace your password, the system also accepts the master owner recovery key linked to the Qatar store phone: <b>77315415</b>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: SCAN & ORDER QR CODE STUDIO & PRINT STATION */}
        {activeTab === 'qr_studio' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <span>Scan & Order QR Code Studio</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    PRINT & DEPLOY
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Generate, customize, and print high-resolution branded QR codes for dining tables, cashier counters, paper delivery bags, carton boxes, flyers, and storefront windows so customers can scan with their phone and order in 30 seconds.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsAdminQrModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Open Full Print Studio</span>
                </button>
              </div>
            </div>

            {/* Quick Placement Guide Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">1</span>
                  <span>Table & Counter Standees</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Print the <b>A5 Table Tent template</b> and place it inside transparent acrylic L-stands on cafe tables and cashier desks.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">2</span>
                  <span>Packaging & Bag Stickers</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Print the <b>Sheet of 6 Stickers</b> on adhesive paper. Stick one on every grocery paper bag and delivery carton for repeat orders.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">3</span>
                  <span>Storefronts & Vehicle Decals</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Print the large <b>A4 Poster</b> for shop doors, residential compound noticeboards, and magnetic delivery van doors across Qatar.
                </p>
              </div>
            </div>

            {/* In-Line QR Generator and Print Station */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h4 className="text-sm font-bold text-white">Print Station Ready</h4>
                  <p className="text-xs text-slate-400">Preview standee or open full print dialog</p>
                </div>
                <button
                  onClick={() => setIsAdminQrModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Customize Templates & Links</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
                <div className="p-4 bg-white rounded-2xl shadow-xl flex flex-col items-center max-w-xs text-center border-4 border-emerald-800 text-slate-900">
                  <NasBaladnaLogo size="sm" showTagline={false} />
                  <span className="text-xs font-black text-emerald-900 mt-2">SCAN TO ORDER</span>
                  <span className="text-[11px] font-bold text-emerald-700">امسح واطلب طازجاً</span>
                  <div className="my-2 p-3 bg-emerald-50 rounded-xl border border-dashed border-emerald-600">
                    <QrCode className="w-32 h-32 text-emerald-950" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">📞 {ownerPhone}</span>
                </div>

                <div className="space-y-3 text-xs max-w-md">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[11px]">How customer scans:</span>
                    <p className="text-slate-200">
                      Customer points iPhone or Android native camera at the QR code. The yellow notification banner opens the live store immediately without installing any application.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Instant Print Options:</span>
                    <p className="text-slate-300 text-[11px] mb-2">
                      Ready-to-print Table Tents (A5), Packaging Stickers (Sheet of 6), Storefront Posters (A4), and High-Res PNG downloads.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => setIsAdminQrModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Open & Print Templates</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Store Hotline & Manager Details footer */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            <span>NasBaladna Store Hotline: <strong className="text-white font-mono">{ownerPhone}</strong> (77315415)</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={ownerWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Launch WhatsApp Support (+974 77315415)</span>
            </a>
            <button
              onClick={adminLogout}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-semibold text-[11px] transition-colors"
            >
              <LogOut className="w-3 h-3 text-rose-400" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Tax Invoice & Order Receipt Modal for Admin */}
      {selectedReceiptOrder && (
        <OrderReceiptModal
          order={selectedReceiptOrder}
          isOpen={Boolean(selectedReceiptOrder)}
          onClose={() => setSelectedReceiptOrder(null)}
          formatPrice={formatPrice}
        />
      )}

      {/* Scan & Order QR Code Studio Modal for Admin */}
      <ScanToOrderModal
        isOpen={isAdminQrModalOpen}
        onClose={() => setIsAdminQrModalOpen(false)}
      />

      {/* Driver Delivery Route Manifest & Fleet Dispatch Modal */}
      <DriverManifestModal
        isOpen={isDriverManifestModalOpen}
        onClose={() => setIsDriverManifestModalOpen(false)}
        orders={ordersHistory}
        updateOrderStatus={updateOrderStatus}
        formatPrice={formatPrice}
        driverInfo={deliveryDriver}
        showToast={showToast}
      />
    </div>
  );
};
