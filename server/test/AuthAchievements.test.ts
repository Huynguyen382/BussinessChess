import assert from 'assert';
import { dbService } from '../src/database/Database';
import { AuthService } from '../src/auth/AuthService';
import { AchievementEngine } from '../src/achievements/AchievementEngine';
import { MonopolyEngine } from '../src/game/MonopolyEngine';
import { BOARD_TILES } from '../src/game/BoardConfig';
import { RoomManager } from '../src/socket/RoomManager';

// Mock Socket and Server for Room tests
class MockSocket {
  public id: string;
  public rooms: Set<string> = new Set();
  public emittedEvents: { event: string; data: any }[] = [];

  constructor(id: string) {
    this.id = id;
  }
  join(room: string) { this.rooms.add(room); }
  leave(room: string) { this.rooms.delete(room); }
  emit(event: string, data: any) { this.emittedEvents.push({ event, data }); }
  clear() { this.emittedEvents = []; }
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
  emit(event: string, data: any) { this.broadcastedEvents.push({ event, data }); }
}

console.log('====================================================');
console.log(' RUNNING AUTH & ACHIEVEMENTS AUTOMATED TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    throw err;
  }
}

// ====================================================
// 1. Password Hashing & JWT Verification Tests
// ====================================================
console.log('--- Suite 1: Crypto & Token Security ---');

test('hashPassword creates secure salted hash and verifyPassword validates correctly', () => {
  const password = 'SuperSecretPassword123!';
  const hash = AuthService.hashPassword(password);
  assert(hash.includes(':'), 'Hash must contain salt delimiter');
  assert(AuthService.verifyPassword(password, hash), 'Correct password should verify');
  assert(!AuthService.verifyPassword('WrongPassword', hash), 'Wrong password should fail');
});

test('signJwt and verifyJwt work with valid secret and reject invalid signature or expired token', () => {
  const payload = { userId: 'usr_123', username: 'TestUser', email: 'test@example.com' };
  const token = AuthService.signJwt(payload, 3600);
  const verified = AuthService.verifyJwt<typeof payload>(token);
  assert(verified !== null, 'Token should verify');
  assert.strictEqual(verified.userId, 'usr_123');
  assert.strictEqual(verified.username, 'TestUser');

  // Tampered token test
  const tamperedToken = token.slice(0, -5) + 'abcde';
  const tamperedVerified = AuthService.verifyJwt(tamperedToken);
  assert.strictEqual(tamperedVerified, null, 'Tampered token must be rejected');

  // Expired token test
  const expiredToken = AuthService.signJwt(payload, -10);
  const expiredVerified = AuthService.verifyJwt(expiredToken);
  assert.strictEqual(expiredVerified, null, 'Expired token must be rejected');
});

// ====================================================
// 2. User Registration & Login
// ====================================================
console.log('\n--- Suite 2: Registration, Login & Session Management ---');

const uniqueSuffix = Date.now().toString(36);
const testUser = {
  username: `TyPhu_${uniqueSuffix}`,
  email: `typhu_${uniqueSuffix}@businesschess.vn`,
  password: 'Password999!'
};

let registeredToken: string = '';
let registeredUserId: string = '';

test('User registration validates fields and creates user record', () => {
  const res = AuthService.register(testUser);
  assert(res.success, `Registration failed: ${res.error}`);
  assert(res.token, 'Registration must return session token');
  assert(res.user, 'Registration must return user DTO');
  assert.strictEqual(res.user.username, testUser.username);
  assert.strictEqual(res.user.email, testUser.email);
  assert.strictEqual(res.user.goldBalance, 10000, 'New user should receive 10,000 initial gold');

  registeredToken = res.token!;
  registeredUserId = res.user.id;
});

test('Duplicate username registration is rejected', () => {
  const res = AuthService.register({
    username: testUser.username,
    email: `other_${uniqueSuffix}@businesschess.vn`,
    password: 'Password999!'
  });
  assert(!res.success, 'Duplicate username must fail');
  assert(res.error?.includes('đã có người sử dụng'));
});

