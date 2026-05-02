import { test } from '@playwright/test';
import { allure } from 'allure-playwright';
import { HomePage } from '../pages/HomePage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import { invalidCreditCardDetails } from '../utils/testData';

test.describe('Checkout Negative - Credit Card Validation', () => {
  test('should show a validation error for an invalid credit card number', async ({ page }) => {
    test.fail(true, 'Known bug: Checkout form accepts invalid credit card numbers without validation');

    await allure.tag('known-bug');
    await allure.tag('negative');
    await allure.severity('normal');
    await allure.description(
      'Known bug: the checkout form accepts any value in the credit card field and completes ' +
      'the purchase without validation. This test asserts the expected behavior (a validation error) ' +
      'and is marked with test.fail() so it stays green in CI until the bug is fixed.'
    );

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
