import { Router } from "express";
import { getVersions } from "./sync.controller.js";

export const syncRoutes = Router();
syncRoutes.get("/version", getVersions);
