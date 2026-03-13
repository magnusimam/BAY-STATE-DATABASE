import { db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export interface StateData {
  lgas: string[]
  indicators: string[]
  rows: object[]
  summary: { totalDisplacement2025: number; totalConflict2025: number; totalLGAs: number }
  lastSynced?: number
}

export type TrackerDoc = StateData & { lastSynced: number }

export async function readTrackerData(state: string): Promise<TrackerDoc | null> {
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, 'tracker', state))
    return snap.exists() ? (snap.data() as TrackerDoc) : null
  } catch {
    return null
  }
}

export async function writeTrackerData(state: string, data: Omit<StateData, 'lastSynced'>): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'tracker', state), { ...data, lastSynced: Date.now() })
}
