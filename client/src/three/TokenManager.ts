import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type TokenType = 'car' | 'hat' | 'dog' | 'rocket';

export interface TokenInstance {
  userId: string;
  tokenType: TokenType;
  color: string;
  currentTile: number;
  mesh: THREE.Group;
  innerModel: THREE.Group;
  shadowDisc: THREE.Mesh;
  isMoving: boolean;
  pathQueue: number[];
  wheels?: THREE.Mesh[];
  ears?: THREE.Mesh;
  thrusterFlame?: THREE.Mesh;
  blinkTimer?: number;
}

export class TokenManager {
  public group: THREE.Group;
  public tokens: Map<string, TokenInstance> = new Map();
  private tilePositions: THREE.Vector3[] = [];
  private shadowTexture: THREE.CanvasTexture;
  private animClock = 0;

  constructor() {
    this.group = new THREE.Group();
    this.shadowTexture = this.createContactShadowTexture();
  }

  private createContactShadowTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(45, 52, 54, 0.45)');
    grad.addColorStop(0.5, 'rgba(45, 52, 54, 0.2)');
    grad.addColorStop(1, 'rgba(45, 52, 54, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }

  public setTilePositions(positions: THREE.Vector3[]) {
    this.tilePositions = positions;
  }

  public getTilePosition(tileIndex: number, slotOffset = 0): THREE.Vector3 {
    const base = this.tilePositions[tileIndex] || new THREE.Vector3(0, 0, 0);
    const offsets = [
      new THREE.Vector3(-0.35, 0, -0.35),
      new THREE.Vector3(0.35, 0, -0.35),
      new THREE.Vector3(-0.35, 0, 0.35),
      new THREE.Vector3(0.35, 0, 0.35)
    ];
    return base.clone().add(offsets[slotOffset % 4]);
  }

  public createToken(userId: string, tokenType: TokenType, color: string, slot: number): THREE.Group {
    const tokenGroup = new THREE.Group();
    const wheels: THREE.Mesh[] = [];
    let earsMesh: THREE.Mesh | undefined;
    let flameMesh: THREE.Mesh | undefined;

    if (tokenType === 'car') {
      // 🚗 Xe Cổ Điển Bo Tròn Mịn (Chunky Vintage Cruiser)
      const bodyMat = new THREE.MeshStandardMaterial({
        color: color || '#FF3838',
        roughness: 0.22,
        metalness: 0.12
      });
      // Thân xe bo tròn góc mềm
      const body = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.38, 0.54, 4, 0.1), bodyMat);
      body.position.y = 0.32;
      body.castShadow = true;

      // Cabin bo tròn với kính xe pha lê
      const cabinMat = new THREE.MeshStandardMaterial({
        color: '#E0F2FE',
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.88
      });
      const cabin = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.32, 0.46, 4, 0.08), cabinMat);
      cabin.position.set(-0.06, 0.58, 0);

      // Cản trước và sau mạ crom sáng bóng
      const chromeMat = new THREE.MeshStandardMaterial({ color: '#F1F2F6', metalness: 0.88, roughness: 0.15 });
      const frontBumper = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.1, 0.52, 2, 0.02), chromeMat);
      frontBumper.position.set(0.48, 0.22, 0);
      const rearBumper = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.1, 0.52, 2, 0.02), chromeMat);
      rearBumper.position.set(-0.48, 0.22, 0);

      // Đèn pha hình cầu thủy tinh vàng
      const lightGeo = new THREE.SphereGeometry(0.085, 12, 12);
      const lightMat = new THREE.MeshStandardMaterial({ color: '#FFF275', emissive: '#FFF275', emissiveIntensity: 0.75 });
      const hl1 = new THREE.Mesh(lightGeo, lightMat);
      hl1.position.set(0.44, 0.33, 0.17);
      const hl2 = new THREE.Mesh(lightGeo, lightMat);
      hl2.position.set(0.44, 0.33, -0.17);

      // 4 Bánh xe lốp cao su có mâm crom
      const tireGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16);
      const tireMat = new THREE.MeshStandardMaterial({ color: '#2C3A47', roughness: 0.6 });
      tireGeo.rotateZ(Math.PI / 2);

      const hubGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.11, 12);
      hubGeo.rotateZ(Math.PI / 2);

      const makeWheel = (x: number, z: number) => {
        const wGroup = new THREE.Group();
        wGroup.position.set(x, 0.14, z);
        const tire = new THREE.Mesh(tireGeo, tireMat);
        const hub = new THREE.Mesh(hubGeo, chromeMat);
        wGroup.add(tire, hub);
        tokenGroup.add(wGroup);
        wheels.push(tire);
      };

      makeWheel(-0.27, 0.28);
      makeWheel(0.27, 0.28);
      makeWheel(-0.27, -0.28);
      makeWheel(0.27, -0.28);

      tokenGroup.add(body, cabin, frontBumper, rearBumper, hl1, hl2);
    } else if (tokenType === 'hat') {
      // 🎩 Mũ Phớt Hoàng Kim Quý Tộc (Golden Top Hat)
      const goldMat = new THREE.MeshStandardMaterial({
        color: color || '#FDCB6E',
        emissive: '#FDCB6E',
        emissiveIntensity: 0.25,
        metalness: 0.88,
        roughness: 0.18
      });
      // Vành mũ uốn cong mềm
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 32), goldMat);
      brim.position.y = 0.08;

      // Dải nơ nhung hoàng gia
      const ribbon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.37, 0.37, 0.15, 24),
        new THREE.MeshStandardMaterial({ color: '#6C5CE7', roughness: 0.4 })
      );
      ribbon.position.y = 0.2;

      // Thân mũ thon đẹp
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 0.72, 24), goldMat);
      crown.position.y = 0.62;

      // Khóa nơ vàng đính đá hồng ngọc
      const buckle = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.14, 0.05),
        new THREE.MeshStandardMaterial({ color: '#D63031', emissive: '#D63031', emissiveIntensity: 0.6 })
      );
      buckle.position.set(0.38, 0.2, 0);

      tokenGroup.add(brim, ribbon, crown, buckle);
    } else if (tokenType === 'dog') {
      // 🐕 Chú Cún May Mắn Bo Tròn Đáng Yêu
      const dogMat = new THREE.MeshStandardMaterial({ color: color || '#E17055', roughness: 0.4 });

      // Thân cún tròn mập
      const body = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.54, 0.48, 4, 0.14), dogMat);
      body.position.y = 0.38;

      // Đầu cún tròn
      const head = new THREE.Mesh(new RoundedBoxGeometry(0.45, 0.45, 0.44, 4, 0.12), dogMat);
      head.position.set(0.32, 0.65, 0);

      // Đôi mắt tròn to đen lay láy có điểm sáng long lanh
      const eyeMat = new THREE.MeshStandardMaterial({ color: '#1E272E', roughness: 0.1 });
      const pupilMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });

      const eyeGeo = new THREE.SphereGeometry(0.065, 10, 10);
      const pupGeo = new THREE.SphereGeometry(0.022, 6, 6);

      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(0.53, 0.72, 0.13);
      const pupL = new THREE.Mesh(pupGeo, pupilMat);
      pupL.position.set(0.58, 0.74, 0.14);

      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(0.53, 0.72, -0.13);
      const pupR = new THREE.Mesh(pupGeo, pupilMat);
      pupR.position.set(0.58, 0.74, -0.14);

      // Mõm đen xinh xắn
      const muzzleMat = new THREE.MeshStandardMaterial({ color: '#2D3436', roughness: 0.5 });
      const muzzle = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.16, 0.22, 3, 0.05), muzzleMat);
      muzzle.position.set(0.56, 0.6, 0);

      // Đôi tai mềm mại có thể ve vẩy
      const earMat = new THREE.MeshStandardMaterial({ color: '#4B6584', roughness: 0.5 });
      earsMesh = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.28, 0.5, 3, 0.06), earMat);
      earsMesh.position.set(0.3, 0.8, 0);

      // Vòng cổ đỏ đính chuông vàng
      const collar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16),
        new THREE.MeshStandardMaterial({ color: '#D63031' })
      );
      collar.position.set(0.32, 0.48, 0);

      const bell = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 12),
        new THREE.MeshStandardMaterial({ color: '#FDCB6E', metalness: 0.85, roughness: 0.2, emissive: '#FDCB6E', emissiveIntensity: 0.5 })
      );
      bell.position.set(0.52, 0.44, 0);

      // 4 Chân tròn mập
      const pawGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const makePaw = (x: number, z: number) => {
        const paw = new THREE.Mesh(pawGeo, dogMat);
        paw.position.set(x, 0.1, z);
        tokenGroup.add(paw);
      };
      makePaw(-0.2, 0.2);
      makePaw(0.2, 0.2);
      makePaw(-0.2, -0.2);
      makePaw(0.2, -0.2);

      tokenGroup.add(body, head, eyeL, pupL, eyeR, pupR, muzzle, earsMesh, collar, bell);
    } else {
      // 🚀 Tên Lửa Không Gian Bo Cong Khí Động Học
      const rocketMat = new THREE.MeshStandardMaterial({ color: color || '#0984E3', roughness: 0.2, metalness: 0.15 });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, 0.88, 24), rocketMat);
      body.position.y = 0.55;

      // Mũi chóp tên lửa bo cong
      const nose = new THREE.Mesh(
        new THREE.ConeGeometry(0.24, 0.42, 24),
        new THREE.MeshStandardMaterial({ color: '#FF7675', roughness: 0.25 })
      );
      nose.position.y = 1.18;

      // Cửa sổ phi thuyền tròn có viền vàng
      const winBorder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16),
        new THREE.MeshStandardMaterial({ color: '#FDCB6E', metalness: 0.8, roughness: 0.2 })
      );
      winBorder.rotation.x = Math.PI / 2;
      winBorder.position.set(0, 0.65, 0.28);

      const winGlass = new THREE.Mesh(
        new THREE.CircleGeometry(0.09, 16),
        new THREE.MeshBasicMaterial({ color: '#74B9FF' })
      );
      winGlass.position.set(0, 0.65, 0.31);

      // 3 Cánh lái bo tròn
      const finMat = new THREE.MeshStandardMaterial({ color: '#74B9FF', roughness: 0.3 });
      for (let f = 0; f < 3; f++) {
        const angle = (f / 3) * Math.PI * 2;
        const fin = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.36, 0.4, 2, 0.02), finMat);
        fin.position.set(Math.cos(angle) * 0.3, 0.34, Math.sin(angle) * 0.3);
        fin.rotation.y = -angle;
        tokenGroup.add(fin);
      }

      // Đuôi lửa đẩy rực sáng
      flameMesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.38, 16),
        new THREE.MeshStandardMaterial({
          color: '#FFA502',
          emissive: '#FF4757',
          emissiveIntensity: 0.9,
          transparent: true,
          opacity: 0.92
        })
      );
      flameMesh.position.y = 0.06;
      flameMesh.rotation.x = Math.PI;

      tokenGroup.add(body, nose, winBorder, winGlass, flameMesh);
    }

    const shadowGeo = new THREE.PlaneGeometry(1.3, 1.3);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: this.shadowTexture,
      transparent: true,
      depthWrite: false
    });
    const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = 0.02;

    const wrapper = new THREE.Group();
    const pos = this.getTilePosition(0, slot);
    wrapper.position.copy(pos);
    wrapper.add(shadowDisc);
    wrapper.add(tokenGroup);

    this.group.add(wrapper);
    this.tokens.set(userId, {
      userId,
      tokenType,
      color,
      currentTile: 0,
      mesh: wrapper,
      innerModel: tokenGroup,
      shadowDisc,
      isMoving: false,
      pathQueue: [],
      wheels,
      ears: earsMesh,
      thrusterFlame: flameMesh,
      blinkTimer: 0
    });

    return wrapper;
  }

  public moveTokenSteps(
    userId: string,
    fromTile: number,
    toTile: number,
    slot: number,
    onStepDone?: (currentStepTile: number) => void,
    onAllDone?: () => void
  ) {
    const token = this.tokens.get(userId);
    if (!token) return;

    const path: number[] = [];
    let cur = fromTile;
    while (cur !== toTile) {
      cur = (cur + 1) % 40;
      path.push(cur);
    }

    if (path.length === 0) {
      if (onAllDone) onAllDone();
      return;
    }

    let stepIndex = 0;
    const animateNextStep = () => {
      if (stepIndex >= path.length) {
        token.currentTile = toTile;
        token.isMoving = false;
        if (onAllDone) onAllDone();
        return;
      }

      const targetTile = path[stepIndex];
      const startPos = token.mesh.position.clone();
      const endPos = this.getTilePosition(targetTile, slot);
      stepIndex++;

      const duration = 185;
      const startTime = performance.now();

      const hopStep = (time: number) => {
        const elapsed = time - startTime;
        const t = Math.min(1, elapsed / duration);

        const hopHeight = Math.sin(t * Math.PI) * 0.95;
        token.mesh.position.lerpVectors(startPos, endPos, t);
        token.mesh.position.y = startPos.y + hopHeight;

        if (token.wheels && token.wheels.length > 0) {
          token.wheels.forEach(w => {
            w.rotation.x += 0.24;
          });
        }

        if (token.ears) {
          token.ears.rotation.x = Math.sin(t * Math.PI * 2) * 0.28;
        }

        if (token.innerModel) {
          if (t < 0.65) {
            const stretch = 1 + Math.sin(t * Math.PI) * 0.16;
            const squashXZ = 1 - Math.sin(t * Math.PI) * 0.08;
            token.innerModel.scale.set(squashXZ, stretch, squashXZ);
          } else {
            const impactT = (t - 0.65) / 0.35;
            const squashY = 1 - Math.sin(impactT * Math.PI) * 0.2;
            const stretchXZ = 1 + Math.sin(impactT * Math.PI) * 0.1;
            token.innerModel.scale.set(stretchXZ, squashY, stretchXZ);
          }
        }

        const shadowScale = THREE.MathUtils.lerp(1.0, 0.42, hopHeight / 0.95);
        token.shadowDisc.scale.set(shadowScale, shadowScale, 1);
        (token.shadowDisc.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(0.85, 0.22, hopHeight / 0.95);

        const dir = endPos.clone().sub(startPos).normalize();
        if (dir.lengthSq() > 0.001) {
          const angle = Math.atan2(dir.x, dir.z);
          token.mesh.rotation.y = angle;
        }

        if (t < 1) {
          requestAnimationFrame(hopStep);
        } else {
          token.mesh.position.copy(endPos);
          if (token.innerModel) token.innerModel.scale.set(1, 1, 1);
          token.shadowDisc.scale.set(1, 1, 1);
          if (onStepDone) onStepDone(targetTile);
          animateNextStep();
        }
      };

      requestAnimationFrame(hopStep);
    };

    token.isMoving = true;
    animateNextStep();
  }

  public update(delta: number) {
    this.animClock += delta;
    for (const token of this.tokens.values()) {
      if (!token.isMoving && token.innerModel) {
        const breathe = Math.sin(this.animClock * 2.5 + token.currentTile) * 0.02;
        token.innerModel.position.y = breathe;

        if (token.thrusterFlame) {
          const fScale = 0.85 + Math.sin(this.animClock * 15) * 0.25;
          token.thrusterFlame.scale.set(fScale, fScale, fScale);
        }
      }
    }
  }

  public setTokenTileImmediate(userId: string, tileIndex: number, slot: number) {
    const token = this.tokens.get(userId);
    if (!token) return;
    const pos = this.getTilePosition(tileIndex, slot);
    token.mesh.position.copy(pos);
    token.currentTile = tileIndex;
  }
}
