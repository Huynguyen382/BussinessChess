# TÀI LIỆU THIẾT KẾ & ĐẶC TẢ KỸ THUẬT: GAME CỜ TỶ PHÚ 3D (WEB & MOBILE)

> **Tên dự án:** Business Chess 3D (Cờ Tỷ Phú Online)  
> **Nền tảng:** Web (Tương thích hoàn hảo Desktop & Mobile Responsive)  
> **Công nghệ chủ đạo:** Three.js (3D Graphics) + Node.js (Game Server & Realtime) + PostgreSQL (Database)

---

## 1. TỔNG QUAN HỆ THỐNG & MỤC TIÊU (OVERVIEW)

Hệ thống là một trò chơi cờ tỷ phú trực tuyến thời gian thực (Real-time Multiplayer 3D Monopoly) chạy trực tiếp trên trình duyệt, không cần cài đặt ứng dụng native. Trò chơi hỗ trợ đa nền tảng với giao diện tự thích ứng (Responsive UI/UX) tối ưu cho màn hình cảm ứng di động và chuột/phím trên máy tính.

### Mục tiêu kỹ thuật cốt lõi:
- **Client 3D:** Three.js tối ưu hiệu năng (60 FPS trên mobile tầm trung), đổ bóng nhẹ (shadow mapping), hiệu ứng xúc xắc vật lý (Cannon-es / Rapier3D).
- **Client UI:** HTML5/CSS3/Tailwind overlay canvas 3D, responsive 100% tỷ lệ khung hình (Portrait & Landscape).
- **Backend:** Node.js (TypeScript) + Socket.io xử lý Authoritative Server State Machine (mọi logic di chuyển, trừ tiền, mua đất đều do server quyết định để chống hack).
- **Database:** PostgreSQL lưu trữ người dùng, lịch sử ván đấu, phòng chơi, bảng xếp hạng, tài sản/vật phẩm.

---

## 2. KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

```
[ Client Browser (Desktop / Mobile) ]
  ├── 3D Viewport: Three.js + Cannon-es (Physics) + GLTF Loader
  ├── UI Layer: Vue 3 / React / Svelte / Vanilla + Tailwind CSS
  └── Network Layer: Socket.io Client + Fetch API
          │                     │
      (HTTP / REST)      (WebSockets WSS)
          │                     │
          ▼                     ▼
[ API Gateway & Auth ]     [ Game Server (Node.js + Socket.io) ]
          │                 ├── Room Manager (Lobby, Matchmaking, Invite)
          │                 ├── Monopoly State Machine (Turns, Tiles, Dice)
          │                 └── Tick Engine / Turn Timers
          │                     │
          └───────────┬─────────┘
                      ▼
           [ Redis (Optional Cache/PubSub) ]
                      ▼
           [ PostgreSQL Database ]
            (Users, Matches, Rooms, Assets)
```

---

## 3. THIẾT KẾ ĐA NỀN TẢNG & RESPONSIVE (MOBILE & DESKTOP)

### 3.1. Cơ chế Camera Three.js thích ứng
- **Màn hình ngang (Desktop / Landscape):**
  - Góc nhìn Isometric toàn cảnh (PerspectiveCamera, FOV 45°, nhìn chéo 45 độ bao quát toàn bộ 40 ô bàn cờ).
  - Tự động zoom-in cận cảnh token khi lắc xí ngầu và di chuyển.
- **Màn hình dọc (Mobile Portrait):**
  - Camera đổi sang góc nhìn dốc hơn (Top-down Isometric, FOV 60°), tiêu cự bám sát (Follow Camera) theo Token của người chơi hiện tại để đảm bảo các ô cờ hiển thị to, rõ nét, dễ đọc text.
  - Hỗ trợ thao tác cảm ứng:
    - **Pinch-to-zoom:** Phóng to / thu nhỏ bàn cờ.
    - **One-finger drag:** Xoay tự do góc camera để kiểm tra các góc bàn cờ.
    - **Nút "Reset Camera":** Trả về góc nhìn tập trung vào lượt chơi hiện tại.

### 3.2. Bố cục UI Overlay (HUD Responsive)
- **Desktop UI:**
  - Bảng thông tin người chơi (Avatar, Tiền mặt, Bất động sản) dàn đều 4 góc màn hình.
  - Bảng điều khiển hành động (Đổ xúc xắc, Xây nhà, Mua đất, Kết thúc lượt) nằm chính giữa phía dưới.
  - Khung Chat & Lịch sử ván đấu (Log) nằm cố định ở góc phải màn hình.
