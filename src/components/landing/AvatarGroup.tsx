import React from "react";
import Image from "next/image";
import { AvatarFallback, Avatar } from "@/components/ui/avatar";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

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
      <Avatar key={initials} className="border-[3px] border-cyan-400/50 hover:border-cyan-400 transition-colors duration-300 shadow-lg w-10 h-10">
        <Image
          src={imagePath}
          alt={initials}
          fill
          sizes="40px"
          className="rounded-full object-cover"
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
      <AnimatedCounter
        end={92}
        suffix="% of customers recommend us"
        duration={2.5}
        className="inline"
      />
    </p>
    <p className="text-sm font-medium text-navy-300">
      Trusted by <AnimatedCounter
        end={100}
        suffix="+ satisfied customers"
        duration={2}
        className="inline"
      />
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
