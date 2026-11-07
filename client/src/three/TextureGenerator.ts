import * as THREE from 'three';

export class TextureGenerator {
  // Tạo texture mặt bàn gỗ sồi tự nhiên với đường vân và khớp nối các tấm ván
  public static createWoodPlankTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Nền gỗ sồi ấm áp tự nhiên (Warm Oak)
    ctx.fillStyle = '#E3D0B4';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankHeight = 128; // 8 tấm ván gỗ
    const plankColors = ['#E5D3B8', '#DFCCAE', '#E9D7BD', '#DCBE9F', '#E2CFB3', '#D8B896', '#E7D5BB', '#E0CBB0'];

    for (let i = 0; i < 8; i++) {
      const y = i * plankHeight;
      ctx.fillStyle = plankColors[i % plankColors.length];
      ctx.fillRect(0, y, 1024, plankHeight);

      // Vân gỗ tự nhiên (Wood Grain Lines)
      ctx.strokeStyle = 'rgba(165, 130, 95, 0.14)';
      ctx.lineWidth = 1.5;
      for (let g = 0; g < 18; g++) {
        ctx.beginPath();
        let py = y + Math.random() * plankHeight;
        ctx.moveTo(0, py);
        for (let x = 0; x < 1024; x += 64) {
          py += (Math.random() - 0.5) * 5;
          ctx.lineTo(x, py);
        }
        ctx.stroke();
      }

      // Khớp nối rãnh giữa các tấm ván (Plank Seam with subtle shadow)
      ctx.strokeStyle = 'rgba(100, 75, 50, 0.28)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();

      // Highlight mép ván trên
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, y + 2);
      ctx.lineTo(1024, y + 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  }

  // Tạo texture gạch lát vỉa hè cách điệu cho các ô cờ (Stylized Cobblestone)
  public static createCobblestoneTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, 256, 256);

    // Mạng lưới gạch lát nhẹ nhàng
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    const step = 32;

    for (let x = 0; x <= 256; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y <= 256; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  // Texture tia nắng mặt trời chiếu xéo qua cửa sổ (Window Light Shaft)
  public static createSunbeamTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, 'rgba(255, 245, 225, 0.28)');
    grad.addColorStop(0.5, 'rgba(255, 245, 225, 0.12)');
    grad.addColorStop(1, 'rgba(255, 245, 225, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    return new THREE.CanvasTexture(canvas);
  }
}
