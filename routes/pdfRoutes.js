const express = require("express");
const router = express.Router();
const {downloadReportPDF } = require("../controllers/pdfController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
router.get("/reports/:id/pdf",verifyToken,authorizeRoles("ADMIN","SUPERADMIN"),downloadReportPDF);

module.exports = router;