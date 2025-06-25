import React from "react";
import Logo from "@/components/Logo";
import CoolPixLogo from "@/components/CoolPixLogo";
import FooterList from "./FooterList";

const FooterLogo: React.FC = () => (
  <div className="flex justify-center md:justify-start mt-4 md:mt-0">
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-primary-500/20 rounded-lg blur-lg opacity-50" />
      <div className="relative">
        <CoolPixLogo
          variant="horizontal"
          theme="dark"
          size="sm"
          className="transition-transform duration-300 hover:scale-105"
        />
      </div>
    </div>
  </div>
);

const FooterContent: React.FC = () => (
  <div className="text-center md:text-left">
    <p className="mt-4 text-white text-sm leading-relaxed">
      Professional AI-generated headshots powered by cutting-edge technology. Create stunning headshots in minutes.
    </p>
    <p className="mt-3 text-navy-300 text-xs">
      Trusted by professionals, teams, and businesses worldwide
    </p>
    <p className="mt-4 text-navy-400 text-xs">
      © 2024 coolpix - All rights reserved
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
              Powered by Fal AI • Polar Payments • SendGrid Email • Professional Results
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
