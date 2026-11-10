import confetti from 'canvas-confetti';
import { BoardScene } from './three/BoardScene';
import { socketClient } from './network/SocketClient';
import { sounds } from './components/AudioSynth';

// App State
let boardScene: BoardScene;
let myUserId: string = '';
let currentRoomCode: string = '';
let isHost: boolean = false;
let currentPendingTileAction: any = null;
let boardTilesData: any[] = [];
let latestPlayersSnapshot: any[] = [];
let latestPropertiesSnapshot: any[] = [];

// DOM Elements
const elLobbyView = document.getElementById('lobby-view')!;
const elLobbyCard = document.getElementById('lobby-card')!;
const btnToggleLobbyView = document.getElementById('btn-toggle-lobby-view')!;
const btnRestoreLobby = document.getElementById('btn-restore-lobby')!;

const elCreateModal = document.getElementById('create-room-modal')!;
const elRoomWaiting = document.getElementById('room-waiting-modal')!;
const elGameHud = document.getElementById('game-hud')!;
const elPropertyModal = document.getElementById('property-modal')!;
const elCardModal = document.getElementById('card-modal')!;
const elVictoryModal = document.getElementById('victory-modal')!;
const elLogDrawer = document.getElementById('log-drawer')!;

// Navigation & Camera Controls
const btnToggleZoom = document.getElementById('btn-toggle-zoom');
const btnOpenRoster = document.getElementById('btn-open-roster');
const btnToggleCamLock = document.getElementById('btn-toggle-cam-lock');
const btnToggleFollow = document.getElementById('btn-toggle-follow')!;
const btnResetCam = document.getElementById('btn-reset-cam')!;
const btnToggleLog = document.getElementById('btn-toggle-log')!;
const btnCloseLog = document.getElementById('btn-close-log')!;
const logItems = document.getElementById('log-items')!;

// Tile Inspector Floating Card
const elTileInspector = document.getElementById('tile-inspector-card')!;
const btnCloseInspector = document.getElementById('btn-close-inspector')!;
const inspectorHeaderBg = document.getElementById('inspector-header-bg')!;
const inspectorTileBadge = document.getElementById('inspector-tile-badge')!;
const inspectorLandmarkIcon = document.getElementById('inspector-landmark-icon')!;
const inspectorTileName = document.getElementById('inspector-tile-name')!;
const inspectorDistrictName = document.getElementById('inspector-district-name')!;
const inspectorLandmarkSubtitle = document.getElementById('inspector-landmark-subtitle');
const inspectorOwnerInfo = document.getElementById('inspector-owner-info')!;
const inspectorOwnerAvatar = document.getElementById('inspector-owner-avatar')!;
const inspectorOwnerName = document.getElementById('inspector-owner-name')!;
const inspectorBuildingLevel = document.getElementById('inspector-building-level')!;
const inspectorPropertyDetails = document.getElementById('inspector-property-details')!;
const inspectorPriceValue = document.getElementById('inspector-price-value')!;
const inspectorRentBase = document.getElementById('inspector-rent-base')!;
const inspectorRentH1 = document.getElementById('inspector-rent-h1')!;
const inspectorRentH2 = document.getElementById('inspector-rent-h2')!;
const inspectorRentH3 = document.getElementById('inspector-rent-h3')!;
const inspectorRentHotel = document.getElementById('inspector-rent-hotel')!;
const inspectorHouseCost = document.getElementById('inspector-house-cost')!;
const inspectorSpecialDesc = document.getElementById('inspector-special-desc')!;

// Board Roster Modal
const elBoardRosterModal = document.getElementById('board-roster-modal')!;
const btnCloseRoster = document.getElementById('btn-close-roster')!;
const rosterTilesList = document.getElementById('roster-tiles-list')!;
const rosterFilterTabs = document.getElementById('roster-filter-tabs')!;

const inputUsername = document.getElementById('input-username') as HTMLInputElement;
const inputRoomCode = document.getElementById('input-room-code') as HTMLInputElement;
const btnOpenCreate = document.getElementById('btn-open-create-room')!;
const btnQuickBotGame = document.getElementById('btn-quick-bot-game')!;
const btnJoinRoom = document.getElementById('btn-join-room')!;
const btnRefreshRooms = document.getElementById('btn-refresh-rooms')!;
const roomListContainer = document.getElementById('room-list-container')!;

const btnCancelCreate = document.getElementById('btn-cancel-create')!;
const btnConfirmCreate = document.getElementById('btn-confirm-create')!;
const createRoomName = document.getElementById('create-room-name') as HTMLInputElement;
const createMaxPlayers = document.getElementById('create-max-players') as HTMLSelectElement;
const createInitialCash = document.getElementById('create-initial-cash') as HTMLSelectElement;

const waitingRoomName = document.getElementById('waiting-room-name')!;
const waitingRoomCode = document.getElementById('waiting-room-code')!;
const waitingPlayerCount = document.getElementById('waiting-player-count')!;
const waitingSlots = document.getElementById('waiting-slots')!;
const btnCopyCode = document.getElementById('btn-copy-code')!;
const btnAddBot = document.getElementById('btn-add-bot')!;
const btnStartGame = document.getElementById('btn-start-game')!;

const hudPlayers = document.getElementById('hud-players')!;
const timerFill = document.getElementById('timer-fill')!;
const hudToast = document.getElementById('hud-toast')!;
const turnStatusDot = document.getElementById('turn-status-dot');
const turnStatusText = document.getElementById('turn-status-text');
const btnRollDice = document.getElementById('btn-roll-dice')!;
const btnEndTurn = document.getElementById('btn-end-turn')!;

const propColorBar = document.getElementById('prop-color-bar')!;
const propIcon = document.getElementById('prop-icon');
const propBadge = document.getElementById('prop-badge');
const propTitle = document.getElementById('prop-title')!;
const propPrice = document.getElementById('prop-price')!;
const propDesc = document.getElementById('prop-desc')!;
const propRentPreview = document.getElementById('prop-rent-preview');
const btnSkipBuy = document.getElementById('btn-skip-buy')!;
const btnConfirmBuy = document.getElementById('btn-confirm-buy')!;

const cardBadge = document.getElementById('card-badge')!;
const cardIcon = document.getElementById('card-icon')!;
const cardTitle = document.getElementById('card-title')!;
const cardDesc = document.getElementById('card-desc')!;
const btnCloseCard = document.getElementById('btn-close-card')!;

