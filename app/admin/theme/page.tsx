'use client'

import { useState } from 'react'
import { useAdminContent } from '@/lib/use-admin-content'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, RotateCcw, Loader2, Trash2, Plus } from 'lucide-react'

const COLOR_PRESETS = [
  { label: 'Amber Gold', value: '#f4b942' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Pink', value: '#ec4899' },
]

const SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '60px']

export default function ThemeEditor() {
  const {
    content, elementStyles, hasChanges, isSaving,
    updateColor, updateElementStyle, removeElementStyle, save, revert,
  } = useAdminContent()
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [newStyleKey, setNewStyleKey] = useState('')

  const accent = content.colors?.accent ?? '#f4b942'

  const handleSave = async () => {
    try {
      await save()
      setSaveMessage('Theme saved!')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err: any) {
      setSaveMessage(err.message || 'Failed to save.')
      setTimeout(() => setSaveMessage(null), 5000)
    }
  }

  const addNewStyle = () => {
    const key = newStyleKey.trim()
    if (!key) return
    updateElementStyle(key, {})
    setNewStyleKey('')
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Theme Settings</h1>
        <p className="text-sm text-muted-foreground">Customize colors and per-element style overrides.</p>
      </div>

      {/* Accent Color */}
      <Card className="bg-card border-border p-4 md:p-6 space-y-6">
        <div>
          <h2 className="font-bold text-lg mb-1">Accent Color</h2>
          <p className="text-sm text-muted-foreground">The primary brand color used across buttons, badges, and highlights.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="color"
              value={accent}
              onChange={e => updateColor('accent', e.target.value)}
              className="w-14 h-14 rounded-xl cursor-pointer border-2 border-border bg-transparent p-1"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-muted-foreground">{accent}</span>
              <div className="h-6 flex-1 rounded-lg border border-border" style={{ backgroundColor: accent }} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Presets</Label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map(preset => (
              <button
                key={preset.value}
                onClick={() => updateColor('accent', preset.value)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:scale-105"
                style={{
                  borderColor: accent === preset.value ? preset.value : 'var(--border)',
                  backgroundColor: accent === preset.value ? `${preset.value}15` : 'transparent',
                }}
              >
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.value }} />
                <span className="text-xs font-medium">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Element Style Overrides */}
      <Card className="bg-card border-border p-4 md:p-6 space-y-6">
        <div>
          <h2 className="font-bold text-lg mb-1">Element Style Overrides</h2>
          <p className="text-sm text-muted-foreground">
            Override colors, font size, bold, and italic on specific content elements.
            Keys match content paths like <code className="text-xs bg-secondary px-1 py-0.5 rounded">hero.title</code>.
          </p>
        </div>

        {Object.keys(elementStyles).length === 0 && (
          <p className="text-sm text-muted-foreground py-4">No element overrides configured. Add one below.</p>
        )}

        <div className="space-y-3">
          {Object.entries(elementStyles).map(([key, style]) => (
            <div key={key} className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-secondary/20 border border-border">
              <code className="text-xs font-mono text-accent min-w-[120px]">{key}</code>

              {/* Color */}
              <div className="flex items-center gap-1.5">
                <Label className="text-[10px] text-muted-foreground">Color</Label>
                <input
                  type="color"
                  value={style.color ?? '#ffffff'}
                  onChange={e => updateElementStyle(key, { color: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer border border-border bg-transparent p-0.5"
                />
                {style.color && (
                  <span className="text-[10px] font-mono text-muted-foreground">{style.color}</span>
                )}
              </div>

              {/* Font size */}
              <div className="flex items-center gap-1.5">
                <Label className="text-[10px] text-muted-foreground">Size</Label>
                <select
                  value={style.fontSize ?? ''}
                  onChange={e => updateElementStyle(key, { fontSize: e.target.value || undefined })}
                  className="bg-secondary border border-border rounded px-2 py-1 text-xs"
                >
                  <option value="">auto</option>
                  {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Bold */}
              <button
                onClick={() => updateElementStyle(key, { fontWeight: style.fontWeight === 'bold' ? undefined : 'bold' })}
                className={`px-2 py-1 rounded text-xs font-bold border transition ${
                  style.fontWeight === 'bold' ? 'bg-accent/20 border-accent/40 text-accent' : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                B
              </button>

              {/* Italic */}
              <button
                onClick={() => updateElementStyle(key, { fontStyle: style.fontStyle === 'italic' ? undefined : 'italic' })}
                className={`px-2 py-1 rounded text-xs italic border transition ${
                  style.fontStyle === 'italic' ? 'bg-accent/20 border-accent/40 text-accent' : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                I
              </button>

              {/* Delete */}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 ml-auto"
                onClick={() => removeElementStyle(key)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add new override */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Input
            value={newStyleKey}
            onChange={e => setNewStyleKey(e.target.value)}
            placeholder="e.g. hero.title"
            className="bg-secondary/30 border-border text-sm max-w-xs"
            onKeyDown={e => e.key === 'Enter' && addNewStyle()}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={addNewStyle}
            disabled={!newStyleKey.trim()}
            className="gap-1.5 border-border bg-transparent text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Add Override
          </Button>
        </div>
      </Card>

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
