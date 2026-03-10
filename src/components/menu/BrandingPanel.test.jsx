import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../../context/LanguageContext'
import BrandingPanel from './BrandingPanel'

function renderWithProviders(ui) {
  return render(<LanguageProvider>{ui}</LanguageProvider>)
}

describe('BrandingPanel', () => {
  it('renders VibeBar branding text', () => {
    renderWithProviders(<BrandingPanel />)
    expect(screen.getByText('VibeBar')).toBeInTheDocument()
  })

  it('renders tagline', () => {
    renderWithProviders(<BrandingPanel />)
    expect(screen.getByText(/добра атмосфера|Good Vibes/)).toBeInTheDocument()
  })
})
