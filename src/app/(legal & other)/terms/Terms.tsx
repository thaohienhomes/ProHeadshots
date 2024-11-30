"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Terms() {
  const router = useRouter();

  useEffect(() => {
    // Set the document title
    document.title = "Terms and Conditions | CVPHOTO.app";
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f5ec] text-[#091E25] p-4">
      <div className="max-w-3xl mx-auto">
        <nav className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-[#091E25] hover:underline cursor-pointer"
          >
            ← Back
          </button>
        </nav>
        <main className="bg-[#f6f5ec] p-8 border-2 border-[#091E25]">
          <h1 className="text-3xl font-bold text-center mb-8">
            Terms and Conditions
          </h1>
          <p className="mb-4">
            <strong>1. Introduction</strong>
            <br />
            By using CVPHOTO.app, you confirm your acceptance of, and agree to
            be bound by, these terms and conditions for our AI headshot
            generation service.
          </p>
          <p className="mb-4">
            <strong>2. Agreement to Terms and Conditions</strong>
            <br />
            This Agreement takes effect on the date on which you first use the
            CVPHOTO.app website or our AI headshot generation service.
          </p>
          <p className="mb-4">
            <strong>3. Service Access</strong>
            <br />
            CVPHOTO.app offers various plans for AI-generated headshots. Our
            service is purchased through a single transaction and provides
            access to AI-generated headshots based on the selected plan.
          </p>
          <p className="mb-4">
            <strong>4. Refunds</strong>
            <br />
            We offer a refund for our Professional and Executive plans under
            specific conditions, as outlined in our Refund Policy. The Basic
            plan is not eligible for refunds. All refund requests must be made
            within 30 days of purchase.
          </p>
          <p className="mb-4">
            <strong>5. Disclaimer</strong>
            <br />
            While we strive for high-quality results, it is not warranted that
            CVPHOTO.app will meet all your requirements or that its operation
            will be uninterrupted or error-free. All express and implied
            warranties or conditions not stated in this Agreement are excluded
            and expressly disclaimed to the fullest extent permitted by law.
          </p>
          <p className="mb-4">
            <strong>6. Warranties and Limitation of Liability</strong>
            <br />
            CVPHOTO.app provides its AI headshot generation service &quot;as
            is&quot; without any warranty. We shall not be liable for any
            indirect, special, or consequential loss or damage arising from the
            use of our service. Our liability, if any, is limited to the amount
            you paid for the service.
          </p>
          <p className="mb-4">
            <strong>7. Responsibilities</strong>
            <br />
            You are responsible for the photos you upload and how you use the
            AI-generated headshots. CVPHOTO.app is not responsible for any
            misuse of the generated content.
          </p>
          <p className="mb-4">
            <strong>8. Price Adjustments</strong>
            <br />
            As we continue to improve our AI technology and expand our
            offerings, prices may increase. Any discounts provided are to help
            customers secure the current price.
          </p>
          <p className="mb-4">
            <strong>9. Intellectual Property</strong>
            <br />
            You retain full commercial rights and ownership of your AI-generated
            headshots. The photos you upload to train our AI model are deleted
            within 7 days, but you can delete them instantly at any time.
          </p>
          <p className="mb-4">
            <strong>10. General Terms and Law</strong>
            <br />
            This Agreement is governed by the laws of Sweden. You acknowledge
            that no joint venture, partnership, employment, or agency
            relationship exists between you and as a result of your use of our
            services.
          </p>
          <p className="text-center mt-8">
            Last updated: {new Date().toLocaleDateString("en-SE")}
          </p>
        </main>
      </div>
    </div>
  );
}
