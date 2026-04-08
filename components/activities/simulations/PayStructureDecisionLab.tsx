"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SpreadsheetWrapper, type SpreadsheetData } from "@/components/activities/spreadsheet/SpreadsheetWrapper"
import { ArrowLeft, ArrowRight, CheckCircle2, Info, ShieldCheck, Target } from "lucide-react"
import type { Activity } from '@/lib/db/schema/validators'
import type { PayStructureDecisionLabActivityProps } from '@/types/activities'
import { buildPracticeSubmissionEnvelope, buildPracticeSubmissionParts, type PracticeSubmissionCallbackPayload } from '@/lib/practice/contract'

export type PayStructureDecisionLabActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'pay-structure-lab'
  props: PayStructureDecisionLabActivityProps
}

type ScenarioConfig = {
  id: "service" | "product" | "sales"
  title: string
  role: string
  context: string
  goal: string
  payType: "hourly" | "salary" | "commission"
  talkTrack: string
  strengths: string[]
  risks: string[]
}



type HourlyInputs = {
  week1: number
  week2: number
  rate: number
  ytdWages: number
  ssCap: number
  stateRate: number
}

type SalaryInputs = {
  annualSalary: number
  ytdWages: number
  ssCap: number
  stateRate: number
}

type CommissionInputs = {
  sales: number
  commissionRate: number
  draw: number
  basePay: number
  ytdWages: number
  ssCap: number
  stateRate: number
}



type CommonResult = {
  gross: number
  ssTaxable: number
  ssTax: number
  medicare: number
  fit: number
  stateTax: number
  net: number
}

const formatMoney = (val: number) => `$${val.toFixed(2)}`

const computeFIT = (wages: number) => {
  // Simplified single filer biweekly slice
  if (wages <= 596) return 0
  if (wages <= 1909) return (wages - 596) * 0.12
  if (wages <= 4021) return 157.56 + (wages - 1909) * 0.22
  return 533.73 + (wages - 4021) * 0.24
}

const computeHourly = (inputs: HourlyInputs): CommonResult & { regularHours: number; overtimeHours: number } => {
  const overtimeHours = Math.max(inputs.week1 - 40, 0) + Math.max(inputs.week2 - 40, 0)
  const regularHours = inputs.week1 + inputs.week2 - overtimeHours
  const regularPay = regularHours * inputs.rate
  const overtimePay = overtimeHours * inputs.rate * 1.5
  const gross = regularPay + overtimePay

  const remainingCap = Math.max(inputs.ssCap - inputs.ytdWages, 0)
  const ssTaxable = Math.max(Math.min(gross, remainingCap), 0)
  const ssTax = ssTaxable * 0.062
  const medicare = gross * 0.0145
  const fit = computeFIT(gross)
  const stateTax = gross * inputs.stateRate
  const net = gross - ssTax - medicare - fit - stateTax

  return { gross, ssTaxable, ssTax, medicare, fit, stateTax, net, regularHours, overtimeHours }
}

const computeSalary = (inputs: SalaryInputs): CommonResult => {
  const gross = inputs.annualSalary / 26
  const remainingCap = Math.max(inputs.ssCap - inputs.ytdWages, 0)
  const ssTaxable = Math.max(Math.min(gross, remainingCap), 0)
  const ssTax = ssTaxable * 0.062
  const medicare = gross * 0.0145
  const fit = computeFIT(gross)
  const stateTax = gross * inputs.stateRate
  const net = gross - ssTax - medicare - fit - stateTax
  return { gross, ssTaxable, ssTax, medicare, fit, stateTax, net }
}

