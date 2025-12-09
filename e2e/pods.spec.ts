import { test, expect } from '@playwright/test'

test.describe('Pods (Classes)', () => {
  test.describe('Public Access', () => {
    test('should redirect to login when accessing pods page unauthenticated', async ({ page }) => {
      await page.goto('/classes')
      await expect(page).toHaveURL(/.*login/, { timeout: 10000 })
    })

    test('should redirect to login when accessing create pod page unauthenticated', async ({ page }) => {
      await page.goto('/classes/create')
      await expect(page).toHaveURL(/.*login/, { timeout: 10000 })
    })

    test('should redirect to login when accessing join pod page unauthenticated', async ({ page }) => {
      await page.goto('/classes/join')
      await expect(page).toHaveURL(/.*login/, { timeout: 10000 })
    })
  })
})

// Authenticated pod tests (would need test fixtures)
test.describe('Pod Management (Authenticated)', () => {
  test.skip(({ }, testInfo) => {
    return !process.env.TEST_USER_EMAIL
  })

  test.describe('Create Pod', () => {
    test.skip('should show create pod form', async ({ page }) => {
      await page.goto('/classes/create')

      await expect(page.getByLabel(/pod name|name/i)).toBeVisible()
      await expect(page.getByLabel(/business unit|department/i)).toBeVisible()
      await expect(page.getByLabel(/initiative owner|owner/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /create/i })).toBeVisible()
    })

    test.skip('should validate required fields', async ({ page }) => {
      await page.goto('/classes/create')

      // Try to submit without filling required fields
      await page.getByRole('button', { name: /create/i }).click()

      // Should show validation error
      await expect(page.getByText(/required|please enter/i)).toBeVisible()
    })

    test.skip('should create pod and show pod code', async ({ page }) => {
      await page.goto('/classes/create')

      // Fill form
      await page.getByLabel(/pod name|name/i).fill('Test Pod')
      await page.getByLabel(/business unit|department/i).fill('Engineering')

      // Submit
      await page.getByRole('button', { name: /create/i }).click()

      // Should redirect to pod detail or show success
      await expect(page).toHaveURL(/\/classes\/[A-Z0-9]{6}/)

      // Should show the pod code
      await expect(page.getByText(/[A-Z0-9]{6}/)).toBeVisible()
    })
  })

  test.describe('Join Pod', () => {
    test.skip('should show join pod form', async ({ page }) => {
      await page.goto('/classes/join')

      await expect(page.getByLabel(/pod code|code/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /check|preview|join/i })).toBeVisible()
    })

    test.skip('should show error for invalid pod code', async ({ page }) => {
      await page.goto('/classes/join')

      await page.getByLabel(/pod code|code/i).fill('INVALID')
      await page.getByRole('button', { name: /check|preview/i }).click()

      await expect(page.getByText(/not found|invalid|doesn't exist/i)).toBeVisible()
    })

    test.skip('should preview pod before joining', async ({ page }) => {
      await page.goto('/classes/join')

      // Use a known test pod code
      await page.getByLabel(/pod code|code/i).fill('TEST01')
      await page.getByRole('button', { name: /check|preview/i }).click()

      // Should show pod preview
      await expect(page.getByText(/members|join this pod/i)).toBeVisible()
    })
  })

  test.describe('Pod List', () => {
    test.skip('should display user pods', async ({ page }) => {
      await page.goto('/classes')

      // Should show pods list or empty state
      const hasOwnPods = await page.getByText(/your pods|my pods/i).isVisible()
      const hasEmptyState = await page.getByText(/no pods|join a pod|create a pod/i).isVisible()

      expect(hasOwnPods || hasEmptyState).toBeTruthy()
    })

    test.skip('should have search functionality', async ({ page }) => {
      await page.goto('/classes')

      await expect(page.getByPlaceholder(/search/i)).toBeVisible()
    })

    test.skip('should navigate to pod detail on click', async ({ page }) => {
      await page.goto('/classes')

      // Click on first pod card (if exists)
      const podCard = page.locator('[data-testid="pod-card"]').first()
      if (await podCard.isVisible()) {
        await podCard.click()
        await expect(page).toHaveURL(/\/classes\/[A-Z0-9]{6}/)
      }
    })
  })

  test.describe('Pod Detail', () => {
    test.skip('should show pod members', async ({ page }) => {
      // Navigate to a test pod
      await page.goto('/classes/TEST01')

      await expect(page.getByText(/members/i)).toBeVisible()
    })

    test.skip('should show copy code button', async ({ page }) => {
      await page.goto('/classes/TEST01')

      await expect(page.getByRole('button', { name: /copy|code/i })).toBeVisible()
    })

    test.skip('should have nudge button for each member', async ({ page }) => {
      await page.goto('/classes/TEST01')

      // Each member should have a nudge button
      await expect(page.getByRole('button', { name: /nudge/i }).first()).toBeVisible()
    })
  })
})
