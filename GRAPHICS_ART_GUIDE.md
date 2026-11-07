# TÀI LIỆU ĐẶC TẢ THIẾT KẾ ĐỒ HOẠ & ART BIBLE: BUSINESS CHESS 3D

> **Dự án:** Business Chess 3D (Cờ Tỷ Phú Web & Mobile)  
> **Chủ đề tài liệu:** Định hướng nghệ thuật (Art Direction), phong cách đồ họa thống nhất & giải pháp kỹ thuật tối ưu hóa Three.js cho WebGL di động.

---

## 1. PHÂN TÍCH ĐỐI THỦ & NGUỒN CẢM HỨNG (BENCHMARK ANALYSIS)

Để xây dựng một tựa game cờ tỷ phú thu hút hàng triệu người chơi trên nền tảng Web & Mobile, nhóm phát triển đã tiến hành phân tích các sản phẩm dẫn đầu thị trường:

| Tựa Game / Nguồn | Điểm mạnh đồ họa | Hạn chế khi đưa lên WebGL Mobile | Bài học rút ra |
| :--- | :--- | :--- | :--- |
| **Monopoly GO!** (Scopely) | Phong cách sa bàn đồ chơi (Toy diorama), chi tiết bo tròn ngộ nghĩnh (chunky), màu sắc rực rỡ, hiệu ứng "juicy". | Đòi hỏi nhiều shader đổ bóng phức tạp và bộ nhớ lớn nếu port nguyên bản lên web. | Áp dụng triết lý thiết kế hình khối: **Bo tròn, thân thiện, vật liệu đồ chơi nhựa bóng (vinyl/glossy plastic)**. |
| **Business Tour** (Creobit) | Phong cách Tabletop hoạt hình đơn giản, góc nhìn trực quan, dễ nhận diện ô cờ. | Đồ họa có phần phẳng, hiệu ứng chuyển động và ánh sáng chưa đủ ấn tượng. | Kế thừa sự rõ ràng của bàn cờ và độ tương phản cao của các nhóm ô màu đất. |
| **Let's Get Rich** (Netmarble) | Nhân vật Chibi 3D dễ thương, hiệu ứng Landmark đồ sộ lộng lẫy, cảm giác chiến thắng thỏa mãn. | Quá nhiều chi tiết vụn vặt gây rối mắt trên màn hình điện thoại nhỏ. | Chắt lọc thiết kế Landmark thành các khối kiến trúc đặc trưng, nhận diện ngay từ xa. |
| **Monument Valley & Crossy Road** | Phong cách Stylized Low-Poly tối giản, tối ưu cực cao trên thiết bị di động, bảng màu pastel kết hợp màu tươi sang trọng. | Góc nhìn Isometric cố định đôi khi khó hiển thị thông tin phức tạp. | Học hỏi kỹ thuật **Baked Lighting (nướng bóng tĩnh)** để đạt 60 FPS mượt mà trên mọi trình duyệt điện thoại. |

---

## 2. ĐỊNH HÌNH PHONG CÁCH ĐỒ HỌA THỐNG NHẤT

### 2.1. Tên phong cách: **Stylized Toy Diorama (Sa bàn Đồ chơi Cách điệu)**
- **Khái niệm cốt lõi:** Bàn cờ được thể hiện như một **sa bàn thế giới thu nhỏ** sống động đặt trong không gian studio ấm cúng. Mọi thành phần trong game (quân cờ, xúc xắc, nhà cửa, cây cối, xe cộ) đều mang cảm giác của những món đồ chơi cao cấp được gia công tinh xảo bằng nhựa vinyl phủ bóng nhẹ hoặc gỗ mài mịn.
- **Tính chất tạo hình (Shape Language):**
  - **Quy tắc "Không góc nhọn sắc":** Mọi cạnh khối vuông (nhà, ô cờ, xúc xắc) đều được bo vát góc nhẹ (Beveled edges).
  - **Tỷ lệ Chunky (Mập mạp - Đáng yêu):** Các vật thể có tỷ lệ phóng đại đáng yêu (mái nhà dày hơn, xúc xắc to, đầu nhân vật lớn hơn thân).
  - **Độ trong trẻo và sạch sẽ:** Loại bỏ các texture vụn (nhiễu hạt, vân đá/gỗ chi tiết li ti) để tránh vỡ hạt (aliasing) trên màn hình độ phân giải cao của smartphone.

