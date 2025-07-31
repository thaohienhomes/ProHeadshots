"use client";
import Image from "next/image";
import Header from "@/components/Header";
import { redirect, useRouter } from "next/navigation";
import pricingPlans from "./pricingPlans.json";
import pricingPlansPolar from "./pricingPlansPolar.json";
import pricingPlansPolarDev from "./pricingPlansPolar.dev.json";
import { useState, use, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { isPolarEnabled } from "@/config/services";
import { createPolarCheckoutAction, validatePolarConfigAction } from "@/action/polarPayment";
import { validatePromoCodeClient } from "@/utils/promoCodeSystem.client";
import AuthDebugger from "@/components/AuthDebugger";
import { checkAuthStatus, refreshSession } from "@/utils/auth.client";

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const resolvedSearchParams = use(searchParams);
  const plan = resolvedSearchParams.plan as string;
  const supabase = createClient();
  const isPolarEnabledValue = isPolarEnabled();

  // Check authentication and Polar configuration on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔍 Checking authentication status...");
        const authStatus = await checkAuthStatus();

        if (authStatus.error) {
          console.error("❌ Auth check error:", authStatus.error);
          setAuthError(`Authentication error: ${authStatus.error}`);
          setIsCheckingAuth(false);
          return;
        }

        if (!authStatus.isAuthenticated || !authStatus.user) {
          console.log("❌ No user found, redirecting to auth with return URL");
          setAuthError("Please log in to continue with checkout");
          // Preserve the checkout intent by adding the plan to the auth redirect
          const returnUrl = `/checkout?plan=${plan}`;
          router.push(`/auth?next=${encodeURIComponent(returnUrl)}`);
          return;
        }

        console.log("✅ User authenticated:", authStatus.user.email);
        setCurrentUser(authStatus.user);

        // Check Polar configuration if Polar is enabled
        if (isPolarEnabledValue) {
          console.log("🔍 Validating Polar configuration...");
          const polarConfig = await validatePolarConfigAction();
          console.log("📊 Polar config status:", polarConfig);

          if (!polarConfig.isConfigured) {
            console.error("❌ Polar configuration error:", polarConfig.error);
            setAuthError(`Payment configuration error: ${polarConfig.error}`);
          }
        }

        setIsCheckingAuth(false);
      } catch (error) {
        console.error("❌ Unexpected auth error:", error);
        setAuthError("Unexpected authentication error");
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router, plan, isPolarEnabledValue]);

  if (
    !plan ||
    !["basic", "professional", "executive"].includes(plan.toLowerCase())
  ) {
    redirect("/forms");
  }

  // Use appropriate pricing plans based on service configuration and environment
  const getPricingPlans = () => {
    if (!isPolarEnabledValue) {
      return pricingPlans; // Use Stripe plans
    }

    // For Polar, use environment-specific plans
    const isDevelopment = process.env.NODE_ENV === 'development';
    return isDevelopment ? pricingPlansPolarDev : pricingPlansPolar;
  };

  const currentPricingPlans = getPricingPlans();
  const selectedPlan = currentPricingPlans.plans.find(
    (p) => p.name.toLowerCase() === plan.toLowerCase()
  );

  if (!selectedPlan) {
    redirect("/forms");
  }

  const handlePaymentMethodChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPaymentMethod(event.target.value);
  };

  const handlePromoCodeValidation = async () => {
    if (!promoCode.trim()) return;

    setIsValidatingPromo(true);
    setPromoError("");

    try {
      if (!currentUser) {
        setPromoError("Please log in to apply promo codes");
        setIsValidatingPromo(false);
        return;
      }

      const result = await validatePromoCodeClient(
        promoCode,
        currentUser.id,
        selectedPlan.price * 100 // Convert to cents
      );

      if (result.valid && result.discountAmount) {
        setPromoDiscount(result.discountAmount / 100); // Convert back to dollars
        setPromoError("");
      } else {
        setPromoDiscount(0);
        setPromoError(result.error || "Invalid promo code");
      }
    } catch (error) {
      setPromoError("Error validating promo code");
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const finalPrice = Math.max(0, selectedPlan.price - promoDiscount);

  const handlePayment = async () => {
    setIsProcessing(true);
    setAuthError("");

    try {
      // Check if we have a current user from our auth check
      if (!currentUser) {
        console.log("❌ No current user, re-checking authentication...");
        const authStatus = await checkAuthStatus();

        if (authStatus.error) {
          console.error("❌ Auth error during payment:", authStatus.error);
          setAuthError(`Authentication error: ${authStatus.error}`);
          setIsProcessing(false);
          return;
        }

        if (!authStatus.isAuthenticated || !authStatus.user) {
          console.log("❌ User not authenticated, redirecting to auth");
          setAuthError("Session expired. Please log in again.");
          const returnUrl = `/checkout?plan=${plan}`;
          router.push(`/auth?next=${encodeURIComponent(returnUrl)}`);
          return;
        }

        setCurrentUser(authStatus.user);
      }

      const user = currentUser;
      console.log("✅ Processing payment for user:", user.email);

      if (isPolarEnabledValue) {
        // Use Polar Payment (server action)
        console.log("🔄 Creating Polar checkout session...");

        // Get TrackDesk affiliate information
        const trackdeskAffiliateId = sessionStorage.getItem('trackdesk_affiliate_id');
        const trackdeskClickId = sessionStorage.getItem('trackdesk_click_id');

        const result = await createPolarCheckoutAction({
          productId: (selectedPlan as any).polarProductId,
          successUrl: `${window.location.origin}/postcheckout-polar?checkout_id={CHECKOUT_ID}`,
          customerEmail: user.email,
          metadata: {
            user_id: user.id,
            plan_type: selectedPlan.name,
            ...(trackdeskAffiliateId && { trackdesk_affiliate_id: trackdeskAffiliateId }),
            ...(trackdeskClickId && { trackdesk_click_id: trackdeskClickId }),
          },
        });

        if (result.success && result.checkoutUrl) {
          console.log("✅ Polar checkout session created, redirecting...");
          // Redirect to Polar checkout
          window.location.href = result.checkoutUrl;
        } else {
          throw new Error(result.error || 'Failed to create checkout session');
        }
      } else {
        // Use Stripe (original implementation)
        console.log("🔄 Redirecting to Stripe checkout...");
        const paymentLinkWithUserId = `${(selectedPlan as any).stripeUrl}?client_reference_id=${user.id}`;
        window.location.href = paymentLinkWithUserId;
      }
    } catch (error) {
      console.error("❌ Error processing payment:", error);
      setIsProcessing(false);
      setAuthError(`Payment processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
      <Header userAuth={true} />

      <main className="max-w-4xl mx-auto pt-8 px-4">
        {/* Authentication Error Display */}
        {authError && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400 text-sm">{authError}</span>
            </div>
          </div>
        )}
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-cyan-400 to-primary-400 bg-clip-text text-transparent">
            Secure Checkout
          </h1>
          <p className="text-slate-300 mb-4 text-center">
            Join over hundreds of satisfied customers who&apos;ve created
            professional headshots with us.
          </p>
          {/* User Info Display */}
          {currentUser && (
            <div className="text-center mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">
                ✅ Logged in as: {currentUser.email}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Select your preferred payment method
            </h2>

            <div className="border border-cyan-400/30 bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-4 flex items-center transition-all duration-300 hover:bg-white/15">
              <input
                type="radio"
                id="creditCard"
                name="paymentMethod"
                value="creditCard"
                className="mr-3 accent-cyan-400"
                checked={paymentMethod === "creditCard"}
                onChange={handlePaymentMethodChange}
              />
              <label htmlFor="creditCard" className="flex-grow font-medium text-white">
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

            {/* Promo Code Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Promo Code (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  className="flex-1 px-3 py-2 bg-navy-700/50 border border-cyan-400/30 rounded-lg text-white placeholder-navy-300 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={handlePromoCodeValidation}
                  disabled={isValidatingPromo || !promoCode.trim()}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-navy-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isValidatingPromo ? "..." : "Apply"}
                </button>
              </div>
              {promoError && (
                <p className="text-red-400 text-sm mt-1">{promoError}</p>
              )}
              {promoDiscount > 0 && (
                <p className="text-green-400 text-sm mt-1">
                  ✓ Promo code applied! ${promoDiscount.toFixed(2)} discount
                </p>
              )}
            </div>

            <p className="text-sm text-slate-300 mb-4">
              {isPolarEnabledValue ? 'Secure payment processing via Polar' : 'Secure checkout - SSL encrypted'}
            </p>

            {/* Trust indicators */}
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                {isPolarEnabledValue ? 'Secure payment via Polar - PCI DSS compliant' : 'Secure checkout - SSL encrypted'}
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
                Trusted by more than 100+ customers
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Done in 2 hours or less
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.599-1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                8x cheaper than a photographer
              </div>
            </div>

            {/* Add structured data for SEO */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Product",
                  name: `${selectedPlan.name} AI Headshot Package`,
                  description: `${selectedPlan.headshots} headshots, Unique backgrounds, ${selectedPlan.time} hour turnaround time`,
                  offers: {
                    "@type": "Offer",
                    price: selectedPlan.price,
                    priceCurrency: "USD",
                  },
                }),
              }}
            />
          </div>

          {/* Right column */}
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl shadow-2xl">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Order Summary
              </h2>

              <div className="mb-6">
                <p className="font-medium text-white">
                  1x {selectedPlan.name} Package
                </p>
                <ul className="text-sm text-slate-300 ml-5 list-disc mt-2">
                  <li>{selectedPlan.headshots} headshots</li>
                  <li>Unique backgrounds</li>
                  <li>
                    {selectedPlan.time} hour{selectedPlan.time > 1 ? "s" : ""}{" "}
                    turnaround time
                  </li>
                </ul>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-white">
                  Original Price
                </span>
                <span className="text-lg line-through text-slate-400">
                  ${selectedPlan.originalPrice}.00
                </span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-white">Discount</span>
                <span className="text-lg font-bold text-cyan-400">
                  {Math.round(
                    (1 - selectedPlan.price / selectedPlan.originalPrice) * 100
                  )}
                  % OFF
                </span>
              </div>

              {promoDiscount > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-white">Promo Discount</span>
                  <span className="text-lg font-bold text-green-400">
                    -${promoDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center mb-6 pt-2 border-t border-white/20">
                <span className="font-semibold text-white">Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-primary-400 bg-clip-text text-transparent">
                  ${finalPrice.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-cyan-500 to-primary-600 hover:from-cyan-400 hover:to-primary-500 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 mb-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isProcessing ? "Processing..." : "Pay now"}
              </button>

              <div className="relative group">
                <p className="text-center text-sm text-white font-medium mb-2 cursor-help">
                  30-DAY MONEY BACK GUARANTEE
                </p>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-navy-800/95 backdrop-blur-lg border border-cyan-400/30 rounded-lg shadow-xl text-xs text-slate-300 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  If you&apos;re not satisfied with our service and haven&apos;t
                  downloaded the generated images, we offer refund within 30
                  days of your purchase.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Debugger - only shows in development */}
      <AuthDebugger showDetails={process.env.NODE_ENV === 'development'} />
    </div>
  );
}
