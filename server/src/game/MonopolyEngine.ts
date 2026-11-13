import { BOARD_TILES, BoardTile } from './BoardConfig';
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS, GameCard } from './CardsConfig';

export type TokenType = 'car' | 'hat' | 'dog' | 'rocket';

export interface PlayerState {
  id: string;
  socketId: string;
  username: string;
  avatar: string;
  token: TokenType;
  color: string;
  balance: number;
  position: number;
  inJail: boolean;
  jailTurns: number;
  getOutOfJailCards: number;
  rentWaivers: number;
  rentMultiplier: number;
  jailBonds: number;
  isBankrupt: boolean;
  isBot: boolean;
  isHost: boolean;
  netWorth: number;
}

export interface PropertyState {
  tileId: number;
  ownerId: string;
  level: number; // 0: Đất trống, 1-3: Nhà 1-3, 4: Khách sạn / Landmark
  isMortgaged: boolean;
}

export interface TurnState {
  currentUserId: string;
  phase: 'ROLL_DICE' | 'TILE_ACTION' | 'BUY_PROPERTY' | 'END_TURN';
  dice: [number, number];
  isDouble: boolean;
  consecutiveDoubles: number;
  turnStartTime: number;
  turnTimeout: number; // seconds
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  userId?: string;
  userName?: string;
  message: string;
  type: 'INFO' | 'ACTION' | 'MONEY' | 'ALERT' | 'JAIL';
}

export interface TradeItem {
  tileIds: number[];
  cash: number;
  getOutOfJailCards?: number;
  rentWaivers?: number;
}

export interface TradeOffer {
  id: string;
  senderId: string;
  receiverId: string;
  offered: TradeItem;
  requested: TradeItem;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: number;
}

export class MonopolyEngine {
  public roomId: string;
  public players: PlayerState[] = [];
  public properties: Map<number, PropertyState> = new Map();
  public turnState: TurnState;
  public logs: GameLogEntry[] = [];
  public isGameOver: boolean = false;
  public winnerId: string | null = null;
  public chanceDeck: GameCard[] = [...CHANCE_CARDS];
  public chestDeck: GameCard[] = [...COMMUNITY_CHEST_CARDS];
  public freeParkingJackpot: number = 100;
  public tradeOffers: Map<string, TradeOffer> = new Map();

  private static readonly PLAYER_COLORS = ['#00B894', '#0984E3', '#E84393', '#FDCB6E'];
  private static readonly TOKEN_TYPES: TokenType[] = ['car', 'hat', 'dog', 'rocket'];

  constructor(roomId: string, initialCash = 1500, turnTimeout = 30) {
    this.roomId = roomId;
    this.turnState = {
      currentUserId: '',
      phase: 'ROLL_DICE',
      dice: [1, 1],
      isDouble: false,
      consecutiveDoubles: 0,
      turnStartTime: Date.now(),
      turnTimeout
    };
    this.shuffleDecks();
  }

  public shuffleDecks() {
    this.chanceDeck.sort(() => Math.random() - 0.5);
    this.chestDeck.sort(() => Math.random() - 0.5);
  }

  public addPlayer(id: string, socketId: string, username: string, isHost = false, initialCash = 1500): PlayerState {
    const slot = this.players.length;
    const player: PlayerState = {
      id,
      socketId,
      username,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      token: MonopolyEngine.TOKEN_TYPES[slot % 4],
      color: MonopolyEngine.PLAYER_COLORS[slot % 4],
      balance: initialCash,
      position: 0,
      inJail: false,
      jailTurns: 0,
      getOutOfJailCards: 0,
      rentWaivers: 0,
      rentMultiplier: 1,
      jailBonds: 0,
      isBankrupt: false,
      isBot: false,
      isHost,
      netWorth: initialCash
    };
    this.players.push(player);
    this.addLog(`${username} đã tham gia ván đấu.`, 'INFO', id, username);
    return player;
  }

  public startGame(): { firstTurnUserId: string } {
    if (this.players.length === 0) throw new Error('Không có người chơi');
    const firstUserId = this.players[0].id;
    this.turnState.currentUserId = firstUserId;
    this.turnState.phase = 'ROLL_DICE';
    this.turnState.turnStartTime = Date.now();
    this.addLog(`Ván cờ bắt đầu! Lượt đầu tiên thuộc về ${this.players[0].username}.`, 'ALERT');
    return { firstTurnUserId: firstUserId };
  }

  public getCurrentPlayer(): PlayerState | undefined {
    return this.players.find(p => p.id === this.turnState.currentUserId);
  }

  public rollDice(userId: string): {
    dice: [number, number];
    isDouble: boolean;
    prevPosition: number;
    newPosition: number;
    passedGo: boolean;
    actionResult: any;
  } {
    const player = this.getCurrentPlayer();
    if (!player || player.id !== userId) {
      throw new Error('Chưa đến lượt của bạn');
    }
    if (this.turnState.phase !== 'ROLL_DICE') {
      throw new Error('Hành động lắc xí ngầu không hợp lệ ở pha này');
    }

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const isDouble = d1 === d2;

    this.turnState.dice = [d1, d2];
    this.turnState.isDouble = isDouble;

    const prevPos = player.position;
    const wasInJail = player.inJail;

    // Handle Jail status
    if (player.inJail) {
      if (player.getOutOfJailCards > 0) {
        player.getOutOfJailCards--;
        player.inJail = false;
        player.jailTurns = 0;
        this.addLog(`${player.username} sử dụng Thẻ Đặc Xá để được tự do ra tù!`, 'JAIL', player.id, player.username);
      } else if (player.jailBonds > 0) {
        player.jailBonds--;
        player.inJail = false;
        player.jailTurns = 0;
        this.addLog(`${player.username} sử dụng Thẻ Bảo Lãnh VIP để được tự do ra tù!`, 'JAIL', player.id, player.username);
      } else if (isDouble) {
        player.inJail = false;
        player.jailTurns = 0;
        this.addLog(`${player.username} đổ đôi (${d1}-${d2}) và được tự do ra tù!`, 'JAIL', player.id, player.username);
      } else {
        player.jailTurns++;
        if (player.jailTurns >= 3) {
          if (player.balance < 50) {
            this.autoMortgageToCoverDebt(player, 50);
          }
          const actualPaid = Math.min(player.balance, 50);
          player.balance = Math.max(0, player.balance - 50);
          this.freeParkingJackpot += actualPaid;
          player.inJail = false;
          player.jailTurns = 0;
          this.addLog(`${player.username} hết hạn tạm giam, nộp 50M tiền bảo lãnh để ra tù.`, 'JAIL', player.id, player.username);
        } else {
          this.addLog(`${player.username} không đổ đôi (${d1}-${d2}) và tiếp tục ở lại tù (${player.jailTurns}/3).`, 'JAIL', player.id, player.username);
          this.turnState.phase = 'END_TURN';
          return {
            dice: [d1, d2],
            isDouble,
            prevPosition: prevPos,
            newPosition: prevPos,
            passedGo: false,
            actionResult: { type: 'STAY_IN_JAIL' }
          };
        }
      }
    }

    // Check consecutive doubles (only counts if wasn't in jail)
    if (isDouble && !wasInJail) {
      this.turnState.consecutiveDoubles++;
      if (this.turnState.consecutiveDoubles >= 3) {
        player.position = 10;
        player.inJail = true;
        player.jailTurns = 0;
        this.turnState.consecutiveDoubles = 0;
        this.turnState.isDouble = false;
        this.turnState.phase = 'END_TURN';
        this.addLog(`${player.username} đổ đôi 3 lần liên tiếp! Bị tống vào tù vì vi phạm luật!`, 'JAIL', player.id, player.username);
        return {
          dice: [d1, d2],
          isDouble,
          prevPosition: prevPos,
          newPosition: 10,
          passedGo: false,
          actionResult: { type: 'GO_TO_JAIL' }
        };
      }
    } else {
      this.turnState.consecutiveDoubles = 0;
      if (wasInJail) {
        // Ra tù bằng đổ đôi sẽ di chuyển bình thường nhưng không được lắc thêm lượt
        this.turnState.isDouble = false;
      }
    }

    // Move token
    const steps = d1 + d2;
    let newPos = (prevPos + steps) % 40;
    let passedGo = false;
    if (prevPos + steps >= 40) {
      passedGo = true;
      player.balance += 200;
      this.addLog(`${player.username} đi qua ô Khởi Hành (GO), nhận lương 200M!`, 'MONEY', player.id, player.username);
    }
    player.position = newPos;

    // Evaluate Tile
    const tile = BOARD_TILES[newPos];
    const actionResult = this.evaluateTileAction(player, tile, steps);

    this.updateNetWorth();
    return {
      dice: [d1, d2],
      isDouble,
      prevPosition: prevPos,
      newPosition: newPos,
      passedGo,
      actionResult
    };
  }

