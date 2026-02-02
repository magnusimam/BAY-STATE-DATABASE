// BAY States (Borno, Adamawa, Yobe) Data Structure
// Comprehensive humanitarian and youth data for Northeast Nigeria

export interface LGA {
  code: string
  name: string
  population: number // in thousands
  displacedPersons: number // in thousands
  humanitarianNeed: number // percentage
  severity: number // 0-100 score
  activePrograms: number
  youthUnemployment: number // percentage
  foodInsecurity: number // percentage
}

export interface BAYState {
  code: string
  name: string
  region: 'BAY'
  population: number // in millions
  displacedPersons: number // in millions
  humanitarianNeed: number // millions affected
  severity: number // 0-100 index
  activePrograms: number
  lgaCount: number
  lgas: Record<string, LGA>
}

// Borno State LGAs
const bornoLGAs: Record<string, LGA> = {
  'maiduguri-mmu': {
    code: 'BRN-MMU',
    name: 'Maiduguri Metropolitan',
    population: 1204,
    displacedPersons: 387,
    humanitarianNeed: 78,
    severity: 92,
    activePrograms: 156,
    youthUnemployment: 42,
    foodInsecurity: 68,
  },
  'jere': {
    code: 'BRN-JRE',
    name: 'Jere',
    population: 342,
    displacedPersons: 145,
    humanitarianNeed: 82,
    severity: 89,
    activePrograms: 45,
    youthUnemployment: 48,
    foodInsecurity: 74,
  },
  'marte': {
    code: 'BRN-MRT',
    name: 'Marte',
    population: 268,
    displacedPersons: 201,
    humanitarianNeed: 88,
    severity: 94,
    activePrograms: 32,
    youthUnemployment: 52,
    foodInsecurity: 81,
  },
  'nganzai': {
    code: 'BRN-NGZ',
    name: 'Nganzai',
    population: 312,
    displacedPersons: 178,
    humanitarianNeed: 85,
    severity: 91,
    activePrograms: 38,
    youthUnemployment: 50,
    foodInsecurity: 79,
  },
  'bama': {
    code: 'BRN-BAM',
    name: 'Bama',
    population: 456,
    displacedPersons: 289,
    humanitarianNeed: 86,
    severity: 93,
    activePrograms: 52,
    youthUnemployment: 51,
    foodInsecurity: 80,
  },
  'konduga': {
    code: 'BRN-KND',
    name: 'Konduga',
    population: 298,
    displacedPersons: 167,
    humanitarianNeed: 81,
    severity: 88,
    activePrograms: 35,
    youthUnemployment: 46,
    foodInsecurity: 75,
  },
  'gwoza': {
    code: 'BRN-GWZ',
    name: 'Gwoza',
    population: 389,
    displacedPersons: 234,
    humanitarianNeed: 87,
    severity: 92,
    activePrograms: 48,
    youthUnemployment: 49,
    foodInsecurity: 78,
  },
  'chibok': {
    code: 'BRN-CHK',
    name: 'Chibok',
    population: 324,
    displacedPersons: 198,
    humanitarianNeed: 84,
    severity: 90,
    activePrograms: 42,
    youthUnemployment: 47,
    foodInsecurity: 76,
  },
}

// Adamawa State LGAs
const adamawaLGAs: Record<string, LGA> = {
  'yola-north': {
    code: 'ADM-YNA',
    name: 'Yola North',
    population: 523,
    displacedPersons: 156,
    humanitarianNeed: 62,
    severity: 78,
    activePrograms: 89,
    youthUnemployment: 35,
    foodInsecurity: 54,
  },
  'yola-south': {
    code: 'ADM-YSA',
    name: 'Yola South',
    population: 467,
    displacedPersons: 134,
    humanitarianNeed: 59,
    severity: 75,
    activePrograms: 81,
    youthUnemployment: 33,
    foodInsecurity: 51,
  },
  'girei': {
    code: 'ADM-GIR',
    name: 'Girei',
    population: 298,
    displacedPersons: 92,
    humanitarianNeed: 64,
    severity: 76,
    activePrograms: 56,
    youthUnemployment: 38,
    foodInsecurity: 57,
  },
  'demsa': {
    code: 'ADM-DEM',
    name: 'Demsa',
    population: 267,
    displacedPersons: 84,
    humanitarianNeed: 61,
    severity: 73,
    activePrograms: 48,
    youthUnemployment: 36,
    foodInsecurity: 52,
  },
  'hong': {
    code: 'ADM-HON',
    name: 'Hong',
    population: 289,
    displacedPersons: 103,
    humanitarianNeed: 68,
    severity: 81,
    activePrograms: 64,
    youthUnemployment: 40,
    foodInsecurity: 62,
  },
  'guyuk': {
    code: 'ADM-GUY',
    name: 'Guyuk',
    population: 245,
    displacedPersons: 78,
    humanitarianNeed: 59,
    severity: 72,
    activePrograms: 42,
    youthUnemployment: 34,
    foodInsecurity: 50,
  },
  'numan': {
    code: 'ADM-NUM',
    name: 'Numan',
    population: 312,
    displacedPersons: 98,
    humanitarianNeed: 63,
    severity: 77,
    activePrograms: 58,
    youthUnemployment: 37,
    foodInsecurity: 55,
  },
  'mayo-belwa': {
    code: 'ADM-MBW',
    name: 'Mayo-Belwa',
    population: 276,
    displacedPersons: 89,
    humanitarianNeed: 65,
    severity: 79,
    activePrograms: 52,
    youthUnemployment: 39,
    foodInsecurity: 58,
  },
}

