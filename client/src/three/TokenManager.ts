import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { VFXManager } from './VFXManager';

export type TokenType =
  | 'car'
  | 'hat'
  | 'dog'
  | 'rocket'
  | 'cyclo'
  | 'lotus'
  | 'dragon'
  | 'yacht'
  | 'robot'
  | 'crown';

export interface TokenInstance {
  userId: string;
  tokenType: TokenType;
  color: string;
  trailEffect?: string;
  currentTile: number;
  mesh: THREE.Group;
  innerModel: THREE.Group;
  shadowDisc: THREE.Mesh;
  isMoving: boolean;
  pathQueue: number[];
  activeRafId?: number;
  wheels?: THREE.Mesh[];
  ears?: THREE.Mesh | THREE.Group;
  thrusterFlame?: THREE.Mesh;
  tail?: THREE.Mesh;
}

export class TokenManager {
  // BoardScene places tile centers at y = 0.15 with tileHeight = 0.3 (top surface at y = 0.305)
  private static readonly TILE_SURFACE_Y_OFFSET = 0.155;

  public group: THREE.Group;
  public tokens: Map<string, TokenInstance> = new Map();
  private tilePositions: THREE.Vector3[] = [];
  private shadowTexture: THREE.CanvasTexture;
  private vfxManager: VFXManager | null = null;
  private animClock = 0;

  // 3D Turn Pointer Indicator Arrow (Mũi tên trỏ vào nhân vật lượt đi)
  public arrowGroup: THREE.Group;
  public arrowConeGroup: THREE.Group;
  public arrowConeMat: THREE.MeshStandardMaterial;
  public arrowHaloMesh: THREE.Mesh;
  public arrowSprite: THREE.Sprite | null = null;
  public activeUserId: string | null = null;

  constructor() {
    this.group = new THREE.Group();
    this.shadowTexture = this.createContactShadowTexture();

    const arrowParts = this.createTurnArrow();
    this.arrowGroup = arrowParts.group;
    this.arrowConeGroup = arrowParts.coneGroup;
    this.arrowConeMat = arrowParts.mat;
    this.arrowHaloMesh = arrowParts.halo;
    this.group.add(this.arrowGroup);
  }

  private createTurnArrow(): { group: THREE.Group; coneGroup: THREE.Group; mat: THREE.MeshStandardMaterial; halo: THREE.Mesh } {
    const root = new THREE.Group();
    const coneGroup = new THREE.Group();

    // 1. Mũi tên nhọn 3D chỉ thẳng xuống nhân vật (Inverted Cone)
    const coneGeo = new THREE.ConeGeometry(0.28, 0.55, 16);
    coneGeo.rotateX(Math.PI);
    coneGeo.translate(0, 0.28, 0);

    const mat = new THREE.MeshStandardMaterial({
      color: '#00B894',
      emissive: '#00B894',
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.7
    });
    const coneMesh = new THREE.Mesh(coneGeo, mat);

    // 2. Thân trên mũi tên (Prism / Cylinder shaft)
    const shaftGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.38, 16);
    shaftGeo.translate(0, 0.74, 0);
    const shaftMesh = new THREE.Mesh(shaftGeo, mat);

