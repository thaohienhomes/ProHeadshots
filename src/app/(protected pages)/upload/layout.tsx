import Header from "@/components/Header";
import getUser from "@/action/getUser";

export const metadata = {
  title: "Your Dashboard | AI Headshot Generator",
  description:
    "Manage your AI-generated headshots, account settings, and subscription plan.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await getUser();

  return (
    <main className="min-h-screen bg-mainWhite">
      <Header userAuth={true} />
      {children}
    </main>
  );
}
