import { MahjongTile } from '../types/mahjong';

export function generateMahjongTiles(): MahjongTile[] {
  const tiles: MahjongTile[] = [];
  let id = 0;

  // 萬子 (Characters) - 1-9, 各4張
  for (let value = 1; value <= 9; value++) {
    for (let count = 0; count < 4; count++) {
      tiles.push({
        id: `character_${value}_${count}`,
        type: 'character',
        value,
        isRed: value === 5 && count === 0 // 赤五萬
      });
    }
  }

  // 筒子 (Dots) - 1-9, 各4張
  for (let value = 1; value <= 9; value++) {
    for (let count = 0; count < 4; count++) {
      tiles.push({
        id: `dot_${value}_${count}`,
        type: 'dot',
        value,
        isRed: value === 5 && count === 0 // 赤五筒
      });
    }
  }

  // 索子 (Bamboo) - 1-9, 各4張
  for (let value = 1; value <= 9; value++) {
    for (let count = 0; count < 4; count++) {
      tiles.push({
        id: `bamboo_${value}_${count}`,
        type: 'bamboo',
        value,
        isRed: value === 5 && count === 0 // 赤五索
      });
    }
  }

  // 風牌 (Winds) - 東南西北, 各4張
  const winds = ['東', '南', '西', '北'];
  for (let value = 1; value <= 4; value++) {
    for (let count = 0; count < 4; count++) {
      tiles.push({
        id: `wind_${value}_${count}`,
        type: 'wind',
        value
      });
    }
  }

  // 箭牌 (Dragons) - 中發白, 各4張
  for (let value = 1; value <= 3; value++) {
    for (let count = 0; count < 4; count++) {
      tiles.push({
        id: `dragon_${value}_${count}`,
        type: 'dragon',
        value
      });
    }
  }

  return tiles;
}

export function shuffleTiles(tiles: MahjongTile[]): MahjongTile[] {
  const shuffled = [...tiles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealInitialHand(tiles: MahjongTile[]): MahjongTile[] {
  return tiles.slice(0, 13);
}