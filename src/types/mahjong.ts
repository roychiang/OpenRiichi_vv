export interface MahjongTile {
  id: string;
  type: 'bamboo' | 'character' | 'dot' | 'wind' | 'dragon' | 'flower';
  value: number;
  isRed?: boolean;
}

export interface PlayerHand {
  tiles: MahjongTile[];
  isTsumo: boolean;
  isRiichi: boolean;
  openMelds: Meld[];
}

export interface Meld {
  type: 'chi' | 'pon' | 'kan' | 'min-kan';
  tiles: MahjongTile[];
}

export type GamePhase = 
  | 'WAITING_START' 
  | 'DEALING' 
  | 'PLAYER_TURN' 
  | 'AI_TURN' 
  | 'CHECK_ACTION' 
  | 'GAME_END';

export type ActionType = 'chi' | 'pon' | 'kan' | 'ron';

export interface PendingAction {
  type: ActionType;
  playerIndex: number;
  targetTile: MahjongTile;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number; // 0-3
  wall: MahjongTile[];
  discardPile: MahjongTile[];
  phase: GamePhase;
  turnCount: number;
  doraIndicators: MahjongTile[];
  lastDiscard: MahjongTile | null;
  pendingActions: PendingAction[];
}

export interface Player {
  id: string;
  name: string;
  hand: MahjongTile[];
  discardPile: MahjongTile[]; // 每個玩家自己的棄牌區
  points: number;
  position: 0 | 1 | 2 | 3; // 東南西北
  isRiichi: boolean;
}