const victoryWinnerName = document.getElementById('victory-winner-name')!;
const victoryRankings = document.getElementById('victory-rankings')!;
const btnPlayAgain = document.getElementById('btn-play-again')!;

const LANDMARK_ICONS: Record<number, string> = {
  0: '👑',  // Khởi hành (GO - Khải Hoàn Môn Hoàng Gia)
  1: '🛶',  // Cần Thơ (Cầu Cần Thơ & Chợ Nổi Cái Răng)
  2: '🎁',  // Khí vận
  3: '⛵',  // Cà Mau (Cột Mốc GPS 0001 & Con Tàu Mũi Cà Mau)
  4: '👛',  // Thuế thu nhập
  5: '🚂',  // Ga Miền Tây (Đầu Máy Hơi Nước Cổ Điển)
  6: '🗼',  // Vũng Tàu (Hải Đăng Cổ Núi Nhỏ & Hoa Giấy)
  7: '❓',  // Cơ hội
  8: '🏜️', // Phan Thiết (Tháp Chăm Poshanư & Đồi Cát Bay)
  9: '🪷',  // Nha Trang (Tháp Trầm Hương Búp Sen)
  10: '🔒', // Nhà Tù (Pháo Đài Đá & Tháp Canh)
  11: '🌸', // Đà Lạt (Ga Cổ Đà Lạt & Đồi Thông Sương Mù)
  12: '💡', // Công Ty Điện Lực
  13: '☕', // Buôn Ma Thuột (Nhà Rông & Cồng Chiêng)
  14: '🌲', // Pleiku (Biển Hồ Tơ Nưng & Rừng Cao Su)
  15: '🚂', // Ga Sài Gòn (Đầu Máy Hơi Nước Cổ Điển)
  16: '🏯', // Quy Nhơn (Tháp Đôi Chăm Pa & Eo Gió)
  17: '🎁', // Khí vận
  18: '🏮', // Hội An (Chùa Cầu & Đèn Lồng Ngũ Sắc)
  19: '🌉', // Đà Nẵng (Cầu Rồng Sông Hàn Phun Lửa)
  20: '⛽', // Bãi Đỗ Xe (Trạm Dừng Chân Retro Americana)
  21: '🏯', // Huế (Ngọ Môn Đại Nội & Kỳ Đài)
  22: '❓', // Cơ hội
  23: '🏞️', // Quảng Bình (Kỳ Quan Hang Sơn Đoòng)
  24: '🏝️', // Cửa Lò (Đảo Lan Châu & Cầu Cảng)
  25: '🚂', // Ga Đà Nẵng (Đầu Máy Hơi Nước Cổ Điển)
  26: '🌉', // Hải Phòng (Cầu Hoàng Văn Thụ & Cảng Container)
  27: '⛵', // Quảng Ninh (Vịnh Hạ Long & Hòn Trống Mái)
  28: '💧', // Công Ty Cấp Nước
  29: '🐉', // Ninh Bình (Đỉnh Ngọa Long Hang Múa & Tràng An)
  30: '🚨', // Vào Tù Ngay (Đồn Cảnh Sát & Còi Hụ)
  31: '🪷', // Hồ Tây (Chùa Trấn Quốc & Cây Bồ Đề)
  32: '🏮', // Phố Cổ Hà Nội (Cửa Ô Quan Chưởng)
  33: '🎁', // Khí vận
  34: '🇻🇳', // Ba Đình / Tràng Tiền (Cột Cờ Hà Nội)
  35: '🚂', // Ga Hà Nội (Đầu Máy Hơi Nước Cổ Điển)
  36: '❓', // Cơ hội
  37: '🏙️', // TP.HCM (Tháp Bó Tre Landmark 81)
  38: '💎', // Thuế Xa Xỉ
  39: '🏛️'  // Đại Lộ Sài Gòn (Chợ Bến Thành & Quảng Trường)
};

const LANDMARK_SUBTITLES: Record<number, string> = {
  0: 'Khải Hoàn Môn Hoàng Gia • Nhận +200M',
  1: 'Cầu Cần Thơ & Chợ Nổi Cái Răng',
  2: 'Rương Báu Hoàng Gia Dập Nổi',
  3: 'Cột Mốc GPS 0001 & Mũi Tàu Cà Mau',
  4: 'Kho Bạc Nhà Nước • Thuế 100M',
  5: 'Đầu Máy Hơi Nước & Đèn Tín Hiệu Đường Sắt',
  6: 'Hải Đăng Núi Nhỏ & Rặng Hoa Giấy Hồng',
  7: 'Thẻ Vận Mệnh Cam Dập Chìm',
  8: 'Tháp Chăm Poshanư & Đồi Cát Bay Cam Cháy',
  9: 'Tháp Trầm Hương Búp Sen & Vịnh San Hô',
  10: 'Pháo Đài Đá Xám & Đèn Pha Tháp Canh 360°',
  11: 'Ga Cổ Đà Lạt 3 Chóp & Đồi Thông Sương Mù',
  12: 'Tiện Ích Đô Thị • Lưới Điện Quốc Gia',
  13: 'Nhà Rông Tây Nguyên & Dàn Cồng Chiêng',
  14: 'Biển Hồ Tơ Nưng & Rừng Cao Su Mùa Lá Vàng',
  15: 'Đầu Máy Hơi Nước & Đèn Tín Hiệu Đường Sắt',
  16: 'Cặp Tháp Đôi Chăm Pa & Vách Đá Eo Gió',
  17: 'Rương Báu Hoàng Gia Dập Nổi',
  18: 'Chùa Cầu Hoài Phố & Đèn Lồng Ngũ Sắc',
  19: 'Cầu Rồng Sông Hàn Phun Lửa & Khói Sáng',
  20: 'Trạm Xăng Retro Route 66 & Siêu Xe Mui Trần',
  21: 'Ngọ Môn 5 Cửa, Lầu Ngũ Phụng & Kỳ Đài',
  22: 'Thẻ Vận Mệnh Cam Dập Chìm',
  23: 'Hang Sơn Đoòng, Hố Sụt Doline & Măng Đá',
  24: 'Đảo Lan Châu Hình Cóc & Cầu Cảng Cửa Lò',
  25: 'Đầu Máy Hơi Nước & Đèn Tín Hiệu Đường Sắt',
  26: 'Cầu Hoàng Văn Thụ Cánh Chim Biển & Cảng Biển',
  27: 'Vịnh Hạ Long Hòn Trống Mái & Thuyền Cánh Dơi',
  28: 'Tiện Ích Đô Thị • Nhà Máy Nước Tinh Khiết',
  29: 'Đỉnh Ngọa Long Hang Múa & Lúa Vàng Tràng An',
  30: 'Đồn Cảnh Sát Navy, Còi Hụ & Rào Chắn',
  31: 'Bảo Tháp Lục Độ Đài Sen Chùa Trấn Quốc',
  32: 'Cửa Ô Quan Chưởng & Mái Ngói Vảy Cá Phố Cổ',
  33: 'Rương Báu Hoàng Gia Dập Nổi',
  34: 'Kỳ Đài Cột Cờ Hà Nội 3 Tầng Đế Gạch Đỏ',
  35: 'Đầu Máy Hơi Nước & Đèn Tín Hiệu Đường Sắt',
  36: 'Thẻ Vận Mệnh Cam Dập Chìm',
  37: 'Tòa Tháp Bó Tre Landmark 81 & Đỉnh Spire',
  38: 'Thuế Tiêu Dùng Siêu Xa Xỉ • 100M',
  39: 'Tháp Đồng Hồ Chợ Bến Thành & Quảng Trường'
};

