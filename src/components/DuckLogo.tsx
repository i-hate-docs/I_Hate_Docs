type Props = { className?: string; title?: string };

export function DuckLogo({ className, title = "I Hate Docs" }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-label={title}
      role="img"
    >
      <defs>
        <linearGradient id="duck-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE45C" />
          <stop offset="60%" stopColor="#FFD400" />
          <stop offset="100%" stopColor="#FF8A00" />
        </linearGradient>
        <linearGradient id="duck-beak" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF8A00" />
          <stop offset="100%" stopColor="#FF5A00" />
        </linearGradient>
        <radialGradient id="duck-shine" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      {/* body */}
      <ellipse cx="36" cy="42" rx="20" ry="14" fill="url(#duck-body)" />
      {/* head */}
      <circle cx="22" cy="26" r="12" fill="url(#duck-body)" />
      {/* beak */}
      <path
        d="M10 26 q-6 1 -6 4 q0 3 6 4 q4 0.5 8 -1 z"
        fill="url(#duck-beak)"
      />
      {/* eye */}
      <circle cx="20" cy="23" r="2.2" fill="#0A0A0A" />
      <circle cx="20.6" cy="22.4" r="0.7" fill="#fff" />
      {/* wing */}
      <path
        d="M30 38 q10 -6 22 0 q-6 8 -16 8 q-7 0 -6 -8 z"
        fill="rgba(0,0,0,0.18)"
      />
      {/* shine */}
      <ellipse cx="22" cy="22" rx="9" ry="9" fill="url(#duck-shine)" />
    </svg>
  );
}
