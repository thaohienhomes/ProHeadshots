"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { track } from "@vercel/analytics";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-gray-950 focus-visible:ring-gray-300",
  {
    variants: {
      variant: {
        default:
          "bg-mainWhite text-gray-50 hover:bg-gray-900/90 bg-mainWhite text-mainBlack hover:bg-gray-50/90",
        destructive:
          "bg-red-500 text-gray-50 hover:bg-red-500/90 bg-red-900 text-gray-50 hover:bg-red-900/90",
        outline:
          "border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 border-gray-800 bg-gray-950 hover:bg-gray-800 hover:text-gray-50",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-100/80 bg-gray-800 text-gray-50 hover:bg-gray-800/80",
        ghost:
          "hover:bg-gray-100 hover:text-gray-900 hover:bg-gray-800 hover:text-gray-50",
        link: "text-gray-900 underline-offset-4 hover:underline text-gray-50",
        mainOrange:
          "bg-mainOrange text-[#1A1A1A] hover:bg-mainOrange/90 focus-visible:ring-mainOrange",
        transparent:
          "bg-transparent text-mainBlack border border-mainBlack hover:bg-mainBlack hover:text-white hover:bg-mainBlack hover:text-white",
        mainBlack:
          "bg-mainBlack text-mainWhite hover:bg-mainBlack/80 focus-visible:ring-mainWhite",
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
        // Here you would implement your tracking logic
        //console.log(`Tracked: ${tracker}`);
        track(`${tracker}`);
        console.log("button click, tracker value:", tracker);
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
