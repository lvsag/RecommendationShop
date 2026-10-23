# KỊCH BẢN THUYẾT TRÌNH VÀ DEMO SỐNG BẢO VỆ ĐỒ ÁN (NHÓM 3 SINH VIÊN)
**ĐỀ TÀI: HỆ THỐNG GỢI Ý SẢN PHẨM TƯƠNG QUAN BẰNG GRAPH DATABASE (NEO4J)**  
**Đơn vị đào tạo:** Bộ môn Cơ sở dữ liệu / Công nghệ thông tin  
**Phân công nhóm:**
- **SV1 (Data Architect & CRUD Lead):** Trách nhiệm Mô hình dữ liệu Graph, Constraints/Indexes, CRUD API và Behavior Logging.
- **SV2 (Advanced Query Specialist):** Trách nhiệm Thuật toán Collaborative Filtering bằng Cypher, Scoring và Phân tích Execution Plan (`PROFILE`/`EXPLAIN`).
- **SV3 (Fullstack Integrator & UI/UX):** Trách nhiệm Dữ liệu mẫu (Co-purchase Clusters), Giao diện Shopee và Luồng tích hợp Demo trực quan thời gian thực.

---

## 🎯 TỔNG QUAN LUỒNG DEMO SỐNG (DỰ KIẾN 10 - 15 PHÚT)

```
[Mở Web Shopee UI] ──▶ (SV1: Đăng nhập CUST-001, click xem sản phẩm, giải thích Schema)
                             │
                             ▼
[Bật Neo4j Inspector] ─▶ (SV2: Show câu Cypher, phân tích PROFILE, giải thích công thức 3.0*Buy + 1.0*View)
                             │
                             ▼
[Thực hiện Mua Hàng] ──▶ (SV3: Bấm Mua Ngay, Gợi ý nhảy Real-time, mở Neo4j Browser show đồ thị trực quan)
                             │
                             ▼
[Test Cold-Start] ────▶ (SV3: Chuyển sang CUST-004 người dùng mới tinh -> Gợi ý Fallback Top Bán Chạy)
```

---

## BƯỚC 1: SV1 - MÔ HÌNH HÓA ĐỒ THỊ & GHI NHẬN HÀNH VI (3 - 4 PHÚT)

### 1.1. Lời thoại mở đầu của SV1:
> *"Kính thưa Thầy Cô trong Hội đồng chấm thi, em là [Tên SV1], đảm nhiệm vai trò Data Architect & CRUD Lead cho dự án Hệ thống Gợi ý Sản phẩm Tương quan bằng Graph Database Neo4j.*  
> *Đầu tiên, em xin phép giới thiệu mô hình dữ liệu đồ thị cốt lõi của hệ thống đang được triển khai trên nền tảng Neo4j 5.x."*

### 1.2. Thao tác trên Web & Trình chiếu:
1. Mở giao diện Web Shopee tại `http://localhost:3000`.
2. Trỏ vào dropdown **Demo User** trên Header, hiển thị danh sách 50 khách hàng.
3. Chọn khách hàng: **Nguyễn Văn An (`CUST-001`)** - Khách hàng có hành vi đam mê đồ công nghệ (Tech Enthusiast).
4. Nhấp vào xem chi tiết một sản phẩm bất kỳ: ví dụ **"Laptop Apple MacBook Pro 14 M3 Pro"**.
5. Nhìn xuống góc dưới màn hình, Toast thông báo nổi lên:
   `"Đồ thị Neo4j: Ghi nhận VIEWED - Tạo/Cập nhật cạnh (:Nguyễn Văn An)-[:VIEWED]->(:MacBook Pro) (Lần xem thứ: ...)"`.

### 1.3. Lời giải thích kỹ thuật của SV1:
- **Mô hình Node Labels:**
  - `:Customer`: Lưu trữ thông tin định danh khách hàng (`id`, `name`, `email`, `avatar`).
  - `:Product`: Thực thể hàng hóa (`id`, `name`, `price`, `originalPrice`, `discountPercent`, `rating`, `soldCount`).
  - `:Category`: 6 ngành hàng (`Công nghệ`, `Thời trang`, `Gia dụng`, `Sách`, `Mỹ phẩm`, `Thể thao`).
- **Mô hình Relationships (Cạnh quan hệ):**
  - `(c:Customer)-[:BOUGHT {timestamp, quantity, priceAtPurchase}]->(p:Product)`: Hành vi mua sắm đã thanh toán.
  - `(c:Customer)-[:VIEWED {createdAt, lastViewedAt, viewCount}]->(p:Product)`: Hành vi xem lướt, tự động tăng `viewCount` khi xem lại bằng Cypher `MERGE`.
  - `(p:Product)-[:BELONGS_TO]->(cat:Category)`: Phân loại danh mục.
