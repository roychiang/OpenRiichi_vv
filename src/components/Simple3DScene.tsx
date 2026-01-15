import { Canvas } from '@react-three/fiber';
import { useState, useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { MahjongTile } from '../types/mahjong';

interface Simple3DSceneProps {
  hand: MahjongTile[];
  discardPile: MahjongTile[];
}

function AnimatedTile({ tile, position, onClick, isSelected }: {
  tile: MahjongTile;
  position: [number, number, number];
  onClick: () => void;
  isSelected: boolean;
}) {
  const meshRef = useRef<Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  const getTileColor = () => {
    switch (tile.type) {
      case 'bamboo': return '#22c55e';
      case 'character': return '#eab308';
      case 'dot': return '#ef4444';
      case 'wind': return '#a855f7';
      case 'dragon': return '#dc2626';
      case 'flower': return '#ec4899';
      default: return '#6b7280';
    }
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'default'}
      >
        <boxGeometry args={[0.8, 1.2, 0.15]} />
        <meshStandardMaterial color={getTileColor()} />
      </mesh>
      
      {/* 牌的正面 */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[0.7, 1.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
}

export function Simple3DScene({ hand, discardPile }: Simple3DSceneProps) {
  const [selectedTile, setSelectedTile] = useState<string | null>(null);

  const handleTileClick = (tileId: string) => {
    setSelectedTile(tileId === selectedTile ? null : tileId);
  };

  return (
    <div className="w-full h-96 bg-gradient-to-b from-blue-900 to-blue-700 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.4} />
        
        {/* 簡單的桌面 */}
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[15, 10]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        
        {/* 手牌 */}
        <group position={[0, 0, 3]}>
          {hand.map((tile, index) => (
            <AnimatedTile
              key={tile.id}
              tile={tile}
              position={[(index - (hand.length - 1) / 2) * 0.9, 0, 0]}
              onClick={() => handleTileClick(tile.id)}
              isSelected={selectedTile === tile.id}
            />
          ))}
        </group>
        
        {/* 牌河 (6列佈局) */}
        <group position={[0, 0, -1]}>
          {discardPile.map((tile, index) => {
            const row = Math.floor(index / 6);
            const col = index % 6;
            return (
              <AnimatedTile
                key={tile.id}
                tile={tile}
                position={[(col - 2.5) * 0.9, 0, -row * 1.3]}
                onClick={() => {}}
                isSelected={false}
              />
            );
          })}
        </group>
      </Canvas>
      
      {selectedTile && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-2 rounded">
          <p className="text-sm">選中了牌: {selectedTile}</p>
        </div>
      )}
    </div>
  );
}