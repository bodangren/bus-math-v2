/**
 * FeedbackCollector Component
 *
 * DEVELOPER USAGE:
 * ================
 * Import and use this component in any React page or component:
 *
 * ```tsx
 * import FeedbackCollector from '@/components/exercises/FeedbackCollector'
 *
 * export default function MyPage() {
 *   return (
 *     <div>
 *       <FeedbackCollector
 *         projectTitle="Smart Ledger Presentation"
 *         stakeholderType="investor"
 *         unitNumber={8}
 *         onSubmit={(feedback) => console.log(feedback)}
 *       />
 *     </div>
 *   )
 * }
 * ```
 *
 * COMPONENT PROPS:
 * ================
 * - projectTitle: string (optional) - Title of the project being reviewed
 * - stakeholderType: 'investor' | 'entrepreneur' | 'accountant' | 'consultant' | 'banker' (optional) - Type of expert providing feedback
 * - unitNumber: number (optional) - Unit number for context
 * - studentName: string (optional) - Name of the student receiving feedback
 * - onSubmit: (feedback: StakeholderFeedback) => void (optional) - Callback when feedback is submitted
 * - className: string (optional) - Additional CSS classes
 *
 * STUDENT INTERACTION & LEARNING OBJECTIVES:
 * ==========================================
 *
 * OBJECTIVE: Students receive structured, professional feedback from industry experts
 * (investors, CPAs, entrepreneurs, consultants) on their business models, financial
 * projections, and presentations. This provides authentic audience engagement and
 * real-world validation of their academic work in the PBL methodology.
 *
 * HOW STUDENTS INTERACT:
 * 1. **Expert Context Setup**: Students see which type of industry professional is
 *    providing feedback (investor, CPA, entrepreneur, etc.) with specific expertise areas.
 *
 * 2. **Professional Feedback Categories**: Experts evaluate across six key business areas:
 *    - FINANCIAL ACCURACY: Excel model accuracy, formula validation, and calculation integrity
 *    - BUSINESS VIABILITY: Market opportunity, competitive analysis, and strategic positioning
 *    - PRESENTATION QUALITY: Communication effectiveness, visual design, and professional delivery
 *    - INDUSTRY KNOWLEDGE: Sector-specific insights, compliance considerations, and best practices
 *    - INNOVATION POTENTIAL: Creative solutions, differentiation, and scalability factors
 *    - IMPLEMENTATION READINESS: Practical feasibility, resource requirements, and timeline realism
 *
 * 3. **Expert Rating System**: Each category includes:
 *    - Professional-grade rating scale (Needs Work, Developing, Proficient, Advanced, Expert)
 *    - Detailed written feedback with industry-specific insights
 *    - Actionable recommendations for improvement
 *    - Specific examples from real business scenarios
 *
 * 4. **Industry-Specific Feedback**:
 *    - Investors focus on ROI, market size, and growth potential
 *    - CPAs emphasize financial accuracy, compliance, and accounting standards
 *    - Entrepreneurs share practical implementation and operational insights
 *    - Consultants provide strategic analysis and competitive positioning
 *    - Bankers evaluate creditworthiness and financial projections
 *
 * 5. **Mentorship Elements**:
 *    - Career guidance and industry pathway recommendations
 *    - Networking opportunities and professional connections
 *    - Real-world case studies and comparative examples
 *    - Follow-up questions for deeper business analysis
 *
 * 6. **Professional Development**:
 *    - Business communication standards and expectations
 *    - Industry terminology and professional language
 *    - Workplace collaboration and feedback integration skills
 *    - Continuous improvement mindset and iteration processes
 *
 * EDUCATIONAL VALUE:
 * ==================
 * - Provides authentic audience feedback from industry professionals
 * - Bridges academic learning with real-world business standards
 * - Develops professional communication and presentation skills
 * - Builds understanding of different stakeholder perspectives
 * - Reinforces business model validation and iteration processes
 * - Prepares students for workplace feedback and mentorship relationships
 * - Supports authentic assessment aligned with industry expectations
 * - Encourages entrepreneurial thinking and business innovation
 *
 * AUTHENTIC AUDIENCE CONNECTION:
 * ==============================
 * This component directly supports the course's community partnership model by:
 * - Facilitating feedback from real investors, CPAs, and entrepreneurs
 * - Creating structured interaction protocols for expert mentorship
 * - Providing professional-grade evaluation frameworks
 * - Building ongoing relationships with industry mentors
 * - Preparing students for actual investor presentations and business pitches
 * - Supporting capstone project validation with authentic audiences
 *
 * The feedback format mirrors professional business review processes used in
 * venture capital due diligence, accounting firm client reviews, and strategic
 * consulting engagements, giving students real-world experience.
 */