  public evaluateTileAction(player: PlayerState, tile: BoardTile, diceSum: number): any {
    switch (tile.type) {
      case 'GO':
        this.setNextPhaseAfterAction(player);
        return { type: 'GO', message: 'Dừng chân tại ô Khởi Hành.' };

      case 'PROPERTY':
      case 'RAILROAD':
      case 'UTILITY': {
        const prop = this.properties.get(tile.id);
        if (!prop) {
          // Unowned - can buy
          this.turnState.phase = 'BUY_PROPERTY';
          return {
            type: 'CAN_BUY',
            tileId: tile.id,
            tileName: tile.name,
            cost: tile.price,
            canAfford: player.balance >= tile.price
          };
        } else if (prop.ownerId === player.id) {
          // Owned by self - can upgrade if property and not mortgaged
          if (tile.type === 'PROPERTY' && prop.level < 4 && !prop.isMortgaged && this.canUpgradeProperty(player.id, tile)) {
            const cost = tile.houseCost || 100;
            this.turnState.phase = 'BUY_PROPERTY';
            return {
              type: 'CAN_UPGRADE',
              tileId: tile.id,
              tileName: tile.name,
              level: prop.level,
              cost,
              canAfford: player.balance >= cost
            };
          } else {
            this.setNextPhaseAfterAction(player);
            return {
              type: 'OWNED_SELF',
              message: prop.isMortgaged
                ? 'Đang ghé thăm bất động sản của chính mình (Đang bị cầm cố).'
                : 'Đang ghé thăm bất động sản của chính mình.'
            };
          }
        } else {
          // Owned by other
          const owner = this.players.find(p => p.id === prop.ownerId);
          if (!owner || owner.isBankrupt) {
            this.setNextPhaseAfterAction(player);
            return { type: 'OWNER_BANKRUPT' };
          }

          // If property is mortgaged, rent is 0!
          if (prop.isMortgaged) {
            this.setNextPhaseAfterAction(player);
            this.addLog(`${player.username} vào ô [${tile.name}] đang bị cầm cố, được miễn phí thuê.`, 'INFO', player.id, player.username);
            return {
              type: 'MORTGAGED_TILE',
              tileId: tile.id,
              message: `Bất động sản [${tile.name}] đang bị cầm cố, không thu tiền thuê.`
            };
          }

          // Check if player has active Rent Waiver shield
          if (player.rentWaivers > 0) {
            player.rentWaivers--;
            this.addLog(`🛡️ ${player.username} sử dụng Thẻ Miễn Trừ Tiền Thuê VIP tại [${tile.name}], miễn phí 100% tiền thuê!`, 'ALERT', player.id, player.username);
            this.setNextPhaseAfterAction(player);
            return {
              type: 'RENT_WAIVED',
              tileId: tile.id,
              ownerName: owner.username,
              message: `Đã kích hoạt Thẻ Miễn Trừ Tiền Thuê VIP cho ô [${tile.name}].`
            };
          }

          let rent = this.calculateRent(tile, prop, diceSum);

          // Apply owner rent multiplier if active
          if (owner.rentMultiplier > 1) {
            const multi = owner.rentMultiplier;
            rent = rent * multi;
            owner.rentMultiplier = 1; // Resets multiplier after applying
            this.addLog(`⚡ ${owner.username} áp dụng Bội Số Thuê x${multi}! Tiền thuê tại [${tile.name}] tăng lên ${rent}M.`, 'ALERT', owner.id, owner.username);
          }

          // Prevent premature bankruptcy via auto-mortgage
          if (player.balance < rent) {
            this.autoMortgageToCoverDebt(player, rent);
          }

          const actualPaid = Math.min(player.balance, rent);
          player.balance -= actualPaid;
          owner.balance += actualPaid;

          this.addLog(`${player.username} vào ô [${tile.name}], trả tiền thuê ${actualPaid}M cho ${owner.username}.`, 'MONEY', player.id, player.username);

          if (player.balance <= 0 && rent > actualPaid) {
            this.handleBankruptcy(player, owner);
            return { type: 'BANKRUPT', owedTo: owner.username, rentOwed: rent };
          }

          this.setNextPhaseAfterAction(player);
          return {
            type: 'PAY_RENT',
            tileId: tile.id,
            ownerName: owner.username,
            amount: actualPaid
          };
        }
      }

      case 'TAX': {
        const tax = tile.taxAmount || 100;
        if (player.balance < tax) {
          this.autoMortgageToCoverDebt(player, tax);
        }
        const actualPaid = Math.min(player.balance, tax);
        player.balance -= actualPaid;
        this.freeParkingJackpot += actualPaid; // Add paid taxes to free parking pool
        this.addLog(`${player.username} đóng thuế [${tile.name}] số tiền ${actualPaid}M. (Quỹ Bãi Đỗ Xe: ${this.freeParkingJackpot}M)`, 'MONEY', player.id, player.username);

        if (player.balance <= 0 && tax > actualPaid) {
          this.handleBankruptcy(player);
          return { type: 'BANKRUPT', taxPaid: actualPaid };
        }
        this.setNextPhaseAfterAction(player);
        return { type: 'TAX', amount: tax };
      }

      case 'GO_TO_JAIL':
        player.position = 10;
        player.inJail = true;
        player.jailTurns = 0;
        this.turnState.isDouble = false;
        this.turnState.consecutiveDoubles = 0;
        this.turnState.phase = 'END_TURN';
        this.addLog(`${player.username} bước vào ô Vào Tù! Phải chấp hành tạm giam.`, 'JAIL', player.id, player.username);
        return { type: 'GO_TO_JAIL' };

      case 'JAIL':
        this.setNextPhaseAfterAction(player);
        return { type: 'JUST_VISITING', message: 'Chỉ ghé thăm nhà tù.' };

      case 'FREE_PARKING': {
        const jackpot = Math.max(50, this.freeParkingJackpot);
        player.balance += jackpot;
        this.freeParkingJackpot = 50; // resets pool
        this.addLog(`🎉 ${player.username} dừng chân tại Bãi Đỗ Xe (Free Parking), nhận trọn hũ tiền thưởng ${jackpot}M!`, 'MONEY', player.id, player.username);
        this.setNextPhaseAfterAction(player);
        return { type: 'FREE_PARKING', reward: jackpot, message: `Nhận ${jackpot}M từ hũ tiền Bãi Đỗ Xe!` };
      }

      case 'CHANCE':
      case 'COMMUNITY_CHEST': {
        const deck = tile.type === 'CHANCE' ? this.chanceDeck : this.chestDeck;
        const card = deck.shift()!;
        deck.push(card);
        const cardResult = this.applyCard(player, card);

        if (!player.inJail && !player.isBankrupt && this.turnState.phase !== 'BUY_PROPERTY') {
          this.setNextPhaseAfterAction(player);
        } else if (player.inJail || player.isBankrupt) {
          this.turnState.isDouble = false;
          this.turnState.phase = 'END_TURN';
        }

        return {
          type: 'CARD',
          cardType: tile.type,
          card,
          result: cardResult
        };
      }

      default:
        this.setNextPhaseAfterAction(player);
        return { type: 'UNKNOWN' };
    }
  }

