import { describe, it, expect } from 'vitest';
import { Food } from '@/game/Food';
import { Vector2 } from '@/utils/Vector2';

describe('Food', () => {
  describe('constructor — deterministic spawn with injected RNG', () => {
    it('picks cell index 0 (0,0) when rng returns 0', () => {
      const food = new Food(20, 20, [], () => 0);
      expect(food.position.equals(new Vector2(0, 0))).toBe(true);
    });

    it('picks last cell (19,19) when rng returns 0.999', () => {
      const food = new Food(20, 20, [], () => 0.999);
      expect(food.position.equals(new Vector2(19, 19))).toBe(true);
    });
  });

  describe('constructor — with occupied cells', () => {
    it('picks first unoccupied cell (0,0) when rng returns 0 and some cells are occupied', () => {
      const occupied = [new Vector2(10, 9), new Vector2(9, 9), new Vector2(8, 9)];
      const food = new Food(20, 20, occupied, () => 0);
      expect(food.position.equals(new Vector2(0, 0))).toBe(true);
    });

    it('picks last unoccupied cell (19,19) when rng returns 0.999 and some cells are occupied', () => {
      const occupied = [new Vector2(10, 9), new Vector2(9, 9), new Vector2(8, 9)];
      const food = new Food(20, 20, occupied, () => 0.999);
      // (19,19) is not in occupied list, so it should be last available cell
      expect(food.position.equals(new Vector2(19, 19))).toBe(true);
    });
  });

  describe('respawn() — basic', () => {
    it('returns true when respawning with empty occupied list', () => {
      const food = new Food(20, 20, [], () => 0);
      expect(food.respawn([])).toBe(true);
    });

    it('moves to a different position when current position is occupied', () => {
      // Use counter-based RNG: first call returns 0 (initial spawn at 0,0),
      // second call returns 0.999 (respawn picks last cell 19,19)
      let callCount = 0;
      const rng = () => {
        callCount++;
        return callCount === 1 ? 0 : 0.999;
      };
      const food = new Food(20, 20, [], rng);
      const oldPosition = food.position; // (0,0)
      food.respawn([oldPosition]);
      expect(food.position.equals(oldPosition)).toBe(false);
    });

    it('new position is not in the occupied list after respawn', () => {
      let callCount = 0;
      const rng = () => {
        callCount++;
        return callCount === 1 ? 0 : 0.999;
      };
      const food = new Food(20, 20, [], rng);
      const occupied = [food.position]; // occupy (0,0)
      food.respawn(occupied);
      const isInOccupied = occupied.some(o => food.position.equals(o));
      expect(isInOccupied).toBe(false);
    });
  });

  describe('respawn() — avoidance property', () => {
    it('does not place food on any occupied cell — configuration 1', () => {
      const occupied = [
        new Vector2(0, 0),
        new Vector2(1, 0),
        new Vector2(2, 0),
        new Vector2(3, 0),
      ];
      // rng=0 picks first available which should be (4,0)
      const food = new Food(20, 20, [new Vector2(5, 0)], () => 0);
      food.respawn(occupied);
      const isInOccupied = occupied.some(o => food.position.equals(o));
      expect(isInOccupied).toBe(false);
    });

    it('does not place food on any occupied cell — configuration 2', () => {
      const occupied = [
        new Vector2(5, 5),
        new Vector2(6, 5),
        new Vector2(7, 5),
      ];
      const food = new Food(20, 20, [], () => 0.5);
      food.respawn(occupied);
      const isInOccupied = occupied.some(o => food.position.equals(o));
      expect(isInOccupied).toBe(false);
    });

    it('does not place food on any occupied cell — configuration 3', () => {
      const occupied = [
        new Vector2(0, 0),
        new Vector2(1, 1),
        new Vector2(2, 2),
        new Vector2(3, 3),
        new Vector2(4, 4),
      ];
      const food = new Food(20, 20, [], () => 0.999);
      food.respawn(occupied);
      const isInOccupied = occupied.some(o => food.position.equals(o));
      expect(isInOccupied).toBe(false);
    });
  });

  describe('respawn() — board full', () => {
    it('returns false when all 400 cells are occupied', () => {
      const allCells: Vector2[] = [];
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
          allCells.push(new Vector2(x, y));
        }
      }
      const food = new Food(20, 20, [], () => 0);
      const positionBefore = food.position;
      const result = food.respawn(allCells);
      expect(result).toBe(false);
      expect(food.position.equals(positionBefore)).toBe(true);
    });
  });

  describe('respawn() — near-full board', () => {
    it('places food at the only available cell (15,15) when all others are occupied', () => {
      const allCells: Vector2[] = [];
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
          if (!(x === 15 && y === 15)) {
            allCells.push(new Vector2(x, y));
          }
        }
      }
      const food = new Food(20, 20, [], () => 0);
      const result = food.respawn(allCells);
      expect(result).toBe(true);
      expect(food.position.equals(new Vector2(15, 15))).toBe(true);
    });
  });
});
