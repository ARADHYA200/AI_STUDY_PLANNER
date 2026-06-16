import express from "express";
import {
  logStudySession,
  getSessionHistory,
  getTopicProgress,
  getSubjectProgress,
  getDailyAnalytics,
  getStudyStreak,
  getPerformanceTrend,
} from "../controllers/progressController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/session", authMiddleware, logStudySession);
router.get("/history", authMiddleware, getSessionHistory);
router.get("/topic/:topicId", authMiddleware, getTopicProgress);
router.get("/subject/:subjectId", authMiddleware, getSubjectProgress);
router.get("/analytics/daily", authMiddleware, getDailyAnalytics);
router.get("/streak", authMiddleware, getStudyStreak);
router.get("/trend", authMiddleware, getPerformanceTrend);

export default router;
