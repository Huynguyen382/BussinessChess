import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { TextureGenerator } from './TextureGenerator';
import { DetailedModels } from './DetailedModels';
import { LandmarkModels } from './LandmarkModels';

/**
 * Quản lý bối cảnh môi trường 3D studio, bệ bàn cờ, phụ kiện bàn gỗ và đại lộ công viên trung tâm.
 */
export class BoardEnvironment {
  private scene: THREE.Scene;

  // Center Park Diorama Anim Objects
  public fountainRipples: THREE.Mesh | null = null;
  public fountainWaterfalls: THREE.Mesh[] = [];
  public fountainWaterJets: THREE.Mesh[] = [];
  public fountainSpray: THREE.Points | null = null;
  public miniTaxi: THREE.Group | null = null;
  public miniBus: THREE.Group | null = null;
  public taxiAngle = 0;
  public parkTrees: THREE.Group[] = [];

  // Tabletop Studio Ambient Objects
  public ambientDustMotes: THREE.Points | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.setupStudioEnvironment();
    this.setupBoardPlinth();
    this.setupStreetLamps();
    this.setupCenterDiorama();
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

    // Dark Walnut Wood Platform bề thế ôm trọn bàn cờ 24x24
    const baseGeo = new RoundedBoxGeometry(26.2, 0.75, 26.2, 4, 0.16);
    const baseMat = new THREE.MeshStandardMaterial({
      color: '#1E272E',
      roughness: 0.38,
      metalness: 0.12
    });
    const plinth = new THREE.Mesh(baseGeo, baseMat);
    plinth.position.y = -0.38;
    plinth.receiveShadow = true;
    plinthGroup.add(plinth);

