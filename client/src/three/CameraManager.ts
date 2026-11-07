import * as THREE from 'three';

export class CameraManager {
  public camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;
  private targetPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private currentLookAt: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private followTarget: THREE.Vector3 | null = null;
  public isFollowMode: boolean = false;
  public isMobile: boolean = false;

  // Touch & Mouse orbit control state
  private isPointerDown = false;
  private prevPointerX = 0;
  private prevPointerY = 0;
  private spherical = new THREE.Spherical(38, Math.PI / 3.2, Math.PI / 4); // radius, phi, theta
  private pinchStartDist = 0;

  constructor(domElement: HTMLElement) {
    this.domElement = domElement;
    this.isMobile = window.innerWidth <= 768;

    const aspect = window.innerWidth / window.innerHeight;
    const fov = this.isMobile ? 55 : 45;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);

    this.updateCameraTransform();
    this.bindEvents();
  }

  private updateCameraTransform() {
    this.spherical.radius = THREE.MathUtils.clamp(this.spherical.radius, 14, 55);
    this.spherical.phi = THREE.MathUtils.clamp(this.spherical.phi, 0.2, Math.PI / 2.1);

    const offset = new THREE.Vector3().setFromSpherical(this.spherical);
    const center = this.isFollowMode && this.followTarget ? this.followTarget : this.targetPosition;

    this.camera.position.copy(center).add(offset);
    this.currentLookAt.lerp(center, 0.1);
    this.camera.lookAt(this.currentLookAt);
  }

  private bindEvents() {
    window.addEventListener('resize', this.onResize.bind(this));

    // Pointer events for desktop and mobile drag
    this.domElement.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isPointerDown) return;
      const deltaX = e.clientX - this.prevPointerX;
      const deltaY = e.clientY - this.prevPointerY;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;

      this.spherical.theta -= deltaX * 0.006;
      this.spherical.phi -= deltaY * 0.006;
      this.updateCameraTransform();
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });

    // Wheel zoom
    this.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.spherical.radius += e.deltaY * 0.03;
      this.updateCameraTransform();
    }, { passive: false });

    // Touch pinch to zoom
    this.domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        this.pinchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });

    this.domElement.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = this.pinchStartDist - dist;
        this.spherical.radius += diff * 0.05;
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
      this.spherical.phi = Math.PI / 3.4;
    } else {
      this.resetOverview();
    }
  }

  public resetOverview() {
    this.isFollowMode = false;
    this.followTarget = null;
    this.spherical.radius = this.isMobile ? 36 : 38;
    this.spherical.phi = Math.PI / 3.2;
    this.spherical.theta = Math.PI / 4;
    this.targetPosition.set(0, 0, 0);
  }

  public onResize() {
    this.isMobile = window.innerWidth <= 768;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.fov = this.isMobile ? 55 : 45;
    this.camera.updateProjectionMatrix();
    this.updateCameraTransform();
  }

  public update() {
    if (this.isFollowMode && this.followTarget) {
      this.updateCameraTransform();
    }
  }
}
