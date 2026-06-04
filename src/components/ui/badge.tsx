import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/20 bg-primary/10 text-primary shadow-sm",
        accent: "border-accent/20 bg-accent/15 text-accent-foreground shadow-sm",
        muted: "border-transparent bg-muted text-muted-foreground",
        success: "border-success/20 bg-success/12 text-success shadow-sm",
        destructive: "border-destructive/20 bg-destructive/10 text-destructive shadow-sm",
        outline: "border-border text-foreground/70",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
