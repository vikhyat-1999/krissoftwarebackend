const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { getMyNotifications } = require("../controllers/notificationController")

router.get(
  "/my-notifications",
  verifyToken,
  getMyNotifications
);

module.exports = router;