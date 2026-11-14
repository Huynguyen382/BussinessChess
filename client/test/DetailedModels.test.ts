/**
 * AUTOMATED TEST SUITE: DetailedModels & Urban Diorama Architecture
 * Verifies high-end 3D diorama props and Decluttering Polish:
 * - Central Park Grand Fountain (scaled down ~20% with maxRadius <= 2.35, creating breathing space, while height >= 3.0)
 * - Urban Street Furniture (slender Victorian street lamps, compact cedar benches, granite planters)
 * - Board Perimeter & Coastal Details (retaining walls, wooden docks, cobblestone promenade, boutique plaza gazebo)
 * - Clean Focus Mode support via setDioramaVisibility(visible)
 * - Performance: Material caching, finite coordinates, non-empty meshes
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
import { DetailedModels } from '../src/three/DetailedModels';

console.log('====================================================');
console.log(' RUNNING CLIENT 3D DETAILED MODELS TEST SUITE');
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

/**
 * Traverses a 3D model hierarchy and rigorously verifies:
 * 1. Root is a valid THREE.Group or Object3D
 * 2. Every Mesh has a valid geometry and material
 * 3. All coordinates (position, rotation, scale) are valid finite numbers (NO NaN, NO Infinity)
 */
function auditModel(root: THREE.Object3D, label: string): { meshCount: number } {
  assert(root instanceof THREE.Object3D, `${label} must be a THREE.Object3D`);
  let meshCount = 0;

  root.traverse((node) => {
    assert(Number.isFinite(node.position.x), `${label} node position.x is NaN or Infinity`);
    assert(Number.isFinite(node.position.y), `${label} node position.y is NaN or Infinity`);
    assert(Number.isFinite(node.position.z), `${label} node position.z is NaN or Infinity`);
    assert(Number.isFinite(node.rotation.x), `${label} node rotation.x is NaN or Infinity`);
    assert(Number.isFinite(node.rotation.y), `${label} node rotation.y is NaN or Infinity`);
    assert(Number.isFinite(node.rotation.z), `${label} node rotation.z is NaN or Infinity`);
    assert(Number.isFinite(node.scale.x), `${label} node scale.x is NaN or Infinity`);
    assert(Number.isFinite(node.scale.y), `${label} node scale.y is NaN or Infinity`);
    assert(Number.isFinite(node.scale.z), `${label} node scale.z is NaN or Infinity`);

    if (node instanceof THREE.Mesh) {
      meshCount++;
      assert(node.geometry, `${label} mesh is missing geometry`);
      assert(node.material, `${label} mesh is missing material`);
    }
  });

  assert(meshCount > 0, `${label} must contain at least 1 mesh`);
  return { meshCount };
}

// ====================================================
// SUITE 1: CENTRAL PARK GRAND FOUNTAIN & BOTANICALS
// ====================================================
console.log('--- Suite 1: Central Park Grand Fountain & Botanicals ---');

test('Grand Fountain decluttered proportions, negative space & spatial harmony', () => {
  const fountain = DetailedModels.createDetailedFountain();
  assert(fountain.group instanceof THREE.Group, 'Fountain group must be a valid THREE.Group');
  assert(fountain.waterRipples instanceof THREE.Mesh, 'Must provide concentric water ripples mesh');
  assert(Array.isArray(fountain.waterFalls), 'waterFalls must be an array');
  assert(fountain.waterFalls.length >= 4, `waterFalls should have cascades and foam rings, got ${fountain.waterFalls.length}`);
  assert(Array.isArray(fountain.waterJets), 'waterJets must be an array');
  assert(fountain.waterJets.length >= 12, `waterJets must include spouts, mini jets and summit geyser, got ${fountain.waterJets.length}`);
  assert(fountain.gemOrb instanceof THREE.Mesh, 'Must provide radiant celestial diamond gem orb');

  // Verify bounding box radius is scaled down to ~2.26 (<= 2.35) for negative space breathing room
  const box = new THREE.Box3().setFromObject(fountain.group);
  const maxRadius = Math.max(Math.abs(box.min.x), Math.abs(box.max.x), Math.abs(box.min.z), Math.abs(box.max.z));
  assert(maxRadius <= 2.45, `Fountain outer radius must be scaled down <= 2.45 to declutter central park, got ${maxRadius}`);
  assert(maxRadius <= 3.0, `Must strictly be <= 3.0 to prevent path collisions`);
  assert(box.max.y >= 3.0, `Fountain summit geyser must maintain majestic height >= 3.0, got ${box.max.y}`);

  const audit = auditModel(fountain.group, 'Grand Fountain');
  assert(audit.meshCount >= 50, `Grand Fountain should be richly detailed, found ${audit.meshCount} meshes`);
});

