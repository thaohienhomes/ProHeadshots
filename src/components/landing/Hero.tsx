import React from "react";
import { Button } from "@/components/ui/button";
import { AvatarGroupWithInfo } from "./AvatarGroup";
import Image from "next/image";
import ParallaxCards from './DemoCard';

const NumberOne = () => (
  <div className="mb-4 flex justify-center">
    <Image
      src="/NumberOne.svg"
      alt="The #1 AI Headshot Generator in Sweden"
      width={200}
      height={50}
      priority
    />
  </div>
);

const HeadingText = () => (
  <h1 className="text-3xl font-semibold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl flex flex-col items-center py-4 max-w-5xl mx-auto">
    <span>Professional headshots</span>
    <span className="mt-4">
      <span className="bg-mainWhite text-mainBlack px-3">studio quality</span>{" "}
      at home
    </span>
  </h1>
);

const Description = () => (
  <p className="text-mainWhite text-opacity-80 text-lg md:text-xl py-2 max-w-3xl mx-auto">
    Get professional headshots in minutes. Upload photos, pick your styles &
    receive 100+ headshots. Created in Sweden.
  </p>
);

const JoinButton = () => (
  <Button
    href="/signup"
    tracker="hero_cta_click"
    className="w-60 h-12 py-2 px-4 text-lg font-semibold flex items-center justify-center rounded-md"
  >
    Get your photos
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 ml-2"
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
  </Button>
);

const HeroImage = () => (
  <div className="w-full aspect-video relative">
    <Image
      src="/placeholder.svg"
      alt="AI Headshot Generator Demo"
      fill
      className="object-cover rounded-lg"
      priority
    />
  </div>
);

const Hero = () => {
  return (
    <section className="w-full bg-mainBlack py-6 lg:py-12">
      <div className="max-w-section mx-auto px-section">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4">
            <NumberOne />
            <HeadingText />
            <Description />
          </div>
          <div className="flex flex-col items-center gap-6">
            <JoinButton />
            <AvatarGroupWithInfo />
          </div>
        </div>
      </div>
      <div className="w-full mt-8">
        <ParallaxCards />
      </div>
    </section>
  );
};

export default Hero;
