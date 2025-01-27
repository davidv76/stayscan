"use client";

import BtnSpinner from "@/components/ui/btnSpinner";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface SubscriptionPlan {
  name: string;
  price: number;
  propertyLimit: number;
  stripeId: string | null;
}


const subscriptionPlans: SubscriptionPlan[] = [
  { name: "free", price: 0, propertyLimit: 1, stripeId: null },
  {
    name: "basic",
    price: 9.99,
    propertyLimit: 5,
    stripeId: "price_1QkKskBy9Ue4ijcYwlExvrjV",
  },
  {
    name: "pro",
    price: 19.99,
    propertyLimit: 15,
    stripeId: "price_1QkKt1By9Ue4ijcY7uomvOeI",
  },
  {
    name: "enterprise",
    price: 49.99,
    propertyLimit: 50,
    stripeId: "price_1QkKtHBy9Ue4ijcYFk2Emofg",
  },
]

export default function TiersPage() {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  const router = useRouter();

  const { user } = useUser();

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user?.id }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.json();
        console.log("User created/updated:", userData);
      } catch (error) {
        console.error("Error creating/updating user:", error);
        toast({
          title: "Error",
          description:
            "Failed to update user information. Some features may be limited.",
          variant: "destructive",
        });

        return;
      }
    })();
  }, []);

  const handleChoosePlan = async (plan: SubscriptionPlan) => {
    try {
      
      if (plan.name === "free") {
        router.push("/dashboard");
        return;
      }

      setIsLoading((prev) => ({ ...prev, [plan.name]: true }));

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.stripeId,
          propertyLimit: plan.propertyLimit
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error handling subscription:", error);
    } finally{
  
      setIsLoading((prev) => ({ ...prev, [plan.name]: false}));
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#FFFFFF] group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#1C160C] text-4xl font-black leading-tight tracking-[-0.033em]">
                  Manage Subscription
                </p>
                <p className="text-[#A18249] text-base font-normal leading-normal">
                  Choose a plan that best fits your needs.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3 p-4">
              {subscriptionPlans.map((plan, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-3 rounded-xl border border-solid border-[#E9DFCE] bg-[#FFFFFF] p-6"
                >
                  <div className="flex flex-col gap-1">
                    <div
                      className={
                        plan.name === "pro"
                          ? "flex items-center justify-between"
                          : ""
                      }
                    >
                      <h1 className="text-[#1C160C] uppercase text-base font-bold leading-tight">
                        {plan.name}
                      </h1>
                      {plan.name === "pro" && (
                        <p className="text-[#FFFFFF] text-xs font-medium leading-normal tracking-[0.015em] rounded-full bg-[#019863] px-3 py-[3px] text-center">
                          Recommended
                        </p>
                      )}
                    </div>
                    <p className="flex items-baseline gap-1 text-[#1C160C]">
                      <span className="text-[#1C160C] text-4xl font-black leading-tight tracking-[-0.033em]">
                        ${plan.price}
                      </span>
                      <span className="text-[#1C160C] text-base font-bold leading-tight">
                        /month
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleChoosePlan(plan)}
                    disabled={isLoading[plan.name]}
                    className="disabled:opacity-75 disabled:cursor-not-allowed flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold leading-normal tracking-[0.015em]"
                  >
                    <span className="truncate">{isLoading[plan.name] ? <BtnSpinner height="20px" width="20px" /> : 'Select plan'}</span>
                  </button>
                  <div className="flex flex-col gap-2">
                    <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#1C160C]">
                      <div
                        className="text-[#1C160C]"
                        data-icon="Check"
                        data-size="20px"
                        data-weight="regular"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20px"
                          height="20px"
                          fill="currentColor"
                          viewBox="0 0 256 256"
                        >
                          <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                        </svg>
                      </div>
                      Up to {plan.propertyLimit} properties
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    // <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
    //   <h1 className="text-3xl font-bold text-gray-800 mb-8">Choose a plan</h1>
    //   <div className="flex flex-row flex-wrap justify-center gap-6">
    //     {/* Plan list */}

    //     {subscriptionPlans.map((plan, indx) => (
    //       <div key={indx} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-64 text-center">
    //         <h2 className="text-xl font-semibold text-gray-800 mb-2 uppercase">
    //           {plan.name}
    //         </h2>
    //         <p className="text-gray-600 mb-4">${plan.price}/month</p>
    //         <p className="text-gray-600 mb-4">
    //           Add {plan.propertyLimit} property
    //         </p>
    //         <button onClick={()=> handleChoosePlan(plan.name)} className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700  transition duration-300">
    //           Select
    //         </button>
    //       </div>
    //     ))}
    //   </div>
    // </div>
  );
}
