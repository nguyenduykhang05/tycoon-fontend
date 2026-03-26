const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace Coming soon nav links
const comingSoonLines = [
  `onClick={(e) => { e.preventDefault(); alert("Coming soon"); }}>TYCOON DEALS</a>`,
  `onClick={(e) => { e.preventDefault(); alert("Coming soon"); }}>HOT DEALS</a>`,
  `onClick={(e) => { e.preventDefault(); alert("Coming soon"); }}>THƯƠNG HIỆU</a>`,
  `onClick={(e) => { e.preventDefault(); alert("Coming soon"); }}>HÀNG MỚI VỀ</a>`,
  `onClick={(e) => { e.preventDefault(); alert("Coming soon"); }}>BÁN CHẠY</a>`,
  `onClick={(e) => { e.preventDefault(); alert("Coming soon"); }}>DERMAHAIR</a>`,
];

console.log('File size:', content.length);
console.log('Has Coming soon:', content.includes('Coming soon'));

// Replace each line
content = content.replace(
  `onClick={(e) => { e.preventDefault(); alert("Coming soon"); }}>TYCOON DEALS</a>`,
  `onClick={(e) => { e.preventDefault(); setCurrentPage('home'); setTimeout(() => { const el = document.getElementById('flash-deals-scroll'); if(el) el.scrollIntoView({behavior:'smooth'}); }, 100); }}>TYCOON DEALS</a>`
);

content = content.replace(
  `onClick={(e) => { e.preventDefault(); alert("Coming soon"); }}>HOT DEALS</a>`,
  `onClick={(e) => { e.preventDefault(); setCurrentPage('home'); setTimeout(() => { const el = document.getElementById('flash-deals-scroll'); if(el) el.scrollIntoView({behavior:'smooth'}); }, 100); }}>HOT DEALS</a>`
);

content = content.replace(
  `onClick={(e) => { e.preventDefault(); alert("Coming soon"); }}>THƯƠNG HIỆU</a>`,
  `onClick={(e) => { e.preventDefault(); setCurrentPage('home'); setTimeout(() => { const el = document.getElementById('brands-section'); if(el) el.scrollIntoView({behavior:'smooth'}); }, 100); }}>THƯƠNG HIỆU</a>`
);

content = content.replace(
  `onClick={(e) => { e.preventDefault(); alert("Coming soon"); }}>HÀNG MỚI VỀ</a>`,
  `onClick={(e) => { e.preventDefault(); setBestSellerCategory(''); setSelectedCategory(null); setCurrentPage('home'); }}>HÀNG MỚI VỀ</a>`
);

content = content.replace(
  `onClick={(e) => { e.preventDefault(); alert("Coming soon"); }}>BÁN CHẠY</a>`,
  `onClick={(e) => { e.preventDefault(); setCurrentPage('home'); setTimeout(() => { const el = document.getElementById('best-sellers-section'); if(el) el.scrollIntoView({behavior:'smooth'}); }, 100); }}>BÁN CHẠY</a>`
);

content = content.replace(
  `onClick={(e) => { e.preventDefault(); alert("Coming soon"); }}>DERMAHAIR</a>`,
  `onClick={(e) => { e.preventDefault(); setBestSellerCategory('Chăm Sóc Tóc'); setCurrentPage('home'); }}>DERMAHAIR</a>`
);

// Also add class to CLINIC & SPA 
content = content.replace(
  `<a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('spa'); }}>CLINIC & SPA</a>`,
  `<a className="hover:text-orange-500 transition-colors" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('spa'); }}>CLINIC & SPA</a>`
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('SUCCESS: Done! File written.');
console.log('Still has Coming soon:', content.includes('Coming soon'));
