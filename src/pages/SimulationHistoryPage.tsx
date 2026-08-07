import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Goal, Trash2 } from 'lucide-react'
import { PageHero } from '@/components/shared/PageHero'
import { Button } from '@/components/shared/Button'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { calcMonthlySavings } from '@/utils/simulation'
import type { SimulationRecord } from '@/data/simulation'

function HistoryItem({ simulation, onDelete, onViewDetails }: { simulation: SimulationRecord; onDelete: (id: string) => void; onViewDetails: (id: string) => void }) {
  const monthlySavings = calcMonthlySavings(simulation)

  return (
    <li className="bg-card ml-[15px] flex flex-col gap-4 rounded-2xl border border-border/60 pt-5 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.12)] sm:ml-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-1 flex-col gap-4 pl-[15px] sm:pl-0">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-primary sm:h-14 sm:w-14">
            <Goal size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-foreground text-lg font-semibold">{simulation.goalName || 'Meta sem nome'}</p>
            <p className="text-muted-foreground mt-1 text-sm">Resumo da simulação salva</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-background/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Custo da meta</p>
            <p className="text-foreground mt-2 text-sm font-semibold">{simulation.goalAmount}</p>
          </div>
          <div className="rounded-xl bg-background/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Prazo</p>
            <p className="text-foreground mt-2 text-sm font-semibold">{simulation.goalDeadline} meses</p>
          </div>
          <div className="rounded-xl bg-background/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Economia mensal</p>
            <p className="text-foreground mt-2 text-sm font-semibold">R$ {monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-xl bg-background/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Renda</p>
            <p className="text-foreground mt-2 text-sm font-semibold">{simulation.income}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:items-end">
        <Button variant="secondary" onClick={() => onViewDetails(simulation.id)}>
          Ver detalhes
        </Button>
        <Button variant="ghost" icon={Trash2} onClick={() => onDelete(simulation.id)} className="text-red-500 hover:opacity-90">
          Excluir
        </Button>
      </div>
    </li>
  )
}

export function SimulationHistoryPage() {
  const navigate = useNavigate()
  const { getAllFormData, deleteSimulation } = useSimulationStorage()
  const [simulations, setSimulations] = useState<SimulationRecord[]>(() => getAllFormData())

  const hasSimulations = simulations.length > 0

  const handleDelete = (id: string) => {
    deleteSimulation(id)
    setSimulations((current) => current.filter((simulation) => simulation.id !== id))
  }

  const handleViewDetails = (id: string) => {
    void navigate(`/resultado/${id}`)
  }

  const content = useMemo(() => {
    if (!hasSimulations) {
      return (
        <div className="bg-card rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-foreground text-lg font-medium">Nenhuma simulação salva ainda.</p>
          <p className="text-muted-foreground mt-2 text-sm">Crie uma nova simulação para acompanhar seu histórico.</p>
        </div>
      )
    }

    return (
      <ul className="flex flex-col gap-4">
        {simulations.map((simulation) => (
          <HistoryItem
            key={simulation.id}
            simulation={simulation}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
          />
        ))}
      </ul>
    )
  }, [hasSimulations, simulations])

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <PageHero
        title="Histórico de Simulações"
        subtitle="Acompanhe seus objetivos salvos e acesse rapidamente cada resultado."
      />
      {content}
    </main>
  )
}