'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  UserCheck,
  FileText,
  MessageSquare,
  CheckCircle,
  Send,
  Calculator,
  Target,
  Briefcase,
  Building2,
  Users2,
  Lightbulb,
  Presentation,
  DollarSign,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  BookOpen
} from 'lucide-react'

// Types
type StakeholderType = 'investor' | 'entrepreneur' | 'accountant' | 'consultant' | 'banker'
type FeedbackRating = 'needs-work' | 'developing' | 'proficient' | 'advanced' | 'expert'

interface StakeholderFeedback {
  projectTitle: string
  stakeholderType: StakeholderType
  stakeholderName?: string
  stakeholderCompany?: string
  studentName?: string
  unitNumber?: number
  ratings: {
    financialAccuracy: FeedbackRating
    businessViability: FeedbackRating
    presentationQuality: FeedbackRating
    industryKnowledge: FeedbackRating
    innovationPotential: FeedbackRating
    implementationReadiness: FeedbackRating
  }
  comments: {
    financialAccuracy: string
    businessViability: string
    presentationQuality: string
    industryKnowledge: string
    innovationPotential: string
    implementationReadiness: string
  }
  overallRecommendations: string
  mentorshipOffers: string
  careerGuidance: string
  followUpInterest: boolean
  submittedAt: Date
}

interface FeedbackCategory {
  id: keyof StakeholderFeedback['ratings']
  title: string
  description: string
  icon: React.ReactNode
  color: string
  prompt: string
  placeholder: string
  stakeholderFocus: Record<StakeholderType, string>
}

interface FeedbackCollectorProps {
  projectTitle?: string
  stakeholderType?: StakeholderType
  unitNumber?: number
  studentName?: string
  onSubmit?: (feedback: StakeholderFeedback) => void
  className?: string
}

// Stakeholder types with expertise areas
const STAKEHOLDER_TYPES: Record<StakeholderType, {
  name: string;
  icon: React.ReactNode;
  description: string;
  expertise: string[];
  color: string;
}> = {
  investor: {
    name: 'Investor / VC',
    icon: <DollarSign className="w-5 h-5" />,
    description: 'Venture capital and angel investment perspective',
    expertise: ['ROI Analysis', 'Market Sizing', 'Scalability', 'Growth Potential', 'Financial Projections'],
    color: 'bg-green-50 border-green-200 text-green-800'
  },
  entrepreneur: {
    name: 'Entrepreneur',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'Startup founder and business building experience',
    expertise: ['Market Validation', 'Product Development', 'Operations', 'Team Building', 'Customer Acquisition'],
    color: 'bg-orange-50 border-orange-200 text-orange-800'
  },
  accountant: {
    name: 'CPA / Accountant',
    icon: <Calculator className="w-5 h-5" />,
    description: 'Financial accuracy and compliance expertise',
    expertise: ['Financial Statements', 'Tax Implications', 'Compliance', 'Cash Flow', 'Accounting Standards'],
    color: 'bg-blue-50 border-blue-200 text-blue-800'
  },
  consultant: {
    name: 'Business Consultant',
    icon: <Briefcase className="w-5 h-5" />,
    description: 'Strategic analysis and competitive positioning',
    expertise: ['Strategy Development', 'Market Analysis', 'Competitive Intelligence', 'Process Optimization', 'Change Management'],
    color: 'bg-purple-50 border-purple-200 text-purple-800'
  },
  banker: {
    name: 'Commercial Banker',
    icon: <Building2 className="w-5 h-5" />,
    description: 'Lending and credit assessment perspective',
    expertise: ['Credit Analysis', 'Risk Assessment', 'Financial Ratios', 'Debt Capacity', 'Banking Relationships'],
    color: 'bg-indigo-50 border-indigo-200 text-indigo-800'
  }
}

