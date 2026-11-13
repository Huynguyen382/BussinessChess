export * from './CardsConfig';
import { GameCard, CardActionType } from './CardsConfig';

export function isInteractiveCard(card: GameCard): boolean {
  const interactiveActions: CardActionType[] = [
    'PROPERTY_ACQUISITION',
    'PROPERTY_SWAP',
    'RENT_WAIVER',
    'RENT_MULTIPLIER',
    'DISASTER',
    'TAX_AUDIT',
    'INSTANT_TRANSIT',
    'HOSPITAL_BOND',
    'MINI_EVENT',
    'DIVIDEND_PAYOUT'
  ];
  return interactiveActions.includes(card.action);
}

export function getCardCategory(action: CardActionType): 'ECONOMY' | 'MOVEMENT' | 'LEGAL' | 'STRATEGIC' {
  switch (action) {
    case 'ADD_MONEY':
    case 'SUB_MONEY':
    case 'PAY_EACH_PLAYER':
    case 'COLLECT_FROM_EACH_PLAYER':
    case 'DIVIDEND_PAYOUT':
    case 'TAX_AUDIT':
    case 'REPAIR_PROPERTY':
      return 'ECONOMY';
    case 'MOVE_TO':
    case 'MOVE_STEPS':
    case 'INSTANT_TRANSIT':
      return 'MOVEMENT';
    case 'GO_TO_JAIL':
    case 'GET_OUT_OF_JAIL':
    case 'HOSPITAL_BOND':
      return 'LEGAL';
    case 'PROPERTY_ACQUISITION':
    case 'PROPERTY_SWAP':
    case 'RENT_WAIVER':
    case 'RENT_MULTIPLIER':
    case 'DISASTER':
    case 'MINI_EVENT':
    default:
      return 'STRATEGIC';
  }
}