---

## 3. HỆ THỐNG MÀU SẮC & ÁNH SÁNG (PALETTE & LIGHTING)

### 3.1. Bảng màu chủ đạo (Global Palette)
Giao diện và môi trường 3D tuân thủ bảng màu tươi tắn, kích thích cảm xúc lạc quan, may mắn và thịnh vượng:

| Vai trò màu | Tên màu | Mã HEX | Ứng dụng |
| :--- | :--- | :--- | :--- |
| **Primary (Chủ đạo)** | Rich Emerald Green | `#00B894` | Nền bàn cờ, biểu tượng tiền thưởng, chiến thắng |
| **Secondary (Thứ cấp)** | Monopoly Azure Blue | `#0984E3` | Khung viền, màn hình chờ, hiệu ứng nước |
| **Accent Gold (Điểm nhấn)** | Fortune Gold | `#FDCB6E` / `#E17055` | Đồng xu, xí ngầu vàng, danh hiệu Tỷ Phú, nút CTA |
| **Danger / Alert** | Coral Red | `#D63031` | Cảnh báo phá sản, ô vào tù, trừ tiền |
| **Background / Space** | Cozy Pastel Cream & Sky | `#F8F9FA` / `#EBF2FA` | Không gian bao quanh bàn cờ (Tránh dùng màu đen tuyền) |

### 3.2. Màu sắc nhận diện 8 nhóm đất (Districts Color Code)
Để đảm bảo khả năng tiếp cận và nhận diện tức thì trên màn hình di động:
1. **Khu Nâu/Tím đất (Cấp thấp):** `#6C5CE7` (Iris Purple) & `#A29BFE`
2. **Khu Xanh biển nhạt:** `#74B9FF`
3. **Khu Hồng tím:** `#FD79A8`
4. **Khu Cam rực rỡ:** `#FF7675`
5. **Khu Đỏ thịnh vượng:** `#E84393`
6. **Khu Vàng kim:** `#FFEAA7`
7. **Khu Xanh lá cây:** `#55EFC4`
8. **Khu Xanh dương đậm (Đắt giá nhất):** `#2D3436` / `#0984E3`

### 3.3. Ánh sáng & Đổ bóng (Lighting Philosophy)
- **Three.js Lighting Setup:**
  - `DirectionalLight` (Warm Sunlight, `#FFF6E5`, cường độ 1.2): Tạo bóng đổ nhẹ nhàng, nổi khối đồ chơi.
  - `HemisphereLight` (Trời `#E0F2FE` / Đất `#F1F5F9`, cường độ 0.8): Cung cấp ánh sáng môi trường dịu nhẹ, không để vùng tối bị đen hoàn toàn.
  - `Baked Ambient Occlusion (AO):` Bóng tiếp xúc ở chân các công trình và quân cờ được nướng sẵn vào texture, tạo cảm giác đồ vật thực sự "nằm vững chãi" trên mặt bàn cờ.

---

## 4. QUY CHUẨN THIẾT KẾ MODEL 3D (3D ASSET SPECIFICATIONS)

Nhằm đảm bảo trải nghiệm 60 FPS trên trình duyệt Safari/Chrome của điện thoại tầm trung (iPhone 11 / Android chip Snapdragon 720G trở lên):

### 4.1. Ngân sách đa giác (Polygon Budget)
| Thành phần 3D | Giới hạn Poly (Triangles) | Định dạng File | Kích thước Texture |
| :--- | :--- | :--- | :--- |
| **Toàn bộ bàn cờ (40 ô)** | ~ 8.000 - 12.000 Tris | `.glb` (Draco/Meshopt) | 1x Atlas 2048x2048 |
| **Quân cờ nhân vật (Token)** | 800 - 1.200 Tris / Token | `.glb` | 1x Texture 512x512 |
| **Nhà cấp 1 - 2 - 3** | 200 - 450 Tris / Nhà | `.glb` (InstancedMesh) | Dùng chung Color Atlas |
| **Khách sạn / Landmark** | 600 - 1.000 Tris / Khối | `.glb` | Dùng chung Color Atlas |
| **Cặp Xúc xắc 3D** | 300 Tris / Viên (Cube bo góc) | `.glb` | PBR Nhựa bóng (512x512) |

