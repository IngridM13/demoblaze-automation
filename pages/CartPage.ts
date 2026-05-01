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
  private readonly totalPrice: Locator;
  private readonly placeOrderButton: Locator;
  private readonly nameInput: Locator;
  private readonly countryInput: Locator;
  private readonly cityInput: Locator;
  private readonly creditCardInput: Locator;
  private readonly monthInput: Locator;
  private readonly yearInput: Locator;
  private readonly purchaseButton: Locator;
  private readonly successHeading: Locator;
  private readonly receiptBody: Locator;
  private readonly confirmButton: Locator;

  constructor(private readonly page: Page) {
    this.cartNavLink = page.locator('#cartur');
    this.cartItems = page.locator('#tbodyid tr');
    this.totalPrice = page.locator('#totalp');
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
    this.nameInput = page.locator('#name');
    this.countryInput = page.locator('#country');
    this.cityInput = page.locator('#city');
    this.creditCardInput = page.locator('#card');
    this.monthInput = page.locator('#month');
    this.yearInput = page.locator('#year');
    this.purchaseButton = page.locator('#orderModal').getByRole('button', { name: 'Purchase' });
    this.successHeading = page.locator('.sweet-alert h2');
    this.receiptBody = page.locator('.sweet-alert p.lead');
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

  async getItemPrice(productName: string): Promise<number> {
    const row = this.page.locator('#tbodyid tr').filter({ hasText: productName });
    const priceText = await row.locator('td').nth(2).innerText();
    return parseInt(priceText.trim(), 10);
  }

  async removeItem(productName: string): Promise<void> {
    const cartReloaded = this.page.waitForResponse('**/viewcart');
    const row = this.page.locator('#tbodyid tr').filter({ hasText: productName });
    await row.getByRole('link', { name: 'Delete' }).click();
    await cartReloaded;
  }

  async waitForItemToDisappear(productName: string): Promise<void> {
    await expect(
      this.page.locator('#tbodyid tr').filter({ hasText: productName })
    ).not.toBeAttached();
  }

  async getTotalPrice(): Promise<number> {
    // viewcart re-renders the whole table and updates #totalp asynchronously,
    // so we retry until it contains a numeric value.
    await expect(this.totalPrice).toHaveText(/\d+/);
    const text = await this.totalPrice.innerText();
    return parseInt(text.trim(), 10);
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

  async getReceiptAmount(): Promise<number> {
    await expect(this.receiptBody).toBeVisible();
    const text = await this.receiptBody.innerText();
    const match = text.match(/Amount:\s*(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async assertCreditCardValidationError(): Promise<void> {
    await expect(
      this.page.locator('#orderModal').getByText('Invalid credit card number')
    ).toBeVisible();
  }

  async closeReceipt(): Promise<void> {
    await expect(this.confirmButton).toBeVisible();
    await this.confirmButton.click();
  }
}
