import React from 'react';
import { Category } from '../types';
import { LayoutGrid } from 'lucide-react';

interface CategoryListProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-2">
      <div className="bg-white rounded-sm shadow-sm p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#ee4d2d]" />
            DANH MỤC NỔI BẬT
          </h3>
          <span className="text-xs text-gray-400">
            Khám phá 6 ngành hàng được yêu thích
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {/* Tất cả Option */}
          <button
            onClick={() => onSelectCategory('')}
            className={`p-3 rounded-sm border flex flex-col items-center justify-center text-center transition ${
              selectedCategoryId === ''
                ? 'border-[#ee4d2d] bg-orange-50 text-[#ee4d2d] font-bold shadow-sm'
                : 'border-gray-100 hover:border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl mb-1">🏷️</span>
            <span className="text-xs truncate w-full">Tất Cả Sản Phẩm</span>
            <span className="text-[10px] text-gray-400 mt-0.5">108 sản phẩm</span>
          </button>

          {/* Các danh mục */}
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`p-3 rounded-sm border flex flex-col items-center justify-center text-center transition ${
                  isSelected
                    ? 'border-[#ee4d2d] bg-orange-50 text-[#ee4d2d] font-bold shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl mb-1">{cat.icon || '📦'}</span>
                <span className="text-xs truncate w-full font-medium">{cat.name}</span>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  {cat.productCount ? `${cat.productCount} sản phẩm` : 'Xem ngay'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
