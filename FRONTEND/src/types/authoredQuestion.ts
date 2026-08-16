export type AuthoredQuestionKind = "conceptual" | "cloze";

export interface StudyConceptQuestion { id: number; subtopicId: number; question: string; }
export interface ConceptAnswerResult { questionId: number; answer: string; graded: false; }
export interface StudyClozeQuestion { id: number; subtopicId: number; text: string; answer: string; answers: string[]; gapCount: number; isDifficult: boolean; }

export interface ConceptQuestionInput { subtopicId: number; question: string; answer: string; }
export interface ClozeQuestionInput { subtopicId: number; textWithAnswers: string; isDifficult?: boolean; }

interface AuthoredQuestionContext {
  id: number;
  subtopicId: number;
  isActive: boolean;
  subtopic: { id: number; name: string; topic: { id: number; name: string; discipline: { id: number; name: string } } };
}

export interface ConceptQuestion extends AuthoredQuestionContext { question: string; answer: string; }
export interface ClozeQuestion extends AuthoredQuestionContext { textWithAnswers: string; isDifficult: boolean; }

export interface ClozeImportPreviewItem {
  line: number; topic: string; subtopic: string; text: string; answers: string[];
  valid: boolean; message: string | null; willCreateTopic: boolean; willCreateSubtopic: boolean;
}
export interface ClozeImportInput { disciplineId: number; text: string; createMissing: boolean; }
export interface ClozeImportResult { created: number; failed: number; items: Array<ClozeImportPreviewItem & { imported: boolean }>; }
