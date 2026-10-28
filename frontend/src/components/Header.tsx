import React, { useState } from 'react';
import { Customer } from '../types';
import { Search, ShoppingCart, ChevronDown, Sparkles, LogOut, UserCheck } from 'lucide-react';

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

const BADGES: Record<string, { text: string; color: string }> = {
  'CUST-001': { text: 'Yêu công nghệ', color: 'bg-blue-100 text-blue-700' },
  'CUST-002': { text: 'Tín đồ skincare', color: 'bg-pink-100 text-pink-700' },
  'CUST-003': { text: 'Yêu thể thao', color: 'bg-green-100 text-green-700' },
  'CUST-004': { text: 'Khách mới (cold-start)', color: 'bg-purple-100 text-purple-700' },
};

export const Header: React.FC<HeaderProps> = ({
  customers, selectedCustomer, onSelectCustomer, onOpenInspector, onOpenCart,
  onOpenAuth, onLogout, searchQuery, onSearchChange, onSearchSubmit, cartCount,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="shopee-gradient text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer shrink-0 order-1"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-[#ee4d2d]">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black tracking-tight">Shốp Pii</h1>
        </div>

        {/* Search: full-width row on mobile */}
        <form
          onSubmit={(e) => { e.preventDefault(); onSearchSubmit(); }}
          className="order-3 w-full md:order-2 md:w-auto md:flex-1 md:max-w-2xl flex bg-white rounded-sm p-0.5"
        >
          <input
            type="text"
            placeholder="Tìm sản phẩm, thương hiệu..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-1.5 text-sm text-gray-800 focus:outline-none"
          />
          <button type="submit" className="bg-[#ee4d2d] hover:bg-[#d03b1c] px-4 rounded-sm" aria-label="Tìm kiếm">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Actions */}
        <div className="order-2 md:order-3 ml-auto flex items-center gap-2">
          {/* Demo tools, grouped and visually separate from account actions */}
          <div className="flex items-center rounded border border-white/30 bg-black/10 text-xs">
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-white/10"
                title="Chọn khách hàng mẫu để xem gợi ý"
              >
                <UserCheck className="w-3.5 h-3.5 text-yellow-300" />
                <span className="hidden sm:inline">Khách mẫu</span>
                <ChevronDown className="w-3 h-3 text-white/70" />
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-2xl py-2 z-50 text-gray-800 max-h-96 overflow-y-auto">
                  <p className="px-3 pb-2 text-xs text-gray-500 border-b border-gray-100">
                    Mỗi khách hàng có lịch sử mua/xem riêng, gợi ý sẽ thay đổi theo.
                  </p>
                  {customers.map((c) => {
                    const badge = BADGES[c.id];
                    return (
                      <div
                        key={c.id}
                        onClick={() => { onSelectCustomer(c); setOpen(false); }}
                        className={`px-3 py-2 hover:bg-orange-50 cursor-pointer flex items-center gap-3 ${
                          selectedCustomer?.id === c.id ? 'bg-orange-100/60 font-semibold' : ''
                        }`}
                      >
                        <img src={c.avatar} alt="" className="w-8 h-8 rounded-full bg-gray-50 object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-xs">
                            <span className="truncate">{c.name}</span>
                            <span className="text-gray-400">{c.id}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500">
                            {badge && <span className={`px-1.5 rounded ${badge.color}`}>{badge.text}</span>}
                            <span>{c.boughtCount ?? 0} mua • {c.viewedCount ?? 0} xem</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              onClick={onOpenInspector}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border-l border-white/30 hover:bg-white/10"
              title="Xem truy vấn Cypher và PROFILE"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span className="hidden md:inline">Xem thuật toán</span>
            </button>
          </div>

          {/* Account */}
          {selectedCustomer ? (
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <img src={selectedCustomer.avatar} alt="" className="w-6 h-6 rounded-full bg-white object-cover" />
              <span className="max-w-[110px] truncate font-semibold">{selectedCustomer.name}</span>
              <button onClick={onLogout} title="Đăng xuất" className="text-white/80 hover:text-white">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold">
              <button onClick={() => onOpenAuth('register')} className="hover:text-yellow-200">Đăng ký</button>
              <button onClick={() => onOpenAuth('login')} className="bg-white text-[#ee4d2d] px-3 py-1.5 rounded-sm">Đăng nhập</button>
            </div>
          )}

          <button onClick={onOpenCart} className="relative p-2 rounded-full hover:bg-white/10" title="Giỏ hàng">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-white text-[#ee4d2d] text-[11px] font-black min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
