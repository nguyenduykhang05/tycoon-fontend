import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowLeft, Trash2, Ticket, CheckCircle2, ShieldCheck, MapPin, Plus, X } from 'lucide-react';

export default function CartPage({
  onContinueShopping,
  cartItems,
  setCartItems,
  user
}: {
  onContinueShopping: () => void,
  cartItems: any[],
  setCartItems: React.Dispatch<React.SetStateAction<any[]>>,
  user: any
}) {
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [deliveryType, setDeliveryType] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([
    { id: 1, code: 'TYCOONNEW', discount_amount: 50000, min_order_value: 200000, description: 'Giảm 50k cho đơn từ 200k' },
    { id: 2, code: 'FREESHIP2H', discount_amount: 15000, min_order_value: 90000, description: 'Free ship hỏa tốc 2H' },
    { id: 3, code: 'TYCOON10', discount_amount: 10000, min_order_value: 0, description: 'Giảm 10k mọi đơn hàng' }
  ]);
  
  // Addresses state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // New address form state
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrDetails, setNewAddrDetails] = useState('');
  const [newAddrProvince, setNewAddrProvince] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/addresses?user_id=${user.id}`)
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            setAddresses(d.data);
            const def = d.data.find((a: any) => a.is_default);
            if (def) setSelectedAddressId(def.id);
            else if (d.data.length > 0) setSelectedAddressId(d.data[0].id);
          }
        });
    }
  }, [user]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName || !newAddrPhone || !newAddrDetails) return;
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          full_name: newAddrName,
          phone: newAddrPhone,
          address: newAddrDetails,
          province: newAddrProvince,
          is_default: addresses.length === 0 ? 1 : 0
        })
      });
      const data = await res.json();
      if (data.success) {
        const updated = await fetch(`/api/addresses?user_id=${user.id}`).then(r => r.json());
        if (updated.success) {
          setAddresses(updated.data);
          if (!selectedAddressId) setSelectedAddressId(updated.data[updated.data.length-1].id);
        }
        setShowAddressModal(false);
        setNewAddrName(''); setNewAddrPhone(''); setNewAddrDetails(''); setNewAddrProvince('');
      }
    } catch {}
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = appliedVoucher ? appliedVoucher.discount_amount : 0;
  const finalAmount = Math.max(0, cartTotal - discountAmount);

  const handleUpdateQuantity = (productId: number, newQty: number) => {
    if (newQty < 1) return;
    setCartItems(prev => prev.map(item => item.product_id === productId ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveItem = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    try {
      const res = await fetch('/api/vouchers/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode, cart_total: cartTotal })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedVoucher(data.data);
        alert('Áp dụng mã giảm giá thành công!');
      } else {
        alert(data.message);
        setAppliedVoucher(null);
      }
    } catch (e) {
      alert('Lỗi khi kiểm tra voucher');
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thanh toán');
      return;
    }
    setIsCheckingOut(true);
    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          items: cartItems.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
           voucher_code: appliedVoucher?.code || null,
          delivery_type: deliveryType,
          payment_method: paymentMethod,
          address_id: selectedAddressId
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrderResult(data.data);
        setCartItems([]);
      } else {
        alert('Lỗi thanh toán: ' + data.message);
      }
    } catch (e) {
      alert('Đã xảy ra lỗi khi tạo đơn hàng.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (orderResult) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
      <div className="bg-white rounded-[2.5rem] shadow-soft p-10 border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-[#005a31]" />
          </div>
          <h1 className="text-2xl font-black text-[#005a31] uppercase mb-2">Đặt Hàng Thành Công!</h1>
          <p className="text-gray-600 mb-8">Mã đơn hàng của bạn là #{orderResult.order_id}. Bạn vừa tích lũy được <strong className="text-orange-500">{orderResult.points_earned} điểm</strong> Tycoon.</p>

          {orderResult.payment_qr && (
            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-200 mb-8 flex flex-col items-center shadow-inner">
              <p className="font-bold text-gray-800 mb-4 uppercase text-[15px]">Quét mã QR để thanh toán (Momo/VNPAY)</p>
              <img src={orderResult.payment_qr} alt="Payment QR" className="w-48 h-48 border border-gray-200 rounded-2xl mb-6 p-2 bg-white shadow-soft" />
              <p className="text-[#ff6b00] font-black text-2xl mb-6">{orderResult.final_amount.toLocaleString('vi-VN')} đ</p>
              
              <button 
                onClick={async () => {
                  const res = await fetch('/api/momo/ipn', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ order_id: orderResult.order_id })
                  });
                  const data = await res.json();
                  if (data.success) {
                      alert('Thanh toán thành công qua Momo (Mock webhook IPN)');
                      onContinueShopping(); 
                  }
                }} 
                className="bg-[#a50064] text-white px-8 py-3 rounded-full font-bold hover:bg-[#80004d] transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                 <ShieldCheck size={20} /> Giả lập IPN Momo Thanh Toán Xong
              </button>
            </div>
          )}

          <button onClick={onContinueShopping} className="bg-[#005a31] text-white px-10 py-4 rounded-full font-bold uppercase transition-soft hover:bg-emerald-800 shadow-soft">
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-[13px] text-gray-500 mb-4">
        <span className="cursor-pointer hover:text-[#005a31]" onClick={onContinueShopping}>Trang chủ</span>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">Giỏ hàng</span>
      </div>

      <h1 className="text-[20px] font-bold text-gray-800 mb-6 uppercase tracking-tight">Giỏ hàng ({cartItems.length} sản phẩm)</h1>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] shadow-soft border border-gray-100 mb-12">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
            <ShoppingCart size={48} className="text-gray-300" />
          </div>
          <p className="text-gray-600 mb-8 font-medium text-lg">Chưa có sản phẩm nào trong giỏ hàng của bạn.</p>
          <button
            onClick={onContinueShopping}
            className="bg-[#005a31] text-white px-10 py-4 rounded-full font-bold hover:bg-[#004d2a] transition-soft flex items-center gap-2 uppercase tracking-tight shadow-soft"
          >
            <ArrowLeft size={18} /> Quay lại mua sắm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.product_id} className="bg-white p-5 rounded-3xl shadow-soft border border-gray-100 flex gap-5 group">
                <div className="w-28 h-28 bg-gray-50 rounded-2xl p-2 flex-shrink-0 border border-gray-100 group-hover:scale-105 transition-soft">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[14px] text-gray-800 mb-1 line-clamp-2">{item.name}</h3>
                    <p className="text-[12px] text-gray-400 font-bold uppercase">{item.brand_name || 'Tycoon Product'}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-black text-[#ff6b00] text-[16px]">{item.price.toLocaleString('vi-VN')} đ</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 p-0.5">
                        <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white rounded-full font-bold transition-soft">-</button>
                        <span className="w-10 text-center text-[13px] font-bold">{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white rounded-full font-bold transition-soft">+</button>
                      </div>
                      <button onClick={() => handleRemoveItem(item.product_id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 sticky top-[80px]">

              {/* Vouchers */}
              <div className="mb-6">
                <h3 className="text-[14px] font-bold uppercase text-gray-800 mb-3 flex items-center gap-2"><Ticket size={16} className="text-[#005a31]" /> Khuyến mãi</h3>
                <div className="flex gap-2">
                   <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-grow border border-gray-200 rounded-full px-4 py-2.5 text-[13px] uppercase focus:border-[#005a31] focus:outline-none bg-gray-50"
                  />
                  <button onClick={handleApplyVoucher} className="bg-gray-800 text-white px-5 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-900 transition-soft">ÁP DỤNG</button>
                </div>
                <button 
                  onClick={() => setShowVoucherModal(true)}
                  className="mt-3 w-full border border-[#005a31] text-[#005a31] py-2 rounded-full text-[13px] font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Ticket size={14} /> Chọn mã giảm giá khác
                </button>
                {appliedVoucher && (
                  <div className="mt-3 text-[12px] text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl flex justify-between border border-emerald-100">
                    <span>Đã áp dụng: {appliedVoucher.code}</span>
                    <span>- {appliedVoucher.discount_amount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
              </div>

              <div className="h-[1px] bg-gray-100 w-full mb-6"></div>

              {/* Shipping Address Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-bold uppercase text-gray-800 flex items-center gap-2"><MapPin size={16} className="text-[#005a31]" /> Địa chỉ nhận hàng</h3>
                  <button 
                    onClick={() => setShowAddressModal(true)}
                    className="text-[#005a31] text-[12px] font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Thêm mới
                  </button>
                </div>
                
                {!user ? (
                  <p className="text-[12px] text-gray-400 italic">Vui lòng đăng nhập để chọn địa chỉ</p>
                ) : addresses.length === 0 ? (
                  <div className="p-4 border border-dashed border-gray-300 rounded-2xl bg-gray-50 text-center">
                    <p className="text-[13px] text-gray-500 mb-2">Bạn chưa có địa chỉ nhận hàng nào</p>
                    <button onClick={() => setShowAddressModal(true)} className="bg-white border border-gray-200 px-4 py-2 rounded-full text-[12px] font-bold hover:border-[#005a31] transition-soft">THÊM ĐỊA CHỈ</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <label key={addr.id} className={`block p-4 border rounded-2xl cursor-pointer transition-soft ${selectedAddressId === addr.id ? 'border-[#005a31] bg-emerald-50 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                        <div className="flex items-start gap-3">
                          <input 
                            type="radio" 
                            name="address" 
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-[13px]">{addr.full_name}</span>
                              <span className="text-gray-400 text-[12px] font-medium">| {addr.phone}</span>
                              {addr.is_default === 1 && <span className="bg-[#005a31] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">MẶC ĐỊNH</span>}
                            </div>
                            <p className="text-[12px] text-gray-600 line-clamp-2 leading-relaxed">{addr.address}, {addr.province}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-[1px] bg-gray-100 w-full mb-6"></div>

              {/* Delivery Option */}
              <div className="mb-6">
                <h3 className="text-[14px] font-bold uppercase text-gray-800 mb-4">Hình thức giao hàng</h3>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-soft ${deliveryType === 'standard' ? 'border-[#005a31] bg-emerald-50 shadow-soft' : 'border-gray-100 hover:border-[#005a31]'}`}>
                    <input type="radio" name="delivery" checked={deliveryType === 'standard'} onChange={() => setDeliveryType('standard')} className="w-4 h-4 text-[#005a31]" />
                    <span className="text-[13px] font-medium">Giao hàng tiêu chuẩn (Tự động tính phí)</span>
                  </label>
                  <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-soft ${deliveryType === '2H' ? 'border-[#ff6b00] bg-orange-50 shadow-soft' : 'border-gray-100 hover:border-[#ff6b00]'}`}>
                    <input type="radio" name="delivery" checked={deliveryType === '2H'} onChange={() => setDeliveryType('2H')} className="w-4 h-4 text-[#ff6b00]" />
                    <span className="text-[13px] font-medium text-[#ff6b00]">Giao hàng hỏa tốc 2H</span>
                  </label>
                </div>
              </div>

              <div className="h-[1px] bg-gray-100 w-full mb-6"></div>

              {/* Payment Option */}
              <div className="mb-8">
                <h3 className="text-[14px] font-bold uppercase text-gray-800 mb-4">Phương thức thanh toán</h3>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-soft ${paymentMethod === 'cash' ? 'border-[#005a31] bg-emerald-50 shadow-soft' : 'border-gray-100 hover:border-[#005a31]'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="w-4 h-4 text-[#005a31]" />
                    <span className="text-[13px] font-medium">Thanh toán tiền mặt (COD)</span>
                  </label>
                  <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-soft ${paymentMethod === 'qr' ? 'border-[#005a31] bg-emerald-50 shadow-soft' : 'border-gray-100 hover:border-[#005a31]'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} className="w-4 h-4 text-[#005a31]" />
                    <span className="text-[13px] font-medium">Chuyển khoản QR (Momo/VNPAY)</span>
                  </label>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-4 mb-8 bg-gray-50/50 p-6 rounded-[1.5rem] border border-gray-100">
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500">Tạm tính:</span>
                  <span className="font-bold text-gray-800">{cartTotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500">Giảm giá:</span>
                  <span className="font-bold text-emerald-600">- {discountAmount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between py-3 border-t mt-3">
                  <span className="text-[14px] font-bold text-gray-800">Tổng cộng:</span>
                  <span className="text-[20px] font-black text-[#ff6b00]">{finalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
                <p className="text-right text-[11px] text-gray-400 italic">(Đã bao gồm VAT)</p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || !user}
                className={`w-full py-4 rounded-full font-bold uppercase transition-soft tracking-tight shadow-soft ${isCheckingOut || !user ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-[#ff6b00] text-white hover:bg-orange-600 hover:scale-[1.02]'}`}
              >
                {!user ? 'Đăng nhập để đặt hàng' : isCheckingOut ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-[#005a31] p-6 text-white flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-tight">Thêm địa chỉ giao hàng mới</h3>
              <button onClick={() => setShowAddressModal(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddAddress} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-gray-500 uppercase ml-1">Họ tên</label>
                  <input
                    type="text"
                    required
                    value={newAddrName}
                    onChange={(e) => setNewAddrName(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-[14px] focus:border-[#005a31] focus:outline-none bg-gray-50/50"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-gray-500 uppercase ml-1">Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    value={newAddrPhone}
                    onChange={(e) => setNewAddrPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-[14px] focus:border-[#005a31] focus:outline-none bg-gray-50/50"
                    placeholder="0901234567"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-gray-500 uppercase ml-1">Tỉnh / Thành phố</label>
                <select
                  required
                  value={newAddrProvince}
                  onChange={(e) => setNewAddrProvince(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-[14px] focus:border-[#005a31] focus:outline-none bg-gray-50/50 appearance-none cursor-pointer"
                >
                  <option value="">Chọn Tỉnh / Thành phố</option>
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Bình Dương">Bình Dương</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-gray-500 uppercase ml-1">Địa chỉ chi tiết</label>
                <textarea
                  required
                  rows={3}
                  value={newAddrDetails}
                  onChange={(e) => setNewAddrDetails(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-[14px] focus:border-[#005a31] focus:outline-none bg-gray-50/50 resize-none"
                  placeholder="Số nhà, tên đường, phường/xã..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-4 border border-gray-200 rounded-full font-bold uppercase text-[13px] hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-[#ff6b00] text-white rounded-full font-bold uppercase text-[13px] hover:bg-orange-600 shadow-soft transition-colors"
                >
                  Lưu địa chỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voucher Selection Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-[#ff6b00] p-6 text-white flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-tight">Chọn mã giảm giá</h3>
              <button onClick={() => setShowVoucherModal(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
              {availableVouchers.map(v => {
                const isEligible = cartTotal >= v.min_order_value;
                return (
                  <div 
                    key={v.id} 
                    onClick={() => {
                      if (isEligible) {
                        setVoucherCode(v.code);
                        setAppliedVoucher(v);
                        setShowVoucherModal(false);
                      }
                    }}
                    className={`border-2 p-5 rounded-2xl flex gap-4 relative overflow-hidden transition-all ${isEligible ? 'border-orange-100 bg-orange-50/30 cursor-pointer hover:border-[#ff6b00] hover:shadow-md' : 'border-gray-100 bg-gray-50 opacity-60 grayscale cursor-not-allowed'}`}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shrink-0 ${isEligible ? 'bg-[#ff6b00]' : 'bg-gray-400'}`}>
                      <Ticket size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-black text-[#ff6b00] text-[15px]">{v.code}</span>
                        {!isEligible && <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded font-bold">CHƯA ĐỦ ĐIỀU KIỆN</span>}
                      </div>
                      <p className="text-[13px] font-bold text-gray-800">{v.description}</p>
                      <p className="text-[11px] text-gray-400 mt-2">HĐ từ {v.min_order_value.toLocaleString('vi-VN')} đ</p>
                    </div>
                    {appliedVoucher?.id === v.id && (
                       <div className="absolute top-2 right-2 text-emerald-600">
                          <CheckCircle2 size={16} />
                       </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-8 pt-0">
               <button 
                 onClick={() => setShowVoucherModal(false)}
                 className="w-full py-4 bg-gray-800 text-white rounded-full font-bold uppercase text-[13px] hover:bg-gray-900 transition-colors"
               >
                 Đóng
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
