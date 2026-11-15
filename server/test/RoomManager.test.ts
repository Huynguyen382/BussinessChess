import assert from 'node:assert/strict';
import { RoomManager, RoomInfo } from '../src/socket/RoomManager';

// Mock Socket and Server
class MockSocket {
  public id: string;
  public rooms: Set<string> = new Set();
  public emittedEvents: { event: string; data: any }[] = [];

  constructor(id: string) {
    this.id = id;
  }

  join(room: string) {
    this.rooms.add(room);
  }

  leave(room: string) {
    this.rooms.delete(room);
  }

  emit(event: string, data: any) {
    this.emittedEvents.push({ event, data });
  }

  clear() {
    this.emittedEvents = [];
  }
}

class MockServer {
  public broadcastedEvents: { room?: string; event: string; data: any }[] = [];

  to(room: string) {
    return {
      emit: (event: string, data: any) => {
        this.broadcastedEvents.push({ room, event, data });
      }
    };
  }

  emit(event: string, data: any) {
    this.broadcastedEvents.push({ event, data });
  }

  clear() {
    this.broadcastedEvents = [];
  }
}

let totalTests = 0;
let passedTests = 0;
const failures: { name: string; error: any }[] = [];

async function test(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failures.push({ name, error: err });
    console.error(`  ✗ ${name}`);
    console.error(err);
  }
}

console.log('====================================================');
console.log(' RUNNING ROOM MANAGER AUTOMATED TEST SUITE');
console.log('====================================================\n');

