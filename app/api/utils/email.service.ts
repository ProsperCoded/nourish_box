import axios from "axios";
import config from "@/app/api/utils/config.env";

const emailSender = {
  name: "Nourish Box",
  email: "enweremproper@gmail.com",
};

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_API_KEY = config.brevo.apiKey;

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
      throw new Error("Brevo API key is not configured");
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
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
      }
    );

    console.log("Email sent successfully:", response.status);
    return true;
  } catch (error: any) {
    console.error("Error sending email with Brevo:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
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
      to: adminEmails.map((email) => ({ email, name: "Admin" })),
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
    console.error("Error sending contact notification to admins:", error);
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
    console.error("Error sending order confirmation to customer:", error);
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
      to: adminEmails.map((email) => ({ email, name: "Admin" })),
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
    console.error("Error sending order notification to admins:", error);
    return false;
  }
}

/**
 * Generate contact form email template
 */
function generateContactEmailTemplate(data: ContactEmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .info-card { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #6b7280; }
            .message-box { background: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #6b7280; font-size: 14px; }
            .brand { color: #f97316; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🥗 Nourish Box</h1>
            <p>New Contact Form Submission</p>
        </div>
        
        <div class="content">
            <h2>Contact Details</h2>
            <div class="info-card">
                <div class="info-row">
                    <span class="label">Name:</span> 
                    <span class="value">${data.firstName} ${
    data.lastName
  }</span>
                </div>
                <div class="info-row">
                    <span class="label">Email:</span> 
                    <span class="value">${data.email}</span>
                </div>
                <div class="info-row">
                    <span class="label">Phone:</span> 
                    <span class="value">${data.phone}</span>
                </div>
            </div>
            
            <h3>Message</h3>
            <div class="message-box">
                ${data.message.replace(/\n/g, "<br>")}
            </div>
            
            <p><strong>Action Required:</strong> Please respond to this inquiry within 24 hours.</p>
        </div>
        
        <div class="footer">
            <p>This email was sent from the <span class="brand">Nourish Box</span> contact form.</p>
            <p>Reply directly to this email to respond to the customer.</p>
        </div>
    </body>
    </html>
  `;
}

/**
 * Generate customer order confirmation template
 */
function generateCustomerOrderTemplate(data: OrderEmailData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const recipesHtml = data.recipes
    .map(
      (recipe) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${
        recipe.name
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(
        recipe.price
      )}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .order-summary { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #6b7280; }
            .total-row { border-top: 2px solid #f97316; padding-top: 10px; margin-top: 15px; font-weight: bold; font-size: 18px; }
            .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #6b7280; font-size: 14px; }
            .brand { color: #f97316; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; }
            .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🥗 Nourish Box</h1>
            <p>Order Confirmation</p>
        </div>
        
        <div class="content">
            <div style="text-align: center; margin: 20px 0;">
                <span class="success-badge">✓ Order Confirmed</span>
            </div>
            
            <h2>Hi ${data.customerName}!</h2>
            <p>Thank you for your order! We're excited to deliver these delicious recipes to you.</p>
            
            <div class="order-summary">
                <h3>Order Details</h3>
                <div class="info-row">
                    <span class="label">Order ID:</span>
                    <span class="value">#${data.orderId
                      .slice(-8)
                      .toUpperCase()}</span>
                </div>
                <div class="info-row">
                    <span class="label">Order Date:</span>
                    <span class="value">${new Date(
                      data.createdAt
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}</span>
                </div>
                <div class="info-row">
                    <span class="label">Delivery Address:</span>
                    <span class="value">${data.deliveryAddress}, ${
    data.deliveryCity
  }, ${data.deliveryState}</span>
                </div>
            </div>
            
            <h3>Recipes Ordered</h3>
            <table>
                <thead>
                    <tr>
                        <th>Recipe</th>
                        <th style="text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${recipesHtml}
                </tbody>
            </table>
            
            <div class="order-summary">
                <div class="info-row total-row">
                    <span class="label">Total Amount:</span>
                    <span class="value" style="color: #f97316;">${formatCurrency(
                      data.orderAmount
                    )}</span>
                </div>
            </div>
            
            <h3>What's Next?</h3>
            <ul>
                <li>Your recipes will be prepared and delivered within 24-48 hours</li>
                <li>You'll receive a tracking notification once your order is dispatched</li>
                <li>Don't forget to share your cooking experience with us!</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>Thank you for choosing <span class="brand">Nourish Box</span>!</p>
            <p>Questions? Reply to this email or contact our support team.</p>
        </div>
    </body>
    </html>
  `;
}

/**
 * Generate admin order notification template
 */
function generateAdminOrderTemplate(data: OrderEmailData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const recipesHtml = data.recipes
    .map(
      (recipe) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${
        recipe.name
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(
        recipe.price
      )}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Notification</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1f2937, #374151); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .alert-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .customer-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #6b7280; }
            .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #6b7280; font-size: 14px; }
            .brand { color: #f97316; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; }
            .urgent { background: #dc2626; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🛎️ Admin Dashboard</h1>
            <p>New Order Alert</p>
        </div>
        
        <div class="content">
            <div style="text-align: center; margin: 20px 0;">
                <span class="urgent">🚨 ACTION REQUIRED</span>
            </div>
            
            <div class="alert-box">
                <h3>⚡ New Order Received!</h3>
                <p>A new order has been placed and requires immediate attention for processing and delivery preparation.</p>
            </div>
            
            <h3>Customer Information</h3>
            <div class="customer-info">
                <div class="info-row">
                    <span class="label">Customer:</span>
                    <span class="value">${data.customerName}</span>
                </div>
                <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value">${data.customerEmail}</span>
                </div>
                <div class="info-row">
                    <span class="label">Delivery Address:</span>
                    <span class="value">${data.deliveryAddress}, ${
    data.deliveryCity
  }, ${data.deliveryState}</span>
                </div>
            </div>
            
            <h3>Order Details</h3>
            <div class="info-row">
                <span class="label">Order ID:</span>
                <span class="value">#${data.orderId
                  .slice(-8)
                  .toUpperCase()}</span>
            </div>
            <div class="info-row">
                <span class="label">Order Date:</span>
                <span class="value">${new Date(
                  data.createdAt
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</span>
            </div>
            
            <h3>Recipes to Prepare</h3>
            <table>
                <thead>
                    <tr>
                        <th>Recipe</th>
                        <th style="text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${recipesHtml}
                </tbody>
            </table>
            
            <div class="customer-info">
                <div class="info-row" style="font-size: 18px; font-weight: bold;">
                    <span class="label">Total Revenue:</span>
                    <span class="value" style="color: #10b981;">${formatCurrency(
                      data.orderAmount
                    )}</span>
                </div>
            </div>
            
            <div class="alert-box">
                <h4>📋 Next Steps:</h4>
                <ol>
                    <li>Verify payment status in admin dashboard</li>
                    <li>Begin recipe preparation process</li>
                    <li>Update delivery status as items are processed</li>
                    <li>Notify customer of delivery timeline</li>
                </ol>
            </div>
        </div>
        
        <div class="footer">
            <p>This notification was sent from <span class="brand">Nourish Box</span> Admin System</p>
            <p>Please process this order within 2 hours of receipt</p>
        </div>
    </body>
    </html>
  `;
}
