"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Terms() {
  const router = useRouter();

  useEffect(() => {
    // Set the document title
    document.title = "Terms and Conditions | ProHeadshots";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors duration-300 font-medium"
          >
            ← Back to coolpix
          </button>
        </nav>
        <main className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-xl border border-purple-100">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Terms and Conditions
            </h1>
            <p className="text-slate-600 text-lg">coolpix AI Headshot Generation Service</p>
          </div>

          <div className="space-y-8">
            <section className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-l-4 border-purple-500">
              <h2 className="text-xl font-bold text-purple-800 mb-3">1. Introduction</h2>
              <p className="text-slate-700 leading-relaxed">
                By using coolpix (coolpix.me), you confirm your acceptance of, and agree to
                be bound by, these terms and conditions for our AI headshot generation service.
              </p>
            </section>

            <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-l-4 border-blue-500">
              <h2 className="text-xl font-bold text-blue-800 mb-3">2. Agreement to Terms and Conditions</h2>
              <p className="text-slate-700 leading-relaxed">
                This Agreement takes effect on the date on which you first use the
                coolpix website or our AI headshot generation service.
              </p>
            </section>
            <section className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-l-4 border-purple-500">
              <h2 className="text-xl font-bold text-purple-800 mb-3">3. Service Access</h2>
              <p className="text-slate-700 leading-relaxed">
                coolpix offers various plans for AI-generated headshots. Our
                service is purchased through a single transaction and provides
                access to AI-generated headshots based on the selected plan.
              </p>
            </section>

            <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-l-4 border-blue-500">
              <h2 className="text-xl font-bold text-blue-800 mb-3">4. Refunds</h2>
              <p className="text-slate-700 leading-relaxed">
                We offer a refund for our Professional and Executive plans under
                specific conditions, as outlined in our Refund Policy. The Basic
                plan is not eligible for refunds. All refund requests must be made
                within 30 days of purchase.
              </p>
            </section>

            <section className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-l-4 border-purple-500">
              <h2 className="text-xl font-bold text-purple-800 mb-3">5. Disclaimer</h2>
              <p className="text-slate-700 leading-relaxed">
                While we strive for high-quality results, it is not warranted that
                ProHeadshots will meet all your requirements or that its operation
                will be uninterrupted or error-free. All express and implied
                warranties or conditions not stated in this Agreement are excluded
                and expressly disclaimed to the fullest extent permitted by law.
              </p>
            </section>
            <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-l-4 border-blue-500">
              <h2 className="text-xl font-bold text-blue-800 mb-3">6. Warranties and Limitation of Liability</h2>
              <p className="text-slate-700 leading-relaxed">
                ProHeadshots provides its AI headshot generation service &quot;as
                is&quot; without any warranty. We shall not be liable for any
                indirect, special, or consequential loss or damage arising from the
                use of our service. Our liability, if any, is limited to the amount
                you paid for the service.
              </p>
            </section>

            <section className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-l-4 border-purple-500">
              <h2 className="text-xl font-bold text-purple-800 mb-3">7. Responsibilities</h2>
              <p className="text-slate-700 leading-relaxed">
                You are responsible for the photos you upload and how you use the
                AI-generated headshots. ProHeadshots is not responsible for any
                misuse of the generated content.
              </p>
            </section>

            <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-l-4 border-blue-500">
              <h2 className="text-xl font-bold text-blue-800 mb-3">8. Price Adjustments</h2>
              <p className="text-slate-700 leading-relaxed">
                As we continue to improve our AI technology and expand our
                offerings, prices may increase. Any discounts provided are to help
                customers secure the current price.
              </p>
            </section>
            <section className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-l-4 border-purple-500">
              <h2 className="text-xl font-bold text-purple-800 mb-3">9. Intellectual Property</h2>
              <p className="text-slate-700 leading-relaxed">
                You retain full commercial rights and ownership of your AI-generated
                headshots. The photos you upload to train our AI model are deleted
                within 7 days, but you can delete them instantly at any time.
              </p>
            </section>

            <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-l-4 border-blue-500">
              <h2 className="text-xl font-bold text-blue-800 mb-3">10. General Terms and Law</h2>
              <p className="text-slate-700 leading-relaxed">
                This Agreement is governed by applicable laws and regulations. You acknowledge
                that no joint venture, partnership, employment, or agency
                relationship exists between you and coolpix as a result of your use of our
                services.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-purple-200 text-center">
            <p className="text-slate-500 text-sm">
              Last updated: {new Date().toLocaleDateString("en-US", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-slate-400 text-xs mt-2">
              © 2024 ProHeadshots. All rights reserved.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
