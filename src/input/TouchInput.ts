import { GameManager } from '@/game/GameManager';
import { UP, DOWN, LEFT, RIGHT } from '@/game/Snake';

const SWIPE_THRESHOLD = 30; // px minimum travel to register as swipe

type BtnCleanup = () => void;

export class TouchInput {
  private readonly _manager: GameManager;
  private _startX = 0;
  private _startY = 0;
  private _dpad: HTMLElement | null = null;
  private _btnCleanups: BtnCleanup[] = [];
  private readonly _mql: MediaQueryList;
  private readonly _mqlHandler: (e: MediaQueryListEvent) => void;
  private readonly _touchStartHandler: (e: TouchEvent) => void;
  private readonly _touchEndHandler: (e: TouchEvent) => void;

  constructor(manager: GameManager) {
    this._manager = manager;
    this._touchStartHandler = this._onTouchStart.bind(this);
    this._touchEndHandler = this._onTouchEnd.bind(this);
    this._mql = window.matchMedia('(max-width: 767px)');
    this._mqlHandler = (e: MediaQueryListEvent) => {
      if (e.matches) this._showDpad();
      else this._hideDpad();
    };
    this._mql.addEventListener('change', this._mqlHandler);
    window.addEventListener('touchstart', this._touchStartHandler, { passive: false });
    window.addEventListener('touchend', this._touchEndHandler, { passive: false });
    if (this._mql.matches) this._showDpad();
  }

  private _onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    const touch = e.changedTouches[0];
    if (!touch) return;
    this._startX = touch.clientX;
    this._startY = touch.clientY;
  }

  private _onTouchEnd(e: TouchEvent): void {
    e.preventDefault();
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - this._startX;
    const dy = touch.clientY - this._startY;
    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
    if (Math.abs(dx) >= Math.abs(dy)) {
      this._manager.queueDirection(dx > 0 ? RIGHT : LEFT);
    } else {
      this._manager.queueDirection(dy > 0 ? DOWN : UP);
    }
  }

  private _showDpad(): void {
    if (this._dpad) return; // already shown
    const dpad = document.getElementById('dpad');
    if (!dpad) return;
    dpad.removeAttribute('hidden');
    this._dpad = dpad;
    // Wire D-pad buttons to queueDirection
    const map = [
      { id: 'dpad-up',    dir: UP },
      { id: 'dpad-down',  dir: DOWN },
      { id: 'dpad-left',  dir: LEFT },
      { id: 'dpad-right', dir: RIGHT },
    ] as const;
    for (const { id, dir } of map) {
      const btn = document.getElementById(id);
      if (!btn) continue;
      const direction = dir;
      const onClick      = () => this._manager.queueDirection(direction);
      const onPointerDown  = () => btn.classList.add('pressed');
      const onPointerUp    = () => btn.classList.remove('pressed');
      const onPointerLeave = () => btn.classList.remove('pressed');
      btn.addEventListener('click', onClick);
      btn.addEventListener('pointerdown', onPointerDown);
      btn.addEventListener('pointerup',   onPointerUp);
      btn.addEventListener('pointerleave', onPointerLeave);
      this._btnCleanups.push(() => {
        btn.removeEventListener('click', onClick);
        btn.removeEventListener('pointerdown', onPointerDown);
        btn.removeEventListener('pointerup', onPointerUp);
        btn.removeEventListener('pointerleave', onPointerLeave);
      });
    }
  }

  private _hideDpad(): void {
    if (this._dpad) {
      this._dpad.setAttribute('hidden', '');
      this._dpad = null;
      for (const cleanup of this._btnCleanups) cleanup();
      this._btnCleanups = [];
    }
  }

  destroy(): void {
    this._hideDpad();
    this._mql.removeEventListener('change', this._mqlHandler);
    window.removeEventListener('touchstart', this._touchStartHandler);
    window.removeEventListener('touchend', this._touchEndHandler);
  }
}
