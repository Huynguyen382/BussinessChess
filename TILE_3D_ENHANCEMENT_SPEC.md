# TÀI LIỆU ĐẶC TẢ NÂNG CẤP ĐỒ HỌA 3D CHO CÁC Ô CỜ (TILE 3D ART & ARCHITECTURE SPECIFICATION)

> **Dự án:** Business Chess 3D (Cờ Tỷ Phú Web & Mobile)  
> **Chủ đề:** Phân tích mã nguồn và thiết lập quy chuẩn nâng cấp đồ họa 3D toàn diện cho 40 ô cờ. Khắc phục triệt để tình trạng mô hình sơ sài, đại khái, thiếu chiều sâu không gian.  
> **Mục tiêu:** Chuyển hóa toàn bộ bàn cờ thành một sa bàn đô thị sống động đẳng cấp thế giới (*Toy Diorama Fidelity* tương đương *Monopoly GO!* và *Super Mario 3D World*).

---

## 1. PHÂN TÍCH SOURCE CODE HIỆN TẠI & CÁC NGUYÊN NHÂN KHIẾN MODEL "ĐẠI KHÁI"

Sau khi rà soát chi tiết các file nguồn trong dự án (`BoardScene.ts`, `LandmarkModels.ts`, `BuildingMesh.ts`, `TextureGenerator.ts`), nhóm phát triển đã xác định được **5 vấn đề cốt lõi** khiến các ô cờ hiện tại trông sơ sài và thiếu tính chân thực:

```
[ Hiện Trạng Ô Cờ Hiện Tại ]
 ┌─────────────────────────────────────────────────────────────┐
 │  Mép Ngoài: Landmark 3D cắm trực tiếp lên mặt phẳng (1.08)  │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │  Tấm Canvas 2D Label phẳng lì dán đè lên toàn bộ mặt  │  │
 │  │  - Icon Emoji 2D to (120px) đè lấn không gian 3D      │  │
 │  │  - Chữ in phẳng, không có gờ nổi hay chất cảm kim loại │  │
 │  └───────────────────────────────────────────────────────┘  │
 │  Mép Trong: Gờ bó vỉa đơn điệu (Curb) + 1 Bụi hoa nhỏ        │
 └─────────────────────────────────────────────────────────────┘
      => Hệ quả: Giống như dán một tờ giấy in màu lên hộp gỗ 
                 rồi cắm vài món đồ chơi nhựa thô sơ lên trên.
```

### 1.1. Xung đột giữa Canvas Label 2D và Mô hình 3D (2D vs 3D Clashing)
- Trong `BoardScene.ts` (dòng 1119-1122), phương thức `createTileLabel()` tạo một tấm Canvas độ phân giải 640x1024 dán phủ gần như toàn bộ mặt ô (`normalWidth * 0.95` x `cornerSize * 0.95`).
- Canvas này vẽ một hình tròn lớn chứa **Emoji 2D** (`ctx.fillText(landmark.icon, 320, 575)`) cùng dải chữ chiếm hết diện tích.
- Cùng lúc đó, `LandmarkModels.ts` lại đặt một mô hình 3D ở `z = ±1.08`. Kết quả: **Mô hình 3D đè trực tiếp lên hình vẽ 2D**, gây nhiễu thị giác, triệt tiêu cảm giác không gian ba chiều của mô hình.

### 1.2. Mặt ô cờ thiếu cấu trúc địa hình đa tầng (Lack of 3D Terrain Layering)
- Ô cờ hiện tại chỉ gồm 2 khối hộp chữ nhật phẳng: `subPlinth` (đế dưới) và `baseMesh` (đế trên).
- Hoàn toàn thiếu các phân tầng kiến trúc thực tế:
  - Không có **vỉa hè lát đá nổi khối (Elevated 3D Sidewalk)**.
  - Không có **lòng đường nhựa xe chạy hạ thấp (Sunken Asphalt Avenue)** có vạch sơn phân làn.
  - Không có **sân nền địa danh lõm/nổi (Recessed Scenic Diorama Base)** để mô hình đứng vững chãi thay vì "cắm cọc trên mặt bàn phẳng".

### 1.3. Mô hình Landmark trong `LandmarkModels.ts` còn dùng nhiều hình khối thô (Primitive Shapes)
- Mặc dù đã có code cho các danh thắng, nhưng nhiều mô hình vẫn cấu thành từ các khối hình học nguyên thủy cơ bản:
  - Trụ cầu, tháp ngọn hải đăng dùng ống trụ tròn thẳng tuột (`CylinderGeometry`), thiếu phào chỉ, lan can bảo vệ, đai gia cố kim loại.
  - Các ô Nhà Ga (`createRailroadModel`) chỉ có đầu tàu khối hộp trơn, thiếu **đường ray sắt 3D có thanh tà vẹt gỗ**, thiếu cột tín hiệu đèn đôi và khói hơi nước nhả thành từng cuộn mây hoạt hình.
  - Các ô Tiện ích (`createUtilityModel`) thiếu chi tiết dây điện cao thế võng 3D, thiếu van khóa đồng và đồng hồ đo áp suất.