const DISTRICT_NAMES: Record<number, string> = {
  1: 'Phân khu 1 • Iris Purple',
  2: 'Phân khu 2 • Xanh Dương Nhạt',
  3: 'Phân khu 3 • Hồng Phấn',
  4: 'Phân khu 4 • Cam San Hô',
  5: 'Phân khu 5 • Đỏ Ruby',
  6: 'Phân khu 6 • Vàng Hoàng Gia',
  7: 'Phân khu 7 • Xanh Ngọc Bích',
  8: 'Phân khu 8 • Xanh Lam Đậm'
};

let currentInspectedTileId: number | null = null;
let currentRosterFilter = 'ALL';

function showTileInspector(tileId: number, tileData?: any) {
  const tile = tileData || (boardTilesData && boardTilesData[tileId]);
  if (!tile) return;
  currentInspectedTileId = tileId;

  const landmarkIcon = LANDMARK_ICONS[tileId] || '📍';
  const typeLabel = 
    tile.type === 'PROPERTY' ? 'BẤT ĐỘNG SẢN' :
    tile.type === 'RAILROAD' ? 'BẾN XE / NHÀ GA' :
    tile.type === 'UTILITY' ? 'CÔNG TY TIỆN ÍCH' :
    tile.type === 'CHANCE' ? 'THẺ CƠ HỘI' :
    tile.type === 'COMMUNITY_CHEST' ? 'THẺ KHÍ VẬN' :
    tile.type === 'TAX' ? 'THUẾ VÀ LỆ PHÍ' :
    tile.type === 'GO' ? 'KHỞI HÀNH (GO)' :
    tile.type === 'JAIL' ? 'NHÀ TÙ / THĂM TÙ' :
    tile.type === 'FREE_PARKING' ? 'BÃI ĐỖ XE MIỄN PHÍ' :
    tile.type === 'GO_TO_JAIL' ? 'LỆNH BẮT VÀO TÙ' : 'ĐỊA ĐIỂM';

  inspectorTileBadge.textContent = `Ô #${tileId < 10 ? '0' + tileId : tileId} • ${typeLabel}`;
  inspectorLandmarkIcon.textContent = landmarkIcon;
  inspectorTileName.textContent = tile.name;

  const color = tile.districtColor || (tile.type === 'CHANCE' ? '#FF7675' : tile.type === 'COMMUNITY_CHEST' ? '#FDCB6E' : tile.type === 'RAILROAD' ? '#2D3436' : tile.type === 'UTILITY' ? '#0984E3' : '#636E72');
  inspectorHeaderBg.style.background = `linear-gradient(135deg, ${color}, #2D3436)`;

  if (tile.district && DISTRICT_NAMES[tile.district]) {
    inspectorDistrictName.textContent = DISTRICT_NAMES[tile.district];
    inspectorDistrictName.style.display = 'block';
  } else {
    inspectorDistrictName.textContent = tile.description || 'Địa điểm trên bàn cờ';
    inspectorDistrictName.style.display = 'block';
  }

  if (inspectorLandmarkSubtitle) {
    inspectorLandmarkSubtitle.textContent = `★ ${LANDMARK_SUBTITLES[tileId] || 'Danh thắng 3D Việt Nam'}`;
  }

  // Check Property ownership
  const prop = latestPropertiesSnapshot.find(p => p.tileId === tileId);
  const owner = prop ? latestPlayersSnapshot.find(p => p.id === prop.ownerId) : null;

  if (tile.type === 'PROPERTY' || tile.type === 'RAILROAD' || tile.type === 'UTILITY') {
    inspectorPropertyDetails.style.display = 'block';
    inspectorSpecialDesc.style.display = 'none';

    if (owner) {
      inspectorOwnerAvatar.textContent = '';
      inspectorOwnerAvatar.style.backgroundColor = owner.color || '#00B894';
      inspectorOwnerAvatar.innerHTML = `<img src="${owner.avatar}" style="width:100%;height:100%;border-radius:50%;" />`;
      inspectorOwnerName.textContent = owner.username;
      inspectorOwnerName.style.color = owner.color || '#2D3436';

      const levelStr = prop.level === 0 ? 'Đất trống' : prop.level === 4 ? '🏨 Khách sạn Landmark' : `🏠 ${prop.level} Tầng Nhà`;
      inspectorBuildingLevel.textContent = `Cấp độ: ${levelStr}`;
      inspectorBuildingLevel.style.color = '#E17055';
    } else {
      inspectorOwnerAvatar.innerHTML = '❓';
      inspectorOwnerAvatar.style.backgroundColor = '#DFE6E9';
      inspectorOwnerName.textContent = 'Chưa có chủ sở hữu';
      inspectorOwnerName.style.color = '#2D3436';
      inspectorBuildingLevel.textContent = 'Đang mở bán';
      inspectorBuildingLevel.style.color = '#00B894';
    }

    inspectorPriceValue.textContent = `${tile.price}M`;
    inspectorRentBase.textContent = `${tile.baseRent || 0}M`;
    inspectorRentH1.textContent = `${tile.rentHouse1 || (tile.baseRent * 5 || 20)}M`;
    inspectorRentH2.textContent = `${tile.rentHouse2 || (tile.baseRent * 15 || 60)}M`;
    inspectorRentH3.textContent = `${tile.rentHouse3 || (tile.baseRent * 45 || 180)}M`;
    inspectorRentHotel.textContent = `${tile.rentHotel || (tile.baseRent * 110 || 450)}M`;
    inspectorHouseCost.textContent = `${tile.houseCost || 100}M`;

    // Highlight active rent row
    for (let i = 0; i <= 4; i++) {
      const row = document.getElementById(`rent-row-${i}`);
      if (row) {
        if (owner && prop && prop.level === i) {
          row.classList.add('current-rent-level');
        } else {
          row.classList.remove('current-rent-level');
        }
      }
    }
  } else {
    // Special tile
    inspectorPropertyDetails.style.display = 'none';
    inspectorSpecialDesc.style.display = 'block';
    inspectorSpecialDesc.textContent = tile.description || 'Ô đặc biệt không thể mua bán. Dừng chân tại đây để kích hoạt hiệu ứng tương ứng.';

    inspectorOwnerAvatar.innerHTML = '🏛️';
    inspectorOwnerAvatar.style.backgroundColor = '#DFE6E9';
    inspectorOwnerName.textContent = 'Khu Vực Công Cộng';
    inspectorOwnerName.style.color = '#636E72';
    inspectorBuildingLevel.textContent = 'Không Thể Mua Bán';
    inspectorBuildingLevel.style.color = '#636E72';
  }

  elTileInspector.style.display = 'block';
}

