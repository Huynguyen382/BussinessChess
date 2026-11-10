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
        const waterMat = LandmarkMaterials.getMat('songHauWater', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.08, transparent: true, opacity: 0.88 }));
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
        const oceanMat = LandmarkMaterials.getMat('cmOceanDeep', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.12, transparent: true, opacity: 0.88 }));
        const foamMat = LandmarkMaterials.getMat('cmSeaFoam', () => new THREE.MeshStandardMaterial({ color: '#E1F5FE', roughness: 0.25, transparent: true, opacity: 0.78 }));
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
          roughness: 0.12,
          transparent: true,
          opacity: 0.88
        }));
        const waveFoamMat = LandmarkMaterials.getMat('vtWaveFoam', () => new THREE.MeshStandardMaterial({
          color: '#E0F7FA',
          roughness: 0.25,
          transparent: true,
          opacity: 0.8
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
          color: '#FFEAA7',
          transparent: true,
          opacity: 0.32,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        }));
        const beaconArm = new THREE.Group();
        beaconArm.position.y = 1.77;
        beaconArm.userData = { animType: 'spin_y' };

        const beamCone = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.45, 18, 1, true), beaconConeMat);
        beamCone.rotation.x = Math.PI / 2.22;
        beamCone.position.set(0, 0, 0.72);
        beaconArm.add(beamCone);

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
          roughness: 0.12,
          transparent: true,
          opacity: 0.86
        }));
        const waveFoamMat = LandmarkMaterials.getMat('ptWaveFoam', () => new THREE.MeshStandardMaterial({
          color: '#E0F7FA',
          roughness: 0.25,
          transparent: true,
          opacity: 0.8
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
        const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.07, 0.14), darkPortalMat);
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
          transparent: true,
          opacity: 0.86
        }));
        const seaFoamMat = LandmarkMaterials.getMat('ntSeaFoam', () => new THREE.MeshStandardMaterial({
          color: '#E0F7FA',
          roughness: 0.25,
          transparent: true,
          opacity: 0.82
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
          roughness: 0.2
        }));

        // 2. Thềm đồi ga cao nguyên bằng đá phiến
        const stationPlinth = new THREE.Mesh(new RoundedBoxGeometry(1.36, 0.06, 1.34, 3, 0.02), plinthMat);
        stationPlinth.position.set(0, 0.03, 0);
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
        const ground = new THREE.Mesh(new RoundedBoxGeometry(1.36, 0.06, 1.34, 3, 0.02), basaltSoilMat);
        ground.position.set(0, 0.03, 0);
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
        const brocadeBandRed = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.08, 0.29), brocadeRedMat);
        brocadeBandRed.position.set(0, 0.98, 0);

        const brocadeBandWhite = new THREE.Mesh(new THREE.BoxGeometry(0.545, 0.02, 0.295), brocadeWhiteMat);
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
          roughness: 0.05,
          metalness: 0.1,
          transparent: true,
          opacity: 0.92
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
        const plateauBase = new THREE.Mesh(new RoundedBoxGeometry(1.36, 0.06, 1.34, 3, 0.02), basaltSoilMat);
        plateauBase.position.set(0, 0.03, 0);
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
          roughness: 0.1,
          transparent: true,
          opacity: 0.88
        }));
        const waveFoamMat = LandmarkMaterials.getMat('qnWaveFoamWhite', () => new THREE.MeshStandardMaterial({
          color: '#E0F7FA',
          roughness: 0.25,
          transparent: true,
          opacity: 0.82
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
        const sea = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.05, 0.78, 3, 0.02), oceanMat);
        sea.position.set(0.04, 0.025, 0.28);
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
        // Hội An: Chùa Cầu Hoài Phố sơn son thếp vàng & Dãy Đèn Lồng Ngũ Sắc
        const bridgeWoodMat = LandmarkMaterials.getMat('chuaCauVermilionWood', () => new THREE.MeshStandardMaterial({ color: '#B3391E', roughness: 0.45 }));
        const goldTrimMat = LandmarkMaterials.getMat('shinyGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.85, roughness: 0.2 }));
        const tileRoofMat = LandmarkMaterials.getMat('chuaCauTile', () => new THREE.MeshStandardMaterial({ color: '#4A5568', roughness: 0.62 }));
        const canalWaterMat = LandmarkMaterials.getMat('hoaiRiverWater', () => new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.1, transparent: true, opacity: 0.88 }));

        // Dòng kênh Hoài Phố xanh mát
        const canal = new THREE.Mesh(new RoundedBoxGeometry(1.26, 0.06, 0.78, 2, 0.02), canalWaterMat);
        canal.position.set(0, 0.03, 0);

        // Thân cầu gỗ uốn cong sơn son thếp vàng
        const bridgeArch = new THREE.Mesh(new RoundedBoxGeometry(1.18, 0.2, 0.56, 3, 0.04), bridgeWoodMat);
        bridgeArch.position.set(0, 0.18, 0);
        const goldRail = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.58), goldTrimMat);
        goldRail.position.set(0, 0.29, 0);

        // Gian chùa giữa cầu & mái lợp ngói âm dương rêu phong
        const temple = new THREE.Mesh(new RoundedBoxGeometry(0.76, 0.38, 0.48, 3, 0.03), bridgeWoodMat);
        temple.position.set(0, 0.44, 0);
        temple.castShadow = true;

        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.38, 4), tileRoofMat);
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(1.24, 0.68, 0.96);
        roof.position.set(0, 0.76, 0);
        roof.castShadow = true;

        // Dãy đèn lồng vải lụa quả trám ngũ sắc (đỏ, vàng, xanh, tím, hồng) hai bên mạn cầu
        const lanternColors = ['#FF4757', '#F1C40F', '#00CEC9', '#A29BFE', '#FD79A8'];
        lanternColors.forEach((hex, idx) => {
          const lMat = LandmarkMaterials.getMat(`hoiAnLantern_${hex}`, () => new THREE.MeshStandardMaterial({
            color: hex,
            emissive: hex,
            emissiveIntensity: 0.9,
            roughness: 0.2
          }));
          const lx = -0.44 + idx * 0.22;
          const lanternFront = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 1), lMat);
          lanternFront.scale.set(0.85, 1.2, 0.85);
          lanternFront.position.set(lx, 0.48, 0.28);
          lanternFront.userData = { animType: 'lighthouse' };
          const lanternBack = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 1), lMat);
          lanternBack.scale.set(0.85, 1.2, 0.85);
          lanternBack.position.set(lx, 0.48, -0.28);
          lanternBack.userData = { animType: 'lighthouse' };
          group.add(lanternFront, lanternBack);
        });

        // Hoa đăng thả trôi lấp lánh trên dòng sông Hoài
        const hoaDangMat = LandmarkMaterials.getMat('hoiAnHoaDangGlow', () => new THREE.MeshStandardMaterial({
          color: '#FFF275',
          emissive: '#F1C40F',
          emissiveIntensity: 1.1
        }));
        [[-0.36, 0.07, 0.32], [0.18, 0.07, 0.34], [0.42, 0.07, -0.3]].forEach(([hx, hy, hz]) => {
          const hd = new THREE.Mesh(new THREE.OctahedronGeometry(0.038, 0), hoaDangMat);
          hd.position.set(hx, hy, hz);
          hd.userData = { animType: 'float_wave' };
          group.add(hd);
        });

        group.add(canal, bridgeArch, goldRail, temple, roof);
        break;
      }

      case 19: {
        // Đà Nẵng: Cầu Rồng Vàng Sông Hàn (metalness: 0.9) Phun Lửa & Hạt Khói Sáng
        const dragonGoldMat = LandmarkMaterials.getMat('dragonGoldGleam', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          emissive: '#F39C12',
          emissiveIntensity: 0.45,
          metalness: 0.9,
          roughness: 0.14
        }));
        const flameCoreMat = LandmarkMaterials.getMat('dragonFlameCore', () => new THREE.MeshStandardMaterial({
          color: '#FF4757',
          emissive: '#FF3838',
          emissiveIntensity: 1.5
        }));
        const flameOuterMat = LandmarkMaterials.getMat('dragonFlameOuter', () => new THREE.MeshStandardMaterial({
          color: '#FFA502',
          emissive: '#FFA502',
          emissiveIntensity: 1.2
        }));
        const sparkSmokeMat = LandmarkMaterials.getMat('dragonSparkSmoke', () => new THREE.MeshStandardMaterial({
          color: '#FFF275',
          emissive: '#FFEAA7',
          emissiveIntensity: 0.9,
          transparent: true,
          opacity: 0.85
        }));

        // Mặt nước sông Hàn xanh biếc gợn sóng dưới chân cầu
        const hanRiver = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.06, 0.88, 3, 0.02), LandmarkMaterials.getMat('hanRiverWater', () => new THREE.MeshStandardMaterial({
          color: '#0984E3',
          roughness: 0.08,
          transparent: true,
          opacity: 0.88
        })));
        hanRiver.position.set(0, 0.04, 0);

        // Mặt cầu nhịp dầm thép bắc qua sông Hàn
        const bridgeDeck = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.08, 0.48, 3, 0.02), LandmarkMaterials.getMat('bridgeSteelDeck', () => new THREE.MeshStandardMaterial({ color: '#BDC3C7', metalness: 0.7 })));
        bridgeDeck.position.set(0, 0.16, 0);

        const lane = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 0.03), LandmarkMaterials.getMat('laneYellow', () => new THREE.MeshBasicMaterial({ color: '#F1C40F' })));
        lane.rotation.x = -Math.PI / 2;
        lane.position.set(0, 0.205, 0);

        // Thân rồng uốn 4 nhịp sóng mạ vàng sáng rực
        for (let w = -0.4; w <= 0.25; w += 0.28) {
          const wave = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.055, 14, 24, Math.PI), dragonGoldMat);
          wave.position.set(w, 0.24, 0);
          wave.castShadow = true;
          group.add(wave);

          const fin = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 4), dragonGoldMat);
          fin.position.set(w, 0.46, 0);
          group.add(fin);
        }

        // Đầu rồng uy nghi hướng thẳng ra Biển Đông
        const head = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.18, 0.16, 3, 0.03), dragonGoldMat);
        head.position.set(0.52, 0.48, 0);
        head.castShadow = true;

        const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.18, 8), dragonGoldMat);
        hornL.position.set(0.48, 0.62, 0.06);
        hornL.rotation.z = -0.3;
        const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.18, 8), dragonGoldMat);
        hornR.position.set(0.48, 0.62, -0.06);
        hornR.rotation.z = -0.3;

        // Hiệu ứng độc bản: Miệng rồng phát ra luồng lửa cam đỏ rực rỡ & hạt khói sáng lấp lánh
        const flameGroup = new THREE.Group();
        flameGroup.position.set(0.68, 0.54, 0);
        flameGroup.userData = { animType: 'flicker' };

        const flameCore = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.38, 12), flameCoreMat);
        flameCore.rotation.z = -Math.PI / 2.8;
        flameCore.position.set(0.06, 0.04, 0);

        const flameOuter = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 12), flameOuterMat);
        flameOuter.rotation.z = -Math.PI / 2.8;

        // Các hạt khói sáng lấp lánh bay lên trời
        [[0.22, 0.18, 0.04, 0.045], [0.3, 0.28, -0.04, 0.06], [0.36, 0.4, 0.02, 0.05]].forEach(([sx, sy, sz, sr]) => {
          const spark = new THREE.Mesh(new THREE.SphereGeometry(sr, 10, 10), sparkSmokeMat);
          spark.position.set(sx, sy, sz);
          flameGroup.add(spark);
        });

        flameGroup.add(flameCore, flameOuter);

        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 3), dragonGoldMat);
        tail.rotation.z = Math.PI / 3;
        tail.position.set(-0.55, 0.32, 0);

        group.add(hanRiver, bridgeDeck, lane, head, hornL, hornR, flameGroup, tail);
        break;
      }

      // =====================================================
      // PHÂN KHU 5: HUẾ, QUẢNG BÌNH (SƠN ĐOÒNG), CỬA LÒ (Ruby Red)
      // =====================================================
      case 21: {
        // Huế: Ngọ Môn 5 Cửa, Lầu Ngũ Phụng Hoàng/Thanh Lưu Ly & Kỳ Đài Cờ Ngũ Sắc
        const stoneMat = LandmarkMaterials.getMat('citadelStoneWall', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.75 }));
        const redWoodMat = LandmarkMaterials.getMat('hueRedTimber', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.38 }));
        const imperialGoldRoof = LandmarkMaterials.getMat('imperialGoldTile', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          roughness: 0.22,
          metalness: 0.18
        }));
        const thanhLuuLyRoof = LandmarkMaterials.getMat('thanhLuuLyGreenTile', () => new THREE.MeshStandardMaterial({
          color: '#00B894',
          roughness: 0.25,
          metalness: 0.15
        }));
        const doorMat = LandmarkMaterials.getMat('gatePortalDark', () => new THREE.MeshStandardMaterial({ color: '#1E272E' }));

        // 1. Hệ thống cổng thành 5 cửa bằng đá thanh và gạch vồ vững chãi
        const wallBase = new THREE.Mesh(new RoundedBoxGeometry(1.24, 0.44, 0.58, 4, 0.05), stoneMat);
        wallBase.position.set(0, 0.22, -0.06);
        wallBase.castShadow = true;

        [-0.44, -0.22, 0, 0.22, 0.44].forEach((dx, idx) => {
          const isCenter = idx === 2;
          const portal = new THREE.Mesh(
            new RoundedBoxGeometry(isCenter ? 0.16 : 0.11, isCenter ? 0.28 : 0.22, 0.08, 2, 0.02),
            doorMat
          );
          portal.position.set(dx, isCenter ? 0.16 : 0.14, 0.22);
          group.add(portal);
        });

        // 2. Lầu Ngũ Phụng 2 tầng mái lợp ngói hoàng lưu ly vàng & thanh lưu ly xanh biếc
        const f1 = new THREE.Mesh(new RoundedBoxGeometry(0.96, 0.22, 0.46, 2, 0.02), redWoodMat);
        f1.position.set(0, 0.55, -0.06);

        const roof1 = new THREE.Mesh(new THREE.ConeGeometry(0.82, 0.22, 4), thanhLuuLyRoof);
        roof1.rotation.y = Math.PI / 4;
        roof1.scale.set(1.25, 0.55, 0.9);
        roof1.position.set(0, 0.74, -0.06);
        roof1.castShadow = true;

        const f2 = new THREE.Mesh(new RoundedBoxGeometry(0.64, 0.18, 0.34, 2, 0.02), redWoodMat);
        f2.position.set(0, 0.92, -0.06);

        const roof2 = new THREE.Mesh(new THREE.ConeGeometry(0.56, 0.24, 4), imperialGoldRoof);
        roof2.rotation.y = Math.PI / 4;
        roof2.scale.set(1.18, 0.65, 0.88);
        roof2.position.set(0, 1.12, -0.06);
        roof2.castShadow = true;

        // 3. Kỳ Đài cổ kính với lá cờ ngũ sắc bay phấp phới trước sân chầu
        const kyDaiBase = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.14, 0.28, 2, 0.02), stoneMat);
        kyDaiBase.position.set(0, 0.07, 0.34);
        const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.022, 0.85, 8), stoneMat);
        flagPole.position.set(0, 0.52, 0.34);
        const fiveColorFlag = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.18), imperialGoldRoof);
        fiveColorFlag.position.set(0.12, 0.84, 0.34);
        fiveColorFlag.userData = { animType: 'float_wave' };
        const flagCoreRed = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.1), redWoodMat);
        flagCoreRed.position.set(0.12, 0.84, 0.345);
        flagCoreRed.userData = { animType: 'float_wave' };

        group.add(wallBase, f1, roof1, f2, roof2, kyDaiBase, flagPole, fiveColorFlag, flagCoreRed);
        break;
      }

      case 23: {
        // Quảng Bình: Kỳ Quan Hang Sơn Đoòng, Hố Sụt Doline Chiếu Nắng & Măng Đá Triệu Năm
        const karstMat = LandmarkMaterials.getMat('phongNhaCaveRock', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.7 }));
        const jungleGreenMat = LandmarkMaterials.getMat('sonDoongJungle', () => new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.42 }));
        const riverMat = LandmarkMaterials.getMat('songSonWater', () => new THREE.MeshStandardMaterial({ color: '#16A085', roughness: 0.08, transparent: true, opacity: 0.9 }));
        const sunbeamMat = LandmarkMaterials.getMat('dolineSunbeam', () => new THREE.MeshBasicMaterial({
          color: '#FFF9C4',
          transparent: true,
          opacity: 0.36,
          side: THREE.DoubleSide,
          depthWrite: false
        }));
        const stalagmiteMat = LandmarkMaterials.getMat('crystalStalactite', () => new THREE.MeshStandardMaterial({
          color: '#E0F2FE',
          roughness: 0.25,
          metalness: 0.25
        }));

        // 1. Vòm hang đá vôi khổng lồ mở ra giếng trời tự nhiên (Doline)
        const caveArch = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.24, 16, 24, Math.PI), karstMat);
        caveArch.position.set(0, 0.32, -0.08);
        caveArch.castShadow = true;

        // Dòng sông ngầm & Thảm rừng nguyên sinh xanh mướt dưới lòng hang
        const river = new THREE.Mesh(new RoundedBoxGeometry(1.18, 0.06, 0.82, 2, 0.02), riverMat);
        river.position.set(0, 0.03, 0.05);

        const forestFloor = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), jungleGreenMat);
        forestFloor.scale.set(1.3, 0.45, 1.0);
        forestFloor.position.set(-0.08, 0.14, -0.02);

        // Tia nắng chiếu xiên qua giếng trời Doline xuống thảm rừng
        const sunRay = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.32, 0.85, 14, 1, true), sunbeamMat);
        sunRay.position.set(-0.05, 0.52, -0.02);
        sunRay.rotation.z = -0.18;
        sunRay.userData = { animType: 'flicker' };

        // 2. Cột măng đá (Stalagmite) & thạch nhũ hàng triệu năm tuổi vươn cao
        const stalagmite1 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.58, 12), stalagmiteMat);
        stalagmite1.position.set(0.26, 0.32, 0.12);
        stalagmite1.castShadow = true;
        const stalagmite2 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.42, 10), stalagmiteMat);
        stalagmite2.position.set(-0.28, 0.24, 0.16);
        const stalactite1 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.32, 10), stalagmiteMat);
        stalactite1.rotation.x = Math.PI;
        stalactite1.position.set(0.12, 0.64, -0.05);

        group.add(caveArch, river, forestFloor, sunRay, stalagmite1, stalagmite2, stalactite1);
        break;
      }

      case 24: {
        // Cửa Lò: Đảo Lan Châu Hình Cóc Đón Sóng, Hải Đăng Nhỏ & Cầu Cảng Thuyền Buồm
        const rockMat = LandmarkMaterials.getMat('lanChauRock', () => new THREE.MeshStandardMaterial({ color: '#636E72', roughness: 0.68 }));
        const mossMat = LandmarkMaterials.getMat('lanChauGreen', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.45 }));
        const seaMat = LandmarkMaterials.getMat('cuaLoSea', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.1, transparent: true, opacity: 0.88 }));
        const woodPierMat = LandmarkMaterials.getMat('woodPierBrown', () => new THREE.MeshStandardMaterial({ color: '#5D4037', roughness: 0.6 }));
        const whiteMat = LandmarkMaterials.getMat('pureWhite', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.25 }));
        const goldMat = LandmarkMaterials.getMat('shinyGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', emissive: '#F1C40F', emissiveIntensity: 0.6 }));

        // Mặt biển xanh Cửa Lò
        const sea = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.08, 0.88, 3, 0.03), seaMat);
        sea.position.set(0, 0.04, 0);

        // 1. Đảo Lan Châu: Mỏm đá nhô ra mép biển như hình một con cóc khổng lồ đang đón sóng
        const islandBody = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 14), rockMat);
        islandBody.scale.set(1.2, 0.72, 0.95);
        islandBody.position.set(-0.22, 0.26, -0.08);
        islandBody.castShadow = true;

        const islandHead = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), mossMat);
        islandHead.scale.set(1.1, 0.65, 0.9);
        islandHead.position.set(-0.05, 0.42, 0.06);

        // Ngọn hải đăng nhỏ / lầu Nghinh Phong đón bình minh trên đỉnh đảo
        const miniLighthouse = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.34, 12), whiteMat);
        miniLighthouse.position.set(-0.18, 0.66, -0.05);
        const miniBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), goldMat);
        miniBeacon.position.set(-0.18, 0.86, -0.05);
        miniBeacon.userData = { animType: 'lighthouse' };

        // 2. Cầu cảng gỗ vươn dài ra biển & thuyền buồm đánh cá neo đậu
        const pierDeck = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.04, 0.18, 2, 0.01), woodPierMat);
        pierDeck.position.set(0.28, 0.16, -0.08);
        const pierPost1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8), woodPierMat);
        pierPost1.position.set(0.48, 0.08, -0.08);

        const boat = LandmarkHelpers.createWoodenBoat('#D35400');
        boat.scale.set(0.78, 0.78, 0.78);
        boat.position.set(0.32, 0.09, 0.22);
        boat.userData = { animType: 'float_wave' };

        group.add(sea, islandBody, islandHead, miniLighthouse, miniBeacon, pierDeck, pierPost1, boat);
        break;
      }

      // =====================================================
      // PHÂN KHU 6: HẢI PHÒNG, QUẢNG NINH (HẠ LONG), NINH BÌNH (Fortune Yellow)
      // =====================================================
      case 26: {
        // Hải Phòng: Cầu Hoàng Văn Thụ Cánh Chim Biển Trắng Muốt & Cảng Biển Container
        const archWhiteMat = LandmarkMaterials.getMat('hvtBridgeWhite', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.22, metalness: 0.2 }));
        const craneBlueMat = LandmarkMaterials.getMat('portCraneBlue', () => new THREE.MeshStandardMaterial({ color: '#0984E3', metalness: 0.75, roughness: 0.25 }));
        const boxBlue = LandmarkMaterials.getMat('maerskBlue', () => new THREE.MeshStandardMaterial({ color: '#2980B9', roughness: 0.35 }));
        const boxGreen = LandmarkMaterials.getMat('evergreenGreen', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.35 }));
        const boxRed = LandmarkMaterials.getMat('cmaRed', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.35 }));
        const riverMat = LandmarkMaterials.getMat('camRiverWater', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.1, transparent: true, opacity: 0.86 }));

        // Mặt sông Cấm & Bến cảng
        const river = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.06, 0.85, 3, 0.03), riverMat);
        river.position.set(0, 0.03, 0);

        // 1. Cầu Hoàng Văn Thụ: Vòm thép cầu uốn cong duyên dáng màu trắng muốt như cánh chim hải âu
        const bridgeDeck = new THREE.Mesh(new RoundedBoxGeometry(1.26, 0.06, 0.26, 2, 0.02), archWhiteMat);
        bridgeDeck.position.set(0, 0.28, -0.15);

        const seagullArch = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.045, 12, 28, Math.PI), archWhiteMat);
        seagullArch.position.set(0, 0.28, -0.15);
        seagullArch.castShadow = true;

        // 2. Cần cẩu container màu xanh dương hiện đại & cụm thùng hàng nhiều màu sắc
        const craneTower = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.95, 10), craneBlueMat);
        craneTower.position.set(0.38, 0.5, 0.18);
        craneTower.castShadow = true;
        const craneBoom = new THREE.Mesh(new RoundedBoxGeometry(0.65, 0.06, 0.08, 2, 0.01), craneBlueMat);
        craneBoom.position.set(0.22, 0.95, 0.18);

        const c1 = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.16, 0.22, 2, 0.02), boxBlue);
        c1.position.set(-0.28, 0.14, 0.22);
        const c2 = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.16, 0.22, 2, 0.02), boxGreen);
        c2.position.set(0.12, 0.14, 0.22);
        const c3 = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.15, 0.2, 2, 0.02), boxRed);
        c3.position.set(-0.28, 0.29, 0.22);

        group.add(river, bridgeDeck, seagullArch, craneTower, craneBoom, c1, c2, c3);
        break;
      }

      case 27: {
        // Quảng Ninh: Kỳ Quan Vịnh Hạ Long, Hòn Trống Mái & Thuyền Buồm Cánh Dơi Nâu Trầm
        const karstRockMat = LandmarkMaterials.getMat('haLongKarstSmooth', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.65 }));
        const foliageMat = LandmarkMaterials.getMat('haLongFoliageGreen', () => new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.35 }));
        const bayWaterMat = LandmarkMaterials.getMat('haLongEmeraldWater', () => new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.08, transparent: true, opacity: 0.9 }));
        const sailBrownMat = LandmarkMaterials.getMat('junkBatwingSailBrown', () => new THREE.MeshStandardMaterial({ color: '#8D3B24', roughness: 0.38 }));

        // 1. Mặt nước vịnh xanh màu ngọc bích
        const water = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.08, 0.88, 3, 0.03), bayWaterMat);
        water.position.set(0, 0.04, 0);

        // Vòng sóng nước lăn tăn quanh chân Hòn Trống và Hòn Mái
        const rippleRingMat = LandmarkMaterials.getMat('haLongRippleMat', () => new THREE.MeshBasicMaterial({
          color: '#E0F2FE',
          transparent: true,
          opacity: 0.38,
          side: THREE.DoubleSide
        }));
        const rip1 = new THREE.Mesh(new THREE.RingGeometry(0.34, 0.44, 16), rippleRingMat);
        rip1.rotation.x = -Math.PI / 2;
        rip1.position.set(-0.28, 0.082, -0.15);
        const rip2 = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.4, 16), rippleRingMat);
        rip2.rotation.x = -Math.PI / 2;
        rip2.position.set(0.26, 0.082, -0.12);
        group.add(rip1, rip2);

        // 2. Hòn Trống Mái: Hai khối đá hình đôi gà trống - mái nghiêng đầu vào nhau
        const makeKarstIslet = (ix: number, iz: number, h: number, r: number, tilt: number) => {
          const islet = new THREE.Group();
          const foot = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.05, r * 0.72, h * 0.5, 18), karstRockMat);
          foot.position.y = h * 0.25;
          foot.castShadow = true;
          const body = new THREE.Mesh(new THREE.SphereGeometry(r * 1.15, 18, 14), karstRockMat);
          body.position.y = h * 0.65;
          body.castShadow = true;
          const cap = new THREE.Mesh(new THREE.SphereGeometry(r * 1.05, 16, 12), foliageMat);
          cap.scale.set(1.15, 0.65, 1.15);
          cap.position.y = h * 0.92;

          islet.add(foot, body, cap);
          islet.position.set(ix, 0, iz);
          islet.rotation.z = tilt;
          return islet;
        };

        const isletTrong = makeKarstIslet(-0.28, -0.15, 1.18, 0.32, 0.08);
        const isletMai = makeKarstIslet(0.26, -0.12, 0.98, 0.28, -0.06);

        // 3. Thuyền buồm cánh dơi màu nâu trầm lướt nhẹ trên vịnh
        const junkBoat = new THREE.Group();
        junkBoat.position.set(0.02, 0.1, 0.24);
        junkBoat.userData = { animType: 'float_wave' };

        const boatHull = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.12, 0.22, 3, 0.03), LandmarkMaterials.getMat('woodBoatBrown', () => new THREE.MeshStandardMaterial({ color: '#5D4037', roughness: 0.5 })));
        const sail = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.58, 14), sailBrownMat);
        sail.scale.set(0.3, 1.0, 1.15);
        sail.position.set(0, 0.32, 0);
        junkBoat.add(boatHull, sail);

        group.add(water, isletTrong, isletMai, junkBoat);
        break;
      }

      case 29: {
        // Ninh Bình: Non Nước Tràng An, Đỉnh Ngọa Long (Hang Múa) & Thảm Lúa Vàng Sông Ngô Đồng
        const mountainMat = LandmarkMaterials.getMat('trangAnKarstRock', () => new THREE.MeshStandardMaterial({ color: '#34495E', roughness: 0.65 }));
        const lakeMat = LandmarkMaterials.getMat('trangAnLakeWater', () => new THREE.MeshStandardMaterial({ color: '#00CEC9', roughness: 0.06, transparent: true, opacity: 0.92 }));
        const riceGoldMat = LandmarkMaterials.getMat('ngoDongRiceGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', roughness: 0.45 }));
        const stoneDragonMat = LandmarkMaterials.getMat('hangMuaStoneDragon', () => new THREE.MeshStandardMaterial({ color: '#DFE6E9', roughness: 0.35, metalness: 0.2 }));

        // 1. Đỉnh Ngọa Long (Hang Múa): Vách núi đá vôi vút nhọn dựng đứng có vòm hang luồn
        const mountainArch = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.24, 14, 24, Math.PI), mountainMat);
        mountainArch.position.set(0, 0.24, -0.08);
        mountainArch.castShadow = true;

        const ngoaLongPeak = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.95, 7), mountainMat);
        ngoaLongPeak.position.set(-0.18, 0.78, -0.12);
        ngoaLongPeak.castShadow = true;

        // Tượng rồng đá uốn lượn trên đỉnh núi Ngọa Long
        for (let d = 0; d < 4; d++) {
          const seg = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), stoneDragonMat);
          seg.position.set(-0.28 + d * 0.1, 1.12 + Math.sin(d * 1.4) * 0.08, -0.12);
          group.add(seg);
        }

        // 2. Dòng sông Ngô Đồng uốn lượn qua hai thảm lúa vàng ươm & thuyền nan
        const water = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.08, 0.88, 3, 0.03), lakeMat);
        water.position.set(0, 0.04, 0);

        const riceFieldL = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.06, 0.78, 2, 0.02), riceGoldMat);
        riceFieldL.position.set(-0.44, 0.06, 0.04);
        const riceFieldR = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.06, 0.78, 2, 0.02), riceGoldMat);
        riceFieldR.position.set(0.44, 0.06, 0.04);

        const canoe = LandmarkHelpers.createWoodenBoat('#D35400');
        canoe.scale.set(0.82, 0.82, 0.82);
        canoe.position.set(0, 0.1, 0.22);
        canoe.userData = { animType: 'float_wave' };

        group.add(mountainArch, ngoaLongPeak, water, riceFieldL, riceFieldR, canoe);
        break;
      }

      // =====================================================
      // PHÂN KHU 7: THỦ ĐÔ HÀ NỘI - HỒ TÂY, PHỐ CỔ, BA ĐÌNH (Emerald Green)
      // =====================================================
      case 31: {
        // Hà Nội (Hồ Tây): Chùa Trấn Quốc Bảo Tháp Lục Độ Đài Sen & Cây Bồ Đề Cổ Thụ
        const pagodaTerracotta = LandmarkMaterials.getMat('tranQuocTerracotta', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.42 }));
        const goldSpireMat = LandmarkMaterials.getMat('tranQuocGoldRoof', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', roughness: 0.22, metalness: 0.18 }));
        const lakeMat = LandmarkMaterials.getMat('westLakeWater', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.08, transparent: true, opacity: 0.88 }));
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

        const tier2 = new THREE.Mesh(new RoundedBoxGeometry(0.88, 0.24, 0.82, 3, 0.03), redBrickMat);
        tier2.position.set(0, 0.36, 0);
        tier2.castShadow = true;

        const tier3 = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.24, 0.58, 3, 0.03), redBrickMat);
        tier3.position.set(0, 0.6, 0);
        tier3.castShadow = true;

        // Cầu thang gạch dẫn lên ở mặt trước
        const stairs = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.52, 0.18, 2, 0.02), stoneTrimMat);
        stairs.position.set(0, 0.26, 0.46);
        stairs.rotation.x = -0.35;

        // 2. Thân cột cờ hình bát giác cao vút & Vọng canh trên đỉnh
        const octagonalTower = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.78, 8), redBrickMat);
        octagonalTower.position.set(0, 1.1, 0);
        octagonalTower.castShadow = true;

        const watchPavilion = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.16, 8), stoneTrimMat);
        watchPavilion.position.set(0, 1.56, 0);

        // Cán cờ & Lá cờ đỏ sao vàng bằng vải lụa 3D tung bay kiêu hãnh
        const flagMast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.56, 8), stoneTrimMat);
        flagMast.position.set(0, 1.9, 0);

        const flagCloth = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.24, 0.02, 2, 0.01), vnFlagRedMat);
        flagCloth.position.set(0.19, 2.02, 0);
        flagCloth.userData = { animType: 'float_wave' };

        const star = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.025, 5), goldStarMat);
        star.rotation.x = Math.PI / 2;
        star.position.set(0.19, 2.02, 0);

        group.add(tier1, tier2, tier3, stairs, octagonalTower, watchPavilion, flagMast, flagCloth, star);
        break;
      }

      // =====================================================
      // PHÂN KHU 8: ĐẠI ĐÔ THỊ SÀI GÒN PHỒN VINH (Royal Sapphire)
      // =====================================================
      case 37: {
        // TP. Hồ Chí Minh: Tòa Tháp Landmark 81 Bó Tre Kính Phản Chiếu, Gân Thép Đứng & Spire Pha Lê
        const glassCyanMat = LandmarkMaterials.getMat('l81GlassCyan', () => new THREE.MeshStandardMaterial({
          color: '#74B9FF',
          emissive: '#0984E3',
          emissiveIntensity: 0.38,
          roughness: 0.1,
          metalness: 0.88
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

        // 1. Quảng trường Quách Thị Trang lát đá hoa cương có bồn phun nước tròn phía trước
        const plaza = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.06, 0.96, 3, 0.03), granitePlazaMat);
        plaza.position.set(0, 0.03, 0.05);
        plaza.receiveShadow = true;

        const fountainBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.08, 16), creamWallMat);
        fountainBasin.position.set(0, 0.08, 0.36);
        const fountainWater = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.09, 14), waterAquaMat);
        fountainWater.position.set(0, 0.085, 0.36);
        const fountainJet = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 10), LandmarkMaterials.getMat('benThanhJetGlow', () => new THREE.MeshStandardMaterial({
          color: '#E0F7FA',
          emissive: '#00CEC9',
          emissiveIntensity: 0.7,
          transparent: true,
          opacity: 0.85
        })));
        fountainJet.position.set(0, 0.18, 0.36);
        fountainJet.userData = { animType: 'flicker' };
        group.add(fountainJet);

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
        const generic = new THREE.Mesh(new RoundedBoxGeometry(0.65, 0.65, 0.65, 4, 0.06), LandmarkMaterials.getMat('genericDiorama', () => new THREE.MeshStandardMaterial({ color: '#00B894' })));
        generic.position.set(0, 0.35, 0);
        group.add(generic);
        break;
      }
    }

    group.scale.set(0.9, 0.9, 0.9);
    return group;
  }
}
