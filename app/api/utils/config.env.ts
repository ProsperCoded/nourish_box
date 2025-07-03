// Types
interface Config {
  firebase: FirebaseConfig;
  cloudinary: CloudinaryConfig;
  paystack: PaystackConfig;
  brevo: BrevoConfig;
}

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
  clientEmail: string;
  privateKey: string;
}

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

interface PaystackConfig {
  secretKey: string;
  publicKey: string;
}

interface BrevoConfig {
  apiKey: string;
}

// Environment variable names
const ENV_VARS = {
  firebase: {
    apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
    authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
    measurementId: "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
    clientEmail: "FIREBASE_CLIENT_EMAIL",
    privateKey: "FIREBASE_PRIVATE_KEY",
  },
  cloudinary: {
    cloudName: "CLOUDINARY_CLOUD_NAME",
    apiKey: "CLOUDINARY_API_KEY",
    apiSecret: "CLOUDINARY_API_SECRET",
  },
  paystack: {
    secretKey: "PAYSTACK_SECRETE_KEY",
    publicKey: "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
  },
  brevo: {
    apiKey: "BREVO_API_KEY",
  },
} as const;

class ConfigValidator {
  private static validateEnvVar(
    name: string,
    value: string | undefined
  ): string {
    if (!value?.trim()) {
      throw new Error(`❌ Missing required environment variable: ${name}`);
    }
    return value.trim();
  }

  private static validateFirebasePrivateKey(
    privateKey: string | undefined
  ): string {
    if (!privateKey) {
      throw new Error(
        "❌ Missing required environment variable: FIREBASE_PRIVATE_KEY"
      );
    }

    const formattedKey = privateKey.replace(/\\n/g, "\n");
    if (
      !formattedKey.includes("-----BEGIN PRIVATE KEY-----") ||
      !formattedKey.includes("-----END PRIVATE KEY-----")
    ) {
      throw new Error("❌ FIREBASE_PRIVATE_KEY appears to be malformed");
    }

    return formattedKey;
  }

  private static validateFirebaseConfig(): FirebaseConfig {
    return {
      apiKey: this.validateEnvVar(
        ENV_VARS.firebase.apiKey,
        process.env[ENV_VARS.firebase.apiKey]
      ),
      authDomain: this.validateEnvVar(
        ENV_VARS.firebase.authDomain,
        process.env[ENV_VARS.firebase.authDomain]
      ),
      projectId: this.validateEnvVar(
        ENV_VARS.firebase.projectId,
        process.env[ENV_VARS.firebase.projectId]
      ),
      storageBucket: this.validateEnvVar(
        ENV_VARS.firebase.storageBucket,
        process.env[ENV_VARS.firebase.storageBucket]
      ),
      messagingSenderId: this.validateEnvVar(
        ENV_VARS.firebase.messagingSenderId,
        process.env[ENV_VARS.firebase.messagingSenderId]
      ),
      appId: this.validateEnvVar(
        ENV_VARS.firebase.appId,
        process.env[ENV_VARS.firebase.appId]
      ),
      measurementId: this.validateEnvVar(
        ENV_VARS.firebase.measurementId,
        process.env[ENV_VARS.firebase.measurementId]
      ),
      clientEmail: this.validateEnvVar(
        ENV_VARS.firebase.clientEmail,
        process.env[ENV_VARS.firebase.clientEmail]
      ),
      privateKey: this.validateFirebasePrivateKey(
        process.env[ENV_VARS.firebase.privateKey]
      ),
    };
  }

  private static validateCloudinaryConfig(): CloudinaryConfig {
    return {
      cloudName: this.validateEnvVar(
        ENV_VARS.cloudinary.cloudName,
        process.env[ENV_VARS.cloudinary.cloudName]
      ),
      apiKey: this.validateEnvVar(
        ENV_VARS.cloudinary.apiKey,
        process.env[ENV_VARS.cloudinary.apiKey]
      ),
      apiSecret: this.validateEnvVar(
        ENV_VARS.cloudinary.apiSecret,
        process.env[ENV_VARS.cloudinary.apiSecret]
      ),
    };
  }

  private static validatePaystackConfig(): PaystackConfig {
    return {
      secretKey: this.validateEnvVar(
        ENV_VARS.paystack.secretKey,
        process.env[ENV_VARS.paystack.secretKey]
      ),
      publicKey: this.validateEnvVar(
        ENV_VARS.paystack.publicKey,
        process.env[ENV_VARS.paystack.publicKey]
      ),
    };
  }

  private static validateBrevoConfig(): BrevoConfig {
    return {
      apiKey: this.validateEnvVar(
        ENV_VARS.brevo.apiKey,
        process.env[ENV_VARS.brevo.apiKey]
      ),
    };
  }
  public static validate(): Config {
    console.log("🔧 Validating environment variables...");

    try {
      const config: Config = {
        firebase: this.validateFirebaseConfig(),
        cloudinary: this.validateCloudinaryConfig(),
        paystack: this.validatePaystackConfig(),
        brevo: this.validateBrevoConfig(),
      };

      console.log("✅ All environment variables validated successfully");
      return config;
    } catch (error) {
      console.error("💥 Configuration validation failed:");
      throw error;
    }
  }
}

// Initialize and export configurations
const config = ConfigValidator.validate();
export const firebaseConfig = config.firebase;
export const cloudinaryConfig = config.cloudinary;
export const paystackConfig = config.paystack;
export default config;
