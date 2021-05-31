import express from 'express'
const router = express.Router()
import {
   userLogin,
   userLogout,
   validateUsername,
   registerUser,
   getMyProfile,
   connectToUser,
} from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'

router.route('/').post(registerUser).get(protect, getMyProfile)
router.route('/login').post(userLogin)
router.route('/logout').get(protect, userLogout)
router.route('/validateUsername').get(validateUsername)
router.route('/:id/connect').post(protect, connectToUser)

export default router
