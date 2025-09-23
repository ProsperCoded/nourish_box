import { getDeliveryById } from '@/app/api/adminUtils/delivery.admin';
import { createOrder } from '@/app/api/adminUtils/order.admin';
import { getRecipeById } from '@/app/api/adminUtils/recipie.admin';
import {
  getTransactionByReference,
  updateTransaction,
} from '@/app/api/adminUtils/transaction.admin';
import { getAllAdminUsers, getUserById } from '@/app/api/adminUtils/user.admin';
import { ResponseDto } from '@/app/api/response.dto';
import { EmailType } from '@/app/api/utils/notification/email/email-notification.dto';
import { sendEmailNotification } from '@/app/api/utils/notification/email/email-notification.service';
import { DeliveryStatus, Order } from '@/app/utils/types/order.type';
import { TransactionStatus } from '@/app/utils/types/transaction.type';
import { NextRequest } from 'next/server';
import { configService, ENV } from '../../utils/config.env';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');
  const transactionId = searchParams.get('transactionId');
  if (!reference || !transactionId) {
    return ResponseDto.createErrorResponse(
      'reference or transactionId is required',
      {
        statusCode: 400,
      }
    );
  }

  try {
    // Get transaction from database by reference
    const transaction = await getTransactionByReference(reference);
    if (!transaction) {
      return ResponseDto.createErrorResponse('Transaction not found', {
        statusCode: 404,
      });
    }

    // Verify payment with Paystack
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${configService.get(ENV.PAYSTACK_SECRETE_KEY)}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok) {
      console.error('Paystack verification failed:', paystackData);
      return ResponseDto.createErrorResponse(
        paystackData.message || 'Payment verification failed',
        { statusCode: 400 }
      );
    }

    // Check if payment was successful
    const isSuccessful =
      paystackData.status && paystackData.data.status === 'success';

    if (isSuccessful) {
      // Update transaction status to successful
      await updateTransaction(transaction.id!, {
        status: TransactionStatus.SUCCESS,
        paymentMethod: paystackData.data.channel || 'card',
        paymentDate: paystackData.data.paid_at || new Date().toISOString(),
      });

      // Calculate total amount from all recipes with quantities
      const recipePromises = transaction.recipes.map(
        async (recipeItem: { recipeId: string; quantity: number }) => {
          const recipe = await getRecipeById(recipeItem.recipeId);
          return recipe ? recipe.price * recipeItem.quantity : 0;
        }
      );

      const recipePrices = await Promise.all(recipePromises);
      const totalAmount = recipePrices.reduce((sum, price) => sum + price, 0);

      // Create a single order with multiple recipes
      const orderData: Partial<Order> = {
        ...(transaction.userId && { userId: transaction.userId }),
        recipeIds: transaction.recipes, // Array of recipe IDs
        amount: totalAmount, // Total amount for all recipes
        deliveryId: transaction.deliveryId,
        deliveryStatus: DeliveryStatus.PENDING,
        deliveryDate: '', // Will be set when delivered
        deliveryDurationRange: '2-3 days',
        transactionId: transaction.id!,
      };

      let orderResult;
      try {
        orderResult = await createOrder(orderData);
        const totalQuantity = transaction.recipes.reduce(
          (sum: number, item: { recipeId: string; quantity: number }) =>
            sum + item.quantity,
          0
        );
        console.log(
          `Order created with ${transaction.recipes.length} unique recipes (${totalQuantity} total items): ${orderResult.id}`
        );
      } catch (error) {
        console.error('Error creating order:', error);
        throw error;
      }

      // Send email notifications after successful order creation
      if (orderResult) {
        try {
          // Get delivery information
          const delivery = await getDeliveryById(transaction.deliveryId);

          // Get user information if transaction has userId
          let user: any = null;
          if (transaction.userId) {
            user = await getUserById(transaction.userId);
          }

          // Get recipe details for email
          const recipePromises = transaction.recipes.map(
            async (recipeItem: { recipeId: string; quantity: number }) => {
              const recipe = await getRecipeById(recipeItem.recipeId);
              return recipe
                ? {
                    name: recipe.name,
                    price: recipe.price,
                    quantity: recipeItem.quantity,
                    totalPrice: recipe.price * recipeItem.quantity,
                  }
                : null;
            }
          );

          const recipes = (await Promise.all(recipePromises)).filter(
            recipe => recipe !== null
          );

          if (delivery && recipes.length > 0) {
            // Prepare order email data
            const orderEmailData = {
              customerName: delivery.deliveryName,
              customerEmail: delivery.deliveryEmail,
              customerPhone: delivery.deliveryPhone || null,
              orderId: orderResult.id,
              orderAmount: totalAmount,
              recipes: recipes,
              deliveryAddress: delivery.deliveryAddress,
              deliveryCity: delivery.deliveryCity,
              deliveryState: delivery.deliveryState,
              createdAt: new Date().toISOString(),
            };

            // Send customer confirmation email
            console.log(
              `Sending order confirmation to customer: ${delivery.deliveryEmail}`
            );
            const customerEmailSent = await sendEmailNotification({
              type: EmailType.ORDER,
              to: [delivery.deliveryEmail],
              context: orderEmailData,
            });

            if (!customerEmailSent) {
              console.error('Failed to send order confirmation to customer');
            }

            // Send admin notification emails
            const adminUsers = await getAllAdminUsers();
            if (adminUsers.length > 0) {
              const adminEmails = adminUsers
                .map(admin => admin.email)
                .filter(email => !!email);

              if (adminEmails.length > 0) {
                console.log(
                  `Sending order notification to ${adminEmails.length} admins`
                );
                const adminEmailSent = await sendEmailNotification({
                  type: EmailType.ADMIN_ORDER,
                  to: adminEmails,
                  context: orderEmailData,
                });

                if (!adminEmailSent) {
                  console.error('Failed to send order notification to admins');
                }
              }
            } else {
              console.warn('No admin users found to send order notification');
            }
          } else {
            console.error(
              'Missing delivery information or recipes for email notification'
            );
          }
        } catch (emailError) {
          console.error('Error sending email notifications:', emailError);
          // Don't fail the entire transaction if email sending fails
        }
      }

      return ResponseDto.createSuccessResponse(
        'Payment verified successfully',
        {
          reference: paystackData.data.reference,
          amount: paystackData.data.amount / 100, // Convert back from kobo to naira
          status: paystackData.data.status,
          customer: paystackData.data.customer,
          paid_at: paystackData.data.paid_at,
          transaction: {
            id: transaction.id,
            status: TransactionStatus.SUCCESS,
            deliveryId: transaction.deliveryId,
          },
          order: {
            id: orderResult.id,
            recipeCount: transaction.recipes.length,
            totalAmount: totalAmount,
          },
        }
      );
    } else {
      // Update transaction status to failed
      await updateTransaction(transaction.id!, {
        status: TransactionStatus.FAILED,
      });

      return ResponseDto.createErrorResponse('Payment verification failed', {
        statusCode: 400,
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);

    // Try to update transaction status to failed if we have the transaction
    try {
      const transaction = await getTransactionByReference(reference);
      if (transaction && transaction.id) {
        await updateTransaction(transaction.id, {
          status: TransactionStatus.FAILED,
        });
      }
    } catch (updateError) {
      console.error(
        'Error updating transaction status to failed:',
        updateError
      );
    }

    return ResponseDto.createErrorResponse('Internal server error', {
      statusCode: 500,
    });
  }
}
