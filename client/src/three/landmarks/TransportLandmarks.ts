import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { LandmarkMaterials } from './LandmarkMaterials';

/**
 * 4 Ô Phương Tiện Giao Thông & Bến Bãi (Railroads):
 * - Ô 5: Bến Xe Miền Tây (Xe Khách Lục Tỉnh & Nhà Chờ)
 * - Ô 15, 25, 35: Ga Sài Gòn, Ga Đà Nẵng, Ga Hà Nội (Đầu Máy Xe Lửa Hơi Nước Cổ Điển)
 */
export class TransportLandmarks {
  public static createRailroadModel(tileId: number): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(1.3, 1.4, 0.45));

    if (tileId === 5) {
      // 🚌 Ô 5: BẾN XE MIỀN TÂY - Xe Khách Lục Tỉnh & Nhà Chờ Bến Xe
      const busRedMat = LandmarkMaterials.getMat('coachRed', () => new THREE.MeshStandardMaterial({
        color: '#C0392B',
        roughness: 0.22,
        metalness: 0.15
      }));
      const creamMat = LandmarkMaterials.getMat('coachCream', () => new THREE.MeshStandardMaterial({
        color: '#FFFDF9',
        roughness: 0.25
      }));
      const windowMat = LandmarkMaterials.getMat('tintedGlass', () => new THREE.MeshStandardMaterial({
        color: '#1E272E',
        roughness: 0.1,
        metalness: 0.2
      }));
      const chromeMat = LandmarkMaterials.getMat('shinyChrome', () => new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        metalness: 0.95,
        roughness: 0.1
      }));
      const rubberMat = LandmarkMaterials.getMat('tireRubber', () => new THREE.MeshStandardMaterial({
        color: '#1E272E',
        roughness: 0.7
      }));

      // Bục bến xe lát gạch xám & gờ vỉa hè
      const platform = new THREE.Mesh(
        new RoundedBoxGeometry(1.25, 0.08, 1.35, 3, 0.03),
        LandmarkMaterials.getMat('stationPlatform', () => new THREE.MeshStandardMaterial({ color: '#747D8C', roughness: 0.5 }))
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
        LandmarkMaterials.getMat('luggageTan', () => new THREE.MeshStandardMaterial({ color: '#E67E22', roughness: 0.6 }))
      );
      luggage.position.set(-0.15, 0.66, -0.08);

      // Đèn pha trước mạ crôm & đèn hậu
      const headLampGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.03, 12);
      headLampGeo.rotateX(Math.PI / 2);
      const hlMat = LandmarkMaterials.getMat('headlampGlow', () => new THREE.MeshStandardMaterial({
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
        LandmarkMaterials.getMat('shelterBlue', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.3 }))
      );
      shelterRoof.position.set(0.38, 0.62, 0);

      const shelterPole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8), chromeMat);
      shelterPole1.position.set(0.38, 0.35, 0.42);
      const shelterPole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8), chromeMat);
      shelterPole2.position.set(0.38, 0.35, -0.42);

      // Biển tên bến xe nổi bật
      const signBoard = new THREE.Mesh(
        new RoundedBoxGeometry(0.36, 0.12, 0.04, 2, 0.01),
        LandmarkMaterials.getMat('signRed', () => new THREE.MeshStandardMaterial({ color: '#E84118', roughness: 0.3 }))
      );
      signBoard.position.set(0.38, 0.72, 0);

      group.add(busLower, busUpper, windows, rack, luggage, hl1, hl2, shelterRoof, shelterPole1, shelterPole2, signBoard);
      group.scale.set(0.88, 0.88, 0.88);
      return group;
    }

    // 🚂 Ô 15, 25, 35: GA SÀI GÒN, GA ĐÀ NẴNG, GA HÀ NỘI - Đầu Máy Xe Lửa Hơi Nước Cổ Điển
    const ironBlack = LandmarkMaterials.getMat('engineBlack', () => new THREE.MeshStandardMaterial({
      color: '#1E272E',
      metalness: 0.85,
      roughness: 0.25
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
      color: '#718093',
      metalness: 0.82,
      roughness: 0.25
    }));

    // A. Đoạn đường ray với các thanh tà vẹt gỗ sồi bo viền
    const woodSleeper = LandmarkMaterials.getMat('woodSleeper', () => new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.7 }));
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
    const cabWinMat = LandmarkMaterials.getMat('cabWinGlow', () => new THREE.MeshStandardMaterial({
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
    const smokeMat = LandmarkMaterials.getMat('smokeWhitePuff', () => new THREE.MeshStandardMaterial({
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
      LandmarkMaterials.getMat('headlampLens', () => new THREE.MeshStandardMaterial({
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
}
