import React from "react";
import { Button } from "@/components/ui/button";
import { AvatarGroupWithInfo } from "./AvatarGroup";
import OptimizedImage, { imageSizes } from "@/components/OptimizedImage";
import LazySection from "@/components/LazySection";
import { Sparkles, Zap, Camera, Video, Wand2 } from "lucide-react";

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
      Professional AI Headshots
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
    Powered by advanced Fal.ai models including Flux Pro Ultra, Imagen4, and Recraft V3.
    Generate 100+ professional headshots in minutes with our cutting-edge AI technology.
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
  <Button
    href="/auth?mode=signup"
    tracker="hero_cta_click"
    className="relative group w-64 h-14 py-3 px-6 text-lg font-semibold flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-primary-600 hover:from-cyan-400 hover:to-primary-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
  >
    <span className="relative z-10">Generate Your Headshots</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
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
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-primary-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
  </Button>
);

const InteractiveDemo = () => (
  <LazySection
    className="relative max-w-6xl mx-auto px-4 mt-12"
    rootMargin="200px"
    showSkeleton={true}
  >
    <div className="relative bg-gradient-to-br from-navy-800/50 to-navy-900/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-primary-500/5" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10">
        <h3 className="text-center text-white text-xl font-semibold mb-8">
          See the AI Transformation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-primary-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-navy-800/50 border border-navy-600 rounded-xl overflow-hidden">
              <OptimizedImage
                src="/sampleslanding/before0001.png"
                alt="Before photo"
                width={400}
                height={500}
                className="w-full h-full object-cover"
                sizes={imageSizes.card}
                priority={true}
                quality={90}
              />
              <div className="absolute top-4 left-4 bg-navy-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium border border-navy-600">
                📱 Your Selfie
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-primary-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-navy-800/50 border border-cyan-400/30 rounded-xl overflow-hidden">
              <OptimizedImage
                src="/sampleslanding/example0001.png"
                alt="Professional headshot result"
                width={400}
                height={500}
                className="w-full h-full object-cover"
                sizes={imageSizes.card}
                priority={true}
                quality={90}
              />
              <div className="absolute top-4 left-4 bg-gradient-to-r from-cyan-500 to-primary-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
                ✨ AI Generated
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2 text-navy-300 text-sm">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span>Powered by Flux Pro Ultra & Imagen4</span>
          </div>
        </div>
      </div>
    </div>
  </LazySection>
);

const Hero = () => {
  return (
    <section className="relative w-full bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 py-12 lg:py-20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-primary-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-section mx-auto px-section">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-6">
            <NumberOne />
            <HeadingText />
            <Description />
            <AIModelsShowcase />
          </div>
          <div className="flex flex-col items-center gap-8">
            <JoinButton />
            <AvatarGroupWithInfo />
          </div>
        </div>
      </div>

      <InteractiveDemo />
    </section>
  );
};

export default Hero;
