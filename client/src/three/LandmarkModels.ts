import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Thư viện các mô hình 3D danh thắng và kiến trúc sa bàn chi tiết cho 40 ô cờ Việt Nam
 * Phong cách nghệ thuật: Stylized High-Fidelity Toy Diorama (Monopoly GO! & Animal Crossing)
 */
export class LandmarkModels {
  // Bộ chia sẻ vật liệu dùng chung (Material Cache) giúp tối ưu hiệu năng WebGL 60 FPS
  private static materials: Map<string, THREE.Material> = new Map();

  private static getMat(key: string, createFn: () => THREE.Material): THREE.Material {
    if (!this.materials.has(key)) {
      this.materials.set(key, createFn());
    }
    return this.materials.get(key)!;
  }

  // =========================================================================
  // 1. Ô 0: KHỞI HÀNH (GO) - CỔNG CHÀO KHẢI HOÀN MÔN & RƯƠNG VÀNG THỊNH VƯỢNG
  // =========================================================================
  public static createGOCorner(): THREE.Group {
    const group = new THREE.Group();

    const marbleMat = this.getMat('marbleWhite', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.25,
      metalness: 0.08
    }));
    const goldMat = this.getMat('shinyGold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F39C12',
      emissiveIntensity: 0.35,
      metalness: 0.88,
      roughness: 0.15
    }));
    const redRubyMat = this.getMat('redRuby', () => new THREE.MeshStandardMaterial({
      color: '#E84118',
      roughness: 0.3,
      emissive: '#C23616',
      emissiveIntensity: 0.25
    }));

    // Bục đá 2 cấp
    const basePlinth = new THREE.Mesh(new RoundedBoxGeometry(2.4, 0.14, 2.4, 3, 0.04), marbleMat);
    basePlinth.position.y = 0.07;
    basePlinth.receiveShadow = true;
    group.add(basePlinth);

    // 2 Trụ cột khải hoàn môn phong cách La Mã
    const makePillar = (x: number) => {
      const pCol = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.4, 16), marbleMat);
      pCol.position.set(x, 0.77, 0);
      pCol.castShadow = true;
      const pBase = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.14, 0.48, 2, 0.03), marbleMat);
      pBase.position.set(x, 0.14, 0);
      const pCap = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.12, 0.48, 2, 0.03), goldMat);
      pCap.position.set(x, 1.48, 0);
      group.add(pCol, pBase, pCap);
    };
    makePillar(-0.85);
    makePillar(0.85);

    // Vòm cổng cuốn nối 2 trụ cột
    const archTop = new THREE.Mesh(new RoundedBoxGeometry(2.2, 0.28, 0.52, 3, 0.05), marbleMat);
    archTop.position.set(0, 1.62, 0);
    archTop.castShadow = true;

    // Biển hiệu vương miện GO viền vàng phát sáng
    const goBadge = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.38, 0.14, 3, 0.04), redRubyMat);
    goBadge.position.set(0, 1.95, 0);
    const goCrown = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.3, 6), goldMat);
    goCrown.position.set(0, 2.26, 0);

    // Mũi tên đỏ chỉ hướng hành trình 3D
    const arrowShaft = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.12, 0.12, 2, 0.02), goldMat);
    arrowShaft.position.set(-0.25, 0.85, 0.6);
    const arrowHead = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.4, 4), goldMat);
    arrowHead.rotation.z = -Math.PI / 2;
    arrowHead.position.set(0.15, 0.85, 0.6);

    // Rương tiền vàng tràn ngập tiền xu thưởng +200M
    const chestGroup = this.createTreasureChestMini(0.8);
    chestGroup.position.set(0, 0.15, 0.45);
    group.add(chestGroup);

    group.add(archTop, goBadge, goCrown, arrowShaft, arrowHead);
    return group;
  }

  // =========================================================================
  // 2. Ô 10: NHÀ TÙ / THĂM TÙ - THÁP CANH ĐÁ & HÀNG RÀO SẮT BẢO AN
  // =========================================================================
  public static createJailCorner(): THREE.Group {
    const group = new THREE.Group();

    const stoneMat = this.getMat('graniteStone', () => new THREE.MeshStandardMaterial({
      color: '#57606F',
      roughness: 0.75,
      metalness: 0.15
    }));
    const ironMat = this.getMat('jailIron', () => new THREE.MeshStandardMaterial({
      color: '#2F3542',
      roughness: 0.35,
      metalness: 0.85
    }));
    const alertMat = this.getMat('alertOrange', () => new THREE.MeshStandardMaterial({
      color: '#FF4757',
      emissive: '#FF4757',
      emissiveIntensity: 0.7,
      roughness: 0.2
    }));

    // Bục đá xám nhám kiên cố
    const base = new THREE.Mesh(new RoundedBoxGeometry(2.3, 0.16, 2.3, 3, 0.04), stoneMat);
    base.position.y = 0.08;
    base.receiveShadow = true;
    group.add(base);

    // Tháp canh gác bát giác cao 1.8 units
    const watchTower = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 1.5, 8), stoneMat);
    watchTower.position.set(-0.45, 0.85, -0.45);
    watchTower.castShadow = true;

    // Chòi quan sát trên đỉnh tháp canh có mái che
    const towerCabin = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.65, 0.45, 8), ironMat);
    towerCabin.position.set(-0.45, 1.72, -0.45);

    const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.55, 8), stoneMat);
    towerRoof.position.set(-0.45, 2.15, -0.45);

    // Đèn pha quét an ninh rọi màu đỏ cam
    const spotLightMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), alertMat);
    spotLightMesh.position.set(-0.15, 1.82, -0.15);

    // 4 Chấn song sắt của buồng giam
    for (let i = 0; i < 5; i++) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.95, 8), ironMat);
      bar.position.set(0.1 + i * 0.22, 0.58, 0.45);
      bar.castShadow = true;
      group.add(bar);
    }
    const barCrossTop = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.15, 8), ironMat);
    barCrossTop.rotation.z = Math.PI / 2;
    barCrossTop.position.set(0.54, 1.05, 0.45);

    const barCrossBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.15, 8), ironMat);
    barCrossBottom.rotation.z = Math.PI / 2;
    barCrossBottom.position.set(0.54, 0.22, 0.45);

    group.add(watchTower, towerCabin, towerRoof, spotLightMesh, barCrossTop, barCrossBottom);
    return group;
  }

  // =========================================================================
  // 3. Ô 20: BÃI ĐỖ XE (FREE PARKING) - TRẠM DỪNG CHÂN CÔNG VIÊN & Ô TÔ TÍ HON
  // =========================================================================
  public static createFreeParkingCorner(): THREE.Group {
    const group = new THREE.Group();

    const asphaltMat = this.getMat('asphaltGray', () => new THREE.MeshStandardMaterial({
      color: '#34495E',
      roughness: 0.65
    }));
    const blueSignMat = this.getMat('blueSign', () => new THREE.MeshStandardMaterial({
      color: '#0984E3',
      emissive: '#0984E3',
      emissiveIntensity: 0.35,
      roughness: 0.2
    }));
    const whiteMat = this.getMat('pureWhite', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.3
    }));

    // Mặt bãi đỗ xe asphalt có vạch sơn trắng
    const base = new THREE.Mesh(new RoundedBoxGeometry(2.3, 0.16, 2.3, 3, 0.04), asphaltMat);
    base.position.y = 0.08;
    base.receiveShadow = true;
    group.add(base);

    // Cột biển báo [ P ] đỗ xe miễn phí cao nổi bật
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.4, 8), whiteMat);
    pole.position.set(-0.75, 0.8, -0.75);

    const signBoard = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.55, 0.08, 3, 0.03), blueSignMat);
    signBoard.position.set(-0.75, 1.5, -0.75);

    // Chữ P nổi 3D màu trắng trên biển
    const pStem = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.32, 0.04, 2, 0.01), whiteMat);
    pStem.position.set(-0.82, 1.5, -0.7);
    const pLoop = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.038, 8, 16, Math.PI * 1.3), whiteMat);
    pLoop.position.set(-0.74, 1.58, -0.7);
    pLoop.rotation.z = -Math.PI / 2;

    // Chiếc xe coupe tí hon đậu tại bãi xe
    const carMini = this.createTinyCar('#00B894');
    carMini.position.set(0.2, 0.16, 0.2);
    carMini.rotation.y = -Math.PI / 4;

    // Rào chắn barie sọc đỏ trắng
    const barrierPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 8), this.getMat('barrierYellow', () => new THREE.MeshStandardMaterial({ color: '#F1C40F' })));
    barrierPost.position.set(-0.25, 0.35, -0.75);

    const barrierArm = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.05, 0.05, 2, 0.01), this.getMat('barrierRed', () => new THREE.MeshStandardMaterial({ color: '#E84118' })));
    barrierArm.position.set(0.2, 0.45, -0.75);

    group.add(pole, signBoard, pStem, pLoop, carMini, barrierPost, barrierArm);
    return group;
  }

  // =========================================================================
  // 4. Ô 30: VÀO TÙ NGAY (GO TO JAIL) - BỤC QUAN TÒA, CÒI HỤ & CÒNG TAY
  // =========================================================================
  public static createGoToJailCorner(): THREE.Group {
    const group = new THREE.Group();

    const woodDarkMat = this.getMat('woodDark', () => new THREE.MeshStandardMaterial({
      color: '#4A2311',
      roughness: 0.45
    }));
    const silverMat = this.getMat('polishedSilver', () => new THREE.MeshStandardMaterial({
      color: '#DFE6E9',
      metalness: 0.9,
      roughness: 0.15
    }));
    const sirenRed = this.getMat('sirenRed', () => new THREE.MeshStandardMaterial({
      color: '#D63031',
      emissive: '#FF3838',
      emissiveIntensity: 0.9,
      roughness: 0.1
    }));
    const sirenBlue = this.getMat('sirenBlue', () => new THREE.MeshStandardMaterial({
      color: '#0984E3',
      emissive: '#3867D6',
      emissiveIntensity: 0.9,
      roughness: 0.1
    }));

    // Bục đá granite 2 tầng uy nghiêm
    const base = new THREE.Mesh(new RoundedBoxGeometry(2.3, 0.16, 2.3, 3, 0.04), woodDarkMat);
    base.position.y = 0.08;
    base.receiveShadow = true;
    group.add(base);

    // Bục gỗ quan tòa (Gavel Stand)
    const bench = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.65, 0.8, 3, 0.04), woodDarkMat);
    bench.position.set(0, 0.42, -0.4);
    bench.castShadow = true;

    // Chiếc búa gõ quan tòa (Gavel)
    const gavelHead = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.35, 12), woodDarkMat);
    gavelHead.rotation.z = Math.PI / 2;
    gavelHead.position.set(0.12, 0.82, -0.35);

    const gavelHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.48, 8), woodDarkMat);
    gavelHandle.rotation.x = Math.PI / 3;
    gavelHandle.position.set(0.12, 0.92, -0.22);

    // Chiếc còng số 8 bằng thép mạ bạc
    const cuff1 = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 8, 16), silverMat);
    cuff1.position.set(-0.35, 0.78, -0.35);
    cuff1.rotation.x = Math.PI / 2;

    const cuff2 = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 8, 16), silverMat);
    cuff2.position.set(-0.15, 0.78, -0.15);
    cuff2.rotation.x = Math.PI / 2;

    // Còi hụ cảnh sát 2 màu nhấp nháy trên cột
    const sirenPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8), silverMat);
    sirenPole.position.set(0, 0.45, 0.55);

    const sirenLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.22, 12), sirenRed);
    sirenLeft.position.set(-0.14, 0.82, 0.55);

    const sirenRight = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.22, 12), sirenBlue);
    sirenRight.position.set(0.14, 0.82, 0.55);

    group.add(bench, gavelHead, gavelHandle, cuff1, cuff2, sirenPole, sirenLeft, sirenRight);
    return group;
  }

  // =========================================================================
  // 5. Ô NHÀ GA XE LỬA & BẾN XE (4 Ô RAILROAD)
  // =========================================================================
  public static createRailroadModel(tileId: number): THREE.Group {
    const group = new THREE.Group();

    const ironBlack = this.getMat('engineBlack', () => new THREE.MeshStandardMaterial({
      color: '#1E272E',
      metalness: 0.82,
      roughness: 0.28
    }));
    const trainRed = this.getMat('trainRed', () => new THREE.MeshStandardMaterial({
      color: '#C0392B',
      roughness: 0.32,
      metalness: 0.2
    }));
    const brassGold = this.getMat('brassGold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      metalness: 0.85,
      roughness: 0.2
    }));
    const railSteel = this.getMat('railSteel', () => new THREE.MeshStandardMaterial({
      color: '#718093',
      metalness: 0.8,
      roughness: 0.3
    }));

    // A. Đoạn đường ray với các thanh tà vẹt gỗ
    const woodSleeper = this.getMat('woodSleeper', () => new THREE.MeshStandardMaterial({ color: '#574B3A', roughness: 0.8 }));
    for (let i = -2; i <= 2; i++) {
      const sleeper = new THREE.Mesh(new RoundedBoxGeometry(0.85, 0.04, 0.1, 2, 0.01), woodSleeper);
      sleeper.position.set(0, 0.02, i * 0.22);
      group.add(sleeper);
    }
    // 2 Thanh ray thép
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 1.25), railSteel);
    railL.position.set(-0.28, 0.05, 0);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 1.25), railSteel);
    railR.position.set(0.28, 0.05, 0);
    group.add(railL, railR);

    // B. Đầu máy xe lửa hơi nước cổ điển (Vintage Steam Engine)
    const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.72, 16), ironBlack);
    boiler.rotation.x = Math.PI / 2;
    boiler.position.set(0, 0.34, 0.08);
    boiler.castShadow = true;

    // Buồng lái phía sau có cửa sổ
    const cab = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.58, 0.42, 3, 0.04), trainRed);
    cab.position.set(0, 0.42, -0.32);
    cab.castShadow = true;

    // Ống khói phía trước phun mây khói trắng
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.32, 12), ironBlack);
    chimney.position.set(0, 0.64, 0.3);

    const smokeMat = this.getMat('smokeWhite', () => new THREE.MeshStandardMaterial({
      color: '#F5F6FA',
      roughness: 0.6,
      transparent: true,
      opacity: 0.85
    }));
    const smokePuff = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), smokeMat);
    smokePuff.position.set(0, 0.88, 0.28);
    smokePuff.scale.set(1.1, 0.8, 1.1);

    // Đèn pha vàng trước mũi tàu
    const headlamp = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 10), brassGold);
    headlamp.rotation.x = Math.PI / 2;
    headlamp.position.set(0, 0.35, 0.48);

    const headlampLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      this.getMat('headlampLight', () => new THREE.MeshBasicMaterial({ color: '#FFF275' }))
    );
    headlampLight.position.set(0, 0.35, 0.54);

    // 4 Bánh xe thép lớn viền đồng
    const wheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.06, 14);
    const wPositions = [
      [-0.3, 0.14, -0.16],
      [0.3, 0.14, -0.16],
      [-0.3, 0.14, 0.2],
      [0.3, 0.14, 0.2]
    ];
    wPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, brassGold);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      group.add(wheel);
    });

    group.add(boiler, cab, chimney, smokePuff, headlamp, headlampLight);
    group.scale.set(0.9, 0.9, 0.9);
    return group;
  }

  // =========================================================================
  // 6. Ô TIỆN ÍCH CÔNG CỘNG: ĐIỆN LỰC (12) & NƯỚC SẠCH (28)
  // =========================================================================
  public static createUtilityModel(tileId: number): THREE.Group {
    const group = new THREE.Group();

    if (tileId === 12) {
      // ⚡ CÔNG TY ĐIỆN LỰC: Trụ điện cao thế giàn thép & Quả cầu sét phát quang
      const steelMat = this.getMat('towerSteel', () => new THREE.MeshStandardMaterial({
        color: '#BDC3C7',
        metalness: 0.85,
        roughness: 0.25
      }));
      const lightningMat = this.getMat('lightningGold', () => new THREE.MeshStandardMaterial({
        color: '#F1C40F',
        emissive: '#F39C12',
        emissiveIntensity: 1.2,
        roughness: 0.1
      }));

      // Chân trụ giàn thép 4 góc
      const legGeo = new THREE.CylinderGeometry(0.035, 0.05, 1.45, 6);
      const legPositions = [
        [-0.35, 0.72, -0.35],
        [0.35, 0.72, -0.35],
        [-0.35, 0.72, 0.35],
        [0.35, 0.72, 0.35]
      ];
      legPositions.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, steelMat);
        leg.position.set(lx * 0.7, ly, lz * 0.7);
        leg.rotation.z = -lx * 0.25;
        leg.rotation.x = lz * 0.25;
        group.add(leg);
      });

      // Xà ngang chữ thập
      const crossBeam1 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.05, 0.05), steelMat);
      crossBeam1.position.set(0, 1.15, 0);
      const crossBeam2 = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.05, 0.05), steelMat);
      crossBeam2.position.set(0, 1.35, 0);

      // 3 Bát sứ cách điện màu xanh ngọc
      const insuMat = this.getMat('ceramicInsulator', () => new THREE.MeshStandardMaterial({ color: '#00CEC9', roughness: 0.2 }));
      const ins1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.16, 8), insuMat);
      ins1.position.set(-0.5, 1.24, 0);
      const ins2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.16, 8), insuMat);
      ins2.position.set(0.5, 1.24, 0);

      // Quả cầu năng lượng plasma sét xoay tròn ở tâm
      const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 1), lightningMat);
      orb.position.set(0, 1.62, 0);

      group.add(crossBeam1, crossBeam2, ins1, ins2, orb);

    } else {
      // 💧 CÔNG TY CẤP NƯỚC: Tháp nước đô thị mái nón & van ống nước
      const tankMat = this.getMat('waterTankAqua', () => new THREE.MeshStandardMaterial({
        color: '#0984E3',
        emissive: '#74B9FF',
        emissiveIntensity: 0.25,
        roughness: 0.2,
        metalness: 0.3
      }));
      const pipeMat = this.getMat('chromePipe', () => new THREE.MeshStandardMaterial({
        color: '#DFE6E9',
        metalness: 0.9,
        roughness: 0.15
      }));

      // Bồn nước hình trụ tròn bo đáy
      const tankBody = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.72, 18), tankMat);
      tankBody.position.set(0, 1.15, 0);
      tankBody.castShadow = true;

      const tankRoof = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.35, 18), tankMat);
      tankRoof.position.set(0, 1.68, 0);

      // 4 Chân kiềng chịu lực
      const strutGeo = new THREE.CylinderGeometry(0.05, 0.06, 1.05, 8);
      const strutAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
      strutAngles.forEach(a => {
        const strut = new THREE.Mesh(strutGeo, pipeMat);
        strut.position.set(Math.cos(a) * 0.42, 0.52, Math.sin(a) * 0.42);
        group.add(strut);
      });

      // Ống dẫn nước chính ở tâm nối xuống mặt đất
      const mainPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 12), pipeMat);
      mainPipe.position.set(0, 0.4, 0);

      // Bánh xe van điều áp màu đỏ
      const valveMat = this.getMat('valveRed', () => new THREE.MeshStandardMaterial({ color: '#D63031', roughness: 0.3 }));
      const valve = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 8, 16), valveMat);
      valve.position.set(0.14, 0.45, 0);
      valve.rotation.y = Math.PI / 2;

      group.add(tankBody, tankRoof, mainPipe, valve);
    }

    group.scale.set(0.85, 0.85, 0.85);
    return group;
  }

  // =========================================================================
  // 7. Ô CƠ HỘI & KHÍ VẬN: HỘP QUÀ BẤT NGỜ & RƯƠNG VÀNG CHÂU BÁU
  // =========================================================================
  public static createCardTileModel(isChance: boolean): THREE.Group {
    const group = new THREE.Group();

    if (isChance) {
      // ❓ CƠ HỘI: Hộp quà kỳ diệu & Dấu hỏi vàng 3D
      const boxMat = this.getMat('chanceBoxMat', () => new THREE.MeshStandardMaterial({
        color: '#FF7675',
        roughness: 0.25,
        emissive: '#D63031',
        emissiveIntensity: 0.15
      }));
      const ribbonMat = this.getMat('ribbonGoldMat', () => new THREE.MeshStandardMaterial({
        color: '#FDCB6E',
        metalness: 0.8,
        roughness: 0.2
      }));

      // Hộp quà bo góc
      const box = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.6, 0.7, 3, 0.06), boxMat);
      box.position.set(0, 0.3, 0);
      box.castShadow = true;

      // Nơ ruy băng vàng quấn quanh hộp
      const ribH = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.1, 0.72), ribbonMat);
      ribH.position.set(0, 0.3, 0);
      const ribV = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.62, 0.72), ribbonMat);
      ribV.position.set(0, 0.3, 0);

      // Dấu hỏi vàng 3D xoay nổi phía trên
      const questionMark = this.create3DQuestionMark();
      questionMark.position.set(0, 0.85, 0);

      group.add(box, ribH, ribV, questionMark);
    } else {
      // 🎁 KHÍ VẬN: Rương kho báu gỗ bọc đai đồng hé mở lộ tiền vàng
      const chest = this.createTreasureChestMini(1.0);
      chest.position.set(0, 0.04, 0);
      group.add(chest);
    }

    group.scale.set(0.9, 0.9, 0.9);
    return group;
  }

  // =========================================================================
  // 8. Ô THUẾ: KÉT SẮT TÀI CHÍNH (4) & KIM CƯƠNG XA XỈ (38)
  // =========================================================================
  public static createTaxModel(tileId: number): THREE.Group {
    const group = new THREE.Group();

    if (tileId === 4) {
      // 💸 THUẾ THU NHẬP: Két sắt bảo an ngân hàng màu xanh than
      const safeMat = this.getMat('safeSteel', () => new THREE.MeshStandardMaterial({
        color: '#2C3E50',
        metalness: 0.82,
        roughness: 0.28
      }));
      const goldMat = this.getMat('shinyGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.85, roughness: 0.15 }));

      const safe = new THREE.Mesh(new RoundedBoxGeometry(0.75, 0.85, 0.7, 4, 0.06), safeMat);
      safe.position.set(0, 0.44, 0);
      safe.castShadow = true;

      // Tay quay vô-lăng két sắt bằng vàng
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 8, 16), goldMat);
      wheel.position.set(0, 0.46, 0.36);

      // Bao tải tiền vải bố bên cạnh
      const sackMat = this.getMat('moneySack', () => new THREE.MeshStandardMaterial({ color: '#D2B48C', roughness: 0.8 }));
      const sack = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), sackMat);
      sack.scale.set(1.0, 1.25, 1.0);
      sack.position.set(0.48, 0.24, 0.15);

      group.add(safe, wheel, sack);

    } else {
      // 💎 THUẾ XA XỈ: Kim Cương Pha Lê khổng lồ giác cắt rực rỡ
      const diamondMat = this.getMat('luxuryDiamond', () => new THREE.MeshStandardMaterial({
        color: '#74B9FF',
        emissive: '#A0E7E5',
        emissiveIntensity: 0.75,
        roughness: 0.05,
        metalness: 0.1,
        flatShading: true,
        transparent: true,
        opacity: 0.92
      }));

      // Bệ đỡ vàng vương giả
      const pedMat = this.getMat('shinyGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.85, roughness: 0.15 }));
      const pedestal = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.22, 0.68, 3, 0.04), pedMat);
      pedestal.position.set(0, 0.11, 0);

      // Kim cương hình nón ngược giác cắt đa diện (Brilliant cut diamond)
      const diamondTop = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, 0.24, 8), diamondMat);
      diamondTop.position.set(0, 0.44, 0);
      const diamondCone = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.55, 8), diamondMat);
      diamondCone.rotation.x = Math.PI;
      diamondCone.position.set(0, 0.16 + 0.55 / 2, 0);

      group.add(pedestal, diamondTop, diamondCone);
    }

    group.scale.set(0.85, 0.85, 0.85);
    return group;
  }

  // =========================================================================
  // 9. CÁC ĐỊA DANH DANH THẮNG ĐẶC TRƯNG VIỆT NAM (22 Ô ĐẤT)
  // =========================================================================
  public static createCityLandmark(tileId: number): THREE.Group {
    const group = new THREE.Group();

    switch (tileId) {
      // =====================================================
      // PHÂN KHU 1: CẦN THƠ & CÀ MAU (Iris Purple)
      // =====================================================
      case 1: {
        // Cần Thơ: Trụ cầu dây văng Cần Thơ & Chiếc ghe hoa quả miền Tây
        const pillarMat = this.getMat('bridgeConcrete', () => new THREE.MeshStandardMaterial({ color: '#ECF0F1', roughness: 0.3 }));
        const cableMat = this.getMat('bridgeCable', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.7, roughness: 0.2 }));
        const waterMat = this.getMat('riverWater', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.1, transparent: true, opacity: 0.85 }));

        // Trụ tháp cầu chữ Y cao 1.4 units
        const towerLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.4, 8), pillarMat);
        towerLeft.position.set(-0.25, 0.7, 0);
        towerLeft.rotation.z = -0.12;

        const towerRight = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.4, 8), pillarMat);
        towerRight.position.set(0.25, 0.7, 0);
        towerRight.rotation.z = 0.12;

        // Dây văng xiên 2 bên
        const cable1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.95, 6), cableMat);
        cable1.position.set(-0.35, 0.7, 0);
        cable1.rotation.z = -Math.PI / 3.8;

        const cable2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.95, 6), cableMat);
        cable2.position.set(0.35, 0.7, 0);
        cable2.rotation.z = Math.PI / 3.8;

        // Mặt nước sông Hậu & Chiếc ghe tam bản nhỏ
        const river = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.08, 0.8, 2, 0.02), waterMat);
        river.position.set(0, 0.04, 0);

        const boat = this.createWoodenBoat('#E17055');
        boat.position.set(0, 0.1, 0.18);
        boat.rotation.y = 0.3;

        group.add(towerLeft, towerRight, cable1, cable2, river, boat);
        break;
      }

      case 3: {
        // Cà Mau: Cột mốc tọa độ Quốc gia GPS 0001 biểu tượng cánh buồm cực Nam
        const sailMat = this.getMat('caMauSail', () => new THREE.MeshStandardMaterial({ color: '#E84118', roughness: 0.3 }));
        const graniteMat = this.getMat('graniteBase', () => new THREE.MeshStandardMaterial({ color: '#747D8C', roughness: 0.6 }));

        // Bệ đài đá bát giác
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.18, 8), graniteMat);
        base.position.y = 0.09;

        // Cánh buồm đỏ uốn cong vươn ra biển
        const sail1 = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.35, 3), sailMat);
        sail1.position.set(0, 0.78, 0);
        sail1.rotation.z = -0.15;

        // Trụ mốc số 0001
        const pillar = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.65, 0.18, 2, 0.02), this.getMat('whiteMarker', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF' })));
        pillar.position.set(-0.25, 0.42, 0.15);

        // 2 Cây đước rễ chùm đặc trưng đất mũi
        const mangrove = this.createMiniMangroveTree();
        mangrove.position.set(0.38, 0.1, -0.18);

        group.add(base, sail1, pillar, mangrove);
        break;
      }

      // =====================================================
      // PHÂN KHU 2: VŨNG TÀU, PHAN THIẾT, NHA TRANG (Light Blue)
      // =====================================================
      case 6: {
        // Vũng Tàu: Ngọn Hải Đăng cổ trắng muốt trên mỏm đá Tao Phùng
        const rockMat = this.getMat('cliffRock', () => new THREE.MeshStandardMaterial({ color: '#808e9b', roughness: 0.8, flatShading: true }));
        const lightTowerMat = this.getMat('lighthouseWhite', () => new THREE.MeshStandardMaterial({ color: '#F5F6FA', roughness: 0.3 }));
        const beaconMat = this.getMat('beaconGlow', () => new THREE.MeshStandardMaterial({ color: '#FFF275', emissive: '#F1C40F', emissiveIntensity: 1.2 }));

        // Mỏm đá vách biển
        const cliff = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), rockMat);
        cliff.scale.set(1.2, 0.45, 1.0);
        cliff.position.set(0, 0.18, 0);

        // Tháp hải đăng hình trụ côn trắng
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 1.15, 16), lightTowerMat);
        tower.position.set(0, 0.78, 0);
        tower.castShadow = true;

        // Ban công chòi đèn trên đỉnh
        const balcony = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 12), lightTowerMat);
        balcony.position.set(0, 1.38, 0);

        // Đèn ngọn hải đăng phát sáng
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), beaconMat);
        beacon.position.set(0, 1.52, 0);

        const dome = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.22, 12), this.getMat('redDome', () => new THREE.MeshStandardMaterial({ color: '#D63031' })));
        dome.position.set(0, 1.72, 0);

        group.add(cliff, tower, balcony, beacon, dome);
        break;
      }

      case 8: {
        // Phan Thiết: Đồi Cát Bay vàng cam & Ngọn Hải Đăng Kê Gà sọc đỏ trắng
        const sandMat = this.getMat('duneSand', () => new THREE.MeshStandardMaterial({ color: '#E58E26', roughness: 0.85, flatShading: true }));
        const redStripMat = this.getMat('stripeRed', () => new THREE.MeshStandardMaterial({ color: '#EA2027', roughness: 0.35 }));
        const whiteStripMat = this.getMat('stripeWhite', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.35 }));

        // Đồi cát nhấp nhô
        const dune = new THREE.Mesh(new THREE.IcosahedronGeometry(0.65, 1), sandMat);
        dune.scale.set(1.3, 0.4, 0.95);
        dune.position.set(0, 0.15, 0);

        // Tháp Kê Gà bát giác sọc xen kẽ đỏ trắng
        const makeSegment = (y: number, mat: THREE.Material, r1: number, r2: number) => {
          const seg = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, 0.28, 8), mat);
          seg.position.set(0, y, 0);
          return seg;
        };
        const s1 = makeSegment(0.45, redStripMat, 0.3, 0.35);
        const s2 = makeSegment(0.73, whiteStripMat, 0.26, 0.3);
        const s3 = makeSegment(1.01, redStripMat, 0.22, 0.26);
        const s4 = makeSegment(1.29, whiteStripMat, 0.18, 0.22);

        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), this.getMat('beaconGlow', () => new THREE.MeshStandardMaterial({ color: '#FFF275', emissive: '#F1C40F', emissiveIntensity: 1.0 })));
        beacon.position.set(0, 1.54, 0);

        group.add(dune, s1, s2, s3, s4, beacon);
        break;
      }

      case 9: {
        // Nha Trang: Tháp Bà Ponagar gạch nung Chăm Pa cổ kính
        const brickMat = this.getMat('chamBrick', () => new THREE.MeshStandardMaterial({ color: '#D35400', roughness: 0.72 }));
        const goldMat = this.getMat('shinyGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.8 }));

        // Tháp chính gồm 4 tầng giật cấp mái vòm cong
        const t1 = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.55, 0.72, 3, 0.06), brickMat);
        t1.position.set(0, 0.32, 0);
        t1.castShadow = true;

        const t2 = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.45, 0.55, 3, 0.05), brickMat);
        t2.position.set(0, 0.78, 0);

        const t3 = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.38, 0.38, 3, 0.04), brickMat);
        t3.position.set(0, 1.15, 0);

        // Chóp nhọn Linga mạ vàng trên đỉnh tháp
        const spire = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 8), goldMat);
        spire.position.set(0, 1.48, 0);

        // Cây dừa nghiêng bóng mát bên bờ biển
        const palm = this.createMiniPalmTree();
        palm.position.set(0.45, 0.08, 0.2);

        group.add(t1, t2, t3, spire, palm);
        break;
      }

      // =====================================================
      // PHÂN KHU 3: ĐÀ LẠT, BUÔN MA THUỘT, PLEIKU (Rose Pink)
      // =====================================================
      case 11: {
        // Đà Lạt: Nhà Ga Đà Lạt cổ kính với 3 chóp nhọn màu cam đất của Pháp & Cây thông
        const frenchWallMat = this.getMat('frenchOchre', () => new THREE.MeshStandardMaterial({ color: '#F39C12', roughness: 0.45 }));
        const redRoofMat = this.getMat('frenchRoof', () => new THREE.MeshStandardMaterial({ color: '#D35400', roughness: 0.3 }));

        // Thân nhà ga 3 gian
        const mainBuilding = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.45, 0.55, 3, 0.04), frenchWallMat);
        mainBuilding.position.set(0, 0.26, 0);
        mainBuilding.castShadow = true;

        // 3 Mái chóp tam giác nhọn đặc trưng mô phỏng đỉnh Langbiang
        const makeGable = (gx: number, gy: number, gh: number) => {
          const gable = new THREE.Mesh(new THREE.ConeGeometry(0.24, gh, 4), redRoofMat);
          gable.rotation.y = Math.PI / 4;
          gable.position.set(gx, gy, 0);
          return gable;
        };
        const gLeft = makeGable(-0.3, 0.65, 0.5);
        const gMid = makeGable(0, 0.75, 0.68); // Chóp giữa cao nhất
        const gRight = makeGable(0.3, 0.65, 0.5);

        // Cây thông xứ lạnh Đà Lạt
        const pineTree = this.createMiniPineTree();
        pineTree.position.set(0.48, 0.06, 0.28);

        group.add(mainBuilding, gLeft, gMid, gRight, pineTree);
        break;
      }

      case 13: {
        // Buôn Ma Thuột: Nhà Rông Tây Nguyên mái cao vút bằng gỗ nứa & Hạt cà phê vàng
        const thatchMat = this.getMat('rôngThatch', () => new THREE.MeshStandardMaterial({ color: '#BD9B16', roughness: 0.85 }));
        const timberMat = this.getMat('rôngTimber', () => new THREE.MeshStandardMaterial({ color: '#5D4037', roughness: 0.6 }));

        // Sàn nhà sàn trên các cột gỗ
        const floor = new THREE.Mesh(new RoundedBoxGeometry(0.75, 0.08, 0.5, 2, 0.02), timberMat);
        floor.position.set(0, 0.22, 0);

        // 4 Cột sàn
        for (let x = -0.28; x <= 0.28; x += 0.56) {
          for (let z = -0.18; z <= 0.18; z += 0.36) {
            const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 6), timberMat);
            stilt.position.set(x, 0.11, z);
            group.add(stilt);
          }
        }

        // Mái nhà rông hình lưỡi búa vươn cao sừng sững
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.45, 4), thatchMat);
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(0.9, 1.0, 0.55);
        roof.position.set(0, 0.95, 0);
        roof.castShadow = true;

        group.add(floor, roof);
        break;
      }

      case 14: {
        // Pleiku: Núi lửa Chư Đăng Ya & Biển Hồ T'Nưng xanh ngắt
        const calderaMat = this.getMat('calderaGreen', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.75, flatShading: true }));
        const craterWaterMat = this.getMat('lakeWater', () => new THREE.MeshStandardMaterial({ color: '#00CEC9', roughness: 0.1 }));

        // Miệng núi lửa hình lòng chảo bo tròn
        const mountain = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.85, 0.65, 12), calderaMat);
        mountain.position.set(0, 0.34, 0);
        mountain.castShadow = true;

        // Hồ nước xanh biếc lọt thỏm giữa lòng miệng núi lửa
        const lake = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 12), craterWaterMat);
        lake.position.set(0, 0.64, 0);

        group.add(mountain, lake);
        break;
      }

      // =====================================================
      // PHÂN KHU 4: QUY NHƠN, HỘI AN, ĐÀ NẴNG (Coral Orange)
      // =====================================================
      case 16: {
        // Quy Nhơn: Eo Gió với hàng rào uốn lượn ven vách đá & sóng biển
        const rockMat = this.getMat('eoGioRock', () => new THREE.MeshStandardMaterial({ color: '#7F8C8D', roughness: 0.8, flatShading: true }));
        const seaMat = this.getMat('eoGioSea', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.1, transparent: true, opacity: 0.85 }));

        const cliff = new THREE.Mesh(new THREE.IcosahedronGeometry(0.65, 1), rockMat);
        cliff.scale.set(1.2, 0.55, 0.9);
        cliff.position.set(0, 0.24, -0.15);

        const sea = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.06, 0.5, 2, 0.02), seaMat);
        sea.position.set(0, 0.04, 0.3);

        // Hàng rào trắng đỏ uốn lượn ven vách đá
        const fenceMat = this.getMat('redFence', () => new THREE.MeshStandardMaterial({ color: '#E84118' }));
        for (let f = -0.4; f <= 0.4; f += 0.2) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 6), fenceMat);
          post.position.set(f, 0.52, 0.08);
          group.add(post);
        }

        group.add(cliff, sea);
        break;
      }

      case 18: {
        // Hội An: Chùa Cầu cổ kính mái ngói âm dương rêu phong & Giàn đèn lồng
        const woodOldMat = this.getMat('hoiAnWood', () => new THREE.MeshStandardMaterial({ color: '#533B27', roughness: 0.7 }));
        const tileOldMat = this.getMat('hoiAnTile', () => new THREE.MeshStandardMaterial({ color: '#8854D0', roughness: 0.6 }));

        // Cầu vòm gỗ bắc qua rãnh nước
        const bridgeArc = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.18, 0.55, 3, 0.04), woodOldMat);
        bridgeArc.position.set(0, 0.18, 0);

        // Gian chùa thờ giữa cầu có mái ngói cong
        const temple = new THREE.Mesh(new RoundedBoxGeometry(0.65, 0.38, 0.45, 2, 0.03), woodOldMat);
        temple.position.set(0, 0.42, 0);

        const roofCurved = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.32, 4), tileOldMat);
        roofCurved.rotation.y = Math.PI / 4;
        roofCurved.scale.set(1.2, 0.7, 0.95);
        roofCurved.position.set(0, 0.72, 0);

        // Đèn lồng hoa đăng đỏ rực rỡ treo trước hiên
        const lanternMat = this.getMat('lanternGlow', () => new THREE.MeshStandardMaterial({ color: '#FF4757', emissive: '#FF4757', emissiveIntensity: 0.8 }));
        const l1 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), lanternMat);
        l1.position.set(-0.35, 0.48, 0.24);
        const l2 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), lanternMat);
        l2.position.set(0.35, 0.48, 0.24);

        group.add(bridgeArc, temple, roofCurved, l1, l2);
        break;
      }

      case 19: {
        // Đà Nẵng: Cầu Rồng vàng kim uốn lượn phun lửa
        const dragonGold = this.getMat('dragonGoldMat', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          emissive: '#F39C12',
          emissiveIntensity: 0.4,
          metalness: 0.85,
          roughness: 0.18
        }));
        const fireMat = this.getMat('dragonFire', () => new THREE.MeshStandardMaterial({
          color: '#E84118',
          emissive: '#FF4757',
          emissiveIntensity: 1.2
        }));

        // Mặt cầu nhịp chính
        const bridgeDeck = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.08, 0.45, 2, 0.02), this.getMat('bridgeGray', () => new THREE.MeshStandardMaterial({ color: '#BDC3C7' })));
        bridgeDeck.position.set(0, 0.15, 0);

        // Thân rồng uốn 3 nhịp lượn sóng bằng ống cong
        for (let w = -0.35; w <= 0.35; w += 0.35) {
          const wave = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 8, 16, Math.PI), dragonGold);
          wave.position.set(w, 0.25, 0);
          group.add(wave);
        }

        // Đầu rồng vươn cao ngạo nghễ phía trước
        const dragonHead = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 6), dragonGold);
        dragonHead.rotation.z = -Math.PI / 3;
        dragonHead.position.set(0.55, 0.52, 0);

        // Đuôi lửa đỏ cam phun ra từ miệng rồng
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 6), fireMat);
        flame.rotation.z = -Math.PI / 3;
        flame.position.set(0.72, 0.62, 0);

        group.add(bridgeDeck, dragonHead, flame);
        break;
      }

      // =====================================================
      // PHÂN KHU 5: HUẾ, PHONG NHA, CỬA LÒ (Ruby Red)
      // =====================================================
      case 21: {
        // Huế: Cổng Ngọ Môn Đại Nội 3 vòm cuốn & Lầu Ngũ Phụng 2 tầng mái vàng
        const wallMat = this.getMat('citadelWall', () => new THREE.MeshStandardMaterial({ color: '#7F8C8D', roughness: 0.7 }));
        const imperialYellow = this.getMat('imperialYellow', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          roughness: 0.25,
          metalness: 0.15
        }));
        const woodRed = this.getMat('imperialWood', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.4 }));

        // Khối tường thành vòm cuốn bằng đá
        const wallBase = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.42, 0.55, 3, 0.04), wallMat);
        wallBase.position.set(0, 0.21, 0);
        wallBase.castShadow = true;

        // Lầu Ngũ Phụng tầng 1 gỗ đỏ
        const pavilion1 = new THREE.Mesh(new RoundedBoxGeometry(0.85, 0.24, 0.42, 2, 0.02), woodRed);
        pavilion1.position.set(0, 0.54, 0);

        const roof1 = new THREE.Mesh(new THREE.ConeGeometry(0.72, 0.18, 4), imperialYellow);
        roof1.rotation.y = Math.PI / 4;
        roof1.scale.set(1.2, 0.5, 0.85);
        roof1.position.set(0, 0.72, 0);

        // Lầu Ngũ Phụng tầng 2 mái vòm hoàng lưu ly
        const pavilion2 = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.2, 0.32, 2, 0.02), woodRed);
        pavilion2.position.set(0, 0.88, 0);

        const roof2 = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.22, 4), imperialYellow);
        roof2.rotation.y = Math.PI / 4;
        roof2.scale.set(1.15, 0.6, 0.85);
        roof2.position.set(0, 1.05, 0);

        group.add(wallBase, pavilion1, roof1, pavilion2, roof2);
        break;
      }

      case 23: {
        // Phong Nha: Cửa động karst thạch nhũ rêu phong & Dòng sông ngầm biếc xanh
        const caveRockMat = this.getMat('caveRock', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.85, flatShading: true }));
        const riverMat = this.getMat('subterraneanRiver', () => new THREE.MeshStandardMaterial({ color: '#16A085', roughness: 0.1, transparent: true, opacity: 0.9 }));

        // Vòm núi đá vôi cửa động
        const mountain = new THREE.Mesh(new THREE.IcosahedronGeometry(0.68, 1), caveRockMat);
        mountain.scale.set(1.25, 0.7, 0.85);
        mountain.position.set(0, 0.35, -0.15);

        // Lòng động khoét rỗng & Dòng sông Son chảy xuyên hang
        const river = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.06, 0.9, 2, 0.02), riverMat);
        river.position.set(0, 0.04, 0.15);

        // 3 Thạch nhũ đá rủ từ trần hang
        const makeStalactite = (sx: number, sz: number) => {
          const cone = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 6), caveRockMat);
          cone.rotation.x = Math.PI;
          cone.position.set(sx, 0.55, sz);
          return cone;
        };
        group.add(mountain, river, makeStalactite(-0.25, 0), makeStalactite(0.2, -0.1), makeStalactite(0, 0.08));
        break;
      }

      case 24: {
        // Cửa Lò: Bãi biển thoai thoải, chòi canh cứu hộ sọc xanh trắng & dù bãi biển
        const sandMat = this.getMat('whiteSand', () => new THREE.MeshStandardMaterial({ color: '#F8EFBA', roughness: 0.7 }));
        const umbrellaMat = this.getMat('beachUmbrella', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.3 }));

        const beach = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.08, 0.8, 2, 0.02), sandMat);
        beach.position.set(0, 0.04, 0);

        // Chòi cứu hộ gỗ trên cọc
        const hut = new THREE.Mesh(new RoundedBoxGeometry(0.35, 0.35, 0.35, 2, 0.02), this.getMat('lifeguardBlue', () => new THREE.MeshStandardMaterial({ color: '#2980B9' })));
        hut.position.set(-0.35, 0.45, 0);

        const hutStilt1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6), this.getMat('woodPole', () => new THREE.MeshStandardMaterial({ color: '#795548' })));
        hutStilt1.position.set(-0.35, 0.18, 0);

        // Chiếc dù bãi biển xoè rộng
        const umbrellaPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 8), this.getMat('woodPole', () => new THREE.MeshStandardMaterial({ color: '#795548' })));
        umbrellaPole.position.set(0.35, 0.32, 0.15);
        umbrellaPole.rotation.z = -0.15;

        const umbrellaTop = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.18, 10), umbrellaMat);
        umbrellaTop.position.set(0.35, 0.62, 0.15);
        umbrellaTop.rotation.z = -0.15;

        group.add(beach, hut, hutStilt1, umbrellaPole, umbrellaTop);
        break;
      }

      // =====================================================
      // PHÂN KHU 6: HẢI PHÒNG, HẠ LONG, TRÀNG AN (Fortune Yellow)
      // =====================================================
      case 26: {
        // Hải Phòng: Cần cẩu giàn bến cảng container & mỏ neo kim loại
        const craneOrange = this.getMat('craneOrange', () => new THREE.MeshStandardMaterial({ color: '#E67E22', metalness: 0.7, roughness: 0.3 }));
        const boxBlue = this.getMat('boxBlue', () => new THREE.MeshStandardMaterial({ color: '#2980B9', roughness: 0.4 }));

        // Khung chân giàn cẩu bến cảng
        const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.15, 6), craneOrange);
        leg1.position.set(-0.35, 0.58, 0);
        const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.15, 6), craneOrange);
        leg2.position.set(0.35, 0.58, 0);

        // Dầm ngang cẩu vươn dài
        const boom = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 0.12), craneOrange);
        boom.position.set(0, 1.15, 0);

        // Thùng container hàng hóa nhiều màu
        const container1 = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.22, 0.35, 2, 0.02), boxBlue);
        container1.position.set(0, 0.12, 0.15);

        group.add(leg1, leg2, boom, container1);
        break;
      }

      case 27: {
        // Hạ Long: Hòn Trống Mái sừng sững trên vịnh ngọc & Thuyền buồm đỏ
        const karstMat = this.getMat('haLongKarst', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.8, flatShading: true }));
        const bayWaterMat = this.getMat('emeraldBay', () => new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.1, transparent: true, opacity: 0.88 }));
        const sailRed = this.getMat('junkSailRed', () => new THREE.MeshStandardMaterial({ color: '#D63031', roughness: 0.4 }));

        // Mặt nước vịnh xanh màu ngọc lục bảo
        const water = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.08, 0.8, 2, 0.02), bayWaterMat);
        water.position.set(0, 0.04, 0);

        // 2 Hòn Trống Mái đá vôi tự nhiên đối mặt nhau
        const islandGàTrống = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.15, 6), karstMat);
        islandGàTrống.position.set(-0.28, 0.58, -0.15);
        islandGàTrống.rotation.z = 0.08;
        islandGàTrống.castShadow = true;

        const islandGàMái = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.95, 6), karstMat);
        islandGàMái.position.set(0.24, 0.48, -0.12);
        islandGàMái.rotation.z = -0.06;
        islandGàMái.castShadow = true;

        // Thuyền buồm nan cánh dơi lướt sóng
        const boatHull = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.1, 0.2, 2, 0.02), this.getMat('woodBoatBrown', () => new THREE.MeshStandardMaterial({ color: '#8B4513' })));
        boatHull.position.set(0, 0.1, 0.22);

        const sailWing = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.52, 3), sailRed);
        sailWing.position.set(0, 0.38, 0.22);

        group.add(water, islandGàTrống, islandGàMái, boatHull, sailWing);
        break;
      }

      case 29: {
        // Tràng An: Vòm hang karst non nước hữu tình & Con thuyền nan mộc
        const cliffMat = this.getMat('trangAnCliff', () => new THREE.MeshStandardMaterial({ color: '#2F3542', roughness: 0.85, flatShading: true }));
        const lakeMat = this.getMat('trangAnLake', () => new THREE.MeshStandardMaterial({ color: '#00CEC9', roughness: 0.1, transparent: true, opacity: 0.9 }));

        const mountainArch = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.24, 8, 16, Math.PI), cliffMat);
        mountainArch.position.set(0, 0.3, -0.1);

        const water = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.08, 0.8, 2, 0.02), lakeMat);
        water.position.set(0, 0.04, 0);

        const canoe = this.createWoodenBoat('#D35400');
        canoe.position.set(0, 0.1, 0.2);

        group.add(mountainArch, water, canoe);
        break;
      }

      // =====================================================
      // PHÂN KHU 7: HÀ NỘI - HỒ TÂY, PHỐ CỔ, TRÀNG TIỀN (Emerald Green)
      // =====================================================
      case 31: {
        // Hồ Tây (Hà Nội): Chùa Trấn Quốc Bảo Tháp Lục Độ Đài Sen 11 tầng màu đỏ son
        const pagodaMat = this.getMat('pagodaRed', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.4 }));
        const roofMat = this.getMat('pagodaTile', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', roughness: 0.2 }));

        // Đế tháp lục giác trên mặt hồ
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.72, 0.16, 6), this.getMat('graniteBase', () => new THREE.MeshStandardMaterial({ color: '#747D8C' })));
        base.position.y = 0.08;

        // Tháp thon dần gồm 4 tầng tượng trưng với mái ngói cong
        const makePagodaTier = (py: number, r1: number, r2: number, h: number) => {
          const tier = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 6), pagodaMat);
          tier.position.set(0, py, 0);
          const roof = new THREE.Mesh(new THREE.CylinderGeometry(r1 * 0.7, r1 * 1.35, 0.06, 6), roofMat);
          roof.position.set(0, py + h / 2 + 0.03, 0);
          group.add(tier, roof);
        };

        makePagodaTier(0.28, 0.38, 0.46, 0.22);
        makePagodaTier(0.56, 0.30, 0.38, 0.20);
        makePagodaTier(0.82, 0.22, 0.30, 0.18);
        makePagodaTier(1.06, 0.15, 0.22, 0.16);

        // Đỉnh tháp hoa sen vàng
        const lotusSpire = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), roofMat);
        lotusSpire.position.set(0, 1.25, 0);

        group.add(base, lotusSpire);
        break;
      }

      case 32: {
        // Phố Cổ (Hà Nội): Nhà ống mái ngói âm dương rêu phong, tường vôi vàng cổ kính
        const yellowWall = this.getMat('hanoiOchre', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', roughness: 0.55 }));
        const mossRoof = this.getMat('mossTile', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.65 }));
        const woodShutter = this.getMat('greenShutter', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.4 }));

        // Cụm 2 ngôi nhà ống phố cổ liền kề
        const house1 = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.75, 0.52, 2, 0.03), yellowWall);
        house1.position.set(-0.25, 0.38, 0);
        house1.castShadow = true;

        const roof1 = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.35, 4), mossRoof);
        roof1.rotation.y = Math.PI / 4;
        roof1.position.set(-0.25, 0.9, 0);

        const house2 = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.62, 0.48, 2, 0.03), yellowWall);
        house2.position.set(0.25, 0.32, 0);
        house2.castShadow = true;

        const roof2 = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.32, 4), mossRoof);
        roof2.rotation.y = Math.PI / 4;
        roof2.position.set(0.25, 0.75, 0);

        // Cửa chớp xanh lá cây đặc trưng Hà Nội xưa
        const shutter = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.24), woodShutter);
        shutter.position.set(-0.25, 0.45, 0.27);

        group.add(house1, roof1, house2, roof2, shutter);
        break;
      }

      case 34: {
        // Tràng Tiền (Hà Nội): Nhà Hát Lớn Hà Nội - Cột Corinthian & Mái vòm Mansard Pháp
        const operaWall = this.getMat('operaCream', () => new THREE.MeshStandardMaterial({ color: '#FFF8E7', roughness: 0.35 }));
        const mansardRoof = this.getMat('mansardSlate', () => new THREE.MeshStandardMaterial({ color: '#2C3E50', roughness: 0.4 }));
        const pillarMat = this.getMat('operaPillar', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.2 }));

        // Tòa nhà tiền sảnh bề thế
        const facade = new THREE.Mesh(new RoundedBoxGeometry(1.05, 0.65, 0.65, 3, 0.04), operaWall);
        facade.position.set(0, 0.34, 0);
        facade.castShadow = true;

        // 4 Cột La Mã trước sảnh
        for (let p = -0.38; p <= 0.38; p += 0.25) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.55, 10), pillarMat);
          col.position.set(p, 0.34, 0.35);
          group.add(col);
        }

        // Mái vòm Mansard màu đá xám kiểu Pháp
        const roof = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.35, 0.55, 3, 0.06), mansardRoof);
        roof.position.set(0, 0.8, 0);

        group.add(facade, roof);
        break;
      }

      // =====================================================
      // PHÂN KHU 8: TP. HỒ CHÍ MINH - LANDMARK 81 & NGUYỄN HUỆ (Royal Sapphire)
      // =====================================================
      case 37: {
        // Landmark 81 (TP.HCM): Tháp chọc trời nhiều đốt cao vút giật cấp & kính phản quang
        const glassMat = this.getMat('towerGlassCyan', () => new THREE.MeshStandardMaterial({
          color: '#74B9FF',
          emissive: '#0984E3',
          emissiveIntensity: 0.35,
          roughness: 0.1,
          metalness: 0.3
        }));
        const spireGold = this.getMat('spireGoldGlow', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          emissive: '#F1C40F',
          emissiveIntensity: 0.8,
          metalness: 0.9,
          roughness: 0.1
        }));

        // Bó 4 khối đế tầng thấp
        const t1 = new THREE.Mesh(new RoundedBoxGeometry(0.85, 0.9, 0.85, 4, 0.08), glassMat);
        t1.position.set(0, 0.45, 0);
        t1.castShadow = true;

        // Bó 3 khối tầng trung
        const t2 = new THREE.Mesh(new RoundedBoxGeometry(0.65, 0.85, 0.65, 4, 0.06), glassMat);
        t2.position.set(0, 1.25, 0);
        t2.castShadow = true;

        // Khối tầng cao chọc trời
        const t3 = new THREE.Mesh(new RoundedBoxGeometry(0.45, 0.75, 0.45, 4, 0.05), glassMat);
        t3.position.set(0, 1.95, 0);
        t3.castShadow = true;

        // Kim ăng-ten đỉnh tháp cao vút phát sáng
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.05, 0.65, 8), spireGold);
        antenna.position.set(0, 2.55, 0);

        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), this.getMat('redBeaconLight', () => new THREE.MeshBasicMaterial({ color: '#FF3838' })));
        beacon.position.set(0, 2.88, 0);

        group.add(t1, t2, t3, antenna, beacon);
        break;
      }

      case 39: {
        // Nguyễn Huệ / Bến Thành (TP.HCM): Tháp Đồng Hồ Chợ Bến Thành 4 mặt đặc trưng
        const benThanhWall = this.getMat('benThanhCream', () => new THREE.MeshStandardMaterial({ color: '#FFF8E7', roughness: 0.4 }));
        const clockRoof = this.getMat('benThanhRoof', () => new THREE.MeshStandardMaterial({ color: '#E84118', roughness: 0.35 }));
        const clockFaceMat = this.getMat('clockFaceGold', () => new THREE.MeshStandardMaterial({
          color: '#FFEAA7',
          emissive: '#F1C40F',
          emissiveIntensity: 0.6
        }));

        // Khối đế tháp cổng chính Chợ Bến Thành
        const towerBody = new THREE.Mesh(new RoundedBoxGeometry(0.85, 0.95, 0.85, 3, 0.06), benThanhWall);
        towerBody.position.set(0, 0.48, 0);
        towerBody.castShadow = true;

        // 4 Mặt đồng hồ tròn vàng kim ở 4 hướng
        const clockPositions = [
          [0, 0.72, 0.44],
          [0, 0.72, -0.44],
          [0.44, 0.72, 0],
          [-0.44, 0.72, 0]
        ];
        clockPositions.forEach(([cx, cy, cz]) => {
          const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 16), clockFaceMat);
          clock.position.set(cx, cy, cz);
          if (Math.abs(cx) > 0.1) clock.rotation.z = Math.PI / 2;
          else clock.rotation.x = Math.PI / 2;
          group.add(clock);
        });

        // Mái chóp ngói đỏ tam giác nổi tiếng của Chợ Bến Thành
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.72, 0.48, 4), clockRoof);
        roof.rotation.y = Math.PI / 4;
        roof.position.set(0, 1.18, 0);

        group.add(towerBody, roof);
        break;
      }

      default: {
        // Fallback: Công trình đô thị thu nhỏ
        const generic = new THREE.Mesh(new RoundedBoxGeometry(0.65, 0.65, 0.65, 3, 0.05), this.getMat('genericDiorama', () => new THREE.MeshStandardMaterial({ color: '#00B894' })));
        generic.position.set(0, 0.35, 0);
        group.add(generic);
        break;
      }
    }

    group.scale.set(0.88, 0.88, 0.88);
    return group;
  }

  // =========================================================================
  // HELPER MODELS: Thuyền buồm, Xe hơi tí hon, Cây cọ, Cây thông, Cây đước, Rương vàng
  // =========================================================================
  private static createTreasureChestMini(scale = 1.0): THREE.Group {
    const chestGroup = new THREE.Group();
    const woodMat = this.getMat('chestWood', () => new THREE.MeshStandardMaterial({ color: '#5D4037', roughness: 0.6 }));
    const goldMat = this.getMat('shinyGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.85, roughness: 0.2 }));

    const body = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.32, 0.38, 2, 0.03), woodMat);
    body.position.y = 0.16;

    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.56, 12, 1, false, 0, Math.PI), woodMat);
    lid.rotation.z = Math.PI / 2;
    lid.rotation.x = -0.35; // Hé mở nắp
    lid.position.set(0, 0.34, -0.06);

    // Tiền xu vàng tràn ra ngoài
    const coins = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), goldMat);
    coins.scale.set(1.4, 0.6, 1.0);
    coins.position.set(0, 0.3, 0.05);

    chestGroup.add(body, lid, coins);
    chestGroup.scale.set(scale, scale, scale);
    return chestGroup;
  }

  private static createTinyCar(colorHex: string): THREE.Group {
    const car = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.2, metalness: 0.1 });
    const wheelMat = this.getMat('tinyWheel', () => new THREE.MeshStandardMaterial({ color: '#2D3436', roughness: 0.7 }));

    const body = new THREE.Mesh(new RoundedBoxGeometry(0.65, 0.22, 0.36, 3, 0.04), bodyMat);
    body.position.y = 0.14;
    const cabin = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.18, 0.32, 2, 0.03), bodyMat);
    cabin.position.set(-0.04, 0.3, 0);

    const w1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 10), wheelMat);
    w1.rotation.z = Math.PI / 2;
    w1.position.set(-0.18, 0.08, 0.19);
    const w2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 10), wheelMat);
    w2.rotation.z = Math.PI / 2;
    w2.position.set(0.18, 0.08, 0.19);
    const w3 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 10), wheelMat);
    w3.rotation.z = Math.PI / 2;
    w3.position.set(-0.18, 0.08, -0.19);
    const w4 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 10), wheelMat);
    w4.rotation.z = Math.PI / 2;
    w4.position.set(0.18, 0.08, -0.19);

    car.add(body, cabin, w1, w2, w3, w4);
    car.scale.set(0.85, 0.85, 0.85);
    return car;
  }

  private static createWoodenBoat(colorHex: string): THREE.Group {
    const boat = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5 });
    const hull = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.14, 0.24, 2, 0.02), woodMat);
    hull.position.y = 0.07;
    const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.32, 8, 1, false, 0, Math.PI), this.getMat('bambooCanopy', () => new THREE.MeshStandardMaterial({ color: '#F39C12' })));
    canopy.rotation.z = Math.PI / 2;
    canopy.position.set(0, 0.18, 0);
    boat.add(hull, canopy);
    return boat;
  }

  private static createMiniPalmTree(): THREE.Group {
    const palm = new THREE.Group();
    const trunkMat = this.getMat('palmTrunk', () => new THREE.MeshStandardMaterial({ color: '#795548', roughness: 0.7 }));
    const leafMat = this.getMat('palmLeaf', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.35, flatShading: true }));

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.07, 0.85, 8), trunkMat);
    trunk.position.set(0.08, 0.42, 0);
    trunk.rotation.z = -0.18;

    for (let l = 0; l < 5; l++) {
      const angle = (l / 5) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.48, 4), leafMat);
      leaf.position.set(0.16 + Math.cos(angle) * 0.18, 0.82, Math.sin(angle) * 0.18);
      leaf.rotation.z = Math.cos(angle) * 0.7;
      leaf.rotation.x = Math.sin(angle) * 0.7;
      palm.add(leaf);
    }
    palm.add(trunk);
    palm.scale.set(0.8, 0.8, 0.8);
    return palm;
  }

  private static createMiniPineTree(): THREE.Group {
    const pine = new THREE.Group();
    const trunkMat = this.getMat('pineTrunk', () => new THREE.MeshStandardMaterial({ color: '#5D4037', roughness: 0.8 }));
    const pineLeafMat = this.getMat('pineLeaf', () => new THREE.MeshStandardMaterial({ color: '#1B4F72', roughness: 0.4, flatShading: true }));

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.6, 6), trunkMat);
    trunk.position.y = 0.3;

    const makeTier = (y: number, r: number, h: number) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), pineLeafMat);
      cone.position.y = y;
      pine.add(cone);
    };
    makeTier(0.48, 0.36, 0.42);
    makeTier(0.72, 0.28, 0.38);
    makeTier(0.95, 0.2, 0.32);

    pine.add(trunk);
    pine.scale.set(0.75, 0.75, 0.75);
    return pine;
  }

  private static createMiniMangroveTree(): THREE.Group {
    const mangrove = new THREE.Group();
    const woodMat = this.getMat('mangroveWood', () => new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.8 }));
    const leafMat = this.getMat('mangroveLeaf', () => new THREE.MeshStandardMaterial({ color: '#2E7D32', roughness: 0.4, flatShading: true }));

    // Rễ chùm cắm xuống đất
    for (let r = 0; r < 4; r++) {
      const a = (r / 4) * Math.PI * 2;
      const root = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.35, 6), woodMat);
      root.position.set(Math.cos(a) * 0.12, 0.14, Math.sin(a) * 0.12);
      root.rotation.z = Math.cos(a) * 0.4;
      root.rotation.x = Math.sin(a) * 0.4;
      mangrove.add(root);
    }

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.4, 6), woodMat);
    trunk.position.y = 0.38;

    const canopy = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), leafMat);
    canopy.position.y = 0.68;

    mangrove.add(trunk, canopy);
    mangrove.scale.set(0.75, 0.75, 0.75);
    return mangrove;
  }

  private static create3DQuestionMark(): THREE.Group {
    const qGroup = new THREE.Group();
    const goldMat = this.getMat('shinyGold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F39C12',
      emissiveIntensity: 0.5,
      metalness: 0.85,
      roughness: 0.15
    }));

    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.045, 8, 16, Math.PI * 1.4), goldMat);
    arc.position.set(0, 0.32, 0);
    arc.rotation.z = -Math.PI / 1.3;

    const stem = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.12, 0.08, 2, 0.01), goldMat);
    stem.position.set(0, 0.18, 0);

    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), goldMat);
    dot.position.set(0, 0.04, 0);

    qGroup.add(arc, stem, dot);
    return qGroup;
  }
}
