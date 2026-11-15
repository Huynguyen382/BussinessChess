import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { LandmarkMaterials } from './LandmarkMaterials';
import { LandmarkHelpers } from './LandmarkHelpers';

/**
 * CÁC Ô ĐẶC BIỆT TRÊN BÀN CỜ (SPECIAL TILE LANDMARKS):
 * - Tiện ích công cộng (Utilities): Thủy Điện & Lưới Điện 500kV (12), Tháp Nước Đô Thị & Nhà Máy Nước (28)
 * - Cơ Hội (Chance: 7, 22, 36) & Khí Vận (Community Chest: 2, 17, 33)
 * - Thuế (Taxes): Thuế Thu Nhập Két Sắt Ngân Hàng (4), Thuế Xa Xỉ Kim Cương Hoàng Gia (38)
 */
export class SpecialTileLandmarks {
  // =========================================================================
  // 1. TIỆN ÍCH CÔNG CỘNG: ĐIỆN LỰC (12) & NƯỚC SẠCH (28)
  // =========================================================================
  public static createUtilityModel(tileId: number): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(1.2, 1.2, 0.42));

    if (tileId === 12) {
      // ⚡ CÔNG TY ĐIỆN LỰC: Trụ điện cao thế 500kV giàn thép, trạm biến áp & cầu plasma
      const steelMat = LandmarkMaterials.getMat('sc_spec_towerSteel', () => new THREE.MeshStandardMaterial({
        color: '#94A3B8',
        metalness: 0.90,
        roughness: 0.22
      }));
      const lightningMat = LandmarkMaterials.getMat('sc_spec_lightningGold', () => new THREE.MeshStandardMaterial({
        color: '#FBBF24',
        emissive: '#F59E0B',
        emissiveIntensity: 1.35,
        roughness: 0.1
      }));
      const insuMat = LandmarkMaterials.getMat('sc_spec_insulatorTeal', () => new THREE.MeshStandardMaterial({
        color: '#06B6D4',
        roughness: 0.18,
        metalness: 0.2
      }));
      const transBodyMat = LandmarkMaterials.getMat('sc_spec_transBody', () => new THREE.MeshStandardMaterial({
        color: '#334155',
        metalness: 0.8,
        roughness: 0.3
      }));
      const warningMat = LandmarkMaterials.getMat('sc_spec_warningYellow', () => new THREE.MeshStandardMaterial({
        color: '#FACC15',
        roughness: 0.3
      }));

      // Bệ móng bê tông trạm điện
      const pad = new THREE.Mesh(new RoundedBoxGeometry(1.10, 0.06, 1.10, 2, 0.02), LandmarkMaterials.getMat('sc_spec_padConcrete', () => new THREE.MeshStandardMaterial({ color: '#64748B', roughness: 0.8 })));
      pad.position.y = 0.03;
      group.add(pad);

      // Chân trụ giàn thép 4 góc thon dần lên cao
      const legGeo = new THREE.CylinderGeometry(0.032, 0.048, 1.48, 8);
      const legPositions = [
        [-0.34, 0.76, -0.34],
        [0.34, 0.76, -0.34],
        [-0.34, 0.76, 0.34],
        [0.34, 0.76, 0.34]
      ];
      legPositions.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, steelMat);
        leg.position.set(lx * 0.75, ly, lz * 0.75);
        leg.rotation.z = -lx * 0.22;
        leg.rotation.x = lz * 0.22;
        group.add(leg);
      });

      // Thanh giằng chéo chữ X giàn thép 2 tầng (X-Bracing struts)
      [0.48, 0.92].forEach(by => {
        [-0.20, 0.20].forEach(bx => {
          const braceA = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.34, 0.016), steelMat);
          braceA.position.set(bx, by, 0);
          braceA.rotation.z = 0.6;
          const braceB = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.34, 0.016), steelMat);
          braceB.position.set(bx, by, 0);
          braceB.rotation.z = -0.6;
          group.add(braceA, braceB);
        });
      });

      // 2 Tầng xà ngang mở rộng (Crossarms)
      const crossBeam1 = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.045, 0.045), steelMat);
      crossBeam1.position.set(0, 1.18, 0);
      const crossBeam2 = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.045, 0.045), steelMat);
      crossBeam2.position.set(0, 1.38, 0);
      group.add(crossBeam1, crossBeam2);

      // Chuỗi đĩa sứ cách điện thủy tinh (Suspension Insulators)
      [-0.52, -0.36, 0.36, 0.52].forEach(ix => {
        const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.048, 0.16, 8), insuMat);
        ins.position.set(ix, 1.28, 0);
        group.add(ins);
      });

      // Khối máy biến áp trạm điện (Transformer Substation Unit) & Sứ cao thế
      const transBox = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.26, 0.28, 2, 0.02), transBodyMat);
      transBox.position.set(0, 0.19, -0.18);
      [-0.10, 0, 0.10].forEach(bx => {
        const bushing = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.032, 0.11, 8), insuMat);
        bushing.position.set(bx, 0.36, -0.18);
        const jumper = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.86, 6), lightningMat);
        jumper.position.set(bx * 2.2, 0.80, -0.09);
        jumper.rotation.x = 0.21;
        jumper.rotation.z = -bx * 1.4;
        group.add(bushing, jumper);
      });
      const radiatorL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.20, 0.24), steelMat);
      radiatorL.position.set(-0.21, 0.19, -0.18);
      const radiatorR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.20, 0.24), steelMat);
      radiatorR.position.set(0.21, 0.19, -0.18);

      // Hàng rào an toàn quanh trạm biến áp
      [-0.50, 0.50].forEach(fx => {
        [-0.50, 0.50].forEach(fz => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.16, 6), warningMat);
          post.position.set(fx, 0.14, fz);
          group.add(post);
        });
      });
      [
        [0, 0.18, 0.50, 1.0, 0.015, 0.015],
        [0, 0.18, -0.50, 1.0, 0.015, 0.015],
        [-0.50, 0.18, 0, 0.015, 0.015, 1.0],
        [0.50, 0.18, 0, 0.015, 0.015, 1.0]
      ].forEach(([rx, ry, rz, sx, sy, sz]) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), steelMat);
        rail.position.set(rx, ry, rz);
        group.add(rail);
      });

      // Biển cảnh báo điện cao thế màu vàng ("NGUY HIỂM - ĐIỆN CAO THẾ")
      const warningSign = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 0.015), warningMat);
      warningSign.position.set(0, 0.20, -0.035);

      // Quả cầu năng lượng plasma sét xoay tròn ở đỉnh tháp
      const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 1), lightningMat);
      orb.position.set(0, 1.65, 0);

      group.add(transBox, radiatorL, radiatorR, warningSign, orb);

    } else {
      // 💧 CÔNG TY CẤP NƯỚC: Tháp nước đô thị mái nón, trạm bơm & van ống nước
      const tankMat = LandmarkMaterials.getMat('sc_spec_tankAqua', () => new THREE.MeshStandardMaterial({
        color: '#0284C7',
        emissive: '#38BDF8',
        emissiveIntensity: 0.3,
        roughness: 0.18,
        metalness: 0.35
      }));
      const pipeMat = LandmarkMaterials.getMat('sc_spec_pipeChrome', () => new THREE.MeshStandardMaterial({
        color: '#E2E8F0',
        metalness: 0.92,
        roughness: 0.12
      }));
      const brickMat = LandmarkMaterials.getMat('sc_spec_pumpBrick', () => new THREE.MeshStandardMaterial({
        color: '#B45309',
        roughness: 0.75
      }));
      const valveMat = LandmarkMaterials.getMat('sc_spec_valveRed', () => new THREE.MeshStandardMaterial({
        color: '#DC2626',
        roughness: 0.25
      }));

      // Bồn chứa nước hình trụ tròn bo đáy
      const tankBody = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.74, 20), tankMat);
      tankBody.position.set(0, 1.18, 0);
      tankBody.castShadow = true;

      const tankRib = new THREE.Mesh(new THREE.TorusGeometry(0.57, 0.02, 6, 20), pipeMat);
      tankRib.rotation.x = Math.PI / 2;
      tankRib.position.set(0, 1.18, 0);

      const tankRoof = new THREE.Mesh(new THREE.ConeGeometry(0.70, 0.36, 20), tankMat);
      tankRoof.position.set(0, 1.72, 0);

      const roofBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), valveMat);
      roofBeacon.position.set(0, 1.92, 0);

      // 6 Chân kiềng chịu lực
      const strutGeo = new THREE.CylinderGeometry(0.045, 0.055, 1.08, 8);
      const strutAngles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];
      strutAngles.forEach(a => {
        const strut = new THREE.Mesh(strutGeo, pipeMat);
        strut.position.set(Math.cos(a) * 0.44, 0.54, Math.sin(a) * 0.44);
        group.add(strut);
      });

      // Ống dẫn nước chính ở tâm nối xuống mặt đất
      const mainPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.85, 14), pipeMat);
      mainPipe.position.set(0, 0.425, 0);

      // Bánh xe van điều áp màu đỏ và đồng hồ áp lực
      const valve = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 8, 16), valveMat);
      valve.position.set(0.14, 0.46, 0);
      valve.rotation.y = Math.PI / 2;

      const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 12), pipeMat);
      gauge.rotation.z = Math.PI / 2;
      gauge.position.set(0.14, 0.58, 0);

      // Hành lang bảo trì có lan can quanh đáy bồn chứa & Thang leo đứng
      const catwalk = new THREE.Mesh(new THREE.TorusGeometry(0.60, 0.025, 6, 20), pipeMat);
      catwalk.rotation.x = Math.PI / 2;
      catwalk.position.set(0, 0.82, 0);
      const handrail = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.012, 6, 20), pipeMat);
      handrail.rotation.x = Math.PI / 2;
      handrail.position.set(0, 0.94, 0);
      group.add(catwalk, handrail);

      // Thang thép leo tháp nước (Access Ladder)
      [-0.06, 0.06].forEach(lx => {
        const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.92, 6), pipeMat);
        rail.position.set(lx, 0.46, 0.56);
        group.add(rail);
      });
      for (let ry = 0.14; ry <= 0.84; ry += 0.14) {
        const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6), pipeMat);
        rung.rotation.z = Math.PI / 2;
        rung.position.set(0, ry, 0.56);
        group.add(rung);
      }

      // Trạm bơm nước mặt đất (Ground Pump Station House) có mái dốc, cửa & ống nối
      const pumpHouse = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.24, 0.34, 2, 0.02), brickMat);
      pumpHouse.position.set(-0.35, 0.12, -0.32);
      const pumpDoor = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.16, 0.02, 1, 0.005), pipeMat);
      pumpDoor.position.set(-0.35, 0.09, -0.145);
      const pumpRoof = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.14, 4), tankMat);
      pumpRoof.rotation.y = Math.PI / 4;
      pumpRoof.position.set(-0.35, 0.30, -0.32);
      const manifoldPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.46, 10), pipeMat);
      manifoldPipe.rotation.z = Math.PI / 2;
      manifoldPipe.rotation.y = -0.7;
      manifoldPipe.position.set(-0.18, 0.16, -0.16);
      const sightGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.56, 8), pipeMat);
      sightGlass.position.set(0.42, 1.18, 0.40);

      group.add(tankBody, tankRib, tankRoof, roofBeacon, mainPipe, valve, gauge, pumpHouse, pumpDoor, pumpRoof, manifoldPipe, sightGlass);
    }

    group.scale.set(0.85, 0.85, 0.85);
    return group;
  }

  // =========================================================================
  // 2. Ô CƠ HỘI & KHÍ VẬN: HỘP QUÀ KỲ DIỆU & RƯƠNG VÀNG CHÂU BÁU
  // =========================================================================
  public static createCardTileModel(isChance: boolean): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(1.1, 1.1, 0.42));

    if (isChance) {
      // ❓ CƠ HỘI: Hộp quà hoàng kim đỏ thắm & Dấu hỏi vàng 3D
      const boxMat = LandmarkMaterials.getMat('sc_spec_chanceBox', () => new THREE.MeshStandardMaterial({
        color: '#E11D48',
        roughness: 0.22,
        emissive: '#BE123C',
        emissiveIntensity: 0.22
      }));
      const ribbonMat = LandmarkMaterials.getMat('sc_spec_ribbonGold', () => new THREE.MeshStandardMaterial({
        color: '#F1C40F',
        metalness: 0.90,
        roughness: 0.14
      }));
      const goldTrimMat = LandmarkMaterials.getMat('sc_spec_boxGoldTrim', () => new THREE.MeshStandardMaterial({
        color: '#FBBF24',
        metalness: 0.92,
        roughness: 0.12
      }));

      // Bục đế ngọc bích
      const basePlinth = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.06, 0.92, 2, 0.02), LandmarkMaterials.getMat('sc_spec_marblePlinth', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.2 })));
      basePlinth.position.y = 0.03;
      group.add(basePlinth);

      // Hộp quà bo tròn góc
      const box = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.62, 0.72, 3, 0.06), boxMat);
      box.position.set(0, 0.36, 0);
      box.castShadow = true;

      // Nơ ruy băng vàng quấn ngang và dọc
      const ribH = new THREE.Mesh(new RoundedBoxGeometry(0.74, 0.12, 0.74, 2, 0.015), ribbonMat);
      ribH.position.set(0, 0.36, 0);
      const ribV = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.64, 0.74, 2, 0.015), ribbonMat);
      ribV.position.set(0, 0.36, 0);

      // Cụm nơ hoa xoắn trên nắp hộp
      const bowL = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 6, 14), ribbonMat);
      bowL.rotation.y = Math.PI / 4;
      bowL.position.set(-0.08, 0.72, 0);
      const bowR = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 6, 14), ribbonMat);
      bowR.rotation.y = -Math.PI / 4;
      bowR.position.set(0.08, 0.72, 0);
      const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), goldTrimMat);
      bowCenter.position.set(0, 0.72, 0);

      // Dấu hỏi vàng 3D xoay nổi phía trên & các ngôi sao lấp lánh
      const questionMark = LandmarkHelpers.create3DQuestionMark();
      questionMark.position.set(0, 0.96, 0);
      [[-0.24, 1.18, 0.08], [0.24, 1.32, -0.06]].forEach(([sx, sy, sz]) => {
        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.042, 0), goldTrimMat);
        star.position.set(sx, sy, sz);
        group.add(star);
      });

      // Lá bài Cơ Hội 3D viền vàng tựa nghiêng bên cạnh hộp quà
      const cardMesh = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.44, 0.035, 2, 0.01), boxMat);
      cardMesh.position.set(0.34, 0.28, 0.26);
      cardMesh.rotation.y = -0.45;
      cardMesh.rotation.x = -0.18;
      const cardBorder = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.46, 0.02, 2, 0.01), goldTrimMat);
      cardBorder.position.set(0.34, 0.28, 0.255);
      cardBorder.rotation.y = -0.45;
      cardBorder.rotation.x = -0.18;

      group.add(box, ribH, ribV, bowL, bowR, bowCenter, questionMark, cardMesh, cardBorder);

    } else {
      // 🎁 KHÍ VẬN: Rương kho báu gỗ bọc đai đồng hé mở lộ tiền vàng & ngọc quý trên bệ đá
      const chestPlinth = new THREE.Mesh(
        new RoundedBoxGeometry(0.96, 0.06, 0.88, 2, 0.02),
        LandmarkMaterials.getMat('sc_spec_marblePlinth', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.2 }))
      );
      chestPlinth.position.y = 0.03;
      group.add(chestPlinth);

      const chest = LandmarkHelpers.createTreasureChestMini(1.0);
      chest.position.set(0, 0.07, 0);
      group.add(chest);

      // Thêm các cọc tiền vàng & thẻ Khí Vận 3D tựa cạnh rương
      const coinMat = LandmarkMaterials.getMat('sc_spec_chestCoinGold', () => new THREE.MeshStandardMaterial({
        color: '#F1C40F',
        metalness: 0.92,
        roughness: 0.12
      }));
      const chestCardMat = LandmarkMaterials.getMat('sc_spec_chestCardBlue', () => new THREE.MeshStandardMaterial({
        color: '#0284C7',
        roughness: 0.25,
        emissive: '#0369A1',
        emissiveIntensity: 0.2
      }));
      [[-0.38, 0.075, 0.30], [0.36, 0.075, 0.32], [0.40, 0.075, -0.24]].forEach(([cx, cy, cz]) => {
        const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 10), coinMat);
        coin.position.set(cx, cy, cz);
        group.add(coin);
      });
      const chestCard = new THREE.Mesh(new RoundedBoxGeometry(0.30, 0.40, 0.03, 2, 0.01), chestCardMat);
      chestCard.position.set(-0.34, 0.26, 0.14);
      chestCard.rotation.y = 0.45;
      chestCard.rotation.x = -0.15;
      group.add(chestCard);
    }

    group.scale.set(0.9, 0.9, 0.9);
    return group;
  }

  // =========================================================================
  // 3. Ô THUẾ: KÉT SẮT TÀI CHÍNH (4) & KIM CƯƠNG XA XỈ (38)
  // =========================================================================
  public static createTaxModel(tileId: number): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(1.15, 1.15, 0.45));

    if (tileId === 4) {
      // 💸 THUẾ THU NHẬP: Két sắt bảo an ngân hàng & Bao tải tiền vàng
      const safeMat = LandmarkMaterials.getMat('sc_spec_safeSteel', () => new THREE.MeshStandardMaterial({
        color: '#1E293B',
        metalness: 0.88,
        roughness: 0.22
      }));
      const safeDoorMat = LandmarkMaterials.getMat('sc_spec_safeDoor', () => new THREE.MeshStandardMaterial({
        color: '#334155',
        metalness: 0.90,
        roughness: 0.20
      }));
      const goldMat = LandmarkMaterials.getMat('sc_spec_taxGold', () => new THREE.MeshStandardMaterial({
        color: '#F1C40F',
        metalness: 0.92,
        roughness: 0.12
      }));
      const sackMat = LandmarkMaterials.getMat('sc_spec_moneySack', () => new THREE.MeshStandardMaterial({
        color: '#D2B48C',
        roughness: 0.85
      }));
      const cashGreenMat = LandmarkMaterials.getMat('sc_spec_cashGreen', () => new THREE.MeshStandardMaterial({
        color: '#10B981',
        roughness: 0.4
      }));

      // Bệ đá kho bạc ngân hàng
      const vaultPlinth = new THREE.Mesh(
        new RoundedBoxGeometry(1.16, 0.06, 1.04, 2, 0.02),
        LandmarkMaterials.getMat('sc_spec_vaultPlinth', () => new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.6 }))
      );
      vaultPlinth.position.y = 0.03;
      group.add(vaultPlinth);

      // Thân két sắt bo góc
      const safe = new THREE.Mesh(new RoundedBoxGeometry(0.76, 0.86, 0.70, 4, 0.06), safeMat);
      safe.position.set(0, 0.49, 0);
      safe.castShadow = true;

      // Cửa két sắt dập gờ nổi & chốt khóa thép
      const safeDoor = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.74, 0.06, 2, 0.02), safeDoorMat);
      safeDoor.position.set(0, 0.49, 0.34);
      [-0.20, 0, 0.20].forEach(by => {
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8), goldMat);
        bolt.rotation.z = Math.PI / 2;
        bolt.position.set(0.35, 0.49 + by, 0.34);
        group.add(bolt);
      });

      // Bản lề két sắt bên trái
      [-0.24, 0.24].forEach(hy => {
        const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.10, 8), goldMat);
        hinge.position.set(-0.35, 0.49 + hy, 0.34);
        group.add(hinge);
      });

      // Vô-lăng tay quay mở két bằng vàng có nan hoa
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.032, 8, 16), goldMat);
      wheel.position.set(0, 0.51, 0.38);
      for (let s = 0; s < 3; s++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.022, 0.022), goldMat);
        spoke.position.set(0, 0.51, 0.38);
        spoke.rotation.z = (s * Math.PI) / 3;
        group.add(spoke);
      }

      const wheelCap = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), goldMat);
      wheelCap.position.set(0, 0.51, 0.39);

      // Núm vặn mã số xoay (Combination dial)
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), goldMat);
      dial.rotation.x = Math.PI / 2;
      dial.position.set(0.18, 0.51, 0.38);

      // Cân công lý bằng đồng thu nhỏ đặt trên nóc két sắt
      const scaleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 0.03, 12), goldMat);
      scaleBase.position.set(0, 0.935, 0);
      const scalePillar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.26, 8), goldMat);
      scalePillar.position.set(0, 1.07, 0);
      const scaleBeam = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.018, 0.018), goldMat);
      scaleBeam.position.set(0, 1.19, 0);
      [-0.16, 0.16].forEach(px => {
        const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.045, 0.02, 12), goldMat);
        pan.position.set(px, 1.08, 0);
        const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.11, 6), goldMat);
        cord.position.set(px, 1.135, 0);
        group.add(pan, cord);
      });
      group.add(scaleBase, scalePillar, scaleBeam);

      // Bao tải tiền vải bố bên cạnh
      const sack = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), sackMat);
      sack.scale.set(1.0, 1.25, 1.0);
      sack.position.set(0.46, 0.27, 0.16);

      const sackTie = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.02, 6, 12), LandmarkMaterials.getMat('sc_spec_sackRope', () => new THREE.MeshStandardMaterial({ color: '#A16207', roughness: 0.9 })));
      sackTie.rotation.x = Math.PI / 2;
      sackTie.position.set(0.46, 0.45, 0.16);

      // Cọc tiền đô la & Kim tự tháp thỏi vàng
      const cashStack = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.08, 0.12, 2, 0.01), cashGreenMat);
      cashStack.position.set(-0.44, 0.10, 0.26);

      const goldBar1 = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.05, 0.08, 2, 0.01), goldMat);
      goldBar1.position.set(-0.42, 0.165, 0.26);
      const goldBar2 = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.045, 0.07, 2, 0.01), goldMat);
      goldBar2.position.set(-0.42, 0.21, 0.26);
      group.add(goldBar2);

      group.add(safe, safeDoor, wheel, wheelCap, dial, sack, sackTie, cashStack, goldBar1);

    } else {
      // 💎 THUẾ XA XỈ: Kim Cương Pha Lê khổng lồ giác cắt rực rỡ & Vương Miện Hoàng Gia
      const diamondMat = LandmarkMaterials.getMat('sc_spec_luxuryDiamond', () => new THREE.MeshStandardMaterial({
        color: '#67E8F9',
        emissive: '#A5F3FC',
        emissiveIntensity: 0.85,
        roughness: 0.04,
        metalness: 0.15,
        flatShading: true,
        transparent: true,
        opacity: 0.94
      }));
      const pedMat = LandmarkMaterials.getMat('sc_spec_diamondPlinth', () => new THREE.MeshStandardMaterial({
        color: '#F1C40F',
        metalness: 0.92,
        roughness: 0.14
      }));
      const velvetMat = LandmarkMaterials.getMat('sc_spec_velvetBlack', () => new THREE.MeshStandardMaterial({
        color: '#1E1B4B',
        roughness: 0.65
      }));
      const rubyMat = LandmarkMaterials.getMat('sc_spec_tiaraRuby', () => new THREE.MeshStandardMaterial({
        color: '#E11D48',
        roughness: 0.15,
        emissive: '#BE123C',
        emissiveIntensity: 0.5
      }));

      // Bệ đỡ vàng vương giả nhiều tầng
      const pedestalBottom = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.08, 0.82, 2, 0.02), pedMat);
      pedestalBottom.position.y = 0.04;

      const pedestalMid = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.10, 0.72, 2, 0.02), velvetMat);
      pedestalMid.position.y = 0.13;

      const pedestal = new THREE.Mesh(new RoundedBoxGeometry(0.64, 0.08, 0.64, 3, 0.03), pedMat);
      pedestal.position.set(0, 0.22, 0);

      // Kim cương hình nón ngược giác cắt đa diện (Brilliant cut diamond) & Đai vàng giữ chấu
      const diamondTop = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.56, 0.22, 8), diamondMat);
      diamondTop.position.set(0, 0.56, 0);
      const diamondCone = new THREE.Mesh(new THREE.ConeGeometry(0.56, 0.48, 8), diamondMat);
      diamondCone.rotation.x = Math.PI;
      diamondCone.position.set(0, 0.24 + 0.48 / 2, 0);
      const crownRing = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.024, 8, 16), pedMat);
      crownRing.rotation.x = Math.PI / 2;
      crownRing.position.set(0, 0.36, 0);

      // 4 Chấu vàng nâng kim cương, 4 Viên ngọc Ruby & Cọc dây nhung bảo vệ 4 góc
      [-0.26, 0.26].forEach(rx => {
        [-0.26, 0.26].forEach(rz => {
          const gem = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), rubyMat);
          gem.position.set(rx, 0.27, rz);
          const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.34, 8), pedMat);
          prong.position.set(rx * 1.45, 0.40, rz * 1.45);
          prong.rotation.z = rx > 0 ? 0.25 : -0.25;
          prong.rotation.x = rz > 0 ? -0.25 : 0.25;
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.16, 8), pedMat);
          post.position.set(rx * 1.45, 0.16, rz * 1.45);
          const finial = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), pedMat);
          finial.position.set(rx * 1.45, 0.25, rz * 1.45);
          group.add(gem, prong, post, finial);
        });
      });

      group.add(pedestalBottom, pedestalMid, pedestal, diamondTop, diamondCone, crownRing);
    }

    group.scale.set(0.85, 0.85, 0.85);
    return group;
  }
}
