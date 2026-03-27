'use client'

import { useAdminContent } from '@/lib/use-admin-content'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, RotateCcw, Plus, Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'

function Field({ label, value, onChange, multiline = false, placeholder }: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</Label>
      {multiline ? (
        <Textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-secondary/30 border-border focus:border-accent min-h-[80px] text-sm"
        />
      ) : (
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-secondary/30 border-border focus:border-accent text-sm"
        />
      )}
    </div>
  )
}

function HeroEditor({ content, updateField }: { content: any; updateField: (path: string, value: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-lg mb-1">Hero Section</h3>
        <p className="text-sm text-muted-foreground">The main banner at the top of the landing page.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Badge Text" value={content.hero.badge} onChange={v => updateField('hero.badge', v)} />
        <Field label="Primary CTA" value={content.hero.ctaPrimary} onChange={v => updateField('hero.ctaPrimary', v)} />
      </div>
      <Field label="Title" value={content.hero.title} onChange={v => updateField('hero.title', v)} multiline />
      <Field label="Description" value={content.hero.description} onChange={v => updateField('hero.description', v)} multiline />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Secondary CTA" value={content.hero.ctaSecondary} onChange={v => updateField('hero.ctaSecondary', v)} />
        <Field label="Stat 1 Value" value={content.hero.stat1Value} onChange={v => updateField('hero.stat1Value', v)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Stat 1 Label" value={content.hero.stat1Label} onChange={v => updateField('hero.stat1Label', v)} />
        <Field label="Stat 2 Label" value={content.hero.stat2Label} onChange={v => updateField('hero.stat2Label', v)} />
        <Field label="Stat 3 Label" value={content.hero.stat3Label} onChange={v => updateField('hero.stat3Label', v)} />
      </div>
    </div>
  )
}

function IndicatorsEditor({ content, updateField, updateArrayItem, addArrayItem, removeArrayItem }: {
  content: any
  updateField: (path: string, value: string) => void
  updateArrayItem: (arrayPath: string, index: number, field: string, value: string) => void
  addArrayItem: (arrayPath: string, template: Record<string, string>) => void
  removeArrayItem: (arrayPath: string, index: number) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-lg mb-1">Platform Capabilities</h3>
        <p className="text-sm text-muted-foreground">The indicator cards section showcasing platform metrics.</p>
      </div>
      <Field label="Section Title" value={content.indicators.title} onChange={v => updateField('indicators.title', v)} />
      <Field label="Section Description" value={content.indicators.description} onChange={v => updateField('indicators.description', v)} multiline />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Cards ({content.indicators.cards.length})</h4>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-border bg-transparent text-xs"
            onClick={() => addArrayItem('indicators.cards', { title: 'New Card', description: 'Description', value: '0', metric: 'metric' })}
          >
            <Plus className="h-3.5 w-3.5" /> Add Card
          </Button>
        </div>
        {content.indicators.cards.map((card: any, idx: number) => (
          <Card key={idx} className="bg-secondary/20 border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Card {idx + 1}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                onClick={() => removeArrayItem('indicators.cards', idx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Title" value={card.title} onChange={v => updateArrayItem('indicators.cards', idx, 'title', v)} />
              <Field label="Value" value={card.value} onChange={v => updateArrayItem('indicators.cards', idx, 'value', v)} />
            </div>
            <Field label="Description" value={card.description} onChange={v => updateArrayItem('indicators.cards', idx, 'description', v)} multiline />
            <Field label="Metric Label" value={card.metric} onChange={v => updateArrayItem('indicators.cards', idx, 'metric', v)} />
          </Card>
        ))}
      </div>
    </div>
  )
}

function GeographicEditor({ content, updateField }: { content: any; updateField: (path: string, value: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-lg mb-1">Geographic Section</h3>
        <p className="text-sm text-muted-foreground">The BAY States humanitarian index map section.</p>
      </div>
      <Field label="Badge Text" value={content.geographic.badge} onChange={v => updateField('geographic.badge', v)} />
      <Field label="Title" value={content.geographic.title} onChange={v => updateField('geographic.title', v)} />
      <Field label="Description" value={content.geographic.description} onChange={v => updateField('geographic.description', v)} multiline />
    </div>
  )
}

function FeaturesEditor({ content, updateField, updateArrayItem, addArrayItem, removeArrayItem }: {
  content: any
  updateField: (path: string, value: string) => void
  updateArrayItem: (arrayPath: string, index: number, field: string, value: string) => void
  addArrayItem: (arrayPath: string, template: Record<string, string>) => void
  removeArrayItem: (arrayPath: string, index: number) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-lg mb-1">Platform Features</h3>
        <p className="text-sm text-muted-foreground">Feature cards describing platform capabilities.</p>
      </div>
      <Field label="Section Title" value={content.features.title} onChange={v => updateField('features.title', v)} />
      <Field label="Section Description" value={content.features.description} onChange={v => updateField('features.description', v)} multiline />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Feature Items ({content.features.items.length})</h4>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-border bg-transparent text-xs"
            onClick={() => addArrayItem('features.items', { title: 'New Feature', description: 'Feature description' })}
          >
            <Plus className="h-3.5 w-3.5" /> Add Feature
          </Button>
        </div>
        {content.features.items.map((item: any, idx: number) => (
          <Card key={idx} className="bg-secondary/20 border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Feature {idx + 1}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                onClick={() => removeArrayItem('features.items', idx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Field label="Title" value={item.title} onChange={v => updateArrayItem('features.items', idx, 'title', v)} />
            <Field label="Description" value={item.description} onChange={v => updateArrayItem('features.items', idx, 'description', v)} multiline />
          </Card>
        ))}
      </div>
    </div>
  )
}

function ImpactEditor({ content, updateField, updateArrayItem, addArrayItem, removeArrayItem }: {
  content: any
  updateField: (path: string, value: string) => void
  updateArrayItem: (arrayPath: string, index: number, field: string, value: string) => void
  addArrayItem: (arrayPath: string, template: Record<string, string>) => void
  removeArrayItem: (arrayPath: string, index: number) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-lg mb-1">Impact Stories</h3>
        <p className="text-sm text-muted-foreground">Testimonials and success stories from the field.</p>
      </div>
      <Field label="Badge Text" value={content.impact.badge} onChange={v => updateField('impact.badge', v)} />
      <Field label="Title" value={content.impact.title} onChange={v => updateField('impact.title', v)} />
      <Field label="Description" value={content.impact.description} onChange={v => updateField('impact.description', v)} multiline />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Stories ({content.impact.stories.length})</h4>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-border bg-transparent text-xs"
            onClick={() => addArrayItem('impact.stories', { quote: 'New testimonial', author: 'Author Name', role: 'Role', impact: 'Impact metric', avatar: 'AN' })}
          >
            <Plus className="h-3.5 w-3.5" /> Add Story
          </Button>
        </div>
        {content.impact.stories.map((story: any, idx: number) => (
          <Card key={idx} className="bg-secondary/20 border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Story {idx + 1}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                onClick={() => removeArrayItem('impact.stories', idx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Field label="Quote" value={story.quote} onChange={v => updateArrayItem('impact.stories', idx, 'quote', v)} multiline />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Author" value={story.author} onChange={v => updateArrayItem('impact.stories', idx, 'author', v)} />
              <Field label="Role" value={story.role} onChange={v => updateArrayItem('impact.stories', idx, 'role', v)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Impact Metric" value={story.impact} onChange={v => updateArrayItem('impact.stories', idx, 'impact', v)} />
              <Field label="Avatar Initials" value={story.avatar} onChange={v => updateArrayItem('impact.stories', idx, 'avatar', v)} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CTAEditor({ content, updateField }: { content: any; updateField: (path: string, value: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-lg mb-1">Call to Action</h3>
        <p className="text-sm text-muted-foreground">The bottom CTA section encouraging sign-ups.</p>
      </div>
      <Field label="Title" value={content.cta.title} onChange={v => updateField('cta.title', v)} />
      <Field label="Description" value={content.cta.description} onChange={v => updateField('cta.description', v)} multiline />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Primary CTA" value={content.cta.ctaPrimary} onChange={v => updateField('cta.ctaPrimary', v)} />
        <Field label="Secondary CTA" value={content.cta.ctaSecondary} onChange={v => updateField('cta.ctaSecondary', v)} />
      </div>
    </div>
  )
}

function FooterEditor({ content, updateField }: { content: any; updateField: (path: string, value: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-lg mb-1">Footer</h3>
        <p className="text-sm text-muted-foreground">The site footer text and copyright.</p>
      </div>
      <Field label="Tagline" value={content.footer.tagline} onChange={v => updateField('footer.tagline', v)} />
      <Field label="Copyright" value={content.footer.copyright} onChange={v => updateField('footer.copyright', v)} />
    </div>
  )
}

export default function ContentEditor() {
  const {
    content, isLoading, isSaving, hasChanges,
    updateField, updateArrayItem, addArrayItem, removeArrayItem, save, revert,
  } = useAdminContent()
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const handleSave = async () => {
    try {
      await save()
      setSaveMessage('Changes saved successfully!')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err: any) {
      setSaveMessage(err.message || 'Failed to save.')
      setTimeout(() => setSaveMessage(null), 5000)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Content Editor</h1>
          <p className="text-sm text-muted-foreground">Edit all text and content on the landing page.</p>
        </div>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="flex flex-wrap w-full bg-secondary/30 border border-border h-auto p-1 gap-1">
          <TabsTrigger value="hero" className="data-[state=active]:bg-card text-xs px-3 py-2">Hero</TabsTrigger>
          <TabsTrigger value="indicators" className="data-[state=active]:bg-card text-xs px-3 py-2">Indicators</TabsTrigger>
          <TabsTrigger value="geographic" className="data-[state=active]:bg-card text-xs px-3 py-2">Geographic</TabsTrigger>
          <TabsTrigger value="features" className="data-[state=active]:bg-card text-xs px-3 py-2">Features</TabsTrigger>
          <TabsTrigger value="impact" className="data-[state=active]:bg-card text-xs px-3 py-2">Impact</TabsTrigger>
          <TabsTrigger value="cta" className="data-[state=active]:bg-card text-xs px-3 py-2">CTA</TabsTrigger>
          <TabsTrigger value="footer" className="data-[state=active]:bg-card text-xs px-3 py-2">Footer</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <Card className="bg-card border-border p-4 md:p-6">
            <TabsContent value="hero" className="mt-0">
              <HeroEditor content={content} updateField={updateField} />
            </TabsContent>
            <TabsContent value="indicators" className="mt-0">
              <IndicatorsEditor content={content} updateField={updateField} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
            </TabsContent>
            <TabsContent value="geographic" className="mt-0">
              <GeographicEditor content={content} updateField={updateField} />
            </TabsContent>
            <TabsContent value="features" className="mt-0">
              <FeaturesEditor content={content} updateField={updateField} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
            </TabsContent>
            <TabsContent value="impact" className="mt-0">
              <ImpactEditor content={content} updateField={updateField} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
            </TabsContent>
            <TabsContent value="cta" className="mt-0">
              <CTAEditor content={content} updateField={updateField} />
            </TabsContent>
            <TabsContent value="footer" className="mt-0">
              <FooterEditor content={content} updateField={updateField} />
            </TabsContent>
          </Card>
        </div>
      </Tabs>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border -mx-4 md:-mx-6 px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className={`text-sm font-medium ${saveMessage.includes('success') ? 'text-green-400' : 'text-destructive'}`}>
              {saveMessage}
            </span>
          )}
          {hasChanges && !saveMessage && (
            <span className="text-sm text-muted-foreground">Unsaved changes</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={revert}
            disabled={!hasChanges || isSaving}
            className="gap-1.5 border-border bg-transparent text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Revert
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 text-xs"
          >
            {isSaving ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</>
            ) : (
              <><Save className="h-3.5 w-3.5" /> Save Changes</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
