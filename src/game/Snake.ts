import { Vector2 } from '@/utils/Vector2';

export type Direction = Vector2;

export const UP: Direction    = new Vector2( 0, -1);
export const DOWN: Direction  = new Vector2( 0, +1);
export const LEFT: Direction  = new Vector2(-1,  0);
export const RIGHT: Direction = new Vector2(+1,  0);

export class Snake {
  private _segments: Vector2[];
  private _currentDirection: Direction;
  private _growPending: boolean = false;

  /**
   * Constructs a snake with 3 segments at the board centre, moving RIGHT.
   * Initial segments: head=(10,9), (9,9), (8,9).
   */
  constructor() {
    this._segments = [
      new Vector2(10, 9),
      new Vector2( 9, 9),
      new Vector2( 8, 9),
    ];
    this._currentDirection = RIGHT;
  }

  /**
   * The current head position (segments[0]).
   * @throws Error if segments array is empty (invariant violation).
   */
  get head(): Vector2 {
    const h = this._segments[0];
    if (h === undefined) throw new Error('Snake has no segments — invariant violated');
    return h;
  }

  /**
   * Readonly snapshot of all segments, head first.
   */
  get segments(): readonly Vector2[] {
    return this._segments;
  }

  /**
   * The direction the snake moved on its last tick.
   * Initialised to RIGHT.
   */
  get currentDirection(): Direction {
    return this._currentDirection;
  }

  /**
   * Advance the snake one step in `direction`.
   *
   * Rules:
   * - If `direction` is the 180° opposite of `currentDirection`, it is silently
   *   ignored and the snake continues in `currentDirection`.
   * - A new head is prepended at head.add(effectiveDirection).
   * - If `_growPending` is true, the tail is NOT removed and the flag is cleared.
   * - Otherwise the tail is removed (length stays constant).
   * - `currentDirection` is updated to `effectiveDirection`.
   */
  move(direction: Direction): void {
    // 180° reversal guard: if requested direction is opposite to current, ignore it
    const isOpposite =
      direction.x === -this._currentDirection.x &&
      direction.y === -this._currentDirection.y;
    const effectiveDirection = isOpposite ? this._currentDirection : direction;

    const newHead = this.head.add(effectiveDirection);
    this._segments.unshift(newHead);

    if (this._growPending) {
      this._growPending = false;
    } else {
      this._segments.pop();
    }

    this._currentDirection = effectiveDirection;
  }

  /**
   * Schedule one segment of growth on the next move().
   * Sets an internal boolean flag; multiple consecutive calls before the next
   * move() still only grow by 1 (flag, not counter).
   */
  grow(): void {
    this._growPending = true;
  }
}
