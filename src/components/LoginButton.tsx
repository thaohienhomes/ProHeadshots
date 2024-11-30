"use client";

import React from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";

interface LoginButtonProps {
  className?: string;
  href?: string;
  tracker?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({
  className = "",
  href = "/login",
  tracker,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (tracker) {
      track(tracker);
    }

    // If it's an external link, prevent default and open in a new tab
    if (href.startsWith("http") || href.startsWith("//")) {
      e.preventDefault();
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Link href={href} passHref>
      <span
        onClick={handleClick}
        className={`
          inline-block
          px-8 py-1
          text-white 
          bg-transparent 
          hover:text-gray-300
          transition-colors duration-300
          focus:outline-none
          cursor-pointer
          ${className}
        `}
      >
        Sign In
      </span>
    </Link>
  );
};

export default LoginButton;

// Usage example:
const Example: React.FC = () => {
  return (
    <div className="bg-black p-8 flex items-center justify-center h-screen">
      <LoginButton href="/login" tracker="customEvent" />
    </div>
  );
};
