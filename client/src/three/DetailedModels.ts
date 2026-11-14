import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Thư viện các mô hình 3D giàu chi tiết, phong cách nghệ thuật High-Fidelity Stylized Diorama.
 * Tái hiện thế giới cờ tỷ phú Việt Nam lộng lẫy, thanh thoát và thoáng đãng.
 *
 * Cải tiến Decluttering & Visual Clarity:
 * - Thu gọn tỷ lệ các tiểu cảnh phụ (~15-20%) tạo khoảng thở (negative space) rộng rãi quanh công viên và ô cờ.
 * - Hỗ trợ chế độ tinh gọn / sa bàn thông qua `setDioramaVisibility(visible: boolean)`.
 * - Hệ thống Material Cache dùng chung tối ưu hóa GPU, đảm bảo 60-144 FPS mượt mà.
 */
export class DetailedModels {
  // =========================================================================
  // BỘ NHỚ ĐỆM VẬT LIỆU TỐI ƯU HÓA (Material Cache)
  // =========================================================================
  private static matCache = new Map<string, THREE.Material>();

  public static getMat<T extends THREE.Material>(key: string, factory: () => T): T {
    let mat = DetailedModels.matCache.get(key) as T;
    if (!mat) {
      mat = factory();
      DetailedModels.matCache.set(key, mat);
    }
    return mat;
  }

  public static clearMaterialCache(): void {
    DetailedModels.matCache.forEach(mat => mat.dispose());
    DetailedModels.matCache.clear();
  }

  // =========================================================================
  // QUẢN LÝ HIỂN THỊ TIỂU CẢNH SA BÀN (Diorama Visibility / Clean Focus Mode)
  // =========================================================================
  private static dioramaProps = new Set<THREE.Object3D>();

  public static registerDioramaProp<T extends THREE.Object3D>(prop: T): T {
    DetailedModels.dioramaProps.add(prop);
    prop.userData.isDioramaDecoration = true;
    return prop;
  }

  public static unregisterDioramaProp(prop: THREE.Object3D): void {
    DetailedModels.dioramaProps.delete(prop);
  }

  public static setDioramaVisibility(visible: boolean): void {
    DetailedModels.dioramaProps.forEach(prop => {
      if (prop) {
        prop.visible = visible;
      }
    });
  }

  public static getDioramaVisibility(): boolean {
    for (const prop of DetailedModels.dioramaProps) {
      return prop.visible;
    }
    return true;
  }

