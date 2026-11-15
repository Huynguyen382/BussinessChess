import * as THREE from 'three';
import confetti from 'canvas-confetti';

export interface FloatingText {
  element: HTMLDivElement;
  worldPos: THREE.Vector3;
  velocity: number;
  opacity: number;
  life: number;
}

export interface SmokeParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotationSpeed: number;
  scale: number;
  maxScale: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface FireworkParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: THREE.Color;
  alpha: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface ConfettiParticle3D {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotVelocity: THREE.Vector3;
  life: number;
  maxLife: number;
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
  private maxStars: number = 80;
  private hasActiveStars: boolean = false;

  // Train Smoke System
  private smokeParticles: SmokeParticle[] = [];
  private smokeTexture: THREE.CanvasTexture | null = null;

  // 3D Firework Bursts System
  private fireworkPoints: THREE.Points | null = null;
  private fireworkPositions: Float32Array = new Float32Array(0);
  private fireworkColors: Float32Array = new Float32Array(0);
  private fireworkParticles: FireworkParticle[] = [];
  private maxFireworks: number = 240;

  // 3D Confetti Ribbons
  private confetti3DList: ConfettiParticle3D[] = [];

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
    this.initSmokeTexture();
    this.initFireworkSystem();
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

    // Custom Canvas Texture for star sparkle
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
      size: 0.65,
      map: starTexture,
      transparent: true,
      color: 0xFDCB6E, // Gold
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starParticles = new THREE.Points(geo, mat);
    this.particleGroup.add(this.starParticles);
  }

  private initSmokeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.4, 'rgba(230, 235, 240, 0.6)');
    grad.addColorStop(0.8, 'rgba(210, 218, 226, 0.2)');
    grad.addColorStop(1, 'rgba(200, 210, 220, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();

    this.smokeTexture = new THREE.CanvasTexture(canvas);
  }

  private initFireworkSystem() {
    const geo = new THREE.BufferGeometry();
    this.fireworkPositions = new Float32Array(this.maxFireworks * 3);
    this.fireworkColors = new Float32Array(this.maxFireworks * 3);

    for (let i = 0; i < this.maxFireworks; i++) {
      this.fireworkPositions[i * 3] = 0;
      this.fireworkPositions[i * 3 + 1] = -200;
      this.fireworkPositions[i * 3 + 2] = 0;

      this.fireworkColors[i * 3] = 1;
      this.fireworkColors[i * 3 + 1] = 1;
      this.fireworkColors[i * 3 + 2] = 1;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(this.fireworkPositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.fireworkColors, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 28);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const fTexture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      map: fTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.fireworkPoints = new THREE.Points(geo, mat);
    this.particleGroup.add(this.fireworkPoints);
  }

  // Bắn hạt sao lấp lánh khi xí ngầu va chạm hoặc nhận thưởng
  public spawnStarBurst(pos: THREE.Vector3, count = 22, colorHex = 0xFDCB6E) {
    if (!this.starParticles) return;
    const posAttr = this.starParticles.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < count; i++) {
      const idx = (this.activeStarCount + i) % this.maxStars;
      posAttr.setXYZ(idx, pos.x, pos.y + 0.3, pos.z);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 2.8;
      this.starVelocities[idx].set(
        Math.cos(angle) * speed,
        3.0 + Math.random() * 3.0,
        Math.sin(angle) * speed
      );
    }
    this.activeStarCount = (this.activeStarCount + count) % this.maxStars;
    this.hasActiveStars = true;
    posAttr.needsUpdate = true;
  }

  // Vòng sóng ánh sáng lan tỏa (Shockwave Ring) khi đặt nhà hoặc xúc xắc đáp đất
  public spawnShockwave(pos: THREE.Vector3, color = '#00B894', maxScale = 2.8) {
    const ringGeo = new THREE.RingGeometry(0.35, 0.52, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(pos.x, pos.y + 0.06, pos.z);

    this.particleGroup.add(ring);
    this.shockwaves.push({
      mesh: ring,
      scale: 0.2,
      maxScale,
      alpha: 0.95
    });
  }

  // Vệt tia lửa ma sát bánh máy bay đáp đường băng & đèn hiệu dẫn đường (Jet Landing Sparkles)
  public spawnJetLandingSparkles(pos: THREE.Vector3, count = 36) {
    if (!this.starParticles) return;
    const posAttr = this.starParticles.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < count; i++) {
      const idx = (this.activeStarCount + i) % this.maxStars;
      posAttr.setXYZ(idx, pos.x + (Math.random() - 0.5) * 0.4, pos.y + 0.08, pos.z + (Math.random() - 0.5) * 0.4);

      // Tia lửa bắn tóe ngang dọc theo đường băng (+/- X và +/- Z)
      const angle = Math.random() * Math.PI * 2;
      const speed = 3.2 + Math.random() * 4.2;
      this.starVelocities[idx].set(
        Math.cos(angle) * speed,
        1.2 + Math.random() * 2.4, // Bắn thấp nảy tưng trên mặt sân bay
        Math.sin(angle) * speed
      );
    }
    this.activeStarCount = (this.activeStarCount + count) % this.maxStars;
    this.hasActiveStars = true;
    posAttr.needsUpdate = true;

    // Vòng sóng hạ cánh màu Cyan ngọc bích / Vàng kim
    this.spawnShockwave(pos, '#00CEC9', 3.2);
    this.spawnShockwave(pos, '#FDCB6E', 2.0);
    this.triggerCameraShake(0.32);
  }

  // Vệt bước nhảy của quân cờ theo tùy biến trang cá nhân (Token Step Trail VFX)
  public spawnTrailStep(pos: THREE.Vector3, trailId?: string, color?: string) {
    if (trailId === 'trail_gold') {
      this.spawnStarBurst(pos, 10, 0xFDCB6E);
      this.spawnShockwave(pos, '#FDCB6E', 1.35);
    } else if (trailId === 'trail_sakura') {
      this.spawnConfetti3D(pos, 6, false);
      this.spawnShockwave(pos, '#FD79A8', 1.25);
    } else if (trailId === 'trail_neon') {
      this.spawnStarBurst(pos, 10, 0x00CEC9);
      this.spawnShockwave(pos, '#6C5CE7', 1.45);
    } else {
      this.spawnShockwave(pos, color || '#00B894', 1.1);
    }
  }

  // Rung màn hình nhẹ (Screen Micro-shake)
  public triggerCameraShake(intensity = 0.35) {
    this.shakeIntensity = intensity;
  }

  // Khói xì xào tàu hỏa / bến xe (Train Puff Smoke)
  public spawnTrainSmoke(pos: THREE.Vector3, count = 12) {
    if (!this.smokeTexture) return;

    for (let i = 0; i < count; i++) {
      const geo = new THREE.PlaneGeometry(0.6, 0.6);
      const mat = new THREE.MeshBasicMaterial({
        map: this.smokeTexture,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geo, mat);

      // Random jitter around chimney position
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        0.5 + Math.random() * 0.3,
        (Math.random() - 0.5) * 0.4
      );
      mesh.position.copy(pos).add(offset);
      mesh.quaternion.copy(this.camera.quaternion); // Billboard towards camera

      this.particleGroup.add(mesh);

      const speed = 0.7 + Math.random() * 0.9;
      const angle = Math.random() * Math.PI * 2;
      const vel = new THREE.Vector3(
        Math.cos(angle) * 0.25,
        speed * 1.6,
        Math.sin(angle) * 0.25
      );

      this.smokeParticles.push({
        mesh,
        velocity: vel,
        rotationSpeed: (Math.random() - 0.5) * 2.0,
        scale: 0.4 + Math.random() * 0.3,
        maxScale: 1.8 + Math.random() * 0.8,
        alpha: 0.85,
        life: 0,
        maxLife: 1.2 + Math.random() * 0.6
      });
    }
  }

  private isMobileViewport(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }

  // Nổ pháo hoa 3D rực rỡ (3D Particle Firework Bursts)
  public spawnFireworkBurst(pos: THREE.Vector3, colorHex?: number) {
    const burstCount = this.isMobileViewport() ? 36 : 64;
    const palette = [0xFDCB6E, 0x00CEC9, 0xE84393, 0x00B894, 0x6C5CE7, 0xFF7675];
    const baseColor = colorHex !== undefined ? colorHex : palette[Math.floor(Math.random() * palette.length)];
    const threeColor = new THREE.Color(baseColor);

    for (let i = 0; i < burstCount; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 3.5 + Math.random() * 4.5;

      const vel = new THREE.Vector3(
        speed * Math.sin(phi) * Math.cos(theta),
        speed * Math.cos(phi) + 2.5,
        speed * Math.sin(phi) * Math.sin(theta)
      );

      const pColor = Math.random() > 0.4 ? threeColor.clone() : new THREE.Color(palette[Math.floor(Math.random() * palette.length)]);

      this.fireworkParticles.push({
        pos: pos.clone().add(new THREE.Vector3(0, 1.8, 0)),
        vel,
        color: pColor,
        alpha: 1.0,
        life: 0,
        maxLife: 1.0 + Math.random() * 0.6,
        size: 0.7 + Math.random() * 0.5
      });
    }

    this.spawnShockwave(pos, `#${threeColor.getHexString()}`, 3.5);
    this.triggerCameraShake(0.38);
  }

  // Bắn giấy màu ăn mừng 3D (3D Celebratory Confetti Ribbons)
  public spawnConfetti3D(pos: THREE.Vector3, count = 48, isGoldTheme = false) {
    const effectiveCount = this.isMobileViewport() ? Math.ceil(count * 0.5) : count;
    const goldPalette = [0xFDCB6E, 0xF1C40F, 0xE1B12C, 0xF39C12, 0xFFEAA7, 0x00CEC9, 0xE84393];
    const rainbowPalette = [0xFDCB6E, 0x00CEC9, 0xE84393, 0x00B894, 0x6C5CE7, 0xFC5C65, 0x0984E3];
    const palette = isGoldTheme ? goldPalette : rainbowPalette;

    for (let i = 0; i < effectiveCount; i++) {
      const geo = new THREE.PlaneGeometry(0.26, 0.14);
      const col = palette[Math.floor(Math.random() * palette.length)];
      const mat = new THREE.MeshBasicMaterial({
        color: col,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.96
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        pos.x + (Math.random() - 0.5) * 0.9,
        pos.y + 1.2 + Math.random() * 0.9,
        pos.z + (Math.random() - 0.5) * 0.9
      );

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.4 + Math.random() * 3.8;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        4.8 + Math.random() * 4.5,
        Math.sin(angle) * speed
      );

      const rotVel = new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 14
      );

      this.particleGroup.add(mesh);
      this.confetti3DList.push({
        mesh,
        velocity: vel,
        rotVelocity: rotVel,
        life: 0,
        maxLife: 2.2 + Math.random() * 0.8
      });
    }
  }

  // Đại tiệc khánh thành Khách Sạn (Celebratory Confetti & 3D Fireworks Fanfare)
  public spawnHotelCelebration(pos: THREE.Vector3) {
    // 1. Pháo hoa 3D tỏa sáng trên bầu trời khách sạn
    this.spawnFireworkBurst(pos, 0xFDCB6E);
    setTimeout(() => this.spawnFireworkBurst(pos.clone().add(new THREE.Vector3(0.8, 0.5, 0.8)), 0xE84393), 200);
    setTimeout(() => this.spawnFireworkBurst(pos.clone().add(new THREE.Vector3(-0.8, 0.8, -0.6)), 0x00B894), 400);

    // 2. Mưa hoa giấy 3D vàng kim phủ kín sa bàn
    this.spawnConfetti3D(pos, 60, true);

    // 3. Shockwave vàng vương giả đa tầng
    this.spawnShockwave(pos, '#FDCB6E', 4.5);
    this.spawnShockwave(pos, '#FFA801', 2.8);
    this.triggerCameraShake(0.48);

    // 4. Màn pháo giấy 2D Canvas Confetti phủ ngập tràn màn hình cho cảm giác chiến thắng hoành tráng
    confetti({
      particleCount: this.isMobileViewport() ? 70 : 140,
      spread: 95,
      origin: { y: 0.62 },
      colors: ['#FDCB6E', '#F1C40F', '#00CEC9', '#E84393', '#00B894', '#6C5CE7']
    });
  }

  // Floating 3D Text nảy số tiền (+500M xanh lá / -200M đỏ) bay lên
  public spawnFloatingText(text: string, worldPos: THREE.Vector3, isPositive = true) {
    const el = document.createElement('div');
    el.textContent = text;
    el.className = 'floating-vfx-text';
    el.style.cssText = `
      position: absolute;
      font-family: 'Fredoka', sans-serif;
      font-weight: 900;
      font-size: 1.45rem;
      color: ${isPositive ? '#00B894' : '#D63031'};
      text-shadow: 0 2px 8px rgba(0,0,0,0.35), 0 0 16px ${isPositive ? 'rgba(0,184,148,0.5)' : 'rgba(214,48,49,0.5)'};
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: transform 0.05s linear;
      z-index: 1000;
      white-space: nowrap;
    `;
    this.domContainer.appendChild(el);

    this.floatingTexts.push({
      element: el,
      worldPos: worldPos.clone().add(new THREE.Vector3(0, 1.2, 0)),
      velocity: 1.3,
      opacity: 1.0,
      life: 1.5
    });
  }

  // Floating 3D Dollar Indicator với huy hiệu tài chính sắc nét
  public spawnFloatingDollar(amountStr: string, worldPos: THREE.Vector3, isPositive = true) {
    const el = document.createElement('div');
    const icon = isPositive ? '💰 +' : '💸 -';
    const cleanAmount = amountStr.replace(/^[+-]/, '');
    el.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(30, 39, 46, 0.88); border: 2px solid ${isPositive ? '#00B894' : '#FC5C65'}; border-radius: 9999px; box-shadow: 0 4px 16px rgba(0,0,0,0.35), 0 0 12px ${isPositive ? 'rgba(0,184,148,0.45)' : 'rgba(252,92,101,0.45)'};">
        <span style="font-size: 1.25rem;">${isPositive ? '💵' : '💸'}</span>
        <span style="font-family: 'Fredoka', sans-serif; font-weight: 900; font-size: 1.35rem; color: ${isPositive ? '#00D2A0' : '#FC5C65'};">${isPositive ? '+' : '-'}${cleanAmount}</span>
      </div>
    `;
    el.className = 'floating-vfx-dollar';
    el.style.cssText = `
      position: absolute;
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: transform 0.05s linear;
      z-index: 1001;
      white-space: nowrap;
    `;
    this.domContainer.appendChild(el);

    this.floatingTexts.push({
      element: el,
      worldPos: worldPos.clone().add(new THREE.Vector3(0, 1.3, 0)),
      velocity: 1.4,
      opacity: 1.0,
      life: 1.6
    });
  }

  public update(delta: number) {
    // 60-144Hz Finite Math Clamp: Ngăn chặn hiện tượng phân kỳ do delta drop hoặc chuyển tab
    const dt = Math.min(Math.max(Number.isFinite(delta) ? delta : 0.016, 0.0001), 0.1);

    // 1. Update Camera Shake
    if (this.shakeIntensity > 0.01) {
      this.cameraShakeOffset.set(
        (Math.random() - 0.5) * this.shakeIntensity,
        (Math.random() - 0.5) * this.shakeIntensity * 0.5,
        (Math.random() - 0.5) * this.shakeIntensity
      );
      this.shakeIntensity *= Math.pow(this.shakeDecay, dt * 60);
    } else {
      this.cameraShakeOffset.set(0, 0, 0);
      this.shakeIntensity = 0;
    }

    // 2. Update Star Particles
    if (this.starParticles && this.hasActiveStars) {
      const posAttr = this.starParticles.geometry.attributes.position as THREE.BufferAttribute;
      let anyActive = false;
      for (let i = 0; i < this.maxStars; i++) {
        const y = posAttr.getY(i);
        if (y > -50) {
          const vel = this.starVelocities[i];
          const newX = posAttr.getX(i) + vel.x * dt;
          const newY = y + vel.y * dt;
          const newZ = posAttr.getZ(i) + vel.z * dt;
          if (Number.isFinite(newX) && Number.isFinite(newY) && Number.isFinite(newZ)) {
            posAttr.setXYZ(i, newX, newY, newZ);
          }
          vel.y -= 9.8 * dt; // Gravity
          vel.x *= 0.96;
          vel.z *= 0.96;

          if (newY < 0.1) {
            posAttr.setY(i, -100); // Disappear below
          } else {
            anyActive = true;
          }
        }
      }
      this.hasActiveStars = anyActive;
      posAttr.needsUpdate = true;
    }

    // 3. Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.scale += dt * 3.8;
      sw.alpha -= dt * 1.3;

      if (Number.isFinite(sw.scale)) {
        sw.mesh.scale.set(sw.scale, sw.scale, 1);
      }
      (sw.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, sw.alpha);

      if (sw.alpha <= 0 || sw.scale >= sw.maxScale) {
        this.particleGroup.remove(sw.mesh);
        sw.mesh.geometry.dispose();
        (sw.mesh.material as THREE.Material).dispose();
        this.shockwaves.splice(i, 1);
      }
    }

    // 4. Update Train Puff Smoke
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const sp = this.smokeParticles[i];
      sp.life += dt;
      const progress = sp.life / sp.maxLife;

      sp.mesh.position.addScaledVector(sp.velocity, dt);
      sp.velocity.y *= 0.98;
      sp.velocity.x += (Math.random() - 0.5) * 0.05;

      // Expand scale as smoke puffs outwards
      const currentScale = sp.scale + (sp.maxScale - sp.scale) * progress;
      if (Number.isFinite(currentScale)) {
        sp.mesh.scale.set(currentScale, currentScale, 1);
      }

      // Billboard quaternion to face camera
      sp.mesh.quaternion.copy(this.camera.quaternion);
      sp.mesh.rotateZ(sp.rotationSpeed * dt);

      // Fade out
      const mat = sp.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, sp.alpha * (1 - progress));

      if (sp.life >= sp.maxLife) {
        this.particleGroup.remove(sp.mesh);
        sp.mesh.geometry.dispose();
        mat.dispose();
        this.smokeParticles.splice(i, 1);
      }
    }

    // 5. Update 3D Firework Particles
    if (this.fireworkPoints && this.fireworkParticles.length > 0) {
      const posAttr = this.fireworkPoints.geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = this.fireworkPoints.geometry.attributes.color as THREE.BufferAttribute;
      const prevCount = this.fireworkParticles.length;

      for (let i = this.fireworkParticles.length - 1; i >= 0; i--) {
        const fp = this.fireworkParticles[i];
        fp.life += dt;
        const progress = fp.life / fp.maxLife;

        fp.pos.addScaledVector(fp.vel, dt);
        fp.vel.y -= 6.5 * dt; // Gravity
        fp.vel.x *= 0.96;
        fp.vel.z *= 0.96;

        const writeIdx = i % this.maxFireworks;
        if (Number.isFinite(fp.pos.x) && Number.isFinite(fp.pos.y) && Number.isFinite(fp.pos.z)) {
          posAttr.setXYZ(writeIdx, fp.pos.x, fp.pos.y, fp.pos.z);
        }

        const fade = Math.max(0, 1 - progress);
        colAttr.setXYZ(writeIdx, fp.color.r * fade, fp.color.g * fade, fp.color.b * fade);

        if (fp.life >= fp.maxLife) {
          posAttr.setXYZ(writeIdx, 0, -200, 0);
          this.fireworkParticles.splice(i, 1);
        }
      }
      // Hide any trailing slots left behind when fireworkParticles shrinks after splicing
      const clearLimit = Math.min(prevCount, this.maxFireworks);
      for (let k = this.fireworkParticles.length; k < clearLimit; k++) {
        posAttr.setXYZ(k, 0, -200, 0);
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }

    // 6. Update 3D Confetti Ribbons
    for (let i = this.confetti3DList.length - 1; i >= 0; i--) {
      const cf = this.confetti3DList[i];
      cf.life += dt;
      const progress = cf.life / cf.maxLife;

      cf.mesh.position.addScaledVector(cf.velocity, dt);
      cf.velocity.y -= 7.5 * dt; // Gravity
      cf.velocity.x *= 0.98;
      cf.velocity.z *= 0.98;

      cf.mesh.rotation.x += cf.rotVelocity.x * dt;
      cf.mesh.rotation.y += cf.rotVelocity.y * dt;
      cf.mesh.rotation.z += cf.rotVelocity.z * dt;

      const mat = cf.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - progress * 0.9);

      if (cf.life >= cf.maxLife || cf.mesh.position.y < 0.1) {
        this.particleGroup.remove(cf.mesh);
        cf.mesh.geometry.dispose();
        mat.dispose();
        this.confetti3DList.splice(i, 1);
      }
    }

    // 7. Update Floating 3D Texts & Dollar Badges
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.worldPos.y += ft.velocity * dt;
      ft.velocity *= 0.95;
      ft.opacity = Math.max(0, ft.life / 1.5);

      // Project world coordinates to screen pixels
      const screenPos = ft.worldPos.clone().project(this.camera);
      const w = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const h = typeof window !== 'undefined' ? window.innerHeight : 1080;
      const x = (screenPos.x * 0.5 + 0.5) * w;
      const y = (-(screenPos.y * 0.5) + 0.5) * h;

      if (Number.isFinite(x) && Number.isFinite(y)) {
        ft.element.style.left = `${x}px`;
        ft.element.style.top = `${y}px`;
      }
      ft.element.style.opacity = `${ft.opacity}`;
      ft.element.style.transform = `translate(-50%, -50%) scale(${0.85 + (1 - ft.opacity) * 0.45})`;

      if (ft.life <= 0) {
        if (ft.element.parentNode === this.domContainer) {
          this.domContainer.removeChild(ft.element);
        }
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  /**
   * Dọn dẹp triệt để toàn bộ hạt, mesh, geometry, material, texture và DOM elements (Zero Memory Leak)
   */
  public dispose() {
    // 1. Shockwaves
    for (const sw of this.shockwaves) {
      this.particleGroup.remove(sw.mesh);
      sw.mesh.geometry.dispose();
      (sw.mesh.material as THREE.Material).dispose();
    }
    this.shockwaves = [];

    // 2. Smoke particles
    for (const sp of this.smokeParticles) {
      this.particleGroup.remove(sp.mesh);
      sp.mesh.geometry.dispose();
      (sp.mesh.material as THREE.Material).dispose();
    }
    this.smokeParticles = [];

    // 3. 3D Confetti
    for (const cf of this.confetti3DList) {
      this.particleGroup.remove(cf.mesh);
      cf.mesh.geometry.dispose();
      (cf.mesh.material as THREE.Material).dispose();
    }
    this.confetti3DList = [];

    // 4. Star Particles Points
    if (this.starParticles) {
      this.particleGroup.remove(this.starParticles);
      this.starParticles.geometry.dispose();
      const sMat = this.starParticles.material as THREE.PointsMaterial;
      if (sMat.map) sMat.map.dispose();
      sMat.dispose();
      this.starParticles = null;
    }

    // 5. Firework Points
    if (this.fireworkPoints) {
      this.particleGroup.remove(this.fireworkPoints);
      this.fireworkPoints.geometry.dispose();
      const fMat = this.fireworkPoints.material as THREE.PointsMaterial;
      if (fMat.map) fMat.map.dispose();
      fMat.dispose();
      this.fireworkPoints = null;
    }
    this.fireworkParticles = [];

    // 6. Smoke Texture
    if (this.smokeTexture) {
      this.smokeTexture.dispose();
      this.smokeTexture = null;
    }

    // 7. Floating Texts DOM
    for (const ft of this.floatingTexts) {
      if (ft.element.parentNode === this.domContainer) {
        this.domContainer.removeChild(ft.element);
      }
    }
    this.floatingTexts = [];

    // 8. Particle Group
    this.scene.remove(this.particleGroup);
  }
}
