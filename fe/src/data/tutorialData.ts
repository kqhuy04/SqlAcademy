import type { TutorialModule } from '@/types/tutorial.types';

// Helper to generate 5,000 radar logs for Module 7 (Indexing & Performance Tuning)
const generateRadarLogs5k = (): string => {
  const rows: string[] = [
    "(1, '29A-11111', 65, 'CAM-01', '2026-03-01 08:00:00')",
    "(2, '29A-88888', 120, 'CAM-02', '2026-03-01 08:05:00')",
    "(3, '51F-99999', 95, 'CAM-01', '2026-03-01 08:10:00')",
    "(4, '30H-44444', 55, 'CAM-03', '2026-03-01 08:15:00')",
    "(5, '29B-55555', 92, 'CAM-02', '2026-03-01 08:20:00')",
    "(6, '43C-77777', 105, 'CAM-01', '2026-03-01 08:25:00')",
    "(7, '14A-33333', 115, 'CAM-04', '2026-03-01 08:30:00')",
    "(8, '60A-22222', 98, 'CAM-02', '2026-03-01 08:35:00')",
  ];
  for (let i = 9; i <= 5000; i++) {
    const plate = '30E-' + (10000 + (i % 89999));
    const speed = 40 + ((i * 7) % 46); // 40 - 85 km/h
    const cam = 'CAM-0' + (1 + (i % 6));
    const hour = String(8 + Math.floor(i / 600)).padStart(2, '0');
    const min = String(i % 60).padStart(2, '0');
    const sec = String((i * 13) % 60).padStart(2, '0');
    rows.push(`(${i}, '${plate}', ${speed}, '${cam}', '2026-03-01 ${hour}:${min}:${sec}')`);
  }
  return 'INSERT INTO traffic_radar_logs VALUES \n' + rows.join(',\n') + ';';
};

