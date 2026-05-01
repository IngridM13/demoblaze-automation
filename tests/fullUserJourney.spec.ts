import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import { validPurchaseDetails } from '../utils/testData';
import { signUp, logIn } from '../utils/authHelper';

const SAMSUNG = 'Samsung galaxy s6';
const NOKIA = 'Nokia lumia 1520';

test.describe('Full User Journey E2E', () => {
  test('should register, log in, manage cart, and complete a purchase', async ({ page }) => {
    test.setTimeout(60_000);

    const homePage = new HomePage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);

    const username = `testuser_${Date.now()}`;
    const password = 'TestPass123!';

    await homePage.goToHomePage();
    await signUp(page, username, password);
    await logIn(page, username, password);

    await homePage.selectProduct(SAMSUNG);
    await productDetailsPage.addToCart();

    await homePage.goToHomePage();
    await homePage.selectProduct(NOKIA);
    await productDetailsPage.addToCart();

    await cartPage.goToCart();
    const nokiaPrice = await cartPage.getItemPrice(NOKIA);

    await cartPage.removeItem(SAMSUNG);
    await cartPage.waitForItemToDisappear(SAMSUNG);
    expect(await cartPage.getTotalPrice()).toBe(nokiaPrice);

    await cartPage.placeOrder();
    await cartPage.fillPurchaseForm(validPurchaseDetails);
    await cartPage.completePurchase();

    await cartPage.assertPurchaseSuccess();
    expect(await cartPage.getReceiptAmount()).toBe(nokiaPrice);

    await cartPage.closeReceipt();
  });
});
