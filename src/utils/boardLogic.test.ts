import { describe, it, expect, beforeEach } from 'vitest';
import {
  createBoard,
  findGroup,
  removeBlocks,
  applyGravity,
  shiftColumnsLeft,
  processMove,
  hasValidMoves,
  countRemainingBlocks,
  resetIdCounter,
} from './boardLogic';
import type { Board, Block } from '../types';

// 테스트용 보드를 직접 생성하는 헬퍼
function makeBlock(row: number, col: number, color: Block['color'], id?: string): Block {
  return { id: id ?? `b-${row}-${col}`, color, row, col };
}

function makeBoardFromColors(colors: (string | null)[][]): Board {
  return colors.map((row, r) =>
    row.map((c, col) =>
      c ? makeBlock(r, col, c as Block['color']) : null
    )
  );
}

describe('createBoard', () => {
  beforeEach(() => resetIdCounter());

  it('지정한 크기의 보드를 생성한다', () => {
    const board = createBoard(8, 10, 4);
    expect(board.length).toBe(8);
    expect(board[0].length).toBe(10);
  });

  it('모든 칸이 블록으로 채워진다', () => {
    const board = createBoard(5, 5, 3);
    for (const row of board) {
      for (const block of row) {
        expect(block).not.toBeNull();
      }
    }
  });

  it('지정한 색상 수 이내의 색만 사용한다', () => {
    const board = createBoard(10, 10, 3);
    const allowedColors = ['red', 'blue', 'green'];
    for (const row of board) {
      for (const block of row) {
        expect(allowedColors).toContain(block!.color);
      }
    }
  });

  it('각 블록에 고유한 id가 있다', () => {
    const board = createBoard(5, 5, 4);
    const ids = new Set<string>();
    for (const row of board) {
      for (const block of row) {
        expect(ids.has(block!.id)).toBe(false);
        ids.add(block!.id);
      }
    }
  });

  it('블록의 row, col이 실제 위치와 일치한다', () => {
    const board = createBoard(4, 4, 2);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        expect(board[r][c]!.row).toBe(r);
        expect(board[r][c]!.col).toBe(c);
      }
    }
  });
});

describe('findGroup', () => {
  it('같은 색 인접 블록을 모두 찾는다', () => {
    // R R B
    // R B B
    // B B B
    const board = makeBoardFromColors([
      ['red', 'red', 'blue'],
      ['red', 'blue', 'blue'],
      ['blue', 'blue', 'blue'],
    ]);
    const group = findGroup(board, 0, 0);
    expect(group.length).toBe(3); // (0,0), (0,1), (1,0)
  });

  it('대각선은 연결하지 않는다', () => {
    // R B
    // B R
    const board = makeBoardFromColors([
      ['red', 'blue'],
      ['blue', 'red'],
    ]);
    const group = findGroup(board, 0, 0);
    expect(group.length).toBe(1);
  });

  it('빈 칸에서 호출하면 빈 배열을 반환한다', () => {
    const board: Board = [[null, makeBlock(0, 1, 'red')]];
    const group = findGroup(board, 0, 0);
    expect(group.length).toBe(0);
  });

  it('전체 보드가 같은 색이면 모든 칸을 반환한다', () => {
    const board = makeBoardFromColors([
      ['red', 'red', 'red'],
      ['red', 'red', 'red'],
    ]);
    const group = findGroup(board, 0, 0);
    expect(group.length).toBe(6);
  });

  it('L자형 연결도 올바르게 탐색한다', () => {
    // R B B
    // R B B
    // R R R
    const board = makeBoardFromColors([
      ['red', 'blue', 'blue'],
      ['red', 'blue', 'blue'],
      ['red', 'red', 'red'],
    ]);
    const group = findGroup(board, 0, 0);
    expect(group.length).toBe(5);
  });
});

describe('removeBlocks', () => {
  it('지정한 위치의 블록을 제거한다', () => {
    const board = makeBoardFromColors([
      ['red', 'blue'],
      ['red', 'blue'],
    ]);
    const result = removeBlocks(board, [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
    ]);
    expect(result[0][0]).toBeNull();
    expect(result[1][0]).toBeNull();
    expect(result[0][1]).not.toBeNull();
    expect(result[1][1]).not.toBeNull();
  });

  it('원본 보드를 변경하지 않는다', () => {
    const board = makeBoardFromColors([['red', 'blue']]);
    removeBlocks(board, [{ row: 0, col: 0 }]);
    expect(board[0][0]).not.toBeNull();
  });
});

