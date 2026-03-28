import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreManager } from '@/game/ScoreManager';

/** Call add(1) n times on a ScoreManager to reach a specific score. */
function addN(sm: ScoreManager, n: number): void {
  for (let i = 0; i < n; i++) {
    sm.add(1);
  }
}

describe('ScoreManager', () => {
  beforeEach(() => localStorage.clear());

  // ─── Initial state ───────────────────────────────────────────────────────

  describe('initial state', () => {
    beforeEach(() => localStorage.clear());

    it('new ScoreManager has currentScore === 0', () => {
      const sm = new ScoreManager();
      expect(sm.currentScore).toBe(0);
    });

    it('new ScoreManager has highScore === 0 when localStorage is empty', () => {
      const sm = new ScoreManager();
      expect(sm.highScore).toBe(0);
    });

    it('new ScoreManager reads existing highScore from localStorage on construction', () => {
      localStorage.setItem('snake_high_score', '42');
      const sm = new ScoreManager();
      expect(sm.highScore).toBe(42);
    });
  });

  // ─── add(points) ─────────────────────────────────────────────────────────

  describe('add(points)', () => {
    beforeEach(() => localStorage.clear());

    it('add(10) increments currentScore by 10', () => {
      const sm = new ScoreManager();
      sm.add(10);
      expect(sm.currentScore).toBe(10);
    });

    it('add(10) called 3 times → currentScore === 30', () => {
      const sm = new ScoreManager();
      sm.add(10);
      sm.add(10);
      sm.add(10);
      expect(sm.currentScore).toBe(30);
    });

    it('add(10) returns true and updates highScore when currentScore exceeds it', () => {
      const sm = new ScoreManager();
      const result = sm.add(10);
      expect(result).toBe(true);
      expect(sm.highScore).toBe(10);
    });

    it('add(10) returns false and does NOT update highScore when currentScore is still below it', () => {
      // Set a high score already
      localStorage.setItem('snake_high_score', '100');
      const sm = new ScoreManager();
      const result = sm.add(10);
      expect(result).toBe(false);
      expect(sm.highScore).toBe(100);
    });

    it('add(10) persists highScore to localStorage when high score is beaten', () => {
      const sm = new ScoreManager();
      sm.add(10);
      expect(localStorage.getItem('snake_high_score')).toBe('10');
    });

    it('highScore survives construction of a NEW ScoreManager (localStorage round-trip)', () => {
      const sm1 = new ScoreManager();
      sm1.add(50);
      expect(sm1.highScore).toBe(50);

      const sm2 = new ScoreManager();
      expect(sm2.highScore).toBe(50);
    });
  });

  // ─── reset() ─────────────────────────────────────────────────────────────

  describe('reset()', () => {
    beforeEach(() => localStorage.clear());

    it('reset() zeroes currentScore', () => {
      const sm = new ScoreManager();
      sm.add(20);
      sm.reset();
      expect(sm.currentScore).toBe(0);
    });

    it('reset() does NOT change highScore', () => {
      const sm = new ScoreManager();
      sm.add(20);
      sm.reset();
      expect(sm.highScore).toBe(20);
    });

    it('after add(10) then reset(): currentScore === 0, highScore === 10', () => {
      const sm = new ScoreManager();
      sm.add(10);
      sm.reset();
      expect(sm.currentScore).toBe(0);
      expect(sm.highScore).toBe(10);
    });
  });

  // ─── clearHighScore() ────────────────────────────────────────────────────

  describe('clearHighScore()', () => {
    beforeEach(() => localStorage.clear());

    it('clearHighScore() zeros in-memory highScore', () => {
      const sm = new ScoreManager();
      sm.add(30);
      sm.clearHighScore();
      expect(sm.highScore).toBe(0);
    });

    it('clearHighScore() removes the key from localStorage', () => {
      const sm = new ScoreManager();
      sm.add(30);
      sm.clearHighScore();
      expect(localStorage.getItem('snake_high_score')).toBeNull();
    });

    it('after clearHighScore(), constructing a new ScoreManager gives highScore === 0', () => {
      const sm1 = new ScoreManager();
      sm1.add(30);
      sm1.clearHighScore();

      const sm2 = new ScoreManager();
      expect(sm2.highScore).toBe(0);
    });
  });

  // ─── getTickInterval() — speed schedule ──────────────────────────────────

  describe('getTickInterval()', () => {
    beforeEach(() => localStorage.clear());

    it('score=0 → 150ms', () => {
      const sm = new ScoreManager();
      expect(sm.getTickInterval()).toBe(150);
    });

    it('score=49 → 150ms', () => {
      const sm = new ScoreManager();
      addN(sm, 49);
      expect(sm.getTickInterval()).toBe(150);
    });

    it('score=50 → 130ms', () => {
      const sm = new ScoreManager();
      addN(sm, 50);
      expect(sm.getTickInterval()).toBe(130);
    });

    it('score=99 → 130ms', () => {
      const sm = new ScoreManager();
      addN(sm, 99);
      expect(sm.getTickInterval()).toBe(130);
    });

    it('score=100 → 110ms', () => {
      const sm = new ScoreManager();
      addN(sm, 100);
      expect(sm.getTickInterval()).toBe(110);
    });

    it('score=149 → 110ms', () => {
      const sm = new ScoreManager();
      addN(sm, 149);
      expect(sm.getTickInterval()).toBe(110);
    });

    it('score=150 → 90ms', () => {
      const sm = new ScoreManager();
      addN(sm, 150);
      expect(sm.getTickInterval()).toBe(90);
    });

    it('score=199 → 90ms', () => {
      const sm = new ScoreManager();
      addN(sm, 199);
      expect(sm.getTickInterval()).toBe(90);
    });

    it('score=200 → 75ms', () => {
      const sm = new ScoreManager();
      addN(sm, 200);
      expect(sm.getTickInterval()).toBe(75);
    });

    it('score=999 → 75ms (max speed cap holds)', () => {
      const sm = new ScoreManager();
      addN(sm, 999);
      expect(sm.getTickInterval()).toBe(75);
    });
  });
});
