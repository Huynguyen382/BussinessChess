import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { LandmarkMaterials } from './LandmarkMaterials';
import { LandmarkHelpers } from './LandmarkHelpers';

/**
 * 4 Đại Công Trình Biểu Tượng tại 4 góc bàn cờ (Corner Mega-Landmarks 3.2 x 3.2 units)
 * Chuẩn đặc tả MASTER_GRAPHICS_DESIGN.md (Mục 3):
 * 1. Ô 0: Khởi Hành (GO) – Cổng Khải Hoàn Môn Hoàng Kim
 * 2. Ô 10: Nhà Tù / Thăm Tù (JAIL) – Khu Liên Hợp Pháo Đài Giam & Khu Thăm Nuôi
 * 3. Ô 20: Bãi Đỗ Xe (FREE PARKING) – Trạm Dịch Vụ Retro 1950s
 * 4. Ô 30: Vào Tù (GO TO JAIL) – Đồn Cảnh Sát Trưởng
 */
export class CornerLandmarks {
  // =========================================================================
  // 1. Ô 0: XUẤT PHÁT (GO) – CỔNG KHẢI HOÀN MÔN HOÀNG KIM
  // =========================================================================
  public static createGOCorner(): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(2.6, 2.6, 0.55));

    const marbleMat = LandmarkMaterials.getMat('marbleWhite', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.25,
      metalness: 0.08
    }));
    const goldMat = LandmarkMaterials.getMat('shinyGold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F39C12',
      emissiveIntensity: 0.35,
      metalness: 0.88,
      roughness: 0.15
    }));
    const redRubyMat = LandmarkMaterials.getMat('redRuby', () => new THREE.MeshStandardMaterial({
      color: '#E84118',
      roughness: 0.2,
      emissive: '#D63031',
      emissiveIntensity: 0.45
    }));
    const velvetCarpetMat = LandmarkMaterials.getMat('velvetCarpetRed', () => new THREE.MeshStandardMaterial({
      color: '#D63031',
      roughness: 0.65
    }));

    // Bục đá cẩm thạch trắng ngà
    const basePlinth = new THREE.Mesh(new RoundedBoxGeometry(2.45, 0.14, 2.45, 3, 0.04), marbleMat);
    basePlinth.position.y = 0.07;
    basePlinth.receiveShadow = true;
    group.add(basePlinth);

    // Thảm đỏ nhung (#D63031) trải dài từ lòng cổng hướng ra đại lộ bàn cờ
    const carpet = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.03, 2.1, 2, 0.01), velvetCarpetMat);
    carpet.position.set(0, 0.15, 0.1);
    carpet.receiveShadow = true;
    const carpetGoldTrimL = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.035, 2.1, 2, 0.008), goldMat);
    carpetGoldTrimL.position.set(-0.44, 0.152, 0.1);
    const carpetGoldTrimR = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.035, 2.1, 2, 0.008), goldMat);
    carpetGoldTrimR.position.set(0.44, 0.152, 0.1);
    group.add(carpet, carpetGoldTrimL, carpetGoldTrimR);

    // Hai trụ cột thức La Mã (Corinthian) bằng đá cẩm thạch trắng ngà, đầu cột đúc hoa lá mạ vàng (#F1C40F)
    const makeCorinthianPillar = (x: number) => {
      const pBase = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.16, 0.52, 2, 0.03), marbleMat);
      pBase.position.set(x, 0.22, -0.15);
      const pCol = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.23, 1.42, 16), marbleMat);
      pCol.position.set(x, 0.92, -0.15);
      pCol.castShadow = true;

      // Đầu cột Corinthian mạ vàng đúc hoa lá
      const pCapLower = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.19, 0.14, 12), goldMat);
      pCapLower.position.set(x, 1.62, -0.15);
      const pCapAbacus = new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.1, 0.54, 2, 0.02), goldMat);
      pCapAbacus.position.set(x, 1.72, -0.15);

      group.add(pBase, pCol, pCapLower, pCapAbacus);
    };
    makeCorinthianPillar(-0.86);
    makeCorinthianPillar(0.86);

    // Vòm cuốn nối 2 trụ cột
    const archTop = new THREE.Mesh(new RoundedBoxGeometry(2.35, 0.34, 0.58, 3, 0.06), marbleMat);
    archTop.position.set(0, 1.92, -0.15);
    archTop.castShadow = true;

    // Bảng chữ dập nổi START +200M viền vàng dưới vòm cuốn
    const startPlaque = new THREE.Mesh(new RoundedBoxGeometry(1.38, 0.26, 0.12, 2, 0.03), goldMat);
    startPlaque.position.set(0, 1.92, 0.14);

    // Vương miện đính ngọc Ruby đỏ rực rỡ viền vàng phát sáng trên đỉnh vòm cuốn
    const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.28, 0.22, 8), goldMat);
    crownBase.position.set(0, 2.2, -0.15);
    const rubyGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 1), redRubyMat);
    rubyGem.position.set(0, 2.42, -0.15);
    rubyGem.userData = { animType: 'rotate_pulse' };

    // Rương kho báu mở hé nắp tràn ngập thỏi vàng và đá quý kim cương
    const chestGroup = LandmarkHelpers.createTreasureChestMini(0.88);
    chestGroup.position.set(0, 0.16, 0.52);
    group.add(chestGroup);

    group.add(archTop, startPlaque, crownBase, rubyGem);
    return group;
  }

  // =========================================================================
  // 2. Ô 10: NHÀ TÙ & THĂM TÙ (JAIL / JUST VISITING) – KHU LIÊN HỢP PHÁO ĐÀI GIAM
  // =========================================================================
  public static createJailCorner(): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(2.5, 2.5, 0.55));

    const stoneMat = LandmarkMaterials.getMat('graniteStone', () => new THREE.MeshStandardMaterial({
      color: '#57606F',
      roughness: 0.75,
      metalness: 0.15
    }));
    const titaniumMat = LandmarkMaterials.getMat('titaniumIron', () => new THREE.MeshStandardMaterial({
      color: '#2D3436',
      roughness: 0.32,
      metalness: 0.88
    }));
    const goldMat = LandmarkMaterials.getMat('shinyGold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      metalness: 0.88,
      roughness: 0.16
    }));
    const orangeStoneMat = LandmarkMaterials.getMat('visitingOrangePath', () => new THREE.MeshStandardMaterial({
      color: '#E67E22',
      roughness: 0.55
    }));
    const boothRedMat = LandmarkMaterials.getMat('phoneBoothRed', () => new THREE.MeshStandardMaterial({
      color: '#D63031',
      roughness: 0.3
    }));
    const glassMat = LandmarkMaterials.getMat('boothGlass', () => new THREE.MeshStandardMaterial({
      color: '#74B9FF',
      transparent: true,
      opacity: 0.55,
      roughness: 0.1
    }));
    const searchlightMat = LandmarkMaterials.getMat('searchlightBeam', () => new THREE.MeshBasicMaterial({
      color: '#FFF275',
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      depthWrite: false
    }));

    // 1. Khu giam cầm (In Jail): Pháo đài đá kiên cố ở góc trong
    const fortressBase = new THREE.Mesh(new RoundedBoxGeometry(1.65, 0.2, 1.65, 3, 0.04), stoneMat);
    fortressBase.position.set(-0.28, 0.1, -0.28);
    fortressBase.receiveShadow = true;
    group.add(fortressBase);

    // Tháp canh bát giác kiên cố
    const watchTower = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.66, 1.55, 8), stoneMat);
    watchTower.position.set(-0.55, 0.88, -0.55);
    watchTower.castShadow = true;

    const towerCabin = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.52, 0.38, 8), titaniumMat);
    towerCabin.position.set(-0.55, 1.76, -0.55);

    const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(0.72, 0.46, 8), stoneMat);
    towerRoof.position.set(-0.55, 2.15, -0.55);

    // Đèn pha an ninh quét luồng sáng nón trong suốt trên đỉnh tháp
    const searchlightPivot = new THREE.Group();
    searchlightPivot.position.set(-0.55, 1.82, -0.55);
    searchlightPivot.userData = { animType: 'spin_y' };

    const lampHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.18, 10), goldMat);
    lampHousing.rotation.x = Math.PI / 2;
    lampHousing.position.set(0, 0, 0.35);

    const lightCone = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.15, 14, 1, true), searchlightMat);
    lightCone.rotation.x = -Math.PI / 2.4;
    lightCone.position.set(0, -0.22, 0.88);
    searchlightPivot.add(lampHousing, lightCone);

    // Hệ thống song sắt thép titan xám đen (#2D3436) với ổ khóa xích vàng bản lớn
    for (let i = 0; i < 5; i++) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.98, 8), titaniumMat);
      bar.position.set(-0.08 + i * 0.18, 0.62, 0.35);
      bar.castShadow = true;
      group.add(bar);
    }
    const barCrossTop = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.07, 0.08, 2, 0.015), titaniumMat);
    barCrossTop.position.set(0.28, 1.08, 0.35);
    const barCrossBottom = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.07, 0.08, 2, 0.015), titaniumMat);
    barCrossBottom.position.set(0.28, 0.24, 0.35);

    // Ổ khóa xích vàng bản lớn treo chính giữa song sắt
    const padlockBody = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.24, 0.1, 2, 0.03), goldMat);
    padlockBody.position.set(0.28, 0.58, 0.42);
    const padlockShackle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.025, 8, 14, Math.PI), goldMat);
    padlockShackle.position.set(0.28, 0.71, 0.42);

    // 2. Khu thăm nuôi (Just Visiting): Con đường lát đá màu cam bao quanh phía ngoài góc vuông
    const pathOuterA = new THREE.Mesh(new RoundedBoxGeometry(2.35, 0.08, 0.58, 2, 0.02), orangeStoneMat);
    pathOuterA.position.set(0, 0.04, 0.85);
    pathOuterA.receiveShadow = true;
    const pathOuterB = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.08, 1.75, 2, 0.02), orangeStoneMat);
    pathOuterB.position.set(0.88, 0.04, -0.25);
    pathOuterB.receiveShadow = true;

    // Bốt điện thoại công cộng có vách kính
    const phoneBooth = new THREE.Group();
    phoneBooth.position.set(0.88, 0.08, -0.55);
    const boothFrame = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.72, 0.36, 2, 0.03), boothRedMat);
    boothFrame.position.y = 0.36;
    boothFrame.castShadow = true;
    const boothGlass = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.48, 0.28, 2, 0.02), glassMat);
    boothGlass.position.y = 0.38;
    phoneBooth.add(boothFrame, boothGlass);

    // Ghế đá ngồi chờ khu thăm nuôi
    const stoneBench = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.16, 0.22, 2, 0.02), stoneMat);
    stoneBench.position.set(-0.45, 0.14, 0.85);

    group.add(
      watchTower, towerCabin, towerRoof, searchlightPivot,
      barCrossTop, barCrossBottom, padlockBody, padlockShackle,
      pathOuterA, pathOuterB, phoneBooth, stoneBench
    );
    return group;
  }

  // =========================================================================
  // 3. Ô 20: BÃI ĐỖ XE MIỄN PHÍ (FREE PARKING) – TRẠM DỊCH VỤ RETRO 1950s
  // =========================================================================
  public static createFreeParkingCorner(): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(2.5, 2.5, 0.55));

    const asphaltMat = LandmarkMaterials.getMat('asphaltGray', () => new THREE.MeshStandardMaterial({
      color: '#2D3436',
      roughness: 0.65
    }));
    const retroRedMat = LandmarkMaterials.getMat('retroRed', () => new THREE.MeshStandardMaterial({
      color: '#D63031',
      roughness: 0.25,
      metalness: 0.15
    }));
    const whiteMat = LandmarkMaterials.getMat('pureWhite', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.25
    }));
    const cyanNeonMat = LandmarkMaterials.getMat('retroNeonCyan', () => new THREE.MeshStandardMaterial({
      color: '#00CEC9',
      emissive: '#00CEC9',
      emissiveIntensity: 1.1,
      roughness: 0.1
    }));
    const chromeMat = LandmarkMaterials.getMat('shinyChrome', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      metalness: 0.95,
      roughness: 0.08
    }));
    const candyRedCarMat = LandmarkMaterials.getMat('candyRedGloss', () => new THREE.MeshStandardMaterial({
      color: '#E84118',
      roughness: 0.12,
      metalness: 0.45
    }));

    // Mặt sân đỗ xe asphalt
    const base = new THREE.Mesh(new RoundedBoxGeometry(2.38, 0.14, 2.38, 3, 0.04), asphaltMat);
    base.position.y = 0.07;
    base.receiveShadow = true;
    group.add(base);

    // 1. Mái che trạm xăng Retro vintage sọc đỏ trắng viền dải đèn neon xanh cyan
    const canopyPillar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.35, 12), chromeMat);
    canopyPillar1.position.set(-0.68, 0.78, -0.58);
    const canopyPillar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.35, 12), chromeMat);
    canopyPillar2.position.set(0.32, 0.78, -0.58);

    const canopyRoof = new THREE.Mesh(new RoundedBoxGeometry(1.55, 0.14, 0.92, 3, 0.04), whiteMat);
    canopyRoof.position.set(-0.18, 1.48, -0.52);
    canopyRoof.castShadow = true;

    // Sọc đỏ Retro trên mái che
    for (let s = -0.55; s <= 0.55; s += 0.36) {
      const stripe = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.15, 0.94, 2, 0.015), retroRedMat);
      stripe.position.set(-0.18 + s, 1.48, -0.52);
      group.add(stripe);
    }

    // Dải đèn neon xanh cyan phát sáng viền quanh mái che
    const neonTrim = new THREE.Mesh(new RoundedBoxGeometry(1.6, 0.04, 0.96, 2, 0.02), cyanNeonMat);
    neonTrim.position.set(-0.18, 1.41, -0.52);
    neonTrim.userData = { animType: 'flicker' };

    // 2. Cột bơm xăng cổ điển Route 66 hình trụ thủy tinh có đồng hồ kim chỉ số
    const pumpIsland = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.08, 0.42, 2, 0.02), whiteMat);
    pumpIsland.position.set(-0.18, 0.18, -0.58);

    const makeGasPump = (px: number) => {
      const pumpBody = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.52, 0.2, 2, 0.03), retroRedMat);
      pumpBody.position.set(px, 0.48, -0.58);
      pumpBody.castShadow = true;
      const pumpGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.18, 12), cyanNeonMat);
      pumpGlass.position.set(px, 0.82, -0.58);
      const pumpDial = new THREE.Mesh(new THREE.CircleGeometry(0.08, 12), whiteMat);
      pumpDial.position.set(px, 0.96, -0.58);
      group.add(pumpBody, pumpGlass, pumpDial);
    };
    makeGasPump(-0.42);
    makeGasPump(0.06);

    // 3. Xe thể thao mui trần cổ điển màu đỏ candy phủ bóng tráng gương, đậu góc chéo 45 độ
    const convertible = new THREE.Group();
    convertible.position.set(0.26, 0.14, 0.34);
    convertible.rotation.y = -Math.PI / 4;

    const carHull = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.24, 0.46, 4, 0.06), candyRedCarMat);
    carHull.position.y = 0.16;
    carHull.castShadow = true;

    // Kính chắn gió nghiêng thể thao & khoang ghế da mở mui
    const windshield = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.16, 0.4, 2, 0.015), cyanNeonMat);
    windshield.position.set(0.14, 0.32, 0);
    windshield.rotation.z = 0.35;

    const seat = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.14, 0.36, 2, 0.02), whiteMat);
    seat.position.set(-0.08, 0.28, 0);

    // 4 Bánh xe vành mạ crôm sáng loáng
    const tireMat = LandmarkMaterials.getMat('tinyWheelRubber', () => new THREE.MeshStandardMaterial({ color: '#1E272E', roughness: 0.7 }));
    const wheelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.06, 14);
    wheelGeo.rotateX(Math.PI / 2);
    const rimGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.065, 10);
    rimGeo.rotateX(Math.PI / 2);
    [[-0.26, 0.1, 0.23], [0.26, 0.1, 0.23], [-0.26, 0.1, -0.23], [0.26, 0.1, -0.23]].forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wheelGeo, tireMat);
      w.position.set(wx, wy, wz);
      const r = new THREE.Mesh(rimGeo, chromeMat);
      r.position.set(wx, wy, wz);
      convertible.add(w, r);
    });

    convertible.add(carHull, windshield, seat);

    group.add(canopyPillar1, canopyPillar2, canopyRoof, neonTrim, pumpIsland, convertible);
    return group;
  }

  // =========================================================================
  // 4. Ô 30: SÂN BAY QUỐC TẾ (AIRPORT) – QUẦN THỂ NHÀ GA, MÁY BAY & THÁP KHÔNG LƯU
  // =========================================================================
  public static createAirportCorner(): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(2.6, 2.6, 0.55));

    const tarmacMat = LandmarkMaterials.getMat('airportTarmac', () => new THREE.MeshStandardMaterial({
      color: '#222831',
      roughness: 0.82,
      metalness: 0.12
    }));
    const runwayStripeMat = LandmarkMaterials.getMat('runwayWhiteStripe', () => new THREE.MeshStandardMaterial({
      color: '#F8F9FA',
      emissive: '#DFE4EA',
      emissiveIntensity: 0.25,
      roughness: 0.35
    }));
    const runwayTaxiLineMat = LandmarkMaterials.getMat('runwayTaxiLine', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F39C12',
      emissiveIntensity: 0.4,
      roughness: 0.4
    }));
    const terminalGlassMat = LandmarkMaterials.getMat('airportGlass', () => new THREE.MeshStandardMaterial({
      color: '#00CEC9',
      emissive: '#0984E3',
      emissiveIntensity: 0.35,
      roughness: 0.1,
      metalness: 0.88
    }));
    const whiteSteelMat = LandmarkMaterials.getMat('pureWhiteSteel', () => new THREE.MeshStandardMaterial({
      color: '#F5F6FA',
      roughness: 0.25,
      metalness: 0.25
    }));
    const jetWhiteMat = LandmarkMaterials.getMat('jetFuselage', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.18,
      metalness: 0.15
    }));
    const chromeEngineMat = LandmarkMaterials.getMat('chromeMetal', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      metalness: 0.96,
      roughness: 0.06
    }));
    const cockpitDarkMat = LandmarkMaterials.getMat('cockpitGlass', () => new THREE.MeshStandardMaterial({
      color: '#1E272E',
      roughness: 0.1,
      metalness: 0.85
    }));
    const tireRubberMat = LandmarkMaterials.getMat('tinyWheelRubber', () => new THREE.MeshStandardMaterial({
      color: '#2D3436',
      roughness: 0.85
    }));
    const beaconRedMat = LandmarkMaterials.getMat('airportBeaconRed', () => new THREE.MeshStandardMaterial({
      color: '#FF4757',
      emissive: '#FF4757',
      emissiveIntensity: 1.35,
      roughness: 0.1
    }));
    const taxiwayGreenMat = LandmarkMaterials.getMat('taxiwayGreenLight', () => new THREE.MeshStandardMaterial({
      color: '#2ED573',
      emissive: '#2ED573',
      emissiveIntensity: 0.85,
      roughness: 0.15
    }));
    const flagRedMat = LandmarkMaterials.getMat('vietnamFlagRed', () => new THREE.MeshStandardMaterial({
      color: '#DA251D',
      roughness: 0.35
    }));
    const goldStarMat = LandmarkMaterials.getMat('shinyGold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      metalness: 0.92,
      roughness: 0.15
    }));

    // ==========================================
    // A. BỆ ĐƯỜNG BĂNG & SÂN ĐỖ (Runway Apron Plinth)
    // ==========================================
    const basePlinth = new THREE.Mesh(new RoundedBoxGeometry(2.46, 0.14, 2.46, 3, 0.04), tarmacMat);
    basePlinth.position.y = 0.07;
    basePlinth.receiveShadow = true;
    group.add(basePlinth);

    // Vạch vằn piano (Runway Threshold Piano Keys) đầu đường băng
    for (let k = -0.22; k <= 0.22; k += 0.09) {
      const thresholdKey = new THREE.Mesh(new RoundedBoxGeometry(0.045, 0.015, 0.18, 2, 0.003), runwayStripeMat);
      thresholdKey.position.set(0.72 + k, 0.148, 1.0);
      group.add(thresholdKey);
    }

    // Vạch kẻ tim đường băng cất hạ cánh (Runway Centerline Dashes)
    for (let z = -0.75; z <= 0.75; z += 0.38) {
      const dash = new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.015, 0.22, 2, 0.004), runwayStripeMat);
      dash.position.set(0.72, 0.148, z);
      group.add(dash);
    }

    // Vạch sơn đường lăn taxiway màu vàng dẫn lối máy bay vào ống lồng nhà ga
    const taxiCurve = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.015, 0.85, 2, 0.004), runwayTaxiLineMat);
    taxiCurve.position.set(0.22, 0.148, 0.05);
    group.add(taxiCurve);

    // Đèn tín hiệu viền đường băng (Runway Edge Lights)
    [-0.9, -0.45, 0, 0.45, 0.9].forEach(z => {
      const lightL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8), taxiwayGreenMat);
      lightL.position.set(0.46, 0.16, z);
      const lightR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8), taxiwayGreenMat);
      lightR.position.set(0.98, 0.16, z);
      group.add(lightL, lightR);
    });

    // ==========================================
    // B. NHÀ GA HÀNG KHÔNG QUỐC TẾ (Modern Curved Airport Terminal)
    // ==========================================
    const terminalGroup = new THREE.Group();
    terminalGroup.position.set(-0.55, 0.14, -0.45);

    // Thân nhà ga 2 tầng kết cấu thép trắng
    const terminalBase = new THREE.Mesh(new RoundedBoxGeometry(1.22, 0.42, 0.82, 3, 0.03), whiteSteelMat);
    terminalBase.position.y = 0.21;
    terminalBase.castShadow = true;

    // Mặt tiền vách kính vòm cong đón ánh sáng
    const glassFacade = new THREE.Mesh(new RoundedBoxGeometry(1.24, 0.32, 0.15, 2, 0.02), terminalGlassMat);
    glassFacade.position.set(0, 0.22, 0.36);

    // Mái vòm cánh diều khí động học vát cong (Winged Aerodynamic Canopy)
    const canopyRoof = new THREE.Mesh(new RoundedBoxGeometry(1.36, 0.08, 0.98, 3, 0.04), whiteSteelMat);
    canopyRoof.position.set(0, 0.46, 0.02);
    canopyRoof.castShadow = true;

    // Kính giếng trời Skylight trên nóc nhà ga
    const skylight = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.04, 0.55, 2, 0.01), terminalGlassMat);
    skylight.position.set(0, 0.51, 0.02);

    // Biển hiệu chữ nổi SÂN BAY mạ vàng
    const terminalSign = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.08, 0.04, 2, 0.01), goldStarMat);
    terminalSign.position.set(0, 0.44, 0.46);

    // Ống lồng dẫn khách (Jet Bridge) vươn từ nhà ga nối chuẩn xác vào cửa máy bay
    const jetBridgeTunnel = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.18, 0.18, 2, 0.015), whiteSteelMat);
    jetBridgeTunnel.position.set(0.68, 0.24, 0.22);
    const jetBridgeRotunda = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 12), whiteSteelMat);
    jetBridgeRotunda.position.set(0.95, 0.24, 0.22);

    terminalGroup.add(terminalBase, glassFacade, canopyRoof, skylight, terminalSign, jetBridgeTunnel, jetBridgeRotunda);
    group.add(terminalGroup);

    // ==========================================
    // C. THÁP KHÔNG LƯU ĐIỀU KHIỂN BAY (Air Traffic Control Tower - ATC)
    // ==========================================
    const atcGroup = new THREE.Group();
    atcGroup.position.set(-0.82, 0.14, 0.65);

    // Trụ tháp cao thon dần lên cao
    const atcShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.20, 1.15, 16), whiteSteelMat);
    atcShaft.position.y = 0.575;
    atcShaft.castShadow = true;

    // Đài quan sát chỉ huy 360 độ (Control Cab) vát nghiêng hiện đại
    const atcCab = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.18, 0.26, 16), terminalGlassMat);
    atcCab.position.y = 1.25;

    const atcRoofConical = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.14, 16), whiteSteelMat);
    atcRoofConical.position.y = 1.45;

    // Cụm Radar xoay 360 độ & Đèn cảnh báo chóp tháp
    const radarGroup = new THREE.Group();
    radarGroup.position.y = 1.58;
    radarGroup.userData = { animType: 'spin_y' };

    const radarMast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8), chromeEngineMat);
    const radarDish = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.025, 14), whiteSteelMat);
    radarDish.rotation.x = Math.PI / 3;
    radarDish.position.y = 0.06;

    const beaconLight = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), beaconRedMat);
    beaconLight.position.y = 0.15;
    beaconLight.userData = { animType: 'pulse_red' };

    radarGroup.add(radarMast, radarDish, beaconLight);
    atcGroup.add(atcShaft, atcCab, atcRoofConical, radarGroup);
    group.add(atcGroup);

    // ==========================================
    // D. MÁY BAY PHẢN LỰC DÂN DỤNG (Commercial Jetliner - Vietnam Airlines Spirit)
    // ==========================================
    const airplane = new THREE.Group();
    // Đặt máy bay đỗ ngay ngắn trên sân đỗ cạnh ống lồng nhà ga
    airplane.position.set(0.22, 0.36, 0.05);

    // 1. Thân máy bay khí động học (Fuselage)
    const fuselageLength = 1.24;
    const fuselageRadius = 0.14;
    const fuselage = new THREE.Mesh(
      new THREE.CylinderGeometry(fuselageRadius, fuselageRadius, fuselageLength, 16),
      jetWhiteMat
    );
    fuselage.rotation.x = Math.PI / 2;
    fuselage.position.z = -0.05;
    fuselage.castShadow = true;

    // 2. Mũi máy bay bo tròn thon nhọn (Streamlined Nose Cone)
    const nose = new THREE.Mesh(new THREE.ConeGeometry(fuselageRadius, 0.32, 16), jetWhiteMat);
    nose.rotation.x = -Math.PI / 2;
    nose.position.z = 0.57 + 0.16; // Chóp mũi tiếp giáp chuẩn xác đầu thân tại z = 0.57

    // 3. Kính buồng lái phi công (Cockpit Windshield)
    const cockpit = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.07, 0.14, 2, 0.02), cockpitDarkMat);
    cockpit.position.set(0, 0.08, 0.52);

    // 4. Hàng cửa sổ hành khách dọc 2 bên thân (Cabin Windows)
    const windowStripeL = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.028, 0.72), terminalGlassMat);
    windowStripeL.position.set(-fuselageRadius - 0.002, 0.035, -0.05);
    const windowStripeR = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.028, 0.72), terminalGlassMat);
    windowStripeR.position.set(fuselageRadius + 0.002, 0.035, -0.05);

    // 5. Đôi cánh xuôi dạng Swept-Wing dang rộng khí động học
    const wingSpan = 1.28;
    const wingRootChord = 0.34;
    const mainWings = new THREE.Mesh(new THREE.BoxGeometry(wingSpan, 0.035, wingRootChord), jetWhiteMat);
    mainWings.position.set(0, -0.02, 0.02);
    mainWings.castShadow = true;

    // Cánh phụ khí động học vút cong ở 2 đầu mút cánh (Winglets)
    const wingletL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.08), flagRedMat);
    wingletL.position.set(-wingSpan / 2, 0.05, 0.02);
    wingletL.rotation.z = -0.25;

    const wingletR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.08), flagRedMat);
    wingletR.position.set(wingSpan / 2, 0.05, 0.02);
    wingletR.rotation.z = 0.25;

    // 6. Hai động cơ phản lực Turbofan mạ crom dưới cánh
    [-0.34, 0.34].forEach(xOff => {
      const engineNacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.075, 0.30, 14), jetWhiteMat);
      engineNacelle.rotation.x = Math.PI / 2;
      engineNacelle.position.set(xOff, -0.10, 0.04);

      const engineSpinner = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.08, 12), chromeEngineMat);
      engineSpinner.rotation.x = -Math.PI / 2;
      engineSpinner.position.set(xOff, -0.10, 0.20);

      const engineExhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 0.06, 12), chromeEngineMat);
      engineExhaust.rotation.x = Math.PI / 2;
      engineExhaust.position.set(xOff, -0.10, -0.13);

      airplane.add(engineNacelle, engineSpinner, engineExhaust);
    });

    // 7. Cánh đuôi ngang (Horizontal Stabilizer)
    const tailHorizontal = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.025, 0.16), jetWhiteMat);
    tailHorizontal.position.set(0, 0.05, -0.62);

    // 8. Cánh đuôi đứng (Vertical Tail Fin) gắn CHUẨN XÁC trên sống đuôi
    const finShape = new THREE.Shape();
    finShape.moveTo(-0.16, 0);   // Gốc đuôi sau
    finShape.lineTo(0.14, 0);    // Gốc đuôi trước
    finShape.lineTo(0.04, 0.30); // Đỉnh trước vát chéo
    finShape.lineTo(-0.09, 0.30);// Đỉnh sau
    finShape.closePath();

    const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.028, bevelEnabled: false });
    finGeo.rotateY(Math.PI / 2);
    finGeo.translate(0.014, 0, 0);

    const verticalFin = new THREE.Mesh(finGeo, flagRedMat);
    verticalFin.position.set(0, 0.12, -0.62);

    // Ngôi sao vàng 5 cánh nổi bật trên nền đỏ cả 2 mặt cánh đuôi
    const starL = new THREE.Mesh(new THREE.CircleGeometry(0.055, 5), goldStarMat);
    starL.rotation.y = -Math.PI / 2;
    starL.position.set(-0.018, 0.28, -0.62);

    const starR = new THREE.Mesh(new THREE.CircleGeometry(0.055, 5), goldStarMat);
    starR.rotation.y = Math.PI / 2;
    starR.position.set(0.018, 0.28, -0.62);

    // 9. Hệ thống càng đáp 3 cụm bánh xe (Landing Gear) tiếp đất vững chãi
    // A. Càng đáp mũi (Nose Gear)
    const noseStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 8), chromeEngineMat);
    noseStrut.position.set(0, -0.11, 0.42);
    const noseWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 10), tireRubberMat);
    noseWheel.rotation.z = Math.PI / 2;
    noseWheel.position.set(0, -0.18, 0.42);

    // B. Càng đáp chính 2 bên (Main Gears)
    [-0.24, 0.24].forEach(gearX => {
      const mainStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 8), chromeEngineMat);
      mainStrut.position.set(gearX, -0.11, -0.02);
      const wheelL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.035, 10), tireRubberMat);
      wheelL.rotation.z = Math.PI / 2;
      wheelL.position.set(gearX - 0.025, -0.18, -0.02);
      const wheelR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.035, 10), tireRubberMat);
      wheelR.rotation.z = Math.PI / 2;
      wheelR.position.set(gearX + 0.025, -0.18, -0.02);

      airplane.add(mainStrut, wheelL, wheelR);
    });

    airplane.add(
      fuselage,
      nose,
      cockpit,
      windowStripeL,
      windowStripeR,
      mainWings,
      wingletL,
      wingletR,
      tailHorizontal,
      verticalFin,
      starL,
      starR,
      noseStrut,
      noseWheel
    );
    group.add(airplane);

    return group;
  }

  // Alias tương thích ngược cho các hệ thống cũ nếu có
  public static createGoToJailCorner(): THREE.Group {
    return CornerLandmarks.createAirportCorner();
  }
}
