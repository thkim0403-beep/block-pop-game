export function calculateScore(blockCount: number): number {
  return blockCount * blockCount * 10;
}

export function calculateBonus(remainingBlocks: number): { bonus: number; message: string } {
  if (remainingBlocks === 0) {
    return { bonus: 2000, message: '퍼펙트 클리어! 🎉' };
  }
  if (remainingBlocks <= 5) {
    return { bonus: 500, message: '거의 다 없앴어요! 👏' };
  }
  if (remainingBlocks <= 10) {
    return { bonus: 100, message: '잘했어요! 😊' };
  }
  return { bonus: 0, message: '' };
}

export function getStarRating(remainingBlocks: number): number {
  if (remainingBlocks === 0) return 3;
  if (remainingBlocks <= 5) return 2;
  return 1;
}
