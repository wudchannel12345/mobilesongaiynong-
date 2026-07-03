import React, { useState } from "react";
import { CheckCircle, MapPin, Phone, User, Truck, Clipboard, Check } from "lucide-react";
import { Order } from "../types";

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderSuccessModal({ order, onClose }: OrderSuccessModalProps) {
  if (!order) return null;

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity" id="order-success-modal">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 p-6 animate-in fade-in-50 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-3 shadow-md shadow-emerald-50/50">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold font-display text-slate-800">ສັ່ງຊື້ສິນຄ້າສຳເລັດແລ້ວ!</h2>
          <p className="text-xs text-slate-500 font-sans mt-1">ອໍເດີ້ໄດ້ຮັບການບັນທຶກ ແລະ ສົ່ງຂໍ້ມູນແຈ້ງເຕືອນໄປຍັງແອດມິນຮຽບຮ້ອຍແລ້ວ</p>
        </div>

        {/* Order Number Box */}
        <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">ລະຫັດອໍເດີ້ສຳລັບຕິດຕາມ</span>
            <p className="text-base font-extrabold font-display text-indigo-900 mt-0.5">{order.orderNumber}</p>
          </div>
          <button
            onClick={copyToClipboard}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold ${
              copied 
                ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                : "bg-white text-indigo-600 hover:bg-indigo-50 border-indigo-100 hover:scale-105"
            }`}
            title="ຄັດລອກລະຫັດອໍເດີ້"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>ຄັດລອກແລ້ວ</span>
              </>
            ) : (
              <Clipboard className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Delivery Details */}
        <div className="mt-5 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ລາຍລະອຽດການຈັດສົ່ງ</h3>

          {/* Customer */}
          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-500">ຜູ້ຮັບ:</span> {order.customerName}
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-500">ເບີຕິດຕໍ່:</span> {order.contactPhone}
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-500">ທີ່ຢູ່ຈັດສົ່ງ:</span> {order.shippingAddress}
            </div>
          </div>

          {/* Carrier */}
          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <Truck className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-500">ຜູ້ຈັດສົ່ງ:</span> {order.shippingProvider}
            </div>
          </div>
        </div>

        {/* Item Summary */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs mb-3">
            <span className="text-slate-500 font-medium">ລາຍການສິນຄ້າທັງໝົດ ({order.items.length} ລາຍການ)</span>
            <span className="font-bold text-slate-800">ຍອດລວມ: {order.totalAmount.toLocaleString()} ₭</span>
          </div>

          <div className="max-h-[100px] overflow-y-auto space-y-2 pr-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
                <span className="truncate max-w-[250px] font-medium">{item.name}</span>
                <span className="font-bold flex-shrink-0 text-slate-800">x{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold font-display rounded-2xl shadow-md transition-all cursor-pointer text-sm"
            id="close-success-btn"
          >
            ກັບຄືນສູ່ໜ້າຮ້ານຄ້າ
          </button>
        </div>
      </div>
    </div>
  );
}
