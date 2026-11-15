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
      grad.addColorStop(0, 'rgba(15, 20, 28, 0.70)');
      grad.addColorStop(0.35, 'rgba(18, 23, 32, 0.38)');
      grad.addColorStop(0.70, 'rgba(22, 28, 38, 0.12)');
      grad.addColorStop(1, 'rgba(22, 28, 38, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      this.shadowTexture = new THREE.CanvasTexture(canvas);
    }
    return this.shadowTexture;
  }

  // ==========================================
  // BẢNG VẬT LIỆU PBR CAO CẤP CHUẨN ĐỒ HỌA THẾ HỆ MỚI
  // ==========================================

  /** Vàng sa-tanh ấm (Brushed Satin Gold) */
  public static getGoldMetalMat(): THREE.MeshStandardMaterial {
    return this.getMat('pbr_gold_metal_24k', () => new THREE.MeshStandardMaterial({
      color: '#F9CA24',
      emissive: '#E0A922',
      emissiveIntensity: 0.04,
      metalness: 0.65,
      roughness: 0.42
    }));
  }

  /** Cửa sổ phát sáng ấm cúng dịu mắt (Warm Cozy Night Glow) */
  public static getWarmWindowMat(): THREE.MeshStandardMaterial {
    return this.getMat('pbr_warm_window_glow', () => new THREE.MeshStandardMaterial({
      color: '#FFEAA7',
      emissive: '#FFEAA7',
      emissiveIntensity: 0.22,
      roughness: 0.5
    }));
  }

  /** Kính Sapphire kiến trúc xanh sâu lắng phong cách Business Tour */
  public static getSapphireGlassMat(): THREE.MeshStandardMaterial {
    return this.getMat('pbr_sapphire_reflective_glass', () => new THREE.MeshStandardMaterial({
      color: '#0984E3',
      emissive: '#00CEC9',
      emissiveIntensity: 0.06,
      roughness: 0.32,
      metalness: 0.15
    }));
  }

  /** Mặt nước hồ bơi ngọc bích tự nhiên êm dịu */
  public static getPoolWaterMat(): THREE.MeshStandardMaterial {
    return this.getMat('pbr_pool_water_jade', () => new THREE.MeshStandardMaterial({
      color: '#00CEC9',
      emissive: '#0984E3',
      emissiveIntensity: 0.08,
      roughness: 0.22,
      metalness: 0.08
    }));
  }

  /** Thảm nhung đỏ Bordeaux quý phái đón khách VIP */
  public static getRedCarpetMat(): THREE.MeshStandardMaterial {
    return this.getMat('pbr_red_carpet_velvet', () => new THREE.MeshStandardMaterial({
      color: '#D63031',
      emissive: '#C0392B',
      emissiveIntensity: 0.0,
      roughness: 0.85
    }));
  }

  public static createContactShadow(sx: number, sz: number, opacity = 0.45): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(sx, sz);
    const matKey = `contact_shadow_${opacity.toFixed(2)}`;
    const mat = this.getMat(matKey, () => new THREE.MeshBasicMaterial({
      map: this.getContactShadowTexture(),
      transparent: true,
      opacity,
      depthWrite: false
    }));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.008;
    return mesh;
  }
}
