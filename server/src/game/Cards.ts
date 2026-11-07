export interface GameCard {
  id: string;
  type: 'CHANCE' | 'COMMUNITY_CHEST';
  title: string;
  description: string;
  action: 'ADD_MONEY' | 'SUB_MONEY' | 'MOVE_TO' | 'GO_TO_JAIL' | 'GET_OUT_OF_JAIL';
  value?: number;
  targetTileId?: number;
}

export const CHANCE_CARDS: GameCard[] = [
  { id: 'ch_1', type: 'CHANCE', title: 'Trúng Thầu Dự Án', description: 'Tập đoàn trúng gói thầu công nghệ lớn, nhận thưởng 150M.', action: 'ADD_MONEY', value: 150 },
  { id: 'ch_2', type: 'CHANCE', title: 'Thanh Tra Thuế', description: 'Cơ quan kiểm toán phát hiện sai phạm, nộp phạt 100M.', action: 'SUB_MONEY', value: 100 },
  { id: 'ch_3', type: 'CHANCE', title: 'Chuyến Bay VIP', description: 'Lên chuyến bay đặc biệt tiến thẳng về ô Khởi Hành (GO) nhận 200M.', action: 'MOVE_TO', targetTileId: 0 },
  { id: 'ch_4', type: 'CHANCE', title: 'Lệnh Bắt Giữ', description: 'Có dấu hiệu thao túng thị trường chứng khoán! Vào tù ngay lập tức.', action: 'GO_TO_JAIL' },
  { id: 'ch_5', type: 'CHANCE', title: 'Đầu Tư Bất Động Sản', description: 'Du lịch đến phố đi bộ Nguyễn Huệ để khảo sát thị trường.', action: 'MOVE_TO', targetTileId: 39 },
  { id: 'ch_6', type: 'CHANCE', title: 'Thẻ Đặc Xá', description: 'Thẻ miễn phạt ra tù một lần miễn phí.', action: 'GET_OUT_OF_JAIL' }
];

export const COMMUNITY_CHEST_CARDS: GameCard[] = [
  { id: 'cc_1', type: 'COMMUNITY_CHEST', title: 'Cổ Tức Cổ Phiếu', description: 'Nhận cổ tức cuối năm từ ngân hàng, tài khoản tăng 200M.', action: 'ADD_MONEY', value: 200 },
  { id: 'cc_2', type: 'COMMUNITY_CHEST', title: 'Bảo Trì Tòa Nhà', description: 'Sửa chữa hệ thống điều hòa và thang máy, chi phí 80M.', action: 'SUB_MONEY', value: 80 },
  { id: 'cc_3', type: 'COMMUNITY_CHEST', title: 'Quỹ Từ Thiện', description: 'Đóng góp xây dựng trường học vùng cao, nộp 50M.', action: 'SUB_MONEY', value: 50 },
  { id: 'cc_4', type: 'COMMUNITY_CHEST', title: 'Giải Thưởng Doanh Nhân', description: 'Được bình chọn là Doanh nhân tiêu biểu của năm, nhận 100M.', action: 'ADD_MONEY', value: 100 },
  { id: 'cc_5', type: 'COMMUNITY_CHEST', title: 'Nghỉ Dưỡng Vũng Tàu', description: 'Di chuyển thẳng tới bãi biển Vũng Tàu xả stress.', action: 'MOVE_TO', targetTileId: 6 }
];
