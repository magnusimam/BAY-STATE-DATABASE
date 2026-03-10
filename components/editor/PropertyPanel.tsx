'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useEditor } from './EditorContext'

/** Normalise user input to a valid CSS hex color or return null */
function parseHex(raw: string): string | null {
  const s = raw.trim().replace(/^#+/, '')
  if (/^[0-9a-fA-F]{3}$/.test(s)) {
    // Expand 3-digit shorthand → 6-digit
    return '#' + s.split('').map(c => c + c).join('')
  }
  if (/^[0-9a-fA-F]{6}$/.test(s)) return '#' + s
  return null
}

// ── Preset text colors ────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { label: 'Reset', value: '' },
  { label: 'White', value: '#ffffff' },
  { label: 'Gold', value: '#f4b942' },
  { label: 'Sky Blue', value: '#6ec6e8' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Gray', value: '#94a3b8' },
]

// ── Font size steps ───────────────────────────────────────────────────────────
const SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '60px']

function getNextSize(current: string | undefined, direction: 1 | -1): string | undefined {
  if (!current) {
    return direction === 1 ? '20px' : '14px'
  }
  const idx = SIZES.indexOf(current)
  if (idx === -1) return direction === 1 ? '20px' : '14px'
  const next = idx + direction
  if (next < 0 || next >= SIZES.length) return current
  return SIZES[next]
}

