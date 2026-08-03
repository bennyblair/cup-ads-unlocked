import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const heroButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-none border-2 border-foreground text-sm font-bold uppercase tracking-[0.08em] ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-[5px_5px_0_hsl(var(--foreground))] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_hsl(var(--foreground))] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_hsl(var(--foreground))]",
        outline: "bg-background text-foreground shadow-[5px_5px_0_hsl(var(--accent))] hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-12 px-7 py-3",
        lg: "h-14 px-8 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface HeroButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof heroButtonVariants> {
  asChild?: boolean
}

const HeroButton = React.forwardRef<HTMLButtonElement, HeroButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(heroButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
HeroButton.displayName = "HeroButton"

export { HeroButton, heroButtonVariants }
