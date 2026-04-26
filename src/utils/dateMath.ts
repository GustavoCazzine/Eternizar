export function calculateTotalDays(startDate: string | Date): number {
  const start = new Date(startDate)
  if (isNaN(start.getTime())) return 0
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000))
}

export function calculateTotalHours(startDate: string | Date): number {
  const start = new Date(startDate)
  if (isNaN(start.getTime())) return 0
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 3600000))
}

export function calculateWeekendsTogether(startDate: string | Date): number {
  const start = new Date(startDate)
  if (isNaN(start.getTime())) return 0
  const now = new Date()
  if (start > now) return 0

  const totalDays = Math.floor((now.getTime() - start.getTime()) / 86400000)
  const fullWeeks = Math.floor(totalDays / 7)
  let weekendDays = fullWeeks * 2

  const startDay = start.getDay()
  const remainingDays = totalDays % 7
  for (let i = 1; i <= remainingDays; i++) {
    const day = (startDay + i) % 7
    if (day === 0 || day === 6) weekendDays++
  }

  return weekendDays
}

export function calculateTotalMinutes(startDate: string | Date): number {
  const start = new Date(startDate)
  if (isNaN(start.getTime())) return 0
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 60000))
}

export function generateDateFacts(startDate: string | Date) {
  const dias = calculateTotalDays(startDate)
  const horas = calculateTotalHours(startDate)
  const fds = calculateWeekendsTogether(startDate)
  const meses = Math.floor(dias / 30.44)
  const semanas = Math.floor(dias / 7)

  return { dias, horas, fds, meses, semanas }
}

export function formatRelativeDate(startDate: string | Date): string {
  const dias = calculateTotalDays(startDate)
  if (dias === 0) return 'hoje'
  if (dias < 30) return `${dias} dias`
  if (dias < 365) {
    const m = Math.floor(dias / 30)
    return `${m} ${m === 1 ? 'mes' : 'meses'}`
  }
  const a = Math.floor(dias / 365)
  const m = Math.floor((dias % 365) / 30)
  return m > 0 ? `${a} ${a === 1 ? 'ano' : 'anos'} e ${m} ${m === 1 ? 'mes' : 'meses'}` : `${a} ${a === 1 ? 'ano' : 'anos'}`
}
