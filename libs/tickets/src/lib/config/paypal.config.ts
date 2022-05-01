export type PayPalConfig = {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  mode: 'sandbox' | 'live';
}
