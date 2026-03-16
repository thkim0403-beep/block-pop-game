import { describe, it, expect } from 'vitest';
import { calculateScore, calculateBonus, getStarRating } from './scoreUtils';

describe('calculateScore', () => {
  it('블록수² × 10으로 점수를 계산한다', () => {
    expect(calculateScore(2)).toBe(40);   // 2×2×10
    expect(calculateScore(3)).toBe(90);   // 3×3×10
    expect(calculateScore(5)).toBe(250);  // 5×5×10
    expect(calculateScore(7)).toBe(490);  // 7×7×10
    expect(calculateScore(10)).toBe(1000);
  });

  it('1개면 10점', () => {
    expect(calculateScore(1)).toBe(10);
  });

  it('0개면 0점', () => {
    expect(calculateScore(0)).toBe(0);
  });
});

describe('calculateBonus', () => {
  it('퍼펙트 클리어(0개)면 2000점 보너스', () => {
    const result = calculateBonus(0);
    expect(result.bonus).toBe(2000);
    expect(result.message).toContain('퍼펙트');
  });

  it('1~5개 남으면 500점 보너스', () => {
    expect(calculateBonus(1).bonus).toBe(500);
    expect(calculateBonus(3).bonus).toBe(500);
    expect(calculateBonus(5).bonus).toBe(500);
  });

  it('6~10개 남으면 100점 보너스', () => {
    expect(calculateBonus(6).bonus).toBe(100);
    expect(calculateBonus(10).bonus).toBe(100);
  });

  it('11개 이상이면 보너스 없음', () => {
    expect(calculateBonus(11).bonus).toBe(0);
    expect(calculateBonus(50).bonus).toBe(0);
  });
});

describe('getStarRating', () => {
  it('퍼펙트 클리어면 별 3개', () => {
    expect(getStarRating(0)).toBe(3);
  });

  it('5개 이하면 별 2개', () => {
    expect(getStarRating(1)).toBe(2);
    expect(getStarRating(5)).toBe(2);
  });

  it('6개 이상이면 별 1개', () => {
    expect(getStarRating(6)).toBe(1);
    expect(getStarRating(100)).toBe(1);
  });
});