  public drawCard(type: 'CHANCE' | 'COMMUNITY_CHEST', player?: PlayerState): { card: GameCard; result: string } {
    const p = player || this.getCurrentPlayer() || this.players[0];
    const deck = type === 'CHANCE' ? this.chanceDeck : this.chestDeck;
    const card = deck.shift()!;
    deck.push(card);
    const result = this.applyCard(p, card);
    return { card, result };
  }

  public applyCard(player: PlayerState, card: GameCard): string {
    this.addLog(`${player.username} rút thẻ [${card.title}]: ${card.description}`, 'ACTION', player.id, player.username);

    switch (card.action) {
      case 'ADD_MONEY': {
        const val = card.value || 0;
        player.balance += val;
        this.updateNetWorth();
        return `Tài khoản nhận +${val}M`;
      }

      case 'SUB_MONEY': {
        const cost = card.value || 0;
        if (player.balance < cost) {
          this.autoMortgageToCoverDebt(player, cost);
        }
        const sub = Math.min(player.balance, cost);
        player.balance -= sub;
        this.freeParkingJackpot += sub;
        this.updateNetWorth();
        if (player.balance <= 0 && cost > sub) {
          this.handleBankruptcy(player);
        }
        return `Tài khoản bị trừ -${cost}M`;
      }

      case 'MOVE_TO': {
        const prevPos = player.position;
        const target = card.targetTileId ?? 0;
        let passedGo = false;
        if (target === 0 || target < prevPos) {
          passedGo = true;
          player.balance += 200;
          this.addLog(`${player.username} đi qua ô Khởi Hành (GO), nhận thưởng 200M!`, 'MONEY', player.id, player.username);
        }
        player.position = target;
        const destTile = BOARD_TILES[target];

        let subMsg = '';
        if (destTile.type === 'PROPERTY' || destTile.type === 'RAILROAD' || destTile.type === 'UTILITY') {
          const prop = this.properties.get(target);
          if (!prop) {
            this.turnState.phase = 'BUY_PROPERTY';
            subMsg = ` Ô [${destTile.name}] chưa có chủ, có thể mua đất.`;
          } else if (prop.ownerId === player.id) {
            subMsg = ` Đang thăm bất động sản của chính mình.`;
          } else if (!prop.isMortgaged) {
            const owner = this.players.find(p => p.id === prop.ownerId);
            if (owner && !owner.isBankrupt) {
              if (player.rentWaivers > 0) {
                player.rentWaivers--;
                this.addLog(`🛡️ ${player.username} sử dụng Thẻ Miễn Trừ Tiền Thuê VIP tại [${destTile.name}], miễn phí 100% thuê!`, 'ALERT', player.id, player.username);
                subMsg = ` Đã sử dụng Thẻ Miễn Trừ Tiền Thuê VIP.`;
              } else {
                let rent = this.calculateRent(destTile, prop, 7);
                if (owner.rentMultiplier > 1) {
                  rent = rent * owner.rentMultiplier;
                  owner.rentMultiplier = 1;
                }
                if (player.balance < rent) {
                  this.autoMortgageToCoverDebt(player, rent);
                }
                const actualPaid = Math.min(player.balance, rent);
                player.balance -= actualPaid;
                owner.balance += actualPaid;
                this.addLog(`${player.username} vào ô [${destTile.name}], trả tiền thuê ${actualPaid}M cho ${owner.username}.`, 'MONEY', player.id, player.username);
                if (player.balance <= 0 && rent > actualPaid) {
                  this.handleBankruptcy(player, owner);
                }
                subMsg = ` Trả ${actualPaid}M tiền thuê cho ${owner.username}.`;
              }
            }
          } else {
            subMsg = ` Bất động sản đang bị cầm cố, miễn phí thuê.`;
          }
        }
        this.updateNetWorth();
        return `Di chuyển tức thì đến [${destTile.name}]${passedGo ? ' (+200M)' : ''}.${subMsg}`;
      }

      case 'GO_TO_JAIL': {
        player.position = 10;
        player.inJail = true;
        player.jailTurns = 0;
        this.turnState.isDouble = false;
        this.turnState.consecutiveDoubles = 0;
        this.turnState.phase = 'END_TURN';
        return `Vào tù ngay lập tức`;
      }

      case 'GET_OUT_OF_JAIL': {
        player.getOutOfJailCards++;
        return `Nhận thêm 1 thẻ miễn tội ra tù (Hiện có: ${player.getOutOfJailCards})`;
      }

      case 'PAY_EACH_PLAYER': {
        const perPlayer = card.value || 0;
        const others = this.players.filter(p => p.id !== player.id && !p.isBankrupt);
        const totalNeeded = perPlayer * others.length;

        if (player.balance < totalNeeded) {
          this.autoMortgageToCoverDebt(player, totalNeeded);
        }

        let totalPaid = 0;
        for (const other of others) {
          const paid = Math.min(player.balance, perPlayer);
          player.balance -= paid;
          other.balance += paid;
          totalPaid += paid;
          this.addLog(`${player.username} chi trả ${paid}M cho ${other.username}.`, 'MONEY', player.id, player.username);
        }

        this.updateNetWorth();
        if (player.balance <= 0 && totalNeeded > totalPaid) {
          this.handleBankruptcy(player);
        }
        return `Chi trả ${perPlayer}M cho mỗi người chơi (${others.length} người, tổng: -${totalPaid}M)`;
      }

      case 'COLLECT_FROM_EACH_PLAYER': {
        const perPlayer = card.value || 0;
        const others = this.players.filter(p => p.id !== player.id && !p.isBankrupt);
        let totalCollected = 0;

        for (const other of others) {
          if (other.balance < perPlayer) {
            this.autoMortgageToCoverDebt(other, perPlayer);
          }
          const paid = Math.min(other.balance, perPlayer);
          other.balance -= paid;
          player.balance += paid;
          totalCollected += paid;
          this.addLog(`${other.username} đóng góp ${paid}M cho ${player.username}.`, 'MONEY', other.id, other.username);
          if (other.balance <= 0 && perPlayer > paid) {
            this.handleBankruptcy(other, player);
          }
        }

        this.updateNetWorth();
        return `Thu ${perPlayer}M từ mỗi người chơi (Tổng nhận: +${totalCollected}M)`;
      }

      case 'REPAIR_PROPERTY': {
        const costPerHouse = card.costPerHouse || 25;
        const costPerHotel = card.costPerHotel || 100;
        let houseCount = 0;
        let hotelCount = 0;

        for (const [_, prop] of this.properties.entries()) {
          if (prop.ownerId === player.id) {
            if (prop.level >= 1 && prop.level <= 3) {
              houseCount += prop.level;
            } else if (prop.level === 4) {
              hotelCount += 1;
            }
          }
        }

        const totalRepair = houseCount * costPerHouse + hotelCount * costPerHotel;
        if (totalRepair > 0) {
          if (player.balance < totalRepair) {
            this.autoMortgageToCoverDebt(player, totalRepair);
          }
          const actualPaid = Math.min(player.balance, totalRepair);
          player.balance -= actualPaid;
          this.freeParkingJackpot += actualPaid;
          if (player.balance <= 0 && totalRepair > actualPaid) {
            this.handleBankruptcy(player);
          }
        }

        this.updateNetWorth();
        return `Chi phí sửa chữa (${houseCount} nhà x ${costPerHouse}M + ${hotelCount} khách sạn x ${costPerHotel}M): -${totalRepair}M`;
      }

      case 'MOVE_STEPS': {
        const steps = card.steps || 0;
        const prevPos = player.position;
        const target = (prevPos + steps + 40) % 40;
        let passedGo = false;
        if (steps > 0 && prevPos + steps >= 40) {
          passedGo = true;
          player.balance += 200;
          this.addLog(`${player.username} đi qua ô Khởi Hành (GO), nhận thưởng 200M!`, 'MONEY', player.id, player.username);
        }
        player.position = target;
        const destTile = BOARD_TILES[target];

        let subMsg = '';
        if (destTile.type === 'PROPERTY' || destTile.type === 'RAILROAD' || destTile.type === 'UTILITY') {
          const prop = this.properties.get(target);
          if (!prop) {
            this.turnState.phase = 'BUY_PROPERTY';
            subMsg = ` Ô [${destTile.name}] chưa có chủ, có thể mua đất.`;
          } else if (prop.ownerId === player.id) {
            subMsg = ` Đang thăm bất động sản của chính mình.`;
          } else if (!prop.isMortgaged) {
            const owner = this.players.find(p => p.id === prop.ownerId);
            if (owner && !owner.isBankrupt) {
              if (player.rentWaivers > 0) {
                player.rentWaivers--;
                this.addLog(`🛡️ ${player.username} sử dụng Thẻ Miễn Trừ Tiền Thuê VIP tại [${destTile.name}], miễn phí 100% thuê!`, 'ALERT', player.id, player.username);
                subMsg = ` Đã sử dụng Thẻ Miễn Trừ Tiền Thuê VIP.`;
              } else {
                let rent = this.calculateRent(destTile, prop, 7);
                if (owner.rentMultiplier > 1) {
                  rent = rent * owner.rentMultiplier;
                  owner.rentMultiplier = 1;
                }
                if (player.balance < rent) {
                  this.autoMortgageToCoverDebt(player, rent);
                }
                const actualPaid = Math.min(player.balance, rent);
                player.balance -= actualPaid;
                owner.balance += actualPaid;
                this.addLog(`${player.username} vào ô [${destTile.name}], trả tiền thuê ${actualPaid}M cho ${owner.username}.`, 'MONEY', player.id, player.username);
                if (player.balance <= 0 && rent > actualPaid) {
                  this.handleBankruptcy(player, owner);
                }
                subMsg = ` Trả ${actualPaid}M tiền thuê cho ${owner.username}.`;
              }
            }
          }
        }
        this.updateNetWorth();
        return `Di chuyển ${steps > 0 ? 'tiến' : 'lùi'} ${Math.abs(steps)} bước đến [${destTile.name}].${subMsg}`;
      }

      case 'PROPERTY_ACQUISITION': {
        const unownedTile = BOARD_TILES.find(t =>
          (t.type === 'PROPERTY' || t.type === 'RAILROAD' || t.type === 'UTILITY') &&
          !this.properties.has(t.id)
        );
        if (unownedTile) {
          this.properties.set(unownedTile.id, {
            tileId: unownedTile.id,
            ownerId: player.id,
            level: 0,
            isMortgaged: false
          });
          this.addLog(`🏛️ ${player.username} nhận quyền sở hữu bất động sản [${unownedTile.name}] hoàn toàn miễn phí!`, 'ACTION', player.id, player.username);
          this.updateNetWorth();
          return `Được cấp quyền sở hữu ô đất [${unownedTile.name}] miễn phí`;
        } else {
          const comp = card.value || 150;
          player.balance += comp;
          this.updateNetWorth();
          return `Tất cả đất đã có chủ, nhận đền bù tiền mặt +${comp}M`;
        }
      }

      case 'RENT_MULTIPLIER': {
        const multi = card.multiplier || 2;
        player.rentMultiplier = multi;
        this.addLog(`⚡ ${player.username} kích hoạt Bội Số Tiền Thuê x${multi} cho lượt thu kế tiếp!`, 'ALERT', player.id, player.username);
        return `Kích hoạt Bội Số Tiền Thuê x${multi} cho lần thu tiền tiếp theo!`;
      }

      case 'RENT_WAIVER': {
        const count = card.value || 1;
        player.rentWaivers = (player.rentWaivers || 0) + count;
        this.addLog(`🛡️ ${player.username} nhận được ${count} Thẻ Miễn Trừ Tiền Thuê VIP!`, 'ALERT', player.id, player.username);
        return `Nhận ${count} Thẻ Miễn Trừ Tiền Thuê VIP (Tổng có: ${player.rentWaivers})`;
      }

      case 'HOSPITAL_BOND': {
        const count = card.value || 1;
        player.jailBonds = (player.jailBonds || 0) + count;
        this.addLog(`🩺 ${player.username} nhận Thẻ Bảo Lãnh Y Tế & Trái Phiếu Viện Phí VIP!`, 'INFO', player.id, player.username);
        return `Nhận ${count} Thẻ Bảo Lãnh Y Tế & Trái Phiếu VIP`;
      }

      case 'TAX_AUDIT': {
        let tax = 0;
        if (card.percent) {
          tax = Math.floor((player.balance * card.percent) / 100);
        } else {
          const ownedCount = Array.from(this.properties.values()).filter(p => p.ownerId === player.id).length;
          tax = ownedCount * (card.value || 15);
        }
        if (tax > 0) {
          if (player.balance < tax) {
            this.autoMortgageToCoverDebt(player, tax);
          }
          const actualTax = Math.min(player.balance, tax);
          player.balance -= actualTax;
          this.freeParkingJackpot += actualTax;
          this.addLog(`📋 ${player.username} hoàn tất kiểm toán thuế, nộp phạt ${actualTax}M.`, 'MONEY', player.id, player.username);
          if (player.balance <= 0 && tax > actualTax) {
            this.handleBankruptcy(player);
          }
        }
        this.updateNetWorth();
        return `Kiểm toán thuế: Nộp ${tax}M vào ngân sách`;
      }

      case 'INSTANT_TRANSIT': {
        const railroadPositions = [5, 15, 25, 35];
        const curr = player.position;
        let nextStation = railroadPositions.find(p => p > curr);
        let passedGo = false;
        if (nextStation === undefined) {
          nextStation = 5;
          passedGo = true;
          player.balance += 200;
          this.addLog(`${player.username} đi qua ô Khởi Hành (GO), nhận lương 200M!`, 'MONEY', player.id, player.username);
        }
        player.position = nextStation;
        const stationTile = BOARD_TILES[nextStation];
        const prop = this.properties.get(nextStation);
        let subMsg = '';
        if (!prop) {
          this.turnState.phase = 'BUY_PROPERTY';
          subMsg = ` [${stationTile.name}] chưa có chủ, có thể mua.`;
        } else if (prop.ownerId === player.id) {
          subMsg = ` Ghé thăm bến xe của chính mình.`;
        } else if (!prop.isMortgaged) {
          const owner = this.players.find(p => p.id === prop.ownerId);
          if (owner && !owner.isBankrupt) {
            if (player.rentWaivers > 0) {
              player.rentWaivers--;
              subMsg = ` Sử dụng Thẻ Miễn Trừ Tiền Thuê VIP.`;
            } else {
              const rent = this.calculateRent(stationTile, prop, 7);
              if (player.balance < rent) this.autoMortgageToCoverDebt(player, rent);
              const paid = Math.min(player.balance, rent);
              player.balance -= paid;
              owner.balance += paid;
              subMsg = ` Trả ${paid}M tiền vé cho ${owner.username}.`;
              if (player.balance <= 0 && rent > paid) this.handleBankruptcy(player, owner);
            }
          }
        }
        this.updateNetWorth();
        return `Di chuyển tốc hành đến [${stationTile.name}]${passedGo ? ' (+200M)' : ''}.${subMsg}`;
      }

      case 'DISASTER': {
        const developedProps = Array.from(this.properties.values())
          .filter(p => p.ownerId === player.id && p.level > 0)
          .sort((a, b) => b.level - a.level);
        if (developedProps.length > 0) {
          const target = developedProps[0];
          target.level--;
          const tileName = BOARD_TILES[target.tileId]?.name;
          this.addLog(`🌪️ Bão lũ gây sạt lở tại [${tileName}], hạ 1 cấp công trình xuống cấp ${target.level}.`, 'ALERT', player.id, player.username);
          this.updateNetWorth();
          return `Thiên tai làm hư hại công trình tại [${tileName}], giảm 1 cấp`;
        } else {
          const cost = card.value || 60;
          if (player.balance < cost) this.autoMortgageToCoverDebt(player, cost);
          const sub = Math.min(player.balance, cost);
          player.balance -= sub;
          this.freeParkingJackpot += sub;
          if (player.balance <= 0 && cost > sub) this.handleBankruptcy(player);
          this.updateNetWorth();
          return `Chi trả ${cost}M gia cố công trình phòng chống thiên tai`;
        }
      }

      case 'DIVIDEND_PAYOUT': {
        const ownedProps = Array.from(this.properties.values()).filter(p => p.ownerId === player.id && !p.isMortgaged);
        const perProp = card.value || 25;
        const totalDiv = ownedProps.length * perProp;
        player.balance += totalDiv;
        this.addLog(`📈 ${player.username} nhận cổ tức định kỳ +${totalDiv}M (${perProp}M x ${ownedProps.length} tài sản).`, 'MONEY', player.id, player.username);
        this.updateNetWorth();
        return `Nhận cổ tức danh mục đầu tư: +${totalDiv}M`;
      }

      case 'MINI_EVENT': {
        const bonus = card.value || 50;
        const activePlayers = this.players.filter(p => !p.isBankrupt && !p.inJail);
        for (const p of activePlayers) {
          p.balance += bonus;
        }
        this.addLog(`🎊 Sự kiện lễ hội cộng đồng: Mỗi người chơi nhận thưởng ${bonus}M!`, 'MONEY');
        this.updateNetWorth();
        return `Tất cả người chơi hợp lệ nhận +${bonus}M từ sự kiện cộng đồng`;
      }

      case 'PROPERTY_SWAP': {
        const playerProps = Array.from(this.properties.values()).filter(p => p.ownerId === player.id && p.level === 0);
        const opponentProps = Array.from(this.properties.values()).filter(p => p.ownerId !== player.id && p.level === 0 && !this.players.find(x => x.id === p.ownerId)?.isBankrupt);

        if (playerProps.length > 0 && opponentProps.length > 0) {
          const myProp = playerProps[0];
          const oppProp = opponentProps[0];
          const oppOwner = this.players.find(x => x.id === oppProp.ownerId);
          const oppOwnerId = oppProp.ownerId;

          myProp.ownerId = oppOwnerId;
          oppProp.ownerId = player.id;

          const myTile = BOARD_TILES[myProp.tileId]?.name;
          const oppTile = BOARD_TILES[oppProp.tileId]?.name;
          this.addLog(`🔄 M&A Hoán đổi dự án thành công: [${myTile}] giao cho ${oppOwner?.username || 'đối thủ'}, nhận lại [${oppTile}]!`, 'ACTION', player.id, player.username);
          this.updateNetWorth();
          return `Hoán đổi bất động sản [${myTile}] với [${oppTile}]`;
        } else {
          const fee = card.value || 100;
          player.balance += fee;
          this.updateNetWorth();
          return `Không đủ điều kiện hoán đổi, nhận phí tư vấn M&A +${fee}M`;
        }
      }

      default:
        return 'Thẻ đã kích hoạt';
    }
  }