### 1.4. Xung đột không gian khi người chơi Xây Nhà (`BuildingMesh.ts`)
- Khi người chơi nâng cấp nhà (Level 1, 2, 3) hoặc Khách sạn (Level 4), mô hình nhà được spawn tại `buildingZ = ±0.35` với kích thước bệ lên tới `0.84 x 0.84`.
- Chiều rộng của ô cờ chỉ vỏn vẹn `1.95 units`. Khi xuất hiện đồng thời cả Landmark danh thắng + Nhà xây thêm + Cờ quyền sở hữu, các công trình chen chúc nhau, che khuất tầm nhìn của camera.

### 1.5. 4 Ô Góc (Corners) chưa tận dụng hết tầm vóc "Đại Kỷ Lục" (Mega-Plinth)
- Diện tích ô góc là `3.2 x 3.2` (gấp gần 3 lần ô thường), nhưng thiết kế hiện tại chưa tạo ra cảm giác hoành tráng tương xứng:
  - **Ô 0 (GO):** Cổng chào còn mỏng manh, thiếu thảm đỏ nhung dẫn đường, thiếu dàn cờ phướn lễ hội bay trong gió.
  - **Ô 10 (JAIL):** Tháp canh chưa có đèn pha an ninh quét sáng (Searchlight cone), song sắt thiếu độ dày của hợp kim titan.
  - **Ô 20 (FREE PARKING):** Chỉ có 1 xe ô tô đơn độc, thiếu cây xăng cổ điển Retro 1950s và biển neon phát sáng.
  - **Ô 30 (GO TO JAIL):** Chưa toát lên sự kịch tính của đồn cảnh sát trưởng với còi hú xoay và barie phản quang.

---

## 2. KIẾN TRÚC Ô CỜ 3D THẾ HỆ MỚI: PHÂN TẦNG ĐỊA HÌNH 4 LỚP (4-LAYER TILE ANATOMY)

Thay vì dán một tấm Canvas phẳng lì, mỗi ô cờ tiêu chuẩn sẽ được cấu trúc thành **4 lớp hình học ba chiều độc lập**:

```
                              [PHÍA NGOÀI BÀN CỜ - VIEW BẦU TRỜI]
                                              ▲
   ┌──────────────────────────────────────────┴──────────────────────────────────────────┐
   │  ZONE B: KHU ĐỊA DANH & BẤT ĐỘNG SẢN (Scenic Landmark & Property Estate)            │
   │  ┌─────────────────────────────────┐   ┌─────────────────────────────────────────┐  │
   │  │  LÔ ĐẤT XÂY DỰNG (Building Plot)│   │  MÔ HÌNH DANH THẮNG 3D (Hero Landmark)  │  │
   │  │  - Chân móng bê tông có viền gạch│   │  - Đặt trên bệ cảnh quan riêng (Grass/  │  │
   │  │  - Dành riêng cho Nhà Lvl 1-2-3 │   │    Cobblestone/Water Base)              │  │
   │  │  - Khi chưa xây: Bãi cỏ xanh mượt│   │  - Không bao giờ bị nhà đè lấn          │  │
   │  └─────────────────────────────────┘   └─────────────────────────────────────────┘  │
   ├─────────────────────────────────────────────────────────────────────────────────────┤
   │  ZONE A: VỈA HÈ & ĐẠI LỘ ĐÔ THỊ (Urban Promenade & Avenue)                          │
   │  ┌───────────────────────────────────────────────────────────────────────────────┐  │
   │  │  VỈA HÈ LÁT ĐÁ 3D (Elevated Pavement +0.06):                                  │  │
   │  │  - Biển Tên Phố Kim Loại Đúc Nổi 3D (Engraved Street Plaque)                   │  │
   │  │  - Giá tiền đúc khối kim loại nổi (Golden Value Ingot)                        │  │
   │  │  - Cột đèn đường tí hon / Bồn cây cảnh bo viền đá granite                      │  │
   │  ├───────────────────────────────────────────────────────────────────────────────┤  │
   │  │  LÒNG ĐƯỜNG XE CHẠY (Sunken Asphalt -0.02): Nơi Token người chơi dừng chân     │  │
   │  │  - Mặt đường nhựa đen mịn + Vạch sơn đi bộ qua đường (Zebra Crossing)         │  │
   │  └───────────────────────────────────────────────────────────────────────────────┘  │
   └─────────────────────────────────────────────────────────────────────────────────────┘
                                              ▼
                                 [PHÍA TRONG - CÔNG VIÊN TRUNG TÂM]
```

