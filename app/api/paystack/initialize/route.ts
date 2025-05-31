import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  const { email, amount } = await request.json();

  try {
    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // convert to kobo
        }),
      }
    );
    const data = await paystackRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error initializing paystack transaction:", error);
    return NextResponse.json(
      { error: "Failed to initialize transaction" },
      { status: 500 }
    );
  }
}
