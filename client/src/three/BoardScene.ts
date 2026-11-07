import * as THREE from 'three';
import { CameraManager } from './CameraManager';
import { TokenManager } from './TokenManager';
import { DicePhysics } from './DicePhysics';
import { BuildingMesh } from './BuildingMesh';
import { VFXManager } from './VFXManager';
import { TextureGenerator } from './TextureGenerator';
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
  private fountainSpray: THREE.Points | null = null;
  private billionaireStatue: THREE.Group | null = null;
  private parkTrees: THREE.Group[] = [];
  private coffeeSteam: THREE.Points | null = null;
  private ambientDustMotes: THREE.Points | null = null;
  private clock = new THREE.Clock();

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();

    // Natural Morning Studio Ambient Color Palette
    this.scene.background = new THREE.Color('#E3EAF2');
    this.scene.fog = new THREE.FogExp2('#E3EAF2', 0.007);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.14;

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
    this.setupTabletopProps();
    this.setupCenterDiorama();

    // Initialize 40 tiles immediately
    this.initBoard(DEFAULT_BOARD_TILES);

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    window.addEventListener('resize', this.onResize.bind(this));
  }

  private setupLighting() {
    // Warm Natural Key Light (Morning Sunbeam)
    const dirLight = new THREE.DirectionalLight('#FFF7EB', 1.45);
    dirLight.position.set(24, 38, 22);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 120;
    const d = 26;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0004;
    this.scene.add(dirLight);

    // Warm Ambient Bounce from Oak Table and Walls
    const hemiLight = new THREE.HemisphereLight('#FFF5E6', '#CBD5E1', 0.98);
    this.scene.add(hemiLight);

    // Soft Blue Sky Secondary Bounce
    const fillLight = new THREE.DirectionalLight('#E0F2FE', 0.38);
    fillLight.position.set(-25, 20, -25);
    this.scene.add(fillLight);
  }

  // 1. Natural Studio Environment: Warm Oak Wood Table & Window Sunbeam
  private setupStudioEnvironment() {
    const envGroup = new THREE.Group();

    // Tabletop with Natural Wood Grain Texture
    const woodTexture = TextureGenerator.createWoodPlankTexture();
    const tableGeo = new THREE.BoxGeometry(110, 2, 110);
    const tableMat = new THREE.MeshLambertMaterial({
      map: woodTexture,
      color: '#F4ECE1'
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -1.6;
    table.receiveShadow = true;
    envGroup.add(table);

    // Premium Slate Blue Felt Playmat under the board
    const matGeo = new THREE.BoxGeometry(32.5, 0.05, 32.5);
    const matMat = new THREE.MeshLambertMaterial({ color: '#3B4D61' });
    const feltMat = new THREE.Mesh(matGeo, matMat);
    feltMat.position.y = -0.58;
    feltMat.receiveShadow = true;
    envGroup.add(feltMat);

    // Gold Stitching border around mat
    const stitchGeo = new THREE.BoxGeometry(32.9, 0.04, 32.9);
    const stitchMat = new THREE.MeshLambertMaterial({ color: '#FDCB6E' });
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
    const baseGeo = new THREE.BoxGeometry(25.6, 0.6, 25.6);
    const baseMat = new THREE.MeshLambertMaterial({ color: '#2C3A47' });
    const plinth = new THREE.Mesh(baseGeo, baseMat);
    plinth.position.y = -0.3;
    plinth.receiveShadow = true;
    plinthGroup.add(plinth);

    // Gold Trim Inlay
    const trimGeo = new THREE.BoxGeometry(25.8, 0.08, 25.8);
    const trimMat = new THREE.MeshLambertMaterial({ color: '#FDCB6E', emissive: '#FDCB6E', emissiveIntensity: 0.22 });
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

  // 3. Four Miniature Warm Street Lamp Posts on Board Corners
  private setupStreetLamps() {
    const lampsGroup = new THREE.Group();
    const lampPositions = [
      [11.2, 11.2],
      [-11.2, 11.2],
      [-11.2, -11.2],
      [11.2, -11.2]
    ];

    lampPositions.forEach(([lx, lz]) => {
      const lamp = new THREE.Group();
      lamp.position.set(lx, 0.3, lz);

      // Cast iron pole
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.09, 1.2, 8),
        new THREE.MeshLambertMaterial({ color: '#2D3436' })
      );
      pole.position.y = 0.6;
      pole.castShadow = true;

      // Lantern head
      const lantern = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.28, 0.24),
        new THREE.MeshLambertMaterial({
          color: '#FFEAA7',
          emissive: '#FFEAA7',
          emissiveIntensity: 0.8
        })
      );
      lantern.position.y = 1.25;

      // Cap
      const cap = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.16, 4),
        new THREE.MeshLambertMaterial({ color: '#2D3436' })
      );
      cap.position.y = 1.45;
      cap.rotation.y = Math.PI / 4;

      lamp.add(pole, lantern, cap);
      lampsGroup.add(lamp);
    });

    this.scene.add(lampsGroup);
  }

  // 4. Natural Tabletop Props: Steaming Mug, Succulent, Gold Coins, Ledger
  private setupTabletopProps() {
    const propsGroup = new THREE.Group();

    // ☕ Ceramic Coffee Mug with Animated Steam
    const mug = new THREE.Group();
    mug.position.set(17, -0.55, -16);

    const mugBody = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 0.9, 1.8, 20),
      new THREE.MeshLambertMaterial({ color: '#FF7675' })
    );
    mugBody.position.y = 0.9;
    mugBody.castShadow = true;

    const coffee = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.1, 16),
      new THREE.MeshLambertMaterial({ color: '#3A1F13' })
    );
    coffee.position.y = 1.65;

    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.14, 8, 16, Math.PI),
      new THREE.MeshLambertMaterial({ color: '#FF7675' })
    );
    handle.position.set(1.1, 0.9, 0);
    handle.rotation.z = -Math.PI / 2;

    mug.add(mugBody, coffee, handle);

    // Steam particles rising from coffee
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

    // 🪙 Stacks of Golden Coins
    const coinGroup = new THREE.Group();
    coinGroup.position.set(16, -0.55, 15);

    const coinGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.14, 16);
    const coinMat = new THREE.MeshLambertMaterial({
      color: '#FDCB6E',
      emissive: '#FDCB6E',
      emissiveIntensity: 0.32
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
      new THREE.CylinderGeometry(1.1, 0.8, 1.4, 16),
      new THREE.MeshLambertMaterial({ color: '#E17055' })
    );
    pot.position.y = 0.7;
    pot.castShadow = true;

    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.95, 0.1, 16),
      new THREE.MeshLambertMaterial({ color: '#2D3436' })
    );
    soil.position.y = 1.35;

    const leafGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const leafMat = new THREE.MeshLambertMaterial({ color: '#00B894' });
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
      new THREE.BoxGeometry(2.4, 0.35, 3.2),
      new THREE.MeshLambertMaterial({ color: '#6C5CE7' })
    );
    book.position.y = 0.175;
    book.castShadow = true;

    const pages = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.28, 3.0),
      new THREE.MeshLambertMaterial({ color: '#FFFDF7' })
    );
    pages.position.set(0.1, 0.175, 0);

    const pen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8),
      new THREE.MeshLambertMaterial({ color: '#FDCB6E', emissive: '#FDCB6E', emissiveIntensity: 0.3 })
    );
    pen.position.set(1.5, 0.08, 0);
    pen.rotation.z = Math.PI / 2;

    ledger.add(book, pages, pen);
    propsGroup.add(ledger);

    this.scene.add(propsGroup);
  }

  // 5. Center Park Diorama with Water Spray & Swaying Trees
  private setupCenterDiorama() {
    const centerGroup = new THREE.Group();

    // Park Grass Base with Beveled Edge
    const parkGeo = new THREE.CylinderGeometry(8.5, 8.8, 0.3, 32);
    const parkMat = new THREE.MeshLambertMaterial({ color: '#55EFC4' });
    const park = new THREE.Mesh(parkGeo, parkMat);
    park.position.y = 0.15;
    park.receiveShadow = true;
    centerGroup.add(park);

    // Garden Path Ring
    const pathGeo = new THREE.RingGeometry(4.2, 5.4, 32);
    const pathMat = new THREE.MeshLambertMaterial({ color: '#FFEAA7', side: THREE.DoubleSide });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.y = 0.31;
    centerGroup.add(path);

    // Fountain Basin
    const basinGeo = new THREE.CylinderGeometry(3.5, 3.8, 0.45, 24);
    const basinMat = new THREE.MeshLambertMaterial({ color: '#DFE6E9' });
    const basin = new THREE.Mesh(basinGeo, basinMat);
    basin.position.y = 0.35;
    centerGroup.add(basin);

    // Translucent Water Surface
    const waterGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.1, 24);
    const waterMat = new THREE.MeshLambertMaterial({
      color: '#0984E3',
      emissive: '#74B9FF',
      emissiveIntensity: 0.38,
      transparent: true,
      opacity: 0.88
    });
    this.fountainRipples = new THREE.Mesh(waterGeo, waterMat);
    this.fountainRipples.position.y = 0.55;
    centerGroup.add(this.fountainRipples);

    // Fountain Spray Droplets
    const sprayCount = 28;
    const sprayGeo = new THREE.BufferGeometry();
    const sprayPositions = new Float32Array(sprayCount * 3);
    for (let i = 0; i < sprayCount; i++) {
      sprayPositions[i * 3] = (Math.random() - 0.5) * 1.6;
      sprayPositions[i * 3 + 1] = 0.8 + Math.random() * 1.6;
      sprayPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
    }
    sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPositions, 3));
    const sprayMat = new THREE.PointsMaterial({
      size: 0.22,
      color: '#A0E7E5',
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    this.fountainSpray = new THREE.Points(sprayGeo, sprayMat);
    centerGroup.add(this.fountainSpray);

    // Gold Billionaire Statue
    this.billionaireStatue = new THREE.Group();

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 1.05, 0.85, 16),
      new THREE.MeshLambertMaterial({ color: '#B2BEC3' })
    );
    pedestal.position.y = 0.9;

    const statueBody = new THREE.Mesh(
      new THREE.ConeGeometry(0.52, 1.25, 16),
      new THREE.MeshLambertMaterial({ color: '#FDCB6E', emissive: '#FDCB6E', emissiveIntensity: 0.25 })
    );
    statueBody.position.y = 1.95;

    const statueHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshLambertMaterial({ color: '#FDCB6E', emissive: '#FDCB6E', emissiveIntensity: 0.35 })
    );
    statueHead.position.y = 2.65;

    const topHat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.32, 12),
      new THREE.MeshLambertMaterial({ color: '#2D3436' })
    );
    topHat.position.y = 2.95;

    const cane = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8),
      new THREE.MeshLambertMaterial({ color: '#FDCB6E', emissive: '#FDCB6E', emissiveIntensity: 0.4 })
    );
    cane.position.set(0.48, 1.7, 0);

    this.billionaireStatue.add(pedestal, statueBody, statueHead, topHat, cane);
    centerGroup.add(this.billionaireStatue);

    // Natural Swaying Trees
    const treePositions = [
      [-6, -4.5], [-5.5, 5], [5.5, -5.5], [6, 4.5]
    ];
    this.parkTrees = [];
    treePositions.forEach(([tx, tz]) => {
      const tree = new THREE.Group();
      tree.position.set(tx, 0.3, tz);

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.26, 0.85, 8),
        new THREE.MeshLambertMaterial({ color: '#A0522D' })
      );
      trunk.position.y = 0.42;

      const canopy = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 12, 12),
        new THREE.MeshLambertMaterial({ color: '#00B894' })
      );
      canopy.position.y = 1.25;
      canopy.scale.set(1, 1.22, 1);

      tree.add(trunk, canopy);
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

      // Soft Porcelain White Base Block
      const baseGeo = new THREE.BoxGeometry(w * 0.96, tileHeight, l * 0.96);
      const baseMat = new THREE.MeshLambertMaterial({ color: '#FCFCFC' });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.receiveShadow = true;
      tileGroup.add(baseMesh);

      // District Color Bar with Rounded Look
      if (tile.districtColor) {
        const barLength = Math.min(w, l) * 0.96;
        const barGeo = new THREE.BoxGeometry(w > l ? w * 0.96 : barLength, 0.05, w > l ? barLength * 0.28 : l * 0.28);
        const barMat = new THREE.MeshLambertMaterial({ color: tile.districtColor });
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.y = tileHeight / 2 + 0.02;
        tileGroup.add(bar);
      }

      // 2X High-DPI Crisp Tile Typography
      const labelMesh = this.createTileLabel(tile, w, l);
      labelMesh.position.y = tileHeight / 2 + 0.03;
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

    if (tile.type === 'GO') {
      ctx.fillStyle = '#00B894';
      ctx.font = '900 84px sans-serif';
      ctx.fillText('GO', 256, 180);
      ctx.fillStyle = '#2D3436';
      ctx.font = '800 44px sans-serif';
      ctx.fillText('+200M', 256, 310);
    } else if (tile.type === 'JAIL') {
      ctx.fillStyle = '#E17055';
      ctx.font = '900 60px sans-serif';
      ctx.fillText('NHÀ TÙ', 256, 200);
      ctx.font = '700 42px sans-serif';
      ctx.fillText('Thăm tù', 256, 300);
    } else if (tile.type === 'GO_TO_JAIL') {
      ctx.fillStyle = '#D63031';
      ctx.font = '900 60px sans-serif';
      ctx.fillText('VÀO TÙ', 256, 200);
      ctx.font = '68px sans-serif';
      ctx.fillText('🚨', 256, 310);
    } else if (tile.type === 'FREE_PARKING') {
      ctx.fillStyle = '#0984E3';
      ctx.font = '900 56px sans-serif';
      ctx.fillText('ĐỖ XE', 256, 190);
      ctx.font = '700 40px sans-serif';
      ctx.fillText('Miễn phí', 256, 290);
    } else if (tile.type === 'CHANCE') {
      ctx.fillStyle = '#E84393';
      ctx.font = '900 80px sans-serif';
      ctx.fillText('?', 256, 190);
      ctx.font = '800 44px sans-serif';
      ctx.fillText('Cơ Hội', 256, 310);
    } else if (tile.type === 'COMMUNITY_CHEST') {
      ctx.fillStyle = '#FDCB6E';
      ctx.font = '68px sans-serif';
      ctx.fillText('🎁', 256, 190);
      ctx.font = '800 44px sans-serif';
      ctx.fillText('Khí Vận', 256, 300);
    } else if (tile.type === 'TAX') {
      ctx.fillStyle = '#D63031';
      ctx.font = '900 52px sans-serif';
      ctx.fillText(tile.name, 256, 200);
      ctx.font = '800 44px sans-serif';
      ctx.fillText('-100M', 256, 300);
    } else {
      ctx.fillStyle = '#2D3436';
      ctx.font = '900 48px sans-serif';
      ctx.fillText(tile.name, 256, 240);

      if (tile.price > 0) {
        ctx.fillStyle = '#00B894';
        ctx.font = '900 46px sans-serif';
        ctx.fillText(`${tile.price}M`, 256, 350);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;

    const planeGeo = new THREE.PlaneGeometry(Math.min(w, l) * 0.94, Math.min(w, l) * 0.94);
    const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    return new THREE.Mesh(planeGeo, planeMat);
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
    this.buildingMesh.update(delta);
    this.vfxManager.update(delta);
    this.tokenManager.update(delta);

    // Apply Camera Shake
    if (this.vfxManager.cameraShakeOffset.lengthSq() > 0) {
      this.cameraManager.camera.position.add(this.vfxManager.cameraShakeOffset);
    }

    // Water Surface ripples
    if (this.fountainRipples) {
      this.fountainRipples.rotation.y += delta * 0.45;
    }

    // Fountain Spray Droplets bubbling
    if (this.fountainSpray) {
      const pos = this.fountainSpray.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + delta * (0.8 + Math.sin(elapsedTime * 4 + i) * 0.5);
        if (y > 2.5) y = 0.8;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }

    // Statue gentle aura rotation
    if (this.billionaireStatue) {
      this.billionaireStatue.rotation.y += delta * 0.15;
    }

    // Gentle breeze swaying park trees
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
