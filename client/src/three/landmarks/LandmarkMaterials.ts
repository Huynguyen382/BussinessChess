import * as THREE from 'three';

/**
 * Quản lý bộ nhớ đệm vật liệu PBR (Material Cache) và texture đổ bóng tiếp xúc (Contact Shadow)
 * Dành cho các mô hình danh thắng 3D trên bàn cờ.
 */
export class LandmarkMaterials {
  private static materials: Map<string, THREE.Material> = new Map();
  private static shadowTexture: THREE.CanvasTexture | null = null;

  public static getMat<T extends THREE.Material>(key: string, createFn: () => T): T {
    if (!this.materials.has(key)) {
      this.materials.set(key, createFn());
    }
    return this.materials.get(key)! as T;
  }

  public static getContactShadowTexture(): THREE.CanvasTexture {
    if (!this.shadowTexture) {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(20, 24, 30, 0.65)');
      grad.addColorStop(0.5, 'rgba(20, 24, 30, 0.28)');
      grad.addColorStop(1, 'rgba(20, 24, 30, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      this.shadowTexture = new THREE.CanvasTexture(canvas);
    }
    return this.shadowTexture;
  }

  public static createContactShadow(sx: number, sz: number, opacity = 0.45): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(sx, sz);
    const mat = new THREE.MeshBasicMaterial({
      map: this.getContactShadowTexture(),
      transparent: true,
      opacity,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.008;
    return mesh;
  }
}
