import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { MahjongTile as MahjongTileType } from '../types/mahjong';

interface MahjongTileProps {
  tile: MahjongTileType;
  position: [number, number, number];
  rotation?: [number, number, number];
  onClick?: () => void;
  isSelected?: boolean;
}

export function MahjongTile({ tile, position, rotation = [0, 0, 0], onClick, isSelected }: MahjongTileProps) {
  const meshRef = useRef<Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  const getTileColor = () => {
    switch (tile.type) {
      case 'bamboo': return '#4ade80';
      case 'character': return '#f59e0b';
      case 'dot': return '#ef4444';
      case 'wind': return '#8b5cf6';
      case 'dragon': return '#dc2626';
      case 'flower': return '#ec4899';
      default: return '#6b7280';
    }
  };

  const getTileText = () => {
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

  return (
    <group position={position} rotation={rotation}>
      {/* 麻將牌主體 */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'default'}
      >
        <boxGeometry args={[1, 1.4, 0.2]} />
        <meshStandardMaterial color={getTileColor()} />
      </mesh>
      
      {/* 牌的正面 */}
      <mesh position={[0, 0, 0.11]}>
        <planeGeometry args={[0.9, 1.3]} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* 牌的內容文字 */}
      <mesh position={[0, 0, 0.12]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color="black" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}