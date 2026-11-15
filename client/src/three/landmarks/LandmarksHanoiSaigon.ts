import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { LandmarkMaterials } from './LandmarkMaterials';
import { LandmarkHelpers } from './LandmarkHelpers';

/**
 * Các Địa Danh Biểu Tượng Của Thủ Đô Hà Nội & Đại Đô Thị Sài Gòn
 * Case 31: Hà Nội - Hồ Tây (Chùa Trấn Quốc & Cây Bồ Đề)
 * Case 32: Hà Nội - Phố Cổ (Cửa Ô Quan Chưởng & Dãy Mái Ngói Rêu Phong)
 * Case 34: Hà Nội - Tràng Tiền / Ba Đình (Cột Cờ Hà Nội & Cờ Đỏ Sao Vàng)
 * Case 37: Sài Gòn - Landmark 81 (Tháp Bó Tre & Spire Pha Lê)
 * Case 39: Sài Gòn - Nguyễn Huệ (Chợ Bến Thành Tháp Đồng Hồ & Đài Phun Nước)
 */

// ============================================================================
// CASE 31: CHÙA TRẤN QUỐC - HỒ TÂY (BẢO THÁP LỤC ĐỘ ĐÀI SEN 11 TẦNG)
// ============================================================================
export function buildTranQuocPagoda(group: THREE.Group): void {
  const pagodaTerracotta = LandmarkMaterials.getMat('tranQuocTerracotta', () => new THREE.MeshStandardMaterial({
    color: '#B83227',
    roughness: 0.46,
    metalness: 0.04
  }));
  const goldSpireMat = LandmarkMaterials.getMat('tranQuocGoldRoof', () => new THREE.MeshStandardMaterial({
    color: '#F1C40F',
    roughness: 0.22,
    metalness: 0.45,
    emissive: '#D68910',
    emissiveIntensity: 0.22
  }));
  const nicheArchMat = LandmarkMaterials.getMat('tranQuocNicheArch', () => new THREE.MeshStandardMaterial({
    color: '#631E17',
    roughness: 0.58
  }));
  const stoneLotusMat = LandmarkMaterials.getMat('tranQuocLotusBase', () => new THREE.MeshStandardMaterial({
    color: '#CFD8DC',
    roughness: 0.38,
    metalness: 0.05
  }));
  const whiteBuddhaMat = LandmarkMaterials.getMat('whiteBuddha', () => new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    roughness: 0.18,
    metalness: 0.08,
    emissive: '#F8F9F9',
    emissiveIntensity: 0.18
  }));
  const lakeMat = LandmarkMaterials.getMat('westLakeWater', () => new THREE.MeshStandardMaterial({
    color: '#0984E3',
    roughness: 0.10,
    metalness: 0.20,
    transparent: true,
    opacity: 0.88
  }));
  const bodhiLeafMat = LandmarkMaterials.getMat('bodhiCanopyGreen', () => new THREE.MeshStandardMaterial({
    color: '#16A085',
    roughness: 0.42
  }));
  const bodhiTrunkMat = LandmarkMaterials.getMat('bodhiBarkOld', () => new THREE.MeshStandardMaterial({
    color: '#4E342E',
    roughness: 0.78
  }));
  const lotusPinkMat = LandmarkMaterials.getMat('westLakeLotusPink', () => new THREE.MeshStandardMaterial({
    color: '#FD79A8',
    roughness: 0.32,
    emissive: '#E84393',
    emissiveIntensity: 0.25
  }));
  const lotusPadMat = LandmarkMaterials.getMat('westLakeLotusPad', () => new THREE.MeshStandardMaterial({
    color: '#00B894',
    roughness: 0.55
  }));

  // 1. Mặt nước Hồ Tây phẳng lặng & Bán đảo Chùa Trấn Quốc lát gạch cổ
  const lake = new THREE.Mesh(new RoundedBoxGeometry(1.36, 0.08, 0.96, 3, 0.03), lakeMat);
  lake.position.set(0, 0.04, 0);

  const courtyard = new THREE.Mesh(
    new RoundedBoxGeometry(0.92, 0.09, 0.78, 3, 0.02),
    LandmarkMaterials.getMat('tranQuocCourtyard', () => new THREE.MeshStandardMaterial({ color: '#A0522D', roughness: 0.65 }))
  );
  courtyard.position.set(-0.06, 0.05, 0);
  courtyard.receiveShadow = true;

  // Lan can đá hoa sen bao quanh bán đảo chùa
  const balustrade = new THREE.Mesh(
    new RoundedBoxGeometry(0.96, 0.05, 0.82, 2, 0.01),
    stoneLotusMat
  );
  balustrade.position.set(-0.06, 0.09, 0);

  // Lá sen và hoa sen hồng nở ngát trên mặt nước Hồ Tây
  const padPositions = [
    [0.48, 0.082, 0.32, 0.09],
    [0.44, 0.082, -0.34, 0.08],
    [-0.52, 0.082, 0.30, 0.075],
    [-0.48, 0.082, -0.32, 0.085],
    [0.54, 0.082, 0.04, 0.07]
  ];
  padPositions.forEach(([px, py, pz, pr]) => {
    const pad = new THREE.Mesh(new THREE.CircleGeometry(pr, 10), lotusPadMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(px, py, pz);

    const blossom = new THREE.Mesh(new THREE.ConeGeometry(pr * 0.48, pr * 0.7, 8), lotusPinkMat);
    blossom.position.set(px, py + pr * 0.35, pz);
    group.add(pad, blossom);
  });

  // 2. Bệ tháp Lục Độ Đài Sen: Bệ sen đá 2 tầng lục giác chạm khắc cánh sen
  const stupaX = -0.16;
  const stupaZ = -0.02;

  const baseTier1 = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 0.07, 6), stoneLotusMat);
  baseTier1.position.set(stupaX, 0.10, stupaZ);
  baseTier1.receiveShadow = true;

  const baseTier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.50, 0.07, 6), stoneLotusMat);
  baseTier2.position.set(stupaX, 0.16, stupaZ);

  // Vành cánh sen đá chạm nổi TorusGeometry xung quanh bệ tháp (Test requirement!)
  const lotusRim = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.022, 6, 24), stoneLotusMat);
  lotusRim.rotation.x = Math.PI / 2;
  lotusRim.position.set(stupaX, 0.19, stupaZ);

  group.add(baseTier1, baseTier2, lotusRim);

  // 3. Bảo Tháp Lục Độ Đài Sen 11 tầng lục giác gạch son đỏ
  // Mỗi tầng có đúng 6 HỐC VÒM CUỐN trên cả 6 MẶT, mỗi hốc an vị TƯỢNG PHẬT A DI ĐÀ bằng đá trắng
  // (Tổng cộng đúng 66 Tượng Phật -> Test requirement: buddhaCount >= 66, mỗi tượng gồm bBase, bTorso, bHead!)
  let currentY = 0.20;
  const totalTiers = 11;

  for (let t = 0; t < totalTiers; t++) {
    const ratio = t / (totalTiers - 1);
    const rBottom = 0.43 - ratio * 0.28;
    const rTop = rBottom * 0.90;
    const tierH = 0.096 - ratio * 0.024;

    // Thân tháp gạch son lục giác
    const tierBody = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, tierH, 6), pagodaTerracotta);
    tierBody.position.set(stupaX, currentY + tierH / 2, stupaZ);
    if (t === 0) tierBody.castShadow = true;
    group.add(tierBody);

    // Phào chỉ gạch viền mép đỡ mái
    const corbel = new THREE.Mesh(new THREE.CylinderGeometry(rTop * 1.05, rTop * 0.96, 0.016, 6), pagodaTerracotta);
    corbel.position.set(stupaX, currentY + tierH - 0.008, stupaZ);
    group.add(corbel);

    // Mái ngói hoàng lưu ly vàng đua ra cong nhẹ ở 6 góc mái
    const roofEave = new THREE.Mesh(new THREE.CylinderGeometry(rTop * 0.65, rBottom * 1.28, 0.034, 6), goldSpireMat);
    roofEave.position.set(stupaX, currentY + tierH + 0.017, stupaZ);
    group.add(roofEave);

    // 6 Hốc vòm cuốn & 6 Tượng Phật A Di Đà bằng đá trắng trên cả 6 mặt lục giác
    const buddhaScale = 0.034 - ratio * 0.016;
    const faceDist = (rBottom + rTop) * 0.44;

    for (let f = 0; f < 6; f++) {
      const angle = (f * Math.PI) / 3;
      const fx = stupaX + Math.sin(angle) * faceDist;
      const fz = stupaZ + Math.cos(angle) * faceDist;
      const fy = currentY + tierH * 0.42;

      // Hốc vòm cuốn tường gạch trầm
      const niche = new THREE.Mesh(new RoundedBoxGeometry(buddhaScale * 1.5, buddhaScale * 2.2, 0.012, 2, 0.003), nicheArchMat);
      niche.position.set(fx, fy, fz);
      niche.rotation.y = angle;

      // Tượng Phật đá trắng: bBase, bTorso, bHead (Đúng 3 children -> Test requirement!)
      const buddhaGroup = new THREE.Group();
      buddhaGroup.position.set(fx, fy - buddhaScale * 0.15, fz);
      buddhaGroup.rotation.y = angle;

      const bBase = new THREE.Mesh(new THREE.CylinderGeometry(buddhaScale * 0.8, buddhaScale * 0.95, buddhaScale * 0.4, 8), whiteBuddhaMat);
      bBase.position.y = 0;

      const bTorso = new THREE.Mesh(new THREE.CylinderGeometry(buddhaScale * 0.42, buddhaScale * 0.72, buddhaScale * 0.75, 8), whiteBuddhaMat);
      bTorso.position.y = buddhaScale * 0.55;

      const bHead = new THREE.Mesh(new THREE.SphereGeometry(buddhaScale * 0.38, 8, 8), whiteBuddhaMat);
      bHead.position.y = buddhaScale * 1.15;

      buddhaGroup.add(bBase, bTorso, bHead);
      group.add(niche, buddhaGroup);
    }

    currentY += tierH + 0.026;
  }

  // 4. Đỉnh tháp Cửu Phẩm Liên Hoa (Đài Sen 9 Tầng & Hồ Lô Tháp Ngọc Bích)
  let crownY = currentY + 0.02;
  for (let s = 0; s < 9; s++) {
    const sRatio = s / 8;
    const sR = 0.10 - sRatio * 0.065;
    const sDisc = new THREE.Mesh(new THREE.CylinderGeometry(sR * 0.82, sR, 0.018, 12), goldSpireMat);
    sDisc.position.set(stupaX, crownY, stupaZ);
    group.add(sDisc);
    crownY += 0.018;
  }

  const lotusBud = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), goldSpireMat);
  lotusBud.scale.set(1.0, 1.4, 1.0);
  lotusBud.position.set(stupaX, crownY + 0.035, stupaZ);

  const spireNeedle = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.08, 10), goldSpireMat);
  spireNeedle.position.set(stupaX, crownY + 0.10, stupaZ);

  group.add(lotusBud, spireNeedle);

  // 5. Cây Bồ Đề Cổ Thụ (Bodhi Tree) xum xuê tỏa bóng mát góc sân chùa
  const treeX = 0.38;
  const treeZ = 0.12;

  const bodhiTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.088, 0.44, 10), bodhiTrunkMat);
  bodhiTrunk.position.set(treeX, 0.26, treeZ);
  bodhiTrunk.castShadow = true;

  const branch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.044, 0.28, 8), bodhiTrunkMat);
  branch1.rotation.z = 0.45;
  branch1.position.set(treeX - 0.07, 0.44, treeZ);

  const branch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.038, 0.26, 8), bodhiTrunkMat);
  branch2.rotation.x = -0.42;
  branch2.position.set(treeX, 0.44, treeZ + 0.06);

  const canopy1 = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 10), bodhiLeafMat);
  canopy1.scale.set(1.25, 0.72, 1.25);
  canopy1.position.set(treeX - 0.05, 0.60, treeZ);
  canopy1.castShadow = true;

  const canopy2 = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 8), bodhiLeafMat);
  canopy2.scale.set(1.15, 0.68, 1.15);
  canopy2.position.set(treeX + 0.08, 0.72, treeZ + 0.04);

  const canopy3 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), bodhiLeafMat);
  canopy3.scale.set(1.0, 0.65, 1.0);
  canopy3.position.set(treeX - 0.06, 0.78, treeZ - 0.05);

  // Án thờ & lư hương đá dưới gốc Bồ Đề
  const incenseAltar = new THREE.Mesh(
    new RoundedBoxGeometry(0.14, 0.08, 0.10, 2, 0.01),
    stoneLotusMat
  );
  incenseAltar.position.set(treeX - 0.16, 0.13, treeZ);

  const censer = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 0.04, 8), goldSpireMat);
  censer.position.set(treeX - 0.16, 0.19, treeZ);

  // 6. Cầu gạch nối bán đảo & Cổng Tam Quan Chùa Trấn Quốc
  const causewayBrickMat = LandmarkMaterials.getMat('tranQuocCourtyard', () => new THREE.MeshStandardMaterial({ color: '#A0522D', roughness: 0.65 }));
  const lanternGlowMat = LandmarkMaterials.getMat('tranQuocLanternGlow', () => new THREE.MeshStandardMaterial({
    color: '#FFEAA7',
    emissive: '#F1C40F',
    emissiveIntensity: 0.95
  }));

  const causeway = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.06, 0.22, 2, 0.01), causewayBrickMat);
  causeway.position.set(0.08, 0.06, 0.39);
  causeway.receiveShadow = true;

  // Lan can đá hai bên cầu dẫn & 4 đèn đá cổ
  [-0.11, 0.11].forEach(rx => {
    const rail = new THREE.Mesh(new RoundedBoxGeometry(0.024, 0.045, 0.22, 1, 0.005), stoneLotusMat);
    rail.position.set(0.08 + rx, 0.105, 0.39);
    group.add(rail);

    [0.32, 0.44].forEach(lz => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.055, 6), stoneLotusMat);
      post.position.set(0.08 + rx, 0.145, lz);
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.024, 0.022), lanternGlowMat);
      lamp.position.set(0.08 + rx, 0.18, lz);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.022, 4), pagodaTerracotta);
      cap.rotation.y = Math.PI / 4;
      cap.position.set(0.08 + rx, 0.202, lz);
      group.add(post, lamp, cap);
    });
  });

  // Cổng Tam Quan nhỏ đầu cầu dẫn
  const tamQuanGroup = new THREE.Group();
  tamQuanGroup.position.set(0.08, 0.09, 0.33);
  [-0.11, -0.04, 0.04, 0.11].forEach((px, idx) => {
    const pH = (idx === 1 || idx === 2) ? 0.16 : 0.12;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, pH, 8), pagodaTerracotta);
    pillar.position.set(px, pH / 2, 0);
    tamQuanGroup.add(pillar);
  });
  const gateMidRoof = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.06, 4), pagodaTerracotta);
  gateMidRoof.rotation.y = Math.PI / 4;
  gateMidRoof.scale.set(1.2, 1, 0.7);
  gateMidRoof.position.set(0, 0.18, 0);
  const gateSideRoofL = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.04, 4), pagodaTerracotta);
  gateSideRoofL.rotation.y = Math.PI / 4;
  gateSideRoofL.position.set(-0.08, 0.135, 0);
  const gateSideRoofR = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.04, 4), pagodaTerracotta);
  gateSideRoofR.rotation.y = Math.PI / 4;
  gateSideRoofR.position.set(0.08, 0.135, 0);
  tamQuanGroup.add(gateMidRoof, gateSideRoofL, gateSideRoofR);

  // Đèn hoa đăng thả trên mặt Hồ Tây
  [[0.42, 0.16], [0.50, -0.14], [-0.46, 0.12]].forEach(([hx, hz]) => {
    const hoaDang = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.012, 0.024, 6), lanternGlowMat);
    hoaDang.position.set(hx, 0.088, hz);
    group.add(hoaDang);
  });

  group.add(
    lake,
    courtyard,
    balustrade,
    causeway,
    tamQuanGroup,
    bodhiTrunk,
    branch1,
    branch2,
    canopy1,
    canopy2,
    canopy3,
    incenseAltar,
    censer
  );
}


