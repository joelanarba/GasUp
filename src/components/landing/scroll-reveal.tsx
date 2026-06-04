"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Animation delay in milliseconds */
  delay?: number;
  /** Direction the element slides in from */
  direction?: "up" | "left" | "right";
}

const directionStyles = {
  up: { transform: "translateY(24px)" },
  left: { transform: "translateX(-24px)" },
  right: { transform: "translateX(24px)" },
} as const;

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "-40px" }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        ...(isVisible
          ? { transform: "translate(0, 0)" }
          : directionStyles[direction]),
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
