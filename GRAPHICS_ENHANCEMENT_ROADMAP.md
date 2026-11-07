# KẾ HOẠCH & MỤC TIÊU TĂNG CƯỜNG CHI TIẾT ĐỒ HỌA: BUSINESS CHESS 3D
## (Graphics Enhancement Roadmap & Art Fidelity Goals)

> **Tên dự án:** Business Chess 3D (Cờ Tỷ Phú Online)  
> **Mục tiêu tài liệu:** Thiết lập lộ trình nâng cấp độ chi tiết đồ họa (Visual Fidelity), hiệu ứng hình ảnh (VFX), ánh sáng và vật liệu (Materials & Shaders) nhằm đạt chất lượng thẩm mỹ ngang tầm các sản phẩm thương mại hàng đầu (*Monopoly GO!*, *Mario Party Superstars*), đồng thời duy trì hiệu năng 60 FPS mượt mà trên Web & Mobile.

---

## 1. TỔNG QUAN & TẦM NHÌN NGHỆ THUẬT (ARTISTIC VISION)

### 1.1. Triết lý "Juicy Toy Diorama" (Sa bàn Đồ chơi Sống động)
- Bàn cờ không chỉ là một mặt phẳng hiển thị ô cờ, mà là một **tiểu vũ trụ thu nhỏ tinh xảo** đặt giữa không gian làm việc studio ấm cúng.
- Mọi tương tác vật lý (ném xí ngầu, nhảy cóc, xây nhà, nộp phạt) đều phải mang lại **cảm giác thỏa mãn giác quan (Juiciness)** thông qua:
  - Khối lượng vật lý (Weight & Impact).
  - Độ đàn hồi hoạt hình (Squash, Stretch & Elastic Bounce).
  - Phản hồi thị giác tức thì (Micro-shake, tia sáng, hạt bụi vàng).

### 1.2. Mục Tiêu Benchmark Cụ Thể
- **Độ hoàn thiện bề mặt:** Tạo cảm giác vật liệu đồ chơi cao cấp (Nhựa bóng vinyl tráng men, gỗ sồi mài mịn, kim loại mạ vàng chải xước, kính pha lê phản chiếu).
- **Cảm giác chiều sâu (Miniature Depth):** Ứng dụng kỹ thuật hiệu ứng thị sai (Parallax) và chiều sâu trường ảnh (Tilt-Shift Depth of Field) để người chơi cảm nhận rõ bàn cờ như một mô hình sa bàn thực tế trên bàn làm việc.

---

## 2. BẢNG CHỈ TIÊU KỸ THUẬT & NGÂN SÁCH HIỆU NĂNG (PERFORMANCE BUDGET)

Nhằm đảm bảo trải nghiệm không bị giật lag trên các thiết bị di động tầm trung:

| Tiêu chí | Trạng thái Hiện tại | Mục tiêu Tăng cường Chi tiết | Giải pháp Kỹ thuật |
| :--- | :--- | :--- | :--- |
| **FPS trên Mobile** | 60 FPS ổn định | $\ge 60$ FPS liên tục (iPhone 11+, Android SD 720G+) | WebGL Draw call batching, LOD |
| **Tổng số Draw Calls** | $\sim 28 - 35$ calls | Khống chế nghiêm ngặt $< 40$ calls | `THREE.InstancedMesh` & Texture Atlasing |
| **Số lượng Đa giác (Tris)** | $\sim 12.000$ Tris | $\sim 25.000 - 32.000$ Tris | Tăng mật độ poly ở góc bo (Bevel) và chi tiết nhỏ |
| **Dung lượng Bundle 3D** | $\sim 570$ KB (gzipped 150 KB) | $< 2.5$ MB | Nén Draco GLB + Texture KTX2 / WebP |
| **Chất lượng Texture** | Canvas 2D Texture | PBR Stylized Atlas $1024\times 1024$ / $2048\times 2048$ | Normal maps + Roughness maps nướng sẵn |

---

## 3. MỤC TIÊU NÂNG CẤP CHI TIẾT THEO TỪNG THÀNH PHẦN 3D

```
┌────────────────────────────────────────────────────────┐
│             KHÔNG GIAN STUDIO ẤM CÚNG                  │
│   (Vân gỗ thật, Tách cà phê khói bay, Tiền xu 3D)     │
│  ┌──────────────────────────────────────────────────┐  │
│  │               SA BÀN BÀN CỜ 40 Ô                 │  │
│  │  - Vỉa hè lát đá 3D, Đèn đường tí hon phát sáng  │  │
│  │  - Công trình nhà ngói xếp lớp, Landmark pha lê   │  │
│  │  - Tiểu cảnh: Đài phun nước hạt bay, Cây đung đưa│  │
│  │  - Quân cờ: Bánh xe lăn, Mắt chớp, Co dãn nảy    │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 3.1. Chi tiết 40 Ô Bàn Cờ (Tiles Visual Upgrade)
- **Vỉa hè & Lối đi bộ 3D:** Thay thế mặt phẳng trơn bằng hoa văn gạch lát vỉa hè cách điệu (Stylized Cobblestone/Pavers) tạo cảm giác phân khu đô thị sang trọng.
- **Biển hiệu 3D nổi (3D Extruded Signs):** Tên các thành phố (Hà Nội, TP.HCM, Đà Lạt...) và biểu tượng được đổ khối 3D nổi nhẹ trên mặt ô cờ thay vì chỉ vẽ phẳng.
- **Cột đèn đường tí hon (Street Lamp Posts):** Đặt các cột đèn đường nhỏ ở các góc đường, phát ánh sáng vàng ấm (`#FFEAA7`) về đêm hoặc khi vào lượt chơi.
- **Hiệu ứng ô đất kích hoạt (Tile Pulse & Hover):** Khi quân cờ đáp xuống ô đất, ô cờ nâng nhẹ lên $0.1$ unit và phát viền ánh sáng viền màu khu vực (District Accent Glow).

