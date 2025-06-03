interface Config {
  // Firebase Configuration
  firebase: {
    projectId: string;
    clientEmail: string;
    privateKey: string;
  };

  // Cloudinary Configuration
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };

  // Paystack Configuration
  paystack: {
    secretKey: string;
    publicKey: string;
  };
}

class ConfigValidator {
  private static validateEnvVar(
    name: string,
    value: string | undefined
  ): string {
    if (!value || value.trim() === "") {
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

    // Replace \\n with actual newlines for Firebase private key
    const formattedKey = privateKey.replace(/\\n/g, "\n");

    if (
      !formattedKey.includes("-----BEGIN PRIVATE KEY-----") ||
      !formattedKey.includes("-----END PRIVATE KEY-----")
    ) {
      throw new Error("❌ FIREBASE_PRIVATE_KEY appears to be malformed");
    }

    return formattedKey;
  }

  public static validate(): Config {
    console.log("🔧 Validating environment variables...");

    try {
      const config: Config = {
        firebase: {
          projectId: this.validateEnvVar(
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
          ),
          clientEmail: this.validateEnvVar(
            "FIREBASE_CLIENT_EMAIL",
            process.env.FIREBASE_CLIENT_EMAIL
          ),
          privateKey: this.validateFirebasePrivateKey(
            process.env.FIREBASE_PRIVATE_KEY
          ),
        },
        cloudinary: {
          cloudName: this.validateEnvVar(
            "CLOUDINARY_CLOUD_NAME",
            process.env.CLOUDINARY_CLOUD_NAME
          ),
          apiKey: this.validateEnvVar(
            "CLOUDINARY_API_KEY",
            process.env.CLOUDINARY_API_KEY
          ),
          apiSecret: this.validateEnvVar(
            "CLOUDINARY_API_SECRET",
            process.env.CLOUDINARY_API_SECRET
          ),
        },
        paystack: {
          secretKey: this.validateEnvVar(
            "PAYSTACK_SECRET_KEY",
            process.env.PAYSTACK_SECRET_KEY
          ),
          publicKey: this.validateEnvVar(
            "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
            process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
          ),
        },
      };

      console.log("✅ All environment variables validated successfully");
      console.log("🔧 Configuration loaded for:");
      console.log(`   📦 Firebase Project: ${config.firebase.projectId}`);
      console.log(`   ☁️  Cloudinary Cloud: ${config.cloudinary.cloudName}`);
      console.log(`   💳 Paystack: Configured`);

      return config;
    } catch (error) {
      console.error("💥 Configuration validation failed:");
      console.error(error instanceof Error ? error.message : error);
      console.error("\n📋 Required environment variables:");
      console.error("   🔥 NEXT_PUBLIC_FIREBASE_PROJECT_ID");
      console.error("   🔥 FIREBASE_CLIENT_EMAIL");
      console.error("   🔥 FIREBASE_PRIVATE_KEY");
      console.error("   ☁️  CLOUDINARY_CLOUD_NAME");
      console.error("   ☁️  CLOUDINARY_API_KEY");
      console.error("   ☁️  CLOUDINARY_API_SECRET");
      console.error("   💳 PAYSTACK_SECRET_KEY");
      console.error("\n🔗 Please check your .env.local file\n");

      // In development, we'll throw to stop the application
      // In production, you might want to handle this differently
      throw error;
    }
  }
}

// Validate and export the configuration immediately
export const config = ConfigValidator.validate();

// Export individual configurations for easy access
export const firebaseConfig = config.firebase;
export const cloudinaryConfig = config.cloudinary;
export const paystackConfig = config.paystack;

// Export the full config as default
export default config;