    // Gold Trim Inlay bao quanh 4 mép bàn cờ
    const trimGeo = new THREE.BoxGeometry(26.5, 0.1, 26.5);
    const trimMat = new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F39C12',
      emissiveIntensity: 0.32,
      metalness: 0.88,
      roughness: 0.16
    });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.y = -0.02;
    plinthGroup.add(trim);

    // Soft drop shadow siêu thực tỏa ra mặt bàn gỗ
    const shadowGeo = new THREE.PlaneGeometry(33, 33);
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

    const shadowMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      depthWrite: false
    });
    const groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.y = -0.74;
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

  // 4. Center Park Diorama: Đài Phun Nước Đẳng Cấp, Cây Đa Tầng & Xe Taxi
  private setupCenterDiorama() {
    const centerGroup = new THREE.Group();

    // 1. Đại Lộ Nhựa Đường Đô Thị (Asphalt City Avenue) bao quanh giữa công viên và 40 ô cờ
    const avenueGeo = new THREE.RingGeometry(5.8, 8.75, 48);
    const avenueMat = new THREE.MeshStandardMaterial({
      color: '#2F3542',
      roughness: 0.72,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const avenue = new THREE.Mesh(avenueGeo, avenueMat);
    avenue.rotation.x = -Math.PI / 2;
    avenue.position.y = 0.16;
    avenue.receiveShadow = true;
    centerGroup.add(avenue);

    // Vạch kẻ tim đường vàng đứt khúc (Yellow Dashed Centerline)
    const dashLineMat = new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F1C40F',
      emissiveIntensity: 0.35,
      side: THREE.DoubleSide
    });
    const dashCount = 28;
    for (let d = 0; d < dashCount; d++) {
      if (d % 2 === 0) {
        const theta1 = (d / dashCount) * Math.PI * 2;
        const theta2 = ((d + 0.65) / dashCount) * Math.PI * 2;
        const dashGeo = new THREE.RingGeometry(7.22, 7.38, 4, 1, theta1, theta2 - theta1);
        const dashMesh = new THREE.Mesh(dashGeo, dashLineMat);
        dashMesh.rotation.x = -Math.PI / 2;
        dashMesh.position.y = 0.165;
        centerGroup.add(dashMesh);
      }
    }

    // 4 Vạch Kẻ Sang Đường Cho Người Đi Bộ (Zebra Crossings) tại 4 góc tiếp giáp ô góc
    const zebraWhite = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.4, side: THREE.DoubleSide });
    const crossAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    crossAngles.forEach(ca => {
      const zebraGroup = new THREE.Group();
      zebraGroup.position.set(Math.cos(ca) * 7.3, 0.168, Math.sin(ca) * 7.3);
      zebraGroup.rotation.y = -ca;
      for (let z = -0.45; z <= 0.45; z += 0.18) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 1.45), zebraWhite);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(z, 0, 0);
        zebraGroup.add(stripe);
      }
      centerGroup.add(zebraGroup);
    });

    // 2. Park Grass Base với gờ viền mềm
    const parkGeo = new THREE.CylinderGeometry(5.4, 5.7, 0.3, 36);
    const parkMat = new THREE.MeshStandardMaterial({ color: '#55EFC4', roughness: 0.5 });
    const park = new THREE.Mesh(parkGeo, parkMat);
    park.position.y = 0.15;
    park.receiveShadow = true;
    centerGroup.add(park);

    // Lối đi dạo quanh công viên lát sỏi
    const pathGeo = new THREE.RingGeometry(3.3, 4.2, 36);
    const pathMat = new THREE.MeshStandardMaterial({ color: '#FFEAA7', roughness: 0.6, side: THREE.DoubleSide });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.y = 0.31;
    centerGroup.add(path);

    // Ghế Băng Công Viên Cổ Điển London bằng Gỗ Sồi & Chân Sắt Uốn
    for (let b = 0; b < 4; b++) {
      const angle = (b / 4) * Math.PI * 2 + Math.PI / 4;
      const bench = DetailedModels.createParkBench();
      bench.scale.set(0.85, 0.85, 0.85);
      bench.position.set(Math.cos(angle) * 3.75, 0.32, Math.sin(angle) * 3.75);
      bench.rotation.y = -angle + Math.PI / 2;
      centerGroup.add(bench);
    }

    // 4 Cột Đèn Đường Cổ Điển Dọc Lối Đi Dạo Công Viên
    for (let l = 0; l < 4; l++) {
      const lAngle = (l / 4) * Math.PI * 2;
      const pLamp = DetailedModels.createStreetLamp();
      pLamp.scale.set(0.65, 0.65, 0.65);
      pLamp.position.set(Math.cos(lAngle) * 4.4, 0.32, Math.sin(lAngle) * 4.4);
      pLamp.rotation.y = -lAngle - Math.PI / 2;
      centerGroup.add(pLamp);
    }

    // 🚕 Xe Taxi Vàng Mini Chạy Trên Đại Lộ Đô Thị
    this.miniTaxi = new THREE.Group();
    this.miniTaxi.add(LandmarkModels.createContactShadow(0.85, 0.52, 0.5));

    const taxiBody = new THREE.Mesh(
      new RoundedBoxGeometry(0.66, 0.26, 0.38, 3, 0.05),
      new THREE.MeshStandardMaterial({ color: '#F1C40F', roughness: 0.25, metalness: 0.1 })
    );
    taxiBody.position.y = 0.2;
    taxiBody.castShadow = true;

    const taxiCabin = new THREE.Mesh(
      new RoundedBoxGeometry(0.38, 0.2, 0.32, 2, 0.04),
      new THREE.MeshStandardMaterial({ color: '#2D3436', roughness: 0.2 })
    );
    taxiCabin.position.set(-0.04, 0.38, 0);

    const taxiSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.07, 0.16),
      new THREE.MeshStandardMaterial({ color: '#FFFFFF', emissive: '#F1C40F', emissiveIntensity: 0.9 })
    );
    taxiSign.position.set(-0.04, 0.52, 0);

    // Bánh xe cao su & mâm mạ bạc
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#1E272E', roughness: 0.6 });
    const hubMat = new THREE.MeshStandardMaterial({ color: '#DFE6E9', metalness: 0.85, roughness: 0.15 });
    const wheelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12);
    wheelGeo.rotateX(Math.PI / 2);
    const hubGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.062, 10);
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

    // Đèn pha trước vàng sáng rực
    const headLightMat = new THREE.MeshStandardMaterial({
      color: '#FFEAA7',
      emissive: '#FFEAA7',
      emissiveIntensity: 1.2
    });
    const headLightGeo = new THREE.BoxGeometry(0.02, 0.06, 0.08);
    const hl1 = new THREE.Mesh(headLightGeo, headLightMat);
    hl1.position.set(0.33, 0.18, 0.12);
    const hl2 = new THREE.Mesh(headLightGeo, headLightMat);
    hl2.position.set(0.33, 0.18, -0.12);

    // Đèn hậu đỏ ruby
    const tailLightMat = new THREE.MeshStandardMaterial({
      color: '#D63031',
      emissive: '#D63031',
      emissiveIntensity: 1.0
    });
    const tl1 = new THREE.Mesh(headLightGeo, tailLightMat);
    tl1.position.set(-0.33, 0.18, 0.12);
    const tl2 = new THREE.Mesh(headLightGeo, tailLightMat);
    tl2.position.set(-0.33, 0.18, -0.12);

    this.miniTaxi.add(taxiBody, taxiCabin, taxiSign, hl1, hl2, tl1, tl2);
    this.miniTaxi.position.set(7.35, 0.15, 0);
    centerGroup.add(this.miniTaxi);

    // 🚌 Xe Buýt Mini Xanh Ngọc (Mint City Transit) chạy làn đối diện
    this.miniBus = new THREE.Group();
    this.miniBus.add(LandmarkModels.createContactShadow(1.1, 0.56, 0.5));

    const busBodyMat = new THREE.MeshStandardMaterial({ color: '#00CEC9', roughness: 0.28 });
    const busBody = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.38, 0.42, 3, 0.06), busBodyMat);
    busBody.position.y = 0.28;
    busBody.castShadow = true;

    // Nóc xe trắng tinh khôi bo tròn
    const busRoofMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.22 });
    const busRoof = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.08, 0.4, 2, 0.04), busRoofMat);
    busRoof.position.y = 0.49;

    // Dải cửa sổ kính đen sang trọng
    const busWindowMat = new THREE.MeshStandardMaterial({ color: '#1E272E', roughness: 0.15 });
    const busWindows = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.14, 0.43), busWindowMat);
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
    centerGroup.add(this.miniBus);

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
      bush.position.set(Math.cos(fAngle) * 3.3, 0.3, Math.sin(fAngle) * 3.3);
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

    // 🌳 4 CÂY CÔNG VIÊN CAO CẤP ĐA TẦNG LÁ MÂY BỒNG BỀNH
    const treePositions = [
      [-6, -4.5], [-5.5, 5], [5.5, -5.5], [6, 4.5]
    ];
    this.parkTrees = [];
    treePositions.forEach(([tx, tz]) => {
      const tree = DetailedModels.createStylizedTree();
      tree.position.set(tx, 0.3, tz);
      this.parkTrees.push(tree);
      centerGroup.add(tree);
    });

    this.scene.add(centerGroup);
  }

  public update(delta: number, elapsedTime: number) {
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

    // Xe taxi vàng mini chạy vòng quanh đại lộ đô thị
    if (this.miniTaxi) {
      this.taxiAngle += delta * 0.35;
      const radius = 7.35;
      this.miniTaxi.position.x = Math.cos(this.taxiAngle) * radius;
      this.miniTaxi.position.z = Math.sin(this.taxiAngle) * radius;
      this.miniTaxi.rotation.y = -this.taxiAngle - Math.PI / 2;
    }

    // Xe buýt mini xanh ngọc chạy vòng quanh đại lộ đô thị (làn đối diện)
    if (this.miniBus) {
      const busAngle = this.taxiAngle + Math.PI;
      const radius = 7.35;
      this.miniBus.position.x = Math.cos(busAngle) * radius;
      this.miniBus.position.z = Math.sin(busAngle) * radius;
      this.miniBus.rotation.y = -busAngle - Math.PI / 2;
    }

    // Tán cây công viên đung đưa theo gió
    this.parkTrees.forEach((tree, idx) => {
      tree.rotation.z = Math.sin(elapsedTime * 1.8 + idx * 1.5) * 0.035;
    });

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
  }
}
