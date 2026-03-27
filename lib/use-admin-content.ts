'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import defaultContent from '@/lib/site-content.json'

export type SiteContent = typeof defaultContent

export interface ElementStyle {
  color?: string
  fontSize?: string
  fontWeight?: string
  fontStyle?: string
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const result = deepClone(obj)
  const keys = path.split('.')
  let current: Record<string, unknown> = result
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]] as Record<string, unknown>
  }
  current[keys[keys.length - 1]] = value
  return result
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

export function useAdminContent() {
  const { user } = useAuth()
  const [content, setContent] = useState<SiteContent>(defaultContent as SiteContent)
  const [savedContent, setSavedContent] = useState<SiteContent>(defaultContent as SiteContent)
  const [elementStyles, setElementStyles] = useState<Record<string, ElementStyle>>({})
  const [savedElementStyles, setSavedElementStyles] = useState<Record<string, ElementStyle>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Load content on mount
  useEffect(() => {
    fetch('/api/editor/content')
      .then(r => r.json())
      .then((data: SiteContent & { elementStyles?: Record<string, ElementStyle> }) => {
        const { elementStyles: es, ...rest } = data
        setContent(rest as SiteContent)
        setSavedContent(rest as SiteContent)
        const styles = es ?? {}
        setElementStyles(styles)
        setSavedElementStyles(styles)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  // Track changes
  useEffect(() => {
    const contentChanged = JSON.stringify(content) !== JSON.stringify(savedContent)
    const stylesChanged = JSON.stringify(elementStyles) !== JSON.stringify(savedElementStyles)
    setHasChanges(contentChanged || stylesChanged)
  }, [content, savedContent, elementStyles, savedElementStyles])

  const updateField = useCallback((path: string, value: string) => {
    setContent(prev => setNestedValue(prev as unknown as Record<string, unknown>, path, value) as unknown as SiteContent)
  }, [])

  const updateArrayItem = useCallback((arrayPath: string, index: number, field: string, value: string) => {
    setContent(prev => {
      const result = deepClone(prev) as Record<string, unknown>
      const keys = arrayPath.split('.')
      let current: unknown = result
      for (const key of keys) current = (current as Record<string, unknown>)[key]
      ;(current as Record<string, string>[])[index][field] = value
      return result as unknown as SiteContent
    })
  }, [])

  const addArrayItem = useCallback((arrayPath: string, template: Record<string, string>) => {
    setContent(prev => {
      const result = deepClone(prev) as Record<string, unknown>
      const keys = arrayPath.split('.')
      let current: unknown = result
      for (const key of keys) current = (current as Record<string, unknown>)[key]
      ;(current as Record<string, string>[]).push({ ...template })
      return result as unknown as SiteContent
    })
  }, [])

  const removeArrayItem = useCallback((arrayPath: string, index: number) => {
    setContent(prev => {
      const result = deepClone(prev) as Record<string, unknown>
      const keys = arrayPath.split('.')
      let current: unknown = result
      for (const key of keys) current = (current as Record<string, unknown>)[key]
      ;(current as unknown[]).splice(index, 1)
      return result as unknown as SiteContent
    })
  }, [])

  const reorderSections = useCallback((newOrder: string[]) => {
    setContent(prev => ({ ...prev, sectionOrder: newOrder }))
  }, [])

  const updateColor = useCallback((key: string, value: string) => {
    setContent(prev => ({ ...prev, colors: { ...prev.colors, [key]: value } }))
  }, [])

  const updateElementStyle = useCallback((key: string, style: Partial<ElementStyle>) => {
    setElementStyles(prev => ({
      ...prev,
      [key]: { ...prev[key], ...style },
    }))
  }, [])

  const removeElementStyle = useCallback((key: string) => {
    setElementStyles(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const save = useCallback(async () => {
    setIsSaving(true)
    try {
      const idToken = await user?.getIdToken()
      const payload = { ...content, elementStyles }
      const res = await fetch('/api/editor/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      if (res.status === 401 || res.status === 403) {
        throw new Error('Access denied. Only admins can save changes.')
      }
      if (!res.ok) throw new Error('Save failed')
      setSavedContent(deepClone(content))
      setSavedElementStyles(deepClone(elementStyles))
      setHasChanges(false)
      return true
    } catch (err) {
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [content, elementStyles, user])

  const revert = useCallback(() => {
    setContent(deepClone(savedContent))
    setElementStyles(deepClone(savedElementStyles))
    setHasChanges(false)
  }, [savedContent, savedElementStyles])

  return {
    content,
    elementStyles,
    isLoading,
    isSaving,
    hasChanges,
    updateField,
    updateArrayItem,
    addArrayItem,
    removeArrayItem,
    reorderSections,
    updateColor,
    updateElementStyle,
    removeElementStyle,
    save,
    revert,
  }
}
