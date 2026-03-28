import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KeyboardInput } from '@/input/KeyboardInput';
import { GameManager } from '@/game/GameManager';
import { GameState } from '@/state/GameState';
import { UP, DOWN, LEFT, RIGHT } from '@/game/Snake';

describe('KeyboardInput', () => {
  let manager: ReturnType<typeof makeMockManager>;
  let input: KeyboardInput;

  function makeMockManager(state: GameState = GameState.IDLE) {
    return {
      getState: vi.fn().mockReturnValue(state),
      queueDirection: vi.fn(),
      togglePause: vi.fn(),
      startGame: vi.fn(),
      restartGame: vi.fn(),
    } as unknown as GameManager;
  }

  function dispatch(key: string, repeat = false) {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, repeat }));
  }

  beforeEach(() => {
    manager = makeMockManager();
    input = new KeyboardInput(manager);
  });

  afterEach(() => {
    input.destroy();
    vi.clearAllMocks();
  });

  // Arrow key tests
  it('ArrowUp → queueDirection(UP)', () => {
    dispatch('ArrowUp');
    expect(manager.queueDirection).toHaveBeenCalledWith(UP);
  });

  it('ArrowDown → queueDirection(DOWN)', () => {
    dispatch('ArrowDown');
    expect(manager.queueDirection).toHaveBeenCalledWith(DOWN);
  });

  it('ArrowLeft → queueDirection(LEFT)', () => {
    dispatch('ArrowLeft');
    expect(manager.queueDirection).toHaveBeenCalledWith(LEFT);
  });

  it('ArrowRight → queueDirection(RIGHT)', () => {
    dispatch('ArrowRight');
    expect(manager.queueDirection).toHaveBeenCalledWith(RIGHT);
  });

  // WASD lowercase
  it('w → queueDirection(UP)', () => {
    dispatch('w');
    expect(manager.queueDirection).toHaveBeenCalledWith(UP);
  });

  it('W → queueDirection(UP)', () => {
    dispatch('W');
    expect(manager.queueDirection).toHaveBeenCalledWith(UP);
  });

  it('s → queueDirection(DOWN)', () => {
    dispatch('s');
    expect(manager.queueDirection).toHaveBeenCalledWith(DOWN);
  });

  it('S → queueDirection(DOWN)', () => {
    dispatch('S');
    expect(manager.queueDirection).toHaveBeenCalledWith(DOWN);
  });

  it('a → queueDirection(LEFT)', () => {
    dispatch('a');
    expect(manager.queueDirection).toHaveBeenCalledWith(LEFT);
  });

  it('A → queueDirection(LEFT)', () => {
    dispatch('A');
    expect(manager.queueDirection).toHaveBeenCalledWith(LEFT);
  });

  it('d → queueDirection(RIGHT)', () => {
    dispatch('d');
    expect(manager.queueDirection).toHaveBeenCalledWith(RIGHT);
  });

  it('D → queueDirection(RIGHT)', () => {
    dispatch('D');
    expect(manager.queueDirection).toHaveBeenCalledWith(RIGHT);
  });

  // Pause tests (need PLAYING state)
  it('p with state=PLAYING → togglePause() called', () => {
    input.destroy();
    manager = makeMockManager(GameState.PLAYING);
    input = new KeyboardInput(manager);
    dispatch('p');
    expect(manager.togglePause).toHaveBeenCalled();
  });

  it('P with state=PLAYING → togglePause() called', () => {
    input.destroy();
    manager = makeMockManager(GameState.PLAYING);
    input = new KeyboardInput(manager);
    dispatch('P');
    expect(manager.togglePause).toHaveBeenCalled();
  });

  it('Escape with state=PLAYING → togglePause() called', () => {
    input.destroy();
    manager = makeMockManager(GameState.PLAYING);
    input = new KeyboardInput(manager);
    dispatch('Escape');
    expect(manager.togglePause).toHaveBeenCalled();
  });

  // Start / restart tests
  it('Space with state=IDLE → startGame() called', () => {
    dispatch(' ');
    expect(manager.startGame).toHaveBeenCalled();
    expect(manager.restartGame).not.toHaveBeenCalled();
  });

  it('Enter with state=IDLE → startGame() called', () => {
    dispatch('Enter');
    expect(manager.startGame).toHaveBeenCalled();
    expect(manager.restartGame).not.toHaveBeenCalled();
  });

  it('Space with state=GAME_OVER → restartGame() called (NOT startGame)', () => {
    input.destroy();
    manager = makeMockManager(GameState.GAME_OVER);
    input = new KeyboardInput(manager);
    dispatch(' ');
    expect(manager.restartGame).toHaveBeenCalled();
    expect(manager.startGame).not.toHaveBeenCalled();
  });

  it('Space with state=PLAYING → neither startGame nor restartGame called', () => {
    input.destroy();
    manager = makeMockManager(GameState.PLAYING);
    input = new KeyboardInput(manager);
    dispatch(' ');
    expect(manager.startGame).not.toHaveBeenCalled();
    expect(manager.restartGame).not.toHaveBeenCalled();
  });

  // Repeat key test
  it('repeat=true → NO methods called at all', () => {
    dispatch('ArrowUp', true);
    expect(manager.queueDirection).not.toHaveBeenCalled();
    expect(manager.startGame).not.toHaveBeenCalled();
    expect(manager.restartGame).not.toHaveBeenCalled();
    expect(manager.togglePause).not.toHaveBeenCalled();
  });

  // destroy test
  it('destroy() then ArrowUp → queueDirection NOT called', () => {
    input.destroy();
    dispatch('ArrowUp');
    expect(manager.queueDirection).not.toHaveBeenCalled();
    // Recreate so afterEach destroy() doesn't fail
    input = new KeyboardInput(manager);
  });
});
