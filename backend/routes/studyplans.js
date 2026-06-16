import express from "express";
import {
  getStudyPlans,
  createStudyPlan,
  deleteStudyPlan,
} from "../controllers/studyPlanController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getStudyPlans);
router.post("/", createStudyPlan);
router.delete("/:id", deleteStudyPlan);

export default router;
