/** Decorative SVG — ambient temperature rings, not data visualization. */
export function TemperatureOrnament() {
  return (
    <svg
      className="temperature-ornament"
      viewBox="0 0 320 320"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="ring-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--iw-sage)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--iw-sage)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="160" cy="160" r="140" fill="url(#ring-glow)" />
      <circle
        cx="160"
        cy="160"
        r="118"
        fill="none"
        stroke="var(--iw-sage)"
        strokeOpacity="0.2"
        strokeWidth="1"
      />
      <circle
        cx="160"
        cy="160"
        r="88"
        fill="none"
        stroke="var(--iw-amber)"
        strokeOpacity="0.45"
        strokeWidth="1.5"
        strokeDasharray="8 14"
        className="ornament-ring-slow"
      />
      <circle
        cx="160"
        cy="160"
        r="58"
        fill="none"
        stroke="var(--iw-mist)"
        strokeOpacity="0.25"
        strokeWidth="1"
        className="ornament-ring-fast"
      />
      <text
        x="160"
        y="168"
        textAnchor="middle"
        className="ornament-label"
        fill="var(--iw-mist)"
      >
        21°
      </text>
    </svg>
  );
}
