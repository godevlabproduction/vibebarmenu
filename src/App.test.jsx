import { render } from '@testing-library/react'

// Mock supabase to avoid real API calls in tests
vi.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({ data: [], error: null })),
      })),
    })),
  },
}))

// Import App AFTER the mock is set up
const { default: App } = await import('./App')

test('renders without crashing', () => {
  render(<App />)
})
