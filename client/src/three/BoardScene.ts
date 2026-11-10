import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { CameraManager } from './CameraManager';
import { TokenManager } from './TokenManager';
import { DicePhysics } from './DicePhysics';
import { BuildingMesh } from './BuildingMesh';
import { VFXManager } from './VFXManager';
import { TextureGenerator } from './TextureGenerator';
import { DetailedModels } from './DetailedModels';
import { LandmarkModels } from './LandmarkModels';
import { BoardEnvironment } from './BoardEnvironment';
import { DEFAULT_BOARD_TILES, BoardTileMeta } from '../config/BoardConfig';
import { sounds } from '../components/AudioSynth';

export class BoardScene {
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public cameraManager: CameraManager;
  public tokenManager: TokenManager;
  public dicePhysics: DicePhysics;
  public buildingMesh: BuildingMesh;
  public vfxManager: VFXManager;
  public environment: BoardEnvironment;

  public boardTiles: BoardTileMeta[] = [];
  public onTileClick: ((tileId: number, tile: BoardTileMeta) => void) | null = null;
  private tileMeshList: { mesh: THREE.Mesh; tileId: number }[] = [];
  private highlightBox: THREE.Mesh | null = null;
  private tilesParentGroup = new THREE.Group();

  private tilePositions: THREE.Vector3[] = [];
  private tileRotations: number[] = [];
  private animatedLandmarks: THREE.Group[] = [];
  private tileLandmarkMap: Map<number, THREE.Group> = new Map();

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
    this.scene.add(this.tilesParentGroup);

    this.setupLighting();
    this.environment = new BoardEnvironment(this.scene);

    // Initialize 40 tiles immediately
    this.initBoard(DEFAULT_BOARD_TILES);

