export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SVeFQxbj9CScDb',
    priceId: 'price_1RacwZIgHr1G4duPMfjYKRGf',
    name: 'S.A.F.E. Meds',
    description: 'Premium medication safety features and advanced drug interaction checking',
    mode: 'subscription',
    price: 0,
    currency: 'usd',
    interval: 'month',
  },
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};