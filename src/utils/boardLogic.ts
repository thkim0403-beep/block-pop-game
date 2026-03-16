import type { Block, Board, Position, BlockColor, SpecialType } from '../types';
import { ALL_COLORS } from '../types';

let nextId = 0;

function generateId(): string {
  return `block-${nextId++}`;
}

export function resetIdCounter(): void {
  nextId = 0;
}

export function createBoard(rows: number, cols: number, colorCount: number, specialChance = 0.05): Board {
  resetIdCounter();
  const colors = ALL_COLORS.slice(0, colorCount);

  for (let attempt = 0; attempt < 50; attempt++) {
    nextId = 0;
    const board: Board = [];
    for (let r = 0; r < rows; r++) {
      const row: (Block | null)[] = [];
      for (let c = 0; c < cols; c++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const special = pickSpecial(specialChance);
        row.push({ id: generateId(), color, row: r, col: c, special });
      }
      board.push(row);
    }
    if (hasValidMoves(board)) return board;
  }

  nextId = 0;
  const board: Board = [];
  for (let r = 0; r < rows; r++) {
    const row: (Block | null)[] = [];
    for (let c = 0; c < cols; c++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      row.push({ id: generateId(), color, row: r, col: c });
    }
    board.push(row);
  }
  if (board[0][0] && board[0][1]) {
    board[0][1] = { ...board[0][1], color: board[0][0].color };
  }
  return board;
}

function pickSpecial(chance: number): SpecialType | undefined {
  if (Math.random() >= chance) return undefined;
  const specials: SpecialType[] = ['bomb', 'rainbow', 'star'];
  return specials[Math.floor(Math.random() * specials.length)];
}

export function findGroup(board: Board, startRow: number, startCol: number): Position[] {
  const rows = board.length;
  const cols = board[0].length;
  const block = board[startRow][startCol];

  if (!block) return [];

  const targetColor = block.color;
  const visited = new Set<string>();
  const group: Position[] = [];
  const queue: Position[] = [{ row: startRow, col: startCol }];

  const key = (r: number, c: number) => `${r},${c}`;
  visited.add(key(startRow, startCol));

  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (queue.length > 0) {
    const { row, col } = queue.shift()!;
    group.push({ row, col });

    for (const [dr, dc] of directions) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (visited.has(key(nr, nc))) continue;
      const neighbor = board[nr][nc];
      if (!neighbor) continue;
      // Rainbow blocks connect with any color
      if (neighbor.color !== targetColor && !neighbor.special && !block.special) continue;
      if (neighbor.color !== targetColor && neighbor.special !== 'rainbow' && block.special !== 'rainbow') continue;
      visited.add(key(nr, nc));
      queue.push({ row: nr, col: nc });
    }
  }

  return group;
}

// Get all positions affected by special blocks within the group
export function getSpecialAffectedPositions(board: Board, group: Position[]): {
  allPositions: Position[];
  hasBomb: boolean;
  hasStar: boolean;
} {
  const rows = board.length;
  const cols = board[0].length;
  const posSet = new Set<string>(group.map((p) => `${p.row},${p.col}`));
  let hasBomb = false;
  let hasStar = false;

  for (const pos of group) {
    const block = board[pos.row][pos.col];
    if (!block?.special) continue;

    if (block.special === 'bomb') {
      hasBomb = true;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = pos.row + dr;
          const nc = pos.col + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc]) {
            posSet.add(`${nr},${nc}`);
          }
        }
      }
    }

    if (block.special === 'star') {
      hasStar = true;
      for (let c = 0; c < cols; c++) {
        if (board[pos.row][c]) {
          posSet.add(`${pos.row},${c}`);
        }
      }
    }
  }

  const allPositions = Array.from(posSet).map((key) => {
    const [r, c] = key.split(',').map(Number);
    return { row: r, col: c };
  });

  return { allPositions, hasBomb, hasStar };
}

export function removeBlocks(board: Board, positions: Position[]): Board {
  const newBoard = board.map((row) => row.map((block) => (block ? { ...block } : null)));
  for (const { row, col } of positions) {
    newBoard[row][col] = null;
  }
  return newBoard;
}

export function applyGravity(board: Board): Board {
  const rows = board.length;
  const cols = board[0].length;
  const newBoard: Board = Array.from({ length: rows }, () => Array(cols).fill(null));

  for (let c = 0; c < cols; c++) {
    const blocks: Block[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      if (board[r][c]) blocks.push(board[r][c]!);
    }
    let writeRow = rows - 1;
    for (const block of blocks) {
      newBoard[writeRow][c] = { ...block, row: writeRow, col: c };
      writeRow--;
    }
  }

  return newBoard;
}

export function shiftColumnsLeft(board: Board): Board {
  const rows = board.length;
  const cols = board[0].length;

  const nonEmptyCols: number[] = [];
  for (let c = 0; c < cols; c++) {
    if (board.some((row) => row[c] !== null)) nonEmptyCols.push(c);
  }

  const newBoard: Board = Array.from({ length: rows }, () => Array(cols).fill(null));
  for (let newC = 0; newC < nonEmptyCols.length; newC++) {
    const oldC = nonEmptyCols[newC];
    for (let r = 0; r < rows; r++) {
      if (board[r][oldC]) {
        newBoard[r][newC] = { ...board[r][oldC]!, row: r, col: newC };
      }
    }
  }

  return newBoard;
}

export function processMove(board: Board, positions: Position[]): Board {
  let newBoard = removeBlocks(board, positions);
  newBoard = applyGravity(newBoard);
  newBoard = shiftColumnsLeft(newBoard);
  return newBoard;
}

export function hasValidMoves(board: Board): boolean {
  const rows = board.length;
  const cols = board[0].length;
  const visited = new Set<string>();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c]) continue;
      // Rainbow blocks are always clickable if adjacent to any block
      if (board[r][c]!.special === 'rainbow') return true;
      const key = `${r},${c}`;
      if (visited.has(key)) continue;
      const group = findGroup(board, r, c);
      if (group.length >= 2) return true;
      for (const pos of group) {
        visited.add(`${pos.row},${pos.col}`);
      }
    }
  }

  return false;
}

export function countRemainingBlocks(board: Board): number {
  let count = 0;
  for (const row of board) {
    for (const block of row) {
      if (block) count++;
    }
  }
  return count;
}

export function getBlockColors(board: Board): BlockColor[] {
  const colors = new Set<BlockColor>();
  for (const row of board) {
    for (const block of row) {
      if (block) colors.add(block.color);
    }
  }
  return Array.from(colors);
}

export function shuffleBoard(board: Board): Board {
  const rows = board.length;
  const cols = board[0].length;

  // Collect all blocks
  const blocks: Block[] = [];
  for (const row of board) {
    for (const block of row) {
      if (block) blocks.push(block);
    }
  }

  // Shuffle array
  for (let i = blocks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
  }

  // Place back on board (bottom-left aligned)
  const newBoard: Board = Array.from({ length: rows }, () => Array(cols).fill(null));
  const totalCols = Math.ceil(blocks.length / rows);
  let idx = 0;

  for (let c = 0; c < totalCols && idx < blocks.length; c++) {
    for (let r = rows - 1; r >= 0 && idx < blocks.length; r--) {
      const block = blocks[idx++];
      newBoard[r][c] = { ...block, row: r, col: c };
    }
  }

  return newBoard;
}
