'use client';

import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Basic markdown renderer for content blocks.
 * Handles common markdown patterns without requiring external dependencies.
 * For more complex markdown, consider adding react-markdown.
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Simple markdown processing
  const processMarkdown = (text: string): string => {
    let processed = text;

    // Bold: **text** or __text__
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic: *text* or _text_
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    processed = processed.replace(/_(.*?)_/g, '<em>$1</em>');

    // Code: `code`
    processed = processed.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-muted rounded text-sm">$1</code>');

    // Links: [text](url)
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Paragraphs (double newline)
    const paragraphs = processed.split('\n\n').filter(p => p.trim());
    processed = paragraphs.map(p => `<p class="mb-4">${p.trim()}</p>`).join('');

    return processed;
  };

  return (
    <div
      className={cn('prose prose-sm max-w-none dark:prose-invert', className)}
      dangerouslySetInnerHTML={{ __html: processMarkdown(content) }}
    />
  );
}
