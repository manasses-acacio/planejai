import { ArrowLeft, ArrowRight, type LucideIcon } from 'lucide-react'
import { useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { Button } from '@/components/shared/Button'
import { Input, type InputProps } from '@/components/shared/Input'
import { currencyMask } from '@/utils/currency'

export interface FormStepProps {
  id: string
  icon: LucideIcon
  title: string
  question: string
  inputProps: InputProps
  initialValue?: string
  submitButtonProps?: {
    label: string
    emojiIcon?: string
  }
}

interface ActionsButtonsProps {
  onBack: () => void
  onNext: (value: string) => void
  hideBackButton?: boolean
}

export function FormStep({
  id,
  icon: Icon,
  title,
  question,
  inputProps,
  submitButtonProps,
  initialValue,
  hideBackButton,
  onBack,
  onNext,
}: FormStepProps & ActionsButtonsProps) {
  const [inputValue, setInputValue] = useState(initialValue || '')

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault()

    if (!inputValue) return

    onNext(inputValue)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    if (inputProps.prefix === 'R$') {
      value = currencyMask(value)
    } else if (id === 'goalName') {
      value = value.replace(/\d/g, '')
    }

    setInputValue(value)
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-card p-6">
      <div className="flex items-center gap-3">
        <Icon size={24} />
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <p className="text-muted-foreground">{question}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input {...inputProps} value={inputValue} onChange={handleChange} />

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          {!hideBackButton && (
            <Button
              type="button"
              variant="ghost"
              className="order-2 flex-1 justify-center rounded-xl py-3 sm:order-1"
              onClick={onBack}
            >
              <ArrowLeft size={16} />
              Voltar
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            className="order-1 flex-1 sm:order-2"
          >
            {submitButtonProps?.label ?? 'Próximo'}
            {submitButtonProps?.emojiIcon ?? <ArrowRight size={16} />}
          </Button>
        </div>
      </form>
    </div>
  )
}