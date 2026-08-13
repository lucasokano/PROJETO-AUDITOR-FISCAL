export type AuthoredQuestionKind = "conceptual" | "cloze";

export interface StudyConceptQuestion { id: number; subtopicId: number; question: string; }
export interface ConceptAnswerResult { questionId: number; answer: string; graded: false; }
export interface StudyClozeQuestion { id: number; subtopicId: number; text: string; gapCount: number; }
export interface ClozeAnswerResult { questionId: number; answer: string; gaps: string[]; graded: false; }

export interface ConceptQuestionInput { subtopicId: number; question: string; answer: string; }
export interface ClozeQuestionInput { subtopicId: number; textWithAnswers: string; }

interface AuthoredQuestionContext {
  id: number;
  subtopicId: number;
  isActive: boolean;
  subtopic: { id: number; name: string; topic: { id: number; name: string; discipline: { id: number; name: string } } };
}

export interface ConceptQuestion extends AuthoredQuestionContext { question: string; answer: string; }
export interface ClozeQuestion extends AuthoredQuestionContext { textWithAnswers: string; }
