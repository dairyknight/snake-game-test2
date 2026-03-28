import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from '@/utils/EventEmitter';
import type { GameEvents } from '@/state/GameState';
import { GameState } from '@/state/GameState';
import type { GameManager } from '@/game/GameManager';
import { GameOverScreen } from '@/ui/GameOverScreen';

function makeMockManager() {
  const emitter = new EventEmitter<GameEvents>();
  return {
    getState: vi.fn().mockReturnValue(GameState.IDLE),
    restartGame: vi.fn(),
    clearHighScore: vi.fn(),
    getHighScore: vi.fn().mockReturnValue(0),
    events: emitter,
  } as unknown as GameManager;
}

describe('GameOverScreen', () => {
  let manager: ReturnType<typeof makeMockManager>;
  let screen: GameOverScreen;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="canvas-container">
        <div id="game-over-screen" hidden>
          <div id="final-score-value">0</div>
          <button id="play-again-btn">Play Again</button>
          <button id="clear-score-btn">Clear best score</button>
        </div>
      </div>
    `;
    manager = makeMockManager();
    screen = new GameOverScreen(manager as unknown as GameManager);
  });

  afterEach(() => {
    screen.destroy();
    document.body.innerHTML = '';
  });

  it('is hidden on construction', () => {
    const el = document.getElementById('game-over-screen')!;
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('shows when stateChange fires with to: GAME_OVER', () => {
    const el = document.getElementById('game-over-screen')!;
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PLAYING,
      to: GameState.GAME_OVER,
    });
    expect(el.hasAttribute('hidden')).toBe(false);
  });

  it('hides when stateChange fires from GAME_OVER to IDLE', () => {
    const el = document.getElementById('game-over-screen')!;
    // First show it
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PLAYING,
      to: GameState.GAME_OVER,
    });
    expect(el.hasAttribute('hidden')).toBe(false);
    // Then hide it
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.GAME_OVER,
      to: GameState.IDLE,
    });
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('stays hidden for state transitions not involving GAME_OVER', () => {
    const el = document.getElementById('game-over-screen')!;
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.IDLE,
      to: GameState.PLAYING,
    });
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('shows final score from gameOver event payload', () => {
    const scoreEl = document.getElementById('final-score-value')!;
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PLAYING,
      to: GameState.GAME_OVER,
    });
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('gameOver', { score: 50 });
    expect(scoreEl.textContent).toContain('50');
  });

  it('score display shows 0 before any gameOver event', () => {
    const scoreEl = document.getElementById('final-score-value')!;
    expect(scoreEl.textContent).toBe('0');
  });

  it('score persists after screen is hidden (not from getScore)', () => {
    const scoreEl = document.getElementById('final-score-value')!;
    // First game: show and emit score 80
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PLAYING,
      to: GameState.GAME_OVER,
    });
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('gameOver', { score: 80 });
    // Hide the screen
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.GAME_OVER,
      to: GameState.IDLE,
    });
    // Second game: show and emit score 120
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PLAYING,
      to: GameState.GAME_OVER,
    });
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('gameOver', { score: 120 });
    expect(scoreEl.textContent).toBe('120');
  });

  it('Play Again button calls restartGame()', () => {
    const btn = document.getElementById('play-again-btn') as HTMLButtonElement;
    btn.click();
    expect((manager.restartGame as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1);
  });

  it('Clear best score button calls clearHighScore()', () => {
    const btn = document.getElementById('clear-score-btn') as HTMLButtonElement;
    btn.click();
    expect((manager.clearHighScore as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1);
  });

  it('Play Again button receives focus when screen shows', () => {
    const playAgainBtn = document.getElementById('play-again-btn') as HTMLButtonElement;
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PLAYING,
      to: GameState.GAME_OVER,
    });
    expect(document.activeElement).toBe(playAgainBtn);
  });

  it('destroy() removes stateChange listener', () => {
    const el = document.getElementById('game-over-screen')!;
    screen.destroy();
    (manager as unknown as { events: EventEmitter<GameEvents> }).events.emit('stateChange', {
      from: GameState.PLAYING,
      to: GameState.GAME_OVER,
    });
    // Should still be hidden — no longer listening
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('destroy() removes button click listener', () => {
    screen.destroy();
    const btn = document.getElementById('play-again-btn') as HTMLButtonElement;
    btn.click();
    expect((manager.restartGame as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });
});
