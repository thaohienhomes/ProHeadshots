import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AvatarGroupWithInfo } from "./AvatarGroup";
import OptimizedImage, { imageSizes } from "@/components/OptimizedImage";
import LazySection from "@/components/LazySection";
import { Sparkles, Zap, Camera, Video, Wand2 } from "lucide-react";
import TypedText from "@/components/ui/TypedText";
// import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { BorderBeam } from "@/components/ui/border-beam";
// import { useTranslation } from "@/contexts/TranslationContext";

const AIModelBadge = ({ icon: Icon, name, description }: { icon: any, name: string, description: string }) => (
  <div className="group relative bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-4 hover:border-cyan-400/40 transition-all duration-300 hover:scale-105">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-gradient-to-br from-cyan-400 to-primary-500 rounded-lg">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h3 className="font-semibold text-white text-sm">{name}</h3>
    </div>
    <p className="text-navy-300 text-xs leading-relaxed">{description}</p>
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-primary-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </div>
);

const NumberOne = () => (
  <div className="mb-6 flex justify-center">
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-primary-500 rounded-full blur-lg opacity-30 animate-pulse" />
      <div className="relative bg-gradient-to-r from-cyan-400 to-primary-500 text-navy-900 px-6 py-2 rounded-full font-bold text-sm tracking-wide">
        #1 AI HEADSHOT GENERATOR
      </div>
    </div>
  </div>
);

const HeadingText = () => (
  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl flex flex-col items-center py-6 max-w-6xl mx-auto">
    <span className="bg-gradient-to-r from-white via-cyan-100 to-primary-200 bg-clip-text text-transparent">
      <TypedText
        strings={[
          "Professional AI Headshots",
          "Studio Quality Photos",
          "AI-Generated Portraits"
        ]}
        typeSpeed={80}
        backSpeed={50}
        loop={true}
        showCursor={true}
        className="inline-block"
      />
    </span>
    <span className="mt-4 text-white">
      <span className="bg-gradient-to-r from-cyan-400 to-primary-500 text-navy-900 px-4 py-1 rounded-lg font-semibold">
        Studio Quality
      </span>{" "}
      <span className="text-navy-200">at Home</span>
    </span>
  </h1>
);

const Description = () => (
  <p className="text-navy-200 text-lg md:text-xl py-4 max-w-4xl mx-auto leading-relaxed">
    Create stunning, professional headshots with our advanced AI technology. Perfect for LinkedIn, resumes, and professional profiles.
  </p>
);

const AIModelsShowcase = () => (
  <div className="mt-8 mb-8">
    <h2 className="text-center text-navy-300 text-sm font-medium mb-6 tracking-wide uppercase">
      Powered by Advanced AI Models
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
      <AIModelBadge
        icon={Sparkles}
        name="Flux Pro Ultra"
        description="Ultra-high quality headshot generation with photorealistic results"
      />
      <AIModelBadge
        icon={Camera}
        name="Imagen4"
        description="Google's latest image generation model for professional portraits"
      />
      <AIModelBadge
        icon={Wand2}
        name="Recraft V3"
        description="Advanced style control and artistic headshot variations"
      />
      <AIModelBadge
        icon={Video}
        name="Video Profiles"
        description="AI-generated video profiles with Veo3 and Kling Video"
      />
      <AIModelBadge
        icon={Zap}
        name="Enhancement"
        description="AuraSR and Clarity Upscaler for perfect image quality"
      />
    </div>
  </div>
);

const JoinButton = () => (
  <div className="relative">
    <Link href="/auth?mode=signup">
      <button className="relative group w-64 h-14 py-3 px-6 text-lg font-semibold flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-primary-600 hover:from-cyan-400 hover:to-primary-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
        <span className="relative z-10">Generate Your Headshots</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300 relative z-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
        {/* <BorderBeam size={150} duration={12} delay={0} /> */}
      </button>
    </Link>
  </div>
);

const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex items-center justify-center overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-primary-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-400/5 to-primary-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center">
          <NumberOne />
          <HeadingText />
          <Description />
          <AIModelsShowcase />

          <div className="flex flex-col items-center gap-6 mt-8">
            <JoinButton />
            <AvatarGroupWithInfo />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;