  public calculateRent(tile: BoardTile, prop: PropertyState, diceSum = 7): number {
    if (prop.isMortgaged) {
      return 0;
    }

    if (tile.type === 'PROPERTY') {
      switch (prop.level) {
        case 0: {
          const districtTiles = BOARD_TILES.filter(t => t.district === tile.district);
          const ownsAll = districtTiles.every(t => this.properties.get(t.id)?.ownerId === prop.ownerId);
          return ownsAll ? tile.baseRent * 2 : tile.baseRent;
        }
        case 1: return tile.rentHouse1 || tile.baseRent * 5;
        case 2: return tile.rentHouse2 || tile.baseRent * 15;
        case 3: return tile.rentHouse3 || tile.baseRent * 40;
        case 4: return tile.rentHotel || tile.baseRent * 80;
        default: return tile.baseRent;
      }
    } else if (tile.type === 'RAILROAD') {
      const allRailroads = BOARD_TILES.filter(t => t.type === 'RAILROAD');
      const count = allRailroads.filter(t => {
        const p = this.properties.get(t.id);
        return p && p.ownerId === prop.ownerId && !p.isMortgaged;
      }).length;
      return 25 * Math.pow(2, Math.max(0, count - 1));
    } else if (tile.type === 'UTILITY') {
      const allUtilities = BOARD_TILES.filter(t => t.type === 'UTILITY');
      const count = allUtilities.filter(t => {
        const p = this.properties.get(t.id);
        return p && p.ownerId === prop.ownerId && !p.isMortgaged;
      }).length;
      return diceSum * (count >= 2 ? 10 : 4);
    }
    return tile.baseRent;
  }