- **Mobile UI:**
  - **Top Bar:** Hiển thị rút gọn thông tin 4 người chơi (Avatar mini, thanh máu/tiền, icon lượt đi).
  - **Bottom Action Drawer (Sheet):** Nút hành động lớn (Đổ xúc xắc, Mua đất) vừa tầm với ngón tay cái (Thumb-zone).
  - **Modal / Popup:** Hiển thị thẻ Cơ hội / Khí vận, bảng xác nhận giao dịch dạng Bottom Sheet trượt lên từ cạnh dưới.
  - **Chat/Log:** Dạng nút icon nổi (Floating Action Button), bấm để mở modal chat toàn màn hình hoặc nửa màn hình.

---

## 4. LUẬT CHƠI & BẢN ĐỒ BÀN CỜ (GAME LOGIC)

Bàn cờ chuẩn 40 ô (Standard Board):
1. **Ô Xuất phát (GO):** Nhận 200M khi đi qua hoặc dừng lại.
2. **28 Ô Đất / Doanh nghiệp:** 
   - 22 ô đất chia làm 8 nhóm màu (Mỗi nhóm 2 - 3 ô). Có thể nâng cấp: Đất trống -> Nhà cấp 1 -> Nhà cấp 2 -> Nhà cấp 3 -> Khách sạn / Landmark.
   - 4 ô Bến xe / Sân bay / Ga tàu.
   - 2 ô Công ty tiện ích (Điện lực & Cấp nước).
3. **Ô Cơ hội (Chance) & Ô Khí vận (Community Chest):** 6 ô mở thẻ bài may rủi (Nhận thưởng, phạt tiền, dịch chuyển tức thời, sửa nhà...).
4. **Ô Nhà tù (Jail):** Vào tù khi vào ô "Vào tù" hoặc đổ xúc xắc đôi 3 lần liên tiếp. Ra tù bằng: Đổ đôi, trả tiền bảo lãnh (50M), hoặc dùng Thẻ ra tù.
5. **Ô Bãi đỗ xe miễn phí (Free Parking):** Nơi nghỉ ngơi an toàn hoặc tích luỹ thuế thưởng.
6. **Ô Thuế (Tax):** Thuế thu nhập & Thuế xa xỉ.
7. **Điều kiện thắng cuộc:**
   - Người chơi hết tiền và không còn tài sản để thế chấp/bán sẽ bị Phá sản (Bankrupt).
   - Ván đấu kết thúc khi chỉ còn 1 người sống sót, hoặc hết thời gian tối đa (tính tổng tài sản để xếp hạng).

---

## 5. TÍNH NĂNG TẠO PHÒNG & MỜI BẠN BÈ (LOBBY & SOCIAL)

### 5.1. Tạo phòng (Create Room)
- **Tuỳ chọn cấu hình phòng:**
  - Chế độ phòng: Công khai (Public) hoặc Riêng tư (Private - có mật khẩu hoặc chỉ vào qua link/mã).
  - Số lượng người chơi: 2 đến 4 người.
  - Thời gian mỗi lượt: 15s / 30s / 45s.
  - Số vốn khởi đầu: 1.000M / 1.500M / 2.000M.
  - Chế độ: Đấu đơn (Free for all) hoặc Đấu cặp (2 vs 2).

### 5.2. Mời bạn bè (Invite System)
- **Mã phòng (Room Code):** Tạo chuỗi ký tự ngẫu nhiên gồm 6 chữ cái/số (Ví dụ: `TYPHU8`). Người chơi nhập mã để vào phòng.
- **Đường dẫn chia sẻ (Deep Link / Share URL):**
  - Định dạng: `https://game.domain.com/join?room=TYPHU8`
  - Tích hợp Web Share API: Nhấn nút "Mời bạn" trên mobile sẽ mở menu chia sẻ Zalo, Messenger, Telegram, Copy Link tự động.
  - Quét mã QR: Tạo mã QR code trực tiếp trên màn hình để bạn bè dùng điện thoại quét và tham gia ngay lập tức.
- **Hệ thống Bạn bè & Thông báo (Friend System):**
  - Gửi lời mời trực tiếp đến người chơi đang online trong danh sách bạn bè.

### 5.3. Khán giả & Cơ chế mất kết nối (Spectator & Reconnect)
- **Khán giả (Spectator):** Cho phép người ngoài vào theo dõi trận đấu nếu phòng bật chế độ cho phép khán giả.
- **Tự động kết nối lại (Auto-reconnect):** Lưu `session_token` vào `localStorage`. Nếu người chơi bị rớt mạng hoặc reload trang, client tự gửi token tái kết nối và nhận lại State hiện tại của trận đấu.
- **Bot thế chỗ (AFK Bot):** Khi người chơi mất kết nối quá thời gian quy định (ví dụ 60 giây), bot tự động điều khiển đổ xúc xắc để tránh làm nghẽn ván đấu.

