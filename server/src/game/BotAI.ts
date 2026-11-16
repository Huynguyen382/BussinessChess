import { MonopolyEngine } from './MonopolyEngine';
import { BOARD_TILES } from './BoardConfig';

export class BotAI {
  public static handleBotTurn(engine: MonopolyEngine, onAction: (actionType: string, payload?: any) => void) {
    const currentPlayer = engine.getCurrentPlayer();
    if (!currentPlayer || !currentPlayer.isBot || currentPlayer.isBankrupt || engine.isGameOver) return;

    const phase = engine.turnState.phase;

    if (phase === 'ROLL_DICE') {
      setTimeout(() => {
        if (!engine.isGameOver && !currentPlayer.isBankrupt && engine.turnState.phase === 'ROLL_DICE' && engine.turnState.currentUserId === currentPlayer.id) {
          onAction('ROLL_DICE');
        }
      }, 1800);
    } else if (phase === 'AIRPORT_SELECT') {
      setTimeout(() => {
        if (!engine.isGameOver && !currentPlayer.isBankrupt && engine.turnState.phase === 'AIRPORT_SELECT' && engine.turnState.currentUserId === currentPlayer.id) {
          const targetTileId = BotAI.chooseBestAirportDestination(engine, currentPlayer);
          onAction('AIRPORT_DESTINATION', { tileId: targetTileId });
        }
      }, 2500);
    } else if (phase === 'BUY_PROPERTY') {
      // Đợi hoạt ảnh tung xúc xắc (1.5s) + di chuyển quân cờ (tới 2.2s) hoàn tất trước khi ra quyết định mua đất
      setTimeout(() => {
        if (!engine.isGameOver && !currentPlayer.isBankrupt && engine.turnState.phase === 'BUY_PROPERTY' && engine.turnState.currentUserId === currentPlayer.id) {
          const tile = BOARD_TILES[currentPlayer.position];
          const prop = engine.properties.get(tile.id);

          let shouldBuy = false;
          let targetLevel: number | undefined = undefined;

          if (!prop) {
            if (tile.type === 'PROPERTY') {
              const houseCost = tile.houseCost || 100;
              const maxAllowed = engine.getMaxAllowedUpgradeLevel(currentPlayer, undefined, true);
              for (let lvl = maxAllowed; lvl >= 1; lvl--) {
                const totalCost = tile.price + lvl * houseCost;
                if (currentPlayer.balance >= totalCost + 200) {
                  targetLevel = lvl;
                  shouldBuy = true;
                  break;
                }
              }
              if (!shouldBuy && currentPlayer.balance >= tile.price + 150) {
                targetLevel = 0;
                shouldBuy = true;
              }
            } else if (tile.type === 'RAILROAD' || tile.type === 'UTILITY') {
              if (currentPlayer.balance >= tile.price + 150) {
                targetLevel = 0;
                shouldBuy = true;
              }
            }
          } else if (prop.ownerId === currentPlayer.id) {
            if (tile.type === 'PROPERTY' && prop.level < 4 && !prop.isMortgaged) {
              const houseCost = tile.houseCost || 100;
              const maxAllowed = engine.getMaxAllowedUpgradeLevel(currentPlayer, prop, true);
              for (let lvl = maxAllowed; lvl > prop.level; lvl--) {
                const cost = (lvl - prop.level) * houseCost;
                if (currentPlayer.balance >= cost + 200) {
                  targetLevel = lvl;
                  shouldBuy = true;
                  break;
                }
              }
            }
          }

          if (shouldBuy) {
            onAction('BUY_PROPERTY', { tileId: tile.id, targetLevel });
          } else {
            onAction('SKIP_BUY');
          }
        }
      }, 4500);
    } else if (phase === 'BUYOUT_PROPERTY') {
      setTimeout(() => {
        if (!engine.isGameOver && !currentPlayer.isBankrupt && engine.turnState.phase === 'BUYOUT_PROPERTY' && engine.turnState.currentUserId === currentPlayer.id) {
          const pending = engine.turnState.pendingBuyout;
          if (!pending) {
            onAction('SKIP_BUYOUT');
            return;
          }
          const tile = BOARD_TILES[pending.tileId];
          const prop = engine.properties.get(pending.tileId);
          let completesDistrict = false;
          if (tile?.district) {
            const districtTiles = BOARD_TILES.filter(t => t.district === tile.district && t.id !== tile.id);
            completesDistrict = districtTiles.every(t => engine.properties.get(t.id)?.ownerId === currentPlayer.id);
          }
          const shouldBuyout =
            currentPlayer.balance >= pending.cost + 150 &&
            (completesDistrict || (tile?.price || 0) >= 180 || (prop?.level || 0) >= 1);

          if (shouldBuyout) {
            onAction('BUYOUT_PROPERTY', { tileId: pending.tileId });
          } else {
            onAction('SKIP_BUYOUT');
          }
        }
      }, 2500);
    } else if (phase === 'FESTIVAL_SELECT') {
      setTimeout(() => {
        if (!engine.isGameOver && !currentPlayer.isBankrupt && engine.turnState.phase === 'FESTIVAL_SELECT' && engine.turnState.currentUserId === currentPlayer.id) {
          const targetTileId = BotAI.chooseBestFestivalTile(engine, currentPlayer);
          if (targetTileId !== null) {
            onAction('SELECT_FESTIVAL', { tileId: targetTileId });
          }
        }
      }, 2000);
    } else if (phase === 'END_TURN') {
      // Đảm bảo hoạt ảnh quân cờ và hiệu ứng ô dừng chân trên toàn bộ client đã kết thúc hoàn toàn trước khi chuyển lượt
      setTimeout(() => {
        if (!engine.isGameOver && !currentPlayer.isBankrupt && engine.turnState.phase === 'END_TURN' && engine.turnState.currentUserId === currentPlayer.id) {
          onAction('END_TURN');
        }
      }, 1500);
    }
  }

