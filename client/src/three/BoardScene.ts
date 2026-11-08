import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { CameraManager } from './CameraManager';
import { TokenManager } from './TokenManager';
import { DicePhysics } from './DicePhysics';
import { BuildingMesh } from './BuildingMesh';
import { VFXManager } from './VFXManager';
import { TextureGenerator } from './TextureGenerator';
import { DetailedModels } from './DetailedModels';
import { DEFAULT_BOARD_TILES, BoardTileMeta } from '../config/BoardConfig';

export class BoardScene {
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public cameraManager: CameraManager;
  public tokenManager: TokenManager;
  public dicePhysics: DicePhysics;
  public buildingMesh: BuildingMesh;
  public vfxManager: VFXManager;

  private tilePositions: THREE.Vector3[] = [];
  private tileRotations: number[] = [];
  private fountainRipples: THREE.Mesh | null = null;
  private fountainWaterfalls: THREE.Mesh[] = [];
  private fountainWaterJets: THREE.Mesh[] = [];
  private fountainSpray: THREE.Points | null = null;
  private billionaireStatue: THREE.Group | null = null;
  private parkTrees: THREE.Group[] = [];
  private coffeeSteam: THREE.Points | null = null;
  private ambientDustMotes: THREE.Points | null = null;

  // Xe taxi mini & đèn còi cảnh sát
  private miniTaxi: THREE.Group | null = null;
  private taxiAngle: number = 0;
  private policeBeacon: THREE.Mesh | null = null;

  private clock = new THREE.Clock();

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();

    // Natural Morning Studio Ambient Sky
    this.scene.background = new THREE.Color('#DFE7F0');
    this.scene.fog = new THREE.FogExp2('#DFE7F0', 0.007);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Cinematic Tone Mapping
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    container.appendChild(this.renderer.domElement);

    this.cameraManager = new CameraManager(this.renderer.domElement);
    this.vfxManager = new VFXManager(this.scene, this.cameraManager.camera, container);
    this.tokenManager = new TokenManager();
    this.dicePhysics = new DicePhysics();
    this.dicePhysics.setVFXManager(this.vfxManager);
    this.buildingMesh = new BuildingMesh();
    this.buildingMesh.setVFXManager(this.vfxManager);

    this.scene.add(this.tokenManager.group);
    this.scene.add(this.dicePhysics.group);
    this.scene.add(this.buildingMesh.group);

    this.setupLighting();
    this.setupStudioEnvironment();
    this.setupBoardPlinth();
    this.setupStreetLamps();
    this.setupCornerLandmarks();
    this.setupTabletopProps();
    this.setupCenterDiorama();

