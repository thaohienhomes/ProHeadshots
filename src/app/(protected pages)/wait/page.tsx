import getUser from "@/action/getUser";
import { redirect } from "next/navigation";
import { createTune } from "@/app/api/llm/tune/createTune";
import { sendProcessingStartedEmail, sendScheduledProcessingCompleteEmail } from "@/action/emailActions";
import WaitPageContent from "@/components/wait/WaitPageContent";

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

  return <WaitPageContent />;
}
