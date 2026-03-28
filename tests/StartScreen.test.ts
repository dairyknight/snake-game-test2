import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from '@/utils/EventEmitter';
import type { GameEvents } from '@/state/GameState';
import { GameState } from '@/state/GameState';
import type { GameManager } from '@/game/GameManager';
import { StartScreen } from '@/ui/StartScreen';

function makeMockManager(state: GameState = GameState.IDLE) {
  const emitter = new EventEmitter<GameEvents>();
  return {
    getState: vi.fn().mockReturnValue(state),
    startGame: vi.fn(),
    events: emitter,
  } as unknown as GameManager;
}

describe('StartScreen', () => {
  let manager: ReturnType<typeof makeMockManager>;
  let screen: StartScreen;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="game-wrapper">
        <div id="canvas-container">
          <canvas id="game-canvas"></canvas>
          <div id="start-screen" class="screen-overlay" hidden>
            <button id="start-btn">Start Game</button>
          </div>
        </div>
      </div>
    `;
    manager = makeMockManager(GameState.IDLE);
    screen = new StartScreen(manager as unknown as GameManager);
  });

  afterEach(() => {
    screen.destroy();
    document.body.innerHTML = '';
  });

  describe('Initial visibility', () => {
    it('is visible on construction when state is IDLE', () => {
      const el = document.getElementById('start-screen')!;
      expect(el.hasAttribute('hidden')).toBe(false);
    });

    it('is hidden on construction when state is PLAYING', () => {
      const m = makeMockManager(GameState.PLAYING);
      const s = new StartScreen(m as unknown as GameManager);
      expect(document.getElementById('start-screen')!.hasAttribute('hidden')).toBe(true);
      s.destroy();
    });

    it('is hidden on construction when state is PAUSED', () => {
      const m = makeMockManager(GameState.PAUSED);
      const s = new StartScreen(m as unknown as GameManager);
      expect(document.getElementById('start-screen')!.hasAttribute('hidden')).toBe(true);
      s.destroy();
    });

    it('is hidden on construction when state is GAME_OVER', () => {
      const m = makeMockManager(GameState.GAME_OVER);
      const s = new StartScreen(m as unknown as GameManager);
      expect(document.getElementById('start-screen')!.hasAttribute('hidden')).toBe(true);
      s.destroy();
    });
  });

  describe('stateChange reactions', () => {
    it('hides when stateChange fires and state becomes PLAYING', () => {
      const el = document.getElementById('start-screen')!;
      // Initially visible (IDLE)
      expect(el.hasAttribute('hidden')).toBe(false);

      (manager.getState as ReturnType<typeof vi.fn>).mockReturnValue(GameState.PLAYING);
      (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
        from: GameState.IDLE,
        to: GameState.PLAYING,
      });

      expect(el.hasAttribute('hidden')).toBe(true);
    });

    it('shows when stateChange fires and state becomes IDLE', () => {
      const m = makeMockManager(GameState.GAME_OVER);
      const s = new StartScreen(m as unknown as GameManager);
      const el = document.getElementById('start-screen')!;

      // Initially hidden (GAME_OVER)
      expect(el.hasAttribute('hidden')).toBe(true);

      (m.getState as ReturnType<typeof vi.fn>).mockReturnValue(GameState.IDLE);
      (m as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
        from: GameState.GAME_OVER,
        to: GameState.IDLE,
      });

      expect(el.hasAttribute('hidden')).toBe(false);
      s.destroy();
    });
  });

  describe('Button', () => {
    it('start button click calls startGame()', () => {
      const btn = document.getElementById('start-btn') as HTMLButtonElement;
      btn.click();
      expect((manager.startGame as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1);
    });

    it('start button receives focus when screen becomes visible', () => {
      const btn = document.getElementById('start-btn') as HTMLButtonElement;
      const m = makeMockManager(GameState.GAME_OVER);
      const s = new StartScreen(m as unknown as GameManager);

      (m.getState as ReturnType<typeof vi.fn>).mockReturnValue(GameState.IDLE);
      (m as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
        from: GameState.GAME_OVER,
        to: GameState.IDLE,
      });

      expect(document.activeElement).toBe(btn);
      s.destroy();
    });

    it('start button has focus on construction when state is IDLE', () => {
      const btn = document.getElementById('start-btn') as HTMLButtonElement;
      expect(document.activeElement).toBe(btn);
    });
  });

  describe('Cleanup', () => {
    it('destroy() stops responding to stateChange events', () => {
      const el = document.getElementById('start-screen')!;
      screen.destroy();

      (manager.getState as ReturnType<typeof vi.fn>).mockReturnValue(GameState.PLAYING);
      (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
        from: GameState.IDLE,
        to: GameState.PLAYING,
      });

      // Should still be visible — no longer listening
      expect(el.hasAttribute('hidden')).toBe(false);
    });

    it('destroy() stops responding to button clicks', () => {
      screen.destroy();
      const btn = document.getElementById('start-btn') as HTMLButtonElement;
      btn.click();
      expect((manager.startGame as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
    });
  });
});
