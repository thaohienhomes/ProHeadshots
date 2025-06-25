import React from "react";
import { AvatarGroupWithInfo } from "@/components/landing/AvatarGroup";
import Image from "next/image";
import Logo from "@/components/Logo";
import CoolPixLogo from "@/components/CoolPixLogo";

const NumberOne = () => (
  <div className="mb-6">
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-primary-500 rounded-full blur-lg opacity-30 animate-pulse" />
      <div className="relative bg-gradient-to-r from-cyan-400 to-primary-500 text-navy-900 px-6 py-3 rounded-full font-bold text-sm tracking-wide">
        #1 AI HEADSHOT GENERATOR
      </div>
    </div>
  </div>
);

const LeftAuth: React.FC = () => {
  return (
    <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex-col justify-center items-center text-center p-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-primary-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <NumberOne />
        <h1 className="text-3xl font-bold mt-6 mb-8 text-center">
          <span className="bg-gradient-to-r from-white via-cyan-100 to-primary-200 bg-clip-text text-transparent">
            Studio Quality AI Headshots
          </span>
          <span className="block mt-2 text-white text-xl">
            at Home
          </span>
        </h1>
        <AvatarGroupWithInfo />
        <div className="flex justify-center mt-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-primary-500/20 rounded-lg blur-lg opacity-50" />
            <div className="relative">
              <CoolPixLogo
                variant="horizontal"
                theme="dark"
                size="md"
                className="transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftAuth;
