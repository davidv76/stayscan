"use client";

import { useRouter } from "next/navigation";


interface SubscriptionPlan {
  name: string;
  price: number;
  propertyLimit: number;
  stripeId: string | null;
}

// Define subscription plans
const subscriptionPlans: SubscriptionPlan[] = [
  { name: "free", price: 0, propertyLimit: 1, stripeId: null },
  { name: "basic", price: 9.99, propertyLimit: 5, stripeId: 'price_1QAzauJZnaZUZb3Y7jUiQi8t' },
  { name: "pro", price: 19.99, propertyLimit: 15, stripeId: 'price_1QAzauJZnaZUZb3Y7jUiQi8t' },
  { name: "enterprise", price: 49.99, propertyLimit: Infinity, stripeId: 'price_1QAzauJZnaZUZb3Y7jUiQi8t' },
]
export default function TiersPage() {

  const router = useRouter();

  const handleChoosePlan = (plan: string)=> {
    console.log(plan);

    router.push('/dashboard');
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Choose a plan</h1>
      <div className="flex flex-row flex-wrap justify-center gap-6">
        {/* Plan list */}

        {subscriptionPlans.map((plan, indx) => (
          <div key={indx} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-64 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 uppercase">
              {plan.name}
            </h2>
            <p className="text-gray-600 mb-4">${plan.price}/month</p>
            <p className="text-gray-600 mb-4">
              Add {plan.propertyLimit} property
            </p>
            <button onClick={()=> handleChoosePlan(plan.name)} className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700  transition duration-300">
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