test('Duplicate email registration is rejected', () => {
  const res = AuthService.register({
    username: `Other_${uniqueSuffix}`,
    email: testUser.email,
    password: 'Password999!'
  });
  assert(!res.success, 'Duplicate email must fail');
  assert(res.error?.includes('Email này đã được đăng ký'));
});

test('User login succeeds with username or email and validates password', () => {
  // Login with username
  const loginUser = AuthService.login({
    identifier: testUser.username,
    password: testUser.password
  });
  assert(loginUser.success, 'Login by username must succeed');
  assert(loginUser.token, 'Login must yield token');

  // Login with email
  const loginEmail = AuthService.login({
    identifier: testUser.email,
    password: testUser.password
  });
  assert(loginEmail.success, 'Login by email must succeed');

  // Login with wrong password
  const failLogin = AuthService.login({
    identifier: testUser.username,
    password: 'WrongPassword'
  });
  assert(!failLogin.success, 'Login with wrong password must fail');
});

test('authenticateToken validates active session and returns user info', () => {
  const user = AuthService.authenticateToken(registeredToken);
  assert(user !== null, 'Token authentication should succeed');
  assert.strictEqual(user.id, registeredUserId);
  assert.strictEqual(user.username, testUser.username);
});

test('AuthService.logout invalidates session', () => {
  const tempReg = AuthService.register({
    username: `Temp_${uniqueSuffix}`,
    email: `temp_${uniqueSuffix}@businesschess.vn`,
    password: 'Password123!'
  });
  assert(tempReg.success && tempReg.token);

  const beforeLogout = AuthService.authenticateToken(tempReg.token);
  assert(beforeLogout !== null);

  const loggedOut = AuthService.logout(tempReg.token);
  assert(loggedOut, 'Logout should remove session');

  const afterLogout = AuthService.authenticateToken(tempReg.token);
  assert.strictEqual(afterLogout, null, 'Logged out session must not authenticate');
});

// ====================================================
// 3. Achievement Catalog & Database Storage
// ====================================================
console.log('\n--- Suite 3: Achievement Catalog & Storage ---');

test('Default achievements are seeded and queryable', () => {
  const allAchievements = dbService.getAllAchievements();
  assert(allAchievements.length >= 8, 'Must have at least 8 default achievements');

  const requiredCodes = [
    'FIRST_PROPERTY',
    'MONOPOLIST',
    'RENT_BARON',
    'LANDLORD_LEGEND',
    'LUCKY_ROLLER',
    'COMEBACK_KING',
    'CLEAN_SHEET',
    'MILLIONAIRE'
  ];

  for (const code of requiredCodes) {
    const found = dbService.getAchievementByCode(code);
    assert(found !== null, `Achievement code ${code} must exist in catalog`);
    assert(found.reward_gold > 0, `Achievement ${code} must have reward gold`);
  }
});

// ====================================================
// 4. In-Game Achievement Trigger Mechanics
// ====================================================
console.log('\n--- Suite 4: In-Game Achievement Engine Triggers ---');

const testRoomCode = 'TEST_ACH';
let engine: MonopolyEngine;

function setupEngine() {
  engine = new MonopolyEngine(testRoomCode, 1500, 30);
  engine.addPlayer('p1', 's1', 'Player 1', true, 1500);
  engine.addPlayer('p2', 's2', 'Player 2', false, 1500);
  engine.startGame();
  AchievementEngine.initRoom(testRoomCode, engine.players);
  AchievementEngine.setPlayerUserId(testRoomCode, 'p1', registeredUserId);
}

test('FIRST_PROPERTY achievement triggers when player buys their first tile', () => {
  setupEngine();
  const p1 = engine.players[0];
  const tileId = 1; // Ô Phố Đi Bộ Nguyễn Huệ (price 60)

  AchievementEngine.onPropertyBought(testRoomCode, p1, tileId, 0, engine);
  const hasAch = dbService.hasAchievement(registeredUserId, 'FIRST_PROPERTY');
  assert(hasAch, 'Player should unlock FIRST_PROPERTY achievement');
});

