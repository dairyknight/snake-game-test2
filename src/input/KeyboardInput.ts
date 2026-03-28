import { GameManager } from '@/game/GameManager';
import { GameState } from '@/state/GameState';
import { UP } from '@/game/Snake';

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
      case 'ArrowUp':
        this._manager.queueDirection(UP);
        break;
      case ' ':
        if (state === GameState.IDLE) this._manager.startGame();
        else if (state === GameState.GAME_OVER) this._manager.restartGame();
        break;
    }
  }

  destroy(): void {
    window.removeEventListener('keydown', this._handler);
  }
}