// Rating levels with professional descriptions
const RATING_LEVELS: Record<FeedbackRating, {
  name: string;
  value: number;
  description: string;
  color: string;
}> = {
  'needs-work': { name: 'Needs Work', value: 1, description: 'Requires significant development', color: 'text-red-600' },
  'developing': { name: 'Developing', value: 2, description: 'Shows promise but needs refinement', color: 'text-orange-600' },
  'proficient': { name: 'Proficient', value: 3, description: 'Meets professional standards', color: 'text-yellow-600' },
  'advanced': { name: 'Advanced', value: 4, description: 'Exceeds expectations', color: 'text-green-600' },
  'expert': { name: 'Expert Level', value: 5, description: 'Industry-leading quality', color: 'text-blue-600' }
}

// Feedback categories with stakeholder-specific focus
const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  {
    id: 'financialAccuracy',
    title: 'Financial Accuracy & Models',
    description: 'Excel calculations, formulas, and financial projections',
    icon: <Calculator className="w-5 h-5" />,
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    prompt: 'How accurate and professional are the financial models and calculations?',
    placeholder: 'Evaluate Excel formula accuracy, financial statement integrity, calculation methods, and professional presentation of numbers...',
    stakeholderFocus: {
      investor: 'Focus on ROI projections, growth assumptions, and valuation models',
      entrepreneur: 'Evaluate practical financial planning and cash flow realism',
      accountant: 'Assess compliance with accounting standards and calculation accuracy',
      consultant: 'Review financial modeling methodology and scenario planning',
      banker: 'Analyze creditworthiness indicators and debt service capacity'
    }
  },
  {
    id: 'businessViability',
    title: 'Business Viability & Strategy',
    description: 'Market opportunity, competitive analysis, and strategic positioning',
    icon: <Target className="w-5 h-5" />,
    color: 'bg-green-50 border-green-200 text-green-800',
    prompt: 'How viable is this business model in the current market?',
    placeholder: 'Assess market opportunity size, competitive advantages, target customer validation, and strategic positioning...',
    stakeholderFocus: {
      investor: 'Evaluate market size, competitive moat, and scalability potential',
      entrepreneur: 'Assess product-market fit and customer acquisition strategy',
      accountant: 'Review financial sustainability and profitability timeline',
      consultant: 'Analyze strategic positioning and competitive differentiation',
      banker: 'Evaluate market stability and revenue predictability'
    }
  },
  {
    id: 'presentationQuality',
    title: 'Presentation & Communication',
    description: 'Professional delivery, visual design, and audience engagement',
    icon: <Presentation className="w-5 h-5" />,
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    prompt: 'How effectively did they communicate their business concept?',
    placeholder: 'Comment on presentation clarity, visual design, storytelling, audience engagement, and professional delivery...',
    stakeholderFocus: {
      investor: 'Evaluate pitch effectiveness and investor appeal',
      entrepreneur: 'Assess communication skills and leadership presence',
      accountant: 'Review data presentation clarity and technical accuracy',
      consultant: 'Analyze strategic communication and stakeholder alignment',
      banker: 'Evaluate professional credibility and relationship potential'
    }
  },
  {
    id: 'industryKnowledge',
    title: 'Industry Knowledge & Insights',
    description: 'Sector expertise, market understanding, and regulatory awareness',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'bg-amber-50 border-amber-200 text-amber-800',
    prompt: 'How well do they understand their industry and market dynamics?',
    placeholder: 'Evaluate industry expertise, market trends awareness, regulatory knowledge, and sector-specific insights...',
    stakeholderFocus: {
      investor: 'Assess market timing and industry growth potential',
      entrepreneur: 'Evaluate operational understanding and customer insights',
      accountant: 'Review compliance awareness and financial reporting requirements',
      consultant: 'Analyze industry benchmarking and best practices knowledge',
      banker: 'Assess industry risk factors and cyclical considerations'
    }
  },
  {
    id: 'innovationPotential',
    title: 'Innovation & Differentiation',
    description: 'Creative solutions, unique value proposition, and competitive advantages',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-pink-50 border-pink-200 text-pink-800',
    prompt: 'How innovative and differentiated is their solution?',
    placeholder: 'Assess creative problem-solving, unique value proposition, competitive differentiation, and innovation potential...',
    stakeholderFocus: {
      investor: 'Evaluate disruption potential and intellectual property value',
      entrepreneur: 'Assess product innovation and market differentiation',
      accountant: 'Review innovative financial structures and value creation',
      consultant: 'Analyze strategic innovation and competitive advantages',
      banker: 'Evaluate innovative approaches to risk management and financing'
    }
  },
  {
    id: 'implementationReadiness',
    title: 'Implementation & Execution',
    description: 'Practical feasibility, resource planning, and execution capability',
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'bg-teal-50 border-teal-200 text-teal-800',
    prompt: 'How ready are they to execute on this business plan?',
    placeholder: 'Evaluate implementation feasibility, resource requirements, timeline realism, and execution capability...',
    stakeholderFocus: {
      investor: 'Assess team capability and execution track record',
      entrepreneur: 'Evaluate operational readiness and resource planning',
      accountant: 'Review financial controls and operational accounting needs',
      consultant: 'Analyze change management and implementation strategy',
      banker: 'Assess operational risk and implementation financing needs'
    }
  }
]

