import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn (className utility)', () => {
  it('should merge simple class names', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const isDisabled = false
    const result = cn('base', isActive && 'active', isDisabled && 'disabled')
    expect(result).toBe('base active')
  })

  it('should merge Tailwind classes correctly', () => {
    // Later class should override earlier conflicting class
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })

  it('should handle array of classes', () => {
    const result = cn(['foo', 'bar'], 'baz')
    expect(result).toBe('foo bar baz')
  })

  it('should handle object syntax', () => {
    const result = cn({
      'text-red-500': true,
      'text-blue-500': false,
      'font-bold': true,
    })
    expect(result).toBe('text-red-500 font-bold')
  })

  it('should handle mixed inputs', () => {
    const result = cn(
      'base',
      ['array-class'],
      { 'object-class': true },
      undefined,
      null,
      false,
      'final'
    )
    expect(result).toBe('base array-class object-class final')
  })

  it('should handle empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should deduplicate Tailwind variants', () => {
    const result = cn('hover:bg-red-500', 'hover:bg-blue-500')
    expect(result).toBe('hover:bg-blue-500')
  })

  it('should handle responsive variants', () => {
    const result = cn('text-sm', 'md:text-base', 'lg:text-lg')
    expect(result).toBe('text-sm md:text-base lg:text-lg')
  })

  it('should merge conflicting responsive variants', () => {
    const result = cn('md:text-sm', 'md:text-lg')
    expect(result).toBe('md:text-lg')
  })
})
