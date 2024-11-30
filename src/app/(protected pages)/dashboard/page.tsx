import Header from "@/components/Header";
import Link from "next/link";
import getUser from "@/action/getUser";
import { redirect } from "next/navigation";
import { CheckCircle } from "lucide-react"; // Add this import at the top of the file

export const metadata = {
  title: "Your Dashboard | AI Headshot Generator",
  description:
    "Manage your AI-generated headshots, account settings, and subscription plan.",
};

export default async function DashboardPage() {
  const userData = await getUser();

  if (!userData || userData.length === 0) {
    // Handle the case when no user data is found
    redirect("/");
  }

  const user = userData[0];

  if (
    !user.workStatus ||
    user.workStatus === "" ||
    user.workStatus === "NULL"
  ) {
    redirect("/upload/intro");
  } else if (user.workStatus === "ongoing") {
    redirect("/wait");
  }

  //console.log("userData here:", userData);

  // Only render the dashboard if workStatus is 'complete'
  return (
    <main className="min-h-screen bg-mainWhite">
      <Header userAuth={true} />

      <section className="max-w-2xl mx-auto mt-12 p-5">
        <h1 className="text-3xl font-bold text-mainBlack mb-3 text-center">
          Your Headshots Are Ready!
        </h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Click below to view your results. Remember, they&apos;ll be
          automatically deleted after 30 days.
        </p>

        <Link href="/dashboard/results" className="block">
          <article className="p-6 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <p className="text-sm font-medium text-gray-700">
                Your photos are ready for viewing
              </p>
            </div>
            <div
              className="w-full text-center px-6 py-3 text-sm font-medium rounded-md transition-colors text-mainBlack bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-mainOrange"
              aria-label="View Your Headshot Results"
            >
              View Your Results →
            </div>
          </article>
        </Link>
      </section>
    </main>
  );
}
