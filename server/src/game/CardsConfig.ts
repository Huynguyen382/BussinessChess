export type CardActionType =
  | 'ADD_MONEY'
  | 'SUB_MONEY'
  | 'MOVE_TO'
  | 'GO_TO_JAIL'
  | 'GET_OUT_OF_JAIL'
  | 'PAY_EACH_PLAYER'
  | 'COLLECT_FROM_EACH_PLAYER'
  | 'REPAIR_PROPERTY'
  | 'MOVE_STEPS'
  // Strategic and interactive mechanics
  | 'PROPERTY_ACQUISITION'
  | 'PROPERTY_SWAP'
  | 'RENT_WAIVER'
  | 'RENT_MULTIPLIER'
  | 'DISASTER'
  | 'TAX_AUDIT'
  | 'INSTANT_TRANSIT'
  | 'HOSPITAL_BOND'
  | 'MINI_EVENT'
  | 'DIVIDEND_PAYOUT';

export interface GameCard {
  id: string;
  type: 'CHANCE' | 'COMMUNITY_CHEST';
  title: string;
  description: string;
  action: CardActionType;
  value?: number;
  targetTileId?: number;
  costPerHouse?: number;
  costPerHotel?: number;
  steps?: number;
  multiplier?: number;
  percent?: number;
  metadata?: Record<string, any>;
}