### Chi tiết 4 Phân Lớp Hình Học:
1. **Lớp 1: Khung Chân Đế Đá Đúc (Architectural Sub-Plinth):**
   - Chiều cao: `0.15 units`.
   - Vật liệu: Đá bazan sẫm màu viền kim loại theo màu phân khu (`districtColor`), bo tròn cạnh (`RoundedBoxGeometry` với bevel `0.06`).
2. **Lớp 2: Lòng Đường Đại Lộ (Sunken Asphalt Avenue):**
   - Nằm thấp hơn vỉa hè `0.04 units`.
   - Tạo không gian sạch sẽ, phẳng phiu để **Token người chơi (xe hơi, mũ, cún con...)** đứng vững mà không bị chìm hay va chạm vào các công trình.
   - Có vạch sơn trắng phân làn dập nhẹ phản quang.
3. **Lớp 3: Vỉa Hè Lát Đá 3D (Elevated Diorama Sidewalk):**
   - Nâng cao `+0.05 units`, có gờ đá bó vỉa bo cong (`curb`) phân định ranh giới rõ rệt.
   - Bề mặt lát gạch xương cá (Herringbone) hoặc đá cẩm thạch trắng ngà.
4. **Lớp 4: Khu Di Sản & Biệt Thự (Landmark Sanctuary & Building Plot):**
   - Chiếm 55% diện tích nửa sau của ô cờ.
   - Tách làm 2 ô nhỏ song song: **Ô Trái** dành cho công trình xây dựng của người chơi (Nhà cấp 1, 2, 3), **Ô Phải** dành cho Mô hình Danh Thắng 3D biểu tượng của ô cờ.

---

## 3. BẢN THIẾT KẾ CHI TIẾT 4 Ô GÓC ĐẠI KỶ LỤC (CORNER MEGA-LANDMARKS)

4 Ô góc là trụ cột thị giác của bàn cờ. Thiết kế mới nâng tầm chúng thành những cụm sa bàn đồ sộ:

### 3.1. Ô 0: XUẤT PHÁT (GO) – CỔNG KHẢI HOÀN MÔN HOÀNG KIM & ĐẠI LỘ VINH QUANG
```
                     [Vương Miện Kim Cương Phát Sáng]
                                  < 👑 >
                 [Vòm Khải Hoàn Môn Đá Cẩm Thạch Trắng]
                 /====================================\
                |      G O !   + 2 0 0 M   B O N U S   |
                 \====================================/
                  ||                                ||
       [Cột La Mã Corinthian]             [Cột La Mã Corinthian]
                  ||      [Thảm Đỏ Nhung]           ||
                  ||      ================          ||
                  ||     /                \         ||
       ___________||____/  [RƯƠNG VÀNG]    \________||___________
      [  Bệ Đá Bát Giác Lát Gạch Vàng Kim + Pháo Hoa Confetti 3D  ]
```
- **Cấu trúc hình học:**
  - Hai trụ cột phong cách Corinthian có rãnh khía 3D đúc đầu cột mạ vàng sáng bóng (`metalness: 0.9, roughness: 0.12`).
  - Vòm cổng cuốn đá cẩm thạch trắng ngà, trên đỉnh gắn biển chữ nổi `GO!` bằng hồng ngọc Ruby viền vàng.
  - **Thảm đỏ nhung 3D:** Trải từ sau cổng vươn ra lòng đường bàn cờ, có viền tua rua vàng óng.
  - **Rương báu Tỷ Phú:** Mở nắp 45 độ, bên trong tràn ngập tiền xu vàng, kim cương xanh lấp lánh và các cọc tiền đô la tí hon.
  - **Hiệu ứng động:** Hào quang vàng xoay tròn nhẹ quanh rương báu; khi có người đi qua ô GO, 2 pháo giấy kim tuyến 3D ở hai bên cột cổng bắn tung hoa giấy confetti rực rỡ.

---

