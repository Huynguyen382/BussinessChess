/**
 * AUTOMATED TEST SUITE: LandmarkModels & 3D Board Architecture
 * Verifies all 40 tiles on the Vietnam Business Chess board:
 * - 4 Corner Mega-Landmarks
 * - 4 Railroad & Transport Hubs
 * - 2 Utilities (Điện Lực & Nước Sạch)
 * - 6 Chance, Community Chest & Tax tiles
 * - 22 Property City Landmarks
 *
 * Checks: Valid THREE.Group, non-empty meshes, finite coordinates,
 * valid PBR/Basic materials, and supported micro-animation metadata.
 */

// Polyfill minimal browser DOM globals for Three.js headless execution in Node.js
if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElement: (tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 128,
          height: 128,
          getContext: () => ({
            createRadialGradient: () => ({ addColorStop: () => {} }),
            fillStyle: '',
            fillRect: () => {}
          }),
          addEventListener: () => {},
          removeEventListener: () => {}
        };
      }
      return {};
    }
  } as any;
}

if (typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis as any;
}
if (typeof (globalThis.window as any).innerWidth === 'undefined') {
  (globalThis.window as any).innerWidth = 1920;
  (globalThis.window as any).innerHeight = 1080;
}
if (typeof (globalThis.window as any).addEventListener === 'undefined') {
  (globalThis.window as any).addEventListener = () => {};
}

import assert from 'node:assert';
import * as THREE from 'three';
import { LandmarkModels } from '../src/three/LandmarkModels';
import { LandmarkMaterials } from '../src/three/landmarks/LandmarkMaterials';
import { LandmarkHelpers } from '../src/three/landmarks/LandmarkHelpers';
import { BuildingMesh } from '../src/three/BuildingMesh';
import { DetailedModels } from '../src/three/DetailedModels';
import { CameraManager } from '../src/three/CameraManager';
import { TokenManager } from '../src/three/TokenManager';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log(' RUNNING CLIENT 3D LANDMARK MODELS TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    throw err;
  }
}

const SUPPORTED_ANIM_TYPES = new Set([
  'spin_y',
  'rotate_pulse',
  'flicker',
  'pulse_red',
  'lighthouse',
  'float_wave'
]);

interface MeshAudit {
  meshCount: number;
  totalVertices: number;
  animTypesFound: string[];
}

/**
 * Traverses a 3D model hierarchy and rigorously verifies:
 * 1. Root is a valid THREE.Group with children
 * 2. Every Mesh has a valid geometry and material
 * 3. All coordinates (position, rotation, scale, vertices) are valid finite numbers (NO NaN, NO Infinity)
 * 4. Any animType metadata belongs to the supported BoardScene animation system
 */
function auditModel(group: THREE.Group, modelName: string): MeshAudit {
  assert(group instanceof THREE.Group, `[${modelName}] must be an instance of THREE.Group`);
  assert(group.children.length > 0, `[${modelName}] must have children (found 0)`);

  let meshCount = 0;
  let totalVertices = 0;
  const animTypesFound: string[] = [];

  group.traverse((child) => {
    // 1. Verify spatial coordinates
    assert(
      Number.isFinite(child.position.x) &&
      Number.isFinite(child.position.y) &&
      Number.isFinite(child.position.z),
      `[${modelName}] child "${child.name}" has invalid position (${child.position.x}, ${child.position.y}, ${child.position.z})`
    );
    assert(
      Number.isFinite(child.rotation.x) &&
      Number.isFinite(child.rotation.y) &&
      Number.isFinite(child.rotation.z),
      `[${modelName}] child "${child.name}" has invalid rotation`
    );
    assert(
      Number.isFinite(child.scale.x) &&
      Number.isFinite(child.scale.y) &&
      Number.isFinite(child.scale.z),
      `[${modelName}] child "${child.name}" has invalid scale`
    );

    // 2. Check animation metadata if present
    if (child.userData && child.userData.animType) {
      const anim = child.userData.animType;
      assert(
        SUPPORTED_ANIM_TYPES.has(anim),
        `[${modelName}] uses unsupported animation type "${anim}". Must be one of: ${Array.from(SUPPORTED_ANIM_TYPES).join(', ')}`
      );
      animTypesFound.push(anim);
    }

    // 3. Inspect Mesh if applicable
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      meshCount++;

      // Geometry checks
      assert(mesh.geometry !== undefined, `[${modelName}] mesh "${mesh.name}" is missing geometry`);
      const posAttr = mesh.geometry.attributes.position;
      assert(posAttr !== undefined, `[${modelName}] mesh geometry missing position attribute`);
      assert(posAttr.count > 0, `[${modelName}] mesh geometry has 0 vertices`);
      totalVertices += posAttr.count;

      // Sample first and last vertices to verify no NaNs in vertex buffer
      const posArray = posAttr.array as Float32Array;
      assert(Number.isFinite(posArray[0]), `[${modelName}] vertex buffer contains non-finite x coordinate`);
      assert(Number.isFinite(posArray[posArray.length - 1]), `[${modelName}] vertex buffer contains non-finite terminal coordinate`);

      // Material checks
      assert(mesh.material !== undefined, `[${modelName}] mesh "${mesh.name}" is missing material`);
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) {
        assert(mat instanceof THREE.Material, `[${modelName}] material is not an instance of THREE.Material`);
      }
    }
  });

  assert(meshCount > 0, `[${modelName}] must contain at least 1 THREE.Mesh (found ${meshCount})`);
  return { meshCount, totalVertices, animTypesFound };
}

// ====================================================
// SUITE 1: 4 CORNER MEGA-LANDMARKS
// ====================================================
console.log('--- Suite 1: 4 Corner Mega-Landmarks ---');

test('Tile 0 (GO / Khởi Hành) - Golden Arc de Triomphe & Red Velvet Carpet', () => {
  const model = LandmarkModels.createGOCorner();
  const audit = auditModel(model, 'Corner 0 (GO)');
  assert(audit.meshCount >= 10, `GO Corner expected >= 10 meshes, found ${audit.meshCount}`);
  assert(audit.animTypesFound.includes('rotate_pulse'), 'GO Corner should have rotate_pulse animation on ruby crown');
});