// Yobe State LGAs
const yobeLGAs: Record<string, LGA> = {
  'damaturu': {
    code: 'YOB-DMT',
    name: 'Damaturu',
    population: 456,
    displacedPersons: 178,
    humanitarianNeed: 72,
    severity: 85,
    activePrograms: 78,
    youthUnemployment: 41,
    foodInsecurity: 65,
  },
  'tarmuwa': {
    code: 'YOB-TRM',
    name: 'Tarmuwa',
    population: 198,
    displacedPersons: 89,
    humanitarianNeed: 77,
    severity: 88,
    activePrograms: 32,
    youthUnemployment: 45,
    foodInsecurity: 71,
  },
  'bade': {
    code: 'YOB-BAD',
    name: 'Bade',
    population: 276,
    displacedPersons: 124,
    humanitarianNeed: 75,
    severity: 86,
    activePrograms: 41,
    youthUnemployment: 43,
    foodInsecurity: 68,
  },
  'geidam': {
    code: 'YOB-GED',
    name: 'Geidam',
    population: 234,
    displacedPersons: 112,
    humanitarianNeed: 79,
    severity: 89,
    activePrograms: 35,
    youthUnemployment: 47,
    foodInsecurity: 73,
  },
  'gutsinde': {
    code: 'YOB-GUT',
    name: 'Gutsinde',
    population: 267,
    displacedPersons: 134,
    humanitarianNeed: 78,
    severity: 87,
    activePrograms: 39,
    youthUnemployment: 46,
    foodInsecurity: 70,
  },
  'nguru': {
    code: 'YOB-NGU',
    name: 'Nguru',
    population: 312,
    displacedPersons: 145,
    humanitarianNeed: 76,
    severity: 84,
    activePrograms: 46,
    youthUnemployment: 44,
    foodInsecurity: 67,
  },
  'potiskum': {
    code: 'YOB-POT',
    name: 'Potiskum',
    population: 389,
    displacedPersons: 167,
    humanitarianNeed: 74,
    severity: 82,
    activePrograms: 58,
    youthUnemployment: 42,
    foodInsecurity: 64,
  },
}

// Complete BAY States Data
export const bayStates: Record<string, BAYState> = {
  'BN': {
    code: 'BN',
    name: 'Borno',
    region: 'BAY',
    population: 4.25,
    displacedPersons: 1.799,
    humanitarianNeed: 3.32,
    severity: 91,
    activePrograms: 448,
    lgaCount: 8,
    lgas: bornoLGAs,
  },
  'AD': {
    code: 'AD',
    name: 'Adamawa',
    region: 'BAY',
    population: 3.79,
    displacedPersons: 0.734,
    humanitarianNeed: 2.15,
    severity: 76,
    activePrograms: 390,
    lgaCount: 8,
    lgas: adamawaLGAs,
  },
  'YB': {
    code: 'YB',
    name: 'Yobe',
    region: 'BAY',
    population: 2.43,
    displacedPersons: 0.949,
    humanitarianNeed: 1.78,
    severity: 86,
    activePrograms: 329,
    lgaCount: 7,
    lgas: yobeLGAs,
  },
}

// Aggregated BAY Region Data
export const bayRegionData = {
  code: 'BAY',
  name: 'BAY States (Northeast Nigeria)',
  totalPopulation: 10.47, // millions
  totalDisplacedPersons: 3.482, // millions
  totalHumanitarianNeed: 7.25, // millions
  averageSeverity: 84.3,
  totalActivePrograms: 1167,
  states: ['Borno', 'Adamawa', 'Yobe'],
  lgas: 23,
  description: 'BAY region represents one of the most critical humanitarian zones in Nigeria, with ongoing conflict, displacement, and pressing youth development needs.',
}

// Helper functions
export function getAllLGAs(): LGA[] {
  const allLGAs: LGA[] = []
  Object.values(bayStates).forEach(state => {
    Object.values(state.lgas).forEach(lga => {
      allLGAs.push(lga)
    })
  })
  return allLGAs
}

export function getLGAsByState(stateCode: string): LGA[] {
  const state = bayStates[stateCode]
  if (!state) return []
  return Object.values(state.lgas)
}

export function getStateName(stateCode: string): string {
  return bayStates[stateCode]?.name || ''
}

export function getLGAName(lgaCode: string): string {
  for (const state of Object.values(bayStates)) {
    for (const lga of Object.values(state.lgas)) {
      if (lga.code === lgaCode) return lga.name
    }
  }
  return ''
}

export function getTopLGAsByNeed(limit: number = 10): Array<LGA & { state: string }> {
  const allLGAs = getAllLGAs()
  return allLGAs
    .map(lga => {
      for (const state of Object.values(bayStates)) {
        if (state.lgas[Object.keys(state.lgas).find(key => state.lgas[key].code === lga.code) || '']) {
          return {
            ...lga,
            state: state.name,
          }
        }
      }
      return { ...lga, state: '' }
    })
    .filter(lga => lga.state)
    .sort((a, b) => b.humanitarianNeed - a.humanitarianNeed)
    .slice(0, limit)
}
