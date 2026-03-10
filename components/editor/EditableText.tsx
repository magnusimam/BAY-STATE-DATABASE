'use client'

import { useEditor } from './EditorContext'
import { useRef, useEffect, CSSProperties } from 'react'

type TagName = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'div' | 'strong' | 'em' | 'li'

interface Props {
  contentKey: string
  as?: TagName
  className?: string
  children: string
  multiline?: boolean
}

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'string' ? current : undefined
}

export function EditableText({ contentKey, as: Tag = 'span', className = '', children, multiline = false }: Props) {
  const { isEditing, content, updateContent, selectedKey, selectElement, clearSelection, elementStyles } = useEditor()
  const ref = useRef<HTMLElement>(null)

  const value = getNestedValue(content as unknown as Record<string, unknown>, contentKey) ?? children
  const isSelected = isEditing && selectedKey === contentKey
  const savedStyle = elementStyles[contentKey] ?? {}

  // Build inline style from per-element styles
  const inlineStyle: CSSProperties = {}
  if (savedStyle.color) inlineStyle.color = savedStyle.color
  if (savedStyle.fontSize) inlineStyle.fontSize = savedStyle.fontSize
  if (savedStyle.fontWeight) inlineStyle.fontWeight = savedStyle.fontWeight
  if (savedStyle.fontStyle) inlineStyle.fontStyle = savedStyle.fontStyle

  // Sync DOM content when value changes externally (cancel/revert)
  useEffect(() => {
    if (ref.current && !isSelected && ref.current.textContent !== value) {
      ref.current.textContent = value
    }
  }, [value, isSelected])

  const Elem = Tag as React.ElementType

  // ── View mode: just render with saved styles ────────────────────────────────
  if (!isEditing) {
    return <Elem className={className} style={inlineStyle}>{value}</Elem>
  }

  // ── Edit mode ───────────────────────────────────────────────────────────────
  return (
    <Elem
      ref={ref}
      contentEditable={isSelected}
      suppressContentEditableWarning
      data-editor-key={contentKey}
      style={inlineStyle}
      className={[
        className,
        // Selected: solid blue outline
        isSelected
          ? 'outline outline-2 outline-blue-500 rounded-[3px] bg-blue-500/5'
          : 'hover:outline hover:outline-1 hover:outline-dashed hover:outline-blue-400/50 hover:rounded-[2px] cursor-pointer',
        'transition-[outline] duration-100',
      ].join(' ')}
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        if (!isSelected) {
          selectElement(contentKey, e.currentTarget)
          // Focus after next tick so contentEditable is active
          setTimeout(() => {
            const el = e.currentTarget
            el.focus()
            // Place cursor at end
            const range = document.createRange()
            range.selectNodeContents(el)
            range.collapse(false)
            const sel = window.getSelection()
            sel?.removeAllRanges()
            sel?.addRange(range)
          }, 0)
        }
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const text = e.currentTarget.textContent?.trim() || ''
        if (text) updateContent(contentKey, text)
        // Don't clearSelection here — let the PropertyPanel toolbar remain
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (!multiline && e.key === 'Enter') {
          e.preventDefault()
          e.currentTarget.blur()
        }
        if (e.key === 'Escape') {
          e.currentTarget.blur()
          clearSelection()
        }
      }}
    >
      {value}
    </Elem>
  )
}
