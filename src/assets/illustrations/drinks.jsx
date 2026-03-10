export default function DrinksIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 15 L20 90 Q20 100 30 100 L45 100 Q55 100 55 90 L55 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 15 L55 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 35 L55 35" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeDasharray="3 3" />
      <rect x="24" y="50" width="27" height="18" rx="2" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <path d="M65 30 L80 30 L72 55 L72 85 L78 85 M72 55 L72 85 L66 85" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M66 85 L78 85" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
