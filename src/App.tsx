import { useGame } from './hooks/useGame';
import StartScreen from './components/StartScreen';
import Header from './components/Header';
import Board from './components/Board';
import GameOverScreen, { MissionClearScreen, AllClearScreen } from './components/GameOverScreen';
import ColorPicker from './components/ColorPicker';
import Particles from './components/Particles';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const game = useGame();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-50 to-violet-100 relative overflow-hidden">
      {/* 배경 블러 도형들 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 -right-16 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-float-mid" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-violet-200/30 rounded-full blur-3xl animate-float-fast" />
      </div>

      <div className={`relative z-10 ${game.screenShake ? 'screen-shake' : ''}`}>
        <AnimatePresence mode="wait">
          {game.phase === 'start' && (
            <motion.div key="start" exit={{ opacity: 0 }}>
              <StartScreen
                onStart={game.startGame}
                highScores={game.highScores}
                todayPlays={game.todayPlays}
              />
            </motion.div>
          )}

          {(game.phase === 'playing' || game.phase === 'gameover' || game.phase === 'mission-clear' || game.phase === 'all-clear') && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center pt-4 pb-10 px-4"
            >
              <Header score={game.score} />

              {/* 미션 목표 표시 */}
              {game.gameMode === 'mission' && (
                <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center">
                  <span className="text-amber-600 font-bold text-sm">
                    🎯 스테이지 {game.missionStage}: {game.missionDescription}
                  </span>
                  <span className="ml-2 text-amber-500 text-sm">({game.missionProgress})</span>
                </div>
              )}

              <div className="relative">
                <Board
                  board={game.board}
                  hoveredGroup={game.hoveredGroup}
                  scorePopups={game.scorePopups}
                  shakeBlockId={game.shakeBlockId}
                  onBlockClick={game.handleBlockClick}
                  onBlockHover={game.handleBlockHover}
                  onBlockLeave={game.handleBlockLeave}
                />
                <Particles bursts={game.particleBursts} />
              </div>

              {/* 셔플 버튼 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={game.handleShuffle}
                disabled={game.shufflesLeft <= 0 || game.isAnimating}
                className={`mt-4 px-6 py-2 rounded-xl font-bold text-sm shadow-md transition-all ${
                  game.shufflesLeft > 0
                    ? 'bg-white/80 text-gray-700 hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                🔀 셔플 ({game.shufflesLeft}/3)
              </motion.button>

              {/* 콤보 텍스트 */}
              <AnimatePresence>
                {game.comboText && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="fixed top-1/3 left-1/2 -translate-x-1/2 text-4xl font-bold text-red-500 z-50 pointer-events-none"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
                    role="status"
                  >
                    {game.comboText}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 색상 선택 팝업 (무지개 블록) */}
        {game.showColorPicker && (
          <ColorPicker colors={game.colorPickerColors} onPick={game.handleColorPick} />
        )}

        {/* 게임 오버 */}
        {game.phase === 'gameover' && (
          <GameOverScreen
            score={game.score}
            remainingBlocks={game.remainingBlocks}
            bonus={game.bonus}
            bonusMessage={game.bonusMessage}
            starRating={game.starRating}
            isNewRecord={game.isNewRecord}
            gameMode={game.gameMode}
            missionStage={game.missionStage}
            onRestart={game.restartGame}
            onGoToStart={game.goToStart}
          />
        )}

        {/* 미션 클리어 */}
        {game.phase === 'mission-clear' && (
          <MissionClearScreen
            stage={game.missionStage}
            onNext={game.nextMissionStage}
            onGoToStart={game.goToStart}
          />
        )}

        {/* 모든 미션 클리어 */}
        {game.phase === 'all-clear' && (
          <AllClearScreen onGoToStart={game.goToStart} />
        )}
      </div>
    </div>
  );
}
