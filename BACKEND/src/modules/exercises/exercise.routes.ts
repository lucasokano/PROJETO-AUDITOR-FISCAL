import { Router } from "express";
import {
  answerExercise,
  getNextExercise,
  listExerciseGroups,
} from "./exercise.controller.js";

export const exerciseRoutes = Router();

exerciseRoutes.get("/groups", listExerciseGroups);
exerciseRoutes.get("/next", getNextExercise);
exerciseRoutes.post("/answer", answerExercise);
