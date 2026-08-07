import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { simulationFormSteps, type SimulationFormData } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { FormStep } from './FormStep'
import { StepProgress } from './Progress'

export function SimulationForm() {
  const { saveFormData } = useSimulationStorage()
  const navigate = useNavigate()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [formData, setFormData] = useState<SimulationFormData>({
    income: '',
    expenses: '',
    debts: '',
    goalName: '',
    goalAmount: '',
    goalDeadline: '',
  })

  const totalSteps = simulationFormSteps.length
  const currentStep = simulationFormSteps[currentStepIndex]

  const handleNextStep = (value: string) => {
    const updatedFormData = {
      ...formData,
      [currentStep.id]: value,
    }

    setFormData(updatedFormData)

    const isLastStep = currentStepIndex === totalSteps - 1

    if (isLastStep) {
      const id = saveFormData(updatedFormData)
      void navigate(`/resultado/${id}`)
      return
    }

    setCurrentStepIndex((prev) => prev + 1)
  }

  const handlePreviousStep = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0))
  }

  return (
    <>
      <StepProgress
        currentStep={currentStepIndex + 1}
        totalSteps={totalSteps}
      />

      <FormStep
        key={currentStep.id}
        {...currentStep}
        initialValue={formData[currentStep.id as keyof SimulationFormData]}
        onBack={handlePreviousStep}
        onNext={handleNextStep}
        hideBackButton={currentStepIndex === 0}
      />
    </>
  )
}