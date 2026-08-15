# Police SQL Academy — Comprehensive Solution Architecture & Redesign (v0.4 Addendum)

> **Tài liệu Giải pháp & Kiến trúc Đổi mới:** Giải quyết triệt để 6 lỗ hổng cốt lõi trong bản thiết kế v0.3 (Game Loop, Mobile UX, Engine Logic, Client Security, Pedagogy & Case Design).

---

# 1. Giải pháp Lỗ hổng 1: Khép kín "Insight-Detection Gap" (Engine & UI)

### ❓ Vấn đề v0.3
Engine làm sao biết người chơi đã *thực sự hiểu* kết quả SQL query để chuyển đổi thành `Discovered Fact`? (Ví dụ: Query trả về 50 dòng, trong đó có 1 dòng nghi phạm ở hiện trường).

### 💡 Giải pháp Thiết kế: Thao tác "Pin to Caseboard" (Đánh dấu Bằng chứng)

```
[ SQL Query Execution ]
          │
          ▼
[ Interactive Data Table Result ] ──► người chơi chạm (tap) vào dòng nghi vấn
          │
          ▼
[ UI Action: "Pin to Caseboard" ]
          │
          ▼
[ Investigation Engine Verification ]
    ├── Matching with Investigation Graph Conditions?
    │       ├── YES ➔ Transform to Official [Discovered Fact] + Unlock New Question
    │       └── NO  ➔ Save as [Weak Note / Irrelevant Tag] (Trừ nhẹ điểm hiệu năng)
```

#### Chi tiết Kỹ thuật:
1. **Interactive Output Grid (Lưới dữ liệu tương tác):** 
   - Mỗi dòng (row) trong bảng kết quả SQL được thiết kế dạng thẻ tương tác (Interactive Row).
   - Khi nhấp vào dòng bất kỳ, một pop-over ngắn xuất hiện: `[ 📌 Đánh dấu Bằng chứng ]` / `[ 🔍 Xem chi tiết ]`.
2. **Quy trình Xác minh của Engine (Fact Validation Contract):**
   - Mỗi `Required Discovery` trong `Investigation Graph` gắn liền với một **Predicate Set** (Tập điều kiện logic):
     ```json
     {
       "discoveryId": "JOHN_NEAR_SCENE",
       "targetTable": "gps_logs",
       "matchingPredicate": {
         "person_id": "suspect_john",
         "location_id": "hotel_blackwood",
         "timestamp_range": ["20:25", "20:45"]
       },
       "factTitle": "John xuất hiện tại Khách sạn Blackwood lúc 20:34",
       "unlocksQuestions": ["QUESTION_JOHN_CCTV", "QUESTION_JOHN_VEHICLE"]
     }
     ```
   - Khi người chơi Pin dòng dữ liệu: Engine kiểm tra dòng đó có thỏa mãn `matchingPredicate` hay không.
   - Nếu **ĐÚNG**: Bảng Bằng chứng (Evidence Board) phát hiệu ứng unlock sinh động, tạo thẻ `Discovered Fact`.
   - Nếu **SAI**: Dòng dữ liệu được lưu dưới dạng `Ghi chú cá nhân` (Personal Note) và hiển thị màu xám, kèm thông báo: *"Dữ liệu này chưa thể hiện điều gì bất thường."*

---

# 2. Giải pháp Lỗ hổng 2: Chống Brute-Force Query & Quản lý Tài nguyên

### ❓ Vấn đề v0.3
Không giới hạn lượt query/request khiến người chơi lười tư duy, chỉ cần gõ `SELECT * FROM table` để xem toàn bộ dữ liệu rồi dò bằng mắt.

### 💡 Giải pháp Thiết kế: Cơ chế "Data Noise Cap" & "Police API Rate"

```
                    QUERY THỰC THI
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
Rows Result ≤ 15                   Rows Result > 15
(Kết quả Tinh gọn)                 (Dữ liệu quá Nhiễu)
         │                                 │
         ▼                                 ▼
Hiển thị Data Grid                 Hiển thị Cảnh báo "Data Overload"
Người chơi soi & Pin Fact          Yêu cầu thêm điều kiện WHERE để lọc
```

