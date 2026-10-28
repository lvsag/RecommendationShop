import React, { useEffect, useState } from 'react';
import { CartItem, Customer } from '../types';
import { X, CheckCircle2 } from 'lucide-react';

export interface ShippingInfo { name: string; phone: string; address: string; payment: string }

interface Props {
  isOpen: boolean;
  items: CartItem[];
  customer: Customer | null;
  onClose: () => void;
  onPlaceOrder: (info: ShippingInfo) => Promise<void>;
}

const vnd = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
const STEPS = ['Xác nhận sản phẩm', 'Địa chỉ & thanh toán', 'Hoàn tất'];
const PAYMENTS = [
  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
  { id: 'bank', label: 'Chuyển khoản ngân hàng' },
  { id: 'wallet', label: 'Ví điện tử' },
];
const input = 'w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ee4d2d]';

export const CheckoutModal: React.FC<Props> = ({ isOpen, items, customer, onClose, onPlaceOrder }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ShippingInfo>({ name: '', phone: '', address: '', payment: 'cod' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [orderCode, setOrderCode] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setStep(1); setError(''); setErrors({});
    setForm({ name: customer?.name || '', phone: customer?.phone || '', address: customer?.address || '', payment: 'cod' });
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const total = subtotal; // phí ship 30.000đ được trừ bởi voucher freeship
  const set = (k: keyof ShippingInfo, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nhập họ tên người nhận';
    if (!/^(0|\+84)\d{8,10}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Số điện thoại không hợp lệ';
    if (form.address.trim().length < 10) e.address = 'Nhập địa chỉ đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành)';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true); setError('');
    try {
      await onPlaceOrder(form);
      setOrderCode('ORD-' + Date.now().toString().slice(-6));
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể đặt hàng, vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const Summary = (
    <div className="text-sm space-y-1 border-t border-gray-100 pt-3">
      <div className="flex justify-between text-gray-600"><span>Tạm tính</span><span>{vnd(subtotal)}</span></div>
      <div className="flex justify-between text-gray-600"><span>Phí vận chuyển</span><span>{vnd(30000)}</span></div>
      <div className="flex justify-between text-green-600"><span>Voucher freeship</span><span>-{vnd(30000)}</span></div>
      <div className="flex justify-between font-bold text-base pt-1"><span>Tổng thanh toán</span><span className="text-[#ee4d2d]">{vnd(total)}</span></div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{step === 3 ? 'Đặt hàng thành công' : 'Thanh toán'}</h2>
          <button onClick={onClose} aria-label="Đóng" className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex px-5 py-3 gap-2 text-xs">
          {STEPS.map((label, i) => (
            <div key={label} className={`flex-1 pb-1 border-b-2 ${step >= i + 1 ? 'border-[#ee4d2d] text-[#ee4d2d] font-semibold' : 'border-gray-200 text-gray-400'}`}>
              {i + 1}. {label}
            </div>
          ))}
        </div>

        <div className="px-5 pb-5 overflow-y-auto space-y-4">
          {step === 1 && (
            <>
              <p className="text-sm text-gray-600">Kiểm tra lại sản phẩm trước khi đặt hàng:</p>
              <div className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3 items-center">
                    <img src={product.imageUrl} alt="" className="w-16 h-16 object-cover rounded border border-gray-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 line-clamp-2">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Số lượng: {quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#ee4d2d]">{vnd(product.price * quantity)}</span>
                  </div>
                ))}
              </div>
              {Summary}
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded text-sm">Hủy</button>
                <button onClick={() => setStep(2)} className="flex-1 bg-[#ee4d2d] hover:bg-[#d03b1c] text-white py-2.5 rounded text-sm font-semibold">Tiếp tục</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-3">
                {([['name', 'Họ và tên người nhận'], ['phone', 'Số điện thoại'], ['address', 'Địa chỉ nhận hàng']] as const).map(([k, label]) => (
                  <label key={k} className="block text-xs text-gray-600">
                    {label}
                    {k === 'address' ? (
                      <textarea rows={2} value={form[k]} onChange={(e) => set(k, e.target.value)} className={`${input} mt-1 ${errors[k] ? 'border-red-400' : 'border-gray-300'}`} />
                    ) : (
                      <input value={form[k]} onChange={(e) => set(k, e.target.value)} className={`${input} mt-1 ${errors[k] ? 'border-red-400' : 'border-gray-300'}`} />
                    )}
                    {errors[k] && <span className="text-red-500">{errors[k]}</span>}
                  </label>
                ))}
              </div>
              <fieldset className="space-y-1.5">
                <legend className="text-xs text-gray-600 mb-1">Phương thức thanh toán</legend>
                {PAYMENTS.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm text-gray-800">
                    <input type="radio" name="payment" checked={form.payment === p.id} onChange={() => set('payment', p.id)} />
                    {p.label}
                  </label>
                ))}
              </fieldset>
              {Summary}
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} disabled={busy} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded text-sm">Quay lại</button>
                <button onClick={submit} disabled={busy} className="flex-1 bg-[#ee4d2d] hover:bg-[#d03b1c] disabled:opacity-60 text-white py-2.5 rounded text-sm font-semibold">
                  {busy ? 'Đang đặt hàng...' : 'Đặt hàng'}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
              <p className="font-semibold text-gray-900">Cảm ơn bạn đã đặt hàng!</p>
              <p className="text-sm text-gray-600">Mã đơn hàng: <strong>{orderCode}</strong></p>
              <p className="text-sm text-gray-600 px-4">Giao đến: {form.address}</p>
              <p className="text-xs text-gray-500">Danh sách gợi ý của bạn đã được cập nhật theo đơn hàng này.</p>
              <button onClick={onClose} className="mt-3 bg-[#ee4d2d] hover:bg-[#d03b1c] text-white px-6 py-2.5 rounded text-sm font-semibold">Tiếp tục mua sắm</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
