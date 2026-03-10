import { supabase } from './supabase'

test('supabase client is defined', () => {
  expect(supabase).toBeDefined()
  expect(supabase.from).toBeInstanceOf(Function)
  expect(supabase.auth).toBeDefined()
  expect(supabase.storage).toBeDefined()
})
