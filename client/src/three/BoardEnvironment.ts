import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { TextureGenerator } from './TextureGenerator';
import { DetailedModels } from './DetailedModels';
import { LandmarkModels } from './LandmarkModels';

/**
 * Quản lý bối cảnh môi trường 3D studio, bệ bàn cờ, phụ kiện bàn gỗ,
 * đầm phá nước nhiệt đới chuyển động (Animated Water Shader),
 * vòm trời chân trời hoàng kim và vi khí quyển công viên trung tâm.
 */
export class BoardEnvironment {
  private scene: THREE.Scene;

  // Scene root sub-groups
  private environmentGroup = new THREE.Group();
  private plinthGroup = new THREE.Group();
  private lampsGroup = new THREE.Group();
  private centerGroup = new THREE.Group();
  private islandWaterGroup = new THREE.Group();

  // Center Park Diorama Anim Objects
  public fountainRipples: THREE.Mesh | null = null;
  public fountainWaterfalls: THREE.Mesh[] = [];
  public fountainWaterJets: THREE.Mesh[] = [];
  public fountainSpray: THREE.Points | null = null;
  public fountainGemOrb: THREE.Mesh | null = null;
  public miniTaxi: THREE.Group | null = null;
  public miniBus: THREE.Group | null = null;
  public taxiAngle = 0;
  public parkTrees: THREE.Group[] = [];

  // Tabletop Studio & Atmospheric Particles
  public ambientDustMotes: THREE.Points | null = null;
  public parkFireflies: THREE.Points | null = null;
  private fireflyBasePos: Float32Array | null = null;
  private fireflyPhases: Float32Array | null = null;
  public volumetricHazeGroup: THREE.Group | null = null;

  // Next-Gen Animated Water Shader & Island Horizon
  public waterShaderMesh: THREE.Mesh | null = null;
  public waterMaterial: THREE.ShaderMaterial | null = null;
  public skyDome: THREE.Mesh | null = null;

  // Disposables tracker for zero memory leak
  private disposables = {
    geometries: new Set<THREE.BufferGeometry>(),
    materials: new Set<THREE.Material>(),
    textures: new Set<THREE.Texture>()
  };

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.scene.add(this.environmentGroup);
    this.scene.add(this.plinthGroup);
    this.scene.add(this.lampsGroup);
    this.scene.add(this.centerGroup);
    this.scene.add(this.islandWaterGroup);

