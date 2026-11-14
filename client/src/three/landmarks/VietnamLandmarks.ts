import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { LandmarkMaterials } from './LandmarkMaterials';
import { LandmarkHelpers } from './LandmarkHelpers';

/**
 * 22 Mô hình danh thắng danh lam thắng cảnh đặc trưng của các tỉnh thành Việt Nam:
 * Cần Thơ, Cà Mau, Vũng Tàu, Phan Thiết, Nha Trang, Đà Lạt, Buôn Ma Thuột, Pleiku,
 * Quy Nhơn, Hội An, Đà Nẵng, Huế, Phong Nha, Cửa Lò, Hải Phòng, Hạ Long, Tràng An,
 * Hồ Tây, Phố Cổ, Tràng Tiền, Landmark 81, Nguyễn Huệ / Chợ Bến Thành.
 */
export class VietnamLandmarks {
  public static createCityLandmark(tileId: number): THREE.Group {
    const group = new THREE.Group();
    group.add(LandmarkMaterials.createContactShadow(1.48, 1.32, 0.52));

    // Đế Sa Bàn Đá Hoa Cương Viền Vàng Hoàng Kim (Sculpted Diorama Plinth Pad) cho toàn bộ 22 danh thắng
    const plinthPadMat = LandmarkMaterials.getMat('landmarkPlinthPadMarble', () => new THREE.MeshStandardMaterial({
      color: '#F8FAFC',
      roughness: 0.25,
      metalness: 0.08
    }));
    const plinthGoldRimMat = LandmarkMaterials.getMat('landmarkPlinthGoldRim', () => new THREE.MeshStandardMaterial({
      color: '#F1C40F',
      emissive: '#F39C12',
      emissiveIntensity: 0.22,
      metalness: 0.88,
      roughness: 0.16
    }));
    const plinthGoldRim = new THREE.Mesh(new RoundedBoxGeometry(1.42, 0.022, 1.02, 3, 0.01), plinthGoldRimMat);
    plinthGoldRim.position.y = 0.011;
    const plinthPad = new THREE.Mesh(new RoundedBoxGeometry(1.36, 0.032, 0.96, 3, 0.015), plinthPadMat);
    plinthPad.position.y = 0.022;
    plinthPad.receiveShadow = true;
    group.add(plinthGoldRim, plinthPad);

    switch (tileId) {
      // =====================================================
      // PHÂN KHU 1: CẦN THƠ & CÀ MAU (Iris Purple)
      // =====================================================
      case 1: {
        // Cần Thơ: Cầu Cần Thơ dây văng hùng vĩ & Thuyền trái cây Chợ Nổi Cái Răng
        const pylonMat = LandmarkMaterials.getMat('ctBridgePylon', () => new THREE.MeshStandardMaterial({ color: '#F1F2F6', roughness: 0.28, metalness: 0.1 }));
        const cableMat = LandmarkMaterials.getMat('ctCableGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.85, roughness: 0.2 }));
        const waterMat = LandmarkMaterials.getMat('songHauWater', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.08, metalness: 0.15 }));
        const fruitYellow = LandmarkMaterials.getMat('fruitPineapple', () => new THREE.MeshStandardMaterial({ color: '#F39C12', roughness: 0.4 }));
        const fruitRed = LandmarkMaterials.getMat('fruitDragon', () => new THREE.MeshStandardMaterial({ color: '#E84118', roughness: 0.35 }));
        const fruitGreen = LandmarkMaterials.getMat('fruitMelon', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.4 }));

