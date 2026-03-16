export type BlockColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
export type SpecialType = 'bomb' | 'rainbow' | 'star';

export interface Block {
  id: string;
  color: BlockColor;
  row: number;
  col: number;
  special?: SpecialType;
}

export type Board = (Block | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface Difficulty {
  name: string;
  emoji: string;
  rows: number;
  cols: number;
  colorCount: number;
}

export interface GameState {
  board: Board;
  score: number;
  isGameOver: boolean;
  difficulty: Difficulty;
}

export interface MissionDef {
  stage: number;
  description: string;
  check: (ctx: MissionContext) => boolean;
}

export interface MissionContext {
  totalRemoved: number;
  colorRemoved: Record<BlockColor, number>;
  bigPops: number; // 8+ in one pop
  hugePops: number; // 12+ in one pop
  score: number;
  bombsUsed: number;
  remainingBlocks: number;
  remainingColors: number;
}

export type GameMode = 'free' | 'mission';

export const DIFFICULTIES: Difficulty[] = [
  { name: '쉬움', emoji: '🐣', rows: 8, cols: 8, colorCount: 4 },
  { name: '보통', emoji: '🐥', rows: 10, cols: 10, colorCount: 5 },
  { name: '어려움', emoji: '🦅', rows: 12, cols: 12, colorCount: 6 },
];

export const ALL_COLORS: BlockColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

export const COLOR_MAP: Record<BlockColor, string> = {
  red: '#FF6B6B',
  blue: '#4ECDC4',
  green: '#95E77E',
  yellow: '#FFE66D',
  purple: '#C44DFF',
  orange: '#FF9F43',
};

export const COLOR_EMOJI: Record<BlockColor, string> = {
  red: '😊',
  blue: '😆',
  green: '🥰',
  yellow: '😎',
  purple: '😈',
  orange: '👻',
};

export const SPECIAL_EMOJI: Record<SpecialType, string> = {
  bomb: '💣',
  rainbow: '🌈',
  star: '⭐',
};

export const MISSIONS: MissionDef[] = [
  { stage: 1, description: '블록 30개 제거하기', check: (c) => c.totalRemoved >= 30 },
  { stage: 2, description: '한번에 8개 이상 터뜨리기 2회', check: (c) => c.bigPops >= 2 },
  { stage: 3, description: '빨간 블록 15개 제거하기', check: (c) => (c.colorRemoved.red ?? 0) >= 15 },
  { stage: 4, description: '폭탄 블록 사용하기', check: (c) => c.bombsUsed >= 1 },
  { stage: 5, description: '3000점 달성하기', check: (c) => c.score >= 3000 },
  { stage: 6, description: '한번에 12개 이상 터뜨리기', check: (c) => c.hugePops >= 1 },
  { stage: 7, description: '2가지 색상만 남기기', check: (c) => c.remainingColors <= 2 },
  { stage: 8, description: '블록 10개 이하로 남기기', check: (c) => c.remainingBlocks <= 10 },
  { stage: 9, description: '5000점 달성하기', check: (c) => c.score >= 5000 },
  { stage: 10, description: '퍼펙트 클리어!', check: (c) => c.remainingBlocks === 0 },
];
