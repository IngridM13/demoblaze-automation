import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import { invalidCreditCardDetails } from '../utils/testData';

test.describe('Checkout Negative - Credit Card Validation', () => {
  // This test documents missing validation: Demoblaze accepts any value in the
  // credit card field and completes the purchase without error. The assertion
  // below expresses the expected behavior and will fail until the bug is fixed.
  test('should show a validation error for an invalid credit card number', async ({ page }) => {
    test.fail(true, 'Known bug: Checkout form accepts invalid credit card numbers without validation');

    const homePage = new HomePage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);

    await homePage.goToHomePage();
    await homePage.selectFirstProduct();
    await productDetailsPage.addToCart();

    await cartPage.goToCart();
    await cartPage.placeOrder();

    await cartPage.fillPurchaseForm(invalidCreditCardDetails);
    await cartPage.completePurchase();

    await cartPage.assertCreditCardValidationError();
  });
});
