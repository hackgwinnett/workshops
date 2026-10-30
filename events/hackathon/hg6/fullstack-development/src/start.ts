import { createStart } from '@tanstack/react-start'
import { xrayMiddleware } from './xray'

// Global configuration for TanStack Start.
// Every server function in the app now runs through the X-ray middleware.
export const startInstance = createStart(() => ({
  functionMiddleware: [xrayMiddleware],
}))
