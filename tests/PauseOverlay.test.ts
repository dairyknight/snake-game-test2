import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from '@/utils/EventEmitter';
import type { GameEvents } from '@/state/GameState';
import { GameState } from '@/state/GameState';
import type { GameManager } from '@/game/GameManager';
import { PauseOverlay } from '@/ui/PauseOverlay';

function makeMockManager() {
  const emitter = new EventEmitter<GameEvents>();
  return {
    resumeGame: vi.fn(),
    events: emitter,
  } as unknown as GameManager;
}

describe('PauseOverlay', () => {
  let manager: ReturnType<typeof makeMockManager>;
  let overlay: PauseOverlay;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="canvas-container">
        <div id="pause-overlay" hidden>
          <button id="resume-btn">Resume</button>
        </div>
      </div>
    `;
    manager = makeMockManager();
    overlay = new PauseOverlay(manager as unknown as GameManager);
  });

  afterEach(() => {
    overlay.destroy();
    document.body.innerHTML = '';
  });

  it('is hidden on construction', () => {
    const el = document.getElementById('pause-overlay')!;
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('shows when stateChange fires with to: PAUSED', () => {
    const el = document.getElementById('pause-overlay')!;
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PLAYING,
      to: GameState.PAUSED,
    });
    expect(el.hasAttribute('hidden')).toBe(false);
  });

  it('hides when stateChange fires with to: PLAYING', () => {
    const el = document.getElementById('pause-overlay')!;
    // First show
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PLAYING,
      to: GameState.PAUSED,
    });
    // Then hide
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PAUSED,
      to: GameState.PLAYING,
    });
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('hides when stateChange fires with to: GAME_OVER (endGame while paused)', () => {
    const el = document.getElementById('pause-overlay')!;
    // First show
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PLAYING,
      to: GameState.PAUSED,
    });
    // Then transition to GAME_OVER while paused
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PAUSED,
      to: GameState.GAME_OVER,
    });
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('hides when stateChange fires with to: IDLE', () => {
    const el = document.getElementById('pause-overlay')!;
    // First show
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PLAYING,
      to: GameState.PAUSED,
    });
    // Then transition to IDLE
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.GAME_OVER,
      to: GameState.IDLE,
    });
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('resume button click calls resumeGame()', () => {
    document.getElementById('resume-btn')!.click();
    expect((manager.resumeGame as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1);
  });

  it('resume button receives focus when overlay becomes visible', () => {
    const btn = document.getElementById('resume-btn')!;
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PLAYING,
      to: GameState.PAUSED,
    });
    expect(document.activeElement).toBe(btn);
  });

  it('restores focus to previous element when overlay hides', () => {
    const prevBtn = document.createElement('button');
    document.body.appendChild(prevBtn);
    prevBtn.focus();

    // Show overlay (stores prevBtn as prevFocus, focuses resume btn)
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PLAYING,
      to: GameState.PAUSED,
    });

    // Hide overlay (restores prevBtn focus)
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PAUSED,
      to: GameState.PLAYING,
    });

    expect(document.activeElement).toBe(prevBtn);
  });

  it('destroy() does not throw', () => {
    expect(() => overlay.destroy()).not.toThrow();
  });

  it('after destroy(), stateChange to PAUSED does not show overlay', () => {
    const el = document.getElementById('pause-overlay')!;
    overlay.destroy();
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PLAYING,
      to: GameState.PAUSED,
    });
    expect(el.hasAttribute('hidden')).toBe(true);
  });
});
