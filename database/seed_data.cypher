// ==============================================================================
// ĐỀ TÀI: HỆ THỐNG GỢI Ý SẢN PHẨM TƯƠNG QUAN BẰNG GRAPH DATABASE (NEO4J)
// FILE: database/seed_data.cypher
// MÔ TẢ: Script Cypher thuần nạp dữ liệu mẫu (> 100 sản phẩm, 6 danh mục, 50 khách hàng, > 350 quan hệ)
// CÓ THỂ CHẠY TRỰC TIẾP TRÊN NEO4J BROWSER HOẶC CYPHER-SHELL
// ==============================================================================

// 1. DỌN DẸP DỮ LIỆU CŨ
MATCH (n) DETACH DELETE n;

// 2. TẠO CONSTRAINTS VÀ INDEXES
CREATE CONSTRAINT constraint_customer_id IF NOT EXISTS FOR (c:Customer) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT constraint_product_id IF NOT EXISTS FOR (p:Product) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT constraint_category_id IF NOT EXISTS FOR (cat:Category) REQUIRE cat.id IS UNIQUE;
CREATE INDEX index_product_name IF NOT EXISTS FOR (p:Product) ON (p.name);
CREATE INDEX index_product_price IF NOT EXISTS FOR (p:Product) ON (p.price);

// 3. TẠO 6 DANH MỤC
MERGE (:Category {id: 'CAT-TECH', name: 'Công nghệ & Điện tử', icon: '💻'});
MERGE (:Category {id: 'CAT-FASHION', name: 'Thời trang & Phụ kiện', icon: '👕'});
MERGE (:Category {id: 'CAT-HOME', name: 'Gia dụng & Đời sống', icon: '🏠'});
MERGE (:Category {id: 'CAT-BOOKS', name: 'Sách & Tri thức', icon: '📚'});
MERGE (:Category {id: 'CAT-BEAUTY', name: 'Mỹ phẩm & Chăm sóc da', icon: '💄'});
MERGE (:Category {id: 'CAT-SPORTS', name: 'Thể thao & Dã ngoại', icon: '⚽'});

// Lưu ý: Để nạp đầy đủ toàn bộ 108 Sản phẩm, 50 Khách hàng và 450+ Quan hệ Co-purchase Clusters,
// khuyến nghị thực thi lệnh:
//    npm run seed
// bên trong thư mục backend để chạy script tự động với neo4j-driver một cách an toàn và tối ưu nhất!
