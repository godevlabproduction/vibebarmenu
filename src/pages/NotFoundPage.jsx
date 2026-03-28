import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>404</h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '1.5rem', opacity: 0.7 }}>
          This page does not exist.
        </p>
        <Link
          to="/"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#e2b857',
            color: '#1a1a1a',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          Back to Menu
        </Link>
      </div>
      <Footer />
    </>
  )
}
