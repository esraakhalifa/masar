import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "../../lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session user:", session?.user);

    if (!session?.user?.email) {
      console.log("No user session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First, let's get all payments for the user without any filters
    const allPayments = await prisma.payment.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
    });
    console.log("All payments found:", JSON.stringify(allPayments, null, 2));

    // Get the user with filtered payments
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        payments: {
          where: {
            status: {
              in: ["succeeded", "completed"], // Check for both statuses
            },
            periodEnd: {
              gt: new Date(), // Only get payments that haven't expired
            },
          },
          orderBy: {
            periodEnd: "desc", // Get the most recent payment
          },
          take: 1, // Only get the most recent payment
        },
      },
    });

    console.log("Found user:", user?.email);
    console.log(
      "User payments after filter:",
      JSON.stringify(user?.payments, null, 2)
    );
    console.log("Current date:", new Date().toISOString());

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has an active subscription
    const hasActiveSubscription = user.payments.length > 0;
    console.log("Has active subscription:", hasActiveSubscription);
    console.log("Number of payments found:", user.payments.length);

    // Log details of each payment
    user.payments.forEach((payment, index) => {
      console.log(`Payment ${index + 1}:`, {
        status: payment.status,
        periodEnd: payment.periodEnd,
        isExpired: payment.periodEnd < new Date(),
      });
    });

    return NextResponse.json({ hasActiveSubscription });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
