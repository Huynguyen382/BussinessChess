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

    const plinthMat = LandmarkModels.getMat('bldgPlinthGrey', () => new THREE.MeshStandardMaterial({ color: '#718093', roughness: 0.62 }));
    const creamWallMat = LandmarkModels.getMat('bldgCreamWall', () => new THREE.MeshStandardMaterial({ color: '#FFFDF9', roughness: 0.35 }));
    const winGlowMat = LandmarkMaterials.getWarmWindowMat();
    const goldMetalMat = LandmarkMaterials.getGoldMetalMat();

    if (level === 0) {
      // ==========================================
      // 🚩 Level 0: Cọc Mốc Ranh Giới & Biển Cắm Cờ Sở Hữu (Monopoly GO! Stylized)
      // ==========================================
      const colorHex = ownerColor || '#00B894';
      const ownerMat = LandmarkModels.getMat(`bldgOwnerPlaque_${colorHex}`, () => new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.35
      }));
      const gemMat = LandmarkModels.getMat(`bldgOwnerGem_${colorHex}`, () => new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.7,
        metalness: 0.85,
        roughness: 0.12
      }));
      const marbleMat = LandmarkModels.getMat('bldgPostWhiteMarble', () => new THREE.MeshStandardMaterial({
        color: '#F5F6FA',
        roughness: 0.3
      }));

      // Bệ móng đá hoa cương bo góc
      const plinth = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.08, 0.62, 2, 0.02), plinthMat);
      plinth.position.y = 0.04;
      plinth.receiveShadow = true;

      // Vòng đai mạ vàng bao bệ móng
      const ringGold = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 8, 24), goldMetalMat);
      ringGold.rotation.x = Math.PI / 2;
      ringGold.position.y = 0.082;

      // Trụ mốc ranh giới bằng đá cẩm thạch trắng
      const post = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.46, 0.16, 2, 0.02), marbleMat);
      post.position.y = 0.31;
      post.castShadow = true;

      // Khuyên nẹp vàng Art Deco giữa thân cột
      const collar = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.04, 0.18, 2, 0.01), goldMetalMat);
      collar.position.y = 0.42;

      // Bảng huy hiệu sở hữu phong cách Monopoly GO! với gờ mạ vàng
      const plaqueFrame = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.32, 0.05, 2, 0.012), goldMetalMat);
      plaqueFrame.position.set(0, 0.62, 0.03);

      const plaqueFace = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.26, 0.055, 2, 0.01), ownerMat);
      plaqueFace.position.set(0, 0.62, 0.03);

      // Biểu tượng ngôi sao vàng nổi giữa bảng sở hữu
      const starDeco = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), goldMetalMat);
      starDeco.position.set(0, 0.62, 0.06);

      // Viên đá quý pha lê đỉnh chóp phát sáng theo màu chủ sở hữu
      const finial = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.2, 8), gemMat);
      finial.position.y = 0.88;

      modelSubGroup.add(plinth, ringGold, post, collar, plaqueFrame, plaqueFace, starDeco, finial);

    } else if (level === 1) {
      // ==========================================
      // 🏡 Level 1: Nhà Nghỉ Dưỡng Nhỏ Xinh (Business Tour Cozy Vacation Cottage)
      // ==========================================
      // Gờ chân móng bằng gạch thẻ xám vững chãi
      const plinth = new THREE.Mesh(new RoundedBoxGeometry(0.86, 0.1, 0.86, 2, 0.02), plinthMat);
      plinth.position.y = 0.05;
      plinth.receiveShadow = true;

      // Thân nhà tường kem ấm bo tròn mềm mại phong cách Business Tour
      const base = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.52, 0.78, 4, 0.08), creamWallMat);
      base.position.y = 0.36;
      base.castShadow = true;

      // Mái ngói san hô ấm áp vát cạnh kim tự tháp (ConeGeometry 4 cạnh, xoay 45 độ)
      const roofMat = LandmarkModels.getMat('bldgL1RoofCoral', () => new THREE.MeshStandardMaterial({
        color: '#E15F41',
        roughness: 0.32,
        metalness: 0.05
      }));
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.78, 0.52, 4), roofMat);
      roof.position.y = 0.88;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;

      // Gờ hiên mái gỗ nâu ấm bao quanh chân mái
      const roofEavesMat = LandmarkModels.getMat('bldgL1RoofEaves', () => new THREE.MeshStandardMaterial({ color: '#8B4513', roughness: 0.5 }));
      const roofEaves = new THREE.Mesh(new RoundedBoxGeometry(0.84, 0.04, 0.84, 2, 0.01), roofEavesMat);
      roofEaves.position.y = 0.63;

      // Cửa sổ phát sáng vàng ấm cúng với khung nẹp gỗ chữ thập
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.24), winGlowMat);
      win.position.set(0, 0.42, 0.402);

      const winFrameMat = LandmarkModels.getMat('bldgWinFrameWood', () => new THREE.MeshStandardMaterial({ color: '#574B90', roughness: 0.5 }));
      const winMullionH = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.01), winFrameMat);
      winMullionH.position.set(0, 0.42, 0.405);
      const winMullionV = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.24, 0.01), winFrameMat);
      winMullionV.position.set(0, 0.42, 0.405);

      // Cửa gỗ nâu bo vòm có tay nắm mạ vàng tí hon
      const doorMat = LandmarkModels.getMat('bldgDoorWood', () => new THREE.MeshStandardMaterial({ color: '#784212', roughness: 0.45 }));
      const door = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.34, 0.04, 2, 0.01), doorMat);
      door.position.set(0, 0.24, 0.4);

      const doorknob = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), goldMetalMat);
      doorknob.position.set(0.08, 0.24, 0.43);

      // Bậc tam cấp đá đón khách trước hiên
      const porchStepMat = LandmarkModels.getMat('bldgPorchStepStone', () => new THREE.MeshStandardMaterial({ color: '#DFE4EA', roughness: 0.5 }));
      const porchStep = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.04, 0.16, 2, 0.01), porchStepMat);
      porchStep.position.set(0, 0.07, 0.48);

      // Chậu hoa terracotta xinh xắn bên thềm cửa
      const planterMat = LandmarkModels.getMat('bldgPlanterTerracotta', () => new THREE.MeshStandardMaterial({ color: '#D35400', roughness: 0.6 }));
      const flowerBlossomMat = LandmarkModels.getMat('bldgFlowerBlossom', () => new THREE.MeshStandardMaterial({
        color: '#FF7675',
        emissive: '#FF7675',
        emissiveIntensity: 0.28,
        roughness: 0.3
      }));
      const planter = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.045, 0.11, 8), planterMat);
      planter.position.set(0.26, 0.155, 0.42);
      const planterFlowers = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), flowerBlossomMat);
      planterFlowers.position.set(0.26, 0.25, 0.42);

      // Hàng rào hoa mini viền trắng phong cách Business Tour
      const fenceMat = LandmarkModels.getMat('bldgFenceWhite', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 }));
      const miniFence = new THREE.Mesh(new RoundedBoxGeometry(0.30, 0.12, 0.03, 2, 0.008), fenceMat);
      miniFence.position.set(-0.25, 0.14, 0.46);

      // Ống khói gạch nung đỏ nhô lên trên mái ngói (BoxGeometry)
      const chimneyMat = LandmarkModels.getMat('bldgChimneyRed', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.6 }));
      const chimney = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.42, 0.15, 2, 0.02), chimneyMat);
      chimney.position.set(0.22, 0.96, 0.16);

      // Gờ vành ống khói
      const chimneyCap = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.04, 0.18, 2, 0.01), plinthMat);
      chimneyCap.position.set(0.22, 1.18, 0.16);

      // Khói lam chiều nhè nhẹ wafting từ ống khói (3 cụm khói mờ ảo)
      const smokeMat = LandmarkModels.getMat('bldgSmokePuff', () => new THREE.MeshStandardMaterial({
        color: '#F5F6FA',
        transparent: true,
        opacity: 0.55,
        roughness: 0.8,
        depthWrite: false
      }));
      const smokeGroup = new THREE.Group();
      smokeGroup.position.set(0.22, 1.25, 0.16);
      smokeGroup.userData = { animType: 'flicker' };

      const puff1 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), smokeMat);
      puff1.position.set(0, 0, 0);
      const puff2 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), smokeMat);
      puff2.position.set(0.02, 0.10, 0.01);
      const puff3 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), smokeMat);
      puff3.position.set(-0.01, 0.22, 0.03);
      smokeGroup.add(puff1, puff2, puff3);

      modelSubGroup.add(plinth, base, roofEaves, roof, win, winMullionH, winMullionV, door, doorknob, porchStep, planter, planterFlowers, miniFence, chimney, chimneyCap, smokeGroup);

    } else if (level === 2) {
      // ==========================================
      // 🏰 Level 2: Biệt Thự Phố 2 Tầng Giật Cấp (Business Tour Townhouse / Twin Villa)
      // ==========================================
      const plinth = new THREE.Mesh(new RoundedBoxGeometry(1.26, 0.1, 0.98, 2, 0.02), plinthMat);
      plinth.position.y = 0.05;

      // Sân cỏ mini và hồ bơi tiểu cảnh bên mạn biệt thự
      const lawnMat = LandmarkModels.getMat('bldgLawnGreen', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.65 }));
      const lawn = new THREE.Mesh(new RoundedBoxGeometry(0.40, 0.03, 0.88, 2, 0.01), lawnMat);
      lawn.position.set(0.40, 0.11, 0);

      // Hồ bơi mini đá cẩm thạch xanh ngọc bích phát quang
      const poolMat = LandmarkMaterials.getPoolWaterMat();
      const poolCopingMat = LandmarkModels.getMat('bldgPoolMarbleCoping', () => new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.2 }));
      const poolCoping = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.04, 0.50, 2, 0.01), poolCopingMat);
      poolCoping.position.set(0.40, 0.12, 0.08);
      const poolWater = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.44), poolMat);
      poolWater.rotation.x = -Math.PI / 2;
      poolWater.position.set(0.40, 0.145, 0.08);

      // Ghế tắm nắng hồ bơi mini phong cách resort
      const sunLoungerMat = LandmarkModels.getMat('bldgSunLoungerWood', () => new THREE.MeshStandardMaterial({ color: '#E67E22', roughness: 0.4 }));
      const lounger = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.04, 0.22, 2, 0.008), sunLoungerMat);
      lounger.position.set(0.40, 0.14, -0.28);

      // Tầng 1 tường kem sữa trang nhã
      const f1 = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.48, 0.82, 4, 0.08), creamWallMat);
      f1.position.set(-0.16, 0.34, 0);
      f1.castShadow = true;

      // Mái hiên tầng 1 che nắng sảnh vào viền mạ vàng
      const canopyF1 = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.03, 0.18, 2, 0.01), goldMetalMat);
      canopyF1.position.set(-0.16, 0.52, 0.45);

      // Tầng 2 giật cấp tường vàng pastel ấm áp
      const f2Mat = LandmarkModels.getMat('bldgL2WallWarm', () => new THREE.MeshStandardMaterial({ color: '#FFEAA7', roughness: 0.35 }));
      const f2 = new THREE.Mesh(new RoundedBoxGeometry(0.70, 0.5, 0.70, 4, 0.08), f2Mat);
      f2.position.set(-0.16, 0.81, 0);
      f2.castShadow = true;

      // Cửa sổ đôi phát sáng ở tầng 1 và tầng 2
      const winL1 = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.22), winGlowMat);
      winL1.position.set(-0.34, 0.35, 0.415);
      const winR1 = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.22), winGlowMat);
      winR1.position.set(0.02, 0.35, 0.415);
      const winM2 = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.22), winGlowMat);
      winM2.position.set(-0.16, 0.85, 0.355);

      // Ban công hoa khoe sắc tầng 2 viền trắng
      const balconyMat = LandmarkModels.getMat('bldgBalconyWhite', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 }));
      const balcony = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.12, 0.20, 2, 0.02), balconyMat);
      balcony.position.set(-0.16, 0.59, 0.42);

      // Bồn hoa rực rỡ trên ban công khoe sắc thắm
      const flowerMat = LandmarkModels.getMat('bldgFlowerCoral', () => new THREE.MeshStandardMaterial({
        color: '#FF7675',
        emissive: '#FF7675',
        emissiveIntensity: 0.45
      }));
      const flowerWhiteMat = LandmarkModels.getMat('bldgFlowerWhite', () => new THREE.MeshStandardMaterial({
        color: '#FFFDF9',
        roughness: 0.3
      }));
      const flowers = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.08, 0.10), flowerMat);
      flowers.position.set(-0.16, 0.67, 0.42);
      const flowerDots = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), flowerWhiteMat);
      flowerDots.position.set(-0.16, 0.71, 0.42);

      // Mái hiên vát sang trọng dốc kép (ConeGeometry 4 cạnh, xoay 45 độ)
      const roofMat = LandmarkModels.getMat('bldgL2RoofCoral', () => new THREE.MeshStandardMaterial({
        color: '#E17055',
        roughness: 0.28,
        metalness: 0.08
      }));
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.66, 0.48, 4), roofMat);
      roof.position.set(-0.16, 1.28, 0);
      roof.rotation.y = Math.PI / 4;

      modelSubGroup.add(plinth, lawn, poolCoping, poolWater, lounger, f1, canopyF1, f2, winL1, winR1, winM2, balcony, flowers, flowerDots, roof);

    } else if (level === 3) {
      // ==========================================
      // 🏙️ Level 3: Dinh Thự Thượng Lưu 3 Tầng (Business Tour Grand Luxury Mansion)
      // ==========================================
      const plinth = new THREE.Mesh(new RoundedBoxGeometry(1.24, 0.08, 1.18, 2, 0.02), plinthMat);
      plinth.position.y = 0.04;

      // Sân vườn & hồ bơi chân mây mini bên mạn dinh thự
      const poolMat = LandmarkMaterials.getPoolWaterMat();
      const poolCopingMat = LandmarkModels.getMat('bldgPoolMarbleCoping', () => new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.2 }));
      const poolCoping = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.04, 0.62, 2, 0.01), poolCopingMat);
      poolCoping.position.set(0.40, 0.09, 0.08);
      const poolWater = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.56), poolMat);
      poolWater.rotation.x = -Math.PI / 2;
      poolWater.position.set(0.40, 0.115, 0.08);

      // Tầng 1: Đại sảnh vòm cẩm thạch trắng bo góc sang trọng
      const baseMat = LandmarkModels.getMat('bldgL3BaseMarble', () => new THREE.MeshStandardMaterial({
        color: '#F1F2F6',
        roughness: 0.22,
        metalness: 0.1
      }));
      const base = new THREE.Mesh(new RoundedBoxGeometry(0.86, 0.65, 0.96, 4, 0.08), baseMat);
      base.position.set(-0.14, 0.38, 0);
      base.castShadow = true;

      // Mái đón sảnh tầng 1 viền vàng hoàng gia
      const canopy = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.04, 0.22, 2, 0.01), goldMetalMat);
      canopy.position.set(-0.14, 0.58, 0.52);

      // Dải kính mặt tiền phát sáng hiện đại
      const strip1 = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.18), winGlowMat);
      strip1.position.set(-0.14, 0.38, 0.485);

      // Tầng 2: Khối phòng thượng lưu kính Cyan phản quang PBR sang trọng
      const towerMat = LandmarkModels.getMat('bldgL3TowerGlassCyan', () => new THREE.MeshStandardMaterial({
        color: '#00CEC9',
        roughness: 0.08,
        metalness: 0.82,
        emissive: '#0984E3',
        emissiveIntensity: 0.42
      }));
      const f2 = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.60, 0.82, 4, 0.06), towerMat);
      f2.position.set(-0.14, 0.98, 0);

      // Gân thép kiến trúc crom sáng bóng
      const mullionMat = LandmarkModels.getMat('bldgL3MullionChrome', () => new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        metalness: 0.95,
        roughness: 0.1
      }));
      [[-0.36, -0.41], [0.36, -0.41], [-0.36, 0.41], [0.36, 0.41]].forEach(([mx, mz]) => {
        const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.60, 0.03), mullionMat);
        mullion.position.set(-0.14 + mx, 0.98, mz);
        modelSubGroup.add(mullion);
      });

      // Tầng 3: Sân thượng ngắm cảnh Penthouse giật cấp
      const f3 = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.48, 0.66, 4, 0.05), baseMat);
      f3.position.set(-0.14, 1.48, 0);

      const f3Glass = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.22), winGlowMat);
      f3Glass.position.set(-0.14, 1.48, 0.335);

      // Vành đai LED chiếu sáng đỉnh tháp
      const crownRimMat = LandmarkModels.getMat('bldgL3CrownNeon', () => new THREE.MeshStandardMaterial({
        color: '#81ECEC',
        emissive: '#00CEC9',
        emissiveIntensity: 1.2
      }));
      const crownRim = new THREE.Mesh(new RoundedBoxGeometry(0.60, 0.05, 0.70, 2, 0.01), crownRimMat);
      crownRim.position.set(-0.14, 1.74, 0);

      // Ăng-ten thu phát viễn thông mạ vàng vút cao (CylinderGeometry)
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.048, 0.70, 8), goldMetalMat);
      antenna.position.set(-0.14, 2.12, 0);

      // Đèn cảnh báo hàng không đỏ nhấp nháy trên đỉnh tháp (SphereGeometry)
      const orbMat = LandmarkModels.getMat('bldgL3BeaconRed', () => new THREE.MeshStandardMaterial({
        color: '#FF4757',
        emissive: '#FF4757',
        emissiveIntensity: 1.5
      }));
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), orbMat);
      orb.position.set(-0.14, 2.50, 0);
      orb.userData = { animType: 'pulse_red' };

      modelSubGroup.add(plinth, poolCoping, poolWater, base, canopy, strip1, f2, f3, f3Glass, crownRim, antenna, orb);

    } else if (level === 4) {
      // ==========================================
      // 💎 Level 4: Khách Sạn Hoàng Gia 5 Sao (Business Tour 5-Star Royal Palace & Hotel)
      // ==========================================
      // Khối đế giật cấp 1: Kính sapphire ngọc bích sang trọng
      const tier1Mat = LandmarkMaterials.getSapphireGlassMat();
      const tier1 = new THREE.Mesh(new RoundedBoxGeometry(1.22, 1.25, 1.22, 4, 0.12), tier1Mat);
      tier1.position.y = 0.63;
      tier1.castShadow = true;

      // Khối tháp giật cấp 2
      const tier2 = new THREE.Mesh(new RoundedBoxGeometry(0.96, 1.05, 0.96, 4, 0.08), tier1Mat);
      tier2.position.y = 1.72;
      tier2.castShadow = true;

      // Khối tháp giật cấp 3
      const tier3 = new THREE.Mesh(new RoundedBoxGeometry(0.70, 0.85, 0.70, 4, 0.06), tier1Mat);
      tier3.position.y = 2.62;

      // Gân chỉ mạ vàng hoàng gia Art Deco dọc mặt tiền khách sạn
      const ribL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.2, 0.05), goldMetalMat);
      ribL.position.set(-0.28, 1.15, 0.60);
      const ribR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.2, 0.05), goldMetalMat);
      ribR.position.set(0.28, 1.15, 0.60);

      // Thảm đỏ nhung hoàng gia đón khách quý VIP
      const carpetMat = LandmarkMaterials.getRedCarpetMat();
      const carpet = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.68), carpetMat);
      carpet.rotation.x = -Math.PI / 2;
      carpet.position.set(0, 0.015, 0.72);

      // Cột chặn mạ vàng nối dây nhung hai bên thảm đỏ VIP
      const stanchionGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.14, 8);
      [-0.25, 0.25].forEach(sx => {
        const stanchion = new THREE.Mesh(stanchionGeo, goldMetalMat);
        stanchion.position.set(sx, 0.08, 0.72);
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), goldMetalMat);
        ball.position.set(sx, 0.16, 0.72);
        modelSubGroup.add(stanchion, ball);
      });

      // Mái sảnh đón vòm kính dát vàng
      const canopy = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.06, 0.38, 2, 0.02), goldMetalMat);
      canopy.position.set(0, 0.48, 0.68);

      // Biển hiệu đèn neon chữ nổi sang trọng "★ HOTEL ★" phong cách Business Tour
      const signMat = LandmarkModels.getMat('bldgL4HotelSign', () => new THREE.MeshStandardMaterial({
        color: '#FFEAA7',
        emissive: '#FDCB6E',
        emissiveIntensity: 1.1,
        roughness: 0.2
      }));
      const hotelSign = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.10, 0.04, 2, 0.01), signMat);
      hotelSign.position.set(0, 0.62, 0.65);

      // Sân đỗ trực thăng Helipad với vòng đèn tín hiệu xoay tròn trên sân thượng tầng 1
      const heliPadMat = LandmarkModels.getMat('bldgL4Helipad', () => new THREE.MeshStandardMaterial({
        color: '#2D3436',
        roughness: 0.45,
        metalness: 0.2
      }));
      const heliPad = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.02, 16), heliPadMat);
      heliPad.position.set(0.40, 1.26, 0.40);

      const hSignMat = LandmarkModels.getMat('bldgL4HeliSign', () => new THREE.MeshBasicMaterial({ color: '#FFEAA7' }));
      const hSign = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), hSignMat);
      hSign.rotation.x = -Math.PI / 2;
      hSign.position.set(0.40, 1.28, 0.40);

      // Vòng đèn tín hiệu Helipad xoay tròn phát sáng
      const heliLightsGroup = new THREE.Group();
      heliLightsGroup.position.set(0.40, 1.275, 0.40);
      heliLightsGroup.userData = { animType: 'spin_y' };
      const beaconLightMat = LandmarkModels.getMat('bldgL4HeliLightDot', () => new THREE.MeshStandardMaterial({
        color: '#00CEC9',
        emissive: '#00CEC9',
        emissiveIntensity: 1.2
      }));
      for (let hl = 0; hl < 6; hl++) {
        const ang = (hl / 6) * Math.PI * 2;
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), beaconLightMat);
        dot.position.set(Math.cos(ang) * 0.23, 0.005, Math.sin(ang) * 0.23);
        heliLightsGroup.add(dot);
      }

      // Cột chóp vương miện mạ vàng hoàng gia Art Deco (ConeGeometry)
      const crownMat = LandmarkMaterials.getGoldMetalMat();
      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.50, 0.88, 8), crownMat);
      crown.position.y = 3.44;

      // Quả cầu pha lê vàng ngọc thạch phát quang rực rỡ trên đỉnh tháp (SphereGeometry)
      const orbMat = LandmarkModels.getMat('bldgL4SpireOrb', () => new THREE.MeshStandardMaterial({
        color: '#FFF275',
        emissive: '#FFF275',
        emissiveIntensity: 1.4,
        roughness: 0.06
      }));
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 20), orbMat);
      orb.position.y = 3.98;

      this.animatedSpireLandmarks.push(orb);
      modelSubGroup.add(tier1, tier2, tier3, ribL, ribR, carpet, canopy, hotelSign, heliPad, hSign, heliLightsGroup, crown, orb);
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
