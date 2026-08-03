export const currencyMask = (value: string | undefined): string => {
  if (!value) return ''

  // 1. Remove absolutamente tudo que não for número (impede letras e símbolos)
  const numbers = value.replace(/\D/g, '')

  if (!numbers) return ''

  // 2. Transforma em número decimal (divide por 100 para ter as 2 casas dos centavos)
  const amount = Number(numbers) / 100

  // 3. Formata para o padrão brasileiro de pontuação (ex: 1.500,00)
  // Não usamos o style: 'currency' aqui porque seu Input já tem o prefixo "R$" fixo
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
export function parseCurrency(value: string): number {
  return (
    parseFloat(
      value.replace(/\./g, '').replace(',', '.').replace('R$', ''),
    ) || 0
  )
}