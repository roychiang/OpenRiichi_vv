import { useState, useCallback, useEffect } from 'react';
import { GameState, GamePhase, Player, MahjongTile, PendingAction } from '../types/mahjong';
import { generateMahjongTiles, shuffleTiles } from '../utils/tileGenerator';

const INITIAL_POINTS = 25000;

// Helpers
const canPon = (hand: MahjongTile[], tile: MahjongTile) => {
  return hand.filter(t => t.type === tile.type && t.value === tile.value).length >= 2;
};

const canKan = (hand: MahjongTile[], tile: MahjongTile) => {
  return hand.filter(t => t.type === tile.type && t.value === tile.value).length >= 3;
};

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    wall: [],
    discardPile: [],
    phase: 'WAITING_START',
    turnCount: 0,
    doraIndicators: [],
    lastDiscard: null,
    pendingActions: [],
  });

  const startGame = useCallback(() => {
    const allTiles = generateMahjongTiles();
    const shuffledTiles = shuffleTiles(allTiles);
    
    const players: Player[] = Array.from({ length: 4 }).map((_, i) => ({
      id: `player-${i}`,
      name: i === 0 ? 'Player (You)' : `CPU ${i}`,
      hand: [],
      discardPile: [],
      points: INITIAL_POINTS,
      position: i as 0 | 1 | 2 | 3,
      isRiichi: false,
    }));

    let currentTileIndex = 0;
    players.forEach(player => {
      player.hand = shuffledTiles.slice(currentTileIndex, currentTileIndex + 13);
      player.hand.sort((a, b) => {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        return a.value - b.value;
      });
      currentTileIndex += 13;
    });

    const doraIndicators = [shuffledTiles[currentTileIndex]];
    currentTileIndex++;
    const wall = shuffledTiles.slice(currentTileIndex);

    setGameState({
      players,
      currentPlayerIndex: 0,
      wall,
      discardPile: [],
      phase: 'PLAYER_TURN',
      turnCount: 1,
      doraIndicators,
      lastDiscard: null,
      pendingActions: [],
    });
  }, []);

  const drawTile = useCallback(() => {
    setGameState(prev => {
      if (prev.wall.length === 0) return { ...prev, phase: 'GAME_END' };

      const newWall = [...prev.wall];
      const drawnTile = newWall.pop()!;
      
      const newPlayers = [...prev.players];
      const currentPlayer = { ...newPlayers[prev.currentPlayerIndex] };
      currentPlayer.hand = [...currentPlayer.hand, drawnTile];
      newPlayers[prev.currentPlayerIndex] = currentPlayer;

      return {
        ...prev,
        wall: newWall,
        players: newPlayers,
        phase: prev.currentPlayerIndex === 0 ? 'PLAYER_TURN' : 'AI_TURN',
      };
    });
  }, []);

  const discardTile = useCallback((tileId: string) => {
    setGameState(prev => {
      const newPlayers = [...prev.players];
      const currentPlayer = { ...newPlayers[prev.currentPlayerIndex] };
      
      const tileIndex = currentPlayer.hand.findIndex(t => t.id === tileId);
      if (tileIndex === -1) return prev;

      const [discardedTile] = currentPlayer.hand.splice(tileIndex, 1);
      
      currentPlayer.hand.sort((a, b) => {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        return a.value - b.value;
      });

      currentPlayer.discardPile = [...currentPlayer.discardPile, discardedTile];
      newPlayers[prev.currentPlayerIndex] = currentPlayer;

      // Check actions for Human Player (Index 0)
      const pendingActions: PendingAction[] = [];
      if (prev.currentPlayerIndex !== 0) { // If not human's discard
        const humanPlayer = newPlayers[0];
        if (canPon(humanPlayer.hand, discardedTile)) {
          pendingActions.push({ type: 'pon', playerIndex: 0, targetTile: discardedTile });
        }
        if (canKan(humanPlayer.hand, discardedTile)) {
          pendingActions.push({ type: 'kan', playerIndex: 0, targetTile: discardedTile });
        }
        // TODO: Add Ron check
      }

      if (pendingActions.length > 0) {
        return {
          ...prev,
          players: newPlayers,
          discardPile: [...prev.discardPile, discardedTile],
          lastDiscard: discardedTile,
          phase: 'CHECK_ACTION',
          pendingActions,
        };
      }

      // No actions, proceed to next player
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % 4;
      return {
        ...prev,
        players: newPlayers,
        discardPile: [...prev.discardPile, discardedTile],
        lastDiscard: discardedTile,
        currentPlayerIndex: nextPlayerIndex,
        phase: nextPlayerIndex === 0 ? 'PLAYER_TURN' : 'AI_TURN',
        pendingActions: [],
      };
    });
  }, []);

  const skipAction = useCallback(() => {
    setGameState(prev => {
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % 4;
      return {
        ...prev,
        phase: nextPlayerIndex === 0 ? 'PLAYER_TURN' : 'AI_TURN',
        pendingActions: [],
        currentPlayerIndex: nextPlayerIndex,
      };
    });
  }, []);

  const performAction = useCallback((action: PendingAction) => {
    // TODO: Implement actual action logic (Pon/Kan)
    console.log('Perform action:', action);
    // For now, just skip
    skipAction();
  }, [skipAction]);

  // AI Logic
  useEffect(() => {
    if (gameState.phase === 'AI_TURN') {
      const timer = setTimeout(() => {
        drawTile();
        setTimeout(() => {
          setGameState(prev => {
            const aiPlayer = prev.players[prev.currentPlayerIndex];
            const randomDiscardIndex = Math.floor(Math.random() * aiPlayer.hand.length);
            const tileToDiscard = aiPlayer.hand[randomDiscardIndex];
            
            // AI Discard Logic (Duplicate of discardTile logic for state update)
            const newPlayers = [...prev.players];
            const currentPlayer = { ...newPlayers[prev.currentPlayerIndex] };
            const [discarded] = currentPlayer.hand.splice(randomDiscardIndex, 1);
            currentPlayer.hand.sort((a, b) => {
                if (a.type !== b.type) return a.type.localeCompare(b.type);
                return a.value - b.value;
            });
            currentPlayer.discardPile = [...currentPlayer.discardPile, discarded];
            newPlayers[prev.currentPlayerIndex] = currentPlayer;
            
            // Check Actions for Human
            const pendingActions: PendingAction[] = [];
            const humanPlayer = newPlayers[0];
            if (canPon(humanPlayer.hand, discarded)) {
              pendingActions.push({ type: 'pon', playerIndex: 0, targetTile: discarded });
            }
             if (canKan(humanPlayer.hand, discarded)) {
              pendingActions.push({ type: 'kan', playerIndex: 0, targetTile: discarded });
            }

            if (pendingActions.length > 0) {
               return {
                ...prev,
                players: newPlayers,
                discardPile: [...prev.discardPile, discarded],
                lastDiscard: discarded,
                phase: 'CHECK_ACTION',
                pendingActions,
              };
            }

            const nextPlayerIndex = (prev.currentPlayerIndex + 1) % 4;
            return {
              ...prev,
              players: newPlayers,
              discardPile: [...prev.discardPile, discarded],
              lastDiscard: discarded,
              currentPlayerIndex: nextPlayerIndex,
              phase: nextPlayerIndex === 0 ? 'PLAYER_TURN' : 'AI_TURN',
            };
          });
        }, 500);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.currentPlayerIndex, drawTile]);

  return {
    gameState,
    startGame,
    drawTile,
    discardTile,
    skipAction,
    performAction,
  };
}