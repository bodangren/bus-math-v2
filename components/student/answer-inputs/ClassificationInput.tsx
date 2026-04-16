'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { DailyPracticeAnswerInputProps } from '@/lib/srs/answer-inputs/registry';
import type { ClassificationDefinition, ClassificationResponse } from '@/lib/practice/engine/families/classification';

export function ClassificationInput({ family, definition, onSubmit }: DailyPracticeAnswerInputProps) {
  const def = definition as ClassificationDefinition;
  const submittedRef = useRef(false);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [gradeResult, setGradeResult] = useState<{
    isCorrect: boolean;
    score: number;
    maxScore: number;
    parts: Array<{ partId: string; isCorrect: boolean }>;
  } | null>(null);

  const handleSelect = (partId: string, categoryId: string) => {
    if (submittedRef.current) return;
    setSelections((prev) => ({ ...prev, [partId]: categoryId }));
  };

  const handleSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const response: ClassificationResponse = selections;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (family as any).grade(def, response);

    setGradeResult({
      isCorrect: result.score === result.maxScore,
      score: result.score,
      maxScore: result.maxScore,
      parts: result.parts.map((p: { partId: string; isCorrect: boolean }) => ({
        partId: p.partId,
        isCorrect: p.isCorrect,
      })),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const envelope = (family as any).toEnvelope(def, response, result);
    onSubmit(envelope);
  };

  const allSelected = def.parts.every((part) => selections[part.id]);

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-3 text-sm text-muted-foreground">Problem</h3>
        <p className="text-sm mb-4">{def.prompt?.stem ?? 'Classify each item into the correct category.'}</p>
        <div className="space-y-3">
          {def.parts.map((part) => (
            <div key={part.id} className="flex items-center justify-between p-3 bg-background rounded border">
              <span className="font-medium">{part.label}</span>
              <select
                value={selections[part.id] ?? ''}
                onChange={(e) => handleSelect(part.id, e.target.value)}
                disabled={submittedRef.current}
                data-testid={`${part.id}-select`}
                className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Select category</option>
                {def.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {gradeResult ? (
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <div
            className={`text-sm font-medium ${
              gradeResult.isCorrect ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {gradeResult.isCorrect ? 'Correct!' : `Incorrect — ${gradeResult.score}/${gradeResult.maxScore} correct`}
          </div>
          <div className="space-y-1">
            {gradeResult.parts.map((part) => {
              const partDef = def.parts.find((p) => p.id === part.partId);
              const expectedCategory = def.categories.find((c) => c.id === partDef?.targetId);
              return (
                <div
                  key={part.partId}
                  className={`text-sm ${part.isCorrect ? 'text-green-600' : 'text-red-600'}`}
                >
                  {partDef?.label ?? part.partId}: {part.isCorrect ? 'Correct' : `Incorrect (expected ${expectedCategory?.label ?? partDef?.targetId})`}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <Button onClick={handleSubmit} disabled={submittedRef.current || !allSelected}>
          Submit Answer
        </Button>
      )}
    </div>
  );
}