    this.setupStudioEnvironment();
    this.setupBoardPlinth();
    this.setupStreetLamps();
    this.setupCenterDiorama();
    this.setupIslandWaterAndHorizon();
    this.setupAtmosphericParticles();
  }

  private trackGeometry<T extends THREE.BufferGeometry>(geo: T): T {
    this.disposables.geometries.add(geo);
    return geo;
  }

  private trackMaterial<T extends THREE.Material>(mat: T): T {
    this.disposables.materials.add(mat);
    return mat;
  }

  private trackTexture<T extends THREE.Texture>(tex: T): T {
    this.disposables.textures.add(tex);
    return tex;
  }

  // 1. Natural Studio Environment: Warm Oak Wood Table & Window Sunbeam
  private setupStudioEnvironment() {
    // Tabletop with Natural Wood Grain Texture
    const woodTexture = this.trackTexture(TextureGenerator.createWoodPlankTexture());
    const tableGeo = this.trackGeometry(new THREE.BoxGeometry(110, 2, 110));
    const tableMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        map: woodTexture,
        roughness: 0.45,
        metalness: 0.05,
        color: '#F4ECE1'
      })
    );
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -1.6;
    table.receiveShadow = true;
    this.environmentGroup.add(table);

    // Slate Blue Felt Playmat under the board
    const matGeo = this.trackGeometry(new THREE.BoxGeometry(32.5, 0.05, 32.5));
    const matMat = this.trackMaterial(new THREE.MeshStandardMaterial({ color: '#3A4B5E', roughness: 0.7 }));
    const feltMat = new THREE.Mesh(matGeo, matMat);
    feltMat.position.y = -0.58;
    feltMat.receiveShadow = true;
    this.environmentGroup.add(feltMat);

    // Gold Stitching border around mat
    const stitchGeo = this.trackGeometry(new THREE.BoxGeometry(32.9, 0.04, 32.9));
    const stitchMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({ color: '#FDCB6E', metalness: 0.8, roughness: 0.2 })
    );
    const stitch = new THREE.Mesh(stitchGeo, stitchMat);
    stitch.position.y = -0.59;
    this.environmentGroup.add(stitch);

    // Window Light Shaft (Sunbeam cutting across the room)
    const sunbeamGeo = this.trackGeometry(new THREE.PlaneGeometry(35, 70));
    const sunbeamTex = this.trackTexture(TextureGenerator.createSunbeamTexture());
    const sunbeamMat = this.trackMaterial(
      new THREE.MeshBasicMaterial({
        map: sunbeamTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      })
    );
    const sunbeam = new THREE.Mesh(sunbeamGeo, sunbeamMat);
    sunbeam.position.set(10, 15, -10);
    sunbeam.rotation.x = Math.PI / 3;
    sunbeam.rotation.y = -Math.PI / 6;
    this.environmentGroup.add(sunbeam);

    // Floating Ambient Dust Motes in warm sunlight
    const moteGeo = this.trackGeometry(new THREE.BufferGeometry());
    const moteCount = 130;
    const motePositions = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      motePositions[i * 3] = (Math.random() - 0.5) * 50;
      motePositions[i * 3 + 1] = 1 + Math.random() * 22;
      motePositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
    const moteTex = this.trackTexture(TextureGenerator.createParticleTexture());
    const moteMat = this.trackMaterial(
      new THREE.PointsMaterial({
        size: 0.25,
        map: moteTex,
        color: '#FFEAA7',
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    this.ambientDustMotes = new THREE.Points(moteGeo, moteMat);
    this.environmentGroup.add(this.ambientDustMotes);
  }

  // 2. Beveled Board Plinth & Drop Shadow
  private setupBoardPlinth() {
    // Dark Walnut Wood Platform bề thế ôm trọn bàn cờ 24x24
    const baseGeo = this.trackGeometry(new RoundedBoxGeometry(26.2, 0.75, 26.2, 4, 0.16));
    const baseMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: '#1E272E',
        roughness: 0.38,
        metalness: 0.12
      })
    );
    const plinth = new THREE.Mesh(baseGeo, baseMat);
    plinth.position.y = -0.38;
    plinth.receiveShadow = true;
    this.plinthGroup.add(plinth);

    // Gold Trim Inlay bao quanh 4 mép bàn cờ
    const trimGeo = this.trackGeometry(new THREE.BoxGeometry(26.5, 0.1, 26.5));
    const trimMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: '#F1C40F',
        emissive: '#F39C12',
        emissiveIntensity: 0.32,
        metalness: 0.88,
        roughness: 0.16
      })
    );
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.y = -0.02;
    this.plinthGroup.add(trim);

    // Soft drop shadow siêu thực tỏa ra mặt bàn gỗ
    const shadowGeo = this.trackGeometry(new THREE.PlaneGeometry(33, 33));
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(128, 128, 60, 128, 128, 128);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.52)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.22)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const shadowTex = this.trackTexture(new THREE.CanvasTexture(canvas));
    const shadowMat = this.trackMaterial(
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false
      })
    );
    const groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.y = -0.74;
    this.plinthGroup.add(groundShadow);
  }

  // 3. Four Miniature Street Lamp Posts on Board Corners (Victorian Lantern Posts)
  private setupStreetLamps() {
    const lampPositions = [
      [11.5, 11.5, -Math.PI / 4],
      [-11.5, 11.5, Math.PI / 4],
      [-11.5, -11.5, (3 * Math.PI) / 4],
      [11.5, -11.5, -(3 * Math.PI) / 4]
    ];

    lampPositions.forEach(([lx, lz, rot]) => {
      const lamp = DetailedModels.createStreetLamp();
      lamp.position.set(lx, 0.3, lz);
      lamp.rotation.y = rot;
      this.lampsGroup.add(lamp);
    });
  }

  // 4. Center Park Diorama: Đài Phun Nước Đẳng Cấp, Cây Đa Tầng & Xe Taxi
  private setupCenterDiorama() {
    // 1. Đại Lộ Nhựa Đường Đô Thị (Asphalt City Avenue) bao quanh giữa công viên và 40 ô cờ
    const avenueGeo = this.trackGeometry(new THREE.RingGeometry(5.8, 8.75, 48));
    const avenueMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: '#2F3542',
        roughness: 0.72,
        metalness: 0.1,
        side: THREE.DoubleSide
      })
    );
    const avenue = new THREE.Mesh(avenueGeo, avenueMat);
    avenue.rotation.x = -Math.PI / 2;
    avenue.position.y = 0.16;
    avenue.receiveShadow = true;
    this.centerGroup.add(avenue);

    // Vạch kẻ tim đường vàng đứt khúc (Yellow Dashed Centerline)
    const dashLineMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: '#E0A922',
        emissive: '#E0A922',
        emissiveIntensity: 0.12,
        side: THREE.DoubleSide
      })
    );
    const dashCount = 28;
    for (let d = 0; d < dashCount; d++) {
      if (d % 2 === 0) {
        const theta1 = (d / dashCount) * Math.PI * 2;
        const theta2 = ((d + 0.65) / dashCount) * Math.PI * 2;
        const dashGeo = this.trackGeometry(new THREE.RingGeometry(7.22, 7.38, 4, 1, theta1, theta2 - theta1));
        const dashMesh = new THREE.Mesh(dashGeo, dashLineMat);
        dashMesh.rotation.x = -Math.PI / 2;
        dashMesh.position.y = 0.165;
        this.centerGroup.add(dashMesh);
      }
    }

    // 4 Vạch Kẻ Sang Đường Cho Người Đi Bộ (Zebra Crossings) tại 4 góc tiếp giáp ô góc
    const zebraWhite = this.trackMaterial(
      new THREE.MeshStandardMaterial({ color: '#E8EDF2', roughness: 0.5, side: THREE.DoubleSide })
    );
    const crossAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    crossAngles.forEach(ca => {
      const zebraGroup = new THREE.Group();
      zebraGroup.position.set(Math.cos(ca) * 7.3, 0.168, Math.sin(ca) * 7.3);
      zebraGroup.rotation.y = -ca;
      for (let z = -0.45; z <= 0.45; z += 0.18) {
        const stripeGeo = this.trackGeometry(new THREE.PlaneGeometry(0.1, 1.45));
        const stripe = new THREE.Mesh(stripeGeo, zebraWhite);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(z, 0, 0);
        zebraGroup.add(stripe);
      }
      this.centerGroup.add(zebraGroup);
    });

    // 2. Park Grass Base với gờ viền mềm (Pastel Sage Green tao nhã, dịu mắt)
    const parkGeo = this.trackGeometry(new THREE.CylinderGeometry(5.4, 5.7, 0.3, 36));
    const parkMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({ color: '#7EA285', roughness: 0.75, metalness: 0.02 })
    );
    const park = new THREE.Mesh(parkGeo, parkMat);
    park.position.y = 0.15;
    park.receiveShadow = true;
    this.centerGroup.add(park);

    // Lối đi dạo quanh công viên lát sỏi tự nhiên (Soft Muted Limestone)
    const pathGeo = this.trackGeometry(new THREE.RingGeometry(3.3, 4.2, 36));
    const pathMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({ color: '#DDD7CE', roughness: 0.8, metalness: 0.04, side: THREE.DoubleSide })
    );
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.y = 0.31;
    this.centerGroup.add(path);

    // Ghế Băng Công Viên Cổ Điển London bằng Gỗ Sồi & Chân Sắt Uốn
    for (let b = 0; b < 4; b++) {
      const angle = (b / 4) * Math.PI * 2 + Math.PI / 4;
      const bench = DetailedModels.createParkBench();
      bench.scale.set(0.85, 0.85, 0.85);
      bench.position.set(Math.cos(angle) * 3.75, 0.32, Math.sin(angle) * 3.75);
      bench.rotation.y = -angle + Math.PI / 2;
      this.centerGroup.add(bench);
    }

    // 4 Cột Đèn Đường Cổ Điển Dọc Lối Đi Dạo Công Viên
    for (let l = 0; l < 4; l++) {
      const lAngle = (l / 4) * Math.PI * 2;
      const pLamp = DetailedModels.createStreetLamp();
      pLamp.scale.set(0.65, 0.65, 0.65);
      pLamp.position.set(Math.cos(lAngle) * 4.4, 0.32, Math.sin(lAngle) * 4.4);
      pLamp.rotation.y = -lAngle - Math.PI / 2;
      this.centerGroup.add(pLamp);
    }

    // 🚕 Xe Taxi Vàng Mini Chạy Trên Đại Lộ Đô Thị
    this.miniTaxi = new THREE.Group();
    this.miniTaxi.add(LandmarkModels.createContactShadow(0.85, 0.52, 0.5));

    const taxiBodyGeo = this.trackGeometry(new RoundedBoxGeometry(0.66, 0.26, 0.38, 3, 0.05));
    const taxiBodyMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({ color: '#F1C40F', roughness: 0.25, metalness: 0.1 })
    );
    const taxiBody = new THREE.Mesh(taxiBodyGeo, taxiBodyMat);
    taxiBody.position.y = 0.2;
    taxiBody.castShadow = true;

    const taxiCabinGeo = this.trackGeometry(new RoundedBoxGeometry(0.38, 0.2, 0.32, 2, 0.04));
    const taxiCabinMat = this.trackMaterial(new THREE.MeshStandardMaterial({ color: '#2D3436', roughness: 0.2 }));
    const taxiCabin = new THREE.Mesh(taxiCabinGeo, taxiCabinMat);
    taxiCabin.position.set(-0.04, 0.38, 0);

    const taxiSignGeo = this.trackGeometry(new THREE.BoxGeometry(0.12, 0.07, 0.16));
    const taxiSignMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({ color: '#FFFFFF', emissive: '#F1C40F', emissiveIntensity: 0.35 })
    );
    const taxiSign = new THREE.Mesh(taxiSignGeo, taxiSignMat);
    taxiSign.position.set(-0.04, 0.52, 0);

    // Bánh xe cao su & mâm mạ bạc
    const wheelMat = this.trackMaterial(new THREE.MeshStandardMaterial({ color: '#1E272E', roughness: 0.6 }));
    const hubMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({ color: '#DFE6E9', metalness: 0.85, roughness: 0.15 })
    );
    const wheelGeo = this.trackGeometry(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12));
    wheelGeo.rotateX(Math.PI / 2);
    const hubGeo = this.trackGeometry(new THREE.CylinderGeometry(0.04, 0.04, 0.062, 10));
    hubGeo.rotateX(Math.PI / 2);

    const makeWheel = (wx: number, wz: number) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      const h = new THREE.Mesh(hubGeo, hubMat);
      w.position.set(wx, 0.08, wz);
      h.position.set(wx, 0.08, wz);
      this.miniTaxi!.add(w, h);
    };
    makeWheel(0.2, 0.2);
    makeWheel(0.2, -0.2);
    makeWheel(-0.2, 0.2);
    makeWheel(-0.2, -0.2);

    // Đèn pha trước vàng dịu nhẹ
    const headLightMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: '#FFEAA7',
        emissive: '#FFEAA7',
        emissiveIntensity: 0.45
      })
    );
    const headLightGeo = this.trackGeometry(new THREE.BoxGeometry(0.02, 0.06, 0.08));
    const hl1 = new THREE.Mesh(headLightGeo, headLightMat);
    hl1.position.set(0.33, 0.18, 0.12);
    const hl2 = new THREE.Mesh(headLightGeo, headLightMat);
    hl2.position.set(0.33, 0.18, -0.12);

    // Đèn hậu đỏ ruby tinh tế
    const tailLightMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: '#D63031',
        emissive: '#D63031',
        emissiveIntensity: 0.35
      })
    );
    const tl1 = new THREE.Mesh(headLightGeo, tailLightMat);
    tl1.position.set(-0.33, 0.18, 0.12);
    const tl2 = new THREE.Mesh(headLightGeo, tailLightMat);
    tl2.position.set(-0.33, 0.18, -0.12);

    this.miniTaxi.add(taxiBody, taxiCabin, taxiSign, hl1, hl2, tl1, tl2);
    this.miniTaxi.position.set(7.35, 0.15, 0);
    this.centerGroup.add(this.miniTaxi);

    // 🚌 Xe Buýt Mini Xanh Ngọc (Mint City Transit) chạy làn đối diện
    this.miniBus = new THREE.Group();
    this.miniBus.add(LandmarkModels.createContactShadow(1.1, 0.56, 0.5));

    const busBodyMat = this.trackMaterial(new THREE.MeshStandardMaterial({ color: '#00CEC9', roughness: 0.28 }));
    const busBodyGeo = this.trackGeometry(new RoundedBoxGeometry(0.92, 0.38, 0.42, 3, 0.06));
    const busBody = new THREE.Mesh(busBodyGeo, busBodyMat);
    busBody.position.y = 0.28;
    busBody.castShadow = true;

    // Nóc xe trắng tinh khôi bo tròn
    const busRoofMat = this.trackMaterial(new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.22 }));
    const busRoofGeo = this.trackGeometry(new RoundedBoxGeometry(0.9, 0.08, 0.4, 2, 0.04));
    const busRoof = new THREE.Mesh(busRoofGeo, busRoofMat);
    busRoof.position.y = 0.49;

    // Dải cửa sổ kính đen sang trọng
    const busWindowMat = this.trackMaterial(new THREE.MeshStandardMaterial({ color: '#1E272E', roughness: 0.15 }));
    const busWindowGeo = this.trackGeometry(new THREE.BoxGeometry(0.78, 0.14, 0.43));
    const busWindows = new THREE.Mesh(busWindowGeo, busWindowMat);
    busWindows.position.y = 0.35;

    // Đèn pha trước & đèn hậu xe buýt
    const bhl1 = new THREE.Mesh(headLightGeo, headLightMat);
    bhl1.position.set(0.46, 0.2, 0.14);
    const bhl2 = new THREE.Mesh(headLightGeo, headLightMat);
    bhl2.position.set(0.46, 0.2, -0.14);
    const btl1 = new THREE.Mesh(headLightGeo, tailLightMat);
    btl1.position.set(-0.46, 0.2, 0.14);
    const btl2 = new THREE.Mesh(headLightGeo, tailLightMat);
    btl2.position.set(-0.46, 0.2, -0.14);

    const makeBusWheel = (wx: number, wz: number) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      const h = new THREE.Mesh(hubGeo, hubMat);
      w.position.set(wx, 0.08, wz);
      h.position.set(wx, 0.08, wz);
      this.miniBus!.add(w, h);
    };
    makeBusWheel(0.3, 0.22);
    makeBusWheel(0.3, -0.22);
    makeBusWheel(-0.3, 0.22);
    makeBusWheel(-0.3, -0.22);

    this.miniBus.add(busBody, busRoof, busWindows, bhl1, bhl2, btl1, btl2);
    this.miniBus.position.set(-7.35, 0.15, 0);
    this.centerGroup.add(this.miniBus);

    // ⛲ Đài Phun Nước Hoàng Gia Bát Giác 3 Tầng với 8 Vòi Sư Tử & Màng Nước Rơi
    const fountainData = DetailedModels.createDetailedFountain();
    this.fountainRipples = fountainData.waterRipples;
    this.fountainWaterfalls = fountainData.waterFalls;
    this.fountainWaterJets = fountainData.waterJets;
    this.fountainGemOrb = fountainData.gemOrb || null;
    this.centerGroup.add(fountainData.group);

    // Các Bụi Hoa Cẩm Tú Cầu Viền Quanh Chân Bể Bát Giác (nằm trong lòng lối đi dạo)
    const flowerColors = ['#FF7675', '#FD79A8', '#FDCB6E', '#A29BFE'];
    for (let f = 0; f < 8; f++) {
      const fAngle = (f / 8) * Math.PI * 2 + 0.2;
      const bush = DetailedModels.createFlowerBush(flowerColors[f % flowerColors.length]);
      bush.position.set(Math.cos(fAngle) * 3.02, 0.3, Math.sin(fAngle) * 3.02);
      this.centerGroup.add(bush);
    }

    // Hạt Nước Li Ti Sủi Bọt & Sương Mù Trên Đỉnh Cột Geyser
    const sprayCount = 48;
    const sprayGeo = this.trackGeometry(new THREE.BufferGeometry());
    const sprayPositions = new Float32Array(sprayCount * 3);
    for (let i = 0; i < sprayCount; i++) {
      const sAngle = (i / sprayCount) * Math.PI * 2 + Math.random() * 0.5;
      const sDist = Math.random() * 0.45;
      sprayPositions[i * 3] = Math.cos(sAngle) * sDist;
      sprayPositions[i * 3 + 1] = 3.3 + Math.random() * 0.9;
      sprayPositions[i * 3 + 2] = Math.sin(sAngle) * sDist;
    }
    sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPositions, 3));
    const sprayMat = this.trackMaterial(
      new THREE.PointsMaterial({
        size: 0.22,
        color: '#A0E7E5',
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      })
    );
    this.fountainSpray = new THREE.Points(sprayGeo, sprayMat);
    this.centerGroup.add(this.fountainSpray);

    // 🌳 4 CÂY CÔNG VIÊN CAO CẤP ĐA TẦNG LÁ MÂY BỒNG BỀNH
    const treePositions = [
      [-6, -4.5], [-5.5, 5], [5.5, -5.5], [6, 4.5]
    ];
    this.parkTrees = [];
    treePositions.forEach(([tx, tz]) => {
      const tree = DetailedModels.createStylizedTree();
      tree.position.set(tx, 0.3, tz);
      this.parkTrees.push(tree);
      this.centerGroup.add(tree);
    });
  }

  // 5. Next-Gen Animated Water Shader & Island Horizon
  private setupIslandWaterAndHorizon() {
    // 5.1 Đáy biển chuyển sắc nhiệt đới (Lush Tropical Lagoon Bed)
    const lagoonBedGeo = this.trackGeometry(new THREE.RingGeometry(13.2, 48.0, 64));
    const lagoonTex = this.trackTexture(TextureGenerator.createTropicalLagoonTexture());
    const lagoonBedMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        map: lagoonTex,
        roughness: 0.6,
        metalness: 0.05,
        side: THREE.DoubleSide
      })
    );
    const lagoonBed = new THREE.Mesh(lagoonBedGeo, lagoonBedMat);
    lagoonBed.rotation.x = -Math.PI / 2;
    lagoonBed.position.y = -0.74;
    lagoonBed.receiveShadow = true;
    this.islandWaterGroup.add(lagoonBed);

    // 5.2 Bờ cát ngọc bao quanh bệ bàn cờ (Beveled Coral Sand Rim)
    const sandRimGeo = this.trackGeometry(new THREE.RingGeometry(13.0, 14.5, 64));
    const sandRimMat = this.trackMaterial(
      new THREE.MeshStandardMaterial({
        color: '#F5E6CA',
        roughness: 0.85,
        metalness: 0.02,
        side: THREE.DoubleSide
      })
    );
    const sandRim = new THREE.Mesh(sandRimGeo, sandRimMat);
    sandRim.rotation.x = -Math.PI / 2;
    sandRim.position.y = -0.69;
    sandRim.receiveShadow = true;
    this.islandWaterGroup.add(sandRim);

    // 5.3 Next-Gen Animated Water Shader Mesh với sóng biển và lấp lánh ánh kim
    const waterGeo = this.trackGeometry(new THREE.RingGeometry(13.4, 47.5, 64, 24));

    // Custom GLSL Water Shader với Gerstner/Sine ripple displacement & Specular Sparkles
    const vertexShader = `
      uniform float uTime;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      varying float vWaveElevation;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Sóng lăn tăn đa tần số và gợn sóng đồng tâm lan tỏa từ hòn đảo bàn cờ
        float dist = length(pos.xy);
        float w1 = sin(pos.x * 0.35 + uTime * 1.6) * cos(pos.y * 0.35 + uTime * 1.3) * 0.11;
        float w2 = sin((pos.x - pos.y) * 0.7 + uTime * 2.1) * 0.05;
        float w3 = cos(dist * 0.6 - uTime * 1.8) * 0.04;

        float elevation = w1 + w2 + w3;
        pos.z += elevation; // RingGeometry nằm trên mặt phẳng XY trước khi rotateX
        vWaveElevation = elevation;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;

        // Đạo hàm xấp xỉ pháp tuyến bề mặt sóng
        float dEx = (cos(pos.x * 0.35 + uTime * 1.6) * 0.35 * cos(pos.y * 0.35 + uTime * 1.3) * 0.11)
                  + (cos((pos.x - pos.y) * 0.7 + uTime * 2.1) * 0.7 * 0.05);
        float dEy = (-sin(pos.x * 0.35 + uTime * 1.6) * sin(pos.y * 0.35 + uTime * 1.3) * 0.35 * 0.11)
                  - (cos((pos.x - pos.y) * 0.7 + uTime * 2.1) * 0.7 * 0.05);

        vec3 norm = normalize(vec3(-dEx, -dEy, 1.0));
        vNormal = normalize(mat3(modelMatrix) * norm);

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec3 uSunDirection;
      uniform vec3 uSunColor;
      uniform vec3 uDepthColor;
      uniform vec3 uSurfaceColor;
      uniform vec3 uFoamColor;
      uniform vec3 uCameraPosition;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      varying float vWaveElevation;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
        vec3 normal = normalize(vNormal);

        // Hiệu ứng góc nhìn Fresnel
        float fresnel = pow(1.0 - max(0.0, dot(viewDir, normal)), 3.2);

        // Phản chiếu ánh sáng mặt trời Blinn-Phong Specular
        vec3 halfVector = normalize(uSunDirection + viewDir);
        float NdotH = max(0.0, dot(normal, halfVector));
        float specular = pow(NdotH, 64.0) * 1.8;

        // Vết sáng kim cương lấp lánh tự nhiên dịu nhẹ (Subtle Diamond Specular Sparkles)
        vec2 sparkleCoord = floor(vWorldPosition.xz * 5.5);
        float sparkleNoise = hash(sparkleCoord + sin(uTime * 2.8));
        float sparkle = pow(sparkleNoise, 16.0) * pow(NdotH, 22.0) * 1.5;

        // Pha trộn màu nước: Đáy sâu Sapphire -> Nước nông ngọc bích nhiệt đới
        float depthMix = smoothstep(-0.18, 0.18, vWaveElevation);
        vec3 waterColor = mix(uDepthColor, uSurfaceColor, depthMix);

        // Bọt sóng trắng viền ngọn sóng
        float foamFactor = smoothstep(0.09, 0.18, vWaveElevation);
        vec3 finalColor = mix(waterColor, uFoamColor, foamFactor * 0.45);

        // Phản chiếu bầu trời xanh
        vec3 skyReflect = vec3(0.85, 0.94, 1.0);
        finalColor = mix(finalColor, skyReflect, fresnel * 0.42);

        // Tích hợp ánh sáng phản quang & hạt lấp lánh
        finalColor += (specular + sparkle) * uSunColor;

        float alpha = clamp(0.86 + fresnel * 0.14, 0.0, 1.0);
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    this.waterMaterial = this.trackMaterial(
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uSunDirection: { value: new THREE.Vector3(0.55, 0.78, 0.42).normalize() },
          uSunColor: { value: new THREE.Color('#FFF6E5') },
          uDepthColor: { value: new THREE.Color('#0A3D62') },
          uSurfaceColor: { value: new THREE.Color('#00CEC9') },
          uFoamColor: { value: new THREE.Color('#EBFBFF') },
          uCameraPosition: { value: new THREE.Vector3(0, 32, 36) }
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );

    this.waterShaderMesh = new THREE.Mesh(waterGeo, this.waterMaterial);
    this.waterShaderMesh.rotation.x = -Math.PI / 2;
    this.waterShaderMesh.position.y = -0.66;
    this.islandWaterGroup.add(this.waterShaderMesh);

    // 5.4 Vòm Trời Chân Trời Hoàng Kim (Warm Golden Celestial Horizon Sky Dome)
    const skyGeo = this.trackGeometry(new THREE.SphereGeometry(140, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52));
    const skyTex = this.trackTexture(TextureGenerator.createSkyGradientTexture());
    const skyMat = this.trackMaterial(
      new THREE.MeshBasicMaterial({
        map: skyTex,
        side: THREE.BackSide,
        depthWrite: false
      })
    );
    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.skyDome.position.y = -8;
    this.islandWaterGroup.add(this.skyDome);
  }

  // 6. Atmospheric Particles: Công Viên Đom Đóm / Bụi Nắng & Sương Mù Thể Tích
  private setupAtmosphericParticles() {
    // 6.1 Bụi Nắng Vàng & Đom Đóm Nhiệt Đới Công Viên Trung Tâm (Park Sun Motes & Fireflies)
    const fireflyCount = 85;
    const fireflyGeo = this.trackGeometry(new THREE.BufferGeometry());
    const positions = new Float32Array(fireflyCount * 3);
    const colors = new Float32Array(fireflyCount * 3);
    this.fireflyPhases = new Float32Array(fireflyCount);
    this.fireflyBasePos = new Float32Array(fireflyCount * 3);

    const colorSun = new THREE.Color('#FFF1C5');
    const colorEmerald = new THREE.Color('#A8E6CF');
    const colorGold = new THREE.Color('#F9E79F');

    for (let i = 0; i < fireflyCount; i++) {
      const rad = 0.5 + Math.random() * 4.6;
      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * rad;
      const y = 0.35 + Math.random() * 2.8;
      const z = Math.sin(theta) * rad;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      this.fireflyBasePos[i * 3] = x;
      this.fireflyBasePos[i * 3 + 1] = y;
      this.fireflyBasePos[i * 3 + 2] = z;

      this.fireflyPhases[i] = Math.random() * Math.PI * 2;

      // Màu pastel dịu nhẹ, không gây phân tâm
      const c = Math.random() > 0.4 ? (Math.random() > 0.5 ? colorSun : colorGold) : colorEmerald;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    fireflyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleTex = this.trackTexture(TextureGenerator.createParticleTexture());
    const fireflyMat = this.trackMaterial(
      new THREE.PointsMaterial({
        size: 0.22,
        map: particleTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    this.parkFireflies = new THREE.Points(fireflyGeo, fireflyMat);
    this.environmentGroup.add(this.parkFireflies);

    // 6.2 Sương mù thể tích diorama mềm mại (Soft Volumetric Diorama Haze)
    this.volumetricHazeGroup = new THREE.Group();
    const hazeTex = this.trackTexture(TextureGenerator.createVolumetricHazeTexture());
    const hazeMat = this.trackMaterial(
      new THREE.MeshBasicMaterial({
        map: hazeTex,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );

    const hazeRadii = [
      { r: 18, y: 0.38, rot: 0 },
      { r: 24, y: 0.82, rot: Math.PI / 4 },
      { r: 30, y: 1.45, rot: Math.PI / 6 }
    ];

    hazeRadii.forEach(({ r, y, rot }) => {
      const hazeGeo = this.trackGeometry(new THREE.PlaneGeometry(r * 2, r * 2));
      const hazeMesh = new THREE.Mesh(hazeGeo, hazeMat);
      hazeMesh.rotation.x = -Math.PI / 2;
      hazeMesh.rotation.z = rot;
      hazeMesh.position.y = y;
      this.volumetricHazeGroup!.add(hazeMesh);
    });

    this.environmentGroup.add(this.volumetricHazeGroup);
  }

  /**
   * Chế độ Tinh Gọn / Sa Bàn (Clean Focus Mode):
   * Khi bật (true), ẩn các phương tiện giao thông, đom đóm, sương mù và tia nước phụ,
   * giúp mắt người chơi tập trung 100% vào các ô đất và quân cờ chiến thuật.
   */
  public setFocusMode(enabled: boolean) {
    if (this.miniTaxi) this.miniTaxi.visible = !enabled;
    if (this.miniBus) this.miniBus.visible = !enabled;
    if (this.parkFireflies) this.parkFireflies.visible = !enabled;
    if (this.volumetricHazeGroup) this.volumetricHazeGroup.visible = !enabled;
    if (this.fountainSpray) this.fountainSpray.visible = !enabled;
  }

  public setDioramaVisibility(visible: boolean) {
    this.setFocusMode(!visible);
  }

  public setSunDirection(dir: THREE.Vector3) {
    if (this.waterMaterial) {
      this.waterMaterial.uniforms.uSunDirection.value.copy(dir).normalize();
    }
  }

  public update(delta: number, elapsedTime: number, camera?: THREE.Camera) {
    // 1. Cập nhật Water Shader Uniforms (Thời gian thực & vị trí Camera)
    if (this.waterMaterial) {
      this.waterMaterial.uniforms.uTime.value = elapsedTime;
      if (camera) {
        this.waterMaterial.uniforms.uCameraPosition.value.copy(camera.position);
      }
    }

    // 2. Gợn sóng lăn tăn xoay tròn & dao động lan tỏa trên mặt hồ đài phun nước
    if (this.fountainRipples) {
      this.fountainRipples.rotation.z += delta * 0.35;
      const rippleWave = 1.0 + Math.sin(elapsedTime * 2.5) * 0.04;
      this.fountainRipples.scale.set(rippleWave, rippleWave, 1);
    }

    // 3. Hiệu ứng màng nước thác rơi từ tầng 2 xuống tầng 1 và từ tầng 1 xuống hồ
    this.fountainWaterfalls.forEach((cascade, idx) => {
      cascade.rotation.y += (idx % 2 === 0 ? 1 : -1) * delta * 0.6;
      const mat = cascade.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.opacity = 0.48 + Math.sin(elapsedTime * 3.5 + idx * 1.2) * 0.12;
      }
    });

    // 4. Tia nước phát quang từ miệng vòi sư tử & cột nước đỉnh cao
    this.fountainWaterJets.forEach((jet, idx) => {
      const jMat = jet.material as THREE.MeshStandardMaterial;
      if (jMat) {
        jMat.emissiveIntensity = 0.65 + Math.sin(elapsedTime * 4.2 + idx * 0.7) * 0.22;
      }
    });

    // 5. Cột nước geyser đỉnh đài phun dao động nhịp thở
    const summitGeyser = this.fountainWaterJets[this.fountainWaterJets.length - 1];
    if (summitGeyser) {
      summitGeyser.scale.y = 1.0 + Math.sin(elapsedTime * 3.2) * 0.08;
    }

    // 6. Viên ngọc kim cương trên quyền trượng xoay & phát quang thiên cầu
    if (this.fountainGemOrb) {
      this.fountainGemOrb.rotation.y += delta * 1.8;
      this.fountainGemOrb.rotation.x = Math.sin(elapsedTime * 2.0) * 0.15;
      const gemMat = this.fountainGemOrb.material as THREE.MeshStandardMaterial;
      if (gemMat) {
        gemMat.emissiveIntensity = 1.25 + Math.sin(elapsedTime * 3.6) * 0.35;
      }
    }

    // 7. Tia nước sủi bọt phun lên từ đỉnh geyser
    if (this.fountainSpray) {
      const pos = this.fountainSpray.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + delta * (0.85 + Math.sin(elapsedTime * 4 + i) * 0.45);
        if (y > 4.2) {
          y = 3.25;
          const sAngle = (i / pos.count) * Math.PI * 2 + Math.random() * 0.3;
          const sDist = Math.random() * 0.35;
          pos.setX(i, Math.cos(sAngle) * sDist);
          pos.setZ(i, Math.sin(sAngle) * sDist);
        }
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }

    // 8. Xe taxi vàng mini chạy vòng quanh đại lộ đô thị
    if (this.miniTaxi) {
      this.taxiAngle += delta * 0.35;
      const radius = 7.35;
      this.miniTaxi.position.x = Math.cos(this.taxiAngle) * radius;
      this.miniTaxi.position.z = Math.sin(this.taxiAngle) * radius;
      this.miniTaxi.rotation.y = -this.taxiAngle - Math.PI / 2;
    }

    // 9. Xe buýt mini xanh ngọc chạy vòng quanh đại lộ đô thị (làn đối diện)
    if (this.miniBus) {
      const busAngle = this.taxiAngle + Math.PI;
      const radius = 7.35;
      this.miniBus.position.x = Math.cos(busAngle) * radius;
      this.miniBus.position.z = Math.sin(busAngle) * radius;
      this.miniBus.rotation.y = -busAngle - Math.PI / 2;
    }

    // 10. Tán cây công viên đung đưa theo gió
    this.parkTrees.forEach((tree, idx) => {
      tree.rotation.z = Math.sin(elapsedTime * 1.8 + idx * 1.5) * 0.035;
    });

    // 11. Bụi nắng studio trôi bồng bềnh
    if (this.ambientDustMotes) {
      const positions = this.ambientDustMotes.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < positions.count; i++) {
        let y = positions.getY(i) - delta * 0.35;
        if (y < 0.5) y = 20;
        positions.setY(i, y);
      }
      positions.needsUpdate = true;
    }

    // 12. Cập nhật chuyển động đom đóm & bụi nắng công viên (Park Fireflies)
    if (this.parkFireflies && this.fireflyBasePos && this.fireflyPhases) {
      const posAttr = this.parkFireflies.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        const phase = this.fireflyPhases[i];
        const bx = this.fireflyBasePos[i * 3];
        const by = this.fireflyBasePos[i * 3 + 1];
        const bz = this.fireflyBasePos[i * 3 + 2];

        const curX = bx + Math.sin(elapsedTime * 0.9 + phase) * 0.35;
        const curY = by + Math.sin(elapsedTime * 1.5 + phase * 1.3) * 0.28;
        const curZ = bz + Math.cos(elapsedTime * 0.8 + phase) * 0.35;

        posAttr.setXYZ(i, curX, curY, curZ);
      }
      posAttr.needsUpdate = true;
    }

    // 13. Cập nhật sương mù thể tích diorama (Volumetric Diorama Haze)
    if (this.volumetricHazeGroup) {
      this.volumetricHazeGroup.rotation.y += delta * 0.015;
      const firstChild = this.volumetricHazeGroup.children[0] as THREE.Mesh;
      if (firstChild && firstChild.material) {
        const hMat = firstChild.material as THREE.MeshBasicMaterial;
        hMat.opacity = 0.15 + Math.sin(elapsedTime * 0.7) * 0.04;
      }
    }
  }

  /**
   * Dọn dẹp toàn bộ bộ nhớ WebGL của môi trường khi hủy scene (Zero Memory Leak)
   */
  public dispose() {
    this.disposables.geometries.forEach(geo => geo.dispose());
    this.disposables.geometries.clear();

    this.disposables.materials.forEach(mat => mat.dispose());
    this.disposables.materials.clear();

    this.disposables.textures.forEach(tex => tex.dispose());
    this.disposables.textures.clear();

    this.scene.remove(this.environmentGroup);
    this.scene.remove(this.plinthGroup);
    this.scene.remove(this.lampsGroup);
    this.scene.remove(this.centerGroup);
    this.scene.remove(this.islandWaterGroup);
  }
}
