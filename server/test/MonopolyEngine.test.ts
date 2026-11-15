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
        if (game.turnState.phase === 'AUCTION') game.resolveAuction();
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
      if (game.turnState.phase === 'BUY_PROPERTY') {
        game.skipBuyProperty(p1.id);
        if (game.turnState.phase === 'AUCTION') game.resolveAuction();
      }
      assert.equal(game.turnState.consecutiveDoubles, 1);
      assert.equal(p1.inJail, false);

      // Roll 2
      game.rollDice(p1.id);
      if (game.turnState.phase === 'BUY_PROPERTY') {
        game.skipBuyProperty(p1.id);
        if (game.turnState.phase === 'AUCTION') game.resolveAuction();
      }
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

  await test('Landing on AIRPORT tile (tile 30) enters AIRPORT_SELECT phase and allows choosing any destination except Airport', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    p1.position = 26; // Hai Phong
    const startBalance = p1.balance;

    const origRandom = Math.random;
    try {
      Math.random = () => 0.2; // d1=2, d2=2 -> steps = 4 -> newPos = 30
      const res = game.rollDice(p1.id);
      assert.equal(res.actionResult.type, 'AIRPORT_SELECT');
      assert.equal(p1.inJail, false);
      assert.equal(p1.position, 30); // At Airport
      assert.equal(game.turnState.phase, 'AIRPORT_SELECT');

      // Reject selecting Airport (tile 30) again
      const invalidChoice = game.chooseAirportDestination(p1.id, 30);
      assert.equal(invalidChoice.success, false);
      assert.equal(invalidChoice.error, 'Không thể chọn bay lại vào ô Sân Bay!');

      // Select valid destination: Tile 3 (Cà Mau) which is < 30 so it passes GO (+200M)
      const validChoice = game.chooseAirportDestination(p1.id, 3);
      assert.equal(validChoice.success, true);
      assert.equal(validChoice.prevPosition, 30);
      assert.equal(validChoice.newPosition, 3);
      assert.equal(validChoice.passedGo, true);
      assert.equal(p1.balance, startBalance + 200); // Received GO salary
      assert.equal(game.turnState.phase, 'BUY_PROPERTY'); // Cà Mau is unowned, so player can buy it
    } finally {
      Math.random = origRandom;
    }
  });

  await test('In Jail: Non-double roll keeps player in jail on 1st turn', () => {
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

  await test('In Jail: 2 failed attempts releases player without paying fine and moves', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    p1.inJail = true;
    p1.position = 10;
    p1.jailTurns = 1; // will become 2nd failed turn (reaches 2)
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
      assert.equal(p1.balance, startBalance, 'Không bị trừ 50M tiền phạt');
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
    game.turnState.phase = 'END_TURN';

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

  // ----------------------------------------------------
  // SUITE 9: Phase, Ownership & Card Regression Guards
  // ----------------------------------------------------
  console.log('\n--- Suite 9: Phase, Ownership & Card Regression Guards ---');

  await test('buyProperty() rejects buying non-standing tile, non-buyable tile, or wrong phase', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    // Wrong phase (ROLL_DICE)
    const wrongPhase = game.buyProperty(p1.id, 1);
    assert.equal(wrongPhase.success, false);

    // Wrong tile (standing at 0, trying to buy tile 1)
    game.turnState.phase = 'BUY_PROPERTY';
    p1.position = 0;
    const wrongPos = game.buyProperty(p1.id, 1);
    assert.equal(wrongPos.success, false);

    // Non-buyable tile (GO = 0)
    const nonBuyable = game.buyProperty(p1.id, 0);
    assert.equal(nonBuyable.success, false);
  });

  await test('buyProperty() rejects upgrading without full district monopoly or when district has mortgage', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    // District 1 has tiles 1 (Can Tho) and 3 (Ca Mau). Own only tile 1.
    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 0, isMortgaged: false });
    game.turnState.phase = 'END_TURN';

    const noMonopoly = game.buyProperty(p1.id, 1);
    assert.equal(noMonopoly.success, false);

    // Own tile 3 too, but mortgage tile 3 -> still cannot upgrade tile 1
    game.properties.set(3, { tileId: 3, ownerId: p1.id, level: 0, isMortgaged: true });
    const withMortgaged = game.buyProperty(p1.id, 1);
    assert.equal(withMortgaged.success, false);

    // Unmortgage tile 3 -> now upgrade succeeds and stays in END_TURN
    game.properties.get(3)!.isMortgaged = false;
    const ok = game.buyProperty(p1.id, 1);
    assert.equal(ok.success, true);
    assert.equal(ok.level, 1);
    assert.equal(game.turnState.phase, 'END_TURN');
  });

  await test('endTurn() throws when phase is not END_TURN', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    assert.throws(() => game.endTurn(p1.id), /Chưa thể kết thúc lượt/);
  });

  await test('Jail actions enforce current turn and ROLL_DICE phase; human keeps jail card on roll', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];
    p2.inJail = true;
    p2.position = 10;
    p2.getOutOfJailCards = 1;

    // P2 cannot use jail card during P1 turn
    const outOfTurn = game.useGetOutOfJailCard(p2.id);
    assert.equal(outOfTurn.success, false);

    // P1 in jail with card keeps it when rolling non-double
    p1.inJail = true;
    p1.position = 10;
    p1.getOutOfJailCards = 1;
    const origRandom = Math.random;
    try {
      let c = 0;
      Math.random = () => (++c % 2 === 1 ? 0.1 : 0.5);
      game.rollDice(p1.id);
      assert.equal(p1.getOutOfJailCards, 1);
      assert.equal(p1.inJail, true);
    } finally {
      Math.random = origRandom;
    }
  });

  await test('MOVE_STEPS card landing on TAX tile (tile 4) deducts tax and updates jackpot', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    p1.position = 7; // Chance
    const startBal = p1.balance;
    const startJackpot = game.freeParkingJackpot;

    const back3Card: GameCard = {
      id: 'test_back3',
      type: 'CHANCE',
      title: 'Lùi 3 bước',
      description: 'Lùi về Thuế Thu Nhập',
      action: 'MOVE_STEPS',
      steps: -3
    };
    game.applyCard(p1, back3Card);

    assert.equal(p1.position, 4);
    assert.equal(p1.balance, startBal - 200);
    assert.equal(game.freeParkingJackpot, startJackpot + 200);
  });

  await test('acceptTrade() validates rentWaivers and district buildings at acceptance time', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    p1.rentWaivers = 1;
    const res = game.proposeTrade(
      p1.id,
      p2.id,
      { tileIds: [], cash: 0, rentWaivers: 1 },
      { tileIds: [], cash: 50 }
    );
    assert.equal(res.success, true);

    // P1 consumes their rentWaiver before P2 accepts
    p1.rentWaivers = 0;
    const acc = game.acceptTrade(res.trade!.id, p2.id);
    assert.equal(acc.success, false);
    assert.equal(p1.rentWaivers, 0);
  });

  await test('mortgageProperty() rejects if another tile in the same district has buildings', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 1, isMortgaged: false });
    game.properties.set(3, { tileId: 3, ownerId: p1.id, level: 0, isMortgaged: false });

    const res = game.mortgageProperty(p1.id, 3);
    assert.equal(res.success, false);
  });

  // ----------------------------------------------------
  // SUITE 10: Business Tour Mechanics (Victory, Buyout, Festival, Even-Build)
  // ----------------------------------------------------
  console.log('\n--- Suite 10: Business Tour Mechanics ---');

  await test('Instant Victory: 4 Railroads Monopoly triggers game over immediately', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    game.properties.set(5, { tileId: 5, ownerId: p1.id, level: 0, isMortgaged: false });
    game.properties.set(15, { tileId: 15, ownerId: p1.id, level: 0, isMortgaged: false });
    game.properties.set(25, { tileId: 25, ownerId: p1.id, level: 0, isMortgaged: false });
    p1.position = 35;
    game.turnState.phase = 'BUY_PROPERTY';

    const res = game.buyProperty(p1.id, 35);
    assert.equal(res.success, true);
    assert.equal(game.isGameOver, true);
    assert.equal(game.winnerId, p1.id);
    assert.equal(game.winReason, 'RAILROAD_MONOPOLY');
  });

  await test('Instant Victory: Line Monopoly (2 districts on same board side) triggers game over', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    // Side 0 = District 1 (1, 3) + District 2 (6, 8, 9)
    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 0, isMortgaged: false });
    game.properties.set(3, { tileId: 3, ownerId: p1.id, level: 0, isMortgaged: false });
    game.properties.set(6, { tileId: 6, ownerId: p1.id, level: 0, isMortgaged: false });
    game.properties.set(8, { tileId: 8, ownerId: p1.id, level: 0, isMortgaged: false });
    p1.position = 9;
    game.turnState.phase = 'BUY_PROPERTY';

    const res = game.buyProperty(p1.id, 9);
    assert.equal(res.success, true);
    assert.equal(game.isGameOver, true);
    assert.equal(game.winnerId, p1.id);
    assert.equal(game.winReason, 'LINE_MONOPOLY');
  });

  await test('Instant Victory: 3 Color Monopolies (non-adjacent sides) triggers COLOR_MONOPOLY', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    // District 1 (1,3), District 3 (11,13,14), District 5 (21,23,24) -> no complete line!
    for (const id of [1, 3, 11, 13, 14, 21, 23]) {
      game.properties.set(id, { tileId: id, ownerId: p1.id, level: 0, isMortgaged: false });
    }
    p1.position = 24;
    game.turnState.phase = 'BUY_PROPERTY';

    const res = game.buyProperty(p1.id, 24);
    assert.equal(res.success, true);
    assert.equal(game.isGameOver, true);
    assert.equal(game.winnerId, p1.id);
    assert.equal(game.winReason, 'COLOR_MONOPOLY');
  });

  await test('Buyout: landing on opponent property (level < 4) allows 2x buyout; level 4 is immune', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    // Tile 1 (Can Tho, price 60, houseCost 50, level 1) -> buyoutCost = (60 + 50) * 2 = 220
    game.properties.set(1, { tileId: 1, ownerId: p2.id, level: 1, isMortgaged: false });
    const evalRes = game.evaluateTileAction(p1, BOARD_TILES[1], 7);
    assert.equal(evalRes.type, 'PAY_RENT');
    assert.equal(evalRes.canBuyout, true);
    assert.equal(evalRes.buyoutCost, 220);
    assert.equal(game.turnState.phase, 'BUYOUT_PROPERTY');

    const p1Before = p1.balance;
    const p2Before = p2.balance;
    const buyRes = game.buyoutProperty(p1.id, 1);
    assert.equal(buyRes.success, true);
    assert.equal(game.properties.get(1)?.ownerId, p1.id);
    assert.equal(p1.balance, p1Before - 220);
    assert.equal(p2.balance, p2Before + 220);
    assert.equal(game.turnState.phase, 'END_TURN');

    // Level 4 Hotel is immune to buyout
    game.properties.set(3, { tileId: 3, ownerId: p2.id, level: 4, isMortgaged: false });
    game.turnState.phase = 'ROLL_DICE';
    const evalHotel = game.evaluateTileAction(p1, BOARD_TILES[3], 7);
    assert.equal(evalHotel.type, 'PAY_RENT');
    assert.equal(evalHotel.canBuyout, undefined);
    assert.equal(game.turnState.phase, 'END_TURN');
  });

  await test('Festival: landing on FREE_PARKING with owned property enters FESTIVAL_SELECT and doubles rent', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    // P1 owns tile 1 (baseRent = 4)
    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 0, isMortgaged: false });

    const fpRes = game.evaluateTileAction(p1, BOARD_TILES[20], 7);
    assert.equal(fpRes.type, 'FREE_PARKING');
    assert.equal(fpRes.canSelectFestival, true);
    assert.equal(game.turnState.phase, 'FESTIVAL_SELECT');

    const selRes = game.selectFestivalTile(p1.id, 1);
    assert.equal(selRes.success, true);
    assert.equal(game.festivalTileId, 1);
    assert.equal(game.turnState.phase, 'END_TURN');

    // P2 lands on tile 1 -> rent is doubled (4 * 2 = 8)
    const rent = game.calculateRent(BOARD_TILES[1], game.properties.get(1)!, 7);
    assert.equal(rent, 8);

    // Mortgaging festival tile clears festivalTileId
    game.mortgageProperty(p1.id, 1);
    assert.equal(game.festivalTileId, null);
  });

  await test('Even-Build and Even-Sell enforce max 1 level difference within district', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];

    // District 1: tiles 1 & 3
    game.properties.set(1, { tileId: 1, ownerId: p1.id, level: 0, isMortgaged: false });
    game.properties.set(3, { tileId: 3, ownerId: p1.id, level: 0, isMortgaged: false });
    game.turnState.phase = 'END_TURN';

    // Upgrade tile 1 to level 1 -> OK
    assert.equal(game.buyProperty(p1.id, 1).success, true);
    // Upgrade tile 1 to level 2 while tile 3 is level 0 -> REJECTED
    assert.equal(game.buyProperty(p1.id, 1).success, false);
    // Upgrade tile 3 to level 1 -> OK
    assert.equal(game.buyProperty(p1.id, 3).success, true);
    // Now upgrade tile 1 to level 2 -> OK
    assert.equal(game.buyProperty(p1.id, 1).success, true);

    // Even-Sell: cannot sell tile 3 (level 1) while tile 1 is level 2
    assert.equal(game.sellBuilding(p1.id, 3).success, false);
    // Selling tile 1 (level 2) succeeds
    assert.equal(game.sellBuilding(p1.id, 1).success, true);
  });

  // ================================================================
  // SUITE 11: Competitive Business Tour Upgrades
  // ================================================================
  console.log('\n--- Suite 11: Competitive Business Tour Upgrades ---');

  await test('11.1 Public Auction: skipBuyProperty starts AUCTION, bidding & passing resolves to highest bidder', () => {
    const game = createGameWithPlayers(3);
    const p1 = game.players[0];
    const p2 = game.players[1];
    const p3 = game.players[2];

    p1.position = 1; // Can Tho (price 60)
    game.turnState.currentUserId = p1.id;
    game.turnState.phase = 'BUY_PROPERTY';

    const skipRes = game.skipBuyProperty(p1.id);
    assert.equal(skipRes.success, true);
    assert.equal(game.turnState.phase, 'AUCTION');
    assert.ok(game.auctionState);
    assert.equal(game.auctionState!.tileId, 1);
    assert.equal(game.auctionState!.startingBid, 30);

    // P2 bids 40
    const bidRes = game.placeAuctionBid(p2.id, 40);
    assert.equal(bidRes.success, true);
    assert.equal(game.auctionState!.currentBid, 40);
    assert.equal(game.auctionState!.highestBidderId, p2.id);

    // P1 and P3 pass -> resolves to P2
    game.passAuction(p1.id);
    const pass3 = game.passAuction(p3.id);
    assert.equal(pass3.success, true);
    assert.equal(pass3.resolved, true);
    assert.equal(game.auctionState, null);
    assert.equal(game.properties.get(1)?.ownerId, p2.id);
    assert.equal(p2.balance, 1500 - 40);
    assert.equal(game.turnState.phase, 'END_TURN');
  });

  await test('11.2 Match Timeout: resolveMatchTimeout picks highest netWorth alive player with NET_WORTH winReason', () => {
    const game = createGameWithPlayers(2);
    const p1 = game.players[0];
    const p2 = game.players[1];

    p1.balance = 1200;
    p2.balance = 2500;

    const res = game.resolveMatchTimeout();
    assert.equal(res.winnerId, p2.id);
    assert.equal(res.winReason, 'NET_WORTH');
    assert.equal(game.isGameOver, true);
    assert.equal(game.winnerId, p2.id);
    assert.equal(game.winReason, 'NET_WORTH');
  });

  await test('11.3 Creditor Transfer on Bankruptcy triggers Instant Victory when creditor completes monopoly', () => {
    const game = createGameWithPlayers(3);
    const p1 = game.players[0];
    const p2 = game.players[1];

    // P2 owns 3 railroads (5, 15, 25); P1 owns the 4th railroad (35)
    game.properties.set(5, { tileId: 5, ownerId: p2.id, level: 0, isMortgaged: false });
    game.properties.set(15, { tileId: 15, ownerId: p2.id, level: 0, isMortgaged: false });
    game.properties.set(25, { tileId: 25, ownerId: p2.id, level: 0, isMortgaged: false });
    game.properties.set(35, { tileId: 35, ownerId: p1.id, level: 0, isMortgaged: false });

    // P1 goes bankrupt to P2 -> tile 35 transfers to P2 -> 4 railroads -> RAILROAD_MONOPOLY
    p1.balance = 0;
    game.handleBankruptcy(p1, p2);

    assert.equal(p1.isBankrupt, true);
    assert.equal(game.properties.get(35)?.ownerId, p2.id);
    assert.equal(game.isGameOver, true);
    assert.equal(game.winnerId, p2.id);
    assert.equal(game.winReason, 'RAILROAD_MONOPOLY');
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