test('MONOPOLIST achievement triggers when player owns all tiles in a district', () => {
  setupEngine();
  const p1 = engine.players[0];
  // District 1: tile 1 (Cần Thơ), tile 3 (Cà Mau)
  const districtTiles = BOARD_TILES.filter(t => t.district === 1);
  for (const t of districtTiles) {
    engine.properties.set(t.id, {
      tileId: t.id,
      ownerId: p1.id,
      level: 0,
      isMortgaged: false
    });
  }

  AchievementEngine.onPropertyBought(testRoomCode, p1, districtTiles[0].id, 0, engine);
  const hasAch = dbService.hasAchievement(registeredUserId, 'MONOPOLIST');
  assert(hasAch, 'Player should unlock MONOPOLIST achievement');
});

test('LANDLORD_LEGEND achievement triggers when upgrading to level 4 hotel', () => {
  setupEngine();
  const p1 = engine.players[0];
  AchievementEngine.onPropertyBought(testRoomCode, p1, 1, 4, engine);
  const hasAch = dbService.hasAchievement(registeredUserId, 'LANDLORD_LEGEND');
  assert(hasAch, 'Player should unlock LANDLORD_LEGEND achievement');
});

test('LUCKY_ROLLER achievement triggers on 2 consecutive doubles', () => {
  setupEngine();
  const p1 = engine.players[0];
  AchievementEngine.onDiceRolled(testRoomCode, p1, [3, 3], true, 2);
  const hasAch = dbService.hasAchievement(registeredUserId, 'LUCKY_ROLLER');
  assert(hasAch, 'Player should unlock LUCKY_ROLLER achievement');
});

test('RENT_BARON achievement triggers when cumulative collected rent reaches 500M', () => {
  setupEngine();
  const p1 = engine.players[0];
  const p2 = engine.players[1];

  AchievementEngine.onRentPaid(testRoomCode, p2, p1, 250, engine);
  assert(!dbService.hasAchievement(registeredUserId, 'RENT_BARON'), '250M rent should not trigger yet');

  AchievementEngine.onRentPaid(testRoomCode, p2, p1, 300, engine); // Total: 550M
  assert(dbService.hasAchievement(registeredUserId, 'RENT_BARON'), '550M rent should trigger RENT_BARON');
});

test('CLEAN_SHEET achievement triggers when player passes GO without paying rent', () => {
  setupEngine();
  const p1 = engine.players[0];
  AchievementEngine.onPassedGo(testRoomCode, p1, engine);
  const hasAch = dbService.hasAchievement(registeredUserId, 'CLEAN_SHEET');
  assert(hasAch, 'Player should unlock CLEAN_SHEET achievement');
});

test('MILLIONAIRE achievement triggers when player net worth reaches 5,000M', () => {
  setupEngine();
  const p1 = engine.players[0];
  p1.netWorth = 5500;
  AchievementEngine.checkWealthAchievements(testRoomCode, p1, engine);
  const hasAch = dbService.hasAchievement(registeredUserId, 'MILLIONAIRE');
  assert(hasAch, 'Player should unlock MILLIONAIRE achievement');
});

test('COMEBACK_KING achievement triggers when balance was <200M and then player wins or exceeds 2000M', () => {
  setupEngine();
  const p1 = engine.players[0];
  const tracker = AchievementEngine.getTracker(testRoomCode, p1.id);
  assert(tracker);
  tracker.lowestBalance = 150; // Dropped below 200M previously

  p1.netWorth = 2200;
  AchievementEngine.onGameOver(testRoomCode, p1, engine);
  const hasAch = dbService.hasAchievement(registeredUserId, 'COMEBACK_KING');
  assert(hasAch, 'Player should unlock COMEBACK_KING achievement');
});

// ====================================================
// 5. Claiming Achievement Rewards
// ====================================================
console.log('\n--- Suite 5: Claiming Rewards & Balance Updates ---');