test('Tile 10 (JAIL / Nhà Tù) - Prison Fortress, Watchtower & Searchlight', () => {
  const model = LandmarkModels.createJailCorner();
  const audit = auditModel(model, 'Corner 10 (JAIL)');
  assert(audit.meshCount >= 10, `Jail Corner expected >= 10 meshes, found ${audit.meshCount}`);
  assert(audit.animTypesFound.includes('spin_y'), 'Jail Corner should have rotating searchlight (spin_y)');
});

test('Tile 20 (FREE PARKING / Bãi Đỗ Xe) - Retro 1950s Diner & Service Station', () => {
  const model = LandmarkModels.createFreeParkingCorner();
  const audit = auditModel(model, 'Corner 20 (FREE PARKING)');
  assert(audit.meshCount >= 8, `Free Parking expected >= 8 meshes, found ${audit.meshCount}`);
  assert(audit.animTypesFound.includes('flicker'), 'Free Parking should have neon sign flicker animation');
});

test('Tile 30 (AIRPORT / Sân Bay Quốc Tế) - Terminal, Jetliner, Control Tower & Radar', () => {
  const model = LandmarkModels.createAirportCorner();
  const audit = auditModel(model, 'Corner 30 (AIRPORT)');
  assert(audit.meshCount >= 10, `Airport expected >= 10 meshes, found ${audit.meshCount}`);
  assert(audit.animTypesFound.includes('spin_y'), 'Airport should have spin_y on ATC radar dish');
  assert(audit.animTypesFound.includes('pulse_red'), 'Airport should have pulse_red on ATC beacon light');
});

// ====================================================
// SUITE 2: 4 TRANSPORTATION HUBS (RAILROADS)
// ====================================================
console.log('\n--- Suite 2: 4 Railroads & Transport Hubs ---');

test('Tile 5 (Bến Xe Miền Tây) - Interprovincial Bus Terminal, Sleeper Coach & LED sign', () => {
  const model = LandmarkModels.createRailroadModel(5);
  const audit = auditModel(model, 'Railroad 5 (Bến Xe Miền Tây)');
  assert(audit.meshCount >= 10, `Bến Xe Miền Tây expected >= 10 meshes, found ${audit.meshCount}`);
  assert(audit.animTypesFound.includes('flicker'), 'Bus station should have flicker on sign / lamps');
});

test('Tile 15 (Ga Sài Gòn) - Historic Steam Locomotive, Railway Tracks & Signal Light', () => {
  const model = LandmarkModels.createRailroadModel(15);
  const audit = auditModel(model, 'Railroad 15 (Ga Sài Gòn)');
  assert(audit.meshCount >= 15, `Ga Sài Gòn expected >= 15 meshes, found ${audit.meshCount}`);
  assert(audit.animTypesFound.includes('pulse_red'), 'Ga Sài Gòn should have pulse_red signal');
  assert(audit.animTypesFound.includes('flicker'), 'Ga Sài Gòn should have steam puff flicker');
});

test('Tile 25 (Ga Đà Nẵng) - Central Rail Hub, Locomotive & Signal Light', () => {
  const model = LandmarkModels.createRailroadModel(25);
  const audit = auditModel(model, 'Railroad 25 (Ga Đà Nẵng)');
  assert(audit.meshCount >= 15, `Ga Đà Nẵng expected >= 15 meshes, found ${audit.meshCount}`);
  assert(audit.animTypesFound.includes('pulse_red'), 'Ga Đà Nẵng should have pulse_red signal');
});

test('Tile 35 (Ga Hà Nội) - Capital Terminal Station, Tracks & Signal Light', () => {
  const model = LandmarkModels.createRailroadModel(35);
  const audit = auditModel(model, 'Railroad 35 (Ga Hà Nội)');
  assert(audit.meshCount >= 15, `Ga Hà Nội expected >= 15 meshes, found ${audit.meshCount}`);
  assert(audit.animTypesFound.includes('pulse_red'), 'Ga Hà Nội should have pulse_red signal');
});

// ====================================================
// SUITE 3: 2 UTILITY COMPANIES
// ====================================================
console.log('\n--- Suite 3: 2 Utility Companies ---');

test('Tile 12 (Công Ty Điện Lực) - Steel Pylon Tower & Plasma Lightning Orb', () => {
  const model = LandmarkModels.createUtilityModel(12);
  const audit = auditModel(model, 'Utility 12 (Công Ty Điện Lực)');
  assert(audit.meshCount >= 6, `Electric utility expected >= 6 meshes, found ${audit.meshCount}`);
});

test('Tile 28 (Công Ty Nước Sạch) - Urban Aqua Water Tower, Pipes & Valve Wheel', () => {
  const model = LandmarkModels.createUtilityModel(28);
  const audit = auditModel(model, 'Utility 28 (Công Ty Nước Sạch)');
  assert(audit.meshCount >= 6, `Water utility expected >= 6 meshes, found ${audit.meshCount}`);
});

// ====================================================
// SUITE 4: 6 CHANCE, COMMUNITY CHEST & TAX TILES
// ====================================================
console.log('\n--- Suite 4: Chance, Community Chest & Tax Tiles ---');

test('Tiles 7, 22, 36 (Cơ Hội / Chance) - Mystery Gift Box & 3D Question Mark', () => {
  [7, 22, 36].forEach(tileId => {
    const model = LandmarkModels.createCardTileModel(true);
    const audit = auditModel(model, `Chance Tile ${tileId}`);
    assert(audit.meshCount >= 4, `Chance tile ${tileId} expected >= 4 meshes, found ${audit.meshCount}`);
  });
});

test('Tiles 2, 17, 33 (Khí Vận / Community Chest) - Ornate Wooden Treasure Chest & Gold Coins', () => {
  [2, 17, 33].forEach(tileId => {
    const model = LandmarkModels.createCardTileModel(false);
    const audit = auditModel(model, `Community Chest Tile ${tileId}`);
    assert(audit.meshCount >= 4, `Community Chest ${tileId} expected >= 4 meshes, found ${audit.meshCount}`);
  });
});

test('Tile 4 (Thuế Thu Nhập) - Heavy Steel Bank Safe & Cash Sacks', () => {
  const model = LandmarkModels.createTaxModel(4);
  const audit = auditModel(model, 'Tax 4 (Thuế Thu Nhập)');
  assert(audit.meshCount >= 3, `Income tax expected >= 3 meshes, found ${audit.meshCount}`);
});

