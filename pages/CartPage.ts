import { Page, Locator, expect } from '@playwright/test';

export interface PurchaseDetails {
  name: string;
  country: string;
  city: string;
  creditCard: string;
  month: string;
  year: string;
}

export class CartPage {
  private readonly cartNavLink: Locator;
  private readonly cartItems: Locator;
  private readonly placeOrderButton: Locator;
  private readonly nameInput: Locator;
  private readonly countryInput: Locator;
  private readonly cityInput: Locator;
  private readonly creditCardInput: Locator;
  private readonly monthInput: Locator;
  private readonly yearInput: Locator;
  private readonly purchaseButton: Locator;
  private readonly successHeading: Locator;
  private readonly confirmButton: Locator;

  constructor(private readonly page: Page) {
    this.cartNavLink = page.locator('#cartur');
    this.cartItems = page.locator('#tbodyid tr');
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
    this.nameInput = page.locator('#name');
    this.countryInput = page.locator('#country');
    this.cityInput = page.locator('#city');
    this.creditCardInput = page.locator('#card');
    this.monthInput = page.locator('#month');
    this.yearInput = page.locator('#year');
    this.purchaseButton = page.locator('#orderModal').getByRole('button', { name: 'Purchase' });
    this.successHeading = page.locator('.sweet-alert h2');
    this.confirmButton = page.locator('.sweet-alert .confirm');
  }

  async openViaNavMenu(): Promise<void> {
    // Set up listener before clicking so the viewcart response is captured
    // even if it arrives before we await the promise.
    const cartLoaded = this.page.waitForResponse('**/viewcart');
    await this.cartNavLink.click();
    await cartLoaded;
    await expect(this.cartItems.first()).toBeVisible();
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
    await expect(this.nameInput).toBeVisible();
  }

  async fillPurchaseForm(details: PurchaseDetails): Promise<void> {
    await this.nameInput.fill(details.name);
    await this.countryInput.fill(details.country);
    await this.cityInput.fill(details.city);
    await this.creditCardInput.fill(details.creditCard);
    await this.monthInput.fill(details.month);
    await this.yearInput.fill(details.year);
  }

  async completePurchase(): Promise<void> {
    await this.purchaseButton.click();
  }

  async assertPurchaseSuccess(): Promise<void> {
    await expect(this.successHeading).toHaveText('Thank you for your purchase!');
  }

  async closeReceipt(): Promise<void> {
    await expect(this.confirmButton).toBeVisible();
    await this.confirmButton.click();
  }
}
