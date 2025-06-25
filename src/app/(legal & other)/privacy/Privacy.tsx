"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Privacy() {
  const router = useRouter();

  useEffect(() => {
    // Set the document title
    document.title = "Privacy Policy | coolpix";
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
              Privacy Policy
            </h1>
            <p className="text-slate-600 text-lg">coolpix Data Protection & Privacy</p>
          </div>

          <div className="space-y-8">
            <section className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-l-4 border-purple-500">
              <h2 className="text-xl font-bold text-purple-800 mb-3">Our Commitment to Your Privacy</h2>
              <p className="text-slate-700 leading-relaxed">
                Your privacy is important to us. It is coolpix&apos; policy to
                respect your privacy regarding any information we may collect from
                you across our website, coolpix.me, and other sites we own and
                operate.
              </p>
            </section>

            <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-l-4 border-blue-500">
              <h2 className="text-xl font-bold text-blue-800 mb-3">Information Collection</h2>
              <p className="text-slate-700 leading-relaxed">
                We only ask for personal information when we truly need it to
                provide our AI headshot generation service to you. We collect it by
                fair and lawful means, with your knowledge and consent. We also let
                you know why we are collecting it and how it will be used.
              </p>
            </section>

            <section className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-l-4 border-purple-500">
              <h2 className="text-xl font-bold text-purple-800 mb-3">Photo Data Handling</h2>
              <p className="text-slate-700 leading-relaxed">
                When you use our service, we collect the photos you upload to
                generate AI headshots. These photos are used solely for the purpose
                of creating your AI-generated headshots and are deleted from our
                servers within 7 days. You can also choose to delete them instantly
                at any time.
              </p>
            </section>
            <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-l-4 border-blue-500">
              <h2 className="text-xl font-bold text-blue-800 mb-3">Data Retention & Security</h2>
              <p className="text-slate-700 leading-relaxed">
                We retain your account information and generated headshots for as
                long as necessary to provide you with our service. What data we
                store, we protect within commercially acceptable means to prevent
                loss and theft, as well as unauthorized access, disclosure, copying,
                use, or modification.
              </p>
            </section>

            <section className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-l-4 border-purple-500">
              <h2 className="text-xl font-bold text-purple-800 mb-3">Data Sharing</h2>
              <p className="text-slate-700 leading-relaxed">
                We do not share any personally identifying information publicly or
                with third parties, except when required to by law.
              </p>
            </section>

            <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-l-4 border-blue-500">
              <h2 className="text-xl font-bold text-blue-800 mb-3">Legal Compliance</h2>
              <p className="text-slate-700 leading-relaxed">
                We act in the capacity of a data controller and a data processor
                with regard to the personal data processed through coolpix and
                our AI headshot generation services in terms of the applicable data
                protection laws, including the EU General Data Protection Regulation
                (GDPR).
              </p>
            </section>
            <section className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-l-4 border-purple-500">
              <h2 className="text-xl font-bold text-purple-800 mb-3">Our Privacy Principles</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-700 mb-2">🔒 Lawfulness</h3>
                  <p className="text-slate-600 text-sm">We only process your information when we have a lawful basis.</p>
                </div>
                <div className="bg-white/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-2">⚖️ Fairness</h3>
                  <p className="text-slate-600 text-sm">We use your personal data only as necessary to provide our services.</p>
                </div>
                <div className="bg-white/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-700 mb-2">🔍 Transparency</h3>
                  <p className="text-slate-600 text-sm">We provide clear information about our data practices.</p>
                </div>
                <div className="bg-white/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-2">📊 Data Minimization</h3>
                  <p className="text-slate-600 text-sm">We only collect and retain data essential to our service.</p>
                </div>
                <div className="bg-white/50 p-4 rounded-lg md:col-span-2">
                  <h3 className="font-semibold text-purple-700 mb-2">🛡️ Security</h3>
                  <p className="text-slate-600 text-sm">We implement appropriate measures to protect your data.</p>
                </div>
              </div>
            </section>
            <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-l-4 border-blue-500">
              <h2 className="text-xl font-bold text-blue-800 mb-3">External Links</h2>
              <p className="text-slate-700 leading-relaxed">
                Our website may link to external sites that are not operated by us.
                Please be aware that we have no control over the content and
                practices of these sites, and cannot accept responsibility or
                liability for their respective privacy policies.
              </p>
            </section>

            <section className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-l-4 border-purple-500">
              <h2 className="text-xl font-bold text-purple-800 mb-3">Your Rights</h2>
              <p className="text-slate-700 leading-relaxed">
                You are free to refuse our request for your personal information,
                with the understanding that we may be unable to provide you with
                some of your desired services. You have the right to access, correct,
                or delete your personal data at any time.
              </p>
            </section>

            <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-l-4 border-blue-500">
              <h2 className="text-xl font-bold text-blue-800 mb-3">Contact & Acceptance</h2>
              <p className="text-slate-700 leading-relaxed">
                Your continued use of our website will be regarded as acceptance of
                our practices around privacy and personal information. If you have
                any questions about how we handle user data and personal
                information, feel free to contact us at privacy@coolpix.me.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-purple-200 text-center">
            <p className="text-slate-500 text-sm">
              This policy is effective as of{" "}
              {new Date().toLocaleDateString("en-US", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}.
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
