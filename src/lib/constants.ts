export const UNIVERSE = {
  age: '13.8 bilhões de anos',
  ageYears: 13_800_000_000,
  earthSpeed: '1.670 km/h',
  earthSpeedKmh: 1670,
  population: '8 bilhões de pessoas',
  populationNum: 8_000_000_000,
  moonCycleDays: 29.5,
  laLaLandMinutes: 128,
  avgHeartBpm: 72,
  avgCoffeePerDay: 2,
}

export const WRAPPED_FACTS = {
  sunsets: (dias: number) => `${dias.toLocaleString('pt-BR')} pores do sol compartilhados`,
  coffees: (dias: number) => `${(dias * UNIVERSE.avgCoffeePerDay).toLocaleString('pt-BR')} cafes divididos`,
  heartbeats: (dias: number) => `${(dias * 24 * 60 * UNIVERSE.avgHeartBpm).toLocaleString('pt-BR')} batimentos do coracao juntos`,
  moons: (dias: number) => `${Math.floor(dias / UNIVERSE.moonCycleDays)} luas cheias`,
  movieRewatches: (dias: number) => `La La Land ${Math.floor(dias * 24 * 60 / UNIVERSE.laLaLandMinutes).toLocaleString('pt-BR')} vezes`,
  earthDistance: (dias: number) => `${(dias * 24 * UNIVERSE.earthSpeedKmh).toLocaleString('pt-BR')} km percorridos na Terra juntos`,
  probability: `De ${UNIVERSE.population}, voces se encontraram`,
}
