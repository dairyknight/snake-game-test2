import { GameManager } from '@/game/GameManager';

/** Grid size in cells — matches Board defaults. */
const GRID_SIZE = 20;

export interface RendererConfig {
  showGrid?: boolean; // default: false
}

export class Renderer {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _ctx: CanvasRenderingContext2D;
  private readonly _manager: GameManager; // used in T4 when sub-renderers query game state
  private _cellSize = 0;
  private readonly _showGrid: boolean;
  private readonly _resizeHandler: () => void;

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
  }

  /**
   * Matches DrawCallback = (interpolation: number) => void.
   * Full render cycle — sub-renderers wired in T4.
   */
  draw(_interpolation: number): void {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._manager.getState(); // T4 expands this into full render cycle
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
   * Remove the window resize event listener.
   */
  destroy(): void {
    window.removeEventListener('resize', this._resizeHandler);
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
