import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage, PurchaseDetails } from '../pages/CartPage';

const TARGET_PRODUCT = 'Samsung galaxy s6';

test.describe('Scenario B - End-to-End Purchase Flow', () => {
  test('should complete a full purchase for Samsung galaxy s6', async ({ page }) => {
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    await homePage.navigate();
    await homePage.selectProduct(TARGET_PRODUCT);

    await productPage.addToCart();

    await cartPage.openViaNavMenu();
    await cartPage.placeOrder();

    const purchaseDetails: PurchaseDetails = {
      name: `Test User ${Date.now()}`,
      country: 'United States',
      city: 'New York',
      creditCard: '4111111111111111',
      month: '12',
      year: '2030',
    };

    await cartPage.fillPurchaseForm(purchaseDetails);
    await cartPage.completePurchase();

    await cartPage.assertPurchaseSuccess();
    await cartPage.closeReceipt();
  });
});
