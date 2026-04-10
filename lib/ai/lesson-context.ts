/**
 * Lesson context packaging for the student one-shot lesson chatbot.
 */

export interface LessonChatbotContext {
  lessonTitle: string;
  unitTitle: string;
  phaseTitle: string;
  learningObjectives: string[];
  contentSummary: string;
}

interface MinimalLesson {
  title: string;
  unit: { title: string };
}

interface MinimalPhase {
  title: string;
  learningObjectives: string[];
  content: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

export function assembleLessonChatbotContext(
  lesson: MinimalLesson,
  phase: MinimalPhase,
): LessonChatbotContext {
  const strippedContent = stripHtml(phase.content);
  const contentSummary = truncate(strippedContent, 2000);

  return {
    lessonTitle: lesson.title,
    unitTitle: lesson.unit.title,
    phaseTitle: phase.title,
    learningObjectives: phase.learningObjectives,
    contentSummary,
  };
}