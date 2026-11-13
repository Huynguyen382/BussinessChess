import * as THREE from 'three';

export class CameraManager {
  public camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;
  private targetPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private currentLookAt: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private followTarget: THREE.Vector3 | null = null;
  public isFollowMode: boolean = false;
  public isMobile: boolean = false;

  // Khóa góc nhìn chuẩn Isometric (Mặc định: KHÓA để ổn định như Monopoly GO)
  public isLocked: boolean = true;
  public isZoomedIn: boolean = false;

  // Góc nhìn vàng tiêu chuẩn: Isometric 45 độ, góc nhìn cận cảnh sắc nét bao quát toàn bộ 40 ô
  private static readonly GOLDEN_THETA = Math.PI / 4;       // 45 độ góc ngang
  private static readonly GOLDEN_PHI = Math.PI / 3.4;        // ~53 độ góc chúc xuống tối ưu hiển thị mặt ô cờ

  // Spherical coordinates (current and target for smooth lerp transitions)
  private currentSpherical = new THREE.Spherical(26.8, CameraManager.GOLDEN_PHI, CameraManager.GOLDEN_THETA);
  private targetSpherical = new THREE.Spherical(26.8, CameraManager.GOLDEN_PHI, CameraManager.GOLDEN_THETA);

  // Touch & Pointer state
  private isPointerDown = false;
  private prevPointerX = 0;
  private prevPointerY = 0;
  private pointerVelocityX = 0;
  private pointerVelocityY = 0;

  // Pinch-to-zoom state
  private isPinching = false;
  private pinchStartDist = 0;
  private pinchStartRadius = 0;

  // Double-tap detection
  private lastTapTime = 0;
  private lastTapX = 0;
  private lastTapY = 0;

  constructor(domElement: HTMLElement) {
    this.domElement = domElement;
    this.isMobile = window.innerWidth <= 768;

    const aspect = window.innerWidth / window.innerHeight;
    const fov = aspect < 1 ? (aspect < 0.6 ? 53 : 50) : 46;
    // Optimized near (0.2) and far (350) clipping planes to prevent clipping of tall landmarks
    // while maximizing 24-bit depth buffer precision and eliminating z-fighting
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.2, 350);

