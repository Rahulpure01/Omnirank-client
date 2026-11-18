// models/WeeklySubscriber.js
import mongoose from "mongoose";

const weeklySubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    domain: {
      type: String,
      default: "sayasample.com",
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.WeeklySubscriber ||
  mongoose.model("WeeklySubscriber", weeklySubscriberSchema);

