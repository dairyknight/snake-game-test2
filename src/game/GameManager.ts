import { GameState, GameEvents } from '@/state/GameState';
import { EventEmitter } from '@/utils/EventEmitter';
import { Board } from '@/game/Board';
import { Snake, Direction } from '@/game/Snake';
import { Food } from '@/game/Food';
import { ScoreManager } from '@/game/ScoreManager';

export class GameManager {
  private _state: GameState = GameState.IDLE;
  readonly events = new EventEmitter<GameEvents>();

  private readonly _board: Board;
  private _snake: Snake;
  private _food: Food;
  private readonly _scoreManager: ScoreManager;
  private _pendingDirection: Direction | null = null;

  constructor() {
    this._board = new Board();
    this._snake = new Snake();
    this._food = new Food(this._board.width, this._board.height, Array.from(this._snake.segments));
    this._scoreManager = new ScoreManager();
  }

  getState(): GameState {
    return this._state;
  }

  /** Current score for this game session. */
  getScore(): number {
    return this._scoreManager.currentScore;
  }

  /** All-time high score (delegates to ScoreManager). */
  getHighScore(): number {
    return this._scoreManager.highScore;
  }

  /** Tick interval (ms) based on current score bracket — delegates to ScoreManager. */
  getTickInterval(): number {
    return this._scoreManager.getTickInterval();
  }

  private _transition(to: GameState): void {
    const from = this._state;
    this._state = to;
    this.events.emit('stateChange', { from, to });
  }

  /** IDLE → PLAYING */
  startGame(): void {
    if (this._state !== GameState.IDLE) return;
    this._transition(GameState.PLAYING);
  }

  /** PLAYING → PAUSED */
  pauseGame(): void {
    if (this._state !== GameState.PLAYING) return;
    this._transition(GameState.PAUSED);
  }

  /** PAUSED → PLAYING */
  resumeGame(): void {
    if (this._state !== GameState.PAUSED) return;
    this._transition(GameState.PLAYING);
  }

  /** PLAYING | PAUSED → GAME_OVER */
  endGame(): void {
    if (this._state !== GameState.PLAYING && this._state !== GameState.PAUSED) return;
    this._transition(GameState.GAME_OVER);
    this.events.emit('gameOver', { score: this.getScore() });
  }

  /** GAME_OVER → IDLE */
  restartGame(): void {
    if (this._state !== GameState.GAME_OVER) return;
    this._snake = new Snake();
    this._food = new Food(this._board.width, this._board.height, Array.from(this._snake.segments));
    this._pendingDirection = null;
    this._scoreManager.reset();
    this._transition(GameState.IDLE);
  }

  togglePause(): void {
    if (this._state === GameState.PLAYING) {
      this.pauseGame();
    } else if (this._state === GameState.PAUSED) {
      this.resumeGame();
    }
  }

  /**
   * Queue a direction change to apply on the next update() tick.
   * Replaces any previously queued direction (one-buffer policy).
   * The actual 180° reversal guard lives inside Snake.move().
   */
  queueDirection(direction: Direction): void {
    this._pendingDirection = direction;
  }

  /**
   * Returns the snake instance (for renderer access in Phase 6+).
   */
  getSnake(): Snake {
    return this._snake;
  }

  /**
   * Returns the food instance (for renderer access in Phase 6+).
   */
  getFood(): Food {
    return this._food;
  }

  /** Called each logical tick */
  update(_deltaTime?: number): void {
    if (this._state !== GameState.PLAYING) return;

    // Apply queued direction (or continue current direction)
    const dir = this._pendingDirection ?? this._snake.currentDirection;
    this._pendingDirection = null;

    this._snake.move(dir);

    // Collision: wall or self (checked after move, skips head for self-check)
    if (this._board.checkCollision(this._snake.head, this._snake)) {
      this.endGame();
      return;
    }

    // Food eaten
    if (this._food.position.equals(this._snake.head)) {
      this._snake.grow();
      this._food.respawn(Array.from(this._snake.segments));
      this._scoreManager.add(10);
      this.events.emit('scoreUpdate', {
        score: this._scoreManager.currentScore,
        highScore: this._scoreManager.highScore,
      });
      this.events.emit('foodEaten', undefined);
    }
  }
}
