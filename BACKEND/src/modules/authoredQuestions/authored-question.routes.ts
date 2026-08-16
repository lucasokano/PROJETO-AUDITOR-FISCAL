import { Router } from "express";
import {
  getClozeQuestions, getConceptQuestions, getStudyClozeQuestions, getStudyConceptQuestions,
  postClozeQuestion, postConceptQuestion, putClozeQuestion, putConceptQuestion,
  removeClozeQuestion, removeConceptQuestion, revealStudyConceptQuestion,
  previewClozeQuestionsImport, postClozeQuestionsImport,
  patchClozeDifficulty,
} from "./authored-question.controller.js";

export const authoredQuestionRoutes = Router();

authoredQuestionRoutes.get("/conceptual", getConceptQuestions);
authoredQuestionRoutes.post("/conceptual", postConceptQuestion);
authoredQuestionRoutes.put("/conceptual/:questionId", putConceptQuestion);
authoredQuestionRoutes.delete("/conceptual/:questionId", removeConceptQuestion);
authoredQuestionRoutes.get("/study/conceptual", getStudyConceptQuestions);
authoredQuestionRoutes.post("/study/conceptual/:questionId/reveal", revealStudyConceptQuestion);

authoredQuestionRoutes.get("/cloze", getClozeQuestions);
authoredQuestionRoutes.post("/cloze", postClozeQuestion);
authoredQuestionRoutes.post("/cloze/import/preview", previewClozeQuestionsImport);
authoredQuestionRoutes.post("/cloze/import", postClozeQuestionsImport);
authoredQuestionRoutes.put("/cloze/:questionId", putClozeQuestion);
authoredQuestionRoutes.patch("/cloze/:questionId/difficulty", patchClozeDifficulty);
authoredQuestionRoutes.delete("/cloze/:questionId", removeClozeQuestion);
authoredQuestionRoutes.get("/study/cloze", getStudyClozeQuestions);
