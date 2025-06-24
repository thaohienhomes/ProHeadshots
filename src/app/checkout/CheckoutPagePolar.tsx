"use client";

import { useState, use } from "react";
import { useRouter, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { createPolarCheckoutSession } from "@/utils/polarPayment";
import pricingPlansPolar from "./pricingPlansPolar.json";
import Image from "next/image";

export default function CheckoutPagePolar({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const resolvedSearchParams = use(searchParams);
  const plan = resolvedSearchParams.plan as string;
  const supabase = createClient();

  if (
    !plan ||
    !["basic", "professional", "executive"].includes(plan.toLowerCase())
  ) {
    redirect("/forms");
  }

  const selectedPlan = pricingPlansPolar.plans.find(
    (p) => p.name.toLowerCase() === plan.toLowerCase()
  );

  if (!selectedPlan) {
    redirect("/forms");
  }

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value);
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Get the authenticated user
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        // User not authenticated - redirect to login
        router.push("/auth");
        return;
      }

      // Create Polar checkout session
      const checkoutSession = await createPolarCheckoutSession({
        productId: selectedPlan.polarProductId,
        successUrl: `${window.location.origin}/postcheckout-polar?checkout_id={CHECKOUT_ID}`,
        customerEmail: user.email,
        metadata: {
          user_id: user.id,
          plan_type: selectedPlan.name,
        },
      });

      // Redirect to Polar checkout
      window.location.href = checkoutSession.url;
    } catch (error) {
      console.error("Error processing payment:", error);
      setIsProcessing(false);
      // Handle error - maybe show a toast or alert
      alert("There was an error processing your payment. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-mainWhite flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-mainBlack text-mainWhite p-6 text-center">
          <h1 className="text-2xl font-bold">Complete Your Order</h1>
          <p className="mt-2 opacity-90">
            You&apos;re purchasing the {selectedPlan.name} plan
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4">
              Select your preferred payment method
            </h2>

            <div className="border border-mainBlack rounded-lg p-4 mb-4 flex items-center">
              <input
                type="radio"
                id="creditCard"
                name="paymentMethod"
                value="creditCard"
                className="mr-3"
                checked={paymentMethod === "creditCard"}
                onChange={handlePaymentMethodChange}
              />
              <label htmlFor="creditCard" className="flex-grow font-medium">
                Pay with credit card
              </label>
              <div className="flex gap-2">
                {["visa", "mastercard", "jcb"].map((card) => (
                  <Image
                    key={card}
                    src={`/creditcard/${card}.svg`}
                    alt={card}
                    width={32}
                    height={20}
                  />
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-6">
              <p className="mb-2">
                ✓ Secure payment processing via Polar
              </p>
              <p className="mb-2">✓ 256-bit SSL encryption</p>
              <p>✓ PCI DSS compliant</p>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-mainBlack text-mainWhite py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : `Pay $${selectedPlan.price}`}
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              By completing your purchase, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </div>

          {/* Right column - Order summary */}
          <div className="md:w-80 bg-gray-50 p-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>{selectedPlan.name} Plan</span>
                <span>${selectedPlan.price}</span>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>{selectedPlan.headshots} AI headshots</span>
                <span>Included</span>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>Processing time</span>
                <span>{selectedPlan.time} hour{selectedPlan.time > 1 ? 's' : ''}</span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${selectedPlan.price}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${selectedPlan.price}</span>
                </div>
              </div>

              {selectedPlan.originalPrice && (
                <div className="text-center text-sm text-green-600 font-medium">
                  You save ${selectedPlan.originalPrice - selectedPlan.price}!
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What you get:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ {selectedPlan.headshots} professional AI headshots</li>
                <li>✓ Multiple styles and backgrounds</li>
                <li>✓ High-resolution downloads</li>
                <li>✓ Commercial usage rights</li>
                <li>✓ {selectedPlan.time}-hour delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