#### Chi tiết Cơ chế:
1. **Giới hạn Nhiễu Dữ liệu (Data Noise Threshold - Max 15 rows):**
   - Nếu người chơi chạy `SELECT * FROM gps_logs` (trả về 500 dòng), màn hình **không hiện dữ liệu** mà hiện thông báo từ Bộ phận Công nghệ Cảnh sát:
     > ⚠️ *"Cảnh báo: Yêu cầu trả về 500 bản ghi! Hệ thống điều tra yêu cầu bạn thu hẹp điều kiện tìm kiếm (dùng `WHERE`) để tránh làm nhiễu hồ sơ vụ án."*
   - Bắt buộc người chơi phải suy luận thời gian/nghi phạm để viết câu lệnh `WHERE` chính xác.
2. **Năng lượng Điều tra (Action Points - AP):**
   - Mỗi vụ án cấp cho người chơi **100 AP (Hồ sơ Năng lượng)**.
   - 1 lần Request Bằng chứng mới = -10 AP.
   - 1 lần chạy Query thành công = -2 AP.
   - 1 lần Pin sai bằng chứng không liên quan = -5 AP.
   - Hoàn thành vụ án còn dư càng nhiều AP ➔ Xếp hạng sao càng cao (3 Sao = >80 AP).

---

# 3. Giải pháp Lỗ hổng 3: UX/UI Bàn phím Hybrid SQL trên Mobile

### ❓ Vấn đề v0.3
Free SQL gây ức chế gõ phím trên màn hình cảm ứng nhỏ; Guided SQL (điền vào chỗ trống) thì làm mất cảm giác đóng vai thám tử.

### 💡 Giải pháp Thiết kế: Bàn phím "Smart SQL Palette" & Thẻ Token (Chips)

![Mobile UX Mockup Concept]
```text
+-------------------------------------------------------+
|  SQL EDITOR                                           |
|  SELECT [person_id] [timestamp]                       |
|  FROM   [gps_logs]                                    |
|  WHERE  [person_id] = 'John' AND [time] BETWEEN ...   |
+-------------------------------------------------------+
|  SMART SUGGESTION BAR (CHIPS)                         |
|  [SELECT] [WHERE] [AND] [BETWEEN] [JOIN] [ON] [LIKE]  |
+-------------------------------------------------------+
|  SCHEMA QUICK-PICKER                                  |
|  Tables:  (gps_logs)  (phone_calls)  (suspects)       |
|  Columns: (person_id) (location) (timestamp)          |
+-------------------------------------------------------+
|  [ ⌨️ Bàn phím ]   [ 📋 Câu lệnh Mẫu ]   [ ▶️ CHẠY SQL ] |
+-------------------------------------------------------+
```

#### Chi tiết UX/UI:
1. **Gõ SQL bằng 1-Tap Chips (Không cần gõ từng ký tự):**
   - Người chơi không cần bật bàn phím QWERTY chuẩn để gõ `S-E-L-E-C-T`. 
   - Thanh công cụ phía trên hiển thị các **Thẻ Từ khóa (Keyword Chips)**, **Thẻ Tên Bảng (Table Chips)**, và **Thẻ Tên Cột (Column Chips)** dựa trên Schema vụ án hiện tại.
   - Nhấp vào thẻ `[gps_logs]` ➔ Tự động chèn `gps_logs` vào vị trí con trỏ.
2. **Autocomplete & Auto-Formatter thông minh:**
   - Tự động gợi ý tên giá trị chuỗi (VD: Khi gõ `WHERE person_id = `, hệ thống hiện danh sách gợi ý `['John', 'Mary', 'David']`).
3. **Chế độ Query Builder cho Người mới (Novice Mode):**
   - Ở 2 vụ án đầu tiên, chuyển đổi linh hoạt giữa giao diện visual query (chọn dropdown Bảng -> Chọn Cột -> Chọn Điều kiện) và giao diện xem trước câu lệnh SQL tương ứng để người chơi quen dần.

---

# 4. Giải pháp Lỗ hổng 4: Kiến trúc Bảo mật Dynamic Node-based SQLite

### ❓ Vấn đề v0.3
Client-side SQLite lưu sẵn toàn bộ vụ án làm rò rỉ dữ liệu (người chơi soi file `.db` hoặc query `sqlite_master` là thấy toàn bộ bảng ẩn và hung thủ).

### 💡 Giải pháp Kỹ thuật: "Dynamic In-Memory SQLite Injection"

