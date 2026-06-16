import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}$/, "Please provide time in HH:MM format"],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}$/, "Please provide time in HH:MM format"],
    },
    duration: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["Learning", "Revision"],
      default: "Learning",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    isLocked: {
      type: Boolean,
      default: false,
    },
    notes: String,
    performanceRating: {
      type: Number,
      min: 1,
      max: 10,
      default: null,
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

// Index for efficient queries
scheduleSchema.index({ userId: 1, scheduledDate: 1 });
scheduleSchema.index({ userId: 1, subjectId: 1 });

export default mongoose.model("Schedule", scheduleSchema);
