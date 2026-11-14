import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { BoardScene } from './three/BoardScene';
import { DetailedModels } from './three/DetailedModels';
import { socketClient } from './network/SocketClient';
import { sounds } from './components/AudioSynth';

// App State
let boardScene: BoardScene;
let isCleanFocusMode: boolean = localStorage.getItem('bc_clean_focus_mode') === 'true';
let myUserId: string = '';
let currentRoomCode: string = '';
let isHost: boolean = false;
let currentPendingTileAction: any = null;
let boardTilesData: any[] = [];
let latestPlayersSnapshot: any[] = [];
let latestPropertiesSnapshot: any[] = [];
let latestTurnSnapshot: any = null;
let latestGameStateSnapshot: any = null;

// Auth & User State
interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  goldBalance: number;
  totalMatches: number;
  totalWins: number;
  equippedFrame?: string;
}
let currentUser: AuthUser | null = null;
let cachedPublicRooms: any[] = [];
let pendingJoinRoomCode: string = '';

const SAMPLE_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Midnight',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Casper',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Buster',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Ginger',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Daisy',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Coco'
];
let selectedAvatarUrl = SAMPLE_AVATARS[0];

// DOM Elements
const elLobbyView = document.getElementById('lobby-view')!;
const elLobbyCard = document.getElementById('lobby-card')!;
const btnToggleLobbyView = document.getElementById('btn-toggle-lobby-view')!;
const btnRestoreLobby = document.getElementById('btn-restore-lobby')!;

// Header User & Auth Bar Elements
const elAuthGuestView = document.getElementById('auth-guest-view')!;
const elAuthUserView = document.getElementById('auth-user-view')!;
const btnOpenAuth = document.getElementById('btn-open-auth')!;
const headerUserAvatar = document.getElementById('header-user-avatar') as HTMLImageElement;
const headerUserName = document.getElementById('header-user-name')!;
const headerUserGold = document.getElementById('header-user-gold')!;
const btnOpenProfile = document.getElementById('btn-open-profile')!;
const btnOpenFriends = document.getElementById('btn-open-friends')!;
const btnLogout = document.getElementById('btn-logout')!;

// Auth Modal Elements
const elAuthModal = document.getElementById('auth-modal')!;
const btnCloseAuth = document.getElementById('btn-close-auth')!;
const tabBtnLogin = document.getElementById('tab-btn-login')!;
const tabBtnRegister = document.getElementById('tab-btn-register')!;
const formLogin = document.getElementById('form-login') as HTMLFormElement;
const formRegister = document.getElementById('form-register') as HTMLFormElement;
const loginIdentifier = document.getElementById('login-identifier') as HTMLInputElement;
const loginPassword = document.getElementById('login-password') as HTMLInputElement;
const loginErrorMsg = document.getElementById('login-error-msg')!;
const btnSubmitLogin = document.getElementById('btn-submit-login')!;
const registerUsername = document.getElementById('register-username') as HTMLInputElement;
const registerEmail = document.getElementById('register-email') as HTMLInputElement;
const registerPassword = document.getElementById('register-password') as HTMLInputElement;
const registerAvatarPicker = document.getElementById('register-avatar-picker')!;
const registerErrorMsg = document.getElementById('register-error-msg')!;
const btnSubmitRegister = document.getElementById('btn-submit-register')!;

// Profile Modal Elements
const elProfileModal = document.getElementById('profile-modal')!;
const btnCloseProfile = document.getElementById('btn-close-profile')!;
const profileAvatarWrapper = document.getElementById('profile-avatar-wrapper');
const profileAvatarImg = document.getElementById('profile-avatar-img') as HTMLImageElement;
const profileFrameBadge = document.getElementById('profile-frame-badge');
const profileLevelBadge = document.getElementById('profile-level-badge');
const profileUsername = document.getElementById('profile-username')!;
const profileEmail = document.getElementById('profile-email')!;
const profileGoldBalance = document.getElementById('profile-gold-balance')!;
const profileTotalMatches = document.getElementById('profile-total-matches')!;
const profileTotalWins = document.getElementById('profile-total-wins')!;
const profileWinRate = document.getElementById('profile-win-rate')!;
const profileStatAchievements = document.getElementById('profile-stat-achievements');
const profileMasteryTitle = document.getElementById('profile-mastery-title');
const profileMasteryXp = document.getElementById('profile-mastery-xp');
const profileMasteryBar = document.getElementById('profile-mastery-bar');
const tabBtnProfileAchievements = document.getElementById('tab-btn-profile-achievements');
const tabBtnProfileFrames = document.getElementById('tab-btn-profile-frames');
const paneProfileAchievements = document.getElementById('pane-profile-achievements');
const paneProfileFrames = document.getElementById('pane-profile-frames');
const profileAchievementsSummary = document.getElementById('profile-achievements-summary');
const profileAchievementsList = document.getElementById('profile-achievements-list')!;
const profileFramesGrid = document.getElementById('profile-frames-grid');
const profileAchCount = document.getElementById('profile-ach-count');
const profileFramesCount = document.getElementById('profile-frames-count');

const FRAME_TIER_CONFIG: Record<string, { tier: string; level: number; label: string; badge: string; name: string }> = {
  frame_default: { tier: 'GRAY', level: 1, label: 'Sơ Cấp', badge: 'Lv.1 Tân Thủ', name: 'Khung Cơ Bản' },
  frame_gray_starter: { tier: 'GRAY', level: 1, label: 'Sơ Cấp', badge: 'Lv.1 Sơ Cấp', name: 'Khung Sơ Cấp Khởi Nghiệp' },
  frame_gray_shield: { tier: 'GRAY', level: 1, label: 'Sơ Cấp', badge: 'Lv.1 Sơ Cấp', name: 'Khung Khiên Bạc Thoát Hiểm' },
  frame_blue_dice: { tier: 'BLUE', level: 2, label: 'Thành Thạo', badge: 'Lv.2 Lam Ngọc', name: 'Khung Xúc Xắc Lam Ngọc' },
  frame_blue_railway: { tier: 'BLUE', level: 2, label: 'Thành Thạo', badge: 'Lv.2 Lam Ngọc', name: 'Khung Tuyến Tàu Xanh Lam' },
  frame_gold_monopoly: { tier: 'GOLD', level: 3, label: 'Tinh Anh', badge: 'Lv.3 Hoàng Kim', name: 'Khung Hoàng Kim Độc Quyền' },
  frame_gold_baron: { tier: 'GOLD', level: 3, label: 'Tinh Anh', badge: 'Lv.3 Hoàng Kim', name: 'Khung Phú Hào Kim Tiền' },
  frame_orange_landmark: { tier: 'ORANGE', level: 4, label: 'Huyền Thoại', badge: 'Lv.4 Hổ Phách', name: 'Khung Hổ Phách Khách Sạn' },
  frame_orange_phoenix: { tier: 'ORANGE', level: 4, label: 'Huyền Thoại', badge: 'Lv.4 Hổ Phách', name: 'Khung Phượng Hoàng Lửa' },
  frame_red_millionaire: { tier: 'RED', level: 5, label: 'Tối Thượng', badge: 'Lv.5 Thần Thoại', name: 'Khung Đế Vương Triệu Đô' },
  frame_red_dragon: { tier: 'RED', level: 5, label: 'Tối Thượng', badge: 'Lv.5 Thần Thoại', name: 'Khung Thần Thoại Rồng Đỏ' }
};

function getFrameTierClass(frameId: string): string {
  const config = FRAME_TIER_CONFIG[frameId];
  if (!config) return 'nameplate-tier-gray';
  switch (config.tier) {
    case 'BLUE': return 'nameplate-tier-blue';
    case 'GOLD': return 'nameplate-tier-gold';
    case 'ORANGE': return 'nameplate-tier-orange';
    case 'RED': return 'nameplate-tier-red';
    case 'GRAY':
    default: return 'nameplate-tier-gray';
  }
}

function getFrameBadgeTag(frameId: string): string {
  const config = FRAME_TIER_CONFIG[frameId] || FRAME_TIER_CONFIG.frame_default;
  return `<span class="nameplate-badge">${config.badge}</span>`;
}

// Friends Modal Elements
const elFriendsModal = document.getElementById('friends-modal')!;
const btnCloseFriends = document.getElementById('btn-close-friends')!;
const tabBtnFriendsList = document.getElementById('tab-btn-friends-list')!;
const tabBtnAddFriend = document.getElementById('tab-btn-add-friend')!;
const tabBtnFriendRequests = document.getElementById('tab-btn-friend-requests')!;
const badgeFriendsCount = document.getElementById('badge-friends-count')!;
const badgeRequestsCount = document.getElementById('badge-requests-count')!;
const paneFriendsList = document.getElementById('pane-friends-list')!;
const paneAddFriend = document.getElementById('pane-add-friend')!;
const paneFriendRequests = document.getElementById('pane-friend-requests')!;
const friendsListContainer = document.getElementById('friends-list-container')!;
const friendRequestsContainer = document.getElementById('friend-requests-container')!;
const inputFriendIdentifier = document.getElementById('input-friend-identifier') as HTMLInputElement;
const btnSendFriendRequest = document.getElementById('btn-send-friend-request')!;
const addFriendStatus = document.getElementById('add-friend-status')!;

