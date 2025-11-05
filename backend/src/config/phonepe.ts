export const phonepeConfig = {
  merchantId: process.env.PHONEPE_MERCHANT_ID,
  saltKey: process.env.PHONEPE_SALT_KEY,
  saltIndex: parseInt(process.env.PHONEPE_SALT_INDEX || '1'),
  clientId: process.env.PHONEPE_CLIENT_ID,
  clientSecret: process.env.PHONEPE_CLIENT_SECRET,
  baseUrl: process.env.PHONEPE_BASE_URL,
  redirectUrl: process.env.PHONEPE_REDIRECT_URL,
  callbackUrl: process.env.PHONEPE_CALLBACK_URL,
};

export const validateConfig = () => {
  const required = [
    'merchantId', 'saltKey', 'clientId', 'clientSecret', 'baseUrl'
  ];
  
  const missing = required.filter(field => !phonepeConfig[field as keyof typeof phonepeConfig]);
  
  if (missing.length > 0) {
    console.log('  PhonePe configuration missing:', missing.join(', '));
    console.log(' Using demo mode until credentials are configured');
    return false;
  }
  
  console.log(' Phn-pe configuration validated');
  return true;
};