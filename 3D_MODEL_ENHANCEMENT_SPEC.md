# TÀI LIỆU HƯỚNG DẪN NÂNG CẤP CHI TIẾT MODEL 3D (3D MODEL ENHANCEMENT SPECIFICATION)

> **Mục tiêu:** Nâng cấp toàn diện độ tinh xảo thị giác của các mô hình 3D tạo bằng mã nguồn (Procedural Three.js Models), khắc phục triệt để tình trạng sơ sài (cây cối trơn bóng như kẹo mút chưa có tán lá, đài phun nước dạng hình trụ đơn điệu), biến thế giới bàn cờ thành sa bàn nghệ thuật đạt chuẩn **High-Fidelity Stylized Diorama** (tương đương *Monopoly GO!* và *Animal Crossing*).  
> **Đối tượng sử dụng:** Dành riêng cho **AI (Gemini / Antigravity)** đọc hiểu, hình dung cấu trúc không gian và thực thi tái cấu trúc mã nguồn trong `DetailedModels.ts` và `BoardScene.ts`.

---

## 1. PHÂN TÍCH VẤN ĐỀ HIỆN TẠI & NGUYÊN TẮC THIẾT KẾ MỚI

### 1.1. Những điểm yếu cốt tử của model hiện tại
1. **Cây cối (Park Trees):**
   - *Hiện trạng:* Thân là ống trụ thẳng `CylinderGeometry`, tán lá chỉ là vài khối cầu tròn nhẵn `SphereGeometry` ghép lại. Nhìn từ xa giống cây kẹo mút tròn hoặc khối thịt viên, hoàn toàn không có cảm giác tán lá đung đưa, không có cành phân nhánh rõ ràng và không có tầng tán tự nhiên.
   - *Hậu quả:* Bàn cờ mất đi chất thiên nhiên, trông như đồ họa mẫu thử nghiệm (wireframe/primitive test).
2. **Đài phun nước (Center Fountain):**
   - *Hiện trạng:* Chỉ ghép 2 khối trụ đá và 1 hình vành xuyến `TorusGeometry` đơn giản. Màng nước chỉ là hình nón cụt đục mờ xoay tròn; không có vòi phun phụ, không có hoa văn điêu khắc, thiếu bọt nước chân thực.
   - *Hậu quả:* Tâm điểm của toàn bộ bàn cờ (nơi người chơi nhìn nhiều nhất) bị phẳng lì, thiếu điểm nhấn hoàng gia sang trọng.
3. **Các vật thể phụ cận (Nhà cửa, Đèn đường, Ô cờ):**
   - Thiếu chi tiết vi mô (Micro-details): Không có gờ phào chỉ, ngói xếp lớp, ánh đèn ấm tỏa ra từ cửa sổ ban đêm, hay vân đá lát vỉa hè.

### 1.2. 4 Nguyên tắc vàng nâng cấp mô hình cho AI (Gemini Directives)
- **Nguyên tắc 1 - Tán lá nhiều tầng có góc cạnh (Tiered Faceted Foliage):** Tuyệt đối không dùng `SphereGeometry` trơn nhẵn nguyên bản cho tán lá. Phải sử dụng **Icosahedron / Dodecahedron Geometry (với flatShading = true)** hoặc **Layered Cone-Frustum / Leaf Tuft Planes** để tạo diện khối mảng sáng tối rõ rệt như phim hoạt hình 3D của Pixar/Nintendo.
- **Nguyên tắc 2 - Hình khối hữu cơ tự nhiên (Organic Curves):** Thân cây, cành lá, vòi nước phải có độ cong uốn lượn tự nhiên bằng `CatmullRomCurve3` hoặc ghép các đoạn ống xoay nhẹ góc thay vì ống thẳng đơ.
- **Nguyên tắc 3 - Kiến trúc cổ điển có phân cấp (Architectural Profiling):** Mọi công trình đá hoa cương (đài phun nước, cột đèn) phải có ít nhất 3 thành phần: **Đế giật cấp (Plinth Base) -> Thân có rãnh (Fluted Column) -> Đầu cột uốn lượn (Capital & Crown)**.
- **Nguyên tắc 4 - Tương phản vật liệu (Material Contrast):** Kết hợp bề mặt đá nhám (`roughness: 0.6`) với kim loại đồng mạ vàng bóng (`metalness: 0.85, roughness: 0.15`) và nước trong suốt có phát sáng nhẹ (`emissiveIntensity: 0.3`).

