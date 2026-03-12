import { db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { BornoData } from '@/app/api/sheets/borno/route'

export type TrackerDoc = BornoData & { lastSynced: number }

export async function readTrackerData(state: string): Promise<TrackerDoc | null> {
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, 'tracker', state))
    return snap.exists() ? (snap.data() as TrackerDoc) : null
  } catch {
    return null
  }
}

export async function writeTrackerData(state: string, data: BornoData): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'tracker', state), { ...data, lastSynced: Date.now() })
}
