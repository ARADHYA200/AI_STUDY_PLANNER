import StudyPlan from "../models/StudyPlan.js";

export const getStudyPlans = async (req, res, next) => {
  try {
    const plans = await StudyPlan.find({ userId: req.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: plans,
      count: plans.length,
    });
  } catch (error) {
    next(error);
  }
};

export const createStudyPlan = async (req, res, next) => {
  try {
    const { examDate, subjects, hoursPerDay, difficultyLevel, timetable } = req.body;

    if (!examDate || !subjects || !timetable) {
      return res.status(400).json({
        success: false,
        message: "Exam date, subjects, and timetable are required",
      });
    }

    const plan = await StudyPlan.create({
      userId: req.userId,
      examDate,
      subjects,
      hoursPerDay: hoursPerDay || 4,
      difficultyLevel: difficultyLevel || "Medium",
      timetable,
    });

    res.status(201).json({
      success: true,
      data: plan,
      message: "Study plan created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudyPlan = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Study plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Study plan deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
