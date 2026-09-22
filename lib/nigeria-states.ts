// Nigeria States — Static Metadata
// Structural data only (code, name, zone, approximate population, official LGA count).
// Live humanitarian/youth data comes from /api/data — this table just tells the UI which
// states exist and how to group/link them. Population figures are ballpark (NPC-style
// projections) for display purposes only; they are not part of the tracked dataset.
//
// Borno/Adamawa/Yobe keep their original 'BN'/'AD'/'YB' codes so existing routes
// (e.g. /dashboard/countries/bn) keep working unchanged.

export type GeopoliticalZone =
  | 'North Central'
  | 'North East'
  | 'North West'
  | 'South East'
  | 'South South'
  | 'South West'

export interface NigeriaState {
  code: string
  name: string
  zone: GeopoliticalZone
  population: number // in millions, approximate
  lgaCount: number // official LGA count
}

export const nigeriaStates: Record<string, NigeriaState> = {
  AB: { code: 'AB', name: 'Abia', zone: 'South East', population: 3.8, lgaCount: 17 },
  AD: { code: 'AD', name: 'Adamawa', zone: 'North East', population: 3.79, lgaCount: 21 },
  AK: { code: 'AK', name: 'Akwa Ibom', zone: 'South South', population: 5.6, lgaCount: 31 },
  AN: { code: 'AN', name: 'Anambra', zone: 'South East', population: 5.6, lgaCount: 21 },
  BA: { code: 'BA', name: 'Bauchi', zone: 'North East', population: 6.5, lgaCount: 20 },
  BY: { code: 'BY', name: 'Bayelsa', zone: 'South South', population: 2.3, lgaCount: 8 },
  BE: { code: 'BE', name: 'Benue', zone: 'North Central', population: 5.2, lgaCount: 23 },
  BN: { code: 'BN', name: 'Borno', zone: 'North East', population: 4.25, lgaCount: 27 },
  CR: { code: 'CR', name: 'Cross River', zone: 'South South', population: 3.9, lgaCount: 18 },
  DE: { code: 'DE', name: 'Delta', zone: 'South South', population: 5.7, lgaCount: 25 },
  EB: { code: 'EB', name: 'Ebonyi', zone: 'South East', population: 3.1, lgaCount: 13 },
  ED: { code: 'ED', name: 'Edo', zone: 'South South', population: 4.2, lgaCount: 18 },
  EK: { code: 'EK', name: 'Ekiti', zone: 'South West', population: 3.3, lgaCount: 16 },
  EN: { code: 'EN', name: 'Enugu', zone: 'South East', population: 4.4, lgaCount: 17 },
  FC: { code: 'FC', name: 'FCT', zone: 'North Central', population: 3.6, lgaCount: 6 },
  GO: { code: 'GO', name: 'Gombe', zone: 'North East', population: 3.3, lgaCount: 11 },
  IM: { code: 'IM', name: 'Imo', zone: 'South East', population: 5.4, lgaCount: 27 },
  JI: { code: 'JI', name: 'Jigawa', zone: 'North West', population: 5.9, lgaCount: 27 },
  KD: { code: 'KD', name: 'Kaduna', zone: 'North West', population: 8.9, lgaCount: 23 },
  KN: { code: 'KN', name: 'Kano', zone: 'North West', population: 15.0, lgaCount: 44 },
  KT: { code: 'KT', name: 'Katsina', zone: 'North West', population: 9.4, lgaCount: 34 },
  KB: { code: 'KB', name: 'Kebbi', zone: 'North West', population: 4.9, lgaCount: 21 },
  KO: { code: 'KO', name: 'Kogi', zone: 'North Central', population: 4.4, lgaCount: 21 },
  KW: { code: 'KW', name: 'Kwara', zone: 'North Central', population: 3.3, lgaCount: 16 },
  LA: { code: 'LA', name: 'Lagos', zone: 'South West', population: 15.9, lgaCount: 20 },
  NS: { code: 'NS', name: 'Nasarawa', zone: 'North Central', population: 2.5, lgaCount: 13 },
  NG: { code: 'NG', name: 'Niger', zone: 'North Central', population: 5.9, lgaCount: 25 },
  OG: { code: 'OG', name: 'Ogun', zone: 'South West', population: 5.9, lgaCount: 20 },
  ON: { code: 'ON', name: 'Ondo', zone: 'South West', population: 5.2, lgaCount: 18 },
  OS: { code: 'OS', name: 'Osun', zone: 'South West', population: 4.8, lgaCount: 30 },
  OY: { code: 'OY', name: 'Oyo', zone: 'South West', population: 7.8, lgaCount: 33 },
  PL: { code: 'PL', name: 'Plateau', zone: 'North Central', population: 4.3, lgaCount: 17 },
  RI: { code: 'RI', name: 'Rivers', zone: 'South South', population: 7.3, lgaCount: 23 },
  SO: { code: 'SO', name: 'Sokoto', zone: 'North West', population: 5.7, lgaCount: 23 },
  TA: { code: 'TA', name: 'Taraba', zone: 'North East', population: 3.3, lgaCount: 16 },
  YB: { code: 'YB', name: 'Yobe', zone: 'North East', population: 2.43, lgaCount: 17 },
  ZA: { code: 'ZA', name: 'Zamfara', zone: 'North West', population: 5.3, lgaCount: 14 },
}

export function getStateName(stateCode: string): string {
  return nigeriaStates[stateCode.toUpperCase()]?.name || ''
}

export function getStateByName(name: string): NigeriaState | undefined {
  const lower = name.trim().toLowerCase()
  return Object.values(nigeriaStates).find(s => s.name.toLowerCase() === lower)
}

export function getStateCodeByName(name: string): string | undefined {
  return getStateByName(name)?.code
}
