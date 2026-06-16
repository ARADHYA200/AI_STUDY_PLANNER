import StudySession from "../models/StudySession.js";
import Schedule from "../models/Schedule.js";
import Topic from "../models/Topic.js";
import Subject from "../models/Subject.js";
import { readjustSchedule } from "../utils/schedulingAlgorithm.js";

export const logStudySession = async (req, res, next) => {
  try {
    const {
      scheduleId,
      topicId,
      subjectId,
      completionPercentage,
      performance,
      mood,
      distractions,
      notes,
    } = req.body;

    // Validation
    if (!scheduleId || !topicId || !subjectId) {
      return res.status(400).json({
        success: false,
        message: "Schedule ID, Topic ID, and Subject ID are required",
      });
    }

    // Verify the schedule belongs to the user
    const schedule = await Schedule.findOne({
      _id: scheduleId,
      userId: req.userId,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    // Create study session
    const session = await StudySession.create({
      userId: req.userId,
      scheduleId,
      topicId,
      subjectId,
      startTime: new Date(),
      endTime: new Date(),
      duration: schedule.duration,
      completionPercentage: completionPercentage || 100,
      performance: performance || 5,
      mood: mood || "Average",
      distractions: distractions || 0,
      notes: notes || "",
    });

    // Update topic progress
    const topic = await Topic.findById(topicId);
    if (topic) {
      topic.hoursSpent = (topic.hoursSpent || 0) + schedule.duration;
      topic.performanceScore =
        ((topic.performanceScore || 0) + (performance || 5)) / 2;

      if (completionPercentage >= 100) {
        topic.status = "Completed";
      }
      await topic.save();
    }

    // Update subject progress hours
    const subject = await Subject.findById(subjectId);
    if (subject) {
      subject.hoursCompleted = (subject.hoursCompleted || 0) + schedule.duration;
      await subject.save();

      // Recalculate progress metrics and predicted readiness score
      const topics = await Topic.find({ subjectId });
      const totalTopics = topics.length;
      const completedTopics = topics.filter(t => t.status === "Completed").length;
      const compPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      const subjectSessions = await StudySession.find({ userId: req.userId, subjectId });
      const avgPerf = subjectSessions.length > 0
        ? subjectSessions.reduce((sum, s) => sum + s.performance, 0) / subjectSessions.length
        : 5;

      const readinessScore = Math.min(Math.round((compPercent * 0.7) + (avgPerf * 10 * 0.3)), 100);

      // Upsert Progress collection details
      const Progress = (await import("../models/Progress.js")).default;
      await Progress.findOneAndUpdate(
        { userId: req.userId, subjectId },
        {
          $set: {
            completionPercentage: compPercent,
            hoursSpent: subject.hoursCompleted,
            predictedReadinessScore: readinessScore,
            lastStudiedAt: new Date(),
          }
        },
        { upsert: true, new: true }
      );
    }

    // Mark schedule as completed
    schedule.isCompleted = true;
    schedule.completedAt = new Date();
    schedule.performanceRating = performance || 5;
    await schedule.save();

    res.status(201).json({
      success: true,
      data: session,
      message: "Study session logged successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionHistory = async (req, res, next) => {
  try {
    const { startDate, endDate, topicId, subjectId, limit = 20, page = 1 } =
      req.query;

    let filter = { userId: req.userId };

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (topicId) filter.topicId = topicId;
    if (subjectId) filter.subjectId = subjectId;

    const skip = (page - 1) * limit;

    const sessions = await StudySession.find(filter)
      .populate("topicId", "name difficulty")
      .populate("subjectId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StudySession.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        sessions,
        pagination: {
          total,
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTopicProgress = async (req, res, next) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findById(topicId);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    // Get session history for topic
    const sessions = await StudySession.find({
      topicId,
      userId: req.userId,
    }).sort({ createdAt: -1 });

    const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0);
    const averagePerformance =
      sessions.length > 0
        ? sessions.reduce((sum, s) => sum + s.performance, 0) / sessions.length
        : 0;
    const consecutiveGoodSessions = sessions.filter(
      (s) => s.performance >= 7
    ).length;

    res.status(200).json({
      success: true,
      data: {
        topic,
        hoursSpent: totalHours,
        sessionsCompleted: sessions.length,
        averagePerformance: Math.round(averagePerformance * 10) / 10,
        consecutiveGoodSessions,
        recentSessions: sessions.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSubjectProgress = async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    // Get subject with topics
    const subject = await Subject.findOne({
      _id: subjectId,
      userId: req.userId,
    }).populate("topics");

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Calculate progress for each topic
    const topicProgress = await Promise.all(
      subject.topics.map(async (topic) => {
        const sessions = await StudySession.find({
          topicId: topic._id,
          userId: req.userId,
        });

        const hoursSpent = sessions.reduce((sum, s) => sum + s.duration, 0);
        const avgPerformance =
          sessions.length > 0
            ? sessions.reduce((sum, s) => sum + s.performance, 0) / sessions.length
            : 0;

        return {
          topicId: topic._id,
          name: topic.name,
          status: topic.status,
          estimatedHours: topic.estimatedHours,
          hoursSpent,
          sessionsCompleted: sessions.length,
          averagePerformance: Math.round(avgPerformance * 10) / 10,
          completionPercent: Math.min(
            Math.round((hoursSpent / topic.estimatedHours) * 100),
            100
          ),
        };
      })
    );

    const totalHours = topicProgress.reduce((sum, t) => sum + t.hoursSpent, 0);
    const completedTopics = topicProgress.filter(
      (t) => t.status === "Completed"
    ).length;
    const overallProgress = Math.round(
      (completedTopics / topicProgress.length) * 100
    );

    res.status(200).json({
      success: true,
      data: {
        subject,
        topicProgress,
        summary: {
          totalTopics: topicProgress.length,
          completedTopics,
          totalHours,
          overallProgress,
          daysUntilExam: subject.examDate
            ? Math.ceil(
                (new Date(subject.examDate) - new Date()) /
                  (1000 * 60 * 60 * 24)
              )
            : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDailyAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = { userId: req.userId };

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const sessions = await StudySession.find(filter)
      .populate("subjectId", "name")
      .populate("topicId", "name");

    // Group by date
    const dailyData = {};
    sessions.forEach((session) => {
      const dateKey = session.createdAt.toISOString().split("T")[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          totalHours: 0,
          sessions: 0,
          subjects: {},
          moods: { Great: 0, Good: 0, Average: 0, Poor: 0 },
          avgPerformance: 0,
        };
      }

      dailyData[dateKey].totalHours += session.duration;
      dailyData[dateKey].sessions += 1;
      dailyData[dateKey].moods[session.mood]++;

      if (!dailyData[dateKey].subjects[session.subjectId._id]) {
        dailyData[dateKey].subjects[session.subjectId._id] = {
          name: session.subjectId.name,
          hours: 0,
        };
      }
      dailyData[dateKey].subjects[session.subjectId._id].hours += session.duration;
    });

    // Calculate averages
    Object.keys(dailyData).forEach((date) => {
      const dayData = dailyData[date];
      dayData.avgPerformance =
        dayData.sessions > 0
          ? sessions
              .filter(
                (s) => s.createdAt.toISOString().split("T")[0] === date
              )
              .reduce((sum, s) => sum + s.performance, 0) / dayData.sessions
          : 0;
      dayData.subjects = Object.values(dayData.subjects);
    });

    // Overall statistics
    const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalSessions = sessions.length;
    const avgPerformance =
      totalSessions > 0
        ? sessions.reduce((sum, s) => sum + s.performance, 0) / totalSessions
        : 0;

    const moodDistribution = {
      Great: sessions.filter((s) => s.mood === "Great").length,
      Good: sessions.filter((s) => s.mood === "Good").length,
      Average: sessions.filter((s) => s.mood === "Average").length,
      Poor: sessions.filter((s) => s.mood === "Poor").length,
    };

    res.status(200).json({
      success: true,
      data: {
        dailyData: Object.values(dailyData),
        summary: {
          totalHours: Math.round(totalHours * 10) / 10,
          totalSessions,
          averageSessionDuration: Math.round((totalHours / totalSessions) * 10) / 10,
          averagePerformance: Math.round(avgPerformance * 10) / 10,
          moodDistribution,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudyStreak = async (req, res, next) => {
  try {
    const sessions = await StudySession.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    if (sessions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          currentStreak: 0,
          longestStreak: 0,
          streakDates: [],
        },
      });
    }

    // Get unique study dates
    const studyDates = new Set();
    sessions.forEach((session) => {
      const dateKey = session.createdAt.toISOString().split("T")[0];
      studyDates.add(dateKey);
    });

    const sortedDates = Array.from(studyDates)
      .sort()
      .reverse();

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = new Date(sortedDates[0]);

    sortedDates.forEach((dateStr) => {
      const currentDate = new Date(dateStr);
      const daysDiff = Math.floor(
        (lastDate - currentDate) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        tempStreak++;
      } else if (daysDiff === 0) {
        return;
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1;
      }
      lastDate = currentDate;
    });

    // Check if current streak is continuing
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      currentStreak = tempStreak + 1;
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    res.status(200).json({
      success: true,
      data: {
        currentStreak,
        longestStreak,
        totalStudyDays: studyDates.size,
        streakDates: sortedDates.slice(0, 30), // Last 30 days
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPerformanceTrend = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await StudySession.find({
      userId: req.userId,
      createdAt: { $gte: startDate },
    }).sort({ createdAt: 1 });

    // Group by date
    const trendData = {};
    sessions.forEach((session) => {
      const dateKey = session.createdAt.toISOString().split("T")[0];
      if (!trendData[dateKey]) {
        trendData[dateKey] = [];
      }
      trendData[dateKey].push(session.performance);
    });

    // Calculate daily averages
    const trend = Object.entries(trendData).map(([date, performances]) => ({
      date,
      avgPerformance: Math.round(
        (performances.reduce((a, b) => a + b, 0) / performances.length) * 10
      ) / 10,
      sessionsCount: performances.length,
    }));

    // Calculate trend direction
    const firstHalf = trend.slice(0, Math.floor(trend.length / 2));
    const secondHalf = trend.slice(Math.floor(trend.length / 2));

    const firstHalfAvg =
      firstHalf.length > 0
        ? firstHalf.reduce((sum, t) => sum + t.avgPerformance, 0) /
          firstHalf.length
        : 0;
    const secondHalfAvg =
      secondHalf.length > 0
        ? secondHalf.reduce((sum, t) => sum + t.avgPerformance, 0) /
          secondHalf.length
        : 0;

    const improvement =
      firstHalfAvg > 0
        ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        trend,
        summary: {
          daysAnalyzed: trend.length,
          overallAverage: Math.round(
            (trend.reduce((sum, t) => sum + t.avgPerformance, 0) / trend.length) *
              10
          ) / 10,
          improvementPercent: improvement,
          trendDirection: improvement > 0 ? "improving" : "declining",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