---

## 6. THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL

```sql
-- 1. Bảng Người dùng
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    gold_balance BIGINT DEFAULT 10000,
    total_matches INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng Bạn bè
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'BLOCKED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- 3. Bảng Phòng chơi
CREATE TABLE game_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(10) UNIQUE NOT NULL,
    host_id UUID REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    max_players INT DEFAULT 4,
    turn_timeout_seconds INT DEFAULT 30,
    initial_balance BIGINT DEFAULT 1500,
    is_private BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'WAITING', -- 'WAITING', 'PLAYING', 'FINISHED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE
);

-- 4. Bảng Lịch sử ván đấu & Thành viên tham gia
CREATE TABLE match_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    final_rank INT,
    net_worth BIGINT DEFAULT 0,
    is_bankrupt BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Bảng Lưu trữ Trạng thái ván cờ (Snapshot để Reconnect)
CREATE TABLE game_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID UNIQUE REFERENCES game_rooms(id) ON DELETE CASCADE,
    current_turn_user_id UUID REFERENCES users(id),
    turn_phase VARCHAR(30) NOT NULL, -- 'ROLL_DICE', 'BUY_TILE', 'UPGRADE', 'END_TURN'
    state_json JSONB NOT NULL,       -- Toàn bộ vị trí quân cờ, quyền sở hữu đất, khách sạn
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 7. GIAO THỨC MẠNG THỜI GIAN THỰC (SOCKET.IO EVENTS)

### 7.1. Nhóm sự kiện Phòng (Lobby Events)
| Tên Event | Chiều | Dữ liệu truyền tải (Payload) | Ý nghĩa |
| :--- | :--- | :--- | :--- |
| `room:create` | Client -> Server | `{ name, maxPlayers, isPrivate, initialCash, turnTimeout }` | Yêu cầu tạo phòng mới |
| `room:join` | Client -> Server | `{ roomCode, password }` | Tham gia phòng bằng mã |
| `room:invite` | Client -> Server | `{ targetUserId, roomCode }` | Gửi lời mời tới bạn bè |
| `room:player_joined` | Server -> Room | `{ player: { id, username, avatar, isHost, slot } }` | Thông báo thành viên mới vào |
| `room:start` | Client -> Server | `{ roomCode }` | Chủ phòng nhấn bắt đầu trận đấu |

### 7.2. Nhóm sự kiện Trận đấu (Gameplay Events)
| Tên Event | Chiều | Dữ liệu truyền tải (Payload) | Ý nghĩa |
| :--- | :--- | :--- | :--- |
| `game:start` | Server -> Room | `{ boardData, playersState, firstTurnUserId }` | Khởi tạo ván chơi 3D |
| `game:roll_dice` | Client -> Server | `{}` | Người chơi bấm nút Đổ xúc xắc |
| `game:dice_result` | Server -> Room | `{ dice1, dice2, isDouble, nextTileIndex }` | Kết quả xúc xắc & vị trí đích |
| `game:tile_action` | Server -> Client | `{ tileId, actionType: 'BUY'\|'PAY_RENT'\|'DRAW_CARD', cost }` | Thông báo hành động tại ô cờ |
| `game:buy_property` | Client -> Server | `{ tileId, level }` | Xác nhận mua ô đất / xây nhà |
| `game:property_updated` | Server -> Room | `{ tileId, ownerId, level, playerRemainingCash }` | Cập nhật ô đất trên bàn cờ 3D |
| `game:end_turn` | Client -> Server | `{}` | Chuyển lượt cho người kế tiếp |
| `game:turn_change` | Server -> Room | `{ nextUserId, timeRemaining }` | Bắt đầu lượt của người chơi mới |
| `game:bankrupt` | Server -> Room | `{ userId, bankruptReason }` | Người chơi phá sản |
| `game:over` | Server -> Room | `{ rankings: [{ rank, userId, netWorth }] }` | Kết thúc ván đấu |

---

## 8. CẤU TRÚC DỰ ÁN ĐỀ XUẤT (PROJECT STRUCTURE)

```
BussinessChess/
├── client/                     # Frontend Application
│   ├── public/
│   │   ├── models/             # 3D GLTF/GLB models (Dice, Tokens, Houses, Board)
│   │   ├── textures/           # Materials, normal maps, environment maps
│   │   └── sounds/             # Sound effects (Roll dice, buy land, bankrupt, click)
│   ├── src/
│   │   ├── components/         # UI Components (Lobby, RoomModal, HUD, BottomSheet)
│   │   ├── three/              # Three.js 3D Core
│   │   │   ├── BoardScene.ts   # Scene, Lighting, Environment
│   │   │   ├── CameraManager.ts# Responsive camera (Desktop Isometric vs Mobile Follow)
│   │   │   ├── TokenManager.ts # Animation quân cờ di chuyển
│   │   │   ├── DicePhysics.ts  # Mô phỏng ném xí ngầu 3D bằng Cannon.js
│   │   │   └── BuildingMesh.ts # Render nhà và khách sạn trên ô cờ
│   │   ├── network/            # Socket.io Client & API Service
│   │   └── store/              # State Management (Pinia/Redux/Zustand)
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Backend Application
│   ├── src/
│   │   ├── config/             # DB & Environment Config
│   │   ├── controllers/        # REST Controllers (Auth, User, Friend)
│   │   ├── database/           # PostgreSQL Migrations & Models (Prisma / Drizzle)
│   │   ├── game/               # Game Logic Engine
│   │   │   ├── MonopolyEngine.ts   # State Machine quy tắc bàn cờ
│   │   │   ├── BoardConfig.ts      # Danh sách 40 ô và giá tiền
│   │   │   ├── Cards.ts            # Thẻ Cơ hội & Khí vận
│   │   │   └── BotAI.ts            # Logic AI thế chỗ khi disconnect
│   │   ├── socket/             # Socket.io Handlers
│   │   │   ├── RoomHandler.ts      # Tạo phòng, ghép đội, mời bạn
│   │   │   └── GameHandler.ts      # Lắc xí ngầu, mua đất, trả tiền
│   │   └── index.ts            # Server Entry Point
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## 9. CHI TIẾT TÍNH NĂNG ĐỒ HOẠ THREE.JS & HIỆU NĂNG

