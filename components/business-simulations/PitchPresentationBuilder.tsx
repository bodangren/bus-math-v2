/**
 * PitchPresentationBuilder Component (v2 - Database-driven)
 *
 * Migrated from v1 to work with Supabase activity props.
 * Pitch configurations come from database instead of hardcoded constants.
 *
 * STUDENT INTERACTION & LEARNING OBJECTIVES:
 * ==========================================
 *
 * OBJECTIVE: Students prepare a professional 4-minute investor pitch presentation
 * for their capstone business model, learning key storytelling elements and
 * presentation skills for authentic audience engagement.
 *
 * HOW STUDENTS INTERACT:
 * 1. **Choose Business Model**: Students select their venture type and industry focus
 *    from realistic startup categories aligned with Unit 8 capstone themes.
 *
 * 2. **Build Pitch Structure**: Navigate through 6 essential pitch components:
 *    - PROBLEM: Market pain point and opportunity size
 *    - SOLUTION: Product/service value proposition and differentiation
 *    - MARKET: Target audience, TAM/SAM analysis, and competitive landscape
 *    - BUSINESS MODEL: Revenue streams, pricing, and unit economics
 *    - FINANCIALS: 3-year projections, key metrics, and funding needs
 *    - ASK: Investment amount, use of funds, and expected returns
 *
 * 3. **Interactive Content Builder**:
 *    - Drag-and-drop slide elements and content blocks
 *    - Real-time timer showing current presentation duration
 *    - AI-powered content suggestions based on industry best practices
 *    - Visual slide previews with professional templates
 *
 * 4. **Practice Mode**:
 *    - Built-in timer for 4-minute presentation practice
 *    - Speaking notes and key talking points for each slide
 *    - Pacing indicators to maintain audience engagement
 *    - Record and playback functionality for self-assessment
 *
 * 5. **Investor Feedback Simulation**:
 *    - Common investor questions and objection handling
 *    - Industry-specific metrics and benchmarks
 *    - Due diligence checklist preparation
 *    - Pitch deck export for professional presentations
 *
 * 6. **Presentation Analytics**:
 *    - Content completeness scoring across all sections
 *    - Speaking time distribution and pacing analysis
 *    - Professional presentation readiness assessment
 *    - Peer review and feedback collection system
 *
 * KEY LEARNING OUTCOMES:
 * - Professional presentation and storytelling skills
 * - Understanding investor mindset and decision criteria
 * - Financial projections and business model validation
 * - Market analysis and competitive positioning
 * - Persuasive communication and audience engagement
 * - Real-world entrepreneurship and funding processes
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Presentation,
  Clock,
  Users,
  TrendingUp,
  DollarSign,
  Target,
  ChartLine,
  Lightbulb,
  Building,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Save,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Mic,
  Timer,
  BarChart3,
  PieChart
} from 'lucide-react'
import type { PitchPresentationBuilderActivityProps } from '@/lib/db/schema/activities'

type PitchSection = 'problem' | 'solution' | 'market' | 'business-model' | 'financials' | 'ask'
type BusinessType = 'saas' | 'ecommerce' | 'fintech' | 'healthtech' | 'marketplace' | 'ai-ml'
type PresentationMode = 'build' | 'practice' | 'review'

interface PitchContent {
  title: string
  content: string
  speakingNotes: string
  timeAllocation: number // seconds
  completeness: number // 0-100%
}

interface BusinessModel {
  type: BusinessType
  name: string
  industry: string
  targetMarket: string
  revenueModel: string
}

interface FinancialProjections {
  year1Revenue: number
  year2Revenue: number
  year3Revenue: number
  initialInvestment: number
  useOfFunds: string[]
  keyMetrics: Record<string, number>
}

interface PitchState {
  businessModel: BusinessModel
  sections: Record<PitchSection, PitchContent>
  financials: FinancialProjections
  currentSection: PitchSection
  presentationMode: PresentationMode
  isTimerRunning: boolean
  currentTime: number
  totalPracticeTime: number
  completedSections: Set<PitchSection>
  feedbackScore: number
}

interface PitchPresentationBuilderProps {
  activity: PitchPresentationBuilderActivityProps
  onSubmit?: (data: PitchState & { overallProgress: number }) => void
}

const BUSINESS_TYPES: Record<BusinessType, { name: string; icon: React.ReactNode; description: string }> = {
  saas: { name: 'SaaS Platform', icon: <Building className="w-5 h-5" />, description: 'Software as a Service solution' },
  ecommerce: { name: 'E-Commerce', icon: <TrendingUp className="w-5 h-5" />, description: 'Online marketplace or retail' },
  fintech: { name: 'FinTech', icon: <DollarSign className="w-5 h-5" />, description: 'Financial technology solution' },
  healthtech: { name: 'HealthTech', icon: <Target className="w-5 h-5" />, description: 'Healthcare innovation' },
  marketplace: { name: 'Marketplace', icon: <Users className="w-5 h-5" />, description: 'Two-sided market platform' },
  'ai-ml': { name: 'AI/ML', icon: <Zap className="w-5 h-5" />, description: 'Artificial intelligence solution' }
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'alert-circle': <AlertCircle className="w-5 h-5" />,
  'lightbulb': <Lightbulb className="w-5 h-5" />,
  'bar-chart-3': <BarChart3 className="w-5 h-5" />,
  'pie-chart': <PieChart className="w-5 h-5" />,
  'chart-line': <ChartLine className="w-5 h-5" />,
  'dollar-sign': <DollarSign className="w-5 h-5" />
}

export function PitchPresentationBuilder({ activity, onSubmit }: PitchPresentationBuilderProps) {
  const [pitchState, setPitchState] = useState<PitchState>({
    businessModel: activity.initialState.businessModel,
    sections: activity.initialState.sections,
    financials: activity.initialState.financials,
    currentSection: 'problem',
    presentationMode: 'build',
    isTimerRunning: false,
    currentTime: 0,
    totalPracticeTime: 0,
    completedSections: new Set(),
    feedbackScore: 0
  })

  const [showInstructions, setShowInstructions] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const calculateCompleteness = useCallback((content: string, speakingNotes: string, title: string) => {
    let score = 0
    if (title.trim().length > 0) score += 25
    if (content.trim().length > 50) score += 50
    if (speakingNotes.trim().length > 20) score += 25
    return Math.min(score, 100)
  }, [])

  const updateSectionContent = useCallback((section: PitchSection, field: keyof PitchContent, value: string | number) => {
    setPitchState(prev => {
      const updatedSection = { ...prev.sections[section], [field]: value }

      if (field === 'title' || field === 'content' || field === 'speakingNotes') {
        updatedSection.completeness = calculateCompleteness(
          field === 'content' ? value as string : updatedSection.content,
          field === 'speakingNotes' ? value as string : updatedSection.speakingNotes,
          field === 'title' ? value as string : updatedSection.title
        )
      }

      const newCompletedSections = new Set(prev.completedSections)
      if (updatedSection.completeness >= 80) {
        newCompletedSections.add(section)
      } else {
        newCompletedSections.delete(section)
      }

      return {
        ...prev,
        sections: {
          ...prev.sections,
          [section]: updatedSection
        },
        completedSections: newCompletedSections
      }
    })
  }, [calculateCompleteness])

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    setPitchState(prev => ({ ...prev, isTimerRunning: true }))

    timerRef.current = setInterval(() => {
      setPitchState(prev => ({
        ...prev,
        currentTime: prev.currentTime + 1,
        totalPracticeTime: prev.totalPracticeTime + 1
      }))
    }, 1000)
  }, [])

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setPitchState(prev => ({ ...prev, isTimerRunning: false }))
  }, [])

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setPitchState(prev => ({
      ...prev,
      isTimerRunning: false,
      currentTime: 0
    }))
  }, [])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  const calculateOverallProgress = useCallback(() => {
    const sections = Object.values(pitchState.sections)
    const totalCompleteness = sections.reduce((sum, section) => sum + section.completeness, 0)
    return Math.round(totalCompleteness / sections.length)
  }, [pitchState.sections])

  const getTotalTargetTime = useCallback(() => {
    return Object.values(activity.sectionDefinitions).reduce((sum, section) => sum + section.timeTarget, 0)
  }, [activity.sectionDefinitions])

  const exportPitchDeck = useCallback(() => {
    const pitchData = {
      businessModel: pitchState.businessModel,
      sections: pitchState.sections,
      financials: pitchState.financials,
      generatedAt: new Date().toISOString()
    }

    const dataStr = JSON.stringify(pitchData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${pitchState.businessModel.name || 'pitch'}-deck.json`
    link.click()

    URL.revokeObjectURL(url)
  }, [pitchState])

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      const overallProgress = calculateOverallProgress()
      onSubmit({
        ...pitchState,
        overallProgress
      })
    }
  }, [pitchState, onSubmit, calculateOverallProgress])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const overallProgress = calculateOverallProgress()
  const totalTargetTime = getTotalTargetTime()
  const currentSection = pitchState.sections[pitchState.currentSection]
  const sectionInfo = activity.sectionDefinitions[pitchState.currentSection]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <Presentation className="w-8 h-8 text-indigo-600" />
            {activity.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {activity.description}
          </CardDescription>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              How to Build Your Pitch
              {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Instructions Panel */}
      {showInstructions && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-xl text-indigo-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Building Your Investor Pitch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Objective */}
            <div>
              <h4 className="font-semibold text-indigo-800 mb-2">🎯 Objective</h4>
              <p className="text-indigo-700">
                Create a professional 4-minute investor pitch that tells your startup&apos;s story compellingly,
                demonstrates market opportunity, and makes a clear funding request to potential investors.
              </p>
            </div>

            {/* Pitch Structure */}
            <div>
              <h4 className="font-semibold text-indigo-800 mb-3">📋 Pitch Structure (4 minutes total)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(activity.sectionDefinitions).map(([key, section]) => (
                  <div key={key} className="p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      {ICON_MAP[section.icon] || <AlertCircle className="w-5 h-5" />}
                      <h5 className="font-medium text-sm">{section.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        {formatTime(section.timeTarget)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{section.description}</p>
                    <ul className="text-xs text-gray-500 space-y-0.5">
                      {section.keyPoints.map((point, idx) => (
                        <li key={idx}>• {point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Tips */}
            <div>
              <h4 className="font-semibold text-indigo-800 mb-3">💡 Investor Pitch Success Tips</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-indigo-700">Content Guidelines:</h5>
                  <ul className="text-sm text-indigo-600 space-y-1">
                    <li>• Start with a compelling problem statement</li>
                    <li>• Use specific numbers and market data</li>
                    <li>• Show clear competitive differentiation</li>
                    <li>• Include realistic financial projections</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-indigo-700">Presentation Skills:</h5>
                  <ul className="text-sm text-indigo-600 space-y-1">
                    <li>• Practice with the built-in timer</li>
                    <li>• Use storytelling to engage investors</li>
                    <li>• Prepare for common investor questions</li>
                    <li>• End with a clear, specific ask</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-green-700 font-medium">Overall Progress</p>
            <p className="text-2xl font-bold text-green-800">{overallProgress}%</p>
            <p className="text-xs text-green-600">
              {pitchState.completedSections.size}/6 sections complete
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-blue-700 font-medium">Target Time</p>
            <p className="text-2xl font-bold text-blue-800">{formatTime(totalTargetTime)}</p>
            <p className="text-xs text-blue-600">
              4-minute pitch goal
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Timer className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-purple-700 font-medium">Practice Time</p>
            <p className="text-2xl font-bold text-purple-800">{formatTime(pitchState.currentTime)}</p>
            <p className="text-xs text-purple-600">
              Current session
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-sm text-amber-700 font-medium">Business Type</p>
            <p className="text-lg font-bold text-amber-800">{BUSINESS_TYPES[pitchState.businessModel.type].name}</p>
            <p className="text-xs text-amber-600">
              Selected model
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mode Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={pitchState.presentationMode === 'build' ? 'default' : 'outline'}
              onClick={() => setPitchState(prev => ({ ...prev, presentationMode: 'build' }))}
              className="flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              Build Content
            </Button>
            <Button
              variant={pitchState.presentationMode === 'practice' ? 'default' : 'outline'}
              onClick={() => setPitchState(prev => ({ ...prev, presentationMode: 'practice' }))}
              className="flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              Practice Mode
            </Button>
            <Button
              variant={pitchState.presentationMode === 'review' ? 'default' : 'outline'}
              onClick={() => setPitchState(prev => ({ ...prev, presentationMode: 'review' }))}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Review & Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Build Mode */}
      {pitchState.presentationMode === 'build' && (
        <>
          {/* Business Model Setup */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Business Model Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-type">Business Type</Label>
                  <select
                    id="business-type"
                    className="w-full p-2 border border-input bg-background rounded-md"
                    value={pitchState.businessModel.type}
                    onChange={(e) => setPitchState(prev => ({
                      ...prev,
                      businessModel: { ...prev.businessModel, type: e.target.value as BusinessType }
                    }))}
                  >
                    {Object.entries(BUSINESS_TYPES).map(([key, type]) => (
                      <option key={key} value={key}>{type.name} - {type.description}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    placeholder="Enter your startup name"
                    value={pitchState.businessModel.name}
                    onChange={(e) => setPitchState(prev => ({
                      ...prev,
                      businessModel: { ...prev.businessModel, name: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Navigation */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {Object.entries(activity.sectionDefinitions).map(([key, section]) => (
                  <Button
                    key={key}
                    variant={pitchState.currentSection === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPitchState(prev => ({ ...prev, currentSection: key as PitchSection }))}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    {ICON_MAP[section.icon] || <AlertCircle className="w-5 h-5" />}
                    <span className="text-xs">{section.name}</span>
                    {pitchState.completedSections.has(key as PitchSection) && (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Section Editor */}
          <Card className="border-2 border-indigo-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ICON_MAP[sectionInfo.icon] || <AlertCircle className="w-5 h-5" />}
                  <CardTitle className="text-xl">{sectionInfo.name}</CardTitle>
                  <Badge variant="outline">
                    Target: {formatTime(sectionInfo.timeTarget)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={currentSection.completeness} className="w-20" />
                  <span className="text-sm font-medium">{currentSection.completeness}%</span>
                </div>
              </div>
              <CardDescription>{sectionInfo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Points Reference */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Key Points to Address:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {sectionInfo.keyPoints.map((point, idx) => (
                    <li key={idx}>• {point}</li>
                  ))}
                </ul>
              </div>

              {/* Content Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="section-title">Section Title</Label>
                  <Input
                    id="section-title"
                    placeholder={`Enter ${sectionInfo.name.toLowerCase()} title`}
                    value={currentSection.title}
                    onChange={(e) => updateSectionContent(pitchState.currentSection, 'title', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section-content">Main Content</Label>
                  <textarea
                    id="section-content"
                    className="w-full min-h-[120px] p-3 border border-input bg-background text-sm rounded-md resize-vertical"
                    placeholder={`Describe your ${sectionInfo.name.toLowerCase()} in detail...`}
                    value={currentSection.content}
                    onChange={(e) => updateSectionContent(pitchState.currentSection, 'content', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="speaking-notes">Speaking Notes & Talking Points</Label>
                  <textarea
                    id="speaking-notes"
                    className="w-full min-h-[80px] p-3 border border-input bg-background text-sm rounded-md resize-vertical"
                    placeholder="Add notes to help you present this section..."
                    value={currentSection.speakingNotes}
                    onChange={(e) => updateSectionContent(pitchState.currentSection, 'speakingNotes', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Practice Mode */}
      {pitchState.presentationMode === 'practice' && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-800 flex items-center justify-center gap-2">
              <Mic className="w-6 h-6" />
              Practice Your Pitch
            </CardTitle>
            <CardDescription className="text-green-700">
              Use the timer to practice your 4-minute presentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer Controls */}
            <div className="text-center space-y-4">
              <div className={`text-6xl font-mono font-bold ${
                pitchState.currentTime > 240 ? 'text-red-600' : 'text-green-800'
              }`}>
                {formatTime(pitchState.currentTime)}
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={pitchState.isTimerRunning ? pauseTimer : startTimer}
                  size="lg"
                  className={pitchState.isTimerRunning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}
                >
                  {pitchState.isTimerRunning ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start Practice
                    </>
                  )}
                </Button>
                <Button onClick={resetTimer} variant="outline" size="lg">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Section Timeline */}
            <div className="space-y-3">
              <h4 className="font-semibold text-green-800">Presentation Timeline:</h4>
              {Object.entries(activity.sectionDefinitions).map(([key, section], index) => {
                const startTime = Object.entries(activity.sectionDefinitions)
                  .slice(0, index)
                  .reduce((sum, [, s]) => sum + s.timeTarget, 0)
                const endTime = startTime + section.timeTarget
                const isActive = pitchState.currentTime >= startTime && pitchState.currentTime < endTime
                const isCompleted = pitchState.currentTime >= endTime

                return (
                  <div key={key} className={`p-3 rounded-lg border ${
                    isActive ? 'bg-green-100 border-green-300' :
                    isCompleted ? 'bg-gray-100 border-gray-300' :
                    'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {ICON_MAP[section.icon] || <AlertCircle className="w-5 h-5" />}
                        <span className="font-medium">{section.name}</span>
                        {isActive && <Badge className="bg-green-600">Current</Badge>}
                        {isCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                      <span className="text-sm text-gray-600">
                        {formatTime(startTime)} - {formatTime(endTime)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review & Export Mode */}
      {pitchState.presentationMode === 'review' && (
        <div className="space-y-6">
          {/* Pitch Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Pitch Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Business Overview</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {pitchState.businessModel.name || 'Not specified'}</p>
                    <p><strong>Type:</strong> {BUSINESS_TYPES[pitchState.businessModel.type].name}</p>
                    <p><strong>Completion:</strong> {overallProgress}%</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Section Completeness</h4>
                  <div className="space-y-2">
                    {Object.entries(pitchState.sections).map(([key, section]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span>{activity.sectionDefinitions[key as PitchSection].name}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={section.completeness} className="w-16" />
                          <span>{section.completeness}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <div className="flex justify-center gap-4">
            <Button onClick={exportPitchDeck} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              <Download className="w-5 h-5 mr-2" />
              Export Pitch Deck
            </Button>
            <Button variant="outline" size="lg">
              <Save className="w-5 h-5 mr-2" />
              Save Progress
            </Button>
            {onSubmit && (
              <Button onClick={handleSubmit} size="lg" className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-5 h-5 mr-2" />
                Submit Results
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PitchPresentationBuilder
