"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyPaymentPolar } from "@/action/verifyPaymentPolar";

export default function PostcheckoutPolarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPayment = async () => {
      const checkoutId = searchParams.get("checkout_id");

      if (checkoutId) {
        try {
          const result = await verifyPaymentPolar(checkoutId);

          if (result.success) {
            setPaymentStatus("paid");
            console.log("Polar payment successful", result);
            // Redirect to dashboard after a short delay
            setTimeout(() => router.push("/upload"), 200);
          } else {
            setPaymentStatus(result.status);
          }
        } catch (error) {
          setPaymentStatus("error");
          setError(
            error instanceof Error ? error.message : "Unknown error occurred"
          );
        }
      } else {
        setError("No checkout ID provided");
      }
    };

    checkPayment();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-mainWhite flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-mainBlack mb-4">
            Payment Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/checkout")}
            className="bg-mainBlack text-mainWhite px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === "paid") {
    return (
      <div className="min-h-screen bg-mainWhite flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-mainBlack mb-4">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. You&apos;re being redirected to upload your photos.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mainBlack mx-auto"></div>
        </div>
      </div>
    );
  }

  if (paymentStatus === "open") {
    return (
      <div className="min-h-screen bg-mainWhite flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-yellow-500 text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-mainBlack mb-4">
            Payment Pending
          </h1>
          <p className="text-gray-600 mb-6">
            Your payment is still being processed. Please wait a moment.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mainBlack mx-auto"></div>
        </div>
      </div>
    );
  }

  if (paymentStatus === "expired") {
    return (
      <div className="min-h-screen bg-mainWhite flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-orange-500 text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-mainBlack mb-4">
            Payment Expired
          </h1>
          <p className="text-gray-600 mb-6">
            Your payment session has expired. Please try again.
          </p>
          <button
            onClick={() => router.push("/checkout")}
            className="bg-mainBlack text-mainWhite px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Start New Payment
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-mainWhite flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainBlack mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-mainBlack mb-4">
          Verifying Payment
        </h1>
        <p className="text-gray-600">
          Please wait while we verify your payment with Polar...
        </p>
      </div>
    </div>
  );
}