1. **Bàn cờ 3D (3D Board Mesh):**
   - Sử dụng Single Mesh / InstancedMesh cho các ô cờ giống nhau để giảm số lượng Draw Calls.
   - Text và biểu tượng ô cờ được nén thành một Atlas Texture duy nhất (Kích thước 2048x2048).
2. **Quân cờ & Di chuyển (Token Animations):**
   - Hoạt ảnh di chuyển từng ô theo đường cong Parabol (Nhảy từng bước hoặc trượt mượt mà bằng Tween.js / GSAP).
3. **Mô phỏng Xúc xắc Vật lý 3D (3D Physics Dice):**
   - Server sinh kết quả xúc xắc ngẫu nhiên trước (Deterministic Outcome).
   - Client ném xúc xắc 3D với lực và góc quay tương ứng sao cho mặt xúc xắc dừng lại trùng khớp với kết quả từ Server.
4. **Tối ưu Mobile:**
   - Hạn chế đổ bóng thời gian thực (Real-time dynamic shadows) trên thiết bị di động yếu; dùng Contact Shadow mềm hoặc Baked Lightmap.
   - Giới hạn Pixel Ratio ở mức `Math.min(window.devicePixelRatio, 2)` để tránh làm nóng máy và tốn pin trên màn hình Retina/OLED.

---

## 10. KẾ HOẠCH TRIỂN KHAI THEO GIAI ĐOẠN (ROADMAP)

- **Giai đoạn 1 (Tuần 1-2):** Xây dựng Game Engine & Database Schema
  - Cài đặt PostgreSQL, tạo cấu trúc bảng với Prisma ORM.
  - Viết Game State Machine trên Node.js (Turn management, Move logic, Rent calculation).
- **Giai đoạn 2 (Tuần 3-4):** Xây dựng Bàn cờ 3D Three.js & Responsive Viewport
  - Dựng bàn cờ 3D, quân cờ mẫu, camera responsive cho cả Desktop và Mobile.
  - Tích hợp Socket.io để đồng bộ di chuyển Token giữa các màn hình.
- **Giai đoạn 3 (Tuần 5):** Hệ thống Phòng chơi, Mời bạn bè & Xí ngầu 3D
  - Tạo phòng, Room Code, chia sẻ link qua Web Share API / QR Code.
  - Tích hợp Cannon.js cho hoạt ảnh ném xúc xắc.
- **Giai đoạn 4 (Tuần 6):** Hoàn thiện Giao diện Mobile, Âm thanh & Tối ưu hoá
  - Bottom Drawer UI cho điện thoại, hiệu ứng rung (Haptic feedback khi ném xí ngầu).
  - Stress test Socket.io và kiểm tra tự động kết nối lại khi mất mạng (Auto Reconnect).
