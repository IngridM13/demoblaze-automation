import * as fs from 'fs';
import * as path from 'path';
import { Product } from './types';

export function writeProductsToFile(products: Product[], filename = 'products.txt'): void {
  const outputPath = path.resolve(__dirname, '..', filename);
  const lines: string[] = [];

  lines.push('=== DEMOBLAZE PRODUCT LIST ===');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Total products: ${products.length}\n`);

  const groupedProducts: Record<string, Product[]> = {};

  products.forEach(product => {
    let pageNumber = '1';
    let cleanName = product.name;
    
    const pageMatch = product.name.match(/^\[P(\d+)\]\s*(.*)/);
    if (pageMatch) {
      pageNumber = pageMatch[1];
      cleanName = pageMatch[2];
    }

    if (!groupedProducts[pageNumber]) {
      groupedProducts[pageNumber] = [];
    }
    
    groupedProducts[pageNumber].push({ ...product, name: cleanName });
  });

  const allCleanProducts = Object.values(groupedProducts).flat();
  const nameWidth = Math.max(...allCleanProducts.map(p => p.name.length), 12);
  const priceWidth = Math.max(...allCleanProducts.map(p => p.price.length), 7);

  for (const [page, items] of Object.entries(groupedProducts)) {
    lines.push(`----------- Page ${page} -----------`);
    
    const headerName = 'Product Name'.padEnd(nameWidth);
    const headerPrice = 'Price'.padEnd(priceWidth);
    lines.push(`${headerName} | ${headerPrice} | Link`);
    
    const separatorLength = nameWidth + priceWidth + 50; 
    lines.push('-'.repeat(separatorLength));

    items.forEach(product => {
      const nameCol = product.name.padEnd(nameWidth);
      const priceCol = product.price.padEnd(priceWidth);
      lines.push(`${nameCol} | ${priceCol} | ${product.link}`);
    });

    lines.push('\n');
  }

  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
  console.log(`\nFile generated at: ${outputPath}`);
}