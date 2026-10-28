import React from 'react';
import { RecommendedProduct, RecommendationMeta, Product } from '../types';
import { ProductCard } from './ProductCard';
import { RefreshCw, Sparkles } from 'lucide-react';

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
  recommendations, meta, loading, onRefresh, onViewProduct, onBuyProduct, onAddToCart,
}) => {
  const isColdStart = meta?.strategy === 'cold_start_fallback';

  return (
    <section className="rounded-sm border border-orange-200 bg-gradient-to-b from-orange-50 to-white p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-bold text-[#ee4d2d]">Gợi ý hôm nay</h2>
          <p className="text-xs text-gray-600 mt-0.5">
            {isColdStart
              ? 'Bạn chưa có lịch sử mua sắm, đây là các sản phẩm bán chạy nhất.'
              : meta?.algorithmDescription || 'Chọn theo những khách hàng có sở thích giống bạn.'}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="shrink-0 flex items-center gap-1.5 text-xs text-gray-700 hover:text-[#ee4d2d] bg-white border border-gray-200 px-3 py-1.5 rounded disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-48 h-72 shrink-0 bg-orange-100/60 rounded animate-pulse" />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm">Chưa có gợi ý. Xem hoặc mua vài sản phẩm để hệ thống hiểu sở thích của bạn.</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto snap-x pb-2">
          {recommendations.map((p) => (
            <div key={p.id} className="w-48 shrink-0 snap-start">
              <ProductCard
                product={p}
                onView={onViewProduct}
                onBuy={onBuyProduct}
                onAddToCart={onAddToCart}
                isRecommended
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