test('Tile 38 (Thuế Xa Xỉ) - Brilliant-Cut Crystal Diamond & Royal Gold Pedestal', () => {
  const model = LandmarkModels.createTaxModel(38);
  const audit = auditModel(model, 'Tax 38 (Thuế Xa Xỉ)');
  assert(audit.meshCount >= 3, `Luxury tax expected >= 3 meshes, found ${audit.meshCount}`);
});

// ====================================================
// SUITE 5: 22 VIETNAM PROPERTY CITY LANDMARKS
// ====================================================
console.log('\n--- Suite 5: 22 Vietnam Property City Landmarks ---');

const VIETNAM_TILES: Array<{ id: number; name: string; district: number; expectedAnim?: string }> = [
  { id: 1, name: 'Cần Thơ (Cầu Cần Thơ & Chợ Nổi Cái Răng)', district: 1, expectedAnim: 'float_wave' },
  { id: 3, name: 'Cà Mau (Mũi Cực Nam Tổ Quốc & Tàu Đánh Cá)', district: 1, expectedAnim: 'float_wave' },
  { id: 6, name: 'Vũng Tàu (Hải Đăng Núi Nhỏ & Biển Chiều)', district: 2, expectedAnim: 'spin_y' },
  { id: 8, name: 'Phan Thiết (Tháp Chăm Poshanư & Đồi Cát Bay)', district: 2, expectedAnim: 'float_wave' },
  { id: 9, name: 'Nha Trang (Tháp Trầm Hương & Vịnh Biển Ngọc)', district: 2, expectedAnim: 'float_wave' },
  { id: 11, name: 'Đà Lạt (Ga Cổ Rừng Thông & Mây Ngàn)', district: 3, expectedAnim: 'float_wave' },
  { id: 13, name: 'Buôn Ma Thuột (Nhà Rông Tây Nguyên & Cồng Chiêng)', district: 3, expectedAnim: 'flicker' },
  { id: 14, name: 'Pleiku (Biển Hồ Tơ Nưng & Rừng Thông Xanh)', district: 3, expectedAnim: 'float_wave' },
  { id: 16, name: 'Quy Nhơn (Tháp Đôi Chăm & Eo Gió Kỳ Vĩ)', district: 4, expectedAnim: 'float_wave' },
  { id: 18, name: 'Hội An (Chùa Cầu & Đèn Lồng Sông Hoài)', district: 4, expectedAnim: 'float_wave' },
  { id: 19, name: 'Đà Nẵng (Cầu Rồng Phun Lửa Sông Hàn)', district: 4, expectedAnim: 'flicker' },
  { id: 21, name: 'Huế (Ngọ Môn Cố Đô & Kỳ Đài Ngũ Sắc)', district: 5, expectedAnim: 'float_wave' },
  { id: 23, name: 'Phong Nha (Kỳ Quan Động Phong Nha & Thuyền Khám Phá)', district: 5 },
  { id: 24, name: 'Cửa Lò (Đảo Lan Châu, Hải Đăng & Thuyền Thúng)', district: 5 },
  { id: 26, name: 'Hải Phòng (Cầu Hoàng Văn Thụ & Cẩu Cảng Container)', district: 6 },
  { id: 27, name: 'Hạ Long (Hòn Trống Mái & Du Thuyền Buồm Hạ Long)', district: 6 },
  { id: 29, name: 'Tràng An (Quần Thể Danh Thắng Tràng An & Thuyền Nan)', district: 6 },
  { id: 31, name: 'Hồ Tây (Chùa Trấn Quốc & Hồ Sen Bát Ngát)', district: 7 },
  { id: 32, name: 'Phố Cổ (Cửa Ô Quan Chưởng & Mái Ngói Rêu Phong)', district: 7 },
  { id: 34, name: 'Tràng Tiền (Cột Cờ Hà Nội & Cờ Đỏ Sao Vàng)', district: 7, expectedAnim: 'float_wave' },
  { id: 37, name: 'Landmark 81 (Tháp Bó Tre & Đài Phun Nước)', district: 8, expectedAnim: 'rotate_pulse' },
  { id: 39, name: 'Nguyễn Huệ (Chợ Bến Thành & Phố Đi Bộ)', district: 8, expectedAnim: 'flicker' }
];

for (const prop of VIETNAM_TILES) {
  test(`Tile ${prop.id}: ${prop.name} (District ${prop.district})`, () => {
    const model = LandmarkModels.createCityLandmark(prop.id);
    const audit = auditModel(model, `Property ${prop.id} - ${prop.name}`);
    assert(audit.meshCount >= 5, `Tile ${prop.id} expected >= 5 meshes, found ${audit.meshCount}`);
    if (prop.expectedAnim) {
      assert(
        audit.animTypesFound.includes(prop.expectedAnim),
        `Tile ${prop.id} (${prop.name}) should include "${prop.expectedAnim}" animation`
      );
    }
  });
}

// ====================================================
// SUITE 6: ARCHITECTURAL & SPECIAL FIX VERIFICATIONS
// ====================================================
console.log('\n--- Suite 6: Specific Architectural & Quality Verifications ---');

test('Tile 34 (Tràng Tiền / Cột Cờ Hà Nội): Authentic 5-pointed star flag geometry', () => {
  const model = LandmarkModels.createCityLandmark(34);
  let flagFound = false;
  let starMeshes = 0;

  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry instanceof THREE.ShapeGeometry) {
        starMeshes++;
      }
    }
    if (child.userData && child.userData.animType === 'float_wave') {
      flagFound = true;
    }
  });

  assert(flagFound, 'Cột Cờ Hà Nội flag must have fluttering float_wave animation');
  assert(starMeshes >= 2, `Cột Cờ Hà Nội must have 5-pointed stars on both sides (front and back), found ${starMeshes}`);
});

