// ==============================================================================
// ĐỀ TÀI: HỆ THỐNG GỢI Ý SẢN PHẨM TƯƠNG QUAN BẰNG GRAPH DATABASE (NEO4J)
// VAI TRÒ SV2: Advanced Query Specialist
// FILE: database/recommendations.cypher
// MÔ TẢ: Thuật toán Collaborative Filtering bằng Cypher, Scoring và Cold-start Fallback
// ==============================================================================

// ------------------------------------------------------------------------------
// THUẬT TOÁN 1: COLLABORATIVE FILTERING TRÊN ĐỒ THỊ (ITEM-BASED / USER-BASED HYBRID)
// ------------------------------------------------------------------------------
// Ý tưởng đồ thị:
// (c1:Customer {id: $customerId})
//      |
//      +--[:BOUGHT|VIEWED]--> (p1:Product) <--[:BOUGHT|VIEWED]-- (c2:Customer)
//                                                                    |
//                                                                    +--[r2:BOUGHT|VIEWED]--> (p2:Product)
//
// Trọng số:
// - c2 MUA p2: Trọng số 3.0 (Hành vi cam kết chi tiền cao)
// - c2 XEM p2: Trọng số 1.0 (Hành vi quan tâm/tiềm năng)
//
// Điều kiện loại trừ:
// - p2 khác p1
// - c1 CHƯA TỪNG MUA hoặc XEM p2 (tránh gợi ý sản phẩm c1 đã sở hữu/đã xem gần đây)
// ------------------------------------------------------------------------------

// CÂU LỆNH TRUY VẤN CHÍNH:
MATCH (c1:Customer {id: $customerId})

// Tìm các sản phẩm p1 mà c1 đã từng mua hoặc xem
MATCH (c1)-[r1:BOUGHT|VIEWED]->(p1:Product)

// Tìm những khách hàng c2 khác có cùng hành vi tương tác với p1 (đồng sở thích)
MATCH (p1)<-[r_shared:BOUGHT|VIEWED]-(c2:Customer)
WHERE c2.id <> c1.id

// Từ c2, tìm các sản phẩm p2 mà họ cũng mua hoặc xem
MATCH (c2)-[r2:BOUGHT|VIEWED]->(p2:Product)
WHERE p2.id <> p1.id
  // Loại trừ các sản phẩm mà c1 đã từng mua hoặc xem
  AND NOT (c1)-[:BOUGHT]->(p2)
  AND NOT (c1)-[:VIEWED]->(p2)

// Tính điểm dựa trên số lượng c2 mua và c2 xem p2
WITH p2,
     count(DISTINCT CASE WHEN type(r2) = 'BOUGHT' THEN c2 END) AS coBoughtCount,
     count(DISTINCT CASE WHEN type(r2) = 'VIEWED' THEN c2 END) AS coViewedCount,
     count(DISTINCT c2) AS totalCoCustomers

// Công thức tính điểm: Score = (Số c2 mua * 3.0) + (Số c2 xem * 1.0)
WITH p2, coBoughtCount, coViewedCount, totalCoCustomers,
     round((coBoughtCount * 3.0 + coViewedCount * 1.0), 2) AS recommendationScore

// Lấy thông tin danh mục của p2
OPTIONAL MATCH (p2)-[:BELONGS_TO]->(cat:Category)

RETURN p2.id AS id,
       p2.name AS name,
       p2.price AS price,
       p2.originalPrice AS originalPrice,
       p2.discountPercent AS discountPercent,
       p2.imageUrl AS imageUrl,
       p2.rating AS rating,
       p2.soldCount AS soldCount,
       cat.name AS categoryName,
       recommendationScore AS score,
       coBoughtCount,
       coViewedCount,
       totalCoCustomers,
       CASE
         WHEN coBoughtCount > 0 AND coViewedCount > 0 THEN
           "Có " + toString(coBoughtCount) + " khách mua & " + toString(coViewedCount) + " khách cùng sở thích đã xem"
         WHEN coBoughtCount > 0 THEN
           "Có " + toString(coBoughtCount) + " khách hàng cùng gu đã mua"
         ELSE
           "Có " + toString(coViewedCount) + " khách hàng quan tâm xem cùng"
       END AS reason
