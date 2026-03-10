'use client'

import { useState, useRef } from 'react'
import { useEditor } from './EditorContext'

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Banner',
  indicators: 'Platform Capabilities',
  geographic: 'BAY States Map',
  'borno-tracker': 'Borno LGA Tracker',
  features: 'Platform Features',
  impact: 'Impact Stories',
  cta: 'Call to Action',
}

// ─── Color Editor Panel ───────────────────────────────────────────────────────
function ColorPanel({ onClose }: { onClose: () => void }) {
  const { content, updateColor } = useEditor()
  const accent = content.colors?.accent ?? '#f4b942'

  return (
    <div className="absolute bottom-full mb-3 right-0 w-72 bg-[#1a1e2e] border border-white/10 rounded-xl shadow-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Theme Colors</span>
        <button onClick={onClose} className="text-white/40 hover:text-white transition text-lg leading-none">×</button>
      </div>

      {/* Accent color */}
      <div className="space-y-2">
        <label className="text-xs text-white/60 uppercase tracking-wider">Accent Color</label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={accent}
              onChange={e => updateColor('accent', e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0 block"
              style={{ accentColor: accent }}
            />
          </div>
          <div className="flex-1">
            <div
              className="h-8 w-full rounded-lg border border-white/10"
              style={{ backgroundColor: accent }}
            />
          </div>
          <span className="font-mono text-xs text-white/70 w-16">{accent}</span>
        </div>
        <p className="text-[11px] text-white/40">Applied live across buttons, badges, and highlights</p>
      </div>

      {/* Color presets */}
      <div className="space-y-2">
        <label className="text-xs text-white/60 uppercase tracking-wider">Presets</label>
        <div className="flex gap-2 flex-wrap">
          {[
            '#f4b942', '#3b82f6', '#10b981', '#8b5cf6',
            '#ef4444', '#f97316', '#06b6d4', '#ec4899',
          ].map(color => (
            <button
              key={color}
              onClick={() => updateColor('accent', color)}
              className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: color,
                borderColor: accent === color ? 'white' : 'transparent',
              }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section Reorder Panel ─────────────────────────────────────────────────────
function SectionPanel({ onClose }: { onClose: () => void }) {
  const { content, reorderSections } = useEditor()
  const sections = content.sectionOrder
  const dragIndex = useRef<number | null>(null)
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

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

  return (
    <div className="absolute bottom-full mb-3 right-0 w-72 bg-[#1a1e2e] border border-white/10 rounded-xl shadow-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Section Order</span>
        <button onClick={onClose} className="text-white/40 hover:text-white transition text-lg leading-none">×</button>
      </div>
      <p className="text-[11px] text-white/40">Drag sections to reorder them on the page</p>

      <div className="space-y-1.5">
        {sections.map((id, index) => (
          <div
            key={id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={e => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={() => { setDragging(null); setDragOver(null) }}
            className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all cursor-grab active:cursor-grabbing select-none ${
              dragging === index
                ? 'opacity-40 border-white/20 bg-white/5'
                : dragOver === index
                ? 'border-blue-400/60 bg-blue-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            {/* Drag handle */}
            <svg className="w-3.5 h-3.5 text-white/30 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="7" cy="5" r="1.5"/>
              <circle cx="13" cy="5" r="1.5"/>
              <circle cx="7" cy="10" r="1.5"/>
              <circle cx="13" cy="10" r="1.5"/>
              <circle cx="7" cy="15" r="1.5"/>
              <circle cx="13" cy="15" r="1.5"/>
            </svg>

            <span className="flex-1 text-xs text-white/80 font-medium">{SECTION_LABELS[id] ?? id}</span>

            {/* Arrow buttons */}
            <div className="flex gap-1">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition"
                title="Move up"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/>
                </svg>
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === sections.length - 1}
                className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition"
                title="Move down"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>

            {/* Index badge */}
            <span className="text-[10px] font-mono text-white/20 w-4 text-right">{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Toolbar ──────────────────────────────────────────────────────────────
export function EditorToolbar() {
  const { isAdmin, isEditing, setIsEditing, save, cancel, isSaving, hasChanges } = useEditor()
  const [panel, setPanel] = useState<'colors' | 'sections' | null>(null)

  // Only admins ever see the editor UI
  if (!isAdmin) return null

  const togglePanel = (p: 'colors' | 'sections') => {
    setPanel(prev => (prev === p ? null : p))
  }

  if (!isEditing) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2.5 bg-[#1a1e2e] hover:bg-[#232840] text-white border border-white/10 rounded-full px-5 py-3 shadow-2xl shadow-black/40 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          title="Enter page editor"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          Edit Page
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Edit mode overlay hint */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9998] pointer-events-none">
        <div className="bg-[#1a1e2e]/90 text-white/70 text-xs font-medium px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-white/10">
          Hover to highlight · Click to select &amp; style · Double-click to edit text
        </div>
      </div>

      {/* Main toolbar bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none">
        <div className="pointer-events-auto mb-6 flex items-center gap-2 bg-[#1a1e2e]/95 border border-white/10 backdrop-blur-md rounded-2xl px-3 py-2 shadow-2xl shadow-black/60">

          {/* Left: Mode label */}
          <div className="flex items-center gap-2 px-2">
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs text-white/60 font-medium">Edit Mode</span>
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Colors panel toggle */}
          <div className="relative">
            <button
              onClick={() => togglePanel('colors')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                panel === 'colors'
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
              </svg>
              Colors
            </button>
            {panel === 'colors' && <ColorPanel onClose={() => setPanel(null)} />}
          </div>

          {/* Sections panel toggle */}
          <div className="relative">
            <button
              onClick={() => togglePanel('sections')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                panel === 'sections'
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
              Sections
            </button>
            {panel === 'sections' && <SectionPanel onClose={() => setPanel(null)} />}
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Cancel */}
          <button
            onClick={cancel}
            className="px-3 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            Cancel
          </button>

          {/* Save */}
          <button
            onClick={save}
            disabled={isSaving || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-500 hover:bg-blue-400 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {isSaving ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
                {hasChanges ? 'Save Changes' : 'Saved'}
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
