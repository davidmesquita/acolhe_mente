import type { ReactNode } from 'react'

const labels = {
  loading: { title: 'Carregando', symbol: '…' },
  error: { title: 'Não foi possível concluir', symbol: '!' },
  empty: { title: 'Nada por aqui ainda', symbol: '⌕' },
  success: { title: 'Tudo certo', symbol: '✓' },
}

export function StateMessage({
  kind,
  title,
  children,
}: {
  kind: keyof typeof labels
  title?: string
  children: ReactNode
}) {
  const state = labels[kind]
  return (
    <div
      className={`state-message state-${kind}`}
      role={kind === 'error' ? 'alert' : kind === 'loading' ? 'status' : 'status'}
      aria-live={kind === 'loading' ? 'polite' : undefined}
    >
      <span aria-hidden="true">{state.symbol}</span>
      <div>
        <h2>{title ?? state.title}</h2>
        <p>{children}</p>
      </div>
    </div>
  )
}
