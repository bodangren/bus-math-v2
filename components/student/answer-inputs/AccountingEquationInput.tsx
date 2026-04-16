'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DailyPracticeAnswerInputProps } from '@/lib/srs/answer-inputs/registry';
import type { AccountingEquationDefinition, AccountingEquationResponse } from '@/lib/practice/engine/families/accounting-equation';

export function AccountingEquationInput({ family, definition, onSubmit }: DailyPracticeAnswerInputProps) {
  const def = definition as AccountingEquationDefinition;
  const submittedRef = useRef(false);
  const [value, setValue] = useState('');
  const [gradeResult, setGradeResult] = useState<{
    isCorrect: boolean;
    expectedValue: number;
    submittedValue: number;
  } | null>(null);

  const hiddenTermId = def.equation.hiddenTermId;
  const visibleFacts = def.facts;
  const hiddenTermLabel = def.terms[hiddenTermId]?.label ?? hiddenTermId;

  const handleSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const parsedValue = Number(value);
    const response: AccountingEquationResponse = {
      [hiddenTermId]: Number.isFinite(parsedValue) ? parsedValue : undefined,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (family as any).grade(def, response);
    const partResult = result.parts[0];

    setGradeResult({
      isCorrect: partResult?.isCorrect ?? false,
      expectedValue: def.equation[hiddenTermId],
      submittedValue: parsedValue,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const envelope = (family as any).toEnvelope(def, response, result);
    onSubmit(envelope);
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-3 text-sm text-muted-foreground">Problem</h3>
        <div className="space-y-2">
          {visibleFacts.map((fact) => (
            <div key={fact.id} className="flex gap-2">
              <span className="font-medium">{fact.label}:</span>
              <span className="font-mono">{fact.value.toLocaleString('en-US')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="accounting-equation-input" className="text-sm font-medium">
          Enter {hiddenTermLabel}
        </label>
        <Input
          id="accounting-equation-input"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={submittedRef.current}
          placeholder={`Enter ${hiddenTermLabel.toLowerCase()}`}
        />
      </div>

      {gradeResult ? (
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div
            className={`text-sm font-medium ${
              gradeResult.isCorrect ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {gradeResult.isCorrect ? 'Correct!' : 'Incorrect'}
          </div>
          {!gradeResult.isCorrect && (
            <div className="text-sm">
              Expected: {gradeResult.expectedValue.toLocaleString('en-US')}
            </div>
          )}
        </div>
      ) : (
        <Button onClick={handleSubmit} disabled={submittedRef.current}>
          Submit Answer
        </Button>
      )}
    </div>
  );
}
