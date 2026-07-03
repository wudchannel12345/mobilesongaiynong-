import React, { useState, useEffect } from "react";
import { Product, Order, ShopSettings, SlideItem, CarrierItem, PaymentMethod } from "../types";
import { 
  Plus, Edit, Trash2, Tag, Percent, Image, AlertCircle, RefreshCw, 
  CheckCircle, Package, Truck, Phone, User, MapPin, Settings, MonitorPlay, Save, CreditCard, X
} from "lucide-react";

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onRefreshProducts: () => Promise<void>;
  onRefreshOrders: () => Promise<void>;
  payments: PaymentMethod[];
  onRefreshPayments: () => Promise<void>;
  token: string;
}

export default function AdminDashboard({
  products,
  orders,
  onRefreshProducts,
  onRefreshOrders,
  payments = [],
  onRefreshPayments,
  token
}: AdminDashboardProps) {
  // Tabs for sub-admin: 'products' | 'orders' | 'categories' | 'slides' | 'carriers' | 'payments' | 'settings'
  const [subTab, setSubTab] = useState<"products" | "orders" | "categories" | "slides" | "carriers" | "payments" | "settings">("products");
  const [selectedSlipUrl, setSelectedSlipUrl] = useState<string | null>(null);

  // Loading/saving state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Dynamic Lists states
  const [categories, setCategories] = useState<string[]>([]);
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [carriers, setCarriers] = useState<CarrierItem[]>([]);
  const [settings, setSettings] = useState<ShopSettings>({ shopName: "WUD SHOP", slogan: "", contactPhone: "" });

  // Payments Form Fields
  const [newPaymentName, setNewPaymentName] = useState("");
  const [newPaymentAccountName, setNewPaymentAccountName] = useState("");
  const [newPaymentAccountNumber, setNewPaymentAccountNumber] = useState("");
  const [newPaymentQrImageUrl, setNewPaymentQrImageUrl] = useState("");

  // Product form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("ທົ່ວໄປ");
  const [discountBadge, setDiscountBadge] = useState("");

  // Categories Form Fields
  const [newCategoryName, setNewCategoryName] = useState("");

  // Slides Form Fields
  const [newSlideUrl, setNewSlideUrl] = useState("");
  const [newSlideTitle, setNewSlideTitle] = useState("");
  const [newSlideSubtitle, setNewSlideSubtitle] = useState("");

  // Carriers Form Fields
  const [newCarrierName, setNewCarrierName] = useState("");
  const [newCarrierLogo, setNewCarrierLogo] = useState("");
  const [newCarrierDesc, setNewCarrierDesc] = useState("");

  // Editing individual item states (if editing instead of creating)
  const [editingSlide, setEditingSlide] = useState<SlideItem | null>(null);
  const [editingCarrier, setEditingCarrier] = useState<CarrierItem | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);

  // Slides handlers
  const handleStartEditSlide = (slide: SlideItem) => {
    setEditingSlide(slide);
    setNewSlideUrl(slide.imageUrl);
    setNewSlideTitle(slide.title || "");
    setNewSlideSubtitle(slide.subtitle || "");
  };

  const handleCancelEditSlide = () => {
    setEditingSlide(null);
    setNewSlideUrl("");
    setNewSlideTitle("");
    setNewSlideSubtitle("");
  };

  // Carriers handlers
  const handleStartEditCarrier = (carrier: CarrierItem) => {
    setEditingCarrier(carrier);
    setNewCarrierName(carrier.name);
    setNewCarrierLogo(carrier.logo);
    setNewCarrierDesc(carrier.desc || "");
  };

  const handleCancelEditCarrier = () => {
    setEditingCarrier(null);
    setNewCarrierName("");
    setNewCarrierLogo("");
    setNewCarrierDesc("");
  };

  // Payments handlers
  const handleStartEditPayment = (payment: PaymentMethod) => {
    setEditingPayment(payment);
    setNewPaymentName(payment.name);
    setNewPaymentAccountName(payment.accountName);
    setNewPaymentAccountNumber(payment.accountNumber);
    setNewPaymentQrImageUrl(payment.qrImageUrl);
  };

  const handleCancelEditPayment = () => {
    setEditingPayment(null);
    setNewPaymentName("");
    setNewPaymentAccountName("");
    setNewPaymentAccountNumber("");
    setNewPaymentQrImageUrl("");
  };

  // Fetch all support items from API
  const fetchAllConfigs = async () => {
    try {
      // 1. Categories
      const catRes = await fetch("/api/categories");
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
        if (catData.length > 0 && !category) {
          setCategory(catData[0]);
        }
      }
      // 2. Slides
      const slideRes = await fetch("/api/slides");
      if (slideRes.ok) {
        setSlides(await slideRes.json());
      }
      // 3. Carriers
      const carrierRes = await fetch("/api/carriers");
      if (carrierRes.ok) {
        setCarriers(await carrierRes.json());
      }
      // 4. Settings
      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) {
        setSettings(await settingsRes.json());
      }
    } catch (err) {
      console.error("Error loading configs:", err);
    }
  };

  useEffect(() => {
    fetchAllConfigs();
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setDescription(editingProduct.description || "");
      setPrice(editingProduct.price.toString());
      setOriginalPrice(editingProduct.originalPrice?.toString() || "");
      setImageUrl(editingProduct.imageUrl);
      setImageUrls(editingProduct.imageUrls && editingProduct.imageUrls.length > 0 ? [...editingProduct.imageUrls] : [editingProduct.imageUrl]);
      setStock(editingProduct.stock.toString());
      setCategory(editingProduct.category);
      setDiscountBadge(editingProduct.discountBadge || "");
    } else {
      resetForm();
    }
  }, [editingProduct]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setOriginalPrice("");
    setImageUrl("");
    setImageUrls([""]);
    setStock("");
    setCategory(categories.length > 0 ? categories[0] : "ທົ່ວໄປ");
    setDiscountBadge("");
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  // Create or Update Product
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock) {
      showMessage("ກະລຸນາກອກຂໍ້ມູນຫຼັກໃຫ້ຄົບຖ້ວນ (ຊື່, ລາຄາຂາຍ, ສະຕັອກ)", "error");
      return;
    }

    setLoading(true);
    const cleanImageUrls = imageUrls.filter(url => url.trim() !== "").slice(0, 8);
    const primaryImageUrl = cleanImageUrls[0] || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600";

    const payload = {
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      imageUrl: primaryImageUrl,
      imageUrls: cleanImageUrls,
      stock: Number(stock),
      category,
      discountBadge
    };

    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}` 
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showMessage(editingProduct ? "ແກ້ໄຂສິນຄ້າຮຽບຮ້ອຍແລ້ວ!" : "ເພີ່ມສິນຄ້າໃໝ່ສຳເລັດ!");
        setIsFormOpen(false);
        resetForm();
        await onRefreshProducts();
      } else {
        showMessage(data.message || "ເກີດຂໍ้ຜິດພາດໃນການບັນທຶກສິນຄ້າ", "error");
      }
    } catch (err) {
      showMessage("ບໍ່ສາມາດບັນທຶກຂໍ້ມູນສິນຄ້າໄດ້", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("ທ່ານຕ້ອງການລົບສິນຄ້າຊິ້ນນີ້ແມ່ນບໍ?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMessage("ລົບສິນຄ້າຮຽບຮ້ອຍແລ້ວ");
        await onRefreshProducts();
      } else {
        showMessage(data.message || "ລົບສິນຄ້າບໍ່ສຳເລັດ", "error");
      }
    } catch (err) {
      showMessage("ເກີດຂໍ້ຜິດພາດໃນການລົບສິນຄ້າ", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, currentStatus: string, newStatus: string) => {
    if (currentStatus === newStatus) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMessage(`ອັບເດດສະຖານະອໍເດີ້ເປັນ '${newStatus}' ສຳເລັດ`);
        await onRefreshOrders();
        await onRefreshProducts();
      } else {
        showMessage(data.message || "ບໍ່ສາມາດປ່ຽນສະຖານະອໍເດີ້ໄດ້", "error");
      }
    } catch (err) {
      showMessage("ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນສະຖານະ", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("ທ່ານຕ້ອງການລົບອໍເດີ້ວນີ້ແມ່ນບໍ? (ບໍ່ສາມາດກູ້ຄືນໄດ້)")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMessage("ລົບອໍເດີ້ສຳເລັດ!");
        await onRefreshOrders();
      } else {
        showMessage(data.message || "ບໍ່ສາມາດລົບອໍເດີ້ໄດ້", "error");
      }
    } catch (err) {
      showMessage("ເກີດຂໍ້ຜິດພາດໃນການລົບອໍເດີ້", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Manage Categories ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCategoryName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMessage("ເພີ່ມໝວດໝູ່ໃໝ່ສຳເລັດแล้ว!");
        setNewCategoryName("");
        await fetchAllConfigs();
      } else {
        showMessage(data.message || "ເພີ່ມບໍ່ສຳເລັດ", "error");
      }
    } catch (err) {
      showMessage("ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມໝວດໝູ່", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (catName: string) => {
    if (!window.confirm(`ທ່ານຕ້ອງການລົບໝວດໝູ່ "${catName}" ແມ່ນບໍ?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(catName)}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMessage("ລົບໝວດໝູ່ຮຽບຮ້ອຍແລ້ວ");
        await fetchAllConfigs();
      } else {
        showMessage(data.message || "ລົບບໍ່ສຳເລັດ", "error");
      }
    } catch (err) {
      showMessage("ເກີดຂໍ້ຜິດພາດໃນການລົບໝວດໝູ່", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Manage Slides ---
  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideUrl.trim()) {
      showMessage("ກະລຸນາໃສ່ລິ້ງຮູບພາບສະໄລ້", "error");
      return;
    }
    setLoading(true);
    try {
      const url = editingSlide ? `/api/slides/${editingSlide.id}` : "/api/slides";
      const method = editingSlide ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          imageUrl: newSlideUrl,
          title: newSlideTitle,
          subtitle: newSlideSubtitle
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMessage(editingSlide ? "ແກ້ໄຂຮູບພາບສະໄລ້ສຳເລັດ!" : "ເພີ່ມຮູບພາບສະໄລ້ສຳເລັດ!");
        handleCancelEditSlide();
        await fetchAllConfigs();
      } else {
        showMessage(data.message || "ບັນທຶກບໍ່ສຳເລັດ", "error");
      }
    } catch (err) {
      showMessage("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກສະໄລ້", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!window.confirm("ທ່ານຕ້ອງການລົບຮູບສະໄລ້ນີ້ແມ່ນບໍ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/slides/${slideId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMessage("ລົບຮູບສະໄລ້ຮຽບຮ້ອຍແລ້ວ");
        await fetchAllConfigs();
      } else {
        showMessage(data.message || "ລົບບໍ່ສຳເລັດ", "error");
      }
    } catch (err) {
      showMessage("ເກີດຂໍ້ຜິດພາດໃນการລົບສະໄລ້", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Manage Carriers ---
  const handleAddCarrier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCarrierName.trim() || !newCarrierLogo.trim()) {
      showMessage("ກະລຸນາກອກຊື່ຂົນສົ່ງ ແລະ ໃສ່ລິ້ງຮູບພາບ", "error");
      return;
    }
    setLoading(true);
    try {
      const url = editingCarrier ? `/api/carriers/${editingCarrier.id}` : "/api/carriers";
      const method = editingCarrier ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCarrierName,
          logo: newCarrierLogo,
          desc: newCarrierDesc
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMessage(editingCarrier ? "ແກ้ໄຂຂົນສົ່ງຮຽບຮ້ອຍແລ້ວ!" : "ເພີ່ມຂົນສົ່ງຮຽບຮ້ອຍແລ້ວ!");
        handleCancelEditCarrier();
        await fetchAllConfigs();
      } else {
        showMessage(data.message || "ບັນທຶກບໍ່ສຳເລັດ", "error");
      }
    } catch (err) {
      showMessage("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂົນສົ່ງ", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCarrier = async (carrierId: string) => {
    if (!window.confirm("ທ່ານຕ້ອງການລົບຂົນສົ່ງນີ້ແມ່ນບໍ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/carriers/${carrierId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMessage("ລົບຂົນສົ່ງຮຽບຮ້ອຍແລ້ວ");
        await fetchAllConfigs();
      } else {
        showMessage(data.message || "ລົບບໍ່ສຳເລັດ", "error");
      }
    } catch (err) {
      showMessage("ເກີດຂໍ້ຜິດພາດໃນການລົບຂົນສົ່ງ", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Manage Web Profile Settings ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMessage("ບັນທຶກຂໍ້ມູນໂປຣໄຟລ໌ຮ້ານຄ້າຮຽບຮ້ອຍແລ້ວ!");
        // Force refresh in parent by windows event or let it poll
        window.dispatchEvent(new Event("shop_settings_updated"));
      } else {
        showMessage("ບໍ່ສາມາດບັນທຶກຂໍ້ມູນໄດ້", "error");
      }
    } catch (err) {
      showMessage("ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Manage Payment Methods ---
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentName || !newPaymentAccountName || !newPaymentAccountNumber || !newPaymentQrImageUrl) {
      showMessage("ກະລຸນາກອກຂໍ້ມູນໃຫ້ຄົບຖ້ວນ", "error");
      return;
    }
    setLoading(true);
    try {
      const url = editingPayment ? `/api/payments/${editingPayment.id}` : "/api/payments";
      const method = editingPayment ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newPaymentName,
          accountName: newPaymentAccountName,
          accountNumber: newPaymentAccountNumber,
          qrImageUrl: newPaymentQrImageUrl
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMessage(editingPayment ? "ແກ້ໄຂວິທີການຊຳລະເງິນສຳເລັດ!" : "ເພີ່ມວິທີການຊຳລະເງິນສຳເລັດ!");
        handleCancelEditPayment();
        await onRefreshPayments();
      } else {
        showMessage(data.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ", "error");
      }
    } catch (err) {
      showMessage("ບໍ່ສາມາດບັນທຶກວິທີການຊຳລະເງິນໄດ້", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!window.confirm("ທ່ານຕ້ອງການລົບວິທີການຊຳລະເງິນນີ້ແມ່ນບໍ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMessage("ລົບວິທີການຊຳລະເງິນສຳເລັດ!");
        await onRefreshPayments();
      } else {
        showMessage(data.message || "ເກີດຂໍ້ຜິດພາດໃນການລົບ", "error");
      }
    } catch (err) {
      showMessage("ບໍ່ສາມາດລົບວິທີการຊຳລະເງິນໄດ້", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="admin-dashboard-container">
      {/* Header Panel */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold font-display px-2.5 py-1 rounded-full border border-indigo-500/30">
              Admin Mode (wudchannel12345@gmail.com)
            </span>
          </div>
          <h1 className="text-2xl font-extrabold font-display mt-2 tracking-tight">ລະບົບການຈັດການຮ້ານຄ້າ</h1>
          <p className="text-xs text-indigo-200/80 font-sans mt-0.5">ຈັດການຂໍ້ມູນສິນຄ້າ, ລາຄາ, ສະຕັອກ, ໝວດໝູ່, ຮູບສະໄລ້, ຂົນສົ່ງ ແລະ ຂໍ້ມູນທົ່ວໄປຂອງເວັບໄຊ</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              setLoading(true);
              await onRefreshProducts();
              await onRefreshOrders();
              await fetchAllConfigs();
              setLoading(false);
              showMessage("ອັບເດດຂໍ້ມູນໜ້າຮ້ານສຳເລັດ");
            }}
            disabled={loading}
            className="p-3 bg-white/10 hover:bg-white/20 active:scale-95 rounded-2xl border border-white/15 text-white transition-all cursor-pointer flex items-center justify-center"
            title="ຣີເຟຣຊຂໍ້ມູນ"
            id="admin-refresh-btn"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold font-display rounded-2xl shadow-lg shadow-indigo-950/40 border border-indigo-500 transition-all cursor-pointer text-xs"
            id="admin-add-product-btn"
          >
            <Plus className="w-4 h-4" />
            <span>ເພີ່ມສິນຄ້າໃໝ່</span>
          </button>
        </div>
      </div>

      {/* Message Toast */}
      {message.text && (
        <div 
          className={`p-4 rounded-2xl border flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-top-4 duration-300 ${
            message.type === "error" 
              ? "bg-rose-50 border-rose-100 text-rose-600" 
              : "bg-emerald-50 border-emerald-100 text-emerald-600"
          }`}
          id="admin-alert-toast"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Sub Tabs Toggle Grid */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl max-w-full">
        <button
          onClick={() => setSubTab("products")}
          className={`px-4 py-2.5 text-xs font-bold font-display rounded-xl transition-all cursor-pointer ${
            subTab === "products" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ສິນຄ້າ ({products.length})
        </button>
        <button
          onClick={() => setSubTab("orders")}
          className={`px-4 py-2.5 text-xs font-bold font-display rounded-xl transition-all cursor-pointer ${
            subTab === "orders" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ອໍເດີ້ ({orders.length})
        </button>
        <button
          onClick={() => setSubTab("categories")}
          className={`px-4 py-2.5 text-xs font-bold font-display rounded-xl transition-all cursor-pointer ${
            subTab === "categories" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ໝວດໝູ່ ({categories.length})
        </button>
        <button
          onClick={() => setSubTab("slides")}
          className={`px-4 py-2.5 text-xs font-bold font-display rounded-xl transition-all cursor-pointer ${
            subTab === "slides" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ຮູບສະໄລ້ ({slides.length})
        </button>
        <button
          onClick={() => setSubTab("carriers")}
          className={`px-4 py-2.5 text-xs font-bold font-display rounded-xl transition-all cursor-pointer ${
            subTab === "carriers" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ບໍລິສັດຂົນສົ່ງ ({carriers.length})
        </button>
        <button
          onClick={() => setSubTab("payments")}
          className={`px-4 py-2.5 text-xs font-bold font-display rounded-xl transition-all cursor-pointer ${
            subTab === "payments" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
          id="admin-payments-tab-btn"
        >
          ວິທີການຊຳລະເງິນ ({payments.length})
        </button>
        <button
          onClick={() => setSubTab("settings")}
          className={`px-4 py-2.5 text-xs font-bold font-display rounded-xl transition-all cursor-pointer ${
            subTab === "settings" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ຂໍ້ມູນໜ້າເວັບ
        </button>
      </div>

      {/* 1. Sub Tab: Products List */}
      {subTab === "products" && (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold font-display text-[11px] uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">ຮູບ ແລະ ຊື່ສິນຄ້າ</th>
                  <th className="py-4 px-6">ໝວດໝູ່</th>
                  <th className="py-4 px-6">ລາຄາຂາຍ</th>
                  <th className="py-4 px-6">ປ້າຍສ່ວນຫຼຸດ</th>
                  <th className="py-4 px-6">ຄົງເຫຼືອ</th>
                  <th className="py-4 px-6 text-right">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      ບໍ່ມີສິນຄ້າໃນລະບົບ ກະລຸນາກົດ "ເພີ່ມສິນຄ້າໃໝ່"
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const isLowStock = p.stock <= 5;
                    const isOut = p.stock === 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 flex items-center space-x-3">
                          <img
                             src={p.imageUrl}
                             alt={p.name}
                             className="w-12 h-12 rounded-xl object-cover border border-slate-100 bg-slate-50 flex-shrink-0"
                             referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 truncate max-w-[240px]" title={p.name}>{p.name}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[240px] font-sans mt-0.5">{p.description}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg font-semibold text-[10px] uppercase">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{p.price.toLocaleString()} ₭</span>
                            {p.originalPrice && (
                              <span className="text-[10px] text-slate-400 line-through">{p.originalPrice.toLocaleString()} ₭</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {p.discountBadge ? (
                            <span className="bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-md font-bold font-display text-[10px]">
                              {p.discountBadge}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`font-bold px-2 py-1 rounded-lg ${
                            isOut 
                              ? "bg-rose-50 text-rose-600" 
                              : isLowStock 
                              ? "bg-amber-50 text-amber-600" 
                              : "bg-emerald-50 text-emerald-600"
                          }`}>
                            {p.stock} ຊິ້ນ
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                              title="ແກ້ໄຂສິນຄ້າ"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                              title="ລົບສິນຄ້າ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Sub Tab: Orders List */}
      {subTab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-400 rounded-3xl border border-slate-100 shadow-xs">
              ຍັງບໍ່ມີອໍເດີ້ສົ່ງເຂົ້າມາໃນລະບົບ
            </div>
          ) : (
            orders.map((order) => {
              const dateFormatted = new Date(order.createdAt).toLocaleDateString("lo-LA", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div 
                  key={order.id} 
                  className="bg-white rounded-3xl border border-slate-150/70 p-6 shadow-xs flex flex-col md:flex-row gap-6 justify-between items-start"
                  id={`admin-order-card-${order.id}`}
                >
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-extrabold font-display text-base text-slate-800">
                        {order.orderNumber}
                      </span>
                      <span className="text-slate-400 text-xs font-sans">
                        {dateFormatted}
                      </span>
                      <span className={`text-[11px] font-bold font-display px-2.5 py-0.5 rounded-full ${
                        order.status === "ຈັດສົ່ງສຳເລັດ"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : order.status === "ກຳລັງຈັດສົ່ງ"
                          ? "bg-sky-50 text-sky-600 border border-sky-100"
                          : order.status === "ຍົກເລີກ"
                          ? "bg-slate-100 text-slate-500 border border-slate-200"
                          : "bg-amber-50 text-amber-600 border border-amber-100 animate-pulse"
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-xs">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div><span className="font-bold text-slate-400">ລູກຄ້າ:</span> {order.customerName}</div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div><span className="font-bold text-slate-400">ເບີຕິດຕໍ່:</span> {order.contactPhone}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                          <div><span className="font-bold text-slate-400">ທີ່ຢູ່ຈັດສົ່ງ:</span> {order.shippingAddress}</div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Truck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div><span className="font-bold text-slate-400">ຂົນສົ່ງທີ່ເລືອກ:</span> <span className="font-semibold text-indigo-600">{order.shippingProvider}</span></div>
                        </div>
                      </div>
                      <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 md:pl-3 pt-2 md:pt-0 flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-slate-600">
                          <CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div><span className="font-bold text-slate-400">ວິທີຊຳລະ:</span> <span className="font-semibold text-slate-700">{order.paymentMethod || "BCEL One"}</span></div>
                        </div>
                        {order.paymentSlip ? (
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ສະລິບ:</span>
                            <div 
                              onClick={() => setSelectedSlipUrl(order.paymentSlip || null)}
                              className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-85 transition-all relative group shadow-2xs"
                              title="ກົດເພື່ອເບິ່ງຮູບສະລິບເຕັມ"
                            >
                              <img 
                                src={order.paymentSlip} 
                                alt="Slip" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[8px] text-white font-black">
                                ເບິ່ງຮູບ
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 text-rose-500 font-bold text-[10px] flex items-center gap-1">
                            <span>⚠️</span> ບໍ່ມີສະລິບ
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ລາຍການທີ່ສັ່ງຊື້</h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 bg-white border border-slate-50 rounded-xl hover:bg-slate-50/50 transition-colors">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                                {item.price.toLocaleString()} ₭ x {item.quantity}
                              </p>
                            </div>
                            <div className="text-xs font-bold text-slate-800">
                              {(item.price * item.quantity).toLocaleString()} ₭
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end gap-4 w-full md:w-auto h-full min-h-[140px]">
                    <div className="text-right w-full md:w-auto">
                      <p className="text-xs text-slate-400 font-medium">ລາຄາລວມອໍເດີ້</p>
                      <p className="text-xl font-black font-display text-indigo-600">{order.totalAmount.toLocaleString()} ₭</p>
                    </div>

                    <div className="w-full md:w-auto">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        ຈັດການສະຖານະຈັດສົ່ງ
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, order.status, e.target.value)}
                          className="flex-1 md:w-48 px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs rounded-xl bg-white font-semibold text-slate-700 cursor-pointer"
                        >
                          <option value="ລໍຖ້າດຳເນີນການ">ລໍຖ້າດຳເນີນການ ⏳</option>
                          <option value="ກຳລັງຈັດສົ່ງ">ກຳລັງຈັດສົ່ງ 🚚</option>
                          <option value="ຈັດສົ່ງສຳເລັດ">ຈັດສົ່ງສຳເລັດ ✅</option>
                          <option value="ຍົกເລີກ">ຍົກເລີກ ❌</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-100/50 hover:scale-105 transition-all cursor-pointer"
                          title="ລົບອໍເດີ້"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 3. Sub Tab: Categories Management */}
      {subTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Category Form Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs h-max">
            <h3 className="text-sm font-extrabold font-display text-slate-800 mb-4 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" />
              ເພີ່ມໝວດໝູ່ໃໝ່
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ຊື່ໝວດໝູ່ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ຕົວຢ່າງ: ໂທລະສັບ, ເສື້ອຜ້າ"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all animate-in"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-display rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                {loading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກໝວດໝູ່"}
              </button>
            </form>
          </div>

          {/* Categories List Panel */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
            <h3 className="text-sm font-extrabold font-display text-slate-800 mb-4 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-indigo-600" />
              ລາຍການໝວດໝູ່ທັງໝົດ ({categories.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center col-span-2">ຍັງບໍ່ມີໝວດໝູ່ໃນລະບົບ</p>
              ) : (
                categories.map((cat, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl"
                  >
                    <span className="text-xs font-semibold text-slate-700">{cat}</span>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="ລົບໝວດໝູ່"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Sub Tab: Slides Management */}
      {subTab === "slides" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add/Edit Slide Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs h-max">
            <h3 className="text-sm font-extrabold font-display text-slate-800 mb-4 flex items-center gap-1.5">
              {editingSlide ? (
                <>
                  <Edit className="w-4 h-4 text-indigo-600" />
                  <span>ແກ້ໄຂຮູບສະໄລ້</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>ເພີ່ມຮູບສະໄລ້ໃໝ່</span>
                </>
              )}
            </h3>
            <form onSubmit={handleAddSlide} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ລິ້ງຮູບພາບ (Image URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newSlideUrl}
                  onChange={(e) => setNewSlideUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ຫົວຂໍ້ (Title)
                </label>
                <input
                  type="text"
                  placeholder="ຕົວຢ່າງ: ໂປຣໂມຊັນພິເສດຫຼຸດ 50%"
                  value={newSlideTitle}
                  onChange={(e) => setNewSlideTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ຄຳອະທິບາຍ (Subtitle)
                </label>
                <input
                  type="text"
                  placeholder="ຄຳອະທິບາຍສັ້ນໆ"
                  value={newSlideSubtitle}
                  onChange={(e) => setNewSlideSubtitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                />
              </div>
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-display rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  {loading ? "ກຳລັງບັນທຶກ..." : (editingSlide ? "ຢືນຢັນການແກ້ໄຂ" : "ບັນທຶກຮູບສະໄລ້")}
                </button>
                {editingSlide && (
                  <button
                    type="button"
                    onClick={handleCancelEditSlide}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-display rounded-xl text-xs transition-all cursor-pointer"
                  >
                    ຍົກເລີກການແກ້ໄຂ
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Slides List Panel */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
            <h3 className="text-sm font-extrabold font-display text-slate-800 mb-4 flex items-center gap-1.5">
              <MonitorPlay className="w-4 h-4 text-indigo-600" />
              ສະໄລ້ໂຊທີ່ກຳລັງສະແດງ ({slides.length})
            </h3>
            <div className="space-y-4">
              {slides.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">ຍັງບໍ່ມີຮູບສະໄລ້ໃນລະບົບ</p>
              ) : (
                slides.map((slide) => (
                  <div 
                    key={slide.id} 
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={slide.imageUrl} 
                        alt={slide.title} 
                        className="w-20 h-12 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{slide.title || "(ບໍ່ມີຫົວຂໍ້)"}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{slide.subtitle || "(ບໍ່ມີຄຳອະທິບາຍ)"}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 self-end sm:self-auto flex-shrink-0">
                      <button
                        onClick={() => handleStartEditSlide(slide)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                        title="ແກ້ໄຂຮູບສະໄລ້"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="ລົບຮູບສະໄລ້"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Sub Tab: Shipping Carriers Management */}
      {subTab === "carriers" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add/Edit Carrier Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs h-max">
            <h3 className="text-sm font-extrabold font-display text-slate-800 mb-4 flex items-center gap-1.5">
              {editingCarrier ? (
                <>
                  <Edit className="w-4 h-4 text-indigo-600" />
                  <span>ແກ້ໄຂບໍລິສັດຂົນສົ່ງ</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>ເພີ່ມບໍລິສັດຂົນສົ່ງໃໝ່</span>
                </>
              )}
            </h3>
            <form onSubmit={handleAddCarrier} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ຊື່ບໍລິສັດຂົນສົ່ງ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ຕົວຢ່າງ: Anousith Express"
                  value={newCarrierName}
                  onChange={(e) => setNewCarrierName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ລິ້ງຮູບພາບໂລໂກ້ຂົນສົ່ງ (Logo URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newCarrierLogo}
                  onChange={(e) => setNewCarrierLogo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ລາຍລະອຽด / ໄລຍະເວລາສົ່ງ
                </label>
                <input
                  type="text"
                  placeholder="ຕົວຢ່າງ: ຈັດສົ່ງໄວທົ່ວປະເທດພາຍໃນ 1-2 ວັນ"
                  value={newCarrierDesc}
                  onChange={(e) => setNewCarrierDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                />
              </div>
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-display rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  {loading ? "ກຳລັງບັນທຶກ..." : (editingCarrier ? "ຢືນຢັນການແກ້ໄຂ" : "ບັນທຶກຂົນສົ່ງ")}
                </button>
                {editingCarrier && (
                  <button
                    type="button"
                    onClick={handleCancelEditCarrier}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-display rounded-xl text-xs transition-all cursor-pointer"
                  >
                    ຍົກເລີກການແກ້ໄຂ
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Carriers List Panel */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
            <h3 className="text-sm font-extrabold font-display text-slate-800 mb-4 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-indigo-600" />
              ລາຍການບໍລິສັດຂົນສົ່ງທັງໝົດ ({carriers.length})
            </h3>
            <div className="space-y-4">
              {carriers.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">ຍັງບໍ່ມີບໍລິສັດຂົນສົ່ງໃນລະບົບ</p>
              ) : (
                carriers.map((carrier) => (
                  <div 
                    key={carrier.id} 
                    className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-2xl gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {carrier.logo && carrier.logo.startsWith("http") ? (
                        <img 
                          src={carrier.logo} 
                          alt={carrier.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                          {carrier.logo || "🚛"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{carrier.name}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{carrier.desc || "(ບໍ່ມີລາຍລະອຽດ)"}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleStartEditCarrier(carrier)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                        title="ແກ້ໄຂຂົນສົ່ງ"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCarrier(carrier.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="ລົບຂົນສົ່ງ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Sub Tab: Payment Methods Management */}
      {subTab === "payments" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in-50 duration-200">
          {/* Add/Edit Payment Method Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs h-fit">
            <h3 className="text-sm font-extrabold font-display text-slate-800 mb-4 flex items-center gap-1.5">
              {editingPayment ? (
                <>
                  <Edit className="w-4 h-4 text-indigo-600" />
                  <span>ແກ້ໄຂວິທີການຊຳລະເງິນ</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>ເພີ່ມວິທີການຊຳລະເງິນໃໝ່</span>
                </>
              )}
            </h3>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ຊື່ທະນາຄານ / ວິທີການຊຳລະເງິນ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ຕົວຢ່າງ: BCEL One, LDB Trust, ບັນຊີທະນາຄານ"
                  value={newPaymentName}
                  onChange={(e) => setNewPaymentName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ຊື່ເຈົ້າຂອງບັນຊີ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ຕົວຢ່າງ: WUD CHANNEL SHOP"
                  value={newPaymentAccountName}
                  onChange={(e) => setNewPaymentAccountName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ເລກບັນຊີ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ຕົວຢ່າງ: 160-12-00-52590006"
                  value={newPaymentAccountNumber}
                  onChange={(e) => setNewPaymentAccountNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  ລິ້ງຮູບພາບ QR Code ຮັບເງິນ (QR Code URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://api.qrserver.com/..."
                  value={newPaymentQrImageUrl}
                  onChange={(e) => setNewPaymentQrImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                />
              </div>
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-display rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  {loading ? "ກຳລັງບັນທຶກ..." : (editingPayment ? "ຢືນຢັນການແກ້ໄຂ" : "ບັນທຶກວິທີຊຳລະ")}
                </button>
                {editingPayment && (
                  <button
                    type="button"
                    onClick={handleCancelEditPayment}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-display rounded-xl text-xs transition-all cursor-pointer"
                  >
                    ຍົກເລີກການແກ້ໄຂ
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Payment Methods List Panel */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
            <h3 className="text-sm font-extrabold font-display text-slate-800 mb-4 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              ວິທີການຊຳລະເງິນທັງໝົດ ({payments.length})
            </h3>
            <div className="space-y-4">
              {payments.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">ຍັງບໍ່ມີວິທີການຊຳລະເງິນໃນລະບົບ</p>
              ) : (
                payments.map((payment) => (
                  <div 
                    key={payment.id} 
                    className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {payment.qrImageUrl && payment.qrImageUrl.startsWith("http") ? (
                        <img 
                          src={payment.qrImageUrl} 
                          alt={payment.name} 
                          className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-white p-1 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                          💸
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">{payment.name}</p>
                        <p className="text-[11px] font-medium text-slate-600 mt-0.5">ຊື່ບັນຊີ: {payment.accountName}</p>
                        <p className="text-[11px] font-mono text-indigo-600 font-semibold mt-0.5">ເລກບັນຊີ: {payment.accountNumber}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleStartEditPayment(payment)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                        title="ແກ້ໄຂວິທີການຊຳລະເງິນ"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="ລົບວິທີການຊຳລະເງິນ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Sub Tab: Web Profile Settings */}
      {subTab === "settings" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs max-w-2xl">
          <h3 className="text-sm font-extrabold font-display text-slate-800 mb-4 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-indigo-600" />
            ຕັ້ງຄ່າໂປຣໄຟລ໌ ແລະ ຂໍ້ມູນທົ່ວໄປຂອງເວັບໄຊ
          </h3>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                ຊື່ຮ້านຄ້າ (Shop Name) *
              </label>
              <input
                type="text"
                required
                placeholder="WUD SHOP"
                value={settings.shopName}
                onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                ຄຳຂວັນ / ສາຍສະແດງຜົນ (Slogan)
              </label>
              <input
                type="text"
                placeholder="ແຫຼ່ງລວມສິນຄ້າພຣີມ່ຽມ ແລະ ດີລສຸດພິເສດ"
                value={settings.slogan}
                onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                ເບີໂທຕິດຕໍ່ (Contact Phone)
              </label>
              <input
                type="text"
                placeholder="020-52590006"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-max px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-display rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກຂໍ້ມູນທັງໝົດ"}</span>
            </button>
          </form>
        </div>
      )}

      {/* Product Form Modal (Create / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="product-form-modal">
          <div 
            className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold font-display text-slate-800">
                {editingProduct ? "ແກ້ໄຂຂໍ້ມູນສິນຄ້າ" : "ເພີ່ມສິນຄ້າໃໝ່ໃນຮ້ານ"}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
                id="close-product-form-btn"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-indigo-500" />
                  ຊື່ສິນຄ້າ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ຕົວຢ່າງ: ໂມງອັດສະລິຍະ Smart Watch Series 9"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                  id="form-product-name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  ລາຍລະອຽດສິນຄ້າ
                </label>
                <textarea
                  rows={3}
                  placeholder="ກອກຄຸນສົມບັດສິນຄ້າ, ສະເປັກການໃຊ້ງານ ແລະ ລາຍລະອຽດອື່ນໆ"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all resize-none"
                  id="form-product-desc"
                />
              </div>

              {/* Grid: Price and Original Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <span>₭</span>
                    ລາຄາຂາຍ (ກີບ) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="ຕົວຢ່າງ: 990000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                    id="form-product-price"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <span className="line-through text-slate-400">₭</span>
                    ລາຄາເຕັມກ່ອນຫຼຸດ (ຖ້າມີ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="ຕົວຢ່າງ: 1290000"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                    id="form-product-original-price"
                  />
                </div>
              </div>

              {/* Grid: Stock, Category and Badge */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-indigo-500" />
                    ຈຳນວນສະຕັອກ *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="25"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                    id="form-product-stock"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    ໝວດໝູ່
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs bg-white transition-all font-semibold cursor-pointer"
                    id="form-product-category"
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-rose-500" />
                    ປ້າຍສ່ວນຫຼຸດ (Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="ຕົວຢ່າງ: ຫຼຸດ 20%, ແນະນຳ"
                    value={discountBadge}
                    onChange={(e) => setDiscountBadge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                    id="form-product-badge"
                  />
                </div>
              </div>

              {/* Product Image URLs (Up to 8) */}
              <div className="space-y-2 border border-slate-100 rounded-2xl p-4 bg-slate-50/40">
                <label className="block text-xs font-bold text-slate-600 flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1">
                    <Image className="w-4 h-4 text-indigo-500" />
                    ຮູບພາບສິນຄ້າ (ລິ້ງ URL, ສູງສຸດ 8 ຮູບ) *
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold font-mono">
                    {imageUrls.filter(url => url.trim() !== "").length} / 8 ຮູບ
                  </span>
                </label>
                
                <div className="space-y-2.5">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-slate-400 w-5">
                        #{idx + 1}
                      </span>
                      <input
                        type="url"
                        placeholder={`ລິ້ງຮູບພາບທີ ${idx + 1} (e.g. https://images.unsplash.com/...)`}
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...imageUrls];
                          newUrls[idx] = e.target.value;
                          setImageUrls(newUrls);
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs bg-white transition-all"
                      />
                      {imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newUrls = imageUrls.filter((_, i) => i !== idx);
                            setImageUrls(newUrls);
                          }}
                          className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 transition-colors cursor-pointer"
                          title="ລົບຮູບພາບນີ້"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {imageUrls.length < 8 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (imageUrls.length < 8) {
                        setImageUrls([...imageUrls, ""]);
                      }
                    }}
                    className="mt-2 w-full py-2 border border-dashed border-slate-250 hover:border-indigo-500 text-slate-500 hover:text-indigo-600 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ເພີ່ມລິ້ງຮູບພາບໃໝ່ ({imageUrls.length}/8)</span>
                  </button>
                )}
              </div>

              {/* Submit / Cancel buttons */}
              <div className="pt-4 flex space-x-3 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-display rounded-2xl text-xs transition-all cursor-pointer"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold font-display rounded-2xl text-xs shadow-lg shadow-indigo-100 transition-all cursor-pointer"
                  id="form-product-submit"
                >
                  {loading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກສິນຄ້າ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Payment Slip */}
      {selectedSlipUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedSlipUrl(null)}
        >
          <div 
            className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden p-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center pb-3 border-b border-slate-150/75 mb-3">
              <h3 className="text-xs font-black text-slate-800 tracking-wide">🧾 ຫຼັກຖານການໂອນເງິນ (ສະລິບ)</h3>
              <button 
                onClick={() => setSelectedSlipUrl(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full bg-slate-50 rounded-2xl p-2 flex justify-center items-center border border-slate-100 max-h-[70vh] overflow-y-auto">
              <img 
                src={selectedSlipUrl} 
                alt="Payment Slip Fullsize" 
                className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-xs"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