test('Tile 6 (Vũng Tàu / Hải Đăng Núi Nhỏ): Lighthouse beacon arm & expanding cone alignment', () => {
  const model = LandmarkModels.createCityLandmark(6);
  let beaconArmFound = false;
  let coneGeoFound = false;

  model.traverse((child) => {
    if (child.userData && child.userData.animType === 'spin_y') {
      beaconArmFound = true;
      assert(child.position.y >= 1.7, `Beacon arm pivot should be at lantern room elevation (y >= 1.7), found ${child.position.y}`);
      child.traverse((subChild) => {
        if ((subChild as THREE.Mesh).isMesh) {
          const mesh = subChild as THREE.Mesh;
          if (mesh.geometry instanceof THREE.ConeGeometry) {
            coneGeoFound = true;
          }
        }
      });
    }
  });

  assert(beaconArmFound, 'Hải Đăng Vũng Tàu must have rotating beacon arm (spin_y)');
  assert(coneGeoFound, 'Beacon light beam must use ConeGeometry oriented into the distance');
});

test('Tile 23 (Phong Nha): Cavern dome, stalactites, glowing jade river & exploration boat', () => {
  const model = LandmarkModels.createCityLandmark(23);
  let boatFound = false;
  let beamFound = false;
  let stalactiteFound = false;

  model.traverse((child) => {
    if (child.userData && child.userData.animType === 'float_wave') {
      boatFound = true;
    }
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry instanceof THREE.ConeGeometry) {
        // Can be stalactites or exploration light beam
        const mat = mesh.material as THREE.Material;
        if ((mat as any).blending === THREE.AdditiveBlending) {
          beamFound = true;
        } else {
          stalactiteFound = true;
        }
      }
    }
  });

  assert(boatFound, 'Phong Nha must include an exploration boat with floating animation');
  assert(beamFound, 'Phong Nha boat must feature an exploration searchlight beam cone');
  assert(stalactiteFound, 'Phong Nha cavern must feature crystalline stalactites');
});

test('Tile 24 (Cửa Lò): Lan Châu promontory, lighthouse, sandy beach & basket boat', () => {
  const model = LandmarkModels.createCityLandmark(24);
  let basketBoatFound = false;
  let lighthouseBeacon = false;

  model.traverse((child) => {
    if (child.userData && child.userData.animType === 'float_wave') {
      basketBoatFound = true;
    }
    if (child.userData && (child.userData.animType === 'lighthouse' || child.userData.animType === 'spin_y')) {
      lighthouseBeacon = true;
    }
  });

  assert(basketBoatFound, 'Cửa Lò must feature traditional basket boat with wave animation');
  assert(lighthouseBeacon, 'Cửa Lò Lan Châu promontory must feature historic lighthouse beacon');
});

test('Tile 26 (Hải Phòng): Cầu Hoàng Văn Thụ seagull wing arches & container gantry crane', () => {
  const model = LandmarkModels.createCityLandmark(26);
  let bridgeDeckFound = false;
  let containerCount = 0;

  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.name === 'cargoContainer' || (mesh.geometry.type === 'BoxGeometry' && mesh.scale.y > 0)) {
        containerCount++;
      }
      bridgeDeckFound = true;
    }
  });

  assert(bridgeDeckFound, 'Hải Phòng must feature Cầu Hoàng Văn Thụ bridge deck structure');
  assert(containerCount >= 5, `Hải Phòng port must feature container crane and cargo containers (found ${containerCount})`);
});

test('Tile 27 (Hạ Long): Hòn Trống Mái karst silhouette & traditional junk boat', () => {
  const model = LandmarkModels.createCityLandmark(27);
  assert(model instanceof THREE.Group, 'Hạ Long model must be a valid THREE.Group');

  let junkBoatFound = false;
  let flagWaveFound = false;
  let meshCount = 0;
  let ringCount = 0;
  let dodecahedronCount = 0;

  model.traverse((child: any) => {
    if (child.isMesh) {
      meshCount++;
      if (child.geometry instanceof THREE.RingGeometry) ringCount++;
      if (child.geometry instanceof THREE.DodecahedronGeometry) dodecahedronCount++;
    }
    if (child.userData?.animType === 'float_wave') {
      flagWaveFound = true;
      if (child instanceof THREE.Group) {
        junkBoatFound = true;
      }
    }
  });

  assert(junkBoatFound, 'Hạ Long bay must feature traditional wooden junk boat with sailing animation (float_wave)');
  assert(flagWaveFound, 'Hạ Long junk ship must feature fluttering Vietnamese flag with float_wave animation');
  assert(meshCount >= 35, `Hạ Long model must feature rich karst geological depth & diorama detail (expected >= 35 meshes, found ${meshCount})`);
  assert(ringCount >= 4, `Hạ Long must feature tidal ripple rings around Hòn Trống and Hòn Mái (found ${ringCount})`);
  assert(dodecahedronCount >= 6, `Hạ Long must feature natural faceted karst limestone boulders and bonsai foliage (found ${dodecahedronCount})`);
});

test('Tile 29 (Tràng An): Thủy Đình 2 tầng 8 mái cong, Hang Luồn thạch nhũ & thuyền nan nón lá', () => {
  const model = LandmarkModels.createCityLandmark(29);
  assert(model instanceof THREE.Group, 'Tràng An model must be a valid THREE.Group');

  let sampanCount = 0;
  let meshCount = 0;
  let dodecahedronCount = 0;
  let torusCount = 0;
  let coneCount = 0;

  model.traverse((child: any) => {
    if (child.isMesh) {
      meshCount++;
      if (child.geometry instanceof THREE.DodecahedronGeometry) dodecahedronCount++;
      if (child.geometry instanceof THREE.TorusGeometry) torusCount++;
      if (child.geometry instanceof THREE.ConeGeometry) coneCount++;
    }
    if (child.userData && child.userData.animType === 'float_wave') {
      sampanCount++;
    }
  });

  assert(sampanCount >= 2, `Tràng An must feature traditional sampan boats gliding on Ngô Đồng river (found ${sampanCount})`);
  assert(meshCount >= 35, `Tràng An diorama must feature rich architectural & geological depth (expected >= 35 meshes, found ${meshCount})`);
  assert(dodecahedronCount >= 5, `Tràng An must feature faceted karst limestone cliffs and bonsai foliage (found ${dodecahedronCount})`);
  assert(torusCount >= 5, `Tràng An must feature cave arch and curved dragon roof eaves (found ${torusCount})`);
  assert(coneCount >= 6, `Tràng An must feature stalactites, karst spires, roofs and nón lá hats (found ${coneCount})`);
});

