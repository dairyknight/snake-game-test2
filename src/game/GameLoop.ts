import { GameManager } from '@/game/GameManager';
import { GameState } from '@/state/GameState';

/** Interpolation factor [0, 1] for sub-frame rendering smoothness. */
export type DrawCallback = (interpolation: number) => void;

const MAX_TICKS_PER_FRAME = 3;

/** Score → tick interval lookup (ms). Lower = faster. */
function intervalForScore(score: number): number {
  if (score >= 70) return 70;
  if (score >= 40) return 90;
  if (score >= 20) return 110;
  if (score >= 10) return 130;
  return 150;
}

export class GameLoop {
  private _running = false;
  private _rafId = 0;
  private _lastTime: number | null = null;
  private _accumulator = 0;

  constructor(
    private readonly _manager: GameManager,
    private readonly _onDraw: DrawCallback,
  ) {}

  start(): void {
    if (this._running) return;
    this._running = true;
    this._lastTime = null;
    this._accumulator = 0;
    this._rafId = requestAnimationFrame((now) => this._step(now));
  }

  stop(): void {
    this._running = false;
    cancelAnimationFrame(this._rafId);
  }

  /** @internal Exposed for testing only — do not call from production code. */
  _step(now: number): void {
    if (!this._running) return;

    // Initialise on first frame to avoid phantom lag
    if (this._lastTime === null) {
      this._lastTime = now;
    }

    const state = this._manager.getState();
    const tickInterval = intervalForScore(this._manager.getScore());

    if (state === GameState.PLAYING) {
      const delta = now - this._lastTime;
      // Backlog cap: max 3 ticks per frame
      this._accumulator = Math.min(
        this._accumulator + delta,
        MAX_TICKS_PER_FRAME * tickInterval,
      );

      while (this._accumulator >= tickInterval) {
        this._accumulator -= tickInterval;
        this._manager.update();

        // Re-check state — update() may have triggered GAME_OVER
        if (this._manager.getState() !== GameState.PLAYING) {
          this._accumulator = 0;
          break;
        }
      }
    } else if (state === GameState.PAUSED || state === GameState.IDLE) {
      // Keep _lastTime current so we don't backlog on resume
      this._accumulator = 0;
    } else {
      // GAME_OVER — self-terminate
      this.stop();
      this._onDraw(0);
      return;
    }

    // Update _lastTime every frame regardless of state
    this._lastTime = now;

    const interpolation = tickInterval > 0 ? this._accumulator / tickInterval : 0;
    this._onDraw(Math.min(interpolation, 1));

    this._rafId = requestAnimationFrame((next) => this._step(next));
  }
}