export const TUTORIAL_MODULES: TutorialModule[] = [
  // =========================================================================
  // MODULE 1: CADET FUNDAMENTALS (DQL CĂN BẢN)
  // =========================================================================
  {
    id: 'module-1',
    orderIndex: 1,
    titleVi: 'Học phần 1: Thám Tử Nhập Môn - DQL Cơ Bản',
    titleEn: 'Module 1: Junior Detective Fundamentals - Basic DQL',
    descriptionVi: 'Làm quen với kho dữ liệu tội phạm, trích xuất hồ sơ, lọc điều kiện hiện trường và sắp xếp bằng chứng.',
    descriptionEn: 'Familiarize with the criminal database, retrieve dossiers, filter crime scene clues, and order evidence.',
    badgeCode: 'badge_cadet_fundamentals',
    badgeNameVi: 'Huy hiệu Thám Tử Xuất Sắc',
    badgeNameEn: 'Detective Graduate Badge',
    badgeIcon: 'ShieldAlert',
    lessons: [
      {
        id: 'lesson-1-0',
        moduleId: 'module-1',
        orderIndex: 0,
        titleVi: '1.0 Khái Quát Về SQL - Vũ Khí Trinh Thám Số (Giới Thiệu Chung)',
        titleEn: '1.0 Overview of SQL - The Digital Forensic Weapon (General Intro)',
        briefingVi: 'Chào mừng bạn đến với Cục Thám Tử SQL. Trước khi bắt tay vào giải mã các vụ án hình sự, bạn cần hiểu bản chất của vũ khí mạnh nhất trong tay mình: SQL (Structured Query Language). Hãy khám phá cách cơ sở dữ liệu lưu giữ sự thật và thực thi câu lệnh SQL đầu tiên để kích hoạt thẻ thám tử.',
        briefingEn: 'Welcome to the SQL Detective Bureau. Before diving into complex criminal cases, you must understand the most powerful weapon at your disposal: SQL (Structured Query Language). Discover how relational databases preserve truth and execute your first query to activate your detective credential.',
        theoryVi: `### 1. SQL là gì?
**SQL (Structured Query Language)** là ngôn ngữ chuẩn quốc tế được tạo ra để giao tiếp, truy vấn và quản lý các **Hệ Quản Trị Cơ Sở Dữ Liệu Quan Hệ (RDBMS)** như SQLite, PostgreSQL, MySQL hay SQL Server.

### 2. Tại sao Thám tử số cần SQL?
Trong kỷ nguyên kỹ thuật số, dữ liệu chính là **hiện trường vụ án**:
* **Dữ liệu không bao giờ nói dối:** Lời khai của nghi phạm có thể ngụy tạo, nhưng nhật ký giao dịch ngân hàng, lịch sử quẹt thẻ an ninh và định vị trạm phát sóng di động là bằng chứng bất biến.
* **Xâu chuỗi mắt xích tội phạm:** Tội phạm tinh vi luôn phân tán bằng chứng ở nhiều nơi. Bằng các lệnh truy vấn SQL, bạn có thể kết nối hàng triệu dòng dữ liệu từ nhiều bảng khác nhau để tái hiện chính xác diễn biến vụ án.
* **Tốc độ và chính xác tuyệt đối:** Thay vì rà soát thủ công hàng tháng trời, một câu lệnh SQL chuẩn xác sẽ khoanh vùng kẻ thủ ác chỉ trong vài mili-giây.

### 3. Cấu trúc một bảng dữ liệu quan hệ (Table)
Một cơ sở dữ liệu bao gồm nhiều **Bảng (Tables)**:
* **Hàng (Row / Record):** Đại diện cho một đối tượng hoặc một sự kiện cụ thể (ví dụ: một thám tử, một nghi can).
* **Cột (Column / Field):** Đại diện cho một thuộc tính của đối tượng (ví dụ: \`id\`, \`academy_name\`, \`city\`, \`motto\`).

### 4. Lệnh SQL đầu tiên của bạn
Để xem thông tin học viện từ bảng \`academy_info\`, câu lệnh đơn giản nhất là:
\`\`\`sql
SELECT * FROM academy_info;
\`\`\`
Dấu sao (\`*\`) mang ý nghĩa là "lấy tất cả các cột".`,
        theoryEn: `### 1. What is SQL?
**SQL (Structured Query Language)** is the international standard language created to communicate with, query, and manage **Relational Database Management Systems (RDBMS)** such as SQLite, PostgreSQL, MySQL, and SQL Server.

### 2. Why Forensic Detectives Need SQL?
In the digital age, databases are the **crime scene**:
* **Data never lies:** Suspect alibis can be fabricated, but financial transactions, security badge logs, and cell tower coordinates are immutable evidence.
* **Link fragmented clues:** Organized crime syndicates disperse their footprints. With SQL queries, you can correlate millions of records across separate tables to reconstruct the incident timeline.
* **Speed and precision:** Instead of manually sifting through filing cabinets for months, a single precise query isolates the perpetrator in milliseconds.

### 3. Structure of a Relational Table
A relational database consists of structured **Tables**:
* **Row (Record):** Represents a distinct entity or event (e.g., a detective, a suspect).
* **Column (Field):** Represents an attribute of that entity (e.g., \`id\`, \`academy_name\`, \`city\`, \`motto\`).

### 4. Your Very First SQL Query
To inspect the bureau records in table \`academy_info\`, the simplest command is:
\`\`\`sql
SELECT * FROM academy_info;
\`\`\`
The asterisk (\`*\`) wildcard means "retrieve all columns".`,
        detectiveAnalogy: {
          actionVi: 'Nhận thẻ căn cước đặc vụ & Khảo sát trụ sở học viện',
          actionEn: 'Receive your detective badge & Inspect academy records',
          storyVi: 'Khi một đặc vụ mới bước chân vào sở chỉ huy, điều đầu tiên là nộp thẻ căn cước và mở kho lưu trữ trung tâm để kiểm tra thông tin của đơn vị. Câu lệnh SELECT * FROM academy_info chính là bước chào sân chính thức xác nhận bạn đã sẵn sàng tiếp nhận các hồ sơ vụ án.',
          storyEn: 'Upon reporting to headquarters, a new detective presents their badge and inspects the central bureau registry. Executing SELECT * FROM academy_info is your official induction into forensic operations.',
          syntaxTakeawayVi: 'SELECT * FROM [Bảng cần xem] — Xem toàn bộ dữ liệu của bảng',
          syntaxTakeawayEn: 'SELECT * FROM [Table] — Inspect all columns and rows in table',
        },
        interactiveExample: {
          query: 'SELECT * FROM academy_info;',
          captionVi: 'Truy vấn toàn bộ thông tin học viện thám tử',
          captionEn: 'Inspect all bureau headquarters information',
        },
        objectiveVi: 'Viết câu lệnh `SELECT * FROM academy_info;` để trích xuất toàn bộ dữ liệu giới thiệu về Học viện Thám tử SQL.',
        objectiveEn: 'Write query `SELECT * FROM academy_info;` to retrieve all introduction records of the SQL Detective Academy.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT * FROM academy_info;',
        schemaSql: `CREATE TABLE academy_info (
  id INTEGER PRIMARY KEY,
  academy_name TEXT NOT NULL,
  headquarters TEXT NOT NULL,
  division TEXT NOT NULL,
  motto TEXT NOT NULL,
  established_year INTEGER NOT NULL
);`,
        seedSql: `INSERT INTO academy_info VALUES 
(1, 'SQL Police Academy', 'Noir City Police Dept', 'Forensic Data Intelligence', 'Data Never Lies', 1947);`,
        tables: [
          {
            name: 'academy_info',
            columns: [
              { name: 'id', type: 'INTEGER', isPk: true, noteVi: 'Mã đơn vị', noteEn: 'Bureau ID' },
              { name: 'academy_name', type: 'TEXT', noteVi: 'Tên học viện', noteEn: 'Academy name' },
              { name: 'headquarters', type: 'TEXT', noteVi: 'Trụ sở chính', noteEn: 'Headquarters' },
              { name: 'division', type: 'TEXT', noteVi: 'Phòng ban nghiệp vụ', noteEn: 'Division' },
              { name: 'motto', type: 'TEXT', noteVi: 'Khẩu hiệu điều tra', noteEn: 'Forensic motto' },
              { name: 'established_year', type: 'INTEGER', noteVi: 'Năm thành lập', noteEn: 'Year established' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Cấu trúc cơ bản',
            titleEn: 'Hint 1: Basic Structure',
            textVi: 'Sử dụng từ khóa SELECT và FROM để lấy dữ liệu từ bảng academy_info.',
            textEn: 'Use SELECT and FROM keywords to query table academy_info.',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Ký tự đại diện *',
            titleEn: 'Hint 2: Asterisk * wildcard',
            textVi: 'Dùng dấu hoa thị * sau SELECT để lấy tất cả các cột: SELECT * FROM ...',
            textEn: 'Use * after SELECT to fetch all columns: SELECT * FROM ...',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT * FROM academy_info;',
            textEn: 'SELECT * FROM academy_info;',
          },
        ],
        requiredKeywords: ['SELECT', 'FROM'],
        xpReward: 10,
      },
      {
        id: 'lesson-1-1',
        moduleId: 'module-1',
        orderIndex: 1,
        titleVi: '1.1 Trích Xuất Hồ Sơ Tội Phạm (SELECT & FROM)',
        titleEn: '1.1 Retrieve Criminal Records (SELECT & FROM)',
        briefingVi: 'Chào mừng bạn gia nhập Cục Thám Tử SQL (SQL Detective Bureau). Nhiệm vụ đầu tiên của bạn tại phòng lưu trữ hồ sơ: trích xuất danh sách tên và bí danh (alias) của các nghi phạm đang nằm trong sổ đen.',
        briefingEn: 'Welcome to the SQL Detective Bureau. Your first assignment in the forensic archives: retrieve the full names and criminal aliases of all active suspects on the watch list.',
        theoryVi: `### Cú pháp \`SELECT\` và \`FROM\`
Mọi câu lệnh truy vấn dữ liệu (Data Query Language - DQL) bắt đầu bằng \`SELECT\` (chọn cột nào) và \`FROM\` (lấy từ bảng nào).
* \`SELECT column1, column2 FROM table_name;\`: Lấy các cột cụ thể.
* \`SELECT * FROM table_name;\`: Lấy tất cả các cột.
* Bí danh cột (\`AS\`): Giúp đặt tên hiển thị thân thiện hơn, ví dụ: \`SELECT full_name AS suspect_name\`.`,
        theoryEn: `### Syntax \`SELECT\` and \`FROM\`
Every Data Query Language (DQL) query begins with \`SELECT\` (which columns) and \`FROM\` (which table).
* \`SELECT column1, column2 FROM table_name;\`: Retrieve specific columns.
* \`SELECT * FROM table_name;\`: Retrieve all columns.
* Column alias (\`AS\`): Assigns readable display aliases, e.g., \`SELECT full_name AS suspect_name\`.`,
        detectiveAnalogy: {
          actionVi: 'Mở tủ hồ sơ & Chỉ rút ra những thông tin cần soi xét',
          actionEn: 'Open the filing cabinet & Extract only essential clues',
          storyVi: 'Khi bước vào kho lưu trữ hồ sơ nghi phạm (bảng suspects), thay vì bê cả tập tài liệu nặng trịch hàng ngàn trang, thám tử chỉ dùng SELECT để trích xuất đúng 2 thông tin cốt lõi: Họ tên (full_name) và Bí danh (alias) dán lên bảng điều tra.',
          storyEn: 'Entering the suspects archive, instead of hauling entire crates of dossiers, a detective uses SELECT to pinpoint just 2 crucial fields: legal name and street alias for the incident board.',
          syntaxTakeawayVi: 'SELECT [Cột cần xem] FROM [Tủ hồ sơ]',
          syntaxTakeawayEn: 'SELECT [Columns] FROM [Dossier Table]',
        },
        interactiveExample: {
          query: 'SELECT full_name, alias, age FROM suspects;',
          captionVi: 'Truy vấn danh sách họ tên, bí danh và tuổi của nghi phạm',
          captionEn: 'Query suspect names, aliases, and ages',
        },
        objectiveVi: 'Viết truy vấn lấy 2 cột: `full_name` (đặt bí danh là `suspect_name`) và `alias` từ bảng `suspects`.',
        objectiveEn: 'Write a query selecting 2 columns: `full_name` (aliased as `suspect_name`) and `alias` from `suspects`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT full_name AS suspect_name, alias FROM suspects;',
        schemaSql: `CREATE TABLE suspects (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  alias TEXT,
  age INTEGER,
  height_cm INTEGER,
  eye_color TEXT,
  criminal_record TEXT,
  last_seen_district TEXT
);`,
        seedSql: `INSERT INTO suspects VALUES 
(1, 'Marcus Vance', 'The Ghost', 38, 182, 'Brown', 'Armed Robbery', 'District 1'),
(2, 'Elena Rostova', 'Viper', 29, 168, 'Green', 'Cyber Espionage', 'District 4'),
(3, 'Damian Cruz', 'Hammer', 45, 190, 'Black', 'Extortion', 'District 1'),
(4, 'Sophia Chen', 'Shadow', 31, 165, 'Brown', 'Counterfeiting', 'District 2'),
(5, 'Lucas Silva', 'Snake', 26, 175, 'Blue', 'Smuggling', 'District 4');`,
        tables: [
          {
            name: 'suspects',
            columns: [
              { name: 'id', type: 'INTEGER', isPk: true, noteVi: 'Mã hồ sơ', noteEn: 'Suspect ID' },
              { name: 'full_name', type: 'TEXT', noteVi: 'Họ và tên thật', noteEn: 'Legal full name' },
              { name: 'alias', type: 'TEXT', noteVi: 'Bí danh giang hồ', noteEn: 'Criminal alias' },
              { name: 'age', type: 'INTEGER', noteVi: 'Tuổi', noteEn: 'Age' },
              { name: 'height_cm', type: 'INTEGER', noteVi: 'Chiều cao (cm)', noteEn: 'Height in cm' },
              { name: 'eye_color', type: 'TEXT', noteVi: 'Màu mắt', noteEn: 'Eye color' },
              { name: 'criminal_record', type: 'TEXT', noteVi: 'Tiền án tiền sự', noteEn: 'Criminal record' },
              { name: 'last_seen_district', type: 'TEXT', noteVi: 'Địa bàn xuất hiện lần cuối', noteEn: 'Last known district' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Cấu trúc cơ bản',
            titleEn: 'Hint 1: Basic Structure',
            textVi: 'Sử dụng SELECT và liệt kê 2 cột cần lấy từ bảng suspects.',
            textEn: 'Use SELECT and list the 2 requested columns from suspects.',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Đặt bí danh AS',
            titleEn: 'Hint 2: Using AS alias',
            textVi: 'Cú pháp đặt alias: full_name AS suspect_name, alias',
            textEn: 'Alias syntax: full_name AS suspect_name, alias',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT full_name AS suspect_name, alias FROM suspects;',
            textEn: 'SELECT full_name AS suspect_name, alias FROM suspects;',
          },
        ],
        requiredKeywords: ['SELECT', 'FROM', 'AS'],
        xpReward: 15,
      },
      {
        id: 'lesson-1-2',
        moduleId: 'module-1',
        orderIndex: 2,
        titleVi: '1.2 Lọc Dấu Vết Hiện Trường (Mệnh đề WHERE & Toán tử)',
        titleEn: '1.2 Filter Crime Scene Clues (WHERE & Operators)',
        briefingVi: 'Ngân hàng Trung tâm Noir City vừa bị đột nhập. Nhân chứng duy nhất khai kẻ cướp cao trên 175cm và đang lẩn trốn tại Quận 1. Đã đến lúc kích hoạt mệnh đề WHERE để khoanh vùng nghi can.',
        briefingEn: 'The Central Bank of Noir City was robbed. The sole witness spotted a suspect taller than 175cm fleeing towards District 1. Deploy the WHERE clause to narrow down the culprits.',
        theoryVi: `### Mệnh đề WHERE: Chiếc Kính Lọc Hiện Trường
Mệnh đề \`WHERE\` đứng sau \`FROM\`, dùng để lọc từng dòng dữ liệu theo tiêu chuẩn logic:
* **Toán tử so sánh:** \`=\` (bằng), \`!=\` hoặc \`<>\` (khác), \`>\`, \`<\`, \`>=\`, \`<=\`.
* **Toán tử logic kết hợp:**
  * \`AND\`: Cả hai manh mối đều phải đồng thời đúng.
  * \`OR\`: Chỉ cần một trong các manh mối đúng.
  * \`NOT\`: Phủ định điều kiện (loại trừ).`,
        theoryEn: `### The WHERE Clause: Crime Scene Filter
The \`WHERE\` clause follows \`FROM\` to filter rows based on boolean logic:
* **Comparison operators:** \`=\`, \`!=\` or \`<>\`, \`>\`, \`<\`, \`>=\`, \`<=\`.
* **Logical operators:** \`AND\`, \`OR\`, \`NOT\`.`,
        detectiveAnalogy: {
          actionVi: 'Cầm kính lúp sàng lọc nghi can theo lời khai nhân chứng',
          actionEn: 'Filter suspects using witness testimony criteria',
          storyVi: "Nhân chứng tại ngân hàng báo rằng hung thủ cao trên 175cm và lẩn trốn ở Quận 1. Mệnh đề WHERE giống như tấm lưới lọc hiện trường: thám tử đặt tiêu chuẩn (height_cm > 175 AND last_seen_district = 'Quận 1') để lập tức gạt bỏ kẻ vô can, chỉ giữ lại kẻ tình nghi thực sự.",
          storyEn: 'A bank heist witness claims the thief was over 175cm and fled to District 1. WHERE acts as a crime scene sieve: filtering suspects by exact physical and geographic criteria.',
          syntaxTakeawayVi: 'WHERE = Tấm lưới lọc hiện trường',
          syntaxTakeawayEn: 'WHERE = Crime Scene Filter',
        },
        interactiveExample: {
          query: "SELECT full_name, height_cm, last_seen_district FROM suspects WHERE height_cm > 175 AND last_seen_district = 'Quận 1';",
          captionVi: 'Khoanh vùng nghi phạm cao trên 175cm lẩn trốn tại Quận 1',
          captionEn: 'Filter suspects taller than 175cm in District 1',
        },
        objectiveVi: 'Tìm `full_name`, `alias`, `height_cm` của tất cả nghi phạm có `height_cm > 175` VÀ `last_seen_district = \'Quận 1\'`.',
        objectiveEn: 'Select `full_name`, `alias`, `height_cm` for all suspects with `height_cm > 175` AND `last_seen_district = \'Quận 1\'`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: "SELECT full_name, alias, height_cm FROM suspects WHERE height_cm > 175 AND last_seen_district = 'Quận 1';",
        schemaSql: `CREATE TABLE suspects (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  alias TEXT,
  age INTEGER,
  height_cm INTEGER,
  eye_color TEXT,
  criminal_record TEXT,
  last_seen_district TEXT,
  status TEXT NOT NULL
);`,
        seedSql: `INSERT INTO suspects VALUES 
(1, 'Marcus Vance', 'Bóng Ma', 38, 182, 'Brown', 'Cướp ngân hàng', 'Quận 1', 'WANTED'),
(2, 'Elena Rostova', 'Rắn Lục', 29, 168, 'Green', 'Gián điệp mạng', 'Quận 4', 'WANTED'),
(3, 'Damian Cruz', 'Búa Tạ', 45, 190, 'Black', 'Tống tiền', 'Quận 1', 'WANTED'),
(4, 'Sophia Chen', 'Hắc Miêu', 31, 165, 'Brown', 'Làm tiền giả', 'Quận 2', 'IN_CUSTODY'),
(5, 'Lucas Silva', 'Sát Thủ Máu Lạnh', 26, 178, 'Blue', 'Buôn lậu vũ khí', 'Quận 1', 'WANTED'),
(6, 'Viktor Frank', 'Cáo Già', 52, 172, 'Brown', 'Lừa đảo tài chính', 'Quận 3', 'CLEARED'),
(7, 'Arthur Pendelton', 'Gã Quý Tộc', 41, 185, 'Blue', 'Rửa tiền', 'Quận 1', 'WANTED'),
(8, 'Mia Tanaka', 'Bóng Đêm', 24, 160, 'Black', 'Đột nhập', 'Quận 2', 'WANTED'),
(9, 'Boris Blade', 'Đồ Tể', 35, 188, 'Brown', 'Hành hung', 'Quận 4', 'IN_CUSTODY'),
(10, 'Tommy O''Connor', 'Mắt Chó Săn', 33, 176, 'Brown', 'Tiêu thụ đồ gian', 'Quận 1', 'WANTED');`,
        tables: [
          {
            name: 'suspects',
            columns: [
              { name: 'id', type: 'INTEGER', isPk: true, noteVi: 'Mã hồ sơ', noteEn: 'Suspect ID' },
              { name: 'full_name', type: 'TEXT', noteVi: 'Họ tên nghi phạm', noteEn: 'Full name' },
              { name: 'alias', type: 'TEXT', noteVi: 'Bí danh giang hồ', noteEn: 'Criminal alias' },
              { name: 'age', type: 'INTEGER', noteVi: 'Độ tuổi', noteEn: 'Age' },
              { name: 'height_cm', type: 'INTEGER', noteVi: 'Chiều cao (cm)', noteEn: 'Height in cm' },
              { name: 'eye_color', type: 'TEXT', noteVi: 'Màu mắt', noteEn: 'Eye color' },
              { name: 'criminal_record', type: 'TEXT', noteVi: 'Tiền án tiền sự', noteEn: 'Criminal record' },
              { name: 'last_seen_district', type: 'TEXT', noteVi: 'Địa bàn xuất hiện gần nhất', noteEn: 'Last known district' },
              { name: 'status', type: 'TEXT', noteVi: 'Trạng thái (WANTED / IN_CUSTODY / CLEARED)', noteEn: 'Suspect status' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Mệnh đề WHERE',
            titleEn: 'Hint 1: WHERE clause',
            textVi: 'Cần thêm WHERE sau tên bảng suspects để lọc theo tiêu chí.',
            textEn: 'Add WHERE after suspects table name.',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Kết hợp điều kiện AND',
            titleEn: 'Hint 2: Combine with AND',
            textVi: "WHERE height_cm > 175 AND last_seen_district = 'Quận 1'",
            textEn: "WHERE height_cm > 175 AND last_seen_district = 'Quận 1'",
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: "SELECT full_name, alias, height_cm FROM suspects WHERE height_cm > 175 AND last_seen_district = 'Quận 1';",
            textEn: "SELECT full_name, alias, height_cm FROM suspects WHERE height_cm > 175 AND last_seen_district = 'Quận 1';",
          },
        ],
        requiredKeywords: ['WHERE', 'AND'],
        xpReward: 15,

        // ====================================================================
        // NEW 3-TAB PEDAGOGICAL CONTENT
        // ====================================================================
        tab1Dossier: {
          casePain: {
            storyVi: "Vụ cướp Ngân hàng Noir City diễn ra lúc rạng sáng. Nhân chứng duy nhất khai báo: 'Kẻ thủ ác rất cao lớn, trên 1m75 và đang ẩn náu tại Quận 1.' Bạn vội vã mở kho hồ sơ truy nã ra xem:",
            naiveQuery: 'SELECT full_name, height_cm, last_seen_district FROM suspects;',
            naiveResultNoteVi: 'Hồ sơ trả về một danh sách hỗn loạn gồm cả kẻ chỉ cao 1m60 và kẻ đang ở Quận 2, Quận 4. Nếu đọc thủ công từng dòng, tên cướp đã kịp tẩu thoát khỏi thành phố!',
          },
          metaphor: {
            metaphorVi: 'Mệnh đề WHERE là chiếc kính lọc hiện trường: bạn đưa ra tiêu chí nào, cơ sở dữ liệu sẽ lập tức gạt bỏ những kẻ vô can, chỉ giữ lại đúng những kẻ khớp lệnh.',
            visualType: 'sieve',
          },
          liveQuery: {
            fullQuery: "SELECT full_name, height_cm, last_seen_district\nFROM suspects\nWHERE height_cm > 175 AND last_seen_district = 'Quận 1';",
            clauses: [
              {
                keyword: 'SELECT',
                code: 'SELECT full_name, height_cm, last_seen_district',
                explanationVi: 'Chỉ rọi đèn vào 3 cột nhận dạng quan trọng, bỏ qua các thông tin rườm rà khác.',
                visualEffect: 'keep_columns',
              },
              {
                keyword: 'FROM',
                code: 'FROM suspects',
                explanationVi: 'Mở đúng ngăn tủ hồ sơ nghi phạm của Sở Cảnh sát Noir City.',
                visualEffect: 'source_table',
              },
              {
                keyword: 'WHERE',
                code: "WHERE height_cm > 175 AND last_seen_district = 'Quận 1'",
                explanationVi: 'Lưới lọc 2 tầng: Loại bỏ bất kỳ ai thấp hơn hoặc bằng 1m75, đồng thời gạt đi những kẻ không ở Quận 1.',
                visualEffect: 'filter_rows',
              },
            ],
          },
        },

        tab2Interrogation: {
          predictionQuiz: {
            questionVi: "Hồ sơ đang cần rà soát đối tượng truy nã trẻ tuổi. Bạn đoán xem câu lệnh sau sẽ làm lộ diện bao nhiêu kẻ tình nghi?",
            query: "SELECT full_name FROM suspects WHERE status = 'WANTED' AND age < 30;",
            options: [
              { id: 'opt-1', textVi: '0 người', isCorrect: false },
              { id: 'opt-2', textVi: '3 người', isCorrect: true },
              { id: 'opt-3', textVi: '6 người', isCorrect: false },
              { id: 'opt-4', textVi: 'Lỗi cú pháp', isCorrect: false },
            ],
            explanationVi: "Điều kiện status = 'WANTED' lọc ra 6 kẻ bị truy nã, nhưng nối thêm AND age < 30 chỉ giữ lại đúng 3 đối tượng dưới 30 tuổi: Elena Rostova (29 tuổi), Lucas Silva (26 tuổi) và Mia Tanaka (24 tuổi).",
          },
          bugBounties: [
            {
              id: 'bug-quotes',
              titleVi: 'Bẫy 1: Quên dấu nháy quanh chữ',
              buggyQuery: "SELECT * FROM suspects WHERE last_seen_district = Quận 1;",
              expectedErrorSnippet: 'syntax error',
              flashcardVi: "Văn bản/chuỗi luôn phải bọc trong dấu nháy đơn 'Quận 1'. Nếu viết trần, SQLite sẽ lầm tưởng đó là tên một cột trong bảng!",
            },
            {
              id: 'bug-operand',
              titleVi: 'Bẫy 2: Thiếu vế trái sau chữ AND',
              buggyQuery: "SELECT * FROM suspects WHERE height_cm > 175 AND < 190;",
              expectedErrorSnippet: 'syntax error',
              flashcardVi: "SQL không biết tự ngầm hiểu! Sau AND hoặc OR bắt buộc phải viết lại tên cột: AND height_cm < 190.",
            },
            {
              id: 'bug-case',
              titleVi: 'Bẫy 3: Sai quy cách chữ hoa/thường trong nháy',
              buggyQuery: "SELECT full_name FROM suspects WHERE status = 'wanted';",
              expectedErrorSnippet: '0 rows',
              flashcardVi: "Chuỗi trong nháy đơn so sánh chính xác từng ký tự: 'WANTED' khác hoàn toàn với 'wanted'. Hãy đối chiếu dữ liệu gốc!",
            },
          ],
          cheatCards: [
            {
              keyword: '=',
              labelVi: 'Khớp chính xác',
              syntaxTemplate: "status = 'WANTED'",
              exampleQuery: "SELECT * FROM suspects WHERE status = 'WANTED';",
              descriptionVi: 'Tìm những bản ghi có giá trị bằng chính xác mẫu so sánh.',
            },
            {
              keyword: '!=',
              labelVi: 'Loại trừ đối tượng',
              syntaxTemplate: "status != 'CLEARED'",
              exampleQuery: "SELECT * FROM suspects WHERE status != 'CLEARED';",
              descriptionVi: 'Loại bỏ những đối tượng đã được minh oan khỏi diện nghi vấn.',
            },
            {
              keyword: '>',
              labelVi: 'So sánh chỉ số',
              syntaxTemplate: "height_cm >= 180",
              exampleQuery: "SELECT * FROM suspects WHERE height_cm >= 180;",
              descriptionVi: 'Áp dụng cho số đo (chiều cao, tuổi tác, tiền tang vật). Không dùng nháy đơn cho số.',
            },
            {
              keyword: 'AND',
              labelVi: 'Thắt chặt tiêu chí',
              syntaxTemplate: "age > 30 AND eye_color = 'Brown'",
              exampleQuery: "SELECT * FROM suspects WHERE age > 30 AND eye_color = 'Brown';",
              descriptionVi: 'Bắt buộc tất cả các manh mối đều phải đồng thời thỏa mãn.',
            },
            {
              keyword: 'OR',
              labelVi: 'Mở rộng diện rà soát',
              syntaxTemplate: "alias = 'Bóng Ma' OR alias = 'Búa Tạ'",
              exampleQuery: "SELECT * FROM suspects WHERE alias = 'Bóng Ma' OR alias = 'Búa Tạ';",
              descriptionVi: 'Chỉ cần một trong các manh mối trùng khớp là được giữ lại.',
            },
          ],
        },

        tab3SolveCase: {
          challenges: [
            {
              id: 'ch-1',
              difficulty: 1,
              titleVi: 'Thử thách 1: Lệnh truy nã khẩn cấp',
              missionVi: "Đội tuần tra vừa phát hiện một kẻ khả nghi mang bí danh chính xác là 'Bóng Ma'. Hãy trích xuất họ tên thật (full_name) và địa bàn ẩn náu (last_seen_district) của kẻ này.",
              starterCode: "SELECT full_name, last_seen_district\nFROM suspects\nWHERE ",
              expectedQuery: "SELECT full_name, last_seen_district FROM suspects WHERE alias = 'Bóng Ma';",
              hints: {
                level1ConceptVi: "Dùng mệnh đề WHERE với toán tử so sánh bằng (=) trên cột bí danh.",
                level2TemplateVi: "SELECT full_name, last_seen_district FROM suspects WHERE alias = '...';",
                level3SolutionQuery: "SELECT full_name, last_seen_district FROM suspects WHERE alias = 'Bóng Ma';",
              },
            },
            {
              id: 'ch-2',
              difficulty: 2,
              titleVi: 'Thử thách 2: Nhân dạng kép tại hiện trường',
              missionVi: "Nhân chứng nhìn thấy một kẻ mắt màu nâu ('Brown') và dáng người cao trên 180cm ('height_cm > 180'). Hãy lập danh sách gồm họ tên (full_name), chiều cao (height_cm) và màu mắt (eye_color) của các đối tượng khớp cả hai đặc điểm trên.",
              starterCode: "SELECT full_name, height_cm, eye_color\nFROM suspects\nWHERE ",
              expectedQuery: "SELECT full_name, height_cm, eye_color FROM suspects WHERE eye_color = 'Brown' AND height_cm > 180;",
              hints: {
                level1ConceptVi: "Kết nối 2 điều kiện kiểm tra màu mắt và chiều cao bằng từ khóa AND.",
                level2TemplateVi: "SELECT full_name, height_cm, eye_color FROM suspects WHERE eye_color = '...' AND height_cm > ...;",
                level3SolutionQuery: "SELECT full_name, height_cm, eye_color FROM suspects WHERE eye_color = 'Brown' AND height_cm > 180;",
              },
            },
            {
              id: 'ch-3',
              difficulty: 3,
              titleVi: 'Thử thách 3: Giám sát địa bàn trọng điểm',
              missionVi: "Thanh tra yêu cầu theo dõi tất cả đối tượng đang bị truy nã ('status = WANTED') có mặt tại 'Quận 1' hoặc 'Quận 4'. Hãy lấy họ tên (full_name), địa bàn (last_seen_district) và trạng thái (status).",
              starterCode: "SELECT full_name, last_seen_district, status\nFROM suspects\nWHERE ",
              expectedQuery: "SELECT full_name, last_seen_district, status FROM suspects WHERE status = 'WANTED' AND (last_seen_district = 'Quận 1' OR last_seen_district = 'Quận 4');",
              hints: {
                level1ConceptVi: "Khi dùng chung AND và OR, hãy đặt nhóm điều kiện OR vào trong cặp ngoặc đơn (...) để máy hiểu đúng ưu tiên.",
                level2TemplateVi: "SELECT full_name, last_seen_district, status FROM suspects WHERE status = 'WANTED' AND (last_seen_district = '...' OR last_seen_district = '...');",
                level3SolutionQuery: "SELECT full_name, last_seen_district, status FROM suspects WHERE status = 'WANTED' AND (last_seen_district = 'Quận 1' OR last_seen_district = 'Quận 4');",
              },
            },
            {
              id: 'ch-4',
              difficulty: 4,
              isTrap: true,
              titleVi: 'Thử thách 4: Bẫy rút gọn của tân binh',
              missionVi: "Chuyên án đặc biệt nhắm vào nhóm tội phạm có độ tuổi trên 30 và dưới 50, mang tiền án 'Cướp ngân hàng'. Tránh thói quen viết tắt thiếu vế trái để không bị sập bẫy cú pháp. Hãy lấy họ tên (full_name), tuổi (age) và tiền án (criminal_record).",
              starterCode: "SELECT full_name, age, criminal_record\nFROM suspects\nWHERE ",
              expectedQuery: "SELECT full_name, age, criminal_record FROM suspects WHERE age > 30 AND age < 50 AND criminal_record = 'Cướp ngân hàng';",
              hints: {
                level1ConceptVi: "Nhớ quy tắc thép: Cả hai vế của AND đều phải có tên cột (age > 30 AND age < 50), không được viết tắt 'AND < 50'.",
                level2TemplateVi: "SELECT full_name, age, criminal_record FROM suspects WHERE age > 30 AND age < 50 AND criminal_record = '...';",
                level3SolutionQuery: "SELECT full_name, age, criminal_record FROM suspects WHERE age > 30 AND age < 50 AND criminal_record = 'Cướp ngân hàng';",
              },
            },
          ],
          takeawayFlashcard: {
            summaryLinesVi: [
              "WHERE đứng sau FROM, lọc dữ liệu từng hàng trước khi trả về kết quả.",
              "Văn bản bọc trong nháy đơn '...', số viết trực tiếp không dùng nháy.",
              "Sau AND và OR bắt buộc viết lại tên cột; dùng ngoặc đơn (...) khi phối hợp.",
            ],
            reviewTopic: 'Mệnh đề WHERE & Toán tử so sánh/logic',
          },
        },
      },
      {
        id: 'lesson-1-3',
        moduleId: 'module-1',
        orderIndex: 3,
        titleVi: '1.3 Khoanh Vùng Nghi Phạm (IN, BETWEEN & NULL)',
        titleEn: '1.3 Range & Null Surveillance (IN, BETWEEN & NULL)',
        briefingVi: 'Bộ phận pháp y xác định độ tuổi của nghi can nằm trong khoảng từ 28 đến 35 tuổi, và đối tượng từng xuất hiện ở một trong các địa bàn trọng điểm: District 2 hoặc District 4.',
        briefingEn: 'Forensic profilers estimate the culprit’s age between 28 and 35, operating in either District 2 or District 4.',
        theoryVi: `### Toán tử \`BETWEEN\`, \`IN\` và Xử lý \`NULL\`
* \`column BETWEEN val1 AND val2\`: Lọc giá trị nằm trong đoạn [val1, val2] (bao gồm cả 2 đầu).
* \`column IN (val1, val2, ...)\`: Kiểm tra giá trị có thuộc một tập hợp danh sách hay không (ngắn gọn hơn viết nhiều \`OR\`).
* \`column IS NULL\` / \`column IS NOT NULL\`: Kiểm tra dữ liệu bị khuyết thiếu (không bao giờ dùng \`= NULL\`).`,
        theoryEn: `### Operators \`BETWEEN\`,
        detectiveAnalogy: {
          actionVi: 'Khoanh vùng đối tượng theo băng đảng & Dấu vết biến mất',
          actionEn: 'Encircle syndicate suspects & Inspect missing forensic traces',
          storyVi: 'Toán tử IN giống như lệnh truy bắt tất cả kẻ thuộc danh sách 3 băng đảng chỉ định; BETWEEN giúp khoanh vùng tội phạm trong độ tuổi 25 đến 35 hoặc giờ gây án từ 20h đến 22h; còn IS NULL vạch trần những hồ sơ hoàn toàn biến mất dấu vân tay hoặc chưa ghi nhận địa bàn hoạt động.',
          storyEn: 'IN matches suspects against an identified syndicate roster; BETWEEN fences suspects within an age or timeline perimeter; IS NULL highlights cold dossiers where crucial forensic prints or addresses vanished.',
          syntaxTakeawayVi: 'IN (Danh sách) | BETWEEN (Khoảng) | IS NULL (Mất dấu)',
          syntaxTakeawayEn: 'IN (Roster) | BETWEEN (Window) | IS NULL (Untraced)',
        }, \`IN\`, and \`NULL\` Handling
* \`column BETWEEN val1 AND val2\`: Checks if a value falls within [val1, val2] inclusive.
* \`column IN (val1, val2, ...)\`: Checks membership within a discrete list (cleaner than chained \`OR\`s).
* \`column IS NULL\` / \`column IS NOT NULL\`: Checks for missing or existing values (never use \`= NULL\`).`,
        interactiveExample: {
          query: "SELECT full_name, age, last_seen_district FROM suspects WHERE age BETWEEN 25 AND 35 AND last_seen_district IN ('District 2', 'District 4');",
          captionVi: 'Lọc nghi phạm từ 25-35 tuổi hoạt động ở District 2 hoặc 4',
          captionEn: 'Filter suspects aged 25-35 in District 2 or 4',
        },
        objectiveVi: 'Lấy `full_name`, `age`, `last_seen_district` của các nghi phạm có `age BETWEEN 28 AND 35` VÀ `last_seen_district IN (\'District 2\', \'District 4\')`.',
        objectiveEn: 'Select `full_name`, `age`, `last_seen_district` where `age BETWEEN 28 AND 35` AND `last_seen_district IN (\'District 2\', \'District 4\')`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: "SELECT full_name, age, last_seen_district FROM suspects WHERE age BETWEEN 28 AND 35 AND last_seen_district IN ('District 2', 'District 4');",
        schemaSql: `CREATE TABLE suspects (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  alias TEXT,
  age INTEGER,
  height_cm INTEGER,
  eye_color TEXT,
  criminal_record TEXT,
  last_seen_district TEXT
);`,
        seedSql: `INSERT INTO suspects VALUES 
(1, 'Marcus Vance', 'The Ghost', 38, 182, 'Brown', 'Armed Robbery', 'District 1'),
(2, 'Elena Rostova', 'Viper', 29, 168, 'Green', 'Cyber Espionage', 'District 4'),
(3, 'Damian Cruz', 'Hammer', 45, 190, 'Black', 'Extortion', 'District 1'),
(4, 'Sophia Chen', 'Shadow', 31, 165, 'Brown', 'Counterfeiting', 'District 2'),
(5, 'Lucas Silva', 'Snake', 26, 175, 'Blue', 'Smuggling', 'District 4');`,
        tables: [
          {
            name: 'suspects',
            columns: [
              { name: 'full_name', type: 'TEXT' },
              { name: 'age', type: 'INTEGER' },
              { name: 'last_seen_district', type: 'TEXT' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Toán tử BETWEEN',
            titleEn: 'Hint 1: BETWEEN operator',
            textVi: 'Dùng age BETWEEN 28 AND 35',
            textEn: 'Use age BETWEEN 28 AND 35',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Toán tử IN',
            titleEn: 'Hint 2: IN operator',
            textVi: "Dùng last_seen_district IN ('District 2', 'District 4')",
            textEn: "Use last_seen_district IN ('District 2', 'District 4')",
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: "SELECT full_name, age, last_seen_district FROM suspects WHERE age BETWEEN 28 AND 35 AND last_seen_district IN ('District 2', 'District 4');",
            textEn: "SELECT full_name, age, last_seen_district FROM suspects WHERE age BETWEEN 28 AND 35 AND last_seen_district IN ('District 2', 'District 4');",
          },
        ],
        requiredKeywords: ['BETWEEN', 'IN'],
        xpReward: 15,
      },
      {
        id: 'lesson-1-4',
        moduleId: 'module-1',
        orderIndex: 4,
        titleVi: '1.4 Nhận Dạng Dấu Vết & Biển Số (Toán tử LIKE & Wildcards)',
        titleEn: '1.4 Pattern Matching Forensic Clues (LIKE & Wildcards)',
        briefingVi: 'Camera giao thông ghi nhận chiếc xe tẩu thoát có biển số chứa ký tự "77" ở bất kỳ vị trí nào, và kẻ cầm lái có tiền án liên quan đến từ khóa "Robbery".',
        briefingEn: 'Traffic surveillance captured a getaway car with a license plate containing "77" anywhere, driven by an offender whose criminal record includes "Robbery".',
        theoryVi: `### So khớp mẫu với \`LIKE\`
Toán tử \`LIKE\` kết hợp với hai ký tự đại diện (Wildcards):
* \`%\`: Đại diện cho chuỗi gồm 0 hoặc nhiều ký tự bất kỳ.
  * \`'ABC%'\`: Bắt đầu bằng 'ABC'.
  * \`'%XYZ'\`: Kết thúc bằng 'XYZ'.
  * \`'%77%'\`: Chứa '77' ở bất kỳ vị trí nào.
* \`_\`: Đại diện cho đúng 1 ký tự duy nhất.
  * \`'D_'\`: Hai ký tự, bắt đầu bằng 'D'.`,
        theoryEn: `### Pattern Matching with \`LIKE\`
The \`LIKE\` operator utilizes two standard wildcards:
* \`%\`: Matches zero or more arbitrary characters.
  * \`'ABC%'\`: Starts with 'ABC'.
  * \`'%XYZ'\`: Ends with 'XYZ'.
  * \`'%77%'\`: Contains '77' anywhere.
* \`_\`: Matches exactly one single character.
  * \`'D_'\`: Two characters starting with 'D'.`,
        detectiveAnalogy: {
          actionVi: 'Truy vết thủ phạm từ mảnh ký ức chắp vá',
          actionEn: 'Piece together blurred clues and partial sightings',
          storyVi: "Khi nhân chứng bị hoảng loạn và chỉ nhớ 'đuôi biển số xe kết thúc bằng 99' hoặc 'tên hắn bắt đầu bằng chữ J', thám tử dùng toán tử LIKE với ký tự đại diện % (chuỗi bất kỳ) hoặc _ (một ký tự) để tái hiện lại manh mối mờ nhạt trong sương mù.",
          storyEn: "When traumatized witnesses only recall 'plate ended in 99' or 'name started with J', LIKE and wildcards (% and _) allow detectives to search through fragmented fragments across vehicle registries.",
          syntaxTakeawayVi: "LIKE '%99' (Đuôi 99) | LIKE 'J%' (Đầu J)",
          syntaxTakeawayEn: "LIKE '%99' (Suffix) | LIKE 'J%' (Prefix)",
        },
        interactiveExample: {
          query: "SELECT plate_number, model, owner_name FROM vehicles WHERE plate_number LIKE '%77%';",
          captionVi: 'Tìm xe có biển số chứa 77',
          captionEn: 'Find vehicles with plate containing 77',
        },
        objectiveVi: 'Truy vấn `plate_number`, `model`, `owner_name` từ bảng `vehicles` có `plate_number LIKE \'%77%\'`.',
        objectiveEn: 'Query `plate_number`, `model`, `owner_name` from `vehicles` where `plate_number LIKE \'%77%\'`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: "SELECT plate_number, model, owner_name FROM vehicles WHERE plate_number LIKE '%77%';",
        schemaSql: `CREATE TABLE vehicles (
  id INTEGER PRIMARY KEY,
  plate_number TEXT NOT NULL,
  model TEXT,
  color TEXT,
  owner_name TEXT
);`,
        seedSql: `INSERT INTO vehicles VALUES 
(1, '29A-77123', 'Toyota Camry', 'Black', 'Marcus Vance'),
(2, '51F-12345', 'Honda Civic', 'White', 'Elena Rostova'),
(3, '30H-98774', 'Ford Ranger', 'Dark Blue', 'Damian Cruz'),
(4, '43C-65432', 'Mazda 3', 'Red', 'Sophia Chen'),
(5, '29B-00779', 'Mercedes C300', 'Silver', 'Lucas Silva');`,
        tables: [
          {
            name: 'vehicles',
            columns: [
              { name: 'plate_number', type: 'TEXT', noteVi: 'Biển số xe', noteEn: 'License plate' },
              { name: 'model', type: 'TEXT', noteVi: 'Dòng xe', noteEn: 'Car model' },
              { name: 'color', type: 'TEXT', noteVi: 'Màu sắc', noteEn: 'Color' },
              { name: 'owner_name', type: 'TEXT', noteVi: 'Chủ sở hữu', noteEn: 'Owner name' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Wildcard %',
            titleEn: 'Hint 1: % Wildcard',
            textVi: "Để tìm chuỗi chứa '77', đặt % ở cả hai bên: '%77%'",
            textEn: "To match a substring containing '77', place % on both sides: '%77%'",
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Mệnh đề WHERE',
            titleEn: 'Hint 2: WHERE clause',
            textVi: "WHERE plate_number LIKE '%77%'",
            textEn: "WHERE plate_number LIKE '%77%'",
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: "SELECT plate_number, model, owner_name FROM vehicles WHERE plate_number LIKE '%77%';",
            textEn: "SELECT plate_number, model, owner_name FROM vehicles WHERE plate_number LIKE '%77%';",
          },
        ],
        requiredKeywords: ['LIKE', '%'],
        xpReward: 15,
      },
      {
        id: 'lesson-1-5',
        moduleId: 'module-1',
        orderIndex: 5,
        titleVi: '1.5 Xếp Hạng & Giới Hạn Truy Nã (ORDER BY, LIMIT, DISTINCT)',
        titleEn: '1.5 Priority Ranking & Limits (ORDER BY, LIMIT, DISTINCT)',
        briefingVi: 'Cảnh sát trưởng yêu cầu lập danh sách Top 3 nghi phạm lớn tuổi nhất để ưu tiên thẩm vấn. Danh sách cần sắp xếp giảm dần theo tuổi.',
        briefingEn: 'The Chief Detective requests a priority dossier of the Top 3 oldest suspects, sorted in descending order by age.',
        theoryVi: `### Sắp xếp và Giới hạn kết quả
* \`ORDER BY column [ASC | DESC]\`: Sắp xếp tăng dần (\`ASC\`, mặc định) hoặc giảm dần (\`DESC\`).
* \`LIMIT n\`: Giới hạn lấy tối đa \`n\` dòng đầu tiên.
* \`OFFSET m\`: Bỏ qua \`m\` dòng đầu tiên trước khi lấy.
* \`DISTINCT\`: Loại bỏ các dòng trùng lặp hoàn toàn trong tập kết quả: \`SELECT DISTINCT eye_color FROM suspects;\`.`,
        theoryEn: `### Ordering & Limiting Results
* \`ORDER BY column [ASC | DESC]\`: Orders ascending (\`ASC\`,
        detectiveAnalogy: {
          actionVi: 'Lập danh sách ưu tiên & Bắt khẩn cấp trùm đầu sỏ',
          actionEn: 'Rank threat levels & Issue urgent arrest warrants for top ringleaders',
          storyVi: 'Trước hàng trăm manh mối hỗn loạn, thám tử dùng ORDER BY age DESC để sắp xếp đối tượng theo độ tuổi hoặc mức độ nguy hiểm từ cao xuống thấp, sau đó ra lệnh LIMIT 3 để lực lượng trinh sát chỉ tập trung bắt khẩn cấp Top 3 kẻ cộm cán nhất.',
          storyEn: 'Faced with chaotic suspect lists, ORDER BY DESC organizes suspects from most dangerous to least, while LIMIT 3 orders tactical units to arrest only the top 3 highest-priority kingpins.',
          syntaxTakeawayVi: 'ORDER BY [Tiêu chí] DESC LIMIT [Số lượng]',
          syntaxTakeawayEn: 'ORDER BY [Field] DESC LIMIT [Count]',
        }, default) or descending (\`DESC\`).
* \`LIMIT n\`: Restricts output to at most \`n\` rows.
* \`OFFSET m\`: Skips \`m\` rows before returning data.
* \`DISTINCT\`: Eliminates duplicate rows in the result set: \`SELECT DISTINCT eye_color FROM suspects;\`.`,
        interactiveExample: {
          query: 'SELECT full_name, age FROM suspects ORDER BY age DESC LIMIT 3;',
          captionVi: 'Lấy top 3 nghi phạm lớn tuổi nhất',
          captionEn: 'Select top 3 oldest suspects',
        },
        objectiveVi: 'Lấy `full_name`, `alias`, `age` từ bảng `suspects`, sắp xếp theo `age` giảm dần (`DESC`) và giới hạn lấy 3 dòng đầu tiên (`LIMIT 3`).',
        objectiveEn: 'Select `full_name`, `alias`, `age` from `suspects`, ordered by `age DESC`, limited to the top 3 rows (`LIMIT 3`).',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT full_name, alias, age FROM suspects ORDER BY age DESC LIMIT 3;',
        schemaSql: `CREATE TABLE suspects (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  alias TEXT,
  age INTEGER,
  height_cm INTEGER,
  eye_color TEXT,
  criminal_record TEXT,
  last_seen_district TEXT
);`,
        seedSql: `INSERT INTO suspects VALUES 
(1, 'Marcus Vance', 'The Ghost', 38, 182, 'Brown', 'Armed Robbery', 'District 1'),
(2, 'Elena Rostova', 'Viper', 29, 168, 'Green', 'Cyber Espionage', 'District 4'),
(3, 'Damian Cruz', 'Hammer', 45, 190, 'Black', 'Extortion', 'District 1'),
(4, 'Sophia Chen', 'Shadow', 31, 165, 'Brown', 'Counterfeiting', 'District 2'),
(5, 'Lucas Silva', 'Snake', 52, 175, 'Blue', 'Smuggling', 'District 4');`,
        tables: [
          {
            name: 'suspects',
            columns: [
              { name: 'full_name', type: 'TEXT' },
              { name: 'alias', type: 'TEXT' },
              { name: 'age', type: 'INTEGER' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: ORDER BY DESC',
            titleEn: 'Hint 1: ORDER BY DESC',
            textVi: 'Sử dụng ORDER BY age DESC để sắp xếp từ lớn đến bé.',
            textEn: 'Use ORDER BY age DESC to order from highest to lowest.',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Mệnh đề LIMIT',
            titleEn: 'Hint 2: LIMIT clause',
            textVi: 'Đặt LIMIT 3 ở cuối câu lệnh.',
            textEn: 'Place LIMIT 3 at the very end of your query.',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT full_name, alias, age FROM suspects ORDER BY age DESC LIMIT 3;',
            textEn: 'SELECT full_name, alias, age FROM suspects ORDER BY age DESC LIMIT 3;',
          },
        ],
        requiredKeywords: ['ORDER BY', 'DESC', 'LIMIT'],
        xpReward: 20,
      },
    ],
  },

  // =========================================================================
  // MODULE 2: FORENSIC AGGREGATION & CRIME STATS (THỐNG KÊ & GOM NHÓM)
  // =========================================================================
  {
    id: 'module-2',
    orderIndex: 2,
    titleVi: 'Học phần 2: Thống Kê Tang Vật & Gom Nhóm (Aggregation)',
    titleEn: 'Module 2: Crime Statistics & Aggregation',
    descriptionVi: 'Sử dụng các hàm tổng hợp COUNT, SUM, AVG, MIN, MAX cùng GROUP BY và HAVING để đo lường thiệt hại vụ án.',
    descriptionEn: 'Leverage COUNT, SUM, AVG, MIN, MAX with GROUP BY and HAVING to quantify crime scene damages.',
    badgeCode: 'badge_crime_analyst',
    badgeNameVi: 'Chuyên Viên Phân Tích Hình Sự',
    badgeNameEn: 'Forensic Analyst Badge',
    badgeIcon: 'BarChart3',
    lessons: [
      {
        id: 'lesson-2-1',
        moduleId: 'module-2',
        orderIndex: 1,
        titleVi: '2.1 Kiểm Kê Tang Vật Vụ Án (COUNT, SUM, AVG, MAX, MIN)',
        titleEn: '2.1 Quantify Seized Evidence (COUNT, SUM, AVG, MAX, MIN)',
        briefingVi: 'Đội điều tra vừa thu giữ một loạt tang vật từ sào huyệt tội phạm. Hãy tính toán: tổng số lượng tang vật thu giữ, tổng giá trị ước tính và giá trị tang vật đắt nhất.',
        briefingEn: 'Detectives seized various contraband from a criminal safehouse. Calculate: total item count, total estimated value, and maximum item value.',
        theoryVi: `### Các hàm tổng hợp (Aggregate Functions)
* \`COUNT(*)\`: Đếm tổng số dòng (kể cả chứa NULL).
* \`COUNT(column)\`: Đếm số dòng mà \`column\` có giá trị khác NULL.
* \`SUM(column)\`: Tính tổng giá trị số.
* \`AVG(column)\`: Tính giá trị trung bình.
* \`MIN(column)\` / \`MAX(column)\`: Tìm giá trị nhỏ nhất / lớn nhất.`,
        theoryEn: `### Aggregate Functions
* \`COUNT(*)\`: Counts all rows, including NULLs.
* \`COUNT(column)\`: Counts non-NULL entries in that column.
* \`SUM(column)\`: Computes arithmetic sum.
* \`AVG(column)\`: Computes average mean.
* \`MIN(column)\` / \`MAX(column)\`: Finds minimum and maximum values.`,
        detectiveAnalogy: {
          actionVi: 'Kiểm kê phòng pháp y & Định giá thiệt hại chuyên án',
          actionEn: 'Inventory forensic locker & Tally heist damages',
          storyVi: 'Bước vào kho tang vật sau vụ cướp: COUNT giúp thám tử đếm có bao nhiêu khẩu súng thu được, SUM tính tổng số tiền bị mất trong két sắt, MAX tìm ra món trang sức kim cương đắt giá nhất, và AVG ước tính mức độ thiệt hại trung bình.',
          storyEn: 'Auditing evidence lockers: COUNT tallies seized firearms, SUM calculates stolen vault cash, MAX identifies the single most expensive diamond jewel, and AVG gauges average heist impact.',
          syntaxTakeawayVi: 'COUNT (Đếm) | SUM (Tổng) | MAX/MIN (Cực trị)',
          syntaxTakeawayEn: 'COUNT (Tally) | SUM (Total) | MAX/MIN (Extremes)',
        },
        interactiveExample: {
          query: 'SELECT COUNT(*) AS total_items, SUM(estimated_value) AS total_value, MAX(estimated_value) AS highest_value FROM evidence;',
          captionVi: 'Tổng hợp số lượng và giá trị tang vật',
          captionEn: 'Aggregate evidence quantity and value',
        },
        objectiveVi: 'Tính 3 giá trị từ bảng `evidence`: `COUNT(*) AS total_items`, `SUM(estimated_value) AS total_value`, `MAX(estimated_value) AS max_value`.',
        objectiveEn: 'Compute 3 aggregates from `evidence`: `COUNT(*) AS total_items`, `SUM(estimated_value) AS total_value`, `MAX(estimated_value) AS max_value`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT COUNT(*) AS total_items, SUM(estimated_value) AS total_value, MAX(estimated_value) AS max_value FROM evidence;',
        schemaSql: `CREATE TABLE evidence (
  id INTEGER PRIMARY KEY,
  case_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  evidence_type TEXT,
  estimated_value REAL,
  seized_district TEXT
);`,
        seedSql: `INSERT INTO evidence VALUES 
(1, 'CASE-101', 'Diamond Necklace', 'Jewelry', 150000, 'District 1'),
(2, 'CASE-101', 'Rolex Submariner', 'Jewelry', 25000, 'District 1'),
(3, 'CASE-102', 'Encrypted Laptop', 'Electronics', 3500, 'District 4'),
(4, 'CASE-103', 'Counterfeit Cash Bundle', 'Currency', 80000, 'District 2'),
(5, 'CASE-103', 'Fake Passports', 'Documents', 12000, 'District 2');`,
        tables: [
          {
            name: 'evidence',
            columns: [
              { name: 'id', type: 'INTEGER', isPk: true },
              { name: 'case_code', type: 'TEXT' },
              { name: 'item_name', type: 'TEXT' },
              { name: 'estimated_value', type: 'REAL' },
              { name: 'seized_district', type: 'TEXT' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Hàm COUNT, SUM, MAX',
            titleEn: 'Hint 1: COUNT, SUM, MAX',
            textVi: 'Sử dụng COUNT(*), SUM(estimated_value), MAX(estimated_value)',
            textEn: 'Use COUNT(*), SUM(estimated_value), MAX(estimated_value)',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Đặt alias',
            titleEn: 'Hint 2: Alias names',
            textVi: 'Đặt alias AS total_items, AS total_value, AS max_value',
            textEn: 'Set aliases AS total_items, AS total_value, AS max_value',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT COUNT(*) AS total_items, SUM(estimated_value) AS total_value, MAX(estimated_value) AS max_value FROM evidence;',
            textEn: 'SELECT COUNT(*) AS total_items, SUM(estimated_value) AS total_value, MAX(estimated_value) AS max_value FROM evidence;',
          },
        ],
        requiredKeywords: ['COUNT', 'SUM', 'MAX'],
        xpReward: 15,
      },
      {
        id: 'lesson-2-2',
        moduleId: 'module-2',
        orderIndex: 2,
        titleVi: '2.2 Bản Đồ Điểm Nóng Tội Phạm (Mệnh đề GROUP BY)',
        titleEn: '2.2 Crime Hotspot Mapping (GROUP BY Clause)',
        briefingVi: 'Để phân bổ lực lượng tuần tra hợp lý, Sở Cảnh Sát cần báo cáo tổng giá trị tang vật thu giữ được phân theo từng quận (`seized_district`).',
        briefingEn: 'To deploy patrols effectively, HQ requires a breakdown of total seized evidence value grouped by district (`seized_district`).',
        theoryVi: `### Mệnh đề \`GROUP BY\`
\`GROUP BY\` gom các dòng có cùng giá trị ở cột chỉ định thành một nhóm tóm tắt để áp dụng các hàm tổng hợp (\`COUNT\`, \`SUM\`, \`AVG\`,...):
\`\`\`sql
SELECT department, COUNT(*) AS employee_count, AVG(salary) AS avg_sal
FROM employees
GROUP BY department;
\`\`\`
* **Quy tắc vàng:** Bất kỳ cột nào xuất hiện trong \`SELECT\` mà không nằm trong hàm tổng hợp thì **BẮT BUỘC** phải có mặt trong mệnh đề \`GROUP BY\`.`,
        theoryEn: `### The \`GROUP BY\` Clause
\`GROUP BY\` clusters rows sharing identical values in specified columns to apply aggregate functions:
\`\`\`sql
SELECT department, COUNT(*) AS employee_count, AVG(salary) AS avg_sal
FROM employees
GROUP BY department;
\`\`\`
* **Golden Rule:** Any non-aggregated column appearing in \`SELECT\` **MUST** be present in \`GROUP BY\`.`,
        detectiveAnalogy: {
          actionVi: 'Vẽ bản đồ điểm nóng tội phạm theo từng khu vực',
          actionEn: 'Map crime hotspots by geographic sectors',
          storyVi: 'Thay vì xem từng vụ án rời rạc, thám tử gom tất cả hồ sơ theo từng quận (GROUP BY district) để biết khu vực nào đang có tần suất phạm tội cao nhất thành phố, từ đó bố trí trinh sát mai phục.',
          storyEn: 'Instead of inspecting isolated crime dockets, GROUP BY clusters thousands of incidents by precinct or district to pinpoint urban crime hotspots for stakeout patrols.',
          syntaxTakeawayVi: 'GROUP BY [Khu vực/Nhóm] = Gom hồ sơ',
          syntaxTakeawayEn: 'GROUP BY [Sector] = Cluster Records',
        },
        interactiveExample: {
          query: 'SELECT seized_district, COUNT(*) AS item_count, SUM(estimated_value) AS total_value FROM evidence GROUP BY seized_district ORDER BY total_value DESC;',
          captionVi: 'Thống kê tang vật theo từng quận',
          captionEn: 'Aggregate evidence by district',
        },
        objectiveVi: 'Lấy `seized_district` và `SUM(estimated_value) AS total_district_value` từ bảng `evidence`, gom nhóm theo `seized_district`, sắp xếp theo `total_district_value DESC`.',
        objectiveEn: 'Select `seized_district` and `SUM(estimated_value) AS total_district_value` from `evidence`, grouped by `seized_district`, ordered by `total_district_value DESC`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT seized_district, SUM(estimated_value) AS total_district_value FROM evidence GROUP BY seized_district ORDER BY total_district_value DESC;',
        schemaSql: `CREATE TABLE evidence (
  id INTEGER PRIMARY KEY,
  case_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  evidence_type TEXT,
  estimated_value REAL,
  seized_district TEXT
);`,
        seedSql: `INSERT INTO evidence VALUES 
(1, 'CASE-101', 'Diamond Necklace', 'Jewelry', 150000, 'District 1'),
(2, 'CASE-101', 'Rolex Submariner', 'Jewelry', 25000, 'District 1'),
(3, 'CASE-102', 'Encrypted Laptop', 'Electronics', 3500, 'District 4'),
(4, 'CASE-103', 'Counterfeit Cash Bundle', 'Currency', 80000, 'District 2'),
(5, 'CASE-103', 'Fake Passports', 'Documents', 12000, 'District 2');`,
        tables: [
          {
            name: 'evidence',
            columns: [
              { name: 'seized_district', type: 'TEXT' },
              { name: 'estimated_value', type: 'REAL' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: GROUP BY column',
            titleEn: 'Hint 1: GROUP BY column',
            textVi: 'Thêm GROUP BY seized_district sau FROM evidence.',
            textEn: 'Add GROUP BY seized_district after FROM evidence.',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: ORDER BY sau GROUP BY',
            titleEn: 'Hint 2: ORDER BY after GROUP BY',
            textVi: 'ORDER BY total_district_value DESC đặt ở cuối cùng.',
            textEn: 'Place ORDER BY total_district_value DESC at the end.',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT seized_district, SUM(estimated_value) AS total_district_value FROM evidence GROUP BY seized_district ORDER BY total_district_value DESC;',
            textEn: 'SELECT seized_district, SUM(estimated_value) AS total_district_value FROM evidence GROUP BY seized_district ORDER BY total_district_value DESC;',
          },
        ],
        requiredKeywords: ['GROUP BY', 'SUM', 'ORDER BY'],
        xpReward: 20,
      },
      {
        id: 'lesson-2-3',
        moduleId: 'module-2',
        orderIndex: 3,
        titleVi: '2.3 Lọc Băng Nhóm Trọng Án (Mệnh đề HAVING vs WHERE)',
        titleEn: '2.3 Filter Major Crime Syndicates (HAVING vs WHERE)',
        briefingVi: 'Chỉ các quận có tổng giá trị tang vật thu giữ vượt quá 50,000 USD mới được coi là sào huyệt trọng điểm của băng đảng quốc tế. Hãy lọc ra các quận này.',
        briefingEn: 'Only districts with total seized evidence value exceeding $50,000 qualify as international syndicate syndication hubs. Filter these districts.',
        theoryVi: `### Phân biệt \`WHERE\` và \`HAVING\`
* \`WHERE\`: Lọc **từng dòng dữ liệu riêng lẻ** trước khi việc gom nhóm (GROUP BY) diễn ra. \`WHERE\` **không thể** chứa hàm tổng hợp (\`WHERE SUM(...) > 100\` là SAI).
* \`HAVING\`: Lọc **các nhóm kết quả** sau khi \`GROUP BY\` đã gom nhóm xong. \`HAVING\` thường chứa điều kiện với hàm tổng hợp (\`HAVING COUNT(*) >= 2\` hoặc \`HAVING SUM(amount) > 50000\`).`,
        theoryEn: `### \`HAVING\` vs \`WHERE\`
* \`WHERE\`: Filters **individual rows** before grouping occurs. \`WHERE\` **cannot** contain aggregate functions (e.g. \`WHERE SUM(...) > 100\` is an error).
* \`HAVING\`: Filters **aggregated groups** after \`GROUP BY\` executes. \`HAVING\` typically evaluates aggregate metrics (\`HAVING COUNT(*) >= 2\` or \`HAVING SUM(val) > 50000\`).`,
        detectiveAnalogy: {
          actionVi: 'Lọc đối tượng lẻ trước vs Soi quy mô băng đảng sau',
          actionEn: 'Filter individual clues first vs Target massive syndicates after',
          storyVi: 'WHERE loại bỏ các hồ sơ rác hoặc vụ án vặt TRƯỚC KHI gom nhóm. Sau khi gom nhóm thành các băng đảng, HAVING xuất hiện như chiếc kính viễn vọng chỉ chọn ra những tổ chức tội phạm có từ 5 thành viên trở lên hoặc gây thiệt hại trên 100.000 USD.',
          storyEn: 'WHERE weeds out petty individual incidents BEFORE grouping. Once grouped by syndicate, HAVING zooms in on organized crime rings operating with 5 or more active members.',
          syntaxTakeawayVi: 'WHERE (Lọc từng dòng) -> HAVING (Lọc nhóm)',
          syntaxTakeawayEn: 'WHERE (Row Filter) -> HAVING (Group Filter)',
        },
        interactiveExample: {
          query: 'SELECT seized_district, SUM(estimated_value) AS total_val FROM evidence GROUP BY seized_district HAVING SUM(estimated_value) > 50000;',
          captionVi: 'Lọc các quận có tổng tang vật trên 50,000',
          captionEn: 'Filter districts with total evidence > 50,000',
        },
        objectiveVi: 'Lấy `seized_district` và `SUM(estimated_value) AS total_value` từ `evidence`, gom nhóm theo `seized_district`, và chỉ giữ lại các quận có `SUM(estimated_value) > 50000` bằng mệnh đề `HAVING`.',
        objectiveEn: 'Select `seized_district` and `SUM(estimated_value) AS total_value` from `evidence`, group by `seized_district`, keeping only districts with `SUM(estimated_value) > 50000` via `HAVING`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT seized_district, SUM(estimated_value) AS total_value FROM evidence GROUP BY seized_district HAVING SUM(estimated_value) > 50000;',
        schemaSql: `CREATE TABLE evidence (
  id INTEGER PRIMARY KEY,
  case_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  evidence_type TEXT,
  estimated_value REAL,
  seized_district TEXT
);`,
        seedSql: `INSERT INTO evidence VALUES 
(1, 'CASE-101', 'Diamond Necklace', 'Jewelry', 150000, 'District 1'),
(2, 'CASE-101', 'Rolex Submariner', 'Jewelry', 25000, 'District 1'),
(3, 'CASE-102', 'Encrypted Laptop', 'Electronics', 3500, 'District 4'),
(4, 'CASE-103', 'Counterfeit Cash Bundle', 'Currency', 80000, 'District 2'),
(5, 'CASE-103', 'Fake Passports', 'Documents', 12000, 'District 2');`,
        tables: [
          {
            name: 'evidence',
            columns: [
              { name: 'seized_district', type: 'TEXT' },
              { name: 'estimated_value', type: 'REAL' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Đặt HAVING sau GROUP BY',
            titleEn: 'Hint 1: Place HAVING after GROUP BY',
            textVi: 'Cú pháp: GROUP BY seized_district HAVING SUM(estimated_value) > 50000',
            textEn: 'Syntax: GROUP BY seized_district HAVING SUM(estimated_value) > 50000',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Không dùng WHERE cho hàm tổng hợp',
            titleEn: 'Hint 2: Do not use WHERE with aggregates',
            textVi: 'Phải dùng HAVING SUM(estimated_value) > 50000 thay vì WHERE.',
            textEn: 'Must use HAVING SUM(estimated_value) > 50000 instead of WHERE.',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT seized_district, SUM(estimated_value) AS total_value FROM evidence GROUP BY seized_district HAVING SUM(estimated_value) > 50000;',
            textEn: 'SELECT seized_district, SUM(estimated_value) AS total_value FROM evidence GROUP BY seized_district HAVING SUM(estimated_value) > 50000;',
          },
        ],
        requiredKeywords: ['HAVING', 'GROUP BY', 'SUM'],
        xpReward: 20,
      },
      {
        id: 'lesson-2-4',
        moduleId: 'module-2',
        orderIndex: 4,
        titleVi: '2.4 Xử Lý Tang Vật Vô Chủ (COALESCE & IFNULL)',
        titleEn: '2.4 Unclaimed Evidence Handling (COALESCE & IFNULL)',
        briefingVi: 'Một số tang vật chưa được chuyên viên thẩm định giá trị (giá trị bị `NULL`). Hãy thay thế các giá trị `NULL` này bằng `0.0` để báo cáo tài chính không bị lỗi tính toán.',
        briefingEn: 'Several seized items lack an official appraisal (appraised as `NULL`). Replace these `NULL` values with `0.0` for valid accounting reports.',
        theoryVi: `### Hàm xử lý NULL: \`COALESCE\` và \`IFNULL\`
* \`COALESCE(val1, val2, val3, ...)\`: Trả về giá trị đầu tiên khác \`NULL\` trong danh sách đối số. Đây là chuẩn SQL ANSI tương thích trên mọi RDBMS.
* \`IFNULL(val, default_val)\`: Hàm riêng của SQLite/MySQL nhận 2 đối số, nếu \`val\` là \`NULL\` thì trả về \`default_val\`.`,
        theoryEn: `### Handling NULL: \`COALESCE\` and \`IFNULL\`
* \`COALESCE(val1, val2, val3, ...)\`: Returns the first non-NULL argument from left to right (ANSI SQL standard).
* \`IFNULL(val, default_val)\`: SQLite/MySQL specific function returning \`default_val\` when \`val\` is NULL.`,
        detectiveAnalogy: {
          actionVi: 'Xử lý tang vật vô chủ & Đóng dấu mộc ẩn danh',
          actionEn: 'Catalog unclaimed contraband & Stamp anonymous John Doe tags',
          storyVi: "Nhiều tang vật tại hiện trường không tìm thấy chủ sở hữu hoặc chưa rõ danh tính thủ phạm (bị giá trị NULL). COALESCE giúp thám tử tự động điền dòng chữ 'Chưa xác định' hoặc 'Vô danh' thay vì để trống ô giấy trắng trơn.",
          storyEn: "Crime scenes often yield contraband lacking registered owners (NULL). COALESCE ensures evidence tags read 'Unknown / John Doe' instead of blank sheets.",
          syntaxTakeawayVi: "COALESCE(cột, 'Chưa rõ') = Thay thế NULL",
          syntaxTakeawayEn: "COALESCE(col, 'Unknown') = Fallback NULL",
        },
        interactiveExample: {
          query: "SELECT item_name, COALESCE(estimated_value, 0) AS safe_value FROM evidence;",
          captionVi: 'Thay thế giá trị NULL bằng 0',
          captionEn: 'Replace NULL values with 0',
        },
        objectiveVi: 'Lấy `item_name` và `COALESCE(estimated_value, 0) AS safe_value` từ bảng `evidence`.',
        objectiveEn: 'Select `item_name` and `COALESCE(estimated_value, 0) AS safe_value` from `evidence`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT item_name, COALESCE(estimated_value, 0) AS safe_value FROM evidence;',
        schemaSql: `CREATE TABLE evidence (
  id INTEGER PRIMARY KEY,
  case_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  evidence_type TEXT,
  estimated_value REAL,
  seized_district TEXT
);`,
        seedSql: `INSERT INTO evidence VALUES 
(1, 'CASE-101', 'Diamond Necklace', 'Jewelry', 150000, 'District 1'),
(2, 'CASE-101', 'Mysterious Key', 'Unknown', NULL, 'District 1'),
(3, 'CASE-102', 'Encrypted Laptop', 'Electronics', 3500, 'District 4'),
(4, 'CASE-103', 'Scrap Paper Note', 'Clue', NULL, 'District 2');`,
        tables: [
          {
            name: 'evidence',
            columns: [
              { name: 'item_name', type: 'TEXT' },
              { name: 'estimated_value', type: 'REAL' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Cú pháp COALESCE',
            titleEn: 'Hint 1: COALESCE syntax',
            textVi: 'COALESCE(estimated_value, 0)',
            textEn: 'COALESCE(estimated_value, 0)',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Đặt alias',
            titleEn: 'Hint 2: Set alias',
            textVi: 'COALESCE(estimated_value, 0) AS safe_value',
            textEn: 'COALESCE(estimated_value, 0) AS safe_value',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT item_name, COALESCE(estimated_value, 0) AS safe_value FROM evidence;',
            textEn: 'SELECT item_name, COALESCE(estimated_value, 0) AS safe_value FROM evidence;',
          },
        ],
        requiredKeywords: ['COALESCE'],
        xpReward: 15,
      },
    ],
  },

  // =========================================================================
  // MODULE 3: CROSS-DEPARTMENT INVESTIGATION (NỐI DỮ LIỆU NHIỀU BẢNG - JOINS)
  // =========================================================================
  {
    id: 'module-3',
    orderIndex: 3,
    titleVi: 'Học phần 3: Liên Kết Hồ Sơ & Nối Bảng (JOINs)',
    titleEn: 'Module 3: Cross-Department Investigation & JOINs',
    descriptionVi: 'Học cách kết nối dữ liệu giữa nhiều phòng ban: INNER JOIN, LEFT JOIN, CROSS JOIN và Self-Join truy lùng trùm cuối.',
    descriptionEn: 'Connect disparate criminal records across bureaus: INNER JOIN, LEFT JOIN, CROSS JOIN, and syndicate Self-Joins.',
    badgeCode: 'badge_join_master',
    badgeNameVi: 'Bậc Thầy Ghép Nối Dữ Liệu',
    badgeNameEn: 'Master of Joins Badge',
    badgeIcon: 'Network',
    lessons: [
      {
        id: 'lesson-3-1',
        moduleId: 'module-3',
        orderIndex: 1,
        titleVi: '3.1 Ghép Hồ Sơ Vụ Án & Sĩ Quan Phụ Trách (INNER JOIN)',
        titleEn: '3.1 Match Case Files & Lead Detectives (INNER JOIN)',
        briefingVi: 'Hồ sơ các chuyên án hình sự nằm ở bảng `crime_cases`, còn thông tin cảnh sát nằm ở bảng `officers`. Hãy nối 2 bảng này qua khóa ngoại `officer_id` để biết ai đang thụ lý từng vụ.',
        briefingEn: 'Open cases are logged in `crime_cases`, while officer details reside in `officers`. Join them on foreign key `officer_id` to pair cases with detectives.',
        theoryVi: `### Cú pháp \`INNER JOIN\`
\`INNER JOIN\` kết hợp các hàng từ hai bảng khi có sự khớp giá trị giữa cột liên kết (thường là Primary Key và Foreign Key):
\`\`\`sql
SELECT c.case_name, o.badge_number, o.full_name
FROM crime_cases c
INNER JOIN officers o ON c.officer_id = o.id;
\`\`\`
* Các hàng ở bảng này không có giá trị khớp ở bảng kia sẽ bị loại bỏ khỏi kết quả.`,
        theoryEn: `### \`INNER JOIN\` Syntax
\`INNER JOIN\` matches rows from two tables whenever matching keys exist (usually PK to FK):
\`\`\`sql
SELECT c.case_name, o.badge_number, o.full_name
FROM crime_cases c
INNER JOIN officers o ON c.officer_id = o.id;
\`\`\`
* Unmatched rows on either side are omitted from the output.`,
        detectiveAnalogy: {
          actionVi: 'Khớp 2 mảnh ghép hồ sơ vụ án & Thám tử thụ lý',
          actionEn: 'Stitch case files with assigned lead investigators',
          storyVi: 'Tập hồ sơ vụ án nằm riêng, danh bạ thám tử nằm riêng. INNER JOIN giống như thám tử đối chiếu mã số huy hiệu (officer_id) trên cả hai bàn; chỉ những vụ án nào có thám tử chính thức thụ lý mới được giữ lại trên báo cáo.',
          storyEn: 'Case files and detective rosters are stored in separate archives. INNER JOIN bridges them on badge ID: only cases paired with assigned active investigators remain on the docket.',
          syntaxTakeawayVi: 'INNER JOIN = Chỉ lấy phần giao nhau khớp mã',
          syntaxTakeawayEn: 'INNER JOIN = Retain matching pairs only',
        },
        interactiveExample: {
          query: 'SELECT c.title, o.badge_number, o.name AS lead_detective FROM cases c INNER JOIN officers o ON c.officer_id = o.id;',
          captionVi: 'Ghép tên vụ án với cảnh sát phụ trách',
          captionEn: 'Pair case title with assigned officer',
        },
        objectiveVi: 'Lấy `c.title AS case_title`, `o.badge_number`, `o.name AS detective_name` bằng cách `INNER JOIN` bảng `cases c` với `officers o` qua điều kiện `c.officer_id = o.id`.',
        objectiveEn: 'Select `c.title AS case_title`, `o.badge_number`, `o.name AS detective_name` by `INNER JOIN`ing `cases c` with `officers o` on `c.officer_id = o.id`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT c.title AS case_title, o.badge_number, o.name AS detective_name FROM cases c INNER JOIN officers o ON c.officer_id = o.id;',
        schemaSql: `CREATE TABLE officers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  badge_number TEXT NOT NULL,
  rank TEXT
);
CREATE TABLE cases (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT,
  officer_id INTEGER,
  FOREIGN KEY (officer_id) REFERENCES officers (id)
);`,
        seedSql: `INSERT INTO officers VALUES 
(1, 'Detective Miller', 'NYPD-4091', 'Senior Inspector'),
(2, 'Detective Ross', 'NYPD-7102', 'Sergeant'),
(3, 'Detective Harper', 'NYPD-1188', 'Lieutenant');
INSERT INTO cases VALUES 
(101, 'Manhattan Bank Vault', 'OPEN', 1),
(102, 'Times Square Heist', 'IN_PROGRESS', 2),
(103, 'Brooklyn Dock Smuggling', 'OPEN', 1);`,
        tables: [
          {
            name: 'cases',
            columns: [
              { name: 'id', type: 'INTEGER', isPk: true },
              { name: 'title', type: 'TEXT' },
              { name: 'status', type: 'TEXT' },
              { name: 'officer_id', type: 'INTEGER' },
            ],
          },
          {
            name: 'officers',
            columns: [
              { name: 'id', type: 'INTEGER', isPk: true },
              { name: 'name', type: 'TEXT' },
              { name: 'badge_number', type: 'TEXT' },
              { name: 'rank', type: 'TEXT' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Cú pháp INNER JOIN',
            titleEn: 'Hint 1: INNER JOIN syntax',
            textVi: 'FROM cases c INNER JOIN officers o ON c.officer_id = o.id',
            textEn: 'FROM cases c INNER JOIN officers o ON c.officer_id = o.id',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Chọn các cột với alias',
            titleEn: 'Hint 2: Column selection and aliases',
            textVi: 'c.title AS case_title, o.badge_number, o.name AS detective_name',
            textEn: 'c.title AS case_title, o.badge_number, o.name AS detective_name',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT c.title AS case_title, o.badge_number, o.name AS detective_name FROM cases c INNER JOIN officers o ON c.officer_id = o.id;',
            textEn: 'SELECT c.title AS case_title, o.badge_number, o.name AS detective_name FROM cases c INNER JOIN officers o ON c.officer_id = o.id;',
          },
        ],
        requiredKeywords: ['INNER JOIN', 'ON'],
        xpReward: 20,
      },
      {
        id: 'lesson-3-2',
        moduleId: 'module-3',
        orderIndex: 2,
        titleVi: '3.2 Vụ Án Tồn Đọng & Trinh Sát Tự Do (LEFT JOIN)',
        titleEn: '3.2 Cold Cases & Unassigned Leads (LEFT JOIN)',
        briefingVi: 'Một số sĩ quan cảnh sát hiện đang rảnh rỗi (chưa được phân công vụ án nào). Hãy lập danh sách toàn bộ sĩ quan kèm vụ án họ thụ lý (nếu không có, vụ án hiển thị là NULL).',
        briefingEn: 'Certain officers are currently unassigned to any open case. Produce a roster of all officers alongside their cases (showing NULL for unassigned officers).',
        theoryVi: `### Cú pháp \`LEFT JOIN\`
\`LEFT JOIN\` giữ lại **toàn bộ các hàng từ bảng bên trái** (Left table), bất kể bảng bên phải có dữ liệu khớp hay không.
* Nếu có khớp: Các cột của bảng bên phải mang giá trị thực.
* Nếu không có khớp: Các cột của bảng bên phải sẽ được điền \`NULL\`.
* Thường dùng để tìm kiếm các bản ghi "mồ côi" hoặc kiểm tra trạng thái không hoạt động (\`WHERE right_table.id IS NULL\`).`,
        theoryEn: `### \`LEFT JOIN\` Syntax
\`LEFT JOIN\` preserves **all rows from the left table**, regardless of whether matches exist on the right.
* When matched: Right-side columns contain their actual values.
* When unmatched: Right-side columns are filled with \`NULL\`.
* Commonly used to detect orphaned records or idle statuses (\`WHERE right_table.id IS NULL\`).`,
        detectiveAnalogy: {
          actionVi: 'Điểm danh toàn bộ thám tử trong cục, không sót một ai',
          actionEn: 'Audit complete detective roster including unassigned agents',
          storyVi: 'Trưởng ban điều tra muốn xem tình trạng toàn bộ nhân sự: LEFT JOIN giữ nguyên 100% thám tử ở bảng bên trái; ai đang bận rộn phá án thì hiện tên vụ án, ai đang ngồi uống cà phê chờ chuyên án mới thì thông tin vụ án sẽ hiện NULL.',
          storyEn: 'The Chief Detective orders a roll call of all personnel: LEFT JOIN preserves all detectives from the left table; active sleuths display assigned cases, while agents on standby display NULL.',
          syntaxTakeawayVi: 'LEFT JOIN = Giữ trọn bảng bên trái dù không có cặp',
          syntaxTakeawayEn: 'LEFT JOIN = Keep all left rows regardless',
        },
        interactiveExample: {
          query: 'SELECT o.name, o.badge_number, c.title AS assigned_case FROM officers o LEFT JOIN cases c ON o.id = c.officer_id;',
          captionVi: 'Hiển thị tất cả sĩ quan kể cả người chưa nhận án',
          captionEn: 'List all officers including those unassigned',
        },
        objectiveVi: 'Lấy `o.name AS officer_name`, `o.badge_number`, `c.title AS assigned_case` bằng cách `LEFT JOIN` từ `officers o` sang `cases c` qua điều kiện `o.id = c.officer_id`.',
        objectiveEn: 'Select `o.name AS officer_name`, `o.badge_number`, `c.title AS assigned_case` by `LEFT JOIN`ing `officers o` to `cases c` on `o.id = c.officer_id`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT o.name AS officer_name, o.badge_number, c.title AS assigned_case FROM officers o LEFT JOIN cases c ON o.id = c.officer_id;',
        schemaSql: `CREATE TABLE officers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  badge_number TEXT NOT NULL
);
CREATE TABLE cases (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  officer_id INTEGER
);`,
        seedSql: `INSERT INTO officers VALUES 
(1, 'Detective Miller', 'NYPD-4091'),
(2, 'Detective Ross', 'NYPD-7102'),
(3, 'Detective Harper', 'NYPD-1188'),
(4, 'Cadet Watson', 'NYPD-9900');
INSERT INTO cases VALUES 
(101, 'Manhattan Bank Vault', 1),
(102, 'Times Square Heist', 2);`,
        tables: [
          {
            name: 'officers',
            columns: [
              { name: 'id', type: 'INTEGER', isPk: true },
              { name: 'name', type: 'TEXT' },
              { name: 'badge_number', type: 'TEXT' },
            ],
          },
          {
            name: 'cases',
            columns: [
              { name: 'title', type: 'TEXT' },
              { name: 'officer_id', type: 'INTEGER' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Bảng bên trái là officers',
            titleEn: 'Hint 1: Left table is officers',
            textVi: 'FROM officers o LEFT JOIN cases c ON o.id = c.officer_id',
            textEn: 'FROM officers o LEFT JOIN cases c ON o.id = c.officer_id',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Đặt alias các cột',
            titleEn: 'Hint 2: Set column aliases',
            textVi: 'o.name AS officer_name, o.badge_number, c.title AS assigned_case',
            textEn: 'o.name AS officer_name, o.badge_number, c.title AS assigned_case',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT o.name AS officer_name, o.badge_number, c.title AS assigned_case FROM officers o LEFT JOIN cases c ON o.id = c.officer_id;',
            textEn: 'SELECT o.name AS officer_name, o.badge_number, c.title AS assigned_case FROM officers o LEFT JOIN cases c ON o.id = c.officer_id;',
          },
        ],
        requiredKeywords: ['LEFT JOIN', 'ON'],
        xpReward: 20,
      },
      {
        id: 'lesson-3-3',
        moduleId: 'module-3',
        orderIndex: 3,
        titleVi: '3.3 Ma Trận Tình Huống Tác Chiến (CROSS JOIN)',
        titleEn: '3.3 Tactical Scenario Matrix (CROSS JOIN)',
        briefingVi: 'Để diễn tập phòng thủ, ban chỉ huy muốn tạo ra mọi cặp kết hợp có thể giữa từng đơn vị cảnh sát phản ứng nhanh (`patrol_units`) và các địa bàn nguy cơ (`patrol_zones`).',
        briefingEn: 'For tactical drills, HQ wants to generate every possible pairing between rapid response units (`patrol_units`) and danger sectors (`patrol_zones`).',
        theoryVi: `### Cú pháp \`CROSS JOIN\` (Tích Descartes)
\`CROSS JOIN\` sinh ra tích Descartes (Cartesian Product) của hai bảng: kết hợp từng dòng của bảng A với mọi dòng của bảng B.
* Nếu bảng A có $N$ dòng, bảng B có $M$ dòng, kết quả sẽ có $N \times M$ dòng.
* Không cần mệnh đề \`ON\`.`,
        theoryEn: `### \`CROSS JOIN\` (Cartesian Product)
\`CROSS JOIN\` produces the Cartesian product of two relations: pairing each row from table A with every row from table B.
* If table A has $N$ rows and table B has $M$ rows, the output yields $N \times M$ combinations.
* No \`ON\` clause is required.`,
        detectiveAnalogy: {
          actionVi: 'Dựng ma trận mọi kịch bản hiện trường có thể xảy ra',
          actionEn: 'Construct Cartesian matrix of all crime escape simulations',
          storyVi: 'Để phục kích tội phạm hoàn hảo, CROSS JOIN ghép mọi lối thoát hiểm (Cửa sổ, Tầng hầm, Cổng chính) với mọi loại phương tiện (Xe mô tô, Canô, Đi bộ) để đội trinh sát không bỏ sót bất kỳ một kịch bản tẩu thoát nào.',
          storyEn: 'To execute foolproof perimeter lockdown, CROSS JOIN combines every getaway exit with every transport vehicle, simulating all conceivable escape routes.',
          syntaxTakeawayVi: 'CROSS JOIN = Tích Đề-các (Mọi cặp tổ hợp)',
          syntaxTakeawayEn: 'CROSS JOIN = Cartesian product of all pairs',
        },
        interactiveExample: {
          query: 'SELECT u.unit_code, z.zone_name FROM patrol_units u CROSS JOIN patrol_zones z;',
          captionVi: 'Ma trận phân công đơn vị tuần tra và khu vực',
          captionEn: 'Pair every unit with every patrol zone',
        },
        objectiveVi: 'Lấy `u.unit_code` và `z.zone_name` bằng cách thực hiện `CROSS JOIN` giữa bảng `patrol_units u` và `patrol_zones z`.',
        objectiveEn: 'Select `u.unit_code` and `z.zone_name` by executing a `CROSS JOIN` between `patrol_units u` and `patrol_zones z`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT u.unit_code, z.zone_name FROM patrol_units u CROSS JOIN patrol_zones z;',
        schemaSql: `CREATE TABLE patrol_units (
  id INTEGER PRIMARY KEY,
  unit_code TEXT NOT NULL
);
CREATE TABLE patrol_zones (
  id INTEGER PRIMARY KEY,
  zone_name TEXT NOT NULL
);`,
        seedSql: `INSERT INTO patrol_units VALUES (1, 'SWAT-Alpha'), (2, 'K9-Bravo');
INSERT INTO patrol_zones VALUES (1, 'North Harbor'), (2, 'Financial District'), (3, 'Industrial Park');`,
        tables: [
          {
            name: 'patrol_units',
            columns: [{ name: 'unit_code', type: 'TEXT' }],
          },
          {
            name: 'patrol_zones',
            columns: [{ name: 'zone_name', type: 'TEXT' }],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Cú pháp CROSS JOIN',
            titleEn: 'Hint 1: CROSS JOIN syntax',
            textVi: 'FROM patrol_units u CROSS JOIN patrol_zones z',
            textEn: 'FROM patrol_units u CROSS JOIN patrol_zones z',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Không cần ON',
            titleEn: 'Hint 2: No ON condition',
            textVi: 'CROSS JOIN không dùng ON vì nó ghép mọi tổ hợp.',
            textEn: 'CROSS JOIN does not use ON because it matches all combinations.',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT u.unit_code, z.zone_name FROM patrol_units u CROSS JOIN patrol_zones z;',
            textEn: 'SELECT u.unit_code, z.zone_name FROM patrol_units u CROSS JOIN patrol_zones z;',
          },
        ],
        requiredKeywords: ['CROSS JOIN'],
        xpReward: 15,
      },
      {
        id: 'lesson-3-4',
        moduleId: 'module-3',
        orderIndex: 4,
        titleVi: '3.4 Băng Đảng Ngầm & Trùm Cuối (Self-Join)',
        titleEn: '3.4 Syndicate Hierarchy & The Mastermind (Self-Join)',
        briefingVi: 'Bảng `syndicate_members` chứa toàn bộ thành viên của băng nhóm, trong đó cột `boss_id` trỏ đến ID của kẻ cầm đầu trực tiếp. Hãy dùng Self-Join để hiển thị tên của tay chân và tên của kẻ bảo kê.',
        briefingEn: 'Table `syndicate_members` lists gang members, where `boss_id` references their commanding boss within the same table. Use a Self-Join to display subordinate and boss names.',
        theoryVi: `### Kỹ thuật \`Self-Join\` (Nối chính bảng đó)
Self-Join là kỹ thuật nối một bảng với chính nó bằng cách sử dụng hai bí danh (aliases) khác nhau:
\`\`\`sql
SELECT m.name AS member_name, b.name AS boss_name
FROM syndicate_members m
INNER JOIN syndicate_members b ON m.boss_id = b.id;
\`\`\`
* Rất hữu ích khi biểu diễn quan hệ cây phân cấp (cha - con, sếp - nhân viên, quản lý - thành viên).`,
        theoryEn: `### \`Self-Join\` Technique
A Self-Join joins a table to itself using two distinct aliases:
\`\`\`sql
SELECT m.name AS member_name, b.name AS boss_name
FROM syndicate_members m
INNER JOIN syndicate_members b ON m.boss_id = b.id;
\`\`\`
* Invaluable for traversing hierarchical trees (manager - employee, parent - child).`,
        detectiveAnalogy: {
          actionVi: 'Vạch trần mạng lưới chỉ đạo ngầm trong nội bộ',
          actionEn: 'Expose undercover hierarchy and internal informant chains',
          storyVi: "Mở một bảng danh bạ nhân sự nhưng soi chiếu 2 lần (SELF JOIN): một lần đóng vai trò 'Trinh sát thực địa', một lần đóng vai trò 'Cấp trên chỉ huy', giúp thám tử nhìn thấy rõ ai nhận lệnh trực tiếp từ ai trong đường dây bí mật.",
          storyEn: 'Inspecting the same personnel registry twice (SELF JOIN): once as field operative and once as supervising handler, revealing covert command chains within the department.',
          syntaxTakeawayVi: 'SELF JOIN = Ghép bảng với chính nó để soi thứ bậc',
          syntaxTakeawayEn: 'SELF JOIN = Join table onto itself for hierarchy',
        },
        interactiveExample: {
          query: 'SELECT m.name AS operative, b.name AS boss FROM syndicate_members m INNER JOIN syndicate_members b ON m.boss_id = b.id;',
          captionVi: 'Tìm kẻ cầm đầu trực tiếp của từng thành viên',
          captionEn: 'Find direct boss of each syndicate operative',
        },
        objectiveVi: 'Lấy `m.name AS operative_name` và `b.name AS boss_name` bằng cách tự nối bảng `syndicate_members m` với `syndicate_members b` qua điều kiện `m.boss_id = b.id`.',
        objectiveEn: 'Select `m.name AS operative_name` and `b.name AS boss_name` by self-joining `syndicate_members m` with `syndicate_members b` on `m.boss_id = b.id`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT m.name AS operative_name, b.name AS boss_name FROM syndicate_members m INNER JOIN syndicate_members b ON m.boss_id = b.id;',
        schemaSql: `CREATE TABLE syndicate_members (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  boss_id INTEGER
);`,
        seedSql: `INSERT INTO syndicate_members VALUES 
(1, 'Don Salieri', 'Godfather', NULL),
(2, 'Vincenzo', 'Caporegime', 1),
(3, 'Paulie', 'Soldier', 2),
(4, 'Sam', 'Enforcer', 2);`,
        tables: [
          {
            name: 'syndicate_members',
            columns: [
              { name: 'id', type: 'INTEGER', isPk: true },
              { name: 'name', type: 'TEXT' },
              { name: 'role', type: 'TEXT' },
              { name: 'boss_id', type: 'INTEGER' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Đặt hai alias m và b',
            titleEn: 'Hint 1: Assign aliases m and b',
            textVi: 'FROM syndicate_members m INNER JOIN syndicate_members b',
            textEn: 'FROM syndicate_members m INNER JOIN syndicate_members b',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Điều kiện nối',
            titleEn: 'Hint 2: Join condition',
            textVi: 'ON m.boss_id = b.id',
            textEn: 'ON m.boss_id = b.id',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT m.name AS operative_name, b.name AS boss_name FROM syndicate_members m INNER JOIN syndicate_members b ON m.boss_id = b.id;',
            textEn: 'SELECT m.name AS operative_name, b.name AS boss_name FROM syndicate_members m INNER JOIN syndicate_members b ON m.boss_id = b.id;',
          },
        ],
        requiredKeywords: ['JOIN', 'ON'],
        xpReward: 25,
      },
    ],
  },

  // =========================================================================
  // MODULE 4: TACTICAL INTELLIGENCE (SUBQUERIES, CTES & SET OPERATIONS)
  // =========================================================================
  {
    id: 'module-4',
    orderIndex: 4,
    titleVi: 'Học phần 4: Tình Báo Tác Chiến - Subqueries & CTEs',
    titleEn: 'Module 4: Tactical Intelligence - Subqueries & CTEs',
    descriptionVi: 'Làm chủ các câu truy vấn lồng (Subqueries), mệnh đề EXISTS, phép toán tập hợp UNION/EXCEPT và kỹ thuật CTE chuyên sâu.',
    descriptionEn: 'Master nested subqueries, EXISTS logic, set operations (UNION, EXCEPT), and Common Table Expressions (CTEs).',
    badgeCode: 'badge_tactical_intelligence',
    badgeNameVi: 'Sĩ Quan Tình Báo Dữ Liệu',
    badgeNameEn: 'Tactical Intelligence Operative',
    badgeIcon: 'Boxes',
    lessons: [
      {
        id: 'lesson-4-1',
        moduleId: 'module-4',
        orderIndex: 1,
        titleVi: '4.1 Dòng Tiền Rửa Đen Bất Thường (Scalar & IN Subqueries)',
        titleEn: '4.1 Abnormal Money Laundering (Scalar & IN Subqueries)',
        briefingVi: 'Đội trinh sát tài chính phát hiện các giao dịch chuyển tiền đáng ngờ. Hãy tìm các giao dịch có số tiền (`amount`) cao hơn mức trung bình của toàn bộ hệ thống.',
        briefingEn: 'Financial forensic investigators detected illicit money transfers. Find all transactions with an `amount` higher than the overall average transfer amount.',
        theoryVi: `### Truy vấn con đơn trị (Scalar Subquery)
Một truy vấn con trả về đúng 1 dòng, 1 cột có thể được dùng ở mệnh đề \`WHERE\` như một hằng số:
\`\`\`sql
SELECT * FROM transactions
WHERE amount > (SELECT AVG(amount) FROM transactions);
\`\`\`
* Truy vấn con trong ngoặc đơn sẽ được tính toán trước, sau đó câu truy vấn chính dùng kết quả đó để lọc.`,
        theoryEn: `### Scalar Subqueries
A subquery returning exactly one row and one column acts as a scalar constant in \`WHERE\` clauses:
\`\`\`sql
SELECT * FROM transactions
WHERE amount > (SELECT AVG(amount) FROM transactions);
\`\`\`
* The inner query executes first, and its single numeric result filters the outer query.`,
        detectiveAnalogy: {
          actionVi: 'Chuyên án 2 giai đoạn: Tìm mốc kỷ lục -> Bắt kẻ đầu sỏ',
          actionEn: 'Two-stage investigation: Establish benchmark then seize culprits',
          storyVi: 'Thám tử không thể biết trước mức tiền cướp kỷ lục là bao nhiêu. Subquery đóng vai trò trinh sát giai đoạn 1 đi tìm con số kỷ lục (ví dụ 50.000 USD), sau đó bàn giao con số này cho lệnh WHERE ở giai đoạn 2 để bắt đúng tên trộm sở hữu số tiền đó.',
          storyEn: 'Detectives cannot guess the highest stolen amount upfront. A subquery runs reconnaissance first to uncover the max loot figure ($50,000), feeding it directly into the outer query to net the culprit.',
          syntaxTakeawayVi: 'WHERE gia_tri > (SELECT MAX(...) ...)',
          syntaxTakeawayEn: 'WHERE value > (SELECT MAX(...) ...)',
        },
        interactiveExample: {
          query: 'SELECT tx_code, amount, sender FROM transactions WHERE amount > (SELECT AVG(amount) FROM transactions);',
          captionVi: 'Lọc giao dịch lớn hơn mức trung bình',
          captionEn: 'Filter transactions above average',
        },
        objectiveVi: 'Lấy `tx_code`, `sender`, `amount` từ bảng `transactions` có `amount > (SELECT AVG(amount) FROM transactions)`.',
        objectiveEn: 'Select `tx_code`, `sender`, `amount` from `transactions` where `amount > (SELECT AVG(amount) FROM transactions)`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT tx_code, sender, amount FROM transactions WHERE amount > (SELECT AVG(amount) FROM transactions);',
        schemaSql: `CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  tx_code TEXT NOT NULL,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  amount REAL NOT NULL
);`,
        seedSql: `INSERT INTO transactions VALUES 
(1, 'TX-801', 'Shell Corp A', 'Offshore Co 1', 120000),
(2, 'TX-802', 'Marcus Vance', 'Local Grocery', 150),
(3, 'TX-803', 'Shell Corp B', 'Offshore Co 2', 450000),
(4, 'TX-804', 'Elena Rostova', 'Electronics Store', 1200),
(5, 'TX-805', 'Damian Cruz', 'Car Dealership', 85000);`,
        tables: [
          {
            name: 'transactions',
            columns: [
              { name: 'tx_code', type: 'TEXT' },
              { name: 'sender', type: 'TEXT' },
              { name: 'amount', type: 'REAL' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Tính trung bình bằng AVG',
            titleEn: 'Hint 1: Compute average with AVG',
            textVi: 'Cú pháp: (SELECT AVG(amount) FROM transactions)',
            textEn: 'Syntax: (SELECT AVG(amount) FROM transactions)',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Mệnh đề WHERE so sánh >',
            titleEn: 'Hint 2: WHERE clause > comparison',
            textVi: 'WHERE amount > (SELECT AVG(amount) FROM transactions)',
            textEn: 'WHERE amount > (SELECT AVG(amount) FROM transactions)',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT tx_code, sender, amount FROM transactions WHERE amount > (SELECT AVG(amount) FROM transactions);',
            textEn: 'SELECT tx_code, sender, amount FROM transactions WHERE amount > (SELECT AVG(amount) FROM transactions);',
          },
        ],
        requiredKeywords: ['AVG', 'SELECT', 'WHERE'],
        xpReward: 20,
      },
      {
        id: 'lesson-4-2',
        moduleId: 'module-4',
        orderIndex: 2,
        titleVi: '4.2 Điệp Viên Ẩn Danh (EXISTS & NOT EXISTS)',
        titleEn: '4.2 Covert Agents (EXISTS & NOT EXISTS)',
        briefingVi: 'Cần tìm tất cả các tài khoản ngân hàng (`bank_accounts`) có dính líu đến ít nhất một giao dịch nằm trong danh sách đen (`blacklisted_transfers`). Sử dụng toán tử EXISTS.',
        briefingEn: 'Find all bank accounts (`bank_accounts`) implicated in at least one transaction in `blacklisted_transfers`. Use the EXISTS operator.',
        theoryVi: `### Toán tử \`EXISTS\` và \`NOT EXISTS\`
Toán tử \`EXISTS\` nhận vào một truy vấn con tương quan (Correlated Subquery) và trả về \`TRUE\` ngay khi truy vấn con tìm thấy ít nhất một dòng thỏa mãn:
\`\`\`sql
SELECT * FROM accounts a
WHERE EXISTS (
  SELECT 1 FROM blacklisted_transfers b
  WHERE b.account_id = a.id
);
\`\`\`
* Tối ưu hơn \`IN\` khi tập dữ liệu lớn vì dừng quét ngay khi tìm thấy dòng đầu tiên.`,
        theoryEn: `### Operators \`EXISTS\` and \`NOT EXISTS\`
\`EXISTS\` evaluates a correlated subquery and returns \`TRUE\` as soon as at least one matching row is encountered:
\`\`\`sql
SELECT * FROM accounts a
WHERE EXISTS (
  SELECT 1 FROM blacklisted_transfers b
  WHERE b.account_id = a.id
);
\`\`\`
* Highly optimized on large datasets because it short-circuits upon encountering the first match.`,
        detectiveAnalogy: {
          actionVi: "Thẩm vấn từng người: 'Có camera ghi nhận ngươi hay không?'",
          actionEn: "Interrogate each suspect: 'Did surveillance cameras capture you?'",
          storyVi: "Correlated Subquery giống như điều tra viên cầm từng bức ảnh nghi phạm đến phòng giám sát camera và hỏi (EXISTS): 'Kẻ này có xuất hiện tại góc phố lúc nửa đêm không?'. Nếu có thì lập tức đưa vào diện triệu tập.",
          storyEn: "Correlated Subquery takes each suspect photo individually to the CCTV room and queries EXISTS: 'Was this exact individual logged in the vault corridor?'. If yes, issue summons.",
          syntaxTakeawayVi: 'WHERE EXISTS (Truy vấn phụ phụ thuộc dòng cha)',
          syntaxTakeawayEn: 'WHERE EXISTS (Correlated child subquery)',
        },
        interactiveExample: {
          query: 'SELECT a.account_number, a.owner_name FROM bank_accounts a WHERE EXISTS (SELECT 1 FROM blacklisted_transfers b WHERE b.account_id = a.id);',
          captionVi: 'Tìm tài khoản có giao dịch trong danh sách đen',
          captionEn: 'Find accounts present in blacklist',
        },
        objectiveVi: 'Lấy `a.account_number`, `a.owner_name` từ `bank_accounts a` thỏa mãn `EXISTS (SELECT 1 FROM blacklisted_transfers b WHERE b.account_id = a.id)`.',
        objectiveEn: 'Select `a.account_number`, `a.owner_name` from `bank_accounts a` where `EXISTS (SELECT 1 FROM blacklisted_transfers b WHERE b.account_id = a.id)`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT a.account_number, a.owner_name FROM bank_accounts a WHERE EXISTS (SELECT 1 FROM blacklisted_transfers b WHERE b.account_id = a.id);',
        schemaSql: `CREATE TABLE bank_accounts (
  id INTEGER PRIMARY KEY,
  account_number TEXT NOT NULL,
  owner_name TEXT NOT NULL
);
CREATE TABLE blacklisted_transfers (
  id INTEGER PRIMARY KEY,
  account_id INTEGER,
  reason TEXT,
  FOREIGN KEY (account_id) REFERENCES bank_accounts (id)
);`,
        seedSql: `INSERT INTO bank_accounts VALUES 
(1, 'ACC-9901', 'Marcus Vance'),
(2, 'ACC-9902', 'Elena Rostova'),
(3, 'ACC-9903', 'John Clean (Innocent)');
INSERT INTO blacklisted_transfers VALUES 
(10, 1, 'Illegal Arms Shipment'),
(11, 2, 'Stolen Cryptocurrency');`,
        tables: [
          {
            name: 'bank_accounts',
            columns: [
              { name: 'id', type: 'INTEGER', isPk: true },
              { name: 'account_number', type: 'TEXT' },
              { name: 'owner_name', type: 'TEXT' },
            ],
          },
          {
            name: 'blacklisted_transfers',
            columns: [
              { name: 'account_id', type: 'INTEGER' },
              { name: 'reason', type: 'TEXT' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Mệnh đề EXISTS',
            titleEn: 'Hint 1: EXISTS clause',
            textVi: 'WHERE EXISTS (SELECT 1 FROM blacklisted_transfers b WHERE b.account_id = a.id)',
            textEn: 'WHERE EXISTS (SELECT 1 FROM blacklisted_transfers b WHERE b.account_id = a.id)',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Alias bảng a và b',
            titleEn: 'Hint 2: Table aliases',
            textVi: 'Đặt bank_accounts a và blacklisted_transfers b',
            textEn: 'Set bank_accounts a and blacklisted_transfers b',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT a.account_number, a.owner_name FROM bank_accounts a WHERE EXISTS (SELECT 1 FROM blacklisted_transfers b WHERE b.account_id = a.id);',
            textEn: 'SELECT a.account_number, a.owner_name FROM bank_accounts a WHERE EXISTS (SELECT 1 FROM blacklisted_transfers b WHERE b.account_id = a.id);',
          },
        ],
        requiredKeywords: ['EXISTS', 'WHERE'],
        xpReward: 25,
      },
      {
        id: 'lesson-4-3',
        moduleId: 'module-4',
        orderIndex: 3,
        titleVi: '4.3 Hợp Nhất Danh Sách Truy Nã (Phép toán UNION & EXCEPT)',
        titleEn: '4.3 Consolidate Watchlists (UNION & EXCEPT Sets)',
        briefingVi: 'Cảnh sát địa phương (`local_wanted`) và Interpol (`interpol_wanted`) có hai danh sách đối tượng truy nã riêng biệt. Hãy gộp hai danh sách này thành một tập hợp duy nhất không trùng lặp.',
        briefingEn: 'City detectives (`local_wanted`) and Interpol (`interpol_wanted`) maintain separate fugitives logs. Merge them into a single unified list removing duplicates.',
        theoryVi: `### Phép toán tập hợp (Set Operations)
* \`UNION\`: Hợp nhất kết quả của hai truy vấn và **tự động loại bỏ các dòng trùng lặp**.
* \`UNION ALL\`: Hợp nhất tất cả các dòng (giữ nguyên bản ghi trùng, tốc độ thực thi nhanh hơn \`UNION\`).
* \`INTERSECT\`: Lấy phần giao (những dòng có mặt ở cả hai truy vấn).
* \`EXCEPT\`: Lấy những dòng có ở truy vấn thứ nhất nhưng không có ở truy vấn thứ hai.
* **Điều kiện:** Cả hai truy vấn phải có cùng số lượng cột và tương thích kiểu dữ liệu.`,
        theoryEn: `### Set Operations
* \`UNION\`: Merges distinct results from two queries, **automatically removing duplicate rows**.
* \`UNION ALL\`: Combines all rows without deduplication (faster execution than \`UNION\`).
* \`INTERSECT\`: Returns rows appearing in both query sets.
* \`EXCEPT\`: Returns rows in the first query set that do not appear in the second.
* **Requirement:** Both queries must feature equal column counts and compatible data types.`,
        detectiveAnalogy: {
          actionVi: 'Hợp nhất danh sách truy nã giữa Cục Thám Tử & Interpol',
          actionEn: 'Merge municipal fugitive registers with Interpol red notices',
          storyVi: 'Cục Thám tử Thành phố có một danh sách truy nã, Interpol có một danh sách quốc tế. UNION giúp hợp nhất 2 tập hồ sơ thành một bản báo cáo chung duy nhất, đồng thời tự động loại bỏ các đối tượng bị ghi trùng tên.',
          storyEn: 'City detectives and Interpol maintain separate fugitive sheets. UNION consolidates both logs into one clean master ledger, automatically purging duplicate entries.',
          syntaxTakeawayVi: 'UNION (Hợp nhất loại trùng) | UNION ALL (Giữ nguyên)',
          syntaxTakeawayEn: 'UNION (Distinct merge) | UNION ALL (Include duplicates)',
        },
        interactiveExample: {
          query: 'SELECT name, crime_category FROM local_wanted UNION SELECT name, crime_category FROM interpol_wanted;',
          captionVi: 'Hợp nhất danh sách truy nã không trùng lặp',
          captionEn: 'Consolidate distinct wanted lists',
        },
        objectiveVi: 'Sử dụng `UNION` để hợp nhất danh sách `name`, `crime_category` từ bảng `local_wanted` và bảng `interpol_wanted`.',
        objectiveEn: 'Use `UNION` to merge `name`, `crime_category` from `local_wanted` and `interpol_wanted`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT name, crime_category FROM local_wanted UNION SELECT name, crime_category FROM interpol_wanted;',
        schemaSql: `CREATE TABLE local_wanted (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  crime_category TEXT NOT NULL
);
CREATE TABLE interpol_wanted (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  crime_category TEXT NOT NULL
);`,
        seedSql: `INSERT INTO local_wanted VALUES 
(1, 'Marcus Vance', 'Robbery'),
(2, 'Damian Cruz', 'Extortion');
INSERT INTO interpol_wanted VALUES 
(1, 'Marcus Vance', 'Robbery'),
(2, 'Elena Rostova', 'Cybercrime');`,
        tables: [
          {
            name: 'local_wanted',
            columns: [
              { name: 'name', type: 'TEXT' },
              { name: 'crime_category', type: 'TEXT' },
            ],
          },
          {
            name: 'interpol_wanted',
            columns: [
              { name: 'name', type: 'TEXT' },
              { name: 'crime_category', type: 'TEXT' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Cú pháp UNION',
            titleEn: 'Hint 1: UNION syntax',
            textVi: 'SELECT ... FROM local_wanted UNION SELECT ... FROM interpol_wanted',
            textEn: 'SELECT ... FROM local_wanted UNION SELECT ... FROM interpol_wanted',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Chọn đúng 2 cột',
            titleEn: 'Hint 2: Select exact 2 columns',
            textVi: 'Cột: name, crime_category',
            textEn: 'Columns: name, crime_category',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT name, crime_category FROM local_wanted UNION SELECT name, crime_category FROM interpol_wanted;',
            textEn: 'SELECT name, crime_category FROM local_wanted UNION SELECT name, crime_category FROM interpol_wanted;',
          },
        ],
        requiredKeywords: ['UNION'],
        xpReward: 20,
      },
      {
        id: 'lesson-4-4',
        moduleId: 'module-4',
        orderIndex: 4,
        titleVi: '4.4 Báo Cáo Chuyên Án Đặc Biệt (Common Table Expressions - WITH CTE)',
        titleEn: '4.4 Special Case Dossier (Common Table Expressions - WITH CTE)',
        briefingVi: 'Để phục vụ cuộc họp chỉ huy tối mật, hãy dùng CTE (`WITH`) để tách bạch bước tính tổng giá trị tang vật thu giữ của từng chuyên án (`case_summary`), sau đó chọn ra các chuyên án có tổng giá trị trên 100,000 USD.',
        briefingEn: 'Prepare an executive briefing by structuring a Common Table Expression (`WITH`) named `case_summary` that aggregates evidence by case, then filters cases exceeding $100,000.',
        theoryVi: `### Bảng biểu thức chung (Common Table Expressions - \`WITH\`)
Mệnh đề \`WITH\` giúp tạo các "bảng tạm có tên" (CTE) tồn tại trong phạm vi của câu lệnh, làm cho truy vấn phức tạp trở nên mạch lạc, dễ đọc và dễ bảo trì:
\`\`\`sql
WITH high_value_cases AS (
  SELECT case_code, SUM(estimated_value) AS total_val
  FROM evidence
  GROUP BY case_code
)
SELECT case_code, total_val
FROM high_value_cases
WHERE total_val > 100000;
\`\`\``,
        theoryEn: `### Common Table Expressions (\`WITH ... AS\`)
A CTE creates a named temporary result set valid within the execution scope of a single query, making complex logic modular and readable:
\`\`\`sql
WITH high_value_cases AS (
  SELECT case_code, SUM(estimated_value) AS total_val
  FROM evidence
  GROUP BY case_code
)
SELECT case_code, total_val
FROM high_value_cases
WHERE total_val > 100000;
\`\`\``,
        detectiveAnalogy: {
          actionVi: 'Tìm điểm trùng khớp nhân chứng & Xác lập chứng cứ ngoại phạm',
          actionEn: 'Find witness overlap and verify rock-solid alibis',
          storyVi: 'INTERSECT tìm ra những kẻ vừa xuất hiện trong danh sách có mặt ở sòng bạc VÀ vừa nằm trong danh sách mua súng; còn EXCEPT lấy danh sách toàn bộ nghi phạm TRỪ ĐI những ai đã được bác sĩ chứng minh đang nằm viện.',
          storyEn: 'INTERSECT isolates individuals caught at the speakeasy AND on the weapons registry; EXCEPT takes all suspects MINUS those verified by hospital alibis.',
          syntaxTakeawayVi: 'INTERSECT (Giao nhau) | EXCEPT (Loại trừ ngoại phạm)',
          syntaxTakeawayEn: 'INTERSECT (Intersect) | EXCEPT (Exclude alibis)',
        },
        interactiveExample: {
          query: 'WITH case_totals AS (SELECT case_code, SUM(estimated_value) AS total_val FROM evidence GROUP BY case_code) SELECT case_code, total_val FROM case_totals WHERE total_val > 50000;',
          captionVi: 'Sử dụng CTE để gom nhóm và lọc dữ liệu sạch sẽ',
          captionEn: 'Use CTE for clean modular aggregation',
        },
        objectiveVi: 'Viết CTE có tên `case_summary` gom nhóm `case_code` và `SUM(estimated_value) AS total_val` từ `evidence`, sau đó câu lệnh chính chọn `case_code`, `total_val` từ `case_summary` với điều kiện `total_val > 100000`.',
        objectiveEn: 'Construct a CTE named `case_summary` selecting `case_code` and `SUM(estimated_value) AS total_val` from `evidence` grouped by `case_code`, then query `case_code`, `total_val` where `total_val > 100000`.',
        starterQuery: 'WITH case_summary AS (\n  \n)\nSELECT \n',
        expectedSolutionQuery: 'WITH case_summary AS (SELECT case_code, SUM(estimated_value) AS total_val FROM evidence GROUP BY case_code) SELECT case_code, total_val FROM case_summary WHERE total_val > 100000;',
        schemaSql: `CREATE TABLE evidence (
  id INTEGER PRIMARY KEY,
  case_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  estimated_value REAL
);`,
        seedSql: `INSERT INTO evidence VALUES 
(1, 'CASE-101', 'Diamond Watch', 120000),
(2, 'CASE-101', 'Cash', 30000),
(3, 'CASE-102', 'Laptops', 15000),
(4, 'CASE-103', 'Artwork', 250000);`,
        tables: [
          {
            name: 'evidence',
            columns: [
              { name: 'case_code', type: 'TEXT' },
              { name: 'estimated_value', type: 'REAL' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Định nghĩa CTE',
            titleEn: 'Hint 1: Define CTE',
            textVi: 'WITH case_summary AS (SELECT case_code, SUM(estimated_value) AS total_val FROM evidence GROUP BY case_code)',
            textEn: 'WITH case_summary AS (SELECT case_code, SUM(estimated_value) AS total_val FROM evidence GROUP BY case_code)',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Câu SELECT chính',
            titleEn: 'Hint 2: Main SELECT',
            textVi: 'SELECT case_code, total_val FROM case_summary WHERE total_val > 100000;',
            textEn: 'SELECT case_code, total_val FROM case_summary WHERE total_val > 100000;',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'WITH case_summary AS (SELECT case_code, SUM(estimated_value) AS total_val FROM evidence GROUP BY case_code) SELECT case_code, total_val FROM case_summary WHERE total_val > 100000;',
            textEn: 'WITH case_summary AS (SELECT case_code, SUM(estimated_value) AS total_val FROM evidence GROUP BY case_code) SELECT case_code, total_val FROM case_summary WHERE total_val > 100000;',
          },
        ],
        requiredKeywords: ['WITH', 'AS', 'GROUP BY'],
        xpReward: 25,
      },
    ],
  },

  // =========================================================================
  // MODULE 5: FORENSIC LOGIC, TEXT & DATE ANALYTICS (LOGIC & XỬ LÝ CHUỖI/NGÀY)
  // =========================================================================
  {
    id: 'module-5',
    orderIndex: 5,
    titleVi: 'Học phần 5: Phân Loại Rủi Ro & Pháp Y Số (CASE & String/Date)',
    titleEn: 'Module 5: Forensic Logic & Text/Date Analytics',
    descriptionVi: 'Xử lý logic điều kiện với CASE WHEN, tính toán mốc thời gian gây án và trích xuất dấu vết chuỗi mã hóa.',
    descriptionEn: 'Apply conditional CASE WHEN logic, reconstruct incident timestamps, and parse encrypted string traces.',
    badgeCode: 'badge_forensic_decoder',
    badgeNameVi: 'Chuyên Viên Giải Mã Pháp Y',
    badgeNameEn: 'Forensic Decoder Badge',
    badgeIcon: 'Binary',
    lessons: [
      {
        id: 'lesson-5-1',
        moduleId: 'module-5',
        orderIndex: 1,
        titleVi: '5.1 Đánh Giá Cấp Độ Nguy Hiểm (Biểu thức CASE WHEN)',
        titleEn: '5.1 Assess Threat Severity (CASE WHEN Expressions)',
        briefingVi: 'Căn cứ vào số tiền án (`prior_convictions`), hãy phân loại mỗi nghi phạm vào một cấp độ nguy hiểm: trên 3 tiền án là \'HIGH\', từ 1 đến 3 là \'MEDIUM\', còn lại là \'LOW\'.',
        briefingEn: 'Based on conviction history (`prior_convictions`), classify each suspect: > 3 convictions is \'HIGH\', 1 to 3 is \'MEDIUM\', otherwise \'LOW\'.',
        theoryVi: `### Biểu thức điều kiện \`CASE WHEN\`
\`CASE\` là công cụ rẽ nhánh logic trong câu lệnh SQL:
\`\`\`sql
SELECT name,
       CASE 
         WHEN score >= 90 THEN 'EXCELLENT'
         WHEN score >= 70 THEN 'GOOD'
         ELSE 'NEEDS_IMPROVEMENT'
       END AS grade
FROM cadets;
\`\`\``,
        theoryEn: `### Conditional \`CASE WHEN\` Logic
\`CASE\` provides branching logic inside SQL queries:
\`\`\`sql
SELECT name,
       CASE 
         WHEN score >= 90 THEN 'EXCELLENT'
         WHEN score >= 70 THEN 'GOOD'
         ELSE 'NEEDS_IMPROVEMENT'
       END AS grade
FROM cadets;
\`\`\``,
        detectiveAnalogy: {
          actionVi: 'Giải mã mật thư & Chuẩn hóa biên bản pháp y',
          actionEn: 'Decode cryptic cyphers and standardize forensic transcripts',
          storyVi: 'Các bức thư nặc danh hay mã vụ án thường bị viết lộn xộn hoặc mã hóa. Các hàm UPPER, LOWER, SUBSTR, INSTR giống như kính hiển vi quang phổ giúp bóc tách từng ký tự đầu đọc mã bí mật và chuẩn hóa họ tên nghi can.',
          storyEn: 'Anonymous ransom notes and cipher codes arrive jumbled. String functions (UPPER, SUBSTR, INSTR) act as forensic laboratory prisms to extract initials and decrypt hidden codes.',
          syntaxTakeawayVi: 'SUBSTR (Cắt chuỗi) | UPPER/LOWER (Đổi chữ)',
          syntaxTakeawayEn: 'SUBSTR (Slice) | UPPER/LOWER (Normalize)',
        },
        interactiveExample: {
          query: "SELECT name, prior_convictions, CASE WHEN prior_convictions > 3 THEN 'HIGH' WHEN prior_convictions >= 1 THEN 'MEDIUM' ELSE 'LOW' END AS threat_level FROM suspects;",
          captionVi: 'Phân loại mức độ nguy hiểm với CASE WHEN',
          captionEn: 'Evaluate threat level with CASE WHEN',
        },
        objectiveVi: 'Lấy `name`, `prior_convictions`, và biểu thức `CASE WHEN prior_convictions > 3 THEN \'HIGH\' WHEN prior_convictions >= 1 THEN \'MEDIUM\' ELSE \'LOW\' END AS threat_level` từ `suspects`.',
        objectiveEn: 'Select `name`, `prior_convictions`, and evaluate `CASE WHEN prior_convictions > 3 THEN \'HIGH\' WHEN prior_convictions >= 1 THEN \'MEDIUM\' ELSE \'LOW\' END AS threat_level` from `suspects`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: "SELECT name, prior_convictions, CASE WHEN prior_convictions > 3 THEN 'HIGH' WHEN prior_convictions >= 1 THEN 'MEDIUM' ELSE 'LOW' END AS threat_level FROM suspects;",
        schemaSql: `CREATE TABLE suspects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  prior_convictions INTEGER NOT NULL
);`,
        seedSql: `INSERT INTO suspects VALUES 
(1, 'Marcus Vance', 5),
(2, 'Elena Rostova', 2),
(3, 'Sophia Chen', 0),
(4, 'Damian Cruz', 4);`,
        tables: [
          {
            name: 'suspects',
            columns: [
              { name: 'name', type: 'TEXT' },
              { name: 'prior_convictions', type: 'INTEGER' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Cấu trúc CASE WHEN',
            titleEn: 'Hint 1: CASE WHEN structure',
            textVi: "CASE WHEN prior_convictions > 3 THEN 'HIGH' WHEN prior_convictions >= 1 THEN 'MEDIUM' ELSE 'LOW' END AS threat_level",
            textEn: "CASE WHEN prior_convictions > 3 THEN 'HIGH' WHEN prior_convictions >= 1 THEN 'MEDIUM' ELSE 'LOW' END AS threat_level",
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Nhớ từ khóa END',
            titleEn: 'Hint 2: Include END',
            textVi: 'Mọi biểu thức CASE bắt buộc phải kết thúc bằng END.',
            textEn: 'Every CASE expression must terminate with END.',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: "SELECT name, prior_convictions, CASE WHEN prior_convictions > 3 THEN 'HIGH' WHEN prior_convictions >= 1 THEN 'MEDIUM' ELSE 'LOW' END AS threat_level FROM suspects;",
            textEn: "SELECT name, prior_convictions, CASE WHEN prior_convictions > 3 THEN 'HIGH' WHEN prior_convictions >= 1 THEN 'MEDIUM' ELSE 'LOW' END AS threat_level FROM suspects;",
          },
        ],
        requiredKeywords: ['CASE', 'WHEN', 'THEN', 'ELSE', 'END'],
        xpReward: 20,
      },
      {
        id: 'lesson-5-2',
        moduleId: 'module-5',
        orderIndex: 2,
        titleVi: '5.2 Tái Dựng Dòng Thời Gian Gây Án (Hàm Date & Time)',
        titleEn: '5.2 Timeline Reconstruction (Date & Time Functions)',
        briefingVi: 'Các vụ phạm tội được ghi nhận thời điểm dạng chuỗi ISO `YYYY-MM-DD HH:MM:SS`. Hãy trích xuất năm và tháng (`strftime(\'%Y-%m\', incident_time)`) để thống kê các vụ án diễn ra trong tháng 03 năm 2026.',
        briefingEn: 'Crimes are timestamped in ISO format `YYYY-MM-DD HH:MM:SS`. Extract year and month (`strftime(\'%Y-%m\', incident_time)`) to filter incidents occurring in March 2026.',
        theoryVi: `### Xử lý Ngày Giờ trong SQLite
* \`strftime(format, timestring)\`: Định dạng chuỗi ngày giờ theo định dạng chỉ định:
  * \`'%Y'\`: Năm (4 số).
  * \`'%m'\`: Tháng (01-12).
  * \`'%d'\`: Ngày trong tháng (01-31).
  * \`'%H'\`: Giờ (00-24).
* Ví dụ: \`strftime('%Y-%m', created_at) = '2026-03'\`.`,
        theoryEn: `### Date & Time Operations in SQLite
* \`strftime(format, timestring)\`: Formats date/time according to format specifiers:
  * \`'%Y'\`: 4-digit Year.
  * \`'%m'\`: 2-digit Month (01-12).
  * \`'%d'\`: Day of Month (01-31).
  * \`'%H'\`: Hour (00-24).
* Example: \`strftime('%Y-%m', created_at) = '2026-03'\`.`,
        detectiveAnalogy: {
          actionVi: 'Dựng lại dòng thời gian (Timeline) gây án',
          actionEn: 'Reconstruct crime scene chronological timeline',
          storyVi: 'Để chứng minh hung thủ có kịp di chuyển từ hiện trường tới quán bar hay không, thám tử dùng hàm strftime để bóc tách giờ, phút, giây từ camera giám sát và tính toán độ chênh lệch thời gian di chuyển.',
          storyEn: 'To disprove fabricated travel alibis, strftime decomposes timestamp hours and seconds from CCTV logs to calculate exact elapsed getaway times.',
          syntaxTakeawayVi: "strftime('%H:%M:%S', time) = Khóa mốc thời gian",
          syntaxTakeawayEn: "strftime('%H:%M:%S', time) = Lock timestamps",
        },
        interactiveExample: {
          query: "SELECT incident_code, location, strftime('%Y-%m', incident_time) AS month_year FROM crime_logs WHERE strftime('%Y-%m', incident_time) = '2026-03';",
          captionVi: 'Trích xuất vụ án xảy ra trong tháng 03/2026',
          captionEn: 'Filter incidents from March 2026',
        },
        objectiveVi: 'Lấy `incident_code`, `location` từ `crime_logs` với điều kiện `strftime(\'%Y-%m\', incident_time) = \'2026-03\'`.',
        objectiveEn: 'Select `incident_code`, `location` from `crime_logs` where `strftime(\'%Y-%m\', incident_time) = \'2026-03\'`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: "SELECT incident_code, location FROM crime_logs WHERE strftime('%Y-%m', incident_time) = '2026-03';",
        schemaSql: `CREATE TABLE crime_logs (
  id INTEGER PRIMARY KEY,
  incident_code TEXT NOT NULL,
  location TEXT NOT NULL,
  incident_time TEXT NOT NULL
);`,
        seedSql: `INSERT INTO crime_logs VALUES 
(1, 'INC-01', 'Bank of America', '2026-03-05 14:20:00'),
(2, 'INC-02', 'Jewelry Store', '2026-03-18 22:45:00'),
(3, 'INC-03', 'Harbor Warehouse', '2026-04-02 03:10:00');`,
        tables: [
          {
            name: 'crime_logs',
            columns: [
              { name: 'incident_code', type: 'TEXT' },
              { name: 'location', type: 'TEXT' },
              { name: 'incident_time', type: 'TEXT' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Hàm strftime',
            titleEn: 'Hint 1: strftime function',
            textVi: "strftime('%Y-%m', incident_time)",
            textEn: "strftime('%Y-%m', incident_time)",
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Mệnh đề WHERE',
            titleEn: 'Hint 2: WHERE clause',
            textVi: "WHERE strftime('%Y-%m', incident_time) = '2026-03'",
            textEn: "WHERE strftime('%Y-%m', incident_time) = '2026-03'",
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: "SELECT incident_code, location FROM crime_logs WHERE strftime('%Y-%m', incident_time) = '2026-03';",
            textEn: "SELECT incident_code, location FROM crime_logs WHERE strftime('%Y-%m', incident_time) = '2026-03';",
          },
        ],
        requiredKeywords: ['strftime', 'WHERE'],
        xpReward: 20,
      },
      {
        id: 'lesson-5-3',
        moduleId: 'module-5',
        orderIndex: 3,
        titleVi: '5.3 Giải Mã Nhật Ký Tình Báo (Hàm Xử Lý Chuỗi SUBSTR, LENGTH)',
        titleEn: '5.3 Decrypt Signal Logs (SUBSTR & String Functions)',
        briefingVi: 'Bộ đàm của tội phạm phát ra các thông điệp có mã đầu nhận diện gồm 3 ký tự (ví dụ: `TAG-9912` thì mã là `TAG`). Hãy dùng hàm `SUBSTR` trích xuất 3 ký tự đầu tiên này.',
        briefingEn: 'Intercepted radio transmissions carry a 3-letter prefix code (e.g. `TAG` from `TAG-9912`). Use `SUBSTR` to parse the 3-character station identifier.',
        theoryVi: `### Các hàm chuỗi thông dụng
* \`SUBSTR(string, start, length)\`: Trích xuất chuỗi con bắt đầu từ vị trí \`start\` (1-indexed) với độ dài \`length\`.
* \`LENGTH(string)\`: Độ dài chuỗi.
* \`UPPER(string)\` / \`LOWER(string)\`: Chuyển đổi chữ hoa / chữ thường.
* \`REPLACE(string, from_str, to_str)\`: Thay thế chuỗi con.`,
        theoryEn: `### String Processing Functions
* \`SUBSTR(string, start, length)\`: Extracts a substring starting at 1-based index \`start\` spanning \`length\` characters.
* \`LENGTH(string)\`: Character count length.
* \`UPPER(string)\` / \`LOWER(string)\`: Case transformations.
* \`REPLACE(string, from_str, to_str)\`: Replaces occurrences of a substring.`,
        detectiveAnalogy: {
          actionVi: 'Dán nhãn cấp độ nguy hiểm & Phân loại đối tượng',
          actionEn: 'Assign tactical danger ratings and threat levels',
          storyVi: "CASE WHEN giống như bộ quy tắc đánh dấu màu trong hồ sơ thám tử: NẾU đối tượng có súng và tiền án -> Dán mác 'Báo động đỏ'; NẾU chỉ cướp giật -> 'Báo động vàng'; CÒN LẠI -> 'Theo dõi thông thường'.",
          storyEn: "CASE WHEN acts as triage protocol for suspect dossiers: WHEN armed with firearms -> 'Red Alert'; WHEN petty thief -> 'Yellow Warning'; ELSE -> 'Standard Surveillance'.",
          syntaxTakeawayVi: 'CASE WHEN [Điều kiện] THEN [Nhãn] ELSE [Mặc định] END',
          syntaxTakeawayEn: 'CASE WHEN [Condition] THEN [Tag] ELSE [Default] END',
        },
        interactiveExample: {
          query: 'SELECT raw_message, SUBSTR(raw_message, 1, 3) AS station_prefix FROM radio_intercepts;',
          captionVi: 'Trích xuất tiền tố 3 ký tự đầu',
          captionEn: 'Extract 3-letter prefix',
        },
        objectiveVi: 'Lấy `id`, `SUBSTR(raw_message, 1, 3) AS station_code` từ bảng `radio_intercepts`.',
        objectiveEn: 'Select `id`, `SUBSTR(raw_message, 1, 3) AS station_code` from `radio_intercepts`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT id, SUBSTR(raw_message, 1, 3) AS station_code FROM radio_intercepts;',
        schemaSql: `CREATE TABLE radio_intercepts (
  id INTEGER PRIMARY KEY,
  raw_message TEXT NOT NULL
);`,
        seedSql: `INSERT INTO radio_intercepts VALUES 
(1, 'SIG-Alpha-Ready'),
(2, 'RED-Sector-Secure'),
(3, 'SIG-Echo-Departed');`,
        tables: [
          {
            name: 'radio_intercepts',
            columns: [
              { name: 'id', type: 'INTEGER', isPk: true },
              { name: 'raw_message', type: 'TEXT' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Cú pháp SUBSTR',
            titleEn: 'Hint 1: SUBSTR syntax',
            textVi: 'SUBSTR(raw_message, 1, 3)',
            textEn: 'SUBSTR(raw_message, 1, 3)',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Đặt alias',
            titleEn: 'Hint 2: Set alias',
            textVi: 'SUBSTR(raw_message, 1, 3) AS station_code',
            textEn: 'SUBSTR(raw_message, 1, 3) AS station_code',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT id, SUBSTR(raw_message, 1, 3) AS station_code FROM radio_intercepts;',
            textEn: 'SELECT id, SUBSTR(raw_message, 1, 3) AS station_code FROM radio_intercepts;',
          },
        ],
        requiredKeywords: ['SUBSTR'],
        xpReward: 15,
      },
    ],
  },

  // =========================================================================
  // MODULE 6: ELITE DETECTIVE (WINDOW FUNCTIONS & ANALYTIC SQL)
  // =========================================================================
  {
    id: 'module-6',
    orderIndex: 6,
    titleVi: 'Học phần 6: Thám Tử Tinh Nhuệ - Window Functions',
    titleEn: 'Module 6: Elite Detective - Window Functions',
    descriptionVi: 'Phân tích dữ liệu chuyên nghiệp với ROW_NUMBER, RANK, running totals và hàm truy vết độ trễ LAG/LEAD.',
    descriptionEn: 'Advanced forensic analytics with ROW_NUMBER, RANK, running totals, and LAG/LEAD timeline tracking.',
    badgeCode: 'badge_elite_detective',
    badgeNameVi: 'Huy Hiệu Trinh Sát Đặc Nhiệm',
    badgeNameEn: 'Elite Detective Badge',
    badgeIcon: 'Sparkles',
    lessons: [
      {
        id: 'lesson-6-1',
        moduleId: 'module-6',
        orderIndex: 1,
        titleVi: '6.1 Bảng Xếp Hạng Hiệu Suất (ROW_NUMBER & DENSE_RANK)',
        titleEn: '6.1 Precinct Leaderboard (ROW_NUMBER & DENSE_RANK)',
        briefingVi: 'Hãy xếp thứ hạng cho các sĩ quan tuần tra trong từng đơn vị (`district`) dựa trên số lượng vụ án họ đã giải quyết (`cases_solved`), xếp hạng từ cao xuống thấp.',
        briefingEn: 'Rank patrol officers within each respective `district` by their `cases_solved` metric in descending order using DENSE_RANK.',
        theoryVi: `### Window Functions: Cú pháp \`OVER (PARTITION BY ... ORDER BY ...)\`
Khác với \`GROUP BY\` (thu gọn nhiều dòng thành 1), Window Functions thực hiện phép tính trên một "cửa sổ" dữ liệu mà **vẫn giữ nguyên từng dòng riêng lẻ**:
* \`ROW_NUMBER() OVER (...)\`: Đánh số thứ tự liên tục 1, 2, 3...
* \`RANK() OVER (...)\`: Đánh thứ hạng, nếu đồng hạng sẽ nhảy số (ví dụ: 1, 2, 2, 4).
* \`DENSE_RANK() OVER (...)\`: Đánh thứ hạng liên tục không nhảy số (ví dụ: 1, 2, 2, 3).
* \`PARTITION BY\`: Chia dữ liệu thành các cửa sổ độc lập (tương tự như gom nhóm).`,
        theoryEn: `### Window Functions: \`OVER (PARTITION BY ... ORDER BY ...)\`
Unlike \`GROUP BY\` (which collapses rows), Window Functions compute across a partition window while **preserving each individual row**:
* \`ROW_NUMBER() OVER (...)\`: Generates strict sequential row numbers (1, 2, 3...).
* \`RANK() OVER (...)\`: Assigns ranks with gaps on ties (e.g. 1, 2, 2, 4).
* \`DENSE_RANK() OVER (...)\`: Assigns consecutive ranks without gaps (e.g. 1, 2, 2, 3).
* \`PARTITION BY\`: Splits data into calculation windows per group.`,
        detectiveAnalogy: {
          actionVi: 'Bảng vàng thám tử & Xếp hạng tội phạm theo địa bàn',
          actionEn: 'Award honor rolls & Rank criminals within local precincts',
          storyVi: 'ROW_NUMBER và RANK cho phép thám tử đánh số thứ tự từ 1 đến N cho các nghi phạm nguy hiểm nhất trong TỪNG quận (PARTITION BY district) mà không hề gộp bảng hay làm mất thông tin cá nhân của từng tên.',
          storyEn: 'Window functions (ROW_NUMBER, RANK) assign rank numbers within EACH district without collapsing rows, preserving individual suspect identities.',
          syntaxTakeawayVi: 'RANK() OVER (PARTITION BY [Khu vực] ORDER BY [Điểm])',
          syntaxTakeawayEn: 'RANK() OVER (PARTITION BY [Zone] ORDER BY [Score])',
        },
        interactiveExample: {
          query: 'SELECT officer_name, district, cases_solved, DENSE_RANK() OVER (PARTITION BY district ORDER BY cases_solved DESC) AS district_rank FROM patrol_stats;',
          captionVi: 'Xếp hạng sĩ quan theo từng khu vực',
          captionEn: 'Rank officers within each district partition',
        },
        objectiveVi: 'Lấy `officer_name`, `district`, `cases_solved`, và `DENSE_RANK() OVER (PARTITION BY district ORDER BY cases_solved DESC) AS district_rank` từ `patrol_stats`.',
        objectiveEn: 'Select `officer_name`, `district`, `cases_solved`, and `DENSE_RANK() OVER (PARTITION BY district ORDER BY cases_solved DESC) AS district_rank` from `patrol_stats`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT officer_name, district, cases_solved, DENSE_RANK() OVER (PARTITION BY district ORDER BY cases_solved DESC) AS district_rank FROM patrol_stats;',
        schemaSql: `CREATE TABLE patrol_stats (
  id INTEGER PRIMARY KEY,
  officer_name TEXT NOT NULL,
  district TEXT NOT NULL,
  cases_solved INTEGER NOT NULL
);`,
        seedSql: `INSERT INTO patrol_stats VALUES 
(1, 'Miller', 'North', 15),
(2, 'Ross', 'North', 22),
(3, 'Harper', 'North', 15),
(4, 'Chen', 'South', 30),
(5, 'Silva', 'South', 18);`,
        tables: [
          {
            name: 'patrol_stats',
            columns: [
              { name: 'officer_name', type: 'TEXT' },
              { name: 'district', type: 'TEXT' },
              { name: 'cases_solved', type: 'INTEGER' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Cú pháp DENSE_RANK',
            titleEn: 'Hint 1: DENSE_RANK syntax',
            textVi: 'DENSE_RANK() OVER (PARTITION BY district ORDER BY cases_solved DESC)',
            textEn: 'DENSE_RANK() OVER (PARTITION BY district ORDER BY cases_solved DESC)',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Đặt alias',
            titleEn: 'Hint 2: Column alias',
            textVi: '... AS district_rank',
            textEn: '... AS district_rank',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT officer_name, district, cases_solved, DENSE_RANK() OVER (PARTITION BY district ORDER BY cases_solved DESC) AS district_rank FROM patrol_stats;',
            textEn: 'SELECT officer_name, district, cases_solved, DENSE_RANK() OVER (PARTITION BY district ORDER BY cases_solved DESC) AS district_rank FROM patrol_stats;',
          },
        ],
        requiredKeywords: ['DENSE_RANK', 'OVER', 'PARTITION BY'],
        xpReward: 25,
      },
      {
        id: 'lesson-6-2',
        moduleId: 'module-6',
        orderIndex: 2,
        titleVi: '6.2 Lũy Kế Biến Động Ngân Sách Đen (Running Total)',
        titleEn: '6.2 Slush Fund Running Cumulative Totals',
        briefingVi: 'Theo dõi sự tích lũy của dòng tiền rửa đen qua từng đợt chuyển tiền bằng cách tính tổng lũy kế (`running_total`) theo thứ tự thời gian (`id`).',
        briefingEn: 'Track money laundering escalation by computing a cumulative running total of transfer amounts ordered by transaction `id`.',
        theoryVi: `### Tính tổng lũy kế với \`SUM() OVER (ORDER BY ...)\`
Khi kết hợp \`SUM(column)\` với \`OVER (ORDER BY ...)\`, hàm sẽ tính tổng cộng dồn từ dòng đầu tiên đến dòng hiện tại:
\`\`\`sql
SELECT tx_date, amount,
       SUM(amount) OVER (ORDER BY tx_date) AS running_total
FROM daily_deposits;
\`\`\``,
        theoryEn: `### Cumulative Running Total with \`SUM() OVER (ORDER BY ...)\`
When combining \`SUM(column)\` with \`OVER (ORDER BY ...)\`,
        detectiveAnalogy: {
          actionVi: 'Theo dõi dấu chân: Kẻ gian vừa ở đâu và chuẩn bị đi đâu?',
          actionEn: 'Track suspect footsteps: Where were they before and next?',
          storyVi: 'LEAD nhìn về phía trước 1 bước, LAG nhìn ngược về quá khứ 1 bước. Giống như thám tử theo dõi dấu vết định vị: biết ngay nghi phạm vừa ở tiệm vàng (LAG) trước khi đến khách sạn, và điểm đến tiếp theo là bến cảng (LEAD).',
          storyEn: 'LAG peers one step into the past; LEAD peers one step into the future. Tracing suspect movements: uncovering which bank was visited prior (LAG) and which airport next (LEAD).',
          syntaxTakeawayVi: 'LAG (Dấu vết trước) <-> LEAD (Dấu vết sau)',
          syntaxTakeawayEn: 'LAG (Previous Step) <-> LEAD (Next Step)',
        }, SQL calculates an incremental accumulation from the partition start through the current row:
\`\`\`sql
SELECT tx_date, amount,
       SUM(amount) OVER (ORDER BY tx_date) AS running_total
FROM daily_deposits;
\`\`\``,
        interactiveExample: {
          query: 'SELECT id, amount, SUM(amount) OVER (ORDER BY id) AS running_total FROM slush_fund_transfers;',
          captionVi: 'Tính tổng lũy kế tăng dần',
          captionEn: 'Calculate running total accumulation',
        },
        objectiveVi: 'Lấy `id`, `amount`, và `SUM(amount) OVER (ORDER BY id) AS running_total` từ `slush_fund_transfers`.',
        objectiveEn: 'Select `id`, `amount`, and `SUM(amount) OVER (ORDER BY id) AS running_total` from `slush_fund_transfers`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT id, amount, SUM(amount) OVER (ORDER BY id) AS running_total FROM slush_fund_transfers;',
        schemaSql: `CREATE TABLE slush_fund_transfers (
  id INTEGER PRIMARY KEY,
  amount REAL NOT NULL
);`,
        seedSql: `INSERT INTO slush_fund_transfers VALUES 
(1, 10000),
(2, 25000),
(3, 15000),
(4, 50000);`,
        tables: [
          {
            name: 'slush_fund_transfers',
            columns: [
              { name: 'id', type: 'INTEGER', isPk: true },
              { name: 'amount', type: 'REAL' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Cú pháp SUM OVER',
            titleEn: 'Hint 1: SUM OVER syntax',
            textVi: 'SUM(amount) OVER (ORDER BY id)',
            textEn: 'SUM(amount) OVER (ORDER BY id)',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Đặt alias',
            titleEn: 'Hint 2: Set alias',
            textVi: '... AS running_total',
            textEn: '... AS running_total',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT id, amount, SUM(amount) OVER (ORDER BY id) AS running_total FROM slush_fund_transfers;',
            textEn: 'SELECT id, amount, SUM(amount) OVER (ORDER BY id) AS running_total FROM slush_fund_transfers;',
          },
        ],
        requiredKeywords: ['SUM', 'OVER', 'ORDER BY'],
        xpReward: 25,
      },
      {
        id: 'lesson-6-3',
        moduleId: 'module-6',
        orderIndex: 3,
        titleVi: '6.3 Truy Vết Hành Trình Tẩu Thoát (LAG & LEAD)',
        titleEn: '6.3 Getaway Route Tracking (LAG & LEAD)',
        briefingVi: 'Camera an ninh ghi lại các địa điểm nghi phạm ghé qua theo thứ tự thời gian. Sử dụng hàm `LAG()` để hiển thị vị trí trước đó (`previous_location`) của nghi phạm.',
        briefingEn: 'Surveillance cameras log checkpoints visited by a suspect over time. Use `LAG()` to pinpoint their previous location at each stage.',
        theoryVi: `### Hàm \`LAG\` và \`LEAD\`
* \`LAG(column, offset, default)\`: Lấy giá trị của \`column\` từ dòng phía **trước** đó \`offset\` dòng (mặc định offset = 1).
* \`LEAD(column, offset, default)\`: Lấy giá trị của \`column\` từ dòng phía **sau** đó \`offset\` dòng.
* Rất hữu ích để tính toán chênh lệch giữa các mốc thời gian, sự thay đổi giá hoặc dò tìm hành trình di chuyển.`,
        theoryEn: `### Functions \`LAG\` and \`LEAD\`
* \`LAG(column, offset, default)\`: Retrieves the value of \`column\` from \`offset\` rows **prior** (default offset = 1).
* \`LEAD(column, offset, default)\`: Retrieves the value of \`column\` from \`offset\` rows **ahead**.
* Indispensable for computing delta differences, velocity shifts, and sequential route tracking.`,
        detectiveAnalogy: {
          actionVi: 'Tính lũy kế tổng thiệt hại của chuỗi trộm cắp liên hoàn',
          actionEn: 'Calculate running cumulative damage of crime sprees',
          storyVi: 'Băng đảng trộm cắp liên tiếp qua nhiều ngày. Thay vì chỉ xem số tiền từng vụ, SUM(...) OVER (ORDER BY ngay) giúp thám tử thấy được đường biểu diễn tổng thiệt hại tăng dần theo thời gian qua từng phi vụ.',
          storyEn: 'Syndicates strike continuously. SUM(...) OVER (ORDER BY date) tracks running cumulative loot accumulation over the entire crime wave timeline.',
          syntaxTakeawayVi: 'SUM(tien) OVER (ORDER BY ngay) = Tổng lũy kế',
          syntaxTakeawayEn: 'SUM(amount) OVER (ORDER BY date) = Running Total',
        },
        interactiveExample: {
          query: 'SELECT checkpoint_id, location, LAG(location, 1, \'START\') OVER (ORDER BY checkpoint_id) AS previous_location FROM suspect_route;',
          captionVi: 'Xem vị trí trước đó của nghi phạm',
          captionEn: 'Inspect suspect previous checkpoint',
        },
        objectiveVi: 'Lấy `checkpoint_id`, `location`, và `LAG(location, 1, \'ORIGIN\') OVER (ORDER BY checkpoint_id) AS previous_location` từ `suspect_route`.',
        objectiveEn: 'Select `checkpoint_id`, `location`, and `LAG(location, 1, \'ORIGIN\') OVER (ORDER BY checkpoint_id) AS previous_location` from `suspect_route`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: "SELECT checkpoint_id, location, LAG(location, 1, 'ORIGIN') OVER (ORDER BY checkpoint_id) AS previous_location FROM suspect_route;",
        schemaSql: `CREATE TABLE suspect_route (
  checkpoint_id INTEGER PRIMARY KEY,
  location TEXT NOT NULL
);`,
        seedSql: `INSERT INTO suspect_route VALUES 
(1, 'Safehouse A'),
(2, 'Subway Station 4'),
(3, 'Harbor Pier 9'),
(4, 'Airport Gate B');`,
        tables: [
          {
            name: 'suspect_route',
            columns: [
              { name: 'checkpoint_id', type: 'INTEGER', isPk: true },
              { name: 'location', type: 'TEXT' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Cú pháp LAG',
            titleEn: 'Hint 1: LAG syntax',
            textVi: "LAG(location, 1, 'ORIGIN') OVER (ORDER BY checkpoint_id)",
            textEn: "LAG(location, 1, 'ORIGIN') OVER (ORDER BY checkpoint_id)",
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Đặt alias',
            titleEn: 'Hint 2: Column alias',
            textVi: '... AS previous_location',
            textEn: '... AS previous_location',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: "SELECT checkpoint_id, location, LAG(location, 1, 'ORIGIN') OVER (ORDER BY checkpoint_id) AS previous_location FROM suspect_route;",
            textEn: "SELECT checkpoint_id, location, LAG(location, 1, 'ORIGIN') OVER (ORDER BY checkpoint_id) AS previous_location FROM suspect_route;",
          },
        ],
        requiredKeywords: ['LAG', 'OVER', 'ORDER BY'],
        xpReward: 25,
      },
    ],
  },

  // =========================================================================
  // MODULE 7: FORENSIC OPTIMIZATION & INDEXING (TỐI ƯU HÓA TRUY VẤN - USER REQUESTED!)
  // =========================================================================
  {
    id: 'module-7',
    orderIndex: 7,
    titleVi: 'Học phần 7: Tối Ưu Hóa Truy Vấn & Đánh Chỉ Mục (Optimization & Indexing)',
    titleEn: 'Module 7: Query Performance, Optimization & Indexing',
    descriptionVi: 'Mổ xẻ kế hoạch thực thi EXPLAIN QUERY PLAN, thiết lập chỉ mục B-Tree (CREATE INDEX), viết câu truy vấn Sargable và triệt tiêu Full Table Scan.',
    descriptionEn: 'Inspect execution plans via EXPLAIN QUERY PLAN, build B-Tree indexes, craft Sargable predicates, and eradicate Full Table Scans.',
    badgeCode: 'badge_query_optimizer',
    badgeNameVi: 'Chuyên Gia Tối Ưu Hiệu Năng SQL',
    badgeNameEn: 'Performance Specialist Badge',
    badgeIcon: 'Zap',
    lessons: [
      {
        id: 'lesson-7-1',
        moduleId: 'module-7',
        orderIndex: 1,
        titleVi: '7.1 Mổ Xẻ Kế Hoạch Tác Chiến (EXPLAIN QUERY PLAN & Full Table Scan)',
        titleEn: '7.1 Dissect Execution Plans (EXPLAIN QUERY PLAN & Scans)',
        briefingVi: 'Khi cơ sở dữ liệu radar giao thông (`traffic_radar_logs`) phình to hàng trăm ngàn dòng, việc quét toàn bộ bảng (`SCAN TABLE`) làm chậm toàn hệ thống điều tra. Hãy chạy lệnh `EXPLAIN QUERY PLAN` để quan sát kế hoạch tác chiến của bộ tối ưu hóa.',
        briefingEn: 'When radar surveillance tables (`traffic_radar_logs`) grow into millions of rows, Full Table Scans choke investigative systems. Execute `EXPLAIN QUERY PLAN` to audit scan cost.',
        theoryVi: `### \`EXPLAIN QUERY PLAN\` là gì?
\`EXPLAIN QUERY PLAN\` là công cụ cho bạn biết bộ tối ưu hóa truy vấn (Query Optimizer) sẽ thực thi câu lệnh của bạn như thế nào:
* \`SCAN TABLE table_name\`: **Full Table Scan** — Quét tuần tự từng dòng từ đầu đến cuối bảng. Cực kỳ tốn kém với bảng lớn ($O(N)$).
* \`SEARCH TABLE table_name USING INDEX index_name (...)\`: **Index Scan** — Sử dụng cấu trúc cây B-Tree để tìm kiếm với độ phức tạp $O(\\log N)$.`,
        theoryEn: `### What is \`EXPLAIN QUERY PLAN\`?
\`EXPLAIN QUERY PLAN\` reveals the execution strategy chosen by the database engine:
* \`SCAN TABLE table_name\`: **Full Table Scan** — Sequentially examines every row from first to last ($O(N)$ complexity). Catastrophic on large databases.
* \`SEARCH TABLE table_name USING INDEX index_name (...)\`: **Index Search** — Traverses a B-Tree structure in $O(\\log N)$ time.`,
        detectiveAnalogy: {
          actionVi: 'Soi bản đồ tác chiến của bộ não SQLite',
          actionEn: 'Inspect the operational roadmap of the SQLite query engine',
          storyVi: 'EXPLAIN QUERY PLAN giống như camera gián điệp nhìn vào não bộ của điều tra viên: thám tử có đang phải lật tung từng trang trong kho hàng triệu hồ sơ (SCAN TABLE) hay đang đi thẳng tới ngăn tủ mục tiêu (SEARCH TABLE)?',
          storyEn: 'EXPLAIN QUERY PLAN is surveillance inside SQLite internals: is the engine flipping through all 100,000 files (SCAN TABLE) or heading straight to the target drawer (SEARCH TABLE)?',
          syntaxTakeawayVi: 'EXPLAIN QUERY PLAN [Câu lệnh SQL]',
          syntaxTakeawayEn: 'EXPLAIN QUERY PLAN [Query]',
        },
        interactiveExample: {
          query: "EXPLAIN QUERY PLAN SELECT * FROM traffic_radar_logs WHERE plate_number = '29A-88888';",
          captionVi: 'Xem kế hoạch thực thi câu truy vấn biển số xe',
          captionEn: 'Inspect execution plan for license plate query',
        },
        objectiveVi: 'Chạy lệnh `EXPLAIN QUERY PLAN SELECT * FROM traffic_radar_logs WHERE plate_number = \'29A-88888\';` để xem kế hoạch quét bảng.',
        objectiveEn: 'Execute `EXPLAIN QUERY PLAN SELECT * FROM traffic_radar_logs WHERE plate_number = \'29A-88888\';` to observe the scan strategy.',
        starterQuery: 'EXPLAIN QUERY PLAN \n',
        expectedSolutionQuery: "EXPLAIN QUERY PLAN SELECT * FROM traffic_radar_logs WHERE plate_number = '29A-88888';",
        schemaSql: `CREATE TABLE traffic_radar_logs (
  id INTEGER PRIMARY KEY,
  plate_number TEXT NOT NULL,
  speed_kmh INTEGER NOT NULL,
  camera_id TEXT NOT NULL,
  captured_at TEXT NOT NULL
);`,
        seedSql: generateRadarLogs5k(),
        tables: [
          {
            name: 'traffic_radar_logs',
            columns: [
              { name: 'id', type: 'INTEGER', isPk: true },
              { name: 'plate_number', type: 'TEXT' },
              { name: 'speed_kmh', type: 'INTEGER' },
              { name: 'camera_id', type: 'TEXT' },
              { name: 'captured_at', type: 'TEXT' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Cú pháp EXPLAIN QUERY PLAN',
            titleEn: 'Hint 1: EXPLAIN QUERY PLAN syntax',
            textVi: "Đặt 'EXPLAIN QUERY PLAN' ngay trước câu lệnh SELECT.",
            textEn: "Prepend 'EXPLAIN QUERY PLAN' directly before the SELECT query.",
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Câu SELECT nguyên bản',
            titleEn: 'Hint 2: Original SELECT statement',
            textVi: "SELECT * FROM traffic_radar_logs WHERE plate_number = '29A-88888';",
            textEn: "SELECT * FROM traffic_radar_logs WHERE plate_number = '29A-88888';",
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: "EXPLAIN QUERY PLAN SELECT * FROM traffic_radar_logs WHERE plate_number = '29A-88888';",
            textEn: "EXPLAIN QUERY PLAN SELECT * FROM traffic_radar_logs WHERE plate_number = '29A-88888';",
          },
        ],
        requiredKeywords: ['EXPLAIN', 'QUERY', 'PLAN'],
        xpReward: 20,
        isOptimizationLesson: true,
      },
      {
        id: 'lesson-7-2',
        moduleId: 'module-7',
        orderIndex: 2,
        titleVi: '7.2 Thiết Lập Chốt Chặn Tốc Độ Cao (CREATE INDEX & B-Tree)',
        titleEn: '7.2 Speed Checkpoint Indexing (CREATE INDEX & B-Tree)',
        briefingVi: 'Để ngăn chặn Full Table Scan khi truy lùng biển số xe vi phạm, hãy tạo một chỉ mục B-Tree có tên `idx_radar_plate` trên cột `plate_number` của bảng `traffic_radar_logs`.',
        briefingEn: 'To eliminate table scans when tracking violator plates, create a dedicated B-Tree index named `idx_radar_plate` on column `plate_number` of `traffic_radar_logs`.',
        theoryVi: `### Cú pháp tạo chỉ mục (\`CREATE INDEX\`)
Chỉ mục (Index) giống như mục lục cuốn sách: lưu trữ giá trị cột kèm con trỏ dòng dưới dạng cây B-Tree tự cân bằng:
\`\`\`sql
CREATE INDEX idx_name ON table_name (column1);
\`\`\`
* **Chỉ mục kết hợp (Composite Index):** \`CREATE INDEX idx_composite ON table_name (col1, col2);\`. Thứ tự các cột tuân theo quy tắc **Leftmost Prefix**.
* **Đánh đổi:** Index giúp tăng tốc độ đọc (\`SELECT\`) gấp hàng trăm lần, nhưng sẽ làm chậm nhẹ thao tác ghi (\`INSERT\`, \`UPDATE\`, \`DELETE\`) và tốn dung lượng ổ đĩa.`,
        theoryEn: `### Creating Indexes (\`CREATE INDEX\`)
An index functions like a book index, organizing column values in a balanced B-Tree structure:
\`\`\`sql
CREATE INDEX idx_name ON table_name (column1);
\`\`\`
* **Composite Index:** \`CREATE INDEX idx_composite ON table_name (col1, col2);\`. Matches predicates following the **Leftmost Prefix rule**.
* **Trade-off:** Indexes accelerate read queries (\`SELECT\`) by orders of magnitude, but add slight overhead to write operations (\`INSERT\`,
        detectiveAnalogy: {
          actionVi: 'Dán nhãn thẻ màu cho hồ sơ lưu trữ',
          actionEn: 'Affix colored index tabs on massive dossier archives',
          storyVi: 'Một nhà kho có 100.000 hồ sơ tội phạm. Nếu không có mục lục, mỗi lần tìm phải lật từ đầu đến cuối. CREATE INDEX giống như việc tạo mục lục theo Số Căn Cước hoặc Họ Tên, giúp rút hồ sơ trong 1 giây.',
          storyEn: 'An archive with 100,000 dossiers without an index requires linear searching every time. CREATE INDEX builds an alphabetized card catalog, retrieving suspects in a millisecond.',
          syntaxTakeawayVi: 'CREATE INDEX idx_name ON table(column)',
          syntaxTakeawayEn: 'CREATE INDEX idx_name ON table(column)',
        }, \`UPDATE\`, \`DELETE\`) and disk space.`,
        interactiveExample: {
          query: 'CREATE INDEX idx_radar_plate ON traffic_radar_logs (plate_number);',
          captionVi: 'Tạo chỉ mục tìm kiếm nhanh cho biển số',
          captionEn: 'Create fast lookup index on plate_number',
        },
        objectiveVi: 'Tạo chỉ mục `idx_radar_plate` trên cột `plate_number` của bảng `traffic_radar_logs`.',
        objectiveEn: 'Create index `idx_radar_plate` on column `plate_number` of table `traffic_radar_logs`.',
        starterQuery: 'CREATE INDEX \n',
        expectedSolutionQuery: 'CREATE INDEX idx_radar_plate ON traffic_radar_logs (plate_number);',
        schemaSql: `CREATE TABLE traffic_radar_logs (
  id INTEGER PRIMARY KEY,
  plate_number TEXT NOT NULL,
  speed_kmh INTEGER NOT NULL,
  camera_id TEXT NOT NULL,
  captured_at TEXT NOT NULL
);`,
        seedSql: generateRadarLogs5k(),
        tables: [
          {
            name: 'traffic_radar_logs',
            columns: [
              { name: 'plate_number', type: 'TEXT' },
              { name: 'speed_kmh', type: 'INTEGER' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Cú pháp CREATE INDEX',
            titleEn: 'Hint 1: CREATE INDEX syntax',
            textVi: 'CREATE INDEX idx_radar_plate ON traffic_radar_logs (...)',
            textEn: 'CREATE INDEX idx_radar_plate ON traffic_radar_logs (...)',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Chỉ định cột',
            titleEn: 'Hint 2: Specify column',
            textVi: '(plate_number)',
            textEn: '(plate_number)',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'CREATE INDEX idx_radar_plate ON traffic_radar_logs (plate_number);',
            textEn: 'CREATE INDEX idx_radar_plate ON traffic_radar_logs (plate_number);',
          },
        ],
        requiredKeywords: ['CREATE', 'INDEX', 'ON'],
        xpReward: 25,
        isOptimizationLesson: true,
      },
      {
        id: 'lesson-7-3',
        moduleId: 'module-7',
        orderIndex: 3,
        titleVi: '7.3 Cú Pháp Sargable: Tránh Làm Vô Hiệu Hóa Index',
        titleEn: '7.3 Sargable Predicates: Keeping Indexes Active',
        briefingVi: 'Một điều tra viên viết: `WHERE speed_kmh + 10 > 100`. Phép toán này khiến database không thể dùng chỉ mục trên `speed_kmh`! Hãy viết lại thành câu lệnh Sargable: `WHERE speed_kmh > 90`.',
        briefingEn: 'An investigator wrote: `WHERE speed_kmh + 10 > 100`. Arithmetic on indexed columns blinds the optimizer! Refactor into a Sargable predicate: `WHERE speed_kmh > 90`.',
        theoryVi: `### Thuật ngữ Sargable (Search-Argument-Able)
Một điều kiện tìm kiếm được coi là **Sargable** khi bộ tối ưu hóa có thể tận dụng cấu trúc cây B-Tree của Index:
* ❌ **Không Sargable:**
  * \`WHERE UPPER(plate) = '29A'\` (bọc hàm quanh cột indexed).
  * \`WHERE speed + 10 > 100\` (phép toán số học trên cột).
  * \`WHERE plate LIKE '%888'\` (dấu % ở đầu chuỗi làm hỏng B-Tree prefix).
* ✅ **Sargable:**
  * \`WHERE plate = '29A'\`.
  * \`WHERE speed > 90\`.
  * \`WHERE plate LIKE '29A%'\` (khớp tiền tố cho phép duyệt range scan).`,
        theoryEn: `### Sargable Predicates Explained
A predicate is **Sargable** (Search-Argument-Able) if the query optimizer can exploit index lookups:
* ❌ **Non-Sargable:**
  * \`WHERE UPPER(plate) = '29A'\` (wrapping functions around indexed columns).
  * \`WHERE speed + 10 > 100\` (arithmetic on the indexed column).
  * \`WHERE plate LIKE '%888'\` (leading wildcards invalidate B-Tree traversal).
* ✅ **Sargable:**
  * \`WHERE plate = '29A'\`.
  * \`WHERE speed > 90\`.
  * \`WHERE plate LIKE '29A%'\` (prefix matching permits efficient range scans).`,
        detectiveAnalogy: {
          actionVi: 'Tra cứu theo cặp đặc điểm nhận dạng chuẩn xác (SARGable)',
          actionEn: 'Search by exact identifier pairs without blurring indexes',
          storyVi: 'Khi mục lục được đánh dấu theo Họ + Tên (Composite Index), thám tử phải tra cứu đúng quy tắc từ trái qua phải. Nếu dùng hàm che mờ như UPPER(ten) trong WHERE, thẻ màu mục lục sẽ bị vô hiệu hóa, buộc SQLite phải lật lại toàn bộ kho.',
          storyEn: 'Composite indexes order records by (Last, First). Writing WHERE UPPER(name) blinds the index catalog, forcing a painful full-table scan. SARGable queries preserve index speed.',
          syntaxTakeawayVi: 'Viết điều kiện WHERE giữ nguyên cột để dùng Index',
          syntaxTakeawayEn: 'Write SARGable WHERE conditions to utilize Index',
        },
        interactiveExample: {
          query: 'SELECT plate_number, speed_kmh FROM traffic_radar_logs WHERE speed_kmh > 90;',
          captionVi: 'Truy vấn Sargable chuẩn xác sử dụng index',
          captionEn: 'Sargable query utilizing speed index',
        },
        objectiveVi: 'Lấy `plate_number`, `speed_kmh` từ `traffic_radar_logs` với điều kiện Sargable: `WHERE speed_kmh > 90` (thay vì viết phép toán `speed_kmh + 10 > 100`).',
        objectiveEn: 'Select `plate_number`, `speed_kmh` from `traffic_radar_logs` with the Sargable predicate: `WHERE speed_kmh > 90`.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: 'SELECT plate_number, speed_kmh FROM traffic_radar_logs WHERE speed_kmh > 90;',
        schemaSql: `CREATE TABLE traffic_radar_logs (
  id INTEGER PRIMARY KEY,
  plate_number TEXT NOT NULL,
  speed_kmh INTEGER NOT NULL,
  camera_id TEXT NOT NULL,
  captured_at TEXT NOT NULL
);
CREATE INDEX idx_radar_speed ON traffic_radar_logs (speed_kmh);`,
        seedSql: generateRadarLogs5k(),
        tables: [
          {
            name: 'traffic_radar_logs',
            columns: [
              { name: 'plate_number', type: 'TEXT' },
              { name: 'speed_kmh', type: 'INTEGER' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Chuyển vế số học',
            titleEn: 'Hint 1: Isolate column algebraically',
            textVi: 'speed_kmh + 10 > 100 tương đương với speed_kmh > 90',
            textEn: 'speed_kmh + 10 > 100 is algebraically equivalent to speed_kmh > 90',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Mệnh đề WHERE',
            titleEn: 'Hint 2: WHERE clause',
            textVi: 'WHERE speed_kmh > 90',
            textEn: 'WHERE speed_kmh > 90',
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: 'SELECT plate_number, speed_kmh FROM traffic_radar_logs WHERE speed_kmh > 90;',
            textEn: 'SELECT plate_number, speed_kmh FROM traffic_radar_logs WHERE speed_kmh > 90;',
          },
        ],
        requiredKeywords: ['speed_kmh > 90'],
        forbiddenKeywords: ['+ 10'],
        xpReward: 25,
        isOptimizationLesson: true,
      },
      {
        id: 'lesson-7-4',
        moduleId: 'module-7',
        orderIndex: 4,
        titleVi: '7.4 Chỉ Mục Bao Phủ & Triệt Tiêu SELECT * (Covering Index)',
        titleEn: '7.4 Covering Indexes & Eradicating SELECT *',
        briefingVi: 'Khi chỉ mục chứa toàn bộ các cột mà câu truy vấn cần lấy, database không cần tốn công quay lại đọc bảng chính (Index-Only Scan). Hãy lấy đúng 2 cột có trong chỉ mục: `plate_number` và `speed_kmh`.',
        briefingEn: 'When an index contains every column requested by a query, the engine fulfills the request purely from index leaf pages (Covering Index / Index-Only Scan). Retrieve only `plate_number` and `speed_kmh`.',
        theoryVi: `### Chỉ mục bao phủ (Covering Index)
* Khi bạn viết \`SELECT *\`, database buộc phải tìm index rồi trích xuất con trỏ về trang dữ liệu bảng (Table Heap Lookup) để lấy các cột còn lại.
* Nếu câu truy vấn chỉ \`SELECT col1, col2\` và có một Composite Index \`ON (col1, col2)\`, bộ nhớ sẽ trả về kết quả ngay lập tức mà **không cần đụng tới bảng chính**.
* Giảm thiểu đáng kể Disk I/O và nghẽn băng thông bộ nhớ.`,
        theoryEn: `### Covering Indexes
* When issuing \`SELECT *\`,
        detectiveAnalogy: {
          actionVi: 'Nâng cấp chiến thuật điều tra tốc độ cao',
          actionEn: 'Upgrade tactical query maneuvers for maximum speed',
          storyVi: 'Tối ưu hóa là đỉnh cao của thám tử lão luyện: thay vì dùng câu lệnh cồng kềnh chậm chạp, thám tử viết lại truy vấn tinh gọn, lọc bớt dữ liệu sớm nhất có thể và loại bỏ các bước tính toán dư thừa.',
          storyEn: 'Optimization is master sleuth craft: pruning bloated subqueries, filtering early, and eliminating redundant table scans for blazing execution times.',
          syntaxTakeawayVi: 'Lọc sớm -> Dùng Index -> Không quét thừa',
          syntaxTakeawayEn: 'Filter early -> Leverage Index -> Zero waste',
        }, the engine must jump from index leaf nodes back to table heap pages to read unindexed columns.
* If a query requests only \`col1, col2\` and a composite index covers \`(col1, col2)\`, the engine fulfills the entire query directly from index cache.
* Dramatically reduces disk I/O and cache contention.`,
        interactiveExample: {
          query: "SELECT plate_number, speed_kmh FROM traffic_radar_logs WHERE plate_number = '29A-88888';",
          captionVi: 'Chỉ truy xuất cột cần thiết được bao phủ bởi Index',
          captionEn: 'Retrieve strictly indexed columns',
        },
        objectiveVi: 'Lấy đúng 2 cột `plate_number`, `speed_kmh` từ `traffic_radar_logs` có `plate_number = \'29A-88888\'` để tận dụng Covering Index.',
        objectiveEn: 'Select only `plate_number`, `speed_kmh` from `traffic_radar_logs` where `plate_number = \'29A-88888\'` to achieve an Index-Only Scan.',
        starterQuery: 'SELECT \n',
        expectedSolutionQuery: "SELECT plate_number, speed_kmh FROM traffic_radar_logs WHERE plate_number = '29A-88888';",
        schemaSql: `CREATE TABLE traffic_radar_logs (
  id INTEGER PRIMARY KEY,
  plate_number TEXT NOT NULL,
  speed_kmh INTEGER NOT NULL,
  camera_id TEXT NOT NULL,
  captured_at TEXT NOT NULL
);
CREATE INDEX idx_radar_covering ON traffic_radar_logs (plate_number, speed_kmh);`,
        seedSql: generateRadarLogs5k(),
        tables: [
          {
            name: 'traffic_radar_logs',
            columns: [
              { name: 'plate_number', type: 'TEXT' },
              { name: 'speed_kmh', type: 'INTEGER' },
            ],
          },
        ],
        hints: [
          {
            level: 1,
            titleVi: 'Gợi ý 1: Không dùng SELECT *',
            titleEn: 'Hint 1: Avoid SELECT *',
            textVi: 'Chỉ chọn plate_number, speed_kmh',
            textEn: 'Only select plate_number, speed_kmh',
          },
          {
            level: 2,
            titleVi: 'Gợi ý 2: Mệnh đề WHERE',
            titleEn: 'Hint 2: WHERE clause',
            textVi: "WHERE plate_number = '29A-88888'",
            textEn: "WHERE plate_number = '29A-88888'",
          },
          {
            level: 3,
            titleVi: 'Gợi ý 3: Lời giải hoàn chỉnh',
            titleEn: 'Hint 3: Full Solution',
            textVi: "SELECT plate_number, speed_kmh FROM traffic_radar_logs WHERE plate_number = '29A-88888';",
            textEn: "SELECT plate_number, speed_kmh FROM traffic_radar_logs WHERE plate_number = '29A-88888';",
          },
        ],
        requiredKeywords: ['plate_number', 'speed_kmh'],
        forbiddenKeywords: ['*'],
        xpReward: 30,
        isOptimizationLesson: true,
      },
    ],
  },
];
