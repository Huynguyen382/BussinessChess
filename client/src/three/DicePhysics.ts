import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { sounds } from '../components/AudioSynth';
import { VFXManager } from './VFXManager';

export class DicePhysics {
  public group: THREE.Group;
  private die1: THREE.Mesh;
  private die2: THREE.Mesh;
  private shadow1: THREE.Mesh;
  private shadow2: THREE.Mesh;
  private isRolling: boolean = false;
  private rollProgress: number = 0;
  private rollDuration: number = 1.25; // seconds
  private targetRot1: THREE.Euler = new THREE.Euler();
  private targetRot2: THREE.Euler = new THREE.Euler();
  private vfxManager: VFXManager | null = null;
  private hasTriggeredImpactVFX: boolean = false;
  private currentD1: number = 1;
  private currentD2: number = 1;

  // Góc xoay mặt xúc xắc theo chuẩn Three.js BoxGeometry
  // Kết hợp độ nghiêng góc nhìn nhẹ (~12 độ) để mặt số ngửa thẳng về phía camera Isometric
  private static readonly FACE_ROTATIONS: Record<number, [number, number, number]> = {
    1: [0.18, 0, -0.18],
    2: [-Math.PI / 2 + 0.18, 0, -0.18],
    3: [0.18, 0, Math.PI / 2 - 0.18],
    4: [0.18, 0, -Math.PI / 2 - 0.18],
    5: [Math.PI / 2 + 0.18, 0, -0.18],
    6: [Math.PI + 0.18, 0, -0.18]
  };

  constructor() {
    this.group = new THREE.Group();

    // 🌟 VỊ TRÍ ĐỔ XÚC XẮC MỚI: Đặt tại Tiền Cảnh (South-East Foreground Plaza)
    // Hoàn toàn cách ly khỏi đài phun nước trung tâm (Fountain radius: 4.4, Center: 0,0),
    // nằm trên lối đi công viên rộng mở ngay trước mắt người chơi (x: 3.4, z: 3.4)!
    this.group.position.set(3.4, 0.32, 3.4);

    // 🎲 Khay Đổ Xúc Xắc Cổ Điển Hoàng Gia (Royal Velvet Rolling Tray)
    this.createDiceTray();

    const materials = this.createDiceMaterials();
    // Viên xúc xắc to lớn, bo tròn góc mềm mại đạt chuẩn Monopoly GO! (1.4 x 1.4 x 1.4)
    const geometry = new RoundedBoxGeometry(1.4, 1.4, 1.4, 5, 0.25);

    // Đĩa bóng đổ mềm dưới đáy xúc xắc
    const shadowMat = new THREE.MeshBasicMaterial({
      map: this.createShadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.55
    });
    const shadowGeo = new THREE.PlaneGeometry(1.9, 1.9);

    this.shadow1 = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow1.rotation.x = -Math.PI / 2;
    this.shadow1.position.set(-0.95, 0.06, 0.95);

    this.shadow2 = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow2.rotation.x = -Math.PI / 2;
    this.shadow2.position.set(0.95, 0.06, -0.95);

    this.group.add(this.shadow1, this.shadow2);

    // Viên xúc xắc 1 & 2
    this.die1 = new THREE.Mesh(geometry, materials);
    this.die1.position.set(-0.95, 0.76, 0.95);
    this.die1.castShadow = true;
    this.die1.receiveShadow = true;

    this.die2 = new THREE.Mesh(geometry, materials);
    this.die2.position.set(0.95, 0.76, -0.95);
    this.die2.castShadow = true;
    this.die2.receiveShadow = true;

    this.group.add(this.die1);
    this.group.add(this.die2);
  }

