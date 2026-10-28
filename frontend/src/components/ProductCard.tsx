import React from 'react';
import { Product, RecommendedProduct } from '../types';
import { Star, ShoppingCart, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product | RecommendedProduct;
  onView: (product: Product) => void;
  onBuy: (product: Product) => void | boolean | Promise<void | boolean>;
  onAddToCart?: (product: Product) => void;
  isRecommended?: boolean;
}

const vnd = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

export const ProductCard: React.FC<ProductCardProps> = ({ product, onView, onBuy, onAddToCart, isRecommended = false }) => {
  const rec = product as RecommendedProduct;
  const showReason = (isRecommended || (rec.score ?? 0) > 0) && rec.reason;

  return (
    <div className="bg-white rounded-sm border border-gray-100 overflow-hidden shopee-card flex flex-col h-full relative hover:border-[#ee4d2d]/50">
      {product.discountPercent > 0 && (
        <div className="absolute top-0 right-0 z-10 bg-yellow-400 text-[#ee4d2d] text-xs font-extrabold px-1.5 py-0.5">
          -{product.discountPercent}%
        </div>
      )}

      <div onClick={() => onView(product)} className="w-full aspect-square overflow-hidden bg-gray-50 cursor-pointer">
        <img src={product.imageUrl} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
      </div>

      <div className="p-2.5 flex-1 flex flex-col gap-1.5">
        {showReason && (
          <p className="flex items-center gap-1 text-xs text-[#ee4d2d] truncate" title={`${rec.reason} (điểm ${rec.score})`}>
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="truncate">{rec.reason}</span>
          </p>
        )}

        <h4
          onClick={() => onView(product)}
          title={product.name}
          className="text-sm text-gray-800 line-clamp-2 hover:text-[#ee4d2d] cursor-pointer leading-snug min-h-[2.5rem]"
        >
          {product.name}
        </h4>

        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm font-bold text-[#ee4d2d]">{vnd(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">{vnd(product.originalPrice)}</span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {product.rating ? product.rating.toFixed(1) : '5.0'}
          </span>
          <span>Đã bán {product.soldCount > 1000 ? `${(product.soldCount / 1000).toFixed(1)}k` : product.soldCount}</span>
        </div>

        <div className="flex gap-1.5 mt-auto pt-1">
          <button
            onClick={() => (onAddToCart ? onAddToCart(product) : onBuy(product))}
            className="border border-[#ee4d2d] text-[#ee4d2d] hover:bg-orange-50 p-1.5 rounded"
            title="Thêm vào giỏ hàng"
            aria-label="Thêm vào giỏ hàng"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button
            onClick={() => onBuy(product)}
            className="flex-1 bg-[#ee4d2d] hover:bg-[#d03b1c] text-white text-xs font-semibold py-1.5 rounded"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
};
