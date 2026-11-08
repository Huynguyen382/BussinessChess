import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Thư viện các mô hình 3D danh thắng và kiến trúc sa bàn chi tiết cho 40 ô cờ Việt Nam
 * Phong cách nghệ thuật: Stylized High-Fidelity Toy Diorama (Monopoly GO! & Animal Crossing)
 */
export class LandmarkModels {
  // Bộ chia sẻ vật liệu dùng chung (Material Cache) giúp tối ưu hiệu năng WebGL 60 FPS
  private static materials: Map<string, THREE.Material> = new Map();
  private static shadowTexture: THREE.CanvasTexture | null = null;

  private static getMat(key: string, createFn: () => THREE.Material): THREE.Material {
    if (!this.materials.has(key)) {
      this.materials.set(key, createFn());
    }
    return this.materials.get(key)!;
  }

  public static getContactShadowTexture(): THREE.CanvasTexture {
    if (!this.shadowTexture) {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(20, 24, 30, 0.65)');
      grad.addColorStop(0.5, 'rgba(20, 24, 30, 0.28)');
      grad.addColorStop(1, 'rgba(20, 24, 30, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      this.shadowTexture = new THREE.CanvasTexture(canvas);
    }
    return this.shadowTexture;
  }

  public static createContactShadow(sx: number, sz: number, opacity = 0.45): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(sx, sz);
    const mat = new THREE.MeshBasicMaterial({
      map: this.getContactShadowTexture(),
      transparent: true,
      opacity,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.008;
    return mesh;
  }

  // =========================================================================
  // 1. Ô 0: KHỞI HÀNH (GO) - CỔNG CHÀO KHẢI HOÀN MÔN & RƯƠNG VÀNG THỊNH VƯỢNG
  // =========================================================================
  public static createGOCorner(): THREE.Group {
    const group = new THREE.Group();
    group.add(this.createContactShadow(2.6, 2.6, 0.55));

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
    group.add(this.createContactShadow(2.4, 2.4, 0.55));

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
    group.add(this.createContactShadow(2.4, 2.4, 0.55));

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
    group.add(this.createContactShadow(2.4, 2.4, 0.55));

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
    group.add(this.createContactShadow(1.3, 1.4, 0.45));

    if (tileId === 5) {
      // 🚌 Ô 5: BẾN XE MIỀN TÂY - Xe Khách Lục Tỉnh & Nhà Chờ Bến Xe
      const busRedMat = this.getMat('coachRed', () => new THREE.MeshStandardMaterial({
        color: '#C0392B',
        roughness: 0.22,
        metalness: 0.15
      }));
      const creamMat = this.getMat('coachCream', () => new THREE.MeshStandardMaterial({
        color: '#FFFDF9',
        roughness: 0.25
      }));
      const windowMat = this.getMat('tintedGlass', () => new THREE.MeshStandardMaterial({
        color: '#1E272E',
        roughness: 0.1,
        metalness: 0.2
      }));
      const chromeMat = this.getMat('shinyChrome', () => new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        metalness: 0.95,
        roughness: 0.1
      }));
      const rubberMat = this.getMat('tireRubber', () => new THREE.MeshStandardMaterial({
        color: '#1E272E',
        roughness: 0.7
      }));

      // Bục bến xe lát gạch xám & gờ vỉa hè
      const platform = new THREE.Mesh(
        new RoundedBoxGeometry(1.25, 0.08, 1.35, 3, 0.03),
        this.getMat('stationPlatform', () => new THREE.MeshStandardMaterial({ color: '#747D8C', roughness: 0.5 }))
      );
      platform.position.y = 0.04;
      platform.receiveShadow = true;
      group.add(platform);

      // Thân xe khách bo tròn 2 tông màu (Đỏ Cherry & Kem Trắng)
      const busLower = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.24, 1.05, 4, 0.06), busRedMat);
      busLower.position.set(-0.15, 0.22, 0);
      busLower.castShadow = true;

