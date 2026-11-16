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
  equippedToken?: string;
  equippedDice?: string;
  equippedTrail?: string;
  equippedTitle?: string;
  bio?: string;
  unlockedItems?: string[];
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
const tabBtnProfileCustom = document.getElementById('tab-btn-profile-custom');
const paneProfileAchievements = document.getElementById('pane-profile-achievements');
const paneProfileFrames = document.getElementById('pane-profile-frames');
const paneProfileCustom = document.getElementById('pane-profile-custom');
const profileAchievementsSummary = document.getElementById('profile-achievements-summary');
const profileAchievementsList = document.getElementById('profile-achievements-list')!;
const profileFramesGrid = document.getElementById('profile-frames-grid');
const profileCustomSections = document.getElementById('profile-custom-sections');
const profileEquippedTitle = document.getElementById('profile-equipped-title');
const profileBioText = document.getElementById('profile-bio-text');
const inputProfileBio = document.getElementById('input-profile-bio') as HTMLInputElement | null;
const btnSaveBio = document.getElementById('btn-save-bio');
const profileAvatarPicker = document.getElementById('profile-avatar-picker');
const profileAchCount = document.getElementById('profile-ach-count');
const profileFramesCount = document.getElementById('profile-frames-count');

const TOKEN_ICONS: Record<string, string> = {
  car: '🚗',
  hat: '🎩',
  dog: '🐕',
  rocket: '🚀',
  cyclo: '🚲',
  lotus: '🪷',
  dragon: '🐉',
  yacht: '🛥️',
  robot: '🤖',
  crown: '👑'
};

const TOKEN_NAMES: Record<string, string> = {
  car: 'Siêu Xe',
  hat: 'Mũ Ảo Thuật',
  dog: 'Cún Cưng',
  rocket: 'Tên Lửa',
  cyclo: 'Xích Lô',
  lotus: 'Hoa Sen',
  dragon: 'Rồng Thần',
  yacht: 'Du Thuyền',
  robot: 'Người Máy',
  crown: 'Vương Miện'
};

const AVAILABLE_TOKENS = ['car', 'hat', 'dog', 'rocket', 'cyclo', 'lotus', 'dragon', 'yacht', 'robot', 'crown'];

const STARTER_TOKENS = new Set(['car', 'hat', 'dog', 'rocket']);

const TOKEN_COSTS: Record<string, number> = {
  car: 0,
  hat: 0,
  dog: 0,
  rocket: 0,
  cyclo: 500,
  lotus: 800,
  yacht: 1200,
  dragon: 1500,
  robot: 1600,
  crown: 2000
};

let cachedCustomizationsData: any = null;

function isTokenUnlocked(tokenKey: string): boolean {
  if (STARTER_TOKENS.has(tokenKey)) return true;
  if (!currentUser) return false;
  if (Array.isArray(currentUser.unlockedItems) && currentUser.unlockedItems.includes(tokenKey)) return true;
  if (cachedCustomizationsData && Array.isArray(cachedCustomizationsData.unlockedItems) && cachedCustomizationsData.unlockedItems.includes(tokenKey)) return true;
  return false;
}

const TITLE_LABELS: Record<string, string> = {
  title_rookie: 'Tân Thủ Khởi Nghiệp',
  title_tycoon: 'Chiến Thần BĐS',
  title_shark: 'Cá Mập Đầu Tư',
  title_traveler: 'Lữ Khách Xuyên Việt',
  title_emperor: 'Đế Chế Tỷ Phú'
};

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
const elLeaveMatchModal = document.getElementById('leave-match-modal')!;
const btnLeaveMatch = document.getElementById('btn-leave-match');
const btnCancelLeave = document.getElementById('btn-cancel-leave');
const btnConfirmLeave = document.getElementById('btn-confirm-leave');

// Match Timer, Auction & P2P Trade UI
const elMatchTimerPill = document.getElementById('match-timer-pill');
const elMatchTimerText = document.getElementById('match-timer-text');
const btnOpenTrade = document.getElementById('btn-open-trade') as HTMLButtonElement | null;

const elAuctionModal = document.getElementById('auction-modal')!;
const elAuctionTimerBadge = document.getElementById('auction-timer-badge')!;
const elAuctionTileColor = document.getElementById('auction-tile-color')!;
const elAuctionTileName = document.getElementById('auction-tile-name')!;
const elAuctionTileMeta = document.getElementById('auction-tile-meta')!;
const elAuctionCurrentBid = document.getElementById('auction-current-bid')!;
const elAuctionHighestBidder = document.getElementById('auction-highest-bidder')!;
const elAuctionStatusNote = document.getElementById('auction-status-note')!;
const btnAuctionBidMin = document.getElementById('btn-auction-bid-min') as HTMLButtonElement;
const btnAuctionBid50 = document.getElementById('btn-auction-bid-50') as HTMLButtonElement;
const btnAuctionBid100 = document.getElementById('btn-auction-bid-100') as HTMLButtonElement;
const btnAuctionPass = document.getElementById('btn-auction-pass') as HTMLButtonElement;

const elTradeProposeModal = document.getElementById('trade-propose-modal')!;
const btnCloseTradePropose = document.getElementById('btn-close-trade-propose')!;
const btnCancelTradePropose = document.getElementById('btn-cancel-trade-propose')!;
const tradePartnerSelect = document.getElementById('trade-partner-select') as HTMLSelectElement;
const tradeOfferedCashInput = document.getElementById('trade-offered-cash') as HTMLInputElement;
const tradeRequestedCashInput = document.getElementById('trade-requested-cash') as HTMLInputElement;
const tradeOfferedCardsEl = document.getElementById('trade-offered-cards')!;
const tradeRequestedCardsEl = document.getElementById('trade-requested-cards')!;
const tradeOfferedPropsEl = document.getElementById('trade-offered-props')!;
const tradeRequestedPropsEl = document.getElementById('trade-requested-props')!;
const tradeProposeErrorEl = document.getElementById('trade-propose-error')!;
const btnSubmitTrade = document.getElementById('btn-submit-trade') as HTMLButtonElement;

const elTradeOfferModal = document.getElementById('trade-offer-modal')!;
const tradeOfferSubtitleEl = document.getElementById('trade-offer-subtitle')!;
const tradeOfferReceiveEl = document.getElementById('trade-offer-receive')!;
const tradeOfferGiveEl = document.getElementById('trade-offer-give')!;
const btnAcceptTrade = document.getElementById('btn-accept-trade') as HTMLButtonElement;
const btnRejectTrade = document.getElementById('btn-reject-trade') as HTMLButtonElement;

let matchTimeRemainingLocal: number | null = null;
let matchTimerInterval: number | null = null;
let auctionCountdownInterval: number | null = null;
let activeIncomingTradeId: string | null = null;
const elLogDrawer = document.getElementById('log-drawer')!;

// Settings & Personal Dice View State (Zero-Network Turn Switch + Personal View)
const SETTING_PERSONAL_DICE_KEY = 'business_chess_personal_dice_view';
let isPersonalDiceView: boolean = localStorage.getItem(SETTING_PERSONAL_DICE_KEY) === 'true';
const playerDiceSkinCache = new Map<string, string>();

const elSettingsModal = document.getElementById('settings-modal')!;
const btnOpenSettings = document.getElementById('btn-open-settings');
const btnOpenSettingsUser = document.getElementById('btn-open-settings-user');
const btnOpenSettingsHud = document.getElementById('btn-open-settings-hud');
const btnCloseSettings = document.getElementById('btn-close-settings');
const btnSaveSettings = document.getElementById('btn-save-settings');
const settingPersonalDiceToggle = document.getElementById('setting-personal-dice-toggle') as HTMLInputElement | null;
const settingFocusModeToggle = document.getElementById('setting-focus-mode-toggle') as HTMLInputElement | null;

function openSettingsModal() {
  if (settingPersonalDiceToggle) {
    settingPersonalDiceToggle.checked = isPersonalDiceView;
  }
  if (settingFocusModeToggle) {
    settingFocusModeToggle.checked = isCleanFocusMode;
  }
  elSettingsModal.style.display = 'flex';
}

function closeSettingsModal() {
  elSettingsModal.style.display = 'none';
}

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

  if (settingFocusModeToggle) {
    settingFocusModeToggle.checked = clean;
  }

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
const inspectorUpgradeRentDiff = document.getElementById('inspector-upgrade-rent-diff');
const inspectorUpgradeHint = document.getElementById('inspector-upgrade-hint');

// Property Deed Multi-Tier Build Selector (Business Tour)
const propBuildOptionsContainer = document.getElementById('prop-build-options-container');
const propBuildCashHint = document.getElementById('prop-build-cash-hint');
const propBuildTierGrid = document.getElementById('prop-build-tier-grid');
let selectedDeedTargetLevel: number = 0;

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

// Airport Flight Modal Elements
const elAirportModal = document.getElementById('airport-flight-modal')!;
const btnCloseAirportModal = document.getElementById('btn-close-airport-modal')!;
const btnAirportQuickGo = document.getElementById('btn-airport-quick-go')!;
const airportTilesList = document.getElementById('airport-tiles-list')!;
const airportFilterTabs = document.getElementById('airport-filter-tabs')!;
const airportFloatingBar = document.getElementById('airport-floating-bar')!;
const btnAirportReopen = document.getElementById('btn-airport-reopen-list')!;
const airportConfirmModal = document.getElementById('airport-confirm-modal')!;
const airportConfirmTitle = document.getElementById('airport-confirm-title')!;
const airportConfirmDesc = document.getElementById('airport-confirm-desc')!;
const btnAirportConfirmCancel = document.getElementById('btn-airport-confirm-cancel')!;
const btnAirportConfirmFly = document.getElementById('btn-airport-confirm-fly')!;
const btnAirportFloatingGo = document.getElementById('btn-airport-floating-go');
let currentAirportFilter = 'ALL';
let selectedAirportTargetId: number | null = null;

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
const btnStartGame = document.getElementById('btn-start-game') as HTMLButtonElement;
const btnToggleReady = document.getElementById('btn-toggle-ready') as HTMLButtonElement | null;
const btnToggleReadyText = document.getElementById('btn-toggle-ready-text');
const waitingStartHint = document.getElementById('waiting-start-hint');
const waitingTokenBox = document.getElementById('waiting-token-box');
const waitingTokenGrid = document.getElementById('waiting-token-grid');
const waitingSelectedTokenName = document.getElementById('waiting-selected-token-name');

const createRoomFriendsBox = document.getElementById('create-room-friends-box');
const createRoomOnlineCount = document.getElementById('create-room-online-count');
const createRoomFriendsList = document.getElementById('create-room-friends-list');

const waitingInviteBox = document.getElementById('waiting-invite-box');
const waitingOnlineFriendsList = document.getElementById('waiting-online-friends-list');
const btnRefreshOnlineFriends = document.getElementById('btn-refresh-online-friends');
const invitedFriendIdsInRoom = new Set<string>();

const elRoomInviteModal = document.getElementById('room-invite-modal')!;
const roomInviteSender = document.getElementById('room-invite-sender')!;
const roomInviteRoomName = document.getElementById('room-invite-room-name')!;
const roomInviteCode = document.getElementById('room-invite-code')!;
const btnAcceptRoomInvite = document.getElementById('btn-accept-room-invite')!;
const btnDeclineRoomInvite = document.getElementById('btn-decline-room-invite')!;
let pendingInvitePayload: any = null;

let latestWaitingPlayers: any[] = [];
let latestWaitingMaxPlayers: number = 4;

const hudPlayers = document.getElementById('hud-players')!;
const timerFill = document.getElementById('timer-fill')!;
const hudToast = document.getElementById('hud-toast')!;
const turnStatusDot = document.getElementById('turn-status-dot');
const turnStatusText = document.getElementById('turn-status-text');
const btnRollDice = document.getElementById('btn-roll-dice')!;
const btnEndTurn = document.getElementById('btn-end-turn')!;

// Dynamic Jail Action Buttons (created in TS to avoid modifying index.html)
const turnActionButtonsContainer = document.querySelector('.turn-action-buttons');
const btnPayJailFine = document.createElement('button');
btnPayJailFine.id = 'btn-pay-jail-fine';
btnPayJailFine.className = 'btn-chunky btn-blue action-pill';
btnPayJailFine.style.display = 'none';
btnPayJailFine.innerHTML = '<span>💰</span><span>NỘP PHẠT RA TÙ (50M)</span>';

const btnUseJailCard = document.createElement('button');
btnUseJailCard.id = 'btn-use-jail-card';
btnUseJailCard.className = 'btn-chunky btn-primary action-pill';
btnUseJailCard.style.display = 'none';
btnUseJailCard.innerHTML = '<span>🎫</span><span>DÙNG THẺ ĐẶC XÁ</span>';

if (turnActionButtonsContainer) {
  turnActionButtonsContainer.appendChild(btnPayJailFine);
  turnActionButtonsContainer.appendChild(btnUseJailCard);
}

let currentPendingActionMode: 'BUY' | 'BUYOUT' | null = null;

// Dynamic Festival Selection Modal (created in TS to avoid modifying index.html)
const elFestivalModal = document.createElement('div');
elFestivalModal.id = 'festival-select-modal';
elFestivalModal.className = 'interactive modal-overlay';
elFestivalModal.style.display = 'none';
elFestivalModal.innerHTML = `
  <div class="glass-panel modal-content festival-modal-box">
    <div class="festival-modal-header">
      <div style="font-size: 2.2rem;">🎪</div>
      <div>
        <h2 style="margin: 0; font-size: 1.25rem; color: #2D3436;">CHỌN Ô TỔ CHỨC LỄ HỘI (x2 THUÊ)</h2>
        <p style="margin: 4px 0 0; font-size: 0.82rem; color: #636E72;">Chọn 1 bất động sản bạn đang sở hữu để nhân đôi tiền thuê!</p>
      </div>
    </div>
    <div id="festival-tile-list" class="festival-tile-list"></div>
  </div>
`;
const uiRootEl = document.getElementById('ui-root');
if (uiRootEl) {
  uiRootEl.appendChild(elFestivalModal);
}

function showFestivalModal() {
  const listEl = document.getElementById('festival-tile-list');
  if (!listEl) return;

  const myId = socketClient.socket.id;
  const ownedProps = latestPropertiesSnapshot.filter(pr => {
    if (pr.ownerId !== myId || pr.isMortgaged) return false;
    const tile = boardTilesData[pr.tileId];
    return tile && tile.type === 'PROPERTY';
  });

  if (ownedProps.length === 0) {
    elFestivalModal.style.display = 'none';
    return;
  }

  listEl.innerHTML = ownedProps.map(pr => {
    const tile = boardTilesData[pr.tileId];
    const currentRent = pr.level === 0 ? (tile.baseRent || 0)
      : pr.level === 1 ? (tile.rentHouse1 || 0)
      : pr.level === 2 ? (tile.rentHouse2 || 0)
      : pr.level === 3 ? (tile.rentHouse3 || 0)
      : (tile.rentHotel || 0);
    const levelLabel = pr.level === 0 ? 'Đất trống' : pr.level === 4 ? '🏨 Khách sạn' : `🏠 ${pr.level} Nhà`;
    const isAlreadyFestival = latestGameStateSnapshot?.festivalTileId === pr.tileId;

    return `
      <button class="festival-tile-item ${isAlreadyFestival ? 'is-current' : ''}" data-tile-id="${pr.tileId}">
        <div style="display:flex;align-items:center;gap:10px;text-align:left;">
          <span class="festival-color-dot" style="background:${tile.districtColor || '#00B894'};"></span>
          <div>
            <div style="font-weight:800;color:#2D3436;font-size:0.95rem;">
              ${tile.name} ${isAlreadyFestival ? '🎪 (Đang Lễ Hội)' : ''}
            </div>
            <div style="font-size:0.75rem;color:#636E72;">${levelLabel} • Thuê: ${currentRent}M ➔ <b style="color:#E17055;">${currentRent * 2}M</b></div>
          </div>
        </div>
        <span style="font-weight:800;color:#00B894;font-size:0.82rem;">Chọn ➔</span>
      </button>
    `;
  }).join('');

  listEl.querySelectorAll('.festival-tile-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tileId = Number((btn as HTMLElement).dataset.tileId);
      elFestivalModal.style.display = 'none';
      socketClient.emit('game:select_festival', { tileId });
    });
  });

  elFestivalModal.style.display = 'flex';
}