  // =========================================================================
  // 1. CÂY CỔ THỤ CÔNG VIÊN ĐA TẦNG TÁN (Faceted Foliage & Organic Twisted Bark)
  // =========================================================================
  public static createStylizedTree(): THREE.Group {
    const tree = new THREE.Group();

    // Vật liệu vỏ gỗ sần sùi PBR tông nâu hạt dẻ
    const trunkMat = DetailedModels.getMat('tree_trunk', () => new THREE.MeshStandardMaterial({
      color: '#5D3A1A',
      roughness: 0.85,
      metalness: 0.02
    }));

    // A. Gốc rễ bạnh cổ thụ xòe 4 hướng cắm sâu vào mặt cỏ
    const rootGeo = new THREE.CylinderGeometry(0.10, 0.18, 0.38, 8);
    const rootAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    rootAngles.forEach((angle, idx) => {
      const root = new THREE.Mesh(rootGeo, trunkMat);
      root.position.set(Math.cos(angle) * 0.22, 0.10, Math.sin(angle) * 0.22);
      root.rotation.z = Math.cos(angle) * 0.55;
      root.rotation.x = Math.sin(angle) * 0.55;
      root.rotation.y = angle + idx * 0.2;
      root.receiveShadow = true;
      tree.add(root);
    });

    // Mô đất tròn dẹp dưới gốc
    const moundMat = DetailedModels.getMat('tree_mound', () => new THREE.MeshStandardMaterial({
      color: '#27ae60',
      roughness: 0.7
    }));
    const mound = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.72, 0.10, 12), moundMat);
    mound.position.y = 0.05;
    mound.receiveShadow = true;
    tree.add(mound);

    // Cụm nấm tí hon xinh xắn dưới gốc rễ
    const shroomCapMat = DetailedModels.getMat('tree_shroom_cap', () => new THREE.MeshStandardMaterial({
      color: '#E84118',
      roughness: 0.3
    }));
    const shroomStemMat = DetailedModels.getMat('tree_shroom_stem', () => new THREE.MeshStandardMaterial({
      color: '#F5F6FA',
      roughness: 0.4
    }));
    const shroomPositions = [[0.32, 0.08, 0.24], [0.38, 0.07, 0.14], [-0.28, 0.08, -0.30]];
    shroomPositions.forEach(([sx, sy, sz]) => {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.10, 6), shroomStemMat);
      stem.position.set(sx, sy + 0.05, sz);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.075, 8), shroomCapMat);
      cap.position.set(sx, sy + 0.12, sz);
      tree.add(stem, cap);
    });

    // B. Thân cây chính gồm chuỗi 3 đoạn vặn xoắn gân guốc tự nhiên
    const trunkLower = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.28, 0.48, 10), trunkMat);
    trunkLower.position.y = 0.28;
    trunkLower.rotation.z = 0.04;
    trunkLower.rotation.x = -0.03;
    trunkLower.castShadow = true;

    const trunkMid = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.20, 0.55, 10), trunkMat);
    trunkMid.position.set(0.02, 0.72, -0.02);
    trunkMid.rotation.z = -0.08;
    trunkMid.rotation.x = 0.05;
    trunkMid.castShadow = true;

    const trunkUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 0.48, 10), trunkMat);
    trunkUpper.position.set(-0.02, 1.15, 0.02);
    trunkUpper.rotation.z = 0.06;
    trunkUpper.rotation.x = -0.04;
    trunkUpper.castShadow = true;

    tree.add(trunkLower, trunkMid, trunkUpper);

    // C. Cành phụ vươn lên nâng đỡ các khối tán lá
    const branch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.10, 0.44, 8), trunkMat);
    branch1.position.set(0.15, 1.0, 0.10);
    branch1.rotation.z = -Math.PI / 3.8;
    branch1.rotation.y = 0.4;
    branch1.castShadow = true;

    const branch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.38, 8), trunkMat);
    branch2.position.set(-0.13, 1.08, -0.08);
    branch2.rotation.z = Math.PI / 3.5;
    branch2.rotation.y = -0.5;
    branch2.castShadow = true;

    tree.add(branch1, branch2);

    // D. Tán lá cách điệu mềm mại đa tầng
    const shadowFoliageMat = DetailedModels.getMat('tree_foliage_shadow', () => new THREE.MeshStandardMaterial({
      color: '#005236',
      roughness: 0.45,
      metalness: 0.0
    }));

    const mainFoliageMat = DetailedModels.getMat('tree_foliage_main', () => new THREE.MeshStandardMaterial({
      color: '#00B894',
      roughness: 0.38,
      metalness: 0.0
    }));

    const sunlitFoliageMat = DetailedModels.getMat('tree_foliage_sunlit', () => new THREE.MeshStandardMaterial({
      color: '#55EFC4',
      roughness: 0.32,
      metalness: 0.0
    }));

    const foliageGroup = new THREE.Group();
    foliageGroup.position.y = 1.25;

    // 1. Tầng Đáy (5 khối dẹp)
    const bottomClusters = [
      { x: 0, y: 0.04, z: 0, r: 0.60, sx: 1.35, sy: 0.8, sz: 1.35 },
      { x: -0.32, y: -0.05, z: 0.20, r: 0.46, sx: 1.25, sy: 0.75, sz: 1.25 },
      { x: 0.29, y: -0.03, z: -0.25, r: 0.48, sx: 1.25, sy: 0.75, sz: 1.25 },
      { x: 0.23, y: -0.04, z: 0.26, r: 0.44, sx: 1.2, sy: 0.7, sz: 1.2 },
      { x: -0.26, y: -0.02, z: -0.23, r: 0.45, sx: 1.25, sy: 0.75, sz: 1.25 }
    ];
    bottomClusters.forEach(c => {
      const geo = new THREE.SphereGeometry(c.r, 16, 12);
      const mesh = new THREE.Mesh(geo, shadowFoliageMat);
      mesh.scale.set(c.sx, c.sy, c.sz);
      mesh.position.set(c.x, c.y, c.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      foliageGroup.add(mesh);
    });

    // 2. Tầng Giữa (7 khối bung tròn)
    const midClusters = [
      { x: 0, y: 0.38, z: 0, r: 0.62, sx: 1.15, sy: 0.95, sz: 1.15 },
      { x: 0.35, y: 0.32, z: 0.16, r: 0.48, sx: 1.1, sy: 0.9, sz: 1.1 },
      { x: -0.33, y: 0.29, z: -0.18, r: 0.50, sx: 1.15, sy: 0.9, sz: 1.15 },
      { x: -0.26, y: 0.33, z: 0.29, r: 0.45, sx: 1.1, sy: 0.9, sz: 1.1 },
      { x: 0.30, y: 0.35, z: -0.26, r: 0.46, sx: 1.1, sy: 0.9, sz: 1.1 },
      { x: 0.10, y: 0.42, z: 0.35, r: 0.42, sx: 1.05, sy: 0.85, sz: 1.05 },
      { x: -0.12, y: 0.40, z: -0.33, r: 0.43, sx: 1.05, sy: 0.85, sz: 1.05 }
    ];
    midClusters.forEach(c => {
      const geo = new THREE.SphereGeometry(c.r, 16, 12);
      const mesh = new THREE.Mesh(geo, mainFoliageMat);
      mesh.scale.set(c.sx, c.sy, c.sz);
      mesh.position.set(c.x, c.y, c.z);
      mesh.castShadow = true;
      foliageGroup.add(mesh);
    });

    // 3. Tầng Đỉnh (3 khối tròn)
    const topClusters = [
      { x: 0.02, y: 0.74, z: 0.02, r: 0.46, sx: 1.05, sy: 0.95, sz: 1.05 },
      { x: -0.15, y: 0.68, z: 0.10, r: 0.35, sx: 1.0, sy: 0.9, sz: 1.0 },
      { x: 0.13, y: 0.70, z: -0.12, r: 0.36, sx: 1.0, sy: 0.9, sz: 1.0 }
    ];
    topClusters.forEach(c => {
      const geo = new THREE.SphereGeometry(c.r, 14, 10);
      const mesh = new THREE.Mesh(geo, sunlitFoliageMat);
      mesh.scale.set(c.sx, c.sy, c.sz);
      mesh.position.set(c.x, c.y, c.z);
      mesh.castShadow = true;
      foliageGroup.add(mesh);
    });

    // E. Hoa đào & quả chín rực rỡ lấp ló trên tán lá
    const blossomMat = DetailedModels.getMat('tree_blossom', () => new THREE.MeshStandardMaterial({
      color: '#FF7675',
      roughness: 0.25,
      emissive: '#FF7675',
      emissiveIntensity: 0.25
    }));
    const fruitGoldMat = DetailedModels.getMat('tree_fruit_gold', () => new THREE.MeshStandardMaterial({
      color: '#FDCB6E',
      roughness: 0.2,
      emissive: '#FDCB6E',
      emissiveIntensity: 0.25
    }));

    const accentOffsets = [
      { pos: [-0.40, 0.33, 0.20], mat: blossomMat },
      { pos: [0.38, 0.29, -0.23], mat: fruitGoldMat },
      { pos: [-0.18, 0.60, 0.31], mat: blossomMat },
      { pos: [0.31, 0.54, 0.20], mat: fruitGoldMat },
      { pos: [0.12, 0.73, -0.25], mat: blossomMat }
    ];
    const tetraGeo = new THREE.TetrahedronGeometry(0.065);
    accentOffsets.forEach(({ pos, mat }) => {
      const accent = new THREE.Mesh(tetraGeo, mat);
      accent.position.set(pos[0], pos[1], pos[2]);
      accent.rotation.set(0.4, 0.8, 0.2);
      foliageGroup.add(accent);
    });

    tree.add(foliageGroup);
    return DetailedModels.registerDioramaProp(tree);
  }

  // =========================================================================
  // 2. ĐÀI PHUN NƯỚC HOÀNG GIA ĐA TẦNG (Decluttered Grand Baroque Fountain)
  // Bán kính đáy thu gọn ~20% (từ 2.84 về ~2.26) tạo khoảng thở thoáng đãng,
  // Chiều cao giữ nguyên >= 3.0 m theo chuẩn đặc tả mỹ thuật.
  // =========================================================================
  public static createDetailedFountain(): {
    group: THREE.Group;
    waterRipples: THREE.Mesh;
    waterFalls: THREE.Mesh[];
    waterJets: THREE.Mesh[];
    gemOrb?: THREE.Mesh;
  } {
    const group = new THREE.Group();
    const waterFalls: THREE.Mesh[] = [];
    const waterJets: THREE.Mesh[] = [];

    // --- BẢNG VẬT LIỆU CAO CẤP DÙNG CHUNG ---
    const marbleWhiteMat = DetailedModels.getMat('fountain_marble_white', () => new THREE.MeshStandardMaterial({
      color: '#F8F9FA',
      roughness: 0.24,
      metalness: 0.06
    }));

    const basaltMat = DetailedModels.getMat('fountain_basalt', () => new THREE.MeshStandardMaterial({
      color: '#2C3E50',
      roughness: 0.48,
      metalness: 0.18
    }));

    const goldOrnamentMat = DetailedModels.getMat('fountain_gold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F1C40F',
      emissiveIntensity: 0.35,
      metalness: 0.92,
      roughness: 0.14
    }));

    const mosaicMat = DetailedModels.getMat('fountain_mosaic', () => new THREE.MeshStandardMaterial({
      color: '#0A3D62',
      roughness: 0.25,
      metalness: 0.12
    }));

    const poolWaterMat = DetailedModels.getMat('fountain_pool_water', () => new THREE.MeshStandardMaterial({
      color: '#00A8FF',
      emissive: '#00CEC9',
      emissiveIntensity: 0.38,
      transparent: true,
      opacity: 0.82,
      roughness: 0.05,
      metalness: 0.12
    }));

    const cascadeMat = DetailedModels.getMat('fountain_cascade', () => new THREE.MeshStandardMaterial({
      color: '#74B9FF',
      emissive: '#E0F2FE',
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.58,
      side: THREE.DoubleSide,
      roughness: 0.1
    }));

    const waterJetMat = DetailedModels.getMat('fountain_water_jet', () => new THREE.MeshStandardMaterial({
      color: '#81ECEC',
      emissive: '#E0F2FE',
      emissiveIntensity: 0.80,
      transparent: true,
      opacity: 0.82,
      roughness: 0.08
    }));

    const foamMat = DetailedModels.getMat('fountain_foam', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      emissive: '#E0F2FE',
      emissiveIntensity: 0.50,
      transparent: true,
      opacity: 0.72,
      roughness: 0.3
    }));

    const diamondMat = DetailedModels.getMat('fountain_diamond', () => new THREE.MeshStandardMaterial({
      color: '#00CEC9',
      emissive: '#00CEC9',
      emissiveIntensity: 1.45,
      roughness: 0.05,
      metalness: 0.1
    }));

    const royalCapeMat = DetailedModels.getMat('fountain_royal_cape', () => new THREE.MeshStandardMaterial({
      color: '#C0392B',
      roughness: 0.65,
      side: THREE.DoubleSide
    }));

    // =======================================================================
    // A. BẬC THỀM ĐÁ HOA CƯƠNG & BỂ BÁT GIÁC (Decluttered Octagonal Plinth)
    // Bán kính đáy thu gọn về ~2.26 (tạo khoảng thở 1.0m+ tới vỉa hè công viên)
    // =======================================================================
    const step1 = new THREE.Mesh(new THREE.CylinderGeometry(2.18, 2.26, 0.08, 8), basaltMat);
    step1.position.y = 0.04;
    step1.receiveShadow = true;

    const step2 = new THREE.Mesh(new THREE.CylinderGeometry(1.97, 2.05, 0.10, 8), marbleWhiteMat);
    step2.position.y = 0.13;
    step2.receiveShadow = true;

    const step3 = new THREE.Mesh(new THREE.CylinderGeometry(1.81, 1.87, 0.08, 8), marbleWhiteMat);
    step3.position.y = 0.22;
    step3.receiveShadow = true;

    group.add(step1, step2, step3);

    // Thành bể đá bát giác nguy nga
    const octBasin = new THREE.Mesh(new THREE.CylinderGeometry(1.70, 1.78, 0.40, 8), marbleWhiteMat);
    octBasin.position.y = 0.44;
    octBasin.receiveShadow = true;
    octBasin.castShadow = true;
    group.add(octBasin);

    // 8 Cột trụ gờ đá (Pilasters) tại 8 đỉnh góc của bể bát giác với đỉnh mạ vàng
    const pilasterGeo = new RoundedBoxGeometry(0.10, 0.44, 0.10, 2, 0.02);
    const pilasterCapitalGeo = new RoundedBoxGeometry(0.13, 0.08, 0.13, 2, 0.02);
    for (let p = 0; p < 8; p++) {
      const pAngle = (p / 8) * Math.PI * 2;
      const pilaster = new THREE.Mesh(pilasterGeo, marbleWhiteMat);
      pilaster.position.set(Math.cos(pAngle) * 1.76, 0.44, Math.sin(pAngle) * 1.76);
      pilaster.rotation.y = -pAngle;

      const pCap = new THREE.Mesh(pilasterCapitalGeo, goldOrnamentMat);
      pCap.position.set(Math.cos(pAngle) * 1.76, 0.66, Math.sin(pAngle) * 1.76);
      pCap.rotation.y = -pAngle;

      group.add(pilaster, pCap);
    }

    // 8 Thanh gờ đá bo viền phào chỉ và nẹp chỉ mạ vàng
    const basinSideLen = 1.70 * Math.tan(Math.PI / 8) * 2;
    for (let s = 0; s < 8; s++) {
      const angle = (s / 8) * Math.PI * 2 + Math.PI / 8;
      const molding = new THREE.Mesh(
        new RoundedBoxGeometry(basinSideLen * 0.98, 0.10, 0.18, 2, 0.02),
        marbleWhiteMat
      );
      const dist = 1.66;
      molding.position.set(Math.cos(angle) * dist, 0.65, Math.sin(angle) * dist);
      molding.rotation.y = -angle + Math.PI / 2;

      const goldTrim = new THREE.Mesh(
        new THREE.BoxGeometry(basinSideLen * 0.95, 0.02, 0.025),
        goldOrnamentMat
      );
      goldTrim.position.set(Math.cos(angle) * (dist + 0.08), 0.65, Math.sin(angle) * (dist + 0.08));
      goldTrim.rotation.y = -angle + Math.PI / 2;

      group.add(molding, goldTrim);
    }

    // =======================================================================
    // B. TIỂU CẢNH THẢM HOA & HÀNG RÀO CẮT TỈA (Decluttered Surrounding Flora)
    // Bố trí thanh lịch tại bán kính ~2.08, gắn cờ `isDioramaDecoration`
    // =======================================================================
    const hedgeMat = DetailedModels.getMat('fountain_hedge', () => new THREE.MeshStandardMaterial({
      color: '#1B8A5A',
      roughness: 0.5,
      metalness: 0.02
    }));
    const flowerRedMat = DetailedModels.getMat('fountain_flower_red', () => new THREE.MeshStandardMaterial({
      color: '#E74C3C',
      roughness: 0.3,
      emissive: '#E74C3C',
      emissiveIntensity: 0.2
    }));
    const flowerGoldMat = DetailedModels.getMat('fountain_flower_gold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      roughness: 0.3,
      emissive: '#F1C40F',
      emissiveIntensity: 0.2
    }));

    const floraGroup = new THREE.Group();
    floraGroup.userData.isDioramaDecoration = true;

    for (let h = 0; h < 8; h++) {
      const hAngle = (h / 8) * Math.PI * 2 + Math.PI / 8;
      const hedgeSub = new THREE.Group();
      hedgeSub.position.set(Math.cos(hAngle) * 2.08, 0.10, Math.sin(hAngle) * 2.08);
      hedgeSub.rotation.y = -hAngle + Math.PI / 2;

      const hedgeMesh = new THREE.Mesh(
        new RoundedBoxGeometry(0.55, 0.10, 0.14, 2, 0.03),
        hedgeMat
      );
      hedgeMesh.castShadow = true;
      hedgeMesh.receiveShadow = true;
      hedgeSub.add(hedgeMesh);

      const flGeo = new THREE.SphereGeometry(0.032, 6, 6);
      for (let fi = -0.18; fi <= 0.18; fi += 0.18) {
        const flMesh = new THREE.Mesh(flGeo, (h + (fi > 0 ? 1 : 0)) % 2 === 0 ? flowerRedMat : flowerGoldMat);
        flMesh.position.set(fi, 0.07, 0.02);
        hedgeSub.add(flMesh);
      }
      floraGroup.add(hedgeSub);
    }
    group.add(floraGroup);
    DetailedModels.registerDioramaProp(floraGroup);

    // =======================================================================
    // C. LÒNG HỒ CHÍNH, ĐÁY MOSAIC, KHO VÀNG & ĐÈN RỌI (Pond Interior)
    // =======================================================================
    const floorGeo = new THREE.CylinderGeometry(1.60, 1.60, 0.04, 24);
    const floorMesh = new THREE.Mesh(floorGeo, mosaicMat);
    floorMesh.position.y = 0.24;
    floorMesh.receiveShadow = true;
    group.add(floorMesh);

    // Họa tiết hoa gió la bàn mosaic trung tâm dưới đáy hồ
    for (let c = 0; c < 8; c++) {
      const cAngle = (c / 8) * Math.PI * 2;
      const ray = new THREE.Mesh(
        new THREE.BoxGeometry(0.10, 0.045, 1.12),
        c % 2 === 0 ? marbleWhiteMat : goldOrnamentMat
      );
      ray.position.set(Math.cos(cAngle) * 0.68, 0.245, Math.sin(cAngle) * 0.68);
      ray.rotation.y = -cAngle;
      group.add(ray);
    }

    // 28 Đồng tiền vàng may mắn rơi rải rác dưới đáy hồ trong suốt
    const coinGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.010, 8);
    for (let i = 0; i < 28; i++) {
      const coinAngle = (i * 0.45) % (Math.PI * 2);
      const coinDist = 0.60 + (i * 0.032) % 0.92;
      const coin = new THREE.Mesh(coinGeo, goldOrnamentMat);
      coin.position.set(
        Math.cos(coinAngle) * coinDist,
        0.265 + (i % 2) * 0.008,
        Math.sin(coinAngle) * coinDist
      );
      coin.rotation.x = ((i % 5) - 2) * 0.05;
      coin.rotation.z = ((i % 3) - 1) * 0.05;
      group.add(coin);
    }

    // 8 Đèn rọi chìm dưới nước phát sáng lung linh huyền ảo
    for (let u = 0; u < 8; u++) {
      const uAngle = (u / 8) * Math.PI * 2 + Math.PI / 8;
      const uplightBase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.065, 0.035, 10), goldOrnamentMat);
      uplightBase.position.set(Math.cos(uAngle) * 1.20, 0.25, Math.sin(uAngle) * 1.20);
      const uplightLensMat = DetailedModels.getMat(`fountain_uplight_${u % 2}`, () => new THREE.MeshStandardMaterial({
        color: u % 2 === 0 ? '#00CEC9' : '#FFEAA7',
        emissive: u % 2 === 0 ? '#00CEC9' : '#FFEAA7',
        emissiveIntensity: 1.5
      }));
      const uplightLens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.036, 0.036, 0.018, 10),
        uplightLensMat
      );
      uplightLens.position.set(Math.cos(uAngle) * 1.20, 0.27, Math.sin(uAngle) * 1.20);
      group.add(uplightBase, uplightLens);
    }

    // Mặt nước hồ chính trong xanh màu ngọc bích
    const lowerWater = new THREE.Mesh(new THREE.CylinderGeometry(1.63, 1.63, 0.06, 24), poolWaterMat);
    lowerWater.position.y = 0.54;
    group.add(lowerWater);

    // Gợn sóng lăn tăn xoay tròn trên mặt nước (Vành sóng chính)
    const rippleGeo = new THREE.RingGeometry(0.56, 1.56, 32);
    const rippleMat = DetailedModels.getMat('fountain_ripples_mat', () => new THREE.MeshBasicMaterial({
      color: '#E0F2FE',
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide
    }));
    const ripples = new THREE.Mesh(rippleGeo, rippleMat);
    ripples.rotation.x = -Math.PI / 2;
    ripples.position.y = 0.555;
    group.add(ripples);

    // Vòng sóng phụ bên trong tạo hiệu ứng sóng đồng tâm giao thoa (Concentric Ripples)
    const innerRippleGeo = new THREE.RingGeometry(0.58, 1.08, 24);
    const innerRipples = new THREE.Mesh(innerRippleGeo, rippleMat);
    innerRipples.rotation.x = -Math.PI / 2;
    innerRipples.position.y = 0.556;
    group.add(innerRipples);

    // Vành sóng lan tỏa thứ ba sát chân thác
    const outerRippleGeo = new THREE.RingGeometry(1.12, 1.48, 24);
    const outerRipples = new THREE.Mesh(outerRippleGeo, rippleMat);
    outerRipples.rotation.x = -Math.PI / 2;
    outerRipples.position.y = 0.557;
    group.add(outerRipples);

    // 4 Cụm lá sen nổi bồng bềnh và hoa sen hồng nở thanh tao
    const lilyMat = DetailedModels.getMat('fountain_lily', () => new THREE.MeshStandardMaterial({
      color: '#00B894',
      roughness: 0.35
    }));
    const lotusMat = DetailedModels.getMat('fountain_lotus', () => new THREE.MeshStandardMaterial({
      color: '#FD79A8',
      roughness: 0.2,
      emissive: '#FD79A8',
      emissiveIntensity: 0.25
    }));
    const lotusGoldMat = DetailedModels.getMat('fountain_lotus_gold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      roughness: 0.2
    }));

    for (let l = 0; l < 4; l++) {
      const lAngle = (l / 4) * Math.PI * 2 + 0.42;
      const lx = Math.cos(lAngle) * 1.16;
      const lz = Math.sin(lAngle) * 1.16;

      const lily = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.012, 12), lilyMat);
      lily.position.set(lx, 0.55, lz);

      const lotusGroup = new THREE.Group();
      lotusGroup.position.set(lx, 0.57, lz);
      const centerPollen = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.032, 8), lotusGoldMat);
      lotusGroup.add(centerPollen);
      for (let p = 0; p < 6; p++) {
        const pAng = (p / 6) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 6), lotusMat);
        petal.scale.set(0.6, 1.2, 0.4);
        petal.position.set(Math.cos(pAng) * 0.04, 0.016, Math.sin(pAng) * 0.04);
        petal.rotation.y = -pAng;
        petal.rotation.x = 0.3;
        lotusGroup.add(petal);
      }
      group.add(lily, lotusGroup);
    }

    // =======================================================================
    // D. 8 VÒI PHUN ĐẦU SƯ TỬ MẠ VÀNG & TIA NƯỚC CẦU VỒNG (8 Ornate Spouts)
    // =======================================================================
    for (let s = 0; s < 8; s++) {
      const sAngle = (s / 8) * Math.PI * 2 + Math.PI / 8;
      const spoutGroup = new THREE.Group();
      spoutGroup.position.set(Math.cos(sAngle) * 1.65, 0.65, Math.sin(sAngle) * 1.65);
      spoutGroup.rotation.y = -sAngle - Math.PI / 2;

      const spBase = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.13, 0.11, 2, 0.02), goldOrnamentMat);
      const lionMane = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.08, 8), goldOrnamentMat);
      lionMane.rotation.x = Math.PI / 2;
      lionMane.position.z = 0.05;
      const lionSnout = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.065, 6), goldOrnamentMat);
      lionSnout.rotation.x = -Math.PI / 2;
      lionSnout.position.z = 0.10;

      spoutGroup.add(spBase, lionMane, lionSnout);
      group.add(spoutGroup);

      const startP = new THREE.Vector3(Math.cos(sAngle) * 1.56, 0.65, Math.sin(sAngle) * 1.56);
      const midP = new THREE.Vector3(Math.cos(sAngle) * 1.00, 1.00, Math.sin(sAngle) * 1.00);
      const endP = new THREE.Vector3(Math.cos(sAngle) * 0.52, 0.55, Math.sin(sAngle) * 0.52);

      const curve = new THREE.QuadraticBezierCurve3(startP, midP, endP);
      const jetGeo = new THREE.TubeGeometry(curve, 14, 0.024, 6, false);
      const jetMesh = new THREE.Mesh(jetGeo, waterJetMat);
      group.add(jetMesh);
      waterJets.push(jetMesh);
    }

    // =======================================================================
    // E. TRỤ ĐÀI PHUN NƯỚC HY LẠP & BÁT NƯỚC TẦNG 1 (Tier 1 Lotus Bowl)
    // =======================================================================
    const basePedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.68, 0.45, 16), marbleWhiteMat);
    basePedestal.position.y = 0.45;
    group.add(basePedestal);

    for (let c = 0; c < 4; c++) {
      const cAngle = (c / 4) * Math.PI * 2 + Math.PI / 4;
      const leg = new THREE.Mesh(new RoundedBoxGeometry(0.13, 0.42, 0.26, 2, 0.03), marbleWhiteMat);
      leg.position.set(Math.cos(cAngle) * 0.52, 0.50, Math.sin(cAngle) * 0.52);
      leg.rotation.y = -cAngle;

      const legGoldFinial = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), goldOrnamentMat);
      legGoldFinial.position.set(Math.cos(cAngle) * 0.62, 0.68, Math.sin(cAngle) * 0.62);

      group.add(leg, legGoldFinial);
    }

    const stem1 = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.43, 0.50, 16), marbleWhiteMat);
    stem1.position.y = 0.90;
    const stem1Ring = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.024, 8, 20), goldOrnamentMat);
    stem1Ring.rotation.x = Math.PI / 2;
    stem1Ring.position.y = 0.85;
    group.add(stem1, stem1Ring);

    // BÁT NƯỚC TẦNG 1
    const bowl1 = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 0.62, 0.28, 24), marbleWhiteMat);
    bowl1.position.y = 1.20;
    bowl1.castShadow = true;
    group.add(bowl1);

    // 16 Cánh sen nổi xếp quanh vành bát tầng 1
    const petalGeo = new RoundedBoxGeometry(0.18, 0.065, 0.14, 2, 0.02);
    for (let p = 0; p < 16; p++) {
      const pAngle = (p / 16) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, marbleWhiteMat);
      petal.position.set(Math.cos(pAngle) * 0.98, 1.28, Math.sin(pAngle) * 0.98);
      petal.rotation.y = -pAngle;
      petal.rotation.z = 0.18;

      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), goldOrnamentMat);
      bead.position.set(Math.cos(pAngle) * 1.03, 1.31, Math.sin(pAngle) * 1.03);

      group.add(petal, bead);
    }

    const waterTier1 = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.96, 0.04, 20), poolWaterMat);
    waterTier1.position.y = 1.30;
    group.add(waterTier1);

    for (let sp = 0; sp < 4; sp++) {
      const spAng = (sp / 4) * Math.PI * 2;
      const miniSpout = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.11, 8), goldOrnamentMat);
      miniSpout.position.set(Math.cos(spAng) * 0.66, 1.36, Math.sin(spAng) * 0.66);
      miniSpout.rotation.z = -0.3;
      miniSpout.rotation.y = -spAng;
      group.add(miniSpout);

      const miniJet = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.028, 0.32, 8), waterJetMat);
      miniJet.position.set(Math.cos(spAng) * 0.66, 1.50, Math.sin(spAng) * 0.66);
      group.add(miniJet);
      waterJets.push(miniJet);
    }

    const cascade1Geo = new THREE.CylinderGeometry(0.99, 1.34, 0.68, 24, 1, true);
    const cascade1 = new THREE.Mesh(cascade1Geo, cascadeMat);
    cascade1.position.y = 0.90;
    group.add(cascade1);
    waterFalls.push(cascade1);

    const foam1 = new THREE.Mesh(new THREE.TorusGeometry(1.31, 0.036, 8, 24), foamMat);
    foam1.rotation.x = Math.PI / 2;
    foam1.position.y = 0.56;
    group.add(foam1);
    waterFalls.push(foam1);

    // =======================================================================
    // F. TRỤ THÂN TẦNG 2 & BÁT NƯỚC TẦNG 2 (Tier 2 Chalice Bowl)
    // =======================================================================
    const stem2 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.29, 0.48, 16), marbleWhiteMat);
    stem2.position.y = 1.55;
    const stem2Ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.020, 8, 16), goldOrnamentMat);
    stem2Ring.rotation.x = Math.PI / 2;
    stem2Ring.position.y = 1.50;
    group.add(stem2, stem2Ring);

    const bowl2 = new THREE.Mesh(new THREE.CylinderGeometry(0.59, 0.35, 0.22, 20), marbleWhiteMat);
    bowl2.position.y = 1.84;
    bowl2.castShadow = true;
    group.add(bowl2);

    for (let p = 0; p < 12; p++) {
      const pAngle = (p / 12) * Math.PI * 2;
      const bead2 = new THREE.Mesh(new THREE.SphereGeometry(0.019, 6, 6), goldOrnamentMat);
      bead2.position.set(Math.cos(pAngle) * 0.59, 1.93, Math.sin(pAngle) * 0.59);
      group.add(bead2);
    }

    const waterTier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.04, 16), poolWaterMat);
    waterTier2.position.y = 1.92;
    group.add(waterTier2);

    const cascade2Geo = new THREE.CylinderGeometry(0.56, 0.77, 0.54, 20, 1, true);
    const cascade2 = new THREE.Mesh(cascade2Geo, cascadeMat);
    cascade2.position.y = 1.55;
    group.add(cascade2);
    waterFalls.push(cascade2);

    const foam2 = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.028, 8, 20), foamMat);
    foam2.rotation.x = Math.PI / 2;
    foam2.position.y = 1.32;
    group.add(foam2);
    waterFalls.push(foam2);

    // =======================================================================
    // G. TƯỢNG ĐÀI ĐỈNH CAO: THẦN TÀI PHÚ QUÝ (Golden Monopolist Sovereign)
    // =======================================================================
    const statuePlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.20, 12), marbleWhiteMat);
    statuePlinth.position.y = 2.04;
    const plinthGoldRing = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.016, 8, 16), goldOrnamentMat);
    plinthGoldRing.rotation.x = Math.PI / 2;
    plinthGoldRing.position.y = 2.12;
    group.add(statuePlinth, plinthGoldRing);

    const bootsGeo = new RoundedBoxGeometry(0.15, 0.10, 0.11, 2, 0.02);
    const boots = new THREE.Mesh(bootsGeo, goldOrnamentMat);
    boots.position.y = 2.20;

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.28, 12), goldOrnamentMat);
    torso.position.y = 2.40;
    torso.castShadow = true;

    const cape = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.38, 0.05, 2, 0.02), royalCapeMat);
    cape.position.set(0, 2.34, -0.09);
    cape.rotation.x = -0.16;

    const capeTrim = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.02, 0.06), goldOrnamentMat);
    capeTrim.position.set(0, 2.16, -0.11);
    group.add(boots, torso, cape, capeTrim);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), goldOrnamentMat);
    head.position.y = 2.60;

    const stacheL = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.05, 6), goldOrnamentMat);
    stacheL.rotation.z = Math.PI / 2.5;
    stacheL.position.set(0.032, 2.57, 0.065);
    const stacheR = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.05, 6), goldOrnamentMat);
    stacheR.rotation.z = -Math.PI / 2.5;
    stacheR.position.set(-0.032, 2.57, 0.065);

    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.020, 12), goldOrnamentMat);
    hatBrim.position.y = 2.68;
    const hatRibbon = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.074, 0.024, 12), royalCapeMat);
    hatRibbon.position.y = 2.71;
    const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.14, 12), goldOrnamentMat);
    hatCrown.position.y = 2.78;

    group.add(head, stacheL, stacheR, hatBrim, hatRibbon, hatCrown);

    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.22, 8), goldOrnamentMat);
    horn.rotation.z = -Math.PI / 3;
    horn.rotation.x = 0.3;
    horn.position.set(-0.13, 2.38, 0.05);
    group.add(horn);

    for (let c = 0; c < 6; c++) {
      const dropCoin = new THREE.Mesh(coinGeo, goldOrnamentMat);
      dropCoin.position.set(-0.18 - c * 0.016, 2.28 - c * 0.05, 0.06 + (c % 2) * 0.016);
      dropCoin.rotation.x = c * 0.6;
      group.add(dropCoin);
    }

    const scepter = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.44, 8), goldOrnamentMat);
    scepter.position.set(0.15, 2.48, 0.05);
    scepter.rotation.z = -0.15;

    const gemOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.052, 0), diamondMat);
    gemOrb.position.set(0.17, 2.72, 0.05);
    group.add(scepter, gemOrb);

    // =======================================================================
    // H. CỘT NƯỚC CAO VÚT TẬN TRỜ XANH (Grand Summit Geyser Jet)
    // ĐẶT Ở VỊ TRÍ CUỐI CÙNG TRONG MẢNG waterJets ĐỂ BoardEnvironment ĐỒNG BỘ
    // =======================================================================
    const geyser = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.07, 1.15, 12),
      waterJetMat
    );
    geyser.position.set(0, 3.32, 0);
    group.add(geyser);
    waterJets.push(geyser);

    return {
      group,
      waterRipples: ripples,
      waterFalls,
      waterJets,
      gemOrb
    };
  }

  // =========================================================================
  // 3. CỘT ĐÈN ĐƯỜNG CỔ ĐIỂN VICTORIAN (Decluttered Slender Lantern Post)
  // Thu gọn tỷ lệ ~18% giúp tầm nhìn bàn cờ thông thoáng, không che khuất ô cờ
  // =========================================================================
  public static createStreetLamp(): THREE.Group {
    const lamp = new THREE.Group();

    const ironMat = DetailedModels.getMat('lamp_iron', () => new THREE.MeshStandardMaterial({
      color: '#2F3542',
      roughness: 0.42,
      metalness: 0.82
    }));
    const goldMat = DetailedModels.getMat('lamp_gold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      metalness: 0.85,
      roughness: 0.2
    }));
    const glassMat = DetailedModels.getMat('lamp_glass', () => new THREE.MeshStandardMaterial({
      color: '#FFF275',
      emissive: '#FFB142',
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.85,
      roughness: 0.15
    }));
    const bulbMat = DetailedModels.getMat('lamp_bulb', () => new THREE.MeshBasicMaterial({
      color: '#FFFFFF'
    }));

    // A. Chân đế giật 3 cấp thanh thoát
    const basePlinth1 = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.10, 0.38, 2, 0.02), ironMat);
    basePlinth1.position.y = 0.05;
    const basePlinth2 = new THREE.Mesh(new RoundedBoxGeometry(0.30, 0.12, 0.30, 2, 0.02), ironMat);
    basePlinth2.position.y = 0.15;
    const basePlinth3 = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.08, 0.22, 2, 0.02), ironMat);
    basePlinth3.position.y = 0.24;
    lamp.add(basePlinth1, basePlinth2, basePlinth3);

    // B. Thân cột thon gọn
    const poleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.28, 10), ironMat);
    poleBase.position.y = 0.40;

    const poleRing = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.02, 8, 16), goldMat);
    poleRing.rotation.x = Math.PI / 2;
    poleRing.position.y = 0.58;

    const poleMain = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.08, 1.15, 10), ironMat);
    poleMain.position.y = 1.16;
    poleMain.castShadow = true;

    const poleTopRing = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 8, 16), goldMat);
    poleTopRing.rotation.x = Math.PI / 2;
    poleTopRing.position.y = 1.74;

    lamp.add(poleBase, poleRing, poleMain, poleTopRing);

    // C. Cần tay đòn uốn hoa văn
    const armGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.28, 8);
    const arm1 = new THREE.Mesh(armGeo, ironMat);
    arm1.position.set(0.10, 1.84, 0);
    arm1.rotation.z = -Math.PI / 3.5;

    const armScroll = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.016, 6, 12, Math.PI * 1.4), goldMat);
    armScroll.position.set(0.05, 1.76, 0);
    lamp.add(arm1, armScroll);

    // D. Lồng đèn lục giác thanh lịch
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(0.19, 1.95, 0);

    const lanternCap = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.15, 6), ironMat);
    lanternCap.position.y = 0.23;

    const lanternFinial = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), goldMat);
    lanternFinial.position.y = 0.33;

    const lanternGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.09, 0.26, 6), glassMat);
    lanternGlass.position.y = 0.07;
    lanternGlass.userData = { animType: 'flicker' };

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), bulbMat);
    bulb.position.y = 0.07;
    bulb.userData = { animType: 'flicker' };

    lanternGroup.add(lanternCap, lanternFinial, lanternGlass, bulb);
    lamp.add(lanternGroup);

    // E. Giỏ hoa treo nhỏ trang trí bên thân cột đèn
    const basketMat = DetailedModels.getMat('lamp_basket', () => new THREE.MeshStandardMaterial({
      color: '#5D3A1A',
      roughness: 0.7
    }));
    const flowerRed = DetailedModels.getMat('lamp_flower_red', () => new THREE.MeshStandardMaterial({
      color: '#EA2027',
      emissive: '#EA2027',
      emissiveIntensity: 0.3
    }));

    const basketArm = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.14, 6), ironMat);
    basketArm.position.set(-0.09, 1.50, 0);
    basketArm.rotation.z = Math.PI / 2;

    const basketPot = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.04, 0.08, 8), basketMat);
    basketPot.position.set(-0.16, 1.45, 0);

    const basketBloom = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), flowerRed);
    basketBloom.position.set(-0.16, 1.50, 0);

    lamp.add(basketArm, basketPot, basketBloom);

    return DetailedModels.registerDioramaProp(lamp);
  }

  // =========================================================================
  // 4. GHẾ BĂNG CÔNG VIÊN GỖ TUYẾT TÙNG (Decluttered Cedar Wood Bench)
  // Kích thước thu gọn ~18% (dài 0.84m) gọn gàng, tạo khoảng trống thoải mái
  // =========================================================================
  public static createParkBench(): THREE.Group {
    const bench = new THREE.Group();

    const woodMat = DetailedModels.getMat('bench_cedar_wood', () => new THREE.MeshStandardMaterial({
      color: '#A0522D',
      roughness: 0.50,
      metalness: 0.05
    }));
    const ironMat = DetailedModels.getMat('bench_cast_iron', () => new THREE.MeshStandardMaterial({
      color: '#2F3542',
      roughness: 0.35,
      metalness: 0.85
    }));
    const boltMat = DetailedModels.getMat('bench_brass_bolt', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      metalness: 0.9,
      roughness: 0.2
    }));

    const makeLeg = (lx: number, hasArm = true) => {
      const legGroup = new THREE.Group();
      legGroup.position.x = lx;

      const frontLeg = new THREE.Mesh(new RoundedBoxGeometry(0.035, 0.28, 0.04, 2, 0.01), ironMat);
      frontLeg.position.set(0, 0.14, 0.10);
      frontLeg.rotation.x = -0.12;

      const rearLeg = new THREE.Mesh(new RoundedBoxGeometry(0.035, 0.44, 0.04, 2, 0.01), ironMat);
      rearLeg.position.set(0, 0.22, -0.11);
      rearLeg.rotation.x = 0.15;

      const seatSupport = new THREE.Mesh(new RoundedBoxGeometry(0.035, 0.035, 0.28, 2, 0.01), ironMat);
      seatSupport.position.set(0, 0.18, 0.0);

      legGroup.add(frontLeg, rearLeg, seatSupport);

      if (hasArm) {
        const armRest = new THREE.Mesh(new RoundedBoxGeometry(0.035, 0.035, 0.26, 2, 0.01), ironMat);
        armRest.position.set(0, 0.29, 0.0);
        const armScroll = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.012, 6, 10, Math.PI * 1.3), ironMat);
        armScroll.position.set(0, 0.30, 0.13);
        legGroup.add(armRest, armScroll);
      }

      bench.add(legGroup);
    };

    makeLeg(-0.38, true);
    makeLeg(0.38, true);
    makeLeg(0.0, false);

    // 5 Thanh nan gỗ mặt ngồi vát cạnh
    const seatSlatGeo = new RoundedBoxGeometry(0.84, 0.026, 0.055, 2, 0.008);
    for (let s = 0; s < 5; s++) {
      const slat = new THREE.Mesh(seatSlatGeo, woodMat);
      slat.position.set(0, 0.20, -0.07 + s * 0.058);
      slat.castShadow = true;
      slat.receiveShadow = true;
      bench.add(slat);

      [-0.38, 0.38].forEach(bx => {
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.030, 6), boltMat);
        bolt.position.set(bx, 0.215, -0.07 + s * 0.058);
        bench.add(bolt);
      });
    }

    // 4 Thanh nan gỗ tựa lưng
    const backSlatGeo = new RoundedBoxGeometry(0.84, 0.026, 0.055, 2, 0.008);
    for (let b = 0; b < 4; b++) {
      const backSlat = new THREE.Mesh(backSlatGeo, woodMat);
      backSlat.position.set(0, 0.26 + b * 0.062, -0.10 - b * 0.018);
      backSlat.rotation.x = 0.18;
      backSlat.castShadow = true;
      bench.add(backSlat);

      [-0.38, 0.38].forEach(bx => {
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.030, 6), boltMat);
        bolt.position.set(bx, 0.27 + b * 0.062, -0.09 - b * 0.018);
        bolt.rotation.x = 0.18;
        bench.add(bolt);
      });
    }

    return DetailedModels.registerDioramaProp(bench);
  }

  // =========================================================================
  // 5. CHẬU ĐÁ HOA CƯƠNG VỚI CÂY CAU CẢNH NHIỆT ĐỚI (Decluttered Palm Planter)
  // =========================================================================
  public static createGranitePlanterPalm(): THREE.Group {
    const group = new THREE.Group();

    const graniteMat = DetailedModels.getMat('planter_granite', () => new THREE.MeshStandardMaterial({
      color: '#2C3E50',
      roughness: 0.22,
      metalness: 0.15
    }));
    const goldTrimMat = DetailedModels.getMat('planter_gold_trim', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      metalness: 0.88,
      roughness: 0.18
    }));
    const soilMat = DetailedModels.getMat('planter_soil', () => new THREE.MeshStandardMaterial({
      color: '#3D271D',
      roughness: 0.9
    }));
    const pebbleMat = DetailedModels.getMat('planter_pebble', () => new THREE.MeshStandardMaterial({
      color: '#ECEFF1',
      roughness: 0.3
    }));
    const palmBarkMat = DetailedModels.getMat('palm_bark', () => new THREE.MeshStandardMaterial({
      color: '#795548',
      roughness: 0.8
    }));
    const palmFrondMat = DetailedModels.getMat('palm_frond', () => new THREE.MeshStandardMaterial({
      color: '#2ECC71',
      roughness: 0.35,
      side: THREE.DoubleSide
    }));

    const pot = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.44, 0.58, 2, 0.04), graniteMat);
    pot.position.y = 0.22;
    pot.castShadow = true;
    pot.receiveShadow = true;

    const potRim = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.03, 0.62), goldTrimMat);
    potRim.position.y = 0.43;

    const soil = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.04, 0.52), soilMat);
    soil.position.y = 0.42;

    const pebbleCount = 8;
    for (let p = 0; p < pebbleCount; p++) {
      const pAngle = (p / pebbleCount) * Math.PI * 2;
      const pebble = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), pebbleMat);
      pebble.position.set(Math.cos(pAngle) * 0.18, 0.44, Math.sin(pAngle) * 0.18);
      group.add(pebble);
    }

    group.add(pot, potRim, soil);

    const trunkCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0.43, 0),
      new THREE.Vector3(0.03, 0.9, -0.02),
      new THREE.Vector3(-0.015, 1.35, 0.03)
    );
    const trunkGeo = new THREE.TubeGeometry(trunkCurve, 10, 0.052, 8, false);
    const trunkMesh = new THREE.Mesh(trunkGeo, palmBarkMat);
    trunkMesh.castShadow = true;
    group.add(trunkMesh);

    for (let r = 1; r <= 5; r++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.01, 6, 12), palmBarkMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 0.52 + r * 0.15, 0);
      group.add(ring);
    }

    const frondGroup = new THREE.Group();
    frondGroup.position.set(-0.015, 1.35, 0.03);

    for (let f = 0; f < 8; f++) {
      const fAngle = (f / 8) * Math.PI * 2;
      const frondStem = new THREE.Group();
      frondStem.rotation.y = fAngle;
      frondStem.rotation.z = 0.45 + (f % 2) * 0.15;

      const stemCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.28, 0.18, 0),
        new THREE.Vector3(0.58, 0.016, 0)
      );
      const stemTube = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 8, 0.012, 6, false), palmBarkMat);
      frondStem.add(stemTube);

      const leafMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.18), palmFrondMat);
      leafMesh.position.set(0.30, 0.10, 0);
      leafMesh.rotation.x = Math.PI / 2.3;
      frondStem.add(leafMesh);

      frondGroup.add(frondStem);
    }

    group.add(frondGroup);
    return DetailedModels.registerDioramaProp(group);
  }

  // =========================================================================
  // 6. CHẬU ĐÁ CÂY HOA PHƯỢNG VĨ ĐỎ RỰC (Decluttered Poinciana Planter)
  // =========================================================================
  public static createGranitePlanterPoinciana(): THREE.Group {
    const group = new THREE.Group();

    const graniteRedMat = DetailedModels.getMat('poinciana_granite', () => new THREE.MeshStandardMaterial({
      color: '#34495E',
      roughness: 0.25,
      metalness: 0.2
    }));
    const brassTrimMat = DetailedModels.getMat('poinciana_brass_trim', () => new THREE.MeshStandardMaterial({
      color: '#E67E22',
      metalness: 0.85,
      roughness: 0.2
    }));
    const soilMat = DetailedModels.getMat('planter_soil', () => new THREE.MeshStandardMaterial({
      color: '#3D271D',
      roughness: 0.9
    }));
    const barkMat = DetailedModels.getMat('poinciana_bark', () => new THREE.MeshStandardMaterial({
      color: '#4E342E',
      roughness: 0.85
    }));
    const foliageGreenMat = DetailedModels.getMat('poinciana_foliage', () => new THREE.MeshStandardMaterial({
      color: '#27AE60',
      roughness: 0.4
    }));
    const flowerRedMat = DetailedModels.getMat('poinciana_flower_red', () => new THREE.MeshStandardMaterial({
      color: '#FF3838',
      emissive: '#FF3838',
      emissiveIntensity: 0.42,
      roughness: 0.25
    }));
    const flowerScarletMat = DetailedModels.getMat('poinciana_flower_scarlet', () => new THREE.MeshStandardMaterial({
      color: '#EA2027',
      emissive: '#EA2027',
      emissiveIntensity: 0.48,
      roughness: 0.25
    }));

    const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, 0.36, 8), graniteRedMat);
    basin.position.y = 0.18;
    basin.castShadow = true;
    basin.receiveShadow = true;

    const basinRim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.03, 8), brassTrimMat);
    basinRim.position.y = 0.36;

    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.04, 8), soilMat);
    soil.position.y = 0.35;

    group.add(basin, basinRim, soil);

    const lowerTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.13, 0.38, 8), barkMat);
    lowerTrunk.position.y = 0.54;
    lowerTrunk.rotation.z = 0.08;

    const mainBranch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.09, 0.38, 8), barkMat);
    mainBranch1.position.set(0.10, 0.82, 0.05);
    mainBranch1.rotation.z = -0.38;

    const mainBranch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.36, 8), barkMat);
    mainBranch2.position.set(-0.08, 0.84, -0.03);
    mainBranch2.rotation.z = 0.42;

    group.add(lowerTrunk, mainBranch1, mainBranch2);

    const canopyGroup = new THREE.Group();
    canopyGroup.position.set(0, 1.02, 0);

    const foliagePlates = [
      { x: 0.19, y: 0.05, z: 0.10, r: 0.34 },
      { x: -0.18, y: 0.06, z: -0.08, r: 0.30 },
      { x: 0.02, y: 0.14, z: -0.14, r: 0.28 },
      { x: -0.04, y: 0.13, z: 0.16, r: 0.29 },
      { x: 0.0, y: 0.22, z: 0.0, r: 0.26 }
    ];

    foliagePlates.forEach(fp => {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(fp.r, fp.r * 1.1, 0.065, 10), foliageGreenMat);
      plate.position.set(fp.x, fp.y, fp.z);
      plate.castShadow = true;
      canopyGroup.add(plate);
    });

    const flowerPositions = [
      [0.22, 0.11, 0.13, flowerRedMat],
      [0.14, 0.13, 0.21, flowerScarletMat],
      [-0.20, 0.14, -0.06, flowerRedMat],
      [-0.12, 0.16, -0.18, flowerScarletMat],
      [0.06, 0.27, 0.03, flowerRedMat],
      [-0.05, 0.25, -0.06, flowerScarletMat]
    ];

    const flGeo = new THREE.DodecahedronGeometry(0.052, 0);
    flowerPositions.forEach(([fx, fy, fz, mat]) => {
      const flMesh = new THREE.Mesh(flGeo, mat as THREE.Material);
      flMesh.position.set(fx as number, fy as number, fz as number);
      canopyGroup.add(flMesh);
    });

    group.add(canopyGroup);

    const petalGeo = new THREE.CircleGeometry(0.018, 5);
    for (let p = 0; p < 6; p++) {
      const pAng = (p / 6) * Math.PI * 2 + 0.3;
      const petal = new THREE.Mesh(petalGeo, (p % 2 === 0 ? flowerRedMat : flowerScarletMat));
      petal.rotation.x = -Math.PI / 2;
      petal.position.set(Math.cos(pAng) * 0.28, 0.365, Math.sin(pAng) * 0.28);
      group.add(petal);
    }

    return DetailedModels.registerDioramaProp(group);
  }

  // =========================================================================
  // 7. LAN CAN ĐÁ BỜ KÈ NGOẠI VI BÀN CỜ (Perimeter Stone Retaining Wall)
  // =========================================================================
  public static createPerimeterRetainingWall(length = 2.4): THREE.Group {
    const wall = new THREE.Group();

    const stoneMat = DetailedModels.getMat('wall_stone', () => new THREE.MeshStandardMaterial({
      color: '#ECEFF1',
      roughness: 0.38,
      metalness: 0.05
    }));
    const stoneDarkMat = DetailedModels.getMat('wall_stone_dark', () => new THREE.MeshStandardMaterial({
      color: '#B0BEC5',
      roughness: 0.45,
      metalness: 0.08
    }));
    const goldCapMat = DetailedModels.getMat('wall_gold_cap', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      metalness: 0.88,
      roughness: 0.18
    }));

    const basePlinth = new THREE.Mesh(
      new RoundedBoxGeometry(length, 0.12, 0.28, 2, 0.02),
      stoneDarkMat
    );
    basePlinth.position.y = 0.06;
    basePlinth.receiveShadow = true;
    wall.add(basePlinth);

    const topRail = new THREE.Mesh(
      new RoundedBoxGeometry(length, 0.09, 0.24, 2, 0.03),
      stoneMat
    );
    topRail.position.y = 0.48;
    topRail.castShadow = true;
    wall.add(topRail);

    [-length / 2 + 0.12, length / 2 - 0.12].forEach(px => {
      const pier = new THREE.Mesh(
        new RoundedBoxGeometry(0.24, 0.52, 0.32, 2, 0.03),
        stoneMat
      );
      pier.position.set(px, 0.26, 0);
      pier.castShadow = true;

      const sphereFinial = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), stoneMat);
      sphereFinial.position.set(px, 0.60, 0);

      const goldRing = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 6, 12), goldCapMat);
      goldRing.rotation.x = Math.PI / 2;
      goldRing.position.set(px, 0.53, 0);

      wall.add(pier, sphereFinial, goldRing);
    });

    const balusterCount = 7;
    const spacing = (length - 0.48) / (balusterCount + 1);
    const balusterGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.30, 8);
    const collarGeo = new THREE.SphereGeometry(0.065, 8, 8);

    for (let i = 1; i <= balusterCount; i++) {
      const bx = -length / 2 + 0.24 + i * spacing;
      const bMesh = new THREE.Mesh(balusterGeo, stoneDarkMat);
      bMesh.position.set(bx, 0.28, 0);

      const collar = new THREE.Mesh(collarGeo, stoneMat);
      collar.position.set(bx, 0.28, 0);
      collar.scale.set(1.0, 0.65, 1.0);

      wall.add(bMesh, collar);
    }

    return DetailedModels.registerDioramaProp(wall);
  }

  // =========================================================================
  // 8. CẦU CẢNG GỖ MINI BỜ BIỂN (Miniature Coastal Wooden Dock & Pier)
  // =========================================================================
  public static createMiniatureWoodenDock(): THREE.Group {
    const dock = new THREE.Group();

    const timberMat = DetailedModels.getMat('dock_timber', () => new THREE.MeshStandardMaterial({
      color: '#8D6E63',
      roughness: 0.75,
      metalness: 0.02
    }));
    const darkWoodMat = DetailedModels.getMat('dock_dark_wood', () => new THREE.MeshStandardMaterial({
      color: '#4E342E',
      roughness: 0.85
    }));
    const ropeMat = DetailedModels.getMat('dock_rope', () => new THREE.MeshStandardMaterial({
      color: '#D7CCC8',
      roughness: 0.9
    }));
    const ironCleatMat = DetailedModels.getMat('dock_cleat', () => new THREE.MeshStandardMaterial({
      color: '#263238',
      roughness: 0.35,
      metalness: 0.8
    }));
    const buoyRedMat = DetailedModels.getMat('dock_buoy_red', () => new THREE.MeshStandardMaterial({
      color: '#E74C3C',
      roughness: 0.3
    }));
    const buoyWhiteMat = DetailedModels.getMat('dock_buoy_white', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.3
    }));

    const plankGeo = new RoundedBoxGeometry(0.24, 0.04, 1.15, 2, 0.008);
    for (let p = 0; p < 8; p++) {
      const plank = new THREE.Mesh(plankGeo, timberMat);
      plank.position.set(-0.85 + p * 0.25, 0.22, 0);
      plank.castShadow = true;
      plank.receiveShadow = true;
      dock.add(plank);
    }

    const postGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.65, 8);
    const postCoords = [
      [-0.92, -0.52], [-0.92, 0.52],
      [0.92, -0.52], [0.92, 0.52]
    ];

    postCoords.forEach(([px, pz], idx) => {
      const post = new THREE.Mesh(postGeo, darkWoodMat);
      post.position.set(px, 0.26, pz);
      post.castShadow = true;

      const ropeRing = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 6, 12), ropeMat);
      ropeRing.rotation.x = Math.PI / 2;
      ropeRing.position.set(px, 0.46, pz);

      dock.add(post, ropeRing);

      if (idx >= 2) {
        const cleat = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.16), ironCleatMat);
        cleat.position.set(px - 0.06, 0.26, pz * 0.65);
        dock.add(cleat);
      }
    });

    const buoyGroup = new THREE.Group();
    buoyGroup.position.set(0.94, 0.28, 0);
    buoyGroup.rotation.y = Math.PI / 2;

    const buoyRing = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.038, 8, 16), buoyWhiteMat);
    buoyGroup.add(buoyRing);

    for (let b = 0; b < 4; b++) {
      const bAng = (b / 4) * Math.PI * 2;
      const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.06, 8), buoyRedMat);
      stripe.position.set(Math.cos(bAng) * 0.12, Math.sin(bAng) * 0.12, 0);
      stripe.rotation.z = bAng;
      buoyGroup.add(stripe);
    }
    dock.add(buoyGroup);

    return DetailedModels.registerDioramaProp(dock);
  }

  // =========================================================================
  // 9. LỐI ĐI DẠO LÁT ĐÁ CUỘI QUẢNG TRƯỜNG (Cobblestone Promenade Walkway)
  // =========================================================================
  public static createCobblestonePromenade(length = 2.0, width = 1.0): THREE.Group {
    const promenade = new THREE.Group();

    const curbMat = DetailedModels.getMat('promenade_curb', () => new THREE.MeshStandardMaterial({
      color: '#CFD8DC',
      roughness: 0.45,
      metalness: 0.08
    }));
    const stoneToneA = DetailedModels.getMat('promenade_stone_a', () => new THREE.MeshStandardMaterial({
      color: '#78909C',
      roughness: 0.55
    }));
    const stoneToneB = DetailedModels.getMat('promenade_stone_b', () => new THREE.MeshStandardMaterial({
      color: '#90A4AE',
      roughness: 0.50
    }));
    const brassMarkerMat = DetailedModels.getMat('promenade_brass_marker', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      metalness: 0.9,
      roughness: 0.15
    }));

    [-width / 2, width / 2].forEach(cz => {
      const curb = new THREE.Mesh(new RoundedBoxGeometry(length, 0.08, 0.12, 2, 0.02), curbMat);
      curb.position.set(0, 0.04, cz);
      curb.receiveShadow = true;
      promenade.add(curb);
    });

    const rows = 5;
    const cols = 9;
    const dx = length / cols;
    const dz = (width - 0.20) / rows;
    const stoneGeo = new RoundedBoxGeometry(dx * 0.92, 0.04, dz * 0.92, 2, 0.01);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const stone = new THREE.Mesh(stoneGeo, (r + c) % 2 === 0 ? stoneToneA : stoneToneB);
        const offsetX = (r % 2 === 0 ? 0 : dx * 0.25);
        stone.position.set(-length / 2 + dx * 0.5 + c * dx + offsetX, 0.02, -width / 2 + 0.10 + dz * 0.5 + r * dz);
        stone.receiveShadow = true;
        promenade.add(stone);
      }
    }

    const compassMarker = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.025, 8), brassMarkerMat);
    compassMarker.position.set(0, 0.042, 0);
    promenade.add(compassMarker);

    return DetailedModels.registerDioramaProp(promenade);
  }

  // =========================================================================
  // 10. NHÀ CHÒI BÁT GIÁC QUẢNG TRƯỜNG VƯỜN HOA (Boutique Plaza Garden Gazebo)
  // =========================================================================
  public static createBoutiquePlazaGazebo(): THREE.Group {
    const gazebo = new THREE.Group();

    const marbleMat = DetailedModels.getMat('gazebo_marble', () => new THREE.MeshStandardMaterial({
      color: '#F5F6FA',
      roughness: 0.25,
      metalness: 0.05
    }));
    const ironMat = DetailedModels.getMat('gazebo_iron', () => new THREE.MeshStandardMaterial({
      color: '#2F3542',
      roughness: 0.4,
      metalness: 0.8
    }));
    const roofVerdigrisMat = DetailedModels.getMat('gazebo_roof', () => new THREE.MeshStandardMaterial({
      color: '#16A085',
      roughness: 0.35,
      metalness: 0.2
    }));
    const goldOrnamentMat = DetailedModels.getMat('gazebo_gold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      metalness: 0.9,
      roughness: 0.15
    }));
    const lampGlowMat = DetailedModels.getMat('gazebo_lamp_glow', () => new THREE.MeshStandardMaterial({
      color: '#FFEAA7',
      emissive: '#FFB142',
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.9
    }));

    const step1 = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.55, 0.10, 8), marbleMat);
    step1.position.y = 0.05;
    step1.receiveShadow = true;

    const step2 = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.35, 0.12, 8), marbleMat);
    step2.position.y = 0.16;
    step2.receiveShadow = true;
    gazebo.add(step1, step2);

    const colGeo = new THREE.CylinderGeometry(0.04, 0.052, 1.35, 8);
    const colCapGeo = new RoundedBoxGeometry(0.10, 0.05, 0.10, 2, 0.02);
    const rad = 1.10;

    for (let c = 0; c < 8; c++) {
      const cAngle = (c / 8) * Math.PI * 2;
      const col = new THREE.Mesh(colGeo, ironMat);
      col.position.set(Math.cos(cAngle) * rad, 0.88, Math.sin(cAngle) * rad);
      col.castShadow = true;

      const capital = new THREE.Mesh(colCapGeo, goldOrnamentMat);
      capital.position.set(Math.cos(cAngle) * rad, 1.56, Math.sin(cAngle) * rad);

      gazebo.add(col, capital);

      if (c !== 0) {
        const nextAngle = ((c + 1) / 8) * Math.PI * 2;
        const midX = (Math.cos(cAngle) + Math.cos(nextAngle)) * 0.5 * rad;
        const midZ = (Math.sin(cAngle) + Math.sin(nextAngle)) * 0.5 * rad;
        const railing = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.35, 0.035, 2, 0.01), ironMat);
        railing.position.set(midX, 0.39, midZ);
        railing.rotation.y = -Math.atan2(Math.sin(nextAngle) - Math.sin(cAngle), Math.cos(nextAngle) - Math.cos(cAngle));
        gazebo.add(railing);
      }
    }

    const architrave = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, 0.07, 8), ironMat);
    architrave.position.y = 1.60;
    gazebo.add(architrave);

    const roof1 = new THREE.Mesh(new THREE.ConeGeometry(1.35, 0.58, 8), roofVerdigrisMat);
    roof1.position.y = 1.90;
    roof1.castShadow = true;

    const lanternDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.39, 0.20, 8), marbleMat);
    lanternDrum.position.y = 2.24;

    const roof2 = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.30, 8), roofVerdigrisMat);
    roof2.position.y = 2.48;

    const spire = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), goldOrnamentMat);
    spire.position.y = 2.68;
    const spireTip = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.14, 6), goldOrnamentMat);
    spireTip.position.y = 2.76;

    gazebo.add(roof1, lanternDrum, roof2, spire, spireTip);

    const ceilingCord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.30, 6), ironMat);
    ceilingCord.position.set(0, 1.62, 0);

    const chandelier = new THREE.Mesh(new THREE.OctahedronGeometry(0.10, 0), lampGlowMat);
    chandelier.position.set(0, 1.45, 0);
    chandelier.userData = { animType: 'flicker' };

    gazebo.add(ceilingCord, chandelier);

    return DetailedModels.registerDioramaProp(gazebo);
  }

  // =========================================================================
  // 11. HÀNG RÀO CẮT TỈA CÔNG VIÊN HÌNH KHỐI (Manicured Boxwood Hedge)
  // =========================================================================
  public static createManicuredHedge(length = 1.2, height = 0.36): THREE.Group {
    const hedge = new THREE.Group();

    const foliageMat = DetailedModels.getMat('hedge_foliage', () => new THREE.MeshStandardMaterial({
      color: '#1B8A5A',
      roughness: 0.55
    }));
    const blossomMat = DetailedModels.getMat('hedge_blossom', () => new THREE.MeshStandardMaterial({
      color: '#FF7675',
      roughness: 0.3,
      emissive: '#FF7675',
      emissiveIntensity: 0.2
    }));

    const hedgeBox = new THREE.Mesh(
      new RoundedBoxGeometry(length, height, 0.26, 3, 0.05),
      foliageMat
    );
    hedgeBox.position.y = height / 2;
    hedgeBox.castShadow = true;
    hedgeBox.receiveShadow = true;
    hedge.add(hedgeBox);

    const dotGeo = new THREE.SphereGeometry(0.03, 6, 6);
    const dots = [
      [-length * 0.35, height * 0.95, 0.05],
      [0, height * 0.96, -0.04],
      [length * 0.32, height * 0.94, 0.03]
    ];
    dots.forEach(([dx, dy, dz]) => {
      const dot = new THREE.Mesh(dotGeo, blossomMat);
      dot.position.set(dx, dy, dz);
      hedge.add(dot);
    });

    return DetailedModels.registerDioramaProp(hedge);
  }

  // =========================================================================
  // 12. BỒN HOA TRÒN ĐA SẮC ĐỒNG TÂM (Concentric Floral Plaza Bed)
  // =========================================================================
  public static createFlowerBed(radius = 0.9): THREE.Group {
    const bed = new THREE.Group();

    const curbMat = DetailedModels.getMat('bed_curb', () => new THREE.MeshStandardMaterial({
      color: '#ECEFF1',
      roughness: 0.3
    }));
    const soilMat = DetailedModels.getMat('planter_soil', () => new THREE.MeshStandardMaterial({
      color: '#3D271D',
      roughness: 0.9
    }));
    const redMat = DetailedModels.getMat('bed_flower_red', () => new THREE.MeshStandardMaterial({
      color: '#E74C3C',
      emissive: '#E74C3C',
      emissiveIntensity: 0.25
    }));
    const goldMat = DetailedModels.getMat('bed_flower_gold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F1C40F',
      emissiveIntensity: 0.25
    }));
    const blueMat = DetailedModels.getMat('bed_flower_blue', () => new THREE.MeshStandardMaterial({
      color: '#0984E3',
      emissive: '#0984E3',
      emissiveIntensity: 0.25
    }));

    const curb = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.05, 0.12, 20), curbMat);
    curb.position.y = 0.06;
    curb.receiveShadow = true;

    const soil = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.92, radius * 0.92, 0.14, 18), soilMat);
    soil.position.y = 0.07;

    bed.add(curb, soil);

    const outerCount = 10;
    const flGeo = new THREE.SphereGeometry(0.045, 6, 6);
    for (let i = 0; i < outerCount; i++) {
      const ang = (i / outerCount) * Math.PI * 2;
      const fl = new THREE.Mesh(flGeo, redMat);
      fl.position.set(Math.cos(ang) * (radius * 0.72), 0.15, Math.sin(ang) * (radius * 0.72));
      bed.add(fl);
    }

    const midCount = 6;
    for (let j = 0; j < midCount; j++) {
      const ang = (j / midCount) * Math.PI * 2 + 0.3;
      const fl = new THREE.Mesh(flGeo, goldMat);
      fl.position.set(Math.cos(ang) * (radius * 0.46), 0.16, Math.sin(ang) * (radius * 0.46));
      bed.add(fl);
    }

    const centerFlower = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), blueMat);
    centerFlower.position.set(0, 0.18, 0);
    bed.add(centerFlower);

    return DetailedModels.registerDioramaProp(bed);
  }

  // =========================================================================
  // 13. CHI TIẾT GỜ BÓ VỈA Ô CỜ & LÒNG ĐƯỜNG (Street Curbing)
  // =========================================================================
  public static createTileCurbs(w: number, _l: number, _angle: number): THREE.Group {
    const curbGroup = new THREE.Group();
    const curbMat = DetailedModels.getMat('tile_curb', () => new THREE.MeshStandardMaterial({
      color: '#E2E8F0',
      roughness: 0.42,
      metalness: 0.05
    }));

    const curbGeo = new RoundedBoxGeometry(w * 0.98, 0.06, 0.10, 2, 0.02);
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(0, 0, 0);
    curb.receiveShadow = true;
    curbGroup.add(curb);

    return curbGroup;
  }

  // =========================================================================
  // 14. BỤI HOA CẨM TÚ CẦU RỰC RỠ (Hydrangea Flower Bush) - Smooth Toy Shading
  // =========================================================================
  public static createFlowerBush(colorHex: string): THREE.Group {
    const bush = new THREE.Group();
    const leafMat = DetailedModels.getMat('hydrangea_leaf', () => new THREE.MeshStandardMaterial({
      color: '#00A382',
      roughness: 0.38,
      metalness: 0.0
    }));
    const flowerMat = DetailedModels.getMat(`hydrangea_flower_${colorHex}`, () => new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.25,
      emissive: colorHex,
      emissiveIntensity: 0.25
    }));
    const pistilMat = DetailedModels.getMat('hydrangea_pistil', () => new THREE.MeshStandardMaterial({
      color: '#FFEAA7',
      emissive: '#F1C40F',
      emissiveIntensity: 0.6,
      roughness: 0.2
    }));

    const leafGeo = new THREE.SphereGeometry(0.20, 14, 10);
    const leafClusters = [
      [0, 0.13, 0, 1.3, 0.65, 1.3],
      [-0.12, 0.11, 0.10, 1.0, 0.6, 1.0],
      [0.12, 0.11, -0.10, 1.0, 0.6, 1.0]
    ];
    leafClusters.forEach(([lx, ly, lz, sx, sy, sz]) => {
      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      leafMesh.scale.set(sx, sy, sz);
      leafMesh.position.set(lx, ly, lz);
      leafMesh.castShadow = true;
      bush.add(leafMesh);
    });

    const blossomGeo = new THREE.SphereGeometry(0.10, 14, 12);
    const pistilGeo = new THREE.SphereGeometry(0.028, 8, 6);

    const floretOffsets = [
      [0, 0.32, 0],
      [-0.13, 0.26, 0.11],
      [0.13, 0.27, -0.08],
      [0.11, 0.23, 0.13],
      [-0.11, 0.24, -0.12],
      [0, 0.36, -0.05]
    ];

    floretOffsets.forEach(([fx, fy, fz]) => {
      const blossom = new THREE.Mesh(blossomGeo, flowerMat);
      blossom.position.set(fx, fy, fz);
      blossom.castShadow = true;

      const pistil = new THREE.Mesh(pistilGeo, pistilMat);
      pistil.position.set(fx, fy + 0.07, fz);

      bush.add(blossom, pistil);
    });

    return DetailedModels.registerDioramaProp(bush);
  }
}
