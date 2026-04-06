// routes/bankRoutes.js

const express = require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const router = express.Router();

const {
  createBank,
  getBanks,updateBank
} = require("../controllers/bankController");

router.post("/", verifyToken,authorizeRoles("ADMIN", "SUPERADMIN"), createBank);   // add bank
router.get("/", verifyToken,authorizeRoles("ADMIN", "SUPERADMIN","ENGINEER"),getBanks);      // fetch banks
router.put(
  "/update/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERADMIN"),
  updateBank
);
module.exports = router;