    // 3. Viên ngọc kim cương phát sáng trên đỉnh mũi tên (Diamond Top Gem)
    const gemGeo = new THREE.OctahedronGeometry(0.16, 0);
    gemGeo.translate(0, 1.05, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      emissive: '#FFEAA7',
      emissiveIntensity: 0.95,
      roughness: 0.1,
      metalness: 0.9
    });
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);

    coneGroup.add(coneMesh, shaftMesh, gemMesh);

    // 4. Vòng hào quang phát sáng dưới mũi tên (Pulsing Halo Ring)
    const haloGeo = new THREE.TorusGeometry(0.35, 0.035, 8, 24);
    haloGeo.rotateX(Math.PI / 2);
    haloGeo.translate(0, -0.05, 0);
    const haloMat = new THREE.MeshBasicMaterial({
      color: '#FFFFFF',
      transparent: true,
      opacity: 0.85
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);

    root.add(coneGroup, haloMesh);
    root.visible = false;

    return { group: root, coneGroup, mat, halo: haloMesh };
  }

  private drawRoundedRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
    if (!ctx || !ctx.beginPath) return;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    if (ctx.quadraticCurveTo) ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    if (ctx.quadraticCurveTo) ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    if (ctx.quadraticCurveTo) ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    if (ctx.quadraticCurveTo) ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  public updateArrowBadge(username: string, color: string) {
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    if (!canvas || !canvas.getContext) return;
    canvas.width = 256;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background pill with dark glass look
    ctx.fillStyle = 'rgba(29, 36, 43, 0.92)';
    this.drawRoundedRect(ctx, 4, 4, 248, 64, 32);
    if (ctx.fill) ctx.fill();

    // Border with player color
    ctx.strokeStyle = color || '#00B894';
    ctx.lineWidth = 4;
    if (ctx.stroke) ctx.stroke();

    // Player text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (ctx.fillText) {
      const displayName = username.length > 12 ? username.slice(0, 11) + '…' : username;
      ctx.fillText(`▶ ${displayName}`, 128, 36);
    }

    const texture = new THREE.CanvasTexture(canvas);
    if (!this.arrowSprite) {
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
      this.arrowSprite = new THREE.Sprite(spriteMat);
      this.arrowSprite.scale.set(1.5, 0.42, 1);
      this.arrowSprite.position.set(0, 1.45, 0);
      this.arrowGroup.add(this.arrowSprite);
    } else {
      const mat = this.arrowSprite.material as THREE.SpriteMaterial;
      if (mat.map) mat.map.dispose();
      mat.map = texture;
      mat.needsUpdate = true;
    }
  }

  public setActiveTurnPlayer(userId: string | null, username?: string, color?: string) {
    this.activeUserId = userId;
    if (!userId) {
      this.arrowGroup.visible = false;
      return;
    }

    const token = this.tokens.get(userId);
    if (token) {
      this.arrowGroup.visible = true;
      const playerColor = color || token.color || '#00B894';
      this.arrowConeMat.color.set(playerColor);
      this.arrowConeMat.emissive.set(playerColor);

      const name = username || `Người chơi`;
      this.updateArrowBadge(name, playerColor);

      // Snap arrow position above token right away
      const tokenPos = token.mesh.position;
      this.arrowGroup.position.set(tokenPos.x, tokenPos.y + 1.65, tokenPos.z);
    } else {
      this.arrowGroup.visible = false;
    }
  }

  public clearTokens() {
    for (const token of this.tokens.values()) {
      this.cancelTokenAnimation(token);
    }
    this.group.clear();
    this.group.add(this.arrowGroup);
    this.tokens.clear();
    this.activeUserId = null;
    this.arrowGroup.visible = false;
  }

  private cancelTokenAnimation(token: TokenInstance) {
    if (token.activeRafId !== undefined && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(token.activeRafId);
    }
    token.activeRafId = undefined;
    token.isMoving = false;
    token.mesh.rotation.x = 0;
    if (token.innerModel) {
      token.innerModel.scale.set(1, 1, 1);
    }
    token.shadowDisc.scale.set(1, 1, 1);
    (token.shadowDisc.material as THREE.MeshBasicMaterial).opacity = 0.85;
  }

  private createContactShadowTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(45, 52, 54, 0.45)');
    grad.addColorStop(0.5, 'rgba(45, 52, 54, 0.18)');
    grad.addColorStop(1, 'rgba(45, 52, 54, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }

  public setTilePositions(positions: THREE.Vector3[]) {
    this.tilePositions = positions;
  }

  public setVFXManager(vfx: VFXManager) {
    this.vfxManager = vfx;
  }

  public getTilePosition(tileIndex: number, slotOffset = 0): THREE.Vector3 {
    const base = this.tilePositions[tileIndex] || new THREE.Vector3(0, 0, 0);
    const offsets = [
      new THREE.Vector3(-0.35, 0, -0.35),
      new THREE.Vector3(0.35, 0, -0.35),
      new THREE.Vector3(-0.35, 0, 0.35),
      new THREE.Vector3(0.35, 0, 0.35)
    ];
    const result = base.clone().add(offsets[slotOffset % 4]);
    result.y += TokenManager.TILE_SURFACE_Y_OFFSET;
    return result;
  }

  public createToken(userId: string, tokenType: TokenType | string, color: string, slot: number, trailEffect?: string): THREE.Group {
    const validTypes: TokenType[] = ['car', 'hat', 'dog', 'rocket', 'cyclo', 'lotus', 'dragon', 'yacht', 'robot', 'crown'];
    const resolvedType: TokenType = validTypes.includes(tokenType as TokenType) ? (tokenType as TokenType) : 'car';
    const tokenGroup = new THREE.Group();
    const wheels: THREE.Mesh[] = [];
    let earsMesh: THREE.Group | undefined;
    let flameMesh: THREE.Mesh | undefined;
    let tailMesh: THREE.Mesh | undefined;

    if (resolvedType === 'car') {
      // ==========================================
      // 🚗 1. SIÊU XE CỔ ĐIỂN TỶ PHÚ (Billionaire Classic Roadster)
      // ==========================================
      const carColor = color || '#E74C3C';
      const bodyMat = new THREE.MeshStandardMaterial({
        color: carColor,
        roughness: 0.10,
        metalness: 0.45
      });
      const chromeMat = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        metalness: 0.98,
        roughness: 0.04
      });
      const leatherMat = new THREE.MeshStandardMaterial({
        color: '#8D6E63',
        roughness: 0.65,
        metalness: 0.1
      });
      const glassMat = new THREE.MeshStandardMaterial({
        color: '#E0F7FA',
        roughness: 0.05,
        metalness: 0.15,
        transparent: true,
        opacity: 0.72
      });

      // 1. Thân xe khí động học cổ điển (Main Torpedo Body & Fenders)
      const mainChassis = new THREE.Mesh(new RoundedBoxGeometry(0.96, 0.28, 0.52, 4, 0.08), bodyMat);
      mainChassis.position.y = 0.22;
      mainChassis.castShadow = true;

      // Nắp ca-pô cong dài phía trước với gờ sống lưng mạ crom
      const hoodMesh = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.12, 0.46, 3, 0.05), bodyMat);
      hoodMesh.position.set(0.24, 0.32, 0);

      const hoodSpine = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.02, 0.02), chromeMat);
      hoodSpine.position.set(0.24, 0.39, 0);

      // Biểu tượng linh vật nữ thần tốc độ trên đầu ca-pô
      const mascot = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.1, 8), chromeMat);
      mascot.rotation.z = -Math.PI / 3;
      mascot.position.set(0.48, 0.42, 0);

      // Lưới tản nhiệt thác nước mạ crom cổ điển (Vertical Chrome Waterfall Grille)
      const grille = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.24, 0.36, 2, 0.02), chromeMat);
      grille.position.set(0.49, 0.24, 0);

      // 2 Nẹp crom chạy dọc hai bên sườn xe
      [-0.265, 0.265].forEach(sz => {
        const sideSpear = new THREE.Mesh(new THREE.BoxGeometry(0.90, 0.02, 0.015), chromeMat);
        sideSpear.position.set(0, 0.24, sz);
        tokenGroup.add(sideSpear);
      });

      // 4 Hốc bánh xe cơ bắp (Sculpted Wheel Arches / Fenders)
      const makeFender = (fx: number, fz: number) => {
        const fender = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.16, 0.07, 3, 0.03), bodyMat);
        fender.position.set(fx, 0.22, fz);
        tokenGroup.add(fender);
      };
      makeFender(-0.25, 0.27);
      makeFender(0.25, 0.27);
      makeFender(-0.25, -0.27);
      makeFender(0.25, -0.27);

      // 2. Kính chắn gió nghiêng phong cách Cabriolet (Tilted Windshield & Chrome Frame)
      const windshieldGroup = new THREE.Group();
      windshieldGroup.position.set(0.08, 0.36, 0);
      windshieldGroup.rotation.z = -0.32; // Tilted back

      const windGlass = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.24, 0.42, 2, 0.01), glassMat);
      const windFrame = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.26, 0.44, 2, 0.02), chromeMat);
      windFrame.scale.set(1.02, 1.02, 1.02);
      windshieldGroup.add(windGlass, windFrame);

      // 3. Khoang lái da sang trọng & Vô-lăng gỗ (Leather Interior & Steering Wheel)
      const interiorTub = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.16, 0.38, 2, 0.03), leatherMat);
      interiorTub.position.set(-0.12, 0.28, 0);

      const seatBack = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.22, 0.36, 2, 0.03), leatherMat);
      seatBack.position.set(-0.28, 0.38, 0);

      const steeringWheel = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.012, 6, 16), chromeMat);
      steeringWheel.rotation.y = Math.PI / 2;
      steeringWheel.rotation.x = -0.4;
      steeringWheel.position.set(0.02, 0.36, 0.08);

      // Gương chiếu hậu mạ crom hai bên
      [-0.26, 0.26].forEach(mz => {
        const mirror = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), chromeMat);
        mirror.position.set(0.06, 0.38, mz);
        tokenGroup.add(mirror);
      });

      // 4. Đèn pha đôi & Đèn hậu đôi (Twin Headlights & Tail Lights)
      const headRimGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16);
      headRimGeo.rotateZ(Math.PI / 2);
      const headLensGeo = new THREE.SphereGeometry(0.065, 12, 12);
      const headLensMat = new THREE.MeshStandardMaterial({
        color: '#FFFDE7',
        emissive: '#FFF9C4',
        emissiveIntensity: 1.2
      });
      [-0.17, 0.17].forEach(lz => {
        const rim = new THREE.Mesh(headRimGeo, chromeMat);
        rim.position.set(0.48, 0.26, lz);
        const lens = new THREE.Mesh(headLensGeo, headLensMat);
        lens.position.set(0.50, 0.26, lz);
        tokenGroup.add(rim, lens);
      });

      const tailMat = new THREE.MeshStandardMaterial({
        color: '#FF1744',
        emissive: '#D50000',
        emissiveIntensity: 1.2
      });
      [-0.18, 0.18].forEach(tz => {
        const tl = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), tailMat);
        tl.position.set(-0.49, 0.25, tz);
        tokenGroup.add(tl);
      });

      // Cản trước & cản sau cong mạ crom
      const fBump = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.08, 0.54, 2, 0.02), chromeMat);
      fBump.position.set(0.50, 0.15, 0);
      const rBump = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.08, 0.54, 2, 0.02), chromeMat);
      rBump.position.set(-0.50, 0.15, 0);

      // Ống xả đôi mạ crom thể thao phía sau
      [-0.12, 0.12].forEach(ez => {
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.10, 10), chromeMat);
        pipe.rotation.z = Math.PI / 2;
        pipe.position.set(-0.52, 0.13, ez);
        tokenGroup.add(pipe);
      });

      // 5. Bánh dự phòng phía sau (Classic Rear Spare Wheel with Chrome Cap)
      const spareGroup = new THREE.Group();
      spareGroup.position.set(-0.50, 0.32, 0);
      spareGroup.rotation.y = Math.PI / 2;
      spareGroup.rotation.x = -0.25;
      const spareTire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.07, 16), new THREE.MeshStandardMaterial({ color: '#212121', roughness: 0.85 }));
      spareTire.rotation.x = Math.PI / 2;
      const spareCap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 12), chromeMat);
      spareCap.rotation.x = Math.PI / 2;
      spareGroup.add(spareTire, spareCap);
      tokenGroup.add(spareGroup);

      // 6. 4 Bánh xe lốp cao su + Mâm nan hoa crom (4 Multi-Spoke Chrome Wheels)
      const tireGeo = new THREE.CylinderGeometry(0.135, 0.135, 0.09, 18);
      tireGeo.rotateZ(Math.PI / 2);
      const tireMat = new THREE.MeshStandardMaterial({ color: '#1E272E', roughness: 0.85 });
      const hubGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.095, 14);
      hubGeo.rotateZ(Math.PI / 2);
      const nutGeo = new THREE.ConeGeometry(0.035, 0.04, 6);
      nutGeo.rotateZ(-Math.PI / 2);

      const makeCarWheel = (wx: number, wz: number) => {
        const wGroup = new THREE.Group();
        wGroup.position.set(wx, 0.135, wz);
        const tire = new THREE.Mesh(tireGeo, tireMat);
        tire.castShadow = true;
        const hub = new THREE.Mesh(hubGeo, chromeMat);
        const nut = new THREE.Mesh(nutGeo, chromeMat);
        nut.position.x = wz > 0 ? 0.05 : -0.05;
        if (wz < 0) nut.rotation.z = Math.PI / 2;

        // Nan hoa la-zăng
        for (let s = 0; s < 4; s++) {
          const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.13, 0.012), chromeMat);
          spoke.rotation.x = (s * Math.PI) / 4;
          spoke.position.x = wz > 0 ? 0.048 : -0.048;
          wGroup.add(spoke);
        }

        wGroup.add(tire, hub, nut);
        tokenGroup.add(wGroup);
        wheels.push(tire);
      };

      makeCarWheel(-0.25, 0.27);
      makeCarWheel(0.25, 0.27);
      makeCarWheel(-0.25, -0.27);
      makeCarWheel(0.25, -0.27);

      tokenGroup.add(mainChassis, hoodMesh, hoodSpine, mascot, grille, windshieldGroup, interiorTub, seatBack, steeringWheel, fBump, rBump);

    } else if (resolvedType === 'hat') {
      // ==========================================
      // 🎩 2. MŨ PHỚT BÁ TƯỚC TỶ PHÚ & MONOCLE (Billionaire Baron Top Hat)
      // ==========================================
      const hatColor = color || '#2D3436';
      const feltMat = new THREE.MeshStandardMaterial({
        color: hatColor,
        roughness: 0.35,
        metalness: 0.12
      });
      const goldMat = new THREE.MeshStandardMaterial({
        color: '#F1C40F',
        emissive: '#F39C12',
        emissiveIntensity: 0.25,
        metalness: 0.95,
        roughness: 0.1
      });
      const velvetRibbonMat = new THREE.MeshStandardMaterial({
        color: '#9B59B6',
        roughness: 0.4,
        emissive: '#8E44AD',
        emissiveIntensity: 0.2
      });

      // 1. Vành mũ cong uốn lượn phong cách quý tộc (Curved Sculpted Brim)
      const brimMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.65, 0.06, 32), feltMat);
      brimMesh.position.y = 0.08;
      brimMesh.scale.set(1.08, 1, 0.92);
      brimMesh.castShadow = true;

      // Viền vàng bo mép vành mũ
      const brimGoldRim = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.016, 8, 32), goldMat);
      brimGoldRim.rotation.x = Math.PI / 2;
      brimGoldRim.scale.set(1.08, 0.92, 1);
      brimGoldRim.position.y = 0.08;

      // 2. Thân mũ chóp loe đặc trưng (Fluted Top Hat Crown)
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.37, 0.76, 32), feltMat);
      crown.position.y = 0.48;
      crown.castShadow = true;

      // Nắp đỉnh mũ vát lõm nhẹ
      const crownTop = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.44, 0.05, 32), feltMat);
      crownTop.position.y = 0.87;

      const crownGoldRim = new THREE.Mesh(new THREE.TorusGeometry(0.435, 0.012, 6, 32), goldMat);
      crownGoldRim.rotation.x = Math.PI / 2;
      crownGoldRim.position.y = 0.88;

      // 3. Ruy-băng nhung hoàng gia & Dây chỉ vàng (Royal Velvet Ribbon & Gold Braids)
      const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.375, 0.15, 32), velvetRibbonMat);
      ribbon.position.y = 0.18;

      const ribbonGoldBottom = new THREE.Mesh(new THREE.TorusGeometry(0.382, 0.012, 6, 32), goldMat);
      ribbonGoldBottom.rotation.x = Math.PI / 2;
      ribbonGoldBottom.position.y = 0.11;

      const ribbonGoldTop = new THREE.Mesh(new THREE.TorusGeometry(0.385, 0.012, 6, 32), goldMat);
      ribbonGoldTop.rotation.x = Math.PI / 2;
      ribbonGoldTop.position.y = 0.25;

      // 4. Khóa vàng chạm trổ & Viên ngọc Sapphire (Beveled Gold Buckle & Gem)
      const buckle = new THREE.Mesh(new RoundedBoxGeometry(0.13, 0.16, 0.06, 2, 0.02), goldMat);
      buckle.position.set(0.39, 0.18, 0);

      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.055),
        new THREE.MeshStandardMaterial({ color: '#0984E3', emissive: '#74B9FF', emissiveIntensity: 0.9, roughness: 0.05 })
      );
      gem.position.set(0.43, 0.18, 0);

      // Chiếc lông vũ trắng kiêu kỳ
      const featherMat = new THREE.MeshStandardMaterial({ color: '#FDFEFE', roughness: 0.35 });
      const feather = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.46, 8), featherMat);
      feather.position.set(0.35, 0.42, 0.10);
      feather.rotation.z = -Math.PI / 6;

      // 5. Kính một tròng Monocle vàng & Dây xích vàng tỷ phú (Billionaire Gold Monocle)
      const monocleGroup = new THREE.Group();
      monocleGroup.position.set(0.42, 0.48, -0.22);
      monocleGroup.rotation.y = 0.4;

      const monocleRim = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.01, 8, 20), goldMat);
      const monocleGlass = new THREE.Mesh(
        new THREE.CircleGeometry(0.085, 20),
        new THREE.MeshStandardMaterial({ color: '#E0F7FA', transparent: true, opacity: 0.65, roughness: 0.02 })
      );
      monocleRim.rotation.y = Math.PI / 2;
      monocleGlass.rotation.y = Math.PI / 2;

      // Dây xích vàng rủ xuống
      const chain1 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.32, 6), goldMat);
      chain1.position.set(-0.06, -0.16, 0);
      chain1.rotation.z = 0.3;

      // Huy hiệu đồng tiền vàng nhỏ lủng lẳng dưới dây xích
      const coinMedal = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.015, 12), goldMat);
      coinMedal.rotation.x = Math.PI / 2;
      coinMedal.position.set(-0.11, -0.32, 0);

      monocleGroup.add(monocleRim, monocleGlass, chain1, coinMedal);

      tokenGroup.add(brimMesh, brimGoldRim, crown, crownTop, crownGoldRim, ribbon, ribbonGoldBottom, ribbonGoldTop, buckle, gem, feather, monocleGroup);

    } else if (resolvedType === 'dog') {
      // ==========================================
      // 🐕 3. CÚN VÀNG TỶ PHÚ (Billionaire Lucky Pug Puppy)
      // ==========================================
      const furColor = color || '#E58E26';
      const furMat = new THREE.MeshStandardMaterial({ color: furColor, roughness: 0.48 });
      const bellyMat = new THREE.MeshStandardMaterial({ color: '#FFEAA7', roughness: 0.52 });
      const darkFurMat = new THREE.MeshStandardMaterial({ color: '#2C3A47', roughness: 0.5 });
      const goldMat = new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.95, roughness: 0.12 });

      // 1. Thân cún mũm mĩm & Đốm bụng kem
      const body = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.56, 0.52, 4, 0.16), furMat);
      body.position.y = 0.36;
      body.castShadow = true;

      const belly = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), bellyMat);
      belly.scale.set(1.0, 0.85, 0.35);
      belly.position.set(0.16, 0.32, 0);

      // 2. Đầu cún tròn má phính
      const head = new THREE.Mesh(new RoundedBoxGeometry(0.50, 0.48, 0.48, 4, 0.15), furMat);
      head.position.set(0.32, 0.65, 0);
      head.castShadow = true;

      // Mõm đen đặc trưng
      const muzzle = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.20, 0.26, 3, 0.07), darkFurMat);
      muzzle.position.set(0.58, 0.59, 0);

      // Mũi đen ướt bóng
      const nose = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 10, 10),
        new THREE.MeshStandardMaterial({ color: '#1E272E', roughness: 0.04 })
      );
      nose.position.set(0.69, 0.65, 0);

      // Lưỡi hồng hé nở
      const tongue = new THREE.Mesh(
        new RoundedBoxGeometry(0.08, 0.04, 0.11, 2, 0.01),
        new THREE.MeshStandardMaterial({ color: '#FF7675', roughness: 0.2 })
      );
      tongue.position.set(0.65, 0.53, 0.02);
      tongue.rotation.z = Math.PI / 8;

      // Đôi mắt to tròn với 2 đốm sáng phản quang (Double catchlight)
      const eyeMat = new THREE.MeshStandardMaterial({ color: '#1E272E', roughness: 0.05 });
      const catchMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
      [-0.14, 0.14].forEach(ez => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), eyeMat);
        eye.position.set(0.54, 0.72, ez);
        const catch1 = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), catchMat);
        catch1.position.set(0.59, 0.75, ez + (ez > 0 ? 0.015 : -0.015));
        const catch2 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), catchMat);
        catch2.position.set(0.60, 0.70, ez - (ez > 0 ? 0.015 : -0.015));
        tokenGroup.add(eye, catch1, catch2);
      });

      // 3. Đôi tai mềm rủ xuống biểu cảm (earsMesh)
      earsMesh = new THREE.Group();
      const ear1 = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.32, 0.18, 2, 0.05), darkFurMat);
      ear1.position.set(0.28, 0.78, 0.27);
      ear1.rotation.x = Math.PI / 8;
      const ear2 = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.32, 0.18, 2, 0.05), darkFurMat);
      ear2.position.set(0.28, 0.78, -0.27);
      ear2.rotation.x = -Math.PI / 8;
      earsMesh.add(ear1, ear2);

      // 4. Chiếc đuôi xoắn lò xo ngộ nghĩnh (tailMesh)
      const tailGeo = new THREE.TorusGeometry(0.11, 0.048, 8, 16, Math.PI * 1.5);
      tailMesh = new THREE.Mesh(tailGeo, furMat);
      tailMesh.position.set(-0.39, 0.46, 0);
      tailMesh.rotation.y = Math.PI / 2;

      // 5. Vòng cổ đỏ + Thẻ bài vàng tỷ phú (Red Collar & Gold Billionaire Coin Tag)
      const collar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.27, 0.27, 0.09, 20),
        new THREE.MeshStandardMaterial({ color: '#D63031', roughness: 0.3 })
      );
      collar.position.set(0.33, 0.46, 0);

      const goldTag = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), goldMat);
      goldTag.rotation.x = Math.PI / 2;
      goldTag.position.set(0.57, 0.42, 0);

      // 6. Mũ phớt mini của tỷ phú đội lệch trên đầu cún (Mini Billionaire Top Hat)
      const miniHat = new THREE.Group();
      miniHat.position.set(0.28, 0.94, 0.06);
      miniHat.rotation.z = -0.2;
      miniHat.rotation.x = 0.15;
      const mBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 16), new THREE.MeshStandardMaterial({ color: '#2D3436' }));
      const mCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.20, 16), new THREE.MeshStandardMaterial({ color: '#2D3436' }));
      mCrown.position.y = 0.11;
      const mRibbon = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.105, 0.04, 16), goldMat);
      mRibbon.position.y = 0.04;
      miniHat.add(mBrim, mCrown, mRibbon);

      // 7. 4 Bàn chân mập tròn (4 Chubby Paws)
      const pawGeo = new THREE.SphereGeometry(0.105, 12, 12);
      const makePaw = (px: number, pz: number) => {
        const paw = new THREE.Mesh(pawGeo, furMat);
        paw.scale.set(1.1, 0.8, 1.0);
        paw.position.set(px, 0.09, pz);
        tokenGroup.add(paw);
      };
      makePaw(-0.22, 0.22);
      makePaw(0.22, 0.22);
      makePaw(-0.22, -0.22);
      makePaw(0.22, -0.22);

      tokenGroup.add(body, belly, head, muzzle, nose, tongue, collar, goldTag, miniHat);
      if (earsMesh) tokenGroup.add(earsMesh);
      if (tailMesh) tokenGroup.add(tailMesh);

    } else if (resolvedType === 'cyclo') {
      // ==========================================
      // 🚲 5. XÍCH LÔ PHỐ CỔ HÀ NỘI (Hanoi Heritage Cyclo)
      // ==========================================
      const frameColor = color || '#00B894';
      const frameMat = new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.25, metalness: 0.6 });
      const velvetCushionMat = new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.45, emissive: '#962D22', emissiveIntensity: 0.15 });
      const chromeMat = new THREE.MeshStandardMaterial({ color: '#F5F6FA', metalness: 0.96, roughness: 0.05 });
      const tireMat = new THREE.MeshStandardMaterial({ color: '#1E272E', roughness: 0.85 });
      const brassMat = new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.9, roughness: 0.15 });

      // 1. Khoang ghế hành khách & Tay vịn mạ crom (Passenger Seat & Curved Armrests)
      const seatChassis = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.14, 0.46, 3, 0.04), frameMat);
      seatChassis.position.set(0.16, 0.20, 0);
      seatChassis.castShadow = true;

      const seatPad = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.10, 0.42, 3, 0.04), velvetCushionMat);
      seatPad.position.set(0.18, 0.28, 0);

      const seatBack = new THREE.Mesh(new RoundedBoxGeometry(0.10, 0.32, 0.44, 3, 0.04), velvetCushionMat);
      seatBack.position.set(0.01, 0.42, 0);

      // Tay vịn mạ crom hai bên ghế
      [-0.23, 0.23].forEach(az => {
        const armrest = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.016, 6, 16, Math.PI), chromeMat);
        armrest.position.set(0.14, 0.34, az);
        tokenGroup.add(armrest);
      });

      // 2. Mui bạt xếp gập cổ điển với nan giằng cong (Folding Canvas Canopy & Struts)
      const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.48, 16, 1, false, 0, Math.PI), frameMat);
      canopy.rotation.z = Math.PI / 2;
      canopy.rotation.y = Math.PI / 2;
      canopy.position.set(0.12, 0.70, 0);
      canopy.castShadow = true;

      // Nan giằng crom của mui bạt
      [-0.24, 0.24].forEach(cz => {
        const strut1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.32, 6), chromeMat);
        strut1.position.set(0.02, 0.55, cz);
        strut1.rotation.z = -0.3;
        const strut2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.34, 6), chromeMat);
        strut2.position.set(0.14, 0.55, cz);
        strut2.rotation.z = 0.2;
        tokenGroup.add(strut1, strut2);
      });

      // 3. Đèn pha đồng cổ phía trước & Giỏ xe (Vintage Brass Lamp & Cargo Basket)
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.08, 12), brassMat);
      lamp.rotation.z = -Math.PI / 2;
      lamp.position.set(0.42, 0.26, 0);

      const lampLens = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 10, 10),
        new THREE.MeshStandardMaterial({ color: '#FFFDE7', emissive: '#FFEAA7', emissiveIntensity: 1.2 })
      );
      lampLens.position.set(0.46, 0.26, 0);

      const basket = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.12, 0.36, 2, 0.02), chromeMat);
      basket.position.set(0.40, 0.16, 0);

      // 4. Khung xe sau, Yên da, Tay lái & Bàn đạp (Rear Frame, Leather Saddle, Handlebars & Pedals)
      const rearTube1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.48, 8), frameMat);
      rearTube1.rotation.z = 0.4;
      rearTube1.position.set(-0.20, 0.25, 0);

      const seatPost = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.26, 8), chromeMat);
      seatPost.position.set(-0.24, 0.38, 0);

      const saddle = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.06, 0.14, 2, 0.02), tireMat);
      saddle.position.set(-0.24, 0.51, 0);

      const handlebarStem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 8), chromeMat);
      handlebarStem.position.set(-0.08, 0.54, 0);
      handlebarStem.rotation.z = -0.2;

      const handlebarBar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.34, 8), chromeMat);
      handlebarBar.rotation.x = Math.PI / 2;
      handlebarBar.position.set(-0.06, 0.65, 0);

      // 5. 3 Bánh xe nan hoa cổ điển (3 Spoke Wheels: 2 front, 1 rear)
      const makeSpokeWheel = (wx: number, wz: number, radius = 0.16) => {
        const wGroup = new THREE.Group();
        wGroup.position.set(wx, radius, wz);

        const tireMesh = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.025, 8, 20), tireMat);
        tireMesh.rotation.y = Math.PI / 2;
        tireMesh.castShadow = true;

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 10), chromeMat);
        hub.rotation.z = Math.PI / 2;

        // 6 nan hoa chữ X
        for (let sp = 0; sp < 3; sp++) {
          const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, radius * 1.9, 4), chromeMat);
          spoke.rotation.z = (sp * Math.PI) / 3;
          wGroup.add(spoke);
        }

        wGroup.add(tireMesh, hub);
        tokenGroup.add(wGroup);
        wheels.push(tireMesh);
      };

      makeSpokeWheel(0.18, 0.28, 0.16);
      makeSpokeWheel(0.18, -0.28, 0.16);
      makeSpokeWheel(-0.40, 0, 0.16);

      tokenGroup.add(seatChassis, seatPad, seatBack, canopy, lamp, lampLens, basket, rearTube1, seatPost, saddle, handlebarStem, handlebarBar);

    } else if (resolvedType === 'lotus') {
      // ==========================================
      // 🪷 6. ĐÀI SEN VÀNG (Golden Lotus Throne)
      // ==========================================
      const lotusColor = color || '#FD79A8';
      const petalMat = new THREE.MeshStandardMaterial({
        color: lotusColor,
        emissive: lotusColor,
        emissiveIntensity: 0.18,
        roughness: 0.22,
        metalness: 0.2
      });
      const goldMat = new THREE.MeshStandardMaterial({
        color: '#F1C40F',
        metalness: 0.95,
        roughness: 0.12,
        emissive: '#F39C12',
        emissiveIntensity: 0.2
      });
      const jadeMat = new THREE.MeshStandardMaterial({
        color: '#00B894',
        roughness: 0.28,
        metalness: 0.3
      });
      const amberMat = new THREE.MeshStandardMaterial({
        color: '#F39C12',
        emissive: '#F1C40F',
        emissiveIntensity: 0.75,
        roughness: 0.1
      });

      // 1. Bệ đá bát giác viền vàng 2 tầng (Two-Tier Octagonal Jade & Gold Base)
      const baseOct1 = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.58, 0.06, 8), jadeMat);
      baseOct1.position.y = 0.03;
      baseOct1.castShadow = true;

      const baseRimGold = new THREE.Mesh(new THREE.CylinderGeometry(0.53, 0.56, 0.03, 8), goldMat);
      baseRimGold.position.y = 0.075;

      const baseOct2 = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.51, 0.05, 8), jadeMat);
      baseOct2.position.y = 0.11;

      tokenGroup.add(baseOct1, baseRimGold, baseOct2);

      // 2. 3 Tầng cánh sen xếp so le tinh xảo (3 Concentric Tiers of Lotus Petals)
      // Tầng 1: 10 Cánh sen nở xòe rộng tầng ngoài
      const outerPetalGeo = new THREE.ConeGeometry(0.14, 0.38, 8);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const outer = new THREE.Mesh(outerPetalGeo, petalMat);
        outer.position.set(Math.cos(a) * 0.36, 0.22, Math.sin(a) * 0.36);
        outer.rotation.z = -Math.cos(a) * 0.75;
        outer.rotation.x = Math.sin(a) * 0.75;
        outer.castShadow = true;
        tokenGroup.add(outer);
      }

      // Tầng 2: 8 Cánh sen trung ôm lòng
      const midPetalGeo = new THREE.ConeGeometry(0.13, 0.36, 8);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.39;
        const mid = new THREE.Mesh(midPetalGeo, petalMat);
        mid.position.set(Math.cos(a) * 0.26, 0.30, Math.sin(a) * 0.26);
        mid.rotation.z = -Math.cos(a) * 0.50;
        mid.rotation.x = Math.sin(a) * 0.50;
        tokenGroup.add(mid);
      }

      // Tầng 3: 6 Cánh sen vàng ôm sát nhụy
      const innerPetalGeo = new THREE.ConeGeometry(0.11, 0.32, 8);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const inner = new THREE.Mesh(innerPetalGeo, goldMat);
        inner.position.set(Math.cos(a) * 0.16, 0.38, Math.sin(a) * 0.16);
        inner.rotation.z = -Math.cos(a) * 0.28;
        inner.rotation.x = Math.sin(a) * 0.28;
        tokenGroup.add(inner);
      }

      // 3. Đài nhụy sen vàng nổi hạt ngọc (Lotus Seed Pod with Golden Beads)
      const seedHead = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.10, 16), goldMat);
      seedHead.position.y = 0.44;

      // Hạt sen vàng nổi xung quanh
      for (let s = 0; s < 6; s++) {
        const sa = (s / 6) * Math.PI * 2;
        const seedBead = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), amberMat);
        seedBead.position.set(Math.cos(sa) * 0.09, 0.49, Math.sin(sa) * 0.09);
        tokenGroup.add(seedBead);
      }

      // Viên đại minh châu hào quang ở trung tâm
      const centralOrb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.12, 1),
        new THREE.MeshStandardMaterial({ color: '#FFFDE7', emissive: '#FFEAA7', emissiveIntensity: 1.1, roughness: 0.08 })
      );
      centralOrb.position.y = 0.54;
      tokenGroup.add(seedHead, centralOrb);

    } else if (resolvedType === 'dragon') {
      // ==========================================
      // 🐉 7. RỒNG VÀNG THĂNG LONG (Imperial Golden Dragon)
      // ==========================================
      const dragonColor = color || '#F1C40F';
      const dragonMat = new THREE.MeshStandardMaterial({
        color: dragonColor,
        emissive: '#E67E22',
        emissiveIntensity: 0.18,
        metalness: 0.92,
        roughness: 0.14
      });
      const darkJadeMat = new THREE.MeshStandardMaterial({
        color: '#1E272E',
        metalness: 0.4,
        roughness: 0.35
      });
      const rubyMat = new THREE.MeshStandardMaterial({
        color: '#FF1744',
        emissive: '#D50000',
        emissiveIntensity: 1.2
      });

      // 1. Đế mây ngọc cuộn ngũ sắc (Auspicious Cloud Pedestal)
      const cloudBase = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 0.08, 24), darkJadeMat);
      cloudBase.position.y = 0.04;
      cloudBase.castShadow = true;

      const cloudRing = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.02, 8, 24), dragonMat);
      cloudRing.rotation.x = Math.PI / 2;
      cloudRing.position.y = 0.08;
      tokenGroup.add(cloudBase, cloudRing);

      // 2. Thân rồng uốn lượn nhiều đốt hình chữ S (S-Curved Articulated Serpentine Body)
      const numSegments = 9;
      for (let s = 0; s < numSegments; s++) {
        const t = s / (numSegments - 1);
        const radius = 0.16 - t * 0.04;
        const seg = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 12), dragonMat);
        const sx = Math.sin(t * Math.PI * 1.5) * 0.20;
        const sy = 0.16 + t * 0.72;
        const sz = Math.cos(t * Math.PI * 1.5) * 0.18 - 0.04;
        seg.position.set(sx, sy, sz);
        seg.castShadow = true;

        // Vây lưng gai nhọn mạ vàng (Dorsal Spine Fins)
        const finSpike = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 6), dragonMat);
        finSpike.position.set(sx, sy + radius * 0.9, sz);
        finSpike.rotation.x = -0.3;
        tokenGroup.add(seg, finSpike);
      }

      // 3. Đầu rồng uy nghi, sừng nai, râu rồng & Viên ngọc châu (Dragon Head, Antlers, Whiskers & Pearl)
      const head = new THREE.Mesh(new RoundedBoxGeometry(0.30, 0.24, 0.26, 3, 0.07), dragonMat);
      head.position.set(0.08, 0.95, 0.14);
      head.castShadow = true;

      // Cặp sừng rồng rẽ nhánh
      const makeHorn = (hz: number) => {
        const hornMain = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.24, 8), dragonMat);
        hornMain.position.set(0.02, 1.12, hz);
        hornMain.rotation.x = hz > 0.1 ? 0.4 : -0.4;
        hornMain.rotation.z = -0.3;
        const hornBranch = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.12, 6), dragonMat);
        hornBranch.position.set(-0.04, 1.08, hz);
        tokenGroup.add(hornMain, hornBranch);
      };
      makeHorn(0.05);
      makeHorn(0.23);

      // Cặp râu rồng uốn lượn (Dragon Whiskers)
      [-0.03, 0.15].forEach(wz => {
        const whisker = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 6, 16, Math.PI * 0.8), dragonMat);
        whisker.position.set(0.24, 0.90, 0.09 + wz);
        whisker.rotation.y = Math.PI / 2;
        tokenGroup.add(whisker);
      });

      // Đôi mắt ngọc ruby phát sáng
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), rubyMat);
      eyeL.position.set(0.20, 0.99, 0.05);
      const eyeR = eyeL.clone();
      eyeR.position.z = 0.23;

      // Miệng rồng ngậm viên dạ minh châu phát sáng rực rỡ
      const pearl = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 16, 16),
        new THREE.MeshStandardMaterial({ color: '#00CEC9', emissive: '#81ECEC', emissiveIntensity: 1.25, roughness: 0.05 })
      );
      pearl.position.set(0.36, 0.88, 0.14);

      // 4 Móng vuốt rồng bám trên mây
      [-0.24, 0.24].forEach(cx => {
        const claw = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 6), dragonMat);
        claw.position.set(cx, 0.10, 0.25);
        claw.rotation.x = Math.PI / 3;
        tokenGroup.add(claw);
      });

      tokenGroup.add(head, eyeL, eyeR, pearl);

    } else if (resolvedType === 'yacht') {
      // ==========================================
      // ⛵ 8. DU THUYỀN HẠ LONG (Ha Long Royal Luxury Yacht)
      // ==========================================
      const hullMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.12, metalness: 0.15 });
      const woodDeckMat = new THREE.MeshStandardMaterial({ color: '#B37D4E', roughness: 0.65, metalness: 0.05 });
      const stripeMat = new THREE.MeshStandardMaterial({ color: color || '#0984E3', roughness: 0.18, metalness: 0.35 });
      const sapphireGlassMat = new THREE.MeshStandardMaterial({
        color: '#0984E3',
        roughness: 0.04,
        metalness: 0.85,
        transparent: true,
        opacity: 0.85
      });
      const chromeMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', metalness: 0.98, roughness: 0.04 });
      const bronzeMat = new THREE.MeshStandardMaterial({ color: '#CD7F32', metalness: 0.92, roughness: 0.15 });

      // 1. Thân tàu mũi chữ V sắc sảo (Deep-V Luxury Hull)
      const mainHull = new THREE.Mesh(new RoundedBoxGeometry(0.96, 0.22, 0.46, 3, 0.06), hullMat);
      mainHull.position.y = 0.15;
      mainHull.castShadow = true;

      // Mũi nhọn vát chữ V
      const bowV = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.36, 4), hullMat);
      bowV.rotation.z = -Math.PI / 2;
      bowV.rotation.x = Math.PI / 4;
      bowV.scale.set(0.60, 1.0, 1.0);
      bowV.position.set(0.58, 0.16, 0);

      // Đường viền màu thân tàu
      const hullStripe = new THREE.Mesh(new RoundedBoxGeometry(0.94, 0.04, 0.48, 2, 0.01), stripeMat);
      hullStripe.position.y = 0.21;

      // Mặt boong gỗ Teak
      const teakDeck = new THREE.Mesh(new RoundedBoxGeometry(0.90, 0.02, 0.42, 2, 0.01), woodDeckMat);
      teakDeck.position.y = 0.265;

      // 2. Tầng cabin 1 kính Sapphire panoramic (Main Deck Salon with Panoramic Windows)
      const cabin1 = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.20, 0.36, 3, 0.04), sapphireGlassMat);
      cabin1.position.set(-0.04, 0.37, 0);
      cabin1.castShadow = true;

      // 3. Tầng cabin 2 Flybridge & Mui cứng Aerodynamic (Upper Flybridge Deck & Hardtop)
      const flybridgeBase = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.06, 0.32, 2, 0.02), hullMat);
      flybridgeBase.position.set(-0.06, 0.49, 0);

      const flybridgeGlass = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.14, 0.28, 2, 0.03), sapphireGlassMat);
      flybridgeGlass.position.set(-0.04, 0.58, 0);

      const hardtop = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.03, 0.32, 2, 0.01), hullMat);
      hardtop.position.set(-0.06, 0.67, 0);

      // 4. Cột radar, Đĩa vòm vệ tinh & Cờ hiệu (Radar Mast, Satcom Radome & Ensign)
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.22, 8), chromeMat);
      mast.position.set(-0.12, 0.78, 0);

      const radome = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), hullMat);
      radome.position.set(-0.12, 0.88, 0);

      const radarBar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.015, 0.16), stripeMat);
      radarBar.position.set(-0.12, 0.84, 0);

      // 5. Lan can Inox bo quanh mũi tàu (Stainless Steel Bow Railing)
      [-0.19, 0.19].forEach(rz => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.015, 0.012), chromeMat);
        rail.position.set(0.26, 0.31, rz);
        tokenGroup.add(rail);
      });

      // 6. Chân vịt đôi bằng đồng thau phía đuôi dưới mớn nước (Twin Bronze Propellers)
      [-0.12, 0.12].forEach(pz => {
        const propHub = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8), bronzeMat);
        propHub.rotation.z = Math.PI / 2;
        propHub.position.set(-0.49, 0.08, pz);
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.08, 0.02), bronzeMat);
        blade.position.set(-0.50, 0.08, pz);
        tokenGroup.add(propHub, blade);
      });

      tokenGroup.add(mainHull, bowV, hullStripe, teakDeck, cabin1, flybridgeBase, flybridgeGlass, hardtop, mast, radome, radarBar);

    } else if (resolvedType === 'robot') {
      // ==========================================
      // 🦄 9. KỲ LÂN MECH AI (Cyber Unicorn AI Mecha)
      // ==========================================
      const mechColor = color || '#6C5CE7';
      const armorMat = new THREE.MeshStandardMaterial({ color: mechColor, roughness: 0.18, metalness: 0.65 });
      const whitePlateMat = new THREE.MeshStandardMaterial({ color: '#F5F6FA', roughness: 0.15, metalness: 0.3 });
      const darkJointMat = new THREE.MeshStandardMaterial({ color: '#2D3436', metalness: 0.85, roughness: 0.35 });
      const neonCyanMat = new THREE.MeshStandardMaterial({
        color: '#00CEC9',
        emissive: '#00CEC9',
        emissiveIntensity: 1.6
      });
      const goldMat = new THREE.MeshStandardMaterial({
        color: '#F1C40F',
        emissive: '#F39C12',
        emissiveIntensity: 0.5,
        metalness: 0.95,
        roughness: 0.1
      });

      // 1. Thân giáp vát cạnh & Lõi năng lượng Arc Reactor (Chiseled Torso & Plasma Core)
      const torso = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.44, 0.40, 4, 0.08), armorMat);
      torso.position.y = 0.38;
      torso.castShadow = true;

      const chestPlates = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.28, 0.42, 3, 0.04), whitePlateMat);
      chestPlates.position.set(0.04, 0.42, 0);

      // Lõi năng lượng ngực phát sáng
      const coreReactor = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 6), neonCyanMat);
      coreReactor.rotation.z = Math.PI / 2;
      coreReactor.position.set(0.24, 0.42, 0);

      // 2. Đầu Mecha, Kính Visor Neon & Cặp Tai Cảm Biến (Mecha Head, Neon Visor & Antennae)
      const head = new THREE.Mesh(new RoundedBoxGeometry(0.40, 0.34, 0.36, 4, 0.07), whitePlateMat);
      head.position.set(0.06, 0.74, 0);
      head.castShadow = true;

      const visor = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.12, 0.32, 2, 0.03), neonCyanMat);
      visor.position.set(0.22, 0.75, 0);

      // Sừng kỳ lân vàng phát sáng mạch năng lượng
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.32, 12), goldMat);
      horn.position.set(0.20, 1.02, 0);
      horn.rotation.z = -0.32;

      // Cặp ăng-ten tai mecha
      earsMesh = new THREE.Group();
      [-0.15, 0.15].forEach(ez => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 6), armorMat);
        ear.position.set(-0.02, 0.94, ez);
        ear.rotation.z = -0.2;
        const earTip = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), neonCyanMat);
        earTip.position.set(-0.02, 1.04, ez);
        earsMesh!.add(ear, earTip);
      });

      // 3. Khớp tay và giáp vai mecha (Mechanical Shoulder Pauldrons & Arms)
      [-0.24, 0.24].forEach(az => {
        const pauldron = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.16, 0.12, 2, 0.03), armorMat);
        pauldron.position.set(0.02, 0.46, az);
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.20, 8), darkJointMat);
        arm.position.set(0.04, 0.34, az);
        tokenGroup.add(pauldron, arm);
      });

      // 4. Chân robot cơ khí vững chắc (Hydraulic Mecha Legs & Stability Feet)
      [-0.14, 0.14].forEach(fz => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 8), darkJointMat);
        leg.position.set(0, 0.18, fz);
        const foot = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.12, 0.14, 2, 0.03), whitePlateMat);
        foot.position.set(0.04, 0.07, fz);
        tokenGroup.add(leg, foot);
      });

      // 5. Ba lô phản lực sau lưng & Ống xả Ion (Backpack Jet Thrusters)
      const jetpack = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.28, 0.26, 2, 0.03), darkJointMat);
      jetpack.position.set(-0.24, 0.40, 0);

      [-0.08, 0.08].forEach(tz => {
        const nozz = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.08, 12), darkJointMat);
        nozz.position.set(-0.28, 0.28, tz);
        const plume = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), neonCyanMat);
        plume.position.set(-0.28, 0.23, tz);
        tokenGroup.add(nozz, plume);
      });

      tokenGroup.add(torso, chestPlates, coreReactor, head, visor, horn, jetpack);
      if (earsMesh) tokenGroup.add(earsMesh);

    } else if (resolvedType === 'crown') {
      // ==========================================
      // 👑 10. VƯƠNG MIỆN TỶ PHÚ (Billionaire Imperial Crown)
      // ==========================================
      const goldMat = new THREE.MeshStandardMaterial({
        color: '#F1C40F',
        emissive: '#F39C12',
        emissiveIntensity: 0.28,
        metalness: 0.95,
        roughness: 0.10
      });
      const velvetMat = new THREE.MeshStandardMaterial({
        color: '#780016',
        roughness: 0.72,
        metalness: 0.05
      });
      const rubyMat = new THREE.MeshStandardMaterial({
        color: '#FF1744',
        emissive: '#D50000',
        emissiveIntensity: 1.1,
        roughness: 0.05
      });
      const sapphireMat = new THREE.MeshStandardMaterial({
        color: '#0984E3',
        emissive: '#74B9FF',
        emissiveIntensity: 1.1,
        roughness: 0.05
      });
      const emeraldMat = new THREE.MeshStandardMaterial({
        color: '#00B894',
        emissive: '#55EFC4',
        emissiveIntensity: 1.1,
        roughness: 0.05
      });
      const pearlMat = new THREE.MeshStandardMaterial({
        color: '#FDFEFE',
        roughness: 0.15,
        metalness: 0.15
      });

      // 1. Lõi nhung đỏ Bordeaux chần quả trám (Diamond-Tufted Bordeaux Velvet Cap)
      const velvetCushion = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 16), velvetMat);
      velvetCushion.scale.set(1.0, 0.82, 1.0);
      velvetCushion.position.y = 0.32;
      velvetCushion.castShadow = true;

      // 2. Vành vương miện vàng đính 2 hàng ngọc trai (Imperial Gold Circlet with Pearl Beading)
      const crownBand = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.41, 0.18, 32), goldMat);
      crownBand.position.y = 0.12;
      crownBand.castShadow = true;

      // 2 Hàng ngọc trai chạy quanh mép trên và dưới của vành
      for (let p = 0; p < 16; p++) {
        const pa = (p / 16) * Math.PI * 2;
        const pearlBottom = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), pearlMat);
        pearlBottom.position.set(Math.cos(pa) * 0.42, 0.04, Math.sin(pa) * 0.42);
        const pearlTop = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), pearlMat);
        pearlTop.position.set(Math.cos(pa) * 0.45, 0.20, Math.sin(pa) * 0.45);
        tokenGroup.add(pearlBottom, pearlTop);
      }

      // 3. 8 Chấu vàng chạm trổ đính xen kẽ Ruby, Sapphire, Emerald (8 Jeweled Arches & Scepters)
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.36, 8), goldMat);
        spike.position.set(Math.cos(a) * 0.40, 0.42, Math.sin(a) * 0.40);
        spike.castShadow = true;

        // Xen kẽ các loại đá quý hoàng gia
        let gemMaterial = rubyMat;
        if (i % 4 === 1 || i % 4 === 3) gemMaterial = sapphireMat;
        if (i % 4 === 2) gemMaterial = emeraldMat;

        const gemOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), gemMaterial);
        gemOrb.position.set(Math.cos(a) * 0.40, 0.60, Math.sin(a) * 0.40);

        tokenGroup.add(spike, gemOrb);
      }

      // 4. 4 Quai vòm vàng hội tụ trên đỉnh nâng đỡ Quả Cầu & Viên Đại Kim Cương (Royal Crown Arches & Diamond)
      for (let arc = 0; arc < 2; arc++) {
        const archTorus = new THREE.Mesh(
          new THREE.TorusGeometry(0.38, 0.022, 8, 20, Math.PI),
          goldMat
        );
        archTorus.rotation.y = (arc * Math.PI) / 2;
        archTorus.position.y = 0.28;
        tokenGroup.add(archTorus);
      }

      // Quả cầu hoàng gia (Monde)
      const monde = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), goldMat);
      monde.position.y = 0.68;

      // Viên đại kim cương vát đa diện lấp lánh trên đỉnh cao nhất (Brilliant-Cut Top Diamond)
      const topDiamond = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.12, 0),
        new THREE.MeshStandardMaterial({
          color: '#FFFFFF',
          emissive: '#E0F7FA',
          emissiveIntensity: 0.95,
          roughness: 0.04,
          metalness: 0.88
        })
      );
      topDiamond.position.y = 0.84;

      tokenGroup.add(velvetCushion, crownBand, monde, topDiamond);

    } else {
      // ==========================================
      // 🚀 4. TÊN LỬA VŨ TRỤ KHÍ ĐỘNG HỌC (Starlight Interceptor Rocket)
      // ==========================================
      const rocketColor = color || '#0984E3';
      const hullMat = new THREE.MeshStandardMaterial({
        color: rocketColor,
        roughness: 0.15,
        metalness: 0.38
      });
      const whiteCeramicMat = new THREE.MeshStandardMaterial({
        color: '#F8F9FA',
        roughness: 0.18,
        metalness: 0.15
      });
      const goldMat = new THREE.MeshStandardMaterial({
        color: '#F1C40F',
        metalness: 0.95,
        roughness: 0.1
      });

      // 1. Thân tên lửa nhiều tầng thuôn mượt (Multi-Stage Aerodynamic Fuselage)
      const lowerBooster = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.35, 0.38, 24), whiteCeramicMat);
      lowerBooster.position.y = 0.32;
      lowerBooster.castShadow = true;

      const stageRing = new THREE.Mesh(new THREE.TorusGeometry(0.315, 0.015, 8, 24), goldMat);
      stageRing.rotation.x = Math.PI / 2;
      stageRing.position.y = 0.51;

      const upperFuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.31, 0.52, 24), hullMat);
      upperFuselage.position.y = 0.77;
      upperFuselage.castShadow = true;

      // 2. Mũi chóp khí động học nhọn vuốt có mũi vàng (Nosecone & Gold Aerospike)
      const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.42, 24), whiteCeramicMat);
      noseCone.position.y = 1.24;
      noseCone.castShadow = true;

      const aerospike = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.035, 0.18, 12), goldMat);
      aerospike.position.y = 1.48;

      const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), goldMat);
      noseTip.position.y = 1.57;

      // 3. Cửa sổ quan sát phi thuyền viền kim loại kép & Kính Sapphire (Dual Metal-Rim Portholes)
      const portholeGroup = new THREE.Group();
      portholeGroup.position.set(0, 0.86, 0.25);
      portholeGroup.rotation.x = 0.12;

      const winRimOuter = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 8, 24), goldMat);
      const winGlass = new THREE.Mesh(
        new THREE.CircleGeometry(0.11, 24),
        new THREE.MeshStandardMaterial({ color: '#00CEC9', roughness: 0.05, metalness: 0.85, emissive: '#00CEC9', emissiveIntensity: 0.3 })
      );
      portholeGroup.add(winRimOuter, winGlass);

      // 4. 4 Cánh đuôi khí động học bố trí đối xứng 90° (4 Aerodynamic Delta Tail Fins)
      const finMat = new THREE.MeshStandardMaterial({ color: '#FF7675', roughness: 0.2, metalness: 0.25 });
      for (let f = 0; f < 4; f++) {
        const angle = (f / 4) * Math.PI * 2;
        const finGroup = new THREE.Group();
        finGroup.position.set(Math.cos(angle) * 0.28, 0.32, Math.sin(angle) * 0.28);
        finGroup.rotation.y = -angle;

        const fin = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.38, 0.36, 2, 0.02), finMat);
        const navLight = new THREE.Mesh(
          new THREE.SphereGeometry(0.035, 8, 8),
          new THREE.MeshStandardMaterial({
            color: f % 2 === 0 ? '#00B894' : '#FF3838',
            emissive: f % 2 === 0 ? '#00B894' : '#FF3838',
            emissiveIntensity: 1.2
          })
        );
        navLight.position.set(0, -0.16, 0.19);
        finGroup.add(fin, navLight);
        tokenGroup.add(finGroup);
      }

      // 5. Động cơ phản lực gốm titan & Lửa Plasma (Rocket Nozzle & Ion Thruster Flame)
      const nozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.26, 0.18, 24),
        new THREE.MeshStandardMaterial({ color: '#2D3436', metalness: 0.9, roughness: 0.3 })
      );
      nozzle.position.y = 0.09;

      flameMesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.19, 0.44, 16),
        new THREE.MeshStandardMaterial({
          color: '#FFA502',
          emissive: '#FF4757',
          emissiveIntensity: 1.35,
          transparent: true,
          opacity: 0.92
        })
      );
      flameMesh.position.y = -0.16;
      flameMesh.rotation.x = Math.PI;

      const coreFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.10, 0.28, 14),
        new THREE.MeshStandardMaterial({
          color: '#FFFFFF',
          emissive: '#00CEC9',
          emissiveIntensity: 2.0,
          transparent: true,
          opacity: 0.95
        })
      );
      coreFlame.position.y = 0.07;
      flameMesh.add(coreFlame);

      tokenGroup.add(lowerBooster, stageRing, upperFuselage, noseCone, aerospike, noseTip, portholeGroup, nozzle);
      if (flameMesh) tokenGroup.add(flameMesh);
    }

    // Đĩa bóng tiếp xúc nướng sẵn
    const shadowGeo = new THREE.PlaneGeometry(1.3, 1.3);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: this.shadowTexture,
      transparent: true,
      depthWrite: false
    });
    const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = 0.006;

    const wrapper = new THREE.Group();
    const pos = this.getTilePosition(0, slot);
    wrapper.position.copy(pos);
    wrapper.add(shadowDisc);
    wrapper.add(tokenGroup);

    this.group.add(wrapper);
    this.tokens.set(userId, {
      userId,
      tokenType: resolvedType,
      color,
      trailEffect,
      currentTile: 0,
      mesh: wrapper,
      innerModel: tokenGroup,
      shadowDisc,
      isMoving: false,
      pathQueue: [],
      wheels,
      ears: earsMesh,
      thrusterFlame: flameMesh,
      tail: tailMesh
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

    this.cancelTokenAnimation(token);

    const startTile = ((Math.trunc(fromTile) % 40) + 40) % 40;
    const endTile = ((Math.trunc(toTile) % 40) + 40) % 40;

    const path: number[] = [];
    let cur = startTile;
    let guard = 0;
    while (cur !== endTile && guard < 40) {
      cur = (cur + 1) % 40;
      path.push(cur);
      guard++;
    }

    if (path.length === 0) {
      token.currentTile = endTile;
      if (onAllDone) onAllDone();
      return;
    }

    let stepIndex = 0;
    const animateNextStep = () => {
      if (stepIndex >= path.length) {
        token.activeRafId = undefined;
        token.currentTile = endTile;
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

        // Ve vẩy tai và vẫy đuôi cún
        if (token.ears) {
          token.ears.rotation.x = Math.sin(t * Math.PI * 2) * 0.3;
        }
        if (token.tail) {
          token.tail.rotation.z = Math.sin(t * Math.PI * 4) * 0.4;
        }

        // Squash & Stretch
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
          token.activeRafId = requestAnimationFrame(hopStep);
        } else {
          token.mesh.position.copy(endPos);
          if (token.innerModel) token.innerModel.scale.set(1, 1, 1);
          token.shadowDisc.scale.set(1, 1, 1);
          (token.shadowDisc.material as THREE.MeshBasicMaterial).opacity = 0.85;
          if (this.vfxManager) {
            this.vfxManager.spawnTrailStep(endPos, token.trailEffect, token.color);
          }
          if (onStepDone) onStepDone(targetTile);
          animateNextStep();
        }
      };

      token.activeRafId = requestAnimationFrame(hopStep);
    };

    token.isMoving = true;
    animateNextStep();
  }

  public flyTokenDirect(
    userId: string,
    toTile: number,
    slot: number,
    onAllDone?: () => void
  ) {
    const token = this.tokens.get(userId);
    if (!token) {
      if (onAllDone) onAllDone();
      return;
    }

    this.cancelTokenAnimation(token);
    const endTile = ((Math.trunc(toTile) % 40) + 40) % 40;
    token.isMoving = true;
    const startPos = token.mesh.position.clone();
    const endPos = this.getTilePosition(endTile, slot);
    const duration = 1200;
    const startTime = performance.now();

    const flightStep = (time: number) => {
      const elapsed = time - startTime;
      const t = Math.min(1, elapsed / duration);
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      // Parabolic flight arc high up in the sky (Cất cánh vút bay lên cao rồi hạ cánh êm dịu)
      const arcHeight = Math.sin(t * Math.PI) * 4.2;
      token.mesh.position.lerpVectors(startPos, endPos, easeT);
      token.mesh.position.y = THREE.MathUtils.lerp(startPos.y, endPos.y, easeT) + arcHeight;

      // Góc chúc mũi / ngóc đầu khí động học
      const pitchAngle = Math.cos(t * Math.PI) * 0.35;
      const dir = endPos.clone().sub(startPos).normalize();
      if (dir.lengthSq() > 0.001) {
        const yawAngle = Math.atan2(dir.x, dir.z);
        token.mesh.rotation.y = yawAngle;
        token.mesh.rotation.x = -pitchAngle;
      }

      // Bóng dưới mặt đất mờ dần và thu nhỏ khi bay cao
      const shadowScale = THREE.MathUtils.lerp(1.0, 0.2, arcHeight / 4.2);
      token.shadowDisc.scale.set(shadowScale, shadowScale, 1);
      (token.shadowDisc.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(0.85, 0.1, arcHeight / 4.2);

      if (t < 1) {
        token.activeRafId = requestAnimationFrame(flightStep);
      } else {
        token.activeRafId = undefined;
        token.mesh.position.copy(endPos);
        token.mesh.rotation.x = 0;
        token.shadowDisc.scale.set(1, 1, 1);
        (token.shadowDisc.material as THREE.MeshBasicMaterial).opacity = 0.85;
        token.currentTile = endTile;
        token.isMoving = false;
        if (onAllDone) onAllDone();
      }
    };

    token.activeRafId = requestAnimationFrame(flightStep);
  }

  public update(delta: number) {
    this.animClock += delta;

    // 1. Cập nhật mũi tên chỉ hướng lượt đi (Turn Pointer Arrow) bám sát nhân vật
    if (this.activeUserId) {
      const activeToken = this.tokens.get(this.activeUserId);
      if (activeToken) {
        this.arrowGroup.visible = true;
        const tokenPos = activeToken.mesh.position;
        const bob = Math.sin(this.animClock * 4.5) * 0.16;
        const targetY = tokenPos.y + 1.65 + bob;

        if (activeToken.isMoving) {
          // Khi quân cờ đang nhảy từng ô, mũi tên bám dính tức thì theo vị trí X, Z và chiều cao Y
          this.arrowGroup.position.set(tokenPos.x, targetY, tokenPos.z);
        } else {
          // Khi đứng yên, lerp mượt mà
          this.arrowGroup.position.x = THREE.MathUtils.lerp(this.arrowGroup.position.x, tokenPos.x, 0.25);
          this.arrowGroup.position.z = THREE.MathUtils.lerp(this.arrowGroup.position.z, tokenPos.z, 0.25);
          this.arrowGroup.position.y = targetY;
        }

        // Xoay nhẹ mũi tên 3D quanh trục Y để tạo chuyển động sống động
        this.arrowConeGroup.rotation.y += delta * 2.2;

        // Xung nhịp phát sáng
        this.arrowConeMat.emissiveIntensity = 0.8 + Math.sin(this.animClock * 5.0) * 0.35;
        const haloScale = 1.0 + Math.sin(this.animClock * 5.0) * 0.16;
        this.arrowHaloMesh.scale.set(haloScale, haloScale, 1);
      } else {
        this.arrowGroup.visible = false;
      }
    }

    // 2. Hoạt ảnh Idle & Chuyển Động của các quân cờ
    for (const token of this.tokens.values()) {
      if (token.isMoving) {
        // Khi di chuyển: Bánh xe lăn, tai cún vẫy nhịp nhàng, lửa phản lực phụt mạnh
        if (token.wheels && token.wheels.length > 0) {
          token.wheels.forEach(w => {
            w.rotation.x += delta * 18;
          });
        }
        if (token.ears) {
          token.ears.rotation.z = Math.sin(this.animClock * 14) * 0.22;
          token.ears.rotation.x = Math.cos(this.animClock * 12) * 0.12;
        }
        if (token.tail) {
          token.tail.rotation.z = Math.sin(this.animClock * 16) * 0.35;
        }
        if (token.thrusterFlame) {
          const fScale = 1.1 + Math.sin(this.animClock * 28) * 0.35;
          const fLen = 1.2 + Math.cos(this.animClock * 24) * 0.38;
          token.thrusterFlame.scale.set(fScale, fLen, fScale);
        }
      } else if (token.innerModel) {
        // Nhịp thở Idle sống động khi đứng yên
        const breathe = Math.sin(this.animClock * 2.5 + token.currentTile) * 0.02;
        token.innerModel.position.y = breathe;

        // Vẫy tai cún ngộ nghĩnh
        if (token.ears) {
          token.ears.rotation.z = Math.sin(this.animClock * 5.0) * 0.12;
          token.ears.rotation.x = Math.sin(this.animClock * 3.5) * 0.07;
        }

        // Vẫy đuôi cún nhè nhẹ khi đứng yên
        if (token.tail) {
          token.tail.rotation.z = Math.sin(this.animClock * 6.5) * 0.22;
          token.tail.rotation.y = Math.PI / 2 + Math.cos(this.animClock * 4.5) * 0.12;
        }

        // Đuôi lửa phập phồng nhịp nhàng
        if (token.thrusterFlame) {
          const fScale = 0.88 + Math.sin(this.animClock * 18) * 0.22;
          const fLen = 0.92 + Math.cos(this.animClock * 16) * 0.24;
          token.thrusterFlame.scale.set(fScale, fLen, fScale);
        }
      }
    }
  }

  public setTokenTileImmediate(userId: string, tileIndex: number, slot: number) {
    const token = this.tokens.get(userId);
    if (!token) return;
    this.cancelTokenAnimation(token);
    const normalizedTile = ((Math.trunc(tileIndex) % 40) + 40) % 40;
    const pos = this.getTilePosition(normalizedTile, slot);
    token.mesh.position.copy(pos);
    token.currentTile = normalizedTile;
  }

  public isAnyTokenMoving(): boolean {
    for (const token of this.tokens.values()) {
      if (token.isMoving) return true;
    }
    return false;
  }
}
