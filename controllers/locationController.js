// controllers/locationController.js

const Location = require("../models/Location");

// ➤ Add location
exports.createLocation = async (req, res) => {
  try {

    const { locationName, zipCode } = req.body;

    const location = await Location.create({
      locationName,
      zipCode
    });

    res.status(201).json({
      message: "Location added successfully",
      location
    });

  } catch (err) {

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Location already exists"
      });
    }

    res.status(500).json({ message: "Server error" });
  }
};


// ➤ Get all locations (for dropdown)
exports.getLocations = async (req, res) => {
  try {

    const locations = await Location.find({ isActive: true });

    res.json({ locations });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.deleteLocation = async (req, res) => {
  try {

    const { id } = req.params;

    await Location.findByIdAndDelete(id);

    res.json({ message: "Location deleted" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateLocation = async (req, res) => {
  try {
    const updated = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
