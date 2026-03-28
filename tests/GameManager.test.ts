import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GameManager } from '@/game/GameManager'
import { GameState } from '@/state/GameState'
import { Snake } from '@/game/Snake'
import { Food } from '@/game/Food'
import { Vector2 } from '@/utils/Vector2'

describe('GameManager', () => {
  let gm: GameManager

  beforeEach(() => {
    gm = new GameManager()
  })

  // ─── Initial state ────────────────────────────────────────────────────────

  it('starts in IDLE state', () => {
    expect(gm.getState()).toBe(GameState.IDLE)
  })

  // ─── Valid transitions ────────────────────────────────────────────────────

  it('IDLE → startGame() → PLAYING', () => {
    gm.startGame()
    expect(gm.getState()).toBe(GameState.PLAYING)
  })

  it('PLAYING → pauseGame() → PAUSED', () => {
    gm.startGame()
    gm.pauseGame()
    expect(gm.getState()).toBe(GameState.PAUSED)
  })

  it('PAUSED → resumeGame() → PLAYING', () => {
    gm.startGame()
    gm.pauseGame()
    gm.resumeGame()
    expect(gm.getState()).toBe(GameState.PLAYING)
  })

  it('PLAYING → endGame() → GAME_OVER', () => {
    gm.startGame()
    gm.endGame()
    expect(gm.getState()).toBe(GameState.GAME_OVER)
  })

  it('PAUSED → endGame() → GAME_OVER', () => {
    gm.startGame()
    gm.pauseGame()
    gm.endGame()
    expect(gm.getState()).toBe(GameState.GAME_OVER)
  })

  it('GAME_OVER → restartGame() → IDLE', () => {
    gm.startGame()
    gm.endGame()
    gm.restartGame()
    expect(gm.getState()).toBe(GameState.IDLE)
  })

  it('chained: IDLE → startGame() → PLAYING → endGame() → GAME_OVER', () => {
    expect(gm.getState()).toBe(GameState.IDLE)
    gm.startGame()
    expect(gm.getState()).toBe(GameState.PLAYING)
    gm.endGame()
    expect(gm.getState()).toBe(GameState.GAME_OVER)
  })

  // ─── Invalid transitions (silently ignored) ───────────────────────────────

  it('IDLE → pauseGame() stays IDLE', () => {
    gm.pauseGame()
    expect(gm.getState()).toBe(GameState.IDLE)
  })

  it('IDLE → endGame() stays IDLE', () => {
    gm.endGame()
    expect(gm.getState()).toBe(GameState.IDLE)
  })

  it('IDLE → restartGame() stays IDLE', () => {
    gm.restartGame()
    expect(gm.getState()).toBe(GameState.IDLE)
  })

  it('PLAYING → startGame() stays PLAYING', () => {
    gm.startGame()
    gm.startGame()
    expect(gm.getState()).toBe(GameState.PLAYING)
  })

  it('PLAYING → restartGame() stays PLAYING', () => {
    gm.startGame()
    gm.restartGame()
    expect(gm.getState()).toBe(GameState.PLAYING)
  })

  it('PAUSED → startGame() stays PAUSED', () => {
    gm.startGame()
    gm.pauseGame()
    gm.startGame()
    expect(gm.getState()).toBe(GameState.PAUSED)
  })

  it('GAME_OVER → startGame() stays GAME_OVER', () => {
    gm.startGame()
    gm.endGame()
    gm.startGame()
    expect(gm.getState()).toBe(GameState.GAME_OVER)
  })

  // ─── togglePause ──────────────────────────────────────────────────────────

  it('PLAYING → togglePause() → PAUSED', () => {
    gm.startGame()
    gm.togglePause()
    expect(gm.getState()).toBe(GameState.PAUSED)
  })

  it('PAUSED → togglePause() → PLAYING', () => {
    gm.startGame()
    gm.pauseGame()
    gm.togglePause()
    expect(gm.getState()).toBe(GameState.PLAYING)
  })

  it('IDLE → togglePause() → still IDLE (no-op)', () => {
    gm.togglePause()
    expect(gm.getState()).toBe(GameState.IDLE)
  })

  // ─── Events ───────────────────────────────────────────────────────────────

  it('stateChange emitted with correct from/to on startGame()', () => {
    const handler = vi.fn()
    gm.events.on('stateChange', handler)
    gm.startGame()
    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith({ from: GameState.IDLE, to: GameState.PLAYING })
  })

  it('stateChange emitted with correct from/to on pauseGame()', () => {
    gm.startGame()
    const handler = vi.fn()
    gm.events.on('stateChange', handler)
    gm.pauseGame()
    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith({ from: GameState.PLAYING, to: GameState.PAUSED })
  })

  it('stateChange emitted with correct from/to on resumeGame()', () => {
    gm.startGame()
    gm.pauseGame()
    const handler = vi.fn()
    gm.events.on('stateChange', handler)
    gm.resumeGame()
    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith({ from: GameState.PAUSED, to: GameState.PLAYING })
  })

  it('stateChange emitted with correct from/to on endGame() from PLAYING', () => {
    gm.startGame()
    const handler = vi.fn()
    gm.events.on('stateChange', handler)
    gm.endGame()
    expect(handler).toHaveBeenCalledWith({ from: GameState.PLAYING, to: GameState.GAME_OVER })
  })

  it('stateChange emitted with correct from/to on endGame() from PAUSED', () => {
    gm.startGame()
    gm.pauseGame()
    const handler = vi.fn()
    gm.events.on('stateChange', handler)
    gm.endGame()
    expect(handler).toHaveBeenCalledWith({ from: GameState.PAUSED, to: GameState.GAME_OVER })
  })

  it('stateChange emitted with correct from/to on restartGame()', () => {
    gm.startGame()
    gm.endGame()
    const handler = vi.fn()
    gm.events.on('stateChange', handler)
    gm.restartGame()
    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith({ from: GameState.GAME_OVER, to: GameState.IDLE })
  })

  it('gameOver event emitted with score:0 when endGame() called', () => {
    gm.startGame()
    const handler = vi.fn()
    gm.events.on('gameOver', handler)
    gm.endGame()
    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith({ score: 0 })
  })

  it('stateChange NOT emitted on invalid transition (IDLE → pauseGame)', () => {
    const handler = vi.fn()
    gm.events.on('stateChange', handler)
    gm.pauseGame()
    expect(handler).not.toHaveBeenCalled()
  })

  it('stateChange NOT emitted on invalid transition (IDLE → endGame)', () => {
    const handler = vi.fn()
    gm.events.on('stateChange', handler)
    gm.endGame()
    expect(handler).not.toHaveBeenCalled()
  })

  it('stateChange NOT emitted on invalid transition (PLAYING → startGame)', () => {
    gm.startGame()
    const handler = vi.fn()
    gm.events.on('stateChange', handler)
    gm.startGame()
    expect(handler).not.toHaveBeenCalled()
  })

  // ─── Stubs ────────────────────────────────────────────────────────────────

  it('getScore() returns 0', () => {
    expect(gm.getScore()).toBe(0)
    gm.startGame()
    expect(gm.getScore()).toBe(0)
    gm.endGame()
    expect(gm.getScore()).toBe(0)
  })

  it('update() does not throw', () => {
    expect(() => gm.update()).not.toThrow()
    expect(() => gm.update(16.67)).not.toThrow()
    gm.startGame()
    expect(() => gm.update(16.67)).not.toThrow()
  })

  // ─── Phase 4: update() state gating ──────────────────────────────────────

  describe('update() state gating', () => {
    it('update() when state=IDLE does not change state', () => {
      expect(gm.getState()).toBe(GameState.IDLE)
      gm.update()
      expect(gm.getState()).toBe(GameState.IDLE)
    })

    it('update() when state=PAUSED does not change state and emits no events', () => {
      gm.startGame()
      gm.pauseGame()
      const handler = vi.fn()
      gm.events.on('stateChange', handler)
      gm.events.on('gameOver', handler)
      gm.events.on('foodEaten', handler)
      gm.update()
      expect(gm.getState()).toBe(GameState.PAUSED)
      expect(handler).not.toHaveBeenCalled()
    })
  })

  // ─── Phase 4: update() wall collision ────────────────────────────────────

  describe('update() wall collision triggers GAME_OVER', () => {
    it('moving RIGHT reaches x=20 after 10 updates and triggers GAME_OVER', () => {
      gm.startGame()
      // Snake head starts at (10,9) moving RIGHT
      // Updates 1-9: head moves to x=11..19, still in bounds
      for (let i = 0; i < 9; i++) {
        gm.update()
        expect(gm.getState()).toBe(GameState.PLAYING)
      }
      // Update 10: head moves to x=20, out of bounds → GAME_OVER
      const gameOverHandler = vi.fn()
      gm.events.on('gameOver', gameOverHandler)
      gm.update()
      expect(gm.getState()).toBe(GameState.GAME_OVER)
      expect(gameOverHandler).toHaveBeenCalledOnce()
      expect(gameOverHandler).toHaveBeenCalledWith({ score: 0 })
    })
  })

  // ─── Phase 4: update() food eaten ────────────────────────────────────────

  describe('update() food eaten', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('foodEaten event fires and snake grows when snake reaches food position', () => {
      // Control Math.random so food spawns directly ahead of the snake.
      // Snake head starts at (10,9) moving RIGHT.
      // We want food at (11,9) — the next cell the snake will move into.
      // Food._buildAvailable() iterates y=0..19, x=0..19.
      // (11,9) is at index: 9*20 + 11 = 191 (minus occupied snake cells).
      // Simpler: use a rng stub that always picks index 0 from available list,
      // then pre-populate occupied to leave only the target cell free — but
      // that's complex. Instead, spy on Math.random to return a specific fraction.
      //
      // available.length ≈ 397 (400 cells minus 3 snake segments).
      // Cell (11,9) is at flat index 9*20+11=191. After removing snake segments
      // (10,9),(9,9),(8,9) which are at indices 190,189,188 in the full grid,
      // available[0..187] covers (0,0)..(7,9) and available[188] = (11,9).
      // That's tricky to calculate exactly, so we'll use a simpler approach:
      // spy on Math.random to return 0 → picks available[0] = (0,0), then
      // steer the snake to that position.
      //
      // Easiest deterministic approach: stub Math.random to 0 (food at first
      // available cell = (0,0)) and steer snake UP then LEFT repeatedly.
      // Too many moves. Instead: just run many updates and detect the foodEaten event.

      // Use a controlled rng: place food directly ahead of snake at (11,9).
      // available list (sorted y then x, excluding snake at (8,9),(9,9),(10,9)):
      // idx 0=(0,0)..idx 187=(7,9), idx 188=(11,9)...
      // fraction = 188 / 397 (approx) — but exact count varies.
      // Simpler: spy and return a value that maps to (11,9).
      // Let's compute: total cells = 400; snake occupies 3 cells.
      // available has 397 entries. (11,9) is the 189th entry (0-indexed: 188)
      // because before it in row-major order: rows 0-8 = 9*20=180 cells, all free;
      // row 9, x=0..7 = 8 cells free; x=8,9,10 are snake (skip); x=11 → idx 188.
      // fraction for Math.floor(rng * 397) = 188 → rng must be in [188/397, 189/397).
      // Use 188/397 exactly.
      vi.spyOn(Math, 'random').mockReturnValue(188 / 397)

      const gmControlled = new GameManager()
      // Food should now be at (11,9) — directly ahead of snake head (10,9) moving RIGHT.
      expect(gmControlled.getFood().position.equals(new Vector2(11, 9))).toBe(true)

      gmControlled.startGame()
      const initialLength = gmControlled.getSnake().segments.length

      const foodEatenHandler = vi.fn()
      gmControlled.events.on('foodEaten', foodEatenHandler)

      // One update: snake head moves from (10,9) to (11,9) — eats food
      gmControlled.update()

      expect(foodEatenHandler).toHaveBeenCalledOnce()
      // After grow(), segments.length increases by 1 on the NEXT move.
      // Actually grow() sets a flag, and on the next move() call the tail is kept.
      // So length increases on next move. Let's do one more update to confirm growth.
      gmControlled.update()
      expect(gmControlled.getSnake().segments.length).toBe(initialLength + 1)
    })
  })

  // ─── Phase 4: queueDirection() ───────────────────────────────────────────

  describe('queueDirection()', () => {
    it('queuing UP while moving RIGHT: after update() snake head moves up', () => {
      gm.startGame()
      const headBefore = gm.getSnake().head
      // Queue UP (perpendicular to RIGHT, so it's valid)
      gm.queueDirection({ x: 0, y: -1 } as any)
      gm.update()
      const headAfter = gm.getSnake().head
      // Head should have moved UP: same x, y decreased by 1
      expect(headAfter.x).toBe(headBefore.x)
      expect(headAfter.y).toBe(headBefore.y - 1)
    })

    it('after update(), pending direction is cleared — next update uses currentDirection (UP)', () => {
      gm.startGame()
      gm.queueDirection({ x: 0, y: -1 } as any) // UP
      gm.update() // moves UP, clears pending
      const headAfterFirst = gm.getSnake().head
      gm.update() // no queued direction, continues moving UP
      const headAfterSecond = gm.getSnake().head
      expect(headAfterSecond.x).toBe(headAfterFirst.x)
      expect(headAfterSecond.y).toBe(headAfterFirst.y - 1)
    })

    it('queuing LEFT while moving RIGHT (180° reversal) is blocked — snake continues RIGHT', () => {
      gm.startGame()
      const headBefore = gm.getSnake().head
      gm.queueDirection({ x: -1, y: 0 } as any) // LEFT — opposite of RIGHT
      gm.update()
      const headAfter = gm.getSnake().head
      // Snake should still have moved RIGHT
      expect(headAfter.x).toBe(headBefore.x + 1)
      expect(headAfter.y).toBe(headBefore.y)
    })
  })

  // ─── Phase 4: restartGame() entity reset ─────────────────────────────────

  describe('restartGame() entity reset', () => {
    it('resets snake and food after GAME_OVER', () => {
      gm.startGame()
      // Move snake toward right wall until GAME_OVER (10 moves from x=10)
      for (let i = 0; i < 10; i++) {
        gm.update()
      }
      expect(gm.getState()).toBe(GameState.GAME_OVER)

      gm.restartGame()

      expect(gm.getState()).toBe(GameState.IDLE)
      expect(gm.getSnake().segments.length).toBe(3)
      expect(gm.getSnake().head.equals(new Vector2(10, 9))).toBe(true)
      expect(gm.getFood().position).not.toBeNull()
      expect(gm.getFood().position).not.toBeUndefined()
    })

    it('after restartGame(), startGame() then update() works without throwing', () => {
      gm.startGame()
      for (let i = 0; i < 10; i++) {
        gm.update()
      }
      gm.restartGame()
      gm.startGame()
      expect(() => gm.update()).not.toThrow()
    })
  })

  // ─── Phase 4: getSnake() / getFood() ─────────────────────────────────────

  describe('getSnake() / getFood()', () => {
    it('getSnake() returns an instance of Snake', () => {
      expect(gm.getSnake()).toBeInstanceOf(Snake)
    })

    it('getFood() returns an instance of Food', () => {
      expect(gm.getFood()).toBeInstanceOf(Food)
    })

    it('getSnake() returns the same instance mutated by update()', () => {
      gm.startGame()
      const snakeRef = gm.getSnake()
      const headBefore = snakeRef.head
      gm.update()
      // Same reference — head has moved
      expect(gm.getSnake()).toBe(snakeRef)
      expect(snakeRef.head.equals(headBefore)).toBe(false)
    })

    it('getFood() returns the same instance updated by update()', () => {
      gm.startGame()
      const foodRef = gm.getFood()
      expect(gm.getFood()).toBe(foodRef)
    })
  })
})
