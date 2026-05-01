import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { AuthPage } from '../pages/AuthPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage, PurchaseDetails } from '../pages/CartPage';

const SAMSUNG = 'Samsung galaxy s6';
const NOKIA = 'Nokia lumia 1520';

test.describe('Full User Journey E2E', () => {
  test('should register, log in, manage cart, and complete a purchase', async ({ page }) => {
    test.setTimeout(60_000);

    const homePage = new HomePage(page);
    const authPage = new AuthPage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    const username = `testuser_${Date.now()}`;
    const password = 'TestPass123!';

    await homePage.navigate();

    await homePage.openSignUp();
    await authPage.signUp(username, password);

    await homePage.openLogIn();
    await authPage.logIn(username, password);
    await homePage.assertLoggedIn(username);

    await homePage.selectProduct(SAMSUNG);
    await productPage.addToCart();

    await homePage.navigate();
    await homePage.selectProduct(NOKIA);
    await productPage.addToCart();

    await cartPage.openViaNavMenu();
    const nokiaPrice = await cartPage.getItemPrice(NOKIA);

    await cartPage.removeItem(SAMSUNG);
    await cartPage.waitForItemToDisappear(SAMSUNG);
    expect(await cartPage.getTotalPrice()).toBe(nokiaPrice);

    const purchaseDetails: PurchaseDetails = {
      name: `Test User ${Date.now()}`,
      country: 'United States',
      city: 'New York',
      creditCard: '4111111111111111',
      month: '12',
      year: '2025',
    };

    await cartPage.placeOrder();
    await cartPage.fillPurchaseForm(purchaseDetails);
    await cartPage.completePurchase();

    await cartPage.assertPurchaseSuccess();
    expect(await cartPage.getReceiptAmount()).toBe(nokiaPrice);

    await cartPage.closeReceipt();
  });
});