### 3.2. Ô 10: NHÀ TÙ & THĂM TÙ (JAIL / JUST VISITING)
```
          [Đèn Pha Tìm Kiếm Xoay Góc 360°]
                       \  /
                        \/
           [Tháp Canh Pháo Đài Bê Tông Xám]
                  |=============|
                  | [Cửa Sổ Kính|
                  |  Bảo An Đỏ] |
                  |=============|
                         ||
             [Song Sắt Thép Hợp Kim Đen]
         ┌───────────────┬───────────────┐
         │ █   █   █   █ │ █   █   █   █ │   [Phòng Thăm Tù Ngoài Trời]
         │ █   █   █   █ │ █   █   █   █ │    - Ghế đá công viên
         │ █  [PHÒNG GIAM] █   █ [Ổ KHÓA]│    - Vách kính có ống nghe điện thoại
         └───────────────┴───────────────┘    - Dải sơn vàng "JUST VISITING"
      [ Nền Bê Tông Nhám Có Vết Rạn Nứt Phong Cách Nhà Tù Alcatraz ]
```
- **Phân định 2 khu vực rõ ràng:**
  - **Khu "Ở Tù" (In Jail):** Nằm gọn bên trong góc vuông, bao bọc bởi hàng rào song sắt thép hợp kim titan dày dặn (`metalness: 0.85`), ổ khóa xích sắt khổng lồ màu vàng đồng. Bên trên là tháp canh pháo đài kiên cố.
  - **Khu "Thăm Tù" (Just Visiting):** Con đường chữ L màu cam bao quanh phía ngoài song sắt, có vạch kẻ sơn vàng chéo nổi khối, ghế chờ bằng đá và bốt điện thoại thăm tù bằng kính trong suốt.
- **Hiệu ứng động:** Tháp canh có luồng sáng hình nón `ConeGeometry` bán trong suốt (`opacity: 0.35`) xoay quét nhịp nhàng qua lại như đèn pha an ninh thực thụ.

---

### 3.3. Ô 20: BÃI ĐỖ XE MIỄN PHÍ (FREE PARKING) – TRẠM DỊCH VỤ RETRO 1950s
```
              [Biển Neon Chữ "P" Màu Xanh Cyan Phát Sáng]
                                ( P )
                                  ||
          [Mái Che Cây Xăng Vintage Lượn Sóng Màu Đỏ Trắng]
            /==============================================\
           /________________________________________________\
                 ||                                  ||
         [Cột Bơm Xăng Cổ Điển]            [Xe Thể Thao Mui Trần]
          - Đồng hồ kim tròn quay           - Thân xe sơn bóng candy
          - Vòi bơm xăng uốn cong           - Vành bánh mạ crôm bóng
      [ Mặt Sân Nhựa Đường Đen Bóng + Vạch Sơn Vàng Đỗ Xe Chéo Góc ]
```
- **Cấu trúc hình học:**
  - Mái che trạm xăng phong cách Retro Americana với viền đèn neon chạy dọc mép mái.
  - Cột bơm xăng cổ điển hình trụ thon, đỉnh có quả cầu thủy tinh phát sáng ghi giá xăng `FREE`.
  - Một chiếc **Xe thể thao mui trần cổ điển (Vintage Convertible)** đậu chéo góc 45 độ: Thân xe đỏ tươi phủ bóng tráng gương (Clearcoat Car Paint shader), kính chắn gió trong vắt, lốp xe viền trắng sang trọng.
  - Bồn hoa xương rồng sa mạc viền đá cuội đặt bên cạnh trạm xăng tạo cảm giác hoài niệm của cung đường Route 66.

---

### 3.4. Ô 30: VÀO TÙ (GO TO JAIL) – ĐỒN CẢNH SÁT TRƯỞNG & CÒI BÁO ĐỘNG
```
               [Đèn Còi Cảnh Sát Kép Đỏ - Xanh Chớp Tắt Liên Tục]
                               (🔴)   (🔵)
                                 \_____/
                       [Bốt Trực Cảnh Sát Trưởng]
                         |=================|
                         |  POLICE DEPT    |
                         |=================|
                         |  [Cửa Gỗ Xanh]  |
                         |_________________|
                                  ||
        [Rào Chắn Barie Sọc Vàng-Đen Chắn Ngang Lối Đi]
         \===========================================/
                              ||
         [Bàn Tay Khổng Lồ Đeo Găng Trắng Chỉ Thẳng Về Hướng Nhà Tù]
                           👉 =======>>>
```
- **Cấu trúc hình học:**
  - Tòa nhà đồn cảnh sát trưởng ốp gỗ xanh navy viền trắng phong cách New York, có phù hiệu ngôi sao 6 cánh bằng vàng trên đỉnh.
  - Rào chắn Barie an ninh sọc chéo vàng - đen hạ xuống chắn ngang góc rẽ.
  - **Mô hình bàn tay chỉ hướng hoạt hình (Cartoon Pointing Glove):** Chiếc găng tay trắng hoạt họa phóng đại chỉ thẳng tắp về hướng Ô số 10 (Jail) để nhắc nhở người chơi không được phép đi tiếp.
  - **Hiệu ứng động:** Cặp đèn còi cảnh sát đỏ và xanh trên nóc đồn luân phiên chớp tắt và xoay luồng sáng 360 độ cực kỳ kịch tính.

---

