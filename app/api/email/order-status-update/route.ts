import { EmailType } from '@/app/api/utils/notification/email/email-notification.dto';
import { sendEmailNotification } from '@/app/api/utils/notification/email/email-notification.service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'customerName',
      'customerEmail',
      'orderId',
      'orderAmount',
      'recipes',
      'deliveryAddress',
      'deliveryCity',
      'deliveryState',
      'currentStatus',
      'previousStatus',
      'updatedAt',
      'trackingUrl',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate recipes array
    if (!Array.isArray(body.recipes) || body.recipes.length === 0) {
      return NextResponse.json(
        { error: 'Recipes must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate each recipe has required fields
    for (const recipe of body.recipes) {
      if (!recipe.name || typeof recipe.price !== 'number') {
        return NextResponse.json(
          { error: 'Each recipe must have a name and price' },
          { status: 400 }
        );
      }
    }

    const orderData = {
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      orderId: body.orderId,
      orderAmount: body.orderAmount,
      recipes: body.recipes,
      deliveryAddress: body.deliveryAddress,
      deliveryCity: body.deliveryCity,
      deliveryState: body.deliveryState,
      currentStatus: body.currentStatus,
      previousStatus: body.previousStatus,
      updatedAt: body.updatedAt,
      trackingUrl: body.trackingUrl,
    };

    // Send the order status update email
    const success = await sendEmailNotification({
      type: EmailType.ORDER_STATUS_UPDATE,
      to: [body.customerEmail],
      context: orderData,
    });

    if (success) {
      return NextResponse.json(
        {
          message: 'Order status update email sent successfully',
          orderId: orderData.orderId,
          status: orderData.currentStatus,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send order status update email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in order status update email endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
