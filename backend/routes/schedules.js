import express from "express";
import {
  generateSchedule,
  getSchedules,
  updateSchedule,
  completeSchedule,
  deleteSchedule,
  getScheduleStats,
} from "../controllers/scheduleController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/generate", authMiddleware, generateSchedule);
router.get("/", authMiddleware, getSchedules);
router.get("/stats", authMiddleware, getScheduleStats);
router.put("/:id", authMiddleware, updateSchedule);
router.put("/:id/complete", authMiddleware, completeSchedule);
router.delete("/:id", authMiddleware, deleteSchedule);

export default router;
