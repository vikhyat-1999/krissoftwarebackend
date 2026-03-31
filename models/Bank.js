const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: true,
    trim: true
  },

  branchName: {
    type: String,
    required: true,
    trim: true
  },

  ifscCode: {
    type: String,
    required: true,
    uppercase: true,
    unique: true,
    trim: true
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

// 🔥 Prevent duplicate same bank + branch + IFSC
bankSchema.index(
  { bankName: 1, branchName: 1, ifscCode: 1 },
  { unique: true }
);

module.exports = mongoose.model("Bank", bankSchema);