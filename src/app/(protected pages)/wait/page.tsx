import Image from "next/image";
import getUser from "@/action/getUser";
import { redirect } from "next/navigation";
import { createTune } from "@/app/api/llm/tune/createTune";
import { sendEmail } from "@/action/sendEmail";

export default async function Page() {
  const userData = await getUser();

  // Check if userData is valid and workStatus is "ongoing" with apiStatus not empty or null
  if (userData && userData.length > 0) {
    const { workStatus, apiStatus, tuneStatus, email } = userData[0];

    if (
      workStatus === "ongoing" &&
      !apiStatus &&
      tuneStatus !== "ongoing" &&
      tuneStatus !== "completed"
    ) {
      await createTune(userData);
      // Send email - Message to users: "Done, please wait...""
      await sendEmail({
        to: email, // Use user's email from userData
        from: process.env.NOREPLY_EMAIL || "noreply@cvphoto.app", // Using env variable with fallback
        templateId: "d-d966d02f4a324abeb43a1d7045da520a", // Replace with your template ID
      });

      // Schedule second email with 2 hour delay - Message to users: "Your photos are ready!"
      const TWO_HOURS_IN_SECONDS = 7200; // 2 hours * 60 minutes * 60 seconds
      const sendAt = Math.floor(
        (Date.now() + TWO_HOURS_IN_SECONDS * 1000) / 1000
      );

      await sendEmail({
        to: email,
        from: process.env.NOREPLY_EMAIL || "noreply@cvphoto.app",
        templateId: "d-e937e48db4b945af9279e85baa1683e4", // Updated template ID for scheduled email
        sendAt: sendAt,
      });
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
    <div className="flex h-screen w-full">
      <div className="w-1/2 h-full relative bg-black">
        <Image
          src="/wait.webp"
          alt="Professional headshot placeholder"
          // Removed legacy props
          fill
          style={{ objectFit: "cover" }} // Use style for objectFit
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black">
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <p className="text-white text-xl font-light italic leading-relaxed">
              &ldquo;I needed a professional headshot and this service was a
              lifesaver!&rdquo;
            </p>
          </div>
        </div>
      </div>
      <div className="w-1/2 h-full flex flex-col justify-center p-12 bg-white">
        <div className="max-w-md">
          <p className="text-sm text-gray-500 mb-2">
            This process can take up to 2 hours
          </p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mb-6 overflow-hidden relative">
            <div className="absolute h-full w-1/4 bg-mainGreen rounded-full animate-progress-piece"></div>
          </div>
          <h2 className="text-xl font-bold mb-2 text-mainBlack">
            Hold tight! We&apos;re preparing your headshots
          </h2>
          <p className="text-gray-600 mb-8">
            Our AI is hard at work to get your headshots ready. You may close
            this screen and come back later.
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              92% of our customers are satisfied.
            </li>
            <li className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Bringing you studio quality headshots at home.
            </li>
            <li className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Founded in Sweden. We respect your high standards.
            </li>
          </ul>
          <p className="mt-4 text-sm text-gray-500">
            You may close this screen and come back later.
          </p>
        </div>
      </div>
    </div>
  );
}
