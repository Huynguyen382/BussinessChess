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
        // Phan Thiết: Đồi Cát Bay Cam Cháy (#E17055) & Cụm Tháp Chăm Poshanư Cổ Kính
        const sandMat = LandmarkMaterials.getMat('ptDesertSandOrange', () => new THREE.MeshStandardMaterial({ color: '#E17055', roughness: 0.62 }));
        const chamBrickMat = LandmarkMaterials.getMat('poshanuBrickRed', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.58 }));
        const chamGoldMat = LandmarkMaterials.getMat('poshanuFlameGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.85, roughness: 0.2 }));
        const darkVoidMat = LandmarkMaterials.getMat('portalDark', () => new THREE.MeshStandardMaterial({ color: '#2C3E50' }));

        // 1. Dải đồi cát sa mạc màu cam cháy (#E17055) uốn lượn nhấp nhô mềm mại
        const dune1 = new THREE.Mesh(new THREE.SphereGeometry(0.68, 20, 16), sandMat);
        dune1.scale.set(1.32, 0.38, 1.05);
        dune1.position.set(-0.08, 0.12, 0);
        dune1.receiveShadow = true;

        const dune2 = new THREE.Mesh(new THREE.SphereGeometry(0.52, 18, 14), sandMat);
        dune2.scale.set(1.25, 0.44, 0.95);
        dune2.position.set(0.28, 0.16, 0.18);
        dune2.receiveShadow = true;

        // 2. Cụm tháp Chăm Poshanư gạch nung đỏ rực với mái tháp giật cấp nhiều tầng
        const makePoshanuTower = (tx: number, tz: number, scale: number) => {
          const tGroup = new THREE.Group();
          const tier1 = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.52, 0.58, 3, 0.04), chamBrickMat);
          tier1.position.y = 0.26;
          tier1.castShadow = true;

          const tier2 = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.36, 0.44, 3, 0.03), chamBrickMat);
          tier2.position.y = 0.66;
          tier2.castShadow = true;

          const tier3 = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.26, 0.3, 2, 0.02), chamBrickMat);
          tier3.position.y = 0.94;

          // Hoa văn ngọn lửa Chămpa trên đỉnh và vòm cửa
          const flameSpire = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 8), chamGoldMat);
          flameSpire.position.y = 1.2;

          const archDoor = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.32, 0.06, 2, 0.02), darkVoidMat);
          archDoor.position.set(0, 0.2, 0.28);

          const flameArch = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.18, 4), chamGoldMat);
          flameArch.position.set(0, 0.42, 0.29);

          tGroup.add(tier1, tier2, tier3, flameSpire, archDoor, flameArch);
          tGroup.scale.setScalar(scale);
          tGroup.position.set(tx, 0.18, tz);
          return tGroup;
        };

        const mainTower = makePoshanuTower(-0.18, -0.06, 1.0);
        const subTower = makePoshanuTower(0.32, -0.14, 0.68);

        group.add(dune1, dune2, mainTower, subTower);
        break;
      }

      case 9: {
        // Nha Trang: Tháp Trầm Hương Búp Sen 3 Tầng Hồng Cam & Vịnh San Hô Xanh Trong
        const bayWaterMat = LandmarkMaterials.getMat('ntCoralBayWater', () => new THREE.MeshStandardMaterial({
          color: '#00CEC9',
          roughness: 0.08,
          transparent: true,
          opacity: 0.86
        }));
        const lotusPinkOrangeMat = LandmarkMaterials.getMat('tramHuongLotus', () => new THREE.MeshStandardMaterial({
          color: '#FF7675',
          emissive: '#E17055',
          emissiveIntensity: 0.22,
          roughness: 0.28
        }));
        const towerWhiteMat = LandmarkMaterials.getMat('tramHuongBaseWhite', () => new THREE.MeshStandardMaterial({
          color: '#FFFDF9',
          roughness: 0.25
        }));
        const coreCrystalMat = LandmarkMaterials.getMat('tramHuongSpireCrystal', () => new THREE.MeshStandardMaterial({
          color: '#FFEAA7',
          emissive: '#F1C40F',
          emissiveIntensity: 0.9,
          roughness: 0.1
        }));
        const coralJadeMat = LandmarkMaterials.getMat('coralJade', () => new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.4 }));
        const fishGoldMat = LandmarkMaterials.getMat('fishOrange', () => new THREE.MeshStandardMaterial({ color: '#FF9F43', emissive: '#FF9F43', emissiveIntensity: 0.4 }));

        // 1. Mặt nước vịnh biển Nha Trang xanh trong vắt nhìn thấy rạn san hô ngọc bích và đàn cá
        const seaBay = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.1, 0.92, 3, 0.03), bayWaterMat);
        seaBay.position.set(0, 0.05, 0);
        group.add(seaBay);

        // Rạn san hô ngọc bích & đàn cá nhỏ tung tăng bơi lội dưới làn nước trong
        [[0.38, 0.06, 0.24], [0.46, 0.05, -0.12], [-0.42, 0.06, 0.26]].forEach(([cx, cy, cz]) => {
          const coral = new THREE.Mesh(new THREE.DodecahedronGeometry(0.065, 0), coralJadeMat);
          coral.position.set(cx, cy, cz);
          group.add(coral);
        });

        const schoolOfFish = new THREE.Group();
        schoolOfFish.userData = { animType: 'float_wave' };
        [[0.25, 0.08, 0.3], [-0.28, 0.08, 0.28], [0.15, 0.07, 0.18]].forEach(([fx, fy, fz]) => {
          const fish = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 6), fishGoldMat);
          fish.rotation.z = Math.PI / 2;
          fish.position.set(fx, fy, fz);
          schoolOfFish.add(fish);
        });
        group.add(schoolOfFish);

        // 2. Tháp Trầm Hương: Biểu tượng búp sen 3 tầng màu hồng cam cách điệu vươn cao trên bờ vịnh
        const plazaBase = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.56, 0.16, 16), towerWhiteMat);
        plazaBase.position.set(-0.05, 0.14, -0.06);
        plazaBase.receiveShadow = true;

        const makeLotusPetalTier = (ty: number, radius: number, height: number, count: number) => {
          const tierGroup = new THREE.Group();
          tierGroup.position.set(-0.05, ty, -0.06);
          const core = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.65, radius * 0.78, height, 12), lotusPinkOrangeMat);
          core.castShadow = true;
          tierGroup.add(core);

          for (let p = 0; p < count; p++) {
            const angle = (p / count) * Math.PI * 2;
            const petal = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.38, height * 0.95, 4), lotusPinkOrangeMat);
            petal.position.set(Math.cos(angle) * radius * 0.68, 0, Math.sin(angle) * radius * 0.68);
            petal.rotation.y = -angle;
            tierGroup.add(petal);
          }
          return tierGroup;
        };

        const tier1 = makeLotusPetalTier(0.42, 0.38, 0.46, 5);
        const tier2 = makeLotusPetalTier(0.84, 0.3, 0.42, 5);
        const tier3 = makeLotusPetalTier(1.22, 0.22, 0.38, 5);

        // Quả cầu trầm hương phát sáng trên đỉnh búp sen
        const spireOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 1), coreCrystalMat);
        spireOrb.position.set(-0.05, 1.54, -0.06);
        spireOrb.userData = { animType: 'rotate_pulse' };

        group.add(plazaBase, tier1, tier2, tier3, spireOrb);
        break;
      }

      // =====================================================
      // PHÂN KHU 3: ĐÀ LẠT, BUÔN MA THUỘT, PLEIKU (Rose Pink)
      // =====================================================
      case 11: {
        // Đà Lạt: Ga Xe Lửa Đà Lạt 3 chóp nhọn Langbiang & Rừng thông sương mù
        const wallMat = LandmarkMaterials.getMat('dalatOchre', () => new THREE.MeshStandardMaterial({ color: '#F39C12', roughness: 0.38 }));
        const roofMat = LandmarkMaterials.getMat('dalatRoofRed', () => new THREE.MeshStandardMaterial({ color: '#D35400', roughness: 0.28 }));
        const glassMat = LandmarkMaterials.getMat('stainedGlass', () => new THREE.MeshStandardMaterial({ color: '#74B9FF', emissive: '#0984E3', emissiveIntensity: 0.4 }));

        // Thân nhà ga 3 gian đối xứng bằng bê tông màu đất nung
        const body = new THREE.Mesh(new RoundedBoxGeometry(1.05, 0.46, 0.58, 4, 0.05), wallMat);
        body.position.set(0, 0.28, 0);
        body.castShadow = true;

        // 3 Mái chóp tam giác nhọn đặc trưng mô phỏng dãy núi Langbiang
        const makeGable = (gx: number, gy: number, gh: number, gw: number) => {
          const gable = new THREE.Mesh(new THREE.ConeGeometry(gw, gh, 4), roofMat);
          gable.rotation.y = Math.PI / 4;
          gable.position.set(gx, gy, 0);
          gable.castShadow = true;
          return gable;
        };
        const gL = makeGable(-0.32, 0.72, 0.55, 0.28);
        const gM = makeGable(0, 0.84, 0.74, 0.32); // Chóp giữa cao ngất
        const gR = makeGable(0.32, 0.72, 0.55, 0.28);

        // Kính màu nghệ thuật hình hoa văn ở mặt tiền
        const glassWin = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), glassMat);
        glassWin.position.set(0, 0.65, 0.3);

        // Mặt đồng hồ nhà ga tròn cổ điển
        const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), LandmarkMaterials.getMat('stationClockFace', () => new THREE.MeshStandardMaterial({ color: '#FFFDF9' })));
        clock.rotation.x = Math.PI / 2;
        clock.position.set(0, 0.42, 0.3);

        // Đường ray răng cưa Thụy Sĩ đặc trưng trước nhà ga Đà Lạt
        const trackGeo = new THREE.BoxGeometry(0.85, 0.02, 0.035);
        const railSteelMat = LandmarkMaterials.getMat('cogRailSteel', () => new THREE.MeshStandardMaterial({ color: '#718093', metalness: 0.82, roughness: 0.28 }));
        const track1 = new THREE.Mesh(trackGeo, railSteelMat);
        track1.position.set(0, 0.05, 0.35);
        const track2 = new THREE.Mesh(trackGeo, railSteelMat);
        track2.position.set(0, 0.05, 0.43);
        const cogRack = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.028, 0.02), LandmarkMaterials.getMat('cogRackBrass', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.88, roughness: 0.16 })));
        cogRack.position.set(0, 0.055, 0.39);
        group.add(track1, track2, cogRack);

        // 2 Cây thông 3 tầng tán lá giữa làn sương mù mờ ảo Đà Lạt
        const pine1 = LandmarkHelpers.createMiniPineTree();
        pine1.position.set(0.48, 0.06, 0.24);
        const pine2 = LandmarkHelpers.createMiniPineTree();
        pine2.scale.set(0.65, 0.65, 0.65);
        pine2.position.set(-0.48, 0.06, 0.2);

        const mistMat = LandmarkMaterials.getMat('dalatMistCloud', () => new THREE.MeshStandardMaterial({
          color: '#FFFFFF',
          transparent: true,
          opacity: 0.42,
          roughness: 0.2
        }));
        const mist = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.06, 16), mistMat);
        mist.position.set(0, 0.14, 0.12);
        mist.userData = { animType: 'float_wave' };

        group.add(body, gL, gM, gR, glassWin, clock, pine1, pine2, mist);
        break;
      }

      case 13: {
        // Buôn Ma Thuột: Nhà Rông Tây Nguyên mái lưỡi búa vút cao & Dàn Cồng Chiêng 3 chiếc
        const thatchMat = LandmarkMaterials.getMat('rongThatchGold', () => new THREE.MeshStandardMaterial({ color: '#C99716', roughness: 0.72 }));
        const woodMat = LandmarkMaterials.getMat('rongTimberDark', () => new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.6 }));
        const brocadeRedMat = LandmarkMaterials.getMat('rongBrocadeRed', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.4 }));
        const gongBrassMat = LandmarkMaterials.getMat('gongBrass', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.88, roughness: 0.15 }));

        // Sàn nhà sàn bằng gỗ lim nâng cao trên các cột trụ vững chắc
        const floor = new THREE.Mesh(new RoundedBoxGeometry(0.85, 0.08, 0.54, 2, 0.02), woodMat);
        floor.position.set(-0.08, 0.28, -0.05);

        for (let x = -0.4; x <= 0.24; x += 0.32) {
          for (let z = -0.23; z <= 0.13; z += 0.36) {
            const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.28, 10), woodMat);
            stilt.position.set(x, 0.14, z);
            group.add(stilt);
          }
        }

        // Mái nhà rông hình lưỡi búa khổng lồ cao 1.55 units có đai hoa văn thổ cẩm
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.52, 1.55, 4), thatchMat);
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(0.85, 1.0, 0.5);
        roof.position.set(-0.08, 1.08, -0.05);
        roof.castShadow = true;

        const brocadeBand = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.28), brocadeRedMat);
        brocadeBand.position.set(-0.08, 0.92, -0.05);

        const stairs = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.32, 0.04, 2, 0.01), woodMat);
        stairs.position.set(-0.08, 0.16, 0.28);
        stairs.rotation.x = 0.35;

        // Giá treo 3 chiếc Cồng Chiêng đồng vàng óng ánh
        const rackPostL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.42, 8), woodMat);
        rackPostL.position.set(0.18, 0.21, 0.28);
        const rackPostR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.42, 8), woodMat);
        rackPostR.position.set(0.54, 0.21, 0.28);
        const rackBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.42, 8), woodMat);
        rackBeam.rotation.z = Math.PI / 2;
        rackBeam.position.set(0.36, 0.4, 0.28);

        [0.25, 0.36, 0.47].forEach((gx, idx) => {
          const r = 0.055 - idx * 0.008;
          const gong = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.025, 14), gongBrassMat);
          gong.rotation.x = Math.PI / 2;
          gong.position.set(gx, 0.26, 0.28);
          group.add(gong);
        });

        group.add(floor, roof, brocadeBand, stairs, rackPostL, rackPostR, rackBeam);
        break;
      }

      case 14: {
        // Pleiku: Biển Hồ Tơ Nưng xanh biếc vách đá bazan nâu đỏ & Rừng cao su mùa lá vàng
        const basaltRedMat = LandmarkMaterials.getMat('pleikuBasaltRed', () => new THREE.MeshStandardMaterial({ color: '#8D3B24', roughness: 0.68 }));
        const lakeMat = LandmarkMaterials.getMat('tnungLakeBlue', () => new THREE.MeshStandardMaterial({ color: '#00CEC9', roughness: 0.06, transparent: true, opacity: 0.92 }));
        const rubberTrunkMat = LandmarkMaterials.getMat('rubberTreeTrunk', () => new THREE.MeshStandardMaterial({ color: '#D2B48C', roughness: 0.6 }));
        const autumnGoldFoliage = LandmarkMaterials.getMat('rubberAutumnGold', () => new THREE.MeshStandardMaterial({
          color: '#F39C12',
          emissive: '#E67E22',
          emissiveIntensity: 0.2,
          roughness: 0.35
        }));

        // 1. Miệng núi lửa cổ hình oval vách đá bazan màu nâu đỏ & mặt nước xanh biếc phẳng lặng
        const caldera = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.72, 0.36, 24), basaltRedMat);
        caldera.scale.set(1.18, 1.0, 0.88);
        caldera.position.set(-0.1, 0.18, 0.05);
        caldera.castShadow = true;

        const lake = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.04, 24), lakeMat);
        lake.scale.set(1.18, 1.0, 0.88);
        lake.position.set(-0.1, 0.35, 0.05);

        // 2. Hàng cây cao su thân thẳng tắp phân nhánh đều đặn đang mùa rụng lá vàng ruộm
        const makeRubberTree = (tx: number, tz: number, h: number) => {
          const tGroup = new THREE.Group();
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.042, h, 10), rubberTrunkMat);
          trunk.position.y = h / 2;
          trunk.castShadow = true;
          const crown1 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), autumnGoldFoliage);
          crown1.scale.set(1.1, 0.75, 1.1);
          crown1.position.set(0, h + 0.06, 0);
          const crown2 = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), autumnGoldFoliage);
          crown2.position.set(0.08, h + 0.18, 0);
          tGroup.add(trunk, crown1, crown2);
          tGroup.position.set(tx, 0.08, tz);
          return tGroup;
        };

        const rt1 = makeRubberTree(0.44, -0.18, 0.72);
        const rt2 = makeRubberTree(0.48, 0.18, 0.62);
        const rt3 = makeRubberTree(-0.48, -0.22, 0.66);

        group.add(caldera, lake, rt1, rt2, rt3);
        break;
      }

      // =====================================================
      // PHÂN KHU 4: QUY NHƠN, HỘI AN, ĐÀ NẴNG (Coral Orange)
      // =====================================================
      case 16: {
        // Quy Nhơn: Eo Gió Kỳ Vĩ sóng vỗ bọt trắng & Cặp Tháp Đôi Chăm Pa đứng song song
        const cliffMat = LandmarkMaterials.getMat('eoGioCliff', () => new THREE.MeshStandardMaterial({ color: '#7F8C8D', roughness: 0.7 }));
        const seaMat = LandmarkMaterials.getMat('eoGioSeaBlue', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.1, transparent: true, opacity: 0.88 }));
        const foamWhiteMat = LandmarkMaterials.getMat('seaFoamWhite', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 }));
        const chamBrickMat = LandmarkMaterials.getMat('chamBrickDarkRed', () => new THREE.MeshStandardMaterial({ color: '#B3391E', roughness: 0.62 }));
        const garudaGoldMat = LandmarkMaterials.getMat('garudaGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.85, roughness: 0.2 }));

        // 1. Eo Gió: Mỏm vách đá uốn cong hình cánh cung ôm lấy bãi biển xanh ngắt
        const cliff = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.22, 14, 24, Math.PI * 1.15), cliffMat);
        cliff.rotation.x = Math.PI / 2;
        cliff.rotation.z = -0.25;
        cliff.position.set(0.05, 0.18, 0.05);
        cliff.receiveShadow = true;

        const sea = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.08, 0.65, 2, 0.02), seaMat);
        sea.position.set(0, 0.04, 0.22);

        // Sóng vỗ tung bọt trắng xóa dọc bờ cong
        const foam = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.035, 8, 20, Math.PI), foamWhiteMat);
        foam.rotation.x = Math.PI / 2;
        foam.position.set(0.05, 0.085, 0.12);

        // 2. Tháp Đôi Chăm Pa: Cặp tháp gạch nung sẫm màu đứng song song có tượng thần chim Garuda ở góc mái
        const makeTwinTower = (tx: number, tz: number, hScale: number) => {
          const tGroup = new THREE.Group();
          const body = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.62, 0.32, 3, 0.04), chamBrickMat);
          body.position.y = 0.31;
          body.castShadow = true;
          const upper = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.28, 0.24, 2, 0.03), chamBrickMat);
          upper.position.y = 0.72;
          const spire = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.24, 8), garudaGoldMat);
          spire.position.y = 0.96;
          tGroup.add(body, upper, spire);
          tGroup.scale.set(1, hScale, 1);
          tGroup.position.set(tx, 0.16, tz);
          return tGroup;
        };

        const twin1 = makeTwinTower(-0.28, -0.18, 1.05);
        const twin2 = makeTwinTower(0.14, -0.18, 0.92);

        group.add(cliff, sea, foam, twin1, twin2);
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
