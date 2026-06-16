import express from "express";
import {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  addTopicsToSubject,
} from "../controllers/subjectController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, createSubject);
router.get("/", authMiddleware, getSubjects);
router.get("/:id", authMiddleware, getSubjectById);
router.put("/:id", authMiddleware, updateSubject);
router.delete("/:id", authMiddleware, deleteSubject);
router.post("/:id/topics", authMiddleware, addTopicsToSubject);

export default router;
