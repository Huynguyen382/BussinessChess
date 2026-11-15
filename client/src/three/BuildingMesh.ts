import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { sounds } from '../components/AudioSynth';
import { VFXManager } from './VFXManager';
import { LandmarkModels } from './LandmarkModels';
import { LandmarkMaterials } from './landmarks/LandmarkMaterials';

export class BuildingMesh {
  public group: THREE.Group;
  private buildingMap: Map<number, THREE.Group> = new Map();
  private vfxManager: VFXManager | null = null;
  private animatedSpireLandmarks: THREE.Mesh[] = [];
  private bouncingItems: { group: THREE.Group; progress: number }[] = [];

  constructor() {
    this.group = new THREE.Group();
  }

  public setVFXManager(vfx: VFXManager) {
    this.vfxManager = vfx;
  }

  public getTrackedTileIds(): number[] {
    return Array.from(this.buildingMap.keys());
  }

  public removeBuilding(tileId: number) {
    const existing = this.buildingMap.get(tileId);
    if (existing) {
      existing.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) {
            mesh.geometry.dispose();
          }
        }
      });
      this.group.remove(existing);
      this.buildingMap.delete(tileId);
      this.bouncingItems = this.bouncingItems.filter(b => b.group !== existing);
    }
  }

  public updateBuilding(tileId: number, level: number, position: THREE.Vector3, baseAngle: number, ownerColor?: string) {
    this.removeBuilding(tileId);

    if (level === undefined || level === null || level < 0) return;

    const bGroup = new THREE.Group();
    // Cao độ bề mặt ô cờ chuẩn là world y = 0.305. Đặt móng công trình khớp hoàn hảo trên mặt gạch, không lún
    bGroup.position.set(position.x, 0.305, position.z);
    bGroup.rotation.y = baseAngle;

    // Đặt công trình ở nửa phía trước ô cờ (Zone A: hướng về mặt đường/avenue),
    // hoàn toàn tách biệt với Zone B (mô hình kỳ quan Landmark 3D ở nửa sau ô cờ)
    const isSide3 = tileId > 20 && tileId < 30;
    const buildingZ = isSide3 ? 0.72 : -0.72;
    const modelSubGroup = new THREE.Group();
    modelSubGroup.position.set(0, 0, buildingZ);
    if (isSide3) {
      modelSubGroup.rotation.y = Math.PI;
    }
    bGroup.add(modelSubGroup);

    // Bóng tiếp xúc mềm mại dùng chung từ LandmarkMaterials
    modelSubGroup.add(LandmarkModels.createContactShadow(1.6, 1.6, 0.45));

    if (level === 0) {
      this.buildLevel0(modelSubGroup, ownerColor);
    } else if (level === 1) {
      this.buildLevel1(modelSubGroup);
    } else if (level === 2) {
      this.buildLevel2(modelSubGroup);
    } else if (level === 3) {
      this.buildLevel3(modelSubGroup);
    } else if (level === 4) {
      this.buildLevel4(modelSubGroup);
    }

    // Hoạt ảnh nảy lò xo đàn hồi vi mô theo frame-delta
    this.animateBounce(bGroup);

    this.group.add(bGroup);
    this.buildingMap.set(tileId, bGroup);

    if (level === 4) {
      sounds.playHotelFanfare();
      if (this.vfxManager) {
        this.vfxManager.spawnHotelCelebration(position);
        this.vfxManager.spawnFloatingDollar('KHÁCH SẠN HOÀNG GIA!', position, true);
      }
    } else if (level > 0) {
      sounds.playBuild();
      if (this.vfxManager) {
        this.vfxManager.spawnShockwave(position, '#00B894', 2.8);
        this.vfxManager.spawnStarBurst(position, 18, 0x00B894);
      }
    } else {
      // Level 0: Mua đất sở hữu ban đầu
      if (this.vfxManager) {
        this.vfxManager.spawnStarBurst(position, 12, 0xF1C40F);
      }
    }
  }

  // ============================================================================
  // SHARED ARCHITECTURAL HELPERS (Cache materials, per-building geometries)
  // ============================================================================

  private getPlinthMat() {
    return LandmarkModels.getMat('bldgPlinthGrey', () => new THREE.MeshStandardMaterial({ color: '#718093', roughness: 0.62 }));
  }

  private getCreamWallMat() {
    return LandmarkModels.getMat('bldgCreamWall', () => new THREE.MeshStandardMaterial({ color: '#FFFDF9', roughness: 0.35 }));
  }

  private getTrimMat() {
    return LandmarkModels.getMat('bldgCornerTrimWood', () => new THREE.MeshStandardMaterial({ color: '#E8D7B8', roughness: 0.4 }));
  }

  private getCorniceMat() {
    return LandmarkModels.getMat('bldgCorniceTrim', () => new THREE.MeshStandardMaterial({ color: '#DFE4EA', roughness: 0.35 }));
  }

  private getWinFrameMat() {
    return LandmarkModels.getMat('bldgWinFrameWood', () => new THREE.MeshStandardMaterial({ color: '#574B90', roughness: 0.48 }));
  }

  /**
   * Cửa sổ kiến trúc có khung viền, kính phát sáng/phản chiếu nhẹ, thanh chia đố, bệ đá và tùy chọn cửa chớp
   */
  private addFramedWindow(
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    rotY = 0,
    options: { shutters?: boolean; sill?: boolean; shutterColor?: string } = {}
  ) {
    const winGroup = new THREE.Group();
    winGroup.position.set(x, y, z);
    winGroup.rotation.y = rotY;

    const frameMat = this.getWinFrameMat();
    const glowMat = LandmarkMaterials.getWarmWindowMat();
    const trimMat = this.getTrimMat();

    // Khung viền ngoài
    const outerFrame = new THREE.Mesh(new RoundedBoxGeometry(w + 0.04, h + 0.04, 0.022, 2, 0.006), frameMat);
    outerFrame.position.z = 0.008;

    // Mặt kính phát sáng ấm
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glowMat);
    glass.position.z = 0.022;

    // Đố cửa sổ chữ thập
    const mullionH = new THREE.Mesh(new THREE.BoxGeometry(w, 0.016, 0.012), frameMat);
    mullionH.position.z = 0.026;
    const mullionV = new THREE.Mesh(new THREE.BoxGeometry(0.016, h, 0.012), frameMat);
    mullionV.position.z = 0.026;

    winGroup.add(outerFrame, glass, mullionH, mullionV);

    if (options.sill !== false) {
      const sill = new THREE.Mesh(new RoundedBoxGeometry(w + 0.07, 0.026, 0.045, 2, 0.006), trimMat);
      sill.position.set(0, -h / 2 - 0.022, 0.018);
      winGroup.add(sill);
    }

    if (options.shutters) {
      const shColor = options.shutterColor || '#2C7A7B';
      const shutterMat = LandmarkModels.getMat(`bldgShutter_${shColor}`, () => new THREE.MeshStandardMaterial({
        color: shColor,
        roughness: 0.45
      }));
      const shutterGeo = new RoundedBoxGeometry(w * 0.34, h + 0.01, 0.018, 2, 0.004);
      const shutterL = new THREE.Mesh(shutterGeo, shutterMat);
      shutterL.position.set(-w / 2 - w * 0.22, 0, 0.012);
      const shutterR = new THREE.Mesh(shutterGeo, shutterMat);
      shutterR.position.set(w / 2 + w * 0.22, 0, 0.012);
      winGroup.add(shutterL, shutterR);
    }

    parent.add(winGroup);
  }

  /**
   * Cột trụ cổ điển gồm Đế cột (Base) -> Thân cột (Shaft) -> Đầu cột (Capital)
   */
  private addClassicalColumn(
    parent: THREE.Group,
    x: number,
    yBase: number,
    z: number,
    height: number,
    radius: number,
    mat: THREE.Material,
    accentMat?: THREE.Material
  ) {
    const capH = Math.min(0.035, height * 0.12);
    const shaftH = height - capH * 2;

    const base = new THREE.Mesh(new RoundedBoxGeometry(radius * 2.8, capH, radius * 2.8, 2, 0.006), accentMat || mat);
    base.position.set(x, yBase + capH / 2, z);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.88, radius, shaftH, 10), mat);
    shaft.position.set(x, yBase + capH + shaftH / 2, z);
    shaft.castShadow = true;

    const capital = new THREE.Mesh(new RoundedBoxGeometry(radius * 2.8, capH, radius * 2.8, 2, 0.006), accentMat || mat);
    capital.position.set(x, yBase + height - capH / 2, z);

    parent.add(base, shaft, capital);
  }

  /**
   * Lan can ban công có trụ góc, con tiện và tay vịn
   */
  private addBalconyRailing(
    parent: THREE.Group,
    cx: number,
    yFloor: number,
    cz: number,
    width: number,
    depth: number,
    railMat: THREE.Material,
    postCount = 5
  ) {
    const railH = 0.09;
    const frontZ = cz + depth / 2 - 0.015;
    const postGeo = new THREE.CylinderGeometry(0.01, 0.012, railH, 6);

    // Tay vịn trước & 2 bên
    const frontRail = new THREE.Mesh(new RoundedBoxGeometry(width, 0.022, 0.028, 2, 0.006), railMat);
    frontRail.position.set(cx, yFloor + railH, frontZ);
    parent.add(frontRail);

    const sideRailGeo = new RoundedBoxGeometry(0.024, 0.022, depth, 2, 0.006);
    const sideRailL = new THREE.Mesh(sideRailGeo, railMat);
    sideRailL.position.set(cx - width / 2 + 0.015, yFloor + railH, cz);
    const sideRailR = new THREE.Mesh(sideRailGeo, railMat);
    sideRailR.position.set(cx + width / 2 - 0.015, yFloor + railH, cz);
    parent.add(sideRailL, sideRailR);

    // Trụ góc & con tiện
    for (let i = 0; i < postCount; i++) {
      const t = postCount === 1 ? 0.5 : i / (postCount - 1);
      const px = cx - width / 2 + 0.03 + t * (width - 0.06);
      const post = new THREE.Mesh(postGeo, railMat);
      post.position.set(px, yFloor + railH / 2, frontZ);
      parent.add(post);
    }
  }

  /**
   * Bụi cây tiểu cảnh đa diện (Tiered Faceted Foliage - IcosahedronGeometry flatShading)
   */
  private addFacetedBush(parent: THREE.Group, x: number, y: number, z: number, scale = 1.0) {
    const bushDarkMat = LandmarkModels.getMat('bldgBushDark', () => new THREE.MeshStandardMaterial({
      color: '#00896B',
      roughness: 0.6,
      flatShading: true
    }));
    const bushBrightMat = LandmarkModels.getMat('bldgBushBright', () => new THREE.MeshStandardMaterial({
      color: '#2ECC71',
      roughness: 0.5,
      flatShading: true
    }));

    const bushGroup = new THREE.Group();
    bushGroup.position.set(x, y, z);

    const baseSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(0.065 * scale, 0), bushDarkMat);
    baseSphere.scale.set(1.25, 0.85, 1.25);
    baseSphere.position.y = 0.045 * scale;
    baseSphere.castShadow = true;

    const topSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(0.048 * scale, 0), bushBrightMat);
    topSphere.position.set(0.015 * scale, 0.085 * scale, 0.01 * scale);

    bushGroup.add(baseSphere, topSphere);
    parent.add(bushGroup);
  }

  /**
   * Đèn sân / Đèn đường mini cổ điển phát sáng ấm
   */
  private addMiniStreetLamp(parent: THREE.Group, x: number, yBase: number, z: number, height = 0.34) {
    const ironMat = LandmarkModels.getMat('bldgLampIron', () => new THREE.MeshStandardMaterial({
      color: '#2F3542',
      roughness: 0.4,
      metalness: 0.8
    }));
    const bulbMat = LandmarkModels.getMat('bldgLampBulbGlow', () => new THREE.MeshStandardMaterial({
      color: '#FFEAA7',
      emissive: '#FFB142',
      emissiveIntensity: 1.6,
      roughness: 0.15
    }));

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.030, 0.04, 8), ironMat);
    base.position.set(x, yBase + 0.02, z);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.014, height - 0.08, 8), ironMat);
    pole.position.set(x, yBase + 0.04 + (height - 0.08) / 2, z);

    const bulb = new THREE.Mesh(new THREE.OctahedronGeometry(0.032, 0), bulbMat);
    bulb.position.set(x, yBase + height - 0.02, z);

    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.03, 6), ironMat);
    cap.position.set(x, yBase + height + 0.01, z);

    parent.add(base, pole, bulb, cap);
  }

  /**
   * Hồ bơi mini đá cẩm thạch + thang inox crom
   */
  private addMiniPool(parent: THREE.Group, x: number, y: number, z: number, w: number, d: number, ladderZOffset: number) {
    const poolMat = LandmarkMaterials.getPoolWaterMat();
    const poolCopingMat = LandmarkModels.getMat('bldgPoolMarbleCoping', () => new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.2 }));
    const chromeMat = LandmarkModels.getMat('bldgPoolChrome', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      metalness: 0.95,
      roughness: 0.1
    }));

    const poolCoping = new THREE.Mesh(new RoundedBoxGeometry(w, 0.04, d, 2, 0.01), poolCopingMat);
    poolCoping.position.set(x, y, z);

    const poolWater = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.06, d - 0.06), poolMat);
    poolWater.rotation.x = -Math.PI / 2;
    poolWater.position.set(x, y + 0.022, z);

    const ladderRailGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.14, 6);
    const lx = x - w / 2 + 0.03;
    const lz = z + ladderZOffset;
    const ladderL = new THREE.Mesh(ladderRailGeo, chromeMat);
    ladderL.position.set(lx, y + 0.06, lz - 0.02);
    const ladderR = new THREE.Mesh(ladderRailGeo, chromeMat);
    ladderR.position.set(lx, y + 0.06, lz + 0.02);
    const rung = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.006, 0.04), chromeMat);
    rung.position.set(lx, y + 0.08, lz);

    parent.add(poolCoping, poolWater, ladderL, ladderR, rung);
  }

  // ============================================================================
  // LEVEL 0: MỐC SỞ HỮU TINH TẾ
  // ============================================================================

  private buildLevel0(modelSubGroup: THREE.Group, ownerColor?: string) {
    const plinthMat = this.getPlinthMat();
    const goldMetalMat = LandmarkMaterials.getGoldMetalMat();
    const colorHex = ownerColor || '#00B894';

    const ownerMat = LandmarkModels.getMat(`bldgOwnerPlaque_${colorHex}`, () => new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.32
    }));
    const gemMat = LandmarkModels.getMat(`bldgOwnerGem_${colorHex}`, () => new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.75,
      metalness: 0.85,
      roughness: 0.12
    }));
    const marbleMat = LandmarkModels.getMat('bldgPostWhiteMarble', () => new THREE.MeshStandardMaterial({
      color: '#F5F6FA',
      roughness: 0.28
    }));

    // Bệ móng 2 tầng đá hoa cương vát cạnh
    const plinthLower = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.05, 0.68, 2, 0.02), plinthMat);
    plinthLower.position.y = 0.025;
    plinthLower.receiveShadow = true;

    const plinthUpper = new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.05, 0.54, 2, 0.02), marbleMat);
    plinthUpper.position.y = 0.075;
    plinthUpper.receiveShadow = true;

    // 4 đinh tán đồng đúc cổ điển tại 4 góc bệ đá
    const studGeo = new THREE.SphereGeometry(0.022, 6, 6);
    [[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]].forEach(([sx, sz]) => {
      const stud = new THREE.Mesh(studGeo, goldMetalMat);
      stud.position.set(sx, 0.055, sz);
      modelSubGroup.add(stud);
    });

    // Vòng đai mạ vàng bao bệ móng
    const ringGold = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.018, 8, 24), goldMetalMat);
    ringGold.rotation.x = Math.PI / 2;
    ringGold.position.y = 0.102;

    // Trụ mốc ranh giới đá cẩm thạch trắng có đế & đai vàng Art Deco
    const postBaseCollar = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.035, 0.22, 2, 0.01), goldMetalMat);
    postBaseCollar.position.y = 0.118;

    const post = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.44, 0.16, 2, 0.02), marbleMat);
    post.position.y = 0.35;
    post.castShadow = true;

    const collar = new THREE.Mesh(new RoundedBoxGeometry(0.19, 0.035, 0.19, 2, 0.01), goldMetalMat);
    collar.position.y = 0.46;

    const postCapital = new THREE.Mesh(new RoundedBoxGeometry(0.23, 0.04, 0.23, 2, 0.01), goldMetalMat);
    postCapital.position.y = 0.59;

    // Bảng huy hiệu sở hữu 2 mặt với gờ mạ vàng & ngôi sao bát diện nổi
    const plaqueFrame = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.34, 0.055, 2, 0.012), goldMetalMat);
    plaqueFrame.position.set(0, 0.74, 0.02);

    const plaqueFace = new THREE.Mesh(new RoundedBoxGeometry(0.39, 0.27, 0.065, 2, 0.01), ownerMat);
    plaqueFace.position.set(0, 0.74, 0.02);

    const emblemGeo = new THREE.OctahedronGeometry(0.058, 0);
    const emblemFront = new THREE.Mesh(emblemGeo, goldMetalMat);
    emblemFront.scale.set(1, 1, 0.45);
    emblemFront.position.set(0, 0.74, 0.062);

    const emblemBack = new THREE.Mesh(emblemGeo, goldMetalMat);
    emblemBack.scale.set(1, 1, 0.45);
    emblemBack.position.set(0, 0.74, -0.022);

    // Gờ vương miện & viên pha lê đỉnh chóp xoay nhẹ
    const plaqueCrown = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.03, 0.065, 2, 0.01), goldMetalMat);
    plaqueCrown.position.set(0, 0.925, 0.02);

    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.22, 6), gemMat);
    finial.position.set(0, 1.05, 0.02);
    finial.userData = { animType: 'spin_y' };

    modelSubGroup.add(
      plinthLower, plinthUpper, ringGold, postBaseCollar, post, collar, postCapital,
      plaqueFrame, plaqueFace, emblemFront, emblemBack, plaqueCrown, finial
    );
  }

  // ============================================================================
  // LEVEL 1: NHÀ CẤP 1 (COZY COTTAGE)
  // ============================================================================

  private buildLevel1(modelSubGroup: THREE.Group) {
    const plinthMat = this.getPlinthMat();
    const creamWallMat = this.getCreamWallMat();
    const trimMat = this.getTrimMat();
    const goldMetalMat = LandmarkMaterials.getGoldMetalMat();
    const winGlowMat = LandmarkMaterials.getWarmWindowMat();

    // Móng đá 2 bậc vững chãi
    const plinthLower = new THREE.Mesh(new RoundedBoxGeometry(0.98, 0.05, 0.98, 2, 0.02), plinthMat);
    plinthLower.position.y = 0.025;
    plinthLower.receiveShadow = true;

    const plinthUpper = new THREE.Mesh(new RoundedBoxGeometry(0.90, 0.06, 0.90, 2, 0.02), plinthMat);
    plinthUpper.position.y = 0.075;
    plinthUpper.receiveShadow = true;

    // Thân nhà tường kem bo góc
    const base = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.52, 0.76, 4, 0.07), creamWallMat);
    base.position.y = 0.36;
    base.castShadow = true;

    // Nẹp góc tường kiến trúc (Corner pilasters)
    const cornerGeo = new THREE.BoxGeometry(0.045, 0.52, 0.045);
    [[-0.37, 0.36], [0.37, 0.36], [-0.37, -0.36], [0.37, -0.36]].forEach(([cx, cz]) => {
      const cornerTrim = new THREE.Mesh(cornerGeo, trimMat);
      cornerTrim.position.set(cx, 0.36, cz);
      modelSubGroup.add(cornerTrim);
    });

    // Gờ chỉ phân tầng & diềm mái gỗ (Fascia / Eaves)
    const friezeBand = new THREE.Mesh(new RoundedBoxGeometry(0.83, 0.032, 0.81, 2, 0.01), trimMat);
    friezeBand.position.y = 0.61;

    const roofEavesMat = LandmarkModels.getMat('bldgL1RoofEaves', () => new THREE.MeshStandardMaterial({ color: '#8B4513', roughness: 0.5 }));
    const roofEaves = new THREE.Mesh(new RoundedBoxGeometry(0.90, 0.045, 0.88, 2, 0.01), roofEavesMat);
    roofEaves.position.y = 0.645;

    // Mái ngói san hô dốc kim tự tháp + chóp đỉnh mái
    const roofMat = LandmarkModels.getMat('bldgL1RoofCoral', () => new THREE.MeshStandardMaterial({
      color: '#E15F41',
      roughness: 0.32,
      metalness: 0.05
    }));
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.77, 0.52, 4), roofMat);
    roof.position.y = 0.91;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;

    const roofFinial = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), goldMetalMat);
    roofFinial.position.y = 1.18;

    // Cửa sổ mái gác lửng (Dormer) có khung & mái nhọn
    const dormer = new THREE.Mesh(new RoundedBoxGeometry(0.20, 0.16, 0.18, 2, 0.02), creamWallMat);
    dormer.position.set(0, 0.88, 0.27);
    const dormerRoof = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.10, 4), roofMat);
    dormerRoof.rotation.y = Math.PI / 4;
    dormerRoof.position.set(0, 1.00, 0.27);
    const dormerGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.10), winGlowMat);
    dormerGlow.position.set(0, 0.88, 0.365);

    // Cửa sổ mặt tiền có khung viền, cửa chớp, bệ đá & bồn hoa
    this.addFramedWindow(modelSubGroup, -0.20, 0.42, 0.382, 0.18, 0.20, 0, { shutters: true, sill: true, shutterColor: '#2C7A7B' });

    // Cửa sổ 2 bên hông giúp model đẹp ở mọi góc nhìn
    this.addFramedWindow(modelSubGroup, -0.392, 0.40, 0, 0.18, 0.18, -Math.PI / 2, { shutters: true, sill: true, shutterColor: '#2C7A7B' });
    this.addFramedWindow(modelSubGroup, 0.392, 0.40, 0, 0.18, 0.18, Math.PI / 2, { shutters: true, sill: true, shutterColor: '#2C7A7B' });

    // Bồn hoa dưới cửa sổ mặt tiền
    const flowerBoxMat = LandmarkModels.getMat('bldgFlowerBoxWood', () => new THREE.MeshStandardMaterial({ color: '#6D4C41', roughness: 0.6 }));
    const flowerBox = new THREE.Mesh(new RoundedBoxGeometry(0.23, 0.055, 0.06, 2, 0.008), flowerBoxMat);
    flowerBox.position.set(-0.20, 0.26, 0.42);

    const flowerBlossomMat = LandmarkModels.getMat('bldgFlowerBlossom', () => new THREE.MeshStandardMaterial({
      color: '#FF7675',
      emissive: '#FF7675',
      emissiveIntensity: 0.28,
      roughness: 0.3
    }));
    const flowerYellowMat = LandmarkModels.getMat('bldgFlowerYellow', () => new THREE.MeshStandardMaterial({
      color: '#FDCB6E',
      emissive: '#FDCB6E',
      emissiveIntensity: 0.25,
      roughness: 0.3
    }));
    [-0.26, -0.20, -0.14].forEach((fx, idx) => {
      const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 6), idx === 1 ? flowerYellowMat : flowerBlossomMat);
      blossom.position.set(fx, 0.30, 0.425);
      modelSubGroup.add(blossom);
    });

    // Cửa chính gỗ nâu có khung viền, tay nắm đồng, mái hiên & con bọ đỡ
    const doorMat = LandmarkModels.getMat('bldgDoorWood', () => new THREE.MeshStandardMaterial({ color: '#784212', roughness: 0.45 }));
    const doorArchitrave = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.36, 0.025, 2, 0.01), trimMat);
    doorArchitrave.position.set(0.18, 0.24, 0.382);

    const door = new THREE.Mesh(new RoundedBoxGeometry(0.21, 0.32, 0.04, 2, 0.01), doorMat);
    door.position.set(0.18, 0.23, 0.39);

    const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.09), winGlowMat);
    doorGlass.position.set(0.18, 0.30, 0.415);

    const doorknob = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), goldMetalMat);
    doorknob.position.set(0.25, 0.22, 0.422);

    const doorCanopy = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.032, 0.15, 2, 0.01), roofEavesMat);
    doorCanopy.position.set(0.18, 0.43, 0.45);

    const corbelGeo = new THREE.BoxGeometry(0.022, 0.065, 0.08);
    const corbelL = new THREE.Mesh(corbelGeo, trimMat);
    corbelL.position.set(0.06, 0.385, 0.41);
    const corbelR = new THREE.Mesh(corbelGeo, trimMat);
    corbelR.position.set(0.30, 0.385, 0.41);

    // Bậc thềm tam cấp đá trước cửa
    const porchStepMat = LandmarkModels.getMat('bldgPorchStepStone', () => new THREE.MeshStandardMaterial({ color: '#DFE4EA', roughness: 0.5 }));
    const stepLower = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.04, 0.14, 2, 0.01), porchStepMat);
    stepLower.position.set(0.18, 0.04, 0.52);
    const stepUpper = new THREE.Mesh(new RoundedBoxGeometry(0.30, 0.04, 0.12, 2, 0.01), porchStepMat);
    stepUpper.position.set(0.18, 0.08, 0.47);

    // Chậu hoa gốm bên thềm + hàng rào gỗ trắng + bụi cây + đèn sân mini
    const planterMat = LandmarkModels.getMat('bldgPlanterTerracotta', () => new THREE.MeshStandardMaterial({ color: '#D35400', roughness: 0.6 }));
    const planter = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.038, 0.09, 8), planterMat);
    planter.position.set(0.39, 0.14, 0.46);
    const planterFlowers = new THREE.Mesh(new THREE.SphereGeometry(0.065, 7, 7), flowerBlossomMat);
    planterFlowers.position.set(0.39, 0.21, 0.46);

    const fenceMat = LandmarkModels.getMat('bldgFenceWhite', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 }));
    const fenceRail = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.022, 0.025, 2, 0.005), fenceMat);
    fenceRail.position.set(-0.24, 0.17, 0.47);
    [-0.36, -0.28, -0.20, -0.12].forEach(px => {
      const picket = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.12, 0.028, 2, 0.005), fenceMat);
      picket.position.set(px, 0.15, 0.47);
      modelSubGroup.add(picket);
    });

    this.addFacetedBush(modelSubGroup, -0.43, 0.10, 0.40, 0.9);
    this.addMiniStreetLamp(modelSubGroup, -0.02, 0.10, 0.50, 0.30);

    // Ống khói gạch nung đỏ có vành đá, chóp mái ống khói & khói lam chiều
    const chimneyMat = LandmarkModels.getMat('bldgChimneyRed', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.6 }));
    const chimney = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.42, 0.15, 2, 0.02), chimneyMat);
    chimney.position.set(0.22, 0.98, 0.16);

    const chimneyCollar = new THREE.Mesh(new RoundedBoxGeometry(0.19, 0.035, 0.19, 2, 0.01), plinthMat);
    chimneyCollar.position.set(0.22, 1.19, 0.16);

    const chimneyCap = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.08, 4), roofEavesMat);
    chimneyCap.rotation.y = Math.PI / 4;
    chimneyCap.position.set(0.22, 1.26, 0.16);

    const smokeMat = LandmarkModels.getMat('bldgSmokePuff', () => new THREE.MeshStandardMaterial({
      color: '#F5F6FA',
      transparent: true,
      opacity: 0.55,
      roughness: 0.8,
      depthWrite: false
    }));
    const smokeGroup = new THREE.Group();
    smokeGroup.position.set(0.22, 1.33, 0.16);
    smokeGroup.userData = { animType: 'flicker' };

    const puff1 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 7, 7), smokeMat);
    const puff2 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 7, 7), smokeMat);
    puff2.position.set(0.02, 0.10, 0.01);
    const puff3 = new THREE.Mesh(new THREE.SphereGeometry(0.085, 7, 7), smokeMat);
    puff3.position.set(-0.01, 0.21, 0.03);
    smokeGroup.add(puff1, puff2, puff3);

    modelSubGroup.add(
      plinthLower, plinthUpper, base, friezeBand, roofEaves, roof, roofFinial,
      dormer, dormerRoof, dormerGlow,
      flowerBox,
      doorArchitrave, door, doorGlass, doorknob, doorCanopy, corbelL, corbelR,
      stepLower, stepUpper, planter, planterFlowers, fenceRail,
      chimney, chimneyCollar, chimneyCap, smokeGroup
    );
  }

  // ============================================================================
  // LEVEL 2: NHÀ CẤP 2 (BIỆT THỰ PHỐ 2 TẦNG)
  // ============================================================================

  private buildLevel2(modelSubGroup: THREE.Group) {
    const plinthMat = this.getPlinthMat();
    const creamWallMat = this.getCreamWallMat();
    const corniceMat = this.getCorniceMat();
    const goldMetalMat = LandmarkMaterials.getGoldMetalMat();
    const winGlowMat = LandmarkMaterials.getWarmWindowMat();

    // Bệ móng sân vườn giật cấp 2 bậc
    const plinthLower = new THREE.Mesh(new RoundedBoxGeometry(1.32, 0.05, 1.06, 2, 0.02), plinthMat);
    plinthLower.position.y = 0.025;
    plinthLower.receiveShadow = true;

    const plinthUpper = new THREE.Mesh(new RoundedBoxGeometry(1.26, 0.05, 1.00, 2, 0.02), plinthMat);
    plinthUpper.position.y = 0.075;
    plinthUpper.receiveShadow = true;

    // Thảm cỏ sân vườn resort bên phải
    const lawnMat = LandmarkModels.getMat('bldgLawnGreen', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.65 }));
    const lawn = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.03, 0.90, 2, 0.01), lawnMat);
    lawn.position.set(0.39, 0.11, 0);

    // Hồ bơi resort mini & thang inox
    this.addMiniPool(modelSubGroup, 0.39, 0.125, 0.08, 0.34, 0.48, -0.18);

    // Ghế tắm nắng & dù che resort
    const sunLoungerMat = LandmarkModels.getMat('bldgSunLoungerWood', () => new THREE.MeshStandardMaterial({ color: '#E67E22', roughness: 0.4 }));
    const lounger = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.04, 0.22, 2, 0.008), sunLoungerMat);
    lounger.position.set(0.39, 0.145, -0.28);

    const parasolPole = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.32, 6), goldMetalMat);
    parasolPole.position.set(0.49, 0.26, -0.28);
    parasolPole.rotation.z = -0.08;
    const parasolMat = LandmarkModels.getMat('bldgParasolCoral', () => new THREE.MeshStandardMaterial({ color: '#FF7675', roughness: 0.35 }));
    const parasolCanopy = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.08, 8), parasolMat);
    parasolCanopy.position.set(0.475, 0.41, -0.28);

    // Tầng 1 biệt thự tường kem
    const f1 = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.48, 0.82, 4, 0.07), creamWallMat);
    f1.position.set(-0.16, 0.34, 0);
    f1.castShadow = true;

    // Cột hiên tân cổ điển (Base + Shaft + Capital)
    const columnMat = LandmarkModels.getMat('bldgPorticoColumnStone', () => new THREE.MeshStandardMaterial({ color: '#F1F2F6', roughness: 0.3 }));
    this.addClassicalColumn(modelSubGroup, -0.33, 0.10, 0.45, 0.41, 0.024, columnMat, goldMetalMat);
    this.addClassicalColumn(modelSubGroup, 0.01, 0.10, 0.45, 0.41, 0.024, columnMat, goldMetalMat);

    // Mái hiên sảnh tầng 1 viền vàng
    const canopyF1 = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.04, 0.18, 2, 0.01), goldMetalMat);
    canopyF1.position.set(-0.16, 0.525, 0.45);

    // Cửa kính lớn tầng trệt & cửa sổ đôi có khung
    const doorFrame = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.34, 0.035, 2, 0.01), this.getWinFrameMat());
    doorFrame.position.set(-0.16, 0.27, 0.412);
    const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.28), winGlowMat);
    doorGlass.position.set(-0.16, 0.28, 0.432);
    const doorDivider = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.28, 0.012), this.getWinFrameMat());
    doorDivider.position.set(-0.16, 0.28, 0.436);

    this.addFramedWindow(modelSubGroup, -0.43, 0.35, 0.412, 0.16, 0.22, 0, { shutters: false, sill: true });
    this.addFramedWindow(modelSubGroup, 0.11, 0.35, 0.412, 0.16, 0.22, 0, { shutters: false, sill: true });
    this.addFramedWindow(modelSubGroup, -0.572, 0.35, 0, 0.22, 0.22, -Math.PI / 2, { shutters: true, sill: true });

    // Gờ phào phân tầng
    const floorCornice = new THREE.Mesh(new RoundedBoxGeometry(0.88, 0.045, 0.88, 2, 0.01), corniceMat);
    floorCornice.position.set(-0.16, 0.59, 0);

    // Tầng 2 giật cấp tường vàng pastel ấm áp
    const f2Mat = LandmarkModels.getMat('bldgL2WallWarm', () => new THREE.MeshStandardMaterial({ color: '#FFEAA7', roughness: 0.35 }));
    const f2 = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.48, 0.72, 4, 0.07), f2Mat);
    f2.position.set(-0.16, 0.83, 0);
    f2.castShadow = true;

    // Cửa kính lớn tầng 2 & cửa sổ 2 bên
    this.addFramedWindow(modelSubGroup, -0.16, 0.85, 0.362, 0.28, 0.24, 0, { shutters: false, sill: true });
    this.addFramedWindow(modelSubGroup, -0.522, 0.84, 0, 0.20, 0.20, -Math.PI / 2, { shutters: true, sill: true });
    this.addFramedWindow(modelSubGroup, 0.202, 0.84, 0, 0.20, 0.20, Math.PI / 2, { shutters: true, sill: true });

    // Ban công tầng 2 có lan can con tiện trắng & bồn hoa
    const balconyMat = LandmarkModels.getMat('bldgBalconyWhite', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 }));
    const balcony = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.05, 0.20, 2, 0.01), balconyMat);
    balcony.position.set(-0.16, 0.59, 0.45);
    this.addBalconyRailing(modelSubGroup, -0.16, 0.615, 0.45, 0.76, 0.18, balconyMat, 6);

    const flowerMat = LandmarkModels.getMat('bldgFlowerCoral', () => new THREE.MeshStandardMaterial({
      color: '#FF7675',
      emissive: '#FF7675',
      emissiveIntensity: 0.45
    }));
    const flowers = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.065), flowerMat);
    flowers.position.set(-0.16, 0.64, 0.44);

    // Gờ hiên mái & mái hiên dốc 4 mặt có cửa sổ mái (Dormer)
    const roofEavesF2 = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.04, 0.78, 2, 0.01), corniceMat);
    roofEavesF2.position.set(-0.16, 1.08, 0);

    const roofMat = LandmarkModels.getMat('bldgL2RoofCoral', () => new THREE.MeshStandardMaterial({
      color: '#E17055',
      roughness: 0.28,
      metalness: 0.08
    }));
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.48, 4), roofMat);
    roof.position.set(-0.16, 1.30, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;

    const roofFinial = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), goldMetalMat);
    roofFinial.position.set(-0.16, 1.55, 0);

    // Cửa sổ mái (Dormer) trên mái tầng 2
    const dormer2 = new THREE.Mesh(new RoundedBoxGeometry(0.20, 0.15, 0.18, 2, 0.015), creamWallMat);
    dormer2.position.set(-0.16, 1.24, 0.23);
    const dormerRoof2 = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.09, 4), roofMat);
    dormerRoof2.rotation.y = Math.PI / 4;
    dormerRoof2.position.set(-0.16, 1.35, 0.23);
    const dormerGlow2 = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.09), winGlowMat);
    dormerGlow2.position.set(-0.16, 1.24, 0.325);

    // Hàng rào & cổng nhỏ mặt tiền + bồn cây xanh
    const gatePillarGeo = new RoundedBoxGeometry(0.06, 0.18, 0.06, 2, 0.01);
    const gateL = new THREE.Mesh(gatePillarGeo, corniceMat);
    gateL.position.set(-0.32, 0.18, 0.50);
    const gateR = new THREE.Mesh(gatePillarGeo, corniceMat);
    gateR.position.set(0.00, 0.18, 0.50);

    const fenceFront = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.09, 0.03, 2, 0.006), balconyMat);
    fenceFront.position.set(0.39, 0.16, 0.48);

    this.addFacetedBush(modelSubGroup, -0.54, 0.10, 0.45, 0.95);
    this.addFacetedBush(modelSubGroup, 0.54, 0.12, 0.38, 0.85);

    modelSubGroup.add(
      plinthLower, plinthUpper, lawn,
      lounger, parasolPole, parasolCanopy,
      f1, canopyF1, doorFrame, doorGlass, doorDivider, floorCornice,
      f2, balcony, flowers,
      roofEavesF2, roof, roofFinial, dormer2, dormerRoof2, dormerGlow2,
      gateL, gateR, fenceFront
    );
  }

  // ============================================================================
  // LEVEL 3: NHÀ CẤP 3 (DINH THỰ 3 TẦNG SANG TRỌNG)
  // ============================================================================

  private buildLevel3(modelSubGroup: THREE.Group) {
    const plinthMat = this.getPlinthMat();
    const corniceMat = this.getCorniceMat();
    const goldMetalMat = LandmarkMaterials.getGoldMetalMat();
    const winGlowMat = LandmarkMaterials.getWarmWindowMat();

    const plinth = new THREE.Mesh(new RoundedBoxGeometry(1.30, 0.08, 1.22, 2, 0.02), plinthMat);
    plinth.position.y = 0.04;
    plinth.receiveShadow = true;

    // Hồ bơi chân mây mini bên phải
    this.addMiniPool(modelSubGroup, 0.42, 0.10, 0.08, 0.34, 0.62, -0.22);

    // Tầng 1: Đại sảnh cẩm thạch trắng
    const baseMat = LandmarkModels.getMat('bldgL3BaseMarble', () => new THREE.MeshStandardMaterial({
      color: '#F1F2F6',
      roughness: 0.22,
      metalness: 0.1
    }));
    const base = new THREE.Mesh(new RoundedBoxGeometry(0.88, 0.62, 0.96, 4, 0.07), baseMat);
    base.position.set(-0.14, 0.39, 0);
    base.castShadow = true;

    // 4 cột trụ sảnh tầng 1
    [-0.40, -0.26, -0.02, 0.12].forEach(cx => {
      this.addClassicalColumn(modelSubGroup, cx, 0.08, 0.52, 0.48, 0.022, baseMat, goldMetalMat);
    });

    // Mái đón sảnh tầng 1 viền vàng
    const canopy = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.045, 0.22, 2, 0.01), goldMetalMat);
    canopy.position.set(-0.14, 0.58, 0.53);

    // Kính sảnh tầng 1 có khung & đố dọc
    this.addFramedWindow(modelSubGroup, -0.14, 0.34, 0.482, 0.58, 0.26, 0, { sill: false });
    this.addFramedWindow(modelSubGroup, -0.582, 0.36, 0, 0.36, 0.24, -Math.PI / 2, { sill: true });

    // Phào chỉ phân tầng 1-2
    const cornice1 = new THREE.Mesh(new RoundedBoxGeometry(0.93, 0.045, 1.00, 2, 0.01), corniceMat);
    cornice1.position.set(-0.14, 0.71, 0);

    // Tầng 2: Khối kính Cyan PBR sang trọng + trụ góc đá trắng + nẹp crom
    const towerMat = LandmarkModels.getMat('bldgL3TowerGlassCyan', () => new THREE.MeshStandardMaterial({
      color: '#00CEC9',
      roughness: 0.08,
      metalness: 0.82,
      emissive: '#0984E3',
      emissiveIntensity: 0.42
    }));
    const f2 = new THREE.Mesh(new RoundedBoxGeometry(0.76, 0.56, 0.84, 4, 0.05), towerMat);
    f2.position.set(-0.14, 1.00, 0);
    f2.castShadow = true;

    const mullionMat = LandmarkModels.getMat('bldgL3MullionChrome', () => new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      metalness: 0.95,
      roughness: 0.1
    }));
    [[-0.37, -0.41], [0.37, -0.41], [-0.37, 0.41], [0.37, 0.41]].forEach(([mx, mz]) => {
      const cornerPier = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.56, 0.05), baseMat);
      cornerPier.position.set(-0.14 + mx, 1.00, mz);
      modelSubGroup.add(cornerPier);
    });
    [-0.14 - 0.16, -0.14, -0.14 + 0.16].forEach(mx => {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.54, 0.02), mullionMat);
      mullion.position.set(mx, 1.00, 0.425);
      modelSubGroup.add(mullion);
    });

    // Ban công tầng 2
    const balcony2 = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.045, 0.18, 2, 0.01), baseMat);
    balcony2.position.set(-0.14, 0.725, 0.46);
    this.addBalconyRailing(modelSubGroup, -0.14, 0.75, 0.46, 0.70, 0.16, goldMetalMat, 6);

    // Phào chỉ phân tầng 2-3
    const cornice2 = new THREE.Mesh(new RoundedBoxGeometry(0.81, 0.045, 0.89, 2, 0.01), corniceMat);
    cornice2.position.set(-0.14, 1.29, 0);

    // Tầng 3: Penthouse giật cấp có ban công & cửa kính toàn cảnh
    const f3 = new THREE.Mesh(new RoundedBoxGeometry(0.60, 0.46, 0.68, 4, 0.05), baseMat);
    f3.position.set(-0.14, 1.53, 0);
    f3.castShadow = true;

    this.addFramedWindow(modelSubGroup, -0.14, 1.53, 0.342, 0.44, 0.24, 0, { sill: false });
    this.addFramedWindow(modelSubGroup, -0.442, 1.53, 0, 0.32, 0.22, -Math.PI / 2, { sill: false });

    const balcony3 = new THREE.Mesh(new RoundedBoxGeometry(0.64, 0.04, 0.16, 2, 0.01), baseMat);
    balcony3.position.set(-0.14, 1.305, 0.38);
    this.addBalconyRailing(modelSubGroup, -0.14, 1.325, 0.38, 0.62, 0.14, goldMetalMat, 5);

    // Vành đai LED & Mái Mansard xếp lớp + mái vòm (Cupola)
    const crownRimMat = LandmarkModels.getMat('bldgL3CrownNeon', () => new THREE.MeshStandardMaterial({
      color: '#81ECEC',
      emissive: '#00CEC9',
      emissiveIntensity: 1.15
    }));
    const crownRim = new THREE.Mesh(new RoundedBoxGeometry(0.65, 0.045, 0.73, 2, 0.01), crownRimMat);
    crownRim.position.set(-0.14, 1.77, 0);

    const mansardMat = LandmarkModels.getMat('bldgL3MansardTeal', () => new THREE.MeshStandardMaterial({
      color: '#1E3A5F',
      roughness: 0.35,
      metalness: 0.25
    }));
    const mansardRoof = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.44, 0.22, 4), mansardMat);
    mansardRoof.rotation.y = Math.PI / 4;
    mansardRoof.position.set(-0.14, 1.90, 0);

    const domeCupola = new THREE.Mesh(new THREE.SphereGeometry(0.20, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), goldMetalMat);
    domeCupola.position.set(-0.14, 2.01, 0);

    // Ăng-ten thu phát & đèn cảnh báo đỏ nhấp nháy
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.042, 0.45, 8), goldMetalMat);
    antenna.position.set(-0.14, 2.34, 0);

    const orbMat = LandmarkModels.getMat('bldgL3BeaconRed', () => new THREE.MeshStandardMaterial({
      color: '#FF4757',
      emissive: '#FF4757',
      emissiveIntensity: 1.5
    }));
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), orbMat);
    orb.position.set(-0.14, 2.59, 0);
    orb.userData = { animType: 'pulse_red' };

    // Tiểu cảnh cây xanh & đèn đường mini 2 bên mặt tiền
    this.addFacetedBush(modelSubGroup, -0.56, 0.08, 0.46, 0.9);
    this.addFacetedBush(modelSubGroup, 0.42, 0.08, -0.34, 0.9);
    this.addMiniStreetLamp(modelSubGroup, -0.55, 0.08, 0.54, 0.38);
    this.addMiniStreetLamp(modelSubGroup, 0.52, 0.08, 0.50, 0.38);

    modelSubGroup.add(
      plinth, base, canopy, cornice1, f2, balcony2, cornice2,
      f3, balcony3, crownRim, mansardRoof, domeCupola, antenna, orb
    );
  }

  // ============================================================================
  // LEVEL 4: KHÁCH SẠN HOÀNG GIA 5 SAO
  // ============================================================================

  private buildLevel4(modelSubGroup: THREE.Group) {
    const plinthMat = this.getPlinthMat();
    const corniceMat = this.getCorniceMat();
    const tier1Mat = LandmarkMaterials.getSapphireGlassMat();
    const goldMetalMat = LandmarkMaterials.getGoldMetalMat();
    const winGlowMat = LandmarkMaterials.getWarmWindowMat();
    const carpetMat = LandmarkMaterials.getRedCarpetMat();

    // Đế đá hoa cương & bậc tam cấp mặt tiền
    const plinth = new THREE.Mesh(new RoundedBoxGeometry(1.34, 0.08, 1.34, 2, 0.02), plinthMat);
    plinth.position.y = 0.04;
    plinth.receiveShadow = true;

    const step1 = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.035, 0.18, 2, 0.008), corniceMat);
    step1.position.set(0, 0.02, 0.72);
    const step2 = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.035, 0.14, 2, 0.008), corniceMat);
    step2.position.set(0, 0.055, 0.67);

    // Tháp 3 tầng giật cấp bằng kính Sapphire phản quang
    const tier1 = new THREE.Mesh(new RoundedBoxGeometry(1.22, 1.25, 1.22, 4, 0.10), tier1Mat);
    tier1.position.y = 0.705;
    tier1.castShadow = true;

    const tier2 = new THREE.Mesh(new RoundedBoxGeometry(0.94, 1.02, 0.94, 4, 0.08), tier1Mat);
    tier2.position.y = 1.84;
    tier2.castShadow = true;

    const tier3 = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.80, 0.68, 4, 0.06), tier1Mat);
    tier3.position.y = 2.75;

    // Gờ phân tầng ngang rõ nét giữa các tầng
    [0.50, 0.92, 1.34, 1.84, 2.36, 2.78, 3.16].forEach((ly, idx) => {
      const size = idx < 3 ? 1.26 : idx < 5 ? 0.98 : 0.72;
      const ledge = new THREE.Mesh(new RoundedBoxGeometry(size, 0.04, size, 2, 0.01), corniceMat);
      ledge.position.y = ly;
      modelSubGroup.add(ledge);
    });

    // Dải cửa sổ phát sáng ấm áp có khung dọc rõ ràng trên mặt tiền & 2 bên
    const addHotelWindowBand = (y: number, width: number, depthHalf: number) => {
      const stripF = new THREE.Mesh(new THREE.PlaneGeometry(width, 0.18), winGlowMat);
      stripF.position.set(0, y, depthHalf + 0.012);
      const stripL = new THREE.Mesh(new THREE.PlaneGeometry(width, 0.18), winGlowMat);
      stripL.rotation.y = -Math.PI / 2;
      stripL.position.set(-depthHalf - 0.012, y, 0);
      const stripR = new THREE.Mesh(new THREE.PlaneGeometry(width, 0.18), winGlowMat);
      stripR.rotation.y = Math.PI / 2;
      stripR.position.set(depthHalf + 0.012, y, 0);
      modelSubGroup.add(stripF, stripL, stripR);
    };
    addHotelWindowBand(0.71, 0.96, 0.61);
    addHotelWindowBand(1.13, 0.96, 0.61);
    addHotelWindowBand(1.60, 0.72, 0.47);
    addHotelWindowBand(2.08, 0.72, 0.47);
    addHotelWindowBand(2.57, 0.48, 0.34);
    addHotelWindowBand(2.96, 0.48, 0.34);

    // Gân chỉ mạ vàng Art Deco dọc mặt tiền
    const ribL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.28, 0.05), goldMetalMat);
    ribL.position.set(-0.28, 1.22, 0.605);
    const ribR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.28, 0.05), goldMetalMat);
    ribR.position.set(0.28, 1.22, 0.605);

    // Ban công VIP tầng 2 mặt tiền
    const vipBalcony = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.045, 0.16, 2, 0.01), corniceMat);
    vipBalcony.position.set(0, 1.36, 0.52);
    this.addBalconyRailing(modelSubGroup, 0, 1.385, 0.52, 0.66, 0.14, goldMetalMat, 6);

    // Thảm đỏ VIP + 4 cột chặn mạ vàng + mái sảnh đón (Porte-cochère) có 2 cột trụ
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.68), carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.085, 0.74);

    const stanchionGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.14, 8);
    [-0.24, 0.24].forEach(sx => {
      [0.64, 0.88].forEach(sz => {
        const stanchion = new THREE.Mesh(stanchionGeo, goldMetalMat);
        stanchion.position.set(sx, 0.14, sz);
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), goldMetalMat);
        ball.position.set(sx, 0.22, sz);
        modelSubGroup.add(stanchion, ball);
      });
    });

    this.addClassicalColumn(modelSubGroup, -0.24, 0.08, 0.80, 0.42, 0.025, corniceMat, goldMetalMat);
    this.addClassicalColumn(modelSubGroup, 0.24, 0.08, 0.80, 0.42, 0.025, corniceMat, goldMetalMat);

    const canopy = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.06, 0.40, 2, 0.02), goldMetalMat);
    canopy.position.set(0, 0.52, 0.70);

    // Biển hiệu đèn neon "HOTEL" nổi phía trên sảnh đón
    const signMat = LandmarkModels.getMat('bldgL4HotelSign', () => new THREE.MeshStandardMaterial({
      color: '#FFEAA7',
      emissive: '#FDCB6E',
      emissiveIntensity: 1.1,
      roughness: 0.2
    }));
    const signFrame = new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.13, 0.04, 2, 0.01), goldMetalMat);
    signFrame.position.set(0, 0.65, 0.65);
    const hotelSign = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.09, 0.05, 2, 0.01), signMat);
    hotelSign.position.set(0, 0.65, 0.655);

    // Sân thượng tầng 1: Helipad bên phải & Hồ bơi Sky-Pool mini bên trái
    const heliPadMat = LandmarkModels.getMat('bldgL4Helipad', () => new THREE.MeshStandardMaterial({
      color: '#2D3436',
      roughness: 0.45,
      metalness: 0.2
    }));
    const heliPad = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 16), heliPadMat);
    heliPad.position.set(0.39, 1.37, 0.39);

    const hSignMat = LandmarkModels.getMat('bldgL4HeliSign', () => new THREE.MeshBasicMaterial({ color: '#FFEAA7' }));
    const hBarGeo = new THREE.BoxGeometry(0.03, 0.008, 0.16);
    const hL = new THREE.Mesh(hBarGeo, hSignMat);
    hL.position.set(0.34, 1.385, 0.39);
    const hR = new THREE.Mesh(hBarGeo, hSignMat);
    hR.position.set(0.44, 1.385, 0.39);
    const hMid = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.008, 0.03), hSignMat);
    hMid.position.set(0.39, 1.385, 0.39);

    const heliLightsGroup = new THREE.Group();
    heliLightsGroup.position.set(0.39, 1.385, 0.39);
    heliLightsGroup.userData = { animType: 'spin_y' };
    const beaconLightMat = LandmarkModels.getMat('bldgL4HeliLightDot', () => new THREE.MeshStandardMaterial({
      color: '#00CEC9',
      emissive: '#00CEC9',
      emissiveIntensity: 1.2
    }));
    for (let hl = 0; hl < 6; hl++) {
      const ang = (hl / 6) * Math.PI * 2;
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), beaconLightMat);
      dot.position.set(Math.cos(ang) * 0.22, 0.005, Math.sin(ang) * 0.22);
      heliLightsGroup.add(dot);
    }

    // Hồ bơi Sky-Pool mini sân thượng tầng 1 bên trái
    this.addMiniPool(modelSubGroup, -0.39, 1.38, 0.39, 0.32, 0.32, -0.10);

    // Chóp vương miện mạ vàng hoàng gia + 4 chóp góc + Quả cầu pha lê phát sáng
    const crownBase = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.06, 0.58, 2, 0.015), goldMetalMat);
    crownBase.position.y = 3.20;

    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.84, 8), goldMetalMat);
    crown.position.y = 3.65;

    [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]].forEach(([fx, fz]) => {
      const cornerSpire = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 6), goldMetalMat);
      cornerSpire.position.set(fx, 3.28, fz);
      modelSubGroup.add(cornerSpire);
    });

    const orbMat = LandmarkModels.getMat('bldgL4SpireOrb', () => new THREE.MeshStandardMaterial({
      color: '#FFF275',
      emissive: '#FFF275',
      emissiveIntensity: 1.4,
      roughness: 0.06
    }));
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), orbMat);
    orb.position.y = 4.16;

    this.animatedSpireLandmarks.push(orb);
    modelSubGroup.add(
      plinth, step1, step2, tier1, tier2, tier3,
      ribL, ribR, vipBalcony, carpet, canopy, signFrame, hotelSign,
      heliPad, hL, hR, hMid, heliLightsGroup,
      crownBase, crown, orb
    );
  }

  private animateBounce(group: THREE.Group) {
    group.scale.set(0.01, 0.01, 0.01);
    this.bouncingItems = this.bouncingItems.filter(b => b.group !== group);
    this.bouncingItems.push({ group, progress: 0 });
  }

  public update(delta: number, elapsedTime?: number) {
    // 1. Cập nhật hoạt ảnh nảy đàn hồi theo frame-delta
    for (let i = this.bouncingItems.length - 1; i >= 0; i--) {
      const item = this.bouncingItems[i];
      item.progress += delta * 4.8;
      if (item.progress >= 1) {
        item.group.scale.set(1, 1, 1);
        this.bouncingItems.splice(i, 1);
      } else {
        const s = Math.sin(item.progress * Math.PI * 0.75) * 1.18;
        item.group.scale.set(s, s, s);
      }
    }

    // 2. Cập nhật quả cầu pha lê xoay trên đỉnh tháp Level 4
    const time = elapsedTime !== undefined ? elapsedTime : performance.now() * 0.001;
    this.animatedSpireLandmarks.forEach((orb, i) => {
      orb.rotation.y = time * 1.5;
      const scale = 1 + Math.sin(time * 4 + i) * 0.08;
      orb.scale.set(scale, scale, scale);
    });

    // 3. Cập nhật micro-animations trong các công trình (khói lam chiều, đèn helipad...)
    this.buildingMap.forEach((bGroup) => {
      bGroup.traverse((child) => {
        if (child.userData && child.userData.animType) {
          const type = child.userData.animType;
          if (type === 'spin_y') {
            child.rotation.y += delta * 2.4;
          } else if (type === 'flicker') {
            const sc = 1 + Math.sin(time * 8) * 0.12;
            child.scale.set(sc, sc * (1 + Math.cos(time * 6) * 0.08), sc);
          } else if (type === 'pulse_red') {
            const p = (Math.sin(time * 6) + 1) * 0.5;
            child.scale.setScalar(0.9 + p * 0.25);
          }
        }
      });
    });
  }

  public reset() {
    this.bouncingItems = [];
    this.buildingMap.forEach((mesh) => {
      this.group.remove(mesh);
    });
    this.buildingMap.clear();
    this.animatedSpireLandmarks = [];
  }
}
