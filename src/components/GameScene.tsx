import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import { MahjongTile } from './MahjongTile';
import { MahjongTile as MahjongTileType } from '../types/mahjong';

interface GameSceneProps {
  tiles: MahjongTileType[];
}

export function GameScene({ tiles }: GameSceneProps) {
  const [selectedTile, setSelectedTile] = useState<string | null>(null);

  const handleTileClick = (tileId: string) => {
    setSelectedTile(tileId === selectedTile ? null : tileId);
  };

  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 50 }}
      style={{ width: '100%', height: '100vh' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} />
      
      {/* 麻將桌 */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>
      
      {/* 牌桌邊框 */}
      <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.8, 6.2, 32]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* 玩家手牌 */}
      <group position={[0, 0, 4]}>
        {tiles.slice(0, 13).map((tile, index) => (
          <MahjongTile
            key={tile.id}
            tile={tile}
            position={[(index - 6) * 1.2, 0, 0]}
            onClick={() => handleTileClick(tile.id)}
            isSelected={selectedTile === tile.id}
          />
        ))}
      </group>
      
      {/* 牌河（棄牌區） */}
      <group position={[0, 0, 0]}>
        {tiles.slice(13, 25).map((tile, index) => {
          const row = Math.floor(index / 6);
          const col = index % 6;
          return (
            <MahjongTile
              key={tile.id}
              tile={tile}
              position={[(col - 2.5) * 1.2, row * 0.3, 0]}
              rotation={[0, 0, 0]}
            />
          );
        })}
      </group>
      
      {/* 簡單的遊戲標題 */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[4, 0.5, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </Canvas>
  );
}