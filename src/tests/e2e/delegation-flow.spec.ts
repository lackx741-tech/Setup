import { test, expect } from '@playwright/test';

test.describe('Delegation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('delegation form renders required fields', async ({ page }) => {
    // Navigate to delegation section if not already there
    const delegationLink = page.getByRole('link', { name: /delegation|eip-7702/i });
    if (await delegationLink.isVisible()) {
      await delegationLink.click();
    }

    await expect(page.getByText(/delegate address/i)).toBeVisible();
  });

  test('sign delegation button is disabled without wallet', async ({ page }) => {
    const signBtn = page.getByRole('button', { name: /sign.*delegation|delegate/i }).first();
    if (await signBtn.isVisible()) {
      await expect(signBtn).toBeDisabled();
    }
  });

  test('delegation status section is visible', async ({ page }) => {
    await expect(page.getByText(/delegation status|active delegation/i)).toBeVisible();
  });

  test('shows "no active delegation" when not connected', async ({ page }) => {
    await expect(page.getByText(/no active delegation|connect wallet/i)).toBeVisible();
  });
});
