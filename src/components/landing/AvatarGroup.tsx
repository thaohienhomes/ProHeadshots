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
  <div className="flex items-center -space-x-4">
    {memberData.map(({ initials, imagePath }) => (
      <Avatar key={initials} className="border-[5px] border-mainBlack">
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
