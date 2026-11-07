import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { sounds } from '../components/AudioSynth';
import { VFXManager } from './VFXManager';

export class BuildingMesh {
  public group: THREE.Group;
  private buildingMap: Map<number, THREE.Group> = new Map();
  private vfxManager: VFXManager | null = null;
  private animatedSpireLandmarks: THREE.Mesh[] = [];

  constructor() {
    this.group = new THREE.Group();
  }

  public setVFXManager(vfx: VFXManager) {
    this.vfxManager = vfx;
  }

  public updateBuilding(tileId: number, level: number, position: THREE.Vector3, baseAngle: number) {
    let existing = this.buildingMap.get(tileId);
    if (existing) {
      this.group.remove(existing);
      this.buildingMap.delete(tileId);
    }

    if (level <= 0) return;

    const bGroup = new THREE.Group();
    bGroup.position.copy(position);
    bGroup.rotation.y = baseAngle;

    // Bóng tiếp xúc mềm mại dưới đáy công trình
    const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(45, 52, 54, 0.45)');
    grad.addColorStop(0.6, 'rgba(45, 52, 54, 0.18)');
    grad.addColorStop(1, 'rgba(45, 52, 54, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(shadowCanvas),
      transparent: true,
      depthWrite: false
    });
    const cShadow = new THREE.Mesh(shadowGeo, shadowMat);
    cShadow.rotation.x = -Math.PI / 2;
    cShadow.position.y = 0.02;
    bGroup.add(cShadow);