---

## 2. BẢN VẼ SƠ ĐỒ KHÔNG GIAN CHO GEMINI (ASCII VISUAL SCHEMATICS)

Phần này giúp AI **"nhìn thấy"** cấu trúc hình học ba chiều trước khi viết code.

### 2.1. Sơ đồ Cây Cổ Thụ Công Viên Đa Tầng Tán (High-Detail Stylized Tree)

```
                       [Tán Đỉnh Chóp: Cụm nón lá bồng bềnh chuyển màu vàng-chanh]
                                      /\
                                     /  \
                                   ( *  * )
                  [Tầng Tán Giữa: 3 Cụm mây lá xòe rộng sang 2 bên]
                       /======\                /======\
                      (  ** ** )              (  ** ** )
                       \======/    [Thân]      \======/
                            \        ||        /
                             \       ||  [Cành phụ vươn lên]
                              \____  ||  ___/
                                   \ || /
                 [Tầng Tán Đáy: Mái vòm lá sẫm màu che bóng mát]
                   /======================================\
                  (   *   *   *    *   *   *   *   *   *   )
                   \======================================/
                                     ||
                                     || [Thân gỗ vặn xoắn gân guốc]
                                    //\\
                                   //  \\
                                  //    \\
            [Gốc Rễ Bạnh Cổ Thụ xòe 4 hướng cắm sâu vào mặt cỏ]
               ______/\_______/\______/\_______/\______
              /                                        \
             /   [Mô đất nổi] + [Cụm nấm tí hon & hoa dại] \
```

### 2.2. Sơ đồ Đài Phun Nước Hoàng Gia 3 Tầng (Baroque Royal Fountain)

```
                            /\  [Vương miện vàng phun cột nước chính]
                           |  |
                            \/
               ~~~~~~~~~~~~~||~~~~~~~~~~~~~ [Màn nước phun sủi bọt tung tóe]
                 \                        /
                  \   [Bát Tầng 2: Sen đá]/
                   \____________________/
                             ||   [Trụ đá hoa cương chạm nổi]
                 4 Vòi Cá Vàng Phun Tia Cong Vào Lòng Hồ
                     ><(((*>      <*)))><
               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ [Nước tràn tầng 1]
             /                                \
            /      [Bát Tầng 1: Đĩa đá viền hoa] \
           /____________________________________\
                             ||
                             ||   [Trụ đế lớn có 4 chân quỳ điêu khắc]
                            //\\
          ==================================================
         (  [Mặt nước hồ chính: Sen nổi, cá bơi, sóng gợn]  )
         (                                                  )
          ==================================================
            |                                            |
            | [Thành bể đá bát giác bo gờ tròn cổ điển]   |
          __|____________________________________________|__
         [ Bậc thềm đá hoa cương 2 bậc bao quanh đài phun ]
```

---

## 3. CÔNG THỨC DỰNG HÌNH THREE.JS CHI TIẾT (PROCEDURAL RECIPES)

### 3.1. Thiết kế Mô hình Cây Công Viên Cao Cấp (`createStylizedTree`)

