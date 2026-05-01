import { Page, Locator, expect } from '@playwright/test';

export class ProductDetailsPage {
  private readonly addToCartButton: Locator;

  constructor(private readonly page: Page) {
    this.addToCartButton = page.getByRole('link', { name: 'Add to cart' });
  }

  async addToCart(): Promise<void> {
    await expect(this.addToCartButton).toBeVisible();

    // Set up listeners before clicking so no events are missed.
    const addToCartResponse = this.page.waitForResponse('**/addtocart');
    const dialogEvent = this.page.waitForEvent('dialog');

    await this.addToCartButton.click();

    // Wait for the backend to confirm the item was saved before proceeding.
    await addToCartResponse;
    const dialog = await dialogEvent;
    await dialog.accept();
  }
}