function closeTileInspector() {
  elTileInspector.style.display = 'none';
  currentInspectedTileId = null;
}

function renderBoardRoster(filter: string = currentRosterFilter) {
  currentRosterFilter = filter;
  if (!boardTilesData || boardTilesData.length === 0) return;

  const filtered = boardTilesData.filter(t => {
    if (filter === 'ALL') return true;
    if (filter === 'PROPERTY') return t.type === 'PROPERTY';
    if (filter === 'RAILROAD') return t.type === 'RAILROAD';
    if (filter === 'UTILITY') return t.type === 'UTILITY';
    if (filter === 'SPECIAL') return t.type !== 'PROPERTY' && t.type !== 'RAILROAD' && t.type !== 'UTILITY';
    return true;
  });

  rosterTilesList.innerHTML = filtered.map(t => {
    const prop = latestPropertiesSnapshot.find(p => p.tileId === t.id);
    const owner = prop ? latestPlayersSnapshot.find(p => p.id === prop.ownerId) : null;
    const color = t.districtColor || (t.type === 'RAILROAD' ? '#2D3436' : t.type === 'UTILITY' ? '#0984E3' : '#B2BEC3');
    const landmarkIcon = LANDMARK_ICONS[t.id] || '📍';

    let ownerStatusHtml = '';
    if (t.type === 'PROPERTY' || t.type === 'RAILROAD' || t.type === 'UTILITY') {
      if (owner) {
        ownerStatusHtml = `<span style="color:${owner.color}; font-weight:800; font-size:0.75rem;">👑 ${owner.username} (${prop.level === 4 ? 'Khách sạn' : prop.level + ' Nhà'})</span>`;
      } else {
        ownerStatusHtml = `<span style="color:#00B894; font-weight:800; font-size:0.75rem;">💰 ${t.price}M (Đang mở bán)</span>`;
      }
    } else {
      ownerStatusHtml = `<span style="color:#636E72; font-size:0.72rem;">${t.description || 'Ô chức năng'}</span>`;
    }

    return `
      <div class="roster-tile-card" onclick="window.selectTileFromRoster(${t.id})">
        <div class="roster-tile-top">
          <div style="display:flex; align-items:center;">
            <div class="roster-tile-color-bar" style="background:${color};"></div>
            <span style="font-size:1.1rem; margin-right:6px;">${landmarkIcon}</span>
            <b style="font-size:0.88rem; color:#2D3436;">${t.name}</b>
          </div>
          <span style="font-size:0.7rem; font-weight:800; color:#B2BEC3;">#${t.id < 10 ? '0' + t.id : t.id}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
          ${ownerStatusHtml}
          <span style="font-size:0.72rem; color:#0984E3; font-weight:700;">Xem chi tiết ➔</span>
        </div>
      </div>
    `;
  }).join('');
}

(window as any).selectTileFromRoster = (tileId: number) => {
  elBoardRosterModal.style.display = 'none';
  boardScene.highlightTile(tileId);
  showTileInspector(tileId, boardTilesData[tileId]);
};

function init() {
  const container = document.getElementById('canvas-container')!;
  boardScene = new BoardScene(container);

  // Lắng nghe tương tác chạm/click trực tiếp vào ô cờ 3D
  boardScene.onTileClick = (tileId: number, tile: any) => {
    showTileInspector(tileId, tile);
  };

  // Add sample preview tokens on GO tile so scene is lively immediately
  boardScene.tokenManager.createToken('preview_1', 'car', '#FF3838', 0);
  boardScene.tokenManager.createToken('preview_2', 'hat', '#FDCB6E', 1);

  fetch('/api/board')
    .then(res => res.json())
    .then(data => {
      if (data && data.tiles && data.tiles.length > 0) {
        boardTilesData = data.tiles;
      }
    })
    .catch(() => {});

  bindSocketEvents();
  bindUIEvents();
  fetchRoomList();
}

function fetchRoomList() {
  socketClient.emit('room:list');
}

function showToast(msg: string) {
  hudToast.textContent = msg;
  hudToast.style.display = 'block';
  setTimeout(() => {
    hudToast.style.display = 'none';
  }, 3500);
}

