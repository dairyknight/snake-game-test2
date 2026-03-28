import { GameManager } from '@/game/GameManager';
import { GameState } from '@/state/GameState';

export class StartScreen {
  private readonly _manager: GameManager;
  private readonly _el: HTMLElement;
  private readonly _btn: HTMLButtonElement;
  private readonly _onStateChange: (data: { from: GameState; to: GameState }) => void;
  private readonly _onBtnClick: () => void;

  constructor(manager: GameManager) {
    this._manager = manager;
    this._el = document.getElementById('start-screen') as HTMLElement;
    this._btn = document.getElementById('start-btn') as HTMLButtonElement;
    this._onStateChange = this._handleStateChange.bind(this);
    this._onBtnClick = this._handleBtnClick.bind(this);
    manager.events.on('stateChange', this._onStateChange);
    this._btn.addEventListener('click', this._onBtnClick);
    this._syncVisibility();
  }

  private _syncVisibility(): void {
    if (this._manager.getState() === GameState.IDLE) {
      this._show();
    } else {
      this._hide();
    }
  }

  private _show(): void {
    this._el.removeAttribute('hidden');
    this._btn.focus();
  }

  private _hide(): void {
    this._el.setAttribute('hidden', '');
  }

  private _handleStateChange(_data: { from: GameState; to: GameState }): void {
    this._syncVisibility();
  }

  private _handleBtnClick(): void {
    this._manager.startGame();
  }

  destroy(): void {
    this._manager.events.off('stateChange', this._onStateChange);
    this._btn.removeEventListener('click', this._onBtnClick);
  }
}
