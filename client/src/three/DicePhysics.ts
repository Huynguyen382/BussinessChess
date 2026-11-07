import * as THREE from 'three';
import { sounds } from '../components/AudioSynth';
import { VFXManager } from './VFXManager';

export class DicePhysics {
  public group: THREE.Group;
  private die1: THREE.Mesh;
  private die2: THREE.Mesh;
  private isRolling: boolean = false;
  private rollProgress: number = 0;
  private rollDuration: number = 1.25; // seconds
  private targetRot1: THREE.Euler = new THREE.Euler();
  private targetRot2: THREE.Euler = new THREE.Euler();
  private vfxManager: VFXManager | null = null;
  private hasTriggeredImpactVFX: boolean = false;

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
    const geometry = new THREE.BoxGeometry(1.25, 1.25, 1.25);

    this.die1 = new THREE.Mesh(geometry, materials);
    this.die1.position.set(-1.25, 0.62, 0);
    this.die1.castShadow = true;

    this.die2 = new THREE.Mesh(geometry, materials);
    this.die2.position.set(1.25, 0.62, 0);
    this.die2.castShadow = true;

    this.group.add(this.die1);
    this.group.add(this.die2);
  }

  public setVFXManager(vfx: VFXManager) {
    this.vfxManager = vfx;
  }

  private createDiceMaterials(): THREE.Material[] {
    const faceIndices = [3, 4, 1, 6, 2, 5];
    return faceIndices.map(num => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      // Premium Vinyl Gloss Finish with Soft Bevel Gradient
      const bgGrad = ctx.createRadialGradient(128, 128, 40, 128, 128, 160);
      bgGrad.addColorStop(0, '#FFFFFF');
      bgGrad.addColorStop(1, '#F1F2F6');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 256, 256);

      // Beveled Border
      ctx.strokeStyle = '#DFE4EA';
      ctx.lineWidth = 16;
      ctx.strokeRect(8, 8, 240, 240);

      // Dots color - Fortune Gold or Dark Charcoal
      ctx.fillStyle = num === 1 ? '#D63031' : '#2F3542';

      const dot = (x: number, y: number, r = 24) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // Shiny inner highlight for 3D toy depth
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = num === 1 ? '#D63031' : '#2F3542';
      };

      const c = 128;
      const l = 68;
      const r = 188;

      if (num === 1) dot(c, c, 34);
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
    this.hasTriggeredImpactVFX = false;
    sounds.playDiceRoll();

    const rot1 = DicePhysics.FACE_ROTATIONS[d1] || [0, 0, 0];
    const rot2 = DicePhysics.FACE_ROTATIONS[d2] || [0, 0, 0];

    this.targetRot1.set(rot1[0] + Math.PI * 4, rot1[1] + Math.PI * 4, rot1[2]);
    this.targetRot2.set(rot2[0] + Math.PI * 6, rot2[1] + Math.PI * 4, rot2[2]);

    const checkDone = () => {
      if (!this.isRolling && onComplete) {
        onComplete();
      }
    };
    (this as any)._onRollComplete = checkDone;
  }

  public update(delta: number) {
    if (!this.isRolling) return;

    this.rollProgress += delta / this.rollDuration;
    const t = Math.min(1, this.rollProgress);

    // Bounce physics simulation (2 bounces before settling)
    let height = 0;
    if (t < 0.65) {
      // First high toss & fall
      const tossT = t / 0.65;
      height = Math.sin(tossT * Math.PI) * 4.8;
    } else if (t < 0.9) {
      // Second smaller bounce
      const b2T = (t - 0.65) / 0.25;
      height = Math.sin(b2T * Math.PI) * 1.2;
    } else {
      // Settled
      height = 0;
    }

    this.die1.position.y = 0.62 + height;
    this.die2.position.y = 0.62 + height;

    // Trigger VFX right on ground impact
    if (t >= 0.65 && !this.hasTriggeredImpactVFX && this.vfxManager) {
      this.hasTriggeredImpactVFX = true;
      this.vfxManager.triggerCameraShake(0.3);
      this.vfxManager.spawnStarBurst(new THREE.Vector3(0, 0.5, 0), 22, 0xFDCB6E);
      this.vfxManager.spawnShockwave(new THREE.Vector3(-1.25, 0.1, 0), '#FDCB6E', 2.0);
      this.vfxManager.spawnShockwave(new THREE.Vector3(1.25, 0.1, 0), '#00B894', 2.0);
    }

    // Ease-out cubic rotation
    const easeOut = 1 - Math.pow(1 - t, 3);

    this.die1.rotation.x = this.targetRot1.x * easeOut;
    this.die1.rotation.y = this.targetRot1.y * easeOut;
    this.die1.rotation.z = this.targetRot1.z * easeOut;

    this.die2.rotation.x = this.targetRot2.x * easeOut;
    this.die2.rotation.y = this.targetRot2.y * easeOut;
    this.die2.rotation.z = this.targetRot2.z * easeOut;

    if (t >= 1) {
      this.isRolling = false;
      this.die1.position.y = 0.62;
      this.die2.position.y = 0.62;
      if ((this as any)._onRollComplete) {
        (this as any)._onRollComplete();
      }
    }
  }
}