function bindUIEvents() {
  btnToggleLobbyView.addEventListener('click', () => {
    elLobbyView.style.display = 'none';
    btnRestoreLobby.style.display = 'block';
  });

  btnRestoreLobby.addEventListener('click', () => {
    elLobbyView.style.display = 'flex';
    btnRestoreLobby.style.display = 'none';
  });

  btnOpenCreate.addEventListener('click', () => {
    elCreateModal.style.display = 'flex';
  });

  btnCancelCreate.addEventListener('click', () => {
    elCreateModal.style.display = 'none';
  });

  btnConfirmCreate.addEventListener('click', () => {
    const username = inputUsername.value.trim() || 'Người chơi';
    const name = createRoomName.value.trim() || `Phòng của ${username}`;
    const maxPlayers = parseInt(createMaxPlayers.value);
    const initialCash = parseInt(createInitialCash.value);

    socketClient.emit('room:create', {
      name,
      username,
      maxPlayers,
      initialCash,
      turnTimeout: 30
    });
    elCreateModal.style.display = 'none';
  });

  btnQuickBotGame.addEventListener('click', () => {
    const username = inputUsername.value.trim() || 'Đại Gia';
    socketClient.emit('room:create', {
      name: 'Ván Đấu Cùng AI',
      username,
      maxPlayers: 4,
      initialCash: 1500,
      turnTimeout: 20
    });
    (window as any)._autoFillBotsAndStart = true;
  });

  btnJoinRoom.addEventListener('click', () => {
    const roomCode = inputRoomCode.value.trim().toUpperCase();
    const username = inputUsername.value.trim() || 'Người chơi';
    if (!roomCode) {
      alert('Vui lòng nhập mã phòng');
      return;
    }
    socketClient.emit('room:join', { roomCode, username });
  });

  btnRefreshRooms.addEventListener('click', fetchRoomList);

  btnCopyCode.addEventListener('click', () => {
    navigator.clipboard.writeText(currentRoomCode);
    alert(`Đã sao chép mã phòng: ${currentRoomCode}`);
  });

  btnAddBot.addEventListener('click', () => {
    socketClient.emit('room:add_bot');
  });

  btnStartGame.addEventListener('click', () => {
    socketClient.emit('room:start');
  });

  btnRollDice.addEventListener('click', () => {
    btnRollDice.style.display = 'none';
    socketClient.emit('game:roll_dice');
  });

  btnEndTurn.addEventListener('click', () => {
    btnEndTurn.style.display = 'none';
    socketClient.emit('game:end_turn');
  });

  if (btnToggleZoom) {
    btnToggleZoom.addEventListener('click', () => {
      const isZoomed = boardScene.cameraManager.toggleZoom();
      btnToggleZoom.innerHTML = isZoomed
        ? `<span class="dock-icon">🔄</span><span class="dock-label">Thu Nhỏ</span>`
        : `<span class="dock-icon">🔍</span><span class="dock-label">Phóng To</span>`;
      btnToggleZoom.classList.toggle('is-active', isZoomed);
      showToast(isZoomed ? '🔍 Đã phóng to cận cảnh sa bàn 3D' : '🔄 Đã về góc nhìn toàn cảnh bao quát');
    });
  }

  if (btnOpenRoster) {
    btnOpenRoster.addEventListener('click', () => {
      renderBoardRoster('ALL');
      elBoardRosterModal.style.display = 'flex';
    });
  }

  if (btnCloseRoster) {
    btnCloseRoster.addEventListener('click', () => {
      elBoardRosterModal.style.display = 'none';
    });
  }

  if (btnCloseInspector) {
    btnCloseInspector.addEventListener('click', closeTileInspector);
  }

  if (rosterFilterTabs) {
    rosterFilterTabs.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.roster-tab') as HTMLElement;
      if (!target) return;
      const filter = target.dataset.filter || 'ALL';
      rosterFilterTabs.querySelectorAll('.roster-tab').forEach(t => t.classList.remove('active'));
      target.classList.add('active');
      renderBoardRoster(filter);
    });
  }

  if (btnToggleCamLock) {
    btnToggleCamLock.addEventListener('click', () => {
      const isLocked = boardScene.cameraManager.toggleLock();
      btnToggleCamLock.innerHTML = isLocked
        ? `<span class="dock-icon">🔒</span><span class="dock-label">Góc Cố Định</span>`
        : `<span class="dock-icon">🔓</span><span class="dock-label">Xoay Tự Do</span>`;
      btnToggleCamLock.classList.toggle('is-active', isLocked);
      showToast(isLocked ? '🔒 Đã khóa góc nhìn Isometric chuẩn' : '🔓 Đã mở khóa xoay & thu phóng 3D tự do');
    });
  }

  btnToggleFollow.addEventListener('click', () => {
    boardScene.cameraManager.toggleFollowMode();
    btnToggleFollow.classList.toggle('is-active', boardScene.cameraManager.isFollowMode);
    showToast(boardScene.cameraManager.isFollowMode ? '🎥 Đang bám sát quân cờ di chuyển' : '🔄 Đã tắt chế độ bám sát quân cờ');
  });

  btnResetCam.addEventListener('click', () => {
    boardScene.cameraManager.resetOverview();
    btnToggleFollow.classList.remove('is-active');
    if (btnToggleZoom) {
      btnToggleZoom.classList.remove('is-active');
      btnToggleZoom.innerHTML = `<span class="dock-icon">🔍</span><span class="dock-label">Phóng To</span>`;
    }
    showToast('🔄 Đã đặt lại góc nhìn toàn cảnh');
  });

  btnToggleLog.addEventListener('click', () => {
    const isOpening = elLogDrawer.style.display === 'none';
    elLogDrawer.style.display = isOpening ? 'flex' : 'none';
    btnToggleLog.classList.toggle('is-active', isOpening);
  });

  btnCloseLog.addEventListener('click', () => {
    elLogDrawer.style.display = 'none';
    btnToggleLog.classList.remove('is-active');
  });

  btnSkipBuy.addEventListener('click', () => {
    elPropertyModal.style.display = 'none';
    socketClient.emit('game:skip_buy');
  });

  btnConfirmBuy.addEventListener('click', () => {
    elPropertyModal.style.display = 'none';
    if (currentPendingTileAction) {
      socketClient.emit('game:buy_property', { tileId: currentPendingTileAction.tileId });
    }
  });

  btnCloseCard.addEventListener('click', () => {
    elCardModal.style.display = 'none';
  });

  btnPlayAgain.addEventListener('click', () => {
    window.location.reload();
  });
}