// Room Password Elements
const createRoomIsProtected = document.getElementById('create-room-is-protected') as HTMLInputElement;
const createRoomPasswordGroup = document.getElementById('create-room-password-group')!;
const createRoomPassword = document.getElementById('create-room-password') as HTMLInputElement;
const elJoinPasswordModal = document.getElementById('join-password-modal')!;
const joinPasswordRoomName = document.getElementById('join-password-room-name')!;
const joinPasswordInput = document.getElementById('join-password-input') as HTMLInputElement;
const joinPasswordError = document.getElementById('join-password-error')!;
const btnCancelJoinPassword = document.getElementById('btn-cancel-join-password')!;
const btnConfirmJoinPassword = document.getElementById('btn-confirm-join-password')!;

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
const btnToggleFocusMode = document.getElementById('btn-toggle-focus-mode');
const btnToggleLog = document.getElementById('btn-toggle-log')!;
const btnCloseLog = document.getElementById('btn-close-log')!;
const logItems = document.getElementById('log-items')!;

/**
 * Quản lý Chế Độ Tinh Gọn (Clean Focus Mode)
 * Khi bật, ẩn các tiểu cảnh trang trí phụ và hiệu ứng khí quyển, tập trung 100% vào bàn cờ thi đấu.
 */
function applyFocusMode(clean: boolean) {
  isCleanFocusMode = clean;
  localStorage.setItem('bc_clean_focus_mode', clean ? 'true' : 'false');

  if (btnToggleFocusMode) {
    btnToggleFocusMode.classList.toggle('is-active', clean);
    btnToggleFocusMode.innerHTML = clean
      ? `<span class="dock-icon">🎯</span><span class="dock-label">Tinh Gọn</span>`
      : `<span class="dock-icon">🏛️</span><span class="dock-label">Sa Bàn</span>`;
    btnToggleFocusMode.title = clean
      ? 'Đang bật Chế độ Tinh Gọn: Ẩn bớt tiểu cảnh phụ để tập trung thi đấu'
      : 'Chế độ Sa Bàn Đầy Đủ: Hiển thị trọn vẹn cảnh quan 3D';
  }

  if (boardScene) {
    boardScene.setFocusMode(clean);
    DetailedModels.setDioramaVisibility(!clean);
  }
}

// Chat & Emote Drawer
const btnToggleChat = document.getElementById('btn-toggle-chat');
const btnCloseChat = document.getElementById('btn-close-chat');
const elChatDrawer = document.getElementById('chat-drawer');
const chatMessages = document.getElementById('chat-messages');
const inputChatMsg = document.getElementById('input-chat-msg') as HTMLInputElement | null;
const btnSendChat = document.getElementById('btn-send-chat');

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

// Inspector Upgrade Container
const elInspectorUpgradeContainer = document.getElementById('inspector-upgrade-container');
const btnInspectorUpgrade = document.getElementById('btn-inspector-upgrade');
const inspectorUpgradeLabel = document.getElementById('inspector-upgrade-label');

// Dice Announcement Card DOM Elements
const elDiceAnnouncement = document.getElementById('dice-announcement-card');
const elDiceAvatar = document.getElementById('dice-announcement-avatar');
const elDicePlayer = document.getElementById('dice-announcement-player');
const elDiceFace1 = document.getElementById('dice-face-1');
const elDiceFace2 = document.getElementById('dice-face-2');
const elDiceTotal = document.getElementById('dice-total-badge');
const elDiceDouble = document.getElementById('dice-double-banner');

const DICE_UNICODE = ['', '⚀ 1', '⚁ 2', '⚂ 3', '⚃ 4', '⚄ 5', '⚅ 6'];
let diceAnnouncementTimeout: any = null;

function showDiceAnnouncement(player: any, dice1: number, dice2: number, isDouble: boolean) {
  if (!elDiceAnnouncement) return;
  if (diceAnnouncementTimeout) {
    clearTimeout(diceAnnouncementTimeout);
  }

  const total = dice1 + dice2;
  const username = player ? player.username : 'Người chơi';
  const color = player?.color || '#00B894';

  if (elDiceAvatar) {
    elDiceAvatar.style.backgroundColor = color;
    if (player?.avatar) {
      elDiceAvatar.innerHTML = `<img src="${player.avatar}" style="width:100%;height:100%;object-fit:cover;" />`;
    } else {
      elDiceAvatar.textContent = username.charAt(0).toUpperCase();
    }
  }

  if (elDicePlayer) {
    elDicePlayer.textContent = username;
    elDicePlayer.style.color = color;
  }

  if (elDiceFace1) elDiceFace1.textContent = DICE_UNICODE[dice1] || `${dice1}`;
  if (elDiceFace2) elDiceFace2.textContent = DICE_UNICODE[dice2] || `${dice2}`;
  if (elDiceTotal) elDiceTotal.textContent = `${total} ĐIỂM`;

  if (elDiceDouble) {
    elDiceDouble.style.display = isDouble ? 'block' : 'none';
  }

  elDiceAnnouncement.style.display = 'block';

  diceAnnouncementTimeout = setTimeout(() => {
    if (elDiceAnnouncement) elDiceAnnouncement.style.display = 'none';
    diceAnnouncementTimeout = null;
  }, 2500);
}

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
  5: '🚌',  // Bến Xe Miền Tây (Xe Khách Liên Tỉnh & Nhà Ga Hiện Đại)
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
    tile.type === 'AIRPORT' ? 'SÂN BAY QUỐC TẾ' :
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

    // Interactive Upgrade Button in Inspector
    const isMyTurn = latestTurnSnapshot && latestTurnSnapshot.currentUserId === socketClient.socket.id;
    const isMyProp = owner && owner.id === socketClient.socket.id;
    const houseCost = tile.houseCost || 100;
    const canUpgrade = isMyTurn && isMyProp && tile.type === 'PROPERTY' && prop && prop.level < 4 && (owner.money ?? 0) >= houseCost;

    if (elInspectorUpgradeContainer && btnInspectorUpgrade && inspectorUpgradeLabel) {
      if (canUpgrade) {
        elInspectorUpgradeContainer.style.display = 'block';
        const nextLevelStr = prop.level === 3 ? 'Khách Sạn 5 Sao' : `Nhà Cấp ${prop.level + 1}`;
        inspectorUpgradeLabel.textContent = `Nâng Cấp ${nextLevelStr} (${houseCost}M)`;
        btnInspectorUpgrade.onclick = () => {
          socketClient.emit('game:buy_property', { tileId });
          btnInspectorUpgrade.onclick = null;
          elInspectorUpgradeContainer.style.display = 'none';
        };
      } else {
        elInspectorUpgradeContainer.style.display = 'none';
      }
    }
  } else {
    // Special tile
    if (elInspectorUpgradeContainer) {
      elInspectorUpgradeContainer.style.display = 'none';
    }
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
  if (boardScene) {
    boardScene.cameraManager.focusOnPosition(new THREE.Vector3(0, 0, 0), boardScene.cameraManager.isMobile ? 28.5 : 25.5);
  }
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
    const tilePos = boardScene.getTileWorldPosition(tileId);
    boardScene.cameraManager.focusOnPosition(tilePos, 14.5);
    showTileInspector(tileId, tile);
  };

  // Add sample preview tokens on GO tile so scene is lively immediately
  boardScene.tokenManager.createToken('preview_1', 'car', '#FF3838', 0);
  boardScene.tokenManager.createToken('preview_2', 'hat', '#FDCB6E', 1);

  // Áp dụng Chế Độ Tinh Gọn (Clean Focus Mode) theo thiết lập đã lưu
  applyFocusMode(isCleanFocusMode);

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
  initAuthAndSocialUI();
  checkAuth();
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
    showToast('🖱️ Kéo chuột/chạm để xoay 360° • Cuộn chuột để thu phóng • Chuột phải để di chuyển');
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
    const username = inputUsername.value.trim() || (currentUser?.username || 'Người chơi');
    const name = createRoomName.value.trim() || `Phòng của ${username}`;
    const maxPlayers = parseInt(createMaxPlayers.value);
    const initialCash = parseInt(createInitialCash.value);
    const isProtected = createRoomIsProtected.checked;
    const password = isProtected ? createRoomPassword.value.trim() : undefined;

    if (isProtected && !password) {
      alert('Vui lòng nhập mật khẩu cho phòng riêng tư');
      return;
    }

    socketClient.emit('room:create', {
      name,
      username,
      userId: currentUser?.id,
      frame: currentUser?.equippedFrame || 'frame_default',
      maxPlayers,
      initialCash,
      turnTimeout: 30,
      isPrivate: isProtected,
      password: password || undefined
    });
    elCreateModal.style.display = 'none';
  });

  btnQuickBotGame.addEventListener('click', () => {
    const username = inputUsername.value.trim() || (currentUser?.username || 'Đại Gia');
    socketClient.emit('room:create', {
      name: 'Ván Đấu Cùng AI',
      username,
      userId: currentUser?.id,
      frame: currentUser?.equippedFrame || 'frame_default',
      maxPlayers: 4,
      initialCash: 1500,
      turnTimeout: 20
    });
    (window as any)._autoFillBotsAndStart = true;
  });

  btnJoinRoom.addEventListener('click', () => {
    const roomCode = inputRoomCode.value.trim().toUpperCase();
    if (!roomCode) {
      alert('Vui lòng nhập mã phòng');
      return;
    }
    const matched = cachedPublicRooms.find(r => r.roomCode.toUpperCase() === roomCode);
    if (matched && matched.isProtected) {
      (window as any).onJoinRoomClick(roomCode, true, matched.name);
      return;
    }
    joinRoomWithCode(roomCode);
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
    cancelAutoEndTurn();
    btnRollDice.style.display = 'none';
    socketClient.emit('game:roll_dice');
  });

  btnEndTurn.addEventListener('click', () => {
    cancelAutoEndTurn();
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
      boardScene.cameraManager.snapToGoldenAngle();
      showToast('🧭 Đã căn về góc Isometric chuẩn (45°) — Bạn luôn có thể kéo để xoay tự do mọi góc');
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
    showToast('🔄 Đã đặt lại toàn cảnh sa bàn 3D (Xoay tự do mọi góc)');
  });

  if (btnToggleFocusMode) {
    btnToggleFocusMode.addEventListener('click', () => {
      const newMode = !isCleanFocusMode;
      applyFocusMode(newMode);
      sounds.playTap();
      showToast(
        newMode
          ? '🎯 Đã bật Chế độ Tinh Gọn: Tối ưu tầm nhìn bàn cờ cho thi đấu'
          : '🏛️ Đã chuyển về Sa Bàn Đầy Đủ: Hiển thị trọn vẹn tiểu cảnh 3D sống động'
      );
    });
  }

  btnToggleLog.addEventListener('click', () => {
    const isOpening = elLogDrawer.style.display === 'none';
    elLogDrawer.style.display = isOpening ? 'flex' : 'none';
    btnToggleLog.classList.toggle('is-active', isOpening);
    if (isOpening && elChatDrawer) {
      elChatDrawer.style.display = 'none';
      btnToggleChat?.classList.remove('is-active');
    }
  });

  btnCloseLog.addEventListener('click', () => {
    elLogDrawer.style.display = 'none';
    btnToggleLog.classList.remove('is-active');
  });

  // Chat & Emotes functionality
  function addChatMessage(sender: string, text: string, isMe: boolean = false) {
    if (!chatMessages) return;
    const item = document.createElement('div');
    item.className = `chat-item ${isMe ? 'my-chat' : ''}`;
    item.innerHTML = `
      <div style="font-size: 0.72rem; font-weight: 800; color: ${isMe ? '#00B894' : '#0984E3'}; margin-bottom: 2px;">
        ${sender} ${isMe ? '(Bạn)' : ''}
      </div>
      <div style="color: #2D3436; font-weight: 700; word-break: break-word;">${text}</div>
    `;
    chatMessages.appendChild(item);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function sendChatMessage(msg: string) {
    const trimmed = msg.trim();
    if (!trimmed) return;
    const username = inputUsername?.value || 'Tỷ Phú';
    addChatMessage(username, trimmed, true);
    sounds.playTap();

    // Floating chat speech bubble above local player token
    const sid = socketClient.socket.id || myUserId;
    const myToken = sid ? boardScene.tokenManager.tokens.get(sid) : null;
    const pos = myToken ? myToken.mesh.position : new THREE.Vector3(0, 3, 0);
    boardScene.vfxManager.spawnFloatingText(`💬 ${trimmed}`, pos, true);

    // Emit to socket
    socketClient.emit('game:chat', { text: trimmed, username });
    if (inputChatMsg) inputChatMsg.value = '';
  }

  btnToggleChat?.addEventListener('click', () => {
    if (!elChatDrawer) return;
    const isOpening = elChatDrawer.style.display === 'none';
    elChatDrawer.style.display = isOpening ? 'flex' : 'none';
    btnToggleChat.classList.toggle('is-active', isOpening);
    if (isOpening) {
      elLogDrawer.style.display = 'none';
      btnToggleLog.classList.remove('is-active');
      if (inputChatMsg) setTimeout(() => inputChatMsg.focus(), 100);
    }
  });

  btnCloseChat?.addEventListener('click', () => {
    if (elChatDrawer) elChatDrawer.style.display = 'none';
    btnToggleChat?.classList.remove('is-active');
  });

  btnSendChat?.addEventListener('click', () => {
    if (inputChatMsg) sendChatMessage(inputChatMsg.value);
  });

  inputChatMsg?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage(inputChatMsg.value);
    }
  });

  document.querySelectorAll('.quick-emote-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const msg = (e.currentTarget as HTMLElement).getAttribute('data-msg');
      if (msg) sendChatMessage(msg);
    });
  });

  socketClient.on('game:chat', (data: { sender?: string; username?: string; text: string; userId?: string }) => {
    if (data.userId && data.userId === socketClient.socket.id) return;
    const sender = data.sender || data.username || 'Người chơi';
    addChatMessage(sender, data.text);
    const token = data.userId ? boardScene.tokenManager.tokens.get(data.userId) : null;
    const pos = token ? token.mesh.position : new THREE.Vector3(0, 3, 0);
    boardScene.vfxManager.spawnFloatingText(`${sender}: ${data.text}`, pos, true);
    sounds.playTap();
  });

  btnSkipBuy.addEventListener('click', () => {
    elPropertyModal.style.display = 'none';
    socketClient.emit('game:skip_buy');
    scheduleAutoEndTurn(800, 'Đã bỏ qua mua đất');
  });

  btnConfirmBuy.addEventListener('click', () => {
    elPropertyModal.style.display = 'none';
    if (currentPendingTileAction) {
      socketClient.emit('game:buy_property', { tileId: currentPendingTileAction.tileId });
    }
  });

  btnCloseCard.addEventListener('click', () => {
    elCardModal.style.display = 'none';
    const isMe = latestGameStateSnapshot?.turnState?.currentUserId === socketClient.socket.id;
    if (isMe && latestGameStateSnapshot?.turnState?.phase === 'END_TURN') {
      scheduleAutoEndTurn(800, 'Đã xem xong thẻ vận mệnh');
    }
  });

  btnPlayAgain.addEventListener('click', () => {
    window.location.reload();
  });
}

