import { useState, useEffect } from 'react';
import { MahjongTile } from '../types/mahjong';
import { generateMahjongTiles, shuffleTiles, dealInitialHand } from '../utils/tileGenerator';

export function GamePage() {
  const [tiles, setTiles] = useState<MahjongTile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTile, setSelectedTile] = useState<string | null>(null);

  useEffect(() => {
    // 模擬發牌流程
    const initializeGame = () => {
      setIsLoading(true);
      
      // 生成所有麻將牌
      const allTiles = generateMahjongTiles();
      
      // 洗牌
      const shuffledTiles = shuffleTiles(allTiles);
      
      // 發初始手牌（13張）+ 一些棄牌用於演示
      const initialTiles = [
        ...dealInitialHand(shuffledTiles),
        ...shuffledTiles.slice(13, 25) // 額外的牌用於牌河
      ];
      
      setTiles(initialTiles);
      setIsLoading(false);
    };

    // 延遲一點時間來模擬真實的發牌體驗
    const timer = setTimeout(initializeGame, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const getTileColor = (tile: MahjongTile) => {
    switch (tile.type) {
      case 'bamboo': return 'bg-green-500';
      case 'character': return 'bg-yellow-500';
      case 'dot': return 'bg-red-500';
      case 'wind': return 'bg-purple-500';
      case 'dragon': return 'bg-red-600';
      case 'flower': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getTileText = (tile: MahjongTile) => {
    switch (tile.type) {
      case 'bamboo': return `竹${tile.value}`;
      case 'character': return `${tile.value}萬`;
      case 'dot': return `${tile.value}筒`;
      case 'wind': return ['東', '南', '西', '北'][tile.value - 1] || '風';
      case 'dragon': return ['中', '發', '白'][tile.value - 1] || '龍';
      case 'flower': return `花${tile.value}`;
      default: return '?';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-green-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">正在發牌中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 遊戲標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">WebGL 立直麻將</h1>
          <p className="text-green-200">概念驗證版本 - 2D 演示</p>
        </div>

        {/* 遊戲狀態 */}
        <div className="bg-black bg-opacity-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between text-white">
            <div>
              <p className="text-sm">手牌數量: {tiles.slice(0, 13).length}</p>
              <p className="text-sm">牌河數量: {tiles.slice(13).length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">當前玩家: 東家</p>
              <p className="text-sm">回合: 第1回合</p>
            </div>
          </div>
        </div>

        {/* 手牌區域 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">我的手牌</h2>
          <div className="bg-green-700 bg-opacity-50 rounded-lg p-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {tiles.slice(0, 13).map((tile) => (
                <div
                  key={tile.id}
                  className={`w-16 h-24 ${getTileColor(tile)} rounded-lg border-2 border-white shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-200 ${
                    selectedTile === tile.id ? 'ring-4 ring-yellow-400 scale-110' : ''
                  }`}
                  onClick={() => setSelectedTile(selectedTile === tile.id ? null : tile.id)}
                >
                  <div className="h-full flex flex-col justify-center items-center text-white font-bold">
                    <div className="text-lg">{getTileText(tile)}</div>
                    {tile.isRed && <div className="text-xs text-red-200">赤</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 牌河區域 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">牌河（棄牌區）</h2>
          <div className="bg-amber-700 bg-opacity-50 rounded-lg p-4">
            <div className="grid grid-cols-6 gap-2">
              {tiles.slice(13).map((tile, index) => (
                <div
                  key={tile.id}
                  className={`w-12 h-16 ${getTileColor(tile)} rounded border border-white shadow-md`}
                >
                  <div className="h-full flex items-center justify-center text-white text-sm font-bold">
                    {getTileText(tile)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex justify-center space-x-4 mb-8">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            摸牌
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            立直
          </button>
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            和牌
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            吃
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            碰
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            槓
          </button>
        </div>

        {/* 選中的牌信息 */}
        {selectedTile && (
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">選中的牌</h3>
            {(() => {
              const tile = tiles.find(t => t.id === selectedTile);
              return tile ? (
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-24 ${getTileColor(tile)} rounded-lg border-2 border-yellow-400`}>
                    <div className="h-full flex flex-col justify-center items-center text-white font-bold">
                      <div className="text-lg">{getTileText(tile)}</div>
                      {tile.isRed && <div className="text-xs text-red-200">赤</div>}
                    </div>
                  </div>
                  <div>
                    <p className="text-yellow-800">類型: {tile.type}</p>
                    <p className="text-yellow-800">數值: {tile.value}</p>
                    {tile.isRed && <p className="text-red-600 font-semibold">赤五牌</p>}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* 遊戲說明 */}
        <div className="bg-black bg-opacity-50 rounded-lg p-4 text-white text-sm">
          <h3 className="font-semibold mb-2">遊戲說明</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>點擊手牌來選擇要打的牌</li>
            <li>使用操作按鈕進行吃、碰、槓、立直等操作</li>
            <li>牌河顯示所有玩家打出的牌</li>
            <li>目標是完成特定的牌型和牌</li>
          </ul>
        </div>
      </div>
    </div>
  );
}