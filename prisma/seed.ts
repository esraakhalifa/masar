import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create subscription plans
  const plans = [
    {
      planName: 'Career Roadmap Premium - Monthly Plan',
      amount: 1000,
      currency: 'USD',
      billingInterval: 'monthly',
    },
    {
      planName: 'Career Roadmap Premium - Yearly Plan',
      amount: 10000,
      currency: 'USD',
      billingInterval: 'yearly',
    },
  ];

  for (const plan of plans) {
    const existingPlan = await prisma.subscriptionPlan.findFirst({
      where: {
        planName: plan.planName,
      },
    });

    if (existingPlan) {
      await prisma.subscriptionPlan.update({
        where: {
          id: existingPlan.id,
        },
        data: plan,
      });
    } else {
      await prisma.subscriptionPlan.create({
        data: plan,
      });
    }
  }

  console.log('Subscription plans created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 