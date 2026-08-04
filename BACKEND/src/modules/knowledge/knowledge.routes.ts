import { Router } from "express";
import {
  createItemClassification,
  createKnowledgeCategory,
  createKnowledgeGroup,
  createKnowledgeItem,
  deleteItemClassification,
  deleteKnowledgeCategory,
  deleteKnowledgeGroup,
  deleteKnowledgeItem,
  getSubtopicKnowledge,
  updateKnowledgeCategory,
  updateKnowledgeGroup,
  updateKnowledgeItem,
} from "./knowledge.controller.js";

export const knowledgeRoutes = Router();

knowledgeRoutes.post("/groups", createKnowledgeGroup);
knowledgeRoutes.patch("/groups/:groupId", updateKnowledgeGroup);
knowledgeRoutes.delete("/groups/:groupId", deleteKnowledgeGroup);

knowledgeRoutes.post("/categories", createKnowledgeCategory);
knowledgeRoutes.patch("/categories/:categoryId", updateKnowledgeCategory);
knowledgeRoutes.delete("/categories/:categoryId", deleteKnowledgeCategory);

knowledgeRoutes.post("/items", createKnowledgeItem);
knowledgeRoutes.patch("/items/:itemId", updateKnowledgeItem);
knowledgeRoutes.delete("/items/:itemId", deleteKnowledgeItem);

knowledgeRoutes.post("/classifications", createItemClassification);
knowledgeRoutes.delete(
  "/classifications/:classificationId",
  deleteItemClassification,
);

knowledgeRoutes.get("/subtopics/:subtopicId", getSubtopicKnowledge);
