import React from 'react';
import { Category } from '../types';

interface CategoryListProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, selectedCategoryId, onSelectCategory }) => {
  const chip = (active: boolean) =>
    `shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition ${
      active
        ? 'border-[#ee4d2d] bg-orange-50 text-[#ee4d2d] font-semibold'
        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
    }`;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Danh mục sản phẩm">
      <button onClick={() => onSelectCategory('')} className={chip(selectedCategoryId === '')}>
        Tất cả
      </button>
      {categories.map((cat) => (
        <button key={cat.id} onClick={() => onSelectCategory(cat.id)} className={chip(selectedCategoryId === cat.id)}>
          <span>{cat.icon || '📦'}</span>
          <span>{cat.name}</span>
          {cat.productCount ? <span className="text-gray-400">{cat.productCount}</span> : null}
        </button>
      ))}
    </div>
  );
};
