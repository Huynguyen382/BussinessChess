import * as THREE from 'three';
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

    // Contact shadow under building
    const shadowGeo = new THREE.PlaneGeometry(1.4, 1.4);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);

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
      // Level 1: Nhà gỗ nhỏ kiểu Bắc Âu (Cottage)
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.55, 0.75),
        new THREE.MeshLambertMaterial({ color: '#FFFFFF' })
      );
      base.position.y = 0.28;
      base.castShadow = true;

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(0.65, 0.45, 4),
        new THREE.MeshLambertMaterial({ color: '#E84393' })
      );
      roof.position.y = 0.78;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;

      // Chimney
      const chimney = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.35, 0.12),
        new THREE.MeshLambertMaterial({ color: '#D63031' })
      );
      chimney.position.set(0.22, 0.85, 0.15);

      bGroup.add(base, roof, chimney);
    } else if (level === 2) {
      // Level 2: Biệt thự 2 tầng phong cách Địa Trung Hải
      const f1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.45, 0.85),
        new THREE.MeshLambertMaterial({ color: '#FFFFFF' })
      );
      f1.position.y = 0.23;
      f1.castShadow = true;

      const f2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.48, 0.7),
        new THREE.MeshLambertMaterial({ color: '#FFEAA7' })
      );
      f2.position.y = 0.69;

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(0.65, 0.45, 4),
        new THREE.MeshLambertMaterial({ color: '#FF7675' })
      );
      roof.position.y = 1.15;
      roof.rotation.y = Math.PI / 4;

      bGroup.add(f1, f2, roof);
    } else if (level === 3) {
      // Level 3: Khu phức hợp mini / Chung cư cao cấp
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.95, 0.95),
        new THREE.MeshLambertMaterial({ color: '#DFE6E9' })
      );
      base.position.y = 0.48;

      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.6, 0.55),
        new THREE.MeshLambertMaterial({ color: '#74B9FF' })
      );
      tower.position.y = 1.25;

      const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8),
        new THREE.MeshLambertMaterial({ color: '#FDCB6E' })
      );
      antenna.position.y = 1.75;

      bGroup.add(base, tower, antenna);
    } else if (level === 4) {
      // Level 4: Khách sạn Landmark 5 Sao Pha Lê
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 1.9, 1.05),
        new THREE.MeshLambertMaterial({
          color: '#0984E3',
          emissive: '#00cec9',
          emissiveIntensity: 0.35
        })
      );
      tower.position.y = 0.95;
      tower.castShadow = true;

      // Golden Spire
      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 0.85, 6),
        new THREE.MeshLambertMaterial({ color: '#FDCB6E', emissive: '#FDCB6E', emissiveIntensity: 0.5 })
      );
      spire.position.y = 2.3;

      // Crystal Golden Orb
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 16, 16),
        new THREE.MeshLambertMaterial({ color: '#FFF275', emissive: '#FFF275', emissiveIntensity: 0.8 })
      );
      orb.position.y = 2.85;

      this.animatedSpireLandmarks.push(orb);
      bGroup.add(tower, spire, orb);
    }

    // Elastic pop-in bounce animation
    bGroup.scale.set(0.01, 0.01, 0.01);
    this.animateBounce(bGroup);

    this.group.add(bGroup);
    this.buildingMap.set(tileId, bGroup);
    sounds.playBuild();

    // Trigger Shockwave & Star Dust VFX
    if (this.vfxManager) {
      this.vfxManager.spawnShockwave(position, level === 4 ? '#FDCB6E' : '#00B894', 2.8);
      this.vfxManager.spawnStarBurst(position, 15, level === 4 ? 0xFDCB6E : 0x00B894);
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
    // Pulse landmark orbs
    for (const orb of this.animatedSpireLandmarks) {
      orb.rotation.y += delta * 2.0;
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
