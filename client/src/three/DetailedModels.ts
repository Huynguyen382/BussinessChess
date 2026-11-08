import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Thư viện các mô hình 3D giàu chi tiết, phong cách hoạt hình mềm mại (Stylized High-Fidelity)
 */
export class DetailedModels {

  // 1. CÂY CÔNG VIÊN CAO CẤP: Thân uốn lượn hữu cơ, tán mây bồng bềnh nhiều tầng
  public static createStylizedTree(): THREE.Group {
    const tree = new THREE.Group();

    // Thân cây gỗ tự nhiên có rễ bạnh và nhánh uốn cong
    const trunkMat = new THREE.MeshStandardMaterial({
      color: '#8D5B4C',
      roughness: 0.75,
      metalness: 0.05
    });

    // Đế rễ cây
    const rootGeo = new THREE.CylinderGeometry(0.28, 0.42, 0.35, 10);
    const roots = new THREE.Mesh(rootGeo, trunkMat);
    roots.position.y = 0.17;
    roots.receiveShadow = true;
    tree.add(roots);

    // Đoạn thân chính uốn lượn nhẹ
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.28, 0.9, 10);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.65;
    trunk.rotation.z = -0.06;
    trunk.castShadow = true;
    tree.add(trunk);

    // Nhánh cây phụ chìa ra
    const branch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.45, 8), trunkMat);
    branch1.position.set(0.12, 0.95, 0.08);
    branch1.rotation.z = -Math.PI / 4;
    tree.add(branch1);

    // Tán lá đa khối (Multi-cluster cloud foliage) với sắc độ xanh lá chuyển màu tươi tắn
    const leafMatDark = new THREE.MeshStandardMaterial({ color: '#009473', roughness: 0.4 });
    const leafMatMid = new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.35 });
    const leafMatLight = new THREE.MeshStandardMaterial({ color: '#55EFC4', roughness: 0.3 });

    const foliageGroup = new THREE.Group();
    foliageGroup.position.y = 1.35;

    // 6 Khối tán lá tròn đan xen bồng bềnh như mây
    const clusters = [
      { x: 0, y: 0.2, z: 0, r: 0.72, mat: leafMatMid },
      { x: -0.32, y: 0, z: -0.2, r: 0.52, mat: leafMatDark },
      { x: 0.35, y: -0.05, z: 0.15, r: 0.55, mat: leafMatMid },
      { x: -0.22, y: -0.1, z: 0.3, r: 0.48, mat: leafMatDark },
      { x: 0.18, y: 0.1, z: -0.32, r: 0.5, mat: leafMatMid },
      { x: 0.02, y: 0.45, z: 0.02, r: 0.46, mat: leafMatLight } // Đỉnh sáng nắng
    ];

    clusters.forEach(c => {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(c.r, 16, 16), c.mat);
      sphere.position.set(c.x, c.y, c.z);
      sphere.castShadow = true;
      foliageGroup.add(sphere);
    });

    // Điểm xuyết quả chín/hoa nhỏ đỏ cam lấp ló
    const fruitMat = new THREE.MeshStandardMaterial({ color: '#FF7675', roughness: 0.2 });
    const fruitPositions = [
      [-0.4, 0.1, 0.2], [0.38, 0.18, -0.25], [-0.15, -0.05, -0.45], [0.32, -0.02, 0.35]
    ];
    fruitPositions.forEach(fp => {
      const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), fruitMat);
      fruit.position.set(fp[0], fp[1], fp[2]);
      foliageGroup.add(fruit);
    });

    tree.add(foliageGroup);
    return tree;
  }

  // 2. ĐÀI PHUN NƯỚC ĐẲNG CẤP (Multi-tier Classical Diorama Fountain)
  public static createDetailedFountain(): {
    group: THREE.Group;
    waterRipples: THREE.Mesh;
    waterFalls: THREE.Mesh[];
  } {
    const group = new THREE.Group();
    const waterFalls: THREE.Mesh[] = [];

    const stoneMat = new THREE.MeshStandardMaterial({
      color: '#DFE4EA',
      roughness: 0.38,
      metalness: 0.08
    });
    const stoneDarkMat = new THREE.MeshStandardMaterial({
      color: '#CED6E0',
      roughness: 0.42,
      metalness: 0.1
    });

    // A. Bể đáy lớn hình bát giác/tròn có bờ thành bo cong 2 tầng
    const outerBasin = new THREE.Mesh(
      new THREE.CylinderGeometry(3.6, 3.9, 0.45, 32),
      stoneMat
    );
    outerBasin.position.y = 0.35;
    outerBasin.receiveShadow = true;

    // Gờ thành bể uốn cong mềm mại
    const basinLip = new THREE.Mesh(
      new THREE.TorusGeometry(3.6, 0.14, 12, 36),
      stoneDarkMat
    );
    basinLip.rotation.x = Math.PI / 2;
    basinLip.position.y = 0.58;

    group.add(outerBasin, basinLip);

    // Mặt nước hồ đáy trong vắt
    const waterMat = new THREE.MeshStandardMaterial({
      color: '#0984E3',
      emissive: '#74B9FF',
      emissiveIntensity: 0.42,
      transparent: true,
      opacity: 0.88,
      roughness: 0.06,
      metalness: 0.12
    });
    const lowerWater = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.1, 32), waterMat);
    lowerWater.position.y = 0.54;
    group.add(lowerWater);

    // Lá sen / hoa súng tí hon bồng bềnh trên mặt hồ
    const lilyMat = new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.3 });
    const flowerMat = new THREE.MeshStandardMaterial({ color: '#FF7675', roughness: 0.2 });
    for (let l = 0; l < 4; l++) {
      const angle = (l / 4) * Math.PI * 2 + 0.3;
      const lily = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 12), lilyMat);
      lily.position.set(Math.cos(angle) * 2.2, 0.56, Math.sin(angle) * 2.2);

      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), flowerMat);
      petal.position.set(Math.cos(angle) * 2.2, 0.62, Math.sin(angle) * 2.2);
      group.add(lily, petal);
    }

    // B. Trụ đài phun nước trung tâm có rãnh khía kiến trúc Hy Lạp (Fluted Pedestal)
    const pedestalBase = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.5, 24), stoneDarkMat);
    pedestalBase.position.y = 0.75;
    const pedestalStem = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 0.8, 24), stoneMat);
    pedestalStem.position.y = 1.35;
    group.add(pedestalBase, pedestalStem);

    // C. Bát phun nước tầng 2 với vành cánh sen uốn lượn
    const upperBowl = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.1, 0.32, 24), stoneMat);
    upperBowl.position.y = 1.85;
    const bowlLip = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.08, 10, 28), stoneDarkMat);
    bowlLip.rotation.x = Math.PI / 2;
    bowlLip.position.y = 2.01;
    group.add(upperBowl, bowlLip);

    // Nước tràn ở tầng 2
    const upperWater = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.48, 0.08, 24), waterMat);
    upperWater.position.y = 1.98;
    group.add(upperWater);

    // Màng nước rơi từ tầng 2 xuống tầng 1 (Cascading Waterfalls)
    const cascadeGeo = new THREE.CylinderGeometry(1.58, 2.4, 1.15, 24, 1, true);
    const cascadeMat = new THREE.MeshStandardMaterial({
      color: '#A0E7E5',
      emissive: '#E0F2FE',
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });
    const cascade = new THREE.Mesh(cascadeGeo, cascadeMat);
    cascade.position.y = 1.25;
    group.add(cascade);
    waterFalls.push(cascade);

    // D. Đỉnh vòi phun vương miện mạ vàng
    const goldMat = new THREE.MeshStandardMaterial({
      color: '#FDCB6E',
      emissive: '#FDCB6E',
      emissiveIntensity: 0.3,
      metalness: 0.88,
      roughness: 0.18
    });
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 0.45, 16), goldMat);
    spout.position.y = 2.22;
    group.add(spout);

    return { group, waterRipples: lowerWater, waterFalls };
  }

  // 3. CHI TIẾT Ô CỜ: Vỉa hè lát đá nổi khối, Gờ bó vỉa bo cong và Cột biển báo
  public static createTileCurbs(w: number, l: number, angle: number): THREE.Group {
    const curbGroup = new THREE.Group();
    const curbMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.45 });

    // Gờ đá bó vỉa bo cong ngăn cách mặt đường
    const curbGeo = new RoundedBoxGeometry(w * 0.96, 0.06, 0.12, 2, 0.02);
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(0, 0.18, l * 0.44);
    curbGroup.add(curb);

    return curbGroup;
  }

  // 4. BỤI HOA CẨM TÚ CẦU RỰC RỠ (Flower Bush Cluster)
  public static createFlowerBush(colorHex: string): THREE.Group {
    const bush = new THREE.Group();
    const leafMat = new THREE.MeshStandardMaterial({ color: '#00B894', roughness: 0.4 });
    const flowerMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.25, emissive: colorHex, emissiveIntensity: 0.15 });

    // Cụm lá xanh
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), leafMat);
    leaves.scale.set(1.2, 0.7, 1.2);
    leaves.position.y = 0.2;
    bush.add(leaves);

    // Các đóa hoa nhỏ nhấp nhô
    const floretGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const floretOffsets = [
      [0, 0.38, 0], [-0.18, 0.32, 0.14], [0.18, 0.33, -0.1], [0.12, 0.28, 0.18], [-0.14, 0.3, -0.16]
    ];
    floretOffsets.forEach(([fx, fy, fz]) => {
      const floret = new THREE.Mesh(floretGeo, flowerMat);
      floret.position.set(fx, fy, fz);
      bush.add(floret);
    });

    return bush;
  }
}
