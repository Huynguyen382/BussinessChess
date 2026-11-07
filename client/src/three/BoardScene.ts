import * as THREE from 'three';
import { CameraManager } from './CameraManager';
import { TokenManager } from './TokenManager';
import { DicePhysics } from './DicePhysics';
import { BuildingMesh } from './BuildingMesh';

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

  private tilePositions: THREE.Vector3[] = [];
  private tileRotations: number[] = [];
  private fountainRipples: THREE.Mesh | null = null;
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
    container.appendChild(this.renderer.domElement);

    this.cameraManager = new CameraManager(this.renderer.domElement);
    this.tokenManager = new TokenManager();
    this.dicePhysics = new DicePhysics();
    this.buildingMesh = new BuildingMesh();

    this.scene.add(this.tokenManager.group);
    this.scene.add(this.dicePhysics.group);
    this.scene.add(this.buildingMesh.group);

    this.setupLighting();
    this.setupCenterDiorama();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    window.addEventListener('resize', this.onResize.bind(this));
  }

  private setupLighting() {
    // Warm Sunlight
    const dirLight = new THREE.DirectionalLight('#FFF6E5', 1.3);
    dirLight.position.set(20, 35, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    const d = 25;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Soft Sky & Ground Ambient Light
    const hemiLight = new THREE.HemisphereLight('#E0F2FE', '#F1F5F9', 0.85);
    this.scene.add(hemiLight);
  }

  private setupCenterDiorama() {
    const centerGroup = new THREE.Group();

    // Park Grass Base
    const parkGeo = new THREE.CylinderGeometry(8.5, 8.8, 0.3, 32);
    const parkMat = new THREE.MeshLambertMaterial({ color: '#55EFC4' });
    const park = new THREE.Mesh(parkGeo, parkMat);
    park.position.y = 0.15;
    park.receiveShadow = true;
    centerGroup.add(park);

    // Fountain Basin
    const basinGeo = new THREE.CylinderGeometry(3.5, 3.8, 0.45, 24);
    const basinMat = new THREE.MeshLambertMaterial({ color: '#DFE6E9' });
    const basin = new THREE.Mesh(basinGeo, basinMat);
    basin.position.y = 0.35;
    centerGroup.add(basin);

    // Water Surface
    const waterGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.1, 24);
    const waterMat = new THREE.MeshLambertMaterial({
      color: '#0984E3',
      emissive: '#74B9FF',
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.85
    });
    this.fountainRipples = new THREE.Mesh(waterGeo, waterMat);
    this.fountainRipples.position.y = 0.55;
    centerGroup.add(this.fountainRipples);

    // Center Gold Billionaire Statue
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.0, 0.8, 16),
      new THREE.MeshLambertMaterial({ color: '#B2BEC3' })
    );
    pedestal.position.y = 0.9;

    const statueBody = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 1.2, 16),
      new THREE.MeshLambertMaterial({ color: '#FDCB6E', emissive: '#FDCB6E', emissiveIntensity: 0.2 })
    );
    statueBody.position.y = 1.9;

    const statueHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 16),
      new THREE.MeshLambertMaterial({ color: '#FDCB6E', emissive: '#FDCB6E', emissiveIntensity: 0.3 })
    );
    statueHead.position.y = 2.6;

    const topHat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.3, 12),
      new THREE.MeshLambertMaterial({ color: '#2D3436' })
    );
    topHat.position.y = 2.9;

    centerGroup.add(pedestal, statueBody, statueHead, topHat);

    // Decorative Chunky Trees around park
    const treePositions = [
      [-6, -4], [-5.5, 5], [5.5, -5.5], [6, 4.5]
    ];
    treePositions.forEach(([tx, tz]) => {
      const tree = new THREE.Group();
      tree.position.set(tx, 0.3, tz);

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.24, 0.8, 8),
        new THREE.MeshLambertMaterial({ color: '#A0522D' })
      );
      trunk.position.y = 0.4;

      const canopy = new THREE.Mesh(
        new THREE.SphereGeometry(0.75, 12, 12),
        new THREE.MeshLambertMaterial({ color: '#00B894' })
      );
      canopy.position.y = 1.2;
      canopy.scale.set(1, 1.2, 1);

      tree.add(trunk, canopy);
      centerGroup.add(tree);
    });

    this.scene.add(centerGroup);
  }

  public initBoard(tiles: BoardTileMeta[]) {
    const halfSide = 10;
    const boardSize = 24; // Board width
    const cornerSize = 3.2;
    const normalWidth = (boardSize - cornerSize * 2) / 9; // ~1.95 units per tile
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
        // Corner GO (Bottom-Right)
        x = boardSize / 2 - cornerSize / 2;
        z = boardSize / 2 - cornerSize / 2;
        w = cornerSize;
        l = cornerSize;
        angle = -Math.PI / 4;
      } else if (i > 0 && i < 10) {
        // Bottom side (Right to Left)
        const offset = (i - 1) * normalWidth + normalWidth / 2;
        x = (boardSize / 2 - cornerSize) - offset;
        z = boardSize / 2 - cornerSize / 2;
        w = normalWidth;
        l = cornerSize;
        angle = 0;
      } else if (i === 10) {
        // Corner JAIL (Bottom-Left)
        x = -(boardSize / 2 - cornerSize / 2);
        z = boardSize / 2 - cornerSize / 2;
        w = cornerSize;
        l = cornerSize;
        angle = Math.PI / 4;
      } else if (i > 10 && i < 20) {
        // Left side (Bottom to Top)
        const offset = (i - 11) * normalWidth + normalWidth / 2;
        x = -(boardSize / 2 - cornerSize / 2);
        z = (boardSize / 2 - cornerSize) - offset;
        w = cornerSize;
        l = normalWidth;
        angle = Math.PI / 2;
      } else if (i === 20) {
        // Corner FREE PARKING (Top-Left)
        x = -(boardSize / 2 - cornerSize / 2);
        z = -(boardSize / 2 - cornerSize / 2);
        w = cornerSize;
        l = cornerSize;
        angle = (3 * Math.PI) / 4;
      } else if (i > 20 && i < 30) {
        // Top side (Left to Right)
        const offset = (i - 21) * normalWidth + normalWidth / 2;
        x = -(boardSize / 2 - cornerSize) + offset;
        z = -(boardSize / 2 - cornerSize / 2);
        w = normalWidth;
        l = cornerSize;
        angle = Math.PI;
      } else if (i === 30) {
        // Corner GO TO JAIL (Top-Right)
        x = boardSize / 2 - cornerSize / 2;
        z = -(boardSize / 2 - cornerSize / 2);
        w = cornerSize;
        l = cornerSize;
        angle = -(3 * Math.PI) / 4;
      } else {
        // Right side (Top to Bottom)
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

      // Create Tile 3D Mesh
      const tileGroup = new THREE.Group();
      tileGroup.position.copy(pos);

      // Base tile platform
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

      // Tile Label / Icon Canvas Texture
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
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, 256, 256);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (tile.type === 'GO') {
      ctx.fillStyle = '#00B894';
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText('GO', 128, 90);
      ctx.font = '22px sans-serif';
      ctx.fillText('+200M', 128, 150);
    } else if (tile.type === 'JAIL') {
      ctx.fillStyle = '#E17055';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('NHÀ TÙ', 128, 100);
      ctx.font = '20px sans-serif';
      ctx.fillText('Thăm tù', 128, 150);
    } else if (tile.type === 'GO_TO_JAIL') {
      ctx.fillStyle = '#D63031';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('VÀO TÙ', 128, 110);
      ctx.font = '32px sans-serif';
      ctx.fillText('🚨', 128, 160);
    } else if (tile.type === 'FREE_PARKING') {
      ctx.fillStyle = '#0984E3';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('ĐỖ XE', 128, 95);
      ctx.font = '20px sans-serif';
      ctx.fillText('Miễn phí', 128, 145);
    } else if (tile.type === 'CHANCE') {
      ctx.fillStyle = '#E84393';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('?', 128, 100);
      ctx.font = '22px sans-serif';
      ctx.fillText('Cơ Hội', 128, 160);
    } else if (tile.type === 'COMMUNITY_CHEST') {
      ctx.fillStyle = '#FDCB6E';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('🎁', 128, 95);
      ctx.font = '22px sans-serif';
      ctx.fillText('Khí Vận', 128, 155);
    } else if (tile.type === 'TAX') {
      ctx.fillStyle = '#D63031';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(tile.name, 128, 100);
      ctx.font = '22px sans-serif';
      ctx.fillText('-100M', 128, 150);
    } else {
      // Normal Property / Railroad
      ctx.fillStyle = '#2D3436';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(tile.name, 128, 120);

      if (tile.price > 0) {
        ctx.fillStyle = '#00B894';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`${tile.price}M`, 128, 175);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    const planeGeo = new THREE.PlaneGeometry(Math.min(w, l) * 0.9, Math.min(w, l) * 0.9);
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

  private onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.cameraManager.onResize();
  }

  private animate() {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();

    this.dicePhysics.update(delta);
    this.cameraManager.update();

    if (this.fountainRipples) {
      this.fountainRipples.rotation.y += delta * 0.5;
    }

    this.renderer.render(this.scene, this.cameraManager.camera);
  }
}
