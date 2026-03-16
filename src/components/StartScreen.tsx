import { motion } from 'framer-motion';
import type { Difficulty, GameMode } from '../types';
import { DIFFICULTIES } from '../types';

interface StartScreenProps {
  onStart: (difficulty: Difficulty, mode?: GameMode) => void;
  highScores: Record<string, number>;
  todayPlays: number;
}

export default function StartScreen({ onStart, highScores, todayPlays }: StartScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-5"
    >
      <motion.h1
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="font-bold mb-3 text-gray-800 whitespace-nowrap"
        style={{ fontSize: 'clamp(3rem, 12vw, 6rem)' }}
      >
        💥 블록 팡!
      </motion.h1>
      <p className="text-gray-500 mb-8 md:mb-10" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)' }}>
        같은 블록을 모아서 터뜨리자!
      </p>

      {/* 목표 모드 */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onStart(DIFFICULTIES[1], 'mission')}
        className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-3xl p-5 md:p-6 shadow-lg hover:shadow-xl transition-shadow text-left border border-white/30 mb-4"
        style={{ maxWidth: 480 }}
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl">🎯</span>
          <div>
            <div className="font-bold text-xl">목표 모드</div>
            <div className="text-sm text-white/80">10개의 미션을 클리어하자!</div>
          </div>
        </div>
      </motion.button>

      {/* 자유 모드 난이도 선택 */}
      <p className="text-gray-400 text-sm mb-3">자유 모드</p>
      <div className="flex flex-col gap-4 md:gap-5 w-full" style={{ maxWidth: 480 }}>
        {DIFFICULTIES.map((diff, i) => (
          <motion.button
            key={diff.name}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onStart(diff, 'free')}
            className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-5 md:p-7 shadow-lg hover:shadow-xl transition-shadow text-left border border-white/50"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl md:text-5xl">{diff.emoji}</span>
              <div className="flex-1">
                <div className="font-bold text-gray-800 text-xl md:text-2xl">{diff.name}</div>
                <div className="text-sm md:text-base text-gray-400 mt-1">
                  {diff.rows}×{diff.cols} · {diff.colorCount}가지 색
                </div>
              </div>
              {highScores[diff.name] != null && (
                <div className="text-right">
                  <div className="text-xs md:text-sm text-gray-400">최고 기록</div>
                  <div className="font-bold text-amber-500 text-lg md:text-xl">
                    {highScores[diff.name].toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* 오늘 플레이 횟수 */}
      {todayPlays > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-gray-400 text-sm"
        >
          오늘 {todayPlays}판째! 🔥
        </motion.p>
      )}
    </motion.div>
  );
}
