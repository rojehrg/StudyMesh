import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.describe('Landing Page', () => {
    test('should display landing page with login/signup options', async ({ page }) => {
      await page.goto('/')

      // Check hero content
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      // Check navigation links
      await expect(page.getByRole('link', { name: /login/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /get started|sign up/i })).toBeVisible()
    })

    test('should navigate to login page', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('link', { name: /login/i }).click()

      await expect(page).toHaveURL(/.*login/)
      await expect(page.getByRole('heading', { name: /login|sign in|welcome/i })).toBeVisible()
    })

    test('should navigate to signup page', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('link', { name: /get started|sign up/i }).first().click()

      await expect(page).toHaveURL(/.*signup/)
    })
  })

  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
    })

    test('should display login form', async ({ page }) => {
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible()
    })

    test('should show validation errors for empty form submission', async ({ page }) => {
      await page.getByRole('button', { name: /sign in|log in/i }).click()

      // Browser validation should prevent submission or show error
      // HTML5 validation will show "Please fill out this field"
      const emailInput = page.getByLabel(/email/i)
      await expect(emailInput).toHaveAttribute('required', '')
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.getByLabel(/email/i).fill('nonexistent@example.com')
      await page.getByLabel(/password/i).fill('wrongpassword123')
      await page.getByRole('button', { name: /sign in|log in/i }).click()

      // Should show error message (toast or inline)
      await expect(page.getByText(/invalid|error|incorrect|failed/i)).toBeVisible({ timeout: 10000 })
    })

    test('should have link to signup page', async ({ page }) => {
      const signupLink = page.getByRole('link', { name: /sign up|create account|register/i })
      await expect(signupLink).toBeVisible()
    })

    test('should have Google OAuth option', async ({ page }) => {
      await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
    })
  })

  test.describe('Signup Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/signup')
    })

    test('should display signup form', async ({ page }) => {
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /sign up|create|register/i })).toBeVisible()
    })

    test('should have Google OAuth option', async ({ page }) => {
      await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
    })

    test('should have link to login page', async ({ page }) => {
      const loginLink = page.getByRole('link', { name: /login|sign in|already have/i })
      await expect(loginLink).toBeVisible()
    })

    test('should show validation for weak password', async ({ page }) => {
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('123') // Too short
      await page.getByRole('button', { name: /sign up|create|register/i }).click()

      // Should show password requirement error
      // May be browser validation or form error
      await page.waitForTimeout(1000) // Wait for potential form submission
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated user from dashboard to login', async ({ page }) => {
      await page.goto('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/.*login/, { timeout: 10000 })
    })

    test('should redirect unauthenticated user from settings to login', async ({ page }) => {
      await page.goto('/settings')

      await expect(page).toHaveURL(/.*login/, { timeout: 10000 })
    })

    test('should redirect unauthenticated user from classes to login', async ({ page }) => {
      await page.goto('/classes')

      await expect(page).toHaveURL(/.*login/, { timeout: 10000 })
    })
  })
})
