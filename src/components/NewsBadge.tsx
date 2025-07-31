import React from "react";

interface NewsBadgeProps {}

const NewsBadge: React.FC<NewsBadgeProps> = () => {
  return (
    <div className="inline-block">
      <div
        className="bg-gradient-to-br from-cyan-400/20 to-cyan-500/30 border border-cyan-400/40 text-cyan-100 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center backdrop-blur-sm hover:from-cyan-400/30 hover:to-cyan-500/40 hover:border-cyan-400/60 transition-all duration-300 animated-gradient"
        aria-label="New feature announcement"
      >
        <span className="font-bold">New! We upgraded our photo quality.</span>
      </div>
    </div>
  );
};

export default NewsBadge;
