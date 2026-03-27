'use client'

import { useRef, useState } from 'react'
import { useAdminContent } from '@/lib/use-admin-content'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown, GripVertical, Save, RotateCcw, Loader2 } from 'lucide-react'

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Banner',
  indicators: 'Platform Capabilities',
  geographic: 'BAY States Map',
  'borno-tracker': 'Borno LGA Tracker',
  features: 'Platform Features',
  impact: 'Impact Stories',
  cta: 'Call to Action',
}

const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero: 'Main banner with title, description, CTAs, and animated stats',
  indicators: 'Four metric cards showing platform capabilities',
  geographic: 'BAY States humanitarian index with interactive map bubbles',
  'borno-tracker': 'Live LGA performance tracker table sourced from Google Sheets',
  features: 'Feature cards describing platform tools and analysis',
  impact: 'Testimonials and success stories from humanitarian organizations',
  cta: 'Call-to-action section encouraging sign-ups',
}

export default function SectionsEditor() {
  const { content, reorderSections, hasChanges, isSaving, save, revert } = useAdminContent()
  const sections = content.sectionOrder
  const dragIndex = useRef<number | null>(null)
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const handleDragStart = (index: number) => {
    dragIndex.current = index
    setDragging(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOver(index)
  }

  const handleDrop = (dropIndex: number) => {
    const from = dragIndex.current
    if (from === null || from === dropIndex) {
      setDragging(null)
      setDragOver(null)
      return
    }
    const next = [...sections]
    const [moved] = next.splice(from, 1)
    next.splice(dropIndex, 0, moved)
    reorderSections(next)
    dragIndex.current = null
    setDragging(null)
    setDragOver(null)
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const next = [...sections]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    reorderSections(next)
  }

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return
    const next = [...sections]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    reorderSections(next)
  }

  const handleSave = async () => {
    try {
      await save()
      setSaveMessage('Section order saved!')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err: any) {
      setSaveMessage(err.message || 'Failed to save.')
      setTimeout(() => setSaveMessage(null), 5000)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Section Order</h1>
        <p className="text-sm text-muted-foreground">Drag and drop or use arrows to reorder landing page sections.</p>
      </div>

      <div className="space-y-2">
        {sections.map((id, index) => (
          <Card
            key={id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={e => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={() => { setDragging(null); setDragOver(null) }}
            className={`border-border transition-all cursor-grab active:cursor-grabbing select-none ${
              dragging === index
                ? 'opacity-40 scale-[0.98]'
                : dragOver === index
                ? 'border-accent/60 bg-accent/5'
                : 'bg-card hover:border-accent/30'
            }`}
          >
            <div className="p-4 flex items-center gap-4">
              {/* Drag handle */}
              <GripVertical className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />

              {/* Position number */}
              <div className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{SECTION_LABELS[id] ?? id}</h3>
                <p className="text-xs text-muted-foreground truncate">{SECTION_DESCRIPTIONS[id] ?? ''}</p>
              </div>

              {/* Arrow buttons */}
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveDown(index)}
                  disabled={index === sections.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Save bar */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border -mx-4 md:-mx-6 px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        <div>
          {saveMessage && (
            <span className={`text-sm font-medium ${saveMessage.includes('saved') ? 'text-green-400' : 'text-destructive'}`}>
              {saveMessage}
            </span>
          )}
          {hasChanges && !saveMessage && (
            <span className="text-sm text-muted-foreground">Unsaved changes</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={revert} disabled={!hasChanges || isSaving} className="gap-1.5 border-border bg-transparent text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Revert
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges || isSaving} className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 text-xs">
            {isSaving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</> : <><Save className="h-3.5 w-3.5" /> Save</>}
          </Button>
        </div>
      </div>
    </div>
  )
}
