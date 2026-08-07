export interface ExamBoard { id: number; name: string; isActive: boolean; }
export interface Exam { id: number; boardId: number; name: string; year: number | null; isActive: boolean; board: ExamBoard; }
export interface ExamQuestionOption { id: number; text: string; isCorrect: boolean; displayOrder: number; }
export interface ExamQuestion {
  id: number; subtopicId: number; boardId: number | null; examId: number | null;
  text: string; explanation: string | null; isActive: boolean;
  board: ExamBoard | null; exam: Exam | null; options: ExamQuestionOption[];
  subtopic: { id: number; name: string; topic: { id: number; name: string; discipline: { id: number; name: string } } };
}
export interface ExamQuestionInput {
  subtopicId: number; boardId: number | null; examId: number | null; text: string;
  explanation: string | null; options: Array<{ text: string; isCorrect: boolean }>;
}
export interface StudyExamQuestion {
  id: number;
  subtopicId: number;
  text: string;
  board: { id: number; name: string } | null;
  exam: { id: number; name: string; year: number | null } | null;
  options: Array<{ id: number; text: string; displayOrder: number }>;
}
export interface StudyExamQuestionResult {
  questionId: number;
  selectedOptionId: number;
  correctOptionId: number;
  isCorrect: boolean;
  explanation: string | null;
}
