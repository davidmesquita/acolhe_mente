import { Link, type LinkProps } from 'react-router-dom'

export function ButtonLink({ className = '', children, ...props }: LinkProps) {
  return (
    <Link className={`button-link ${className}`.trim()} {...props}>
      {children}
    </Link>
  )
}