  public canUpgradeProperty(userId: string, tile: BoardTile): boolean {
    if (tile.type !== 'PROPERTY' || !tile.district) return false;
    const districtTiles = BOARD_TILES.filter(t => t.district === tile.district);
    const ownsAll = districtTiles.every(t => this.properties.get(t.id)?.ownerId === userId);
    if (!ownsAll) return false;

    // Không thể xây nhà nếu có bất động sản nào cùng nhóm màu đang bị cầm cố
    const anyMortgaged = districtTiles.some(t => this.properties.get(t.id)?.isMortgaged);
    if (anyMortgaged) return false;

    return true;
  }

  public buyProperty(userId: string, tileId: number): {
    success: boolean;
    tileId: number;
    level: number;
    remainingCash: number;
    error?: string;
  } {
    const player = this.getCurrentPlayer();
    if (!player || player.id !== userId) {
      return { success: false, tileId, level: 0, remainingCash: 0, error: 'Chưa đến lượt của bạn' };
    }

    const tile = BOARD_TILES[tileId];
    if (!tile) return { success: false, tileId, level: 0, remainingCash: player.balance, error: 'Ô cờ không tồn tại' };

    let prop = this.properties.get(tileId);

    if (!prop) {
      // Mua đất lần đầu
      if (player.balance < tile.price) {
        return { success: false, tileId, level: 0, remainingCash: player.balance, error: 'Không đủ tiền mua đất' };
      }
      player.balance -= tile.price;
      prop = {
        tileId,
        ownerId: player.id,
        level: 0,
        isMortgaged: false
      };
      this.properties.set(tileId, prop);
      this.addLog(`${player.username} đã chi ${tile.price}M mua ô đất [${tile.name}].`, 'ACTION', player.id, player.username);
    } else if (prop.ownerId === player.id) {
      // Nâng cấp nhà
      if (prop.isMortgaged) {
        return { success: false, tileId, level: prop.level, remainingCash: player.balance, error: 'Bất động sản đang cầm cố, cần chuộc lại trước khi xây dựng' };
      }
      if (prop.level >= 4) {
        return { success: false, tileId, level: prop.level, remainingCash: player.balance, error: 'Bất động sản đã đạt cấp Landmark cao nhất' };
      }
      const cost = tile.houseCost || 100;
      if (player.balance < cost) {
        return { success: false, tileId, level: prop.level, remainingCash: player.balance, error: 'Không đủ tiền nâng cấp' };
      }
      player.balance -= cost;
      prop.level++;
      const levelNames = ['Đất trống', 'Nhà cấp 1', 'Nhà cấp 2', 'Nhà cấp 3', 'Landmark 5 Sao'];
      this.addLog(`${player.username} nâng cấp [${tile.name}] lên ${levelNames[prop.level]} (-${cost}M).`, 'ACTION', player.id, player.username);
    } else {
      return { success: false, tileId, level: prop.level, remainingCash: player.balance, error: 'Bất động sản đã có chủ' };
    }

    this.setNextPhaseAfterAction(player);
    this.updateNetWorth();
    return {
      success: true,
      tileId,
      level: prop.level,
      remainingCash: player.balance
    };
  }

