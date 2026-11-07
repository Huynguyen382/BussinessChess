import * as THREE from 'three';

export type TokenType = 'car' | 'hat' | 'dog' | 'rocket';

export interface TokenInstance {
  userId: string;
  tokenType: TokenType;
  color: string;
  currentTile: number;
  mesh: THREE.Group;
  isMoving: boolean;
  pathQueue: number[];
}

export class TokenManager {
  public group: THREE.Group;
  public tokens: Map<string, TokenInstance> = new Map();
  private tilePositions: THREE.Vector3[] = [];

  constructor() {
    this.group = new THREE.Group();
  }

  public setTilePositions(positions: THREE.Vector3[]) {
    this.tilePositions = positions;
  }

  public getTilePosition(tileIndex: number, slotOffset = 0): THREE.Vector3 {
    const base = this.tilePositions[tileIndex] || new THREE.Vector3(0, 0, 0);
    // Offset slightly per player slot so tokens on the same tile don't collide
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
      // 🚗 Red Classic Car
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.4, 0.5),
        new THREE.MeshLambertMaterial({ color: color || '#FF3838' })
      );
      body.position.y = 0.3;
      body.castShadow = true;

      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.3, 0.42),
        new THREE.MeshLambertMaterial({ color: '#FFFFFF' })
      );
      cabin.position.set(-0.08, 0.55, 0);

      // 4 Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 12);
      const wheelMat = new THREE.MeshLambertMaterial({ color: '#2D3436' });
      wheelGeo.rotateZ(Math.PI / 2);

      const w1 = new THREE.Mesh(wheelGeo, wheelMat);
      w1.position.set(-0.25, 0.14, 0.26);
      const w2 = new THREE.Mesh(wheelGeo, wheelMat);
      w2.position.set(0.25, 0.14, 0.26);
      const w3 = new THREE.Mesh(wheelGeo, wheelMat);
      w3.position.set(-0.25, 0.14, -0.26);
      const w4 = new THREE.Mesh(wheelGeo, wheelMat);
      w4.position.set(0.25, 0.14, -0.26);

      tokenGroup.add(body, cabin, w1, w2, w3, w4);
    } else if (tokenType === 'hat') {
      // 🎩 Golden Top Hat
      const brim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 0.08, 16),
        new THREE.MeshLambertMaterial({ color: color || '#FDCB6E' })
      );
      brim.position.y = 0.08;

      const ribbon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.14, 16),
        new THREE.MeshLambertMaterial({ color: '#6C5CE7' })
      );
      ribbon.position.y = 0.2;

      const crown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.34, 0.65, 16),
        new THREE.MeshLambertMaterial({ color: color || '#FDCB6E' })
      );
      crown.position.y = 0.55;

      tokenGroup.add(brim, ribbon, crown);
    } else if (tokenType === 'dog') {
      // 🐕 Lucky Dog
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.5, 0.45),
        new THREE.MeshLambertMaterial({ color: color || '#E17055' })
      );
      body.position.y = 0.35;

      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.4, 0.4),
        new THREE.MeshLambertMaterial({ color: color || '#E17055' })
      );
      head.position.set(0.3, 0.6, 0);

      const ears = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.25, 0.46),
        new THREE.MeshLambertMaterial({ color: '#636E72' })
      );
      ears.position.set(0.28, 0.72, 0);

      const bell = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshLambertMaterial({ color: '#FDCB6E' })
      );
      bell.position.set(0.45, 0.38, 0);

      tokenGroup.add(body, head, ears, bell);
    } else {
      // 🚀 Space Rocket
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 0.8, 16),
        new THREE.MeshLambertMaterial({ color: color || '#0984E3' })
      );
      body.position.y = 0.5;

      const nose = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.35, 16),
        new THREE.MeshLambertMaterial({ color: '#FF7675' })
      );
      nose.position.y = 1.05;

      const finGeo = new THREE.BoxGeometry(0.05, 0.3, 0.6);
      const finMat = new THREE.MeshLambertMaterial({ color: '#74B9FF' });
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.y = 0.3;

      tokenGroup.add(body, nose, fin);
    }

    const pos = this.getTilePosition(0, slot);
    tokenGroup.position.copy(pos);

    this.group.add(tokenGroup);
    this.tokens.set(userId, {
      userId,
      tokenType,
      color,
      currentTile: 0,
      mesh: tokenGroup,
      isMoving: false,
      pathQueue: []
    });

    return tokenGroup;
  }

  public moveTokenSteps(userId: string, fromTile: number, toTile: number, slot: number, onDone?: () => void) {
    const token = this.tokens.get(userId);
    if (!token) return;

    // Calculate step by step path
    const path: number[] = [];
    let cur = fromTile;
    while (cur !== toTile) {
      cur = (cur + 1) % 40;
      path.push(cur);
    }

    if (path.length === 0) {
      if (onDone) onDone();
      return;
    }

    let stepIndex = 0;
    const animateNextStep = () => {
      if (stepIndex >= path.length) {
        token.currentTile = toTile;
        token.isMoving = false;
        if (onDone) onDone();
        return;
      }

      const targetTile = path[stepIndex];
      const startPos = token.mesh.position.clone();
      const endPos = this.getTilePosition(targetTile, slot);
      stepIndex++;

      // Parabolic jump animation
      const duration = 180; // ms per tile
      const startTime = performance.now();

      const hopStep = (time: number) => {
        const elapsed = time - startTime;
        const t = Math.min(1, elapsed / duration);

        token.mesh.position.lerpVectors(startPos, endPos, t);
        token.mesh.position.y = startPos.y + Math.sin(t * Math.PI) * 0.85;

        // Rotate facing direction
        const dir = endPos.clone().sub(startPos).normalize();
        if (dir.lengthSq() > 0.001) {
          const angle = Math.atan2(dir.x, dir.z);
          token.mesh.rotation.y = angle;
        }

        if (t < 1) {
          requestAnimationFrame(hopStep);
        } else {
          token.mesh.position.copy(endPos);
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
