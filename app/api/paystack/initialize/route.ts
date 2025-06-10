import {
  Transaction,
  TransactionStatus,
} from "@/app/utils/types/transaction.type";
import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/app/api/adminUtils/user.admin";
import { createTransaction } from "@/app/api/adminUtils/transaction.admin";
import { getRecipeById } from "@/app/api/adminUtils/recipie.admin";
import {
  hasCompleteDeliveryInfo,
  createDelivery,
} from "@/app/api/adminUtils/delivery.admin";
import { paystackConfig } from "../../utils/config.env";
import { ResponseDto } from "@/app/api/response.dto";

interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log("request body:", body);
  const { email, amount, recipes, userId, delivery } = body;
  try {
    const user = await getUserById(userId);
    if (!user && !email) {
      return ResponseDto.createErrorResponse("Guest user must provide email", {
        statusCode: 404,
      });
    }
    if (!recipes || recipes.length === 0) {
      return ResponseDto.createErrorResponse("No recipes selected", {
        statusCode: 400,
      });
    }

    // Check if user has complete delivery info or if delivery object is provided
    const isGuestUser = !user;
    const hasCompleteProfile = user ? hasCompleteDeliveryInfo(user) : false;
    const hasDeliveryObject =
      delivery &&
      delivery.name &&
      delivery.email &&
      delivery.phone &&
      delivery.address &&
      delivery.city &&
      delivery.state;

    // Validate delivery information for guest users or users with incomplete profiles
    if ((isGuestUser || !hasCompleteProfile) && !hasDeliveryObject) {
      return ResponseDto.createErrorResponse(
        isGuestUser
          ? "Guest user must provide complete delivery information (name, email, phone, address, city, state)"
          : "User with incomplete profile must provide complete delivery information (name, email, phone, address, city, state)",
        { statusCode: 400 }
      );
    }

    // Validate that all recipes exist
    const recipeValidationPromises = recipes.map(async (recipeId: string) => {
      const recipe = await getRecipeById(recipeId);
      return { recipeId, exists: !!recipe };
    });

    const recipeValidationResults = await Promise.all(recipeValidationPromises);
    const invalidRecipes = recipeValidationResults.filter(
      (result) => !result.exists
    );

    if (invalidRecipes.length > 0) {
      return ResponseDto.createErrorResponse(
        `Invalid recipes found: ${invalidRecipes
          .map((r) => r.recipeId)
          .join(", ")}`,
        { statusCode: 400 }
      );
    }

    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackConfig.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email || user?.email,
          amount: amount * 100, // convert to kobo
          metadata: {
            recipes,
          },
        }),
      }
    );

    const paystackResponse = (await paystackRes.json()) as PaystackResponse;
    console.log("paystack response:", paystackResponse);

    // Create delivery document first when needed
    let deliveryId: string | null = null;
    const deliveryData = delivery
      ? {
          deliveryName: delivery?.name,
          deliveryEmail: delivery?.email || email,
          deliveryPhone: delivery?.phone,
          deliveryAddress: delivery?.address,
          deliveryCity: delivery?.city,
          deliveryState: delivery?.state,
          deliveryNote: delivery?.note,
        }
      : {
          deliveryName: user?.name,
          deliveryEmail: user?.email,
          deliveryPhone: user?.phone,
          deliveryAddress: user?.address,
          deliveryCity: user?.city,
          deliveryState: user?.state,
          deliveryNote: "",
        };

    try {
      const deliveryResult = await createDelivery(deliveryData);
      deliveryId = deliveryResult.id;
      console.log(`Delivery document created with ID: ${deliveryId}`);
    } catch (deliveryError) {
      console.error("Error creating delivery document:", deliveryError);
      return ResponseDto.createErrorResponse(
        "Failed to create delivery document",
        {
          statusCode: 500,
        }
      );
    }

    // Create transaction with delivery reference
    const transaction: Partial<Transaction> = {
      ...(userId && { userId: userId as string }),

      email: email || user?.email,
      amount,
      recipes,
      status: TransactionStatus.PENDING,
      reference: paystackResponse.data.reference,
      deliveryId: deliveryId!, // deliveryId is guaranteed to exist here
    };
    const { id: transactionId } = await createTransaction(transaction);

    return ResponseDto.createSuccessResponse("Transaction initialized", {
      ...paystackResponse.data,
      transactionId,
      deliveryId,
    });
  } catch (error) {
    console.error("Error initializing paystack transaction:", error);
    return ResponseDto.createErrorResponse("Failed to initialize transaction", {
      statusCode: 500,
    });
  }
}
