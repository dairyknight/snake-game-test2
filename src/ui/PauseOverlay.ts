import { GameManager } from '@/game/GameManager';
import { GameState } from '@/state/GameState';

export class PauseOverlay {
  private readonly _manager: GameManager;
  private readonly _el: HTMLElement;
  private readonly _btn: HTMLButtonElement;
  private _prevFocus: HTMLElement | null = null;
  private readonly _onStateChange: (payload: { from: GameState; to: GameState }) => void;
  private readonly _onResume: () => void;
  private readonly _resumeCleanup: () => void;

  constructor(manager: GameManager) {
    this._manager = manager;
    this._el = document.getElementById('pause-overlay') as HTMLElement;
    this._btn = document.getElementById('resume-btn') as HTMLButtonElement;
    this._onStateChange = this._handleStateChange.bind(this);
    this._onResume = this._handleResume.bind(this);
    this._btn.addEventListener('click', this._onResume);
    this._resumeCleanup = () => this._btn.removeEventListener('click', this._onResume);
    manager.events.on('stateChange', this._onStateChange);
  }

  private _handleStateChange(payload: { from: GameState; to: GameState }): void {
    if (payload.to === GameState.PAUSED) {
      this._show();
    } else {
      this._hide();
    }
  }

  private _show(): void {
    this._prevFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this._el.removeAttribute('hidden');
    this._btn.focus();
  }

  private _hide(): void {
    this._el.setAttribute('hidden', '');
    if (this._prevFocus) {
      this._prevFocus.focus();
    }
    this._prevFocus = null;
  }

  private _handleResume(): void {
    this._manager.resumeGame();
  }

  destroy(): void {
    this._resumeCleanup();
    this._manager.events.off('stateChange', this._onStateChange);
  }
}
