import { describe, it, expect, beforeEach } from 'vitest';
import { Snake, UP, DOWN, LEFT, RIGHT } from '@/game/Snake';
import { Vector2 } from '@/utils/Vector2';

describe('Snake', () => {
  let snake: Snake;

  beforeEach(() => {
    snake = new Snake();
  });

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------
  describe('initial state', () => {
    it('constructs with exactly 3 segments', () => {
      expect(snake.segments.length).toBe(3);
    });

    it('head returns (10, 9)', () => {
      expect(snake.head.equals(new Vector2(10, 9))).toBe(true);
    });

    it('segments are [(10,9), (9,9), (8,9)] head to tail', () => {
      const segs = snake.segments;
      expect(segs[0]!.equals(new Vector2(10, 9))).toBe(true);
      expect(segs[1]!.equals(new Vector2(9, 9))).toBe(true);
      expect(segs[2]!.equals(new Vector2(8, 9))).toBe(true);
    });

    it('currentDirection is RIGHT (1, 0)', () => {
      expect(snake.currentDirection.equals(new Vector2(1, 0))).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // move() — direction changes
  // ---------------------------------------------------------------------------
  describe('move() — direction changes', () => {
    it('move(RIGHT): head becomes (11,9) and length stays 3', () => {
      snake.move(RIGHT);
      expect(snake.head.equals(new Vector2(11, 9))).toBe(true);
      expect(snake.segments.length).toBe(3);
      expect(snake.segments[0]!.equals(new Vector2(11, 9))).toBe(true);
      expect(snake.segments[1]!.equals(new Vector2(10, 9))).toBe(true);
      expect(snake.segments[2]!.equals(new Vector2(9, 9))).toBe(true);
    });

    it('move(UP): head becomes (10,8) and length stays 3', () => {
      snake.move(UP);
      expect(snake.head.equals(new Vector2(10, 8))).toBe(true);
      expect(snake.segments.length).toBe(3);
    });

    it('move(DOWN): head becomes (10,10) and length stays 3', () => {
      snake.move(DOWN);
      expect(snake.head.equals(new Vector2(10, 10))).toBe(true);
      expect(snake.segments.length).toBe(3);
    });

    it('move(LEFT) from snake moving UP: new head = (9,8)', () => {
      snake.move(UP);                          // now moving UP, head = (10,8)
      snake.move(LEFT);                        // turn left relative to UP
      expect(snake.head.equals(new Vector2(9, 8))).toBe(true);
      expect(snake.segments.length).toBe(3);
    });

    it('currentDirection is updated after move(RIGHT)', () => {
      snake.move(RIGHT);
      expect(snake.currentDirection.equals(new Vector2(1, 0))).toBe(true);
    });

    it('currentDirection is updated after move(UP)', () => {
      snake.move(UP);
      expect(snake.currentDirection.equals(new Vector2(0, -1))).toBe(true);
    });

    it('currentDirection is updated after move(DOWN)', () => {
      snake.move(DOWN);
      expect(snake.currentDirection.equals(new Vector2(0, 1))).toBe(true);
    });

    it('currentDirection is updated after move(LEFT) from UP', () => {
      snake.move(UP);
      snake.move(LEFT);
      expect(snake.currentDirection.equals(new Vector2(-1, 0))).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // move() — 180° reversal blocked
  // ---------------------------------------------------------------------------
  describe('move() — 180° reversal blocked', () => {
    it('moving RIGHT → move(LEFT) → continues RIGHT, head = (11,9)', () => {
      // Initial direction is RIGHT
      snake.move(LEFT);                        // blocked, snake continues RIGHT
      expect(snake.head.equals(new Vector2(11, 9))).toBe(true);
      expect(snake.currentDirection.equals(new Vector2(1, 0))).toBe(true);
    });

    it('moving UP → move(DOWN) → continues UP', () => {
      snake.move(UP);                          // head = (10,8), direction=UP
      snake.move(DOWN);                        // blocked, continues UP → head = (10,7)
      expect(snake.head.equals(new Vector2(10, 7))).toBe(true);
      expect(snake.currentDirection.equals(new Vector2(0, -1))).toBe(true);
    });

    it('moving LEFT → move(RIGHT) → continues LEFT', () => {
      snake.move(UP);                          // establish non-RIGHT direction
      snake.move(LEFT);                        // direction=LEFT, head=(9,8)
      snake.move(RIGHT);                       // blocked, continues LEFT → head=(8,8)
      expect(snake.head.equals(new Vector2(8, 8))).toBe(true);
      expect(snake.currentDirection.equals(new Vector2(-1, 0))).toBe(true);
    });

    it('moving DOWN → move(UP) → continues DOWN', () => {
      snake.move(DOWN);                        // direction=DOWN, head=(10,10)
      snake.move(UP);                          // blocked, continues DOWN → head=(10,11)
      expect(snake.head.equals(new Vector2(10, 11))).toBe(true);
      expect(snake.currentDirection.equals(new Vector2(0, 1))).toBe(true);
    });

    it('same direction repeated: move(RIGHT) twice → allowed, snake moves forward', () => {
      snake.move(RIGHT);                       // head = (11,9)
      snake.move(RIGHT);                       // head = (12,9)
      expect(snake.head.equals(new Vector2(12, 9))).toBe(true);
      expect(snake.segments.length).toBe(3);
    });
  });

  // ---------------------------------------------------------------------------
  // grow() + move()
  // ---------------------------------------------------------------------------
  describe('grow() + move()', () => {
    it('after grow() then move(RIGHT): length = 4 and tail (8,9) is retained', () => {
      snake.grow();
      snake.move(RIGHT);
      expect(snake.segments.length).toBe(4);
      // original tail should still be present
      const segs = snake.segments;
      expect(segs[3]!.equals(new Vector2(8, 9))).toBe(true);
    });

    it('after grow() then move(RIGHT): currentDirection is still updated correctly', () => {
      snake.grow();
      snake.move(RIGHT);
      expect(snake.currentDirection.equals(new Vector2(1, 0))).toBe(true);
    });

    it('grow() called twice before move(): length increases by 1 only (boolean flag, not counter)', () => {
      snake.grow();
      snake.grow();
      snake.move(RIGHT);
      expect(snake.segments.length).toBe(4);
    });

    it('after grow+move, subsequent move() without grow removes tail normally', () => {
      snake.grow();
      snake.move(RIGHT);                       // length = 4 (grew by 1)
      snake.move(RIGHT);                       // no grow pending, tail removed → stays 4 (grew permanently by 1 vs original 3)
      expect(snake.segments.length).toBe(4);
    });
  });

  // ---------------------------------------------------------------------------
  // segments readonly
  // ---------------------------------------------------------------------------
  describe('segments readonly', () => {
    it('snake.segments returns the same values used for head checks', () => {
      expect(snake.segments[0]!.equals(snake.head)).toBe(true);
    });

    it('segments returns a readonly view (TypeScript-level); values match head', () => {
      // The segments getter returns a readonly Vector2[] — accessing values is correct
      const segs = snake.segments;
      expect(segs.length).toBe(3);
      expect(segs[0]!.equals(new Vector2(10, 9))).toBe(true);
      expect(segs[1]!.equals(new Vector2(9, 9))).toBe(true);
      expect(segs[2]!.equals(new Vector2(8, 9))).toBe(true);
    });
  });
});