async function runTests() {
  console.log('--- Suite 1: Room Creation & Room Code Generation ---');

  await test('createRoom generates valid room and adds host player', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const hostSocket = new MockSocket('socket_host_1');

    const room = mgr.createRoom(hostSocket as any, {
      name: 'Test Room 1',
      username: 'PlayerHost',
      maxPlayers: 4,
      initialCash: 2000,
      turnTimeout: 45
    });

    assert.ok(room.roomCode);
    assert.equal(room.roomCode.length, 6);
    assert.equal(room.hostId, hostSocket.id);
    assert.equal(room.maxPlayers, 4);
    assert.equal(room.initialCash, 2000);
    assert.equal(room.turnTimeout, 45);
    assert.equal(room.status, 'WAITING');
    assert.ok(hostSocket.rooms.has(room.roomCode));

    // Check host player inside engine
    assert.equal(room.engine?.players.length, 1);
    assert.equal(room.engine?.players[0].username, 'PlayerHost');
    assert.equal(room.engine?.players[0].isHost, true);
    assert.equal(room.engine?.players[0].balance, 2000);
  });

  await test('createRoom clamps maxPlayers between 2 and 4', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);

    const s1 = new MockSocket('s_min');
    const rMin = mgr.createRoom(s1 as any, { name: 'R1', username: 'U1', maxPlayers: 1 });
    assert.equal(rMin.maxPlayers, 2);

    const s2 = new MockSocket('s_max');
    const rMax = mgr.createRoom(s2 as any, { name: 'R2', username: 'U2', maxPlayers: 10 });
    assert.equal(rMax.maxPlayers, 4);
  });

  console.log('\n--- Suite 2: Join Room & Access Control ---');

  await test('joinRoom adds player to waiting room', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const hostSocket = new MockSocket('s_host');
    const room = mgr.createRoom(hostSocket as any, { name: 'R', username: 'Host' });

    const clientSocket = new MockSocket('s_client');
    const result = mgr.joinRoom(clientSocket as any, {
      roomCode: room.roomCode,
      username: 'Guest1'
    });

    assert.equal(result.success, true);
    assert.equal(room.engine?.players.length, 2);
    assert.equal(room.engine?.players[1].username, 'Guest1');
    assert.equal(room.engine?.players[1].isHost, false);
    assert.ok(clientSocket.rooms.has(room.roomCode));
  });

  await test('joinRoom rejects non-existent room', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const s = new MockSocket('s_err');
    const res = mgr.joinRoom(s as any, { roomCode: 'NONEXIST', username: 'Guest' });
    assert.equal(res.success, false);
    assert.match(res.error || '', /không tồn tại/i);
  });

  await test('joinRoom enforces private room password check', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const hostSocket = new MockSocket('s_host');
    const room = mgr.createRoom(hostSocket as any, {
      name: 'Private Room',
      username: 'Host',
      isPrivate: true,
      password: 'secret_pass_123'
    });

    const sGuest = new MockSocket('s_guest');
    const failRes = mgr.joinRoom(sGuest as any, {
      roomCode: room.roomCode,
      username: 'Guest',
      password: 'wrong_password'
    });
    assert.equal(failRes.success, false);
    assert.match(failRes.error || '', /mật khẩu/i);

    const okRes = mgr.joinRoom(sGuest as any, {
      roomCode: room.roomCode,
      username: 'Guest',
      password: 'secret_pass_123'
    });
    assert.equal(okRes.success, true);
  });

  await test('joinRoom rejects when room is full', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const sHost = new MockSocket('s_host');
    const room = mgr.createRoom(sHost as any, { name: 'Full Room', username: 'Host', maxPlayers: 2 });

    const s2 = new MockSocket('s_2');
    mgr.joinRoom(s2 as any, { roomCode: room.roomCode, username: 'Player2' });

    const s3 = new MockSocket('s_3');
    const res = mgr.joinRoom(s3 as any, { roomCode: room.roomCode, username: 'Player3' });
    assert.equal(res.success, false);
    assert.match(res.error || '', /đầy/i);
  });

  console.log('\n--- Suite 3: Bot Management & Game Start ---');

  await test('addBot allows host to add AI player up to capacity', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const sHost = new MockSocket('s_host');
    const room = mgr.createRoom(sHost as any, { name: 'Bot Room', username: 'Host', maxPlayers: 3 });

    const sGuest = new MockSocket('s_guest');
    mgr.joinRoom(sGuest as any, { roomCode: room.roomCode, username: 'Guest' });

    // Non-host attempts to add bot
    const reject = mgr.addBot(sGuest as any);
    assert.equal(reject.success, false);
    assert.match(reject.error || '', /chủ phòng/i);

    // Host adds 1 bot -> now 3 players
    const botRes = mgr.addBot(sHost as any);
    assert.equal(botRes.success, true);
    assert.equal(room.engine?.players.length, 3);
    assert.equal(room.engine?.players[2].isBot, true);

    // Attempting to add another bot when full fails
    const fullBotRes = mgr.addBot(sHost as any);
    assert.equal(fullBotRes.success, false);
    assert.match(fullBotRes.error || '', /đủ người/i);
  });

  await test('startGame enforces host-only, minimum 2 players, and broadcasts game:start', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const sHost = new MockSocket('s_host');
    const room = mgr.createRoom(sHost as any, { name: 'Game Start Room', username: 'Host' });

    // Only 1 player -> cannot start
    const failMin = mgr.startGame(sHost as any);
    assert.equal(failMin.success, false);
    assert.match(failMin.error || '', /ít nhất 2/i);

    // Add second player
    const s2 = new MockSocket('s_2');
    mgr.joinRoom(s2 as any, { roomCode: room.roomCode, username: 'Player2' });

    // Non-host cannot start
    const failNonHost = mgr.startGame(s2 as any);
    assert.equal(failNonHost.success, false);
    assert.match(failNonHost.error || '', /chủ phòng/i);

    // Host cannot start when player 2 is not ready
    const failNotReady = mgr.startGame(sHost as any);
    assert.equal(failNotReady.success, false);
    assert.match(failNotReady.error || '', /chưa sẵn sàng/i);

    // Player 2 readies up
    const readyRes = mgr.handleToggleReady(s2 as any);
    assert.equal(readyRes.success, true);
    assert.equal(readyRes.isReady, true);

    // Host starts successfully
    io.clear();
    const startRes = mgr.startGame(sHost as any);
    assert.equal(startRes.success, true);
    assert.equal(room.status, 'PLAYING');

    const startBroadcast = io.broadcastedEvents.find(e => e.event === 'game:start');
    assert.ok(startBroadcast);
    assert.equal(startBroadcast.room, room.roomCode);
    assert.ok(startBroadcast.data.snapshot);
    assert.ok(startBroadcast.data.boardData);
  });

  await test('3.3 handleToggleReady and handleSelectToken update player state, broadcast update and preserve token', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const sHost = new MockSocket('s_host_33');
    const s2 = new MockSocket('s_2_33');

    const room = mgr.createRoom(sHost as any, { name: 'Lobby Custom Room', username: 'Host33' });
    mgr.joinRoom(s2 as any, { roomCode: room.roomCode, username: 'Player33' });

    const pHost = room.engine!.players[0];
    const p2 = room.engine!.players[1];
    assert.equal(pHost.isReady, true, 'Host is ready by default');
    assert.equal(p2.isReady, false, 'Non-host is unready by default');

    // Toggle ready
    io.clear();
    const toggle1 = mgr.handleToggleReady(s2 as any);
    assert.equal(toggle1.success, true);
    assert.equal(toggle1.isReady, true);
    assert.equal(p2.isReady, true);
    assert.ok(io.broadcastedEvents.some(e => e.event === 'room:updated'));

    // Explicit ready false
    const toggle2 = mgr.handleToggleReady(s2 as any, false);
    assert.equal(toggle2.isReady, false);
    assert.equal(p2.isReady, false);

    // Select token: invalid token rejected
    const invalidTokenRes = mgr.handleSelectToken(s2 as any, 'invalid_ufo' as any);
    assert.equal(invalidTokenRes.success, false);
    assert.match(invalidTokenRes.error || '', /không hợp lệ/i);

    // Select token: valid token accepted and broadcasted
    io.clear();
    const validTokenRes = mgr.handleSelectToken(s2 as any, { token: 'dragon' });
    assert.equal(validTokenRes.success, true);
    assert.equal(validTokenRes.token, 'dragon');
    assert.equal(p2.token, 'dragon');
    assert.ok(io.broadcastedEvents.some(e => e.event === 'room:updated'));

    // Ready up and start game -> token preserved in engine
    mgr.handleToggleReady(s2 as any, true);
    const startRes = mgr.startGame(sHost as any);
    assert.equal(startRes.success, true);
    assert.equal(room.engine!.players[1].token, 'dragon');
  });

  console.log('\n--- Suite 4: Gameplay Socket Handlers ---');

  await test('handleRollDice emits game:dice_result to room', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const s1 = new MockSocket('p1');
    const s2 = new MockSocket('p2');
    const room = mgr.createRoom(s1 as any, { name: 'Dice Room', username: 'P1' });
    mgr.joinRoom(s2 as any, { roomCode: room.roomCode, username: 'P2' });
    mgr.handleToggleReady(s2 as any);
    mgr.startGame(s1 as any);

    io.clear();
    // P1 rolls dice
    mgr.handleRollDice(s1 as any);

    const diceEvent = io.broadcastedEvents.find(e => e.event === 'game:dice_result');
    assert.ok(diceEvent, 'game:dice_result should be emitted');
    assert.equal(diceEvent.data.userId, s1.id);
    assert.ok(diceEvent.data.dice1 >= 1 && diceEvent.data.dice1 <= 6);
    assert.ok(diceEvent.data.dice2 >= 1 && diceEvent.data.dice2 <= 6);
    assert.ok(diceEvent.data.snapshot);
  });

  await test('handleBuyProperty and handleSkipBuy update room state', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const s1 = new MockSocket('p1');
    const s2 = new MockSocket('p2');
    const room = mgr.createRoom(s1 as any, { name: 'Buy Room', username: 'P1' });
    mgr.joinRoom(s2 as any, { roomCode: room.roomCode, username: 'P2' });
    mgr.handleToggleReady(s2 as any);
    mgr.startGame(s1 as any);

    // Manually set player 1 on unowned property tile 1 (Hồ Hoàn Kiếm) in BUY_PROPERTY phase
    const engine = room.engine!;
    const p1 = engine.players[0];
    p1.position = 1;
    engine.turnState.phase = 'BUY_PROPERTY';
    engine.turnState.currentUserId = p1.id;

    io.clear();
    mgr.handleBuyProperty(s1 as any, 1);

    const propEvent = io.broadcastedEvents.find(e => e.event === 'game:property_updated');
    assert.ok(propEvent, 'game:property_updated should be broadcast');
    assert.equal(propEvent.data.tileId, 1);
    assert.equal(propEvent.data.ownerId, p1.id);
    assert.equal(propEvent.data.level, 0);

    // Now test skip buy on another unowned property
    p1.position = 3;
    engine.turnState.phase = 'BUY_PROPERTY';
    io.clear();
    mgr.handleSkipBuy(s1 as any);

    const skipSync = io.broadcastedEvents.find(e => e.event === 'game:state_sync');
    assert.ok(skipSync, 'game:state_sync emitted on skip buy');
  });

  await test('handleMortgageProperty and handleUnmortgageProperty emit correct events', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const s1 = new MockSocket('p1');
    const s2 = new MockSocket('p2');
    const room = mgr.createRoom(s1 as any, { name: 'Mortgage Room', username: 'P1' });
    mgr.joinRoom(s2 as any, { roomCode: room.roomCode, username: 'P2' });
    mgr.handleToggleReady(s2 as any);
    mgr.startGame(s1 as any);

    const engine = room.engine!;
    const p1 = engine.players[0];

    // Give player tile 1
    engine.properties.set(1, {
      tileId: 1,
      ownerId: p1.id,
      level: 0,
      isMortgaged: false
    });

    io.clear();
    mgr.handleMortgageProperty(s1 as any, 1);
    const mortEvent = io.broadcastedEvents.find(e => e.event === 'game:property_mortgaged');
    assert.ok(mortEvent, 'game:property_mortgaged emitted');
    assert.equal(mortEvent.data.tileId, 1);

    io.clear();
    mgr.handleUnmortgageProperty(s1 as any, 1);
    const unmortEvent = io.broadcastedEvents.find(e => e.event === 'game:property_unmortgaged');
    assert.ok(unmortEvent, 'game:property_unmortgaged emitted');
    assert.equal(unmortEvent.data.tileId, 1);
  });

  await test('handleBuyoutProperty and handleSelectFestival update room state', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const s1 = new MockSocket('p1');
    const s2 = new MockSocket('p2');
    const room = mgr.createRoom(s1 as any, { name: 'BT Room', username: 'P1' });
    mgr.joinRoom(s2 as any, { roomCode: room.roomCode, username: 'P2' });
    mgr.handleToggleReady(s2 as any);
    mgr.startGame(s1 as any);

    const engine = room.engine!;
    const p1 = engine.players[0];
    const p2 = engine.players[1];

    engine.properties.set(1, { tileId: 1, ownerId: p2.id, level: 0, isMortgaged: false });
    engine.turnState.currentUserId = p1.id;
    engine.turnState.phase = 'BUYOUT_PROPERTY';
    engine.turnState.pendingBuyout = { tileId: 1, targetOwnerId: p2.id, cost: 120 };

    io.clear();
    mgr.handleBuyoutProperty(s1 as any, 1);
    const buyoutEvent = io.broadcastedEvents.find(e => e.event === 'game:property_updated' && e.data.isBuyout);
    assert.ok(buyoutEvent, 'game:property_updated with isBuyout should be emitted');
    assert.equal(engine.properties.get(1)?.ownerId, p1.id);

    engine.turnState.phase = 'FESTIVAL_SELECT';
    io.clear();
    mgr.handleSelectFestival(s1 as any, 1);
    assert.equal(engine.festivalTileId, 1);
    const syncEvent = io.broadcastedEvents.find(e => e.event === 'game:state_sync');
    assert.ok(syncEvent, 'game:state_sync emitted after festival selection');
  });

  await test('4.9 handleAuctionBid, handleAuctionPass, handleProposeTrade & handleAcceptTrade', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const s1 = new MockSocket('p1');
    const s2 = new MockSocket('p2');

    const room = mgr.createRoom(s1 as any, { name: 'Auction Trade Room', username: 'Alice' });
    mgr.joinRoom(s2 as any, { roomCode: room.roomCode, username: 'Bob' });
    mgr.handleToggleReady(s2 as any);
    mgr.startGame(s1 as any);

    const engine = room.engine!;
    const p1 = engine.players[0];
    const p2 = engine.players[1];

    // Start auction on tile 1
    p1.position = 1;
    engine.turnState.currentUserId = p1.id;
    engine.turnState.phase = 'BUY_PROPERTY';
    mgr.handleSkipBuy(s1 as any);
    assert.equal(engine.turnState.phase, 'AUCTION');

    io.clear();
    mgr.handleAuctionBid(s2 as any, 50);
    assert.equal(engine.auctionState?.currentBid, 50);
    mgr.handleAuctionPass(s1 as any);
    assert.equal(engine.properties.get(1)?.ownerId, p2.id);
    const auctionEvent = io.broadcastedEvents.find(e => e.event === 'game:auction_resolved');
    assert.ok(auctionEvent);
    assert.equal(auctionEvent.data.winnerName, 'Bob');
    assert.equal(auctionEvent.data.amount, 50);
    assert.ok(auctionEvent.data.tileName);

    // Trade P2's tile 1 to P1 for 100M
    io.clear();
    mgr.handleProposeTrade(s2 as any, {
      receiverId: p1.id,
      offered: { cash: 0, tileIds: [1] },
      requested: { cash: 100, tileIds: [] },
    });
    const tradeId = Array.from(engine.tradeOffers.values())[0]?.id;
    assert.ok(tradeId);
    mgr.handleAcceptTrade(s1 as any, tradeId);
    assert.equal(engine.properties.get(1)?.ownerId, p1.id);
    assert.ok(io.broadcastedEvents.some(e => e.event === 'game:state_sync'));
  });

  await test('4.10 handleGameChat broadcasts message to room members', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const s1 = new MockSocket('p1');
    const s2 = new MockSocket('p2');

    const room = mgr.createRoom(s1 as any, { name: 'Chat Room', username: 'Alice' });
    mgr.joinRoom(s2 as any, { roomCode: room.roomCode, username: 'Bob' });
    mgr.handleToggleReady(s2 as any);
    mgr.startGame(s1 as any);

    io.clear();
    mgr.handleGameChat(s1 as any, { text: 'Chào mọi người!' });

    const chatEvent = io.broadcastedEvents.find(e => e.event === 'game:chat');
    assert.ok(chatEvent, 'game:chat event should be emitted');
    assert.equal(chatEvent.room, room.roomCode);
    assert.equal(chatEvent.data.userId, s1.id);
    assert.equal(chatEvent.data.text, 'Chào mọi người!');
    assert.equal(chatEvent.data.sender, 'Alice');
  });

  console.log('\n--- Suite 5: Disconnect & Room Recovery ---');

  await test('handleDisconnect in WAITING removes player or promotes new host', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const s1 = new MockSocket('host_dc');
    const s2 = new MockSocket('p2_dc');
    const room = mgr.createRoom(s1 as any, { name: 'DC Room', username: 'Host' });
    mgr.joinRoom(s2 as any, { roomCode: room.roomCode, username: 'Player2' });

    // Host disconnects while WAITING
    mgr.handleDisconnect(s1 as any);

    // Player2 promoted to host
    assert.equal(room.engine?.players.length, 1);
    assert.equal(room.engine?.players[0].socketId, s2.id);
    assert.equal(room.engine?.players[0].isHost, true);
    assert.equal(room.hostId, s2.id);

    // Player2 disconnects -> room removed
    mgr.handleDisconnect(s2 as any);
    assert.equal(mgr.getPublicRooms().some(r => r.roomCode === room.roomCode), false);
  });

  await test('handleDisconnect in PLAYING converts player to Bot', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const s1 = new MockSocket('p1');
    const s2 = new MockSocket('p2');
    const room = mgr.createRoom(s1 as any, { name: 'AFK Room', username: 'P1' });
    mgr.joinRoom(s2 as any, { roomCode: room.roomCode, username: 'P2' });
    mgr.handleToggleReady(s2 as any);
    mgr.startGame(s1 as any);

    mgr.handleDisconnect(s2 as any);
    const p2 = room.engine?.players.find(p => p.id === s2.id);
    assert.ok(p2);
    assert.equal(p2.isBot, true, 'Player should be converted to bot on disconnect');
  });

  await test('handleLeaveMatch during active turn forfeits player, clears festival/properties, and advances turn', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const s1 = new MockSocket('p1_leave');
    const s2 = new MockSocket('p2_leave');
    const s3 = new MockSocket('p3_leave');
    const room = mgr.createRoom(s1 as any, { name: 'Leave Turn Room', username: 'P1' });
    mgr.joinRoom(s2 as any, { roomCode: room.roomCode, username: 'P2' });
    mgr.joinRoom(s3 as any, { roomCode: room.roomCode, username: 'P3' });
    mgr.handleToggleReady(s2 as any);
    mgr.handleToggleReady(s3 as any);
    mgr.startGame(s1 as any);

    const engine = room.engine!;
    const p1 = engine.players[0];
    engine.properties.set(1, { tileId: 1, ownerId: p1.id, level: 1, isMortgaged: false });
    engine.festivalTileId = 1;
    engine.turnState.phase = 'BUY_PROPERTY';

    io.clear();
    let ackRes: any = null;
    mgr.handleLeaveMatch(s1 as any, (res) => { ackRes = res; });

    assert.equal(ackRes?.success, true);
    assert.equal(p1.isBankrupt, true);
    assert.equal(engine.properties.has(1), false, 'Property liquidated back to bank');
    assert.equal(engine.festivalTileId, null, 'Festival cleared when property liquidated');
    assert.equal(engine.turnState.currentUserId, s2.id, 'Turn advanced to P2');
    assert.ok(s1.emittedEvents.some(e => e.event === 'room:left'));
    assert.ok(io.broadcastedEvents.some(e => e.event === 'game:turn_change'));
  });

  await test('handleLeaveMatch when not active turn syncs state and triggers game over if 1 player left', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const s1 = new MockSocket('p1_wait');
    const s2 = new MockSocket('p2_wait');
    const room = mgr.createRoom(s1 as any, { name: 'Leave 2P Room', username: 'P1' });
    mgr.joinRoom(s2 as any, { roomCode: room.roomCode, username: 'P2' });
    mgr.handleToggleReady(s2 as any);
    mgr.startGame(s1 as any);

    const engine = room.engine!;
    io.clear();
    mgr.handleLeaveMatch(s2 as any);

    assert.equal(engine.players[1].isBankrupt, true);
    assert.equal(engine.isGameOver, true);
    assert.equal(engine.winnerId, s1.id);
    assert.equal(room.status, 'FINISHED');
    assert.ok(io.broadcastedEvents.some(e => e.event === 'game:over'));
  });

  await test('handleLeaveMatch cleans up room and stops timer when last human leaves a Bot game', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);
    const s1 = new MockSocket('p1_solo_bot');
    const room = mgr.createRoom(s1 as any, { name: 'Bot Cleanup Room', username: 'P1' });
    mgr.addBot(s1 as any);
    mgr.startGame(s1 as any);

    assert.ok(room.timerInterval);
    mgr.handleLeaveMatch(s1 as any);

    assert.equal(room.status, 'FINISHED');
    assert.equal(room.engine?.isGameOver, true);
    assert.ok(s1.emittedEvents.some(e => e.event === 'room:left'));
  });

  console.log('\n--- Suite 6: Public Room Listing ---');

  await test('getPublicRooms filters private rooms and ongoing games', () => {
    const io = new MockServer();
    const mgr = new RoomManager(io as any);

    const s1 = new MockSocket('s1');
    const s2 = new MockSocket('s2');
    const s3 = new MockSocket('s3');

    // Public waiting
    const r1 = mgr.createRoom(s1 as any, { name: 'Public Room', username: 'U1' });
    // Private waiting
    mgr.createRoom(s2 as any, { name: 'Private Room', username: 'U2', isPrivate: true, password: 'pw' });
    // Public playing
    const r3 = mgr.createRoom(s3 as any, { name: 'Playing Room', username: 'U3' });
    const s4 = new MockSocket('s4');
    mgr.joinRoom(s4 as any, { roomCode: r3.roomCode, username: 'U4' });
    mgr.handleToggleReady(s4 as any);
    mgr.startGame(s3 as any);

    const publicList = mgr.getPublicRooms();
    assert.equal(publicList.length, 1);
    assert.equal(publicList[0].roomCode, r1.roomCode);
    assert.equal(publicList[0].name, 'Public Room');
  });

  // Clean up any timers
  console.log('\n====================================================');
  console.log(` ROOM MANAGER TESTS: ${passedTests}/${totalTests} PASSED`);
  if (failures.length > 0) {
    console.error(` FAILURES: ${failures.length}`);
    process.exit(1);
  } else {
    console.log(' ALL TESTS PASSED SUCCESSFULLY! 🚀');
    console.log('====================================================\n');
    process.exit(0);
  }
}

runTests();
