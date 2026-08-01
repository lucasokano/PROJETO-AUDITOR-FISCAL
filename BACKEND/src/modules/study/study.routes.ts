import { Router } from "express";

import {
  createStudyDiscipline,
  createStudyStatement,
  createStudySubtopic,
  createStudyTopic,
  deleteStudyDiscipline,
  deleteStudySubtopic,
  deleteStudyTopic,
  listStudyStructure,
  listSubtopicStatements,
  updateStudyDiscipline,
  updateStudySubtopic,
  updateStudyTopic,
  createStudyStatementsBulk,
  deleteStudyStatement,
  listAllStatements,
  updateStudyStatement,
  registerStudyAnswer,
  listDueReviewStatements,
  listDisciplineProgress,
  getDashboard,
} from "./study.controller.js";

export const studyRoutes = Router();

studyRoutes.get(
  "/structure",
  listStudyStructure,
);

studyRoutes.get(
  "/subtopics/:subtopicId/statements",
  listSubtopicStatements,
);

studyRoutes.post(
  "/disciplines",
  createStudyDiscipline,
);

studyRoutes.post(
  "/topics",
  createStudyTopic,
);

studyRoutes.post(
  "/subtopics",
  createStudySubtopic,
);

studyRoutes.post(
  "/statements",
  createStudyStatement,
);

studyRoutes.get(
  "/review",
  listDueReviewStatements,
);

studyRoutes.get(
  "/discipline-progress",
  listDisciplineProgress,
);

studyRoutes.get(
  "/dashboard",
  getDashboard,
);

studyRoutes.post(
  "/answer",
  registerStudyAnswer,
);

studyRoutes.patch(
  "/disciplines/:disciplineId",
  updateStudyDiscipline,
);

studyRoutes.patch(
  "/topics/:topicId",
  updateStudyTopic,
);

studyRoutes.patch(
  "/subtopics/:subtopicId",
  updateStudySubtopic,
);

studyRoutes.delete(
  "/disciplines/:disciplineId",
  deleteStudyDiscipline,
);

studyRoutes.delete(
  "/topics/:topicId",
  deleteStudyTopic,
);

studyRoutes.delete(
  "/subtopics/:subtopicId",
  deleteStudySubtopic,
);

studyRoutes.get(
  "/statements",
  listAllStatements,
);

studyRoutes.post(
  "/statements/bulk",
  createStudyStatementsBulk,
);

studyRoutes.patch(
  "/statements/:statementId",
  updateStudyStatement,
);

studyRoutes.delete(
  "/statements/:statementId",
  deleteStudyStatement,
);