const computeCommission = (inputs: CommissionInputs): CommonResult & { commissionEarned: number; paycheckCommission: number } => {
  const commissionEarned = inputs.sales * inputs.commissionRate
  const netCommission = Math.max(commissionEarned - inputs.draw, 0)
  const drawApplied = Math.min(commissionEarned, inputs.draw)
  const paycheckCommission = netCommission + drawApplied + inputs.basePay
  const gross = paycheckCommission

  const remainingCap = Math.max(inputs.ssCap - inputs.ytdWages, 0)
  const ssTaxable = Math.max(Math.min(gross, remainingCap), 0)
  const ssTax = ssTaxable * 0.062
  const medicare = gross * 0.0145
  const fit = computeFIT(gross)
  const stateTax = gross * inputs.stateRate
  const net = gross - ssTax - medicare - fit - stateTax

  return { gross, ssTaxable, ssTax, medicare, fit, stateTax, net, commissionEarned, paycheckCommission }
}

const hourlySheet = (inputs: HourlyInputs, result: ReturnType<typeof computeHourly>): SpreadsheetData => [
  [
    { value: "Input", readOnly: true },
    { value: "Value", readOnly: true },
    { value: "Excel idea", readOnly: true },
  ],
  [
    { value: "Week 1 hours", readOnly: true },
    { value: inputs.week1 },
    { value: "'=MIN(40,Wk1)" },
  ],
  [
    { value: "Week 2 hours", readOnly: true },
    { value: inputs.week2 },
    { value: "'=MIN(40,Wk2)" },
  ],
  [
    { value: "Regular hours", readOnly: true },
    { value: result.regularHours, readOnly: true },
    { value: "'=SUM(MIN(Wk1,40),MIN(Wk2,40))" },
  ],
  [
    { value: "Overtime hours", readOnly: true },
    { value: result.overtimeHours, readOnly: true },
    { value: "'=SUM(MAX(Wk1-40,0),MAX(Wk2-40,0))" },
  ],
  [
    { value: "OT pay", readOnly: true },
    { value: (result.overtimeHours * inputs.rate * 1.5).toFixed(2), readOnly: true },
    { value: "'=OTHours*Rate*1.5" },
  ],
  [
    { value: "Social Security cap", readOnly: true },
    { value: inputs.ssCap, readOnly: true },
    { value: "2024 cap" },
  ],
  [
    { value: "YTD wages", readOnly: true },
    { value: inputs.ytdWages, readOnly: true },
    { value: "Track this every check" },
  ],
  [
    { value: "SS taxable", readOnly: true },
    { value: result.ssTaxable.toFixed(2), readOnly: true },
    { value: "'=MIN(Gross, Cap - YTD)" },
  ],
]

const salarySheet = (inputs: SalaryInputs, result: ReturnType<typeof computeSalary>): SpreadsheetData => [
  [
    { value: "Item", readOnly: true },
    { value: "Value", readOnly: true },
    { value: "Excel idea", readOnly: true },
  ],
  [
    { value: "Annual salary", readOnly: true },
    { value: inputs.annualSalary },
    { value: "" },
  ],
  [
    { value: "Per paycheck", readOnly: true },
    { value: result.gross.toFixed(2), readOnly: true },
    { value: "'=Annual/26" },
  ],
  [
    { value: "SS taxable", readOnly: true },
    { value: result.ssTaxable.toFixed(2), readOnly: true },
    { value: "'=MIN(Gross, Cap - YTD)" },
  ],
]

