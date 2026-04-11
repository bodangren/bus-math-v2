export interface PracticeTestQuestion {
  id: string;
  lessonId: string;
  lessonTitle: string;
  prompt: string;
  correctAnswer: string;
  distractors: string[];
  explanation: string;
  objectiveTags: string[];
}

export interface PracticeTestLesson {
  id: string;
  title: string;
}

export interface PracticeTestPhaseContent {
  hook: string;
  introduction: string;
  guidedPractice: string;
  independentPractice: string;
  closing: string;
}

export interface PracticeTestMessaging {
  calloutTitle: string;
  calloutDescription: string;
  calloutCta: string;
}

export interface PracticeTestUnitConfig {
  unitNumber: number;
  lessons: PracticeTestLesson[];
  questions: PracticeTestQuestion[];
  phaseContent: PracticeTestPhaseContent;
  messaging: PracticeTestMessaging;
}