function bindSocketEvents() {
  socketClient.on('connect', () => {
    myUserId = socketClient.socket.id!;
  });

  socketClient.on('room:list_response', (data: { rooms: any[] }) => {
    renderRoomList(data.rooms);
  });

  socketClient.on('room:created', (data: any) => {
    currentRoomCode = data.roomCode;
    isHost = true;
    btnRestoreLobby.style.display = 'none';
    showWaitingLobby(data);

    if ((window as any)._autoFillBotsAndStart) {
      (window as any)._autoFillBotsAndStart = false;
      setTimeout(() => socketClient.emit('room:add_bot'), 300);
      setTimeout(() => socketClient.emit('room:add_bot'), 600);
      setTimeout(() => socketClient.emit('room:add_bot'), 900);
      setTimeout(() => socketClient.emit('room:start'), 1500);
    }
  });

  socketClient.on('room:joined', (data: any) => {
    currentRoomCode = data.roomCode;
    isHost = data.hostId === socketClient.socket.id;
    btnRestoreLobby.style.display = 'none';
    showWaitingLobby(data);
  });

  socketClient.on('room:updated', (data: any) => {
    updateWaitingLobby(data);
  });

  socketClient.on('game:start', (data: any) => {
    elLobbyView.style.display = 'none';
    btnRestoreLobby.style.display = 'none';
    elRoomWaiting.style.display = 'none';
    elGameHud.style.display = 'flex';

    boardTilesData = data.boardData;
    latestPlayersSnapshot = data.snapshot.players;
    latestPropertiesSnapshot = data.snapshot.properties || [];
    boardScene.initBoard(boardTilesData);

    // Clear sample preview tokens
    boardScene.tokenManager.group.clear();
    boardScene.tokenManager.tokens.clear();

    // Create real player tokens
    data.snapshot.players.forEach((p: any, idx: number) => {
      boardScene.tokenManager.createToken(p.id, p.token, p.color, idx);
    });

    updateHudPlayers(data.snapshot);
    sounds.playTurnNotification();
    checkMyTurn(data.snapshot);
  });

  socketClient.on('game:dice_result', (data: any) => {
    const isMe = data.userId === socketClient.socket.id;
    const player = data.snapshot.players.find((p: any) => p.id === data.userId);
    const slot = data.snapshot.players.findIndex((p: any) => p.id === data.userId);
    latestPlayersSnapshot = data.snapshot.players;

    const total = data.dice1 + data.dice2;
    const isDouble = data.dice1 === data.dice2;
    const playerName = player ? player.username : 'Người chơi';
    showToast(`🎲 ${playerName} lắc được ${total} điểm (${data.dice1} + ${data.dice2}${isDouble ? ' - ĐÔI! 🎉' : ''})!`);

    boardScene.dicePhysics.roll(data.dice1, data.dice2, () => {
      boardScene.tokenManager.moveTokenSteps(
        data.userId,
        data.prevPosition,
        data.newPosition,
        slot,
        (_stepTile) => {},
        () => {
          const token = boardScene.tokenManager.tokens.get(data.userId);
          const landingPos = token ? token.mesh.position : boardScene.getTileWorldPosition(data.newPosition);

          // Highlight và tự động mở Tra Cứu Chi Tiết ô cờ vừa dừng chân
          boardScene.highlightTile(data.newPosition);
          showTileInspector(data.newPosition, boardTilesData[data.newPosition]);

          if (data.passedGo) {
            sounds.playCoin();
            boardScene.vfxManager.spawnFloatingText('+200M (Lương)', landingPos, true);
            boardScene.vfxManager.spawnStarBurst(landingPos, 20);
          }

          handleTileActionResult(data.actionResult, isMe, player, landingPos);
          if (data.snapshot) {
            checkMyTurn(data.snapshot);
          }
        }
      );
    });

    const token = boardScene.tokenManager.tokens.get(data.userId);
    if (token) {
      boardScene.cameraManager.setFollowTarget(token.mesh.position);
    }

    latestPropertiesSnapshot = data.snapshot.properties || latestPropertiesSnapshot;
    updateHudPlayers(data.snapshot);
    renderLogs(data.snapshot.logs);
  });

  socketClient.on('game:property_updated', (data: any) => {
    boardScene.updateBuilding(data.tileId, data.level);
    const tilePos = boardScene.getTileWorldPosition(data.tileId);
    boardScene.vfxManager.spawnShockwave(tilePos, '#00B894', 3.0);
    latestPlayersSnapshot = data.snapshot.players;
    latestPropertiesSnapshot = data.snapshot.properties || latestPropertiesSnapshot;

    if (currentInspectedTileId === data.tileId) {
      showTileInspector(data.tileId);
    }
    if (elBoardRosterModal.style.display === 'flex') {
      renderBoardRoster();
    }

    updateHudPlayers(data.snapshot);
    renderLogs(data.snapshot.logs);
  });

  socketClient.on('game:state_sync', (data: any) => {
    latestPlayersSnapshot = data.snapshot.players;
    latestPropertiesSnapshot = data.snapshot.properties || latestPropertiesSnapshot;
    if (currentInspectedTileId !== null) {
      showTileInspector(currentInspectedTileId);
    }
    if (elBoardRosterModal.style.display === 'flex') {
      renderBoardRoster();
    }
    updateHudPlayers(data.snapshot);
    renderLogs(data.snapshot.logs);
    checkMyTurn(data.snapshot);
  });

  socketClient.on('game:turn_change', (data: any) => {
    latestPlayersSnapshot = data.snapshot.players;
    latestPropertiesSnapshot = data.snapshot.properties || latestPropertiesSnapshot;
    updateHudPlayers(data.snapshot);
    renderLogs(data.snapshot.logs);
    checkMyTurn(data.snapshot);
  });

  socketClient.on('game:timer_tick', (data: { remaining: number }) => {
    const pct = Math.max(0, Math.min(100, (data.remaining / 30) * 100));
    timerFill.style.width = `${pct}%`;
    timerFill.style.backgroundColor = data.remaining <= 5 ? '#D63031' : '#00B894';
  });

  socketClient.on('game:over', (data: any) => {
    elPropertyModal.style.display = 'none';
    elCardModal.style.display = 'none';
    showVictory(data);
  });

  socketClient.on('error:message', (data: { message: string }) => {
    alert(data.message);
  });
}

