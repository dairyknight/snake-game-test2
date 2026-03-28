import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UIRenderer, EAT_FLASH_DURATION_MS, GAME_OVER_FLASH_COUNT, GAME_OVER_FLASH_INTERVAL_MS } from '@/renderer/UIRenderer';
import { GameManager } from '@/game/GameManager';
import { GameState } from '@/state/GameState';

function makeMockCtx(): CanvasRenderingContext2D {
  return {
    fillStyle: '',
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    fillText: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    strokeRect: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('UIRenderer', () => {
  let manager: GameManager;
  let uiRenderer: UIRenderer;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    manager = new GameManager();
    uiRenderer = new UIRenderer(manager);
    ctx = makeMockCtx();
  });

  afterEach(() => {
    uiRenderer.destroy();
    vi.unstubAllGlobals();
  });

  // --- Eat flash tests ---

  it('isEatFlashActive returns false before any food eaten', () => {
    expect(uiRenderer.isEatFlashActive(1000)).toBe(false);
  });

  it('isEatFlashActive returns true immediately after foodEaten event', () => {
    const startTime = 1000;
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(startTime) });
    manager.events.emit('foodEaten', undefined);
    expect(uiRenderer.isEatFlashActive(startTime)).toBe(true);
  });

  it('isEatFlashActive returns false after EAT_FLASH_DURATION_MS passes', () => {
    const startTime = 1000;
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(startTime) });
    manager.events.emit('foodEaten', undefined);
    expect(uiRenderer.isEatFlashActive(startTime + EAT_FLASH_DURATION_MS + 1)).toBe(false);
  });

  // --- Game-over flash tests ---

  it('isGameOverFlashOn returns false before any game over', () => {
    expect(uiRenderer.isGameOverFlashOn(1000)).toBe(false);
  });

  it('isGameOverFlashOn returns true at t=0 after GAME_OVER (elapsed=0)', () => {
    const startTime = 1000;
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(startTime) });
    manager.events.emit('stateChange', { from: GameState.PLAYING, to: GameState.GAME_OVER });
    // elapsed = 0 → floor(0/150) % 2 === 0 → true
    expect(uiRenderer.isGameOverFlashOn(startTime)).toBe(true);
  });

  it('isGameOverFlashOn returns false at t=GAME_OVER_FLASH_INTERVAL_MS after GAME_OVER', () => {
    const startTime = 1000;
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(startTime) });
    manager.events.emit('stateChange', { from: GameState.PLAYING, to: GameState.GAME_OVER });
    // elapsed = GAME_OVER_FLASH_INTERVAL_MS → floor(150/150) % 2 === 1 → false
    expect(uiRenderer.isGameOverFlashOn(startTime + GAME_OVER_FLASH_INTERVAL_MS)).toBe(false);
  });

  it('isGameOverActive returns true within the flash window', () => {
    const startTime = 1000;
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(startTime) });
    manager.events.emit('stateChange', { from: GameState.PLAYING, to: GameState.GAME_OVER });
    const totalWindow = GAME_OVER_FLASH_COUNT * GAME_OVER_FLASH_INTERVAL_MS * 2;
    expect(uiRenderer.isGameOverActive(startTime + totalWindow - 1)).toBe(true);
  });

  it('isGameOverActive returns false after the flash window expires', () => {
    const startTime = 1000;
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(startTime) });
    manager.events.emit('stateChange', { from: GameState.PLAYING, to: GameState.GAME_OVER });
    const totalWindow = GAME_OVER_FLASH_COUNT * GAME_OVER_FLASH_INTERVAL_MS * 2;
    expect(uiRenderer.isGameOverActive(startTime + totalWindow)).toBe(false);
  });

  // --- HUD tests ---

  it('drawHUD calls fillText at least twice', () => {
    const spy = vi.spyOn(ctx, 'fillText');
    uiRenderer.drawHUD(ctx, 400, 400, 0, 0, 150);
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('drawHUD calls fillText with a string containing the score value', () => {
    const spy = vi.spyOn(ctx, 'fillText');
    uiRenderer.drawHUD(ctx, 400, 400, 42, 0, 150);
    const allText = spy.mock.calls.map(c => c[0]);
    expect(allText.some(t => t.includes('42'))).toBe(true);
  });

  it('drawHUD calls fillText with a string containing the highScore value', () => {
    const spy = vi.spyOn(ctx, 'fillText');
    uiRenderer.drawHUD(ctx, 400, 400, 0, 99, 150);
    const allText = spy.mock.calls.map(c => c[0]);
    expect(allText.some(t => t.includes('99'))).toBe(true);
  });

  // --- Overlay tests ---

  it('drawOverlay with PAUSED calls fillText with "PAUSED"', () => {
    const spy = vi.spyOn(ctx, 'fillText');
    uiRenderer.drawOverlay(ctx, 400, 400, GameState.PAUSED, 0);
    const allText = spy.mock.calls.map(c => c[0]);
    expect(allText.some(t => t === 'PAUSED')).toBe(true);
  });

  it('drawOverlay with GAME_OVER calls fillText with "GAME OVER"', () => {
    const spy = vi.spyOn(ctx, 'fillText');
    uiRenderer.drawOverlay(ctx, 400, 400, GameState.GAME_OVER, 10);
    const allText = spy.mock.calls.map(c => c[0]);
    expect(allText.some(t => t === 'GAME OVER')).toBe(true);
  });

  it('drawOverlay calls fillRect to dim the canvas', () => {
    const spy = vi.spyOn(ctx, 'fillRect');
    uiRenderer.drawOverlay(ctx, 400, 400, GameState.PAUSED, 0);
    expect(spy).toHaveBeenCalled();
  });

  // --- Destroy test ---

  it('destroy does not throw', () => {
    expect(() => uiRenderer.destroy()).not.toThrow();
  });
});
