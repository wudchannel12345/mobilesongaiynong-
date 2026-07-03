import React from "react";
import { Product } from "../types";
import { Plus, Check, Info } from "lucide-react";

interface ProductCardProps {
  key?: any;
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  isItemInCart: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
  isItemInCart
}: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const isOutOfStock = product.stock <= 0;

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200/80 transition-all duration-300 flex flex-col group h-full"
      id={`product-card-${product.id}`}
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden cursor-pointer" onClick={() => onViewDetails(product)}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        
        {/* Discount Badge */}
        {product.discountBadge && (
          <span className="absolute top-3 left-3 bg-rose-500 text-white text-[11px] font-bold font-display px-2.5 py-1 rounded-full shadow-sm">
            {product.discountBadge}
          </span>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-slate-800 text-white text-xs font-bold font-display px-3 py-1.5 rounded-lg shadow-sm">
              ສິນຄ້າໝົດຊົ່ວຄາວ
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase bg-indigo-50 px-2 py-0.5 rounded-md">
            {product.category}
          </span>

          {/* Product Name */}
          <h3 
            onClick={() => onViewDetails(product)}
            className="text-slate-800 font-bold font-display text-sm mt-2 line-clamp-1 group-hover:text-indigo-600 transition-colors cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 font-sans mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-end justify-between">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[11px] text-slate-400 line-through font-medium">
                {product.originalPrice?.toLocaleString()} ₭
              </span>
            )}
            <span className="text-slate-900 font-extrabold text-base font-display">
              {product.price.toLocaleString()} ₭
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => onViewDetails(product)}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="ເບິ່ງລາຍລະອຽດ"
              id={`view-detail-btn-${product.id}`}
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              disabled={isOutOfStock}
              onClick={() => onAddToCart(product)}
              className={`flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold font-display transition-all cursor-pointer ${
                isOutOfStock
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : isItemInCart
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100/50"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:shadow-indigo-200"
              }`}
              id={`add-to-cart-btn-${product.id}`}
            >
              {isItemInCart ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  ເພີ່ມແລ້ວ
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  ໃສ່ກະຕ່າ
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
