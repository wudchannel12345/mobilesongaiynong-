import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import CheckoutModal from "./components/CheckoutModal";
import OrderSuccessModal from "./components/OrderSuccessModal";
import AdminDashboard from "./components/AdminDashboard";
import { Product, Order, ShopSettings, SlideItem, CarrierItem, PaymentMethod } from "./types";
import { 
  Search, SlidersHorizontal, Sparkles, LogIn, Lock, Info, 
  ShoppingBag, Bell, Volume2, ShieldCheck, CheckCircle, Package, Plus
} from "lucide-react";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function App() {
  // Navigation & View States
  const [currentTab, setCurrentTab] = useState<"shop" | "admin">("shop");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Dynamic Web config states
  const [settings, setSettings] = useState<ShopSettings>({ shopName: "WUD SHOP", slogan: "ແຫຼ່ງລວມສິນຄ້າພຣີມ່ຽມ", contactPhone: "020-52590006" });
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [carriers, setCarriers] = useState<CarrierItem[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [categories, setCategories] = useState<string[]>(["ທັງໝົດ"]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Loading & Searching States
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ທັງໝົດ");

  // Admin Authentication State
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Customer Cart & Checkout States
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("wudshop_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);

  // Admin Notification Alert state
  const [latestOrderAlert, setLatestOrderAlert] = useState<Order | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Load Admin auth from localStorage if present
  useEffect(() => {
    const savedToken = localStorage.getItem("wudshop_admin_token");
    if (savedToken) {
      setIsAdmin(true);
      setAdminToken(savedToken);
    }
  }, []);

  // Save Cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem("wudshop_cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch configs (Categories, Slides, Carriers, Settings)
  const fetchConfigs = async () => {
    try {
      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) {
        setSettings(await settingsRes.json());
      }
      const categoriesRes = await fetch("/api/categories");
      if (categoriesRes.ok) {
        const catData = await categoriesRes.json();
        setCategories(["ທັງໝົດ", ...catData]);
      }
      const slidesRes = await fetch("/api/slides");
      if (slidesRes.ok) {
        setSlides(await slidesRes.json());
      }
      const carriersRes = await fetch("/api/carriers");
      if (carriersRes.ok) {
        setCarriers(await carriersRes.json());
      }
      const paymentsRes = await fetch("/api/payments");
      if (paymentsRes.ok) {
        setPayments(await paymentsRes.json());
      }
    } catch (err) {
      console.error("Error loading web configs:", err);
    }
  };

  // Fetch orders (admin only)
  const fetchOrders = async (tokenToUse = adminToken) => {
    if (!tokenToUse) return;
    try {
      const res = await fetch("/api/orders", {
        headers: {
          "Authorization": `Bearer ${tokenToUse}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        
        // Notification Alert logic: Detect if there is a new order
        if (orders.length > 0 && data.length > orders.length) {
          const newest = data[0]; // sorted by newest first
          if (newest && !dismissedAlerts.includes(newest.id)) {
            setLatestOrderAlert(newest);
            setUnreadNotifications(prev => prev + 1);
            
            // Play sound alert chime
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.type = "sine";
              oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
              gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
              oscillator.start();
              oscillator.stop(audioCtx.currentTime + 0.3);
            } catch (e) {
              console.log("Audio play blocked");
            }
          }
        }
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // Listen to profile/settings updates from admin
  useEffect(() => {
    const handleSettingsUpdate = () => {
      fetchConfigs();
    };
    window.addEventListener("shop_settings_updated", handleSettingsUpdate);
    return () => window.removeEventListener("shop_settings_updated", handleSettingsUpdate);
  }, []);

  // Initial Fetch on load & Polling for real-time notifications
  useEffect(() => {
    const initLoad = async () => {
      setLoading(true);
      await fetchProducts();
      await fetchConfigs();
      setLoading(false);
    };
    initLoad();

    // Poll for changes every 7 seconds
    const interval = setInterval(() => {
      fetchProducts();
      fetchConfigs();
      if (isAdmin && adminToken) {
        fetchOrders(adminToken);
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [isAdmin, adminToken, orders.length]);

  // Load orders immediately when authenticated
  useEffect(() => {
    if (isAdmin && adminToken) {
      fetchOrders(adminToken);
    }
  }, [isAdmin, adminToken]);

  // Slide carousel automatic interval
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Handle Admin Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAdmin(true);
        setAdminToken(data.token);
        localStorage.setItem("wudshop_admin_token", data.token);
        setShowAdminLogin(false);
        setAdminEmail("");
        setAdminPassword("");
        setCurrentTab("admin");
      } else {
        setLoginError(data.message || "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
      }
    } catch (err) {
      setLoginError("ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ກັບເຊີບເວີ");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminToken("");
    localStorage.removeItem("wudshop_admin_token");
    setCurrentTab("shop");
  };

  // Cart Management
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleOrderSuccess = (order: Order) => {
    setRecentOrder(order);
    setIsCheckoutOpen(false);
    // Refresh products on order success to reflect deducted stock
    fetchProducts();
    // Refresh admin orders if admin
    if (isAdmin && adminToken) {
      fetchOrders();
    }
  };

  // Filtering Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ທັງໝົດ" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900" id="app-root">
      
      {/* Top Notification Banner for Admin */}
      {isAdmin && latestOrderAlert && (
        <div className="bg-rose-500 text-white py-3.5 px-4 shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-300 z-50 sticky top-0" id="admin-banner-alert">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="p-1 bg-white/20 rounded-lg animate-pulse">
                <Bell className="w-5 h-5 text-white" />
              </span>
              <p className="text-xs sm:text-sm font-semibold font-display">
                📢 ມີອໍເດີ້ໃໝ່ເຂົ້າມາ! ໝາຍເລກ: <span className="underline font-mono font-bold">{latestOrderAlert.orderNumber}</span> ໂດຍຄຸນ {latestOrderAlert.customerName} ຍອດລວມ: {latestOrderAlert.totalAmount.toLocaleString()} ₭
              </p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => {
                  setCurrentTab("admin");
                  setLatestOrderAlert(null);
                  setUnreadNotifications(0);
                }}
                className="px-3 py-1.5 bg-white text-rose-600 hover:bg-rose-50 text-xs font-bold font-display rounded-lg transition-colors cursor-pointer"
              >
                ເບິ່ງລາຍລະອຽດ
              </button>
              <button
                onClick={() => {
                  if (latestOrderAlert) {
                    setDismissedAlerts(prev => [...prev, latestOrderAlert.id]);
                  }
                  setLatestOrderAlert(null);
                }}
                className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-xs font-display"
              >
                ປິດຮັບຊາບ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar Navigation */}
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setIsCheckoutOpen(true)}
        isAdmin={isAdmin}
        onAdminLoginClick={() => {
          setLoginError("");
          setShowAdminLogin(true);
        }}
        onAdminLogout={handleAdminLogout}
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab === "admin") {
            setUnreadNotifications(0);
            setLatestOrderAlert(null);
          }
        }}
        unreadNotifications={unreadNotifications}
        shopName={settings.shopName}
        slogan={settings.slogan}
      />

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {currentTab === "shop" ? (
          <div className="space-y-8" id="storefront-view">
            
            {/* Banner Section (Slideshow or Static) */}
            {slides.length > 0 ? (
              <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white min-h-[300px] md:min-h-[380px] flex items-center shadow-xl border border-slate-800 transition-all duration-550">
                {/* Carousel Background Image */}
                <div className="absolute inset-0">
                  <img 
                    src={slides[activeSlideIndex].imageUrl} 
                    alt={slides[activeSlideIndex].title || "Promo Slide"} 
                    className="w-full h-full object-cover opacity-35 transition-all duration-700 ease-in-out scale-102"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent"></div>
                </div>

                {/* Carousel Content */}
                <div className="relative z-10 p-8 md:p-12 max-w-2xl space-y-4 animate-in fade-in-40 duration-300">
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] sm:text-xs font-bold font-display px-3 py-1.5 rounded-full border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1 w-max">
                    <Sparkles className="w-3.5 h-3.5" />
                    {settings.shopName || "WUD SHOP"}
                  </span>
                  
                  {slides[activeSlideIndex].title && (
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight leading-tight">
                      {slides[activeSlideIndex].title}
                    </h1>
                  )}
                  
                  {slides[activeSlideIndex].subtitle && (
                    <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-lg">
                      {slides[activeSlideIndex].subtitle}
                    </p>
                  )}

                  <p className="text-[10px] text-indigo-200/60 font-sans uppercase tracking-widest">
                    {settings.slogan}
                  </p>
                </div>

                {/* Slideshow Dot Indicators */}
                {slides.length > 1 && (
                  <div className="absolute bottom-6 right-6 flex space-x-1.5 z-20">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                          activeSlideIndex === idx ? "bg-indigo-500 scale-125" : "bg-white/30 hover:bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Fallback static banner */
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 shadow-xl border border-indigo-950/20">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

                <div className="relative z-10 max-w-2xl space-y-4">
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] sm:text-xs font-bold font-display px-3 py-1.5 rounded-full border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1 w-max">
                    <Sparkles className="w-3.5 h-3.5" />
                    {settings.shopName || "WUD SHOP"}
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight leading-tight">
                    ຍິນດີຕ້ອນຮັບສູ່ {settings.shopName || "WUD SHOP"}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-lg">
                    {settings.slogan || "ແຫຼ່ງລວມສິນຄ້າພຣີມ່ຽມ ແລະ ດີລພິເສດສຸດຄຸ້ມສຳລັບທ່ານ!"}
                  </p>
                </div>
              </div>
            )}

            {/* Filter and Search Bar Row */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
              
              {/* Categories Navigation */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold font-display transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                        : "text-slate-600 hover:bg-slate-50 border border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search input field */}
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາຊື່ ຫຼື ຄຳອະທິບາຍສິນຄ້າ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all bg-slate-50/50 hover:bg-white focus:bg-white"
                  id="product-search-input"
                />
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-xs font-semibold font-display">ກຳລັງໂຫລດລາຍການສິນຄ້າ...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-xs">
                <p className="text-slate-400 font-medium text-sm">ບໍ່ພົບສິນຄ້າໃນໝວດໝູ່ ຫຼື ຄຳຄົ້ນຫາທີ່ທ່ານລະບຸ</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("ທັງໝົດ");
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold font-display rounded-xl transition-all cursor-pointer"
                >
                  ລ້າງຕົວຕອງ ແລະ ເບິ່ງສິນຄ້າທັງໝົດ
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onViewDetails={(p) => setSelectedProduct(p)}
                      isItemInCart={cart.some((item) => item.product.id === product.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Admin dashboard view */
          <div id="admin-view">
            <AdminDashboard
              products={products}
              orders={orders}
              onRefreshProducts={fetchProducts}
              onRefreshOrders={fetchOrders}
              payments={payments}
              onRefreshPayments={fetchConfigs}
              token={adminToken}
            />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-medium">© 2026 {settings.shopName || "WUD SHOP"}. สงวนลิขสิทธิ์.</p>
          <div className="flex items-center space-x-4">
            <span className="text-[11px] font-semibold text-slate-500">ລະບົບສັ່ງຊື້ສິນຄ້າພຣີມ່ຽມ ປອດໄພ ໝັ້ນໃຈໄດ້</span>
            {settings.contactPhone && (
              <span className="text-[11px] font-semibold text-indigo-600">Tel: {settings.contactPhone}</span>
            )}
          </div>
        </div>
      </footer>

      {/* --- MODALS & DIALOGS --- */}

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isItemInCart={selectedProduct ? cart.some((item) => item.product.id === selectedProduct.id) : false}
      />

      {/* Cart & Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveFromCart={handleRemoveFromCart}
        onOrderSuccess={handleOrderSuccess}
        clearCart={() => setCart([])}
        carriers={carriers}
        payments={payments}
      />

      {/* Order Success Confirmation Modal */}
      <OrderSuccessModal
        order={recentOrder}
        onClose={() => setRecentOrder(null)}
      />

      {/* Admin Login Dialog Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="admin-login-modal">
          <div 
            className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Login Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 text-center relative">
              <button 
                onClick={() => setShowAdminLogin(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5 rotate-45" />
              </button>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-2 shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold font-display text-slate-800">ເຂົ້າສູ່ລະບົບສຳລັບຜູ້ດູແລຮ້ານ</h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">ສະເພາະແອດມິນເຈົ້າຂອງຮ້ານຄ້າທີ່ມີສິດເຂົ້າເຖິງເທົ່ານັ້ນ</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
                  {loginError}
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ອີເມວແອດມິນ *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                  id="admin-email-input"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ລະຫັດຜ່ານແອດມິນ *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                  id="admin-password-input"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-display rounded-2xl shadow-lg shadow-indigo-100 transition-all cursor-pointer text-xs"
                id="admin-login-submit"
              >
                ເຂົ້າສູ່ລະບົບ
              </button>


            </form>
          </div>
        </div>
      )}

    </div>
  );
}
