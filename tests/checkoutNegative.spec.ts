import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage, PurchaseDetails } from '../pages/CartPage';

test.describe('Checkout Negative - Credit Card Validation', () => {
  // This test documents missing validation: Demoblaze accepts any value in the
  // credit card field and completes the purchase without error. The assertion
  // below expresses the expected behavior and will fail until the bug is fixed.
  test('should show a validation error for an invalid credit card number', async ({ page }) => {
    test.fail(true, 'Known bug: Checkout form accepts invalid credit card numbers without validation');

    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    await homePage.navigate();
    await homePage.selectFirstProduct();
    await productPage.addToCart();

    await cartPage.openViaNavMenu();
    await cartPage.placeOrder();

    const invalidPurchaseDetails: PurchaseDetails = {
      name: `Test User ${Date.now()}`,
      country: 'United States',
      city: 'New York',
      creditCard: '1234',
      month: '12',
      year: '2030',
    };

    await cartPage.fillPurchaseForm(invalidPurchaseDetails);
    await cartPage.completePurchase();

    await cartPage.assertCreditCardValidationError();
  });
});
