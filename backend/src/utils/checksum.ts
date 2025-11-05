import { createHash } from 'crypto';

/**
 * Generating checksum as per PhonePe documentation
 * SHA256 base64 encoded payload + API path + salt key
 */
export const generateChecksum = (payload: string, apiPath: string, saltKey: string): string => {
  const stringToHash = payload + apiPath + saltKey;
  return createHash('sha256').update(stringToHash).digest('hex');
};

/**
 * Verifying webhook signature
 */
export const verifyWebhookSignature = (
  payload: string, 
  receivedSignature: string, 
  apiPath: string, 
  saltKey: string
): boolean => {
  const expectedSignature = generateChecksum(payload, apiPath, saltKey);
  return expectedSignature === receivedSignature;
};

/**
 * Encodng payload to base64 its req by phonepe to send requests 
 */
export const encodeToBase64 = (payload: object): string => {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};