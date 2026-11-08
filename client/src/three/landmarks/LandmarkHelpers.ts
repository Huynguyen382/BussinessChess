import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { LandmarkMaterials } from './LandmarkMaterials';

/**
 * Các mô hình bổ trợ chi tiết: thuyền ghe tam bản, xe hơi tí hon, cây dừa, cây thông, cây đước, rương vàng, dấu hỏi 3D
 */
export class LandmarkHelpers {
  public static createTreasureChestMini(scale = 1.0): THREE.Group {
    const chestGroup = new THREE.Group();
    const woodMat = LandmarkMaterials.getMat('chestWoodDark', () => new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.55 }));
    const goldMat = LandmarkMaterials.getMat('shinyGoldTreasure', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F39C12',
      emissiveIntensity: 0.45,
      metalness: 0.9,
      roughness: 0.15
    }));
    const gemRubyMat = LandmarkMaterials.getMat('gemRubyGlow', () => new THREE.MeshStandardMaterial({ color: '#FF3838', emissive: '#FF3838', emissiveIntensity: 0.8 }));
    const gemCyanMat = LandmarkMaterials.getMat('gemCyanGlow', () => new THREE.MeshStandardMaterial({ color: '#00CEC9', emissive: '#00CEC9', emissiveIntensity: 0.8 }));

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

  public static createTinyCar(colorHex: string): THREE.Group {
    const car = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.22, metalness: 0.15 });
    const wheelMat = LandmarkMaterials.getMat('tinyWheelRubber', () => new THREE.MeshStandardMaterial({ color: '#1E272E', roughness: 0.7 }));
    const chromeMat = LandmarkMaterials.getMat('tinyChromeBezel', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', metalness: 0.92, roughness: 0.1 }));

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

  public static createWoodenBoat(colorHex: string): THREE.Group {
    const boat = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.52 });
    const bambooMat = LandmarkMaterials.getMat('bambooWoven', () => new THREE.MeshStandardMaterial({ color: '#F39C12', roughness: 0.6 }));

    // Vỏ ghe tam bản uốn cong vểnh hai đầu
    const hull = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.15, 0.26, 3, 0.03), woodMat);
    hull.position.y = 0.08;
    hull.castShadow = true;

    // Mui vòm tre đan che nắng mưa
    const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.32, 16, 1, false, 0, Math.PI), bambooMat);
    canopy.rotation.z = Math.PI / 2;
    canopy.position.set(0, 0.18, 0);

    // Đèn bão treo đầu mũi thuyền phát sáng ấm
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), LandmarkMaterials.getMat('boatLanternGlow', () => new THREE.MeshStandardMaterial({
      color: '#FFEAA7',
      emissive: '#FFEAA7',
      emissiveIntensity: 0.9
    })));
    lantern.position.set(0.28, 0.18, 0);

    boat.add(hull, canopy, lantern);
    return boat;
  }

  public static createMiniPalmTree(): THREE.Group {
    const palm = new THREE.Group();
    const trunkMat = LandmarkMaterials.getMat('palmTrunkBrown', () => new THREE.MeshStandardMaterial({ color: '#5D4037', roughness: 0.65 }));
    const leafMat = LandmarkMaterials.getMat('palmFrondGreen', () => new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.35 }));
    const coconutMat = LandmarkMaterials.getMat('coconutBrown', () => new THREE.MeshStandardMaterial({ color: '#3E2723', roughness: 0.7 }));

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

  public static createMiniPineTree(): THREE.Group {
    const pine = new THREE.Group();
    const trunkMat = LandmarkMaterials.getMat('pineTrunkBark', () => new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.7 }));
    const pineLeafMat = LandmarkMaterials.getMat('pineNeedleGreen', () => new THREE.MeshStandardMaterial({ color: '#1B4F72', roughness: 0.38 }));

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

  public static createMiniMangroveTree(): THREE.Group {
    const mangrove = new THREE.Group();
    const woodMat = LandmarkMaterials.getMat('mangroveWoodRoot', () => new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.75 }));
    const leafMat = LandmarkMaterials.getMat('mangroveCanopyGreen', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.38 }));

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

  public static create3DQuestionMark(): THREE.Group {
    const qGroup = new THREE.Group();
    const goldMat = LandmarkMaterials.getMat('questionMarkShinyGold', () => new THREE.MeshStandardMaterial({
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
