import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

const BrandMark = ({
  className,
  compactOnMobile = false,
}: {
  className?: string
  compactOnMobile?: boolean
}) => (
  <Link
    to="/"
    className={cn("group inline-flex items-center gap-2", className)}
    aria-label="CupSpace home"
  >
    <span className="font-display text-xl uppercase leading-none tracking-[-0.055em] text-foreground sm:text-2xl">
      Cup<span className="text-primary">Space</span>
    </span>
    <span
      className={cn(
        "border border-foreground bg-accent px-1.5 py-0.5 text-[0.52rem] font-bold uppercase leading-none tracking-[0.16em] text-accent-foreground transition-transform group-hover:-rotate-2",
        compactOnMobile && "hidden min-[400px]:inline-block",
      )}
    >
      Cup media
    </span>
  </Link>
)

export default BrandMark