export const CHANCE_CARDS: GameCard[] = [
  {
    id: 'ch_1',
    type: 'CHANCE',
    title: 'Trúng Thầu Cao Tốc Bắc Nam',
    description: 'Doanh nghiệp của bạn trúng thầu thi công gói cao tốc Bắc Nam trọng điểm quốc gia, nhận thưởng 200M.',
    action: 'ADD_MONEY',
    value: 200
  },
  {
    id: 'ch_2',
    type: 'CHANCE',
    title: 'Thu Phí Không Dừng VETC',
    description: 'Ô tô di chuyển qua trạm thu phí tự động không dừng, tài khoản giao thông tự trừ 30M.',
    action: 'SUB_MONEY',
    value: 30
  },
  {
    id: 'ch_3',
    type: 'CHANCE',
    title: 'Du Lịch Vịnh Hạ Long',
    description: 'Kỳ nghỉ dưỡng du thuyền 5 sao ngắm cảnh kỳ quan thiên nhiên thế giới, di chuyển thẳng đến [Hạ Long].',
    action: 'MOVE_TO',
    targetTileId: 27
  },
  {
    id: 'ch_4',
    type: 'CHANCE',
    title: 'Lệnh Bắt Tạm Giam',
    description: 'Thanh tra phát hiện dấu hiệu thao túng giá cổ phiếu và gian lận trái phiếu! Vào tù ngay lập tức.',
    action: 'GO_TO_JAIL'
  },
  {
    id: 'ch_5',
    type: 'CHANCE',
    title: 'Khảo Sát Landmark 81',
    description: 'Lên đỉnh Landmark 81 ngắm toàn cảnh Sài Gòn và khảo sát văn phòng hạng A, di chuyển đến [Landmark 81].',
    action: 'MOVE_TO',
    targetTileId: 37
  },
  {
    id: 'ch_6',
    type: 'CHANCE',
    title: 'Thẻ Đặc Xá Bộ Công An',
    description: 'Được cấp Thẻ Đặc Xá miễn tội giam giữ một lần duy nhất. Thẻ này có thể giữ lại để dùng khi cần.',
    action: 'GET_OUT_OF_JAIL'
  },
  {
    id: 'ch_7',
    type: 'CHANCE',
    title: 'Vé Số Vietlott Mega 6/45',
    description: 'Tấm vé số Vietlott may mắn trúng giải thưởng Jackpot lớn! Ngân hàng chuyển khoản ngay 250M.',
    action: 'ADD_MONEY',
    value: 250
  },
  {
    id: 'ch_8',
    type: 'CHANCE',
    title: 'Bảo Trì & Chống Thấm Mùa Mưa',
    description: 'Mưa bão lớn gây ngập úng và ẩm mốc công trình: Nộp chi phí sửa chữa 25M mỗi nhà, 100M mỗi khách sạn.',
    action: 'REPAIR_PROPERTY',
    costPerHouse: 25,
    costPerHotel: 100
  },
  {
    id: 'ch_9',
    type: 'CHANCE',
    title: 'Tiệc Tân Gia Biệt Thự Mới',
    description: 'Khai trương biệt thự sinh thái cao cấp, bạn hào phóng mừng phong bao lì xì cho mỗi người chơi 50M.',
    action: 'PAY_EACH_PLAYER',
    value: 50
  },
  {
    id: 'ch_10',
    type: 'CHANCE',
    title: 'Ùn Tắc Giao Thông Giờ Cao Điểm',
    description: 'Cầu Sài Gòn ùn tắc giao thông nghiêm trọng trong giờ tan tầm! Xe của bạn buộc phải lùi lại 3 bước.',
    action: 'MOVE_STEPS',
    steps: -3
  },
  {
    id: 'ch_11',
    type: 'CHANCE',
    title: 'Chuyến Tàu Thống Nhất Bắc Nam',
    description: 'Lên chuyến tàu hỏa cao tốc Thống Nhất khởi hành từ [Ga Hà Nội], di chuyển thẳng đến [Ga Hà Nội].',
    action: 'MOVE_TO',
    targetTileId: 35
  },
  {
    id: 'ch_12',
    type: 'CHANCE',
    title: 'Phạt Nguội Giao Thông Camera AI',
    description: 'Camera AI phát hiện phương tiện chạy quá tốc độ trên cao tốc Long Thành - Dầu Giây, nộp phạt 40M.',
    action: 'SUB_MONEY',
    value: 40
  },
  {
    id: 'ch_13',
    type: 'CHANCE',
    title: 'Chuyên Cơ VIP Về Khởi Hành',
    description: 'Chuyên cơ đưa bạn bay thẳng về ô [Khởi Hành (GO)] nhận ngay 200M tiền lương.',
    action: 'MOVE_TO',
    targetTileId: 0
  },
  {
    id: 'ch_14',
    type: 'CHANCE',
    title: 'Du Lịch Nghỉ Dưỡng Vũng Tàu',
    description: 'Cuối tuần lái xe đi tắm biển và thưởng thức hải sản Vũng Tàu, di chuyển thẳng tới [Vũng Tàu].',
    action: 'MOVE_TO',
    targetTileId: 6
  },
  {
    id: 'ch_15',
    type: 'CHANCE',
    title: 'Xuất Khẩu Cà Phê Robusta Tây Nguyên',
    description: 'Hợp đồng xuất khẩu cà phê Robusta Buôn Ma Thuột sang thị trường châu Âu đạt mức giá kỷ lục, thu về 120M.',
    action: 'ADD_MONEY',
    value: 120
  },
  {
    id: 'ch_16',
    type: 'CHANCE',
    title: 'Quyên Góp Bão Lũ Miền Trung',
    description: 'Chung tay cùng đồng bào miền Trung vượt qua mùa bão lũ lịch sử, ủng hộ quỹ cứu trợ thiên tai 80M.',
    action: 'SUB_MONEY',
    value: 80
  },
  {
    id: 'ch_17',
    type: 'CHANCE',
    title: 'Đầu Tư Kỳ Lân Công Nghệ AI',
    description: 'Startup trí tuệ nhân tạo của bạn được quỹ đầu tư Silicon Valley định giá triệu đô, chia thưởng 180M.',
    action: 'ADD_MONEY',
    value: 180
  },
  {
    id: 'ch_18',
    type: 'CHANCE',
    title: 'Quy Hoạch Đất Vàng Đô Thị',
    description: 'Quyết định phê duyệt dự án khu đô thị mới: Bạn được cấp quyền sở hữu ngay 1 ô đất trống tiếp theo trên bàn cờ hoặc nhận 180M đền bù giải tỏa.',
    action: 'PROPERTY_ACQUISITION',
    value: 180
  },
  {
    id: 'ch_19',
    type: 'CHANCE',
    title: 'Bùng Nổ Mùa Lễ Hội Du Lịch',
    description: 'Khách du lịch quốc tế đổ về tham quan, kích cầu kinh tế bùng nổ: Tiền thuê tiếp theo bạn thu được sẽ được nhân đôi (x2)!',
    action: 'RENT_MULTIPLIER',
    multiplier: 2
  },
  {
    id: 'ch_20',
    type: 'CHANCE',
    title: 'Kiểm Toán Thuế Toàn Diện',
    description: 'Thanh tra tài chính tiến hành kiểm toán danh mục đầu tư: Nộp phạt và truy thu thuế 15M cho mỗi bất động sản đang sở hữu.',
    action: 'TAX_AUDIT',
    value: 15
  },
  {
    id: 'ch_21',
    type: 'CHANCE',
    title: 'Chuyên Tuyến Tàu Cao Tốc Shinkansen',
    description: 'Hệ thống đường sắt tốc độ cao đưa bạn di chuyển thẳng tới Bến Xe / Nhà Ga gần nhất. Nếu đi qua Khởi Hành nhận 200M.',
    action: 'INSTANT_TRANSIT'
  },
  {
    id: 'ch_22',
    type: 'CHANCE',
    title: 'Bão Lũ Siêu Cấp & Sạt Lở',
    description: 'Cơn bão đổ bộ tàn phá hạ tầng: Giảm 1 cấp công trình trên bất động sản cao nhất hoặc chi 60M gia cố khẩn cấp.',
    action: 'DISASTER',
    value: 60
  },
  {
    id: 'ch_23',
    type: 'CHANCE',
    title: 'Cổ Tức Quỹ Đầu Tư Bất Động Sản',
    description: 'Quỹ REIT công bố kết quả kinh doanh vượt bậc: Nhận cổ tức 30M cho mỗi bất động sản bạn đang nắm giữ.',
    action: 'DIVIDEND_PAYOUT',
    value: 30
  },
  {
    id: 'ch_24',
    type: 'CHANCE',
    title: 'Thương Vụ Mua Bán Sáp Nhập (M&A)',
    description: 'Tái cơ cấu danh mục tài sản thông qua sáp nhập doanh nghiệp: Hoán đổi 1 bất động sản với đối thủ hoặc nhận 100M phí tư vấn.',
    action: 'PROPERTY_SWAP',
    value: 100
  },
  {
    id: 'ch_25',
    type: 'CHANCE',
    title: 'Đại Nhạc Hội Countdown Giao Thừa',
    description: 'Sự kiện âm nhạc quốc tế countdown náo nhiệt: Tất cả người chơi nhận lì xì may mắn đầu năm 50M.',
    action: 'MINI_EVENT',
    value: 50
  }
];

