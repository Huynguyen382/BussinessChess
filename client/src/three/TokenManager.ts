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
  ears?: THREE.Mesh | THREE.Group;
  thrusterFlame?: THREE.Mesh;
  tail?: THREE.Mesh;
}

export class TokenManager {
  public group: THREE.Group;
  public tokens: Map<string, TokenInstance> = new Map();
  private tilePositions: THREE.Vector3[] = [];
  private shadowTexture: THREE.CanvasTexture;
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
    this.group.clear();
    this.group.add(this.arrowGroup);
    this.tokens.clear();
    this.activeUserId = null;
    this.arrowGroup.visible = false;
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
    let earsMesh: THREE.Group | undefined;
    let flameMesh: THREE.Mesh | undefined;
    let tailMesh: THREE.Mesh | undefined;

    if (tokenType === 'car') {
      // ==========================================
      // 🚗 1. XE CỔ ĐIỂN MẠ CROM CAO CẤP (Classic Cruiser)
      // ==========================================
      const bodyMat = new THREE.MeshStandardMaterial({
        color: color || '#FF3838',
        roughness: 0.14,
        metalness: 0.32
      });
      const chromeMat = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        metalness: 0.98,
        roughness: 0.05
      });

      // A. Khung gầm thân xe bo tròn cong mềm
      const body = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.32, 0.54, 4, 0.1), bodyMat);
      body.position.y = 0.28;
      body.castShadow = true;

      // Nẹp crom cổ điển chạy dọc hai bên sườn xe
      [-0.275, 0.275].forEach(sz => {
        const sideSpear = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.022, 0.015), chromeMat);
        sideSpear.position.set(0, 0.28, sz);
        tokenGroup.add(sideSpear);
      });

      // Nắp ca-pô cong phía trước
      const hood = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.14, 0.48, 3, 0.06), bodyMat);
      hood.position.set(0.32, 0.38, 0);

      // B. Cabin xe với kính chắn gió trong suốt
      const cabinMat = new THREE.MeshStandardMaterial({
        color: '#E0F2FE',
        roughness: 0.08,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85
      });
      const cabin = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.3, 0.44, 4, 0.08), cabinMat);
      cabin.position.set(-0.1, 0.54, 0);

      // C. Lưới tản nhiệt mạ crom có nan sọc
      const grill = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.2, 0.36, 2, 0.02), chromeMat);
      grill.position.set(0.52, 0.28, 0);

      // Biểu tượng mạ crom trên mui xe
      const hoodOrnament = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 8), chromeMat);
      hoodOrnament.position.set(0.48, 0.48, 0);
      hoodOrnament.rotation.z = -Math.PI / 4;

      // Cản trước và cản sau cong ôm thân xe
      const frontBumper = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.1, 0.56, 2, 0.03), chromeMat);
      frontBumper.position.set(0.52, 0.18, 0);
      const rearBumper = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.1, 0.56, 2, 0.03), chromeMat);
      rearBumper.position.set(-0.5, 0.18, 0);

      // 4 Hốc bánh xe (Wheel Fenders) tạo cơ bắp xe cổ điển
      const fenderMat = bodyMat;
      const makeFender = (fx: number, fz: number) => {
        const fender = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.18, 0.08, 2, 0.04), fenderMat);
        fender.position.set(fx, 0.26, fz);
        tokenGroup.add(fender);
      };
      makeFender(-0.26, 0.28);
      makeFender(0.26, 0.28);
      makeFender(-0.26, -0.28);
      makeFender(0.26, -0.28);

      // Đèn pha tròn mạ crom có thủy tinh vàng sáng
      const lightRimGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16);
      lightRimGeo.rotateZ(Math.PI / 2);
      const lightLensGeo = new THREE.SphereGeometry(0.075, 12, 12);
      const lightLensMat = new THREE.MeshStandardMaterial({
        color: '#FFF275',
        emissive: '#FFF275',
        emissiveIntensity: 0.8
      });

      const makeHeadlight = (lz: number) => {
        const rim = new THREE.Mesh(lightRimGeo, chromeMat);
        rim.position.set(0.5, 0.32, lz);
        const lens = new THREE.Mesh(lightLensGeo, lightLensMat);
        lens.position.set(0.52, 0.32, lz);
        tokenGroup.add(rim, lens);
      };
      makeHeadlight(0.18);
      makeHeadlight(-0.18);

      // Gương chiếu hậu mạ crom hai bên
      const mirrorGeo = new THREE.SphereGeometry(0.045, 8, 8);
      const mirrorL = new THREE.Mesh(mirrorGeo, chromeMat);
      mirrorL.position.set(0.08, 0.5, 0.26);
      const mirrorR = new THREE.Mesh(mirrorGeo, chromeMat);
      mirrorR.position.set(0.08, 0.5, -0.26);

      // 4 Bánh xe lốp cao su dập vân + mâm đĩa crom phản quang
      const tireGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16);
      tireGeo.rotateZ(Math.PI / 2);
      const tireMat = new THREE.MeshStandardMaterial({ color: '#2C3A47', roughness: 0.7 });

      const hubGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.11, 14);
      hubGeo.rotateZ(Math.PI / 2);

      const makeWheel = (wx: number, wz: number) => {
        const wGroup = new THREE.Group();
        wGroup.position.set(wx, 0.14, wz);
        const tire = new THREE.Mesh(tireGeo, tireMat);
        tire.castShadow = true;
        const hub = new THREE.Mesh(hubGeo, chromeMat);
        wGroup.add(tire, hub);
        tokenGroup.add(wGroup);
        wheels.push(tire);
      };

      makeWheel(-0.26, 0.28);
      makeWheel(0.26, 0.28);
      makeWheel(-0.26, -0.28);
      makeWheel(0.26, -0.28);

      tokenGroup.add(body, hood, cabin, grill, hoodOrnament, frontBumper, rearBumper, mirrorL, mirrorR);

    } else if (tokenType === 'hat') {
      // ==========================================
      // 🎩 2. MŨ PHỚT HOÀNG GIA ĐÍNH KIM CƯƠNG (Royal Top Hat)
      // ==========================================
      const goldMat = new THREE.MeshStandardMaterial({
        color: color || '#FDCB6E',
        emissive: '#FDCB6E',
        emissiveIntensity: 0.25,
        metalness: 0.88,
        roughness: 0.16
      });

      // Vành mũ uốn cong lòng chảo sang trọng (Curved Dished Brim)
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.62, 0.08, 32), goldMat);
      brim.position.y = 0.08;
      brim.castShadow = true;

      // Viền dải nơ nhung hoàng gia màu tím thẫm
      const ribbonMat = new THREE.MeshStandardMaterial({
        color: '#6C5CE7',
        roughness: 0.35,
        emissive: '#4834D4',
        emissiveIntensity: 0.15
      });
      const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.16, 28), ribbonMat);
      ribbon.position.y = 0.2;

      // Thân mũ thon loe nhẹ ở đỉnh (Fluted Crown)
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.74, 28), goldMat);
      crown.position.y = 0.64;
      crown.castShadow = true;

      // Đỉnh mũ vát lõm nhẹ
      const crownTop = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.42, 0.06, 28), goldMat);
      crownTop.position.y = 1.02;

      // Khóa nơ vàng kim chạm khắc hoa văn
      const buckle = new THREE.Mesh(
        new RoundedBoxGeometry(0.14, 0.16, 0.06, 2, 0.02),
        new THREE.MeshStandardMaterial({ color: '#FFEAA7', metalness: 0.95, roughness: 0.1 })
      );
      buckle.position.set(0.39, 0.2, 0);

      // Viên hồng ngọc đính giữa khóa nơ
      const ruby = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.06),
        new THREE.MeshStandardMaterial({ color: '#D63031', emissive: '#FF7675', emissiveIntensity: 0.6, roughness: 0.1 })
      );
      ruby.position.set(0.43, 0.2, 0);

      // Chiếc lông vũ trắng kiêu kỳ cắm trên vành nơ
      const featherMat = new THREE.MeshStandardMaterial({ color: '#FFFDF9', roughness: 0.4 });
      const feather = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 8), featherMat);
      feather.position.set(0.35, 0.42, 0.1);
      feather.rotation.z = -Math.PI / 6;

      tokenGroup.add(brim, ribbon, crown, crownTop, buckle, ruby, feather);

    } else if (tokenType === 'dog') {
      // ==========================================
      // 🐕 3. CHÚ CÚN PUG MAY MẮN SIÊU DỄ THƯƠNG (Lucky Pug)
      // ==========================================
      const furMat = new THREE.MeshStandardMaterial({
        color: color || '#E17055',
        roughness: 0.45
      });
      const darkFurMat = new THREE.MeshStandardMaterial({
        color: '#2C3A47',
        roughness: 0.5
      });

      // A. Thân cún hình quả lê mũm mĩm
      const body = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.56, 0.5, 4, 0.15), furMat);
      body.position.y = 0.38;
      body.castShadow = true;

      // Bụng cún màu kem sữa
      const bellyMat = new THREE.MeshStandardMaterial({ color: '#FFEAA7', roughness: 0.5 });
      const belly = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), bellyMat);
      belly.scale.set(1, 0.8, 0.3);
      belly.position.set(0.15, 0.34, 0);

      // B. Đầu cún tròn trĩnh với má phính
      const head = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.46, 0.46, 4, 0.14), furMat);
      head.position.set(0.32, 0.66, 0);
      head.castShadow = true;

      // Mõm đen đặc trưng của giống Pug
      const muzzle = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.18, 0.24, 3, 0.06), darkFurMat);
      muzzle.position.set(0.56, 0.61, 0);

      // Mũi đen bóng ướt
      const nose = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshStandardMaterial({ color: '#1E272E', roughness: 0.1 })
      );
      nose.position.set(0.67, 0.66, 0);

      // Lưỡi hồng thè ra nghịch ngợm
      const tongue = new THREE.Mesh(
        new RoundedBoxGeometry(0.08, 0.04, 0.1, 2, 0.01),
        new THREE.MeshStandardMaterial({ color: '#FF7675', roughness: 0.2 })
      );
      tongue.position.set(0.64, 0.55, 0.02);
      tongue.rotation.z = Math.PI / 8;

      // C. Đôi mắt to tròn long lanh có đốm sáng
      const eyeMat = new THREE.MeshStandardMaterial({ color: '#1E272E', roughness: 0.08 });
      const pupilMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });

      const makeEye = (ez: number) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), eyeMat);
        eye.position.set(0.53, 0.73, ez);
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), pupilMat);
        pupil.position.set(0.58, 0.75, ez + (ez > 0 ? 0.01 : -0.01));
        tokenGroup.add(eye, pupil);
      };
      makeEye(0.14);
      makeEye(-0.14);

      // D. Đôi tai mềm rủ xuống hai bên má
      earsMesh = new THREE.Group();
      const ear1 = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.3, 0.16, 2, 0.04), darkFurMat);
      ear1.position.set(0.28, 0.78, 0.26);
      ear1.rotation.x = Math.PI / 8;
      const ear2 = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.3, 0.16, 2, 0.04), darkFurMat);
      ear2.position.set(0.28, 0.78, -0.26);
      ear2.rotation.x = -Math.PI / 8;
      earsMesh.add(ear1, ear2);

      // E. Chiếc đuôi xoắn lò xo ngộ nghĩnh phía sau (Curly Pug Tail)
      const tailGeo = new THREE.TorusGeometry(0.1, 0.045, 8, 16, Math.PI * 1.5);
      tailMesh = new THREE.Mesh(tailGeo, furMat);
      tailMesh.position.set(-0.38, 0.45, 0);
      tailMesh.rotation.y = Math.PI / 2;

      // F. Vòng cổ da đỏ đính chuông vàng rung rinh
      const collar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.08, 16),
        new THREE.MeshStandardMaterial({ color: '#D63031', roughness: 0.3 })
      );
      collar.position.set(0.32, 0.48, 0);

      const bell = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 12),
        new THREE.MeshStandardMaterial({ color: '#FDCB6E', metalness: 0.9, roughness: 0.15, emissive: '#FDCB6E', emissiveIntensity: 0.4 })
      );
      bell.position.set(0.54, 0.44, 0);

      // 4 Bàn chân mập tròn có đệm chân
      const pawGeo = new THREE.SphereGeometry(0.1, 10, 10);
      const makePaw = (px: number, pz: number) => {
        const paw = new THREE.Mesh(pawGeo, furMat);
        paw.position.set(px, 0.1, pz);
        tokenGroup.add(paw);
      };
      makePaw(-0.22, 0.22);
      makePaw(0.22, 0.22);
      makePaw(-0.22, -0.22);
      makePaw(0.22, -0.22);

      tokenGroup.add(body, belly, head, muzzle, nose, tongue, collar, bell);
      if (earsMesh) tokenGroup.add(earsMesh);
      if (tailMesh) tokenGroup.add(tailMesh);

    } else {
      // ==========================================
      // 🚀 4. TÊN LỬA VŨ TRỤ KHÍ ĐỘNG HỌC (Starlight Rocket)
      // ==========================================
      const rocketMat = new THREE.MeshStandardMaterial({
        color: color || '#0984E3',
        roughness: 0.2,
        metalness: 0.15
      });

      // Thân tên lửa thuôn dài bóng bẩy
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.35, 0.9, 24), rocketMat);
      body.position.y = 0.56;
      body.castShadow = true;

      // Mũi chóp đỏ khí động học
      const noseMat = new THREE.MeshStandardMaterial({ color: '#FF7675', roughness: 0.22 });
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.45, 24), noseMat);
      nose.position.y = 1.22;
      nose.castShadow = true;

      // Cửa sổ phi thuyền tròn viền vàng bọc kính xanh biển phản quang
      const winBorder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.05, 20),
        new THREE.MeshStandardMaterial({ color: '#FDCB6E', metalness: 0.88, roughness: 0.15 })
      );
      winBorder.rotation.x = Math.PI / 2;
      winBorder.position.set(0, 0.68, 0.3);

      const winGlass = new THREE.Mesh(
        new THREE.CircleGeometry(0.095, 20),
        new THREE.MeshStandardMaterial({ color: '#74B9FF', roughness: 0.05, metalness: 0.1 })
      );
      winGlass.position.set(0, 0.68, 0.33);

      // Ngôi sao vàng mini bên trong buồng lái
      const starInsignia = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.04),
        new THREE.MeshStandardMaterial({ color: '#FFEAA7', emissive: '#FFEAA7', emissiveIntensity: 0.8 })
      );
      starInsignia.position.set(0, 0.68, 0.34);

      // 3 Cánh lái tam giác vát cạnh với đèn hiệu đầu cánh
      const finMat = new THREE.MeshStandardMaterial({ color: '#74B9FF', roughness: 0.28 });
      for (let f = 0; f < 3; f++) {
        const angle = (f / 3) * Math.PI * 2;
        const finGroup = new THREE.Group();
        finGroup.position.set(Math.cos(angle) * 0.3, 0.36, Math.sin(angle) * 0.3);
        finGroup.rotation.y = -angle;

        const fin = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.38, 0.42, 2, 0.02), finMat);
        const navLight = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 8, 8),
          new THREE.MeshStandardMaterial({
            color: f === 0 ? '#FF3838' : '#00B894',
            emissive: f === 0 ? '#FF3838' : '#00B894',
            emissiveIntensity: 0.9
          })
        );
        navLight.position.set(0, -0.15, 0.22);
        finGroup.add(fin, navLight);
        tokenGroup.add(finGroup);
      }

      // Vòi phun động cơ gốm chịu nhiệt
      const nozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.28, 0.16, 20),
        new THREE.MeshStandardMaterial({ color: '#2D3436', metalness: 0.8, roughness: 0.4 })
      );
      nozzle.position.y = 0.08;

      // Ngọn lửa ion xanh-cam phập phồng
      flameMesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.42, 16),
        new THREE.MeshStandardMaterial({
          color: '#FFA502',
          emissive: '#FF4757',
          emissiveIntensity: 1.15,
          transparent: true,
          opacity: 0.92
        })
      );
      flameMesh.position.y = -0.15;
      flameMesh.rotation.x = Math.PI;

      // Lõi lửa plasma trắng vàng siêu nhiệt bên trong
      const innerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.11, 0.28, 14),
        new THREE.MeshStandardMaterial({
          color: '#FFFDE7',
          emissive: '#00CEC9',
          emissiveIntensity: 1.8,
          transparent: true,
          opacity: 0.95
        })
      );
      innerFlame.position.y = 0.06;
      flameMesh.add(innerFlame);

      tokenGroup.add(body, nose, winBorder, winGlass, starInsignia, nozzle);
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

        // Quay bánh xe ô tô chuẩn xác theo tiến trình bước nhảy (t), mượt mà độc lập tần số quét 60Hz - 144Hz
        if (token.wheels && token.wheels.length > 0) {
          token.wheels.forEach(w => {
            w.rotation.x = t * Math.PI * 4;
          });
        }

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
    const pos = this.getTilePosition(tileIndex, slot);
    token.mesh.position.copy(pos);
    token.currentTile = tileIndex;
  }

  public isAnyTokenMoving(): boolean {
    for (const token of this.tokens.values()) {
      if (token.isMoving) return true;
    }
    return false;
  }
}
