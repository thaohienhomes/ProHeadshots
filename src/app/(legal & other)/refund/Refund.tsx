import Image from "next/image";

export default function Refund() {
  return (
    <div className="min-h-screen bg-[#f6f5ec] text-[#091E25] p-4">
      <div className="max-w-3xl mx-auto">
        <nav className="mb-6">
          <a href="/" className="text-[#091E25] hover:underline cursor-pointer">
            ← Back
          </a>
        </nav>
        <main className="bg-[#f6f5ec] p-8 border-2 border-[#091E25]">
          <h1 className="text-3xl font-bold text-center mb-8">Refund Policy</h1>
          <p className="mb-4">
            <strong>1. Refund Policy </strong>
            <br />
            At CVPHOTO, we stand behind the quality of our AI-generated
            headshots. We offer a refund for our Professional and Executive
            plans under specific conditions. This refund policy is valid for 30
            days from the date of purchase.
          </p>
          <p className="mb-4">
            <strong>2. Refund Eligibility</strong>
            <br />
            Refunds are available for our Professional and Executive plan
            customers who meet the following criteria:
            <br />
            • You are not satisfied with the generated headshots.
            <br />
            • You have not downloaded any of the generated images.
            <br />
            Please note that our Basic plan is not eligible for refunds.
          </p>
          <p className="mb-4">
            <strong>3. Refund Request Procedure</strong>
            <br />
            To initiate a refund for the Professional or Executive plan:
            <br />
            1. Visit our contact page at{" "}
            <a
              href="/contact"
              className="text-[#091E25] hover:text-[#CEFF66] underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              cvphoto.app/contact
            </a>
            .<br />
            2. Provide your order number, which can be found in your purchase
            confirmation email.
            <br />
            3. Confirm that you have not downloaded any generated images.
            <br />
            4. Briefly explain why you&apos;re unsatisfied with the results.
            <br />
            Refunds will be processed within 2-5 business days. The refunded
            amount will be credited to the original payment method used for the
            purchase.
          </p>
          <p className="mb-4">
            <strong>4. Policy Against Abuse</strong>
            <br />
            We maintain a zero-tolerance stance on the misuse of our refund
            policy and AI-generated resources. Any detected abuse will result in
            the denial of refund and permanent suspension of the user&apos;s
            account from our platform. We reserve the right to take appropriate
            action to protect the integrity of our service and community.
          </p>
          <p className="mb-4">
            <strong>5. Right to Cancel Refund</strong>
            <br />
            CVPHOTO reserves the right to cancel a refund if we find evidence
            that the user has abused our service. This includes, but is not
            limited to:
            <br />
            • Attempting to manipulate or bypass our system
            <br />
            • Using the service for creating misleading or fake identities
            <br />
            • Violating our terms of service in any way
            <br />
            In such cases, we may deny the refund request and take additional
            actions as deemed necessary to protect our service integrity.
          </p>
          <p className="text-center mt-8">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-SE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </main>
      </div>
    </div>
  );
}