test('User can claim unlocked achievement reward and receive gold', () => {
  const userBefore = dbService.getUserById(registeredUserId)!;
  const initialGold = userBefore.gold_balance;

  const claimRes = dbService.claimAchievementReward(registeredUserId, 'FIRST_PROPERTY');
  assert(claimRes.success, `Claiming reward failed: ${claimRes.error}`);
  assert(claimRes.rewardGold && claimRes.rewardGold > 0);

  const userAfter = dbService.getUserById(registeredUserId)!;
  assert.strictEqual(userAfter.gold_balance, initialGold + claimRes.rewardGold);

  // Claiming again must fail
  const claimAgain = dbService.claimAchievementReward(registeredUserId, 'FIRST_PROPERTY');
  assert(!claimAgain.success, 'Claiming already claimed reward must fail');
});

// ====================================================
// 6. Friendship System & Social Graph
// ====================================================
console.log('\n--- Suite 6: Friendship Operations & Social Graph ---');

let friendUserId: string = '';
const friendUserDto = {
  username: `BanThan_${uniqueSuffix}`,
  email: `banthan_${uniqueSuffix}@businesschess.vn`,
  password: 'Password999!'
};

test('Register a second user for friendship testing', () => {
  const res = AuthService.register(friendUserDto);
  assert(res.success, `Second user registration failed: ${res.error}`);
  friendUserId = res.user!.id;
});

test('Cannot send friend request to oneself', () => {
  const res = dbService.sendFriendRequest(registeredUserId, testUser.username);
  assert(!res.success);
  assert.strictEqual(res.error, 'Không thể tự kết bạn với chính mình');
});

test('Sending friend request to non-existent user returns error', () => {
  const res = dbService.sendFriendRequest(registeredUserId, 'non_existent_user_99999');
  assert(!res.success);
  assert.strictEqual(res.error, 'Người dùng không tồn tại');
});

let pendingRequestId: string = '';
test('Send friend request by username successfully', () => {
  const res = dbService.sendFriendRequest(registeredUserId, friendUserDto.username);
  assert(res.success, `Friend request failed: ${res.error}`);
  assert(res.request);
  assert.strictEqual(res.request.status, 'PENDING');
  pendingRequestId = res.request.id;

  // Verify list in incoming and outgoing
  const senderLists = dbService.getFriends(registeredUserId);
  assert.strictEqual(senderLists.outgoingRequests.length, 1);
  assert.strictEqual(senderLists.outgoingRequests[0].username, friendUserDto.username);

  const receiverLists = dbService.getFriends(friendUserId);
  assert.strictEqual(receiverLists.incomingRequests.length, 1);
  assert.strictEqual(receiverLists.incomingRequests[0].username, testUser.username);
});

test('Duplicate friend request is rejected', () => {
  const res = dbService.sendFriendRequest(registeredUserId, friendUserDto.email);
  assert(!res.success);
  assert.strictEqual(res.error, 'Bạn đã gửi lời mời kết bạn trước đó');
});

test('Accepting friend request creates mutual friendship', () => {
  const res = dbService.respondFriendRequest(friendUserId, pendingRequestId, 'ACCEPT');
  assert(res.success, `Accept friend request failed: ${res.error}`);

  const userFriends = dbService.getFriends(registeredUserId);
  assert.strictEqual(userFriends.friends.length, 1);
  assert.strictEqual(userFriends.friends[0].username, friendUserDto.username);
  assert.strictEqual(userFriends.outgoingRequests.length, 0);

  const friendFriends = dbService.getFriends(friendUserId);
  assert.strictEqual(friendFriends.friends.length, 1);
  assert.strictEqual(friendFriends.friends[0].username, testUser.username);
  assert.strictEqual(friendFriends.incomingRequests.length, 0);
});

test('Removing friend deletes mutual friendship', () => {
  const res = dbService.removeFriend(registeredUserId, friendUserId);
  assert(res.success);

  const userFriends = dbService.getFriends(registeredUserId);
  assert.strictEqual(userFriends.friends.length, 0);
});

// ====================================================
// 7. Room Password Protection
// ====================================================
console.log('\n--- Suite 7: Room Password Protection & Access Control ---');

