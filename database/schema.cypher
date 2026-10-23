// ==============================================================================
// ĐỀ TÀI: HỆ THỐNG GỢI Ý SẢN PHẨM TƯƠNG QUAN BẰNG GRAPH DATABASE (NEO4J)
// VAI TRÒ SV1: Data Architect & CRUD Lead
// FILE: database/schema.cypher
// MÔ TẢ: Khởi tạo Constraints và Indexes tối ưu hóa tốc độ truy vấn Cypher
// ==============================================================================

// ------------------------------------------------------------------------------
// 1. UNIQUE CONSTRAINTS (Đảm bảo tính duy nhất & tự động tạo B-Tree Index cho ID)
// ------------------------------------------------------------------------------

// Ràng buộc duy nhất cho Khách hàng (Customer ID)
CREATE CONSTRAINT constraint_customer_id IF NOT EXISTS
FOR (c:Customer) REQUIRE c.id IS UNIQUE;

// Ràng buộc duy nhất cho Sản phẩm (Product ID)
CREATE CONSTRAINT constraint_product_id IF NOT EXISTS
FOR (p:Product) REQUIRE p.id IS UNIQUE;

// Ràng buộc duy nhất cho Danh mục sản phẩm (Category ID)
CREATE CONSTRAINT constraint_category_id IF NOT EXISTS
FOR (cat:Category) REQUIRE cat.id IS UNIQUE;


// ------------------------------------------------------------------------------
// 2. INDEXES CHO CÁC THUỘC TÍNH THƯỜNG XUYÊN TRUY VẤN (LOOKUP & FILTER OPTIMIZATION)
// ------------------------------------------------------------------------------

// Index tìm kiếm nhanh theo tên sản phẩm (hỗ trợ search autocomplete)
CREATE INDEX index_product_name IF NOT EXISTS
FOR (p:Product) ON (p.name);

// Index lọc theo khoảng giá sản phẩm (RANGE query: price BETWEEN x AND y)
CREATE INDEX index_product_price IF NOT EXISTS
FOR (p:Product) ON (p.price);

// Index lọc theo đánh giá sao (rating >= 4.0)
CREATE INDEX index_product_rating IF NOT EXISTS
FOR (p:Product) ON (p.rating);

// Index tìm kiếm theo tên danh mục
CREATE INDEX index_category_name IF NOT EXISTS
FOR (cat:Category) ON (cat.name);

// Index tìm kiếm theo tên khách hàng
CREATE INDEX index_customer_name IF NOT EXISTS
FOR (c:Customer) ON (c.name);

// Index trên quan hệ thời gian hành vi (hỗ trợ lọc tương tác gần đây)
// Lưu ý: Neo4j 5 hỗ trợ index trên quan hệ
CREATE INDEX index_bought_timestamp IF NOT EXISTS
FOR ()-[r:BOUGHT]-() ON (r.timestamp);

CREATE INDEX index_viewed_timestamp IF NOT EXISTS
FOR ()-[r:VIEWED]-() ON (r.timestamp);

// ------------------------------------------------------------------------------
// 3. KIỂM TRA TRẠNG THÁI CONSTRAINTS & INDEXES SAU KHI TẠO
// ------------------------------------------------------------------------------
SHOW CONSTRAINTS;
SHOW INDEXES;
