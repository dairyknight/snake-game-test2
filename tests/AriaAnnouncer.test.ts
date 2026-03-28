import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AriaAnnouncer } from '@/ui/AriaAnnouncer';
import type { GameManager } from '@/game/GameManager';
import { GameState } from '@/state/GameState';
import { EventEmitter } from '@/utils/EventEmitter';
import type { GameEvents } from '@/state/GameState';

function makeMockManager() {
  const events = new EventEmitter<GameEvents>();
  return {
    events,
    getScore: vi.fn().mockReturnValue(0),
  } as unknown as GameManager;
}

describe('AriaAnnouncer', () => {
  let manager: ReturnType<typeof makeMockManager>;
  let announcer: AriaAnnouncer;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div aria-live="polite" id="score-announcer" class="sr-only"></div>
      <div aria-live="assertive" id="state-announcer" class="sr-only"></div>
    `;
    manager = makeMockManager();
    announcer = new AriaAnnouncer(manager as unknown as GameManager);
  });

  afterEach(() => {
    announcer.destroy();
    document.body.innerHTML = '';
  });

  it('scoreUpdate event updates #score-announcer with current score', () => {
    manager.events.emit('scoreUpdate', { score: 50, highScore: 100 });
    expect(document.getElementById('score-announcer')!.textContent).toBe('Score: 50');
  });

  it('scoreUpdate uses score from payload, not highScore', () => {
    manager.events.emit('scoreUpdate', { score: 70, highScore: 200 });
    expect(document.getElementById('score-announcer')!.textContent).toBe('Score: 70');
  });

  it('stateChange to PLAYING updates #state-announcer', () => {
    manager.events.emit('stateChange', { from: GameState.IDLE, to: GameState.PLAYING });
    expect(document.getElementById('state-announcer')!.textContent).toBe('Game started');
  });

  it('stateChange to PAUSED updates #state-announcer', () => {
    manager.events.emit('stateChange', { from: GameState.PLAYING, to: GameState.PAUSED });
    expect(document.getElementById('state-announcer')!.textContent).toBe('Game paused');
  });

  it('stateChange to GAME_OVER updates #state-announcer with final score', () => {
    (manager.getScore as ReturnType<typeof vi.fn>).mockReturnValue(120);
    manager.events.emit('stateChange', { from: GameState.PLAYING, to: GameState.GAME_OVER });
    expect(document.getElementById('state-announcer')!.textContent).toBe('Game over. Final score: 120');
  });

  it('stateChange to GAME_OVER at score 0 announces correctly', () => {
    (manager.getScore as ReturnType<typeof vi.fn>).mockReturnValue(0);
    manager.events.emit('stateChange', { from: GameState.PLAYING, to: GameState.GAME_OVER });
    expect(document.getElementById('state-announcer')!.textContent).toBe('Game over. Final score: 0');
  });

  it('stateChange to IDLE updates #state-announcer', () => {
    manager.events.emit('stateChange', { from: GameState.GAME_OVER, to: GameState.IDLE });
    expect(document.getElementById('state-announcer')!.textContent).toBe('Ready to play');
  });

  it('destroy() prevents subsequent scoreUpdate from updating DOM', () => {
    announcer.destroy();
    manager.events.emit('scoreUpdate', { score: 99, highScore: 99 });
    expect(document.getElementById('score-announcer')!.textContent).toBe('');
  });

  it('destroy() prevents subsequent stateChange from updating DOM', () => {
    announcer.destroy();
    manager.events.emit('stateChange', { from: GameState.IDLE, to: GameState.PLAYING });
    expect(document.getElementById('state-announcer')!.textContent).toBe('');
  });
});
