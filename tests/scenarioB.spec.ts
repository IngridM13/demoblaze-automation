import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import { validPurchaseDetails } from '../utils/testData';

const TARGET_PRODUCT = 'Samsung galaxy s6';

test.describe('Scenario B - End-to-End Purchase Flow', () => {
  test('should complete a full purchase for Samsung galaxy s6', async ({ page }) => {
    const homePage = new HomePage(page);
    const productPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);

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