    this.lockToGoldenAngle();
    this.currentSpherical.copy(this.targetSpherical);
    this.applyCameraTransform();
    this.bindEvents();
  }

  // Khóa cứng góc nhìn chuẩn Isometric không cho xoay tự do
  public lockToGoldenAngle() {
    this.targetSpherical.theta = CameraManager.GOLDEN_THETA;
    this.targetSpherical.phi = CameraManager.GOLDEN_PHI;
    if (this.isZoomedIn) {
      this.targetSpherical.radius = this.isMobile ? 16.0 : 14.0;
    } else {
      this.targetSpherical.radius = this.isMobile ? 28.5 : 25.5;
    }
  }

  public toggleZoom(): boolean {
    this.isZoomedIn = !this.isZoomedIn;
    if (this.isLocked) {
      this.lockToGoldenAngle();
    } else {
      const targetR = this.isZoomedIn ? (this.isMobile ? 16.0 : 14.0) : (this.isMobile ? 28.5 : 25.5);
      this.targetSpherical.radius = targetR;
    }
    return this.isZoomedIn;
  }

  public setLocked(locked: boolean) {
    this.isLocked = locked;
    if (locked) {
      this.lockToGoldenAngle();
    }
  }

  public toggleLock(): boolean {
    this.setLocked(!this.isLocked);
    return this.isLocked;
  }

  private applyCameraTransform() {
    this.clampSpherical(this.targetSpherical);

    const offset = new THREE.Vector3().setFromSpherical(this.currentSpherical);
    const center = this.isFollowMode && this.followTarget ? this.followTarget : this.targetPosition;

    this.camera.position.copy(center).add(offset);
    this.currentLookAt.lerp(center, 0.15);
    this.camera.lookAt(this.currentLookAt);
  }

  private clampSpherical(s: THREE.Spherical) {
    // Allows crisp zoom-in up to radius 8.5 to view landmark details cleanly without clipping
    s.radius = THREE.MathUtils.clamp(s.radius, 8.5, 42);
    s.phi = THREE.MathUtils.clamp(s.phi, 0.20, Math.PI / 2.15);
  }

  private bindEvents() {
    window.addEventListener('resize', this.onResize.bind(this));

    // 1. POINTER / TOUCH DOWN
    this.domElement.addEventListener('pointerdown', (e: PointerEvent) => {
      // Check double-tap on mobile touch
      const now = performance.now();
      const distFromLastTap = Math.hypot(e.clientX - this.lastTapX, e.clientY - this.lastTapY);

      if (now - this.lastTapTime < 320 && distFromLastTap < 30) {
        // Double-tap triggered! Toggle zoom
        this.toggleZoom();
        this.lastTapTime = 0;
        return;
      }
      this.lastTapTime = now;
      this.lastTapX = e.clientX;
      this.lastTapY = e.clientY;

      this.isPointerDown = true;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;
      this.pointerVelocityX = 0;
      this.pointerVelocityY = 0;
    });

    // 2. POINTER / TOUCH MOVE (Orbit Controls)
    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isPointerDown || this.isPinching) return;

      const deltaX = e.clientX - this.prevPointerX;
      const deltaY = e.clientY - this.prevPointerY;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;

      if (!this.isLocked) {
        // Orbit rotation freely when unlocked
        this.pointerVelocityX = deltaX * 0.005;
        this.pointerVelocityY = deltaY * 0.005;

        this.targetSpherical.theta -= this.pointerVelocityX;
        this.targetSpherical.phi -= this.pointerVelocityY;
        this.clampSpherical(this.targetSpherical);
      }
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });

    window.addEventListener('pointercancel', () => {
      this.isPointerDown = false;
      this.isPinching = false;
    });

    // 3. WHEEL ZOOM
    this.domElement.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      // Smooth zoom without unintentionally unlocking orbit rotation
      this.targetSpherical.radius += e.deltaY * 0.022;
      this.clampSpherical(this.targetSpherical);
      this.isZoomedIn = this.targetSpherical.radius < (this.isMobile ? 22 : 19);
    }, { passive: false });

    // 4. TOUCH PINCH TO ZOOM & TWO-FINGER GESTURES
    this.domElement.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length === 2) {
        this.isPinching = true;
        this.pinchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        this.pinchStartRadius = this.targetSpherical.radius;
      }
    }, { passive: true });

    this.domElement.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches.length === 2 && this.isPinching) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );

        if (this.pinchStartDist > 0) {
          const pinchFactor = this.pinchStartDist / Math.max(10, currentDist);
          this.targetSpherical.radius = this.pinchStartRadius * pinchFactor;
          this.clampSpherical(this.targetSpherical);
          this.isZoomedIn = this.targetSpherical.radius < (this.isMobile ? 22 : 19);
        }
      }
    }, { passive: true });

    this.domElement.addEventListener('touchend', (e: TouchEvent) => {
      if (e.touches.length < 2) {
        this.isPinching = false;
      }
    }, { passive: true });
  }

  public focusOnPosition(pos: THREE.Vector3, zoomRadius?: number) {
    this.targetPosition.copy(pos);
    if (zoomRadius !== undefined) {
      this.targetSpherical.radius = zoomRadius;
      this.clampSpherical(this.targetSpherical);
      this.isZoomedIn = this.targetSpherical.radius < (this.isMobile ? 22 : 19);
    }
  }

  public getTargetPosition(): THREE.Vector3 {
    return this.targetPosition;
  }

  public setFollowTarget(target: THREE.Vector3 | null) {
    this.followTarget = target;
  }

  public toggleFollowMode() {
    this.isFollowMode = !this.isFollowMode;
    if (this.isFollowMode) {
      this.targetSpherical.radius = this.isMobile ? 18.5 : 21.5;
    } else {
      this.resetOverview();
    }
  }

  public resetOverview() {
    this.isFollowMode = false;
    this.followTarget = null;
    this.isLocked = true;
    this.isZoomedIn = false;
    this.lockToGoldenAngle();
    this.targetPosition.set(0, 0, 0);
  }

  public onResize() {
    this.isMobile = window.innerWidth <= 768;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.fov = this.camera.aspect < 1 ? (this.camera.aspect < 0.6 ? 53 : 50) : 46;
    this.camera.updateProjectionMatrix();

    if (this.isLocked) {
      this.lockToGoldenAngle();
    }
  }

  public update(delta: number = 0.016) {
    // Smooth inertial damping for orbit velocity
    if (!this.isPointerDown && !this.isLocked) {
      if (Math.abs(this.pointerVelocityX) > 0.0001 || Math.abs(this.pointerVelocityY) > 0.0001) {
        this.targetSpherical.theta -= this.pointerVelocityX;
        this.targetSpherical.phi -= this.pointerVelocityY;
        this.clampSpherical(this.targetSpherical);
        this.pointerVelocityX *= 0.92;
        this.pointerVelocityY *= 0.92;
      }
    }

    // Smooth lerp towards target spherical coordinates
    const lerpSpeed = Math.min(1.0, delta * 9.0);
    this.currentSpherical.radius += (this.targetSpherical.radius - this.currentSpherical.radius) * lerpSpeed;
    this.currentSpherical.theta += (this.targetSpherical.theta - this.currentSpherical.theta) * lerpSpeed;
    this.currentSpherical.phi += (this.targetSpherical.phi - this.currentSpherical.phi) * lerpSpeed;

    this.applyCameraTransform();
  }
}
