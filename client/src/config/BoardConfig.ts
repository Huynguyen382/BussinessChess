export interface BoardTileMeta {
  id: number;
  name: string;
  type: string;
  district?: number;
  districtColor?: string;
  price: number;
}

export const DEFAULT_BOARD_TILES: BoardTileMeta[] = [
  { id: 0, name: 'Khởi Hành (GO)', type: 'GO', price: 0 },
  { id: 1, name: 'Cần Thơ', type: 'PROPERTY', district: 1, districtColor: '#6C5CE7', price: 60 },
  { id: 2, name: 'Khí Vận', type: 'COMMUNITY_CHEST', price: 0 },
  { id: 3, name: 'Cà Mau', type: 'PROPERTY', district: 1, districtColor: '#6C5CE7', price: 70 },
  { id: 4, name: 'Thuế Thu Nhập', type: 'TAX', price: 0 },
  { id: 5, name: 'Bến Xe Miền Tây', type: 'RAILROAD', price: 200 },
  
  { id: 6, name: 'Vũng Tàu', type: 'PROPERTY', district: 2, districtColor: '#74B9FF', price: 100 },
  { id: 7, name: 'Cơ Hội', type: 'CHANCE', price: 0 },
  { id: 8, name: 'Phan Thiết', type: 'PROPERTY', district: 2, districtColor: '#74B9FF', price: 110 },
  { id: 9, name: 'Nha Trang', type: 'PROPERTY', district: 2, districtColor: '#74B9FF', price: 120 },

  { id: 10, name: 'Nhà Tù / Thăm Tù', type: 'JAIL', price: 0 },
  { id: 11, name: 'Đà Lạt', type: 'PROPERTY', district: 3, districtColor: '#FD79A8', price: 140 },
  { id: 12, name: 'Điện Lực', type: 'UTILITY', price: 150 },
  { id: 13, name: 'Buôn Ma Thuột', type: 'PROPERTY', district: 3, districtColor: '#FD79A8', price: 150 },
  { id: 14, name: 'Pleiku', type: 'PROPERTY', district: 3, districtColor: '#FD79A8', price: 160 },
  { id: 15, name: 'Ga Sài Gòn', type: 'RAILROAD', price: 200 },

  { id: 16, name: 'Quy Nhơn', type: 'PROPERTY', district: 4, districtColor: '#FF7675', price: 180 },
  { id: 17, name: 'Khí Vận', type: 'COMMUNITY_CHEST', price: 0 },
  { id: 18, name: 'Hội An', type: 'PROPERTY', district: 4, districtColor: '#FF7675', price: 190 },
  { id: 19, name: 'Đà Nẵng', type: 'PROPERTY', district: 4, districtColor: '#FF7675', price: 200 },

  { id: 20, name: 'Bãi Đỗ Xe', type: 'FREE_PARKING', price: 0 },
  { id: 21, name: 'Huế', type: 'PROPERTY', district: 5, districtColor: '#E84393', price: 220 },
  { id: 22, name: 'Cơ Hội', type: 'CHANCE', price: 0 },
  { id: 23, name: 'Phong Nha', type: 'PROPERTY', district: 5, districtColor: '#E84393', price: 230 },
  { id: 24, name: 'Cửa Lò', type: 'PROPERTY', district: 5, districtColor: '#E84393', price: 240 },
  { id: 25, name: 'Ga Đà Nẵng', type: 'RAILROAD', price: 200 },

  { id: 26, name: 'Hải Phòng', type: 'PROPERTY', district: 6, districtColor: '#FDCB6E', price: 260 },
  { id: 27, name: 'Hạ Long', type: 'PROPERTY', district: 6, districtColor: '#FDCB6E', price: 270 },
  { id: 28, name: 'Cấp Nước', type: 'UTILITY', price: 150 },
  { id: 29, name: 'Tràng An', type: 'PROPERTY', district: 6, districtColor: '#FDCB6E', price: 280 },

  { id: 30, name: 'Vào Tù Ngay', type: 'GO_TO_JAIL', price: 0 },
  { id: 31, name: 'Hồ Tây', type: 'PROPERTY', district: 7, districtColor: '#00B894', price: 300 },
  { id: 32, name: 'Phố Cổ HN', type: 'PROPERTY', district: 7, districtColor: '#00B894', price: 310 },
  { id: 33, name: 'Khí Vận', type: 'COMMUNITY_CHEST', price: 0 },
  { id: 34, name: 'Tràng Tiền', type: 'PROPERTY', district: 7, districtColor: '#00B894', price: 320 },
  { id: 35, name: 'Ga Hà Nội', type: 'RAILROAD', price: 200 },

  { id: 36, name: 'Cơ Hội', type: 'CHANCE', price: 0 },
  { id: 37, name: 'Landmark 81', type: 'PROPERTY', district: 8, districtColor: '#0984E3', price: 360 },
  { id: 38, name: 'Thuế Xa Xỉ', type: 'TAX', price: 0 },
  { id: 39, name: 'Nguyễn Huệ', type: 'PROPERTY', district: 8, districtColor: '#0984E3', price: 400 }
];
