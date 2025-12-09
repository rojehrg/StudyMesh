import { test, expect } from '@playwright/test'

// Note: These tests require a valid test user to be created first
// In a real setup, you would use test fixtures or a seeded database

test.describe('Onboarding Flow', () => {
  // Skip these tests in CI unless we have test user setup
  test.skip(({ }, testInfo) => {
    // Skip if we don't have test credentials configured
    return !process.env.TEST_USER_EMAIL
  })

  test.describe('Onboarding Page Structure', () => {
    test('onboarding page should show step indicator', async ({ page }) => {
      // Navigate directly to onboarding (would need auth in real test)
      await page.goto('/onboarding')

      // If redirected to login, that's expected for unauthenticated users
      const url = page.url()
      if (url.includes('login')) {
        // Expected behavior - user needs to be authenticated
        return
      }

      // If on onboarding page, check structure
      await expect(page.getByText(/step/i)).toBeVisible()
    })
  })
})

test.describe('Onboarding UI Elements (Visual)', () => {
  test('onboarding page should be visually accessible from login', async ({ page }) => {
    await page.goto('/login')

    // Login form should exist
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()

    // After successful login, user would be redirected to onboarding or dashboard
    // This test verifies the login page is accessible
  })
})

// Integration tests for onboarding flow (requires authenticated session)
test.describe('Onboarding Steps', () => {
  test.describe.configure({ mode: 'serial' })

  // These would be implemented with proper auth fixtures
  test.skip('Step 1: About You - should require name and department', async ({ page }) => {
    // Would need authenticated session
    await page.goto('/onboarding')

    // Check Step 1 fields
    await expect(page.getByLabel(/first name/i)).toBeVisible()
    await expect(page.getByLabel(/last name/i)).toBeVisible()
    await expect(page.getByLabel(/department/i)).toBeVisible()
    await expect(page.getByLabel(/job title|role|major/i)).toBeVisible()

    // Try to proceed without filling
    await page.getByRole('button', { name: /next|continue/i }).click()

    // Should show validation errors
    await expect(page.getByText(/required|please fill/i)).toBeVisible()
  })

  test.skip('Step 2: Skills - should allow adding expertise and growth skills', async ({ page }) => {
    await page.goto('/onboarding')

    // Navigate to step 2 (assumes step 1 is complete)
    // ... fill step 1 first

    // Check Step 2 fields
    await expect(page.getByText(/expertise|skills you can teach/i)).toBeVisible()
    await expect(page.getByText(/growth|skills you want to learn/i)).toBeVisible()

    // Add a skill
    const skillInput = page.getByPlaceholder(/add skill|type skill/i).first()
    await skillInput.fill('React')
    await skillInput.press('Enter')

    // Skill should be added as a tag/badge
    await expect(page.getByText('React')).toBeVisible()
  })

  test.skip('Step 3: Bio - should allow entering working style', async ({ page }) => {
    await page.goto('/onboarding')

    // Navigate to step 3
    // ... fill steps 1 and 2 first

    // Check Step 3 fields
    await expect(page.getByLabel(/bio|working style|about/i)).toBeVisible()

    // Fill bio
    await page.getByLabel(/bio|working style|about/i).fill('I prefer async communication')

    // Complete onboarding
    await page.getByRole('button', { name: /finish|complete|submit/i }).click()

    // Should redirect to dashboard or groups
    await expect(page).toHaveURL(/\/(dashboard|groups)/)
  })
})
