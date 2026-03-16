import { useMemo, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Board as BoardType, Position } from '../types';
import BlockComponent from './Block';
import ScoreBoard from './ScoreBoard';
import type { ScorePopup } from '../hooks/useGame';

interface BoardProps {
  board: BoardType;
  hoveredGroup: Position[];
  scorePopups: ScorePopup[];
  shakeBlockId: string | null;
  onBlockClick: (row: number, col: number) => void;
  onBlockHover: (row: number, col: number) => void;
  onBlockLeave: () => void;
}

function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  });

  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
}

export default function Board({
  board,
  hoveredGroup,
  scorePopups,
  shakeBlockId,
  onBlockClick,
  onBlockHover,
  onBlockLeave,
}: BoardProps) {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const { width: winW, height: winH } = useWindowSize();

  const gap = 4;
  const maxBoardWidth = Math.min(winW - 32, 820);
  const maxBoardHeight = winH - 180;
  const blockFromWidth = Math.floor((maxBoardWidth - gap * (cols - 1)) / cols);
  const blockFromHeight = Math.floor((maxBoardHeight - gap * (rows - 1)) / rows);
  const blockSize = Math.min(blockFromWidth, blockFromHeight, 72);

  const boardWidth = cols * blockSize + (cols - 1) * gap;
  const boardHeight = rows * blockSize + (rows - 1) * gap;
  const padding = 16;

  const hoveredSet = useMemo(() => {
    const set = new Set<string>();
    hoveredGroup.forEach((p) => set.add(`${p.row},${p.col}`));
    return set;
  }, [hoveredGroup]);

  return (
    <div className="relative flex justify-center">
      <div
        className="relative bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl"
        style={{
          width: boardWidth + padding * 2,
          height: boardHeight + padding * 2,
          padding,
        }}
      >
        <div
          className="relative"
          style={{ width: boardWidth, height: boardHeight }}
        >
          <AnimatePresence mode="popLayout">
            {board.flatMap((row, r) =>
              row.flatMap((block, c) => {
                if (!block) return [];
                const isHighlighted = hoveredSet.has(`${r},${c}`);
                return [
                  <div
                    key={block.id}
                    className="absolute"
                    style={{
                      left: c * (blockSize + gap),
                      top: r * (blockSize + gap),
                    }}
                  >
                    <BlockComponent
                      block={block}
                      isHighlighted={isHighlighted}
                      isShaking={block.id === shakeBlockId}
                      groupSize={isHighlighted ? hoveredGroup.length : 0}
                      blockSize={blockSize}
                      onClick={() => onBlockClick(r, c)}
                      onHover={() => onBlockHover(r, c)}
                      onLeave={onBlockLeave}
                    />
                  </div>,
                ];
              })
            )}
          </AnimatePresence>
        </div>

        <ScoreBoard
          popups={scorePopups}
          blockSize={blockSize}
          gap={gap}
          boardOffsetX={padding}
          boardOffsetY={padding}
        />
      </div>
    </div>
  );
}