function bindSocketEvents() {
  socketClient.on('connect', () => {
    myUserId = socketClient.socket.id!;
    const token = getAuthToken();
    if (token) {
      socketClient.emit('auth:authenticate', { token });
    }
  });

  socketClient.on('auth:authenticated', (data: { user: AuthUser }) => {
    if (data?.user) {
      setLoggedInUser(data.user);
    }
  });

  socketClient.on('auth:error', (data: { message: string }) => {
    console.warn('Socket auth notice:', data?.message);
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
    boardScene.tokenManager.clearTokens();

    // Create real player tokens
    data.snapshot.players.forEach((p: any, idx: number) => {
      boardScene.tokenManager.createToken(p.id, p.token, p.color, idx);
    });

    // Mũi tên 3D trỏ vào nhân vật lượt đầu tiên
    const firstId = data.snapshot?.turnState?.currentUserId;
    const firstPlayer = data.snapshot?.players?.find((p: any) => p.id === firstId) || data.snapshot?.players?.[0];
    if (firstPlayer) {
      boardScene.tokenManager.setActiveTurnPlayer(firstPlayer.id, firstPlayer.username, firstPlayer.color);
    }

    updateHudPlayers(data.snapshot);
    sounds.playTurnNotification();
    if ((boardScene as any).syncProperties) {
      (boardScene as any).syncProperties(data.snapshot.properties || [], data.snapshot.players || []);
    }
    latestGameStateSnapshot = data.snapshot;
    checkMyTurn(data.snapshot);
  });

  socketClient.on('game:dice_result', (data: any) => {
    const isMe = data.userId === socketClient.socket.id;
    const player = data.snapshot.players.find((p: any) => p.id === data.userId);
    const slot = data.snapshot.players.findIndex((p: any) => p.id === data.userId);
    latestGameStateSnapshot = data.snapshot;
    latestPlayersSnapshot = data.snapshot.players;

    // Cập nhật mũi tên 3D bám sát nhân vật đang di chuyển lượt này
    if (player) {
      boardScene.tokenManager.setActiveTurnPlayer(player.id, player.username, player.color);
    }

    const total = data.dice1 + data.dice2;
    const isDouble = data.dice1 === data.dice2;
    const playerName = player ? player.username : 'Người chơi';
    showToast(`🎲 ${playerName} lắc được ${total} điểm (${data.dice1} + ${data.dice2}${isDouble ? ' - ĐÔI! 🎉' : ''})!`);

    // Prominent Dice Roll Announcement Banner for all players & spectators
    showDiceAnnouncement(player, data.dice1, data.dice2, isDouble);

    boardScene.dicePhysics.roll(data.dice1, data.dice2, () => {
      // NOTE: Only follow the token when rolling completes and movement actually begins!
      const token = boardScene.tokenManager.tokens.get(data.userId);
      if (token) {
        boardScene.cameraManager.setFollowTarget(token.mesh.position);
      }

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
          const currentTile = boardTilesData[data.newPosition];
          showTileInspector(data.newPosition, currentTile);

          if (currentTile && currentTile.type === 'RAILROAD') {
            sounds.playTrainWhistle();
            boardScene.vfxManager.spawnTrainSmoke(landingPos, 14);
          } else if (currentTile && currentTile.type === 'AIRPORT') {
            sounds.playCardChime();
            boardScene.vfxManager.spawnStarBurst(landingPos, 20);
          } else if (currentTile && (currentTile.type === 'GO_TO_JAIL' || (currentTile.type === 'JAIL' && player && player.inJail))) {
            sounds.playJailSlam();
          }

          if (data.passedGo) {
            sounds.playCashTransaction();
            boardScene.vfxManager.spawnFloatingDollar('200M (Lương)', landingPos, true);
            boardScene.vfxManager.spawnStarBurst(landingPos, 20);
          }

          handleTileActionResult(data.actionResult, isMe, player, landingPos);
          const snap = latestGameStateSnapshot || data.snapshot;
          checkMyTurn(snap);

          // Nếu ô cờ không mở modal mua bán hay thẻ (ví dụ trả tiền thuê, nộp thuế, đi qua GO)
          const isModalOpen = (elPropertyModal && elPropertyModal.style.display === 'flex') ||
                              (elCardModal && elCardModal.style.display === 'flex');
          if (isMe && snap?.turnState?.phase === 'END_TURN' && !isModalOpen) {
            scheduleAutoEndTurn(1500, 'Giao dịch tại ô cờ hoàn tất');
          }
        }
      );
    });

    latestGameStateSnapshot = data.snapshot;
    latestPropertiesSnapshot = data.snapshot.properties || latestPropertiesSnapshot;
    updateHudPlayers(data.snapshot);
    renderLogs(data.snapshot.logs);
  });

  socketClient.on('game:property_updated', (data: any) => {
    latestGameStateSnapshot = data.snapshot;
    if ((boardScene as any).syncProperties) {
      (boardScene as any).syncProperties(data.snapshot.properties || [], data.snapshot.players || []);
    } else {
      boardScene.updateBuilding(data.tileId, data.level);
    }
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
    checkMyTurn(data.snapshot);

    // Tự động kết thúc lượt sau khi mua hoặc nâng cấp bất động sản hoàn tất
    const isMe = data.ownerId === socketClient.socket.id || data.snapshot?.turnState?.currentUserId === socketClient.socket.id;
    if (isMe && data.snapshot?.turnState?.phase === 'END_TURN') {
      scheduleAutoEndTurn(1200, 'Giao dịch mua / nâng cấp bất động sản hoàn tất');
    }
  });

  socketClient.on('game:state_sync', (data: any) => {
    latestGameStateSnapshot = data.snapshot;
    latestPlayersSnapshot = data.snapshot.players;
    latestPropertiesSnapshot = data.snapshot.properties || latestPropertiesSnapshot;
    if ((boardScene as any).syncProperties) {
      (boardScene as any).syncProperties(data.snapshot.properties || [], data.snapshot.players || []);
    }
    if (currentInspectedTileId !== null) {
      showTileInspector(currentInspectedTileId);
    }
    if (elBoardRosterModal.style.display === 'flex') {
      renderBoardRoster();
    }
    updateHudPlayers(data.snapshot);
    renderLogs(data.snapshot.logs);
    checkMyTurn(data.snapshot);

    const isMe = data.snapshot?.turnState?.currentUserId === socketClient.socket.id;
    const isModalOpen = (elPropertyModal && elPropertyModal.style.display === 'flex') ||
                        (elCardModal && elCardModal.style.display === 'flex');
    if (isMe && data.snapshot?.turnState?.phase === 'END_TURN' && !isModalOpen && !autoEndTurnTimer) {
      scheduleAutoEndTurn(1200, 'Giao dịch hoàn tất');
    }
  });

  socketClient.on('game:turn_change', (data: any) => {
    cancelAutoEndTurn();
    elPropertyModal.style.display = 'none';
    latestGameStateSnapshot = data.snapshot;
    latestPlayersSnapshot = data.snapshot.players;
    latestPropertiesSnapshot = data.snapshot.properties || latestPropertiesSnapshot;
    updateHudPlayers(data.snapshot);
    renderLogs(data.snapshot.logs);
    checkMyTurn(data.snapshot);

    const nextPlayer = data.snapshot?.players?.find((p: any) => p.id === data.nextUserId);
    if (nextPlayer && boardScene?.tokenManager) {
      boardScene.tokenManager.setActiveTurnPlayer(data.nextUserId, nextPlayer.username, nextPlayer.color);
    }
  });

  socketClient.on('game:timer_tick', (data: { remaining: number }) => {
    const pct = Math.max(0, Math.min(100, (data.remaining / 30) * 100));
    timerFill.style.width = `${pct}%`;
    timerFill.style.backgroundColor = data.remaining <= 5 ? '#D63031' : '#00B894';
  });

  socketClient.on('game:over', (data: any) => {
    cancelAutoEndTurn();
    if (boardScene?.tokenManager) {
      boardScene.tokenManager.setActiveTurnPlayer(null);
    }
    elPropertyModal.style.display = 'none';
    elCardModal.style.display = 'none';
    showVictory(data);
  });

  socketClient.on('error:message', (data: { message: string }) => {
    if (elJoinPasswordModal && elJoinPasswordModal.style.display !== 'none') {
      joinPasswordError.textContent = data.message;
      joinPasswordError.style.display = 'block';
    } else {
      if (data.message && data.message.includes('Mật khẩu') && pendingJoinRoomCode) {
        joinPasswordRoomName.textContent = pendingJoinRoomCode;
        joinPasswordError.textContent = data.message;
        joinPasswordError.style.display = 'block';
        elJoinPasswordModal.style.display = 'flex';
      } else {
        alert(data.message);
      }
    }
  });
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function setLoggedInUser(user: AuthUser) {
  currentUser = user;
  elAuthGuestView.style.display = 'none';
  elAuthUserView.style.display = 'flex';

  const avatar = user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`;
  headerUserAvatar.src = avatar;
  headerUserName.textContent = user.username;
  headerUserGold.textContent = `🪙 ${(user.goldBalance || 0).toLocaleString()} Vàng`;

  inputUsername.value = user.username;
  inputUsername.readOnly = true;
}

function setGuestMode() {
  currentUser = null;
  elAuthGuestView.style.display = 'flex';
  elAuthUserView.style.display = 'none';

  inputUsername.value = 'Tỷ Phú Trẻ';
  inputUsername.readOnly = false;
}

async function checkAuth() {
  const token = getAuthToken();
  if (!token) {
    setGuestMode();
    return;
  }
  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        setLoggedInUser(data.user);
        socketClient.emit('auth:authenticate', { token });
        return;
      }
    }
  } catch (err) {
    console.warn('Auth check error:', err);
  }
  localStorage.removeItem('token');
  setGuestMode();
}

async function handleLogout() {
  const token = getAuthToken();
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (e) {}
  }
  localStorage.removeItem('token');
  setGuestMode();
  showToast('Đã đăng xuất tài khoản thành công.');
}

function showLoginError(msg: string) {
  loginErrorMsg.textContent = msg;
  loginErrorMsg.style.display = 'block';
}

function hideLoginError() {
  loginErrorMsg.style.display = 'none';
}

function showRegisterError(msg: string) {
  registerErrorMsg.textContent = msg;
  registerErrorMsg.style.display = 'block';
}

function hideRegisterError() {
  registerErrorMsg.style.display = 'none';
}

function renderAvatarPicker() {
  if (!registerAvatarPicker) return;
  registerAvatarPicker.innerHTML = SAMPLE_AVATARS.map((url, idx) => `
    <img src="${url}" class="avatar-pick-item ${url === selectedAvatarUrl ? 'selected' : ''}" 
      onclick="window.selectAvatarOption('${url}')" alt="Avatar ${idx + 1}" />
  `).join('');
}

(window as any).selectAvatarOption = (url: string) => {
  selectedAvatarUrl = url;
  renderAvatarPicker();
};

async function submitLogin() {
  const identifier = loginIdentifier.value.trim();
  const password = loginPassword.value;
  if (!identifier || !password) {
    showLoginError('Vui lòng điền đầy đủ tên đăng nhập/email và mật khẩu.');
    return;
  }
  hideLoginError();

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok || !data.token) {
      showLoginError(data.error || 'Đăng nhập không thành công.');
      return;
    }

    localStorage.setItem('token', data.token);
    setLoggedInUser(data.user);
    socketClient.emit('auth:authenticate', { token: data.token });
    elAuthModal.style.display = 'none';
    loginIdentifier.value = '';
    loginPassword.value = '';
    showToast(`Chào mừng ${data.user.username} quay lại đấu trường! 🎉`);
  } catch (err) {
    showLoginError('Lỗi kết nối máy chủ. Vui lòng thử lại.');
  }
}

async function submitRegister() {
  const username = registerUsername.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;
  const avatarUrl = selectedAvatarUrl;

  if (!username || username.length < 3 || username.length > 30) {
    showRegisterError('Tên người chơi phải từ 3 đến 30 ký tự.');
    return;
  }
  if (!email || !email.includes('@')) {
    showRegisterError('Vui lòng nhập định dạng email hợp lệ.');
    return;
  }
  if (!password || password.length < 6) {
    showRegisterError('Mật khẩu tối thiểu 6 ký tự.');
    return;
  }
  hideRegisterError();

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, avatarUrl })
    });
    const data = await res.json();
    if (!res.ok || !data.token) {
      showRegisterError(data.error || 'Đăng ký tài khoản không thành công.');
      return;
    }

    localStorage.setItem('token', data.token);
    setLoggedInUser(data.user);
    socketClient.emit('auth:authenticate', { token: data.token });
    elAuthModal.style.display = 'none';
    registerUsername.value = '';
    registerEmail.value = '';
    registerPassword.value = '';
    showToast(`Chúc mừng ${data.user.username} đã tạo tài khoản thành công! 🎊`);
  } catch (err) {
    showRegisterError('Lỗi kết nối máy chủ. Vui lòng thử lại.');
  }
}

let cachedUserAchievements: any[] = [];
let cachedUserFrames: any[] = [];
let selectedAchievementTier: string = 'ALL';

async function openProfileModal() {
  if (!currentUser) {
    showToast('Vui lòng đăng nhập để xem thông tin hồ sơ.');
    elAuthModal.style.display = 'flex';
    return;
  }

  profileAvatarImg.src = currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`;
  profileUsername.textContent = currentUser.username;
  profileEmail.textContent = currentUser.email;
  profileGoldBalance.textContent = `${(currentUser.goldBalance || 0).toLocaleString()} Vàng`;
  profileTotalMatches.textContent = `${currentUser.totalMatches || 0}`;
  profileTotalWins.textContent = `${currentUser.totalWins || 0}`;

  const winRate = currentUser.totalMatches > 0
    ? ((currentUser.totalWins / currentUser.totalMatches) * 100).toFixed(1) + '%'
    : '0.0%';
  profileWinRate.textContent = winRate;

  // Active Frame Live Preview in Profile Hero Card
  const equipped = currentUser.equippedFrame || 'frame_default';
  const frameCfg = FRAME_TIER_CONFIG[equipped] || FRAME_TIER_CONFIG.frame_default;
  if (profileAvatarWrapper) {
    profileAvatarWrapper.className = `profile-avatar-wrapper nameplate-frame ${getFrameTierClass(equipped)}`;
  }
  if (profileFrameBadge) {
    profileFrameBadge.textContent = frameCfg.name;
    profileFrameBadge.className = `profile-frame-badge ${getFrameTierClass(equipped)}`;
  }
  if (profileLevelBadge) {
    profileLevelBadge.textContent = frameCfg.badge;
    profileLevelBadge.className = `nameplate-badge ${getFrameTierClass(equipped)}`;
  }

  // Switch to default achievements tab
  switchProfileTab('achievements');

  elProfileModal.style.display = 'flex';
  await Promise.all([fetchMyAchievements(), fetchMyFrames()]);
}

