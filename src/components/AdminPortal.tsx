import React, { useState, useEffect } from 'react';
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
  FileSpreadsheet,
  Activity,
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  AlertTriangle,
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
} from 'lucide-react';
import { CategoryType, Product, OrderStatus } from '../types';
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
  } = useStore();

  // Login form state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard active tab
  const [activeTab, setActiveTab] = useState<
    'products' | 'add_product' | 'categories' | 'delivery_driver' | 'bulk' | 'orders' | 'inventory' | 'security'
  >('products');

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

  // Bulk Import state
  const [bulkCsvText, setBulkCsvText] = useState(
    `Name, Category, Price, Stock, Weight, WholesalePrice, WholesaleUnit\nSweet Baby Carrots, vegetables, 4.5, 35, 500g, 35, 5kg Crate\nGolden Papaya, fruits, 7.5, 20, 1kg, 60, 10kg Box\nLocal Fresh Mint, herbs, 2.0, 40, 200g, 15, 2kg Bundle\nFarm Labneh, dairy, 9.0, 25, 500g, 75, 5kg Tub`
  );

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
  };

  const handleSaveEdit = (p: Product) => {
    updateProduct(p.id, {
      basePrice: tempPrice,
      wholesalePrice: tempWholesale,
      stock: tempStock,
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

  const handleProcessBulkCsv = () => {
    try {
      const lines = bulkCsvText.trim().split('\n');
      if (lines.length <= 1) {
        showToast('Please provide CSV rows');
        return;
      }

      const parsed: Product[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        if (cols.length >= 4) {
          const name = cols[0];
          const cat = (cols[1].toLowerCase() as CategoryType) || 'vegetables';
          const price = parseFloat(cols[2]) || 5.0;
          const stock = parseInt(cols[3], 10) || 20;
          const weight = cols[4] || '500g';
          const wholesalePrice = cols[5] ? parseFloat(cols[5]) : price * 4.5;
          const wholesaleUnit = cols[6] || '5kg Crate';

          const imageToUse =
            cat === 'fruits'
              ? categoryFruitsImg
              : cat === 'vegetables'
              ? categoryVegImg
              : orangeImg;

          parsed.push({
            id: `prod-bulk-${Date.now()}-${i}`,
            name,
            category: cat,
            brand: 'NasBaladna Farm Direct',
            sku: `NB-BLK-${Math.floor(100 + Math.random() * 900)}`,
            basePrice: price,
            baseWeight: weight,
            weightOptions: [
              { weight, multiplier: 1.0 },
              { weight: '1kg', multiplier: 1.85 },
              { weight: '2kg', multiplier: 3.5 },
            ],
            stock,
            image: imageToUse,
            thumbnails: [imageToUse],
            description: `${name} freshly harvested from NasBaladna farm clusters.`,
            origin: 'Qatar Agro Farms',
            farm: 'NasBaladna Cluster 1',
            organic: true,
            wholesalePrice,
            wholesaleUnit,
            isWholesaleEligible: true,
            benefits: ['Farm fresh', 'High nutrition', 'Immediate doorstep delivery'],
            storageAdvice: 'Refrigerate at 4°C.',
          });
        }
      }

      if (parsed.length > 0) {
        bulkAddProducts(parsed);
        setActiveTab('products');
      } else {
        showToast('No valid product rows found in CSV');
      }
    } catch {
      showToast('Error parsing CSV. Please check formatting.');
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
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-white shadow-xs">
              <NasBaladnaLogo size="sm" showTagline={false} />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                ADMIN CONSOLE
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-400">
                Logged in as <strong className="text-slate-200">{adminUser?.name || 'Admin'}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'security'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title="Admin Password & Credentials Settings"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Change Password</span>
              <span className="sm:hidden">Password</span>
            </button>

            <button
              onClick={() => setCurrentView('customer')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Customer Store</span>
            </button>

            <button
              onClick={adminLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-xs font-semibold text-rose-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col space-y-6">
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Customer Orders ({ordersHistory.length})</span>
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
        </div>

        {/* TAB 1: MANAGE PRODUCTS & IN-LINE PRICE EDITING */}
        {activeTab === 'products' && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold font-['Outfit'] text-white">
                  Live Produce Catalog & Price Management
                </h2>
                <p className="text-xs text-slate-400">
                  Adjust retail rates, B2B crate wholesale pricing, and stock levels. Changes appear immediately in the customer storefront.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => bulkUpdatePrices(5)}
                  className="px-3 py-1.5 bg-emerald-900/60 border border-emerald-700 text-emerald-300 font-bold text-xs rounded-xl hover:bg-emerald-800"
                >
                  +5% All Prices
                </button>
                <button
                  onClick={() => bulkUpdatePrices(-5)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
                >
                  -5% All Prices
                </button>
                <button
                  onClick={() => setActiveTab('add_product')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80 bg-slate-900/50">
              {products.map((p) => {
                const isEditing = editingId === p.id;
                const wholesaleVal = p.wholesalePrice || p.basePrice * 4.5;

                return (
                  <div
                    key={p.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900 transition-colors"
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
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {p.sku}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="capitalize">{p.category}</span>
                          <span>·</span>
                          <span>Base: {p.baseWeight}</span>
                          <span>·</span>
                          <span className="text-emerald-400">{p.farm}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400">Retail</label>
                            <input
                              type="number"
                              step="0.1"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg font-mono font-bold text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400">B2B Crate</label>
                            <input
                              type="number"
                              step="0.5"
                              value={tempWholesale}
                              onChange={(e) => setTempWholesale(parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg font-mono font-bold text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400">Stock</label>
                            <input
                              type="number"
                              value={tempStock}
                              onChange={(e) => setTempStock(parseInt(e.target.value, 10) || 0)}
                              className="w-16 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg font-mono font-bold text-white"
                            />
                          </div>
                          <button
                            onClick={() => handleSaveEdit(p)}
                            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold mt-3"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold mt-3"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Retail Price</span>
                            <span className="font-mono font-bold text-sm text-white">
                              {formatPrice(p.basePrice)}
                            </span>
                          </div>

                          <div className="text-right pl-3 border-l border-slate-800">
                            <span className="text-[10px] text-emerald-400 block">
                              B2B ({p.wholesaleUnit || '5kg Crate'})
                            </span>
                            <span className="font-mono font-bold text-sm text-emerald-400">
                              {formatPrice(wholesaleVal)}
                            </span>
                          </div>

                          <div className="text-right pl-3 border-l border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Stock</span>
                            <span className="font-mono font-bold text-xs text-slate-300">
                              {p.stock} units
                            </span>
                          </div>

                          <div className="flex items-center gap-1 pl-3">
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
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold font-['Outfit'] text-white">
                Bulk Add Products (Spreadsheet & CSV Import)
              </h2>
              <p className="text-xs text-slate-400">
                Paste multiple lines of produce in CSV format to populate the inventory at once.
              </p>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 mt-2">
                Name, Category, Price, Stock, Weight, WholesalePrice, WholesaleUnit
              </div>
            </div>

            <div>
              <textarea
                rows={8}
                value={bulkCsvText}
                onChange={(e) => setBulkCsvText(e.target.value)}
                className="w-full p-3 font-mono text-xs border border-slate-700 rounded-xl bg-slate-900 text-slate-100 focus:ring-2 focus:ring-emerald-500"
                placeholder="Paste CSV rows here..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleProcessBulkCsv}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import All to NasBaladna</span>
              </button>
              <button
                onClick={() =>
                  setBulkCsvText(
                    `Name, Category, Price, Stock, Weight, WholesalePrice, WholesaleUnit\nOrganic Hass Avocados Box, fruits, 15, 30, 500g, 120, 5kg Crate\nVine Cherry Tomatoes, vegetables, 4.2, 50, 250g, 38, 3kg Box\nFresh Coriander Bunch, herbs, 2.0, 60, 150g, 18, 2kg Box\nArtisan Milk Bread, bakery, 8.5, 20, 400g, 65, 10 Loaves\nFresh Pomegranate Juice, juices, 16.0, 25, 500ml, 140, 10 Bottles`
                  )
                }
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Load Sample Batch
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS & FULFILLMENT MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold font-['Outfit'] text-white">
                Customer Orders & Cold-Chain Fulfillment
              </h2>
              <p className="text-xs text-slate-400">
                Track and change live order delivery stages. Updating the status notifies the customer's live tracking view.
              </p>
            </div>

            {ordersHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No orders placed yet. Place a test order in the customer store to view management controls.
              </div>
            ) : (
              <div className="space-y-3">
                {ordersHistory.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">#{ord.orderNumber}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                          {ord.status.replace('_', ' ')}
                        </span>
                        <span className="text-slate-400">· {ord.createdAt}</span>
                      </div>
                      <div className="text-slate-300">
                        <strong>Customer:</strong> {ord.customerName} ({ord.phone})
                      </div>
                      <div className="text-slate-400">
                        <strong>Address:</strong> {ord.address}, {ord.district}
                      </div>
                      <div className="text-slate-400">
                        <strong>Items:</strong> {ord.items.map((i) => `${i.product.name} (${i.selectedWeight}) x${i.quantity}`).join(', ')}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Total Amount</span>
                        <span className="text-base font-bold font-mono text-emerald-400">
                          {formatPrice(ord.total)}
                        </span>
                      </div>

                      {/* Status changer buttons */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        {(['confirmed', 'packing', 'on_the_way', 'delivered'] as OrderStatus[]).map(
                          (st) => (
                            <button
                              key={st}
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
                    </div>
                  </div>
                ))}
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

        {/* Store Hotline & Manager Details footer */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            <span>NasBaladna Store Hotline: <strong className="text-white font-mono">{ownerPhone}</strong> (77315415)</span>
          </div>
          <a
            href={ownerWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:underline"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Launch WhatsApp Support (+974 77315415)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