      const busUpper = new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.26, 0.98, 4, 0.06), creamMat);
      busUpper.position.set(-0.15, 0.44, 0);

      // Cụm kính chắn gió & cửa sổ panoramic
      const windows = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.16, 0.92, 2, 0.02), windowMat);
      windows.position.set(-0.15, 0.42, 0);

      // Baga để hành lý & lốp dự phòng trên nóc xe
      const rack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.65), chromeMat);
      rack.position.set(-0.15, 0.59, -0.05);

      const luggage = new THREE.Mesh(
        new RoundedBoxGeometry(0.25, 0.12, 0.35, 2, 0.02),
        this.getMat('luggageTan', () => new THREE.MeshStandardMaterial({ color: '#E67E22', roughness: 0.6 }))
      );
      luggage.position.set(-0.15, 0.66, -0.08);

      // Đèn pha trước mạ crôm & đèn hậu
      const headLampGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.03, 12);
      headLampGeo.rotateX(Math.PI / 2);
      const hlMat = this.getMat('headlampGlow', () => new THREE.MeshStandardMaterial({
        color: '#FFEAA7',
        emissive: '#FFEAA7',
        emissiveIntensity: 1.0
      }));
      const hl1 = new THREE.Mesh(headLampGeo, hlMat);
      hl1.position.set(-0.02, 0.22, 0.53);
      const hl2 = new THREE.Mesh(headLampGeo, hlMat);
      hl2.position.set(-0.28, 0.22, 0.53);

      // 4 Bánh xe cao su mập mạp có mâm bạc
      const wheelGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16);
      wheelGeo.rotateZ(Math.PI / 2);
      const hubGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.062, 12);
      hubGeo.rotateZ(Math.PI / 2);
      const busWheelPositions = [
        [0.14, 0.1, 0.32],
        [-0.44, 0.1, 0.32],
        [0.14, 0.1, -0.32],
        [-0.44, 0.1, -0.32]
      ];
      busWheelPositions.forEach(([wx, wy, wz]) => {
        const w = new THREE.Mesh(wheelGeo, rubberMat);
        w.position.set(wx, wy, wz);
        const h = new THREE.Mesh(hubGeo, chromeMat);
        h.position.set(wx, wy, wz);
        group.add(w, h);
      });

      // Mái che nhà chờ bến xe có cột thép & ghế chờ
      const shelterRoof = new THREE.Mesh(
        new RoundedBoxGeometry(0.48, 0.05, 1.15, 2, 0.02),
        this.getMat('shelterBlue', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.3 }))
      );
      shelterRoof.position.set(0.38, 0.62, 0);

      const shelterPole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8), chromeMat);
      shelterPole1.position.set(0.38, 0.35, 0.42);
      const shelterPole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8), chromeMat);
      shelterPole2.position.set(0.38, 0.35, -0.42);

      // Biển tên bến xe nổi bật
      const signBoard = new THREE.Mesh(
        new RoundedBoxGeometry(0.36, 0.12, 0.04, 2, 0.01),
        this.getMat('signRed', () => new THREE.MeshStandardMaterial({ color: '#E84118', roughness: 0.3 }))
      );
      signBoard.position.set(0.38, 0.72, 0);

      group.add(busLower, busUpper, windows, rack, luggage, hl1, hl2, shelterRoof, shelterPole1, shelterPole2, signBoard);
      group.scale.set(0.88, 0.88, 0.88);
      return group;
    }

    // 🚂 Ô 15, 25, 35: GA SÀI GÒN, GA ĐÀ NẴNG, GA HÀ NỘI - Đầu Máy Xe Lửa Hơi Nước Cổ Điển
    const ironBlack = this.getMat('engineBlack', () => new THREE.MeshStandardMaterial({
      color: '#1E272E',
      metalness: 0.85,
      roughness: 0.25
    }));
    const trainRed = this.getMat('trainRed', () => new THREE.MeshStandardMaterial({
      color: '#C0392B',
      roughness: 0.28,
      metalness: 0.2
    }));
    const brassGold = this.getMat('brassGold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F39C12',
      emissiveIntensity: 0.3,
      metalness: 0.9,
      roughness: 0.15
    }));
    const railSteel = this.getMat('railSteel', () => new THREE.MeshStandardMaterial({
      color: '#718093',
      metalness: 0.82,
      roughness: 0.25
    }));

    // A. Đoạn đường ray với các thanh tà vẹt gỗ sồi bo viền
    const woodSleeper = this.getMat('woodSleeper', () => new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.7 }));
    for (let i = -2; i <= 2; i++) {
      const sleeper = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.05, 0.12, 2, 0.01), woodSleeper);
      sleeper.position.set(0, 0.025, i * 0.24);
      group.add(sleeper);
    }
    // 2 Thanh ray thép sáng bóng
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 1.35), railSteel);
    railL.position.set(-0.3, 0.06, 0);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 1.35), railSteel);
    railR.position.set(0.3, 0.06, 0);
    group.add(railL, railR);

    // B. Nồi súp-le hình trụ tròn mạ đen bóng
    const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.78, 24), ironBlack);
    boiler.rotation.x = Math.PI / 2;
    boiler.position.set(0, 0.36, 0.08);
    boiler.castShadow = true;

    // Các vòng đai đồng bao quanh nồi súp-le
    for (let b = -0.22; b <= 0.32; b += 0.18) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.245, 0.015, 10, 24), brassGold);
      ring.position.set(0, 0.36, b);
      group.add(ring);
    }

    // Chuông hơi nước mạ vàng & vòm hơi (Steam Dome) trên đỉnh
    const steamDome = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 12), brassGold);
    steamDome.scale.set(0.9, 1.2, 0.9);
    steamDome.position.set(0, 0.63, 0.02);

    const bell = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.09, 12), brassGold);
    bell.position.set(0, 0.64, -0.16);

    // Thanh gạt chướng ngại vật hình tam giác phía trước mũi tàu (Cowcatcher)
    const cowcatcher = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.22, 3), brassGold);
    cowcatcher.rotation.x = Math.PI / 2;
    cowcatcher.rotation.z = Math.PI;
    cowcatcher.position.set(0, 0.18, 0.54);

    // Buồng lái xe lửa màu đỏ thắm có mái vòm uốn cong
    const cab = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.62, 0.46, 3, 0.05), trainRed);
    cab.position.set(0, 0.45, -0.34);
    cab.castShadow = true;

    const cabRoof = new THREE.Mesh(new RoundedBoxGeometry(0.64, 0.08, 0.52, 2, 0.03), ironBlack);
    cabRoof.position.set(0, 0.78, -0.34);

    // Cửa sổ buồng lái phát sáng ấm cúng
    const cabWinMat = this.getMat('cabWinGlow', () => new THREE.MeshStandardMaterial({
      color: '#FFEAA7',
      emissive: '#FFEAA7',
      emissiveIntensity: 0.6
    }));
    const cabWinL = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.2), cabWinMat);
    cabWinL.position.set(-0.31, 0.48, -0.34);
    cabWinL.rotation.y = -Math.PI / 2;
    const cabWinR = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.2), cabWinMat);
    cabWinR.position.set(0.31, 0.48, -0.34);
    cabWinR.rotation.y = Math.PI / 2;

    // Ống khói hình loa kèn
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.065, 0.34, 16), ironBlack);
    chimney.position.set(0, 0.68, 0.32);

    const chimneyCap = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 10, 16), brassGold);
    chimneyCap.rotation.x = Math.PI / 2;
    chimneyCap.position.set(0, 0.85, 0.32);

    // Cụm mây khói trắng bồng bềnh uốn lượn (4 quả cầu mịn soft shading)
    const smokeMat = this.getMat('smokeWhitePuff', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.35,
      transparent: true,
      opacity: 0.92
    }));
    const smokePuffs = [
      [0, 0.95, 0.32, 0.12],
      [-0.04, 1.08, 0.28, 0.16],
      [0.05, 1.22, 0.22, 0.2],
      [-0.02, 1.38, 0.16, 0.24]
    ];
    smokePuffs.forEach(([sx, sy, sz, sr]) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(sr, 16, 12), smokeMat);
      puff.position.set(sx, sy, sz);
      group.add(puff);
    });

    // Đèn pha lớn trước mũi tàu mạ đồng phát sáng
    const headlamp = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 16), brassGold);
    headlamp.rotation.x = Math.PI / 2;
    headlamp.position.set(0, 0.38, 0.5);

    const headlampLens = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 14, 12),
      this.getMat('headlampLens', () => new THREE.MeshStandardMaterial({
        color: '#FFF275',
        emissive: '#FFF275',
        emissiveIntensity: 1.2
      }))
    );
    headlampLens.position.set(0, 0.38, 0.56);

    // 4 Bánh xe thép lớn viền đồng nan hoa
    const wheelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.06, 20);
    wheelGeo.rotateZ(Math.PI / 2);
    const hubCapGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.07, 12);
    hubCapGeo.rotateZ(Math.PI / 2);

    const wPositions = [
      [-0.32, 0.16, -0.16],
      [0.32, 0.16, -0.16],
      [-0.32, 0.16, 0.2],
      [0.32, 0.16, 0.2]
    ];
    wPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, ironBlack);
      wheel.position.set(wx, wy, wz);
      const cap = new THREE.Mesh(hubCapGeo, brassGold);
      cap.position.set(wx, wy, wz);
      group.add(wheel, cap);
    });

    group.add(
      boiler, steamDome, bell, cowcatcher,
      cab, cabRoof, cabWinL, cabWinR,
      chimney, chimneyCap, headlamp, headlampLens
    );
    group.scale.set(0.88, 0.88, 0.88);
    return group;
  }

  // =========================================================================
  // 6. Ô TIỆN ÍCH CÔNG CỘNG: ĐIỆN LỰC (12) & NƯỚC SẠCH (28)
  // =========================================================================
  public static createUtilityModel(tileId: number): THREE.Group {
    const group = new THREE.Group();
    group.add(this.createContactShadow(1.2, 1.2, 0.42));

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
    group.add(this.createContactShadow(1.1, 1.1, 0.42));

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
    group.add(this.createContactShadow(1.15, 1.15, 0.45));

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
  // 9. CÁC ĐỊA DANH DANH THẮNG ĐẶC TRƯNG VIỆT NAM (22 Ô ĐẤT) - STYLIZED 3D HIGH-DETAIL DIORAMA
  // =========================================================================
  public static createCityLandmark(tileId: number): THREE.Group {
    const group = new THREE.Group();
    group.add(this.createContactShadow(1.4, 1.25, 0.48));

    switch (tileId) {
      // =====================================================
      // PHÂN KHU 1: CẦN THƠ & CÀ MAU (Iris Purple)
      // =====================================================
      case 1: {
        // Cần Thơ: Cầu Cần Thơ dây văng hùng vĩ & Thuyền trái cây Chợ Nổi Cái Răng
        const pylonMat = this.getMat('ctBridgePylon', () => new THREE.MeshStandardMaterial({ color: '#F1F2F6', roughness: 0.28, metalness: 0.1 }));
        const cableMat = this.getMat('ctCableGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.85, roughness: 0.2 }));
        const waterMat = this.getMat('songHauWater', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.08, transparent: true, opacity: 0.88 }));
        const fruitYellow = this.getMat('fruitPineapple', () => new THREE.MeshStandardMaterial({ color: '#F39C12', roughness: 0.4 }));
        const fruitRed = this.getMat('fruitDragon', () => new THREE.MeshStandardMaterial({ color: '#E84118', roughness: 0.35 }));
        const fruitGreen = this.getMat('fruitMelon', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.4 }));

        // 1. Mặt nước sông Hậu mênh mang có gợn sóng bạc
        const river = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.08, 0.9, 3, 0.03), waterMat);
        river.position.set(0, 0.04, 0);

        // 2. Trụ tháp cầu dây văng chữ Y ngược thanh thoát cao 1.5 units
        const pylonL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.085, 1.45, 16), pylonMat);
        pylonL.position.set(-0.28, 0.72, -0.15);
        pylonL.rotation.z = -0.11;
        pylonL.castShadow = true;

        const pylonR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.085, 1.45, 16), pylonMat);
        pylonR.position.set(0.28, 0.72, -0.15);
        pylonR.rotation.z = 0.11;
        pylonR.castShadow = true;

        // Xà ngang nối hai nhánh trụ tháp
        const crossBeam = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.06, 0.1, 2, 0.02), pylonMat);
        crossBeam.position.set(0, 0.92, -0.15);

        // Dầm mặt cầu bắc ngang
        const deck = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.06, 0.24, 2, 0.02), pylonMat);
        deck.position.set(0, 0.48, -0.15);

        // Dàn dây văng cánh quạt mạ vàng
        const cableGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.92, 8);
        for (let c = 1; c <= 3; c++) {
          const cL = new THREE.Mesh(cableGeo, cableMat);
          cL.position.set(-0.16 - c * 0.11, 0.7 - c * 0.06, -0.15);
          cL.rotation.z = -0.42 - c * 0.12;

          const cR = new THREE.Mesh(cableGeo, cableMat);
          cR.position.set(0.16 + c * 0.11, 0.7 - c * 0.06, -0.15);
          cR.rotation.z = 0.42 + c * 0.12;
          group.add(cL, cR);
        }

        // 3. Chiếc ghe hoa quả Chợ Nổi Cái Răng chở đầy nông sản
        const boat = this.createWoodenBoat('#D35400');
        boat.position.set(0.05, 0.1, 0.22);
        boat.rotation.y = 0.25;

        // Các sọt trái cây miệt vườn đầy ắp
        const pile1 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), fruitYellow);
        pile1.position.set(-0.06, 0.18, 0.22);
        const pile2 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), fruitRed);
        pile2.position.set(0.06, 0.18, 0.23);
        const pile3 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), fruitGreen);
        pile3.position.set(0, 0.22, 0.22);

        // Cây bẹo tre treo mẫu trái cây đặc trưng Chợ Nổi
        const beoPole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 8), this.getMat('beoBamboo', () => new THREE.MeshStandardMaterial({ color: '#F1C40F' })));
        beoPole.position.set(0.24, 0.35, 0.26);
        beoPole.rotation.z = -0.15;
        const beoSample = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), fruitYellow);
        beoSample.position.set(0.28, 0.58, 0.26);

        group.add(river, pylonL, pylonR, crossBeam, deck, boat, pile1, pile2, pile3, beoPole, beoSample);
        break;
      }

      case 3: {
        // Cà Mau: Tượng Đài Con Tàu Mũi Cà Mau & Cột Mốc Tọa Độ GPS 0001
        const hullMat = this.getMat('cmShipWhite', () => new THREE.MeshStandardMaterial({ color: '#F8F9FA', roughness: 0.25 }));
        const sailMat = this.getMat('cmSailRed', () => new THREE.MeshStandardMaterial({ color: '#E84118', roughness: 0.3, emissive: '#C23616', emissiveIntensity: 0.2 }));
        const graniteMat = this.getMat('cmGranite', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.6 }));
        const seaMat = this.getMat('cmSeaCoast', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.1, transparent: true, opacity: 0.85 }));

        // 1. Thềm đài đá hoa cương hướng biển
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.78, 0.16, 24), graniteMat);
        base.position.set(0, 0.08, -0.05);
        base.receiveShadow = true;

        const sea = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.06, 0.6, 2, 0.02), seaMat);
        sea.position.set(0, 0.03, 0.3);

        // 2. Tượng đài Con Tàu vươn khơi
        const shipHull = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.24, 0.38, 3, 0.06), hullMat);
        shipHull.position.set(-0.08, 0.26, -0.05);
        shipHull.rotation.y = 0.2;
        shipHull.castShadow = true;

        // Cánh buồm đỏ no gió hình khối khí động học cách điệu
        const sail = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.42, 16), sailMat);
        sail.scale.set(0.45, 1.0, 1.1);
        sail.position.set(-0.06, 0.85, -0.05);
        sail.rotation.z = -0.14;
        sail.rotation.y = 0.2;
        sail.castShadow = true;

        // 3. Mốc tọa độ quốc gia GPS 0001 bằng đá nguyên khối có ngôi sao vàng
        const markerPillar = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.62, 0.18, 3, 0.03), hullMat);
        markerPillar.position.set(-0.38, 0.4, 0.18);
        markerPillar.castShadow = true;

        const star = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), this.getMat('goldStar', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.9, roughness: 0.1 })));
        star.position.set(-0.38, 0.62, 0.28);

        // 4. Cụm cây đước ngập mặn đặc trưng với rễ chùm uốn vòm
        const mangrove = this.createMiniMangroveTree();
        mangrove.position.set(0.42, 0.08, 0.08);

        group.add(base, sea, shipHull, sail, markerPillar, star, mangrove);
        break;
      }

      // =====================================================
      // PHÂN KHU 2: VŨNG TÀU, PHAN THIẾT, NHA TRANG (Light Blue)
      // =====================================================
      case 6: {
        // Vũng Tàu: Hải Đăng Cổ Núi Nhỏ trên đỉnh Tao Phùng & Biển Đông
        const mountainMat = this.getMat('vtMountainGreen', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.55 }));
        const stoneTowerMat = this.getMat('vtTowerWhite', () => new THREE.MeshStandardMaterial({ color: '#F8F9FA', roughness: 0.25 }));
        const domeRedMat = this.getMat('vtDomeRed', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.28 }));
        const lanternGlowMat = this.getMat('vtLanternGlow', () => new THREE.MeshStandardMaterial({
          color: '#FFF275',
          emissive: '#F1C40F',
          emissiveIntensity: 1.3,
          roughness: 0.1
        }));

        // 1. Mỏm núi đá Tao Phùng phủ cỏ xanh bo tròn mềm mại
        const mountGeo = new THREE.SphereGeometry(0.65, 22, 16);
        const mount = new THREE.Mesh(mountGeo, mountainMat);
        mount.scale.set(1.25, 0.45, 1.15);
        mount.position.set(0, 0.14, 0);
        mount.receiveShadow = true;

        // 2. Tháp hải đăng hình trụ côn tròn mịn cao 1.25m
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.36, 1.18, 24), stoneTowerMat);
        tower.position.set(0, 0.78, 0);
        tower.castShadow = true;

        // Vành ban công đài quan sát có gờ chỉ nổi
        const gallery = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 24), stoneTowerMat);
        gallery.position.set(0, 1.38, 0);

        const railing = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.015, 8, 24), this.getMat('ironRailing', () => new THREE.MeshStandardMaterial({ color: '#2D3436' })));
        railing.rotation.x = Math.PI / 2;
        railing.position.set(0, 1.45, 0);

        // Buồng kính đèn pha rực sáng
        const lanternRoom = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.22, 20), lanternGlowMat);
        lanternRoom.position.set(0, 1.52, 0);

        // Mái vòm bán cầu đỏ cổ kính
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeRedMat);
        dome.position.set(0, 1.63, 0);

        const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.15, 8), this.getMat('brassFinial', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.9 })));
        finial.position.set(0, 1.95, 0);

        // Cây sứ hoa trắng đặc trưng sườn núi Vũng Tàu
        const frangipani = this.createMiniPalmTree();
        frangipani.scale.set(0.65, 0.65, 0.65);
        frangipani.position.set(0.48, 0.1, 0.2);

        group.add(mount, tower, gallery, railing, lanternRoom, dome, finial, frangipani);
        break;
      }

      case 8: {
        // Phan Thiết: Đồi Cát Bay uốn lượn & Hải Đăng Kê Gà bát giác sọc đỏ trắng
        const sandMat = this.getMat('ptDuneSand', () => new THREE.MeshStandardMaterial({ color: '#F39C12', roughness: 0.65 }));
        const redMat = this.getMat('kgStripeRed', () => new THREE.MeshStandardMaterial({ color: '#D63031', roughness: 0.3 }));
        const whiteMat = this.getMat('kgStripeWhite', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 }));

        // 1. Cụm đồi cát mềm mại uốn lượn
        const dune1 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 20, 16), sandMat);
        dune1.scale.set(1.3, 0.38, 1.05);
        dune1.position.set(0, 0.12, 0);

        const dune2 = new THREE.Mesh(new THREE.SphereGeometry(0.45, 18, 14), sandMat);
        dune2.scale.set(1.2, 0.32, 0.9);
        dune2.position.set(0.3, 0.14, 0.22);

        // 2. Tháp Kê Gà bát giác sọc xen kẽ đỏ - trắng
        const makeBand = (y: number, r1: number, r2: number, mat: THREE.Material) => {
          const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, 0.28, 16), mat);
          m.position.set(-0.15, y, -0.08);
          m.castShadow = true;
          return m;
        };
        const b1 = makeBand(0.42, 0.28, 0.34, redMat);
        const b2 = makeBand(0.70, 0.24, 0.28, whiteMat);
        const b3 = makeBand(0.98, 0.20, 0.24, redMat);
        const b4 = makeBand(1.26, 0.16, 0.20, whiteMat);

        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), this.getMat('kgBeaconGlow', () => new THREE.MeshStandardMaterial({
          color: '#FFF275',
          emissive: '#F1C40F',
          emissiveIntensity: 1.2
        })));
        beacon.position.set(-0.15, 1.5, -0.08);

        // Xe jeep địa hình vượt đồi cát màu cam nổi bật
        const jeep = this.createTinyCar('#E67E22');
        jeep.position.set(0.28, 0.24, 0.15);
        jeep.rotation.y = -0.3;

        group.add(dune1, dune2, b1, b2, b3, b4, beacon, jeep);
        break;
      }

      case 9: {
        // Nha Trang: Tháp Bà Ponagar Chăm Pa gạch nung đỏ son & Hàng dừa biển
        const brickMat = this.getMat('chamBrickRed', () => new THREE.MeshStandardMaterial({ color: '#D35400', roughness: 0.62 }));
        const goldSpireMat = this.getMat('lingaGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.88, roughness: 0.15 }));

        // Bệ tháp đá hoa cương
        const plinth = new THREE.Mesh(new RoundedBoxGeometry(1.05, 0.12, 0.95, 3, 0.03), this.getMat('chamPlinth', () => new THREE.MeshStandardMaterial({ color: '#747D8C', roughness: 0.7 })));
        plinth.position.y = 0.06;
        plinth.receiveShadow = true;

        // Tháp Kalan chính 4 tầng giật cấp bo cong
        const t1 = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.54, 0.72, 4, 0.08), brickMat);
        t1.position.set(-0.12, 0.36, 0);
        t1.castShadow = true;

        const t2 = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.42, 0.56, 4, 0.06), brickMat);
        t2.position.set(-0.12, 0.8, 0);
        t2.castShadow = true;

        const t3 = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.35, 0.42, 4, 0.05), brickMat);
        t3.position.set(-0.12, 1.16, 0);

        const t4 = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.25, 0.28, 3, 0.04), brickMat);
        t4.position.set(-0.12, 1.44, 0);

        // Chóp nhọn Linga vàng trên đỉnh tháp
        const linga = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 16), goldSpireMat);
        linga.position.set(-0.12, 1.74, 0);

        // Cửa vòm Chăm hướng Đông có rèm cuốn
        const archPortal = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.36, 0.08, 2, 0.02), this.getMat('portalDark', () => new THREE.MeshStandardMaterial({ color: '#2C3E50' })));
        archPortal.position.set(-0.12, 0.32, 0.37);

        // Cây dừa duyên dáng nghiêng bóng
        const palm = this.createMiniPalmTree();
        palm.position.set(0.42, 0.08, 0.15);

        group.add(plinth, t1, t2, t3, t4, linga, archPortal, palm);
        break;
      }

      // =====================================================
      // PHÂN KHU 3: ĐÀ LẠT, BUÔN MA THUỘT, PLEIKU (Rose Pink)
      // =====================================================
      case 11: {
        // Đà Lạt: Ga Xe Lửa Đà Lạt 3 chóp nhọn Langbiang & Rừng thông sương mù
        const wallMat = this.getMat('dalatOchre', () => new THREE.MeshStandardMaterial({ color: '#F39C12', roughness: 0.38 }));
        const roofMat = this.getMat('dalatRoofRed', () => new THREE.MeshStandardMaterial({ color: '#D35400', roughness: 0.28 }));
        const glassMat = this.getMat('stainedGlass', () => new THREE.MeshStandardMaterial({ color: '#74B9FF', emissive: '#0984E3', emissiveIntensity: 0.4 }));

        // Thân nhà ga 3 gian đối xứng bằng bê tông màu đất nung
        const body = new THREE.Mesh(new RoundedBoxGeometry(1.05, 0.46, 0.58, 4, 0.05), wallMat);
        body.position.set(0, 0.28, 0);
        body.castShadow = true;

        // 3 Mái chóp tam giác nhọn đặc trưng mô phỏng dãy núi Langbiang
        const makeGable = (gx: number, gy: number, gh: number, gw: number) => {
          const gable = new THREE.Mesh(new THREE.ConeGeometry(gw, gh, 4), roofMat);
          gable.rotation.y = Math.PI / 4;
          gable.position.set(gx, gy, 0);
          gable.castShadow = true;
          return gable;
        };
        const gL = makeGable(-0.32, 0.72, 0.55, 0.28);
        const gM = makeGable(0, 0.84, 0.74, 0.32); // Chóp giữa cao ngất
        const gR = makeGable(0.32, 0.72, 0.55, 0.28);

        // Kính màu nghệ thuật hình hoa văn ở mặt tiền
        const glassWin = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), glassMat);
        glassWin.position.set(0, 0.65, 0.3);

        // Mặt đồng hồ nhà ga tròn cổ điển
        const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), this.getMat('stationClockFace', () => new THREE.MeshStandardMaterial({ color: '#FFFDF9' })));
        clock.rotation.x = Math.PI / 2;
        clock.position.set(0, 0.42, 0.3);

        // 2 Cây thông xứ lạnh Đà Lạt
        const pine1 = this.createMiniPineTree();
        pine1.position.set(0.48, 0.06, 0.24);
        const pine2 = this.createMiniPineTree();
        pine2.scale.set(0.6, 0.6, 0.6);
        pine2.position.set(-0.48, 0.06, 0.2);

        group.add(body, gL, gM, gR, glassWin, clock, pine1, pine2);
        break;
      }

      case 13: {
        // Buôn Ma Thuột: Nhà Rông Tây Nguyên mái lưỡi búa vút cao & Cồng chiêng vàng
        const thatchMat = this.getMat('rongThatchGold', () => new THREE.MeshStandardMaterial({ color: '#C99716', roughness: 0.75 }));
        const woodMat = this.getMat('rongTimberDark', () => new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.6 }));

        // Sàn nhà sàn cách mặt đất
        const floor = new THREE.Mesh(new RoundedBoxGeometry(0.85, 0.08, 0.54, 2, 0.02), woodMat);
        floor.position.set(0, 0.28, 0);

        // 6 Cột nhà sàn tròn vững chắc
        for (let x = -0.32; x <= 0.32; x += 0.32) {
          for (let z = -0.18; z <= 0.18; z += 0.36) {
            const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.28, 12), woodMat);
            stilt.position.set(x, 0.14, z);
            group.add(stilt);
          }
        }

        // Mái nhà rông hình lưỡi búa vút cao sừng sững (cao 1.55 units)
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.52, 1.55, 4), thatchMat);
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(0.85, 1.0, 0.5);
        roof.position.set(0, 1.08, 0);
        roof.castShadow = true;

        // Cầu thang gỗ chạm khắc trăng khuyết & bầu sữa mẹ
        const stairs = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.32, 0.04, 2, 0.01), woodMat);
        stairs.position.set(0, 0.16, 0.34);
        stairs.rotation.x = 0.35;

        // Chiếc Cồng Chiêng đồng vàng rực bên sân
        const gong = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 16), this.getMat('gongBrass', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.88, roughness: 0.15 })));
        gong.rotation.x = Math.PI / 2;
        gong.position.set(0.38, 0.25, 0.28);

        group.add(floor, roof, stairs, gong);
        break;
      }

      case 14: {
        // Pleiku: Núi Lửa Chư Đăng Ya hoa dã quỳ nở rộ & Hồ T'Nưng xanh ngắt
        const calderaMat = this.getMat('chuDangYaCaldera', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.65 }));
        const lakeMat = this.getMat('tnungLakeBlue', () => new THREE.MeshStandardMaterial({ color: '#00CEC9', roughness: 0.06, transparent: true, opacity: 0.9 }));
        const sunflowerMat = this.getMat('wildSunflower', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', emissive: '#F1C40F', emissiveIntensity: 0.3 }));

        // Miệng núi lửa hình chảo tròn mềm mại
        const caldera = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.88, 0.65, 24), calderaMat);
        caldera.position.set(0, 0.35, 0);
        caldera.castShadow = true;

        // Mặt nước Biển Hồ T'Nưng xanh trong lọt thỏm giữa lòng núi lửa
        const lake = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 24), lakeMat);
        lake.position.set(0, 0.66, 0);

        // Vành hoa dã quỳ vàng nở rộ quanh sườn núi
        for (let f = 0; f < 8; f++) {
          const a = (f / 8) * Math.PI * 2;
          const flower = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), sunflowerMat);
          flower.position.set(Math.cos(a) * 0.62, 0.42, Math.sin(a) * 0.62);
          group.add(flower);
        }

        group.add(caldera, lake);
        break;
      }

      // =====================================================
      // PHÂN KHU 4: QUY NHƠN, HỘI AN, ĐÀ NẴNG (Coral Orange)
      // =====================================================
      case 16: {
        // Quy Nhơn: Eo Gió con đường đi bộ ven vách đá & Tháp Đôi Chăm
        const cliffMat = this.getMat('eoGioCliff', () => new THREE.MeshStandardMaterial({ color: '#7F8C8D', roughness: 0.7 }));
        const seaMat = this.getMat('eoGioSeaBlue', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.1, transparent: true, opacity: 0.88 }));
        const fenceMat = this.getMat('eoGioFenceRed', () => new THREE.MeshStandardMaterial({ color: '#E84118', roughness: 0.3 }));

        // Vách đá nhô ra biển uốn lượn
        const cliff = new THREE.Mesh(new THREE.SphereGeometry(0.72, 22, 16), cliffMat);
        cliff.scale.set(1.3, 0.52, 0.95);
        cliff.position.set(0, 0.22, -0.15);
        cliff.receiveShadow = true;

        const sea = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.08, 0.55, 2, 0.02), seaMat);
        sea.position.set(0, 0.04, 0.28);

        // Hàng rào con đường đi bộ ven biển uốn cong
        for (let f = -0.42; f <= 0.42; f += 0.18) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8), fenceMat);
          post.position.set(f, 0.52, 0.05 + Math.sin(f * 3) * 0.08);
          group.add(post);
        }

        // Tháp Đôi Chăm Pa gạch nung xa xa
        const towerCham = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.62, 0.28, 3, 0.04), this.getMat('chamBrickRed', () => new THREE.MeshStandardMaterial({ color: '#D35400', roughness: 0.65 })));
        towerCham.position.set(-0.35, 0.58, -0.22);
        towerCham.castShadow = true;

        group.add(cliff, sea, towerCham);
        break;
      }

      case 18: {
        // Hội An: Chùa Cầu (Lai Viễn Kiều) mái ngói âm dương cong vút & Lồng đèn đỏ
        const bridgeWoodMat = this.getMat('chuaCauWood', () => new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.6 }));
        const tileRoofMat = this.getMat('chuaCauTile', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.65 }));
        const lanternMat = this.getMat('hoiAnLanternRed', () => new THREE.MeshStandardMaterial({
          color: '#FF4757',
          emissive: '#FF4757',
          emissiveIntensity: 0.95
        }));

        // Mố cầu đá bắc qua lạch nước
        const bridgeArch = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.18, 0.58, 3, 0.04), bridgeWoodMat);
        bridgeArch.position.set(0, 0.18, 0);

        // Gian chùa thờ giữa cầu mái ngói cong 4 góc
        const temple = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.38, 0.48, 3, 0.03), bridgeWoodMat);
        temple.position.set(0, 0.42, 0);

        // Mái ngói âm dương cong vút cổ kính
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.36, 4), tileRoofMat);
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(1.22, 0.65, 0.95);
        roof.position.set(0, 0.74, 0);
        roof.castShadow = true;

        // Lồng đèn Hội An treo trước hiên phát sáng lung linh
        const l1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 12), lanternMat);
        l1.position.set(-0.38, 0.48, 0.26);
        const l2 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 12), lanternMat);
        l2.position.set(0.38, 0.48, 0.26);

        // Tượng Linh Thú (Thần Khuyển / Thần Hầu) chầu ở đầu cầu
        const guardian = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.16, 8), this.getMat('guardianStone', () => new THREE.MeshStandardMaterial({ color: '#747D8C' })));
        guardian.position.set(-0.48, 0.32, 0.22);

        group.add(bridgeArch, temple, roof, l1, l2, guardian);
        break;
      }

      case 19: {
        // Đà Nẵng: Cầu Rồng Vàng Kim Uốn Lượn Phun Lửa Ngạo Nghễ
        const dragonGoldMat = this.getMat('dragonGoldGleam', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          emissive: '#F39C12',
          emissiveIntensity: 0.45,
          metalness: 0.88,
          roughness: 0.16
        }));
        const flameCoreMat = this.getMat('dragonFlameCore', () => new THREE.MeshStandardMaterial({
          color: '#FF4757',
          emissive: '#FF3838',
          emissiveIntensity: 1.5
        }));
        const flameOuterMat = this.getMat('dragonFlameOuter', () => new THREE.MeshStandardMaterial({
          color: '#FFA502',
          emissive: '#FFA502',
          emissiveIntensity: 1.2
        }));

        // Mặt cầu nhịp dầm thép bắc qua sông Hàn
        const bridgeDeck = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.08, 0.48, 3, 0.02), this.getMat('bridgeSteelDeck', () => new THREE.MeshStandardMaterial({ color: '#BDC3C7', metalness: 0.7 })));
        bridgeDeck.position.set(0, 0.16, 0);

        // Vạch tim đường màu vàng
        const lane = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 0.03), this.getMat('laneYellow', () => new THREE.MeshBasicMaterial({ color: '#F1C40F' })));
        lane.rotation.x = -Math.PI / 2;
        lane.position.set(0, 0.205, 0);

        // Thân rồng uốn 4 nhịp sóng vàng ống tròn
        for (let w = -0.4; w <= 0.25; w += 0.28) {
          const wave = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.055, 14, 24, Math.PI), dragonGoldMat);
          wave.position.set(w, 0.24, 0);
          group.add(wave);

          // Vảy rồng tam giác trên đỉnh mỗi nhịp sóng
          const fin = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 4), dragonGoldMat);
          fin.position.set(w, 0.46, 0);
          group.add(fin);
        }

        // Đầu Rồng hùng vĩ ngẩng cao đầu phía trước
        const head = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.18, 0.16, 3, 0.03), dragonGoldMat);
        head.position.set(0.52, 0.48, 0);

        // Sừng rồng & Mắt rồng phát sáng
        const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.18, 8), dragonGoldMat);
        hornL.position.set(0.48, 0.62, 0.06);
        hornL.rotation.z = -0.3;
        const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.18, 8), dragonGoldMat);
        hornR.position.set(0.48, 0.62, -0.06);
        hornR.rotation.z = -0.3;

        // Cột lửa phun ra cuồn cuộn từ miệng rồng
        const flameCore = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.38, 12), flameCoreMat);
        flameCore.rotation.z = -Math.PI / 2.8;
        flameCore.position.set(0.74, 0.58, 0);

        const flameOuter = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 12), flameOuterMat);
        flameOuter.rotation.z = -Math.PI / 2.8;
        flameOuter.position.set(0.68, 0.54, 0);

        // Đuôi rồng xòe cánh sen vàng ở cuối cầu
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 3), dragonGoldMat);
        tail.rotation.z = Math.PI / 3;
        tail.position.set(-0.55, 0.32, 0);

        group.add(bridgeDeck, lane, head, hornL, hornR, flameCore, flameOuter, tail);
        break;
      }

      // =====================================================
      // PHÂN KHU 5: HUẾ, PHONG NHA, CỬA LÒ (Ruby Red)
      // =====================================================
      case 21: {
        // Huế: Cổng Ngọ Môn Đại Nội 3 Vòm Cuốn & Lầu Ngũ Phụng Hoàng Lưu Ly
        const stoneMat = this.getMat('citadelStoneWall', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.75 }));
        const redWoodMat = this.getMat('hueRedTimber', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.38 }));
        const imperialGoldRoof = this.getMat('imperialGoldTile', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          roughness: 0.22,
          metalness: 0.18
        }));

        // Bệ thành đá Ngọ Môn kiên cố với 3 cửa vòm cuốn
        const wallBase = new THREE.Mesh(new RoundedBoxGeometry(1.22, 0.44, 0.62, 4, 0.05), stoneMat);
        wallBase.position.set(0, 0.22, 0);
        wallBase.castShadow = true;

        // 3 Cửa vòm cuốn khoét sâu ở mặt trước (Cửa Ngọ Môn ở giữa cho vua, 2 Giáp Môn 2 bên)
        const doorMat = this.getMat('gatePortalDark', () => new THREE.MeshStandardMaterial({ color: '#1E272E' }));
        const centerDoor = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.28, 0.08, 2, 0.02), doorMat);
        centerDoor.position.set(0, 0.16, 0.3);
        const leftDoor = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.22, 0.08, 2, 0.02), doorMat);
        leftDoor.position.set(-0.35, 0.14, 0.3);
        const rightDoor = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.22, 0.08, 2, 0.02), doorMat);
        rightDoor.position.set(0.35, 0.14, 0.3);

        // Lầu Ngũ Phụng Tầng 1: cột gỗ lim sơn son thếp vàng
        const f1 = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.22, 0.48, 2, 0.02), redWoodMat);
        f1.position.set(0, 0.55, 0);

        const roof1 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.22, 4), imperialGoldRoof);
        roof1.rotation.y = Math.PI / 4;
        roof1.scale.set(1.25, 0.55, 0.9);
        roof1.position.set(0, 0.74, 0);
        roof1.castShadow = true;

        // Lầu Ngũ Phụng Tầng 2: mái uốn cong hoàng lưu ly
        const f2 = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.18, 0.34, 2, 0.02), redWoodMat);
        f2.position.set(0, 0.92, 0);

        const roof2 = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.24, 4), imperialGoldRoof);
        roof2.rotation.y = Math.PI / 4;
        roof2.scale.set(1.18, 0.65, 0.88);
        roof2.position.set(0, 1.12, 0);
        roof2.castShadow = true;

        group.add(wallBase, centerDoor, leftDoor, rightDoor, f1, roof1, f2, roof2);
        break;
      }

      case 23: {
        // Phong Nha: Vòm Động Karst Thạch Nhũ & Dòng Sông Son Ngầm Xanh Biếc
        const karstMat = this.getMat('phongNhaCaveRock', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.7 }));
        const riverMat = this.getMat('songSonWater', () => new THREE.MeshStandardMaterial({ color: '#16A085', roughness: 0.08, transparent: true, opacity: 0.9 }));

        // Vòm núi đá vôi uốn cong mở ra cửa hang
        const caveMountain = new THREE.Mesh(new THREE.SphereGeometry(0.72, 22, 16), karstMat);
        caveMountain.scale.set(1.3, 0.7, 0.9);
        caveMountain.position.set(0, 0.36, -0.15);
        caveMountain.receiveShadow = true;

        // Lòng động khoét rỗng
        const caveInner = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.5, 16), this.getMat('caveInteriorDark', () => new THREE.MeshStandardMaterial({ color: '#2C3E50' })));
        caveInner.rotation.x = Math.PI / 2;
        caveInner.position.set(0, 0.28, 0);

        // Dòng sông Son chảy xuyên động
        const river = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.06, 0.95, 2, 0.02), riverMat);
        river.position.set(0, 0.04, 0.15);

        // Các chùm thạch nhũ lung linh rủ từ trần hang
        const makeStalactite = (sx: number, sz: number, sh: number) => {
          const cone = new THREE.Mesh(new THREE.ConeGeometry(0.045, sh, 12), this.getMat('crystalStalactite', () => new THREE.MeshStandardMaterial({
            color: '#E0F2FE',
            roughness: 0.2,
            metalness: 0.3
          })));
          cone.rotation.x = Math.PI;
          cone.position.set(sx, 0.58, sz);
          return cone;
        };

        const sampan = this.createWoodenBoat('#795548');
        sampan.scale.set(0.75, 0.75, 0.75);
        sampan.position.set(0, 0.08, 0.28);

        group.add(caveMountain, caveInner, river, makeStalactite(-0.22, 0.08, 0.35), makeStalactite(0.18, 0.05, 0.4), makeStalactite(0, 0.12, 0.28), sampan);
        break;
      }

      case 24: {
        // Cửa Lò: Bãi Biển Thoai Thoải & Chòi Canh Cứu Hộ Sọc Trắng Đỏ
        const sandMat = this.getMat('cuaLoWhiteSand', () => new THREE.MeshStandardMaterial({ color: '#F8EFBA', roughness: 0.65 }));
        const seaMat = this.getMat('cuaLoSea', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.1, transparent: true, opacity: 0.88 }));
        const blueHutMat = this.getMat('lifeguardBlue', () => new THREE.MeshStandardMaterial({ color: '#2980B9', roughness: 0.3 }));

        const beach = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.08, 0.85, 3, 0.03), sandMat);
        beach.position.set(0, 0.04, 0);

        const sea = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.06, 0.35, 2, 0.02), seaMat);
        sea.position.set(0, 0.05, 0.35);

        // Chòi cứu hộ gỗ trên 4 cọc cao
        const hut = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.35, 0.38, 3, 0.04), blueHutMat);
        hut.position.set(-0.35, 0.52, 0);
        hut.castShadow = true;

        for (let x = -0.45; x <= -0.25; x += 0.2) {
          for (let z = -0.1; z <= 0.1; z += 0.2) {
            const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8), this.getMat('poleBrown', () => new THREE.MeshStandardMaterial({ color: '#5D4037' })));
            stilt.position.set(x, 0.21, z);
            group.add(stilt);
          }
        }

        // Phao cứu sinh tròn đỏ - trắng treo cạnh chòi
        const buoy = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 8, 16), this.getMat('lifeBuoyRed', () => new THREE.MeshStandardMaterial({ color: '#E84118' })));
        buoy.position.set(-0.15, 0.52, 0);
        buoy.rotation.y = Math.PI / 2;

        // Chiếc dù bãi biển che nắng xòe rộng
        const umbrellaPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8), this.getMat('poleWhite', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF' })));
        umbrellaPole.position.set(0.35, 0.32, 0.05);
        umbrellaPole.rotation.z = -0.15;

        const umbrellaTop = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.2, 16), this.getMat('umbrellaYellow', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', roughness: 0.3 })));
        umbrellaTop.position.set(0.35, 0.62, 0.05);
        umbrellaTop.rotation.z = -0.15;

        group.add(beach, sea, hut, buoy, umbrellaPole, umbrellaTop);
        break;
      }

      // =====================================================
      // PHÂN KHU 6: HẢI PHÒNG, HẠ LONG, TRÀNG AN (Fortune Yellow)
      // =====================================================
      case 26: {
        // Hải Phòng: Cẩu Giàn Container Cảng Biển Quốc Tế & Cụm Thùng Hàng
        const craneOrange = this.getMat('gantryOrange', () => new THREE.MeshStandardMaterial({ color: '#E67E22', metalness: 0.75, roughness: 0.28 }));
        const boxBlue = this.getMat('maerskBlue', () => new THREE.MeshStandardMaterial({ color: '#2980B9', roughness: 0.35 }));
        const boxGreen = this.getMat('evergreenGreen', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.35 }));
        const boxRed = this.getMat('cmaRed', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.35 }));

        // Cầu cảng bê tông
        const wharf = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.08, 0.85, 3, 0.03), this.getMat('wharfConcrete', () => new THREE.MeshStandardMaterial({ color: '#747D8C', roughness: 0.6 })));
        wharf.position.set(0, 0.04, 0);

        // Khung giàn cẩu bến cảng màu cam vươn cao
        const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.25, 12), craneOrange);
        leg1.position.set(-0.35, 0.64, -0.1);
        const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.25, 12), craneOrange);
        leg2.position.set(0.35, 0.64, -0.1);

        const boom = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.1, 0.14, 2, 0.02), craneOrange);
        boom.position.set(0, 1.25, 0.05);

        // Cáp tời nâng hạ hàng
        const hoistCable = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.45, 6), this.getMat('hoistCable', () => new THREE.MeshStandardMaterial({ color: '#2D3436' })));
        hoistCable.position.set(0, 1.0, 0.1);

        // Các khối container hàng hóa nhiều màu xếp ngăn nắp
        const c1 = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.2, 0.28, 2, 0.02), boxBlue);
        c1.position.set(-0.25, 0.14, 0.18);
        const c2 = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.2, 0.28, 2, 0.02), boxGreen);
        c2.position.set(0.28, 0.14, 0.18);
        const c3 = new THREE.Mesh(new RoundedBoxGeometry(0.45, 0.18, 0.26, 2, 0.02), boxRed);
        c3.position.set(-0.25, 0.33, 0.18);

        group.add(wharf, leg1, leg2, boom, hoistCable, c1, c2, c3);
        break;
      }

      case 27: {
        // Hạ Long: Hòn Trống Mái Sừng Sững Vịnh Ngọc & Thuyền Buồm Cánh Dơi Đỏ
        const karstRockMat = this.getMat('haLongKarstSmooth', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.65 }));
        const foliageMat = this.getMat('haLongFoliageGreen', () => new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.35 }));
        const bayWaterMat = this.getMat('haLongEmeraldWater', () => new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.08, transparent: true, opacity: 0.9 }));
        const sailRedMat = this.getMat('junkBatwingSail', () => new THREE.MeshStandardMaterial({ color: '#D63031', roughness: 0.35 }));

        // 1. Mặt nước vịnh xanh ngọc lục bảo trong vắt
        const water = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.08, 0.88, 3, 0.03), bayWaterMat);
        water.position.set(0, 0.04, 0);

        // 2. Hai Hòn Trống Mái đá vôi tự nhiên đối mặt nhau (chân thon nhỏ, thân phình to)
        const makeKarstIslet = (ix: number, iz: number, h: number, r: number, tilt: number) => {
          const islet = new THREE.Group();
          // Chân đảo bị sóng khoét mòn
          const foot = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.05, r * 0.75, h * 0.5, 20), karstRockMat);
          foot.position.y = h * 0.25;
          // Thân đảo phình to
          const body = new THREE.Mesh(new THREE.SphereGeometry(r * 1.15, 20, 16), karstRockMat);
          body.position.y = h * 0.65;
          // Mũ tán cây xanh nhiệt đới phủ trên đỉnh
          const cap = new THREE.Mesh(new THREE.SphereGeometry(r * 1.05, 18, 14), foliageMat);
          cap.scale.set(1.15, 0.65, 1.15);
          cap.position.y = h * 0.92;

          islet.add(foot, body, cap);
          islet.position.set(ix, 0, iz);
          islet.rotation.z = tilt;
          return islet;
        };

        const isletTrong = makeKarstIslet(-0.28, -0.15, 1.18, 0.32, 0.08);
        const isletMai = makeKarstIslet(0.26, -0.12, 0.98, 0.28, -0.06);

        // 3. Thuyền buồm nan cánh dơi Hạ Long đỏ son lướt sóng
        const boatHull = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.12, 0.22, 3, 0.03), this.getMat('woodBoatBrown', () => new THREE.MeshStandardMaterial({ color: '#5D4037', roughness: 0.5 })));
        boatHull.position.set(0.02, 0.1, 0.24);

        const sail = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.58, 16), sailRedMat);
        sail.scale.set(0.3, 1.0, 1.15);
        sail.position.set(0.02, 0.42, 0.24);

        group.add(water, isletTrong, isletMai, boatHull, sail);
        break;
      }

      case 29: {
        // Tràng An: Thủy Động Núi Đá Vôi Non Nước Hữu Tình & Thuyền Nan
        const mountainMat = this.getMat('trangAnKarstRock', () => new THREE.MeshStandardMaterial({ color: '#34495E', roughness: 0.65 }));
        const lakeMat = this.getMat('trangAnLakeWater', () => new THREE.MeshStandardMaterial({ color: '#00CEC9', roughness: 0.06, transparent: true, opacity: 0.92 }));

        // Vòm núi đá vôi uốn cong thành hang luồn thủy động
        const mountainArch = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.28, 16, 24, Math.PI), mountainMat);
        mountainArch.position.set(0, 0.28, -0.1);
        mountainArch.castShadow = true;

        // Thảm thực vật xanh phủ trên sống núi
        const mossCap = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.22, 12, 20, Math.PI), this.getMat('trangAnMoss', () => new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.4 })));
        mossCap.position.set(0, 0.35, -0.1);

        const water = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.08, 0.88, 3, 0.03), lakeMat);
        water.position.set(0, 0.04, 0);

        const canoe = this.createWoodenBoat('#D35400');
        canoe.position.set(0, 0.1, 0.22);

        group.add(mountainArch, mossCap, water, canoe);
        break;
      }

      // =====================================================
      // PHÂN KHU 7: HÀ NỘI - HỒ TÂY, PHỐ CỔ, TRÀNG TIỀN (Emerald Green)
      // =====================================================
      case 31: {
        // Hồ Tây (Hà Nội): Chùa Trấn Quốc Bảo Tháp Lục Độ Đài Sen 11 Tầng
        const pagodaTerracotta = this.getMat('tranQuocTerracotta', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.42 }));
        const goldSpireMat = this.getMat('tranQuocGoldRoof', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', roughness: 0.22, metalness: 0.18 }));
        const lakeMat = this.getMat('westLakeWater', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.08, transparent: true, opacity: 0.88 }));
        const lotusPinkMat = this.getMat('lotusBlossomPink', () => new THREE.MeshStandardMaterial({ color: '#FD79A8', emissive: '#FD79A8', emissiveIntensity: 0.3 }));

        // Mặt nước Hồ Tây mênh mang
        const lake = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.08, 0.9, 3, 0.03), lakeMat);
        lake.position.set(0, 0.04, 0);

        // Đài Sen đá nâng đỡ chân tháp
        const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.72, 0.16, 24), this.getMat('lotusStoneBase', () => new THREE.MeshStandardMaterial({ color: '#BDC3C7' })));
        lotusBase.position.y = 0.08;

        // 6 Tầng tháp đại diện thu nhỏ lục giác với mái ngói cong vút ở mỗi tầng
        const makeTier = (py: number, rTier: number, h: number) => {
          const body = new THREE.Mesh(new THREE.CylinderGeometry(rTier * 0.9, rTier, h, 6), pagodaTerracotta);
          body.position.set(0, py, 0);
          body.castShadow = true;

          // Mái ngói đao cong che trên mỗi tầng
          const eave = new THREE.Mesh(new THREE.CylinderGeometry(rTier * 0.65, rTier * 1.35, 0.06, 6), goldSpireMat);
          eave.position.set(0, py + h / 2 + 0.03, 0);

          // Tượng Phật trắng ngà trong hốc vòm
          const buddha = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), this.getMat('whiteBuddha', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF' })));
          buddha.position.set(0, py, rTier * 0.85);

          group.add(body, eave, buddha);
        };

        makeTier(0.28, 0.44, 0.22);
        makeTier(0.54, 0.36, 0.20);
        makeTier(0.78, 0.28, 0.18);
        makeTier(1.00, 0.21, 0.16);
        makeTier(1.20, 0.15, 0.14);

        // Đỉnh tháp Cửu Phẩm Liên Hoa (Hoa sen vàng 9 tầng)
        const lotusCrown = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), goldSpireMat);
        lotusCrown.position.set(0, 1.42, 0);

        // Hoa sen nở dập dềnh trên mặt nước Hồ Tây
        for (let s = 0; s < 3; s++) {
          const lotusFlower = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), lotusPinkMat);
          lotusFlower.position.set(0.35 + s * 0.15, 0.1, 0.22 - s * 0.12);
          group.add(lotusFlower);
        }

        group.add(lake, lotusBase, lotusCrown);
        break;
      }

      case 32: {
        // Phố Cổ Hà Nội: Cụm Nhà Ống Rêu Phong 36 Phố Phường & Cửa Chớp Xanh
        const ochreWallMat = this.getMat('hnOchreWall', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', roughness: 0.52 }));
        const mossTileMat = this.getMat('hnMossTile', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.65 }));
        const shutterMat = this.getMat('hnGreenShutter', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.38 }));

        // Nhà 1 (Gian chính 3 tầng cổ kính)
        const h1 = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.88, 0.56, 3, 0.04), ochreWallMat);
        h1.position.set(-0.25, 0.44, 0);
        h1.castShadow = true;

        const roof1 = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.36, 4), mossTileMat);
        roof1.rotation.y = Math.PI / 4;
        roof1.position.set(-0.25, 1.04, 0);

        // Nhà 2 (Gian cạnh thấp hơn giật cấp)
        const h2 = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.72, 0.52, 3, 0.04), ochreWallMat);
        h2.position.set(0.26, 0.36, 0);
        h2.castShadow = true;

        const roof2 = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.32, 4), mossTileMat);
        roof2.rotation.y = Math.PI / 4;
        roof2.position.set(0.26, 0.86, 0);

        // Các ô cửa sổ lá sách màu xanh rêu truyền thống
        for (let floor = 0; floor < 2; floor++) {
          const winL = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.22), shutterMat);
          winL.position.set(-0.25, 0.38 + floor * 0.32, 0.29);
          const winR = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.22), shutterMat);
          winR.position.set(0.26, 0.32 + floor * 0.28, 0.27);
          group.add(winL, winR);
        }

        // Cột điện cổ có dây chăng ngang & Biển tên phố
        const streetSign = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.08, 0.02, 2, 0.01), this.getMat('streetSignBlue', () => new THREE.MeshStandardMaterial({ color: '#0984E3' })));
        streetSign.position.set(-0.25, 0.16, 0.32);

        group.add(h1, roof1, h2, roof2, streetSign);
        break;
      }

      case 34: {
        // Tràng Tiền: Nhà Hát Lớn Hà Nội - Kiến Trúc Tân Cổ Điển Pháp & Mái Mansard
        const creamFacadeMat = this.getMat('operaCreamFacade', () => new THREE.MeshStandardMaterial({ color: '#FFF8E7', roughness: 0.32 }));
        const mansardMat = this.getMat('operaMansardSlate', () => new THREE.MeshStandardMaterial({ color: '#2C3E50', roughness: 0.38 }));
        const columnMat = this.getMat('operaIonicPillar', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.22 }));

        // Bậc thềm đại sảnh đá hoa cương nhiều cấp
        const steps = new THREE.Mesh(new RoundedBoxGeometry(1.22, 0.1, 0.72, 3, 0.03), creamFacadeMat);
        steps.position.y = 0.05;
        steps.receiveShadow = true;

        // Tòa tiền sảnh Tân cổ điển bề thế
        const facade = new THREE.Mesh(new RoundedBoxGeometry(1.12, 0.65, 0.62, 4, 0.05), creamFacadeMat);
        facade.position.set(0, 0.42, 0);
        facade.castShadow = true;

        // 6 Cột La Mã Ionic fluted nâng đỡ trán tường
        for (let p = -0.42; p <= 0.42; p += 0.17) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.042, 0.58, 16), columnMat);
          col.position.set(p, 0.42, 0.33);
          group.add(col);
        }

        // Trán tường tam giác (Pediment) với phù điêu trang trí
        const pediment = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.22, 3), creamFacadeMat);
        pediment.rotation.z = Math.PI;
        pediment.position.set(0, 0.82, 0.32);

        // Mái vòm Mansard màu phiến đá đen Pháp
        const mansardRoof = new THREE.Mesh(new RoundedBoxGeometry(1.02, 0.38, 0.56, 4, 0.08), mansardMat);
        mansardRoof.position.set(0, 0.88, 0);

        // Chòi mái sổ vòm (Dormer window) trên mái
        const dormer = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 12, 0, Math.PI), creamFacadeMat);
        dormer.position.set(0, 0.98, 0.26);

        group.add(steps, facade, pediment, mansardRoof, dormer);
        break;
      }

      // =====================================================
      // PHÂN KHU 8: TP. HỒ CHÍ MINH - LANDMARK 81 & NGUYỄN HUỆ (Royal Sapphire)
      // =====================================================
      case 37: {
        // Landmark 81 (TP.HCM): Kiến Trúc Bó Tre 36 Đốt Cao Vút & Kim Ăng-ten Phát Quang
        const glassCyanMat = this.getMat('l81GlassCyan', () => new THREE.MeshStandardMaterial({
          color: '#74B9FF',
          emissive: '#0984E3',
          emissiveIntensity: 0.38,
          roughness: 0.08,
          metalness: 0.35
        }));
        const spandrelWhiteMat = this.getMat('l81SpandrelWhite', () => new THREE.MeshStandardMaterial({
          color: '#FFFFFF',
          roughness: 0.2
        }));
        const spireGoldMat = this.getMat('l81SpireGold', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          emissive: '#F1C40F',
          emissiveIntensity: 0.9,
          metalness: 0.92,
          roughness: 0.1
        }));

        // Bục sảnh đế đón khách vát cong hình cánh cung
        const podium = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.14, 1.15, 4, 0.08), glassCyanMat);
        podium.position.y = 0.07;
        podium.receiveShadow = true;
        group.add(podium);

        // Cấu trúc 3x3 gồm 9 khối tháp bó tre giật cấp chính xác theo nguyên mẫu Landmark 81
        const tubePositions = [
          // 4 Khối góc (thấp nhất Y = 1.0)
          [-0.24, -0.24, 0.95], [0.24, -0.24, 0.95],
          [-0.24, 0.24, 0.95], [0.24, 0.24, 0.95],
          // 4 Khối cạnh (vươn trung Y = 1.75)
          [0, -0.24, 1.7], [0, 0.24, 1.7],
          [-0.24, 0, 1.7], [0.24, 0, 1.7],
          // 1 Khối lõi trung tâm (vươn cao nhất Y = 2.45)
          [0, 0, 2.45]
        ];

        tubePositions.forEach(([tx, tz, th]) => {
          const colGeo = new RoundedBoxGeometry(0.22, th, 0.22, 3, 0.03);
          const colMesh = new THREE.Mesh(colGeo, glassCyanMat);
          colMesh.position.set(tx, th / 2 + 0.12, tz);
          colMesh.castShadow = true;
          group.add(colMesh);

          // Vạch spandrel trắng tinh khôi ở đỉnh từng khối
          const cap = new THREE.Mesh(new THREE.BoxGeometry(0.225, 0.03, 0.225), spandrelWhiteMat);
          cap.position.set(tx, th + 0.12, tz);
          group.add(cap);
        });

        // Đỉnh tháp thuôn nhọn pha lê chuyển tiếp
        const transitionCrown = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.45, 4), glassCyanMat);
        transitionCrown.rotation.y = Math.PI / 4;
        transitionCrown.position.set(0, 2.78, 0);

        // Kim ăng-ten đỉnh tháp cao vút mạ vàng (vươn tới Y = 3.35)
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.045, 0.72, 16), spireGoldMat);
        antenna.position.set(0, 3.12, 0);

        // Đèn an toàn hàng không đỏ rực trên đỉnh tháp nhấp nháy
        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(0.065, 12, 12),
          this.getMat('l81RedBeacon', () => new THREE.MeshBasicMaterial({ color: '#FF3838' }))
        );
        beacon.position.set(0, 3.48, 0);

        group.add(transitionCrown, antenna, beacon);
        break;
      }

      case 39: {
        // Nguyễn Huệ / Chợ Bến Thành (TP.HCM): Tháp Đồng Hồ Cổng Nam 3 Vòm Cuốn & Cột Cờ
        const creamWallMat = this.getMat('benThanhCreamPlaster', () => new THREE.MeshStandardMaterial({ color: '#FFF8E7', roughness: 0.38 }));
        const terracottaRoofMat = this.getMat('benThanhTerracottaTile', () => new THREE.MeshStandardMaterial({ color: '#E84118', roughness: 0.3 }));
        const clockFaceMat = this.getMat('benThanhClockGold', () => new THREE.MeshStandardMaterial({
          color: '#FFEAA7',
          emissive: '#F1C40F',
          emissiveIntensity: 0.65
        }));
        const clockHandsMat = this.getMat('clockHandsBlack', () => new THREE.MeshBasicMaterial({ color: '#1E272E' }));

        // Khối đế sảnh chính Chợ Bến Thành có 3 vòm cuốn Cửa Nam
        const basePortal = new THREE.Mesh(new RoundedBoxGeometry(1.22, 0.52, 0.75, 4, 0.06), creamWallMat);
        basePortal.position.set(0, 0.26, 0);
        basePortal.castShadow = true;

        // 3 Cửa vòm cuốn nổi tiếng khoét sâu ở mặt tiền
        const doorVoidMat = this.getMat('portalVoidDark', () => new THREE.MeshStandardMaterial({ color: '#1E272E' }));
        const mainArch = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.38, 0.08, 3, 0.04), doorVoidMat);
        mainArch.position.set(0, 0.22, 0.37);

        const subArchL = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.28, 0.08, 2, 0.03), doorVoidMat);
        subArchL.position.set(-0.35, 0.18, 0.37);
        const subArchR = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.28, 0.08, 2, 0.03), doorVoidMat);
        subArchR.position.set(0.35, 0.18, 0.37);

        // Mái hiên ngói đất nung đỏ uốn cong che trên 3 cổng vòm
        const lowerRoof = new THREE.Mesh(new RoundedBoxGeometry(1.26, 0.08, 0.82, 3, 0.04), terracottaRoofMat);
        lowerRoof.position.set(0, 0.56, 0);

        // Khối Tháp Đồng Hồ 4 mặt vươn cao ở giữa
        const clockTower = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.72, 0.68, 4, 0.06), creamWallMat);
        clockTower.position.set(0, 0.96, 0);
        clockTower.castShadow = true;

        // 4 Mặt đồng hồ tròn vàng kim ở 4 hướng với kim đồng hồ 10:10
        const clockPositions = [
          [0, 1.05, 0.35, 0],
          [0, 1.05, -0.35, Math.PI],
          [0.35, 1.05, 0, Math.PI / 2],
          [-0.35, 1.05, 0, -Math.PI / 2]
        ];

        clockPositions.forEach(([cx, cy, cz, rotY]) => {
          const frame = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 10, 24), this.getMat('clockBezelBrass', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.8 })));
          frame.position.set(cx, cy, cz);
          frame.rotation.y = rotY;

          const dial = new THREE.Mesh(new THREE.CircleGeometry(0.135, 20), clockFaceMat);
          dial.position.set(cx, cy, cz);
          dial.rotation.y = rotY;

          // Kim giờ & kim phút chỉ 10:10
          const handH = new THREE.Mesh(new THREE.PlaneGeometry(0.015, 0.06), clockHandsMat);
          handH.position.set(cx, cy + 0.02, cz + (cz >= 0 ? 0.005 : -0.005));
          handH.rotation.z = 0.55;

          const handM = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.085), clockHandsMat);
          handM.position.set(cx, cy + 0.03, cz + (cz >= 0 ? 0.005 : -0.005));
          handM.rotation.z = -0.55;

          group.add(frame, dial, handH, handM);
        });

        // Mái chóp tháp chuông ngói đỏ hình kim tự tháp cong duyên dáng
        const spireRoof = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.52, 4), terracottaRoofMat);
        spireRoof.rotation.y = Math.PI / 4;
        spireRoof.position.set(0, 1.54, 0);
        spireRoof.castShadow = true;

        // Cột cờ Tổ quốc phấp phới cờ đỏ sao vàng trên đỉnh tháp
        const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.52, 8), this.getMat('flagPoleSilver', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', metalness: 0.8 })));
        flagPole.position.set(0, 1.95, 0);

        const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.16), this.getMat('vietnamFlagRed', () => new THREE.MeshBasicMaterial({ color: '#DA251D', side: THREE.DoubleSide })));
        flag.position.set(0.14, 2.08, 0);

        group.add(basePortal, mainArch, subArchL, subArchR, lowerRoof, clockTower, spireRoof, flagPole, flag);
        break;
      }

      default: {
        const generic = new THREE.Mesh(new RoundedBoxGeometry(0.65, 0.65, 0.65, 4, 0.06), this.getMat('genericDiorama', () => new THREE.MeshStandardMaterial({ color: '#00B894' })));
        generic.position.set(0, 0.35, 0);
        group.add(generic);
        break;
      }
    }

    group.scale.set(0.9, 0.9, 0.9);
    return group;
  }

  // =========================================================================
  // HELPER MODELS: Thuyền tam bản, Xe hơi tí hon, Cây dừa, Cây thông, Cây đước, Rương vàng
  // =========================================================================
  private static createTreasureChestMini(scale = 1.0): THREE.Group {
    const chestGroup = new THREE.Group();
    const woodMat = this.getMat('chestWoodDark', () => new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.55 }));
    const goldMat = this.getMat('shinyGoldTreasure', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F39C12',
      emissiveIntensity: 0.45,
      metalness: 0.9,
      roughness: 0.15
    }));
    const gemRubyMat = this.getMat('gemRubyGlow', () => new THREE.MeshStandardMaterial({ color: '#FF3838', emissive: '#FF3838', emissiveIntensity: 0.8 }));
    const gemCyanMat = this.getMat('gemCyanGlow', () => new THREE.MeshStandardMaterial({ color: '#00CEC9', emissive: '#00CEC9', emissiveIntensity: 0.8 }));

    // Thùng rương gỗ nẹp viền đồng
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.34, 0.42, 3, 0.04), woodMat);
    body.position.y = 0.17;
    body.castShadow = true;

    // Nắp rương vòm cong hé mở
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.6, 20, 1, false, 0, Math.PI), woodMat);
    lid.rotation.z = Math.PI / 2;
    lid.rotation.x = -0.42; // Hé mở nắp kho báu
    lid.position.set(0, 0.36, -0.08);

    // Tiền vàng tràn ngập bên trong rương
    const goldCoins = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), goldMat);
    goldCoins.scale.set(1.3, 0.5, 0.95);
    goldCoins.position.set(0, 0.32, 0.06);

    // Các viên ngọc quý lấp lánh (Ruby, Sapphire)
    const ruby1 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), gemRubyMat);
    ruby1.position.set(-0.12, 0.38, 0.12);
    const sapphire1 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), gemCyanMat);
    sapphire1.position.set(0.12, 0.38, 0.12);

    chestGroup.add(body, lid, goldCoins, ruby1, sapphire1);
    chestGroup.scale.set(scale, scale, scale);
    return chestGroup;
  }

  private static createTinyCar(colorHex: string): THREE.Group {
    const car = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.22, metalness: 0.15 });
    const wheelMat = this.getMat('tinyWheelRubber', () => new THREE.MeshStandardMaterial({ color: '#1E272E', roughness: 0.7 }));
    const chromeMat = this.getMat('tinyChromeBezel', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', metalness: 0.92, roughness: 0.1 }));

    // Thân xe bo tròn mềm mại
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.24, 0.38, 4, 0.06), bodyMat);
    body.position.y = 0.16;
    body.castShadow = true;

    const cabin = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.2, 0.34, 3, 0.05), bodyMat);
    cabin.position.set(-0.04, 0.33, 0);

    // 4 Bánh xe cao su có mâm mạ crôm
    const wheelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const hubGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.055, 10);
    hubGeo.rotateZ(Math.PI / 2);

    const wPos = [
      [-0.18, 0.09, 0.19], [0.18, 0.09, 0.19],
      [-0.18, 0.09, -0.19], [0.18, 0.09, -0.19]
    ];
    wPos.forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(wx, wy, wz);
      const h = new THREE.Mesh(hubGeo, chromeMat);
      h.position.set(wx, wy, wz);
      car.add(w, h);
    });

    car.add(body, cabin);
    car.scale.set(0.85, 0.85, 0.85);
    return car;
  }

  private static createWoodenBoat(colorHex: string): THREE.Group {
    const boat = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.52 });
    const bambooMat = this.getMat('bambooWoven', () => new THREE.MeshStandardMaterial({ color: '#F39C12', roughness: 0.6 }));

    // Vỏ ghe tam bản uốn cong vểnh hai đầu
    const hull = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.15, 0.26, 3, 0.03), woodMat);
    hull.position.y = 0.08;
    hull.castShadow = true;

    // Mui vòm tre đan che nắng mưa
    const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.32, 16, 1, false, 0, Math.PI), bambooMat);
    canopy.rotation.z = Math.PI / 2;
    canopy.position.set(0, 0.18, 0);

    // Đèn bão treo đầu mũi thuyền phát sáng ấm
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), this.getMat('boatLanternGlow', () => new THREE.MeshStandardMaterial({
      color: '#FFEAA7',
      emissive: '#FFEAA7',
      emissiveIntensity: 0.9
    })));
    lantern.position.set(0.28, 0.18, 0);

    boat.add(hull, canopy, lantern);
    return boat;
  }

  private static createMiniPalmTree(): THREE.Group {
    const palm = new THREE.Group();
    const trunkMat = this.getMat('palmTrunkBrown', () => new THREE.MeshStandardMaterial({ color: '#5D4037', roughness: 0.65 }));
    const leafMat = this.getMat('palmFrondGreen', () => new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.35 }));
    const coconutMat = this.getMat('coconutBrown', () => new THREE.MeshStandardMaterial({ color: '#3E2723', roughness: 0.7 }));

    // Thân dừa uốn cong tự nhiên gồm 3 đốt
    const trunkLower = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.45, 14), trunkMat);
    trunkLower.position.set(0.02, 0.22, 0);
    trunkLower.rotation.z = -0.08;

    const trunkUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, 0.48, 14), trunkMat);
    trunkUpper.position.set(0.09, 0.64, 0);
    trunkUpper.rotation.z = -0.22;
    trunkUpper.castShadow = true;

    palm.add(trunkLower, trunkUpper);

    // 6 Tàu dừa cong rủ xuống mềm mại
    for (let l = 0; l < 6; l++) {
      const angle = (l / 6) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 10), leafMat);
      frond.scale.set(1.4, 0.15, 0.55);
      frond.position.set(0.16 + Math.cos(angle) * 0.22, 0.88, Math.sin(angle) * 0.22);
      frond.rotation.y = angle;
      frond.rotation.z = -0.45;
      palm.add(frond);
    }

    // Chùm dừa 3 quả tròn dưới nách lá
    for (let c = 0; c < 3; c++) {
      const cAngle = (c / 3) * Math.PI * 2;
      const nut = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), coconutMat);
      nut.position.set(0.14 + Math.cos(cAngle) * 0.06, 0.82, Math.sin(cAngle) * 0.06);
      palm.add(nut);
    }

    palm.scale.set(0.85, 0.85, 0.85);
    return palm;
  }

  private static createMiniPineTree(): THREE.Group {
    const pine = new THREE.Group();
    const trunkMat = this.getMat('pineTrunkBark', () => new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.7 }));
    const pineLeafMat = this.getMat('pineNeedleGreen', () => new THREE.MeshStandardMaterial({ color: '#1B4F72', roughness: 0.38 }));

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 0.65, 12), trunkMat);
    trunk.position.y = 0.32;
    trunk.castShadow = true;

    // 3 Tầng nón thông xòe tròn mềm mại
    const makeTier = (y: number, r: number, h: number) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 18), pineLeafMat);
      cone.position.y = y;
      cone.castShadow = true;
      pine.add(cone);
    };
    makeTier(0.52, 0.38, 0.44);
    makeTier(0.78, 0.30, 0.40);
    makeTier(1.02, 0.22, 0.34);

    pine.add(trunk);
    pine.scale.set(0.8, 0.8, 0.8);
    return pine;
  }

  private static createMiniMangroveTree(): THREE.Group {
    const mangrove = new THREE.Group();
    const woodMat = this.getMat('mangroveWoodRoot', () => new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.75 }));
    const leafMat = this.getMat('mangroveCanopyGreen', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.38 }));

    // 5 Rễ chùm uốn vòm cắm xuống đất
    for (let r = 0; r < 5; r++) {
      const a = (r / 5) * Math.PI * 2;
      const root = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.038, 0.38, 10), woodMat);
      root.position.set(Math.cos(a) * 0.14, 0.16, Math.sin(a) * 0.14);
      root.rotation.z = Math.cos(a) * 0.45;
      root.rotation.x = Math.sin(a) * 0.45;
      mangrove.add(root);
    }

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.068, 0.42, 12), woodMat);
    trunk.position.y = 0.42;

    // Tán cây đước tròn mịn bồng bềnh
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 14), leafMat);
    canopy.scale.set(1.2, 0.8, 1.2);
    canopy.position.y = 0.74;
    canopy.castShadow = true;

    mangrove.add(trunk, canopy);
    mangrove.scale.set(0.8, 0.8, 0.8);
    return mangrove;
  }

  private static create3DQuestionMark(): THREE.Group {
    const qGroup = new THREE.Group();
    const goldMat = this.getMat('questionMarkShinyGold', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F39C12',
      emissiveIntensity: 0.6,
      metalness: 0.88,
      roughness: 0.15
    }));

    // Cung uốn vòng của dấu hỏi bằng Torus bo tròn
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.05, 14, 24, Math.PI * 1.35), goldMat);
    arc.position.set(0, 0.34, 0);
    arc.rotation.z = -Math.PI / 1.32;

    const stem = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.14, 0.08, 3, 0.02), goldMat);
    stem.position.set(0, 0.18, 0);

    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 12), goldMat);
    dot.position.set(0, 0.035, 0);

    qGroup.add(arc, stem, dot);
    return qGroup;
  }
}