function switchProfileTab(tab: 'achievements' | 'frames') {
  if (tabBtnProfileAchievements) tabBtnProfileAchievements.classList.toggle('active', tab === 'achievements');
  if (tabBtnProfileFrames) tabBtnProfileFrames.classList.toggle('active', tab === 'frames');
  if (paneProfileAchievements) paneProfileAchievements.style.display = tab === 'achievements' ? 'block' : 'none';
  if (paneProfileFrames) paneProfileFrames.style.display = tab === 'frames' ? 'block' : 'none';
}

async function fetchMyAchievements() {
  const token = getAuthToken();
  if (!token) return;
  profileAchievementsList.innerHTML = '<div style="font-size:0.8rem;color:#B2BEC3;text-align:center;padding:12px;">Đang tải danh hiệu...</div>';
  try {
    const res = await fetch('/api/achievements/my', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    cachedUserAchievements = data.achievements || [];

    const totalUnlocked = data.totalUnlocked || 0;
    const totalAvailable = data.totalAvailable || cachedUserAchievements.length || 10;

    // Calculate Mastery Level 1 to 5 (Xám - Xanh - Vàng - Cam - Đỏ)
    let masteryTitle = 'Level 1: Sơ Cấp (Xám)';
    let masteryTierClass = 'tier-gray';
    const masteryPercent = Math.min(100, Math.round((totalUnlocked / totalAvailable) * 100));

    if (totalUnlocked >= 9) {
      masteryTitle = 'Level 5: Tối Thượng (Đỏ Ruby)';
      masteryTierClass = 'tier-red';
    } else if (totalUnlocked >= 7) {
      masteryTitle = 'Level 4: Huyền Thoại (Cam Lửa)';
      masteryTierClass = 'tier-orange';
    } else if (totalUnlocked >= 5) {
      masteryTitle = 'Level 3: Tinh Anh (Vàng Hoàng Kim)';
      masteryTierClass = 'tier-gold';
    } else if (totalUnlocked >= 3) {
      masteryTitle = 'Level 2: Thành Thạo (Xanh Lam Ngọc)';
      masteryTierClass = 'tier-blue';
    } else {
      masteryTitle = 'Level 1: Sơ Cấp (Xám Tân Thủ)';
      masteryTierClass = 'tier-gray';
    }

    if (profileMasteryTitle) {
      profileMasteryTitle.innerHTML = `Cấp Độ Thông Thạo: <span class="mastery-tier-tag ${masteryTierClass}">${masteryTitle}</span>`;
    }
    if (profileMasteryXp) profileMasteryXp.textContent = `${totalUnlocked} / ${totalAvailable} Thành Tựu`;
    if (profileMasteryBar) profileMasteryBar.style.width = `${Math.max(10, masteryPercent)}%`;
    if (profileStatAchievements) profileStatAchievements.textContent = `${totalUnlocked}/${totalAvailable}`;
    if (profileAchCount) profileAchCount.textContent = `${totalUnlocked}`;

    renderAchievementsList();
  } catch (e) {
    profileAchievementsList.innerHTML = '<div style="font-size:0.8rem;color:#E84118;text-align:center;padding:12px;">Không thể tải danh sách thành tựu.</div>';
  }
}

function renderAchievementsList() {
  let list = cachedUserAchievements;
  if (selectedAchievementTier !== 'ALL') {
    list = list.filter(a => a.tier === selectedAchievementTier);
  }

  if (!list.length) {
    profileAchievementsList.innerHTML = '<div style="font-size:0.8rem;color:#B2BEC3;text-align:center;padding:16px;">Không có thành tựu nào ở cấp độ này.</div>';
    return;
  }

  profileAchievementsList.innerHTML = list.map(ach => {
    let actionBtn = '';
    if (ach.isUnlocked && !ach.isClaimed) {
      actionBtn = `<button class="btn-chunky btn-primary btn-xs" onclick="window.claimAchievementReward('${ach.id}')" style="white-space:nowrap;">Nhận Thưởng 🪙 ${ach.reward_gold}</button>`;
    } else if (ach.isClaimed) {
      actionBtn = `<span style="font-size:0.75rem;font-weight:800;color:#00B894;">✓ Đã Nhận</span>`;
    } else {
      actionBtn = `<span style="font-size:0.75rem;font-weight:700;color:#B2BEC3;">🔒 🪙 ${ach.reward_gold}</span>`;
    }

    const tierClass = getFrameTierClass(ach.frame_id);
    const tierPill = `<span class="nameplate-badge" style="font-size:0.65rem;">Lv.${ach.level || 1} ${ach.tier || 'GRAY'}</span>`;

    return `
      <div class="achievement-card ${ach.isUnlocked ? 'unlocked' : 'locked'} ${tierClass}" style="border-left: 4px solid;">
        <div class="achievement-card-left">
          <div class="achievement-icon">${ach.icon || '🏆'}</div>
          <div>
            <div class="achievement-title" style="display:flex;align-items:center;gap:6px;">
              <span>${ach.name}</span>
              ${tierPill}
            </div>
            <div class="achievement-desc">${ach.description}</div>
            <div style="font-size:0.68rem;color:#E17055;font-weight:800;margin-top:2px;">
              👑 Khung: <b>${ach.frame_name || 'Khung Tân Thủ'}</b>
            </div>
          </div>
        </div>
        <div class="achievement-card-right">
          ${actionBtn}
        </div>
      </div>
    `;
  }).join('');
}

async function fetchMyFrames() {
  const token = getAuthToken();
  if (!token) return;
  if (!profileFramesGrid) return;
  profileFramesGrid.innerHTML = '<div style="font-size:0.8rem;color:#B2BEC3;text-align:center;padding:12px;">Đang tải khung danh hiệu...</div>';
  try {
    const res = await fetch('/api/profile/frames', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    cachedUserFrames = data.frames || [];
    if (currentUser && data.equippedFrame) {
      currentUser.equippedFrame = data.equippedFrame;
    }
    const unlockedCount = cachedUserFrames.filter(f => f.isUnlocked).length;
    if (profileFramesCount) profileFramesCount.textContent = `${unlockedCount}`;
    renderFramesGrid();
  } catch (e) {
    if (profileFramesGrid) profileFramesGrid.innerHTML = '<div style="font-size:0.8rem;color:#E84118;text-align:center;padding:12px;">Không thể tải danh sách khung tên.</div>';
  }
}

function renderFramesGrid() {
  if (!profileFramesGrid) return;
  if (!cachedUserFrames.length) {
    profileFramesGrid.innerHTML = '<div style="font-size:0.8rem;color:#B2BEC3;text-align:center;padding:12px;">Chưa có khung danh hiệu nào.</div>';
    return;
  }

  profileFramesGrid.innerHTML = cachedUserFrames.map(f => {
    const tierClass = getFrameTierClass(f.frameId);
    let buttonHtml = '';
    if (f.isEquipped) {
      buttonHtml = `<button class="btn-chunky btn-xs" disabled style="background:#00B894;color:white;width:100%;">✓ Đang Dùng</button>`;
    } else if (f.isUnlocked) {
      buttonHtml = `<button class="btn-chunky btn-primary btn-xs" onclick="window.equipPlayerFrame('${f.frameId}')" style="width:100%;">Trang Bị</button>`;
    } else {
      buttonHtml = `<button class="btn-chunky btn-xs" disabled style="background:#E2E8F0;color:#94A3B8;width:100%;">🔒 Chưa Mở</button>`;
    }

    return `
      <div class="frame-showcase-card ${f.isEquipped ? 'is-equipped' : ''} ${f.isUnlocked ? '' : 'locked'}">
        <div class="frame-preview-box nameplate-frame ${tierClass}">
          <span style="font-size:1.6rem;">${f.tier === 'RED' ? '👑' : f.tier === 'ORANGE' ? '⚡' : f.tier === 'GOLD' ? '💰' : f.tier === 'BLUE' ? '🎲' : '🏠'}</span>
        </div>
        <div style="font-weight:800;font-size:0.85rem;color:#2D3436;line-height:1.3;">${f.frameName}</div>
        <span class="frame-tier-pill tier-${(f.tier || 'gray').toLowerCase()}">Level ${f.level} • ${f.tier}</span>
        <div style="font-size:0.7rem;color:#636E72;line-height:1.3;min-height:28px;">
          ${f.achievementName ? `Yêu cầu: <b>${f.achievementName}</b>` : f.achievementDesc || ''}
        </div>
        <div style="width:100%;margin-top:4px;">
          ${buttonHtml}
        </div>
      </div>
    `;
  }).join('');
}

(window as any).equipPlayerFrame = async (frameId: string) => {
  const token = getAuthToken();
  if (!token) return;
  try {
    const res = await fetch('/api/profile/equip-frame', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ frameId })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (currentUser) {
        currentUser.equippedFrame = data.equippedFrame;
      }
      sounds.playTap();
      showToast(data.message || 'Đã trang bị khung tên thành công!');

      // Update Live Preview in Profile
      const frameCfg = FRAME_TIER_CONFIG[data.equippedFrame] || FRAME_TIER_CONFIG.frame_default;
      if (profileAvatarWrapper) {
        profileAvatarWrapper.className = `profile-avatar-wrapper nameplate-frame ${getFrameTierClass(data.equippedFrame)}`;
      }
      if (profileFrameBadge) {
        profileFrameBadge.textContent = frameCfg.name;
        profileFrameBadge.className = `profile-frame-badge ${getFrameTierClass(data.equippedFrame)}`;
      }
      if (profileLevelBadge) {
        profileLevelBadge.textContent = frameCfg.badge;
        profileLevelBadge.className = `nameplate-badge ${getFrameTierClass(data.equippedFrame)}`;
      }

      // Update cached frames list and re-render
      cachedUserFrames.forEach(f => {
        f.isEquipped = (f.frameId === data.equippedFrame);
      });
      renderFramesGrid();
    } else {
      showToast(data.error || 'Không thể trang bị khung tên.');
    }
  } catch (e) {
    showToast('Lỗi khi trang bị khung tên.');
  }
};

