const mongoose = require("mongoose");

// const jobSchema = new mongoose.Schema(
//   {
//     leadId: {
//       type: String,
//       required: true,
//       unique: true
//     },

//     applicantName: {
//       type: String,
//       required: true
//     },

//     assignedTo: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },

//     assignedDate: {
//       type: Date,
//       default: Date.now
//     },

//     siteVisitStatus: {
//       type: String,
//       enum: ["PENDING", "VISITED"],
//       default: "PENDING"
//     },

//     reportStatus: {
//       type: String,
//       enum: ["NOT_SUBMITTED", "SUBMITTED"],
//       default: "NOT_SUBMITTED"
//     }

//   },
//   { timestamps: true }
// );
const jobSchema = new mongoose.Schema(
{
  leadId: {
    type: String,
    required: true,
    unique: true
  },

  applicantName: {
    type: String,
    required: true
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  assignedDate: {
    type: Date,
    default: Date.now
  },

  siteVisitStatus: {
    type: String,
    enum: ["PENDING", "VISITED"],
    default: "PENDING"
  },

  reportStatus: {
    type: String,
    enum: ["NOT_SUBMITTED", "SUBMITTED"],
    default: "NOT_SUBMITTED"
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);