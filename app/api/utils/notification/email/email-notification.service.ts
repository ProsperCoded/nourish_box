import { configService, ENV } from '@/app/api/utils/config.env';
import axios from 'axios';
import { Resend } from 'resend';
import { EmailNotification, EmailType } from './email-notification.dto';
import { emailRenderService } from './email-render.service';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = configService.get(ENV.BREVO_API_KEY);
const RESEND_API_KEY = configService.get(ENV.RESEND_API_KEY);

// Email provider interface for abstraction
type EmailData = {
  to: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
};

interface EmailProvider {
  name: string;
  send(emailData: EmailData): Promise<boolean>;
}

// Initialize Resend client
const resend = new Resend(RESEND_API_KEY);

/**
 * Send email using Resend API
 */
export async function sendResendEmail(emailData: EmailData): Promise<boolean> {
  try {
    if (!RESEND_API_KEY) {
      throw new Error('Resend API key is not configured');
    }

    // Get sender email from environment or use default
    const fromEmail =
      configService.get(ENV.RESEND_SENDER_EMAIL) || 'hello@resend.dev';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: emailData.to.map(recipient => recipient.email),
      subject: emailData.subject,
      html: emailData.htmlContent,
      replyTo: emailData.replyTo?.email,
    });

    if (error) {
      console.error('Error sending email with Resend:', error);
      return false;
    }

    console.log('Email sent successfully with Resend:', data?.id);
    return true;
  } catch (error: any) {
    console.error('Error sending email with Resend:', error);
    return false;
  }
}

/**
 * Send email using Brevo API directly
 */
async function sendBrevoEmail(emailData: EmailData): Promise<boolean> {
  try {
    if (!BREVO_API_KEY) {
      throw new Error('Brevo API key is not configured');
    }

    // Get sender info from environment or use defaults
    const emailSender = {
      name: configService.get(ENV.COMPANY_NAME) || 'Nourish Box',
      email:
        configService.get(ENV.BREVO_SENDER_EMAIL) || 'enweremproper@gmail.com',
    };

    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: emailSender,
        to: emailData.to,
        subject: emailData.subject,
        htmlContent: emailData.htmlContent,
        replyTo: emailData.replyTo,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': BREVO_API_KEY,
        },
      }
    );

    console.log('Email sent successfully with Brevo:', response.status);
    return true;
  } catch (error: any) {
    console.error('Error sending email with Brevo:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Email providers with fallback logic - Resend is primary, Brevo is fallback
const emailProviders: EmailProvider[] = [
  {
    name: 'Resend',
    send: sendResendEmail,
  },
  {
    name: 'Brevo',
    send: sendBrevoEmail,
  },
];

/**
 * Send email with fallback providers
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  for (const provider of emailProviders) {
    try {
      console.log(`Attempting to send email with ${provider.name}...`);
      const success = await provider.send(emailData);

      if (success) {
        console.log(`Email sent successfully with ${provider.name}`);
        return true;
      }

      console.log(`${provider.name} failed, trying next provider...`);
    } catch (error) {
      console.error(`${provider.name} provider error:`, error);
      continue;
    }
  }

  console.error('All email providers failed');
  return false;
}

/**
 * Send email notification using the flexible EmailNotification system
 */
export async function sendEmailNotification(
  emailNotification: EmailNotification
): Promise<boolean> {
  try {
    // Render the email template
    const htmlContent = await emailRenderService.renderTemplate(
      emailNotification.type,
      emailNotification.context
    );

    // Generate subject if not provided
    const subject =
      emailNotification.subject ||
      emailRenderService.getSubject(
        emailNotification.type,
        emailNotification.context
      );

    // Prepare recipient data
    const to = emailNotification.to.map(email => ({
      email,
      name:
        emailNotification.context.customerName ||
        emailNotification.context.firstName ||
        'Valued Customer',
    }));

    // Prepare reply-to for contact emails
    let replyTo;
    if (emailNotification.type === EmailType.CONTACT) {
      replyTo = {
        email: emailNotification.context.email,
        name: `${emailNotification.context.firstName} ${emailNotification.context.lastName}`,
      };
    }

    const emailData = {
      to,
      subject,
      htmlContent,
      replyTo,
    };

    const success = await sendEmail(emailData);
    if (success) {
      console.log(
        `${emailNotification.type} email sent to ${emailNotification.to.length} recipients`
      );
    }
    return success;
  } catch (error: any) {
    console.error(`Error sending ${emailNotification.type} email:`, error);
    return false;
  }
}
