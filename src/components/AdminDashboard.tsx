import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Package, List, Clock, ChevronLeft, 
  Save, X, Image as ImageIcon, Tag, Hash, Building2
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  original_price: number;
  discount_percent: number;
  image_url: string;
  category_name: string;
  is_flash_deal: boolean;
  sold_count: number;
  brand_id?: number;
  brand_name?: string;
}

interface Brand {
  id: number;
  name: string;
}

interface AdminDashboardProps {
  onBack: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'flash-deals' | 'inventory'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching admin products:', err);
        setLoading(false);
      });
  };

  const fetchBrands = () => {
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => {
        if (data.success) setBrands(data.data);
      });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct?.id ? 'PUT' : 'POST';
    const url = editingProduct?.id ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingProduct)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setIsModalOpen(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        alert('Lỗi: ' + data.message);
      }
    });
  };

  const handleDeleteProduct = (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) fetchProducts();
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#005a31] text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Tycoon Admin</h1>
          <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-white text-[#005a31] font-bold shadow-lg' : 'hover:bg-white/10'}`}
          >
            <List size={20} />
            <span>Sản phẩm</span>
          </button>
          <button 
            onClick={() => setActiveTab('flash-deals')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'flash-deals' ? 'bg-white text-[#005a31] font-bold shadow-lg' : 'hover:bg-white/10'}`}
          >
            <Clock size={20} />
            <span>Flash Deals</span>
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-white text-[#005a31] font-bold shadow-lg' : 'hover:bg-white/10'}`}
          >
            <Package size={20} />
            <span>Kho hàng</span>
          </button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="bg-[#004d2a] p-3 rounded-xl">
            <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Đang đăng nhập</p>
            <p className="text-[13px] font-bold">Admin Manager</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white px-8 py-5 border-b flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 capitalize">
            {activeTab === 'products' ? 'Quản lý sản phẩm' : activeTab === 'flash-deals' ? 'Thiết lập Flash Deal' : 'Theo dõi kho hàng'}
          </h2>
          {activeTab === 'products' && (
            <button 
              onClick={() => { setEditingProduct({}); setIsModalOpen(true); }}
              className="bg-[#ff6b00] hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Plus size={20} />
              Thêm sản phẩm
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
          {activeTab === 'products' ? (
            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#f1f5f9] text-[#64748b] text-[11px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Sản phẩm</th>
                      <th className="px-6 py-4">Phân loại</th>
                      <th className="px-6 py-4">Giá bán</th>
                      <th className="px-6 py-4">Flash Deal</th>
                      <th className="px-6 py-4">Đã bán</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 p-1 border">
                              <img src={product.image_url} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <p className="text-[14px] font-bold text-gray-800 line-clamp-1">{product.name}</p>
                              <p className="text-[12px] text-gray-400 capitalize">{product.brand_name || 'No Brand'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-emerald-50 text-[#005a31] text-[11px] font-bold px-2 py-1 rounded-full">{product.category_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[14px] font-bold text-gray-800">{product.price.toLocaleString('vi-VN')} đ</p>
                          <p className="text-[11px] text-gray-400 line-through">{product.original_price.toLocaleString('vi-VN')} đ</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`w-3 h-3 rounded-full mx-auto ${product.is_flash_deal ? 'bg-orange-500 animate-pulse' : 'bg-gray-200'}`}></div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[13px] font-medium text-gray-600 font-mono">{product.sold_count}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button 
                               onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                               className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                             >
                                <Edit2 size={18} />
                             </button>
                             <button 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                             >
                                <Trash2 size={18} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                    <Clock size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Tính năng đang phát triển</h3>
                <p className="text-gray-400 max-w-sm text-center">Phần {activeTab === 'flash-deals' ? 'quản lý Flash Deal' : 'quản lý kho'} đang được xây dựng để đảm bảo tính ổn định nhất.</p>
             </div>
          )}
        </main>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <header className="px-8 py-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#005a31]">{editingProduct?.id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </header>
            
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 ml-1">Tên sản phẩm</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      required
                      className="w-full bg-gray-50 border-transparent border-2 focus:border-[#005a31] focus:bg-white rounded-2xl py-3 pl-12 pr-4 outline-none transition-all text-[15px]" 
                      placeholder="Nhập tên sản phẩm..."
                      value={editingProduct?.name || ''}
                      onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 ml-1">Giá bán hiện tại</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[14px]">₫</span>
                    <input 
                      required
                      type="number"
                      className="w-full bg-gray-50 border-transparent border-2 focus:border-[#005a31] focus:bg-white rounded-2xl py-3 pl-12 pr-4 outline-none transition-all text-[15px]" 
                      placeholder="0.000"
                      value={editingProduct?.price || ''}
                      onChange={e => setEditingProduct({...editingProduct, price: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 ml-1">Giá gốc (niêm yết)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[14px]">₫</span>
                    <input 
                      required
                      type="number"
                      className="w-full bg-gray-50 border-transparent border-2 focus:border-[#005a31] focus:bg-white rounded-2xl py-3 pl-12 pr-4 outline-none transition-all text-[15px]" 
                      placeholder="0.000"
                      value={editingProduct?.original_price || ''}
                      onChange={e => setEditingProduct({...editingProduct, original_price: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 ml-1">Danh mục</label>
                  <div className="relative">
                    <List className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                      className="w-full bg-gray-50 border-transparent border-2 focus:border-[#005a31] focus:bg-white rounded-2xl py-3 pl-12 pr-4 outline-none transition-all text-[15px] appearance-none"
                      value={editingProduct?.category_name || ''}
                      onChange={e => setEditingProduct({...editingProduct, category_name: e.target.value})}
                    >
                      <option value="">Chọn danh mục</option>
                      {['Chăm Sóc Da Mặt', 'Trang Điểm', 'Chăm Sóc Tóc', 'Chăm Sóc Cơ Thể', 'Nước Hoa', 'Thực Phẩm Chức Năng'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 ml-1">Thương hiệu</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                      className="w-full bg-gray-50 border-transparent border-2 focus:border-[#005a31] focus:bg-white rounded-2xl py-3 pl-12 pr-4 outline-none transition-all text-[15px] appearance-none"
                      value={editingProduct?.brand_id || ''}
                      onChange={e => setEditingProduct({...editingProduct, brand_id: parseInt(e.target.value)})}
                    >
                      <option value="">Chọn thương hiệu</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 ml-1">URL Hình ảnh</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      required
                      className="w-full bg-gray-50 border-transparent border-2 focus:border-[#005a31] focus:bg-white rounded-2xl py-3 pl-12 pr-4 outline-none transition-all text-[15px]" 
                      placeholder="https://images.unsplash.com/..."
                      value={editingProduct?.image_url || ''}
                      onChange={e => setEditingProduct({...editingProduct, image_url: e.target.value})}
                    />
                  </div>
                </div>

                <div className="col-span-2 flex items-center gap-3 p-4 bg-[#fff7ed] rounded-2xl border border-orange-100">
                  <input 
                    type="checkbox" 
                    id="flash" 
                    className="w-5 h-5 accent-[#ff6b00] rounded"
                    checked={editingProduct?.is_flash_deal || false}
                    onChange={e => setEditingProduct({...editingProduct, is_flash_deal: e.target.checked})}
                  />
                  <label htmlFor="flash" className="text-[14px] font-bold text-orange-800 cursor-pointer select-none">Kích hoạt chế độ FLASH DEAL cho sản phẩm này</label>
                </div>
              </div>
            </form>

            <footer className="px-8 py-6 bg-gray-50 flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-full font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSaveProduct}
                className="bg-[#005a31] text-white px-10 py-2.5 rounded-full font-bold shadow-soft hover:bg-emerald-800 transition-all flex items-center gap-2"
              >
                <Save size={20} />
                Lưu thay đổi
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
