// Small inline SVG pieces: logo, tier indicator and practice-kind icons.
// All decorative; meaning is always also given in text.

export function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <circle cx="16" cy="16" r="9.5" fill="none" stroke="var(--accent-ink)" strokeWidth="1.8" />
      <path d="M16 8l3.6 8-3.6 8-3.6-8z" fill="var(--accent-ink)" />
      <circle cx="16" cy="16" r="1.6" fill="var(--accent)" />
    </svg>
  )
}

// Three bars: 1 filled = Low, 2 = Medium, 3 = High.
export function TierBars({ tier }) {
  const heights = [10, 18, 26]
  return (
    <svg className="tier-bars" width="40" height="30" viewBox="0 0 40 30" aria-hidden="true" focusable="false">
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 14}
          y={30 - h}
          width="10"
          height={h}
          rx="2"
          fill="currentColor"
          opacity={i <= tier ? 1 : 0.22}
        />
      ))}
    </svg>
  )
}

const ICONS = {
  // bar chart
  measure: 'M4 20V10m6 10V4m6 16v-7m6 7H2',
  // two people
  people: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm-7 9c0-3.3 3.1-6 7-6s7 2.7 7 6M17 5.2a3.5 3.5 0 010 6.6M19 14.3c1.8.8 3 2.4 3 4.7',
  // clipboard
  design: 'M9 4h6m-6 0a2 2 0 00-2 2v0H6a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-1v0a2 2 0 00-2-2m-6 0a2 2 0 012-2h2a2 2 0 012 2M8 12h8M8 16h5',
}

export function KindIcon({ kind }) {
  return (
    <svg
      className="kind-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ICONS[kind]} />
    </svg>
  )
}