// ============================================================================
// CASE 32: PHỐ CỔ HÀ NỘI - CỬA Ô QUAN CHƯỞNG VỌNG LÂU & DÃY NHÀ 36 PHỐ PHƯỜNG
// ============================================================================
export function buildOQuanChuongGate(group: THREE.Group): void {
  const brickGateMat = LandmarkMaterials.getMat('oQuanChuongBrick', () => new THREE.MeshStandardMaterial({
    color: '#8D3B24',
    roughness: 0.65
  }));
  const stoneTrimMat = LandmarkMaterials.getMat('oQuanChuongStoneTrim', () => new THREE.MeshStandardMaterial({
    color: '#BDC3C7',
    roughness: 0.48
  }));
  const ochreWallMat = LandmarkMaterials.getMat('hnOchreWall', () => new THREE.MeshStandardMaterial({
    color: '#F39C12',
    roughness: 0.52
  }));
  const fishScaleRoofMat = LandmarkMaterials.getMat('hnFishScaleRoof', () => new THREE.MeshStandardMaterial({
    color: '#9C3D26',
    roughness: 0.52
  }));
  const woodPillarMat = LandmarkMaterials.getMat('hnDarkWood', () => new THREE.MeshStandardMaterial({
    color: '#3E2723',
    roughness: 0.6
  }));
  const voidDarkMat = LandmarkMaterials.getMat('portalDark', () => new THREE.MeshStandardMaterial({
    color: '#1E272E',
    roughness: 0.9
  }));
  const shutterGreenMat = LandmarkMaterials.getMat('hnShutterGreen', () => new THREE.MeshStandardMaterial({
    color: '#1B5E20',
    roughness: 0.45
  }));
  const pavementMat = LandmarkMaterials.getMat('hnPavementStone', () => new THREE.MeshStandardMaterial({
    color: '#7F8C8D',
    roughness: 0.7
  }));

  // 1. Nền vỉa hè lát đá phiến xanh cổ & Lòng đường phố cổ
  const plinth = new THREE.Mesh(new RoundedBoxGeometry(1.32, 0.06, 0.96, 3, 0.03), pavementMat);
  plinth.position.set(0, 0.03, 0.04);
  plinth.receiveShadow = true;
  group.add(plinth);

  // 2. Cửa Ô Quan Chưởng (Đông Hà Môn): Khối thành gạch vồ xám nâu rêu phong
  const gateX = -0.22;
  const gateZ = 0.06;

  // Bệ móng đá thành cửa ô
  const gatePlinth = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.08, 0.44, 3, 0.02), stoneTrimMat);
  gatePlinth.position.set(gateX, 0.08, gateZ);
  gatePlinth.receiveShadow = true;

  // Khối tường gạch vồ dày kiên cố
  const gateWall = new THREE.Mesh(new RoundedBoxGeometry(0.80, 0.48, 0.42, 3, 0.03), brickGateMat);
  gateWall.position.set(gateX, 0.34, gateZ);
  gateWall.castShadow = true;

  // Gờ phào đá trắng ngăn cách tầng tường thành và sàn vọng lâu
  const gateCornice = new THREE.Mesh(new RoundedBoxGeometry(0.84, 0.04, 0.46, 2, 0.01), stoneTrimMat);
  gateCornice.position.set(gateX, 0.59, gateZ);

  // 3 Cửa vòm cuốn tò vò (1 vòm chính lớn ở giữa, 2 vòm phụ hai bên)
  const mainArch = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.36, 0.44, 2, 0.04), voidDarkMat);
  mainArch.position.set(gateX, 0.22, gateZ);

  const mainArchRing = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.014, 6, 16, Math.PI), stoneTrimMat);
  mainArchRing.position.set(gateX, 0.28, gateZ + 0.215);

  // Cánh cửa gỗ lim nạm đinh đồng hé mở trong cổng chính
  const brassStudMat = LandmarkMaterials.getMat('oQuanChuongBrassStud', () => new THREE.MeshStandardMaterial({
    color: '#F1C40F',
    metalness: 0.85,
    roughness: 0.22
  }));
  [-0.085, 0.085].forEach((dx, idx) => {
    const gateLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.30, 0.02), woodPillarMat);
    gateLeaf.position.set(gateX + dx, 0.21, gateZ + 0.16);
    gateLeaf.rotation.y = idx === 0 ? 0.35 : -0.35;
    const stud = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), brassStudMat);
    stud.position.set(gateX + dx, 0.24, gateZ + 0.175);
    group.add(gateLeaf, stud);
  });

  const sideArchL = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.25, 0.44, 2, 0.03), voidDarkMat);
  sideArchL.position.set(gateX - 0.24, 0.18, gateZ);

  const sideArchR = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.25, 0.44, 2, 0.03), voidDarkMat);
  sideArchR.position.set(gateX + 0.24, 0.18, gateZ);

  // Biển ngạch đá chạm khắc "ĐÔNG HÀ MÔN" phía trên vòm cổng chính
  const tablet = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.06, 0.435, 2, 0.005), stoneTrimMat);
  tablet.position.set(gateX, 0.46, gateZ);

  // Lan can con tiện gạch & lỗ châu mai trên mặt thành
  const parapetFront = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.08, 0.03, 2, 0.005), brickGateMat);
  parapetFront.position.set(gateX, 0.64, gateZ + 0.21);

  const parapetBack = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.08, 0.03, 2, 0.005), brickGateMat);
  parapetBack.position.set(gateX, 0.64, gateZ - 0.21);

  group.add(gatePlinth, gateWall, gateCornice, mainArch, mainArchRing, sideArchL, sideArchR, tablet, parapetFront, parapetBack);

  // 3. Vọng Lâu 2 Tầng Cổ Kính trên nóc Cửa Ô
  const watchTowerBody = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.24, 0.30, 2, 0.02), ochreWallMat);
  watchTowerBody.position.set(gateX, 0.73, gateZ);
  watchTowerBody.castShadow = true;

  // 4 Cột gỗ son nâng đỡ vọng lâu
  [[-0.20, -0.12], [0.20, -0.12], [-0.20, 0.12], [0.20, 0.12]].forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.24, 8), woodPillarMat);
    pillar.position.set(gateX + px, 0.73, gateZ + pz);
    group.add(pillar);
  });

  // Tầng mái diêm dưới của Vọng Lâu 2 tầng
  const lowerWatchRoof = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.46, 0.08, 4), fishScaleRoofMat);
  lowerWatchRoof.rotation.y = Math.PI / 4;
  lowerWatchRoof.position.set(gateX, 0.83, gateZ);

  // Mái ngói vảy cá cong 4 góc đầu đao vút nhọn (tầng trên)
  const roofTower = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.58, 0.18, 4), fishScaleRoofMat);
  roofTower.rotation.y = Math.PI / 4;
  roofTower.position.set(gateX, 0.94, gateZ);
  roofTower.castShadow = true;

  // Bờ nóc đắp nổi hình hoa sen & kìm nóc
  const roofRidge = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.035, 0.035, 2, 0.008), stoneTrimMat);
  roofRidge.position.set(gateX, 1.01, gateZ);

  group.add(watchTowerBody, lowerWatchRoof, roofTower, roofRidge);

  // 4. Dãy Nhà Phố Cổ 36 Phố Phường Liền Kề (Nhà Ống Hà Nội Xưa)
  const houseX = 0.36;
  const warmShopGlassMat = LandmarkMaterials.getWarmWindowMat();
  const goldLanternMat = LandmarkMaterials.getMat('hnGoldLantern', () => new THREE.MeshStandardMaterial({
    color: '#F1C40F',
    emissive: '#F39C12',
    emissiveIntensity: 0.75
  }));
  const flowerPinkMat = LandmarkMaterials.getMat('hnBougainvilleaPink', () => new THREE.MeshStandardMaterial({
    color: '#FD79A8',
    roughness: 0.45
  }));
  const foliageGreenMat = LandmarkMaterials.getMat('hnPotLeafGreen', () => new THREE.MeshStandardMaterial({
    color: '#27AE60',
    roughness: 0.5
  }));

  // Nhà 1: Nhà ống 2 tầng vàng hoàng thổ với cửa sổ chớp xanh lá & ban công sắt
  const house1 = new THREE.Mesh(new RoundedBoxGeometry(0.40, 0.68, 0.44, 3, 0.03), ochreWallMat);
  house1.position.set(houseX, 0.38, -0.12);
  house1.castShadow = true;

  // Mái ngói ngói vảy cá dốc tầng 2
  const roof1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.48, 0.20, 4), fishScaleRoofMat);
  roof1.rotation.y = Math.PI / 4;
  roof1.position.set(houseX, 0.80, -0.12);

  // Cửa sổ chớp xanh lá đậm tầng 2 & ô kính phát sáng ấm
  const shutter1 = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.16, 0.02, 2, 0.005), shutterGreenMat);
  shutter1.position.set(houseX, 0.52, 0.105);
  const windowGlow1 = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.12), warmShopGlassMat);
  windowGlow1.position.set(houseX, 0.52, 0.116);

  // Ban công sắt uốn hoa văn tầng 2
  const balcony = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.06, 0.08, 2, 0.01), woodPillarMat);
  balcony.position.set(houseX, 0.42, 0.12);

  // Cửa ra vào tầng trệt & biển hiệu gỗ cổ
  const door1 = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.26, 0.02, 2, 0.01), woodPillarMat);
  door1.position.set(houseX, 0.19, 0.105);
  const shopSign = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.055, 0.02, 1, 0.005), woodPillarMat);
  shopSign.position.set(houseX, 0.35, 0.112);

  // Nhà 2: Nhà 1 tầng mái ngói rêu phong kề bên
  const house2 = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.48, 0.38, 3, 0.02), ochreWallMat);
  house2.position.set(houseX - 0.04, 0.28, 0.24);
  house2.castShadow = true;

  const roof2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.42, 0.16, 4), fishScaleRoofMat);
  roof2.rotation.y = Math.PI / 4;
  roof2.position.set(houseX - 0.04, 0.58, 0.24);

  // Cửa sổ nhỏ nhà 2 & ô sáng ấm
  const shutter2 = new THREE.Mesh(new RoundedBoxGeometry(0.10, 0.12, 0.02, 2, 0.005), shutterGreenMat);
  shutter2.position.set(houseX - 0.04, 0.34, 0.435);
  const windowGlow2 = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.08), warmShopGlassMat);
  windowGlow2.position.set(houseX - 0.04, 0.34, 0.446);

  // Đèn lồng đỏ & vàng treo dây phố cổ
  const lanternMat = LandmarkMaterials.getMat('hnRedLantern', () => new THREE.MeshStandardMaterial({
    color: '#D63031',
    emissive: '#FF7675',
    emissiveIntensity: 0.6
  }));
  const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), lanternMat);
  lantern.position.set(houseX - 0.14, 0.46, 0.14);

  [0.06, 0.14, 0.22].forEach((lx, idx) => {
    const stringLantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.024, 8, 8),
      idx % 2 === 0 ? lanternMat : goldLanternMat
    );
    stringLantern.position.set(lx, 0.48 - Math.sin((idx + 1) * 0.6) * 0.03, 0.26);
    group.add(stringLantern);
  });

  // Chậu cây hoa giấy trước hiên nhà cổ
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.026, 0.05, 8), brickGateMat);
  pot.position.set(houseX - 0.16, 0.085, 0.42);
  const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.045, 0), foliageGreenMat);
  bush.position.set(houseX - 0.16, 0.13, 0.42);
  const blossom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.028, 0), flowerPinkMat);
  blossom.position.set(houseX - 0.15, 0.155, 0.43);

  group.add(
    house1, roof1, shutter1, windowGlow1, balcony, door1, shopSign,
    house2, roof2, shutter2, windowGlow2, lantern, pot, bush, blossom
  );
}


