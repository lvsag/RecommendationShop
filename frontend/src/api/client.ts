import axios from 'axios';
import { Product, Category, Customer, RecommendedProduct, RecommendationMeta } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
  const response = await api.get<{
    success: boolean;
    data: Product[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>('/products', { params });
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await api.get<{ success: boolean; data: Product }>(`/products/${id}`);
  return response.data.data;
};

export const getCategories = async () => {
  const response = await api.get<{ success: boolean; data: Category[] }>('/products/categories');
  return response.data.data;
};

export const getCustomers = async () => {
  const response = await api.get<{ success: boolean; data: Customer[] }>('/customers');
  return response.data.data;
};

export const logView = async (customerId: string, productId: string) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: { customerId: string; productId: string; customerName: string; productName: string; viewCount: number };
  }>('/behavior/view', { customerId, productId });
  return response.data;
};

export const logBuy = async (customerId: string, productId: string, quantity = 1) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: { customerId: string; productId: string; customerName: string; productName: string; newSoldCount: number; timestamp: number };
  }>('/behavior/buy', { customerId, productId, quantity });
  return response.data;
};

export const checkoutCart = async (customerId: string, items: { productId: string; quantity: number }[]) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: { orderId: string; itemsCount: number; timestamp: number };
  }>('/behavior/checkout', { customerId, items });
  return response.data;
};

export const registerUser = async (payload: { name: string; email: string; password: string; phone?: string; address?: string }) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: Customer;
  }>('/auth/register', payload);
  return response.data;
};

export const loginUser = async (payload: { email: string; password: string }) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: Customer;
  }>('/auth/login', payload);
  return response.data;
};

export const getRecommendations = async (customerId: string, limit = 10) => {
  const response = await api.get<{
    success: boolean;
    meta: RecommendationMeta;
    data: RecommendedProduct[];
  }>(`/recommendations/${customerId}`, { params: { limit } });
  return response.data;
};

export const explainRecommendationQuery = async (customerId: string) => {
  const response = await api.get<{
    success: boolean;
    plan: any;
    query: string;
  }>(`/recommendations/${customerId}/explain`);
  return response.data;
};

export default api;