const propColorBar = document.getElementById('prop-color-bar')!;
const propIcon = document.getElementById('prop-icon');
const propBadge = document.getElementById('prop-badge');
const propTitle = document.getElementById('prop-title')!;
const propPrice = document.getElementById('prop-price')!;
const propDesc = document.getElementById('prop-desc')!;
const propRentPreview = document.getElementById('prop-rent-preview');
const btnSkipBuy = document.getElementById('btn-skip-buy') as HTMLButtonElement;
const btnConfirmBuy = document.getElementById('btn-confirm-buy') as HTMLButtonElement;

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

function getRentForTileAtLevel(tile: any, level: number, ownsMonopoly: boolean = false, isFestival: boolean = false): number {
  if (!tile) return 0;
  const base = tile.baseRent || 0;
  let rent = base;
  switch (level) {
    case 0:
      rent = ownsMonopoly ? base * 2 : base;
      break;
    case 1:
      rent = tile.rentHouse1 ?? (base * 5 || 20);
      break;
    case 2:
      rent = tile.rentHouse2 ?? (base * 15 || 60);
      break;
    case 3:
      rent = tile.rentHouse3 ?? (base * 40 || 180);
      break;
    case 4:
      rent = tile.rentHotel ?? (base * 80 || 450);
      break;
    default:
      rent = base;
  }
  if (isFestival) rent *= 2;
  return rent;
}

interface PropertyUpgradeDetails {
  tileId: number;
  tile: any;
  prop: any;
  owner: any;
  isMyProp: boolean;
  level: number;
  levelName: string;
  nextLevelName: string;
  cost: number;
  currentRent: number;
  nextRent: number;
  rentDiff: number;
  ownsMonopoly: boolean;
  ownedCount: number;
  totalInDistrict: number;
  isMortgaged: boolean;
  anyDistrictMortgaged: boolean;
  evenBuildViolation: boolean;
  minDistrictLevel: number;
  maxDistrictLevel: number;
  canUpgrade: boolean;
  reason: string;
}

