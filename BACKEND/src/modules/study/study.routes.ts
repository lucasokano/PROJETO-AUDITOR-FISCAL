import { Router } from "express";

import {
  createStudyStatement,
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