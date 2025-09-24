import { configService, ENV } from '@/app/api/utils/config.env';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import {
  EmailSubjects,
  EmailTemplates,
  EmailType,
} from './email-notification.dto';

export class EmailRenderService {
  private templatesPath: string;

  constructor() {
    this.templatesPath = path.join(process.cwd(), 'app/api/templates/email');
  }

  /**
   * Render email template with context data
   */
  async renderTemplate(
    emailType: EmailType,
    context: Record<string, any>
  ): Promise<string> {
    try {
      const templateFileName = EmailTemplates[emailType];
      const templatePath = path.join(this.templatesPath, templateFileName);

      // Check if template file exists
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`);
      }

      // Inject company information into context
      const enrichedContext = {
        ...context,
        companyName: configService.get(ENV.COMPANY_NAME) || 'Nourish Box',
        companyEmail:
          configService.get(ENV.COMPANY_EMAIL) || 'hello@nourishboxng.com.com',
        websiteUrl:
          // configService.get(ENV.NEXT_PUBLIC_APP_URL) ||
          'https://nourishboxng.co',
      };

      // Render the template
      const html = await ejs.renderFile(templatePath, enrichedContext);
      return html;
    } catch (error: any) {
      console.error('Error rendering email template:', error);
      throw new Error(`Failed to render email template: ${error.message}`);
    }
  }

  /**
   * Get subject line based on email type and context
   */
  getSubject(emailType: EmailType, context: Record<string, any>): string {
    const baseSubject = EmailSubjects[emailType];
    const companyName = configService.get(ENV.COMPANY_NAME) || 'Nourish Box';

    switch (emailType) {
      case EmailType.WELCOME:
        return `${baseSubject} - ${companyName}`;

      case EmailType.CONTACT:
        return `${baseSubject} - ${context.firstName} ${context.lastName}`;

      case EmailType.ORDER:
        return `${baseSubject} - #${context.orderId?.slice(-8)?.toUpperCase() || 'N/A'}`;

      case EmailType.ADMIN_ORDER:
        return `${baseSubject} - #${context.orderId?.slice(-8)?.toUpperCase() || 'N/A'}`;

      case EmailType.ORDER_STATUS_UPDATE:
        return `${baseSubject}: ${context.currentStatus?.toUpperCase()} - #${context.orderId?.slice(-8)?.toUpperCase() || 'N/A'}`;

      default:
        return `${companyName} Notification`;
    }
  }
}

// Export singleton instance
export const emailRenderService = new EmailRenderService();
