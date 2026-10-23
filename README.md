# 🛒 HỆ THỐNG GỢI Ý SẢN PHẨM TƯƠNG QUAN BẰNG GRAPH DATABASE (NEO4J)
### Đề Tài Môn Học: Cơ Sở Dữ Liệu NoSQL / Graph Database
> **Ứng dụng thuật toán Collaborative Filtering trên đồ thị Neo4j kết hợp giao diện Shopee Style phản hồi thời gian thực.**

---

## 👥 PHÂN CÔNG VAI TRÒ NHÓM 3 SINH VIÊN

| Sinh viên | Vai trò đảm nhiệm | Nhiệm vụ kỹ thuật chính |
| :--- | :--- | :--- |
| **SV1** | **Data Architect & CRUD Lead** | - Thiết kế mô hình đồ thị (`Customer`, `Product`, `Category`).<br>- Viết file migration thiết lập Unique Constraints & B-Tree Indexes.<br>- Cung cấp bộ RESTful API CRUD và API ghi nhận hành vi (`VIEWED`, `BOUGHT`). |
| **SV2** | **Advanced Query Specialist** | - Viết thuật toán Collaborative Filtering bằng ngôn ngữ Cypher.<br>- Thiết lập công thức chấm điểm trọng số: `Score = (Buy * 3.0) + (View * 1.0)`.<br>- Phân tích hiệu năng bằng `PROFILE` và `EXPLAIN` (các bước `NodeIndexSeek`, `Expand`, `Filter`, `Top`).<br>- Xây dựng cơ chế Cold-start Fallback. |
| **SV3** | **Fullstack Integrator & UI/UX** | - Script sinh tự động dữ liệu mẫu (108 Products, 6 Categories, 50 Customers, 450+ Cạnh Co-purchase Clusters).<br>- Xây dựng giao diện Web phong cách Shopee (Màu cam `#ee4d2d`, Grid, Badge sale, Star rating).<br>- Tích hợp dropdown Demo Switcher và cơ chế cập nhật gợi ý Real-time khi bấm Mua ngay. |

---

## 🏗️ CẤU TRÚC THƯ MỤC DỰ ÁN