test('Create protected room and verify isProtected flag in public rooms', () => {
  const io = new MockServer();
  const mgr = new RoomManager(io as any);
  const hostSocket = new MockSocket('host_socket');

  const room = mgr.createRoom(hostSocket as any, {
    name: 'Phòng VIP',
    username: 'HostVIP',
    password: 'SuperSecretRoomPassword123'
  });

  assert(room.password === 'SuperSecretRoomPassword123');

  const publicRooms = mgr.getPublicRooms();
  const found = publicRooms.find(r => r.roomCode === room.roomCode);
  assert(found, 'Protected room should be listed in public rooms when not isPrivate');
  assert.strictEqual(found.isProtected, true, 'Room must have isProtected: true');
  assert.strictEqual((found as any).password, undefined, 'Room password must NOT be leaked in public list');
});

test('Join protected room requires valid password', () => {
  const io = new MockServer();
  const mgr = new RoomManager(io as any);
  const hostSocket = new MockSocket('host_socket');
  const guestSocket = new MockSocket('guest_socket');

  const room = mgr.createRoom(hostSocket as any, {
    name: 'Phòng Có Khóa',
    username: 'Host',
    password: 'CorrectPassword'
  });

  // Attempt without password
  const resNoPw = mgr.joinRoom(guestSocket as any, {
    roomCode: room.roomCode,
    username: 'Guest'
  });
  assert(!resNoPw.success);
  assert.strictEqual(resNoPw.error, 'Mật khẩu phòng không đúng');

  // Attempt with wrong password
  const resWrongPw = mgr.joinRoom(guestSocket as any, {
    roomCode: room.roomCode,
    username: 'Guest',
    password: 'WrongPassword'
  });
  assert(!resWrongPw.success);
  assert.strictEqual(resWrongPw.error, 'Mật khẩu phòng không đúng');

  // Attempt with correct password
  const resCorrect = mgr.joinRoom(guestSocket as any, {
    roomCode: room.roomCode,
    username: 'Guest',
    password: 'CorrectPassword'
  });
  assert(resCorrect.success, `Join with correct password failed: ${resCorrect.error}`);
  assert.strictEqual(resCorrect.room?.roomCode, room.roomCode);
});

// ====================================================
// 8. 5-Tier Achievement Mastery & Nameplate Frame System
// ====================================================
console.log('\n--- Suite 8: 5-Tier Achievement Mastery & Nameplate Frames ---');

const freshUserRes = AuthService.register({
  username: `FrameTester_${uniqueSuffix}`,
  email: `frame_tester_${uniqueSuffix}@businesschess.vn`,
  password: 'Password999!'
});
const frameTestUserId = freshUserRes.user!.id;

test('All seeded achievements have valid tier (GRAY/BLUE/GOLD/ORANGE/RED) and mastery levels (1-5)', () => {
  const achievements = dbService.getAllAchievements();
  assert(achievements.length >= 10, 'Must have at least 10 seeded achievements');

  const validTiers = new Set(['GRAY', 'BLUE', 'GOLD', 'ORANGE', 'RED']);
  for (const ach of achievements) {
    assert(validTiers.has(ach.tier), `Achievement ${ach.id} must have a valid tier (found: ${ach.tier})`);
    assert(ach.level >= 1 && ach.level <= 5, `Achievement ${ach.id} level must be between 1 and 5 (found: ${ach.level})`);
    assert(ach.frame_id && ach.frame_id.startsWith('frame_'), `Achievement ${ach.id} must have valid frame_id`);
    assert(ach.frame_name && ach.frame_name.length > 0, `Achievement ${ach.id} must have valid frame_name`);
  }
});

test('getAllFrames returns all catalog frames with correct lock and equip status', () => {
  const frames = dbService.getAllFrames(frameTestUserId);
  assert(frames.length >= 11, 'Must return at least default frame + 10 achievement frames');

  const defaultFrame = frames.find(f => f.frameId === 'frame_default');
  assert(defaultFrame, 'Default frame must always exist');
  assert.strictEqual(defaultFrame.isUnlocked, true, 'Default frame must be unlocked for all players');
  assert.strictEqual(defaultFrame.tier, 'GRAY');
  assert.strictEqual(defaultFrame.level, 1);

  // Unearned achievement frames should be locked for new user
  const redFrame = frames.find(f => f.frameId === 'frame_red_millionaire');
  assert(redFrame, 'frame_red_millionaire must exist');
  assert.strictEqual(redFrame.isUnlocked, false, 'Unearned achievement frame must be locked');

  const dragonFrame = frames.find(f => f.frameId === 'frame_red_dragon');
  assert(dragonFrame, 'frame_red_dragon must exist');
  assert.strictEqual(dragonFrame.isUnlocked, false, 'Unearned dragon frame must be locked');
});

