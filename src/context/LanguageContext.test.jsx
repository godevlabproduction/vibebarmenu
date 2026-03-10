import { render, screen, act } from '@testing-library/react'
import { LanguageProvider, useLanguage } from './LanguageContext'

function TestComponent() {
  const { language, toggleLanguage, t } = useLanguage()
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <button onClick={toggleLanguage}>toggle</button>
      <span data-testid="translated">
        {t('Коктели', 'Cocktails')}
      </span>
    </div>
  )
}

test('defaults to Macedonian', () => {
  render(
    <LanguageProvider>
      <TestComponent />
    </LanguageProvider>
  )
  expect(screen.getByTestId('lang')).toHaveTextContent('mk')
  expect(screen.getByTestId('translated')).toHaveTextContent('Коктели')
})

test('toggles to English', async () => {
  render(
    <LanguageProvider>
      <TestComponent />
    </LanguageProvider>
  )
  await act(() => screen.getByText('toggle').click())
  expect(screen.getByTestId('lang')).toHaveTextContent('en')
  expect(screen.getByTestId('translated')).toHaveTextContent('Cocktails')
})
