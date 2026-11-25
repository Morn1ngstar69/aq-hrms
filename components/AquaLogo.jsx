export default function AquaLogo({size=40}) {
  return <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="AQUA HRMS Logo" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="aqua-logo-clip"><rect x="0" y="0" width="200" height="200" rx="28"/></clipPath></defs>
    <rect width="200" height="200" rx="28" fill="#3DBFAD"/>
    <g clipPath="url(#aqua-logo-clip)" opacity="0.18"><text x="4" y="196" fontFamily="Georgia,serif" fontSize="220" fill="white" letterSpacing="-10">AQ</text></g>
    <text x="100" y="118" textAnchor="middle" fontFamily="Georgia,serif" fontSize="64" fill="white" letterSpacing="2">AQUA</text>
    <path d="M72 132 Q84 123 96 130 Q108 137 120 128 Q132 119 144 128" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9"/>
  </svg>
}
