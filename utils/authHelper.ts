import { Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { AuthPage } from '../pages/AuthPage';

export async function signUp(page: Page, username: string, password: string): Promise<void> {
  const homePage = new HomePage(page);
  const authPage = new AuthPage(page);

  await homePage.openSignUp();
  await authPage.signUp(username, password);
}

export async function logIn(page: Page, username: string, password: string): Promise<void> {
  const homePage = new HomePage(page);
  const authPage = new AuthPage(page);

  await homePage.openLogIn();
  await authPage.logIn(username, password);
  await homePage.assertLoggedIn(username);
}
