import clsx from "clsx"

const paletteByTheme = {
  light: {
    chain: "text-slate-900",
    pulse: "text-[#2f49b7]",
    meta: "text-slate-500"
  },
  dark: {
    chain: "text-white",
    pulse: "text-[#8bbdff]",
    meta: "text-slate-300"
  }
}

export function ChainPulseMark({ className = "", title = "ChainPulse logo" }) {
  return (
    <svg
      viewBox="0 0 212 212"
      role="img"
      aria-label={title}
      className={clsx("h-12 w-12 shrink-0", className)}
    >
      <rect width="212" height="212" rx="42" fill="#2F49B7" />
      <rect x="44" y="74" width="68" height="56" rx="22" fill="none" stroke="#FFFFFF" strokeWidth="12" />
      <path d="M110 102H120" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
      <rect x="100" y="74" width="68" height="56" rx="22" fill="none" stroke="#8BBDFF" strokeWidth="12" />
      <path
        d="M117 38L99 95H118L94 174L127 116H107L117 38Z"
        fill="#FFC62B"
        stroke="#FFC62B"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ChainPulseLogo({
  className = "",
  markClassName = "",
  nameClassName = "",
  metaClassName = "",
  theme = "light",
  layout = "horizontal",
  showName = true,
  showTagline = false,
  subtitle = "",
  tagline = "Supply Chain Intelligence"
}) {
  const palette = paletteByTheme[theme] || paletteByTheme.light
  const stacked = layout === "stacked"

  return (
    <div
      className={clsx(
        "flex",
        stacked ? "flex-col items-center text-center gap-4" : "items-center gap-3",
        className
      )}
    >
      <ChainPulseMark className={clsx(stacked ? "h-24 w-24 sm:h-28 sm:w-28" : "h-12 w-12", markClassName)} />
      {showName ? (
        <div className={clsx("min-w-0", stacked ? "space-y-3" : "space-y-0.5")}>
          <div
            className={clsx(
              "font-semibold tracking-tight",
              stacked ? "text-4xl leading-none sm:text-5xl" : "text-lg leading-tight",
              nameClassName
            )}
          >
            {stacked ? (
              <>
                <span className={clsx("block", palette.chain)}>Chain</span>
                <span className={clsx("block", palette.pulse)}>Pulse</span>
              </>
            ) : (
              <>
                <span className={palette.chain}>Chain</span>
                <span className={clsx("ml-1", palette.pulse)}>Pulse</span>
              </>
            )}
          </div>
          {subtitle ? <p className={clsx("text-sm leading-tight", palette.meta, metaClassName)}>{subtitle}</p> : null}
          {showTagline ? (
            <p
              className={clsx(
                "uppercase",
                stacked ? "text-[0.62rem] tracking-[0.42em] sm:text-xs" : "text-[0.62rem] tracking-[0.26em]",
                palette.meta,
                metaClassName
              )}
            >
              {tagline}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
