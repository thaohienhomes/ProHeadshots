"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { track } from "@vercel/analytics";
import { logger } from "@/utils/logger";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary design system variants
        default:
          "bg-gradient-to-r from-cyan-500 to-primary-600 text-white hover:from-cyan-400 hover:to-primary-500 shadow-lg hover:shadow-xl hover:scale-105 focus-visible:ring-cyan-400",
        primary:
          "bg-gradient-to-r from-cyan-500 to-primary-600 text-white hover:from-cyan-400 hover:to-primary-500 shadow-lg hover:shadow-xl hover:scale-105 focus-visible:ring-cyan-400",
        primaryOutline:
          "border-2 border-cyan-400 text-cyan-400 bg-transparent hover:bg-cyan-400 hover:text-navy-900 focus-visible:ring-cyan-400",
        navy:
          "bg-navy-800 text-white hover:bg-navy-700 border border-navy-600 hover:border-navy-500 focus-visible:ring-navy-400",
        glass:
          "bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 text-white hover:border-cyan-400/40 hover:bg-navy-700/50 focus-visible:ring-cyan-400",
        accent:
          "bg-gradient-to-r from-accent-500 to-cyan-500 text-white hover:from-accent-400 hover:to-cyan-400 shadow-lg hover:shadow-xl hover:scale-105 focus-visible:ring-accent-400",

        // Utility variants
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl focus-visible:ring-red-400",
        outline:
          "border-2 border-navy-600 bg-transparent text-white hover:bg-navy-800 hover:border-navy-500 focus-visible:ring-navy-400",
        secondary:
          "bg-navy-700 text-white hover:bg-navy-600 border border-navy-600 hover:border-navy-500 focus-visible:ring-navy-400",
        ghost:
          "text-white hover:bg-navy-800/50 hover:backdrop-blur-sm focus-visible:ring-cyan-400",
        link:
          "text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300 focus-visible:ring-cyan-400",

        // Legacy variants (deprecated - use new variants instead)
        mainOrange:
          "bg-gradient-to-r from-cyan-500 to-primary-600 text-white hover:from-cyan-400 hover:to-primary-500 shadow-lg hover:shadow-xl hover:scale-105 focus-visible:ring-cyan-400",
        transparent:
          "border-2 border-cyan-400 text-cyan-400 bg-transparent hover:bg-cyan-400 hover:text-navy-900 focus-visible:ring-cyan-400",
        mainBlack:
          "bg-navy-800 text-white hover:bg-navy-700 border border-navy-600 hover:border-navy-500 focus-visible:ring-navy-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  tracker?: string;
  href?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, tracker, href, ...props },
    ref
  ) => {
    const router = useRouter();
    const Comp = asChild ? Slot : "button";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (tracker) {
        // Track with both Vercel Analytics and our logger
        track(`${tracker}`);
        logger.user('Button clicked', undefined, {
          tracker,
          href,
          variant,
          size
        });
      }

      if (href) {
        e.preventDefault();
        router.push(href);
      }

      if (props.onClick) {
        props.onClick(e);
      }
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
