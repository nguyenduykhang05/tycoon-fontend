import React, { useState, useEffect } from 'react';
import { ShieldCheck, ClipboardList, Search, FileText, Package } from 'lucide-react';

interface Product {
  id: number;
  name: string;
}

export default function WarrantyPage() {
  const [activeTab, setActiveTab] = useState('activate');

  const tabs = [
    { id: 'activate', label: 'Kích hoạt bảo hành', icon: ShieldCheck },
    { id: 'request', label: 'Yêu cầu bảo hành', icon: ClipboardList },
    { id: 'lookup', label: 'Tra cứu bảo hành', icon: Search },
    { id: 'policy', label: 'Chính sách bảo hành', icon: FileText },
  ];

  const [products, setProducts] = useState<Product[]>([]);

  // Activate warranty state
  const [phone, setPhone] = useState('');
  const [productId, setProductId] = useState('');
  const [serialNumbers, setSerialNumbers] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Warranty request state (tab 'request')
  const [reqPhone, setReqPhone] = useState('');
  const [reqProductId, setReqProductId] = useState('');
  const [reqSerial, setReqSerial] = useState('');
  const [reqNotes, setReqNotes] = useState('');
  const [reqSubmitting, setReqSubmitting] = useState(false);

  // Lookup state
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupResults, setLookupResults] = useState<any[] | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.data.map((p: any) => ({ id: p.id, name: p.name })));
      })
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !productId) { alert('Vui lòng nhập số điện thoại và chọn sản phẩm.'); return; }
    setIsSubmitting(true);
    fetch('/api/warranties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, product_id: parseInt(productId), serial_numbers: serialNumbers, notes })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Kích hoạt bảo hành thành công!');
          setPhone(''); setProductId(''); setSerialNumbers(''); setNotes('');
        } else { alert('Có lỗi: ' + data.message); }
      })
      .catch(() => alert('Lỗi kết nối máy chủ.'))
      .finally(() => setIsSubmitting(false));
  };

  const handleWarrantyRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqPhone || !reqProductId) { alert('Vui lòng nhập SĐT và chọn sản phẩm.'); return; }
    setReqSubmitting(true);
    fetch('/api/warranties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: reqPhone, product_id: parseInt(reqProductId), serial_numbers: reqSerial, notes: reqNotes })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Gửi yêu cầu bảo hành thành công! Chúng tôi sẽ liên hệ trong vòng 24h.');
          setReqPhone(''); setReqProductId(''); setReqSerial(''); setReqNotes('');
        } else { alert('Có lỗi: ' + data.message); }
      })
      .catch(() => alert('Lỗi kết nối máy chủ.'))
      .finally(() => setReqSubmitting(false));
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone) return;
    setLookupLoading(true); setLookupResults(null);
    try {
      const res = await fetch(`/api/warranties/lookup?phone=${encodeURIComponent(lookupPhone)}`);
      const data = await res.json();
      if (data.success) setLookupResults(data.data);
      else alert(data.message);
    } catch { alert('Lỗi kết nối'); }
    finally { setLookupLoading(false); }
  };

  const formInput = 'w-full border border-gray-200 bg-gray-50 rounded-full py-3 px-5 text-[14px] focus:outline-none focus:border-[#005a31] transition-soft';
  const formLabel = 'block text-[14px] font-bold text-gray-700 mb-2 ml-4';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-[2rem] shadow-soft border border-gray-100 p-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-8 overflow-x-auto gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-bold text-[14px] border-b-2 transition-soft whitespace-nowrap ${activeTab === tab.id
                ? 'border-[#005a31] text-[#005a31] bg-emerald-50/50 rounded-t-2xl'
                : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              <tab.icon size={18} />{tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Kích hoạt bảo hành ── */}
        {activeTab === 'activate' && (
          <form className="space-y-6 max-w-2xl" onSubmit={handleActivate}>
            <div className="bg-orange-50 text-orange-800 p-5 rounded-2xl text-[14px] border border-orange-100 font-medium">
              Mọi thắc mắc về bảo hành vui lòng liên hệ hotline <strong className="text-[#ff6b00]">1800.8115</strong> để được hỗ trợ.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={formLabel}>Số điện thoại mua hàng *</label>
                <input required type="text" value={phone} onChange={e => setPhone(e.target.value)} className={formInput} placeholder="Nhập số điện thoại" />
              </div>
              <div>
                <label className={formLabel}>Sản phẩm cần kích hoạt *</label>
                <select required value={productId} onChange={e => setProductId(e.target.value)} className={formInput}>
                  <option value="">Vui lòng chọn sản phẩm</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={formLabel}>Số Serial / Mã đơn hàng</label>
                <input type="text" value={serialNumbers} onChange={e => setSerialNumbers(e.target.value)} className={formInput} placeholder="Nhập số serial (nếu có)" />
              </div>
              <div className="col-span-2">
                <label className={formLabel}>Ghi chú</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border border-gray-200 bg-gray-50 rounded-[1.5rem] py-4 px-5 text-[14px] focus:outline-none focus:border-[#005a31] transition-soft" rows={3} placeholder="Mô tả ngắn gọn tình trạng sản phẩm" />
              </div>
            </div>
            <div className="text-center pt-4">
              <button disabled={isSubmitting} type="submit"
                className={`bg-[#005a31] text-white font-black px-12 py-3.5 rounded-full shadow-soft transition-soft uppercase tracking-wide ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-800'}`}>
                {isSubmitting ? 'Đang gửi...' : 'Kích hoạt bảo hành'}
              </button>
            </div>
          </form>
        )}

        {/* ── Tab: Yêu cầu bảo hành ── */}
        {activeTab === 'request' && (
          <form className="space-y-6 max-w-2xl" onSubmit={handleWarrantyRequest}>
            <div className="bg-blue-50 text-blue-800 p-5 rounded-2xl text-[14px] border border-blue-100 font-medium">
              Vui lòng điền đầy đủ thông tin. Nhân viên sẽ liên hệ trong vòng <strong>24 giờ làm việc</strong>.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={formLabel}>Số điện thoại liên hệ *</label>
                <input required type="text" value={reqPhone} onChange={e => setReqPhone(e.target.value)} className={formInput} placeholder="Nhập số điện thoại" />
              </div>
              <div>
                <label className={formLabel}>Sản phẩm cần bảo hành *</label>
                <select required value={reqProductId} onChange={e => setReqProductId(e.target.value)} className={formInput}>
                  <option value="">Vui lòng chọn sản phẩm</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={formLabel}>Số Serial sản phẩm</label>
                <input type="text" value={reqSerial} onChange={e => setReqSerial(e.target.value)} className={formInput} placeholder="Nhập số serial (nếu có)" />
              </div>
              <div className="col-span-2">
                <label className={formLabel}>Mô tả lỗi / vấn đề *</label>
                <textarea required value={reqNotes} onChange={e => setReqNotes(e.target.value)} className="w-full border border-gray-200 bg-gray-50 rounded-[1.5rem] py-4 px-5 text-[14px] focus:outline-none focus:border-[#005a31] transition-soft" rows={4} placeholder="Mô tả chi tiết vấn đề bạn gặp phải với sản phẩm..." />
              </div>
            </div>
            <div className="text-center pt-4">
              <button disabled={reqSubmitting} type="submit"
                className={`bg-[#ff6b00] text-white font-black px-12 py-3.5 rounded-full shadow-soft transition-soft uppercase tracking-wide ${reqSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'}`}>
                {reqSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu bảo hành'}
              </button>
            </div>
          </form>
        )}

        {/* ── Tab: Tra cứu bảo hành ── */}
        {activeTab === 'lookup' && (
          <div className="max-w-xl">
            <form onSubmit={handleLookup} className="flex gap-3 mb-10">
              <input
                type="text" required placeholder="Nhập số điện thoại đã mua hàng..."
                value={lookupPhone} onChange={e => setLookupPhone(e.target.value)}
                className="flex-grow border border-gray-200 bg-gray-50 rounded-full px-6 py-4 text-[14px] focus:outline-none focus:border-[#005a31] shadow-inner transition-soft"
              />
              <button type="submit" disabled={lookupLoading}
                className="bg-[#005a31] text-white px-8 py-4 rounded-full font-bold hover:bg-emerald-800 shadow-soft transition-soft disabled:opacity-60 flex items-center gap-2">
                <Search size={18} /> {lookupLoading ? 'Đang tìm...' : 'Tra cứu'}
              </button>
            </form>

            {lookupLoading && (
              <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-[#005a31] border-t-transparent rounded-full animate-spin"></div></div>
            )}

            {lookupResults !== null && (
              lookupResults.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <ShieldCheck size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-[15px]">Không tìm thấy bảo hành nào cho số điện thoại này</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[14px] font-bold text-gray-600">Tìm thấy {lookupResults.length} kết quả cho SĐT <span className="text-[#005a31]">{lookupPhone}</span></p>
                  {lookupResults.map(w => (
                    <div key={w.id} className="border border-gray-100 rounded-[1.5rem] p-5 flex gap-5 items-start bg-gray-50/50 hover:shadow-soft transition-soft">
                      {w.image_url && (
                        <img src={w.image_url} alt={w.product_name} className="w-20 h-20 object-contain rounded-2xl bg-white border border-gray-100 p-2 flex-shrink-0 shadow-sm" />
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 mb-1 text-base">{w.product_name || 'Sản phẩm không xác định'}</p>
                        {w.serial_numbers && <p className="text-[13px] text-gray-500 mb-1">Serial: {w.serial_numbers}</p>}
                        <p className="text-[12px] text-gray-400">Ngày kích hoạt: {w.created_at ? new Date(w.created_at).toLocaleDateString('vi-VN') : 'N/A'}</p>
                        {w.notes && <p className="text-[13px] text-gray-500 mt-2 italic border-t pt-2 border-gray-100">Ghi chú: {w.notes}</p>}
                      </div>
                      <span className="bg-emerald-100 text-[#005a31] text-[11px] font-black uppercase px-4 py-1.5 rounded-full flex-shrink-0 border border-emerald-200">
                        Còn hiệu lực
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* ── Tab: Chính sách bảo hành ── */}
        {activeTab === 'policy' && (
          <div className="space-y-6 text-[14px] text-gray-700 max-w-3xl">
            <h3 className="text-[20px] font-bold text-[#005a31]">CHÍNH SÁCH BẢO HÀNH TYCOON</h3>
            <p>Tycoon cam kết mang đến cho khách hàng những sản phẩm chính hãng với chất lượng tốt nhất. Dưới đây là chính sách bảo hành áp dụng cho các sản phẩm tại hệ thống của chúng tôi.</p>
            <div className="space-y-6">
              {[
                { title: '1. Thời gian bảo hành', content: 'Tùy thuộc vào từng loại sản phẩm và thương hiệu, thời gian bảo hành sẽ khác nhau. Thông tin chi tiết được ghi rõ trên phiếu bảo hành đi kèm sản phẩm.' },
                { title: '2. Điều kiện bảo hành', content: null, list: ['Sản phẩm còn trong thời hạn bảo hành.', 'Sản phẩm bị lỗi kỹ thuật do nhà sản xuất.', 'Có phiếu bảo hành hoặc thông tin mua hàng hợp lệ tại Tycoon.', 'Sản phẩm không thuộc các trường hợp từ chối bảo hành.'] },
                { title: '3. Trường hợp từ chối bảo hành', content: null, list: ['Sản phẩm đã hết thời hạn bảo hành.', 'Sản phẩm bị hư hỏng do lỗi người sử dụng (rơi vỡ, vào nước, sử dụng sai hướng dẫn).', 'Sản phẩm đã bị can thiệp, sửa chữa bởi bên thứ ba không được ủy quyền.', 'Mất phiếu bảo hành hoặc thông tin mua hàng không khớp.'] },
              ].map(section => (
                <div key={section.title} className="bg-gray-50 rounded-[1.5rem] p-6 border border-gray-100">
                  <h4 className="font-bold text-[#005a31] mb-4 text-base">{section.title}</h4>
                  {section.content && <p className="leading-relaxed">{section.content}</p>}
                  {section.list && <ul className="list-disc pl-6 space-y-2">{section.list.map((item, i) => <li key={i}>{item}</li>)}</ul>}
                </div>
              ))}
            </div>
            <p className="font-bold bg-emerald-50 p-6 rounded-[1.5rem] border border-emerald-100 text-[#005a31] flex items-center justify-between">
              <span>📞 Mọi thắc mắc vui lòng liên hệ Hotline: <span className="underline decoration-2 underline-offset-4">1800.8115</span></span>
              <span className="text-[12px] opacity-60 uppercase tracking-widest">Tycoon Care Center</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
