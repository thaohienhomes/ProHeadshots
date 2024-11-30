import React from "react";
import dynamic from "next/dynamic";
import Logo from "@/components/Logo";

const FooterList = dynamic(() => import("./FooterList"), { ssr: false });

const FooterLogo: React.FC = () => (
  <div className="flex justify-center md:justify-start mt-4 md:mt-0">
    <div className="flex items-center gap-2 sm:gap-2.5">
      <Logo className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
      <span className="font-sans font-light tracking-wider text-mainWhite text-base sm:text-lg md:text-xl uppercase">
        cvphoto
      </span>
    </div>
  </div>
);

const FooterContent: React.FC = () => (
  <div className="text-center md:text-left">
    <p className="mt-2 text-mainWhite text-sm">
      #1 AI Photo Generator in Sweden. Professional headshots • Studio quality
      at home • 100+ styles
    </p>
    <p className="mt-2 text-mainWhite text-opacity-70 text-xs">
      Trusted by individuals, teams, and photographers
    </p>
    <p className="mt-4 text-mainWhite text-opacity-50 text-xs">
      © 2024 CVPHOTO - All rights reserved
    </p>
  </div>
);

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer className={`bg-mainBlack text-mainWhite pt-8 ${className}`}>
      <div className="container mx-auto max-w-section p-section">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-16">
          <div className="flex flex-col items-center md:items-start">
            <FooterLogo />
            <FooterContent />
          </div>
          <div className="col-span-1 md:col-span-3">
            <FooterList />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
