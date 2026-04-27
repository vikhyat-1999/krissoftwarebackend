const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
  try {

    const { name, email, username, phone, role, location, address, password } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Only SUPERADMIN can create ADMIN
    if (role === "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Only Superadmin can create Admin" });
    }

    // ADMIN can create only ENGINEER
    if (req.user.role === "ADMIN" && role !== "ENGINEER") {
      return res.status(403).json({ message: "Admin can only create Engineer" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      username,
      phone,
      role,
      location,
      address,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User created successfully",
      user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getEngineersByCity = async (req, res) => {

  const { city } = req.query;

  const engineers = await User.find({
    role: "ENGINEER",
    location: city
  }).select("name");

  res.json({ engineers });
};
exports.getAdminsByCity = async (req, res) => {
  const { city } = req.query;

  let filter = { role: "ADMIN" };

  if (city && city !== "ALL") {
    filter.location = city;
  }

  const admins = await User.find(filter)
    .select("name _id location");

  res.json({ admins });
};
exports.getRegisteredUsers = async (req, res) => {
  try {
    const { role, location } = req.user;
    console.log(req.user);
    let users;

    if (role === "SUPERADMIN") {
      users = await User.find();
    } 
    
    else if (role === "ADMIN") {
      users = await User.find({
        role: "ENGINEER",
        location: location // 🔥 key part
      });
    } 
    
    else {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.json(users);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.toggleUserStatus = async (req, res) => {
  try {
    let { isActive } = req.body;

    // 🔥 ensure boolean (extra safety)
    if (typeof isActive !== "boolean") {
      isActive = isActive === "true";
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = isActive;
    await user.save();

    res.json({ message: "Updated", isActive: user.isActive });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      username,
      phone,
      address,
      password
    } = req.body;

    // 🔥 Build update object dynamically
    const updateData = {};

    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    // 🔒 Handle password separately
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // 🔥 Update only provided fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password"); // never return password

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateUserByAdmin = async (req, res) => {
  try {
    const userId = req.params.id;

    const { name, email, phone, password } = req.body;

    const updateData = {};

    // ✅ Update only provided fields
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    // 🔐 Password handling (IMPORTANT)
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password"); // 🔥 never send password

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getAllEngineers = async (req, res) => {
  try {
    const engineers = await User.find({ role: "ENGINEER" })
      .select("name");

    res.json({ engineers });
  } catch (err) {
    res.status(500).json({ message: "Error fetching engineers" });
  }
};
