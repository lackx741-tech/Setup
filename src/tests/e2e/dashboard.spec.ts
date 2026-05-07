import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('loads the dashboard page', async ({ page }) => {
    await expect(page).toHaveTitle(/EIP-7702|Dashboard/i);
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('sidebar has navigation links', async ({ page }) => {
    const sidebar = page.getByRole('navigation');
    await expect(sidebar.getByRole('link', { name: /overview/i })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: /delegation|eip-7702/i })).toBeVisible();
  });

  test('header shows connect wallet button when disconnected', async ({ page }) => {
    await expect(page.getByRole('button', { name: /connect wallet/i })).toBeVisible();
  });

  test('activity feed is visible', async ({ page }) => {
    await expect(page.getByText(/activity/i)).toBeVisible();
  });

  test('network status section renders', async ({ page }) => {
    await expect(page.getByText(/network/i)).toBeVisible();
  });

  test('navigates to delegation page', async ({ page }) => {
    await page.getByRole('link', { name: /delegation|eip-7702/i }).click();
    await expect(page).toHaveURL(/delegation/);
  });
});
