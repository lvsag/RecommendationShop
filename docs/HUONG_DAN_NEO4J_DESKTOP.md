# HƯỚNG DẪN CHI TIẾT CÀI ĐẶT, IMPORT VÀ KHỞI CHẠY BẰNG NEO4J DESKTOP

Tài liệu này hướng dẫn từng bước chi tiết cách thiết lập dự án trên **Neo4j Desktop** (phiên bản giao diện đồ họa GUI chính thức của Neo4j), phù hợp nhất cho sinh viên thực hành môn học Cơ sở dữ liệu NoSQL / Graph Database.

---

## 📥 BƯỚC 1: TẢI VÀ CÀI ĐẶT NEO4J DESKTOP

1. Truy cập trang chủ chính thức của Neo4j: [https://neo4j.com/download/](https://neo4j.com/download/)
2. Chọn phiên bản **Neo4j Desktop** dành cho Windows (file cài đặt `.exe`).
3. Điền thông tin đăng ký (miễn phí) và lưu lại **Activation Key** (khóa kích hoạt) được cấp trên màn hình.
4. Chạy file cài đặt vừa tải về, dán Activation Key khi được yêu cầu để hoàn tất kích hoạt.

---

## 🛠️ BƯỚC 2: TẠO PROJECT VÀ KHỞI TẠO LOCAL DBMS

1. Mở ứng dụng **Neo4j Desktop**.
2. Ở menu bên trái, chọn Project có sẵn hoặc nhấn nút **"New Project"** để tạo mới (đặt tên ví dụ: `Shopee Recommendation`).
3. Trong giao diện Project, nhấn nút **"Add"** (ở góc phải) $\rightarrow$ chọn **"Local DBMS"**.
4. Điền các thông số khởi tạo:
   - **Name:** `RecommendationDBMS` (hoặc tên tùy thích).
   - **Password:** Đặt là `recommendation123` *(Khuyên dùng mật khẩu này để trùng khớp với cấu hình mặc định của dự án)*.
   - **Version:** Chọn phiên bản **`5.x`** (ví dụ: `5.20.0`, `5.21.0` hoặc mới nhất).
5. Nhấn nút **"Create"** và đợi trong 1-2 phút để Neo4j Desktop tải và khởi tạo cơ sở dữ liệu.

```
+-------------------------------------------------------------+
|                     Neo4j Desktop                           |
|  [Projects] > Shopee Recommendation                         |
|                                                             |
|  +-------------------------------------------------------+  |
|  |  RecommendationDBMS (Neo4j 5.26.0)                    |  |
|  |  Status: STOPPED                                      |  |
|  |  [ START ]   [ Open ]   [...]                         |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

---

## 🔌 BƯỚC 3: CÀI ĐẶT PLUGIN APOC (KHUYẾN NGHỊ)

1. Nhấp chuột vào tên DBMS vừa tạo (`RecommendationDBMS`).
2. Ở thanh bên phải (Details Panel), chuyển sang tab **"Plugins"**.
3. Tìm mục **APOC** (Awesome Procedures on Cypher).
4. Nhấn nút **"Install"** (hoặc **"Install and Restart"** nếu DBMS đang chạy).
5. Khi thấy dấu tích xanh kèm chữ **Installed**, plugin APOC đã sẵn sàng.

---

## ▶️ BƯỚC 4: KHỞI ĐỘNG CƠ SỞ DỮ LIỆU (START DBMS)

1. Rê chuột vào ô `RecommendationDBMS` và nhấn nút **"Start"** (màu xanh lá).
2. Đợi vài giây cho đến khi trạng thái chuyển sang **`Active`** (chấm tròn xanh lá sáng lên).
3. Các cổng kết nối mặc định:
   - **Giao thức Bolt (Driver Backend kết nối):** `bolt://localhost:7687`
   - **Giao diện Web Neo4j Browser:** `http://localhost:7474`

---

## ⚙️ BƯỚC 5: CẤU HÌNH FILE MÔI TRƯỜNG `backend/.env`

Mở file `backend/.env` trong thư mục dự án và kiểm tra/chỉnh sửa thông tin khớp với DBMS vừa tạo:

```env
PORT=5000
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=recommendation123
NEO4J_DATABASE=neo4j
```

> ⚠️ **LƯU Ý QUAN TRỌNG:**  
> Nếu ở **Bước 2** bạn đặt mật khẩu khác (ví dụ: `12345678` hoặc `admin`), bạn **bắt buộc** phải sửa dòng `NEO4J_PASSWORD` trong file `backend/.env` thành mật khẩu đó.

---

## 📦 BƯỚC 6: IMPORT VÀ NẠP DỮ LIỆU MẪU (2 CÁCH)

### CÁCH A: NẠP TỰ ĐỘNG BẰNG SEED SCRIPT (KHUYÊN DÙNG - NHANH & CHUẨN NHẤT)

Đây là cách nhanh nhất, đảm bảo tính liên kết đồ thị (Co-purchase clusters) chính xác 100%:

1. Mở cửa sổ Terminal (PowerShell hoặc Command Prompt).
2. Di chuyển vào thư mục `backend`:
   ```bash
   cd d:\NoSQL\RecommendationProject\backend
   ```
3. Chạy lệnh cài đặt thư viện (nếu chưa chạy trước đó):
   ```bash
   npm install
   ```
4. Chạy script nạp dữ liệu:
   ```bash
   npm run seed
   ```

**Kết quả hiển thị trên màn hình khi nạp thành công:**
```text
🚀 Bắt đầu quá trình Khởi tạo và Nạp Dữ liệu Mẫu (Seed Data) vào Neo4j...
🧹 Đang dọn dẹp các node và quan hệ cũ...
⚙️  Đang tạo Unique Constraints và Indexes...
📦 Đang tạo 6 Danh mục sản phẩm...
🏷️  Đang tạo 108 Sản phẩm thuộc 6 danh mục...
👥 Đang tạo 50 Khách hàng mẫu...
🔗 Đang tạo 450+ Cạnh quan hệ [:BOUGHT] và [:VIEWED] (Clusters)...
📊 Đang cập nhật lại số lượng đã bán dựa trên quan hệ BOUGHT...

======================================================
🎉 SEED DỮ LIỆU THÀNH CÔNG VÀ HOÀN TẤT!
- Danh mục (Category): 6
- Sản phẩm (Product):  108 (Yêu cầu: >= 100)
- Khách hàng (Customer): 50 (Yêu cầu: >= 50)
- Cạnh Mua (BOUGHT):   312
- Cạnh Xem (VIEWED):   145
- TỔNG QUAN HỆ:        457 (Yêu cầu: >= 350)
======================================================
```

---

### CÁCH B: IMPORT VÀ KIỂM TRA THỦ CÔNG QUA NEO4J BROWSER

Dành cho khi bạn muốn xem trực tiếp câu lệnh Cypher thực thi trên giao diện của Neo4j:

1. Trên Neo4j Desktop, tại DBMS đang `Active`, nhấn nút **"Open"** (hoặc mở trình duyệt web truy cập `http://localhost:7474`).
2. Đăng nhập với:
   - Connect URL: `bolt://localhost:7687`
   - Username: `neo4j`
   - Password: `recommendation123` (hoặc mật khẩu bạn đã tạo)
3. **Tạo Ràng buộc & Chỉ mục:**
   - Mở file `database/schema.cypher` trong dự án.
   - Sao chép toàn bộ nội dung và dán vào thanh nhập lệnh Cypher (trên cùng màn hình).
   - Nhấn nút **Run** (biểu tượng tam giác ▶).
   - Kiểm tra kết quả:
     ```cypher
     SHOW CONSTRAINTS;
     SHOW INDEXES;
     ```
4. **Kiểm tra dữ liệu sau khi Seed:**
   - Để đếm tổng số node và quan hệ:
     ```cypher
     MATCH (n) RETURN labels(n)[0] AS Label, count(n) AS SoLuong;
     ```
   - Để trực quan hóa một góc đồ thị liên kết Collaborative Filtering:
     ```cypher
     MATCH path = (c1:Customer {id: 'CUST-001'})-[:BOUGHT]->(p1:Product)
                  <-[:BOUGHT]-(c2:Customer)-[:BOUGHT]->(p2:Product)
     WHERE p2 <> p1
     RETURN path LIMIT 20;
     ```

---

## 🚀 BƯỚC 7: KHỞI CHẠY BACKEND VÀ FRONTEND

Sau khi Neo4j Desktop đã chạy và đã nạp dữ liệu xong:

### 1. Chạy Backend API (Port 5000):
Mở Terminal thứ 1:
```bash
cd d:\NoSQL\RecommendationProject\backend
npm run dev
```
> Khi thấy dòng:
> `✅ [Neo4j] Connected successfully to database!`  
> `🚀 Server Backend đang chạy tại: http://localhost:5000`  
> là Backend đã kết nối thành công tới Neo4j Desktop.

### 2. Chạy Frontend Web Shopee (Port 3000):
Mở Terminal thứ 2:
```bash
cd d:\NoSQL\RecommendationProject\frontend
npm run dev
```
> Mở trình duyệt truy cập: **`http://localhost:3000`** để trải nghiệm hệ thống gợi ý tương quan Shopee thời gian thực!

---

## ❓ CÁC VẤN ĐỀ THƯỜNG GẶP TRÊN NEO4J DESKTOP & CÁCH KHẮC PHỤC

| Hiện tượng | Nguyên nhân | Cách khắc phục |
| :--- | :--- | :--- |
| **Lỗi `Connection refused: bolt://localhost:7687`** | DBMS trên Neo4j Desktop chưa được bật. | Mở Neo4j Desktop và bấm nút **"Start"** để DBMS chuyển sang màu xanh lá (`Active`). |
| **Lỗi `The client is unauthorized due to authentication failure`** | Mật khẩu trong `backend/.env` không khớp với mật khẩu DBMS. | Kiểm tra lại mật khẩu lúc tạo DBMS. Mở file `backend/.env` và sửa dòng `NEO4J_PASSWORD=...` cho khớp. |
| **Cổng `7687` hoặc `7474` bị xung đột (Port already in use)** | Đang có một tiến trình Neo4j khác (hoặc container Docker) chạy ngầm. | Tắt container Docker (`docker compose down`) hoặc đổi port trong cài đặt `Settings` của DBMS trên Neo4j Desktop. |
| **Dữ liệu bị trùng lặp khi chạy seed nhiều lần** | Bạn muốn làm sạch hoàn toàn để nạp lại từ đầu. | Chạy lệnh `npm run seed` (script đã có sẵn câu lệnh `MATCH (n) DETACH DELETE n` để dọn sạch tự động). |