(window as any).claimAchievementReward = async (achievementId: string) => {
  const token = getAuthToken();
  if (!token) return;
  try {
    const res = await fetch('/api/achievements/claim', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ achievementId })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (currentUser && typeof data.currentGoldBalance === 'number') {
        currentUser.goldBalance = data.currentGoldBalance;
        headerUserGold.textContent = `🪙 ${currentUser.goldBalance.toLocaleString()} Vàng`;
        profileGoldBalance.textContent = `${currentUser.goldBalance.toLocaleString()} Vàng`;
      }
      showToast(data.message || `+${data.rewardGold} Vàng nhận thưởng!`);
      await fetchMyAchievements();
      await fetchMyFrames();
    } else {
      alert(data.error || 'Không thể nhận thưởng.');
    }
  } catch (e) {
    alert('Lỗi nhận thưởng.');
  }
};

async function openFriendsModal(initialTab: 'list' | 'add' | 'requests' = 'list') {
  if (!currentUser) {
    showToast('Vui lòng đăng nhập để mở danh sách bạn bè.');
    elAuthModal.style.display = 'flex';
    return;
  }
  elFriendsModal.style.display = 'flex';
  switchFriendsTab(initialTab);
  await loadFriendsData();
}

function switchFriendsTab(tab: 'list' | 'add' | 'requests') {
  tabBtnFriendsList.classList.toggle('active', tab === 'list');
  tabBtnAddFriend.classList.toggle('active', tab === 'add');
  tabBtnFriendRequests.classList.toggle('active', tab === 'requests');

  paneFriendsList.style.display = tab === 'list' ? 'flex' : 'none';
  paneAddFriend.style.display = tab === 'add' ? 'flex' : 'none';
  paneFriendRequests.style.display = tab === 'requests' ? 'flex' : 'none';
}

