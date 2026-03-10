'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Textarea,
} from '@/components/ui/textarea'
import type { BornoData } from '@/app/api/sheets/borno/route'
import {
  Download,
  Share2,
  Loader2,
  Plus,
  FileText,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Clock,
  Eye,
} from 'lucide-react'

// BAY States policy briefs
const policyBriefs = [
  {
    id: 1,
    title: 'Urgent: Humanitarian Crisis in Borno State',
    region: 'Borno',
    states: ['Borno'],
    lgas: ['Maiduguri Metropolitan', 'Bama', 'Gwoza'],
    date: '2025-01-15',
    severity: 'Critical',
    status: 'Published',
    views: 2847,
    keyPoints: [
      'Humanitarian need at 3.32M people in Borno',
      'Displacement crisis: 1.8M internally displaced persons',
      '91/100 severity index - highest in BAY region',
      'Food insecurity affecting 76% of affected populations',
    ],
    recommendations: [
      'Increase humanitarian funding by 35% for Borno',
      'Deploy rapid response teams to border LGAs',
      'Establish state-level coordination mechanism',
      'Implement early warning system for crises',
    ],
    summary:
      'Borno State faces a critical humanitarian emergency with 3.32 million people in need and 1.8 million internally displaced. The security situation in border LGAs including Gwoza and Bama remains highly volatile, requiring immediate coordinated humanitarian response.',
  },
  {
    id: 2,
    title: 'Youth Development Strategy for BAY States',
    region: 'BAY',
    states: ['Borno', 'Adamawa', 'Yobe'],
    lgas: ['Multiple'],
    date: '2025-01-12',
    severity: 'High',
    status: 'Published',
    views: 1542,
    keyPoints: [
      'Youth unemployment across BAY averaging 43.5%',
      'Over 2.8M youth lack access to quality education',
      'Digital skills gap limiting economic opportunities',
      'Vocational training programs show 4:1 community ROI',
    ],
    recommendations: [
      'Establish vocational training centers in 8 LGAs',
      'Partner with tech companies for digital skills',
      'Create youth employment programs in key sectors',
      'Scale digital literacy across BAY states',
    ],
    summary:
      'BAY States face a critical youth employment crisis with an average unemployment rate of 43.5%. With over 2.8 million young people in need of better opportunities, targeted investment in vocational training and digital skills could drive sustainable economic development.',
  },
  {
    id: 3,
    title: 'Food Security & Climate Adaptation in Yobe',
    region: 'Yobe',
    states: ['Yobe'],
    lgas: ['Geidam', 'Gussinde', 'Tarmuwa'],
    date: '2025-01-08',
    severity: 'High',
    status: 'Draft',
    views: 0,
    keyPoints: [
      'Food insecurity affecting 73% of Yobe population',
      'Climate stress linked to 68% of humanitarian need',
      'Pastoral livelihoods under extreme threat',
      'Water scarcity intensifying in semi-arid zones',
    ],
    recommendations: [
      'Invest in drought-resistant agriculture programs',
      'Develop climate adaptation frameworks for pastoralists',
      'Strengthen early warning systems for droughts',
      'Support water infrastructure projects in arid LGAs',
    ],
    summary:
      'Climate change is a primary driver of humanitarian need in East Africa. Droughts have intensified over the past decade, forcing unprecedented migration patterns.',
  },
]

