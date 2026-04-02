import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, CalendarCheck, Users, Megaphone, Settings,
  LogOut, Bell, Search, Download, Plus, MoreHorizontal, Edit2, Trash2,
  X, Save, Tag, List, Building2, Image as ImageIcon, Clock, TrendingUp,
  ShoppingBag, UserCheck, ChevronUp, ChevronDown, RefreshCw, MessageSquare, Send
} from 'lucide-react';

/* ─── TYPES ─── */
interface Product {
  id: number; name: string; price: number; original_price: number;
  discount_percent: number; image_url: string; category_name: string;
  is_flash_deal: boolean; sold_count: number; brand_id?: number; brand_name?: string;
}
interface Brand { id: number; name: string; }
interface Order { id: number; user_id: number; total_amount: number; final_amount: number; payment_method: string; order_status?: string; created_at: string; product_names?: string; }
interface SpaBooking { id: number; user_id: number; service_name: string; branch_name: string; booking_time: string; status: string; }
interface Customer { id: number; username: string; full_name: string; role: string; tier: string; points: number; }
interface ChatSession { id: number; user_id: number; user_name: string; user_username: string; status: string; updated_at: string; }
interface ChatMessage { id: number; session_id: number; sender_id: number; sender_role: string; message: string; created_at: string; }

const STATUS_CLS: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700',
  confirmed: 'bg-blue-100 text-blue-700',
  pending:   'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-600',
};

