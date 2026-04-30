const Notification = require("../models/Notfication");
exports.getMyNotifications = async (req, res) => {
  try {

    const notifications = await Notification.find({
      user: req.user.id
    })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    res.json({
      notifications,
      unreadCount
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.markAllNotificationsRead = async (req, res) => {
  try {

    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All marked as read" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.markOneRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true }
    );

    res.json({ message: "Marked as read" });

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};
