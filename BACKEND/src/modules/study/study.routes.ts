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