const express = require("express");
const router = express.Router();
const { createJob,getMyJobs,getAdminJobs,getJobById,assignJobToEngineer,getAllJobsForSuperAdmin } = require("../controllers/jobController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.post(
  "/create",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERADMIN"),
  createJob
);
router.get(
  "/my-jobs",
  verifyToken,
  authorizeRoles("ENGINEER"),
  getMyJobs
);
router.get(
  "/admin-jobs",
  verifyToken,
  getAdminJobs
);
router.get(
  "/all",
  verifyToken,
  authorizeRoles("SUPERADMIN"),
  getAllJobsForSuperAdmin
);
router.get("/:id", verifyToken,getJobById);
router.put(
  "/assign/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERADMIN"),
  assignJobToEngineer
);
module.exports = router;

