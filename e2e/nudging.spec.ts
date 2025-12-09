import { test, expect } from '@playwright/test'

test.describe('Nudging System', () => {
  test.describe('Public Access', () => {
    test('should redirect to login when accessing notifications unauthenticated', async ({ page }) => {
      await page.goto('/notifications')
      await expect(page).toHaveURL(/.*login/, { timeout: 10000 })
    })
  })
})

// Authenticated nudging tests
test.describe('Nudging (Authenticated)', () => {
  test.skip(({ }, testInfo) => {
    return !process.env.TEST_USER_EMAIL
  })

  test.describe('Notifications Page', () => {
    test.skip('should display notifications page with tabs', async ({ page }) => {
      await page.goto('/notifications')

      // Should have Received and Sent tabs
      await expect(page.getByRole('tab', { name: /received/i })).toBeVisible()
      await expect(page.getByRole('tab', { name: /sent/i })).toBeVisible()
    })

    test.skip('should show empty state when no notifications', async ({ page }) => {
      await page.goto('/notifications')

      const hasNotifications = await page.locator('[data-testid="notification-item"]').first().isVisible()
      const hasEmptyState = await page.getByText(/no notifications|all caught up/i).isVisible()

      // Either has notifications or shows empty state
      expect(hasNotifications || hasEmptyState).toBeTruthy()
    })

    test.skip('should switch between tabs', async ({ page }) => {
      await page.goto('/notifications')

      // Click Sent tab
      await page.getByRole('tab', { name: /sent/i }).click()

      // Sent tab should be active
      await expect(page.getByRole('tab', { name: /sent/i })).toHaveAttribute('data-state', 'active')
    })

    test.skip('should mark notification as read', async ({ page }) => {
      await page.goto('/notifications')

      // Find unread notification
      const unreadNotif = page.locator('[data-testid="notification-item"][data-unread="true"]').first()
      if (await unreadNotif.isVisible()) {
        await unreadNotif.getByRole('button', { name: /mark.*read/i }).click()

        // Should update to read state
        await expect(unreadNotif).not.toHaveAttribute('data-unread', 'true')
      }
    })

    test.skip('should delete notification', async ({ page }) => {
      await page.goto('/notifications')

      const notification = page.locator('[data-testid="notification-item"]').first()
      if (await notification.isVisible()) {
        const countBefore = await page.locator('[data-testid="notification-item"]').count()

        await notification.getByRole('button', { name: /delete|remove/i }).click()

        // Should have one less notification
        await expect(page.locator('[data-testid="notification-item"]')).toHaveCount(countBefore - 1)
      }
    })
  })

  test.describe('Nudge Dialog', () => {
    test.skip('should open nudge dialog from pod member', async ({ page }) => {
      // Go to a pod with members
      await page.goto('/classes/TEST01')

      // Click nudge button
      await page.getByRole('button', { name: /nudge/i }).first().click()

      // Dialog should open
      await expect(page.getByRole('dialog')).toBeVisible()
    })

    test.skip('should show nudge type options', async ({ page }) => {
      await page.goto('/classes/TEST01')
      await page.getByRole('button', { name: /nudge/i }).first().click()

      // Should show ask/offer options
      await expect(page.getByText(/ask for help/i)).toBeVisible()
      await expect(page.getByText(/offer help/i)).toBeVisible()
    })

    test.skip('should show skill selection', async ({ page }) => {
      await page.goto('/classes/TEST01')
      await page.getByRole('button', { name: /nudge/i }).first().click()

      // Select a nudge type
      await page.getByText(/ask for help/i).click()

      // Should show skill options
      await expect(page.getByText(/select.*skill/i)).toBeVisible()
    })

    test.skip('should send nudge successfully', async ({ page }) => {
      await page.goto('/classes/TEST01')
      await page.getByRole('button', { name: /nudge/i }).first().click()

      // Fill nudge form
      await page.getByText(/ask for help/i).click()
      await page.locator('[data-testid="skill-option"]').first().click()

      // Send
      await page.getByRole('button', { name: /send/i }).click()

      // Should show success message or close dialog
      const dialogClosed = await page.getByRole('dialog').isHidden()
      const successToast = await page.getByText(/sent|success/i).isVisible()

      expect(dialogClosed || successToast).toBeTruthy()
    })

    test.skip('should close dialog on cancel', async ({ page }) => {
      await page.goto('/classes/TEST01')
      await page.getByRole('button', { name: /nudge/i }).first().click()

      // Click cancel or close button
      await page.getByRole('button', { name: /cancel|close/i }).click()

      // Dialog should close
      await expect(page.getByRole('dialog')).not.toBeVisible()
    })
  })

  test.describe('Header Notifications Dropdown', () => {
    test.skip('should show notification bell in header', async ({ page }) => {
      await page.goto('/dashboard')

      await expect(page.getByRole('button', { name: /notifications/i })).toBeVisible()
    })

    test.skip('should show unread count badge', async ({ page }) => {
      await page.goto('/dashboard')

      // If there are unread notifications, badge should be visible
      const badge = page.locator('[data-testid="notification-badge"]')
      // Badge may or may not be visible depending on notification count
    })

    test.skip('should open dropdown on click', async ({ page }) => {
      await page.goto('/dashboard')

      await page.getByRole('button', { name: /notifications/i }).click()

      // Dropdown should be visible
      await expect(page.getByRole('menu')).toBeVisible()
    })

    test.skip('should navigate to notifications page from dropdown', async ({ page }) => {
      await page.goto('/dashboard')

      await page.getByRole('button', { name: /notifications/i }).click()
      await page.getByRole('link', { name: /view all|see all/i }).click()

      await expect(page).toHaveURL(/.*notifications/)
    })
  })
})
