import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { setupDatabase } from './database.js';
import {
  User, Brand, Product, Store, SpaService,
  Review, Blog
} from './src/models/index.js';

async function runSeed() {
  try {
    console.log('--- Starting MongoDB Seed Process ---');
    await setupDatabase();
    
    // Clear existing data
    console.log('1. Clearing existing collections...');
    const collections = Object.values(mongoose.connection.collections);
    for (const collection of collections) {
      await collection.deleteMany({});
    }

    console.log('2. Seeding Users...');
    const hashedAdminPassword = await bcrypt.hash('123456', 10);
    const hashedUserPassword = await bcrypt.hash('123456', 10);

    const admin = await User.create({
      username: 'admin',
      password: hashedAdminPassword,
      role: 'admin',
      points: 0,
      tier: 'Diamond',
      full_name: 'Tycoon Admin'
    });

    const customer = await User.create({
      username: 'customer',
      password: hashedUserPassword,
      role: 'customer',
      points: 1500,
      tier: 'Gold',
      full_name: 'Nguyễn Văn A'
    });

    console.log('3. Seeding Brands...');
    const brandsData = [
      { name: "L'Oréal", origin: 'Pháp', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/L%27Or%C3%A9al_logo.svg/500px-L%27Or%C3%A9al_logo.svg.png' },
      { name: 'Vichy', origin: 'Pháp', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Vichy_logo.svg/500px-Vichy_logo.svg.png' },
      { name: 'La Roche-Posay', origin: 'Pháp', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/La_Roche-Posay_logo.svg/500px-La_Roche-Posay_logo.svg.png' },
      { name: 'Bioderma', origin: 'Pháp', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bioderma-logo.svg/500px-Bioderma-logo.svg.png' },
      { name: 'Maybelline', origin: 'Mỹ', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Maybelline-Logo.svg/500px-Maybelline-Logo.svg.png' },
      { name: 'Chanel', origin: 'Pháp', logo_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/92/Chanel_logo_interlocking_cs.svg/500px-Chanel_logo_interlocking_cs.svg.png' },
      { name: 'Dior', origin: 'Pháp', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Dior_Logo.svg/500px-Dior_Logo.svg.png' },
      { name: 'Kérastase', origin: 'Pháp', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Logo_Kerastase.svg/500px-Logo_Kerastase.svg.png' },
      { name: 'Moroccanoil', origin: 'Israel', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Moroccanoil_Logo.png' }
    ];
    const brands = await Brand.insertMany(brandsData);
    const getBrandId = (name: string) => brands.find(b => b.name === name)?._id;

    console.log('4. Seeding Products...');
    // Images carefully selected from Unsplash to match descriptions
    const IMG_CHANEL = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80';
    const IMG_DIOR = 'https://images.unsplash.com/photo-1595532542520-50dce476c8c7?w=600&q=80';
    const IMG_KERASTASE = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80';
    const IMG_MOROCCANOIL = 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&q=80';
    const IMG_LRP = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80'; // fallback
    
    // Nước hoa (Perfume)
    const perfumes = [
      {
        name: "Nước Hoa Nữ Chanel Coco Mademoiselle 100ml",
        price: 3850000,
        original_price: 4500000,
        discount_percent: 14,
        image_url: IMG_CHANEL,
        category_name: "Nước Hoa",
        is_flash_deal: true,
        sold_count: 520,
        brand_id: getBrandId('Chanel'),
      },
      {
        name: "Nước Hoa Nữ Tom Ford Black Orchid 100ml",
        price: 4200000, original_price: 4800000, discount_percent: 12,
        image_url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500&q=80",
        category_name: "Nước Hoa", is_flash_deal: true, sold_count: 890, brand_id: getBrandId('Tom Ford'),
      },
      {
        name: "Nước Hoa Nam Bleu De Chanel EDP 100ml",
        price: 3650000, original_price: 4100000, discount_percent: 11,
        image_url: IMG_CHANEL,
        category_name: "Nước Hoa", is_flash_deal: false, sold_count: 1420, brand_id: getBrandId('Chanel'),
      },
      {
        name: "Nước Hoa Nữ Le Labo Santal 33 100ml",
        price: 6500000, original_price: 7200000, discount_percent: 9,
        image_url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&q=80",
        category_name: "Nước Hoa", is_flash_deal: true, sold_count: 530, brand_id: getBrandId('Le Labo'),
      },
      {
        name: "Nước Hoa Nữ YSL Libre Eau de Parfum 90ml",
        price: 3350000, original_price: 3800000, discount_percent: 12,
        image_url: "https://images.unsplash.com/photo-1616422324900-5028fe2c4cc0?w=500&q=80",
        category_name: "Nước Hoa", is_flash_deal: false, sold_count: 910, brand_id: getBrandId('Yves Saint Laurent'),
      },
      {
        name: "Nước Hoa Nam Creed Aventus 100ml",
        price: 8500000, original_price: 9200000, discount_percent: 7,
        image_url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&q=80",
        category_name: "Nước Hoa", is_flash_deal: false, sold_count: 320, brand_id: getBrandId('Creed'),
      },
      {
        name: "Nước Hoa Nữ Kilian Good Girl Gone Bad 50ml",
        price: 6200000, original_price: 6800000, discount_percent: 8,
        image_url: "https://images.unsplash.com/photo-1595532542520-50dce476c8c7?w=500&q=80",
        category_name: "Nước Hoa", is_flash_deal: true, sold_count: 410, brand_id: getBrandId('Kilian'),
      }
    ];

    // Chăm sóc tóc (Hair Care)
    const hairCares = [
      {
        name: "Dầu Gội Kérastase Phục Hồi Tóc Hư Tổn 500ml",
        price: 850000, original_price: 1100000, discount_percent: 22,
        image_url: IMG_KERASTASE,
        category_name: "Chăm Sóc Tóc", is_flash_deal: true, sold_count: 1200, brand_id: getBrandId('Kérastase'),
      },
      {
        name: "Tinh Dầu Dưỡng Tóc Moroccanoil Treatment 100ml",
        price: 950000, original_price: 1250000, discount_percent: 24,
        image_url: IMG_MOROCCANOIL,
        category_name: "Chăm Sóc Tóc", is_flash_deal: false, sold_count: 3400, brand_id: getBrandId('Moroccanoil'),
      },
      {
        name: "Dầu Gội Olaplex No.4 Bond Maintenance 250ml",
        price: 750000, original_price: 890000, discount_percent: 15,
        image_url: "https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?w=500&q=80",
        category_name: "Chăm Sóc Tóc", is_flash_deal: true, sold_count: 1850, brand_id: getBrandId('Olaplex'),
      },
      {
        name: "Kem Ủ Tóc Macadamia Deep Repair Masque 236ml",
        price: 620000, original_price: 780000, discount_percent: 20,
        image_url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=80",
        category_name: "Chăm Sóc Tóc", is_flash_deal: false, sold_count: 920, brand_id: getBrandId('Macadamia'),
      },
      {
        name: "Dầu Xả Phục Hồi Tóc L'Oréal Professionnel Absolut Repair 200ml",
        price: 450000, original_price: 550000, discount_percent: 18,
        image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80",
        category_name: "Chăm Sóc Tóc", is_flash_deal: false, sold_count: 2100, brand_id: getBrandId('L\'Oréal Professionnel'),
      }
    ];

    // Skincare
    const skinCares = [
      {
        name: "Kem Dưỡng La Roche-Posay Effaclar Duo+M 40ml",
        price: 425000, original_price: 525000, discount_percent: 19,
        image_url: '/images/laroche_v2.png', category_name: 'Chăm Sóc Da Mặt',
        is_flash_deal: true, sold_count: 1250, brand_id: getBrandId('La Roche-Posay')
      },
      {
        name: "Nước Tẩy Trang Bioderma Sensibio H2O 500ml",
        price: 495000, original_price: 550000, discount_percent: 10,
        image_url: '/images/bioderma_v2.png', category_name: 'Chăm Sóc Da Mặt',
        is_flash_deal: false, sold_count: 3500, brand_id: getBrandId('Bioderma')
      },
      {
         name: "Dưỡng Chất Vichy Mineral 89 Phục Hồi Da 50ml",
         price: 680000, original_price: 950000, discount_percent: 28,
         image_url: '/images/vichy_v2.png', category_name: 'Chăm Sóc Da Mặt',
         is_flash_deal: false, sold_count: 850, brand_id: getBrandId('Vichy')
      },
      {
         name: "Serum Estee Lauder Advanced Night Repair 50ml",
         price: 2850000, original_price: 3400000, discount_percent: 16,
         image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80", category_name: 'Chăm Sóc Da Mặt',
         is_flash_deal: true, sold_count: 1200, brand_id: getBrandId('Estee Lauder')
      },
      {
         name: "Kem Chống Nắng Anessa Perfect UV Skincare Milk 60ml",
         price: 520000, original_price: 680000, discount_percent: 23,
         image_url: "https://images.unsplash.com/photo-1556228578-0885c8b746d0?w=500&q=80", category_name: 'Chăm Sóc Da Mặt',
         is_flash_deal: true, sold_count: 5500, brand_id: getBrandId('Anessa')
      },
      {
         name: "Sữa Rửa Mặt Cetaphil Gentle Skin Cleanser 500ml",
         price: 350000, original_price: 420000, discount_percent: 16,
         image_url: "https://images.unsplash.com/photo-1556229162-5c63ed9c4efb?w=500&q=80", category_name: 'Chăm Sóc Da Mặt',
         is_flash_deal: false, sold_count: 4200, brand_id: getBrandId('Cetaphil')
      },
      {
         name: "Toner Hoa Cúc Kiehl's Calendula Herbal Extract 250ml",
         price: 980000, original_price: 1150000, discount_percent: 14,
         image_url: "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=500&q=80", category_name: 'Chăm Sóc Da Mặt',
         is_flash_deal: false, sold_count: 1850, brand_id: getBrandId('Kiehl\'s')
      }
    ];

    const makeup = [
      {
        name: "Son Kem Maybelline Superstay Vinyl Ink 4.2ml",
        price: 250000, original_price: 320000, discount_percent: 22,
        image_url: '/images/maybelline_v2.png', category_name: 'Trang Điểm',
        is_flash_deal: true, sold_count: 4200, brand_id: getBrandId('Maybelline')
      },
      {
        name: "Kem Nền M·A·C Studio Fix Fluid SPF 15 30ml",
        price: 950000, original_price: 1150000, discount_percent: 17,
        image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80", category_name: 'Trang Điểm',
        is_flash_deal: false, sold_count: 1450, brand_id: getBrandId('M·A·C')
      },
      {
        name: "Phấn Phủ Shiseido Synchro Skin Invisible Silk 10g",
        price: 1100000, original_price: 1350000, discount_percent: 18,
        image_url: "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=500&q=80", category_name: 'Trang Điểm',
        is_flash_deal: true, sold_count: 850, brand_id: getBrandId('Shiseido')
      },
      {
        name: "Son Thỏi 3CE Mood Recipe Matte Lip Color 3.5g",
        price: 350000, original_price: 450000, discount_percent: 22,
        image_url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80", category_name: 'Trang Điểm',
        is_flash_deal: false, sold_count: 5200, brand_id: getBrandId('3CE')
      },
      {
        name: "Che Khuyết Điểm NARS Radiant Creamy Concealer 6ml",
        price: 850000, original_price: 1000000, discount_percent: 15,
        image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80", category_name: 'Trang Điểm',
        is_flash_deal: true, sold_count: 2100, brand_id: getBrandId('NARS')
      }
    ];

    const bodyCare = [
      {
        name: "Sữa Tắm Bath & Body Works Dark Kiss 295ml",
        price: 280000, original_price: 350000, discount_percent: 20,
        image_url: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=500&q=80", category_name: 'Chăm Sóc Cơ Thể',
        is_flash_deal: true, sold_count: 3100, brand_id: getBrandId('Bath & Body Works')
      },
      {
        name: "Dưỡng Thể Paula's Choice Weightless Body Treatment 2% BHA 210ml",
        price: 850000, original_price: 990000, discount_percent: 14,
        image_url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=80", category_name: 'Chăm Sóc Cơ Thể',
        is_flash_deal: false, sold_count: 1450, brand_id: getBrandId('Paula\'s Choice')
      },
      {
        name: "Tẩy Da Chết Cocoon Cà Phê Đắk Lắk 200ml",
        price: 115000, original_price: 150000, discount_percent: 23,
        image_url: "https://images.unsplash.com/photo-1556228578-0885c8b746d0?w=500&q=80", category_name: 'Chăm Sóc Cơ Thể',
        is_flash_deal: true, sold_count: 8500, brand_id: getBrandId('Cocoon')
      }
    ];

    const insertedProducts = await Product.insertMany([...perfumes, ...hairCares, ...skinCares, ...makeup, ...bodyCare]);

    console.log('5. Seeding Reviews...');
    await Review.create({
      user_id: customer._id,
      product_id: insertedProducts[1]._id, // Dior
      rating: 5,
      comment: "Mùi hương rất nam tính, lưu hương lâu. Giao hàng cực nhanh.",
      is_verified_purchase: true,
      image_urls: "https://images.unsplash.com/photo-1595532542520-50dce476c8c7?w=100&q=80"
    });

    console.log('6. Seeding Stores...');
    await Store.insertMany([
      { name: 'CN 1: 71 Hoàng Hoa Thám', address: '71 Hoàng Hoa Thám, P.13, Q. Tân Bình, TP. HCM', province: 'Hồ Chí Minh', district: 'Quận Tân Bình', type: 'Beauty - Clinic', lat: 10.7963, lng: 106.6433 },
      { name: 'CN 2: 555 Đường 3 Tháng 2', address: '555 Đường 3 Tháng 2, P.8, Q. 10, TP. HCM', province: 'Hồ Chí Minh', district: 'Quận 10', type: 'Beauty - Clinic - Lifestyle', lat: 10.7626, lng: 106.6601 }
    ]);

    console.log('7. Seeding Spa Services...');
    await SpaService.insertMany([
      { name: 'Gội đầu dưỡng sinh', category: 'Tóc', price: 150000, duration_minutes: 45, description: 'Thư giãn với liệu pháp bấm huyệt và thảo mộc.' },
      { name: 'Chăm sóc da mặt chuyên sâu', category: 'Mặt', price: 450000, duration_minutes: 75, description: 'Làm sạch sâu, cấp ẩm và trẻ hóa làn da.' }
    ]);

    console.log('8. Seeding Blogs...');
    await Blog.insertMany([
      { title: "Top 5 Nước Hoa Mùa Hè 2026", slug: "top-5-nuoc-hoa", content: "Khám phá top 5 mùi hương thanh mát...", thumbnail_url: IMG_CHANEL, author_id: admin._id, category: "Review" },
      { title: "Cách Phục Hồi Tóc Hư Tổn", slug: "phuc-hoi-toc", content: "Sử dụng dầu gội Keratin và dầu dưỡng...", thumbnail_url: IMG_KERASTASE, author_id: admin._id, category: "Chăm sóc tóc" }
    ]);

    console.log('--- MongoDB Seed Process Completed Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('!!! SEED ERROR !!!', err);
    process.exit(1);
  }
}

runSeed();
