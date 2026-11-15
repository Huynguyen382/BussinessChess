import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { LandmarkMaterials } from './LandmarkMaterials';

/**
 * HỆ THỐNG GIAO THÔNG ĐẦU MỐI (4 RAILROADS / TRANSPORT HUBS):
 * - Ô 5: Bến Xe Miền Tây (Bến xe khách liên tỉnh lớn nhất miền Nam kết nối 13 tỉnh ĐBSCL)
 *        -> Tòa nhà ga hiện đại, mái che canopy vòm đón khách, xe khách giường nằm cao cấp 3D 3 trục,
 *           bãi đỗ asphalt, vạch kẻ bus bay, cột đèn cao áp bến bãi và tiểu cảnh.
 * - Ô 15: Ga Sài Gòn – Ga đường sắt trung tâm phương Nam với mặt tiền kiến trúc Pháp cổ, đầu máy hơi nước Tự Lực & toa than.
 * - Ô 25: Ga Đà Nẵng – Đầu mối đường sắt miền Trung với mái vòm hiện đại, đầu máy hơi nước & cột đèn tín hiệu.
 * - Ô 35: Ga Hà Nội – Ga Hàng Cỏ lịch sử 1902 với cổng vòm đồ sộ, đồng hồ ga cổ kính, đường ray 3D & đầu máy hơi nước.
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
   * Nhà ga bến xe trung tâm, mái vòm đón khách, xe khách giường nằm cao cấp 3D 3 trục,
   * bãi đỗ asphalt, vạch kẻ làn bus bay, cột đèn bến bãi.
   */
  public static createBenXeMienTayModel(): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(1.36, 1.36, 0.45));

    const asphaltMat = LandmarkMaterials.getMat('sc_bx_asphalt', () => new THREE.MeshStandardMaterial({
      color: '#1E293B',
      roughness: 0.72
    }));
    const concourseMat = LandmarkMaterials.getMat('sc_bx_concourse', () => new THREE.MeshStandardMaterial({
      color: '#E2E8F0',
      roughness: 0.4
    }));
    const terminalWallMat = LandmarkMaterials.getMat('sc_bx_wallWhite', () => new THREE.MeshStandardMaterial({
      color: '#F8FAFC',
      roughness: 0.28
    }));
    const terminalGlassMat = LandmarkMaterials.getMat('sc_bx_glassTint', () => new THREE.MeshStandardMaterial({
      color: '#0F172A',
      roughness: 0.1,
      metalness: 0.85
    }));
    const terminalRoofMat = LandmarkMaterials.getMat('sc_bx_roofBlue', () => new THREE.MeshStandardMaterial({
      color: '#0284C7',
      roughness: 0.32
    }));
    const signRedMat = LandmarkMaterials.getMat('sc_bx_signRed', () => new THREE.MeshStandardMaterial({
      color: '#DC2626',
      emissive: '#EF4444',
      emissiveIntensity: 0.85,
      roughness: 0.25
    }));
    const canopyGlassMat = LandmarkMaterials.getMat('sc_bx_canopyTeal', () => new THREE.MeshStandardMaterial({
      color: '#06B6D4',
      transparent: true,
      opacity: 0.65,
      roughness: 0.12
    }));
    const steelMat = LandmarkMaterials.getMat('sc_bx_steel', () => new THREE.MeshStandardMaterial({
      color: '#CBD5E1',
      metalness: 0.9,
      roughness: 0.16
    }));
    const busBodyOrangeMat = LandmarkMaterials.getMat('sc_bx_busOrange', () => new THREE.MeshStandardMaterial({
      color: '#EA580C',
      roughness: 0.18,
      metalness: 0.2
    }));
    const busStripeGoldMat = LandmarkMaterials.getMat('sc_bx_busGold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      metalness: 0.85,
      roughness: 0.18
    }));
    const busGlassMat = LandmarkMaterials.getMat('sc_bx_busGlass', () => new THREE.MeshStandardMaterial({
      color: '#0F172A',
      metalness: 0.9,
      roughness: 0.08
    }));
    const rubberBlackMat = LandmarkMaterials.getMat('sc_bx_tireRubber', () => new THREE.MeshStandardMaterial({
      color: '#111827',
      roughness: 0.85
    }));
    const wheelAlloyMat = LandmarkMaterials.getMat('sc_bx_wheelAlloy', () => new THREE.MeshStandardMaterial({
      color: '#E2E8F0',
      metalness: 0.92,
      roughness: 0.12
    }));
    const ledYellowMat = LandmarkMaterials.getMat('sc_bx_ledYellow', () => new THREE.MeshStandardMaterial({
      color: '#FBBF24',
      emissive: '#F59E0B',
      emissiveIntensity: 1.2,
      roughness: 0.1
    }));
    const ledRedMat = LandmarkMaterials.getMat('sc_bx_ledRed', () => new THREE.MeshStandardMaterial({
      color: '#EF4444',
      emissive: '#EF4444',
      emissiveIntensity: 1.1,
      roughness: 0.1
    }));
    const lineYellowMat = LandmarkMaterials.getMat('sc_bx_lineYellow', () => new THREE.MeshStandardMaterial({
      color: '#FBBF24',
      roughness: 0.4
    }));
    const lineWhiteMat = LandmarkMaterials.getMat('sc_bx_lineWhite', () => new THREE.MeshStandardMaterial({
      color: '#F8FAFC',
      roughness: 0.4
    }));
    const foliageGreenMat = LandmarkMaterials.getMat('sc_bx_foliage', () => new THREE.MeshStandardMaterial({
      color: '#16A34A',
      roughness: 0.5
    }));

    // 1. THỀM BẾN BÃI & SÂN ĐỖ XE ASPHALT
    const apron = new THREE.Mesh(new RoundedBoxGeometry(1.26, 0.05, 0.84, 3, 0.02), asphaltMat);
    apron.position.set(0, 0.025, 0.24);
    apron.receiveShadow = true;

    const concoursePlatform = new THREE.Mesh(new RoundedBoxGeometry(1.26, 0.07, 0.48, 3, 0.02), concourseMat);
    concoursePlatform.position.set(0, 0.035, -0.42);
    concoursePlatform.receiveShadow = true;

    // Vạch vàng bus bays
    [-0.34, 0.22].forEach(vx => {
      const yellowLine = new THREE.Mesh(new THREE.PlaneGeometry(0.024, 0.60), lineYellowMat);
      yellowLine.rotation.x = -Math.PI / 2;
      yellowLine.rotation.z = -0.06;
      yellowLine.position.set(vx, 0.052, 0.24);
      group.add(yellowLine);
    });

    // Vạch qua đường cho người đi bộ (Zebra crossing)
    for (let z = 0; z < 5; z++) {
      const zebra = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.038), lineWhiteMat);
      zebra.rotation.x = -Math.PI / 2;
      zebra.position.set(0.44, 0.052, 0.06 + z * 0.068);
      group.add(zebra);
    }

    // 2. TÒA NHÀ GA BẾN XE MIỀN TÂY (TERMINAL CONCOURSE)
    const terminalGroup = new THREE.Group();
    terminalGroup.position.set(0, 0, -0.44);

    const mainBuilding = new THREE.Mesh(new RoundedBoxGeometry(1.10, 0.48, 0.34, 4, 0.04), terminalWallMat);
    mainBuilding.position.y = 0.29;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;

    const groundGlass = new THREE.Mesh(new RoundedBoxGeometry(0.98, 0.24, 0.02, 2, 0.01), terminalGlassMat);
    groundGlass.position.set(0, 0.16, 0.175);

    [-0.32, -0.11, 0.11, 0.32].forEach(gx => {
      const win = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.11, 0.015, 2, 0.005), terminalGlassMat);
      win.position.set(gx, 0.38, 0.175);
      terminalGroup.add(win);
    });

    const roof = new THREE.Mesh(new RoundedBoxGeometry(1.16, 0.06, 0.38, 2, 0.02), terminalRoofMat);
    roof.position.y = 0.54;
    roof.castShadow = true;

    // Bảng hiệu LED "BẾN XE MIỀN TÂY" (animType: 'flicker')
    const signBox = new THREE.Mesh(new RoundedBoxGeometry(0.74, 0.11, 0.035, 2, 0.005), signRedMat);
    signBox.position.set(0, 0.60, 0.10);
    signBox.userData = { animType: 'flicker' };

    const signBezel = new THREE.Mesh(new RoundedBoxGeometry(0.76, 0.13, 0.02, 2, 0.005), steelMat);
    signBezel.position.set(0, 0.60, 0.08);

    // Đồng hồ điện tử bến xe & cột trụ mặt tiền
    const clockBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 12), steelMat);
    clockBezel.rotation.x = Math.PI / 2;
    clockBezel.position.set(0, 0.36, 0.18);
    const clockGlow = new THREE.Mesh(new THREE.CircleGeometry(0.042, 12), ledYellowMat);
    clockGlow.position.set(0, 0.36, 0.192);
    [-0.48, 0.48].forEach(px => {
      const pilaster = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.48, 0.04, 1, 0.005), steelMat);
      pilaster.position.set(px, 0.28, 0.175);
      terminalGroup.add(pilaster);
    });

    terminalGroup.add(mainBuilding, groundGlass, roof, signBox, signBezel, clockBezel, clockGlow);

    // 3. MÁI VÒM CANOPY ĐÓN KHÁCH (CANTILEVER PASSENGER CANOPY)
    const canopyGroup = new THREE.Group();
    canopyGroup.position.set(0, 0.36, -0.16);

    const canopyRoof = new THREE.Mesh(new RoundedBoxGeometry(0.94, 0.024, 0.38, 2, 0.01), canopyGlassMat);
    canopyRoof.rotation.x = 0.06;
    canopyRoof.position.y = 0.04;
    canopyRoof.castShadow = true;

    [-0.38, 0, 0.38].forEach(tx => {
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.40, 8), steelMat);
      beam.rotation.x = Math.PI / 2 + 0.06;
      beam.position.set(tx, 0.038, 0);
      canopyGroup.add(beam);
    });

    [-0.38, 0.38].forEach(cx => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.36, 8), steelMat);
      col.position.set(cx, -0.15, 0.08);
      col.rotation.x = -0.1;
      canopyGroup.add(col);
    });

    [-0.32, -0.12].forEach(bx => {
      const bench = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.035, 0.06, 1, 0.005), steelMat);
      bench.position.set(bx, 0.08, -0.22);
      group.add(bench);
    });

    // Cổng barrier kiểm soát ra vào bến xe
    const gatePost = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.14, 0.06, 1, 0.01), lineYellowMat);
    gatePost.position.set(-0.54, 0.12, 0.46);
    const gateArm = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.022, 0.022, 1, 0.005), signRedMat);
    gateArm.position.set(-0.42, 0.18, 0.46);
    gateArm.rotation.z = 0.25;
    group.add(gatePost, gateArm);

    // 4. XE KHÁCH GIƯỜNG NẰM LIÊN TỈNH MIỀN TÂY 3 TRỤC (EXPRESS SLEEPER COACH)
    const busGroup = new THREE.Group();
    busGroup.position.set(-0.06, 0.12, 0.22);
    busGroup.rotation.y = -0.06;

    const busBody = new THREE.Mesh(new RoundedBoxGeometry(0.84, 0.26, 0.28, 4, 0.04), busBodyOrangeMat);
    busBody.position.y = 0.07;
    busBody.castShadow = true;

    const busGlass = new THREE.Mesh(new RoundedBoxGeometry(0.76, 0.15, 0.286, 3, 0.02), busGlassMat);
    busGlass.position.set(0, 0.10, 0);

    const frontWindshield = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.25, 4), busGlassMat);
    frontWindshield.rotation.x = Math.PI / 2;
    frontWindshield.rotation.y = Math.PI / 4;
    frontWindshield.position.set(0, 0.12, 0.39);

    // Dải sọc vàng kim lượn sóng dọc thân xe
    [-0.142, 0.142].forEach(side => {
      const stripe = new THREE.Mesh(new RoundedBoxGeometry(0.70, 0.016, 0.01, 2, 0.002), busStripeGoldMat);
      stripe.position.set(side, 0.015, -0.02);
      busGroup.add(stripe);
    });

    // Cụm điều hòa nóc xe (Rooftop AC) với 2 quạt tản nhiệt
    const acUnit = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.038, 0.14, 2, 0.008), terminalWallMat);
    acUnit.position.set(0, 0.21, -0.04);
    [-0.08, 0.08].forEach(fx => {
      const fanRing = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.01, 10), busGlassMat);
      fanRing.position.set(fx, 0.232, -0.04);
      busGroup.add(fanRing);
    });

    // Khe cửa khoang hành lý hông xe
    [-0.141, 0.141].forEach(side => {
      [-0.18, 0.0, 0.18].forEach(lx => {
        const seam = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.075, 0.12), steelMat);
        seam.position.set(side, -0.01, lx);
        busGroup.add(seam);
      });
    });

    // Bảng LED điện tử lộ trình trước xe ("TP.HCM - MIỀN TÂY")
    const routeLed = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.032, 0.01), ledYellowMat);
    routeLed.position.set(0, 0.16, 0.425);
    routeLed.userData = { animType: 'flicker' };

    // Đèn pha bi-LED trước
    [-0.09, 0.09].forEach(lx => {
      const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), ledYellowMat);
      headlight.position.set(lx, 0.025, 0.425);
      busGroup.add(headlight);
    });

    // Gương chiếu hậu
    [-0.16, 0.16].forEach(mx => {
      const mirrorStem = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 6), steelMat);
      mirrorStem.position.set(mx, 0.12, 0.39);
      mirrorStem.rotation.z = (mx > 0 ? -1 : 1) * 0.4;
      const mirrorHead = new THREE.Mesh(new RoundedBoxGeometry(0.015, 0.045, 0.025, 1, 0.003), busBodyOrangeMat);
      mirrorHead.position.set(mx * 1.15, 0.14, 0.40);
      busGroup.add(mirrorStem, mirrorHead);
    });

    // Đèn hậu LED đỏ
    [-0.1, 0.1].forEach(rx => {
      const taillight = new THREE.Mesh(new RoundedBoxGeometry(0.02, 0.045, 0.01, 1, 0.003), ledRedMat);
      taillight.position.set(rx, 0.05, -0.425);
      busGroup.add(taillight);
    });

    // 6 Bánh xe cao su (3 trục: 1 trục trước, 2 trục kép sau) với mâm hợp kim
    const wheelY = -0.04;
    [
      [-0.138, wheelY, 0.24],
      [0.138, wheelY, 0.24],
      [-0.138, wheelY, -0.16],
      [0.138, wheelY, -0.16],
      [-0.138, wheelY, -0.28],
      [0.138, wheelY, -0.28]
    ].forEach(([wx, wy, wz]) => {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.038, 14), rubberBlackMat);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(wx, wy, wz);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.042, 10), wheelAlloyMat);
      hub.rotation.z = Math.PI / 2;
      hub.position.set(wx, wy, wz);

      busGroup.add(tire, hub);
    });

    const wheelChock = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.024, 0.035, 1, 0.005), lineYellowMat);
    wheelChock.position.set(-0.06, 0.06, 0.46);

    busGroup.add(busBody, busGlass, frontWindshield, acUnit, routeLed);

    // 5. CỘT ĐÈN CAO ÁP BẾN BÃI
    const towerGroup = new THREE.Group();
    towerGroup.position.set(0.52, 0.05, 0.44);

    const mastCol = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.94, 8), steelMat);
    mastCol.position.y = 0.47;

    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.015, 0.02), steelMat);
    crossArm.position.y = 0.94;

    [-0.06, 0, 0.06].forEach(fx => {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.02, 0.04), ledYellowMat);
      lamp.position.set(fx, 0.93, -0.015);
      lamp.rotation.x = 0.4;
      lamp.userData = { animType: 'flicker' };
      towerGroup.add(lamp);
    });
    towerGroup.add(mastCol, crossArm);

    // 6. TIỂU CẢNH CÂY XANH
    [-0.48, 0.48].forEach(px => {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.03, 0.05, 10), concourseMat);
      pot.position.set(px, 0.09, -0.22);
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), foliageGreenMat);
      bush.position.set(px, 0.14, -0.22);
      group.add(pot, bush);
    });

    group.add(
      apron,
      concoursePlatform,
      terminalGroup,
      canopyGroup,
      busGroup,
      wheelChock,
      towerGroup
    );
    group.scale.set(0.88, 0.88, 0.88);
    return group;
  }

  /**
   * HỆ THỐNG GA ĐƯỜNG SẮT BẮC - NAM (Ô 15, 25, 35):
   * Ga Sài Gòn, Ga Đà Nẵng, Ga Hà Nội:
   * Kiến trúc nhà ga đặc trưng theo từng miền, đầu máy xe lửa hơi nước Tự Lực (Mikado)
   * với toa than, đường ray sắt 3D trên đá dăm & tà vẹt gỗ, khói trắng cuộn xoáy và đèn tín hiệu pulse đỏ.
   */
  public static createTrainStationModel(tileId: number): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(1.3, 1.4, 0.45));

    const ironBlack = LandmarkMaterials.getMat('sc_train_engineBlack', () => new THREE.MeshStandardMaterial({
      color: '#111827',
      metalness: 0.88,
      roughness: 0.2
    }));
    const trainRed = LandmarkMaterials.getMat('sc_train_trainRed', () => new THREE.MeshStandardMaterial({
      color: '#B91C1C',
      roughness: 0.28,
      metalness: 0.2
    }));
    const brassGold = LandmarkMaterials.getMat('sc_train_brassGold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F39C12',
      emissiveIntensity: 0.35,
      metalness: 0.92,
      roughness: 0.14
    }));
    const railSteel = LandmarkMaterials.getMat('sc_train_railSteel', () => new THREE.MeshStandardMaterial({
      color: '#94A3B8',
      metalness: 0.9,
      roughness: 0.18
    }));
    const gravelMat = LandmarkMaterials.getMat('sc_train_ballastGravel', () => new THREE.MeshStandardMaterial({
      color: '#475569',
      roughness: 0.88
    }));
    const woodSleeper = LandmarkMaterials.getMat('sc_train_woodSleeper', () => new THREE.MeshStandardMaterial({
      color: '#3E2723',
      roughness: 0.75
    }));
    const stationWallMat = LandmarkMaterials.getMat('sc_train_stationWall', () => new THREE.MeshStandardMaterial({
      color: '#FEF3C7',
      roughness: 0.35
    }));
    const stationRoofMat = LandmarkMaterials.getMat('sc_train_stationRoof', () => new THREE.MeshStandardMaterial({
      color: '#B45309',
      roughness: 0.4
    }));
    const clockFaceMat = LandmarkMaterials.getMat('sc_train_clockFace', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.2
    }));

    // A. Kiến trúc Nhà ga theo từng miền ở hậu cảnh (Station Building Facade)
    const stationFacade = new THREE.Group();
    stationFacade.position.set(0, 0, -0.48);

    if (tileId === 35) {
      // 🏛️ GA HÀ NỘI: Cổng vòm tân cổ điển đồ sộ năm 1902 với đồng hồ ga trung tâm
      const mainBuilding = new THREE.Mesh(new RoundedBoxGeometry(0.96, 0.42, 0.18, 3, 0.02), stationWallMat);
      mainBuilding.position.y = 0.21;
      const centralArch = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.54, 0.20, 3, 0.03), stationWallMat);
      centralArch.position.y = 0.27;
      const archDoor = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.26, 0.03, 2, 0.015), ironBlack);
      archDoor.position.set(0, 0.14, 0.095);
      const pedimentRoof = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.14, 4), stationRoofMat);
      pedimentRoof.rotation.y = Math.PI / 4;
      pedimentRoof.position.set(0, 0.61, 0);

      const clockBezel = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.012, 8, 16), brassGold);
      clockBezel.position.set(0, 0.46, 0.105);
      const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.065, 16), clockFaceMat);
      clockFace.position.set(0, 0.46, 0.106);
      const handH = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.036, 0.004), ironBlack);
      handH.position.set(0, 0.474, 0.109);
      const handM = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.007, 0.004), ironBlack);
      handM.position.set(0.016, 0.46, 0.109);

      [-0.32, 0.32].forEach(wx => {
        const win = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.18, 0.02, 2, 0.01), ironBlack);
        win.position.set(wx, 0.22, 0.092);
        stationFacade.add(win);
      });

      stationFacade.add(mainBuilding, centralArch, archDoor, pedimentRoof, clockBezel, clockFace, handH, handM);
    } else if (tileId === 25) {
      // 🌊 GA ĐÀ NẴNG: Mái vòm sóng lượn hiện đại hướng ra biển
      const mainBuilding = new THREE.Mesh(new RoundedBoxGeometry(0.94, 0.38, 0.18, 3, 0.02), stationWallMat);
      mainBuilding.position.y = 0.19;
      const modernBlueMat = LandmarkMaterials.getMat('sc_train_dnBlue', () => new THREE.MeshStandardMaterial({ color: '#0284C7', roughness: 0.3 }));
      const modernRoof = new THREE.Mesh(new RoundedBoxGeometry(1.02, 0.06, 0.24, 2, 0.02), modernBlueMat);
      modernRoof.position.y = 0.40;
      const archCanopy = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.54, 14, 1, false, 0, Math.PI), modernBlueMat);
      archCanopy.rotation.z = Math.PI / 2;
      archCanopy.position.set(0, 0.41, 0.04);
      const glassFront = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.22, 0.02, 2, 0.01), LandmarkMaterials.getMat('sc_train_dnGlass', () => new THREE.MeshStandardMaterial({ color: '#0F172A', metalness: 0.85, roughness: 0.1 })));
      glassFront.position.set(0, 0.16, 0.092);
      stationFacade.add(mainBuilding, modernRoof, archCanopy, glassFront);
    } else {
      // 🏰 GA SÀI GÒN (15): Kiến trúc Pháp cổ với ngói gạch đỏ và tháp đồng hồ
      const mainBuilding = new THREE.Mesh(new RoundedBoxGeometry(0.94, 0.38, 0.18, 3, 0.02), stationWallMat);
      mainBuilding.position.y = 0.19;
      const mansardRoof = new THREE.Mesh(new RoundedBoxGeometry(0.98, 0.12, 0.22, 2, 0.02), stationRoofMat);
      mansardRoof.position.y = 0.42;

      const clockTower = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.26, 0.20, 2, 0.02), stationWallMat);
      clockTower.position.set(0, 0.52, 0);
      const clockRoof = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.14, 4), stationRoofMat);
      clockRoof.rotation.y = Math.PI / 4;
      clockRoof.position.set(0, 0.72, 0);

      const clockBezel = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.01, 8, 14), brassGold);
      clockBezel.position.set(0, 0.52, 0.105);
      const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.055, 14), clockFaceMat);
      clockFace.position.set(0, 0.52, 0.106);

      [-0.28, 0, 0.28].forEach(dx => {
        const arch = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.20, 0.02, 2, 0.01), ironBlack);
        arch.position.set(dx, 0.14, 0.092);
        stationFacade.add(arch);
      });

      stationFacade.add(mainBuilding, mansardRoof, clockTower, clockRoof, clockBezel, clockFace);
    }
    group.add(stationFacade);

    // B. Nền đá dăm (Ballast) & Đường ray sắt 3D trên tà vẹt gỗ nâu sẫm có đinh kẹp ray
    const ballastBed = new THREE.Mesh(new RoundedBoxGeometry(1.14, 0.05, 1.38, 2, 0.02), gravelMat);
    ballastBed.position.set(0, 0.025, 0.08);
    ballastBed.receiveShadow = true;
    group.add(ballastBed);

    for (let i = -3; i <= 3; i++) {
      const sz = 0.08 + i * 0.18;
      const sleeper = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.045, 0.10, 2, 0.01), woodSleeper);
      sleeper.position.set(0, 0.055, sz);
      group.add(sleeper);

      [-0.28, 0.28].forEach(rx => {
        const tiePlate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.08), ironBlack);
        tiePlate.position.set(rx, 0.08, sz);
        group.add(tiePlate);
      });
    }

    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.06, 1.36), railSteel);
    railL.position.set(-0.28, 0.085, 0.08);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.06, 1.36), railSteel);
    railR.position.set(0.28, 0.085, 0.08);
    group.add(railL, railR);

    // C. Đầu máy xe lửa hơi nước Tự Lực (Mikado Steam Locomotive)
    const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.74, 20), ironBlack);
    boiler.rotation.x = Math.PI / 2;
    boiler.position.set(-0.04, 0.36, 0.16);
    boiler.castShadow = true;

    for (let b = -0.12; b <= 0.36; b += 0.24) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.015, 8, 20), brassGold);
      ring.position.set(-0.04, 0.36, b);
      group.add(ring);
    }

    const steamDome = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), brassGold);
    steamDome.position.set(-0.04, 0.61, 0.10);

    const sandDome = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), brassGold);
    sandDome.position.set(-0.04, 0.60, 0.32);

    const cowcatcher = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.20, 3), brassGold);
    cowcatcher.rotation.x = Math.PI / 2;
    cowcatcher.rotation.z = Math.PI;
    cowcatcher.position.set(-0.04, 0.18, 0.60);

    // Thanh chắn gầm đầu tàu (Cowcatcher Slats) & Xi-lanh piston hai bên
    [-0.14, -0.04, 0.06].forEach(cx => {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.16), ironBlack);
      slat.position.set(cx, 0.18, 0.59);
      slat.rotation.x = 0.35;
      group.add(slat);
    });
    [-0.31, 0.23].forEach(px => {
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.20, 12), ironBlack);
      cyl.rotation.x = Math.PI / 2;
      cyl.position.set(px, 0.22, 0.44);
      const cylCap = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.02, 12), brassGold);
      cylCap.rotation.x = Math.PI / 2;
      cylCap.position.set(px, 0.22, 0.54);
      group.add(cyl, cylCap);
    });

    // Khoang lái (Cab) với cửa sổ hai bên & còi hơi đồng
    const cab = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.58, 0.42, 3, 0.04), trainRed);
    cab.position.set(-0.04, 0.44, -0.24);
    cab.castShadow = true;

    const cabWinFrame = new THREE.Mesh(new RoundedBoxGeometry(0.575, 0.22, 0.24, 2, 0.01), clockFaceMat);
    cabWinFrame.position.set(-0.04, 0.52, -0.24);
    const cabWhistle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.10, 8), brassGold);
    cabWhistle.position.set(0.08, 0.64, -0.02);
    const locoBell = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.036, 0.06, 10), brassGold);
    locoBell.position.set(-0.04, 0.63, 0.22);
    group.add(cabWinFrame, cabWhistle, locoBell);

    const cabRoof = new THREE.Mesh(new RoundedBoxGeometry(0.60, 0.07, 0.48, 2, 0.02), ironBlack);
    cabRoof.position.set(-0.04, 0.75, -0.24);

    // Toa than (Tender Car) gắn phía sau đầu tàu có viền vàng, khớp nối & đèn hậu đỏ
    const tender = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.34, 0.32, 2, 0.03), ironBlack);
    tender.position.set(-0.04, 0.32, -0.58);
    const tenderTrim = new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.035, 0.34, 1, 0.005), brassGold);
    tenderTrim.position.set(-0.04, 0.46, -0.58);
    const coal = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.12, 0.26, 2, 0.02), LandmarkMaterials.getMat('sc_train_coal', () => new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.95 })));
    coal.position.set(-0.04, 0.48, -0.58);
    const coupling = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.12), railSteel);
    coupling.position.set(-0.04, 0.20, -0.42);
    const rearLantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.032, 8, 8),
      LandmarkMaterials.getMat('sc_train_signalRed', () => new THREE.MeshStandardMaterial({ color: '#FF3838', emissive: '#FF3838', emissiveIntensity: 1.2 }))
    );
    rearLantern.position.set(-0.04, 0.36, -0.75);
    group.add(tender, tenderTrim, coal, coupling, rearLantern);

    // Ống khói nhả cụm khói mây trắng tròn mập
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.065, 0.32, 14), ironBlack);
    chimney.position.set(-0.04, 0.66, 0.38);
    const chimneyRim = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.02, 8, 14), brassGold);
    chimneyRim.rotation.x = Math.PI / 2;
    chimneyRim.position.set(-0.04, 0.82, 0.38);

    const smokeMat = LandmarkMaterials.getMat('sc_train_smokeWhite', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.35,
      transparent: true,
      opacity: 0.94,
      depthWrite: false
    }));
    const smokePuffs = [
      [-0.04, 0.96, 0.38, 0.13],
      [-0.08, 1.12, 0.30, 0.17],
      [0.01, 1.30, 0.20, 0.21]
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
    const headlamp = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.10, 14), brassGold);
    headlamp.rotation.x = Math.PI / 2;
    headlamp.position.set(-0.04, 0.38, 0.56);

    // 6 Bánh xe thép viền vàng đồng có thanh truyền động piston
    const wheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.05, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const hubCapGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.06, 10);
    hubCapGeo.rotateZ(Math.PI / 2);

    [-0.34, 0.26].forEach(wx => {
      [-0.14, 0.12, 0.36].forEach(wz => {
        const wheel = new THREE.Mesh(wheelGeo, ironBlack);
        wheel.position.set(wx, 0.15, wz);
        const cap = new THREE.Mesh(hubCapGeo, brassGold);
        cap.position.set(wx, 0.15, wz);
        group.add(wheel, cap);
      });
      // Thanh truyền piston nối các bánh xe
      const sideRod = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.54), railSteel);
      sideRod.position.set(wx > 0 ? wx + 0.03 : wx - 0.03, 0.13, 0.24);
      group.add(sideRod);
    });

    // D. Cột đèn tín hiệu đường sắt có 2 đèn tròn xanh - đỏ nhấp nháy nhịp nhàng (animType: 'pulse_red')
    const signalPost = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.94, 8), railSteel);
    signalPost.position.set(0.46, 0.48, 0.22);
    const signalBox = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.28, 0.08, 2, 0.02), ironBlack);
    signalBox.position.set(0.46, 0.86, 0.22);

    const redSignalMat = LandmarkMaterials.getMat('sc_train_signalRed', () => new THREE.MeshStandardMaterial({
      color: '#FF3838',
      emissive: '#FF3838',
      emissiveIntensity: 1.2
    }));
    const greenSignalMat = LandmarkMaterials.getMat('sc_train_signalGreen', () => new THREE.MeshStandardMaterial({
      color: '#00B894',
      emissive: '#00E676',
      emissiveIntensity: 1.1
    }));

    const sigRed = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), redSignalMat);
    sigRed.position.set(0.46, 0.92, 0.26);
    sigRed.userData = { animType: 'pulse_red' };

    const sigGreen = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), greenSignalMat);
    sigGreen.position.set(0.46, 0.80, 0.26);

    group.add(
      boiler,
      steamDome,
      sandDome,
      cowcatcher,
      cab,
      cabRoof,
      chimney,
      chimneyRim,
      headlamp,
      signalPost,
      signalBox,
      sigRed,
      sigGreen
    );
    group.scale.set(0.88, 0.88, 0.88);
    return group;
  }
}
