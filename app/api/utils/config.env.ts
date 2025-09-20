// Environment variable names
export enum ENV {
  FIREBASE_PROJECT_ID = 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  FIREBASE_API_KEY = 'NEXT_PUBLIC_FIREBASE_API_KEY',
  FIREBASE_AUTH_DOMAIN = 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  FIREBASE_STORAGE_BUCKET = 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  FIREBASE_MESSAGING_SENDER_ID = 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  FIREBASE_APP_ID = 'NEXT_PUBLIC_FIREBASE_APP_ID',
  FIREBASE_MEASUREMENT_ID = 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  FIREBASE_CLIENT_EMAIL = 'FIREBASE_CLIENT_EMAIL',
  FIREBASE_PRIVATE_KEY = 'FIREBASE_PRIVATE_KEY',
  PAYSTACK_SECRETE_KEY = 'PAYSTACK_SECRETE_KEY',
  PAYSTACK_PUBLIC_KEY = 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
  COMPANY_NAME = 'COMPANY_NAME',
  COMPANY_EMAIL = 'COMPANY_EMAIL',
  BREVO_API_KEY = 'BREVO_API_KEY',
  BREVO_SENDER_EMAIL = 'BREVO_SENDER_EMAIL',
  GOOGLE_CLIENT_ID = 'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  RESEND_API_KEY = 'RESEND_API_KEY',
  RESEND_SENDER_EMAIL = 'RESEND_SENDER_EMAIL',
  NEXT_PUBLIC_APP_URL = 'NEXT_PUBLIC_APP_URL',
  WEBSITE_URL = 'WEBSITE_URL',
}

class ConfigService {
  get(key: ENV) {
    const value = process.env[key];
    return value;
  }
  validateEnv(env: ENV[]) {
    const missingVars = env.filter(value => !this.get(value));
    if (missingVars.length > 0) {
      throw new Error(
        `Missing environment variables: ${missingVars.join(', ')}`
      );
    }
  }
}

// Create a singleton instance of ConfigService
const configService = new ConfigService();

// Validate that all required environment variables are present
// WEBSITE_URL is optional since we provide a fallback
const requiredEnvVars = Object.values(ENV).filter(
  env => env !== ENV.WEBSITE_URL
);
configService.validateEnv(requiredEnvVars);

// Export the configService instance for use in other modules
export { configService };
