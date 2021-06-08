import asyncHandler from 'express-async-handler'
import Notification from '../models/notificationModel.js'

// @desc    get list of notifications
// @route   GET /api/notifications/
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
   let notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('about_user', 'name familyName')
   res.send(notifications)
})

// @desc    get if pending notifications
// @route   GET /api/notifications/pending
// @access  Private
const ifPendingNotifications = asyncHandler(async (req, res) => {
   let ifPending = await Notification.exists({
      user: req.user._id,
      seen: false,
   })
   res.send(ifPending)
})

// @desc    mark all pending notifications as seen
// @route   POST /api/notifications/pending
// @access  Private
const markNotificationsAsSeen = asyncHandler(async (req, res) => {
   await Notification.updateMany(
      { user: req.user._id, seen: false },
      { seen: true }
   )
   res.send(true)
})

export { getNotifications, ifPendingNotifications, markNotificationsAsSeen }
