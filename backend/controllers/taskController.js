import Task from "../models/Task.js";

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, subject, deadline } = req.body;

    if (!title || !subject || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Title, subject, and deadline are required",
      });
    }

    const task = await Task.create({
      userId: req.userId,
      title,
      description,
      priority: priority || "Medium",
      subject,
      deadline,
    });

    res.status(201).json({
      success: true,
      data: task,
      message: "Task created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, subject, deadline, status } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        $set: {
          title,
          description,
          priority,
          subject,
          deadline,
          status,
        },
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      data: task,
      message: "Task updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
