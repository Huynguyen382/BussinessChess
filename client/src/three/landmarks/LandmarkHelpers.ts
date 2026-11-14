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
    const bodyMat = LandmarkMaterials.getMat(`tinyCarBody_${colorHex}`, () => new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.22, metalness: 0.15 }));
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
    const woodMat = LandmarkMaterials.getMat(`woodenBoatHull_${colorHex}`, () => new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.52 }));
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

  /**
   * Tạo hình ngôi sao vàng 5 cánh đúng chuẩn tỷ lệ Quốc kỳ Việt Nam (10 đỉnh đa giác)
   */
  public static create5PointStarShape(outerRadius = 0.068, innerRadius = 0.026): THREE.Shape {
    const shape = new THREE.Shape();
    const points = 5;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = Math.PI / 2 + (i * Math.PI) / points;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }

  /**
   * Thuyền thúng nan truyền thống làng chài Cửa Lò
   */
  public static createBasketBoat(scale = 1.0): THREE.Group {
    const boat = new THREE.Group();
    const wovenBambooMat = LandmarkMaterials.getMat('wovenBambooMat', () => new THREE.MeshStandardMaterial({
      color: '#E5A93C',
      roughness: 0.65
    }));
    const tarBaseMat = LandmarkMaterials.getMat('tarBaseMat', () => new THREE.MeshStandardMaterial({
      color: '#2C3437',
      roughness: 0.8
    }));
    const rimWoodMat = LandmarkMaterials.getMat('rimWoodMat', () => new THREE.MeshStandardMaterial({
      color: '#8D5B29',
      roughness: 0.5
    }));

    // Thân thúng nan hình bán cầu tròn
    const hullGeo = new THREE.SphereGeometry(0.19, 18, 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
    const hull = new THREE.Mesh(hullGeo, wovenBambooMat);
    hull.rotation.x = Math.PI;
    hull.position.y = 0.11;
    hull.castShadow = true;

    // Đáy thúng trét chai / nhựa đường chống thấm nước
    const tarBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.04, 16), tarBaseMat);
    tarBottom.position.y = 0.02;

    // Vành thúng uốn nan tre dày dặn
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.02, 8, 24), rimWoodMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.11;

    // Thanh ngang gác giữa lòng thúng để ngồi chèo
    const seatThwart = new THREE.Mesh(new RoundedBoxGeometry(0.35, 0.02, 0.06, 2, 0.005), rimWoodMat);
    seatThwart.position.set(0, 0.09, 0);

    // Mái chèo gỗ gác chéo miệng thúng
    const oarShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.38, 8), rimWoodMat);
    oarShaft.position.set(0.05, 0.12, 0.04);
    oarShaft.rotation.z = 0.85;
    oarShaft.rotation.y = 0.3;

    const oarBlade = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.1, 0.008, 2, 0.002), rimWoodMat);
    oarBlade.position.set(0.19, 0.04, 0.08);
    oarBlade.rotation.z = 0.85;

    boat.add(hull, tarBottom, rim, seatThwart, oarShaft, oarBlade);
    boat.scale.set(scale, scale, scale);
    return boat;
  }

  /**
   * Thuyền nan chèo đò du lịch Tràng An / Tam Cốc
   */
  public static createSampanBoat(scale = 1.0): THREE.Group {
    const sampan = new THREE.Group();
    const woodMat = LandmarkMaterials.getMat('sampanDarkWood', () => new THREE.MeshStandardMaterial({
      color: '#5C381E',
      roughness: 0.55
    }));
    const seatMat = LandmarkMaterials.getMat('sampanSeatWood', () => new THREE.MeshStandardMaterial({
      color: '#8A5832',
      roughness: 0.45
    }));
    const metalMat = LandmarkMaterials.getMat('sampanOarlockMat', () => new THREE.MeshStandardMaterial({
      color: '#7F8C8D',
      metalness: 0.7,
      roughness: 0.3
    }));

    // Thân thuyền nan thon dài vểnh hai đầu
    const hull = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.11, 0.22, 3, 0.02), woodMat);
    hull.position.y = 0.065;
    hull.castShadow = true;

    // Mũi và đuôi thuyền uốn cong nhẹ
    const prow = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 10), woodMat);
    prow.rotation.z = -Math.PI / 2.3;
    prow.position.set(0.36, 0.1, 0);

    const stern = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.2, 10), woodMat);
    stern.rotation.z = Math.PI / 2.3;
    stern.position.set(-0.36, 0.1, 0);

    // Ghế ngồi bằng ván gỗ cho khách và người chèo
    [-0.15, 0.02, 0.18].forEach(sx => {
      const seat = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.02, 0.18, 2, 0.004), seatMat);
      seat.position.set(sx, 0.09, 0);
      sampan.add(seat);
    });

    // Mái chèo nan đôi đặt ở khoang lái phía sau
    [-0.09, 0.09].forEach(sideZ => {
      const oar = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.42, 8), seatMat);
      oar.position.set(-0.24, 0.12, sideZ);
      oar.rotation.x = sideZ > 0 ? -0.45 : 0.45;
      oar.rotation.z = 0.35;

      const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.04, 6), metalMat);
      lock.position.set(-0.22, 0.11, sideZ * 1.15);

      sampan.add(oar, lock);
    });

    sampan.add(hull, prow, stern);
    sampan.scale.set(scale, scale, scale);
    return sampan;
  }

  /**
   * Thuyền khám phá hang động ngầm Phong Nha - Kẻ Bàng có đèn rọi thám hiểm
   */
  public static createCaveExplorationBoat(scale = 1.0): THREE.Group {
    const boat = new THREE.Group();
    const boatHullMat = LandmarkMaterials.getMat('caveBoatHullMat', () => new THREE.MeshStandardMaterial({
      color: '#2980B9',
      roughness: 0.35,
      metalness: 0.2
    }));
    const cabinMat = LandmarkMaterials.getMat('caveBoatTrimMat', () => new THREE.MeshStandardMaterial({
      color: '#ECF0F1',
      roughness: 0.3
    }));
    const headlampGlowMat = LandmarkMaterials.getMat('caveBoatHeadlampGlow', () => new THREE.MeshStandardMaterial({
      color: '#FFF275',
      emissive: '#F1C40F',
      emissiveIntensity: 1.5,
      roughness: 0.1
    }));
    const lightBeamMat = LandmarkMaterials.getMat('caveBoatBeamCone', () => new THREE.MeshBasicMaterial({
      color: '#FFF9C4',
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    }));

    // Thân xuồng du lịch sông ngầm
    const hull = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.13, 0.24, 3, 0.025), boatHullMat);
    hull.position.y = 0.07;
    hull.castShadow = true;

    // Mũi nhọn rẽ nước
    const bowProw = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.24, 8), boatHullMat);
    bowProw.rotation.z = -Math.PI / 2.25;
    bowProw.position.set(0.35, 0.09, 0);

    // Vành be xuồng màu trắng
    const trim = new THREE.Mesh(new RoundedBoxGeometry(0.64, 0.03, 0.22, 2, 0.005), cabinMat);
    trim.position.y = 0.13;

    // Băng ghế cho du khách tham quan
    [-0.14, 0.02, 0.16].forEach(bx => {
      const bench = new THREE.Mesh(new RoundedBoxGeometry(0.09, 0.02, 0.18, 2, 0.004), cabinMat);
      bench.position.set(bx, 0.1, 0);
      boat.add(bench);
    });

    // Đèn pha rọi thám hiểm đặt trên mũi thuyền
    const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8), cabinMat);
    lampPost.position.set(0.32, 0.16, 0);

    const lampHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.022, 0.05, 12), boatHullMat);
    lampHousing.rotation.z = -Math.PI / 2;
    lampHousing.position.set(0.35, 0.21, 0);

    const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), headlampGlowMat);
    lampBulb.position.set(0.375, 0.21, 0);

    // Luồng sáng quét vào lòng hang ngọc bích
    const beamGeo = new THREE.ConeGeometry(0.24, 0.75, 16, 1, true);
    beamGeo.translate(0, -0.375, 0);
    const lightBeam = new THREE.Mesh(beamGeo, lightBeamMat);
    lightBeam.rotation.z = Math.PI / 2 + 0.08;
    lightBeam.position.set(0.38, 0.21, 0);

    boat.add(hull, bowProw, trim, lampPost, lampHousing, lampBulb, lightBeam);
    boat.scale.set(scale, scale, scale);
    return boat;
  }
}