- **Ràng buộc toàn vẹn & Index (`schema.cypher`):**
  - Unique Constraint trên `Customer(id)`, `Product(id)`, `Category(id)` bảo đảm dữ liệu không bao giờ bị trùng lặp, đồng thời tự sinh B-Tree Index cho tra cứu $O(1)$.
  - Point/Range Index trên `Product(name)` và `Product(price)` phục vụ việc lọc và tìm kiếm tức thì.

---

## BƯỚC 2: SV2 - THUẬT TOÁN GỢI Ý CYPHER & PHÂN TÍCH PROFILE (4 - 5 PHÚT)

### 2.1. Lời thoại dẫn dắt của SV2:
> *"Em là [Tên SV2], phụ trách Advanced Query & Performance Optimization. Tiếp nối phần của bạn SV1, khi khách hàng CUST-001 truy cập, hệ thống không chỉ hiển thị sản phẩm ngẫu nhiên mà thực thi thuật toán Collaborative Filtering theo đồ thị thời gian thực."*

### 2.2. Thao tác trên Web:
1. Bấm nút **"Inspect Graph"** (nút màu đen trên thanh Header).
2. Tab 1 (**Cypher Query & Scoring**) hiển thị toàn bộ câu lệnh Cypher đang chạy trực tiếp.

### 2.3. SV2 phân tích chi tiết câu lệnh Cypher:
> *"Thuật toán đồ thị của nhóm em giải quyết bài toán: **Tìm các sản phẩm p2 được mua/xem bởi những người c2 có cùng hành vi với c1 trên sản phẩm p1**."*

```cypher
MATCH (c1:Customer {id: $customerId})
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
WITH p2, round((coBoughtCount * 3.0 + coViewedCount * 1.0), 2) AS recommendationScore
ORDER BY recommendationScore DESC
LIMIT 10;
```

- **Giải thích công thức trọng số (Scoring):**
  $$\text{Score} = (\text{Số lượng } c_2 \text{ đã mua } p_2 \times 3.0) + (\text{Số lượng } c_2 \text{ đã xem } p_2 \times 1.0)$$
  - Trọng số **3.0** cho hành vi `BOUGHT`: Khách hàng đã trả tiền thực tế, thể hiện độ tin cậy và mức độ yêu thích cao nhất.
  - Trọng số **1.0** cho hành vi `VIEWED`: Thể hiện sự chú ý tiềm năng nhưng chưa cam kết mua.
- **Điều kiện loại trừ (Anti-Join / Negative Filter):**
  - Loại trừ $p_1$ (không gợi ý sản phẩm làm mỏ neo ban đầu).
  - Loại trừ sản phẩm mà chính $c_1$ đã sở hữu hoặc xem gần đây (`NOT (c1)-[:BOUGHT]->(p2)`). Điều này giúp gợi ý sản phẩm mang tính khám phá (Novelty) và không làm phiền người dùng.

### 2.4. SV2 chuyển sang Tab 2 (**Phân Tích PROFILE / EXPLAIN**):
- Giải thích các Operator trên cây thực thi:
  1. **`NodeIndexSeek`**: Cypher Planner sử dụng Index của `Customer(id)`. Thay vì phải quét toàn bộ 50+ nodes (`AllNodesScan` $O(N)$), Engine định vị trực tiếp con trỏ của node $c_1$ chỉ với **1 DB Hit** ($O(1)$).
  2. **`Expand(All)`**: Tận dụng cơ chế cốt lõi **Index-free Adjacency** của Neo4j. Engine đi theo các con trỏ bộ nhớ RAM giữa các node kề nhau. So với hệ cơ sở dữ liệu quan hệ RDBMS (cần thực hiện 4 phép `INNER JOIN` trên bảng lớn gây chậm trễ), Neo4j duyệt đồ thị với chi phí cục bộ $O(\text{degree})$.
  3. **`Top` Operator**: Kết hợp `ORDER BY ... LIMIT 10`, Cypher sử dụng giải thuật **Min-Heap kích thước 10**. Engine chỉ duy trì 10 phần tử có điểm số cao nhất trong bộ nhớ heap mà không cần sắp xếp toàn bộ hàng trăm sản phẩm ứng viên, tối ưu hóa bộ nhớ RAM triệt để.

---

## BƯỚC 3: SV3 - DEMO SỐNG THỜI GIAN THỰC & NEO4J BROWSER (4 - 5 PHÚT)

### 3.1. Lời thoại dẫn dắt của SV3:
> *"Kính thưa Thầy Cô, em là [Tên SV3], đảm nhiệm vai trò Fullstack Integrator & UI/UX. Em đã tích hợp toàn bộ hệ sinh thái giữa Node.js, Neo4j Driver và giao diện Shopee React Tailwind. Sau đây em xin trình diễn luồng Demo sống thể hiện tính phản hồi thời gian thực của đồ thị."*

