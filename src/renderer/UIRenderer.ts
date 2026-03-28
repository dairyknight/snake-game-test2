import { GameManager } from '@/game/GameManager';
import { GameState } from '@/state/GameState';

export const EAT_FLASH_DURATION_MS = 400;
export const GAME_OVER_FLASH_COUNT = 3;
export const GAME_OVER_FLASH_INTERVAL_MS = 150;

const SPEED_TIERS: Array<{ threshold: number; tier: number }> = [
  { threshold: 75, tier: 5 },
  { threshold: 90, tier: 4 },
  { threshold: 110, tier: 3 },
  { threshold: 130, tier: 2 },
  { threshold: 150, tier: 1 },
];

export class UIRenderer {
  private _eatFlashStart: number | null = null;
  private _gameOverFlashStart: number | null = null;
  private readonly _manager: GameManager;

  private readonly _onFoodEaten = (_data: undefined): void => {
    this._eatFlashStart = performance.now();
  };

  private readonly _onStateChange = (data: { from: GameState; to: GameState }): void => {
    if (data.to === GameState.GAME_OVER) {
      this._gameOverFlashStart = performance.now();
    }
  };

  constructor(manager: GameManager) {
    this._manager = manager;
    this._manager.events.on('foodEaten', this._onFoodEaten);
    this._manager.events.on('stateChange', this._onStateChange);
  }

  isEatFlashActive(now: number): boolean {
    return this._eatFlashStart !== null && now - this._eatFlashStart < EAT_FLASH_DURATION_MS;
  }

  isGameOverFlashOn(now: number): boolean {
    if (this._gameOverFlashStart === null) return false;
    const elapsed = now - this._gameOverFlashStart;
    return Math.floor(elapsed / GAME_OVER_FLASH_INTERVAL_MS) % 2 === 0;
  }

  isGameOverActive(now: number): boolean {
    if (this._gameOverFlashStart === null) return false;
    return now - this._gameOverFlashStart < GAME_OVER_FLASH_COUNT * GAME_OVER_FLASH_INTERVAL_MS * 2;
  }

  drawHUD(
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    _canvasH: number,
    score: number,
    highScore: number,
    tickInterval: number,
  ): void {
    const tier = SPEED_TIERS.find(t => tickInterval <= t.threshold)?.tier ?? 1;

    // Scale font with canvas size: 16px at 640px canvas, caps at 12px minimum.
    const fontSize = Math.max(12, Math.round(canvasW / 40));
    const y = Math.round(fontSize * 1.4);
    const pad = Math.round(canvasW / 80);

    ctx.fillStyle = '#F1F5F9';
    ctx.font = `${fontSize}px sans-serif`;

    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, pad, y);

    ctx.textAlign = 'right';
    ctx.fillText(`BEST: ${highScore}`, canvasW - pad, y);

    ctx.textAlign = 'center';
    ctx.fillText(`SPEED: ${tier}`, canvasW / 2, y);
  }

  drawOverlay(
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
    state: GameState,
    score: number,
  ): void {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Scale overlay font with canvas size: 32px at 640px canvas.
    const fontSize = Math.max(18, Math.round(canvasW / 20));
    const lineGap = Math.round(fontSize * 0.8);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';

    if (state === GameState.PAUSED) {
      ctx.fillText('PAUSED', canvasW / 2, canvasH / 2);
    } else if (state === GameState.GAME_OVER) {
      ctx.fillText('GAME OVER', canvasW / 2, canvasH / 2 - lineGap);
      ctx.fillText(`Score: ${score}`, canvasW / 2, canvasH / 2 + lineGap);
    }
  }

  destroy(): void {
    this._manager.events.off('foodEaten', this._onFoodEaten);
    this._manager.events.off('stateChange', this._onStateChange);
  }
}
