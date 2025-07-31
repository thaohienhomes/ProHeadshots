'use client';

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  delay?: number;
}

export const BorderBeam = ({
  className,
  size = 200,
  duration = 15,
  borderWidth = 1,
  delay = 0,
}: BorderBeamProps) => {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",
        className
      )}
      style={
        {
          "--size": size,
          "--duration": duration,
          "--border-width": borderWidth,
          "--delay": `-${delay}s`,
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 rounded-[inherit] [background:conic-gradient(from_calc(var(--angle)*1deg),transparent_0,#06b6d4_calc(var(--size)*1px),#0891b2_calc(var(--size)*2px),transparent_calc(var(--size)*3px))] [mask:linear-gradient(white,white)_padding-box,linear-gradient(white,white)]"
        style={{
          maskComposite: "xor",
          animation: `border-beam calc(var(--duration)*1s) infinite linear`,
          animationDelay: `var(--delay)`,
        }}
      />
    </div>
  );
};
