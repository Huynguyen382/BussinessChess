// Polyfill minimal browser DOM globals for Three.js headless execution in Node.js
if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElement: (tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 256,
          height: 256,
          getContext: () => ({
            createRadialGradient: () => ({ addColorStop: () => {} }),
            createLinearGradient: () => ({ addColorStop: () => {} }),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            fillRect: () => {},
            strokeRect: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            stroke: () => {},
            closePath: () => {}
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
import { BoardEnvironment } from '../src/three/BoardEnvironment';

console.log('====================================================');
console.log(' RUNNING BOARD LIGHTING & ENVIRONMENT AUTOMATED TESTS');
console.log('====================================================\n');

let passedTests = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✖ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('--- Suite 1: Board Environment & Architecture Hierarchy ---');

test('BoardEnvironment initializes all scene groups and root props', () => {
  const scene = new THREE.Scene();
  const env = new BoardEnvironment(scene);

  assert(env instanceof BoardEnvironment, 'BoardEnvironment must be an instance');
  assert(env.fountainRipples instanceof THREE.Mesh, 'Fountain water ripples must be instantiated');
  assert(Array.isArray(env.fountainWaterfalls) && env.fountainWaterfalls.length >= 4, 'Fountain waterfalls must exist');
  assert(Array.isArray(env.fountainWaterJets) && env.fountainWaterJets.length >= 12, 'Fountain water jets must exist');
  assert(env.fountainSpray instanceof THREE.Points, 'Fountain summit spray particles must exist');
  assert(env.miniTaxi instanceof THREE.Group, 'Mini taxi vehicle must exist');
  assert(env.miniBus instanceof THREE.Group, 'Mini bus transit vehicle must exist');
  assert(env.parkTrees.length === 4, 'Must have 4 stylized park trees');
});

console.log('\n--- Suite 2: Animated Water Shader & Island Horizon ---');

test('Animated Water Shader mesh and GLSL material initialization', () => {
  const scene = new THREE.Scene();
  const env = new BoardEnvironment(scene);

  assert(env.waterShaderMesh instanceof THREE.Mesh, 'waterShaderMesh must be a valid THREE.Mesh');
  assert(env.waterMaterial instanceof THREE.ShaderMaterial, 'waterMaterial must be a THREE.ShaderMaterial');

  const uniforms = env.waterMaterial.uniforms;
  assert(uniforms.uTime !== undefined, 'Uniform uTime must be defined');
  assert(uniforms.uSunDirection !== undefined, 'Uniform uSunDirection must be defined');
  assert(uniforms.uSunColor !== undefined, 'Uniform uSunColor must be defined');
  assert(uniforms.uDepthColor !== undefined, 'Uniform uDepthColor must be defined');
  assert(uniforms.uSurfaceColor !== undefined, 'Uniform uSurfaceColor must be defined');
  assert(uniforms.uFoamColor !== undefined, 'Uniform uFoamColor must be defined');
  assert(uniforms.uCameraPosition !== undefined, 'Uniform uCameraPosition must be defined');

  // Verify sun direction update
  const sunDir = new THREE.Vector3(26, 42, 24);
  env.setSunDirection(sunDir);
  const normalizedSun = sunDir.clone().normalize();
  assert.strictEqual(
    Math.round(uniforms.uSunDirection.value.x * 100),
    Math.round(normalizedSun.x * 100),
    'Sun direction uniform must be normalized'
  );
});

test('Warm Golden Celestial Sky Dome initialization', () => {
  const scene = new THREE.Scene();
  const env = new BoardEnvironment(scene);

  assert(env.skyDome instanceof THREE.Mesh, 'Celestial sky dome must exist');
  assert(env.skyDome.geometry instanceof THREE.SphereGeometry, 'Sky dome must use SphereGeometry');
  assert((env.skyDome.material as THREE.MeshBasicMaterial).side === THREE.BackSide, 'Sky dome must render on BackSide');
});

console.log('\n--- Suite 3: Atmospheric Particles & Ambience ---');

test('Central park sun motes / fireflies particle system', () => {
  const scene = new THREE.Scene();
  const env = new BoardEnvironment(scene);

  assert(env.parkFireflies instanceof THREE.Points, 'parkFireflies must be THREE.Points');
  const posAttr = env.parkFireflies.geometry.attributes.position;
  const colAttr = env.parkFireflies.geometry.attributes.color;

  assert(posAttr && posAttr.count >= 80, `Expected at least 80 fireflies, got ${posAttr.count}`);
  assert(colAttr && colAttr.count >= 80, 'Fireflies must have vertex colors attribute');

  // Check initial coordinates are finite and bounded within park perimeter
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);
    assert(Number.isFinite(x) && !Number.isNaN(x), `Firefly ${i} x must be finite`);
    assert(Number.isFinite(y) && !Number.isNaN(y), `Firefly ${i} y must be finite`);
    assert(Number.isFinite(z) && !Number.isNaN(z), `Firefly ${i} z must be finite`);
    const r = Math.hypot(x, z);
    assert(r <= 5.5, `Firefly ${i} must stay within central park radius (r=${r} <= 5.5)`);
  }
});

test('Soft volumetric diorama haze group initialization', () => {
  const scene = new THREE.Scene();
  const env = new BoardEnvironment(scene);

  assert(env.volumetricHazeGroup instanceof THREE.Group, 'volumetricHazeGroup must be instantiated');
  assert(env.volumetricHazeGroup.children.length === 3, 'Must feature 3 layered horizontal haze discs');
  env.volumetricHazeGroup.children.forEach((child, idx) => {
    assert(child instanceof THREE.Mesh, `Haze layer ${idx} must be a THREE.Mesh`);
    assert((child.material as THREE.MeshBasicMaterial).transparent, `Haze layer ${idx} must be transparent`);
  });
});

console.log('\n--- Suite 4: 60-144Hz Smooth Animation & Finite Math Stability ---');

test('Simulation update loop across 60Hz, 120Hz, and 144Hz deltas without NaN', () => {
  const scene = new THREE.Scene();
  const env = new BoardEnvironment(scene);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 32, 36);

  const testDeltas = [0.01667, 0.00833, 0.00694]; // 60Hz, 120Hz, 144Hz
  let elapsedTime = 0;

  for (const dt of testDeltas) {
    for (let step = 0; step < 20; step++) {
      elapsedTime += dt;
      env.update(dt, elapsedTime, camera);

      // Verify water shader uniform time
      assert.strictEqual(
        env.waterMaterial!.uniforms.uTime.value,
        elapsedTime,
        'uTime uniform must match elapsed time'
      );

      // Verify taxi position is finite
      assert(Number.isFinite(env.miniTaxi!.position.x), 'Taxi position.x must be finite');
      assert(Number.isFinite(env.miniTaxi!.position.z), 'Taxi position.z must be finite');

      // Verify bus position is finite
      assert(Number.isFinite(env.miniBus!.position.x), 'Bus position.x must be finite');
      assert(Number.isFinite(env.miniBus!.position.z), 'Bus position.z must be finite');

      // Verify fireflies are finite
      const fireflies = env.parkFireflies!.geometry.attributes.position;
      for (let i = 0; i < Math.min(fireflies.count, 10); i++) {
        assert(Number.isFinite(fireflies.getX(i)), `Firefly pos.x must be finite at step ${step}`);
        assert(Number.isFinite(fireflies.getY(i)), `Firefly pos.y must be finite at step ${step}`);
        assert(Number.isFinite(fireflies.getZ(i)), `Firefly pos.z must be finite at step ${step}`);
      }
    }
  }
});