  public skipBuyProperty(userId: string): { success: boolean; phase: 'ROLL_DICE' | 'END_TURN' } {
    const player = this.getCurrentPlayer();
    if (!player || player.id !== userId) {
      return { success: false, phase: this.turnState.phase as any };
    }
    if (this.turnState.phase === 'BUY_PROPERTY') {
      const phase = this.setNextPhaseAfterAction(player);
      this.addLog(`${player.username} quyết định không mua ô cờ này.`, 'ACTION', player.id, player.username);
      return { success: true, phase };
    }
    return { success: false, phase: this.turnState.phase as any };
  }

  public mortgageProperty(userId: string, tileId: number): {
    success: boolean;
    tileId: number;
    mortgageValue: number;
    remainingCash: number;
    error?: string;
  } {
    const player = this.players.find(p => p.id === userId);
    if (!player) return { success: false, tileId, mortgageValue: 0, remainingCash: 0, error: 'Người chơi không tồn tại' };

    const tile = BOARD_TILES[tileId];
    if (!tile) return { success: false, tileId, mortgageValue: 0, remainingCash: player.balance, error: 'Ô cờ không tồn tại' };

    const prop = this.properties.get(tileId);
    if (!prop || prop.ownerId !== userId) {
      return { success: false, tileId, mortgageValue: 0, remainingCash: player.balance, error: 'Bạn không sở hữu ô cờ này' };
    }

    if (prop.isMortgaged) {
      return { success: false, tileId, mortgageValue: 0, remainingCash: player.balance, error: 'Bất động sản này đã được cầm cố' };
    }

    if (prop.level > 0) {
      return { success: false, tileId, mortgageValue: 0, remainingCash: player.balance, error: 'Phải bán hết nhà trên đất trước khi cầm cố' };
    }

    const mortgageValue = Math.floor(tile.price * 0.5);
    prop.isMortgaged = true;
    player.balance += mortgageValue;

    this.addLog(`${player.username} đã cầm cố ô [${tile.name}], nhận ${mortgageValue}M (50% giá trị).`, 'ACTION', player.id, player.username);

    this.updateNetWorth();
    return {
      success: true,
      tileId,
      mortgageValue,
      remainingCash: player.balance
    };
  }

  public unmortgageProperty(userId: string, tileId: number): {
    success: boolean;
    tileId: number;
    cost: number;
    remainingCash: number;
    error?: string;
  } {
    const player = this.players.find(p => p.id === userId);
    if (!player) return { success: false, tileId, cost: 0, remainingCash: 0, error: 'Người chơi không tồn tại' };

    const tile = BOARD_TILES[tileId];
    if (!tile) return { success: false, tileId, cost: 0, remainingCash: player.balance, error: 'Ô cờ không tồn tại' };

    const prop = this.properties.get(tileId);
    if (!prop || prop.ownerId !== userId) {
      return { success: false, tileId, cost: 0, remainingCash: player.balance, error: 'Bạn không sở hữu ô cờ này' };
    }

    if (!prop.isMortgaged) {
      return { success: false, tileId, cost: 0, remainingCash: player.balance, error: 'Bất động sản không ở trạng thái cầm cố' };
    }

    const principal = Math.floor(tile.price * 0.5);
    const interest = Math.ceil(principal * 0.1);
    const cost = principal + interest;

    if (player.balance < cost) {
      return { success: false, tileId, cost, remainingCash: player.balance, error: `Không đủ tiền chuộc lại (cần ${cost}M gồm 10% lãi suất)` };
    }

    player.balance -= cost;
    prop.isMortgaged = false;

    this.addLog(`${player.username} đã chuộc lại ô đất [${tile.name}] với giá ${cost}M (gồm 10% lãi suất).`, 'ACTION', player.id, player.username);

    this.updateNetWorth();
    return {
      success: true,
      tileId,
      cost,
      remainingCash: player.balance
    };
  }

  public sellBuilding(userId: string, tileId: number): {
    success: boolean;
    tileId: number;
    level: number;
    refund: number;
    remainingCash: number;
    error?: string;
  } {
    const player = this.players.find(p => p.id === userId);
    if (!player) return { success: false, tileId, level: 0, refund: 0, remainingCash: 0, error: 'Người chơi không tồn tại' };

    const tile = BOARD_TILES[tileId];
    if (!tile) return { success: false, tileId, level: 0, refund: 0, remainingCash: player.balance, error: 'Ô cờ không tồn tại' };

    const prop = this.properties.get(tileId);
    if (!prop || prop.ownerId !== userId) {
      return { success: false, tileId, level: 0, refund: 0, remainingCash: player.balance, error: 'Bạn không sở hữu ô đất này' };
    }

    if (prop.level <= 0) {
      return { success: false, tileId, level: 0, refund: 0, remainingCash: player.balance, error: 'Ô đất chưa có nhà để bán' };
    }

    const houseCost = tile.houseCost || 100;
    const refund = Math.floor(houseCost * 0.5);
    prop.level--;
    player.balance += refund;

    const levelNames = ['Đất trống', 'Nhà cấp 1', 'Nhà cấp 2', 'Nhà cấp 3', 'Landmark 5 Sao'];
    this.addLog(`${player.username} bán 1 cấp công trình tại [${tile.name}], thu về ${refund}M (còn lại: ${levelNames[prop.level]}).`, 'ACTION', player.id, player.username);

    this.updateNetWorth();
    return {
      success: true,
      tileId,
      level: prop.level,
      refund,
      remainingCash: player.balance
    };
  }

  public autoMortgageToCoverDebt(player: PlayerState, debtAmount: number): boolean {
    if (player.balance >= debtAmount) return true;

    // 1. Bán các công trình nhà/khách sạn trước (thu về 50% chi phí xây)
    const propsWithBuildings = Array.from(this.properties.entries())
      .filter(([_, prop]) => prop.ownerId === player.id && prop.level > 0)
      .sort((a, b) => b[1].level - a[1].level);

    for (const [tileId, prop] of propsWithBuildings) {
      const tile = BOARD_TILES[tileId];
      const houseCost = tile.houseCost || 100;
      const refundPerLevel = Math.floor(houseCost * 0.5);

      while (prop.level > 0 && player.balance < debtAmount) {
        prop.level--;
        player.balance += refundPerLevel;
        this.addLog(
          `${player.username} bán bớt 1 công trình trên [${tile.name}], thu về ${refundPerLevel}M để thanh toán nợ.`,
          'ACTION',
          player.id,
          player.username
        );
        if (player.balance >= debtAmount) {
          this.updateNetWorth();
          return true;
        }
      }
    }

    // 2. Cầm cố các bất động sản chưa cầm cố (thu về 50% giá đất)
    const unmortgagedProps = Array.from(this.properties.entries())
      .filter(([_, prop]) => prop.ownerId === player.id && !prop.isMortgaged && prop.level === 0)
      .sort((a, b) => {
        const tileA = BOARD_TILES[a[0]];
        const tileB = BOARD_TILES[b[0]];
        return (tileA.price || 0) - (tileB.price || 0);
      });

    for (const [tileId, prop] of unmortgagedProps) {
      const tile = BOARD_TILES[tileId];
      const mortgageVal = Math.floor(tile.price * 0.5);
      prop.isMortgaged = true;
      player.balance += mortgageVal;
      this.addLog(
        `${player.username} cầm cố ô [${tile.name}], thu về ${mortgageVal}M (50% giá trị) để thanh toán nợ.`,
        'ACTION',
        player.id,
        player.username
      );

      if (player.balance >= debtAmount) {
        this.updateNetWorth();
        return true;
      }
    }

    this.updateNetWorth();
    return player.balance >= debtAmount;
  }

  public useGetOutOfJailCard(userId: string): { success: boolean; error?: string } {
    const player = this.players.find(p => p.id === userId);
    if (!player) return { success: false, error: 'Người chơi không tồn tại' };
    if (!player.inJail) return { success: false, error: 'Người chơi không ở trong tù' };
    if (player.getOutOfJailCards <= 0) return { success: false, error: 'Không có Thẻ Đặc Xá' };

    player.getOutOfJailCards--;
    player.inJail = false;
    player.jailTurns = 0;
    this.addLog(`${player.username} đã sử dụng Thẻ Đặc Xá để ra tù!`, 'JAIL', player.id, player.username);
    return { success: true };
  }

