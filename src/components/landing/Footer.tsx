import React from "react";
import Logo from "@/components/Logo";
import FooterList from "./FooterList";

const FooterLogo: React.FC = () => (
  <div className="flex justify-center md:justify-start mt-4 md:mt-0">
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-primary-500 rounded-lg blur-lg opacity-30" />
        <div className="relative p-2 bg-gradient-to-r from-cyan-500 to-primary-600 rounded-lg">
          <Logo className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
      <span className="font-bold tracking-wide text-white text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-cyan-100 to-primary-200 bg-clip-text text-transparent">
        CVPHOTO
      </span>
    </div>
  </div>
);

const FooterContent: React.FC = () => (
  <div className="text-center md:text-left">
    <p className="mt-4 text-white text-sm leading-relaxed">
      #1 AI Photo Generator in Sweden. Professional headshots powered by Flux Pro Ultra, Imagen4 & Recraft V3
    </p>
    <p className="mt-3 text-navy-300 text-xs">
      Trusted by individuals, teams, and photographers worldwide
    </p>
    <p className="mt-4 text-navy-400 text-xs">
      © 2024 CVPHOTO - All rights reserved
    </p>
  </div>
);

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer className={`relative bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white pt-16 pb-8 overflow-hidden ${className}`}>
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-tl from-primary-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto max-w-section p-section">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-16">
          <div className="flex flex-col items-center md:items-start">
            <FooterLogo />
            <FooterContent />
          </div>
          <div className="col-span-1 md:col-span-3">
            <FooterList />
          </div>
        </div>

        {/* Bottom border */}
        <div className="mt-12 pt-8 border-t border-cyan-400/20">
          <div className="text-center">
            <p className="text-navy-400 text-sm">
              Powered by advanced AI models • Fal.ai Integration • Professional Results
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
