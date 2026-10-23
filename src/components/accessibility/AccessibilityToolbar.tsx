import { useAccessibility } from './AccessibilityContext'

export function AccessibilityToolbar() {
  const settings = useAccessibility()
  return (
    <aside className="accessibility-bar" aria-label="Opções de acessibilidade">
      <div className="accessibility-inner">
        <span className="accessibility-label">Acessibilidade</span>
        <button
          type="button"
          aria-pressed={settings.largeText}
          onClick={() => settings.toggle('largeText')}
        >
          A+ Texto
        </button>
        <button
          type="button"
          aria-pressed={settings.highContrast}
          onClick={() => settings.toggle('highContrast')}
        >
          ◐ Contraste
        </button>
        <button
          type="button"
          aria-pressed={settings.reduceMotion}
          onClick={() => settings.toggle('reduceMotion')}
        >
          〰 Reduzir movimento
        </button>
      </div>
    </aside>
  )
}
