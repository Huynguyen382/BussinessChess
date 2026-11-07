import * as THREE from 'three';

export interface FloatingText {
  element: HTMLDivElement;
  worldPos: THREE.Vector3;
  velocity: number;
  opacity: number;
  life: number;
}

export class VFXManager {
  public scene: THREE.Scene;
  private camera: THREE.Camera;
  private domContainer: HTMLElement;
  private particleGroup: THREE.Group;
  private floatingTexts: FloatingText[] = [];

  // Shockwave rings pool
  private shockwaves: { mesh: THREE.Mesh; scale: number; maxScale: number; alpha: number }[] = [];

  // Star dust particles
  private starParticles: THREE.Points | null = null;
  private starPositions: Float32Array = new Float32Array(0);
  private starVelocities: THREE.Vector3[] = [];
  private starAlphas: Float32Array = new Float32Array(0);
  private activeStarCount: number = 0;
  private maxStars: number = 60;

  // Camera Shake
  private shakeIntensity: number = 0;
  private shakeDecay: number = 0.9;
  public cameraShakeOffset: THREE.Vector3 = new THREE.Vector3();

  constructor(scene: THREE.Scene, camera: THREE.Camera, domContainer: HTMLElement) {
    this.scene = scene;
    this.camera = camera;
    this.domContainer = domContainer;
    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);

    this.initStarParticles();
  }

  private initStarParticles() {
    const geo = new THREE.BufferGeometry();
    this.starPositions = new Float32Array(this.maxStars * 3);
    this.starAlphas = new Float32Array(this.maxStars);

    for (let i = 0; i < this.maxStars; i++) {
      this.starPositions[i * 3] = 0;
      this.starPositions[i * 3 + 1] = -100; // hide below
      this.starPositions[i * 3 + 2] = 0;
      this.starVelocities.push(new THREE.Vector3());
      this.starAlphas[i] = 0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(this.starPositions, 3));

    // Create custom Canvas Texture for star sparkle
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(32, 32, 18, 0, Math.PI * 2);
    ctx.fill();

    const starTexture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.PointsMaterial({
      size: 0.6,
      map: starTexture,
      transparent: true,
      color: 0xFDCB6E, // Gold
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starParticles = new THREE.Points(geo, mat);
    this.particleGroup.add(this.starParticles);
  }

  // Bắn hạt sao lấp lánh khi xí ngầu va chạm hoặc nhận thưởng
  public spawnStarBurst(pos: THREE.Vector3, count = 18, colorHex = 0xFDCB6E) {
    if (!this.starParticles) return;
    const posAttr = this.starParticles.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < count; i++) {
      const idx = (this.activeStarCount + i) % this.maxStars;
      posAttr.setXYZ(idx, pos.x, pos.y + 0.2, pos.z);

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 2.2;
      this.starVelocities[idx].set(
        Math.cos(angle) * speed,
        2.5 + Math.random() * 2.5,
        Math.sin(angle) * speed
      );
    }
    this.activeStarCount = (this.activeStarCount + count) % this.maxStars;
    posAttr.needsUpdate = true;
  }

  // Vòng sóng ánh sáng lan tỏa (Shockwave Ring) khi đặt nhà hoặc xúc xắc đáp đất
  public spawnShockwave(pos: THREE.Vector3, color = '#00B894', maxScale = 2.4) {
    const ringGeo = new THREE.RingGeometry(0.3, 0.45, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(pos.x, pos.y + 0.05, pos.z);

    this.particleGroup.add(ring);
    this.shockwaves.push({
      mesh: ring,
      scale: 0.2,
      maxScale,
      alpha: 0.9
    });
  }

  // Rung màn hình nhẹ (Screen Micro-shake)
  public triggerCameraShake(intensity = 0.35) {
    this.shakeIntensity = intensity;
  }

  // Floating 3D Text nảy số tiền (+500M xanh lá / -200M đỏ) bay lên
  public spawnFloatingText(text: string, worldPos: THREE.Vector3, isPositive = true) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = `
      position: absolute;
      font-family: 'Fredoka', sans-serif;
      font-weight: 900;
      font-size: 1.4rem;
      color: ${isPositive ? '#00B894' : '#D63031'};
      text-shadow: 0 2px 8px rgba(0,0,0,0.25), 0 0 12px ${isPositive ? 'rgba(0,184,148,0.4)' : 'rgba(214,48,49,0.4)'};
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: transform 0.05s linear;
      z-index: 1000;
    `;
    this.domContainer.appendChild(el);

    this.floatingTexts.push({
      element: el,
      worldPos: worldPos.clone().add(new THREE.Vector3(0, 1.2, 0)),
      velocity: 1.2,
      opacity: 1.0,
      life: 1.4
    });
  }

  public update(delta: number) {
    // 1. Update Camera Shake
    if (this.shakeIntensity > 0.01) {
      this.cameraShakeOffset.set(
        (Math.random() - 0.5) * this.shakeIntensity,
        (Math.random() - 0.5) * this.shakeIntensity * 0.5,
        (Math.random() - 0.5) * this.shakeIntensity
      );
      this.shakeIntensity *= Math.pow(this.shakeDecay, delta * 60);
    } else {
      this.cameraShakeOffset.set(0, 0, 0);
      this.shakeIntensity = 0;
    }

    // 2. Update Star Particles
    if (this.starParticles) {
      const posAttr = this.starParticles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < this.maxStars; i++) {
        let y = posAttr.getY(i);
        if (y > -50) {
          const vel = this.starVelocities[i];
          posAttr.setXYZ(
            i,
            posAttr.getX(i) + vel.x * delta,
            y + vel.y * delta,
            posAttr.getZ(i) + vel.z * delta
          );
          vel.y -= 9.8 * delta; // Gravity
          vel.x *= 0.96;
          vel.z *= 0.96;

          if (y < 0.1) {
            posAttr.setY(i, -100); // Disappear below
          }
        }
      }
      posAttr.needsUpdate = true;
    }

    // 3. Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.scale += delta * 3.5;
      sw.alpha -= delta * 1.4;

      sw.mesh.scale.set(sw.scale, sw.scale, 1);
      (sw.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, sw.alpha);

      if (sw.alpha <= 0 || sw.scale >= sw.maxScale) {
        this.particleGroup.remove(sw.mesh);
        sw.mesh.geometry.dispose();
        (sw.mesh.material as THREE.Material).dispose();
        this.shockwaves.splice(i, 1);
      }
    }

    // 4. Update Floating 3D Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= delta;
      ft.worldPos.y += ft.velocity * delta;
      ft.velocity *= 0.95;
      ft.opacity = Math.max(0, ft.life / 1.4);

      // Project world coordinates to screen pixels
      const screenPos = ft.worldPos.clone().project(this.camera);
      const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;

      ft.element.style.left = `${x}px`;
      ft.element.style.top = `${y}px`;
      ft.element.style.opacity = `${ft.opacity}`;
      ft.element.style.transform = `translate(-50%, -50%) scale(${0.8 + (1 - ft.opacity) * 0.5})`;

      if (ft.life <= 0) {
        this.domContainer.removeChild(ft.element);
        this.floatingTexts.splice(i, 1);
      }
    }
  }
}
