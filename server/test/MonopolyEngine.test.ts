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

    // Force non-double dice roll outcome
    // We can directly mock or trigger rollDice
    const origRandom = Math.random;
    try {
      // Return 0.1 (d1 = 1) and 0.5 (d2 = 4) => steps = 5, not double
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
      // Mock double: d1=2, d2=2 -> steps = 4
      Math.random = () => 0.2; // floor(0.2*6)+1 = 2

      const res = game.rollDice(p1.id);
      assert.equal(res.isDouble, true);
      assert.equal(res.dice[0], 2);
      assert.equal(res.dice[1], 2);
      assert.equal(game.turnState.consecutiveDoubles, 1);

      // Skip buying tile 4 (Thuế Thu Nhập or unowned property)
      if (game.turnState.phase === 'BUY_PROPERTY') {
        game.skipBuyProperty(p1.id);
      }

      // Should be allowed to roll again because of double
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
      // Always roll double 1-1
      Math.random = () => 0.05; // d1=1, d2=1

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
  // SUITE 2: Jail Stay, Bail, and Escape Mechanics
  // ----------------------------------------------------
  console.log('\n--- Suite 2: Jail Mechanics ---');

  await test('Landing on GO_TO_JAIL tile (tile 30) puts player in jail', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    p1.position = 28;

    const origRandom = Math.random;
    try {
      // Roll 1+1 = 2 -> moves to 30 (GO_TO_JAIL)
      Math.random = () => 0.05; // 1, 1
      const res = game.rollDice(p1.id);
      assert.equal(p1.inJail, true);
      assert.equal(p1.position, 10);
      assert.equal(game.turnState.phase, 'END_TURN');
      assert.equal(res.actionResult.type, 'GO_TO_JAIL');
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
      // Mock roll 1 and 2 (not double)
      let turn = 0;
      Math.random = () => {
        turn++;
        return turn % 2 === 1 ? 0.05 : 0.2; // 1 and 2
      };

      // Turn 1
      const res1 = game.rollDice(p1.id);
      assert.equal(p1.inJail, true);
      assert.equal(p1.jailTurns, 1);
      assert.equal(res1.actionResult.type, 'STAY_IN_JAIL');
      assert.equal(game.turnState.phase, 'END_TURN');
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
      // Roll 3-3 (double)
      Math.random = () => 0.4; // 3
      const res = game.rollDice(p1.id);
      assert.equal(p1.inJail, false);
      assert.equal(p1.jailTurns, 0);
      assert.equal(p1.position, 16); // 10 + 6 = 16
      // Ra tù bằng đổ đôi không được hưởng thêm lượt đổ đôi
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
  // SUITE 3: Card Effects - All 34 Vietnamese Cultural Cards
  // ----------------------------------------------------
  console.log('\n--- Suite 3: Card Effects (34 Cultural Cards) ---');

  await test('Total cards in decks match specification (17 Chance + 17 Community Chest)', () => {
    assert.equal(CHANCE_CARDS.length, 17, 'Chance deck must have 17 cards');
    assert.equal(COMMUNITY_CHEST_CARDS.length, 17, 'Community Chest deck must have 17 cards');
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
          // P1 pays each of the other 2 players
          assert.equal(p1.balance, startBalance - (card.value || 0) * 2);
          assert.equal(game.players[1].balance, 1500 + (card.value || 0));
          assert.equal(game.players[2].balance, 1500 + (card.value || 0));
          break;
        case 'REPAIR_PROPERTY':
          // Tested in dedicated building repair test below
          assert.ok(typeof p1.balance === 'number');
          break;
        case 'MOVE_STEPS':
          // In card ch_10: steps = -3
          // Starting at position 0, (0 + (-3) + 40) % 40 = 37
          assert.equal(p1.position, (0 + (card.steps || 0) + 40) % 40);
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
          // P1 collects from 2 other players
          assert.equal(p1.balance, startBalance + (card.value || 0) * 2);
          assert.equal(game.players[1].balance, 1500 - (card.value || 0));
          assert.equal(game.players[2].balance, 1500 - (card.value || 0));
          break;
        case 'REPAIR_PROPERTY':
          assert.ok(typeof p1.balance === 'number');
          break;
      }
    });
  }

  await test('REPAIR_PROPERTY card calculates exact cost for houses and hotels', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    // Setup properties: 1 property with 3 houses, 1 property with hotel (level 4)
    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 3, isMortgaged: false }); // 3 houses
    game.properties.set(3, { tileId: 3, ownerId: p1.id, level: 4, isMortgaged: false }); // 1 hotel

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

    // Expected: 3 houses * 25 + 1 hotel * 100 = 75 + 100 = 175
    assert.equal(p1.balance, startBalance - 175);
  });

  await test('Passing GO via MOVE_TO card awards 200M salary', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    p1.position = 35; // ga Hà Nội
    const startBalance = p1.balance;

    // Card moving to tile 0 (Khởi Hành) or tile 6 (Vũng Tàu - passes GO)
    const moveCard: GameCard = {
      id: 'test_pass_go',
      type: 'CHANCE',
      title: 'Về Vũng Tàu',
      description: 'Di chuyển',
      action: 'MOVE_TO',
      targetTileId: 6 // 6 < 35, passes GO
    };

    game.applyCard(p1, moveCard);
    assert.equal(p1.position, 6);
    assert.equal(p1.balance, startBalance + 200);
  });

  // ----------------------------------------------------
  // SUITE 4: Property Mortgage & Asset Liquidation Mechanics
  // ----------------------------------------------------
  console.log('\n--- Suite 4: Mortgage Mechanics ---');

  await test('mortgageProperty() grants 50% cash and flags property as mortgaged', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const tile = BOARD_TILES[1]; // Đồ Sơn, price = 60

    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 0, isMortgaged: false });
    const initialBal = p1.balance;

    const res = game.mortgageProperty(p1.id, 1);
    assert.equal(res.success, true);
    assert.equal(res.mortgageValue, 30); // 50% of 60
    assert.equal(p1.balance, initialBal + 30);
    assert.equal(game.properties.get(1)?.isMortgaged, true);
  });

  await test('Cannot mortgage property that has buildings (must sell first)', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 2, isMortgaged: false });
    const res = game.mortgageProperty(p1.id, 1);
    assert.equal(res.success, false);
    assert.ok(res.error?.includes('nhà') || res.error?.includes('công trình'));
  });

  await test('Visiting a mortgaged property charges 0 rent', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    // P1 owns tile 1 (mortgaged)
    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 0, isMortgaged: true });
    p2.position = 1;
    const p2Bal = p2.balance;

    const actionResult = game.evaluateTileAction(p2, BOARD_TILES[1], 7);
    assert.equal(actionResult.type, 'MORTGAGED_TILE');
    assert.equal(p2.balance, p2Bal); // No rent charged!
  });

  await test('Cannot upgrade properties in district if any property is mortgaged', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    // District 1 has tiles 1 and 3
    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 0, isMortgaged: true });
    game.properties.set(3, { tileId: 3, ownerId: p1.id, level: 0, isMortgaged: false });

    // Try upgrading tile 3
    const canUpgrade = game.canUpgradeProperty(p1.id, BOARD_TILES[3]);
    assert.equal(canUpgrade, false);
  });

  await test('sellBuilding() refunds 50% of house cost and decreases level', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const tile = BOARD_TILES[1]; // houseCost = 50

    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 2, isMortgaged: false });
    const initialBal = p1.balance;

    const res = game.sellBuilding(p1.id, 1);
    assert.equal(res.success, true);
    assert.equal(res.level, 1);
    assert.equal(res.refund, 25); // 50% of 50
    assert.equal(p1.balance, initialBal + 25);
  });

  await test('unmortgageProperty() charges 55% (50% principal + 10% interest)', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const tile = BOARD_TILES[1]; // price = 60 -> mortgage = 30 -> unmortgage = 30 + 3 = 33

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
    p1.balance = 20; // low cash

    // Give p1 a property with buildings: tile 1 (houseCost 50, price 60)
    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 1, isMortgaged: false });

    // Debt of 70M: cash 20 is not enough.
    // Auto mortgage will:
    // 1. Sell house (level 1 -> 0): +25M (cash becomes 45)
    // 2. Mortgage land (price 60 -> 50% = +30M): cash becomes 75M >= 70M!
    const covered = game.autoMortgageToCoverDebt(p1, 70);
    assert.equal(covered, true);
    assert.ok(p1.balance >= 70);
    assert.equal(game.properties.get(1)?.level, 0);
    assert.equal(game.properties.get(1)?.isMortgaged, true);
  });

  // ----------------------------------------------------
  // SUITE 5: Bankruptcy & Auto-Advance Mechanics
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
    const game = createGameWithPlayers(3); // p1, p2, p3
    const p1 = game.players[0];
    const p2 = game.players[1];
    const p3 = game.players[2];

    // Bankrupt P2
    p2.isBankrupt = true;

    // End P1 turn -> should jump straight to P3
    const turnResult = game.endTurn(p1.id);
    assert.equal(turnResult.nextUserId, p3.id);
    assert.equal(game.turnState.currentUserId, p3.id);
  });

  await test('Bankruptcy of opponent leads to game over and declares sole winner', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    // P2 goes bankrupt
    game.handleBankruptcy(p2, p1);

    assert.equal(game.isGameOver, true);
    assert.equal(game.winnerId, p1.id);
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
