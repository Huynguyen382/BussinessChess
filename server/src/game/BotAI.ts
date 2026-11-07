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
      }, 1000);
    } else if (phase === 'BUY_PROPERTY') {
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
      }, 1200);
    } else if (phase === 'END_TURN') {
      setTimeout(() => {
        if (engine.turnState.phase === 'END_TURN' && engine.turnState.currentUserId === currentPlayer.id) {
          onAction('END_TURN');
        }
      }, 1000);
    }
  }
}
