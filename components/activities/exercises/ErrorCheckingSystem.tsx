'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertTriangle, Search, XCircle, CheckCircle } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

interface DataRow {
  id: string
  data: Record<string, string | number | null | undefined>
  issues: { type: 'missing' | 'inconsistent' | 'duplicate' | 'format'; description: string; severity: 'low' | 'medium' | 'high' }[]
}

const sampleData: DataRow[] = [
  {
    id: 'row-1',
    data: { name: 'Alice', email: 'alice@example.com', sales: 1500 },
    issues: [],
  },
  {
    id: 'row-2',
    data: { name: 'Bob', email: null, sales: 2000 },
    issues: [{ type: 'missing', description: 'Email address is missing', severity: 'medium' }],
  },
  {
    id: 'row-3',
    data: { name: 'charlie', email: 'charlie@example.com', sales: '1800' },
    issues: [
      { type: 'inconsistent', description: 'Name is not capitalized', severity: 'low' },
      { type: 'format', description: 'Sales should be a number, not a string', severity: 'medium' },
    ],
  },
  {
    id: 'row-4',
    data: { name: 'Alice', email: 'alice@example.com', sales: 1500 },
    issues: [{ type: 'duplicate', description: 'Duplicate of row 1', severity: 'high' }],
  },
]

export interface ErrorCheckingSystemProps {
  activity: {
    id?: string
    props?: {
      validationCategories?: string[]
    }
  }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function ErrorCheckingSystem({ activity, onSubmit, onComplete }: ErrorCheckingSystemProps) {
  const [checkedRows, setCheckedRows] = useState<Set<string>>(new Set())
  const [markedIssues, setMarkedIssues] = useState<Set<string>>(new Set())
  const [completed, setCompleted] = useState(false)
  const submittedRef = useRef(false)

  const handleRowCheck = useCallback((rowId: string) => {
    setCheckedRows(prev => {
      const next = new Set(prev)
      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
      return next
    })
  }, [])

  const handleIssueMark = useCallback((rowId: string, issueIndex: number) => {
    const key = `${rowId}-${issueIndex}`
    setMarkedIssues(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const handleComplete = useCallback(() => {
    if (submittedRef.current) return
    submittedRef.current = true
    setCompleted(true)

    const allIssuesFound = sampleData.every(row =>
      row.issues.length === 0 || row.issues.every((_, i) => markedIssues.has(`${row.id}-${i}`))
    )
    const allRowsChecked = sampleData.every(row => checkedRows.has(row.id))

    try {
      onSubmit?.(
        buildSimulationSubmissionEnvelope({
          activityId: activity.id ?? 'error-checking-system',
          mode: 'independent_practice',
          answers: {
            checkedRows: Array.from(checkedRows),
            markedIssues: Array.from(markedIssues),
            allIssuesFound,
            allRowsChecked,
          },
          parts: [
            createSimulationPart('checked-rows', checkedRows.size),
            createSimulationPart('marked-issues', markedIssues.size),
            createSimulationPart('total-issues', sampleData.reduce((sum, row) => sum + row.issues.length, 0)),
          ],
          artifact: {
            sampleData,
          },
        }),
      )
      onComplete?.()
    } catch (err) {
      console.error('ErrorCheckingSystem submission failed:', err)
      submittedRef.current = false
      setCompleted(false)
    }
  }, [checkedRows, markedIssues, onSubmit, onComplete, activity.id])

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-xl text-amber-800 flex items-center gap-2">
            <Search className="h-5 w-5" />
            Error Checking System
          </CardTitle>
          <CardDescription className="text-amber-600">
            Identify and mark data errors in the sample dataset.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 border-b border-amber-200">
                <tr>
                  <th className="text-left p-3 w-12">Check</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-right p-3">Sales</th>
                  <th className="text-left p-3">Issues</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100">
                    <td className="p-3">
                      <button
                        onClick={() => handleRowCheck(row.id)}
                        disabled={completed}
                        className={`p-1 rounded border-2 ${
                          checkedRows.has(row.id)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {checkedRows.has(row.id) ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="p-3">{row.data.name}</td>
                    <td className="p-3">{row.data.email ?? <span className="text-red-500">Missing</span>}</td>
                    <td className="p-3 text-right">{row.data.sales}</td>
                    <td className="p-3">
                      {row.issues.length === 0 ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Clean
                        </span>
                      ) : (
                        <div className="space-y-1">
                          {row.issues.map((issue, i) => (
                            <button
                              key={i}
                              onClick={() => handleIssueMark(row.id, i)}
                              disabled={completed}
                              className={`flex items-center gap-1 text-left p-1 rounded ${
                                markedIssues.has(`${row.id}-${i}`)
                                  ? 'bg-green-50 text-green-800'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              {markedIssues.has(`${row.id}-${i}`) ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className={`h-4 w-4 ${
                                  issue.severity === 'high' ? 'text-red-600' :
                                  issue.severity === 'medium' ? 'text-amber-600' : 'text-gray-600'
                                }`} />
                              )}
                              <span className="text-xs">{issue.description}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-center">
            <Button onClick={handleComplete} disabled={completed} className="bg-amber-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Audit
            </Button>
          </div>

          {completed && (
            <div className="mt-4 bg-green-50 p-3 rounded border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800 font-medium">
                Audit complete!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-amber-50 p-4 rounded border border-amber-200">
          <h4 className="font-semibold text-amber-800 mb-2">Error Types</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span><strong>Missing:</strong> Required data is absent</span>
            </li>
            <li className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span><strong>Inconsistent:</strong> Data doesn&apos;t follow expected format</span>
            </li>
            <li className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span><strong>Duplicate:</strong> Same data appears more than once</span>
            </li>
            <li className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span><strong>Format:</strong> Wrong data type or format</span>
            </li>
          </ul>
        </div>
        <div className="bg-slate-50 p-4 rounded border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-2">How to Use</h4>
          <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
            <li>Check each row you&apos;ve reviewed</li>
            <li>Mark each issue you identify</li>
            <li>Click &quot;Complete Audit&quot; when finished</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