    // Initialize 40 tiles immediately
    this.initBoard(DEFAULT_BOARD_TILES);

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    window.addEventListener('resize', this.onResize.bind(this));
  }

  private setupLighting() {
    // Warm Key Light (Morning Sunbeam)
    const dirLight = new THREE.DirectionalLight('#FFF7EB', 1.48);
    dirLight.position.set(24, 38, 22);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.radius = 2.0;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 120;
    const d = 26;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0003;
    this.scene.add(dirLight);

    // Warm Ambient Bounce from Oak Table and Walls
    const hemiLight = new THREE.HemisphereLight('#FFF6E8', '#CBD5E1', 0.98);
    this.scene.add(hemiLight);

    // Soft Blue Sky Secondary Bounce
    const fillLight = new THREE.DirectionalLight('#E0F2FE', 0.4);
    fillLight.position.set(-25, 20, -25);
    this.scene.add(fillLight);
  }

  // 1. Natural Studio Environment: Warm Oak Wood Table & Window Sunbeam
  private setupStudioEnvironment() {
    const envGroup = new THREE.Group();

    // Tabletop with Natural Wood Grain Texture
    const woodTexture = TextureGenerator.createWoodPlankTexture();
    const tableGeo = new THREE.BoxGeometry(110, 2, 110);
    const tableMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.45,
      metalness: 0.05,
      color: '#F4ECE1'
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -1.6;
    table.receiveShadow = true;
    envGroup.add(table);

    // Slate Blue Felt Playmat under the board
    const matGeo = new THREE.BoxGeometry(32.5, 0.05, 32.5);
    const matMat = new THREE.MeshStandardMaterial({ color: '#3A4B5E', roughness: 0.7 });
    const feltMat = new THREE.Mesh(matGeo, matMat);
    feltMat.position.y = -0.58;
    feltMat.receiveShadow = true;
    envGroup.add(feltMat);

    // Gold Stitching border around mat
    const stitchGeo = new THREE.BoxGeometry(32.9, 0.04, 32.9);
    const stitchMat = new THREE.MeshStandardMaterial({ color: '#FDCB6E', metalness: 0.8, roughness: 0.2 });
    const stitch = new THREE.Mesh(stitchGeo, stitchMat);
    stitch.position.y = -0.59;
    envGroup.add(stitch);

    // Window Light Shaft (Sunbeam cutting across the room)
    const sunbeamGeo = new THREE.PlaneGeometry(35, 70);
    const sunbeamMat = new THREE.MeshBasicMaterial({
      map: TextureGenerator.createSunbeamTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const sunbeam = new THREE.Mesh(sunbeamGeo, sunbeamMat);
    sunbeam.position.set(10, 15, -10);
    sunbeam.rotation.x = Math.PI / 3;
    sunbeam.rotation.y = -Math.PI / 6;
    envGroup.add(sunbeam);

    // Floating Ambient Dust Motes in warm sunlight
    const moteGeo = new THREE.BufferGeometry();
    const moteCount = 120;
    const motePositions = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      motePositions[i * 3] = (Math.random() - 0.5) * 50;
      motePositions[i * 3 + 1] = 1 + Math.random() * 22;
      motePositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
    const moteMat = new THREE.PointsMaterial({
      size: 0.28,
      color: '#FFEAA7',
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    this.ambientDustMotes = new THREE.Points(moteGeo, moteMat);
    envGroup.add(this.ambientDustMotes);

    this.scene.add(envGroup);
  }

  // 2. Beveled Board Plinth & Drop Shadow
  private setupBoardPlinth() {
    const plinthGroup = new THREE.Group();

    // Dark Walnut Wood Platform
    const baseGeo = new RoundedBoxGeometry(25.8, 0.6, 25.8, 4, 0.12);
    const baseMat = new THREE.MeshStandardMaterial({ color: '#253342', roughness: 0.4 });
    const plinth = new THREE.Mesh(baseGeo, baseMat);
    plinth.position.y = -0.3;
    plinth.receiveShadow = true;
    plinthGroup.add(plinth);

    // Gold Trim Inlay
    const trimGeo = new THREE.BoxGeometry(26.0, 0.08, 26.0);
    const trimMat = new THREE.MeshStandardMaterial({ color: '#FDCB6E', emissive: '#FDCB6E', emissiveIntensity: 0.25, metalness: 0.85, roughness: 0.2 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.y = -0.02;
    plinthGroup.add(trim);

    // Soft drop shadow
    const shadowGeo = new THREE.PlaneGeometry(31, 31);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 25, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const shadowMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      depthWrite: false
    });
    const groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.y = -0.56;
    plinthGroup.add(groundShadow);

    this.scene.add(plinthGroup);
  }

  // 3. Four Miniature Street Lamp Posts on Board Corners (Victorian Lantern Posts)
  private setupStreetLamps() {
    const lampsGroup = new THREE.Group();
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
      lampsGroup.add(lamp);
    });

    this.scene.add(lampsGroup);
  }

  // 4. Chi Tiết 3D Đặc Sắc Cho 4 Góc Bàn Cờ (Corner Iconic 3D Props)
  private setupCornerLandmarks() {
    const cornerGroup = new THREE.Group();

    // 🏆 Ô số 0 (GO): Cổng Khải Hoàn Môn Hoàng Kim 3D
    const goGate = new THREE.Group();
    goGate.position.set(10.6, 0.3, 10.6);
    goGate.rotation.y = -Math.PI / 4;

    const goldMat = new THREE.MeshStandardMaterial({ color: '#FDCB6E', metalness: 0.85, roughness: 0.2, emissive: '#FDCB6E', emissiveIntensity: 0.2 });
    const pillar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.4, 16), goldMat);
    pillar1.position.set(-0.8, 0.7, 0);
    const pillar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.4, 16), goldMat);
    pillar2.position.set(0.8, 0.7, 0);

    const archTop = new THREE.Mesh(new RoundedBoxGeometry(1.8, 0.24, 0.28, 2, 0.04), goldMat);
    archTop.position.set(0, 1.45, 0);

    const banner = new THREE.Mesh(
      new RoundedBoxGeometry(1.4, 0.22, 0.06, 2, 0.02),
      new THREE.MeshStandardMaterial({ color: '#00B894', emissive: '#00B894', emissiveIntensity: 0.4 })
    );
    banner.position.set(0, 1.45, 0.16);

    goGate.add(pillar1, pillar2, archTop, banner);
    cornerGroup.add(goGate);

    // 🔒 Ô số 10 (JAIL): Lồng Sắt Hoạt Hình 3D với Ổ Khóa Vàng
    const jailCell = new THREE.Group();
    jailCell.position.set(-10.6, 0.3, 10.6);
    jailCell.rotation.y = Math.PI / 4;

    const barMat = new THREE.MeshStandardMaterial({ color: '#4B6584', metalness: 0.8, roughness: 0.25 });
    for (let b = -0.5; b <= 0.5; b += 0.25) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.1, 8), barMat);
      bar.position.set(b, 0.55, 0.5);
      jailCell.add(bar);
    }
    const cellTop = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.1, 1.2, 2, 0.02), barMat);
    cellTop.position.y = 1.15;

    const lock = new THREE.Mesh(
      new THREE.TorusGeometry(0.1, 0.035, 8, 16),
      new THREE.MeshStandardMaterial({ color: '#FDCB6E', metalness: 0.9, roughness: 0.15 })
    );
    lock.position.set(0, 0.55, 0.55);
    jailCell.add(cellTop, lock);
    cornerGroup.add(jailCell);

    // 🅿️ Ô số 20 (FREE PARKING): Trụ Đồng Hồ Đỗ Xe Đỏ & Biển Chữ P
    const parkingProp = new THREE.Group();
    parkingProp.position.set(-10.6, 0.3, -10.6);
    parkingProp.rotation.y = (3 * Math.PI) / 4;

    const meterPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 1.0, 12),
      new THREE.MeshStandardMaterial({ color: '#718093', metalness: 0.7 })
    );
    meterPole.position.y = 0.5;

    const meterHead = new THREE.Mesh(
      new RoundedBoxGeometry(0.3, 0.4, 0.25, 3, 0.05),
      new THREE.MeshStandardMaterial({ color: '#E84118', roughness: 0.3 })
    );
    meterHead.position.y = 1.15;

    const signP = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: '#0984E3', emissive: '#0984E3', emissiveIntensity: 0.3 })
    );
    signP.rotation.x = Math.PI / 2;
    signP.position.set(0, 1.5, 0);

    parkingProp.add(meterPole, meterHead, signP);
    cornerGroup.add(parkingProp);

    // 🚨 Ô số 30 (GO TO JAIL): Đèn Còi Cảnh Sát 3D Nhấp Nháy
    const policeProp = new THREE.Group();
    policeProp.position.set(10.6, 0.3, -10.6);
    policeProp.rotation.y = -(3 * Math.PI) / 4;

    const sirenBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.35, 0.4, 16),
      new THREE.MeshStandardMaterial({ color: '#2F3542', metalness: 0.6 })
    );
    sirenBase.position.y = 0.2;

    this.policeBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({
        color: '#FF4757',
        emissive: '#FF4757',
        emissiveIntensity: 0.85,
        transparent: true,
        opacity: 0.9
      })
    );
    this.policeBeacon.position.y = 0.4;

    policeProp.add(sirenBase, this.policeBeacon);
    cornerGroup.add(policeProp);

    this.scene.add(cornerGroup);
  }

  // 5. Tabletop Props: Steaming Mug, Succulent, Gold Coins, Ledger, Banker's Lamp
  private setupTabletopProps() {
    const propsGroup = new THREE.Group();

    // ☕ Ceramic Coffee Mug with Animated Steam
    const mug = new THREE.Group();
    mug.position.set(17, -0.55, -16);

    const mugBody = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 0.9, 1.8, 24),
      new THREE.MeshStandardMaterial({ color: '#FF7675', roughness: 0.18 })
    );
    mugBody.position.y = 0.9;
    mugBody.castShadow = true;

    const coffee = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.1, 20),
      new THREE.MeshStandardMaterial({ color: '#3A1F13', roughness: 0.1 })
    );
    coffee.position.y = 1.65;

    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.14, 12, 20, Math.PI),
      new THREE.MeshStandardMaterial({ color: '#FF7675', roughness: 0.18 })
    );
    handle.position.set(1.1, 0.9, 0);
    handle.rotation.z = -Math.PI / 2;

    mug.add(mugBody, coffee, handle);

    // Steam particles
    const steamCount = 20;
    const steamGeo = new THREE.BufferGeometry();
    const steamPositions = new Float32Array(steamCount * 3);
    for (let i = 0; i < steamCount; i++) {
      steamPositions[i * 3] = (Math.random() - 0.5) * 0.6;
      steamPositions[i * 3 + 1] = 1.8 + Math.random() * 1.5;
      steamPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));
    const steamMat = new THREE.PointsMaterial({
      size: 0.35,
      color: '#FFFFFF',
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    this.coffeeSteam = new THREE.Points(steamGeo, steamMat);
    mug.add(this.coffeeSteam);

    propsGroup.add(mug);

    // 💡 Đèn Bàn Cổ Điển Banker's Lamp
    const lamp = new THREE.Group();
    lamp.position.set(-18, -0.55, -8);
    lamp.rotation.y = Math.PI / 4;

    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1.1, 0.25, 20),
      new THREE.MeshStandardMaterial({ color: '#FDCB6E', metalness: 0.88, roughness: 0.2 })
    );
    lampBase.position.y = 0.125;

    const lampArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 2.4, 12),
      new THREE.MeshStandardMaterial({ color: '#FDCB6E', metalness: 0.88, roughness: 0.2 })
    );
    lampArm.position.set(0, 1.3, 0);

    const shade = new THREE.Mesh(
      new RoundedBoxGeometry(1.6, 0.6, 0.8, 4, 0.1),
      new THREE.MeshStandardMaterial({
        color: '#00B894',
        emissive: '#55EFC4',
        emissiveIntensity: 0.45,
        roughness: 0.15
      })
    );
    shade.position.set(0.4, 2.5, 0);

    lamp.add(lampBase, lampArm, shade);
    propsGroup.add(lamp);

    // 🪙 Stacks of Golden Coins
    const coinGroup = new THREE.Group();
    coinGroup.position.set(16, -0.55, 15);

    const coinGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.14, 20);
    const coinMat = new THREE.MeshStandardMaterial({
      color: '#FDCB6E',
      emissive: '#FDCB6E',
      emissiveIntensity: 0.32,
      metalness: 0.88,
      roughness: 0.18
    });

    const stackOffsets = [
      [0, 0, 7],
      [1.1, 0.6, 5],
      [-0.9, 0.7, 4]
    ];
    stackOffsets.forEach(([sx, sz, count]) => {
      for (let c = 0; c < count; c++) {
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.position.set(sx + (Math.random() - 0.5) * 0.05, c * 0.15 + 0.07, sz + (Math.random() - 0.5) * 0.05);
        coin.rotation.y = Math.random() * Math.PI;
        coin.castShadow = true;
        coinGroup.add(coin);
      }
    });
    propsGroup.add(coinGroup);

    // 🪴 Potted Terracotta Succulent Plant
    const plant = new THREE.Group();
    plant.position.set(-17, -0.55, -15);

    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 0.8, 1.4, 20),
      new THREE.MeshStandardMaterial({ color: '#E17055', roughness: 0.55 })
    );
    pot.position.y = 0.7;
    pot.castShadow = true;

    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.95, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: '#2D3436', roughness: 0.8 })
    );
    soil.position.y = 1.35;

    const leafGeo = new THREE.SphereGeometry(0.35, 10, 10);
    const leafMat = new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.3 });
    for (let l = 0; l < 8; l++) {
      const angle = (l / 8) * Math.PI * 2;
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(Math.cos(angle) * 0.55, 1.48, Math.sin(angle) * 0.55);
      leaf.scale.set(1.15, 0.55, 1.15);
      plant.add(leaf);
    }
    const centerBud = new THREE.Mesh(leafGeo, leafMat);
    centerBud.position.y = 1.72;
    plant.add(pot, soil, centerBud);
    propsGroup.add(plant);

    // 📒 Leather Investor's Ledger & Pen
    const ledger = new THREE.Group();
    ledger.position.set(-16.5, -0.55, 14.5);
    ledger.rotation.y = Math.PI / 6;

    const book = new THREE.Mesh(
      new RoundedBoxGeometry(2.4, 0.35, 3.2, 4, 0.08),
      new THREE.MeshStandardMaterial({ color: '#6C5CE7', roughness: 0.4 })
    );
    book.position.y = 0.175;
    book.castShadow = true;

    const pages = new THREE.Mesh(
      new RoundedBoxGeometry(2.2, 0.28, 3.0, 2, 0.04),
      new THREE.MeshStandardMaterial({ color: '#FFFDF7', roughness: 0.6 })
    );
    pages.position.set(0.1, 0.175, 0);

    const pen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2.5, 12),
      new THREE.MeshStandardMaterial({ color: '#FDCB6E', emissive: '#FDCB6E', emissiveIntensity: 0.3, metalness: 0.85, roughness: 0.18 })
    );
    pen.position.set(1.5, 0.08, 0);
    pen.rotation.z = Math.PI / 2;

    ledger.add(book, pages, pen);
    propsGroup.add(ledger);

    this.scene.add(propsGroup);
  }

  // 6. Center Park Diorama: Đài Phun Nước Đẳng Cấp, Cây Đa Tầng & Xe Taxi
  private setupCenterDiorama() {
    const centerGroup = new THREE.Group();

    // Park Grass Base với gờ viền mềm
    const parkGeo = new THREE.CylinderGeometry(8.5, 8.8, 0.3, 36);
    const parkMat = new THREE.MeshStandardMaterial({ color: '#55EFC4', roughness: 0.5 });
    const park = new THREE.Mesh(parkGeo, parkMat);
    park.position.y = 0.15;
    park.receiveShadow = true;
    centerGroup.add(park);

    // Lối đi dạo quanh công viên lát sỏi
    const pathGeo = new THREE.RingGeometry(4.2, 5.4, 36);
    const pathMat = new THREE.MeshStandardMaterial({ color: '#FFEAA7', roughness: 0.6, side: THREE.DoubleSide });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.y = 0.31;
    centerGroup.add(path);

    // Ghế Băng Công Viên Cổ Điển London bằng Gỗ Sồi & Chân Sắt Uốn
    for (let b = 0; b < 4; b++) {
      const angle = (b / 4) * Math.PI * 2 + Math.PI / 4;
      const bench = DetailedModels.createParkBench();
      bench.position.set(Math.cos(angle) * 4.9, 0.32, Math.sin(angle) * 4.9);
      bench.rotation.y = -angle + Math.PI / 2;
      centerGroup.add(bench);
    }

    // 4 Cột Đèn Đường Cổ Điển Dọc Lối Đi Dạo Công Viên
    for (let l = 0; l < 4; l++) {
      const lAngle = (l / 4) * Math.PI * 2;
      const pLamp = DetailedModels.createStreetLamp();
      pLamp.scale.set(0.72, 0.72, 0.72);
      pLamp.position.set(Math.cos(lAngle) * 5.5, 0.32, Math.sin(lAngle) * 5.5);
      pLamp.rotation.y = -lAngle - Math.PI / 2;
      centerGroup.add(pLamp);
    }

    // 🚕 Xe Taxi Vàng Mini Chạy Quanh Công Viên
    this.miniTaxi = new THREE.Group();
    const taxiBody = new THREE.Mesh(
      new RoundedBoxGeometry(0.65, 0.28, 0.38, 3, 0.05),
      new THREE.MeshStandardMaterial({ color: '#FED330', roughness: 0.25 })
    );
    taxiBody.position.y = 0.22;
    taxiBody.castShadow = true;

    const taxiCabin = new THREE.Mesh(
      new RoundedBoxGeometry(0.36, 0.22, 0.32, 2, 0.04),
      new THREE.MeshStandardMaterial({ color: '#2D3436', roughness: 0.3 })
    );
    taxiCabin.position.set(-0.04, 0.42, 0);

    const taxiSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, 0.16),
      new THREE.MeshStandardMaterial({ color: '#FFFFFF', emissive: '#FFF275', emissiveIntensity: 0.8 })
    );
    taxiSign.position.set(-0.04, 0.58, 0);

    this.miniTaxi.add(taxiBody, taxiCabin, taxiSign);
    this.miniTaxi.position.set(4.8, 0.2, 0);
    centerGroup.add(this.miniTaxi);

    // ⛲ Đài Phun Nước Hoàng Gia Bát Giác 3 Tầng với 4 Vòi Cá & Màng Nước Rơi
    const fountainData = DetailedModels.createDetailedFountain();
    this.fountainRipples = fountainData.waterRipples;
    this.fountainWaterfalls = fountainData.waterFalls;
    this.fountainWaterJets = fountainData.waterJets;
    centerGroup.add(fountainData.group);

    // Các Bụi Hoa Cẩm Tú Cầu Xung Quanh Đài Phun Nước
    const flowerColors = ['#FF7675', '#FD79A8', '#FDCB6E', '#A29BFE'];
    for (let f = 0; f < 8; f++) {
      const fAngle = (f / 8) * Math.PI * 2 + 0.2;
      const bush = DetailedModels.createFlowerBush(flowerColors[f % flowerColors.length]);
      bush.position.set(Math.cos(fAngle) * 3.7, 0.3, Math.sin(fAngle) * 3.7);
      centerGroup.add(bush);
    }

    // Hạt Nước Li Ti Sủi Bọt Ở Đỉnh
    const sprayCount = 28;
    const sprayGeo = new THREE.BufferGeometry();
    const sprayPositions = new Float32Array(sprayCount * 3);
    for (let i = 0; i < sprayCount; i++) {
      sprayPositions[i * 3] = (Math.random() - 0.5) * 1.4;
      sprayPositions[i * 3 + 1] = 2.3 + Math.random() * 1.2;
      sprayPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
    }
    sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPositions, 3));
    const sprayMat = new THREE.PointsMaterial({
      size: 0.24,
      color: '#A0E7E5',
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    this.fountainSpray = new THREE.Points(sprayGeo, sprayMat);
    centerGroup.add(this.fountainSpray);

    // 👑 Tượng Vua Tỷ Phú Vàng Đứng Cạnh Đài Phun Nước
    this.billionaireStatue = new THREE.Group();
    this.billionaireStatue.position.set(0, 0, 0);

    // 🌳 4 CÂY CÔNG VIÊN CAO CẤP ĐA TẦNG LÁ MÂY BỒNG BỀNH
    const treePositions = [
      [-6, -4.5], [-5.5, 5], [5.5, -5.5], [6, 4.5]
    ];
    this.parkTrees = [];
    treePositions.forEach(([tx, tz]) => {
      const tree = DetailedModels.createStylizedTree();
      tree.position.set(tx, 0.3, tz);
      centerGroup.add(tree);
      this.parkTrees.push(tree);
    });

    this.scene.add(centerGroup);
  }

  public initBoard(tiles: BoardTileMeta[]) {
    const boardSize = 24;
    const cornerSize = 3.2;
    const normalWidth = (boardSize - cornerSize * 2) / 9;
    const tileHeight = 0.3;

    this.tilePositions = new Array(40);
    this.tileRotations = new Array(40);

    for (let i = 0; i < 40; i++) {
      const tile = tiles[i];
      let x = 0;
      let z = 0;
      let w = normalWidth;
      let l = cornerSize;
      let angle = 0;

      if (i === 0) {
        x = boardSize / 2 - cornerSize / 2;
        z = boardSize / 2 - cornerSize / 2;
        w = cornerSize;
        l = cornerSize;
        angle = -Math.PI / 4;
      } else if (i > 0 && i < 10) {
        const offset = (i - 1) * normalWidth + normalWidth / 2;
        x = (boardSize / 2 - cornerSize) - offset;
        z = boardSize / 2 - cornerSize / 2;
        w = normalWidth;
        l = cornerSize;
        angle = 0;
      } else if (i === 10) {
        x = -(boardSize / 2 - cornerSize / 2);
        z = boardSize / 2 - cornerSize / 2;
        w = cornerSize;
        l = cornerSize;
        angle = Math.PI / 4;
      } else if (i > 10 && i < 20) {
        const offset = (i - 11) * normalWidth + normalWidth / 2;
        x = -(boardSize / 2 - cornerSize / 2);
        z = (boardSize / 2 - cornerSize) - offset;
        w = cornerSize;
        l = normalWidth;
        angle = Math.PI / 2;
      } else if (i === 20) {
        x = -(boardSize / 2 - cornerSize / 2);
        z = -(boardSize / 2 - cornerSize / 2);
        w = cornerSize;
        l = cornerSize;
        angle = (3 * Math.PI) / 4;
      } else if (i > 20 && i < 30) {
        const offset = (i - 21) * normalWidth + normalWidth / 2;
        x = -(boardSize / 2 - cornerSize) + offset;
        z = -(boardSize / 2 - cornerSize / 2);
        w = normalWidth;
        l = cornerSize;
        angle = Math.PI;
      } else if (i === 30) {
        x = boardSize / 2 - cornerSize / 2;
        z = -(boardSize / 2 - cornerSize / 2);
        w = cornerSize;
        l = cornerSize;
        angle = -(3 * Math.PI) / 4;
      } else {
        const offset = (i - 31) * normalWidth + normalWidth / 2;
        x = boardSize / 2 - cornerSize / 2;
        z = -(boardSize / 2 - cornerSize) + offset;
        w = cornerSize;
        l = normalWidth;
        angle = -Math.PI / 2;
      }

      const pos = new THREE.Vector3(x, 0.15, z);
      this.tilePositions[i] = pos;
      this.tileRotations[i] = angle;

      const tileGroup = new THREE.Group();
      tileGroup.position.copy(pos);

      // Ô cờ bo tròn góc mềm mại với RoundedBoxGeometry
      const baseGeo = new RoundedBoxGeometry(w * 0.96, tileHeight, l * 0.96, 4, 0.08);
      const baseMat = new THREE.MeshStandardMaterial({
        color: '#FCFCFC',
        roughness: 0.28,
        metalness: 0.04
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.receiveShadow = true;
      tileGroup.add(baseMesh);

      // Gờ đá bó vỉa bo cong ngăn cách mặt đường
      const curb = DetailedModels.createTileCurbs(w, l, angle);
      tileGroup.add(curb);

      // Dải màu nhận diện phân khu bo cong bóng bẩy
      if (tile.districtColor) {
        const barLength = Math.min(w, l) * 0.96;
        const barGeo = new RoundedBoxGeometry(w > l ? w * 0.96 : barLength, 0.06, w > l ? barLength * 0.28 : l * 0.28, 2, 0.02);
        const barMat = new THREE.MeshStandardMaterial({
          color: tile.districtColor,
          roughness: 0.24,
          metalness: 0.08
        });
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.y = tileHeight / 2 + 0.02;
        tileGroup.add(bar);
      }

      // 2X High-DPI Crisp Tile Typography with Badges & Vector Icons
      const labelMesh = this.createTileLabel(tile, w, l);
      labelMesh.position.y = tileHeight / 2 + 0.035;
      labelMesh.rotation.x = -Math.PI / 2;
      tileGroup.add(labelMesh);

      this.scene.add(tileGroup);
    }

    this.tokenManager.setTilePositions(this.tilePositions);
  }

  private createTileLabel(tile: BoardTileMeta, w: number, l: number): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, 480, 480);

    if (tile.type === 'GO') {
      ctx.fillStyle = '#00B894';
      ctx.font = '900 84px sans-serif';
      ctx.fillText('GO', 256, 175);

      ctx.fillStyle = '#E6FFFA';
      this.drawRoundedRect(ctx, 110, 260, 292, 70, 35);
      ctx.fill();

      ctx.fillStyle = '#00B894';
      ctx.font = '900 42px sans-serif';
      ctx.fillText('+200M', 256, 298);
    } else if (tile.type === 'JAIL') {
      ctx.fillStyle = '#E17055';
      ctx.font = '900 62px sans-serif';
      ctx.fillText('NHÀ TÙ', 256, 195);
      ctx.fillStyle = '#636E72';
      ctx.font = '800 40px sans-serif';
      ctx.fillText('Thăm tù', 256, 295);
    } else if (tile.type === 'GO_TO_JAIL') {
      ctx.fillStyle = '#D63031';
      ctx.font = '900 62px sans-serif';
      ctx.fillText('VÀO TÙ', 256, 195);
      ctx.font = '68px sans-serif';
      ctx.fillText('🚨', 256, 305);
    } else if (tile.type === 'FREE_PARKING') {
      ctx.fillStyle = '#0984E3';
      ctx.font = '900 58px sans-serif';
      ctx.fillText('ĐỖ XE', 256, 185);
      ctx.font = '54px sans-serif';
      ctx.fillText('🅿️', 256, 290);
    } else if (tile.type === 'CHANCE') {
      ctx.fillStyle = '#E84393';
      ctx.font = '900 84px sans-serif';
      ctx.fillText('?', 256, 185);
      ctx.font = '800 44px sans-serif';
      ctx.fillText('Cơ Hội', 256, 305);
    } else if (tile.type === 'COMMUNITY_CHEST') {
      ctx.font = '72px sans-serif';
      ctx.fillText('🎁', 256, 185);
      ctx.fillStyle = '#E17055';
      ctx.font = '800 44px sans-serif';
      ctx.fillText('Khí Vận', 256, 300);
    } else if (tile.type === 'TAX') {
      ctx.fillStyle = '#D63031';
      ctx.font = '900 50px sans-serif';
      ctx.fillText(tile.name, 256, 195);

      ctx.fillStyle = '#FFEAEA';
      this.drawRoundedRect(ctx, 130, 260, 252, 60, 30);
      ctx.fill();

      ctx.fillStyle = '#D63031';
      ctx.font = '900 38px sans-serif';
      ctx.fillText('-100M', 256, 292);
    } else if (tile.type === 'RAILROAD') {
      ctx.font = '54px sans-serif';
      ctx.fillText('🚂', 256, 175);
      ctx.fillStyle = '#2D3436';
      ctx.font = '800 40px sans-serif';
      ctx.fillText(tile.name, 256, 250);

      ctx.fillStyle = '#00B894';
      ctx.font = '900 38px sans-serif';
      ctx.fillText('200M', 256, 335);
    } else if (tile.type === 'UTILITY') {
      ctx.font = '54px sans-serif';
      ctx.fillText(tile.name.includes('Điện') ? '💡' : '💧', 256, 175);
      ctx.fillStyle = '#2D3436';
      ctx.font = '800 40px sans-serif';
      ctx.fillText(tile.name, 256, 250);

      ctx.fillStyle = '#00B894';
      ctx.font = '900 38px sans-serif';
      ctx.fillText('150M', 256, 335);
    } else {
      ctx.fillStyle = '#2D3436';
      ctx.font = '900 46px sans-serif';
      ctx.fillText(tile.name, 256, 235);

      if (tile.price > 0) {
        ctx.fillStyle = '#F0FFF4';
        this.drawRoundedRect(ctx, 140, 310, 232, 64, 32);
        ctx.fill();

        ctx.fillStyle = '#00B894';
        ctx.font = '900 42px sans-serif';
        ctx.fillText(`${tile.price}M`, 256, 345);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;

    const planeGeo = new THREE.PlaneGeometry(Math.min(w, l) * 0.94, Math.min(w, l) * 0.94);
    const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    return new THREE.Mesh(planeGeo, planeMat);
  }

  private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  public updateBuilding(tileId: number, level: number) {
    const pos = this.tilePositions[tileId];
    const angle = this.tileRotations[tileId] || 0;
    if (pos) {
      this.buildingMesh.updateBuilding(tileId, level, pos, angle);
    }
  }

  public getTileWorldPosition(tileId: number): THREE.Vector3 {
    return this.tilePositions[tileId] || new THREE.Vector3(0, 0, 0);
  }

  private onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.cameraManager.onResize();
  }

  private animate() {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    this.dicePhysics.update(delta);
    this.cameraManager.update();
    this.buildingMesh.update(elapsedTime);
    this.vfxManager.update(delta);
    this.tokenManager.update(delta);

    // Apply Camera Shake
    if (this.vfxManager.cameraShakeOffset.lengthSq() > 0) {
      this.cameraManager.camera.position.add(this.vfxManager.cameraShakeOffset);
    }

    // Gợn sóng lăn tăn xoay tròn trên mặt hồ đài phun nước
    if (this.fountainRipples) {
      this.fountainRipples.rotation.z += delta * 0.35;
    }

    // Hiệu ứng màng nước thác rơi từ tầng 2 xuống tầng 1 và từ tầng 1 xuống hồ
    this.fountainWaterfalls.forEach((cascade, idx) => {
      cascade.rotation.y += (idx % 2 === 0 ? 1 : -1) * delta * 0.7;
      const mat = cascade.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.45 + Math.sin(elapsedTime * 3 + idx) * 0.1;
    });

    // 4 Tia nước phát quang từ miệng vòi cá vàng
    this.fountainWaterJets.forEach((jet, idx) => {
      const jMat = jet.material as THREE.MeshStandardMaterial;
      jMat.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 4 + idx) * 0.2;
    });

    // Tia nước sủi bọt phun lên
    if (this.fountainSpray) {
      const pos = this.fountainSpray.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + delta * (0.9 + Math.sin(elapsedTime * 4 + i) * 0.5);
        if (y > 3.6) y = 2.2;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }

    // Xe taxi vàng mini chạy vòng quanh công viên
    if (this.miniTaxi) {
      this.taxiAngle += delta * 0.45;
      const radius = 4.8;
      this.miniTaxi.position.x = Math.cos(this.taxiAngle) * radius;
      this.miniTaxi.position.z = Math.sin(this.taxiAngle) * radius;
      this.miniTaxi.rotation.y = -this.taxiAngle - Math.PI / 2;
    }

    // Đèn còi cảnh sát nhấp nháy xoay vòng
    if (this.policeBeacon) {
      const beaconMat = this.policeBeacon.material as THREE.MeshStandardMaterial;
      const pulse = (Math.sin(elapsedTime * 12) + 1) * 0.5;
      beaconMat.emissiveIntensity = 0.4 + pulse * 0.6;
      beaconMat.color.setHex(pulse > 0.5 ? 0xFF4757 : 0x0984E3);
      beaconMat.emissive.setHex(pulse > 0.5 ? 0xFF4757 : 0x0984E3);
    }

    // Tán cây công viên đung đưa theo gió
    this.parkTrees.forEach((tree, idx) => {
      tree.rotation.z = Math.sin(elapsedTime * 1.8 + idx * 1.5) * 0.035;
    });

    // Coffee Steam wafting up
    if (this.coffeeSteam) {
      const sPos = this.coffeeSteam.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < sPos.count; i++) {
        let y = sPos.getY(i) + delta * 0.6;
        let x = sPos.getX(i) + Math.sin(elapsedTime * 2 + i) * delta * 0.2;
        if (y > 3.6) {
          y = 1.8;
          x = (Math.random() - 0.5) * 0.4;
        }
        sPos.setY(i, y);
        sPos.setX(i, x);
      }
      sPos.needsUpdate = true;
    }

    // Ambient floating dust motes drift
    if (this.ambientDustMotes) {
      const positions = (this.ambientDustMotes.geometry.attributes.position as THREE.BufferAttribute);
      for (let i = 0; i < positions.count; i++) {
        let y = positions.getY(i) - delta * 0.3;
        if (y < 0.5) y = 20;
        positions.setY(i, y);
      }
      positions.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.cameraManager.camera);
  }
}