  public static chooseBestAirportDestination(engine: MonopolyEngine, player: any): number {
    const candidates: { tileId: number; score: number }[] = [];

    for (let i = 0; i < BOARD_TILES.length; i++) {
      if (i === 30) continue; // Tuyệt đối không chọn bay lại vào ô Sân Bay (ô 30)

      const tile = BOARD_TILES[i];
      if (tile.type === 'PROPERTY' || tile.type === 'RAILROAD' || tile.type === 'UTILITY') {
        const prop = engine.properties.get(i);
        if (!prop) {
          // Ô đất trống chưa có chủ
          let score = tile.price || 100;
          if (tile.type === 'PROPERTY' && tile.district) {
            const districtTiles = BOARD_TILES.filter(t => t.district === tile.district);
            const ownedInDistrict = districtTiles.filter(t => {
              const p = engine.properties.get(t.id);
              return p && p.ownerId === player.id;
            }).length;

            if (ownedInDistrict > 0) {
              score += 1000 + ownedInDistrict * 500; // Ưu tiên gom đủ bộ màu độc quyền
            }
          }
          if (player.balance >= tile.price) {
            candidates.push({ tileId: i, score });
          }
        } else if (prop.ownerId === player.id) {
          // Ô của chính bot, xem có thể nâng cấp thêm nhà/khách sạn
          const houseCost = tile.houseCost || 100;
          if (prop.level < 4 && player.balance >= houseCost + 100) {
            candidates.push({ tileId: i, score: 600 + prop.level * 100 });
          }
        }
      } else if (tile.type === 'GO') {
        // Ô Khởi Hành GO: thu 200M tiền lương an toàn
        candidates.push({ tileId: 0, score: 400 });
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      return candidates[0].tileId;
    }

    return 0; // Mặc định đáp Khởi Hành (GO)
  }

  public static chooseBestFestivalTile(engine: MonopolyEngine, player: any): number | null {
    let bestTileId: number | null = null;
    let bestRent = -1;

    for (const [tileId, prop] of engine.properties.entries()) {
      if (prop.ownerId === player.id && !prop.isMortgaged) {
        const tile = BOARD_TILES[tileId];
        if (tile && tile.type === 'PROPERTY') {
          const rent = engine.calculateRent(tile, prop);
          if (rent > bestRent) {
            bestRent = rent;
            bestTileId = tileId;
          }
        }
      }
    }

    return bestTileId;
  }

  public static handleAuctionBots(
    engine: MonopolyEngine,
    onAction: (botId: string, actionType: 'AUCTION_BID' | 'AUCTION_PASS', payload?: any) => void
  ) {
    if (engine.isGameOver || engine.turnState.phase !== 'AUCTION' || !engine.auctionState) return;
    const auction = engine.auctionState;
    const tile = BOARD_TILES[auction.tileId];
    if (!tile) return;

    const bots = engine.players.filter(
      p =>
        p.isBot &&
        !p.isBankrupt &&
        auction.highestBidderId !== p.id &&
        !auction.passedPlayerIds.includes(p.id)
    );

    for (const bot of bots) {
      const delay = 1200 + Math.floor(Math.random() * 1000);
      setTimeout(() => {
        if (
          engine.isGameOver ||
          engine.turnState.phase !== 'AUCTION' ||
          !engine.auctionState ||
          bot.isBankrupt ||
          engine.auctionState.highestBidderId === bot.id ||
          engine.auctionState.passedPlayerIds.includes(bot.id)
        ) {
          return;
        }

        const curAuction = engine.auctionState;
        const minNextBid = curAuction.currentBid === 0 ? curAuction.startingBid : curAuction.currentBid + 10;

        let multiplier = 1.15;
        if (tile.district) {
          const districtTiles = BOARD_TILES.filter(t => t.district === tile.district && t.id !== tile.id);
          const botOwnsOthers = districtTiles.every(t => engine.properties.get(t.id)?.ownerId === bot.id);
          const oppClose = districtTiles.some(t => {
            const p = engine.properties.get(t.id);
            return p && p.ownerId !== bot.id;
          });
          if (botOwnsOthers || oppClose) multiplier = 1.5;
        } else if (tile.type === 'RAILROAD') {
          const ownedRailroads = [5, 15, 25, 35].filter(id => engine.properties.get(id)?.ownerId === bot.id).length;
          if (ownedRailroads >= 2) multiplier = 1.6;
        }

        const maxWillingness = Math.min(Math.floor((tile.price || 100) * multiplier), bot.balance - 150);
        if (minNextBid <= maxWillingness && bot.balance >= minNextBid) {
          onAction(bot.id, 'AUCTION_BID', { amount: minNextBid });
        } else {
          onAction(bot.id, 'AUCTION_PASS');
        }
      }, delay);
    }
  }

  public static handleTradeBots(
    engine: MonopolyEngine,
    onAction: (botId: string, actionType: 'ACCEPT_TRADE' | 'REJECT_TRADE', tradeId: string) => void
  ) {
    if (engine.isGameOver) return;
    for (const trade of engine.tradeOffers.values()) {
      if (trade.status !== 'PENDING') continue;
      const receiver = engine.players.find(p => p.id === trade.receiverId);
      if (!receiver || !receiver.isBot || receiver.isBankrupt) continue;

      setTimeout(() => {
        if (engine.isGameOver || receiver.isBankrupt || trade.status !== 'PENDING') return;

        let offeredValue = trade.offered.cash || 0;
        for (const tid of trade.offered.tileIds) {
          offeredValue += BOARD_TILES[tid]?.price || 100;
        }
        offeredValue += (trade.offered.getOutOfJailCards || 0) * 50 + (trade.offered.rentWaivers || 0) * 80;

        let requestedValue = trade.requested.cash || 0;
        for (const tid of trade.requested.tileIds) {
          requestedValue += BOARD_TILES[tid]?.price || 100;
        }
        requestedValue += (trade.requested.getOutOfJailCards || 0) * 50 + (trade.requested.rentWaivers || 0) * 80;

        const canAfford = receiver.balance >= (trade.requested.cash || 0);
        if (canAfford && offeredValue >= requestedValue * 0.9) {
          onAction(receiver.id, 'ACCEPT_TRADE', trade.id);
        } else {
          onAction(receiver.id, 'REJECT_TRADE', trade.id);
        }
      }, 1500);
    }
  }
}
