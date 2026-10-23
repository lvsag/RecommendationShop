export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  imageUrl: string;
  rating: number;
  soldCount: number;
  categoryId: string;
  categoryName?: string;
  description?: string;
  totalPurchases?: number;
  totalViews?: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  productCount?: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  address?: string;
  boughtCount?: number;
  viewedCount?: number;
}

export interface RecommendedProduct extends Product {
  score: number;
  coBoughtCount: number;
  coViewedCount: number;
  totalCoCustomers: number;
  reason: string;
}

export interface RecommendationMeta {
  customerId: string;
  customerName: string;
  strategy: 'collaborative_filtering' | 'cold_start_fallback';
  totalItems: number;
  algorithmDescription: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}
