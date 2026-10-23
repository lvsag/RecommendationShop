import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => Promise<void>;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = cartItems.length > 0 ? 30000 : 0;
  const discountVoucher = cartItems.length > 0 ? 30000 : 0; // Freeship voucher
  const finalTotal = subtotal + shippingFee - discountVoucher;

  const handlePlaceOrder = async () => {
    setCheckingOut(true);
    try {
      await onCheckout();
      setOrderSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingOut(false);
    }
  };

  const handleClose = () => {
    setOrderSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="bg-[#ee4d2d] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h3 className="font-bold text-lg">Giỏ Hàng Shốp Pii ({cartItems.length} sản phẩm)</h3>
          </div>
          <button onClick={handleClose} className="text-white/80 hover:text-white p-1 rounded transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {orderSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Đặt Hàng Thành Công!</h4>
              <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
                Cảm ơn bạn đã mua sắm tại <strong>Shốp Pii</strong>. Đơn hàng của bạn đã được ghi nhận vào hệ thống. Danh sách gợi ý sản phẩm liên quan vừa được cập nhật tức thì!
              </p>
              <button
                onClick={handleClose}
                className="bg-[#ee4d2d] hover:bg-[#d03b1c] text-white font-bold px-6 py-2.5 rounded shadow transition"
              >
                Tiếp Tục Mua Sắm
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-medium text-gray-700">Giỏ hàng của bạn đang trống</p>
              <p className="text-xs text-gray-400 mt-1">Hãy khám phá các sản phẩm giảm giá cực hot trên Shốp Pii!</p>
              <button
                onClick={handleClose}
                className="mt-4 bg-[#ee4d2d] hover:bg-[#d03b1c] text-white text-xs font-bold px-5 py-2 rounded transition shadow"
              >
                Khám Phá Sản Phẩm Ngay
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Items List */}
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="py-3 flex items-center gap-4">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded border border-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-gray-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-[#ee4d2d]">
                          {formatCurrency(item.product.price)}
                        </span>
                        {item.product.originalPrice > item.product.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {formatCurrency(item.product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-200 rounded">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-0.5 text-xs font-semibold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    {/* Total item price & delete */}
                    <div className="text-right flex-shrink-0 w-24">
                      <div className="text-xs font-bold text-gray-900">
                        {formatCurrency(item.product.price * item.quantity)}
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-gray-400 hover:text-red-500 text-xs mt-1 inline-flex items-center gap-0.5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Xóa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100 text-xs space-y-2 mt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tiền hàng:</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span>{formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Voucher Freeship Xtra:
                  </span>
                  <span>-{formatCurrency(discountVoucher)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline text-sm font-bold">
                  <span className="text-gray-900">Tổng thanh toán:</span>
                  <span className="text-xl text-[#ee4d2d] font-extrabold">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 bg-orange-50/60 p-2.5 rounded border border-orange-100">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#ee4d2d]" />
                  <span>Đảm bảo Shốp Pii: Nhận hàng hoặc được hoàn tiền 100%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!orderSuccess && cartItems.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={handleClose}
              className="text-xs text-gray-600 hover:text-gray-900 underline"
            >
              Chọn thêm sản phẩm khác
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={checkingOut}
              className="bg-[#ee4d2d] hover:bg-[#d03b1c] disabled:opacity-50 text-white font-bold text-sm px-6 py-2.5 rounded flex items-center gap-2 shadow transition"
            >
              {checkingOut ? (
                <span>Đang xử lý đơn...</span>
              ) : (
                <>
                  <span>Đặt Hàng ({cartItems.length})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