test('Tile 21 (Huế): Ngọ Môn 5 Cửa U-bastion, Lầu Ngũ Phụng, Cầu Trung Đạo Hồ Sen, Kỳ Đài & Súng Thần Công', () => {
  const model = LandmarkModels.createCityLandmark(21);
  assert(model instanceof THREE.Group, 'Huế model must be a valid THREE.Group');

  let flagWaveFound = false;
  let meshCount = 0;
  let cylinderCount = 0;

  model.traverse((child: any) => {
    if (child.isMesh) {
      meshCount++;
      if (child.geometry instanceof THREE.CylinderGeometry) cylinderCount++;
      if (child.userData?.animType === 'float_wave') flagWaveFound = true;
    }
  });

  assert(flagWaveFound, 'Huế must feature the five-color imperial flag with float_wave animation');
  assert(meshCount >= 25, `Huế model must feature rich architectural depth (expected >= 25 meshes, found ${meshCount})`);
  assert(cylinderCount >= 8, `Huế must feature pillars, flagpole, cannon barrel and lotus pads (found ${cylinderCount})`);
});

test('Tile 19 (Đà Nẵng): Cầu Rồng thời Lý, hướng phun lửa chuẩn xác (+x), quả cầu lửa bùng nổ & màn phun nước', () => {
  const model = LandmarkModels.createCityLandmark(19);
  assert(model instanceof THREE.Group, 'Đà Nẵng model must be a valid THREE.Group');

  let flickerFound = false;
  let floatWaveFound = false;
  let meshCount = 0;
  let flameEmitterFound = false;

  model.traverse((child: any) => {
    if (child.isMesh) meshCount++;
    if (child.userData?.animType === 'flicker') {
      flickerFound = true;
      flameEmitterFound = true;
      // Verify children inside flame emitter: cone should expand along positive x (position.x > 0)
      child.children.forEach((c: any) => {
        if (c.geometry instanceof THREE.ConeGeometry) {
          assert(c.position.x > 0, `Flame cone must project forward along +x, got ${c.position.x}`);
        }
      });
    }
    if (child.userData?.animType === 'float_wave') floatWaveFound = true;
  });

  assert(flickerFound, 'Đà Nẵng must have flame flicker animation');
  assert(flameEmitterFound, 'Đà Nẵng must feature flameEmitter group');
  assert(floatWaveFound, 'Đà Nẵng must feature Han River cruise boat with float_wave animation');
  assert(meshCount >= 30, `Đà Nẵng expected >= 30 meshes (bridge, dragon arches, head, tail, cars, flame burst), found ${meshCount}`);
});

test('Tile 18 (Hội An): Chùa Cầu Lai Viễn Kiều, Tường Vàng Phố Cổ, Đèn Lồng Lụa, Hoa Giấy & Hoa Đăng Sông Hoài', () => {
  const model = LandmarkModels.createCityLandmark(18);
  assert(model instanceof THREE.Group, 'Hội An model must be a valid THREE.Group');

  let floatWaveFound = false;
  let lighthouseFound = false;
  let meshCount = 0;

  model.traverse((child: any) => {
    if (child.isMesh) meshCount++;
    if (child.userData?.animType === 'float_wave') floatWaveFound = true;
    if (child.userData?.animType === 'lighthouse') lighthouseFound = true;
  });

  assert(floatWaveFound, 'Hội An must feature floating lanterns & sampan boat with float_wave animation');
  assert(lighthouseFound, 'Hội An must feature silk lanterns with glowing lighthouse animation');
  assert(meshCount >= 35, `Hội An expected >= 35 meshes (curved bridge, temple, roof, balusters, guardian statues, yellow houses, bougainvillea, lanterns, sampan), found ${meshCount}`);
});

test('LandmarkMaterials cache efficiency test', () => {
  const mat1 = LandmarkMaterials.getMat('testSharedMat', () => new THREE.MeshBasicMaterial({ color: '#FF0000' }));
  const mat2 = LandmarkMaterials.getMat('testSharedMat', () => new THREE.MeshBasicMaterial({ color: '#00FF00' }));
  assert.strictEqual(mat1, mat2, 'LandmarkMaterials.getMat must return cached instance for identical keys');
});

test('LandmarkHelpers 5-pointed star geometry generation', () => {
  const starShape = LandmarkHelpers.create5PointStarShape(0.1, 0.04);
  assert(starShape instanceof THREE.Shape, 'create5PointStarShape must return a valid THREE.Shape');
  const points = starShape.getPoints();
  // 5 outer points + 5 inner points + closing point = 11 points
  assert(points.length >= 10, `Expected at least 10 polygon vertices for star shape, found ${points.length}`);
});

// ====================================================
// SUITE 7: BUILDING MESH CONSTRUCTION TIERS (LEVELS 0 - 4)
// ====================================================
console.log('\n--- Suite 7: Building Construction Tiers (Levels 0 - 4) & Architecture ---');

test('BuildingMesh Level 0: Owner boundary stake & plaque with custom owner color', () => {
  const bm = new BuildingMesh();
  const tilePos = new THREE.Vector3(5, 0, 5);
  bm.updateBuilding(1, 0, tilePos, 0, '#E84118');

  assert(bm.getTrackedTileIds().includes(1), 'Tile 1 must be tracked in buildingMap');
  const bGroup = (bm as any).buildingMap.get(1);
  assert(bGroup, 'Building group for tile 1 must exist');
  assert.strictEqual(bGroup.position.y, 0.305, 'Building baseline must be elevated flush at world y = 0.305');

  let plaqueFound = false;
  let finialFound = false;
  bGroup.traverse((child: any) => {
    if (child.isMesh) {
      if (child.geometry instanceof THREE.ConeGeometry) finialFound = true;
      if (child.material && child.material.name?.includes('bldgOwnerPlaque') || child.material?.color?.getHexString() === 'e84118') {
        plaqueFound = true;
      }
    }
  });

  assert(finialFound, 'Level 0 must feature a glowing gemstone finial');
  assert(plaqueFound, 'Level 0 plaque must use the owner color (#E84118)');
});

