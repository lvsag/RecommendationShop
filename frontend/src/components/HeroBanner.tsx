import React from 'react';
import {
  Zap,
  Truck,
  Ticket,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
      {/* Top Banner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Large Banner */}
        <div className="lg:col-span-2 relative h-60 md:h-64 rounded-sm overflow-hidden shadow-sm group">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200"
            alt="Siêu Đại Tiệc Mua Sắm Shốp Pii"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent flex flex-col justify-center px-8 text-white">
            <span className="bg-[#ee4d2d] text-white text-[11px] font-bold px-2 py-0.5 rounded w-max mb-2 uppercase tracking-wide">
              Shốp Pii Siêu Sale
            </span>
            <h2 className="text-2xl md:text-3xl font-black max-w-md leading-tight">
              ĐẠI TIỆC MUA SẮM THẢNH THƠI GIẢM ĐẾN 50%
            </h2>
            <p className="text-xs md:text-sm text-gray-200 mt-2 max-w-sm">
              Hàng ngàn sản phẩm công nghệ, thời trang, mỹ phẩm chính hãng giảm sốc hôm nay!
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="bg-yellow-400 text-gray-900 font-extrabold text-xs px-3 py-1.5 rounded-sm shadow">
                MIỄN PHÍ VẬN CHUYỂN 0Đ
              </span>
              <span className="text-xs text-white/90">
                ⚡ Giao nhanh toàn quốc
              </span>
            </div>
          </div>
        </div>

        {/* Right 2 Stacked Mini Banners */}
        <div className="flex flex-col gap-3">
          <div className="relative h-28 md:h-[122px] rounded-sm overflow-hidden shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600"
              alt="Mỹ phẩm chính hãng Shốp Pii"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3 text-white">
              <span className="text-[11px] font-bold text-yellow-300">SHỐP PII BEAUTY MALL</span>
              <h3 className="text-xs font-semibold">Mỹ Phẩm & Chăm Sóc Da - Giảm Đến 40%</h3>
            </div>
          </div>

          <div className="relative h-28 md:h-[122px] rounded-sm overflow-hidden shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600"
              alt="Thể thao năng động"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3 text-white">
              <span className="text-[11px] font-bold text-yellow-300">THỜI TRANG & THỂ THAO</span>
              <h3 className="text-xs font-semibold">Ưu Đãi Trang Phục & Dụng Cụ Tập Luyện</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Shopee Quick Feature Badges */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-3 bg-white p-3 rounded-sm shadow-sm border border-gray-100">
        <div className="flex flex-col items-center text-center group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ee4d2d] group-hover:scale-110 transition">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[11px] font-medium text-gray-700 mt-1.5 leading-tight">Khung Giờ Săn Sale</span>
        </div>

        <div className="flex flex-col items-center text-center group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-green-600 group-hover:scale-110 transition">
            <Truck className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-gray-700 mt-1.5 leading-tight">Miễn Phí Vận Chuyển</span>
        </div>

        <div className="flex flex-col items-center text-center group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-600 group-hover:scale-110 transition">
            <Ticket className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-gray-700 mt-1.5 leading-tight">Mã Giảm Giá 500k</span>
        </div>

        <div className="flex flex-col items-center text-center group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 group-hover:scale-110 transition">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-gray-700 mt-1.5 leading-tight">Chính Hãng 100%</span>
        </div>

        <div className="flex flex-col items-center text-center group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-gray-700 mt-1.5 leading-tight">Top Bán Chạy</span>
        </div>

        <div className="flex flex-col items-center text-center group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 group-hover:scale-110 transition">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-gray-700 mt-1.5 leading-tight">Gợi Ý Mua Sắm</span>
        </div>

        <div className="flex flex-col items-center text-center group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-110 transition">
            <RotateCcw className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-gray-700 mt-1.5 leading-tight">Đổi Trả 7 Ngày</span>
        </div>

        <div className="flex flex-col items-center text-center group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 group-hover:scale-110 transition">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-gray-700 mt-1.5 leading-tight">Hàng Quốc Tế</span>
        </div>
      </div>
    </div>
  );
};
