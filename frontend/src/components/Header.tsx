import React, { useState } from 'react';
import { Customer } from '../types';
import {
  Search,
  ShoppingCart,
  User,
  Share2,
  ChevronDown,
  Bell,
  HelpCircle,
  Globe,
  Sparkles,
  LogOut,
  UserCheck,
} from 'lucide-react';

interface HeaderProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  onOpenInspector: () => void;
  onOpenCart: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  cartCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  customers,
  selectedCustomer,
  onSelectCustomer,
  onOpenInspector,
  onOpenCart,
  onOpenAuth,
  onLogout,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  cartCount,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getCustomerBadge = (id: string) => {
    if (id === 'CUST-001') return { text: 'Yêu Công Nghệ', color: 'bg-blue-100 text-blue-700' };
    if (id === 'CUST-002') return { text: 'Tín Đồ Skincare', color: 'bg-pink-100 text-pink-700' };
    if (id === 'CUST-003') return { text: 'Yêu Thể Thao', color: 'bg-green-100 text-green-700' };
    if (id === 'CUST-004') return { text: 'Khách Hàng Mới Tinh', color: 'bg-purple-100 text-purple-700 font-bold' };
    return null;
  };

  return (
    <header className="shopee-gradient text-white sticky top-0 z-40 shadow-md">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between text-xs border-b border-white/20">
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-gray-200 transition">Kênh Người Bán</a>
          <span className="text-white/40">|</span>
          <a href="#" className="hover:text-gray-200 transition">Tải ứng dụng</a>
          <span className="text-white/40">|</span>
          <div className="flex items-center gap-1">
            <span>Kết nối</span>
            <Share2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 cursor-pointer hover:text-gray-200">
            <Bell className="w-3.5 h-3.5" />
            <span>Thông Báo</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-gray-200">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Hỗ Trợ</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-gray-200">
            <Globe className="w-3.5 h-3.5" />
            <span>Tiếng Việt</span>
          </div>

          {/* Authentication State */}
          {selectedCustomer ? (
            <div className="flex items-center gap-2 border-l border-white/30 pl-3">
              <div className="flex items-center gap-1.5 bg-white/20 px-2 py-0.5 rounded-full font-medium">
                <img
                  src={selectedCustomer.avatar}
                  alt={selectedCustomer.name}
                  className="w-4 h-4 rounded-full bg-white object-cover"
                />
                <span className="truncate max-w-[120px] font-semibold">{selectedCustomer.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="text-white/80 hover:text-white flex items-center gap-1 text-[11px] underline"
                title="Đăng xuất tài khoản"
              >
                <LogOut className="w-3 h-3" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-white/30 pl-3 font-semibold">
              <button
                onClick={() => onOpenAuth('register')}
                className="hover:text-yellow-200 transition"
              >
                Đăng Ký
              </button>
              <span className="text-white/40">|</span>
              <button
                onClick={() => onOpenAuth('login')}
                className="hover:text-yellow-200 transition"
              >
                Đăng Nhập
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
        {/* Brand Logo: Shốp Pii */}
        <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#ee4d2d] shadow-sm">
            <svg
              className="w-6 h-6 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              Shốp Pii
            </h1>
            <p className="text-[10px] text-white/90 leading-none">Mua sắm online thảnh thơi giá tốt</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearchSubmit();
            }}
            className="flex items-center bg-white rounded-sm p-1 shadow-sm"
          >
            <input
              type="text"
              placeholder="Shốp Pii bao ship 0Đ - Tìm kiếm sản phẩm, thương hiệu..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-1.5 text-sm text-gray-800 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#ee4d2d] hover:bg-[#d03b1c] text-white px-5 py-2 rounded-sm transition flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Search Suggestions */}
          <div className="flex items-center gap-3 text-[11px] text-white/90 mt-1 pl-1 overflow-x-auto whitespace-nowrap">
            <span onClick={() => { onSearchChange('iPhone 15'); onSearchSubmit(); }} className="cursor-pointer hover:underline">
              iPhone 15 Pro Max
            </span>
            <span onClick={() => { onSearchChange('AirPods Pro'); onSearchSubmit(); }} className="cursor-pointer hover:underline">
              Tai nghe AirPods Pro 2
            </span>
            <span onClick={() => { onSearchChange('Serum B5'); onSearchSubmit(); }} className="cursor-pointer hover:underline">
              Serum B5 The Ordinary
            </span>
            <span onClick={() => { onSearchChange('Clean Code'); onSearchSubmit(); }} className="cursor-pointer hover:underline">
              Sách Clean Code
            </span>
            <span onClick={() => { onSearchChange('Thảm Tập Yoga'); onSearchSubmit(); }} className="cursor-pointer hover:underline">
              Thảm Tập Yoga
            </span>
          </div>
        </div>

        {/* Right Actions: Demo Switcher & Inspector & Cart */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Customer Switcher (Demo / Testing) */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1.5 rounded border border-white/30 flex items-center gap-1.5 transition"
              title="Đổi tài khoản khách hàng để kiểm tra gợi ý"
            >
              <UserCheck className="w-3.5 h-3.5 text-yellow-300" />
              <span className="hidden sm:inline text-[11px]">Đổi User (Demo)</span>
              <ChevronDown className="w-3 h-3 text-white/70" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-2xl py-2 z-50 text-gray-800 border border-gray-100 max-h-96 overflow-y-auto">
                <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs font-bold text-gray-800">CHỌN TÀI KHOẢN TRẢI NGHIỆM</p>
                  <p className="text-[11px] text-gray-500">
                    Hệ thống sẽ cập nhật thuật toán gợi ý tương quan tức thì theo từng khách hàng:
                  </p>
                </div>

                {customers.map((cust) => {
                  const badge = getCustomerBadge(cust.id);
                  const isSelected = selectedCustomer?.id === cust.id;

                  return (
                    <div
                      key={cust.id}
                      onClick={() => {
                        onSelectCustomer(cust);
                        setDropdownOpen(false);
                      }}
                      className={`px-3 py-2 hover:bg-orange-50 cursor-pointer flex items-center gap-3 transition ${
                        isSelected ? 'bg-orange-100/60 font-semibold' : ''
                      }`}
                    >
                      <img
                        src={cust.avatar}
                        alt={cust.name}
                        className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-900 truncate">{cust.name}</span>
                          <span className="text-[10px] text-gray-400">{cust.id}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {badge && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded ${badge.color}`}>
                              {badge.text}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-500">
                            {cust.boughtCount ?? 0} đã mua • {cust.viewedCount ?? 0} đã xem
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Graph Inspector Button (Unobtrusive) */}
          <button
            onClick={onOpenInspector}
            className="bg-black/20 hover:bg-black/35 text-white border border-white/20 text-xs px-2.5 py-1.5 rounded flex items-center gap-1 transition"
            title="Xem phân tích thuật toán Cypher & PROFILE"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden md:inline text-[11px]">Thuật Toán AI</span>
          </button>

          {/* Interactive Shopping Cart Icon (Clickable!) */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-full hover:bg-white/10 transition flex items-center justify-center"
            title="Mở giỏ hàng"
          >
            <ShoppingCart className="w-7 h-7 text-white" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-white text-[#ee4d2d] text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#ee4d2d] shadow">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
