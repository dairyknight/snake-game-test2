import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TouchInput } from '@/input/TouchInput';
import { GameManager } from '@/game/GameManager';
import { UP, DOWN, LEFT, RIGHT } from '@/game/Snake';

describe('TouchInput', () => {
  let manager: GameManager;
  let input: TouchInput;

  function makeMockManager() {
    return {
      queueDirection: vi.fn(),
      getState: vi.fn(),
      togglePause: vi.fn(),
      startGame: vi.fn(),
      restartGame: vi.fn(),
    } as unknown as GameManager;
  }

  // Setup DOM for D-pad tests
  function setupDom() {
    document.body.innerHTML = `
      <div id="game-wrapper">
        <canvas id="game-canvas"></canvas>
        <div id="dpad" role="group" aria-label="Directional controls" hidden>
          <button class="dpad-btn" id="dpad-up"    aria-label="Move up">▲</button>
          <button class="dpad-btn" id="dpad-left"  aria-label="Move left">◀</button>
          <button class="dpad-btn" id="dpad-right" aria-label="Move right">▶</button>
          <button class="dpad-btn" id="dpad-down"  aria-label="Move down">▼</button>
        </div>
      </div>
    `;
  }

  function makeTouchEvent(type: string, clientX: number, clientY: number): TouchEvent {
    const touch = new Touch({ identifier: 1, target: document.body, clientX, clientY });
    return new TouchEvent(type, { changedTouches: [touch], cancelable: true, bubbles: true });
  }

  function swipe(startX: number, startY: number, endX: number, endY: number) {
    window.dispatchEvent(makeTouchEvent('touchstart', startX, startY));
    window.dispatchEvent(makeTouchEvent('touchend', endX, endY));
  }

  afterEach(() => {
    input.destroy();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  describe('swipe gestures', () => {
    beforeEach(() => {
      manager = makeMockManager();
      input = new TouchInput(manager);
    });

    it('swipe right triggers queueDirection(RIGHT)', () => {
      swipe(100, 200, 150, 200);
      expect(manager.queueDirection).toHaveBeenCalledWith(RIGHT);
    });

    it('swipe left triggers queueDirection(LEFT)', () => {
      swipe(150, 200, 100, 200);
      expect(manager.queueDirection).toHaveBeenCalledWith(LEFT);
    });

    it('swipe down triggers queueDirection(DOWN)', () => {
      swipe(100, 100, 100, 150);
      expect(manager.queueDirection).toHaveBeenCalledWith(DOWN);
    });

    it('swipe up triggers queueDirection(UP)', () => {
      swipe(100, 150, 100, 100);
      expect(manager.queueDirection).toHaveBeenCalledWith(UP);
    });

    it('diagonal swipe with larger dx triggers RIGHT', () => {
      swipe(100, 100, 140, 120); // dx=40, dy=20
      expect(manager.queueDirection).toHaveBeenCalledWith(RIGHT);
    });

    it('diagonal swipe with larger dy triggers DOWN', () => {
      swipe(100, 100, 120, 140); // dx=20, dy=40
      expect(manager.queueDirection).toHaveBeenCalledWith(DOWN);
    });

    it('short swipe below threshold does not call queueDirection', () => {
      swipe(100, 100, 110, 105); // dx=10, dy=5
      expect(manager.queueDirection).not.toHaveBeenCalled();
    });

    it('after destroy(), swipe does not call queueDirection', () => {
      input.destroy();
      swipe(100, 200, 150, 200);
      expect(manager.queueDirection).not.toHaveBeenCalled();
      // Re-create a dummy input so afterEach destroy() does not throw
      input = new TouchInput(manager);
    });
  });

  describe('D-pad buttons', () => {
    beforeEach(() => {
      setupDom();
      vi.stubGlobal('matchMedia', (query: string) => ({
        matches: query.includes('max-width'),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
      manager = makeMockManager();
      input = new TouchInput(manager);
    });

    it('dpad element has no hidden attribute after construction with small viewport', () => {
      const dpad = document.getElementById('dpad');
      expect(dpad).not.toBeNull();
      expect(dpad!.hasAttribute('hidden')).toBe(false);
    });

    it('clicking #dpad-up calls queueDirection(UP)', () => {
      document.getElementById('dpad-up')!.click();
      expect(manager.queueDirection).toHaveBeenCalledWith(UP);
    });

    it('clicking #dpad-down calls queueDirection(DOWN)', () => {
      document.getElementById('dpad-down')!.click();
      expect(manager.queueDirection).toHaveBeenCalledWith(DOWN);
    });

    it('clicking #dpad-left calls queueDirection(LEFT)', () => {
      document.getElementById('dpad-left')!.click();
      expect(manager.queueDirection).toHaveBeenCalledWith(LEFT);
    });

    it('clicking #dpad-right calls queueDirection(RIGHT)', () => {
      document.getElementById('dpad-right')!.click();
      expect(manager.queueDirection).toHaveBeenCalledWith(RIGHT);
    });

    it('destroy() sets hidden attribute on #dpad', () => {
      input.destroy();
      const dpad = document.getElementById('dpad');
      expect(dpad!.hasAttribute('hidden')).toBe(true);
      // Re-create a dummy input so afterEach destroy() does not throw
      input = new TouchInput(manager);
    });

    it('destroy() removes click listeners from dpad buttons — clicking after destroy does not call queueDirection', () => {
      // Regression: D-pad button click listeners were anonymous lambdas, never removed on destroy().
      // After destroy(), clicking a button would still fire queueDirection().
      // Found by /qa on 2026-03-28
      // Report: .agent/qa-reports/qa-report-localhost-2026-03-28.md
      input.destroy();
      document.getElementById('dpad-up')!.click();
      document.getElementById('dpad-down')!.click();
      document.getElementById('dpad-left')!.click();
      document.getElementById('dpad-right')!.click();
      expect(manager.queueDirection).not.toHaveBeenCalled();
      // Re-create a dummy input so afterEach destroy() does not throw
      input = new TouchInput(manager);
    });
  });
});