describe('applyGravity', () => {
  it('빈 칸 위의 블록이 아래로 떨어진다', () => {
    // R  →  _
    // _  →  _
    // _  →  R
    const board = makeBoardFromColors([
      ['red'],
      [null],
      [null],
    ]);
    const result = applyGravity(board);
    expect(result[0][0]).toBeNull();
    expect(result[1][0]).toBeNull();
    expect(result[2][0]!.color).toBe('red');
  });

  it('블록 사이의 빈 칸이 채워진다', () => {
    // R  →  _
    // _  →  R
    // B  →  B
    const board = makeBoardFromColors([
      ['red'],
      [null],
      ['blue'],
    ]);
    const result = applyGravity(board);
    expect(result[0][0]).toBeNull();
    expect(result[1][0]!.color).toBe('red');
    expect(result[2][0]!.color).toBe('blue');
  });

  it('떨어진 블록의 row가 올바르게 업데이트된다', () => {
    const board = makeBoardFromColors([
      ['red'],
      [null],
      [null],
    ]);
    const result = applyGravity(board);
    expect(result[2][0]!.row).toBe(2);
    expect(result[2][0]!.col).toBe(0);
  });

  it('이미 바닥에 있는 블록은 그대로 유지된다', () => {
    const board = makeBoardFromColors([
      [null],
      ['red'],
      ['blue'],
    ]);
    const result = applyGravity(board);
    expect(result[1][0]!.color).toBe('red');
    expect(result[2][0]!.color).toBe('blue');
  });
});

describe('shiftColumnsLeft', () => {
  it('빈 열을 왼쪽으로 당긴다', () => {
    // _ R  →  R _
    // _ B  →  B _
    const board = makeBoardFromColors([
      [null, 'red'],
      [null, 'blue'],
    ]);
    const result = shiftColumnsLeft(board);
    expect(result[0][0]!.color).toBe('red');
    expect(result[1][0]!.color).toBe('blue');
    expect(result[0][1]).toBeNull();
    expect(result[1][1]).toBeNull();
  });

  it('중간의 빈 열도 당긴다', () => {
    // R _ B  →  R B _
    // R _ B  →  R B _
    const board = makeBoardFromColors([
      ['red', null, 'blue'],
      ['red', null, 'blue'],
    ]);
    const result = shiftColumnsLeft(board);
    expect(result[0][0]!.color).toBe('red');
    expect(result[0][1]!.color).toBe('blue');
    expect(result[0][2]).toBeNull();
  });

  it('당겨진 블록의 col이 올바르게 업데이트된다', () => {
    const board = makeBoardFromColors([
      [null, 'red'],
      [null, 'blue'],
    ]);
    const result = shiftColumnsLeft(board);
    expect(result[0][0]!.col).toBe(0);
    expect(result[1][0]!.col).toBe(0);
  });
});

describe('processMove', () => {
  it('제거 → 중력 → 열 당기기가 순서대로 적용된다', () => {
    // R B G
    // R B G
    // R B G
    const board = makeBoardFromColors([
      ['red', 'blue', 'green'],
      ['red', 'blue', 'green'],
      ['red', 'blue', 'green'],
    ]);
    // 가운데 열(blue) 전체 제거
    const positions = [
      { row: 0, col: 1 },
      { row: 1, col: 1 },
      { row: 2, col: 1 },
    ];
    const result = processMove(board, positions);
    // 빈 열이 사라지고 green이 왼쪽으로 이동
    expect(result[0][0]!.color).toBe('red');
    expect(result[0][1]!.color).toBe('green');
    expect(result[0][2]).toBeNull();
  });
});

describe('hasValidMoves', () => {
  it('2개 이상 연결된 그룹이 있으면 true', () => {
    const board = makeBoardFromColors([
      ['red', 'red'],
      ['blue', 'green'],
    ]);
    expect(hasValidMoves(board)).toBe(true);
  });

  it('모든 블록이 고립되어 있으면 false', () => {
    const board = makeBoardFromColors([
      ['red', 'blue'],
      ['blue', 'red'],
    ]);
    expect(hasValidMoves(board)).toBe(false);
  });

  it('빈 보드이면 false', () => {
    const board: Board = [[null, null], [null, null]];
    expect(hasValidMoves(board)).toBe(false);
  });
});

describe('countRemainingBlocks', () => {
  it('남은 블록 수를 정확히 센다', () => {
    const board = makeBoardFromColors([
      ['red', null],
      [null, 'blue'],
    ]);
    expect(countRemainingBlocks(board)).toBe(2);
  });

  it('전부 비어있으면 0', () => {
    const board: Board = [[null, null], [null, null]];
    expect(countRemainingBlocks(board)).toBe(0);
  });
});
