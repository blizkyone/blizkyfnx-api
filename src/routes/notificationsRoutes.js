import express from 'express'
const router = express.Router()
import {
   getNotifications,
   ifPendingNotifications,
   markNotificationsAsSeen,
} from '../controllers/notificationsControllers.js'
import { protect } from '../middleware/authMiddleware.js'

router.route('/').get(protect, getNotifications)
router
   .route('/pending')
   .get(protect, ifPendingNotifications)
   .post(protect, markNotificationsAsSeen)

export default router
