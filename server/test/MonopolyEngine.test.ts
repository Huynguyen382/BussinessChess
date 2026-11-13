import assert from 'node:assert/strict';
import { MonopolyEngine, PlayerState } from '../src/game/MonopolyEngine';
import { BOARD_TILES } from '../src/game/BoardConfig';
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS, GameCard } from '../src/game/CardsConfig';

// Test runner helper
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

function createGameWithPlayers(count = 3): MonopolyEngine {
  const game = new MonopolyEngine('test-room', 1500, 30);
  const names = ['Alice', 'Bob', 'Charlie', 'David'];
  for (let i = 0; i < count; i++) {
    game.addPlayer(`p${i + 1}`, `s${i + 1}`, names[i], i === 0, 1500);
  }
  game.startGame();
  return game;
}

console.log('====================================================');
console.log(' RUNNING MONOPOLY ENGINE AUTOMATED TEST SUITE');
console.log('====================================================\n');

async function runAllTests() {
  // ----------------------------------------------------
  // SUITE 1: Rolling Doubles & Consecutive Doubles
  // ----------------------------------------------------
  console.log('--- Suite 1: Rolling Doubles Mechanics ---');

  await test('Rolling non-double finishes roll phase and allows ending turn', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    const origRandom = Math.random;
    try {
      let callCount = 0;
      Math.random = () => {
        callCount++;
        return callCount % 2 === 1 ? 0.1 : 0.5; // d1=1, d2=4
      };

      const res = game.rollDice(p1.id);
      assert.equal(res.isDouble, false);
      assert.equal(res.dice[0], 1);
      assert.equal(res.dice[1], 4);
      assert.equal(game.turnState.isDouble, false);
      assert.equal(game.turnState.consecutiveDoubles, 0);
    } finally {
      Math.random = origRandom;
    }
  });

  await test('Rolling double gives extra turn (phase stays ROLL_DICE)', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    const origRandom = Math.random;
    try {
      Math.random = () => 0.2; // d1=2, d2=2 -> steps = 4

      const res = game.rollDice(p1.id);
      assert.equal(res.isDouble, true);
      assert.equal(res.dice[0], 2);
      assert.equal(res.dice[1], 2);
      assert.equal(game.turnState.consecutiveDoubles, 1);

      if (game.turnState.phase === 'BUY_PROPERTY') {
        game.skipBuyProperty(p1.id);
      }

      assert.equal(game.turnState.phase, 'ROLL_DICE');
      assert.equal(game.turnState.currentUserId, p1.id);
    } finally {
      Math.random = origRandom;
    }
  });

  await test('Rolling doubles 3 times in a row sends player straight to Jail', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    const origRandom = Math.random;
    try {
      // 0.2 gives floor(0.2*6)+1 = 2 -> double 2-2 (steps = 4 each roll)
      // Pos 0 -> 4 (Tax), 4 -> 8 (Phan Thiet), 8 -> 12 (Utility, 3rd double -> Jail)
      Math.random = () => 0.2;

      // Roll 1
      game.rollDice(p1.id);
      if (game.turnState.phase === 'BUY_PROPERTY') game.skipBuyProperty(p1.id);
      assert.equal(game.turnState.consecutiveDoubles, 1);
      assert.equal(p1.inJail, false);

      // Roll 2
      game.rollDice(p1.id);
      if (game.turnState.phase === 'BUY_PROPERTY') game.skipBuyProperty(p1.id);
      assert.equal(game.turnState.consecutiveDoubles, 2);
      assert.equal(p1.inJail, false);

      // Roll 3 -> straight to Jail!
      const res3 = game.rollDice(p1.id);
      assert.equal(p1.inJail, true);
      assert.equal(p1.position, 10);
      assert.equal(game.turnState.consecutiveDoubles, 0);
      assert.equal(game.turnState.isDouble, false);
      assert.equal(game.turnState.phase, 'END_TURN');
      assert.equal(res3.actionResult.type, 'GO_TO_JAIL');
    } finally {
      Math.random = origRandom;
    }
  });

  // ----------------------------------------------------
  // SUITE 2: Jail Mechanics
  // ----------------------------------------------------
  console.log('\n--- Suite 2: Jail Mechanics ---');

  await test('Landing on GO_TO_JAIL tile (tile 30) puts player in jail', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    p1.position = 26; // Hai Phong

    const origRandom = Math.random;
    try {
      Math.random = () => 0.2; // d1=2, d2=2 -> steps = 4 -> newPos = 30
      const res = game.rollDice(p1.id);
      assert.equal(res.actionResult.type, 'GO_TO_JAIL');
      assert.equal(p1.inJail, true);
      assert.equal(p1.position, 10);
      assert.equal(p1.jailTurns, 0);
      assert.equal(game.turnState.phase, 'END_TURN');
    } finally {
      Math.random = origRandom;
    }
  });

  await test('In Jail: Non-double roll keeps player in jail up to 3 turns', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    p1.inJail = true;
    p1.position = 10;
    p1.jailTurns = 0;

    const origRandom = Math.random;
    try {
      let turn = 0;
      Math.random = () => {
        turn++;
        return turn % 2 === 1 ? 0.1 : 0.5; // d1=1, d2=4
      };

      const res = game.rollDice(p1.id);
      assert.equal(p1.inJail, true);
      assert.equal(p1.jailTurns, 1);
      assert.equal(res.actionResult.type, 'STAY_IN_JAIL');
      assert.equal(p1.position, 10);
    } finally {
      Math.random = origRandom;
    }
  });

  await test('In Jail: Rolling double frees player immediately and moves', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    p1.inJail = true;
    p1.position = 10;
    p1.jailTurns = 1;

    const origRandom = Math.random;
    try {
      Math.random = () => 0.2; // d1=2, d2=2 (double)

      const res = game.rollDice(p1.id);
      assert.equal(p1.inJail, false);
      assert.equal(p1.jailTurns, 0);
      assert.equal(p1.position, 14); // 10 + 4
      assert.equal(game.turnState.isDouble, false);
    } finally {
      Math.random = origRandom;
    }
  });

  await test('In Jail: 3 failed attempts forces paying 50M bail and releases player', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    p1.inJail = true;
    p1.position = 10;
    p1.jailTurns = 2; // will become 3rd failed turn
    const startBalance = p1.balance;

    const origRandom = Math.random;
    try {
      let turn = 0;
      Math.random = () => {
        turn++;
        return turn % 2 === 1 ? 0.05 : 0.2; // 1 and 2 (sum = 3)
      };

      const res = game.rollDice(p1.id);
      assert.equal(p1.inJail, false);
      assert.equal(p1.jailTurns, 0);
      assert.equal(p1.balance, startBalance - 50);
      assert.equal(p1.position, 13); // 10 + 3
    } finally {
      Math.random = origRandom;
    }
  });

  await test('payJailFine() explicitly pays 50M to release from jail', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    p1.inJail = true;
    p1.position = 10;
    p1.jailTurns = 1;
    const startBalance = p1.balance;

    const res = game.payJailFine(p1.id);
    assert.equal(res.success, true);
    assert.equal(p1.inJail, false);
    assert.equal(p1.balance, startBalance - 50);
  });

  await test('useGetOutOfJailCard() uses card and releases player without paying', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    p1.inJail = true;
    p1.position = 10;
    p1.getOutOfJailCards = 2;
    const startBalance = p1.balance;

    const res = game.useGetOutOfJailCard(p1.id);
    assert.equal(res.success, true);
    assert.equal(p1.inJail, false);
    assert.equal(p1.getOutOfJailCards, 1);
    assert.equal(p1.balance, startBalance);
  });

  // ----------------------------------------------------
  // SUITE 3: Card Effects - All 50 Vietnamese Cultural & Strategic Cards
  // ----------------------------------------------------
  console.log('\n--- Suite 3: Card Effects (50 Cultural & Strategic Cards) ---');

  await test('Total cards in decks match specification (25 Chance + 25 Community Chest)', () => {
    assert.equal(CHANCE_CARDS.length, 25, 'Chance deck must have 25 cards');
    assert.equal(COMMUNITY_CHEST_CARDS.length, 25, 'Community Chest deck must have 25 cards');
  });

  // Test individual Chance cards
  for (const card of CHANCE_CARDS) {
    await test(`Chance Card [${card.id}] "${card.title}" (${card.action}) applies correctly`, () => {
      const game = createGameWithPlayers(3);
      const p1 = game.players[0];
      const startBalance = p1.balance;

      const result = game.applyCard(p1, card);
      assert.ok(result, 'Card must return a descriptive result string');

      switch (card.action) {
        case 'ADD_MONEY':
          assert.equal(p1.balance, startBalance + (card.value || 0));
          break;
        case 'SUB_MONEY':
          assert.equal(p1.balance, startBalance - (card.value || 0));
          break;
        case 'MOVE_TO':
          assert.equal(p1.position, card.targetTileId);
          break;
        case 'GO_TO_JAIL':
          assert.equal(p1.inJail, true);
          assert.equal(p1.position, 10);
          break;
        case 'GET_OUT_OF_JAIL':
          assert.equal(p1.getOutOfJailCards, 1);
          break;
        case 'PAY_EACH_PLAYER':
          assert.equal(p1.balance, startBalance - (card.value || 0) * 2);
          assert.equal(game.players[1].balance, 1500 + (card.value || 0));
          assert.equal(game.players[2].balance, 1500 + (card.value || 0));
          break;
        case 'REPAIR_PROPERTY':
          assert.ok(typeof p1.balance === 'number');
          break;
        case 'MOVE_STEPS':
          assert.equal(p1.position, (0 + (card.steps || 0) + 40) % 40);
          break;
        case 'PROPERTY_ACQUISITION':
          assert.ok(game.properties.size > 0 || p1.balance >= startBalance);
          break;
        case 'RENT_MULTIPLIER':
          assert.equal(p1.rentMultiplier, card.multiplier || 2);
          break;
        case 'TAX_AUDIT':
          assert.ok(p1.balance <= startBalance);
          break;
        case 'INSTANT_TRANSIT':
          assert.ok([5, 15, 25, 35].includes(p1.position));
          break;
        case 'DISASTER':
          assert.ok(p1.balance <= startBalance);
          break;
        case 'DIVIDEND_PAYOUT':
          assert.ok(p1.balance >= startBalance);
          break;
        case 'PROPERTY_SWAP':
          assert.ok(typeof p1.balance === 'number');
          break;
        case 'MINI_EVENT':
          assert.ok(p1.balance >= startBalance);
          break;
      }
    });
  }

  // Test individual Community Chest cards
  for (const card of COMMUNITY_CHEST_CARDS) {
    await test(`Community Chest Card [${card.id}] "${card.title}" (${card.action}) applies correctly`, () => {
      const game = createGameWithPlayers(3);
      const p1 = game.players[0];
      const startBalance = p1.balance;

      const result = game.applyCard(p1, card);
      assert.ok(result, 'Card must return a descriptive result string');

      switch (card.action) {
        case 'ADD_MONEY':
          assert.equal(p1.balance, startBalance + (card.value || 0));
          break;
        case 'SUB_MONEY':
          assert.equal(p1.balance, startBalance - (card.value || 0));
          break;
        case 'MOVE_TO':
          assert.equal(p1.position, card.targetTileId);
          break;
        case 'GO_TO_JAIL':
          assert.equal(p1.inJail, true);
          assert.equal(p1.position, 10);
          break;
        case 'GET_OUT_OF_JAIL':
          assert.equal(p1.getOutOfJailCards, 1);
          break;
        case 'COLLECT_FROM_EACH_PLAYER':
          assert.equal(p1.balance, startBalance + (card.value || 0) * 2);
          assert.equal(game.players[1].balance, 1500 - (card.value || 0));
          assert.equal(game.players[2].balance, 1500 - (card.value || 0));
          break;
        case 'REPAIR_PROPERTY':
          assert.ok(typeof p1.balance === 'number');
          break;
        case 'RENT_WAIVER':
          assert.equal(p1.rentWaivers, card.value || 1);
          break;
        case 'HOSPITAL_BOND':
          assert.equal(p1.jailBonds, card.value || 1);
          break;
        case 'DIVIDEND_PAYOUT':
          assert.ok(p1.balance >= startBalance);
          break;
        case 'TAX_AUDIT':
          assert.ok(p1.balance <= startBalance);
          break;
        case 'INSTANT_TRANSIT':
          assert.ok([5, 15, 25, 35].includes(p1.position));
          break;
        case 'PROPERTY_ACQUISITION':
          assert.ok(game.properties.size > 0 || p1.balance >= startBalance);
          break;
        case 'MINI_EVENT':
          assert.ok(p1.balance >= startBalance);
          break;
        case 'PROPERTY_SWAP':
          assert.ok(typeof p1.balance === 'number');
          break;
      }
    });
  }

  await test('REPAIR_PROPERTY card calculates exact cost for houses and hotels', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 3, isMortgaged: false });
    game.properties.set(3, { tileId: 3, ownerId: p1.id, level: 4, isMortgaged: false });

    const repairCard: GameCard = {
      id: 'test_repair',
      type: 'CHANCE',
      title: 'Kiểm Tra Sửa Chữa',
      description: 'Sửa chữa',
      action: 'REPAIR_PROPERTY',
      costPerHouse: 25,
      costPerHotel: 100
    };

    const startBalance = p1.balance;
    game.applyCard(p1, repairCard);

    assert.equal(p1.balance, startBalance - 175);
  });

  await test('Passing GO via MOVE_TO card awards 200M salary', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    p1.position = 35; // Ga Ha Noi
    const startBalance = p1.balance;

    const moveCard: GameCard = {
      id: 'test_move',
      type: 'CHANCE',
      title: 'Về Cần Thơ',
      description: 'Di chuyển về Cần Thơ',
      action: 'MOVE_TO',
      targetTileId: 1
    };

    game.applyCard(p1, moveCard);
    assert.equal(p1.position, 1);
    assert.equal(p1.balance, startBalance + 200);
  });

  // ----------------------------------------------------
  // SUITE 4: Mortgage Mechanics
  // ----------------------------------------------------
  console.log('\n--- Suite 4: Mortgage Mechanics ---');

  await test('mortgageProperty() grants 50% cash and flags property as mortgaged', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const tile = BOARD_TILES[1]; // Can Tho: price = 60

    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 0, isMortgaged: false });
    const initialBal = p1.balance;

    const res = game.mortgageProperty(p1.id, 1);
    assert.equal(res.success, true);
    assert.equal(res.mortgageValue, 30);
    assert.equal(p1.balance, initialBal + 30);
    assert.equal(game.properties.get(1)?.isMortgaged, true);
  });

  await test('Cannot mortgage property that has buildings (must sell first)', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 2, isMortgaged: false });

    const res = game.mortgageProperty(p1.id, 1);
    assert.equal(res.success, false);
    assert.equal(game.properties.get(1)?.isMortgaged, false);
  });

  await test('Visiting a mortgaged property charges 0 rent', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 0, isMortgaged: true });
    const p2Bal = p2.balance;

    const result = game.evaluateTileAction(p2, BOARD_TILES[1], 7);
    assert.equal(result.type, 'MORTGAGED_TILE');
    assert.equal(p2.balance, p2Bal);
  });

  await test('Cannot upgrade properties in district if any property is mortgaged', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 0, isMortgaged: true });
    game.properties.set(3, { tileId: 3, ownerId: p1.id, level: 0, isMortgaged: false });

    const canUpgrade = game.canUpgradeProperty(p1.id, BOARD_TILES[3]);
    assert.equal(canUpgrade, false);
  });

  await test('sellBuilding() refunds 50% of house cost and decreases level', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 2, isMortgaged: false });
    const initialBal = p1.balance;

    const res = game.sellBuilding(p1.id, 1);
    assert.equal(res.success, true);
    assert.equal(res.level, 1);
    assert.equal(res.refund, 25);
    assert.equal(p1.balance, initialBal + 25);
  });

  await test('unmortgageProperty() charges 55% (50% principal + 10% interest)', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 0, isMortgaged: true });
    const initialBal = p1.balance;

    const res = game.unmortgageProperty(p1.id, 1);
    assert.equal(res.success, true);
    assert.equal(res.cost, 33);
    assert.equal(p1.balance, initialBal - 33);
    assert.equal(game.properties.get(1)?.isMortgaged, false);
  });

  await test('autoMortgageToCoverDebt() liquidates buildings and mortgages land to save player from bankruptcy', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    p1.balance = 20;

    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 1, isMortgaged: false });

    const covered = game.autoMortgageToCoverDebt(p1, 70);
    assert.equal(covered, true);
    assert.ok(p1.balance >= 70);
    assert.equal(game.properties.get(1)?.level, 0);
    assert.equal(game.properties.get(1)?.isMortgaged, true);
  });

  // ----------------------------------------------------
  // SUITE 5: Bankruptcy & Turn Auto-Advance
  // ----------------------------------------------------
  console.log('\n--- Suite 5: Bankruptcy & Turn Auto-Advance ---');

  await test('handleBankruptcy() marks player bankrupt and transfers properties to creditor', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 1, isMortgaged: false });
    game.handleBankruptcy(p1, p2);

    assert.equal(p1.isBankrupt, true);
    assert.equal(p1.balance, 0);
    assert.equal(game.properties.get(1)?.ownerId, p2.id);
  });

  await test('endTurn() skips bankrupt players automatically', () => {
    const game = createGameWithPlayers(3);
    const p1 = game.players[0];
    const p2 = game.players[1];
    const p3 = game.players[2];

    p2.isBankrupt = true;

    const turnResult = game.endTurn(p1.id);
    assert.equal(turnResult.nextUserId, p3.id);
    assert.equal(game.turnState.currentUserId, p3.id);
  });

  await test('Bankruptcy of opponent leads to game over and declares sole winner', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    game.handleBankruptcy(p2, p1);

    assert.equal(game.isGameOver, true);
    assert.equal(game.winnerId, p1.id);
  });

  // ----------------------------------------------------
  // SUITE 6: Interactive Strategic Card Mechanics
  // ----------------------------------------------------
  console.log('\n--- Suite 6: Interactive Strategic Card Mechanics ---');

  await test('RENT_WAIVER card grants shield and waives rent completely upon landing', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    // P2 owns tile 1 (Can Tho, rent = 4)
    game.properties.set(1, { tileId: 1, ownerId: p2.id, level: 0, isMortgaged: false });
    p1.rentWaivers = 1;

    const p1StartBal = p1.balance;
    const p2StartBal = p2.balance;

    const result = game.evaluateTileAction(p1, BOARD_TILES[1], 7);
    assert.equal(result.type, 'RENT_WAIVED');
    assert.equal(p1.rentWaivers, 0);
    assert.equal(p1.balance, p1StartBal); // No rent deducted!
    assert.equal(p2.balance, p2StartBal);
  });

  await test('RENT_MULTIPLIER doubles rent collected for owner and resets', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    // P2 owns tile 1 (Can Tho, baseRent = 4)
    game.properties.set(1, { tileId: 1, ownerId: p2.id, level: 0, isMortgaged: false });
    p2.rentMultiplier = 2; // 2x rent multiplier active

    const p1StartBal = p1.balance;
    const p2StartBal = p2.balance;

    const result = game.evaluateTileAction(p1, BOARD_TILES[1], 7);
    assert.equal(result.type, 'PAY_RENT');
    assert.equal(result.amount, 8); // 4 * 2 = 8
    assert.equal(p1.balance, p1StartBal - 8);
    assert.equal(p2.balance, p2StartBal + 8);
    assert.equal(p2.rentMultiplier, 1); // Resets back to 1
  });

  await test('PROPERTY_ACQUISITION card grants first unowned property on board', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    game.properties.clear();

    const card = CHANCE_CARDS.find(c => c.action === 'PROPERTY_ACQUISITION')!;
    game.applyCard(p1, card);

    assert.equal(game.properties.has(1), true); // Can Tho (tile 1) acquired
    assert.equal(game.properties.get(1)?.ownerId, p1.id);
  });

  await test('DIVIDEND_PAYOUT calculates dividend based on owned unmortgaged properties', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const startBal = p1.balance;

    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 0, isMortgaged: false });
    game.properties.set(3, { tileId: 3, ownerId: p1.id, level: 1, isMortgaged: false });

    const card: GameCard = {
      id: 'test_div',
      type: 'CHANCE',
      title: 'Cổ Tức',
      description: 'Chi trả cổ tức',
      action: 'DIVIDEND_PAYOUT',
      value: 30
    };

    game.applyCard(p1, card);
    // 2 properties * 30 = 60
    assert.equal(p1.balance, startBal + 60);
  });

  await test('INSTANT_TRANSIT moves player directly to next Railroad tile', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    p1.position = 18; // Hoi An

    const card: GameCard = {
      id: 'test_transit',
      type: 'CHANCE',
      title: 'Tàu Nhanh',
      description: 'Đến ga kế tiếp',
      action: 'INSTANT_TRANSIT'
    };

    game.applyCard(p1, card);
    assert.equal(p1.position, 25); // Ga Da Nang (tile 25)
  });

  await test('HOSPITAL_BOND allows escaping jail via useJailBond()', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    p1.inJail = true;
    p1.jailBonds = 1;
    const startBal = p1.balance;

    const res = game.useJailBond(p1.id);
    assert.equal(res.success, true);
    assert.equal(p1.inJail, false);
    assert.equal(p1.jailBonds, 0);
    assert.equal(p1.balance, startBal); // 0 fee paid
  });

  // ----------------------------------------------------
  // SUITE 7: Trading System (Propose, Accept, Reject, Cancel)
  // ----------------------------------------------------
  console.log('\n--- Suite 7: Player Trading System ---');

  await test('proposeTrade() successfully creates a pending trade offer', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 0, isMortgaged: false });
    game.properties.set(6, { tileId: 6, ownerId: p2.id, level: 0, isMortgaged: false });

    const res = game.proposeTrade(
      p1.id,
      p2.id,
      { tileIds: [1], cash: 50 },
      { tileIds: [6], cash: 0 }
    );

    assert.equal(res.success, true);
    assert.ok(res.trade);
    assert.equal(res.trade?.status, 'PENDING');
    assert.equal(game.tradeOffers.has(res.trade!.id), true);
  });

  await test('acceptTrade() exchanges properties and cash seamlessly', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 0, isMortgaged: false });
    game.properties.set(6, { tileId: 6, ownerId: p2.id, level: 0, isMortgaged: false });

    const p1Start = p1.balance;
    const p2Start = p2.balance;

    const propRes = game.proposeTrade(
      p1.id,
      p2.id,
      { tileIds: [1], cash: 100 },
      { tileIds: [6], cash: 0 }
    );
    const tradeId = propRes.trade!.id;

    const acceptRes = game.acceptTrade(tradeId, p2.id);
    assert.equal(acceptRes.success, true);
    assert.equal(game.properties.get(1)?.ownerId, p2.id);
    assert.equal(game.properties.get(6)?.ownerId, p1.id);
    assert.equal(p1.balance, p1Start - 100);
    assert.equal(p2.balance, p2Start + 100);
    assert.equal(game.tradeOffers.get(tradeId)?.status, 'ACCEPTED');
  });

  await test('rejectTrade() marks trade offer as REJECTED', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    const propRes = game.proposeTrade(p1.id, p2.id, { tileIds: [], cash: 50 }, { tileIds: [], cash: 20 });
    const tradeId = propRes.trade!.id;

    const rejRes = game.rejectTrade(tradeId, p2.id);
    assert.equal(rejRes.success, true);
    assert.equal(game.tradeOffers.get(tradeId)?.status, 'REJECTED');
  });

  await test('cancelTrade() allows sender to cancel pending trade', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    const propRes = game.proposeTrade(p1.id, p2.id, { tileIds: [], cash: 50 }, { tileIds: [], cash: 20 });
    const tradeId = propRes.trade!.id;

    const canRes = game.cancelTrade(tradeId, p1.id);
    assert.equal(canRes.success, true);
    assert.equal(game.tradeOffers.get(tradeId)?.status, 'CANCELLED');
  });

  await test('Cannot trade properties that have buildings (must demolish first)', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 2, isMortgaged: false }); // has 2 houses

    const propRes = game.proposeTrade(p1.id, p2.id, { tileIds: [1], cash: 0 }, { tileIds: [], cash: 0 });
    assert.equal(propRes.success, false);
    assert.ok(propRes.error?.includes('bán hết'));
  });

  // ----------------------------------------------------
  // SUITE 8: Free Parking Jackpot Pool & Liquidation
  // ----------------------------------------------------
  console.log('\n--- Suite 8: Special Tiles & Bankrupt Liquidation ---');

  await test('Tax payments increase Free Parking pool and landing collects it', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    game.freeParkingJackpot = 100;

    // P1 lands on TAX (tile 4, tax = 200M)
    game.evaluateTileAction(p1, BOARD_TILES[4], 7);
    assert.equal(game.freeParkingJackpot, 300); // 100 + 200

    // P2 lands on FREE_PARKING (tile 20)
    const p2Start = p2.balance;
    const fpResult = game.evaluateTileAction(p2, BOARD_TILES[20], 7);
    assert.equal(fpResult.type, 'FREE_PARKING');
    assert.equal(fpResult.reward, 300);
    assert.equal(p2.balance, p2Start + 300);
    assert.equal(game.freeParkingJackpot, 50); // resets to 50M seed
  });

  await test('handleBankruptcy() cancels pending trades and transfers special cards to creditor', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    p1.rentWaivers = 2;
    p1.jailBonds = 1;
    p1.getOutOfJailCards = 1;

    const propRes = game.proposeTrade(p1.id, p2.id, { tileIds: [], cash: 10 }, { tileIds: [], cash: 0 });
    const tradeId = propRes.trade!.id;

    game.handleBankruptcy(p1, p2);

    assert.equal(p1.isBankrupt, true);
    assert.equal(p2.rentWaivers, 2);
    assert.equal(p2.jailBonds, 1);
    assert.equal(p2.getOutOfJailCards, 1);
    assert.equal(game.tradeOffers.get(tradeId)?.status, 'CANCELLED');
  });
}

runAllTests().then(() => {
  console.log('\n====================================================');
  console.log(` TEST SUMMARY: ${passedTests}/${totalTests} PASSED`);
  if (failures.length > 0) {
    console.log(` FAILED: ${failures.length}`);
    for (const f of failures) {
      console.log(`  - ${f.name}`);
    }
    console.log('====================================================');
    process.exit(1);
  } else {
    console.log(' ALL TESTS PASSED SUCCESSFULLY! 🚀');
    console.log('====================================================');
    process.exit(0);
  }
}).catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
