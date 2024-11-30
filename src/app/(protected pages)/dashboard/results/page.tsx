import getUser from "@/action/getUser";
import ImageGallery from "./ImageGallery";
import { redirect } from "next/navigation";
import Header from "@/components/Header";

export default async function DashboardPage() {
  const userData = await getUser();

  // Check if workStatus is ongoing and redirect if true
  if (userData?.[0]?.workStatus === "ongoing") {
    redirect("/wait");
  }

  const downloadHistory = userData?.[0]?.downloadHistory || [];

  let imageUrls: string[] = [];
  const promptsResult = userData?.[0]?.promptsResult || [];

  // Extract image URLs from promptsResult
  if (promptsResult.length > 0) {
    imageUrls = promptsResult.flatMap(
      (result: { data?: { prompt?: { images: string[] } } }) =>
        result.data?.prompt?.images || []
    );
  }

  return (
    <main className="min-h-screen bg-mainWhite flex flex-col">
      <Header userAuth={true} backDashboard={true} />
      <section className="flex-grow p-4">
        <ImageGallery
          images={imageUrls}
          downloadHistory={downloadHistory}
          userData={userData?.[0]} // Pass userData to ImageGallery
        />
      </section>
    </main>
  );
}
