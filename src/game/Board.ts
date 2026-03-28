import { Vector2 } from '@/utils/Vector2';
import { Snake } from '@/game/Snake';

export class Board {
  readonly width: number;
  readonly height: number;

  /**
   * @param width  Number of columns (default 20)
   * @param height Number of rows    (default 20)
   */
  constructor(width: number = 20, height: number = 20) {
    this.width = width;
    this.height = height;
  }

  /**
   * Returns true if `pos` represents a collision (wall OR self).
   *
   * Wall collision: pos.x < 0 || pos.x >= width || pos.y < 0 || pos.y >= height
   *
   * Self-collision: pos equals any element of snake.segments EXCEPT segments[0]
   *   (segments[0] is the current head — the snake cannot collide with its own
   *   leading edge; it can only collide with its body/tail).
   *
   * Called AFTER snake.move() — snake.segments already includes the new head.
   * The skip-head rule prevents segments[0] from trivially matching `pos`.
   *
   * @param pos   The new head position to check (= snake.head after move)
   * @param snake The snake to check self-collision against
   */
  checkCollision(pos: Vector2, snake: Snake): boolean {
    // Wall collision
    if (pos.x < 0 || pos.x >= this.width || pos.y < 0 || pos.y >= this.height) {
      return true;
    }

    // Self-collision: check segments[1..] (skip head at index 0)
    const segments = snake.segments;
    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      if (seg !== undefined && pos.equals(seg)) {
        return true;
      }
    }

    return false;
  }
}
