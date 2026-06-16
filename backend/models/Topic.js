import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please provide topic name"],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    estimatedHours: {
      type: Number,
      required: true,
      min: 0.5,
    },
    weightage: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed", "Revised"],
      default: "Not Started",
    },
    hoursSpent: {
      type: Number,
      default: 0,
    },
    performanceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    isRevisionComplete: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Topic", topicSchema);
