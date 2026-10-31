import { useRef, useState } from "react"
import { Play } from "lucide-react"

const POSTER_SRC = "/how-cupspace-works-cover.jpg"
const VIDEO_SRC = "/how-cupspace-works.mp4"

const ExplainerVideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const play = () => {
    const video = videoRef.current
    if (!video) return
    setPlaying(true)
    void video.play().catch(() => {
      // Native controls stay available if this gesture cannot start playback.
    })
  }

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="border-b-2 border-foreground bg-background"
    >
      <div className="container-custom py-12 sm:py-16 lg:py-20">
        <h2 id="how-it-works-heading" className="sr-only">
          How CupSpace works
        </h2>
        <div className="relative mx-auto max-w-5xl rounded-2xl border-2 border-foreground bg-card shadow-elegant">
          <div className="overflow-hidden rounded-[inherit]">
            <video
              ref={videoRef}
              className="aspect-video w-full bg-background object-contain"
              poster={POSTER_SRC}
              preload="none"
              playsInline
              controls={playing}
              tabIndex={-1}
              aria-label="How CupSpace works"
              onPlay={() => setPlaying(true)}
            >
              <source src={VIDEO_SRC} type="video/mp4" />
            </video>
          </div>
          {!playing && (
            <button
              type="button"
              onClick={play}
              className="group absolute inset-0 cursor-pointer rounded-[inherit] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-accent"
              aria-label="Play How CupSpace works, 40 seconds"
            >
              <span className="absolute inset-0 bg-foreground/0 transition group-hover:bg-foreground/10" />
              <span className="absolute right-3 top-3 flex items-center gap-2 rounded-full border-2 border-foreground bg-accent px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-foreground shadow-elegant transition group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none sm:right-4 sm:top-4 sm:px-4 sm:py-2.5 sm:text-sm">
                <Play className="h-3.5 w-3.5 fill-current sm:h-4 sm:w-4" aria-hidden="true" />
                Play
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default ExplainerVideoSection
