const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: String,
  message: String,
  type: {
    type: String,
    enum: ["JOB_ASSIGNED", "REPORT_APPROVED", "REPORT_REJECTED"]
  },
  isRead: {
    type: Boolean,
    default: false
  },
  jobId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Job"
}
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
