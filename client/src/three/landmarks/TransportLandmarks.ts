import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { LandmarkMaterials } from './LandmarkMaterials';

/**
 * HỆ THỐNG 4 GA XE LỬA ĐẶC TẢ GỌN GÀNG (4 RAILROADS - TIER 3):
 * Chuẩn hóa tinh gọn cho cả 4 đầu mối đường sắt Bắc - Nam (Ô 5, 15, 25, 35)
 * theo đúng Mục 5 của MASTER_GRAPHICS_DESIGN.md:
 * - Đường ray sắt 3D trên nền sỏi đá dăm & tà vẹt gỗ nâu sẫm
 * - Đầu máy xe lửa hơi nước đen tuyền viền vàng đồng + 3 cụm khói mây trắng tròn mập
 * - Cột đèn tín hiệu đường sắt có 2 đèn tròn xanh - đỏ nhấp nháy nhịp nhàng
 * - Không dựng nhà ga cồng kềnh che khuất góc nhìn
 */
export class TransportLandmarks {
  public static createRailroadModel(_tileId: number): THREE.Group {
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
      opacity: 0.94
    }));
    const smokePuffs = [
      [-0.04, 0.96, 0.32, 0.13],
      [-0.08, 1.12, 0.24, 0.17],
      [0.01, 1.30, 0.14, 0.21]
    ];
    smokePuffs.forEach(([sx, sy, sz, sr]) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(sr, 14, 12), smokeMat);
      puff.position.set(sx, sy, sz);
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
