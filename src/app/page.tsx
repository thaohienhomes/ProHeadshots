import { cookies } from "next/headers";
import Hero from "@/components/landing/Hero";
import HeroSteps from "@/components/landing/HeroSteps";
import Gallery from "@/components/landing/Gallery";
import Footer from "@/components/landing/Footer";
import Header from "@/components/Header";
import Pitch1 from "@/components/landing/Pitch1";
import Pitch2 from "@/components/landing/Pitch2";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import EnhancedFaq from "@/components/landing/EnhancedFaq";

export default async function Home() {
  const cookieStore = await cookies();
  const getUtm = cookieStore.get("utm_source")?.value;
  const utmSource = getUtm || "None";
  console.log("Home component - UTM Source:", utmSource);

  return (
    <div className="flex flex-col items-center">
      <Header />
      <Hero />
      <HeroSteps />
      <Gallery />
      <Pitch1 />
      <Pitch2 />
      <Pricing />
      <Testimonials />
      <EnhancedFaq />
      <Footer />
    </div>
  );
}
