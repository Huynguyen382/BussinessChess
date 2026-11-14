export type TileType = 
  | 'GO' 
  | 'PROPERTY' 
  | 'RAILROAD' 
  | 'UTILITY' 
  | 'CHANCE' 
  | 'COMMUNITY_CHEST' 
  | 'TAX' 
  | 'JAIL' 
  | 'FREE_PARKING' 
  | 'AIRPORT'
  | 'GO_TO_JAIL';

export interface BoardTileMeta {
  id: number;
  name: string;
  type: TileType | string;
  district?: number; // 1 to 8
  districtColor?: string;
  price: number;
  baseRent?: number;
  rentHouse1?: number;
  rentHouse2?: number;
  rentHouse3?: number;
  rentHotel?: number;
  houseCost?: number;
  taxAmount?: number;
  description?: string;
}

export const DISTRICT_COLORS: Record<number, { name: string; hex: string }> = {
  1: { name: 'Iris Purple', hex: '#6C5CE7' },
  2: { name: 'Light Blue', hex: '#74B9FF' },
  3: { name: 'Rose Pink', hex: '#FD79A8' },
  4: { name: 'Coral Orange', hex: '#FF7675' },
  5: { name: 'Ruby Red', hex: '#E84393' },
  6: { name: 'Fortune Yellow', hex: '#FDCB6E' },
  7: { name: 'Emerald Green', hex: '#00B894' },
  8: { name: 'Royal Sapphire', hex: '#0984E3' }
};