export const COMMUNITY_CHEST_CARDS: GameCard[] = [
  {
    id: 'cc_1',
    type: 'COMMUNITY_CHEST',
    title: 'Lì Xì Tết Nguyên Đán',
    description: 'Khai xuân đón lộc đầu năm, nhận phong bao lì xì may mắn từ đối tác và đại gia đình, tài khoản nhận +150M.',
    action: 'ADD_MONEY',
    value: 150
  },
  {
    id: 'cc_2',
    type: 'COMMUNITY_CHEST',
    title: 'Thưởng Kinh Doanh Cuối Năm',
    description: 'Tập đoàn vượt kế hoạch lợi nhuận cả năm, hội đồng quản trị duyệt chi thưởng Tết 100M.',
    action: 'ADD_MONEY',
    value: 100
  },
  {
    id: 'cc_3',
    type: 'COMMUNITY_CHEST',
    title: 'Tiệc Sinh Nhật Doanh Nhân',
    description: 'Chúc mừng sinh nhật bạn! Mỗi người chơi gửi tặng phong bao chúc mừng trị giá 50M.',
    action: 'COLLECT_FROM_EACH_PLAYER',
    value: 50
  },
  {
    id: 'cc_4',
    type: 'COMMUNITY_CHEST',
    title: 'Nâng Cấp Hệ Thống PCCC Thông Minh',
    description: 'Trang bị hệ thống báo cháy tự động sprinkler đạt chuẩn an toàn: Trả 40M mỗi nhà, 115M mỗi khách sạn.',
    action: 'REPAIR_PROPERTY',
    costPerHouse: 40,
    costPerHotel: 115
  },
  {
    id: 'cc_5',
    type: 'COMMUNITY_CHEST',
    title: 'Học Phí Trường Quốc Tế',
    description: 'Thanh toán học phí học kỳ mới cho con em tại trường quốc tế song ngữ, nộp 50M.',
    action: 'SUB_MONEY',
    value: 50
  },
  {
    id: 'cc_6',
    type: 'COMMUNITY_CHEST',
    title: 'Bảo Lãnh Luật Sư Uy Tín',
    description: 'Đoàn luật sư uy tín bảo lãnh thủ tục tại ngoại thành công. Nhận 1 Thẻ Đặc Xá miễn tội ra tù.',
    action: 'GET_OUT_OF_JAIL'
  },
  {
    id: 'cc_7',
    type: 'COMMUNITY_CHEST',
    title: 'Khám Phá Phố Cổ Hà Nội',
    description: 'Thưởng ngoạn 36 phố phường nghìn năm văn hiến và thưởng thức ẩm thực Hà Thành, di chuyển đến [Phố Cổ (Hà Nội)].',
    action: 'MOVE_TO',
    targetTileId: 32
  },
  {
    id: 'cc_8',
    type: 'COMMUNITY_CHEST',
    title: 'Cổ Tức Cổ Phiếu VN30',
    description: 'Nhận cổ tức tiền mặt định kỳ từ danh mục cổ phiếu bluechip hàng đầu sàn chứng khoán, nhận +120M.',
    action: 'ADD_MONEY',
    value: 120
  },
  {
    id: 'cc_9',
    type: 'COMMUNITY_CHEST',
    title: 'Vi Phạm Nồng Độ Cồn Kịch Khung',
    description: 'Điều khiển ô tô sau khi uống bia rượu vi phạm Nghị định 100! Bị giữ xe và đưa vào đồn tạm giam ngay lập tức.',
    action: 'GO_TO_JAIL'
  },
  {
    id: 'cc_10',
    type: 'COMMUNITY_CHEST',
    title: 'Góp Vốn Dự Án Năng Lượng Xanh',
    description: 'Kêu gọi thành công dự án điện mặt trời mái nhà và trạm sạc xe điện, mỗi người chơi góp cho bạn 40M.',
    action: 'COLLECT_FROM_EACH_PLAYER',
    value: 40
  },
  {
    id: 'cc_11',
    type: 'COMMUNITY_CHEST',
    title: 'Du Lịch Cố Đô Huế',
    description: 'Thăm Đại Nội Kinh Thành Huế và thưởng thức ca trù sông Hương, di chuyển thẳng đến ô [Huế].',
    action: 'MOVE_TO',
    targetTileId: 21
  },
  {
    id: 'cc_12',
    type: 'COMMUNITY_CHEST',
    title: 'Khám Sức Khỏe Tổng Quát Định Kỳ',
    description: 'Gói tầm soát sức khỏe toàn diện và phục hồi chức năng kỹ thuật cao, thanh toán 30M.',
    action: 'SUB_MONEY',
    value: 30
  },
  {
    id: 'cc_13',
    type: 'COMMUNITY_CHEST',
    title: 'Hoàn Thuế Thu Nhập Điện Tử',
    description: 'Hoàn tất thủ tục quyết toán thuế thu nhập cá nhân trên ứng dụng eTax Mobile, nhận tiền hoàn lại 60M.',
    action: 'ADD_MONEY',
    value: 60
  },
  {
    id: 'cc_14',
    type: 'COMMUNITY_CHEST',
    title: 'Chiêu Đãi Tiệc Tất Niên Công Ty',
    description: 'Mời tất cả bạn hữu và đối thủ tham dự đêm hội tiệc tất niên ấm cúng, gửi tặng mỗi người chơi 30M.',
    action: 'PAY_EACH_PLAYER',
    value: 30
  },
  {
    id: 'cc_15',
    type: 'COMMUNITY_CHEST',
    title: 'Bán Nông Sản Sầu Riêng Xuất Khẩu',
    description: 'Vụ mùa sầu riêng Đắk Lắk được xuất khẩu chính ngạch sang thị trường quốc tế, lợi nhuận ròng 90M.',
    action: 'ADD_MONEY',
    value: 90
  },
  {
    id: 'cc_16',
    type: 'COMMUNITY_CHEST',
    title: 'Dạo Chơi Phố Đi Bộ Nguyễn Huệ',
    description: 'Hòa mình vào không khí nhộn nhịp tại phố đi bộ trung tâm thành phố, tiến thẳng đến [Nguyễn Huệ].',
    action: 'MOVE_TO',
    targetTileId: 39
  },
  {
    id: 'cc_17',
    type: 'COMMUNITY_CHEST',
    title: 'Bảo Dưỡng & Đăng Kiểm Đoàn Xe Vận Tải',
    description: 'Bảo trì định kỳ và đăng kiểm hệ thống xe logistics đạt chuẩn khí thải xanh, chi phí 40M.',
    action: 'SUB_MONEY',
    value: 40
  },
  {
    id: 'cc_18',
    type: 'COMMUNITY_CHEST',
    title: 'Thẻ Miễn Trừ Tiền Thuê VIP',
    description: 'Mối quan hệ ngoại giao cấp cao: Bạn nhận 1 Thẻ Miễn Phí Tiền Thuê VIP, tự động miễn phí 100% khi dừng chân tại đất đối thủ.',
    action: 'RENT_WAIVER',
    value: 1
  },
  {
    id: 'cc_19',
    type: 'COMMUNITY_CHEST',
    title: 'Bảo Lãnh Y Tế & Trái Phiếu Viện Phí',
    description: 'Gói bảo hiểm sức khỏe VIP toàn diện: Cấp thẻ bảo lãnh viện phí và pháp lý (miễn trừ 1 lần phí phạt hoặc tiền bảo lãnh tù).',
    action: 'HOSPITAL_BOND',
    value: 1
  },
  {
    id: 'cc_20',
    type: 'COMMUNITY_CHEST',
    title: 'Cổ Tức Tập Đoàn Công Nghệ VN30',
    description: 'Tập đoàn công nghệ hàng đầu chi trả cổ tức tiền mặt định kỳ: Nhận 25M cho mỗi bất động sản trong danh mục đầu tư.',
    action: 'DIVIDEND_PAYOUT',
    value: 25
  },
  {
    id: 'cc_21',
    type: 'COMMUNITY_CHEST',
    title: 'Thanh Tra Chống Thất Thu Thuế',
    description: 'Cơ quan thuế kiểm tra số dư lưu động: Đóng thuế tài sản 5% tổng số dư tiền mặt hiện tại.',
    action: 'TAX_AUDIT',
    percent: 5
  },
  {
    id: 'cc_22',
    type: 'COMMUNITY_CHEST',
    title: 'Tuyến Tuyến Metro Số 1 Khai Trương',
    description: 'Trải nghiệm tuyến Metro hiện đại: Di chuyển tức thì đến Bến Xe / Nhà Ga gần nhất. Đi qua GO nhận 200M.',
    action: 'INSTANT_TRANSIT'
  },
  {
    id: 'cc_23',
    type: 'COMMUNITY_CHEST',
    title: 'Thanh Lý Tài Sản Ngân Hàng',
    description: 'Ngân hàng phát mãi tài sản nợ xấu với giá ưu đãi: Bạn được sở hữu 1 bất động sản trống tiếp theo hoặc nhận 120M tiền mặt.',
    action: 'PROPERTY_ACQUISITION',
    value: 120
  },
  {
    id: 'cc_24',
    type: 'COMMUNITY_CHEST',
    title: 'Ngày Hội Khởi Nghiệp Đổi Mới Sáng Tạo',
    description: 'Vườn ươm doanh nghiệp khởi nghiệp tài trợ vốn: Mỗi người chơi không ở trong tù nhận 60M từ ngân quỹ phát triển.',
    action: 'MINI_EVENT',
    value: 60
  },
  {
    id: 'cc_25',
    type: 'COMMUNITY_CHEST',
    title: 'Chuyển Giao Quyền Sử Dụng Đất',
    description: 'Thỏa thuận hợp tác liên danh dự án: Hoán đổi 1 bất động sản hoặc nhận 80M hỗ trợ tài chính.',
    action: 'PROPERTY_SWAP',
    value: 80
  }
];
