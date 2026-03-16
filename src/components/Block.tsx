import { motion } from 'framer-motion';
import type { Block as BlockType } from '../types';
import { COLOR_MAP, COLOR_EMOJI, SPECIAL_EMOJI } from '../types';

interface BlockProps {
  block: BlockType;
  isHighlighted: boolean;
  isShaking: boolean;
  groupSize: number;
  blockSize: number;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}

const shakeAnimation = {
  x: [0, -3, 3, -2, 2, 0],
  transition: { duration: 0.35 },
};

export default function Block({
  block,
  isHighlighted,
  isShaking,
  groupSize,
  blockSize,
  onClick,
  onHover,
  onLeave,
}: BlockProps) {
  const bgColor = COLOR_MAP[block.color];
  const emoji = block.special ? SPECIAL_EMOJI[block.special] : COLOR_EMOJI[block.color];
  const fontSize = Math.max(blockSize * 0.55, 16);

  const isSpecial = !!block.special;

  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={
        isShaking
          ? shakeAnimation
          : isHighlighted
            ? { scale: 1.05, opacity: 1, y: -2, x: 0 }
            : { scale: 1, opacity: 1, y: 0, x: 0 }
      }
      exit={{
        scale: [1, 1.2, 0],
        opacity: [1, 1, 0],
        transition: { duration: 0.3, times: [0, 0.3, 1] },
      }}
      transition={{
        layout: { type: 'spring', stiffness: 300, damping: 25 },
        scale: { duration: 0.2 },
      }}
      role="button"
      tabIndex={0}
      aria-label={`${block.special ?? block.color} 블록${groupSize > 1 ? `, ${groupSize}개 연결됨` : ''}`}
      className="relative cursor-pointer select-none"
      style={{
        width: blockSize,
        height: blockSize,
        borderRadius: 12,
        background: isSpecial
          ? `linear-gradient(135deg, ${bgColor}aa, ${bgColor}, ${bgColor}aa)`
          : `linear-gradient(135deg, ${bgColor}cc, ${bgColor})`,
        boxShadow: isHighlighted
          ? `0 0 12px ${bgColor}88, 0 4px 8px rgba(0,0,0,0.2)`
          : isSpecial
            ? `0 0 8px ${bgColor}66, 0 2px 4px rgba(0,0,0,0.15)`
            : `0 2px 4px rgba(0,0,0,0.15)`,
        transition: 'box-shadow 0.15s',
      }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onTouchStart={onHover}
      onTouchEnd={onLeave}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    >
      {/* 광택 효과 */}
      <div
        className="absolute inset-x-1 top-1 rounded-t-md pointer-events-none"
        style={{
          height: '40%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)',
          borderRadius: '6px 6px 50% 50%',
        }}
      />
      {/* 특수 블록 테두리 반짝임 */}
      {isSpecial && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            border: '2px solid rgba(255,255,255,0.6)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      )}
      {/* 이모지 */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ fontSize }}
      >
        {emoji}
      </div>
      {/* 호버 시 그룹 수 표시 */}
      {isHighlighted && groupSize > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap z-50 pointer-events-none"
        >
          {groupSize}개
        </motion.div>
      )}
    </motion.div>
  );
}
