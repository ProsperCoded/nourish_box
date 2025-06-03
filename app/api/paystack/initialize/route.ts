import {
  Transaction,
  TransactionStatus,
} from "@/app/utils/types/transaction.type";
import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/app/api/adminUtils/user.admin";
import { createTransaction } from "@/app/api/adminUtils/transaction.admin";
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
  const { amount, recipes, userId } = body;
  try {
    const { email } = await getUserById(userId);
    if (!email) {
      return ResponseDto.createErrorResponse("User not found", {
        statusCode: 404,
      });
    }
    if (!recipes || recipes.length === 0) {
      return ResponseDto.createErrorResponse("No recipes selected", {
        statusCode: 400,
      });
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
          email,
          amount: amount, // already in kobo
          metadata: {
            recipes,
          },
        }),
      }
    );

    const paystackResponse = (await paystackRes.json()) as PaystackResponse;
    const transaction: Partial<Transaction> = {
      userId: userId as string,
      email,
      amount,
      recipes,
      status: TransactionStatus.PENDING,
      reference: paystackResponse.data.reference,
      // paymentMethod: data.data.payment_method,
      // paymentDate: data.data.payment_date,
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
