import { useState, useCallback, useEffect, useRef } from 'react';
import type { Board, Position, Difficulty, BlockColor, GameMode, MissionContext } from '../types';
import { DIFFICULTIES, MISSIONS, COLOR_MAP } from '../types';
import {
  createBoard,
  findGroup,
  processMove,
  hasValidMoves,
  countRemainingBlocks,
  getBlockColors,
  getSpecialAffectedPositions,
  shuffleBoard,
} from '../utils/boardLogic';
import { calculateScore, calculateBonus, getStarRating } from '../utils/scoreUtils';
import type { ParticleBurst } from '../components/Particles';

export type GamePhase = 'start' | 'playing' | 'gameover' | 'mission-clear' | 'all-clear';

export interface ScorePopup {
  id: number;
  score: number;
  x: number;
  y: number;
}

export interface UseGameReturn {
  board: Board;
  score: number;
  phase: GamePhase;
  difficulty: Difficulty;
  hoveredGroup: Position[];
  scorePopups: ScorePopup[];
  remainingBlocks: number;
  bonus: number;
  bonusMessage: string;
  starRating: number;
  highScores: Record<string, number>;
  isNewRecord: boolean;
  comboText: string | null;
  isAnimating: boolean;
  shakeBlockId: string | null;
  screenShake: boolean;
  particleBursts: ParticleBurst[];
  shufflesLeft: number;
  gameMode: GameMode;
  missionStage: number;
  missionDescription: string;
  missionProgress: string;
  todayPlays: number;
  showColorPicker: boolean;
  colorPickerColors: BlockColor[];
  handleBlockClick: (row: number, col: number) => void;
  handleBlockHover: (row: number, col: number) => void;
  handleBlockLeave: () => void;
  handleColorPick: (color: BlockColor) => void;
  handleShuffle: () => void;
  startGame: (difficulty: Difficulty, mode?: GameMode) => void;
  restartGame: () => void;
  goToStart: () => void;
  nextMissionStage: () => void;
}

let popupId = 0;
let burstId = 0;

const memoryScores: Record<string, number> = {};
let storageAvailable: boolean | null = null;

