export default function CocktailIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 10 L80 10 L52 55 L52 95 L65 95 M48 55 L48 95 L35 95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M35 95 L65 95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="70" cy="15" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M25 25 L55 25" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <path d="M72 8 L78 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M60 5 Q65 -2 72 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}
