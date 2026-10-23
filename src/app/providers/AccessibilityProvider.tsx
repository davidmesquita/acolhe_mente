import { useMemo, useState, type ReactNode } from 'react'
import {
  AccessibilityContext,
  type AccessibilitySettings,
} from '../../components/accessibility/AccessibilityContext'

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
  })
  const value = useMemo<AccessibilitySettings>(
    () => ({
      ...settings,
      toggle: (setting) => setSettings((current) => ({ ...current, [setting]: !current[setting] })),
    }),
    [settings],
  )

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
}
