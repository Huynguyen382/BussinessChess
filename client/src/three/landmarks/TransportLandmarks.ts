import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { LandmarkMaterials } from './LandmarkMaterials';

/**
 * HỆ THỐNG GIAO THÔNG ĐẦU MỐI (4 RAILROADS / TRANSPORT HUBS - TIER 3):
 * - Ô 5: Bến Xe Miền Tây (Bến xe khách liên tỉnh lớn nhất phương Nam kết nối 13 tỉnh ĐBSCL)
 *        -> Tòa nhà ga hiện đại, mái che canopy vòm đón khách, xe khách giường nằm liên tỉnh 3D,
 *           bãi đỗ asphalt, vạch kẻ làn bus bay và cột đèn cao áp bến bãi.
 * - Ô 15, 25, 35: Ga Sài Gòn, Ga Đà Nẵng, Ga Hà Nội
 *        -> Đầu máy xe lửa hơi nước đen tuyền viền vàng đồng, đường ray sắt 3D trên đá dăm & tà vẹt gỗ,
 *           3 cụm khói mây trắng tròn mập và cột đèn tín hiệu pulse đỏ - xanh nhịp nhàng.
 */
export class TransportLandmarks {
  public static createRailroadModel(tileId: number): THREE.Group {
    if (tileId === 5) {
      return this.createBenXeMienTayModel();
    }
    return this.createTrainStationModel(tileId);
  }

