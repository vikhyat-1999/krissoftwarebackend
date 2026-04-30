const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { getMyNotifications,markAllNotificationsRead,markOneRead } = require("../controllers/notificationController")

router.get("/notifications", verifyToken, getMyNotifications);

router.put("/notifications/read-all", verifyToken, markAllNotificationsRead);
router.put(
  "/notifications/:id/read",
  verifyToken,
  markOneRead
);

module.exports = router;
