import React from 'react';
import { RecommendedProduct, RecommendationMeta, Product } from '../types';
import { ProductCard } from './ProductCard';
import { Flame, RefreshCw, Sparkles, HeartHandshake } from 'lucide-react';

interface RecommendationSectionProps {
  recommendations: RecommendedProduct[];
  meta: RecommendationMeta | null;
  loading: boolean;
  onRefresh: () => void;
  onViewProduct: (product: Product) => void;
  onBuyProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  recommendations,
  meta,
  loading,
  onRefresh,
  onViewProduct,
  onBuyProduct,
  onAddToCart,
}) => {
  const isColdStart = meta?.strategy === 'cold_start_fallback';

  return (
    <section className="max-w-7xl mx-auto px-4 py-3">
      {/* Shopee-style Tab Header */}
      <div className="bg-white rounded-t-sm shadow-sm border border-b-0 border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-[#ee4d2d] shadow-sm">
              <Flame className="w-5 h-5 fill-current animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-[#ee4d2d] tracking-wide uppercase">
                  GỢI Ý HÔM NAY
                </h3>
                {isColdStart ? (
                  <span className="bg-orange-50 text-orange-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-orange-200">
                    Sản Phẩm Thịnh Hành Toàn Sàn
                  </span>
                ) : (
                  <span className="bg-green-50 text-green-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    Được gợi ý theo gu mua sắm của bạn
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {meta?.algorithmDescription || 'Sản phẩm được chọn lọc phù hợp nhất với sở thích của bạn.'}
              </p>
            </div>
          </div>

          {/* Refresh Recommendations */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#ee4d2d] bg-gray-50 hover:bg-orange-50 border border-gray-200 px-3 py-1.5 rounded transition disabled:opacity-50"
            title="Tính toán và cập nhật lại danh sách gợi ý"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#ee4d2d]' : ''}`} />
            <span>Làm Mới Gợi Ý</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white rounded-b-sm shadow-sm p-4 border border-gray-100 border-t-0">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded animate-pulse h-72"></div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">Chưa có dữ liệu gợi ý. Hãy xem hoặc mua một vài sản phẩm để hệ thống học sở thích của bạn!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {recommendations.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onView={onViewProduct}
                onBuy={onBuyProduct}
                onAddToCart={onAddToCart}
                isRecommended={true}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
