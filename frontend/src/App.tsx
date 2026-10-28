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
  checkoutCart,
  getHealth,
  seedDatabase,
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
import { CheckoutModal, ShippingInfo } from './components/CheckoutModal';
import { ProductGrid } from './components/ProductGrid';
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
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
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
  const [dbError, setDbError] = useState<{
    isError: boolean;
    message: string;
    instruction?: string;
    isDefaultLocalhost?: boolean;
    uri?: string;
  } | null>(null);
  const [checkout, setCheckout] = useState<{ items: CartItem[]; fromCart: boolean } | null>(null);
  const [seeding, setSeeding] = useState<boolean>(false);

  // Sync Cart with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shoppii_cart', JSON.stringify(cartItems));
    } catch (err) {
      console.error('Lỗi lưu giỏ hàng:', err);
    }
  }, [cartItems]);

  // Debounce search: gõ xong 350ms mới gọi API, tránh dùng state cũ
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

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

  const checkDbHealth = useCallback(async () => {
    try {
      const health = await getHealth();
      if (!health.database.connected) {
        setDbError({
          isError: true,
          message: health.database.error || 'Chưa thể kết nối cơ sở dữ liệu Neo4j',
          instruction: health.database.instruction,
          isDefaultLocalhost: health.database.isDefaultLocalhost,
          uri: health.database.uri,
        });
      } else {
        setDbError(null);
      }
    } catch (e: any) {
      setDbError({
        isError: true,
        message: 'Không thể kết nối đến Backend API',
        instruction: 'Vui lòng kiểm tra lại dịch vụ Render hoặc mạng của bạn.',
      });
    }
  }, []);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    addToast('info', 'Đang nạp dữ liệu', 'Đang nạp 108 sản phẩm & 50 khách hàng mẫu vào Neo4j...');
    try {
      const res = await seedDatabase();
      if (res.success) {
        addToast('success', 'Nạp dữ liệu thành công', 'Đã nạp 108 sản phẩm mẫu vào cơ sở dữ liệu Neo4j!');
        setDbError(null);
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Lỗi nạp dữ liệu', err.response?.data?.error || err.message || 'Thất bại');
    } finally {
      setSeeding(false);
    }
  };

  // 1. Fetch Categories & Customers on Mount
  useEffect(() => {
    // Categories
    getCategories()
      .then((data) => {
        setCategories(data);
        setDbError(null);
      })
      .catch((err) => {
        console.error('Lỗi tải danh mục:', err);
        checkDbHealth();
      });

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
      .catch((err) => {
        console.error('Lỗi tải danh sách khách hàng:', err);
        checkDbHealth();
      });
  }, [checkDbHealth]);

  // 2. Fetch Products with Filtering
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await getProducts({
        page,
        limit: 15,
        category: selectedCategoryId || undefined,
        search: debouncedSearch || undefined,
      });
      setProducts(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalProducts(res.pagination.total);
      setDbError(null);
    } catch (err: any) {
      console.error('Lỗi nạp sản phẩm:', err);
      checkDbHealth();
    } finally {
      setLoadingProducts(false);
    }
  }, [page, selectedCategoryId, debouncedSearch, checkDbHealth]);

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
    setDebouncedSearch(searchQuery);
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

  // Mở khung xác nhận + thanh toán cho cả giỏ hàng và "Mua ngay"
  const requireLogin = () => {
    addToast('warning', 'Chưa đăng nhập', 'Vui lòng đăng nhập hoặc chọn khách hàng trước khi đặt hàng.');
    setIsAuthOpen(true);
  };

  const handleCheckout = async () => {
    if (!selectedCustomer) return requireLogin();
    if (cartItems.length === 0) return;
    setIsCartOpen(false);
    setCheckout({ items: cartItems, fromCart: true });
  };

  const handleBuyProduct = async (product: Product, quantity = 1): Promise<boolean> => {
    if (!selectedCustomer) {
      requireLogin();
      return false;
    }
    setCheckout({ items: [{ product, quantity }], fromCart: false });
    return true;
  };

  // Đặt hàng thật: ghi quan hệ BOUGHT vào Neo4j rồi làm mới gợi ý
  const handlePlaceOrder = async (_info: ShippingInfo) => {
    if (!selectedCustomer || !checkout) return;
    await checkoutCart(
      selectedCustomer.id,
      checkout.items.map((i) => ({ productId: i.product.id, quantity: i.quantity }))
    );
    if (checkout.fromCart) setCartItems([]);
    await fetchRecommendations();
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

      {/* Database Diagnostic & Warning Banner */}
      {dbError?.isError && (
        <div className="bg-amber-50 border-b border-amber-300 px-4 py-3 text-amber-950 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs md:text-sm">
            <div className="flex items-start gap-2.5">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-bold text-amber-900">
                  Chưa thể kết nối tới Cơ sở dữ liệu Neo4j trên Cloud:
                </p>
                <p className="text-amber-800 text-xs mt-0.5">
                  {dbError.instruction || dbError.message}
                </p>
                {dbError.uri && (
                  <p className="text-amber-700 font-mono text-[11px] mt-0.5">
                    URI hiện tại: {dbError.uri}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
              <a
                href="/api/health"
                target="_blank"
                rel="noreferrer"
                className="bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 px-3 py-1.5 rounded text-xs font-semibold shadow-2xs transition"
              >
                Kiểm tra /api/health
              </a>
              <button
                onClick={handleSeedDatabase}
                disabled={seeding}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-bold shadow-2xs transition flex items-center gap-1"
              >
                {seeding ? 'Đang nạp...' : '🌱 Nạp dữ liệu mẫu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Promotional Hero Banners */}
        {!debouncedSearch && <HeroBanner />}

        {/* GỢI Ý HÔM NAY (Real-time Adaptive Recommendations) */}
        {!debouncedSearch && (
          <RecommendationSection
          recommendations={recommendations}
          meta={recommendationMeta}
          loading={loadingRecs}
          onRefresh={fetchRecommendations}
          onViewProduct={handleViewProduct}
          onBuyProduct={(prod) => handleBuyProduct(prod, 1)}
          onAddToCart={(prod) => handleAddToCart(prod, 1)}
        />
        )}

        {/* TOÀN BỘ SẢN PHẨM (Filtered by category & search) */}
        <section>
          <div className="bg-white rounded-sm p-4 border border-gray-100">
            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-[#ee4d2d]" />
                <h3 className="text-base font-bold text-gray-800 ">
                  {debouncedSearch
                  ? `Kết quả cho "${debouncedSearch}"`
                  : selectedCategoryId
                  ? `DANH MỤC: ${categories.find((c) => c.id === selectedCategoryId)?.name || ''}`
                  : 'TẤT CẢ SẢN PHẨM'}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                Hiển thị {products.length} / {totalProducts} sản phẩm
              </span>
                {debouncedSearch && (
                  <button
                    onClick={() => { setSearchQuery(''); setDebouncedSearch(''); setPage(1); }}
                    className="text-xs text-[#ee4d2d] border border-[#ee4d2d] rounded px-2 py-1 hover:bg-orange-50"
                  >
                    Xóa tìm kiếm
                  </button>
                )}
              </div>
            </div>

            <div className="mb-4">
              <CategoryList
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={handleSelectCategory}
              />
            </div>

            <ProductGrid
              products={products}
              loading={loadingProducts}
              emptyMessage={debouncedSearch ? `Không tìm thấy sản phẩm nào cho "${debouncedSearch}". Thử từ khóa ngắn hơn hoặc đổi từ khác.` : undefined}
              onView={handleViewProduct}
              onBuy={(p) => handleBuyProduct(p, 1)}
              onAddToCart={(p) => handleAddToCart(p, 1)}
            />

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
      <footer className="bg-white border-t-4 border-[#ee4d2d] text-gray-600 text-xs py-8 mt-4">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-gray-100">
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
        onSelectProduct={handleViewProduct}
        customerId={selectedCustomer?.id}
      />

      <CheckoutModal
        isOpen={checkout !== null}
        items={checkout?.items || []}
        customer={selectedCustomer}
        onClose={() => setCheckout(null)}
        onPlaceOrder={handlePlaceOrder}
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
