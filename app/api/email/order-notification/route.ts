import { getAllAdminUsers } from '@/app/api/adminUtils/user.admin';
import { ResponseDto } from '@/app/api/response.dto';
import { EmailType } from '@/app/api/utils/notification/email/email-notification.dto';
import { sendEmailNotification } from '@/app/api/utils/notification/email/email-notification.service';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      orderId,
      orderAmount,
      recipes,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      createdAt,
    } = body;

    // Validate required fields
    if (
      !customerName ||
      !customerEmail ||
      !orderId ||
      !orderAmount ||
      !recipes ||
      !deliveryAddress ||
      !deliveryCity ||
      !deliveryState
    ) {
      return ResponseDto.createErrorResponse(
        'Missing required fields for order notification',
        { statusCode: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return ResponseDto.createErrorResponse('Invalid customer email address', {
        statusCode: 400,
      });
    }

    // Validate recipes array
    if (!Array.isArray(recipes) || recipes.length === 0) {
      return ResponseDto.createErrorResponse(
        'Recipes must be provided as a non-empty array',
        { statusCode: 400 }
      );
    }

    // Validate each recipe has required fields
    for (const recipe of recipes) {
      if (!recipe.name || typeof recipe.price !== 'number') {
        return ResponseDto.createErrorResponse(
          'Each recipe must have a name and valid price',
          { statusCode: 400 }
        );
      }
    }

    // Prepare order email data
    const orderData = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      orderId: orderId.trim(),
      orderAmount: Number(orderAmount),
      recipes: recipes.map((recipe: any) => ({
        name: recipe.name.trim(),
        price: Number(recipe.price),
      })),
      deliveryAddress: deliveryAddress.trim(),
      deliveryCity: deliveryCity.trim(),
      deliveryState: deliveryState.trim(),
      createdAt: createdAt || new Date().toISOString(),
    };

    // Send customer confirmation email
    console.log(
      `Sending order confirmation to customer: ${orderData.customerEmail}`
    );
    const customerEmailSent = await sendEmailNotification({
      type: EmailType.ORDER,
      to: [orderData.customerEmail],
      context: orderData,
    });

    // Get admin users and send notification emails
    const adminUsers = await getAllAdminUsers();
    let adminEmailsSent = false;

    if (adminUsers.length > 0) {
      const adminEmails = adminUsers.map(admin => admin.email);
      console.log(
        `Sending order notification to ${adminEmails.length} admins:`,
        adminEmails
      );
      adminEmailsSent = await sendEmailNotification({
        type: EmailType.ADMIN_ORDER,
        to: adminEmails,
        context: orderData,
      });
    } else {
      console.warn('No admin users found to send order notification');
    }

    // Determine response based on email sending results
    if (customerEmailSent && adminEmailsSent) {
      return ResponseDto.createSuccessResponse(
        'Order notifications sent successfully',
        {
          customerNotified: true,
          adminNotified: true,
          notifiedAdmins: adminUsers.length,
          orderId: orderData.orderId,
        }
      );
    } else if (customerEmailSent && !adminEmailsSent) {
      return ResponseDto.createSuccessResponse(
        'Customer notified, but admin notification failed',
        {
          customerNotified: true,
          adminNotified: false,
          notifiedAdmins: 0,
          orderId: orderData.orderId,
        }
      );
    } else if (!customerEmailSent && adminEmailsSent) {
      return ResponseDto.createErrorResponse(
        'Admin notified, but customer notification failed',
        {
          statusCode: 207,
          data: {
            customerNotified: false,
            adminNotified: true,
            notifiedAdmins: adminUsers.length,
            orderId: orderData.orderId,
          },
        }
      );
    } else {
      return ResponseDto.createErrorResponse(
        'Failed to send order notifications',
        {
          statusCode: 500,
          data: {
            customerNotified: false,
            adminNotified: false,
            notifiedAdmins: 0,
            orderId: orderData.orderId,
          },
        }
      );
    }
  } catch (error) {
    console.error('Error sending order notifications:', error);
    return ResponseDto.createErrorResponse(
      'An error occurred while sending order notifications',
      { statusCode: 500 }
    );
  }
}