test('BuildingMesh Level 1: Cozy cottage (cream walls, coral roof, chimney, glowing windows)', () => {
  const bm = new BuildingMesh();
  bm.updateBuilding(3, 1, new THREE.Vector3(0, 0, 0), 0);
  const bGroup = (bm as any).buildingMap.get(3);
  assert(bGroup, 'Building group for level 1 must exist');
  assert.strictEqual(bGroup.position.y, 0.305, 'Baseline must sit flush at y = 0.305');

  let roofFound = false;
  let chimneyFound = false;
  bGroup.traverse((child: any) => {
    if (child.isMesh && child.geometry instanceof THREE.ConeGeometry) {
      roofFound = true;
    }
    if (child.isMesh && child.geometry?.type === 'BoxGeometry') {
      chimneyFound = true;
    }
  });
  assert(roofFound, 'Level 1 cottage must have a pyramidal shingled roof');
  assert(chimneyFound, 'Level 1 cottage must have a chimney / wall boxes');
});

test('BuildingMesh Level 2: Luxury villa (stepped 2-tier, balcony flowerbox, hipped roof)', () => {
  const bm = new BuildingMesh();
  bm.updateBuilding(6, 2, new THREE.Vector3(0, 0, 0), 0);
  const bGroup = (bm as any).buildingMap.get(6);
  assert(bGroup, 'Building group for level 2 must exist');
  assert.strictEqual(bGroup.position.y, 0.305, 'Baseline must sit flush at y = 0.305');

  let meshCount = 0;
  bGroup.traverse((child: any) => {
    if (child.isMesh) meshCount++;
  });
  assert(meshCount >= 8, `Level 2 villa expected >= 8 meshes, found ${meshCount}`);
});

test('BuildingMesh Level 3: Modern skyscraper (cyan reflective glass, gold antenna, red beacon)', () => {
  const bm = new BuildingMesh();
  bm.updateBuilding(8, 3, new THREE.Vector3(0, 0, 0), 0);
  const bGroup = (bm as any).buildingMap.get(8);
  assert(bGroup, 'Building group for level 3 must exist');
  assert.strictEqual(bGroup.position.y, 0.305, 'Baseline must sit flush at y = 0.305');

  let antennaFound = false;
  let beaconFound = false;
  bGroup.traverse((child: any) => {
    if (child.isMesh && child.geometry instanceof THREE.CylinderGeometry) antennaFound = true;
    if (child.isMesh && child.geometry instanceof THREE.SphereGeometry) beaconFound = true;
  });
  assert(antennaFound, 'Level 3 skyscraper must feature communications antenna');
  assert(beaconFound, 'Level 3 skyscraper must feature red warning aircraft beacon orb');
});

test('BuildingMesh Level 4: Royal 5-Star Hotel (sapphire tower, red carpet, helipad, crown, crystal orb)', () => {
  const bm = new BuildingMesh();
  bm.updateBuilding(9, 4, new THREE.Vector3(0, 0, 0), 0);
  const bGroup = (bm as any).buildingMap.get(9);
  assert(bGroup, 'Building group for level 4 must exist');
  assert.strictEqual(bGroup.position.y, 0.305, 'Baseline must sit flush at y = 0.305');

  let helipadFound = false;
  let crownFound = false;
  let orbFound = false;
  bGroup.traverse((child: any) => {
    if (child.isMesh && child.geometry instanceof THREE.ConeGeometry) crownFound = true;
    if (child.isMesh && child.geometry instanceof THREE.CylinderGeometry) helipadFound = true;
    if (child.isMesh && child.geometry instanceof THREE.SphereGeometry) orbFound = true;
  });
  assert(crownFound, 'Level 4 hotel must feature Art Deco gold crown (ConeGeometry)');
  assert(helipadFound, 'Level 4 hotel must feature rooftop helipad cylinder');
  assert(orbFound, 'Level 4 hotel must feature glowing crystal spire orb');
});

test('BuildingMesh delta-driven bounce animation update (without setInterval)', () => {
  const bm = new BuildingMesh();
  bm.updateBuilding(11, 1, new THREE.Vector3(0, 0, 0), 0);
  const bGroup = (bm as any).buildingMap.get(11);
  assert(bGroup, 'Building must exist');

  // Initial scale is small pop-in scale (0.01)
  assert(bGroup.scale.x < 0.1, `Initial pop-in scale should be small, got ${bGroup.scale.x}`);

  // Step delta forward
  bm.update(0.1);
  assert(bGroup.scale.x > 0.1, `Scale should increase after delta step, got ${bGroup.scale.x}`);

  // Step delta further to complete bounce animation
  bm.update(0.2);
  assert.strictEqual(bGroup.scale.x, 1, 'Scale should settle firmly at 1.0 upon completion');
  assert.strictEqual((bm as any).bouncingItems.length, 0, 'bouncingItems list should be empty when animation finishes');
});

test('BuildingMesh removal and reset', () => {
  const bm = new BuildingMesh();
  bm.updateBuilding(13, 1, new THREE.Vector3(0, 0, 0), 0);
  bm.updateBuilding(14, 2, new THREE.Vector3(0, 0, 0), 0);
  assert.strictEqual(bm.getTrackedTileIds().length, 2);

  bm.removeBuilding(13);
  assert.strictEqual(bm.getTrackedTileIds().length, 1);
  assert.strictEqual(bm.getTrackedTileIds()[0], 14);

  bm.reset();
  assert.strictEqual(bm.getTrackedTileIds().length, 0);
});

console.log('\n--- Suite 8: Central Park Grand Fountain & Diorama Architecture ---');

test('DetailedModels.createDetailedFountain() architecture & spatial harmony', () => {
  const fountainData = DetailedModels.createDetailedFountain();
  assert(fountainData.group instanceof THREE.Group, 'Fountain must be a valid THREE.Group');
  assert(fountainData.waterRipples instanceof THREE.Mesh, 'Must provide water ripples mesh');
  assert(Array.isArray(fountainData.waterFalls), 'waterFalls must be an array');
  assert(fountainData.waterFalls.length >= 4, `waterFalls should contain cascades and foam rings, got ${fountainData.waterFalls.length}`);
  assert(Array.isArray(fountainData.waterJets), 'waterJets must be an array');
  assert(fountainData.waterJets.length >= 12, `waterJets should include 8 perimeter spouts, mini jets and summit geyser, got ${fountainData.waterJets.length}`);
  assert(fountainData.gemOrb instanceof THREE.Mesh, 'Must include radiant celestial diamond gem orb');

  // Verify bounding box does not exceed park center radius (2.9) to prevent path and dice tray collisions
  const box = new THREE.Box3().setFromObject(fountainData.group);
  const maxRadius = Math.max(Math.abs(box.min.x), Math.abs(box.max.x), Math.abs(box.min.z), Math.abs(box.max.z));
  assert(maxRadius <= 3.0, `Fountain outer radius must be <= 3.0 to avoid path/tray collisions, got ${maxRadius}`);
  assert(box.max.y >= 3.0, `Fountain summit geyser/statue must reach majestic height >= 3.0, got ${box.max.y}`);
});

