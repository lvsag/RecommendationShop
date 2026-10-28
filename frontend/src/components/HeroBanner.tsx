import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Ticket } from 'lucide-react';

const PERKS = [
  { icon: Truck, label: 'Miễn phí vận chuyển' },
  { icon: ShieldCheck, label: 'Chính hãng 100%' },
  { icon: RotateCcw, label: 'Đổi trả 7 ngày' },
  { icon: Ticket, label: 'Mã giảm giá 500k' },
];

const Mini: React.FC<{ src: string; tag: string; title: string }> = ({ src, tag, title }) => (
  <div className="relative h-[86px] rounded-sm overflow-hidden">
    <img src={src} alt={title} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex flex-col justify-end p-3 text-white">
      <span className="text-xs font-bold text-yellow-300">{tag}</span>
      <h3 className="text-xs">{title}</h3>
    </div>
  </div>
);

export const HeroBanner: React.FC = () => (
  <div className="space-y-3">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <div className="lg:col-span-2 relative h-44 rounded-sm overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200"
          alt="Đại tiệc mua sắm Shốp Pii"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent flex flex-col justify-center px-6 text-white">
          <h2 className="text-2xl font-black max-w-sm leading-tight">Đại tiệc mua sắm, giảm đến 50%</h2>
          <span className="mt-3 bg-yellow-400 text-gray-900 font-bold text-xs px-3 py-1.5 rounded-sm w-max">
            Miễn phí vận chuyển 0Đ
          </span>
        </div>
      </div>
      <div className="hidden lg:flex flex-col gap-3">
        <Mini src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600" tag="Beauty Mall" title="Mỹ phẩm & chăm sóc da, giảm đến 40%" />
        <Mini src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600" tag="Thể thao" title="Trang phục & dụng cụ tập luyện" />
      </div>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-2.5 rounded-sm border border-gray-100 text-xs text-gray-700">
      {PERKS.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center justify-center gap-2">
          <Icon className="w-4 h-4 text-[#ee4d2d]" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  </div>
);
