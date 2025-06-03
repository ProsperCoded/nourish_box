import {
  Transaction,
  TransactionStatus,
} from "@/app/utils/types/transaction.type";
import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/app/api/adminUtils/user.admin";
import { createTransaction } from "@/app/api/adminUtils/transaction.admin";
import { getRecipeById } from "@/app/api/adminUtils/recipie.admin";
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
  const { amount, recipes, userId, delivery } = body;
  try {
    const user = await getUserById(userId);
    if (!user) {
      return ResponseDto.createErrorResponse("User not found", {
        statusCode: 404,
      });
    }
    if (!recipes || recipes.length === 0) {
      return ResponseDto.createErrorResponse("No recipes selected", {
        statusCode: 400,
      });
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
          email: user.email,
          amount: amount * 100, // convert to kobo
          metadata: {
            recipes,
          },
        }),
      }
    );

    const paystackResponse = (await paystackRes.json()) as PaystackResponse;
    console.log("paystack response:", paystackResponse);
    const transaction: Partial<Transaction> = {
      userId: userId as string,
      email: user.email,
      amount,
      recipes,
      status: TransactionStatus.PENDING,
      reference: paystackResponse.data.reference,
    };
    const { id: transactionId } = await createTransaction(transaction);

    return ResponseDto.createSuccessResponse("Transaction initialized", {
      ...paystackResponse.data,
      transactionId,
    });
  } catch (error) {
    console.error("Error initializing paystack transaction:", error);
    return ResponseDto.createErrorResponse("Failed to initialize transaction", {
      statusCode: 500,
    });
  }
}
