import { describe, it, expect } from 'vitest'
import { Vector2 } from '@/utils/Vector2'

describe('Vector2', () => {
  describe('construction', () => {
    it('stores x and y correctly', () => {
      const v = new Vector2(3, 7)
      expect(v.x).toBe(3)
      expect(v.y).toBe(7)
    })

    it('stores zero values', () => {
      const v = new Vector2(0, 0)
      expect(v.x).toBe(0)
      expect(v.y).toBe(0)
    })

    it('stores negative values', () => {
      const v = new Vector2(-5, -10)
      expect(v.x).toBe(-5)
      expect(v.y).toBe(-10)
    })
  })

  describe('equals()', () => {
    it('returns true for same coordinates', () => {
      const a = new Vector2(2, 4)
      const b = new Vector2(2, 4)
      expect(a.equals(b)).toBe(true)
    })

    it('returns false when x differs', () => {
      const a = new Vector2(1, 4)
      const b = new Vector2(2, 4)
      expect(a.equals(b)).toBe(false)
    })

    it('returns false when y differs', () => {
      const a = new Vector2(2, 3)
      const b = new Vector2(2, 4)
      expect(a.equals(b)).toBe(false)
    })

    it('returns false when both x and y differ', () => {
      const a = new Vector2(1, 2)
      const b = new Vector2(3, 4)
      expect(a.equals(b)).toBe(false)
    })

    it('returns true when compared with itself', () => {
      const a = new Vector2(5, 5)
      expect(a.equals(a)).toBe(true)
    })
  })

  describe('add()', () => {
    it('produces a new Vector2 with summed coordinates', () => {
      const a = new Vector2(1, 2)
      const b = new Vector2(3, 4)
      const result = a.add(b)
      expect(result.x).toBe(4)
      expect(result.y).toBe(6)
    })

    it('handles negative values', () => {
      const a = new Vector2(5, 5)
      const b = new Vector2(-3, -2)
      const result = a.add(b)
      expect(result.x).toBe(2)
      expect(result.y).toBe(3)
    })

    it('handles zero vector addition', () => {
      const a = new Vector2(7, 8)
      const zero = new Vector2(0, 0)
      const result = a.add(zero)
      expect(result.x).toBe(7)
      expect(result.y).toBe(8)
    })

    it('returns a new Vector2 instance', () => {
      const a = new Vector2(1, 2)
      const b = new Vector2(3, 4)
      const result = a.add(b)
      expect(result).toBeInstanceOf(Vector2)
      expect(result).not.toBe(a)
      expect(result).not.toBe(b)
    })
  })

  describe('immutability', () => {
    it('original vectors are unchanged after add()', () => {
      const a = new Vector2(1, 2)
      const b = new Vector2(3, 4)
      a.add(b)
      expect(a.x).toBe(1)
      expect(a.y).toBe(2)
      expect(b.x).toBe(3)
      expect(b.y).toBe(4)
    })
  })

  describe('toString()', () => {
    it('formats positive coordinates correctly', () => {
      const v = new Vector2(3, 7)
      expect(v.toString()).toBe('(3, 7)')
    })

    it('formats zero coordinates correctly', () => {
      const v = new Vector2(0, 0)
      expect(v.toString()).toBe('(0, 0)')
    })

    it('formats negative coordinates correctly', () => {
      const v = new Vector2(-5, -10)
      expect(v.toString()).toBe('(-5, -10)')
    })
  })
})
