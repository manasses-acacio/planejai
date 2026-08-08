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
  const simulationDate = new Date().toLocaleDateString('pt-BR')

  return (
    <li className="bg-card ml-[24px] flex flex-col gap-2 rounded-2xl border border-border/60 px-2.5 pt-3 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.12)] sm:ml-0 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <div className="flex flex-1 flex-col gap-2 pl-[4px] sm:flex-row sm:items-center sm:gap-3 sm:pl-0">
        <div className="flex items-center gap-2 sm:min-w-[220px]">
          <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-primary sm:h-11 sm:w-11">
            <Goal size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-foreground text-sm font-semibold">{simulation.goalName || 'Meta sem nome'}</p>
            <p className="text-muted-foreground mt-0.5 text-[11px]">{simulationDate}</p>
          </div>
        </div>

        <div className="grid gap-1.5 sm:grid-cols-4 sm:flex-1">
          <div className="rounded-lg bg-background/40 p-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">Custo da meta</p>
            <p className="text-foreground mt-1 text-xs font-semibold">{simulation.goalAmount}</p>
          </div>
          <div className="rounded-lg bg-background/40 p-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">Prazo</p>
            <p className="text-foreground mt-1 text-xs font-semibold">{simulation.goalDeadline} meses</p>
          </div>
          <div className="rounded-lg bg-background/40 p-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">Economia mensal</p>
            <p className="text-foreground mt-1 text-xs font-semibold">R$ {monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-lg bg-background/40 p-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">Renda</p>
            <p className="text-foreground mt-1 text-xs font-semibold">{simulation.income}</p>
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
