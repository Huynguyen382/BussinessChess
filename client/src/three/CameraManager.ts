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
  private spherical = new THREE.Spherical(26.8, CameraManager.GOLDEN_PHI, CameraManager.GOLDEN_THETA);

  // Touch & Mouse orbit control state
  private isPointerDown = false;
  private prevPointerX = 0;
  private prevPointerY = 0;
  private pinchStartDist = 0;

  constructor(domElement: HTMLElement) {
    this.domElement = domElement;
    this.isMobile = window.innerWidth <= 768;

    const aspect = window.innerWidth / window.innerHeight;
    const fov = aspect < 1 ? (aspect < 0.6 ? 53 : 50) : 46;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);

    this.lockToGoldenAngle();
    this.updateCameraTransform();
    this.bindEvents();
  }

  // Khóa cứng góc nhìn chuẩn Isometric không cho xoay tự do
  public lockToGoldenAngle() {
    this.spherical.theta = CameraManager.GOLDEN_THETA;
    this.spherical.phi = CameraManager.GOLDEN_PHI;
    if (this.isZoomedIn) {
      this.spherical.radius = this.isMobile ? 20.0 : 17.5;
    } else {
      this.spherical.radius = this.isMobile ? 30.5 : 26.8;
    }
  }

  public toggleZoom(): boolean {
    this.isZoomedIn = !this.isZoomedIn;
    this.lockToGoldenAngle();
    this.updateCameraTransform();
    return this.isZoomedIn;
  }

  public setLocked(locked: boolean) {
    this.isLocked = locked;
    if (locked) {
      this.lockToGoldenAngle();
      this.updateCameraTransform();
    }
  }

  public toggleLock(): boolean {
    this.setLocked(!this.isLocked);
    return this.isLocked;
  }

  private updateCameraTransform() {
    // Luôn giữ góc nhìn ổn định khi bị khóa
    if (this.isLocked) {
      this.spherical.theta = CameraManager.GOLDEN_THETA;
      this.spherical.phi = CameraManager.GOLDEN_PHI;
      if (!this.isFollowMode) {
        if (this.isZoomedIn) {
          this.spherical.radius = this.isMobile ? 20.0 : 17.5;
        } else {
          this.spherical.radius = this.isMobile ? 30.5 : 26.8;
        }
      }
    } else {
      this.spherical.radius = THREE.MathUtils.clamp(this.spherical.radius, 14, 48);
      this.spherical.phi = THREE.MathUtils.clamp(this.spherical.phi, 0.2, Math.PI / 2.1);
    }

    const offset = new THREE.Vector3().setFromSpherical(this.spherical);
    const center = this.isFollowMode && this.followTarget ? this.followTarget : this.targetPosition;

    this.camera.position.copy(center).add(offset);
    this.currentLookAt.lerp(center, 0.1);
    this.camera.lookAt(this.currentLookAt);
  }

  private bindEvents() {
    window.addEventListener('resize', this.onResize.bind(this));

    // Pointer events: Chỉ cho phép kéo xoay nếu ĐÃ MỞ KHÓA
    this.domElement.addEventListener('pointerdown', (e) => {
      if (this.isLocked) return; // Khóa góc nhìn hoàn toàn
      this.isPointerDown = true;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (this.isLocked || !this.isPointerDown) return;
      const deltaX = e.clientX - this.prevPointerX;
      const deltaY = e.clientY - this.prevPointerY;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;

      this.spherical.theta -= deltaX * 0.005;
      this.spherical.phi -= deltaY * 0.005;
      this.updateCameraTransform();
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });

    // Wheel zoom: Chỉ cho phép thu phóng nhẹ khi mở khóa
    this.domElement.addEventListener('wheel', (e) => {
      if (this.isLocked) return;
      e.preventDefault();
      this.spherical.radius += e.deltaY * 0.03;
      this.updateCameraTransform();
    }, { passive: false });

    // Touch pinch to zoom
    this.domElement.addEventListener('touchstart', (e) => {
      if (this.isLocked) return;
      if (e.touches.length === 2) {
        this.pinchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });

    this.domElement.addEventListener('touchmove', (e) => {
      if (this.isLocked) return;
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = this.pinchStartDist - dist;
        this.spherical.radius += diff * 0.04;
        this.pinchStartDist = dist;
        this.updateCameraTransform();
      }
    });
  }

  public setFollowTarget(target: THREE.Vector3 | null) {
    this.followTarget = target;
  }

  public toggleFollowMode() {
    this.isFollowMode = !this.isFollowMode;
    if (this.isFollowMode) {
      this.spherical.radius = this.isMobile ? 18 : 22;
    } else {
      this.resetOverview();
    }
  }

  public resetOverview() {
    this.isFollowMode = false;
    this.followTarget = null;
    this.lockToGoldenAngle();
    this.targetPosition.set(0, 0, 0);
    this.updateCameraTransform();
  }

  public onResize() {
    this.isMobile = window.innerWidth <= 768;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.fov = this.camera.aspect < 1 ? (this.camera.aspect < 0.6 ? 53 : 50) : 46;
    this.camera.updateProjectionMatrix();
    this.updateCameraTransform();
  }

  public update() {
    if (this.isFollowMode && this.followTarget) {
      this.updateCameraTransform();
    }
  }
}