## 4. QUY CHUẨN NÂNG CẤP CHI TIẾT CÁC NHÓM Ô ĐẶC BIỆT

### 4.1. Nhóm Ô Ga Tàu / Bến Xe (4 Railroads)
- **Vấn đề cũ:** Đầu tàu hộp diêm phẳng lì, đặt trơ trọi.
- **Nâng cấp mới:**
  - **Đường ray sắt 3D:** Hai dải ray kim loại sáng bóng uốn cong nhẹ nhàng, đặt trên các thanh tà vẹt gỗ nâu sẫm lát đá dăm (Ballast gravel base).
  - **Đầu máy xe lửa cổ điển (Steam Locomotive):** Thân nồi hơi tròn bóng bo cong, ống khói vểnh cao nhả ra **3 cuộn khói trắng tròn mập cách điệu (Chunky Smoke Clouds)** lơ lửng trên không.
  - **Cột đèn tín hiệu đường sắt:** Cột kim loại màu đen có biển báo chữ `X` phản quang và 2 đèn tín hiệu đỏ/xanh nhấp nháy nhịp nhàng.

### 4.2. Nhóm Ô Tiện Ích (Utilities: Điện Lực & Cấp Nước)
- **Ô Điện Lực (Electric Company):**
  - Trạm biến áp cao thế với cuộn dây đồng Tesla cuộn xoắn 3D.
  - Quả cầu plasma thủy tinh ở trung tâm phóng ra các **tia hồ quang điện tím xanh** lấp lánh (dùng `LineSegments` có hiệu ứng giật ngẫu nhiên trong vòng lặp animation).
  - Biển cảnh báo tia sét vàng viền đen phản quang.
- **Ô Cấp Nước (Water Works):**
  - Tháp nước khổng lồ bằng thép tán đinh tán cổ điển, chân tháp dạng giàn thép 4 chân vững chắc.
  - Hệ thống đường ống nước uốn khúc có **Van đồng xoay tròn** và đồng hồ đo áp suất kim quay nhẹ nhàng.
  - Giọt nước ngọc bích 3D khổng lồ bóng loáng lơ lửng xoay tròn giữa tháp nước.

### 4.3. Nhóm Ô Thẻ May Rủi & Khí Vận (Chance & Community Chest)
- **Ô May Rủi (Chance - Dấu Hỏi Vàng):**
  - Bệ đá hoa cương đen bóng, bên trên là **Khối lập phương bí ẩn (Mystery Cube)** lơ lửng cách mặt đất `0.4 units`, tự xoay chậm theo trục Y.
  - 4 mặt khối lập phương khắc chìm dấu chấm hỏi `?` phát sáng hào quang vàng neon rực rỡ (`emissiveIntensity: 1.5`).
  - Xung quanh khối lập phương có các hạt tinh thể sao lấp lánh bay bổng.
- **Ô Khí Vận (Community Chest - Rương Kho Báu):**
  - Rương gỗ sồi bọc đai đồng cổ điển, nắp rương hé mở một góc 30 độ.
  - Từ trong khe rương tỏa ra một **luồng sáng thiên hà vàng kim (God Rays Mesh)** rực rỡ, kèm các phong bì thư thắt nơ hồng và đồng tiền vàng bay lơ lửng.

### 4.4. Nhóm Ô Thuế (Income Tax & Luxury Tax)
- **Ô Thuế Thu Nhập (Income Tax):**
  - Két sắt ngân hàng bằng thép nguyên khối màu xám titan, cửa két tròn xoay có tay quay bánh lái mạ crôm hé mở.
  - Các cọc tiền giấy xanh lá buộc nẹp trắng chất đống tràn ra ngoài cửa két, tượng trưng cho dòng tiền thuế dồi dào.
- **Ô Thuế Xa Xỉ (Luxury Tax):**
  - Bục trưng bày nhung tím hình bát giác bọc lồng kính pha lê hình chuông (Glass Cloche).
  - Bên trong lồng kính là một **Viên Kim Cương Xanh Khổng Lồ (Giant Blue Diamond)** giác cắt 57 mặt hoàn hảo, phát ra ánh sáng khúc xạ lấp lánh kiêu sa.

---

## 5. NÂNG CẤP TOÀN BỘ 22 Ô DANH THẮNG BẤT ĐỘNG SẢN (VIETNAM ICONIC LANDMARKS)

Mỗi ô đất không còn là mô hình tượng trưng đại khái mà là một tác phẩm điêu khắc vi mô đặc sắc:

