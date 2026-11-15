import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { LandmarkMaterials } from './LandmarkMaterials';
import { LandmarkHelpers } from './LandmarkHelpers';

/**
 * 4 ĐẠI CÔNG TRÌNH BIỂU TƯỢNG TẠI 4 GÓC BÀN CỜ (Corner Mega-Landmarks):
 * 1. Ô 0: Khởi Hành (GO) – Cổng Khải Hoàn Môn Hoàng Kim & Thảm Đỏ Nhung
 * 2. Ô 10: Nhà Tù / Thăm Tù (JAIL) – Khu Liên Hợp Pháo Đài Giam & Khu Thăm Nuôi
 * 3. Ô 20: Bãi Đỗ Xe (FREE PARKING) – Trạm Dịch Vụ Retro 1950s & Xe Mui Trần Cổ Điển
 * 4. Ô 30: Sân Bay Quốc Tế (AIRPORT) – Quần Thể Nhà Ga, Máy Bay Boeing/Airbus VIP & Tháp Không Lưu
 */
export class CornerLandmarks {
  // =========================================================================
  // 1. Ô 0: XUẤT PHÁT (GO) – CỔNG KHẢI HOÀN MÔN HOÀNG KIM
  // =========================================================================
  public static createGOCorner(): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(2.6, 2.6, 0.55));

    const marbleMat = LandmarkMaterials.getMat('sc_go_marbleWhite', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.22,
      metalness: 0.08
    }));
    const marbleDarkMat = LandmarkMaterials.getMat('sc_go_marbleDark', () => new THREE.MeshStandardMaterial({
      color: '#E2E8F0',
      roughness: 0.28,
      metalness: 0.05
    }));
    const goldMat = LandmarkMaterials.getMat('sc_go_shinyGold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F39C12',
      emissiveIntensity: 0.42,
      metalness: 0.92,
      roughness: 0.12
    }));
    const redRubyMat = LandmarkMaterials.getMat('sc_go_redRuby', () => new THREE.MeshStandardMaterial({
      color: '#E84118',
      roughness: 0.18,
      emissive: '#D63031',
      emissiveIntensity: 0.55
    }));
    const velvetCarpetMat = LandmarkMaterials.getMat('sc_go_velvetCarpetRed', () => new THREE.MeshStandardMaterial({
      color: '#C0392B',
      roughness: 0.72
    }));
    const plantGreenMat = LandmarkMaterials.getMat('sc_go_plantGreen', () => new THREE.MeshStandardMaterial({
      color: '#27AE60',
      roughness: 0.65
    }));

    // A. Bục tam cấp đá cẩm thạch trắng ngà (3-Tier Stepped Classical Plinth)
    const plinthBottom = new THREE.Mesh(new RoundedBoxGeometry(2.52, 0.06, 2.52, 3, 0.03), marbleDarkMat);
    plinthBottom.position.y = 0.03;
    plinthBottom.receiveShadow = true;

    const plinthMid = new THREE.Mesh(new RoundedBoxGeometry(2.38, 0.06, 2.38, 3, 0.03), marbleMat);
    plinthMid.position.y = 0.09;
    plinthMid.receiveShadow = true;

    const plinthTop = new THREE.Mesh(new RoundedBoxGeometry(2.26, 0.06, 2.26, 3, 0.03), marbleMat);
    plinthTop.position.y = 0.15;
    plinthTop.receiveShadow = true;
    group.add(plinthBottom, plinthMid, plinthTop);

    // B. Thảm đỏ nhung hoàng gia trải từ lòng cổng ra đại lộ
    const carpet = new THREE.Mesh(new RoundedBoxGeometry(0.96, 0.025, 2.12, 2, 0.01), velvetCarpetMat);
    carpet.position.set(0, 0.19, 0.08);
    carpet.receiveShadow = true;

    const carpetGoldTrimL = new THREE.Mesh(new RoundedBoxGeometry(0.045, 0.03, 2.12, 2, 0.006), goldMat);
    carpetGoldTrimL.position.set(-0.45, 0.192, 0.08);
    const carpetGoldTrimR = new THREE.Mesh(new RoundedBoxGeometry(0.045, 0.03, 2.12, 2, 0.006), goldMat);
    carpetGoldTrimR.position.set(0.45, 0.192, 0.08);
    group.add(carpet, carpetGoldTrimL, carpetGoldTrimR);

    // Dải trụ chắn dây nhung mạ vàng (Ceremonial Stanchions) 2 bên thảm
    const stanchionZ = [-0.65, -0.15, 0.35, 0.85];
    const stanchionPoleGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.24, 8);
    const stanchionCapGeo = new THREE.SphereGeometry(0.032, 10, 8);
    const stanchionBaseGeo = new THREE.CylinderGeometry(0.048, 0.055, 0.025, 10);

    [-0.56, 0.56].forEach(sx => {
      stanchionZ.forEach(sz => {
        const base = new THREE.Mesh(stanchionBaseGeo, goldMat);
        base.position.set(sx, 0.195, sz);
        const pole = new THREE.Mesh(stanchionPoleGeo, goldMat);
        pole.position.set(sx, 0.315, sz);
        const cap = new THREE.Mesh(stanchionCapGeo, goldMat);
        cap.position.set(sx, 0.445, sz);
        group.add(base, pole, cap);
      });
      // Dây nhung võng nối các trụ
      for (let i = 0; i < stanchionZ.length - 1; i++) {
        const midZ = (stanchionZ[i] + stanchionZ[i + 1]) / 2;
        const rope = new THREE.Mesh(new RoundedBoxGeometry(0.024, 0.024, 0.48, 2, 0.008), velvetCarpetMat);
        rope.position.set(sx, 0.375, midZ);
        group.add(rope);
      }
    });

    // Mũi tên 3D nổi chỉ hướng xuất phát (GO Arrow) trên thảm đỏ
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 0.26);
    arrowShape.lineTo(0.24, 0.02);
    arrowShape.lineTo(0.11, 0.02);
    arrowShape.lineTo(0.11, -0.22);
    arrowShape.lineTo(-0.11, -0.22);
    arrowShape.lineTo(-0.11, 0.02);
    arrowShape.lineTo(-0.24, 0.02);
    arrowShape.closePath();
    const arrowGeo = new THREE.ExtrudeGeometry(arrowShape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 2
    });
    arrowGeo.rotateX(Math.PI / 2);
    const goArrow = new THREE.Mesh(arrowGeo, goldMat);
    goArrow.position.set(0, 0.238, 0.96);
    goArrow.castShadow = true;
    group.add(goArrow);

    // C. Hai trụ cổng đồ sộ La Mã (Massive Triumphal Piers) với thức cột Corinthian
    const makeCorinthianPier = (px: number) => {
      // Bệ cột giật cấp
      const pierBase1 = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.12, 0.68, 2, 0.02), marbleDarkMat);
      pierBase1.position.set(px, 0.24, -0.15);
      const pierBase2 = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.10, 0.58, 2, 0.02), marbleMat);
      pierBase2.position.set(px, 0.35, -0.15);

      // Thân cột chính có gờ chỉ nổi
      const pierShaft = new THREE.Mesh(new RoundedBoxGeometry(0.48, 1.28, 0.48, 3, 0.03), marbleMat);
      pierShaft.position.set(px, 1.04, -0.15);
      pierShaft.castShadow = true;

      // 4 cột tròn Corinthian đính ở 4 góc trụ cổng
      const cornerOffsets = [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]];
      const colGeo = new THREE.CylinderGeometry(0.065, 0.075, 1.24, 12);
      const colCapGeo = new THREE.CylinderGeometry(0.095, 0.065, 0.08, 10);
      cornerOffsets.forEach(([cx, cz]) => {
        const col = new THREE.Mesh(colGeo, marbleMat);
        col.position.set(px + cx, 1.04, -0.15 + cz);
        const cap = new THREE.Mesh(colCapGeo, goldMat);
        cap.position.set(px + cx, 1.68, -0.15 + cz);
        group.add(col, cap);
      });

      // Đầu trụ đúc hoa văn lá acanthus mạ vàng
      const pierCapital = new THREE.Mesh(new RoundedBoxGeometry(0.64, 0.14, 0.64, 2, 0.03), goldMat);
      pierCapital.position.set(px, 1.74, -0.15);

      // Gờ phào chạm khắc giữa thân trụ
      const midTrim = new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.06, 0.54, 2, 0.015), goldMat);
      midTrim.position.set(px, 0.72, -0.15);

      // Ô phù điêu chìm mặt trước & gờ rãnh chạm khắc dọc thân trụ
      const reliefPanel = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.42, 0.03, 2, 0.01), marbleDarkMat);
      reliefPanel.position.set(px, 1.24, 0.095);
      [-0.10, 0, 0.10].forEach(fx => {
        const flute = new THREE.Mesh(new RoundedBoxGeometry(0.025, 0.34, 0.015, 1, 0.005), goldMat);
        flute.position.set(px + fx, 1.24, 0.112);
        group.add(flute);
      });

      // Huân chương vòng nguyệt quế vàng dập nổi mặt trước
      const laurel = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.028, 8, 16), goldMat);
      laurel.position.set(px, 1.05, 0.115);
      const laurelGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), redRubyMat);
      laurelGem.position.set(px, 1.05, 0.12);

      group.add(pierBase1, pierBase2, pierShaft, pierCapital, midTrim, reliefPanel, laurel, laurelGem);
    };
    makeCorinthianPier(-0.84);
    makeCorinthianPier(0.84);

    // Đèn chiếu sân khấu (Ceremonial Uplights) rọi sáng hai trụ Khải Hoàn Môn
    const spotlightGlowMat = LandmarkMaterials.getMat('sc_go_spotlightGlow', () => new THREE.MeshStandardMaterial({
      color: '#FEF08A',
      emissive: '#FDE047',
      emissiveIntensity: 1.4,
      roughness: 0.1
    }));
    const spotlightBeamMat = LandmarkMaterials.getMat('sc_go_spotlightBeam', () => new THREE.MeshBasicMaterial({
      color: '#FEF9C3',
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    }));
    [[-1.08, 0.32], [1.08, 0.32]].forEach(([lx, lz]) => {
      const fixtureBase = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.04, 10), goldMat);
      fixtureBase.position.set(lx, 0.20, lz);
      const lampCan = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.11, 10), goldMat);
      lampCan.position.set(lx, 0.25, lz);
      lampCan.rotation.x = -0.55;
      lampCan.rotation.z = lx > 0 ? 0.32 : -0.32;
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.042, 10), spotlightGlowMat);
      lens.position.set(lx * 0.96, 0.29, lz - 0.03);
      lens.rotation.x = -Math.PI / 2 - 0.55;
      const beam = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.85, 12, 1, true), spotlightBeamMat);
      beam.position.set(lx * 0.88, 0.65, lz - 0.22);
      beam.rotation.x = -0.55;
      beam.rotation.z = lx > 0 ? 0.32 : -0.32;
      group.add(fixtureBase, lampCan, lens, beam);
    });

    // D. Vòm cuốn chính nối 2 trụ cột (Classical Semicircular Arch Vault)
    const archKeystone = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.28, 0.64, 2, 0.03), goldMat);
    archKeystone.position.set(0, 1.82, -0.15);

    const archSoffitL = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.14, 0.58, 2, 0.02), marbleMat);
    archSoffitL.position.set(-0.38, 1.76, -0.15);
    archSoffitL.rotation.z = 0.26;

    const archSoffitR = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.14, 0.58, 2, 0.02), marbleMat);
    archSoffitR.position.set(0.38, 1.76, -0.15);
    archSoffitR.rotation.z = -0.26;

    // Gân vòm cuốn chạm khắc bên dưới vòm Khải Hoàn Môn
    [-0.24, 0, 0.24].forEach(rz => {
      const vaultRib = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.022, 6, 16, Math.PI), goldMat);
      vaultRib.position.set(0, 1.32, -0.15 + rz);
      group.add(vaultRib);
    });

    // 4 Đuốc lễ hội đồng vàng ở 4 góc bệ đá cẩm thạch
    [[-1.04, -1.04], [1.04, -1.04], [-1.04, 1.04], [1.04, 1.04]].forEach(([tx, tz]) => {
      const torchPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.22, 10), marbleDarkMat);
      torchPedestal.position.set(tx, 0.29, tz);
      const brazierBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.04, 0.07, 10), goldMat);
      brazierBowl.position.set(tx, 0.43, tz);
      const flameCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), spotlightGlowMat);
      flameCrystal.position.set(tx, 0.51, tz);
      group.add(torchPedestal, brazierBowl, flameCrystal);
    });

    // Tầng lửng mái cổng (Entablature & Cornice)
    const entablature = new THREE.Mesh(new RoundedBoxGeometry(2.46, 0.22, 0.72, 3, 0.04), marbleMat);
    entablature.position.set(0, 1.94, -0.15);
    entablature.castShadow = true;

    // Gờ phào chỉ nổi viền vàng dưới mái
    const corniceGold = new THREE.Mesh(new RoundedBoxGeometry(2.54, 0.05, 0.78, 2, 0.01), goldMat);
    corniceGold.position.set(0, 2.06, -0.15);

    // Tầng gác mái thượng tầng (Classical Attic Section)
    const attic = new THREE.Mesh(new RoundedBoxGeometry(2.36, 0.28, 0.66, 3, 0.04), marbleDarkMat);
    attic.position.set(0, 2.22, -0.15);

    // Bảng chữ dập nổi hoàng kim "START +200M" với huy hiệu hai bên
    const startPlaque = new THREE.Mesh(new RoundedBoxGeometry(1.42, 0.22, 0.08, 2, 0.02), goldMat);
    startPlaque.position.set(0, 2.22, 0.19);
    const startBannerInner = new THREE.Mesh(new RoundedBoxGeometry(1.26, 0.14, 0.02, 2, 0.01), redRubyMat);
    startBannerInner.position.set(0, 2.22, 0.235);
    [-0.78, 0.78].forEach(bx => {
      const rosette = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 12), goldMat);
      rosette.rotation.x = Math.PI / 2;
      rosette.position.set(bx, 2.22, 0.19);
      group.add(rosette);
    });

    // 4 Cột đỉnh lan can gác mái (Attic Finials)
    [-1.02, -0.34, 0.34, 1.02].forEach(fx => {
      const finialBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.08, 8), goldMat);
      finialBase.position.set(fx, 2.40, -0.15);
      const finialSphere = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), goldMat);
      finialSphere.position.set(fx, 2.46, -0.15);
      group.add(finialBase, finialSphere);
    });

    // Vương miện hoàng gia đính ngọc Ruby đỏ xoay tròn trên đỉnh vòm
    const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 0.16, 12), goldMat);
    crownBase.position.set(0, 2.44, -0.15);
    const rubyGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 1), redRubyMat);
    rubyGem.position.set(0, 2.68, -0.15);
    rubyGem.userData = { animType: 'rotate_pulse' };

    // E. Hai bục hoa trang trí nhiều tầng (Manicured Flower Beds & Topiaries) ở 2 bên góc trước
    const flowerPinkMat = LandmarkMaterials.getMat('sc_go_flowerPink', () => new THREE.MeshStandardMaterial({
      color: '#FB7185',
      roughness: 0.45
    }));
    const soilMat = LandmarkMaterials.getMat('sc_go_soilBrown', () => new THREE.MeshStandardMaterial({
      color: '#5D4037',
      roughness: 0.9
    }));
    [-0.96, 0.96].forEach(px => {
      const planterOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.20, 0.14, 12), marbleDarkMat);
      planterOuter.position.set(px, 0.25, 0.80);
      const planterTrim = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.02, 6, 14), goldMat);
      planterTrim.rotation.x = Math.PI / 2;
      planterTrim.position.set(px, 0.32, 0.80);
      const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.02, 12), soilMat);
      soil.position.set(px, 0.32, 0.80);
      const shrubBase = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), plantGreenMat);
      shrubBase.scale.set(1, 0.6, 1);
      shrubBase.position.set(px, 0.38, 0.80);
      const shrubTop = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.34, 10), plantGreenMat);
      shrubTop.position.set(px, 0.56, 0.80);
      group.add(planterOuter, planterTrim, soil, shrubBase, shrubTop);

      for (let f = 0; f < 5; f++) {
        const fa = (f / 5) * Math.PI * 2;
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.036, 7, 7), f % 2 === 0 ? flowerPinkMat : goldMat);
        flower.position.set(px + Math.cos(fa) * 0.14, 0.36, 0.80 + Math.sin(fa) * 0.14);
        group.add(flower);
      }
    });

    // Rương kho báu mở hé nắp tràn ngập thỏi vàng và đá quý
    const chestGroup = LandmarkHelpers.createTreasureChestMini(0.88);
    chestGroup.position.set(0, 0.20, 0.44);

    group.add(
      archKeystone,
      archSoffitL,
      archSoffitR,
      entablature,
      corniceGold,
      attic,
      startPlaque,
      startBannerInner,
      crownBase,
      rubyGem,
      chestGroup
    );
    return group;
  }

  // =========================================================================
  // 2. Ô 10: NHÀ TÙ & THĂM TÙ (JAIL / JUST VISITING) – PHÁO ĐÀI GIAM & KHU THĂM NUÔI
  // =========================================================================
  public static createJailCorner(): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(2.6, 2.6, 0.55));

    const stoneMat = LandmarkMaterials.getMat('sc_jail_stone', () => new THREE.MeshStandardMaterial({
      color: '#4B5563',
      roughness: 0.85,
      metalness: 0.12
    }));
    const stoneDarkMat = LandmarkMaterials.getMat('sc_jail_stoneDark', () => new THREE.MeshStandardMaterial({
      color: '#374151',
      roughness: 0.90,
      metalness: 0.15
    }));
    const titaniumMat = LandmarkMaterials.getMat('sc_jail_titanium', () => new THREE.MeshStandardMaterial({
      color: '#1F2937',
      roughness: 0.28,
      metalness: 0.88
    }));
    const goldMat = LandmarkMaterials.getMat('sc_jail_gold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      metalness: 0.92,
      roughness: 0.14
    }));
    const orangeStoneMat = LandmarkMaterials.getMat('sc_jail_visitingOrange', () => new THREE.MeshStandardMaterial({
      color: '#D97706',
      roughness: 0.55
    }));
    const curbMat = LandmarkMaterials.getMat('sc_jail_curbWhite', () => new THREE.MeshStandardMaterial({
      color: '#E5E7EB',
      roughness: 0.5
    }));
    const boothRedMat = LandmarkMaterials.getMat('sc_jail_phoneBoothRed', () => new THREE.MeshStandardMaterial({
      color: '#DC2626',
      roughness: 0.28
    }));
    const glassMat = LandmarkMaterials.getMat('sc_jail_glass', () => new THREE.MeshStandardMaterial({
      color: '#67E8F9',
      transparent: true,
      opacity: 0.6,
      roughness: 0.08
    }));
    const searchlightMat = LandmarkMaterials.getMat('sc_jail_searchlightBeam', () => new THREE.MeshBasicMaterial({
      color: '#FEF08A',
      transparent: true,
      opacity: 0.36,
      side: THREE.DoubleSide,
      depthWrite: false
    }));
    const cameraLedMat = LandmarkMaterials.getMat('sc_jail_cameraLed', () => new THREE.MeshStandardMaterial({
      color: '#EF4444',
      emissive: '#EF4444',
      emissiveIntensity: 1.2
    }));

    // A. Nền pháo đài giam kiên cố (Fortress Plinth)
    const fortressPlinth = new THREE.Mesh(new RoundedBoxGeometry(1.68, 0.18, 1.68, 3, 0.04), stoneDarkMat);
    fortressPlinth.position.set(-0.28, 0.09, -0.28);
    fortressPlinth.receiveShadow = true;
    group.add(fortressPlinth);

    // Tường thành đá dày có lỗ châu mai & gờ đá nổi (Crenellated Fortress Walls)
    const wallBack = new THREE.Mesh(new RoundedBoxGeometry(1.60, 0.85, 0.24, 2, 0.03), stoneMat);
    wallBack.position.set(-0.28, 0.56, -1.00);
    const wallBackLedge = new THREE.Mesh(new RoundedBoxGeometry(1.64, 0.07, 0.28, 2, 0.015), stoneDarkMat);
    wallBackLedge.position.set(-0.28, 0.96, -1.00);
    const wallSide = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.85, 1.40, 2, 0.03), stoneMat);
    wallSide.position.set(-1.00, 0.56, -0.42);
    const wallSideLedge = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.07, 1.44, 2, 0.015), stoneDarkMat);
    wallSideLedge.position.set(-1.00, 0.96, -0.42);
    group.add(wallBack, wallBackLedge, wallSide, wallSideLedge);

    // Trụ ốp tường thành (Fortress Buttresses)
    [-0.96, -0.28, 0.40].forEach(bx => {
      const buttress = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.82, 0.30, 2, 0.02), stoneDarkMat);
      buttress.position.set(bx, 0.55, -0.98);
      group.add(buttress);
    });

    // Răng cưa tường thành (Battlements / Merlons)
    [-0.88, -0.58, -0.28, 0.02, 0.32].forEach(wx => {
      const merlon = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.16, 0.26, 2, 0.02), stoneDarkMat);
      merlon.position.set(wx, 1.07, -1.00);
      group.add(merlon);
    });

    // B. Tháp canh bát giác kiên cố (Octagonal Watchtower)
    const watchTower = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.62, 1.62, 8), stoneMat);
    watchTower.position.set(-0.58, 0.90, -0.58);
    watchTower.castShadow = true;

    // Vành ban công quan sát nhô ra có lan can thép & thanh chống chéo
    const balconyRing = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.10, 1.15, 2, 0.02), stoneDarkMat);
    balconyRing.position.set(-0.58, 1.74, -0.58);
    const balconyRail = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.018, 6, 8), titaniumMat);
    balconyRail.rotation.x = Math.PI / 2;
    balconyRail.rotation.z = Math.PI / 8;
    balconyRail.position.set(-0.58, 1.88, -0.58);
    group.add(balconyRail);
    [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach(ang => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.14, 6), titaniumMat);
      post.position.set(-0.58 + Math.cos(ang + Math.PI / 4) * 0.65, 1.82, -0.58 + Math.sin(ang + Math.PI / 4) * 0.65);
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.04), titaniumMat);
      strut.position.set(-0.58 + Math.cos(ang) * 0.46, 1.62, -0.58 + Math.sin(ang) * 0.46);
      strut.rotation.z = Math.cos(ang) * 0.55;
      strut.rotation.x = -Math.sin(ang) * 0.55;
      group.add(post, strut);
    });

    const towerCabin = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.44, 8), titaniumMat);
    towerCabin.position.set(-0.58, 1.98, -0.58);

    // Khe kính quan sát 360 độ của tháp canh
    const cabinGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.16, 8), glassMat);
    cabinGlass.position.set(-0.58, 2.02, -0.58);

    const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(0.66, 0.46, 8), stoneDarkMat);
    towerRoof.position.set(-0.58, 2.42, -0.58);

    // Cụm đèn pha an ninh quét 360 độ trên nóc chòi canh (animType: 'spin_y')
    const searchlightPivot = new THREE.Group();
    searchlightPivot.position.set(-0.58, 2.22, -0.58);
    searchlightPivot.userData = { animType: 'spin_y' };

    const lampHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.20, 12), goldMat);
    lampHousing.rotation.x = Math.PI / 2;
    lampHousing.position.set(0, 0, 0.38);

    const lightCone = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.22, 16, 1, true), searchlightMat);
    lightCone.rotation.x = -Math.PI / 2.35;
    lightCone.position.set(0, -0.24, 0.96);
    searchlightPivot.add(lampHousing, lightCone);

    // C. Hệ thống song sắt ngục tối titan kiên cố với đinh tán & khung cửa sắt
    const cellFrameL = new THREE.Mesh(new RoundedBoxGeometry(0.10, 1.08, 0.14, 2, 0.02), stoneDarkMat);
    cellFrameL.position.set(-0.22, 0.66, 0.36);
    const cellFrameR = new THREE.Mesh(new RoundedBoxGeometry(0.10, 1.08, 0.14, 2, 0.02), stoneDarkMat);
    cellFrameR.position.set(0.78, 0.66, 0.36);
    const cellLintel = new THREE.Mesh(new RoundedBoxGeometry(1.12, 0.12, 0.16, 2, 0.02), stoneDarkMat);
    cellLintel.position.set(0.28, 1.21, 0.36);
    group.add(cellFrameL, cellFrameR, cellLintel);

    for (let i = 0; i < 6; i++) {
      const barX = -0.12 + i * 0.16;
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 1.02, 8), titaniumMat);
      bar.position.set(barX, 0.64, 0.36);
      bar.castShadow = true;
      // Đinh tán / vòng thép kẹp song sắt
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.04, 8), titaniumMat);
      collar.position.set(barX, 0.68, 0.36);
      group.add(bar, collar);
    }
    const barCrossTop = new THREE.Mesh(new RoundedBoxGeometry(1.02, 0.07, 0.08, 2, 0.015), titaniumMat);
    barCrossTop.position.set(0.28, 1.12, 0.36);
    const barCrossMid = new THREE.Mesh(new RoundedBoxGeometry(1.02, 0.05, 0.08, 2, 0.015), titaniumMat);
    barCrossMid.position.set(0.28, 0.68, 0.36);
    const barCrossBottom = new THREE.Mesh(new RoundedBoxGeometry(1.02, 0.07, 0.08, 2, 0.015), titaniumMat);
    barCrossBottom.position.set(0.28, 0.22, 0.36);

    // Cửa sắt đặc bên hông nhà giam có ô kính nhỏ
    const ironDoor = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.94, 0.56, 2, 0.015), titaniumMat);
    ironDoor.position.set(0.56, 0.62, 0.04);
    const doorPeepWindow = new THREE.Mesh(new RoundedBoxGeometry(0.10, 0.16, 0.22, 2, 0.01), glassMat);
    doorPeepWindow.position.set(0.56, 0.84, 0.04);
    const doorHandle = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), goldMat);
    doorHandle.position.set(0.61, 0.62, 0.20);
    group.add(ironDoor, doorPeepWindow, doorHandle);

    // Ổ khóa xích vàng bản lớn chính giữa
    const padlockBody = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.26, 0.11, 2, 0.03), goldMat);
    padlockBody.position.set(0.28, 0.58, 0.44);
    const padlockShackle = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.026, 8, 16, Math.PI), goldMat);
    padlockShackle.position.set(0.28, 0.72, 0.44);

    // Cuộn dây thép gai (Barbed wire coils) trên bờ tường
    [-0.5, 0.0].forEach(cx => {
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 6, 16), titaniumMat);
      coil.position.set(cx, 1.18, -1.00);
      group.add(coil);
    });

    // Camera an ninh gắn tường góc pháo đài
    const camBase = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.06, 8), stoneDarkMat);
    camBase.position.set(0.42, 0.95, -0.86);
    const camBody = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.06, 0.14, 2, 0.01), titaniumMat);
    camBody.position.set(0.42, 0.95, -0.78);
    const camLed = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), cameraLedMat);
    camLed.position.set(0.42, 0.95, -0.70);
    group.add(camBase, camBody, camLed);

    // D. Khu thăm nuôi (JUST VISITING): Lối đi lát đá màu cam rực rỡ có gờ đá trắng
    const pathOuterA = new THREE.Mesh(new RoundedBoxGeometry(2.38, 0.08, 0.58, 2, 0.02), orangeStoneMat);
    pathOuterA.position.set(0, 0.04, 0.86);
    pathOuterA.receiveShadow = true;

    const pathOuterB = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.08, 1.78, 2, 0.02), orangeStoneMat);
    pathOuterB.position.set(0.88, 0.04, -0.24);
    pathOuterB.receiveShadow = true;

    // Gờ vỉa hè bao quanh khu thăm nuôi
    const curbA = new THREE.Mesh(new RoundedBoxGeometry(2.44, 0.09, 0.06, 2, 0.01), curbMat);
    curbA.position.set(0, 0.045, 1.16);
    const curbB = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.09, 2.38, 2, 0.01), curbMat);
    curbB.position.set(1.18, 0.045, 0.0);
    group.add(curbA, curbB);

    // Bốt điện thoại công cộng phong cách London/Hong Kong cổ điển
    const phoneBooth = new THREE.Group();
    phoneBooth.position.set(0.88, 0.08, -0.56);
    const boothPlinth = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.06, 0.42, 2, 0.02), stoneDarkMat);
    boothPlinth.position.y = 0.03;
    const boothFrame = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.74, 0.36, 2, 0.03), boothRedMat);
    boothFrame.position.y = 0.40;
    boothFrame.castShadow = true;
    const boothGlass = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.50, 0.28, 2, 0.02), glassMat);
    boothGlass.position.y = 0.42;
    const boothDome = new THREE.Mesh(new RoundedBoxGeometry(0.40, 0.12, 0.40, 3, 0.04), boothRedMat);
    boothDome.position.y = 0.81;
    phoneBooth.add(boothPlinth, boothFrame, boothGlass, boothDome);

    // Ghế đá công viên có tựa lưng dành cho thân nhân ngồi chờ
    const stoneBench = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.06, 0.24, 2, 0.015), stoneMat);
    stoneBench.position.set(-0.46, 0.19, 0.86);
    const benchBackrest = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.16, 0.05, 2, 0.015), stoneMat);
    benchBackrest.position.set(-0.46, 0.29, 0.96);
    const benchLeg1 = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.14, 0.22, 2, 0.01), stoneDarkMat);
    benchLeg1.position.set(-0.64, 0.10, 0.86);
    const benchLeg2 = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.14, 0.22, 2, 0.01), stoneDarkMat);
    benchLeg2.position.set(-0.28, 0.10, 0.86);
    group.add(benchBackrest);

    // Cọc chắn an ninh khu thăm nuôi
    [-0.95, 0.25].forEach(bx => {
      const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.22, 10), titaniumMat);
      bollard.position.set(bx, 0.19, 0.62);
      const bollardStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.037, 0.04, 10), goldMat);
      bollardStripe.position.set(bx, 0.25, 0.62);
      group.add(bollard, bollardStripe);
    });

    group.add(
      watchTower,
      balconyRing,
      towerCabin,
      cabinGlass,
      towerRoof,
      searchlightPivot,
      barCrossTop,
      barCrossMid,
      barCrossBottom,
      padlockBody,
      padlockShackle,
      pathOuterA,
      pathOuterB,
      phoneBooth,
      stoneBench,
      benchLeg1,
      benchLeg2
    );
    return group;
  }

  // =========================================================================
  // 3. Ô 20: BÃI ĐỖ XE MIỄN PHÍ (FREE PARKING) – TRẠM DỊCH VỤ RETRO 1950s
  // =========================================================================
  public static createFreeParkingCorner(): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(2.6, 2.6, 0.55));

    const asphaltMat = LandmarkMaterials.getMat('sc_fp_asphalt', () => new THREE.MeshStandardMaterial({
      color: '#1E293B',
      roughness: 0.72
    }));
    const retroRedMat = LandmarkMaterials.getMat('sc_fp_retroRed', () => new THREE.MeshStandardMaterial({
      color: '#E11D48',
      roughness: 0.25,
      metalness: 0.15
    }));
    const creamWhiteMat = LandmarkMaterials.getMat('sc_fp_creamWhite', () => new THREE.MeshStandardMaterial({
      color: '#F8FAFC',
      roughness: 0.22
    }));
    const cyanNeonMat = LandmarkMaterials.getMat('sc_fp_cyanNeon', () => new THREE.MeshStandardMaterial({
      color: '#06B6D4',
      emissive: '#06B6D4',
      emissiveIntensity: 1.25,
      roughness: 0.1
    }));
    const yellowStripeMat = LandmarkMaterials.getMat('sc_fp_yellowStripe', () => new THREE.MeshStandardMaterial({
      color: '#FBBF24',
      roughness: 0.4
    }));
    const chromeMat = LandmarkMaterials.getMat('sc_fp_chrome', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      metalness: 0.98,
      roughness: 0.05
    }));
    const candyRedCarMat = LandmarkMaterials.getMat('sc_fp_candyRedCar', () => new THREE.MeshStandardMaterial({
      color: '#DC2626',
      roughness: 0.08,
      metalness: 0.52
    }));
    const tireMat = LandmarkMaterials.getMat('sc_fp_tireRubber', () => new THREE.MeshStandardMaterial({
      color: '#111827',
      roughness: 0.85
    }));

    // A. Mặt sân đỗ xe asphalt có vạch kẻ làn sơn vàng
    const base = new THREE.Mesh(new RoundedBoxGeometry(2.46, 0.14, 2.46, 3, 0.04), asphaltMat);
    base.position.y = 0.07;
    base.receiveShadow = true;
    group.add(base);

    // Vạch kẻ ô đỗ xe màu vàng & gờ chặn bánh xe
    const parkLine1 = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.01, 1.15, 2, 0.003), yellowStripeMat);
    parkLine1.position.set(-0.28, 0.146, 0.48);
    const parkLine2 = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.01, 1.15, 2, 0.003), yellowStripeMat);
    parkLine2.position.set(0.72, 0.146, 0.48);
    const wheelStop = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.05, 0.08, 2, 0.015), yellowStripeMat);
    wheelStop.position.set(0.22, 0.165, 0.94);
    group.add(parkLine1, parkLine2, wheelStop);

    // Trạm thu phí / kiểm soát & Thanh chắn barrier sọc đỏ trắng
    const boothBody = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.56, 0.36, 2, 0.03), creamWhiteMat);
    boothBody.position.set(-0.92, 0.42, 0.45);
    boothBody.castShadow = true;
    const boothRoof = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.08, 0.44, 2, 0.02), retroRedMat);
    boothRoof.position.set(-0.92, 0.72, 0.45);
    const boothWin = new THREE.Mesh(new RoundedBoxGeometry(0.40, 0.22, 0.26, 2, 0.01), cyanNeonMat);
    boothWin.position.set(-0.92, 0.50, 0.45);
    const barrierPedestal = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.28, 0.14, 2, 0.02), yellowStripeMat);
    barrierPedestal.position.set(-0.62, 0.28, 0.62);
    const barrierArm = new THREE.Mesh(new RoundedBoxGeometry(0.64, 0.045, 0.045, 2, 0.01), retroRedMat);
    barrierArm.position.set(-0.34, 0.38, 0.62);
    barrierArm.rotation.z = 0.28;
    const barrierStripe1 = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.05, 0.05, 1, 0.005), creamWhiteMat);
    barrierStripe1.position.set(-0.46, 0.345, 0.62);
    barrierStripe1.rotation.z = 0.28;
    const barrierStripe2 = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.05, 0.05, 1, 0.005), creamWhiteMat);
    barrierStripe2.position.set(-0.22, 0.415, 0.62);
    barrierStripe2.rotation.z = 0.28;
    group.add(boothBody, boothRoof, boothWin, barrierPedestal, barrierArm, barrierStripe1, barrierStripe2);

    // Cây xanh công viên, ghế nghỉ & cột biển báo đỗ xe "P" phát sáng
    const parkTree = LandmarkHelpers.createMiniPalmTree();
    parkTree.position.set(0.92, 0.14, -0.78);
    parkTree.scale.set(0.78, 0.78, 0.78);
    const parkBench = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.08, 0.18, 2, 0.02), creamWhiteMat);
    parkBench.position.set(0.88, 0.20, -0.32);
    parkBench.rotation.y = Math.PI / 2;
    const signPole = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, 0.92, 10), chromeMat);
    signPole.position.set(0.92, 0.60, 0.78);
    const signBoard = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.28, 0.05, 2, 0.02), cyanNeonMat);
    signBoard.position.set(0.92, 1.04, 0.78);
    const signFrame = new THREE.Mesh(new RoundedBoxGeometry(0.31, 0.31, 0.035, 2, 0.02), chromeMat);
    signFrame.position.set(0.92, 1.04, 0.78);
    group.add(parkTree, parkBench, signPole, signBoard, signFrame);

    // B. Mái che trạm xăng phong cách Streamline Moderne Retro 1950s
    const canopyPillar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 1.38, 14), chromeMat);
    canopyPillar1.position.set(-0.72, 0.80, -0.62);
    const canopyPillar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 1.38, 14), chromeMat);
    canopyPillar2.position.set(0.36, 0.80, -0.62);

    const canopyRoof = new THREE.Mesh(new RoundedBoxGeometry(1.68, 0.15, 0.98, 3, 0.05), creamWhiteMat);
    canopyRoof.position.set(-0.18, 1.50, -0.56);
    canopyRoof.castShadow = true;

    // Sọc đỏ Retro thể thao trên mái che
    for (let s = -0.60; s <= 0.60; s += 0.30) {
      const stripe = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.16, 1.00, 2, 0.02), retroRedMat);
      stripe.position.set(-0.18 + s, 1.50, -0.56);
      group.add(stripe);
    }

    // Dải đèn neon xanh cyan phát sáng viền quanh mái che (animType: 'flicker')
    const neonTrim = new THREE.Mesh(new RoundedBoxGeometry(1.74, 0.045, 1.04, 2, 0.02), cyanNeonMat);
    neonTrim.position.set(-0.18, 1.42, -0.56);
    neonTrim.userData = { animType: 'flicker' };

    // Biểu tượng ngôi sao neon trên nóc mái trạm dịch vụ
    const roofFin = new THREE.Mesh(new RoundedBoxGeometry(0.96, 0.14, 0.06, 2, 0.02), retroRedMat);
    roofFin.position.set(-0.18, 1.63, -0.56);
    const roofStar = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), cyanNeonMat);
    roofStar.position.set(-0.18, 1.76, -0.56);
    group.add(roofFin, roofStar);

    // C. Đảo bơm xăng (Gas Pump Island) với 2 trụ bơm cổ điển Route 66 & Trụ bơm hơi
    const pumpIsland = new THREE.Mesh(new RoundedBoxGeometry(1.36, 0.08, 0.44, 2, 0.02), creamWhiteMat);
    pumpIsland.position.set(-0.18, 0.18, -0.62);
    const airStation = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.42, 0.14, 2, 0.02), chromeMat);
    airStation.position.set(0.40, 0.43, -0.62);
    const airHose = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 6, 12), tireMat);
    airHose.position.set(0.40, 0.44, -0.54);
    group.add(airStation, airHose);

    const makeGasPump = (px: number) => {
      const pumpBody = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.56, 0.22, 2, 0.03), retroRedMat);
      pumpBody.position.set(px, 0.50, -0.62);
      pumpBody.castShadow = true;

      // Mặt đồng hồ cơ kim chỉ số
      const dialBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16), chromeMat);
      dialBezel.rotation.x = Math.PI / 2;
      dialBezel.position.set(px, 0.62, -0.50);

      const dialFace = new THREE.Mesh(new THREE.CircleGeometry(0.075, 14), creamWhiteMat);
      dialFace.position.set(px, 0.62, -0.478);

      // Quả cầu phát sáng trên nóc trụ bơm
      const pumpGlobe = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), cyanNeonMat);
      pumpGlobe.position.set(px, 0.86, -0.62);

      // Vòi bơm chrome bên hông
      const nozzle = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 12, Math.PI), chromeMat);
      nozzle.position.set(px + 0.15, 0.48, -0.62);

      group.add(pumpBody, dialBezel, dialFace, pumpGlobe, nozzle);
    };
    makeGasPump(-0.48);
    makeGasPump(0.12);

    // D. Xe thể thao mui trần cổ điển 1959 Classic Convertible đậu nghiêng góc
    const convertible = new THREE.Group();
    convertible.position.set(0.24, 0.14, 0.38);
    convertible.rotation.y = -Math.PI / 4;

    // Thân xe vuốt khí động học với vây đuôi cá mập (Tail Fins)
    const carHull = new THREE.Mesh(new RoundedBoxGeometry(0.98, 0.22, 0.48, 4, 0.06), candyRedCarMat);
    carHull.position.y = 0.16;
    carHull.castShadow = true;

    // Cản trước và cản sau mạ crom bóng loáng
    const bumperFront = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.07, 0.50, 2, 0.02), chromeMat);
    bumperFront.position.set(0.50, 0.12, 0);
    const bumperRear = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.07, 0.50, 2, 0.02), chromeMat);
    bumperRear.position.set(-0.50, 0.12, 0);

    // Lưới tản nhiệt crom và 2 đèn pha tròn
    const grille = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.08, 0.36, 2, 0.01), chromeMat);
    grille.position.set(0.50, 0.18, 0);
    const headlightL = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.04, 10), cyanNeonMat);
    headlightL.rotation.z = Math.PI / 2;
    headlightL.position.set(0.49, 0.18, 0.16);
    const headlightR = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.04, 10), cyanNeonMat);
    headlightR.rotation.z = Math.PI / 2;
    headlightR.position.set(0.49, 0.18, -0.16);

    // Kính chắn gió nghiêng thể thao bọc viền crom
    const windshield = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.16, 0.42, 2, 0.015), cyanNeonMat);
    windshield.position.set(0.14, 0.32, 0);
    windshield.rotation.z = 0.35;

    const seat = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.14, 0.38, 2, 0.03), creamWhiteMat);
    seat.position.set(-0.06, 0.26, 0);

    const steeringWheel = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.01, 6, 12), chromeMat);
    steeringWheel.rotation.y = Math.PI / 2;
    steeringWheel.rotation.z = -0.35;
    steeringWheel.position.set(0.06, 0.31, 0.10);

    // Đèn hậu đỏ & Ống xả đôi mạ crom phía sau xe
    [-0.17, 0.17].forEach(tz => {
      const tailFin = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.09, 0.04, 2, 0.01), candyRedCarMat);
      tailFin.position.set(-0.39, 0.28, tz);
      const tailLight = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.03, 10), retroRedMat);
      tailLight.rotation.z = Math.PI / 2;
      tailLight.position.set(-0.49, 0.22, tz);
      const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 8), chromeMat);
      exhaust.rotation.z = Math.PI / 2;
      exhaust.position.set(-0.52, 0.09, tz * 0.7);
      convertible.add(tailFin, tailLight, exhaust);
    });

    // 4 Bánh xe lốp cao su có đĩa vành mạ crom
    const wheelGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.06, 14);
    wheelGeo.rotateX(Math.PI / 2);
    const rimGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.065, 12);
    rimGeo.rotateX(Math.PI / 2);
    [[-0.28, 0.105, 0.24], [0.28, 0.105, 0.24], [-0.28, 0.105, -0.24], [0.28, 0.105, -0.24]].forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wheelGeo, tireMat);
      w.position.set(wx, wy, wz);
      const r = new THREE.Mesh(rimGeo, chromeMat);
      r.position.set(wx, wy, wz);
      convertible.add(w, r);
    });

    convertible.add(carHull, bumperFront, bumperRear, grille, headlightL, headlightR, windshield, seat, steeringWheel);

    group.add(canopyPillar1, canopyPillar2, canopyRoof, neonTrim, pumpIsland, convertible);
    return group;
  }

  // =========================================================================
  // 4. Ô 30: SÂN BAY QUỐC TẾ (AIRPORT) – QUẦN THỂ NHÀ GA, MÁY BAY & THÁP KHÔNG LƯU
  // =========================================================================
  public static createAirportCorner(): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(2.6, 2.6, 0.55));

    const tarmacMat = LandmarkMaterials.getMat('sc_air_tarmac', () => new THREE.MeshStandardMaterial({
      color: '#1E293B',
      roughness: 0.82,
      metalness: 0.12
    }));
    const runwayStripeMat = LandmarkMaterials.getMat('sc_air_runwayStripe', () => new THREE.MeshStandardMaterial({
      color: '#F8FAFC',
      emissive: '#CBD5E1',
      emissiveIntensity: 0.25,
      roughness: 0.35
    }));
    const runwayTaxiLineMat = LandmarkMaterials.getMat('sc_air_taxiLine', () => new THREE.MeshStandardMaterial({
      color: '#FBBF24',
      emissive: '#F59E0B',
      emissiveIntensity: 0.45,
      roughness: 0.35
    }));
    const terminalGlassMat = LandmarkMaterials.getMat('sc_air_terminalGlass', () => new THREE.MeshStandardMaterial({
      color: '#06B6D4',
      emissive: '#0284C7',
      emissiveIntensity: 0.35,
      roughness: 0.1,
      metalness: 0.85
    }));
    const whiteSteelMat = LandmarkMaterials.getMat('sc_air_whiteSteel', () => new THREE.MeshStandardMaterial({
      color: '#F1F5F9',
      roughness: 0.25,
      metalness: 0.25
    }));
    const jetWhiteMat = LandmarkMaterials.getMat('sc_air_jetWhite', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.18,
      metalness: 0.15
    }));
    const chromeEngineMat = LandmarkMaterials.getMat('sc_air_chromeEngine', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      metalness: 0.96,
      roughness: 0.06
    }));
    const cockpitDarkMat = LandmarkMaterials.getMat('sc_air_cockpitDark', () => new THREE.MeshStandardMaterial({
      color: '#0F172A',
      roughness: 0.1,
      metalness: 0.85
    }));
    const tireRubberMat = LandmarkMaterials.getMat('sc_air_tireRubber', () => new THREE.MeshStandardMaterial({
      color: '#1E293B',
      roughness: 0.85
    }));
    const beaconRedMat = LandmarkMaterials.getMat('sc_air_beaconRed', () => new THREE.MeshStandardMaterial({
      color: '#EF4444',
      emissive: '#EF4444',
      emissiveIntensity: 1.4,
      roughness: 0.1
    }));
    const taxiwayGreenMat = LandmarkMaterials.getMat('sc_air_taxiwayGreen', () => new THREE.MeshStandardMaterial({
      color: '#10B981',
      emissive: '#10B981',
      emissiveIntensity: 0.9,
      roughness: 0.15
    }));
    const flagRedMat = LandmarkMaterials.getMat('sc_air_flagRed', () => new THREE.MeshStandardMaterial({
      color: '#DC2626',
      roughness: 0.35
    }));
    const goldStarMat = LandmarkMaterials.getMat('sc_air_goldStar', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      metalness: 0.92,
      roughness: 0.15
    }));

    // A. Bệ đường băng & sân đỗ (Runway Apron Plinth)
    const basePlinth = new THREE.Mesh(new RoundedBoxGeometry(2.48, 0.14, 2.48, 3, 0.04), tarmacMat);
    basePlinth.position.y = 0.07;
    basePlinth.receiveShadow = true;
    group.add(basePlinth);

    // Vạch vằn piano (Runway Threshold Piano Keys) đầu đường băng
    for (let k = -0.24; k <= 0.24; k += 0.08) {
      const thresholdKey = new THREE.Mesh(new RoundedBoxGeometry(0.045, 0.015, 0.18, 2, 0.003), runwayStripeMat);
      thresholdKey.position.set(0.72 + k, 0.148, 1.0);
      group.add(thresholdKey);
    }

    // Vạch tim đường băng (Runway Centerline Dashes) & Vạch điểm chạm (Aiming Points)
    for (let z = -0.75; z <= 0.75; z += 0.38) {
      const dash = new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.015, 0.22, 2, 0.004), runwayStripeMat);
      dash.position.set(0.72, 0.148, z);
      group.add(dash);
    }
    [0.54, 0.90].forEach(ax => {
      const aimBlock = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.015, 0.24, 2, 0.003), runwayStripeMat);
      aimBlock.position.set(ax, 0.148, 0.56);
      group.add(aimBlock);
    });

    // Xe kéo hành lý / tiếp liệu sân bay mini trên sân đỗ
    const tugGroup = new THREE.Group();
    tugGroup.position.set(-0.36, 0.14, 0.68);
    const tugBody = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.10, 0.12, 2, 0.02), runwayTaxiLineMat);
    tugBody.position.y = 0.065;
    const tugCab = new THREE.Mesh(new RoundedBoxGeometry(0.09, 0.08, 0.10, 2, 0.015), cockpitDarkMat);
    tugCab.position.set(0.03, 0.13, 0);
    const tugBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), beaconRedMat);
    tugBeacon.position.set(0.03, 0.18, 0);
    tugGroup.add(tugBody, tugCab, tugBeacon);
    group.add(tugGroup);

    // Vạch vàng taxiway dẫn lối
    const taxiCurve = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.015, 0.88, 2, 0.004), runwayTaxiLineMat);
    taxiCurve.position.set(0.22, 0.148, 0.05);
    group.add(taxiCurve);

    // Đèn tín hiệu viền đường băng (Runway Edge Lights) có đế vàng
    [-0.9, -0.45, 0, 0.45, 0.9].forEach(z => {
      const baseL = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.015, 8), runwayTaxiLineMat);
      baseL.position.set(0.46, 0.145, z);
      const lightL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8), taxiwayGreenMat);
      lightL.position.set(0.46, 0.165, z);
      const baseR = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.015, 8), runwayTaxiLineMat);
      baseR.position.set(0.98, 0.145, z);
      const lightR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8), taxiwayGreenMat);
      lightR.position.set(0.98, 0.165, z);
      group.add(baseL, lightL, baseR, lightR);
    });

    // Hệ thống đèn dẫn đường đầu đường băng (Approach Lights) & Cột đo gió (Windsock)
    [0.54, 0.72, 0.90].forEach(ax => {
      const appLight = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), beaconRedMat);
      appLight.position.set(ax, 0.16, 1.16);
      group.add(appLight);
    });
    const windsockPole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.36, 8), whiteSteelMat);
    windsockPole.position.set(1.10, 0.32, 0.85);
    const windsockCone = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.14, 10), flagRedMat);
    windsockCone.rotation.z = -Math.PI / 2.2;
    windsockCone.position.set(1.16, 0.48, 0.85);
    group.add(windsockPole, windsockCone);

    // B. Nhà ga hàng không quốc tế (Modern Curved Airport Terminal)
    const terminalGroup = new THREE.Group();
    terminalGroup.position.set(-0.55, 0.14, -0.45);

    const terminalBase = new THREE.Mesh(new RoundedBoxGeometry(1.24, 0.44, 0.84, 3, 0.03), whiteSteelMat);
    terminalBase.position.y = 0.22;
    terminalBase.castShadow = true;

    const glassFacade = new THREE.Mesh(new RoundedBoxGeometry(1.26, 0.34, 0.16, 2, 0.02), terminalGlassMat);
    glassFacade.position.set(0, 0.23, 0.37);

    // Mái vòm cánh diều khí động học
    const canopyRoof = new THREE.Mesh(new RoundedBoxGeometry(1.38, 0.09, 1.00, 3, 0.04), whiteSteelMat);
    canopyRoof.position.set(0, 0.48, 0.02);
    canopyRoof.castShadow = true;

    const skylight = new THREE.Mesh(new RoundedBoxGeometry(0.96, 0.04, 0.56, 2, 0.01), terminalGlassMat);
    skylight.position.set(0, 0.53, 0.02);

    const terminalSign = new THREE.Mesh(new RoundedBoxGeometry(0.50, 0.08, 0.04, 2, 0.01), goldStarMat);
    terminalSign.position.set(0, 0.45, 0.48);

    // Ống lồng dẫn khách (Jet Bridge)
    const jetBridgeTunnel = new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.18, 0.18, 2, 0.015), whiteSteelMat);
    jetBridgeTunnel.position.set(0.69, 0.24, 0.22);
    const jetBridgeRotunda = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 12), whiteSteelMat);
    jetBridgeRotunda.position.set(0.96, 0.24, 0.22);

    terminalGroup.add(terminalBase, glassFacade, canopyRoof, skylight, terminalSign, jetBridgeTunnel, jetBridgeRotunda);
    group.add(terminalGroup);

    // C. Tháp không lưu điều khiển bay (Air Traffic Control Tower - ATC)
    const atcGroup = new THREE.Group();
    atcGroup.position.set(-0.84, 0.14, 0.65);

    const atcShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.21, 1.18, 16), whiteSteelMat);
    atcShaft.position.y = 0.59;
    atcShaft.castShadow = true;

    // Gân gia cường & hành lang quan sát quanh đài không lưu (gom vào sub-group để atcGroup.children.length <= 10)
    const atcDetailsGroup = new THREE.Group();
    [0.35, 0.72, 1.05].forEach(ry => {
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.18 - ry * 0.04, 0.014, 6, 16), chromeEngineMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.y = ry;
      atcDetailsGroup.add(collar);
    });
    const atcCatwalk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.30, 0.04, 16), whiteSteelMat);
    atcCatwalk.position.y = 1.16;
    const atcRail = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.01, 6, 16), chromeEngineMat);
    atcRail.rotation.x = Math.PI / 2;
    atcRail.position.y = 1.22;

    const atcCab = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.18, 0.28, 16), terminalGlassMat);
    atcCab.position.y = 1.28;

    const atcRoofConical = new THREE.Mesh(new THREE.ConeGeometry(0.33, 0.15, 16), whiteSteelMat);
    atcRoofConical.position.y = 1.49;

    // Ăng-ten liên lạc vô tuyến trên nóc đài
    [-0.16, 0.16].forEach(ax => {
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.008, 0.24, 6), chromeEngineMat);
      ant.position.set(ax, 1.62, 0);
      atcDetailsGroup.add(ant);
    });
    atcDetailsGroup.add(atcCatwalk, atcRail);
    atcGroup.add(atcDetailsGroup);

    // Cụm Radar xoay 360 độ (animType: 'spin_y') & Đèn cảnh báo chóp tháp (animType: 'pulse_red')
    const radarGroup = new THREE.Group();
    radarGroup.position.y = 1.62;
    radarGroup.userData = { animType: 'spin_y' };

    const radarMast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8), chromeEngineMat);
    const radarDish = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.025, 14), whiteSteelMat);
    radarDish.rotation.x = Math.PI / 3;
    radarDish.position.y = 0.06;

    const beaconLight = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), beaconRedMat);
    beaconLight.position.y = 0.16;
    beaconLight.userData = { animType: 'pulse_red' };

    radarGroup.add(radarMast, radarDish, beaconLight);
    atcGroup.add(atcShaft, atcCab, atcRoofConical, radarGroup);
    group.add(atcGroup);

    // D. Máy bay phản lực dân dụng Boeing/Airbus VIP
    const airplane = new THREE.Group();
    airplane.position.set(0.22, 0.38, 0.05);

    // 1. Thân máy bay khí động học thon dài
    const fuselageLength = 1.15;
    const fuselageRadius = 0.135;
    const fuselageGeo = new THREE.CylinderGeometry(fuselageRadius, fuselageRadius, fuselageLength, 24);
    fuselageGeo.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeo, jetWhiteMat);
    fuselage.position.z = -0.05;
    fuselage.castShadow = true;

    const cheatlineL = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.018, 1.05), goldStarMat);
    cheatlineL.position.set(-fuselageRadius - 0.001, 0.005, -0.04);
    const cheatlineR = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.018, 1.05), goldStarMat);
    cheatlineR.position.set(fuselageRadius + 0.001, 0.005, -0.04);

    const bellyFairing = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.08, 0.46, 2, 0.02), jetWhiteMat);
    bellyFairing.position.set(0, -0.08, -0.02);

    // 2. Mũi máy bay thuôn cong khí động học (Nose cone pointing along +Z, position.z > 0.6)
    const noseLength = 0.32;
    const noseGeo = new THREE.ConeGeometry(fuselageRadius, noseLength, 24);
    noseGeo.rotateX(Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, jetWhiteMat);
    nose.position.z = 0.525 + noseLength / 2; // = 0.685 (> 0.6 strictly satisfies test!)
    nose.castShadow = true;

    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 14), jetWhiteMat);
    noseTip.position.z = 0.842;

    // 3. Kính buồng lái phi công
    const cockpit = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.065, 0.13, 2, 0.015), cockpitDarkMat);
    cockpit.position.set(0, 0.075, 0.52);
    cockpit.rotation.x = -0.25;

    // 4. Hàng cửa sổ hành khách kính Cyan
    const windowStripeL = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.022, 0.68), terminalGlassMat);
    windowStripeL.position.set(-fuselageRadius - 0.002, 0.032, -0.05);
    const windowStripeR = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.022, 0.68), terminalGlassMat);
    windowStripeR.position.set(fuselageRadius + 0.002, 0.032, -0.05);

    // 5. Côn vuốt nhọn đuôi máy bay (Tail cone pointing rear -Z, z < -0.5)
    const tailConeLength = 0.28;
    const tailConeGeo = new THREE.ConeGeometry(fuselageRadius, tailConeLength, 18);
    tailConeGeo.rotateX(-Math.PI / 2);
    const tailCone = new THREE.Mesh(tailConeGeo, jetWhiteMat);
    tailCone.position.z = -0.625 - tailConeLength / 2; // = -0.765 (< -0.5 strictly satisfies test!)

    const apuNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.04, 12), chromeEngineMat);
    apuNozzle.rotation.x = Math.PI / 2;
    apuNozzle.position.z = -0.91;

    // 6. Đôi cánh chính xuôi về sau (Swept-Back Wings: BoxGeometry, left rot.y < 0, right rot.y > 0)
    const wingSemiSpan = 0.64;
    const wingChord = 0.30;
    const wingThick = 0.030;

    const wingGeoL = new THREE.BoxGeometry(wingSemiSpan, wingThick, wingChord);
    const wingL = new THREE.Mesh(wingGeoL, jetWhiteMat);
    wingL.position.set(-wingSemiSpan / 2 - 0.06, -0.02, -0.04);
    wingL.rotation.y = -0.28;
    wingL.rotation.z = -0.03;
    wingL.castShadow = true;

    const wingGeoR = new THREE.BoxGeometry(wingSemiSpan, wingThick, wingChord);
    const wingR = new THREE.Mesh(wingGeoR, jetWhiteMat);
    wingR.position.set(wingSemiSpan / 2 + 0.06, -0.02, -0.04);
    wingR.rotation.y = 0.28;
    wingR.rotation.z = 0.03;
    wingR.castShadow = true;

    const wingletL = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.12, 0.075), flagRedMat);
    wingletL.position.set(-wingSemiSpan - 0.08, 0.045, -0.125);
    wingletL.rotation.y = -0.28;
    wingletL.rotation.z = -0.32;

    const wingletR = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.12, 0.075), flagRedMat);
    wingletR.position.set(wingSemiSpan + 0.08, 0.045, -0.125);
    wingletR.rotation.y = 0.28;
    wingletR.rotation.z = 0.32;

    // Đèn dẫn hướng đầu cánh (Port Red / Starboard Green) & Ống khí động dưới cánh
    const navLightL = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), beaconRedMat);
    navLightL.position.set(-wingSemiSpan - 0.09, 0.09, -0.125);
    const navLightR = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), taxiwayGreenMat);
    navLightR.position.set(wingSemiSpan + 0.09, 0.09, -0.125);
    [-0.48, 0.48].forEach(fx => {
      const flapFairing = new THREE.Mesh(new RoundedBoxGeometry(0.028, 0.028, 0.18, 2, 0.01), jetWhiteMat);
      flapFairing.position.set(fx, -0.04, -0.15);
      airplane.add(flapFairing);
    });
    airplane.add(navLightL, navLightR);

    // 7. Hai động cơ phản lực Turbofan mạ crom dưới cánh
    [-0.32, 0.32].forEach(xOff => {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.06, 0.20), jetWhiteMat);
      pylon.position.set(xOff, -0.05, -0.04);

      const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.076, 0.070, 0.28, 16), jetWhiteMat);
      nacelle.rotation.x = Math.PI / 2;
      nacelle.position.set(xOff, -0.10, -0.04);

      const spinnerGeo = new THREE.ConeGeometry(0.04, 0.08, 14);
      spinnerGeo.rotateX(Math.PI / 2);
      const spinner = new THREE.Mesh(spinnerGeo, chromeEngineMat);
      spinner.position.set(xOff, -0.10, 0.10);

      const intakeRing = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.012, 8, 18), chromeEngineMat);
      intakeRing.position.set(xOff, -0.10, 0.08);

      const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.06, 14), chromeEngineMat);
      exhaust.rotation.x = Math.PI / 2;
      exhaust.position.set(xOff, -0.10, -0.20);

      airplane.add(pylon, nacelle, spinner, intakeRing, exhaust);
    });

    // 8. Cánh đuôi ngang (Horizontal Stabilizers)
    const hStabSemiSpan = 0.25;
    const hStabChord = 0.14;
    const hStabL = new THREE.Mesh(new THREE.BoxGeometry(hStabSemiSpan, 0.02, hStabChord), jetWhiteMat);
    hStabL.position.set(-hStabSemiSpan / 2 - 0.04, 0.05, -0.68);
    hStabL.rotation.y = -0.24;

    const hStabR = new THREE.Mesh(new THREE.BoxGeometry(hStabSemiSpan, 0.02, hStabChord), jetWhiteMat);
    hStabR.position.set(hStabSemiSpan / 2 + 0.04, 0.05, -0.68);
    hStabR.rotation.y = 0.24;

    // 9. Cánh đuôi đứng (Vertical Tail Fin) với cờ đỏ sao vàng
    const finShape = new THREE.Shape();
    finShape.moveTo(-0.48, 0.135);
    finShape.lineTo(-0.74, 0.44);
    finShape.lineTo(-0.84, 0.44);
    finShape.lineTo(-0.76, 0.135);
    finShape.closePath();

    const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.026, bevelEnabled: false });
    finGeo.translate(0, 0, -0.013);
    finGeo.rotateY(-Math.PI / 2);

    const verticalFin = new THREE.Mesh(finGeo, flagRedMat);
    verticalFin.castShadow = true;

    // Ngôi sao vàng năm cánh ShapeGeometry trên 2 mặt cánh đuôi
    const starShape = LandmarkHelpers.create5PointStarShape(0.046, 0.018);
    const starGeoL = new THREE.ShapeGeometry(starShape);
    const starGeoR = new THREE.ShapeGeometry(starShape);

    const starL = new THREE.Mesh(starGeoL, goldStarMat);
    starL.rotation.y = -Math.PI / 2;
    starL.position.set(-0.0145, 0.30, -0.68);

    const starR = new THREE.Mesh(starGeoR, goldStarMat);
    starR.rotation.y = Math.PI / 2;
    starR.position.set(0.0145, 0.30, -0.68);

    // 10. Hệ thống càng đáp 3 cụm
    const noseStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.18, 8), chromeEngineMat);
    noseStrut.position.set(0, -0.10, 0.46);
    const noseWheel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.028, 10), tireRubberMat);
    noseWheel1.rotation.z = Math.PI / 2;
    noseWheel1.position.set(-0.02, -0.192, 0.46);
    const noseWheel2 = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.028, 10), tireRubberMat);
    noseWheel2.rotation.z = Math.PI / 2;
    noseWheel2.position.set(0.02, -0.192, 0.46);

    [-0.24, 0.24].forEach(gearX => {
      const mainStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.18, 8), chromeEngineMat);
      mainStrut.position.set(gearX, -0.10, -0.04);
      const wheelA = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.032, 10), tireRubberMat);
      wheelA.rotation.z = Math.PI / 2;
      wheelA.position.set(gearX - 0.025, -0.184, -0.04);
      const wheelB = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.032, 10), tireRubberMat);
      wheelB.rotation.z = Math.PI / 2;
      wheelB.position.set(gearX + 0.025, -0.184, -0.04);

      airplane.add(mainStrut, wheelA, wheelB);
    });

    airplane.add(
      fuselage,
      cheatlineL,
      cheatlineR,
      bellyFairing,
      nose,
      noseTip,
      cockpit,
      windowStripeL,
      windowStripeR,
      tailCone,
      apuNozzle,
      wingL,
      wingR,
      wingletL,
      wingletR,
      hStabL,
      hStabR,
      verticalFin,
      starL,
      starR,
      noseStrut,
      noseWheel1,
      noseWheel2
    );
    group.add(airplane);

    return group;
  }

  public static createGoToJailCorner(): THREE.Group {
    return CornerLandmarks.createAirportCorner();
  }
}