  // Khay Gỗ & Đệm Nỉ Xanh Lục Để Lắc Xúc Xắc Chuyên Nghiệp
  private createDiceTray() {
    const trayGroup = new THREE.Group();

    // Khung gỗ óc chó đánh bóng bo tròn
    const woodMat = new THREE.MeshStandardMaterial({
      color: '#4A2E18',
      roughness: 0.45,
      metalness: 0.08
    });
    const frame = new THREE.Mesh(new RoundedBoxGeometry(3.8, 0.08, 3.8, 3, 0.08), woodMat);
    frame.position.y = 0.04;
    frame.receiveShadow = true;

    // Đệm nỉ nhung xanh ngọc lục bảo (Emerald Green Velvet Mat)
    const feltMat = new THREE.MeshStandardMaterial({
      color: '#006241',
      roughness: 0.85,
      metalness: 0.0
    });
    const felt = new THREE.Mesh(new RoundedBoxGeometry(3.5, 0.04, 3.5, 2, 0.04), feltMat);
    felt.position.y = 0.07;
    felt.receiveShadow = true;

    // 4 Đinh tán mạ vàng tại 4 góc khay
    const studMat = new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F1C40F',
      emissiveIntensity: 0.3,
      metalness: 0.88,
      roughness: 0.15
    });
    const studGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const studPositions = [
      [-1.6, 0.09, -1.6], [1.6, 0.09, -1.6],
      [-1.6, 0.09, 1.6], [1.6, 0.09, 1.6]
    ];
    studPositions.forEach(([sx, sy, sz]) => {
      const stud = new THREE.Mesh(studGeo, studMat);
      stud.position.set(sx, sy, sz);
      trayGroup.add(stud);
    });

    trayGroup.add(frame, felt);
    this.group.add(trayGroup);
  }

  private createShadowTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    return new THREE.CanvasTexture(canvas);
  }

  public setVFXManager(vfx: VFXManager) {
    this.vfxManager = vfx;
  }

  // Kết cấu mặt xúc xắc độ phân giải Retina 512x512
  private createDiceMaterials(): THREE.Material[] {
    const faceIndices = [3, 4, 1, 6, 2, 5];
    return faceIndices.map(num => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Nền men sứ ngà bóng bẩy (Porcelain Gloss White)
      const bgGrad = ctx.createRadialGradient(256, 256, 60, 256, 256, 340);
      bgGrad.addColorStop(0, '#FFFFFF');
      bgGrad.addColorStop(0.8, '#F8F9FA');
      bgGrad.addColorStop(1, '#DFE4EA');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 512, 512);

      // Viền vát cạnh bóng mờ
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.lineWidth = 24;
      ctx.strokeRect(12, 12, 488, 488);

      // Mặt 1 là nút Đỏ Ruby (#D63031) siêu to, các mặt 2-6 là màu Than Đen sâu (#1E272E)
      const dot = (x: number, y: number, r = 48) => {
        // Drop shadow cho chấm xúc xắc
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.arc(x, y + 4, r + 2, 0, Math.PI * 2);
        ctx.fill();

        // Chấm màu chính
        ctx.fillStyle = num === 1 ? '#D63031' : '#1E272E';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // Điểm sáng phản chiếu specular ánh sáng 3D
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.beginPath();
        ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      };

      const c = 256;
      const l = 136;
      const r = 376;

      if (num === 1) dot(c, c, 72);
      if (num === 2) { dot(l, l); dot(r, r); }
      if (num === 3) { dot(l, l); dot(c, c); dot(r, r); }
      if (num === 4) { dot(l, l); dot(r, l); dot(l, r); dot(r, r); }
      if (num === 5) { dot(l, l); dot(r, l); dot(c, c); dot(l, r); dot(r, r); }
      if (num === 6) { dot(l, l); dot(r, l); dot(l, c); dot(r, c); dot(l, r); dot(r, r); }

      const texture = new THREE.CanvasTexture(canvas);
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;

      return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.2,
        metalness: 0.04
      });
    });
  }

  public roll(d1: number, d2: number, onComplete?: () => void) {
    this.isRolling = true;
    this.rollProgress = 0;
    this.hasTriggeredImpactVFX = false;
    this.currentD1 = d1;
    this.currentD2 = d2;
    sounds.playDiceRoll();

    const rot1 = DicePhysics.FACE_ROTATIONS[d1] || [0.18, 0, -0.18];
    const rot2 = DicePhysics.FACE_ROTATIONS[d2] || [0.18, 0, -0.18];

    // Xoay nhiều vòng ngoạn mục trên không trung
    this.targetRot1.set(rot1[0] + Math.PI * 6, rot1[1] + Math.PI * 4, rot1[2]);
    this.targetRot2.set(rot2[0] + Math.PI * 4, rot2[1] + Math.PI * 6, rot2[2]);

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

    let height = 0;
    if (t < 0.65) {
      // Tung cao lên không trung (quỹ đạo parabol)
      const tossT = t / 0.65;
      height = Math.sin(tossT * Math.PI) * 4.5;
    } else if (t < 0.9) {
      // Nảy đàn hồi lần 2
      const b2T = (t - 0.65) / 0.25;
      height = Math.sin(b2T * Math.PI) * 1.1;
    } else {
      height = 0;
    }

    this.die1.position.y = 0.76 + height;
    this.die2.position.y = 0.76 + height;

    // Tỉ lệ bóng đổ co giãn theo độ cao
    const shadowScale = Math.max(0.4, 1 - height * 0.15);
    this.shadow1.scale.set(shadowScale, shadowScale, shadowScale);
    this.shadow2.scale.set(shadowScale, shadowScale, shadowScale);

    // Kích hoạt hiệu ứng va chạm khi xúc xắc chạm khay
    if (t >= 0.65 && !this.hasTriggeredImpactVFX && this.vfxManager) {
      this.hasTriggeredImpactVFX = true;
      this.vfxManager.triggerCameraShake(0.25);

      const impactPos = new THREE.Vector3(3.4, 0.45, 3.4);
      this.vfxManager.spawnStarBurst(impactPos, 22, 0xFDCB6E);
      this.vfxManager.spawnShockwave(new THREE.Vector3(2.45, 0.45, 4.35), '#FDCB6E', 2.0);
      this.vfxManager.spawnShockwave(new THREE.Vector3(4.35, 0.45, 2.45), '#00B894', 2.0);
    }

    const easeOut = 1 - Math.pow(1 - t, 3);

    this.die1.rotation.x = this.targetRot1.x * easeOut;
    this.die1.rotation.y = this.targetRot1.y * easeOut;
    this.die1.rotation.z = this.targetRot1.z * easeOut;

    this.die2.rotation.x = this.targetRot2.x * easeOut;
    this.die2.rotation.y = this.targetRot2.y * easeOut;
    this.die2.rotation.z = this.targetRot2.z * easeOut;

    if (t >= 1) {
      this.isRolling = false;
      this.die1.position.y = 0.76;
      this.die2.position.y = 0.76;

      // 🌟 HIỆN BẢNG ĐIỂM 3D SÁNG LẤP LÁNH NGAY TRÊN ĐẦU XÚC XẮC
      if (this.vfxManager) {
        const total = this.currentD1 + this.currentD2;
        const isDouble = this.currentD1 === this.currentD2;
        const text = isDouble ? `🎲 ${total} ĐIỂM! (ĐÔI ${this.currentD1})` : `🎲 ${total} ĐIỂM (${this.currentD1} + ${this.currentD2})`;
        this.vfxManager.spawnFloatingText(text, new THREE.Vector3(3.4, 3.2, 3.4), true);
      }

      if ((this as any)._onRollComplete) {
        (this as any)._onRollComplete();
      }
    }
  }
}
