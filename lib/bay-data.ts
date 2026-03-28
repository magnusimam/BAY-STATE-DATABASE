// BAY States (Borno, Adamawa, Yobe) — Static Metadata
// Structural data only. Live humanitarian data comes from /api/data.

export interface BAYState {
  code: string
  name: string
  region: 'BAY'
  population: number // in millions
  lgaCount: number
}

export const bayStates: Record<string, BAYState> = {
  BN: {
    code: 'BN',
    name: 'Borno',
    region: 'BAY',
    population: 4.25,
    lgaCount: 27,
  },
  AD: {
    code: 'AD',
    name: 'Adamawa',
    region: 'BAY',
    population: 3.79,
    lgaCount: 21,
  },
  YB: {
    code: 'YB',
    name: 'Yobe',
    region: 'BAY',
    population: 2.43,
    lgaCount: 17,
  },
}

export function getStateName(stateCode: string): string {
  return bayStates[stateCode]?.name || ''
}