#### A. Thân & Nhánh cây (Organic Trunk & Branches):
- **Gốc rễ (Roots):** Ghép 4 đoạn `CylinderGeometry` uốn nghiêng góc 30-45 độ, vuốt nhọn về phía chân đất để tạo rễ bạnh cổ thụ.
- **Thân cây chính:** Thay vì 1 khối trụ, dùng chuỗi 3 đoạn trụ nối tiếp nhau, mỗi đoạn xoay góc `z: 0.08` và `x: -0.05` nhẹ để thân cây có độ vặn xoắn tự nhiên (Twisted bark).
- **Vỏ cây sần sùi:** Dùng vật liệu `MeshStandardMaterial` màu nâu hạt dẻ đậm (`#5D3A1A`), `roughness: 0.85`, kết hợp `bumpMap` tạo bằng Canvas procedural vân gỗ.

#### B. Tán lá cách điệu phân tầng (Foliage Canopies):
- **Hình khối:** Dùng `IcosahedronGeometry(radius, 1)` với thuộc tính `flatShading: true`. Kỹ thuật này tạo các mặt phẳng đa giác (facets) bắt sáng cực đẹp theo phong cách Low-poly cao cấp.
- **Phân bố 3 tầng tán:**
  1. *Tầng Đáy (Shadow Layer):* 5 khối icosahedron dẹp ngang (`scale.set(1.4, 0.7, 1.4)`), màu xanh rêu đậm (`#006241`), tạo bóng đổ cho cây.
  2. *Tầng Giữa (Main Canopy):* 7 khối icosahedron bung tròn xòe sang các nhánh (`scale.set(1.1, 0.9, 1.1)`), màu xanh ngọc bích tươi sáng (`#00B894`).
  3. *Tầng Đỉnh (Sunlit Crown):* 3 khối icosahedron nhỏ tụ lại trên đỉnh, màu vàng chanh ấm (`#A8E6CF` hoặc `#F9CA24` điểm xuyết nắng chiều).
- **Điểm xuyết lá rơi & Hoa:** Thêm các khối tứ diện (`TetrahedronGeometry(0.06)`) màu hồng phấn (hoa anh đào) hoặc cam tươi phân tán trên bề mặt tán lá.

---

### 3.2. Thiết kế Đài Phun Nước Hoàng Gia 3 Tầng (`createDetailedFountain`)

#### A. Bậc thềm & Thành hồ bát giác (Octagonal Granite Basin):
- Dùng `CylinderGeometry(radiusTop: 4.2, radiusBottom: 4.5, height: 0.5, radialSegments: 8)` để tạo hình bát giác sang trọng thay vì hình tròn trơn tru.
- **Gờ đá bo tròn (Molding Edge):** 8 thanh gờ đá bo góc viền quanh miệng hồ bằng `RoundedBoxGeometry(3.3, 0.16, 0.28, 3, 0.04)` màu đá cẩm thạch trắng ngà (`#F1F2F6`, `roughness: 0.3`).

#### B. Vòi phun tượng điêu khắc (4 Ornate Spouts):
- Đặt 4 vòi phun cách điệu (hình đầu cá heo / sư tử mạ vàng) tại 4 góc thành bể, hướng miệng vào tâm.
- Tạo vòi phun bằng hợp khối: Đế vuông nhỏ + Đầu nón vàng + Ống kim loại vểnh lên.
- **Tia nước vòng cung:** Dùng `QuadraticBezierCurve3` kết hợp `TubeGeometry(curve, 16, 0.03, 8)` màu xanh cyan phát sáng mờ ảo (`color: '#A0E7E5', opacity: 0.7`) để mô phỏng dòng nước liên tục chảy từ 4 vòi vào lòng hồ.

#### C. Bát nước tầng 1 & tầng 2 cánh hoa sen (Lotus Carved Bowls):
- Thay vì khối trụ phẳng, tạo bát nước bằng `CylinderGeometry` có `openEnded: true` kết hợp các cánh sen điêu khắc xếp vòng cung quanh vành bát (12 cánh sen nổi 3D bằng nửa hình elip).