```
RecommendationProject/
├── docker-compose.yml              # Khởi chạy Neo4j 5.x Community và APOC
├── database/
│   ├── schema.cypher               # Ràng buộc toàn vẹn & Index tối ưu hóa
│   ├── recommendations.cypher      # Thuật toán Collaborative Filtering, Cold-start & PROFILE/EXPLAIN
│   ├── seed_data.cypher            # File Cypher thuần hỗ trợ chạy trên Neo4j Browser
│   └── explain_profile_analysis.md # Báo cáo phân tích chuyên sâu DB Hits & Operators của SV2
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example & .env
│   └── src/
│       ├── config/neo4j.ts         # Quản lý Connection Pool neo4j-driver
│       ├── controllers/            # Controller Product, Customer, Behavior, Recommendation
│       ├── routes/                 # Express REST Endpoints
│       ├── scripts/seed.ts         # Script nạp 108 sản phẩm, 50 khách hàng & 450+ quan hệ
│       └── server.ts               # Entrypoint Backend API (Port 5000)
├── frontend/
│   ├── package.json
│   ├── vite.config.ts              # Proxy /api tới Backend port 5000
│   ├── tailwind.config.js          # Cấu hình bảng màu Shopee #ee4d2d
│   └── src/
│       ├── components/             # Header, HeroBanner, CategoryList, ProductCard, Neo4jInspector...
│       ├── api/client.ts           # Axios HTTP client
│       └── App.tsx                 # Luồng điều khiển Shopee & Real-time Recommender
└── docs/
    ├── HUONG_DAN_NEO4J_DESKTOP.md  # Hướng dẫn chi tiết từng bước dùng Neo4j Desktop (GUI)
    ├── KICH_BAN_DEMO_BAO_VE.md     # Kịch bản từng bước nói trước hội đồng cho 3 sinh viên
    └── BAO_CAO_KIEN_TRUC.md        # Báo cáo kiến trúc hệ thống và so sánh hiệu năng SQL vs Graph
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY (2 PHƯƠNG PHÁP)

Hệ thống hỗ trợ chạy cơ sở dữ liệu Neo4j theo **2 cách**: Sử dụng **Docker** (dòng lệnh 1-click) hoặc sử dụng **Neo4j Desktop** (giao diện đồ họa trực quan). Bạn có thể chọn cách phù hợp với máy của mình.

---

### PHƯƠNG PHÁP 1: SỬ DỤNG DOCKER COMPOSE (DÀNH CHO DÒNG LỆNH)

Nếu máy tính đã cài đặt và đang bật **Docker Desktop**:

1. Tại thư mục gốc `RecommendationProject`, mở terminal chạy:
   ```bash
   docker compose up -d
   ```
2. Container Neo4j sẽ tự động chạy:
   - **Bolt Protocol:** `bolt://localhost:7687`
   - **Neo4j Browser:** [http://localhost:7474](http://localhost:7474)
   - **Username:** `neo4j`
   - **Password:** `recommendation123`

---

### PHƯƠNG PHÁP 2: SỬ DỤNG NEO4J DESKTOP (GIAO DIỆN ĐỒ HỌA GUI)

*(Khuyên dùng cho sinh viên học môn NoSQL / Graph Database khi chưa cài Docker)*

#### 1. Cài đặt và tạo Local DBMS:
1. Tải và cài đặt **Neo4j Desktop** từ: [https://neo4j.com/download/](https://neo4j.com/download/)
2. Mở Neo4j Desktop $\rightarrow$ chọn Project $\rightarrow$ nhấn **Add** $\rightarrow$ chọn **Local DBMS**.
3. Điền thông tin:
   - **Name:** `RecommendationDBMS`
   - **Password:** `recommendation123` *(Khuyên dùng mật khẩu này để trùng khớp cấu hình)*
   - **Version:** Chọn `5.x` (khuyên dùng bản 5.20+ hoặc 5.26 mới nhất)
4. Nhấn **Create**.

#### 2. Cài đặt Plugin APOC (Tùy chọn nhưng khuyến nghị):
- Nhấp vào DBMS vừa tạo $\rightarrow$ mở tab **Plugins** ở thanh bên phải $\rightarrow$ tại mục **APOC**, nhấn **Install** (hoặc **Install and Restart**).

#### 3. Khởi động DBMS:
- Bấm nút **"Start"** (màu xanh lá) tại DBMS. Đợi trạng thái chuyển sang **`Active`** (chấm xanh lá).

#### 4. Kiểm tra cấu hình `backend/.env`:
Mở file `backend/.env` và đảm bảo mật khẩu khớp với mật khẩu bạn đã tạo ở trên:
```env
PORT=5000
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=recommendation123
NEO4J_DATABASE=neo4j
```
> *(Xem hướng dẫn chi tiết có hình ảnh tại: [docs/HUONG_DAN_NEO4J_DESKTOP.md](file:///d:/NoSQL/RecommendationProject/docs/HUONG_DAN_NEO4J_DESKTOP.md))*

---

## 📦 BƯỚC TIẾP THEO: NẠP DỮ LIỆU MẪU & KHỞI CHẠY ỨNG DỤNG

Dù bạn chọn chạy Neo4j bằng **Docker** hay **Neo4j Desktop**, các bước sau đây đều giống nhau:

### BƯỚC 1: SEED DỮ LIỆU VÀ CHẠY BACKEND

Mở Terminal thứ 1:
```bash
cd backend
npm install
npm run seed
```

**Kết quả Seed tự động:**
- Tự động tạo Unique Constraints và B-Tree Indexes (`schema.cypher`).
- 6 Danh mục (`Công nghệ`, `Thời trang`, `Gia dụng`, `Sách`, `Mỹ phẩm`, `Thể thao`).
- 108 Sản phẩm chuẩn hình ảnh Shopee, giá niêm yết, discount, rating.
- 50 Khách hàng với phân cụm mua sắm cùng nhau (Co-purchase clusters).
- 450+ Cạnh quan hệ `[:BOUGHT]` và `[:VIEWED]`.

Sau khi Seed hoàn tất, khởi động Backend Server:
```bash
npm run dev
```
> Backend API sẵn sàng tại: [http://localhost:5000](http://localhost:5000)

---

### BƯỚC 2: KHỞI CHẠY GIAO DIỆN WEB SHOPEE (FRONTEND)

Mở Terminal thứ 2:
```bash
cd frontend
npm install
npm run dev
```
> Giao diện Shopee Web hiển thị tại: [http://localhost:3000](http://localhost:3000)

---

## 🎬 TỔNG TẮT KỊCH BẢN DEMO BẢO VỆ ĐỒ ÁN (3 SINH VIÊN)

1. **SV1 (Data Architect):**
   - Mở Web Shopee, chọn tài khoản **Nguyễn Văn An (`CUST-001`)** từ dropdown Header.
   - Bấm vào xem sản phẩm bất kỳ $\rightarrow$ Toast thông báo ghi nhận quan hệ `[:VIEWED]` vào đồ thị Neo4j.
   - Trình bày mô hình Constraints và B-Tree Indexes trong `database/schema.cypher`.

2. **SV2 (Query Specialist):**
   - Bấm nút **"Inspect Graph"** trên thanh Header để mở bảng điều khiển Cypher.
   - Trình chiếu thuật toán Collaborative Filtering và công thức tính điểm:
     $$\text{Score} = (c_2 \text{ BOUGHT} \times 3.0) + (c_2 \text{ VIEWED} \times 1.0)$$
   - Phân tích Operator Tree: `NodeIndexSeek` ($O(1)$) $\rightarrow$ `Expand(All)` (Index-free Adjacency) $\rightarrow$ `Filter` $\rightarrow$ `Top` (Min-Heap 10 phần tử).

3. **SV3 (Integrator & UI/UX):**
   - Bấm nút **"Mua Ngay"** trên một sản phẩm gợi ý.
   - Chứng minh danh sách **"GỢI Ý HÔM NAY"** tự động tính toán lại và làm mới tức thì trong 0.2s.
   - Chuyển sang tài khoản **`CUST-004` (Cold-Start)** để chứng minh hệ thống chuyển mượt mà sang Fallback Top Bán Chạy.
   - Mở Neo4j Browser [http://localhost:7474](http://localhost:7474) hiển thị đồ thị mạng nhện sinh động.

---

## 📚 TÀI LIỆU KÈM THEO
- **Hướng dẫn Deploy lên Render & Neo4j Aura Cloud:** [docs/HUONG_DAN_DEPLOY_RENDER.md](file:///d:/NoSQL/RecommendationProject/docs/HUONG_DAN_DEPLOY_RENDER.md)
- **Cẩm nang sử dụng Neo4j Desktop chi tiết:** [docs/HUONG_DAN_NEO4J_DESKTOP.md](file:///d:/NoSQL/RecommendationProject/docs/HUONG_DAN_NEO4J_DESKTOP.md)
- **Kịch bản chi tiết từng lời thoại:** [docs/KICH_BAN_DEMO_BAO_VE.md](file:///d:/NoSQL/RecommendationProject/docs/KICH_BAN_DEMO_BAO_VE.md)
- **Báo cáo kiến trúc kỹ thuật:** [docs/BAO_CAO_KIEN_TRUC.md](file:///d:/NoSQL/RecommendationProject/docs/BAO_CAO_KIEN_TRUC.md)
- **Phân tích chi tiết PROFILE & EXPLAIN:** [database/explain_profile_analysis.md](file:///d:/NoSQL/RecommendationProject/database/explain_profile_analysis.md)
