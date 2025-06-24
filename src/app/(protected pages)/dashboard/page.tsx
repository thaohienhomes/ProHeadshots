import Header from "@/components/Header";
import Link from "next/link";
import getUser from "@/action/getUser";
import { redirect } from "next/navigation";
import { CheckCircle, Sparkles, Download, Eye, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Your Dashboard | AI Headshot Generator",
  description:
    "Manage your AI-generated headshots, account settings, and subscription plan.",
};

const StatsCard = ({ icon: Icon, title, value, description, gradient }: {
  icon: any;
  title: string;
  value: string;
  description: string;
  gradient: string;
}) => (
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300" style={{ background: gradient }} />
    <div className="relative bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6 hover:border-cyan-400/40 transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-lg" style={{ background: gradient }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
      </div>
      <p className="text-navy-300 text-xs">{description}</p>
    </div>
  </div>
);

const AIModelUsed = ({ model, quality }: { model: string; quality: string }) => (
  <div className="flex items-center gap-2 text-sm">
    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
    <span className="text-navy-300">{model}</span>
    <span className="text-cyan-400 font-medium">({quality})</span>
  </div>
);

export default async function DashboardPage() {
  const userData = await getUser();

  if (!userData || userData.length === 0) {
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

  // Calculate stats based on user data
  const totalImages = user.promptsResult?.flatMap((result: any) => result.data?.prompt?.images || []).length || 0;
  const planType = user.planType || "Basic";
  const createdDate = new Date(user.created_at || Date.now()).toLocaleDateString();

  return (
    <main className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      <Header userAuth={true} />

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto pt-12 p-6">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <CheckCircle className="w-4 h-4" />
            Generation Complete
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Your AI Headshots Are Ready!
          </h1>
          <p className="text-navy-300 text-lg max-w-2xl mx-auto">
            Your professional headshots have been generated using advanced AI models.
            View, download, and manage your results below.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Sparkles}
            title="Images Generated"
            value={totalImages.toString()}
            description="High-quality AI headshots"
            gradient="linear-gradient(135deg, #22d3ee, #0ea5e9)"
          />
          <StatsCard
            icon={Zap}
            title="Plan Type"
            value={planType}
            description="Current subscription"
            gradient="linear-gradient(135deg, #14b8a6, #06b6d4)"
          />
          <StatsCard
            icon={Calendar}
            title="Created"
            value={createdDate}
            description="Generation date"
            gradient="linear-gradient(135deg, #8b5cf6, #a855f7)"
          />
          <StatsCard
            icon={Download}
            title="Downloads"
            value={user.downloadHistory?.length || "0"}
            description="Images downloaded"
            gradient="linear-gradient(135deg, #f59e0b, #d97706)"
          />
        </div>

        {/* AI Models Used */}
        <div className="bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6 mb-8">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            AI Models Used
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AIModelUsed model="Flux Pro Ultra" quality="Ultra HD" />
            <AIModelUsed model="Imagen4" quality="Professional" />
            <AIModelUsed model="Recraft V3" quality="Artistic" />
          </div>
        </div>

        {/* Main Action Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-primary-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative bg-navy-800/50 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-cyan-500 to-primary-600 rounded-2xl">
                  <Eye className="w-8 h-8 text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">
                View Your Professional Headshots
              </h2>
              <p className="text-navy-300 mb-8 max-w-2xl mx-auto">
                Your AI-generated headshots are ready for download. Remember, they&apos;ll be
                automatically deleted after 30 days, so make sure to save your favorites.
              </p>

              <Link href="/dashboard/results">
                <Button variant="primary" className="w-full md:w-auto px-8 py-4 text-lg">
                  View Your Results
                  <CheckCircle className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-navy-400 text-sm">
            Need help? Contact our support team or check out our{" "}
            <Link href="/faq" className="text-cyan-400 hover:text-cyan-300 underline">
              FAQ section
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
