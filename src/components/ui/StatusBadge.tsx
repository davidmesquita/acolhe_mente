export function StatusBadge({
  status,
  children,
}: {
  status: 'confirmed' | 'pending' | 'cancelled' | 'demo'
  children: string
}) {
  return (
    <span className={`status-badge status-${status}`}>
      <span aria-hidden="true">
        {status === 'confirmed'
          ? '✓'
          : status === 'pending'
            ? '◷'
            : status === 'cancelled'
              ? '×'
              : '•'}
      </span>
      {children}
    </span>
  )
}
