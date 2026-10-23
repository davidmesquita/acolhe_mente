import type { InputHTMLAttributes, ReactNode } from 'react'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  error?: string
  suffix?: ReactNode
}

export function FormField({ id, label, hint, error, suffix, ...props }: FormFieldProps) {
  const inputId = id ?? props.name
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={inputId}>{label}</label>
      <div className="input-wrap">
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          {...props}
        />
        {suffix}
      </div>
      {hint && (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
