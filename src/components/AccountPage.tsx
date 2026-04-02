import React, { useState, useEffect } from 'react';
import { User, FileText, Heart, MapPin, LogOut, Camera, Lock, Mail, Phone, Package, Calendar, Star, Plus, Trash2, CheckCircle2, X, Eye, EyeOff, Ticket } from 'lucide-react';

interface AccountPageProps {
  user: any;
  onLogout: () => void;
  onUpdateUserCallback?: (updatedUser: any) => void;
  initialTab?: string;
}

export default function AccountPage({ user, onLogout, onUpdateUserCallback, initialTab }: AccountPageProps) {
  const [activeTab, setActiveTab] = useState(initialTab || 'profile');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Profile form state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [gender, setGender] = useState(user?.gender || 'Không xác định');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  // Change password state
  const [showPwModal, setShowPwModal] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{type: 'success'|'error', text: string}|null>(null);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Spa bookings state
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrAddress, setAddrAddress] = useState('');
  const [addrProvince, setAddrProvince] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);

  // Points history state
  const [pointsData, setPointsData] = useState<any>(null);

  // Wishlist state
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Vouchers state
  const [vouchers, setVouchers] = useState<any[]>([
    { id: 1, code: 'TYCOONNEW', discount: 50000, min_order: 200000, expiry: '2026-12-31', description: 'Giảm 50k cho đơn đầu tiên' },
    { id: 2, label: 'FREESHIP', discount: 15000, min_order: 90000, expiry: '2026-06-30', description: 'Miễn phí vận chuyển 2H' }
  ]);

  useEffect(() => {
    if (user?.dob) {
      const parts = user.dob.split('-');
      if (parts.length === 3) { setDobYear(parts[0]); setDobMonth(parts[1]); setDobDay(parts[2]); }
    }
    if (user?.full_name) setFullName(user.full_name);
    if (user?.gender) setGender(user.gender);
  }, [user]);

  // Load data when tab changes
  useEffect(() => {
    if (!user?.id) return;
    if (activeTab === 'orders' && orders.length === 0) {
      setOrdersLoading(true);
      fetch(`/api/orders/my-orders?user_id=${user.id}`)
        .then(r => r.json()).then(d => { if (d.success) setOrders(d.data); }).finally(() => setOrdersLoading(false));
    }
    if (activeTab === 'booking' && bookings.length === 0) {
      setBookingsLoading(true);
      fetch(`/api/spa/bookings/user?user_id=${user.id}`)
        .then(r => r.json()).then(d => { if (d.success) setBookings(d.data); }).finally(() => setBookingsLoading(false));
    }
    if (activeTab === 'address' && addresses.length === 0) {
      fetch(`/api/addresses?user_id=${user.id}`)
        .then(r => r.json()).then(d => { if (d.success) setAddresses(d.data); });
    }
    if (activeTab === 'points' && !pointsData) {
      fetch(`/api/users/points-history?user_id=${user.id}`)
        .then(r => r.json()).then(d => { if (d.success) setPointsData(d.data); });
    }
    if (activeTab === 'wishlist' && wishlist.length === 0) {
      setWishlistLoading(true);
      fetch(`/api/wishlist?user_id=${user.id}`)
        .then(r => r.json()).then(d => { if (d.success) setWishlist(d.data); }).finally(() => setWishlistLoading(false));
    }
  }, [activeTab]);

  if (!user) {
    return <div className="min-h-[500px] flex items-center justify-center"><p>Vui lòng đăng nhập.</p></div>;
  }

  const username = user?.username || '';
  const isEmail = username.includes('@');
  const displayEmail = isEmail ? username : 'Chưa cập nhật';
  const displayPhone = !isEmail ? username : (user?.phone || 'Chưa cập nhật');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setMessage(null);
    const dob = (dobYear && dobMonth && dobDay) ? `${dobYear}-${dobMonth}-${dobDay}` : null;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, full_name: fullName, gender, dob })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
        onUpdateUserCallback?.({ ...user, full_name: fullName, gender, dob });
      } else { setMessage({ type: 'error', text: data.message || 'Cập nhật thất bại' }); }
    } catch { setMessage({ type: 'error', text: 'Lỗi kết nối.' }); }
    finally { setIsSubmitting(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setPwMsg(null);
    if (newPw !== confirmPw) { setPwMsg({ type: 'error', text: 'Mật khẩu mới không khớp' }); return; }
    if (newPw.length < 6) { setPwMsg({ type: 'error', text: 'Mật khẩu mới phải ít nhất 6 ký tự' }); return; }
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, old_password: oldPw, new_password: newPw })
      });
      const data = await res.json();
      if (data.success) {
        setPwMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
        setTimeout(() => { setShowPwModal(false); setOldPw(''); setNewPw(''); setConfirmPw(''); setPwMsg(null); }, 1500);
      } else { setPwMsg({ type: 'error', text: data.message }); }
    } catch { setPwMsg({ type: 'error', text: 'Lỗi kết nối.' }); }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, full_name: addrName, phone: addrPhone, address: addrAddress, province: addrProvince, is_default: addrDefault })
      });
      const data = await res.json();
      if (data.success) {
        const updated = await fetch(`/api/addresses?user_id=${user.id}`).then(r => r.json());
        if (updated.success) setAddresses(updated.data);
        setShowAddressForm(false); setAddrName(''); setAddrPhone(''); setAddrAddress(''); setAddrProvince(''); setAddrDefault(false);
      }
    } catch {}
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Xóa địa chỉ này?')) return;
    await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const handleSetDefaultAddress = async (id: number) => {
    await fetch(`/api/addresses/${id}/default`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id })
    });
    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id ? 1 : 0 })));
  };

  const handleRemoveWishlist = async (productId: number) => {
    await fetch(`/api/wishlist/${productId}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id })
    });
    setWishlist(prev => prev.filter(w => w.id !== productId));
  };

  const tierColors: Record<string, string> = {
    Bronze: 'text-amber-700 bg-amber-50 border-amber-200',
    Silver: 'text-gray-600 bg-gray-50 border-gray-200',
    Gold: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    Diamond: 'text-blue-700 bg-blue-50 border-blue-200',
  };

  const statusColors: Record<string, string> = {
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
  };

  const menuItems = [
    { id: 'profile', icon: <User size={18} />, label: 'Thông tin tài khoản' },
    { id: 'orders', icon: <Package size={18} />, label: 'Đơn hàng của tôi' },
    { id: 'booking', icon: <Calendar size={18} />, label: 'Booking Spa của tôi' },
    { id: 'vouchers', icon: <Ticket size={18} />, label: 'Ví Voucher' },
    { id: 'points', icon: <Star size={18} />, label: 'Tycoon Tích Điểm' },
    { id: 'wishlist', icon: <Heart size={18} />, label: 'Sản phẩm yêu thích' },
    { id: 'address', icon: <MapPin size={18} />, label: 'Sổ địa chỉ nhận hàng' },
  ];

  return (
    <div className="bg-[#f4f4f4] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 text-[13px] text-gray-500 mb-6">
          <span className="hover:text-[#005a31] cursor-pointer">Trang chủ</span>
          <span>&gt;</span>
          <strong className="text-gray-800">Tài khoản</strong>
        </div>

        <div className="flex gap-6 items-start">
          {/* Sidebar */}
          <div className="w-[240px] flex-shrink-0">
            <div className="bg-white rounded-[2rem] shadow-soft border border-gray-100 p-6 mb-5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#005a31] to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-soft">
                  {(user.full_name || user.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-800">{user.full_name || user.username}</p>
                  <p className="text-[12px] text-gray-400">{user.username}</p>
                </div>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[12px] font-bold ${tierColors[user.tier] || tierColors.Bronze}`}>
                <Star size={12} className="fill-current" /> Hạng {user.tier || 'Bronze'} • {user.points || 0} điểm
              </div>

              {/* Loyalty Progress Bar */}
              <div className="mt-4">
                 <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase mb-1">
                    <span>{user.tier || 'Bronze'}</span>
                    <span>Diamond</span>
                 </div>
                 <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#005a31] to-[#ff6b00] rounded-full" 
                      style={{ width: `${Math.min(100, (user.points / 5000) * 100)}%` }}
                    ></div>
                 </div>
                 <p className="text-[10px] text-gray-400 mt-1.5 italic">Tích thêm {5000 - (user.points || 0)} điểm để lên hạng tiếp theo</p>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-soft border border-gray-100 overflow-hidden">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 text-[14px] transition-soft border-b border-gray-50 last:border-0 ${activeTab === item.id ? 'text-[#ff6b00] font-bold bg-orange-50/50' : 'text-gray-700 hover:text-[#005a31] hover:bg-gray-50'}`}
                >
                  <span className={activeTab === item.id ? 'text-[#ff6b00]' : 'text-gray-400'}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-4 text-[14px] text-gray-400 hover:text-red-500 hover:bg-red-50 transition-soft">
                <LogOut size={18} /> Đăng xuất
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">

            {/* ── Tab: Thông tin tài khoản ── */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-7 bg-white p-8 rounded-[2rem] shadow-soft border border-gray-100">
                  <h2 className="text-[18px] font-bold text-gray-800 mb-6">Thông tin cá nhân</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    {message && (
                      <div className={`p-4 rounded-2xl text-[13px] ${message.type === 'success' ? 'bg-emerald-50 text-[#005a31] border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {message.text}
                      </div>
                    )}
                    <div className="relative">
                      <input disabled type="text" value={user.username}
                        className="w-full border border-gray-100 py-3 pl-4 pr-10 rounded-full text-[14px] bg-gray-50 text-gray-400 cursor-not-allowed" />
                      <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    </div>
                    <div className="relative">
                      <input type="text" placeholder="Họ và Tên" value={fullName} onChange={e => setFullName(e.target.value)}
                        className="w-full border border-gray-200 py-3 pl-4 pr-10 rounded-full text-[14px] focus:outline-none focus:border-[#005a31] bg-gray-50/50" />
                      <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="flex gap-4">
                      {['Nam', 'Nữ', 'Không xác định'].map(g => (
                        <label key={g} className="flex items-center gap-2 text-[14px] cursor-pointer">
                          <input type="radio" name="gender" value={g} checked={gender === g} onChange={e => setGender(e.target.value)} className="w-4 h-4 text-[#005a31]" />
                          {g}
                        </label>
                      ))}
                    </div>
                    <div>
                      <p className="text-[14px] text-gray-700 mb-3 font-medium">Ngày sinh <span className="text-gray-400 font-normal">(Tùy chọn)</span></p>
                      <div className="flex gap-3">
                        <select value={dobDay} onChange={e => setDobDay(e.target.value)} className="flex-1 border border-gray-200 rounded-full py-2.5 px-4 text-[14px] focus:outline-none focus:border-[#005a31] bg-gray-50/50">
                          <option value="">Ngày</option>
                          {Array.from({length: 31}, (_, i) => <option key={i+1} value={(i+1).toString().padStart(2,'0')}>{i+1}</option>)}
                        </select>
                        <select value={dobMonth} onChange={e => setDobMonth(e.target.value)} className="flex-1 border border-gray-200 rounded-full py-2.5 px-4 text-[14px] focus:outline-none focus:border-[#005a31] bg-gray-50/50">
                          <option value="">Tháng</option>
                          {Array.from({length: 12}, (_, i) => <option key={i+1} value={(i+1).toString().padStart(2,'0')}>{i+1}</option>)}
                        </select>
                        <select value={dobYear} onChange={e => setDobYear(e.target.value)} className="flex-1 border border-gray-200 rounded-full py-2.5 px-4 text-[14px] focus:outline-none focus:border-[#005a31] bg-gray-50/50">
                          <option value="">Năm</option>
                          {Array.from({length: 80}, (_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
                        </select>
                      </div>
                    </div>
                    <button type="submit" disabled={isSubmitting}
                      className="w-full bg-[#005a31] text-white py-3 rounded-full font-bold hover:bg-emerald-800 transition-soft shadow-soft disabled:opacity-60">
                      {isSubmitting ? 'Đăng lưu...' : 'Lưu thay đổi'}
                    </button>
                  </form>
                </div>

                <div className="col-span-5 space-y-4">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-[15px] text-gray-800 mb-4 border-b pb-2">Liên hệ</h3>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3"><Phone size={16} className="text-gray-400" /><div><p className="text-[12px] text-gray-400">SĐT</p><p className="text-[14px]">{displayPhone}</p></div></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Mail size={16} className="text-gray-400" /><div><p className="text-[12px] text-gray-400">Email</p><p className="text-[14px] truncate max-w-[140px]">{displayEmail}</p></div></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-[15px] text-gray-800 mb-4 border-b pb-2">Bảo mật</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Lock size={16} className="text-gray-400" /><span className="text-[14px]">Mật khẩu</span></div>
                      <button onClick={() => setShowPwModal(true)} className="bg-[#005a31] text-white px-3 py-1.5 rounded-lg text-[12px] font-bold hover:bg-emerald-800 transition-colors">Đổi mật khẩu</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Đơn hàng ── */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-[2rem] shadow-soft border border-gray-100 p-8">
                <h2 className="text-[18px] font-bold text-gray-800 mb-6 flex items-center gap-2"><Package size={20} className="text-[#005a31]" /> Đơn hàng của tôi</h2>
                {ordersLoading ? (
                  <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#005a31] border-t-transparent rounded-full animate-spin"></div></div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 text-gray-400"><Package size={48} className="mx-auto mb-4 opacity-30" /><p>Chưa có đơn hàng nào</p></div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => {
                      const productNames = order.product_names ? order.product_names.split('||') : [];
                      const images = order.images ? order.images.split('||') : [];
                      const status = order.order_status || 'processing';
                      return (
                        <div key={order.id} className="border border-gray-100 rounded-[1.5rem] p-5 hover:shadow-soft transition-soft bg-gray-50/30">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[13px] font-bold text-gray-600">Đơn #{order.id}</span>
                            <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${statusColors[status] || statusColors.processing}`}>
                              {status === 'processing' ? 'Đang xử lý' : status === 'completed' ? 'Hoàn thành' : status === 'cancelled' ? 'Đã hủy' : 'Chờ xác nhận'}
                            </span>
                          </div>
                          <div className="flex gap-2 mb-3">
                            {images.slice(0, 3).map((img: string, idx: number) => (
                              <img key={idx} src={img} alt={productNames[idx]} className="w-14 h-14 object-contain border border-gray-100 rounded-lg p-1 bg-gray-50" />
                            ))}
                            {images.length > 3 && <div className="w-14 h-14 border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-[13px] font-bold bg-gray-50">+{images.length - 3}</div>}
                          </div>
                          <p className="text-[13px] text-gray-500 mb-2 line-clamp-1">{productNames.join(', ')}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-gray-400">{order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : ''}</span>
                            <span className="text-[16px] font-bold text-[#ff6b00]">{order.final_amount?.toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Booking Spa ── */}
            {activeTab === 'booking' && (
              <div className="bg-white rounded-[2rem] shadow-soft border border-gray-100 p-8">
                <h2 className="text-[18px] font-bold text-gray-800 mb-6 flex items-center gap-2"><Calendar size={20} className="text-[#005a31]" /> Booking Spa của tôi</h2>
                {bookingsLoading ? (
                  <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#005a31] border-t-transparent rounded-full animate-spin"></div></div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-16 text-gray-400"><Calendar size={48} className="mx-auto mb-4 opacity-30" /><p>Chưa có lịch đặt nào</p></div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map(b => (
                      <div key={b.id} className="border border-gray-100 rounded-[1.5rem] p-5 flex items-center justify-between hover:shadow-soft transition-soft bg-gray-50/30">
                        <div>
                          <p className="font-bold text-gray-800 mb-1">{b.service_name}</p>
                          <p className="text-[13px] text-gray-500">{b.category} • {b.duration_minutes} phút</p>
                          <p className="text-[12px] text-gray-400 mt-1">🕐 {b.booking_time ? new Date(b.booking_time).toLocaleString('vi-VN') : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#ff6b00]">{b.price?.toLocaleString('vi-VN')} đ</p>
                          <span className={`text-[12px] font-bold px-2 py-1 rounded-full ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : b.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {b.status === 'pending' ? 'Chờ xác nhận' : b.status === 'confirmed' ? 'Đã xác nhận' : b.status === 'completed' ? 'Hoàn thành' : b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Ví Voucher ── */}
            {activeTab === 'vouchers' && (
              <div className="bg-white rounded-[2rem] shadow-soft border border-gray-100 p-8">
                <h2 className="text-[18px] font-bold text-gray-800 mb-6 flex items-center gap-2"><Ticket size={20} className="text-[#ff6b00]" /> Ví Voucher của tôi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vouchers.map(v => (
                    <div key={v.id} className="border border-orange-100 bg-gradient-to-br from-white to-orange-50/30 rounded-2xl p-5 flex gap-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100/20 rounded-bl-[4rem] transition-all group-hover:scale-110"></div>
                      <div className="w-16 h-16 bg-[#ff6b00] rounded-xl flex items-center justify-center text-white shadow-soft shrink-0">
                        <Ticket size={32} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[#ff6b00] text-[16px] leading-tight mb-1">{v.discount.toLocaleString('vi-VN')} đ</p>
                        <p className="text-[13px] font-bold text-gray-800 line-clamp-1">{v.description}</p>
                        <p className="text-[11px] text-gray-400 mt-2">HSD: {new Date(v.expiry).toLocaleDateString('vi-VN')}</p>
                        <p className="text-[11px] text-[#005a31] font-bold mt-1">Đơn tối thiểu {v.min_order.toLocaleString('vi-VN')} đ</p>
                      </div>
                      <button className="self-center bg-white border border-[#ff6b00] text-[#ff6b00] px-4 py-1.5 rounded-full text-[12px] font-bold hover:bg-[#ff6b00] hover:text-white transition-all shadow-sm">Dùng ngay</button>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                   <p className="text-[13px] text-gray-500">Bạn có mã giảm giá khác? <button className="text-[#005a31] font-bold hover:underline">Nhập mã tại đây</button></p>
                </div>
              </div>
            )}

            {/* ── Tab: Tích điểm ── */}
            {activeTab === 'points' && (
              <div className="space-y-4">
                {pointsData ? (
                  <>
                    <div className="bg-gradient-to-r from-[#005a31] to-emerald-600 rounded-[2rem] p-8 text-white shadow-soft relative overflow-hidden">
                      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                      <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                      <p className="text-[13px] opacity-80 uppercase tracking-wide mb-1">Tổng điểm tích lũy</p>
                      <p className="text-[48px] font-black leading-none">{pointsData.total_points}</p>
                      <p className="text-[14px] opacity-80 mt-1">điểm Tycoon</p>
                      <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-[13px] font-bold ${tierColors[pointsData.tier] || tierColors.Bronze}`}>
                        <Star size={12} className="fill-current" /> Hạng {pointsData.tier}
                      </div>
                    </div>
                    <div className="bg-white rounded-[2rem] shadow-soft border border-gray-100 p-8">
                      <h3 className="font-bold text-[16px] mb-6">Lịch sử tích điểm</h3>
                      {pointsData.history.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">Chưa có lịch sử tích điểm</p>
                      ) : (
                        <div className="space-y-3">
                          {pointsData.history.map((h: any) => (
                            <div key={h.order_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="text-[14px] font-medium">Đơn hàng #{h.order_id}</p>
                                <p className="text-[12px] text-gray-400">{h.created_at ? new Date(h.created_at).toLocaleDateString('vi-VN') : ''} • {h.payment_method === 'cash' ? 'COD' : 'QR'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[14px] font-bold text-[#005a31]">+{h.points_earned} điểm</p>
                                <p className="text-[12px] text-gray-400">{h.final_amount?.toLocaleString('vi-VN')} đ</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#005a31] border-t-transparent rounded-full animate-spin"></div></div>
                )}
              </div>
            )}

            {/* ── Tab: Yêu thích ── */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-[2rem] shadow-soft border border-gray-100 p-8">
                <h2 className="text-[18px] font-bold text-gray-800 mb-6 flex items-center gap-2"><Heart size={20} className="text-red-500" /> Sản phẩm yêu thích</h2>
                {wishlistLoading ? (
                  <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#005a31] border-t-transparent rounded-full animate-spin"></div></div>
                ) : wishlist.length === 0 ? (
                  <div className="text-center py-16 text-gray-400"><Heart size={48} className="mx-auto mb-4 opacity-30" /><p>Chưa có sản phẩm yêu thích nào</p></div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {wishlist.map(item => (
                      <div key={item.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-soft transition-soft group relative bg-white">
                        <button onClick={() => handleRemoveWishlist(item.id)} className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-gray-400 hover:text-red-500 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={14} />
                        </button>
                        <div className="aspect-square bg-gray-50 p-3">
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="p-3">
                          <p className="text-[11px] font-bold text-[#005a31] uppercase mb-1">{item.brand_name}</p>
                          <p className="text-[13px] text-gray-800 line-clamp-2 mb-2 h-10">{item.name}</p>
                          <p className="text-[#ff6b00] font-bold">{item.price?.toLocaleString('vi-VN')} đ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Sổ địa chỉ ── */}
            {activeTab === 'address' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2"><MapPin size={20} className="text-[#005a31]" /> Sổ địa chỉ</h2>
                  <button onClick={() => setShowAddressForm(true)} className="flex items-center gap-2 bg-[#005a31] text-white px-6 py-2.5 rounded-full text-[14px] font-bold hover:bg-emerald-800 transition-soft shadow-soft">
                    <Plus size={16} /> Thêm địa chỉ mới
                  </button>
                </div>

                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="bg-gray-50 rounded-[1.5rem] p-6 mb-8 border border-gray-200 shadow-inner">
                    <h3 className="font-bold text-[15px] mb-5">Địa chỉ mới</h3>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <input required placeholder="Họ và tên người nhận" value={addrName} onChange={e => setAddrName(e.target.value)} className="border border-gray-200 rounded-full px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#005a31] bg-white" />
                      <input required placeholder="Số điện thoại" value={addrPhone} onChange={e => setAddrPhone(e.target.value)} className="border border-gray-200 rounded-full px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#005a31] bg-white" />
                      <input required placeholder="Tỉnh / Thành phố" value={addrProvince} onChange={e => setAddrProvince(e.target.value)} className="border border-gray-200 rounded-full px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#005a31] bg-white" />
                      <input required placeholder="Địa chỉ chi tiết (Số nhà, đường...)" value={addrAddress} onChange={e => setAddrAddress(e.target.value)} className="border border-gray-200 rounded-[1.5rem] px-4 py-3 text-[14px] focus:outline-none focus:border-[#005a31] col-span-2 bg-white" />
                    </div>
                    <label className="flex items-center gap-3 text-[14px] text-gray-700 mb-6 cursor-pointer">
                      <input type="checkbox" checked={addrDefault} onChange={e => setAddrDefault(e.target.checked)} className="w-5 h-5 text-[#005a31] rounded-full" />
                      <span className="font-medium">Đặt làm địa chỉ mặc định</span>
                    </label>
                    <div className="flex gap-4">
                      <button type="submit" className="bg-[#005a31] text-white px-8 py-2.5 rounded-full font-bold text-[14px] hover:bg-emerald-800 shadow-soft transition-soft">Lưu</button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="border border-gray-300 px-8 py-2.5 rounded-full font-bold text-[14px] text-gray-600 hover:bg-white transition-soft">Hủy</button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <div className="text-center py-16 text-gray-400"><MapPin size={48} className="mx-auto mb-4 opacity-30" /><p>Chưa có địa chỉ nào</p></div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map(addr => (
                      <div key={addr.id} className={`border rounded-[1.5rem] p-5 transition-soft ${addr.is_default ? 'border-[#005a31] bg-emerald-50 shadow-soft' : 'border-gray-100 bg-white hover:shadow-soft'}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-[15px]">{addr.full_name}</span>
                              {addr.is_default ? <span className="bg-[#005a31] text-white text-[11px] px-2 py-0.5 rounded-full font-bold">Mặc định</span> : null}
                            </div>
                            <p className="text-[14px] text-gray-600">{addr.phone}</p>
                            <p className="text-[14px] text-gray-600">{addr.address}, {addr.province}</p>
                          </div>
                          <div className="flex gap-2">
                            {!addr.is_default && (
                              <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-[13px] text-[#005a31] font-medium hover:underline">Đặt mặc định</button>
                            )}
                            <button onClick={() => handleDeleteAddress(addr.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Đổi mật khẩu Modal */}
      {showPwModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-soft p-10 w-[440px] relative animate-in zoom-in-95 duration-200">
            <button onClick={() => { setShowPwModal(false); setPwMsg(null); setOldPw(''); setNewPw(''); setConfirmPw(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h2 className="text-[18px] font-bold text-gray-800 mb-6 flex items-center gap-2"><Lock size={18} className="text-[#005a31]" /> Đổi mật khẩu</h2>
            {pwMsg && (
              <div className={`p-3 rounded-lg text-[13px] mb-4 ${pwMsg.type === 'success' ? 'bg-emerald-50 text-[#005a31] border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {pwMsg.type === 'success' && <CheckCircle2 size={14} className="inline mr-1" />}{pwMsg.text}
              </div>
            )}
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="relative">
                <input required type={showOldPw ? 'text' : 'password'} placeholder="Mật khẩu hiện tại" value={oldPw} onChange={e => setOldPw(e.target.value)}
                  className="w-full border border-gray-200 rounded-full px-5 py-3 text-[14px] pr-12 focus:outline-none focus:border-[#005a31] bg-gray-50" />
                <button type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showOldPw ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
              </div>
              <div className="relative">
                <input required type={showNewPw ? 'text' : 'password'} placeholder="Mật khẩu mới (ít nhất 6 ký tự)" value={newPw} onChange={e => setNewPw(e.target.value)}
                  className="w-full border border-gray-200 rounded-full px-5 py-3 text-[14px] pr-12 focus:outline-none focus:border-[#005a31] bg-gray-50" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showNewPw ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
              </div>
              <input required type="password" placeholder="Xác nhận mật khẩu mới" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                className="w-full border border-gray-200 rounded-full px-5 py-3 text-[14px] focus:outline-none focus:border-[#005a31] bg-gray-50" />
              <button type="submit" className="w-full bg-[#005a31] text-white py-3.5 rounded-full font-bold hover:bg-emerald-800 transition-soft shadow-soft mt-2">Đổi mật khẩu</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
