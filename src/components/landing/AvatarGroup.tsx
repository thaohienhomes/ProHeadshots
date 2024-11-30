import React from "react";
import Image from "next/image";
import { AvatarFallback, Avatar } from "@/components/ui/avatar";

// Member data
const memberData = [
  { initials: "EAS", imagePath: "/democard/demo2-selfie.webp" },
  { initials: "YUS", imagePath: "/democard/demo5-selfie.webp" },
  { initials: "RO", imagePath: "/democard/demo6-selfie.webp" },
  { initials: "BE", imagePath: "/democard/demo8-selfie.webp" },
  { initials: "ST", imagePath: "/democard/demo3-selfie.webp" },
];

// AvatarGroup component
export const AvatarGroup = () => (
  <div className="flex items-center -space-x-4">
    {memberData.map(({ initials, imagePath }) => (
      <Avatar key={initials} className="border-4 border-mainBlack">
        <Image
          src={imagePath}
          alt={initials}
          width={40}
          height={40}
          className="rounded-full"
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    ))}
  </div>
);

// MembershipInfo component
export const MembershipInfo = () => (
  <div className="text-left">
    <p className="text-m font-semibold text-mainWhite">
      {" "}
      92% of customers recommend us
    </p>
    <p className="text-sm font-semibold text-opacity-80 text-mainWhite">
      Trusted by 100+ satisfied customers
    </p>
  </div>
);

// Combined AvatarGroupWithInfo component
export const AvatarGroupWithInfo = () => (
  <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start space-y-4 lg:space-y-0 lg:space-x-4">
    <AvatarGroup />
    <MembershipInfo />
  </div>
);
