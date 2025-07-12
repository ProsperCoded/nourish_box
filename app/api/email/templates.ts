import {
  ContactEmailData,
  OrderEmailData,
  OrderStatusUpdateEmailData,
} from "@/app/api/utils/email.service";

/**
 * Generate contact form email template for admins
 */
export function generateContactEmailTemplate(data: ContactEmailData): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
            .contact-info { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .contact-info h2 { color: #f97316; margin-top: 0; }
            .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .info-label { font-weight: bold; color: #374151; }
            .info-value { color: #6b7280; }
            .message-section { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .message-section h3 { color: #f97316; margin-top: 0; }
            .message-content { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #f97316; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
            .footer p { margin: 0; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🍽️ New Contact Form Submission</h1>
            <p>Nourish Box - Customer Support</p>
        </div>
        
        <div class="content">
            <div class="contact-info">
                <h2>Contact Information</h2>
                
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${data.firstName} ${
    data.lastName
  }</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${data.email}</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${data.phone}</span>
                </div>
            </div>
            
            <div class="message-section">
                <h3>Message</h3>
                <div class="message-content">
                    ${data.message.replace(/\n/g, "<br>")}
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>This message was sent from the Nourish Box contact form.</p>
            <p>Please respond to the customer as soon as possible.</p>
        </div>
    </body>
    </html>
  `;
}

/**
 * Generate customer order confirmation email template
 */
export function generateCustomerOrderTemplate(data: OrderEmailData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            .order-summary { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .order-summary h2 { color: #f97316; margin-top: 0; }
            .order-id { font-size: 18px; font-weight: bold; color: #f97316; }
            .recipes-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .recipes-table th { background: #f97316; color: white; padding: 12px; text-align: left; }
            .recipes-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
            .total-row { background: #fef3c7; font-weight: bold; }
            .delivery-info { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .delivery-info h3 { color: #0369a1; margin-top: 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
            .footer p { margin: 0; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🍽️ Order Confirmation</h1>
            <p>Thank you for your order!</p>
        </div>
        
        <div class="content">
            <div class="order-summary">
                <h2>Order Summary</h2>
                <p>Dear ${data.customerName},</p>
                <p>Your order has been successfully placed!</p>
                <p class="order-id">Order ID: #${data.orderId
                  .slice(-8)
                  .toUpperCase()}</p>
                <p>Order Date: ${formatDate(data.createdAt)}</p>
            </div>
            
            <table class="recipes-table">
                <thead>
                    <tr>
                        <th>Recipe</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${recipesHtml}
                    <tr class="total-row">
                        <td><strong>Total Amount</strong></td>
                        <td style="text-align: right;"><strong>${formatCurrency(
                          data.orderAmount
                        )}</strong></td>
                    </tr>
                </tbody>
            </table>
            
            <div class="delivery-info">
                <h3>🚚 Delivery Information</h3>
                <p><strong>Address:</strong> ${data.deliveryAddress}</p>
                <p><strong>City:</strong> ${data.deliveryCity}</p>
                <p><strong>State:</strong> ${data.deliveryState}</p>
            </div>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #059669; margin-top: 0;">📱 What's Next?</h3>
                <p>• Your order is being prepared by our chefs</p>
                <p>• You'll receive updates via email as your order progresses</p>
                <p>• Track your order anytime on our website</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for choosing Nourish Box!</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </body>
    </html>
  `;
}

/**
 * Generate admin order notification email template
 */
export function generateAdminOrderTemplate(data: OrderEmailData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .order-alert { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
            .order-alert h2 { color: #dc2626; margin-top: 0; }
            .order-id { font-size: 18px; font-weight: bold; color: #dc2626; }
            .customer-info { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .customer-info h3 { color: #0369a1; margin-top: 0; }
            .recipes-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .recipes-table th { background: #dc2626; color: white; padding: 12px; text-align: left; }
            .recipes-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
            .total-row { background: #fef2f2; font-weight: bold; }
            .delivery-info { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .delivery-info h3 { color: #f59e0b; margin-top: 0; }
            .action-required { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .action-required h3 { color: #059669; margin-top: 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
            .footer p { margin: 0; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚨 New Order Alert</h1>
            <p>Nourish Box Admin Panel</p>
        </div>
        
        <div class="content">
            <div class="order-alert">
                <h2>📋 Order Details</h2>
                <p class="order-id">Order ID: #${data.orderId
                  .slice(-8)
                  .toUpperCase()}</p>
                <p>Order Date: ${formatDate(data.createdAt)}</p>
                <p><strong>Total Amount: ${formatCurrency(
                  data.orderAmount
                )}</strong></p>
            </div>
            
            <div class="customer-info">
                <h3>👤 Customer Information</h3>
                <p><strong>Name:</strong> ${data.customerName}</p>
                <p><strong>Email:</strong> ${data.customerEmail}</p>
            </div>
            
            <table class="recipes-table">
                <thead>
                    <tr>
                        <th>Recipe Ordered</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${recipesHtml}
                    <tr class="total-row">
                        <td><strong>Total Amount</strong></td>
                        <td style="text-align: right;"><strong>${formatCurrency(
                          data.orderAmount
                        )}</strong></td>
                    </tr>
                </tbody>
            </table>
            
            <div class="delivery-info">
                <h3>🚚 Delivery Details</h3>
                <p><strong>Address:</strong> ${data.deliveryAddress}</p>
                <p><strong>City:</strong> ${data.deliveryCity}</p>
                <p><strong>State:</strong> ${data.deliveryState}</p>
            </div>
            
            <div class="action-required">
                <h3>⚡ Action Required</h3>
                <p>• Log in to the admin panel to manage this order</p>
                <p>• Prepare the recipes for delivery</p>
                <p>• Update the order status as needed</p>
                <p>• Contact the customer if you have any questions</p>
            </div>
        </div>
        
        <div class="footer">
            <p>This notification was sent from the Nourish Box order system.</p>
            <p>Please process this order as soon as possible.</p>
        </div>
    </body>
    </html>
  `;
}

/**
 * Generate order status update email template
 */
export function generateOrderStatusUpdateTemplate(
  data: OrderStatusUpdateEmailData
): string {
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

  // Get status-specific styling and messaging
  const getStatusInfo = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return {
          emoji: "⏳",
          color: "#f59e0b",
          bgColor: "#fef3c7",
          title: "Order Confirmed - Preparing Your Recipes",
          message:
            "Your order is being processed and will be prepared shortly.",
          actionText: "Your recipes are being prepared by our chefs.",
        };
      case "packed":
        return {
          emoji: "📦",
          color: "#3b82f6",
          bgColor: "#dbeafe",
          title: "Order Packed - Ready for Delivery",
          message: "Your recipes have been prepared and packed for delivery.",
          actionText: "Your order is ready and will be dispatched soon.",
        };
      case "in_transit":
        return {
          emoji: "🚚",
          color: "#8b5cf6",
          bgColor: "#ede9fe",
          title: "Order In Transit - On the Way to You",
          message: "Your order is currently being delivered to your location.",
          actionText: `Your delivery person will arrive soon. Show them this Order ID: <strong style="background: #fef3c7; padding: 4px 8px; border-radius: 4px; color: #92400e;">#${data.orderId
            .slice(-8)
            .toUpperCase()}</strong>`,
        };
      case "delivered":
        return {
          emoji: "✅",
          color: "#10b981",
          bgColor: "#d1fae5",
          title: "Order Delivered - Enjoy Your Meal!",
          message: "Your order has been successfully delivered.",
          actionText:
            "We hope you enjoy cooking and eating your delicious recipes!",
        };
      case "failed":
        return {
          emoji: "❌",
          color: "#ef4444",
          bgColor: "#fee2e2",
          title: "Delivery Issue - Please Contact Support",
          message: "There was an issue with your delivery.",
          actionText: "Please contact our support team for assistance.",
        };
      default:
        return {
          emoji: "📋",
          color: "#6b7280",
          bgColor: "#f3f4f6",
          title: "Order Status Updated",
          message: `Your order status has been updated to: ${status}`,
          actionText: "Thank you for your patience.",
        };
    }
  };

  const statusInfo = getStatusInfo(data.currentStatus);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .status-update { background: ${
              statusInfo.bgColor
            }; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${
    statusInfo.color
  }; }
            .status-update h2 { color: ${
              statusInfo.color
            }; margin-top: 0; font-size: 20px; }
            .status-emoji { font-size: 24px; margin-right: 10px; }
            .order-summary { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .order-summary h3 { color: #374151; margin-top: 0; }
            .order-id { font-size: 18px; font-weight: bold; color: #f97316; }
            .recipes-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .recipes-table th { background: #f97316; color: white; padding: 12px; text-align: left; }
            .recipes-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
            .total-row { background: #fef3c7; font-weight: bold; }
            .delivery-info { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .delivery-info h3 { color: #0369a1; margin-top: 0; }
            .track-button { background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 20px 0; }
            .track-button:hover { background: #ea580c; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
            .footer p { margin: 0; color: #6b7280; font-size: 14px; }
            @media (max-width: 600px) {
              .track-button { display: block; text-align: center; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${statusInfo.emoji} Order Status Update</h1>
            <p>Nourish Box - Order Tracking</p>
        </div>
        
        <div class="content">
            <div class="status-update">
                <h2><span class="status-emoji">${statusInfo.emoji}</span>${
    statusInfo.title
  }</h2>
                <p><strong>${statusInfo.message}</strong></p>
                <p>${statusInfo.actionText}</p>
            </div>
            
            <div class="order-summary">
                <h3>📋 Order Summary</h3>
                <p class="order-id">Order ID: #${data.orderId
                  .slice(-8)
                  .toUpperCase()}</p>
                <p><strong>Customer:</strong> ${data.customerName}</p>
                <p><strong>Updated:</strong> ${new Date(
                  data.updatedAt
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</p>
            </div>
            
            <table class="recipes-table">
                <thead>
                    <tr>
                        <th>Recipe</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${recipesHtml}
                    <tr class="total-row">
                        <td><strong>Total Amount</strong></td>
                        <td style="text-align: right;"><strong>${formatCurrency(
                          data.orderAmount
                        )}</strong></td>
                    </tr>
                </tbody>
            </table>
            
            <div class="delivery-info">
                <h3>🚚 Delivery Information</h3>
                <p><strong>Address:</strong> ${data.deliveryAddress}</p>
                <p><strong>City:</strong> ${data.deliveryCity}</p>
                <p><strong>State:</strong> ${data.deliveryState}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${
                  data.trackingUrl
                }" class="track-button">Track Your Order</a>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for choosing Nourish Box!</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </body>
    </html>
  `;
}
