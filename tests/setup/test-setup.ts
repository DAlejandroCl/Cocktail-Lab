import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from '../mocks/server'

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error'
  })
})

afterEach(() => {
  server.resetHandlers()
  cleanup()
  vi.clearAllTimers()
})

afterAll(() => {
  server.close()
})