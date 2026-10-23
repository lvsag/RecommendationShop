import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { getProductById } from '../api/client';
import { X, Star, ShoppingCart, ShieldCheck, Truck, RefreshCw, Zap, Eye, RotateCcw } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuy: (product: Product, quantity: number) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuy,
  onAddToCart,
}) => {
  const [detailedProduct, setDetailedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setLoading(true);
      getProductById(product.id)
        .then((data) => setDetailedProduct(data))
        .catch((err) => console.error('Error fetching detail:', err))
        .finally(() => setLoading(false));
    } else {
      setDetailedProduct(null);
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const current = detailedProduct || product;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full overflow-hidden relative animate-scale-up my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 bg-white/80 p-1.5 rounded-full z-10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#ee4d2d] mb-2" />
            <p className="text-sm">Đang tải thông tin chi tiết sản phẩm...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Product Image */}
            <div className="p-6 bg-gray-50 flex items-center justify-center">
              <div className="w-full max-h-80 rounded overflow-hidden shadow-sm bg-white">
                <img
                  src={current.imageUrl}
                  alt={current.name}
                  className="w-full h-80 object-cover"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#ee4d2d] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Shốp Pii Mall
                  </span>
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-medium">
                    {current.categoryName || 'Sản phẩm chính hãng'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 leading-snug">
                  {current.name}
                </h3>

                {/* Star rating & Sold count */}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold text-gray-800">
                      {current.rating ? current.rating.toFixed(1) : '5.0'}
                    </span>
                  </div>
                  <span>|</span>
                  <span className="text-gray-700">
                    <strong>{current.soldCount}</strong> Đã bán
                  </span>
                  <span>|</span>
                  <span className="text-gray-500">
                    Mã: {current.id}
                  </span>
                </div>

                {/* Price block */}
                <div className="bg-gray-50 p-4 rounded-sm mt-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-extrabold text-[#ee4d2d]">
                      {formatCurrency(current.price)}
                    </span>
                    {current.originalPrice > current.price && (
                      <>
                        <span className="text-sm text-gray-400 line-through">
                          {formatCurrency(current.originalPrice)}
                        </span>
                        <span className="bg-[#ee4d2d] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          GIẢM {current.discountPercent}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-gray-700 uppercase">Mô tả sản phẩm</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {current.description || 'Sản phẩm chính hãng với bảo hành 12 tháng. Phân phối chính hãng tại hệ thống Shốp Pii.'}
                  </p>
                </div>

                {/* Policies */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-gray-600 bg-orange-50/50 p-2.5 rounded border border-orange-100">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#ee4d2d]" />
                    <span>Chính hãng 100%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span>Miễn phí vận chuyển</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-blue-600" />
                    <span>7 ngày đổi trả dễ dàng</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-purple-600" />
                    <span>Gợi ý theo sở thích</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-xs text-gray-600 font-medium">Số lượng:</span>
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => {
                    onAddToCart(current, quantity);
                    onClose();
                  }}
                  className="bg-orange-100 text-[#ee4d2d] hover:bg-orange-200 text-xs font-bold py-2.5 rounded flex items-center justify-center gap-1.5 transition border border-[#ee4d2d]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Thêm Vào Giỏ Hàng</span>
                </button>
                <button
                  onClick={() => {
                    onBuy(current, quantity);
                    onClose();
                  }}
                  className="bg-[#ee4d2d] hover:bg-[#d03b1c] text-white text-xs font-bold py-2.5 rounded flex items-center justify-center gap-1.5 transition shadow"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Mua Ngay Lập Tức</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
