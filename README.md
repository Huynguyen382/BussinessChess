# BUSINESS CHESS 3D (CỜ TỶ PHÚ ONLINE)

Dự án trò chơi Cờ Tỷ Phú trực tuyến 3D đa nền tảng (Web & Mobile Responsive) được hiện thực hóa hoàn chỉnh theo chuẩn **GAME_DESIGN_DOCUMENT.md** và **GRAPHICS_ART_GUIDE.md**.

---

## 🌟 TÍNH NĂNG NỔI BẬT ĐÃ TRIỂN KHAI

### 1. Kiến trúc Three.js 3D & Tech Art
- **Phong cách Stylized Toy Diorama:** Sa bàn đồ chơi cách điệu, màu sắc tươi sáng, khối bo góc mềm mại.
- **Bàn cờ 40 ô chuẩn:** Tích hợp đầy đủ ô GO (+200M), 22 ô đất (8 nhóm màu nhận diện), 4 ga tàu/bến xe, 2 công ty tiện ích, 6 ô Cơ hội / Khí vận, Nhà tù, Bãi đỗ xe và Ô Thuế.
- **Tiểu cảnh công viên trung tâm (Center Diorama):** Hồ phun nước có sóng lăn tăn, hàng cây tròn cách điệu và tượng Tượng Vua Tỷ Phú vàng đứng giữa bàn cờ.
- **4 Linh vật quân cờ 3D độc bản:**
  - 🚗 *Xe cổ điển candy red*
  - 🎩 *Mũ phớt hoàng kim*
  - 🐕 *Chú cún may mắn (Pug)*
  - 🚀 *Tên lửa không gian mini*
- **Hệ thống Nhà & Landmark 5 sao:** Cấp 1, Cấp 2, Cấp 3 và Khách sạn pha lê phát sáng (Emissive Glow) kèm hiệu ứng nảy đàn hồi (Elastic bounce pop-in).
- **Xúc xắc vật lý 3D:** Hiệu ứng ném và nhào lộn 3D chuẩn xác theo kết quả xác định từ Server (Deterministic Outcome).
- **Hệ thống Camera Responsive thông minh:**
  - *Desktop/Ngang:* Góc nhìn toàn cảnh Isometric 45° bao quát cả bàn cờ.
  - *Mobile/Dọc:* Chế độ bám sát (Follow Mode) bám theo quân cờ người chơi, hỗ trợ vuốt xoay tự do và phóng to / thu nhỏ (Pinch-to-zoom).

### 2. Backend & Game Engine Thời Gian Thực (Authoritative Server)
- **Node.js + TypeScript + Socket.io:** Toàn bộ logic bàn cờ, đổ xúc xắc, mua bán, thu phí, phá sản đều được quyết định trên Server để chống hack tuyệt đối.
- **Hệ thống Phòng & Mời bạn bè:** Tạo phòng công khai/riêng tư, tạo mã phòng 6 ký tự (`TYPHU8`), sao chép liên kết chia sẻ, hỗ trợ 2 - 4 người chơi.
- **Bot AI thông minh thế chỗ (AFK Bot):** Khi người chơi rời mạng hoặc phòng thiếu người, Bot AI tự động đưa ra quyết định đổ xí ngầu và đầu tư bất động sản hợp lý.
- **Bộ đếm thời gian lượt (Turn Timer Tick Engine):** Tự động cảnh báo và chuyển lượt khi người chơi hết thời gian quy định.
- **Âm thanh tổng hợp Web Audio API (Sound FX):** Tiếng xúc xắc lọc cọc, tiếng tiền vàng leng keng, âm thanh xây nhà, chuông báo lượt và tiếng phá sản mà không cần phụ thuộc vào file ngoài.
- **Pháo hoa chiến thắng (Confetti VFX):** Vinh danh bảng xếp hạng tài sản người chơi khi kết thúc ván đấu.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY DỰ ÁN

### Yêu cầu môi trường:
- Node.js >= 18.x (Đã kiểm thử trên Node v22.18.0)
- npm >= 9.x

### Cài đặt và chạy đồng thời cả Server và Client:
```bash
# 1. Cài đặt toàn bộ dependencies (Root, Server, Client)
npm run install:all

# 2. Khởi chạy Server (Port 4000) và Client (Port 3000) cùng lúc
npm run dev
```

### Hoặc chạy từng phần riêng biệt:
```bash
# Chạy Game Server
cd server
npm run dev

# Chạy Web Client
cd client
npm run dev
```

Truy cập trên trình duyệt: **`http://localhost:3000`** (Hỗ trợ tốt trên cả màn hình di động qua DevTools Device Mode).

---

## 📁 CẤU TRÚC DỰ ÁN

```
BussinessChess/
├── client/                     # Ứng dụng Frontend 3D & UI
│   ├── src/
│   │   ├── components/         # Web Audio Synth, Modals, UI HUD
│   │   ├── network/            # SocketClient (Socket.io Client)
│   │   ├── three/              # Three.js Core
│   │   │   ├── BoardScene.ts   # Bàn cờ 40 ô, tiểu cảnh trung tâm & ánh sáng
│   │   │   ├── CameraManager.ts# Camera thích ứng Desktop / Mobile & Touch
│   │   │   ├── TokenManager.ts # Tạo hình 4 quân cờ & hoạt ảnh di chuyển
│   │   │   ├── DicePhysics.ts  # Mô phỏng nhào lộn xúc xắc 3D
│   │   │   └── BuildingMesh.ts # Render nhà cấp 1-3 & Landmark phát sáng
│   │   ├── main.ts             # Bộ điều phối trạng thái ứng dụng
│   │   └── style.css           # Giao diện Chunky Flat & Soft Neumorphism
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Máy chủ Game Server Node.js (TypeScript)
│   ├── src/
│   │   ├── database/           # PostgreSQL Schema (schema.sql)
│   │   ├── game/
│   │   │   ├── BoardConfig.ts  # Cấu hình 40 ô cờ, bảng giá và nhóm màu
│   │   │   ├── Cards.ts        # Bộ thẻ Cơ hội & Khí vận
│   │   │   ├── MonopolyEngine.ts# State Machine luật cờ và giao dịch
│   │   │   └── BotAI.ts        # Trí tuệ nhân tạo điều khiển thế chỗ
│   │   ├── socket/
│   │   │   └── RoomManager.ts  # Quản lý sảnh, tạo phòng, mã code, timer
│   │   └── index.ts            # REST API & Socket.io Entry Point
│   ├── package.json
│   └── tsconfig.json
│
├── GAME_DESIGN_DOCUMENT.md     # Tài liệu thiết kế hệ thống và luật cờ
├── GRAPHICS_ART_GUIDE.md       # Tài liệu định hướng nghệ thuật và Three.js
└── README.md
```
