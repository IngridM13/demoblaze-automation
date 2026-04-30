import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { writeProductsToFile } from '../utils/fileHelper';
import { Product } from '../utils/types';

test.describe('Scenario A - Product Catalog', () => {
  test('should extract products from page 1 and page 2 and generate products.txt', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.navigate();
    await expect(page).toHaveURL(/demoblaze\.com/);

    const page1Products: Product[] = await homePage.getVisibleProducts();
    expect(page1Products.length).toBeGreaterThan(0);

    for (const product of page1Products) {
      expect(product.name).not.toBe('');
      expect(product.price).not.toBe('');
      expect(product.link).toContain('demoblaze.com');
    }

    const isNextButtonVisible = await homePage.isNextButtonVisible();
    expect(isNextButtonVisible).toBe(true);
    
    await homePage.goToNextPage();

    const page2Products: Product[] = await homePage.getVisibleProducts();
    expect(page2Products.length).toBeGreaterThan(0);

    const page1Names = page1Products.map(p => p.name);
    const page2Names = page2Products.map(p => p.name);
    const overlappingProducts = page2Names.filter(name => page1Names.includes(name));
    
    expect(overlappingProducts.length).toBe(0);

    const allProducts: Product[] = [
      ...page1Products.map(p => ({ ...p, name: `[P1] ${p.name}` })),
      ...page2Products.map(p => ({ ...p, name: `[P2] ${p.name}` })),
    ];

    writeProductsToFile(allProducts);

    expect(allProducts.length).toBe(page1Products.length + page2Products.length);
  });
});