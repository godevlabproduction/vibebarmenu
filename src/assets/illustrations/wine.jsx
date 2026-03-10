export default function WineIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 10 Q25 50 40 55 Q55 50 55 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M25 10 L55 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 55 L40 95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 95 L52 95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 30 Q40 38 52 30" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeDasharray="2 2" />
    </svg>
  )
}
