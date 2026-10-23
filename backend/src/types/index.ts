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
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  address?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  productCount?: number;
}

export interface RecommendationResult {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  imageUrl: string;
  rating: number;
  soldCount: number;
  categoryName?: string;
  score: number;
  coBoughtCount: number;
  coViewedCount: number;
  totalCoCustomers: number;
  reason: string;
}

export interface BehaviorLogPayload {
  customerId: string;
  productId: string;
  metadata?: Record<string, any>;
}
