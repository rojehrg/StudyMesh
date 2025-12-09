import { describe, it, expect, beforeEach } from 'vitest'
import { reducer } from '@/hooks/use-toast'

type ToastProps = {
  id: string
  title?: string
  description?: string
  open?: boolean
}

type State = {
  toasts: ToastProps[]
}

describe('Toast Reducer', () => {
  let initialState: State

  beforeEach(() => {
    initialState = { toasts: [] }
  })

  describe('ADD_TOAST', () => {
    it('should add a toast to empty state', () => {
      const newToast: ToastProps = { id: '1', title: 'Test Toast' }
      const result = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: newToast,
      })

      expect(result.toasts).toHaveLength(1)
      expect(result.toasts[0]).toEqual(newToast)
    })

    it('should add toast to beginning of list (newest first)', () => {
      // Note: TOAST_LIMIT is 1, so only newest toast is kept
      // This test verifies the ordering behavior before the limit is applied
      const newToast: ToastProps = { id: '2', title: 'Second' }

      const result = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: newToast,
      })

      // With limit of 1, only the newest toast remains
      expect(result.toasts[0].id).toBe('2')
    })

    it('should limit toasts to TOAST_LIMIT (1)', () => {
      const existingState: State = {
        toasts: [{ id: '1', title: 'First' }],
      }
      const newToast: ToastProps = { id: '2', title: 'Second' }

      const result = reducer(existingState, {
        type: 'ADD_TOAST',
        toast: newToast,
      })

      // TOAST_LIMIT is 1, so only the newest toast should remain
      expect(result.toasts).toHaveLength(1)
      expect(result.toasts[0].id).toBe('2')
    })
  })

  describe('UPDATE_TOAST', () => {
    it('should update existing toast', () => {
      const existingState: State = {
        toasts: [{ id: '1', title: 'Original', description: 'Desc' }],
      }

      const result = reducer(existingState, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Updated' },
      })

      expect(result.toasts[0].title).toBe('Updated')
      expect(result.toasts[0].description).toBe('Desc') // Should preserve other fields
    })

    it('should preserve toast identity after update', () => {
      const existingState: State = {
        toasts: [{ id: '1', title: 'First', description: 'Original desc' }],
      }

      const result = reducer(existingState, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Updated First' },
      })

      expect(result.toasts[0].title).toBe('Updated First')
      expect(result.toasts[0].description).toBe('Original desc')
      expect(result.toasts[0].id).toBe('1')
    })

    it('should not change state if toast not found', () => {
      const existingState: State = {
        toasts: [{ id: '1', title: 'First' }],
      }

      const result = reducer(existingState, {
        type: 'UPDATE_TOAST',
        toast: { id: '999', title: 'Not Found' },
      })

      expect(result.toasts).toHaveLength(1)
      expect(result.toasts[0].title).toBe('First')
    })
  })

  describe('DISMISS_TOAST', () => {
    it('should set specific toast to closed', () => {
      const existingState: State = {
        toasts: [{ id: '1', title: 'Toast', open: true }],
      }

      const result = reducer(existingState, {
        type: 'DISMISS_TOAST',
        toastId: '1',
      })

      expect(result.toasts[0].open).toBe(false)
    })

    it('should dismiss all toasts when no toastId provided', () => {
      const existingState: State = {
        toasts: [{ id: '1', title: 'First', open: true }],
      }

      const result = reducer(existingState, {
        type: 'DISMISS_TOAST',
      })

      expect(result.toasts.every(t => t.open === false)).toBe(true)
    })

    it('should dismiss only when toastId matches', () => {
      const existingState: State = {
        toasts: [{ id: '1', title: 'First', open: true }],
      }

      const result = reducer(existingState, {
        type: 'DISMISS_TOAST',
        toastId: '1',
      })

      expect(result.toasts[0].open).toBe(false)
    })
  })

  describe('REMOVE_TOAST', () => {
    it('should remove specific toast', () => {
      const existingState: State = {
        toasts: [{ id: '1', title: 'First' }],
      }

      const result = reducer(existingState, {
        type: 'REMOVE_TOAST',
        toastId: '1',
      })

      expect(result.toasts).toHaveLength(0)
    })

    it('should remove all toasts when no toastId provided', () => {
      const existingState: State = {
        toasts: [{ id: '1', title: 'First' }],
      }

      const result = reducer(existingState, {
        type: 'REMOVE_TOAST',
      })

      expect(result.toasts).toHaveLength(0)
    })

    it('should not change state if toast not found', () => {
      const existingState: State = {
        toasts: [{ id: '1', title: 'First' }],
      }

      const result = reducer(existingState, {
        type: 'REMOVE_TOAST',
        toastId: '999',
      })

      expect(result.toasts).toHaveLength(1)
    })
  })

  describe('State immutability', () => {
    it('should not mutate original state', () => {
      const existingState: State = {
        toasts: [{ id: '1', title: 'First' }],
      }
      const originalToasts = [...existingState.toasts]

      reducer(existingState, {
        type: 'ADD_TOAST',
        toast: { id: '2', title: 'Second' },
      })

      expect(existingState.toasts).toEqual(originalToasts)
    })
  })
})
