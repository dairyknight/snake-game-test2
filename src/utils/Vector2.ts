export class Vector2 {
  constructor(
    readonly x: number,
    readonly y: number,
  ) {}

  equals(other: Vector2): boolean {
    return this.x === other.x && this.y === other.y;
  }

  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}
