import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { LandmarkMaterials } from './LandmarkMaterials';
import { LandmarkHelpers } from './LandmarkHelpers';

/**
 * Các ô đặc biệt trên bàn cờ:
 * - Tiện ích công cộng (Utilities): Thủy Điện Sơn La (12), Nhà Máy Nước Thủ Đức (28)
 * - Cơ Hội (Chance) & Khí Vận (Community Chest)
 * - Thuế (Taxes): Thuế Thu Nhập (4), Thuế Xa Xỉ (38)
 */
export class SpecialTileLandmarks {
  // =========================================================================
  // TIỆN ÍCH CÔNG CỘNG: ĐIỆN LỰC (12) & NƯỚC SẠCH (28)
  // =========================================================================
  public static createUtilityModel(tileId: number): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(1.2, 1.2, 0.42));

    if (tileId === 12) {
      // ⚡ CÔNG TY ĐIỆN LỰC: Trụ điện cao thế giàn thép & Quả cầu sét phát quang
      const steelMat = LandmarkMaterials.getMat('towerSteel', () => new THREE.MeshStandardMaterial({
        color: '#BDC3C7',
        metalness: 0.85,
        roughness: 0.25
      }));
      const lightningMat = LandmarkMaterials.getMat('lightningGold', () => new THREE.MeshStandardMaterial({
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
      const insuMat = LandmarkMaterials.getMat('ceramicInsulator', () => new THREE.MeshStandardMaterial({ color: '#00CEC9', roughness: 0.2 }));
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
      const tankMat = LandmarkMaterials.getMat('waterTankAqua', () => new THREE.MeshStandardMaterial({
        color: '#0984E3',
        emissive: '#74B9FF',
        emissiveIntensity: 0.25,
        roughness: 0.2,
        metalness: 0.3
      }));
      const pipeMat = LandmarkMaterials.getMat('chromePipe', () => new THREE.MeshStandardMaterial({
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
      const valveMat = LandmarkMaterials.getMat('valveRed', () => new THREE.MeshStandardMaterial({ color: '#D63031', roughness: 0.3 }));
      const valve = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 8, 16), valveMat);
      valve.position.set(0.14, 0.45, 0);
      valve.rotation.y = Math.PI / 2;

      group.add(tankBody, tankRoof, mainPipe, valve);
    }

    group.scale.set(0.85, 0.85, 0.85);
    return group;
  }

  // =========================================================================
  // Ô CƠ HỘI & KHÍ VẬN: HỘP QUÀ BẤT NGỜ & RƯƠNG VÀNG CHÂU BÁU
  // =========================================================================
  public static createCardTileModel(isChance: boolean): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(1.1, 1.1, 0.42));

    if (isChance) {
      // ❓ CƠ HỘI: Hộp quà kỳ diệu & Dấu hỏi vàng 3D
      const boxMat = LandmarkMaterials.getMat('chanceBoxMat', () => new THREE.MeshStandardMaterial({
        color: '#FF7675',
        roughness: 0.25,
        emissive: '#D63031',
        emissiveIntensity: 0.15
      }));
      const ribbonMat = LandmarkMaterials.getMat('ribbonGoldMat', () => new THREE.MeshStandardMaterial({
        color: '#FDCB6E',
        metalness: 0.8,
        roughness: 0.2
      }));

      // Hộp quà bo góc
      const box = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.6, 0.7, 3, 0.06), boxMat);
      box.position.set(0, 0.3, 0);
      box.castShadow = true;

      // Nơ ruy băng vàng quấn quanh hộp bo viền mềm mại
      const ribH = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.1, 0.72, 2, 0.015), ribbonMat);
      ribH.position.set(0, 0.3, 0);
      const ribV = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.62, 0.72, 2, 0.015), ribbonMat);
      ribV.position.set(0, 0.3, 0);

      // Dấu hỏi vàng 3D xoay nổi phía trên
      const questionMark = LandmarkHelpers.create3DQuestionMark();
      questionMark.position.set(0, 0.85, 0);

      group.add(box, ribH, ribV, questionMark);
    } else {
      // 🎁 KHÍ VẬN: Rương kho báu gỗ bọc đai đồng hé mở lộ tiền vàng
      const chest = LandmarkHelpers.createTreasureChestMini(1.0);
      chest.position.set(0, 0.04, 0);
      group.add(chest);
    }

    group.scale.set(0.9, 0.9, 0.9);
    return group;
  }

  // =========================================================================
  // Ô THUẾ: KÉT SẮT TÀI CHÍNH (4) & KIM CƯƠNG XA XỈ (38)
  // =========================================================================
  public static createTaxModel(tileId: number): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(1.15, 1.15, 0.45));

    if (tileId === 4) {
      // 💸 THUẾ THU NHẬP: Két sắt bảo an ngân hàng màu xanh than
      const safeMat = LandmarkMaterials.getMat('safeSteel', () => new THREE.MeshStandardMaterial({
        color: '#2C3E50',
        metalness: 0.82,
        roughness: 0.28
      }));
      const goldMat = LandmarkMaterials.getMat('shinyGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.85, roughness: 0.15 }));

      const safe = new THREE.Mesh(new RoundedBoxGeometry(0.75, 0.85, 0.7, 4, 0.06), safeMat);
      safe.position.set(0, 0.44, 0);
      safe.castShadow = true;

      // Tay quay vô-lăng két sắt bằng vàng
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 8, 16), goldMat);
      wheel.position.set(0, 0.46, 0.36);

      // Bao tải tiền vải bố bên cạnh
      const sackMat = LandmarkMaterials.getMat('moneySack', () => new THREE.MeshStandardMaterial({ color: '#D2B48C', roughness: 0.8 }));
      const sack = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), sackMat);
      sack.scale.set(1.0, 1.25, 1.0);
      sack.position.set(0.48, 0.24, 0.15);

      group.add(safe, wheel, sack);

    } else {
      // 💎 THUẾ XA XỈ: Kim Cương Pha Lê khổng lồ giác cắt rực rỡ
      const diamondMat = LandmarkMaterials.getMat('luxuryDiamond', () => new THREE.MeshStandardMaterial({
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
      const pedMat = LandmarkMaterials.getMat('shinyGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.85, roughness: 0.15 }));
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
}
