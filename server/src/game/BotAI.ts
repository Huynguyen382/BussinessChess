import { MonopolyEngine } from './MonopolyEngine';
import { BOARD_TILES } from './BoardConfig';

export class BotAI {
  public static handleBotTurn(engine: MonopolyEngine, onAction: (actionType: string, payload?: any) => void) {
    const currentPlayer = engine.getCurrentPlayer();
    if (!currentPlayer || !currentPlayer.isBot || engine.isGameOver) return;

    const phase = engine.turnState.phase;

    if (phase === 'ROLL_DICE') {
      setTimeout(() => {
        if (engine.turnState.phase === 'ROLL_DICE' && engine.turnState.currentUserId === currentPlayer.id) {
          onAction('ROLL_DICE');
        }
      }, 1800);
    } else if (phase === 'AIRPORT_SELECT') {
      setTimeout(() => {
        if (engine.turnState.phase === 'AIRPORT_SELECT' && engine.turnState.currentUserId === currentPlayer.id) {
          const targetTileId = BotAI.chooseBestAirportDestination(engine, currentPlayer);
          onAction('AIRPORT_DESTINATION', { tileId: targetTileId });
        }
      }, 2500);
    } else if (phase === 'BUY_PROPERTY') {
      // Đợi hoạt ảnh tung xúc xắc (1.5s) + di chuyển quân cờ (tới 2.2s) hoàn tất trước khi ra quyết định mua đất
      setTimeout(() => {
        if (engine.turnState.phase === 'BUY_PROPERTY' && engine.turnState.currentUserId === currentPlayer.id) {
          const tile = BOARD_TILES[currentPlayer.position];
          const prop = engine.properties.get(tile.id);

          let shouldBuy = false;
          if (!prop) {
            // Mua đất nếu số dư sau mua còn ít nhất 200M hoặc có cơ hội gom màu
            shouldBuy = currentPlayer.balance >= tile.price + 150;
          } else if (prop.ownerId === currentPlayer.id) {
            const cost = tile.houseCost || 100;
            shouldBuy = currentPlayer.balance >= cost + 200 && prop.level < 4;
          }

          if (shouldBuy) {
            onAction('BUY_PROPERTY', { tileId: tile.id });
          } else {
            onAction('SKIP_BUY');
          }
        }
      }, 4500);
    } else if (phase === 'END_TURN') {
      // Đảm bảo hoạt ảnh quân cờ và hiệu ứng ô dừng chân trên toàn bộ client đã kết thúc hoàn toàn trước khi chuyển lượt
      setTimeout(() => {
        if (engine.turnState.phase === 'END_TURN' && engine.turnState.currentUserId === currentPlayer.id) {
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
}