        // 1. Mặt nước sông Hậu mênh mang có gợn sóng bạc
        const river = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.08, 0.9, 3, 0.03), waterMat);
        river.position.set(0, 0.04, 0);

        // Mặt đường thảm nhựa và vạch kẻ tim đường trên mặt cầu Cần Thơ
        const bridgeRoadMat = LandmarkMaterials.getMat('ctBridgeRoad', () => new THREE.MeshStandardMaterial({ color: '#2F3542', roughness: 0.72 }));
        const roadDeck = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 0.18), bridgeRoadMat);
        roadDeck.rotation.x = -Math.PI / 2;
        roadDeck.position.set(0, 0.512, -0.15);

        const bridgeLine = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.015), LandmarkMaterials.getMat('laneYellow', () => new THREE.MeshBasicMaterial({ color: '#F1C40F' })));
        bridgeLine.rotation.x = -Math.PI / 2;
        bridgeLine.position.set(0, 0.515, -0.15);
        group.add(roadDeck, bridgeLine);

        // 2. Trụ tháp cầu dây văng chữ Y ngược thanh thoát cao 1.5 units
        const pylonL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.085, 1.45, 16), pylonMat);
        pylonL.position.set(-0.28, 0.72, -0.15);
        pylonL.rotation.z = -0.11;
        pylonL.castShadow = true;

        const pylonR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.085, 1.45, 16), pylonMat);
        pylonR.position.set(0.28, 0.72, -0.15);
        pylonR.rotation.z = 0.11;
        pylonR.castShadow = true;

        // Xà ngang nối hai nhánh trụ tháp
        const crossBeam = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.06, 0.1, 2, 0.02), pylonMat);
        crossBeam.position.set(0, 0.92, -0.15);

        // Dầm mặt cầu bắc ngang
        const deck = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.06, 0.24, 2, 0.02), pylonMat);
        deck.position.set(0, 0.48, -0.15);

        // Dàn dây văng cánh quạt mạ vàng
        const cableGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.92, 8);
        for (let c = 1; c <= 3; c++) {
          const cL = new THREE.Mesh(cableGeo, cableMat);
          cL.position.set(-0.16 - c * 0.11, 0.7 - c * 0.06, -0.15);
          cL.rotation.z = -0.42 - c * 0.12;

          const cR = new THREE.Mesh(cableGeo, cableMat);
          cR.position.set(0.16 + c * 0.11, 0.7 - c * 0.06, -0.15);
          cR.rotation.z = 0.42 + c * 0.12;
          group.add(cL, cR);
        }

        // 3. Chiếc ghe hoa quả Chợ Nổi Cái Răng chở đầy nông sản
        const boat = LandmarkHelpers.createWoodenBoat('#D35400');
        boat.position.set(0.05, 0.1, 0.22);
        boat.rotation.y = 0.25;
        boat.userData = { animType: 'float_wave' };

        // Các sọt trái cây miệt vườn đầy ắp
        const pile1 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), fruitYellow);
        pile1.position.set(-0.06, 0.18, 0.22);
        const pile2 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), fruitRed);
        pile2.position.set(0.06, 0.18, 0.23);
        const pile3 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), fruitGreen);
        pile3.position.set(0, 0.22, 0.22);

        // Cây bẹo tre treo mẫu trái cây đặc trưng Chợ Nổi
        const beoPole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 8), LandmarkMaterials.getMat('beoBamboo', () => new THREE.MeshStandardMaterial({ color: '#F1C40F' })));
        beoPole.position.set(0.24, 0.35, 0.26);
        beoPole.rotation.z = -0.15;
        const beoSample = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), fruitYellow);
        beoSample.position.set(0.28, 0.58, 0.26);

        group.add(river, pylonL, pylonR, crossBeam, deck, boat, pile1, pile2, pile3, beoPole, beoSample);
        break;
      }

      case 3: {
        // Cà Mau: Tượng Đài Con Tàu Mũi Cà Mau, Mốc Tọa Độ Quốc Gia GPS 0001 & Rừng Đước Bãi Bồi
        // 1. Hệ vật liệu tối ưu theo LandmarkMaterials
        const graniteDarkMat = LandmarkMaterials.getMat('cmGraniteDark', () => new THREE.MeshStandardMaterial({ color: '#353B48', roughness: 0.65 }));
        const graniteLightMat = LandmarkMaterials.getMat('cmGraniteLight', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.5 }));
        const marbleMarkerMat = LandmarkMaterials.getMat('cmMarbleMarker', () => new THREE.MeshStandardMaterial({ color: '#F5F6FA', roughness: 0.28 }));
        const mudflatMat = LandmarkMaterials.getMat('cmMudflatAlluvial', () => new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.55, metalness: 0.08 }));
        const oceanMat = LandmarkMaterials.getMat('cmOceanDeep', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.10, metalness: 0.15 }));
        const foamMat = LandmarkMaterials.getMat('cmSeaFoam', () => new THREE.MeshStandardMaterial({ color: '#E1F5FE', roughness: 0.25, transparent: true, opacity: 0.78, depthWrite: false }));
        const shipWhiteMat = LandmarkMaterials.getMat('cmShipWhite', () => new THREE.MeshStandardMaterial({ color: '#F8F9FA', roughness: 0.25 }));
        const shipDeckMat = LandmarkMaterials.getMat('cmDeckTeak', () => new THREE.MeshStandardMaterial({ color: '#795548', roughness: 0.45 }));
        const shipRailMat = LandmarkMaterials.getMat('cmRailChrome', () => new THREE.MeshStandardMaterial({ color: '#DFE6E9', metalness: 0.88, roughness: 0.15 }));
        const sailRedMat = LandmarkMaterials.getMat('cmSailRed', () => new THREE.MeshStandardMaterial({ color: '#D63031', roughness: 0.32, emissive: '#B71540', emissiveIntensity: 0.25 }));
        const sailRibGoldMat = LandmarkMaterials.getMat('cmSailRibGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.88, roughness: 0.15 }));
        const boardwalkWoodMat = LandmarkMaterials.getMat('cmBoardwalkWood', () => new THREE.MeshStandardMaterial({ color: '#6D4C41', roughness: 0.75 }));
        const bronzePlaqueMat = LandmarkMaterials.getMat('cmBronzePlaque', () => new THREE.MeshStandardMaterial({ color: '#C0392B', metalness: 0.7, roughness: 0.3 }));
        const crabShellMat = LandmarkMaterials.getMat('cmCrabShell', () => new THREE.MeshStandardMaterial({ color: '#D35400', roughness: 0.25, metalness: 0.1 }));
        const crabClawMat = LandmarkMaterials.getMat('cmCrabClaw', () => new THREE.MeshStandardMaterial({ color: '#E67E22', roughness: 0.2, metalness: 0.15 }));
        const crabEyeMat = LandmarkMaterials.getMat('cmCrabEye', () => new THREE.MeshStandardMaterial({ color: '#1E272E', roughness: 0.1, metalness: 0.6 }));
        const mangrovePropMat = LandmarkMaterials.getMat('cmMangroveProp', () => new THREE.MeshStandardMaterial({ color: '#1B5E20', roughness: 0.4 }));

        // 2. Thềm địa hình: Vùng biển giao thoa & Bãi bồi phù sa Đất Mũi
        const sea = new THREE.Mesh(new RoundedBoxGeometry(1.22, 0.05, 0.72, 3, 0.02), oceanMat);
        sea.position.set(0.06, 0.025, 0.32);

        // Bọt sóng biển vỗ dập dềnh mạn thuyền
        const waveFoam = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.032, 6, 24, Math.PI * 0.9), foamMat);
        waveFoam.rotation.x = Math.PI / 2;
        waveFoam.position.set(0.12, 0.055, 0.24);
        waveFoam.userData = { animType: 'float_wave' };

        // Bãi bồi phù sa trù phú nơi búp đước cắm rễ sinh sôi
        const mudflat = new THREE.Mesh(new RoundedBoxGeometry(0.85, 0.065, 0.88, 3, 0.03), mudflatMat);
        mudflat.position.set(0.24, 0.035, -0.22);
        mudflat.receiveShadow = true;

        // 3. Thềm đài đá hoa cương tam cấp nâng đỡ Tượng Đài Con Tàu
        const plinthBase = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.64, 0.08, 24), graniteDarkMat);
        plinthBase.position.set(-0.02, 0.04, -0.04);
        plinthBase.receiveShadow = true;

        const plinthUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.54, 0.06, 24), graniteLightMat);
        plinthUpper.position.set(-0.02, 0.1, -0.04);
        plinthUpper.receiveShadow = true;

        // 4. TƯỢNG ĐÀI CON TÀU MŨI CÀ MAU VƯƠN RA BIỂN ĐÔNG
        const shipGroup = new THREE.Group();
        shipGroup.position.set(-0.02, 0.13, -0.04);
        shipGroup.rotation.y = 0.26; // Góc vươn mũi tàu chếch hướng biển khơi

        // Thân tàu chính bằng cẩm thạch trắng ngọc
        const shipHull = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.22, 0.32, 4, 0.05), shipWhiteMat);
        shipHull.position.set(0, 0.11, 0);
        shipHull.castShadow = true;
        shipHull.receiveShadow = true;

        // Mũi tàu nhọn vát khí động học hướng sóng
        const prowCyl = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.36, 16), shipWhiteMat);
        prowCyl.rotation.x = Math.PI / 2;
        prowCyl.scale.set(0.85, 1.0, 0.55);
        prowCyl.position.set(0, 0.11, 0.32);
        prowCyl.castShadow = true;

        // Sàn boong tàu lát gỗ Teak đỏ nâu
        const shipDeck = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.02, 0.26, 2, 0.01), shipDeckMat);
        shipDeck.position.set(0, 0.225, 0.02);

        // Lan can mạn tàu bằng inox chrome sáng loáng
        const railL = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.56, 8), shipRailMat);
        railL.rotation.x = Math.PI / 2;
        railL.position.set(-0.14, 0.255, 0.02);

        const railR = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.56, 8), shipRailMat);
        railR.rotation.x = Math.PI / 2;
        railR.position.set(0.14, 0.255, 0.02);

        const railBow = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.008, 6, 16, Math.PI), shipRailMat);
        railBow.rotation.x = Math.PI / 2;
        railBow.position.set(0, 0.255, 0.28);

        // Chỉ viền vàng ánh kim mạn tàu
        const goldStripeL = new THREE.Mesh(new RoundedBoxGeometry(0.012, 0.02, 0.52, 2, 0.004), sailRibGoldMat);
        goldStripeL.position.set(-0.162, 0.15, 0.04);
        const goldStripeR = new THREE.Mesh(new RoundedBoxGeometry(0.012, 0.02, 0.52, 2, 0.004), sailRibGoldMat);
        goldStripeR.position.set(0.162, 0.15, 0.04);

        // Cột buồm chính bằng hợp kim bạc vươn cao
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.034, 1.48, 12), shipRailMat);
        mast.position.set(0, 0.88, -0.02);
        mast.castShadow = true;

        // Cánh buồm chính đỏ thắm đón gió khơi
        const mainSail = new THREE.Mesh(new THREE.ConeGeometry(0.46, 1.35, 18), sailRedMat);
        mainSail.scale.set(0.38, 1.0, 1.05);
        mainSail.position.set(0, 0.84, 0.04);
        mainSail.rotation.z = -0.12;
        mainSail.castShadow = true;

        // Cánh buồm phụ phía trước tạo thế buồm căng tràn sinh khí
        const jibSail = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.88, 16), sailRedMat);
        jibSail.scale.set(0.32, 1.0, 0.95);
        jibSail.position.set(0, 0.62, 0.22);
        jibSail.rotation.z = -0.08;
        jibSail.castShadow = true;

        // Gân sống buồm chỉ vàng hoàng kim chịu lực
        const sailRib = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.014, 1.32, 8), sailRibGoldMat);
        sailRib.position.set(0.04, 0.84, 0.05);
        sailRib.rotation.z = -0.12;

        // Ngôi sao vàng trên đỉnh cột buồm
        const mastCrownStar = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 12), sailRibGoldMat);
        mastCrownStar.position.set(0, 1.62, -0.02);
        mastCrownStar.userData = { animType: 'rotate_pulse' };

        shipGroup.add(
          shipHull, prowCyl, shipDeck, railL, railR, railBow,
          goldStripeL, goldStripeR, mast, mainSail, jibSail, sailRib, mastCrownStar
        );

        // 5. MỐC TỌA ĐỘ QUỐC GIA GPS 0001 ĐẤT MŨI (8°37'30''B - 104°43'E)
        const gpsGroup = new THREE.Group();
        gpsGroup.position.set(-0.46, 0.02, 0.22);

        // Bệ tam cấp đá granite
        const markerBase1 = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.04, 0.32, 3, 0.02), graniteDarkMat);
        markerBase1.position.y = 0.02;
        markerBase1.receiveShadow = true;

        const markerBase2 = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.04, 0.24, 3, 0.02), graniteLightMat);
        markerBase2.position.y = 0.06;
        markerBase2.receiveShadow = true;

        // Trụ mốc Obelisk bằng đá cẩm thạch trắng
        const markerPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.11, 0.48, 4), marbleMarkerMat);
        markerPillar.position.y = 0.32;
        markerPillar.rotation.y = Math.PI / 4;
        markerPillar.castShadow = true;

        // Đỉnh chóp kim tự tháp
        const markerCap = new THREE.Mesh(new THREE.ConeGeometry(0.106, 0.1, 4), marbleMarkerMat);
        markerCap.position.y = 0.61;
        markerCap.rotation.y = Math.PI / 4;

        // Ngôi sao vàng 5 cánh 3D dập nổi biểu tượng chủ quyền
        const starShape = new THREE.Shape();
        const outerR = 0.048;
        const innerR = 0.022;
        for (let i = 0; i < 10; i++) {
          const r = (i % 2 === 0) ? outerR : innerR;
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
          const sx = Math.cos(a) * r;
          const sy = Math.sin(a) * r;
          if (i === 0) starShape.moveTo(sx, sy);
          else starShape.lineTo(sx, sy);
        }
        starShape.closePath();
        const starGeom = new THREE.ExtrudeGeometry(starShape, { depth: 0.015, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.004, bevelSegments: 2 });
        const starMesh = new THREE.Mesh(starGeom, sailRibGoldMat);
        starMesh.position.set(0, 0.42, 0.082);
        starMesh.rotation.y = 0;
        starMesh.userData = { animType: 'flicker' };

        // Tấm bia đồng đỏ khắc danh xưng "GPS 0001"
        const plaque = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.06, 0.014, 2, 0.003), bronzePlaqueMat);
        plaque.position.set(0, 0.24, 0.088);

        gpsGroup.add(markerBase1, markerBase2, markerPillar, markerCap, starMesh, plaque);

        // 6. CẦU VÁN GỖ XUYÊN RỪNG ĐƯỚC ĐẶC TRƯNG ĐẤT MŨI
        const boardwalkGroup = new THREE.Group();
        const plankWaypoints = [
          [-0.12, 0.09, -0.18, 0.45],
          [-0.02, 0.09, -0.26, 0.6],
          [0.1, 0.09, -0.32, 0.8],
          [0.24, 0.09, -0.36, 0.95],
          [0.38, 0.09, -0.34, 1.15],
          [0.5, 0.09, -0.28, 1.35]
        ];

        plankWaypoints.forEach(([px, py, pz, rotY]) => {
          // Tấm ván cầu gỗ
          const plank = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.016, 0.16, 2, 0.005), boardwalkWoodMat);
          plank.position.set(px, py, pz);
          plank.rotation.y = rotY;

          // Cọc trụ cầu cắm sâu vào bùn phù sa
          const pileL = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6), graniteDarkMat);
          pileL.position.set(px - 0.045, py - 0.05, pz);
          const pileR = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6), graniteDarkMat);
          pileR.position.set(px + 0.045, py - 0.05, pz);

          // Cột tay vịn thanh mảnh
          const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.08, 6), boardwalkWoodMat);
          postL.position.set(px - 0.05, py + 0.04, pz);
          const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.08, 6), boardwalkWoodMat);
          postR.position.set(px + 0.05, py + 0.04, pz);

          boardwalkGroup.add(plank, pileL, pileR, postL, postR);
        });

        // 7. RỪNG ĐƯỚC NGẬP MẶN BẠT NGÀN & BÚP ĐƯỚC SINH SÔI
        const mangrovePrimary = LandmarkHelpers.createMiniMangroveTree();
        mangrovePrimary.position.set(0.44, 0.035, -0.1);
        mangrovePrimary.scale.set(0.85, 0.85, 0.85);

        const mangroveSecondary = LandmarkHelpers.createMiniMangroveTree();
        mangroveSecondary.position.set(0.32, 0.035, -0.46);
        mangroveSecondary.scale.set(0.62, 0.62, 0.62);

        // Các mầm đước (trái đước nhọn tự cắm mầm vào bãi phù sa)
        const propPositions = [
          [0.2, 0.07, -0.15],
          [0.16, 0.07, -0.28],
          [0.48, 0.07, -0.42],
          [0.55, 0.07, -0.12]
        ];
        const propShoots = new THREE.Group();
        propPositions.forEach(([x, y, z]) => {
          const shoot = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.08, 6), mangrovePropMat);
          shoot.position.set(x, y, z);
          shoot.rotation.z = (Math.random() - 0.5) * 0.2;
          propShoots.add(shoot);
        });

        // 8. CHÚ CUA BIỂN CÀ MAU GẠCH SON TÍ HON TRÊN BÃI BỒI
        const crab = new THREE.Group();
        crab.position.set(-0.24, 0.065, 0.44);
        crab.rotation.y = -0.45; // Hướng ra biển Đông

        // Mai cua bo tròn màu gạch son bóng bẩy
        const carapace = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 10), crabShellMat);
        carapace.scale.set(1.22, 0.42, 0.95);
        carapace.position.y = 0.012;

        // 2 Mắt cua tí hon
        [-0.014, 0.014].forEach(ex => {
          const eye = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 6), crabEyeMat);
          eye.position.set(ex, 0.024, 0.03);
          crab.add(eye);
        });

        // 2 Càng cua Cà Mau mập mạp giương đón sóng
        [-1, 1].forEach(side => {
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.009, 0.032, 6), crabClawMat);
          arm.position.set(side * 0.042, 0.018, 0.022);
          arm.rotation.z = side * -0.65;
          arm.rotation.y = side * 0.35;

          const claw = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.038, 8), crabClawMat);
          claw.position.set(side * 0.058, 0.032, 0.038);
          claw.rotation.z = side * -1.05;
          claw.rotation.x = 0.4;
          crab.add(arm, claw);
        });

        // 6 Chân bò nhỏ cắm vào bùn phù sa
        for (let i = 0; i < 3; i++) {
          [-1, 1].forEach(side => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.005, 0.028, 5), crabShellMat);
            leg.position.set(side * (0.038 + i * 0.004), 0.008, -0.008 - i * 0.014);
            leg.rotation.z = side * 0.72;
            leg.rotation.x = -0.18 * i;
            crab.add(leg);
          });
        }
        crab.add(carapace);

        group.add(
          sea, waveFoam, mudflat,
          plinthBase, plinthUpper,
          shipGroup, gpsGroup,
          boardwalkGroup,
          mangrovePrimary, mangroveSecondary, propShoots,
          crab
        );
        break;
      }

      // =====================================================
      // PHÂN KHU 2: VŨNG TÀU, PHAN THIẾT, NHA TRANG (Light Blue)
      // =====================================================
      case 6: {
        // Vũng Tàu: Hải Đăng Cổ Núi Nhỏ (1862), Trận Địa Pháo Cổ, Nhà Quản Đăng Pháp & Dốc Hoa Giấy
        // 1. Hệ vật liệu tối ưu theo LandmarkMaterials
        const oceanMat = LandmarkMaterials.getMat('vtOceanDeep', () => new THREE.MeshStandardMaterial({
          color: '#0984E3',
          roughness: 0.08,
          metalness: 0.15
        }));
        const waveFoamMat = LandmarkMaterials.getMat('vtWaveFoam', () => new THREE.MeshStandardMaterial({
          color: '#E0F7FA',
          roughness: 0.25,
          transparent: true,
          opacity: 0.8,
          depthWrite: false
        }));
        const cliffRockMat = LandmarkMaterials.getMat('vtCliffRock', () => new THREE.MeshStandardMaterial({
          color: '#636E72',
          roughness: 0.72
        }));
        const mountainGreenMat = LandmarkMaterials.getMat('vtMountainGreen', () => new THREE.MeshStandardMaterial({
          color: '#00B894',
          roughness: 0.55
        }));
        const roadMat = LandmarkMaterials.getMat('vtHillRoadAsphalt', () => new THREE.MeshStandardMaterial({
          color: '#4B6584',
          roughness: 0.65
        }));
        const stoneTowerMat = LandmarkMaterials.getMat('vtTowerWhite', () => new THREE.MeshStandardMaterial({
          color: '#F8F9FA',
          roughness: 0.22
        }));
        const domeRedMat = LandmarkMaterials.getMat('vtDomeRed', () => new THREE.MeshStandardMaterial({
          color: '#C0392B',
          roughness: 0.28
        }));
        const lanternGlowMat = LandmarkMaterials.getMat('vtLanternGlow', () => new THREE.MeshStandardMaterial({
          color: '#FFF275',
          emissive: '#F1C40F',
          emissiveIntensity: 1.35,
          roughness: 0.1
        }));
        const frenchWallMat = LandmarkMaterials.getMat('vtFrenchWallCream', () => new THREE.MeshStandardMaterial({
          color: '#F5CD79',
          roughness: 0.42
        }));
        const frenchRoofMat = LandmarkMaterials.getMat('vtFrenchRoofTerracotta', () => new THREE.MeshStandardMaterial({
          color: '#D35400',
          roughness: 0.35
        }));
        const metalChromeMat = LandmarkMaterials.getMat('vtGalleryChrome', () => new THREE.MeshStandardMaterial({
          color: '#DFE6E9',
          metalness: 0.88,
          roughness: 0.15
        }));
        const cannonIronMat = LandmarkMaterials.getMat('vtCannonIron', () => new THREE.MeshStandardMaterial({
          color: '#1E272E',
          metalness: 0.85,
          roughness: 0.24
        }));
        const cannonGoldMat = LandmarkMaterials.getMat('vtCannonGold', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          metalness: 0.88,
          roughness: 0.18
        }));
        const bougainvilleaMat = LandmarkMaterials.getMat('vtBougainvilleaPink', () => new THREE.MeshStandardMaterial({
          color: '#FD79A8',
          emissive: '#E84393',
          emissiveIntensity: 0.38,
          roughness: 0.3
        }));
        const bougainvilleaLeafMat = LandmarkMaterials.getMat('vtBougainvilleaLeaf', () => new THREE.MeshStandardMaterial({
          color: '#2ECC71',
          roughness: 0.4
        }));
        const windowTintMat = LandmarkMaterials.getMat('vtWindowTint', () => new THREE.MeshStandardMaterial({
          color: '#2C3E50',
          roughness: 0.1,
          metalness: 0.8
        }));

        // 2. Thềm biển Đông & Vách đá Núi Nhỏ (Tao Phùng)
        const sea = new THREE.Mesh(new RoundedBoxGeometry(0.85, 0.05, 0.72, 3, 0.02), oceanMat);
        sea.position.set(0.32, 0.025, 0.34);

        const waveFoam = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.028, 6, 20, Math.PI * 0.85), waveFoamMat);
        waveFoam.rotation.x = Math.PI / 2;
        waveFoam.position.set(0.28, 0.052, 0.26);
        waveFoam.userData = { animType: 'float_wave' };

        // Mỏm Núi Nhỏ vách đá xanh biếc
        const mount = new THREE.Mesh(new THREE.SphereGeometry(0.68, 22, 16), mountainGreenMat);
        mount.scale.set(1.22, 0.48, 1.12);
        mount.position.set(-0.06, 0.12, -0.04);
        mount.receiveShadow = true;

        const cliffBase = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.14, 0.48, 2, 0.04), cliffRockMat);
        cliffBase.position.set(0.18, 0.07, 0.14);
        cliffBase.receiveShadow = true;

        // Con đường dốc uốn lượn ven sườn núi lên đỉnh hải đăng
        const hillRoad = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.045, 4, 24, Math.PI * 0.7), roadMat);
        hillRoad.rotation.x = Math.PI / 2;
        hillRoad.rotation.z = -0.4;
        hillRoad.position.set(-0.08, 0.16, 0.02);

        // 3. NGỌN HẢI ĐĂNG CỔ VŨNG TÀU (XÂY DỰNG NĂM 1862)
        const lighthouseGroup = new THREE.Group();
        lighthouseGroup.position.set(-0.12, 0.16, -0.06);

        // Thềm đế tháp đá hoa cương tròn
        const towerPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.12, 24), stoneTowerMat);
        towerPlinth.position.y = 0.22;
        towerPlinth.receiveShadow = true;

        // Tháp đá hình trụ côn màu trắng muốt cao 1.35m
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 1.32, 24), stoneTowerMat);
        tower.position.y = 0.94;
        tower.castShadow = true;
        tower.receiveShadow = true;

        // Các ô cửa sổ vòm đón gió biển dọc thân tháp
        [0.54, 0.88, 1.22].forEach((wy, idx) => {
          const win = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.08, 0.015, 2, 0.003), windowTintMat);
          win.position.set(0, wy, 0.31 - idx * 0.04);
          lighthouseGroup.add(win);
        });

        // Đường hầm vòm kiên cố kiểu Pháp nối vào chân tháp
        const tunnelArc = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.22, 0.28, 3, 0.02), stoneTowerMat);
        tunnelArc.position.set(-0.28, 0.26, -0.08);

        // Ban công đài quan sát bát giác (Observation Gallery)
        const gallery = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.07, 8), stoneTowerMat);
        gallery.position.y = 1.62;

        // Lan can hoa sắt bảo vệ ban công
        const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.375, 0.375, 0.08, 16, 1, true), metalChromeMat);
        rail.position.y = 1.69;

        // Lồng đèn kính bát giác thấu kính Fresnel & luồng sáng vàng ấm
        const lanternRoom = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.24, 8), lanternGlowMat);
        lanternRoom.position.y = 1.77;
        lanternRoom.userData = { animType: 'lighthouse' };

        // Mái vòm bán cầu màu đỏ thắm trên đỉnh tháp
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2), domeRedMat);
        dome.position.y = 1.89;
        dome.castShadow = true;

        // Cột thu lôi dát vàng đỉnh tháp
        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.016, 0.24, 8), cannonGoldMat);
        spire.position.y = 2.16;

        const spireBall = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), cannonGoldMat);
        spireBall.position.y = 2.29;

        // Luồng sáng đèn pha hải đăng 360 độ quét ra biển đêm
        const beaconConeMat = LandmarkMaterials.getMat('vtBeaconLightCone', () => new THREE.MeshBasicMaterial({
          color: '#FFF275',
          transparent: true,
          opacity: 0.38,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        }));
        const beaconLensMat = LandmarkMaterials.getMat('vtBeaconLensCenter', () => new THREE.MeshBasicMaterial({
          color: '#FFFFFF'
        }));
        const beaconArm = new THREE.Group();
        beaconArm.position.y = 1.77;
        beaconArm.userData = { animType: 'spin_y' };

        // Nón chùm sáng: đỉnh nhọn (apex) bắt nguồn chính xác tại tâm buồng đèn (0, 0, 0), đáy mở rộng quét xa ra đại dương
        const beamLength = 1.85;
        const beamConeGeo = new THREE.ConeGeometry(0.55, beamLength, 24, 1, true);
        beamConeGeo.translate(0, -beamLength / 2, 0); // Đặt apex tại gốc (0, 0, 0)
        const beamCone = new THREE.Mesh(beamConeGeo, beaconConeMat);
        beamCone.rotation.x = -Math.PI / 2 - 0.05; // Hơi chúc nhẹ 3 độ xuống mặt biển khơi
        beamCone.position.set(0, 0, 0);

        const beaconLens = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), beaconLensMat);
        beaconLens.position.set(0, 0, 0);

        beaconArm.add(beamCone, beaconLens);

        lighthouseGroup.add(
          towerPlinth, tower, tunnelArc,
          gallery, rail, lanternRoom, dome, spire, spireBall,
          beaconArm
        );

        // 4. NHÀ CÔNG VỤ QUẢN ĐĂNG CỔ KÍNH KIỂU PHÁP
        const houseGroup = new THREE.Group();
        houseGroup.position.set(-0.46, 0.26, -0.22);
        houseGroup.rotation.y = 0.35;

        const houseBody = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.24, 0.26, 3, 0.02), frenchWallMat);
        houseBody.position.y = 0.12;
        houseBody.castShadow = true;

        const houseRoof = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.16, 4), frenchRoofMat);
        houseRoof.rotation.y = Math.PI / 4;
        houseRoof.position.y = 0.32;
        houseRoof.scale.set(1.15, 1.0, 0.95);
        houseRoof.castShadow = true;

        const houseDoor = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.12, 0.015, 1, 0.002), domeRedMat);
        houseDoor.position.set(0, 0.06, 0.132);

        houseGroup.add(houseBody, houseRoof, houseDoor);

        // 5. TRẬN ĐỊA PHÁO CỔ NÚI NHỎ HƯỚNG RA BIỂN ĐÔNG
        const cannonGroup = new THREE.Group();
        cannonGroup.position.set(0.24, 0.18, 0.06);
        cannonGroup.rotation.y = 0.55; // Nòng pháo giương hướng ra biển khơi

        // Bệ pháo xoay bằng đá hoa cương
        const cannonBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.04, 16), cliffRockMat);
        cannonBase.position.y = 0.02;

        // Giá đỡ pháo bằng sắt đen
        const cannonCarriage = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.08, 0.16, 2, 0.01), cannonIronMat);
        cannonCarriage.position.y = 0.08;

        // Nòng pháo gang cổ điển vươn cao
        const cannonBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.042, 0.28, 12), cannonIronMat);
        cannonBarrel.rotation.x = Math.PI / 2 - 0.22;
        cannonBarrel.position.set(0, 0.12, 0.06);
        cannonBarrel.castShadow = true;

        // Vành đồng miệng nòng pháo
        const cannonMuzzle = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.006, 6, 12), cannonGoldMat);
        cannonMuzzle.rotation.x = Math.PI / 2 - 0.22;
        cannonMuzzle.position.set(0, 0.15, 0.18);

        cannonGroup.add(cannonBase, cannonCarriage, cannonBarrel, cannonMuzzle);

        // 6. DỐC HOA GIẤY NÚI NHỎ RỰC RỠ (ĐẶC SẢN VŨNG TÀU)
        const bougainvilleaCluster = new THREE.Group();
        const flowerSpots = [
          [-0.34, 0.32, 0.18, 0.16, 0.2],
          [-0.22, 0.36, 0.32, 0.14, 0.15],
          [-0.04, 0.32, 0.36, 0.15, -0.1],
          [0.12, 0.26, 0.28, 0.13, 0.3],
          [0.34, 0.22, -0.06, 0.15, 0.4],
          [-0.38, 0.28, -0.05, 0.12, -0.3]
        ];

        flowerSpots.forEach(([fx, fy, fz, fr, rot]) => {
          // Thảm lá xanh nền
          const leaves = new THREE.Mesh(new THREE.SphereGeometry(fr * 0.9, 10, 8), bougainvilleaLeafMat);
          leaves.scale.set(1.2, 0.65, 1.1);
          leaves.position.set(fx, fy - 0.02, fz);

          // Rặng hoa giấy hồng tím rực rỡ
          const blossom = new THREE.Mesh(new THREE.SphereGeometry(fr, 12, 10), bougainvilleaMat);
          blossom.scale.set(1.25, 0.72, 1.25);
          blossom.position.set(fx, fy, fz);
          blossom.rotation.y = rot;

          bougainvilleaCluster.add(leaves, blossom);
        });

        group.add(
          sea, waveFoam, mount, cliffBase, hillRoad,
          lighthouseGroup, houseGroup,
          cannonGroup, bougainvilleaCluster
        );
        break;
      }

      case 8: {
        // Phan Thiết: Đồi Cát Bay Mũi Né, Tháp Chăm Poshanư (TK 8), Xe Jeep Sa Mạc & Thuyền Thúng Làng Chài
        // 1. Hệ vật liệu tối ưu theo LandmarkMaterials
        const sandOrangeMat = LandmarkMaterials.getMat('ptDuneOrange', () => new THREE.MeshStandardMaterial({
          color: '#E17055',
          roughness: 0.72
        }));
        const sandGoldMat = LandmarkMaterials.getMat('ptDuneGold', () => new THREE.MeshStandardMaterial({
          color: '#F39C12',
          roughness: 0.65
        }));
        const oceanCoastMat = LandmarkMaterials.getMat('ptOceanCoast', () => new THREE.MeshStandardMaterial({
          color: '#00CEC9',
          roughness: 0.08,
          metalness: 0.15
        }));
        const waveFoamMat = LandmarkMaterials.getMat('ptWaveFoam', () => new THREE.MeshStandardMaterial({
          color: '#E0F7FA',
          roughness: 0.25,
          transparent: true,
          opacity: 0.8,
          depthWrite: false
        }));
        const chamBrickMat = LandmarkMaterials.getMat('ptChamBrickRed', () => new THREE.MeshStandardMaterial({
          color: '#B33927',
          roughness: 0.62
        }));
        const chamStoneMat = LandmarkMaterials.getMat('ptChamStonePlinth', () => new THREE.MeshStandardMaterial({
          color: '#4B5563',
          roughness: 0.7
        }));
        const chamFlameGoldMat = LandmarkMaterials.getMat('ptChamFlameGold', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          metalness: 0.88,
          roughness: 0.15,
          emissive: '#D35400',
          emissiveIntensity: 0.2
        }));
        const darkPortalMat = LandmarkMaterials.getMat('ptDarkPortal', () => new THREE.MeshStandardMaterial({
          color: '#1E272E',
          roughness: 0.5
        }));
        const basketBambooMat = LandmarkMaterials.getMat('ptBasketBamboo', () => new THREE.MeshStandardMaterial({
          color: '#D7AC87',
          roughness: 0.78
        }));
        const basketRimMat = LandmarkMaterials.getMat('ptBasketRimDark', () => new THREE.MeshStandardMaterial({
          color: '#6D4C41',
          roughness: 0.82
        }));
        const jeepBodyMat = LandmarkMaterials.getMat('ptJeepYellow', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          roughness: 0.25,
          metalness: 0.2
        }));
        const rubberTireMat = LandmarkMaterials.getMat('ptRubberTire', () => new THREE.MeshStandardMaterial({
          color: '#1E272E',
          roughness: 0.88
        }));
        const cactusGreenMat = LandmarkMaterials.getMat('ptCactusGreen', () => new THREE.MeshStandardMaterial({
          color: '#27AE60',
          roughness: 0.4
        }));
        const plumeriaWhiteMat = LandmarkMaterials.getMat('ptPlumeriaWhite', () => new THREE.MeshStandardMaterial({
          color: '#FFFDF9',
          roughness: 0.25
        }));
        const plumeriaCenterMat = LandmarkMaterials.getMat('ptPlumeriaGold', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          roughness: 0.2
        }));

        // 2. Thềm biển xanh Mũi Né & Thuyền thúng tròn tre đan làng chài
        const sea = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.05, 0.62, 2, 0.02), oceanCoastMat);
        sea.position.set(0.38, 0.025, 0.38);

        const waveFoam = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.025, 6, 18, Math.PI * 0.9), waveFoamMat);
        waveFoam.rotation.x = Math.PI / 2;
        waveFoam.position.set(0.34, 0.052, 0.32);
        waveFoam.userData = { animType: 'float_wave' };

        // Thuyền thúng tròn đặc trưng của ngư dân Phan Thiết
        const boatGroup = new THREE.Group();
        boatGroup.position.set(0.42, 0.065, 0.38);
        boatGroup.rotation.y = 0.4;

        const basketBottom = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), basketBambooMat);
        basketBottom.rotation.x = Math.PI;
        basketBottom.position.y = 0.045;
        basketBottom.castShadow = true;

        const basketRim = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 6, 16), basketRimMat);
        basketRim.rotation.x = Math.PI / 2;
        basketRim.position.y = 0.045;

        // Mái chèo gỗ gác ngang miệng thúng
        const oar = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.24, 6), basketRimMat);
        oar.rotation.z = Math.PI / 3;
        oar.position.set(0.02, 0.055, 0);

        boatGroup.add(basketBottom, basketRim, oar);

        // 3. Đồi cát bay Mũi Né cam cháy (#E17055) & Vàng óng nhấp nhô
        const dunePrimary = new THREE.Mesh(new THREE.SphereGeometry(0.72, 22, 16), sandOrangeMat);
        dunePrimary.scale.set(1.35, 0.42, 1.12);
        dunePrimary.position.set(-0.06, 0.12, 0.02);
        dunePrimary.receiveShadow = true;

        const duneRidge = new THREE.Mesh(new THREE.SphereGeometry(0.55, 18, 14), sandGoldMat);
        duneRidge.scale.set(1.22, 0.48, 0.88);
        duneRidge.position.set(-0.24, 0.16, 0.22);
        duneRidge.receiveShadow = true;

        // 4. QUẦN THỂ THÁP CHĂM POSHANƯ CỔ KÍNH (PHONG CÁCH HÒA LAI - THẾ KỶ 8)
        // Tháp Chính (Tháp A - Thờ Linga Yoni)
        const mainTowerGroup = new THREE.Group();
        mainTowerGroup.position.set(-0.14, 0.18, -0.1);

        // Bệ đá sa thạch đế tháp
        const plinth = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.08, 0.68, 2, 0.02), chamStoneMat);
        plinth.position.y = 0.04;
        plinth.receiveShadow = true;

        // Tầng 1: Thân tháp gạch nung đỏ son với trụ ốp góc
        const tier1 = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.48, 0.56, 3, 0.03), chamBrickMat);
        tier1.position.y = 0.32;
        tier1.castShadow = true;
        tier1.receiveShadow = true;

        // Tầng 2: Giật cấp thu nhỏ
        const tier2 = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.34, 0.44, 3, 0.02), chamBrickMat);
        tier2.position.y = 0.72;
        tier2.castShadow = true;

        // Tầng 3: Giật cấp tiếp
        const tier3 = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.24, 0.32, 2, 0.02), chamBrickMat);
        tier3.position.y = 1.0;

        // Đỉnh tháp nhọn hình búp ngọn lửa Chămpa dát vàng linh thiêng
        const flamePinnacle = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.34, 8), chamFlameGoldMat);
        flamePinnacle.position.y = 1.28;
        flamePinnacle.userData = { animType: 'flicker' };

        // 4 Tháp con trang trí góc tầng 2
        [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]].forEach(([cx, cz]) => {
          const cornerPinnacle = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 6), chamFlameGoldMat);
          cornerPinnacle.position.set(cx, 0.94, cz);
          mainTowerGroup.add(cornerPinnacle);
        });

        // Vòm cửa chính hướng Đông chạm khắc hoa văn ngọn lửa Chămpa
        const portalArch = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.34, 0.08, 2, 0.02), chamBrickMat);
        portalArch.position.set(0, 0.24, 0.28);

        const portalVoid = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.28, 0.05, 1, 0.01), darkPortalMat);
        portalVoid.position.set(0, 0.22, 0.3);

        const flameOverdoor = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.18, 4), chamFlameGoldMat);
        flameOverdoor.position.set(0, 0.48, 0.3);

        // Bệ thờ Linga - Yoni bằng đá sa thạch bên trong vòm tháp
        const yoniBase = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.03, 0.08, 1, 0.005), chamStoneMat);
        yoniBase.position.set(0, 0.12, 0.26);
        const lingaPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.07, 8), chamStoneMat);
        lingaPillar.position.set(0, 0.16, 0.26);

        mainTowerGroup.add(
          plinth, tier1, tier2, tier3, flamePinnacle,
          portalArch, portalVoid, flameOverdoor,
          yoniBase, lingaPillar
        );

        // Tháp Phụ (Tháp B - Thờ Thần Lửa Po Nai)
        const subTowerGroup = new THREE.Group();
        subTowerGroup.position.set(0.3, 0.15, -0.16);

        const subPlinth = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.06, 0.42, 2, 0.02), chamStoneMat);
        subPlinth.position.y = 0.03;

        const subTier1 = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.36, 0.34, 3, 0.02), chamBrickMat);
        subTier1.position.y = 0.22;
        subTier1.castShadow = true;

        const subTier2 = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.22, 0.24, 2, 0.02), chamBrickMat);
        subTier2.position.y = 0.5;

        const subPinnacle = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 8), chamFlameGoldMat);
        subPinnacle.position.y = 0.72;

        const subDoor = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.2, 0.04, 1, 0.01), darkPortalMat);
        subDoor.position.set(0, 0.16, 0.18);

        subTowerGroup.add(subPlinth, subTier1, subTier2, subPinnacle, subDoor);

        // 5. XE JEEP DÃ NGOẠI SA MẠC MŨI NÉ TÍ HON (ICONIC SAND DUNE JEEP)
        const jeepGroup = new THREE.Group();
        jeepGroup.position.set(-0.36, 0.22, 0.26);
        jeepGroup.rotation.y = -0.55; // Leo dốc cát góc 30 độ
        jeepGroup.rotation.x = -0.12;

        // Thân xe Jeep mở mui màu vàng dã ngoại
        const jeepBody = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.09, 0.16, 2, 0.01), jeepBodyMat);
        jeepBody.position.y = 0.065;
        jeepBody.castShadow = true;

        const jeepHood = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.05, 0.15, 2, 0.01), jeepBodyMat);
        jeepHood.position.set(0.08, 0.075, 0);

        // Kính chắn gió dựng đứng
        const windshield = new THREE.Mesh(new RoundedBoxGeometry(0.01, 0.07, 0.14, 1, 0.003), darkPortalMat);
        windshield.position.set(0.02, 0.13, 0);

        // Khung chống lật (Roll cage) màu đen
        const rollBar = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.007, 4, 8, Math.PI), rubberTireMat);
        rollBar.rotation.y = Math.PI / 2;
        rollBar.position.set(-0.06, 0.11, 0);

        // 4 Bánh xe vượt địa hình to bản
        [
          [0.08, 0.03, 0.085],
          [0.08, 0.03, -0.085],
          [-0.08, 0.03, 0.085],
          [-0.08, 0.03, -0.085]
        ].forEach(([jx, jy, jz]) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.024, 10), rubberTireMat);
          wheel.rotation.x = Math.PI / 2;
          wheel.position.set(jx, jy, jz);
          jeepGroup.add(wheel);
        });

        // Lốp dự phòng treo sau đuôi xe Jeep
        const spareTire = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.018, 10), rubberTireMat);
        spareTire.rotation.z = Math.PI / 2;
        spareTire.position.set(-0.15, 0.065, 0);

        jeepGroup.add(jeepBody, jeepHood, windshield, rollBar, spareTire);

        // 6. CỤM XƯƠNG RỒNG TAI THỎ & CÂY HOA SỨ CHĂM PA
        // Cụm xương rồng sa mạc Mũi Né
        const cactusGroup = new THREE.Group();
        cactusGroup.position.set(0.12, 0.16, 0.1);

        const pad1 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), cactusGreenMat);
        pad1.scale.set(1.0, 1.4, 0.35);
        pad1.position.y = 0.055;

        const pad2 = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), cactusGreenMat);
        pad2.scale.set(1.0, 1.3, 0.35);
        pad2.rotation.z = 0.45;
        pad2.position.set(0.032, 0.11, 0);

        const pad3 = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), cactusGreenMat);
        pad3.scale.set(1.0, 1.3, 0.35);
        pad3.rotation.z = -0.45;
        pad3.position.set(-0.028, 0.105, 0);

        cactusGroup.add(pad1, pad2, pad3);

        // Cây hoa sứ trắng Chăm Pa bên hiên tháp
        const plumeriaGroup = new THREE.Group();
        plumeriaGroup.position.set(-0.42, 0.18, -0.28);

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.028, 0.28, 6), chamStoneMat);
        trunk.position.y = 0.14;
        trunk.rotation.z = 0.15;

        // Tán hoa sứ trắng nhụy vàng
        [
          [-0.04, 0.28, 0.02],
          [0.03, 0.3, -0.02],
          [0, 0.33, 0.03]
        ].forEach(([px, py, pz]) => {
          const flower = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), plumeriaWhiteMat);
          flower.position.set(px, py, pz);
          const center = new THREE.Mesh(new THREE.SphereGeometry(0.01, 4, 4), plumeriaCenterMat);
          center.position.set(px, py, pz + 0.01);
          plumeriaGroup.add(flower, center);
        });
        plumeriaGroup.add(trunk);

        group.add(
          sea, waveFoam, boatGroup,
          dunePrimary, duneRidge,
          mainTowerGroup, subTowerGroup,
          jeepGroup,
          cactusGroup, plumeriaGroup
        );
        break;
      }

      case 9: {
        // Nha Trang: Tháp Trầm Hương Búp Sen Hồng Cam, Vịnh San Hô Hòn Mun, Du Thuyền & Cây Dừa Biển
        // 1. Hệ vật liệu tối ưu theo LandmarkMaterials
        const bayWaterMat = LandmarkMaterials.getMat('ntBayWaterDeep', () => new THREE.MeshStandardMaterial({
          color: '#00CEC9',
          roughness: 0.08,
          metalness: 0.15
        }));
        const seaFoamMat = LandmarkMaterials.getMat('ntSeaFoam', () => new THREE.MeshStandardMaterial({
          color: '#E0F7FA',
          roughness: 0.25,
          transparent: true,
          opacity: 0.82,
          depthWrite: false
        }));
        const whiteSandMat = LandmarkMaterials.getMat('ntWhiteSand', () => new THREE.MeshStandardMaterial({
          color: '#FAF0E6',
          roughness: 0.68
        }));
        const plazaStoneMat = LandmarkMaterials.getMat('ntPlazaStoneWhite', () => new THREE.MeshStandardMaterial({
          color: '#F5F6FA',
          roughness: 0.32
        }));
        const lotusPetalMat = LandmarkMaterials.getMat('ntLotusPetalPink', () => new THREE.MeshStandardMaterial({
          color: '#FF7675',
          emissive: '#E17055',
          emissiveIntensity: 0.28,
          roughness: 0.25
        }));
        const lotusCoreMat = LandmarkMaterials.getMat('ntLotusCoreGlass', () => new THREE.MeshStandardMaterial({
          color: '#FFEAA7',
          roughness: 0.15,
          metalness: 0.75
        }));
        const crystalOrbMat = LandmarkMaterials.getMat('ntCrystalOrbAmber', () => new THREE.MeshStandardMaterial({
          color: '#FFEAA7',
          emissive: '#F1C40F',
          emissiveIntensity: 1.1,
          roughness: 0.1,
          metalness: 0.9
        }));
        const coralGreenMat = LandmarkMaterials.getMat('ntCoralJade', () => new THREE.MeshStandardMaterial({
          color: '#00B894',
          roughness: 0.4
        }));
        const coralRedMat = LandmarkMaterials.getMat('ntCoralRed', () => new THREE.MeshStandardMaterial({
          color: '#E17055',
          roughness: 0.45
        }));
        const fishOrangeMat = LandmarkMaterials.getMat('ntFishOrange', () => new THREE.MeshStandardMaterial({
          color: '#FF9F43',
          emissive: '#EE5253',
          emissiveIntensity: 0.35,
          roughness: 0.2
        }));
        const boatWhiteMat = LandmarkMaterials.getMat('ntBoatWhite', () => new THREE.MeshStandardMaterial({
          color: '#F8F9FA',
          roughness: 0.22
        }));
        const boatBlueMat = LandmarkMaterials.getMat('ntBoatBlue', () => new THREE.MeshStandardMaterial({
          color: '#0984E3',
          roughness: 0.25
        }));
        const glassDarkMat = LandmarkMaterials.getMat('ntGlassDark', () => new THREE.MeshStandardMaterial({
          color: '#1E272E',
          metalness: 0.85,
          roughness: 0.1
        }));

        // 2. THỀM ĐỊA HÌNH: VỊNH BIỂN NHA TRANG & BÃI CÁT TRẮNG TRẦN PHÚ
        // Mặt nước biển vịnh Nha Trang xanh ngọc bích trong suốt
        const seaBay = new THREE.Mesh(new RoundedBoxGeometry(0.88, 0.05, 1.28, 3, 0.02), bayWaterMat);
        seaBay.position.set(0.28, 0.025, 0.06);
        seaBay.receiveShadow = true;

        // Vạt sóng bọt biển trắng vỗ bờ cát Trần Phú
        const coastFoam = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.026, 6, 24, Math.PI * 0.95), seaFoamMat);
        coastFoam.rotation.x = Math.PI / 2;
        coastFoam.rotation.z = -Math.PI / 2.2;
        coastFoam.position.set(-0.06, 0.052, 0.06);
        coastFoam.userData = { animType: 'float_wave' };

        // Dải cát trắng mịn cong lưỡi liềm ôm bờ vịnh
        const beachSand = new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.06, 1.34, 3, 0.03), whiteSandMat);
        beachSand.position.set(-0.16, 0.03, 0);
        beachSand.receiveShadow = true;

        // Thềm quảng trường 2/4 lát đá hoa cương trắng xám
        const plazaBase = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.07, 0.78, 3, 0.02), plazaStoneMat);
        plazaBase.position.set(-0.36, 0.038, -0.22);
        plazaBase.receiveShadow = true;

        // 3. THÁP TRẦM HƯƠNG - BÚP SEN 3 TẦNG HỒNG CAM KIÊU SA
        const towerGroup = new THREE.Group();
        towerGroup.position.set(-0.32, 0.07, -0.2);

        // Bệ hoa viên tròn 2 cấp bằng cẩm thạch trắng
        const baseRing1 = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.48, 0.08, 24), plazaStoneMat);
        baseRing1.position.y = 0.04;
        baseRing1.receiveShadow = true;

        const baseRing2 = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.06, 24), plazaStoneMat);
        baseRing2.position.y = 0.1;
        baseRing2.receiveShadow = true;

        // Lõi tháp kính vàng kim hổ phách
        const towerCore = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.35, 16), lotusCoreMat);
        towerCore.position.y = 0.75;
        towerCore.castShadow = true;

        // TẦNG 1: 6 Cánh sen lớn vươn rộng che chở
        const petalTier1 = new THREE.Group();
        petalTier1.position.y = 0.32;
        for (let p = 0; p < 6; p++) {
          const a = (p / 6) * Math.PI * 2;
          const petal = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.48, 4), lotusPetalMat);
          petal.scale.set(0.65, 1.0, 1.3);
          petal.position.set(Math.cos(a) * 0.22, 0, Math.sin(a) * 0.22);
          petal.rotation.y = -a;
          petal.rotation.z = Math.sin(a) * 0.18;
          petal.rotation.x = Math.cos(a) * -0.18;
          petal.castShadow = true;
          petalTier1.add(petal);
        }

        // TẦNG 2: 6 Cánh sen vừa e ấp xếp so le
        const petalTier2 = new THREE.Group();
        petalTier2.position.y = 0.72;
        for (let p = 0; p < 6; p++) {
          const a = (p / 6) * Math.PI * 2 + Math.PI / 6;
          const petal = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.42, 4), lotusPetalMat);
          petal.scale.set(0.6, 1.0, 1.25);
          petal.position.set(Math.cos(a) * 0.16, 0, Math.sin(a) * 0.16);
          petal.rotation.y = -a;
          petal.rotation.z = Math.sin(a) * 0.14;
          petal.rotation.x = Math.cos(a) * -0.14;
          petal.castShadow = true;
          petalTier2.add(petal);
        }

        // TẦNG 3: Búp sen vút nhọn thanh thoát
        const petalTier3 = new THREE.Group();
        petalTier3.position.y = 1.1;
        for (let p = 0; p < 4; p++) {
          const a = (p / 4) * Math.PI * 2;
          const petal = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.38, 4), lotusPetalMat);
          petal.scale.set(0.55, 1.0, 1.2);
          petal.position.set(Math.cos(a) * 0.09, 0, Math.sin(a) * 0.09);
          petal.rotation.y = -a;
          petalTier3.add(petal);
        }

        // Quả cầu ngọc thấu kính pha lê Trầm Hương xoay phát sáng trên đỉnh tháp
        const spireOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 2), crystalOrbMat);
        spireOrb.position.y = 1.48;
        spireOrb.userData = { animType: 'rotate_pulse' };

        towerGroup.add(baseRing1, baseRing2, towerCore, petalTier1, petalTier2, petalTier3, spireOrb);

        // 4. KHU BẢO TỒN VỊNH SAN HÔ HÒN MUN & ĐÀN CÁ NHIỆT ĐỚI
        const coralGroup = new THREE.Group();
        coralGroup.position.set(0.32, 0.05, 0.18);

        // Các cụm san hô ngọc bích, san hô quạt và san hô vàng đa dạng
        const coralSpots: Array<{ pos: [number, number, number]; mat: THREE.Material; rad: number }> = [
          { pos: [0.08, 0.02, 0.12], mat: coralGreenMat, rad: 0.065 },
          { pos: [-0.14, 0.02, 0.22], mat: coralRedMat, rad: 0.055 },
          { pos: [0.18, 0.02, -0.18], mat: crystalOrbMat, rad: 0.045 },
          { pos: [-0.08, 0.02, -0.28], mat: coralGreenMat, rad: 0.05 }
        ];
        coralSpots.forEach(({ pos, mat, rad }) => {
          const coral = new THREE.Mesh(new THREE.DodecahedronGeometry(rad, 1), mat);
          coral.position.set(pos[0], pos[1], pos[2]);
          coralGroup.add(coral);
        });

        // Đàn cá nhỏ nhiệt đới ngũ sắc bơi lội mềm mại
        const schoolOfFish = new THREE.Group();
        schoolOfFish.userData = { animType: 'float_wave' };
        const fishCoords = [
          [0.24, 0.09, 0.26, 0.2],
          [0.38, 0.08, 0.04, -0.4],
          [0.16, 0.09, -0.12, 0.5],
          [0.32, 0.085, -0.28, -0.1]
        ];
        fishCoords.forEach(([fx, fy, fz, rz]) => {
          const fish = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.075, 6), fishOrangeMat);
          fish.rotation.z = Math.PI / 2 + rz;
          fish.position.set(fx, fy, fz);
          schoolOfFish.add(fish);
        });

        // 5. CANO DU THUYỀN THỂ THAO CAO TỐC LƯỚT SÓNG VỊNH NHA TRANG
        const speedBoat = new THREE.Group();
        speedBoat.position.set(0.38, 0.065, 0.34);
        speedBoat.rotation.y = -0.55; // Lướt sóng hướng ra khơi

        // Thân cano màu trắng ngọc vuốt nhọn
        const hull = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.06, 0.11, 2, 0.01), boatWhiteMat);
        hull.position.y = 0.03;
        hull.castShadow = true;

        const bow = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 4), boatWhiteMat);
        bow.rotation.x = Math.PI / 2;
        bow.rotation.y = Math.PI / 4;
        bow.position.set(0, 0.03, 0.15);

        // Đường chỉ viền xanh biển thể thao
        const stripe = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.012, 0.115, 1, 0.002), boatBlueMat);
        stripe.position.set(0, 0.045, 0.02);

        // Kính chắn gió thể thao đen bóng
        const windshield = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.03, 0.09, 1, 0.003), glassDarkMat);
        windshield.position.set(0, 0.068, 0.04);

        // Vệt bọt nước rẽ sóng sau đuôi cano
        const wakeFoam = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 3), seaFoamMat);
        wakeFoam.rotation.x = -Math.PI / 2;
        wakeFoam.position.set(0, 0.01, -0.16);

        speedBoat.add(hull, bow, stripe, windshield, wakeFoam);

        // 6. HÀNG DỪA BIỂN DUYÊN DÁNG VEN BỜ CÁT TRẦN PHÚ
        const palmTree = LandmarkHelpers.createMiniPalmTree();
        palmTree.position.set(-0.44, 0.06, 0.36);
        palmTree.scale.set(0.68, 0.68, 0.68);
        palmTree.rotation.z = -0.15; // Nghiêng bóng ra biển

        const palmTree2 = LandmarkHelpers.createMiniPalmTree();
        palmTree2.position.set(-0.48, 0.06, 0.08);
        palmTree2.scale.set(0.52, 0.52, 0.52);
        palmTree2.rotation.z = -0.1;

        group.add(
          seaBay, coastFoam, beachSand, plazaBase,
          towerGroup,
          coralGroup, schoolOfFish,
          speedBoat,
          palmTree, palmTree2
        );
        break;
      }

      // =====================================================
      // PHÂN KHU 3: ĐÀ LẠT, BUÔN MA THUỘT, PLEIKU (Rose Pink)
      // =====================================================
      case 11: {
        // Đà Lạt: Ga Cổ 3 Chóp Langbiang, Đường Ray Răng Cưa Thụy Sĩ, Toa Tàu Cổ, Rừng Thông & Cẩm Tú Cầu
        // 1. Hệ vật liệu tối ưu theo LandmarkMaterials
        const plinthMat = LandmarkMaterials.getMat('dlPlinthPlateau', () => new THREE.MeshStandardMaterial({
          color: '#57606F',
          roughness: 0.65
        }));
        const wallMat = LandmarkMaterials.getMat('dlStationOchre', () => new THREE.MeshStandardMaterial({
          color: '#F39C12',
          roughness: 0.38
        }));
        const roofMat = LandmarkMaterials.getMat('dlRoofTerracotta', () => new THREE.MeshStandardMaterial({
          color: '#D35400',
          roughness: 0.3
        }));
        const stainedGlassMat = LandmarkMaterials.getMat('dlStainedGlassArt', () => new THREE.MeshStandardMaterial({
          color: '#74B9FF',
          emissive: '#0984E3',
          emissiveIntensity: 0.45,
          roughness: 0.15
        }));
        const clockDialMat = LandmarkMaterials.getMat('dlClockDialWhite', () => new THREE.MeshStandardMaterial({
          color: '#FFFDF9',
          roughness: 0.2
        }));
        const brassBezelMat = LandmarkMaterials.getMat('dlBrassBezel', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          metalness: 0.88,
          roughness: 0.18
        }));
        const railSteelMat = LandmarkMaterials.getMat('dlCogRailSteel', () => new THREE.MeshStandardMaterial({
          color: '#718093',
          metalness: 0.82,
          roughness: 0.28
        }));
        const cogRackMat = LandmarkMaterials.getMat('dlCogRackGold', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          metalness: 0.88,
          roughness: 0.16
        }));
        const trainWoodMat = LandmarkMaterials.getMat('dlVintageCoachWood', () => new THREE.MeshStandardMaterial({
          color: '#84422A',
          roughness: 0.42
        }));
        const trainRoofMat = LandmarkMaterials.getMat('dlVintageCoachRoof', () => new THREE.MeshStandardMaterial({
          color: '#2C3E50',
          roughness: 0.35
        }));
        const hydrangeaBlueMat = LandmarkMaterials.getMat('dlHydrangeaBlue', () => new THREE.MeshStandardMaterial({
          color: '#74B9FF',
          emissive: '#0984E3',
          emissiveIntensity: 0.2,
          roughness: 0.35
        }));
        const hydrangeaPinkMat = LandmarkMaterials.getMat('dlHydrangeaPink', () => new THREE.MeshStandardMaterial({
          color: '#FD79A8',
          emissive: '#E84393',
          emissiveIntensity: 0.2,
          roughness: 0.35
        }));
        const mistMat = LandmarkMaterials.getMat('dlMistCloudPlateau', () => new THREE.MeshStandardMaterial({
          color: '#FFFFFF',
          transparent: true,
          opacity: 0.38,
          roughness: 0.2,
          depthWrite: false
        }));

        // 2. Thềm đồi ga cao nguyên bằng đá phiến
        const stationPlinth = new THREE.Mesh(new RoundedBoxGeometry(1.34, 0.024, 0.94, 2, 0.01), plinthMat);
        stationPlinth.position.set(0, 0.048, 0);
        stationPlinth.receiveShadow = true;

        // 3. NHÀ GA XE LỬA ĐÀ LẠT (1932) - KIẾN TRÚC ART DECO & 3 CHÓP MÁI LANGBIANG
        const stationGroup = new THREE.Group();
        stationGroup.position.set(-0.06, 0.06, -0.2);

        // Khối nhà ga chính 3 gian đối xứng bằng bê tông màu vàng đất nung
        const body = new THREE.Mesh(new RoundedBoxGeometry(1.08, 0.48, 0.52, 4, 0.04), wallMat);
        body.position.y = 0.24;
        body.castShadow = true;
        body.receiveShadow = true;

        // Mái sảnh đón khách vươn dài phía trước (Canopy)
        const frontCanopy = new THREE.Mesh(new RoundedBoxGeometry(1.16, 0.04, 0.2, 2, 0.01), roofMat);
        frontCanopy.position.set(0, 0.46, 0.24);
        frontCanopy.castShadow = true;

        // 3 Mái chóp tam giác nhọn đặc trưng mô phỏng 3 đỉnh núi Langbiang huyền thoại
        const makeLangbiangGable = (gx: number, gy: number, gh: number, gw: number) => {
          const gable = new THREE.Mesh(new THREE.ConeGeometry(gw, gh, 4), roofMat);
          gable.rotation.y = Math.PI / 4;
          gable.position.set(gx, gy, 0.08);
          gable.castShadow = true;
          return gable;
        };

        const gL = makeLangbiangGable(-0.34, 0.72, 0.54, 0.28);
        const gM = makeLangbiangGable(0, 0.86, 0.76, 0.34); // Chóp giữa vút cao nhất
        const gR = makeLangbiangGable(0.34, 0.72, 0.54, 0.28);

        // Ô kính màu Stained Glass tròn hoa văn nghệ thuật mặt tiền
        const glassWin = new THREE.Mesh(new THREE.CircleGeometry(0.125, 20), stainedGlassMat);
        glassWin.position.set(0, 0.68, 0.29);

        // Mặt đồng hồ nhà ga cổ tròn kiểu Pháp hiển thị giờ tàu
        const clockBezel = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.012, 6, 16), brassBezelMat);
        clockBezel.position.set(0, 0.44, 0.285);

        const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), clockDialMat);
        clockFace.position.set(0, 0.44, 0.286);

        // Cửa vòm đón khách trung tâm
        const portal = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.26, 0.04, 2, 0.01), roofMat);
        portal.position.set(0, 0.13, 0.26);

        stationGroup.add(body, frontCanopy, gL, gM, gR, glassWin, clockBezel, clockFace, portal);

        // 4. ĐƯỜNG RAY RĂNG CƯA THỤY SĨ & TOA TÀU GỖ CỔ ĐIỂN ĐÀ LẠT
        const railwayGroup = new THREE.Group();
        railwayGroup.position.set(0, 0.06, 0.28);

        // Nền đá dăm rải đường ray
        const ballast = new THREE.Mesh(new RoundedBoxGeometry(1.24, 0.02, 0.32, 1, 0.01), plinthMat);
        ballast.position.y = 0.01;

        // 2 Thanh ray kim loại sáng bóng
        const trackL = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.024, 0.025), railSteelMat);
        trackL.position.set(0, 0.024, -0.065);
        const trackR = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.024, 0.025), railSteelMat);
        trackR.position.set(0, 0.024, 0.065);

        // Thanh răng cưa Thụy Sĩ bánh răng leo dốc (Cog rack) ở giữa ray
        const cogRack = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.03, 0.024), cogRackMat);
        cogRack.position.set(0, 0.028, 0);

        // Tà vẹt gỗ nâu sẫm
        for (let s = -0.54; s <= 0.54; s += 0.18) {
          const tie = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.014, 0.24), trainWoodMat);
          tie.position.set(s, 0.016, 0);
          railwayGroup.add(tie);
        }

        // Toa tàu gỗ cổ điển phong cách Đông Dương đậu trên đường ray
        const vintageCoach = new THREE.Group();
        vintageCoach.position.set(0.18, 0.05, 0);

        // Thân toa tàu bằng gỗ màu nâu hạt dẻ
        const coachBody = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.16, 0.17, 2, 0.01), trainWoodMat);
        coachBody.position.y = 0.09;
        coachBody.castShadow = true;

        // Mái cong toa tàu màu xanh than
        const coachRoof = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.03, 0.19, 2, 0.01), trainRoofMat);
        coachRoof.position.y = 0.185;

        // Cửa sổ kính dọc thân toa tàu
        [-0.14, 0, 0.14].forEach(wx => {
          const coachWinL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.055, 0.174), stainedGlassMat);
          coachWinL.position.set(wx, 0.1, 0);
          vintageCoach.add(coachWinL);
        });

        // Bánh xe thép toa tàu
        [[-0.15, 0.03, 0.08], [0.15, 0.03, 0.08], [-0.15, 0.03, -0.08], [0.15, 0.03, -0.08]].forEach(([wx, wy, wz]) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.018, 10), railSteelMat);
          wheel.rotation.x = Math.PI / 2;
          wheel.position.set(wx, wy, wz);
          vintageCoach.add(wheel);
        });

        vintageCoach.add(coachBody, coachRoof);
        railwayGroup.add(ballast, trackL, trackR, cogRack, vintageCoach);

        // 5. CỤM THÔNG BA LÁ CAO NGUYÊN & LÀN SƯƠNG MÙ BẢNG LẢNG
        const pineForest = new THREE.Group();
        const pine1 = LandmarkHelpers.createMiniPineTree();
        pine1.position.set(-0.46, 0.06, 0.16);
        pine1.scale.set(0.85, 0.85, 0.85);

        const pine2 = LandmarkHelpers.createMiniPineTree();
        pine2.position.set(0.48, 0.06, -0.25);
        pine2.scale.set(0.72, 0.72, 0.72);

        const pine3 = LandmarkHelpers.createMiniPineTree();
        pine3.position.set(0.44, 0.06, 0.38);
        pine3.scale.set(0.52, 0.52, 0.52);

        pineForest.add(pine1, pine2, pine3);

        // Làn sương mù mờ ảo bồng bềnh đặc sản Đà Lạt
        const mistCloud = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.78, 0.05, 20), mistMat);
        mistCloud.position.set(0, 0.12, 0.08);
        mistCloud.userData = { animType: 'float_wave' };

        // 6. KHÓM HOA CẨM TÚ CẦU ĐÀ LẠT RỰC RỠ SẮC XANH - HỒNG
        const flowerGroup = new THREE.Group();
        const flowerBushes: Array<{ pos: [number, number, number]; mat: THREE.Material }> = [
          { pos: [-0.32, 0.08, 0.14], mat: hydrangeaBlueMat },
          { pos: [-0.24, 0.08, 0.16], mat: hydrangeaPinkMat },
          { pos: [-0.38, 0.08, 0.36], mat: hydrangeaBlueMat },
          { pos: [0.34, 0.08, 0.14], mat: hydrangeaPinkMat },
          { pos: [0.44, 0.08, 0.12], mat: hydrangeaBlueMat }
        ];

        flowerBushes.forEach(({ pos, mat }) => {
          const bloom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.045, 1), mat);
          bloom.position.set(pos[0], pos[1], pos[2]);
          flowerGroup.add(bloom);
        });

        group.add(
          stationPlinth,
          stationGroup,
          railwayGroup,
          pineForest,
          mistCloud,
          flowerGroup
        );
        break;
      }

      case 13: {
        // Buôn Ma Thuột: Nhà Rông Đại Ngàn, Dàn Cồng Chiêng UNESCO, Lửa Trại, Voi Bản Đôn & Cây Cà Phê Robusta
        // 1. Hệ vật liệu tối ưu theo LandmarkMaterials
        const basaltSoilMat = LandmarkMaterials.getMat('bmtBasaltSoil', () => new THREE.MeshStandardMaterial({
          color: '#5C382A',
          roughness: 0.72
        }));
        const thatchMat = LandmarkMaterials.getMat('bmtThatchGold', () => new THREE.MeshStandardMaterial({
          color: '#D4A017',
          roughness: 0.75
        }));
        const timberDarkMat = LandmarkMaterials.getMat('bmtTimberLim', () => new THREE.MeshStandardMaterial({
          color: '#4E342E',
          roughness: 0.58
        }));
        const brocadeRedMat = LandmarkMaterials.getMat('bmtBrocadeRed', () => new THREE.MeshStandardMaterial({
          color: '#C0392B',
          roughness: 0.38
        }));
        const brocadeWhiteMat = LandmarkMaterials.getMat('bmtBrocadeWhite', () => new THREE.MeshStandardMaterial({
          color: '#F8F9FA',
          roughness: 0.35
        }));
        const gongBrassMat = LandmarkMaterials.getMat('bmtGongBrassShiny', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          metalness: 0.9,
          roughness: 0.15,
          emissive: '#D35400',
          emissiveIntensity: 0.2
        }));
        const fireFlameMat = LandmarkMaterials.getMat('bmtBonfireFlame', () => new THREE.MeshStandardMaterial({
          color: '#FF7675',
          emissive: '#FF3838',
          emissiveIntensity: 1.35,
          roughness: 0.2
        }));
        const fireWoodMat = LandmarkMaterials.getMat('bmtFireWood', () => new THREE.MeshStandardMaterial({
          color: '#2D3436',
          roughness: 0.85
        }));
        const elephantGrayMat = LandmarkMaterials.getMat('bmtElephantStoneGray', () => new THREE.MeshStandardMaterial({
          color: '#636E72',
          roughness: 0.65
        }));
        const ivoryTuskMat = LandmarkMaterials.getMat('bmtIvoryTuskWhite', () => new THREE.MeshStandardMaterial({
          color: '#FFFDF9',
          roughness: 0.2
        }));
        const coffeeBerryMat = LandmarkMaterials.getMat('bmtCoffeeBerryRed', () => new THREE.MeshStandardMaterial({
          color: '#C0392B',
          emissive: '#E74C3C',
          emissiveIntensity: 0.25,
          roughness: 0.2
        }));
        const coffeeFoliageMat = LandmarkMaterials.getMat('bmtCoffeeLeafGreen', () => new THREE.MeshStandardMaterial({
          color: '#1B5E20',
          roughness: 0.38
        }));
        const jarClayMat = LandmarkMaterials.getMat('bmtJarClayBrown', () => new THREE.MeshStandardMaterial({
          color: '#8E44AD',
          roughness: 0.6
        }));

        // 2. Thềm đất đỏ bazan Tây Nguyên màu nâu đỏ mỡ màng
        const ground = new THREE.Mesh(new RoundedBoxGeometry(1.34, 0.024, 0.94, 2, 0.01), basaltSoilMat);
        ground.position.set(0, 0.048, 0);
        ground.receiveShadow = true;

        // 3. NHÀ RÔNG TÂY NGUYÊN MÁI LƯỠI BÚA KHỔNG LỒ VÚT CAO
        const rongGroup = new THREE.Group();
        rongGroup.position.set(-0.12, 0.06, -0.12);

        // Sàn gỗ lim nâng cao trên 8 cột trụ vững chắc
        const floor = new THREE.Mesh(new RoundedBoxGeometry(0.88, 0.07, 0.54, 3, 0.02), timberDarkMat);
        floor.position.set(0, 0.26, 0);
        floor.castShadow = true;
        floor.receiveShadow = true;

        // 8 Cột gỗ lim tròn chống đỡ sàn
        for (let x = -0.36; x <= 0.36; x += 0.24) {
          [-0.2, 0.2].forEach(z => {
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.034, 0.26, 10), timberDarkMat);
            pillar.position.set(x, 0.13, z);
            rongGroup.add(pillar);
          });
        }

        // Vách nhà bằng gỗ & tre đan
        const walls = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.22, 0.44, 2, 0.01), timberDarkMat);
        walls.position.set(0, 0.39, 0);

        // Mái Nhà Rông hình lưỡi búa khổng lồ cao 1.6m vút nhọn kiêu hãnh rẽ gió đại ngàn
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.58, 1.65, 4), thatchMat);
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(0.85, 1.0, 0.46);
        roof.position.set(0, 1.15, 0);
        roof.castShadow = true;

        // Dải hoa văn thổ cẩm đỏ - trắng truyền thống chạy ngang mái nhà rông
        const brocadeBandRed = new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.08, 0.29, 1, 0.005), brocadeRedMat);
        brocadeBandRed.position.set(0, 0.98, 0);

        const brocadeBandWhite = new THREE.Mesh(new RoundedBoxGeometry(0.545, 0.02, 0.295, 1, 0.005), brocadeWhiteMat);
        brocadeBandWhite.position.set(0, 0.98, 0);

        // 2 Sừng trâu (Kơ-pan) vươn cao ở hai đầu đỉnh nóc nhà rông
        [-0.2, 0.2].forEach(hx => {
          const horn = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.18, 6), gongBrassMat);
          horn.rotation.z = (hx > 0 ? -1 : 1) * 0.35;
          horn.position.set(hx, 1.95, 0);
          rongGroup.add(horn);
        });

        // Cầu thang gỗ đẽo hình bầu sữa mẹ (đặc trưng chế độ mẫu hệ Ê Đê)
        const stairs = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.32, 0.04, 2, 0.01), timberDarkMat);
        stairs.position.set(0, 0.15, 0.32);
        stairs.rotation.x = 0.45;

        // Bầu sữa mẹ chạm khắc trên đầu cầu thang
        [-0.032, 0.032].forEach(sx => {
          const breast = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), timberDarkMat);
          breast.position.set(sx, 0.28, 0.26);
          rongGroup.add(breast);
        });

        rongGroup.add(floor, walls, roof, brocadeBandRed, brocadeBandWhite, stairs);

        // 4. GIÁ TREO DÀN CỒNG CHIÊNG TÂY NGUYÊN (UNESCO)
        const gongRack = new THREE.Group();
        gongRack.position.set(0.24, 0.06, 0.28);

        // Cột giá gỗ mun
        const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.42, 8), timberDarkMat);
        postL.position.set(-0.2, 0.21, 0);
        const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.42, 8), timberDarkMat);
        postR.position.set(0.2, 0.21, 0);

        const xBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.44, 8), timberDarkMat);
        xBeam.rotation.z = Math.PI / 2;
        xBeam.position.set(0, 0.4, 0);

        // 3 Chiếc Cồng Chiêng (Chiêng Mẹ, Chiêng Con, Chiêng Núi) bằng đồng thau vàng óng
        const gongs: Array<{ x: number; r: number }> = [
          { x: -0.12, r: 0.065 },
          { x: 0, r: 0.054 },
          { x: 0.12, r: 0.044 }
        ];
        gongs.forEach(({ x, r }) => {
          const gBody = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.024, 16), gongBrassMat);
          gBody.rotation.x = Math.PI / 2;
          gBody.position.set(x, 0.26, 0);

          // Núm chiêng tròn trung tâm
          const gBoss = new THREE.Mesh(new THREE.SphereGeometry(r * 0.35, 10, 10), gongBrassMat);
          gBoss.position.set(x, 0.26, 0.015);

          // Dây treo da trâu
          const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.14, 4), timberDarkMat);
          cord.position.set(x, 0.33, 0);

          gongRack.add(gBody, gBoss, cord);
        });
        gongRack.add(postL, postR, xBeam);

        // 5. ĐỐNG LỬA TRẠI BẬP BÙNG ĐẠI NGÀN (LỬA ĐÊM XOANG TÂY NGUYÊN)
        const bonfireGroup = new THREE.Group();
        bonfireGroup.position.set(-0.16, 0.06, 0.36);

        // Bó củi gỗ xếp chéo
        for (let l = 0; l < 4; l++) {
          const a = (l / 4) * Math.PI;
          const log = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.16, 6), fireWoodMat);
          log.rotation.z = Math.cos(a) * 0.4;
          log.rotation.x = Math.sin(a) * 0.4;
          log.position.set(Math.cos(a) * 0.02, 0.02, Math.sin(a) * 0.02);
          bonfireGroup.add(log);
        }

        // Ngọn lửa hồng đỏ bập bùng phát sáng nhấp nháy
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 8), fireFlameMat);
        flame.position.y = 0.08;
        flame.userData = { animType: 'flicker' };
        bonfireGroup.add(flame);

        // 6. CHÚ VOI RỪNG BẢN ĐÔN DŨNG MÃNH TÍ HON
        const elephantGroup = new THREE.Group();
        elephantGroup.position.set(-0.48, 0.06, 0.08);
        elephantGroup.rotation.y = 0.65; // Đứng gác hướng buôn làng

        // Thân voi bằng đá bazan xám
        const elBody = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.16, 0.16, 3, 0.03), elephantGrayMat);
        elBody.position.y = 0.13;
        elBody.castShadow = true;

        // Đầu voi & vòi voi vươn cao đón chào
        const elHead = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), elephantGrayMat);
        elHead.position.set(0.12, 0.16, 0);

        const elTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.026, 0.13, 8), elephantGrayMat);
        elTrunk.rotation.z = -Math.PI / 3;
        elTrunk.position.set(0.18, 0.14, 0);

        // 2 Ngà voi cong trắng muốt
        [-0.03, 0.03].forEach(tz => {
          const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.09, 6), ivoryTuskMat);
          tusk.rotation.z = -Math.PI / 2.5;
          tusk.position.set(0.17, 0.11, tz);
          elephantGroup.add(tusk);
        });

        // 4 Chân voi to vững chắc
        [
          [0.08, 0.05, 0.06],
          [0.08, 0.05, -0.06],
          [-0.08, 0.05, 0.06],
          [-0.08, 0.05, -0.06]
        ].forEach(([ex, ey, ez]) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, 0.1, 8), elephantGrayMat);
          leg.position.set(ex, ey, ez);
          elephantGroup.add(leg);
        });

        elephantGroup.add(elBody, elHead, elTrunk);

        // 7. CÂY CÀ PHÊ ROBUSTA TRĨU QUẢ CHÍN ĐỎ & CHÉ RƯỢU CẦN
        const coffeeGroup = new THREE.Group();
        coffeeGroup.position.set(0.48, 0.06, -0.22);

        const cTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.036, 0.42, 8), timberDarkMat);
        cTrunk.position.y = 0.21;
        coffeeGroup.add(cTrunk);

        // Tán lá xanh đậm Robusta
        [
          [0, 0.38, 0, 0.24],
          [0, 0.52, 0, 0.18],
          [0, 0.62, 0, 0.12]
        ].forEach(([cx, cy, cz, cr]) => {
          const foliage = new THREE.Mesh(new THREE.SphereGeometry(cr, 10, 8), coffeeFoliageMat);
          foliage.scale.set(1.2, 0.65, 1.2);
          foliage.position.set(cx, cy, cz);
          coffeeGroup.add(foliage);
        });

        // Chùm quả cà phê đỏ mọng xen kẽ
        const berries: Array<[number, number, number]> = [
          [0.16, 0.36, 0.08],
          [-0.14, 0.38, -0.09],
          [0.08, 0.48, -0.12],
          [-0.09, 0.5, 0.11]
        ];
        berries.forEach(([bx, by, bz]) => {
          const berry = new THREE.Mesh(new THREE.SphereGeometry(0.026, 6, 6), coffeeBerryMat);
          berry.position.set(bx, by, bz);
          coffeeGroup.add(berry);
        });

        // Ché rượu cần gốm nung cắm cần trúc bên hiên
        const wineJar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.11, 10), jarClayMat);
        wineJar.position.set(0.24, 0.11, 0.08);

        const cane = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.18, 4), gongBrassMat);
        cane.rotation.z = 0.35;
        cane.position.set(0.26, 0.17, 0.08);

        group.add(
          ground,
          rongGroup,
          gongRack,
          bonfireGroup,
          elephantGroup,
          coffeeGroup,
          wineJar, cane
        );
        break;
      }

      case 14: {
        // Pleiku: Biển Hồ Tơ Nưng ("Đôi Mắt Pleiku"), Rừng Cao Su Chư Păh Mùa Lá Vàng, Đồi Chè & Thuyền Độc Mộc
        // 1. Hệ vật liệu tối ưu theo LandmarkMaterials
        const basaltSoilMat = LandmarkMaterials.getMat('pkBasaltSoilRed', () => new THREE.MeshStandardMaterial({
          color: '#6E3826',
          roughness: 0.75
        }));
        const basaltRockMat = LandmarkMaterials.getMat('pkBasaltCliffDark', () => new THREE.MeshStandardMaterial({
          color: '#4A2A1E',
          roughness: 0.82
        }));
        const lakeWaterMat = LandmarkMaterials.getMat('pkTnungLakeEmerald', () => new THREE.MeshStandardMaterial({
          color: '#00CEC9',
          roughness: 0.08,
          metalness: 0.15
        }));
        const lakeShoreMat = LandmarkMaterials.getMat('pkLakeShorePebble', () => new THREE.MeshStandardMaterial({
          color: '#8D5B4C',
          roughness: 0.7
        }));
        const rubberBarkMat = LandmarkMaterials.getMat('pkRubberBarkGray', () => new THREE.MeshStandardMaterial({
          color: '#B2BEC3',
          roughness: 0.65
        }));
        const autumnGoldMat = LandmarkMaterials.getMat('pkAutumnLeafGold', () => new THREE.MeshStandardMaterial({
          color: '#F39C12',
          emissive: '#E67E22',
          emissiveIntensity: 0.25,
          roughness: 0.38
        }));
        const teaGreenMat = LandmarkMaterials.getMat('pkTeaRowGreen', () => new THREE.MeshStandardMaterial({
          color: '#27AE60',
          roughness: 0.45
        }));
        const timberMat = LandmarkMaterials.getMat('pkTimberPavilion', () => new THREE.MeshStandardMaterial({
          color: '#4E342E',
          roughness: 0.58
        }));
        const dugoutCanoeMat = LandmarkMaterials.getMat('pkDugoutCanoeWood', () => new THREE.MeshStandardMaterial({
          color: '#5D4037',
          roughness: 0.68
        }));

        // 2. Thềm đồi núi đất đỏ bazan Pleiku
        const plateauBase = new THREE.Mesh(new RoundedBoxGeometry(1.34, 0.024, 0.94, 2, 0.01), basaltSoilMat);
        plateauBase.position.set(0, 0.048, 0);
        plateauBase.receiveShadow = true;

        // 3. BIỂN HỒ TƠ NƯNG (MIỆNG NÚI LỬA CỔ "ĐÔI MẮT PLEIKU")
        const calderaGroup = new THREE.Group();
        calderaGroup.position.set(-0.1, 0.06, 0.02);

        // Vách miệng núi lửa cổ bằng đá bazan nâu đỏ
        const craterRim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.74, 0.28, 28), basaltRockMat);
        craterRim.scale.set(1.18, 1.0, 0.92);
        craterRim.position.y = 0.14;
        craterRim.castShadow = true;
        craterRim.receiveShadow = true;

        // Bờ thoải ven miệng hồ
        const craterInner = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.48, 0.08, 24), lakeShoreMat);
        craterInner.scale.set(1.18, 1.0, 0.92);
        craterInner.position.y = 0.26;

        // Mặt nước Biển Hồ Tơ Nưng phẳng lặng như gương soi, xanh ngọc bích sâu thẳm
        const lakeMirror = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.04, 28), lakeWaterMat);
        lakeMirror.scale.set(1.18, 1.0, 0.92);
        lakeMirror.position.y = 0.28;

        // Thuyền độc mộc người Jrai lững lờ trôi trên Biển Hồ
        const dugoutCanoe = new THREE.Group();
        dugoutCanoe.position.set(0.06, 0.31, 0.04);
        dugoutCanoe.rotation.y = 0.4;
        dugoutCanoe.userData = { animType: 'float_wave' };

        const canoeHull = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.03, 0.06, 2, 0.005), dugoutCanoeMat);
        canoeHull.position.y = 0.015;
        const canoeProw = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 4), dugoutCanoeMat);
        canoeProw.rotation.x = Math.PI / 2;
        canoeProw.position.set(0, 0.015, 0.14);
        const canoePaddle = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.14, 4), timberMat);
        canoePaddle.rotation.z = Math.PI / 3;
        canoePaddle.position.set(0.03, 0.03, 0);

        dugoutCanoe.add(canoeHull, canoeProw, canoePaddle);

        // Đài vọng cảnh Biển Hồ (Viewpoint Pavilion) vươn ra mép vách đá
        const pavilionGroup = new THREE.Group();
        pavilionGroup.position.set(-0.48, 0.26, -0.16);
        pavilionGroup.rotation.y = 0.6;

        const pavDeck = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.03, 0.2, 2, 0.01), timberMat);
        pavDeck.position.y = 0.02;

        const pavPillar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6), timberMat);
        pavPillar1.position.set(-0.08, 0.1, -0.06);
        const pavPillar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6), timberMat);
        pavPillar2.position.set(0.08, 0.1, -0.06);
        const pavPillar3 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6), timberMat);
        pavPillar3.position.set(-0.08, 0.1, 0.06);
        const pavPillar4 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6), timberMat);
        pavPillar4.position.set(0.08, 0.1, 0.06);

        const pavRoof = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.12, 4), basaltSoilMat);
        pavRoof.rotation.y = Math.PI / 4;
        pavRoof.position.y = 0.22;
        pavRoof.castShadow = true;

        pavilionGroup.add(pavDeck, pavPillar1, pavPillar2, pavPillar3, pavPillar4, pavRoof);

        calderaGroup.add(craterRim, craterInner, lakeMirror, dugoutCanoe, pavilionGroup);

        // 4. RỪNG CAO SU CHƯ PĂH MÙA THAY LÁ VÀNG RUỘM
        const rubberForest = new THREE.Group();
        const makeRubberTree = (tx: number, tz: number, h: number) => {
          const tGroup = new THREE.Group();
          tGroup.position.set(tx, 0.06, tz);

          // Thân cây cao su thẳng tắp màu vỏ xám trắng
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.038, h, 8), rubberBarkMat);
          trunk.position.y = h / 2;
          trunk.castShadow = true;

          // Vết rạch cạo mủ xoắn ốc quanh thân cây
          const spiralCut = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.004, 4, 12, Math.PI), timberMat);
          spiralCut.rotation.x = Math.PI / 2.5;
          spiralCut.position.y = h * 0.42;

          // Chén hứng mủ cao su tí hon
          const latexCup = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.02, 6), timberMat);
          latexCup.position.set(0.035, h * 0.38, 0);

          // Tán lá cao su vàng rực mùa trút lá
          const crownLower = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), autumnGoldMat);
          crownLower.scale.set(1.15, 0.7, 1.15);
          crownLower.position.y = h + 0.04;

          const crownUpper = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), autumnGoldMat);
          crownUpper.scale.set(1.05, 0.75, 1.05);
          crownUpper.position.set(0.04, h + 0.15, 0);

          tGroup.add(trunk, spiralCut, latexCup, crownLower, crownUpper);
          return tGroup;
        };

        const rt1 = makeRubberTree(0.48, -0.22, 0.68);
        const rt2 = makeRubberTree(0.52, 0.14, 0.62);
        const rt3 = makeRubberTree(0.38, 0.38, 0.54);
        const rt4 = makeRubberTree(-0.46, -0.42, 0.58);

        // Thảm lá vàng rụng phủ kín mặt đất
        const fallenLeaves: Array<{ x: number; z: number; r: number }> = [
          { x: 0.46, z: -0.2, r: 0.14 },
          { x: 0.5, z: 0.16, r: 0.12 },
          { x: 0.36, z: 0.36, r: 0.11 }
        ];
        fallenLeaves.forEach(({ x, z, r }) => {
          const leafCarpet = new THREE.Mesh(new THREE.CircleGeometry(r, 10), autumnGoldMat);
          leafCarpet.rotation.x = -Math.PI / 2;
          leafCarpet.position.set(x, 0.065, z);
          rubberForest.add(leafCarpet);
        });

        rubberForest.add(rt1, rt2, rt3, rt4);

        // 5. ĐỒI CHÈ BIỂN HỒ XANH MƯỚT (BIỂN HỒ CHÈ TRĂM TUỔI)
        const teaHillGroup = new THREE.Group();
        teaHillGroup.position.set(-0.28, 0.06, 0.44);

        // 3 Luống chè uốn lượn hình cánh cung nhấp nhô
        [-0.08, 0, 0.08].forEach((offsetZ, idx) => {
          const teaRidge = new THREE.Mesh(new THREE.TorusGeometry(0.24 + idx * 0.08, 0.032, 6, 16, Math.PI * 0.7), teaGreenMat);
          teaRidge.rotation.x = Math.PI / 2;
          teaRidge.rotation.z = -0.3;
          teaRidge.position.set(0, 0.02, offsetZ);
          teaHillGroup.add(teaRidge);
        });

        group.add(
          plateauBase,
          calderaGroup,
          rubberForest,
          teaHillGroup
        );
        break;
      }

      // =====================================================
      // PHÂN KHU 4: QUY NHƠN, HỘI AN, ĐÀ NẴNG (Coral Orange)
      // =====================================================
      case 16: {
        // Quy Nhơn: Eo Gió Kỳ Vĩ (Đường Đi Bộ Lan Can Đỏ Trắng), Cặp Tháp Đôi Chăm Pa (Thần Chim Garuda) & Bãi Đá Trứng
        // 1. Hệ vật liệu tối ưu theo LandmarkMaterials
        const oceanMat = LandmarkMaterials.getMat('qnOceanBlueDeep', () => new THREE.MeshStandardMaterial({
          color: '#0984E3',
          roughness: 0.08,
          metalness: 0.15
        }));
        const waveFoamMat = LandmarkMaterials.getMat('qnWaveFoamWhite', () => new THREE.MeshStandardMaterial({
          color: '#E0F7FA',
          roughness: 0.25,
          transparent: true,
          opacity: 0.82,
          depthWrite: false
        }));
        const cliffMat = LandmarkMaterials.getMat('qnCliffStoneDark', () => new THREE.MeshStandardMaterial({
          color: '#636E72',
          roughness: 0.75
        }));
        const cliffBaseMat = LandmarkMaterials.getMat('qnCliffStoneBase', () => new THREE.MeshStandardMaterial({
          color: '#4B5563',
          roughness: 0.82
        }));
        const pathConcreteMat = LandmarkMaterials.getMat('qnPathConcrete', () => new THREE.MeshStandardMaterial({
          color: '#DFE6E9',
          roughness: 0.45
        }));
        const railRedMat = LandmarkMaterials.getMat('qnRailRed', () => new THREE.MeshStandardMaterial({
          color: '#D63031',
          roughness: 0.35
        }));
        const railWhiteMat = LandmarkMaterials.getMat('qnRailWhite', () => new THREE.MeshStandardMaterial({
          color: '#F8F9FA',
          roughness: 0.35
        }));
        const eggStoneMat = LandmarkMaterials.getMat('qnEggStoneGray', () => new THREE.MeshStandardMaterial({
          color: '#718093',
          roughness: 0.35
        }));
        const chamBrickMat = LandmarkMaterials.getMat('qnChamBrickRed', () => new THREE.MeshStandardMaterial({
          color: '#B3391E',
          roughness: 0.62
        }));
        const chamStoneMat = LandmarkMaterials.getMat('qnChamPlinthStone', () => new THREE.MeshStandardMaterial({
          color: '#374151',
          roughness: 0.72
        }));
        const garudaGoldMat = LandmarkMaterials.getMat('qnGarudaGold', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          metalness: 0.88,
          roughness: 0.16,
          emissive: '#D35400',
          emissiveIntensity: 0.22
        }));
        const portalDarkMat = LandmarkMaterials.getMat('qnPortalDark', () => new THREE.MeshStandardMaterial({
          color: '#1E272E',
          roughness: 0.6
        }));

        // 2. Thềm biển xanh Quy Nhơn & Bãi Đá Trứng Hoàng Hậu
        const sea = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.04, 0.78, 3, 0.02), oceanMat);
        sea.position.set(0.04, 0.042, 0.28);
        sea.receiveShadow = true;

        // Vạt sóng bọt biển trắng muốt vỗ bờ đá Eo Gió
        const waveFoam = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.03, 6, 24, Math.PI * 0.95), waveFoamMat);
        waveFoam.rotation.x = Math.PI / 2;
        waveFoam.rotation.z = -0.35;
        waveFoam.position.set(0.12, 0.054, 0.22);
        waveFoam.userData = { animType: 'float_wave' };

        // Bãi Đá Trứng (Ghềnh Ráng Tiên Sa): Những hòn đá cuội tròn nhẵn như quả trứng khổng lồ
        const eggStonesGroup = new THREE.Group();
        const eggPositions: Array<{ x: number; y: number; z: number; rx: number; ry: number }> = [
          { x: 0.32, y: 0.052, z: 0.36, rx: 0.055, ry: 0.042 },
          { x: 0.42, y: 0.052, z: 0.32, rx: 0.048, ry: 0.038 },
          { x: 0.38, y: 0.052, z: 0.44, rx: 0.062, ry: 0.048 },
          { x: 0.26, y: 0.052, z: 0.42, rx: 0.05, ry: 0.04 },
          { x: 0.48, y: 0.052, z: 0.4, rx: 0.042, ry: 0.035 }
        ];
        eggPositions.forEach(({ x, y, z, rx, ry }) => {
          const egg = new THREE.Mesh(new THREE.SphereGeometry(rx, 10, 8), eggStoneMat);
          egg.scale.set(1.15, ry / rx, 1.0);
          egg.position.set(x, y + ry * 0.8, z);
          eggStonesGroup.add(egg);
        });

        // 3. EO GIÓ KỲ VĨ: VÁCH ĐÁ HÌNH CÁNH CUNG & CON ĐƯỜNG VEN BIỂN
        const eoGioGroup = new THREE.Group();
        eoGioGroup.position.set(0.14, 0.06, 0.08);

        // Vách núi đá Eo Gió uốn cong hình cánh cung ôm trọn bờ vịnh
        const cliffArc = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.16, 12, 28, Math.PI * 1.05), cliffMat);
        cliffArc.rotation.x = Math.PI / 2;
        cliffArc.rotation.z = -0.3;
        cliffArc.position.set(0, 0.08, 0);
        cliffArc.castShadow = true;
        cliffArc.receiveShadow = true;

        const cliffBacking = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.22, 0.36, 2, 0.04), cliffBaseMat);
        cliffBacking.position.set(0.24, 0.1, -0.16);
        cliffBacking.receiveShadow = true;

        // Con đường đi bộ lát bê tông uốn lượn ven vách đá Eo Gió
        const cliffPath = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.026, 4, 24, Math.PI * 0.95), pathConcreteMat);
        cliffPath.rotation.x = Math.PI / 2;
        cliffPath.rotation.z = -0.3;
        cliffPath.position.set(0, 0.21, 0);

        // Lan can bảo vệ đặc trưng của con đường Eo Gió (Sọc đỏ - trắng uốn cong)
        const railCount = 10;
        for (let i = 0; i <= railCount; i++) {
          const a = -0.3 + (i / railCount) * (Math.PI * 0.95);
          const px = Math.cos(a) * 0.47;
          const pz = Math.sin(a) * 0.47;

          // Cọc lan can đỏ
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.065, 4), (i % 2 === 0 ? railRedMat : railWhiteMat));
          post.position.set(px, 0.24, pz);
          eoGioGroup.add(post);
        }

        eoGioGroup.add(cliffArc, cliffBacking, cliffPath);

        // 4. QUẦN THỂ THÁP ĐÔI CHĂM PA (THÁP HƯNG THẠNH - THẾ KỶ 12)
        // Cặp tháp đứng song song với phong cách kiến trúc Champa pha trộn nghệ thuật Khmer độc đáo
        const towersGroup = new THREE.Group();
        towersGroup.position.set(-0.28, 0.06, -0.16);

        // Bệ đá sa thạch chung của Tháp Đôi
        const commonPlinth = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.08, 0.54, 2, 0.02), chamStoneMat);
        commonPlinth.position.y = 0.04;
        commonPlinth.receiveShadow = true;
        towersGroup.add(commonPlinth);

        const makeChamTwinTower = (offsetX: number, offsetZ: number, scaleY: number, hasGaruda: boolean) => {
          const tGroup = new THREE.Group();
          tGroup.position.set(offsetX, 0.08, offsetZ);

          // Thân tháp gạch nung đỏ sẫm vuông vức với các gờ chỉ nổi
          const towerBody = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.56 * scaleY, 0.34, 3, 0.025), chamBrickMat);
          towerBody.position.y = 0.28 * scaleY;
          towerBody.castShadow = true;
          towerBody.receiveShadow = true;

          // Mái tháp giật 3 tầng vòm cong vút độc đáo
          const tier1 = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.22 * scaleY, 0.28, 2, 0.02), chamBrickMat);
          tier1.position.y = (0.56 + 0.11) * scaleY;

          const tier2 = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.16 * scaleY, 0.2, 2, 0.015), chamBrickMat);
          tier2.position.y = (0.56 + 0.22 + 0.08) * scaleY;

          // Đỉnh chóp ngọn tháp nhọn vút dát vàng
          const apexSpire = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.24 * scaleY, 8), garudaGoldMat);
          apexSpire.position.y = (0.56 + 0.22 + 0.16 + 0.12) * scaleY;
          apexSpire.userData = { animType: 'flicker' };

          // 4 Tượng thần chim Garuda (Thần điểu giang cánh) tại 4 góc mái tầng 1
          if (hasGaruda) {
            [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]].forEach(([gx, gz]) => {
              const garuda = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.1, 4), garudaGoldMat);
              garuda.rotation.y = Math.PI / 4;
              garuda.position.set(gx, (0.56 + 0.18) * scaleY, gz);
              tGroup.add(garuda);
            });
          }

          // Vòm cửa chính hướng Đông chạm trổ sâu thẳm
          const archDoor = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.26 * scaleY, 0.04, 1, 0.008), portalDarkMat);
          archDoor.position.set(0, 0.18 * scaleY, 0.17);

          const archGable = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.14 * scaleY, 4), garudaGoldMat);
          archGable.position.set(0, 0.36 * scaleY, 0.175);

          tGroup.add(towerBody, tier1, tier2, apexSpire, archDoor, archGable);
          return tGroup;
        };

        // Tháp Lớn (Tháp Bắc - cao hơn, uy nghi)
        const bigTower = makeChamTwinTower(-0.16, 0, 1.15, true);
        // Tháp Nhỏ (Tháp Nam - thấp hơn, thanh thoát đứng song song)
        const smallTower = makeChamTwinTower(0.18, 0, 0.95, true);

        towersGroup.add(bigTower, smallTower);

        group.add(
          sea,
          waveFoam,
          eggStonesGroup,
          eoGioGroup,
          towersGroup
        );
        break;
      }

      case 18: {
        // Hội An: Chùa Cầu Lai Viễn Kiều (1593), Tường Vàng Phố Cổ, Giàn Hoa Giấy, Đèn Lồng Lụa Ngũ Sắc & Thuyền Tam Bản Hoa Đăng Sông Hoài
        // 1. Hệ vật liệu cao cấp chuẩn Di sản UNESCO LandmarkMaterials PBR
        const hoaiRiverWaterMat = LandmarkMaterials.getMat('haHoaiRiverEmerald', () => new THREE.MeshStandardMaterial({
          color: '#00B894',
          roughness: 0.08,
          metalness: 0.15
        }));
        const stonePierMat = LandmarkMaterials.getMat('haStonePier', () => new THREE.MeshStandardMaterial({
          color: '#57606F',
          roughness: 0.72,
          metalness: 0.08
        }));
        const bridgeWoodVermilionMat = LandmarkMaterials.getMat('haVermilionWood', () => new THREE.MeshStandardMaterial({
          color: '#8B1A1A',
          roughness: 0.38,
          metalness: 0.06
        }));
        const timberDarkMat = LandmarkMaterials.getMat('haTimberDark', () => new THREE.MeshStandardMaterial({
          color: '#3E2723',
          roughness: 0.58
        }));
        const yinYangTileMat = LandmarkMaterials.getMat('haYinYangMossTile', () => new THREE.MeshStandardMaterial({
          color: '#374151',
          roughness: 0.68
        }));
        const goldPlaqueMat = LandmarkMaterials.getMat('haGoldPlaque', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          metalness: 0.92,
          roughness: 0.14,
          emissive: '#D35400',
          emissiveIntensity: 0.35
        }));
        const yellowWallMat = LandmarkMaterials.getMat('haYellowHouseWall', () => new THREE.MeshStandardMaterial({
          color: '#E1B12C',
          roughness: 0.45
        }));
        const bougainvilleaPinkMat = LandmarkMaterials.getMat('haBougainvilleaPink', () => new THREE.MeshStandardMaterial({
          color: '#FD79A8',
          emissive: '#E84393',
          emissiveIntensity: 0.38,
          roughness: 0.3
        }));
        const bougainvilleaLeafMat = LandmarkMaterials.getMat('haBougainvilleaLeaf', () => new THREE.MeshStandardMaterial({
          color: '#27AE60',
          roughness: 0.42
        }));
        const hoaDangGlowMat = LandmarkMaterials.getMat('haHoaDangGlow', () => new THREE.MeshStandardMaterial({
          color: '#FFEAA7',
          emissive: '#F1C40F',
          emissiveIntensity: 1.35,
          roughness: 0.1
        }));
        const boatWoodMat = LandmarkMaterials.getMat('haSampanWood', () => new THREE.MeshStandardMaterial({
          color: '#6D4C41',
          roughness: 0.65
        }));
        const nonLaMat = LandmarkMaterials.getMat('haNonLaStraw', () => new THREE.MeshStandardMaterial({
          color: '#F5E6CC',
          roughness: 0.68
        }));

        // 2. DÒNG SÔNG HOÀI THƠ MỘNG & BỜ KÈ ĐÁ CỔ BẾN NƯỚC
        const river = new THREE.Mesh(new RoundedBoxGeometry(1.36, 0.035, 0.94, 3, 0.02), hoaiRiverWaterMat);
        river.position.set(0, 0.042, 0);
        river.receiveShadow = true;

        // Bờ kè đá cổ hai bên đầu cầu có bậc tam cấp dẫn xuống bến sông
        [-0.58, 0.58].forEach(kx => {
          const quay = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.08, 0.96, 2, 0.02), stonePierMat);
          quay.position.set(kx, 0.04, 0);
          quay.receiveShadow = true;

          // Bậc đá tam cấp dẫn xuống mặt nước sông Hoài
          const step = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.03, 0.34, 2, 0.005), stonePierMat);
          step.position.set(kx > 0 ? kx - 0.12 : kx + 0.12, 0.02, 0.24);
          group.add(quay, step);
        });

        // 3. CHÙA CẦU LAI VIỄN KIỀU (THẾ KỶ 17) - DI SẢN KIẾN TRÚC GỖ SƠN SON THẾP VÀNG
        const bridgeGroup = new THREE.Group();
        bridgeGroup.position.set(0, 0.05, 0);

        // A. 2 Mố trụ cầu bằng đá sa thạch nâng đỡ vòm cầu trong lòng sông
        [-0.26, 0.26].forEach(px => {
          const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 0.16, 12), stonePierMat);
          pier.position.set(px, 0.08, 0);

          // Chân mố trụ đá có gờ chịu lực
          const pierBase = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.04, 0.28, 2, 0.01), stonePierMat);
          pierBase.position.set(px, 0.02, 0);
          bridgeGroup.add(pier, pierBase);
        });

        // B. Thân cầu vòm gỗ hình cánh cung uốn cong mềm mại bắc qua sông
        const bridgeArch = new THREE.Mesh(new RoundedBoxGeometry(1.14, 0.14, 0.52, 4, 0.03), bridgeWoodVermilionMat);
        bridgeArch.position.y = 0.18;
        bridgeArch.castShadow = true;
        bridgeArch.receiveShadow = true;

        // Dầm gỗ chịu lực lộ thiên dưới đáy vòm cầu
        [-0.38, -0.14, 0.14, 0.38].forEach(dx => {
          const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.50, 8), timberDarkMat);
          beam.rotation.x = Math.PI / 2;
          beam.position.set(dx, 0.12, 0);
          bridgeGroup.add(beam);
        });

        // Dải lan can tay vịn gỗ lim son đỏ viền vàng chạy dọc hai mạn cầu
        [-0.24, 0.24].forEach(rz => {
          const handrail = new THREE.Mesh(new RoundedBoxGeometry(1.12, 0.026, 0.03, 1, 0.005), goldPlaqueMat);
          handrail.position.set(0, 0.26, rz);

          // Các con tiện gỗ lim chạm trổ đều đặn
          for (let b = -0.48; b <= 0.48; b += 0.12) {
            const baluster = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.07, 6), bridgeWoodVermilionMat);
            baluster.position.set(b, 0.22, rz);
            bridgeGroup.add(baluster);
          }
          bridgeGroup.add(handrail);
        });

        // C. Gian chùa thờ Bắc Đế Trấn Vũ tọa lạc giữa thân cầu
        const templeHouse = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.32, 0.44, 3, 0.02), bridgeWoodVermilionMat);
        templeHouse.position.set(0, 0.38, 0);
        templeHouse.castShadow = true;

        // Cột gỗ lim son đỏ đỡ hiên chùa
        const templeCols = [
          [-0.32, -0.20], [0.32, -0.20], [-0.32, 0.20], [0.32, 0.20]
        ];
        templeCols.forEach(([cx, cz]) => {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.30, 8), bridgeWoodVermilionMat);
          col.position.set(cx, 0.36, cz);
          col.castShadow = true;
          bridgeGroup.add(col);
        });

        // Cửa võng gỗ lá sách sơn son thếp vàng mặt trước chùa
        const templeDoor = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.20, 0.02, 2, 0.004), timberDarkMat);
        templeDoor.position.set(0, 0.34, 0.222);
        bridgeGroup.add(templeDoor);

        // D. Mái ngói âm dương rêu phong uốn cong vút 4 góc kiểu mái thuyền phố cổ
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.64, 0.34, 4), yinYangTileMat);
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(1.24, 0.65, 0.94);
        roof.position.set(0, 0.66, 0);
        roof.castShadow = true;

        // Bờ nóc uốn lượn có đắp nổi hoa văn mạ vàng và bảo châu hồ lô
        const roofRidge = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.025, 0.03), goldPlaqueMat);
        roofRidge.position.set(0, 0.77, 0);
        const roofFinial = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), goldPlaqueMat);
        roofFinial.position.set(0, 0.80, 0);

        // E. Hoành phi thếp vàng sơn son "LAI VIỄN KIỀU" (來遠橋) do Chúa Nguyễn ban tặng
        const plaque = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.055, 0.02, 2, 0.004), goldPlaqueMat);
        plaque.position.set(0, 0.52, 0.235);
        const plaqueTrim = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.062, 0.015), bridgeWoodVermilionMat);
        plaqueTrim.position.set(0, 0.52, 0.232);

        // F. Cặp Linh Thú Thần Khỉ (Thân) và Thần Chó (Tuất) bằng gỗ mít tọa trên bệ đá hai đầu cầu
        // Đầu cầu phía Tây (Tượng Khỉ - Thần)
        const monkeyBase = new THREE.Mesh(new RoundedBoxGeometry(0.065, 0.03, 0.065, 2, 0.005), stonePierMat);
        monkeyBase.position.set(-0.48, 0.26, 0.18);
        const monkeyBody = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.065, 8), timberDarkMat);
        monkeyBody.position.set(-0.48, 0.305, 0.18);
        const monkeyHead = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), timberDarkMat);
        monkeyHead.position.set(-0.48, 0.35, 0.18);

        // Đầu cầu phía Đông (Tượng Chó - Tuất)
        const dogBase = new THREE.Mesh(new RoundedBoxGeometry(0.065, 0.03, 0.065, 2, 0.005), stonePierMat);
        dogBase.position.set(0.48, 0.26, 0.18);
        const dogBody = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.075, 8), timberDarkMat);
        dogBody.position.set(0.48, 0.305, 0.18);
        const dogHead = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), timberDarkMat);
        dogHead.position.set(0.48, 0.355, 0.18);

        bridgeGroup.add(
          bridgeArch,
          templeHouse,
          roof,
          roofRidge,
          roofFinial,
          plaqueTrim,
          plaque,
          monkeyBase,
          monkeyBody,
          monkeyHead,
          dogBase,
          dogBody,
          dogHead
        );

        // 4. NHÀ CỔ TƯỜNG VÀNG PHỐ HỘI & GIÀN HOA GIẤY HỒNG BUÔNG RỦ
        const townGroup = new THREE.Group();

        // Nhà cổ góc Tây (Tường vàng hoàng yến đặc trưng Hội An)
        const houseW = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.38, 0.32, 2, 0.02), yellowWallMat);
        houseW.position.set(-0.56, 0.23, -0.28);
        houseW.castShadow = true;
        const roofW = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.18, 4), yinYangTileMat);
        roofW.rotation.y = Math.PI / 4;
        roofW.position.set(-0.56, 0.50, -0.28);

        // Cửa gỗ và chấn song lầu 2 nhà Tây
        const windowW = new THREE.Mesh(new RoundedBoxGeometry(0.09, 0.08, 0.02, 2, 0.004), timberDarkMat);
        windowW.position.set(-0.56, 0.32, -0.118);
        townGroup.add(houseW, roofW, windowW);

        // Nhà cổ góc Đông (Nhà phố 2 tầng tường vàng ngói âm dương)
        const houseE = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.38, 0.32, 2, 0.02), yellowWallMat);
        houseE.position.set(0.56, 0.23, 0.28);
        houseE.castShadow = true;
        const roofE = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.18, 4), yinYangTileMat);
        roofE.rotation.y = Math.PI / 4;
        roofE.position.set(0.56, 0.50, 0.28);

        const windowE = new THREE.Mesh(new RoundedBoxGeometry(0.09, 0.08, 0.02, 2, 0.004), timberDarkMat);
        windowE.position.set(0.56, 0.32, 0.118);
        townGroup.add(houseE, roofE, windowE);

        // Giàn hoa giấy sum sê màu hồng rực rỡ buông rủ từ mái hiên nhà cổ
        const bougainvilleaLeaves = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 8), bougainvilleaLeafMat);
        bougainvilleaLeaves.scale.set(1.5, 0.7, 1.2);
        bougainvilleaLeaves.position.set(-0.48, 0.44, -0.19);

        const bougainvilleaFlowers = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), bougainvilleaPinkMat);
        bougainvilleaFlowers.scale.set(1.4, 0.8, 1.3);
        bougainvilleaFlowers.position.set(-0.46, 0.42, -0.18);

        // Chùm hoa giấy rủ thứ hai bên nhà Đông
        const bougainvilleaEast = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), bougainvilleaPinkMat);
        bougainvilleaEast.position.set(0.48, 0.43, 0.18);

        townGroup.add(bougainvilleaLeaves, bougainvilleaFlowers, bougainvilleaEast);

        // 5. DÃY ĐÈN LỒNG LỤA PHỐ HỘI NGŨ SẮC LUNG LINH
        const lanternGroup = new THREE.Group();
        const lanternColors = ['#FF4757', '#F1C40F', '#00CEC9', '#A29BFE', '#FD79A8'];
        lanternColors.forEach((hex, idx) => {
          const lMat = LandmarkMaterials.getMat(`haSilkLantern_${hex}`, () => new THREE.MeshStandardMaterial({
            color: hex,
            emissive: hex,
            emissiveIntensity: 1.05,
            roughness: 0.25
          }));
          const lx = -0.4 + idx * 0.2;

          // Đèn lồng quả trám mạn trước
          const lFront = new THREE.Mesh(new THREE.OctahedronGeometry(0.048, 1), lMat);
          lFront.scale.set(0.85, 1.28, 0.85);
          lFront.position.set(lx, 0.38, 0.28);
          lFront.userData = { animType: 'lighthouse' };

          // Tua rua vàng dưới đáy đèn lồng
          const tasselF = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.008, 0.03, 6), goldPlaqueMat);
          tasselF.position.set(lx, 0.315, 0.28);

          // Đèn lồng mạn sau
          const lBack = new THREE.Mesh(new THREE.OctahedronGeometry(0.048, 1), lMat);
          lBack.scale.set(0.85, 1.28, 0.85);
          lBack.position.set(lx, 0.38, -0.28);
          lBack.userData = { animType: 'lighthouse' };

          const tasselB = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.008, 0.03, 6), goldPlaqueMat);
          tasselB.position.set(lx, 0.315, -0.28);

          // Vệt phản chiếu ánh đèn lồng lung linh lấp lánh trên dòng Hoài Giang
          const reflectMat = LandmarkMaterials.getMat(`haLanternReflect_${hex}`, () => new THREE.MeshBasicMaterial({
            color: hex,
            transparent: true,
            opacity: 0.32,
            depthWrite: false
          }));
          const reflectF = new THREE.Mesh(new THREE.CircleGeometry(0.065, 12), reflectMat);
          reflectF.rotation.x = -Math.PI / 2;
          reflectF.position.set(lx, 0.045, 0.28);
          reflectF.userData = { animType: 'float_wave' };

          const reflectB = new THREE.Mesh(new THREE.CircleGeometry(0.065, 12), reflectMat);
          reflectB.rotation.x = -Math.PI / 2;
          reflectB.position.set(lx, 0.045, -0.28);
          reflectB.userData = { animType: 'float_wave' };

          lanternGroup.add(lFront, tasselF, lBack, tasselB, reflectF, reflectB);
        });

        // Dây chăng đèn lồng nối ngang qua cầu
        [-0.28, 0.28].forEach(sz => {
          const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.96, 4), timberDarkMat);
          wire.rotation.z = Math.PI / 2;
          wire.position.set(0, 0.42, sz);
          lanternGroup.add(wire);
        });

        // 6. THUYỀN GỖ TAM BẢN HỘI AN, BÁC CHÈO ĐÒ NÓN LÁ & HOA ĐĂNG THẢ TRÔI SÔNG HOÀI
        const boatSampan = new THREE.Group();
        boatSampan.position.set(0.18, 0.045, -0.32);
        boatSampan.rotation.y = -0.22;
        boatSampan.userData = { animType: 'float_wave' };

        // Thân thuyền tam bản gỗ uốn lượn thon thả
        const boatHull = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.04, 0.10, 2, 0.008), boatWoodMat);
        boatHull.position.y = 0.02;
        boatHull.castShadow = true;

        // Mũi nhọn vút cong 2 đầu thuyền
        const bowProw = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.10, 6), boatWoodMat);
        bowProw.rotation.z = -Math.PI / 2.3;
        bowProw.position.set(0.18, 0.03, 0);

        const sternProw = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 6), boatWoodMat);
        sternProw.rotation.z = Math.PI / 2.3;
        sternProw.position.set(-0.17, 0.03, 0);

        // Bác chèo đò đội nón lá tre Việt Nam nghiêng che
        const rowerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, 0.07, 8), timberDarkMat);
        rowerBody.position.set(-0.08, 0.065, 0);
        const rowerHat = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.024, 12), nonLaMat);
        rowerHat.position.set(-0.08, 0.11, 0);

        // Mái chèo gỗ cắm xuống làn nước
        const oar = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.008, 0.18, 6), timberDarkMat);
        oar.rotation.z = 0.55;
        oar.position.set(-0.11, 0.035, 0.06);

        // Lẵng đèn hoa đăng trên khoang thuyền
        const lanternOnBoat = new THREE.Mesh(new THREE.OctahedronGeometry(0.038, 1), hoaDangGlowMat);
        lanternOnBoat.position.set(0.06, 0.06, 0);

        boatSampan.add(boatHull, bowProw, sternProw, rowerBody, rowerHat, oar, lanternOnBoat);

        // Những đóa hoa đăng sen bập bồng trôi lấp lánh trên dòng sông Hoài
        const hoaDangList: Array<{ x: number; z: number }> = [
          { x: -0.32, z: 0.32 },
          { x: -0.08, z: 0.35 },
          { x: 0.28, z: 0.33 },
          { x: -0.36, z: -0.30 },
          { x: 0.42, z: -0.26 }
        ];
        hoaDangList.forEach(({ x, z }) => {
          const hdGroup = new THREE.Group();
          hdGroup.position.set(x, 0.052, z);
          hdGroup.userData = { animType: 'float_wave' };

          // Hoa sen giấy ngũ sắc làm bệ hoa đăng
          const hdLotus = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.015, 0.018, 6), bougainvilleaPinkMat);
          // Ngọn nến phát sáng bên trong
          const hdCandle = new THREE.Mesh(new THREE.OctahedronGeometry(0.028, 0), hoaDangGlowMat);
          hdCandle.position.y = 0.018;

          hdGroup.add(hdLotus, hdCandle);
          group.add(hdGroup);
        });

        group.add(
          river,
          bridgeGroup,
          townGroup,
          lanternGroup,
          boatSampan
        );
        break;
      }

      case 19: {
        // Đà Nẵng: Cầu Rồng Vàng Thời Lý (Phun Lửa & Phun Nước Đan Xen), Dầm Thép 6 Làn Xe, Ô Tô Tí Hon & Du Thuyền Sông Hàn
        // 1. Hệ vật liệu tối ưu theo LandmarkMaterials PBR
        const dragonGoldMat = LandmarkMaterials.getMat('dnDragonGoldGleam', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          emissive: '#F39C12',
          emissiveIntensity: 0.45,
          metalness: 0.92,
          roughness: 0.14
        }));
        const dragonEyeJadeMat = LandmarkMaterials.getMat('dnDragonEyeJade', () => new THREE.MeshStandardMaterial({
          color: '#00E676',
          emissive: '#00E676',
          emissiveIntensity: 1.4,
          roughness: 0.1
        }));
        const plasmaCoreMat = LandmarkMaterials.getMat('dnDragonPlasmaCore', () => new THREE.MeshStandardMaterial({
          color: '#FFFDE7',
          emissive: '#FFF9C4',
          emissiveIntensity: 1.8,
          roughness: 0.1
        }));
        const flameCoreMat = LandmarkMaterials.getMat('dnDragonFlameCore', () => new THREE.MeshStandardMaterial({
          color: '#FF9F1A',
          emissive: '#FF7619',
          emissiveIntensity: 1.6,
          roughness: 0.18,
          transparent: true,
          opacity: 0.92
        }));
        const flameOuterMat = LandmarkMaterials.getMat('dnDragonFlameOuter', () => new THREE.MeshStandardMaterial({
          color: '#FF3838',
          emissive: '#C0392B',
          emissiveIntensity: 1.35,
          roughness: 0.22,
          transparent: true,
          opacity: 0.85
        }));
        const waterMistMat = LandmarkMaterials.getMat('dnDragonWaterMist', () => new THREE.MeshStandardMaterial({
          color: '#81ECEC',
          emissive: '#E0F2FE',
          emissiveIntensity: 0.65,
          transparent: true,
          opacity: 0.75,
          roughness: 0.08
        }));
        const sparkSmokeMat = LandmarkMaterials.getMat('dnDragonSparkSmoke', () => new THREE.MeshStandardMaterial({
          color: '#FFF275',
          emissive: '#FFEAA7',
          emissiveIntensity: 1.1,
          transparent: true,
          opacity: 0.85,
          depthWrite: false
        }));
        const hanRiverMat = LandmarkMaterials.getMat('dnHanRiverDeep', () => new THREE.MeshStandardMaterial({
          color: '#0984E3',
          roughness: 0.08,
          metalness: 0.15
        }));
        const bridgeDeckMat = LandmarkMaterials.getMat('dnBridgeDeckSteel', () => new THREE.MeshStandardMaterial({
          color: '#BDC3C7',
          metalness: 0.72,
          roughness: 0.3
        }));
        const pierConcreteMat = LandmarkMaterials.getMat('dnPierConcrete', () => new THREE.MeshStandardMaterial({
          color: '#7F8C8D',
          roughness: 0.65
        }));
        const laneYellowMat = LandmarkMaterials.getMat('dnLaneYellow', () => new THREE.MeshBasicMaterial({
          color: '#F1C40F'
        }));
        const cruiseWhiteMat = LandmarkMaterials.getMat('dnCruiseWhite', () => new THREE.MeshStandardMaterial({
          color: '#F8F9FA',
          roughness: 0.22
        }));
        const cruiseGlassMat = LandmarkMaterials.getMat('dnCruiseGlass', () => new THREE.MeshStandardMaterial({
          color: '#74B9FF',
          emissive: '#0984E3',
          emissiveIntensity: 0.5,
          roughness: 0.1
        }));
        const carRedMat = LandmarkMaterials.getMat('dnCarRubyRed', () => new THREE.MeshStandardMaterial({
          color: '#E84118',
          roughness: 0.25,
          metalness: 0.15
        }));
        const carYellowMat = LandmarkMaterials.getMat('dnCarTaxiYellow', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          roughness: 0.25,
          metalness: 0.1
        }));
        const carWheelMat = LandmarkMaterials.getMat('dnCarWheelMat', () => new THREE.MeshStandardMaterial({
          color: '#1E272E',
          roughness: 0.7
        }));

        // 2. DÒNG SÔNG HÀN THƠ MỘNG & BỜ KÈ ĐÁ BẠCH ĐẰNG
        const hanRiver = new THREE.Mesh(new RoundedBoxGeometry(1.36, 0.035, 0.94, 3, 0.02), hanRiverMat);
        hanRiver.position.set(0, 0.042, 0);
        hanRiver.receiveShadow = true;

        // Bờ kè bê tông lát đá hoa cương hai đầu cầu
        [-0.62, 0.62].forEach(bx => {
          const bank = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.08, 0.98, 2, 0.02), pierConcreteMat);
          bank.position.set(bx, 0.04, 0);
          bank.receiveShadow = true;

          // Cây xanh đô thị dọc bờ sông Bạch Đằng
          [-0.32, 0.32].forEach(tz => {
            const treeTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.14, 6), pierConcreteMat);
            treeTrunk.position.set(bx, 0.12, tz);
            const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), LandmarkMaterials.getMat('dnParkFoliage', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.4 })));
            foliage.position.set(bx, 0.21, tz);
            group.add(treeTrunk, foliage);
          });

          group.add(bank);
        });

        // 3. THÂN CẦU DẦM THÉP 6 LÀN XE & TRỤ CẦU ĐÔI BẮC QUA SÔNG HÀN
        const bridgeGroup = new THREE.Group();
        bridgeGroup.position.set(0, 0.05, 0);

        // 2 Trụ cầu chữ V đôi cắm sâu dưới lòng sông Hàn
        [-0.32, 0.18].forEach(px => {
          const pierL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.048, 0.18, 8), pierConcreteMat);
          pierL.position.set(px, 0.09, -0.16);
          const pierR = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.048, 0.18, 8), pierConcreteMat);
          pierR.position.set(px, 0.09, 0.16);
          bridgeGroup.add(pierL, pierR);
        });

        // Mặt cầu dầm thép 6 làn xe
        const bridgeDeck = new THREE.Mesh(new RoundedBoxGeometry(1.32, 0.07, 0.44, 3, 0.02), bridgeDeckMat);
        bridgeDeck.position.y = 0.16;
        bridgeDeck.castShadow = true;
        bridgeDeck.receiveShadow = true;

        // Vạch sơn vàng phân làn xe chạy
        const centerLine = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 0.024), laneYellowMat);
        centerLine.rotation.x = -Math.PI / 2;
        centerLine.position.set(0, 0.198, 0);

        // Lan can cầu hai bên mạn có gắn dải đèn LED trang trí
        [-0.21, 0.21].forEach(ry => {
          const rail = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.03, 0.016, 1, 0.003), bridgeDeckMat);
          rail.position.set(0, 0.21, ry);
          const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.01, 0.008), dragonGoldMat);
          ledStrip.position.set(0, 0.22, ry);
          bridgeGroup.add(rail, ledStrip);
        });

        // Ô tô sedan đỏ và xe taxi vàng tí hon lưu thông trên cầu
        const carRed = new THREE.Group();
        const cRedBody = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.045, 0.065, 2, 0.01), carRedMat);
        cRedBody.position.y = 0.025;
        const cRedCabin = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.035, 0.055, 2, 0.008), cruiseGlassMat);
        cRedCabin.position.set(-0.01, 0.055, 0);
        carRed.add(cRedBody, cRedCabin);
        carRed.position.set(-0.15, 0.195, 0.09);
        bridgeGroup.add(carRed);

        const carYellow = new THREE.Group();
        const cYelBody = new THREE.Mesh(new RoundedBoxGeometry(0.13, 0.045, 0.065, 2, 0.01), carYellowMat);
        cYelBody.position.y = 0.025;
        const cYelCabin = new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.035, 0.055, 2, 0.008), cruiseGlassMat);
        cYelCabin.position.set(0.01, 0.055, 0);
        carYellow.add(cYelBody, cYelCabin);
        carYellow.position.set(0.08, 0.195, -0.09);
        bridgeGroup.add(carYellow);

        bridgeGroup.add(bridgeDeck, centerLine);

        // 4. THÂN RỒNG VÀNG THỜI LÝ UỐN LƯỢN 5 NHỊP SÓNG SÁNG RỰC
        const dragonGroup = new THREE.Group();
        dragonGroup.position.set(0, 0.05, 0);

        // 5 Nhịp sóng thân rồng vàng uốn lượn liên hoàn hình sin
        const waveOffsets = [-0.44, -0.22, 0, 0.22, 0.44];
        waveOffsets.forEach((wx, idx) => {
          // Bán kính nhịp sóng tăng dần từ đuôi (-0.44) đến gần đầu (+0.44)
          const arcR = 0.15 + (idx >= 3 ? 0.03 : 0);
          const waveArch = new THREE.Mesh(new THREE.TorusGeometry(arcR, 0.046, 12, 24, Math.PI), dragonGoldMat);
          waveArch.position.set(wx, 0.2, 0);
          waveArch.castShadow = true;
          dragonGroup.add(waveArch);

          // Vây rồng nhọn hình cánh sen mạ vàng trên đỉnh mỗi nhịp sóng
          const finCount = 3;
          for (let f = -1; f <= 1; f++) {
            const dorsalFin = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.085, 4), dragonGoldMat);
            dorsalFin.position.set(wx + f * 0.05, 0.2 + arcR + (f === 0 ? 0.045 : 0.025), 0);
            dragonGroup.add(dorsalFin);
          }

          // Cáp treo thanh giằng dầm thép đỡ nhịp cầu từ thân rồng
          [-0.08, 0, 0.08].forEach(cx => {
            const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.13, 4), bridgeDeckMat);
            hanger.position.set(wx + cx, 0.21, 0);
            dragonGroup.add(hanger);
          });

          // Vảy rồng mạ vàng óng ánh (Overlapping Golden Scales) uốn theo vòng sóng thời Lý
          const scaleMat = LandmarkMaterials.getMat('dnDragonScalePlate', () => new THREE.MeshStandardMaterial({
            color: '#F1C40F',
            emissive: '#F39C12',
            emissiveIntensity: 0.52,
            metalness: 0.95,
            roughness: 0.12
          }));
          for (let s = 1; s <= 4; s++) {
            const sAngle = (s / 5) * Math.PI;
            const sx = wx + Math.cos(sAngle) * arcR;
            const sy = 0.2 + Math.sin(sAngle) * arcR;
            [-0.048, 0.048].forEach(sz => {
              const scaleMesh = new THREE.Mesh(new RoundedBoxGeometry(0.038, 0.024, 0.015, 2, 0.003), scaleMat);
              scaleMesh.position.set(sx, sy, sz);
              scaleMesh.rotation.z = -sAngle + Math.PI / 2;
              dragonGroup.add(scaleMesh);
            });
          }
        });

        // Đuôi rồng xòe hình đóa sen cách điệu 5 cánh xoắn ốc thời Lý ở mố cầu phía Tây
        const tailGroup = new THREE.Group();
        tailGroup.position.set(-0.60, 0.28, 0);

        const tailStem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.048, 0.16, 8), dragonGoldMat);
        tailStem.rotation.z = Math.PI / 2.3;
        tailGroup.add(tailStem);

        // 5 Cánh sen xòe nở xoắn ốc mềm mại
        for (let p = 0; p < 5; p++) {
          const pAngle = (p / 5) * Math.PI * 2;
          const petal = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.18, 4), dragonGoldMat);
          petal.position.set(-0.10, Math.sin(pAngle) * 0.06, Math.cos(pAngle) * 0.06);
          petal.rotation.z = Math.PI / 2 + 0.2;
          petal.rotation.x = pAngle;
          tailGroup.add(petal);
        }
        dragonGroup.add(tailGroup);

        // 5. ĐẦU RỒNG THỜI LÝ UY DŨNG NGẨNG CAO HƯỚNG RA BIỂN ĐÔNG
        const headGroup = new THREE.Group();
        headGroup.position.set(0.56, 0.44, 0);

        // Khối đầu rồng thời Lý chạm trổ bờm rồng
        const headBody = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.17, 0.16, 3, 0.03), dragonGoldMat);
        headBody.rotation.z = -0.12;
        headBody.castShadow = true;

        // Bờm rồng thời Lý uốn lượn lượn sóng cuộn về phía sau
        for (let m = 0; m < 3; m++) {
          const mane = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.20, 4), dragonGoldMat);
          mane.rotation.z = Math.PI / 1.7;
          mane.rotation.y = (m - 1) * 0.3;
          mane.position.set(-0.14, 0.08 + m * 0.03, (m - 1) * 0.04);
          headGroup.add(mane);
        }

        // Mũi rồng vươn dài há to miệng ngậm ngọc
        const snout = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.09, 0.12, 2, 0.02), dragonGoldMat);
        snout.position.set(0.14, 0.02, 0);

        // Viên ngọc rồng hoàng gia ngậm trong miệng
        const dragonPearl = new THREE.Mesh(new THREE.SphereGeometry(0.034, 10, 10), plasmaCoreMat);
        dragonPearl.position.set(0.16, 0.015, 0);
        headGroup.add(dragonPearl);

        // Mắt rồng ngọc bích phát sáng
        [-0.07, 0.07].forEach(ez => {
          const eye = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), dragonEyeJadeMat);
          eye.position.set(0.06, 0.07, ez);
          headGroup.add(eye);
        });

        // Cặp sừng rồng thời Lý uốn cong vút kiêu hãnh
        [-0.06, 0.06].forEach(hz => {
          const horn = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.20, 6), dragonGoldMat);
          horn.rotation.z = -0.38;
          horn.rotation.x = hz < 0 ? -0.12 : 0.12;
          horn.position.set(-0.04, 0.16, hz);
          headGroup.add(horn);
        });

        // Cặp râu rồng thời Lý uốn chữ S mềm mại dưới cằm
        [-0.045, 0.045].forEach(rz => {
          const beard = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.014, 0.16, 6), dragonGoldMat);
          beard.rotation.z = 0.45;
          beard.position.set(0.12, -0.07, rz);
          headGroup.add(beard);
        });

        // 6. HIỆU ỨNG PHUN LỬA & PHUN NƯỚC ĐỘC BẢN CHUẨN XÁC 100%
        // Vị trí miệng rồng: đặt tại đầu mõm rồng (x = 0.20, y = 0.03)
        const flameEmitter = new THREE.Group();
        flameEmitter.position.set(0.20, 0.03, 0);
        flameEmitter.userData = { animType: 'flicker' };

        // Góc nghiêng ngọn lửa: chếch lên trên 8 độ theo hướng phun vọt ra ngoài (+x)
        const flameTilt = 0.14; // rad (~8 độ)
        const rotZ = Math.PI / 2 + flameTilt;
        const dirX = Math.cos(flameTilt); // ~0.99
        const dirY = Math.sin(flameTilt); // ~0.14

        // A. LÕI PLASMA SIÊU SÁNG TRẮNG VÀNG TẠI CỬA MIỆNG RỒNG
        const mouthPlasma = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), plasmaCoreMat);
        mouthPlasma.position.set(0, 0, 0);
        flameEmitter.add(mouthPlasma);

        // B. LUỒNG LỬA CHÍNH (Nở rộng từ miệng rồng x=0 ra ngoài x=0.42, HƯỚNG PHUN CHUẨN XÁC)
        // Chiều cao nón H = 0.42, bán kính đáy R = 0.09.
        // Đỉnh nhọn nằm chính xác tại miệng rồng x=0, đáy nón mở rộng ra xa ở x = +0.42!
        const h1 = 0.42;
        const flameCoreGeo = new THREE.ConeGeometry(0.09, h1, 14);
        const flameCore = new THREE.Mesh(flameCoreGeo, flameCoreMat);
        flameCore.rotation.z = rotZ;
        flameCore.position.set((h1 / 2) * dirX, (h1 / 2) * dirY, 0);

        // Lớp lửa đỏ cam bọc ngoài luồng phun
        const h2 = 0.36;
        const flameOuterGeo = new THREE.ConeGeometry(0.13, h2, 14);
        const flameOuter = new THREE.Mesh(flameOuterGeo, flameOuterMat);
        flameOuter.rotation.z = rotZ;
        flameOuter.position.set((h2 / 2) * dirX, (h2 / 2) * dirY, 0);

        // C. QUẢ CẦU LỬA BÙNG NỔ (FIREBALL BURST) TẠI ĐẦU LUỒNG PHUN
        const burstX = h1 * dirX;
        const burstY = h1 * dirY;
        const burstGroup = new THREE.Group();
        burstGroup.position.set(burstX, burstY, 0);

        const burstCenter = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), flameCoreMat);
        const burstOuter1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), flameOuterMat);
        burstOuter1.position.set(0.04, 0.02, 0.02);
        const burstOuter2 = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), flameOuterMat);
        burstOuter2.position.set(0.03, -0.02, -0.02);
        const burstOuter3 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), plasmaCoreMat);
        burstOuter3.position.set(-0.03, 0.02, 0);

        burstGroup.add(burstCenter, burstOuter1, burstOuter2, burstOuter3);

        // D. TÀN LỬA & KHÓI SÁNG BAY LÊN TRỜI (SPARKS & VOLUMETRIC SMOKE)
        const sparks: Array<[number, number, number, number]> = [
          [0.22, 0.08, 0.03, 0.032],
          [0.32, 0.15, -0.03, 0.042],
          [0.44, 0.22, 0.02, 0.048],
          [0.52, 0.28, -0.02, 0.038]
        ];
        sparks.forEach(([sx, sy, sz, sr]) => {
          const spark = new THREE.Mesh(new THREE.SphereGeometry(sr, 8, 8), sparkSmokeMat);
          spark.position.set(sx, sy, sz);
          flameEmitter.add(spark);
        });

        // E. MÀN PHUN NƯỚC SƯƠNG MÙ DƯỚI CẰM (FIRE & WATER SPECTACLE)
        const mistCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0.08, -0.04, 0),
          new THREE.Vector3(0.24, -0.08, 0),
          new THREE.Vector3(0.42, -0.18, 0)
        );
        const mistMesh = new THREE.Mesh(
          new THREE.TubeGeometry(mistCurve, 12, 0.022, 6, false),
          waterMistMat
        );
        flameEmitter.add(mistMesh);

        flameEmitter.add(flameCore, flameOuter, burstGroup);
        headGroup.add(headBody, snout, flameEmitter);

        dragonGroup.add(tailGroup, headGroup);

        // 7. DU THUYỀN DU LỊCH SÔNG HÀN 2 TẦNG TÍ HON NGẮM CẦU RỒNG
        const cruiseBoat = new THREE.Group();
        cruiseBoat.position.set(-0.28, 0.05, 0.32);
        cruiseBoat.rotation.y = -0.15;
        cruiseBoat.userData = { animType: 'float_wave' };

        // Thân du thuyền trắng sang trọng
        const boatHull = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.06, 0.14, 2, 0.015), cruiseWhiteMat);
        boatHull.position.y = 0.03;
        boatHull.castShadow = true;

        // Cabin tầng 2 ngắm cảnh có kính xanh phản chiếu ánh đèn
        const cabinUpper = new THREE.Mesh(new RoundedBoxGeometry(0.20, 0.05, 0.10, 2, 0.01), cruiseGlassMat);
        cabinUpper.position.set(-0.02, 0.085, 0);

        // Phao cứu sinh đỏ nhỏ hai bên mạn tàu
        [-0.075, 0.075].forEach(pz => {
          const buoy = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.006, 6, 12), carRedMat);
          buoy.position.set(0, 0.04, pz);
          cruiseBoat.add(buoy);
        });

        // Vệt bọt sóng nước rẽ ra từ mũi thuyền
        const bowWave = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), waterMistMat);
        bowWave.rotation.x = -Math.PI / 2;
        bowWave.position.set(0.18, 0.01, 0);

        cruiseBoat.add(boatHull, cabinUpper, bowWave);

        group.add(
          hanRiver,
          bridgeGroup,
          dragonGroup,
          cruiseBoat
        );
        break;
      }

      // =====================================================
      // PHÂN KHU 5: HUẾ, QUẢNG BÌNH (SƠN ĐOÒNG), CỬA LÒ (Ruby Red)
      // =====================================================
      case 21: {
        // Cố Đô Huế: Ngọ Môn 5 Cửa Chữ U, Lầu Ngũ Phụng Hoàng/Thanh Lưu Ly, Cầu Trung Đạo Hồ Sen, Tam Cấp Kỳ Đài Cờ Ngũ Sắc & Súng Thần Công
        // 1. Hệ vật liệu cao cấp chuẩn Di sản Cung đình Huế PBR
        const stoneMat = LandmarkMaterials.getMat('citadelStoneWall', () => new THREE.MeshStandardMaterial({
          color: '#57606F',
          roughness: 0.72,
          metalness: 0.08
        }));
        const brickMat = LandmarkMaterials.getMat('hueCitadelBrick', () => new THREE.MeshStandardMaterial({
          color: '#8E3223',
          roughness: 0.65
        }));
        const redWoodMat = LandmarkMaterials.getMat('hueRedTimber', () => new THREE.MeshStandardMaterial({
          color: '#96281B',
          roughness: 0.38,
          metalness: 0.05
        }));
        const imperialGoldRoof = LandmarkMaterials.getMat('imperialGoldTileGlazed', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          roughness: 0.12,
          metalness: 0.45,
          emissive: '#F39C12',
          emissiveIntensity: 0.36
        }));
        const thanhLuuLyRoof = LandmarkMaterials.getMat('thanhLuuLyGreenTileGlazed', () => new THREE.MeshStandardMaterial({
          color: '#00B894',
          roughness: 0.14,
          metalness: 0.38,
          emissive: '#00CEC9',
          emissiveIntensity: 0.26
        }));
        const whiteMarbleMat = LandmarkMaterials.getMat('hueWhiteMarble', () => new THREE.MeshStandardMaterial({
          color: '#F5F6FA',
          roughness: 0.28,
          metalness: 0.05
        }));
        const waterMat = LandmarkMaterials.getMat('hueKimThuyWater', () => new THREE.MeshStandardMaterial({
          color: '#00CEC9',
          roughness: 0.06,
          metalness: 0.15
        }));
        const bronzeCannonMat = LandmarkMaterials.getMat('hueBronzeCannon', () => new THREE.MeshStandardMaterial({
          color: '#2F3640',
          roughness: 0.32,
          metalness: 0.88
        }));
        const goldOrnamentMat = LandmarkMaterials.getMat('hueGoldOrnament', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          roughness: 0.15,
          metalness: 0.92,
          emissive: '#F1C40F',
          emissiveIntensity: 0.4
        }));
        const doorBronzeMat = LandmarkMaterials.getMat('hueGateBronze', () => new THREE.MeshStandardMaterial({
          color: '#1E272E',
          roughness: 0.45,
          metalness: 0.65
        }));
        const lotusPinkMat = LandmarkMaterials.getMat('hueLotusPink', () => new THREE.MeshStandardMaterial({
          color: '#FD79A8',
          roughness: 0.25,
          emissive: '#FD79A8',
          emissiveIntensity: 0.3
        }));
        const leafGreenMat = LandmarkMaterials.getMat('hueLeafGreen', () => new THREE.MeshStandardMaterial({
          color: '#00B894',
          roughness: 0.4
        }));
        const frangipaniWoodMat = LandmarkMaterials.getMat('hueFrangipaniWood', () => new THREE.MeshStandardMaterial({
          color: '#5D4037',
          roughness: 0.85
        }));
        const plumeriaFlowerMat = LandmarkMaterials.getMat('huePlumeriaFlower', () => new THREE.MeshStandardMaterial({
          color: '#FFFFFF',
          emissive: '#FFF9C4',
          emissiveIntensity: 0.2,
          roughness: 0.3
        }));

        // 2. HÀO SEN NGOẠI KIM THỦY & CẦU TRUNG ĐẠO TRƯỚC NGỌ MÔN
        const moat = new THREE.Mesh(new RoundedBoxGeometry(1.34, 0.035, 0.26, 2, 0.015), waterMat);
        moat.position.set(0, 0.02, 0.24);
        moat.receiveShadow = true;
        group.add(moat);

        // Các cụm lá sen xanh biếc và hoa sen hồng nở trên mặt hào sen Kim Thủy
        const lotusCoords = [
          [-0.42, 0.22], [-0.22, 0.26], [0.22, 0.23], [0.42, 0.26],
          [-0.32, 0.28], [0.32, 0.21]
        ];
        lotusCoords.forEach(([lx, lz]) => {
          const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.008, 10), leafGreenMat);
          pad.position.set(lx, 0.04, lz);
          const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), lotusPinkMat);
          blossom.position.set(lx, 0.052, lz);
          group.add(pad, blossom);
        });

        // Cầu Trung Đạo bằng đá trắng bắc ngang qua hào sen thẳng vào cổng chính Ngọ Môn
        const bridge = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.055, 0.32, 2, 0.01), whiteMarbleMat);
        bridge.position.set(0, 0.045, 0.24);
        bridge.castShadow = true;

        // Lan can cầu đá hoa cương trắng chạm khắc rồng 2 bên
        [-0.11, 0.11].forEach(bx => {
          const rail = new THREE.Mesh(new RoundedBoxGeometry(0.022, 0.048, 0.32, 2, 0.004), whiteMarbleMat);
          rail.position.set(bx, 0.09, 0.24);
          // 2 Trụ đá đầu và cuối cầu gắn búp sen vàng
          [-0.14, 0.14].forEach(bz => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.016, 0.08, 8), whiteMarbleMat);
            post.position.set(bx, 0.10, 0.24 + bz);
            const finial = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), goldOrnamentMat);
            finial.position.set(bx, 0.145, 0.24 + bz);
            group.add(post, finial);
          });
          group.add(rail);
        });
        group.add(bridge);

        // Tứ Trụ Nghi Môn (Bốn Cột Trụ Biểu bằng gốm men lam đứng uy nghiêm đầu cầu Trung Đạo)
        const pillarX = [-0.13, -0.045, 0.045, 0.13];
        pillarX.forEach((px, idx) => {
          const isCenter = idx === 1 || idx === 2;
          const pH = isCenter ? 0.32 : 0.26;
          const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, pH, 8), thanhLuuLyRoof);
          pillar.position.set(px, pH / 2 + 0.05, 0.39);
          const pCap = new THREE.Mesh(new RoundedBoxGeometry(0.034, 0.02, 0.034, 2, 0.004), goldOrnamentMat);
          pCap.position.set(px, pH + 0.05, 0.39);
          const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), goldOrnamentMat);
          lantern.position.set(px, pH + 0.07, 0.39);
          group.add(pillar, pCap, lantern);
        });

        // 3. THÀNH NGỌ MÔN CHỮ U ĐỒ SỘ BẰNG ĐÁ THANH & GẠCH VỒ CỔ KÍNH
        // Thân đài chính chạy ngang
        const wallBase = new THREE.Mesh(new RoundedBoxGeometry(1.26, 0.36, 0.34, 3, 0.03), stoneMat);
        wallBase.position.set(0, 0.18, -0.06);
        wallBase.castShadow = true;

        // Chân móng đài ốp gạch vồ nung đỏ truyền thống
        const brickPlinth = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.06, 0.36, 2, 0.01), brickMat);
        brickPlinth.position.set(0, 0.03, -0.06);

        // Hai cánh gà chữ U vươn dài về phía trước (Dáng thế tay ngai bề thế)
        const wingL = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.36, 0.24, 2, 0.02), stoneMat);
        wingL.position.set(-0.48, 0.18, 0.06);
        wingL.castShadow = true;
        const wingR = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.36, 0.24, 2, 0.02), stoneMat);
        wingR.position.set(0.48, 0.18, 0.06);
        wingR.castShadow = true;

        // Chân móng gạch vồ cho 2 cánh gà chữ U
        const wingPlinthL = new THREE.Mesh(new RoundedBoxGeometry(0.25, 0.06, 0.25, 2, 0.01), brickMat);
        wingPlinthL.position.set(-0.48, 0.03, 0.06);
        const wingPlinthR = new THREE.Mesh(new RoundedBoxGeometry(0.25, 0.06, 0.25, 2, 0.01), brickMat);
        wingPlinthR.position.set(0.48, 0.03, 0.06);

        // Lan can đá hoa cương trắng chạy dọc trên mặt boong đài thành
        const deckRailing = new THREE.Mesh(new RoundedBoxGeometry(1.24, 0.04, 0.32, 2, 0.005), whiteMarbleMat);
        deckRailing.position.set(0, 0.38, -0.06);

        group.add(wallBase, brickPlinth, wingL, wingR, wingPlinthL, wingPlinthR, deckRailing);

        // 4. HỆ THỐNG 5 CỬA VÒM NGỌ MÔN CHÂN THỰC
        // A. Cửa giữa (Ngọ Môn - Dành riêng cho Thiên Tử): Vòm cuốn đá thanh cao rộng nhất
        const centerArch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.085, 0.085, 0.08, 16, 1, false, 0, Math.PI),
          doorBronzeMat
        );
        centerArch.rotation.z = Math.PI / 2;
        centerArch.rotation.y = Math.PI / 2;
        centerArch.position.set(0, 0.19, 0.11);

        const centerDoor = new THREE.Mesh(new RoundedBoxGeometry(0.17, 0.19, 0.08, 2, 0.01), doorBronzeMat);
        centerDoor.position.set(0, 0.095, 0.11);

        // Bảng hoành phi sơn son thếp vàng khắc chữ "午門" (Ngọ Môn)
        const hoanhPhi = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.055, 0.02, 2, 0.004), goldOrnamentMat);
        hoanhPhi.position.set(0, 0.30, 0.115);

        // Nẹp chỉ viền đỏ hoành phi
        const hoanhPhiTrim = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.062, 0.015), redWoodMat);
        hoanhPhiTrim.position.set(0, 0.30, 0.112);

        group.add(centerArch, centerDoor, hoanhPhiTrim, hoanhPhi);

        // B. Tả Giáp Môn & Hữu Giáp Môn (Dành cho quan văn, quan võ trong triều)
        [-0.24, 0.24].forEach(gx => {
          const sideDoor = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.22, 0.08, 2, 0.01), doorBronzeMat);
          sideDoor.position.set(gx, 0.11, 0.11);
          const sideLintel = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.025, 0.02, 2, 0.003), stoneMat);
          sideLintel.position.set(gx, 0.23, 0.115);
          group.add(sideDoor, sideLintel);
        });

        // C. Tả Dịch Môn & Hữu Dịch Môn (Dành cho voi, ngựa và quân lính, trổ xuyên cánh gà chữ U)
        [-0.48, 0.48].forEach(wx => {
          const wingDoor = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.19, 0.12, 2, 0.01), doorBronzeMat);
          wingDoor.position.set(wx, 0.095, 0.18);
          group.add(wingDoor);
        });

        // 5. LẦU NGŨ PHỤNG 2 TẦNG - 9 MÁI HOÀNG LƯU LY & THANH LƯU LY UỐN CONG
        const lauGroup = new THREE.Group();
        lauGroup.position.set(0, 0.38, -0.06);

        // Sàn hiên gỗ lim sơn son
        const lauFloor = new THREE.Mesh(new RoundedBoxGeometry(1.18, 0.04, 0.38, 2, 0.01), redWoodMat);
        lauFloor.position.y = 0.02;
        lauGroup.add(lauFloor);

        // Hệ thống 10 cột gỗ lim sơn son thếp vàng bao quanh lầu
        const columnCoords = [
          [-0.44, -0.12], [-0.22, -0.12], [0, -0.12], [0.22, -0.12], [0.44, -0.12],
          [-0.44, 0.12], [-0.22, 0.12], [0, 0.12], [0.22, 0.12], [0.44, 0.12]
        ];
        columnCoords.forEach(([cx, cz]) => {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.016, 0.24, 8), redWoodMat);
          col.position.set(cx, 0.14, cz);
          col.castShadow = true;
          lauGroup.add(col);
        });

        // Lan can con tiện gỗ lim sơn son quanh hàng hiên lầu Ngũ Phụng
        const lauBalustrade = new THREE.Mesh(new RoundedBoxGeometry(1.14, 0.04, 0.34, 2, 0.005), redWoodMat);
        lauBalustrade.position.y = 0.06;
        lauGroup.add(lauBalustrade);

        // Vách lầu Đại Các tầng 1
        const f1Wall = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.18, 0.24, 2, 0.01), redWoodMat);
        f1Wall.position.set(0, 0.13, 0);
        lauGroup.add(f1Wall);

        // A. TẦNG MÁI HẠ: MÁI CHÍNH HOÀNG LƯU LY (VÀNG) & HAI CHÁI THANH LƯU LY (XANH)
        // Mái chính giữa Đại Các lợp ngói Hoàng Lưu Ly vàng rực rỡ
        const roof1Center = new THREE.Mesh(new THREE.ConeGeometry(0.56, 0.18, 4), imperialGoldRoof);
        roof1Center.rotation.y = Math.PI / 4;
        roof1Center.scale.set(1.36, 0.58, 0.88);
        roof1Center.position.set(0, 0.32, 0);
        roof1Center.castShadow = true;
        lauGroup.add(roof1Center);

        // Hai chái Tả Vu & Hữu Vu lợp ngói Thanh Lưu Ly xanh ngọc bích xòe rộng
        [-0.38, 0.38].forEach(wx => {
          const wingRoof = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.15, 4), thanhLuuLyRoof);
          wingRoof.rotation.y = Math.PI / 4;
          wingRoof.scale.set(1.15, 0.52, 0.82);
          wingRoof.position.set(wx, 0.28, 0);
          wingRoof.castShadow = true;

          // Đầu đao mái cong vút mạ vàng vươn ra ngoài
          const eaveGlow = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 6), goldOrnamentMat);
          eaveGlow.rotation.z = wx < 0 ? -Math.PI / 3 : Math.PI / 3;
          eaveGlow.position.set(wx + (wx < 0 ? -0.16 : 0.16), 0.26, 0);
          lauGroup.add(wingRoof, eaveGlow);
        });

        // B. TẦNG LẦU THƯỢNG & TẦNG MÁI THƯỢNG ĐẠI CÁC
        // Cổ diêm và vách gỗ lầu ngắm cảnh tầng trên
        const f2Wall = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.16, 0.20, 2, 0.01), redWoodMat);
        f2Wall.position.set(0, 0.44, 0);
        lauGroup.add(f2Wall);

        // Mái Thượng Đại Các: Hoàng Lưu Ly uy nghiêm vươn cao
        const roof2Upper = new THREE.Mesh(new THREE.ConeGeometry(0.44, 0.20, 4), imperialGoldRoof);
        roof2Upper.rotation.y = Math.PI / 4;
        roof2Upper.scale.set(1.22, 0.65, 0.85);
        roof2Upper.position.set(0, 0.58, 0);
        roof2Upper.castShadow = true;
        lauGroup.add(roof2Upper);

        // Phù điêu Lưỡng Long Triều Nguyệt & Bảo Châu Hoàng Đế trên đỉnh nóc lầu Ngũ Phụng
        const dragonRidge = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.025, 0.03), goldOrnamentMat);
        dragonRidge.position.set(0, 0.68, 0);

        const emperorOrb = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), goldOrnamentMat);
        emperorOrb.position.set(0, 0.71, 0);

        [-0.14, 0.14].forEach(rx => {
          const dragonFinial = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.08, 6), goldOrnamentMat);
          dragonFinial.rotation.z = rx < 0 ? 0.35 : -0.35;
          dragonFinial.position.set(rx, 0.71, 0);
          lauGroup.add(dragonFinial);
        });

        lauGroup.add(dragonRidge, emperorOrb);
        group.add(lauGroup);

        // 6. TAM CẤP KỲ ĐÀI CỐ ĐÔ & LÁ CỜ NGŨ SẮC TRIỀU NGUYỄN
        const kyDaiGroup = new THREE.Group();
        kyDaiGroup.position.set(0.42, 0, 0.36);

        // 3 Tầng bệ tháp kim tự tháp cụt giật cấp bằng gạch vồ nung đỏ cổ kính
        const kTier1 = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.06, 0.28, 2, 0.015), brickMat);
        kTier1.position.y = 0.03;
        const kTier2 = new THREE.Mesh(new RoundedBoxGeometry(0.20, 0.05, 0.20, 2, 0.012), brickMat);
        kTier2.position.y = 0.085;
        const kTier3 = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.04, 0.14, 2, 0.01), stoneMat);
        kTier3.position.y = 0.13;
        kyDaiGroup.add(kTier1, kTier2, kTier3);

        // Cột cờ Cố Đô 2 đốt kim loại vươn cao
        const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.72, 8), stoneMat);
        flagPole.position.y = 0.49;
        const poleCap = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), goldOrnamentMat);
        poleCap.position.y = 0.86;
        kyDaiGroup.add(flagPole, poleCap);

        // Lá cờ ngũ sắc triều đình bay phấp phới trước sân chầu (float_wave)
        const fiveColorFlag = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.16), imperialGoldRoof);
        fiveColorFlag.position.set(0.12, 0.75, 0);
        fiveColorFlag.userData = { animType: 'float_wave' };

        const flagCoreRed = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.095), redWoodMat);
        flagCoreRed.position.set(0.12, 0.75, 0.005);
        flagCoreRed.userData = { animType: 'float_wave' };

        kyDaiGroup.add(fiveColorFlag, flagCoreRed);
        group.add(kyDaiGroup);

        // 7. SÚNG THẦN CÔNG CỐ ĐÔ TRIỀU NGUYỄN (CỬU VỊ THẦN CÔNG)
        const cannonGroup = new THREE.Group();
        cannonGroup.position.set(-0.38, 0, 0.36);
        cannonGroup.rotation.y = 0.22;

        // Bệ pháo gỗ lim sơn son
        const cannonBed = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.045, 0.14, 2, 0.01), redWoodMat);
        cannonBed.position.y = 0.045;

        // Bánh xe pháo đồng đen 2 bên
        [-0.048, 0.048].forEach(wx => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.016, 10), bronzeCannonMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx, 0.035, 0);
          cannonGroup.add(wheel);
        });

        // Nòng súng thần công bằng đồng đen bóng hướng về phía trước
        const cannonBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.035, 0.22, 10), bronzeCannonMat);
        cannonBarrel.rotation.x = -Math.PI / 2 - 0.12;
        cannonBarrel.position.set(0, 0.075, 0.02);

        // Chùm đạn pháo gang tròn bóng bên cạnh bệ pháo
        const ballMat = LandmarkMaterials.getMat('hueCannonBallMat', () => new THREE.MeshStandardMaterial({
          color: '#1E272E',
          metalness: 0.92,
          roughness: 0.18
        }));
        [[-0.03, 0.02, -0.06], [0.03, 0.02, -0.06], [0, 0.045, -0.06]].forEach(([bx, by, bz]) => {
          const ball = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), ballMat);
          ball.position.set(bx, by, bz);
          cannonGroup.add(ball);
        });

        cannonGroup.add(cannonBed, cannonBarrel);
        group.add(cannonGroup);

        // 8. CÂY SỨ ĐẠI HOÀNG CUNG CỔ THỤ (FRANGIPANI / PLUMERIA TREE)
        const treeGroup = new THREE.Group();
        treeGroup.position.set(-0.56, 0, 0.22);

        // Thân cây sứ cổ xù xì uốn cong
        const treeTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.22, 8), frangipaniWoodMat);
        treeTrunk.position.y = 0.11;
        treeTrunk.rotation.z = -0.15;

        // Tán lá sứ xanh biếc xòe tròn
        const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), leafGreenMat);
        foliage.scale.set(1.2, 0.65, 1.1);
        foliage.position.set(-0.02, 0.24, 0);

        // Các bông hoa sứ trắng muốt nhụy vàng điểm xuyết trên tán lá
        const flowerPositions = [
          [-0.05, 0.26, 0.06], [0.04, 0.28, -0.04], [0.02, 0.25, 0.07]
        ];
        flowerPositions.forEach(([fx, fy, fz]) => {
          const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6), plumeriaFlowerMat);
          blossom.position.set(fx, fy, fz);
          treeGroup.add(blossom);
        });

        treeGroup.add(treeTrunk, foliage);
        group.add(treeGroup);
        break;
      }

      case 23: {
        // Quảng Bình: Vườn Quốc Gia Phong Nha - Kẻ Bàng, Kỳ Quan Động Phong Nha & Sơn Đoòng
        const karstMat = LandmarkMaterials.getMat('phongNhaCaveRock', () => new THREE.MeshStandardMaterial({
          color: '#535C68',
          roughness: 0.78
        }));
        const caveInteriorMat = LandmarkMaterials.getMat('phongNhaCaveVoid', () => new THREE.MeshStandardMaterial({
          color: '#1E272E',
          roughness: 0.95
        }));
        const jungleGreenMat = LandmarkMaterials.getMat('sonDoongJungle', () => new THREE.MeshStandardMaterial({
          color: '#00B894',
          roughness: 0.42
        }));
        const riverMat = LandmarkMaterials.getMat('songSonWater', () => new THREE.MeshStandardMaterial({
          color: '#00CEC9',
          roughness: 0.06,
          metalness: 0.18
        }));
        const sandbankMat = LandmarkMaterials.getMat('phongNhaSandMat', () => new THREE.MeshStandardMaterial({
          color: '#DFB15B',
          roughness: 0.85
        }));
        const sunbeamMat = LandmarkMaterials.getMat('dolineSunbeam', () => new THREE.MeshBasicMaterial({
          color: '#FFF9C4',
          transparent: true,
          opacity: 0.38,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        }));
        const stalactiteMat = LandmarkMaterials.getMat('crystalStalactiteMystic', () => new THREE.MeshStandardMaterial({
          color: '#E0F2FE',
          emissive: '#00CEC9',
          emissiveIntensity: 0.42,
          roughness: 0.12,
          metalness: 0.45
        }));

        // 1. Dòng sông ngầm ngọc bích Sông Son uốn lượn qua lòng hang
        const river = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.07, 0.88, 3, 0.03), riverMat);
        river.position.set(0, 0.035, 0);

        // Bãi cát vàng & thềm sỏi bờ sông ngầm
        const sandbankL = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.05, 0.42, 2, 0.02), sandbankMat);
        sandbankL.position.set(-0.36, 0.055, 0.16);
        const sandbankR = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.05, 0.36, 2, 0.02), sandbankMat);
        sandbankR.position.set(0.38, 0.055, 0.14);

        // 2. Vòm hang động đá vôi đồ sộ (Cavern Dome) với hố sụt giếng trời Doline
        const caveBackWall = new THREE.Mesh(new THREE.SphereGeometry(0.74, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), caveInteriorMat);
        caveBackWall.scale.set(1.25, 0.95, 1.05);
        caveBackWall.position.set(0, 0.22, -0.16);

        const outerMountainDome = new THREE.Mesh(new THREE.SphereGeometry(0.78, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), karstMat);
        outerMountainDome.scale.set(1.28, 0.98, 1.08);
        outerMountainDome.position.set(0, 0.23, -0.16);
        outerMountainDome.castShadow = true;

        // Vòm cửa động Phong Nha kỳ vĩ với các lớp đá vôi xếp tầng
        const caveMouthArch1 = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.19, 14, 26, Math.PI), karstMat);
        caveMouthArch1.position.set(0, 0.26, 0.02);
        caveMouthArch1.castShadow = true;

        const caveMouthArch2 = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.14, 12, 22, Math.PI), karstMat);
        caveMouthArch2.position.set(0, 0.25, -0.08);

        // Hố sụt tự nhiên (Doline) rọi tia nắng thần tiên (God Rays) xuống thảm rừng ngầm
        const dolineRim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.06, 8, 16), karstMat);
        dolineRim.rotation.x = Math.PI / 2;
        dolineRim.position.set(-0.1, 0.88, -0.18);

        const forestFloor = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), jungleGreenMat);
        forestFloor.scale.set(1.3, 0.45, 1.0);
        forestFloor.position.set(-0.12, 0.12, -0.14);

        const sunRay = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.42, 1.02, 16, 1, true), sunbeamMat);
        sunRay.position.set(-0.08, 0.46, -0.12);
        sunRay.rotation.z = -0.16;
        sunRay.rotation.x = 0.12;
        sunRay.userData = { animType: 'flicker' };

        // 3. Thạch nhũ pha lê (Crystalline Stalactites) rủ xuống từ vòm trần hang
        const createStalactite = (x: number, y: number, z: number, r: number, h: number) => {
          const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 10), stalactiteMat);
          cone.rotation.x = Math.PI;
          cone.position.set(x, y - h / 2, z);
          cone.castShadow = true;
          return cone;
        };

        const stalactites = [
          createStalactite(-0.28, 0.72, -0.06, 0.055, 0.38),
          createStalactite(-0.36, 0.65, 0.04, 0.045, 0.32),
          createStalactite(-0.18, 0.69, 0.06, 0.04, 0.28),
          createStalactite(0.26, 0.74, -0.08, 0.06, 0.42),
          createStalactite(0.35, 0.66, 0.03, 0.048, 0.34),
          createStalactite(0.18, 0.7, 0.05, 0.038, 0.26),
          createStalactite(0.02, 0.76, -0.18, 0.05, 0.36),
          createStalactite(-0.06, 0.73, -0.02, 0.042, 0.3)
        ];

        // 4. Măng đá triệu năm tuổi (Stalagmites) & Cột đá vĩ đại nối từ đáy hang lên trần
        const createStalagmite = (x: number, z: number, r: number, h: number) => {
          const groupSt = new THREE.Group();
          const base = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.5, r * 2.0, h * 0.22, 10), karstMat);
          base.position.set(x, 0.05 + (h * 0.22) / 2, z);
          const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h * 0.82, 10), stalactiteMat);
          cone.position.set(x, 0.05 + h * 0.22 + (h * 0.82) / 2, z);
          cone.castShadow = true;
          groupSt.add(base, cone);
          return groupSt;
        };

        const stalagmite1 = createStalagmite(-0.35, 0.12, 0.075, 0.62);
        const stalagmite2 = createStalagmite(0.34, 0.1, 0.068, 0.54);
        const stalagmite3 = createStalagmite(-0.25, -0.08, 0.05, 0.38);

        // Cột nhũ đá kỳ vĩ (Cave Column) hợp nhất giữa măng đá và thạch nhũ
        const caveColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.74, 12), stalactiteMat);
        caveColumn.position.set(-0.22, 0.42, -0.16);
        caveColumn.castShadow = true;

        // 5. Thuyền thám hiểm hang động Phong Nha có đèn rọi xuyên bóng đêm
        const boat = LandmarkHelpers.createCaveExplorationBoat(0.82);
        boat.position.set(0.06, 0.068, 0.18);
        boat.rotation.y = -0.22;
        boat.userData = { animType: 'float_wave' };

        group.add(
          river, sandbankL, sandbankR,
          caveBackWall, outerMountainDome, caveMouthArch1, caveMouthArch2,
          dolineRim, forestFloor, sunRay,
          ...stalactites,
          stalagmite1, stalagmite2, stalagmite3, caveColumn,
          boat
        );
        break;
      }

      case 24: {
        // Cửa Lò: Đảo Lan Châu Mỏm Cóc Đón Sóng, Vách Đá Kỳ Vĩ, Bậc Thang Đá, Hải Đăng & Thuyền Thúng Nan
        const rockMat = LandmarkMaterials.getMat('lanChauRock', () => new THREE.MeshStandardMaterial({
          color: '#535C68',
          roughness: 0.74
        }));
        const cliffWetMat = LandmarkMaterials.getMat('lanChauCliffWet', () => new THREE.MeshStandardMaterial({
          color: '#2F3542',
          roughness: 0.6
        }));
        const mossMat = LandmarkMaterials.getMat('lanChauGreen', () => new THREE.MeshStandardMaterial({
          color: '#27AE60',
          roughness: 0.45
        }));
        const seaMat = LandmarkMaterials.getMat('cuaLoSea', () => new THREE.MeshStandardMaterial({
          color: '#0984E3',
          roughness: 0.08,
          metalness: 0.18
        }));
        const beachSandMat = LandmarkMaterials.getMat('cuaLoBeachSand', () => new THREE.MeshStandardMaterial({
          color: '#F5CD79',
          roughness: 0.85
        }));
        const waveFoamMat = LandmarkMaterials.getMat('cuaLoWaveFoam', () => new THREE.MeshStandardMaterial({
          color: '#E0F7FA',
          roughness: 0.3,
          transparent: true,
          opacity: 0.78,
          depthWrite: false
        }));
        const lighthouseWhiteMat = LandmarkMaterials.getMat('pureWhite', () => new THREE.MeshStandardMaterial({
          color: '#F8F9FA',
          roughness: 0.25
        }));
        const lighthouseRoofMat = LandmarkMaterials.getMat('lanChauRoofRed', () => new THREE.MeshStandardMaterial({
          color: '#C0392B',
          roughness: 0.35
        }));
        const goldMat = LandmarkMaterials.getMat('shinyGold', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          emissive: '#F1C40F',
          emissiveIntensity: 0.75
        }));
        const stoneStepMat = LandmarkMaterials.getMat('lanChauStepStone', () => new THREE.MeshStandardMaterial({
          color: '#BDC3C7',
          roughness: 0.6
        }));
        const woodPierMat = LandmarkMaterials.getMat('woodPierBrown', () => new THREE.MeshStandardMaterial({
          color: '#5D4037',
          roughness: 0.62
        }));

        // 1. Mặt biển Cửa Lò xanh ngắt & Bãi cát vàng thoai thoải
        const sea = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.08, 0.88, 3, 0.03), seaMat);
        sea.position.set(0, 0.04, 0);

        const beach = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.065, 0.58, 3, 0.04), beachSandMat);
        beach.position.set(0.28, 0.05, 0.14);
        beach.rotation.y = -0.28;

        // Viền bọt sóng biển trắng xóa vỗ bờ
        const wave1 = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.024, 6, 22, Math.PI * 0.75), waveFoamMat);
        wave1.rotation.x = Math.PI / 2;
        wave1.rotation.z = -0.28;
        wave1.position.set(0.22, 0.076, 0.18);
        wave1.userData = { animType: 'float_wave' };

        // 2. Mỏm đá Đảo Lan Châu (Rú Cóc) vươn mình ra biển đón sóng gió
        const cliffBase = new THREE.Mesh(new RoundedBoxGeometry(0.76, 0.22, 0.62, 3, 0.05), cliffWetMat);
        cliffBase.position.set(-0.24, 0.13, -0.08);
        cliffBase.castShadow = true;

        const cliffMid = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.24, 0.52, 3, 0.04), rockMat);
        cliffMid.position.set(-0.22, 0.32, -0.08);
        cliffMid.castShadow = true;

        const cliffTop = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.2, 0.4, 3, 0.03), rockMat);
        cliffTop.position.set(-0.2, 0.5, -0.06);

        // Thảm thực vật xanh biếc & rặng phi lao đón gió trên đỉnh đảo
        const summitGreen = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), mossMat);
        summitGreen.scale.set(1.2, 0.45, 1.0);
        summitGreen.position.set(-0.2, 0.62, -0.06);

        const pineTree = LandmarkHelpers.createMiniPineTree();
        pineTree.scale.set(0.62, 0.62, 0.62);
        pineTree.position.set(-0.35, 0.6, -0.12);

        // 3. Con đường bậc thang đá uốn lượn men theo sườn núi lên đỉnh hải đăng
        const stepCoords = [
          [0.08, 0.08, 0.12],
          [0.02, 0.15, 0.06],
          [-0.04, 0.24, 0.01],
          [-0.09, 0.34, -0.03],
          [-0.14, 0.44, -0.05],
          [-0.17, 0.54, -0.06]
        ];
        stepCoords.forEach(([sx, sy, sz]) => {
          const stepMesh = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.045, 0.08, 2, 0.008), stoneStepMat);
          stepMesh.position.set(sx, sy, sz);
          group.add(stepMesh);
        });

        // 4. Ngọn Hải Đăng Cổ Lan Châu & Lầu Nghinh Phong
        const lighthouseGroup = new THREE.Group();
        lighthouseGroup.position.set(-0.18, 0.6, -0.05);

        // Bệ đá móng hải đăng
        const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.08, 12), stoneStepMat);
        plinth.position.y = 0.04;

        // Tháp hải đăng hình trụ thon màu trắng muốt
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.098, 0.34, 16), lighthouseWhiteMat);
        tower.position.y = 0.24;
        tower.castShadow = true;

        // Ban công ngắm biển & lan can bảo vệ
        const gallery = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.024, 12), stoneStepMat);
        gallery.position.y = 0.42;

        // Buồng đèn kính & chùm sáng hải đăng quét ban đêm
        const lanternRoom = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.085, 8), LandmarkMaterials.getMat('lanChauLanternGlass', () => new THREE.MeshStandardMaterial({
          color: '#FFEAA7',
          emissive: '#F1C40F',
          emissiveIntensity: 0.9,
          roughness: 0.1
        })));
        lanternRoom.position.y = 0.475;

        const miniBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), goldMat);
        miniBeacon.position.y = 0.475;
        miniBeacon.userData = { animType: 'lighthouse' };

        // Mái vòm ngói đỏ che đỉnh đèn hải đăng
        const domeRoof = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), lighthouseRoofMat);
        domeRoof.position.y = 0.52;

        lighthouseGroup.add(plinth, tower, gallery, lanternRoom, miniBeacon, domeRoof);

        // 5. Thuyền thúng nan Cửa Lò & Cầu tàu gỗ làng chài
        const basketBoat = LandmarkHelpers.createBasketBoat(0.86);
        basketBoat.position.set(0.34, 0.065, 0.22);
        basketBoat.rotation.y = 0.35;
        basketBoat.userData = { animType: 'float_wave' };

        const pierDeck = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.04, 0.16, 2, 0.01), woodPierMat);
        pierDeck.position.set(0.24, 0.14, -0.12);
        const pierPiling1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8), woodPierMat);
        pierPiling1.position.set(0.42, 0.08, -0.12);
        const pierPiling2 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8), woodPierMat);
        pierPiling2.position.set(0.12, 0.08, -0.12);

        group.add(
          sea, beach, wave1,
          cliffBase, cliffMid, cliffTop, summitGreen, pineTree,
          lighthouseGroup,
          basketBoat,
          pierDeck, pierPiling1, pierPiling2
        );
        break;
      }

      // =====================================================
      // PHÂN KHU 6: HẢI PHÒNG, QUẢNG NINH (HẠ LONG), NINH BÌNH (Fortune Yellow)
      // =====================================================
      case 26: {
        // Hải Phòng: Cầu Hoàng Văn Thụ Cánh Chim Biển Soaring & Cảng Biển Quốc Tế Container
        const archWhiteMat = LandmarkMaterials.getMat('hvtBridgeWhite', () => new THREE.MeshStandardMaterial({
          color: '#FFFFFF',
          roughness: 0.2,
          metalness: 0.15
        }));
        const stayCableMat = LandmarkMaterials.getMat('hvtStayCableChrome', () => new THREE.MeshStandardMaterial({
          color: '#DFE6E9',
          metalness: 0.85,
          roughness: 0.2
        }));
        const pierConcreteMat = LandmarkMaterials.getMat('hvtPierConcrete', () => new THREE.MeshStandardMaterial({
          color: '#B0BEC5',
          roughness: 0.55
        }));
        const quayDeckMat = LandmarkMaterials.getMat('hpQuayDeckConcrete', () => new THREE.MeshStandardMaterial({
          color: '#78909C',
          roughness: 0.65
        }));
        const hazardStripeMat = LandmarkMaterials.getMat('hpHazardYellow', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          roughness: 0.35
        }));
        const craneBlueMat = LandmarkMaterials.getMat('portCraneBlue', () => new THREE.MeshStandardMaterial({
          color: '#0984E3',
          metalness: 0.72,
          roughness: 0.25
        }));
        const craneOrangeMat = LandmarkMaterials.getMat('portCraneOrange', () => new THREE.MeshStandardMaterial({
          color: '#E67E22',
          metalness: 0.65,
          roughness: 0.28
        }));
        const boxMaerskBlue = LandmarkMaterials.getMat('maerskBlue', () => new THREE.MeshStandardMaterial({ color: '#2980B9', roughness: 0.35 }));
        const boxEvergreenGreen = LandmarkMaterials.getMat('evergreenGreen', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.35 }));
        const boxCmaRed = LandmarkMaterials.getMat('cmaRed', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.35 }));
        const boxOneMagenta = LandmarkMaterials.getMat('oneMagenta', () => new THREE.MeshStandardMaterial({ color: '#E84393', roughness: 0.32 }));
        const riverMat = LandmarkMaterials.getMat('camRiverWater', () => new THREE.MeshStandardMaterial({
          color: '#0984E3',
          roughness: 0.08,
          metalness: 0.18
        }));

        // 1. Dòng Sông Cấm & Cầu Cảng Biển Container Hải Phòng
        const river = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.06, 0.88, 3, 0.03), riverMat);
        river.position.set(0, 0.03, 0);

        // Bến cảng container kiên cố bằng bê tông ở nửa phía Nam
        const quayApron = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.11, 0.38, 3, 0.02), quayDeckMat);
        quayApron.position.set(0, 0.075, 0.25);
        quayApron.receiveShadow = true;

        // Vạch sơn an toàn cảnh báo mép bến cảng màu vàng
        const hazardEdge = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.02, 0.03, 2, 0.005), hazardStripeMat);
        hazardEdge.position.set(0, 0.132, 0.065);

        // 2. CẦU HOÀNG VĂN THỤ - KIẾN TRÚC CÁNH CHIM BIỂN (BẮC QUA SÔNG CẤM)
        const bridgeGroup = new THREE.Group();
        bridgeGroup.position.set(0, 0, -0.18);

        // Bản mặt cầu 4 làn xe chạy kết nối đôi bờ sông
        const bridgeDeck = new THREE.Mesh(new RoundedBoxGeometry(1.26, 0.05, 0.19, 2, 0.01), archWhiteMat);
        bridgeDeck.position.set(0, 0.28, 0);
        bridgeDeck.castShadow = true;

        const roadSurface = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 0.13), LandmarkMaterials.getMat('hpRoadAsphaltMat', () => new THREE.MeshStandardMaterial({ color: '#2C3E50', roughness: 0.85 })));
        roadSurface.rotation.x = -Math.PI / 2;
        roadSurface.position.set(0, 0.306, 0);

        // Vòm thép chủ chính giữa uốn cong như lưng chim hải âu
        const mainArchF = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.028, 14, 32, Math.PI), archWhiteMat);
        mainArchF.position.set(-0.05, 0.28, 0.07);
        mainArchF.castShadow = true;

        const mainArchB = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.028, 14, 32, Math.PI), archWhiteMat);
        mainArchB.position.set(-0.05, 0.28, -0.07);
        mainArchB.castShadow = true;

        // Vòm phụ hai bên dang rộng uyển chuyển như sải cánh chim hải âu
        const wingL = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.022, 12, 22, Math.PI * 0.72), archWhiteMat);
        wingL.position.set(-0.46, 0.23, 0);
        wingL.rotation.z = 0.38;

        const wingR = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.022, 12, 22, Math.PI * 0.72), archWhiteMat);
        wingR.position.set(0.36, 0.23, 0);
        wingR.rotation.z = -0.38;

        // Hệ thống dây cáp treo (Stay Suspender Cables) trắng thanh mảnh
        [-0.32, -0.2, -0.08, 0.06, 0.18].forEach(cx => {
          const archH = Math.sin((cx + 0.53) / 0.96 * Math.PI) * 0.44;
          if (archH > 0.06) {
            [-0.07, 0.07].forEach(cz => {
              const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, archH, 6), stayCableMat);
              cable.position.set(cx, 0.28 + archH / 2, cz);
              bridgeGroup.add(cable);
            });
          }
        });

        // Hai trụ cầu bê tông cắm sâu dưới lòng sông Cấm
        const pierL = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.26, 0.22, 2, 0.01), pierConcreteMat);
        pierL.position.set(-0.46, 0.13, 0);
        const pierR = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.26, 0.22, 2, 0.01), pierConcreteMat);
        pierR.position.set(0.36, 0.13, 0);

        bridgeGroup.add(bridgeDeck, roadSurface, mainArchF, mainArchB, wingL, wingR, pierL, pierR);

        // 3. CẨU GIÀN CONTAINER CẢNG BIỂN QUỐC TẾ (STS GANTRY CRANE)
        const craneGroup = new THREE.Group();
        craneGroup.position.set(0.38, 0.13, 0.24);

        // 4 Chân cẩu giàn kiên cố tựa trên ray cảng
        const legFrontL = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.76, 8), craneBlueMat);
        legFrontL.position.set(-0.1, 0.38, 0.1);
        const legFrontR = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.76, 8), craneBlueMat);
        legFrontR.position.set(0.1, 0.38, 0.1);
        const legBackL = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.76, 8), craneBlueMat);
        legBackL.position.set(-0.1, 0.38, -0.1);
        const legBackR = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.76, 8), craneBlueMat);
        legBackR.position.set(0.1, 0.38, -0.1);

        // Khối cabin điều khiển & nhà máy máy cẩu trên cao
        const craneHouse = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.16, 0.22, 2, 0.01), craneOrangeMat);
        craneHouse.position.set(0, 0.78, 0);
        craneHouse.castShadow = true;

        // Cần cẩu vươn dài (Outreach Boom) vươn xa ra mặt nước để bốc dỡ hàng container
        const craneBoom = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.065, 0.78, 2, 0.01), craneBlueMat);
        craneBoom.position.set(0, 0.82, -0.16);

        // Dây cáp treo ngàm cẩu container (Spreader)
        const spreader = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.03, 0.06, 2, 0.005), LandmarkMaterials.getMat('spreaderMat', () => new THREE.MeshStandardMaterial({ color: '#E74C3C', roughness: 0.3 })));
        spreader.position.set(0, 0.62, -0.22);

        const hoistCable = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.2, 6), stayCableMat);
        hoistCable.position.set(0, 0.72, -0.22);

        // Đèn tín hiệu an toàn làm việc cảng biển nhấp nháy trên nóc cẩu
        const warningBeaconMat = LandmarkMaterials.getMat('craneBeaconRed', () => new THREE.MeshStandardMaterial({
          color: '#FF4757',
          emissive: '#FF3838',
          emissiveIntensity: 1.4
        }));
        const craneBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), warningBeaconMat);
        craneBeacon.position.set(0, 0.88, 0);
        craneBeacon.userData = { animType: 'pulse_red' };

        craneGroup.add(
          legFrontL, legFrontR, legBackL, legBackR,
          craneHouse, craneBoom, spreader, hoistCable, craneBeacon
        );

        // 4. BÃI CHỨA CÁC CONTAINER QUỐC TẾ NHIỀU MÀU SẮC (MAERSK, EVERGREEN, CMA, ONE)
        const makeContainer = (x: number, y: number, z: number, mat: THREE.Material, rotY = 0) => {
          const c = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.14, 0.16, 2, 0.012), mat);
          c.position.set(x, y, z);
          c.rotation.y = rotY;
          c.castShadow = true;
          return c;
        };

        const containers = [
          // Tầng 1: Container xếp thẳng hàng trên bến cảng
          makeContainer(-0.36, 0.2, 0.24, boxMaerskBlue),
          makeContainer(-0.02, 0.2, 0.24, boxEvergreenGreen),
          makeContainer(-0.36, 0.2, 0.38, boxCmaRed),
          makeContainer(-0.02, 0.2, 0.38, boxOneMagenta),
          // Tầng 2: Xếp tầng vững chãi bên trên
          makeContainer(-0.36, 0.34, 0.24, craneOrangeMat),
          makeContainer(-0.02, 0.34, 0.38, boxMaerskBlue)
        ];

        // Cột cọc bích neo tàu (Bollards) dọc mép nước
        [-0.52, -0.26, 0.0].forEach(bx => {
          const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.022, 0.05, 8), LandmarkMaterials.getMat('bollardIron', () => new THREE.MeshStandardMaterial({ color: '#2C3E50', metalness: 0.8, roughness: 0.3 })));
          bollard.position.set(bx, 0.14, 0.075);
          group.add(bollard);
        });

        group.add(river, quayApron, hazardEdge, bridgeGroup, craneGroup, ...containers);
        break;
      }

      case 27: {
        // Quảng Ninh: Kỳ Quan Vịnh Hạ Long, Tuyệt Tác Hòn Trống Mái (Hòn Gà Chọi), Quần Thể Karst & Du Thuyền Cánh Dơi Nâu
        const karstRockMat = LandmarkMaterials.getMat('haLongKarstJagged', () => new THREE.MeshStandardMaterial({
          color: '#57606F',
          roughness: 0.85
        }));
        const karstBaseMat = LandmarkMaterials.getMat('haLongKarstBaseMat', () => new THREE.MeshStandardMaterial({
          color: '#1E293B',
          roughness: 0.92
        }));
        const karstStrataMat = LandmarkMaterials.getMat('haLongKarstStrataMat', () => new THREE.MeshStandardMaterial({
          color: '#475569',
          roughness: 0.88
        }));
        const foliageMat = LandmarkMaterials.getMat('haLongFoliageGreen', () => new THREE.MeshStandardMaterial({
          color: '#16A34A',
          roughness: 0.5
        }));
        const foliageDarkMat = LandmarkMaterials.getMat('haLongFoliageDark', () => new THREE.MeshStandardMaterial({
          color: '#14532D',
          roughness: 0.6
        }));
        const bayWaterMat = LandmarkMaterials.getMat('haLongEmeraldWater', () => new THREE.MeshStandardMaterial({
          color: '#0D9488',
          roughness: 0.08,
          metalness: 0.22
        }));
        const sailBrownMat = LandmarkMaterials.getMat('junkBatwingSailBrown', () => new THREE.MeshStandardMaterial({
          color: '#9A3412',
          roughness: 0.42,
          side: THREE.DoubleSide
        }));
        const woodJunkMat = LandmarkMaterials.getMat('woodJunkBrown', () => new THREE.MeshStandardMaterial({
          color: '#451A03',
          roughness: 0.55
        }));
        const deckWoodMat = LandmarkMaterials.getMat('woodJunkDeck', () => new THREE.MeshStandardMaterial({
          color: '#B45309',
          roughness: 0.65
        }));
        const bambooBattenMat = LandmarkMaterials.getMat('haLongBambooBatten', () => new THREE.MeshStandardMaterial({
          color: '#FDE047',
          roughness: 0.45
        }));
        const cabinGlowMat = LandmarkMaterials.getMat('haLongCabinGlow', () => new THREE.MeshStandardMaterial({
          color: '#F59E0B',
          emissive: '#D97706',
          emissiveIntensity: 0.45
        }));
        const flagRedMat = LandmarkMaterials.getMat('flagRedVietnam', () => new THREE.MeshStandardMaterial({
          color: '#DA251D',
          roughness: 0.35,
          side: THREE.DoubleSide
        }));
        const flagGoldMat = LandmarkMaterials.getMat('flagGoldStar', () => new THREE.MeshBasicMaterial({
          color: '#FFFF00',
          side: THREE.DoubleSide
        }));
        const gullWhiteMat = LandmarkMaterials.getMat('haLongGullWhite', () => new THREE.MeshStandardMaterial({
          color: '#F8FAFC',
          roughness: 0.3
        }));
        const gullBeakMat = LandmarkMaterials.getMat('haLongGullBeak', () => new THREE.MeshStandardMaterial({
          color: '#EAB308',
          roughness: 0.2
        }));

        // 1. Mặt nước Vịnh Hạ Long ngọc bích phẳng lặng
        const water = new THREE.Mesh(new RoundedBoxGeometry(1.32, 0.08, 0.88, 3, 0.03), bayWaterMat);
        water.position.set(0, 0.04, 0);

        // Vòng sóng nước lăn tăn ôm quanh chân Hòn Trống và Hòn Mái
        const rippleMat = LandmarkMaterials.getMat('haLongRippleMat', () => new THREE.MeshBasicMaterial({
          color: '#E0F2FE',
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide,
          depthWrite: false
        }));

        // Vòng sóng chân Hòn Trống (-0.24, -0.10)
        const rip1a = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.30, 16), rippleMat);
        rip1a.rotation.x = -Math.PI / 2;
        rip1a.position.set(-0.24, 0.082, -0.10);

        const rip1b = new THREE.Mesh(new THREE.RingGeometry(0.33, 0.44, 16), rippleMat);
        rip1b.rotation.x = -Math.PI / 2;
        rip1b.position.set(-0.24, 0.082, -0.10);

        // Vòng sóng chân Hòn Mái (0.16, -0.08)
        const rip2a = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.28, 16), rippleMat);
        rip2a.rotation.x = -Math.PI / 2;
        rip2a.position.set(0.16, 0.082, -0.08);

        const rip2b = new THREE.Mesh(new THREE.RingGeometry(0.31, 0.42, 16), rippleMat);
        rip2b.rotation.x = -Math.PI / 2;
        rip2b.position.set(0.16, 0.082, -0.08);

        // 2. Quần đảo đá vôi phía chân trời tạo chiều sâu không gian Vịnh Hạ Long
        // Đảo đá Tháp Bút non nước (trái, xa)
        const isletLeft = new THREE.Group();
        isletLeft.position.set(-0.48, 0.04, -0.32);
        const isletLeftBase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 0.24, 8), karstRockMat);
        isletLeftBase.position.y = 0.12;
        const isletLeftMid = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.22, 8), karstRockMat);
        isletLeftMid.position.y = 0.32;
        const isletLeftSpire = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 7), karstRockMat);
        isletLeftSpire.position.y = 0.52;
        const isletLeftFoliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.09, 1), foliageDarkMat);
        isletLeftFoliage.scale.set(1.1, 0.6, 1.0);
        isletLeftFoliage.position.y = 0.54;
        isletLeft.add(isletLeftBase, isletLeftMid, isletLeftSpire, isletLeftFoliage);

        // Đảo đá Hòn Đỉnh Hương (phải, xa)
        const isletRight = new THREE.Group();
        isletRight.position.set(0.44, 0.04, -0.28);
        const isletRightBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 0.18, 8), karstBaseMat);
        isletRightBase.position.y = 0.09;
        const isletRightBody = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 1), karstRockMat);
        isletRightBody.scale.set(1.3, 0.85, 1.1);
        isletRightBody.position.y = 0.28;
        const isletRightCap = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.11, 0.16, 8), karstRockMat);
        isletRightCap.position.y = 0.42;
        const isletRightFoliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 1), foliageMat);
        isletRightFoliage.scale.set(1.2, 0.5, 1.0);
        isletRightFoliage.position.y = 0.52;
        isletRight.add(isletRightBase, isletRightBody, isletRightCap, isletRightFoliage);

        // Đảo đá mờ ảo xa xăm lấp ló qua khe chữ V giữa hai hòn
        const distantMistyIslet = new THREE.Mesh(
          new THREE.ConeGeometry(0.12, 0.38, 6),
          LandmarkMaterials.getMat('haLongMistyKarst', () => new THREE.MeshStandardMaterial({
            color: '#64748B',
            roughness: 0.9,
            transparent: true,
            opacity: 0.85
          }))
        );
        distantMistyIslet.position.set(-0.05, 0.22, -0.42);

        // 3. HÒN TRỐNG MÁI: HÌNH TƯỢNG ĐÔI GÀ TRỐNG - MÁI GIAO DUYÊN VỚI CHÂN THẮT EO & KHE SÁNG CHỮ V
        // Hòn Trống (Gà Trống - Cao hơn, mào đá vôi nhọn kiêu hãnh, ức nở vươn sang Hòn Mái)
        const trongGroup = new THREE.Group();
        trongGroup.position.set(-0.24, 0.04, -0.10);

        // a) Chân đá ngập triều & chân thắt eo độc đáo bị nước biển bào mòn
        const trongWaterBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.06, 8), karstBaseMat);
        trongWaterBase.position.y = 0.03;
        trongWaterBase.castShadow = true;

        const trongWaistLower = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.05, 0.16, 8), karstBaseMat);
        trongWaistLower.position.y = 0.14;
        trongWaistLower.castShadow = true;

        const trongWaistUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.085, 0.16, 8), karstRockMat);
        trongWaistUpper.position.y = 0.28;
        trongWaistUpper.castShadow = true;

        // b) Thân đá phân tầng kiến tạo trầm tích - ức gà vạm vỡ vươn sang Hòn Mái
        const trongChestLower = new THREE.Mesh(new THREE.DodecahedronGeometry(0.20, 1), karstRockMat);
        trongChestLower.scale.set(1.2, 0.85, 1.0);
        trongChestLower.position.set(0.02, 0.44, 0);
        trongChestLower.castShadow = true;

        const trongStrataBand = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.24), karstStrataMat);
        trongStrataBand.rotation.z = 0.12;
        trongStrataBand.position.set(0.03, 0.51, 0);

        const trongChestUpper = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 1), karstRockMat);
        trongChestUpper.scale.set(1.25, 1.1, 0.95);
        trongChestUpper.position.set(0.05, 0.64, 0);
        trongChestUpper.castShadow = true;

        const trongTailSlope = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.16), karstRockMat);
        trongTailSlope.rotation.z = 0.38;
        trongTailSlope.position.set(-0.14, 0.66, 0);
        trongTailSlope.castShadow = true;

        // c) Cổ & Đầu Gà Trống vươn cao với mỏ nhọn chĩa sang Hòn Mái
        const trongNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 0.22, 8), karstRockMat);
        trongNeck.rotation.z = -0.34;
        trongNeck.position.set(0.10, 0.82, 0);

        const trongHead = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 1), karstRockMat);
        trongHead.position.set(0.18, 0.92, 0);
        trongHead.castShadow = true;

        // Mỏ trên & mỏ dưới gà trống chĩa thẳng sang Hòn Mái
        const trongBeakUpper = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.15, 6), karstRockMat);
        trongBeakUpper.rotation.z = -Math.PI / 2.05;
        trongBeakUpper.position.set(0.30, 0.92, 0);

        const trongBeakLower = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.09, 6), karstStrataMat);
        trongBeakLower.rotation.z = -Math.PI / 2.05;
        trongBeakLower.position.set(0.27, 0.89, 0);

        // d) Mào Gà Trống kiêu hãnh với 3 tháp đá vôi nhọn
        const trongCrestMain = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 5), karstRockMat);
        trongCrestMain.rotation.z = 0.08;
        trongCrestMain.position.set(0.18, 1.07, 0);

        const trongCrestFront = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.13, 5), karstRockMat);
        trongCrestFront.rotation.z = -0.25;
        trongCrestFront.position.set(0.24, 1.01, 0);

        const trongCrestBack = new THREE.Mesh(new THREE.ConeGeometry(0.034, 0.14, 5), karstRockMat);
        trongCrestBack.rotation.z = 0.26;
        trongCrestBack.position.set(0.12, 1.02, 0);

        // e) Thảm thực vật bonsai đá vôi xanh mướt trên lưng & vách đá
        const trongBonsaiTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.14, 6), woodJunkMat);
        trongBonsaiTrunk.rotation.z = 0.55;
        trongBonsaiTrunk.position.set(-0.06, 0.86, 0.04);

        const trongPineClump1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 1), foliageMat);
        trongPineClump1.scale.set(1.2, 0.55, 1.0);
        trongPineClump1.position.set(-0.10, 0.93, 0.04);

        const trongPineClump2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08, 1), foliageDarkMat);
        trongPineClump2.scale.set(1.1, 0.5, 0.9);
        trongPineClump2.position.set(-0.15, 0.87, -0.02);

        const trongCreviceMoss = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), foliageMat);
        trongCreviceMoss.scale.set(1.1, 0.4, 0.8);
        trongCreviceMoss.position.set(0.02, 0.77, 0.06);

        trongGroup.add(
          trongWaterBase, trongWaistLower, trongWaistUpper,
          trongChestLower, trongStrataBand, trongChestUpper, trongTailSlope,
          trongNeck, trongHead, trongBeakUpper, trongBeakLower,
          trongCrestMain, trongCrestFront, trongCrestBack,
          trongBonsaiTrunk, trongPineClump1, trongPineClump2, trongCreviceMoss
        );

        // Hòn Mái (Gà Mái - Thấp hơn, thân tròn đầy đặn nghiêng đầu âu yếm về phía Hòn Trống)
        const maiGroup = new THREE.Group();
        maiGroup.position.set(0.16, 0.04, -0.08);

        // a) Chân đá ngập triều & chân thắt eo nghiêng về phía Trống
        const maiWaterBase = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.06, 8), karstBaseMat);
        maiWaterBase.position.y = 0.03;
        maiWaterBase.castShadow = true;

        const maiWaistLower = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.05, 0.15, 8), karstBaseMat);
        maiWaistLower.rotation.z = 0.12;
        maiWaistLower.position.set(-0.01, 0.14, 0);
        maiWaistLower.castShadow = true;

        const maiWaistUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.075, 0.15, 8), karstRockMat);
        maiWaistUpper.rotation.z = 0.14;
        maiWaistUpper.position.set(-0.02, 0.27, 0);
        maiWaistUpper.castShadow = true;

        // b) Thân gà mái tròn đầy đặn nghiêng về bên trái
        const maiBodyLower = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 1), karstRockMat);
        maiBodyLower.scale.set(1.12, 0.95, 1.05);
        maiBodyLower.position.set(-0.02, 0.42, 0);
        maiBodyLower.castShadow = true;

        const maiStrataBand = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.22), karstStrataMat);
        maiStrataBand.rotation.z = -0.10;
        maiStrataBand.position.set(-0.04, 0.49, 0);

        const maiBodyMid = new THREE.Mesh(new THREE.DodecahedronGeometry(0.20, 1), karstRockMat);
        maiBodyMid.scale.set(1.15, 1.15, 1.0);
        maiBodyMid.rotation.z = 0.18;
        maiBodyMid.position.set(-0.05, 0.60, 0);
        maiBodyMid.castShadow = true;

        const maiTailSlope = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.16), karstRockMat);
        maiTailSlope.rotation.z = -0.30;
        maiTailSlope.position.set(0.08, 0.58, 0);
        maiTailSlope.castShadow = true;

        // c) Cổ & Đầu Gà Mái nghiêng âu yếm hướng về Hòn Trống (độ cao thấp hơn mào Trống)
        const maiNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.20, 8), karstRockMat);
        maiNeck.rotation.z = 0.42;
        maiNeck.position.set(-0.09, 0.76, 0);

        const maiHead = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 1), karstRockMat);
        maiHead.position.set(-0.16, 0.85, 0);
        maiHead.castShadow = true;

        // Mỏ gà mái vươn sang trái chạm sát mỏ gà trống, tạo khe hở chữ V huyền thoại
        const maiBeak = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.13, 6), karstRockMat);
        maiBeak.rotation.z = Math.PI / 2.15;
        maiBeak.position.set(-0.25, 0.89, 0);

        // d) Cây bụi bonsai & rêu đá bám trên sườn hòn Mái
        const maiBonsaiPine = new THREE.Mesh(new THREE.DodecahedronGeometry(0.10, 1), foliageMat);
        maiBonsaiPine.scale.set(1.15, 0.5, 0.95);
        maiBonsaiPine.position.set(0.06, 0.76, 0.04);

        const maiCreviceFern = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 6), foliageDarkMat);
        maiCreviceFern.scale.set(1.1, 0.4, 0.8);
        maiCreviceFern.position.set(0.00, 0.66, -0.04);

        maiGroup.add(
          maiWaterBase, maiWaistLower, maiWaistUpper,
          maiBodyLower, maiStrataBand, maiBodyMid, maiTailSlope,
          maiNeck, maiHead, maiBeak,
          maiBonsaiPine, maiCreviceFern
        );

        // 4. DU THUYỀN BUỒM HẠ LONG 3 CÁNH DƠI NÂU TRUYỀN THỐNG (NAN TRE NẸP BUỒM & CỜ ĐỎ SAO VÀNG)
        const junkShip = new THREE.Group();
        junkShip.position.set(0.02, 0.08, 0.22);
        junkShip.userData = { animType: 'float_wave' };

        // a) Vỏ thuyền gỗ truyền thống mũi vuốt nhọn kiêu hãnh & đuôi nâng cao
        const hull = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.12, 0.24, 3, 0.02), woodJunkMat);
        hull.position.y = 0.06;
        hull.castShadow = true;

        const bowProw = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 8), woodJunkMat);
        bowProw.rotation.z = -Math.PI / 2.3;
        bowProw.position.set(0.36, 0.08, 0);

        const bowsprit = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.16, 6), woodJunkMat);
        bowsprit.rotation.z = -Math.PI / 3;
        bowsprit.position.set(0.48, 0.14, 0);

        const sternTransom = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.23), woodJunkMat);
        sternTransom.position.set(-0.28, 0.11, 0);

        // Mắt thuyền truyền thống (Boat Eye) bên mạn trái và mạn phải mũi thuyền
        const eyeMat = LandmarkMaterials.getMat('junkBoatEyeWhite', () => new THREE.MeshBasicMaterial({ color: '#FFFFFF' }));
        const pupilMat = LandmarkMaterials.getMat('junkBoatEyeBlack', () => new THREE.MeshBasicMaterial({ color: '#111827' }));

        [-0.122, 0.122].forEach(ez => {
          const eyeDisc = new THREE.Mesh(new THREE.CircleGeometry(0.016, 12), eyeMat);
          eyeDisc.position.set(0.32, 0.09, ez);
          if (ez < 0) eyeDisc.rotation.y = -Math.PI / 2;
          else eyeDisc.rotation.y = Math.PI / 2;

          const pupilDisc = new THREE.Mesh(new THREE.CircleGeometry(0.008, 8), pupilMat);
          pupilDisc.position.set(0.32, 0.09, ez + (ez > 0 ? 0.001 : -0.001));
          if (ez < 0) pupilDisc.rotation.y = -Math.PI / 2;
          else pupilDisc.rotation.y = Math.PI / 2;

          junkShip.add(eyeDisc, pupilDisc);
        });

        // b) Mặt boong gỗ ván sưa & Cabin khách 2 tầng ngắm vịnh
        const deck = new THREE.Mesh(new RoundedBoxGeometry(0.64, 0.02, 0.22, 2, 0.005), deckWoodMat);
        deck.position.y = 0.12;

        const cabinLower = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.10, 0.18, 2, 0.01), woodJunkMat);
        cabinLower.position.set(-0.04, 0.17, 0);

        const sundeckRoof = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.015, 0.19, 2, 0.005), deckWoodMat);
        sundeckRoof.position.set(-0.04, 0.23, 0);

        // Các cửa sổ cabin sáng đèn ấm áp màu hổ phách
        [-0.092, 0.092].forEach(wz => {
          [-0.14, -0.04, 0.06].forEach(wx => {
            const win = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.04), cabinGlowMat);
            win.position.set(wx, 0.17, wz);
            if (wz > 0) win.rotation.y = 0;
            else win.rotation.y = Math.PI;
            junkShip.add(win);
          });
        });

        // Lan can sundeck tầng thượng
        const sundeckRailing = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.03, 0.18), woodJunkMat);
        sundeckRailing.position.set(-0.04, 0.25, 0);

        // Phao cứu sinh đỏ trắng gắn hai bên hông cabin
        const lifebuoyMat = LandmarkMaterials.getMat('lifebuoyRed', () => new THREE.MeshStandardMaterial({
          color: '#EF4444',
          roughness: 0.3
        }));
        [-0.094, 0.094].forEach(bz => {
          const buoy = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.007, 8, 16), lifebuoyMat);
          buoy.position.set(0.10, 0.17, bz);
          junkShip.add(buoy);
        });

        // c) 3 Cột Buồm Gỗ & 3 Cánh Buồm Cánh Dơi Nâu Đỏ Xếp Nan Tre Đặc Trưng
        // 1. Cột buồm chính giữa (Main Mast - To nhất, cao nhất)
        const mastMain = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.62, 8), woodJunkMat);
        mastMain.position.set(0.06, 0.42, 0);

        const batwingSailMain = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.54, 12), sailBrownMat);
        batwingSailMain.scale.set(0.10, 1.0, 1.25);
        batwingSailMain.position.set(0.08, 0.44, 0);
        batwingSailMain.rotation.y = 0.14;

        // 4 Nan tre nẹp buồm cánh dơi chính
        [0.26, 0.36, 0.46, 0.56].forEach(by => {
          const batten = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.34, 6), bambooBattenMat);
          batten.rotation.x = Math.PI / 2;
          batten.rotation.y = 0.14;
          batten.position.set(0.08, by, 0);
          junkShip.add(batten);
        });

        // 2. Cột buồm mũi (Foremast - Phía trước)
        const mastFore = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.012, 0.48, 8), woodJunkMat);
        mastFore.position.set(0.24, 0.35, 0);

        const batwingSailFore = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.44, 12), sailBrownMat);
        batwingSailFore.scale.set(0.10, 1.0, 1.25);
        batwingSailFore.position.set(0.25, 0.36, 0);
        batwingSailFore.rotation.y = 0.14;

        // 3 Nan tre nẹp buồm mũi
        [0.24, 0.33, 0.42].forEach(by => {
          const batten = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.25, 6), bambooBattenMat);
          batten.rotation.x = Math.PI / 2;
          batten.rotation.y = 0.14;
          batten.position.set(0.25, by, 0);
          junkShip.add(batten);
        });

        // 3. Cột buồm đuôi (Mizzenmast - Phía sau, nhỏ nhất)
        const mastMizzen = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.38, 8), woodJunkMat);
        mastMizzen.position.set(-0.22, 0.31, 0);

        const batwingSailMizzen = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.34, 12), sailBrownMat);
        batwingSailMizzen.scale.set(0.10, 1.0, 1.25);
        batwingSailMizzen.position.set(-0.21, 0.32, 0);
        batwingSailMizzen.rotation.y = 0.14;

        // 3 Nan tre nẹp buồm đuôi
        [0.22, 0.30, 0.38].forEach(by => {
          const batten = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.19, 6), bambooBattenMat);
          batten.rotation.x = Math.PI / 2;
          batten.rotation.y = 0.14;
          batten.position.set(-0.21, by, 0);
          junkShip.add(batten);
        });

        const flagGroup = new THREE.Group();
        flagGroup.position.set(-0.32, 0.22, 0);
        flagGroup.userData = { animType: 'float_wave' };

        const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.005, 0.18, 6), woodJunkMat);
        flagPole.position.y = 0;

        const flagMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.05), flagRedMat);
        flagMesh.position.set(-0.045, 0.05, 0);
        flagMesh.userData = { animType: 'float_wave' };

        const starShape = LandmarkHelpers.create5PointStarShape(0.014, 0.006);
        const starGeo = new THREE.ShapeGeometry(starShape);
        const starMesh = new THREE.Mesh(starGeo, flagGoldMat);
        starMesh.position.set(-0.045, 0.05, 0.001);

        flagGroup.add(flagPole, flagMesh, starMesh);

        junkShip.add(
          hull, bowProw, bowsprit, sternTransom,
          deck, cabinLower, sundeckRoof, sundeckRailing,
          mastMain, batwingSailMain,
          mastFore, batwingSailFore,
          mastMizzen, batwingSailMizzen,
          flagGroup
        );

        // 5. Chim hải âu trắng chao lượn trên bầu trời Vịnh Hạ Long
        const createSeagull = (x: number, y: number, z: number, ry: number, rz: number): THREE.Group => {
          const gull = new THREE.Group();
          gull.position.set(x, y, z);
          gull.rotation.set(0, ry, rz);

          // Thân chim
          const body = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.08, 6), gullWhiteMat);
          body.rotation.z = Math.PI / 2;

          // Mỏ vàng
          const beak = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.024, 4), gullBeakMat);
          beak.rotation.z = -Math.PI / 2;
          beak.position.set(0.05, 0, 0);

          // Cánh trái chao lên
          const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.004, 0.024), gullWhiteMat);
          wingL.rotation.z = 0.35;
          wingL.position.set(-0.01, 0.015, 0.04);

          // Cánh phải chao lên
          const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.004, 0.024), gullWhiteMat);
          wingR.rotation.z = 0.35;
          wingR.position.set(-0.01, 0.015, -0.04);

          gull.add(body, beak, wingL, wingR);
          return gull;
        };

        const gull1 = createSeagull(0.28, 0.98, 0.06, 0.25, -0.15);
        const gull2 = createSeagull(-0.12, 1.12, -0.16, -0.4, 0.18);

        group.add(
          water, rip1a, rip1b, rip2a, rip2b,
          isletLeft, isletRight, distantMistyIslet,
          trongGroup, maiGroup,
          junkShip,
          gull1, gull2
        );
        break;
      }

      case 29: {
        // Ninh Bình: Di Sản Thế Giới Tràng An - Thủy Đình Nổi Trên Sông Ngô Đồng, Non Nước Karst & Thuyền Nan Nón Lá
        const mountainMat = LandmarkMaterials.getMat('trangAnKarstRock', () => new THREE.MeshStandardMaterial({
          color: '#475569',
          roughness: 0.85
        }));
        const mountainBaseMat = LandmarkMaterials.getMat('trangAnKarstBase', () => new THREE.MeshStandardMaterial({
          color: '#1E293B',
          roughness: 0.92
        }));
        const mountainStrataMat = LandmarkMaterials.getMat('trangAnKarstStrata', () => new THREE.MeshStandardMaterial({
          color: '#334155',
          roughness: 0.88
        }));
        const stalactiteMat = LandmarkMaterials.getMat('trangAnStalactite', () => new THREE.MeshStandardMaterial({
          color: '#CBD5E1',
          roughness: 0.65
        }));
        const foliageMat = LandmarkMaterials.getMat('trangAnKarstFoliage', () => new THREE.MeshStandardMaterial({
          color: '#16A34A',
          roughness: 0.48
        }));
        const foliageDarkMat = LandmarkMaterials.getMat('trangAnKarstFoliageDark', () => new THREE.MeshStandardMaterial({
          color: '#14532D',
          roughness: 0.62
        }));
        const lakeMat = LandmarkMaterials.getMat('trangAnLakeWater', () => new THREE.MeshStandardMaterial({
          color: '#0D9488',
          roughness: 0.08,
          metalness: 0.22
        }));
        const riceGoldMat = LandmarkMaterials.getMat('ngoDongRiceGold', () => new THREE.MeshStandardMaterial({
          color: '#EAB308',
          roughness: 0.58
        }));
        const riceGreenMat = LandmarkMaterials.getMat('ngoDongRiceGreen', () => new THREE.MeshStandardMaterial({
          color: '#65A30D',
          roughness: 0.52
        }));
        const pavilionWoodMat = LandmarkMaterials.getMat('thuyDinhLacqueredWood', () => new THREE.MeshStandardMaterial({
          color: '#7F1D1D',
          roughness: 0.45
        }));
        const roofTileMat = LandmarkMaterials.getMat('thuyDinhRoofTileGlazed', () => new THREE.MeshStandardMaterial({
          color: '#A02020',
          roughness: 0.32,
          metalness: 0.12,
          emissive: '#7F1D1D',
          emissiveIntensity: 0.22
        }));
        const stonePlinthMat = LandmarkMaterials.getMat('thuyDinhStonePlinth', () => new THREE.MeshStandardMaterial({
          color: '#94A3B8',
          roughness: 0.65
        }));
        const goldFinialMat = LandmarkMaterials.getMat('thuyDinhGoldFinialGleam', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          emissive: '#F39C12',
          emissiveIntensity: 0.68,
          metalness: 0.92,
          roughness: 0.12
        }));
        const lanternGlowMat = LandmarkMaterials.getMat('thuyDinhLanternGlow', () => new THREE.MeshStandardMaterial({
          color: '#FBBF24',
          emissive: '#F59E0B',
          emissiveIntensity: 0.75
        }));
        const boatWoodMat = LandmarkMaterials.getMat('sampanDarkWood', () => new THREE.MeshStandardMaterial({
          color: '#5C381E',
          roughness: 0.55
        }));
        const seatWoodMat = LandmarkMaterials.getMat('sampanSeatWood', () => new THREE.MeshStandardMaterial({
          color: '#8A5832',
          roughness: 0.45
        }));
        const nonLaMat = LandmarkMaterials.getMat('nonLaStrawYellow', () => new THREE.MeshStandardMaterial({
          color: '#FDE047',
          roughness: 0.5
        }));
        const aoBaBaMat = LandmarkMaterials.getMat('aoBaBaBlue', () => new THREE.MeshStandardMaterial({
          color: '#0284C7',
          roughness: 0.6
        }));
        const storkWhiteMat = LandmarkMaterials.getMat('trangAnStorkWhite', () => new THREE.MeshStandardMaterial({
          color: '#F8FAFC',
          roughness: 0.3
        }));
        const lotusPinkMat = LandmarkMaterials.getMat('lotusFlowerPink', () => new THREE.MeshStandardMaterial({
          color: '#EC4899',
          roughness: 0.3
        }));
        const lotusPadMat = LandmarkMaterials.getMat('lotusPadGreen', () => new THREE.MeshStandardMaterial({
          color: '#047857',
          roughness: 0.4
        }));

        // 1. Mặt nước sông Ngô Đồng ngọc bích phẳng lặng
        const water = new THREE.Mesh(new RoundedBoxGeometry(1.32, 0.08, 0.88, 3, 0.03), lakeMat);
        water.position.set(0, 0.04, 0);

        // Vòng sóng nước lăn tăn quanh bệ đá Thủy Đình & cửa hang
        const rippleMat = LandmarkMaterials.getMat('trangAnRippleMat', () => new THREE.MeshBasicMaterial({
          color: '#E0F2FE',
          transparent: true,
          opacity: 0.42,
          side: THREE.DoubleSide,
          depthWrite: false
        }));

        const ripPavilion = new THREE.Mesh(new THREE.RingGeometry(0.38, 0.52, 16), rippleMat);
        ripPavilion.rotation.x = -Math.PI / 2;
        ripPavilion.position.set(-0.06, 0.082, 0.02);

        const ripCave = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.36, 16), rippleMat);
        ripCave.rotation.x = -Math.PI / 2;
        ripCave.position.set(0.02, 0.082, -0.26);

        // Khóm hoa súng / hoa sen nở e ấp ven sông
        const createLotusCluster = (lx: number, lz: number): THREE.Group => {
          const lotusGroup = new THREE.Group();
          lotusGroup.position.set(lx, 0.082, lz);

          // 3 Lá sen tròn nổi trên mặt nước
          [[-0.03, -0.02, 0.038], [0.03, -0.01, 0.032], [0, 0.03, 0.035]].forEach(([ox, oz, rad]) => {
            const pad = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, 0.004, 8), lotusPadMat);
            pad.position.set(ox, 0, oz);
            lotusGroup.add(pad);
          });

          // Búp hoa sen hồng nhô lên khỏi mặt nước
          const flower = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.026, 6), lotusPinkMat);
          flower.position.set(0, 0.014, 0);
          lotusGroup.add(flower);

          return lotusGroup;
        };

        const lotus1 = createLotusCluster(-0.36, 0.18);
        const lotus2 = createLotusCluster(0.34, 0.22);
        const lotus3 = createLotusCluster(-0.42, -0.10);

        // 2. Thảm lúa vàng Tam Cốc chín rộ uốn lượn hai bên bờ sông
        const riceL = new THREE.Group();
        riceL.position.set(-0.48, 0.04, 0.12);
        const riceLBank = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.06, 0.64, 2, 0.015), riceGreenMat);
        riceLBank.position.y = 0.03;
        const riceLCrop = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.03, 0.58, 2, 0.01), riceGoldMat);
        riceLCrop.position.y = 0.065;
        riceL.add(riceLBank, riceLCrop);

        const riceR = new THREE.Group();
        riceR.position.set(0.48, 0.04, 0.12);
        const riceRBank = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.06, 0.64, 2, 0.015), riceGreenMat);
        riceRBank.position.y = 0.03;
        const riceRCrop = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.03, 0.58, 2, 0.01), riceGoldMat);
        riceRCrop.position.y = 0.065;
        riceR.add(riceRBank, riceRCrop);

        // 3. DÃY NÚI ĐÁ VÔI KARST TRÀNG AN & HANG LUỒN XUYÊN THỦY (WATER CAVE PASSAGE)
        // a) Dãy núi đá vôi hùng vĩ phía sau bên trái
        const mountainL = new THREE.Group();
        mountainL.position.set(-0.40, 0.04, -0.22);

        const mtnLBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.36, 8), mountainBaseMat);
        mtnLBase.position.y = 0.18;
        mtnLBase.castShadow = true;

        const mtnLMid = new THREE.Mesh(new THREE.DodecahedronGeometry(0.26, 1), mountainMat);
        mtnLMid.scale.set(1.2, 0.9, 1.1);
        mtnLMid.position.set(0.02, 0.50, 0);
        mtnLMid.castShadow = true;

        const mtnLStrata = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.05, 0.32), mountainStrataMat);
        mtnLStrata.rotation.z = 0.14;
        mtnLStrata.position.set(0.02, 0.60, 0);

        const mtnLSpire = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.52, 7), mountainMat);
        mtnLSpire.position.set(0, 0.88, 0);
        mtnLSpire.castShadow = true;

        const mtnLFoliage1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.13, 1), foliageMat);
        mtnLFoliage1.scale.set(1.2, 0.6, 1.0);
        mtnLFoliage1.position.set(-0.06, 0.92, 0.04);

        const mtnLFoliage2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.10, 1), foliageDarkMat);
        mtnLFoliage2.scale.set(1.1, 0.5, 0.9);
        mtnLFoliage2.position.set(0.10, 0.68, -0.06);

        mountainL.add(mtnLBase, mtnLMid, mtnLStrata, mtnLSpire, mtnLFoliage1, mtnLFoliage2);

        // b) Dãy núi đá vôi hùng vĩ phía sau bên phải
        const mountainR = new THREE.Group();
        mountainR.position.set(0.42, 0.04, -0.20);

        const mtnRBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.34, 8), mountainBaseMat);
        mtnRBase.position.y = 0.17;
        mtnRBase.castShadow = true;

        const mtnRMid = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 1), mountainMat);
        mtnRMid.scale.set(1.15, 0.85, 1.05);
        mtnRMid.position.set(-0.02, 0.46, 0);
        mtnRMid.castShadow = true;

        const mtnRStrata = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.30), mountainStrataMat);
        mtnRStrata.rotation.z = -0.12;
        mtnRStrata.position.set(-0.02, 0.56, 0);

        const mtnRSpire = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.48, 7), mountainMat);
        mtnRSpire.position.set(0, 0.82, 0);
        mtnRSpire.castShadow = true;

        const mtnRFoliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 1), foliageMat);
        mtnRFoliage.scale.set(1.15, 0.55, 0.95);
        mtnRFoliage.position.set(0.04, 0.84, 0.02);

        mountainR.add(mtnRBase, mtnRMid, mtnRStrata, mtnRSpire, mtnRFoliage);

        // c) Vòm Hang Luồn xuyên thủy nối liền vách núi nơi thuyền nan đi xuyên lòng núi
        const caveGroup = new THREE.Group();
        caveGroup.position.set(0.02, 0.04, -0.26);

        // Vòm đá tự nhiên uốn cong
        const caveArch = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.10, 8, 16, Math.PI), mountainMat);
        caveArch.position.set(0, 0.16, 0);
        caveArch.castShadow = true;

        // Vách đá phủ phía trên vòm hang
        const caveOverhang = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 1), mountainMat);
        caveOverhang.scale.set(1.4, 0.7, 1.0);
        caveOverhang.position.set(0, 0.36, 0);

        // Vùng tối sâu thẳm trong lòng hang
        const caveVoid = new THREE.Mesh(
          new RoundedBoxGeometry(0.34, 0.22, 0.12, 2, 0.01),
          LandmarkMaterials.getMat('trangAnCaveDarkVoid', () => new THREE.MeshStandardMaterial({
            color: '#0F172A',
            roughness: 0.98
          }))
        );
        caveVoid.position.set(0, 0.13, -0.06);

        // Các nhũ đá (Stalactites) rủ xuống từ vòm hang
        const stalactiteCoords = [
          [-0.10, 0.24, 0.03, 0.016, 0.09],
          [-0.03, 0.26, 0.04, 0.018, 0.11],
          [0.05, 0.25, 0.03, 0.014, 0.08],
          [0.11, 0.23, 0.04, 0.015, 0.07]
        ];
        stalactiteCoords.forEach(([sx, sy, sz, sRad, sHeight]) => {
          const stal = new THREE.Mesh(new THREE.ConeGeometry(sRad, sHeight, 6), stalactiteMat);
          stal.rotation.x = Math.PI; // Rủ từ trên trần hang xuống
          stal.position.set(sx, sy, sz);
          caveGroup.add(stal);
        });

        // Bụi dương xỉ rủ trên miệng hang
        const caveFern = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08, 1), foliageDarkMat);
        caveFern.scale.set(1.4, 0.45, 0.8);
        caveFern.position.set(0, 0.32, 0.08);

        caveGroup.add(caveArch, caveOverhang, caveVoid, caveFern);

        // 4. THỦY ĐÌNH NỔI TRÀNG AN (BIỂU TƯỢNG KIẾN TRÚC ĐÌNH LÀNG CỔ KÍNH TRÊN MẶT NƯỚC - CHỒNG DIÊM 8 MÁI CONG)
        const pavilionGroup = new THREE.Group();
        pavilionGroup.position.set(-0.06, 0.04, 0.02);

        // a) Bệ móng đá bát giác kiên cố nổi giữa hồ
        const stoneBase = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.08, 8), stonePlinthMat);
        stoneBase.position.y = 0.04;
        stoneBase.receiveShadow = true;

        // Bậc tam cấp đá dẫn xuống sát mặt nước đón khách từ thuyền
        const steps = new THREE.Mesh(new RoundedBoxGeometry(0.20, 0.04, 0.10, 2, 0.008), stonePlinthMat);
        steps.position.set(0, 0.02, 0.38);

        // Cầu đá nhỏ hình cung nối Thủy Đình vào bờ phải
        const bridgeArch = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.035, 0.10, 2, 0.008), stonePlinthMat);
        bridgeArch.rotation.y = -0.35;
        bridgeArch.position.set(0.34, 0.05, 0.10);

        // Lan can đá bao quanh bệ đình với trụ sen ở các góc
        const railing = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 8), stonePlinthMat);
        railing.position.y = 0.10;

        // b) 8 Cột Gỗ Lim Đỏ Thẫm Kiên Cố (4 Cột chính bên trong, 4 Cột phụ bên ngoài)
        const colCoordsInner = [
          [-0.12, -0.12], [0.12, -0.12],
          [-0.12, 0.12], [0.12, 0.12]
        ];
        colCoordsInner.forEach(([cx, cz]) => {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 0.34, 10), pavilionWoodMat);
          col.position.set(cx, 0.25, cz);
          col.castShadow = true;
          pavilionGroup.add(col);
        });

        const colCoordsOuter = [
          [-0.20, 0], [0.20, 0],
          [0, -0.20], [0, 0.20]
        ];
        colCoordsOuter.forEach(([cx, cz]) => {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.015, 0.28, 8), pavilionWoodMat);
          col.position.set(cx, 0.22, cz);
          col.castShadow = true;
          pavilionGroup.add(col);
        });

        // Xà gồ khung gỗ đỡ sàn mái
        const ringBeamLower = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.025, 0.34), pavilionWoodMat);
        ringBeamLower.position.y = 0.38;

        // Trống đồng / Chiêng đồng cổ truyền đặt trong lòng Thủy Đình
        const drumMat = LandmarkMaterials.getMat('thuyDinhBronzeDrum', () => new THREE.MeshStandardMaterial({
          color: '#B45309',
          metalness: 0.7,
          roughness: 0.35
        }));
        const bronzeDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.05, 12), drumMat);
        bronzeDrum.position.set(0, 0.11, 0);

        // c) TẦNG MÁI 1 (MÁI HẠ XÒE RỘNG VỚI 4 ĐẦU ĐAO VÚT CONG)
        const roofLower = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.18, 4), roofTileMat);
        roofLower.rotation.y = Math.PI / 4;
        roofLower.position.y = 0.44;
        roofLower.castShadow = true;

        // 4 Đầu đao cong vút ở 4 góc mái tầng 1
        [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4].forEach(rotY => {
          const eaveHorn = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 8, Math.PI / 2.2), pavilionWoodMat);
          eaveHorn.rotation.set(Math.PI / 2, 0, rotY);
          eaveHorn.position.set(0.24 * Math.cos(rotY), 0.38, 0.24 * Math.sin(rotY));
          pavilionGroup.add(eaveHorn);
        });

        // 4 Đèn lồng lụa vàng treo dưới 4 góc mái hiên
        [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4].forEach(rotY => {
          const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.035, 6), lanternGlowMat);
          lantern.position.set(0.22 * Math.cos(rotY), 0.33, 0.22 * Math.sin(rotY));
          pavilionGroup.add(lantern);
        });

        // d) CỔ DIÊM (CLERESTORY - VÁCH THÔNG THOÁNG CHẶN GIỮA 2 TẦNG MÁI CÓ BIỂN CHỮ "TRÀNG AN")
        const clerestory = new THREE.Mesh(new RoundedBoxGeometry(0.20, 0.08, 0.20, 2, 0.008), pavilionWoodMat);
        clerestory.position.y = 0.52;

        const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.032), goldFinialMat);
        plaque.position.set(0, 0.52, 0.102);

        // e) TẦNG MÁI 2 (MÁI THƯỢNG CỔ KÍNH ĐẦU ĐAO VÚT CONG VỀ BỐN PHƯƠNG)
        const roofUpper = new THREE.Mesh(new THREE.ConeGeometry(0.30, 0.16, 4), roofTileMat);
        roofUpper.rotation.y = Math.PI / 4;
        roofUpper.position.y = 0.63;
        roofUpper.castShadow = true;

        // 4 Đầu đao vút cong ở 4 góc mái tầng thượng
        [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4].forEach(rotY => {
          const eaveHornUpper = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.01, 6, 8, Math.PI / 2.2), pavilionWoodMat);
          eaveHornUpper.rotation.set(Math.PI / 2, 0, rotY);
          eaveHornUpper.position.set(0.16 * Math.cos(rotY), 0.58, 0.16 * Math.sin(rotY));
          pavilionGroup.add(eaveHornUpper);
        });

        // f) Đỉnh nóc đình chạm bầu rượu / bình hồ lô phong thủy dát vàng
        const roofFinial = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), goldFinialMat);
        roofFinial.position.y = 0.74;

        const roofSpire = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.08, 6), goldFinialMat);
        roofSpire.position.y = 0.79;

        pavilionGroup.add(
          stoneBase, steps, bridgeArch, railing,
          ringBeamLower, bronzeDrum,
          roofLower, clerestory, plaque,
          roofUpper, roofFinial, roofSpire
        );

        // 5. CÁC THUYỀN NAN TRÀNG AN TRUYỀN THỐNG CÙNG NGƯỜI CHÈO ĐÒ NÓN LÁ NINH BÌNH
        const createDetailedSampanWithRower = (scale = 1.0, hasRower = true): THREE.Group => {
          const sampan = new THREE.Group();
          sampan.userData = { animType: 'float_wave' };

          // Thân thuyền nan gỗ uốn cong
          const hull = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.11, 0.22, 3, 0.02), boatWoodMat);
          hull.position.y = 0.065;
          hull.castShadow = true;

          const bowProw = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 10), boatWoodMat);
          bowProw.rotation.z = -Math.PI / 2.3;
          bowProw.position.set(0.36, 0.10, 0);

          const sternProw = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.20, 10), boatWoodMat);
          sternProw.rotation.z = Math.PI / 2.3;
          sternProw.position.set(-0.36, 0.10, 0);

          // Ghế ván ngồi
          [-0.15, 0.02, 0.18].forEach(sx => {
            const seat = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.02, 0.18, 2, 0.004), seatWoodMat);
            seat.position.set(sx, 0.09, 0);
            sampan.add(seat);
          });

          // Mái chèo nan đôi đặt ở khoang lái
          [-0.09, 0.09].forEach(sideZ => {
            const oar = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.44, 8), seatWoodMat);
            oar.position.set(-0.24, 0.12, sideZ);
            oar.rotation.x = sideZ > 0 ? -0.45 : 0.45;
            oar.rotation.z = 0.35;
            sampan.add(oar);
          });

          if (hasRower) {
            // Người chèo đò Ninh Bình: áo bà ba xanh + Nón lá vàng rơm
            const rowerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.14, 8), aoBaBaMat);
            rowerBody.position.set(-0.16, 0.18, 0);

            const rowerHead = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), seatWoodMat);
            rowerHead.position.set(-0.16, 0.27, 0);

            // Nón lá bài thơ hình nón đặc trưng
            const nonLa = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.032, 12), nonLaMat);
            nonLa.position.set(-0.16, 0.30, 0);

            // Nón lá của du khách ngồi ghế trước
            const touristNonLa = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.03, 12), nonLaMat);
            touristNonLa.position.set(0.02, 0.13, 0);

            sampan.add(rowerBody, rowerHead, nonLa, touristNonLa);
          } else {
            // Nón lá đặt trên ghế ngắm cảnh
            const nonLa = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.03, 12), nonLaMat);
            nonLa.position.set(0.02, 0.12, 0);
            sampan.add(nonLa);
          }

          sampan.add(hull, bowProw, sternProw);
          sampan.scale.set(scale, scale, scale);
          return sampan;
        };

        // Thuyền 1: Thuyền chở khách với người chèo đò nón lá bồng bềnh bên bến Thủy Đình
        const sampan1 = createDetailedSampanWithRower(0.85, true);
        sampan1.position.set(-0.18, 0.065, 0.24);
        sampan1.rotation.y = 0.32;

        // Thuyền 2: Thuyền nan đang lướt vào cửa vòm Hang Luồn
        const sampan2 = createDetailedSampanWithRower(0.72, true);
        sampan2.position.set(0.18, 0.06, -0.12);
        sampan2.rotation.y = -0.45;

        // 6. Đôi cò trắng non nước chao liệng trên không trung Tràng An
        const createStork = (x: number, y: number, z: number, ry: number, rz: number): THREE.Group => {
          const stork = new THREE.Group();
          stork.position.set(x, y, z);
          stork.rotation.set(0, ry, rz);

          const body = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.09, 6), storkWhiteMat);
          body.rotation.z = Math.PI / 2;

          const beak = new THREE.Mesh(new THREE.ConeGeometry(0.005, 0.03, 4), goldFinialMat);
          beak.rotation.z = -Math.PI / 2;
          beak.position.set(0.06, 0, 0);

          const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.003, 0.025), storkWhiteMat);
          wingL.rotation.z = 0.32;
          wingL.position.set(-0.01, 0.014, 0.045);

          const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.003, 0.025), storkWhiteMat);
          wingR.rotation.z = 0.32;
          wingR.position.set(-0.01, 0.014, -0.045);

          stork.add(body, beak, wingL, wingR);
          return stork;
        };

        const stork1 = createStork(0.24, 0.96, 0.08, 0.35, -0.12);
        const stork2 = createStork(-0.20, 1.08, -0.10, -0.45, 0.15);

        group.add(
          water, ripPavilion, ripCave,
          lotus1, lotus2, lotus3,
          riceL, riceR,
          mountainL, mountainR, caveGroup,
          pavilionGroup,
          sampan1, sampan2,
          stork1, stork2
        );
        break;
      }

      // =====================================================
      // PHÂN KHU 7: THỦ ĐÔ HÀ NỘI - HỒ TÂY, PHỐ CỔ, BA ĐÌNH (Emerald Green)
      // =====================================================
      case 31: {
        // Hà Nội (Hồ Tây): Chùa Trấn Quốc Bảo Tháp Lục Độ Đài Sen & Cây Bồ Đề Cổ Thụ
        const pagodaTerracotta = LandmarkMaterials.getMat('tranQuocTerracotta', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.42 }));
        const goldSpireMat = LandmarkMaterials.getMat('tranQuocGoldRoof', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', roughness: 0.22, metalness: 0.18 }));
        const lakeMat = LandmarkMaterials.getMat('westLakeWater', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.08, metalness: 0.15 }));
        const whiteBuddhaMat = LandmarkMaterials.getMat('whiteBuddha', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.25 }));
        const bodhiLeafMat = LandmarkMaterials.getMat('bodhiCanopyGreen', () => new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.35 }));
        const bodhiTrunkMat = LandmarkMaterials.getMat('pineTrunkBark', () => new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.7 }));

        // Mặt nước Hồ Tây & Bán đảo xanh
        const lake = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.08, 0.9, 3, 0.03), lakeMat);
        lake.position.set(0, 0.04, 0);

        const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.66, 0.14, 24), LandmarkMaterials.getMat('lotusStoneBase', () => new THREE.MeshStandardMaterial({ color: '#BDC3C7' })));
        lotusBase.position.set(-0.1, 0.08, 0);

        // Bảo tháp Lục Độ Đài Sen 11 tầng lục giác màu đỏ son cao 1.55 units theo đúng chuẩn Mục 4
        // Mỗi tầng có mái lợp ngói hoàng lưu ly đua ra và tượng Phật bằng đá trắng quý giá trong các hốc vòm
        let currentY = 0.16;
        for (let t = 0; t < 11; t++) {
          const ratio = t / 10;
          const rTier = 0.45 - ratio * 0.31; // 0.45 ở tầng 1 thuôn dần về 0.14 ở tầng 11
          const h = 0.095 - ratio * 0.025;   // ~0.095 xuống ~0.07

          const body = new THREE.Mesh(new THREE.CylinderGeometry(rTier * 0.88, rTier, h, 6), pagodaTerracotta);
          body.position.set(-0.1, currentY + h / 2, 0);
          if (t === 0) body.castShadow = true;

          const eave = new THREE.Mesh(new THREE.CylinderGeometry(rTier * 0.65, rTier * 1.35, 0.032, 6), goldSpireMat);
          eave.position.set(-0.1, currentY + h + 0.016, 0);

          const buddha = new THREE.Mesh(new THREE.SphereGeometry(0.024 + (1 - ratio) * 0.014, 6, 6), whiteBuddhaMat);
          buddha.position.set(-0.1, currentY + h * 0.48, rTier * 0.88);

          group.add(body, eave, buddha);
          currentY += h + 0.028;
        }

        // Đỉnh tháp Cửu Phẩm Liên Hoa cao tới 1.55 units (Đài sen 9 tầng & hồ lô ngọc)
        const lotusCrown = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 12), goldSpireMat);
        lotusCrown.position.set(-0.1, currentY + 0.11, 0);

        // Cây Bồ Đề xum xuê tỏa bóng mát bên cạnh Bảo Tháp
        const bodhiTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 0.48, 10), bodhiTrunkMat);
        bodhiTrunk.position.set(0.42, 0.28, 0.08);
        const bodhiCanopy = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), bodhiLeafMat);
        bodhiCanopy.scale.set(1.2, 0.85, 1.2);
        bodhiCanopy.position.set(0.42, 0.62, 0.08);
        bodhiCanopy.castShadow = true;

        group.add(lake, lotusBase, lotusCrown, bodhiTrunk, bodhiCanopy);
        break;
      }

      case 32: {
        // Phố Cổ Hà Nội: Cửa Ô Quan Chưởng Vọng Lâu & Dãy Mái Ngói Vảy Cá Rêu Phong
        const brickGateMat = LandmarkMaterials.getMat('oQuanChuongBrick', () => new THREE.MeshStandardMaterial({ color: '#A0522D', roughness: 0.68 }));
        const ochreWallMat = LandmarkMaterials.getMat('hnOchreWall', () => new THREE.MeshStandardMaterial({ color: '#F39C12', roughness: 0.52 }));
        const fishScaleRoofMat = LandmarkMaterials.getMat('hnFishScaleRoof', () => new THREE.MeshStandardMaterial({ color: '#8D3B24', roughness: 0.58 }));
        const voidDarkMat = LandmarkMaterials.getMat('portalDark', () => new THREE.MeshStandardMaterial({ color: '#1E272E' }));

        // 1. Cửa Ô Quan Chưởng: Cửa vòm cuốn bằng gạch vồ rêu phong, phía trên có vọng lâu mái cong cổ kính
        const gateWall = new THREE.Mesh(new RoundedBoxGeometry(0.76, 0.52, 0.46, 3, 0.04), brickGateMat);
        gateWall.position.set(-0.18, 0.26, 0.08);
        gateWall.castShadow = true;

        const mainArch = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.34, 0.08, 2, 0.03), voidDarkMat);
        mainArch.position.set(-0.18, 0.18, 0.29);
        const sideArchL = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.24, 0.08, 2, 0.02), voidDarkMat);
        sideArchL.position.set(-0.42, 0.14, 0.29);
        const sideArchR = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.24, 0.08, 2, 0.02), voidDarkMat);
        sideArchR.position.set(0.06, 0.14, 0.29);

        // Vọng lâu mái cong cổ kính trên đỉnh Cửa Ô
        const watchtower = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.26, 0.32, 2, 0.02), ochreWallMat);
        watchtower.position.set(-0.18, 0.64, 0.08);
        const watchtowerRoof = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.24, 4), fishScaleRoofMat);
        watchtowerRoof.rotation.y = Math.PI / 4;
        watchtowerRoof.scale.set(1.2, 0.7, 0.95);
        watchtowerRoof.position.set(-0.18, 0.86, 0.08);
        watchtowerRoof.castShadow = true;

        // 2. Dãy nhà phố cổ 36 phố phường mái ngói vảy cá nâu đỏ xếp tầng so le
        const oldHouse1 = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.68, 0.48, 3, 0.03), ochreWallMat);
        oldHouse1.position.set(0.36, 0.34, -0.06);
        oldHouse1.castShadow = true;
        const oldRoof1 = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.28, 4), fishScaleRoofMat);
        oldRoof1.rotation.y = Math.PI / 4;
        oldRoof1.position.set(0.36, 0.8, -0.06);

        const oldHouse2 = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.54, 0.44, 3, 0.03), ochreWallMat);
        oldHouse2.position.set(0.32, 0.27, 0.18);
        const oldRoof2 = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.24, 4), fishScaleRoofMat);
        oldRoof2.rotation.y = Math.PI / 4;
        oldRoof2.position.set(0.32, 0.64, 0.18);

        group.add(gateWall, mainArch, sideArchL, sideArchR, watchtower, watchtowerRoof, oldHouse1, oldRoof1, oldHouse2, oldRoof2);
        break;
      }

      case 34: {
        // Ba Đình / Tràng Tiền: Cột Cờ Hà Nội (Kỳ Đài Thăng Long) 3 Tầng Đế Gạch Đỏ & Cờ Tổ Quốc
        const redBrickMat = LandmarkMaterials.getMat('cotCoRedBrick', () => new THREE.MeshStandardMaterial({ color: '#B3391E', roughness: 0.62 }));
        const stoneTrimMat = LandmarkMaterials.getMat('cotCoStoneTrim', () => new THREE.MeshStandardMaterial({ color: '#DFE6E9', roughness: 0.45 }));
        const vnFlagRedMat = LandmarkMaterials.getMat('vietnamFlagRed', () => new THREE.MeshBasicMaterial({ color: '#DA251D', side: THREE.DoubleSide }));
        const goldStarMat = LandmarkMaterials.getMat('shinyGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', emissive: '#F1C40F', emissiveIntensity: 0.6 }));

        // 1. Cấu trúc 3 tầng đế vuông giật cấp hình chóp cụt xây bằng gạch đỏ nung vững chãi
        const tier1 = new THREE.Mesh(new RoundedBoxGeometry(1.18, 0.24, 1.05, 3, 0.04), redBrickMat);
        tier1.position.set(0, 0.12, 0);
        tier1.receiveShadow = true;
        tier1.castShadow = true;

        // Phào chỉ đá viền gờ tầng 1
        const trim1 = new THREE.Mesh(new RoundedBoxGeometry(1.22, 0.03, 1.09, 2, 0.01), stoneTrimMat);
        trim1.position.set(0, 0.24, 0);

        const tier2 = new THREE.Mesh(new RoundedBoxGeometry(0.88, 0.24, 0.82, 3, 0.03), redBrickMat);
        tier2.position.set(0, 0.36, 0);
        tier2.castShadow = true;

        // Phào chỉ đá viền gờ tầng 2
        const trim2 = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.03, 0.86, 2, 0.01), stoneTrimMat);
        trim2.position.set(0, 0.48, 0);

        const tier3 = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.24, 0.58, 3, 0.03), redBrickMat);
        tier3.position.set(0, 0.6, 0);
        tier3.castShadow = true;

        // Cửa vòm cuốn tò vò đón gió ở tầng 3
        const archDoor = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.16, 0.04, 2, 0.01), stoneTrimMat);
        archDoor.position.set(0, 0.64, 0.292);

        // Cầu thang gạch dẫn lên ở mặt trước
        const stairs = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.52, 0.18, 2, 0.02), stoneTrimMat);
        stairs.position.set(0, 0.26, 0.46);
        stairs.rotation.x = -0.35;

        // 2. Thân cột cờ hình bát giác cao vút & Vọng canh trên đỉnh
        const octagonalTower = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.78, 8), redBrickMat);
        octagonalTower.position.set(0, 1.1, 0);
        octagonalTower.castShadow = true;

        // Lỗ thông gió hình dải hoa vòm quanh thân cột cờ bát giác
        const ventMat = LandmarkMaterials.getMat('cotCoVentDark', () => new THREE.MeshStandardMaterial({ color: '#2C3A47', roughness: 0.8 }));
        [0.95, 1.25].forEach(vy => {
          const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.03, 8), ventMat);
          vent.position.set(0, vy, 0);
          group.add(vent);
        });

        const watchPavilion = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.16, 8), stoneTrimMat);
        watchPavilion.position.set(0, 1.56, 0);

        // Mái vọng lâu bát giác
        const pavilionRoof = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.24, 0.08, 8), redBrickMat);
        pavilionRoof.position.set(0, 1.66, 0);

        // Cán cờ & Cụm lá cờ đỏ sao vàng bằng vải lụa 3D tung bay kiêu hãnh
        const flagMast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.56, 8), stoneTrimMat);
        flagMast.position.set(0, 1.9, 0);

        // Đỉnh cán cờ có quả cầu đồng mạ vàng uy nghi
        const mastFinial = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), goldStarMat);
        mastFinial.position.set(0, 2.2, 0);

        // Cụm lá cờ Quốc kỳ Việt Nam: Ngôi sao vàng 5 cánh tỷ lệ chuẩn (10 đỉnh đa giác) hiển thị sắc nét trên cả hai mặt
        const flagGroup = new THREE.Group();
        flagGroup.position.set(0.012, 2.02, 0);
        flagGroup.userData = { animType: 'float_wave' };

        const flagCloth = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.24, 0.012, 2, 0.003), vnFlagRedMat);
        flagCloth.position.set(0.18, 0, 0);
        flagCloth.castShadow = true;

        const starShape = LandmarkHelpers.create5PointStarShape(0.068, 0.026);
        const starGeo = new THREE.ShapeGeometry(starShape);

        // Mặt trước lá cờ (+Z)
        const starFront = new THREE.Mesh(starGeo, goldStarMat);
        starFront.position.set(0.18, 0, 0.007);

        // Mặt sau lá cờ (-Z)
        const starBack = new THREE.Mesh(starGeo, goldStarMat);
        starBack.position.set(0.18, 0, -0.007);
        starBack.rotation.y = Math.PI;

        flagGroup.add(flagCloth, starFront, starBack);

        group.add(tier1, trim1, tier2, trim2, tier3, archDoor, stairs, octagonalTower, watchPavilion, pavilionRoof, flagMast, mastFinial, flagGroup);
        break;
      }

      // =====================================================
      // PHÂN KHU 8: ĐẠI ĐÔ THỊ SÀI GÒN PHỒN VINH (Royal Sapphire)
      // =====================================================
      case 37: {
        // TP. Hồ Chí Minh: Tòa Tháp Landmark 81 Bó Tre Kính Phản Chiếu, Gân Thép Đứng & Spire Pha Lê
        const glassCyanMat = LandmarkMaterials.getMat('l81GlassCyanSunset', () => new THREE.MeshStandardMaterial({
          color: '#54A0FF',
          emissive: '#0984E3',
          emissiveIntensity: 0.45,
          roughness: 0.08,
          metalness: 0.92
        }));
        const mullionMat = LandmarkMaterials.getMat('l81MullionChrome', () => new THREE.MeshStandardMaterial({
          color: '#FFFFFF',
          metalness: 0.95,
          roughness: 0.08
        }));
        const neonLedMat = LandmarkMaterials.getMat('l81NeonRib', () => new THREE.MeshStandardMaterial({
          color: '#E0F7FA',
          emissive: '#00CEC9',
          emissiveIntensity: 1.15,
          roughness: 0.12
        }));
        const spireGoldMat = LandmarkMaterials.getMat('l81SpireGold', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          emissive: '#F1C40F',
          emissiveIntensity: 0.9,
          metalness: 0.92,
          roughness: 0.1
        }));
        const beaconRedMat = LandmarkMaterials.getMat('l81BeaconRed', () => new THREE.MeshStandardMaterial({
          color: '#FF3838',
          emissive: '#FF3838',
          emissiveIntensity: 1.4
        }));
        const podiumMat = LandmarkMaterials.getMat('l81PodiumMarble', () => new THREE.MeshStandardMaterial({
          color: '#F8FAFC',
          roughness: 0.25,
          metalness: 0.12
        }));

        // 1. Khối đế phức hợp TTTM Vincom Center Landmark 81 hai tầng giật cấp
        const podiumBase = new THREE.Mesh(new RoundedBoxGeometry(1.32, 0.12, 1.12, 3, 0.04), podiumMat);
        podiumBase.position.set(0, 0.06, 0.04);
        podiumBase.receiveShadow = true;

        const podiumUpper = new THREE.Mesh(new RoundedBoxGeometry(1.18, 0.1, 0.98, 3, 0.03), glassCyanMat);
        podiumUpper.position.set(0, 0.15, 0.04);
        podiumUpper.castShadow = true;

        // Mái sảnh đón vòm kính hiện đại trước cổng vào TTTM
        const entranceCanopy = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.035, 0.22, 2, 0.015), mullionMat);
        entranceCanopy.position.set(0, 0.14, 0.58);
        const entranceRug = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.16), LandmarkMaterials.getMat('l81RugBlue', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.5 })));
        entranceRug.rotation.x = -Math.PI / 2;
        entranceRug.position.set(0, 0.122, 0.58);

        group.add(podiumBase, podiumUpper, entranceCanopy, entranceRug);

        // 2. Cấu trúc 9 cụm ống giật cấp mô phỏng Bó Tre truyền thống (Bamboo Bundle)
        const tubePositions = [
          // 4 Cột góc thấp nhất (Tầng 1-40, cao 1.05 units)
          [-0.24, -0.24, 1.05], [0.24, -0.24, 1.05],
          [-0.24, 0.24, 1.05], [0.24, 0.24, 1.05],
          // 4 Cột cạnh vươn cao trung gian (Tầng 41-65, cao 1.82 units)
          [0, -0.24, 1.82], [0, 0.24, 1.82],
          [-0.24, 0, 1.82], [0.24, 0, 1.82],
          // 1 Tháp lõi vươn lên đỉnh trời (Tầng 66-81, cao 2.58 units)
          [0, 0, 2.58]
        ];

        tubePositions.forEach(([tx, tz, th]) => {
          // Thân ống kính phản chiếu
          const colGeo = new RoundedBoxGeometry(0.22, th, 0.22, 3, 0.025);
          const colMesh = new THREE.Mesh(colGeo, glassCyanMat);
          colMesh.position.set(tx, th / 2 + 0.18, tz);
          colMesh.castShadow = true;
          group.add(colMesh);

          // 4 Gờ gân thép đứng (Vertical Architectural Mullions) mạ crom sáng ở 4 góc cột
          const ribGeo = new THREE.BoxGeometry(0.015, th, 0.015);
          [[-0.108, -0.108], [0.108, -0.108], [-0.108, 0.108], [0.108, 0.108]].forEach(([rx, rz]) => {
            const rib = new THREE.Mesh(ribGeo, mullionMat);
            rib.position.set(tx + rx, th / 2 + 0.18, tz + rz);
            group.add(rib);
          });

          // Đèn LED neon và đài quan sát gián đoạn ở đỉnh từng đốt tre
          const crownCap = new THREE.Mesh(new RoundedBoxGeometry(0.23, 0.038, 0.23, 2, 0.01), neonLedMat);
          crownCap.position.set(tx, th + 0.18, tz);
          group.add(crownCap);

          // Vạch sàn kính ngang phân tầng kiến trúc (Architectural Spandrel Bands)
          const numBands = Math.floor(th / 0.35);
          for (let b = 1; b < numBands; b++) {
            const band = new THREE.Mesh(new THREE.BoxGeometry(0.224, 0.015, 0.224), mullionMat);
            band.position.set(tx, 0.18 + b * 0.35, tz);
            group.add(band);
          }
        });

        // 3. Hệ thống dải đèn LED neon dọc chạy dọc 4 sống lưng trung tâm tòa tháp
        const spineGeo = new THREE.BoxGeometry(0.02, 2.52, 0.02);
        [[0.115, 0], [-0.115, 0], [0, 0.115], [0, -0.115]].forEach(([sx, sz]) => {
          const spineLed = new THREE.Mesh(spineGeo, neonLedMat);
          spineLed.position.set(sx, 1.48, sz);
          group.add(spineLed);
        });

        // 4. Đài quan sát SkyView (Tầng 79-81) & Mũi tháp Spire thuôn nhọn
        const skyViewDeck = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.08, 0.26, 2, 0.02), mullionMat);
        skyViewDeck.position.set(0, 2.8, 0);

        const transitionCrown = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.52, 4), glassCyanMat);
        transitionCrown.rotation.y = Math.PI / 4;
        transitionCrown.position.set(0, 3.06, 0);

        // 5. Cột ăng-ten Spire mạ vàng vút cao & Đèn báo không đỏ nhấp nháy
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.042, 0.85, 16), spireGoldMat);
        antenna.position.set(0, 3.52, 0);

        const redBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), beaconRedMat);
        redBeacon.position.set(0, 3.42, 0.04);
        redBeacon.userData = { animType: 'pulse_red' };

        // Quả cầu pha lê đa giác phát sáng lấp lánh trên đỉnh Spire cao 3.98 units
        const crystalOrb = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.095, 1),
          neonLedMat
        );
        crystalOrb.position.set(0, 3.96, 0);
        crystalOrb.userData = { animType: 'rotate_pulse' };

        group.add(skyViewDeck, transitionCrown, antenna, redBeacon, crystalOrb);
        break;
      }

      case 39: {
        // Đại Lộ Sài Gòn: Chợ Bến Thành Tháp Đồng Hồ & Quảng Trường Quách Thị Trang
        const creamWallMat = LandmarkMaterials.getMat('benThanhCreamPlaster', () => new THREE.MeshStandardMaterial({ color: '#FFF8E7', roughness: 0.38 }));
        const terracottaRoofMat = LandmarkMaterials.getMat('benThanhTerracottaTile', () => new THREE.MeshStandardMaterial({ color: '#E84118', roughness: 0.3 }));
        const clockFaceMat = LandmarkMaterials.getMat('benThanhClockGold', () => new THREE.MeshStandardMaterial({
          color: '#FFEAA7',
          emissive: '#F1C40F',
          emissiveIntensity: 0.65
        }));
        const clockHandsMat = LandmarkMaterials.getMat('clockHandsBlack', () => new THREE.MeshBasicMaterial({ color: '#1E272E' }));
        const granitePlazaMat = LandmarkMaterials.getMat('quachThiTrangGranite', () => new THREE.MeshStandardMaterial({ color: '#DFE6E9', roughness: 0.45 }));
        const waterAquaMat = LandmarkMaterials.getMat('fountainAqua', () => new THREE.MeshStandardMaterial({ color: '#00CEC9', roughness: 0.1 }));

        // 1. Quảng trường Quách Thị Trang & Phố Đi Bộ Nguyễn Huệ lát đá hoa cương có bồn phun nước
        const plaza = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.06, 0.96, 3, 0.03), granitePlazaMat);
        plaza.position.set(0, 0.03, 0.05);
        plaza.receiveShadow = true;

        // Vạch lát đá granite tương phản hoa văn phố đi bộ Nguyễn Huệ
        const darkGraniteMat = LandmarkMaterials.getMat('nguyenHueDarkGranite', () => new THREE.MeshStandardMaterial({ color: '#636E72', roughness: 0.55 }));
        [-0.35, 0.35].forEach(gx => {
          const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.88), darkGraniteMat);
          stripe.rotation.x = -Math.PI / 2;
          stripe.position.set(gx, 0.062, 0.05);
          group.add(stripe);
        });

        // Bồn phun nước nghệ thuật tròn
        const fountainBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.08, 16), creamWallMat);
        fountainBasin.position.set(0, 0.08, 0.36);
        const fountainWater = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.09, 14), waterAquaMat);
        fountainWater.position.set(0, 0.085, 0.36);

        // Vòng sóng nước lăn tăn quanh đài phun nước
        const fountainRipple = new THREE.Mesh(
          new THREE.RingGeometry(0.23, 0.28, 16),
          LandmarkMaterials.getMat('benThanhRippleMat', () => new THREE.MeshBasicMaterial({ color: '#E0F2FE', transparent: true, opacity: 0.45, side: THREE.DoubleSide }))
        );
        fountainRipple.rotation.x = -Math.PI / 2;
        fountainRipple.position.set(0, 0.063, 0.36);
        group.add(fountainRipple);

        const fountainJet = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 10), LandmarkMaterials.getMat('benThanhJetGlow', () => new THREE.MeshStandardMaterial({
          color: '#E0F7FA',
          emissive: '#00CEC9',
          emissiveIntensity: 0.7,
          transparent: true,
          opacity: 0.85,
          depthWrite: false
        })));
        fountainJet.position.set(0, 0.18, 0.36);
        fountainJet.userData = { animType: 'flicker' };
        group.add(fountainJet);

        // Đèn đường hoa lệ phố đi bộ Nguyễn Huệ
        const lampPostMat = LandmarkMaterials.getMat('nguyenHueLampPost', () => new THREE.MeshStandardMaterial({ color: '#2D3436', metalness: 0.85, roughness: 0.25 }));
        const lampLightMat = LandmarkMaterials.getMat('nguyenHueLampGlow', () => new THREE.MeshStandardMaterial({
          color: '#FFEAA7',
          emissive: '#F1C40F',
          emissiveIntensity: 1.2
        }));
        [-0.48, 0.48].forEach(lx => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.32, 8), lampPostMat);
          post.position.set(lx, 0.22, 0.36);
          const lampHead = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), lampLightMat);
          lampHead.position.set(lx, 0.38, 0.36);
          group.add(post, lampHead);
        });

        // 2. Cửa Nam Chợ Bến Thành với mái tam giác ngói đỏ & Tháp đồng hồ 4 mặt cổ kính
        const basePortal = new THREE.Mesh(new RoundedBoxGeometry(1.18, 0.5, 0.64, 4, 0.05), creamWallMat);
        basePortal.position.set(0, 0.28, -0.08);
        basePortal.castShadow = true;

        const doorVoidMat = LandmarkMaterials.getMat('portalVoidDark', () => new THREE.MeshStandardMaterial({ color: '#1E272E' }));
        const mainArch = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.36, 0.08, 3, 0.04), doorVoidMat);
        mainArch.position.set(0, 0.22, 0.22);

        const lowerRoof = new THREE.Mesh(new RoundedBoxGeometry(1.22, 0.08, 0.72, 3, 0.04), terracottaRoofMat);
        lowerRoof.position.set(0, 0.56, -0.08);

        const clockTower = new THREE.Mesh(new RoundedBoxGeometry(0.64, 0.68, 0.64, 4, 0.05), creamWallMat);
        clockTower.position.set(0, 0.94, -0.08);
        clockTower.castShadow = true;

        const clockPositions = [
          [0, 1.02, 0.25, 0],
          [0, 1.02, -0.41, Math.PI],
          [0.33, 1.02, -0.08, Math.PI / 2],
          [-0.33, 1.02, -0.08, -Math.PI / 2]
        ];

        clockPositions.forEach(([cx, cy, cz, rotY]) => {
          const frame = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 8, 20), LandmarkMaterials.getMat('clockBezelBrass', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.8 })));
          frame.position.set(cx, cy, cz);
          frame.rotation.y = rotY;

          const dial = new THREE.Mesh(new THREE.CircleGeometry(0.125, 16), clockFaceMat);
          dial.position.set(cx, cy, cz);
          dial.rotation.y = rotY;

          const handH = new THREE.Mesh(new THREE.PlaneGeometry(0.014, 0.055), clockHandsMat);
          handH.position.set(cx, cy + 0.02, cz + (cz >= 0 ? 0.005 : -0.005));
          handH.rotation.z = 0.55;

          const handM = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.08), clockHandsMat);
          handM.position.set(cx, cy + 0.03, cz + (cz >= 0 ? 0.005 : -0.005));
          handM.rotation.z = -0.55;

          group.add(frame, dial, handH, handM);
        });

        const spireRoof = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.48, 4), terracottaRoofMat);
        spireRoof.rotation.y = Math.PI / 4;
        spireRoof.position.set(0, 1.5, -0.08);
        spireRoof.castShadow = true;

        // Quả cầu và chóp spire mạ vàng trên đỉnh tháp đồng hồ
        const spireFinial = new THREE.Mesh(
          new THREE.SphereGeometry(0.035, 8, 8),
          LandmarkMaterials.getMat('benThanhGoldFinial', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.92, roughness: 0.15 }))
        );
        spireFinial.position.set(0, 1.76, -0.08);
        group.add(spireFinial);

        // Hàng cây cọ cảnh đặc trưng của Sài Gòn phương Nam
        const palmL = LandmarkHelpers.createMiniPalmTree();
        palmL.scale.set(0.62, 0.62, 0.62);
        palmL.position.set(-0.52, 0.06, 0.28);
        const palmR = LandmarkHelpers.createMiniPalmTree();
        palmR.scale.set(0.62, 0.62, 0.62);
        palmR.position.set(0.52, 0.06, 0.28);

        group.add(plaza, fountainBasin, fountainWater, basePortal, mainArch, lowerRoof, clockTower, spireRoof, palmL, palmR);
        break;
      }

      default: {
        // Mô hình Đình Làng / Vọng Cảnh Cổ Kính thay thế triệt để mọi khối lập phương generic
        const plinthMat = LandmarkMaterials.getMat('pavilionPlinthStone', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.65 }));
        const timberMat = LandmarkMaterials.getMat('pavilionRedTimber', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.35 }));
        const goldMat = LandmarkMaterials.getMat('shinyGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.88, roughness: 0.15 }));
        const terracottaMat = LandmarkMaterials.getMat('terracottaRoofTile', () => new THREE.MeshStandardMaterial({ color: '#D35400', roughness: 0.32 }));
        const lanternMat = LandmarkMaterials.getMat('traditionalLanternGlow', () => new THREE.MeshStandardMaterial({
          color: '#FFEAA7',
          emissive: '#F1C40F',
          emissiveIntensity: 0.9,
          roughness: 0.2
        }));

        // Bệ tam cấp đá xanh
        const base = new THREE.Mesh(new RoundedBoxGeometry(0.85, 0.12, 0.85, 3, 0.03), plinthMat);
        base.position.y = 0.06;
        base.receiveShadow = true;

        // 4 Cột gỗ lim sơn son thếp vàng
        const colGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.62, 12);
        const colCap = new THREE.CylinderGeometry(0.055, 0.04, 0.05, 10);
        const colPositions = [
          [-0.26, -0.26], [0.26, -0.26],
          [-0.26, 0.26], [0.26, 0.26]
        ];
        colPositions.forEach(([cx, cz]) => {
          const col = new THREE.Mesh(colGeo, timberMat);
          col.position.set(cx, 0.42, cz);
          col.castShadow = true;
          const cap = new THREE.Mesh(colCap, goldMat);
          cap.position.set(cx, 0.72, cz);
          group.add(col, cap);
        });

        // Tầng mái dưới lợp ngói âm dương cong vút
        const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.24, 4), terracottaMat);
        lowerRoof.rotation.y = Math.PI / 4;
        lowerRoof.scale.set(1.15, 0.65, 1.15);
        lowerRoof.position.set(0, 0.82, 0);
        lowerRoof.castShadow = true;

        // Tầng mái trên & Đỉnh tháp vàng kim
        const upperRoof = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.28, 4), terracottaMat);
        upperRoof.rotation.y = Math.PI / 4;
        upperRoof.scale.set(1.1, 0.75, 1.1);
        upperRoof.position.set(0, 1.05, 0);
        upperRoof.castShadow = true;

        const finial = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), goldMat);
        finial.position.set(0, 1.25, 0);

        // Đèn lồng vàng ấm treo chính giữa trần đình
        const lantern = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 1), lanternMat);
        lantern.position.set(0, 0.58, 0);
        lantern.userData = { animType: 'flicker' };

        group.add(base, lowerRoof, upperRoof, finial, lantern);
        break;
      }
    }

    group.scale.set(0.9, 0.9, 0.9);
    return group;
  }
}
