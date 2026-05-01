import { Page, Locator, expect } from '@playwright/test';

export class AuthPage {
  private readonly signUpUsernameInput: Locator;
  private readonly signUpPasswordInput: Locator;
  private readonly signUpSubmitButton: Locator;
  private readonly loginUsernameInput: Locator;
  private readonly loginPasswordInput: Locator;
  private readonly loginSubmitButton: Locator;
  private readonly loginModal: Locator;

  constructor(private readonly page: Page) {
    this.signUpUsernameInput = page.locator('#sign-username');
    this.signUpPasswordInput = page.locator('#sign-password');
    this.signUpSubmitButton = page.locator('#signInModal').getByRole('button', { name: 'Sign up' });
    this.loginUsernameInput = page.locator('#loginusername');
    this.loginPasswordInput = page.locator('#loginpassword');
    this.loginSubmitButton = page.locator('#logInModal').getByRole('button', { name: 'Log in' });
    this.loginModal = page.locator('#logInModal');
  }

  async signUp(username: string, password: string): Promise<void> {
    await expect(this.signUpUsernameInput).toBeVisible();
    await this.signUpUsernameInput.fill(username);
    await this.signUpPasswordInput.fill(password);

    // The native alert is the only signal demoblaze provides on signup completion.
    const dialogEvent = this.page.waitForEvent('dialog');
    await this.signUpSubmitButton.click();
    const dialog = await dialogEvent;
    expect(dialog.message()).toContain('Sign up successful');
    await dialog.accept();
  }

  async logIn(username: string, password: string): Promise<void> {
    await expect(this.loginUsernameInput).toBeVisible();
    await this.loginUsernameInput.fill(username);
    await this.loginPasswordInput.fill(password);
    await this.loginSubmitButton.click();
    await expect(this.loginModal).not.toBeVisible();
  }
}
