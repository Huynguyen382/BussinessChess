import assert from 'assert';
import { dbService } from '../src/database/Database';
import { AuthService } from '../src/auth/AuthService';
import { AchievementEngine } from '../src/achievements/AchievementEngine';
import { MonopolyEngine } from '../src/game/MonopolyEngine';
import { BOARD_TILES } from '../src/game/BoardConfig';

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

console.log('\n====================================================');
console.log(` TEST SUMMARY: ${passedTests}/${passedTests} PASSED`);
console.log(' ALL AUTH & ACHIEVEMENTS TESTS PASSED! 🚀');
console.log('====================================================\n');