| STT | Ô Cờ | Danh Thắng Biểu Tượng | Chi Tiết Dựng Hình 3D Nâng Cấp |
| :---: | :--- | :--- | :--- |
| **1** | Cần Thơ | Cầu Cần Thơ & Chợ Nổi Cái Răng | Trụ tháp dây văng chữ Y ngược thanh thoát, dàn dây cáp vàng căng mịn; mặt sông có sóng gợn, ghe bầu chở sọt dứa, dưa hấu, bưởi năm roi và cây bẹo tre treo quả. |
| **3** | Cà Mau | Mũi Tàu Cực Nam & Rừng Đước | Tượng đài con tàu vươn khơi với cánh buồm đỏ no gió, mốc tọa độ GPS 0001 đá hoa cương có sao vàng đúc nổi; cụm rễ đước chùm uốn vòm cắm vào nước mặn. |
| **6** | Vũng Tàu | Ngọn Hải Đăng Núi Nhỏ | Tháp đá tròn cổ kính màu trắng sữa, mái vòm đỏ thẫm; lồng kính phát sáng vàng ấm quét luồng ánh sáng 180 độ ra biển; chân tháp có rặng hoa giấy hồng rực. |
| **8** | Phan Thiết | Đồi Cát Bay & Tháp Chàm Poshanư | Những đồi cát uốn lượn màu cam cháy mượt mà; cụm tháp Chăm gạch nung đỏ rực với hoa văn điêu khắc vòm cửa hình ngọn lửa. |
| **9** | Nha Trang | Tháp Trầm Hương & Vịnh San Hô | Tháp cánh hoa sen màu hồng cam cách điệu vươn cao; chân tháp là rạn san hô xanh ngọc bích có đàn cá hề bơi lội. |
| **11** | Đà Lạt | Ga Xe Lửa & Rừng Thông Mơ | Nhà ga 3 chóp mái nhọn màu vàng đất đặc trưng Art Deco, đồng hồ cổ kính tròn; đồi thông 3 tầng lá sắc nét đón sương mù. |
| **13** | Buôn Ma Thuột | Nhà Rông & Cồng Chiêng Tây Nguyên | Mái nhà rông cao vút hình lưỡi rìu đan nan tre tỉ mỉ, cột gỗ lim đỡ sàn; bộ chiêng đồng vàng óng treo trên giá gỗ chạm khắc hoa văn voi. |
| **14** | Pleiku | Biển Hồ Tơ Nưng & Rừng Cao Su | Hồ nước miệng núi lửa xanh thẳm hình tròn viền đá bazan; hàng cây cao su thẳng tắp mùa thay lá vàng ruộm. |
| **16** | Quy Nhơn | Kỳ Co - Eo Gió & Tháp Đôi | Cổng vách đá Eo Gió đón sóng biển tung bọt trắng xóa; cặp tháp đôi gạch Chămpa trầm mặc soi bóng hoàng hôn. |
| **18** | Hội An | Chùa Cầu & Đèn Lồng Phố Cổ | Mái ngói âm dương cong vút rêu phong, thân cầu gỗ sơn son; đàn lồng lụa ngũ sắc treo dọc cầu phát sáng ấm cúng. |
| **19** | Đà Nẵng | Cầu Rồng Vàng Sông Hàn | Thân rồng uốn lượn 3D mạ vàng rực rỡ, đầu rồng hướng ra biển; hiệu ứng luồng lửa cam đỏ phun ra từ miệng rồng. |
| **21** | Huế | Ngọ Môn & Kỳ Đài Cố Đô | Cổng Ngọ Môn 5 cửa tráng lệ, lầu Ngũ Phụng mái ngói hoàng lưu ly vàng óng; cột cờ Kỳ Đài đá hoa cương có cờ ngũ sắc bay. |
| **23** | Quảng Bình | Kỳ Quan Sơn Đoòng | Vòm hang đá vôi kỳ vĩ với giếng trời (doline) đón luồng nắng tự nhiên; thạch nhũ măng đá đan xen thảm rừng nguyên sinh ngầm. |
| **24** | Cửa Lò | Đảo Lan Châu & Thuyền Buồm | Bãi cát trắng mịn thoai thoải, cầu cảng gỗ vươn ra biển; ngọn hải đăng nhỏ trên mỏm đá ngắm bình minh. |
| **26** | Hải Phòng | Cầu Hoàng Văn Thụ & Cảng Biển | Vòm cầu thép uốn cánh chim biển trắng muốt; cần cẩu giàn container xanh dương bốc dỡ hàng hóa trên bến cảng. |
| **27** | Quảng Ninh | Kỳ Quan Vịnh Hạ Long | Các đảo đá vôi nhấp nhô trên mặt vịnh ngọc bích; hòn Trống Mái biểu tượng soi bóng bên chiếc thuyền buồm nâu cánh dơi. |
| **29** | Ninh Bình | Non Nước Tràng An & Hang Múa | Đỉnh Ngọa Long trên vách núi đá dựng đứng uốn lượn; dòng sông Ngô Đồng uốn lượn qua đồng lúa vàng có thuyền nan trôi nhẹ. |
| **31** | Hà Nội (Hồ Tây) | Chùa Trấn Quốc & Hồ Tây | Bảo tháp lục độ đài sen 11 tầng màu đỏ son cổ kính; cây bồ đề xum xuê và mặt hồ bảng lảng khói sương. |
| **32** | Phố Cổ Hà Nội | Ô Quan Chưởng & Phố Rêu Phong | Cửa ô vòm cuốn gạch vồ rêu phong thời Nguyễn; dãy nhà phố cổ mái ngói hình bậc thang xô nghiêng duyên dáng. |
| **34** | Ba Đình | Cột Cờ Hà Nội & Hoàng Thành | Tháp Cột Cờ Kỳ Đài 3 tầng đế vuông bát giác bằng gạch đỏ nung vững chãi; lá cờ đỏ sao vàng tung bay kiêu hãnh trên đỉnh cột. |
| **37** | Landmark 81 | Tòa Tháp 81 Tầng Hiện Đại | Bó tre thép kính chọc trời giật cấp vươn cao kiêu hãnh; đỉnh tháp có đài quan sát kính viền đèn led nhấp nháy sang trọng. |
| **39** | Sài Gòn (Đại Lộ) | Chợ Bến Thành & Tháp Đồng Hồ | Tháp đồng hồ 4 mặt biểu tượng với mái ngói tam giác đỏ; quảng trường lát gạch hoa cương có bồn phun nước rực rỡ. |