    if (level === 1) {
      // 🏡 Level 1: Nhà Gỗ Bắc Âu Bo Tròn Dễ Thương
      const baseMat = new THREE.MeshStandardMaterial({ color: '#FFFDF9', roughness: 0.35 });
      const base = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.58, 0.78, 4, 0.08), baseMat);
      base.position.y = 0.3;
      base.castShadow = true;

      // Mái ngói đỏ san hô bo cạnh
      const roofMat = new THREE.MeshStandardMaterial({ color: '#E84393', roughness: 0.3 });
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.72, 0.46, 4), roofMat);
      roof.position.y = 0.82;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;

      // Cửa sổ phát sáng vàng ấm cúng
      const winMat = new THREE.MeshStandardMaterial({ color: '#FFEAA7', emissive: '#FFEAA7', emissiveIntensity: 0.7 });
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), winMat);
      win.position.set(0, 0.32, 0.4);

      // Cửa gỗ nhỏ
      const doorMat = new THREE.MeshStandardMaterial({ color: '#D63031', roughness: 0.5 });
      const door = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.32), doorMat);
      door.position.set(0, 0.17, 0.4);

      // Ống khói gạch đỏ
      const chimneyMat = new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.6 });
      const chimney = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.36, 0.14, 2, 0.02), chimneyMat);
      chimney.position.set(0.22, 0.88, 0.16);

      bGroup.add(base, roof, win, door, chimney);
    } else if (level === 2) {
      // 🏰 Level 2: Biệt Thự 2 Tầng Sang Trọng
      const f1Mat = new THREE.MeshStandardMaterial({ color: '#FFFDF9', roughness: 0.35 });
      const f1 = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.48, 0.9, 4, 0.08), f1Mat);
      f1.position.y = 0.25;
      f1.castShadow = true;

      const f2Mat = new THREE.MeshStandardMaterial({ color: '#FFEAA7', roughness: 0.35 });
      const f2 = new THREE.Mesh(new RoundedBoxGeometry(0.74, 0.5, 0.74, 4, 0.08), f2Mat);
      f2.position.y = 0.72;
      f2.castShadow = true;

      // Ban công tầng 2 viền trắng
      const balconyMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 });
      const balcony = new THREE.Mesh(new RoundedBoxGeometry(0.85, 0.12, 0.22, 2, 0.02), balconyMat);
      balcony.position.set(0, 0.5, 0.45);

      // Chậu hoa đỏ trên ban công
      const flowerMat = new THREE.MeshStandardMaterial({ color: '#FF7675', emissive: '#FF7675', emissiveIntensity: 0.3 });
      const flowers = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.1), flowerMat);
      flowers.position.set(0, 0.58, 0.45);

      const roofMat = new THREE.MeshStandardMaterial({ color: '#FF7675', roughness: 0.28 });
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.48, 4), roofMat);
      roof.position.y = 1.2;
      roof.rotation.y = Math.PI / 4;

      bGroup.add(f1, f2, balcony, flowers, roof);
    } else if (level === 3) {
      // 🏙️ Level 3: Tòa Cao Ốc Phức Hợp Hiện Đại
      const baseMat = new THREE.MeshStandardMaterial({ color: '#F1F2F6', roughness: 0.25 });
      const base = new THREE.Mesh(new RoundedBoxGeometry(1.0, 1.05, 1.0, 4, 0.1), baseMat);
      base.position.y = 0.53;
      base.castShadow = true;

      // Tháp kính vát góc phản chiếu bầu trời xanh
      const towerMat = new THREE.MeshStandardMaterial({
        color: '#74B9FF',
        roughness: 0.15,
        metalness: 0.1,
        emissive: '#0984E3',
        emissiveIntensity: 0.15
      });
      const tower = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.65, 0.6, 4, 0.06), towerMat);
      tower.position.y = 1.35;

      // Ăng-ten thu phát viễn thông mạ vàng
      const antennaMat = new THREE.MeshStandardMaterial({ color: '#FDCB6E', metalness: 0.8, roughness: 0.2 });
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55, 8), antennaMat);
      antenna.position.y = 1.9;

      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 10, 10),
        new THREE.MeshStandardMaterial({ color: '#D63031', emissive: '#D63031', emissiveIntensity: 0.8 })
      );
      orb.position.y = 2.2;

      bGroup.add(base, tower, antenna, orb);
    } else if (level === 4) {
      // 💎 Level 4: Khách Sạn Landmark 5 Sao Pha Lê Lộng Lẫy
      const towerMat = new THREE.MeshStandardMaterial({
        color: '#0984E3',
        emissive: '#00cec9',
        emissiveIntensity: 0.38,
        roughness: 0.12,
        metalness: 0.2
      });
      const tower = new THREE.Mesh(new RoundedBoxGeometry(1.1, 2.05, 1.1, 6, 0.12), towerMat);
      tower.position.y = 1.05;
      tower.castShadow = true;

      // Cột chóp vương miện mạ vàng
      const crownMat = new THREE.MeshStandardMaterial({
        color: '#FDCB6E',
        emissive: '#FDCB6E',
        emissiveIntensity: 0.45,
        metalness: 0.85,
        roughness: 0.18
      });
      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.95, 8), crownMat);
      crown.position.y = 2.5;

      // Quả cầu pha lê vàng phát sáng trên đỉnh tháp
      const orbMat = new THREE.MeshStandardMaterial({
        color: '#FFF275',
        emissive: '#FFF275',
        emissiveIntensity: 0.95,
        roughness: 0.08
      });
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 20), orbMat);
      orb.position.y = 3.1;

      this.animatedSpireLandmarks.push(orb);
      bGroup.add(tower, crown, orb);
    }

    // Hoạt ảnh nảy lò xo đàn hồi (Elastic Pop-in Bounce)
    bGroup.scale.set(0.01, 0.01, 0.01);
    this.animateBounce(bGroup);

    this.group.add(bGroup);
    this.buildingMap.set(tileId, bGroup);
    sounds.playBuild();

    if (this.vfxManager) {
      this.vfxManager.spawnShockwave(position, level === 4 ? '#FDCB6E' : '#00B894', 2.8);
      this.vfxManager.spawnStarBurst(position, 16, level === 4 ? 0xFDCB6E : 0x00B894);
    }
  }

  private animateBounce(group: THREE.Group) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.07;
      const s = Math.sin(progress * Math.PI * 0.75) * 1.18;
      if (progress >= 1) {
        group.scale.set(1, 1, 1);
        clearInterval(interval);
      } else {
        group.scale.set(s, s, s);
      }
    }, 16);
  }

  public update(delta: number) {
    for (const orb of this.animatedSpireLandmarks) {
      orb.rotation.y += delta * 2.2;
    }
  }

  public clear() {
    for (const b of this.buildingMap.values()) {
      this.group.remove(b);
    }
    this.buildingMap.clear();
    this.animatedSpireLandmarks = [];
  }
}
