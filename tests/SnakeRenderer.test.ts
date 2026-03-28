import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SnakeRenderer } from '@/renderer/SnakeRenderer';
import { Vector2 } from '@/utils/Vector2';

/** Create a minimal CanvasRenderingContext2D stub for testing. */
function makeCtx(): CanvasRenderingContext2D {
  return {
    fillStyle: '',
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('SnakeRenderer', () => {
  let ctx: CanvasRenderingContext2D;
  let renderer: SnakeRenderer;

  beforeEach(() => {
    ctx = makeCtx();
    renderer = new SnakeRenderer();
  });

  // 1. draw() with 3 segments: body pass draws all 3 + head redraw = 4 fillRect calls
  it('draw() calls fillRect for each segment plus head redraw', () => {
    const segments = [
      new Vector2(0, 0),
      new Vector2(1, 0),
      new Vector2(2, 0),
    ];
    renderer.draw(ctx, segments, 20, 0, 0);
    // 3 body draws + 1 head redraw on top
    expect(ctx.fillRect).toHaveBeenCalledTimes(4);
  });

  // 2. draw() with correct pixel coords: segment at (2,3), cellSize=20, offsetX=5, offsetY=5 → fillRect(45, 65, 19, 19)
  it('draw() calculates correct pixel coordinates', () => {
    const segments = [new Vector2(2, 3)];
    renderer.draw(ctx, segments, 20, 5, 5);
    // x = 2*20 + 5 = 45, y = 3*20 + 5 = 65, w = 20-1 = 19, h = 20-1 = 19
    expect(ctx.fillRect).toHaveBeenCalledWith(45, 65, 19, 19);
  });

  // 3. draw() body colour (#22C55E) set before body segments, head colour (#4ADE80) set for head
  it('draw() sets body colour then head colour', () => {
    const fillStyleValues: string[] = [];
    const ctxWithTracking = {
      fillRect: vi.fn(),
      get fillStyle() {
        return fillStyleValues[fillStyleValues.length - 1] ?? '';
      },
      set fillStyle(value: string) {
        fillStyleValues.push(value);
      },
    } as unknown as CanvasRenderingContext2D;

    const segments = [new Vector2(0, 0), new Vector2(1, 0)];
    renderer.draw(ctxWithTracking, segments, 20, 0, 0);

    expect(fillStyleValues[0]).toBe('#22C55E');
    expect(fillStyleValues[1]).toBe('#4ADE80');
  });

  // 4. draw() empty segments array: no error thrown, fillRect not called
  it('draw() with empty segments does not throw and does not call fillRect', () => {
    expect(() => renderer.draw(ctx, [], 20, 0, 0)).not.toThrow();
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  // 5. draw() single segment (head only): drawn with head colour
  it('draw() single segment is drawn with head colour', () => {
    const fillStyleValues: string[] = [];
    const ctxWithTracking = {
      fillRect: vi.fn(),
      get fillStyle() {
        return fillStyleValues[fillStyleValues.length - 1] ?? '';
      },
      set fillStyle(value: string) {
        fillStyleValues.push(value);
      },
    } as unknown as CanvasRenderingContext2D;

    renderer.draw(ctxWithTracking, [new Vector2(0, 0)], 20, 0, 0);

    // Last fillStyle set should be head colour
    expect(fillStyleValues[fillStyleValues.length - 1]).toBe('#4ADE80');
  });

  // 6. drawFlash() all segments drawn in red (#EF4444)
  it('drawFlash() draws all segments in red', () => {
    const fillStyleValues: string[] = [];
    const ctxWithTracking = {
      fillRect: vi.fn(),
      get fillStyle() {
        return fillStyleValues[fillStyleValues.length - 1] ?? '';
      },
      set fillStyle(value: string) {
        fillStyleValues.push(value);
      },
    } as unknown as CanvasRenderingContext2D;

    const segments = [new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0)];
    renderer.drawFlash(ctxWithTracking, segments, 20, 0, 0);

    // Only one fillStyle should be set and it should be red
    expect(fillStyleValues).toHaveLength(1);
    expect(fillStyleValues[0]).toBe('#EF4444');
  });

  // 7. drawFlash() pixel coords same as draw()
  it('drawFlash() calculates same pixel coordinates as draw()', () => {
    const segments = [new Vector2(2, 3)];
    renderer.drawFlash(ctx, segments, 20, 5, 5);
    expect(ctx.fillRect).toHaveBeenCalledWith(45, 65, 19, 19);
  });

  // 8. drawFlash() empty segments: no error thrown
  it('drawFlash() with empty segments does not throw', () => {
    expect(() => renderer.drawFlash(ctx, [], 20, 0, 0)).not.toThrow();
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });
});
