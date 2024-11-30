"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Privacy() {
  const router = useRouter();

  useEffect(() => {
    // Set the document title
    document.title = "Privacy Policy | CVPHOTO.app";
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
            Privacy Policy
          </h1>
          <p className="mb-4">
            Your privacy is important to us. It is CVPHOTO&apos;s policy to
            respect your privacy regarding any information we may collect from
            you across our website, CVPHOTO.app, and other sites we own and
            operate.
          </p>
          <p className="mb-4">
            We only ask for personal information when we truly need it to
            provide our AI headshot generation service to you. We collect it by
            fair and lawful means, with your knowledge and consent. We also let
            you know why we are collecting it and how it will be used.
          </p>
          <p className="mb-4">
            When you use our service, we collect the photos you upload to
            generate AI headshots. These photos are used solely for the purpose
            of creating your AI-generated headshots and are deleted from our
            servers within 7 days. You can also choose to delete them instantly
            at any time.
          </p>
          <p className="mb-4">
            We retain your account information and generated headshots for as
            long as necessary to provide you with our service. What data we
            store, we protect within commercially acceptable means to prevent
            loss and theft, as well as unauthorized access, disclosure, copying,
            use, or modification.
          </p>
          <p className="mb-4">
            We do not share any personally identifying information publicly or
            with third parties, except when required to by law.
          </p>
          <p className="mb-4">
            We act in the capacity of a data controller and a data processor
            with regard to the personal data processed through CVPHOTO.app and
            our AI headshot generation services in terms of the applicable data
            protection laws, including the EU General Data Protection Regulation
            (GDPR).
          </p>
          <p className="mb-4">Our key privacy principles include:</p>
          <ul className="list-disc pl-8 mb-4">
            <li>
              Lawfulness: We only process your information when we have a lawful
              basis.
            </li>
            <li>
              Fairness: We use your personal data only as necessary to provide
              our services.
            </li>
            <li>
              Transparency: We provide clear information about our data
              practices.
            </li>
            <li>
              Data Minimization: We only collect and retain data essential to
              our service.
            </li>
            <li>
              Security: We implement appropriate measures to protect your data.
            </li>
          </ul>
          <p className="mb-4">
            Our website may link to external sites that are not operated by us.
            Please be aware that we have no control over the content and
            practices of these sites, and cannot accept responsibility or
            liability for their respective privacy policies.
          </p>
          <p className="mb-4">
            You are free to refuse our request for your personal information,
            with the understanding that we may be unable to provide you with
            some of your desired services.
          </p>
          <p className="mb-4">
            Your continued use of our website will be regarded as acceptance of
            our practices around privacy and personal information. If you have
            any questions about how we handle user data and personal
            information, feel free to contact us.
          </p>
          <p className="mb-4">
            Visiting Address: Sveavägen 38, 111 34 Stockholm, Sweden.
          </p>
          <p className="text-center mt-8">
            This policy is effective as of{" "}
            {new Date().toLocaleDateString("en-SE")}.
          </p>
        </main>
      </div>
    </div>
  );
}
