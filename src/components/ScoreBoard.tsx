import { motion, AnimatePresence } from 'framer-motion';
import type { ScorePopup } from '../hooks/useGame';

interface ScoreBoardProps {
  popups: ScorePopup[];
  blockSize: number;
  gap: number;
  boardOffsetX: number;
  boardOffsetY: number;
}

export default function ScoreBoard({
  popups,
  blockSize,
  gap,
  boardOffsetX,
  boardOffsetY,
}: ScoreBoardProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      <AnimatePresence>
        {popups.map((popup) => (
          <motion.div
            key={popup.id}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -40, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute text-amber-500 font-bold text-lg z-50 whitespace-nowrap"
            style={{
              left: boardOffsetX + popup.x * (blockSize + gap) + blockSize / 2,
              top: boardOffsetY + popup.y * (blockSize + gap),
              transform: 'translateX(-50%)',
            }}
          >
            +{popup.score}점!
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
