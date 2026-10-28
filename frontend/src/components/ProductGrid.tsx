import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ShoppingBag } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onView: (p: Product) => void;
  onBuy: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  emptyMessage?: string;
}

export const GRID_CLASS = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3';

export const ProductGrid: React.FC<ProductGridProps> = ({ products, loading, onView, onBuy, onAddToCart, emptyMessage }) => {
  if (loading) {
    return (
      <div className={GRID_CLASS}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded animate-pulse h-72" />
        ))}
      </div>
    );
  }
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-sm">{emptyMessage || 'Không có sản phẩm nào khớp. Thử bỏ bộ lọc hoặc đổi từ khóa.'}</p>
      </div>
    );
  }
  return (
    <div className={GRID_CLASS}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onView={onView} onBuy={onBuy} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
};