export const DEFAULT_BOARD_TILES: BoardTileMeta[] = [
  { id: 0, name: 'Khởi Hành (GO)', type: 'GO', price: 0, baseRent: 0, description: 'Nhận 200M khi đi qua hoặc dừng lại' },
  { id: 1, name: 'Cần Thơ', type: 'PROPERTY', district: 1, districtColor: '#6C5CE7', price: 60, baseRent: 4, rentHouse1: 20, rentHouse2: 60, rentHouse3: 180, rentHotel: 450, houseCost: 50 },
  { id: 2, name: 'Khí Vận', type: 'COMMUNITY_CHEST', price: 0, baseRent: 0, description: 'Rút thẻ Khí Vận may mắn' },
  { id: 3, name: 'Cà Mau', type: 'PROPERTY', district: 1, districtColor: '#6C5CE7', price: 70, baseRent: 6, rentHouse1: 30, rentHouse2: 90, rentHouse3: 270, rentHotel: 550, houseCost: 50 },
  { id: 4, name: 'Thuế Thu Nhập', type: 'TAX', price: 0, baseRent: 0, taxAmount: 200, description: 'Nộp phạt 200M vào ngân quỹ' },
  { id: 5, name: 'Bến Xe Miền Tây', type: 'RAILROAD', price: 200, baseRent: 25, description: 'Thuê x2/x4 nếu sở hữu nhiều bến xe' },
  
  { id: 6, name: 'Vũng Tàu', type: 'PROPERTY', district: 2, districtColor: '#74B9FF', price: 100, baseRent: 8, rentHouse1: 40, rentHouse2: 120, rentHouse3: 360, rentHotel: 600, houseCost: 50 },
  { id: 7, name: 'Cơ Hội', type: 'CHANCE', price: 0, baseRent: 0, description: 'Rút thẻ Cơ Hội vận mệnh' },
  { id: 8, name: 'Phan Thiết', type: 'PROPERTY', district: 2, districtColor: '#74B9FF', price: 110, baseRent: 8, rentHouse1: 40, rentHouse2: 120, rentHouse3: 360, rentHotel: 600, houseCost: 50 },
  { id: 9, name: 'Nha Trang', type: 'PROPERTY', district: 2, districtColor: '#74B9FF', price: 120, baseRent: 10, rentHouse1: 50, rentHouse2: 150, rentHouse3: 450, rentHotel: 750, houseCost: 50 },

  { id: 10, name: 'Nhà Tù / Thăm Tù', type: 'JAIL', price: 0, baseRent: 0, description: 'Thăm bạn bè hoặc chấp hành án' },
  { id: 11, name: 'Đà Lạt', type: 'PROPERTY', district: 3, districtColor: '#FD79A8', price: 140, baseRent: 12, rentHouse1: 60, rentHouse2: 180, rentHouse3: 500, rentHotel: 900, houseCost: 100 },
  { id: 12, name: 'Công Ty Điện Lực', type: 'UTILITY', price: 150, baseRent: 15, description: 'Tiền thuê tính theo số nút xí ngầu x4/x10' },
  { id: 13, name: 'Buôn Ma Thuột', type: 'PROPERTY', district: 3, districtColor: '#FD79A8', price: 150, baseRent: 12, rentHouse1: 60, rentHouse2: 180, rentHouse3: 500, rentHotel: 900, houseCost: 100 },
  { id: 14, name: 'Pleiku', type: 'PROPERTY', district: 3, districtColor: '#FD79A8', price: 160, baseRent: 14, rentHouse1: 70, rentHouse2: 200, rentHouse3: 550, rentHotel: 950, houseCost: 100 },
  { id: 15, name: 'Ga Sài Gòn', type: 'RAILROAD', price: 200, baseRent: 25 },

  { id: 16, name: 'Quy Nhơn', type: 'PROPERTY', district: 4, districtColor: '#FF7675', price: 180, baseRent: 16, rentHouse1: 80, rentHouse2: 240, rentHouse3: 700, rentHotel: 1050, houseCost: 100 },
  { id: 17, name: 'Khí Vận', type: 'COMMUNITY_CHEST', price: 0, baseRent: 0 },
  { id: 18, name: 'Hội An', type: 'PROPERTY', district: 4, districtColor: '#FF7675', price: 190, baseRent: 16, rentHouse1: 80, rentHouse2: 240, rentHouse3: 700, rentHotel: 1050, houseCost: 100 },
  { id: 19, name: 'Đà Nẵng', type: 'PROPERTY', district: 4, districtColor: '#FF7675', price: 200, baseRent: 18, rentHouse1: 90, rentHouse2: 270, rentHouse3: 800, rentHotel: 1150, houseCost: 100 },

  { id: 20, name: 'Bãi Đỗ Xe (Free Parking)', type: 'FREE_PARKING', price: 0, baseRent: 0, description: 'Nghỉ ngơi an toàn, không mất tiền' },
  { id: 21, name: 'Huế', type: 'PROPERTY', district: 5, districtColor: '#E84393', price: 220, baseRent: 20, rentHouse1: 100, rentHouse2: 300, rentHouse3: 900, rentHotel: 1250, houseCost: 150 },
  { id: 22, name: 'Cơ Hội', type: 'CHANCE', price: 0, baseRent: 0 },
  { id: 23, name: 'Phong Nha', type: 'PROPERTY', district: 5, districtColor: '#E84393', price: 230, baseRent: 20, rentHouse1: 100, rentHouse2: 300, rentHouse3: 900, rentHotel: 1250, houseCost: 150 },
  { id: 24, name: 'Cửa Lò', type: 'PROPERTY', district: 5, districtColor: '#E84393', price: 240, baseRent: 22, rentHouse1: 110, rentHouse2: 330, rentHouse3: 975, rentHotel: 1350, houseCost: 150 },
  { id: 25, name: 'Ga Đà Nẵng', type: 'RAILROAD', price: 200, baseRent: 25 },

  { id: 26, name: 'Hải Phòng', type: 'PROPERTY', district: 6, districtColor: '#FDCB6E', price: 260, baseRent: 24, rentHouse1: 120, rentHouse2: 360, rentHouse3: 1000, rentHotel: 1450, houseCost: 150 },
  { id: 27, name: 'Hạ Long', type: 'PROPERTY', district: 6, districtColor: '#FDCB6E', price: 270, baseRent: 24, rentHouse1: 120, rentHouse2: 360, rentHouse3: 1000, rentHotel: 1450, houseCost: 150 },
  { id: 28, name: 'Công Ty Nước Sạch', type: 'UTILITY', price: 150, baseRent: 15 },
  { id: 29, name: 'Tràng An', type: 'PROPERTY', district: 6, districtColor: '#FDCB6E', price: 280, baseRent: 26, rentHouse1: 130, rentHouse2: 390, rentHouse3: 1100, rentHotel: 1500, houseCost: 150 },

  { id: 30, name: 'Sân Bay Quốc Tế', type: 'AIRPORT', price: 0, baseRent: 0, description: 'Chuyến bay thẳng về Khởi Hành (GO), nhận 200M trợ cấp du lịch' },
  { id: 31, name: 'Hồ Tây (Hà Nội)', type: 'PROPERTY', district: 7, districtColor: '#00B894', price: 300, baseRent: 28, rentHouse1: 150, rentHouse2: 450, rentHouse3: 1200, rentHotel: 1650, houseCost: 200 },
  { id: 32, name: 'Phố Cổ (Hà Nội)', type: 'PROPERTY', district: 7, districtColor: '#00B894', price: 310, baseRent: 28, rentHouse1: 150, rentHouse2: 450, rentHouse3: 1200, rentHotel: 1650, houseCost: 200 },
  { id: 33, name: 'Khí Vận', type: 'COMMUNITY_CHEST', price: 0, baseRent: 0 },
  { id: 34, name: 'Tràng Tiền (Hà Nội)', type: 'PROPERTY', district: 7, districtColor: '#00B894', price: 320, baseRent: 30, rentHouse1: 160, rentHouse2: 500, rentHouse3: 1300, rentHotel: 1750, houseCost: 200 },
  { id: 35, name: 'Ga Hà Nội', type: 'RAILROAD', price: 200, baseRent: 25 },

  { id: 36, name: 'Cơ Hội', type: 'CHANCE', price: 0, baseRent: 0 },
  { id: 37, name: 'Landmark 81 (TP.HCM)', type: 'PROPERTY', district: 8, districtColor: '#0984E3', price: 360, baseRent: 35, rentHouse1: 175, rentHouse2: 500, rentHouse3: 1350, rentHotel: 1850, houseCost: 200 },
  { id: 38, name: 'Thuế Xa Xỉ', type: 'TAX', price: 0, baseRent: 0, taxAmount: 100, description: 'Nộp phạt 100M vào ngân sách' },
  { id: 39, name: 'Nguyễn Huệ (TP.HCM)', type: 'PROPERTY', district: 8, districtColor: '#0984E3', price: 400, baseRent: 50, rentHouse1: 200, rentHouse2: 600, rentHouse3: 1450, rentHotel: 2000, houseCost: 200 }
];
