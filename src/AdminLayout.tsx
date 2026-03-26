import React, { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, Settings, LogOut, LayoutDashboard, Plus, Trash2, Edit3 } from 'lucide-react';

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tycoon_user') || 'null'); } catch { return null; }
  });
  
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'products') {
      fetch('/api/admin/products')
        .then(res => res.json())
        .then(data => {
            if (data.success) setProducts(data.data);
        })
        .catch(err => console.error(err));
    }
  }, [user, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('tycoon_token');
    localStorage.removeItem('tycoon_user');
    window.location.href = '/';
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-red-100 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h2>
            <p className="text-gray-600 mb-6">Bạn không có quyền quản trị viên để truy cập trang này. Vui lòng đăng nhập với tài khoản Admin.</p>
            <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-[#005a31] text-white font-bold rounded-lg hover:bg-green-800 transition">Về Trang Chủ</button>
        </div>
      </div>
    );
  }

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá sản phẩm này?')) return;
    try {
        const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            setProducts(products.filter(p => p.id !== id));
            alert('Đã xoá thành công');
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (e) {
        alert('Lỗi hệ thống');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-[#1a1f2c] text-white flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h1 className="text-xl font-black text-[#00e376] tracking-wider">TYCOON AD</h1>
        </div>
        
        <div className="flex-grow py-6">
          <ul className="space-y-2 px-4">
            <li>
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-[#00e376] text-black font-bold shadow-lg shadow-green-900/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <LayoutDashboard size={20} /> Tổng Quan
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('products')} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'products' ? 'bg-[#00e376] text-black font-bold shadow-lg shadow-green-900/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <Package size={20} /> Sản Phẩm
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('orders')} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'orders' ? 'bg-[#00e376] text-black font-bold shadow-lg shadow-green-900/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <ShoppingCart size={20} /> Đơn Hàng
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('users')} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'users' ? 'bg-[#00e376] text-black font-bold shadow-lg shadow-green-900/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <Users size={20} /> Khách Hàng
              </button>
            </li>
          </ul>
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-xl mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00e376] to-[#005a31] text-white flex items-center justify-center font-bold">
              {user.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-bold truncate">{user.full_name || user.username}</div>
              <div className="text-xs text-[#00e376]">Administrator</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
            <LogOut size={18} /> Đăng Xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800">
                {activeTab === 'dashboard' && 'Bảng Điều Khiển'}
                {activeTab === 'products' && 'Quản Lý Sản Phẩm'}
                {activeTab === 'orders' && 'Quản Lý Đơn Hàng'}
                {activeTab === 'users' && 'Danh Sách Khách Hàng'}
            </h2>
            <div className="flex items-center gap-4">
                <button onClick={() => window.location.href = '/'} className="px-4 py-1.5 text-sm font-medium text-[#005a31] border border-[#00e376] rounded-md hover:bg-green-50 transition">
                    Xem Trang User
                </button>
            </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8 bg-gray-50">
            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-2">
                        <span className="text-gray-500 font-medium">Doanh thu tháng</span>
                        <span className="text-3xl font-black text-gray-800">24.5M ₫</span>
                        <span className="text-sm text-green-500 font-bold">+12% so với tháng trước</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-2">
                        <span className="text-gray-500 font-medium">Đơn hàng mới</span>
                        <span className="text-3xl font-black text-gray-800">142</span>
                        <span className="text-sm text-green-500 font-bold">+5% so với tháng trước</span>
                    </div>
                </div>
            )}

            {activeTab === 'products' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full max-h-fit">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <input type="text" placeholder="Tìm tên sản phẩm..." className="px-4 py-2 bg-white border border-gray-300 rounded-lg w-64 focus:outline-none focus:border-[#005a31] focus:ring-1 focus:ring-[#005a31]" />
                        </div>
                        <button className="flex items-center gap-2 bg-[#005a31] text-white px-5 py-2 rounded-lg font-bold hover:bg-green-800 shadow-md">
                            <Plus size={18} /> Thêm Sản Phẩm Mới
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100/50 text-gray-500 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-semibold border-b">ID</th>
                                    <th className="p-4 font-semibold border-b">Ảnh</th>
                                    <th className="p-4 font-semibold border-b max-w-[200px]">Tên Sản Phẩm</th>
                                    <th className="p-4 font-semibold border-b">Danh Mục</th>
                                    <th className="p-4 font-semibold border-b">Giá Bán</th>
                                    <th className="p-4 font-semibold border-b text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-mono text-xs text-gray-400">{p.id.substring(0, 8)}...</td>
                                        <td className="p-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                                                <img src={p.image_url} alt="img" className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-gray-800 max-w-[200px] truncate" title={p.name}>{p.name}</td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">{p.category_name}</span>
                                        </td>
                                        <td className="p-4 font-bold text-red-500">{p.price.toLocaleString('vi-VN')} ₫</td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button className="text-gray-400 hover:text-blue-500 transition-colors" title="Sửa"><Edit3 size={18} /></button>
                                                <button onClick={() => handleDeleteProduct(p.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Xoá"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {products.length === 0 && <div className="p-8 text-center text-gray-400">Chưa có sản phẩm nào. Đang tải...</div>}
                    </div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
}
