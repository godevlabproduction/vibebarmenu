export default function BeerIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 90 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="20" width="45" height="75" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M60 35 Q75 35 75 50 Q75 65 60 65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 20 Q25 10 35 12 Q45 8 50 15 Q55 10 58 20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M25 45 L50 45 M25 60 L50 60 M25 75 L50 75" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}
