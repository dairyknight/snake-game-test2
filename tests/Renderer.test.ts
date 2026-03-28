import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Renderer, RendererConfig } from '@/renderer/Renderer';
import { SnakeRenderer } from '@/renderer/SnakeRenderer';
import { FoodRenderer } from '@/renderer/FoodRenderer';
import { UIRenderer } from '@/renderer/UIRenderer';
import { GameManager } from '@/game/GameManager';

function makeMockCtx(): CanvasRenderingContext2D {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    font: '',
    textAlign: 'left' as CanvasTextAlign,
  } as unknown as CanvasRenderingContext2D;
}

function makeMockCanvas(ctx: CanvasRenderingContext2D): HTMLCanvasElement {
  return {
    getContext: vi.fn().mockReturnValue(ctx),
    width: 0,
    height: 0,
  } as unknown as HTMLCanvasElement;
}

describe('Renderer', () => {
  let manager: GameManager;
  let ctx: CanvasRenderingContext2D;
  let canvas: HTMLCanvasElement;
  let renderer: Renderer;

  beforeEach(() => {
    localStorage.clear();
    manager = new GameManager();
    ctx = makeMockCtx();
    canvas = makeMockCanvas(ctx);
  });

  afterEach(() => {
    renderer?.destroy();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // 1. constructor throws if getContext returns null
  it('constructor throws if getContext returns null', () => {
    const badCanvas = {
      getContext: vi.fn().mockReturnValue(null),
    } as unknown as HTMLCanvasElement;
    expect(() => new Renderer(badCanvas, manager)).toThrow('Failed to get 2D rendering context');
  });

  // 2. constructor calls resize() — canvas.width is set after construction
  it('constructor calls resize() setting canvas dimensions', () => {
    vi.stubGlobal('window', {
      innerWidth: 900,
      innerHeight: 900,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    renderer = new Renderer(canvas, manager);
    // After resize with 900x900: size = floor(900*0.9) = 810; canvas.width = 810
    expect(canvas.width).toBe(810);
    expect(canvas.height).toBe(810);
  });

  // 3. draw() calls clearRect
  it('draw() calls clearRect', () => {
    vi.stubGlobal('window', {
      innerWidth: 800,
      innerHeight: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    renderer = new Renderer(canvas, manager);
    const clearRectSpy = vi.spyOn(ctx, 'clearRect');
    renderer.draw(0);
    expect(clearRectSpy).toHaveBeenCalled();
  });

  // 4. draw() calls fillRect for board background
  it('draw() calls fillRect for board background', () => {
    vi.stubGlobal('window', {
      innerWidth: 800,
      innerHeight: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    renderer = new Renderer(canvas, manager);
    const fillRectSpy = vi.spyOn(ctx, 'fillRect');
    renderer.draw(0);
    expect(fillRectSpy).toHaveBeenCalled();
  });

  // 5. draw() calls food renderer
  it('draw() calls FoodRenderer.draw', () => {
    vi.stubGlobal('window', {
      innerWidth: 800,
      innerHeight: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const foodDrawSpy = vi.spyOn(FoodRenderer.prototype, 'draw');
    renderer = new Renderer(canvas, manager);
    renderer.draw(0);
    expect(foodDrawSpy).toHaveBeenCalled();
  });

  // 6. draw() calls snake renderer
  it('draw() calls SnakeRenderer.draw', () => {
    vi.stubGlobal('window', {
      innerWidth: 800,
      innerHeight: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const snakeDrawSpy = vi.spyOn(SnakeRenderer.prototype, 'draw');
    renderer = new Renderer(canvas, manager);
    renderer.draw(0);
    expect(snakeDrawSpy).toHaveBeenCalled();
  });

  // 7. draw() calls drawHUD
  it('draw() calls UIRenderer.drawHUD', () => {
    vi.stubGlobal('window', {
      innerWidth: 800,
      innerHeight: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const drawHUDSpy = vi.spyOn(UIRenderer.prototype, 'drawHUD');
    renderer = new Renderer(canvas, manager);
    renderer.draw(0);
    expect(drawHUDSpy).toHaveBeenCalled();
  });

  // 8. draw() calls drawOverlay when PAUSED
  it('draw() calls drawOverlay when state is PAUSED', () => {
    vi.stubGlobal('window', {
      innerWidth: 800,
      innerHeight: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const drawOverlaySpy = vi.spyOn(UIRenderer.prototype, 'drawOverlay');
    renderer = new Renderer(canvas, manager);
    manager.startGame();
    manager.pauseGame();
    renderer.draw(0);
    expect(drawOverlaySpy).toHaveBeenCalled();
  });

  // 9. draw() does NOT call drawOverlay when PLAYING
  it('draw() does NOT call drawOverlay when state is PLAYING', () => {
    vi.stubGlobal('window', {
      innerWidth: 800,
      innerHeight: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const drawOverlaySpy = vi.spyOn(UIRenderer.prototype, 'drawOverlay');
    renderer = new Renderer(canvas, manager);
    manager.startGame();
    renderer.draw(0);
    expect(drawOverlaySpy).not.toHaveBeenCalled();
  });

  // 10. draw() uses drawFlash for food during eat flash
  it('draw() uses FoodRenderer.drawFlash during eat flash', () => {
    vi.stubGlobal('window', {
      innerWidth: 800,
      innerHeight: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const foodDrawSpy = vi.spyOn(FoodRenderer.prototype, 'draw');
    const foodDrawFlashSpy = vi.spyOn(FoodRenderer.prototype, 'drawFlash');

    // Stub performance.now to return a fixed time for the flash start
    const startTime = 5000;
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(startTime) });

    renderer = new Renderer(canvas, manager);

    // Trigger eat flash by emitting the foodEaten event
    manager.events.emit('foodEaten', undefined);

    // Draw while flash is active (same time = within flash window)
    renderer.draw(0);

    expect(foodDrawFlashSpy).toHaveBeenCalled();
    expect(foodDrawSpy).not.toHaveBeenCalled();
  });

  // 11. resize() sets cellSize correctly
  it('resize() sets cellSize correctly', () => {
    vi.stubGlobal('window', {
      innerWidth: 900,
      innerHeight: 900,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    renderer = new Renderer(canvas, manager);
    // size = floor(900 * 0.9) = 810; cellSize = floor(810 / 20) = 40
    expect(renderer.cellSize).toBe(40);
  });

  // 12. destroy() calls UIRenderer.destroy
  it('destroy() calls UIRenderer.destroy', () => {
    vi.stubGlobal('window', {
      innerWidth: 800,
      innerHeight: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const destroySpy = vi.spyOn(UIRenderer.prototype, 'destroy');
    renderer = new Renderer(canvas, manager);
    renderer.destroy();
    expect(destroySpy).toHaveBeenCalled();
  });

  // 13. showGrid: false (default) — beginPath not called for grid
  it('draw() does not draw grid lines when showGrid is false (default)', () => {
    vi.stubGlobal('window', {
      innerWidth: 800,
      innerHeight: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    renderer = new Renderer(canvas, manager);
    const beginPathSpy = vi.spyOn(ctx, 'beginPath');
    renderer.draw(0);
    // FoodRenderer uses beginPath for the arc; but without grid, lineTo should not be called
    const lineToSpy = vi.spyOn(ctx, 'lineTo');
    // Reset and re-draw to get a clean count
    beginPathSpy.mockClear();
    lineToSpy.mockClear();

    // Draw again with the spies in place
    const ctx2 = makeMockCtx();
    const canvas2 = makeMockCanvas(ctx2);
    const lineToSpy2 = vi.spyOn(ctx2, 'lineTo');
    const renderer2 = new Renderer(canvas2, manager);
    renderer2.draw(0);
    renderer2.destroy();
    // No grid lines means lineTo was not called for grid (only food arc uses beginPath/arc)
    expect(lineToSpy2).not.toHaveBeenCalled();
  });

  // 14. showGrid: true — grid lines are drawn
  it('draw() draws grid lines when showGrid is true', () => {
    vi.stubGlobal('window', {
      innerWidth: 800,
      innerHeight: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const config: RendererConfig = { showGrid: true };
    const ctx2 = makeMockCtx();
    const canvas2 = makeMockCanvas(ctx2);
    const beginPathSpy = vi.spyOn(ctx2, 'beginPath');
    const lineToSpy = vi.spyOn(ctx2, 'lineTo');
    const renderer2 = new Renderer(canvas2, manager, config);
    renderer2.draw(0);
    renderer2.destroy();
    // With showGrid, beginPath and lineTo should be called for grid lines
    expect(beginPathSpy).toHaveBeenCalled();
    expect(lineToSpy).toHaveBeenCalled();
  });
});
