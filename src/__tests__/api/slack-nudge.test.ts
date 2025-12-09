import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '@/app/api/slack/nudge/route'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Slack Nudge API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset env
    delete process.env.SLACK_WEBHOOK_URL
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Webhook Configuration', () => {
    it('should return skipped when webhook not configured', async () => {
      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'test',
          senderName: 'John',
          topic: 'React',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.skipped).toBe(true)
      expect(data.reason).toBe('Webhook not configured')
    })
  })

  describe('Request Validation', () => {
    beforeEach(() => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test'
    })

    it('should return 400 when recipientSlackHandle is missing', async () => {
      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          senderName: 'John',
          topic: 'React',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing fields')
    })

    it('should return 400 when senderName is missing', async () => {
      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'test',
          topic: 'React',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing fields')
    })

    it('should return 400 when topic is missing', async () => {
      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'test',
          senderName: 'John',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing fields')
    })
  })

  describe('Slack Handle Formatting', () => {
    beforeEach(() => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test'
      mockFetch.mockResolvedValue({ ok: true })
    })

    it('should format Slack user ID correctly', async () => {
      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'U123ABC',
          senderName: 'John',
          topic: 'React',
        }),
      })

      await POST(request)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('<@U123ABC>'),
        })
      )
    })

    it('should format W-prefix user ID correctly', async () => {
      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'W456DEF',
          senderName: 'John',
          topic: 'React',
        }),
      })

      await POST(request)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          body: expect.stringContaining('<@W456DEF>'),
        })
      )
    })

    it('should keep @username format as-is', async () => {
      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: '@johndoe',
          senderName: 'John',
          topic: 'React',
        }),
      })

      await POST(request)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          body: expect.stringContaining('@johndoe'),
        })
      )
    })

    it('should add @ to plain username', async () => {
      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'johndoe',
          senderName: 'John',
          topic: 'React',
        }),
      })

      await POST(request)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          body: expect.stringContaining('@johndoe'),
        })
      )
    })
  })

  describe('Nudge Types', () => {
    beforeEach(() => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test'
      mockFetch.mockResolvedValue({ ok: true })
    })

    it('should format "offer" nudge correctly', async () => {
      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'test',
          senderName: 'John',
          topic: 'React',
          nudgeType: 'offer',
        }),
      })

      await POST(request)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          body: expect.stringContaining('wants to help you with'),
        })
      )
    })

    it('should format "ask" nudge correctly', async () => {
      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'test',
          senderName: 'John',
          topic: 'React',
          nudgeType: 'ask',
        }),
      })

      await POST(request)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          body: expect.stringContaining('is looking for help with'),
        })
      )
    })

    it('should default to "ask" format when nudgeType not specified', async () => {
      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'test',
          senderName: 'John',
          topic: 'React',
        }),
      })

      await POST(request)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          body: expect.stringContaining('is looking for help with'),
        })
      )
    })
  })

  describe('Pod Code', () => {
    beforeEach(() => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test'
      mockFetch.mockResolvedValue({ ok: true })
    })

    it('should include pod code in message when provided', async () => {
      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'test',
          senderName: 'John',
          topic: 'React',
          podCode: 'ABC123',
        }),
      })

      await POST(request)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          body: expect.stringContaining('ABC123'),
        })
      )
    })

    it('should not mention pod when code not provided', async () => {
      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'test',
          senderName: 'John',
          topic: 'React',
        }),
      })

      await POST(request)

      const callBody = mockFetch.mock.calls[0][1].body
      expect(callBody).not.toContain('Pod:')
    })
  })

  describe('Webhook Response Handling', () => {
    beforeEach(() => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test'
    })

    it('should return ok:true on successful webhook', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'test',
          senderName: 'John',
          topic: 'React',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ok).toBe(true)
    })

    it('should return 500 when webhook fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('Webhook error'),
      })

      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'test',
          senderName: 'John',
          topic: 'React',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Slack webhook failed')
    })

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'test',
          senderName: 'John',
          topic: 'React',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Unexpected error')
    })
  })

  describe('Message Format', () => {
    beforeEach(() => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test'
      mockFetch.mockResolvedValue({ ok: true })
    })

    it('should include topic in bold', async () => {
      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'test',
          senderName: 'John',
          topic: 'React',
        }),
      })

      await POST(request)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          body: expect.stringContaining('*React*'),
        })
      )
    })

    it('should include sender name in bold', async () => {
      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'test',
          senderName: 'John Doe',
          topic: 'React',
        }),
      })

      await POST(request)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          body: expect.stringContaining('*John Doe*'),
        })
      )
    })

    it('should use correct Content-Type header', async () => {
      const request = new Request('http://localhost/api/slack/nudge', {
        method: 'POST',
        body: JSON.stringify({
          recipientSlackHandle: 'test',
          senderName: 'John',
          topic: 'React',
        }),
      })

      await POST(request)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })
  })
})