### 4.2. Thiết kế chi tiết từng yếu tố
1. **Quân cờ đại diện (Tokens):**
   - Thiết kế 4 - 6 linh vật mang tính biểu tượng nhưng cách điệu ngộ nghĩnh:
     - 🚗 *Xe cổ điển màu đỏ candy:* Thân xe bóng bẩy, bánh xe tròn mập.
     - 🎩 *Chiếc mũ phớt vàng kim:* Đính dải nơ nhung tím sang trọng.
     - 🐕 *Chú cún Pug may mắn:* Đeo vòng cổ chuông vàng, biểu cảm hài hước.
     - 🚀 *Tên lửa không gian tí hon:* Đuôi lửa cách điệu hình giọt nước.
2. **Hệ thống Nhà và Landmark:**
   - **Nhà cấp 1 (Nhà gỗ nhỏ):** Tường trắng sữa, mái ngói đỏ cam, cửa sổ tròn ấm áp.
   - **Nhà cấp 2 (Biệt thự 2 tầng):** Thêm ban công nhỏ, chậu cây tí hon ở cửa.
   - **Nhà cấp 3 (Khu phức hợp mini):** Có gara ô tô hoặc sân thượng có mái che.
   - **Landmark (Khách sạn 5 sao):** Tháp kính pha lê cách điệu, đỉnh tháp có quả cầu vàng xoay nhẹ, hiệu ứng phát sáng lấp lánh (Emissive Glow).
3. **Bàn cờ trung tâm (Center Diorama):**
   - Không để khoảng trống vô vị giữa bàn cờ!
   - Khu vực giữa bàn cờ là một **tiểu cảnh công viên thành phố** thu nhỏ: Hồ phun nước có hiệu ứng sóng lăn tăn nhẹ, cây cối hình cầu cách điệu, tượng Vua Tỷ Phú bằng vàng đứng ở trung tâm.

---

## 5. ĐẶC TẢ KỸ THUẬT THREE.JS & TỐI ƯU HÓA WEBGL (TECH ART PIPELINE)

```
[ Blender / 3D Modeling ]
  ├── Modeling: Low-poly, beveled edges, no ngons
  ├── Baking: Cycles Engine nướng Diffuse + Ambient Occlusion (AO) vào UV2
  └── Export: GLTF / GLB với Draco Compression
          │
          ▼
[ Web Optimizer ]
  ├── Texture Compression: KTX2 / Basis Universal (GPU Texture Compression)
  └── Geometry Compression: Meshopt
          │
          ▼
[ Three.js Web Engine (Mobile & Desktop) ]
  ├── Material: MeshLambertMaterial / MeshCustomToonShader (Siêu nhẹ)
  ├── Instances: THREE.InstancedMesh (Gom hàng chục ngôi nhà thành 1 Draw Call)
  └── Device Pixel Ratio: Math.min(window.devicePixelRatio, 2)
```

### 5.1. Quy trình Nướng bóng (Baked Lighting Pipeline)
- Không sử dụng Screen Space Ambient Occlusion (SSAO) hay Real-time Shadows phân giải cao trên Three.js vì sẽ gây tụt FPS và nóng máy trên điện thoại.
- **Giải pháp:** Trong Blender, sử dụng Cycles để bake toàn bộ bóng đổ mềm và phản xạ màu (color bleeding) của bàn cờ vào một bản đồ Texture duy nhất.
- Khi tải vào Three.js, sử dụng `MeshBasicMaterial` hoặc `MeshLambertMaterial` với texture đã nướng bóng. Tải trọng GPU giảm tới 80%.

