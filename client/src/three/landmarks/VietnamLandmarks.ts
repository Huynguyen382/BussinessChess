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
    group.add(LandmarkMaterials.createContactShadow(1.4, 1.25, 0.48));

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
        // Cà Mau: Tượng Đài Con Tàu Mũi Cà Mau & Cột Mốc Tọa Độ GPS 0001
        const hullMat = LandmarkMaterials.getMat('cmShipWhite', () => new THREE.MeshStandardMaterial({ color: '#F8F9FA', roughness: 0.25 }));
        const sailMat = LandmarkMaterials.getMat('cmSailRed', () => new THREE.MeshStandardMaterial({ color: '#E84118', roughness: 0.3, emissive: '#C23616', emissiveIntensity: 0.2 }));
        const graniteMat = LandmarkMaterials.getMat('cmGranite', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.6 }));
        const seaMat = LandmarkMaterials.getMat('cmSeaCoast', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.1, transparent: true, opacity: 0.85 }));

        // 1. Thềm đài đá hoa cương hướng biển
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.78, 0.16, 24), graniteMat);
        base.position.set(0, 0.08, -0.05);
        base.receiveShadow = true;

        const sea = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.06, 0.6, 2, 0.02), seaMat);
        sea.position.set(0, 0.03, 0.3);

        // 2. Tượng đài Con Tàu vươn khơi
        const shipHull = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.24, 0.38, 3, 0.06), hullMat);
        shipHull.position.set(-0.08, 0.26, -0.05);
        shipHull.rotation.y = 0.2;
        shipHull.castShadow = true;

        // Cánh buồm đỏ no gió hình khối khí động học cách điệu
        const sail = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.42, 16), sailMat);
        sail.scale.set(0.45, 1.0, 1.1);
        sail.position.set(-0.06, 0.85, -0.05);
        sail.rotation.z = -0.14;
        sail.rotation.y = 0.2;
        sail.castShadow = true;

        // 3. Mốc tọa độ quốc gia GPS 0001 bằng đá nguyên khối có ngôi sao vàng
        const markerPillar = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.62, 0.18, 3, 0.03), hullMat);
        markerPillar.position.set(-0.38, 0.4, 0.18);
        markerPillar.castShadow = true;

        const star = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), LandmarkMaterials.getMat('goldStar', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.9, roughness: 0.1 })));
        star.position.set(-0.38, 0.62, 0.28);

        // 4. Cụm cây đước ngập mặn đặc trưng với rễ chùm uốn vòm
        const mangrove = LandmarkHelpers.createMiniMangroveTree();
        mangrove.position.set(0.42, 0.08, 0.08);

        group.add(base, sea, shipHull, sail, markerPillar, star, mangrove);
        break;
      }

      // =====================================================
      // PHÂN KHU 2: VŨNG TÀU, PHAN THIẾT, NHA TRANG (Light Blue)
      // =====================================================
      case 6: {
        // Vũng Tàu: Hải Đăng Cổ Núi Nhỏ trên đỉnh Tao Phùng & Biển Đông
        const mountainMat = LandmarkMaterials.getMat('vtMountainGreen', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.55 }));
        const stoneTowerMat = LandmarkMaterials.getMat('vtTowerWhite', () => new THREE.MeshStandardMaterial({ color: '#F8F9FA', roughness: 0.25 }));
        const domeRedMat = LandmarkMaterials.getMat('vtDomeRed', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.28 }));
        const lanternGlowMat = LandmarkMaterials.getMat('vtLanternGlow', () => new THREE.MeshStandardMaterial({
          color: '#FFF275',
          emissive: '#F1C40F',
          emissiveIntensity: 1.3,
          roughness: 0.1
        }));

        // 1. Mỏm núi đá Tao Phùng phủ cỏ xanh bo tròn mềm mại
        const mountGeo = new THREE.SphereGeometry(0.65, 22, 16);
        const mount = new THREE.Mesh(mountGeo, mountainMat);
        mount.scale.set(1.25, 0.45, 1.15);
        mount.position.set(0, 0.14, 0);
        mount.receiveShadow = true;

        // 2. Tháp hải đăng hình trụ côn tròn mịn cao 1.25m
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.36, 1.18, 24), stoneTowerMat);
        tower.position.set(0, 0.78, 0);
        tower.castShadow = true;

        // Vành ban công đài quan sát có gờ chỉ nổi
        const gallery = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 24), stoneTowerMat);
        gallery.position.set(0, 1.38, 0);

        const railing = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.015, 8, 24), LandmarkMaterials.getMat('ironRailing', () => new THREE.MeshStandardMaterial({ color: '#2D3436' })));
        railing.rotation.x = Math.PI / 2;
        railing.position.set(0, 1.45, 0);

        // Buồng kính đèn pha rực sáng
        const lanternRoom = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.22, 20), lanternGlowMat);
        lanternRoom.position.set(0, 1.52, 0);

        // Mái vòm bán cầu đỏ cổ kính
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeRedMat);
        dome.position.set(0, 1.63, 0);

        const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.15, 8), LandmarkMaterials.getMat('brassFinial', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.9 })));
        finial.position.set(0, 1.95, 0);

        // Cây sứ hoa trắng đặc trưng sườn núi Vũng Tàu
        const frangipani = LandmarkHelpers.createMiniPalmTree();
        frangipani.scale.set(0.65, 0.65, 0.65);
        frangipani.position.set(0.48, 0.1, 0.2);

        group.add(mount, tower, gallery, railing, lanternRoom, dome, finial, frangipani);
        break;
      }

      case 8: {
        // Phan Thiết: Đồi Cát Bay uốn lượn & Hải Đăng Kê Gà bát giác sọc đỏ trắng
        const sandMat = LandmarkMaterials.getMat('ptDuneSand', () => new THREE.MeshStandardMaterial({ color: '#F39C12', roughness: 0.65 }));
        const redMat = LandmarkMaterials.getMat('kgStripeRed', () => new THREE.MeshStandardMaterial({ color: '#D63031', roughness: 0.3 }));
        const whiteMat = LandmarkMaterials.getMat('kgStripeWhite', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 }));

        // 1. Cụm đồi cát mềm mại uốn lượn
        const dune1 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 20, 16), sandMat);
        dune1.scale.set(1.3, 0.38, 1.05);
        dune1.position.set(0, 0.12, 0);

        const dune2 = new THREE.Mesh(new THREE.SphereGeometry(0.45, 18, 14), sandMat);
        dune2.scale.set(1.2, 0.32, 0.9);
        dune2.position.set(0.3, 0.14, 0.22);

        // 2. Tháp Kê Gà bát giác sọc xen kẽ đỏ - trắng
        const makeBand = (y: number, r1: number, r2: number, mat: THREE.Material) => {
          const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, 0.28, 16), mat);
          m.position.set(-0.15, y, -0.08);
          m.castShadow = true;
          return m;
        };
        const b1 = makeBand(0.42, 0.28, 0.34, redMat);
        const b2 = makeBand(0.70, 0.24, 0.28, whiteMat);
        const b3 = makeBand(0.98, 0.20, 0.24, redMat);
        const b4 = makeBand(1.26, 0.16, 0.20, whiteMat);

        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), LandmarkMaterials.getMat('kgBeaconGlow', () => new THREE.MeshStandardMaterial({
          color: '#FFF275',
          emissive: '#F1C40F',
          emissiveIntensity: 1.2
        })));
        beacon.position.set(-0.15, 1.5, -0.08);

        // Xe jeep địa hình vượt đồi cát màu cam nổi bật
        const jeep = LandmarkHelpers.createTinyCar('#E67E22');
        jeep.position.set(0.28, 0.24, 0.15);
        jeep.rotation.y = -0.3;

        group.add(dune1, dune2, b1, b2, b3, b4, beacon, jeep);
        break;
      }

      case 9: {
        // Nha Trang: Tháp Bà Ponagar Chăm Pa gạch nung đỏ son & Hàng dừa biển
        const brickMat = LandmarkMaterials.getMat('chamBrickRed', () => new THREE.MeshStandardMaterial({ color: '#D35400', roughness: 0.62 }));
        const goldSpireMat = LandmarkMaterials.getMat('lingaGold', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.88, roughness: 0.15 }));

        // Bệ tháp đá hoa cương
        const plinth = new THREE.Mesh(new RoundedBoxGeometry(1.05, 0.12, 0.95, 3, 0.03), LandmarkMaterials.getMat('chamPlinth', () => new THREE.MeshStandardMaterial({ color: '#747D8C', roughness: 0.7 })));
        plinth.position.y = 0.06;
        plinth.receiveShadow = true;

        // Tháp Kalan chính 4 tầng giật cấp bo cong
        const t1 = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.54, 0.72, 4, 0.08), brickMat);
        t1.position.set(-0.12, 0.36, 0);
        t1.castShadow = true;

        const t2 = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.42, 0.56, 4, 0.06), brickMat);
        t2.position.set(-0.12, 0.8, 0);
        t2.castShadow = true;

        const t3 = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.35, 0.42, 4, 0.05), brickMat);
        t3.position.set(-0.12, 1.16, 0);

        const t4 = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.25, 0.28, 3, 0.04), brickMat);
        t4.position.set(-0.12, 1.44, 0);

        // Chóp nhọn Linga vàng trên đỉnh tháp
        const linga = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 16), goldSpireMat);
        linga.position.set(-0.12, 1.74, 0);

        // Cửa vòm Chăm hướng Đông có rèm cuốn
        const archPortal = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.36, 0.08, 2, 0.02), LandmarkMaterials.getMat('portalDark', () => new THREE.MeshStandardMaterial({ color: '#2C3E50' })));
        archPortal.position.set(-0.12, 0.32, 0.37);

        // Cây dừa duyên dáng nghiêng bóng
        const palm = LandmarkHelpers.createMiniPalmTree();
        palm.position.set(0.42, 0.08, 0.15);

        group.add(plinth, t1, t2, t3, t4, linga, archPortal, palm);
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

        // 2 Cây thông xứ lạnh Đà Lạt
        const pine1 = LandmarkHelpers.createMiniPineTree();
        pine1.position.set(0.48, 0.06, 0.24);
        const pine2 = LandmarkHelpers.createMiniPineTree();
        pine2.scale.set(0.6, 0.6, 0.6);
        pine2.position.set(-0.48, 0.06, 0.2);

        group.add(body, gL, gM, gR, glassWin, clock, pine1, pine2);
        break;
      }

      case 13: {
        // Buôn Ma Thuột: Nhà Rông Tây Nguyên mái lưỡi búa vút cao & Cồng chiêng vàng
        const thatchMat = LandmarkMaterials.getMat('rongThatchGold', () => new THREE.MeshStandardMaterial({ color: '#C99716', roughness: 0.75 }));
        const woodMat = LandmarkMaterials.getMat('rongTimberDark', () => new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.6 }));

        // Sàn nhà sàn cách mặt đất
        const floor = new THREE.Mesh(new RoundedBoxGeometry(0.85, 0.08, 0.54, 2, 0.02), woodMat);
        floor.position.set(0, 0.28, 0);

        // 6 Cột nhà sàn tròn vững chắc
        for (let x = -0.32; x <= 0.32; x += 0.32) {
          for (let z = -0.18; z <= 0.18; z += 0.36) {
            const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.28, 12), woodMat);
            stilt.position.set(x, 0.14, z);
            group.add(stilt);
          }
        }

        // Mái nhà rông hình lưỡi búa vút cao sừng sững (cao 1.55 units)
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.52, 1.55, 4), thatchMat);
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(0.85, 1.0, 0.5);
        roof.position.set(0, 1.08, 0);
        roof.castShadow = true;

        // Cầu thang gỗ chạm khắc trăng khuyết & bầu sữa mẹ
        const stairs = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.32, 0.04, 2, 0.01), woodMat);
        stairs.position.set(0, 0.16, 0.34);
        stairs.rotation.x = 0.35;

        // Chiếc Cồng Chiêng đồng vàng rực bên sân
        const gong = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 16), LandmarkMaterials.getMat('gongBrass', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.88, roughness: 0.15 })));
        gong.rotation.x = Math.PI / 2;
        gong.position.set(0.38, 0.25, 0.28);

        group.add(floor, roof, stairs, gong);
        break;
      }

      case 14: {
        // Pleiku: Núi Lửa Chư Đăng Ya hoa dã quỳ nở rộ & Hồ T'Nưng xanh ngắt
        const calderaMat = LandmarkMaterials.getMat('chuDangYaCaldera', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.65 }));
        const lakeMat = LandmarkMaterials.getMat('tnungLakeBlue', () => new THREE.MeshStandardMaterial({ color: '#00CEC9', roughness: 0.06, transparent: true, opacity: 0.9 }));
        const sunflowerMat = LandmarkMaterials.getMat('wildSunflower', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', emissive: '#F1C40F', emissiveIntensity: 0.3 }));

        // Miệng núi lửa hình chảo tròn mềm mại
        const caldera = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.88, 0.65, 24), calderaMat);
        caldera.position.set(0, 0.35, 0);
        caldera.castShadow = true;

        // Mặt nước Biển Hồ T'Nưng xanh trong lọt thỏm giữa lòng núi lửa
        const lake = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 24), lakeMat);
        lake.position.set(0, 0.66, 0);

        // Vành hoa dã quỳ vàng nở rộ quanh sườn núi
        for (let f = 0; f < 8; f++) {
          const a = (f / 8) * Math.PI * 2;
          const flower = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), sunflowerMat);
          flower.position.set(Math.cos(a) * 0.62, 0.42, Math.sin(a) * 0.62);
          group.add(flower);
        }

        group.add(caldera, lake);
        break;
      }

      // =====================================================
      // PHÂN KHU 4: QUY NHƠN, HỘI AN, ĐÀ NẴNG (Coral Orange)
      // =====================================================
      case 16: {
        // Quy Nhơn: Eo Gió con đường đi bộ ven vách đá & Tháp Đôi Chăm
        const cliffMat = LandmarkMaterials.getMat('eoGioCliff', () => new THREE.MeshStandardMaterial({ color: '#7F8C8D', roughness: 0.7 }));
        const seaMat = LandmarkMaterials.getMat('eoGioSeaBlue', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.1, transparent: true, opacity: 0.88 }));
        const fenceMat = LandmarkMaterials.getMat('eoGioFenceRed', () => new THREE.MeshStandardMaterial({ color: '#E84118', roughness: 0.3 }));

        // Vách đá nhô ra biển uốn lượn
        const cliff = new THREE.Mesh(new THREE.SphereGeometry(0.72, 22, 16), cliffMat);
        cliff.scale.set(1.3, 0.52, 0.95);
        cliff.position.set(0, 0.22, -0.15);
        cliff.receiveShadow = true;

        const sea = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.08, 0.55, 2, 0.02), seaMat);
        sea.position.set(0, 0.04, 0.28);

        // Hàng rào con đường đi bộ ven biển uốn cong
        for (let f = -0.42; f <= 0.42; f += 0.18) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8), fenceMat);
          post.position.set(f, 0.52, 0.05 + Math.sin(f * 3) * 0.08);
          group.add(post);
        }

        // Tháp Đôi Chăm Pa gạch nung xa xa
        const towerCham = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.62, 0.28, 3, 0.04), LandmarkMaterials.getMat('chamBrickRed', () => new THREE.MeshStandardMaterial({ color: '#D35400', roughness: 0.65 })));
        towerCham.position.set(-0.35, 0.58, -0.22);
        towerCham.castShadow = true;

        group.add(cliff, sea, towerCham);
        break;
      }

      case 18: {
        // Hội An: Chùa Cầu (Lai Viễn Kiều) mái ngói âm dương cong vút & Lồng đèn đỏ
        const bridgeWoodMat = LandmarkMaterials.getMat('chuaCauWood', () => new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.6 }));
        const tileRoofMat = LandmarkMaterials.getMat('chuaCauTile', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.65 }));
        const lanternMat = LandmarkMaterials.getMat('hoiAnLanternRed', () => new THREE.MeshStandardMaterial({
          color: '#FF4757',
          emissive: '#FF4757',
          emissiveIntensity: 0.95
        }));

        // Mố cầu đá bắc qua lạch nước
        const bridgeArch = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.18, 0.58, 3, 0.04), bridgeWoodMat);
        bridgeArch.position.set(0, 0.18, 0);

        // Gian chùa thờ giữa cầu mái ngói cong 4 góc
        const temple = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.38, 0.48, 3, 0.03), bridgeWoodMat);
        temple.position.set(0, 0.42, 0);

        // Mái ngói âm dương cong vút cổ kính
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.36, 4), tileRoofMat);
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(1.22, 0.65, 0.95);
        roof.position.set(0, 0.74, 0);
        roof.castShadow = true;

        // Lồng đèn Hội An treo trước hiên phát sáng lung linh
        const l1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 12), lanternMat);
        l1.position.set(-0.38, 0.48, 0.26);
        const l2 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 12), lanternMat);
        l2.position.set(0.38, 0.48, 0.26);

        // Tượng Linh Thú (Thần Khuyển / Thần Hầu) chầu ở đầu cầu
        const guardian = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.16, 8), LandmarkMaterials.getMat('guardianStone', () => new THREE.MeshStandardMaterial({ color: '#747D8C' })));
        guardian.position.set(-0.48, 0.32, 0.22);

        group.add(bridgeArch, temple, roof, l1, l2, guardian);
        break;
      }

      case 19: {
        // Đà Nẵng: Cầu Rồng Vàng Kim Uốn Lượn Phun Lửa Ngạo Nghễ
        const dragonGoldMat = LandmarkMaterials.getMat('dragonGoldGleam', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          emissive: '#F39C12',
          emissiveIntensity: 0.45,
          metalness: 0.88,
          roughness: 0.16
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

        // Mặt cầu nhịp dầm thép bắc qua sông Hàn
        const bridgeDeck = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.08, 0.48, 3, 0.02), LandmarkMaterials.getMat('bridgeSteelDeck', () => new THREE.MeshStandardMaterial({ color: '#BDC3C7', metalness: 0.7 })));
        bridgeDeck.position.set(0, 0.16, 0);

        // Vạch tim đường màu vàng
        const lane = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 0.03), LandmarkMaterials.getMat('laneYellow', () => new THREE.MeshBasicMaterial({ color: '#F1C40F' })));
        lane.rotation.x = -Math.PI / 2;
        lane.position.set(0, 0.205, 0);

        // Thân rồng uốn 4 nhịp sóng vàng ống tròn
        for (let w = -0.4; w <= 0.25; w += 0.28) {
          const wave = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.055, 14, 24, Math.PI), dragonGoldMat);
          wave.position.set(w, 0.24, 0);
          group.add(wave);

          // Vảy rồng tam giác trên đỉnh mỗi nhịp sóng
          const fin = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 4), dragonGoldMat);
          fin.position.set(w, 0.46, 0);
          group.add(fin);
        }

        // Đầu Rồng hùng vĩ ngẩng cao đầu phía trước
        const head = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.18, 0.16, 3, 0.03), dragonGoldMat);
        head.position.set(0.52, 0.48, 0);

        // Sừng rồng & Mắt rồng phát sáng
        const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.18, 8), dragonGoldMat);
        hornL.position.set(0.48, 0.62, 0.06);
        hornL.rotation.z = -0.3;
        const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.18, 8), dragonGoldMat);
        hornR.position.set(0.48, 0.62, -0.06);
        hornR.rotation.z = -0.3;

        // Cột lửa phun ra cuồn cuộn từ miệng rồng
        const flameCore = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.38, 12), flameCoreMat);
        flameCore.rotation.z = -Math.PI / 2.8;
        flameCore.position.set(0.74, 0.58, 0);

        const flameOuter = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 12), flameOuterMat);
        flameOuter.rotation.z = -Math.PI / 2.8;
        flameOuter.position.set(0.68, 0.54, 0);

        // Đuôi rồng xòe cánh sen vàng ở cuối cầu
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 3), dragonGoldMat);
        tail.rotation.z = Math.PI / 3;
        tail.position.set(-0.55, 0.32, 0);

        group.add(bridgeDeck, lane, head, hornL, hornR, flameCore, flameOuter, tail);
        break;
      }

      // =====================================================
      // PHÂN KHU 5: HUẾ, PHONG NHA, CỬA LÒ (Ruby Red)
      // =====================================================
      case 21: {
        // Huế: Cổng Ngọ Môn Đại Nội 3 Vòm Cuốn & Lầu Ngũ Phụng Hoàng Lưu Ly
        const stoneMat = LandmarkMaterials.getMat('citadelStoneWall', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.75 }));
        const redWoodMat = LandmarkMaterials.getMat('hueRedTimber', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.38 }));
        const imperialGoldRoof = LandmarkMaterials.getMat('imperialGoldTile', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          roughness: 0.22,
          metalness: 0.18
        }));

        // Bệ thành đá Ngọ Môn kiên cố với 3 cửa vòm cuốn
        const wallBase = new THREE.Mesh(new RoundedBoxGeometry(1.22, 0.44, 0.62, 4, 0.05), stoneMat);
        wallBase.position.set(0, 0.22, 0);
        wallBase.castShadow = true;

        // 3 Cửa vòm cuốn khoét sâu ở mặt trước (Cửa Ngọ Môn ở giữa cho vua, 2 Giáp Môn 2 bên)
        const doorMat = LandmarkMaterials.getMat('gatePortalDark', () => new THREE.MeshStandardMaterial({ color: '#1E272E' }));
        const centerDoor = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.28, 0.08, 2, 0.02), doorMat);
        centerDoor.position.set(0, 0.16, 0.3);
        const leftDoor = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.22, 0.08, 2, 0.02), doorMat);
        leftDoor.position.set(-0.35, 0.14, 0.3);
        const rightDoor = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.22, 0.08, 2, 0.02), doorMat);
        rightDoor.position.set(0.35, 0.14, 0.3);

        // Lầu Ngũ Phụng Tầng 1: cột gỗ lim sơn son thếp vàng
        const f1 = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.22, 0.48, 2, 0.02), redWoodMat);
        f1.position.set(0, 0.55, 0);

        const roof1 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.22, 4), imperialGoldRoof);
        roof1.rotation.y = Math.PI / 4;
        roof1.scale.set(1.25, 0.55, 0.9);
        roof1.position.set(0, 0.74, 0);
        roof1.castShadow = true;

        // Lầu Ngũ Phụng Tầng 2: mái uốn cong hoàng lưu ly
        const f2 = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.18, 0.34, 2, 0.02), redWoodMat);
        f2.position.set(0, 0.92, 0);

        const roof2 = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.24, 4), imperialGoldRoof);
        roof2.rotation.y = Math.PI / 4;
        roof2.scale.set(1.18, 0.65, 0.88);
        roof2.position.set(0, 1.12, 0);
        roof2.castShadow = true;

        group.add(wallBase, centerDoor, leftDoor, rightDoor, f1, roof1, f2, roof2);
        break;
      }

      case 23: {
        // Phong Nha: Vòm Động Karst Thạch Nhũ & Dòng Sông Son Ngầm Xanh Biếc
        const karstMat = LandmarkMaterials.getMat('phongNhaCaveRock', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.7 }));
        const riverMat = LandmarkMaterials.getMat('songSonWater', () => new THREE.MeshStandardMaterial({ color: '#16A085', roughness: 0.08, transparent: true, opacity: 0.9 }));

        // Vòm núi đá vôi uốn cong mở ra cửa hang
        const caveMountain = new THREE.Mesh(new THREE.SphereGeometry(0.72, 22, 16), karstMat);
        caveMountain.scale.set(1.3, 0.7, 0.9);
        caveMountain.position.set(0, 0.36, -0.15);
        caveMountain.receiveShadow = true;

        // Lòng động khoét rỗng
        const caveInner = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.5, 16), LandmarkMaterials.getMat('caveInteriorDark', () => new THREE.MeshStandardMaterial({ color: '#2C3E50' })));
        caveInner.rotation.x = Math.PI / 2;
        caveInner.position.set(0, 0.28, 0);

        // Dòng sông Son chảy xuyên động
        const river = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.06, 0.95, 2, 0.02), riverMat);
        river.position.set(0, 0.04, 0.15);

        // Các chùm thạch nhũ lung linh rủ từ trần hang
        const makeStalactite = (sx: number, sz: number, sh: number) => {
          const cone = new THREE.Mesh(new THREE.ConeGeometry(0.045, sh, 12), LandmarkMaterials.getMat('crystalStalactite', () => new THREE.MeshStandardMaterial({
            color: '#E0F2FE',
            roughness: 0.2,
            metalness: 0.3
          })));
          cone.rotation.x = Math.PI;
          cone.position.set(sx, 0.58, sz);
          return cone;
        };

        const sampan = LandmarkHelpers.createWoodenBoat('#795548');
        sampan.scale.set(0.75, 0.75, 0.75);
        sampan.position.set(0, 0.08, 0.28);

        group.add(caveMountain, caveInner, river, makeStalactite(-0.22, 0.08, 0.35), makeStalactite(0.18, 0.05, 0.4), makeStalactite(0, 0.12, 0.28), sampan);
        break;
      }

      case 24: {
        // Cửa Lò: Bãi Biển Thoai Thoải & Chòi Canh Cứu Hộ Sọc Trắng Đỏ
        const sandMat = LandmarkMaterials.getMat('cuaLoWhiteSand', () => new THREE.MeshStandardMaterial({ color: '#F8EFBA', roughness: 0.65 }));
        const seaMat = LandmarkMaterials.getMat('cuaLoSea', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.1, transparent: true, opacity: 0.88 }));
        const blueHutMat = LandmarkMaterials.getMat('lifeguardBlue', () => new THREE.MeshStandardMaterial({ color: '#2980B9', roughness: 0.3 }));

        const beach = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.08, 0.85, 3, 0.03), sandMat);
        beach.position.set(0, 0.04, 0);

        const sea = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.06, 0.35, 2, 0.02), seaMat);
        sea.position.set(0, 0.05, 0.35);

        // Chòi cứu hộ gỗ trên 4 cọc cao
        const hut = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.35, 0.38, 3, 0.04), blueHutMat);
        hut.position.set(-0.35, 0.52, 0);
        hut.castShadow = true;

        for (let x = -0.45; x <= -0.25; x += 0.2) {
          for (let z = -0.1; z <= 0.1; z += 0.2) {
            const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8), LandmarkMaterials.getMat('poleBrown', () => new THREE.MeshStandardMaterial({ color: '#5D4037' })));
            stilt.position.set(x, 0.21, z);
            group.add(stilt);
          }
        }

        // Phao cứu sinh tròn đỏ - trắng treo cạnh chòi
        const buoy = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 8, 16), LandmarkMaterials.getMat('lifeBuoyRed', () => new THREE.MeshStandardMaterial({ color: '#E84118' })));
        buoy.position.set(-0.15, 0.52, 0);
        buoy.rotation.y = Math.PI / 2;

        // Chiếc dù bãi biển che nắng xòe rộng
        const umbrellaPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8), LandmarkMaterials.getMat('poleWhite', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF' })));
        umbrellaPole.position.set(0.35, 0.32, 0.05);
        umbrellaPole.rotation.z = -0.15;

        const umbrellaTop = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.2, 16), LandmarkMaterials.getMat('umbrellaYellow', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', roughness: 0.3 })));
        umbrellaTop.position.set(0.35, 0.62, 0.05);
        umbrellaTop.rotation.z = -0.15;

        group.add(beach, sea, hut, buoy, umbrellaPole, umbrellaTop);
        break;
      }

      // =====================================================
      // PHÂN KHU 6: HẢI PHÒNG, HẠ LONG, TRÀNG AN (Fortune Yellow)
      // =====================================================
      case 26: {
        // Hải Phòng: Cẩu Giàn Container Cảng Biển Quốc Tế & Cụm Thùng Hàng
        const craneOrange = LandmarkMaterials.getMat('gantryOrange', () => new THREE.MeshStandardMaterial({ color: '#E67E22', metalness: 0.75, roughness: 0.28 }));
        const boxBlue = LandmarkMaterials.getMat('maerskBlue', () => new THREE.MeshStandardMaterial({ color: '#2980B9', roughness: 0.35 }));
        const boxGreen = LandmarkMaterials.getMat('evergreenGreen', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.35 }));
        const boxRed = LandmarkMaterials.getMat('cmaRed', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.35 }));

        // Cầu cảng bê tông
        const wharf = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.08, 0.85, 3, 0.03), LandmarkMaterials.getMat('wharfConcrete', () => new THREE.MeshStandardMaterial({ color: '#747D8C', roughness: 0.6 })));
        wharf.position.set(0, 0.04, 0);

        // Khung giàn cẩu bến cảng màu cam vươn cao
        const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.25, 12), craneOrange);
        leg1.position.set(-0.35, 0.64, -0.1);
        const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.25, 12), craneOrange);
        leg2.position.set(0.35, 0.64, -0.1);

        const boom = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.1, 0.14, 2, 0.02), craneOrange);
        boom.position.set(0, 1.25, 0.05);

        // Cáp tời nâng hạ hàng
        const hoistCable = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.45, 6), LandmarkMaterials.getMat('hoistCable', () => new THREE.MeshStandardMaterial({ color: '#2D3436' })));
        hoistCable.position.set(0, 1.0, 0.1);

        // Các khối container hàng hóa nhiều màu xếp ngăn nắp
        const c1 = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.2, 0.28, 2, 0.02), boxBlue);
        c1.position.set(-0.25, 0.14, 0.18);
        const c2 = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.2, 0.28, 2, 0.02), boxGreen);
        c2.position.set(0.28, 0.14, 0.18);
        const c3 = new THREE.Mesh(new RoundedBoxGeometry(0.45, 0.18, 0.26, 2, 0.02), boxRed);
        c3.position.set(-0.25, 0.33, 0.18);

        group.add(wharf, leg1, leg2, boom, hoistCable, c1, c2, c3);
        break;
      }

      case 27: {
        // Hạ Long: Hòn Trống Mái Sừng Sững Vịnh Ngọc & Thuyền Buồm Cánh Dơi Đỏ
        const karstRockMat = LandmarkMaterials.getMat('haLongKarstSmooth', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.65 }));
        const foliageMat = LandmarkMaterials.getMat('haLongFoliageGreen', () => new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.35 }));
        const bayWaterMat = LandmarkMaterials.getMat('haLongEmeraldWater', () => new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.08, transparent: true, opacity: 0.9 }));
        const sailRedMat = LandmarkMaterials.getMat('junkBatwingSail', () => new THREE.MeshStandardMaterial({ color: '#D63031', roughness: 0.35 }));

        // 1. Mặt nước vịnh xanh ngọc lục bảo trong vắt
        const water = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.08, 0.88, 3, 0.03), bayWaterMat);
        water.position.set(0, 0.04, 0);

        // 2. Hai Hòn Trống Mái đá vôi tự nhiên đối mặt nhau (chân thon nhỏ, thân phình to)
        const makeKarstIslet = (ix: number, iz: number, h: number, r: number, tilt: number) => {
          const islet = new THREE.Group();
          // Chân đảo bị sóng khoét mòn
          const foot = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.05, r * 0.75, h * 0.5, 20), karstRockMat);
          foot.position.y = h * 0.25;
          // Thân đảo phình to
          const body = new THREE.Mesh(new THREE.SphereGeometry(r * 1.15, 20, 16), karstRockMat);
          body.position.y = h * 0.65;
          // Mũ tán cây xanh nhiệt đới phủ trên đỉnh
          const cap = new THREE.Mesh(new THREE.SphereGeometry(r * 1.05, 18, 14), foliageMat);
          cap.scale.set(1.15, 0.65, 1.15);
          cap.position.y = h * 0.92;

          islet.add(foot, body, cap);
          islet.position.set(ix, 0, iz);
          islet.rotation.z = tilt;
          return islet;
        };

        const isletTrong = makeKarstIslet(-0.28, -0.15, 1.18, 0.32, 0.08);
        const isletMai = makeKarstIslet(0.26, -0.12, 0.98, 0.28, -0.06);

        // 3. Thuyền buồm nan cánh dơi Hạ Long đỏ son lướt sóng
        const boatHull = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.12, 0.22, 3, 0.03), LandmarkMaterials.getMat('woodBoatBrown', () => new THREE.MeshStandardMaterial({ color: '#5D4037', roughness: 0.5 })));
        boatHull.position.set(0.02, 0.1, 0.24);

        const sail = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.58, 16), sailRedMat);
        sail.scale.set(0.3, 1.0, 1.15);
        sail.position.set(0.02, 0.42, 0.24);

        group.add(water, isletTrong, isletMai, boatHull, sail);
        break;
      }

      case 29: {
        // Tràng An: Thủy Động Núi Đá Vôi Non Nước Hữu Tình & Thuyền Nan
        const mountainMat = LandmarkMaterials.getMat('trangAnKarstRock', () => new THREE.MeshStandardMaterial({ color: '#34495E', roughness: 0.65 }));
        const lakeMat = LandmarkMaterials.getMat('trangAnLakeWater', () => new THREE.MeshStandardMaterial({ color: '#00CEC9', roughness: 0.06, transparent: true, opacity: 0.92 }));

        // Vòm núi đá vôi uốn cong thành hang luồn thủy động
        const mountainArch = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.28, 16, 24, Math.PI), mountainMat);
        mountainArch.position.set(0, 0.28, -0.1);
        mountainArch.castShadow = true;

        // Thảm thực vật xanh phủ trên sống núi
        const mossCap = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.22, 12, 20, Math.PI), LandmarkMaterials.getMat('trangAnMoss', () => new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.4 })));
        mossCap.position.set(0, 0.35, -0.1);

        const water = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.08, 0.88, 3, 0.03), lakeMat);
        water.position.set(0, 0.04, 0);

        const canoe = LandmarkHelpers.createWoodenBoat('#D35400');
        canoe.position.set(0, 0.1, 0.22);

        group.add(mountainArch, mossCap, water, canoe);
        break;
      }

      // =====================================================
      // PHÂN KHU 7: HÀ NỘI - HỒ TÂY, PHỐ CỔ, TRÀNG TIỀN (Emerald Green)
      // =====================================================
      case 31: {
        // Hồ Tây (Hà Nội): Chùa Trấn Quốc Bảo Tháp Lục Độ Đài Sen 11 Tầng
        const pagodaTerracotta = LandmarkMaterials.getMat('tranQuocTerracotta', () => new THREE.MeshStandardMaterial({ color: '#C0392B', roughness: 0.42 }));
        const goldSpireMat = LandmarkMaterials.getMat('tranQuocGoldRoof', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', roughness: 0.22, metalness: 0.18 }));
        const lakeMat = LandmarkMaterials.getMat('westLakeWater', () => new THREE.MeshStandardMaterial({ color: '#0984E3', roughness: 0.08, transparent: true, opacity: 0.88 }));
        const lotusPinkMat = LandmarkMaterials.getMat('lotusBlossomPink', () => new THREE.MeshStandardMaterial({ color: '#FD79A8', emissive: '#FD79A8', emissiveIntensity: 0.3 }));

        // Mặt nước Hồ Tây mênh mang
        const lake = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.08, 0.9, 3, 0.03), lakeMat);
        lake.position.set(0, 0.04, 0);

        // Đài Sen đá nâng đỡ chân tháp
        const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.72, 0.16, 24), LandmarkMaterials.getMat('lotusStoneBase', () => new THREE.MeshStandardMaterial({ color: '#BDC3C7' })));
        lotusBase.position.y = 0.08;

        // 6 Tầng tháp đại diện thu nhỏ lục giác với mái ngói cong vút ở mỗi tầng
        const makeTier = (py: number, rTier: number, h: number) => {
          const body = new THREE.Mesh(new THREE.CylinderGeometry(rTier * 0.9, rTier, h, 6), pagodaTerracotta);
          body.position.set(0, py, 0);
          body.castShadow = true;

          // Mái ngói đao cong che trên mỗi tầng
          const eave = new THREE.Mesh(new THREE.CylinderGeometry(rTier * 0.65, rTier * 1.35, 0.06, 6), goldSpireMat);
          eave.position.set(0, py + h / 2 + 0.03, 0);

          // Tượng Phật trắng ngà trong hốc vòm
          const buddha = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), LandmarkMaterials.getMat('whiteBuddha', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF' })));
          buddha.position.set(0, py, rTier * 0.85);

          group.add(body, eave, buddha);
        };

        makeTier(0.28, 0.44, 0.22);
        makeTier(0.54, 0.36, 0.20);
        makeTier(0.78, 0.28, 0.18);
        makeTier(1.00, 0.21, 0.16);
        makeTier(1.20, 0.15, 0.14);

        // Đỉnh tháp Cửu Phẩm Liên Hoa (Hoa sen vàng 9 tầng)
        const lotusCrown = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), goldSpireMat);
        lotusCrown.position.set(0, 1.42, 0);

        // Hoa sen nở dập dềnh trên mặt nước Hồ Tây
        for (let s = 0; s < 3; s++) {
          const lotusFlower = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), lotusPinkMat);
          lotusFlower.position.set(0.35 + s * 0.15, 0.1, 0.22 - s * 0.12);
          group.add(lotusFlower);
        }

        group.add(lake, lotusBase, lotusCrown);
        break;
      }

      case 32: {
        // Phố Cổ Hà Nội: Cụm Nhà Ống Rêu Phong 36 Phố Phường & Cửa Chớp Xanh
        const ochreWallMat = LandmarkMaterials.getMat('hnOchreWall', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', roughness: 0.52 }));
        const mossTileMat = LandmarkMaterials.getMat('hnMossTile', () => new THREE.MeshStandardMaterial({ color: '#57606F', roughness: 0.65 }));
        const shutterMat = LandmarkMaterials.getMat('hnGreenShutter', () => new THREE.MeshStandardMaterial({ color: '#27AE60', roughness: 0.38 }));

        // Nhà 1 (Gian chính 3 tầng cổ kính)
        const h1 = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.88, 0.56, 3, 0.04), ochreWallMat);
        h1.position.set(-0.25, 0.44, 0);
        h1.castShadow = true;

        const roof1 = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.36, 4), mossTileMat);
        roof1.rotation.y = Math.PI / 4;
        roof1.position.set(-0.25, 1.04, 0);

        // Nhà 2 (Gian cạnh thấp hơn giật cấp)
        const h2 = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.72, 0.52, 3, 0.04), ochreWallMat);
        h2.position.set(0.26, 0.36, 0);
        h2.castShadow = true;

        const roof2 = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.32, 4), mossTileMat);
        roof2.rotation.y = Math.PI / 4;
        roof2.position.set(0.26, 0.86, 0);

        // Các ô cửa sổ lá sách màu xanh rêu truyền thống
        for (let floor = 0; floor < 2; floor++) {
          const winL = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.22), shutterMat);
          winL.position.set(-0.25, 0.38 + floor * 0.32, 0.29);
          const winR = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.22), shutterMat);
          winR.position.set(0.26, 0.32 + floor * 0.28, 0.27);
          group.add(winL, winR);
        }

        // Cột điện cổ có dây chăng ngang & Biển tên phố
        const streetSign = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.08, 0.02, 2, 0.01), LandmarkMaterials.getMat('streetSignBlue', () => new THREE.MeshStandardMaterial({ color: '#0984E3' })));
        streetSign.position.set(-0.25, 0.16, 0.32);

        group.add(h1, roof1, h2, roof2, streetSign);
        break;
      }

      case 34: {
        // Tràng Tiền: Nhà Hát Lớn Hà Nội - Kiến Trúc Tân Cổ Điển Pháp & Mái Mansard
        const creamFacadeMat = LandmarkMaterials.getMat('operaCreamFacade', () => new THREE.MeshStandardMaterial({ color: '#FFF8E7', roughness: 0.32 }));
        const mansardMat = LandmarkMaterials.getMat('operaMansardSlate', () => new THREE.MeshStandardMaterial({ color: '#2C3E50', roughness: 0.38 }));
        const columnMat = LandmarkMaterials.getMat('operaIonicPillar', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.22 }));

        // Bậc thềm đại sảnh đá hoa cương nhiều cấp
        const steps = new THREE.Mesh(new RoundedBoxGeometry(1.22, 0.1, 0.72, 3, 0.03), creamFacadeMat);
        steps.position.y = 0.05;
        steps.receiveShadow = true;

        // Tòa tiền sảnh Tân cổ điển bề thế
        const facade = new THREE.Mesh(new RoundedBoxGeometry(1.12, 0.65, 0.62, 4, 0.05), creamFacadeMat);
        facade.position.set(0, 0.42, 0);
        facade.castShadow = true;

        // 6 Cột La Mã Ionic fluted nâng đỡ trán tường
        for (let p = -0.42; p <= 0.42; p += 0.17) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.042, 0.58, 16), columnMat);
          col.position.set(p, 0.42, 0.33);
          group.add(col);
        }

        // Trán tường tam giác (Pediment) với phù điêu trang trí
        const pediment = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.22, 3), creamFacadeMat);
        pediment.rotation.z = Math.PI;
        pediment.position.set(0, 0.82, 0.32);

        // Mái vòm Mansard màu phiến đá đen Pháp
        const mansardRoof = new THREE.Mesh(new RoundedBoxGeometry(1.02, 0.38, 0.56, 4, 0.08), mansardMat);
        mansardRoof.position.set(0, 0.88, 0);

        // Chòi mái sổ vòm (Dormer window) trên mái
        const dormer = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 12, 0, Math.PI), creamFacadeMat);
        dormer.position.set(0, 0.98, 0.26);

        group.add(steps, facade, pediment, mansardRoof, dormer);
        break;
      }

      // =====================================================
      // PHÂN KHU 8: TP. HỒ CHÍ MINH - LANDMARK 81 & NGUYỄN HUỆ (Royal Sapphire)
      // =====================================================
      case 37: {
        // Landmark 81 (TP.HCM): Kiến Trúc Bó Tre 36 Đốt Cao Vút & Kim Ăng-ten Phát Quang
        const glassCyanMat = LandmarkMaterials.getMat('l81GlassCyan', () => new THREE.MeshStandardMaterial({
          color: '#74B9FF',
          emissive: '#0984E3',
          emissiveIntensity: 0.38,
          roughness: 0.08,
          metalness: 0.35
        }));
        const spandrelWhiteMat = LandmarkMaterials.getMat('l81SpandrelWhite', () => new THREE.MeshStandardMaterial({
          color: '#FFFFFF',
          roughness: 0.2
        }));
        const spireGoldMat = LandmarkMaterials.getMat('l81SpireGold', () => new THREE.MeshStandardMaterial({
          color: '#F1C40F',
          emissive: '#F1C40F',
          emissiveIntensity: 0.9,
          metalness: 0.92,
          roughness: 0.1
        }));

        // Bục sảnh đế đón khách vát cong hình cánh cung
        const podium = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.14, 1.15, 4, 0.08), glassCyanMat);
        podium.position.y = 0.07;
        podium.receiveShadow = true;
        group.add(podium);

        // Cấu trúc 3x3 gồm 9 khối tháp bó tre giật cấp chính xác theo nguyên mẫu Landmark 81
        const tubePositions = [
          // 4 Khối góc (thấp nhất Y = 1.0)
          [-0.24, -0.24, 0.95], [0.24, -0.24, 0.95],
          [-0.24, 0.24, 0.95], [0.24, 0.24, 0.95],
          // 4 Khối cạnh (vươn trung Y = 1.75)
          [0, -0.24, 1.7], [0, 0.24, 1.7],
          [-0.24, 0, 1.7], [0.24, 0, 1.7],
          // 1 Khối lõi trung tâm (vươn cao nhất Y = 2.45)
          [0, 0, 2.45]
        ];

        tubePositions.forEach(([tx, tz, th]) => {
          const colGeo = new RoundedBoxGeometry(0.22, th, 0.22, 3, 0.03);
          const colMesh = new THREE.Mesh(colGeo, glassCyanMat);
          colMesh.position.set(tx, th / 2 + 0.12, tz);
          colMesh.castShadow = true;
          group.add(colMesh);

          // Vạch spandrel trắng tinh khôi ở đỉnh từng khối
          const cap = new THREE.Mesh(new THREE.BoxGeometry(0.225, 0.03, 0.225), spandrelWhiteMat);
          cap.position.set(tx, th + 0.12, tz);
          group.add(cap);
        });

        // Đỉnh tháp thuôn nhọn pha lê chuyển tiếp
        const transitionCrown = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.45, 4), glassCyanMat);
        transitionCrown.rotation.y = Math.PI / 4;
        transitionCrown.position.set(0, 2.78, 0);

        // Kim ăng-ten đỉnh tháp cao vút mạ vàng (vươn tới Y = 3.35)
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.045, 0.72, 16), spireGoldMat);
        antenna.position.set(0, 3.12, 0);

        // Đèn an toàn hàng không đỏ rực trên đỉnh tháp nhấp nháy
        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(0.065, 12, 12),
          LandmarkMaterials.getMat('l81RedBeacon', () => new THREE.MeshBasicMaterial({ color: '#FF3838' }))
        );
        beacon.position.set(0, 3.48, 0);

        group.add(transitionCrown, antenna, beacon);
        break;
      }

      case 39: {
        // Nguyễn Huệ / Chợ Bến Thành (TP.HCM): Tháp Đồng Hồ Cổng Nam 3 Vòm Cuốn & Cột Cờ
        const creamWallMat = LandmarkMaterials.getMat('benThanhCreamPlaster', () => new THREE.MeshStandardMaterial({ color: '#FFF8E7', roughness: 0.38 }));
        const terracottaRoofMat = LandmarkMaterials.getMat('benThanhTerracottaTile', () => new THREE.MeshStandardMaterial({ color: '#E84118', roughness: 0.3 }));
        const clockFaceMat = LandmarkMaterials.getMat('benThanhClockGold', () => new THREE.MeshStandardMaterial({
          color: '#FFEAA7',
          emissive: '#F1C40F',
          emissiveIntensity: 0.65
        }));
        const clockHandsMat = LandmarkMaterials.getMat('clockHandsBlack', () => new THREE.MeshBasicMaterial({ color: '#1E272E' }));

        // Khối đế sảnh chính Chợ Bến Thành có 3 vòm cuốn Cửa Nam
        const basePortal = new THREE.Mesh(new RoundedBoxGeometry(1.22, 0.52, 0.75, 4, 0.06), creamWallMat);
        basePortal.position.set(0, 0.26, 0);
        basePortal.castShadow = true;

        // 3 Cửa vòm cuốn nổi tiếng khoét sâu ở mặt tiền
        const doorVoidMat = LandmarkMaterials.getMat('portalVoidDark', () => new THREE.MeshStandardMaterial({ color: '#1E272E' }));
        const mainArch = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.38, 0.08, 3, 0.04), doorVoidMat);
        mainArch.position.set(0, 0.22, 0.37);

        const subArchL = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.28, 0.08, 2, 0.03), doorVoidMat);
        subArchL.position.set(-0.35, 0.18, 0.37);
        const subArchR = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.28, 0.08, 2, 0.03), doorVoidMat);
        subArchR.position.set(0.35, 0.18, 0.37);

        // Mái hiên ngói đất nung đỏ uốn cong che trên 3 cổng vòm
        const lowerRoof = new THREE.Mesh(new RoundedBoxGeometry(1.26, 0.08, 0.82, 3, 0.04), terracottaRoofMat);
        lowerRoof.position.set(0, 0.56, 0);

        // Khối Tháp Đồng Hồ 4 mặt vươn cao ở giữa
        const clockTower = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.72, 0.68, 4, 0.06), creamWallMat);
        clockTower.position.set(0, 0.96, 0);
        clockTower.castShadow = true;

        // 4 Mặt đồng hồ tròn vàng kim ở 4 hướng với kim đồng hồ 10:10
        const clockPositions = [
          [0, 1.05, 0.35, 0],
          [0, 1.05, -0.35, Math.PI],
          [0.35, 1.05, 0, Math.PI / 2],
          [-0.35, 1.05, 0, -Math.PI / 2]
        ];

        clockPositions.forEach(([cx, cy, cz, rotY]) => {
          const frame = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 10, 24), LandmarkMaterials.getMat('clockBezelBrass', () => new THREE.MeshStandardMaterial({ color: '#F1C40F', metalness: 0.8 })));
          frame.position.set(cx, cy, cz);
          frame.rotation.y = rotY;

          const dial = new THREE.Mesh(new THREE.CircleGeometry(0.135, 20), clockFaceMat);
          dial.position.set(cx, cy, cz);
          dial.rotation.y = rotY;

          // Kim giờ & kim phút chỉ 10:10
          const handH = new THREE.Mesh(new THREE.PlaneGeometry(0.015, 0.06), clockHandsMat);
          handH.position.set(cx, cy + 0.02, cz + (cz >= 0 ? 0.005 : -0.005));
          handH.rotation.z = 0.55;

          const handM = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.085), clockHandsMat);
          handM.position.set(cx, cy + 0.03, cz + (cz >= 0 ? 0.005 : -0.005));
          handM.rotation.z = -0.55;

          group.add(frame, dial, handH, handM);
        });

        // Mái chóp tháp chuông ngói đỏ hình kim tự tháp cong duyên dáng
        const spireRoof = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.52, 4), terracottaRoofMat);
        spireRoof.rotation.y = Math.PI / 4;
        spireRoof.position.set(0, 1.54, 0);
        spireRoof.castShadow = true;

        // Cột cờ Tổ quốc phấp phới cờ đỏ sao vàng trên đỉnh tháp
        const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.52, 8), LandmarkMaterials.getMat('flagPoleSilver', () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', metalness: 0.8 })));
        flagPole.position.set(0, 1.95, 0);

        const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.16), LandmarkMaterials.getMat('vietnamFlagRed', () => new THREE.MeshBasicMaterial({ color: '#DA251D', side: THREE.DoubleSide })));
        flag.position.set(0.14, 2.08, 0);

        group.add(basePortal, mainArch, subArchL, subArchR, lowerRoof, clockTower, spireRoof, flagPole, flag);
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
