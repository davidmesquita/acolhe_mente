import { createContext, useContext } from 'react'

export type AccessibilitySettings = {
  highContrast: boolean
  largeText: boolean
  reduceMotion: boolean
  toggle: (setting: 'highContrast' | 'largeText' | 'reduceMotion') => void
}

export const AccessibilityContext = createContext<AccessibilitySettings | null>(null)

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) throw new Error('useAccessibility precisa estar dentro de AccessibilityProvider')
  return context
}
