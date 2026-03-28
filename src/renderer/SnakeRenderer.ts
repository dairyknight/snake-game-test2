import { Vector2 } from '@/utils/Vector2';

const BODY_COLOUR = '#22C55E';
const HEAD_COLOUR = '#4ADE80';
const FLASH_COLOUR = '#EF4444';

export class SnakeRenderer {
  /**
   * Draw body segments (index 1..n-1) then head (index 0).
   * Head drawn last (on top) with distinct colour.
   */
  draw(
    ctx: CanvasRenderingContext2D,
    segments: readonly Vector2[],
    cellSize: number,
    offsetX: number,
    offsetY: number,
  ): void {
    if (segments.length === 0) return;

    // Draw all segments in body colour
    ctx.fillStyle = BODY_COLOUR;
    for (const segment of segments) {
      ctx.fillRect(
        segment.x * cellSize + offsetX,
        segment.y * cellSize + offsetY,
        cellSize - 1,
        cellSize - 1,
      );
    }

    // Redraw head in head colour on top
    const head = segments[0]!;
    ctx.fillStyle = HEAD_COLOUR;
    ctx.fillRect(
      head.x * cellSize + offsetX,
      head.y * cellSize + offsetY,
      cellSize - 1,
      cellSize - 1,
    );
  }

  /**
   * Draw all segments in game-over red (#EF4444).
   */
  drawFlash(
    ctx: CanvasRenderingContext2D,
    segments: readonly Vector2[],
    cellSize: number,
    offsetX: number,
    offsetY: number,
  ): void {
    if (segments.length === 0) return;

    ctx.fillStyle = FLASH_COLOUR;
    for (const segment of segments) {
      ctx.fillRect(
        segment.x * cellSize + offsetX,
        segment.y * cellSize + offsetY,
        cellSize - 1,
        cellSize - 1,
      );
    }
  }
}
