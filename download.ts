import fs from 'fs';
import path from 'path';

const images = [
    { name: 'cat1.jpg', url: 'https://media.hsk.vn/catalog/product/k/e/kem-duong-la-roche-posay-giam-mun-ngua-vet-tham-effaclar-duo-m-40ml-4_img_380x380_f08620_fit_center.jpg' },
    { name: 'cat2.jpg', url: 'https://media.hsk.vn/catalog/product/1/9/190800164-1-6_img_380x380_f08620_fit_center.jpg' },
    { name: 'cat3.jpg', url: 'https://media.hsk.vn/catalog/product/7/7/771600008-2_img_380x380_f08620_fit_center.jpg' },
    { name: 'cat4.jpg', url: 'https://media.hsk.vn/catalog/product/1/6/160100062-1_img_380x380_f08620_fit_center.jpg' },
    { name: 'cat5.jpg', url: 'https://media.hsk.vn/catalog/product/9/6/960000018_1_img_380x380_f08620_fit_center.jpg' },
    { name: 'cat6.jpg', url: 'https://media.hsk.vn/catalog/product/9/6/960000010_1_img_380x380_f08620_fit_center.jpg' },
    { name: 'cat7.jpg', url: 'https://media.hsk.vn/catalog/product/o/x/oxy-n-6_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod1.jpg', url: 'https://media.hsk.vn/catalog/product/k/e/kem-duong-la-roche-posay-giam-mun-ngua-vet-tham-effaclar-duo-m-40ml-4_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod2.jpg', url: 'https://media.hsk.vn/catalog/product/9/6/960000018_1_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod3.jpg', url: 'https://media.hsk.vn/catalog/product/p/h/phan-nuoc-clio-kiem-dau-che-phu-nho-nang-tong-da-2-bp_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod4.jpg', url: 'https://media.hsk.vn/catalog/product/1/9/193200216_1_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod5.jpg', url: 'https://media.hsk.vn/catalog/product/1/9/190800164-1-6_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod6.jpg', url: 'https://media.hsk.vn/catalog/product/7/2/727900018_1_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod7.jpg', url: 'https://media.hsk.vn/catalog/product/7/7/771600008-2_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod8.jpg', url: 'https://media.hsk.vn/catalog/product/n/u/nuoc-tay-trang-l-oreal-paris-danh-cho-da-dau-hon-hop-400ml-1-2-1_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod9.jpg', url: 'https://media.hsk.vn/catalog/product/b/i/bioderma-sensibio-h2o-11_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod10.jpg', url: 'https://media.hsk.vn/catalog/product/s/e/serum-l-oreal-paris-glycolic-bright-sang-da-30ml-1-3_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod11.jpg', url: 'https://media.hsk.vn/catalog/product/v/i/vichy-ideal-soleil-mattifying-face-fluid-dry-touch-1_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod12.jpg', url: 'https://media.hsk.vn/catalog/product/k/l/klairs-supple-preparation-unscented-toner-1_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod13.jpg', url: 'https://media.hsk.vn/catalog/product/l/a/la-roche-posay-anthelios-uvmune-400-oil-control-gel-cream-1_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod14.jpg', url: 'https://media.hsk.vn/catalog/product/n/a/naruko-tea-tree-shine-control-blemish-clear-mask-1_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod15.jpg', url: 'https://media.hsk.vn/catalog/product/t/e/tesori-d-oriente-lotus-flower-1_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod16.jpg', url: 'https://media.hsk.vn/catalog/product/n/g/nguyen-xuan-bong-benh-1_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod17.jpg', url: 'https://media.hsk.vn/catalog/product/o/l/olay-b3-retinol-1_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod18.jpg', url: 'https://media.hsk.vn/catalog/product/b/a/balance-active-formula-vitamin-c-1_img_380x380_f08620_fit_center.jpg' },
    { name: 'prod19.jpg', url: 'https://media.hsk.vn/catalog/product/c/e/cerave-foaming-cleanser-1_img_380x380_f08620_fit_center.jpg' },
    { name: 'blog1.jpg', url: 'https://media.hsk.vn/catalog/product/7/3/732500006_1_img_380x380_f08620_fit_center.jpg' },
    { name: 'blog2.jpg', url: 'https://media.hsk.vn/catalog/product/9/6/960000018_1_img_380x380_f08620_fit_center.jpg' },
    { name: 'blog3.jpg', url: 'https://media.hsk.vn/catalog/product/n/u/nuoc-tay-trang-l-oreal-paris-danh-cho-da-dau-hon-hop-400ml-1-2-1_img_380x380_f08620_fit_center.jpg' },
    { name: 'blog4.jpg', url: 'https://media.hsk.vn/catalog/product/p/h/phan-nuoc-clio-kiem-dau-che-phu-nho-nang-tong-da-2-bp_img_380x380_f08620_fit_center.jpg' },
    { name: 'blog5.jpg', url: 'https://media.hsk.vn/catalog/product/k/e/kem-chong-nang-skin1004-chiet-xuat-rau-ma-spf50-pa-50ml-1-4-1_img_380x380_f08620_fit_center.jpg' },
    { name: 'blog6.jpg', url: 'https://media.hsk.vn/catalog/product/7/2/727900018_1_img_380x380_f08620_fit_center.jpg' }
];

async function downloadImages() {
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }

    for (const img of images) {
        try {
            console.log(`Downloading ${img.url}...`);
            const res = await fetch(img.url, {
                headers: {
                    'Referer': 'https://hasaki.vn/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            });
            if (!res.ok) throw new Error(`Status: ${res.status}`);
            const buffer = await res.arrayBuffer();
            fs.writeFileSync(path.join(imagesDir, img.name), Buffer.from(buffer));
            console.log(`Saved ${img.name}`);
        } catch (e: any) {
            console.error(`Error downloading ${img.url}: ${e.message}`);
        }
    }
}

downloadImages();
