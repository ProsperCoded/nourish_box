import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json(
      { error: "Payment reference is required", success: false },
      { status: 400 }
    );
  }

  try {
    // Verify payment with Paystack
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await paystackRes.json();

    if (!paystackRes.ok) {
      console.error("Paystack verification failed:", data);
      return NextResponse.json(
        {
          error: data.message || "Payment verification failed",
          success: false,
        },
        { status: 400 }
      );
    }

    // Check if payment was successful
    const isSuccessful = data.status && data.data.status === "success";

    if (isSuccessful) {
      // You can add additional logic here like:
      // - Save transaction to database
      // - Send confirmation email
      // - Update order status

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        data: {
          reference: data.data.reference,
          amount: data.data.amount / 100, // Convert back from kobo to naira
          status: data.data.status,
          customer: data.data.customer,
          paid_at: data.data.paid_at,
        },
      });
    } else {
      return NextResponse.json(
        {
          error: "Payment verification failed",
          success: false,
          status: data.data?.status || "unknown",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
