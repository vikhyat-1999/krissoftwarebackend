const express = require("express");
const router = express.Router();
const { submitReport,getSubmittedReports,adminAction,getSingleReport,toggleEditable,getApprovedReportsForSuperAdmin,getReportByJobId,updateReport,getReportVersions} = require("../controllers/reportController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// router.post(
//   "/submit",
//   verifyToken,
//   authorizeRoles("ENGINEER"),
//   submitReport
// );
router.post(
  "/submit",
  verifyToken,
  upload.array("photos", 20), 
  authorizeRoles("ENGINEER"),  // 👈 multer middleware
  submitReport
);
router.get(
  "/submitted",
  verifyToken,
  authorizeRoles("ADMIN"),
  getSubmittedReports
);
router.put(
  "/admin-action/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  adminAction
);
router.get(
  "/superadmin-approved",
  verifyToken,
  authorizeRoles("SUPERADMIN"),
  getApprovedReportsForSuperAdmin
);

router.get(
  "/job/:jobId",
  verifyToken,
  getReportByJobId
);

router.get(
  "/:id",
  verifyToken,
  getSingleReport
);
router.put(
  "/edit/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERADMIN"),
  upload.array("photos"), // 🔥 SAME multer as submit
  updateReport
);
router.get(
  "/:id/versions",
  verifyToken,
  authorizeRoles("SUPERADMIN"), // 🔒 only superadmin can see history
  getReportVersions
);
router.put(
  "/:id/toggle-edit",
  verifyToken,
  authorizeRoles("SUPERADMIN"),
  toggleEditable
);
module.exports = router;
