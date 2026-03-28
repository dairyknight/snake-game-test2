import { GameState, GameEvents } from '@/state/GameState';
import { EventEmitter } from '@/utils/EventEmitter';

export class GameManager {
  private _state: GameState = GameState.IDLE;
  readonly events = new EventEmitter<GameEvents>();

  getState(): GameState {
    return this._state;
  }

  /** Scoring stub — returns 0 until Phase 5 wires ScoreManager */
  getScore(): number {
    return 0;
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
    // TODO Phase 4: reset Snake, Board, ScoreManager here
    this._transition(GameState.IDLE);
  }

  togglePause(): void {
    if (this._state === GameState.PLAYING) {
      this.pauseGame();
    } else if (this._state === GameState.PAUSED) {
      this.resumeGame();
    }
  }

  /** Called each logical tick — body populated in Phase 4 */
  update(_deltaTime?: number): void {
    // Phase 4: snake.move(), collision, food, score
  }
}
