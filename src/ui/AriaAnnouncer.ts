import { GameManager } from '@/game/GameManager';
import { GameState } from '@/state/GameState';

export class AriaAnnouncer {
  private readonly _manager: GameManager;
  private readonly _scoreEl: HTMLElement;
  private readonly _stateEl: HTMLElement;
  private readonly _onScoreUpdate: (payload: { score: number; highScore: number }) => void;
  private readonly _onStateChange: (payload: { from: GameState; to: GameState }) => void;

  constructor(manager: GameManager) {
    this._manager = manager;
    this._scoreEl = document.getElementById('score-announcer') as HTMLElement;
    this._stateEl = document.getElementById('state-announcer') as HTMLElement;
    this._onScoreUpdate = this._handleScoreUpdate.bind(this);
    this._onStateChange = this._handleStateChange.bind(this);
    manager.events.on('scoreUpdate', this._onScoreUpdate);
    manager.events.on('stateChange', this._onStateChange);
  }

  private _handleScoreUpdate(payload: { score: number; highScore: number }): void {
    this._scoreEl.textContent = `Score: ${payload.score}`;
  }

  private _handleStateChange(payload: { from: GameState; to: GameState }): void {
    switch (payload.to) {
      case GameState.IDLE:
        this._stateEl.textContent = 'Ready to play';
        break;
      case GameState.PLAYING:
        this._stateEl.textContent = 'Game started';
        break;
      case GameState.PAUSED:
        this._stateEl.textContent = 'Game paused';
        break;
      case GameState.GAME_OVER:
        this._stateEl.textContent = `Game over. Final score: ${this._manager.getScore()}`;
        break;
    }
  }

  destroy(): void {
    this._manager.events.off('scoreUpdate', this._onScoreUpdate);
    this._manager.events.off('stateChange', this._onStateChange);
  }
}
