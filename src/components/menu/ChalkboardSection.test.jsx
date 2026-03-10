import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../../context/LanguageContext'
import ChalkboardSection from './ChalkboardSection'

function renderWithProviders(ui) {
  return render(<LanguageProvider>{ui}</LanguageProvider>)
}

const mockCategory = { id: '1', name_mk: 'Коктели', name_en: 'Cocktails' }
const mockItems = [
  { id: '1', category_id: '1', name_mk: 'Мохито', name_en: 'Mojito', description_mk: 'Рум, нане', description_en: 'Rum, mint', price: 350, tags: ['vegan'] },
]

describe('ChalkboardSection', () => {
  it('renders category heading', () => {
    renderWithProviders(<ChalkboardSection category={mockCategory} items={mockItems} />)
    expect(screen.getByText(/Коктели|Cocktails/)).toBeInTheDocument()
  })

  it('renders menu items', () => {
    renderWithProviders(<ChalkboardSection category={mockCategory} items={mockItems} />)
    expect(screen.getByText(/Мохито|Mojito/)).toBeInTheDocument()
  })

  it('shows empty message when no items', () => {
    renderWithProviders(<ChalkboardSection category={mockCategory} items={[]} />)
    expect(screen.getByText(/Нема достапни|No items/)).toBeInTheDocument()
  })
})