### 5.2. Tối ưu hóa Draw Calls bằng `THREE.InstancedMesh`
- Trong trận đấu có thể có tới 60 - 80 căn nhà được xây dựng trên khắp bàn cờ.
- Thay vì tạo 80 Mesh độc lập (gây ra 80 Draw Calls), hệ thống sử dụng `InstancedMesh` cho từng loại nhà:
  - 1 InstancedMesh cho tất cả Nhà cấp 1.
  - 1 InstancedMesh cho tất cả Nhà cấp 2.
  - 1 InstancedMesh cho tất cả Landmark.
- **Kết quả:** Tổng số Draw Calls trong toàn bộ cảnh 3D luôn được duy trì **dưới 35 calls**, bảo đảm 60 FPS mượt mà tuyệt đối.

---

## 6. THIẾT KẾ GIAO DIỆN NGƯỜI DÙNG (UI/UX ART DIRECTION)

### 6.1. Phong cách UI: **Chunky Flat & Soft Neumorphism**
- Giao diện overlay không lấn át cảnh 3D mà hòa quyện tự nhiên như các món đồ chơi đặt trên bàn.
- **Nút bấm (Buttons):** Dạng viên thuốc mềm (Pill-shape), có bóng nổi 3D nhẹ ở chân nút (Drop shadow 3-4px), khi nhấn chuột hoặc chạm ngón tay sẽ có hiệu ứng nhấn xuống (Press down animation) chân thực.
- **Card & Bottom Sheet:** Bo tròn góc lớn (`rounded-2xl` hoặc `rounded-3xl`), viền sáng nhẹ, nền trắng mờ (Backdrop Blur / Glassmorphism nhẹ).

### 6.2. Bộ Font chữ (Typography)
- **Font tiêu đề, thông số tiền & Điểm số:** **Fredoka** hoặc **Baloo 2** (Google Fonts) – Nét tròn, đậm, vui nhộn, số hiển thị cực rõ ràng.
- **Font văn bản, điều khoản & chat:** **Quicksand** hoặc **Nunito** – Dễ đọc ở kích thước chữ nhỏ (12px - 14px) trên màn hình smartphone.

### 6.3. Hiệu ứng Hình ảnh (VFX & Juiciness)
Game tạo cảm giác "nghiện" thông qua các hiệu ứng thị giác thỏa mãn:
1. **Lắc xí ngầu:** Khi xúc xắc va chạm xuống bàn cờ, bàn cờ rung nhẹ một chút (Screen micro-shake), phát ra hạt bụi sao lấp lánh (Star particles).
2. **Mua đất & Xây nhà:** Nhà từ trên trời rơi xuống nhún nhảy nhẹ (Elastic bounce effect), kèm vòng sóng ánh sáng lan tỏa (Shockwave ring).
3. **Thu tiền phạt:** Tia đồng xu vàng (Gold coin trail) bay từ người vi phạm sang người thu tiền kèm hiệu ứng nảy số tiền `+500M` xanh lá / `-500M` đỏ rực.
4. **Phá sản (Bankrupt):** Hiệu ứng khói xám bốc lên tại các ô đất của người chơi bị thanh lý, avatar người chơi chuyển sang trắng đen với biểu cảm hài hước.

---

## 7. BẢNG CHECKLIST KIỂM ĐỊNH ĐỒ HỌA TRÊN THIẾT BỊ DI ĐỘNG

- [ ] Kích thước bundle 3D ban đầu (Initial 3D Payload) không vượt quá **5 MB** (sau khi nén GLB/KTX2).
- [ ] Thời gian tải cảnh 3D trên mạng 4G trung bình dưới **2.5 giây**.
- [ ] Đạt **60 FPS** liên tục trên thiết bị thử nghiệm tiêu chuẩn: iPhone 11 (iOS Safari) & Samsung Galaxy A52 (Android Chrome).
- [ ] Nhiệt độ máy không bị nóng sau 15 phút chơi liên tục (nhờ tối ưu Draw Calls và tắt dynamic lights không cần thiết).
- [ ] Text trên các ô cờ hiển thị sắc nét, không bị nhòe khi camera di chuyển theo quân cờ.
