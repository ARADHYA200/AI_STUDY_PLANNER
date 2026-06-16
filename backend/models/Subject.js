import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please provide subject name"],
      trim: true,
    },
    description: String,
    studyGoal: {
      type: String,
      trim: true,
    },
    examDate: {
      type: Date,
      required: [true, "Please provide exam date"],
    },
    totalHours: {
      type: Number,
      required: [true, "Please provide total study hours needed"],
      min: 1,
    },
    priority: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    difficulty: {
      type: String,
      enum: {
        values: ["Easy", "Medium", "Hard"],
        message: "Difficulty must be Easy, Medium, or Hard",
      },
      default: "Medium",
    },
    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
    hoursCompleted: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

subjectSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("Subject", subjectSchema);
