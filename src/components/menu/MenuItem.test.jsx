import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '../../context/LanguageContext'
import MenuItem from './MenuItem'

function renderWithProviders(ui) {
  return render(<LanguageProvider>{ui}</LanguageProvider>)
}

const mockItem = {
  id: '1',
  name_mk: 'Мохито',
  name_en: 'Mojito',
  description_mk: 'Рум, нане',
  description_en: 'Rum, mint',
  price: 350,
  tags: ['vegan', 'gluten-free'],
}

describe('MenuItem', () => {
  it('renders item name', () => {
    renderWithProviders(<MenuItem item={mockItem} />)
    expect(screen.getByText(/Мохито|Mojito/)).toBeInTheDocument()
  })

  it('renders price with currency', () => {
    renderWithProviders(<MenuItem item={mockItem} />)
    expect(screen.getByText(/350 ден\./)).toBeInTheDocument()
  })

  it('renders description', () => {
    renderWithProviders(<MenuItem item={mockItem} />)
    expect(screen.getByText(/Рум, нане|Rum, mint/)).toBeInTheDocument()
  })

  it('renders dietary tags', () => {
    renderWithProviders(<MenuItem item={mockItem} />)
    expect(screen.getByText('vegan')).toBeInTheDocument()
    expect(screen.getByText('gluten-free')).toBeInTheDocument()
  })
})
