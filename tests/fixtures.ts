import { test as base, Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { signUp, logIn } from '../utils/authHelper';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const username = `fixture_user_${Date.now()}`;
    const password = 'TestPass123!';

    await new HomePage(page).goToHomePage();
    await signUp(page, username, password);
    await logIn(page, username, password);

    await use(page);
  },
});

export { expect } from '@playwright/test';
