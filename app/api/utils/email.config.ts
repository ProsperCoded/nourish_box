import * as brevo from "@getbrevo/brevo";

if (!process.env.BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY environment variable is required");
}

// Initialize Brevo API instance
const apiInstance = new brevo.TransactionalEmailsApi();

// Set API key
const apiKey = apiInstance.authentications["apiKey"];
apiKey.apiKey = process.env.BREVO_API_KEY;

export { apiInstance, brevo };