// ── Panel ─────────────────────────────────────────────────────────────────────
export function PropertyPanel() {
  const { selectedKey, selectedEl, clearSelection, elementStyles, updateElementStyle } = useEditor()
  const [rect, setRect] = useState<DOMRect | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Hex input state
  const [hexInput, setHexInput] = useState('')
  const [hexError, setHexError] = useState(false)

  // Sync hex input when selection changes
  useEffect(() => {
    if (selectedKey) {
      setHexInput(elementStyles[selectedKey]?.color ?? '')
      setHexError(false)
    }
  }, [selectedKey, elementStyles])

  const applyHex = useCallback((raw: string) => {
    if (!selectedKey) return
    const valid = parseHex(raw)
    if (valid) {
      updateElementStyle(selectedKey, { color: valid })
      setHexInput(valid)
      setHexError(false)
    } else if (raw === '') {
      updateElementStyle(selectedKey, { color: undefined })
      setHexError(false)
    } else {
      setHexError(true)
    }
  }, [selectedKey, updateElementStyle])

  // Track selected element position (updates on scroll/resize)
  useEffect(() => {
    if (!selectedEl) { setRect(null); return }

    const update = () => setRect(selectedEl.getBoundingClientRect())
    update()

    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [selectedEl])

  // Close when clicking completely outside both the element and panel
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!selectedEl) return
      const target = e.target as Node
      if (
        !selectedEl.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        clearSelection()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [selectedEl, clearSelection])

  if (!selectedKey || !rect) return null

  const style = elementStyles[selectedKey] ?? {}

  // Position: try above the element, fall back to below
  const PANEL_HEIGHT = 48
  const GAP = 8
  const rawTop = rect.top - PANEL_HEIGHT - GAP
  const top = rawTop < 8 ? rect.bottom + GAP : rawTop
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - 360))

  return (
    <div
      ref={panelRef}
      onMouseDown={e => e.preventDefault()} // don't steal focus from contenteditable
      className="fixed z-[10000] flex items-center gap-1 px-2 py-1.5 bg-[#12151f] border border-white/15 rounded-xl shadow-2xl shadow-black/60 backdrop-blur-sm"
      style={{ top, left }}
    >
      {/* ── Label ── */}
      <span className="text-[10px] text-white/30 font-mono pr-1 select-none">
        {selectedKey.split('.').pop()}
      </span>

      <div className="w-px h-4 bg-white/10" />

      {/* ── Color presets ── */}
      <div className="flex items-center gap-1">
        {COLOR_PRESETS.map(c => (
          <button
            key={c.value}
            onClick={() => {
              updateElementStyle(selectedKey, { color: c.value || undefined })
              setHexInput(c.value)
              setHexError(false)
            }}
            title={c.label}
            className={[
              'w-4 h-4 rounded-full border transition-transform hover:scale-125',
              style.color === c.value
                ? 'border-white border-2 scale-110'
                : 'border-white/20 hover:border-white/50',
              c.value === '' ? 'border-dashed border-white/40' : '',
            ].join(' ')}
            style={{ backgroundColor: c.value || 'transparent' }}
          >
            {c.value === '' && (
              <span className="text-white/40 text-[8px] leading-none flex items-center justify-center w-full h-full">✕</span>
            )}
          </button>
        ))}

        {/* Custom color wheel */}
        <div className="relative w-4 h-4" title="Custom color">
          <input
            type="color"
            value={style.color ?? '#ffffff'}
            onChange={e => {
              updateElementStyle(selectedKey, { color: e.target.value })
              setHexInput(e.target.value)
              setHexError(false)
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-4 h-4 rounded-full border border-dashed border-white/40 overflow-hidden pointer-events-none"
            style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }}
          />
        </div>
      </div>

      {/* ── Hex color input ── */}
      <div className="flex items-center gap-1">
        <span className="text-white/30 text-xs font-mono">#</span>
        <input
          type="text"
          maxLength={7}
          placeholder="e.g. f4b942"
          value={hexInput.replace(/^#/, '')}
          onMouseDown={e => e.stopPropagation()}
          onChange={e => {
            const raw = e.target.value
            setHexInput(raw)
            setHexError(false)
            // Apply live as user types when input looks complete
            const valid = parseHex(raw)
            if (valid && selectedKey) {
              updateElementStyle(selectedKey, { color: valid })
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') applyHex(hexInput)
            e.stopPropagation() // don't let keydown bubble to EditableText
          }}
          onBlur={() => applyHex(hexInput)}
          className={[
            'w-20 bg-white/5 border rounded px-1.5 py-0.5 text-xs font-mono text-white outline-none transition',
            hexError
              ? 'border-red-500/70 text-red-400'
              : 'border-white/10 focus:border-blue-400/60 focus:bg-white/10',
          ].join(' ')}
        />
        {/* Live color preview dot */}
        {!hexError && (elementStyles[selectedKey ?? '']?.color) && (
          <div
            className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
            style={{ backgroundColor: elementStyles[selectedKey ?? '']?.color }}
          />
        )}
      </div>

      <div className="w-px h-4 bg-white/10" />

      {/* ── Font size ── */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => {
            const next = getNextSize(style.fontSize, -1)
            if (next) updateElementStyle(selectedKey, { fontSize: next })
          }}
          className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded text-xs font-bold transition"
          title="Smaller"
        >
          A<sup className="text-[7px]">-</sup>
        </button>
        <span className="text-[10px] text-white/40 font-mono w-8 text-center">
          {style.fontSize ?? 'auto'}
        </span>
        <button
          onClick={() => {
            const next = getNextSize(style.fontSize, 1)
            if (next) updateElementStyle(selectedKey, { fontSize: next })
          }}
          className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded text-xs font-bold transition"
          title="Larger"
        >
          A<sup className="text-[8px]">+</sup>
        </button>
      </div>

      <div className="w-px h-4 bg-white/10" />

      {/* ── Bold ── */}
      <button
        onClick={() => updateElementStyle(selectedKey, {
          fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold',
        })}
        title="Bold"
        className={[
          'w-6 h-6 flex items-center justify-center rounded text-xs font-bold transition',
          style.fontWeight === 'bold'
            ? 'bg-blue-500/80 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/10',
        ].join(' ')}
      >
        B
      </button>

      {/* ── Italic ── */}
      <button
        onClick={() => updateElementStyle(selectedKey, {
          fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic',
        })}
        title="Italic"
        className={[
          'w-6 h-6 flex items-center justify-center rounded text-xs italic transition',
          style.fontStyle === 'italic'
            ? 'bg-blue-500/80 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/10',
        ].join(' ')}
      >
        I
      </button>

      <div className="w-px h-4 bg-white/10" />

      {/* ── Reset this element's styles ── */}
      <button
        onClick={() => updateElementStyle(selectedKey, { color: undefined, fontSize: undefined, fontWeight: undefined, fontStyle: undefined })}
        title="Reset styles"
        className="text-[10px] text-white/30 hover:text-white/70 hover:bg-white/10 px-1.5 rounded transition"
      >
        Reset
      </button>

      {/* ── Close ── */}
      <button
        onClick={clearSelection}
        title="Deselect"
        className="w-5 h-5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 rounded transition text-sm leading-none ml-0.5"
      >
        ×
      </button>
    </div>
  )
}
