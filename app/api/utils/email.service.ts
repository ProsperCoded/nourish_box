import {
  generateAdminOrderTemplate,
  generateContactEmailTemplate,
  generateCustomerOrderTemplate,
  generateOrderStatusUpdateTemplate,
} from '@/app/api/email/templates';
import { configService, ENV } from '@/app/api/utils/config.env';
import axios from 'axios';

const emailSender = {
  name: 'Nourish Box',
  email: 'enweremproper@gmail.com',
};

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = configService.get(ENV.BREVO_API_KEY);

export interface ContactEmailData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

export interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderAmount: number;
  recipes: Array<{
    name: string;
    price: number;
  }>;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  createdAt: string;
}

export interface OrderStatusUpdateEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderAmount: number;
  recipes: Array<{
    name: string;
    price: number;
  }>;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  currentStatus: string;
  previousStatus: string;
  updatedAt: string;
  trackingUrl: string;
}

/**
 * Send email using Brevo API directly
 */
async function sendBrevoEmail(emailData: {
  to: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
}): Promise<boolean> {
  try {
    if (!BREVO_API_KEY) {
      throw new Error('Brevo API key is not configured');
    }

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

    console.log('Email sent successfully:', response.status);
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

/**
 * Send contact form notification to admins
 */
export async function sendContactNotificationToAdmins(
  contactData: ContactEmailData,
  adminEmails: string[]
): Promise<boolean> {
  try {
    const htmlContent = generateContactEmailTemplate(contactData);

    const emailData = {
      to: adminEmails.map(email => ({ email, name: 'Admin' })),
      subject: `New Contact Form Submission - ${contactData.firstName} ${contactData.lastName}`,
      htmlContent,
      replyTo: {
        email: contactData.email,
        name: `${contactData.firstName} ${contactData.lastName}`,
      },
    };

    const success = await sendBrevoEmail(emailData);
    if (success) {
      console.log(`Contact notification sent to ${adminEmails.length} admins`);
    }
    return success;
  } catch (error: any) {
    console.error('Error sending contact notification to admins:', error);
    return false;
  }
}

/**
 * Send order confirmation to customer
 */
export async function sendOrderConfirmationToCustomer(
  orderData: OrderEmailData
): Promise<boolean> {
  try {
    const htmlContent = generateCustomerOrderTemplate(orderData);

    const emailData = {
      to: [
        {
          email: orderData.customerEmail,
          name: orderData.customerName,
        },
      ],
      subject: `Order Confirmation - #${orderData.orderId
        .slice(-8)
        .toUpperCase()}`,
      htmlContent,
    };

    const success = await sendBrevoEmail(emailData);
    if (success) {
      console.log(
        `Order confirmation sent to customer: ${orderData.customerEmail}`
      );
    }
    return success;
  } catch (error) {
    console.error('Error sending order confirmation to customer:', error);
    return false;
  }
}

/**
 * Send order notification to admins
 */
export async function sendOrderNotificationToAdmins(
  orderData: OrderEmailData,
  adminEmails: string[]
): Promise<boolean> {
  try {
    const htmlContent = generateAdminOrderTemplate(orderData);

    const emailData = {
      to: adminEmails.map(email => ({ email, name: 'Admin' })),
      subject: `New Order Received - #${orderData.orderId
        .slice(-8)
        .toUpperCase()}`,
      htmlContent,
    };

    const success = await sendBrevoEmail(emailData);
    if (success) {
      console.log(`Order notification sent to ${adminEmails.length} admins`);
    }
    return success;
  } catch (error) {
    console.error('Error sending order notification to admins:', error);
    return false;
  }
}

/**
 * Send order status update notification to customer
 */
export async function sendOrderStatusUpdateToCustomer(
  orderData: OrderStatusUpdateEmailData
): Promise<boolean> {
  try {
    const htmlContent = generateOrderStatusUpdateTemplate(orderData);

    const emailData = {
      to: [
        {
          email: orderData.customerEmail,
          name: orderData.customerName,
        },
      ],
      subject: `Order Update: ${orderData.currentStatus.toUpperCase()} - #${orderData.orderId
        .slice(-8)
        .toUpperCase()}`,
      htmlContent,
    };

    const success = await sendBrevoEmail(emailData);
    if (success) {
      console.log(
        `Order status update sent to customer: ${orderData.customerEmail}`
      );
    }
    return success;
  } catch (error) {
    console.error('Error sending order status update to customer:', error);
    return false;
  }
}
