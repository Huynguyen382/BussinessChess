import * as THREE from 'three';
import { sounds } from '../components/AudioSynth';

export class BuildingMesh {
  public group: THREE.Group;
  private buildingMap: Map<number, THREE.Group> = new Map();

  constructor() {
    this.group = new THREE.Group();
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

    if (level === 1) {
      // Level 1: Nhà gỗ nhỏ
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.5, 0.7),
        new THREE.MeshLambertMaterial({ color: '#FFFFFF' })
      );
      base.position.y = 0.25;
      base.castShadow = true;

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(0.6, 0.4, 4),
        new THREE.MeshLambertMaterial({ color: '#E84393' })
      );
      roof.position.y = 0.7;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;

      bGroup.add(base);
      bGroup.add(roof);
    } else if (level === 2) {
      // Level 2: Biệt thự 2 tầng
      const f1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.4, 0.8),
        new THREE.MeshLambertMaterial({ color: '#FFFFFF' })
      );
      f1.position.y = 0.2;
      const f2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.45, 0.65),
        new THREE.MeshLambertMaterial({ color: '#FFEAA7' })
      );
      f2.position.y = 0.625;

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(0.6, 0.4, 4),
        new THREE.MeshLambertMaterial({ color: '#FF7675' })
      );
      roof.position.y = 1.05;
      roof.rotation.y = Math.PI / 4;

      bGroup.add(f1, f2, roof);
    } else if (level === 3) {
      // Level 3: Khu phức hợp mini
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.9, 0.9),
        new THREE.MeshLambertMaterial({ color: '#DFE6E9' })
      );
      base.position.y = 0.45;

      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshLambertMaterial({ color: '#74B9FF' })
      );
      tower.position.y = 1.15;

      const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8),
        new THREE.MeshLambertMaterial({ color: '#FDCB6E' })
      );
      antenna.position.y = 1.6;

      bGroup.add(base, tower, antenna);
    } else if (level === 4) {
      // Level 4: Landmark 5 sao với Emissive Glow
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 1.8, 1.0),
        new THREE.MeshLambertMaterial({
          color: '#0984E3',
          emissive: '#00cec9',
          emissiveIntensity: 0.25
        })
      );
      tower.position.y = 0.9;
      tower.castShadow = true;

      // Spire & Golden Orb
      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 0.8, 6),
        new THREE.MeshLambertMaterial({ color: '#FDCB6E', emissive: '#FDCB6E', emissiveIntensity: 0.4 })
      );
      spire.position.y = 2.2;

      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshLambertMaterial({ color: '#FFF275', emissive: '#FFF275', emissiveIntensity: 0.6 })
      );
      orb.position.y = 2.7;

      bGroup.add(tower, spire, orb);
    }

    // Elastic pop-in bounce animation
    bGroup.scale.set(0.01, 0.01, 0.01);
    this.animateBounce(bGroup);

    this.group.add(bGroup);
    this.buildingMap.set(tileId, bGroup);
    sounds.playBuild();
  }

  private animateBounce(group: THREE.Group) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.08;
      // Elastic overshoot
      const s = Math.sin(progress * Math.PI * 0.75) * 1.15;
      if (progress >= 1) {
        group.scale.set(1, 1, 1);
        clearInterval(interval);
      } else {
        group.scale.set(s, s, s);
      }
    }, 16);
  }

  public clear() {
    for (const b of this.buildingMap.values()) {
      this.group.remove(b);
    }
    this.buildingMap.clear();
  }
}
