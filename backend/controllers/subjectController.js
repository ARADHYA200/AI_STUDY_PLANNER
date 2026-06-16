import Subject from "../models/Subject.js";
import Topic from "../models/Topic.js";

function normalizeSubjectInput(body) {
  const name = body.name?.trim();
  const studyGoal = body.studyGoal?.trim();
  const description = body.description?.trim() || studyGoal || "";
  const examDate = body.examDate || body.targetDate;
  const totalHours = Number(body.totalHours) || 20;
  const priority = body.priority || 3;
  const difficulty = body.difficulty || "Medium";
  const topics = body.topics;

  return {
    name,
    description,
    studyGoal: studyGoal || description,
    examDate,
    totalHours,
    priority,
    difficulty,
    topics,
  };
}

export const createSubject = async (req, res, next) => {
  try {
    const {
      name,
      description,
      studyGoal,
      examDate,
      totalHours,
      priority,
      difficulty,
      topics,
    } = normalizeSubjectInput(req.body);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Subject name is required",
      });
    }

    if (!studyGoal && !description) {
      return res.status(400).json({
        success: false,
        message: "Study goal is required",
      });
    }

    const resolvedExamDate = examDate
      ? new Date(examDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (Number.isNaN(resolvedExamDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid target date",
      });
    }

    const existingSubject = await Subject.findOne({
      userId: req.userId,
      name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: "A subject with this name already exists",
      });
    }

    const subject = await Subject.create({
      userId: req.userId,
      name,
      description,
      studyGoal,
      examDate: resolvedExamDate,
      totalHours: totalHours > 0 ? totalHours : 20,
      priority,
      difficulty,
    });

    if (topics && Array.isArray(topics) && topics.length > 0) {
      const createdTopics = await Topic.insertMany(
        topics.map((topic) => ({
          subjectId: subject._id,
          name: topic.name,
          difficulty: topic.difficulty || "Medium",
          estimatedHours: topic.estimatedHours || 2,
          weightage: topic.weightage || 50,
        }))
      );

      subject.topics = createdTopics.map((t) => t._id);
      await subject.save();
    }

    const populatedSubject = await subject.populate("topics");

    res.status(201).json({
      success: true,
      data: populatedSubject,
      message: "Subject created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A subject with this name already exists",
      });
    }
    next(error);
  }
};

export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ userId: req.userId }).populate("topics");

    res.status(200).json({
      success: true,
      data: subjects,
      count: subjects.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate("topics");

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const normalized = normalizeSubjectInput(req.body);
    const { status } = req.body;

    const updateData = {};
    if (normalized.name) updateData.name = normalized.name;
    if (req.body.description !== undefined) updateData.description = normalized.description;
    if (req.body.studyGoal !== undefined) updateData.studyGoal = normalized.studyGoal;
    if (normalized.examDate) updateData.examDate = new Date(normalized.examDate);
    if (req.body.totalHours !== undefined) updateData.totalHours = normalized.totalHours;
    if (req.body.priority !== undefined) updateData.priority = normalized.priority;
    if (req.body.difficulty !== undefined) updateData.difficulty = normalized.difficulty;
    if (status !== undefined) updateData.status = status;

    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("topics");

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
      message: "Subject updated",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A subject with this name already exists",
      });
    }
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    await Topic.deleteMany({ subjectId: subject._id });

    res.status(200).json({
      success: true,
      message: "Subject deleted",
    });
  } catch (error) {
    next(error);
  }
};

export const addTopicsToSubject = async (req, res, next) => {
  try {
    let { topics } = req.body;

    if (!topics) {
      const { name, estimatedHours, difficulty, weightage } = req.body;
      if (name) {
        topics = [{ name, estimatedHours, difficulty, weightage }];
      }
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one topic",
      });
    }

    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    const createdTopics = await Topic.insertMany(
      topics.map((topic) => ({
        subjectId: subject._id,
        name: topic.name,
        difficulty: topic.difficulty || "Medium",
        estimatedHours: Number(topic.estimatedHours) || 2,
        weightage: topic.weightage || 50,
      }))
    );

    subject.topics.push(...createdTopics.map((t) => t._id));
    await subject.save();

    const populatedSubject = await subject.populate("topics");

    res.status(200).json({
      success: true,
      data: populatedSubject,
      message: "Topics added successfully",
    });
  } catch (error) {
    next(error);
  }
};
