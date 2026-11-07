import * as THREE from 'three';

export type TokenType = 'car' | 'hat' | 'dog' | 'rocket';

export interface TokenInstance {
  userId: string;
  tokenType: TokenType;
  color: string;
  currentTile: number;
  mesh: THREE.Group;
  shadowDisc: THREE.Mesh;
  isMoving: boolean;
  pathQueue: number[];
}

export class TokenManager {
  public group: THREE.Group;
  public tokens: Map<string, TokenInstance> = new Map();
  private tilePositions: THREE.Vector3[] = [];
  private shadowTexture: THREE.CanvasTexture;

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

    if (tokenType === 'car') {
      // 🚗 Red Classic Car - Glossy candy finish
      const bodyMat = new THREE.MeshLambertMaterial({ color: color || '#FF3838' });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.42, 0.52), bodyMat);
      body.position.y = 0.32;
      body.castShadow = true;

      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.32, 0.44),
        new THREE.MeshLambertMaterial({ color: '#FFFFFF' })
      );
      cabin.position.set(-0.08, 0.58, 0);

      // Headlights
      const lightGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const lightMat = new THREE.MeshLambertMaterial({ color: '#FFF275', emissive: '#FFF275', emissiveIntensity: 0.6 });
      const hl1 = new THREE.Mesh(lightGeo, lightMat);
      hl1.position.set(0.43, 0.32, 0.16);
      const hl2 = new THREE.Mesh(lightGeo, lightMat);
      hl2.position.set(0.43, 0.32, -0.16);

      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 12);
      const wheelMat = new THREE.MeshLambertMaterial({ color: '#2D3436' });
      wheelGeo.rotateZ(Math.PI / 2);

      const w1 = new THREE.Mesh(wheelGeo, wheelMat);
      w1.position.set(-0.25, 0.14, 0.28);
      const w2 = new THREE.Mesh(wheelGeo, wheelMat);
      w2.position.set(0.25, 0.14, 0.28);
      const w3 = new THREE.Mesh(wheelGeo, wheelMat);
      w3.position.set(-0.25, 0.14, -0.28);
      const w4 = new THREE.Mesh(wheelGeo, wheelMat);
      w4.position.set(0.25, 0.14, -0.28);

      tokenGroup.add(body, cabin, hl1, hl2, w1, w2, w3, w4);
    } else if (tokenType === 'hat') {
      // 🎩 Golden Top Hat
      const hatMat = new THREE.MeshLambertMaterial({
        color: color || '#FDCB6E',
        emissive: '#FDCB6E',
        emissiveIntensity: 0.15
      });
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.08, 16), hatMat);
      brim.position.y = 0.08;

      const ribbon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.36, 0.14, 16),
        new THREE.MeshLambertMaterial({ color: '#6C5CE7' })
      );
      ribbon.position.y = 0.2;

      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.34, 0.68, 16), hatMat);
      crown.position.y = 0.58;

      tokenGroup.add(brim, ribbon, crown);
    } else if (tokenType === 'dog') {
      // 🐕 Lucky Dog
      const dogMat = new THREE.MeshLambertMaterial({ color: color || '#E17055' });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.52, 0.46), dogMat);
      body.position.y = 0.36;

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), dogMat);
      head.position.set(0.32, 0.62, 0);

      const ears = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.26, 0.48),
        new THREE.MeshLambertMaterial({ color: '#636E72' })
      );
      ears.position.set(0.3, 0.76, 0);

      const snout = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.14, 0.2),
        new THREE.MeshLambertMaterial({ color: '#2D3436' })
      );
      snout.position.set(0.54, 0.58, 0);

      const bell = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        new THREE.MeshLambertMaterial({ color: '#FDCB6E', emissive: '#FDCB6E', emissiveIntensity: 0.5 })
      );
      bell.position.set(0.48, 0.38, 0);

      tokenGroup.add(body, head, ears, snout, bell);
    } else {
      // 🚀 Space Rocket
      const rocketMat = new THREE.MeshLambertMaterial({ color: color || '#0984E3' });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.85, 16), rocketMat);
      body.position.y = 0.52;

      const nose = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.38, 16),
        new THREE.MeshLambertMaterial({ color: '#FF7675' })
      );
      nose.position.y = 1.1;

      const finGeo = new THREE.BoxGeometry(0.06, 0.32, 0.65);
      const finMat = new THREE.MeshLambertMaterial({ color: '#74B9FF' });
      const fin1 = new THREE.Mesh(finGeo, finMat);
      fin1.position.y = 0.32;
      const fin2 = new THREE.Mesh(finGeo, finMat);
      fin2.position.y = 0.32;
      fin2.rotation.y = Math.PI / 2;

      tokenGroup.add(body, nose, fin1, fin2);
    }

    // Add Baked Contact Shadow Disc underneath token
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
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
      shadowDisc,
      isMoving: false,
      pathQueue: []
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

      const duration = 190; // ms per tile
      const startTime = performance.now();

      const hopStep = (time: number) => {
        const elapsed = time - startTime;
        const t = Math.min(1, elapsed / duration);

        // Parabolic jump curve
        const hopHeight = Math.sin(t * Math.PI) * 0.95;
        token.mesh.position.lerpVectors(startPos, endPos, t);
        token.mesh.position.y = startPos.y + hopHeight;

        // Squash & Stretch dynamics
        const tokenMeshGroup = token.mesh.children[1] as THREE.Group;
        if (tokenMeshGroup) {
          if (t < 0.7) {
            // Stretch while in air
            const stretch = 1 + Math.sin(t * Math.PI) * 0.18;
            const squashXZ = 1 - Math.sin(t * Math.PI) * 0.09;
            tokenMeshGroup.scale.set(squashXZ, stretch, squashXZ);
          } else {
            // Squash upon landing impact
            const impactT = (t - 0.7) / 0.3;
            const squashY = 1 - Math.sin(impactT * Math.PI) * 0.22;
            const stretchXZ = 1 + Math.sin(impactT * Math.PI) * 0.12;
            tokenMeshGroup.scale.set(stretchXZ, squashY, stretchXZ);
          }
        }

        // Contact shadow scaling with height
        const shadowScale = THREE.MathUtils.lerp(1.0, 0.45, hopHeight / 0.95);
        token.shadowDisc.scale.set(shadowScale, shadowScale, 1);
        (token.shadowDisc.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(0.85, 0.25, hopHeight / 0.95);

        // Direction facing
        const dir = endPos.clone().sub(startPos).normalize();
        if (dir.lengthSq() > 0.001) {
          const angle = Math.atan2(dir.x, dir.z);
          token.mesh.rotation.y = angle;
        }

        if (t < 1) {
          requestAnimationFrame(hopStep);
        } else {
          token.mesh.position.copy(endPos);
          if (tokenMeshGroup) tokenMeshGroup.scale.set(1, 1, 1);
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

  public setTokenTileImmediate(userId: string, tileIndex: number, slot: number) {
    const token = this.tokens.get(userId);
    if (!token) return;
    const pos = this.getTilePosition(tileIndex, slot);
    token.mesh.position.copy(pos);
    token.currentTile = tileIndex;
  }
}
