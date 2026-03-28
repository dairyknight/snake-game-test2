import { Vector2 } from '@/utils/Vector2';

export class Food {
  private readonly _boardWidth: number;
  private readonly _boardHeight: number;
  private readonly _rng: () => number;
  private _position: Vector2;

  /**
   * Constructs a Food item and immediately spawns at a random unoccupied cell.
   *
   * @param boardWidth   Board width (default 20)
   * @param boardHeight  Board height (default 20)
   * @param occupied     Initial occupied cells (default [])
   * @param rng          Random number generator, returns [0,1) (default Math.random).
   *                     Injected for deterministic testing.
   */
  constructor(
    boardWidth: number = 20,
    boardHeight: number = 20,
    occupied: Vector2[] = [],
    rng: () => number = Math.random,
  ) {
    this._boardWidth = boardWidth;
    this._boardHeight = boardHeight;
    this._rng = rng;

    // Spawn immediately at a valid unoccupied cell
    // Build initial position — if board is full, default to (0,0) as fallback
    const available = this._buildAvailable(occupied);
    if (available.length === 0) {
      this._position = new Vector2(0, 0);
    } else {
      this._position = available[Math.floor(rng() * available.length)]!;
    }
  }

  /**
   * Current food position. Always a valid unoccupied cell (set at construction
   * and after each successful respawn).
   */
  get position(): Vector2 {
    return this._position;
  }

  /**
   * Choose a new random position not in `occupied`.
   *
   * Algorithm:
   *   1. Build available[] = all board cells not in occupied (uses equals() comparison)
   *   2. If available.length === 0: return false (board full — win condition stub)
   *   3. Pick available[Math.floor(rng() * available.length)]
   *   4. Update internal position, return true
   *
   * @param occupied  Array of cells to avoid (typically snake.segments)
   * @returns true if a new position was set; false if no cells available (board full)
   */
  respawn(occupied: Vector2[]): boolean {
    const available = this._buildAvailable(occupied);
    if (available.length === 0) return false;

    this._position = available[Math.floor(this._rng() * available.length)]!;
    return true;
  }

  private _buildAvailable(occupied: Vector2[]): Vector2[] {
    const available: Vector2[] = [];
    for (let y = 0; y < this._boardHeight; y++) {
      for (let x = 0; x < this._boardWidth; x++) {
        const cell = new Vector2(x, y);
        const isOccupied = occupied.some(o => cell.equals(o));
        if (!isOccupied) {
          available.push(cell);
        }
      }
    }
    return available;
  }
}
