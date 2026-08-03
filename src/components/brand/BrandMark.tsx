import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

const BrandMark = ({
  className,
  inverse = false,
}: {
  className?: string
  inverse?: boolean
}) => (
  <Link
    to="/"
    className={cn("group inline-flex items-center gap-2", className)}
    aria-label="CupSpace home"
  >
    <span
      className={cn(
        "font-display text-xl uppercase leading-none tracking-[-0.055em] sm:text-2xl",
        inverse ? "text-background" : "text-foreground",
      )}
    >
      Cup<span className={inverse ? "text-accent" : "text-primary"}>Space</span>
    </span>
    <span
      className={cn(
        "border px-1.5 py-0.5 text-[0.52rem] font-bold uppercase leading-none tracking-[0.16em] transition-transform group-hover:-rotate-2",
        inverse
          ? "border-background bg-accent text-accent-foreground"
          : "border-foreground bg-accent text-accent-foreground",
      )}
    >
      Cup media
    </span>
  </Link>
)

export default BrandMark
