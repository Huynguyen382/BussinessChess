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
const btnRollDice = document.getElementById('btn-roll-dice')!;
const btnEndTurn = document.getElementById('btn-end-turn')!;
const btnToggleCamLock = document.getElementById('btn-toggle-cam-lock');
const btnToggleFollow = document.getElementById('btn-toggle-follow')!;
const btnResetCam = document.getElementById('btn-reset-cam')!;
const btnToggleLog = document.getElementById('btn-toggle-log')!;
const btnCloseLog = document.getElementById('btn-close-log')!;
const logItems = document.getElementById('log-items')!;

const propColorBar = document.getElementById('prop-color-bar')!;
const propTitle = document.getElementById('prop-title')!;
const propPrice = document.getElementById('prop-price')!;
const propDesc = document.getElementById('prop-desc')!;
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

function init() {
  const container = document.getElementById('canvas-container')!;
  boardScene = new BoardScene(container);

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

  if (btnToggleCamLock) {
    btnToggleCamLock.addEventListener('click', () => {
      const isLocked = boardScene.cameraManager.toggleLock();
      btnToggleCamLock.textContent = isLocked ? '🔒 Góc Cố Định' : '🔓 Góc Tự Do';
      btnToggleCamLock.className = isLocked ? 'btn-chunky btn-primary' : 'btn-chunky btn-white';
      showToast(isLocked ? 'Đã khóa góc nhìn Isometric chuẩn' : 'Đã mở khóa xoay tự do');
    });
  }

  btnToggleFollow.addEventListener('click', () => {
    boardScene.cameraManager.toggleFollowMode();
    btnToggleFollow.style.background = boardScene.cameraManager.isFollowMode ? '#00B894' : '#FFFFFF';
    btnToggleFollow.style.color = boardScene.cameraManager.isFollowMode ? '#FFFFFF' : '#2D3436';
  });

  btnResetCam.addEventListener('click', () => {
    boardScene.cameraManager.resetOverview();
    btnToggleFollow.style.background = '#FFFFFF';
    btnToggleFollow.style.color = '#2D3436';
  });

  btnToggleLog.addEventListener('click', () => {
    elLogDrawer.style.display = elLogDrawer.style.display === 'none' ? 'flex' : 'none';
  });

  btnCloseLog.addEventListener('click', () => {
    elLogDrawer.style.display = 'none';
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

          if (data.passedGo) {
            sounds.playCoin();
            boardScene.vfxManager.spawnFloatingText('+200M (Lương)', landingPos, true);
            boardScene.vfxManager.spawnStarBurst(landingPos, 20);
          }

          handleTileActionResult(data.actionResult, isMe, player, landingPos);
        }
      );
    });

    const token = boardScene.tokenManager.tokens.get(data.userId);
    if (token) {
      boardScene.cameraManager.setFollowTarget(token.mesh.position);
    }

    updateHudPlayers(data.snapshot);
    renderLogs(data.snapshot.logs);
  });

  socketClient.on('game:property_updated', (data: any) => {
    boardScene.updateBuilding(data.tileId, data.level);
    const tilePos = boardScene.getTileWorldPosition(data.tileId);
    boardScene.vfxManager.spawnShockwave(tilePos, '#00B894', 3.0);
    latestPlayersSnapshot = data.snapshot.players;
    updateHudPlayers(data.snapshot);
    renderLogs(data.snapshot.logs);
  });

  socketClient.on('game:state_sync', (data: any) => {
    latestPlayersSnapshot = data.snapshot.players;
    updateHudPlayers(data.snapshot);
    renderLogs(data.snapshot.logs);
    checkMyTurn(data.snapshot);
  });

  socketClient.on('game:turn_change', (data: any) => {
    latestPlayersSnapshot = data.snapshot.players;
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

function updateHudPlayers(snapshot: any) {
  const curUserId = snapshot.turnState.currentUserId;
  hudPlayers.innerHTML = snapshot.players.map((p: any) => {
    const isTurn = p.id === curUserId;
    const isMe = p.id === socketClient.socket.id;
    return `
      <div class="player-badge ${isTurn ? 'active-turn' : ''} ${p.isBankrupt ? 'bankrupt' : ''}" style="border-left: 5px solid ${p.color};">
        <img class="player-avatar" src="${p.avatar}" />
        <div class="player-info">
          <span class="player-name">${p.username} ${isMe ? '(Bạn)' : ''} ${p.inJail ? '🔒' : ''}</span>
          <span class="player-cash">${p.balance}M <small style="color: #636E72; font-weight: 600;">(TS: ${p.netWorth}M)</small></span>
        </div>
      </div>
    `;
  }).join('');
}

function checkMyTurn(snapshot: any) {
  const isMyTurn = snapshot.turnState.currentUserId === socketClient.socket.id;
  const phase = snapshot.turnState.phase;

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

function handleTileActionResult(action: any, isMe: boolean, player: any, pos: any) {
  if (!action) return;

  if (action.type === 'CAN_BUY' && isMe) {
    currentPendingTileAction = action;
    propTitle.textContent = action.tileName;
    propPrice.textContent = `Giá: ${action.cost}M`;
    propDesc.textContent = `Bạn đã dừng chân tại ô đất trống. Mua ô đất này để mở đầu cho đế chế bất động sản của bạn!`;
    btnConfirmBuy.textContent = `Mua Đất (${action.cost}M)`;
    btnConfirmBuy.style.display = action.canAfford ? 'inline-block' : 'none';
    elPropertyModal.style.display = 'flex';
  } else if (action.type === 'CAN_UPGRADE' && isMe) {
    currentPendingTileAction = action;
    propTitle.textContent = `${action.tileName} (Cấp ${action.level})`;
    propPrice.textContent = `Chi phí nâng cấp: ${action.cost}M`;
    propDesc.textContent = `Bạn sở hữu toàn bộ các ô trong khu vực! Nâng cấp nhà để tăng gấp bội tiền thuê của đối thủ.`;
    btnConfirmBuy.textContent = `Nâng Cấp (${action.cost}M)`;
    btnConfirmBuy.style.display = action.canAfford ? 'inline-block' : 'none';
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