#### D. Hiệu ứng nước sống động (Water VFX):
- **Mặt hồ trung tâm:** Đĩa tròn `MeshStandardMaterial` màu ngọc bích (`color: '#0984E3', roughness: 0.02, metalness: 0.1, transparent: true, opacity: 0.85`).
- **Gợn sóng lăn tăn (Ripples):** 2 vòng tròn đồng tâm `RingGeometry` với texture sóng nước quay ngược chiều nhau trong vòng lặp `requestAnimationFrame`.
- **Bọt nước phun sương (Spray Particles):** Sử dụng hệ hạt `THREE.Points` với 150 hạt li ti, vận tốc phun từ đỉnh đài rơi xuống theo hình parabol trọng lực.

---

### 3.3. Thiết kế Cột Đèn Đường Cổ Điển London (`createStreetLamp`)

- **Đế đèn:** Đế vuông giật cấp bằng kim loại đúc đen nhám (`color: '#2F3542', roughness: 0.4, metalness: 0.8`).
- **Thân cột:** Ống côn cao có 4 gân nổi dọc thân và các đai sắt tròn thắt ngang.
- **Lồng đèn bát giác (Vintage Hex Lantern):**
  - Khung sắt lồng kính thu nhỏ dần về đáy.
  - Bên trong có **Bóng đèn dây tóc hoàng kim (Glowing Filament Bulb):** Khối cầu thủy tinh phát sáng mạnh (`emissive: '#FFB142', emissiveIntensity: 1.8`), kèm một nguồn sáng điểm nhỏ `PointLight('#FFB142', 0.8, 6)` tỏa ánh vàng ấm xuống vỉa hè ô cờ.

---

### 3.4. Thiết kế Nhà ở & Khách sạn Tí Hon (`BuildingMesh.ts`)

- **Nhà cấp 1 (Cozy Cottage):**
  - Tường nhà có gờ chân móng bằng gạch thẻ xám.
  - Cửa chính gỗ nâu bo cong phía trên, có tay nắm cửa đồng tròn tí hon.
  - Cửa sổ có khung chữ thập, kính phát sáng vàng ấm như đang có người ở bên trong.
  - Ống khói gạch đỏ nhô lên trên mái ngói, có khói sương bốc lên.
- **Khách sạn Landmark 5 Sao (Art Deco Palace):**
  - Tòa tháp giật 3 cấp vươn cao kiêu hãnh.
  - Sảnh đón có mái che lượn sóng và thảm đỏ trải trước cửa.
  - Sân thượng có hồ bơi vô cực mini và sân đáp trực thăng chữ `[ H ]` viền neon phát sáng.

---

## 4. BẢNG MÃ MÀU VẬT LIỆU CHUẨN PBR CHO MÔ HÌNH CHI TIẾT

| Tên Vật Liệu | Màu sắc Hex | Roughness | Metalness | Emissive / Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **Gỗ Thân Cây Cổ Thụ** | `#5D3A1A` | 0.85 | 0.02 | Nâu đất trầm, nhám cao, không lóa sáng |
| **Tán Lá Tầng Râm** | `#006241` | 0.55 | 0.00 | Xanh rêu đậm, tạo chiều sâu cho cây |
| **Tán Lá Tầng Nắng** | `#00B894` | 0.40 | 0.00 | Xanh ngọc bích tươi tắn, flatShading |
| **Lá Đỉnh / Hoa Điểm** | `#FDCB6E` / `#FF7675` | 0.30 | 0.00 | Điểm nhấn bắt mắt rực rỡ |
| **Đá Hoa Cương Đài Nước** | `#F1F2F6` | 0.32 | 0.08 | Trắng ngà cẩm thạch sang trọng |
| **Chân Đế Đá Cổ** | `#747D8C` | 0.50 | 0.15 | Xám đá bazan chịu lực vững chắc |
| **Vàng Hoàng Gia (Gold Accent)** | `#F1C40F` | 0.18 | 0.88 | `emissive: '#F1C40F', emissiveIntensity: 0.25` |
| **Nước Hồ Tự Nhiên** | `#0984E3` | 0.05 | 0.10 | `opacity: 0.88, transparent: true` |
| **Tia Nước & Bọt Sóng** | `#E0F2FE` | 0.10 | 0.00 | `opacity: 0.65, blending: THREE.AdditiveBlending` |

