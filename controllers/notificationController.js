const Notification = require("../models/Notfication");
exports.getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({
    user: req.user.id
  }).sort({ createdAt: -1 });

  res.json({ notifications });
};