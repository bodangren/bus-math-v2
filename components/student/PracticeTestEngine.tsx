'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PracticeTestUnitConfig, filterQuestionsByLessonIds, drawRandomQuestions, shuffleAnswers } from '@/lib/practice-tests/question-banks';

interface PracticeTestEngineProps {
  unitConfig: PracticeTestUnitConfig;
}

type Phase = 'hook' | 'introduction' | 'guided-practice' | 'independent-practice' | 'assessment' | 'closing';

export default function PracticeTestEngine({ unitConfig }: PracticeTestEngineProps) {
  const [currentPhase, setCurrentPhase] = useState<Phase>('hook');
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>(unitConfig.lessons.map((l) => l.id));
  const [questionCount, setQuestionCount] = useState<number>(Math.min(10, unitConfig.questions.length));
  const [testQuestions, setTestQuestions] = useState<{ question: ReturnType<typeof shuffleAnswers>; original: typeof unitConfig.questions[0] }[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [, setScore] = useState<number>(0);
  const [, setPerLessonBreakdown] = useState<Record<string, { correct: number; total: number }>>({});

  // Refs to track running totals — avoids stale-state risk when transitioning to closing on last answer
  const scoreRef = useRef(0);
  const breakdownRef = useRef<Record<string, { correct: number; total: number }>>({});

  const handleNextPhase = () => {
    const phases: Phase[] = ['hook', 'introduction', 'guided-practice', 'independent-practice', 'assessment', 'closing'];
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex < phases.length - 1) {
      setCurrentPhase(phases[currentIndex + 1]);
    }
  };

  const handlePreviousPhase = () => {
    const phases: Phase[] = ['hook', 'introduction', 'guided-practice', 'independent-practice', 'assessment', 'closing'];
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex > 0) {
      setCurrentPhase(phases[currentIndex - 1]);
    }
  };

  const handleToggleLesson = (lessonId: string) => {
    setSelectedLessonIds((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const handleSelectAllLessons = () => {
    setSelectedLessonIds(unitConfig.lessons.map((l) => l.id));
  };

  const handleClearAllLessons = () => {
    setSelectedLessonIds([]);
  };

  const handleStartTest = () => {
    const filteredQuestions = filterQuestionsByLessonIds(unitConfig.questions, selectedLessonIds);
    const drawnQuestions = drawRandomQuestions(filteredQuestions, questionCount);
    const shuffledQuestions = drawnQuestions.map((q) => ({
      question: shuffleAnswers(q),
      original: q,
    }));
    setTestQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    scoreRef.current = 0;
    const breakdown: Record<string, { correct: number; total: number }> = {};
    selectedLessonIds.forEach((lessonId) => {
      breakdown[lessonId] = { correct: 0, total: 0 };
    });
    shuffledQuestions.forEach(({ original }) => {
      if (breakdown[original.lessonId]) {
        breakdown[original.lessonId].total++;
      }
    });
    breakdownRef.current = breakdown;
    setPerLessonBreakdown(breakdown);
    setCurrentPhase('assessment');
  };

  const handleAnswerQuestion = (selectedAnswer: string) => {
    const { question, original } = testQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === question.answer;
    
    if (isCorrect) {
      scoreRef.current += 1;
      setScore((prev) => prev + 1);
      if (breakdownRef.current[original.lessonId]) {
        breakdownRef.current[original.lessonId] = {
          ...breakdownRef.current[original.lessonId],
          correct: breakdownRef.current[original.lessonId].correct + 1,
        };
      }
      setPerLessonBreakdown((prev) => ({
        ...prev,
        [original.lessonId]: {
          ...prev[original.lessonId],
          correct: prev[original.lessonId].correct + 1,
        },
      }));
    }

    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setCurrentPhase('closing');
    }
  };

  const handleRetryTest = () => {
    scoreRef.current = 0;
    breakdownRef.current = {};
    setCurrentPhase('introduction');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Unit {unitConfig.unitNumber} Practice Test</CardTitle>
        </CardHeader>
        <CardContent>
          {currentPhase === 'hook' && (
            <div>
              <p className="text-lg mb-6">{unitConfig.phaseContent.hook}</p>
              <div className="flex justify-end">
                <Button onClick={handleNextPhase}>Next</Button>
              </div>
            </div>
          )}

          {currentPhase === 'introduction' && (
            <div>
              <p className="text-lg mb-6">{unitConfig.phaseContent.introduction}</p>
              
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-3">Select Lessons</h3>
                <div className="flex gap-2 mb-3">
                  <Button variant="secondary" size="sm" onClick={handleSelectAllLessons}>Select All</Button>
                  <Button variant="secondary" size="sm" onClick={handleClearAllLessons}>Clear All</Button>
                </div>
                <div className="space-y-2">
                  {unitConfig.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-2">
                      <Checkbox
                        id={lesson.id}
                        checked={selectedLessonIds.includes(lesson.id)}
                        onCheckedChange={() => handleToggleLesson(lesson.id)}
                      />
                      <Label htmlFor={lesson.id}>{lesson.title}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="question-count">Number of questions</Label>
                <Input
                  id="question-count"
                  type="number"
                  min={1}
                  max={filterQuestionsByLessonIds(unitConfig.questions, selectedLessonIds).length}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Math.max(1, Math.min(parseInt(e.target.value) || 1, filterQuestionsByLessonIds(unitConfig.questions, selectedLessonIds).length)))}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="secondary" onClick={handlePreviousPhase}>Back</Button>
                <Button onClick={handleNextPhase} disabled={selectedLessonIds.length === 0}>Next</Button>
              </div>
            </div>
          )}

          {currentPhase === 'guided-practice' && (
            <div>
              <p className="text-lg mb-6">{unitConfig.phaseContent.guidedPractice}</p>
              <div className="flex justify-between">
                <Button variant="secondary" onClick={handlePreviousPhase}>Back</Button>
                <Button onClick={handleNextPhase}>Next</Button>
              </div>
            </div>
          )}

          {currentPhase === 'independent-practice' && (
            <div>
              <p className="text-lg mb-6">{unitConfig.phaseContent.independentPractice}</p>
              <div className="mb-4">
                <Badge variant="secondary">Lessons: {selectedLessonIds.length}</Badge>
                <Badge variant="secondary" className="ml-2">Questions: {questionCount}</Badge>
              </div>
              <div className="flex justify-between">
                <Button variant="secondary" onClick={handlePreviousPhase}>Back</Button>
                <Button onClick={handleStartTest}>Start Test</Button>
              </div>
            </div>
          )}

          {currentPhase === 'assessment' && (
            <div>
              <div className="mb-6">
                <Badge variant="secondary">Question {currentQuestionIndex + 1} of {testQuestions.length}</Badge>
              </div>
              <h3 className="text-lg font-semibold mb-4">{testQuestions[currentQuestionIndex].original.prompt}</h3>
              <div className="space-y-3 mb-6">
                {testQuestions[currentQuestionIndex].question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="secondary"
                    className="w-full justify-start text-left"
                    onClick={() => handleAnswerQuestion(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <div className="text-sm text-gray-600">{testQuestions[currentQuestionIndex].original.explanation}</div>
            </div>
          )}

          {currentPhase === 'closing' && (
            <div>
              <p className="text-lg mb-6">{unitConfig.phaseContent.closing}</p>
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-3">Your Score</h3>
                <div className="text-4xl font-bold mb-2">{scoreRef.current}/{testQuestions.length}</div>
                <div className="text-lg text-gray-600">{testQuestions.length > 0 ? Math.round((scoreRef.current / testQuestions.length) * 100) : 0}%</div>
              </div>
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-3">Per-lesson breakdown</h3>
                <div className="space-y-2">
                  {Object.entries(breakdownRef.current).map(([lessonId, data]) => {
                    const lesson = unitConfig.lessons.find((l) => l.id === lessonId);
                    return (
                      <div key={lessonId} className="flex justify-between">
                        <span>{lesson?.title}</span>
                        <span>{data.correct}/{data.total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleRetryTest}>Retry Test</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
