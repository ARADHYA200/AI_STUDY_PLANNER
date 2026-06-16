import express from "express";
import {
  generatePlan,
  suggestTopics,
  chat,
  getProductivitySuggestions,
} from "../controllers/aiController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/generate-plan", generatePlan);
router.get("/suggest-topics", suggestTopics);
router.post("/chat", chat);
router.get("/suggestions", getProductivitySuggestions);

export default router;