// ============================================================================
// CASE 34: CỘT CỜ HÀ NỘI - KỲ ĐÀI THĂNG LONG (3 TẦNG ĐẾ GẠCH ĐỎ & CỜ ĐỎ SAO VÀNG)
// ============================================================================
export function buildCotCoHaNoi(group: THREE.Group): void {
  const redBrickMat = LandmarkMaterials.getMat('cotCoRedBrick', () => new THREE.MeshStandardMaterial({
    color: '#B3391E',
    roughness: 0.62
  }));
  const stoneTrimMat = LandmarkMaterials.getMat('cotCoStoneTrim', () => new THREE.MeshStandardMaterial({
    color: '#DFE6E9',
    roughness: 0.45
  }));
  const vnFlagRedMat = LandmarkMaterials.getMat('vietnamFlagRed', () => new THREE.MeshBasicMaterial({
    color: '#DA251D',
    side: THREE.DoubleSide
  }));
  const goldStarMat = LandmarkMaterials.getMat('shinyGold', () => new THREE.MeshStandardMaterial({
    color: '#F1C40F',
    emissive: '#F1C40F',
    emissiveIntensity: 0.65
  }));
  const cannonBronzeMat = LandmarkMaterials.getMat('cannonBronze', () => new THREE.MeshStandardMaterial({
    color: '#4B4B4B',
    metalness: 0.85,
    roughness: 0.28
  }));

  // 1. Cấu trúc 3 tầng đế vuông giật cấp hình chóp cụt xây bằng gạch đỏ nung
  // Tầng 1: Đế rộng nhất
  const tier1 = new THREE.Mesh(new RoundedBoxGeometry(1.18, 0.24, 1.05, 3, 0.04), redBrickMat);
  tier1.position.set(0, 0.12, 0);
  tier1.receiveShadow = true;
  tier1.castShadow = true;

  const trim1 = new THREE.Mesh(new RoundedBoxGeometry(1.22, 0.03, 1.09, 2, 0.01), stoneTrimMat);
  trim1.position.set(0, 0.24, 0);

  // Tầng 2: Thu nhỏ giật cấp
  const tier2 = new THREE.Mesh(new RoundedBoxGeometry(0.88, 0.24, 0.82, 3, 0.03), redBrickMat);
  tier2.position.set(0, 0.36, 0);
  tier2.castShadow = true;

  const trim2 = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.03, 0.86, 2, 0.01), stoneTrimMat);
  trim2.position.set(0, 0.48, 0);

  // Tầng 3: Tầng chóp cụt có cửa vòm tò vò
  const tier3 = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.24, 0.58, 3, 0.03), redBrickMat);
  tier3.position.set(0, 0.60, 0);
  tier3.castShadow = true;

  // Cửa vòm cuốn tò vò đón gió ở tầng 3 (Hướng Nghênh Húc / Hướng Minh) & vòm cổng tầng 1
  const portalVoidMat = LandmarkMaterials.getMat('cotCoPortalVoid', () => new THREE.MeshStandardMaterial({ color: '#1E272E', roughness: 0.85 }));
  const archDoor = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.16, 0.04, 2, 0.01), stoneTrimMat);
  archDoor.position.set(0, 0.64, 0.292);
  const archDoorVoid = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.12, 0.045, 2, 0.008), portalVoidMat);
  archDoorVoid.position.set(0, 0.62, 0.294);

  // Tường hoa / lan can con tiện gạch đỏ trên bờ thành tầng 1 & tầng 2
  const addBattlements = (w: number, d: number, y: number, countX: number) => {
    for (let i = 0; i < countX; i++) {
      const x = -w / 2 + 0.06 + (i / (countX - 1)) * (w - 0.12);
      if (Math.abs(x) < 0.14) continue; // Chừa lối cầu thang chính giữa
      const merlonF = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.045, 0.025), redBrickMat);
      merlonF.position.set(x, y, d / 2 - 0.015);
      const merlonB = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.045, 0.025), redBrickMat);
      merlonB.position.set(x, y, -d / 2 + 0.015);
      group.add(merlonF, merlonB);
    }
  };
  addBattlements(1.18, 1.05, 0.275, 8);
  addBattlements(0.88, 0.82, 0.515, 6);

  // Cầu thang đá hoa cương giật 6 bậc dẫn lên mặt trước & tay vịn đá hai bên
  const stairs = new THREE.Group();
  for (let s = 0; s < 6; s++) {
    const stepH = 0.075;
    const step = new THREE.Mesh(new RoundedBoxGeometry(0.22, stepH, 0.075, 1, 0.005), stoneTrimMat);
    step.position.set(0, 0.04 + s * 0.072, 0.50 - s * 0.045);
    stairs.add(step);
  }
  [-0.12, 0.12].forEach(rx => {
    const rail = new THREE.Mesh(new RoundedBoxGeometry(0.028, 0.06, 0.34, 1, 0.005), stoneTrimMat);
    rail.position.set(rx, 0.28, 0.39);
    rail.rotation.x = -0.95;
    stairs.add(rail);
  });

  // 2 Khẩu thần công thời Nguyễn đúc đồng có bệ gỗ & bánh xe trên bờ thành tầng 1
  const carriageWoodMat = LandmarkMaterials.getMat('cannonCarriageWood', () => new THREE.MeshStandardMaterial({ color: '#5D4037', roughness: 0.65 }));
  [-0.42, 0.42].forEach(cx => {
    const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.028, 0.15, 8), cannonBronzeMat);
    cannon.rotation.x = Math.PI / 2 - 0.15;
    cannon.position.set(cx, 0.285, 0.36);
    const carriage = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.03, 0.09, 1, 0.005), carriageWoodMat);
    carriage.position.set(cx, 0.265, 0.35);
    [-0.032, 0.032].forEach(wx => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 10), carriageWoodMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(cx + wx, 0.268, 0.36);
      group.add(wheel);
    });
    group.add(cannon, carriage);
  });

  // 4 Đèn rọi ấm chiếu sáng thân Cột Cờ trên góc tầng 3
  const uplightMat = LandmarkMaterials.getMat('cotCoUplightGlow', () => new THREE.MeshStandardMaterial({
    color: '#FFEAA7',
    emissive: '#F1C40F',
    emissiveIntensity: 0.95
  }));
  [[-0.26, -0.24], [0.26, -0.24], [-0.26, 0.24], [0.26, 0.24]].forEach(([ux, uz]) => {
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.024, 8), uplightMat);
    lamp.position.set(ux, 0.73, uz);
    group.add(lamp);
  });

  group.add(archDoorVoid);

  // 2. Thân cột cờ hình bát giác cao vút & Vọng canh trên đỉnh
  const octagonalTower = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.78, 8), redBrickMat);
  octagonalTower.position.set(0, 1.10, 0);
  octagonalTower.castShadow = true;

  // Lỗ thông gió hình hoa thị bát giác quanh thân cột cờ
  const ventMat = LandmarkMaterials.getMat('cotCoVentDark', () => new THREE.MeshStandardMaterial({ color: '#2C3A47', roughness: 0.8 }));
  [0.95, 1.25].forEach(vy => {
    const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.03, 8), ventMat);
    vent.position.set(0, vy, 0);
    group.add(vent);
  });

  const watchPavilion = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.16, 8), stoneTrimMat);
  watchPavilion.position.set(0, 1.56, 0);

  const pavilionRoof = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.24, 0.08, 8), redBrickMat);
  pavilionRoof.position.set(0, 1.66, 0);

  // Cột cán cờ thép vững chãi có quả cầu đồng mạ vàng uy nghi
  const flagMast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.56, 8), stoneTrimMat);
  flagMast.position.set(0, 1.90, 0);

  const mastFinial = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), goldStarMat);
  mastFinial.position.set(0, 2.20, 0);

  // 3. Cụm lá cờ đỏ sao vàng 3D tung bay kiêu hãnh (Bắt buộc float_wave & 2 ShapeGeometry sao 5 cánh!)
  const flagGroup = new THREE.Group();
  flagGroup.position.set(0.012, 2.02, 0);
  flagGroup.userData = { animType: 'float_wave' };

  const flagCloth = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.24, 0.012, 2, 0.003), vnFlagRedMat);
  flagCloth.position.set(0.18, 0, 0);
  flagCloth.castShadow = true;

  const starShape = LandmarkHelpers.create5PointStarShape(0.068, 0.026);
  const starGeo = new THREE.ShapeGeometry(starShape);

  // Mặt trước lá cờ (+Z)
  const starFront = new THREE.Mesh(starGeo, goldStarMat);
  starFront.position.set(0.18, 0, 0.007);

  // Mặt sau lá cờ (-Z)
  const starBack = new THREE.Mesh(starGeo, goldStarMat);
  starBack.position.set(0.18, 0, -0.007);
  starBack.rotation.y = Math.PI;

  flagGroup.add(flagCloth, starFront, starBack);

  group.add(tier1, trim1, tier2, trim2, tier3, archDoor, stairs, octagonalTower, watchPavilion, pavilionRoof, flagMast, mastFinial, flagGroup);
}


