import React from "react";
import { ShoppingCart, User, LogOut, ShoppingBag } from "lucide-react";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  isAdmin: boolean;
  onAdminLoginClick: () => void;
  onAdminLogout: () => void;
  currentTab: "shop" | "admin";
  setCurrentTab: (tab: "shop" | "admin") => void;
  unreadNotifications: number;
  shopName?: string;
  slogan?: string;
}

export default function Navbar({
  cartCount,
  onOpenCart,
  isAdmin,
  onAdminLoginClick,
  onAdminLogout,
  currentTab,
  setCurrentTab,
  unreadNotifications,
  shopName = "WUD SHOP",
  slogan = "ແຫຼ່ງລວມສິນຄ້າພຣີມ່ຽມ"
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div 
            onClick={() => setCurrentTab("shop")}
            className="flex items-center space-x-2 cursor-pointer group"
            id="logo-container"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold font-display tracking-tight text-slate-800">
                {shopName}
              </span>
              <p className="text-[10px] text-slate-400 font-sans -mt-1 font-medium">{slogan}</p>
            </div>
          </div>

          {/* Navigation Links & Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentTab("shop")}
              className={`px-3 py-2 rounded-lg text-sm font-medium font-display transition-colors cursor-pointer ${
                currentTab === "shop"
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              id="nav-shop-btn"
            >
              ໜ້າທຳອິດສິນຄ້າ
            </button>

            {isAdmin && (
              <button
                onClick={() => setCurrentTab("admin")}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium font-display transition-colors flex items-center gap-1 cursor-pointer ${
                  currentTab === "admin"
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                id="nav-admin-btn"
              >
                ລະບົບຈັດການແອດມິນ
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            )}

            {/* Divider */}
            <span className="h-6 w-[1px] bg-slate-200"></span>

            {/* Shopping Cart Button - Hidden when on admin tab */}
            {currentTab !== "admin" && (
              <button
                onClick={onOpenCart}
                className="relative p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all cursor-pointer flex items-center"
                id="cart-trigger-btn"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-indigo-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin Login / Logout */}
            {!isAdmin ? (
              <button
                onClick={onAdminLoginClick}
                className="flex items-center space-x-1.5 px-3 py-2 border border-slate-200 hover:border-indigo-100 hover:bg-indigo-50/50 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-all cursor-pointer"
                id="admin-login-trigger"
              >
                <User className="w-4 h-4" />
                <span>ສຳລັບແອດມິນ</span>
              </button>
            ) : (
              <button
                onClick={onAdminLogout}
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-rose-50 rounded-xl text-xs font-semibold text-slate-700 hover:text-rose-600 transition-all cursor-pointer"
                id="admin-logout-trigger"
              >
                <LogOut className="w-4 h-4" />
                <span>ອອກຈາກລະບົບ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