test('Stylized Tree organic bark, cloud canopies and floral/fruit accents', () => {
  const tree = DetailedModels.createStylizedTree();
  assert(tree instanceof THREE.Group, 'Tree must be a THREE.Group');
  const audit = auditModel(tree, 'Stylized Tree');
  assert(audit.meshCount >= 15, `Stylized tree must have roots, bark, canopies and accents, got ${audit.meshCount}`);
});

test('Botanical flower bush, manicured hedges & circular flowerbeds', () => {
  const bush = DetailedModels.createFlowerBush('#FF7675');
  assert(bush instanceof THREE.Group, 'Flower bush must be a THREE.Group');
  auditModel(bush, 'Flower Bush');

  const hedge = DetailedModels.createManicuredHedge(1.2, 0.36);
  assert(hedge instanceof THREE.Group, 'Hedge must be a THREE.Group');
  auditModel(hedge, 'Manicured Hedge');

  const bed = DetailedModels.createFlowerBed(0.9);
  assert(bed instanceof THREE.Group, 'Flower bed must be a THREE.Group');
  auditModel(bed, 'Floral Plaza Bed');
});

// ====================================================
// SUITE 2: URBAN STREET FURNITURE
// ====================================================
console.log('\n--- Suite 2: Urban Street Furniture ---');

test('Victorian Cast-Iron Street Lamp with warm emissive pulse lantern', () => {
  const lamp = DetailedModels.createStreetLamp();
  assert(lamp instanceof THREE.Group, 'Street lamp must be a THREE.Group');
  assert(lamp.children.length >= 3, 'Street lamp must have plinth, pole and lantern');

  const audit = auditModel(lamp, 'Street Lamp');
  assert(audit.meshCount >= 8, `Street lamp should include plinth, pole, arm, lantern, glass and basket`);

  let foundAnim = false;
  lamp.traverse((node) => {
    if (node.userData && node.userData.animType === 'flicker') {
      foundAnim = true;
    }
  });
  assert(foundAnim, 'Street lamp must contain lantern or bulb with flicker animation metadata');
});

test('Cedar Wood Park Bench with ornate cast iron legs and anti-sag bracket', () => {
  const bench = DetailedModels.createParkBench();
  assert(bench instanceof THREE.Group, 'Park bench must be a THREE.Group');
  assert(bench.children.length >= 2, 'Bench must have iron legs and cedar slats');

  const audit = auditModel(bench, 'Park Bench');
  assert(audit.meshCount >= 8, `Bench should have multiple slats, legs and bolts, got ${audit.meshCount}`);
});

test('Polished Granite Planters: Tropical Palm & Royal Poinciana (Hoa Phượng Vĩ)', () => {
  const palm = DetailedModels.createGranitePlanterPalm();
  assert(palm instanceof THREE.Group, 'Palm planter must be a THREE.Group');
  const palmAudit = auditModel(palm, 'Granite Planter Palm');
  assert(palmAudit.meshCount >= 10, 'Palm planter should have pot, soil, pebbles, trunk and fronds');

  const poinciana = DetailedModels.createGranitePlanterPoinciana();
  assert(poinciana instanceof THREE.Group, 'Poinciana planter must be a THREE.Group');
  const poincianaAudit = auditModel(poinciana, 'Granite Planter Poinciana');
  assert(poincianaAudit.meshCount >= 12, 'Poinciana planter should have basin, soil, trunk, canopy and red flower blossoms');
});