```
[ Case Encrypted JSON Payload ] (Đã mã hóa AES-256)
               │
               ▼
[ Case Engine (Memory Only) ] ──► Kiểm tra điều kiện Request Bằng chứng
               │
               ▼
[ Dynamic Table Injection ]
Create & Insert DỮ LIỆU CỤ THỂ vào In-Memory SQLite (`:memory:`)
               │
               ▼
[ SQLite Database Context ] ➔ CHỈ CHỨA CÁC BẢNG ĐÃ UNLOCK!
```

#### Chi tiết Kiến trúc:
1. **Database Chạy Hoàn toàn trên RAM (`:memory:`):**
   - Mỗi ván chơi tạo một cơ sở dữ liệu SQLite trong bộ nhớ tạm (`:memory:`).
2. **Bảng chưa unlock = Chưa tồn tại:**
   - Đầu game, SQLite **chỉ chứa đúng 1 bảng công khai** (VD: `suspects`).
   - Khi người chơi thực hiện "Request Bằng chứng GPS": Case Engine giải mã khối dữ liệu GPS từ Encrypted JSON và chạy lệnh `CREATE TABLE gps_logs ...` + `INSERT INTO gps_logs ...` ngay trong RAM.
   - Nếu người chơi cố tình query `SELECT * FROM cctv_logs` trước khi unlock ➔ SQLite trả về lỗi chuẩn SQL: `Error: no such table: cctv_logs`.
   - Lệnh `SELECT name FROM sqlite_master;` tuyệt đối không lộ bất kỳ bảng ẩn nào!

---

# 5. Giải pháp Lỗ hổng 5: Khai thác Kịch bản & Cơ chế Loại trừ Nghi phạm

### ❓ Vấn đề v0.3
Case 001 chưa hoàn chỉnh kịch bản, thiếu cơ chế loại trừ nghi phạm (Exoneration) và chưa cân bằng độ khó.

### 💡 Thiết kế Chi tiết Kịch bản Case 001: "Khách sạn lúc 20:37"

#### 1. Danh sách Nghi phạm & Trạng thái Thực tế (Truth Model):
* **Victim:** Robert Blackwood (Chết lúc 20:37 tại Khách sạn Blackwood).
* **Nghi phạm 1: John Smith (HUNG THỦ)**
  - *Lời khai:* "Tôi ở nhà suốt từ 20:00 đến 21:00."
  - *Thực tế:* Đến khách sạn sát hại nạn nhân lúc 20:37 do mâu thuẫn tranh chấp tài sản.
* **Nghi phạm 2: Mary Adams (RED HERRING / KẺ NÓI DỐI VÔ TỘI)**
  - *Lời khai:* "Tôi làm việc ở văn phòng công ty cả tối."
  - *Thực tế:* Nói dối vì đi gặp người yêu cũ tại quán Cafe gần đó. **Vô tội** đối với án mạng.
* **Nghi phạm 3: David Miller (NGHI PHẠM CÓ ALIBI VỮNG CHẮC)**
  - *Lời khai:* "Tôi đi tàu hỏa tuyến Bắc-Nam chuyến 20:15."
  - *Thực tế:* Có vé tàu và nhật ký soát vé điện tử lúc 20:15. **Vô tội** (Khoảng cách không thể tới khách sạn lúc 20:37).

#### 2. Tiến trình Điều tra & SQL Logic:

```text
               BẮT ĐẦU VỤ ÁN #001
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
  Kiểm tra JOHN   Kiểm tra MARY   Kiểm tra DAVID
       │               │               │
       ▼               ▼               ▼
[ Request GPS ]  [ Request GPS ] [ Request Train ]
       │               │               │
  SQL Query       SQL Query       SQL Query
       │               │               │
       ▼               ▼               ▼
John ở Khách    Mary ở Quán     David trên Tàu
sạn (20:34)     Cafe (20:30)    lúc 20:15
       │               │               │
       ▼               ▼               ▼
[ BẮT GIỮ ]     [ LOẠI TRỪ ]    [ LOẠI TRỪ ]
(Hung thủ)      (Nói dối vụ     (Có Alibi
                 ngoại tình)     vững chắc)
```

#### 3. Bảng Dữ liệu SQL trong Case 001:

##### Bảng `suspects` (Có sẵn):
| id | name | statement |
|---|---|---|
| S01 | John Smith | Ở nhà từ 20:00 đến 21:00 |
| S02 | Mary Adams | Ở văn phòng làm việc |
| S03 | David Miller | Đi tàu hỏa chuyến 20:15 |