const commissionSheet = (
  inputs: CommissionInputs,
  result: ReturnType<typeof computeCommission>
): SpreadsheetData => [
  [
    { value: "Item", readOnly: true },
    { value: "Value", readOnly: true },
    { value: "Excel idea", readOnly: true },
  ],
  [
    { value: "Sales", readOnly: true },
    { value: inputs.sales },
    { value: "" },
  ],
  [
    { value: "Commission rate", readOnly: true },
    { value: `${(inputs.commissionRate * 100).toFixed(1)}%`, readOnly: true },
    { value: "" },
  ],
  [
    { value: "Commission earned", readOnly: true },
    { value: result.commissionEarned.toFixed(2), readOnly: true },
    { value: "'=Sales*Rate" },
  ],
  [
    { value: "Draw applied", readOnly: true },
    { value: Math.min(result.commissionEarned, inputs.draw).toFixed(2), readOnly: true },
    { value: "'=MIN(Commission,Draw)" },
  ],
  [
    { value: "Net commission", readOnly: true },
    { value: Math.max(result.commissionEarned - inputs.draw, 0).toFixed(2), readOnly: true },
    { value: "'=MAX(Commission-Draw,0)" },
  ],
  [
    { value: "Paycheck commission", readOnly: true },
    { value: result.paycheckCommission.toFixed(2), readOnly: true },
    { value: "'=NetCommission+DrawApplied+Base" },
  ],
  [
    { value: "SS taxable", readOnly: true },
    { value: result.ssTaxable.toFixed(2), readOnly: true },
    { value: "'=MIN(Gross, Cap - YTD)" },
  ],
]

const defaultScenarios: ScenarioConfig[] = [
  {
    id: "service",
    title: "Client Support Coverage",
    role: "Support Specialist",
    context: "Handles live chat and quick fixes during launch weeks. Hours spike fast.",
    goal: "Pay for time and stay compliant with weekly overtime rules.",
    payType: "hourly",
    talkTrack: "Hourly + overtime keeps pay fair when launches go long. We track by week so OT is legal.",
    strengths: [
      "Overtime after 40 hours in a week protects the employee",
      "Easy to scale hours up/down when tickets spike",
      "Clear match between time worked and pay received",
    ],
    risks: [
      "Unplanned overtime can blow up cash needs",
      "Requires tight scheduling and time tracking",
    ],
  },
  {
    id: "product",
    title: "Project and Quality Ownership",
    role: "Junior Developer",
    context: "Ships features, fixes bugs, joins demos. Some sprints run late.",
    goal: "Provide stable pay, budget predictably, and add bonuses for launches.",
    payType: "salary",
    talkTrack: "Salary keeps pay steady. When launches push late, Sarah can add a small bonus or flex day.",
    strengths: [
      "Predictable payroll each period",
      "Simpler admin than tracking OT every week",
      "Supports retention with steady checks",
    ],
    risks: [
      "Must meet exemption rules to avoid misclassification",
      "Crunch weeks can feel unpaid without comp time or bonuses",
    ],
  },
  {
    id: "sales",
    title: "Outbound Sales Growth",
    role: "Sales Representative",
    context: "Books new clients and renewals. Revenue swings by month.",
    goal: "Align pay with revenue and protect take-home with a draw/base.",
    payType: "commission",
    talkTrack: "Commission with a draw says: you share the upside, and you have a floor while pipeline builds.",
    strengths: [
      "Direct tie between revenue and pay",
      "Draw/base smooths slow months without losing upside",
      "Easy to adjust payouts to margin targets",
    ],
    risks: [
      "Must track chargebacks and returns",
      "Cash planning needed when big deals hit",
    ],
  },
]

const defaultInitialHourly: HourlyInputs = {
  week1: 44,
  week2: 41,
  rate: 25,
  ytdWages: 167500,
  ssCap: 168600,
  stateRate: 0.05,
}

const defaultInitialSalary: SalaryInputs = {
  annualSalary: 52000,
  ytdWages: 167500,
  ssCap: 168600,
  stateRate: 0.05,
}

const defaultInitialCommission: CommissionInputs = {
  sales: 12000,
  commissionRate: 0.05,
  draw: 300,
  basePay: 500,
  ytdWages: 167500,
  ssCap: 168600,
  stateRate: 0.05,
}

export interface PayStructureDecisionLabProps {
  activity?: PayStructureDecisionLabActivity
  onSubmit?: (payload: PracticeSubmissionCallbackPayload) => void
}

