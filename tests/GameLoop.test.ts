import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'
import { GameLoop, DrawCallback } from '@/game/GameLoop'
import { GameManager } from '@/game/GameManager'

describe('GameLoop', () => {
  let manager: GameManager
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let draw: Mock<any>
  let loop: GameLoop

  beforeEach(() => {
    manager = new GameManager()
    draw = vi.fn()
    loop = new GameLoop(manager, draw as unknown as DrawCallback)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── Helper: put loop into a started, playing state ──────────────────────

  function startPlaying(): void {
    loop.start()
    manager.startGame()
    // Prime _lastTime with initial step
    loop._step(0)
    draw.mockClear()
  }

  // ─── Basic tick behavior ──────────────────────────────────────────────────

  describe('onDraw callback', () => {
    it('_step() calls onDraw each time', () => {
      loop.start()
      manager.startGame()
      loop._step(0)
      expect(draw).toHaveBeenCalledTimes(1)
      loop._step(100)
      expect(draw).toHaveBeenCalledTimes(2)
    })
  })

  describe('tick firing', () => {
    it('two _step() calls 150ms apart fire exactly one tick', () => {
      const update = vi.spyOn(manager, 'update')
      startPlaying()
      loop._step(150)
      expect(update).toHaveBeenCalledTimes(1)
    })

    it('_step() calls 300ms apart fire exactly two ticks', () => {
      const update = vi.spyOn(manager, 'update')
      startPlaying()
      loop._step(300)
      expect(update).toHaveBeenCalledTimes(2)
    })

    it('_step() calls 50ms apart fire zero ticks (not enough delta)', () => {
      const update = vi.spyOn(manager, 'update')
      startPlaying()
      loop._step(50)
      expect(update).toHaveBeenCalledTimes(0)
    })
  })

  // ─── Backlog cap ──────────────────────────────────────────────────────────

  describe('backlog cap', () => {
    it('600ms delta (4 × 150ms) fires only 3 ticks (MAX_TICKS_PER_FRAME cap)', () => {
      const update = vi.spyOn(manager, 'update')
      startPlaying()
      loop._step(600)
      expect(update).toHaveBeenCalledTimes(3)
    })
  })

  // ─── State gating ─────────────────────────────────────────────────────────

  describe('state gating', () => {
    it('no ticks fire when state is PAUSED — onDraw still called', () => {
      loop.start()
      manager.startGame()
      loop._step(0) // init _lastTime
      manager.pauseGame()
      draw.mockClear()
      const update = vi.spyOn(manager, 'update')

      loop._step(150)
      expect(update).not.toHaveBeenCalled()
      expect(draw).toHaveBeenCalledTimes(1)
    })

    it('no ticks fire when state is IDLE — onDraw still called', () => {
      // IDLE is the default state; we don't start the game
      loop.start()
      loop._step(0) // init _lastTime
      draw.mockClear()
      const update = vi.spyOn(manager, 'update')

      loop._step(150)
      expect(update).not.toHaveBeenCalled()
      expect(draw).toHaveBeenCalledTimes(1)
    })

    it('loop self-terminates on GAME_OVER (_running becomes false)', () => {
      loop.start()
      manager.startGame()
      loop._step(0) // init _lastTime
      manager.endGame() // → GAME_OVER

      draw.mockClear()
      loop._step(150) // GAME_OVER branch: stop() then onDraw(0)
      expect(draw).toHaveBeenCalledTimes(1)
      expect(draw).toHaveBeenCalledWith(0)

      // After stop(), subsequent _step() calls are no-ops
      draw.mockClear()
      loop._step(300)
      expect(draw).not.toHaveBeenCalled()
    })
  })

  // ─── Interpolation ────────────────────────────────────────────────────────

  describe('interpolation', () => {
    it('with 75ms accumulated (half tick), onDraw receives ~0.5', () => {
      startPlaying()
      loop._step(75) // 75ms / 150ms = 0.5
      expect(draw).toHaveBeenCalledTimes(1)
      expect(draw.mock.calls[0]![0]).toBeCloseTo(0.5, 5)
    })

    it('with 0ms accumulated, onDraw receives 0', () => {
      startPlaying()
      loop._step(0) // 0ms delta → accumulator = 0, interpolation = 0
      expect(draw).toHaveBeenCalledTimes(1)
      expect(draw.mock.calls[0]![0]).toBe(0)
    })
  })

  // ─── Start/stop lifecycle ─────────────────────────────────────────────────

  describe('start/stop lifecycle', () => {
    it('start() allows _step() to process; second start() is a no-op', () => {
      loop.start()
      manager.startGame()
      loop._step(0)
      const updateCount1 = vi.spyOn(manager, 'update').mockReturnValue(undefined)
      loop._step(150)
      const firstCount = updateCount1.mock.calls.length

      // Call start() again — should not reset the loop or duplicate processing
      loop.start()
      loop._step(300)
      // Still ticks normally (not doubled), confirming start() was a no-op
      expect(updateCount1.mock.calls.length).toBeGreaterThan(firstCount)
    })

    it('stop() prevents _step() from processing', () => {
      loop.start()
      manager.startGame()
      loop._step(0)
      loop.stop()
      draw.mockClear()
      const update = vi.spyOn(manager, 'update')

      loop._step(150)
      expect(update).not.toHaveBeenCalled()
      expect(draw).not.toHaveBeenCalled()
    })
  })

  // ─── Speed tiers (test getTickInterval delegation) ───────────────────────

  describe('speed tiers', () => {
    it('at score=0 (default), getTickInterval() returns 150ms and loop uses 150ms ticks', () => {
      // getTickInterval() returns 150ms by default — no mock needed
      const update = vi.spyOn(manager, 'update')
      startPlaying()
      loop._step(149) // just under 150ms — no tick
      expect(update).not.toHaveBeenCalled()
      loop._step(149 + 150) // now 150ms after last step — one tick
      expect(update).toHaveBeenCalledTimes(1)
    })

    it('when getTickInterval() is mocked to return 75ms, loop uses 75ms ticks', () => {
      vi.spyOn(manager, 'getTickInterval').mockReturnValue(75)
      const update = vi.spyOn(manager, 'update')

      loop.start()
      manager.startGame()
      loop._step(0) // init _lastTime
      draw.mockClear()

      loop._step(74) // just under 75ms — no tick
      expect(update).not.toHaveBeenCalled()

      loop._step(74 + 75) // exactly 75ms later — one tick
      expect(update).toHaveBeenCalledTimes(1)
    })

    it('getTickInterval() is called each tick cycle (not cached)', () => {
      const getTickIntervalSpy = vi.spyOn(manager, 'getTickInterval')

      loop.start()
      manager.startGame()
      loop._step(0) // init _lastTime — first call
      const callsAfterInit = getTickIntervalSpy.mock.calls.length

      loop._step(150) // fires one tick
      const callsAfterTick1 = getTickIntervalSpy.mock.calls.length

      loop._step(300) // fires another tick
      const callsAfterTick2 = getTickIntervalSpy.mock.calls.length

      // Each _step() call should invoke getTickInterval() — it must not be cached
      expect(callsAfterTick1).toBeGreaterThan(callsAfterInit)
      expect(callsAfterTick2).toBeGreaterThan(callsAfterTick1)
    })
  })

  // ─── First _step() initialisation ─────────────────────────────────────────

  describe('first _step() initialisation', () => {
    it('first _step() with any timestamp initialises _lastTime without firing ticks', () => {
      loop.start()
      manager.startGame()
      const update = vi.spyOn(manager, 'update')

      loop._step(9999) // Large timestamp on first call — should NOT fire ticks
      expect(update).not.toHaveBeenCalled()
      expect(draw).toHaveBeenCalledTimes(1) // onDraw is still called
    })
  })
})
