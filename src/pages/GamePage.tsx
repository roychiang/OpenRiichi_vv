import { useState, useEffect } from 'react';
import { MahjongTile, ActionType } from '../types/mahjong';
import { Simple3DScene } from '../components/Simple3DScene';
import { useGameLogic } from '../hooks/useGameLogic';

export function GamePage() {
  const { gameState, startGame, drawTile, discardTile, skipAction, performAction } = useGameLogic();
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');

  // 初始化遊戲
  useEffect(() => {
    startGame();
  }, [startGame]);

  const currentPlayer = gameState.players[0]; // 假設玩家總是 index 0
  const isPlayerTurn = gameState.phase === 'PLAYER_TURN' && gameState.currentPlayerIndex === 0;

  const canPerform = (type: ActionType) => {
    return gameState.phase === 'CHECK_ACTION' && 
           gameState.pendingActions.some(a => a.type === type && a.playerIndex === 0);
  };

  const handleAction = (type: ActionType) => {
    const action = gameState.pendingActions.find(a => a.type === type && a.playerIndex === 0);
    if (action) {
      performAction(action);
    }
  };

  const handleTileClick = (tileId: string) => {
    if (!isPlayerTurn) return;
    
    if (selectedTile === tileId) {
      // 再次點擊確認打牌
      discardTile(tileId);
      setSelectedTile(null);
    } else {
      setSelectedTile(tileId);
    }
  };

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

  if (!currentPlayer) {
    return (
      <div className="flex items-center justify-center h-screen bg-green-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">正在初始化牌局...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 遊戲標題和視圖切換 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">WebGL 立直麻將</h1>
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === '2d'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              2D 視圖
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === '3d'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              3D 視圖
            </button>
          </div>
          <p className="text-green-200">
            Phase 2: {gameState.phase} - 當前玩家: {gameState.players[gameState.currentPlayerIndex]?.name}
          </p>
        </div>

        {/* 3D 視圖 */}
        {viewMode === '3d' && (
          <div className="mb-8 relative">
            <h2 className="text-xl font-semibold text-white mb-4">3D 遊戲場景</h2>
            <Simple3DScene hand={currentPlayer.hand} discardPile={gameState.discardPile} />
          </div>
        )}

        {/* 2D 視圖 */}
        {viewMode === '2d' && (
          <>
            {/* 遊戲狀態 */}
            <div className="bg-black bg-opacity-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-white">
                <div>
                  <p className="text-sm">手牌數量: {currentPlayer.hand.length}</p>
                  <p className="text-sm">剩餘牌山: {gameState.wall.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">當前玩家: {['東', '南', '西', '北'][gameState.currentPlayerIndex]}</p>
                  <p className="text-sm">局數: {gameState.turnCount}</p>
                </div>
              </div>
            </div>

            {/* 手牌區域 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">我的手牌</h2>
              <div className={`bg-green-700 bg-opacity-50 rounded-lg p-4 ${isPlayerTurn ? 'ring-4 ring-yellow-400' : ''}`}>
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentPlayer.hand.map((tile) => (
                    <div
                      key={tile.id}
                      className={`w-16 h-24 ${getTileColor(tile)} rounded-lg border-2 border-white shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-200 ${
                        selectedTile === tile.id ? 'ring-4 ring-yellow-400 scale-110' : ''
                      }`}
                      onClick={() => handleTileClick(tile.id)}
                    >
                      <div className="h-full flex flex-col justify-center items-center text-white font-bold">
                        <div className="text-lg">{getTileText(tile)}</div>
                        {tile.isRed && <div className="text-xs text-red-200">赤</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {!isPlayerTurn && (
                <p className="text-center text-gray-300 mt-2">等待其他玩家...</p>
              )}
            </div>

            {/* 牌河區域 (顯示所有玩家的棄牌，這裡簡化為顯示最後一張和自己的) */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">場上棄牌</h2>
              <div className="bg-amber-700 bg-opacity-50 rounded-lg p-4">
                <div className="grid grid-cols-6 gap-2">
                  {gameState.discardPile.map((tile, index) => (
                    <div
                      key={`${tile.id}-${index}`}
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
          </>
        )}

        {/* 操作按鈕 */}
        <div className="flex justify-center space-x-4 mb-8">
          <button 
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isPlayerTurn && currentPlayer.hand.length % 3 === 1 // 只有缺牌時才能摸 (13張)
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            onClick={() => isPlayerTurn && drawTile()}
            disabled={!isPlayerTurn || currentPlayer.hand.length % 3 !== 1}
          >
            摸牌
          </button>
          
          <button 
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              canPerform('ron') ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
            }`}
            onClick={() => handleAction('ron')}
            disabled={!canPerform('ron')}
          >
            和牌 (Ron)
          </button>

          <button 
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              canPerform('chi') ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
            }`}
            onClick={() => handleAction('chi')}
            disabled={!canPerform('chi')}
          >
            吃 (Chi)
          </button>

          <button 
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              canPerform('pon') ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
            }`}
            onClick={() => handleAction('pon')}
            disabled={!canPerform('pon')}
          >
            碰 (Pon)
          </button>

          <button 
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              canPerform('kan') ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
            }`}
            onClick={() => handleAction('kan')}
            disabled={!canPerform('kan')}
          >
            槓 (Kan)
          </button>

          {gameState.phase === 'CHECK_ACTION' && (
            <button 
              className="px-6 py-3 rounded-lg font-semibold transition-colors bg-gray-500 hover:bg-gray-600 text-white"
              onClick={skipAction}
            >
              跳過 (Skip)
            </button>
          )}
        </div>

        {/* 遊戲說明 */}
        <div className="bg-black bg-opacity-50 rounded-lg p-4 text-white text-sm">
          <h3 className="font-semibold mb-2">Phase 2 操作說明</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>輪到你時（黃色邊框亮起），點擊「摸牌」按鈕摸牌</li>
            <li>點擊手牌選中，再次點擊已選中的牌即可打出</li>
            <li>AI 對手會自動摸打（目前為快速模擬）</li>
          </ul>
        </div>
      </div>
    </div>
  );
}