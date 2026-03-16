import { motion } from 'framer-motion';
import type { BlockColor } from '../types';
import { COLOR_MAP, COLOR_EMOJI } from '../types';

interface ColorPickerProps {
  colors: BlockColor[];
  onPick: (color: BlockColor) => void;
}

export default function ColorPicker({ colors, onPick }: ColorPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="bg-white rounded-3xl p-6 shadow-2xl text-center max-w-xs w-full"
      >
        <p className="text-lg font-bold text-gray-800 mb-1">🌈 색상을 선택하세요!</p>
        <p className="text-sm text-gray-400 mb-4">선택한 색의 블록을 모두 제거합니다</p>
        <div className="flex justify-center gap-3 flex-wrap">
          {colors.map((color) => (
            <motion.button
              key={color}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onPick(color)}
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-md"
              style={{ backgroundColor: COLOR_MAP[color] }}
            >
              {COLOR_EMOJI[color]}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