function renderRoomList(rooms: any[]) {
  if (rooms.length === 0) {
    roomListContainer.innerHTML = `<div style="font-size: 0.8rem; color: #B2BEC3; text-align: center; padding: 10px;">Chưa có phòng nào. Hãy tạo phòng mới!</div>`;
    return;
  }

  roomListContainer.innerHTML = rooms.map(r => `
    <div style="background: white; border-radius: 12px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
      <div>
        <div style="font-weight: 800; font-size: 0.85rem; color: #2D3436;">${r.name}</div>
        <div style="font-size: 0.72rem; color: #636E72;">Mã: <b>${r.roomCode}</b> • ${r.playersCount}/${r.maxPlayers} người</div>
      </div>
      <button class="btn-chunky btn-blue" style="padding: 4px 12px; font-size: 0.75rem;" onclick="document.getElementById('input-room-code').value='${r.roomCode}'; document.getElementById('btn-join-room').click();">
        Vào
      </button>
    </div>
  `).join('');
}

function showWaitingLobby(data: any) {
  elLobbyView.style.display = 'none';
  elRoomWaiting.style.display = 'flex';

  waitingRoomName.textContent = data.name;
  waitingRoomCode.textContent = data.roomCode;
  waitingPlayerCount.textContent = `${data.players.length}/${data.maxPlayers}`;

  btnStartGame.style.display = isHost ? 'inline-flex' : 'none';
  btnAddBot.style.display = isHost ? 'inline-flex' : 'none';

  renderWaitingSlots(data.players, data.maxPlayers);
}

function updateWaitingLobby(data: any) {
  waitingPlayerCount.textContent = `${data.players.length}/${data.maxPlayers}`;
  renderWaitingSlots(data.players, data.maxPlayers);
}

function renderWaitingSlots(players: any[], max: number) {
  waitingSlots.innerHTML = '';
  for (let i = 0; i < max; i++) {
    const p = players[i];
    const slotDiv = document.createElement('div');
    slotDiv.style.cssText = 'background: white; border-radius: 14px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04);';

    if (p) {
      const isMe = p.id === socketClient.socket.id;
      slotDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${p.avatar}" style="width: 36px; height: 36px; border-radius: 50%; background: #EBF2FA;" />
          <div>
            <div style="font-weight: 800; font-size: 0.95rem; color: #2D3436;">${p.username} ${isMe ? '<span style="color:#00B894;">(Bạn)</span>' : ''}</div>
            <div style="font-size: 0.75rem; color: #636E72;">${p.isHost ? '👑 Chủ phòng' : p.isBot ? '🤖 Bot AI' : 'Thành viên'}</div>
          </div>
        </div>
        <div style="font-size: 1.4rem;">${p.token === 'car' ? '🚗' : p.token === 'hat' ? '🎩' : p.token === 'dog' ? '🐕' : '🚀'}</div>
      `;
    } else {
      slotDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; opacity: 0.5;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: #DFE6E9; display: flex; align-items: center; justify-content: center;">+</div>
          <div style="font-weight: 700; font-size: 0.9rem; color: #B2BEC3;">Đang chờ người chơi...</div>
        </div>
      `;
    }
    waitingSlots.appendChild(slotDiv);
  }
}

(window as any).focusPlayerOnBoard = (playerId: string) => {
  const p = latestPlayersSnapshot.find((pl: any) => pl.id === playerId);
  if (!p) return;
  const tileId = typeof p.position === 'number' ? p.position : 0;
  boardScene.highlightTile(tileId);
  showTileInspector(tileId, boardTilesData[tileId]);
};

