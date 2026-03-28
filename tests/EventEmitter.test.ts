import { describe, it, expect, vi } from 'vitest'
import { EventEmitter } from '@/utils/EventEmitter'

type TestEvents = {
  ping: string
  count: number
  nothing: undefined
}

describe('EventEmitter', () => {
  describe('on() + emit()', () => {
    it('calls handler with correct string data', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler = vi.fn()
      emitter.on('ping', handler)
      emitter.emit('ping', 'hello')
      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith('hello')
    })

    it('calls handler with correct number data', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler = vi.fn()
      emitter.on('count', handler)
      emitter.emit('count', 42)
      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith(42)
    })

    it('calls handler with undefined data', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler = vi.fn()
      emitter.on('nothing', handler)
      emitter.emit('nothing', undefined)
      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith(undefined)
    })
  })

  describe('multiple handlers on same event', () => {
    it('calls all handlers when event is emitted', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()
      emitter.on('ping', handler1)
      emitter.on('ping', handler2)
      emitter.on('ping', handler3)
      emitter.emit('ping', 'world')
      expect(handler1).toHaveBeenCalledWith('world')
      expect(handler2).toHaveBeenCalledWith('world')
      expect(handler3).toHaveBeenCalledWith('world')
    })
  })

  describe('off()', () => {
    it('removes a specific handler so it is no longer called', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler = vi.fn()
      emitter.on('ping', handler)
      emitter.off('ping', handler)
      emitter.emit('ping', 'test')
      expect(handler).not.toHaveBeenCalled()
    })

    it('leaves other handlers intact when one is removed', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      emitter.on('ping', handler1)
      emitter.on('ping', handler2)
      emitter.off('ping', handler1)
      emitter.emit('ping', 'test')
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledWith('test')
    })
  })

  describe('emit() with no handlers', () => {
    it('does not throw when no handlers are registered', () => {
      const emitter = new EventEmitter<TestEvents>()
      expect(() => emitter.emit('ping', 'test')).not.toThrow()
    })

    it('does not throw after all handlers have been removed', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler = vi.fn()
      emitter.on('ping', handler)
      emitter.off('ping', handler)
      expect(() => emitter.emit('ping', 'test')).not.toThrow()
    })
  })

  describe('handler call count', () => {
    it('calls handler exactly once per emit', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler = vi.fn()
      emitter.on('count', handler)
      emitter.emit('count', 1)
      emitter.emit('count', 2)
      emitter.emit('count', 3)
      expect(handler).toHaveBeenCalledTimes(3)
    })

    it('does not call handler for unrelated events', () => {
      const emitter = new EventEmitter<TestEvents>()
      const pingHandler = vi.fn()
      emitter.on('ping', pingHandler)
      emitter.emit('count', 99)
      expect(pingHandler).not.toHaveBeenCalled()
    })
  })

  describe('no deduplication — same handler added twice', () => {
    it('calls the handler twice when registered twice', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler = vi.fn()
      emitter.on('ping', handler)
      emitter.on('ping', handler)
      emitter.emit('ping', 'dup')
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('removes all registrations of the same handler when off() is called', () => {
      const emitter = new EventEmitter<TestEvents>()
      const handler = vi.fn()
      emitter.on('ping', handler)
      emitter.on('ping', handler)
      emitter.off('ping', handler)
      emitter.emit('ping', 'dup')
      // filter removes all matching references at once
      expect(handler).not.toHaveBeenCalled()
    })
  })
})
