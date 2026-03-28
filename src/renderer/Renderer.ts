import { GameManager } from '@/game/GameManager';
import { GameState } from '@/state/GameState';
import { SnakeRenderer } from '@/renderer/SnakeRenderer';
import { FoodRenderer } from '@/renderer/FoodRenderer';
import { UIRenderer } from '@/renderer/UIRenderer';

/** Grid size in cells — matches Board defaults. */
const GRID_SIZE = 20;

export interface RendererConfig {
  showGrid?: boolean; // default: false
}

export class Renderer {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _ctx: CanvasRenderingContext2D;
  private readonly _manager: GameManager;
  private _cellSize = 0;
  private readonly _showGrid: boolean;
  private readonly _resizeHandler: () => void;

  private readonly _snakeRenderer: SnakeRenderer;
  private readonly _foodRenderer: FoodRenderer;
  private readonly _uiRenderer: UIRenderer;

  constructor(
    canvas: HTMLCanvasElement,
    manager: GameManager,
    config?: RendererConfig,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D rendering context');

    this._canvas = canvas;
    this._ctx = ctx;
    this._manager = manager;
    this._showGrid = config?.showGrid ?? false;

    this._resizeHandler = this.resize.bind(this);
    window.addEventListener('resize', this._resizeHandler);
    this.resize();

    this._snakeRenderer = new SnakeRenderer();
    this._foodRenderer = new FoodRenderer();
    this._uiRenderer = new UIRenderer(manager);
  }

  /**
   * Full render cycle — orchestrates clear → board background → food → snake → HUD → overlay.
   */
  draw(_interpolation: number): void {
    const now = performance.now();
    const canvasSize = this._canvas.width;
    const cellSize = this._cellSize;
    const boardSize = cellSize * GRID_SIZE;
    const offsetX = Math.floor((canvasSize - boardSize) / 2);
    const offsetY = Math.floor((canvasSize - boardSize) / 2);

    // 1. Clear canvas
    this._ctx.clearRect(0, 0, canvasSize, canvasSize);

    // 2. Draw board background
    this._ctx.fillStyle = '#1E293B';
    this._ctx.fillRect(offsetX, offsetY, boardSize, boardSize);

    // 3. Optional grid
    if (this._showGrid) {
      this._ctx.strokeStyle = '#334155';
      this._ctx.lineWidth = 0.5;
      for (let i = 0; i <= GRID_SIZE; i++) {
        const x = offsetX + i * cellSize;
        const y = offsetY + i * cellSize;
        this._ctx.beginPath();
        this._ctx.moveTo(x, offsetY);
        this._ctx.lineTo(x, offsetY + boardSize);
        this._ctx.stroke();
        this._ctx.beginPath();
        this._ctx.moveTo(offsetX, y);
        this._ctx.lineTo(offsetX + boardSize, y);
        this._ctx.stroke();
      }
    }

    // 4. Draw food (normal or eat-flash)
    const food = this._manager.getFood();
    if (this._uiRenderer.isEatFlashActive(now)) {
      this._foodRenderer.drawFlash(this._ctx, food.position, cellSize, offsetX, offsetY);
    } else {
      this._foodRenderer.draw(this._ctx, food.position, cellSize, offsetX, offsetY);
    }

    // 5. Draw snake (normal or game-over flash)
    const snake = this._manager.getSnake();
    if (this._uiRenderer.isGameOverFlashOn(now)) {
      this._snakeRenderer.drawFlash(this._ctx, snake.segments, cellSize, offsetX, offsetY);
    } else {
      this._snakeRenderer.draw(this._ctx, snake.segments, cellSize, offsetX, offsetY);
    }

    // 6. Draw HUD (always visible)
    this._uiRenderer.drawHUD(
      this._ctx,
      canvasSize,
      canvasSize,
      this._manager.getScore(),
      this._manager.getHighScore(),
      this._manager.getTickInterval(),
    );

    // 7. Draw overlay for PAUSED or GAME_OVER
    const state = this._manager.getState();
    if (state === GameState.PAUSED || state === GameState.GAME_OVER) {
      this._uiRenderer.drawOverlay(this._ctx, canvasSize, canvasSize, state, this._manager.getScore());
    }
  }

  /**
   * Recalculate canvas size and cell size.
   * Canvas fills 90vmin (largest square fitting the viewport).
   */
  resize(): void {
    const vmin = Math.min(window.innerWidth, window.innerHeight);
    const size = Math.floor(vmin * 0.9);
    this._canvas.width = size;
    this._canvas.height = size;
    this._cellSize = Math.floor(size / GRID_SIZE);
  }

  /**
   * Remove the window resize event listener and clean up sub-renderers.
   */
  destroy(): void {
    window.removeEventListener('resize', this._resizeHandler);
    this._uiRenderer.destroy();
  }

  /** Exposed for testing. */
  get cellSize(): number {
    return this._cellSize;
  }

  /** @internal For testing only — not part of the public API. */
  get _showGridFlag(): boolean {
    return this._showGrid;
  }
}
