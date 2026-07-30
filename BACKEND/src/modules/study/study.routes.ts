import { Router } from "express";

import {
  createStudyDiscipline,
  createStudyStatement,
  createStudySubtopic,
  createStudyTopic,
  listStudyStructure,
  listSubtopicStatements,
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
  "/statements",
  createStudyStatement,
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