import type { ReactNode } from 'react'

export function Notice({
  kind = 'info',
  title,
  children,
}: {
  kind?: 'info' | 'success' | 'error'
  title: string
  children: ReactNode
}) {
  return (
    <div className={`notice notice-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <span className="notice-symbol" aria-hidden="true">
        {kind === 'success' ? '✓' : kind === 'error' ? '!' : 'i'}
      </span>
      <div>
        <strong>{title}</strong>
        <div>{children}</div>
      </div>
    </div>
  )
}
