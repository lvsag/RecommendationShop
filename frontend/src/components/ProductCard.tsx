import React from 'react';
import { Product, RecommendedProduct } from '../types';
import { Star, ShoppingCart, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product | RecommendedProduct;
  onView: (product: Product) => void;
  onBuy: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  isRecommended?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onView,
  onBuy,
  onAddToCart,
  isRecommended = false,
}) => {
  const recProduct = product as RecommendedProduct;
  const hasRecommendationInfo = isRecommended || (recProduct.score !== undefined && recProduct.score > 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  return (
    <div className="bg-white rounded-sm border border-gray-100 overflow-hidden shopee-card flex flex-col justify-between relative group shadow-sm hover:border-[#ee4d2d]/50">
      {/* Top Discount Badge */}
      {product.discountPercent > 0 && (
        <div className="absolute top-0 right-0 z-10 bg-yellow-400 text-[#ee4d2d] text-[10px] font-extrabold px-1.5 py-0.5 text-center leading-tight shadow-sm">
          <span>{product.discountPercent}%</span>
          <span className="block text-[8px] text-white bg-[#ee4d2d] px-0.5 mt-0.5 uppercase">
            GIẢM
          </span>
        </div>
      )}

      {/* Shopee Mall Badge */}
      <div className="absolute top-2 left-0 z-10 bg-[#ee4d2d] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-r shadow-sm">
        Mall
      </div>

      {/* Product Image */}
      <div
        onClick={() => onView(product)}
        className="w-full h-44 sm:h-48 overflow-hidden bg-gray-50 cursor-pointer relative"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />
      </div>

      {/* Card Body */}
      <div className="p-2.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Recommendation Reason & Score Badge (if recommended) */}
          {hasRecommendationInfo && recProduct.reason && (
            <div className="mb-1.5 bg-orange-50 border border-orange-200 rounded p-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#ee4d2d]">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-orange-500 fill-current animate-pulse" />
                  Gợi Ý Phù Hợp
                </span>
                <span className="bg-[#ee4d2d] text-white px-1 rounded text-[9px]">
                  Score: {recProduct.score}
                </span>
              </div>
              <p className="text-[10px] text-gray-600 mt-0.5 line-clamp-1 italic">
                {recProduct.reason}
              </p>
            </div>
          )}

          {/* Product Title */}
          <h4
            onClick={() => onView(product)}
            className="text-xs text-gray-800 line-clamp-2 hover:text-[#ee4d2d] cursor-pointer font-normal leading-snug mb-1"
            title={product.name}
          >
            {product.name}
          </h4>

          {/* Price Row */}
          <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
            <span className="text-sm font-bold text-[#ee4d2d]">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] text-gray-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Rating & Sold count */}
        <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-0.5 text-yellow-400">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-gray-700 font-medium text-[10px]">
              {product.rating ? product.rating.toFixed(1) : '5.0'}
            </span>
          </div>
          <span className="text-gray-500 text-[10px]">
            Đã bán {product.soldCount > 1000 ? `${(product.soldCount / 1000).toFixed(1)}k` : product.soldCount}
          </span>
        </div>

        {/* Action Buttons: Thêm Giỏ & Mua Ngay */}
        <div className="grid grid-cols-2 gap-1.5 mt-2.5">
          <button
            onClick={() => onAddToCart ? onAddToCart(product) : onBuy(product)}
            className="border border-[#ee4d2d] text-[#ee4d2d] hover:bg-orange-50 text-[11px] font-medium py-1 px-1 rounded flex items-center justify-center gap-1 transition"
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart className="w-3 h-3" />
            <span>Thêm Giỏ</span>
          </button>

          <button
            onClick={() => onBuy(product)}
            className="bg-[#ee4d2d] hover:bg-[#d03b1c] text-white text-[11px] font-bold py-1 px-1 rounded flex items-center justify-center gap-1 transition shadow-sm"
            title="Mua ngay lập tức"
          >
            <span>Mua Ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
