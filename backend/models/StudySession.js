import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    notes: String,
    performance: {
      type: Number,
      min: 1,
      max: 10,
    },
    mood: {
      type: String,
      enum: ["Great", "Good", "Average", "Poor"],
    },
    distractions: {
      type: Number,
      min: 0,
      max: 10,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
studySessionSchema.index({ userId: 1, createdAt: -1 });
studySessionSchema.index({ subjectId: 1, topicId: 1 });

export default mongoose.model("StudySession", studySessionSchema);