---

## 5. HƯỚNG DẪN HÀNH ĐỘNG CHO GEMINI (STEP-BY-STEP ACTION PLAN)

Khi thực hiện việc nâng cấp code, AI (Gemini) thực hiện theo trình tự sau:

1. **Bước 1: Cập nhật thư viện mô hình tại `client/src/three/DetailedModels.ts`:**
   - Thay thế toàn bộ hàm `createStylizedTree()` bằng kiến trúc **Thân xoắn gân guốc + 3 Tầng tán Icosahedron Faceted + Điểm xuyết hoa anh đào/trái chín**.
   - Tái cấu trúc hàm `createDetailedFountain()`: Thêm thành hồ bát giác giật cấp, 4 vòi phun cá heo mạ vàng, cánh hoa sen viền quanh bát tầng 1-2, và màng nước rơi đa tầng.
   - Thêm phương thức `createStreetLamp()`: Tạo cột đèn phố cổ điển phong cách Victoria với đèn phát sáng ấm.
   - Thêm phương thức `createParkBench()`: Ghế băng công viên bằng nan gỗ chân sắt uốn đặt dưới bóng cây.

2. **Bước 2: Cập nhật liên kết cảnh trong `client/src/three/BoardScene.ts`:**
   - Trong `setupCenterDiorama()`: Thay thế cây cũ bằng mô hình cây mới; bổ sung 2 ghế băng công viên cạnh đài phun nước; bổ sung hệ thống đèn đường rải rác quanh công viên.
   - Trong `animate()`: Đảm bảo tán cây đung đưa mềm mại theo nhịp gió (`Math.sin(elapsedTime * 1.5)`), các tia nước từ vòi cá heo có hiệu ứng lấp lánh, và sóng nước xoay tròn nhịp nhàng.

3. **Bước 3: Tối ưu hiệu năng & Build kiểm tra:**
   - Tận dụng chia sẻ `Material` giữa các lá và công trình tương đồng để không phát sinh khởi tạo vật liệu thừa.
   - Đảm bảo `castShadow` và `receiveShadow` chỉ bật trên các phần tử lớn (thân, tán đáy, thành hồ), tắt trên các chi tiết siêu nhỏ (hạt bọt nước, hoa lá con) để giữ vững 60 FPS trên mobile.
   - Chạy lệnh `npm run build` trong thư mục `client/` để kiểm tra không có lỗi TypeScript hay lỗi biên dịch Three.js.

---

## 6. TIÊU CHÍ NGHIỆM THU TRỰC QUAN (VISUAL ACCEPTANCE CRITERIA)

Sau khi AI triển khai xong code, kết quả hiển thị trên trình duyệt phải thỏa mãn các tiêu chí:
- [ ] **Cây xanh:** Nhìn thấy rõ các tán lá hình khối đa diện (faceted leaves) xếp lớp từ đậm tới nhạt, thân cây có rễ bạnh cắm vào cỏ, có cành vươn ra nâng đỡ tán lá.
- [ ] **Đài phun nước:** Có hình khối bát giác nguy nga, nhìn thấy 4 vòi phun phụ hướng vào tâm, có bọt sương tung lên ở đỉnh và màng nước trong suốt đổ từ tầng 2 xuống.
- [ ] **Tổng thể bàn cờ:** Tiểu cảnh trung tâm giống như một công viên hoàng gia thu nhỏ sống động, mang lại cảm giác thích thú và cao cấp khi người chơi điều khiển quân cờ chạy quanh.
