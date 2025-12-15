export interface IBillingFrequency {
    value: string;
    label: string;
    priceSuffix: string;
  }
  
  export const BillingFrequency: IBillingFrequency[] = [
    { value: '3months', label: '3 months', priceSuffix: 'per user/3 months' },
    { value: '6months', label: '6 months', priceSuffix: 'per user/6 months' },
    { value: '12months', label: '1 year', priceSuffix: 'per user/year' },
  ];