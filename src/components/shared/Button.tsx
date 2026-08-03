import type { LucideIcon } from 'lucide-react'
import { isValidElement, type ButtonHTMLAttributes, type ReactNode } from 'react'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'ghost'
  icon?: LucideIcon | ReactNode
}

const baseClasses =
  'flex cursor-pointer items-center justify-center font-medium text-sm gap-2 px-4 py-3 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-80'

const variantClasses = {
  primary: 'bg-primary text-primary-foreground font-semibold rounded-xl',
  secondary: 'bg-secondary-button border border-border rounded-3xl',
  ghost: 'rounded-lg text-foreground',
}

export function Button({
  variant,
  icon: Icon,
  children,
  className,
  ...props
}: ButtonProps) {
  const renderIcon = () => {
    if (!Icon) return null
    if (isValidElement(Icon)) return Icon
    if (typeof Icon === 'function' || typeof Icon === 'object') {
      const IconComponent = Icon as LucideIcon
      return <IconComponent size={20} />
    }
    return null
  }

  return (
    <button
      className={[baseClasses, variantClasses[variant], className].join(' ')}
      {...props}
    >
      {renderIcon()}
      {children}
    </button>
  )
}