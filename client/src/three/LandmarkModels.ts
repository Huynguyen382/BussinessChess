import { LandmarkMaterials } from './landmarks/LandmarkMaterials';
import { CornerLandmarks } from './landmarks/CornerLandmarks';
import { TransportLandmarks } from './landmarks/TransportLandmarks';
import { SpecialTileLandmarks } from './landmarks/SpecialTileLandmarks';
import { VietnamLandmarks } from './landmarks/VietnamLandmarks';

export { LandmarkMaterials } from './landmarks/LandmarkMaterials';
export { CornerLandmarks } from './landmarks/CornerLandmarks';
export { TransportLandmarks } from './landmarks/TransportLandmarks';
export { SpecialTileLandmarks } from './landmarks/SpecialTileLandmarks';
export { VietnamLandmarks } from './landmarks/VietnamLandmarks';
export { LandmarkHelpers } from './landmarks/LandmarkHelpers';

/**
 * Facade hợp nhất cung cấp các mô hình 3D danh thắng và kiến trúc sa bàn cho 40 ô cờ Việt Nam.
 * Đã được module hóa thành các tệp chuyên biệt trong thư mục `client/src/three/landmarks/`.
 * Đảm bảo 100% tương thích ngược với tất cả các lời gọi hiện có.
 */
export class LandmarkModels {
  public static getContactShadowTexture = LandmarkMaterials.getContactShadowTexture.bind(LandmarkMaterials);
  public static createContactShadow = LandmarkMaterials.createContactShadow.bind(LandmarkMaterials);

  public static createGOCorner = CornerLandmarks.createGOCorner.bind(CornerLandmarks);
  public static createJailCorner = CornerLandmarks.createJailCorner.bind(CornerLandmarks);
  public static createFreeParkingCorner = CornerLandmarks.createFreeParkingCorner.bind(CornerLandmarks);
  public static createGoToJailCorner = CornerLandmarks.createGoToJailCorner.bind(CornerLandmarks);

  public static createRailroadModel = TransportLandmarks.createRailroadModel.bind(TransportLandmarks);
  public static createUtilityModel = SpecialTileLandmarks.createUtilityModel.bind(SpecialTileLandmarks);
  public static createCardTileModel = SpecialTileLandmarks.createCardTileModel.bind(SpecialTileLandmarks);
  public static createTaxModel = SpecialTileLandmarks.createTaxModel.bind(SpecialTileLandmarks);

  public static createCityLandmark = VietnamLandmarks.createCityLandmark.bind(VietnamLandmarks);
}
