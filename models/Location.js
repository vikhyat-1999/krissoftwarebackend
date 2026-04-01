// models/Location.js

const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  locationName: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Prevent duplicates
locationSchema.index(
  { locationName: 1, zipCode: 1 },
  { unique: true }
);

module.exports = mongoose.model("Location", locationSchema);