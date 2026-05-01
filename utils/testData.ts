import { PurchaseDetails } from '../pages/CartPage';

export const validPurchaseDetails: PurchaseDetails = {
  name: 'Test User',
  country: 'United States',
  city: 'New York',
  creditCard: '4111111111111111',
  month: '12',
  year: '2030',
};

export const invalidCreditCardDetails: PurchaseDetails = {
  name: 'Test User',
  country: 'United States',
  city: 'New York',
  creditCard: '1234',
  month: '12',
  year: '2030',
};
