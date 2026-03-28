import { GameManager } from '@/game/GameManager';
import { GameState } from '@/state/GameState';
import { UP, DOWN, LEFT, RIGHT } from '@/game/Snake';

export class KeyboardInput {
  private readonly _manager: GameManager;
  private readonly _handler: (e: KeyboardEvent) => void;

  constructor(manager: GameManager) {
    this._manager = manager;
    this._handler = this._onKeyDown.bind(this);
    window.addEventListener('keydown', this._handler);
  }

  private _onKeyDown(e: KeyboardEvent): void {
    if (e.repeat) return;
    const state = this._manager.getState();
    switch (e.key) {
      case 'ArrowUp':    case 'w': case 'W':
        this._manager.queueDirection(UP); break;
      case 'ArrowDown':  case 's': case 'S':
        this._manager.queueDirection(DOWN); break;
      case 'ArrowLeft':  case 'a': case 'A':
        this._manager.queueDirection(LEFT); break;
      case 'ArrowRight': case 'd': case 'D':
        this._manager.queueDirection(RIGHT); break;
      case 'p': case 'P': case 'Escape':
        this._manager.togglePause(); break;
      case ' ': case 'Enter':
        if (state === GameState.IDLE) this._manager.startGame();
        else if (state === GameState.GAME_OVER) this._manager.restartGame();
        break;
    }
  }

  destroy(): void {
    window.removeEventListener('keydown', this._handler);
  }
}
