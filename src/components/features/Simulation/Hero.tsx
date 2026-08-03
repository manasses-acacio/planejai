export function SimulationHero() {
  return (
    <div className="mb-8 text-center">
      <div className="flex flex-col items-center sm:flex-row">
        <h1 className="text-foreground text-3xl font-semibold sm:text-4xl">
          Vamos planejar seu futuro
        </h1>
        <div className="ml-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-4xl">
          🐷
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        Responda algumas questões para ter insights financeiros personalizados.
      </p>
    </div>
  )
}