### 3.2. Demo 1: Gợi ý nhảy tức thì khi người dùng Mua hàng (Real-time Adaptive Recommendation):
1. Đóng bảng Inspector, quay lại màn hình chính Shopee.
2. Tại mục **"GỢI Ý HÔM NAY"**, chỉ cho Thầy Cô thấy danh sách gợi ý hiện tại của `CUST-001` đang ưu tiên các sản phẩm phụ kiện công nghệ như:
   - *Tai nghe Bluetooth Apple AirPods Pro 2* (Score cao, có lý do: "Có 5 khách hàng mua chung sở thích đã mua").
   - *Bàn phím cơ Keychron K2 Pro*, *Chuột Logitech MX Master 3S*.
3. SV3 bấm nút **"Mua Ngay"** trên thẻ sản phẩm *Tai nghe Bluetooth Apple AirPods Pro 2*.
4. **Hiện tượng xảy ra ngay lập tức:**
   - Toast thông báo thành công: `"Đã ghi nhận cạnh (:Nguyễn Văn An)-[:BOUGHT]->(:AirPods Pro 2)"`.
   - Giỏ hàng nhảy số từ 3 lên 4.
   - Mục **"GỢI Ý HÔM NAY"** tự động làm mới trong 0.2 giây: Sản phẩm *AirPods Pro 2* biến mất khỏi danh sách gợi ý (vì đã được mua), thay vào đó sản phẩm *Apple Watch Ultra 2* hoặc *Dell UltraSharp* được đẩy lên top!
   - Thầy Cô thấy rõ tính thích ứng thời gian thực (Real-time graph adaptation) mà không cần reload trang!

### 3.3. Demo 2: Kiểm thử kịch bản Người dùng mới (Cold-Start Problem):
1. SV3 bấm vào dropdown **Demo User** trên Header.
2. Chọn tài khoản **"Phạm Minh Tuấn (Cold-Start)" - `CUST-004`**.
3. **Hiện tượng quan sát:**
   - Huy hiệu chuyển sang màu tím: `Cold-start Fallback`.
   - Tiêu đề phụ hiển thị: `"Cold-start Fallback: Khách hàng chưa có lịch sử, gợi ý Top sản phẩm bán chạy nhất sàn"`.
   - Các sản phẩm hiển thị là những mặt hàng có số lượt bán cao nhất hệ thống (như *Sách Đắc Nhân Tâm*, *Serum B5*, *Điện thoại iPhone 15*).
   - Giải thích: Chứng minh hệ thống không bị crash hoặc trả về trang trắng khi gặp người dùng mới tinh.

### 3.4. Demo 3: Trực quan hóa đường đi đồ thị trên Neo4j Browser:
1. Mở tab trình duyệt tại `http://localhost:7474`.
2. Chạy câu lệnh Cypher trực quan hóa:
   ```cypher
   MATCH path = (c1:Customer {id: 'CUST-001'})-[:BOUGHT]->(p1:Product)
                <-[:BOUGHT]-(c2:Customer)-[:BOUGHT]->(p2:Product)
   WHERE p2 <> p1 AND NOT (c1)-[:BOUGHT]->(p2)
   RETURN path LIMIT 25;
   ```
3. Màn hình Neo4j Browser hiện lên đồ thị mạng nhện sinh động:
   - Các hình tròn xanh dương (`Customer`) liên kết tới các hình tròn cam (`Product`) qua cạnh `[:BOUGHT]`.
   - Chỉ trực tiếp vào màn hình: *"Thầy Cô có thể thấy đây là User A (CUST-001) nối tới MacBook Pro, MacBook Pro nối tới User B (CUST-005), và User B nối tới Chuột Logitech MX Master. Đó chính là cầu nối tri thức giúp hệ sinh thái đồ thị Neo4j gợi ý chính xác 100%!"*

---

## 4. TỔNG KẾT & LỜI CẢM ƠN
> *"Kính thưa Hội đồng, nhóm 3 sinh viên chúng em đã hoàn thành toàn diện các yêu cầu của Đề tài:*  
> *1. SV1 hoàn thành chuẩn hóa mô hình đồ thị với đầy đủ Constraints, Indexes và API ghi nhận hành vi.*  
> *2. SV2 tối ưu hóa thành công câu truy vấn Collaborative Filtering Cypher với trọng số và chứng minh hiệu năng qua PROFILE/EXPLAIN.*  
> *3. SV3 tích hợp giao diện Shopee chân thực, phản hồi thời gian thực và xử lý triệt để bài toán Cold-start.*  
> *Nhóm chúng em xin chân thành cảm ơn Quý Thầy Cô và sẵn sàng lắng nghe các câu hỏi chất vấn!"*
