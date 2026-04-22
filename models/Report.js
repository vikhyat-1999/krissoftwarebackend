const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({

  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
    unique: true
  },

  formData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  versions: [
    {
      formData: Object,
      editedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      editedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  adminStatus: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  },

  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Report", reportSchema);