export default function FeedbackCollector({
  projectTitle = "Student Business Project",
  stakeholderType = "investor",
  unitNumber,
  studentName = "Student",
  onSubmit,
  className = ""
}: FeedbackCollectorProps) {
  const [ratings, setRatings] = useState<StakeholderFeedback['ratings']>({
    financialAccuracy: 'proficient',
    businessViability: 'proficient',
    presentationQuality: 'proficient',
    industryKnowledge: 'proficient',
    innovationPotential: 'proficient',
    implementationReadiness: 'proficient'
  })

  const [comments, setComments] = useState<StakeholderFeedback['comments']>({
    financialAccuracy: '',
    businessViability: '',
    presentationQuality: '',
    industryKnowledge: '',
    innovationPotential: '',
    implementationReadiness: ''
  })

  const [overallRecommendations, setOverallRecommendations] = useState('')
  const [mentorshipOffers, setMentorshipOffers] = useState('')
  const [careerGuidance, setCareerGuidance] = useState('')
  const [followUpInterest, setFollowUpInterest] = useState(false)
  const [stakeholderName, setStakeholderName] = useState('')
  const [stakeholderCompany, setStakeholderCompany] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleRatingChange = useCallback((category: keyof StakeholderFeedback['ratings'], rating: FeedbackRating) => {
    setRatings(prev => ({
      ...prev,
      [category]: rating
    }))
  }, [])

  const handleCommentChange = useCallback((category: keyof StakeholderFeedback['comments'], value: string) => {
    setComments(prev => ({
      ...prev,
      [category]: value
    }))
  }, [])

  const handleSubmit = useCallback(() => {
    const feedback: StakeholderFeedback = {
      projectTitle,
      stakeholderType,
      stakeholderName: stakeholderName || undefined,
      stakeholderCompany: stakeholderCompany || undefined,
      studentName,
      unitNumber,
      ratings,
      comments,
      overallRecommendations,
      mentorshipOffers,
      careerGuidance,
      followUpInterest,
      submittedAt: new Date()
    }

    if (onSubmit) {
      onSubmit(feedback)
    }

    setIsSubmitted(true)
  }, [projectTitle, stakeholderType, stakeholderName, stakeholderCompany, studentName, unitNumber, ratings, comments, overallRecommendations, mentorshipOffers, careerGuidance, followUpInterest, onSubmit])

  // Calculate completion statistics
  const completedComments = Object.values(comments).filter(comment => comment.trim().length > 0).length
  const totalCategories = FEEDBACK_CATEGORIES.length
  const isFormComplete = completedComments === totalCategories && overallRecommendations.trim().length > 0

  const averageRating = Object.values(ratings).reduce((sum, rating) => sum + RATING_LEVELS[rating].value, 0) / totalCategories

  // Rating component
  const RatingSelector = ({ rating, onRatingChange, disabled = false }: {
    rating: FeedbackRating
    onRatingChange: (rating: FeedbackRating) => void
    disabled?: boolean
  }) => (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(Object.entries(RATING_LEVELS) as [FeedbackRating, typeof RATING_LEVELS[FeedbackRating]][]).map(([key, level]) => (
          <button
            key={key}
            type="button"
            onClick={() => !disabled && onRatingChange(key)}
            disabled={disabled}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              rating === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${disabled ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
          >
            {level.name}
          </button>
        ))}
      </div>
      <p className={`text-sm ${RATING_LEVELS[rating].color}`}>
        {RATING_LEVELS[rating].description}
      </p>
    </div>
  )

  const stakeholderInfo = STAKEHOLDER_TYPES[stakeholderType]

  if (isSubmitted) {
    return (
      <div className={`max-w-4xl mx-auto p-6 ${className}`}>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-800">Expert Feedback Submitted Successfully!</h3>
            <p className="text-green-700 max-w-2xl mx-auto">
              Thank you for providing professional feedback to {studentName}. Your industry expertise and mentorship
              will help prepare them for real-world business success and career development.
            </p>
            <div className="pt-4 space-y-2">
              <p className="text-sm text-green-600">
                Average Rating: <span className="font-bold">{averageRating.toFixed(1)}/5.0</span>
              </p>
              {followUpInterest && (
                <p className="text-sm text-green-600">
                  ✓ Interested in follow-up mentorship opportunities
                </p>
              )}
            </div>
            <div className="pt-4">
              <Button
                onClick={() => {
                  setIsSubmitted(false)
                  setRatings({
                    financialAccuracy: 'proficient',
                    businessViability: 'proficient',
                    presentationQuality: 'proficient',
                    industryKnowledge: 'proficient',
                    innovationPotential: 'proficient',
                    implementationReadiness: 'proficient'
                  })
                  setComments({
                    financialAccuracy: '',
                    businessViability: '',
                    presentationQuality: '',
                    industryKnowledge: '',
                    innovationPotential: '',
                    implementationReadiness: ''
                  })
                  setOverallRecommendations('')
                  setMentorshipOffers('')
                  setCareerGuidance('')
                  setFollowUpInterest(false)
                  setStakeholderName('')
                  setStakeholderCompany('')
                }}
                variant="outline"
                className="bg-white"
              >
                Review Another Student
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <Card className={`border-2 ${stakeholderInfo.color}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl flex items-center gap-2">
                <UserCheck className="w-6 h-6" />
                Expert Stakeholder Feedback
              </CardTitle>
              <CardDescription className="text-lg">
                Professional industry feedback from {stakeholderInfo.name}
              </CardDescription>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2">
                {stakeholderInfo.icon}
                <Badge className={stakeholderInfo.color}>
                  {stakeholderInfo.name}
                </Badge>
              </div>
              {unitNumber && (
                <Badge variant="outline">
                  Unit {unitNumber}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stakeholder Expertise */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-800">Areas of Expertise</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {stakeholderInfo.expertise.map((area) => (
              <Badge key={area} variant="outline" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">{stakeholderInfo.description}</p>
        </CardContent>
      </Card>

      {/* Instructions Toggle */}
      <div className="text-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInstructions(!showInstructions)}
          className="flex items-center gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          Feedback Guidelines for {stakeholderInfo.name}
          {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Instructions Panel */}
      {showInstructions && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-xl text-indigo-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Professional Feedback Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role-Specific Focus */}
            <div>
              <h4 className="font-semibold text-indigo-800 mb-3">🎯 Your {stakeholderInfo.name} Perspective</h4>
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-indigo-700 mb-3">{stakeholderInfo.description}</p>
                <div className="space-y-2">
                  <h5 className="font-medium text-indigo-800">Key Focus Areas:</h5>
                  <ul className="text-sm text-indigo-600 space-y-1">
                    {stakeholderInfo.expertise.map((area) => (
                      <li key={area}>• {area}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Rating Guidelines */}
            <div>
              <h4 className="font-semibold text-indigo-800 mb-3">📊 Rating Scale Guide</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {Object.entries(RATING_LEVELS).map(([key, level]) => (
                  <div key={key} className="p-2 bg-white rounded border text-center">
                    <div className={`font-medium text-sm ${level.color}`}>{level.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{level.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Principles */}
            <div>
              <h4 className="font-semibold text-indigo-800 mb-3">💡 Professional Feedback Principles</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border">
                  <h5 className="font-medium text-indigo-700 mb-2">✅ Industry Standards</h5>
                  <p className="text-sm text-indigo-600">Evaluate based on real-world professional expectations and industry benchmarks.</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h5 className="font-medium text-indigo-700 mb-2">🎯 Specific & Actionable</h5>
                  <p className="text-sm text-indigo-600">Provide concrete examples and specific recommendations for improvement.</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h5 className="font-medium text-indigo-700 mb-2">🌱 Mentorship Mindset</h5>
                  <p className="text-sm text-indigo-600">Balance constructive criticism with encouragement and career guidance.</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h5 className="font-medium text-indigo-700 mb-2">🔗 Real-World Context</h5>
                  <p className="text-sm text-indigo-600">Connect feedback to actual business scenarios and market conditions.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Context */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="font-medium text-gray-800">{projectTitle}</h3>
                <p className="text-sm text-gray-600">Student: {studentName}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${isFormComplete ? 'text-green-600' : 'text-orange-600'}`}>
                  {Math.round((completedComments / totalCategories) * 100)}%
                </span>
                {isFormComplete && <CheckCircle className="w-4 h-4 text-green-600" />}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stakeholder Information */}
      <Card className="border-gray-200">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <Users2 className="w-4 h-4" />
            Your Professional Information (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stakeholder-name" className="text-sm font-medium">
                Your Name
              </Label>
              <Input
                id="stakeholder-name"
                type="text"
                value={stakeholderName}
                onChange={(e) => setStakeholderName(e.target.value)}
                placeholder="Enter your professional name..."
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stakeholder-company" className="text-sm font-medium">
                Company / Organization
              </Label>
              <Input
                id="stakeholder-company"
                type="text"
                value={stakeholderCompany}
                onChange={(e) => setStakeholderCompany(e.target.value)}
                placeholder="Enter your company or organization..."
                className="text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Categories */}
      <div className="space-y-6">
        {FEEDBACK_CATEGORIES.map((category) => (
          <Card key={category.id} className={`border-2 ${category.color}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm">
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {RATING_LEVELS[ratings[category.id]].name}
                  </Badge>
                  {comments[category.id].trim() && <CheckCircle className="w-4 h-4 text-green-600" />}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Stakeholder-Specific Focus */}
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-1 flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Your {stakeholderInfo.name} Focus:
                </h4>
                <p className="text-sm text-yellow-700">
                  {category.stakeholderFocus[stakeholderType]}
                </p>
              </div>

              {/* Rating */}
              <div>
                <Label className="text-sm font-medium mb-3 block">{category.prompt}</Label>
                <RatingSelector
                  rating={ratings[category.id]}
                  onRatingChange={(rating) => handleRatingChange(category.id, rating)}
                />
              </div>

              <Separator />

              {/* Written Feedback */}
              <div>
                <Label htmlFor={`comment-${category.id}`} className="text-sm font-medium mb-2 block">
                  Professional Feedback & Recommendations
                </Label>
                <textarea
                  id={`comment-${category.id}`}
                  value={comments[category.id]}
                  onChange={(e) => handleCommentChange(category.id, e.target.value)}
                  placeholder={category.placeholder}
                  className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {comments[category.id].length} characters
                  </span>
                  {comments[category.id].trim() && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Complete
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall Recommendations */}
      <Card className="border-2 border-slate-200 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Overall Recommendations & Strategic Insights
          </CardTitle>
          <CardDescription>
            Provide high-level strategic guidance and key recommendations for success
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={overallRecommendations}
            onChange={(e) => setOverallRecommendations(e.target.value)}
            placeholder="Share your overall assessment and strategic recommendations. What are the most important next steps? How can this student succeed in the real business world? What industry insights would be most valuable?"
            className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {overallRecommendations.length} characters
            </span>
            {overallRecommendations.trim() && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Complete
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mentorship & Career Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
              <Users2 className="w-5 h-5" />
              Mentorship Opportunities
            </CardTitle>
            <CardDescription className="text-orange-700">
              Ways you might continue supporting this student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={mentorshipOffers}
              onChange={(e) => setMentorshipOffers(e.target.value)}
              placeholder="Are you interested in providing ongoing mentorship? What specific areas could you help with? Any networking opportunities or resources you could share?"
              className="w-full min-h-[100px] p-3 border border-orange-300 rounded-md text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            />
            <div className="mt-3">
              <label className="flex items-center gap-2 text-sm text-orange-800">
                <input
                  type="checkbox"
                  checked={followUpInterest}
                  onChange={(e) => setFollowUpInterest(e.target.checked)}
                  className="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                />
                I&apos;m interested in follow-up mentorship opportunities
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
              <BookOpen className="w-5 h-5" />
              Career Guidance & Pathways
            </CardTitle>
            <CardDescription className="text-purple-700">
              Industry insights and career development advice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={careerGuidance}
              onChange={(e) => setCareerGuidance(e.target.value)}
              placeholder="What career paths would you recommend? What skills should they develop? Any industry certifications, conferences, or resources that would be valuable?"
              className="w-full min-h-[100px] p-3 border border-purple-300 rounded-md text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            />
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      {completedComments > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{completedComments}/{totalCategories}</div>
                <div className="text-sm text-blue-700">Categories Complete</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {averageRating.toFixed(1)}/5.0
                </div>
                <div className="text-sm text-blue-700">Average Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((completedComments / totalCategories) * 100)}%
                </div>
                <div className="text-sm text-blue-700">Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {followUpInterest ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-blue-700">Follow-up Interest</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="text-center space-y-4">
        {!isFormComplete && (
          <div className="flex items-center justify-center gap-2 text-orange-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Please complete all category feedback and overall recommendations</span>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!isFormComplete}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Professional Feedback
        </Button>

        {isFormComplete && (
          <p className="text-sm text-green-600 flex items-center justify-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Ready to submit! Your professional expertise will help this student grow.
          </p>
        )}
      </div>
    </div>
  )
}
