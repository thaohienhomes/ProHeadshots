import Image from "next/image";
import getUser from "@/action/getUser";
import { redirect } from "next/navigation";
import { createTune } from "@/app/api/llm/tune/createTune";
import { sendProcessingStartedEmail, sendScheduledProcessingCompleteEmail } from "@/action/emailActions";

export default async function Page() {
  const userData = await getUser();

  // Check if userData is valid and workStatus is "ongoing" with apiStatus not empty or null
  if (userData && userData.length > 0) {
    const { workStatus, apiStatus, tuneStatus, email } = userData[0];

    // 🛡️ SIMPLIFIED - createTune now handles all race condition protection
    // Note: Middleware ensures users only reach this page if they have complete data
    if (workStatus === "ongoing" && !apiStatus) {
      await createTune(userData);

      // Send processing started email
      await sendProcessingStartedEmail({
        firstName: userData[0]?.name || 'there',
        email: email,
        estimatedTime: '10-15 minutes',
        dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}/dashboard`,
        supportUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://coolpix.me'}/support`
      });

      // Schedule completion email with 2 hour delay
      const TWO_HOURS_IN_SECONDS = 7200; // 2 hours * 60 minutes * 60 seconds
      await sendScheduledProcessingCompleteEmail(email, TWO_HOURS_IN_SECONDS);
    }

    if (userData && userData.length > 0) {
      const { workStatus } = userData[0];

      if (workStatus === "completed") {
        redirect("/dashboard");
      } else if (workStatus === "ongoing") {
        // Do nothing, continue to render the waiting page
      } else {
        redirect("/upload/intro");
      }
    } else {
      redirect("/upload/intro");
    }
  } else {
    redirect("/upload/intro");
  }

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      <div className="w-1/2 h-full relative">
        <Image
          src="/wait.webp"
          alt="Professional headshot placeholder"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-900/80">
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6">
              <p className="text-white text-xl font-light italic leading-relaxed">
                &ldquo;I needed a professional headshot and this service was a
                lifesaver!&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-1/2 h-full flex flex-col justify-center p-12 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary-500/5 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="max-w-md relative z-10">
          <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                AI Processing
              </div>
              <p className="text-navy-300 text-sm mb-4">
                This process can take up to 2 hours
              </p>
              <div className="w-full bg-navy-700 rounded-full h-3 mb-6 overflow-hidden relative">
                <div className="absolute h-full w-1/4 bg-gradient-to-r from-cyan-500 to-primary-600 rounded-full animate-progress-piece shadow-lg"></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-white">
              Hold tight! We&apos;re preparing your AI headshots
            </h2>
            <p className="text-navy-300 mb-8 leading-relaxed">
              Our advanced AI models (Flux Pro Ultra, Imagen4, Recraft V3) are working hard to generate your professional headshots. You may close this screen and come back later.
            </p>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-3 text-cyan-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white">92% of our customers are satisfied.</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-3 text-cyan-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white">Bringing you studio quality headshots at home.</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 mr-3 text-cyan-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white">Founded in Sweden. We respect your high standards.</span>
              </li>
            </ul>

            <div className="mt-6 pt-6 border-t border-cyan-400/20">
              <p className="text-navy-300 text-sm">
                You may close this screen and come back later. We&apos;ll email you when your headshots are ready!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