// ============================================================================
// CASE 37: LANDMARK 81 - TÒA THÁP BÓ TRE & SPIRE PHA LÊ
// ============================================================================
export function buildLandmark81(group: THREE.Group): void {
  const glassCyanMat = LandmarkMaterials.getMat('l81GlassCyanSunset', () => new THREE.MeshStandardMaterial({
    color: '#54A0FF',
    emissive: '#0984E3',
    emissiveIntensity: 0.45,
    roughness: 0.08,
    metalness: 0.92
  }));
  const mullionMat = LandmarkMaterials.getMat('l81MullionChrome', () => new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    metalness: 0.95,
    roughness: 0.08
  }));
  const neonLedMat = LandmarkMaterials.getMat('l81NeonRib', () => new THREE.MeshStandardMaterial({
    color: '#E0F7FA',
    emissive: '#00CEC9',
    emissiveIntensity: 1.15,
    roughness: 0.12
  }));
  const spireGoldMat = LandmarkMaterials.getMat('l81SpireGold', () => new THREE.MeshStandardMaterial({
    color: '#F1C40F',
    emissive: '#F1C40F',
    emissiveIntensity: 0.9,
    metalness: 0.92,
    roughness: 0.10
  }));
  const beaconRedMat = LandmarkMaterials.getMat('l81BeaconRed', () => new THREE.MeshStandardMaterial({
    color: '#FF3838',
    emissive: '#FF3838',
    emissiveIntensity: 1.4
  }));
  const podiumMat = LandmarkMaterials.getMat('l81PodiumMarble', () => new THREE.MeshStandardMaterial({
    color: '#F8FAFC',
    roughness: 0.25,
    metalness: 0.12
  }));

  // 1. Khối đế phức hợp TTTM Vincom Center Landmark 81 hai tầng giật cấp
  const podiumBase = new THREE.Mesh(new RoundedBoxGeometry(1.32, 0.12, 1.12, 3, 0.04), podiumMat);
  podiumBase.position.set(0, 0.06, 0.04);
  podiumBase.receiveShadow = true;

  const podiumUpper = new THREE.Mesh(new RoundedBoxGeometry(1.18, 0.10, 0.98, 3, 0.03), glassCyanMat);
  podiumUpper.position.set(0, 0.15, 0.04);
  podiumUpper.castShadow = true;

  // Mái sảnh đón vòm kính hiện đại trước cổng vào TTTM
  const entranceCanopy = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.035, 0.22, 2, 0.015), mullionMat);
  entranceCanopy.position.set(0, 0.14, 0.58);

  const entranceRug = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 0.16),
    LandmarkMaterials.getMat('l81RugBlue', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.5 }))
  );
  entranceRug.rotation.x = -Math.PI / 2;
  entranceRug.position.set(0, 0.122, 0.58);

  group.add(podiumBase, podiumUpper, entranceCanopy, entranceRug);

  // Dải kính phát sáng ấm quanh khối đế TTTM Vincom Center
  const warmMallMat = LandmarkMaterials.getWarmWindowMat();
  const mallBandF = new THREE.Mesh(new THREE.BoxGeometry(1.19, 0.045, 0.02), warmMallMat);
  mallBandF.position.set(0, 0.15, 0.53);
  const mallBandB = new THREE.Mesh(new THREE.BoxGeometry(1.19, 0.045, 0.02), warmMallMat);
  mallBandB.position.set(0, 0.15, -0.45);
  group.add(mallBandF, mallBandB);

  // Tiểu cảnh công viên Vinhomes Central Park & cột đèn LED hiện đại hai bên sảnh đón
  const parkGreenMat = LandmarkMaterials.getMat('l81ParkGrass', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.45 }));
  [-0.44, 0.44].forEach(px => {
    const planter = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.035, 0.16, 2, 0.01), podiumMat);
    planter.position.set(px, 0.135, 0.48);
    const bush1 = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), parkGreenMat);
    bush1.position.set(px - 0.04, 0.175, 0.48);
    const bush2 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), parkGreenMat);
    bush2.position.set(px + 0.04, 0.17, 0.48);
    const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.10, 8), neonLedMat);
    bollard.position.set(px * 0.68, 0.17, 0.54);
    group.add(planter, bush1, bush2, bollard);
  });

  // 2. Cấu trúc 17 cụm ống giật cấp mô phỏng Bó Tre truyền thống (Bamboo Bundle)
  const tubePositions = [
    // 8 Cột ngoài thấp nhất tạo dáng bó tre xòe gốc (Tầng 1-25, cao 0.68 - 0.82 units)
    [-0.36, -0.14, 0.68, 0.15], [0.36, -0.14, 0.68, 0.15],
    [-0.36, 0.14, 0.76, 0.15], [0.36, 0.14, 0.76, 0.15],
    [-0.14, -0.36, 0.74, 0.15], [0.14, -0.36, 0.74, 0.15],
    [-0.14, 0.36, 0.82, 0.15], [0.14, 0.36, 0.82, 0.15],
    // 4 Cột góc trung bình (Tầng 1-40, cao 1.12 units)
    [-0.23, -0.23, 1.12, 0.21], [0.23, -0.23, 1.12, 0.21],
    [-0.23, 0.23, 1.12, 0.21], [0.23, 0.23, 1.12, 0.21],
    // 4 Cột cạnh vươn cao trung gian (Tầng 41-65, cao 1.84 units)
    [0, -0.23, 1.84, 0.22], [0, 0.23, 1.84, 0.22],
    [-0.23, 0, 1.84, 0.22], [0.23, 0, 1.84, 0.22],
    // 1 Tháp lõi vươn lên đỉnh trời (Tầng 66-81, cao 2.58 units)
    [0, 0, 2.58, 0.23]
  ];

  tubePositions.forEach(([tx, tz, th, tw]) => {
    // Thân ống kính phản chiếu
    const colGeo = new RoundedBoxGeometry(tw, th, tw, 3, 0.022);
    const colMesh = new THREE.Mesh(colGeo, glassCyanMat);
    colMesh.position.set(tx, th / 2 + 0.18, tz);
    colMesh.castShadow = true;
    group.add(colMesh);

    // 4 Gờ gân thép đứng (Vertical Architectural Mullions) mạ crom sáng ở 4 góc cột
    const halfW = tw / 2 - 0.002;
    const ribGeo = new THREE.BoxGeometry(0.014, th, 0.014);
    [[-halfW, -halfW], [halfW, -halfW], [-halfW, halfW], [halfW, halfW]].forEach(([rx, rz]) => {
      const rib = new THREE.Mesh(ribGeo, mullionMat);
      rib.position.set(tx + rx, th / 2 + 0.18, tz + rz);
      group.add(rib);
    });

    // Đèn LED neon và đài quan sát gián đoạn ở đỉnh từng đốt tre
    const crownCap = new THREE.Mesh(new RoundedBoxGeometry(tw + 0.012, 0.036, tw + 0.012, 2, 0.01), neonLedMat);
    crownCap.position.set(tx, th + 0.18, tz);
    group.add(crownCap);

    // Vạch sàn kính ngang phân tầng kiến trúc (Architectural Spandrel Bands)
    const numBands = Math.floor(th / 0.35);
    for (let b = 1; b < numBands; b++) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(tw + 0.004, 0.014, tw + 0.004), mullionMat);
      band.position.set(tx, 0.18 + b * 0.35, tz);
      group.add(band);
    }
  });

  // 3. Hệ thống dải đèn LED neon dọc chạy dọc 4 sống lưng trung tâm tòa tháp
  const spineGeo = new THREE.BoxGeometry(0.02, 2.52, 0.02);
  [[0.115, 0], [-0.115, 0], [0, 0.115], [0, -0.115]].forEach(([sx, sz]) => {
    const spineLed = new THREE.Mesh(spineGeo, neonLedMat);
    spineLed.position.set(sx, 1.48, sz);
    group.add(spineLed);
  });

  // 4. Đài quan sát SkyView (Tầng 79-81) & Mũi tháp Spire thuôn nhọn
  const skyViewDeck = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.08, 0.26, 2, 0.02), mullionMat);
  skyViewDeck.position.set(0, 2.80, 0);

  const transitionCrown = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.52, 4), glassCyanMat);
  transitionCrown.rotation.y = Math.PI / 4;
  transitionCrown.position.set(0, 3.06, 0);

  // 5. Cột ăng-ten Spire mạ vàng vút cao & Đèn báo không đỏ nhấp nháy
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.042, 0.85, 16), spireGoldMat);
  antenna.position.set(0, 3.52, 0);

  const redBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), beaconRedMat);
  redBeacon.position.set(0, 3.42, 0.04);
  redBeacon.userData = { animType: 'pulse_red' };

  // Quả cầu pha lê đa giác phát sáng lấp lánh trên đỉnh Spire (Test requirement: rotate_pulse!)
  const crystalOrb = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.095, 1),
    neonLedMat
  );
  crystalOrb.position.set(0, 3.96, 0);
  crystalOrb.userData = { animType: 'rotate_pulse' };

  group.add(skyViewDeck, transitionCrown, antenna, redBeacon, crystalOrb);
}


