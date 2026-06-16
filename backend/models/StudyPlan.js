import mongoose from "mongoose";

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
    subjects: [
      {
        type: String,
      },
    ],
    hoursPerDay: {
      type: Number,
      default: 4,
    },
    difficultyLevel: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    timetable: [
      {
        day: String,
        topic: String,
        duration: Number,
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Completed", "Archived"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("StudyPlan", studyPlanSchema);
