import { GameManager } from '@/game/GameManager';
import { GameState } from '@/state/GameState';

export class GameOverScreen {
  private readonly _manager: GameManager;
  private readonly _el: HTMLElement;
  private readonly _scoreEl: HTMLElement;
  private readonly _playAgainBtn: HTMLButtonElement;
  private readonly _clearBtn: HTMLButtonElement;
  private _finalScore = 0;
  private readonly _onStateChange: (payload: { from: GameState; to: GameState }) => void;
  private readonly _onGameOver: (payload: { score: number }) => void;
  private readonly _onPlayAgain: () => void;
  private readonly _onClearScore: () => void;
  private readonly _btnCleanups: Array<() => void> = [];

  constructor(manager: GameManager) {
    this._manager = manager;
    this._el = document.getElementById('game-over-screen')!;
    this._scoreEl = document.getElementById('final-score-value')!;
    this._playAgainBtn = document.getElementById('play-again-btn') as HTMLButtonElement;
    this._clearBtn = document.getElementById('clear-score-btn') as HTMLButtonElement;

    this._onStateChange = this._handleStateChange.bind(this);
    this._onGameOver = this._handleGameOver.bind(this);
    this._onPlayAgain = this._handlePlayAgain.bind(this);
    this._onClearScore = this._handleClearScore.bind(this);

    manager.events.on('stateChange', this._onStateChange);
    manager.events.on('gameOver', this._onGameOver);

    this._playAgainBtn.addEventListener('click', this._onPlayAgain);
    this._btnCleanups.push(() => this._playAgainBtn.removeEventListener('click', this._onPlayAgain));

    this._clearBtn.addEventListener('click', this._onClearScore);
    this._btnCleanups.push(() => this._clearBtn.removeEventListener('click', this._onClearScore));
  }

  private _handleStateChange(payload: { from: GameState; to: GameState }): void {
    if (payload.to === GameState.GAME_OVER) {
      this._show();
    } else if (payload.from === GameState.GAME_OVER) {
      this._hide();
    }
  }

  private _handleGameOver(payload: { score: number }): void {
    this._finalScore = payload.score;
    this._scoreEl.textContent = String(this._finalScore);
  }

  private _show(): void {
    this._el.removeAttribute('hidden');
    this._playAgainBtn.focus();
  }

  private _hide(): void {
    this._el.setAttribute('hidden', '');
  }

  private _handlePlayAgain(): void {
    this._manager.restartGame();
  }

  private _handleClearScore(): void {
    this._manager.clearHighScore();
  }

  destroy(): void {
    this._manager.events.off('stateChange', this._onStateChange);
    this._manager.events.off('gameOver', this._onGameOver);
    this._btnCleanups.forEach(fn => fn());
  }
}
