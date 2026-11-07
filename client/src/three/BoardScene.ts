import * as THREE from 'three';
import { CameraManager } from './CameraManager';
import { TokenManager } from './TokenManager';
import { DicePhysics } from './DicePhysics';
import { BuildingMesh } from './BuildingMesh';
import { VFXManager } from './VFXManager';

export interface BoardTileMeta {
  id: number;
  name: string;
  type: string;
  district?: number;
  districtColor?: string;
  price: number;
}

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
  private billionaireStatue: THREE.Group | null = null;
  private clock = new THREE.Clock();

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#EBF2FA'); // Cozy Pastel Sky
    this.scene.fog = new THREE.FogExp2('#EBF2FA', 0.012);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Cinematic Tone Mapping for Vibrant Stylized Palette
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

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
    this.setupBoardPlinth();
    this.setupCenterDiorama();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    window.addEventListener('resize', this.onResize.bind(this));
  }

  private setupLighting() {
    // Warm Key Light (Sunlight)
    const dirLight = new THREE.DirectionalLight('#FFF6E5', 1.35);
    dirLight.position.set(22, 36, 22);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    const d = 24;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Fill Light (Secondary cool blue sky bounce)
    const fillLight = new THREE.DirectionalLight('#DFF9FB', 0.45);
    fillLight.position.set(-20, 20, -20);
    this.scene.add(fillLight);

    // Soft Sky & Ground Ambient Hemisphere
    const hemiLight = new THREE.HemisphereLight('#E0F2FE', '#F1F5F9', 0.85);
    this.scene.add(hemiLight);
  }

  // Khung gỗ đế sa bàn (Diorama Beveled Wooden Plinth)
  private setupBoardPlinth() {
    const plinthGroup = new THREE.Group();

    // Bottom Walnut Wood Base
    const baseGeo = new THREE.BoxGeometry(25.6, 0.6, 25.6);
    const baseMat = new THREE.MeshLambertMaterial({ color: '#2D3436' });
    const plinth = new THREE.Mesh(baseGeo, baseMat);
    plinth.position.y = -0.3;
    plinth.receiveShadow = true;
    plinthGroup.add(plinth);

    // Gold Trim Inlay
    const trimGeo = new THREE.BoxGeometry(25.8, 0.08, 25.8);
    const trimMat = new THREE.MeshLambertMaterial({ color: '#FDCB6E', emissive: '#FDCB6E', emissiveIntensity: 0.15 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.y = -0.02;
    plinthGroup.add(trim);

    // Contact shadow of entire board
    const shadowGeo = new THREE.PlaneGeometry(30, 30);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 20, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
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
    groundShadow.position.y = -0.62;
    plinthGroup.add(groundShadow);

    this.scene.add(plinthGroup);
  }

  private setupCenterDiorama() {
    const centerGroup = new THREE.Group();

    // Park Grass Base with Beveled Edge
    const parkGeo = new THREE.CylinderGeometry(8.5, 8.8, 0.3, 32);
    const parkMat = new THREE.MeshLambertMaterial({ color: '#55EFC4' });
    const park = new THREE.Mesh(parkGeo, parkMat);
    park.position.y = 0.15;
    park.receiveShadow = true;
    centerGroup.add(park);

    // Inner Garden Path Ring
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

    // Water Surface with Translucency
    const waterGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.1, 24);
    const waterMat = new THREE.MeshLambertMaterial({
      color: '#0984E3',
      emissive: '#74B9FF',
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.88
    });
    this.fountainRipples = new THREE.Mesh(waterGeo, waterMat);
    this.fountainRipples.position.y = 0.55;
    centerGroup.add(this.fountainRipples);

    // Center Gold Billionaire Statue
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

    // Golden Walking Cane
    const cane = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8),
      new THREE.MeshLambertMaterial({ color: '#FDCB6E', emissive: '#FDCB6E', emissiveIntensity: 0.4 })
    );
    cane.position.set(0.48, 1.7, 0);

    this.billionaireStatue.add(pedestal, statueBody, statueHead, topHat, cane);
    centerGroup.add(this.billionaireStatue);

    // Decorative Chunky Stylized Trees
    const treePositions = [
      [-6, -4.5], [-5.5, 5], [5.5, -5.5], [6, 4.5]
    ];
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

      // Base tile block with subtle bevel
      const baseGeo = new THREE.BoxGeometry(w * 0.96, tileHeight, l * 0.96);
      const baseMat = new THREE.MeshLambertMaterial({ color: '#FFFFFF' });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.receiveShadow = true;
      tileGroup.add(baseMesh);

      // District Color Bar
      if (tile.districtColor) {
        const barLength = Math.min(w, l) * 0.96;
        const barGeo = new THREE.BoxGeometry(w > l ? w * 0.96 : barLength, 0.05, w > l ? barLength * 0.28 : l * 0.28);
        const barMat = new THREE.MeshLambertMaterial({ color: tile.districtColor });
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.y = tileHeight / 2 + 0.02;
        tileGroup.add(bar);
      }

      // Crisp 2X Canvas Texture for Tile Typography
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

    this.dicePhysics.update(delta);
    this.cameraManager.update();
    this.buildingMesh.update(delta);
    this.vfxManager.update(delta);

    // Apply Camera Shake to Perspective Camera
    if (this.vfxManager.cameraShakeOffset.lengthSq() > 0) {
      this.cameraManager.camera.position.add(this.vfxManager.cameraShakeOffset);
    }

    // Water Surface animation
    if (this.fountainRipples) {
      this.fountainRipples.rotation.y += delta * 0.45;
    }

    // Statue gentle aura rotation
    if (this.billionaireStatue) {
      this.billionaireStatue.rotation.y += delta * 0.15;
    }

    this.renderer.render(this.scene, this.cameraManager.camera);
  }
}
