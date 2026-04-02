/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Store, ShieldCheck, Headset, ShoppingCart, Menu, MapPin, ChevronRight, Bolt, CalendarHeart, LogOut, CheckCircle2, Facebook, ChevronDown, Mail, Lock, X, FileText, Heart, Truck, LayoutGrid, Clock, ChevronLeft } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import CartPage from './components/CartPage';
import StorePage from './components/StorePage';
import WarrantyPage from './components/WarrantyPage';
import SpaPage from './components/SpaPage';
import ChatWidget from './components/ChatWidget';
import AIChatWidget from './components/AIChatWidget';
import ProductDetailPage from './components/ProductDetailPage';
import AccountPage from './components/AccountPage';
import AdminDashboard from './components/AdminDashboard';


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
  capacities?: string;
}

interface Brand {
  id: number;
  name: string;
  logo_url: string;
  description: string;
}

interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnail_url: string;
  author_id: number;
  created_at: string;
}

// Hero Banner Slider Component
function HeroSlider() {
  const slides = [
    { src: '/hero_banner.png', alt: 'Tycoon - Vẻ Đẹp Hoàn Hảo' },
    { src: '/banner_sale.png', alt: 'Sale Up To 50%' },
    { src: '/banner_spa.png', alt: 'Đặt Lịch Spa Ngay' },
  ];
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrent(s => (s + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="col-span-9 h-[400px] rounded-[2.5rem] overflow-hidden shadow-soft relative group">
      {slides.map((slide, idx) => (
        <img
          key={slide.src}
          alt={slide.alt}
          src={slide.src}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === current ? 'opacity-100 z-[1]' : 'opacity-0 z-0'}`}
        />
      ))}
      {/* Prev button */}
      <button
        onClick={() => setCurrent(s => (s - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >‹</button>
      {/* Next button */}
      <button
        onClick={() => setCurrent(s => (s + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >›</button>
      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`rounded-full transition-all duration-300 ${idx === current ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/60 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </div>
  );
}

function StarRating({ rating, count }: { rating: number, count: number }) {
  const stars = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-1 mb-2">
      <div className="flex">
        {[1,2,3,4,5].map(i => (
          <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= stars ? '#f59e0b' : '#e5e7eb'} xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>
      {count > 0 && <span className="text-[10px] text-gray-400">({count})</span>}
    </div>
  );
}

function ProductCard({ product, onClick, selectedLocation }: { product: Product, onClick: () => void, selectedLocation: string }) {
  const percent = product.discount_percent || Math.round((1 - product.price / product.original_price) * 100);
  const isHot = (product.sold_count || 0) >= 1000;
  const isNew = (product.sold_count || 0) < 50;
  return (
    <div 
      className="bg-white rounded-[1.5rem] border border-gray-100 flex flex-col h-full hover:shadow-xl transition-all duration-300 group relative overflow-hidden cursor-pointer" 
      onClick={onClick}
    >
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
        {percent > 0 && (
          <div className="bg-[#ff6b00] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
            -{percent}%
          </div>
        )}
        {isHot && (
          <div className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">🔥 HOT</div>
        )}
        {isNew && (
          <div className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">✨ MỚI</div>
        )}
      </div>
      
      <div className="relative aspect-square overflow-hidden bg-gray-50 group-hover:bg-gray-100 transition-colors">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
             (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23f3f4f6%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20color%3D%22%239ca3af%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
          }}
        />
      </div>

      <div className="p-4 flex flex-col flex-grow bg-white">
        <p className="text-[11px] text-[#005a31] font-black mb-1 uppercase tracking-widest">{product.brand_name || 'BRAND'}</p>
        <h4 className="text-[13px] font-bold text-gray-800 line-clamp-2 h-9 mb-2 leading-tight group-hover:text-[#005a31] transition-colors">{product.name}</h4>
        <StarRating rating={(product as any).avg_rating || 0} count={(product as any).review_count || 0} />
        
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[#ff6b00] font-black text-[18px]">{product.price.toLocaleString('vi-VN')} ₫</span>
            {product.original_price > product.price && (
              <span className="text-[12px] text-gray-300 line-through font-medium">{product.original_price.toLocaleString('vi-VN')} ₫</span>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> SẴN HÀNG
              </span>
              {['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'].includes(selectedLocation) && (
                <div className="flex items-center gap-1 py-1 px-2 rounded-full border border-emerald-500 text-[#005a31] bg-emerald-50/50">
                  <Truck size={10} className="stroke-[3]" />
                  <span className="text-[9px] font-black uppercase">2H</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fetch interceptor moved to main.tsx

export default function App() {
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string>('Chăm Sóc Da Mặt');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'cart' | 'store' | 'warranty' | 'spa' | 'product-detail' | 'account' | 'search-results' | 'blog-detail'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [flashDealEndTime, setFlashDealEndTime] = useState<string | null>(null);
  const [flashDealTimeLeft, setFlashDealTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Best Sellers state
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [bestSellerCategory, setBestSellerCategory] = useState<string>('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hotSearches, setHotSearches] = useState<string[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false); // Added isSearchFocused state

  // New State variables for Backend features
  const [user, setUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('tycoon_user') || 'null');
    } catch {
      return null;
    }
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [modalMode, setModalMode] = useState<'login' | 'register' | null>(null);
  const [cartItems, setCartItems] = useState<any[]>(() => {
    const saved = localStorage.getItem('tycoon_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('tycoon_location') || 'Hồ Chí Minh';
  });
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [suggestedLimit, setSuggestedLimit] = useState(10);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [selectedBlogCategory, setSelectedBlogCategory] = useState<string>('Tất cả');
  const [stores, setStores] = useState<any[]>([]);

  const provinces = [
    'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 
    'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 
    'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 
    'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 
    'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình', 
    'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 
    'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 
    'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Quảng Bình', 
    'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 
    'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 
    'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 
    'Vĩnh Phúc', 'Yên Bái', 'Phú Yên'
  ];

  const getStoreCount = (location: string) => {
    return stores.filter(store => store.province === location).length;
  };

  useEffect(() => {
    localStorage.setItem('tycoon_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('tycoon_location', selectedLocation);
  }, [selectedLocation]);

  useEffect(() => {
    setLoading(true);
    let url = '/api/products?is_flash_deal=0';
    if (selectedCategory) url += `&category_name=${encodeURIComponent(selectedCategory)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSuggestedProducts(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching filtered products:', err);
        setLoading(false);
      });
  }, [selectedCategory, selectedLocation]);

  // Registration state
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regGender, setRegGender] = useState('Không xác định');
  const [regDobDay, setRegDobDay] = useState('');
  const [regDobMonth, setRegDobMonth] = useState('');
  const [regDobYear, setRegDobYear] = useState('');
  const [regCaptcha, setRegCaptcha] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [regError, setRegError] = useState('');

  const generateCaptcha = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
  };

  useEffect(() => {
    if (modalMode === 'register') {
      generateCaptcha();
      setRegCaptcha('');
      setRegError('');
    }
  }, [modalMode]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regPassword || !regFullName || !regCaptcha) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc: email/SĐT, mật khẩu, họ tên và mã captcha');
      return;
    }

    if (regCaptcha.toLowerCase() !== captchaCode.toLowerCase()) {
      alert('Mã captcha không chính xác');
      generateCaptcha();
      setRegCaptcha('');
      return;
    }

    const dob = (regDobYear && regDobMonth && regDobDay) ? `${regDobYear}-${regDobMonth}-${regDobDay}` : null;

    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: regUsername,
        password: regPassword,
        full_name: regFullName,
        gender: regGender,
        dob: dob
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Đăng ký thành công!');
          localStorage.setItem('tycoon_token', data.token);
          localStorage.setItem('tycoon_user', JSON.stringify(data.data));
          setUser(data.data); // Auto-login
          setModalMode(null);
          setIsAccountMenuOpen(false);
          setRegUsername('');
          setRegPassword('');
          setRegFullName('');
          setRegGender('Không xác định');
          setRegDobDay('');
          setRegDobMonth('');
          setRegDobYear('');
          setRegDobYear('');
          setRegError('');
          setRegCaptcha('');
        } else {
          setRegError(data.message || 'Lỗi không xác định khi đăng ký');
        }
      })
      .catch(err => {
        console.error(err);
        setRegError(err.message || 'Đăng ký thất bại do lỗi mạng');
      });
  };

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentPage('home'); // Or stay on current page if query is empty
      return;
    }
    setSearchQuery(query);
    fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSearchResults(data.data);
          setCurrentPage('search-results');
          setShowSearchDropdown(false);
        }
      })
      .catch(err => console.error('Error searching:', err));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginUsername, password: loginPassword })
    })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => {
             let msg = 'Máy chủ phản hồi lỗi';
             try {
                const err = JSON.parse(text);
                msg = err.message || msg;
             } catch {}
             throw new Error(msg);
          });
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          localStorage.setItem('tycoon_token', data.token);
          localStorage.setItem('tycoon_user', JSON.stringify(data.data));
          setUser(data.data);
          setIsAccountMenuOpen(false);
          setModalMode(null);
          setLoginUsername('');
          setLoginPassword('');
          setLoginError('');
        } else {
          setLoginError(data.message || 'Đăng nhập không thành công');
        }
      })
      .catch(err => {
        setLoginError(err.message || 'Sai tài khoản hoặc mật khẩu! (Hoặc lỗi mạng)');
      });
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log("Google Login Success:", credentialResponse);
    // TODO: Send credentialResponse.credential to backend /api/auth/google
    // For now, mock a successful login
    setUser({ username: 'GoogleUser', role: 'customer', tier: 'Member', points: 0 });
    setModalMode(null);
    setIsAccountMenuOpen(false);
  };

  const handleGoogleError = () => {
    console.log('Google Login Failed');
    alert('Đăng nhập Google thất bại');
  };

  const handleFacebookResponse = (response: any) => {
    console.log("Facebook Login Response:", response);
    if (response.accessToken) {
      // TODO: Send response.accessToken to backend /api/auth/facebook
      // For now, mock a successful login
      setUser({ username: response.name || 'FacebookUser', role: 'customer', tier: 'Member', points: 0 });
      setModalMode(null);
      setIsAccountMenuOpen(false);
    } else {
      alert('Đăng nhập Facebook thất bại');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('tycoon_token');
    localStorage.removeItem('tycoon_user');
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
    window.scrollTo(0, 0); // Scroll to top when opening details
  };

  const handleCartAdd = (product: Product, defaultQuantity: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + defaultQuantity } : item);
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, image_url: product.image_url, brand_name: product.brand_name, quantity: defaultQuantity }];
    });
    alert('Đã thêm sản phẩm vào giỏ hàng!');
  };

  const checkInStaff = () => {
    if (!user || user.role !== 'staff') return;
    fetch('/api/timesheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, action: 'in' })
    }).then(res => res.json()).then(data => {
      if (data.success) alert('Chấm công check-in thành công!');
    });
  };

  useEffect(() => {

    // Fetch flash deals
    fetch('/api/products?is_flash_deal=1')
      .then(res => res.json())
      .then(data => {
        if (data.success) setFlashDeals(data.data);
      })
      .catch(err => console.error('Error fetching flash deals:', err));

    // Fetch suggested products (not flash deals)
    fetch('/api/products?is_flash_deal=0')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSuggestedProducts(data.data);
      })
      .catch(err => console.error('Error fetching suggested products:', err));

    // Fetch flash deal end time
    fetch('/api/admin/settings/flash-deal')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.end_time) {
          setFlashDealEndTime(data.data.end_time);
        }
      })
      .catch(err => console.error('Error fetching flash deal settings:', err));

    // Fetch brands
    fetch(`/api/brands?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setBrands(data.data);
      })
      .catch(err => console.error('Error fetching brands:', err));

    // Fetch stores
    fetch(`/api/stores?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setStores(data.data);
      })
      .catch(err => console.error('Error fetching stores:', err));

    // Initial blogs fetch handled by separate useEffect below

    // Fetch hot searches
    fetch('/api/hot-searches')
      .then(res => res.json())
      .then(data => { if (data.success) setHotSearches(data.data); })
      .catch(() => { });
  }, []);

  // Fetch best sellers when tab changes
  useEffect(() => {
    fetch(`/api/products/best-sellers?category_name=${encodeURIComponent(bestSellerCategory)}&limit=5`)
      .then(r => r.json())
      .then(d => { if (d.success) setBestSellers(d.data); });
  }, [bestSellerCategory]);

  // Fetch blogs when category changes
  useEffect(() => {
    fetch(`/api/blogs?category=${encodeURIComponent(selectedBlogCategory)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setBlogs(data.data);
      })
      .catch(err => console.error('Error fetching blogs:', err));
  }, [selectedBlogCategory]);

  useEffect(() => {
    if (!flashDealEndTime) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(flashDealEndTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(interval);
        setFlashDealTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setFlashDealTimeLeft({
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [flashDealEndTime]);

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <div className="min-h-screen bg-[#f4f4f4] text-gray-800 antialiased">
        {/* Header - Fixed to top */}
        <header className="bg-[#005a31] text-white sticky top-0 z-50 shadow-md">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
            {/* Logo */}
            <a className="flex-shrink-0 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <img alt="Tycoon Logo" className="h-[36px] w-auto" src="https://i.imgur.com/BI0tiZr.png" />
            </a>

            {/* Search Bar Group */}
            <div className="flex-grow max-w-2xl min-w-0 flex flex-col gap-1 relative group/search">
              <div className="relative w-full">
                <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-full overflow-hidden shadow-soft border border-gray-100/50 transition-all focus-within:ring-2 focus-within:ring-orange-200">
                  <input
                    className="w-full py-2 px-5 text-[14px] text-gray-800 focus:outline-none border-none placeholder-gray-400"
                    placeholder="Bạn tìm gì hôm nay? Ví dụ: Kem chống nắng..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearchDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 flex items-center justify-center bg-white border-l border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <Search size={18} className="text-[#005a31] stroke-[2.5]" />
                  </button>
                </form>

                {/* Hot Search Tags Row - Fixed beneath the search bar */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar whitespace-nowrap px-3 pt-1">
                  {hotSearches.slice(0, 5).map(tag => (
                    <button
                      key={tag}
                      onClick={() => { setSearchQuery(tag); performSearch(tag); }}
                      className="text-[12px] text-white/90 hover:text-white transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Search Dropdown with Hot Deals + Brands */}
                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[200] overflow-hidden">
                    {/* Hot Deals */}
                    <div className="p-4 border-b border-gray-50">
                      <div className="flex flex-col gap-1.5">
                        {['18.3 Deal Ngập Tràn - Săn Ngàn Quà Hot', 'MỚI! Kem Chống Nắng La Roche-Posay UVMune 400', 'Victoria\'s Secret - Nước Hoa Chính Hãng', 'Deal 2K-3K - Sản phẩm chỉ từ 2.000đ'].map((deal) => (
                          <button
                            key={deal}
                            className="text-left text-[13px] text-gray-700 hover:text-[#005a31] hover:bg-gray-50 py-2 px-3 rounded-lg transition-colors font-medium"
                            onClick={() => { performSearch(deal); setShowSearchDropdown(false); }}
                          >
                            {deal}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Recent / Hot Brands */}
                    {brands.slice(0, 2).map(b => (
                      <div key={b.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors">
                        <span className="text-[13px] font-bold text-gray-700">{b.name}</span>
                        <button onClick={() => setShowSearchDropdown(false)} className="text-gray-300 hover:text-gray-500 text-[18px] font-light leading-none" aria-label="Đóng">×</button>
                      </div>
                    ))}
                    {/* Quick Category Pills */}
                    <div className="p-4 pt-2">
                      <div className="grid grid-cols-3 gap-2">
                        {['Dưỡng Môi','Dưỡng Da Tay / Chân','Chăm Sóc Răng Miệng','Thuốc Nhuộm Tóc','Đặc Trị','Chống Nắng Da Mặt'].map(cat => (
                          <button
                            key={cat}
                            className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-emerald-50 hover:text-[#005a31] rounded-xl text-[12px] font-bold transition-colors text-gray-700 text-center"
                            onClick={() => { setSelectedCategory(cat); setShowSearchDropdown(false); setCurrentPage('home'); }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Brand logos */}
                    <div className="border-t border-gray-50 p-4">
                      <div className="grid grid-cols-4 gap-3">
                        {brands.slice(0, 8).map(brand => (
                          <button
                            key={brand.id}
                            className="p-2 border border-gray-100 rounded-xl text-[11px] font-black text-[#005a31] hover:bg-emerald-50 transition-colors uppercase tracking-tight"
                            onClick={() => { performSearch(brand.name); setShowSearchDropdown(false); }}
                          >
                            {brand.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Elements */}
            <nav className="flex items-center gap-x-4 gap-y-2 flex-wrap justify-end whitespace-nowrap overflow-visible">
               {/* Account */}
               <div
                className="relative flex items-center gap-2 cursor-pointer hover:text-orange-300 transition-colors group/account"
                onMouseEnter={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  setIsAccountMenuOpen(true);
                }}
                onMouseLeave={() => {
                  timeoutRef.current = setTimeout(() => setIsAccountMenuOpen(false), 200);
                }}
              >
                <div className="relative">
                  <User size={24} className="stroke-[2] group-hover/account:scale-110 transition-transform" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full border border-[#005a31] shadow-sm"></div>
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest opacity-80 leading-none mb-0.5">TÀI KHOẢN</span>
                  <span className="text-[13px] font-bold text-white leading-none truncate max-w-[100px]">
                    {!user ? "Đăng nhập" : user.username}
                  </span>
                </div>
                <ChevronDown size={12} className="opacity-40 group-hover/account:opacity-100 transition-opacity" />

                {isAccountMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-[320px] bg-white text-gray-800 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-100 p-5 z-50">
                    <div className="absolute -top-1.5 right-8 w-3 h-3 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                    {!user ? (
                      <div className="text-center relative bg-white">
                        <p className="text-[14px] text-gray-700 mb-4 font-medium">Đăng nhập với</p>
                        <div className="flex flex-col gap-3 mb-5">
                          <FacebookLogin
                            appId="YOUR_FACEBOOK_APP_ID" // Replace with your actual Facebook App ID
                            autoLoad={false}
                            fields="name,email,picture"
                            callback={handleFacebookResponse}
                            render={renderProps => (
                              <button onClick={renderProps.onClick} className="w-full h-[40px] bg-[#1877F2] text-white rounded flex items-center justify-center font-medium hover:bg-[#166FE5] transition-colors relative shadow-[0_1px_2px_0_rgba(0,0,0,0.24)]">
                                <div className="absolute left-1 top-1 bottom-1 w-[32px] bg-white rounded-sm flex items-center justify-center">
                                  <Facebook size={20} className="text-[#1877F2]" fill="currentColor" strokeWidth={0} />
                                </div>
                                <span className="text-[14px]">Đăng nhập với Facebook</span>
                              </button>
                            )}
                          />

                          <div className="w-full h-[40px] flex justify-center [&>div]:w-full relative z-[60]">
                            <GoogleLogin
                              onSuccess={handleGoogleSuccess}
                              onError={handleGoogleError}
                              useOneTap
                              width="280"
                            />
                          </div>
                        </div>

                        <p className="text-[14px] text-gray-700 mb-4 font-medium">Hoặc đăng nhập với Tycoon.vn</p>

                        <button
                          onClick={(e) => { e.preventDefault(); setModalMode('login'); setIsAccountMenuOpen(false); }}
                          className="w-full bg-[#005a31] text-white py-2.5 rounded-full font-bold hover:bg-emerald-800 transition-colors mb-4 text-[14px]"
                        >
                          Đăng nhập
                        </button>

                        <p className="text-[14px] text-gray-600 mt-2">
                          Bạn chưa có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); setModalMode('register'); setIsAccountMenuOpen(false); }} className="text-[#005a31] uppercase inline-block hover:underline font-medium ml-1">Đăng ký ngay</a>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-[#005a31] mb-2 flex items-center justify-between pb-2 border-b">
                          <div className="flex flex-col text-left">
                            <span className="text-[12px] text-gray-400 font-normal">Chào {user.full_name || user.username}</span>
                            <span className="text-[14px]">Tài khoản <ChevronRight size={14} className="inline" /></span>
                          </div>
                          {(user.role === 'admin' || user.role === 'staff') && (
                            <button
                              onClick={() => { window.location.href = '/admin'; }}
                              className="bg-[#ff6b00] text-white text-[10px] px-2 py-1 rounded font-bold hover:bg-orange-600 transition-colors uppercase"
                            >
                              Quản trị
                            </button>
                          )}
                        </h4>

                        <div className="flex flex-col items-start gap-4 mb-4 py-2 text-[14px] text-gray-700 font-medium">
                          <button onClick={() => { setCurrentPage('account'); setIsAccountMenuOpen(false); }} className="flex gap-2 items-center hover:text-[#005a31]"><FileText size={18} /> Tài khoản của bạn</button>
                          <button className="flex gap-2 items-center hover:text-[#005a31]"><ShoppingCart size={18} /> Quản lý đơn hàng</button>
                          <button className="flex gap-2 items-center hover:text-[#005a31]"><Heart size={18} /> Sản phẩm yêu thích</button>
                          <button className="flex gap-2 items-center hover:text-[#005a31]"><MapPin size={18} /> Địa chỉ giao hàng</button>
                        </div>

                        {user.role === 'staff' && (
                          <button onClick={checkInStaff} className="w-full bg-emerald-100 text-[#005a31] py-2 mb-3 rounded font-bold border border-emerald-200 hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2">
                            <CheckCircle2 size={16} /> Chấm Công
                          </button>
                        )}

                        <button onClick={() => { handleLogout(); setIsAccountMenuOpen(false); setCurrentPage('home'); }} className="w-full text-gray-500 py-2 flex gap-2 hover:bg-gray-50 rounded transition-colors text-[14px] font-medium border-t pt-4">
                          <LogOut size={18} className="text-gray-400" /> Thoát
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

               {/* Store */}
               <div className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition-colors group/store" onClick={() => setCurrentPage('store')}>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/store:bg-white/10 transition-colors">
                  <Store size={18} className="stroke-[2]" />
                </div>
                <span className="text-[12px] font-bold uppercase tracking-tight">Cửa hàng</span>
              </div>

              {/* Warranty */}
              <div className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition-colors group/warranty" onClick={() => setCurrentPage('warranty')}>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/warranty:bg-white/10 transition-colors">
                  <ShieldCheck size={18} className="stroke-[2]" />
                </div>
                <span className="text-[12px] font-bold uppercase tracking-tight">Bảo hành</span>
              </div>

              {/* Spa Button */}
              <div className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition-colors group/spa" onClick={() => setCurrentPage('spa')}>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/spa:bg-white/10 transition-colors">
                  <CalendarHeart size={18} className="stroke-[2]" />
                </div>
                <span className="text-[12px] font-bold uppercase tracking-tight">Đặt Lịch Spa</span>
              </div>

              {/* Support */}
              <div className="flex items-center gap-2 cursor-pointer hover:text-orange-400 transition-colors group/support" onClick={() => setShowChat(true)}>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/support:bg-white/10 transition-colors">
                  <Headset size={18} className="stroke-[2]" />
                </div>
                <span className="text-[12px] font-bold uppercase tracking-tight">Hỗ trợ</span>
              </div>

              {/* Cart */}
              <div className="relative flex items-center gap-2 cursor-pointer hover:text-orange-400 transition-colors group/cart" onClick={() => setCurrentPage('cart')}>
                <div className="relative w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/cart:bg-white/10 transition-colors">
                  <ShoppingCart size={18} className="stroke-[2]" />
                  <span className="absolute -top-1 -right-1 bg-[#ff6b00] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-sm border border-[#005a31]">{cartItems.length}</span>
                </div>
                <span className="text-[12px] font-bold uppercase tracking-tight">Giỏ hàng</span>
              </div>
            </nav>
          </div>
        </header>

        {/* Unified Sub-Header Banner (Restored & Refined) */}
        <div className="bg-[#004d2a] text-white py-1.5 shadow-inner border-t border-white/5 relative z-40">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <MapPin size={14} className="text-orange-400" />
                            <span className="text-[12px] font-bold">Bạn đang ở: <span className="text-orange-400 uppercase tracking-tight">{selectedLocation}</span></span>
                        </div>
                        <div className="h-4 w-px bg-white/20"></div>
                        <div className="hidden md:flex items-center gap-4 overflow-hidden">
                            <div className="flex items-center gap-2">
                                <Truck size={14} className="text-emerald-300" />
                                <span className="text-[11px] font-medium opacity-90"><span className="text-emerald-300 font-bold">Ưu đãi: MIỄN PHÍ GIAO 2H</span> cho đơn từ 90K</span>
                            </div>
                            <div className="h-4 w-px bg-white/20"></div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                                <span className="text-[11px] font-medium opacity-80">Hệ thống <span className="font-bold">100+ cửa hàng</span> sẵn sàng phục vụ</span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setIsRegionModalOpen(true)}
                        className="flex-shrink-0 px-4 py-1 rounded-full bg-[#005a31] hover:bg-emerald-800 border border-white/10 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
                    >
                        THAY ĐỔI
                    </button>
                </div>
            </div>
        </div>
        <div className="bg-white border-b shadow-sm sticky top-[80px] z-40">
          <div className="container mx-auto px-4 flex items-center justify-between text-[13px] font-bold py-2.5 uppercase tracking-tight text-[#005a31]">
            <div className="flex items-center gap-6 relative">
              <div
                className="flex items-center gap-1.5 cursor-pointer relative font-black"
                onMouseEnter={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  setIsCategoryMenuOpen(true);
                }}
                onMouseLeave={() => {
                  timeoutRef.current = setTimeout(() => setIsCategoryMenuOpen(false), 200);
                }}
              >
                <Menu size={18} /> DANH MỤC
                {/* Mega Menu - Hai cột như Hasaki */}
                {isCategoryMenuOpen && (() => {
                  const categoryData: Record<string, { groups: { title: string; items: string[] }[] }> = {
                    'Chăm Sóc Da Mặt': {
                      groups: [
                        { title: 'Làm Sạch Da', items: ['Tẩy trang', 'Sữa rửa mặt', 'Tẩy tế bào chết', 'Nước hoa hồng'] },
                        { title: 'Đặc Trị', items: ['Serum/Ampoule', 'Hỗ trợ trị mụn', 'Se khít lỗ chân lông', 'Giảm thâm'] },
                        { title: 'Dưỡng Ẩm', items: ['Kem dưỡng', 'Xịt khoáng', 'Loại dưỡng dạng xịt'] },
                        { title: 'Mặt Nạ', items: ['Mặt nạ giấy', 'Mặt nạ ngủ', 'Mặt nạ đất sét'] },
                        { title: 'Chống Nắng', items: ['Kem chống nắng SPF 30+', 'Kem chống nắng SPF 50+', 'Xịt chống nắng'] },
                      ]
                    },
                    'Trang Điểm': {
                      groups: [
                        { title: 'Trang Điểm Mặt', items: ['Kem nền', 'Phấn phủ', 'Má hồng', 'Tạo khối'] },
                        { title: 'Trang Điểm Mắt', items: ['Kẻ mắt', 'Mascara', 'Phấn mắt', 'Mi giả'] },
                        { title: 'Trang Điểm Môi', items: ['Son thỏi', 'Son kem', 'Son dưỡng có màu', 'Tẩy trang môi'] },
                        { title: 'Dụng Cụ', items: ['Cọ trang điểm', 'Bông mút', 'Gương compact'] },
                      ]
                    },
                    'Chăm Sóc Tóc': {
                      groups: [
                        { title: 'Gội Xả', items: ['Dầu gội', 'Dầu xả', 'Dầu ủ'] },
                        { title: 'Điều Trị Tóc', items: ['Serum dưỡng tóc', 'Xịt dưỡng tóc', 'Hấp tóc'] },
                        { title: 'Tạo Kiểu', items: ['Gel tạo kiểu', 'Wax tóc', 'Keo xịt tóc'] },
                      ]
                    },
                    'Chăm Sóc Cơ Thể': {
                      groups: [
                        { title: 'Làm Sạch', items: ['Sữa tắm', 'Tẩy tế bào chết toàn thân', 'Xà bông cục'] },
                        { title: 'Dưỡng Thể', items: ['Kem dưỡng thể', 'Dầu dưỡng', 'Xịt dưỡng'] },
                        { title: 'Khử Mùi', items: ['Lăn khử mùi', 'Xịt khử mùi', 'Nhô khự'] },
                      ]
                    },
                    'Chăm Sóc Cá Nhân': {
                      groups: [
                        { title: 'Chăm Sóc Răng Miệng', items: ['Kem đánh răng', 'Nước súc miệng', 'Chỉ nha khoa'] },
                        { title: 'Phụ Kiện', items: ['Bông tẩy trang', 'Tăm bông', 'Giấy thấm dầu'] },
                      ]
                    },
                    'Nước Hoa': {
                      groups: [
                        { title: 'Nước Hoa Nữ', items: ['Eau de Parfum', 'Eau de Toilette', 'Body Mist'] },
                        { title: 'Nước Hoa Nam', items: ['Eau de Parfum', 'Eau de Cologne', 'After Shave'] },
                        { title: 'Nước Hoa Unisex', items: ['Nước hoa giới tính trung tuyến', 'Gift Set'] },
                      ]
                    },
                    'Thực Phẩm Chức Năng': {
                      groups: [
                        { title: 'Sức Khỏe', items: ['Vitamin tổng hợp', 'Omega-3', 'Collagen', 'Canxi'] },
                        { title: 'Làm Đẹp Từ Bên Trong', items: ['Viên uống dưỡng da', 'Viên uống trắng da', 'Thực phẩm bổ sung'] },
                      ]
                    },
                    'Gia Dụng': {
                      groups: [
                        { title: 'Gia Dụng', items: ['Sản phẩm gia dụng', 'Đồ dùng phòng tắm', 'Thiết bị làm đẹp'] },
                      ]
                    },
                  };
                  const mainCategories = [
                    { icon: '🧴', label: 'Chăm Sóc Da Mặt', key: 'Chăm Sóc Da Mặt' },
                    { icon: '💄', label: 'Trang Điểm', key: 'Trang Điểm' },
                    { icon: '💇', label: 'Chăm Sóc Tóc Và Da Đầu', key: 'Chăm Sóc Tóc' },
                    { icon: '🧼', label: 'Chăm Sóc Cơ Thể', key: 'Chăm Sóc Cơ Thể' },
                    { icon: '🪥', label: 'Chăm Sóc Cá Nhân', key: 'Chăm Sóc Cá Nhân' },
                    { icon: '🌹', label: 'Nước Hoa', key: 'Nước Hoa' },
                    { icon: '💊', label: 'Thực Phẩm Chức Năng', key: 'Thực Phẩm Chức Năng' },
                    { icon: '🏠', label: 'Gia Dụng & Đời Sống', key: 'Gia Dụng' },
                    { icon: '🏥', label: 'Tycoon Clinic & Spa', key: 'spa' },
                  ];
                  const activeSubcats = categoryData[hoveredCategory];
                  return (
                    <div
                      className="absolute top-full left-0 mt-1 flex rounded-xl shadow-2xl border border-gray-100 z-[200] overflow-hidden"
                      style={{ minHeight: '400px' }}
                      onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setIsCategoryMenuOpen(true); }}
                      onMouseLeave={() => { timeoutRef.current = setTimeout(() => setIsCategoryMenuOpen(false), 200); }}
                    >
                      {/* Left panel: main categories */}
                      <div className="w-[230px] bg-white border-r border-gray-100 py-2 flex-shrink-0">
                        {mainCategories.map(cat => (
                          <button
                            key={cat.key}
                            onMouseEnter={() => setHoveredCategory(cat.key === 'spa' ? '' : cat.label)}
                            onClick={() => {
                              if (cat.key === 'spa') { setCurrentPage('spa'); }
                              else { setSelectedCategory(cat.label); setCurrentPage('home'); }
                              setIsCategoryMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors text-left group ${
                              hoveredCategory === cat.label
                                ? 'bg-emerald-50 text-[#005a31] font-bold'
                                : 'hover:bg-emerald-50 hover:text-[#005a31] text-gray-700 font-medium'
                            } text-[13px]`}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="text-[16px]">{cat.icon}</span>
                              {cat.label}
                            </span>
                            <ChevronRight size={13} className={`flex-shrink-0 transition-colors ${
                              hoveredCategory === cat.label ? 'text-[#005a31]' : 'text-gray-300'
                            }`} />
                          </button>
                        ))}
                      </div>
                      {/* Right panel: subcategories */}
                      {activeSubcats && (
                        <div className="w-[480px] bg-white p-5 flex-shrink-0">
                          <h3 className="text-[14px] font-black text-[#005a31] mb-4 pb-2 border-b border-gray-100">{hoveredCategory}</h3>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                            {activeSubcats.groups.map(group => (
                              <div key={group.title} className="mb-4">
                                <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2">{group.title}</p>
                                {group.items.map(item => (
                                  <button
                                    key={item}
                                    onClick={() => {
                                      performSearch(item);
                                      setIsCategoryMenuOpen(false);
                                    }}
                                    className="block w-full text-left text-[13px] text-gray-700 hover:text-[#005a31] py-0.5 transition-colors"
                                  >
                                    {item}
                                  </button>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              <a className="text-red-600 hover:text-red-500 transition-colors" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); setTimeout(() => { const el = document.getElementById('flash-deals-scroll'); if(el) el.scrollIntoView({behavior:'smooth'}); }, 100); }}>TYCOON DEALS</a>
              <a className="text-[#ff6b00] hover:text-orange-500 transition-colors" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); setTimeout(() => { const el = document.getElementById('flash-deals-scroll'); if(el) el.scrollIntoView({behavior:'smooth'}); }, 100); }}>HOT DEALS</a>
              <a className="hover:text-orange-500 transition-colors" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); setTimeout(() => { const el = document.getElementById('brands-section'); if(el) el.scrollIntoView({behavior:'smooth'}); }, 100); }}>THƯƠNG HIỆU</a>
              <a className="hover:text-orange-500 transition-colors" href="#" onClick={(e) => { e.preventDefault(); setBestSellerCategory(''); setSelectedCategory(null); setCurrentPage('home'); }}>HÀNG MỚI VỀ</a>
              <a className="hover:text-orange-500 transition-colors" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); setTimeout(() => { const el = document.getElementById('best-sellers-section'); if(el) el.scrollIntoView({behavior:'smooth'}); }, 100); }}>BÁN CHẠY</a>
              <a className="hover:text-orange-500 transition-colors" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('spa'); }}>CLINIC & SPA</a>
              <a className="hover:text-orange-500 transition-colors" href="#" onClick={(e) => { e.preventDefault(); setBestSellerCategory('Chăm Sóc Tóc'); setCurrentPage('home'); }}>DERMAHAIR</a>
            </div>
          </div>
        </div>
        {currentPage === 'home' ? (
          <main className="container mx-auto px-4 py-4 space-y-6">
            <div className="grid grid-cols-12 gap-4 relative">
              {/* Hero Slider */}
              <HeroSlider />
              <div className="col-span-3 flex flex-col gap-4">
                <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-soft flex flex-col items-center flex-1 justify-center">
                  <h3 className="text-[#005a31] font-bold text-[16px] mb-1 text-center">GIAO NHANH MIỄN PHÍ 2H</h3>
                  <p className="text-[12px] text-gray-500 mb-3 text-center">Khu vực: <span className="font-bold text-gray-800">Hồ Chí Minh</span></p>
                  <button 
                    onClick={() => setIsRegionModalOpen(true)}
                    className="bg-[#ff6b00] text-white w-full py-2.5 rounded-full font-bold hover:opacity-90 transition-soft uppercase text-[12px] shadow-sm"
                  >
                    XÁC NHẬN ĐỊA CHỈ
                  </button>
                </div>
                <div className="bg-[#004d2a] text-white p-5 rounded-[2rem] flex items-center justify-between shadow-soft flex-1">
                  <div className="space-y-0.5">
                    <p className="text-[10px] opacity-90 uppercase tracking-widest font-bold">Ứng dụng di động</p>
                    <p className="font-black text-[18px] italic tracking-tight">TẢI APP TYCOON</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Icon Strip - Hasaki Style */}
            <section className="bg-white rounded-xl shadow-sm py-5 px-6">
              <div className="flex items-center justify-between">
                {[
                  { icon: '🏷️', label: 'Deal Ngập Tràn', bg: 'bg-orange-50', border: 'border-orange-100', hover: 'hover:bg-orange-100', action: () => {} },
                  { icon: '⚡', label: 'Giao 2H', bg: 'bg-green-50', border: 'border-green-100', hover: 'hover:bg-green-100', action: () => setIsRegionModalOpen(true) },
                  { icon: '🌸', label: 'Nước Hoa', bg: 'bg-pink-50', border: 'border-pink-100', hover: 'hover:bg-pink-100', action: () => { setSelectedCategory('Nước Hoa'); setCurrentPage('home'); } },
                  { icon: '🏥', label: 'Clinic & S.P.A', bg: 'bg-blue-50', border: 'border-blue-100', hover: 'hover:bg-blue-100', action: () => setCurrentPage('spa') },
                  { icon: '💊', label: 'Clinic Deals', bg: 'bg-purple-50', border: 'border-purple-100', hover: 'hover:bg-purple-100', action: () => {} },
                  { icon: '🏠', label: 'Gia Dụng', bg: 'bg-yellow-50', border: 'border-yellow-100', hover: 'hover:bg-yellow-100', action: () => {} },
                  { icon: '📅', label: 'Đặt Hẹn', bg: 'bg-teal-50', border: 'border-teal-100', hover: 'hover:bg-teal-100', action: () => setCurrentPage('spa') },
                  { icon: '📖', label: 'Cẩm Nang', bg: 'bg-rose-50', border: 'border-rose-100', hover: 'hover:bg-rose-100', action: () => { const el = document.getElementById('beauty-blog'); if(el) el.scrollIntoView({behavior:'smooth'}); } },
                ].map(item => (
                  <button
                    key={item.label}
                    className="flex flex-col items-center gap-2 group cursor-pointer flex-1"
                    onClick={item.action}
                  >
                    <div className={`w-[58px] h-[58px] rounded-full flex items-center justify-center ${item.bg} ${item.hover} transition-all ${item.border} border text-[26px] shadow-sm group-hover:scale-110 group-hover:shadow-md duration-200`}>
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-semibold text-center text-gray-600 group-hover:text-[#005a31] transition-colors leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>


            {/* Flash Deals - Horizontal Scroll như Hasaki */}
            <section className="rounded-2xl overflow-hidden shadow-md bg-white">
              <div className="bg-[#ff6b00] px-6 py-4 flex items-center justify-between">
                <h2 className="text-white font-black text-[22px] uppercase italic tracking-tighter flex items-center gap-2">
                  <span className="bg-white/20 rounded-full p-1"><Bolt size={20} className="fill-current" /></span> FLASH DEALS
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-white text-[13px] font-bold uppercase">Kết thúc sau:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#1a1a1a] text-white px-2.5 py-1 rounded-lg text-[15px] font-black tabular-nums">{flashDealTimeLeft.hours}</span>
                    <span className="text-white font-black text-[18px]">:</span>
                    <span className="bg-[#1a1a1a] text-white px-2.5 py-1 rounded-lg text-[15px] font-black tabular-nums">{flashDealTimeLeft.minutes}</span>
                    <span className="text-white font-black text-[18px]">:</span>
                    <span className="bg-[#1a1a1a] text-white px-2.5 py-1 rounded-lg text-[15px] font-black tabular-nums">{flashDealTimeLeft.seconds}</span>
                  </div>
                </div>
                <a className="text-white text-[13px] font-bold flex items-center gap-1 hover:underline border border-white/40 rounded-full px-4 py-1.5" href="#">Xem tất cả <ChevronRight size={16} /></a>
              </div>
              {/* Horizontal scrollable row */}
              <div className="relative">
                <div
                  id="flash-deals-scroll"
                  className="flex overflow-x-auto gap-3 p-5 scrollbar-hide scroll-smooth"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {flashDeals.map((product) => (
                    <div
                      key={product.id}
                      className="min-w-[200px] max-w-[200px] bg-white rounded-2xl p-3 relative border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-200 flex flex-col group cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        <div className="bg-[#ff6b00] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">-{product.discount_percent}%</div>
                        <div className="bg-[#005a31] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Bolt size={9} className="fill-current" /> 2H
                        </div>
                      </div>
                      <div className="aspect-square mb-3 overflow-hidden rounded-xl bg-gray-50">
                        <img alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" src={product.image_url} />
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">{(product as any).brand_name || ''}</p>
                      <h4 className="text-[13px] font-semibold line-clamp-2 leading-tight mb-2 flex-grow">{product.name}</h4>
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-[#ff6b00] font-black text-[16px]">{product.price.toLocaleString('vi-VN')}đ</span>
                        <span className="text-[11px] text-gray-300 line-through">{product.original_price.toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className="relative h-3 bg-orange-100 rounded-full overflow-hidden mb-2">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#ff6b00] to-[#ffa500] rounded-full"
                          style={{ width: `${Math.min(97, Math.max(20, (product.sold_count % 150 || 65)))}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-bold">ĐÃ BÁN {product.sold_count || 0}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCartAdd(product); }}
                        className="w-full bg-[#005a31] text-white py-2 rounded-full text-[11px] font-bold hover:bg-emerald-800 transition-colors"
                      >
                        Chọn mua
                      </button>
                    </div>
                  ))}
                </div>
                {/* Scroll arrows */}
                <button
                  onClick={() => { const el = document.getElementById('flash-deals-scroll'); if(el) el.scrollBy({ left: -660, behavior: 'smooth' }); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-100 z-10"
                >
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <button
                  onClick={() => { const el = document.getElementById('flash-deals-scroll'); if(el) el.scrollBy({ left: 660, behavior: 'smooth' }); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-100 z-10"
                >
                  <ChevronRight size={18} className="text-gray-600" />
                </button>
              </div>
            </section>
            {/* Promo Banners - 2x2 grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { src: '/banner_sale.png', alt: 'Sale 50%', label: 'SALE 50%', href: '#' },
                { src: '/banner_new_arrivals.png', alt: 'Hàng mới về', label: 'HÀNG MỚI VỀ', href: '#' },
                { src: '/banner_spa.png', alt: 'Đặt lịch Spa', label: 'ĐẶT LỊCH SPA', href: '#' },
                { src: '/banner_loyalty.png', alt: 'Tích điểm nhận quà', label: 'TÍCH ĐIỂM - NHẬN QUÀ', href: '#' },
              ].map((banner) => (
                <a
                  key={banner.alt}
                  href={banner.href}
                  className="relative rounded-[2.5rem] overflow-hidden h-[200px] cursor-pointer shadow-soft hover:shadow-xl transition-soft group block"
                >
                  <img
                    alt={banner.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={banner.src}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white font-bold text-[14px] uppercase tracking-wide">{banner.label}</span>
                  </div>
                </a>
              ))}
            </div>


            <section id="best-sellers-section" className="pt-6">
              {/* "Gợi ý cho bạn" - Hasaki style: tabs tròn + gạch cam */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                {/* Tab container */}
                <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
                  {[
                    { icon: '👤', label: 'Gợi ý cho bạn', value: '', emoji: true },
                    { icon: '🧴', label: 'Chăm Sóc Da', value: 'Chăm Sóc Da Mặt', emoji: true },
                    { icon: '💄', label: 'Trang Điểm', value: 'Trang Điểm', emoji: true },
                    { icon: '🧼', label: 'Cơ Thể', value: 'Chăm Sóc Cơ Thể', emoji: true },
                    { icon: '💇', label: 'Chăm Sóc Tóc', value: 'Chăm Sóc Tóc', emoji: true },
                    { icon: '🌹', label: 'Nước Hoa', value: 'Nước Hoa', emoji: true },
                    { icon: '🧔', label: 'Dành Cho Nam', value: 'Dành Cho Nam', emoji: true },
                  ].map(tab => {
                    const isActive = bestSellerCategory === tab.value;
                    return (
                      <button
                        key={tab.value}
                        onClick={() => {
                          setBestSellerCategory(tab.value);
                          setSelectedCategory(tab.value || null);
                        }}
                        className={`flex flex-col items-center gap-1.5 px-5 py-4 min-w-[110px] border-b-[3px] transition-all duration-200 flex-shrink-0 ${
                          isActive
                            ? 'border-[#ff6b00] text-[#ff6b00]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[22px] transition-all ${
                          isActive ? 'bg-orange-50 shadow-sm scale-110' : 'bg-gray-50'
                        }`}>
                          {tab.icon}
                        </div>
                        <span className={`text-[12px] font-bold whitespace-nowrap ${isActive ? 'text-[#ff6b00]' : 'text-gray-600'}`}>
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                  <div className="flex-1 border-b-[3px] border-transparent" />
                  <div className="flex items-center pr-5 flex-shrink-0">
                    <span className="text-[12px] text-gray-400">{(bestSellerCategory ? bestSellers : suggestedProducts).length} sản phẩm</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-3">
                {(bestSellerCategory ? bestSellers : suggestedProducts.slice(0, suggestedLimit)).map((product) => {
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => handleProductClick(product)}
                      selectedLocation={selectedLocation}
                    />
                  );
                })}
              </div>
              {suggestedLimit < suggestedProducts.length && (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={() => setSuggestedLimit(prev => prev + 12)}
                    className="px-20 py-3 border-2 border-[#005a31] text-[#005a31] bg-white rounded-full font-bold hover:bg-emerald-50 transition-colors uppercase text-[14px]"
                  >
                    Xem thêm sản phẩm
                  </button>
                </div>
              )}

            </section>

            {/* Brands Section - Redesigned for Hasaki Parity */}
            {/* Anchor for beauty blog scroll */}
            <section className="bg-white rounded-[2.5rem] p-12 shadow-soft border border-gray-50 mt-10">
              <div className="flex items-center justify-between mb-12">
                <div className="flex flex-col">
                  <h2 className="text-[#005a31] font-black text-[26px] uppercase tracking-tighter">Thương hiệu nổi bật</h2>
                  <div className="w-20 h-1 bg-[#005a31] mt-1 rounded-full"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 px-2">
                {brands.slice(0, 16).map(brand => (
                  <div 
                    key={brand.id} 
                    className="group relative flex items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 h-[80px] overflow-hidden cursor-pointer"
                    onClick={() => performSearch(brand.name)}
                  >
                    <img 
                      src={brand.logo_url} 
                      alt={brand.name} 
                      className="max-w-[85%] max-h-[85%] object-contain transition-all duration-500 transform group-hover:scale-110 drop-shadow-sm" 
                      onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.style.display = 'none';
                         const parent = target.parentElement;
                         if (parent && !parent.querySelector('.brand-placeholder')) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'brand-placeholder text-[#005a31] font-black text-[12px] uppercase tracking-tighter text-center leading-tight';
                            placeholder.innerText = brand.name;
                            parent.appendChild(placeholder);
                         }
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                ))}
              </div>
            </section>

            {/* Beauty Blog Section - Redesigned for Hasaki Parity */}
            <section id="beauty-blog" className="pb-16 px-4">
              <div className="flex items-center justify-between mb-8">
                <div className="inline-flex items-center gap-3 bg-[#ff6b00] text-white px-8 py-3 rounded-[1.5rem] shadow-soft transition-all hover:bg-orange-600 border-2 border-white">
                  <span className="font-black text-[16px] uppercase tracking-tighter">CẨM NANG LÀM ĐẸP</span>
                </div>
                <div className="flex items-center gap-6">
                  {['Tất cả', 'Chăm sóc da', 'Trang điểm', 'Review'].map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setSelectedBlogCategory(tab)}
                      className={`text-[13px] font-black uppercase tracking-wider transition-all ${selectedBlogCategory === tab ? 'text-[#005a31] border-b-2 border-[#005a31]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {tab}
                    </button>
                  ))}
                  <ChevronRight size={20} className="text-gray-300" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {blogs.map(blog => (
                  <div 
                    key={blog.id} 
                    className="bg-white rounded-[2rem] overflow-hidden shadow-soft border border-gray-100 group cursor-pointer hover:shadow-xl transition-all duration-500 flex flex-col"
                    onClick={() => {
                        setSelectedBlog(blog);
                        setCurrentPage('blog-detail');
                        window.scrollTo(0, 0);
                    }}
                  >
                    <div className="h-56 overflow-hidden relative">
                      <img src={blog.thumbnail_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-black text-[#005a31] uppercase shadow-sm">
                        {blog.author_id === 1 ? 'Expert Advice' : 'Community'}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-[17px] font-bold text-gray-800 line-clamp-2 mb-3 group-hover:text-[#005a31] transition-colors leading-snug min-h-[48px]">{blog.title}</h3>
                      <p className="text-[13px] text-gray-500 line-clamp-2 mb-4 leading-relaxed opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        {blog.content?.substring(0, 100) || 'Đang cập nhật nội dung...'}...
                      </p>
                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Clock size={14} className="text-gray-300" />
                           <span className="text-[11px] text-gray-400 font-medium uppercase tracking-tighter">{new Date(blog.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#ff6b00] font-black text-[12px] uppercase tracking-tighter group-hover:translate-x-1 transition-transform">
                          <span>Đọc tiếp</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        ) : currentPage === 'product-detail' && selectedProduct ? (
          <ProductDetailPage
            product={selectedProduct}
            onAddToCart={handleCartAdd}
            onBuyNow={(prod, qty) => {
              handleCartAdd(prod, qty);
              setCurrentPage('cart');
            }}
            onBack={() => setCurrentPage('home')}
            user={user}
          />
        ) : currentPage === 'search-results' ? (
          <div className="container mx-auto px-4 py-8 min-h-[500px]">
            <h2 className="text-[20px] font-bold mb-6">Kết quả tìm kiếm cho: <span className="text-[#005a31]">"{searchQuery}"</span> ({searchResults.length})</h2>
            {searchResults.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-soft">
                    <X size={48} className="mx-auto mb-4 text-gray-200" />
                    <p className="text-gray-500 text-[16px]">Không tìm thấy sản phẩm nào phù hợp với từ khóa của bạn.</p>
                    <button onClick={() => setCurrentPage('home')} className="mt-4 px-8 py-2 bg-[#005a31] text-white rounded-full font-bold uppercase text-[12px]">Về trang chủ</button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {searchResults.map(product => (
                        <ProductCard 
                          key={product.id} 
                          product={product} 
                          onClick={() => {
                            setSelectedProduct(product);
                            setCurrentPage('product-detail');
                          }} 
                          selectedLocation={selectedLocation}
                        />
                    ))}
                </div>
            )}
          </div>
        ) : currentPage === 'account' ? (
          <AccountPage user={user} onLogout={() => { handleLogout(); setCurrentPage('home') }} onUpdateUserCallback={(updated) => setUser(updated)} />
        ) : currentPage === 'cart' ? (
          <CartPage onContinueShopping={() => setCurrentPage('home')} cartItems={cartItems} setCartItems={setCartItems} user={user} />
        ) : currentPage === 'store' ? (
          <StorePage initialProvince={selectedLocation} onNavigate={setCurrentPage} />
        ) : currentPage === ('admin' as any) ? (
          <AdminDashboard onBack={() => setCurrentPage('home')} />
        ) : currentPage === 'spa' ? (
          <SpaPage user={user} />
        ) : currentPage === 'blog-detail' && selectedBlog ? (
          <div className="container mx-auto px-4 py-10 max-w-4xl">
            <button 
              onClick={() => setCurrentPage('home')}
              className="mb-6 flex items-center gap-2 text-[#005a31] font-bold hover:translate-x-[-4px] transition-transform"
            >
               <X className="rotate-45" size={18} /> QUAY LẠI
            </button>
            <article className="bg-white rounded-[2.5rem] overflow-hidden shadow-soft border border-gray-100">
              <img src={selectedBlog.thumbnail_url} className="w-full h-[450px] object-cover" alt={selectedBlog.title} />
              <div className="p-10">
                <div className="flex items-center gap-4 mb-6">
                   <span className="bg-orange-100 text-[#ff6b00] px-4 py-1 rounded-full text-[12px] font-bold uppercase">Cẩm nang làm đẹp</span>
                   <span className="text-gray-400 text-[13px]">{new Date(selectedBlog.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
                <h1 className="text-[32px] font-black text-gray-800 leading-tight mb-8">{selectedBlog.title}</h1>
                <div className="prose prose-emerald max-w-none text-gray-600 leading-relaxed text-[17px] space-y-6">
                  <p className="font-bold text-[20px] text-gray-800">{selectedBlog.content}</p>
                  <p>Mỗi loại da đều có những đặc điểm riêng biệt và cần một quy trình chăm sóc chuyên sâu. Việc thấu hiểu làn da của bản thân là bước đầu tiên và quan trọng nhất để sở hữu một diện mạo rạng rỡ, tự tin.</p>
                  <p>Tại Tycoon, chúng tôi tin rằng vẻ đẹp bền vững đến từ sự kết hợp hoàn hảo giữa các sản phẩm chăm sóc da chất lượng và lối sống lành mạnh. Hãy cùng chúng tôi khám phá thêm nhiều bí quyết làm đẹp trong các bài viết tiếp theo.</p>
                  <div className="bg-gray-50 p-8 rounded-3xl border border-dashed border-gray-200 mt-10">
                    <h4 className="font-bold text-[#005a31] mb-2 uppercase italic">Sản phẩm liên quan trong bài viết</h4>
                    <p className="text-[14px]">Khám phá ngay các dòng sản phẩm dưỡng da cao cấp tại Tycoon với ưu đãi lên đến 50%.</p>
                    <button onClick={() => setCurrentPage('home')} className="mt-4 bg-[#005a31] text-white px-8 py-2.5 rounded-full font-bold uppercase text-[12px]">Mua sắm ngay</button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        ) : (
          <WarrantyPage />
        )}

        <ChatWidget isOpenExternally={showChat} onCloseExternal={() => setShowChat(false)} />
        <AIChatWidget />
        
        <footer className="bg-[#005a31] text-white pt-16 pb-10 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-4 gap-12 mb-16">
              <div className="space-y-5">
                <h4 className="font-bold border-b border-white/20 pb-2 text-[15px] uppercase">Hỗ trợ khách hàng</h4>
                <ul className="text-[13px] space-y-3 opacity-90">
                  <li><a className="hover:text-[#ff6b00] transition-colors" href="#">Hotline: 1800 6324 (miễn phí)</a></li>
                  <li><a className="hover:text-[#ff6b00] transition-colors" href="#">Tra cứu đơn hàng</a></li>
                  <li><a className="hover:text-[#ff6b00] transition-colors" href="#">Chính sách đổi trả</a></li>
                </ul>
              </div>
              <div className="space-y-5">
                <h4 className="font-bold border-b border-white/20 pb-2 text-[15px] uppercase">Về Tycoon.vn</h4>
                <ul className="text-[13px] space-y-3 opacity-90">
                  <li><a className="hover:text-[#ff6b00] transition-colors" href="#">Giới thiệu Tycoon.vn</a></li>
                  <li><a className="hover:text-[#ff6b00] transition-colors" href="#">Tuyển dụng</a></li>
                  <li><a className="hover:text-[#ff6b00] transition-colors" href="#">Chính sách bảo mật</a></li>
                </ul>
              </div>
              <div className="space-y-5">
                <h4 className="font-bold border-b border-white/20 pb-2 text-[15px] uppercase">Hợp tác & Liên kết</h4>
                <ul className="text-[13px] space-y-3 opacity-90">
                  <li><a className="hover:text-[#ff6b00] transition-colors" href="#">Tycoon Clinic & Spa</a></li>
                  <li><a className="hover:text-[#ff6b00] transition-colors" href="#">Ứng dụng Tycoon</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-bold border-b border-white/20 pb-2 text-[15px] uppercase">Đăng ký nhận bản tin</h4>
                <div className="flex rounded overflow-hidden">
                  <input className="flex-grow px-4 py-2.5 text-gray-800 focus:outline-none text-[13px]" placeholder="Email của bạn" type="email" />
                  <button className="bg-[#ff6b00] px-5 py-2.5 text-[13px] font-bold hover:opacity-90 transition-colors uppercase">Gửi</button>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="text-[12px] opacity-70 space-y-1">
                <p className="font-bold text-[14px] opacity-100 mb-2">CÔNG TY CỔ PHẦN TYCOON BEAUTY & CLINIC</p>
                <p>Địa chỉ: 71 Hoàng Hoa Thám, Phường 13, Quận Tân Bình, TP. Hồ Chí Minh</p>
              </div>
            </div>
          </div>
        </footer>

        {/* Region Selection Modal - Refined for Visual Parity */}
        {isRegionModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white w-[520px] max-h-[85vh] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8 flex justify-between items-start pb-4">
                <div>
                  <h3 className="text-[22px] font-black text-[#005a31] uppercase tracking-tighter mb-1">CHỌN KHU VỰC CỦA BẠN</h3>
                  <p className="text-[14px] text-gray-400">Tycoon sẽ hiển thị ưu đãi và tồn kho tại khu vực này</p>
                </div>
                <button 
                  onClick={() => setIsRegionModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="px-6 py-4 overflow-y-auto grid grid-cols-2 gap-x-4 gap-y-3 scrollbar-thin scrollbar-thumb-gray-200">
                {provinces.map(province => (
                  <button
                    key={province}
                    onClick={() => {
                        setSelectedLocation(province);
                        setIsRegionModalOpen(false);
                    }}
                    className={`flex items-center justify-center py-4 px-6 rounded-2xl border text-[15px] transition-all text-center ${selectedLocation === province ? 'border-[#005a31] bg-white text-[#005a31] font-bold shadow-sm' : 'border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/30 text-gray-600'}`}
                  >
                    <span>{province}</span>
                  </button>
                ))}
              </div>
              <div className="p-6 text-center">
                <p className="text-[13px] text-gray-300">Không tìm thấy khu vực của bạn? Liên hệ hỗ trợ 1800 1234</p>
              </div>
            </div>
          </div>
        )}


        {/* Auth Modal */}
        {modalMode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-10">
            {modalMode === 'login' ? (
              <div className="bg-white w-[400px] shadow-soft rounded-[2.5rem] relative overflow-hidden flex flex-col pt-8 shrink-0 my-auto">
                <button
                  onClick={() => setModalMode(null)}
                  className="absolute top-0 right-0 bg-gray-500 text-white p-2 hover:bg-gray-600 transition-colors z-10 hidden sm:block"
                  style={{ width: '40px', height: '40px' }}
                >
                  <X size={24} className="ml-[-2px] mt-[-2px]" />
                </button>
                <button
                  onClick={() => setModalMode(null)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors z-10 sm:hidden"
                >
                  <X size={20} />
                </button>

                <div className="px-8 pb-5">
                  <p className="text-center text-[15px] text-gray-700 mb-4 font-medium">Đăng nhập với</p>

                  <div className="flex flex-col gap-3 mb-2">
                    <FacebookLogin
                      appId="YOUR_FACEBOOK_APP_ID" // Replace with your actual Facebook App ID
                      autoLoad={false}
                      fields="name,email,picture"
                      callback={handleFacebookResponse}
                      render={renderProps => (
                        <button onClick={renderProps.onClick} className="w-full h-[45px] bg-[#1877F2] text-white rounded-full flex items-center justify-center font-medium hover:bg-[#166FE5] transition-soft relative shadow-sm">
                          <div className="absolute left-1 top-1 bottom-1 w-[37px] bg-white rounded-full flex items-center justify-center">
                            <Facebook size={20} className="text-[#1877F2]" fill="currentColor" strokeWidth={0} />
                          </div>
                          <span className="text-[14px]">Đăng nhập với Facebook</span>
                        </button>
                      )}
                    />

                    <div className="w-full h-[40px] flex justify-center [&>div]:w-full">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        width="336"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 px-8 py-6 pb-8 bg-[#fdfdfd]">
                  <p className="text-center text-[15px] text-gray-700 mb-5 font-medium">Hoặc đăng nhập với Tycoon.vn</p>

                  <form onSubmit={handleLogin}>
                    {loginError && (
                      <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-4 text-sm shadow-sm">
                        <span className="text-xl leading-none mt-0.5">⚠️</span>
                        <div>
                          <p className="font-bold text-red-700">Đăng nhập thất bại</p>
                          <p className="text-red-600 mt-0.5">{loginError}</p>
                        </div>
                      </div>
                    )}
                    <div className="relative mb-4">
                        <input
                           type="text"
                           placeholder="admin / customer / staff"
                           className="w-full border border-gray-100 bg-gray-50 py-3 pl-4 pr-10 rounded-2xl text-[14px] focus:outline-none focus:bg-white focus:border-[#005a31]/30 focus:ring-4 focus:ring-emerald-500/5 transition-soft placeholder-gray-400"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          required
                        />
                        <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="relative mb-4">
                        <input
                           type="password"
                           placeholder="Mật khẩu (thử: pass)"
                           className="w-full border border-gray-100 bg-gray-50 py-3 pl-4 pr-10 rounded-2xl text-[14px] focus:outline-none focus:bg-white focus:border-[#005a31]/30 focus:ring-4 focus:ring-emerald-500/5 transition-soft placeholder-gray-400"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                        <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between mb-6 text-[14px]">
                      <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#005a31] focus:ring-[#005a31]" />
                        Nhớ mật khẩu
                      </label>
                      <a href="#" className="text-[#005a31] hover:underline">Quên mật khẩu</a>
                    </div>

                      <button type="submit" className="w-full bg-[#356f4d] text-white py-3 rounded-full font-bold transition-soft hover:bg-[#2c5c40] hover:shadow-lg hover:shadow-emerald-900/10 text-[15px] mb-4">
                        Đăng nhập
                      </button>

                    <p className="text-[14px] text-gray-600 mt-2">
                      Bạn chưa có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); setModalMode('register'); }} className="text-[#005a31] uppercase inline-block hover:underline font-medium ml-1">ĐĂNG KÝ NGAY</a>
                    </p>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white w-[480px] shadow-soft rounded-[2.5rem] relative overflow-hidden flex flex-col pt-8 shrink-0 my-auto">
                <button
                  onClick={() => setModalMode(null)}
                  className="absolute top-0 right-0 bg-gray-500 text-white p-2 hover:bg-gray-600 transition-colors z-10 hidden sm:block"
                  style={{ width: '40px', height: '40px' }}
                >
                  <X size={24} className="ml-[-2px] mt-[-2px]" />
                </button>
                <button
                  onClick={() => setModalMode(null)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors z-10 sm:hidden"
                >
                  <X size={20} />
                </button>

                <div className="px-8 pb-4">
                  <p className="text-left text-[16px] text-gray-700 font-medium">Đăng ký tài khoản</p>
                </div>

                <div className="px-8 pb-6">
                  <form onSubmit={handleRegister}>
                    {/* Email / Phone */}
                    <div className="relative mb-4">
                        <input 
                          type="text" 
                          placeholder="Nhập email hoặc số điện thoại" 
                          className="w-full border border-gray-100 bg-gray-50 py-3 pl-4 pr-10 rounded-2xl text-[14px] focus:outline-none focus:bg-white focus:border-[#005a31]/30 focus:ring-4 focus:ring-emerald-500/5 transition-soft placeholder-gray-400" 
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          required
                        />
                        <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Captcha */}
                    <div className="flex gap-2 mb-4">
                      <div className="flex-1">
                          <input 
                            type="text" 
                            placeholder="Nhập captcha" 
                            className="w-full border border-gray-100 bg-gray-50 py-3 px-4 rounded-2xl text-[14px] focus:outline-none focus:bg-white focus:border-[#005a31]/30 focus:ring-4 focus:ring-emerald-500/5 transition-soft placeholder-gray-400" 
                            value={regCaptcha}
                            onChange={(e) => setRegCaptcha(e.target.value)}
                            required
                          />
                      </div>
                        <div 
                          onClick={generateCaptcha} 
                          className="w-[120px] bg-[#356f4d] text-white flex items-center justify-center font-serif italic text-xl tracking-[0.3em] rounded-2xl border border-[#356f4d] select-none cursor-pointer hover:bg-[#2c5c40] transition-soft shadow-sm"
                          title="Nhấn để đổi mã mới"
                        >
                        {captchaCode.split('').join(' ')}
                      </div>
                    </div>

                    {/* Password */}
                    <div className="relative mb-4">
                        <input 
                          type="password" 
                          placeholder="Nhập mật khẩu từ 6 - 32 ký tự" 
                          className="w-full border border-gray-100 bg-gray-50 py-3 pl-4 pr-10 rounded-2xl text-[14px] focus:outline-none focus:bg-white focus:border-[#005a31]/30 focus:ring-4 focus:ring-emerald-500/5 transition-soft placeholder-gray-400" 
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                        />
                        <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Full name */}
                    <div className="relative mb-4">
                        <input 
                          type="text" 
                          placeholder="Họ tên" 
                          className="w-full border border-gray-100 bg-gray-50 py-3 pl-4 pr-10 rounded-2xl text-[14px] focus:outline-none focus:bg-white focus:border-[#005a31]/30 focus:ring-4 focus:ring-emerald-500/5 transition-soft placeholder-gray-400" 
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          required
                        />
                        <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Gender */}
                    <div className="flex items-center gap-6 mb-4 text-[14px] text-gray-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" value="Không xác định" checked={regGender === 'Không xác định'} onChange={(e) => setRegGender(e.target.value)} className="w-4 h-4 text-[#005a31] focus:ring-[#005a31]" />
                        Không xác định
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" value="Nam" checked={regGender === 'Nam'} onChange={(e) => setRegGender(e.target.value)} className="w-4 h-4 text-[#005a31] focus:ring-[#005a31]" />
                        Nam
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" value="Nữ" checked={regGender === 'Nữ'} onChange={(e) => setRegGender(e.target.value)} className="w-4 h-4 text-pink-500 focus:ring-pink-500" />
                        Nữ
                      </label>
                    </div>

                    {/* DOB */}
                    <div className="flex gap-4 mb-5">
                      <select value={regDobDay} onChange={e => setRegDobDay(e.target.value)} className="flex-1 border border-gray-100 bg-gray-50 py-3 px-4 rounded-2xl text-[14px] focus:outline-none focus:bg-white focus:border-[#005a31]/30 focus:ring-4 focus:ring-emerald-500/5 transition-soft shadow-sm appearance-none cursor-pointer">
                        <option value="">Ngày</option>
                        {Array.from({ length: 31 }, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                      </select>
                      <select value={regDobMonth} onChange={e => setRegDobMonth(e.target.value)} className="flex-1 border border-gray-100 bg-gray-50 py-3 px-4 rounded-2xl text-[14px] focus:outline-none focus:bg-white focus:border-[#005a31]/30 focus:ring-4 focus:ring-emerald-500/5 transition-soft shadow-sm appearance-none cursor-pointer">
                        <option value="">Tháng</option>
                        {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                      </select>
                      <select value={regDobYear} onChange={e => setRegDobYear(e.target.value)} className="flex-1 border border-gray-100 bg-gray-50 py-3 px-4 rounded-2xl text-[14px] focus:outline-none focus:bg-white focus:border-[#005a31]/30 focus:ring-4 focus:ring-emerald-500/5 transition-soft shadow-sm appearance-none cursor-pointer">
                        <option value="">Năm</option>
                        {Array.from({ length: 100 }, (_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>})}
                      </select>
                    </div>

                    {/* Agree checkboxes */}
                    <div className="space-y-3 mb-6 text-[13px] text-gray-700">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <div className="min-w-4 pt-0.5">
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#a64ca6] border-gray-300 focus:ring-[#a64ca6]" />
                        </div>
                        <span>Tôi đã đọc và đồng ý với <a href="#" className="text-[#0d6efd] hover:underline">Điều kiện giao dịch chung</a> và <a href="#" className="text-[#0d6efd] hover:underline">Chính sách bảo mật thông tin</a> của Hasaki</span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <div className="min-w-4 pt-0.5">
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#a64ca6] border-gray-300 focus:ring-[#a64ca6]" />
                        </div>
                        <span>Nhận thông tin khuyến mãi qua e-mail</span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <div className="min-w-4 pt-0.5">
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#a64ca6] border-gray-300 focus:ring-[#a64ca6]" />
                        </div>
                        <span>Tôi đồng ý với <a href="#" className="text-[#0d6efd] hover:underline">chính sách xử lý dữ liệu cá nhân</a> của Hasaki</span>
                      </label>
                    </div>

                    {/* Submit button */}
                    <button type="submit" className="w-full bg-[#356f4d] text-white py-3 rounded-full font-bold transition-soft hover:bg-[#2c5c40] hover:shadow-lg hover:shadow-emerald-900/10 text-[15px]">
                      Đăng ký
                    </button>
                  </form>
                </div>

                <div className="border-t border-gray-100 px-8 py-5 bg-[#fdfdfd]">
                  <p className="text-[14px] text-gray-700 mb-2">
                    Bạn đã có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); setModalMode('login'); }} className="text-[#356f4d] hover:underline uppercase">ĐĂNG NHẬP</a>
                  </p>
                  <p className="text-[14px] text-gray-700 mb-3">Hoặc đăng nhập với:</p>

                  <div className="flex flex-col gap-3 items-center">
                    <FacebookLogin
                      appId="YOUR_FACEBOOK_APP_ID" // Replace with your actual Facebook App ID
                      autoLoad={false}
                      fields="name,email,picture"
                      callback={handleFacebookResponse}
                      render={renderProps => (
                        <button onClick={renderProps.onClick} className="w-full max-w-[280px] h-[45px] bg-[#1877F2] text-white rounded-full flex items-center justify-center font-medium hover:bg-[#166FE5] transition-soft relative shadow-sm">
                          <div className="absolute left-1 top-1 bottom-1 w-[37px] bg-white rounded-full flex items-center justify-center">
                            <Facebook size={20} className="text-[#1877F2]" fill="currentColor" strokeWidth={0} />
                          </div>
                          <span className="text-[14px]">Đăng nhập với Facebook</span>
                        </button>
                      )}
                    />

                    <div className="w-full h-[40px] max-w-[280px] flex justify-center [&>div]:w-full">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        width="280"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