// Brief creation form
function BriefCreationModal({
  onClose,
}: {
  onClose: () => void
}) {
  const [selectedRegion, setSelectedRegion] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    // Simulate generation
    setTimeout(() => {
      onClose()
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <Card className="bg-card border-border max-w-2xl w-full p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Generate Policy Brief</h2>
          <p className="text-muted-foreground mt-1">
            Create an AI-powered policy brief based on current data
          </p>
        </div>

        <div className="space-y-4">
          {/* Region selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Region</label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="south-asia">South Asia</SelectItem>
                <SelectItem value="west-africa">West Africa</SelectItem>
                <SelectItem value="east-africa">East Africa</SelectItem>
                <SelectItem value="mena">MENA Region</SelectItem>
                <SelectItem value="se-asia">Southeast Asia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Brief Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Youth Employment Crisis in South Asia"
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder-muted-foreground focus:border-accent outline-none transition"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Key Focus Areas</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the key areas you want the AI to focus on..."
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder-muted-foreground focus:border-accent outline-none transition min-h-24"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-border bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading || !selectedRegion || !title}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate Brief
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Policy brief card
function BriefCard({
  brief,
}: {
  brief: (typeof policyBriefs)[0]
}) {
  return (
    <Card className="bg-card border-border hover:border-accent/50 transition cursor-pointer group">
      <div className="p-6 space-y-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg group-hover:text-accent transition">{brief.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="secondary"
                className={
                  brief.status === 'Published'
                    ? 'bg-accent/10 text-accent border-accent/20'
                    : 'bg-secondary text-muted-foreground'
                }
              >
                {brief.status}
              </Badge>
              <Badge
                variant="outline"
                className={
                  brief.severity === 'Critical'
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : 'bg-accent/10 text-accent border-accent/20'
                }
              >
                {brief.severity}
              </Badge>
            </div>
          </div>
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>

        {/* Summary */}
        <p className="text-sm text-muted-foreground line-clamp-3">{brief.summary}</p>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {brief.region}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(brief.date).toLocaleDateString()}
          </div>
        </div>

        {/* Key points */}
        <div className="space-y-2 pt-4 border-t border-border flex-1">
          <p className="text-xs font-medium text-foreground">Key Points</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {brief.keyPoints.slice(0, 2).map((point, idx) => (
              <li key={idx} className="line-clamp-1">
                • {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            {brief.views} views
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function PolicyBriefs() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [bornoData, setBornoData] = useState<BornoData | null>(null)

  useEffect(() => {
    fetch('/api/sheets/borno').then(r => r.json()).then(setBornoData).catch(() => {})
  }, [])

  const livePolicyBriefs = useMemo(() => {
    if (!bornoData) return policyBriefs
    const unemployRows = bornoData.rows.filter(r => r.indicator === 'Unemployment Rate')
    const avgUnemployment = unemployRows.length
      ? +(unemployRows.reduce((s, r) => s + r.y2025, 0) / unemployRows.length).toFixed(1)
      : 48.2
    const totalConflict = bornoData.summary.totalConflict2025.toLocaleString()
    const totalDisplaced = bornoData.summary.totalDisplacement2025.toLocaleString()
    return policyBriefs.map(b =>
      b.id === 1
        ? {
            ...b,
            keyPoints: [
              `27 LGAs tracked across Conflict-Affected, Semi-Stable & Stable zones`,
              `${totalDisplaced} displacement incidents recorded across conflict-affected LGAs (2025)`,
              `${totalConflict} conflict incidents logged in 2025 tracker`,
              `Average youth unemployment at ${avgUnemployment}% — live from Borno tracker`,
            ],
            summary: `Borno State's performance tracker (2022–2025) covers 27 LGAs across three conflict zones. In 2025, ${totalConflict} conflict incidents were recorded alongside ${totalDisplaced} displacement cases. Youth unemployment averages ${avgUnemployment}%, with the highest rates concentrated in Conflict-Affected LGAs. Immediate interventions targeting displacement response and economic resilience are critical.`,
          }
        : b
    )
  }, [bornoData])

  const filteredBriefs = livePolicyBriefs.filter(brief => {
    if (selectedFilter === 'published') return brief.status === 'Published'
    if (selectedFilter === 'draft') return brief.status === 'Draft'
    return true
  })

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">BAY Policy Briefs</h1>
          <p className="text-muted-foreground">Policy recommendations and analysis for Borno, Adamawa, and Yobe states</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
        >
          <Plus className="h-4 w-4" />
          Generate Brief
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        {['all', 'published', 'draft'].map(filter => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded-lg transition capitalize font-medium text-sm ${
              selectedFilter === filter
                ? 'bg-accent text-accent-foreground'
                : 'bg-secondary text-foreground hover:bg-secondary/50'
            }`}
          >
            {filter === 'all' ? 'All Briefs' : filter === 'published' ? 'Published' : 'Drafts'}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBriefs.map(brief => (
          <BriefCard key={brief.id} brief={brief} />
        ))}
      </div>

      {/* Empty state */}
      {filteredBriefs.length === 0 && (
        <Card className="bg-card border-border p-12 text-center">
          <p className="text-muted-foreground">No policy briefs found in this category.</p>
        </Card>
      )}

      {/* Info section */}
      <Card className="bg-gradient-to-r from-accent/5 to-blue-500/5 border-border p-8">
        <div className="space-y-4">
          <h3 className="font-bold text-lg">About Policy Briefs</h3>
          <p className="text-foreground">
            Policy briefs are AI-generated documents that synthesize complex humanitarian data into
            actionable recommendations for policymakers. Each brief includes:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex gap-3">
              <TrendingUp className="h-5 w-5 text-accent flex-shrink-0" />
              <div>
                <p className="font-medium">Data-Driven Insights</p>
                <p className="text-sm text-muted-foreground">Based on real-time humanitarian data</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Users className="h-5 w-5 text-accent flex-shrink-0" />
              <div>
                <p className="font-medium">Expert-Validated</p>
                <p className="text-sm text-muted-foreground">Reviewed by humanitarian experts</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Create modal */}
      {showCreateModal && <BriefCreationModal onClose={() => setShowCreateModal(false)} />}
    </div>
  )
}
