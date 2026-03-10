import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('mk')

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'mk' ? 'en' : 'mk'))
  }

  const t = (mk, en) => (language === 'mk' ? mk : en)

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
