import { Router } from "express";
import {
  getClozeQuestions, getConceptQuestions, getStudyClozeQuestions, getStudyConceptQuestions,
  postClozeQuestion, postConceptQuestion, putClozeQuestion, putConceptQuestion,
  removeClozeQuestion, removeConceptQuestion, revealStudyClozeQuestion, revealStudyConceptQuestion,
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
authoredQuestionRoutes.put("/cloze/:questionId", putClozeQuestion);
authoredQuestionRoutes.delete("/cloze/:questionId", removeClozeQuestion);
authoredQuestionRoutes.get("/study/cloze", getStudyClozeQuestions);
authoredQuestionRoutes.post("/study/cloze/:questionId/reveal", revealStudyClozeQuestion);
