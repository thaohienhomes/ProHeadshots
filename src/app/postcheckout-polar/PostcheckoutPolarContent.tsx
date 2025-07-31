"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyPaymentPolar } from "@/action/verifyPaymentPolar";
import PaymentVerificationLoader from "@/components/payment/PaymentVerificationLoader";
import PaymentErrorHandler from "@/components/payment/PaymentErrorHandler";

interface PaymentError {
  type: 'network' | 'timeout' | 'validation' | 'server' | 'unknown';
  message: string;
  code?: string;
  retryable: boolean;
}

export default function PostcheckoutPolarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [error, setError] = useState<PaymentError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  const categorizeError = (errorMessage: string): PaymentError => {
    const message = errorMessage.toLowerCase();

    if (message.includes('timeout') || message.includes('timed out')) {
      return {
        type: 'timeout',
        message: errorMessage,
        retryable: true
      };
    } else if (message.includes('network') || message.includes('connection')) {
      return {
        type: 'network',
        message: errorMessage,
        retryable: true
      };
    } else if (message.includes('validation') || message.includes('invalid')) {
      return {
        type: 'validation',
        message: errorMessage,
        retryable: false
      };
    } else if (message.includes('server') || message.includes('500')) {
      return {
        type: 'server',
        message: errorMessage,
        retryable: true
      };
    } else {
      return {
        type: 'unknown',
        message: errorMessage,
        retryable: true
      };
    }
  };

  const checkPayment = async (isRetry: boolean = false) => {
    const currentCheckoutId = searchParams.get("checkout_id");
    setCheckoutId(currentCheckoutId);

    if (!currentCheckoutId) {
      setError({
        type: 'validation',
        message: 'No checkout ID provided',
        retryable: false
      });
      setPaymentStatus("error");
      return;
    }

    if (isRetry) {
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);
    }

    try {
      // Add a timeout wrapper to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Payment verification timed out after 30 seconds')), 30000);
      });

      const verificationPromise = verifyPaymentPolar(currentCheckoutId);

      const result = await Promise.race([verificationPromise, timeoutPromise]) as any;

      if (result.success) {
        setPaymentStatus("paid");
        console.log("Polar payment successful", result);
        // Redirect to dashboard after a short delay
        setTimeout(() => router.push("/upload"), 200);
      } else {
        setPaymentStatus(result.status);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setPaymentStatus("error");
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(categorizeError(errorMessage));
    } finally {
      if (isRetry) {
        setIsRetrying(false);
      }
    }
  };

  useEffect(() => {
    checkPayment();
  }, [searchParams, router]);

  if (error) {
    return (
      <PaymentErrorHandler
        error={error}
        onRetry={() => checkPayment(true)}
        onContactSupport={() => {
          // You can implement contact support logic here
          window.open('mailto:support@coolpix.me?subject=Payment Issue&body=Checkout ID: ' + checkoutId, '_blank');
        }}
        checkoutId={checkoutId || undefined}
      />
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

  // For all other states (verifying, open, etc.), show the enhanced loader
  return (
    <PaymentVerificationLoader
      checkoutId={checkoutId || ''}
      onSuccess={(result) => {
        setPaymentStatus("paid");
        console.log("Payment verification successful", result);
        setTimeout(() => router.push("/upload"), 200);
      }}
      onError={(errorMessage) => {
        setPaymentStatus("error");
        setError(categorizeError(errorMessage));
      }}
    />
  );
}
