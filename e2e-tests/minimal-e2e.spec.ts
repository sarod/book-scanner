import { test, expect, Page, Locator } from '@playwright/test';
import path from 'path';
test('has expected Title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.9
  await expect(page).toHaveTitle(/Book Scanner/);
});

test('load csv', async ({ page }) => {
  await page.goto('/');

  const __dirname = import.meta.dirname;
  const files = [path.join(__dirname, 'test-data/list1.csv')];

  await uploadLists(page, files);

  const header = await page.getByRole('row').nth(0);
  await expect(header).toBeVisible();

  const row0 = await page.getByRole('row').nth(1);
  await expect(row0).toBeVisible();

  await expectBookRow(row0, 'Unmatched Library Book', 'Livre 1', 'On time');
  const row1 = await page.getByRole('row').nth(2);
  await expect(row1).toBeVisible();
  await expectBookRow(row1, 'Unmatched Library Book', 'Livre 2', 'On time');
});

async function expectBookRow(
  row0: Locator,
  matchStatus: string,
  title: string,
  onTimeStatus: string
) {
  await expect(row0.getByRole('cell').nth(0)).toHaveAccessibleName(matchStatus);
  await expect(row0.getByRole('cell').nth(1)).toContainText(title);

  await expect(row0.getByRole('cell').nth(2)).toHaveAccessibleName(
    onTimeStatus
  );
}

async function uploadLists(page: Page, files: string[]) {
  const fileChooserPromise = page.waitForEvent('filechooser');

  page.getByRole('button', { name: 'Upload book list' }).click();
  const fileChooser = await fileChooserPromise;

  await fileChooser.setFiles(files);
}
