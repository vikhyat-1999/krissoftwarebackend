// routes/locationRoutes.js

const express = require("express");
const router = express.Router();

const {
  createLocation,
  getLocations,deleteLocation,updateLocation
} = require("../controllers/locationController");

const { verifyToken,authorizeRoles } = require("../middleware/authMiddleware");

// Only ADMIN + SUPERADMIN can add
router.post("/", verifyToken,authorizeRoles("ADMIN", "SUPERADMIN"), createLocation);

// Everyone (or logged-in users) can fetch
router.get("/",verifyToken, authorizeRoles("ADMIN", "SUPERADMIN"), getLocations);
router.delete("/:id",verifyToken,authorizeRoles("ADMIN","SUPERADMIN"), deleteLocation);
router.put(
  "/update/:id",
  verifyToken,
  authorizeRoles("ADMIN", "SUPERADMIN"),
  updateLocation
);
module.exports = router;