  public useJailBond(userId: string): { success: boolean; error?: string } {
    const player = this.players.find(p => p.id === userId);
    if (!player) return { success: false, error: 'Người chơi không tồn tại' };
    if (!player.inJail) return { success: false, error: 'Người chơi không ở trong tù' };
    if (player.jailBonds <= 0) return { success: false, error: 'Không có Thẻ Bảo Lãnh VIP' };

    player.jailBonds--;
    player.inJail = false;
    player.jailTurns = 0;
    this.addLog(`${player.username} đã sử dụng Thẻ Bảo Lãnh VIP để ra tù!`, 'JAIL', player.id, player.username);
    return { success: true };
  }

  public payJailFine(userId: string): { success: boolean; error?: string } {
    const player = this.players.find(p => p.id === userId);
    if (!player) return { success: false, error: 'Người chơi không tồn tại' };
    if (!player.inJail) return { success: false, error: 'Người chơi không ở trong tù' };

    if (player.balance < 50) {
      this.autoMortgageToCoverDebt(player, 50);
    }
    if (player.balance < 50) return { success: false, error: 'Không đủ tiền nộp phạt 50M' };

    player.balance -= 50;
    this.freeParkingJackpot += 50;
    player.inJail = false;
    player.jailTurns = 0;
    this.addLog(`${player.username} nộp 50M tiền bảo lãnh để ra tù sớm.`, 'JAIL', player.id, player.username);
    return { success: true };
  }

  // ----------------------------------------------------
  // TRADING SYSTEM
  // ----------------------------------------------------
  public proposeTrade(
    senderId: string,
    receiverId: string,
    offered: TradeItem,
    requested: TradeItem
  ): { success: boolean; trade?: TradeOffer; error?: string } {
    if (senderId === receiverId) {
      return { success: false, error: 'Không thể giao dịch với chính mình' };
    }

    const sender = this.players.find(p => p.id === senderId);
    const receiver = this.players.find(p => p.id === receiverId);
    if (!sender || sender.isBankrupt) return { success: false, error: 'Người đề nghị không hợp lệ' };
    if (!receiver || receiver.isBankrupt) return { success: false, error: 'Đối tác giao dịch không hợp lệ' };

    // Validate offered resources
    const offeredCash = Math.max(0, offered.cash || 0);
    const requestedCash = Math.max(0, requested.cash || 0);
    if (sender.balance < offeredCash) {
      return { success: false, error: 'Không đủ số dư tiền mặt để đề nghị' };
    }
    if (sender.getOutOfJailCards < (offered.getOutOfJailCards || 0)) {
      return { success: false, error: 'Không đủ Thẻ Đặc Xá để đề nghị' };
    }
    if (sender.rentWaivers < (offered.rentWaivers || 0)) {
      return { success: false, error: 'Không đủ Thẻ Miễn Trừ Tiền Thuê để đề nghị' };
    }

    // Validate offered properties: sender must own them and have no buildings
    for (const tileId of offered.tileIds || []) {
      const prop = this.properties.get(tileId);
      if (!prop || prop.ownerId !== senderId) {
        return { success: false, error: `Bạn không sở hữu ô [${BOARD_TILES[tileId]?.name}]` };
      }
      if (prop.level > 0) {
        return { success: false, error: `Cần bán hết công trình trên ô [${BOARD_TILES[tileId]?.name}] trước khi giao dịch` };
      }
      const tile = BOARD_TILES[tileId];
      if (tile?.district) {
        const districtTiles = BOARD_TILES.filter(t => t.district === tile.district);
        const hasBuildingsInDistrict = districtTiles.some(t => {
          const p = this.properties.get(t.id);
          return p && p.ownerId === senderId && p.level > 0;
        });
        if (hasBuildingsInDistrict) {
          return { success: false, error: `Cần bán hết nhà trong cùng khu vực trước khi giao dịch ô [${tile.name}]` };
        }
      }
    }

    // Validate requested properties: receiver must own them and have no buildings
    for (const tileId of requested.tileIds || []) {
      const prop = this.properties.get(tileId);
      if (!prop || prop.ownerId !== receiverId) {
        return { success: false, error: `Đối tác không sở hữu ô [${BOARD_TILES[tileId]?.name}]` };
      }
      if (prop.level > 0) {
        return { success: false, error: `Đối tác cần bán hết công trình trên ô [${BOARD_TILES[tileId]?.name}] trước` };
      }
    }

    const tradeId = Math.random().toString(36).substring(2, 9);
    const trade: TradeOffer = {
      id: tradeId,
      senderId,
      receiverId,
      offered: {
        tileIds: [...(offered.tileIds || [])],
        cash: offeredCash,
        getOutOfJailCards: offered.getOutOfJailCards || 0,
        rentWaivers: offered.rentWaivers || 0
      },
      requested: {
        tileIds: [...(requested.tileIds || [])],
        cash: requestedCash,
        getOutOfJailCards: requested.getOutOfJailCards || 0,
        rentWaivers: requested.rentWaivers || 0
      },
      status: 'PENDING',
      createdAt: Date.now()
    };

    this.tradeOffers.set(tradeId, trade);
    this.addLog(`${sender.username} đã gửi đề nghị giao dịch cho ${receiver.username}.`, 'ACTION', sender.id, sender.username);
    return { success: true, trade };
  }

  public acceptTrade(tradeId: string, userId: string): { success: boolean; trade?: TradeOffer; error?: string } {
    const trade = this.tradeOffers.get(tradeId);
    if (!trade) return { success: false, error: 'Đề nghị giao dịch không tồn tại' };
    if (trade.status !== 'PENDING') return { success: false, error: 'Đề nghị giao dịch không còn hiệu lực' };
    if (trade.receiverId !== userId) return { success: false, error: 'Chỉ đối tác nhận mới có quyền chấp thuận đề nghị' };

    const sender = this.players.find(p => p.id === trade.senderId);
    const receiver = this.players.find(p => p.id === trade.receiverId);
    if (!sender || sender.isBankrupt) return { success: false, error: 'Người gửi đề nghị đã phá sản' };
    if (!receiver || receiver.isBankrupt) return { success: false, error: 'Người nhận đã phá sản' };

    // Re-verify balances and assets at acceptance time
    if (sender.balance < trade.offered.cash) return { success: false, error: `${sender.username} không còn đủ tiền mặt` };
    if (receiver.balance < trade.requested.cash) return { success: false, error: `Bạn không đủ tiền mặt để hoàn tất giao dịch` };
    if (sender.getOutOfJailCards < (trade.offered.getOutOfJailCards || 0)) return { success: false, error: 'Thiếu Thẻ Đặc Xá' };
    if (receiver.getOutOfJailCards < (trade.requested.getOutOfJailCards || 0)) return { success: false, error: 'Thiếu Thẻ Đặc Xá' };

    // Verify property ownership
    for (const tileId of trade.offered.tileIds) {
      const prop = this.properties.get(tileId);
      if (!prop || prop.ownerId !== sender.id || prop.level > 0) {
        return { success: false, error: `Tài sản [${BOARD_TILES[tileId]?.name}] không còn hợp lệ để chuyển nhượng` };
      }
    }
    for (const tileId of trade.requested.tileIds) {
      const prop = this.properties.get(tileId);
      if (!prop || prop.ownerId !== receiver.id || prop.level > 0) {
        return { success: false, error: `Tài sản [${BOARD_TILES[tileId]?.name}] không còn hợp lệ để chuyển nhượng` };
      }
    }

    // Execute Cash transfer
    sender.balance -= trade.offered.cash;
    receiver.balance += trade.offered.cash;
    receiver.balance -= trade.requested.cash;
    sender.balance += trade.requested.cash;

    // Execute Cards & Shields transfer
    sender.getOutOfJailCards -= (trade.offered.getOutOfJailCards || 0);
    receiver.getOutOfJailCards += (trade.offered.getOutOfJailCards || 0);
    receiver.getOutOfJailCards -= (trade.requested.getOutOfJailCards || 0);
    sender.getOutOfJailCards += (trade.requested.getOutOfJailCards || 0);

    sender.rentWaivers -= (trade.offered.rentWaivers || 0);
    receiver.rentWaivers += (trade.offered.rentWaivers || 0);
    receiver.rentWaivers -= (trade.requested.rentWaivers || 0);
    sender.rentWaivers += (trade.requested.rentWaivers || 0);

    // Execute Property Transfers (preserves mortgage status)
    for (const tileId of trade.offered.tileIds) {
      const prop = this.properties.get(tileId)!;
      prop.ownerId = receiver.id;
    }
    for (const tileId of trade.requested.tileIds) {
      const prop = this.properties.get(tileId)!;
      prop.ownerId = sender.id;
    }

    trade.status = 'ACCEPTED';
    this.addLog(`🤝 Giao dịch thành công giữa ${sender.username} và ${receiver.username}!`, 'ALERT');
    this.updateNetWorth();
    return { success: true, trade };
  }

