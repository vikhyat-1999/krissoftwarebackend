
const express = require("express");
const router = express.Router();
const { createUser,getEngineersByCity,getAdminsByCity,getRegisteredUsers } = require("../controllers/userController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const { getMyJobs } = require("../controllers/jobController");

router.post(
  "/create",
  verifyToken,
  authorizeRoles("SUPERADMIN", "ADMIN"),
  createUser
);
router.get(
  "/my-jobs",
  verifyToken,
  authorizeRoles("ENGINEER"),
  getMyJobs
);
router.get(
  "/engineers-by-city",
  verifyToken,
  authorizeRoles("ADMIN"),
  getEngineersByCity
);
router.get(
  "/admins-by-city",
  verifyToken,
  authorizeRoles("SUPERADMIN"),
  getAdminsByCity
);
router.get(
  "/getRegisteredUsers",
  verifyToken,
  authorizeRoles("SUPERADMIN", "ADMIN"),
  getUsers
);
module.exports = router;