---

## 6. CẢI TIẾN NHÃN Ô CỜ 3D: CÔNG NGHỆ BẢNG TÊN DẬP NỔI KIM LOẠI (METALLIC EMBOSSED PLAQUE)

Để xóa bỏ cảm giác "dán giấy sticker phẳng" của nhãn ô hiện tại:

```
[ THIẾT KẾ BẢNG TÊN Ô CỜ THẾ HỆ MỚI ]
┌────────────────────────────────────────────────────────┐
│  DẢI PHÂN KHU ĐỒNG MẠ VÀNG (District Metallic Header)   │
│  [★]  K H U  V Ự C  3  -  Đ À  L Ạ T  [★]               │
├────────────────────────────────────────────────────────┤
│  TÊN ĐỊA DANH CHỮ KHỐI DẬP NỔI (3D Embossed Typography)│
│                     Đ À   L Ạ T                         │
│  (Chữ trắng bóng viền đổ bóng khắc chìm sâu 4px)       │
├────────────────────────────────────────────────────────┤
│  [THỎI VÀNG GIÁ BÁN NỔI 3D]                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │   💰 3 5 0 M   (Thỏi vàng dập nổi viền kim cương)│  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

1. **Loại bỏ hoàn toàn Icon Emoji 2D:**
   - Xóa bỏ vòng tròn vẽ Emoji 120px ở giữa ô cờ vì chính mô hình Landmark 3D thật đã là biểu tượng đại diện.
   - Trả lại khoảng không gian thông thoáng, sạch sẽ để hiển thị vỉa hè lát đá và lòng đường.
2. **Kỹ thuật Canvas BumpMap / NormalMap:**
   - Bên cạnh bản đồ màu (Diffuse Canvas), tự động sinh một bản đồ độ sâu (BumpMap Canvas) cùng kích thước:
     - Phần chữ và viền khung có màu trắng (`#FFFFFF` - độ cao lồi lên).
     - Phần nền gạch có màu xám trung tính (`#808080`).
     - Các rãnh viền có màu đen (`#000000` - độ sâu rãnh chìm).
   - Áp dụng vào `material.bumpMap = bumpTexture; material.bumpScale = 0.04;` -> Khi ánh đèn sân khấu Three.js chiếu xiên, từng nét chữ tên thành phố và gờ viền sẽ **nổi khối chân thực dưới mọi góc nhìn**.
3. **Thỏi vàng giá trị bất động sản (Golden Value Ingot):**
   - Hộp giá tiền ở mép ô cờ được thiết kế như một **thỏi vàng nguyên chất dập nổi**: Nền vàng kim `#F1C40F`, chữ đen in đậm, có dải sáng lướt qua (Specular Sweep) mỗi khi người chơi nhìn vào.

---

## 7. HIỆU ỨNG TƯƠNG TÁC ĐỒ HỌA (DYNAMIC 3D VFX & SHADER FEEDBACK)

Để bàn cờ trở nên hấp dẫn và phản hồi sinh động với mọi hành động của người chơi:

