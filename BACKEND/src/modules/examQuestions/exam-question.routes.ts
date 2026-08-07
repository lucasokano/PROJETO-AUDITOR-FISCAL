import { Router } from "express";
import {
  getBoards, getExams, getQuestions, patchBoard, patchExam, postBoard, postExam,
  postQuestion, putQuestion, removeBoard, removeExam, removeQuestion,
  getStudyQuestions, answerStudyQuestion,
} from "./exam-question.controller.js";

export const examQuestionRoutes = Router();
examQuestionRoutes.get("/boards", getBoards);
examQuestionRoutes.post("/boards", postBoard);
examQuestionRoutes.patch("/boards/:boardId", patchBoard);
examQuestionRoutes.delete("/boards/:boardId", removeBoard);
examQuestionRoutes.get("/exams", getExams);
examQuestionRoutes.post("/exams", postExam);
examQuestionRoutes.patch("/exams/:examId", patchExam);
examQuestionRoutes.delete("/exams/:examId", removeExam);
examQuestionRoutes.get("/questions", getQuestions);
examQuestionRoutes.get("/study", getStudyQuestions);
examQuestionRoutes.post("/study/:questionId/answer", answerStudyQuestion);
examQuestionRoutes.post("/questions", postQuestion);
examQuestionRoutes.put("/questions/:questionId", putQuestion);
examQuestionRoutes.delete("/questions/:questionId", removeQuestion);
