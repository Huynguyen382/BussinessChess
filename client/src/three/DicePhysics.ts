import * as THREE from 'three';
import { sounds } from '../components/AudioSynth';

export class DicePhysics {
  public group: THREE.Group;
  private die1: THREE.Mesh;
  private die2: THREE.Mesh;
  private isRolling: boolean = false;
  private rollProgress: number = 0;
  private rollDuration: number = 1.2; // seconds
  private targetRot1: THREE.Euler = new THREE.Euler();
  private targetRot2: THREE.Euler = new THREE.Euler();

  // Face rotations mapping for standard cube where:
  // Face +Y = 1, -Y = 6, +Z = 2, -Z = 5, +X = 3, -X = 4
  private static readonly FACE_ROTATIONS: Record<number, [number, number, number]> = {
    1: [0, 0, 0],
    2: [-Math.PI / 2, 0, 0],
    3: [0, 0, Math.PI / 2],
    4: [0, 0, -Math.PI / 2],
    5: [Math.PI / 2, 0, 0],
    6: [Math.PI, 0, 0]
  };

  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(0, 0.4, 0);

    const materials = this.createDiceMaterials();
    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);

    this.die1 = new THREE.Mesh(geometry, materials);
    this.die1.position.set(-1.2, 0.6, 0);
    this.die1.castShadow = true;

    this.die2 = new THREE.Mesh(geometry, materials);
    this.die2.position.set(1.2, 0.6, 0);
    this.die2.castShadow = true;

    this.group.add(this.die1);
    this.group.add(this.die2);
  }

  private createDiceMaterials(): THREE.Material[] {
    // Canvas textures with rounded dots for 6 faces
    // Order for BoxGeometry: [+X, -X, +Y, -Y, +Z, -Z] => [3, 4, 1, 6, 2, 5]
    const faceIndices = [3, 4, 1, 6, 2, 5];
    return faceIndices.map(num => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      // Background - glossy warm cream/white
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 256, 256);

      // Inner border bevel
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, 242, 242);

      // Dots color - Fortune Gold or Ruby Red
      ctx.fillStyle = num === 1 ? '#D63031' : '#2D3436';

      const dot = (x: number, y: number, r = 24) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };

      const c = 128;
      const l = 68;
      const r = 188;

      if (num === 1) dot(c, c, 32);
      if (num === 2) { dot(l, l); dot(r, r); }
      if (num === 3) { dot(l, l); dot(c, c); dot(r, r); }
      if (num === 4) { dot(l, l); dot(r, l); dot(l, r); dot(r, r); }
      if (num === 5) { dot(l, l); dot(r, l); dot(c, c); dot(l, r); dot(r, r); }
      if (num === 6) { dot(l, l); dot(r, l); dot(l, c); dot(r, c); dot(l, r); dot(r, r); }

      const texture = new THREE.CanvasTexture(canvas);
      return new THREE.MeshLambertMaterial({ map: texture });
    });
  }

  public roll(d1: number, d2: number, onComplete?: () => void) {
    this.isRolling = true;
    this.rollProgress = 0;
    sounds.playDiceRoll();

    const rot1 = DicePhysics.FACE_ROTATIONS[d1] || [0, 0, 0];
    const rot2 = DicePhysics.FACE_ROTATIONS[d2] || [0, 0, 0];

    // Add extra random multi-spins (2-3 full 360 rotations)
    this.targetRot1.set(rot1[0] + Math.PI * 4, rot1[1] + Math.PI * 4, rot1[2]);
    this.targetRot2.set(rot2[0] + Math.PI * 6, rot2[1] + Math.PI * 4, rot2[2]);

    const checkDone = () => {
      if (!this.isRolling) {
        if (onComplete) onComplete();
      }
    };
    (this as any)._onRollComplete = checkDone;
  }

  public update(delta: number) {
    if (!this.isRolling) return;

    this.rollProgress += delta / this.rollDuration;
    const t = Math.min(1, this.rollProgress);

    // Parabolic hop
    const height = Math.sin(t * Math.PI) * 4.5 * (1 - t * 0.4);
    this.die1.position.y = 0.6 + height;
    this.die2.position.y = 0.6 + height;

    // Spin interpolation with ease-out cubic
    const easeOut = 1 - Math.pow(1 - t, 3);

    this.die1.rotation.x = this.targetRot1.x * easeOut;
    this.die1.rotation.y = this.targetRot1.y * easeOut;
    this.die1.rotation.z = this.targetRot1.z * easeOut;

    this.die2.rotation.x = this.targetRot2.x * easeOut;
    this.die2.rotation.y = this.targetRot2.y * easeOut;
    this.die2.rotation.z = this.targetRot2.z * easeOut;

    if (t >= 1) {
      this.isRolling = false;
      this.die1.position.y = 0.6;
      this.die2.position.y = 0.6;
      if ((this as any)._onRollComplete) {
        (this as any)._onRollComplete();
      }
    }
  }
}
