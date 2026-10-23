import React, { useState, useEffect, useCallback } from 'react';
import {
  Product,
  RecommendedProduct,
  RecommendationMeta,
  Category,
  Customer,
  CartItem,
  ToastMessage,
} from './types';
import {
  getProducts,
  getCategories,
  getCustomers,
  getRecommendations,
  logView,
  logBuy,
  checkoutCart,
} from './api/client';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryList } from './components/CategoryList';
import { RecommendationSection } from './components/RecommendationSection';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartModal } from './components/CartModal';
import { AuthModal } from './components/AuthModal';
import { Neo4jInspectorModal } from './components/Neo4jInspectorModal';
import { Toast } from './components/Toast';
import { Grid, ChevronLeft, ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Products & Categories
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [recommendationMeta, setRecommendationMeta] = useState<RecommendationMeta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  // Cart state with localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('shoppii_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & UI states
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeProductDetail, setActiveProductDetail] = useState<Product | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [loadingRecs, setLoadingRecs] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync Cart with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shoppii_cart', JSON.stringify(cartItems));
    } catch (err) {
      console.error('Lỗi lưu giỏ hàng:', err);
    }
  }, [cartItems]);

  // Toast Helper
  const addToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Fetch Categories & Customers on Mount
  useEffect(() => {
    // Categories
    getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error('Lỗi tải danh mục:', err));

    // Customers
    getCustomers()
      .then((data) => {
        setCustomers(data);
        // Check saved user in localStorage first
        const savedUserStr = localStorage.getItem('shoppii_user');
        if (savedUserStr) {
          try {
            const savedUser = JSON.parse(savedUserStr);
            setSelectedCustomer(savedUser);
            return;
          } catch (e) {
            console.error(e);
          }
        }
        if (data.length > 0 && !selectedCustomer) {
          const defaultCust = data.find((c) => c.id === 'CUST-001') || data[0];
          setSelectedCustomer(defaultCust);
        }
      })
      .catch((err) => console.error('Lỗi tải danh sách khách hàng:', err));
  }, []);

  // 2. Fetch Products with Filtering
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await getProducts({
        page,
        limit: 15,
        category: selectedCategoryId || undefined,
        search: searchQuery || undefined,
      });
      setProducts(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalProducts(res.pagination.total);
    } catch (err: any) {
      console.error('Lỗi nạp sản phẩm:', err);
      addToast('error', 'Lỗi tải sản phẩm', err.message || 'Không thể kết nối Backend API');
    } finally {
      setLoadingProducts(false);
    }
  }, [page, selectedCategoryId, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 3. Fetch Recommendations when selectedCustomer changes
  const fetchRecommendations = useCallback(async () => {
    if (!selectedCustomer) return;
    setLoadingRecs(true);
    try {
      const res = await getRecommendations(selectedCustomer.id, 10);
      setRecommendations(res.data);
      setRecommendationMeta(res.meta);
    } catch (err: any) {
      console.error('Lỗi nạp gợi ý:', err);
    } finally {
      setLoadingRecs(false);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Handlers
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    localStorage.setItem('shoppii_user', JSON.stringify(customer));
    addToast(
      'info',
      'Đã đổi tài khoản',
      `Đang cá nhân hóa trải nghiệm Shốp Pii cho: ${customer.name}`
    );
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    setPage(1);
  };

  const handleSearchSubmit = () => {
    setPage(1);
    fetchProducts();
  };

  // View Product Handler: Auto-logs VIEWED to Neo4j
  const handleViewProduct = async (product: Product) => {
    setActiveProductDetail(product);

    if (selectedCustomer) {
      try {
        await logView(selectedCustomer.id, product.id);
      } catch (err) {
        console.error('Lỗi ghi nhận VIEW:', err);
      }
    }
  };

  // Add to Cart
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    addToast(
      'success',
      'Đã thêm vào giỏ hàng',
      `Đã thêm ${quantity} x "${product.name.slice(0, 30)}..." vào giỏ hàng Shốp Pii.`
    );
  };

  // Update Cart Quantity
  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  // Remove from Cart
  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Cart Checkout
  const handleCheckout = async () => {
    if (!selectedCustomer) {
      addToast('warning', 'Chưa đăng nhập', 'Vui lòng đăng nhập hoặc chọn khách hàng để đặt hàng.');
      setIsAuthOpen(true);
      return;
    }

    const payload = cartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    await checkoutCart(selectedCustomer.id, payload);
    setCartItems([]);

    addToast(
      'success',
      'Thanh Toán Thành Công!',
      `Đơn hàng của bạn đã được ghi nhận. Shốp Pii đang cập nhật lại các gợi ý tương quan dành cho bạn!`
    );

    // Refresh recommendations immediately
    await fetchRecommendations();
  };

  // Buy Single Product Immediately
  const handleBuyProduct = async (product: Product, quantity = 1) => {
    if (!selectedCustomer) {
      addToast('warning', 'Chưa đăng nhập', 'Vui lòng đăng nhập hoặc chọn khách hàng trước khi mua.');
      setIsAuthOpen(true);
      return;
    }

    try {
      await logBuy(selectedCustomer.id, product.id, quantity);

      addToast(
        'success',
        'Mua Hàng Thành Công!',
        `Đã đặt mua thành công: "${product.name.slice(0, 30)}...". Shốp Pii đang cập nhật lại gợi ý phù hợp nhất!`
      );

      // Refresh recommendations immediately
      await fetchRecommendations();
    } catch (err: any) {
      console.error('Lỗi khi mua hàng:', err);
      addToast('error', 'Lỗi giao dịch', err.message || 'Không thể tạo đơn hàng.');
    }
  };

  // Auth Success
  const handleAuthSuccess = (customer: Customer, message: string) => {
    setSelectedCustomer(customer);
    localStorage.setItem('shoppii_user', JSON.stringify(customer));
    // Add to customers list if new
    setCustomers((prev) => {
      if (!prev.find((c) => c.id === customer.id)) {
        return [customer, ...prev];
      }
      return prev;
    });
    addToast('success', 'Thành công', message);
    fetchRecommendations();
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('shoppii_user');
    // Default to first customer or null
    if (customers.length > 0) {
      setSelectedCustomer(customers[0]);
    } else {
      setSelectedCustomer(null);
    }
    addToast('info', 'Đã đăng xuất', 'Bạn đã đăng xuất tài khoản thành công.');
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Toast Notification */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Shốp Pii Header */}
      <Header
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={handleSelectCustomer}
        onOpenInspector={() => setIsInspectorOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        cartCount={totalCartCount}
      />

      {/* Main Body */}
      <main className="flex-1 pb-16">
        {/* Promotional Hero Banners */}
        <HeroBanner />

        {/* 6 Category Icons with real filtering */}
        <CategoryList
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
        />

        {/* GỢI Ý HÔM NAY (Real-time Adaptive Recommendations) */}
        <RecommendationSection
          recommendations={recommendations}
          meta={recommendationMeta}
          loading={loadingRecs}
          onRefresh={fetchRecommendations}
          onViewProduct={handleViewProduct}
          onBuyProduct={(prod) => handleBuyProduct(prod, 1)}
          onAddToCart={(prod) => handleAddToCart(prod, 1)}
        />

        {/* TOÀN BỘ SẢN PHẨM (Filtered by category & search) */}
        <section className="max-w-7xl mx-auto px-4 mt-2">
          <div className="bg-white rounded-sm shadow-sm p-4 border border-gray-100">
            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-[#ee4d2d]" />
                <h3 className="text-base font-bold text-gray-800 uppercase tracking-wide">
                  {selectedCategoryId
                    ? `SẢN PHẨM: ${categories.find((c) => c.id === selectedCategoryId)?.name || ''}`
                    : 'GỢI Ý TẤT CẢ SẢN PHẨM SHỐP PII'}
                </h3>
              </div>
              <span className="text-xs text-gray-500">
                Hiển thị {products.length} / {totalProducts} sản phẩm
              </span>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded animate-pulse h-72"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">Không tìm thấy sản phẩm nào trong danh mục này.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {products.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onView={handleViewProduct}
                    onBuy={(p) => handleBuyProduct(p, 1)}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Trang trước</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`w-8 h-8 rounded text-xs font-semibold transition ${
                        page === pNum
                          ? 'bg-[#ee4d2d] text-white shadow-sm'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>Trang sau</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Shốp Pii Footer */}
      <footer className="bg-white border-t-4 border-[#ee4d2d] text-gray-600 text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-gray-100">
          <div>
            <h4 className="font-bold text-gray-800 uppercase mb-3">CHĂM SÓC KHÁCH HÀNG</h4>
            <ul className="space-y-1.5 text-gray-500">
              <li><a href="#" className="hover:text-[#ee4d2d]">Trung Tâm Trợ Giúp Shốp Pii</a></li>
              <li><a href="#" className="hover:text-[#ee4d2d]">Hướng Dẫn Mua Hàng & Thanh Toán</a></li>
              <li><a href="#" className="hover:text-[#ee4d2d]">Chính Sách Vận Chuyển 0Đ</a></li>
              <li><a href="#" className="hover:text-[#ee4d2d]">Chính Sách Đổi Trả & Hoàn Tiền</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 uppercase mb-3">VỀ SHỐP PII</h4>
            <ul className="space-y-1.5 text-gray-500">
              <li><a href="#" className="hover:text-[#ee4d2d]">Giới Thiệu Về Shốp Pii Việt Nam</a></li>
              <li><a href="#" className="hover:text-[#ee4d2d]">Tuyển Dụng Tài Năng</a></li>
              <li><a href="#" className="hover:text-[#ee4d2d]">Điều Khoản Shốp Pii</a></li>
              <li><a href="#" className="hover:text-[#ee4d2d]">Chính Sách Bảo Mật</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 uppercase mb-3">THANH TOÁN & VẬN CHUYỂN</h4>
            <div className="flex flex-wrap gap-2 text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded">Visa / Mastercard</span>
              <span className="bg-gray-100 px-2 py-1 rounded">Ví ShopeePay</span>
              <span className="bg-gray-100 px-2 py-1 rounded">COD Nhận Tiền</span>
              <span className="bg-gray-100 px-2 py-1 rounded">SPayLater</span>
            </div>
            <p className="mt-3 text-[11px] text-gray-400">Đơn vị vận chuyển: SPX Express, GHTK, Viettel Post</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 uppercase mb-3">THUẬT TOÁN GỢI Ý</h4>
            <p className="text-gray-500 leading-relaxed">
              Trang web áp dụng thuật toán <strong>Collaborative Filtering</strong> dựa trên mạng lưới đồ thị liên kết hành vi mua sắm cùng nhau, tối ưu hóa trải nghiệm cá nhân hóa người dùng.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-6 text-center text-gray-400">
          <p>© 2026 Shốp Pii - Bản quyền thuộc về Đồ Án Môn Học Cơ Sở Dữ Liệu NoSQL.</p>
        </div>
      </footer>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={activeProductDetail}
        onClose={() => setActiveProductDetail(null)}
        onBuy={(prod, qty) => handleBuyProduct(prod, qty)}
        onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
      />

      {/* Neo4j Graph Inspector Modal */}
      <Neo4jInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        selectedCustomer={selectedCustomer}
      />
    </div>
  );
};

export default App;
