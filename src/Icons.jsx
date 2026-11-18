/* Ícones SVG vetoriais (traço fino, estilo Lucide) — sem dependências externas */
const PATHS = {
  shield: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  home: (
    <>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3 19.5c.4-3.2 2.8-5.2 6-5.2s5.6 2 6 5.2" />
      <path d="M16 5.6a3.1 3.1 0 0 1 0 5.8" />
      <path d="M18 14.6c1.7.6 2.8 2.2 3 4.9" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c.5-3.9 3.6-6.2 7.5-6.2s7 2.3 7.5 6.2" />
    </>
  ),
  mapPin: (
    <>
      <path d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  phone: (
    <>
      <path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 5.3 5.3l1.4-2.2L19 14.5V18a2 2 0 0 1-2 2A13 13 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </>
  ),
  siren: (
    <>
      <path d="M7 18v-6a5 5 0 0 1 10 0v6" />
      <path d="M5 18h14v2.5H5z" />
      <path d="M12 3v2M4.5 6l1.4 1.4M19.5 6l-1.4 1.4M2.5 12H4M20 12h1.5" />
    </>
  ),
  radio: (
    <>
      <circle cx="12" cy="12" r="1.6" />
      <path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13.5" r="7" />
      <path d="M12 10v3.5l2.2 1.5" />
      <path d="M9.5 3h5" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V4.5h5V7" />
      <path d="M6.5 7l.8 12.5h9.4L17.5 7" />
      <path d="M10 11v5.5M14 11v5.5" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </>
  ),
  chevronRight: <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  dot: <circle cx="12" cy="12" r="5" fill="currentColor" />,
  dotOutline: <circle cx="12" cy="12" r="5" />,
}

export default function Icon({ name, size = 20, strokeWidth = 1.7, className = '', style }) {
  return (
    <svg
      className={`svg-ico ${className}`}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
