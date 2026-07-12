export enum Subject {
  MATHEMATICS = 'MATHEMATICS',
  SCIENCE = 'SCIENCE',
  HISTORY = 'HISTORY',
  LITERATURE = 'LITERATURE',
  PROGRAMMING = 'PROGRAMMING',
  ART = 'ART',
  OTHER = 'OTHER',
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface StudyNote {
  id?: number;
  title: string;
  subject: Subject;
  description: string;
  aiSummary?: string;
  keyConcepts?: string[];
  flashcards?: Flashcard[];
}

export interface AiPreviewResponse {
  improvedDescription: string;
  summary: string;
  keyConcepts: string[];
  flashcards: string; // JSON string from backend
}
