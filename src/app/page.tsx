import { cookies } from "next/headers";
import Hero from "@/components/landing/Hero";
import HeroSteps from "@/components/landing/HeroSteps";
import Gallery from "@/components/landing/Gallery";
import Footer from "@/components/landing/Footer";
import Header from "@/components/Header";
import Pitch1 from "@/components/landing/Pitch1";
import Pitch2 from "@/components/landing/Pitch2";
import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";

export default function Home() {
  const getUtm = cookies().get("utm_source")?.value;
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
      <Faq />
      <Footer />
    </div>
  );
}