// ============================================================================
// CASE 39: CHỢ BẾN THÀNH - NGUYỄN HUỆ (THÁP ĐỒNG HỒ 4 MẶT & ĐÀI PHUN NƯỚC)
// ============================================================================
export function buildBenThanhMarket(group: THREE.Group): void {
  const creamWallMat = LandmarkMaterials.getMat('benThanhCreamPlaster', () => new THREE.MeshStandardMaterial({
    color: '#FFF8E7',
    roughness: 0.38
  }));
  const terracottaRoofMat = LandmarkMaterials.getMat('benThanhTerracottaTile', () => new THREE.MeshStandardMaterial({
    color: '#E84118',
    roughness: 0.30
  }));
  const clockFaceMat = LandmarkMaterials.getMat('benThanhClockGold', () => new THREE.MeshStandardMaterial({
    color: '#FFEAA7',
    emissive: '#F1C40F',
    emissiveIntensity: 0.65
  }));
  const clockHandsMat = LandmarkMaterials.getMat('clockHandsBlack', () => new THREE.MeshBasicMaterial({
    color: '#1E272E'
  }));
  const granitePlazaMat = LandmarkMaterials.getMat('quachThiTrangGranite', () => new THREE.MeshStandardMaterial({
    color: '#DFE6E9',
    roughness: 0.45
  }));
  const waterAquaMat = LandmarkMaterials.getMat('fountainAqua', () => new THREE.MeshStandardMaterial({
    color: '#00CEC9',
    roughness: 0.10
  }));

  // 1. Quảng trường Quách Thị Trang & Phố Đi Bộ Nguyễn Huệ lát đá hoa cương
  const plaza = new THREE.Mesh(new RoundedBoxGeometry(1.30, 0.06, 0.96, 3, 0.03), granitePlazaMat);
  plaza.position.set(0, 0.03, 0.05);
  plaza.receiveShadow = true;

  // Vạch lát đá granite tương phản hoa văn phố đi bộ Nguyễn Huệ
  const darkGraniteMat = LandmarkMaterials.getMat('nguyenHueDarkGranite', () => new THREE.MeshStandardMaterial({ color: '#636E72', roughness: 0.55 }));
  [-0.35, 0.35].forEach(gx => {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.88), darkGraniteMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(gx, 0.062, 0.05);
    group.add(stripe);
  });

  // Bồn phun nước nghệ thuật tròn
  const fountainBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.22, 0.08, 16), creamWallMat);
  fountainBasin.position.set(0, 0.08, 0.36);
  const fountainWater = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.09, 14), waterAquaMat);
  fountainWater.position.set(0, 0.085, 0.36);

  // Vòng sóng nước lăn tăn quanh đài phun nước
  const fountainRipple = new THREE.Mesh(
    new THREE.RingGeometry(0.23, 0.28, 16),
    LandmarkMaterials.getMat('benThanhRippleMat', () => new THREE.MeshBasicMaterial({
      color: '#E0F2FE',
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    }))
  );
  fountainRipple.rotation.x = -Math.PI / 2;
  fountainRipple.position.set(0, 0.063, 0.36);
  group.add(fountainRipple);

  // Cột tia nước geyser phát quang (Test requirement: animType: 'flicker'!)
  const fountainJet = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 0.18, 10),
    LandmarkMaterials.getMat('benThanhJetGlow', () => new THREE.MeshStandardMaterial({
      color: '#E0F7FA',
      emissive: '#00CEC9',
      emissiveIntensity: 0.70,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    }))
  );
  fountainJet.position.set(0, 0.18, 0.36);
  fountainJet.userData = { animType: 'flicker' };
  group.add(fountainJet);

  // Đèn đường hoa lệ phố đi bộ Nguyễn Huệ
  const lampPostMat = LandmarkMaterials.getMat('nguyenHueLampPost', () => new THREE.MeshStandardMaterial({
    color: '#2D3436',
    metalness: 0.85,
    roughness: 0.25
  }));
  const lampLightMat = LandmarkMaterials.getMat('nguyenHueLampGlow', () => new THREE.MeshStandardMaterial({
    color: '#FFEAA7',
    emissive: '#F1C40F',
    emissiveIntensity: 1.20
  }));
  [-0.48, 0.48].forEach(lx => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.32, 8), lampPostMat);
    post.position.set(lx, 0.22, 0.36);
    const lampHead = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), lampLightMat);
    lampHead.position.set(lx, 0.38, 0.36);
    group.add(post, lampHead);
  });

  // 2. Cửa Nam Chợ Bến Thành với mái tam giác ngói đỏ & Tháp đồng hồ 4 mặt cổ kính
  const basePortal = new THREE.Mesh(new RoundedBoxGeometry(1.18, 0.50, 0.64, 4, 0.05), creamWallMat);
  basePortal.position.set(0, 0.28, -0.08);
  basePortal.castShadow = true;

  const doorVoidMat = LandmarkMaterials.getMat('portalVoidDark', () => new THREE.MeshStandardMaterial({ color: '#1E272E' }));
  const warmMarketMat = LandmarkMaterials.getWarmWindowMat();
  const awningGreenMat = LandmarkMaterials.getMat('benThanhAwningGreen', () => new THREE.MeshStandardMaterial({ color: '#009432', roughness: 0.45 }));

  const mainArch = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.36, 0.08, 3, 0.04), doorVoidMat);
  mainArch.position.set(0, 0.22, 0.22);

  // Ánh sáng ấm bên trong cửa chợ & 2 cửa vòm phụ hai bên
  const innerMarketGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.20, 0.28), warmMarketMat);
  innerMarketGlow.position.set(0, 0.21, 0.262);
  [-0.38, 0.38].forEach(sx => {
    const sideArch = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.24, 0.06, 2, 0.03), doorVoidMat);
    sideArch.position.set(sx, 0.19, 0.22);
    const sideAwning = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.03, 0.12, 2, 0.008), awningGreenMat);
    sideAwning.position.set(sx, 0.34, 0.26);
    sideAwning.rotation.x = 0.22;
    group.add(sideArch, sideAwning);
  });

  // Mái hiên tam giác (Pediment) đặc trưng mặt tiền Cửa Nam
  const frontPediment = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.18, 4), terracottaRoofMat);
  frontPediment.rotation.y = Math.PI / 4;
  frontPediment.scale.set(1.3, 1, 0.5);
  frontPediment.position.set(0, 0.64, 0.20);

  // Bồn hoa & ghế đá phố đi bộ Nguyễn Huệ hai bên quảng trường
  const benchStoneMat = LandmarkMaterials.getMat('nguyenHueBenchStone', () => new THREE.MeshStandardMaterial({ color: '#B2BEC3', roughness: 0.5 }));
  const flowerBushMat = LandmarkMaterials.getMat('nguyenHueFlowerBush', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.5 }));
  [-0.38, 0.38].forEach(bx => {
    const bench = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.04, 0.06, 1, 0.005), benchStoneMat);
    bench.position.set(bx, 0.08, 0.42);
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), flowerBushMat);
    bush.position.set(bx * 1.32, 0.09, 0.42);
    group.add(bench, bush);
  });

  const lowerRoof = new THREE.Mesh(new RoundedBoxGeometry(1.22, 0.08, 0.72, 3, 0.04), terracottaRoofMat);
  lowerRoof.position.set(0, 0.56, -0.08);

  const clockTower = new THREE.Mesh(new RoundedBoxGeometry(0.64, 0.68, 0.64, 4, 0.05), creamWallMat);
  clockTower.position.set(0, 0.94, -0.08);
  clockTower.castShadow = true;

  // Phào chỉ đầu tháp đồng hồ
  const towerCornice = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.04, 0.68, 2, 0.01), terracottaRoofMat);
  towerCornice.position.set(0, 1.27, -0.08);

  const clockPositions = [
    [0, 1.02, 0.25, 0],
    [0, 1.02, -0.41, Math.PI],
    [0.33, 1.02, -0.08, Math.PI / 2],
    [-0.33, 1.02, -0.08, -Math.PI / 2]
  ];

  const brassMat = LandmarkMaterials.getMat('clockBezelBrass', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.8 }));
  clockPositions.forEach(([cx, cy, cz, rotY]) => {
    const clockGroup = new THREE.Group();
    clockGroup.position.set(cx, cy, cz);
    clockGroup.rotation.y = rotY;

    const frame = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 8, 20), brassMat);
    const dial = new THREE.Mesh(new THREE.CircleGeometry(0.125, 16), clockFaceMat);

    const handH = new THREE.Mesh(new THREE.PlaneGeometry(0.015, 0.058), clockHandsMat);
    handH.position.set(-0.016, 0.018, 0.004);
    handH.rotation.z = 0.55;

    const handM = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.085), clockHandsMat);
    handM.position.set(0.022, 0.026, 0.005);
    handM.rotation.z = -0.65;

    clockGroup.add(frame, dial, handH, handM);
    group.add(clockGroup);
  });

  const spireRoof = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.48, 4), terracottaRoofMat);
  spireRoof.rotation.y = Math.PI / 4;
  spireRoof.position.set(0, 1.50, -0.08);
  spireRoof.castShadow = true;

  // Quả cầu và chóp spire mạ vàng trên đỉnh tháp đồng hồ
  const spireFinial = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 8, 8),
    LandmarkMaterials.getMat('benThanhGoldFinial', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      metalness: 0.92,
      roughness: 0.15
    }))
  );
  spireFinial.position.set(0, 1.76, -0.08);

  group.add(plaza, fountainBasin, fountainWater, basePortal, mainArch, innerMarketGlow, frontPediment, lowerRoof, clockTower, towerCornice, spireRoof, spireFinial);
}
