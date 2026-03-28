import { Vector2 } from '@/utils/Vector2';

const FOOD_COLOUR = '#EF4444';
const FLASH_COLOUR = '#FBBF24';

export class FoodRenderer {
  private _drawWithColour(
    ctx: CanvasRenderingContext2D,
    position: Vector2,
    cellSize: number,
    offsetX: number,
    offsetY: number,
    colour: string,
  ): void {
    const cx = position.x * cellSize + cellSize / 2 + offsetX;
    const cy = position.y * cellSize + cellSize / 2 + offsetY;
    const radius = cellSize * 0.4;

    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  draw(
    ctx: CanvasRenderingContext2D,
    position: Vector2,
    cellSize: number,
    offsetX: number,
    offsetY: number,
  ): void {
    this._drawWithColour(ctx, position, cellSize, offsetX, offsetY, FOOD_COLOUR);
  }

  drawFlash(
    ctx: CanvasRenderingContext2D,
    position: Vector2,
    cellSize: number,
    offsetX: number,
    offsetY: number,
  ): void {
    this._drawWithColour(ctx, position, cellSize, offsetX, offsetY, FLASH_COLOUR);
  }
}