ORDER BY recommendationScore DESC, p2.soldCount DESC, p2.rating DESC
LIMIT 10;


// ------------------------------------------------------------------------------
// THUẬT TOÁN 2: COLD-START FALLBACK QUERY (CHO KHÁCH HÀNG MỚI CHƯA CÓ HÀNH VI)
// ------------------------------------------------------------------------------
// Khi c1 là người dùng mới tinh chưa mua hoặc xem gì, truy vấn 1 sẽ trả về rỗng.
// Hệ thống lập tức fallback sang gợi ý TOP SẢN PHẨM BÁN CHẠY NHẤT TOÀN SÀN
// ------------------------------------------------------------------------------

MATCH (p:Product)
OPTIONAL MATCH (p)<-[r:BOUGHT]-(c:Customer)
OPTIONAL MATCH (p)-[:BELONGS_TO]->(cat:Category)

WITH p, cat, count(r) AS verifiedBuys, coalesce(p.soldCount, 0) AS totalSold

RETURN p.id AS id,
       p.name AS name,
       p.price AS price,
       p.originalPrice AS originalPrice,
       p.discountPercent AS discountPercent,
       p.imageUrl AS imageUrl,
       p.rating AS rating,
       totalSold AS soldCount,
       cat.name AS categoryName,
       round(5.0 + (totalSold * 0.01), 1) AS score,
       totalSold AS coBoughtCount,
       0 AS coViewedCount,
       verifiedBuys AS totalCoCustomers,
       "🔥 Top thịnh hành: Sản phẩm bán chạy nhất hệ thống (Cold-start)" AS reason
ORDER BY totalSold DESC, p.rating DESC
LIMIT 10;


// ------------------------------------------------------------------------------
// PHÂN TÍCH HIỆU NĂNG: EXPLAIN & PROFILE
// ------------------------------------------------------------------------------

// 1. EXPLAIN (Xem kế hoạch thực thi Logical Plan mà KHÔNG cần chạy dữ liệu thật)
EXPLAIN
MATCH (c1:Customer {id: 'CUST-001'})-[:BOUGHT|VIEWED]->(p1:Product)<-[:BOUGHT|VIEWED]-(c2:Customer)
WHERE c2.id <> c1.id
MATCH (c2)-[r2:BOUGHT|VIEWED]->(p2:Product)
WHERE p2.id <> p1.id
  AND NOT (c1)-[:BOUGHT]->(p2)
  AND NOT (c1)-[:VIEWED]->(p2)
RETURN p2.name, count(c2) AS score
ORDER BY score DESC LIMIT 10;

// 2. PROFILE (Chạy thực tế trên Neo4j Engine, trả về DB Hits, Memory và Execution Time)
PROFILE
MATCH (c1:Customer {id: 'CUST-001'})
MATCH (c1)-[r1:BOUGHT|VIEWED]->(p1:Product)
MATCH (p1)<-[r_shared:BOUGHT|VIEWED]-(c2:Customer)
WHERE c2.id <> c1.id
MATCH (c2)-[r2:BOUGHT|VIEWED]->(p2:Product)
WHERE p2.id <> p1.id
  AND NOT (c1)-[:BOUGHT]->(p2)
  AND NOT (c1)-[:VIEWED]->(p2)
WITH p2,
     count(DISTINCT CASE WHEN type(r2) = 'BOUGHT' THEN c2 END) AS coBoughtCount,
     count(DISTINCT CASE WHEN type(r2) = 'VIEWED' THEN c2 END) AS coViewedCount
WITH p2, (coBoughtCount * 3.0 + coViewedCount * 1.0) AS score
RETURN p2.name, score
ORDER BY score DESC
LIMIT 10;
