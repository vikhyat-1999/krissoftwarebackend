const express = require("express");
const router = express.Router();
const { submitReport,getSubmittedReports,adminAction,getSingleReport,getApprovedReportsForSuperAdmin,getReportByJobId} = require("../controllers/reportController");
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
module.exports = router;