function updateHudPlayers(snapshot: any) {
  const curUserId = snapshot.turnState.currentUserId;
  const props = snapshot.properties || latestPropertiesSnapshot || [];

  hudPlayers.innerHTML = snapshot.players.map((p: any) => {
    const isTurn = p.id === curUserId;
    const isMe = p.id === socketClient.socket.id;
    const ownedProps = props.filter((pr: any) => pr.ownerId === p.id);

    const dotsHtml = ownedProps.slice(0, 8).map((pr: any) => {
      const tile = boardTilesData && boardTilesData[pr.tileId];
      const dotColor = (tile && tile.districtColor) ? tile.districtColor : '#2D3436';
      return `<span class="district-dot" style="background:${dotColor};" title="${tile ? tile.name : ''}"></span>`;
    }).join('');
    const extraCount = ownedProps.length > 8 ? `<span style="font-size:0.62rem;font-weight:800;color:#636E72;">+${ownedProps.length - 8}</span>` : '';

    return `
      <div class="player-badge ${isTurn ? 'active-turn' : ''} ${p.isBankrupt ? 'bankrupt' : ''}" style="border-left: 5px solid ${p.color};" onclick="window.focusPlayerOnBoard('${p.id}')" title="Nhấn để xem vị trí của ${p.username} trên bàn cờ">
        <img class="player-avatar" src="${p.avatar}" style="border: 2px solid ${p.color};" />
        <div class="player-info">
          <div class="player-name-row">
            <span class="player-name">${p.username} ${isMe ? '(Bạn)' : ''} ${p.inJail ? '🔒' : ''}</span>
            ${isTurn ? '<span class="turn-badge-tag">LƯỢT ĐI</span>' : ''}
          </div>
          <div class="player-meta-row">
            <span class="player-cash">💰 ${p.balance}M</span>
            <span class="player-networth">💎 ${p.netWorth}M</span>
          </div>
          ${ownedProps.length > 0 ? `<div class="player-districts-dots">${dotsHtml}${extraCount}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function checkMyTurn(snapshot: any) {
  const curUserId = snapshot.turnState.currentUserId;
  const isMyTurn = curUserId === socketClient.socket.id;
  const phase = snapshot.turnState.phase;
  const activePlayer = snapshot.players.find((p: any) => p.id === curUserId);

  if (turnStatusDot && turnStatusText && activePlayer) {
    turnStatusDot.style.background = activePlayer.color || '#00B894';
    turnStatusDot.style.boxShadow = `0 0 8px ${activePlayer.color || '#00B894'}`;
    if (isMyTurn) {
      turnStatusText.textContent = phase === 'ROLL_DICE'
        ? '🎲 Đang tới lượt bạn — Hãy đổ xúc xắc!'
        : '✅ Lượt của bạn — Hoàn tất giao dịch & Kết thúc lượt';
    } else {
      turnStatusText.textContent = `⏳ Đang chờ ${activePlayer.username} hành động...`;
    }
  }

  if (isMyTurn && !snapshot.isGameOver) {
    showToast('Lượt của bạn! 🎲');
    sounds.playTurnNotification();

    if (phase === 'ROLL_DICE') {
      btnRollDice.style.display = 'inline-flex';
      btnEndTurn.style.display = 'none';
    } else if (phase === 'END_TURN') {
      btnRollDice.style.display = 'none';
      btnEndTurn.style.display = 'inline-flex';
    } else {
      btnRollDice.style.display = 'none';
      btnEndTurn.style.display = 'none';
    }
  } else {
    btnRollDice.style.display = 'none';
    btnEndTurn.style.display = 'none';
  }
}

function populatePropertyDeedModal(tileId: number, costLabel: string, badgeLabel: string, descText: string, btnLabel: string, canAfford: boolean) {
  const tile = boardTilesData && boardTilesData[tileId];
  const color = (tile && tile.districtColor) ? tile.districtColor : '#00B894';
  propColorBar.style.background = `linear-gradient(135deg, ${color}, #2D3436)`;
  if (propIcon) propIcon.textContent = LANDMARK_ICONS[tileId] || '🏛️';
  if (propBadge) propBadge.textContent = badgeLabel;
  propPrice.textContent = costLabel;
  propDesc.textContent = descText;
  btnConfirmBuy.textContent = btnLabel;
  btnConfirmBuy.style.display = canAfford ? 'inline-block' : 'none';

  if (propRentPreview && tile && (tile.type === 'PROPERTY' || tile.type === 'RAILROAD' || tile.type === 'UTILITY')) {
    propRentPreview.style.display = 'grid';
    propRentPreview.innerHTML = `
      <div class="prop-rent-chip"><span>Thuê cơ bản</span><b>${tile.baseRent || 25}M</b></div>
      <div class="prop-rent-chip"><span>🏠 1-2 Nhà</span><b>${tile.rentHouse1 || 100}M - ${tile.rentHouse2 || 250}M</b></div>
      <div class="prop-rent-chip"><span>🏨 Khách Sạn</span><b>${tile.rentHotel || 600}M</b></div>
    `;
  } else if (propRentPreview) {
    propRentPreview.style.display = 'none';
  }
}

function handleTileActionResult(action: any, isMe: boolean, player: any, pos: any) {
  if (!action) return;

  if (action.type === 'CAN_BUY' && isMe) {
    currentPendingTileAction = action;
    propTitle.textContent = action.tileName;
    const sub = LANDMARK_SUBTITLES[action.tileId] || 'Bất Động Sản Chiến Lược';
    populatePropertyDeedModal(
      action.tileId,
      `Giá sở hữu: ${action.cost}M`,
      `SỔ ĐỎ ĐỊA DANH • Ô #${action.tileId}`,
      `${sub}. Sở hữu ngay lô đất này để thu tiền thuê từ mọi đối thủ đi ngang qua!`,
      `Mua Đất (${action.cost}M)`,
      action.canAfford
    );
    elPropertyModal.style.display = 'flex';
  } else if (action.type === 'CAN_UPGRADE' && isMe) {
    currentPendingTileAction = action;
    propTitle.textContent = `${action.tileName} (Lên Cấp ${action.level})`;
    populatePropertyDeedModal(
      action.tileId,
      `Chi phí nâng cấp: ${action.cost}M`,
      `NÂNG CẤP CÔNG TRÌNH • CẤP ${action.level}`,
      `Nâng cấp công trình kiến trúc trên ô đất của bạn để nhân gấp bội tiền thuê!`,
      `Nâng Cấp (${action.cost}M)`,
      action.canAfford
    );
    elPropertyModal.style.display = 'flex';
  } else if (action.type === 'PAY_RENT') {
    sounds.playCoin();
    boardScene.vfxManager.spawnFloatingText(`-${action.amount}M`, pos, false);
    showToast(`${player.username} đã trả ${action.amount}M tiền thuê cho ${action.ownerName}!`);
  } else if (action.type === 'TAX') {
    sounds.playCoin();
    boardScene.vfxManager.spawnFloatingText(`-${action.amount}M (Thuế)`, pos, false);
  } else if (action.type === 'CARD') {
    cardBadge.textContent = action.cardType === 'CHANCE' ? 'THẺ CƠ HỘI' : 'THẺ KHÍ VẬN';
    cardIcon.textContent = action.cardType === 'CHANCE' ? '⚡' : '🎁';
    cardTitle.textContent = action.card.title;
    cardDesc.textContent = `${action.card.description}\n(${action.result})`;
    elCardModal.style.display = 'flex';
    sounds.playCoin();
  } else if (action.type === 'BANKRUPT') {
    sounds.playBankrupt();
    boardScene.vfxManager.triggerCameraShake(0.5);
    boardScene.vfxManager.spawnFloatingText(`PHÁ SẢN!`, pos, false);
    showToast(`💀 ${player.username} đã bị Phá Sản!`);
  }
}

function renderLogs(logs: any[]) {
  if (!logs) return;
  logItems.innerHTML = logs.map(l => `
    <div style="font-size: 0.8rem; line-height: 1.4; padding: 6px 10px; background: rgba(0,0,0,0.03); border-radius: 8px;">
      <span style="color: #636E72; font-size: 0.7rem;">${new Date(l.timestamp).toLocaleTimeString()}</span>
      <div style="color: #2D3436; font-weight: 700;">${l.message}</div>
    </div>
  `).join('');
}

function showVictory(data: any) {
  const winner = data.snapshot.players.find((p: any) => p.id === data.winnerId);
  victoryWinnerName.textContent = winner ? winner.username : 'Người Thắng';

  const sorted = [...data.snapshot.players].sort((a: any, b: any) => b.netWorth - a.netWorth);
  victoryRankings.innerHTML = sorted.map((p: any, idx: number) => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 14px; background: white; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-weight: 900; font-size: 1rem; color: ${idx === 0 ? '#FDCB6E' : '#636E72'};">#${idx + 1}</span>
        <span style="font-weight: 800; color: #2D3436;">${p.username}</span>
      </div>
      <span style="font-weight: 900; color: #00B894;">${p.netWorth}M</span>
    </div>
  `).join('');

  elVictoryModal.style.display = 'flex';

  confetti({
    particleCount: 140,
    spread: 85,
    origin: { y: 0.6 }
  });
}

window.addEventListener('DOMContentLoaded', init);