console.log('\n--- Suite 5: Clean Focus Mode & Decluttering ---');

test('setFocusMode() toggles visibility of secondary background anim props', () => {
  const scene = new THREE.Scene();
  const env = new BoardEnvironment(scene);

  // Default state: all props visible
  assert.strictEqual(env.miniTaxi?.visible, true);
  assert.strictEqual(env.miniBus?.visible, true);
  assert.strictEqual(env.parkFireflies?.visible, true);
  assert.strictEqual(env.volumetricHazeGroup?.visible, true);

  // Enable Clean Focus Mode (declutter for competitive clarity)
  env.setFocusMode(true);
  assert.strictEqual(env.miniTaxi?.visible, false);
  assert.strictEqual(env.miniBus?.visible, false);
  assert.strictEqual(env.parkFireflies?.visible, false);
  assert.strictEqual(env.volumetricHazeGroup?.visible, false);

  // Disable Focus Mode
  env.setFocusMode(false);
  assert.strictEqual(env.miniTaxi?.visible, true);
  assert.strictEqual(env.miniBus?.visible, true);
  assert.strictEqual(env.parkFireflies?.visible, true);
  assert.strictEqual(env.volumetricHazeGroup?.visible, true);
});

console.log('\n--- Suite 6: Memory Safety & Resource Disposal ---');

test('dispose() cleans up WebGL geometries, materials, and textures without throwing', () => {
  const scene = new THREE.Scene();
  const env = new BoardEnvironment(scene);

  const initialChildrenCount = scene.children.length;
  assert(initialChildrenCount > 0, 'Scene should contain environment groups');

  // Call dispose
  assert.doesNotThrow(() => {
    env.dispose();
  }, 'dispose() must run cleanly without throwing any error');

  // Verify groups are removed from scene
  assert.strictEqual(scene.children.length, 0, 'All environment groups must be removed from scene');
});

console.log('\n====================================================');
console.log(` TEST SUMMARY: ${passedTests} TESTS PASSED`);
console.log(' ALL BOARD LIGHTING & ENVIRONMENT TESTS PASSED! 🚀');
console.log('====================================================\n');
