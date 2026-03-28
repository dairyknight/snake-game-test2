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

  // ─── Phase 5: getScore() ──────────────────────────────────────────────────

  describe('getScore()', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('getScore() returns 0 initially (before any food is eaten)', () => {
      expect(gm.getScore()).toBe(0)
      gm.startGame()
      expect(gm.getScore()).toBe(0)
    })

    it('getScore() returns 10 after one food-eaten update', () => {
      // Place food at (11,9) — directly ahead of snake head (10,9) moving RIGHT.
      // available list has 397 entries; (11,9) is at index 188 (9*20+11 minus 3 snake cells at 188,189,190).
      vi.spyOn(Math, 'random').mockReturnValue(188 / 397)
      const manager = new GameManager()
      manager.startGame()
      manager.update() // snake moves into food at (11,9)
      expect(manager.getScore()).toBe(10)
    })
  })

  // ─── Phase 5: scoreUpdate event ───────────────────────────────────────────

  describe('scoreUpdate event', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('scoreUpdate event fires when food is eaten, with { score: 10, highScore: 10 }', () => {
      vi.spyOn(Math, 'random').mockReturnValue(188 / 397)
      const manager = new GameManager()
      manager.startGame()

      const handler = vi.fn()
      manager.events.on('scoreUpdate', handler)

      manager.update() // eats food at (11,9)

      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith({ score: 10, highScore: 10 })
    })

    it('scoreUpdate event fires with correct accumulated score on second food eaten', () => {
      // First call: food at (11,9) index 188/397
      // After eating, snake grows and food respawns. Second mockReturnValue picks next food.
      // We'll use mockReturnValueOnce for first spawn and a second value for the respawn.
      // After first eat: snake is length 4 at (11,9),(10,9),(9,9),(8,9) growing.
      // Actually grow() sets flag, so after update() where food is eaten the snake is still 3 segments
      // until the next move. Respawn happens after grow(), with segments = 3 + 1 pending.
      // For simplicity: after first food eaten, spy on Math.random for new food position.
      // Snake after first eat (head at 11,9): segments = [(11,9),(10,9),(9,9)], grow pending.
      // Next update: snake moves right to (12,9), tail stays (grow pending consumed) → segments = [(12,9),(11,9),(10,9),(9,9)]
      // We want food at (13,9) for second eat.
      // After first respawn: 4 snake cells occupied → available = 396 cells.
      // Row-major to (13,9): rows 0-8 = 180 cells, row 9: x=0..7=8 free, x=8,9,10,11=snake (skip), x=12=idx 188, x=13=idx 189.
      // Wait — after first eat, snake head is at (11,9) and segments are (11,9),(10,9),(9,9) with grow pending.
      // Respawn sees these 3 segments: occupying indices 190,189,188 → same math, available[188]=(11,9) is now occupied.
      // Let's instead set food to (13,9) for the second spawn.
      // After first eat, segments passed to respawn = [(11,9),(10,9),(9,9)] → 3 cells, 397 available.
      // (13,9) in row-major: rows 0-8=180, row 9: x=0..7=8, skip x=8(idx188),x=9(idx189),x=10(idx190),x=11(idx191), x=12(idx192), x=13=idx 193. Wait:
      // Actually occupied cells for respawn after first eat: snake.segments passed = the current segments AFTER grow flag set.
      // In Food.respawn(Array.from(this._snake.segments)), snake has grown flag but segments still 3 until next move.
      // So 3 occupied: (11,9),(10,9),(9,9) at row-major indices 9*20+11=191, 9*20+10=190, 9*20+9=189.
      // row 9 available: x=0..7 (8 cells = indices 0+180..187), x=8(189-skip),x=9(190-skip),x=10(191-skip),x=11(192-skip→occ),
      // Correction: let me count carefully.
      // Full row-major index for (x,y) = y*20 + x.
      // (9,9)=189, (10,9)=190, (11,9)=191 are occupied (3 snake segments after first eat).
      // available[] skips those 3:
      //   indices 0..188 map to (0,0)..(8,9) [row-major 0..188], skip 189=(9,9), 190=(10,9), 191=(11,9)
      //   then index 189 in available = row-major 192 = (12,9)
      //   index 190 = (13,9)
      // So to place food at (13,9) for second eat: Math.floor(rng * 397) = 190 → rng = 190/397.
      // Second update after first eat: snake moves right to (12,9) with grow, segments become 4: (12,9),(11,9),(10,9),(9,9).
      // Food is at (13,9). Third update: snake moves right to (13,9) — eats second food → score=20.
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(188 / 397)  // initial food spawn at (11,9)
        .mockReturnValueOnce(190 / 397)  // food respawn at (13,9) after first eat
        .mockReturnValue(0)              // any further respawns (food at (0,0))

      const manager = new GameManager()
      manager.startGame()

      const handler = vi.fn()
      manager.events.on('scoreUpdate', handler)

      manager.update() // eats food at (11,9) → score=10
      manager.update() // snake grows, moves to (12,9), food still at (13,9)
      manager.update() // eats food at (13,9) → score=20

      expect(handler).toHaveBeenCalledTimes(2)
      expect(handler).toHaveBeenNthCalledWith(2, { score: 20, highScore: 20 })
    })
  })

  // ─── Phase 5: gameOver emits real score ───────────────────────────────────

  describe('gameOver emits real score', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('after eating 2 foods then hitting a wall, gameOver fires with { score: 20 }', () => {
      // Place food at (11,9) for first eat, then (13,9) for second eat (same as above).
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(188 / 397)
        .mockReturnValueOnce(190 / 397)
        .mockReturnValue(0)

      const manager = new GameManager()
      manager.startGame()

      manager.update() // eats food at (11,9) → score=10
      manager.update() // snake grows, moves to (12,9)
      manager.update() // eats food at (13,9) → score=20

      const gameOverHandler = vi.fn()
      manager.events.on('gameOver', gameOverHandler)

      // Continue moving right until wall collision (head will reach x=20)
      // After 3 updates: head at (13,9), snake length 4+grow pending
      // Snake head at (13,9) moving right. Need to reach x=20 (out of bounds).
      // That's 7 more moves: x=14,15,16,17,18,19 (still in bounds), x=20 (wall).
      for (let i = 0; i < 6; i++) {
        manager.update()
        expect(manager.getState()).toBe(GameState.PLAYING)
      }
      manager.update() // hits x=20 → GAME_OVER

      expect(gameOverHandler).toHaveBeenCalledOnce()
      expect(gameOverHandler).toHaveBeenCalledWith({ score: 20 })
    })
  })

  // ─── Phase 5: score resets on restartGame() ───────────────────────────────

  describe('score resets on restartGame()', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('after eating food, triggering GAME_OVER, then restartGame(): getScore() returns 0', () => {
      vi.spyOn(Math, 'random').mockReturnValue(188 / 397)
      const manager = new GameManager()
      manager.startGame()
      manager.update() // eats food at (11,9) → score=10
      expect(manager.getScore()).toBe(10)

      manager.endGame()
      expect(manager.getState()).toBe(GameState.GAME_OVER)

      manager.restartGame()
      expect(manager.getScore()).toBe(0)
    })
  })

  // ─── Phase 5: score does NOT increment in non-PLAYING state ──────────────

  describe('score does NOT increment in non-PLAYING state', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('update() when PAUSED does not increase score', () => {
      vi.spyOn(Math, 'random').mockReturnValue(188 / 397)
      const manager = new GameManager()
      manager.startGame()
      manager.pauseGame()

      const handler = vi.fn()
      manager.events.on('scoreUpdate', handler)
      manager.events.on('foodEaten', handler)

      manager.update() // no-op when PAUSED

      expect(manager.getScore()).toBe(0)
      expect(handler).not.toHaveBeenCalled()
    })
  })

  // ─── Phase 5: getTickInterval() ───────────────────────────────────────────

  describe('getTickInterval()', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('getTickInterval() returns 150 initially (score=0)', () => {
      expect(gm.getTickInterval()).toBe(150)
      gm.startGame()
      expect(gm.getTickInterval()).toBe(150)
    })

    it('getTickInterval() returns 130 after eating enough food to reach score=50 (5 foods)', () => {
      // Place food repeatedly ahead of the snake.
      // Each eat moves the snake right by 1. We need 5 eats.
      // After each eat, snake grows and moves right. We spy with a sequence:
      // Eat 1: food at (11,9). After eat, head=(11,9), segments=3, grow pending.
      //   Respawn sees segments=(11,9),(10,9),(9,9): occupied indices 191,190,189.
      //   (13,9) is at available index 190 → rng=190/397
      // Eat 2: food at (13,9). After eat, head=(13,9), segments=4 (grew from eat1), grow pending.
      //   Respawn sees segments=(13,9),(12,9),(11,9),(10,9): occupied 193,192,191,190.
      //   Available row 9: x=0..7 (idx 0..187), skip 189=(9,9)? Wait, 9*20+9=189 not occupied here.
      //   Let me recalculate for eat2 respawn:
      //   After eat1 update: snake moved to (11,9), grow pending, segments=[(11,9),(10,9),(9,9)].
      //   After eat2 update (snake moved right again = eat2): snake moved to (12,9) (grow consumed → 4 segs), then moves to (13,9)...
      //   Actually this gets complex. Let's use a simpler approach:
      //   mock Math.random to always return 0 initially (food at (0,0)) and steer the snake
      //   upward then to eat food.
      //
      //   Simplest: use the Food's rng to deterministically place food RIGHT AHEAD of the snake
      //   each time. After each eat+grow, the snake head advances right.
      //
      //   Better approach: mock Math.floor indirectly by picking rng=0 (food always at first available cell).
      //   Food at (0,0): snake needs to navigate there. Too many moves.
      //
      //   Most pragmatic: just spy on Math.random with a sequence of values for 5 consecutive eats.
      //   Let's trace carefully:
      //
      //   INITIAL: snake=(10,9),(9,9),(8,9), food spawned with rng[0].
      //   rng[0]=188/397 → food=(11,9). ✓
      //
      //   UPDATE 1 (eat food at 11,9): snake.move(right)→head=(11,9). eat. grow(). respawn with segments=[(11,9),(10,9),(9,9)] (3 segs, grow flag set but segments not yet 4).
      //   Respawn occupied: (11,9)=191,(10,9)=190,(9,9)=189. available 397 cells.
      //   Row 9 available: x=0..7 (indices 180..187), skip 189,190,191, x=12→idx 188, x=13→189...
      //   Wait: available is built excluding occupied. Row 9: x=0(180),x=1(181)...x=7(187),x=8(188-occ? no, (8,9)=188...
      //   Hmm, 9*20+8=188. Is (8,9) occupied? After UPDATE 1: snake segments = [(11,9),(10,9),(9,9)]. (8,9) is NOT occupied anymore (it was the tail that got popped in the move since grow wasn't triggered yet at that point). Wait—grow() sets a flag. The tail is popped in move() UNLESS _growPending is set. But grow() is called AFTER move() in update(). So during UPDATE 1: move() pops tail (8,9), then we detect food and call grow() — which sets the flag for the NEXT move. So after UPDATE 1, segments = [(11,9),(10,9),(9,9)], grow pending.
      //   So (8,9) IS free. Occupied = {(11,9)=191, (10,9)=190, (9,9)=189}.
      //   Row 9 available in order: x=0(180),x=1(181),...,x=7(187),x=8(188), skip x=9(189),x=10(190),x=11(191), x=12(192),x=13(193),...,x=19(199).
      //   So available[188] = (12,9) [row-major 192, offset 0..188 then skip 189,190,191 → 188th free cell is (12,9)].
      //   Wait: indices 0..188 in available: 0=(0,0),1=(1,0),...,179=(19,8),180=(0,9),181=(1,9),...,187=(7,9),188=(8,9). That's index 188 = (8,9). Then 189 would be (12,9) since we skip (9,9),(10,9),(11,9).
      //   So to get food at (13,9): Math.floor(rng*397)=190 → rng=190/397.
      //   available[189]=(12,9), available[190]=(13,9). Yes.
      //
      //   UPDATE 2: snake.move(right)→head=(12,9), grow consumed → 4 segs: [(12,9),(11,9),(10,9),(9,9)]. No food.
      //   UPDATE 3: snake.move(right)→head=(13,9), 4 segs: [(13,9),(12,9),(11,9),(10,9)]. Eat food at (13,9)! score=20.
      //   grow(). respawn with segments=[(13,9),(12,9),(11,9),(10,9)] (4 segs).
      //   Occupied: (13,9)=193,(12,9)=192,(11,9)=191,(10,9)=190. Row 9 available: x=0..7(180..187),x=8(188),x=9(189), skip x=10(190),x=11(191),x=12(192),x=13(193), x=14(194),x=15(195),...
      //   available[190]=(9,9)? No wait: (9,9)=189 is NOT occupied. So available[189]=(9,9), available[190]=(14,9).
      //   To place food at (15,9): available[191]=(15,9) → rng=191/396.
      //   BUT now available.length = 400-4 = 396. So Math.floor(rng*396)=191 → rng=191/396.
      //
      //   This is getting very complex. Let's use a simpler strategy:
      //   Use mockReturnValue(0) to always place food at available[0]=(0,0),
      //   then navigate the snake to (0,0) by queueing UP then LEFT repeatedly.
      //   That's too many moves for 5 eats.
      //
      //   SIMPLEST APPROACH: Don't test via update() simulation. Instead, call scoreManager directly.
      //   But GameManager._scoreManager is private.
      //
      //   Alternative: expose getTickInterval() and test it against score thresholds by eating food.
      //   We'll use the sequence of rng values computed above for 5 eats:
      //   Eat 1: rng[0]=188/397 → food=(11,9). After eat1: score=10.
      //   Eat 2: rng[1]=190/397 → food=(13,9). snake moves right: update2 (no eat), update3 (eat). score=20.
      //   Eat 3: rng[2]=191/396 → food=(15,9). snake moves right: update4 (no eat), update5 (eat). score=30.
      //   Eat 4: After eat3, snake=5 segs at (15,9),(14,9),(13,9),(12,9),(11,9). Occupied: 195,194,193,192,191.
      //     Row9 available: x=0..7(0-indexed in row9: 8 cells),x=8(188),x=9(189),x=10(190), skip x=11..15, x=16(196),x=17(197),...
      //     available.length=395. x=16(196) is at: 180+8+3+... = 180+8(x=0..7)+3(x=8,9,10)-5(skip x=11..15)...
      //     Actually: available idx = 180(x=0)+...+187(x=7)+188(x=8)+189(x=9)+190(x=10), then skip 191,192,193,194,195, then 191(x=16). So available[191]=(16,9) for 395-cell pool? No wait...
      //
      //   This manual calculation is error-prone. Let me use a different approach entirely:
      //   Mock Math.random to return 0 throughout, so food always spawns at available[0].
      //   After each eat and respawn, the snake is longer but food[0] is always the first free cell.
      //   Row-major first free cell: starting from (0,0), it's always (0,0) since snake is in row 9-ish.
      //   Then navigate snake to (0,0). From (10,9): queue UP 9 times, then LEFT 10 times = 19 updates.
      //   Then food respawns at (0,0) again... but snake is now at (0,0) with growing body.
      //   After eating at (0,0), respawn: snake head at (0,0), which is occupied, so available[0]=(1,0).
      //   This gets complicated too.
      //
      //   FINAL APPROACH: Use mockReturnValue(0) for ALL spawns. Navigate to (0,0) first,
      //   eat 5 times there (food will keep spawning near (0,0)). Too many queueDirection calls.
      //
      //   Most reliable approach for this specific test: eat 5 foods using the known sequence.
      //   Let me just pick rng values that keep placing food one step ahead each time.
      //
      //   I'll compute the rng values for 5 consecutive right-moving eats more carefully.

      // Food sequence for 5 eats moving right from initial position (10,9):
      // Eat 1: food at (11,9). rng → Math.floor(rng*397)=188. rng=188/397.
      //   After eat: snake segments=[(11,9),(10,9),(9,9)], grow pending. Score=10.
      //   Respawn: occupied={191,190,189}, avail=397.
      //   available[188] = (8,9) [rm idx 188], available[189]=(12,9) [rm 192], available[190]=(13,9).
      //   We want food at (13,9): rng=190/397.

      // Eat 2: food at (13,9).
      //   Update 2: move right→(12,9), grow consumed, 4 segs: [(12,9),(11,9),(10,9),(9,9)]. No eat.
      //   Update 3: move right→(13,9), 4 segs eat food. Score=20. grow().
      //   Respawn: segs=[(13,9),(12,9),(11,9),(10,9)], 4 occupied: {193,192,191,190}. avail=396.
      //   Row9: x=0..7(180..187),x=8(188),x=9(189), skip x=10..13 (190..193), x=14(194→avail idx 190), x=15(195→191).
      //   We want food at (15,9): rng=191/396.

      // Eat 3: food at (15,9).
      //   Update 4: move right→(14,9), grow consumed, 5 segs: [(14,9),(13,9),(12,9),(11,9),(10,9)]. No eat.
      //   Update 5: move right→(15,9), 5 segs eat. Score=30. grow().
      //   Respawn: segs=[(15,9),(14,9),(13,9),(12,9),(11,9)], 5 occupied: {195,194,193,192,191}. avail=395.
      //   Row9: x=0..7(8 cells, idx 180..187), x=8(188),x=9(189),x=10(190), skip x=11..15(191..195), x=16(196→avail idx 191), x=17→192.
      //   We want food at (17,9): rng=192/395.

      // Eat 4: food at (17,9).
      //   Update 6: move right→(16,9), grow consumed, 6 segs: [(16,9),(15,9),(14,9),(13,9),(12,9),(11,9)]. No eat.
      //   Update 7: move right→(17,9), 6 segs eat. Score=40. grow().
      //   Respawn: segs=[(17,9),(16,9),(15,9),(14,9),(13,9),(12,9)], 6 occupied: {197,196,195,194,193,192}. avail=394.
      //   Row9: x=0..7(idx 180..187), x=8(188),x=9(189),x=10(190),x=11(191), skip x=12..17(192..197), x=18(198→avail idx 192), x=19→193.
      //   We want food at (19,9): rng=193/394.

      // Eat 5: food at (19,9).
      //   Update 8: move right→(18,9), grow consumed, 7 segs. No eat.
      //   Update 9: move right→(19,9), 7 segs eat. Score=50. grow().

      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(188 / 397)  // initial food → (11,9)
        .mockReturnValueOnce(190 / 397)  // respawn after eat1 → (13,9)
        .mockReturnValueOnce(191 / 396)  // respawn after eat2 → (15,9)
        .mockReturnValueOnce(192 / 395)  // respawn after eat3 → (17,9)
        .mockReturnValueOnce(193 / 394)  // respawn after eat4 → (19,9)
        .mockReturnValue(0)              // respawn after eat5 → (0,0) (not important)

      const manager = new GameManager()
      expect(manager.getTickInterval()).toBe(150) // baseline before any food

      manager.startGame()

      // Eat 1: update 1
      manager.update() // head→(11,9), eats, score=10
      // Eat 2: updates 2-3
      manager.update() // head→(12,9), no eat
      manager.update() // head→(13,9), eats, score=20
      // Eat 3: updates 4-5
      manager.update() // head→(14,9), no eat
      manager.update() // head→(15,9), eats, score=30
      // Eat 4: updates 6-7
      manager.update() // head→(16,9), no eat
      manager.update() // head→(17,9), eats, score=40
      // Eat 5: updates 8-9
      manager.update() // head→(18,9), no eat
      manager.update() // head→(19,9), eats, score=50

      expect(manager.getScore()).toBe(50)
      expect(manager.getTickInterval()).toBe(130)
    })
  })
})
