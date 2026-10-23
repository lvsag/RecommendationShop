import neo4j, { Driver } from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'recommendation123';
const database = process.env.NEO4J_DATABASE || 'neo4j';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// 1. DANH MỤC (6 Categories)
const categories = [
  { id: 'CAT-TECH', name: 'Công nghệ & Điện tử', icon: '💻' },
  { id: 'CAT-FASHION', name: 'Thời trang & Phụ kiện', icon: '👕' },
  { id: 'CAT-HOME', name: 'Gia dụng & Đời sống', icon: '🏠' },
  { id: 'CAT-BOOKS', name: 'Sách & Tri thức', icon: '📚' },
  { id: 'CAT-BEAUTY', name: 'Mỹ phẩm & Chăm sóc da', icon: '💄' },
  { id: 'CAT-SPORTS', name: 'Thể thao & Dã ngoại', icon: '⚽' },
];

// 2. TẠO 108 SẢN PHẨM CHUẨN SHOPEE (18 sản phẩm / danh mục x 6 danh mục)
const generateProducts = () => {
  const products: any[] = [];

  // Danh mục 1: Công nghệ (TECH) - 18 sản phẩm
  const techItems = [
    { name: 'Điện thoại Apple iPhone 15 Pro Max 256GB Titan Tự Nhiên', price: 29990000, orig: 34990000, img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600' },
    { name: 'Laptop Apple MacBook Pro 14 M3 Pro 18GB/512GB Space Black', price: 48990000, orig: 52990000, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600' },
    { name: 'Tai nghe Bluetooth Apple AirPods Pro 2 MagSafe (USB-C)', price: 5490000, orig: 6290000, img: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600' },
    { name: 'Đồng hồ thông minh Apple Watch Ultra 2 GPS + Cellular 49mm', price: 19990000, orig: 21990000, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
    { name: 'Củ sạc nhanh Anker 735 GaNPrime 65W 3 cổng sạc laptop/điện thoại', price: 890000, orig: 1250000, img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600' },
    { name: 'Bàn phím cơ không dây Keychron K2 Pro QMK/VIA Switch Gateron Pro', price: 2190000, orig: 2650000, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600' },
    { name: 'Chuột không dây Logitech MX Master 3S For Mac / Windows', price: 2290000, orig: 2690000, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600' },
    { name: 'Màn hình đồ họa Dell UltraSharp U2723QE 27 inch 4K IPS Black', price: 12900000, orig: 14500000, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600' },
    { name: 'Máy tính bảng iPad Air 5 M1 64GB WiFi Chính Hãng Apple', price: 13490000, orig: 15990000, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600' },
    { name: 'Bút cảm ứng Apple Pencil 2 cho iPad Pro / iPad Air', price: 2790000, orig: 3390000, img: 'https://images.unsplash.com/photo-1585336261026-c56a8ee52bb8?w=600' },
    { name: 'Loa Bluetooth Marshall Emberton II Chính Hãng Âm Thanh Đỉnh Cao', price: 3690000, orig: 4290000, img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600' },
    { name: 'Ổ cứng SSD di động Samsung T7 Shield 1TB USB 3.2 Gen 2 Chống Nước', price: 2450000, orig: 2990000, img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600' },
    { name: 'Webcam Logitech Brio 4K Ultra HD Tích Hợp Mic Khử Ồn', price: 3890000, orig: 4590000, img: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=600' },
    { name: 'Giá đỡ laptop hợp kim nhôm xoay 360 độ công thái học cao cấp', price: 350000, orig: 550000, img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600' },
    { name: 'Cáp sạc Type-C to Lightning / Type-C Baseus bọc dù siêu bền 100W', price: 129000, orig: 210000, img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600' },
    { name: 'Pin sạc dự phòng không dây Magsafe Baseus 10000mAh 20W', price: 590000, orig: 850000, img: 'https://images.unsplash.com/photo-1609592424369-0cf3b1e326b9?w=600' },
    { name: 'Tay cầm chơi game Sony DualSense Wireless Controller PS5', price: 1690000, orig: 1990000, img: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600' },
    { name: 'Hub chuyển đổi đa năng Type-C 8 in 1 Ugreen HDMI 4K LAN 1000M', price: 790000, orig: 1150000, img: 'https://images.unsplash.com/photo-1622445262464-84b14e4b757d?w=600' },
  ];
  techItems.forEach((item, idx) => {
    products.push({
      id: `PROD-TECH-${String(idx + 1).padStart(3, '0')}`,
      name: item.name,
      price: item.price,
      originalPrice: item.orig,
      discountPercent: Math.round(((item.orig - item.price) / item.orig) * 100),
      imageUrl: item.img,
      rating: +(4.5 + Math.random() * 0.5).toFixed(1),
      soldCount: Math.floor(120 + Math.random() * 850),
      categoryId: 'CAT-TECH',
      description: `Sản phẩm chính hãng với bảo hành 12 tháng. Phân phối chính hãng.`,
    });
  });

  // Danh mục 2: Thời trang (FASHION) - 18 sản phẩm
  const fashionItems = [
    { name: 'Áo thun Unisex Local Brand Oversize Cotton 100% 250gsm Dày Dặn', price: 189000, orig: 290000, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600' },
    { name: 'Quần Jeans Nam Ống Suông Rộng Phong Cách Vintage Denim Cao Cấp', price: 349000, orig: 490000, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600' },
    { name: 'Giày Thể Thao Sneaker Nike Air Force 1 07 All White Cổ Thấp', price: 2890000, orig: 3200000, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600' },
    { name: 'Giày Chạy Bộ Sneaker Adidas Ultraboost Light Siêu Êm Siêu Nhẹ', price: 3450000, orig: 4200000, img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600' },
    { name: 'Áo Khoác Bomber Unisex Nam Nữ Lót Dù Hai Lớp Chống Gió Thời Thượng', price: 320000, orig: 480000, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600' },
    { name: 'Balo Đi Học Thời Trang Chống Nước Ngăn Chứa Laptop 15.6 inch', price: 280000, orig: 420000, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600' },
    { name: 'Ví Da Nam Dáng Ngang Da Bò Thật Cao Cấp Nhỏ Gọn Đựng Thẻ', price: 249000, orig: 390000, img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600' },
    { name: 'Thắt Lưng Nam Khóa Tự Động Hợp Kim Da Bò Nguyên Tấm Công Sở', price: 199000, orig: 320000, img: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600' },
    { name: 'Mũ Lưỡi Trai Nón Kết NY Thêu Nổi Cotton Hàn Quốc Năng Động', price: 89000, orig: 150000, img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600' },
    { name: 'Kính Mát Thời Trang Gọng Vuông Chống Tia UV400 Nam Nữ Unisex', price: 159000, orig: 260000, img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600' },
    { name: 'Tất Vớ Cổ Cao Trắng Dệt Kim Khử Mùi Thoáng Khí Hộp 5 Đôi', price: 69000, orig: 110000, img: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600' },
    { name: 'Áo Polo Nam Vải Pique Co Giãn Thoáng Mát Phối Viền Cổ Lịch Lãm', price: 219000, orig: 350000, img: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600' },
    { name: 'Quần Short Kaki Nam Túi Hộp Co Giãn Năng Động Mùa Hè', price: 179000, orig: 260000, img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600' },
    { name: 'Áo Hoodie Nỉ Bông Unisex Form Rộng Dày Ấm Áp In Hình Họa Tiết', price: 299000, orig: 450000, img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600' },
    { name: 'Túi Đeo Chéo Canvas Mini Chống Thấm Đựng Điện Thoại Tiện Lợi', price: 129000, orig: 199000, img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600' },
    { name: 'Đầm Nữ Dáng Xòe Voan Hoa Nhí Cổ Vuông Tiểu Thư Thanh Lịch', price: 269000, orig: 399000, img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600' },
    { name: 'Chân Váy Chữ A Công Sở Lưng Cao Tôn Dáng Kèm Quần Trong', price: 189000, orig: 280000, img: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600' },
    { name: 'Giày Cao Gót Mũi Nhọn Quai Mảnh 7cm Da Mềm Thời Trang Công Sở', price: 320000, orig: 480000, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600' },
  ];
  fashionItems.forEach((item, idx) => {
    products.push({
      id: `PROD-FASH-${String(idx + 1).padStart(3, '0')}`,
      name: item.name,
      price: item.price,
      originalPrice: item.orig,
      discountPercent: Math.round(((item.orig - item.price) / item.orig) * 100),
      imageUrl: item.img,
      rating: +(4.4 + Math.random() * 0.6).toFixed(1),
      soldCount: Math.floor(250 + Math.random() * 1200),
      categoryId: 'CAT-FASHION',
      description: `Thời trang thiết kế hiện đại, chất liệu bền bỉ và form dáng chuẩn chuẩn xuất khẩu.`,
    });
  });

  // Danh mục 3: Gia dụng (HOME) - 18 sản phẩm
  const homeItems = [
    { name: 'Nồi chiên không dầu điện tử Philips HD9252/90 4.1 Lít Công Nghệ Rapid Air', price: 1890000, orig: 2790000, img: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600' },
    { name: 'Robot hút bụi lau nhà thông minh Dreame D9 Max Lực Hút 4000Pa', price: 5490000, orig: 7290000, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600' },
    { name: 'Máy lọc không khí Xiaomi Smart Air Purifier 4 Compact Lõi Lọc HEPA', price: 1790000, orig: 2490000, img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600' },
    { name: 'Máy ép chậm trái cây Hurom H300E Ép Kiệt Bã Giữ Trọn Dưỡng Chất', price: 7990000, orig: 9900000, img: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=600' },
    { name: 'Bộ dao làm bếp 6 món inox Nhật Bản cao cấp phủ chống dính kháng khuẩn', price: 420000, orig: 690000, img: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600' },
    { name: 'Chảo chống dính Tefal So Chef 28cm Đáy Từ Báo Nhiệt Thermo-Spot', price: 520000, orig: 750000, img: 'https://images.unsplash.com/photo-1584990347449-399622956cfb?w=600' },
    { name: 'Bình giữ nhiệt Lock&Lock Energetic One Touch 550ml Inox 316', price: 299000, orig: 450000, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600' },
    { name: 'Máy xay sinh tố cầm tay mini sạc pin USB 6 lưỡi dao sắc bén', price: 169000, orig: 280000, img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600' },
    { name: 'Quạt đứng thông minh Xiaomi Smart Fan 2 Lite 7 cánh gió tự nhiên', price: 890000, orig: 1290000, img: 'https://images.unsplash.com/photo-1618941716939-553df3c6c278?w=600' },
    { name: 'Ấm đun nước siêu tốc thủy tinh Lock&Lock 1.8L Đèn LED Hiện Đại', price: 380000, orig: 590000, img: 'https://images.unsplash.com/photo-1594213114663-d94db9b17125?w=600' },
    { name: 'Kệ để gia vị nhà bếp 2 tầng thép carbon sơn tĩnh điện chịu lực', price: 199000, orig: 320000, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
    { name: 'Hộp cơm cắm điện hâm nóng 3 tầng inox Bear Tự Ngắt An Toàn', price: 340000, orig: 490000, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600' },
    { name: 'Bộ nồi inox 5 đáy Sunhouse SH781 Nắp Kính Cường Lực Sang Trọng', price: 790000, orig: 1190000, img: 'https://images.unsplash.com/photo-1584990347449-399622956cfb?w=600' },
    { name: 'Đèn bàn học chống cận thị LED Rạng Đông 6W Cảm Ứng Đổi 3 Màu', price: 210000, orig: 310000, img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600' },
    { name: 'Thảm lau chân nhà tắm san hô siêu thấm hút nước chống trượt', price: 49000, orig: 89000, img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600' },
    { name: 'Cây lau nhà tự vắt thông minh chổi chữ nhật xoay 360 độ kèm 2 bông', price: 159000, orig: 250000, img: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600' },
    { name: 'Thùng rác thông minh cảm ứng tự động đóng mở nắp 14L chống mùi', price: 289000, orig: 420000, img: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600' },
    { name: 'Gối công thái học cao su non định hình cổ vai gáy ngủ ngon giấc', price: 249000, orig: 390000, img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600' },
  ];
  homeItems.forEach((item, idx) => {
    products.push({
      id: `PROD-HOME-${String(idx + 1).padStart(3, '0')}`,
      name: item.name,
      price: item.price,
      originalPrice: item.orig,
      discountPercent: Math.round(((item.orig - item.price) / item.orig) * 100),
      imageUrl: item.img,
      rating: +(4.6 + Math.random() * 0.4).toFixed(1),
      soldCount: Math.floor(180 + Math.random() * 950),
      categoryId: 'CAT-HOME',
      description: `Đồ gia dụng thông minh cho không gian sống hiện đại, tiện nghi và tiết kiệm điện năng.`,
    });
  });

  // Danh mục 4: Sách (BOOKS) - 18 sản phẩm
  const bookItems = [
    { name: 'Sách Đắc Nhân Tâm (Khổ Lớn Tái Bản Mới) - Dale Carnegie', price: 78000, orig: 110000, img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600' },
    { name: 'Sách Nhà Giả Kim - Paulo Coelho (Bản Dịch Chuẩn Nhất)', price: 69000, orig: 89000, img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600' },
    { name: 'Sách Tâm Lý Học Về Tiền - Morgan Housel (Bìa Mềm)', price: 135000, orig: 189000, img: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600' },
    { name: 'Sách Atomic Habits - Thay Đổi Tí Hon Hiệu Quả Bất Ngờ', price: 149000, orig: 209000, img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600' },
    { name: 'Sách Clean Code: A Handbook of Agile Software Craftsmanship', price: 380000, orig: 490000, img: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600' },
    { name: 'Sách Designing Data-Intensive Applications (Bản Tiếng Anh Chuẩn O\'Reilly)', price: 750000, orig: 920000, img: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600' },
    { name: 'Sách Tư Duy Nhanh Và Chậm - Daniel Kahneman (Giải Nobel Kinh Tế)', price: 175000, orig: 249000, img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600' },
    { name: 'Sách Muôn Kiếp Nhân Sinh Tập 1 & 2 - Nguyên Phong Trọn Bộ', price: 280000, orig: 360000, img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600' },
    { name: 'Sách Cây Cam Ngọt Của Tôi - José Mauro de Vasconcelos', price: 85000, orig: 108000, img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600' },
    { name: 'Sách Cha Giàu Cha Nghèo (Dạy Con Làm Giàu Tập 1) - Robert Kiyosaki', price: 92000, orig: 125000, img: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600' },
    { name: 'Sách Nghĩ Giàu Làm Giàu (Think and Grow Rich) - Napoleon Hill', price: 88000, orig: 120000, img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600' },
    { name: 'Sách Lược Sử Loài Người (Sapiens) - Yuval Noah Harari', price: 199000, orig: 265000, img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600' },
    { name: 'Sách Tuổi Trẻ Đáng Giá Bao Nhiêu - Rosie Nguyễn Tái Bản Mới', price: 68000, orig: 95000, img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600' },
    { name: 'Sách Khởi Nghiệp Tinh Gọn (The Lean Startup) - Eric Ries', price: 139000, orig: 185000, img: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600' },
    { name: 'Sách Chủ Nghĩa Khắc Kỷ - Phong Cách Sống Bản Lĩnh', price: 110000, orig: 155000, img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600' },
    { name: 'Sách Tinh Hoa Trí Tuệ Do Thái - Eran Katz', price: 98000, orig: 135000, img: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600' },
    { name: 'Sách Sức Mạnh Của Hiện Tại - Eckhart Tolle', price: 120000, orig: 165000, img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600' },
    { name: 'Sách Bắt Trẻ Đồng Xanh - J.D. Salinger', price: 79000, orig: 105000, img: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600' },
  ];
  bookItems.forEach((item, idx) => {
    products.push({
      id: `PROD-BOOK-${String(idx + 1).padStart(3, '0')}`,
      name: item.name,
      price: item.price,
      originalPrice: item.orig,
      discountPercent: Math.round(((item.orig - item.price) / item.orig) * 100),
      imageUrl: item.img,
      rating: +(4.7 + Math.random() * 0.3).toFixed(1),
      soldCount: Math.floor(300 + Math.random() * 2000),
      categoryId: 'CAT-BOOKS',
      description: `Sách chính hãng từ nhà xuất bản uy tín, in ấn sắc nét, giấy vàng bảo vệ thị lực.`,
    });
  });

  // Danh mục 5: Mỹ phẩm (BEAUTY) - 18 sản phẩm
  const beautyItems = [
    { name: 'Serum Dưỡng Ẩm Phục Hồi Da The Ordinary Hyaluronic Acid 2% + B5 30ml', price: 219000, orig: 290000, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600' },
    { name: 'Kem Chống Nắng Kiểm Soát Dầu La Roche-Posay Anthelios XL Gel-Cream 50ml', price: 389000, orig: 495000, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600' },
    { name: 'Nước Tẩy Trang Dịu Nhẹ Bioderma Sensibio H2O Hồng 500ml Cho Da Nhạy Cảm', price: 360000, orig: 485000, img: 'https://images.unsplash.com/photo-1556228722-d0b7132145e5?w=600' },
    { name: 'Son Thỏi Lì MAC Matte Lipstick Màu Đỏ Thuần Ruby Woo Sang Chảnh', price: 540000, orig: 680000, img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600' },
    { name: 'Sữa Rửa Mặt CeraVe Foaming Facial Cleanser Cho Da Thường Đến Dầu 473ml', price: 349000, orig: 450000, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600' },
    { name: 'Kem Dưỡng Ẩm Chuyên Sâu Klairs Midnight Blue Calming Cream 30ml', price: 295000, orig: 390000, img: 'https://images.unsplash.com/photo-1608248597359-0097f4c71881?w=600' },
    { name: 'Mặt Nạ Ngủ Môi Cấp Ẩm Laneige Lip Sleeping Mask Berry 20g', price: 260000, orig: 350000, img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600' },
    { name: 'Nước Hoa Hồng Toner Tràm Trà Trị Mụn Some By Mi AHA-BHA-PHA 30 Days 150ml', price: 235000, orig: 320000, img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600' },
    { name: 'Phấn Nước Cushion Che Phủ Tự Nhiên Missha M Magic Cushion SPF50+ 15g', price: 189000, orig: 260000, img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600' },
    { name: 'Chì Kẻ Mày Hai Đầu Innisfree Auto Eyebrow Pencil Nét Mảnh Tự Nhiên', price: 69000, orig: 110000, img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600' },
    { name: 'Mascara Dài Mi Chống Nước Maybelline Lash Sensational Sky High 7.2ml', price: 175000, orig: 240000, img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600' },
    { name: 'Tinh Chất Giảm Mụn Niacinamide 10% + Zinc 1% The Ordinary 30ml', price: 199000, orig: 270000, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600' },
    { name: 'Xịt Khoáng Dưỡng Ẩm Làm Dịu Da Avene Thermal Spring Water 300ml', price: 290000, orig: 380000, img: 'https://images.unsplash.com/photo-1556228722-d0b7132145e5?w=600' },
    { name: 'Kem Dưỡng Trắng Da Mờ Thâm Nám Melano CC Moisture Cream 23g', price: 220000, orig: 295000, img: 'https://images.unsplash.com/photo-1608248597359-0097f4c71881?w=600' },
    { name: 'Tẩy Tế Bào Chết Hóa Học Paula\'s Choice Skin Perfecting 2% BHA Liquid 118ml', price: 790000, orig: 990000, img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600' },
    { name: 'Kem Lót Kiềm Dầu Mịn Màng Maybelline Baby Skin Pore Eraser 22ml', price: 145000, orig: 195000, img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600' },
    { name: 'Bông Tẩy Trang Silcot Nhật Bản Hộp 82 Miếng Mềm Mại Không Xơ Bông', price: 38000, orig: 55000, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600' },
    { name: 'Nước Hoa Nữ Dior Miss Dior Blooming Bouquet Eau De Toilette 50ml', price: 2450000, orig: 2950000, img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600' },
  ];
  beautyItems.forEach((item, idx) => {
    products.push({
      id: `PROD-BEAU-${String(idx + 1).padStart(3, '0')}`,
      name: item.name,
      price: item.price,
      originalPrice: item.orig,
      discountPercent: Math.round(((item.orig - item.price) / item.orig) * 100),
      imageUrl: item.img,
      rating: +(4.6 + Math.random() * 0.4).toFixed(1),
      soldCount: Math.floor(400 + Math.random() * 3200),
      categoryId: 'CAT-BEAUTY',
      description: `Mỹ phẩm chính hãng 100%, có tem phụ và nguồn gốc xuất xứ rõ ràng.`,
    });
  });

  // Danh mục 6: Thể thao (SPORTS) - 18 sản phẩm
  const sportsItems = [
    { name: 'Thảm Tập Yoga Cao Cấp TPE 2 Lớp Định Tuyến Chống Trơn Trượt 6mm', price: 219000, orig: 320000, img: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600' },
    { name: 'Bình Nước Giữ Nhiệt Thể Thao Lock&Lock Có Quai Xách Dung Tích 1000ml', price: 320000, orig: 460000, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600' },
    { name: 'Giày Chạy Bộ Nam Nike Air Zoom Pegasus 40 Êm Ái Nhẹ Bền Bỉ', price: 2790000, orig: 3490000, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
    { name: 'Vợt Cầu Lông Yonex Astrox 77 Play Đan Sẵn Cước 10.5kg Kèm Bao Vợt', price: 990000, orig: 1350000, img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600' },
    { name: 'Bộ Tạ Tay Đa Năng Tháo Lắp 20kg Bọc Cao Su Tập Thể Hình Tại Nhà', price: 580000, orig: 850000, img: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600' },
    { name: 'Lều Cắm Trại Dã Ngoại 4 Người Bật Tự Động Chống Mưa Chống Côn Trùng', price: 650000, orig: 990000, img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600' },
    { name: 'Dây Nhảy Thể Dục Tốc Độ Thép Bọc Nhựa Chống Rối Có Bộ Đếm Số Vòng', price: 69000, orig: 110000, img: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600' },
    { name: 'Băng Cuốn Bảo Vệ Khớp Cổ Tay Tập Gym Chống Chấn Thương Co Giãn', price: 49000, orig: 80000, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600' },
    { name: 'Đồng Hồ Đo Nhịp Tim Đo Calo Tập Luyện Garmin Forerunner 55', price: 4690000, orig: 5290000, img: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600' },
    { name: 'Túi Trống Thể Thao Tập Gym Chống Nước Có Ngăn Để Giày Riêng Biệt', price: 189000, orig: 290000, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600' },
    { name: 'Bộ Quần Áo Đá Bóng Câu Lạc Bộ Vải Mè Thái Thoáng Khí Thấm Hút Mồ Hôi', price: 149000, orig: 220000, img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600' },
    { name: 'Bóng Đá Tiêu Chuẩn FIFA Số 5 Động Lực UHV 2.05 Da PU Cao Cấp', price: 340000, orig: 480000, img: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600' },
    { name: 'Gậy Leo Núi Dã Ngoại Hợp Kim Nhôm Gấp Gọn Giảm Xóc', price: 160000, orig: 240000, img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600' },
    { name: 'Kính Bơi Chống Đọng Sương Chống Tia UV View Blade V121 Phản Quang', price: 390000, orig: 520000, img: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600' },
    { name: 'Bàn Đạp Xe Đạp Đua Shimano Nhôm Nguyên Khối Bền Bỉ', price: 420000, orig: 590000, img: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600' },
    { name: 'Bộ 5 Dây Kháng Lực Đàn Hồi Mini Band Tập Mông Đùi Săn Chắc', price: 89000, orig: 145000, img: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600' },
    { name: 'Đèn Pin Đội Đầu Siêu Sáng Chiếu Xa 300m Chống Nước Đi Rừng Cắm Trại', price: 135000, orig: 210000, img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600' },
    { name: 'Con Lăn Tập Cơ Bụng 4 Bánh Kèm Thảm Lót Gối Chống Trượt', price: 179000, orig: 270000, img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600' },
  ];
  sportsItems.forEach((item, idx) => {
    products.push({
      id: `PROD-SPRT-${String(idx + 1).padStart(3, '0')}`,
      name: item.name,
      price: item.price,
      originalPrice: item.orig,
      discountPercent: Math.round(((item.orig - item.price) / item.orig) * 100),
      imageUrl: item.img,
      rating: +(4.5 + Math.random() * 0.5).toFixed(1),
      soldCount: Math.floor(150 + Math.random() * 800),
      categoryId: 'CAT-SPORTS',
      description: `Dụng cụ thể thao chính hãng chất lượng cao hỗ trợ rèn luyện thể chất dẻo dai.`,
    });
  });

  return products;
};

// 3. TẠO 50 KHÁCH HÀNG (>= 50 Customers)
const vietnameseNames = [
  'Nguyễn Văn An', 'Trần Thị Mai', 'Lê Hoàng Nam', 'Phạm Minh Tuấn (Cold-Start)', 'Hoàng Thu Thảo',
  'Vũ Đức Huy', 'Đặng Phương Linh', 'Bùi Quốc Anh', 'Đỗ Thùy Trang', 'Hồ Hải Đăng',
  'Ngô Bảo Châu', 'Dương Gia Hân', 'Lý Quang Diệu', 'Trịnh Cẩm Tú', 'Mai Tiến Đạt',
  'Phan Thanh Tùng', 'Võ Hoài An', 'Lương Bích Hữu', 'Tạ Đình Phong', 'Cao Thái Sơn',
  'Đinh Tiến Dũng', 'Lâm Khánh Chi', 'Tô Ánh Nguyệt', 'Hà Anh Tuấn', 'Trương Tri Trúc Diễm',
  'Chu Văn An', 'Lê Lợi', 'Nguyễn Trãi', 'Trần Hưng Đạo', 'Phan Bội Châu',
  'Võ Thị Sáu', 'Nguyễn Thị Minh Khai', 'Kim Đồng', 'Lê Văn Tám', 'Bế Văn Đàn',
  'Tô Vĩnh Diện', 'La Văn Cầu', 'Cù Chính Lan', 'Phan Đình Giót', 'Nguyễn Viết Xuân',
  'Lý Tự Trọng', 'Võ Văn Kiệt', 'Phạm Văn Đồng', 'Trường Chinh', 'Văn Tiến Dũng',
  'Hoàng Hoa Thám', 'Nguyễn Thái Học', 'Trần Phú', 'Lê Hồng Phong', 'Nguyễn Văn Cừ'
];

const generateCustomers = () => {
  return vietnameseNames.map((name, idx) => {
    const id = `CUST-${String(idx + 1).padStart(3, '0')}`;
    return {
      id,
      name,
      email: `customer${idx + 1}@gmail.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}&backgroundColor=ffdfbf,ffd5dc,d1d4f9,c0aede,b6e3f4`,
      phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
      address: `Quận ${1 + (idx % 12)}, TP. Hồ Chí Minh`,
    };
  });
};

// 4. TẠO >= 350 QUAN HỆ BẰNG CO-PURCHASE CLUSTERS
const generateRelationships = (products: any[], customers: any[]) => {
  const relations: { customerId: string; productId: string; type: 'BOUGHT' | 'VIEWED'; timestamp: number }[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Lọc sản phẩm theo Category để tạo cụm liên kết chặt chẽ
  const techProds = products.filter((p) => p.categoryId === 'CAT-TECH');
  const fashionProds = products.filter((p) => p.categoryId === 'CAT-FASHION');
  const homeProds = products.filter((p) => p.categoryId === 'CAT-HOME');
  const bookProds = products.filter((p) => p.categoryId === 'CAT-BOOKS');
  const beautyProds = products.filter((p) => p.categoryId === 'CAT-BEAUTY');
  const sportProds = products.filter((p) => p.categoryId === 'CAT-SPORTS');

  // Customer CUST-004 là Cold-start: KHÔNG tạo quan hệ nào!
  // Customer CUST-001 (Nguyễn Văn An): Người nghiện Tech
  // CUST-001 đã MUA: iPhone 15, MacBook Pro M3; đã XEM: AirPods Pro 2, Sạc Anker 65W
  relations.push(
    { customerId: 'CUST-001', productId: techProds[0].id, type: 'BOUGHT', timestamp: now - 10 * dayMs },
    { customerId: 'CUST-001', productId: techProds[1].id, type: 'BOUGHT', timestamp: now - 8 * dayMs },
    { customerId: 'CUST-001', productId: techProds[2].id, type: 'VIEWED', timestamp: now - 2 * dayMs },
    { customerId: 'CUST-001', productId: techProds[4].id, type: 'VIEWED', timestamp: now - 1 * dayMs },
    { customerId: 'CUST-001', productId: bookProds[4].id, type: 'BOUGHT', timestamp: now - 15 * dayMs } // Clean Code
  );

  // Nhóm bạn Tech chung với CUST-001: CUST-005, CUST-009, CUST-012, CUST-017, CUST-021, CUST-025, CUST-030
  // Cùng mua iPhone 15 hoặc MacBook Pro, và ĐỒNG THỜI mua thêm AirPods Pro 2, Apple Watch Ultra 2, Chuột Logitech MX Master 3S, Keychron K2 Pro!
  const techCoBuyers = ['CUST-005', 'CUST-009', 'CUST-012', 'CUST-017', 'CUST-021', 'CUST-025', 'CUST-030', 'CUST-035', 'CUST-040'];
  techCoBuyers.forEach((cId, i) => {
    // Mua chung p1 với CUST-001:
    relations.push({ customerId: cId, productId: techProds[0].id, type: 'BOUGHT', timestamp: now - (15 + i) * dayMs });
    if (i % 2 === 0) {
      relations.push({ customerId: cId, productId: techProds[1].id, type: 'BOUGHT', timestamp: now - (12 + i) * dayMs });
    }
    // Mua các sản phẩm phụ kiện p2 liên quan:
    relations.push({ customerId: cId, productId: techProds[2].id, type: 'BOUGHT', timestamp: now - (5 + i) * dayMs }); // AirPods Pro 2
    relations.push({ customerId: cId, productId: techProds[5].id, type: 'BOUGHT', timestamp: now - (4 + i) * dayMs }); // Keychron
    relations.push({ customerId: cId, productId: techProds[6].id, type: 'BOUGHT', timestamp: now - (3 + i) * dayMs }); // Logitech MX Master
    relations.push({ customerId: cId, productId: techProds[3].id, type: 'VIEWED', timestamp: now - (2 + i) * dayMs }); // Apple Watch
    relations.push({ customerId: cId, productId: techProds[7].id, type: 'VIEWED', timestamp: now - (1 + i) * dayMs }); // Dell Ultrasharp
  });

  // Customer CUST-002 (Trần Thị Mai): Tín đồ Skincare & Beauty
  // Đã mua: Serum B5, Kem chống nắng La Roche-Posay; Đã xem: Nước tẩy trang Bioderma
  relations.push(
    { customerId: 'CUST-002', productId: beautyProds[0].id, type: 'BOUGHT', timestamp: now - 7 * dayMs },
    { customerId: 'CUST-002', productId: beautyProds[1].id, type: 'BOUGHT', timestamp: now - 5 * dayMs },
    { customerId: 'CUST-002', productId: beautyProds[2].id, type: 'VIEWED', timestamp: now - 1 * dayMs }
  );

  // Nhóm Beauty cùng gu: CUST-006, CUST-010, CUST-015, CUST-022, CUST-028, CUST-033, CUST-038
  const beautyCoBuyers = ['CUST-006', 'CUST-010', 'CUST-015', 'CUST-022', 'CUST-028', 'CUST-033', 'CUST-038'];
  beautyCoBuyers.forEach((cId, i) => {
    relations.push({ customerId: cId, productId: beautyProds[0].id, type: 'BOUGHT', timestamp: now - (10 + i) * dayMs });
    relations.push({ customerId: cId, productId: beautyProds[1].id, type: 'BOUGHT', timestamp: now - (8 + i) * dayMs });
    // Mua sản phẩm p2:
    relations.push({ customerId: cId, productId: beautyProds[3].id, type: 'BOUGHT', timestamp: now - (4 + i) * dayMs }); // Son MAC Ruby Woo
    relations.push({ customerId: cId, productId: beautyProds[4].id, type: 'BOUGHT', timestamp: now - (3 + i) * dayMs }); // Sữa rửa mặt CeraVe
    relations.push({ customerId: cId, productId: beautyProds[6].id, type: 'VIEWED', timestamp: now - (2 + i) * dayMs }); // Mặt nạ ngủ môi Laneige
  });

  // Customer CUST-003 (Lê Hoàng Nam): Gymer & Yêu thể thao
  relations.push(
    { customerId: 'CUST-003', productId: sportProds[0].id, type: 'BOUGHT', timestamp: now - 9 * dayMs },
    { customerId: 'CUST-003', productId: sportProds[2].id, type: 'BOUGHT', timestamp: now - 6 * dayMs }
  );
  const sportCoBuyers = ['CUST-007', 'CUST-014', 'CUST-019', 'CUST-026', 'CUST-031', 'CUST-036', 'CUST-042'];
  sportCoBuyers.forEach((cId, i) => {
    relations.push({ customerId: cId, productId: sportProds[0].id, type: 'BOUGHT', timestamp: now - (11 + i) * dayMs });
    relations.push({ customerId: cId, productId: sportProds[2].id, type: 'BOUGHT', timestamp: now - (9 + i) * dayMs });
    relations.push({ customerId: cId, productId: sportProds[1].id, type: 'BOUGHT', timestamp: now - (5 + i) * dayMs }); // Bình Lock&Lock
    relations.push({ customerId: cId, productId: sportProds[4].id, type: 'BOUGHT', timestamp: now - (3 + i) * dayMs }); // Bộ Tạ Tay
    relations.push({ customerId: cId, productId: sportProds[8].id, type: 'VIEWED', timestamp: now - (1 + i) * dayMs }); // Garmin
  });

  // Sinh thêm các hành vi cho các khách hàng còn lại (CUST-008 đến CUST-050, trừ CUST-004)
  customers.forEach((cust) => {
    if (cust.id === 'CUST-004') return; // Cold start

    // Mỗi khách hàng có từ 4 đến 8 tương tác ngẫu nhiên
    const count = 4 + Math.floor(Math.random() * 5);
    for (let j = 0; j < count; j++) {
      const randProd = products[Math.floor(Math.random() * products.length)];
      const type = Math.random() > 0.4 ? 'BOUGHT' : 'VIEWED';
      const timestamp = now - Math.floor(Math.random() * 30 * dayMs);

      // Tránh trùng lặp quan hệ cùng loại trong batch
      const exists = relations.some(
        (r) => r.customerId === cust.id && r.productId === randProd.id && r.type === type
      );
      if (!exists) {
        relations.push({
          customerId: cust.id,
          productId: randProd.id,
          type,
          timestamp,
        });
      }
    }
  });

  return relations;
};

// 5. HÀM CHÍNH SEED DỮ LIỆU
export async function runSeed(customDriver?: Driver) {
  const activeDriver = customDriver || driver;
  const shouldCloseDriver = !customDriver;
  const session = activeDriver.session({ database });

  try {
    console.log('🚀 Bắt đầu quá trình Khởi tạo và Nạp Dữ liệu Mẫu (Seed Data) vào Neo4j...');

    // 1. Dọn dẹp dữ liệu cũ (Xóa toàn bộ đồ thị trước khi seed)
    console.log('🧹 Đang dọn dẹp các node và quan hệ cũ...');
    await session.run('MATCH (n) DETACH DELETE n');

    // 2. Tạo Constraints và Indexes
    console.log('⚙️  Đang tạo Unique Constraints và Indexes...');
    await session.run(`
      CREATE CONSTRAINT constraint_customer_id IF NOT EXISTS
      FOR (c:Customer) REQUIRE c.id IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT constraint_product_id IF NOT EXISTS
      FOR (p:Product) REQUIRE p.id IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT constraint_category_id IF NOT EXISTS
      FOR (cat:Category) REQUIRE cat.id IS UNIQUE
    `);
    await session.run(`
      CREATE INDEX index_product_name IF NOT EXISTS
      FOR (p:Product) ON (p.name)
    `);
    await session.run(`
      CREATE INDEX index_product_price IF NOT EXISTS
      FOR (p:Product) ON (p.price)
    `);

    // 3. Nạp Danh mục
    console.log(`📦 Đang tạo ${categories.length} Danh mục sản phẩm...`);
    for (const cat of categories) {
      await session.run(
        `MERGE (c:Category {id: $id}) SET c.name = $name, c.icon = $icon`,
        cat
      );
    }

    // 4. Nạp Sản phẩm
    const products = generateProducts();
    console.log(`🏷️  Đang tạo ${products.length} Sản phẩm thuộc 6 danh mục...`);
    const productQuery = `
      UNWIND $batch AS pData
      MERGE (p:Product {id: pData.id})
      SET p.name = pData.name,
          p.price = toFloat(pData.price),
          p.originalPrice = toFloat(pData.originalPrice),
          p.discountPercent = toInteger(pData.discountPercent),
          p.imageUrl = pData.imageUrl,
          p.rating = toFloat(pData.rating),
          p.soldCount = toInteger(pData.soldCount),
          p.description = pData.description,
          p.createdAt = datetime().epochMillis
      WITH p, pData
      MATCH (cat:Category {id: pData.categoryId})
      MERGE (p)-[:BELONGS_TO]->(cat)
    `;
    await session.run(productQuery, { batch: products });

    // 5. Nạp Khách hàng
    const customers = generateCustomers();
    console.log(`👥 Đang tạo ${customers.length} Khách hàng mẫu...`);
    const customerQuery = `
      UNWIND $batch AS cData
      MERGE (c:Customer {id: cData.id})
      SET c.name = cData.name,
          c.email = cData.email,
          c.avatar = cData.avatar,
          c.phone = cData.phone,
          c.address = cData.address,
          c.createdAt = datetime().epochMillis
    `;
    await session.run(customerQuery, { batch: customers });

    // 6. Nạp Cạnh quan hệ BOUGHT và VIEWED (co-purchase clusters)
    const relationships = generateRelationships(products, customers);
    console.log(`🔗 Đang tạo ${relationships.length} Cạnh quan hệ [:BOUGHT] và [:VIEWED] (Clusters)...`);

    const boughtRels = relationships.filter((r) => r.type === 'BOUGHT');
    const viewedRels = relationships.filter((r) => r.type === 'VIEWED');

    // Nạp BOUGHT
    const boughtQuery = `
      UNWIND $batch AS rel
      MATCH (c:Customer {id: rel.customerId})
      MATCH (p:Product {id: rel.productId})
      MERGE (c)-[r:BOUGHT]->(p)
      ON CREATE SET r.timestamp = rel.timestamp, r.quantity = 1, r.priceAtPurchase = p.price
    `;
    await session.run(boughtQuery, { batch: boughtRels });

    // Nạp VIEWED
    const viewedQuery = `
      UNWIND $batch AS rel
      MATCH (c:Customer {id: rel.customerId})
      MATCH (p:Product {id: rel.productId})
      MERGE (c)-[r:VIEWED]->(p)
      ON CREATE SET r.createdAt = rel.timestamp, r.lastViewedAt = rel.timestamp, r.viewCount = 1
    `;
    await session.run(viewedQuery, { batch: viewedRels });

    // 7. Đồng bộ số lượng bán thực tế trên từng sản phẩm
    console.log('📊 Đang cập nhật lại số lượng đã bán dựa trên quan hệ BOUGHT...');
    await session.run(`
      MATCH (p:Product)
      OPTIONAL MATCH (p)<-[r:BOUGHT]-()
      WITH p, count(r) AS actualBought
      SET p.soldCount = p.soldCount + actualBought
    `);

    // 8. Thống kê kết quả
    const countCheck = await session.run(`
      MATCH (c:Customer) WITH count(c) AS customerCount
      MATCH (p:Product) WITH customerCount, count(p) AS productCount
      MATCH (cat:Category) WITH customerCount, productCount, count(cat) AS categoryCount
      MATCH ()-[rb:BOUGHT]->() WITH customerCount, productCount, categoryCount, count(rb) AS boughtCount
      MATCH ()-[rv:VIEWED]->()
      RETURN customerCount, productCount, categoryCount, boughtCount, count(rv) AS viewedCount
    `);

    const stats = countCheck.records[0];
    const resultStats = {
      categoryCount: stats.get('categoryCount').toNumber ? stats.get('categoryCount').toNumber() : Number(stats.get('categoryCount')),
      productCount: stats.get('productCount').toNumber ? stats.get('productCount').toNumber() : Number(stats.get('productCount')),
      customerCount: stats.get('customerCount').toNumber ? stats.get('customerCount').toNumber() : Number(stats.get('customerCount')),
      boughtCount: stats.get('boughtCount').toNumber ? stats.get('boughtCount').toNumber() : Number(stats.get('boughtCount')),
      viewedCount: stats.get('viewedCount').toNumber ? stats.get('viewedCount').toNumber() : Number(stats.get('viewedCount')),
    };

    return { success: true, stats: resultStats };
  } catch (error: any) {
    console.error('❌ Lỗi trong quá trình Seed:', error);
    return { success: false, error: error?.message || String(error) };
  } finally {
    await session.close();
    if (shouldCloseDriver && activeDriver) {
      await activeDriver.close();
    }
  }
}

// Chạy trực tiếp khi gọi từ CLI: npm run seed
if (process.argv[1] && (process.argv[1].includes('seed.ts') || process.argv[1].includes('seed.js'))) {
  runSeed().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