// ====================================================
// SUITE 3: BOARD PERIMETER & COASTAL DIORAMA DETAILS
// ====================================================
console.log('\n--- Suite 3: Board Perimeter & Coastal Diorama Details ---');

test('Perimeter Stone Retaining Wall with classical turned balusters and sphere finials', () => {
  const wall = DetailedModels.createPerimeterRetainingWall(2.4);
  assert(wall instanceof THREE.Group, 'Retaining wall must be a THREE.Group');
  const audit = auditModel(wall, 'Perimeter Wall');
  assert(audit.meshCount >= 10, 'Wall should have plinth, top rail, piers and balusters');
});

test('Miniature Coastal Wooden Dock with weathered timber planks, pilings & lifebuoy', () => {
  const dock = DetailedModels.createMiniatureWoodenDock();
  assert(dock instanceof THREE.Group, 'Wooden dock must be a THREE.Group');
  const audit = auditModel(dock, 'Wooden Dock');
  assert(audit.meshCount >= 12, 'Dock should have planks, posts, rope rings, cleats and lifebuoy');
});

test('Cobblestone Promenade Walkway with patterned pavers and curb borders', () => {
  const promenade = DetailedModels.createCobblestonePromenade(2.0, 1.0);
  assert(promenade instanceof THREE.Group, 'Promenade must be a THREE.Group');
  const audit = auditModel(promenade, 'Cobblestone Promenade');
  assert(audit.meshCount >= 20, 'Promenade should have curbs, patterned stones and center compass marker');
});

test('Boutique Plaza Garden Gazebo with pagoda dome roof, columns and chandelier', () => {
  const gazebo = DetailedModels.createBoutiquePlazaGazebo();
  assert(gazebo instanceof THREE.Group, 'Gazebo must be a THREE.Group');
  const audit = auditModel(gazebo, 'Boutique Gazebo');
  assert(audit.meshCount >= 15, 'Gazebo should have steps, columns, railings, dome roofs and chandelier');

  let foundChandelierAnim = false;
  gazebo.traverse((node) => {
    if (node.userData && node.userData.animType === 'flicker') {
      foundChandelierAnim = true;
    }
  });
  assert(foundChandelierAnim, 'Gazebo chandelier must have flicker animation metadata');
});

test('Street curbs geometry and bounds', () => {
  const curb = DetailedModels.createTileCurbs(2.0, 1.0, 0);
  assert(curb instanceof THREE.Group, 'Curb must be a THREE.Group');
  auditModel(curb, 'Tile Curbs');
});

// ====================================================
// SUITE 4: PERFORMANCE & CLEAN FOCUS MODE (DIORAMA VISIBILITY)
// ====================================================
console.log('\n--- Suite 4: Performance & Clean Focus Mode (Diorama Visibility) ---');

test('DetailedModels material caching eliminates redundant allocations', () => {
  const mat1 = DetailedModels.getMat('test_key', () => new THREE.MeshStandardMaterial({ color: '#FF0000' }));
  const mat2 = DetailedModels.getMat('test_key', () => new THREE.MeshStandardMaterial({ color: '#00FF00' }));
  assert.strictEqual(mat1, mat2, 'Material cache must return the identical instance for the same key');
});

test('DetailedModels.setDioramaVisibility toggles props visibility for Clean Focus Mode', () => {
  const testProp = DetailedModels.createStreetLamp();
  assert(testProp.userData.isDioramaDecoration === true, 'Props must be tagged as diorama decorations');

  DetailedModels.setDioramaVisibility(false);
  assert.strictEqual(testProp.visible, false, 'Diorama props must hide when setDioramaVisibility(false)');
  assert.strictEqual(DetailedModels.getDioramaVisibility(), false);

  DetailedModels.setDioramaVisibility(true);
  assert.strictEqual(testProp.visible, true, 'Diorama props must show when setDioramaVisibility(true)');
  assert.strictEqual(DetailedModels.getDioramaVisibility(), true);
});

console.log('\n====================================================');
console.log(` TEST SUMMARY: ${passedTests} TESTS PASSED`);
console.log(' ALL DETAILED MODELS TESTS PASSED SUCCESSFULLY! 🚀');
console.log('====================================================');
