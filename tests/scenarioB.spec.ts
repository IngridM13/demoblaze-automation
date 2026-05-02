import { test, expect } from './fixtures';
import { HomePage } from '../pages/HomePage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import { validPurchaseDetails } from '../utils/testData';

const TARGET_PRODUCT = 'Samsung galaxy s6';

test.describe('Scenario B - End-to-End Purchase Flow', () => {
  test.afterEach(async ({ authenticatedPage }) => {
    await new CartPage(authenticatedPage).clearCart();
  });

  test('should complete a full purchase for Samsung galaxy s6', async ({ authenticatedPage }) => {
    const homePage = new HomePage(authenticatedPage);
    const productPage = new ProductDetailsPage(authenticatedPage);
    const cartPage = new CartPage(authenticatedPage);

    await homePage.goToHomePage();
    await homePage.selectProduct(TARGET_PRODUCT);

    await productPage.addToCart();

    await cartPage.goToCart();
    await cartPage.placeOrder();

    await cartPage.fillPurchaseForm(validPurchaseDetails);
    await cartPage.completePurchase();

    await cartPage.assertPurchaseSuccess();
    await cartPage.closeReceipt();
  });
});
