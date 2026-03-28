import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FoodRenderer } from '@/renderer/FoodRenderer';
import { Vector2 } from '@/utils/Vector2';

function makeMockCtx(): CanvasRenderingContext2D {
  return {
    fillStyle: '',
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('FoodRenderer', () => {
  let ctx: CanvasRenderingContext2D;
  let renderer: FoodRenderer;

  beforeEach(() => {
    ctx = makeMockCtx();
    renderer = new FoodRenderer();
  });

  it('draw() calls beginPath, arc, and fill', () => {
    renderer.draw(ctx, new Vector2(0, 0), 20, 0, 0);

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('draw() arc called with correct center and radius', () => {
    // position (1,2), cellSize=20, offsetX=0, offsetY=0
    // cx = 1*20 + 20/2 + 0 = 30
    // cy = 2*20 + 20/2 + 0 = 50
    // radius = 20 * 0.4 = 8
    renderer.draw(ctx, new Vector2(1, 2), 20, 0, 0);

    expect(ctx.arc).toHaveBeenCalledWith(30, 50, 8, 0, Math.PI * 2);
  });

  it('draw() sets fillStyle to #EF4444 before arc', () => {
    let fillStyleAtArc: string | undefined;

    (ctx.arc as ReturnType<typeof vi.fn>).mockImplementation(() => {
      fillStyleAtArc = ctx.fillStyle as string;
    });

    renderer.draw(ctx, new Vector2(0, 0), 20, 0, 0);

    expect(fillStyleAtArc).toBe('#EF4444');
  });

  it('drawFlash() sets fillStyle to #FBBF24', () => {
    let fillStyleAtArc: string | undefined;

    (ctx.arc as ReturnType<typeof vi.fn>).mockImplementation(() => {
      fillStyleAtArc = ctx.fillStyle as string;
    });

    renderer.drawFlash(ctx, new Vector2(0, 0), 20, 0, 0);

    expect(fillStyleAtArc).toBe('#FBBF24');
  });

  it('drawFlash() also calls beginPath, arc, fill', () => {
    renderer.drawFlash(ctx, new Vector2(0, 0), 20, 0, 0);

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('draw() with offsetX/offsetY: position (0,0), cellSize=20, offsetX=10, offsetY=10 → cx=20, cy=20', () => {
    // cx = 0*20 + 20/2 + 10 = 20
    // cy = 0*20 + 20/2 + 10 = 20
    // radius = 20 * 0.4 = 8
    renderer.draw(ctx, new Vector2(0, 0), 20, 10, 10);

    expect(ctx.arc).toHaveBeenCalledWith(20, 20, 8, 0, Math.PI * 2);
  });
});
