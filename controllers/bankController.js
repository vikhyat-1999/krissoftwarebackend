// controllers/bankController.js

const Bank = require("../models/Bank");

// ➤ Add Bank
exports.createBank = async (req, res) => {
  try {
    const { bankName, branchName, ifscCode } = req.body;

    const bank = await Bank.create({
      bankName,
      branchName,
      ifscCode
    });

    res.status(201).json({
      message: "Bank added successfully",
      bank
    });

  } catch (err) {

    // duplicate IFSC error
    if (err.code === 11000) {
      return res.status(400).json({
        message: "IFSC already exists"
      });
    }

    res.status(500).json({ message: "Server error" });
  }
};


// ➤ Get all banks (for dropdown)
exports.getBanks = async (req, res) => {
  try {

    const banks = await Bank.find({ isActive: true });

    res.json({ banks });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateBank = async (req, res) => {
  try {
    const updatedBank = await Bank.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedBank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    res.json(updatedBank);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
