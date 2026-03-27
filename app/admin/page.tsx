'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { FileText, Layers, Palette, ExternalLink } from 'lucide-react'

const cards = [
  {
    title: 'Content',
    description: 'Edit hero text, features, impact stories, CTAs, and all site copy.',
    icon: FileText,
    href: '/admin/content',
    color: '#f4b942',
  },
  {
    title: 'Sections',
    description: 'Reorder landing page sections with drag-and-drop or arrow controls.',
    icon: Layers,
    href: '/admin/sections',
    color: '#6ec6e8',
  },
  {
    title: 'Theme',
    description: 'Change accent colors and per-element style overrides.',
    icon: Palette,
    href: '/admin/theme',
    color: '#8b5cf6',
  },
]

export default function AdminOverview() {
  return (
    <div className="p-4 md:p-6 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your site content, layout, and theme from here.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.href} href={card.href}>
              <Card className="bg-card border-border hover:border-accent/50 transition cursor-pointer group h-full">
                <div className="p-6 space-y-4">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${card.color}1a` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: card.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-accent transition">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card className="bg-card border-border p-6">
        <div className="flex items-center gap-3">
          <ExternalLink className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Changes are saved to <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">lib/site-content.json</code> and take effect immediately on the live site.</p>
            <p className="text-xs text-muted-foreground mt-1">Only admin users (configured via NEXT_PUBLIC_ADMIN_EMAILS) can access this panel.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
