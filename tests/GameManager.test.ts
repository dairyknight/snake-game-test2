import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GameManager } from '@/game/GameManager'
import { GameState } from '@/state/GameState'

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
})