async function loadFriendsData() {
  const token = getAuthToken();
  if (!token) return;
  try {
    const res = await fetch('/api/friends', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    renderFriendsList(data.friends || []);
    renderFriendRequests(data.incomingRequests || []);
    badgeFriendsCount.textContent = `${(data.friends || []).length}`;
    const reqCount = (data.incomingRequests || []).length;
    badgeRequestsCount.textContent = `${reqCount}`;
    badgeRequestsCount.style.display = reqCount > 0 ? 'inline-block' : 'none';
  } catch (e) {
    console.error('Error loading friends:', e);
  }
}

function renderFriendsList(friends: any[]) {
  if (!friends.length) {
    friendsListContainer.innerHTML = `
      <div style="font-size:0.85rem;color:#B2BEC3;text-align:center;padding:24px;">
        Chưa có bạn bè nào.<br />Hãy chuyển sang tab "➕ Thêm Bạn" để kết nối!
      </div>
    `;
    return;
  }
  friendsListContainer.innerHTML = friends.map(f => {
    const avatar = f.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${f.username}`;
    return `
      <div class="friend-item-card">
        <div class="friend-item-info">
          <img class="friend-item-avatar" src="${avatar}" alt="${f.username}" />
          <div>
            <div style="font-weight:800;font-size:0.88rem;color:#2D3436;display:flex;align-items:center;gap:6px;">
              <span>${f.username}</span>
              <span class="friend-status-dot online" title="Trực tuyến"></span>
            </div>
            <div style="font-size:0.75rem;color:#636E72;">🪙 ${(f.gold_balance || 0).toLocaleString()} • Thắng: ${f.total_wins || 0}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <button class="btn-chunky btn-primary btn-xs" onclick="window.inviteFriendToRoom('${f.username}')" title="Mời vào phòng chơi">
            💌 Mời
          </button>
          <button class="btn-chunky btn-white btn-xs" onclick="window.removeFriendPrompt('${f.id}', '${f.username}')" title="Xóa bạn">
            ✕
          </button>
        </div>
      </div>
    `;
  }).join('');
}

(window as any).inviteFriendToRoom = (friendUsername: string) => {
  if (currentRoomCode) {
    navigator.clipboard.writeText(currentRoomCode).catch(() => {});
    showToast(`Đã sao chép mã phòng ${currentRoomCode} để gửi mời ${friendUsername}! 💌`);
  } else {
    showToast(`Bạn chưa tham gia phòng nào! Hãy tạo phòng hoặc vào phòng trước.`);
  }
};

(window as any).removeFriendPrompt = async (friendId: string, friendUsername: string) => {
  if (!confirm(`Bạn có chắc chắn muốn hủy kết bạn với ${friendUsername}?`)) return;
  const token = getAuthToken();
  if (!token) return;
  try {
    const res = await fetch(`/api/friends/${friendId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      showToast(`Đã xóa bạn với ${friendUsername}.`);
      await loadFriendsData();
    }
  } catch (e) {
    alert('Không thể xóa bạn.');
  }
};

function renderFriendRequests(requests: any[]) {
  if (!requests.length) {
    friendRequestsContainer.innerHTML = `
      <div style="font-size:0.85rem;color:#B2BEC3;text-align:center;padding:24px;">
        Không có lời mời kết bạn nào đang chờ.
      </div>
    `;
    return;
  }
  friendRequestsContainer.innerHTML = requests.map(r => {
    const avatar = r.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${r.username}`;
    return `
      <div class="friend-item-card">
        <div class="friend-item-info">
          <img class="friend-item-avatar" src="${avatar}" alt="${r.username}" />
          <div>
            <div style="font-weight:800;font-size:0.88rem;color:#2D3436;">${r.username}</div>
            <div style="font-size:0.75rem;color:#636E72;">${r.email || 'Người chơi mới'}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <button class="btn-chunky btn-primary btn-xs" onclick="window.respondFriendRequest('${r.request_id}', 'ACCEPT')">
            ✓ Đồng Ý
          </button>
          <button class="btn-chunky btn-white btn-xs" onclick="window.respondFriendRequest('${r.request_id}', 'REJECT')">
            ✕ Từ Chối
          </button>
        </div>
      </div>
    `;
  }).join('');
}

(window as any).respondFriendRequest = async (requestId: string, action: 'ACCEPT' | 'REJECT') => {
  const token = getAuthToken();
  if (!token) return;
  try {
    const res = await fetch('/api/friends/respond', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ requestId, action })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message || (action === 'ACCEPT' ? 'Đã chấp nhận kết bạn!' : 'Đã từ chối lời mời.'));
      await loadFriendsData();
    } else {
      alert(data.error || 'Thao tác không thành công.');
    }
  } catch (e) {
    alert('Lỗi phản hồi kết bạn.');
  }
};

function showAddFriendStatus(msg: string, isSuccess: boolean) {
  addFriendStatus.textContent = msg;
  addFriendStatus.style.color = isSuccess ? '#00B894' : '#E84118';
  addFriendStatus.style.display = 'block';
}

async function sendFriendRequestSubmit() {
  const targetIdentifier = inputFriendIdentifier.value.trim();
  if (!targetIdentifier) {
    showAddFriendStatus('Vui lòng nhập username hoặc email của bạn bè.', false);
    return;
  }
  const token = getAuthToken();
  if (!token) return;
  try {
    const res = await fetch('/api/friends/request', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetIdentifier })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showAddFriendStatus(data.message || 'Đã gửi lời mời kết bạn!', true);
      inputFriendIdentifier.value = '';
      await loadFriendsData();
    } else {
      showAddFriendStatus(data.error || 'Không thể gửi lời mời.', false);
    }
  } catch (e) {
    showAddFriendStatus('Lỗi kết nối máy chủ.', false);
  }
}

function initAuthAndSocialUI() {
  // 1. Header Buttons
  btnOpenAuth.addEventListener('click', () => {
    loginErrorMsg.style.display = 'none';
    registerErrorMsg.style.display = 'none';
    elAuthModal.style.display = 'flex';
  });

  btnCloseAuth.addEventListener('click', () => {
    elAuthModal.style.display = 'none';
  });

  btnOpenProfile.addEventListener('click', () => {
    openProfileModal();
  });

  btnCloseProfile.addEventListener('click', () => {
    elProfileModal.style.display = 'none';
  });

  // Profile Modal Tabs & Tier Filters
  if (tabBtnProfileAchievements) {
    tabBtnProfileAchievements.addEventListener('click', () => {
      switchProfileTab('achievements');
    });
  }

  if (tabBtnProfileFrames) {
    tabBtnProfileFrames.addEventListener('click', () => {
      switchProfileTab('frames');
    });
  }

  // Tier filter chips for achievements
  document.querySelectorAll('.tier-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.tier-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedAchievementTier = (chip as HTMLElement).dataset.tier || 'ALL';
      renderAchievementsList();
    });
  });

  btnOpenFriends.addEventListener('click', () => {
    openFriendsModal('list');
  });

  btnCloseFriends.addEventListener('click', () => {
    elFriendsModal.style.display = 'none';
  });

  btnLogout.addEventListener('click', () => {
    handleLogout();
  });

  // 2. Auth Modal Tabs & Forms
  tabBtnLogin.addEventListener('click', () => {
    tabBtnLogin.classList.add('active');
    tabBtnRegister.classList.remove('active');
    formLogin.style.display = 'flex';
    formRegister.style.display = 'none';
    loginErrorMsg.style.display = 'none';
  });

  tabBtnRegister.addEventListener('click', () => {
    tabBtnRegister.classList.add('active');
    tabBtnLogin.classList.remove('active');
    formLogin.style.display = 'none';
    formRegister.style.display = 'flex';
    registerErrorMsg.style.display = 'none';
    renderAvatarPicker();
  });

  btnSubmitLogin.addEventListener('click', submitLogin);
  loginPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitLogin();
  });

  btnSubmitRegister.addEventListener('click', submitRegister);
  registerPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitRegister();
  });

  // 3. Friends Modal Tabs & Form
  tabBtnFriendsList.addEventListener('click', () => switchFriendsTab('list'));
  tabBtnAddFriend.addEventListener('click', () => switchFriendsTab('add'));
  tabBtnFriendRequests.addEventListener('click', () => switchFriendsTab('requests'));

  btnSendFriendRequest.addEventListener('click', sendFriendRequestSubmit);
  inputFriendIdentifier.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendFriendRequestSubmit();
  });

  // 4. Room Password Elements
  createRoomIsProtected.addEventListener('change', () => {
    createRoomPasswordGroup.style.display = createRoomIsProtected.checked ? 'block' : 'none';
    if (createRoomIsProtected.checked) {
      createRoomPassword.focus();
    }
  });

  btnCancelJoinPassword.addEventListener('click', () => {
    elJoinPasswordModal.style.display = 'none';
    pendingJoinRoomCode = '';
  });

  btnConfirmJoinPassword.addEventListener('click', () => {
    const pass = joinPasswordInput.value.trim();
    if (!pass) {
      joinPasswordError.textContent = 'Vui lòng nhập mật khẩu phòng';
      joinPasswordError.style.display = 'block';
      return;
    }
    elJoinPasswordModal.style.display = 'none';
    joinRoomWithCode(pendingJoinRoomCode, pass);
  });

  joinPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      btnConfirmJoinPassword.click();
    }
  });

  renderAvatarPicker();
}

function joinRoomWithCode(roomCode: string, password?: string) {
  const username = inputUsername.value.trim() || (currentUser?.username || 'Người chơi');
  pendingJoinRoomCode = roomCode;
  socketClient.emit('room:join', {
    roomCode,
    username,
    userId: currentUser?.id,
    frame: currentUser?.equippedFrame || 'frame_default',
    password: password || undefined
  });
}

(window as any).onJoinRoomClick = (roomCode: string, isProtected: boolean, roomName: string) => {
  if (isProtected) {
    pendingJoinRoomCode = roomCode;
    joinPasswordRoomName.textContent = roomName || roomCode;
    joinPasswordInput.value = '';
    joinPasswordError.style.display = 'none';
    elJoinPasswordModal.style.display = 'flex';
    joinPasswordInput.focus();
  } else {
    joinRoomWithCode(roomCode);
  }
};

function renderRoomList(rooms: any[]) {
  cachedPublicRooms = rooms || [];
  if (!rooms || rooms.length === 0) {
    roomListContainer.innerHTML = `<div style="font-size: 0.8rem; color: #B2BEC3; text-align: center; padding: 10px;">Chưa có phòng nào. Hãy tạo phòng mới!</div>`;
    return;
  }

  roomListContainer.innerHTML = rooms.map(r => `
    <div style="background: white; border-radius: 12px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
      <div>
        <div style="font-weight: 800; font-size: 0.85rem; color: #2D3436; display: flex; align-items: center; gap: 4px;">
          <span>${r.name}</span>
          ${r.isProtected ? '<span title="Phòng bảo vệ bằng mật khẩu" style="font-size:0.85rem;">🔒</span>' : ''}
        </div>
        <div style="font-size: 0.72rem; color: #636E72;">Mã: <b>${r.roomCode}</b> • ${r.playersCount}/${r.maxPlayers} người</div>
      </div>
      <button class="btn-chunky btn-blue" style="padding: 4px 12px; font-size: 0.75rem;" onclick="window.onJoinRoomClick('${r.roomCode}', ${Boolean(r.isProtected)}, '${escapeHtml(r.name)}')">
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

    if (p) {
      const isMe = p.id === socketClient.socket.id;
      const frameId = p.frame || 'frame_default';
      const frameClass = getFrameTierClass(frameId);
      const frameBadge = getFrameBadgeTag(frameId);

      slotDiv.className = `waiting-slot-card nameplate-frame ${frameClass}`;
      slotDiv.style.cssText = 'border-radius: 14px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;';
      slotDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${p.avatar}" style="width: 36px; height: 36px; border-radius: 50%; background: #EBF2FA; border: 2px solid ${p.color || '#CBD5E1'};" />
          <div>
            <div style="font-weight: 800; font-size: 0.95rem; color: #2D3436; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span>${p.username}</span>
              ${isMe ? '<span style="color:#00B894; font-size:0.75rem;">(Bạn)</span>' : ''}
              ${frameBadge}
            </div>
            <div style="font-size: 0.75rem; color: #636E72;">${p.isHost ? '👑 Chủ phòng' : p.isBot ? '🤖 Bot AI' : 'Thành viên'}</div>
          </div>
        </div>
        <div style="font-size: 1.4rem;">${p.token === 'car' ? '🚗' : p.token === 'hat' ? '🎩' : p.token === 'dog' ? '🐕' : '🚀'}</div>
      `;
    } else {
      slotDiv.style.cssText = 'background: white; border-radius: 14px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); opacity: 0.6;';
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
    const frameId = p.frame || 'frame_default';
    const frameClass = getFrameTierClass(frameId);
    const frameBadge = getFrameBadgeTag(frameId);

    const dotsHtml = ownedProps.slice(0, 8).map((pr: any) => {
      const tile = boardTilesData && boardTilesData[pr.tileId];
      const dotColor = (tile && tile.districtColor) ? tile.districtColor : '#2D3436';
      return `<span class="district-dot" style="background:${dotColor};" title="${tile ? tile.name : ''}"></span>`;
    }).join('');
    const extraCount = ownedProps.length > 8 ? `<span style="font-size:0.62rem;font-weight:800;color:#636E72;">+${ownedProps.length - 8}</span>` : '';

    return `
      <div class="player-badge nameplate-frame ${frameClass} ${isTurn ? 'active-turn' : ''} ${p.isBankrupt ? 'bankrupt' : ''}" style="border-left: 5px solid ${p.color} !important;" onclick="window.focusPlayerOnBoard('${p.id}')" title="Nhấn để xem vị trí của ${p.username} trên bàn cờ">
        <img class="player-avatar" src="${p.avatar}" style="border: 2px solid ${p.color};" />
        <div class="player-info">
          <div class="player-name-row" style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">
            <span class="player-name">${p.username} ${isMe ? '(Bạn)' : ''} ${p.inJail ? '🔒' : ''}</span>
            ${frameBadge}
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

let autoEndTurnTimer: any = null;

function cancelAutoEndTurn() {
  if (autoEndTurnTimer) {
    clearTimeout(autoEndTurnTimer);
    autoEndTurnTimer = null;
  }
}

function scheduleAutoEndTurn(delayMs: number = 1200, reason: string = 'Giao dịch hoàn tất') {
  cancelAutoEndTurn();

  const snap = latestGameStateSnapshot;
  if (!snap || !snap.turnState) return;

  const curUserId = snap.turnState.currentUserId;
  const isMyTurn = curUserId === socketClient.socket.id;
  const me = snap.players?.find((p: any) => p.id === socketClient.socket.id);

  if (!isMyTurn || snap.isGameOver || me?.isBankrupt) return;

  // Nếu đổ trúng đôi và đang ở pha lắc tiếp, người chơi được tung xúc xắc tiếp
  if (snap.turnState.isDouble && snap.turnState.phase === 'ROLL_DICE') return;

  // Không tự động kết thúc nếu đang mở hộp thoại mua đất hoặc thẻ vận mệnh
  const isModalOpen = (elPropertyModal && elPropertyModal.style.display === 'flex') ||
                      (elCardModal && elCardModal.style.display === 'flex');
  if (isModalOpen) return;

  if (turnStatusText) {
    turnStatusText.textContent = `✅ ${reason} — Tự động chuyển lượt sau ${(delayMs / 1000).toFixed(1)}s...`;
  }
  if (btnEndTurn) {
    btnEndTurn.innerHTML = `<span>⏳</span><span>TỰ ĐỘNG KẾT THÚC (${(delayMs / 1000).toFixed(1)}s)</span>`;
    btnEndTurn.style.display = 'inline-flex';
  }

  autoEndTurnTimer = setTimeout(() => {
    autoEndTurnTimer = null;
    const currentSnap = latestGameStateSnapshot;
    const isModalStillOpen = (elPropertyModal && elPropertyModal.style.display === 'flex') ||
                            (elCardModal && elCardModal.style.display === 'flex');
    const isMoving = boardScene?.tokenManager?.isAnyTokenMoving();

    if (
      currentSnap &&
      !currentSnap.isGameOver &&
      !isModalStillOpen &&
      !isMoving &&
      currentSnap.turnState?.currentUserId === socketClient.socket.id &&
      currentSnap.turnState?.phase === 'END_TURN'
    ) {
      if (btnEndTurn) btnEndTurn.style.display = 'none';
      socketClient.emit('game:end_turn');
    }
  }, delayMs);
}

function checkMyTurn(snapshot?: any) {
  if (snapshot) {
    latestGameStateSnapshot = snapshot;
  }
  const snap = snapshot || latestGameStateSnapshot;
  if (!snap || !snap.turnState) return;

  latestTurnSnapshot = snap.turnState;
  const curUserId = snap.turnState.currentUserId;
  const isMyTurn = curUserId === socketClient.socket.id;
  const phase = snap.turnState.phase;
  const activePlayer = snap.players?.find((p: any) => p.id === curUserId);

  // Cập nhật mũi tên 3D trỏ vào nhân vật của lượt hiện tại
  if (boardScene?.tokenManager && curUserId) {
    boardScene.tokenManager.setActiveTurnPlayer(curUserId, activePlayer?.username, activePlayer?.color);
  }

  // Kiểm tra xem có bất kỳ quân cờ 3D nào đang bước nhảy hay không
  const isMoving = boardScene?.tokenManager?.isAnyTokenMoving();

  if (turnStatusDot && turnStatusText && activePlayer) {
    turnStatusDot.style.background = activePlayer.color || '#00B894';
    turnStatusDot.style.boxShadow = `0 0 8px ${activePlayer.color || '#00B894'}`;
    if (isMoving) {
      turnStatusText.textContent = `⏳ Đang di chuyển quân cờ của ${activePlayer.username}...`;
    } else if (isMyTurn) {
      if (phase === 'ROLL_DICE') {
        const isDoubleExtra = snap.turnState.isDouble || (snap.turnState.consecutiveDoubles > 0);
        turnStatusText.textContent = isDoubleExtra
          ? '🎉 Đổ trúng đôi! Hãy lắc thêm lượt!'
          : '🎲 Đang tới lượt bạn — Hãy đổ xúc xắc!';
      } else if (phase === 'BUY_PROPERTY') {
        turnStatusText.textContent = '🏠 Đang cân nhắc mua bất động sản...';
      } else {
        turnStatusText.textContent = autoEndTurnTimer
          ? '✅ Giao dịch hoàn tất — Đang tự động kết thúc lượt...'
          : '✅ Lượt của bạn — Hoàn tất giao dịch & Kết thúc lượt';
      }
    } else {
      turnStatusText.textContent = phase === 'ROLL_DICE'
        ? `🎲 Đang chờ ${activePlayer.username} đổ xúc xắc...`
        : phase === 'BUY_PROPERTY'
        ? `🏠 Đang chờ ${activePlayer.username} quyết định mua đất...`
        : `⏳ Đang chờ ${activePlayer.username} hoàn tất lượt...`;
    }
  }

  // Đảm bảo tuyệt đối KHÔNG hiển thị nút xúc xắc hoặc kết thúc lượt khi quân cờ đang di chuyển
  if (isMoving) {
    btnRollDice.style.display = 'none';
    btnEndTurn.style.display = 'none';
    return;
  }

  if (isMyTurn && !snap.isGameOver) {
    if (phase === 'ROLL_DICE') {
      const isDoubleExtra = snap.turnState.isDouble || (snap.turnState.consecutiveDoubles > 0);
      if (isDoubleExtra) {
        showToast('🎉 Đổ đôi thành công! Bạn được lắc thêm lượt!');
      } else {
        showToast('Lượt của bạn! 🎲');
      }
      sounds.playTurnNotification();
      btnRollDice.style.display = 'inline-flex';
      btnEndTurn.style.display = 'none';
    } else if (phase === 'END_TURN') {
      btnRollDice.style.display = 'none';
      btnEndTurn.style.display = 'inline-flex';
      btnEndTurn.innerHTML = autoEndTurnTimer
        ? `<span>⏳</span><span>TỰ ĐỘNG CHUYỂN...</span>`
        : `<span>⏩</span><span>KẾT THÚC LƯỢT</span>`;

      // Nếu không có modal nào đang mở và chưa lên lịch tự động kết thúc lượt, lên lịch ngay
      const isModalOpen = (elPropertyModal && elPropertyModal.style.display === 'flex') ||
                          (elCardModal && elCardModal.style.display === 'flex');
      if (!isModalOpen && !autoEndTurnTimer) {
        scheduleAutoEndTurn(1200, 'Giao dịch hoàn tất');
      }
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
    sounds.playCashTransaction();
    boardScene.vfxManager.spawnFloatingDollar(`${action.amount}M`, pos, false);
    showToast(`${player.username} đã trả ${action.amount}M tiền thuê cho ${action.ownerName}!`);
  } else if (action.type === 'TAX') {
    sounds.playCashTransaction();
    boardScene.vfxManager.spawnFloatingDollar(`${action.amount}M (Thuế)`, pos, false);
  } else if (action.type === 'CARD') {
    sounds.playCardChime();
    boardScene.vfxManager.spawnStarBurst(pos, 24);
    cardBadge.textContent = action.cardType === 'CHANCE' ? 'THẺ CƠ HỘI' : 'THẺ KHÍ VẬN';
    cardIcon.textContent = action.cardType === 'CHANCE' ? '⚡' : '🎁';
    cardTitle.textContent = action.card.title;
    cardDesc.textContent = `${action.card.description}\n(${action.result})`;
    elCardModal.style.display = 'flex';
  } else if (action.type === 'AIRPORT') {
    sounds.playCardChime();
    sounds.playCashTransaction();
    boardScene.vfxManager.spawnStarBurst(pos, 24);
    boardScene.vfxManager.spawnFloatingDollar(`+${action.reward || 200}M ✈️`, pos, true);
    showToast(`✈️ ${player.username} đáp Sân Bay Quốc Tế, bay thẳng về Khởi Hành (GO) nhận +${action.reward || 200}M!`);
  } else if (action.type === 'GO_TO_JAIL') {
    sounds.playJailSlam();
    boardScene.vfxManager.triggerCameraShake(0.4);
    boardScene.vfxManager.spawnFloatingText('VÀO TÙ 🔒', pos, false);
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
  const winnerFrame = winner ? (winner.frame || 'frame_default') : 'frame_default';
  const winnerTierClass = getFrameTierClass(winnerFrame);
  const winnerBadge = getFrameBadgeTag(winnerFrame);

  if (winner) {
    victoryWinnerName.innerHTML = `
      <span class="nameplate-frame ${winnerTierClass}" style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 14px; border-radius: 9999px; margin-top: 4px;">
        <span>👑 ${winner.username}</span>
        ${winnerBadge}
      </span>
    `;
  } else {
    victoryWinnerName.textContent = 'Người Thắng';
  }

  const sorted = [...data.snapshot.players].sort((a: any, b: any) => b.netWorth - a.netWorth);
  victoryRankings.innerHTML = sorted.map((p: any, idx: number) => {
    const frameId = p.frame || 'frame_default';
    const frameClass = getFrameTierClass(frameId);
    const frameBadge = getFrameBadgeTag(frameId);
    const isWinner = idx === 0;

    return `
      <div class="nameplate-frame ${frameClass} ${isWinner ? 'podium-winner' : ''}" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 12px; margin-bottom: 6px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-weight: 900; font-size: 1.1rem; color: ${idx === 0 ? '#FDCB6E' : idx === 1 ? '#00D2D3' : idx === 2 ? '#E17055' : '#636E72'};">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
          <img src="${p.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`}" style="width: 32px; height: 32px; border-radius: 50%; background: #EBF2FA; border: 2px solid ${p.color || '#CBD5E1'};" />
          <span style="font-weight: 800; color: #2D3436;">${p.username}</span>
          ${frameBadge}
        </div>
        <span style="font-weight: 900; color: #00B894; font-size: 1.05rem;">💰 ${p.netWorth}M</span>
      </div>
    `;
  }).join('');

  elVictoryModal.style.display = 'flex';

  confetti({
    particleCount: 140,
    spread: 85,
    origin: { y: 0.6 }
  });
}

window.addEventListener('DOMContentLoaded', init);
