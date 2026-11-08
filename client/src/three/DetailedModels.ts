import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Thư viện các mô hình 3D giàu chi tiết, phong cách nghệ thuật High-Fidelity Stylized Diorama
 * Chuẩn đặc tả kỹ thuật 3D_MODEL_ENHANCEMENT_SPEC.md (Monopoly GO! & Animal Crossing Quality)
 */
export class DetailedModels {

  // =========================================================================
  // 1. CÂY CỔ THỤ CÔNG VIÊN ĐA TẦNG TÁN (Faceted Foliage & Organic Twisted Bark)
  // =========================================================================
  public static createStylizedTree(): THREE.Group {
    const tree = new THREE.Group();

    // Vật liệu vỏ gỗ sần sùi PBR tông nâu hạt dẻ
    const trunkMat = new THREE.MeshStandardMaterial({
      color: '#5D3A1A',
      roughness: 0.85,
      metalness: 0.02
    });

    // A. Gốc rễ bạnh cổ thụ xòe 4 hướng cắm sâu vào mặt cỏ
    const rootGeo = new THREE.CylinderGeometry(0.12, 0.22, 0.45, 8);
    const rootAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    rootAngles.forEach((angle, idx) => {
      const root = new THREE.Mesh(rootGeo, trunkMat);
      root.position.set(Math.cos(angle) * 0.26, 0.12, Math.sin(angle) * 0.26);
      root.rotation.z = Math.cos(angle) * 0.55;
      root.rotation.x = Math.sin(angle) * 0.55;
      root.rotation.y = angle + idx * 0.2;
      root.receiveShadow = true;
      tree.add(root);
    });

    // Mô đất tròn dẹp dưới gốc + cụm nấm tí hon đỏ chấm trắng
    const moundMat = new THREE.MeshStandardMaterial({ color: '#27ae60', roughness: 0.7 });
    const mound = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 0.12, 12), moundMat);
    mound.position.y = 0.06;
    mound.receiveShadow = true;
    tree.add(mound);

    // Cụm nấm tí hon xinh xắn dưới gốc rễ
    const shroomCapMat = new THREE.MeshStandardMaterial({ color: '#E84118', roughness: 0.3 });
    const shroomStemMat = new THREE.MeshStandardMaterial({ color: '#F5F6FA', roughness: 0.4 });
    const shroomPositions = [[0.4, 0.1, 0.3], [0.46, 0.08, 0.18], [-0.35, 0.09, -0.38]];
    shroomPositions.forEach(([sx, sy, sz]) => {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.12, 6), shroomStemMat);
      stem.position.set(sx, sy + 0.06, sz);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.09, 8), shroomCapMat);
      cap.position.set(sx, sy + 0.14, sz);
      tree.add(stem, cap);
    });

    // B. Thân cây chính gồm chuỗi 3 đoạn vặn xoắn gân guốc tự nhiên (Twisted Bark)
    const trunkLower = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, 0.55, 10), trunkMat);
    trunkLower.position.y = 0.32;
    trunkLower.rotation.z = 0.04;
    trunkLower.rotation.x = -0.03;
    trunkLower.castShadow = true;

    const trunkMid = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.65, 10), trunkMat);
    trunkMid.position.set(0.03, 0.82, -0.02);
    trunkMid.rotation.z = -0.08;
    trunkMid.rotation.x = 0.05;
    trunkMid.castShadow = true;

    const trunkUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.18, 0.55, 10), trunkMat);
    trunkUpper.position.set(-0.02, 1.32, 0.02);
    trunkUpper.rotation.z = 0.06;
    trunkUpper.rotation.x = -0.04;
    trunkUpper.castShadow = true;

    tree.add(trunkLower, trunkMid, trunkUpper);

    // C. Cành phụ vươn lên nâng đỡ các khối tán lá
    const branch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.52, 8), trunkMat);
    branch1.position.set(0.18, 1.15, 0.12);
    branch1.rotation.z = -Math.PI / 3.8;
    branch1.rotation.y = 0.4;
    branch1.castShadow = true;

    const branch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.46, 8), trunkMat);
    branch2.position.set(-0.16, 1.25, -0.1);
    branch2.rotation.z = Math.PI / 3.5;
    branch2.rotation.y = -0.5;
    branch2.castShadow = true;

    tree.add(branch1, branch2);

    // D. Tán lá cách điệu mềm mại đa tầng (Stylized Soft Cloud Foliage) - Smooth Shading bóng mịn
    // Tầng 1 (Đáy - Shadow Layer): Xanh rêu đậm sâu thẳm
    const shadowFoliageMat = new THREE.MeshStandardMaterial({
      color: '#005236',
      roughness: 0.45,
      metalness: 0.0
    });

    // Tầng 2 (Giữa - Main Canopy): Xanh ngọc bích tươi tắn bắt sáng
    const mainFoliageMat = new THREE.MeshStandardMaterial({
      color: '#00B894',
      roughness: 0.38,
      metalness: 0.0
    });

    // Tầng 3 (Đỉnh chóp - Sunlit Crown): Xanh mạ non ấm áp đón nắng vàng
    const sunlitFoliageMat = new THREE.MeshStandardMaterial({
      color: '#55EFC4',
      roughness: 0.32,
      metalness: 0.0
    });

    const foliageGroup = new THREE.Group();
    foliageGroup.position.y = 1.45;

    // 1. Tầng Đáy (5 khối bung tròn dẹp tạo bóng đổ bồng bềnh mềm mại)
    const bottomClusters = [
      { x: 0, y: 0.05, z: 0, r: 0.72, sx: 1.35, sy: 0.8, sz: 1.35 },
      { x: -0.38, y: -0.06, z: 0.25, r: 0.55, sx: 1.25, sy: 0.75, sz: 1.25 },
      { x: 0.35, y: -0.04, z: -0.3, r: 0.58, sx: 1.25, sy: 0.75, sz: 1.25 },
      { x: 0.28, y: -0.05, z: 0.32, r: 0.52, sx: 1.2, sy: 0.7, sz: 1.2 },
      { x: -0.32, y: -0.03, z: -0.28, r: 0.54, sx: 1.25, sy: 0.75, sz: 1.25 }
    ];
    bottomClusters.forEach(c => {
      const geo = new THREE.SphereGeometry(c.r, 22, 16);
      const mesh = new THREE.Mesh(geo, shadowFoliageMat);
      mesh.scale.set(c.sx, c.sy, c.sz);
      mesh.position.set(c.x, c.y, c.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      foliageGroup.add(mesh);
    });

    // 2. Tầng Giữa (7 khối bung tròn xòe như cụm mây)
    const midClusters = [
      { x: 0, y: 0.45, z: 0, r: 0.75, sx: 1.15, sy: 0.95, sz: 1.15 },
      { x: 0.42, y: 0.38, z: 0.2, r: 0.58, sx: 1.1, sy: 0.9, sz: 1.1 },
      { x: -0.4, y: 0.35, z: -0.22, r: 0.6, sx: 1.15, sy: 0.9, sz: 1.15 },
      { x: -0.32, y: 0.4, z: 0.35, r: 0.54, sx: 1.1, sy: 0.9, sz: 1.1 },
      { x: 0.36, y: 0.42, z: -0.32, r: 0.56, sx: 1.1, sy: 0.9, sz: 1.1 },
      { x: 0.12, y: 0.5, z: 0.42, r: 0.5, sx: 1.05, sy: 0.85, sz: 1.05 },
      { x: -0.15, y: 0.48, z: -0.4, r: 0.52, sx: 1.05, sy: 0.85, sz: 1.05 }
    ];
    midClusters.forEach(c => {
      const geo = new THREE.SphereGeometry(c.r, 22, 16);
      const mesh = new THREE.Mesh(geo, mainFoliageMat);
      mesh.scale.set(c.sx, c.sy, c.sz);
      mesh.position.set(c.x, c.y, c.z);
      mesh.castShadow = true;
      foliageGroup.add(mesh);
    });

    // 3. Tầng Đỉnh (3 khối tròn xoe đón nắng ấm)
    const topClusters = [
      { x: 0.02, y: 0.88, z: 0.02, r: 0.55, sx: 1.05, sy: 0.95, sz: 1.05 },
      { x: -0.18, y: 0.82, z: 0.12, r: 0.42, sx: 1.0, sy: 0.9, sz: 1.0 },
      { x: 0.16, y: 0.84, z: -0.14, r: 0.44, sx: 1.0, sy: 0.9, sz: 1.0 }
    ];
    topClusters.forEach(c => {
      const geo = new THREE.SphereGeometry(c.r, 20, 16);
      const mesh = new THREE.Mesh(geo, sunlitFoliageMat);
      mesh.scale.set(c.sx, c.sy, c.sz);
      mesh.position.set(c.x, c.y, c.z);
      mesh.castShadow = true;
      foliageGroup.add(mesh);
    });

    // E. Điểm xuyết hoa anh đào & quả chín rực rỡ lấp ló trên tán lá
    const blossomMat = new THREE.MeshStandardMaterial({
      color: '#FF7675',
      roughness: 0.25,
      emissive: '#FF7675',
      emissiveIntensity: 0.2
    });
    const fruitGoldMat = new THREE.MeshStandardMaterial({
      color: '#FDCB6E',
      roughness: 0.2,
      emissive: '#FDCB6E',
      emissiveIntensity: 0.25
    });

    const accentOffsets = [
      { pos: [-0.48, 0.4, 0.25], mat: blossomMat },
      { pos: [0.46, 0.35, -0.28], mat: fruitGoldMat },
      { pos: [-0.22, 0.72, 0.38], mat: blossomMat },
      { pos: [0.38, 0.65, 0.24], mat: fruitGoldMat },
      { pos: [0.15, 0.88, -0.3], mat: blossomMat },
      { pos: [-0.35, 0.18, -0.45], mat: fruitGoldMat },
      { pos: [0.48, 0.22, 0.32], mat: blossomMat }
    ];
    const tetraGeo = new THREE.TetrahedronGeometry(0.08);
    accentOffsets.forEach(({ pos, mat }) => {
      const accent = new THREE.Mesh(tetraGeo, mat);
      accent.position.set(pos[0], pos[1], pos[2]);
      accent.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      foliageGroup.add(accent);
    });

    tree.add(foliageGroup);
    return tree;
  }

  // =========================================================================
  // 2. ĐÀI PHUN NƯỚC HOÀNG GIA 3 TẦNG (Baroque Royal Octagonal Fountain)
  // =========================================================================
  public static createDetailedFountain(): {
    group: THREE.Group;
    waterRipples: THREE.Mesh;
    waterFalls: THREE.Mesh[];
    waterJets: THREE.Mesh[];
  } {
    const group = new THREE.Group();
    const waterFalls: THREE.Mesh[] = [];
    const waterJets: THREE.Mesh[] = [];

    // Vật liệu đá hoa cương trắng ngà & xám bazan chịu lực
    const marbleWhiteMat = new THREE.MeshStandardMaterial({
      color: '#F1F2F6',
      roughness: 0.32,
      metalness: 0.08
    });
    const basaltMat = new THREE.MeshStandardMaterial({
      color: '#747D8C',
      roughness: 0.50,
      metalness: 0.15
    });
    const goldOrnamentMat = new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F1C40F',
      emissiveIntensity: 0.28,
      metalness: 0.88,
      roughness: 0.16
    });

    // 1. Bậc thềm đá hoa cương 2 bậc bao quanh hồ bát giác
    const step1 = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.1, 0.16, 8), basaltMat);
    step1.position.y = 0.08;
    step1.receiveShadow = true;

    const step2 = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.7, 0.16, 8), marbleWhiteMat);
    step2.position.y = 0.24;
    step2.receiveShadow = true;

    group.add(step1, step2);

    // 2. Thành bể đá bát giác nguy nga
    const octBasin = new THREE.Mesh(new THREE.CylinderGeometry(4.1, 4.4, 0.45, 8), marbleWhiteMat);
    octBasin.position.y = 0.54;
    octBasin.receiveShadow = true;
    octBasin.castShadow = true;
    group.add(octBasin);

    // 8 Thanh gờ đá bo góc viền quanh miệng hồ bát giác
    const sideLength = 4.1 * Math.tan(Math.PI / 8) * 2;
    for (let s = 0; s < 8; s++) {
      const angle = (s / 8) * Math.PI * 2 + Math.PI / 8;
      const molding = new THREE.Mesh(
        new RoundedBoxGeometry(sideLength * 0.98, 0.14, 0.32, 3, 0.04),
        marbleWhiteMat
      );
      const dist = 4.05;
      molding.position.set(Math.cos(angle) * dist, 0.78, Math.sin(angle) * dist);
      molding.rotation.y = -angle + Math.PI / 2;
      group.add(molding);
    }

    // 3. Mặt hồ chính trong suốt màu ngọc bích
    const waterMat = new THREE.MeshStandardMaterial({
      color: '#0984E3',
      emissive: '#74B9FF',
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.88,
      roughness: 0.04,
      metalness: 0.1
    });
    const lowerWater = new THREE.Mesh(new THREE.CylinderGeometry(3.9, 3.9, 0.08, 16), waterMat);
    lowerWater.position.y = 0.72;
    group.add(lowerWater);

    // Vòng sóng nước lăn tăn gợn trên mặt hồ
    const rippleGeo = new THREE.RingGeometry(1.4, 3.6, 24);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: '#E0F2FE',
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const ripples = new THREE.Mesh(rippleGeo, rippleMat);
    ripples.rotation.x = -Math.PI / 2;
    ripples.position.y = 0.75;
    group.add(ripples);

    // Cụm lá sen nổi bồng bềnh và hoa sen hồng nở
    const lilyMat = new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.3 });
    const lotusMat = new THREE.MeshStandardMaterial({ color: '#FD79A8', roughness: 0.2, emissive: '#FD79A8', emissiveIntensity: 0.3 });
    for (let l = 0; l < 4; l++) {
      const lAngle = (l / 4) * Math.PI * 2 + 0.35;
      const lily = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.02, 12), lilyMat);
      lily.position.set(Math.cos(lAngle) * 2.6, 0.74, Math.sin(lAngle) * 2.6);

      const lotus = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), lotusMat);
      lotus.position.set(Math.cos(lAngle) * 2.6, 0.81, Math.sin(lAngle) * 2.6);
      group.add(lily, lotus);
    }

    // 4. Bốn vòi phun cá vàng mạ hoàng kim chầu 4 hướng (Ornate Spouts)
    const spoutAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    const waterJetMat = new THREE.MeshStandardMaterial({
      color: '#A0E7E5',
      emissive: '#E0F2FE',
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1
    });

    spoutAngles.forEach(spAngle => {
      const spoutGroup = new THREE.Group();
      spoutGroup.position.set(Math.cos(spAngle) * 3.8, 0.82, Math.sin(spAngle) * 3.8);
      spoutGroup.rotation.y = -spAngle - Math.PI / 2;

      // Tượng cá/đầu sư tử mạ vàng
      const spBase = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.22, 0.28, 2, 0.04), goldOrnamentMat);
      spBase.position.y = 0.11;
      const spHead = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 8), goldOrnamentMat);
      spHead.rotation.x = -Math.PI / 3;
      spHead.position.set(0, 0.22, 0.1);

      spoutGroup.add(spBase, spHead);
      group.add(spoutGroup);

      // Tia nước vòng cung phun từ miệng vòi vào tâm hồ (QuadraticBezierCurve3)
      const startP = new THREE.Vector3(Math.cos(spAngle) * 3.65, 0.95, Math.sin(spAngle) * 3.65);
      const midP = new THREE.Vector3(Math.cos(spAngle) * 2.2, 1.45, Math.sin(spAngle) * 2.2);
      const endP = new THREE.Vector3(Math.cos(spAngle) * 1.1, 0.74, Math.sin(spAngle) * 1.1);

      const curve = new THREE.QuadraticBezierCurve3(startP, midP, endP);
      const jetGeo = new THREE.TubeGeometry(curve, 14, 0.035, 6, false);
      const jetMesh = new THREE.Mesh(jetGeo, waterJetMat);
      group.add(jetMesh);
      waterJets.push(jetMesh);
    });

    // 5. Trụ đài phun nước lớn có 4 chân quỳ điêu khắc Hy Lạp (Pedestal with Scroll Legs)
    const basePedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.25, 0.6, 16), marbleWhiteMat);
    basePedestal.position.y = 1.0;
    group.add(basePedestal);

    // 4 Chân quỳ điêu khắc mạ viền vàng
    for (let c = 0; c < 4; c++) {
      const cAngle = (c / 4) * Math.PI * 2 + Math.PI / 4;
      const leg = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.55, 0.45, 3, 0.06), marbleWhiteMat);
      leg.position.set(Math.cos(cAngle) * 0.95, 0.95, Math.sin(cAngle) * 0.95);
      leg.rotation.y = -cAngle;
      group.add(leg);
    }

    // Trụ thân thon có khía rãnh nổi
    const stem1 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.78, 0.7, 16), marbleWhiteMat);
    stem1.position.y = 1.55;
    group.add(stem1);

    // 6. Bát nước Tầng 1: Đĩa đá chạm 12 cánh sen nổi 3D
    const bowl1 = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 1.7, 0.38, 24), marbleWhiteMat);
    bowl1.position.y = 1.95;
    group.add(bowl1);

    // 12 Cánh sen nổi xếp quanh vành bát tầng 1
    const petalGeo = new RoundedBoxGeometry(0.35, 0.12, 0.28, 2, 0.04);
    for (let p = 0; p < 12; p++) {
      const pAngle = (p / 12) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, marbleWhiteMat);
      petal.position.set(Math.cos(pAngle) * 2.25, 2.05, Math.sin(pAngle) * 2.25);
      petal.rotation.y = -pAngle;
      petal.rotation.z = 0.15;
      group.add(petal);
    }

    // Mặt nước tràn tầng 1
    const waterTier1 = new THREE.Mesh(new THREE.CylinderGeometry(2.18, 2.18, 0.06, 20), waterMat);
    waterTier1.position.y = 2.08;
    group.add(waterTier1);

    // 7. Trụ đỡ Tầng 2 & Bát nước Tầng 2
    const stem2 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.65, 16), marbleWhiteMat);
    stem2.position.y = 2.45;
    group.add(stem2);

    const bowl2 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 0.95, 0.32, 20), marbleWhiteMat);
    bowl2.position.y = 2.85;
    group.add(bowl2);

    const waterTier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.28, 0.06, 16), waterMat);
    waterTier2.position.y = 2.96;
    group.add(waterTier2);

    // 8. Màng nước thác rơi từ tầng 2 xuống tầng 1 và từ tầng 1 xuống hồ
    const cascadeMat = new THREE.MeshStandardMaterial({
      color: '#A0E7E5',
      emissive: '#E0F2FE',
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide
    });

    const cascade1Geo = new THREE.CylinderGeometry(1.36, 1.95, 0.72, 20, 1, true);
    const cascade1 = new THREE.Mesh(cascade1Geo, cascadeMat);
    cascade1.position.y = 2.45;
    group.add(cascade1);
    waterFalls.push(cascade1);

    const cascade2Geo = new THREE.CylinderGeometry(2.32, 3.1, 0.95, 24, 1, true);
    const cascade2 = new THREE.Mesh(cascade2Geo, cascadeMat);
    cascade2.position.y = 1.45;
    group.add(cascade2);
    waterFalls.push(cascade2);

    // 9. Vương miện mạ vàng phun cột nước chính trên đỉnh
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 0.45, 12), goldOrnamentMat);
    crown.position.y = 3.22;
    group.add(crown);

    return { group, waterRipples: ripples, waterFalls, waterJets };
  }

  // =========================================================================
  // 3. CỘT ĐÈN ĐƯỜNG CỔ ĐIỂN VICTORIA LONDON (Vintage Hex Lantern Post)
  // =========================================================================
  public static createStreetLamp(): THREE.Group {
    const lamp = new THREE.Group();

    // Gang đúc đen nhám PBR
    const ironMat = new THREE.MeshStandardMaterial({
      color: '#2F3542',
      roughness: 0.42,
      metalness: 0.82
    });
    // Chi tiết vàng kim cổ điển
    const goldMat = new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      metalness: 0.85,
      roughness: 0.2
    });

    // A. Đế vuông giật 2 cấp
    const basePlinth1 = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.12, 0.48, 2, 0.03), ironMat);
    basePlinth1.position.y = 0.06;
    const basePlinth2 = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.16, 0.38, 2, 0.03), ironMat);
    basePlinth2.position.y = 0.18;
    lamp.add(basePlinth1, basePlinth2);

    // B. Thân cột côn có đai tròn và gờ nổi
    const poleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.45, 12), ironMat);
    poleBase.position.y = 0.48;

    const poleRing = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 8, 16), goldMat);
    poleRing.rotation.x = Math.PI / 2;
    poleRing.position.y = 0.72;

    const poleMain = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.10, 1.35, 12), ironMat);
    poleMain.position.y = 1.4;
    poleMain.castShadow = true;

    const poleTopRing = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 8, 16), goldMat);
    poleTopRing.rotation.x = Math.PI / 2;
    poleTopRing.position.y = 2.1;

    lamp.add(poleBase, poleRing, poleMain, poleTopRing);

    // C. Cần tay đòn uốn cong nâng lồng đèn
    const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8);
    const arm1 = new THREE.Mesh(armGeo, ironMat);
    arm1.position.set(0.12, 2.22, 0);
    arm1.rotation.z = -Math.PI / 3.5;

    const armScroll = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 12, Math.PI * 1.4), goldMat);
    armScroll.position.set(0.06, 2.12, 0);
    lamp.add(arm1, armScroll);

    // D. Lồng đèn cổ điển hình bát giác/lục giác thon dần về đáy
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(0.24, 2.36, 0);

    const lanternCap = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.18, 6), ironMat);
    lanternCap.position.y = 0.28;

    const lanternFinial = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), goldMat);
    lanternFinial.position.y = 0.4;

    const lanternGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.11, 0.32, 6),
      new THREE.MeshStandardMaterial({
        color: '#FFF275',
        emissive: '#FFB142',
        emissiveIntensity: 1.4,
        transparent: true,
        opacity: 0.85,
        roughness: 0.15
      })
    );
    lanternGlass.position.y = 0.08;

    // Bóng đèn dây tóc vàng ấm bên trong
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshBasicMaterial({ color: '#FFFFFF' })
    );
    bulb.position.y = 0.08;

    lanternGroup.add(lanternCap, lanternFinial, lanternGlass, bulb);
    lamp.add(lanternGroup);

    return lamp;
  }

  // =========================================================================
  // 4. GHẾ BĂNG CÔNG VIÊN CỔ ĐIỂN (Victorian Oak & Cast Iron Bench)
  // =========================================================================
  public static createParkBench(): THREE.Group {
    const bench = new THREE.Group();

    const woodMat = new THREE.MeshStandardMaterial({
      color: '#A0522D',
      roughness: 0.55,
      metalness: 0.05
    });
    const ironMat = new THREE.MeshStandardMaterial({
      color: '#2F3542',
      roughness: 0.35,
      metalness: 0.85
    });

    // 2 Chân sắt uốn lượn nghệ thuật 2 đầu
    const makeLeg = (lx: number) => {
      const legGroup = new THREE.Group();
      legGroup.position.x = lx;

      // Chân trước và sau bo cong
      const frontLeg = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.34, 0.05, 2, 0.01), ironMat);
      frontLeg.position.set(0, 0.17, 0.12);
      frontLeg.rotation.x = -0.12;

      const rearLeg = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.52, 0.05, 2, 0.01), ironMat);
      rearLeg.position.set(0, 0.26, -0.14);
      rearLeg.rotation.x = 0.15;

      const armRest = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.04, 0.34, 2, 0.01), ironMat);
      armRest.position.set(0, 0.35, 0.0);

      legGroup.add(frontLeg, rearLeg, armRest);
      bench.add(legGroup);
    };

    makeLeg(-0.46);
    makeLeg(0.46);

    // 4 Thanh nan gỗ mặt ngồi
    const slatGeo = new RoundedBoxGeometry(1.0, 0.035, 0.065, 2, 0.01);
    for (let s = 0; s < 4; s++) {
      const slat = new THREE.Mesh(slatGeo, woodMat);
      slat.position.set(0, 0.24, -0.06 + s * 0.075);
      bench.add(slat);
    }

    // 3 Thanh nan gỗ tựa lưng
    for (let b = 0; b < 3; b++) {
      const backSlat = new THREE.Mesh(slatGeo, woodMat);
      backSlat.position.set(0, 0.34 + b * 0.08, -0.11 - b * 0.02);
      backSlat.rotation.x = 0.18;
      bench.add(backSlat);
    }

    return bench;
  }

  // =========================================================================
  // 5. CHI TIẾT GỜ BÓ VỈA Ô CỜ & LÒNG ĐƯỜNG (Street Curbing)
  // =========================================================================
  public static createTileCurbs(w: number, l: number, _angle: number): THREE.Group {
    const curbGroup = new THREE.Group();
    const curbMat = new THREE.MeshStandardMaterial({
      color: '#E2E8F0',
      roughness: 0.42,
      metalness: 0.05
    });

    // Gờ đá bó vỉa bo cong ngăn cách vỉa hè với lòng đường
    const curbGeo = new RoundedBoxGeometry(w * 0.98, 0.07, 0.12, 2, 0.02);
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(0, 0, 0);
    curb.receiveShadow = true;
    curbGroup.add(curb);

    return curbGroup;
  }

  // =========================================================================
  // 6. BỤI HOA CẨM TÚ CẦU RỰC RỠ (Hydrangea Flower Bush) - Smooth Toy Shading
  // =========================================================================
  public static createFlowerBush(colorHex: string): THREE.Group {
    const bush = new THREE.Group();
    const leafMat = new THREE.MeshStandardMaterial({
      color: '#00A382',
      roughness: 0.38,
      metalness: 0.0
    });
    const flowerMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.25,
      emissive: colorHex,
      emissiveIntensity: 0.25
    });
    const pistilMat = new THREE.MeshStandardMaterial({
      color: '#FFEAA7',
      emissive: '#F1C40F',
      emissiveIntensity: 0.6,
      roughness: 0.2
    });

    // Cụm lá xanh mọng nước bo tròn mềm mại
    const leafGeo = new THREE.SphereGeometry(0.25, 16, 12);
    const leafClusters = [
      [0, 0.16, 0, 1.3, 0.65, 1.3],
      [-0.15, 0.14, 0.12, 1.0, 0.6, 1.0],
      [0.15, 0.14, -0.12, 1.0, 0.6, 1.0]
    ];
    leafClusters.forEach(([lx, ly, lz, sx, sy, sz]) => {
      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      leafMesh.scale.set(sx, sy, sz);
      leafMesh.position.set(lx, ly, lz);
      leafMesh.castShadow = true;
      bush.add(leafMesh);
    });

    // Các cụm cầu hoa cẩm tú cầu nở rộ tròn xoe đáng yêu
    const blossomGeo = new THREE.SphereGeometry(0.12, 16, 14);
    const pistilGeo = new THREE.SphereGeometry(0.035, 10, 8);

    const floretOffsets = [
      [0, 0.38, 0],
      [-0.16, 0.32, 0.14],
      [0.16, 0.33, -0.1],
      [0.14, 0.28, 0.16],
      [-0.14, 0.30, -0.15],
      [0, 0.44, -0.06]
    ];

    floretOffsets.forEach(([fx, fy, fz]) => {
      const blossom = new THREE.Mesh(blossomGeo, flowerMat);
      blossom.position.set(fx, fy, fz);
      blossom.castShadow = true;

      // Nhụy hoa phát sáng ở tâm
      const pistil = new THREE.Mesh(pistilGeo, pistilMat);
      pistil.position.set(fx, fy + 0.09, fz);

      bush.add(blossom, pistil);
    });

    return bush;
  }
}
