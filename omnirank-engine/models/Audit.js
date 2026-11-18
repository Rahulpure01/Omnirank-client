// models/Audit.js
import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  url: { type: String, required: true, index: true },
  targetKeyword: { type: String, required: true },
  seoScore: { type: Number, min: 0, max: 100, required: true },
  aeoScore: { type: Number, min: 0, max: 100, required: true },
  geoScore: { type: Number, min: 0, max: 100, required: true },
  report: { type: Object, required: true },
}, { timestamps: true });

auditSchema.index({ createdAt: -1 });
export default mongoose.model("Audit", auditSchema);