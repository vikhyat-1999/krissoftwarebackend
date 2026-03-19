const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    username: {
      type: String,
      unique: true,
      sparse: true   // allows null for some users
    },

    phone: {
      type: String
    },

    role: {
      type: String,
      enum: ["SUPERADMIN", "ADMIN", "ENGINEER"],
      required: true
    },

    location: {
      type: String
    },

    address: {
      type: String
    },

    password: {
      type: String,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