### 3.2. Linh Vật Quân Cờ Độc Bản (Tokens High-Fidelity)
- **🚗 Xe cổ điển (Classic Car):**
  - Bánh xe quay tròn đồng bộ theo vận tốc di chuyển.
  - Vệt khói bụi tí hon (Exhaust Puff Particles) phụt ra từ ống bô khi xe tăng tốc.
  - Đèn pha xe chiếu 2 hình nón ánh sáng vàng mờ về phía trước.
- **🎩 Mũ phớt hoàng kim (Top Hat):**
  - Bề mặt mạ vàng kim sa chải xước với độ phản quang lấp lánh (Sparkle Glitter Shader).
  - Dải nơ nhung tím có nếp gấp vải chân thực.
- **🐕 Chú cún may mắn (Lucky Pug):**
  - Thêm hoạt ảnh biểu cảm: Chớp mắt ngẫu nhiên, hai tai vẫy nhẹ khi nhảy lò cò.
  - Chuông vàng trước ngực lắc lư khi di chuyển.
- **🚀 Tên lửa tí hon (Tiny Rocket):**
  - Đuôi tên lửa phát ra ngọn lửa cam rực rỡ và các hạt tàn lửa rơi lại phía sau.
  - Xoay vòng 360 độ ăn mừng khi đi qua ô Khởi Hành (GO).

### 3.3. Hệ Thống Kiến Trúc Nhà & Khách Sạn (Buildings Architecture)
- **Nhà cấp 1 (Cottage):** Mái ngói đỏ cam xếp lớp có viền trắng, ống khói bốc khói nhẹ dạng hạt bọt kem (Cartoon smoke puff).
- **Nhà cấp 2 (Villa):** Ban công tầng 2 có chậu hoa nhỏ rực rỡ, bậc thang dẫn lên cửa chính.
- **Nhà cấp 3 (Complex):** Sân thượng có hồ bơi tí hon hoặc khu vườn mini, vách kính phản quang bầu trời.
- **Landmark 5 sao (5-Star Luxury Tower):**
  - Khối tháp kính pha lê xanh ngọc với dải đèn LED neon chạy dọc thân tòa nhà.
  - Quả cầu vàng hoặc vương miện trên đỉnh tháp xoay chậm, phát ra chùm tia sáng quét nhẹ (Beacon light sweep).

### 3.4. Tiểu Cảnh Công Viên Trung Tâm (Center Diorama 2.0)
- **Đài phun nước sống động:** Bổ sung hệ thống hạt nước li ti (Water droplets) bắn lên từ tâm vòi phun và rơi xuống mặt hồ tạo vòng sóng lan tỏa.
- **Cây cối sinh động:** Tán cây tròn cách điệu đung đưa nhẹ nhàng theo gió (Vertex wind oscillation shader).
- **Hệ thống giao thông tí hon:** Thêm 1-2 chiếc ô tô đồ chơi tí hon chạy quanh vòng xoay công viên trung tâm để sa bàn luôn tràn đầy sức sống.

---

## 4. CHI TIẾT MÔI TRƯỜNG STUDIO & TABLETOP PROPS

Nâng tầm cảm xúc "ngồi trước bàn cờ thực tế" thông qua việc trau chuốt các đồ vật xung quanh:

1. **Bề mặt bàn làm việc (Oak Desk Surface):**
   - Nâng cấp vân gỗ sồi cao cấp với độ bóng phản xạ mờ (Subtle Roughness Map).
   - Thêm vệt ánh sáng mặt trời chiếu xéo qua khung cửa sổ (Window light shaft / Gobo effect).
2. **Tách cà phê bốc khói (Steaming Mug):**
   - Thêm làn khói nước mỏng manh uốn lượn bay lên từ miệng cốc.
3. **Đồng tiền vàng & Xấp tiền giấy:**
   - Các đồng xu vàng được dập nổi hoa văn đồng hồ cát hoặc biểu tượng Đô la (`$`).
   - Xấp tiền giấy polymer được buộc đai giấy gọn gàng đặt cạnh khay xúc xắc.