    this.setupTileRaycaster(container);

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    window.addEventListener('resize', this.onResize.bind(this));
  }

  // Tương tác chạm/click để tra cứu chi tiết tức thì bất kỳ ô nào trên bàn cờ
  private setupTileRaycaster(_container: HTMLElement) {
    let downX = 0;
    let downY = 0;

    this.renderer.domElement.addEventListener('pointerdown', (e) => {
      downX = e.clientX;
      downY = e.clientY;
    });

    const getIntersectedTileId = (e: MouseEvent | PointerEvent): number | null => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.cameraManager.camera);

      // Raycast sâu vào mọi chi tiết thuộc các ô cờ (kể cả Landmark 3D, mái chùa, đầu tàu hỏa, hoa cẩm tú cầu)
      const intersects = raycaster.intersectObjects(this.tilesParentGroup.children, true);
      if (intersects.length > 0) {
        let cur: THREE.Object3D | null = intersects[0].object;
        while (cur && cur !== this.tilesParentGroup) {
          if (cur.userData && typeof cur.userData.tileId === 'number') {
            return cur.userData.tileId;
          }
          cur = cur.parent;
        }
      }
      return null;
    };

    this.renderer.domElement.addEventListener('pointerup', (e) => {
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist > 8) return; // Kéo xoay màn hình, không phải click chọn

      const tileId = getIntersectedTileId(e);
      if (tileId !== null && this.boardTiles[tileId]) {
        const tile = this.boardTiles[tileId];
        sounds.playTap();
        this.highlightTile(tileId);
        if (this.onTileClick) {
          this.onTileClick(tileId, tile);
        }
      }
    });

    // Con trỏ bàn tay (cursor pointer) khi rê chuột qua bất kỳ danh thắng hoặc ô cờ nào
    this.renderer.domElement.addEventListener('pointermove', (e) => {
      const tileId = getIntersectedTileId(e);
      this.renderer.domElement.style.cursor = tileId !== null ? 'pointer' : 'default';
    });
  }

  // Hộp chỉ thị màu vàng viền sáng nổi bật ô đang được chọn & nảy đàn hồi mô hình 3D
  public highlightTile(tileId: number) {
    const pos = this.tilePositions[tileId];
    if (!pos) return;
    if (!this.highlightBox) {
      const geo = new RoundedBoxGeometry(2.3, 0.45, 3.5, 3, 0.08);
      const mat = new THREE.MeshStandardMaterial({
        color: '#F1C40F',
        emissive: '#F1C40F',
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.45
      });
      this.highlightBox = new THREE.Mesh(geo, mat);
      this.scene.add(this.highlightBox);
    }
    this.highlightBox.position.set(pos.x, 0.22, pos.z);
    this.highlightBox.rotation.y = this.tileRotations[tileId] || 0;
    this.highlightBox.visible = true;

    // Kích hoạt phản hồi xúc giác 3D nhún nảy (Juicy Spring Bounce) cho mô hình danh thắng
    const lm = this.tileLandmarkMap.get(tileId);
    if (lm) {
      this.bounceLandmark(lm);
    }
  }

  private bounceLandmark(lm: THREE.Group) {
    if (lm.userData.__bounceInterval) {
      clearInterval(lm.userData.__bounceInterval);
      if (lm.userData.__baseScale !== undefined) {
        lm.scale.setScalar(lm.userData.__baseScale);
      }
    }
    if (lm.userData.__baseScale === undefined) {
      lm.userData.__baseScale = lm.scale.x;
    }
    const baseScale = lm.userData.__baseScale;
    let t = 0;
    const interval = setInterval(() => {
      t += 0.12;
      const factor = 1 + Math.sin(t * Math.PI) * 0.28;
      if (t >= 1) {
        lm.scale.set(baseScale, baseScale, baseScale);
        clearInterval(interval);
        lm.userData.__bounceInterval = null;
      } else {
        const s = baseScale * factor;
        lm.scale.set(s, s, s);
      }
    }, 16);
    lm.userData.__bounceInterval = interval;
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

  public initBoard(tiles: BoardTileMeta[]) {
    const boardSize = 24;
    const cornerSize = 3.2;
    const normalWidth = (boardSize - cornerSize * 2) / 9;
    const tileHeight = 0.3;

    this.tilePositions = new Array(40);
    this.tileRotations = new Array(40);

    const TILE_LANDMARKS: Record<number, { icon: string; subtitle: string }> = {
      1: { icon: '🛶', subtitle: 'Chợ Nổi Cái Răng' },
      2: { icon: '🎁', subtitle: 'Hòm Khí Vận' },
      3: { icon: '⛵', subtitle: 'Mũi Cực Nam Tổ Quốc' },
      4: { icon: '👛', subtitle: 'Thuế Nhà Nước' },
      5: { icon: '🚌', subtitle: 'Bến Xe Khách Miền Tây' },
      6: { icon: '🗼', subtitle: 'Hải Đăng Núi Nhỏ' },
      7: { icon: '❓', subtitle: 'Thẻ May Rủi' },
      8: { icon: '🏜️', subtitle: 'Tháp Chăm Poshanư' },
      9: { icon: '🪷', subtitle: 'Tháp Trầm Hương' },
      11: { icon: '🌸', subtitle: 'Ga Cổ & Rừng Thông' },
      12: { icon: '💡', subtitle: 'Lưới Điện Quốc Gia' },
      13: { icon: '☕', subtitle: 'Nhà Rông & Cồng Chiêng' },
      14: { icon: '🌲', subtitle: 'Biển Hồ Tơ Nưng' },
      15: { icon: '🚂', subtitle: 'Ga Sài Gòn' },
      16: { icon: '🏯', subtitle: 'Tháp Đôi & Eo Gió' },
      17: { icon: '🎁', subtitle: 'Hòm Khí Vận' },
      18: { icon: '🏮', subtitle: 'Chùa Cầu Hội An' },
      19: { icon: '🌉', subtitle: 'Cầu Rồng Sông Hàn' },
      21: { icon: '🏯', subtitle: 'Ngọ Môn Cố Đô Huế' },
      22: { icon: '❓', subtitle: 'Thẻ May Rủi' },
      23: { icon: '🏞️', subtitle: 'Kỳ Quan Sơn Đoòng' },
      24: { icon: '🏝️', subtitle: 'Đảo Lan Châu' },
      25: { icon: '🚂', subtitle: 'Ga Đà Nẵng' },
      26: { icon: '🌉', subtitle: 'Cầu Hoàng Văn Thụ' },
      27: { icon: '⛵', subtitle: 'Hòn Trống Mái' },
      28: { icon: '💧', subtitle: 'Nguồn Nước Tinh Khiết' },
      29: { icon: '🐉', subtitle: 'Đỉnh Ngọa Long' },
      31: { icon: '🪷', subtitle: 'Chùa Trấn Quốc' },
      32: { icon: '🏮', subtitle: 'Cửa Ô Quan Chưởng' },
      33: { icon: '🎁', subtitle: 'Hòm Khí Vận' },
      34: { icon: '🇻🇳', subtitle: 'Cột Cờ Hà Nội' },
      35: { icon: '🚂', subtitle: 'Ga Hà Nội' },
      36: { icon: '❓', subtitle: 'Thẻ May Rủi' },
      37: { icon: '🏙️', subtitle: 'Tháp Bó Tre 81 Tầng' },
      38: { icon: '💎', subtitle: 'Thuế Siêu Xa Xỉ' },
      39: { icon: '🏛️', subtitle: 'Chợ Bến Thành' }
    };

    this.boardTiles = tiles;
    this.tilesParentGroup.clear();
    this.tileMeshList = [];
    this.animatedLandmarks = [];
    this.tileLandmarkMap.clear();

    const baseMat = LandmarkModels.getMat('boardTileBaseMat', () => new THREE.MeshStandardMaterial({
      color: '#FCFCFC',
      roughness: 0.28,
      metalness: 0.04
    }));
    const cornerPlinthMat = LandmarkModels.getMat('boardCornerPlinthMat', () => new THREE.MeshStandardMaterial({
      color: '#2D3436',
      metalness: 0.75,
      roughness: 0.3
    }));

    for (let i = 0; i < 40; i++) {
      const tile = tiles[i];
      let x = 0;
      let z = 0;
      let angle = 0;
      const isCorner = (i === 0 || i === 10 || i === 20 || i === 30);

      if (i === 0) {
        x = boardSize / 2 - cornerSize / 2;
        z = boardSize / 2 - cornerSize / 2;
        angle = -Math.PI / 4;
      } else if (i > 0 && i < 10) {
        // Cạnh Đáy (Nam): x chạy từ phải sang trái, nhìn thẳng từ camera
        const offset = (i - 1) * normalWidth + normalWidth / 2;
        x = (boardSize / 2 - cornerSize) - offset;
        z = boardSize / 2 - cornerSize / 2;
        angle = 0;
      } else if (i === 10) {
        x = -(boardSize / 2 - cornerSize / 2);
        z = boardSize / 2 - cornerSize / 2;
        angle = Math.PI / 4;
      } else if (i > 10 && i < 20) {
        // Cạnh Trái (Tây): z chạy từ dưới lên trên
        const offset = (i - 11) * normalWidth + normalWidth / 2;
        x = -(boardSize / 2 - cornerSize / 2);
        z = (boardSize / 2 - cornerSize) - offset;
        angle = -Math.PI / 2;
      } else if (i === 20) {
        x = -(boardSize / 2 - cornerSize / 2);
        z = -(boardSize / 2 - cornerSize / 2);
        angle = (3 * Math.PI) / 4;
      } else if (i > 20 && i < 30) {
        // Cạnh Đỉnh (Bắc): x chạy từ trái sang phải
        // GÓC XOAY ĐỘT PHÁ: angle = 0 giúp toàn bộ chữ ở cạnh Bắc luôn đứng thẳng 100%
        const offset = (i - 21) * normalWidth + normalWidth / 2;
        x = -(boardSize / 2 - cornerSize) + offset;
        z = -(boardSize / 2 - cornerSize / 2);
        angle = 0;
      } else if (i === 30) {
        x = boardSize / 2 - cornerSize / 2;
        z = -(boardSize / 2 - cornerSize / 2);
        angle = -(3 * Math.PI) / 4;
      } else {
        // Cạnh Phải (Đông): z chạy từ trên xuống dưới
        const offset = (i - 31) * normalWidth + normalWidth / 2;
        x = boardSize / 2 - cornerSize / 2;
        z = -(boardSize / 2 - cornerSize) + offset;
        angle = Math.PI / 2;
      }

      const pos = new THREE.Vector3(x, 0.15, z);
      this.tilePositions[i] = pos;
      this.tileRotations[i] = angle;

      const tileGroup = new THREE.Group();
      tileGroup.position.copy(pos);
      tileGroup.rotation.y = angle;
      tileGroup.userData = { tileId: i };

      if (isCorner) {
        // ==========================================
        // 🏰 Ô GÓC 3.2 x 3.2: SA BÀN ĐẠI CÔNG TRÌNH 3D (TIER 1)
        // ==========================================
        // 1. Chân đế đá hoa cương viền dày chịu lực
        const plinthMesh = new THREE.Mesh(
          new RoundedBoxGeometry(cornerSize * 0.99, tileHeight * 0.45, cornerSize * 0.99, 3, 0.04),
          cornerPlinthMat
        );
        plinthMesh.position.y = -tileHeight * 0.26;
        plinthMesh.receiveShadow = true;
        tileGroup.add(plinthMesh);

        // 2. Mặt đá chính
        const baseGeo = new RoundedBoxGeometry(cornerSize * 0.96, tileHeight, cornerSize * 0.96, 4, 0.08);
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.receiveShadow = true;
        tileGroup.add(baseMesh);
        this.tileMeshList.push({ mesh: baseMesh, tileId: i });

        // 3. Nhãn ô góc
        const cornerLabel = this.createCornerLabel(tile, cornerSize * 0.95, cornerSize * 0.95);
        cornerLabel.position.y = tileHeight / 2 + 0.004;
        cornerLabel.rotation.x = -Math.PI / 2;
        tileGroup.add(cornerLabel);

        // 4. Mô hình 3D ô góc chi tiết cao cấp
        let corner3D: THREE.Group | null = null;
        if (i === 0) corner3D = LandmarkModels.createGOCorner();
        else if (i === 10) corner3D = LandmarkModels.createJailCorner();
        else if (i === 20) corner3D = LandmarkModels.createFreeParkingCorner();
        else if (i === 30) corner3D = LandmarkModels.createGoToJailCorner();

        if (corner3D) {
          corner3D.position.set(0, tileHeight / 2 + 0.010, 0);
          tileGroup.add(corner3D);
          this.animatedLandmarks.push(corner3D);
          this.tileLandmarkMap.set(i, corner3D);
        }
      } else {
        // ==========================================
        // 🏙️ Ô THƯỜNG 1.95 x 3.2: ĐẾ ĐA TẦNG & MODEL DANH THẮNG 3D
        // ==========================================
        const isSide3 = (i > 20 && i < 30);
        const subPlinthColor = tile.districtColor || (tile.type === 'RAILROAD' ? '#2F3542' : tile.type === 'UTILITY' ? '#0984E3' : tile.type === 'TAX' ? (i === 38 ? '#6C5CE7' : '#D63031') : '#BDC3C7');
        const subPlinthMat = LandmarkModels.getMat(`subPlinth_${subPlinthColor}`, () => new THREE.MeshStandardMaterial({
          color: subPlinthColor,
          roughness: 0.35,
          metalness: 0.25
        }));

        // 1. Đế chân giật cấp viền màu phân khu (Sub-plinth)
        const subPlinth = new THREE.Mesh(
          new RoundedBoxGeometry(normalWidth * 0.99, tileHeight * 0.45, cornerSize * 0.99, 3, 0.04),
          subPlinthMat
        );
        subPlinth.position.y = -tileHeight * 0.26;
        subPlinth.receiveShadow = true;
        tileGroup.add(subPlinth);

        // 2. Thân ô đá trắng bo góc
        const baseGeo = new RoundedBoxGeometry(normalWidth * 0.96, tileHeight, cornerSize * 0.96, 4, 0.08);
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.receiveShadow = true;
        tileGroup.add(baseMesh);
        this.tileMeshList.push({ mesh: baseMesh, tileId: i });

        // 3. Mặt ô cờ đồ họa phẳng cao cấp (Flat-Luxury Graphic Tile) tích hợp vạch phân làn & gờ nổi
        const lm = TILE_LANDMARKS[i] || { icon: '📍', subtitle: 'Bất Động Sản' };
        const labelMesh = this.createTileLabel(tile, lm, normalWidth * 0.95, cornerSize * 0.95);
        labelMesh.position.y = tileHeight / 2 + 0.004;
        labelMesh.rotation.x = -Math.PI / 2;
        tileGroup.add(labelMesh);

        // 4. MÔ HÌNH 3D ĐỘC BẢN: Chỉ gắn cho 22 Địa Danh (TIER 1) và 4 Ga Tàu Hỏa (TIER 3)
        // Triệt tiêu hoàn toàn 3D Clutter tại các ô Thuế, Khí Vận, Cơ Hội, Tiện Ích (TIER 4)
        let landmark3D: THREE.Group | null = null;
        if (tile.type === 'PROPERTY') {
          landmark3D = LandmarkModels.createCityLandmark(i);
        } else if (tile.type === 'RAILROAD') {
          landmark3D = LandmarkModels.createRailroadModel(i);
        }

        if (landmark3D) {
          // Đặt ở nửa sau của ô cờ (Zone B - Landmark Skyline), hoàn toàn độc lập với Zone A xây nhà
          const landmarkZ = (isSide3 ? -1 : 1) * 0.90;
          landmark3D.position.set(0, tileHeight / 2 + 0.010, landmarkZ);
          landmark3D.rotation.y = isSide3 ? Math.PI : 0;
          tileGroup.add(landmark3D);
          this.animatedLandmarks.push(landmark3D);
          this.tileLandmarkMap.set(i, landmark3D);
        }
      }

      this.tilesParentGroup.add(tileGroup);
    }

    this.tokenManager.setTilePositions(this.tilePositions);
  }

  private createTileLabel(
    tile: BoardTileMeta,
    landmark: { icon: string; subtitle: string },
    w: number,
    l: number
  ): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const headerColor = tile.districtColor || '#0984E3';

    // 1. Thẻ bài nền trắng sứ sang trọng với viền màu phân khu dày 14px cực kỳ bắt mắt
    const cardBgGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    cardBgGrad.addColorStop(0, '#FFFFFF');
    cardBgGrad.addColorStop(1, '#F8FAFC');
    ctx.fillStyle = cardBgGrad;
    this.drawRoundedRect(ctx, 10, 10, 620, 1004, 38);
    ctx.fill();

    ctx.strokeStyle = headerColor;
    ctx.lineWidth = 14;
    ctx.stroke();

    // Đường viền chỉ vàng kim mảnh bên trong tạo chiều sâu Luxury
    ctx.strokeStyle = 'rgba(241, 196, 15, 0.42)';
    ctx.lineWidth = 4;
    this.drawRoundedRect(ctx, 24, 24, 592, 976, 30);
    ctx.stroke();

    if (tile.type === 'PROPERTY') {
      // ==========================================
      // 🏰 ĐẤT BẤT ĐỘNG SẢN: Banner Màu Rộng 36% + Tên Địa Danh Siêu To
      // ==========================================
      ctx.fillStyle = headerColor;
      this.drawRoundedRect(ctx, 16, 16, 608, 360, 28);
      ctx.fill();

      // Dải bóng phản chiếu ánh sáng (Gloss Specular Strip)
      const glossGrad = ctx.createLinearGradient(0, 16, 0, 120);
      glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.48)');
      glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = glossGrad;
      this.drawRoundedRect(ctx, 20, 20, 600, 90, 20);
      ctx.fill();

      // Khung viền mảnh đánh dấu Zone A (Khu quy hoạch xây dựng BĐS)
      ctx.strokeStyle = 'rgba(45, 52, 54, 0.08)';
      ctx.lineWidth = 3;
      this.drawRoundedRect(ctx, 44, 400, 552, 405, 24);
      ctx.stroke();

      // Dòng phân khu
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 38px system-ui, -apple-system, sans-serif';
      ctx.fillText(`★ KHU VỰC ${tile.district || 1} ★`, 320, 80);

      // TÊN ĐỊA DANH SIÊU TO (Chữ Trắng Trên Nền Màu Đậm Nét Tương Phản Cực Đại)
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;

      if (tile.name.length > 9) {
        // Tên dài tự ngắt thành 2 dòng (vd: BUÔN MA / THUỘT, LANDMARK / 81, NHA TRANG)
        const parts = tile.name.split(' ');
        const mid = Math.ceil(parts.length / 2);
        const line1 = parts.slice(0, mid).join(' ');
        const line2 = parts.slice(mid).join(' ');
        ctx.font = '900 64px "Fredoka", "Arial Black", sans-serif';
        ctx.fillText(line1, 320, 180);
        ctx.fillText(line2, 320, 270);
      } else {
        ctx.font = '900 74px "Fredoka", "Arial Black", sans-serif';
        ctx.fillText(tile.name, 320, 220);
      }
      ctx.shadowBlur = 0;

      // Huy Hiệu Biểu Tượng Danh Thắng Cỡ Lớn
      ctx.fillStyle = '#F8F9FA';
      ctx.beginPath();
      ctx.arc(320, 560, 125, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = headerColor;
      ctx.lineWidth = 10;
      ctx.stroke();

      // Icon biểu tượng 3D 120px
      ctx.font = '120px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.fillText(landmark.icon, 320, 575);

      // Mô Tả Danh Thắng (Subtitle)
      ctx.fillStyle = '#2D3436';
      ctx.font = '900 36px system-ui, -apple-system, sans-serif';
      ctx.fillText(landmark.subtitle, 320, 740);

      // Hộp Giá Bán Dạng Nút Pill Nổi Bật Nền Đen Than Viền Vàng Kim
      if (tile.price > 0) {
        ctx.fillStyle = '#1E272E';
        this.drawRoundedRect(ctx, 80, 830, 480, 130, 65);
        ctx.fill();

        ctx.strokeStyle = '#F1C40F';
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.fillStyle = '#FFEAA7';
        ctx.font = '900 66px "Fredoka", sans-serif';
        ctx.fillText(`₫ ${tile.price}M`, 320, 895);
      }

    } else if (tile.type === 'RAILROAD') {
      // ==========================================
      // 🚂 GA XE LỬA / BẾN XE
      // ==========================================
      ctx.fillStyle = '#2F3542';
      this.drawRoundedRect(ctx, 16, 16, 608, 320, 28);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 36px system-ui, sans-serif';
      ctx.fillText('🚂 ĐƯỜNG SẮT VIỆT NAM', 320, 85);

      ctx.font = '900 66px "Fredoka", sans-serif';
      ctx.fillText(tile.name, 320, 205);

      // Icon Đầu Tàu Hỏa Lớn
      ctx.font = '130px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.fillText('🚂', 320, 560);

      ctx.fillStyle = '#2D3436';
      ctx.font = '900 36px system-ui, sans-serif';
      ctx.fillText(landmark.subtitle, 320, 740);

      // Giá Vé
      ctx.fillStyle = '#1E272E';
      this.drawRoundedRect(ctx, 80, 830, 480, 130, 65);
      ctx.fill();
      ctx.strokeStyle = '#F1C40F';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#FFEAA7';
      ctx.font = '900 66px "Fredoka", sans-serif';
      ctx.fillText('₫ 200M', 320, 895);

    } else if (tile.type === 'UTILITY') {
      // ==========================================
      // ⚡ TIER 4 FLAT-LUXURY: TIỆN ÍCH CÔNG CỘNG (Điện Lực 12 / Cấp Nước 28)
      // ==========================================
      const isElectric = tile.name.includes('Điện');
      const utilColor = isElectric ? '#F39C12' : '#00CEC9';
      const utilDark = isElectric ? '#D35400' : '#0984E3';

      // Khung viền sang trọng
      ctx.strokeStyle = utilColor;
      ctx.lineWidth = 14;
      this.drawRoundedRect(ctx, 10, 10, 620, 1004, 38);
      ctx.stroke();

      const bannerGrad = ctx.createLinearGradient(0, 16, 0, 336);
      bannerGrad.addColorStop(0, utilColor);
      bannerGrad.addColorStop(1, utilDark);
      ctx.fillStyle = bannerGrad;
      this.drawRoundedRect(ctx, 16, 16, 608, 320, 28);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 36px system-ui, sans-serif';
      ctx.fillText('★ TIỆN ÍCH ĐÔ THỊ ★', 320, 85);

      ctx.font = '900 66px "Fredoka", sans-serif';
      ctx.fillText(tile.name, 320, 205);

      // Huy hiệu tròn dập nổi phát sáng (Bóng đèn vàng ấm / Giọt nước pha lê xanh ngọc)
      const badgeGrad = ctx.createRadialGradient(320, 550, 20, 320, 550, 145);
      badgeGrad.addColorStop(0, isElectric ? '#FFF9C4' : '#E0F7FA');
      badgeGrad.addColorStop(1, isElectric ? '#FFEAA7' : '#81ECEC');
      ctx.fillStyle = badgeGrad;
      ctx.beginPath();
      ctx.arc(320, 550, 140, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = utilDark;
      ctx.lineWidth = 10;
      ctx.stroke();

      ctx.font = '135px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.fillText(isElectric ? '💡' : '💧', 320, 565);

      ctx.fillStyle = '#2D3436';
      ctx.font = '900 36px system-ui, sans-serif';
      ctx.fillText(landmark.subtitle, 320, 745);

      ctx.fillStyle = '#1E272E';
      this.drawRoundedRect(ctx, 80, 830, 480, 130, 65);
      ctx.fill();
      ctx.strokeStyle = '#F1C40F';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#FFEAA7';
      ctx.font = '900 66px "Fredoka", sans-serif';
      ctx.fillText('₫ 150M', 320, 895);

    } else if (tile.type === 'CHANCE') {
      // ==========================================
      // ❓ TIER 4 FLAT-LUXURY: CƠ HỘI (Thẻ Bài Cam Rực Rỡ Dập Chìm)
      // ==========================================
      const chanceGrad = ctx.createLinearGradient(0, 0, 0, 1024);
      chanceGrad.addColorStop(0, '#FF9F43');
      chanceGrad.addColorStop(1, '#E17055');
      ctx.fillStyle = chanceGrad;
      this.drawRoundedRect(ctx, 16, 16, 608, 992, 28);
      ctx.fill();

      // Khung viền kim tuyến vàng dập chìm
      ctx.strokeStyle = '#FFEAA7';
      ctx.lineWidth = 8;
      this.drawRoundedRect(ctx, 42, 42, 556, 940, 22);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 44px system-ui, sans-serif';
      ctx.fillText('★ THẺ VẬN MỆNH ★', 320, 130);

      ctx.font = '900 86px "Fredoka", sans-serif';
      ctx.fillText('CƠ HỘI', 320, 240);

      // Huy hiệu tròn dập nổi chứa dấu chấm hỏi
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(320, 550, 165, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#F1C40F';
      ctx.lineWidth = 12;
      ctx.stroke();

      ctx.fillStyle = '#E17055';
      ctx.font = '900 200px "Fredoka", sans-serif';
      ctx.fillText('?', 320, 565);

      ctx.fillStyle = '#FFEAA7';
      ctx.font = '900 44px system-ui, sans-serif';
      ctx.fillText('Rút Thẻ May Mắn', 320, 880);

    } else if (tile.type === 'COMMUNITY_CHEST') {
      // ==========================================
      // 🎁 TIER 4 FLAT-LUXURY: KHÍ VẬN (Thẻ Bài Xanh Hoàng Gia Dập Chìm)
      // ==========================================
      const chestGrad = ctx.createLinearGradient(0, 0, 0, 1024);
      chestGrad.addColorStop(0, '#0984E3');
      chestGrad.addColorStop(1, '#1E3799');
      ctx.fillStyle = chestGrad;
      this.drawRoundedRect(ctx, 16, 16, 608, 992, 28);
      ctx.fill();

      // Khung viền hoàng kim dập chìm
      ctx.strokeStyle = '#F1C40F';
      ctx.lineWidth = 8;
      this.drawRoundedRect(ctx, 42, 42, 556, 940, 22);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 44px system-ui, sans-serif';
      ctx.fillText('★ RƯƠNG HOÀNG GIA ★', 320, 130);

      ctx.font = '900 86px "Fredoka", sans-serif';
      ctx.fillText('KHÍ VẬN', 320, 240);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.beginPath();
      ctx.arc(320, 550, 165, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FDCB6E';
      ctx.lineWidth = 10;
      ctx.stroke();

      ctx.font = '175px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.fillText('🎁', 320, 560);

      ctx.fillStyle = '#FFEAA7';
      ctx.font = '900 44px system-ui, sans-serif';
      ctx.fillText('Nhận Thưởng Bất Ngờ', 320, 880);

    } else if (tile.type === 'TAX') {
      // ==========================================
      // 💎 TIER 4 FLAT-LUXURY: Ô THUẾ (Viền Đỏ/Tím Sang Trọng & Vector Dập Nổi)
      // ==========================================
      const isLuxuryTax = tile.id === 38;
      const taxPrimary = isLuxuryTax ? '#6C5CE7' : '#D63031';
      const taxSecondary = isLuxuryTax ? '#341F97' : '#B71540';

      ctx.strokeStyle = taxPrimary;
      ctx.lineWidth = 14;
      this.drawRoundedRect(ctx, 10, 10, 620, 1004, 38);
      ctx.stroke();

      const taxGrad = ctx.createLinearGradient(0, 16, 0, 336);
      taxGrad.addColorStop(0, taxPrimary);
      taxGrad.addColorStop(1, taxSecondary);
      ctx.fillStyle = taxGrad;
      this.drawRoundedRect(ctx, 16, 16, 608, 320, 28);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 36px system-ui, sans-serif';
      ctx.fillText(isLuxuryTax ? '★ THUẾ TIÊU DÙNG ★' : '★ KHO BẠC NHÀ NƯỚC ★', 320, 85);

      ctx.font = '900 66px "Fredoka", sans-serif';
      ctx.fillText(tile.name, 320, 205);

      // Huy hiệu Vector 2D dập nổi (Ví vàng hoặc Kim cương)
      ctx.fillStyle = isLuxuryTax ? '#F3E5F5' : '#FFF8E1';
      ctx.beginPath();
      ctx.arc(320, 550, 140, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#F1C40F';
      ctx.lineWidth = 10;
      ctx.stroke();

      ctx.font = '140px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.fillText(isLuxuryTax ? '💎' : '👛', 320, 565);

      ctx.fillStyle = '#2D3436';
      ctx.font = '900 36px system-ui, sans-serif';
      ctx.fillText(landmark.subtitle, 320, 745);

      ctx.fillStyle = '#FFEAEA';
      this.drawRoundedRect(ctx, 80, 830, 480, 130, 65);
      ctx.fill();
      ctx.strokeStyle = taxPrimary;
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = taxPrimary;
      ctx.font = '900 66px "Fredoka", sans-serif';
      ctx.fillText('-100M', 320, 895);
    }

    // Vạch kẻ phân làn & gờ nổi tích hợp tự nhiên vào mép ô cờ
    ctx.fillStyle = 'rgba(45, 52, 54, 0.12)';
    ctx.fillRect(40, 996, 560, 12);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    if (this.renderer) {
      texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy() || 8;
    }

    // Material nâng cấp: bật polygonOffset để triệt tiêu hoàn toàn z-fighting, không bị nhấp nháy mờ đục
    const planeGeo = new THREE.PlaneGeometry(w, l);
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
      depthWrite: false
    });
    return new THREE.Mesh(planeGeo, planeMat);
  }

  // Tạo Đồ Họa Riêng Cho 4 Ô Góc Lớn (GO, Jail, Free Parking, Go To Jail)
  private createCornerLabel(tile: BoardTileMeta, w: number, l: number): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#FFFFFF';
    this.drawRoundedRect(ctx, 16, 16, 992, 992, 48);
    ctx.fill();
    ctx.strokeStyle = '#2D3436';
    ctx.lineWidth = 14;
    ctx.stroke();

    if (tile.type === 'GO') {
      // 🏆 Ô BẮT ĐẦU (GO)
      const goGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
      goGrad.addColorStop(0, '#00B894');
      goGrad.addColorStop(1, '#00CEC9');
      ctx.fillStyle = goGrad;
      this.drawRoundedRect(ctx, 24, 24, 976, 976, 42);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 84px "Fredoka", sans-serif';
      ctx.fillText('BẮT ĐẦU', 512, 220);

      ctx.font = '900 170px "Fredoka", sans-serif';
      ctx.fillText('GO ➔', 512, 440);

      ctx.fillStyle = '#FFF275';
      this.drawRoundedRect(ctx, 160, 680, 704, 170, 85);
      ctx.fill();

      ctx.fillStyle = '#2D3436';
      ctx.font = '900 74px "Fredoka", sans-serif';
      ctx.fillText('NHẬN +200M', 512, 765);

    } else if (tile.type === 'JAIL') {
      // 🔒 Ô NHÀ TÙ (JAIL)
      ctx.fillStyle = '#636E72';
      this.drawRoundedRect(ctx, 24, 24, 976, 976, 42);
      ctx.fill();

      ctx.fillStyle = '#D63031';
      this.drawRoundedRect(ctx, 180, 180, 664, 664, 32);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 72px "Fredoka", sans-serif';
      ctx.fillText('TRONG TÙ', 512, 300);

      ctx.font = '170px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.fillText('⛓️‍💥 👮', 512, 530);

      ctx.fillStyle = '#FFEAA7';
      ctx.font = '900 68px "Fredoka", sans-serif';
      ctx.fillText('THĂM TÙ', 512, 920);

    } else if (tile.type === 'FREE_PARKING') {
      // 🅿️ Ô BÃI ĐỖ XE (FREE PARKING)
      const parkGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
      parkGrad.addColorStop(0, '#0984E3');
      parkGrad.addColorStop(1, '#74B9FF');
      ctx.fillStyle = parkGrad;
      this.drawRoundedRect(ctx, 24, 24, 976, 976, 42);
      ctx.fill();

      ctx.font = '190px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.fillText('🅿️', 512, 380);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 88px "Fredoka", sans-serif';
      ctx.fillText('BÃI ĐỖ XE', 512, 640);

      ctx.fillStyle = '#FFEAA7';
      ctx.font = '900 54px system-ui, sans-serif';
      ctx.fillText('Nghỉ Chân Miễn Phí', 512, 780);

    } else if (tile.type === 'GO_TO_JAIL') {
      // 🚨 Ô VÀO TÙ NGAY (GO TO JAIL)
      const jailGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
      jailGrad.addColorStop(0, '#D63031');
      jailGrad.addColorStop(1, '#E84118');
      ctx.fillStyle = jailGrad;
      this.drawRoundedRect(ctx, 24, 24, 976, 976, 42);
      ctx.fill();

      ctx.font = '190px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.fillText('🚨', 512, 360);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 92px "Fredoka", sans-serif';
      ctx.fillText('VÀO TÙ NGAY', 512, 620);

      ctx.fillStyle = '#FFEAA7';
      ctx.font = '900 54px system-ui, sans-serif';
      ctx.fillText('Không Được Đi Qua GO!', 512, 760);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    if (this.renderer) {
      texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy() || 8;
    }

    const planeGeo = new THREE.PlaneGeometry(w, l);
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
      depthWrite: false
    });
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

    // Cập nhật hoạt ảnh môi trường (đài phun nước, xe cộ, cây cối, khói cà phê, bụi nắng)
    this.environment.update(delta, elapsedTime);

    // Micro-animations cho các bộ phận chi tiết của các kỳ quan và mô hình trên bàn cờ
    this.animatedLandmarks.forEach((lm, idx) => {
      // Xử lý chuyển động vi mô cho các bộ phận chi tiết của kỳ quan
      lm.traverse((child) => {
        if (child.userData && child.userData.animType) {
          const type = child.userData.animType;
          if (type === 'spin_y') {
            child.rotation.y += delta * 1.5;
          } else if (type === 'rotate_pulse') {
            child.rotation.y += delta * 2.2;
            const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (mat && mat.emissiveIntensity !== undefined) {
              mat.emissiveIntensity = 0.9 + Math.sin(elapsedTime * 6) * 0.4;
            }
          } else if (type === 'flicker') {
            const scale = 1 + Math.sin(elapsedTime * 14) * 0.12;
            child.scale.set(scale, scale * (1 + Math.cos(elapsedTime * 10) * 0.1), scale);
          } else if (type === 'pulse_red') {
            const pulse = (Math.sin(elapsedTime * 10) + 1) * 0.5;
            child.scale.setScalar(0.9 + pulse * 0.25);
          } else if (type === 'lighthouse') {
            const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (mat && mat.emissiveIntensity !== undefined) {
              mat.emissiveIntensity = 0.8 + Math.sin(elapsedTime * 5 + idx) * 0.5;
            }
          } else if (type === 'float_wave') {
            child.rotation.z = Math.sin(elapsedTime * 3 + idx) * 0.06;
          }
        }
      });
    });

    this.renderer.render(this.scene, this.cameraManager.camera);
  }
}
