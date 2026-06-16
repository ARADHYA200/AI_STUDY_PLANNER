import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config.js";

const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRE });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, studyGoal, studyLevel } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Sanitization & Trim
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    // Email Validation Regex
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Password Validation
    if (cleanPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      studyGoal: studyGoal || "Exam Preparation",
      studyLevel: studyLevel || "Intermediate",
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          studyGoal: user.studyGoal,
          studyLevel: user.studyLevel,
          preferences: user.preferences,
        },
        token,
      },
      message: "Registration successful",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  console.log("BODY:", req.body);

  try {
    const { email, password } = req.body;

    console.log("EMAIL:", email);
    console.log("PASSWORD:", password);

    const user = await User.findOne({ email }).select("+password");

    console.log("USER FOUND:", user ? "YES" : "NO");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          studyGoal: user.studyGoal,
          studyLevel: user.studyLevel,
          preferences: user.preferences,
        },
        token,
      },
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const { theme, dailyGoalHours, notificationsEnabled, studyGoal, studyLevel } = req.body;

    const updateFields = { $set: {} };
    if (theme !== undefined) updateFields.$set["preferences.theme"] = theme;
    if (dailyGoalHours !== undefined) updateFields.$set["preferences.dailyGoalHours"] = Number(dailyGoalHours);
    if (notificationsEnabled !== undefined) updateFields.$set["preferences.notificationsEnabled"] = notificationsEnabled;
    if (studyGoal !== undefined) updateFields.$set.studyGoal = studyGoal;
    if (studyLevel !== undefined) updateFields.$set.studyLevel = studyLevel;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user,
      message: "Preferences updated",
    });
  } catch (error) {
    next(error);
  }
};