function getPropertyUpgradeDetails(tileId: number, myUserId?: string): PropertyUpgradeDetails {
  const targetId = myUserId || socketClient.socket?.id || '';
  const tile = boardTilesData && boardTilesData[tileId];
  const prop = latestPropertiesSnapshot.find(p => p.tileId === tileId);
  const owner = prop ? latestPlayersSnapshot.find(p => p.id === prop.ownerId) : null;
  const isMyProp = !!(prop && prop.ownerId === targetId);
  const cost = tile?.houseCost || 100;
  const level = prop?.level ?? 0;
  const isMortgaged = !!(prop && prop.isMortgaged);

  const levelNames = ['Đất trống', '1 Nhà', '2 Nhà', '🏢 Căn Hộ', '🏨 Khách Sạn'];
  const levelName = levelNames[level] || 'Đất trống';
  const nextLevelName = level < 4 ? levelNames[level + 1] : 'Tối đa';

  const districtTiles = (tile && tile.district && boardTilesData)
    ? boardTilesData.filter(t => t.district === tile.district && t.type === 'PROPERTY')
    : [];
  const totalInDistrict = districtTiles.length;
  const ownedCount = districtTiles.filter(t => {
    const p = latestPropertiesSnapshot.find(pr => pr.tileId === t.id);
    return p && p.ownerId === targetId;
  }).length;
  const ownsMonopoly = totalInDistrict > 0 && ownedCount === totalInDistrict;

  const isFestival = latestGameStateSnapshot?.festivalTileId === tileId;
  const currentRent = getRentForTileAtLevel(tile, level, ownsMonopoly, isFestival);
  const nextRent = level < 4 ? getRentForTileAtLevel(tile, level + 1, ownsMonopoly, isFestival) : currentRent;
  const rentDiff = Math.max(0, nextRent - currentRent);

  const myPlayer = latestPlayersSnapshot.find(p => p.id === targetId);
  const myCash = myPlayer?.balance ?? 0;
  const toursCompleted = myPlayer?.toursCompleted || 0;
  const isMyTurn = latestTurnSnapshot && latestTurnSnapshot.currentUserId === targetId;
  const currentPhase = latestTurnSnapshot?.phase;
  const isLanding = isMyTurn && currentPhase === 'BUY_PROPERTY' && myPlayer?.position === tileId;
  const isEndTurn = isMyTurn && currentPhase === 'END_TURN';

  let canUpgrade = true;
  let reason = 'Đủ điều kiện nâng cấp ngay!';

  if (!tile || tile.type !== 'PROPERTY' || !tile.district) {
    canUpgrade = false;
    reason = 'Ô cờ này không phải là ô đất xây dựng.';
  } else if (!isMyProp) {
    canUpgrade = false;
    reason = 'Bạn chưa sở hữu bất động sản này.';
  } else if (isMortgaged) {
    canUpgrade = false;
    reason = 'Bất động sản đang bị thế chấp (cần chuộc lại trước).';
  } else if (level >= 4) {
    canUpgrade = false;
    reason = 'Đã đạt cấp tối đa (Khách Sạn).';
  } else if (!isMyTurn) {
    canUpgrade = false;
    reason = 'Chỉ có thể nâng cấp khi đến lượt của bạn.';
  } else if (!isLanding && !isEndTurn) {
    canUpgrade = false;
    reason = 'Chỉ có thể nâng cấp trong lượt (pha Kết Thúc Lượt hoặc khi dừng chân tại ô này).';
  } else if (isEndTurn && !isLanding && level >= 2) {
    canUpgrade = false;
    if (level === 2) {
      reason = 'Cần đi hết ít nhất 1 vòng & dừng chân lại đúng ô đất này để nâng lên Căn Hộ (Cấp 3).';
    } else {
      reason = 'Cần dừng chân lại đúng ô đất này ở lượt tiếp theo để nâng lên Khách Sạn (Cấp 4).';
    }
  } else if (isLanding && level === 2 && toursCompleted === 0) {
    canUpgrade = false;
    reason = 'Cần hoàn thành ít nhất 1 vòng (đi qua ô GO) để mở khóa Căn Hộ (Cấp 3).';
  } else if (isLanding && level < 3 && nextLevelName.includes('Khách Sạn')) {
    canUpgrade = false;
    reason = 'Cần có Căn Hộ (Cấp 3) và dừng chân lại ở lượt sau để nâng lên Khách Sạn.';
  } else if (myCash < cost) {
    canUpgrade = false;
    reason = `Thiếu tiền mặt (Cần ${cost}M, bạn đang có ${myCash}M).`;
  }

  return {
    tileId,
    tile,
    prop,
    owner,
    isMyProp,
    level,
    levelName,
    nextLevelName,
    cost,
    currentRent,
    nextRent,
    rentDiff,
    ownsMonopoly,
    ownedCount,
    totalInDistrict,
    isMortgaged,
    anyDistrictMortgaged: false,
    evenBuildViolation: false,
    minDistrictLevel: level,
    maxDistrictLevel: level,
    canUpgrade,
    reason
  };
}

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
    tile.type === 'JAIL' ? 'NHÀ TÙ' :
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

      const isFestivalTile = latestGameStateSnapshot?.festivalTileId === tileId;
      const festivalSuffix = isFestivalTile ? ' • 🎪 LỄ HỘI x2' : '';

      if (prop.isMortgaged) {
        inspectorBuildingLevel.textContent = '🔒 Đang thế chấp (Không thu tiền thuê)';
        inspectorBuildingLevel.style.color = '#D63031';
      } else {
        const levelNamesMap = ['Đất trống', '🏠 1 Nhà', '🏠🏠 2 Nhà', '🏢 Căn Hộ', '🏨 Khách Sạn'];
        const levelStr = levelNamesMap[prop.level] || 'Đất trống';
        inspectorBuildingLevel.textContent = `Cấp độ: ${levelStr}${festivalSuffix}`;
        inspectorBuildingLevel.style.color = isFestivalTile ? '#D63031' : '#E17055';
      }
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

    // Monopoly x2 badge on base rent in inspector
    const rentRow0 = document.getElementById('rent-row-0');
    if (rentRow0) {
      const existingBadge = rentRow0.querySelector('.inspector-monopoly-badge');
      if (existingBadge) existingBadge.remove();
      const detailsCheck = getPropertyUpgradeDetails(tileId, socketClient.socket?.id);
      if (detailsCheck.ownsMonopoly) {
        const badge = document.createElement('span');
        badge.className = 'inspector-monopoly-badge';
        badge.textContent = '⭐ x2 Độc Quyền';
        badge.style.marginLeft = '6px';
        badge.style.fontSize = '0.68rem';
        badge.style.fontWeight = '800';
        badge.style.color = '#E17055';
        badge.style.background = 'rgba(225, 112, 85, 0.12)';
        badge.style.padding = '1px 6px';
        badge.style.borderRadius = '4px';
        rentRow0.querySelector('span')?.appendChild(badge);
      }
    }

    // Interactive Upgrade & Property Management Buttons in Inspector
    const isMyTurn = latestTurnSnapshot && latestTurnSnapshot.currentUserId === socketClient.socket.id;
    const currentPhase = latestTurnSnapshot?.phase;
    const canManageInPhase = isMyTurn && (currentPhase === 'END_TURN' || currentPhase === 'ROLL_DICE');
    const isMyProp = owner && owner.id === socketClient.socket.id;
    const houseCost = tile.houseCost || 100;

    const details = getPropertyUpgradeDetails(tileId, socketClient.socket.id);

    if (elInspectorUpgradeContainer) {
      if (tile.type === 'PROPERTY' && isMyProp && prop) {
        elInspectorUpgradeContainer.style.display = 'block';
        if (details.canUpgrade) {
          if (btnInspectorUpgrade) {
            btnInspectorUpgrade.style.display = 'flex';
            if (inspectorUpgradeLabel) {
              inspectorUpgradeLabel.textContent = `🏗️ Nâng Cấp ${details.nextLevelName} (-${details.cost}M)`;
            }
            btnInspectorUpgrade.onclick = () => {
              socketClient.emit('game:buy_property', { tileId, targetLevel: prop.level + 1 });
              sounds.playBuild();
              btnInspectorUpgrade.onclick = null;
            };
          }
          if (inspectorUpgradeRentDiff) {
            inspectorUpgradeRentDiff.style.display = 'block';
            inspectorUpgradeRentDiff.innerHTML = `📈 Tiền thuê: <strong>${details.currentRent}M</strong> ➔ <strong>${details.nextRent}M</strong> <span style="color:#00B894;font-weight:700;">(+${details.rentDiff}M)</span>`;
          }
          if (inspectorUpgradeHint) {
            inspectorUpgradeHint.style.display = 'none';
          }
        } else {
          if (btnInspectorUpgrade) {
            btnInspectorUpgrade.style.display = 'none';
            btnInspectorUpgrade.onclick = null;
          }
          if (inspectorUpgradeRentDiff) {
            inspectorUpgradeRentDiff.style.display = 'none';
          }
          if (inspectorUpgradeHint) {
            inspectorUpgradeHint.style.display = 'block';
            inspectorUpgradeHint.innerHTML = `⚠️ <strong>Chưa thể nâng:</strong> ${details.reason}`;
          }
        }
      } else {
        elInspectorUpgradeContainer.style.display = 'none';
      }
    }

    // Dynamic Sell Building / Mortgage / Unmortgage Actions
    let manageContainer = document.getElementById('inspector-manage-actions');
    if (!manageContainer && inspectorPropertyDetails) {
      manageContainer = document.createElement('div');
      manageContainer.id = 'inspector-manage-actions';
      manageContainer.className = 'inspector-manage-actions';
      inspectorPropertyDetails.appendChild(manageContainer);
    }

    if (manageContainer) {
      manageContainer.innerHTML = '';
      if (canManageInPhase && isMyProp && prop) {
        const actions: HTMLElement[] = [];

        // Bán 1 cấp nhà (Business Tour: tự do bán nhà khi cần tiền)
        if (tile.type === 'PROPERTY' && prop.level > 0 && !prop.isMortgaged) {
          const refund = Math.floor(houseCost * 0.5);
          const btnSell = document.createElement('button');
          btnSell.className = 'btn-chunky btn-white btn-sm inspector-manage-btn';
          btnSell.textContent = `🏚️ Bán 1 Nhà (+${refund}M)`;
          btnSell.onclick = () => {
            socketClient.emit('game:sell_building', { tileId });
          };
          actions.push(btnSell);
        }

        // Thế chấp đất trống (không có nhà trên đất)
        if (!prop.isMortgaged && prop.level === 0) {
          const mortgageVal = Math.floor((tile.price || 0) * 0.5);
          const btnMortgage = document.createElement('button');
          btnMortgage.className = 'btn-chunky btn-accent btn-sm inspector-manage-btn';
          btnMortgage.textContent = `🏦 Thế Chấp (+${mortgageVal}M)`;
          btnMortgage.onclick = () => {
            socketClient.emit('game:mortgage_property', { tileId });
          };
          actions.push(btnMortgage);
        }

        // Chuộc lại bất động sản đang thế chấp
        if (prop.isMortgaged) {
          const principal = Math.floor((tile.price || 0) * 0.5);
          const interest = Math.ceil(principal * 0.1);
          const unmortgageCost = principal + interest;
          const canAffordUnmortgage = (owner.balance ?? 0) >= unmortgageCost;

          const btnUnmortgage = document.createElement('button');
          btnUnmortgage.className = 'btn-chunky btn-blue btn-sm inspector-manage-btn';
          btnUnmortgage.disabled = !canAffordUnmortgage;
          btnUnmortgage.textContent = canAffordUnmortgage
            ? `💎 Chuộc Lại (-${unmortgageCost}M)`
            : `💎 Thiếu tiền chuộc (${unmortgageCost}M)`;
          btnUnmortgage.onclick = () => {
            if (canAffordUnmortgage) {
              socketClient.emit('game:unmortgage_property', { tileId });
            }
          };
          actions.push(btnUnmortgage);
        }

        if (actions.length > 0) {
          manageContainer.style.display = 'flex';
          actions.forEach(btn => manageContainer!.appendChild(btn));
        } else {
          manageContainer.style.display = 'none';
        }
      } else {
        manageContainer.style.display = 'none';
      }
    }
  } else {
    // Special tile
    if (elInspectorUpgradeContainer) {
      elInspectorUpgradeContainer.style.display = 'none';
    }
    const manageContainer = document.getElementById('inspector-manage-actions');
    if (manageContainer) {
      manageContainer.style.display = 'none';
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

  if (window.innerWidth <= 768) {
    elLogDrawer.style.display = 'none';
    btnToggleLog.classList.remove('is-active');
    if (elChatDrawer) elChatDrawer.style.display = 'none';
    btnToggleChat?.classList.remove('is-active');
  }

  elTileInspector.style.display = 'block';
}

function closeTileInspector() {
  elTileInspector.style.display = 'none';
  currentInspectedTileId = null;
  if (boardScene) {
    boardScene.clearTileHighlight();
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

function activateAirportBoardSelection() {
  closeTileInspector();
  if (elAirportModal) elAirportModal.style.display = 'none';
  if (airportConfirmModal) airportConfirmModal.style.display = 'none';
  if (airportFloatingBar) airportFloatingBar.style.display = 'flex';
}

function showAirportModal() {
  renderAirportDestinations('ALL');
  elAirportModal.style.display = 'flex';
  airportFloatingBar.style.display = 'none';
}

function renderAirportDestinations(filter: string = currentAirportFilter) {
  currentAirportFilter = filter;
  if (!boardTilesData || boardTilesData.length === 0) return;

  const filtered = boardTilesData.filter(t => {
    if (filter === 'ALL') return true;
    if (filter === 'PROPERTY') return t.type === 'PROPERTY';
    if (filter === 'RAILROAD') return t.type === 'RAILROAD' || t.type === 'UTILITY';
    if (filter === 'SPECIAL') return t.type !== 'PROPERTY' && t.type !== 'RAILROAD' && t.type !== 'UTILITY';
    return true;
  });

  airportTilesList.innerHTML = filtered.map(t => {
    const isAirport = t.id === 30;
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

    if (isAirport) {
      return `
        <div class="roster-tile-card" style="opacity: 0.55; cursor: not-allowed; background: #F8F9FA; border: 1px dashed #B2BEC3;">
          <div class="roster-tile-top">
            <div style="display:flex; align-items:center;">
              <div class="roster-tile-color-bar" style="background:${color};"></div>
              <span style="font-size:1.1rem; margin-right:6px;">✈️</span>
              <b style="font-size:0.88rem; color:#636E72;">${t.name} (Vị trí hiện tại)</b>
            </div>
            <span style="font-size:0.7rem; font-weight:800; color:#B2BEC3;">#30</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
            <span style="font-size:0.72rem; color:#E17055; font-weight:700;">🚫 Không thể bay lại ô Sân Bay</span>
          </div>
        </div>
      `;
    }

    const isPassGo = t.id < 30;
    const passGoBadge = isPassGo ? `<span style="color:#00B894; font-size:0.7rem; font-weight:800;">+200M Lương 🚩</span>` : '';

    return `
      <div class="roster-tile-card" onclick="window.selectTileForFlight(${t.id})">
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
          <div style="display:flex; align-items:center; gap:6px;">
            ${passGoBadge}
            <span style="font-size:0.72rem; color:#0984E3; font-weight:800;">Bay Đến ➔</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

(window as any).selectTileForFlight = (tileId: number) => {
  if (tileId === 30) {
    showToast('⚠️ Không thể chọn bay lại vào ô Sân Bay!');
    return;
  }
  executeAirportFlight(tileId);
};

function executeAirportFlight(tileId: number) {
  if (tileId === 30) {
    showToast('⚠️ Không thể chọn bay lại vào ô Sân Bay!');
    return;
  }
  socketClient.emit('game:choose_airport_destination', { tileId });
  elAirportModal.style.display = 'none';
  airportFloatingBar.style.display = 'none';
  airportConfirmModal.style.display = 'none';
}

function init() {
  const container = document.getElementById('canvas-container')!;
  boardScene = new BoardScene(container);

  // Lắng nghe tương tác chạm/click trực tiếp vào ô cờ 3D
  boardScene.onTileClick = (tileId: number, tile: any) => {
    const isAirportTurn = latestGameStateSnapshot?.turnState?.phase === 'AIRPORT_SELECT' &&
                          latestGameStateSnapshot?.turnState?.currentUserId === socketClient.socket.id;
    if (isAirportTurn) {
      if (tileId === 30) {
        showToast('⚠️ Bạn đang ở Sân Bay! Hãy nhấp chọn một điểm đến khác trên bàn cờ.');
        return;
      }
      boardScene.highlightTile(tileId);
      selectedAirportTargetId = tileId;
      airportConfirmTitle.textContent = `Bay Đến ${tile.name} (ô #${tileId})?`;

      // Render comprehensive details of destination tile
      const prop = latestPropertiesSnapshot.find(p => p.tileId === tileId);
      const owner = prop ? latestPlayersSnapshot.find(p => p.id === prop.ownerId) : null;
      const isMyProp = owner && owner.id === socketClient.socket.id;
      const isPassGo = tileId < 30;

      let ownerHtml = '';
      if (tile.type === 'PROPERTY' || tile.type === 'RAILROAD' || tile.type === 'UTILITY') {
        if (!owner) {
          ownerHtml = `<div>💰 <strong>Trạng thái:</strong> <span style="color:#00B894; font-weight:800;">Đang mở bán (${tile.price}M)</span> — Bạn có thể mua ngay khi hạ cánh!</div>`;
        } else if (isMyProp) {
          const levelName = prop.level === 4 ? '🏨 Khách Sạn 5 Sao' : prop.level === 0 ? 'Đất trống' : `🏠 ${prop.level} Nhà`;
          ownerHtml = `<div>👑 <strong>Trạng thái:</strong> <span style="color:#0984E3; font-weight:800;">Bất động sản của bạn</span> (${levelName})</div>`;
        } else {
          const isFestival = latestGameStateSnapshot?.festivalTileId === tileId;
          const rent = getRentForTileAtLevel(tile, prop.level, false, isFestival);
          if (prop.isMortgaged) {
            ownerHtml = `<div>⚠️ <strong>Chủ sở hữu:</strong> <span style="color:${owner.color || '#2D3436'}; font-weight:800;">${owner.username}</span> • <span style="color:#D63031; font-weight:700;">Đang thế chấp (Miễn trả tiền thuê)</span></div>`;
          } else {
            ownerHtml = `<div>⚠️ <strong>Chủ sở hữu:</strong> <span style="color:${owner.color || '#2D3436'}; font-weight:800;">${owner.username}</span> • Tiền thuê dự kiến: <strong style="color:#E17055;">${rent}M</strong></div>`;
          }
        }
      } else {
        ownerHtml = `<div>🎯 <strong>Loại ô:</strong> ${tile.description || 'Ô chức năng đặc biệt'}</div>`;
      }

      const passGoHtml = isPassGo
        ? `<div style="margin-top: 8px; padding: 6px 10px; background: rgba(0, 184, 148, 0.12); border-radius: 8px; color: #00B894; font-weight: 800; font-size: 0.8rem;">🚩 Chuyến bay qua Khởi Hành: Nhận ngay +200M tiền lương!</div>`
        : `<div style="margin-top: 8px; padding: 6px 10px; background: rgba(9, 132, 227, 0.08); border-radius: 8px; color: #0984E3; font-weight: 700; font-size: 0.8rem;">✈️ Chuyến bay cất cánh từ Sân Bay và hạ cánh thẳng xuống ${tile.name}.</div>`;

      airportConfirmDesc.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${ownerHtml}
          ${passGoHtml}
        </div>
      `;

      btnAirportConfirmFly.onclick = () => {
        executeAirportFlight(tileId);
      };
      airportConfirmModal.style.display = 'flex';
      return;
    }
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
    loadCreateRoomOnlineFriends();
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

  btnToggleReady?.addEventListener('click', () => {
    const me = latestWaitingPlayers.find((p: any) => p.id === socketClient.socket.id);
    const isReady = Boolean(me?.isReady);
    socketClient.emit('room:toggle_ready', { ready: !isReady });
  });

  btnStartGame.addEventListener('click', () => {
    if (btnStartGame.disabled) return;
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

  btnPayJailFine.addEventListener('click', () => {
    btnPayJailFine.style.display = 'none';
    btnUseJailCard.style.display = 'none';
    socketClient.emit('game:pay_jail_fine');
  });

  btnUseJailCard.addEventListener('click', () => {
    btnPayJailFine.style.display = 'none';
    btnUseJailCard.style.display = 'none';
    socketClient.emit('game:use_jail_card');
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

  // Airport Flight Modal Listeners
  if (btnCloseAirportModal) {
    btnCloseAirportModal.addEventListener('click', () => {
      elAirportModal.style.display = 'none';
      if (latestGameStateSnapshot?.turnState?.phase === 'AIRPORT_SELECT' &&
          latestGameStateSnapshot?.turnState?.currentUserId === socketClient.socket.id) {
        airportFloatingBar.style.display = 'flex';
      }
    });
  }

  if (btnAirportReopen) {
    btnAirportReopen.addEventListener('click', () => {
      showAirportModal();
    });
  }

  if (btnAirportQuickGo) {
    btnAirportQuickGo.addEventListener('click', () => {
      executeAirportFlight(0);
    });
  }

  btnAirportFloatingGo?.addEventListener('click', () => {
    executeAirportFlight(0);
  });

  if (btnAirportConfirmCancel) {
    btnAirportConfirmCancel.addEventListener('click', () => {
      airportConfirmModal.style.display = 'none';
      if (boardScene) {
        boardScene.clearTileHighlight();
      }
    });
  }

  if (airportFilterTabs) {
    airportFilterTabs.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.roster-tab') as HTMLElement;
      if (target && target.dataset.airportFilter) {
        airportFilterTabs.querySelectorAll('.roster-tab').forEach(b => b.classList.remove('active'));
        target.classList.add('active');
        renderAirportDestinations(target.dataset.airportFilter);
      }
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
    if (isOpening && window.innerWidth <= 768) {
      closeTileInspector();
    }
  });

  btnCloseLog.addEventListener('click', () => {
    elLogDrawer.style.display = 'none';
    btnToggleLog.classList.remove('is-active');
  });

  // Settings Modal Listeners
  btnOpenSettings?.addEventListener('click', openSettingsModal);
  btnOpenSettingsUser?.addEventListener('click', openSettingsModal);
  btnOpenSettingsHud?.addEventListener('click', openSettingsModal);
  btnCloseSettings?.addEventListener('click', closeSettingsModal);
  btnSaveSettings?.addEventListener('click', closeSettingsModal);

  settingPersonalDiceToggle?.addEventListener('change', () => {
    isPersonalDiceView = Boolean(settingPersonalDiceToggle?.checked);
    localStorage.setItem(SETTING_PERSONAL_DICE_KEY, isPersonalDiceView ? 'true' : 'false');
    sounds.playTap();
    showToast(isPersonalDiceView
      ? '🎲 Đã bật: Luôn hiển thị Skin xúc xắc 3D của bạn!'
      : '🎲 Đã tắt: Hiển thị Skin xúc xắc theo người chơi đang tung!');
  });

  settingFocusModeToggle?.addEventListener('change', () => {
    const checked = Boolean(settingFocusModeToggle?.checked);
    applyFocusMode(checked);
    sounds.playTap();
    showToast(checked
      ? '🎯 Đã bật Chế độ Tinh Gọn'
      : '🏛️ Đã chuyển về Sa Bàn Đầy Đủ');
  });

  // Room Invite Modal Listeners
  btnDeclineRoomInvite?.addEventListener('click', () => {
    if (elRoomInviteModal) elRoomInviteModal.style.display = 'none';
    pendingInvitePayload = null;
  });

  btnAcceptRoomInvite?.addEventListener('click', () => {
    if (!pendingInvitePayload) return;
    const { roomCode, roomPassword } = pendingInvitePayload;
    if (elRoomInviteModal) elRoomInviteModal.style.display = 'none';
    pendingInvitePayload = null;
    joinRoomWithCode(roomCode, roomPassword);
  });

  btnRefreshOnlineFriends?.addEventListener('click', () => {
    loadWaitingOnlineFriends();
  });

  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as any)?.isContentEditable) {
      return;
    }
    if (e.key === 'Escape') {
      if (airportConfirmModal && airportConfirmModal.style.display === 'flex') {
        airportConfirmModal.style.display = 'none';
        if (boardScene) boardScene.clearTileHighlight();
      } else if (elAirportModal && elAirportModal.style.display === 'flex') {
        elAirportModal.style.display = 'none';
        const isAirportTurn = latestGameStateSnapshot?.turnState?.phase === 'AIRPORT_SELECT' &&
                              latestGameStateSnapshot?.turnState?.currentUserId === socketClient.socket.id;
        if (isAirportTurn && airportFloatingBar) {
          airportFloatingBar.style.display = 'flex';
        }
      }
    }
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
      if (window.innerWidth <= 768) {
        closeTileInspector();
      } else if (inputChatMsg) {
        setTimeout(() => inputChatMsg.focus(), 100);
      }
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
    const mode = currentPendingActionMode;
    currentPendingTileAction = null;
    currentPendingActionMode = null;
    if (mode === 'BUYOUT') {
      socketClient.emit('game:skip_buyout');
    } else {
      socketClient.emit('game:skip_buy');
    }
  });

  btnConfirmBuy.addEventListener('click', () => {
    elPropertyModal.style.display = 'none';
    const mode = currentPendingActionMode;
    const action = currentPendingTileAction;
    const targetLevel = selectedDeedTargetLevel;
    currentPendingTileAction = null;
    currentPendingActionMode = null;
    if (action) {
      if (mode === 'BUYOUT') {
        socketClient.emit('game:buyout_property', { tileId: action.tileId });
      } else {
        socketClient.emit('game:buy_property', { tileId: action.tileId, targetLevel });
      }
    }
  });

  btnCloseCard.addEventListener('click', () => {
    elCardModal.style.display = 'none';
    const isMe = latestGameStateSnapshot?.turnState?.currentUserId === socketClient.socket.id;
    const phase = latestGameStateSnapshot?.turnState?.phase;
    if (isMe && phase === 'BUY_PROPERTY' && elPropertyModal.style.display !== 'flex') {
      const me = latestGameStateSnapshot?.players?.find((p: any) => p.id === socketClient.socket.id);
      if (me) {
        const tile = boardTilesData[me.position];
        const prop = latestPropertiesSnapshot.find(pr => pr.tileId === me.position);
        if (tile && (tile.type === 'PROPERTY' || tile.type === 'RAILROAD' || tile.type === 'UTILITY')) {
          if (!prop) {
            handleTileActionResult({
              type: 'CAN_BUY',
              tileId: tile.id,
              tileName: tile.name,
              cost: tile.price,
              canAfford: (me.balance ?? 0) >= tile.price
            }, true, me, boardScene.getTileWorldPosition(me.position));
          } else if (prop.ownerId === me.id && tile.type === 'PROPERTY' && prop.level < 4 && !prop.isMortgaged) {
            const cost = tile.houseCost || 100;
            handleTileActionResult({
              type: 'CAN_UPGRADE',
              tileId: tile.id,
              tileName: tile.name,
              level: prop.level,
              cost,
              canAfford: (me.balance ?? 0) >= cost
            }, true, me, boardScene.getTileWorldPosition(me.position));
          }
        }
      }
    }
  });

  btnPlayAgain.addEventListener('click', () => {
    window.location.reload();
  });

  btnLeaveMatch?.addEventListener('click', () => {
    if (latestGameStateSnapshot?.isGameOver || elVictoryModal.style.display === 'flex') {
      socketClient.emit('game:leave_match');
      resetMatchAndReturnToLobby();
      return;
    }
    elLeaveMatchModal.style.display = 'flex';
  });

  btnCancelLeave?.addEventListener('click', () => {
    elLeaveMatchModal.style.display = 'none';
  });

  btnConfirmLeave?.addEventListener('click', () => {
    elLeaveMatchModal.style.display = 'none';
    socketClient.emit('game:leave_match');
    resetMatchAndReturnToLobby();
  });
}

function resetMatchAndReturnToLobby() {
  cancelAutoEndTurn();
  currentRoomCode = '';
  isHost = false;
  currentPendingTileAction = null;
  currentPendingActionMode = null;
  latestGameStateSnapshot = null;
  latestPlayersSnapshot = [];
  latestPropertiesSnapshot = [];
  latestTurnSnapshot = null;
  latestWaitingPlayers = [];
  currentInspectedTileId = null;

  elGameHud.style.display = 'none';
  elRoomWaiting.style.display = 'none';
  if (waitingStartHint) waitingStartHint.style.display = 'none';
  if (btnToggleReady) btnToggleReady.style.display = 'none';
  elPropertyModal.style.display = 'none';
  elCardModal.style.display = 'none';
  elFestivalModal.style.display = 'none';
  elAuctionModal.style.display = 'none';
  elTradeProposeModal.style.display = 'none';
  elTradeOfferModal.style.display = 'none';
  elVictoryModal.style.display = 'none';
  elLeaveMatchModal.style.display = 'none';
  elSettingsModal.style.display = 'none';
  if (elRoomInviteModal) elRoomInviteModal.style.display = 'none';
  if (waitingInviteBox) waitingInviteBox.style.display = 'none';
  invitedFriendIdsInRoom.clear();
  pendingInvitePayload = null;
  playerDiceSkinCache.clear();
  if (auctionCountdownInterval !== null) {
    clearInterval(auctionCountdownInterval);
    auctionCountdownInterval = null;
  }
  if (matchTimerInterval !== null) {
    clearInterval(matchTimerInterval);
    matchTimerInterval = null;
  }
  matchTimeRemainingLocal = null;
  activeIncomingTradeId = null;
  if (elAirportModal) elAirportModal.style.display = 'none';
  if (airportFloatingBar) airportFloatingBar.style.display = 'none';
  if (airportConfirmModal) airportConfirmModal.style.display = 'none';
  if (elBoardRosterModal) elBoardRosterModal.style.display = 'none';
  elTileInspector.style.display = 'none';
  elLogDrawer.style.display = 'none';
  btnToggleLog.classList.remove('is-active');
  if (elChatDrawer) elChatDrawer.style.display = 'none';
  btnToggleChat?.classList.remove('is-active');

  btnRollDice.style.display = 'none';
  btnEndTurn.style.display = 'none';
  btnPayJailFine.style.display = 'none';
  btnUseJailCard.style.display = 'none';

  if (boardScene) {
    boardScene.tokenManager?.clearTokens();
    boardScene.tokenManager?.setActiveTurnPlayer(null);
    boardScene.clearTileHighlight();
    boardScene.syncProperties([], []);
    (boardScene as any).setFestivalTile?.(null);
    boardScene.cameraManager?.resetOverview();
  }

  elLobbyView.style.display = 'flex';
  elLobbyCard.style.display = 'block';
  btnRestoreLobby.style.display = 'none';
  fetchRoomList();
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

    // Auto-invite checked online friends from create room modal
    if (createRoomFriendsList) {
      const checkedBoxes = Array.from(createRoomFriendsList.querySelectorAll<HTMLInputElement>('.create-room-friend-cb:checked'));
      checkedBoxes.forEach(cb => {
        socketClient.emit('room:invite_friend', { friendId: cb.value, roomCode: data.roomCode });
      });
      if (checkedBoxes.length > 0) {
        showToast(`Đã gửi lời mời tự động tới ${checkedBoxes.length} bạn bè online! 💌`);
      }
    }

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

  socketClient.on('room:left', () => {
    resetMatchAndReturnToLobby();
  });

  socketClient.on('room:invite_received', (data: any) => {
    pendingInvitePayload = data;
    if (roomInviteSender) roomInviteSender.textContent = data.inviterName || 'Một người bạn';
    if (roomInviteRoomName) roomInviteRoomName.textContent = data.roomName || 'Phòng Chơi';
    if (roomInviteCode) roomInviteCode.textContent = data.roomCode || '';
    sounds.playTurnNotification?.();
    if (elRoomInviteModal) elRoomInviteModal.style.display = 'flex';
  });

  socketClient.on('room:invite_sent', (data: any) => {
    if (data?.friendId) {
      invitedFriendIdsInRoom.add(data.friendId);
      const btn = waitingOnlineFriendsList?.querySelector<HTMLButtonElement>(`button[data-friend-id="${data.friendId}"]`);
      if (btn) {
        btn.disabled = true;
        btn.className = 'btn-chunky btn-white btn-xs btn-invite-slot';
        btn.textContent = 'Đã mời ✓';
      }
    }
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

    // Cache player dice skins for Zero-Network turn switch
    if (Array.isArray(data.snapshot?.players)) {
      data.snapshot.players.forEach((p: any) => {
        if (p.id && p.diceSkin) playerDiceSkinCache.set(p.id, p.diceSkin);
      });
    }

    // Create real player tokens (pass trailEffect if supported)
    data.snapshot.players.forEach((p: any, idx: number) => {
      (boardScene.tokenManager.createToken as any)(p.id, p.token, p.color, idx, p.trailEffect);
    });

    // Mũi tên 3D trỏ vào nhân vật lượt đầu tiên
    const firstId = data.snapshot?.turnState?.currentUserId;
    const firstPlayer = data.snapshot?.players?.find((p: any) => p.id === firstId) || data.snapshot?.players?.[0];
    if (firstPlayer) {
      boardScene.tokenManager.setActiveTurnPlayer(firstPlayer.id, firstPlayer.username, firstPlayer.color);
    }

    updateHudPlayers(data.snapshot);
    sounds.playTurnNotification();
    boardScene.syncProperties(data.snapshot.properties || [], data.snapshot.players || []);
    (boardScene as any).setFestivalTile?.(data.snapshot?.festivalTileId ?? null);
    latestGameStateSnapshot = data.snapshot;
    checkMyTurn(data.snapshot);
  });

  socketClient.on('game:dice_result', (data: any) => {
    const isMe = data.userId === socketClient.socket.id;
    const player = data.snapshot.players.find((p: any) => p.id === data.userId);
    if (player?.id && player?.diceSkin) {
      playerDiceSkinCache.set(player.id, player.diceSkin);
    }
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

    // ZERO-NETWORK TURN SWITCH + PERSONAL VIEW
    let skinToUse = 'dice_ivory';
    if (isPersonalDiceView) {
      skinToUse = currentUser?.equippedDice || localStorage.getItem('bc_equipped_dice') || 'dice_ivory';
    } else {
      skinToUse = player?.diceSkin || playerDiceSkinCache.get(data.userId) || 'dice_ivory';
    }
    (boardScene.dicePhysics as any).setDiceSkin?.(skinToUse);
    boardScene.dicePhysics.roll(data.dice1, data.dice2, () => {
      // NOTE: Only follow the token when rolling completes and movement actually begins!
      const token = boardScene.tokenManager.tokens.get(data.userId);
      if (token) {
        boardScene.cameraManager.setFollowTarget(token.mesh.position);
      }

      const finishLanding = (landedTileId: number) => {
        const currentToken = boardScene.tokenManager.tokens.get(data.userId);
        const landingPos = currentToken ? currentToken.mesh.position : boardScene.getTileWorldPosition(landedTileId);

        // Highlight và tự động mở Tra Cứu Chi Tiết ô cờ vừa dừng chân
        boardScene.highlightTile(landedTileId);
        const currentTile = boardTilesData[landedTileId];
        showTileInspector(landedTileId, currentTile);

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
      };

      boardScene.tokenManager.moveTokenSteps(
        data.userId,
        data.prevPosition,
        data.newPosition,
        slot,
        (_stepTile) => {},
        () => {
          const finalPos = player ? player.position : data.newPosition;
          if (finalPos !== data.newPosition) {
            // Thẻ Cơ Hội / Khí Vận hoặc luật đặc biệt đã dịch chuyển người chơi tới ô mới
            boardScene.tokenManager.flyTokenDirect(data.userId, finalPos, slot, () => {
              finishLanding(finalPos);
            });
          } else {
            finishLanding(data.newPosition);
          }
        }
      );
    });

    latestGameStateSnapshot = data.snapshot;
    latestPropertiesSnapshot = data.snapshot.properties || latestPropertiesSnapshot;
    boardScene.syncProperties(data.snapshot.properties || [], data.snapshot.players || []);
    (boardScene as any).setFestivalTile?.(data.snapshot?.festivalTileId ?? null);
    updateHudPlayers(data.snapshot);
    renderLogs(data.snapshot.logs);
  });

  socketClient.on('game:airport_flight_result', (data: any) => {
    const isMe = data.userId === socketClient.socket.id;
    const player = data.snapshot.players.find((p: any) => p.id === data.userId);
    const slot = data.snapshot.players.findIndex((p: any) => p.id === data.userId);
    latestGameStateSnapshot = data.snapshot;
    latestPlayersSnapshot = data.snapshot.players;

    if (elAirportModal) elAirportModal.style.display = 'none';
    if (airportFloatingBar) airportFloatingBar.style.display = 'none';
    if (airportConfirmModal) airportConfirmModal.style.display = 'none';

    sounds.playCardChime();
    const destName = boardTilesData[data.newPosition]?.name || 'ô mới';
    showToast(`🛫 ${player ? player.username : 'Người chơi'} đang bay đến [${destName}]!`);

    const finishAirportLanding = (landedTileId: number) => {
      const currentToken = boardScene.tokenManager.tokens.get(data.userId);
      const landingPos = currentToken ? currentToken.mesh.position : boardScene.getTileWorldPosition(landedTileId);

      boardScene.highlightTile(landedTileId);
      const currentTile = boardTilesData[landedTileId];
      showTileInspector(landedTileId, currentTile);

      if (currentTile && currentTile.type === 'RAILROAD') {
        sounds.playTrainWhistle();
        boardScene.vfxManager.spawnTrainSmoke(landingPos, 14);
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
    };

    boardScene.tokenManager.flyTokenDirect(
      data.userId,
      data.newPosition,
      slot,
      () => {
        const finalPos = player ? player.position : data.newPosition;
        if (finalPos !== data.newPosition) {
          boardScene.tokenManager.flyTokenDirect(data.userId, finalPos, slot, () => {
            finishAirportLanding(finalPos);
          });
        } else {
          finishAirportLanding(data.newPosition);
        }
      }
    );

    latestGameStateSnapshot = data.snapshot;
    latestPropertiesSnapshot = data.snapshot.properties || latestPropertiesSnapshot;
    boardScene.syncProperties(data.snapshot.properties || [], data.snapshot.players || []);
    (boardScene as any).setFestivalTile?.(data.snapshot?.festivalTileId ?? null);
    updateHudPlayers(data.snapshot);
    renderLogs(data.snapshot.logs);
  });

  socketClient.on('game:property_updated', (data: any) => {
    latestGameStateSnapshot = data.snapshot;
    boardScene.syncProperties(data.snapshot.properties || [], data.snapshot.players || []);
    (boardScene as any).setFestivalTile?.(data.snapshot?.festivalTileId ?? null);
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
  });

  socketClient.on('game:property_mortgaged', (data: any) => {
    latestGameStateSnapshot = data.snapshot;
    latestPlayersSnapshot = data.snapshot.players;
    latestPropertiesSnapshot = data.snapshot.properties || latestPropertiesSnapshot;
    if (Array.isArray(data.snapshot?.players)) {
      data.snapshot.players.forEach((p: any) => {
        if (p.id && p.diceSkin) playerDiceSkinCache.set(p.id, p.diceSkin);
      });
    }
    boardScene.syncProperties(data.snapshot.properties || [], data.snapshot.players || []);

    const tileName = boardTilesData[data.tileId]?.name || `Ô #${data.tileId}`;
    sounds.playCashTransaction();
    showToast(`🏦 Đã thế chấp [${tileName}] (+${data.mortgageValue}M)`);

    if (currentInspectedTileId === data.tileId) {
      showTileInspector(data.tileId);
    }
    if (elBoardRosterModal.style.display === 'flex') {
      renderBoardRoster();
    }
    updateHudPlayers(data.snapshot);
    renderLogs(data.snapshot.logs);
    checkMyTurn(data.snapshot);
  });

  socketClient.on('game:property_unmortgaged', (data: any) => {
    latestGameStateSnapshot = data.snapshot;
    latestPlayersSnapshot = data.snapshot.players;
    latestPropertiesSnapshot = data.snapshot.properties || latestPropertiesSnapshot;
    if (Array.isArray(data.snapshot?.players)) {
      data.snapshot.players.forEach((p: any) => {
        if (p.id && p.diceSkin) playerDiceSkinCache.set(p.id, p.diceSkin);
      });
    }
    boardScene.syncProperties(data.snapshot.properties || [], data.snapshot.players || []);

    const tileName = boardTilesData[data.tileId]?.name || `Ô #${data.tileId}`;
    sounds.playCashTransaction();
    showToast(`💎 Đã chuộc lại [${tileName}] (-${data.cost}M)`);

    if (currentInspectedTileId === data.tileId) {
      showTileInspector(data.tileId);
    }
    if (elBoardRosterModal.style.display === 'flex') {
      renderBoardRoster();
    }
    updateHudPlayers(data.snapshot);
    renderLogs(data.snapshot.logs);
    checkMyTurn(data.snapshot);
  });

  socketClient.on('game:state_sync', (data: any) => {
    latestGameStateSnapshot = data.snapshot;
    latestPlayersSnapshot = data.snapshot.players;
    latestPropertiesSnapshot = data.snapshot.properties || latestPropertiesSnapshot;
    if (Array.isArray(data.snapshot?.players)) {
      data.snapshot.players.forEach((p: any) => {
        if (p.id && p.diceSkin) playerDiceSkinCache.set(p.id, p.diceSkin);
      });
    }
    if (Array.isArray(data.snapshot?.players)) {
      data.snapshot.players.forEach((p: any) => {
        if (p.id && p.diceSkin) playerDiceSkinCache.set(p.id, p.diceSkin);
      });
    }
    boardScene.syncProperties(data.snapshot.properties || [], data.snapshot.players || []);
    (boardScene as any).setFestivalTile?.(data.snapshot?.festivalTileId ?? null);
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
    cancelAutoEndTurn();
    currentPendingTileAction = null;
    currentPendingActionMode = null;
    elPropertyModal.style.display = 'none';
    elCardModal.style.display = 'none';
    elFestivalModal.style.display = 'none';
    elAuctionModal.style.display = 'none';
    if (elAirportModal) elAirportModal.style.display = 'none';
    if (airportFloatingBar) airportFloatingBar.style.display = 'none';
    if (airportConfirmModal) airportConfirmModal.style.display = 'none';

    latestGameStateSnapshot = data.snapshot;
    latestPlayersSnapshot = data.snapshot.players;
    latestPropertiesSnapshot = data.snapshot.properties || latestPropertiesSnapshot;
    if (Array.isArray(data.snapshot?.players)) {
      data.snapshot.players.forEach((p: any) => {
        if (p.id && p.diceSkin) playerDiceSkinCache.set(p.id, p.diceSkin);
      });
    }
    (boardScene as any).setFestivalTile?.(data.snapshot?.festivalTileId ?? null);
    updateHudPlayers(data.snapshot);
    renderLogs(data.snapshot.logs);
    checkMyTurn(data.snapshot);

    if (currentInspectedTileId !== null) {
      showTileInspector(currentInspectedTileId);
    }

    const nextPlayer = data.snapshot?.players?.find((p: any) => p.id === data.nextUserId);
    if (nextPlayer && boardScene?.tokenManager) {
      boardScene.tokenManager.setActiveTurnPlayer(data.nextUserId, nextPlayer.username, nextPlayer.color);
    }
  });

  socketClient.on('game:timer_tick', (data: { remaining: number }) => {
    const maxTimeout = latestGameStateSnapshot?.turnState?.turnTimeout || 30;
    const pct = Math.max(0, Math.min(100, (data.remaining / maxTimeout) * 100));
    timerFill.style.width = `${pct}%`;
    timerFill.style.backgroundColor = data.remaining <= 5 ? '#D63031' : '#00B894';
  });

  socketClient.on('game:over', (data: any) => {
    cancelAutoEndTurn();
    currentPendingTileAction = null;
    currentPendingActionMode = null;
    if (boardScene?.tokenManager) {
      boardScene.tokenManager.setActiveTurnPlayer(null);
    }
    elPropertyModal.style.display = 'none';
    elCardModal.style.display = 'none';
    elFestivalModal.style.display = 'none';
    elAuctionModal.style.display = 'none';
    elTradeProposeModal.style.display = 'none';
    elTradeOfferModal.style.display = 'none';
    if (auctionCountdownInterval !== null) {
      clearInterval(auctionCountdownInterval);
      auctionCountdownInterval = null;
    }
    if (matchTimerInterval !== null) {
      clearInterval(matchTimerInterval);
      matchTimerInterval = null;
    }
    if (elAirportModal) elAirportModal.style.display = 'none';
    if (airportFloatingBar) airportFloatingBar.style.display = 'none';
    if (airportConfirmModal) airportConfirmModal.style.display = 'none';
    showVictory(data);
  });

  socketClient.on('game:auction_resolved', (data: any) => {
    elAuctionModal.style.display = 'none';
    if (auctionCountdownInterval !== null) {
      clearInterval(auctionCountdownInterval);
      auctionCountdownInterval = null;
    }
    if (data?.winnerName && data?.amount) {
      showToast(`🔨 ${data.winnerName} đã thắng đấu giá với ${data.amount}M!`);
    } else if (data?.tileName) {
      showToast(`🔨 Đấu giá ${data.tileName} kết thúc (không có người mua).`);
    }
    if (data?.snapshot) {
      latestGameStateSnapshot = data.snapshot;
      latestPlayersSnapshot = data.snapshot.players;
      latestPropertiesSnapshot = data.snapshot.properties || latestPropertiesSnapshot;
      boardScene.syncProperties(data.snapshot.properties || [], data.snapshot.players || []);
      updateHudPlayers(data.snapshot);
      renderLogs(data.snapshot.logs);
      checkMyTurn(data.snapshot);
    }
  });

  socketClient.on('error:message', (data: { message: string }) => {
    if (elJoinPasswordModal && elJoinPasswordModal.style.display !== 'none') {
      joinPasswordError.textContent = data.message;
      joinPasswordError.style.display = 'block';
    } else if (data.message && data.message.includes('Mật khẩu') && pendingJoinRoomCode) {
      joinPasswordRoomName.textContent = pendingJoinRoomCode;
      joinPasswordError.textContent = data.message;
      joinPasswordError.style.display = 'block';
      elJoinPasswordModal.style.display = 'flex';
    } else if (elGameHud && elGameHud.style.display !== 'none') {
      showToast(`⚠️ ${data.message}`);
      if (latestGameStateSnapshot) {
        checkMyTurn(latestGameStateSnapshot);
      }
    } else {
      alert(data.message);
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

  socketClient.emit('user:identify', { userId: user.id, token: getAuthToken() });
  fetchMyCustomizations().catch(() => {});
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

  if (profileEquippedTitle) {
    const titleId = currentUser.equippedTitle || 'title_rookie';
    profileEquippedTitle.textContent = `🏷️ ${TITLE_LABELS[titleId] || titleId}`;
  }
  if (profileBioText) {
    profileBioText.textContent = currentUser.bio?.trim() ? currentUser.bio : 'Chưa có tiểu sử';
  }
  if (inputProfileBio) {
    inputProfileBio.value = currentUser.bio || '';
  }
  renderProfileAvatarPicker();

  // Switch to default achievements tab
  switchProfileTab('achievements');

  elProfileModal.style.display = 'flex';
  await Promise.all([fetchMyAchievements(), fetchMyFrames(), fetchMyCustomizations()]);
}

function switchProfileTab(tab: 'achievements' | 'frames' | 'custom') {
  if (tabBtnProfileAchievements) tabBtnProfileAchievements.classList.toggle('active', tab === 'achievements');
  if (tabBtnProfileFrames) tabBtnProfileFrames.classList.toggle('active', tab === 'frames');
  if (tabBtnProfileCustom) tabBtnProfileCustom.classList.toggle('active', tab === 'custom');
  if (paneProfileAchievements) paneProfileAchievements.style.display = tab === 'achievements' ? 'block' : 'none';
  if (paneProfileFrames) paneProfileFrames.style.display = tab === 'frames' ? 'block' : 'none';
  if (paneProfileCustom) paneProfileCustom.style.display = tab === 'custom' ? 'block' : 'none';
}

function renderProfileAvatarPicker() {
  if (!profileAvatarPicker || !currentUser) return;
  profileAvatarPicker.innerHTML = SAMPLE_AVATARS.map(url => {
    const isActive = currentUser?.avatarUrl === url;
    return `
      <div class="avatar-choice ${isActive ? 'selected' : ''}" data-avatar-url="${url}" title="Chọn avatar này">
        <img src="${url}" alt="avatar" />
      </div>
    `;
  }).join('');

  profileAvatarPicker.querySelectorAll('.avatar-choice').forEach(el => {
    el.addEventListener('click', () => {
      const url = (el as HTMLElement).dataset.avatarUrl;
      if (url) customizeProfileItem('avatar', url);
    });
  });
}

async function fetchMyCustomizations() {
  const token = getAuthToken();
  if (!token || !profileCustomSections) return;
  profileCustomSections.innerHTML = '<div style="font-size:0.8rem;color:#B2BEC3;text-align:center;padding:12px;">Đang tải bộ sưu tập tùy biến 3D...</div>';
  try {
    const res = await fetch('/api/profile/customizations', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    cachedCustomizationsData = data;
    if (currentUser) {
      if (data.equippedToken) currentUser.equippedToken = data.equippedToken;
      if (data.equippedDice) currentUser.equippedDice = data.equippedDice;
      if (data.equippedTrail) currentUser.equippedTrail = data.equippedTrail;
      if (data.equippedTitle) currentUser.equippedTitle = data.equippedTitle;
      if (typeof data.bio === 'string') currentUser.bio = data.bio;
      if (Array.isArray(data.unlockedItems)) currentUser.unlockedItems = data.unlockedItems;
    }
    renderCustomizationsPane(data);
  } catch (e) {
    if (profileCustomSections) {
      profileCustomSections.innerHTML = '<div style="font-size:0.8rem;color:#E84118;text-align:center;padding:12px;">Không thể tải danh sách tùy biến.</div>';
    }
  }
}

function renderCustomizationsPane(data: any) {
  if (!profileCustomSections || !data) return;
  const catalog = data.catalog || {};
  const unlockedSet = new Set<string>(data.unlockedItems || []);

  const sections = [
    {
      heading: '🎭 Model Quân Cờ 3D (10 Mẫu)',
      type: 'token',
      equipped: data.equippedToken || currentUser?.equippedToken || 'car',
      items: catalog.tokens || []
    },
    {
      heading: '🎲 Skin Xúc Xắc 3D',
      type: 'dice',
      equipped: data.equippedDice || currentUser?.equippedDice || 'dice_ivory',
      items: catalog.diceSkins || []
    },
    {
      heading: '✨ Hiệu Ứng Bước Nhảy',
      type: 'trail',
      equipped: data.equippedTrail || currentUser?.equippedTrail || 'trail_default',
      items: catalog.trails || []
    },
    {
      heading: '🏷️ Danh Hiệu Tỷ Phú',
      type: 'title',
      equipped: data.equippedTitle || currentUser?.equippedTitle || 'title_rookie',
      items: catalog.titles || []
    }
  ];

  profileCustomSections.innerHTML = sections.map(sec => {
    const cardsHtml = (sec.items || []).map((item: any) => {
      const isEquipped = sec.equipped === item.id;
      const isUnlocked = item.cost === 0 || unlockedSet.has(item.id) || item.isUnlocked;
      const icon = item.icon || (sec.type === 'token' ? (TOKEN_ICONS[item.id] || '🚗') : sec.type === 'dice' ? '🎲' : sec.type === 'trail' ? '✨' : '🏷️');

      let btnHtml = '';
      if (isEquipped) {
        btnHtml = `<button class="btn-chunky btn-xs" disabled style="background:#00B894;color:white;width:100%;">✓ Đang Dùng</button>`;
      } else if (isUnlocked) {
        btnHtml = `<button class="btn-chunky btn-primary btn-xs" onclick="window.customizeProfileItem('${sec.type}', '${item.id}')" style="width:100%;">Trang Bị</button>`;
      } else {
        btnHtml = `<button class="btn-chunky btn-accent btn-xs" onclick="window.customizeProfileItem('${sec.type}', '${item.id}')" style="width:100%;">Mở Khóa 🪙 ${item.cost}</button>`;
      }

      return `
        <div class="custom-item-card ${isEquipped ? 'is-equipped' : ''} ${isUnlocked ? '' : 'locked'}">
          <div class="custom-item-icon">${icon}</div>
          <div class="custom-item-name">${item.name}</div>
          <div class="custom-item-desc">${item.description || (item.cost === 0 ? 'Miễn phí' : `${item.cost} Vàng`)}</div>
          <div style="width:100%;margin-top:auto;">${btnHtml}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="profile-custom-section">
        <div class="profile-custom-heading">${sec.heading}</div>
        <div class="profile-custom-grid">${cardsHtml}</div>
      </div>
    `;
  }).join('');
}

async function customizeProfileItem(type: 'token' | 'dice' | 'trail' | 'title' | 'bio' | 'avatar', value: string) {
  const token = getAuthToken();
  if (!token) return;
  try {
    const res = await fetch('/api/profile/customize', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ type, value })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      showToast(`⚠️ ${data.error || 'Không thể cập nhật tùy biến'}`);
      return;
    }

    if (data.user && currentUser) {
      currentUser = { ...currentUser, ...data.user };
    } else if (currentUser) {
      if (type === 'token') currentUser.equippedToken = value;
      if (type === 'dice') currentUser.equippedDice = value;
      if (type === 'trail') currentUser.equippedTrail = value;
      if (type === 'title') currentUser.equippedTitle = value;
      if (type === 'bio') currentUser.bio = value;
      if (type === 'avatar') currentUser.avatarUrl = value;
    }

    if (currentUser) {
      headerUserGold.textContent = `🪙 ${(currentUser.goldBalance || 0).toLocaleString()} Vàng`;
      profileGoldBalance.textContent = `${(currentUser.goldBalance || 0).toLocaleString()} Vàng`;
      if (currentUser.avatarUrl) {
        headerUserAvatar.src = currentUser.avatarUrl;
        profileAvatarImg.src = currentUser.avatarUrl;
      }
      if (profileEquippedTitle) {
        const titleId = currentUser.equippedTitle || 'title_rookie';
        profileEquippedTitle.textContent = `🏷️ ${TITLE_LABELS[titleId] || titleId}`;
      }
      if (profileBioText) {
        profileBioText.textContent = currentUser.bio?.trim() ? currentUser.bio : 'Chưa có tiểu sử';
      }
    }

    renderProfileAvatarPicker();
    await fetchMyCustomizations();
    sounds.playTap();
    showToast(data.message || 'Đã cập nhật tùy biến hồ sơ!');
  } catch (e) {
    showToast('⚠️ Lỗi kết nối khi lưu tùy biến.');
  }
}

(window as any).customizeProfileItem = customizeProfileItem;

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
              <span class="friend-status-dot ${f.isOnline ? 'online' : 'offline'}" title="${f.isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}"></span>
            </div>
            <div style="font-size:0.75rem;color:#636E72;">🪙 ${(f.gold_balance || 0).toLocaleString()} • Thắng: ${f.total_wins || 0}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <button class="btn-chunky btn-primary btn-xs" onclick="window.inviteFriendToRoom('${f.username}', '${f.id}')" title="Mời vào phòng chơi">
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

(window as any).inviteFriendToRoom = (friendUsername: string, friendId?: string) => {
  if (currentRoomCode) {
    if (friendId) {
      socketClient.emit('room:invite_friend', { friendId, roomCode: currentRoomCode });
      showToast(`Đã gửi lời mời trực tiếp tới ${friendUsername}! 💌`);
    } else {
      navigator.clipboard.writeText(currentRoomCode).catch(() => {});
      showToast(`Đã sao chép mã phòng ${currentRoomCode} để gửi mời ${friendUsername}! 💌`);
    }
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

  if (tabBtnProfileCustom) {
    tabBtnProfileCustom.addEventListener('click', () => {
      switchProfileTab('custom');
    });
  }

  if (btnSaveBio && inputProfileBio) {
    btnSaveBio.addEventListener('click', () => {
      customizeProfileItem('bio', inputProfileBio.value.trim());
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

function renderWaitingTokenSelector(currentToken: string) {
  if (!waitingTokenGrid) return;
  waitingTokenGrid.innerHTML = '';

  if (waitingSelectedTokenName) {
    const curName = TOKEN_NAMES[currentToken] || currentToken;
    const curIcon = TOKEN_ICONS[currentToken] || '🚗';
    waitingSelectedTokenName.textContent = `${curIcon} ${curName}`;
  }

  AVAILABLE_TOKENS.forEach((tKey) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isSelected = tKey === currentToken;
    const unlocked = isTokenUnlocked(tKey);
    const cost = TOKEN_COSTS[tKey] || 0;

    btn.className = `waiting-token-btn ${isSelected ? 'is-selected' : ''} ${!unlocked ? 'is-locked' : ''}`;
    btn.innerHTML = `
      <span class="waiting-token-btn-icon">${TOKEN_ICONS[tKey] || '🚗'}</span>
      <span class="waiting-token-btn-name">${TOKEN_NAMES[tKey] || tKey}</span>
      ${!unlocked ? `<span class="waiting-token-lock-badge">🔒 ${cost}🪙</span>` : ''}
    `;

    btn.addEventListener('click', () => {
      if (!isTokenUnlocked(tKey)) {
        sounds.playTap();
        showToast(`🔒 Model ${TOKEN_NAMES[tKey] || tKey} đang bị khóa (${cost} Vàng)! Hãy mở khóa trong Hồ Sơ -> Nhân Vật & 3D.`);
        return;
      }
      socketClient.emit('room:select_token', { token: tKey });
      renderWaitingTokenSelector(tKey);
    });
    waitingTokenGrid.appendChild(btn);
  });
}

async function loadCreateRoomOnlineFriends() {
  if (!createRoomFriendsBox || !createRoomFriendsList) return;
  if (!currentUser) {
    createRoomFriendsBox.style.display = 'none';
    return;
  }
  createRoomFriendsBox.style.display = 'block';
  createRoomFriendsList.innerHTML = '<div style="font-size:0.75rem;color:#B2BEC3;padding:4px 0;">Đang kiểm tra bạn bè online...</div>';
  try {
    const token = getAuthToken();
    if (!token) return;
    const res = await fetch('/api/friends', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    const friends = data.friends || [];
    const onlineFriends = friends.filter((f: any) => Boolean(f.isOnline));
    if (createRoomOnlineCount) {
      createRoomOnlineCount.textContent = `(${onlineFriends.length} online)`;
    }
    if (onlineFriends.length === 0) {
      createRoomFriendsList.innerHTML = '<div style="font-size:0.75rem;color:#B2BEC3;padding:4px 0;">Không có bạn bè nào đang trực tuyến.</div>';
      return;
    }
    createRoomFriendsList.innerHTML = onlineFriends.map((f: any) => `
      <label class="create-room-friend-item">
        <div style="display:flex;align-items:center;gap:8px;">
          <input type="checkbox" value="${f.id}" class="create-room-friend-cb" />
          <span>${f.username}</span>
        </div>
        <span class="badge-online">Online</span>
      </label>
    `).join('');
  } catch (e) {
    createRoomFriendsList.innerHTML = '<div style="font-size:0.75rem;color:#B2BEC3;">Không thể tải danh sách.</div>';
  }
}

async function loadWaitingOnlineFriends() {
  if (!waitingInviteBox || !waitingOnlineFriendsList) return;
  if (!currentUser) {
    waitingInviteBox.style.display = 'none';
    return;
  }
  waitingInviteBox.style.display = 'block';
  waitingOnlineFriendsList.innerHTML = '<div style="font-size:0.75rem;color:#B2BEC3;padding:4px 0;">Đang kiểm tra bạn bè online...</div>';
  try {
    const token = getAuthToken();
    if (!token) return;
    const res = await fetch('/api/friends', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    const friends = data.friends || [];
    const onlineFriends = friends.filter((f: any) => Boolean(f.isOnline));
    if (onlineFriends.length === 0) {
      waitingOnlineFriendsList.innerHTML = '<div style="font-size:0.75rem;color:#B2BEC3;padding:4px 0;">Không có bạn bè nào đang trực tuyến.</div>';
      return;
    }
    waitingOnlineFriendsList.innerHTML = onlineFriends.map((f: any) => {
      const isInvited = invitedFriendIdsInRoom.has(f.id);
      return `
        <div class="waiting-friend-invite-row">
          <div style="display:flex;align-items:center;gap:8px;">
            <span>${f.username}</span>
            <span class="badge-online">Online</span>
          </div>
          <button class="btn-chunky ${isInvited ? 'btn-white' : 'btn-primary'} btn-xs btn-invite-slot"
            data-friend-id="${f.id}" data-friend-name="${f.username}" ${isInvited ? 'disabled' : ''} style="padding: 2px 10px; font-size: 0.75rem;">
            ${isInvited ? 'Đã mời ✓' : 'Mời 💌'}
          </button>
        </div>
      `;
    }).join('');

    waitingOnlineFriendsList.querySelectorAll<HTMLButtonElement>('.btn-invite-slot').forEach(btn => {
      btn.addEventListener('click', () => {
        const friendId = btn.dataset.friendId;
        const friendName = btn.dataset.friendName;
        if (!friendId || !currentRoomCode) return;
        socketClient.emit('room:invite_friend', { friendId, roomCode: currentRoomCode });
        invitedFriendIdsInRoom.add(friendId);
        btn.disabled = true;
        btn.className = 'btn-chunky btn-white btn-xs btn-invite-slot';
        btn.textContent = 'Đã mời ✓';
        showToast(`Đã gửi lời mời tới ${friendName || 'bạn bè'}! 💌`);
      });
    });
  } catch (e) {
    waitingOnlineFriendsList.innerHTML = '<div style="font-size:0.75rem;color:#B2BEC3;">Không thể tải danh sách.</div>';
  }
}

function syncWaitingLobby(data: any) {
  if (!data) return;
  if (data.name) waitingRoomName.textContent = data.name;
  if (data.roomCode) waitingRoomCode.textContent = data.roomCode;

  const players = data.players || [];
  const maxPlayers = data.maxPlayers || latestWaitingMaxPlayers || 4;
  latestWaitingPlayers = players;
  latestWaitingMaxPlayers = maxPlayers;
  waitingPlayerCount.textContent = `${players.length}/${maxPlayers}`;

  if (data.hostId) {
    isHost = data.hostId === socketClient.socket.id;
  } else if (players.length > 0) {
    const meInRoom = players.find((p: any) => p.id === socketClient.socket.id);
    if (meInRoom) isHost = Boolean(meInRoom.isHost);
  }

  const me = players.find((p: any) => p.id === socketClient.socket.id);

  if (isHost) {
    if (btnToggleReady) btnToggleReady.style.display = 'none';
    btnAddBot.style.display = players.length < maxPlayers ? 'inline-flex' : 'none';
    btnStartGame.style.display = 'inline-flex';

    const nonHosts = players.filter((p: any) => !p.isHost);
    const allReady = nonHosts.every((p: any) => Boolean(p.isReady || p.isBot));
    const canStart = players.length >= 2 && players.length <= 4 && allReady;

    if (canStart) {
      btnStartGame.disabled = false;
      btnStartGame.style.opacity = '1';
      btnStartGame.style.cursor = 'pointer';
      if (waitingStartHint) waitingStartHint.style.display = 'none';
    } else {
      btnStartGame.disabled = true;
      btnStartGame.style.opacity = '0.6';
      btnStartGame.style.cursor = 'not-allowed';
      if (waitingStartHint) {
        waitingStartHint.style.display = 'block';
        if (players.length < 2) {
          waitingStartHint.textContent = '⚠️ Cần tối thiểu 2 người chơi để bắt đầu (hãy bấm Thêm Bot hoặc mời bạn)!';
        } else {
          const readyCount = nonHosts.filter((p: any) => Boolean(p.isReady || p.isBot)).length;
          waitingStartHint.textContent = `⏳ Chờ người chơi sẵn sàng (${readyCount}/${nonHosts.length})...`;
        }
      }
    }
  } else {
    btnAddBot.style.display = 'none';
    btnStartGame.style.display = 'none';
    if (waitingStartHint) waitingStartHint.style.display = 'none';

    if (btnToggleReady && btnToggleReadyText) {
      btnToggleReady.style.display = 'inline-flex';
      const myReady = Boolean(me?.isReady);
      if (myReady) {
        btnToggleReady.className = 'btn-chunky btn-white';
        btnToggleReady.style.flex = '1';
        btnToggleReadyText.textContent = 'HỦY SẴN SÀNG';
      } else {
        btnToggleReady.className = 'btn-chunky btn-accent';
        btnToggleReady.style.flex = '1';
        btnToggleReadyText.textContent = 'SẴN SÀNG';
      }
    }
  }

  renderWaitingTokenSelector(me?.token || 'car');
  renderWaitingSlots(players, maxPlayers);
  loadWaitingOnlineFriends();
}

function showWaitingLobby(data: any) {
  elLobbyView.style.display = 'none';
  elRoomWaiting.style.display = 'flex';
  syncWaitingLobby(data);
}

function updateWaitingLobby(data: any) {
  syncWaitingLobby(data);
}

function renderWaitingSlots(players: any[], max: number) {
  latestWaitingPlayers = players || [];
  latestWaitingMaxPlayers = max || 4;
  waitingSlots.innerHTML = '';
  for (let i = 0; i < max; i++) {
    const p = players[i];
    const slotDiv = document.createElement('div');

    if (p) {
      const isMe = p.id === socketClient.socket.id;
      const frameId = p.frame || 'frame_default';
      const frameClass = getFrameTierClass(frameId);
      const frameBadge = getFrameBadgeTag(frameId);

      const titleLabel = p.title ? (TITLE_LABELS[p.title] || p.title) : '';
      const tokenKey = p.token || 'car';
      const tokenIcon = TOKEN_ICONS[tokenKey] || '🚗';
      const tokenName = TOKEN_NAMES[tokenKey] || 'Siêu Xe';

      let readyBadgeHtml = '';
      if (p.isHost) {
        readyBadgeHtml = '<span class="waiting-ready-badge host">👑 Sẵn Sàng</span>';
      } else if (p.isReady || p.isBot) {
        readyBadgeHtml = '<span class="waiting-ready-badge ready">✅ Đã Sẵn Sàng</span>';
      } else {
        readyBadgeHtml = '<span class="waiting-ready-badge waiting">⏳ Đang Chờ...</span>';
      }

      slotDiv.className = `waiting-slot-card nameplate-frame ${frameClass}`;
      slotDiv.style.cssText = 'border-radius: 14px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;';
      slotDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${p.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`}" style="width: 36px; height: 36px; border-radius: 50%; background: #EBF2FA; border: 2px solid ${p.color || '#CBD5E1'};" />
          <div>
            <div style="font-weight: 800; font-size: 0.95rem; color: #2D3436; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span>${p.username}</span>
              ${isMe ? '<span style="color:#00B894; font-size:0.75rem;">(Bạn)</span>' : ''}
              ${frameBadge}
              ${readyBadgeHtml}
            </div>
            <div style="font-size: 0.75rem; color: #636E72; display: flex; align-items: center; gap: 6px; margin-top: 2px;">
              <span>${p.isHost ? '👑 Chủ phòng' : p.isBot ? '🤖 Bot AI' : 'Thành viên'}</span>
              ${titleLabel ? ` • <span style="color:#0984E3;font-weight:800;">🏷️ ${titleLabel}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="waiting-slot-token-tag" title="Model nhân vật 3D: ${tokenName}">
          <span style="font-size: 1.1rem;">${tokenIcon}</span>
          <span>${tokenName}</span>
        </div>
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
    const titleLabel = p.title ? (TITLE_LABELS[p.title] || p.title) : '';

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
            ${titleLabel ? `<span class="hud-player-title">${titleLabel}</span>` : ''}
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

function cancelAutoEndTurn() {
  // Đã gỡ bỏ tự động kết thúc lượt theo GAMEPLAY_SPEC.md mục 2.4
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
        if (activePlayer.inJail) {
          turnStatusText.textContent = `🔒 Bạn đang trong tù (${activePlayer.jailTurns || 0}/2 lượt) — Đổ đôi, nộp 50M hoặc dùng thẻ để ra tù!`;
        } else {
          const isDoubleExtra = snap.turnState.isDouble || (snap.turnState.consecutiveDoubles > 0);
          turnStatusText.textContent = isDoubleExtra
            ? '🎉 Đổ trúng đôi! Hãy lắc thêm lượt!'
            : '🎲 Đang tới lượt bạn — Hãy đổ xúc xắc!';
        }
      } else if (phase === 'BUY_PROPERTY') {
        turnStatusText.textContent = '🏠 Đang cân nhắc mua bất động sản...';
      } else if (phase === 'BUYOUT_PROPERTY') {
        turnStatusText.textContent = '💰 Đang cân nhắc mua lại bất động sản của đối thủ...';
      } else if (phase === 'FESTIVAL_SELECT') {
        turnStatusText.textContent = '🎪 Hãy chọn 1 bất động sản để tổ chức Lễ Hội x2!';
      } else if (phase === 'AIRPORT_SELECT') {
        turnStatusText.textContent = '✈️ Chế độ chọn chuyến bay: Bấm trực tiếp vào ô cờ 3D để cất cánh!';
      } else if (phase === 'AUCTION') {
        turnStatusText.textContent = '🔨 Đang diễn ra phiên Đấu Giá Công Khai!';
      } else {
        turnStatusText.textContent = '✅ Pha quản lý — Nâng cấp/Thế chấp ô đất hoặc bấm Kết Thúc Lượt';
      }
    } else {
      turnStatusText.textContent = phase === 'ROLL_DICE'
        ? `🎲 Đang chờ ${activePlayer.username} đổ xúc xắc...`
        : phase === 'BUY_PROPERTY'
        ? `🏠 Đang chờ ${activePlayer.username} quyết định mua đất...`
        : phase === 'BUYOUT_PROPERTY'
        ? `💰 Đang chờ ${activePlayer.username} quyết định mua lại...`
        : phase === 'FESTIVAL_SELECT'
        ? `🎪 Đang chờ ${activePlayer.username} chọn ô Lễ Hội x2...`
        : phase === 'AIRPORT_SELECT'
        ? `✈️ Đang chờ ${activePlayer.username} chọn điểm đến chuyến bay...`
        : phase === 'AUCTION'
        ? '🔨 Đang diễn ra phiên Đấu Giá Công Khai!'
        : `⏳ Đang chờ ${activePlayer.username} hoàn tất lượt...`;
    }
  }

  updateMatchTimerFromSnapshot(snap);
  renderIncomingTradeOffer(snap);

  // Đảm bảo tuyệt đối KHÔNG hiển thị nút hành động khi quân cờ đang di chuyển
  if (isMoving) {
    btnRollDice.style.display = 'none';
    btnEndTurn.style.display = 'none';
    if (btnOpenTrade) btnOpenTrade.style.display = 'none';
    btnPayJailFine.style.display = 'none';
    btnUseJailCard.style.display = 'none';
    return;
  }

  if (phase === 'AUCTION' && snap.auctionState && !snap.isGameOver) {
    renderAuctionModal(snap);
  } else {
    elAuctionModal.style.display = 'none';
    if (auctionCountdownInterval !== null) {
      clearInterval(auctionCountdownInterval);
      auctionCountdownInterval = null;
    }
  }

  if (isMyTurn && !snap.isGameOver && !activePlayer?.isBankrupt) {
    if (phase === 'ROLL_DICE') {
      if (activePlayer?.inJail) {
        showToast('🔒 Bạn đang ở trong tù! Hãy đổ đôi, nộp phạt 50M hoặc dùng Thẻ Đặc Xá.');
        btnPayJailFine.style.display = 'inline-flex';
        if ((activePlayer.getOutOfJailCards ?? 0) > 0) {
          btnUseJailCard.innerHTML = `<span>🎫</span><span>DÙNG THẺ ĐẶC XÁ (${activePlayer.getOutOfJailCards})</span>`;
          btnUseJailCard.style.display = 'inline-flex';
        } else {
          btnUseJailCard.style.display = 'none';
        }
      } else {
        btnPayJailFine.style.display = 'none';
        btnUseJailCard.style.display = 'none';
        const isDoubleExtra = snap.turnState.isDouble || (snap.turnState.consecutiveDoubles > 0);
        if (isDoubleExtra) {
          showToast('🎉 Đổ đôi thành công! Bạn được lắc thêm lượt!');
        } else {
          showToast('Lượt của bạn! 🎲');
        }
      }
      sounds.playTurnNotification();
      btnRollDice.style.display = 'inline-flex';
      btnEndTurn.style.display = 'none';
    } else if (phase === 'AIRPORT_SELECT') {
      btnRollDice.style.display = 'none';
      btnEndTurn.style.display = 'none';
      btnPayJailFine.style.display = 'none';
      btnUseJailCard.style.display = 'none';
      closeTileInspector();
      if (elAirportModal.style.display !== 'flex' && airportConfirmModal.style.display !== 'flex') {
        if (airportFloatingBar) airportFloatingBar.style.display = 'flex';
      }
    } else if (phase === 'FESTIVAL_SELECT') {
      btnRollDice.style.display = 'none';
      btnEndTurn.style.display = 'none';
      btnPayJailFine.style.display = 'none';
      btnUseJailCard.style.display = 'none';
      if (elFestivalModal.style.display !== 'flex') {
        showFestivalModal();
      }
    } else if (phase === 'BUYOUT_PROPERTY') {
      btnRollDice.style.display = 'none';
      btnEndTurn.style.display = 'none';
      btnPayJailFine.style.display = 'none';
      btnUseJailCard.style.display = 'none';
      const pendingBuyout = snap.turnState?.pendingBuyout;
      if (pendingBuyout && elPropertyModal.style.display !== 'flex') {
        const buyoutTile = boardTilesData[pendingBuyout.tileId];
        const targetOwner = snap.players?.find((p: any) => p.id === pendingBuyout.targetOwnerId);
        currentPendingTileAction = {
          type: 'PAY_RENT_AND_CAN_BUYOUT',
          tileId: pendingBuyout.tileId,
          buyoutCost: pendingBuyout.cost,
          ownerName: targetOwner?.username || 'đối thủ'
        };
        currentPendingActionMode = 'BUYOUT';
        propTitle.textContent = `${buyoutTile?.name || 'Bất Động Sản'} (Mua Lại)`;
        populatePropertyDeedModal(
          pendingBuyout.tileId,
          `Giá mua lại (2x): ${pendingBuyout.cost}M`,
          `MUA LẠI BẤT ĐỘNG SẢN • Ô #${pendingBuyout.tileId}`,
          `Bạn có thể chi ${pendingBuyout.cost}M để mua lại ngay ô đất này từ ${targetOwner?.username || 'đối thủ'}!`,
          `Mua Lại (${pendingBuyout.cost}M)`,
          (activePlayer?.balance ?? 0) >= pendingBuyout.cost
        );
        elPropertyModal.style.display = 'flex';
      }
    } else if (phase === 'END_TURN') {
      btnRollDice.style.display = 'none';
      btnPayJailFine.style.display = 'none';
      btnUseJailCard.style.display = 'none';
      btnEndTurn.style.display = 'inline-flex';
      btnEndTurn.innerHTML = `<span>⏩</span><span>KẾT THÚC LƯỢT</span>`;

      if (turnStatusText) {
        turnStatusText.textContent = '💡 Bạn có thể nhấp vào ô đất của mình trên bàn cờ 3D để nâng cấp công trình trước khi kết thúc lượt!';
      }

      if (btnOpenTrade) {
        const hasPartner = (snap.players || []).some((p: any) => p.id !== socketClient.socket.id && !p.isBankrupt);
        btnOpenTrade.style.display = hasPartner ? 'inline-flex' : 'none';
      }
    } else {
      btnRollDice.style.display = 'none';
      btnEndTurn.style.display = 'none';
      if (btnOpenTrade) btnOpenTrade.style.display = 'none';
      btnPayJailFine.style.display = 'none';
      btnUseJailCard.style.display = 'none';
    }
  } else {
    btnRollDice.style.display = 'none';
    btnEndTurn.style.display = 'none';
    if (btnOpenTrade) btnOpenTrade.style.display = 'none';
    btnPayJailFine.style.display = 'none';
    btnUseJailCard.style.display = 'none';
  }
}

function populatePropertyDeedModal(
  tileId: number,
  costLabel: string,
  badgeLabel: string,
  descText: string,
  btnLabel: string,
  canAfford: boolean,
  actionType: 'CAN_BUY' | 'CAN_UPGRADE' | 'BUYOUT' = 'CAN_BUY'
) {
  const tile = boardTilesData && boardTilesData[tileId];
  const color = (tile && tile.districtColor) ? tile.districtColor : '#00B894';
  propColorBar.style.background = `linear-gradient(135deg, ${color}, #2D3436)`;
  if (propIcon) propIcon.textContent = LANDMARK_ICONS[tileId] || '🏛️';
  if (propBadge) propBadge.textContent = badgeLabel;
  propPrice.textContent = costLabel;
  propDesc.textContent = descText;

  const myId = socketClient.socket?.id || '';
  const myPlayer = latestPlayersSnapshot.find(p => p.id === myId);
  const myCash = myPlayer?.balance ?? 0;
  const toursCompleted = myPlayer?.toursCompleted || 0;

  // 1. BUYOUT mode or Non-PROPERTY tiles (RAILROAD, UTILITY)
  if (actionType === 'BUYOUT' || !tile || tile.type !== 'PROPERTY') {
    if (propBuildOptionsContainer) propBuildOptionsContainer.style.display = 'none';
    selectedDeedTargetLevel = 0;
    btnConfirmBuy.textContent = btnLabel;
    btnConfirmBuy.style.display = canAfford ? 'inline-block' : 'none';
    btnConfirmBuy.disabled = !canAfford;

    if (propRentPreview && tile && (tile.type === 'RAILROAD' || tile.type === 'UTILITY')) {
      propRentPreview.style.display = 'grid';
      propRentPreview.innerHTML = `
        <div class="prop-rent-chip"><span>Thuê cơ bản</span><b>${tile.baseRent || 25}M</b></div>
        <div class="prop-rent-chip"><span>2-3 Bến/Ga</span><b>${(tile.baseRent || 25) * 2}M - ${(tile.baseRent || 25) * 4}M</b></div>
        <div class="prop-rent-chip"><span>Trọn Bộ 4 Ga</span><b>${(tile.baseRent || 25) * 8}M</b></div>
      `;
    } else if (propRentPreview) {
      propRentPreview.style.display = 'none';
    }
    return;
  }

  // 2. Business Tour Multi-Tier Build Selector for PROPERTY
  if (propRentPreview) propRentPreview.style.display = 'none';

  const prop = latestPropertiesSnapshot.find(p => p.tileId === tileId);
  const currentLevel = prop ? prop.level : -1; // -1 means unowned / fresh buy
  const houseCost = tile.houseCost || 100;
  const basePrice = tile.price || 0;

  // District monopoly calculation for rent
  const districtTiles = tile.district
    ? boardTilesData.filter(t => t.district === tile.district && t.type === 'PROPERTY')
    : [];
  const ownedCount = districtTiles.filter(t => {
    const p = latestPropertiesSnapshot.find(pr => pr.tileId === t.id);
    return p && p.ownerId === myId;
  }).length;
  const willOwnCount = currentLevel === -1 ? ownedCount + 1 : ownedCount;
  const ownsMonopoly = districtTiles.length > 0 && willOwnCount === districtTiles.length;
  const isFestival = latestGameStateSnapshot?.festivalTileId === tileId;

  // Standard Business Tour Tier Metadata
  const tierMeta: Record<number, { icon: string; name: string; badge: string }> = {
    0: { icon: '🏕️', name: 'Đất trống', badge: 'Đất nền' },
    1: { icon: '🏠', name: '1 Nhà', badge: '+1 Cấp' },
    2: { icon: '🏠🏠', name: '2 Nhà', badge: '+2 Cấp' },
    3: { icon: '🏢', name: 'Căn Hộ', badge: 'Apartment' },
    4: { icon: '🏨', name: 'Khách Sạn', badge: 'Hotel (Bất tử)' }
  };

  interface TierOption {
    targetLevel: number;
    cost: number;
    rent: number;
    isLocked: boolean;
    lockReason?: string;
  }

  const tierOptions: TierOption[] = [];

  if (currentLevel === -1) {
    // Mua đất trống: tối đa 2 nhà (cấp 0, 1, 2)
    for (let l = 0; l <= 2; l++) {
      const cost = basePrice + l * houseCost;
      const rent = getRentForTileAtLevel(tile, l, ownsMonopoly, isFestival);
      tierOptions.push({
        targetLevel: l,
        cost,
        rent,
        isLocked: false
      });
    }
  } else {
    // Nâng cấp đất của mình khi dừng chân
    const candidateLevels: number[] = [];
    if (currentLevel === 0) candidateLevels.push(1, 2, 3);
    else if (currentLevel === 1) candidateLevels.push(2, 3);
    else if (currentLevel === 2) candidateLevels.push(3, 4);
    else if (currentLevel === 3) candidateLevels.push(4);

    for (const l of candidateLevels) {
      const cost = (l - currentLevel) * houseCost;
      const rent = getRentForTileAtLevel(tile, l, ownsMonopoly, isFestival);
      let isLocked = false;
      let lockReason = '';

      if (l === 3 && toursCompleted === 0) {
        isLocked = true;
        lockReason = 'Mở khóa sau vòng 1';
      } else if (l === 4 && currentLevel < 3) {
        isLocked = true;
        lockReason = 'Cần có Căn Hộ & dừng lại lần sau';
      }

      tierOptions.push({
        targetLevel: l,
        cost,
        rent,
        isLocked,
        lockReason
      });
    }
  }

  // Chọn mặc định: chọn cấp hợp lệ có thể chi trả được, hoặc cấp mở đầu tiên
  const defaultOption = tierOptions.find(opt => !opt.isLocked && myCash >= opt.cost) ||
                        tierOptions.find(opt => !opt.isLocked) ||
                        tierOptions[0];
  selectedDeedTargetLevel = defaultOption ? defaultOption.targetLevel : 0;

  if (propBuildOptionsContainer && propBuildTierGrid) {
    propBuildOptionsContainer.style.display = 'block';
    if (propBuildCashHint) {
      propBuildCashHint.textContent = toursCompleted > 0
        ? `Vòng ${toursCompleted + 1} • Số dư: ${myCash}M`
        : `Vòng 1 (Khởi hành) • Số dư: ${myCash}M`;
    }

    const updateSelectionUI = (targetLevel: number) => {
      const opt = tierOptions.find(o => o.targetLevel === targetLevel);
      if (!opt) return;

      selectedDeedTargetLevel = targetLevel;
      const targetCost = opt.cost;
      const isAffordable = myCash >= targetCost;
      const canBuy = !opt.isLocked && isAffordable;

      propPrice.textContent = `Tổng chi phí: ${targetCost}M`;
      if (currentLevel === -1) {
        if (targetLevel === 0) {
          btnConfirmBuy.textContent = `Mua Đất (${targetCost}M)`;
        } else {
          btnConfirmBuy.textContent = `Mua + ${targetLevel} Nhà (${targetCost}M)`;
        }
      } else {
        const meta = tierMeta[targetLevel];
        btnConfirmBuy.textContent = `Nâng Cấp ${meta?.name || `Cấp ${targetLevel}`} (${targetCost}M)`;
      }

      btnConfirmBuy.style.display = 'inline-block';
      btnConfirmBuy.disabled = !canBuy;
      if (opt.isLocked) {
        btnConfirmBuy.textContent = `🔒 ${opt.lockReason}`;
      } else if (!isAffordable) {
        btnConfirmBuy.textContent = `Thiếu tiền (${targetCost}M / ${myCash}M)`;
      }

      propBuildTierGrid.querySelectorAll('.prop-tier-card').forEach((card) => {
        const lvl = parseInt(card.getAttribute('data-target-level') || '-1', 10);
        if (lvl === targetLevel) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    };

    let gridHtml = '';
    for (const opt of tierOptions) {
      const meta = tierMeta[opt.targetLevel] || { icon: '🏗️', name: `Cấp ${opt.targetLevel}`, badge: '' };
      const isAffordable = myCash >= opt.cost;
      const isActive = opt.targetLevel === selectedDeedTargetLevel;
      const isDisabled = opt.isLocked || !isAffordable;
      const badgeText = opt.isLocked ? `🔒 ${opt.lockReason}` : meta.badge;

      gridHtml += `
        <div class="prop-tier-card ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}" 
             data-target-level="${opt.targetLevel}" 
             data-cost="${opt.cost}"
             data-locked="${opt.isLocked ? 'true' : 'false'}"
             data-lock-reason="${opt.lockReason || ''}">
          <span class="prop-tier-badge" style="${opt.isLocked ? 'background: #636E72;' : ''}">${badgeText}</span>
          <div class="prop-tier-top">
            <span class="prop-tier-icon">${meta.icon}</span>
            <span class="prop-tier-level-name">${meta.name}</span>
          </div>
          <div class="prop-tier-rent">Thuê: <strong>${opt.rent}M</strong>${ownsMonopoly && opt.targetLevel === 0 ? ' (x2)' : ''}</div>
          <div class="prop-tier-cost">${opt.cost}M</div>
        </div>
      `;
    }

    propBuildTierGrid.innerHTML = gridHtml;

    propBuildTierGrid.querySelectorAll('.prop-tier-card').forEach((card) => {
      card.addEventListener('click', () => {
        const tLevel = parseInt(card.getAttribute('data-target-level') || '-1', 10);
        const cost = parseInt(card.getAttribute('data-cost') || '0', 10);
        const isLocked = card.getAttribute('data-locked') === 'true';
        const lockReason = card.getAttribute('data-lock-reason');

        if (isLocked) {
          sounds.playCardChime();
          showToast(`🔒 Chưa thể nâng lên cấp này: ${lockReason}`);
          return;
        }

        if (tLevel >= 0) {
          if (myCash < cost) {
            sounds.playCardChime();
            showToast(`⚠️ Không đủ tiền: Cần ${cost}M, bạn đang có ${myCash}M.`);
            return;
          }
          sounds.playTap();
          updateSelectionUI(tLevel);
        }
      });
    });

    updateSelectionUI(selectedDeedTargetLevel);
  }
}

function handleTileActionResult(action: any, isMe: boolean, player: any, pos: any) {
  if (!action) return;

  if (action.type === 'CAN_BUY' && isMe) {
    currentPendingTileAction = action;
    currentPendingActionMode = 'BUY';
    propTitle.textContent = action.tileName;
    const sub = LANDMARK_SUBTITLES[action.tileId] || 'Bất Động Sản Chiến Lược';
    populatePropertyDeedModal(
      action.tileId,
      `Giá sở hữu: ${action.cost}M`,
      `SỔ ĐỎ ĐỊA DANH • Ô #${action.tileId}`,
      `${sub}. Sở hữu ngay lô đất này và chọn xây thêm công trình để tối ưu hóa thu nhập!`,
      `Mua Đất (${action.cost}M)`,
      action.canAfford,
      'CAN_BUY'
    );
    elPropertyModal.style.display = 'flex';
  } else if (action.type === 'CAN_UPGRADE' && isMe) {
    currentPendingTileAction = action;
    currentPendingActionMode = 'BUY';
    propTitle.textContent = `${action.tileName} (Nâng Cấp)`;
    populatePropertyDeedModal(
      action.tileId,
      `Chi phí nâng cấp: ${action.cost}M`,
      `NÂNG CẤP CÔNG TRÌNH • Ô #${action.tileId}`,
      `Nâng cấp công trình kiến trúc trên ô đất của bạn để nhân gấp bội tiền thuê!`,
      `Nâng Cấp (${action.cost}M)`,
      action.canAfford,
      'CAN_UPGRADE'
    );
    elPropertyModal.style.display = 'flex';
  } else if (action.type === 'PAY_RENT' || action.type === 'RENT_WAIVED' || action.type === 'PAY_RENT_AND_CAN_BUYOUT' || action.type === 'RENT_WAIVED_AND_CAN_BUYOUT') {
    const isWaived = action.type === 'RENT_WAIVED' || action.type === 'RENT_WAIVED_AND_CAN_BUYOUT';
    if (isWaived) {
      sounds.playCardChime();
      showToast(`${player.username} được miễn tiền thuê nhờ Thẻ Miễn Thuê!`);
    } else {
      const paid = action.amount ?? action.rentPaid ?? 0;
      sounds.playCashTransaction();
      boardScene.vfxManager.spawnFloatingDollar(`${paid}M`, pos, false);
      showToast(`${player.username} đã trả ${paid}M tiền thuê cho ${action.ownerName}!`);
    }
    const canBuyout = action.canBuyout || action.type === 'PAY_RENT_AND_CAN_BUYOUT' || action.type === 'RENT_WAIVED_AND_CAN_BUYOUT';
    if (isMe && canBuyout && action.buyoutCost) {
      const tile = boardTilesData[action.tileId];
      currentPendingTileAction = action;
      currentPendingActionMode = 'BUYOUT';
      propTitle.textContent = `${tile?.name || 'Bất Động Sản'} (Mua Lại)`;
      populatePropertyDeedModal(
        action.tileId,
        `Giá mua lại (2x): ${action.buyoutCost}M`,
        `MUA LẠI BẤT ĐỘNG SẢN • Ô #${action.tileId}`,
        `Bạn có quyền chi ${action.buyoutCost}M để mua lại ngay ô đất của ${action.ownerName}!`,
        `Mua Lại (${action.buyoutCost}M)`,
        true,
        'BUYOUT'
      );
      elPropertyModal.style.display = 'flex';
    }
  } else if (action.type === 'FREE_PARKING' || action.type === 'FREE_PARKING_FESTIVAL') {
    sounds.playCardChime();
    boardScene.vfxManager.spawnStarBurst(pos, 24);
    const reward = action.reward ?? action.amount ?? 0;
    if (reward > 0) {
      boardScene.vfxManager.spawnFloatingDollar(`${reward}M (Quỹ)`, pos, true);
    }
    if (action.canSelectFestival || action.type === 'FREE_PARKING_FESTIVAL') {
      showToast(`🎪 ${player.username} đáp Bãi Đỗ Xe & chuẩn bị tổ chức Lễ Hội x2!`);
      if (isMe) {
        showFestivalModal();
      }
    } else {
      showToast(`🅿️ ${player.username} nghỉ ngơi tại Bãi Đỗ Xe!`);
    }
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
  } else if (action.type === 'AIRPORT' || action.type === 'AIRPORT_SELECT') {
    sounds.playCardChime();
    boardScene.vfxManager.spawnStarBurst(pos, 24);
    showToast(`✈️ ${player.username} đáp Sân Bay Quốc Tế!`);
    if (isMe) {
      activateAirportBoardSelection();
    }
  } else if (action.type === 'GO_TO_JAIL') {
    sounds.playJailSlam();
    boardScene.vfxManager.triggerCameraShake(0.4);
    boardScene.vfxManager.spawnFloatingText('VÀO TÙ 🔒', pos, false);
    showToast(`🔒 ${player.username} đã bị vào tù!`);
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

  const winReason = data.snapshot?.winReason || data.winReason;
  const winningDetails = data.snapshot?.winningDetails || data.winningDetails;
  const winReasonLabel =
    winReason === 'COLOR_MONOPOLY' ? '🎨 ĐỘC QUYỀN 3 NHÓM MÀU!' :
    winReason === 'LINE_MONOPOLY' ? '🛣️ ĐỘC QUYỀN 1 CẠNH BÀN CỜ!' :
    winReason === 'RAILROAD_MONOPOLY' ? '🚂 ĐỘC QUYỀN 4 NHÀ GA / BẾN XE!' :
    winReason === 'NET_WORTH' ? '⏱️ HẾT GIỜ — THẮNG THEO TỔNG TÀI SẢN!' :
    '🏆 TỶ PHÚ CUỐI CÙNG TRỤ VỮNG!';

  if (winner) {
    victoryWinnerName.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
        <span class="nameplate-frame ${winnerTierClass}" style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 14px; border-radius: 9999px; margin-top: 4px;">
          <span>👑 ${winner.username}</span>
          ${winnerBadge}
        </span>
        <span style="font-size:0.85rem;font-weight:900;color:#E17055;background:#FFF9E6;padding:4px 12px;border-radius:9999px;border:1px solid #FDCB6E;">
          ${winReasonLabel}${winningDetails ? ` — ${winningDetails}` : ''}
        </span>
      </div>
    `;
  } else {
    victoryWinnerName.textContent = 'Người Thắng';
  }

  const sorted = [...data.snapshot.players].sort((a: any, b: any) => b.netWorth - a.netWorth);
  victoryRankings.innerHTML = sorted.map((p: any, idx: number) => {
    const frameId = p.frame || 'frame_default';
    const frameClass = getFrameTierClass(frameId);
    const frameBadge = getFrameBadgeTag(frameId);
    const titleLabel = p.title ? (TITLE_LABELS[p.title] || p.title) : '';
    const isWinner = idx === 0;

    return `
      <div class="nameplate-frame ${frameClass} ${isWinner ? 'podium-winner' : ''}" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 12px; margin-bottom: 6px;">
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-weight: 900; font-size: 1.1rem; color: ${idx === 0 ? '#FDCB6E' : idx === 1 ? '#00D2D3' : idx === 2 ? '#E17055' : '#636E72'};">${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
          <img src="${p.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`}" style="width: 32px; height: 32px; border-radius: 50%; background: #EBF2FA; border: 2px solid ${p.color || '#CBD5E1'};" />
          <span style="font-weight: 800; color: #2D3436;">${p.username}</span>
          ${frameBadge}
          ${titleLabel ? `<span class="hud-player-title">${titleLabel}</span>` : ''}
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

// ====================================================
// ⏱️ MATCH TIMER, 🔨 AUCTION & 🤝 P2P TRADE
// ====================================================

function formatMatchTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function renderMatchTimerDisplay() {
  if (!elMatchTimerText || matchTimeRemainingLocal === null) return;
  elMatchTimerText.textContent = formatMatchTime(matchTimeRemainingLocal);
  if (elMatchTimerPill) {
    elMatchTimerPill.classList.toggle('is-urgent', matchTimeRemainingLocal <= 120);
  }
}

function updateMatchTimerFromSnapshot(snap: any) {
  if (typeof snap?.matchTimeRemaining !== 'number') return;
  matchTimeRemainingLocal = Math.max(0, Math.floor(snap.matchTimeRemaining));
  renderMatchTimerDisplay();

  if (matchTimerInterval === null && !snap.isGameOver) {
    matchTimerInterval = window.setInterval(() => {
      if (matchTimeRemainingLocal !== null && matchTimeRemainingLocal > 0 && !latestGameStateSnapshot?.isGameOver) {
        matchTimeRemainingLocal -= 1;
        renderMatchTimerDisplay();
      }
    }, 1000);
  }
}

function updateAuctionCountdownDisplay(endTime: number) {
  const remainingSec = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  elAuctionTimerBadge.textContent = `${remainingSec}s`;
  elAuctionTimerBadge.classList.toggle('is-urgent', remainingSec <= 4);
}

function renderAuctionModal(snap: any) {
  const auction = snap?.auctionState;
  if (!auction) return;

  const tile = boardTilesData?.[auction.tileId];
  const myId = socketClient.socket.id;
  const myPlayer = (snap.players || []).find((p: any) => p.id === myId);
  const highestBidder = (snap.players || []).find((p: any) => p.id === auction.highestBidderId);

  elAuctionTileColor.style.background = tile?.districtColor || '#00B894';
  elAuctionTileName.textContent = `${LANDMARK_ICONS[auction.tileId] || '🏛️'} ${tile?.name || `Ô #${auction.tileId}`}`;
  elAuctionTileMeta.textContent = `Giá niêm yết: ${tile?.price || 0}M • Khởi điểm: ${auction.startingBid}M`;

  elAuctionCurrentBid.textContent = auction.currentBid > 0
    ? `${auction.currentBid}M`
    : `Khởi điểm ${auction.startingBid}M`;
  elAuctionHighestBidder.textContent = highestBidder ? highestBidder.username : 'Chưa có';

  const hasPassed = Array.isArray(auction.passedPlayerIds) && auction.passedPlayerIds.includes(myId);
  const isHighestBidder = auction.highestBidderId === myId;
  const isBankrupt = Boolean(myPlayer?.isBankrupt);
  const myBalance = myPlayer?.balance ?? 0;

  if (isBankrupt) {
    elAuctionStatusNote.textContent = 'Bạn đã phá sản và không thể tham gia đấu giá.';
  } else if (isHighestBidder) {
    elAuctionStatusNote.textContent = '✅ Bạn đang là người giữ giá cao nhất!';
  } else if (hasPassed) {
    elAuctionStatusNote.textContent = 'Bạn đã bỏ qua phiên đấu giá này. Đang chờ người chơi khác...';
  } else {
    elAuctionStatusNote.textContent = `Số dư của bạn: ${myBalance}M`;
  }

  const baseForIncrement = auction.currentBid === 0 ? auction.startingBid : auction.currentBid;
  const bidMinAmount = auction.currentBid === 0 ? auction.startingBid : auction.currentBid + 10;
  const bid50Amount = baseForIncrement + 50;
  const bid100Amount = baseForIncrement + 100;

  btnAuctionBidMin.textContent = auction.currentBid === 0
    ? `Đặt ${bidMinAmount}M`
    : `+10M (${bidMinAmount}M)`;
  btnAuctionBid50.textContent = `+50M (${bid50Amount}M)`;
  btnAuctionBid100.textContent = `+100M (${bid100Amount}M)`;

  const cannotAct = isBankrupt || hasPassed || isHighestBidder;
  btnAuctionBidMin.disabled = cannotAct || myBalance < bidMinAmount;
  btnAuctionBid50.disabled = cannotAct || myBalance < bid50Amount;
  btnAuctionBid100.disabled = cannotAct || myBalance < bid100Amount;
  btnAuctionPass.disabled = cannotAct;

  btnAuctionBidMin.dataset.amount = String(bidMinAmount);
  btnAuctionBid50.dataset.amount = String(bid50Amount);
  btnAuctionBid100.dataset.amount = String(bid100Amount);

  updateAuctionCountdownDisplay(auction.endTime);
  if (auctionCountdownInterval !== null) {
    clearInterval(auctionCountdownInterval);
  }
  auctionCountdownInterval = window.setInterval(() => {
    const latestAuction = latestGameStateSnapshot?.auctionState;
    if (!latestAuction || latestGameStateSnapshot?.turnState?.phase !== 'AUCTION') {
      if (auctionCountdownInterval !== null) {
        clearInterval(auctionCountdownInterval);
        auctionCountdownInterval = null;
      }
      return;
    }
    updateAuctionCountdownDisplay(latestAuction.endTime);
  }, 250);

  elAuctionModal.style.display = 'flex';
}

function getTradablePropertiesForPlayer(playerId: string): any[] {
  const props = latestPropertiesSnapshot || latestGameStateSnapshot?.properties || [];
  return props.filter((p: any) =>
    p.ownerId === playerId &&
    !p.isMortgaged &&
    (p.houses || 0) === 0 &&
    !p.hasHotel
  );
}

function renderTradeSideProps(container: HTMLElement, playerId: string, checkboxName: string) {
  const tradable = getTradablePropertiesForPlayer(playerId);
  if (tradable.length === 0) {
    container.innerHTML = `<div style="font-size: 0.76rem; color: #94A3B8; padding: 6px 0;">Không có ô đất đủ điều kiện</div>`;
    return;
  }
  container.innerHTML = tradable.map((p: any) => {
    const tile = boardTilesData?.[p.tileId];
    const color = tile?.districtColor || '#64748B';
    return `
      <label class="trade-prop-item">
        <input type="checkbox" name="${checkboxName}" value="${p.tileId}" />
        <span class="trade-prop-dot" style="background: ${color};"></span>
        <span>${tile?.name || `Ô #${p.tileId}`} (${tile?.price || 0}M)</span>
      </label>
    `;
  }).join('');
}

function renderTradeSideCards(container: HTMLElement, player: any, prefix: string) {
  const jailCards = player?.getOutOfJailCards ?? 0;
  const waivers = player?.rentWaivers ?? 0;
  if (jailCards <= 0 && waivers <= 0) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = `
    ${jailCards > 0 ? `
      <div class="trade-card-row">
        <span>🎫 Thẻ Đặc Xá (có ${jailCards})</span>
        <input id="${prefix}-jail-cards" type="number" min="0" max="${jailCards}" value="0" />
      </div>
    ` : ''}
    ${waivers > 0 ? `
      <div class="trade-card-row">
        <span>🛡️ Thẻ Miễn Thuê (có ${waivers})</span>
        <input id="${prefix}-rent-waivers" type="number" min="0" max="${waivers}" value="0" />
      </div>
    ` : ''}
  `;
}

function renderTradeProposeFields() {
  const myId = socketClient.socket.id;
  const players = latestGameStateSnapshot?.players || latestPlayersSnapshot || [];
  const me = players.find((p: any) => p.id === myId);
  const partnerId = tradePartnerSelect.value;
  const partner = players.find((p: any) => p.id === partnerId);

  tradeOfferedCashInput.max = String(me?.balance ?? 0);
  tradeRequestedCashInput.max = String(partner?.balance ?? 0);

  renderTradeSideProps(tradeOfferedPropsEl, myId || '', 'trade-offered-tile');
  renderTradeSideCards(tradeOfferedCardsEl, me, 'trade-offered');

  if (partner) {
    renderTradeSideProps(tradeRequestedPropsEl, partner.id, 'trade-requested-tile');
    renderTradeSideCards(tradeRequestedCardsEl, partner, 'trade-requested');
  }
}

function openTradeProposeModal() {
  const myId = socketClient.socket.id;
  const players = latestGameStateSnapshot?.players || latestPlayersSnapshot || [];
  const partners = players.filter((p: any) => p.id !== myId && !p.isBankrupt);
  if (partners.length === 0) {
    showToast('Không có đối tác hợp lệ để giao dịch.');
    return;
  }

  tradePartnerSelect.innerHTML = partners
    .map((p: any) => `<option value="${p.id}">${p.username} (${p.balance}M)</option>`)
    .join('');
  tradeOfferedCashInput.value = '0';
  tradeRequestedCashInput.value = '0';
  tradeProposeErrorEl.style.display = 'none';
  renderTradeProposeFields();
  elTradeProposeModal.style.display = 'flex';
}

function formatTradeItemSummary(item: any): string {
  const parts: string[] = [];
  if ((item?.cash || 0) > 0) {
    parts.push(`<div>💵 <b>${item.cash}M</b> tiền mặt</div>`);
  }
  if ((item?.getOutOfJailCards || 0) > 0) {
    parts.push(`<div>🎫 <b>${item.getOutOfJailCards}</b> Thẻ Đặc Xá</div>`);
  }
  if ((item?.rentWaivers || 0) > 0) {
    parts.push(`<div>🛡️ <b>${item.rentWaivers}</b> Thẻ Miễn Thuê</div>`);
  }
  if (Array.isArray(item?.tileIds) && item.tileIds.length > 0) {
    const names = item.tileIds.map((id: number) => boardTilesData?.[id]?.name || `Ô #${id}`);
    parts.push(`<div>🏠 <b>${names.join(', ')}</b></div>`);
  }
  return parts.length > 0 ? parts.join('') : '<div style="color:#94A3B8;">Không có</div>';
}

function renderIncomingTradeOffer(snap: any) {
  const myId = socketClient.socket.id;
  const offers = Array.isArray(snap?.tradeOffers) ? snap.tradeOffers : [];
  const incoming = offers.find((t: any) => t.status === 'PENDING' && t.receiverId === myId);

  if (!incoming || snap?.isGameOver) {
    activeIncomingTradeId = null;
    elTradeOfferModal.style.display = 'none';
    return;
  }

  activeIncomingTradeId = incoming.id;
  const sender = (snap.players || []).find((p: any) => p.id === incoming.senderId);
  tradeOfferSubtitleEl.textContent = `${sender?.username || 'Đối thủ'} muốn trao đổi tài sản với bạn:`;
  tradeOfferReceiveEl.innerHTML = formatTradeItemSummary(incoming.offered);
  tradeOfferGiveEl.innerHTML = formatTradeItemSummary(incoming.requested);
  elTradeOfferModal.style.display = 'flex';
}

// Auction listeners
[btnAuctionBidMin, btnAuctionBid50, btnAuctionBid100].forEach((btn) => {
  btn?.addEventListener('click', () => {
    const amount = Number(btn.dataset.amount || 0);
    if (amount > 0) {
      socketClient.emit('game:auction_bid', { amount });
    }
  });
});

btnAuctionPass?.addEventListener('click', () => {
  socketClient.emit('game:auction_pass');
});

// Trade listeners
btnOpenTrade?.addEventListener('click', () => {
  openTradeProposeModal();
});

btnCloseTradePropose?.addEventListener('click', () => {
  elTradeProposeModal.style.display = 'none';
});

btnCancelTradePropose?.addEventListener('click', () => {
  elTradeProposeModal.style.display = 'none';
});

tradePartnerSelect?.addEventListener('change', () => {
  renderTradeProposeFields();
});

btnSubmitTrade?.addEventListener('click', () => {
  const receiverId = tradePartnerSelect.value;
  if (!receiverId) return;

  const offeredTileIds = Array.from(
    tradeOfferedPropsEl.querySelectorAll<HTMLInputElement>('input[name="trade-offered-tile"]:checked')
  ).map((el) => Number(el.value));

  const requestedTileIds = Array.from(
    tradeRequestedPropsEl.querySelectorAll<HTMLInputElement>('input[name="trade-requested-tile"]:checked')
  ).map((el) => Number(el.value));

  const offeredCash = Math.max(0, Math.floor(Number(tradeOfferedCashInput.value || 0)));
  const requestedCash = Math.max(0, Math.floor(Number(tradeRequestedCashInput.value || 0)));

  const offeredJailCards = Math.max(0, Math.floor(Number((document.getElementById('trade-offered-jail-cards') as HTMLInputElement | null)?.value || 0)));
  const offeredRentWaivers = Math.max(0, Math.floor(Number((document.getElementById('trade-offered-rent-waivers') as HTMLInputElement | null)?.value || 0)));
  const requestedJailCards = Math.max(0, Math.floor(Number((document.getElementById('trade-requested-jail-cards') as HTMLInputElement | null)?.value || 0)));
  const requestedRentWaivers = Math.max(0, Math.floor(Number((document.getElementById('trade-requested-rent-waivers') as HTMLInputElement | null)?.value || 0)));

  const hasAnyOffered = offeredTileIds.length > 0 || offeredCash > 0 || offeredJailCards > 0 || offeredRentWaivers > 0;
  const hasAnyRequested = requestedTileIds.length > 0 || requestedCash > 0 || requestedJailCards > 0 || requestedRentWaivers > 0;

  if (!hasAnyOffered && !hasAnyRequested) {
    tradeProposeErrorEl.textContent = 'Vui lòng chọn ít nhất một tài sản hoặc số tiền để giao dịch.';
    tradeProposeErrorEl.style.display = 'block';
    return;
  }

  socketClient.emit('game:propose_trade', {
    receiverId,
    offered: {
      tileIds: offeredTileIds,
      cash: offeredCash,
      getOutOfJailCards: offeredJailCards,
      rentWaivers: offeredRentWaivers
    },
    requested: {
      tileIds: requestedTileIds,
      cash: requestedCash,
      getOutOfJailCards: requestedJailCards,
      rentWaivers: requestedRentWaivers
    }
  });
  elTradeProposeModal.style.display = 'none';
  showToast('🤝 Đã gửi đề nghị giao dịch!');
});

btnAcceptTrade?.addEventListener('click', () => {
  if (!activeIncomingTradeId) return;
  socketClient.emit('game:accept_trade', { tradeId: activeIncomingTradeId });
  elTradeOfferModal.style.display = 'none';
  activeIncomingTradeId = null;
});

btnRejectTrade?.addEventListener('click', () => {
  if (!activeIncomingTradeId) return;
  socketClient.emit('game:reject_trade', { tradeId: activeIncomingTradeId });
  elTradeOfferModal.style.display = 'none';
  activeIncomingTradeId = null;
});

window.addEventListener('DOMContentLoaded', init);
