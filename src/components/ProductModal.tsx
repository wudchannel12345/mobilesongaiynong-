import React from "react";
import { Product } from "../types";
import { X, ShoppingCart, Tag, Check, Package, Layers } from "lucide-react";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isItemInCart: boolean;
}

export default function ProductModal({
  product,
  onClose,
  onAddToCart,
  isItemInCart
}: ProductModalProps) {
  if (!product) return null;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const isOutOfStock = product.stock <= 0;
  
  // Calculate savings
  const savedAmount = hasDiscount ? (product.originalPrice! - product.price) : 0;
  const savedPercent = hasDiscount ? Math.round((savedAmount / product.originalPrice!) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity" id="product-detail-modal">
      <div 
        className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row animate-in fade-in-50 zoom-in-95 duration-200 max-h-[90vh] md:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 shadow-md hover:scale-105 transition-all cursor-pointer"
          id="close-detail-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Panel */}
        <div className="md:w-1/2 relative bg-slate-50 aspect-square md:aspect-auto flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {product.discountBadge && (
            <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold font-display px-3 py-1 rounded-full shadow-sm">
              {product.discountBadge}
            </span>
          )}
        </div>

        {/* Product Info Panel */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Category */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase bg-indigo-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {product.category}
              </span>
              
              {product.stock > 0 ? (
                <span className="text-[10px] font-bold text-emerald-600 tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  ຄົງເຫຼືອ {product.stock} ຊິ້ນ
                </span>
              ) : (
                <span className="text-[10px] font-bold text-rose-600 tracking-wider bg-rose-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  ສິນຄ້າໝົດ
                </span>
              )}
            </div>

            {/* Product Title */}
            <h2 className="text-xl font-extrabold font-display text-slate-800 mt-4 leading-snug">
              {product.name}
            </h2>

            {/* Price section */}
            <div className="mt-4 p-3 bg-slate-50/60 rounded-2xl flex items-center justify-between border border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium">ລາຄາຂາຍ</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black font-display text-slate-900">
                    {product.price.toLocaleString()} ₭
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-slate-400 line-through font-medium">
                      {product.originalPrice?.toLocaleString()} ₭
                    </span>
                  )}
                </div>
              </div>

              {hasDiscount && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-3 py-1.5 rounded-xl text-center flex flex-col justify-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider">ປະຢັດ</span>
                  <span className="text-xs font-bold font-display">{savedAmount.toLocaleString()} ₭ (-{savedPercent}%)</span>
                </div>
              )}
            </div>

            {/* Product Description */}
            <div className="mt-5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                ລາຍລະອຽດສິນຄ້າ
              </h4>
              <p className="text-xs text-slate-600 font-sans mt-2 leading-relaxed whitespace-pre-line max-h-[150px] overflow-y-auto">
                {product.description || "ບໍ່ມີລາຍລະອຽດສິນຄ້າເພີ່ມເຕີມສຳລັບສິນຄ້ານີ້"}
              </p>
            </div>
          </div>

          {/* Add to Cart CTA */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              disabled={isOutOfStock}
              onClick={() => {
                onAddToCart(product);
              }}
              className={`w-full flex items-center justify-center py-3.5 rounded-2xl font-bold font-display transition-all cursor-pointer ${
                isOutOfStock
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : isItemInCart
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100/50"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-98"
              }`}
              id="modal-add-to-cart-btn"
            >
              {isOutOfStock ? (
                <span>ສິນຄ້າຊິ້ນນີ້ໝົດແລ້ວ</span>
              ) : isItemInCart ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  <span>ເພີ່ມລົງໃນກະຕ່າຮຽບຮ້ອຍແລ້ວ</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  <span>ໃສ່ກະຕ່າສິນຄ້າ • {product.price.toLocaleString()} ₭</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
