import React from "react";
import { AvatarGroupWithInfo } from "@/components/landing/AvatarGroup";
import Image from "next/image";
import Logo from "@/components/Logo";

const NumberOne = () => (
  <div className="mb-4">
    <Image
      src="/NumberOne.svg"
      alt="The #1 AI Headshot Generator in Sweden"
      width={200}
      height={50}
      priority
    />
  </div>
);

const LeftAuth: React.FC = () => {
  return (
    <div className="hidden md:flex md:w-1/2 bg-mainBlack flex-col justify-center items-center text-center p-12">
      <div className="flex flex-col items-center mb-20">
        <NumberOne />
        <h1 className="text-xl font-bold mt-4 mb-6 text-center text-mainWhite">
          Studio Quality Photos at Home.
        </h1>
        <AvatarGroupWithInfo />
        <div className="flex items-center gap-2 mt-10">
          <Logo className="w-7 h-7" />
          <span className="font-sans font-light tracking-wider text-mainWhite text-xl uppercase">
            cvphoto
          </span>
        </div>
      </div>
      <div className="flex justify-center w-full"></div>
    </div>
  );
};

export default LeftAuth;
