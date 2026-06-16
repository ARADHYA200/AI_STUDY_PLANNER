import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
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
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    hoursSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    predictedReadinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastStudiedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes
progressSchema.index({ userId: 1, subjectId: 1 }, { unique: true });

export default mongoose.model("Progress", progressSchema);
