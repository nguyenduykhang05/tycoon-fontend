import React, { useState, useEffect } from 'react';
import { ChevronRight, Bolt, MapPin, CheckCircle2, Star, ThumbsUp, HelpCircle, User, Truck, ShieldCheck, RefreshCw, Send, MessageSquare } from 'lucide-react';

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
  brand_name: string;
  joined_brand_name?: string;
  joined_brand_logo?: string;
  joined_brand_origin?: string;
  capacities?: string; // JSON string
}

interface Review {
  id: number;
  full_name: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  image_urls?: string; // Pipe separated URLs
  created_at: string;
}

interface QA {
  id: number;
  question: string;
  answer: string;
  asker: string;
  staff_name?: string;
  created_at: string;
}

interface ProductDetailPageProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow?: (product: Product, quantity: number) => void;
  onBack: () => void;
  user?: any;
}

export default function ProductDetailPage({ product, onAddToCart, onBuyNow, onBack, user }: ProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'ingredients' | 'guide' | 'reviews' | 'qa'>('specs');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [qas, setQas] = useState<QA[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [selectedCapacityIndex, setSelectedCapacityIndex] = useState(0);
  const [deliveryTimeLeft, setDeliveryTimeLeft] = useState({ hours: 0, minutes: 0 });

  // Delivery Countdown Logic
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(18, 0, 0, 0); // 6:00 PM cutoff for 2H delivery

      if (now > cutoff) {
        cutoff.setDate(cutoff.getDate() + 1);
        cutoff.setHours(9, 0, 0, 0); // Reset to 9 AM tomorrow if late
      }

      const diff = cutoff.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setDeliveryTimeLeft({ hours: h, minutes: m });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  // Mock Rating Distribution based on avg rating
  const ratingDistribution = React.useMemo(() => {
    const total = (product as any).review_count || 119;
    const avg = (product as any).avg_rating || 5.0;
    
    // Simple heuristic to distribute ratings
    const dist = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 stars
    if (avg >= 4.8) {
      dist[0] = Math.floor(total * 0.9);
      dist[1] = Math.ceil(total * 0.1);
    } else {
      dist[0] = Math.floor(total * 0.7);
      dist[1] = Math.floor(total * 0.2);
      dist[2] = Math.ceil(total * 0.1);
    }
    return dist;
  }, [product]);

  const capacitiesArr = React.useMemo(() => {
    try {
      return product.capacities ? JSON.parse(product.capacities) : [];
    } catch (e) {
      return [];
    }
  }, [product.capacities]);

  const currentPrice = React.useMemo(() => {
    if (capacitiesArr.length > 0 && capacitiesArr[selectedCapacityIndex]) {
      return product.price + (capacitiesArr[selectedCapacityIndex].priceDelta || 0);
    }
    return product.price;
  }, [product.price, capacitiesArr, selectedCapacityIndex]);

  const currentProductWithVariant = { ...product, price: currentPrice, name: capacitiesArr.length > 0 ? `${product.name} (${capacitiesArr[selectedCapacityIndex].label})` : product.name };

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetch(`/api/reviews?product_id=${product.id}`)
        .then(res => res.json())
        .then(res => setReviews(res.data || []));
    } else if (activeTab === 'qa') {
      fetch(`/api/qa/${product.id}`)
        .then(res => res.json())
        .then(res => setQas(res.data || []));
    }
  }, [activeTab, product.id]);

  const handleAsk = async () => {
    if (!newQuestion.trim() || !user) return;
    try {
        const res = await fetch('/api/qa/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, product_id: product.id, question: newQuestion })
        });
        if (res.ok) {
            setNewQuestion('');
            // Refresh Q&A
            fetch(`/api/qa/${product.id}`).then(r => r.json()).then(r => setQas(r.data || []));
        }
    } catch (e) { console.error(e); }
  };

  const percent = product.discount_percent || Math.round((1 - product.price / product.original_price) * 100);

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-10">
      {/* Sticky Product Header (Hasaki style) */}
      <div className={`bg-white border-b shadow-md sticky top-[120px] z-40 transition-all duration-300 transform ${showStickyHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4 overflow-hidden">
                  <img src={product.image_url} alt={product.name} className="w-10 h-10 object-contain flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                      <h4 className="font-bold text-[13px] text-gray-800 truncate" title={product.name}>{product.name}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[#ff6b00] font-black text-[15px]">{currentPrice.toLocaleString('vi-VN')} đ</span>
                        {product.original_price > currentPrice && (
                          <span className="text-gray-400 text-[11px] line-through">{product.original_price.toLocaleString('vi-VN')} đ</span>
                        )}
                      </div>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center border border-gray-200 rounded-full h-9 px-1">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors">-</button>
                      <span className="w-8 text-center text-[13px] font-bold">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors">+</button>
                  </div>
                  <button 
                    onClick={() => {
                        if (onBuyNow) {
                            onBuyNow(currentProductWithVariant, quantity);
                        } else {
                            onAddToCart(currentProductWithVariant, quantity);
                        }
                    }}
                    className="bg-[#ff6b00] text-white px-8 h-10 rounded-full font-black text-[13px] uppercase hover:bg-orange-600 transition-colors shadow-soft"
                  >
                    MUA NGAY
                  </button>
              </div>
          </div>
      </div>

      <div className="container mx-auto px-4 mt-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-4 font-medium">
          <span onClick={onBack} className="cursor-pointer hover:text-[#005a31]">Trang chủ</span>
          <ChevronRight size={14} />
          <span className="cursor-pointer hover:text-[#005a31]">{product.category_name || 'Sản phẩm'}</span>
          <ChevronRight size={14} />
          <strong className="text-gray-800 font-bold truncate max-w-[400px]" title={product.name}>{product.name}</strong>
        </div>

        <div className="grid grid-cols-12 gap-5 mt-2">
          
          {/* CỘT TRÁI - Hình Ảnh (Col span 4) */}
          <div className="col-span-4 flex flex-col gap-3">
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-soft relative group overflow-hidden">
                {product.is_flash_deal && (
                    <div className="absolute top-2 right-2 bg-[#ff6b00] text-white text-[12px] font-bold px-2.5 py-1 rounded shadow z-10">
                        -{percent}%
                    </div>
                )}
                {/* Freeship Icon Fake */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-[#005a31] to-[#009250] text-white text-[10px] font-bold px-3 py-1.5 flex items-center gap-1 shadow-sm rounded-br-3xl rounded-tl-[2rem] z-10 italic">
                    <Bolt size={12} className="fill-current" /> 2H MIỄN PHÍ
                </div>

                <div className="aspect-[4/5] flex items-center justify-center p-4">
                  <img src={product.image_url} alt={product.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                </div>
            </div>

            {/* Thumbnail Gallery (Mock) */}
            <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((_, index) => (
                   <div key={index} className={`w-[65px] h-[65px] bg-white rounded-xl border cursor-pointer flex items-center justify-center hover:border-[#005a31] transition-soft p-1.5 ${index === 0 ? 'border-[#005a31] border-2 shadow-sm' : 'border-gray-200'}`}>
                       <img src={product.image_url} className="max-w-full max-h-full object-contain opacity-80 hover:opacity-100" />
                   </div>
                ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 text-[13px] text-gray-600">
                <button className="flex items-center gap-1.5 hover:text-[#005a31]"><ThumbsUp size={16} /> Thích (124)</button>
                <button className="flex items-center gap-1.5 hover:text-[#005a31]">Chia sẻ</button>
            </div>
          </div>

          {/* CỘT GIỮA - Thông Tin Chính (Col span 5) */}
          <div className="col-span-5 flex flex-col">
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-soft h-full">
                {/* Thương hiệu */}
                <h3 className="text-[#005a31] font-bold text-[14px] uppercase flex items-center gap-2 mb-2">
                   {(product.joined_brand_logo) && <img src={product.joined_brand_logo} alt={product.joined_brand_name || product.brand_name} className="w-8 h-8 object-contain rounded-full border border-gray-100" />}
                   {product.joined_brand_name || product.brand_name || 'Thương hiệu'}
                   <span className="bg-[#005a31] text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 tracking-wider">
                       <CheckCircle2 size={10} /> PHÂN PHỐI CHÍNH HÃNG
                   </span>
                </h3>

                {/* Tên SP */}
                <h1 className="text-[20px] font-medium text-gray-800 leading-snug mb-3">
                    {product.name}
                </h1>

                {/* Meta stats */}
                <div className="flex items-center gap-4 text-[13px] text-gray-600 mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                        <span className="text-[#ff6b00] font-bold text-[16px]">{(product as any).avg_rating || '5.0'}</span>
                        <div className="flex text-[#ff6b00]">
                            <Star size={14} className="fill-current" />
                            <Star size={14} className="fill-current" />
                            <Star size={14} className="fill-current" />
                            <Star size={14} className="fill-current" />
                            <Star size={14} className="fill-current opacity-50" />
                        </div>
                    </div>
                    <span className="w-[1px] h-3 bg-gray-200"></span>
                    <span>{(product as any).review_count || 119} đánh giá</span>
                    <span className="w-[1px] h-3 bg-gray-300"></span>
                    <span>650 Hỏi đáp</span>
                    <span className="w-[1px] h-3 bg-gray-300"></span>
                    <span>Mã SP: {product.id.toString().padStart(6, '253900')}</span>
                </div>

                {/* FLASH DEAL Banner nếu có */}
                {product.is_flash_deal && (
                    <div className="bg-gradient-to-r from-[#ff6b00] to-[#ff4d00] rounded-2xl overflow-hidden flex items-center justify-between px-5 py-2.5 mb-5 text-white shadow-soft">
                        <div className="flex items-center gap-2 font-black italic text-[16px]">
                            <Bolt size={18} className="fill-current" /> FLASH DEAL
                        </div>
                        <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-tight">
                            Kết thúc trong 
                            <span className="bg-black/20 px-2 py-1 rounded-lg">00</span> :
                            <span className="bg-black/20 px-2 py-1 rounded-lg">15</span> :
                            <span className="bg-black/20 px-2 py-1 rounded-lg">42</span>
                        </div>
                    </div>
                )}

                {/* Khu vực Giá */}
                <div className="mb-5">
                    <div className="flex items-end gap-3 mb-1">
                        <span className="text-[#ff6b00] font-bold text-[28px] leading-none">{currentPrice.toLocaleString('vi-VN')} đ</span>
                        <span className="text-[12px] text-gray-500 mb-1">(Đã bao gồm VAT)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px]">
                        <span className="text-gray-500">Giá thị trường: <span className="line-through">{product.original_price.toLocaleString('vi-VN')} đ</span></span>
                        <span className="text-gray-800 font-medium">
                            - Tiết kiệm: <span className="font-bold text-[#ff6b00]">{(product.original_price - currentPrice).toLocaleString('vi-VN')} đ ({Math.round((1 - currentPrice / product.original_price) * 100)}%)</span>
                        </span>
                    </div>
                </div>

                {/* Dung Tích / Tuỳ chọn */}
                {capacitiesArr.length > 0 && (
                  <div className="mb-6">
                      <p className="text-[14px] font-medium text-gray-800 mb-2">Dung Tích: <span className="font-bold">{capacitiesArr[selectedCapacityIndex].label}</span></p>
                      <div className="flex gap-2">
                          {capacitiesArr.map((cap: any, index: number) => (
                            <button 
                              key={index}
                              onClick={() => setSelectedCapacityIndex(index)}
                              className={`rounded px-4 py-1.5 text-[14px] transition-all ${selectedCapacityIndex === index ? 'border-2 border-[#ff6b00] font-bold text-[#ff6b00] bg-orange-50' : 'border border-gray-300 hover:border-[#005a31] text-gray-600'}`}
                            >
                              {cap.label}
                            </button>
                          ))}
                      </div>
                  </div>
                )}

                {/* Hành động (Mua hàng) */}
                <div className="space-y-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[14px] font-medium text-gray-700">Số lượng:</span>
                            <div className="flex items-center border border-gray-200 bg-gray-50 rounded-full overflow-hidden h-[40px] px-1 shadow-inner">
                                <button className="w-9 flex items-center justify-center hover:bg-white rounded-full text-gray-600 transition-soft font-bold" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <input type="text" className="w-12 text-center text-[15px] font-bold bg-transparent focus:outline-none" value={quantity} readOnly />
                                <button className="w-9 flex items-center justify-center hover:bg-white rounded-full text-gray-600 transition-soft font-bold" onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button 
                          className="flex-1 bg-[#005a31] text-white rounded-full flex flex-col items-center justify-center py-3.5 font-bold hover:bg-emerald-800 transition-soft shadow-soft"
                          onClick={() => {
                              onAddToCart(currentProductWithVariant, quantity);
                          }}
                        >
                            <span className="text-[15px] uppercase flex items-center gap-1.5"><ShoppingCartIcon size={18} /> THÊM VÀO GIỎ HÀNG</span>
                        </button>
                        <button 
                          className="flex-1 bg-[#ff6b00] text-white rounded-full flex flex-col items-center justify-center py-3 font-bold hover:opacity-90 transition-soft shadow-soft relative overflow-hidden group"
                          onClick={() => {
                            if (onBuyNow) {
                                onBuyNow(currentProductWithVariant, quantity);
                            } else {
                                onAddToCart(currentProductWithVariant, quantity);
                                alert("Đã thêm vào giỏ hàng. Vui lòng kiểm tra giỏ hàng để thanh toán.");
                            }
                          }}
                        >
                           <div className="absolute inset-0 bg-white/20 w-1/4 skew-x-12 -translate-x-full group-hover:translate-x-[400%] transition-transform duration-700 ease-in-out"></div>
                           <span className="text-[15px] uppercase">MUA NGAY NOWFREE 2H</span>
                           <span className="text-[11px] font-normal">Trễ tặng 100k</span>
                        </button>
                    </div>
                </div>
            </div>
          </div>

          {/* CỘT PHẢI - Box Vận Chuyển & Cross-Sell (Col span 3) */}
          <div className="col-span-3 space-y-4">
             
             {/* Box Miễn phí vận chuyển */}
             <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-soft">
                 <h4 className="flex items-center justify-center gap-2 text-[#005a31] font-bold text-[13px] uppercase mb-4 tracking-wider">
                     <span className="w-4 h-[1px] bg-[#005a31]"></span> MIỄN PHÍ VẬN CHUYỂN <span className="w-4 h-[1px] bg-[#005a31]"></span>
                 </h4>

                 <ul className="space-y-4 text-[13px] text-gray-800">
                     <li className="flex gap-3 items-start">
                         <div className="bg-emerald-50 text-[#005a31] p-1.5 rounded-full mt-0.5">
                             <Truck size={20} />
                         </div>
                         <div className="flex-1">
                             <p className="font-bold leading-tight text-[13px]">Giao Nhanh Miễn Phí 2H</p>
                             <div className="mt-1 flex items-center gap-1.5 bg-orange-50 text-[#ff6b00] px-2 py-1 rounded text-[11px] font-bold border border-orange-100 animate-pulse">
                                 <Bolt size={12} className="fill-current" />
                                 Đặt trong {deliveryTimeLeft.hours}h {deliveryTimeLeft.minutes}p để nhận ngay hôm nay!
                             </div>
                         </div>
                     </li>
                     <li className="flex gap-3 items-start">
                         <div className="bg-emerald-50 text-[#005a31] p-1.5 rounded-full mt-0.5">
                             <ShieldCheck size={20} />
                         </div>
                         <div>
                             <p className="font-medium">Tycoon đền bù <strong className="text-[#005a31]">100% hàng</strong> nếu phát hiện hàng giả</p>
                         </div>
                     </li>
                     <li className="flex gap-3 items-start">
                         <div className="bg-emerald-50 text-[#005a31] p-1.5 rounded-full mt-0.5">
                             <MapPin size={20} />
                         </div>
                         <div>
                             <p className="font-medium"><strong className="text-[#005a31]">Giao Hàng Miễn Phí</strong> (từ 90K tại 60 Tỉnh Thành trừ huyện, toàn Quốc từ 249K)</p>
                         </div>
                     </li>
                     <li className="flex gap-3 items-start">
                         <div className="bg-emerald-50 text-[#005a31] p-1.5 rounded-full mt-0.5">
                             <RefreshCw size={20} />
                         </div>
                         <div>
                             <p className="font-medium">Đổi trả<br/><strong className="text-[#005a31]">trong 30 ngày</strong></p>
                         </div>
                     </li>
                 </ul>
                 <div className="mt-4 text-center">
                     <button className="text-[12px] text-gray-500 hover:text-[#005a31] underline">Xem thêm</button>
                 </div>
             </div>

             {/* Box Cross-Sell Clinic */}
             <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-soft hover:shadow-lg transition-soft cursor-pointer">
                 <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=200&fit=crop" className="w-full h-32 object-cover" />
                 <div className="p-4">
                     <h4 className="text-[#005a31] font-bold text-[14px] uppercase mb-1">Tycoon Clinic & Spa</h4>
                     <p className="text-[12px] text-gray-600 line-clamp-2 mb-2">Trải nghiệm dịch vụ chăm sóc da chuyên sâu cùng đội ngũ bác sĩ hàng đầu.</p>
                     <span className="text-[#ff6b00] font-bold text-[14px]">Đặt lịch ngay - Giảm 50%</span>
                 </div>
             </div>

          </div>
        </div>

        {/* Tabs & Full Description Area */}
        <div className="grid grid-cols-12 gap-5 mt-6">
            
            {/* Nội dung chi tiết - 9 cột */}
             <div className="col-span-9 bg-white rounded-[2rem] shadow-soft border border-gray-100 overflow-hidden">
                {/* Sticky Header Nav */}
                <div className="flex border-b border-gray-200 sticky top-[120px] bg-white z-30">
                    {[
                        { id: 'desc', label: 'Mô tả' },
                        { id: 'specs', label: 'Thông số' },
                        { id: 'ingredients', label: 'Thành phần' },
                        { id: 'guide', label: 'HDSD' },
                        { id: 'reviews', label: 'Đánh giá', highlight: true },
                        { id: 'qa', label: 'Hỏi đáp' },
                    ].map(tab => (
                        <button 
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id as any)}
                           className={`flex-1 py-4 text-[15px] font-medium text-center uppercase transition-all relative
                           ${activeTab === tab.id ? 'text-[#ff6b00] font-bold bg-orange-50/50' : 'text-gray-600 hover:text-[#005a31] bg-white'}`}
                        >
                            {tab.label}
                            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#ff6b00]"></div>}
                        </button>
                    ))}
                </div>

                <div className="p-6 min-h-[500px]">
                    {activeTab === 'desc' && (
                        <div className="text-[14px] text-gray-800 leading-relaxed font-normal">
                             <h4 className="font-bold mb-2 text-[15px]">{product.name}</h4>
                             <p className="mb-4">Đây là sản phẩm {product.category_name.toLowerCase()} uy tín đến từ thương hiệu <strong>{product.joined_brand_name || product.brand_name || 'Tycoon'}</strong>, phân phối chính hãng 100%. Được thiết kế với công thức đặc biệt nhằm bảo vệ và tái tạo làn da, đây là giải pháp tối ưu cho trải nghiệm làm đẹp của bạn.</p>
                             <img src={product.image_url} alt="Promo" className="w-[80%] mx-auto my-6 rounded-lg object-contain bg-gray-50 p-4 border border-gray-100" />
                             <p>Sản phẩm đã có mặt tại hệ thống mua sắm làm đẹp <strong>Tycoon.vn</strong> toàn quốc.</p>
                        </div>
                    )}

                    {activeTab === 'specs' && (
                        <div className="w-full">
                            <h3 className="font-bold text-[18px] mb-4 text-[#005a31]">Thông số sản phẩm</h3>
                            <table className="w-full text-left text-[14px] border-collapse">
                                <tbody>
                                    <tr className="border-b border-t border-gray-200">
                                        <td className="py-3 px-4 bg-gray-50/50 w-1/3 font-medium text-gray-700">Thương Hiệu</td>
                                        <td className="py-3 px-4 text-gray-900 font-medium">{product.joined_brand_name || product.brand_name || 'Đang cập nhật'}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-3 px-4 bg-gray-50/50 font-medium text-gray-700">Xuất xứ thương hiệu</td>
                                        <td className="py-3 px-4 text-gray-900">{product.joined_brand_origin || 'Pháp'}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-3 px-4 bg-gray-50/50 font-medium text-gray-700">Loại da</td>
                                        <td className="py-3 px-4 text-gray-900">Mọi loại da, Da nhạy cảm</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-3 px-4 bg-gray-50/50 font-medium text-gray-700">Dung Tích</td>
                                        <td className="py-3 px-4 text-gray-900">{capacitiesArr.length > 0 ? capacitiesArr[selectedCapacityIndex].label : 'Đang cập nhật'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                         <div className="">
                             <h3 className="font-bold text-[18px] mb-4 text-[#005a31]">Đánh giá ({reviews.length})</h3>
                             
                             <div className="bg-[#fffcf8] border border-orange-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8 mb-8">
                                 <div className="text-center md:border-r border-orange-100 md:pr-8">
                                     <div className="text-[#ff6b00] text-[48px] font-black leading-none mb-1">{(product as any).avg_rating || '5.0'}</div>
                                     <div className="flex justify-center text-[#ff6b00] mb-2 scale-110">
                                        <Star size={18} className="fill-current" />
                                        <Star size={18} className="fill-current" />
                                        <Star size={18} className="fill-current" />
                                        <Star size={18} className="fill-current" />
                                        <Star size={18} className="fill-current" />
                                     </div>
                                     <div className="text-[13px] text-gray-500 font-medium">{(product as any).review_count || 119} đánh giá</div>
                                 </div>
                                 
                                 <div className="flex-grow space-y-2 w-full max-w-sm">
                                     {[5, 4, 3, 2, 1].map((star, idx) => (
                                         <div key={star} className="flex items-center gap-3">
                                             <div className="flex items-center gap-1 w-6 text-[12px] font-bold text-gray-600">
                                                 {star} <Star size={10} className="fill-current text-gray-300" />
                                             </div>
                                             <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                                                 <div 
                                                     className="h-full bg-[#ff6b00] rounded-full" 
                                                     style={{ width: `${(ratingDistribution[idx] / ((product as any).review_count || 119)) * 100}%` }}
                                                 ></div>
                                             </div>
                                             <div className="w-10 text-[11px] text-gray-400 font-medium">
                                                 {Math.round((ratingDistribution[idx] / ((product as any).review_count || 119)) * 100)}%
                                             </div>
                                         </div>
                                     ))}
                                 </div>

                                 <div className="md:pl-8 text-center flex flex-col gap-3">
                                     <p className="text-[13px] text-gray-600 font-medium leading-relaxed">Chia sẻ nhận xét của bạn về sản phẩm khách nhé!</p>
                                     <button 
                                        onClick={() => setIsSubmittingReview(true)}
                                        className="bg-[#005a31] text-white rounded-full font-bold px-8 py-3 hover:bg-emerald-800 transition-all shadow-soft uppercase text-[13px]"
                                     >
                                         Viết đánh giá
                                     </button>
                                 </div>
                             </div>

                             {reviews.length === 0 ? (
                                 <p className="text-center py-10 text-gray-500 italic">Chưa có đánh giá nào cho sản phẩm này.</p>
                             ) : (
                                 reviews.map(rev => (
                                     <div key={rev.id} className="border-b border-gray-100 pb-5 mb-5 last:border-0">
                                         <div className="flex gap-2 items-center mb-2">
                                             <h5 className="font-bold text-[14px]">{rev.full_name}</h5>
                                             {rev.is_verified_purchase && (
                                                 <span className="text-[#005a31] text-[12px] flex items-center gap-1 font-medium bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle2 size={12}/> Đã mua hàng</span>
                                             )}
                                         </div>
                                         <div className="flex items-center gap-2 mb-2">
                                             <div className="bg-[#ff6b00] text-white text-[11px] font-bold px-1.5 rounded-sm flex items-center">
                                                 {rev.rating} <Star size={10} className="fill-current" />
                                             </div>
                                             <span className="text-[12px] text-gray-400">| {new Date(rev.created_at).toLocaleDateString()}</span>
                                         </div>
                                         <p className="text-[14px] text-gray-800 mb-3">{rev.comment}</p>
                                         {rev.image_urls && (
                                           <div className="flex gap-2 overflow-x-auto pb-2">
                                              {rev.image_urls.split('||').map((url, idx) => (
                                                <img key={idx} src={url} className="w-20 h-20 object-cover rounded-lg border border-gray-100 shadow-sm" alt="Review image" />
                                              ))}
                                           </div>
                                         )}
                                     </div>
                                 ))
                             )}
                         </div>
                    )}

                    {activeTab === 'qa' && (
                        <div className="">
                            <h3 className="font-bold text-[18px] mb-4 text-[#005a31]">Hỏi đáp ({qas.length})</h3>
                            
                            <div className="mb-8 flex gap-3">
                                <input 
                                    type="text" 
                                    placeholder="Đặt câu hỏi về sản phẩm khách nhé..."
                                    className="flex-1 border border-gray-200 rounded-full px-5 py-2.5 focus:border-[#005a31] focus:ring-1 focus:ring-emerald-200 outline-none text-[14px] shadow-inner"
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                />
                                <button 
                                    onClick={handleAsk}
                                    className="bg-[#005a31] text-white px-6 py-2.5 rounded-full font-bold text-[13px] hover:bg-emerald-800 transition-soft flex items-center gap-2"
                                >
                                    <Send size={14} /> GỬI CÂU HỎI
                                </button>
                            </div>

                            <div className="space-y-6">
                                {qas.length === 0 ? (
                                    <p className="text-gray-500 italic text-center py-6">Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!</p>
                                ) : (
                                    qas.map(qa => (
                                        <div key={qa.id} className="border-b border-gray-100 pb-6">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                                                    <HelpCircle size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-[14px] mb-1">{qa.question}</p>
                                                    <p className="text-[12px] text-gray-500">Bởi <strong>{qa.asker}</strong> • {new Date(qa.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            {qa.answer && (
                                                <div className="ml-11 bg-emerald-50/50 p-4 rounded-2xl relative border border-emerald-100">
                                                    <div className="absolute top-0 left-4 w-3 h-3 bg-emerald-50/50 border-t border-l border-emerald-100 rotate-45 transform -translate-y-1/2"></div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MessageSquare size={14} className="text-[#005a31]" />
                                                        <span className="text-[#005a31] text-[12px] font-bold uppercase">Trả lời bởi {qa.staff_name || 'Admin'}</span>
                                                    </div>
                                                    <p className="text-[14px] text-gray-700 leading-relaxed">{qa.answer}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'ingredients' && (
                        <div className="w-full">
                            <h3 className="font-bold text-[18px] mb-4 text-[#005a31]">Thành phần nổi bật</h3>
                            <p className="text-[14px] leading-relaxed text-gray-700">
                               - <strong>Niacinamide (Vitamin B3)</strong>: Làm sáng da, mờ thâm nám và thu nhỏ lỗ chân lông.<br/>
                               - <strong>Glycerin & Panthenol (B5)</strong>: Cấp ẩm, phục hồi hàng rào bảo vệ da.<br/>
                               - <strong>Peptide Complex</strong>: Giúp da săn chắc và tăng độ đàn hồi, ngăn ngừa lão hoá.<br/>
                               - <strong>Chiết xuất thiên nhiên</strong>: Làm dịu và giảm sưng viêm hiệu quả, phù hợp da nhạy cảm.
                            </p>
                            <p className="text-[14px] leading-relaxed text-gray-700 mt-4 italic opacity-80">
                               * Vui lòng xem trên bao bì sản phẩm để cập nhật bảng thành phần chi tiết và mới nhất.
                            </p>
                        </div>
                    )}

                    {activeTab === 'guide' && (
                        <div className="w-full">
                            <h3 className="font-bold text-[18px] mb-4 text-[#005a31]">Hướng dẫn sử dụng</h3>
                            <ul className="text-[14px] leading-relaxed text-gray-700 list-inside space-y-2">
                                <li><strong>Bước 1:</strong> Làm sạch da bằng nước tẩy trang và sữa rửa mặt phù hợp.</li>
                                <li><strong>Bước 2:</strong> Cân bằng da với Nước hoa hồng (Toner).</li>
                                <li><strong>Bước 3:</strong> Sử dụng tinh chất (Serum) hoặc bước điều trị riêng biệt (nếu có).</li>
                                <li><strong>Bước 4:</strong> Lấy một lượng sản phẩm (khoảng 1 hạt đậu lớn) thoa đều khắp mặt và cổ.</li>
                                <li><strong>Bước 5:</strong> Massage nhẹ nhàng hướng từ dưới lên trên, từ trong ra ngoài để dưỡng chất thẩm thấu tối đa.</li>
                            </ul>
                            <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <p className="text-[13px] text-gray-800 font-medium"><strong>💡 Lưu ý:</strong><br/>
                                - Sử dụng 2 lần mỗi ngày (Sáng & Tối) để đạt hiệu quả tốt nhất.<br/>
                                - Buổi sáng bắt buộc cần bôi thêm kem chống nắng bảo vệ da.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Cột sản phẩm xem cùng - 3 cột */}
            <div className="col-span-3">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 sticky top-[120px]">
                    <h4 className="font-bold text-[16px] mb-4 text-gray-800">Sản phẩm xem cùng</h4>
                    
                    <div className="space-y-4">
                        {[
                           { name: 'Kem Dưỡng Phục Hồi...', price: 260000, old: 455000, brand: product.brand_name || 'Brand A', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop' },
                           { name: 'Serum Dưỡng Trắng...', price: 336000, old: 480000, brand: 'Brand B', img: 'https://images.unsplash.com/photo-1629198725838-89c0b1ae5ed5?w=100&h=100&fit=crop' }
                        ].map((s, i) => (
                           <div key={i} className="flex gap-3 items-center group cursor-pointer border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                               <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-50 relative">
                                   <div className="absolute top-0 left-0 bg-[#ff6b00] text-white text-[9px] font-bold px-1 rounded-br z-10">-30%</div>
                                   <img src={s.img} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                               </div>
                               <div>
                                   <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className="text-[#ff6b00] font-bold text-[14px]">{s.price.toLocaleString('vi-VN')} đ</span>
                                      <span className="text-[11px] text-gray-400 line-through">{s.old.toLocaleString('vi-VN')}</span>
                                   </div>
                                   <p className="text-[11px] text-[#005a31] font-bold uppercase">{s.brand}</p>
                                   <h5 className="text-[12px] text-gray-700 line-clamp-2 leading-snug group-hover:text-[#005a31] transition-colors">{s.name}</h5>
                               </div>
                           </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}

// Icon Helper since we can't import dynamicly
const ShoppingCartIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);

const tabLabels: Record<string, string> = {
    desc: 'Mô tả',
    specs: 'Thông số',
    ingredients: 'Thành phần',
    guide: 'HDSD',
    reviews: 'Đánh giá',
    qa: 'Hỏi đáp'
};