export function PayStructureDecisionLab({ activity, onSubmit }: PayStructureDecisionLabProps) {
  const [current, setCurrent] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const submittedRef = useRef(false)
  const [hourlyInputs, setHourlyInputs] = useState<HourlyInputs>(activity?.props.initialHourly ?? defaultInitialHourly)
  const [salaryInputs, setSalaryInputs] = useState<SalaryInputs>(activity?.props.initialSalary ?? defaultInitialSalary)
  const [commissionInputs, setCommissionInputs] = useState<CommissionInputs>(activity?.props.initialCommission ?? defaultInitialCommission)

  const scenarios = activity?.props.scenarios ?? defaultScenarios
  const scenario = scenarios[current]
  const completion = { done: current + 1, total: scenarios.length }

  const hourlyResult = computeHourly(hourlyInputs)
  const salaryResult = computeSalary(salaryInputs)
  const commissionResult = computeCommission(commissionInputs)

  const resetLab = () => {
    setCurrent(0)
    setSubmitted(false)
    submittedRef.current = false
    setHourlyInputs(activity?.props.initialHourly ?? defaultInitialHourly)
    setSalaryInputs(activity?.props.initialSalary ?? defaultInitialSalary)
    setCommissionInputs(activity?.props.initialCommission ?? defaultInitialCommission)
  }

  const onNumericChange = <T extends object>(setter: React.Dispatch<React.SetStateAction<T>>, field: keyof T) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0
      setter((prev) => ({ ...prev, [field]: value }))
    }

  const renderInputs = () => {
    if (scenario.payType === "hourly") {
      return (
        <div className="grid md:grid-cols-3 gap-3">
          <InputWithLabel label="Week 1 hours" value={hourlyInputs.week1} onChange={onNumericChange(setHourlyInputs, "week1")} />
          <InputWithLabel label="Week 2 hours" value={hourlyInputs.week2} onChange={onNumericChange(setHourlyInputs, "week2")} />
          <InputWithLabel label="Hourly rate" value={hourlyInputs.rate} onChange={onNumericChange(setHourlyInputs, "rate")} prefix="$" />
          <InputWithLabel label="YTD wages" value={hourlyInputs.ytdWages} onChange={onNumericChange(setHourlyInputs, "ytdWages")} prefix="$" />
          <InputWithLabel label="SS wage cap" value={hourlyInputs.ssCap} onChange={onNumericChange(setHourlyInputs, "ssCap")} prefix="$" />
          <InputWithLabel label="State tax rate" value={hourlyInputs.stateRate * 100} onChange={(e) => {
            const val = parseFloat(e.target.value) || 0
            setHourlyInputs((prev) => ({ ...prev, stateRate: val / 100 }))
          }} suffix="%" />
        </div>
      )
    }

    if (scenario.payType === "salary") {
      return (
        <div className="grid md:grid-cols-3 gap-3">
          <InputWithLabel label="Annual salary" value={salaryInputs.annualSalary} onChange={onNumericChange(setSalaryInputs, "annualSalary")} prefix="$" />
          <InputWithLabel label="YTD wages" value={salaryInputs.ytdWages} onChange={onNumericChange(setSalaryInputs, "ytdWages")} prefix="$" />
          <InputWithLabel label="SS wage cap" value={salaryInputs.ssCap} onChange={onNumericChange(setSalaryInputs, "ssCap")} prefix="$" />
          <InputWithLabel label="State tax rate" value={salaryInputs.stateRate * 100} onChange={(e) => {
            const val = parseFloat(e.target.value) || 0
            setSalaryInputs((prev) => ({ ...prev, stateRate: val / 100 }))
          }} suffix="%" />
        </div>
      )
    }

    return (
      <div className="grid md:grid-cols-3 gap-3">
        <InputWithLabel label="Sales this pay" value={commissionInputs.sales} onChange={onNumericChange(setCommissionInputs, "sales")} prefix="$" />
        <InputWithLabel label="Commission rate" value={commissionInputs.commissionRate * 100} onChange={(e) => {
          const val = parseFloat(e.target.value) || 0
          setCommissionInputs((prev) => ({ ...prev, commissionRate: val / 100 }))
        }} suffix="%" />
        <InputWithLabel label="Draw" value={commissionInputs.draw} onChange={onNumericChange(setCommissionInputs, "draw")} prefix="$" />
        <InputWithLabel label="Base pay" value={commissionInputs.basePay} onChange={onNumericChange(setCommissionInputs, "basePay")} prefix="$" />
        <InputWithLabel label="YTD wages" value={commissionInputs.ytdWages} onChange={onNumericChange(setCommissionInputs, "ytdWages")} prefix="$" />
        <InputWithLabel label="SS wage cap" value={commissionInputs.ssCap} onChange={onNumericChange(setCommissionInputs, "ssCap")} prefix="$" />
        <InputWithLabel label="State tax rate" value={commissionInputs.stateRate * 100} onChange={(e) => {
          const val = parseFloat(e.target.value) || 0
          setCommissionInputs((prev) => ({ ...prev, stateRate: val / 100 }))
        }} suffix="%" />
      </div>
    )
  }

  const renderResults = () => {
    const shared = scenario.payType === "hourly" ? hourlyResult : scenario.payType === "salary" ? salaryResult : commissionResult
    return (
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-green-100 rounded-lg border border-green-300 p-3 space-y-1">
          <div className="flex items-center gap-2 text-green-900 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            Calculated payroll
          </div>
          <p className="text-sm">Gross: {formatMoney(shared.gross)}</p>
          <p className="text-sm">Social Security (6.2% until cap): {formatMoney(shared.ssTax)}</p>
          <p className="text-sm">Medicare (1.45% all wages): {formatMoney(shared.medicare)}</p>
          <p className="text-sm">Federal income tax (table): {formatMoney(shared.fit)}</p>
          <p className="text-sm">State tax: {formatMoney(shared.stateTax)}</p>
          <p className="text-sm font-semibold text-green-900">Net pay: {formatMoney(shared.net)}</p>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-3 space-y-1">
          <div className="flex items-center gap-2 text-red-900 font-semibold">
            <Info className="h-4 w-4" />
            Watch out
          </div>
          <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
            {scenario.risks.map((risk: string) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  const renderSheet = () => {
    if (scenario.payType === "hourly") {
      const key = `hourly-${hourlyInputs.week1}-${hourlyInputs.week2}-${hourlyInputs.rate}-${hourlyInputs.ytdWages}-${hourlyInputs.ssCap}-${hourlyInputs.stateRate}`
      return <SpreadsheetWrapper key={key} initialData={hourlySheet(hourlyInputs, hourlyResult)} />
    }
    if (scenario.payType === "salary") {
      const key = `salary-${salaryInputs.annualSalary}-${salaryInputs.ytdWages}-${salaryInputs.ssCap}-${salaryInputs.stateRate}`
      return <SpreadsheetWrapper key={key} initialData={salarySheet(salaryInputs, salaryResult)} />
    }
    const key = `commission-${commissionInputs.sales}-${commissionInputs.commissionRate}-${commissionInputs.draw}-${commissionInputs.basePay}-${commissionInputs.ytdWages}-${commissionInputs.ssCap}-${commissionInputs.stateRate}`
    return <SpreadsheetWrapper key={key} initialData={commissionSheet(commissionInputs, commissionResult)} />
  }

  return (
    <div className="space-y-5">
      <Card className="border-2 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900 text-xl">
            <Target className="h-5 w-5" />
            Step Through Each Pay Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-orange-800">
          <p className="text-lg leading-relaxed">
            Move through each role one by one. Enter numbers, see the math for overtime, wage caps, and commissions, and use the talk track to justify the offer.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge className="bg-white text-orange-800 border border-orange-200">Scenario {completion.done} of {completion.total}</Badge>
            <Badge className="bg-orange-100 text-orange-900">Current pay type: {scenario.payType.toUpperCase()}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-green-900 text-xl">{scenario.title}</CardTitle>
              <p className="text-sm text-green-700">Role: {scenario.role}</p>
              <p className="text-sm text-green-700">Goal: {scenario.goal}</p>
            </div>
            <Badge className="bg-green-100 text-green-900">{scenario.payType.toUpperCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-green-800">
          <div className="bg-white rounded-lg border border-green-200 p-3 space-y-1">
            <p className="font-semibold text-green-900">Context</p>
            <p>{scenario.context}</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-green-900">Enter your assumptions</p>
            {renderInputs()}
          </div>

          {renderResults()}

          <div className="bg-white rounded-lg border border-green-200 p-3 space-y-2">
            <p className="font-semibold text-green-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              How Sarah explains it
            </p>
            <p className="text-sm text-green-800">{scenario.talkTrack}</p>
            <div className="bg-green-100 border border-green-300 rounded p-2">
              <p className="text-sm font-semibold text-green-900">Why it fits</p>
              <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                {scenario.strengths.map((strength) => (
                  <li key={strength}>{strength}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-green-900">See the Excel layout</p>
            <div className="overflow-x-auto bg-white rounded-lg border border-green-200 p-2">
              {renderSheet()}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrent((prev) => Math.max(prev - 1, 0))}
              disabled={current === 0}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>
            <div className="flex items-center gap-2">
              {current === scenarios.length - 1 && onSubmit && (
                <>
                  <Button
                    onClick={() => {
                      if (submittedRef.current) return
                      const answers: Record<string, unknown> = {
                        hourlyGross: hourlyResult.gross,
                        hourlyNet: hourlyResult.net,
                        salaryGross: salaryResult.gross,
                        salaryNet: salaryResult.net,
                        commissionGross: commissionResult.gross,
                        commissionNet: commissionResult.net,
                      }
                      const parts = buildPracticeSubmissionParts(answers).map((part) => ({
                        ...part,
                        isCorrect: true,
                        score: 1,
                        maxScore: 1,
                      }))
                      const envelope = buildPracticeSubmissionEnvelope({
                        activityId: activity?.id ?? 'pay-structure-decision-lab',
                        mode: 'guided_practice',
                        status: 'submitted',
                        attemptNumber: 1,
                        submittedAt: new Date(),
                        answers,
                        parts,
                        artifact: {
                          kind: 'pay_structure',
                          scenarios: scenarios.map((s: { id: string }) => s.id),
                          hourly: { inputs: hourlyInputs, result: hourlyResult },
                          salary: { inputs: salaryInputs, result: salaryResult },
                          commission: { inputs: commissionInputs, result: commissionResult },
                        },
                        analytics: {
                          totalNetHourly: hourlyResult.net,
                          totalNetSalary: salaryResult.net,
                          totalNetCommission: commissionResult.net,
                        },
                      })
                      submittedRef.current = true
                      onSubmit(envelope)
                      setSubmitted(true)
                    }}
                    disabled={submitted}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4" /> {submitted ? 'Submitted' : 'Submit'}
                  </Button>
                  {submitted && (
                    <Button
                      onClick={resetLab}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      Try Again
                    </Button>
                  )}
                </>
              )}
              <Button
                onClick={() => setCurrent((prev) => Math.min(prev + 1, scenarios.length - 1))}
                disabled={current === scenarios.length - 1}
                className="flex items-center gap-1"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

type InputWithLabelProps = {
  label: string
  value: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  prefix?: string
  suffix?: string
}

function InputWithLabel({ label, value, onChange, prefix, suffix }: InputWithLabelProps) {
  const displayValue = Number.isFinite(value) ? value : 0
  return (
    <label className="space-y-1 block">
      <span className="text-sm font-semibold text-green-900">{label}</span>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-sm text-gray-500">{prefix}</span>}
        <Input type="number" value={displayValue} onChange={onChange} className="bg-white" />
        {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
      </div>
    </label>
  )
}