test('getUnlockedFrames initially returns only default frame for new user', () => {
  const unlocked = dbService.getUnlockedFrames(frameTestUserId);
  assert.strictEqual(unlocked.length, 1, 'New user should initially have 1 unlocked frame');
  assert.strictEqual(unlocked[0].frame_id, 'frame_default');
});

test('equipFrame rejects locked/unearned achievement frames', () => {
  const result = dbService.equipFrame(frameTestUserId, 'frame_red_dragon');
  assert(!result.success, 'Equipping locked frame must fail');
  assert(result.error && result.error.toLowerCase().includes('chưa mở khóa'), `Error message should mention chưa mở khóa: ${result.error}`);
});

test('equipFrame succeeds for frame_default and updates user state', () => {
  const result = dbService.equipFrame(frameTestUserId, 'frame_default');
  assert(result.success, `Equipping default frame failed: ${result.error}`);
  assert.strictEqual(result.equippedFrame, 'frame_default');

  const user = dbService.getUserById(frameTestUserId);
  assert.strictEqual(user?.equipped_frame, 'frame_default');
});

test('Unlocking achievement unlocks corresponding nameplate frame and allows equipping', () => {
  // Unlock FIRST_PROPERTY for user
  const unlockRes = dbService.unlockAchievement(frameTestUserId, 'FIRST_PROPERTY');
  assert(unlockRes.unlocked, 'Unlocking FIRST_PROPERTY should succeed');

  const frames = dbService.getAllFrames(frameTestUserId);
  const starterFrame = frames.find(f => f.frameId === 'frame_gray_starter');
  assert(starterFrame, 'frame_gray_starter must exist');
  assert.strictEqual(starterFrame.isUnlocked, true, 'frame_gray_starter must now be unlocked');

  // Also check getUnlockedFrames
  const unlocked = dbService.getUnlockedFrames(frameTestUserId);
  assert(unlocked.some(u => u.frame_id === 'frame_gray_starter'), 'frame_gray_starter must appear in getUnlockedFrames');

  // Now equip it
  const equipRes = dbService.equipFrame(frameTestUserId, 'frame_gray_starter');
  assert(equipRes.success, `Equipping unlocked frame failed: ${equipRes.error}`);
  assert.strictEqual(equipRes.equippedFrame, 'frame_gray_starter');

  const user = dbService.getUserById(frameTestUserId);
  assert.strictEqual(user?.equipped_frame, 'frame_gray_starter');
});

test('RoomManager propagates equipped frame to room players and bot players', () => {
  const io = new MockServer();
  const mgr = new RoomManager(io as any);
  const hostSocket = new MockSocket('frame_host_socket');

  const room = mgr.createRoom(hostSocket as any, {
    name: 'Phòng Khung Tên',
    username: 'MasterPlayer',
    userId: frameTestUserId,
    frame: 'frame_gray_starter'
  });

  assert(room.engine, 'Room must have initialized engine');
  assert.strictEqual(room.engine.players[0].frame, 'frame_gray_starter', 'Host player must have equipped frame attached');

  // Add bot player
  const botRes = mgr.addBot(hostSocket as any);
  assert(botRes.success, 'Adding bot should succeed');
  const botPlayer = room.engine.players.find(p => p.isBot);
  assert(botPlayer, 'Bot player must exist in room');
  assert(botPlayer.frame && botPlayer.frame.startsWith('frame_'), 'Bot must have a designated frame');
});

console.log('\n====================================================');
console.log(` TEST SUMMARY: ${passedTests}/${passedTests} PASSED`);
console.log(' ALL AUTH & ACHIEVEMENTS TESTS PASSED! 🚀');
console.log('====================================================\n');
