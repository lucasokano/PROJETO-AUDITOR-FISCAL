export type AuthoredQuestionKind = "conceptual" | "cloze";

export interface StudyConceptQuestion { id: number; subtopicId: number; question: string; }
export interface ConceptAnswerResult { questionId: number; answer: string; graded: false; }
export interface StudyClozeQuestion { id: number; subtopicId: number; text: string; gapCount: number; }
export interface ClozeAnswerResult { questionId: number; answer: string; gaps: string[]; graded: false; }

export interface ConceptQuestionInput { subtopicId: number; question: string; answer: string; }
export interface ClozeQuestionInput { subtopicId: number; textWithAnswers: string; }
