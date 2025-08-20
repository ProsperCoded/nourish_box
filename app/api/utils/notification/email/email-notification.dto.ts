export enum EmailType {
  WELCOME = 'welcome',
  CONTACT = 'contact',
  ORDER = 'order',
  ORDER_STATUS_UPDATE = 'order_status_update',
  ADMIN_ORDER = 'admin_order',
}

export interface EmailNotification {
  type: EmailType;
  to: string[];
  subject?: string; // Optional since we auto-generate from EmailSubjects
  context: Record<string, any>;
}

export const EmailTemplates: Record<EmailType, string> = {
  [EmailType.WELCOME]: 'welcome-email.ejs',
  [EmailType.CONTACT]: 'contact-email.ejs',
  [EmailType.ORDER]: 'order-confirmation.ejs',
  [EmailType.ORDER_STATUS_UPDATE]: 'order-status-update.ejs',
  [EmailType.ADMIN_ORDER]: 'admin-order-notification.ejs',
} as const;
export const EmailSubjects: Record<EmailType, string> = {
  [EmailType.WELCOME]: 'Welcome to Nourish Box',
  [EmailType.CONTACT]: 'New Contact Form Submission',
  [EmailType.ORDER]: 'Order Confirmation',
  [EmailType.ORDER_STATUS_UPDATE]: 'Order Update',
  [EmailType.ADMIN_ORDER]: 'New Order Received',
} as const;