1. **Hiệu ứng Viền Đèn Neon khi Trỏ Chuột (Pointer Hover Halo):**
   - Khi di chuột (Desktop) hoặc chạm tay (Mobile) vào bất kỳ ô cờ nào:
     - Ô cờ hơi nhấc bổng lên `+0.08 units` theo đường cong êm dịu (Ease-out quad).
     - Một khung viền ánh sáng Neon màu xanh lục ngọc bích chạy vòng quanh chân đế ô cờ (`MeshBasicMaterial` bán trong suốt có animation nở rộng nhẹ).
2. **Hiệu ứng Đất Thuộc Quyền Sở Hữu (Ownership Turf Lighting):**
   - Khi một ô đất được người chơi mua lại:
     - Chân đế của ô cờ chuyển sang màu ánh kim rực rỡ của người sở hữu (Player 1: Đỏ Ruby, Player 2: Xanh Dương, Player 3: Vàng Hoàng Gia, Player 4: Xanh Ngọc).
     - Một cột cờ hiệu nhỏ bằng lụa cắm ở góc vỉa hè tự động bung ra tung bay trong gió.
3. **Hiệu ứng Nâng Cấp Công Trình (Building Upgrade Shockwave):**
   - Khi xây từ Nhà lên Khách sạn:
     - Một luồng bụi sao lấp lánh tung lên (`VFXManager.spawnStarBurst`).
     - Tòa nhà mới từ trên trời rơi xuống nhún nảy đàn hồi (Elastic Bounce), tạo chấn động nhẹ lên mặt ô cờ.
4. **Hệ thống Chuyển động Tự nhiên Của Landmark (Landmark Idle Life Engine):**
   - Đèn hải đăng Vũng Tàu quét luồng sáng vàng dịu 360 độ.
   - Thuyền chợ nổi Cần Thơ dập dềnh nhẹ theo nhịp sóng (`Math.sin(time * 2) * 0.02`).
   - Cối xay gió và chong chóng tín hiệu đường sắt quay đều đặn.
   - Tia lửa điện ở trạm biến áp chớp tắt lách tách tạo sinh khí đô thị.

---

## 8. KẾ HOẠCH HÀNH ĐỘNG TRIỂN KHAI SOURCE CODE (REFACTORING ROADMAP FOR GEMINI / AI)

Khi bắt tay vào nâng cấp mã nguồn, AI (Gemini) thực hiện tuần tự theo 3 giai đoạn:

### Giai đoạn 1: Tái Cấu Trúc Mặt Ô Cờ & Nhãn trong `BoardScene.ts`
- **Bước 1.1:** Tách mặt ô cờ thành 2 phân vùng hình học: Vỉa hè/Lòng đường phía trước và Nền danh thắng phía sau.
- **Bước 1.2:** Cập nhật hàm `createTileLabel()`:
  - Bỏ icon Emoji tròn 2D ở giữa ô.
  - Tăng độ tương phản của banner tên phân khu và dải dập nổi tên địa danh.
  - Tích hợp Canvas Bump Map cho chữ nổi.
- **Bước 1.3:** Đặt lại vị trí của `Landmark3D` và `BuildingMesh` để chúng đứng cạnh nhau hài hòa trên Zone B, không bao giờ bị chồng lấn.

### Giai đoạn 2: Nâng Cấp Toàn Diện Thư Viện Mô Hình trong `LandmarkModels.ts`
- **Bước 2.1:** Viết lại 4 hàm mô hình ô góc: `createGOCorner()`, `createJailCorner()`, `createFreeParkingCorner()`, `createGoToJailCorner()` theo đúng bản vẽ kiến trúc ở Mục 3.
- **Bước 2.2:** Nâng cấp các hàm ô đặc biệt: `createRailroadModel()` (thêm đường ray sắt 3D & khói mây), `createUtilityModel()` (thêm tia hồ quang & van xoay), `createCardTileModel()`, `createTaxModel()`.
- **Bước 2.3:** Bổ sung bệ móng kiến trúc (Scenic Foundation) cho tất cả 22 danh thắng trong `createCityLandmark()`.

### Giai đoạn 3: Tối Ưu Hiệu Năng & Kiểm Thử 60 FPS
- **Bước 3.1:** Sử dụng `InstancedMesh` hoặc tái sử dụng triệt để `Shared Materials` qua hàm `this.getMat()` đã có sẵn trong `LandmarkModels.ts`.
- **Bước 3.2:** Khóa `castShadow` chỉ trên các khối công trình chính, tắt đổ bóng trên các chi tiết nhỏ dưới 0.1 units (ốc vít, dây cáp, hoa lá) để giảm tải GPU.
- **Bước 3.3:** Chạy lệnh build kiểm thử: `npm run build` trong thư mục `client/` để đảm bảo 100% không có lỗi TypeScript hay lỗi Three.js context.
