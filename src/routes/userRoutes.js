import express from 'express'
const router = express.Router()
import {
   userLogin,
   userLogout,
   validateUsername,
   registerUser,
   getMyProfile,
} from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'

router.route('/').post(registerUser).get(protect, getMyProfile)
router.route('/login').post(userLogin)
router.route('/logout').get(userLogout)
router.route('/validateUsername').get(validateUsername)

export default router
