import * as THREE from 'three';

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
      // 🚗 Red Classic Car - Mềm mại bo cong với bánh xe quay
      const bodyMat = new THREE.MeshLambertMaterial({ color: color || '#FF3838' });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.42, 0.52), bodyMat);
      body.position.y = 0.32;
      body.castShadow = true;

      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.32, 0.44),
        new THREE.MeshLambertMaterial({ color: '#FFFFFF' })
      );
      cabin.position.set(-0.08, 0.58, 0);

      // Kính chắn gió mờ xanh nhạt
      const windshield = new THREE.Mesh(
        new THREE.PlaneGeometry(0.42, 0.26),
        new THREE.MeshLambertMaterial({ color: '#74B9FF', transparent: true, opacity: 0.85 })
      );
      windshield.position.set(0.17, 0.56, 0);
      windshield.rotation.y = Math.PI / 2;

      // Headlights tròn ấm
      const lightGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const lightMat = new THREE.MeshLambertMaterial({ color: '#FFF275', emissive: '#FFF275', emissiveIntensity: 0.65 });
      const hl1 = new THREE.Mesh(lightGeo, lightMat);
      hl1.position.set(0.43, 0.32, 0.16);
      const hl2 = new THREE.Mesh(lightGeo, lightMat);
      hl2.position.set(0.43, 0.32, -0.16);

      // 4 Bánh xe quay độc lập
      const wheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 14);
      const wheelMat = new THREE.MeshLambertMaterial({ color: '#2D3436' });
      wheelGeo.rotateZ(Math.PI / 2);

      const hubcapGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.11, 10);
      const hubcapMat = new THREE.MeshLambertMaterial({ color: '#DFE6E9' });
      hubcapGeo.rotateZ(Math.PI / 2);

      const makeWheel = (x: number, z: number) => {
        const wGroup = new THREE.Group();
        wGroup.position.set(x, 0.14, z);
        const tire = new THREE.Mesh(wheelGeo, wheelMat);
        const hub = new THREE.Mesh(hubcapGeo, hubcapMat);
        wGroup.add(tire, hub);
        tokenGroup.add(wGroup);
        wheels.push(tire);
      };

      makeWheel(-0.25, 0.28);
      makeWheel(0.25, 0.28);
      makeWheel(-0.25, -0.28);
      makeWheel(0.25, -0.28);

      tokenGroup.add(body, cabin, windshield, hl1, hl2);
    } else if (tokenType === 'hat') {
      // 🎩 Mũ Phớt Hoàng Kim lấp lánh sang trọng
      const hatMat = new THREE.MeshLambertMaterial({
        color: color || '#FDCB6E',
        emissive: '#FDCB6E',
        emissiveIntensity: 0.2
      });
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.08, 20), hatMat);
      brim.position.y = 0.08;

      const ribbon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.36, 0.15, 20),
        new THREE.MeshLambertMaterial({ color: '#6C5CE7' })
      );
      ribbon.position.y = 0.2;

      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.34, 0.7, 20), hatMat);
      crown.position.y = 0.6;

      // Kim băng vàng đính đá đỏ
      const jewel = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 8, 8),
        new THREE.MeshLambertMaterial({ color: '#D63031', emissive: '#D63031', emissiveIntensity: 0.5 })
      );
      jewel.position.set(0.37, 0.2, 0);

      tokenGroup.add(brim, ribbon, crown, jewel);
    } else if (tokenType === 'dog') {
      // 🐕 Chú Cún May Mắn (Lucky Pug) với tai ve vẩy
      const dogMat = new THREE.MeshLambertMaterial({ color: color || '#E17055' });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.52, 0.46), dogMat);
      body.position.y = 0.36;

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), dogMat);
      head.position.set(0.32, 0.62, 0);

      // Tai mềm mại có thể ve vẩy
      const earMat = new THREE.MeshLambertMaterial({ color: '#636E72' });
      earsMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.48), earMat);
      earsMesh.position.set(0.3, 0.76, 0);

      // Mõm đen và mũi
      const snout = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.14, 0.2),
        new THREE.MeshLambertMaterial({ color: '#2D3436' })
      );
      snout.position.set(0.54, 0.58, 0);

      // Chuông vàng trước ngực
      const bell = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        new THREE.MeshLambertMaterial({ color: '#FDCB6E', emissive: '#FDCB6E', emissiveIntensity: 0.6 })
      );
      bell.position.set(0.48, 0.38, 0);

      tokenGroup.add(body, head, earsMesh, snout, bell);
    } else {
      // 🚀 Tên Lửa Không Gian với đuôi lửa phụt sáng
      const rocketMat = new THREE.MeshLambertMaterial({ color: color || '#0984E3' });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.85, 16), rocketMat);
      body.position.y = 0.52;

      const nose = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.38, 16),
        new THREE.MeshLambertMaterial({ color: '#FF7675' })
      );
      nose.position.y = 1.1;

      // Cánh thoi
      const finGeo = new THREE.BoxGeometry(0.06, 0.32, 0.65);
      const finMat = new THREE.MeshLambertMaterial({ color: '#74B9FF' });
      const fin1 = new THREE.Mesh(finGeo, finMat);
      fin1.position.y = 0.32;
      const fin2 = new THREE.Mesh(finGeo, finMat);
      fin2.position.y = 0.32;
      fin2.rotation.y = Math.PI / 2;

      // Ngọn lửa đẩy phụt sáng ở đuôi
      flameMesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.35, 12),
        new THREE.MeshLambertMaterial({
          color: '#FFA502',
          emissive: '#FF4757',
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.9
        })
      );
      flameMesh.position.y = 0.05;
      flameMesh.rotation.x = Math.PI;

      tokenGroup.add(body, nose, fin1, fin2, flameMesh);
    }

    // Đĩa bóng mềm dưới chân
    const shadowGeo = new THREE.PlaneGeometry(1.25, 1.25);
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

        // Hoạt ảnh lăn bánh xe nếu là Xe hơi
        if (token.wheels && token.wheels.length > 0) {
          token.wheels.forEach(w => {
            w.rotation.x += 0.22;
          });
        }

        // Hoạt ảnh tai chó ve vẩy
        if (token.ears) {
          token.ears.rotation.x = Math.sin(t * Math.PI * 2) * 0.25;
        }

        // Squash & Stretch dynamics mềm mại
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

  // Nhịp thở Idle sống động cho các quân cờ khi đứng yên
  public update(delta: number) {
    this.animClock += delta;
    for (const token of this.tokens.values()) {
      if (!token.isMoving && token.innerModel) {
        // Nhịp thở nhẹ nhàng (Subtle Idle Breathing)
        const breathe = Math.sin(this.animClock * 2.5 + token.currentTile) * 0.02;
        token.innerModel.position.y = breathe;

        // Ngọn lửa tên lửa phập phồng
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
