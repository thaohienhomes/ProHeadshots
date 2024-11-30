// app/postcheckout/PostcheckoutContent.tsx ALSO ADD Stripe secret on vercel
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyPayment } from "@/action/verifyPayment";

export default function PostcheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPayment = async () => {
      const sessionId = searchParams.get("session_id");

      if (sessionId) {
        try {
          const result = await verifyPayment(sessionId);

          if (result.success) {
            setPaymentStatus("paid");
            console.log("Payment successful", result);
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
        setError("No session ID provided");
      }
    };

    checkPayment();
  }, [searchParams, router]);

  if (paymentStatus === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-mainBlack text-mainWhite">
        <div className="loader mb-8"></div>
        <h2 className="text-2xl font-bold mb-4 text-center text-mainOrange">
          Confirming payment
        </h2>
        <p className="text-lg text-mainWhite text-center">
          Please do not close or reload this page
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-mainBlack text-mainWhite">
      {paymentStatus === "paid" ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-mainGreen">
            Payment Successful!
          </h2>
          <p className="text-lg text-mainWhite">
            Redirecting you to the dashboard...
          </p>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-mainOrange">
            Payment Failed
          </h2>
          <p className="text-lg text-mainWhite">Please try again</p>
          {error && <p className="mt-2 text-mainOrange">{error}</p>}
        </div>
      )}
    </div>
  );
}