##### Bảng `gps_logs` (Unlock qua Request GPS):
| person_id | timestamp | location |
|---|---|---|
| S01 | 20:10 | Nhà riêng |
| S01 | 20:34 | Khách sạn Blackwood |
| S02 | 20:05 | Văn phòng |
| S02 | 20:30 | Quán Cafe Rose |

##### Bảng `transit_logs` (Unlock qua Request Giao thông):
| person_id | ticket_code | departure_time | station |
|---|---|---|---|
| S03 | TK-8821 | 20:15 | Ga Trung Tâm |

---

# 6. Giải pháp Lỗ hổng 6: Cấu trúc Màn Kết tội (Defensible Accusation System)

### ❓ Vấn đề v0.3
Màn kết tội cũ là các ô checkbox chọn lựa trắc nghiệm đơn giản, dễ bị đoán mò.

### 💡 Giải pháp Thiết kế: Sơ đồ Lập luận "Case Evidence Chain"

![Accusation Screen UI Concept]
```text
===========================================================
                LẬP HỒ SƠ LỆNH BẮT GIỮ
===========================================================

1. CHỌN HUNG THỦ:
   [ (•) John Smith ]   [ ( ) Mary Adams ]   [ ( ) David Miller ]

2. GHÉP BẰNG CHỨNG BẮT BUỘC (Kéo từ Evidence Board):
   
   [ Bằng chứng Hiện trường ] ◄─── [ 📌 Fact: John ở Khách sạn lúc 20:34 ]
   [ Bằng chứng Động cơ ]     ◄─── [ 📌 Fact: Giấy nợ 50,000$ với Nạn nhân ]
   [ Bằng chứng Bác bỏ Alibi] ◄─── [ 📌 Fact: Lời khai ở nhà bị GPS phản bác ]

3. XÁC NHẬN LOẠI TRỪ CÁC NGHI PHẠM KHÁC:
   [x] Đã chứng minh Mary ở Quán Cafe Rose (Không có mặt tại hiện trường)
   [x] Đã xác minh David trên chuyến tàu lúc 20:15 (Ngoại phạm khoảng cách)

-----------------------------------------------------------
                   [ ⚖️ TRÌNH LỆNH BẮT ]
===========================================================
```

#### Quy tắc Chấm điểm Đột phá:
* **Đoán đúng Hung thủ + Sai Bằng chứng:** 40/100 điểm (Thất bại - Thảm họa Pháp lý, bị Viện Kiểm sát bác bỏ).
* **Đoán đúng Hung thủ + Ghép đủ Bằng chứng + Loại trừ xong các nghi phạm:** 100/100 điểm (Thành công Xuất sắc - 3 Sao).

---

# 📊 Tóm tắt So sánh Kiến trúc v0.3 vs v0.4 (Solution)

| Hạng mục | Bản v0.3 (Cũ) | Bản v0.4 (Giải pháp Mới) |
|---|---|---|
| **Chuyển Fact từ SQL** | Tự động đoán (Thiếu logic Engine) | **Thao tác "Pin to Caseboard" tương tác trên Data Grid** |
| **Chống Brute-force** | Không giới hạn (Dễ xem lén toàn bộ) | **Max 15 Rows Noise Limit + Action Points (AP)** |
| **Gõ SQL Mobile** | Gõ phím hoặc điền chỗ trống thụ động | **Bàn phím Smart SQL Palette + Autocomplete Chips** |
| **Bảo mật SQLite** | Lưu file DB tĩnh ở Client (Dễ hack/soi) | **Dynamic In-Memory SQLite (`:memory:`) unlock theo Node** |
| **Cấu trúc Case 001** | Chưa hoàn thiện kịch bản nghi phạm phụ | **Có kịch bản loại trừ (Exoneration) hoàn chỉnh cho 3 người** |
| **Màn Kết tội** | Checkbox trắc nghiệm đơn giản | **Ghép chuỗi Bằng chứng (Evidence Chain) + Bác bỏ nghi phạm** |

---
*Bản giải pháp này giải quyết triệt me các rủi ro về mặt Game Design, UX/UI, System Architecture và Content Pipeline, sẵn sàng cho bước lập lập kế hoạch thi công (Implementation Plan).*