4. **Hạt bụi không gian (Dust Motes in Sunbeam):**
   - Hạt bụi vàng chuyển động Brown tự nhiên trong luồng nắng, tăng cảm giác chiều sâu điện ảnh.

---

## 5. HỆ THỐNG VẬT LIỆU, SHADERS & ÁNH SÁNG NÂNG CAO

### 5.1. Stylized Toy PBR Shader
- Áp dụng kỹ thuật **Rim Lighting (Ánh sáng ven viền):**
  - Mọi quân cờ và mô hình nhà đều có một đường viền sáng nhẹ bao quanh mép khối giúp vật thể nổi bật hoàn toàn khỏi phông nền.
- **Vật liệu Nhựa đồ chơi tráng men (Glossy Toy Plastic):**
  - Độ bóng cục bộ (Specular Highlight) sắc nét nhưng có độ mềm ở rìa khối.
  - Giữ độ no màu (Saturation) ổn định ở cả vùng tối, không để vật thể bị xỉn màu xám.

### 5.2. Post-Processing Nhẹ Cho Trình Duyệt (Selective Post-FX)
- **Tilt-Shift Depth of Field (DoF):** Làm mờ nhẹ vùng rìa màn hình (tiền cảnh và hậu cảnh xa) để mắt người chơi tập trung vào trung tâm bàn cờ, khuếch đại cảm giác sa bàn tí hon.
- **Selective Bloom:** Chỉ áp dụng hiệu ứng phát sáng lấp lánh (Bloom Glow) cho các nguồn sáng chủ động:
  - Quả cầu vàng trên đỉnh Landmark.
  - Các hạt sao vàng nổ ra khi nhận thưởng.
  - Vòng sóng ánh sáng khi mua đất.

---

## 6. HỆ THỐNG HIỆU ỨNG THỊ GIÁC (VFX ROADMAP)

| Hiệu ứng | Kịch bản kích hoạt | Mô tả chi tiết hình ảnh |
| :--- | :--- | :--- |
| **Gold Rain (Mưa tiền)** | Đi qua ô GO nhận 200M hoặc Thắng ván | Cơn mưa đồng xu vàng 3D rơi tung tóe xuống mặt bàn kèm tiếng leng keng vui nhộn. |
| **Landmark Rising** | Nâng cấp lên Khách sạn 5 sao | Tòa tháp mọc trồi lên từ lòng đất, mặt đất rung chấn nhẹ, bụi sao và 2 vòng sóng ánh sáng tỏa rộng. |
| **Jail Thunder (Sấm sét nhà tù)** | Bước vào ô "Vào Tù" | Tia chớp hoạt hình giáng xuống ô số 10, lồng sắt hoạt hình từ trên cao rơi xuống giam giữ quân cờ. |
| **Rent Beam (Tia hút tiền)** | Nộp tiền thuê nhà cho đối thủ | Dòng tia sáng mang biểu tượng tiền bạc bay uốn lượn từ người vi phạm sang người thu tiền. |
| **Bankrupt Smoke** | Người chơi phá sản | Khói xám hoạt hình bốc lên, các ngôi nhà của người đó biến mất với hiệu ứng tan biến thành bụi sao. |

---

## 7. GIAI ĐOẠN TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (PHASED MILESTONES)

```
Giai đoạn 1 (Hiện tại) ─────────► Giai đoạn 2 (Tuần 1-2) ────────► Giai đoạn 3 (Tuần 3-4)
• 3D Board 40 ô chuẩn            • PBR Toy Materials + Rim Light   • Tilt-Shift & Bloom nhẹ
• 4 Tokens + Nhún nhảy           • Vỉa hè đá 3D + Đèn đường        • Gold Rain 3D Particle
• Studio Tabletop + Props        • Khói cà phê & Bụi ống khói      • Hoạt ảnh xe lăn bánh & mắt chớp
• Star Burst & Shockwave         • Cột mốc Landmark có đèn neon    • Benchmark 60 FPS Mobile
```

### Tiêu Chí Nghiệm Thu (Definition of Done - DoD):
- [x] Không gian Studio ấm cúng với mặt bàn gỗ, thảm nỉ, tách cà phê, đồng xu vàng và sen đá trang trí.
- [x] Quân cờ có chuyển động đàn hồi hoạt hình (Squash & Stretch) kèm bóng tiếp xúc động (Dynamic Contact Shadow).
- [ ] Vỉa hè và biển hiệu 40 ô cờ đạt độ nổi khối 3D chi tiết.
- [ ] 100% hiệu ứng hình ảnh (VFX hạt nước, khói, tia sét) chạy mượt trên iPhone 11 và Android tầm trung không tụt dưới 55 FPS.
- [ ] Kích thước tải ban đầu (Initial 3D Payload) không vượt quá 3.0 MB.
- [ ] Nhiệt độ thiết bị không bị nóng bất thường sau 20 phút chơi liên tục.

---

*Tài liệu này là căn cứ kỹ thuật chính thức để định hướng phát triển mỹ thuật 3D và tối ưu hóa WebGL cho toàn bộ đội ngũ phát triển Business Chess 3D.*