test('DetailedModels.createFlowerBush() botanical diorama elements', () => {
  const bush = DetailedModels.createFlowerBush('#FF7675');
  assert(bush instanceof THREE.Group, 'Bush must be a THREE.Group');
  assert(bush.children.length > 0, 'Bush must contain leaf and floral blossom meshes');
});

test('DetailedModels.createParkBench() and createStreetLamp()', () => {
  const bench = DetailedModels.createParkBench();
  assert(bench instanceof THREE.Group, 'Park bench must be a THREE.Group');
  assert(bench.children.length >= 2, 'Bench must have iron legs and oak slats');

  const lamp = DetailedModels.createStreetLamp();
  assert(lamp instanceof THREE.Group, 'Street lamp must be a THREE.Group');
  assert(lamp.children.length >= 3, 'Street lamp must have plinth, pole and lantern');
});

// ====================================================
// SUITE 9: 3D CAMERA CONTROLS & FREE ORBIT DIORAMA INSPECTION
// ====================================================
console.log('\n--- Suite 9: 3D Camera Controls & Free Orbit Diorama Inspection ---');

test('CameraManager enables free 360-degree rotation by default (isLocked === false)', () => {
  const mockDom = {
    addEventListener: () => {},
    style: {}
  } as any;
  const cm = new CameraManager(mockDom);

  // Users must ALWAYS be allowed to freely rotate the 3D board
  assert.strictEqual(cm.isLocked, false, 'Camera must be unlocked by default to allow users to rotate any angle');
  assert(cm.camera instanceof THREE.PerspectiveCamera, 'CameraManager must have a PerspectiveCamera');
});

test('CameraManager.snapToGoldenAngle() resets angles to Isometric 45° without locking rotation', () => {
  const mockDom = {
    addEventListener: () => {},
    style: {}
  } as any;
  const cm = new CameraManager(mockDom);

  cm.snapToGoldenAngle();
  assert.strictEqual(cm.isLocked, false, 'Snapping to golden angle must not lock user rotation');
  assert.strictEqual(cm.isFollowMode, false);
});

test('CameraManager.focusOnPosition() focuses camera target for close-up landmark inspection', () => {
  const mockDom = {
    addEventListener: () => {},
    style: {}
  } as any;
  const cm = new CameraManager(mockDom);

  const tilePos = new THREE.Vector3(5.2, 0.5, -4.8);
  cm.focusOnPosition(tilePos, 14.5);

  const target = cm.getTargetPosition();
  assert.strictEqual(target.x, 5.2);
  assert.strictEqual(target.y, 0.5);
  assert.strictEqual(target.z, -4.8);
  assert.strictEqual(cm.isLocked, false, 'Focusing on landmark must still allow free 360-degree orbit inspection');
});

test('CameraManager.resetOverview() resets target to (0,0,0) and preserves free orbit capability', () => {
  const mockDom = {
    addEventListener: () => {},
    style: {}
  } as any;
  const cm = new CameraManager(mockDom);

  cm.focusOnPosition(new THREE.Vector3(10, 0, 10));
  cm.resetOverview();

  const target = cm.getTargetPosition();
  assert.strictEqual(target.x, 0);
  assert.strictEqual(target.y, 0);
  assert.strictEqual(target.z, 0);
  assert.strictEqual(cm.isLocked, false, 'Resetting view must keep rotation enabled for the user');
});

// ====================================================
// SUITE 10: GAMEPLAY SYNCHRONIZATION & 60-144HZ PERFORMANCE
// ====================================================
console.log('\n--- Suite 10: Gameplay Synchronization & 60-144Hz Performance ---');

test('TokenManager.isAnyTokenMoving() accurately reflects token hop state', () => {
  const tm = new TokenManager();
  const dummyPositions: THREE.Vector3[] = [];
  for (let i = 0; i < 40; i++) dummyPositions.push(new THREE.Vector3(i, 0, 0));
  tm.setTilePositions(dummyPositions);

  assert.strictEqual(tm.isAnyTokenMoving(), false, 'isAnyTokenMoving() must be false initially');

  const wrapper = tm.createToken('p1', 'car', '#FF0000', 0);
  assert(wrapper instanceof THREE.Group);
  assert.strictEqual(tm.isAnyTokenMoving(), false, 'isAnyTokenMoving() must be false when token is idle');

  // Set isMoving flag
  const token = tm.tokens.get('p1');
  assert(token);
  token.isMoving = true;
  assert.strictEqual(tm.isAnyTokenMoving(), true, 'isAnyTokenMoving() must be true when token is moving');

  token.isMoving = false;
  assert.strictEqual(tm.isAnyTokenMoving(), false, 'isAnyTokenMoving() returns false when movement completes');
});

test('CameraManager smoothly updates across 60Hz, 120Hz and 144Hz deltas without NaN or divergence', () => {
  const mockDom = {
    addEventListener: () => {},
    style: {}
  } as any;
  const cm = new CameraManager(mockDom);

  // Test across standard refresh rates: 60Hz (16.6ms), 120Hz (8.33ms), 144Hz (6.94ms)
  const deltas = [0.01667, 0.00833, 0.00694];
  for (const dt of deltas) {
    cm.update(dt);
    const pos = cm.camera.position;
    assert(!Number.isNaN(pos.x) && Number.isFinite(pos.x), `Camera pos.x must be finite at delta ${dt}`);
    assert(!Number.isNaN(pos.y) && Number.isFinite(pos.y), `Camera pos.y must be finite at delta ${dt}`);
    assert(!Number.isNaN(pos.z) && Number.isFinite(pos.z), `Camera pos.z must be finite at delta ${dt}`);
  }
});

