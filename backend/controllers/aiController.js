import {
  aiGenerateStudyPlan,
  aiSuggestTopics,
  aiChatResponse,
  aiProductivitySuggestions,
} from "../utils/ai.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import Topic from "../models/Topic.js";
import Schedule from "../models/Schedule.js";
import Task from "../models/Task.js";
import StudySession from "../models/StudySession.js";

/**
 * Generate Study Plan
 * POST /api/ai/generate-plan
 */
export const generatePlan = async (req, res, next) => {
  try {
    const { examDate, subjects, hoursPerDay, difficultyLevel } = req.body;

    if (!examDate || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Exam date and subjects list are required",
      });
    }

    const timetable = await aiGenerateStudyPlan({
      examDate: new Date(examDate),
      subjects,
      hoursPerDay: hoursPerDay || 4,
      difficultyLevel: difficultyLevel || "Medium",
    });

    // Clear existing uncompleted schedules first to prevent AI overlaps
    await Schedule.deleteMany({ userId: req.userId, isCompleted: false });

    // Save generated items into MongoDB automatically
    for (const item of timetable) {
      const parts = item.topic.split(" - ");
      const subjectName = parts[0]?.trim() || subjects[0] || "General";
      const topicName = parts.slice(1).join(" - ")?.trim() || "Deep Work Review";

      // 1. Get or create subject
      let subject = await Subject.findOne({ userId: req.userId, name: subjectName });
      if (!subject) {
        subject = await Subject.create({
          userId: req.userId,
          name: subjectName,
          examDate: new Date(examDate),
          totalHours: 20,
          difficulty: difficultyLevel || "Medium",
        });
      }

      // 2. Get or create topic
      let topic = await Topic.findOne({ subjectId: subject._id, name: topicName });
      if (!topic) {
        topic = await Topic.create({
          subjectId: subject._id,
          name: topicName,
          estimatedHours: item.duration || hoursPerDay || 2,
          difficulty: difficultyLevel || "Medium",
        });
        subject.topics.push(topic._id);
        await subject.save();
      }

      // 3. Create schedule entry for this day
      const dayNum = parseInt(item.day.replace(/\D/g, "")) || 1;
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + (dayNum - 1));

      // Avoid duplication
      const existingSchedule = await Schedule.findOne({
        userId: req.userId,
        topicId: topic._id,
        scheduledDate: {
          $gte: new Date(new Date(scheduledDate).setHours(0, 0, 0, 0)),
          $lte: new Date(new Date(scheduledDate).setHours(23, 59, 59, 999))
        }
      });

      if (!existingSchedule) {
        await Schedule.create({
          userId: req.userId,
          subjectId: subject._id,
          topicId: topic._id,
          scheduledDate,
          startTime: "09:00",
          endTime: "11:00",
          duration: item.duration || 2,
          type: "Learning",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: timetable,
      message: "AI study plan generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Syllabus breakdown / Suggest topics
 * GET /api/ai/suggest-topics
 */
export const suggestTopics = async (req, res, next) => {
  try {
    const { subjectName } = req.query;

    if (!subjectName) {
      return res.status(400).json({
        success: false,
        message: "Subject name is required",
      });
    }

    const topics = await aiSuggestTopics(subjectName);

    res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Context-aware AI Chat Assistant
 * POST /api/ai/chat
 */
export const chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Fetch user context
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const subjects = await Subject.find({ userId: req.userId }).populate("topics");
    const schedules = await Schedule.find({ userId: req.userId })
      .populate("subjectId", "name")
      .populate("topicId", "name");
    const tasks = await Task.find({ userId: req.userId });

    const reply = await aiChatResponse(message, {
      user,
      subjects,
      schedules,
      tasks,
    });

    res.status(200).json({
      success: true,
      data: reply,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze study history and return productivity suggestions
 * GET /api/ai/suggestions
 */
export const getProductivitySuggestions = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const subjects = await Subject.find({ userId: req.userId });
    const sessions = await StudySession.find({ userId: req.userId })
      .populate("subjectId", "name")
      .populate("topicId", "name");

    const suggestions = await aiProductivitySuggestions({
      user,
      subjects,
      sessions,
    });

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};
