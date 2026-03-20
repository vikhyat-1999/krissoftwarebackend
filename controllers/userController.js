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

    if (role === "SUPER_ADMIN") {
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
  const { isActive } = req.body;

  const user = await User.findById(req.params.id);
  user.isActive = isActive;

  await user.save();

  res.json({ message: "Updated" });
};
