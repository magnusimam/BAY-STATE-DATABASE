'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import defaultContent from '@/lib/site-content.json'
import { useAuth } from '@/lib/auth-context'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export type SiteContent = typeof defaultContent

export interface ElementStyle {
  color?: string
  fontSize?: string
  fontWeight?: string
  fontStyle?: string
}

interface EditorContextValue {
  isAdmin: boolean
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  content: SiteContent
  updateContent: (path: string, value: string) => void
  updateArrayItemField: (arrayPath: string, index: number, field: string, value: string) => void
  reorderSections: (newOrder: string[]) => void
  updateColor: (key: string, value: string) => void
  // Per-element selection
  selectedKey: string | null
  selectedEl: HTMLElement | null
  selectElement: (key: string, el: HTMLElement) => void
  clearSelection: () => void
  // Per-element styles
  elementStyles: Record<string, ElementStyle>
  updateElementStyle: (key: string, style: Partial<ElementStyle>) => void
  save: () => Promise<void>
  cancel: () => void
  isSaving: boolean
  hasChanges: boolean
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used within EditorProvider')
  return ctx
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: string): Record<string, unknown> {
  const result = deepClone(obj)
  const keys = path.split('.')
  let current: Record<string, unknown> = result as Record<string, unknown>
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]] as Record<string, unknown>
  }
  current[keys[keys.length - 1]] = value
  return result
}

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const isAdmin = ADMIN_EMAILS.length > 0
    ? ADMIN_EMAILS.includes((user?.email ?? '').toLowerCase())
    : false

  const [content, setContent] = useState<SiteContent>(defaultContent as SiteContent)
  const [savedContent, setSavedContent] = useState<SiteContent>(defaultContent as SiteContent)
  const [isEditing, setIsEditingRaw] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Per-element selection
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null)

  // Per-element styles (kept separate from content for clean typing)
  const [elementStyles, setElementStyles] = useState<Record<string, ElementStyle>>({})
  const [savedElementStyles, setSavedElementStyles] = useState<Record<string, ElementStyle>>({})

  // Load fresh content from disk on mount
  useEffect(() => {
    fetch('/api/editor/content')
      .then(r => r.json())
      .then((data: SiteContent & { elementStyles?: Record<string, ElementStyle> }) => {
        const { elementStyles: es, ...rest } = data as typeof data & { elementStyles?: Record<string, ElementStyle> }
        setContent(rest as SiteContent)
        setSavedContent(rest as SiteContent)
        const styles = es ?? {}
        setElementStyles(styles)
        setSavedElementStyles(styles)
      })
      .catch(() => {})
  }, [])

  // Apply accent color CSS variable
  useEffect(() => {
    const accent = content.colors?.accent
    if (accent) document.documentElement.style.setProperty('--editor-accent', accent)
  }, [content.colors?.accent])

  // Clear selection when exiting edit mode
  useEffect(() => {
    if (!isEditing) {
      setSelectedKey(null)
      setSelectedEl(null)
    }
  }, [isEditing])

  const updateContent = useCallback((path: string, value: string) => {
    setContent(prev => setNestedValue(prev as unknown as Record<string, unknown>, path, value) as unknown as SiteContent)
    setHasChanges(true)
  }, [])

  const updateArrayItemField = useCallback((arrayPath: string, index: number, field: string, value: string) => {
    setContent(prev => {
      const result = deepClone(prev) as Record<string, unknown>
      const keys = arrayPath.split('.')
      let current: unknown = result
      for (const key of keys) current = (current as Record<string, unknown>)[key]
      ;(current as Record<string, string>[])[index][field] = value
      return result as unknown as SiteContent
    })
    setHasChanges(true)
  }, [])

  const reorderSections = useCallback((newOrder: string[]) => {
    setContent(prev => ({ ...prev, sectionOrder: newOrder }))
    setHasChanges(true)
  }, [])

  const updateColor = useCallback((key: string, value: string) => {
    setContent(prev => ({ ...prev, colors: { ...prev.colors, [key]: value } }))
    setHasChanges(true)
    document.documentElement.style.setProperty('--editor-accent', value)
  }, [])

  const selectElement = useCallback((key: string, el: HTMLElement) => {
    setSelectedKey(key)
    setSelectedEl(el)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedKey(null)
    setSelectedEl(null)
  }, [])

  const updateElementStyle = useCallback((key: string, style: Partial<ElementStyle>) => {
    setElementStyles(prev => ({
      ...prev,
      [key]: { ...prev[key], ...style },
    }))
    setHasChanges(true)
  }, [])

  const save = useCallback(async () => {
    if (!isAdmin) return
    setIsSaving(true)
    try {
      const idToken = await user?.getIdToken()
      const payload = { ...content, elementStyles }
      const res = await fetch('/api/editor/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      if (res.status === 401 || res.status === 403) {
        alert('Access denied. Only admins can save changes.')
        return
      }
      if (!res.ok) throw new Error('Save failed')
      setSavedContent(content)
      setSavedElementStyles(elementStyles)
      setHasChanges(false)
      setIsEditingRaw(false)
      clearSelection()
    } catch {
      alert('Failed to save. Make sure the dev server is running.')
    } finally {
      setIsSaving(false)
    }
  }, [content, elementStyles, isAdmin, user, clearSelection])

  const cancel = useCallback(() => {
    setContent(savedContent)
    setElementStyles(savedElementStyles)
    setHasChanges(false)
    setIsEditingRaw(false)
    clearSelection()
    if (savedContent.colors?.accent) {
      document.documentElement.style.setProperty('--editor-accent', savedContent.colors.accent)
    }
  }, [savedContent, savedElementStyles, clearSelection])

  const setIsEditing = useCallback((editing: boolean) => {
    if (!editing) cancel()
    else setIsEditingRaw(true)
  }, [cancel])

  return (
    <EditorContext.Provider value={{
      isAdmin,
      isEditing,
      setIsEditing,
      content,
      updateContent,
      updateArrayItemField,
      reorderSections,
      updateColor,
      selectedKey,
      selectedEl,
      selectElement,
      clearSelection,
      elementStyles,
      updateElementStyle,
      save,
      cancel,
      isSaving,
      hasChanges,
    }}>
      {children}
    </EditorContext.Provider>
  )
}
