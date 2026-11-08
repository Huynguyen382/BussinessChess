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

    // Đặt công trình ở nửa phía trước ô cờ (hướng về mặt đường/avenue),
    // nhường không gian phía sau cho mô hình kỳ quan Landmark 3D vươn cao
    const isSide3 = tileId > 20 && tileId < 30;
    const buildingZ = isSide3 ? 0.35 : -0.35;
    const modelSubGroup = new THREE.Group();
    modelSubGroup.position.set(0, 0, buildingZ);
    if (isSide3) {
      modelSubGroup.rotation.y = Math.PI;
    }
    bGroup.add(modelSubGroup);

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
    modelSubGroup.add(cShadow);

    if (level === 1) {
      // ==========================================
      // 🏡 Level 1: Nhà Gỗ Bắc Âu Ấm Cúng (Cozy Cottage)
      // ==========================================
      // Gờ chân móng bằng gạch thẻ xám
      const plinthMat = new THREE.MeshStandardMaterial({ color: '#718093', roughness: 0.65 });
      const plinth = new THREE.Mesh(new RoundedBoxGeometry(0.84, 0.1, 0.84, 2, 0.02), plinthMat);
      plinth.position.y = 0.05;
      plinth.receiveShadow = true;

      // Thân nhà tường kem ấm bo tròn
      const baseMat = new THREE.MeshStandardMaterial({ color: '#FFFDF9', roughness: 0.35 });
      const base = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.52, 0.78, 4, 0.08), baseMat);
      base.position.y = 0.34;
      base.castShadow = true;

      // Mái ngói đỏ san hô vát cạnh kim tự tháp
      const roofMat = new THREE.MeshStandardMaterial({ color: '#E84393', roughness: 0.3 });
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.74, 0.48, 4), roofMat);
      roof.position.y = 0.84;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;

      // Cửa sổ phát sáng vàng ấm cúng có khung chữ thập
      const winMat = new THREE.MeshStandardMaterial({
        color: '#FFEAA7',
        emissive: '#FFEAA7',
        emissiveIntensity: 0.85
      });
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), winMat);
      win.position.set(0, 0.4, 0.4);

      // Cửa gỗ nâu bo vòm có tay nắm đồng tí hon
      const doorMat = new THREE.MeshStandardMaterial({ color: '#A0522D', roughness: 0.5 });
      const door = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.34, 0.04, 2, 0.01), doorMat);
      door.position.set(0, 0.22, 0.4);

      const doorknob = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 8, 8),
        new THREE.MeshStandardMaterial({ color: '#FDCB6E', metalness: 0.9, roughness: 0.15 })
      );
      doorknob.position.set(0.08, 0.22, 0.43);

      // Ống khói gạch đỏ nhô lên trên mái ngói
      const chimneyMat = new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.6 });
      const chimney = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.38, 0.14, 2, 0.02), chimneyMat);
      chimney.position.set(0.22, 0.92, 0.16);

      modelSubGroup.add(plinth, base, roof, win, door, doorknob, chimney);

    } else if (level === 2) {
      // ==========================================
      // 🏰 Level 2: Biệt Thự 2 Tầng Sang Trọng (Luxury Villa)
      // ==========================================
      const plinthMat = new THREE.MeshStandardMaterial({ color: '#718093', roughness: 0.6 });
      const plinth = new THREE.Mesh(new RoundedBoxGeometry(0.96, 0.1, 0.96, 2, 0.02), plinthMat);
      plinth.position.y = 0.05;

      // Tầng 1
      const f1Mat = new THREE.MeshStandardMaterial({ color: '#FFFDF9', roughness: 0.35 });
      const f1 = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.48, 0.9, 4, 0.08), f1Mat);
      f1.position.y = 0.29;
      f1.castShadow = true;

      // Tầng 2 giật cấp
      const f2Mat = new THREE.MeshStandardMaterial({ color: '#FFEAA7', roughness: 0.35 });
      const f2 = new THREE.Mesh(new RoundedBoxGeometry(0.76, 0.5, 0.76, 4, 0.08), f2Mat);
      f2.position.y = 0.76;
      f2.castShadow = true;

      // Ban công tầng 2 viền trắng
      const balconyMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 });
      const balcony = new THREE.Mesh(new RoundedBoxGeometry(0.85, 0.12, 0.22, 2, 0.02), balconyMat);
      balcony.position.set(0, 0.54, 0.45);

      // Bồn hoa rực rỡ trên ban công
      const flowerMat = new THREE.MeshStandardMaterial({
        color: '#FF7675',
        emissive: '#FF7675',
        emissiveIntensity: 0.35
      });
      const flowers = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.12), flowerMat);
      flowers.position.set(0, 0.62, 0.45);

      // Mái ngói dốc kép
      const roofMat = new THREE.MeshStandardMaterial({ color: '#FF7675', roughness: 0.28 });
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.5, 4), roofMat);
      roof.position.y = 1.25;
      roof.rotation.y = Math.PI / 4;

      modelSubGroup.add(plinth, f1, f2, balcony, flowers, roof);

    } else if (level === 3) {
      // ==========================================
      // 🏙️ Level 3: Tòa Cao Ốc Phức Hợp Hiện Đại (Modern Skyscraper)
      // ==========================================
      const baseMat = new THREE.MeshStandardMaterial({ color: '#F1F2F6', roughness: 0.25 });
      const base = new THREE.Mesh(new RoundedBoxGeometry(1.02, 1.1, 1.02, 4, 0.1), baseMat);
      base.position.y = 0.55;
      base.castShadow = true;

      // Tháp kính vát góc phản chiếu bầu trời xanh
      const towerMat = new THREE.MeshStandardMaterial({
        color: '#74B9FF',
        roughness: 0.12,
        metalness: 0.15,
        emissive: '#0984E3',
        emissiveIntensity: 0.25
      });
      const tower = new THREE.Mesh(new RoundedBoxGeometry(0.65, 0.72, 0.65, 4, 0.06), towerMat);
      tower.position.y = 1.42;

      // Ăng-ten thu phát viễn thông mạ vàng
      const antennaMat = new THREE.MeshStandardMaterial({ color: '#FDCB6E', metalness: 0.85, roughness: 0.18 });
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.65, 8), antennaMat);
      antenna.position.y = 2.05;

      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 10, 10),
        new THREE.MeshStandardMaterial({ color: '#FF4757', emissive: '#FF4757', emissiveIntensity: 0.9 })
      );
      orb.position.y = 2.4;

      modelSubGroup.add(base, tower, antenna, orb);

    } else if (level === 4) {
      // ==========================================
      // 💎 Level 4: Khách Sạn Landmark 5 Sao Hoàng Gia (Art Deco Palace)
      // ==========================================
      // Khối đế giật cấp 1
      const tier1Mat = new THREE.MeshStandardMaterial({
        color: '#0984E3',
        emissive: '#00cec9',
        emissiveIntensity: 0.35,
        roughness: 0.14,
        metalness: 0.22
      });
      const tier1 = new THREE.Mesh(new RoundedBoxGeometry(1.15, 1.25, 1.15, 4, 0.12), tier1Mat);
      tier1.position.y = 0.63;
      tier1.castShadow = true;

      // Khối tháp giật cấp 2
      const tier2 = new THREE.Mesh(new RoundedBoxGeometry(0.88, 1.05, 0.88, 4, 0.08), tier1Mat);
      tier2.position.y = 1.72;
      tier2.castShadow = true;

      // Khối tháp giật cấp 3
      const tier3 = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.85, 0.62, 4, 0.06), tier1Mat);
      tier3.position.y = 2.62;

      // Sảnh đón mái che lượn sóng & thảm đỏ trước cửa
      const carpetMat = new THREE.MeshStandardMaterial({ color: '#D63031', roughness: 0.4 });
      const carpet = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.6), carpetMat);
      carpet.rotation.x = -Math.PI / 2;
      carpet.position.set(0, 0.03, 0.7);

      const canopyMat = new THREE.MeshStandardMaterial({ color: '#FDCB6E', metalness: 0.8, roughness: 0.2 });
      const canopy = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.06, 0.35, 2, 0.02), canopyMat);
      canopy.position.set(0, 0.48, 0.65);

      // Sân đỗ trực thăng chữ [ H ] viền neon trên sân thượng tầng 1
      const heliPadMat = new THREE.MeshStandardMaterial({
        color: '#2D3436',
        roughness: 0.5
      });
      const heliPad = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 16), heliPadMat);
      heliPad.position.set(0.38, 1.26, 0.38);

      const hSignMat = new THREE.MeshBasicMaterial({ color: '#FFEAA7' });
      const hSign = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), hSignMat);
      hSign.rotation.x = -Math.PI / 2;
      hSign.position.set(0.38, 1.28, 0.38);

      // Cột chóp vương miện mạ vàng Art Deco
      const crownMat = new THREE.MeshStandardMaterial({
        color: '#FDCB6E',
        emissive: '#FDCB6E',
        emissiveIntensity: 0.45,
        metalness: 0.88,
        roughness: 0.16
      });
      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.85, 8), crownMat);
      crown.position.y = 3.42;

      // Quả cầu pha lê vàng phát sáng trên đỉnh tháp
      const orbMat = new THREE.MeshStandardMaterial({
        color: '#FFF275',
        emissive: '#FFF275',
        emissiveIntensity: 1.0,
        roughness: 0.06
      });
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), orbMat);
      orb.position.y = 3.95;

      this.animatedSpireLandmarks.push(orb);
      modelSubGroup.add(tier1, tier2, tier3, carpet, canopy, heliPad, hSign, crown, orb);
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

  public update(elapsedTime: number) {
    this.animatedSpireLandmarks.forEach((orb, i) => {
      orb.rotation.y = elapsedTime * 1.5;
      const scale = 1 + Math.sin(elapsedTime * 4 + i) * 0.08;
      orb.scale.set(scale, scale, scale);
    });
  }

  public reset() {
    this.buildingMap.forEach((mesh) => {
      this.group.remove(mesh);
    });
    this.buildingMap.clear();
    this.animatedSpireLandmarks = [];
  }
}
