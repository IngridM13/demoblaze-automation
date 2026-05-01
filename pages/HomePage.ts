import { Page, Locator, expect } from '@playwright/test';
import { Product } from '../utils/types';

export class HomePage {
  readonly page: Page;

  private readonly productCards: Locator;
  private readonly nextButton: Locator;
  private readonly signUpNavLink: Locator;
  private readonly logInNavLink: Locator;
  private readonly welcomeMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productCards = page.locator('#tbodyid .col-lg-4.col-md-6.mb-4');
    this.nextButton = page.locator('#next2');
    this.signUpNavLink = page.locator('#signin2');
    this.logInNavLink = page.locator('#login2');
    this.welcomeMessage = page.locator('#nameofuser');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/');
    await expect(this.productCards.first()).toBeVisible();
  }

  async getVisibleProducts(): Promise<Product[]> {
    await expect(this.productCards.first()).toBeVisible();

    const count = await this.productCards.count();
    const products: Product[] = [];

    for (let i = 0; i < count; i++) {
      const card = this.productCards.nth(i);
      const name = await card.locator('.card-title a').innerText();
      const price = await card.locator('h5').innerText();
      const relativeLink = await card.locator('.card-title a').getAttribute('href');

      products.push({
        name: name.trim(),
        price: price.trim(),
        link: relativeLink ? new URL(relativeLink, this.page.url()).href : '',
      });
    }

    return products;
  }

  async goToNextPage(): Promise<void> {
    const firstProductBefore = await this.productCards.first().locator('.card-title a').innerText();

    await expect(this.nextButton).toBeVisible();
    await this.nextButton.click();

    await expect(this.productCards.first()).toBeVisible();

    // Demoblaze re-renders products in place without a URL change or loading indicator,
    // so we poll until the first product name actually differs from the previous page.
    await expect(async () => {
      const firstProductAfter = await this.productCards.first().locator('.card-title a').innerText();
      expect(firstProductAfter.trim()).not.toBe(firstProductBefore.trim());
    }).toPass({ timeout: 15_000 });
  }

  async isNextButtonVisible(): Promise<boolean> {
    return this.nextButton.isVisible();
  }

  async selectProduct(name: string): Promise<void> {
    await this.page.locator('#tbodyid').getByRole('link', { name, exact: true }).click();
  }

  async selectFirstProduct(): Promise<void> {
    await this.productCards.first().locator('.card-title a').click();
  }

  async openSignUp(): Promise<void> {
    await this.signUpNavLink.click();
    await expect(this.page.locator('#signInModal')).toBeVisible();
  }

  async openLogIn(): Promise<void> {
    await this.logInNavLink.click();
    await expect(this.page.locator('#logInModal')).toBeVisible();
  }

  async assertLoggedIn(username: string): Promise<void> {
    await expect(this.welcomeMessage).toHaveText(`Welcome ${username}`);
    await expect(this.logInNavLink).not.toBeVisible();
  }
}
