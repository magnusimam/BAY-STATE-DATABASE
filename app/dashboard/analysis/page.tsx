'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Send,
  Loader2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Brain,
  ArrowRight,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'

// Mock analysis results
const analysisResults = {
  'crisis-forecast': {
    title: 'Crisis Forecast - Next 90 Days',
    description: 'AI-powered prediction model analyzing crisis patterns',
    insights: [
      'High probability of humanitarian need increase in South Asia (78% confidence)',
      'Expected surge in displacement from conflict-affected regions',
      'Seasonal factors suggest intensification of food insecurity',
      'Regional stability improving in Central Africa (+12% confidence)',
    ],
    chart: [
      { week: 'W1', predicted: 85, actual: 82, confidence: 92 },
      { week: 'W2', predicted: 88, actual: 85, confidence: 90 },
      { week: 'W3', predicted: 92, actual: 89, confidence: 88 },
      { week: 'W4', predicted: 95, actual: 91, confidence: 85 },
      { week: 'W5', predicted: 98, actual: null, confidence: 82 },
      { week: 'W6', predicted: 101, actual: null, confidence: 79 },
    ],
  },
  'pattern-detection': {
    title: 'Hidden Pattern Detection',
    description: 'Unsupervised ML identifying emerging patterns in data',
    insights: [
      'Cluster 1: Youth unemployment correlates strongly with humanitarian need (r=0.87)',
      'Cluster 2: Climate factors appear linked to displacement patterns',
      'Cluster 3: Education access inversely correlates with program enrollment',
      'Emerging pattern: Regional economic indices predict crisis severity 6 months ahead',
    ],
    chart: [
      { factor: 'Unemployment', score: 87, weight: 34 },
      { factor: 'Climate', score: 72, weight: 28 },
      { factor: 'Education', score: 65, weight: 20 },
      { factor: 'GDP', score: 58, weight: 18 },
    ],
  },
  'anomaly-detection': {
    title: 'Anomaly Detection',
    description: 'Identifying unusual patterns and outliers in data',
    insights: [
      'Sudden 15% spike in humanitarian need detected in West Africa (Day 45)',
      'Unusual program enrollment patterns in South Asia flagged for review',
      'Data quality issue detected: Missing crisis reports in 3 regions',
      'Positive anomaly: Crisis resolution rate improved 22% in East Africa',
    ],
    chart: [
      { day: 'D1', normal: 50, anomaly: 48 },
      { day: 'D7', normal: 52, anomaly: 50 },
      { day: 'D14', normal: 48, anomaly: 55 },
      { day: 'D21', normal: 51, anomaly: 52 },
      { day: 'D28', normal: 49, anomaly: 65 },
      { day: 'D35', normal: 50, anomaly: 51 },
    ],
  },
}

type AnalysisType = keyof typeof analysisResults

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  analysis?: AnalysisType
  timestamp: Date
}

// Suggested queries
const suggestedQueries = [
  'What are the crisis forecasts for the next 90 days?',
  'Identify hidden patterns in humanitarian data',
  'Detect anomalies in recent reports',
  'Which regions show highest improvement potential?',
]

