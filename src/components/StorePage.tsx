import { useState, useEffect } from 'react';
import { MapPin, Search, Clock, Navigation, ChevronDown, ChevronUp, Phone, CalendarHeart, Globe } from 'lucide-react';

interface Store {
  id: number;
  name: string;
  address: string;
  province: string;
  district: string;
  type: string;
  phone: string;
  shop_hours: string;
  clinic_hours: string;
  booking_url: string;
  lat: number;
  lng: number;
}

export default function StorePage({ initialProvince = '', onNavigate }: { initialProvince?: string, onNavigate?: (page: any) => void }) {
  const [province, setProvince] = useState(initialProvince);
  const [district, setDistrict] = useState('');
  const [branchSearch, setBranchSearch] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [expandedStoreId, setExpandedStoreId] = useState<number | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const provinces = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'];
  const districtsMap: Record<string, string[]> = {
    'Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Quận 7', 'Quận 10', 'Quận Tân Bình', 'Quận Phú Nhuận', 'Quận 9'],
    'Hà Nội': ['Hoàn Kiếm', 'Đống Đa', 'Cầu Giấy'],
    'Đà Nẵng': ['Hải Châu', 'Sơn Trà', 'Thanh Khê']
  };

  const fetchStores = () => {
    let url = '/api/stores?';
    if (province) url += `province=${encodeURIComponent(province)}&`;
    if (district) url += `district=${encodeURIComponent(district)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => { 
        if (data.success) {
          setStores(data.data);
          if (data.data.length > 0 && !selectedStore) {
            setSelectedStore(data.data[0]);
            setExpandedStoreId(data.data[0].id);
          }
        }
      })
      .catch(err => console.error('Error fetching stores:', err));
  };

  useEffect(() => { 
    if (initialProvince) setProvince(initialProvince);
  }, [initialProvince]);

  useEffect(() => { 
    fetchStores(); 
    setDistrict(''); 
  }, [province]);

  useEffect(() => {
    fetchStores();
  }, [district]);

  const filteredStores = branchSearch 
    ? stores.filter(s => s.name.toLowerCase().includes(branchSearch.toLowerCase()))
    : stores;

  const handleStoreClick = (store: Store) => {
    setExpandedStoreId(expandedStoreId === store.id ? null : store.id);
    setSelectedStore(store);
  };

  return (
    <div className="bg-[#f2f7f4] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Filters Row - Softer & More Rounded */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="relative group">
            <select
              value={province}
              className="w-full h-14 border border-gray-100 rounded-[2rem] px-6 bg-white shadow-soft focus:outline-none focus:ring-4 focus:ring-[#005a31]/10 text-[14px] appearance-none cursor-pointer transition-all"
              onChange={(e) => setProvince(e.target.value)}
            >
              <option value="">Chọn tỉnh/thành phố</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#005a31] group-hover:scale-110 transition-transform pointer-events-none" />
          </div>

          <div className="relative group">
            <select
              value={district}
              className="w-full h-14 border border-gray-100 rounded-[2rem] px-6 bg-white shadow-soft focus:outline-none focus:ring-4 focus:ring-[#005a31]/10 text-[14px] appearance-none disabled:opacity-50 cursor-pointer transition-all"
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!province}
            >
              <option value="">Chọn quận/huyện</option>
              {province && districtsMap[province]?.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#005a31] group-hover:scale-110 transition-transform pointer-events-none" />
          </div>

          <div className="relative group">
            <select
              value={branchSearch}
              className="w-full h-14 border border-gray-100 rounded-[2rem] px-6 bg-white shadow-soft focus:outline-none focus:ring-4 focus:ring-[#005a31]/10 text-[14px] appearance-none cursor-pointer transition-all"
              onChange={(e) => {
                setBranchSearch(e.target.value);
                const store = stores.find(s => s.name === e.target.value);
                if (store) {
                  setSelectedStore(store);
                  setExpandedStoreId(store.id);
                }
              }}
            >
              <option value="">Tất cả chi nhánh Tycoon</option>
              {stores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#005a31] group-hover:scale-110 transition-transform pointer-events-none" />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-8 items-start">
          
          {/* Left Column: Store List */}
          <div className="bg-white rounded-[2.5rem] shadow-premium border border-white/50 overflow-hidden flex flex-col h-[700px]">
            <div className="bg-[#005a31] p-6 flex items-center gap-4 text-white">
              <div className="bg-white/20 p-2.5 rounded-2xl">
                <MapPin size={22} fill="white" className="text-[#005a31]" />
              </div>
              <div>
                <h2 className="font-black text-[18px] leading-tight">Hệ thống cửa hàng</h2>
                <p className="text-[12px] opacity-80 uppercase tracking-widest font-black">Toàn quốc: {stores.length} chi nhánh</p>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-3">
              {filteredStores.length > 0 ? (
                filteredStores.map((store) => (
                  <div key={store.id} className="last:border-none">
                    <button
                      onClick={() => handleStoreClick(store)}
                      className={`w-full text-left p-5 rounded-[2rem] transition-all flex items-center justify-between group ${expandedStoreId === store.id ? 'bg-emerald-50 border-2 border-emerald-100' : 'bg-gray-50/50 hover:bg-gray-50 border-2 border-transparent'}`}
                    >
                      <div className="min-w-0 flex-grow pr-4">
                        <h3 className={`text-[15px] font-black leading-snug mb-1 truncate ${expandedStoreId === store.id ? 'text-[#005a31]' : 'text-gray-800'}`}>
                          {store.name}
                        </h3>
                        <p className="text-[11px] text-[#ff6b00] font-black uppercase tracking-widest">{store.type}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {expandedStoreId === store.id ? <ChevronUp size={20} className="text-[#005a31]" /> : <ChevronDown size={20} className="text-gray-300 group-hover:text-gray-400" />}
                      </div>
                    </button>

                    {expandedStoreId === store.id && (
                      <div className="px-6 pb-6 pt-4 animate-in fade-in slide-in-from-top-2 duration-400">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <MapPin size={16} className="text-[#005a31]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] text-gray-400 font-black uppercase tracking-tighter">Địa chỉ:</span>
                              <p className="text-[13px] text-gray-600 font-black leading-relaxed">{store.address}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-[1.5rem]">
                              <Clock size={16} className="text-emerald-600 mt-0.5" />
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-black uppercase">Shop:</span>
                                <span className="text-[12px] font-black text-gray-700">{store.shop_hours?.split('(')[0] || '08:00 - 22:00'}</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-[1.5rem]">
                              <CalendarHeart size={16} className="text-pink-500 mt-0.5" />
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-black uppercase">Spa:</span>
                                <span className="text-[12px] font-black text-gray-700">{store.clinic_hours?.split('(')[0] || '09:00 - 20:00'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2">
                             <button 
                              onClick={() => onNavigate && onNavigate('spa')}
                              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#ff6b00] text-[#ff6b00] py-3 rounded-full text-[14px] font-black hover:bg-[#ff6b001a] transition-all shadow-sm uppercase tracking-tight"
                            >
                              <CalendarHeart size={20} className="text-[#ff6b00] fill-[#ff6b00] stroke-[2.5]" />
                              <span>Đặt lịch hẹn ngay</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-gray-400">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin size={40} className="opacity-20" />
                  </div>
                  <p className="font-bold">Không tìm thấy cửa hàng</p>
                  <button onClick={() => {setProvince(''); setDistrict(''); setBranchSearch('');}} className="mt-2 text-[#005a31] text-[13px] font-black underline">Xóa bộ lọc</button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Map Integration */}
          <div className="bg-white rounded-[2.5rem] shadow-premium border border-white/50 overflow-hidden h-[700px] relative">
            <iframe
              title="Store Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${(selectedStore?.lng || 106.66) - 0.01},${(selectedStore?.lat || 10.76) - 0.01},${(selectedStore?.lng || 106.66) + 0.01},${(selectedStore?.lat || 10.76) + 0.01}&layer=mapnik&marker=${selectedStore?.lat || 10.7626},${selectedStore?.lng || 106.6601}`}
              className="filter contrast-[1.1] brightness-[1.02] transition-all duration-700"
            />
            
            {/* Soft Overlay Info Card */}
            <div className="absolute bottom-6 left-6 right-6 md:right-auto bg-white/95 backdrop-blur-md p-5 rounded-[2rem] shadow-2xl border border-white/50 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="flex gap-4">
                 <div className="bg-[#005a31] w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-black text-2xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform">T</div>
                 <div className="min-w-0">
                   <h4 className="text-[16px] font-black text-gray-800 leading-tight mb-1">{selectedStore?.name || 'Vị trí cửa hàng'}</h4>
                   <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed font-black">{selectedStore?.address || 'Chọn cửa hàng để xem vị trí chi tiết'}</p>
                 </div>
               </div>
            </div>

            {/* Float Markers Label */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#005a31]/90 backdrop-blur-sm px-6 py-2 rounded-full text-white text-[12px] font-bold shadow-soft flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Đang xem chi nhánh tại {selectedStore?.province || 'Việt Nam'}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
          border: 2px solid white;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #005a31;
        }
        .shadow-soft {
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
        }
        .shadow-premium {
          box-shadow: 0 20px 50px -20px rgba(0,0,0,0.08);
        }
      `}</style>
    </div>
  );
}
