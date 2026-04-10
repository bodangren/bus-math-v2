'use client';

import { useState, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface LessonChatbotProps {
  lessonId: string;
  phaseNumber: number;
}

type ChatState = 'closed' | 'open' | 'loading' | 'response' | 'error';

export function LessonChatbot({ lessonId, phaseNumber }: LessonChatbotProps) {
  const [chatState, setChatState] = useState<ChatState>('closed');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setChatState('open');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleClose = () => {
    setChatState('closed');
    setQuestion('');
    setResponse('');
    setError('');
  };

  const handleReset = () => {
    setChatState('open');
    setQuestion('');
    setResponse('');
    setError('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setChatState('loading');
    setError('');

    try {
      const res = await fetch('/api/student/lesson-chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, phaseNumber, question: question.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Something went wrong' }));
        throw new Error(data.error || 'Something went wrong');
      }

      const data = await res.json();
      setResponse(data.response);
      setChatState('response');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setChatState('error');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {chatState === 'closed' ? (
        <Button
          onClick={handleOpen}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          aria-label="Open lesson help"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-80 sm:w-96 shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Lesson Helper</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label="Close lesson help"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 space-y-4">
            {chatState === 'open' && (
              <form onSubmit={handleSubmit} className="space-y-2">
                <Input
                  ref={inputRef}
                  placeholder="Ask a question about this lesson..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={1000}
                  disabled={chatState !== 'open'}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!question.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </form>
            )}

            {chatState === 'loading' && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading...</span>
              </div>
            )}

            {chatState === 'response' && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{response}</p>
                </div>
                <Button onClick={handleReset} className="w-full" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Ask Another Question
                </Button>
              </div>
            )}

            {chatState === 'error' && (
              <div className="space-y-4">
                <div className="p-3 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
                <Button onClick={handleReset} className="w-full" variant="outline">
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
