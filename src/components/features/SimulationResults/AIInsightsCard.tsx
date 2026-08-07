import { useEffect, useRef, useState } from 'react'
import { ArrowUp, LoaderCircle, MessageCircleMore } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useInsight } from '@/hooks/useInsight'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { getFollowUpReply, type ChatMessage } from '@/services/aiService'
import { Content } from '../Insights/Content'
import { Error } from '../Insights/Error'

interface AIInsightCardProps {
  simulationId: string
}

const buildChatPrompt = (userMessage: string, insight: NonNullable<ReturnType<typeof useInsight>['insight']>, chatMessages: ChatMessage[], simulation: { goalName: string; goalAmount: string; goalDeadline: string; income: string; expenses: string; debts: string }) => {
  const initialContext = [
    `Meta: ${simulation.goalName}`,
    `Custo da meta: ${simulation.goalAmount}`,
    `Prazo: ${simulation.goalDeadline} meses`,
    `Renda mensal: ${simulation.income}`,
    `Custos fixos: ${simulation.expenses}`,
    `Dívidas e parcelas: ${simulation.debts}`,
    `Diagnóstico inicial: ${insight.diagnosis.content}`,
    `Viabilidade: ${insight.feasibility.content}`,
    `Sugestões: ${insight.suggestions.items.join(' ')}`,
    `Renda extra: ${insight.extraIncome.items.join(' ')}`,
    `Investimentos: ${insight.investment.items.join(' ')}`,
    `Mensagem final: ${insight.motivation.content}`,
  ].join('\n')

  const historyContext = chatMessages.length
    ? chatMessages
        .map((message) => `${message.role === 'user' ? 'Usuário' : 'Assistente'}: ${message.content}`)
        .join('\n')
    : 'Ainda não houve perguntas anteriores.'

  return `Você é um assistente financeiro da Planej.ai. O usuário já recebeu este diagnóstico inicial e agora quer continuar a conversa. Responda em português do Brasil, em linguagem clara, prática e acolhedora. Complemente o diagnóstico inicial sem substituí-lo. Se for útil, cite valores e dê um passo prático.\n\nDiagnóstico inicial:\n${initialContext}\n\nHistórico da conversa:\n${historyContext}\n\nPergunta atual do usuário:\n${userMessage}\n\nResponda apenas com o texto da resposta.`
}

export function AIInsightsCard({ simulationId }: AIInsightCardProps) {
  const { insight, isLoading, error, fetchInsight } = useInsight(simulationId)
  const { getFormData, updateSimulation, saveChatHistory } = useSimulationStorage()
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const simulation = getFormData(simulationId)
    return simulation?.chatHistory ?? []
  })
  const [draft, setDraft] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const simulation = getFormData(simulationId)
    setChatMessages(simulation?.chatHistory ?? [])
    setChatError(null)
  }, [simulationId, getFormData])

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const message = draft.trim()
    if (!message || !insight || isChatLoading) {
      return
    }

    const simulation = getFormData(simulationId)
    if (!simulation) {
      setChatError('Não foi possível localizar a simulação atual.')
      return
    }

    const optimisticMessages: ChatMessage[] = [
      ...chatMessages,
      { role: 'user', content: message },
    ]

    setChatMessages(optimisticMessages)
    setDraft('')
    setChatError(null)
    setIsChatLoading(true)

    try {
      const prompt = buildChatPrompt(message, insight, optimisticMessages, simulation)
      const reply = await getFollowUpReply(prompt)
      const nextMessages: ChatMessage[] = [
        ...optimisticMessages,
        { role: 'assistant', content: reply },
      ]
      setChatMessages(nextMessages)
      updateSimulation(simulationId, {
        ...simulation,
        insight,
        chatHistory: nextMessages,
      })
      saveChatHistory(simulationId, nextMessages)
    } catch {
      setChatError('Não foi possível responder agora. Tente novamente.')
    } finally {
      setIsChatLoading(false)
    }
  }

  return (
    <div className="bg-card order-2 rounded-2xl p-6 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)] lg:order-1 lg:col-span-2">
      <div className="mb-3 flex items-center gap-1.5">
        <span>✨</span>
        <span className="text-primary text-xs font-semibold tracking-widest uppercase">
          Insight Financeiro Personalizado
        </span>
      </div>

      {isLoading && (
        <div className="flex">
          <Skeleton
            count={10.5}
            baseColor="var(--color-skeleton-base)"
            highlightColor="var(--color-skeleton-highlight)"
            className="mb-3 flex rounded-lg"
            containerClassName="flex-1"
            inline
          />
        </div>
      )}
      {!isLoading && error && (
        <Error
          simulationId={simulationId}
          message={error}
          onRetry={() => fetchInsight(simulationId)}
        />
      )}
      {!isLoading && insight && !error && (
        <div className="flex flex-col gap-5">
          <Content insight={insight} />

          <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
            <div className="mb-3 flex items-center gap-2">
              <MessageCircleMore size={18} className="text-primary" />
              <h3 className="text-foreground text-sm font-semibold">
                Converse com a IA
              </h3>
            </div>

            <div
              ref={chatContainerRef}
              className="max-h-80 space-y-3 overflow-y-auto overscroll-contain rounded-xl border border-border/60 bg-background/70 p-3 [scrollbar-width:thin]"
            >
              {chatMessages.length === 0 && !isChatLoading && (
                <p className="text-muted-foreground text-sm">
                  Faça perguntas sobre sua simulação, orçamento ou próximos passos.
                </p>
              )}

              {chatMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'}`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2 text-sm text-muted-foreground">
                    <LoaderCircle size={16} className="animate-spin" />
                    A IA está respondendo...
                  </div>
                </div>
              )}

              {chatError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                  {chatError}
                </div>
              )}

            </div>

            <form onSubmit={handleSendMessage} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Escreva sua pergunta sobre o diagnóstico..."
                className="min-h-[44px] flex-1 rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-primary"
                rows={2}
              />
              <button
                type="submit"
                disabled={isChatLoading || !draft.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
              >
                <ArrowUp size={16} />
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}