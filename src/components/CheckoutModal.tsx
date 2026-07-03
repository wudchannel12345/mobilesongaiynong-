import React, { useState } from "react";
import { X, Trash2, Plus, Minus, MapPin, Phone, User, Truck, ShoppingBag, Loader2, CreditCard, ArrowLeft, CheckCircle } from "lucide-react";
import { Product, CarrierItem, PaymentMethod } from "../types";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onOrderSuccess: (orderData: any) => void;
  clearCart: () => void;
  carriers: CarrierItem[];
  payments: PaymentMethod[];
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveFromCart,
  onOrderSuccess,
  clearCart,
  carriers = [],
  payments = []
}: CheckoutModalProps) {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingProvider, setShippingProvider] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [checkoutStep, setCheckoutStep] = useState<"info" | "payment">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipBase64, setSlipBase64] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const totalAmount = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (cartItems.length === 0) {
      setErrorMessage("ກະລຸນາເພີ່ມສິນຄ້າລົງໃນກະຕ່າກ່ອນສັ່ງຊື້");
      return;
    }
    if (!customerName.trim()) {
      setErrorMessage("ກະລຸນາກອກຊື່ ແລະ ນາມສະກຸນຜູ້ຮັບ");
      return;
    }
    if (!contactPhone.trim()) {
      setErrorMessage("ກະລຸນາກອກເບີຕິດຕໍ່");
      return;
    }
    if (!shippingAddress.trim()) {
      setErrorMessage("ກະລຸນາກອກທີ່ຢູ່ຈັດສົ່ງ");
      return;
    }
    if (!shippingProvider) {
      setErrorMessage("ກະລຸນາເລືອກຜູ້ບໍລິການຂົນສົ່ງ");
      return;
    }

    if (!selectedPaymentId && payments.length > 0) {
      setSelectedPaymentId(payments[0].id);
    }

    setCheckoutStep("payment");
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (cartItems.length === 0) {
      setErrorMessage("ກະລຸນາເພີ່ມສິນຄ້າລົງໃນກະຕ່າກ່ອນສັ່ງຊື້");
      return;
    }

    if (!slipBase64) {
      setErrorMessage("ກະລຸນາແນບຮູບພາບສະລິບການໂອນເງິນກ່ອນຢືນຢັນ");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload payment slip
      const uploadRes = await fetch("/api/upload-base64", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          base64Data: slipBase64
        })
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        setErrorMessage(uploadData.message || "ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫຼດສະລິບ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ");
        setIsSubmitting(false);
        return;
      }

      const slipUrl = uploadData.imageUrl;

      // 2. Place order
      const itemsPayload = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const activePayment = payments.find(p => p.id === selectedPaymentId) || payments[0];
      const paymentName = activePayment ? activePayment.name : "BCEL One";

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customerName,
          contactPhone,
          shippingAddress,
          shippingProvider,
          items: itemsPayload,
          paymentMethod: paymentName,
          paymentSlip: slipUrl
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        clearCart();
        setCheckoutStep("info");
        setSlipFile(null);
        setSlipBase64("");
        onOrderSuccess(data.order);
      } else {
        setErrorMessage(data.message || "ເກີດຂໍ້ຜິດພາດໃນການສັ່ງຊື້ ກະລຸນາລອງໃໝ່ອີกຄັ້ງ");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("ບໍ່ສາມາດເຊື່ອມຕໍ່ເຊີບເວີໄດ້ ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ອິນເຕີເນັດ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity" id="checkout-modal">
      <div 
        className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row animate-in fade-in-50 zoom-in-95 duration-200 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Panel: Shopping Cart Items */}
        <div className="w-full md:w-1/2 p-6 bg-slate-50 border-r border-slate-100 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                ກະຕ່າສິນຄ້າຂອງທ່ານ ({cartItems.length})
              </h2>
              <button onClick={onClose} className="md:hidden p-1.5 rounded-full hover:bg-slate-200 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <p className="text-sm font-medium">ບໍ່ມີສິນຄ້າໃນກະຕ່າ</p>
                <button 
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold font-display cursor-pointer hover:bg-indigo-700"
                >
                  ເລືອກເບິ່ງສິນຄ້າເພື່ອສັ່ງຊື້
                </button>
              </div>
            ) : (
              <div className="space-y-4 mt-4 max-h-[300px] md:max-h-[450px] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div 
                    key={item.product.id} 
                    className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-xs"
                    id={`cart-item-${item.product.id}`}
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-indigo-600 font-bold mt-0.5">{item.product.price.toLocaleString()} ₭</p>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center space-x-1.5 mt-2">
                        <button
                          type="button"
                          disabled={item.quantity <= 1}
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-500 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold font-display w-6 text-center text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= item.product.stock}
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-500 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] text-slate-400 font-sans ml-1">
                          (ສະຕັອກເຫຼືອ {item.product.stock})
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveFromCart(item.product.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="ລົບອອກຈາກກະຕ່າ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          {cartItems.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center text-sm mb-1.5">
                <span className="text-slate-500">ລາຄາລວມສິນຄ້າ</span>
                <span className="font-semibold text-slate-700">{totalAmount.toLocaleString()} ₭</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-3">
                <span className="text-slate-500">ຄ່າຈັດສົ່ງ</span>
                <span className="font-semibold text-emerald-600">ຟຣີຄ່າຈັດສົ່ງ</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-200">
                <span className="text-base font-bold text-slate-800">ຍອດຊຳລະທັງໝົດ</span>
                <span className="text-lg font-black font-display text-indigo-600">{totalAmount.toLocaleString()} ₭</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Delivery & Contact details Form / Payment QR screen */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto" id="checkout-right-panel">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
                {checkoutStep === "info" ? (
                  <>
                    <Truck className="w-5 h-5 text-indigo-600" />
                    <span>ຂໍ້ມູນຈັດສົ່ງ ແລະ ຜູ້ຮັບສິນຄ້າ</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <span>ຊຳລະເງິນເພື່ອຢືນຢັນການສັ່ງຊື້</span>
                  </>
                )}
              </h2>
              <button onClick={onClose} className="hidden md:block p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {checkoutStep === "info" ? (
              <form onSubmit={handleProceedToPayment} className="space-y-4 mt-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    ຊື່ ແລະ ນາມສະກຸນຜູ້ຮັບ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ກະລຸນາກອກຊື່ ແລະ ນາມສະກຸນ"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-500" />
                    ເບີໂທຕິດຕໍ່ *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="ກະລຸນາກອກເບີໂທຕິດຕໍ່"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                  />
                </div>

                {/* Shipping Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    ທີ່ຢູ່ຈັດສົ່ງສິນຄ້າໂດຍລະອຽດ *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="ກະລຸນາກອກ ບ້ານ, ເມືອງ, ແຂວງ ແລະ ຈຸດອ້າງອີງທີ່ຊັດເຈນ"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs transition-all"
                    id="checkout-address-input"
                  />
                </div>

                {/* Shipping Provider */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-indigo-500" />
                    ເລືອກບໍລິສັດຂົນສົ່ງ *
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-1">
                    {carriers.map((carrier) => (
                      <div
                        key={carrier.id}
                        onClick={() => setShippingProvider(carrier.name)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2 ${
                          shippingProvider === carrier.name
                            ? "border-indigo-500 bg-indigo-50/50"
                            : "border-slate-200 hover:border-indigo-100 hover:bg-slate-50/50"
                        }`}
                        id={`carrier-item-${carrier.id}`}
                      >
                        {carrier.logo && carrier.logo.startsWith("http") ? (
                          <img 
                            src={carrier.logo} 
                            alt={carrier.name} 
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0 font-bold text-xs">
                            {carrier.logo || "🚛"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{carrier.name}</p>
                          <p className="text-[9px] text-slate-400 font-sans truncate">{carrier.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proceed Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={cartItems.length === 0}
                    className="w-full flex items-center justify-center py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold font-display rounded-2xl shadow-lg shadow-indigo-100 transition-all cursor-pointer text-xs"
                    id="proceed-payment-btn"
                  >
                    <span>ດຳເນີນການຊຳລະເງິນ • {totalAmount.toLocaleString()} ₭</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitOrder} className="space-y-4 mt-4 animate-in fade-in-50 duration-200">
                {/* Payment Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                    ເລືອກຊ່ອງທາງການຊຳລະເງິນ *
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-[110px] overflow-y-auto pr-1">
                    {payments.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPaymentId(p.id)}
                        className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2 ${
                          (selectedPaymentId === p.id || (!selectedPaymentId && payments[0]?.id === p.id))
                            ? "border-indigo-500 bg-indigo-50/50"
                            : "border-slate-200 hover:border-indigo-100 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-extrabold text-[10px] flex-shrink-0">
                          💸
                        </div>
                        <span className="text-xs font-bold text-slate-700 truncate">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Show QR & Account Info */}
                {(() => {
                  const activePayment = payments.find(p => p.id === selectedPaymentId) || payments[0];
                  if (!activePayment) {
                    return (
                      <div className="text-center py-4 text-xs text-slate-400">ຍັງບໍ່ມີວິທີການຊຳລະເງິນໃນລະບົບ</div>
                    );
                  }
                  return (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center space-y-3">
                      <p className="text-xs font-extrabold text-slate-700 text-center uppercase tracking-wide flex items-center gap-1">
                        <span>📱</span> ສະແກນ QR Code ເພື່ອຊຳລະເງິນ
                      </p>
                      
                      {activePayment.qrImageUrl && activePayment.qrImageUrl.startsWith("http") ? (
                        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex justify-center items-center">
                          <img 
                            src={activePayment.qrImageUrl} 
                            alt="Payment QR" 
                            className="w-32 h-32 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 font-bold text-xs">
                          ບໍ່ມີຮູບ QR
                        </div>
                      )}

                      <div className="w-full space-y-1 text-center bg-white p-2.5 rounded-xl border border-slate-100 text-xs">
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                          <span className="text-slate-400 text-[10px]">ຊື່ບັນຊີ:</span>
                          <span className="font-bold text-slate-800">{activePayment.accountName}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                          <span className="text-slate-400 text-[10px]">ເລກບັນຊີ:</span>
                          <span className="font-mono font-bold text-indigo-600">{activePayment.accountNumber}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-400 text-[10px]">ຍອດໂອນທັງໝົດ:</span>
                          <span className="font-black text-slate-800 text-sm">{totalAmount.toLocaleString()} ₭</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                        * ເມື່ອທ່ານໂອນເງິນສຳເລັດແລ້ວ ກະລຸນາແນບຮູບສະລິບ ແລະ ກົດປຸ່ມຢືນຢັນດ້ານລຸ່ມເພື່ອສົ່ງຂໍ້ມູນ
                      </p>
                    </div>
                  );
                })()}

                {/* Upload Payment Slip (Required) */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>🧾</span> ແນບຫຼັກຖານການໂອນເງິນ (ສະລິບ) * <span className="text-rose-500 font-extrabold text-[10px]">(ຈຳເປັນຕ້ອງໃສ່)</span>
                  </label>
                  
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white rounded-xl p-4 transition-all cursor-pointer relative group min-h-[120px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {slipBase64 ? (
                      <div className="flex flex-col items-center space-y-2">
                        <img
                          src={slipBase64}
                          alt="Slip Preview"
                          className="w-32 h-auto object-contain rounded-lg border border-slate-100 max-h-48 shadow-xs"
                        />
                        <span className="text-[10px] text-indigo-600 font-bold group-hover:underline">ກົດເພື່ອປ່ຽນຮູບສະລິບ</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-1.5 py-1 text-slate-400 text-center">
                        <div className="p-2 bg-indigo-50 text-indigo-500 rounded-full">
                          <Plus className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-slate-600">ກົດ ຫຼື ລາກຮູບສະລິບມາທີ່ນີ້</p>
                        <p className="text-[9px] text-slate-400">ຮອງຮັບໄຟລ໌ຮູບພາບ (PNG, JPG, WEBP)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Back & Confirm CTA Button Grid */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep("info")}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-display rounded-2xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>ກັບຄືນ</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || cartItems.length === 0}
                    className="flex-1 flex items-center justify-center py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold font-display rounded-2xl shadow-lg shadow-emerald-100 transition-all cursor-pointer text-xs gap-1.5"
                    id="submit-order-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>ກຳລັງຢືນຢັນ...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>ຂ້ອຍໂອນເງິນແລ້ວ ຢືນຢັນການຊື້</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}