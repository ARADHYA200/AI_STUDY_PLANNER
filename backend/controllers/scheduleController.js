import Schedule from "../models/Schedule.js";
import Subject from "../models/Subject.js";
import Topic from "../models/Topic.js";
import User from "../models/User.js";
import { generateStudySchedule, readjustSchedule } from "../utils/schedulingAlgorithm.js";

export const generateSchedule = async (req, res, next) => {
  try {
    const inputSubjectIds = req.body.subjectIds || req.body.selectedSubjects;
    const { startDate, endDate, hoursPerDay } = req.body;

    // Validation
    if (!inputSubjectIds || !Array.isArray(inputSubjectIds) || inputSubjectIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of subject IDs",
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide start date and end date",
      });
    }

    // Fetch user's subjects
    const subjects = await Subject.find({
      _id: { $in: inputSubjectIds },
      userId: req.userId,
    }).populate("topics");

    if (subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Subjects not found",
      });
    }

    // Get user preferences
    const user = await User.findById(req.userId);
    const dailyHours = Number(hoursPerDay) || user?.preferences?.dailyGoalHours || 2;

    // Generate schedule
    const generatedSchedule = generateStudySchedule(
      subjects,
      dailyHours,
      new Date(startDate),
      new Date(endDate)
    );

    // Clear existing uncompleted schedules for this user
    await Schedule.deleteMany({ userId: req.userId, isCompleted: false });

    // Save schedule to database
    const scheduleDocuments = [];
    generatedSchedule.schedule.forEach((item) => {
      item.sessions?.forEach((session) => {
        scheduleDocuments.push({
          userId: req.userId,
          subjectId: item.subjectId,
          topicId: item.topicId,
          scheduledDate: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          duration: session.duration,
          type: session.type,
        });
      });
    });

    if (scheduleDocuments.length > 0) {
      await Schedule.insertMany(scheduleDocuments);
    }

    // Save revision schedule
    generatedSchedule.revisionSchedule.forEach(async (revision) => {
      await Schedule.create({
        userId: req.userId,
        subjectId: revision.subjectId,
        topicId: revision.topicId,
        scheduledDate: revision.revisionDate,
        startTime: "14:00", // Default afternoon slot
        endTime: "14:30",
        duration: 0.5,
        type: "Revision",
      });
    });

    res.status(201).json({
      success: true,
      data: {
        schedule: generatedSchedule.schedule,
        revisions: generatedSchedule.revisionSchedule,
        summary: {
          totalScheduledHours: generatedSchedule.totalScheduledHours,
          estimatedCompletionDate: generatedSchedule.estimatedCompletionDate,
          numberOfSubjects: subjects.length,
          numberOfTopics: scheduleDocuments.length,
        },
      },
      message: "Schedule generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getSchedules = async (req, res, next) => {
  try {
    const { startDate, endDate, subjectId } = req.query;

    let filter = { userId: req.userId };

    if (startDate && endDate) {
      filter.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (subjectId) {
      filter.subjectId = subjectId;
    }

    const schedules = await Schedule.find(filter)
      .populate("subjectId", "name")
      .populate("topicId", "name difficulty")
      .sort({ scheduledDate: 1 });

    // Group schedules by date
    const groupedSchedules = {};
    schedules.forEach((schedule) => {
      const dateKey = schedule.scheduledDate.toISOString().split("T")[0];
      if (!groupedSchedules[dateKey]) {
        groupedSchedules[dateKey] = [];
      }
      groupedSchedules[dateKey].push(schedule);
    });

    res.status(200).json({
      success: true,
      data: {
        schedules,
        grouped: groupedSchedules,
        total: schedules.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (req, res, next) => {
  try {
    const { newDate, newStartTime, newEndTime } = req.body;

    const schedule = await Schedule.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        $set: {
          scheduledDate: newDate || undefined,
          startTime: newStartTime || undefined,
          endTime: newEndTime || undefined,
        },
      },
      { new: true, runValidators: true }
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    res.status(200).json({
      success: true,
      data: schedule,
      message: "Schedule updated",
    });
  } catch (error) {
    next(error);
  }
};

export const completeSchedule = async (req, res, next) => {
  try {
    const { performanceRating, notes } = req.body;

    const schedule = await Schedule.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        $set: {
          isCompleted: true,
          completedAt: new Date(),
          performanceRating: performanceRating || undefined,
          notes: notes || undefined,
        },
      },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    // Update topic status if all sessions completed
    const topic = await Topic.findById(schedule.topicId);
    const incompletedSessions = await Schedule.findOne({
      topicId: schedule.topicId,
      isCompleted: false,
    });

    if (!incompletedSessions) {
      topic.status = "Completed";
      await topic.save();
    }

    res.status(200).json({
      success: true,
      data: schedule,
      message: "Session marked as completed",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Schedule deleted",
    });
  } catch (error) {
    next(error);
  }
};

export const getScheduleStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = { userId: req.userId };

    if (startDate && endDate) {
      filter.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Get statistics
    const totalSchedules = await Schedule.countDocuments(filter);
    const completedSchedules = await Schedule.countDocuments({
      ...filter,
      isCompleted: true,
    });
    const learningSchedules = await Schedule.countDocuments({
      ...filter,
      type: "Learning",
    });
    const revisionSchedules = await Schedule.countDocuments({
      ...filter,
      type: "Revision",
    });

    const completionRate =
      totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 0;

    // Get hours statistics
    const schedules = await Schedule.find(filter);
    const totalHours = schedules.reduce((sum, s) => sum + s.duration, 0);
    const completedHours = schedules
      .filter((s) => s.isCompleted)
      .reduce((sum, s) => sum + s.duration, 0);

    res.status(200).json({
      success: true,
      data: {
        totalSchedules,
        completedSchedules,
        completionRate,
        learningSchedules,
        revisionSchedules,
        totalHours,
        completedHours,
        remainingHours: totalHours - completedHours,
      },
    });
  } catch (error) {
    next(error);
  }
};
