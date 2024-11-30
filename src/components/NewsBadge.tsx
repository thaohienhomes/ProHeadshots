import React from "react";

interface NewsBadgeProps {}

const NewsBadge: React.FC<NewsBadgeProps> = () => {
  return (
    <div className="inline-block">
      <div
        className="bg-gradient-to-br from-mainGreen to-[#91b34a] text-mainBlack text-xs font-medium px-3 py-1.5 rounded-md flex items-center animated-gradient"
        aria-label="New feature announcement"
      >
        <span className="font-bold">New! We upgraded our photo quality.</span>
      </div>
    </div>
  );
};

export default NewsBadge;
