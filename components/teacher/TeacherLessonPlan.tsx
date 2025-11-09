'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Target,
  CheckCircle,
  BookOpen,
  Clock,
  Users,
  Settings,
  Lightbulb,
  FileText,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  PenTool,
  UserCheck,
  Flag,
  Info,
  ChevronDown
} from "lucide-react"
import { type Lesson, type Phase } from '@/lib/db/schema/validators';

interface TeacherLessonPlanProps {
  lesson: Lesson;
  phases?: Phase[];
  lessonNumber: number;
  gradeLevel?: string;
  course?: string;
  onNavigate?: (direction: 'prev' | 'next') => void;
  onLessonChange?: (lessonNumber: number) => void;
  availableLessons?: Array<{ number: number; title: string }>;
}

export function TeacherLessonPlan({
  lesson,
  phases = [],
  lessonNumber,
  onNavigate,
  onLessonChange,
  availableLessons = []
}: TeacherLessonPlanProps) {
  const durationMinutes = lesson.metadata?.duration || 45;
  const learningObjectives = lesson.learningObjectives || [];

  // Default pedagogical approaches based on lesson content
  const pedagogicalApproach = [
    'Interactive instruction',
    'Guided practice',
    'Collaborative learning',
    'Formative assessment'
  ];

  const getPhaseIcon = (phaseNumber: number) => {
    switch (phaseNumber) {
      case 1: return <PlayCircle className="h-5 w-5" />
      case 2: return <BookOpen className="h-5 w-5" />
      case 3: return <Users className="h-5 w-5" />
      case 4: return <PenTool className="h-5 w-5" />
      case 5: return <UserCheck className="h-5 w-5" />
      case 6: return <Flag className="h-5 w-5" />
      default: return <Info className="h-5 w-5" />
    }
  }

  const getPhaseColor = (phaseNumber: number) => {
    switch (phaseNumber) {
      case 1: return 'border-red-200 bg-red-50 dark:bg-red-950/10'
      case 2: return 'border-blue-200 bg-blue-50 dark:bg-blue-950/10'
      case 3: return 'border-green-200 bg-green-50 dark:bg-green-950/10'
      case 4: return 'border-purple-200 bg-purple-50 dark:bg-purple-950/10'
      case 5: return 'border-amber-200 bg-amber-50 dark:bg-amber-950/10'
      case 6: return 'border-slate-200 bg-slate-50 dark:bg-slate-950/10'
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-950/10'
    }
  }

  const getPhaseTiming = (phaseNumber: number) => {
    switch (phaseNumber) {
      case 1: return '5-8 min'
      case 2: return '8-12 min'
      case 3: return '15-20 min'
      case 4: return '10-15 min'
      case 5: return '3-5 min'
      case 6: return '2-3 min'
      default: return '5-10 min'
    }
  }

  const getPhaseName = (phaseNumber: number) => {
    switch (phaseNumber) {
      case 1: return 'Hook'
      case 2: return 'Introduction'
      case 3: return 'Guided Practice'
      case 4: return 'Independent Practice'
      case 5: return 'Assessment'
      case 6: return 'Closing'
      default: return `Phase ${phaseNumber}`
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Unit {lesson.unitNumber} - Lesson {lessonNumber}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{lesson.title}</p>
          </div>

          {availableLessons.length > 0 && onLessonChange && (
            <div className="flex items-center gap-2">
              <label htmlFor="lesson-selector" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Jump to:
              </label>
              <div className="relative">
                <select
                  id="lesson-selector"
                  value={lessonNumber}
                  onChange={(e) => onLessonChange(parseInt(e.target.value))}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary min-w-[280px]"
                >
                  {availableLessons.map((lessonOption) => (
                    <option key={lessonOption.number} value={lessonOption.number}>
                      Lesson {lessonOption.number}: {lessonOption.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>{durationMinutes} minutes</span>
          </div>

          {/* Quick Previous/Next for adjacent lessons */}
          {onNavigate && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('prev')}
                className="p-2"
                title="Previous lesson"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('next')}
                className="p-2"
                title="Next lesson"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Lesson Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Learning Objectives */}
          {learningObjectives.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Learning Objectives</h3>
              <div className="bg-blue-50 dark:bg-blue-950/10 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2 font-medium">
                  Students will be able to:
                </p>
                <ul className="space-y-2">
                  {learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2 text-blue-700 dark:text-blue-300">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Key Concepts */}
          {lesson.metadata?.tags && lesson.metadata.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Key Concepts</h3>
              <div className="grid grid-cols-2 gap-2">
                {lesson.metadata.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs p-2 justify-start">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Pedagogical Approach */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Teaching Strategies</h3>
            <div className="flex flex-wrap gap-2">
              {pedagogicalApproach.map((approach, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {approach}
                </Badge>
              ))}
            </div>
          </div>

          {/* Rationale */}
          {lesson.description && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Lesson Rationale</h3>
              <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg italic">
                {lesson.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lesson Phases */}
      {phases.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Lesson Phases
          </h2>

          {phases.map((phase) => (
            <Card key={phase.id} className={`${getPhaseColor(phase.phaseNumber)} border-l-4`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPhaseIcon(phase.phaseNumber)}
                    <span>Phase {phase.phaseNumber}: {phase.title || getPhaseName(phase.phaseNumber)}</span>
                  </div>
                  <Badge variant="secondary">{phase.estimatedMinutes ? `${phase.estimatedMinutes} min` : getPhaseTiming(phase.phaseNumber)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Phase content blocks */}
                {phase.contentBlocks.map((block, blockIndex) => (
                  <div key={blockIndex} className="mb-4">
                    {block.type === 'markdown' && (
                      <p className="text-gray-700 dark:text-gray-300">
                        {block.content}
                      </p>
                    )}
                    {block.type === 'callout' && (
                      <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Settings className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            {block.variant === 'why-this-matters' ? 'Why This Matters' :
                             block.variant === 'tip' ? 'Teaching Tip' :
                             block.variant === 'warning' ? 'Important' : 'Example'}
                          </span>
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          {block.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Phase-specific guidance */}
                <div className="mt-4 space-y-3">
                  <TeacherGuidance phaseNumber={phase.phaseNumber} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Differentiation Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Differentiation Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                ELL Support
              </h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Visual aids and diagrams</li>
                <li>• Peer translation support</li>
                <li>• Simplified vocabulary sheets</li>
                <li>• Extended processing time</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Special Needs
              </h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Step-by-step checklists</li>
                <li>• Audio instructions</li>
                <li>• Reduced cognitive load</li>
                <li>• Frequent check-ins</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                Gifted Extension
              </h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Advanced problem scenarios</li>
                <li>• Leadership roles in groups</li>
                <li>• Research extensions</li>
                <li>• Peer mentoring opportunities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials and Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Required Materials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Technology</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Computer/tablet for each student</li>
                <li>• Projector/interactive whiteboard</li>
                <li>• Excel or Google Sheets access</li>
                <li>• Video playback capability</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Physical Materials</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Lesson handouts</li>
                <li>• Practice worksheets</li>
                <li>• Sticky notes for activities</li>
                <li>• Exit ticket forms</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper component for phase-specific teacher guidance
function TeacherGuidance({ phaseNumber }: { phaseNumber: number }) {
  const guidance: Record<number, { tips: string[]; timing: string; materials: string }> = {
    1: {
      tips: [
        "Ensure media is ready and tested before class",
        "Have students note key observations",
        "Use think-pair-share to discuss initial impressions"
      ],
      timing: "Keep engaging and focused, 5-8 minutes total",
      materials: "Media files, notebook/digital notes"
    },
    2: {
      tips: [
        "Connect to students' prior knowledge",
        "Use real examples from local context",
        "Preview the lesson's practical applications"
      ],
      timing: "8-10 minutes of direct instruction with interaction",
      materials: "Slides, examples, visual aids"
    },
    3: {
      tips: [
        "Circulate and listen to student discussions",
        "Encourage students to explain their reasoning",
        "Collect common misconceptions for whole-class discussion"
      ],
      timing: "15-18 minutes with structured practice",
      materials: "Practice materials, discussion prompts"
    },
    4: {
      tips: [
        "Monitor individual progress closely",
        "Provide immediate feedback",
        "Allow students to work at their own pace"
      ],
      timing: "10-12 minutes of focused individual work",
      materials: "Individual practice materials"
    },
    5: {
      tips: [
        "Use formative assessment to gauge understanding",
        "Look for misconceptions to address next lesson",
        "Keep assessment low-stakes and supportive"
      ],
      timing: "3-5 minutes for quick formative check",
      materials: "Assessment materials (digital or paper)"
    },
    6: {
      tips: [
        "Make explicit connections to lesson objectives",
        "Preview next lesson to build anticipation",
        "Thank students for engagement and participation"
      ],
      timing: "2-3 minutes of wrap-up and preview",
      materials: "Summary materials, preview slides"
    }
  };

  const phaseGuidance = guidance[phaseNumber];

  if (!phaseGuidance) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div>
          <h5 className="font-medium text-primary mb-2">Teaching Tips</h5>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            {phaseGuidance.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <Lightbulb className="h-3 w-3 mt-1 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="font-medium text-primary mb-2">Timing Guidance</h5>
          <p className="text-gray-600 dark:text-gray-400 flex items-start gap-2">
            <Clock className="h-3 w-3 mt-1 flex-shrink-0" />
            {phaseGuidance.timing}
          </p>
        </div>
        <div>
          <h5 className="font-medium text-primary mb-2">Key Materials</h5>
          <p className="text-gray-600 dark:text-gray-400 flex items-start gap-2">
            <FileText className="h-3 w-3 mt-1 flex-shrink-0" />
            {phaseGuidance.materials}
          </p>
        </div>
      </div>
    </div>
  )
}