  /**
   * BẾN XE MIỀN TÂY (Ô 5):
   * Mô hình 3D độc bản chuẩn xác: Nhà ga bến xe trung tâm, mái vòm đón khách,
   * xe khách giường nằm cao cấp 3D, làn đỗ xe bus, vạch kẻ đi bộ và cột đèn bến bãi.
   */
  public static createBenXeMienTayModel(): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(1.36, 1.36, 0.45));

    // Hệ vật liệu tối ưu theo LandmarkMaterials
    const asphaltMat = LandmarkMaterials.getMat('bxAsphaltApron', () => new THREE.MeshStandardMaterial({
      color: '#2F3640',
      roughness: 0.65
    }));
    const concourseMat = LandmarkMaterials.getMat('bxConcourseFloor', () => new THREE.MeshStandardMaterial({
      color: '#ECEFF1',
      roughness: 0.42
    }));
    const terminalWallMat = LandmarkMaterials.getMat('bxTerminalWallWhite', () => new THREE.MeshStandardMaterial({
      color: '#F8F9FA',
      roughness: 0.28
    }));
    const terminalGlassMat = LandmarkMaterials.getMat('bxTerminalGlassTint', () => new THREE.MeshStandardMaterial({
      color: '#2C3E50',
      roughness: 0.1,
      metalness: 0.82
    }));
    const terminalRoofMat = LandmarkMaterials.getMat('bxTerminalRoofBlue', () => new THREE.MeshStandardMaterial({
      color: '#0984E3',
      roughness: 0.35
    }));
    const signRedMat = LandmarkMaterials.getMat('bxSignLedRed', () => new THREE.MeshStandardMaterial({
      color: '#D63031',
      emissive: '#FF3838',
      emissiveIntensity: 0.75,
      roughness: 0.25
    }));
    const canopyGlassMat = LandmarkMaterials.getMat('bxCanopyGlassTeal', () => new THREE.MeshStandardMaterial({
      color: '#00CEC9',
      transparent: true,
      opacity: 0.65,
      roughness: 0.15
    }));
    const steelStructureMat = LandmarkMaterials.getMat('bxSteelStructureSilver', () => new THREE.MeshStandardMaterial({
      color: '#DFE6E9',
      metalness: 0.88,
      roughness: 0.16
    }));
    const busBodyOrangeMat = LandmarkMaterials.getMat('bxBusOrangeRed', () => new THREE.MeshStandardMaterial({
      color: '#E67E22',
      roughness: 0.22,
      metalness: 0.15
    }));
    const busStripeGoldMat = LandmarkMaterials.getMat('bxBusStripeGold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      metalness: 0.75,
      roughness: 0.2
    }));
    const busGlassMat = LandmarkMaterials.getMat('bxBusGlassDark', () => new THREE.MeshStandardMaterial({
      color: '#1E272E',
      metalness: 0.88,
      roughness: 0.08
    }));
    const rubberBlackMat = LandmarkMaterials.getMat('bxRubberTireBlack', () => new THREE.MeshStandardMaterial({
      color: '#1E272E',
      roughness: 0.85
    }));
    const wheelAlloyMat = LandmarkMaterials.getMat('bxWheelAlloySilver', () => new THREE.MeshStandardMaterial({
      color: '#B2BEC3',
      metalness: 0.85,
      roughness: 0.2
    }));
    const ledYellowMat = LandmarkMaterials.getMat('bxLedYellow', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F39C12',
      emissiveIntensity: 1.1,
      roughness: 0.1
    }));
    const ledRedMat = LandmarkMaterials.getMat('bxLedRed', () => new THREE.MeshStandardMaterial({
      color: '#FF3838',
      emissive: '#FF3838',
      emissiveIntensity: 1.0,
      roughness: 0.1
    }));
    const lineYellowMat = LandmarkMaterials.getMat('bxLineYellow', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      roughness: 0.4
    }));
    const lineWhiteMat = LandmarkMaterials.getMat('bxLineWhite', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.4
    }));
    const foliageGreenMat = LandmarkMaterials.getMat('bxFoliageGreen', () => new THREE.MeshStandardMaterial({
      color: '#27AE60',
      roughness: 0.45
    }));

    // 1. THỀM BẾN BÃI & SÂN ĐỖ XE ASPHALT
    const apron = new THREE.Mesh(new RoundedBoxGeometry(1.24, 0.05, 0.82, 3, 0.02), asphaltMat);
    apron.position.set(0, 0.025, 0.24);
    apron.receiveShadow = true;

    const concoursePlatform = new THREE.Mesh(new RoundedBoxGeometry(1.24, 0.07, 0.46, 3, 0.02), concourseMat);
    concoursePlatform.position.set(0, 0.035, -0.42);
    concoursePlatform.receiveShadow = true;

    // Vạch sơn vàng phân làn đỗ xe khách (Bus Bays)
    [-0.34, 0.22].forEach(vx => {
      const yellowLine = new THREE.Mesh(new THREE.PlaneGeometry(0.024, 0.58), lineYellowMat);
      yellowLine.rotation.x = -Math.PI / 2;
      yellowLine.rotation.z = -0.08;
      yellowLine.position.set(vx, 0.052, 0.24);
      group.add(yellowLine);
    });

    // Vạch sang đường cho hành khách đi bộ (Zebra crossing)
    for (let z = 0; z < 5; z++) {
      const zebra = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.038), lineWhiteMat);
      zebra.rotation.x = -Math.PI / 2;
      zebra.position.set(0.42, 0.052, 0.06 + z * 0.068);
      group.add(zebra);
    }

    // 2. TÒA NHÀ GA BẾN XE MIỀN TÂY (TERMINAL CONCOURSE)
    const terminalGroup = new THREE.Group();
    terminalGroup.position.set(0, 0, -0.44);

    // Khối nhà ga chính hiện đại
    const mainBuilding = new THREE.Mesh(new RoundedBoxGeometry(1.08, 0.46, 0.32, 4, 0.04), terminalWallMat);
    mainBuilding.position.y = 0.28;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;

    // Mặt kính sảnh đón tầng 1
    const groundGlass = new THREE.Mesh(new RoundedBoxGeometry(0.96, 0.22, 0.02, 2, 0.01), terminalGlassMat);
    groundGlass.position.set(0, 0.16, 0.165);

    // Dãy kính tầng 2 phòng điều hành
    [-0.32, -0.11, 0.11, 0.32].forEach(gx => {
      const win = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.11, 0.015, 2, 0.005), terminalGlassMat);
      win.position.set(gx, 0.36, 0.165);
      terminalGroup.add(win);
    });

    // Mái che nhà ga màu xanh dương thanh lịch
    const roof = new THREE.Mesh(new RoundedBoxGeometry(1.14, 0.06, 0.36, 2, 0.02), terminalRoofMat);
    roof.position.y = 0.52;
    roof.castShadow = true;

    // Bảng hiệu LED chữ nổi hoành tráng: "BẾN XE MIỀN TÂY"
    const signBox = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.11, 0.035, 2, 0.005), signRedMat);
    signBox.position.set(0, 0.58, 0.1);
    signBox.userData = { animType: 'flicker' };

    const signBezel = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.13, 0.02), steelStructureMat);
    signBezel.position.set(0, 0.58, 0.08);

    terminalGroup.add(mainBuilding, groundGlass, roof, signBox, signBezel);

    // 3. MÁI VÒM CANOPY ĐÓN KHÁCH HIỆN ĐẠI (CANTILEVER PASSENGER CANOPY)
    const canopyGroup = new THREE.Group();
    canopyGroup.position.set(0, 0.34, -0.16);

    // Mái vòm kính cường lực xanh ngọc đón gió
    const canopyRoof = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.024, 0.36, 2, 0.01), canopyGlassMat);
    canopyRoof.rotation.x = 0.06;
    canopyRoof.position.y = 0.04;
    canopyRoof.castShadow = true;

    // Khung dầm thép đỡ mái vòm
    [-0.38, 0, 0.38].forEach(tx => {
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.38, 8), steelStructureMat);
      beam.rotation.x = Math.PI / 2 + 0.06;
      beam.position.set(tx, 0.038, 0);
      canopyGroup.add(beam);
    });

    // 4 Cột trụ thép nghiêng nâng đỡ mái che
    [-0.38, 0.38].forEach(cx => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.34, 8), steelStructureMat);
      col.position.set(cx, -0.14, 0.08);
      col.rotation.x = -0.1;
      canopyGroup.add(col);
    });

    // Ghế băng chờ đón xe bằng inox dưới mái che
    [-0.32, -0.12].forEach(bx => {
      const bench = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.035, 0.06, 1, 0.005), steelStructureMat);
      bench.position.set(bx, 0.08, -0.22);
      group.add(bench);
    });

    // 4. XE KHÁCH GIƯỜNG NẰM LIÊN TỈNH MIỀN TÂY CAO CẤP 3D (EXPRESS SLEEPER COACH)
    const busGroup = new THREE.Group();
    busGroup.position.set(-0.06, 0.12, 0.22);
    busGroup.rotation.y = -0.06; // Đậu hơi chếch chuẩn tư thế đón khách

    // Thân xe khách bo tròn khí động học (Sơn đỏ cam rực rỡ đặc trưng miền Tây)
    const busBody = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.26, 0.28, 4, 0.04), busBodyOrangeMat);
    busBody.position.y = 0.07;
    busBody.castShadow = true;

    // Dải kính 2 tầng xe giường nằm đen bóng
    const busGlass = new THREE.Mesh(new RoundedBoxGeometry(0.74, 0.15, 0.286, 3, 0.02), busGlassMat);
    busGlass.position.set(0, 0.1, 0);

    // Kính chắn gió trước vát cong khí động học
    const frontWindshield = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.25, 4), busGlassMat);
    frontWindshield.rotation.x = Math.PI / 2;
    frontWindshield.rotation.y = Math.PI / 4;
    frontWindshield.position.set(0, 0.12, 0.38);

    // Dải sọc trang trí vàng kim lượn sóng dọc thân xe
    [-0.142, 0.142].forEach(side => {
      const stripe = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.016, 0.01, 2, 0.002), busStripeGoldMat);
      stripe.position.set(side, 0.015, -0.02);
      busGroup.add(stripe);
    });

    // Cụm điều hòa mui xe (Rooftop AC)
    const acUnit = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.038, 0.14, 2, 0.008), terminalWallMat);
    acUnit.position.set(0, 0.21, -0.04);

    // Biển LED lộ trình điện tử trước kính xe ("TP.HCM - MIỀN TÂY")
    const routeLed = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.032, 0.01), ledYellowMat);
    routeLed.position.set(0, 0.16, 0.415);
    routeLed.userData = { animType: 'flicker' };

    // Cụm đèn pha bi-LED trước
    [-0.09, 0.09].forEach(lx => {
      const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), ledYellowMat);
      headlight.position.set(lx, 0.025, 0.415);
      busGroup.add(headlight);
    });

    // Cặp gương chiếu hậu xe khách vươn dài
    [-0.16, 0.16].forEach(mx => {
      const mirrorStem = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 6), steelStructureMat);
      mirrorStem.position.set(mx, 0.12, 0.38);
      mirrorStem.rotation.z = (mx > 0 ? -1 : 1) * 0.4;
      const mirrorHead = new THREE.Mesh(new RoundedBoxGeometry(0.015, 0.045, 0.025, 1, 0.003), busBodyOrangeMat);
      mirrorHead.position.set(mx * 1.15, 0.14, 0.39);
      busGroup.add(mirrorStem, mirrorHead);
    });

    // Cụm đèn hậu LED đỏ phía sau
    [-0.1, 0.1].forEach(rx => {
      const taillight = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.045, 0.01), ledRedMat);
      taillight.position.set(rx, 0.05, -0.415);
      busGroup.add(taillight);
    });

    // 4 Cụm bánh xe cao su viền mâm hợp kim chrome
    const wheelY = -0.04;
    [
      [-0.138, wheelY, 0.23],
      [0.138, wheelY, 0.23],
      [-0.138, wheelY, -0.22],
      [0.138, wheelY, -0.22]
    ].forEach(([wx, wy, wz]) => {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.038, 14), rubberBlackMat);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(wx, wy, wz);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.042, 10), wheelAlloyMat);
      hub.rotation.z = Math.PI / 2;
      hub.position.set(wx, wy, wz);

      busGroup.add(tire, hub);
    });

    // Gờ chặn lùi bánh xe màu vàng-đen tại điểm dừng
    const wheelChock = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.024, 0.035, 1, 0.005), lineYellowMat);
    wheelChock.position.set(-0.06, 0.06, 0.46);

    busGroup.add(busBody, busGlass, frontWindshield, acUnit, routeLed);

    // 5. CỘT ĐÈN CAO ÁP CHIẾU SÁNG BẾN BÃI (HIGH-MAST FLOODLIGHT TOWER)
    const towerGroup = new THREE.Group();
    towerGroup.position.set(0.52, 0.05, 0.44);

    const mastCol = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.92, 8), steelStructureMat);
    mastCol.position.y = 0.46;

    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.015, 0.02), steelStructureMat);
    crossArm.position.y = 0.92;

    [-0.06, 0, 0.06].forEach(fx => {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.02, 0.04), ledYellowMat);
      lamp.position.set(fx, 0.91, -0.015);
      lamp.rotation.x = 0.4;
      lamp.userData = { animType: 'flicker' };
      towerGroup.add(lamp);
    });
    towerGroup.add(mastCol, crossArm);

    // 6. TIỂU CẢNH CÂY XANH ĐÔ THỊ TRƯỚC SẢNH BẾN XE
    [-0.48, 0.48].forEach(px => {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.03, 0.05, 10), concourseMat);
      pot.position.set(px, 0.09, -0.22);
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), foliageGreenMat);
      bush.position.set(px, 0.14, -0.22);
      group.add(pot, bush);
    });

    group.add(
      apron, concoursePlatform,
      terminalGroup, canopyGroup,
      busGroup, wheelChock,
      towerGroup
    );
    group.scale.set(0.88, 0.88, 0.88);
    return group;
  }

  /**
   * HỆ THỐNG GA ĐƯỜNG SẮT BẮC - NAM (Ô 15, 25, 35):
   * Ga Sài Gòn, Ga Đà Nẵng, Ga Hà Nội:
   * Đường ray sắt 3D trên nền sỏi đá dăm & tà vẹt gỗ nâu sẫm,
   * đầu máy xe lửa hơi nước đen tuyền viền vàng đồng, cụm khói mây trắng tròn mập,
   * và cột đèn tín hiệu pulse đỏ - xanh nhịp nhàng.
   */
  public static createTrainStationModel(_tileId: number): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(1.3, 1.4, 0.45));

    const ironBlack = LandmarkMaterials.getMat('engineBlack', () => new THREE.MeshStandardMaterial({
      color: '#1E272E',
      metalness: 0.85,
      roughness: 0.22
    }));
    const trainRed = LandmarkMaterials.getMat('trainRed', () => new THREE.MeshStandardMaterial({
      color: '#C0392B',
      roughness: 0.28,
      metalness: 0.2
    }));
    const brassGold = LandmarkMaterials.getMat('brassGold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F39C12',
      emissiveIntensity: 0.3,
      metalness: 0.9,
      roughness: 0.15
    }));
    const railSteel = LandmarkMaterials.getMat('railSteel', () => new THREE.MeshStandardMaterial({
      color: '#B2BEC3',
      metalness: 0.88,
      roughness: 0.2
    }));
    const gravelMat = LandmarkMaterials.getMat('railBallastGravel', () => new THREE.MeshStandardMaterial({
      color: '#636E72',
      roughness: 0.85
    }));
    const woodSleeper = LandmarkMaterials.getMat('woodSleeper', () => new THREE.MeshStandardMaterial({
      color: '#4E342E',
      roughness: 0.72
    }));

    // 1. Nền đá dăm (Ballast) & Đường ray sắt 3D trên tà vẹt gỗ nâu sẫm
    const ballastBed = new THREE.Mesh(new RoundedBoxGeometry(1.12, 0.05, 1.38, 2, 0.02), gravelMat);
    ballastBed.position.set(0, 0.025, 0);
    ballastBed.receiveShadow = true;
    group.add(ballastBed);

    for (let i = -2; i <= 2; i++) {
      const sleeper = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.045, 0.12, 2, 0.01), woodSleeper);
      sleeper.position.set(0, 0.055, i * 0.24);
      group.add(sleeper);
    }

    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.06, 1.36), railSteel);
    railL.position.set(-0.28, 0.085, 0);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.06, 1.36), railSteel);
    railR.position.set(0.28, 0.085, 0);
    group.add(railL, railR);

    // 2. Đầu máy xe lửa hơi nước (Locomotive) đen tuyền viền vàng đồng
    const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.76, 20), ironBlack);
    boiler.rotation.x = Math.PI / 2;
    boiler.position.set(-0.04, 0.36, 0.08);
    boiler.castShadow = true;

    for (let b = -0.2; b <= 0.32; b += 0.24) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.015, 8, 20), brassGold);
      ring.position.set(-0.04, 0.36, b);
      group.add(ring);
    }

    const steamDome = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), brassGold);
    steamDome.position.set(-0.04, 0.61, 0.02);

    const cowcatcher = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.2, 3), brassGold);
    cowcatcher.rotation.x = Math.PI / 2;
    cowcatcher.rotation.z = Math.PI;
    cowcatcher.position.set(-0.04, 0.18, 0.54);

    // Khoang lái gọn gàng
    const cab = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.58, 0.44, 3, 0.04), trainRed);
    cab.position.set(-0.04, 0.44, -0.34);
    cab.castShadow = true;

    const cabRoof = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.07, 0.5, 2, 0.02), ironBlack);
    cabRoof.position.set(-0.04, 0.75, -0.34);

    // Ống khói vươn cao nhả ra 3 cụm khói mây trắng tròn mập cách điệu
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.065, 0.32, 14), ironBlack);
    chimney.position.set(-0.04, 0.66, 0.32);
    const chimneyRim = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.02, 8, 14), brassGold);
    chimneyRim.rotation.x = Math.PI / 2;
    chimneyRim.position.set(-0.04, 0.82, 0.32);

    const smokeMat = LandmarkMaterials.getMat('smokeWhitePuff', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.35,
      transparent: true,
      opacity: 0.94,
      depthWrite: false
    }));
    const smokePuffs = [
      [-0.04, 0.96, 0.32, 0.13],
      [-0.08, 1.12, 0.24, 0.17],
      [0.01, 1.30, 0.14, 0.21]
    ];
    smokePuffs.forEach(([sx, sy, sz, sr], idx) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(sr, 14, 12), smokeMat);
      puff.position.set(sx, sy, sz);
      if (idx === 2) {
        puff.userData = { animType: 'flicker' };
      }
      group.add(puff);
    });

    // Đèn pha đồng trước mũi tàu
    const headlamp = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 14), brassGold);
    headlamp.rotation.x = Math.PI / 2;
    headlamp.position.set(-0.04, 0.38, 0.5);

    // 4 Bánh xe thép viền vàng đồng
    const wheelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.055, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const hubCapGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.065, 10);
    hubCapGeo.rotateZ(Math.PI / 2);
    [[-0.34, 0.16, -0.16], [0.26, 0.16, -0.16], [-0.34, 0.16, 0.2], [0.26, 0.16, 0.2]].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, ironBlack);
      wheel.position.set(wx, wy, wz);
      const cap = new THREE.Mesh(hubCapGeo, brassGold);
      cap.position.set(wx, wy, wz);
      group.add(wheel, cap);
    });

    // 3. Cột đèn tín hiệu đường sắt có 2 đèn tròn xanh - đỏ nhấp nháy nhịp nhàng
    const signalPost = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.92, 8), railSteel);
    signalPost.position.set(0.46, 0.48, 0.18);
    const signalBox = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.28, 0.08, 2, 0.02), ironBlack);
    signalBox.position.set(0.46, 0.86, 0.18);

    const redSignalMat = LandmarkMaterials.getMat('railSignalRed', () => new THREE.MeshStandardMaterial({
      color: '#FF3838',
      emissive: '#FF3838',
      emissiveIntensity: 1.1
    }));
    const greenSignalMat = LandmarkMaterials.getMat('railSignalGreen', () => new THREE.MeshStandardMaterial({
      color: '#00B894',
      emissive: '#00E676',
      emissiveIntensity: 1.1
    }));

    const sigRed = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), redSignalMat);
    sigRed.position.set(0.46, 0.92, 0.22);
    sigRed.userData = { animType: 'pulse_red' };

    const sigGreen = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), greenSignalMat);
    sigGreen.position.set(0.46, 0.8, 0.22);

    group.add(
      boiler, steamDome, cowcatcher, cab, cabRoof,
      chimney, chimneyRim, headlamp,
      signalPost, signalBox, sigRed, sigGreen
    );
    group.scale.set(0.88, 0.88, 0.88);
    return group;
  }
}
