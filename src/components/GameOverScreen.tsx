import { motion } from 'framer-motion';
import type { GameMode } from '../types';

interface GameOverScreenProps {
  score: number;
  remainingBlocks: number;
  bonus: number;
  bonusMessage: string;
  starRating: number;
  isNewRecord: boolean;
  gameMode: GameMode;
  missionStage: number;
  onRestart: () => void;
  onGoToStart: () => void;
}

export default function GameOverScreen({
  score,
  remainingBlocks,
  bonus,
  bonusMessage,
  starRating,
  isNewRecord,
  gameMode,
  missionStage,
  onRestart,
  onGoToStart,
}: GameOverScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {gameMode === 'mission' ? `스테이지 ${missionStage} 실패` : '게임 끝!'}
        </h2>

        {/* 별점 */}
        <div className="text-4xl mb-4">
          {Array.from({ length: 3 }, (_, i) => (
            <span key={`star-${i}`} className={i < starRating ? '' : 'opacity-20'}>
              ⭐
            </span>
          ))}
        </div>

        {starRating === 3 && (
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg font-bold text-amber-500 mb-2">
            완벽해요! 🎉
          </motion.p>
        )}

        {isNewRecord && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} className="text-lg font-bold text-red-500 mb-2">
            🏆 새 기록!
          </motion.div>
        )}

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-gray-600">
            <span>최종 점수</span>
            <span className="font-bold text-gray-800 text-xl">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>남은 블록</span>
            <span className="font-bold">{remainingBlocks}개</span>
          </div>
          {bonus > 0 && (
            <div className="flex justify-between text-amber-500">
              <span>{bonusMessage}</span>
              <span className="font-bold">+{bonus}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onRestart}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold text-lg shadow-md hover:shadow-lg transition-shadow"
          >
            {gameMode === 'mission' ? '다시 도전 🔄' : '한판 더? 🔥'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onGoToStart}
            className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors"
          >
            {gameMode === 'mission' ? '메인으로' : '다른 난이도'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function MissionClearScreen({
  stage,
  onNext,
  onGoToStart,
}: {
  stage: number;
  onNext: () => void;
  onGoToStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -5 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full"
      >
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">스테이지 {stage} 클리어!</h2>
        <p className="text-gray-400 mb-6">잘했어요!</p>

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold text-lg shadow-md"
          >
            다음 스테이지 ▶
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onGoToStart}
            className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors"
          >
            메인으로
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AllClearScreen({ onGoToStart }: { onGoToStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 10 }}
        className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full"
      >
        <div className="text-6xl mb-3">🏆</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">모든 미션 클리어!</h2>
        <p className="text-lg text-amber-600 font-bold mb-1">축하해요! 🎊🎉🥳</p>
        <p className="text-gray-400 mb-6">10개의 미션을 모두 완료했어요!</p>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onGoToStart}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold text-lg shadow-md"
        >
          메인으로 🏠
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
