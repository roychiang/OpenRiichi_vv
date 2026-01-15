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
}

export interface GameState {
  players: Player[];
  currentPlayer: number;
  wall: MahjongTile[];
  discardPile: MahjongTile[];
  gamePhase: 'waiting' | 'dealing' | 'playing' | 'finished';
}

export interface Player {
  id: string;
  name: string;
  hand: MahjongTile[];
  points: number;
  position: 0 | 1 | 2 | 3; // 東南西北
}