/* ─── MODAL THÊM/SỬA SẢN PHẨM ─── */
function ProductModal({ product, brands, onClose, onSave }: {
  product: Partial<Product>; brands: Brand[];
  onClose: () => void; onSave: (p: Partial<Product>) => void;
}) {
  const [form, setForm] = useState<Partial<Product>>(product);
  const f = (k: keyof Product, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="bg-white rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <header className="px-8 py-5 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#2d6a4f]">{form.id ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={18}/></button>
        </header>
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">Tên sản phẩm *</label>
            <div className="relative"><Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
              <input required className="w-full bg-gray-50 border-2 border-transparent focus:border-[#2d6a4f] rounded-xl py-2.5 pl-10 pr-4 outline-none text-sm transition" placeholder="Nhập tên sản phẩm..." value={form.name||''} onChange={e=>f('name',e.target.value)}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Giá bán (₫) *</label>
              <input required type="number" className="w-full bg-gray-50 border-2 border-transparent focus:border-[#2d6a4f] rounded-xl py-2.5 px-4 outline-none text-sm transition" placeholder="0" value={form.price||''} onChange={e=>f('price',parseInt(e.target.value))}/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Giá gốc (₫) *</label>
              <input required type="number" className="w-full bg-gray-50 border-2 border-transparent focus:border-[#2d6a4f] rounded-xl py-2.5 px-4 outline-none text-sm transition" placeholder="0" value={form.original_price||''} onChange={e=>f('original_price',parseInt(e.target.value))}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Danh mục</label>
              <div className="relative"><List className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <select className="w-full bg-gray-50 border-2 border-transparent focus:border-[#2d6a4f] rounded-xl py-2.5 pl-10 pr-4 outline-none text-sm transition appearance-none" value={form.category_name||''} onChange={e=>f('category_name',e.target.value)}>
                  <option value="">Chọn danh mục</option>
                  {['Chăm Sóc Da Mặt','Trang Điểm','Chăm Sóc Tóc','Chăm Sóc Cơ Thể','Nước Hoa','Thực Phẩm Chức Năng'].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">Thương hiệu</label>
              <div className="relative"><Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <select className="w-full bg-gray-50 border-2 border-transparent focus:border-[#2d6a4f] rounded-xl py-2.5 pl-10 pr-4 outline-none text-sm transition appearance-none" value={form.brand_id||''} onChange={e=>f('brand_id',parseInt(e.target.value))}>
                  <option value="">Chọn thương hiệu</option>
                  {brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1 block">URL Hình ảnh *</label>
            <div className="relative"><ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
              <input required className="w-full bg-gray-50 border-2 border-transparent focus:border-[#2d6a4f] rounded-xl py-2.5 pl-10 pr-4 outline-none text-sm transition" placeholder="https://..." value={form.image_url||''} onChange={e=>f('image_url',e.target.value)}/>
            </div>
          </div>
          <label className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-orange-500" checked={!!form.is_flash_deal} onChange={e=>f('is_flash_deal',e.target.checked)}/>
            <span className="text-sm font-bold text-orange-800">Kích hoạt FLASH DEAL cho sản phẩm này</span>
          </label>
        </div>
        <footer className="px-8 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-full font-semibold text-gray-600 hover:bg-gray-200 text-sm">Hủy</button>
          <button onClick={()=>onSave(form)} className="px-8 py-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white rounded-full font-bold flex items-center gap-2 text-sm shadow-md">
            <Save size={15}/> Lưu
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ─── MAIN ─── */
export default function AdminLayout() {
  const user = (() => { try { return JSON.parse(localStorage.getItem('tycoon_user')||'null'); } catch { return null; } })();
  const [tab, setTab]             = useState(user?.role === 'admin' ? 'dashboard' : 'products');
  const [products, setProducts]   = useState<Product[]>([]);
  const [brands, setBrands]       = useState<Brand[]>([]);
  const [orders, setOrders]       = useState<Order[]>([]);
  const [bookings, setBookings]   = useState<SpaBooking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Chat state
  const [sessions, setSessions]   = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<number|null>(null);
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  const [modal, setModal]         = useState(false);
  const [editP, setEditP]         = useState<Partial<Product>>({});
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [notif, setNotif]         = useState(false);
  const [stats, setStats]         = useState({ revenue: 0, orders: 0, customers: 0, products: 0 });

  const token = localStorage.getItem('tycoon_token') || '';
  const authHead = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const NAV = user?.role === 'admin' ? [
    { id: 'dashboard',  label: 'Tổng Quan',      Icon: LayoutDashboard },
    { id: 'products',   label: 'Sản Phẩm',        Icon: Package },
    { id: 'orders',     label: 'Đơn Hàng',        Icon: ShoppingBag },
    { id: 'bookings',   label: 'Lịch Đặt Spa',    Icon: CalendarCheck },
    { id: 'customers',  label: 'Khách Hàng',      Icon: Users },
    { id: 'support',    label: 'Tư Vấn Hỗ Trợ',   Icon: MessageSquare },
    { id: 'marketing',  label: 'Marketing',       Icon: Megaphone },
    { id: 'settings',   label: 'Cài Đặt',         Icon: Settings },
  ] : [
    { id: 'products',   label: 'Sản Phẩm',        Icon: Package },
    { id: 'orders',     label: 'Đơn Hàng',        Icon: ShoppingBag },
    { id: 'support',    label: 'Tư Vấn Hỗ Trợ',   Icon: MessageSquare },
  ];

  /* Fetch helpers */
  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/admin/products', { headers: authHead })
      .then(r => r.json())
      .then(d => { if (d.success) setProducts(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  };
  const fetchBrands = () => {
    fetch('/api/brands').then(r=>r.json()).then(d=>{ if(d.success) setBrands(d.data); });
  };
  const fetchOrders = () => {
    // Lấy đơn hàng của tất cả user — dùng query không cần user_id (admin xem tất)
    fetch('/api/admin/orders', { headers: authHead })
      .then(r=>r.json())
      .then(d=>{ if(d.success) setOrders(d.data); })
      .catch(()=>{});
  };
  const fetchBookings = () => {
    fetch('/api/admin/spa-bookings', { headers: authHead })
      .then(r=>r.json())
      .then(d=>{ if(d.success) setBookings(d.data); })
      .catch(()=>{});
  };
  const fetchCustomers = () => {
    fetch('/api/admin/users', { headers: authHead })
      .then(r=>r.json())
      .then(d=>{ if(d.success) setCustomers(d.data); })
      .catch(()=>{});
  };
  const fetchStats = () => {
    // Lấy stats từ sản phẩm + orders
    fetch('/api/admin/products', { headers: authHead }).then(r=>r.json())
      .then(d=>{ if(d.success) setStats(s=>({...s, products: d.data.length})); });
    fetch('/api/admin/orders', { headers: authHead }).then(r=>r.json())
      .then(d=>{
        if(d.success){
          const total = d.data.reduce((acc: number, o: any) => acc + (o.final_amount||0), 0);
          setStats(s=>({...s, orders: d.data.length, revenue: total}));
        }
      }).catch(()=>{});
    fetch('/api/admin/users', { headers: authHead }).then(r=>r.json())
      .then(d=>{ if(d.success) setStats(s=>({...s, customers: d.data.length})); })
      .catch(()=>{});
  };

  const fetchSessions = () => {
    fetch('/api/chat/sessions', { headers: authHead })
      .then(r=>r.json()).then(d=>{ if(d.success) setSessions(d.data); });
  };

  const fetchMessages = (sessionId: number) => {
    fetch(`/api/chat/messages/${sessionId}`, { headers: authHead })
      .then(r=>r.json()).then(d=>{ if(d.success) setMessages(d.data); });
  };

  useEffect(()=>{ fetchStats(); fetchBrands(); }, []);
  useEffect(()=>{
    if(tab==='products') fetchProducts();
    if(tab==='orders')   fetchOrders();
    if(tab==='bookings') fetchBookings();
    if(tab==='customers') fetchCustomers();
    if(tab==='support')  fetchSessions();
  }, [tab]);

  useEffect(() => {
    if (activeSession) {
      fetchMessages(activeSession);
      const interval = setInterval(() => fetchMessages(activeSession), 5000);
      return () => clearInterval(interval);
    }
  }, [activeSession]);

  const handleSendMessage = () => {
    if (!chatInput.trim() || !activeSession) return;
    fetch('/api/chat/messages', {
      method: 'POST', headers: authHead,
      body: JSON.stringify({ session_id: activeSession, message: chatInput, sender_role: 'staff' })
    }).then(r=>r.json()).then(d=>{
      if (d.success) {
        setChatInput('');
        fetchMessages(activeSession);
        fetchSessions();
      }
    });
  };

  const handleSave = (form: Partial<Product>) => {
    const method = form.id ? 'PUT' : 'POST';
    const url    = form.id ? `/api/admin/products/${form.id}` : '/api/admin/products';
    fetch(url, { method, headers: authHead, body: JSON.stringify(form) })
      .then(r=>r.json()).then(d=>{ if(d.success){ setModal(false); fetchProducts(); } else alert('Lỗi: '+d.message); });
  };
  const handleDelete = (id: number) => {
    if(!window.confirm('Xóa sản phẩm này?')) return;
    fetch(`/api/admin/products/${id}`,{ method:'DELETE', headers: authHead })
      .then(r=>r.json()).then(d=>{ if(d.success) fetchProducts(); });
  };
  const handleLogout = () => { localStorage.removeItem('tycoon_token'); localStorage.removeItem('tycoon_user'); window.location.href='/'; };

  /* Access guard */
  if(!user || (user.role !== 'admin' && user.role !== 'staff')) return (
    <div className="min-h-screen bg-[#f0faf4] flex items-center justify-center" style={{fontFamily:"'Inter','Segoe UI',sans-serif"}}>
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-sm">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><X size={28} className="text-red-500"/></div>
        <h2 className="text-xl font-black text-gray-800 mb-2">Truy Cập Bị Từ Chối</h2>
        <p className="text-sm text-gray-500 mb-6">Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng quyền Quản trị hoặc Nhân viên.</p>
        <button onClick={()=>window.location.href='/'} className="px-8 py-2.5 bg-[#2d6a4f] text-white font-bold rounded-full hover:bg-[#1b4332] transition text-sm">Về Trang Chủ</button>
      </div>
    </div>
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category_name||'').toLowerCase().includes(search.toLowerCase()) ||
    (p.brand_name||'').toLowerCase().includes(search.toLowerCase())
  );

  const STAT_CARDS = [
    { label: 'Tổng Doanh Thu',  value: stats.revenue.toLocaleString('vi-VN')+'₫', delta: '+12.5%', up: true,  color:'#2d6a4f', bg:'#d8f3dc', Icon: TrendingUp },
    { label: 'Tổng Đơn Hàng',  value: stats.orders.toString(),                    delta: '+4.2%',  up: true,  color:'#0077b6', bg:'#e0f4ff', Icon: ShoppingBag },
    { label: 'Khách Hàng',      value: stats.customers.toString(),                 delta: '+8.1%',  up: true,  color:'#6236ff', bg:'#ede9fe', Icon: UserCheck },
    { label: 'Sản Phẩm',        value: stats.products.toString(),                  delta: '',       up: true,  color:'#d4a017', bg:'#fef9e7', Icon: Package },
  ];

  return (
    <div className="min-h-screen flex bg-[#f4faf6]" style={{fontFamily:"'Inter','Segoe UI',sans-serif"}}>

      {/* ── SIDEBAR ── */}
      <aside className="w-56 shrink-0 bg-[#f0fdf4] border-r border-[#d1fae5] flex flex-col">
        {/* Logo giống web chính */}
        <div className="px-5 py-4 border-b border-[#d1fae5] flex items-center gap-2">
          <img src="https://i.imgur.com/BI0tiZr.png" alt="Tycoon" className="h-8 w-auto object-contain"/>
          <div className="text-[10px] font-bold text-[#6aab8a] uppercase tracking-wider leading-none mt-1">{user?.role === 'admin' ? 'Admin' : 'Nhân Viên'}</div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV.map(({id,label,Icon})=>{
            const active = tab===id;
            return(
              <button key={id} onClick={()=>setTab(id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left text-sm font-medium
                  ${active ? 'bg-[#2d6a4f] text-white shadow-md' : 'text-[#3d6b54] hover:bg-[#dcfce7] hover:text-[#1b4332]'}`}>
                <Icon size={17} className={active?'text-white':'text-[#6aab8a]'}/>{label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-4">
          <button onClick={()=>window.location.href='/'} className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1b4332] hover:bg-[#163828] text-white rounded-xl text-xs font-bold transition mb-3">
            ← Về Trang Chủ
          </button>
        </div>

        <div className="border-t border-[#d1fae5] px-4 py-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2d6a4f] to-[#40916c] text-white text-sm font-black flex items-center justify-center">
              {user.full_name?.charAt(0)||'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-bold text-[#1b4332] truncate">{user.full_name||user.username}</div>
              <div className="text-[10px] text-[#6aab8a] font-semibold">{user?.role === 'admin' ? 'Quản Trị Viên' : 'Nhân Viên'}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-xs text-[#6aab8a] hover:text-red-500 hover:bg-red-50 px-2 py-1.5 rounded-lg transition">
            <LogOut size={13}/> Đăng Xuất
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* TOP BAR */}
        <header className="bg-white border-b border-gray-100 px-7 py-3 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Tìm kiếm..." className="w-full max-w-xs bg-gray-50 rounded-xl py-2 pl-9 pr-4 text-sm outline-none border border-gray-200 focus:border-[#2d6a4f] transition"/>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={()=>setNotif(!notif)} className="p-2 rounded-xl hover:bg-gray-100">
                <Bell size={18} className="text-gray-500"/>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"/>
              </button>
              {notif && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-4">
                  <p className="text-xs font-bold text-gray-800 mb-3">Thông Báo</p>
                  {['Đơn hàng mới cần xử lý','Sản phẩm sắp hết hàng: Serum Vitamin C','5 khách hàng đăng ký hôm nay'].map((n,i)=>(
                    <div key={i} className="py-2 border-b border-gray-50 last:border-0 text-xs text-gray-600">{n}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="w-px h-7 bg-gray-200"/>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs font-bold text-gray-800">{user.full_name||user.username}</div>
                <div className="text-[10px] text-gray-400">{user?.role === 'admin' ? 'Quản Trị Viên' : 'Nhân Viên'}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2d6a4f] to-[#40916c] text-white text-sm font-black flex items-center justify-center">
                {user.full_name?.charAt(0)||'A'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-7 bg-[#f4faf6]">

          {/* ══ TỔNG QUAN ══ */}
          {tab==='dashboard' && (
            <div className="space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-800">Tổng Quan Hệ Thống</h1>
                  <p className="text-sm text-gray-400 mt-0.5">Dữ liệu thời gian thực từ cơ sở dữ liệu</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>{fetchStats();}} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm">
                    <RefreshCw size={14}/> Làm Mới
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[#1b4332] hover:bg-[#163828] shadow-md">
                    <Download size={14}/> Xuất Báo Cáo
                  </button>
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STAT_CARDS.map(({label,value,delta,up,color,bg,Icon})=>(
                  <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:bg}}>
                        <Icon size={18} style={{color}}/>
                      </div>
                      {delta && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${up?'text-emerald-700 bg-emerald-50':'text-red-600 bg-red-50'}`}>
                          {up?<ChevronUp size={10} className="inline"/>:<ChevronDown size={10} className="inline"/>} {delta}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
                    <p className="text-2xl font-black text-gray-800 break-all">{value||'0'}</p>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-3 gap-4">
                <button onClick={()=>setTab('products')} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md text-left transition group">
                  <Package size={24} className="text-[#2d6a4f] mb-3 group-hover:scale-110 transition-transform"/>
                  <p className="font-bold text-gray-800">Quản Lý Sản Phẩm</p>
                  <p className="text-xs text-gray-400 mt-1">Thêm, sửa, xóa sản phẩm trong danh mục</p>
                </button>
                <button onClick={()=>setTab('orders')} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md text-left transition group">
                  <ShoppingBag size={24} className="text-blue-500 mb-3 group-hover:scale-110 transition-transform"/>
                  <p className="font-bold text-gray-800">Xem Đơn Hàng</p>
                  <p className="text-xs text-gray-400 mt-1">Quản lý và theo dõi tất cả đơn hàng</p>
                </button>
                <button onClick={()=>setTab('customers')} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md text-left transition group">
                  <Users size={24} className="text-purple-500 mb-3 group-hover:scale-110 transition-transform"/>
                  <p className="font-bold text-gray-800">Danh Sách Khách Hàng</p>
                  <p className="text-xs text-gray-400 mt-1">Xem thông tin và điểm loyalty của khách</p>
                </button>
              </div>
            </div>
          )}

          {/* ══ SẢN PHẨM ══ */}
          {tab==='products' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-gray-800">Sản Phẩm</h1>
                  <p className="text-sm text-gray-400 mt-0.5">Quản lý danh mục sản phẩm ({products.length} sản phẩm)</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={fetchProducts} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"><RefreshCw size={16} className="text-gray-500"/></button>
                  <button onClick={()=>{setEditP({});setModal(true);}} className="flex items-center gap-2 px-4 py-2.5 bg-[#1b4332] text-white text-sm font-bold rounded-xl hover:bg-[#163828] shadow-md">
                    <Plus size={16}/> Thêm Sản Phẩm
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="relative max-w-sm">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input value={search} onChange={e=>setSearch(e.target.value)} type="text" placeholder="Tìm theo tên, danh mục, thương hiệu..." className="w-full bg-gray-50 rounded-xl py-2 pl-9 pr-4 text-sm outline-none border border-gray-200 focus:border-[#2d6a4f] transition"/>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-8 h-8 rounded-full border-4 border-[#2d6a4f] border-t-transparent animate-spin"/>
                    <p className="text-sm text-gray-400">Đang tải dữ liệu từ máy chủ...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-gray-400 font-bold bg-gray-50 border-b border-gray-100">
                          <th className="px-6 py-3.5">Sản Phẩm</th>
                          <th className="px-6 py-3.5">Danh Mục</th>
                          <th className="px-6 py-3.5">Giá Bán</th>
                          <th className="px-6 py-3.5 text-center">Flash Deal</th>
                          <th className="px-6 py-3.5">Đã Bán</th>
                          <th className="px-6 py-3.5 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredProducts.map(p=>(
                          <tr key={p.id} className="hover:bg-[#f0fdf4] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                  <img src={p.image_url} alt="" className="w-full h-full object-contain"
                                    onError={e=>(e.target as HTMLImageElement).src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2244%22%20height%3D%2244%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2244%22%20height%3D%2244%22%20fill%3D%22%23f3f4f6%22%2F%3E%3C%2Fsvg%3E'}
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-800 line-clamp-1 max-w-[200px]">{p.name}</p>
                                  <p className="text-[11px] text-gray-400">{p.brand_name||'—'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-0.5 bg-emerald-50 text-[#2d6a4f] text-[11px] font-bold rounded-full">{p.category_name||'—'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-gray-800">{p.price.toLocaleString('vi-VN')} ₫</p>
                              <p className="text-[11px] text-gray-400 line-through">{p.original_price.toLocaleString('vi-VN')} ₫</p>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className={`w-2.5 h-2.5 rounded-full mx-auto ${p.is_flash_deal?'bg-orange-500 animate-pulse':'bg-gray-200'}`}/>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">{p.sold_count||0}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={()=>{setEditP(p);setModal(true);}} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Sửa"><Edit2 size={15}/></button>
                                <button onClick={()=>handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Xóa"><Trash2 size={15}/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredProducts.length===0 && (
                          <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-400">
                            {loading ? 'Đang tải...' : products.length===0 ? 'Không có sản phẩm nào trong cơ sở dữ liệu.' : 'Không tìm thấy sản phẩm phù hợp.'}
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ ĐƠN HÀNG ══ */}
          {tab==='orders' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-black text-gray-800">Đơn Hàng</h1>
                <p className="text-sm text-gray-400 mt-0.5">Quản lý tất cả đơn hàng từ khách hàng</p></div>
                <button onClick={fetchOrders} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"><RefreshCw size={16} className="text-gray-500"/></button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wider text-gray-400 font-bold bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-3.5">Mã ĐH</th>
                        <th className="px-6 py-3.5">Sản Phẩm</th>
                        <th className="px-6 py-3.5">Tổng Tiền</th>
                        <th className="px-6 py-3.5">Thanh Toán</th>
                        <th className="px-6 py-3.5">Ngày Đặt</th>
                        <th className="px-6 py-3.5">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.length===0 ? (
                        <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-400">Chưa có đơn hàng nào.</td></tr>
                      ) : orders.map(o=>(
                        <tr key={o.id} className="hover:bg-[#f0fdf4] transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-gray-500">#{String(o.id).padStart(6,'0')}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-[200px] truncate">{o.product_names||'—'}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-800">{(o.final_amount||0).toLocaleString('vi-VN')} ₫</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full uppercase">{o.payment_method||'—'}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{o.created_at ? new Date(o.created_at).toLocaleDateString('vi-VN') : '—'}</td>
                          <td className="px-6 py-4">
                            <select value={o.order_status || 'processing'} onChange={(e) => {
                                fetch(`/api/admin/orders/${o.id}/status`, {
                                    method: 'PUT', headers: authHead,
                                    body: JSON.stringify({ order_status: e.target.value })
                                }).then(r=>r.json()).then(d=>{ if(d.success) fetchOrders(); });
                            }} className="bg-gray-50 border border-gray-200 text-[11px] font-bold text-gray-700 rounded-lg px-2 py-1.5 outline-none cursor-pointer">
                                <option value="pending">Chờ xác nhận</option>
                                <option value="processing">Đang xử lý</option>
                                <option value="shipped">Đang giao hàng</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ LỊCH ĐẶT SPA ══ */}
          {tab==='bookings' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-black text-gray-800">Lịch Đặt Spa & Clinic</h1>
                <p className="text-sm text-gray-400 mt-0.5">Quản lý tất cả lịch hẹn dịch vụ</p></div>
                <button onClick={fetchBookings} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"><RefreshCw size={16} className="text-gray-500"/></button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wider text-gray-400 font-bold bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-3.5">Mã</th>
                        <th className="px-6 py-3.5">Khách Hàng</th>
                        <th className="px-6 py-3.5">Dịch Vụ</th>
                        <th className="px-6 py-3.5">Chi Nhánh</th>
                        <th className="px-6 py-3.5">Thời Gian</th>
                        <th className="px-6 py-3.5">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {bookings.length===0 ? (
                        <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-400">Chưa có lịch đặt nào.</td></tr>
                      ) : bookings.map(b=>(
                        <tr key={b.id} className="hover:bg-[#f0fdf4] transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-gray-500">#{b.id}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-700">KH #{b.user_id}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{b.service_name||'—'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{b.branch_name||'—'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{b.booking_time ? new Date(b.booking_time).toLocaleString('vi-VN') : '—'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${STATUS_CLS[b.status?.toLowerCase()]||'bg-gray-100 text-gray-600'}`}>
                              {b.status||'Chờ xác nhận'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ KHÁCH HÀNG ══ */}
          {tab==='customers' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-black text-gray-800">Khách Hàng</h1>
                <p className="text-sm text-gray-400 mt-0.5">Tổng {customers.length} tài khoản trong hệ thống</p></div>
                <button onClick={fetchCustomers} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"><RefreshCw size={16} className="text-gray-500"/></button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {label:'Tổng Khách Hàng', val: customers.length},
                  {label:'Khách VIP',        val: customers.filter(c=>c.tier==='VIP'||c.tier==='Diamond').length},
                  {label:'Tổng Điểm Thưởng', val: customers.reduce((a,c)=>a+(c.points||0),0).toLocaleString('vi-VN')+'đ'},
                ].map(c=>(
                  <div key={c.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                    <p className="text-2xl font-black text-gray-800">{c.val}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wider text-gray-400 font-bold bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-3.5">ID</th>
                        <th className="px-6 py-3.5">Tên Đăng Nhập</th>
                        <th className="px-6 py-3.5">Họ Tên</th>
                        <th className="px-6 py-3.5">Vai Trò</th>
                        <th className="px-6 py-3.5">Hạng</th>
                        <th className="px-6 py-3.5">Điểm Thưởng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {customers.length===0 ? (
                        <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-400">Chưa có dữ liệu khách hàng.</td></tr>
                      ) : customers.map(c=>(
                        <tr key={c.id} className="hover:bg-[#f0fdf4] transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-gray-500">#{c.id}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">{c.username}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{c.full_name||'—'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${c.role==='admin'?'bg-red-100 text-red-700':c.role==='staff'?'bg-blue-100 text-blue-700':'bg-emerald-50 text-emerald-700'}`}>
                              {c.role==='admin'?'Quản Trị':c.role==='staff'?'Nhân Viên':'Khách Hàng'}
                            </span>
                          </td>
                          <td className="px-6 py-4"><span className="text-sm font-bold text-[#2d6a4f]">{c.tier||'Member'}</span></td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-600">{(c.points||0).toLocaleString('vi-VN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ MARKETING ══ */}
          {tab==='marketing' && (
            <div className="space-y-5">
              <h1 className="text-2xl font-black text-gray-800">Marketing</h1>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center text-center">
                <Megaphone size={40} className="text-orange-300 mb-4"/>
                <h3 className="text-base font-bold text-gray-700 mb-1">Quản Lý Chiến Dịch Marketing</h3>
                <p className="text-sm text-gray-400 max-w-sm">Email marketing, thông báo đẩy và quản lý khuyến mãi đang được phát triển.</p>
              </div>
            </div>
          )}

          {/* ══ CÀI ĐẶT ══ */}
          {tab==='settings' && (
            <div className="space-y-5">
              <h1 className="text-2xl font-black text-gray-800">Cài Đặt Hệ Thống</h1>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 max-w-xl">
                {[
                  {label:'Tên Cửa Hàng', val:'Tycoon - Mỹ Phẩm & Clinic'},
                  {label:'Email Quản Trị', val: user.email||user.username},
                  {label:'Múi Giờ', val:'Asia/Ho_Chi_Minh (GMT+7)'},
                  {label:'Phiên Bản', val:'v2.0.0'},
                ].map(f=>(
                  <div key={f.label}>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">{f.label}</label>
                    <input readOnly value={f.val} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 font-medium outline-none"/>
                  </div>
                ))}
                <button className="px-6 py-2.5 bg-[#1b4332] text-white text-sm font-bold rounded-xl hover:bg-[#163828] transition shadow">Lưu Thay Đổi</button>
              </div>
            </div>
          )}

          {/* ══ TƯ VẤN HỖ TRỢ / CHAT ══ */}
          {tab==='support' && (
            <div className="flex bg-white h-[calc(100vh-140px)] rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
               {/* Sessions list */}
               <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
                 <div className="p-4 border-b border-gray-100 bg-white">
                   <h2 className="font-bold text-gray-800">Khách Hàng Cần Hỗ Trợ</h2>
                   <p className="text-[11px] text-gray-400">{sessions.length} phiên chat</p>
                 </div>
                 <div className="flex-1 overflow-y-auto min-h-0">
                   {sessions.map(s => (
                     <div key={s.id} onClick={() => setActiveSession(s.id)}
                       className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${activeSession === s.id ? 'bg-emerald-50' : 'hover:bg-gray-100 bg-white'}`}>
                       <div className="flex justify-between items-start mb-1">
                         <span className="font-bold text-sm text-gray-800">{s.user_name || s.user_username}</span>
                         <span className="text-[10px] text-gray-400">{new Date(s.updated_at).toLocaleTimeString('vi-VN')}</span>
                       </div>
                       <p className="text-xs text-gray-500 truncate">Khách hàng yêu cầu tư vấn (# {s.user_id})</p>
                     </div>
                   ))}
                   {sessions.length === 0 && <p className="p-5 text-center text-xs text-gray-400">Không có đoạn chat nào.</p>}
                 </div>
               </div>
               
               {/* Chat area */}
               <div className="w-2/3 flex flex-col bg-white">
                 {activeSession ? (
                   <>
                     <div className="p-4 border-b border-gray-100 shadow-sm flex items-center justify-between bg-white z-10">
                       <div>
                         <h3 className="font-bold text-gray-800">Phiên Chat #{activeSession}</h3>
                         <p className="text-xs text-emerald-600 font-medium">Đang hoạt động</p>
                       </div>
                       <button className="text-xs text-gray-500 hover:text-red-500 transition px-3 py-1.5 rounded-lg border border-gray-200">Đóng phiên</button>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
                       {messages.map((m, i) => {
                         const isStaff = m.sender_role === 'staff' || m.sender_role === 'admin';
                         return (
                           <div key={i} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isStaff ? 'bg-[#2d6a4f] text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                               <p>{m.message}</p>
                               <span className={`block text-[9px] mt-1 text-right ${isStaff ? 'text-emerald-200' : 'text-gray-400'}`}>
                                 {new Date(m.created_at).toLocaleTimeString('vi-VN')}
                               </span>
                             </div>
                           </div>
                         );
                       })}
                       {messages.length===0 && <p className="text-center text-xs text-gray-400 py-10">Khách hàng chưa gửi tin nhắn.</p>}
                     </div>
                     
                     <div className="p-4 border-t border-gray-100 bg-white">
                       <div className="flex items-center gap-2">
                         <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')handleSendMessage();}}
                           className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2d6a4f] transition"
                           placeholder="Nhập tin nhắn hỗ trợ..." />
                         <button onClick={handleSendMessage} className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white p-3 rounded-xl transition shadow-md">
                           <Send size={18}/>
                         </button>
                       </div>
                     </div>
                   </>
                 ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                     <MessageSquare size={48} className="mb-4 opacity-20"/>
                     <p>Chọn một cuộc trò chuyện để bắt đầu hỗ trợ</p>
                   </div>
                 )}
               </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL SẢN PHẨM */}
      {modal && <ProductModal product={editP} brands={brands} onClose={()=>setModal(false)} onSave={handleSave}/>}
    </div>
  );
}
