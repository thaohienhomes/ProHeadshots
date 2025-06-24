import React from "react";
import Image from "next/image";
import { AvatarFallback, Avatar } from "@/components/ui/avatar";

// Member data
const memberData = [
  { initials: "MB1", imagePath: "/groupBadge/1.jpeg" },
  { initials: "MB2", imagePath: "/groupBadge/2.jpg" },
  { initials: "MB3", imagePath: "/groupBadge/3.jpeg" },
  { initials: "MB4", imagePath: "/groupBadge/4.png" },
  { initials: "MB5", imagePath: "/groupBadge/5.png" },
];

// AvatarGroup component
export const AvatarGroup = () => (
  <div className="flex items-center -space-x-3">
    {memberData.map(({ initials, imagePath }) => (
      <Avatar key={initials} className="border-[3px] border-cyan-400/50 hover:border-cyan-400 transition-colors duration-300 shadow-lg">
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
    <p className="text-base font-semibold text-white">
      92% of customers recommend us
    </p>
    <p className="text-sm font-medium text-navy-300">
      Trusted by 100+ satisfied customers
    </p>
  </div>
);

// Combined AvatarGroupWithInfo component
export const AvatarGroupWithInfo = () => (
  <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start space-y-4 lg:space-y-0 lg:space-x-6 bg-navy-800/30 backdrop-blur-sm border border-cyan-400/20 rounded-full px-6 py-4">
    <AvatarGroup />
    <MembershipInfo />
  </div>
);
