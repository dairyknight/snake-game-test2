const STORAGE_KEY = 'snake_high_score';

/** Score bracket → tick interval (ms). Sorted descending by threshold. */
const SPEED_SCHEDULE: Array<{ threshold: number; interval: number }> = [
  { threshold: 200, interval: 75 },
  { threshold: 150, interval: 90 },
  { threshold: 100, interval: 110 },
  { threshold: 50,  interval: 130 },
  { threshold: 0,   interval: 150 },
];

export class ScoreManager {
  private _currentScore = 0;
  private _highScore: number;

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    this._highScore = stored !== null ? parseInt(stored, 10) : 0;
  }

  /** Current score for this game session (in-memory). */
  get currentScore(): number {
    return this._currentScore;
  }

  /** All-time high score (persisted to localStorage). */
  get highScore(): number {
    return this._highScore;
  }

  /**
   * Increment score by `points`. Updates highScore if exceeded and persists to localStorage.
   * Does NOT emit events — caller (GameManager) handles emission.
   * @returns true if highScore was updated, false otherwise.
   */
  add(points: number): boolean {
    this._currentScore += points;
    if (this._currentScore > this._highScore) {
      this._highScore = this._currentScore;
      localStorage.setItem(STORAGE_KEY, String(this._highScore));
      return true;
    }
    return false;
  }

  /** Reset currentScore to 0. Does NOT touch highScore. */
  reset(): void {
    this._currentScore = 0;
  }

  /** Remove highScore from localStorage and zero in-memory value. */
  clearHighScore(): void {
    this._highScore = 0;
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Return tick interval (ms) for the current score bracket.
   * Lower = faster. Minimum cap: 75ms at score >= 200.
   */
  getTickInterval(): number {
    for (const tier of SPEED_SCHEDULE) {
      if (this._currentScore >= tier.threshold) {
        return tier.interval;
      }
    }
    return 150; // unreachable: threshold:0 matches everything ≥0; defensive fallback
  }
}