// Analysis result card
function AnalysisCard({
  analysis,
  type,
}: {
  analysis: (typeof analysisResults)[keyof typeof analysisResults]
  type: AnalysisType
}) {
  const data = analysisResults[type]
  const chartData = data.chart as any[]

  return (
    <Card className="bg-card border-border p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-lg">{data.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
          </div>
          <Badge className="bg-accent/10 text-accent border-accent/20">AI Generated</Badge>
        </div>
      </div>

      {/* Chart */}
      {type === 'crisis-forecast' && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="week" stroke="#a0a0a0" />
            <YAxis stroke="#a0a0a0" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }} />
            <Line type="monotone" dataKey="predicted" stroke="#f4b942" strokeWidth={2} name="Predicted" />
            <Line type="monotone" dataKey="actual" stroke="#00d4ff" strokeWidth={2} name="Actual" />
          </LineChart>
        </ResponsiveContainer>
      )}

      {type === 'pattern-detection' && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="factor" stroke="#a0a0a0" />
            <YAxis stroke="#a0a0a0" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }} />
            <Bar dataKey="score" fill="#f4b942" name="Correlation Score" />
          </BarChart>
        </ResponsiveContainer>
      )}

      {type === 'anomaly-detection' && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="day" stroke="#a0a0a0" />
            <YAxis stroke="#a0a0a0" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }} />
            <Line type="monotone" dataKey="normal" stroke="#627eea" strokeWidth={2} name="Normal" />
            <Line type="monotone" dataKey="anomaly" stroke="#ff4d4d" strokeWidth={2} name="Anomaly" />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Key Insights */}
      <div className="space-y-3 pt-6 border-t border-border">
        <h4 className="font-bold text-sm">Key Insights</h4>
        {data.insights.map((insight, idx) => (
          <div key={idx} className="flex gap-3">
            <Lightbulb className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{insight}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-border">
        <Button variant="outline" size="sm" className="border-border gap-2 bg-transparent">
          <Copy className="h-4 w-4" />
          Copy
        </Button>
        <Button variant="outline" size="sm" className="border-border gap-2 bg-transparent">
          <ThumbsUp className="h-4 w-4" />
          Helpful
        </Button>
        <Button variant="outline" size="sm" className="border-border gap-2 bg-transparent">
          <ThumbsDown className="h-4 w-4" />
          Not Helpful
        </Button>
      </div>
    </Card>
  )
}

export default function Analysis() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async (query?: string) => {
    const text = query || input
    if (!text.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // Simulate AI response
    setTimeout(() => {
      let analysisType: AnalysisType = 'crisis-forecast'
      let response = ''

      if (text.toLowerCase().includes('forecast')) {
        analysisType = 'crisis-forecast'
        response = 'Based on historical data and machine learning models, I\'ve generated a 90-day crisis forecast. The analysis shows increasing humanitarian need in South Asia with 78% confidence, while Central Africa shows signs of improvement.'
      } else if (text.toLowerCase().includes('pattern')) {
        analysisType = 'pattern-detection'
        response = 'I\'ve identified several key patterns in the data: Youth unemployment strongly correlates with humanitarian need (r=0.87), climate factors are linked to displacement patterns, and educational access inversely correlates with program enrollment.'
      } else if (text.toLowerCase().includes('anomal')) {
        analysisType = 'anomaly-detection'
        response = 'Anomaly detection has identified several unusual patterns: A 15% spike in West Africa, unusual enrollment patterns in South Asia, and some data quality issues that need attention. However, there\'s also a positive anomaly showing 22% improvement in East Africa.'
      } else {
        analysisType = 'crisis-forecast'
        response = 'I\'ve analyzed the data and generated insights. The crisis forecast model shows predicted trends for the coming weeks with confidence intervals. Based on current patterns, we recommend monitoring the regions flagged in the analysis.'
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        analysis: analysisType,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      {messages.length === 0 && (
        <div className="text-center space-y-4 py-12">
          <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <Brain className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-4xl font-bold">AI Analysis Engine</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Leverage machine learning to discover insights in humanitarian data. Ask questions about forecasts, patterns, and anomalies.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-6">
        {messages.map(message => (
          <div key={message.id} className="space-y-3">
            {message.type === 'user' ? (
              <div className="flex justify-end">
                <Card className="bg-accent text-accent-foreground max-w-2xl">
                  <div className="p-4">
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-75 mt-2">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground mb-4">{message.content}</p>
                    {message.analysis && <AnalysisCard analysis={analysisResults[message.analysis]} type={message.analysis} />}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center flex-shrink-0">
              <Loader2 className="h-5 w-5 text-accent animate-spin" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">AI is analyzing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Suggested queries */}
      {messages.length === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Try asking:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedQueries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(query)}
                className="p-4 rounded-lg border border-border bg-card hover:bg-secondary/50 transition text-left text-sm text-foreground"
              >
                <p className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-accent" />
                  {query}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area - sticky at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about data patterns, forecasts, anomalies..."
              disabled={loading}
              className="bg-secondary border-border focus:border-accent"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Spacing for fixed input */}
      {messages.length > 0 && <div className="h-24" />}
    </div>
  )
}
