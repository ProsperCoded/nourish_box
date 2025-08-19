import {
  getOrderWithDetailsById,
  updateOrderDeliveryStatus,
} from '@/app/api/adminUtils/order.admin';
import { isAdmin } from '@/app/api/adminUtils/user.admin';
import { DeliveryStatus } from '@/app/utils/types/order.type';
import { NextRequest, NextResponse } from 'next/server';
import { EmailType } from '../../utils/notification/email/email-notification.dto';
import { sendEmailNotification } from '../../utils/notification/email/email-notification.service';

/**
 * PUT endpoint to update order delivery status and send email notification
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, deliveryStatus, userId } = body;

    // Validate required fields
    if (!orderId || !deliveryStatus || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: orderId, deliveryStatus, userId',
        },
        { status: 400 }
      );
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Validate delivery status
    if (!Object.values(DeliveryStatus).includes(deliveryStatus)) {
      return NextResponse.json(
        { success: false, message: 'Invalid delivery status' },
        { status: 400 }
      );
    }

    // Get current order details before updating
    const currentOrder = await getOrderWithDetailsById(orderId);

    if (!currentOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if status is actually changing
    if (currentOrder.deliveryStatus === deliveryStatus) {
      return NextResponse.json(
        { success: false, message: 'Order already has this status' },
        { status: 400 }
      );
    }

    const previousStatus = currentOrder.deliveryStatus;

    // Update order status in database
    await updateOrderDeliveryStatus(orderId, deliveryStatus);

    // Send email notification to customer
    if (currentOrder.user && currentOrder.recipe && currentOrder.delivery) {
      const domain =
        process.env.NEXT_PUBLIC_DOMAIN || 'https://nourish-box.vercel.app';
      const trackingUrl = `${domain}/profile?tab=track`;

      const emailData = {
        customerName: `${currentOrder.user.firstName} ${currentOrder.user.lastName}`,
        customerEmail: currentOrder.user.email,
        orderId: currentOrder.id,
        orderAmount: currentOrder.amount,
        recipes: [
          {
            name: currentOrder.recipe.name,
            price: currentOrder.amount,
          },
        ],
        deliveryAddress: currentOrder.delivery.deliveryAddress,
        deliveryCity: currentOrder.delivery.deliveryCity,
        deliveryState: currentOrder.delivery.deliveryState,
        currentStatus: deliveryStatus,
        previousStatus: previousStatus,
        updatedAt: new Date().toISOString(),
        trackingUrl,
      };

      // Send email notification directly
      try {
        const emailSent = await sendEmailNotification({
          type: EmailType.ORDER_STATUS_UPDATE,
          to: [currentOrder.user.email],
          context: emailData,
        });
        if (!emailSent) {
          console.log(
            'Failed to send email notification, but order status was updated',
            emailData
          );
        }
      } catch (emailError) {
        console.log('Error sending email notification:', emailError);
        // Don't fail the entire request if email fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order status updated and notification sent successfully',
        data: {
          orderId,
          previousStatus,
          currentStatus: deliveryStatus,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update order status',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