function isLocalStorageAvailable(): boolean {
  if (storageAvailable !== null) return storageAvailable;
  try {
    const key = '__test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  return storageAvailable;
}

function loadHighScores(): Record<string, number> {
  if (!isLocalStorageAvailable()) return { ...memoryScores };
  try {
    const data = localStorage.getItem('blockpang-highscores');
    return data ? JSON.parse(data) : {};
  } catch {
    return { ...memoryScores };
  }
}

function saveHighScore(difficultyName: string, score: number): boolean {
  const scores = loadHighScores();
  if (!scores[difficultyName] || score > scores[difficultyName]) {
    scores[difficultyName] = score;
    memoryScores[difficultyName] = score;
    if (isLocalStorageAvailable()) {
      try { localStorage.setItem('blockpang-highscores', JSON.stringify(scores)); } catch {}
    }
    return true;
  }
  return false;
}

function getTodayPlays(): number {
  try {
    const data = localStorage.getItem('blockpang-today');
    if (!data) return 0;
    const { date, count } = JSON.parse(data);
    if (date === new Date().toDateString()) return count;
    return 0;
  } catch { return 0; }
}

function incrementTodayPlays(): number {
  const today = new Date().toDateString();
  const count = getTodayPlays() + 1;
  try { localStorage.setItem('blockpang-today', JSON.stringify({ date: today, count })); } catch {}
  return count;
}

export function useGame(): UseGameReturn {
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES[1]);
  const [hoveredGroup, setHoveredGroup] = useState<Position[]>([]);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [remainingBlocks, setRemainingBlocks] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [bonusMessage, setBonusMessage] = useState('');
  const [starRating, setStarRating] = useState(0);
  const [highScores, setHighScores] = useState<Record<string, number>>(loadHighScores);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [comboText, setComboText] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shakeBlockId, setShakeBlockId] = useState<string | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [particleBursts, setParticleBursts] = useState<ParticleBurst[]>([]);
  const [shufflesLeft, setShufflesLeft] = useState(3);
  const [gameMode, setGameMode] = useState<GameMode>('free');
  const [missionStage, setMissionStage] = useState(1);
  const [todayPlays, setTodayPlays] = useState(getTodayPlays);

  // Rainbow color picker
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerColors, setColorPickerColors] = useState<BlockColor[]>([]);
  const [pendingRainbowPos, setPendingRainbowPos] = useState<Position | null>(null);

  // Mission tracking
  const missionCtxRef = useRef<MissionContext>({
    totalRemoved: 0, colorRemoved: {} as Record<BlockColor, number>,
    bigPops: 0, hugePops: 0, score: 0, bombsUsed: 0,
    remainingBlocks: 0, remainingColors: 0,
  });

  const comboTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const gameOverTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const animTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const screenShakeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const popupTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    return () => {
      [comboTimerRef, gameOverTimerRef, shakeTimerRef, animTimerRef, screenShakeTimerRef].forEach((ref) => {
        if (ref.current) clearTimeout(ref.current);
      });
      popupTimersRef.current.forEach((t) => clearTimeout(t));
      popupTimersRef.current.clear();
    };
  }, []);

  const clearAllTimers = useCallback(() => {
    [comboTimerRef, gameOverTimerRef, shakeTimerRef, animTimerRef, screenShakeTimerRef].forEach((ref) => {
      if (ref.current) clearTimeout(ref.current);
    });
    popupTimersRef.current.forEach((t) => clearTimeout(t));
    popupTimersRef.current.clear();
  }, []);

  const currentMission = MISSIONS[missionStage - 1] ?? MISSIONS[0];

  const getMissionProgress = useCallback((): string => {
    const ctx = missionCtxRef.current;
    const m = currentMission;
    if (m.stage === 1) return `${ctx.totalRemoved}/30`;
    if (m.stage === 2) return `${ctx.bigPops}/2`;
    if (m.stage === 3) return `${ctx.colorRemoved.red ?? 0}/15`;
    if (m.stage === 4) return ctx.bombsUsed >= 1 ? '완료!' : '폭탄을 사용하세요';
    if (m.stage === 5) return `${ctx.score}/3000`;
    if (m.stage === 6) return ctx.hugePops >= 1 ? '완료!' : '12개 이상 터뜨리세요';
    if (m.stage === 7) return `남은 색상: ${ctx.remainingColors}`;
    if (m.stage === 8) return `남은 블록: ${ctx.remainingBlocks}`;
    if (m.stage === 9) return `${ctx.score}/5000`;
    if (m.stage === 10) return `남은 블록: ${ctx.remainingBlocks}`;
    return '';
  }, [currentMission]);

  const triggerGameOver = useCallback(
    (finalBoard: Board, currentScore: number) => {
      const remaining = countRemainingBlocks(finalBoard);
      const { bonus: bonusPoints, message } = calculateBonus(remaining);
      const finalScore = currentScore + bonusPoints;
      const stars = getStarRating(remaining);
      const newRecord = saveHighScore(difficulty.name, finalScore);

      setRemainingBlocks(remaining);
      setBonus(bonusPoints);
      setBonusMessage(message);
      setStarRating(stars);
      setScore(finalScore);
      setIsNewRecord(newRecord);
      setHighScores(loadHighScores());
      setIsAnimating(false);

      // Check mission completion
      if (gameMode === 'mission') {
        missionCtxRef.current.score = finalScore;
        missionCtxRef.current.remainingBlocks = remaining;
        missionCtxRef.current.remainingColors = getBlockColors(finalBoard).length;
        if (currentMission.check(missionCtxRef.current)) {
          if (missionStage >= MISSIONS.length) {
            setPhase('all-clear');
          } else {
            setPhase('mission-clear');
          }
          return;
        }
      }
      setPhase('gameover');
    },
    [difficulty, gameMode, currentMission, missionStage]
  );

  const startGame = useCallback((diff: Difficulty, mode: GameMode = 'free') => {
    popupId = 0;
    burstId = 0;
    clearAllTimers();

    const newBoard = createBoard(diff.rows, diff.cols, diff.colorCount);
    setBoard(newBoard);
    setScore(0);
    setPhase('playing');
    setDifficulty(diff);
    setGameMode(mode);
    setHoveredGroup([]);
    setScorePopups([]);
    setParticleBursts([]);
    setIsNewRecord(false);
    setComboText(null);
    setIsAnimating(false);
    setShakeBlockId(null);
    setScreenShake(false);
    setShufflesLeft(3);
    setShowColorPicker(false);
    setPendingRainbowPos(null);
    setTodayPlays(incrementTodayPlays());

    missionCtxRef.current = {
      totalRemoved: 0, colorRemoved: {} as Record<BlockColor, number>,
      bigPops: 0, hugePops: 0, score: 0, bombsUsed: 0,
      remainingBlocks: diff.rows * diff.cols, remainingColors: diff.colorCount,
    };
  }, [clearAllTimers]);

  const restartGame = useCallback(() => {
    startGame(difficulty, gameMode);
  }, [difficulty, gameMode, startGame]);

  const goToStart = useCallback(() => {
    clearAllTimers();
    setPhase('start');
    setIsAnimating(false);
    setHighScores(loadHighScores());
    setShowColorPicker(false);
  }, [clearAllTimers]);

  const nextMissionStage = useCallback(() => {
    const nextStage = missionStage + 1;
    setMissionStage(nextStage);
    startGame(DIFFICULTIES[1], 'mission');
  }, [missionStage, startGame]);

  const doRemoveGroup = useCallback(
    (positions: Position[], removedBoard: Board) => {
      const blockSize = positions.length;
      const points = calculateScore(blockSize);
      const newScore = score + points;

      // Track colors removed
      const ctx = missionCtxRef.current;
      for (const pos of positions) {
        const block = board[pos.row]?.[pos.col];
        if (block) {
          ctx.colorRemoved[block.color] = (ctx.colorRemoved[block.color] ?? 0) + 1;
          if (block.special === 'bomb') ctx.bombsUsed++;
        }
      }
      ctx.totalRemoved += blockSize;
      if (blockSize >= 8) ctx.bigPops++;
      if (blockSize >= 12) ctx.hugePops++;

      // Combo text
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      if (blockSize >= 20) {
        setComboText('AMAZING!! 🔥🔥');
        comboTimerRef.current = setTimeout(() => setComboText(null), 1500);
      } else if (blockSize >= 15) {
        setComboText('GREAT! 💥');
        comboTimerRef.current = setTimeout(() => setComboText(null), 1500);
      } else if (blockSize >= 10) {
        setComboText('NICE! ✨');
        comboTimerRef.current = setTimeout(() => setComboText(null), 1200);
      } else {
        setComboText(null);
      }

      // Screen shake for 10+
      if (blockSize >= 10) {
        setScreenShake(true);
        screenShakeTimerRef.current = setTimeout(() => setScreenShake(false), 300);
      }

      // Particles
      const gap = 4;
      const approxBlockSize = 50;
      const newBursts: ParticleBurst[] = positions.map((pos) => {
        const block = board[pos.row]?.[pos.col];
        return {
          id: burstId++,
          x: 16 + pos.col * (approxBlockSize + gap) + approxBlockSize / 2,
          y: 16 + pos.row * (approxBlockSize + gap) + approxBlockSize / 2,
          color: block ? COLOR_MAP[block.color] : '#fff',
        };
      });
      setParticleBursts((prev) => [...prev, ...newBursts]);

      // Score popup
      const centerRow = positions.reduce((s, p) => s + p.row, 0) / positions.length;
      const centerCol = positions.reduce((s, p) => s + p.col, 0) / positions.length;
      const newPopup: ScorePopup = { id: popupId++, score: points, x: centerCol, y: centerRow };
      setScorePopups((prev) => [...prev, newPopup]);
      const popupTimer = setTimeout(() => {
        setScorePopups((prev) => prev.filter((p) => p.id !== newPopup.id));
        popupTimersRef.current.delete(popupTimer);
      }, 1000);
      popupTimersRef.current.add(popupTimer);

      const newBoard = processMove(removedBoard, []);
      setBoard(newBoard);
      setScore(newScore);
      setHoveredGroup([]);

      // Update mission context
      ctx.score = newScore;
      ctx.remainingBlocks = countRemainingBlocks(newBoard);
      ctx.remainingColors = getBlockColors(newBoard).length;

      // Check mission mid-game
      if (gameMode === 'mission' && currentMission.check(ctx)) {
        if (missionStage >= MISSIONS.length) {
          gameOverTimerRef.current = setTimeout(() => { setIsAnimating(false); setPhase('all-clear'); }, 600);
        } else {
          gameOverTimerRef.current = setTimeout(() => { setIsAnimating(false); setPhase('mission-clear'); }, 600);
        }
        return;
      }

      if (!hasValidMoves(newBoard)) {
        gameOverTimerRef.current = setTimeout(() => triggerGameOver(newBoard, newScore), 600);
      } else {
        animTimerRef.current = setTimeout(() => setIsAnimating(false), 350);
      }
    },
    [board, score, gameMode, currentMission, missionStage, triggerGameOver]
  );

  const handleBlockClick = useCallback(
    (row: number, col: number) => {
      if (phase !== 'playing' || isAnimating || showColorPicker) return;

      const block = board[row]?.[col];
      if (!block) return;

      // Rainbow block: show color picker
      if (block.special === 'rainbow') {
        const colors = getBlockColors(board);
        if (colors.length === 0) return;
        setShowColorPicker(true);
        setColorPickerColors(colors);
        setPendingRainbowPos({ row, col });
        return;
      }

      const group = findGroup(board, row, col);

      if (group.length < 2) {
        if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
        setShakeBlockId(block.id);
        shakeTimerRef.current = setTimeout(() => setShakeBlockId(null), 400);
        return;
      }

      setIsAnimating(true);
      setShakeBlockId(null);

      const { allPositions, hasBomb, hasStar } = getSpecialAffectedPositions(board, group);

      if (hasBomb || hasStar) {
        // Extra combo text for specials
        if (hasBomb && !comboText) {
          setComboText('💣 BOOM!');
          comboTimerRef.current = setTimeout(() => setComboText(null), 1000);
        }
        if (hasStar && !comboText) {
          setComboText('⭐ LASER!');
          comboTimerRef.current = setTimeout(() => setComboText(null), 1000);
        }
      }

      // Remove blocks and process
      let newBoard = board.map((r) => r.map((b) => (b ? { ...b } : null)));
      for (const pos of allPositions) {
        newBoard[pos.row][pos.col] = null;
      }

      // Apply gravity and shift
      const processed = processMove(newBoard, []);
      doRemoveGroup(allPositions, processed);
    },
    [board, phase, isAnimating, showColorPicker, comboText, doRemoveGroup]
  );

  const handleColorPick = useCallback(
    (color: BlockColor) => {
      if (!pendingRainbowPos) return;
      setShowColorPicker(false);
      setIsAnimating(true);

      // Remove all blocks of the chosen color + the rainbow block itself
      const positions: Position[] = [pendingRainbowPos];
      for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[0].length; c++) {
          const block = board[r][c];
          if (block && block.color === color && !(r === pendingRainbowPos.row && c === pendingRainbowPos.col)) {
            positions.push({ row: r, col: c });
          }
        }
      }

      let newBoard = board.map((r) => r.map((b) => (b ? { ...b } : null)));
      for (const pos of positions) {
        newBoard[pos.row][pos.col] = null;
      }

      const processed = processMove(newBoard, []);
      setPendingRainbowPos(null);
      doRemoveGroup(positions, processed);
    },
    [board, pendingRainbowPos, doRemoveGroup]
  );

  const handleShuffle = useCallback(() => {
    if (phase !== 'playing' || isAnimating || shufflesLeft <= 0) return;
    const newBoard = shuffleBoard(board);
    setBoard(newBoard);
    setShufflesLeft((s) => s - 1);
    setHoveredGroup([]);
  }, [board, phase, isAnimating, shufflesLeft]);

  const handleBlockHover = useCallback(
    (row: number, col: number) => {
      if (phase !== 'playing' || isAnimating) return;
      const block = board[row]?.[col];
      if (!block) { setHoveredGroup([]); return; }
      if (block.special === 'rainbow') { setHoveredGroup([{ row, col }]); return; }
      const group = findGroup(board, row, col);
      setHoveredGroup(group.length >= 2 ? group : []);
    },
    [board, phase, isAnimating]
  );

  const handleBlockLeave = useCallback(() => { setHoveredGroup([]); }, []);

  return {
    board, score, phase, difficulty, hoveredGroup, scorePopups,
    remainingBlocks, bonus, bonusMessage, starRating, highScores,
    isNewRecord, comboText, isAnimating, shakeBlockId, screenShake,
    particleBursts, shufflesLeft, gameMode,
    missionStage, missionDescription: currentMission.description,
    missionProgress: getMissionProgress(), todayPlays, showColorPicker,
    colorPickerColors,
    handleBlockClick, handleBlockHover, handleBlockLeave, handleColorPick,
    handleShuffle, startGame, restartGame, goToStart, nextMissionStage,
  };
}
