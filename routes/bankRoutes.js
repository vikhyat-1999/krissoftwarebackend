// routes/bankRoutes.js

const express = require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const router = express.Router();

const {
  createBank,
  getBanks
} = require("../controllers/bankController");

router.post("/", verifyToken,authorizeRoles("ADMIN", "SUPERADMIN"), createBank);   // add bank
router.get("/", verifyToken,authorizeRoles("ADMIN", "SUPERADMIN"),getBanks);      // fetch banks

module.exports = router;