  public rejectTrade(tradeId: string, userId: string): { success: boolean; error?: string } {
    const trade = this.tradeOffers.get(tradeId);
    if (!trade) return { success: false, error: 'Đề nghị giao dịch không tồn tại' };
    if (trade.receiverId !== userId) return { success: false, error: 'Chỉ đối tác nhận mới có quyền từ chối' };

    trade.status = 'REJECTED';
    const receiver = this.players.find(p => p.id === userId);
    this.addLog(`${receiver?.username || 'Đối tác'} đã từ chối đề nghị giao dịch.`, 'INFO');
    return { success: true };
  }

  public cancelTrade(tradeId: string, userId: string): { success: boolean; error?: string } {
    const trade = this.tradeOffers.get(tradeId);
    if (!trade) return { success: false, error: 'Đề nghị giao dịch không tồn tại' };
    if (trade.senderId !== userId) return { success: false, error: 'Chỉ người gửi mới có quyền hủy đề nghị' };

    trade.status = 'CANCELLED';
    this.addLog(`Đề nghị giao dịch đã được người gửi hủy bỏ.`, 'INFO');
    return { success: true };
  }

  public setNextPhaseAfterAction(player: PlayerState): 'ROLL_DICE' | 'END_TURN' {
    if (this.turnState.isDouble && !player.inJail && !player.isBankrupt) {
      this.turnState.phase = 'ROLL_DICE';
      this.addLog(`🎉 ${player.username} đổ đôi thành công và được lắc xí ngầu thêm một lượt nữa!`, 'ALERT', player.id, player.username);
      return 'ROLL_DICE';
    } else {
      this.turnState.phase = 'END_TURN';
      return 'END_TURN';
    }
  }

  public handleBankruptcy(bankruptPlayer: PlayerState, creditor?: PlayerState) {
    bankruptPlayer.isBankrupt = true;
    const remainingCash = bankruptPlayer.balance;
    bankruptPlayer.balance = 0;
    this.addLog(`💀 Người chơi ${bankruptPlayer.username} đã chính thức Phá Sản!`, 'ALERT', bankruptPlayer.id, bankruptPlayer.username);

    // Cancel all open trades for this player
    for (const trade of this.tradeOffers.values()) {
      if ((trade.senderId === bankruptPlayer.id || trade.receiverId === bankruptPlayer.id) && trade.status === 'PENDING') {
        trade.status = 'CANCELLED';
      }
    }

    if (creditor) {
      // Transfer remaining cash, cards, and properties to creditor
      creditor.balance += remainingCash;
      creditor.getOutOfJailCards += bankruptPlayer.getOutOfJailCards;
      creditor.rentWaivers += bankruptPlayer.rentWaivers;
      creditor.jailBonds += bankruptPlayer.jailBonds;

      for (const [tileId, prop] of this.properties.entries()) {
        if (prop.ownerId === bankruptPlayer.id) {
          prop.ownerId = creditor.id;
          this.addLog(`Bất động sản [${BOARD_TILES[tileId]?.name}] được chuyển giao cho ${creditor.username}.`, 'INFO', creditor.id, creditor.username);
        }
      }
    } else {
      // Liquidate properties back to the bank for remaining players
      for (const [tileId, prop] of this.properties.entries()) {
        if (prop.ownerId === bankruptPlayer.id) {
          this.properties.delete(tileId);
        }
      }
    }

    bankruptPlayer.getOutOfJailCards = 0;
    bankruptPlayer.rentWaivers = 0;
    bankruptPlayer.jailBonds = 0;

    this.checkGameOver();
  }

  public endTurn(userId: string): { nextUserId: string; isGameOver: boolean } {
    const player = this.getCurrentPlayer();
    if (!player || player.id !== userId) {
      throw new Error('Chưa đến lượt của bạn');
    }

    if (this.checkGameOver()) {
      return { nextUserId: '', isGameOver: true };
    }

    // Tìm người chơi tiếp theo còn sống
    const activePlayers = this.players.filter(p => !p.isBankrupt);
    if (activePlayers.length <= 1) {
      this.checkGameOver();
      return { nextUserId: '', isGameOver: true };
    }

    const currentIndex = this.players.findIndex(p => p.id === userId);
    let nextIndex = (currentIndex + 1) % this.players.length;
    while (this.players[nextIndex].isBankrupt) {
      nextIndex = (nextIndex + 1) % this.players.length;
    }

    const nextPlayer = this.players[nextIndex];
    this.turnState.currentUserId = nextPlayer.id;
    this.turnState.phase = 'ROLL_DICE';
    this.turnState.dice = [1, 1];
    this.turnState.isDouble = false;
    this.turnState.consecutiveDoubles = 0;
    this.turnState.turnStartTime = Date.now();

    this.addLog(`Đến lượt của ${nextPlayer.username}.`, 'INFO', nextPlayer.id, nextPlayer.username);

    return { nextUserId: nextPlayer.id, isGameOver: false };
  }

  public checkGameOver(): boolean {
    const alivePlayers = this.players.filter(p => !p.isBankrupt);
    if (alivePlayers.length <= 1) {
      this.isGameOver = true;
      this.winnerId = alivePlayers[0]?.id || null;
      if (alivePlayers[0]) {
        this.addLog(`🏆 VÁN ĐẤU KẾT THÚC! Nhà Vô Địch Tỷ Phú là ${alivePlayers[0].username}!`, 'ALERT', alivePlayers[0].id, alivePlayers[0].username);
      }
      return true;
    }
    return false;
  }

  public updateNetWorth() {
    for (const player of this.players) {
      let assetValue = player.balance;
      for (const [tileId, prop] of this.properties.entries()) {
        if (prop.ownerId === player.id) {
          const tile = BOARD_TILES[tileId];
          if (prop.isMortgaged) {
            assetValue += Math.floor(tile.price * 0.5);
          } else {
            assetValue += tile.price + (prop.level * (tile.houseCost || 100));
          }
        }
      }
      player.netWorth = assetValue;
    }
  }

  public addLog(message: string, type: GameLogEntry['type'] = 'INFO', userId?: string, userName?: string) {
    const entry: GameLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      userId,
      userName,
      message,
      type
    };
    this.logs.unshift(entry);
    if (this.logs.length > 50) this.logs.pop();
  }

  public getSnapshot() {
    this.updateNetWorth();
    return {
      roomId: this.roomId,
      players: this.players,
      properties: Array.from(this.properties.values()),
      turnState: this.turnState,
      logs: this.logs.slice(0, 20),
      isGameOver: this.isGameOver,
      winnerId: this.winnerId,
      freeParkingJackpot: this.freeParkingJackpot,
      tradeOffers: Array.from(this.tradeOffers.values()).filter(t => t.status === 'PENDING')
    };
  }
}
