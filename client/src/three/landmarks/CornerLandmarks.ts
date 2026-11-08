import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { LandmarkMaterials } from './LandmarkMaterials';
import { LandmarkHelpers } from './LandmarkHelpers';

/**
 * 4 Mô hình kiến trúc hoành tráng tại 4 góc bàn cờ (Corner Tiles)
 * 1. Ô 0: Khởi Hành (GO)
 * 2. Ô 10: Nhà Tù / Thăm Tù (Jail / Just Visiting)
 * 3. Ô 20: Bãi Đỗ Xe Miễn Phí (Free Parking)
 * 4. Ô 30: Vào Tù Ngay (Go To Jail)
 */
export class CornerLandmarks {
  // =========================================================================
  // 1. Ô 0: KHỞI HÀNH (GO) - CỔNG CHÀO KHẢI HOÀN MÔN & RƯƠNG VÀNG THỊNH VƯỢNG
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
    const chestGroup = LandmarkHelpers.createTreasureChestMini(0.8);
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
    group.add(LandmarkMaterials.createContactShadow(2.4, 2.4, 0.55));

    const stoneMat = LandmarkMaterials.getMat('graniteStone', () => new THREE.MeshStandardMaterial({
      color: '#57606F',
      roughness: 0.75,
      metalness: 0.15
    }));
    const ironMat = LandmarkMaterials.getMat('jailIron', () => new THREE.MeshStandardMaterial({
      color: '#2F3542',
      roughness: 0.35,
      metalness: 0.85
    }));
    const alertMat = LandmarkMaterials.getMat('alertOrange', () => new THREE.MeshStandardMaterial({
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
    group.add(LandmarkMaterials.createContactShadow(2.4, 2.4, 0.55));

    const asphaltMat = LandmarkMaterials.getMat('asphaltGray', () => new THREE.MeshStandardMaterial({
      color: '#34495E',
      roughness: 0.65
    }));
    const blueSignMat = LandmarkMaterials.getMat('blueSign', () => new THREE.MeshStandardMaterial({
      color: '#0984E3',
      emissive: '#0984E3',
      emissiveIntensity: 0.35,
      roughness: 0.2
    }));
    const whiteMat = LandmarkMaterials.getMat('pureWhite', () => new THREE.MeshStandardMaterial({
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
    const carMini = LandmarkHelpers.createTinyCar('#00B894');
    carMini.position.set(0.2, 0.16, 0.2);
    carMini.rotation.y = -Math.PI / 4;

    // Rào chắn barie sọc đỏ trắng
    const barrierPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 8), LandmarkMaterials.getMat('barrierYellow', () => new THREE.MeshStandardMaterial({ color: '#F1C40F' })));
    barrierPost.position.set(-0.25, 0.35, -0.75);

    const barrierArm = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.05, 0.05, 2, 0.01), LandmarkMaterials.getMat('barrierRed', () => new THREE.MeshStandardMaterial({ color: '#E84118' })));
    barrierArm.position.set(0.2, 0.45, -0.75);

    group.add(pole, signBoard, pStem, pLoop, carMini, barrierPost, barrierArm);
    return group;
  }

  // =========================================================================
  // 4. Ô 30: VÀO TÙ NGAY (GO TO JAIL) - BỤC QUAN TÒA, CÒI HỤ & CÒNG TAY
  // =========================================================================
  public static createGoToJailCorner(): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(2.4, 2.4, 0.55));

    const woodDarkMat = LandmarkMaterials.getMat('woodDark', () => new THREE.MeshStandardMaterial({
      color: '#4A2311',
      roughness: 0.45
    }));
    const silverMat = LandmarkMaterials.getMat('polishedSilver', () => new THREE.MeshStandardMaterial({
      color: '#DFE6E9',
      metalness: 0.9,
      roughness: 0.15
    }));
    const sirenRed = LandmarkMaterials.getMat('sirenRed', () => new THREE.MeshStandardMaterial({
      color: '#D63031',
      emissive: '#FF3838',
      emissiveIntensity: 0.9,
      roughness: 0.1
    }));
    const sirenBlue = LandmarkMaterials.getMat('sirenBlue', () => new THREE.MeshStandardMaterial({
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
}