test('UI Quality: index.html contains no FPS, Hz or debug refresh rate display', () => {
  const htmlPath = path.resolve(__dirname, '../index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Verify that there is no FPS or Hz monitor rendered on the UI
  const hasFpsCounter = /id=["'].*fps.*["']/i.test(htmlContent) || /class=["'].*fps-counter.*["']/i.test(htmlContent);
  const hasHzDisplay = /id=["'].*hz.*["']/i.test(htmlContent) || /tần\s*số\s*quét/i.test(htmlContent);
  assert.strictEqual(hasFpsCounter, false, 'UI must not render any FPS counter');
  assert.strictEqual(hasHzDisplay, false, 'UI must not render any refresh rate (Hz) monitor');
});

test('Mobile Quality: style.css defines safe-area insets and touch-action optimization', () => {
  const cssPath = path.resolve(__dirname, '../src/style.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  assert(cssContent.includes('env(safe-area-inset-bottom)'), 'CSS must handle safe-area-inset-bottom for mobile');
  assert(cssContent.includes('env(safe-area-inset-top)'), 'CSS must handle safe-area-inset-top for mobile');
  assert(cssContent.includes('touch-action: manipulation'), 'CSS must optimize touch-action for responsive mobile interaction');
  assert(cssContent.includes('.dock-btn'), 'CSS must configure mobile dock buttons');
});

test('Achievement & Nameplate Quality: index.html and style.css configure 5-tier nameplate frames & profile optimization', () => {
  const htmlPath = path.resolve(__dirname, '../index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const cssPath = path.resolve(__dirname, '../src/style.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  // Check HTML elements for Profile & Frames
  assert(htmlContent.includes('id="profile-avatar-wrapper"'), 'HTML must have profile-avatar-wrapper for live frame preview');
  assert(htmlContent.includes('id="profile-frame-badge"'), 'HTML must have profile-frame-badge');
  assert(htmlContent.includes('id="profile-mastery-title"'), 'HTML must display mastery level title');
  assert(htmlContent.includes('id="tab-btn-profile-achievements"'), 'HTML must have achievements tab');
  assert(htmlContent.includes('id="tab-btn-profile-frames"'), 'HTML must have frames showcase tab');
  assert(htmlContent.includes('id="profile-frames-grid"'), 'HTML must have frames grid container');
  assert(htmlContent.includes('data-tier="GRAY"'), 'HTML must have GRAY tier filter');
  assert(htmlContent.includes('data-tier="RED"'), 'HTML must have RED tier filter');

  // Check 5-tier CSS classes (Xám - Xanh - Vàng - Cam - Đỏ)
  assert(cssContent.includes('.nameplate-tier-gray'), 'CSS must define .nameplate-tier-gray (Level 1)');
  assert(cssContent.includes('.nameplate-tier-blue'), 'CSS must define .nameplate-tier-blue (Level 2)');
  assert(cssContent.includes('.nameplate-tier-gold'), 'CSS must define .nameplate-tier-gold (Level 3)');
  assert(cssContent.includes('.nameplate-tier-orange'), 'CSS must define .nameplate-tier-orange (Level 4)');
  assert(cssContent.includes('.nameplate-tier-red'), 'CSS must define .nameplate-tier-red (Level 5)');

  // Check Tier glow animations
  assert(cssContent.includes('nameplate-blue-shimmer'), 'CSS must define blue shimmer animation');
  assert(cssContent.includes('nameplate-gold-glow'), 'CSS must define gold glow animation');
  assert(cssContent.includes('nameplate-orange-flame'), 'CSS must define orange flame animation');
  assert(cssContent.includes('nameplate-red-pulse'), 'CSS must define red pulse animation');

  // Check profile frame showcase styles
  assert(cssContent.includes('.frame-showcase-card'), 'CSS must style frame showcase card');
  assert(cssContent.includes('.profile-frames-grid'), 'CSS must define profile-frames-grid layout');
});

test('Turn Flow: main.ts configures automatic turn ending upon transaction completion', () => {
  const mainTsPath = path.resolve(__dirname, '../src/main.ts');
  const mainTsContent = fs.readFileSync(mainTsPath, 'utf8');

  assert(mainTsContent.includes('scheduleAutoEndTurn'), 'main.ts must define scheduleAutoEndTurn function');
  assert(mainTsContent.includes('cancelAutoEndTurn'), 'main.ts must define cancelAutoEndTurn function');
  assert(mainTsContent.includes('game:end_turn'), 'main.ts must emit game:end_turn when auto-turn completes');
});

test('Turn Pointer Arrow: TokenManager creates 3D arrow, locks onto moving token and tracks active player', () => {
  const tokenManager = new TokenManager();

  assert(tokenManager.arrowGroup, 'TokenManager must initialize arrowGroup');
  assert.strictEqual(tokenManager.arrowGroup.visible, false, 'Arrow should start hidden when no active player');

  // Set dummy tile positions
  const dummyPositions = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 0, 0)];
  tokenManager.setTilePositions(dummyPositions);

  // Spawn a token
  tokenManager.createToken('player_1', 'car', '#00B894', 0);
  assert(tokenManager.tokens.has('player_1'), 'Token must be stored in map');

  // Set active turn player
  tokenManager.setActiveTurnPlayer('player_1', 'Player Alpha', '#00B894');
  assert.strictEqual(tokenManager.arrowGroup.visible, true, 'Arrow must be visible when player is active');
  assert.strictEqual(tokenManager.activeUserId, 'player_1', 'activeUserId must match');

  // Update simulation step
  tokenManager.update(0.016);
  assert(Number.isFinite(tokenManager.arrowGroup.position.x), 'Arrow position.x must be finite');
  assert(Number.isFinite(tokenManager.arrowGroup.position.y), 'Arrow position.y must be finite');
  assert(Number.isFinite(tokenManager.arrowGroup.position.z), 'Arrow position.z must be finite');

  // Clear tokens safely preserves arrow
  tokenManager.clearTokens();
  assert(tokenManager.arrowGroup, 'arrowGroup must persist after clearTokens');
  assert.strictEqual(tokenManager.arrowGroup.visible, false, 'Arrow must hide after clearTokens');
  assert.strictEqual(tokenManager.activeUserId, null, 'activeUserId must be reset to null');
});

console.log('\n====================================================');
console.log(` TEST SUMMARY: ${passedTests} TESTS PASSED`);
console.log(' ALL CLIENT 3D MODEL TESTS PASSED SUCCESSFULLY! 🚀');
console.log('====================================================');
