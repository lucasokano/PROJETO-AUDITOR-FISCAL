import type { Request, Response } from "express";
import { getSyncVersions } from "./sync.service.js";

export async function getVersions(_request: Request, response: Response) {
  response.json(await getSyncVersions());
}
