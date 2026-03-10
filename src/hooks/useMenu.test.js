import { vi } from 'vitest'

// Mock supabase before import
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: table === 'categories'
            ? [{ id: '1', name_mk: 'Коктели', name_en: 'Cocktails', sort_order: 1 }]
            : [{ id: '1', category_id: '1', name_mk: 'Мохито', name_en: 'Mojito', available: true }],
          error: null,
        })),
      })),
    })),
  },
}))

import { renderHook, waitFor } from '@testing-library/react'
import { useMenu } from './useMenu'

test('fetches categories and items', async () => {
  const { result } = renderHook(() => useMenu())

  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })

  expect(result.current.categories.length).toBe(1)
  expect(result.current.categories[0].name_en).toBe('Cocktails')
  expect(result.current.items.length).toBe(1)
})
